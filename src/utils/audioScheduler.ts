// src/utils/audioScheduler.ts — Pre-scheduled gapless audio playback (NAR-2)
//
// Replaces the callback-driven audioQueue with Web Audio pre-scheduling.
// Chunks are scheduled at precise future times via source.start(nextStartTime),
// eliminating the 5-20ms gap from the onended→consumeNext handover.
// Crossfade at chunk boundaries prevents splice artifacts.

import { KOKORO_SAMPLE_RATE, TTS_CROSSFADE_MS, NARRATION_CURSOR_LAG_MS, TTS_TRUSTED_CURSOR_LAG_MS } from "../constants";
import { applyKokoroTempoStretch } from "./audio/tempoStretch";
import type { KokoroRatePlan } from "./kokoroRatePlan";
import type { KokoroPlaybackSegmentMetadata } from "../types/narration";
import type { TtsProviderTimingTruth } from "../types/ttsProvider";
import { createTimingMetadataRecord, type TimingMetadataRecord } from "./timingMetadataStore";
import { isPunctuationOnlyWord } from "./spokenWordFilter";
import { logDualSourceTransition } from "./dualSourceDiag";

// NARR-FIX-3: getOutputTimestamp() was tried (NARR-FIX-2) but reports only
// ~57ms on Windows. The real Electron/WASAPI pipeline latency is ~350ms.
// Reverted to constant-lag approach with TTS_TRUSTED_CURSOR_LAG_MS = 350.

// ── Telemetry (TTS-6F) ─────────────────────────────────────────────────────

/** Per-chunk timing diagnostics — dev/test only, not emitted in production */
export interface ChunkTimingTelemetry {
  chunkStartIdx: number;
  wordCount: number;
  durationMs: number;
  /** Scheduled start time relative to AudioContext epoch */
  scheduledAtSec: number;
  /** Per-word timing weights (normalized, sum to 1.0) */
  wordWeights: number[];
}

/** Accumulated telemetry for the current session — read by tests via getTimingTelemetry() */
let _telemetry: ChunkTimingTelemetry[] = [];

/** Get accumulated telemetry (tests/dev only) */
export function getTimingTelemetry(): ChunkTimingTelemetry[] { return _telemetry; }
/** Clear accumulated telemetry */
export function clearTimingTelemetry(): void { _telemetry = []; }

// ── Word Timing Heuristic (TTS-6F) ─────────────────────────────────────────

/** Punctuation that typically adds a trailing micro-pause in TTS prosody */
const SENTENCE_END_RE = /[.!?]$/;
const CLAUSE_END_RE = /[,;:)]$/;

/** TTS-7N (BUG-136): Configurable punctuation weight factors.
 * When pauseConfig is provided, scale punctuation weights relative to defaults.
 * Higher sentence pause → larger sentence weight → cursor dwells longer on sentence endings. */
export interface WordWeightConfig {
  sentenceWeightFactor?: number; // default 1.12
  clauseWeightFactor?: number;   // default 1.05
}

/**
 * Compute per-word timing weights based on token length and punctuation.
 * Longer words and words ending with punctuation get proportionally more time.
 * Returns normalized weights that sum to 1.0.
 *
 * TTS-7N: When weightConfig is provided, punctuation weights scale with user
 * pause settings so cursor dwell time matches Kokoro's natural prosody.
 */
export function computeWordWeights(words: string[], weightConfig?: WordWeightConfig): number[] {
  if (words.length === 0) return [];
  if (words.length === 1) return [1.0];

  const sentenceFactor = weightConfig?.sentenceWeightFactor ?? 1.12;
  const clauseFactor = weightConfig?.clauseWeightFactor ?? 1.05;

  const raw: number[] = [];
  for (const word of words) {
    // Base weight: proportional to character count (clamped 2–20)
    let w = Math.min(20, Math.max(2, word.length));
    if (SENTENCE_END_RE.test(word)) w *= sentenceFactor;
    else if (CLAUSE_END_RE.test(word)) w *= clauseFactor;
    raw.push(w);
  }

  // Normalize so weights sum to 1.0
  const total = raw.reduce((a, b) => a + b, 0);
  return raw.map(w => w / total);
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface ScheduledChunk {
  audio: Float32Array;
  sampleRate: number;
  durationMs: number;
  words: string[];
  startIdx: number;
  /** Optional Kokoro rate metadata for pre-playback tempo shaping. */
  kokoroRatePlan?: {
    selectedSpeed: number;
    generationBucket: number;
    tempoFactor: number;
  };
  /** TTS-7N: Optional pause-derived weight config for cursor timing */
  weightConfig?: WordWeightConfig;
  /** TTS-7O: Boundary classification at chunk end (for silence injection) */
  boundaryType?: "comma" | "clause" | "sentence" | "paragraph" | "none";
  /** TTS-7O: Duration of injected silence at chunk end (ms) */
  silenceMs?: number;
  /** NARR-TIMING: Real word timestamps from Kokoro duration tensor (null = use heuristic).
   *  startTime/endTime in seconds from chunk audio start. endTime = end of voiced portion
   *  (excludes trailing inter-word pause). Gap between word[i].endTime and word[i+1].startTime
   *  is silence. startTime drives word boundary scheduling and endTime powers silence-aware
   *  cursor hold decisions in AudioProgressReport. */
  wordTimestamps?: { word: string; startTime: number; endTime: number }[] | null;
  /** Optional provider-native word index (normalized/token space) for each resolved chunk word. */
  sourceWordIndexes?: number[] | null;
  /** Stable timing metadata identity for sync policy and diagnostics. */
  chunkId?: string;
  /** Optional parent/segment identity for segmented or cached timing lookups. */
  segmentId?: string | null;
  /** Provider-declared timing truth for this scheduled audio. */
  timingTruth?: TtsProviderTimingTruth;
}

type KokoroTempoAwareChunk = ScheduledChunk & Partial<KokoroPlaybackSegmentMetadata>;

type ActiveSource = {
  source: AudioBufferSourceNode;
  startTime: number;
  endTime: number;
  boundaryTime: number;
  startNotified: boolean;
  boundaryFired: boolean;
  originalChunk: KokoroTempoAwareChunk;
  chunk: KokoroTempoAwareChunk;
  boundaries: SchedulerWordBoundary[];
};

export interface ChunkBoundaryPayload {
  parentChunkStartIdx: number;
  parentChunkWordCount: number;
  segmentIndex: number;
  isFinalSegment: boolean;
  lastConfirmedWordIndex: number;
  endIdx: number;
}

export interface SchedulerCallbacks {
  onWordAdvance: (
    wordIndex: number,
    isTrustedWordTiming?: boolean,
    boundaryEvent?: SchedulerWordBoundaryEvent,
  ) => void;
  onChunkBoundary: (endIdx: number, metadata?: ChunkBoundaryPayload) => void;
  onEnd: () => void;
  onError: () => void;
  onSegmentStart?: (wordIndex: number) => void;
  /** Word-boundary truth-sync — fires on every resolved boundary and chunk boundary handoff. */
  onTruthSync?: (
    wordIndex: number,
    isTrustedWordTiming?: boolean,
    boundaryEvent?: SchedulerWordBoundaryEvent,
  ) => void;
  /** TTS-7Q: Chunk handoff carry-over — fires at chunk boundary with the last
   *  audio-confirmed word so the visual band can continue from that position. */
  onChunkHandoff?: (
    lastConfirmedWordIndex: number,
    isTrustedWordTiming?: boolean,
    boundaryEvent?: SchedulerWordBoundaryEvent,
  ) => void;
  /** TTS-SYNC-1: Emits explicit timing metadata when a chunk enters the scheduler. */
  onTimingMetadata?: (metadata: TimingMetadataRecord) => void;
}

interface SchedulerWordBoundary {
  time: number;
  wordIndex: number;
  startTime: number;
  endTime: number | null;
  isTrustedWordTiming: boolean;
  sourceWordIndex: number | null;
  alignmentCorrected: boolean;
  timingTruth: TtsProviderTimingTruth;
}

export interface SchedulerWordBoundaryEvent {
  sourceWordIndex: number | null;
  resolvedWordIndex: number;
  alignmentCorrected: boolean;
  timingTruth: TtsProviderTimingTruth;
}

/** TTS-7Q: Continuous audio-progress report — fractional position within the current word span. */
export interface AudioProgressReport {
  /** The word index that audio has most recently reached (scheduler-authoritative). */
  wordIndex: number;
  /** Fractional progress within the interval [wordIndex, wordIndex+1) based on audio clock.
   *  0.0 = just started the word, 1.0 = reached the next word.
   *  Used by the visual overlay to interpolate between word positions. */
  fraction: number;
  /** AudioContext.currentTime at the time of this report. Monotonic, audio-clock-only. */
  audioTime: number;
  /** Absolute audio-clock timestamp for the current word's voiced end, if known. */
  currentWordEndTime?: number | null;
  /** Absolute audio-clock timestamp for the next word's start boundary, if known. */
  nextWordStartTime?: number | null;
  /** Duration of the current inter-word silence gap in milliseconds, if known. */
  silenceGapMs?: number | null;
  /** True when audio time is currently inside a real inter-word silence gap. */
  isInSilenceGap?: boolean;
}

export interface AudioScheduler {
  /** Warm up the AudioContext (call on book open, before play) */
  warmUp: () => void;
  /** Schedule a chunk for playback. Chunks are queued and play in order. */
  scheduleChunk: (chunk: ScheduledChunk) => void;
  /** Start playback (resumes AudioContext if suspended) */
  play: () => void;
  /** Pause (suspends AudioContext — all scheduled sources freeze) */
  pause: () => void;
  /** Resume from pause */
  resume: () => void;
  /** Re-time buffered Kokoro chunks that have been scheduled but have not started yet. */
  refreshBufferedTempo: (kokoroRatePlan: KokoroRatePlan) => void;
  /** Stop all playback, clear scheduled sources */
  stop: () => void;
  /** Get current playback state */
  isPlaying: () => boolean;
  /** Set callbacks for word advance, chunk boundary, end, error */
  setCallbacks: (cbs: SchedulerCallbacks) => void;
  /** Signal that the generation pipeline has produced all chunks */
  markPipelineDone: () => void;
  /** Get the AudioContext (for time-based calculations) */
  getContext: () => AudioContext | null;
  /**
   * TTS-7Q: Get continuous audio progress — fractional position within the current word span.
   * Returns null if not playing or no boundaries are scheduled.
   * Callers should poll this in a RAF loop to drive smooth visual interpolation.
   * IMPORTANT: The returned wordIndex is the canonical audio cursor — not the visual band.
   */
  getAudioProgress: () => AudioProgressReport | null;
  /**
   * NARRATE-DUAL-SOURCE-DIAG-1 (Wave B): Oracle — returns the max word index of the
   * currently-playing audio source (i.e., the highest word that has been *heard*).
   * Wraps getPlayingSourceMaxWordIndex(audioCtx.currentTime).
   * Returns null when no source is active or no boundaries are known.
   *
   * DIAGNOSTIC ONLY — no production consumers are wired in this sprint.
   * Remove in Wave C after the investigation is complete.
   */
  getHeardFloorWordIndex: () => number | null;
}

// ── Implementation ───────────────────────────────────────────────────────────

export function createAudioScheduler(): AudioScheduler {
  let audioCtx: AudioContext | null = null;
  let callbacks: SchedulerCallbacks | null = null;
  let stopped = true;
  let schedulerEpoch = 0;
  let pipelineDone = false;

  // Timeline tracking
  let nextStartTime = 0;
  const crossfadeSec = TTS_CROSSFADE_MS / 1000;
  const crossfadeSamples = Math.round((TTS_CROSSFADE_MS / 1000) * KOKORO_SAMPLE_RATE);

  // Active sources for speed changes, boundary callbacks, and cleanup
  let activeSources: ActiveSource[] = [];

  // Word timer state
  let wordTimerHandle: ReturnType<typeof setTimeout> | null = null;
  let wordRafHandle: number | null = null;
  let currentWordBoundaries: SchedulerWordBoundary[] = [];
  let nextWordBoundaryIdx = 0;
  let playbackStartTime: number | null = null; // Set on first scheduleChunk — gates tick()
  let _driftDiagCounter = 0; // DEV: throttle drift diagnostics
  let _driftSumMs = 0; // DEV: accumulate boundary-fire lateness for averaging
  let _driftSamples = 0; // DEV: count of boundary fires measured

  function getAudioContext(): AudioContext {
    if (!audioCtx) {
      audioCtx = new AudioContext({ sampleRate: KOKORO_SAMPLE_RATE });
    }
    return audioCtx;
  }

  function clearWordTimer(): void {
    if (wordTimerHandle) { clearTimeout(wordTimerHandle); wordTimerHandle = null; }
    if (wordRafHandle != null) { cancelAnimationFrame(wordRafHandle); wordRafHandle = null; }
  }

  function hasPendingBoundaryDelivery(): boolean {
    return activeSources.some(s => !s.boundaryFired);
  }

  function getParentBoundaryInfo(chunk: KokoroTempoAwareChunk): {
    shouldEmit: boolean;
    endIdx: number;
    lastConfirmedWordIdx: number;
    metadata?: ChunkBoundaryPayload;
  } {
    if (!hasKokoroPlaybackSegmentMetadata(chunk)) {
      const endIdx = chunk.startIdx + chunk.words.length;
      return {
        shouldEmit: true,
        endIdx,
        lastConfirmedWordIdx: endIdx - 1 >= chunk.startIdx ? endIdx - 1 : chunk.startIdx,
      };
    }

    const endIdx = chunk.parentChunkStartIdx + chunk.parentChunkWordCount;
    const lastConfirmedWordIndex = endIdx - 1 >= chunk.parentChunkStartIdx
      ? endIdx - 1
      : chunk.parentChunkStartIdx;
    const metadata: ChunkBoundaryPayload = {
      parentChunkStartIdx: chunk.parentChunkStartIdx,
      parentChunkWordCount: chunk.parentChunkWordCount,
      segmentIndex: chunk.segmentIndex,
      isFinalSegment: chunk.isFinalSegment,
      lastConfirmedWordIndex,
      endIdx,
    };
    return {
      shouldEmit: chunk.isFinalSegment,
      endIdx,
      lastConfirmedWordIdx: lastConfirmedWordIndex,
      metadata,
    };
  }

  function hasKokoroPlaybackSegmentMetadata(chunk: KokoroTempoAwareChunk): chunk is ScheduledChunk & KokoroPlaybackSegmentMetadata {
    return Number.isInteger(chunk.parentChunkStartIdx) &&
      Number.isInteger(chunk.parentChunkWordCount) &&
      Number.isInteger(chunk.segmentIndex) &&
      typeof chunk.isFinalSegment === "boolean";
  }

  function toBoundaryEvent(boundary: SchedulerWordBoundary | null | undefined, resolvedWordIndex: number): SchedulerWordBoundaryEvent | undefined {
    if (!boundary) return undefined;
    return {
      sourceWordIndex: boundary.sourceWordIndex,
      resolvedWordIndex,
      alignmentCorrected: boundary.alignmentCorrected,
      timingTruth: boundary.timingTruth,
    };
  }

  function deliverChunkBoundary(s: ActiveSource): void {
    if (s.boundaryFired) return;

    const lastBoundary = s.boundaries[s.boundaries.length - 1];
    const sourceBoundaryTrust = lastBoundary?.isTrustedWordTiming ?? false;
    const { shouldEmit, endIdx, lastConfirmedWordIdx, metadata } = getParentBoundaryInfo(s.chunk);
    s.boundaryFired = true;

    if (!callbacks || !shouldEmit) return;

    if (metadata) {
      callbacks.onChunkBoundary(endIdx, metadata);
    } else {
      callbacks.onChunkBoundary(endIdx);
    }
    const boundaryEvent = toBoundaryEvent(lastBoundary, lastConfirmedWordIdx);
    callbacks.onTruthSync?.(lastConfirmedWordIdx, sourceBoundaryTrust, boundaryEvent);
    callbacks.onChunkHandoff?.(lastConfirmedWordIdx, sourceBoundaryTrust, boundaryEvent);
  }

  /**
   * Apply crossfade to chunk audio.
   * Ramps up the first CROSSFADE_SAMPLES and ramps down the last CROSSFADE_SAMPLES.
   * Returns a new Float32Array (does not mutate input).
   */
  function applyCrossfade(pcm: Float32Array, fadeIn: boolean, fadeOut: boolean): Float32Array {
    if (crossfadeSamples <= 0 || pcm.length < crossfadeSamples * 2) return pcm;
    const result = new Float32Array(pcm);
    const denom = Math.max(1, crossfadeSamples - 1);

    if (fadeIn) {
      for (let i = 0; i < crossfadeSamples; i++) {
        // Equal-power ramp reduces perceptual "edge" clicks vs linear gain ramps.
        const gain = Math.sin((i / denom) * (Math.PI / 2));
        result[i] *= gain;
      }
    }
    if (fadeOut) {
      const start = result.length - crossfadeSamples;
      for (let i = 0; i < crossfadeSamples; i++) {
        const gain = Math.cos((i / denom) * (Math.PI / 2));
        result[start + i] *= gain;
      }
    }
    return result;
  }

  /**
   * NARR-TIMING: Validate real timestamps before accepting them.
   * Returns true if timestamps pass all checks; false triggers heuristic fallback.
   * Checks: length, finite/non-negative, endTime >= startTime, monotone startTimes,
   * word correspondence, scaled overshoot tolerance, zero-duration count.
   */
  function validateWordTimestamps(
    timestamps: { word: string; startTime: number; endTime: number }[],
    words: string[],
    chunkDurationSec: number,
  ): boolean {
    if (timestamps.length !== words.length) return false;

    for (let i = 0; i < timestamps.length; i++) {
      const ts = timestamps[i];
      if (!isFinite(ts.startTime) || !isFinite(ts.endTime)) return false;
      if (ts.startTime < 0 || ts.endTime < 0) return false;
      if (ts.endTime < ts.startTime) return false;
      if (i > 0 && ts.startTime < timestamps[i - 1].startTime) return false;
      if (ts.word !== words[i]) return false;
    }

    // Scaled overshoot tolerance: min(40ms, 5% of speech duration)
    const lastEnd = timestamps[timestamps.length - 1].endTime;
    const overshootToleranceSec = Math.min(0.040, chunkDurationSec * 0.05);
    if (lastEnd > chunkDurationSec + overshootToleranceSec) return false;

    // Too many zero-duration spoken words suggests bad alignment.
    // Punctuation-only display tokens may legitimately map to zero-width intervals.
    const spokenWordCount = words.filter((word) => !isPunctuationOnlyWord(word)).length;
    const zeroDurSpoken = timestamps.filter((timestamp, index) =>
      timestamp.endTime === timestamp.startTime && !isPunctuationOnlyWord(words[index])
    ).length;
    if (spokenWordCount > 0 && zeroDurSpoken > 2 && zeroDurSpoken > spokenWordCount * 0.2) return false;

    return true;
  }

  /**
   * Pre-compute word boundary times using punctuation-aware/token-length-aware weights (TTS-6F).
   * Words are distributed across the chunk duration proportionally to their timing weight.
   */
  function computeWordBoundaries(
    chunk: ScheduledChunk,
    chunkStartTime: number,
  ): SchedulerWordBoundary[] {
    const wordCount = chunk.words.length;
    if (wordCount <= 0) return [];

    // ── NARR-TIMING: Use real timestamps if available and valid ────────────
    if (chunk.wordTimestamps) {
      // Real timestamps describe the speech portion only.
      // If chunk has appended silence (silenceMs), validate against speech duration.
      const speechDurationSec = (chunk.durationMs - (chunk.silenceMs ?? 0)) / 1000;

      if (validateWordTimestamps(chunk.wordTimestamps, chunk.words, speechDurationSec)) {
        const boundaries: SchedulerWordBoundary[] = [];
        for (let i = 0; i < wordCount; i++) {
          const sourceWordIndexRaw = chunk.sourceWordIndexes?.[i];
          const sourceWordIndex = Number.isInteger(sourceWordIndexRaw) ? Number(sourceWordIndexRaw) : null;
          boundaries.push({
            time: chunkStartTime + chunk.wordTimestamps[i].startTime,
            wordIndex: chunk.startIdx + i,
            startTime: chunkStartTime + chunk.wordTimestamps[i].startTime,
            endTime: chunkStartTime + chunk.wordTimestamps[i].endTime,
            isTrustedWordTiming: true,
            sourceWordIndex,
            alignmentCorrected: sourceWordIndex != null && sourceWordIndex !== i,
            timingTruth: chunk.timingTruth ?? "word-native",
          });
        }

        if (import.meta.env.DEV) {
          console.debug(
            `[audioScheduler] chunk@${chunk.startIdx} → WORD-NATIVE timing (${wordCount} words, ${chunk.durationMs.toFixed(0)}ms)`
          );
          _telemetry.push({
            chunkStartIdx: chunk.startIdx,
            wordCount,
            durationMs: chunk.durationMs,
            scheduledAtSec: chunkStartTime,
            wordWeights: null,
            realTimestamps: chunk.wordTimestamps,
            timestampSource: "kokoro-duration-tensor",
          } as any);
        }

        return boundaries;
      }

      // Validation failed — log and fall through to heuristic
      if (import.meta.env.DEV) {
        console.warn(
          `[audioScheduler] chunk@${chunk.startIdx} → HEURISTIC timing (validation failed, ${wordCount} words, ` +
          `timestamps=${chunk.wordTimestamps?.length ?? 0}, expected=${wordCount})`
        );
      }
    }

    // ── FALLBACK: Existing heuristic (unchanged) ──────────────────────────
    const chunkDurSec = (chunk.durationMs - (chunk.silenceMs ?? 0)) / 1000;
    const weights = computeWordWeights(chunk.words, chunk.weightConfig);
    const boundaries: SchedulerWordBoundary[] = [];
    let cumulativeWeight = 0;
    for (let i = 0; i < wordCount; i++) {
      boundaries.push({
        time: chunkStartTime + cumulativeWeight * chunkDurSec,
        wordIndex: chunk.startIdx + i,
        startTime: chunkStartTime + cumulativeWeight * chunkDurSec,
        endTime: null,
        isTrustedWordTiming: false,
        sourceWordIndex: null,
        alignmentCorrected: false,
        timingTruth: chunk.timingTruth ?? "segment-following",
      });
      cumulativeWeight += weights[i];
    }

    if (import.meta.env.DEV) {
      _telemetry.push({
        chunkStartIdx: chunk.startIdx,
        wordCount,
        durationMs: chunk.durationMs,
        scheduledAtSec: chunkStartTime,
        wordWeights: weights,
        timestampSource: "heuristic",
      } as any);
    }

    return boundaries;
  }

  /**
   * Self-correcting word timer — uses AudioContext.currentTime to determine
   * which word boundary we've crossed, then schedules the next tick.
   */
  // Step 3.5 / NARRATE-CURSOR-SYNC-4: Find the max word index of the source
  // currently being heard. Cursor advancement and getAudioProgress clamp to
  // this value so the cursor can never outrun the audio.
  function getPlayingSourceMaxWordIndex(now: number): number | null {
    let playingSource: ActiveSource | null = null;
    for (const s of activeSources) {
      if (s.startTime <= now) {
        playingSource = s;
      }
    }
    if (!playingSource || playingSource.boundaries.length === 0) return null;
    return playingSource.boundaries[playingSource.boundaries.length - 1].wordIndex;
  }

  function startWordTimer(): void {
    // NARR-FIX-4: Keep a single live timer loop. Restarting on every chunk
    // causes jitter/drift and "word timer started" spam under rapid chunking.
    if (wordRafHandle != null || wordTimerHandle != null) return;
    clearWordTimer();
    if (!callbacks || !audioCtx) return;
    if (currentWordBoundaries.length === 0 && !hasPendingBoundaryDelivery()) return;

    // BUG-151 fallback lag offset. Untrusted/heuristic timing stays lagged so the
    // visual cursor cannot outpace speech on non-word-native engines.
    const cursorLagSec = NARRATION_CURSOR_LAG_MS / 1000;
    // NARR-FIX-3: Constant lag for trusted word-native timing. Electron/WASAPI
    // pipeline adds buffering beyond what getOutputTimestamp() reports (~57ms vs
    // the real ~350ms), so we use the constant TTS_TRUSTED_CURSOR_LAG_MS.
    const trustedLagSec = TTS_TRUSTED_CURSOR_LAG_MS / 1000;
    if (import.meta.env.DEV) {
      console.debug(
        `[audioScheduler] word timer started — ` +
        `trustedLag=${(trustedLagSec * 1000).toFixed(0)}ms, heuristicLag=${NARRATION_CURSOR_LAG_MS}ms`
      );
      _driftDiagCounter = 0;
      _driftSumMs = 0;
      _driftSamples = 0;
    }

    function tick(): void {
      if (stopped || !callbacks || !audioCtx) return;
      const now = audioCtx.currentTime;

      // Don't process boundaries until audio has actually started playing
      if (playbackStartTime !== null && now < playbackStartTime) {
        wordRafHandle = requestAnimationFrame(tick);
        return;
      }

      flushStartedSegments(now);

      // BUG-151 fallback path: untrusted/heuristic timing stays lagged so the
      // visual cursor cannot outpace speech on non-word-native engines.
      const cursorNow = now - cursorLagSec;
      // NARR-FIX-3: Use constant lag for trusted timing. getOutputTimestamp()
      // reports only ~57ms on Windows but the full Electron/WASAPI pipeline
      // buffers significantly more. The constant TTS_TRUSTED_CURSOR_LAG_MS
      // (350ms) covers the full pipeline and prevents cursor-ahead drift.
      const trustedCursorNow = now - trustedLagSec;

      // Step 3.5: Clamp cursor to the currently-playing source so it
      // cannot outrun heard audio or skip ahead at chunk-load.
      const maxPlayingWord = getPlayingSourceMaxWordIndex(now);

      // Advance past ALL boundaries we've crossed in this tick.
      let advancedAny = false;
      while (nextWordBoundaryIdx < currentWordBoundaries.length) {
        const currentBoundary = currentWordBoundaries[nextWordBoundaryIdx];
        // Trusted timing uses output-latency-compensated clock; fallback uses
        // the larger fixed cursor lag.
        const boundaryComparatorTime = currentBoundary.isTrustedWordTiming ? trustedCursorNow : cursorNow;
        if (currentBoundary.time > boundaryComparatorTime) break;
        if (maxPlayingWord != null && currentBoundary.wordIndex > maxPlayingWord) break;

        // DEV: Drift diagnostic — how late is this boundary firing relative to
        // its scheduled time? Positive = boundary fired after scheduled (cursor
        // behind audio). Negative = boundary fired before (cursor ahead).
        if (import.meta.env.DEV) {
          const latenessMs = (boundaryComparatorTime - currentBoundary.time) * 1000;
          _driftSumMs += latenessMs;
          _driftSamples++;
          if (++_driftDiagCounter % 30 === 0) {
            const avgMs = _driftSamples > 0 ? _driftSumMs / _driftSamples : 0;
            console.debug(
              `[audioScheduler] boundary drift: lateness=${latenessMs.toFixed(1)}ms, ` +
              `avg=${avgMs.toFixed(1)}ms over ${_driftSamples} boundaries, ` +
              `word=${currentBoundary.wordIndex}, lagMs=${trustedLagSec * 1000}, ` +
              `currentTime=${now.toFixed(3)}, boundaryTime=${currentBoundary.time.toFixed(3)}`
            );
          }
        }

        const advancedWordIndex = currentBoundary.wordIndex;
        const boundaryEvent = toBoundaryEvent(currentBoundary, advancedWordIndex);
        callbacks.onWordAdvance(advancedWordIndex, currentBoundary.isTrustedWordTiming, boundaryEvent);
        callbacks.onTruthSync?.(advancedWordIndex, currentBoundary.isTrustedWordTiming, boundaryEvent);
        advancedAny = true;
        nextWordBoundaryIdx++;
      }
      if (advancedAny) {
        // Sliding window: prune consumed boundaries to prevent unbounded growth
        if (nextWordBoundaryIdx >= 100) {
          currentWordBoundaries = currentWordBoundaries.slice(nextWordBoundaryIdx);
          nextWordBoundaryIdx = 0;
        }
      }

      flushDueChunkBoundaries(now);

      // Keep polling on animation frames while boundaries remain. This is
      // smoother under renderer load than setTimeout-based wakeups and lets
      // AudioContext.currentTime remain the single source of truth.
      if (nextWordBoundaryIdx < currentWordBoundaries.length || hasPendingBoundaryDelivery()) {
        wordRafHandle = requestAnimationFrame(tick);
      }
    }

    wordRafHandle = requestAnimationFrame(tick);
  }

  /**
   * Clean up sources that have finished playing.
   */
  function pruneFinishedSources(): void {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    activeSources = activeSources.filter(s => s.endTime > now);
  }

  function flushStartedSegments(now: number): void {
    if (!callbacks) return;

    for (const scheduled of activeSources) {
      if (scheduled.startNotified || now < scheduled.startTime) continue;
      scheduled.startNotified = true;
      callbacks.onSegmentStart?.(scheduled.chunk.startIdx);
    }
  }

  /**
   * Fire chunk boundary / handoff callbacks once the effective post-stretch
   * transition point has been reached on the audio clock.
   */
  function flushDueChunkBoundaries(now: number): void {
    if (!callbacks || !audioCtx) return;

    for (const s of activeSources) {
      if (s.boundaryFired || now < s.boundaryTime) continue;
      deliverChunkBoundary(s);
    }
  }

  function stopSource(source: AudioBufferSourceNode): void {
    source.onended = null;
    try { source.disconnect(); } catch { /* already disconnected */ }
    try { source.stop(); } catch { /* already stopped */ }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  function warmUp(): void {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume().catch(() => { /* AudioContext resume may fail if already closing */ });
  }

  function scheduleChunk(chunk: ScheduledChunk): void {
    const ctx = getAudioContext();

    const isFirstChunk = activeSources.length === 0 && nextStartTime === 0;
    const originalChunk: KokoroTempoAwareChunk = {
      ...(chunk as KokoroTempoAwareChunk),
      audio: chunk.audio instanceof Float32Array ? chunk.audio : new Float32Array(chunk.audio),
    };
    const playbackChunk = applyTempoStretchIfNeeded({
      ...originalChunk,
    });

    // Apply crossfade (fade-in on all but first chunk, fade-out on all chunks)
    const processed = applyCrossfade(playbackChunk.audio, !isFirstChunk, true);

    // Create AudioBuffer
    const buffer = ctx.createBuffer(1, processed.length, playbackChunk.sampleRate);
    buffer.copyToChannel(new Float32Array(processed), 0);

    // Create source
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    // Determine start time
    if (isFirstChunk || nextStartTime <= ctx.currentTime) {
      nextStartTime = ctx.currentTime;
    }

    const chunkStartTime = nextStartTime;
    const chunkDurationSec = playbackChunk.durationMs / 1000;
    const boundaries = computeWordBoundaries(playbackChunk, chunkStartTime);
    const chunkEndIdx = playbackChunk.startIdx + playbackChunk.words.length;

    callbacks?.onTimingMetadata?.(createTimingMetadataRecord({
      chunkId: playbackChunk.chunkId ?? `words:${playbackChunk.startIdx}-${chunkEndIdx}`,
      segmentId: playbackChunk.segmentId ?? null,
      chunkStartIdx: playbackChunk.startIdx,
      chunkEndIdx,
      audioStartMs: chunkStartTime * 1000,
      durationMs: playbackChunk.durationMs,
      timingTruth: playbackChunk.timingTruth ?? (playbackChunk.wordTimestamps ? "word-native" : "segment-following"),
      wordTimestamps: playbackChunk.wordTimestamps ?? null,
    }));

    // Track when audio actually starts (gates word timer)
    if (playbackStartTime === null) {
      playbackStartTime = chunkStartTime;
    }

    // Schedule playback
    if (import.meta.env.DEV) {
      const drift = (ctx.currentTime - chunkStartTime) * 1000;
      console.debug(`[scheduler] scheduleChunk: drift=${drift.toFixed(1)}ms (ctx=${ctx.currentTime.toFixed(3)} start=${chunkStartTime.toFixed(3)})`);
    }
    source.start(chunkStartTime);

    const endTime = chunkStartTime + chunkDurationSec;
    const boundaryTime = Math.max(chunkStartTime, endTime - crossfadeSec);
    activeSources.push({
      source,
      startTime: chunkStartTime,
      endTime,
      boundaryTime,
      startNotified: false,
      boundaryFired: false,
      originalChunk,
      chunk: playbackChunk,
      boundaries,
    });

    // Update next start time to the effective post-stretch transition point.
    nextStartTime = boundaryTime;

    // Compute word boundaries and extend the timeline
    currentWordBoundaries.push(...boundaries);

    flushStartedSegments(ctx.currentTime);

    // If the transition point is already due, fire the boundary immediately.
    flushDueChunkBoundaries(ctx.currentTime);

    // If word timer isn't running, start it
    if (wordRafHandle == null && wordTimerHandle == null && !stopped) {
      startWordTimer();
    }

    // Set up onended for bookkeeping — capture epoch to detect stale callbacks
    const myEpoch = schedulerEpoch;
    source.onended = () => {
      if (myEpoch !== schedulerEpoch || stopped || !callbacks) return;
      const activeSource = activeSources.find(s => s.source === source);
      if (activeSource) {
        deliverChunkBoundary(activeSource);
      }
      pruneFinishedSources();

      // Check if this was the last source AND pipeline has finished generating
      if (activeSources.length === 0 && pipelineDone) {
        callbacks.onEnd();
      }
    };
  }

  function refreshBufferedTempo(kokoroRatePlan: KokoroRatePlan): void {
    if (!audioCtx || activeSources.length === 0) return;

    pruneFinishedSources();
    const now = audioCtx.currentTime;
    const consumedBoundaries = currentWordBoundaries.slice(0, nextWordBoundaryIdx);
    const consumedBoundaryKeys = new Set(consumedBoundaries.map((boundary) => `${boundary.time}:${boundary.wordIndex}`));

    const preservedSources = activeSources.filter((scheduled) => scheduled.startTime <= now);
    const futureSources = activeSources.filter((scheduled) => scheduled.startTime > now);
    if (futureSources.length === 0) return;

    for (const scheduled of futureSources) {
      stopSource(scheduled.source);
    }

    activeSources = preservedSources;
    currentWordBoundaries = [
      ...consumedBoundaries,
      ...preservedSources.flatMap((scheduled) =>
        scheduled.boundaries.filter((boundary) => !consumedBoundaryKeys.has(`${boundary.time}:${boundary.wordIndex}`)),
      ),
    ];
    nextWordBoundaryIdx = consumedBoundaries.length;
    nextStartTime = preservedSources.length > 0 ? preservedSources[preservedSources.length - 1].boundaryTime : 0;

    for (const scheduled of futureSources) {
      scheduleChunk({
        ...scheduled.originalChunk,
        kokoroRatePlan,
      });
    }
  }

  function applyTempoStretchIfNeeded(chunk: KokoroTempoAwareChunk): KokoroTempoAwareChunk {
    const stretched = applyKokoroTempoStretch({
      audio: chunk.audio,
      sampleRate: chunk.sampleRate,
      durationMs: chunk.durationMs,
      silenceMs: chunk.silenceMs,
      wordTimestamps: chunk.wordTimestamps,
      kokoroRatePlan: chunk.kokoroRatePlan as KokoroRatePlan | undefined,
    });

    if (!stretched.applied) return chunk;

    return {
      ...chunk,
      audio: stretched.audio,
      durationMs: stretched.durationMs,
      wordTimestamps: stretched.wordTimestamps,
    };
  }

  function play(): void {
    stopped = false;
    pipelineDone = false;
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume().catch(() => { /* AudioContext resume may fail if already closing */ });
    // Word timer is started by scheduleChunk() on first chunk arrival — not here.
    // Starting it here with no chunks causes a burst when boundaries arrive backdated.
  }

  function pause(): void {
    if (!audioCtx) return;
    clearWordTimer();
    audioCtx.suspend();
  }

  function resume(): void {
    if (!audioCtx) return;
    audioCtx.resume().then(() => {
      if (!stopped) {
        startWordTimer();
        // TTS-7O: Truth-sync on resume — re-snap cursor position
        if (callbacks?.onTruthSync && nextWordBoundaryIdx > 0 && currentWordBoundaries.length > 0) {
          const lastIdx = Math.min(nextWordBoundaryIdx - 1, currentWordBoundaries.length - 1);
          const lastBoundary = currentWordBoundaries[lastIdx];
          const boundaryEvent = toBoundaryEvent(lastBoundary, lastBoundary.wordIndex);
          if (lastIdx >= 0) callbacks.onTruthSync(
            currentWordBoundaries[lastIdx].wordIndex,
            currentWordBoundaries[lastIdx].isTrustedWordTiming,
            boundaryEvent,
          );
        }
      }
    });
  }

  function stop(): void {
    stopped = true;
    pipelineDone = false;
    schedulerEpoch++;
    clearWordTimer();

    // Null onended, disconnect, then stop all active sources
    for (const s of activeSources) {
      stopSource(s.source);
    }
    activeSources = [];
    currentWordBoundaries = [];
    nextWordBoundaryIdx = 0;
    nextStartTime = 0;
    playbackStartTime = null;
    callbacks = null;
  }

  function isPlaying(): boolean {
    return !stopped && audioCtx?.state === "running" && activeSources.length > 0;
  }

  function setCallbacks(cbs: SchedulerCallbacks): void {
    callbacks = cbs;
  }

  function markPipelineDone(): void {
    pipelineDone = true;
    // If all sources already finished, fire onEnd now
    pruneFinishedSources();
    if (activeSources.length === 0 && !stopped && callbacks) {
      callbacks.onEnd();
    }
  }

  function getContext(): AudioContext | null {
    return audioCtx;
  }

  /**
   * TTS-7Q: Compute continuous audio progress from AudioContext.currentTime.
   *
   * Looks up the current and next word boundaries in the pre-computed timeline to
   * produce a fractional position [0.0, 1.0) within the current word interval.
   * This gives callers a continuous progress rail without any new DOM work or state.
   *
   * Returns null when:
   * - Not playing / no AudioContext
   * - No word boundaries have been scheduled yet
   * - Audio hasn't started (before playbackStartTime)
   *
   * The returned wordIndex is the CANONICAL audio cursor (scheduler-authoritative).
   * Visual band code must never write this back to pause/resume/save anchors.
   */
  function getAudioProgress(): AudioProgressReport | null {
    if (stopped || !audioCtx || currentWordBoundaries.length === 0) return null;
    if (playbackStartTime !== null && audioCtx.currentTime < playbackStartTime) return null;

    const cursorLagSec = NARRATION_CURSOR_LAG_MS / 1000;
    const boundaries = currentWordBoundaries;
    const total = boundaries.length;
    if (total === 0) return null;

    // Find the most recently crossed boundary (the word audio is currently speaking).
    // nextWordBoundaryIdx tracks the NEXT boundary not yet fired; so the current word
    // is at index (nextWordBoundaryIdx - 1), clamped to [0, total-1].
    const currentIdx = Math.max(0, Math.min(nextWordBoundaryIdx - 1, total - 1));
    const current = boundaries[currentIdx];
    // NARR-FIX-3: Match boundary delivery — constant lag for both trusted and
    // heuristic timing. getOutputTimestamp() underreports Electron pipeline latency.
    const lagSec = current.isTrustedWordTiming
      ? TTS_TRUSTED_CURSOR_LAG_MS / 1000
      : cursorLagSec;
    const now = Math.max(0, audioCtx.currentTime - lagSec);
    if (now < boundaries[0].time) return null;

    // Compute fraction from current boundary start to next boundary start.
    const nextBoundary = currentIdx + 1 < total ? boundaries[currentIdx + 1] : null;
    let fraction = 0;
    if (nextBoundary) {
      const intervalSec = nextBoundary.time - current.time;
      if (intervalSec > 0) {
        fraction = Math.min(1, Math.max(0, (now - current.time) / intervalSec));
      }
    } else {
      // Last boundary — hold at 0 (no next word to interpolate toward)
      fraction = 0;
    }

    const currentWordEndTime = current.endTime ?? null;
    const nextWordStartTime = currentWordEndTime != null
      ? (nextBoundary?.startTime ?? null)
      : null;
    let silenceGapMs: number | null = null;
    let isInSilenceGap = false;
    if (
      currentWordEndTime != null &&
      nextWordStartTime != null &&
      nextWordStartTime >= currentWordEndTime
    ) {
      silenceGapMs = (nextWordStartTime - currentWordEndTime) * 1000;
      isInSilenceGap = now >= currentWordEndTime && now < nextWordStartTime;
    }

    // Step 3.5: Belt-and-suspenders clamp — even if tick() hasn't run yet
    // this frame, never report a wordIndex past the currently-playing source.
    const maxPlayingWord = getPlayingSourceMaxWordIndex(audioCtx.currentTime);
    const clamped = maxPlayingWord != null && current.wordIndex > maxPlayingWord;

    return {
      wordIndex: clamped ? maxPlayingWord : current.wordIndex,
      fraction: clamped ? 0 : fraction,
      audioTime: now,
      currentWordEndTime: clamped ? null : currentWordEndTime,
      nextWordStartTime: clamped ? null : nextWordStartTime,
      silenceGapMs: clamped ? null : silenceGapMs,
      isInSilenceGap: clamped ? false : isInSilenceGap,
    };
  }

  /**
   * NARRATE-DUAL-SOURCE-DIAG-1 (Wave B): Oracle wrapper.
   * Returns the max word index of the currently-playing audio source
   * (the "heard floor" — the last word that has been confirmed playing).
   * Wraps the closure-private getPlayingSourceMaxWordIndex() so the
   * narration hook can call it for diagnostic logging without touching
   * any production decision path.
   *
   * DIAGNOSTIC ONLY — no production consumers are wired in this sprint.
   */
  function getHeardFloorWordIndex(): number | null {
    if (!audioCtx) return null;
    const result = getPlayingSourceMaxWordIndex(audioCtx.currentTime);
    logDualSourceTransition("getPlayingSourceMaxWordIndex:query", () => ({
      playingSourceMax: result,
      heardFloor: result,
    }));
    return result;
  }

  return {
    warmUp,
    scheduleChunk,
    play,
    pause,
    resume,
    refreshBufferedTempo,
    stop,
    isPlaying,
    setCallbacks,
    markPipelineDone,
    getContext,
    getAudioProgress,
    getHeardFloorWordIndex,
  };
}
