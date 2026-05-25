// src/hooks/narration/kokoroStrategy.ts — Kokoro TTS strategy (NAR-2: pipeline + scheduler)
//
// Uses the new generationPipeline for progressive chunk sizing and pipelined IPC,
// and audioScheduler for pre-scheduled gapless playback with crossfade.
// Replaces the old audioQueue-based approach.

import type { KokoroSchedulerRatePlanMetadata, TtsStrategy } from "../../types/narration";
import { createGenerationPipeline } from "../../utils/generationPipeline";
import type { GenerationPipeline } from "../../utils/generationPipeline";
import { createAudioScheduler } from "../../utils/audioScheduler";
import type { AudioScheduler, AudioProgressReport, ChunkBoundaryPayload } from "../../utils/audioScheduler";
import type { TimingMetadataRecord } from "../../utils/timingMetadataStore";
import { segmentKokoroChunk } from "../../utils/audio/segmentKokoroChunk";
import * as ttsCache from "../../utils/ttsCache";
import { normalizeSegmentText, type SegmentNormalizationResult } from "../../utils/segmentNormalizer";
import { buildKokoroCacheIdentity } from "../../utils/ttsCacheIdentity";
import type { KokoroPreflightReport, KokoroPreflightStatus, PronunciationOverride } from "../../types";
import { perfStart, perfEnd } from "../../utils/narratePerf";
import { recordDiagEvent } from "../../utils/narrateDiagnostics";
import { resolveKokoroRatePlan } from "../../utils/kokoroRatePlan";
import {
  KOKORO_LIVE_RATE_MAX_SEGMENT_DURATION_MS,
  KOKORO_LIVE_RATE_MIN_SEGMENT_WORDS,
  KOKORO_MODEL_ID,
  KOKORO_SAMPLE_RATE,
} from "../../constants";
import type { TtsCacheIdentity, TtsCacheIdentityV2, TtsCacheWriteTimingMetadata } from "../../types/ttsCache";
import type { TtsProviderWordBoundaryCallback } from "../../types/ttsProvider";
import { filterSpokenWords, isPunctuationOnlyWord } from "../../utils/spokenWordFilter";

const api = window.electronAPI;

export interface KokoroStrategyDeps {
  /** Get current Kokoro voice ID */
  getVoiceId: () => string;
  /** Get current speed (resolved to native-rate bucket for generation) */
  getSpeed: () => number;
  /** Get the current narration status */
  getStatus: () => string;
  /** Get all words for narration */
  getWords: () => string[];
  /** Get the active book ID (for caching) */
  getBookId?: () => string;
  /** Get current pronunciation overrides for text normalization + cache identity */
  getPronunciationOverrides?: () => PronunciationOverride[];
  /** TTS-7N: Get word-weight config derived from pause settings */
  getWeightConfig?: () => import("../../utils/audioScheduler").WordWeightConfig | undefined;
  /** TTS-7O: Get current pause config for silence injection at chunk boundaries */
  getPauseConfig?: () => import("../../utils/pauseDetection").PauseConfig | undefined;
  /** TTS-7P: Get paragraph break set for planner-aware silence injection */
  getParagraphBreaks?: () => Set<number>;
  /** Footnote behavior for narration */
  getFootnoteMode?: () => "skip" | "read";
  /** Footnote cue insertion points */
  getFootnoteCues?: () => Array<{ afterWordIdx: number; text: string }>;
  /** Called when Kokoro fails — caller should fall back to Web Speech */
  onFallbackToWeb: () => void;
  /** Fires when a scheduler segment actually starts playing on the audio clock. */
  onSegmentStart?: (wordIndex: number) => void;
  /**
   * TTS-7Q: Playback chunk boundary callback.
   * For segmented chunks, metadata includes the parent generated chunk identity.
   */
  onChunkBoundary?: (endIdx: number, metadata?: ChunkBoundaryPayload) => void;
  /** Step 3.6: Fires when the pipeline produces a chunk, with the word index past the last produced word. */
  onChunkProduced?: (endIdx: number) => void;
  /** TTS-SYNC-1: Receives scheduler timing metadata for centralized highlight policy. */
  onTimingMetadata?: (metadata: TimingMetadataRecord) => void;
  /**
   * Provider-level word-boundary callback carrying normalized/source and resolved/original indices.
   * This must NOT update narration state (cursorWordIndex, lastConfirmedAudioWordRef).
   */
  onTruthSync?: TtsProviderWordBoundaryCallback;
}

export interface KokoroStrategyPreflightSnapshot {
  status: KokoroPreflightStatus;
  ready: boolean;
  loading: boolean;
  offlineReady: boolean;
  recoverable: boolean;
  report: KokoroPreflightReport;
}

export interface KokoroStrategy extends TtsStrategy {
  getScheduler: () => AudioScheduler;
  getPipeline: () => GenerationPipeline;
  refreshBufferedTempo: () => void;
  warmUp: () => void;
  /** Preserve the latest renderer-visible Kokoro preflight truth without starting playback. */
  refreshPreflight: () => Promise<KokoroStrategyPreflightSnapshot | null>;
  getPreflightSnapshot: () => KokoroStrategyPreflightSnapshot | null;
  getPreflightStatus: () => KokoroPreflightStatus | null;
  /** TTS-7Q: Continuous audio-progress report for smooth visual overlay. */
  getAudioProgress: () => AudioProgressReport | null;
}

type WordTimestamp = { word: string; startTime: number; endTime: number };

function isKokoroPreflightStatus(status: unknown): status is KokoroPreflightStatus {
  return (
    status === "ready" ||
    status === "loading" ||
    status === "missing-assets" ||
    status === "download-needed" ||
    status === "download-failed" ||
    status === "runtime-error" ||
    status === "offline-ready"
  );
}

function isKokoroPreflightReport(report: unknown): report is KokoroPreflightReport {
  if (!report || typeof report !== "object") return false;
  const candidate = report as Partial<KokoroPreflightReport>;
  return (
    isKokoroPreflightStatus(candidate.status) &&
    typeof candidate.ready === "boolean" &&
    typeof candidate.loading === "boolean" &&
    typeof candidate.offlineReady === "boolean" &&
    typeof candidate.recoverable === "boolean"
  );
}

function snapshotFromPreflightReport(report: KokoroPreflightReport): KokoroStrategyPreflightSnapshot {
  return {
    status: report.status,
    ready: report.ready,
    loading: report.loading,
    offlineReady: report.offlineReady,
    recoverable: report.recoverable,
    report,
  };
}

function remapWordTimestampsToOriginalWords(params: {
  wordTimestamps: WordTimestamp[] | null | undefined;
  normalizedToOriginalMap: number[];
  originalWords: string[];
}): { wordTimestamps: WordTimestamp[] | null; sourceWordIndexes: number[] | null } {
  const { wordTimestamps, normalizedToOriginalMap, originalWords } = params;
  if (!Array.isArray(wordTimestamps) || wordTimestamps.length === 0 || originalWords.length === 0) {
    return { wordTimestamps: null, sourceWordIndexes: null };
  }

  // Fast path: provider already returned original-space boundaries.
  if (
    wordTimestamps.length === originalWords.length &&
    wordTimestamps.every((timestamp, index) => timestamp.word === originalWords[index])
  ) {
    return {
      wordTimestamps,
      sourceWordIndexes: originalWords.map((_, index) => index),
    };
  }

  if (normalizedToOriginalMap.length !== wordTimestamps.length) {
    return { wordTimestamps: null, sourceWordIndexes: null };
  }

  const buckets: Array<{ startTime: number; endTime: number; sourceWordIndex: number } | null> =
    originalWords.map(() => null);

  for (let sourceWordIndex = 0; sourceWordIndex < wordTimestamps.length; sourceWordIndex += 1) {
    const timestamp = wordTimestamps[sourceWordIndex];
    const mappedOriginalIndex = normalizedToOriginalMap[sourceWordIndex];
    if (!timestamp || !Number.isInteger(mappedOriginalIndex)) continue;
    if (!Number.isFinite(timestamp.startTime) || !Number.isFinite(timestamp.endTime)) continue;
    const originalIndex = Math.max(0, Math.min(originalWords.length - 1, mappedOriginalIndex));
    const existing = buckets[originalIndex];
    if (!existing) {
      buckets[originalIndex] = {
        startTime: timestamp.startTime,
        endTime: timestamp.endTime,
        sourceWordIndex,
      };
      continue;
    }
    existing.startTime = Math.min(existing.startTime, timestamp.startTime);
    existing.endTime = Math.max(existing.endTime, timestamp.endTime);
  }

  if (buckets.some((bucket) => bucket == null)) {
    return { wordTimestamps: null, sourceWordIndexes: null };
  }

  const remappedWordTimestamps: WordTimestamp[] = [];
  const sourceWordIndexes: number[] = [];
  let previousEndTime = 0;

  for (let originalIndex = 0; originalIndex < originalWords.length; originalIndex += 1) {
    const bucket = buckets[originalIndex];
    if (!bucket) return { wordTimestamps: null, sourceWordIndexes: null };
    const startTime = Math.max(previousEndTime, bucket.startTime);
    const endTime = Math.max(startTime, bucket.endTime);
    remappedWordTimestamps.push({
      word: originalWords[originalIndex],
      startTime,
      endTime,
    });
    sourceWordIndexes.push(bucket.sourceWordIndex);
    previousEndTime = endTime;
  }

  return {
    wordTimestamps: remappedWordTimestamps,
    sourceWordIndexes,
  };
}

function mapSpokenTimestampsToDisplayWords(params: {
  displayWords: string[];
  spokenToDisplayMap: number[];
  spokenWordTimestamps: WordTimestamp[] | null;
  spokenSourceWordIndexes: number[] | null;
}): { wordTimestamps: WordTimestamp[] | null; sourceWordIndexes: number[] | null } {
  const { displayWords, spokenToDisplayMap, spokenWordTimestamps, spokenSourceWordIndexes } = params;
  if (!Array.isArray(spokenWordTimestamps) || spokenWordTimestamps.length === 0) {
    return { wordTimestamps: null, sourceWordIndexes: null };
  }
  if (spokenWordTimestamps.length !== spokenToDisplayMap.length) {
    return { wordTimestamps: null, sourceWordIndexes: null };
  }

  const mapped: Array<WordTimestamp | null> = displayWords.map(() => null);
  const sourceWordIndexes: number[] = [];

  for (let spokenIdx = 0; spokenIdx < spokenWordTimestamps.length; spokenIdx += 1) {
    const displayIdx = spokenToDisplayMap[spokenIdx];
    const ts = spokenWordTimestamps[spokenIdx];
    if (!Number.isInteger(displayIdx) || displayIdx < 0 || displayIdx >= displayWords.length) {
      return { wordTimestamps: null, sourceWordIndexes: null };
    }
    if (!Number.isFinite(ts.startTime) || !Number.isFinite(ts.endTime)) {
      return { wordTimestamps: null, sourceWordIndexes: null };
    }
    mapped[displayIdx] = {
      word: displayWords[displayIdx],
      startTime: ts.startTime,
      endTime: ts.endTime,
    };
    const sourceWordIndex = spokenSourceWordIndexes?.[spokenIdx];
    if (Number.isInteger(sourceWordIndex)) {
      sourceWordIndexes[displayIdx] = Number(sourceWordIndex);
    }
  }

  let idx = 0;
  while (idx < mapped.length) {
    if (mapped[idx]) {
      idx += 1;
      continue;
    }

    const runStart = idx;
    while (idx < mapped.length && !mapped[idx]) idx += 1;
    const runEnd = idx - 1;

    for (let displayIdx = runStart; displayIdx <= runEnd; displayIdx += 1) {
      if (!isPunctuationOnlyWord(displayWords[displayIdx])) {
        return { wordTimestamps: null, sourceWordIndexes: null };
      }
    }

    let prevSpoken = runStart - 1;
    while (prevSpoken >= 0 && !mapped[prevSpoken]) prevSpoken -= 1;
    let nextSpoken = runEnd + 1;
    while (nextSpoken < mapped.length && !mapped[nextSpoken]) nextSpoken += 1;

    const prevAnchor = prevSpoken >= 0 && mapped[prevSpoken] ? mapped[prevSpoken]!.endTime : null;
    const nextAnchor = nextSpoken < mapped.length && mapped[nextSpoken] ? mapped[nextSpoken]!.startTime : null;
    const runLength = runEnd - runStart + 1;

    if (prevAnchor == null && nextAnchor == null) {
      for (let displayIdx = runStart; displayIdx <= runEnd; displayIdx += 1) {
        mapped[displayIdx] = { word: displayWords[displayIdx], startTime: 0, endTime: 0 };
      }
      continue;
    }

    if (prevAnchor != null && nextAnchor != null) {
      const rangeStart = prevAnchor;
      const rangeEnd = Math.max(rangeStart, nextAnchor);
      const span = rangeEnd - rangeStart;
      for (let offset = 0; offset < runLength; offset += 1) {
        const displayIdx = runStart + offset;
        const startTime = rangeStart + (span * offset) / runLength;
        const endTime = rangeStart + (span * (offset + 1)) / runLength;
        mapped[displayIdx] = { word: displayWords[displayIdx], startTime, endTime };
      }
      continue;
    }

    const anchor = prevAnchor ?? nextAnchor ?? 0;
    for (let displayIdx = runStart; displayIdx <= runEnd; displayIdx += 1) {
      mapped[displayIdx] = { word: displayWords[displayIdx], startTime: anchor, endTime: anchor };
    }
  }

  if (mapped.some((entry) => entry == null)) {
    return { wordTimestamps: null, sourceWordIndexes: null };
  }

  let previousStartTime = 0;
  for (let displayIdx = 0; displayIdx < mapped.length; displayIdx += 1) {
    const entry = mapped[displayIdx]!;
    if (entry.startTime < previousStartTime) {
      entry.startTime = previousStartTime;
    }
    if (entry.endTime < entry.startTime) {
      entry.endTime = entry.startTime;
    }
    previousStartTime = entry.startTime;
  }

  return {
    wordTimestamps: mapped as WordTimestamp[],
    sourceWordIndexes,
  };
}

/**
 * Create a TtsStrategy backed by Kokoro via the NAR-2 pipeline + scheduler.
 * The pipeline handles progressive chunk sizing and IPC.
 * The scheduler handles pre-scheduled gapless playback with crossfade.
 */
export function createKokoroStrategy(deps: KokoroStrategyDeps): KokoroStrategy {
  const scheduler = createAudioScheduler();
  let latestPreflightSnapshot: KokoroStrategyPreflightSnapshot | null = null;

  const preservePreflightReport = (report: unknown) => {
    if (!isKokoroPreflightReport(report)) return latestPreflightSnapshot;
    latestPreflightSnapshot = snapshotFromPreflightReport(report);
    return latestPreflightSnapshot;
  };

  /**
   * Resolve Kokoro rate metadata from the live narration speed.
   * Same-bucket edits should flow into future chunk generation/scheduling
   * without forcing a restart; cross-bucket edits restart upstream.
   */
  const getRatePlan = () => resolveKokoroRatePlan(deps.getSpeed());

  const normalizeForSpeech = (text: string): SegmentNormalizationResult =>
    normalizeSegmentText(text, {
      locale: "en-US",
      pronunciationOverrides: deps.getPronunciationOverrides?.(),
    });

  /** Build the v2 cache identity from the exact source text that owns this generated chunk. */
  const getCacheIdentity = (text: string, _words: string[], startIdx: number): TtsCacheIdentityV2 => {
    return buildKokoroCacheIdentity({
      text,
      startIdx,
      bookId: deps.getBookId?.() || "",
      voiceId: deps.getVoiceId(),
      rateBucket: getRatePlan().generationBucket,
      pronunciationOverrides: deps.getPronunciationOverrides?.(),
      modelVersion: KOKORO_MODEL_ID,
      sampleRate: KOKORO_SAMPLE_RATE,
      timingTruth: "word-native",
    }).identity;
  };

  // TTS-7G: Track first-chunk state for cold-start measurement
  let firstChunkReceived = false;

  const pipeline = createGenerationPipeline({
    generateFn: async (_text, voiceId, speed, words) => {
      if (!api?.kokoroGenerate) return { error: "kokoroGenerate not available" };
      const displayWords = words ?? [];
      const { spokenWords, spokenToDisplayMap } = filterSpokenWords(displayWords);
      const wordsForGeneration = spokenWords.length > 0 ? spokenWords : displayWords;
      const normalized = normalizeForSpeech(wordsForGeneration.join(" "));
      const ratePlan = resolveKokoroRatePlan(speed);
      const result = await api.kokoroGenerate(
        normalized.normalizedText,
        voiceId,
        ratePlan.generationBucket,
        wordsForGeneration,
      );
      if (result.error || !result.audio || !result.sampleRate) {
        return { error: result.error || "no audio returned" };
      }
      const durationMs = (result as any).durationMs ?? (result.audio.length / result.sampleRate) * 1000;
      const remappedToSpokenWords = remapWordTimestampsToOriginalWords({
        wordTimestamps: result.wordTimestamps || null,
        normalizedToOriginalMap: normalized.normalizedToOriginalMap,
        originalWords: wordsForGeneration,
      });
      const remappedToDisplayWords = spokenWords.length > 0
        ? mapSpokenTimestampsToDisplayWords({
          displayWords,
          spokenToDisplayMap,
          spokenWordTimestamps: remappedToSpokenWords.wordTimestamps ?? result.wordTimestamps ?? null,
          spokenSourceWordIndexes: remappedToSpokenWords.sourceWordIndexes,
        })
        : remappedToSpokenWords;
      return {
        audio: result.audio,
        sampleRate: result.sampleRate,
        durationMs,
        wordTimestamps: (remappedToDisplayWords.wordTimestamps ?? result.wordTimestamps) || null,
        sourceWordIndexes: remappedToDisplayWords.sourceWordIndexes,
      };
    },
    getCacheIdentity,
    getWords: deps.getWords,
    getVoiceId: deps.getVoiceId,
    getSpeed: () => getRatePlan().selectedSpeed,
    getWeightConfig: deps.getWeightConfig,
    getPauseConfig: deps.getPauseConfig,
    getParagraphBreaks: deps.getParagraphBreaks,
    getFootnoteMode: deps.getFootnoteMode,
    getFootnoteCues: deps.getFootnoteCues,
    onChunkReady: (chunk) => {
      const schedulerSegments = segmentKokoroChunk({
        ...chunk,
        // Wave A: keep generation/cache on the snapped bucket and expose
        // exact UI speed recovery via pre-playback pitch-preserving tempo shaping.
        kokoroRatePlan: getRatePlan(),
      } satisfies typeof chunk & KokoroSchedulerRatePlanMetadata, {
        maxSegmentDurationMs: KOKORO_LIVE_RATE_MAX_SEGMENT_DURATION_MS,
        minSegmentWords: KOKORO_LIVE_RATE_MIN_SEGMENT_WORDS,
      });

      // TTS-7G: Instrument the first-chunk response path for BUG-117 verification.
      const isFirst = !firstChunkReceived;
      firstChunkReceived = true;

      if (import.meta.env.DEV) {
        const responseMark = perfStart("first-chunk-response");
        responseMark.meta = { chunkWordCount: chunk.words.length, startIdx: chunk.startIdx, isFirstChunk: isFirst };

        const scheduleMark = perfStart("schedule-chunk");
        scheduleMark.meta = { chunkWordCount: chunk.words.length, startIdx: chunk.startIdx, isFirstChunk: isFirst };
        for (const schedulerSegment of schedulerSegments) {
          scheduler.scheduleChunk(schedulerSegment);
        }
        perfEnd(scheduleMark);

        perfEnd(responseMark);

        if (isFirst) {
          console.log(
            `[TTS-7G] first-chunk response: ${responseMark.durationMs?.toFixed(2)}ms ` +
            `(schedule: ${scheduleMark.durationMs?.toFixed(2)}ms), ` +
            `words: ${chunk.words.length}, startIdx: ${chunk.startIdx}`
          );
        }
      } else {
        // TTS-7E: Schedule chunk synchronously (scheduler needs it immediately).
        for (const schedulerSegment of schedulerSegments) {
          scheduler.scheduleChunk(schedulerSegment);
        }
      }

      deps.onChunkProduced?.(chunk.startIdx + chunk.words.length);

      queueMicrotask(() => {
        // TTS-7C: Acknowledge chunk consumption to release backpressure (BUG-115)
        pipeline.acknowledgeChunk();
      });
    },
    onCacheChunk: (startIdx, audio, sampleRate, durationMs, wordCount, cacheIdentity?: TtsCacheIdentity, timingMetadata?: TtsCacheWriteTimingMetadata) => {
      const bookId = deps.getBookId?.() || "";
      if (bookId && cacheIdentity) {
        ttsCache.cacheChunk(bookId, cacheIdentity, startIdx, audio, sampleRate, durationMs, wordCount, timingMetadata);
      }
    },
    isCached: async (startIdx, cacheIdentity) => {
      const bookId = deps.getBookId?.() || "";
      if (!bookId || !cacheIdentity) return false;
      return ttsCache.isCached(bookId, cacheIdentity, startIdx);
    },
    loadCached: async (startIdx, cacheIdentity) => {
      const bookId = deps.getBookId?.() || "";
      if (!bookId || !cacheIdentity) return null;
      const words = deps.getWords();
      return ttsCache.loadCachedChunk(bookId, cacheIdentity, startIdx, words);
    },
    onError: () => deps.onFallbackToWeb(),
    onEnd: () => {
      // Pipeline exhausted all words — tell scheduler so it fires onEnd when audio finishes
      scheduler.markPipelineDone();
    },
  });

  return {
    speakChunk(_text, _words, startIdx, _speed, onWordAdvance, onEnd, onError) {
      if (!api?.kokoroGenerate) {
        onError();
        return;
      }

      // Set up scheduler callbacks
      scheduler.setCallbacks({
        onWordAdvance,
        onChunkBoundary: (endIdx, metadata) => {
          deps.onChunkBoundary?.(endIdx, metadata);
        },
        onEnd,
        onError: () => deps.onFallbackToWeb(),
        onSegmentStart: (wordIndex: number) => {
          deps.onSegmentStart?.(wordIndex);
        },
        onTimingMetadata: (metadata) => {
          deps.onTimingMetadata?.(metadata);
        },
        // Event-driven boundary sync: emit provider-level word-boundary events with both
        // native/source index and resolved/original index. This is visual-only.
        onTruthSync: (wordIndex: number, isTrustedWordTiming = true, boundaryEvent) => {
          deps.onTruthSync?.({
            sourceWordIndex: boundaryEvent?.sourceWordIndex ?? null,
            resolvedWordIndex: wordIndex,
            isTrustedWordTiming,
            alignmentCorrected: boundaryEvent?.alignmentCorrected ?? false,
            timingTruth: boundaryEvent?.timingTruth ?? "none",
          });
        },
        // NARR-FIX-4: Chunk handoff is diagnostics-only. We do not push a synthetic
        // word-advance on handoff because TtsStrategy.onWordAdvance cannot carry trust
        // metadata, and defaulting to trusted can cause large visual fast-forwards.
        onChunkHandoff: (lastConfirmedWordIndex: number, isTrustedWordTiming = false, boundaryEvent) => {
          recordDiagEvent("chunk-handoff", `lastConfirmedWordIndex=${lastConfirmedWordIndex}`);
          if (import.meta.env.DEV) {
            console.debug(
              "[TTS-7Q] chunk handoff carry-over: lastConfirmedWordIndex =",
              lastConfirmedWordIndex,
              "trusted =",
              isTrustedWordTiming,
              "timingTruth =",
              boundaryEvent?.timingTruth ?? "none",
            );
          }
        },
      });

      // Start pipeline FIRST so chunks begin generating before timer could start.
      // scheduler.play() resumes AudioContext but no longer starts the word timer —
      // that's deferred to first scheduleChunk() call.
      pipeline.start(startIdx);
      scheduler.play();
    },

    stop() {
      pipeline.stop();
      scheduler.stop();
      firstChunkReceived = false; // TTS-7G: Reset for next cold-start measurement
    },

    pause() {
      scheduler.pause();
      pipeline.pause(); // TTS-7B: Also pause chunk emission
    },

    resume() {
      pipeline.resume(); // TTS-7B: Flush buffered chunks first
      scheduler.resume();
    },

    getScheduler() {
      return scheduler;
    },

    getPipeline() {
      return pipeline;
    },

    refreshBufferedTempo() {
      scheduler.refreshBufferedTempo(getRatePlan());
    },

    warmUp() {
      scheduler.warmUp();
    },

    async refreshPreflight() {
      if (!api?.kokoroPreflight) return latestPreflightSnapshot;
      try {
        return preservePreflightReport(await api.kokoroPreflight());
      } catch {
        return latestPreflightSnapshot;
      }
    },

    getPreflightSnapshot() {
      return latestPreflightSnapshot;
    },

    getPreflightStatus() {
      return latestPreflightSnapshot?.status ?? null;
    },

    getAudioProgress() {
      return scheduler.getAudioProgress();
    },
  };
}
