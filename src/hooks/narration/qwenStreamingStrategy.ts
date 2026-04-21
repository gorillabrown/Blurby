// src/hooks/narration/qwenStreamingStrategy.ts — Streaming Qwen TTS strategy (QWEN-STREAM-2)
//
// Drives streaming Qwen narration: starts a PCM stream via the IPC bridge,
// feeds incoming frames through StreamAccumulator, and routes emitted
// ScheduledChunk objects into audioScheduler for gapless playback.
//
// Pattern: closely follows kokoroStrategy / qwenStrategy structure.
//
// QWEN-STREAM-3 hardening features:
//   Feature 1 — Stall detection (stallTimerRef): fires onError if no PCM frames for TTS_STREAM_STALL_TIMEOUT_MS
//   Feature 2 — Sidecar crash recovery (crashPollRef): polls qwenStreamStatus() every 2s for subprocess exit
//   Feature 3 — Warmup-before-speak gate: logs warmup duration to first frame
//   Feature 4 — Cancellation edge cases: rapid-start guard, cancel-during-warmup sentinel, explicit no-op stop

import type { TtsStrategy } from "../../types/narration";
import { createAudioScheduler } from "../../utils/audioScheduler";
import type { AudioScheduler, AudioProgressReport, WordWeightConfig } from "../../utils/audioScheduler";
import { createStreamAccumulator } from "../../utils/streamAccumulator";
import type { StreamAccumulator } from "../../utils/streamAccumulator";
import type { PauseConfig } from "../../utils/pauseDetection";
import type { PronunciationOverride } from "../../types";
import { QWEN_DEFAULT_SPEAKER, TTS_STREAM_SAMPLE_RATE, TTS_STREAM_STALL_TIMEOUT_MS } from "../../constants";

const api = window.electronAPI;

// ── Deps ─────────────────────────────────────────────────────────────────────

export interface QwenStreamingStrategyDeps {
  /** Get the active speaker/voice name */
  getSpeaker: () => string;
  /** Get current playback rate (1.0 = normal speed) */
  getSpeed: () => number;
  /** Get all words for the current narration session */
  getWords: () => string[];
  /** Get the active book ID (reserved for future per-book caching) */
  getBookId?: () => string;
  /** Get pronunciation overrides for text normalization */
  getPronunciationOverrides?: () => PronunciationOverride[];
  /** Get word-weight config derived from pause settings */
  getWeightConfig?: () => WordWeightConfig | undefined;
  /** Get current pause config for silence injection */
  getPauseConfig?: () => PauseConfig | undefined;
  /** Get paragraph break word indices (global) */
  getParagraphBreaks?: () => Set<number>;
  /** Called when a scheduler segment actually starts playing on the audio clock */
  onSegmentStart?: (wordIndex: number) => void;
  /**
   * Visual-only truth-sync callback. Called periodically by the scheduler to
   * re-snap the visual overlay to the authoritative audio position.
   * Must NOT update narration state (cursorWordIndex, lastConfirmedAudioWordRef).
   * Falls back to onWordAdvance (from speakChunk) when not provided.
   */
  onTruthSync?: (wordIndex: number) => void;
  /** Called on unrecoverable stream errors */
  onError: () => void;
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function createQwenStreamingStrategy(deps: QwenStreamingStrategyDeps): TtsStrategy & {
  getScheduler: () => AudioScheduler;
  getAudioProgress: () => AudioProgressReport | null;
} {
  const scheduler = createAudioScheduler();

  // Active stream tracking — guards all cleanup operations
  let activeStreamId: string | undefined;
  let activeAccumulator: StreamAccumulator | undefined;
  let unsubAudio: (() => void) | undefined;
  // QWEN-STREAM-3 BLOCKER-1: Unsubscribe handle for the onQwenStreamFinished
  // subscription. Must be cleared in every teardown path so we don't leak
  // listeners or receive stale stream-end notifications for a prior stream.
  let unsubFinished: (() => void) | undefined;

  // Feature 1: Stall detection timer ref
  let stallTimerRef: ReturnType<typeof setTimeout> | null = null;

  // Feature 2: Sidecar crash recovery poll ref
  let crashPollRef: ReturnType<typeof setInterval> | null = null;

  // Feature 4b: Cancellation-during-warmup sentinel — shared across speakChunk/stop so
  // stop() can signal the async IIFE to abort after qwenStreamStart returns (LL-109 guard).
  let stopped = false;

  // ── Internal helpers ──────────────────────────────────────────────────────

  function clearStallTimer(): void {
    if (stallTimerRef !== null) {
      clearTimeout(stallTimerRef);
      stallTimerRef = null;
    }
  }

  function clearCrashPoll(): void {
    if (crashPollRef !== null) {
      clearInterval(crashPollRef);
      crashPollRef = null;
    }
  }

  /** Fully tears down an active stream without triggering any callbacks. */
  function teardownStream(): void {
    clearStallTimer();
    clearCrashPoll();

    if (activeStreamId) {
      api?.qwenStreamCancel?.(activeStreamId);
      activeStreamId = undefined;
    }

    activeAccumulator?.destroy();
    activeAccumulator = undefined;

    unsubAudio?.();
    unsubAudio = undefined;
    // QWEN-STREAM-3 BLOCKER-1: Mirror unsubAudio lifecycle so the stream-finished
    // listener never outlives the stream it was registered for.
    unsubFinished?.();
    unsubFinished = undefined;
  }

  // ── TtsStrategy.speakChunk ────────────────────────────────────────────────

  function speakChunk(
    text: string,
    _words: string[],
    startIdx: number,
    _speed: number,
    onWordAdvance: (wordOffset: number) => void,
    onEnd: () => void,
    onError: () => void,
  ): void {
    if (!api?.qwenStreamStart) {
      deps.onError();
      onError();
      return;
    }

    // Feature 4a: Rapid start/stop guard — cancel any in-flight stream before starting a new one.
    if (activeStreamId !== undefined) {
      teardownStream();
      scheduler.stop();
    }

    // Feature 4b: Reset the stopped sentinel for this new stream invocation.
    stopped = false;

    // Wire scheduler callbacks before starting the stream so segments are
    // scheduled immediately when the first PCM frames arrive.
    scheduler.setCallbacks({
      onWordAdvance,
      onChunkBoundary: () => {},
      onEnd,
      onError: () => {
        deps.onError();
        onError();
      },
      onSegmentStart: (wordIndex: number) => {
        deps.onSegmentStart?.(wordIndex);
      },
      onTruthSync: (wordIndex: number) => {
        if (deps.onTruthSync) {
          deps.onTruthSync(wordIndex);
        } else {
          onWordAdvance(wordIndex);
        }
      },
      onChunkHandoff: (lastConfirmedWordIndex: number) => {
        onWordAdvance(lastConfirmedWordIndex);
      },
    });

    // Feature 3: Warmup timing — record before qwenStreamStart to measure total warmup.
    const warmupStartMs = Date.now();
    let firstFrameReceivedMs: number | null = null;

    // Use async IIFE so speakChunk satisfies the synchronous TtsStrategy contract
    // while still awaiting the IPC call.
    void (async () => {
      // Feature 3: Check engine readiness before speaking (log warning if not warm).
      if (api.qwenStreamStatus) {
        const statusBeforeStart = await api.qwenStreamStatus();
        if (statusBeforeStart && !(statusBeforeStart as { ready?: boolean }).ready) {
          console.warn(
            "[QwenStreaming] Engine not yet warm before speakChunk — proceeding; engine will auto-warm on first command.",
          );
        }
      }

      const speaker = deps.getSpeaker() || QWEN_DEFAULT_SPEAKER;
      const rate = deps.getSpeed();
      const result = await api.qwenStreamStart(text, speaker, rate);

      // Feature 4b: If stop() was called while we were awaiting qwenStreamStart, abort here.
      if (stopped) {
        if (result.ok && result.streamId) {
          api?.qwenStreamCancel?.(result.streamId);
        }
        return;
      }

      if (!result.ok || !result.streamId) {
        deps.onError();
        onError();
        return;
      }

      activeStreamId = result.streamId;

      // Capture streamId in closure so the listener and crash poll can guard stale frames
      const capturedStreamId = activeStreamId;

      // Feature 2: Sidecar crash recovery — poll qwenStreamStatus() every 2s.
      if (api.qwenStreamStatus) {
        crashPollRef = setInterval(async () => {
          if (activeStreamId !== capturedStreamId) {
            // Stream already ended or superseded — stop polling
            clearCrashPoll();
            return;
          }
          try {
            const status = await api.qwenStreamStatus!();
            if (status && !(status as { ready?: boolean }).ready) {
              // Subprocess exited unexpectedly while stream was active
              clearCrashPoll();
              clearStallTimer();
              api?.qwenStreamCancel?.(capturedStreamId);
              if (activeStreamId === capturedStreamId) {
                activeStreamId = undefined;
              }
              activeAccumulator?.destroy();
              activeAccumulator = undefined;
              unsubAudio?.();
              unsubAudio = undefined;
              // QWEN-STREAM-3 BLOCKER-1: clear the stream-finished subscription alongside
              // the audio subscription so no stale listeners survive the crash path.
              unsubFinished?.();
              unsubFinished = undefined;
              scheduler.stop();
              deps.onError();
              onError();
            }
          } catch {
            // Poll failure is non-fatal — the stall timer will catch complete loss of frames
          }
        }, 2000);
      }

      // Feature 1: Set the initial stall timer before subscribing to frames.
      function resetStallTimer(): void {
        clearStallTimer();
        stallTimerRef = setTimeout(() => {
          if (activeStreamId !== capturedStreamId) return; // already cleaned up
          // QWEN-STREAM-3 BLOCKER-2: clear BOTH timer types before any side effects
          // so the crash poll interval cannot fire one more tick after a stall is
          // detected (it would otherwise leak until the streamId guard caught it).
          clearStallTimer();
          clearCrashPoll();
          api?.qwenStreamCancel?.(capturedStreamId);
          activeStreamId = undefined;
          activeAccumulator?.destroy();
          activeAccumulator = undefined;
          unsubAudio?.();
          unsubAudio = undefined;
          // QWEN-STREAM-3 BLOCKER-1: release the stream-finished subscription on stall
          // so we don't deliver a stale end-signal to a torn-down accumulator.
          unsubFinished?.();
          unsubFinished = undefined;
          scheduler.stop();
          deps.onError();
          onError();
        }, TTS_STREAM_STALL_TIMEOUT_MS);
      }
      resetStallTimer();

      // Build paragraph breaks array for the accumulator (Set → number[])
      const paragraphBreaksSet = deps.getParagraphBreaks?.() ?? new Set<number>();
      const paragraphBreaks = Array.from(paragraphBreaksSet);

      // Create accumulator — each emitted segment goes straight to the scheduler
      const acc = createStreamAccumulator({
        text: deps.getWords().slice(startIdx).join(" "),
        words: deps.getWords(),
        startIdx,
        sampleRate: TTS_STREAM_SAMPLE_RATE,
        getWeightConfig: () => deps.getWeightConfig?.(),
        getPauseConfig: () => deps.getPauseConfig?.(),
        getParagraphBreaks: () => paragraphBreaks,
        onSegmentReady: (chunk) => {
          scheduler.scheduleChunk(chunk);
        },
        onStreamEnd: () => {
          // Accumulator flushed — clear timers and inform scheduler so it fires onEnd when audio drains
          clearStallTimer();
          clearCrashPoll();
          scheduler.markPipelineDone();
        },
      });

      activeAccumulator = acc;

      // Subscribe to incoming PCM frames from the sidecar.
      // Note: the preload bridge strips the IPC event before calling our callback, so at
      // runtime our function receives (streamId, chunk). The ElectronAPI type in types.ts
      // declares the raw three-arg form; we cast to satisfy TypeScript while using the
      // actual two-arg calling convention that the preload delivers.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      unsubAudio = (api.onQwenStreamAudio as any)((sid: string, chunk: unknown) => {
        if (sid !== capturedStreamId) return;

        // Feature 1: Reset stall timer on every received frame.
        resetStallTimer();

        // Feature 3: Record first-frame timestamp and log warmup duration.
        if (firstFrameReceivedMs === null) {
          firstFrameReceivedMs = Date.now();
          const warmupDurationMs = firstFrameReceivedMs - warmupStartMs;
          console.log(`[QwenStreaming] First PCM frame received — warmup duration: ${warmupDurationMs}ms`);
        }

        // Convert incoming bytes to Float32Array.
        // IPC serialises typed arrays/Buffers as plain objects; normalise defensively.
        let float32: Float32Array;
        if (chunk instanceof Float32Array) {
          float32 = chunk;
        } else if (chunk instanceof ArrayBuffer) {
          float32 = new Float32Array(chunk);
        } else {
          // Node Buffer forwarded over IPC arrives as a Uint8Array (or Buffer-like object)
          // in the renderer. Slice to isolate the underlying ArrayBuffer region.
          const u8 = chunk as Uint8Array;
          const ab = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
          float32 = new Float32Array(ab);
        }

        acc.feed(float32);
      }) as () => void;

      // QWEN-STREAM-3 BLOCKER-1: Subscribe to the stream-finished notification so
      // we can flush the accumulator and let the scheduler fire onEnd once the
      // final buffered samples drain. Without this subscription, acc.flush() is
      // never called, scheduler.markPipelineDone() is never reached, and every
      // streaming narration session hangs at the end of the stream.
      if (api.onQwenStreamFinished) {
        unsubFinished = api.onQwenStreamFinished((finishedStreamId: string) => {
          if (finishedStreamId !== capturedStreamId) return;
          // flush() drains remaining samples as a final segment and then invokes
          // onStreamEnd, which clears timers and calls scheduler.markPipelineDone().
          activeAccumulator?.flush();
          unsubFinished?.();
          unsubFinished = undefined;
        });
      }

      // Resume AudioContext — word timer is deferred until first scheduleChunk
      scheduler.play();
    })();
  }

  // ── TtsStrategy.stop ──────────────────────────────────────────────────────

  function stop(): void {
    // Feature 4b: Signal the async IIFE to abort if stop() is called during the
    // qwenStreamStart await window (LL-109 listener leak guard).
    stopped = true;

    // Feature 4c: Explicit no-op if stream already ended (activeStreamId is already undefined).
    // The teardownStream() helper handles the null/undefined guard, but we surface the intent
    // explicitly here for clarity: if nothing is active, this is a guaranteed no-op.
    if (
      activeStreamId === undefined &&
      activeAccumulator === undefined &&
      !stallTimerRef &&
      !crashPollRef &&
      unsubFinished === undefined
    ) {
      scheduler.stop();
      return;
    }

    teardownStream();
    scheduler.stop();
  }

  // ── TtsStrategy.pause / resume ────────────────────────────────────────────

  function pause(): void {
    // Pause the scheduler (AudioContext clock freezes).
    // The sidecar stream continues producing frames; the accumulator keeps buffering.
    // Frames received during pause are held and fed to the scheduler on resume.
    scheduler.pause();
  }

  function resume(): void {
    scheduler.resume();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    speakChunk,
    stop,
    pause,
    resume,

    getScheduler(): AudioScheduler {
      return scheduler;
    },

    getAudioProgress(): AudioProgressReport | null {
      return scheduler.getAudioProgress();
    },
  };
}
