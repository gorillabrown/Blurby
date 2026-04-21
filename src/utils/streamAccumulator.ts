// src/utils/streamAccumulator.ts — PCM stream buffer + boundary-aware segment emitter
//
// Buffers Float32Array PCM frames from a streaming TTS sidecar and emits
// ScheduledChunk objects at sentence boundaries or when the max-word threshold
// is hit. Used by qwenStreamingStrategy to convert a streaming PCM pipe into
// the same ScheduledChunk contract consumed by audioScheduler.

import {
  TTS_STREAM_MIN_SEGMENT_WORDS,
  TTS_STREAM_MAX_SEGMENT_WORDS,
  TTS_STREAM_SAMPLE_RATE,
} from "../constants";
import { computeWordWeights } from "./audioScheduler";
import type { ScheduledChunk, WordWeightConfig } from "./audioScheduler";
import type { PauseConfig } from "./pauseDetection";

// ── Config & Contract ────────────────────────────────────────────────────────

export interface StreamAccumulatorConfig {
  /** Full text being narrated (used for context; words is the authoritative array) */
  text: string;
  /** Word array for the text — must align with startIdx */
  words: string[];
  /** Global word index where this accumulator's window begins */
  startIdx: number;
  /** PCM sample rate — must match sidecar output (typically 24000) */
  sampleRate: number;
  /** Returns current word-weight config (for computeWordWeights heuristic) */
  getWeightConfig: () => WordWeightConfig | undefined;
  /** Returns current pause config (reserved for future silence injection) */
  getPauseConfig: () => PauseConfig | undefined;
  /** Returns paragraph break word indices (global) */
  getParagraphBreaks: () => number[];
  /** Called with each complete segment as it becomes ready */
  onSegmentReady: (chunk: ScheduledChunk) => void;
  /** Called once when flush() completes (including any final segment) */
  onStreamEnd: () => void;
}

export interface StreamAccumulator {
  /** Append incoming PCM frames to the internal buffer */
  feed(chunk: Float32Array): void;
  /** Emit any remaining buffered audio as the final segment, then call onStreamEnd */
  flush(): void;
  /** Discard buffer without emitting — use when aborting a stream */
  destroy(): void;
  /** Estimated number of words whose audio has been buffered so far */
  getBufferedWordCount(): number;
}

// ── Boundary Detection ───────────────────────────────────────────────────────

/** Regex for words that end a sentence. `...` is matched by the `\.` branch. */
const SENTENCE_END_RE = /[.!?]$|\.{3}$/;

/**
 * Find the last sentence boundary at or before `endIdx` (exclusive) within the
 * slice words[startIdx..endIdx]. Returns the index of the boundary word, or -1
 * if none found.
 */
function findSentenceBoundary(words: string[], startIdx: number, endIdx: number): number {
  for (let i = endIdx - 1; i >= startIdx; i--) {
    if (SENTENCE_END_RE.test(words[i])) return i;
  }
  return -1;
}

// ── Audio Utilities ──────────────────────────────────────────────────────────

/** Concatenate two Float32Arrays into a new one */
function concatFloat32(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

/** Estimate how many words have been spoken given a total audio duration.
 *
 * Uses computeWordWeights to distribute time proportionally across words.
 * Returns a count of words (from startIdx) whose cumulative weight fits
 * within the elapsed fraction of the full expected duration.
 *
 * The "full expected duration" is estimated as: totalWords * avgMsPerWord,
 * where avgMsPerWord ≈ 60_000 / estimatedWPM. We use 150 WPM as the baseline
 * because the streaming sidecar generates at roughly native (1×) speed.
 */
const STREAMING_BASELINE_WPM = 150;

function estimateWordCount(
  words: string[],
  startIdx: number,
  elapsedMs: number,
  weightConfig: WordWeightConfig | undefined
): number {
  const windowWords = words.slice(startIdx);
  if (windowWords.length === 0) return 0;

  // Estimate total duration for the remaining window at baseline WPM
  const totalEstimatedMs = (windowWords.length / STREAMING_BASELINE_WPM) * 60_000;
  if (totalEstimatedMs <= 0) return 0;

  const weights = computeWordWeights(windowWords, weightConfig);
  // weights are normalized (sum = 1.0); cumulative weight up to elapsedFraction
  const elapsedFraction = Math.min(elapsedMs / totalEstimatedMs, 1.0);

  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (cumulative >= elapsedFraction) return i + 1;
  }
  return windowWords.length;
}

// ── Factory ──────────────────────────────────────────────────────────────────

export function createStreamAccumulator(config: StreamAccumulatorConfig): StreamAccumulator {
  const {
    words,
    sampleRate,
    onSegmentReady,
    onStreamEnd,
  } = config;

  let buffer = new Float32Array(0);
  let currentStartIdx = config.startIdx;
  let destroyed = false;

  /**
   * Compute how many words (from currentStartIdx) are estimated to have been
   * voiced by the audio currently in `buffer`.
   */
  function estimatedWordPos(): number {
    const durationMs = (buffer.length / sampleRate) * 1_000;
    return estimateWordCount(words, currentStartIdx, durationMs, config.getWeightConfig());
  }

  /**
   * Emit a segment covering words[currentStartIdx..boundaryWordIdx] (inclusive).
   *
   * The audio is split proportionally: the fraction of words up to the boundary
   * determines how many samples belong to this segment. Remaining samples stay
   * in buffer for the next segment.
   */
  function emitSegment(boundaryWordIdx: number): void {
    const segmentWordCount = boundaryWordIdx - currentStartIdx + 1;
    const totalWindowWords = estimatedWordPos();

    // Fraction of the buffer that belongs to this segment
    const fraction = totalWindowWords > 0
      ? Math.min(segmentWordCount / totalWindowWords, 1.0)
      : 1.0;

    const segmentSamples = Math.min(Math.floor(buffer.length * fraction), buffer.length);
    const segmentAudio = buffer.slice(0, segmentSamples);
    buffer = buffer.slice(segmentSamples);

    const durationMs = (segmentAudio.length / sampleRate) * 1_000;
    const segmentWords = words.slice(currentStartIdx, boundaryWordIdx + 1);

    const chunk: ScheduledChunk = {
      audio: segmentAudio,
      sampleRate,
      durationMs,
      words: segmentWords,
      startIdx: currentStartIdx,
      weightConfig: config.getWeightConfig(),
      wordTimestamps: null, // streaming mode: no real timestamps available
    };

    currentStartIdx = boundaryWordIdx + 1;
    onSegmentReady(chunk);
  }

  /**
   * Check whether the current buffer state warrants emitting a segment and
   * do so if needed. Called after every feed().
   */
  function maybeEmit(): void {
    const wordCount = estimatedWordPos();
    const spokenWords = wordCount; // words estimated spoken from currentStartIdx

    if (spokenWords < TTS_STREAM_MIN_SEGMENT_WORDS) return;

    const windowEnd = currentStartIdx + spokenWords;
    const clampedEnd = Math.min(windowEnd, words.length);

    // Try to find a sentence boundary within the estimated window
    const boundaryIdx = findSentenceBoundary(words, currentStartIdx, clampedEnd);

    if (boundaryIdx >= 0) {
      // Boundary found — emit up to and including it
      emitSegment(boundaryIdx);
    } else if (spokenWords >= TTS_STREAM_MAX_SEGMENT_WORDS) {
      // No boundary, but max threshold hit — force emit at the estimated word count
      const forceEnd = Math.min(currentStartIdx + spokenWords - 1, words.length - 1);
      emitSegment(forceEnd);
    }
  }

  return {
    feed(incoming: Float32Array): void {
      if (destroyed) return;
      buffer = concatFloat32(buffer, incoming);
      maybeEmit();
    },

    flush(): void {
      if (destroyed) return;
      destroyed = true;

      // Emit any remaining audio as the final segment
      if (buffer.length > 0 && currentStartIdx < words.length) {
        const lastWordIdx = Math.min(
          currentStartIdx + estimatedWordPos(),
          words.length
        ) - 1;
        if (lastWordIdx >= currentStartIdx) {
          emitSegment(lastWordIdx);
        }
      }

      onStreamEnd();
    },

    destroy(): void {
      destroyed = true;
      buffer = new Float32Array(0);
    },

    getBufferedWordCount(): number {
      if (destroyed) return 0;
      return estimatedWordPos();
    },
  };
}
