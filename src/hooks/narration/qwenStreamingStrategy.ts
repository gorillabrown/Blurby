// src/hooks/narration/qwenStreamingStrategy.ts — Streaming Qwen TTS strategy (QWEN-STREAM-2)
//
// Drives streaming Qwen narration: starts a PCM stream via the IPC bridge,
// feeds incoming frames through StreamAccumulator, and routes emitted
// ScheduledChunk objects into audioScheduler for gapless playback.
//
// Pattern: closely follows kokoroStrategy / qwenStrategy structure.

import type { TtsStrategy } from "../../types/narration";
import { createAudioScheduler } from "../../utils/audioScheduler";
import type { AudioScheduler, AudioProgressReport, WordWeightConfig } from "../../utils/audioScheduler";
import { createStreamAccumulator } from "../../utils/streamAccumulator";
import type { StreamAccumulator } from "../../utils/streamAccumulator";
import type { PauseConfig } from "../../utils/pauseDetection";
import type { PronunciationOverride } from "../../types";
import { QWEN_DEFAULT_SPEAKER, TTS_STREAM_SAMPLE_RATE } from "../../constants";

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

    // Use async IIFE so speakChunk satisfies the synchronous TtsStrategy contract
    // while still awaiting the IPC call.
    void (async () => {
      const speaker = deps.getSpeaker() || QWEN_DEFAULT_SPEAKER;
      const rate = deps.getSpeed();
      const result = await api.qwenStreamStart(text, speaker, rate);

      if (!result.ok || !result.streamId) {
        deps.onError();
        onError();
        return;
      }

      activeStreamId = result.streamId;

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
          // Accumulator flushed — inform scheduler so it fires onEnd when audio drains
          scheduler.markPipelineDone();
        },
      });

      activeAccumulator = acc;

      // Capture streamId in closure so the listener can guard stale frames
      const capturedStreamId = activeStreamId;

      // Subscribe to incoming PCM frames from the sidecar.
      // Note: the preload bridge strips the IPC event before calling our callback, so at
      // runtime our function receives (streamId, chunk). The ElectronAPI type in types.ts
      // declares the raw three-arg form; we cast to satisfy TypeScript while using the
      // actual two-arg calling convention that the preload delivers.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      unsubAudio = (api.onQwenStreamAudio as any)((sid: string, chunk: unknown) => {
        if (sid !== capturedStreamId) return;

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

      // Resume AudioContext — word timer is deferred until first scheduleChunk
      scheduler.play();
    })();
  }

  // ── TtsStrategy.stop ──────────────────────────────────────────────────────

  function stop(): void {
    // Cancel the sidecar stream before destroying the accumulator
    if (activeStreamId) {
      api?.qwenStreamCancel?.(activeStreamId);
      activeStreamId = undefined;
    }

    // Discard buffered audio without emitting any further segments
    activeAccumulator?.destroy();
    activeAccumulator = undefined;

    // Unsubscribe PCM listener
    unsubAudio?.();
    unsubAudio = undefined;

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
