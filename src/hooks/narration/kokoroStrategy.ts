// src/hooks/narration/kokoroStrategy.ts — Kokoro TTS strategy (NAR-2: pipeline + scheduler)
//
// Uses the new generationPipeline for progressive chunk sizing and pipelined IPC,
// and audioScheduler for pre-scheduled gapless playback with crossfade.
// Replaces the old audioQueue-based approach.

import type { KokoroSchedulerRatePlanMetadata, TtsStrategy } from "../../types/narration";
import { createGenerationPipeline } from "../../utils/generationPipeline";
import type { GenerationPipeline } from "../../utils/generationPipeline";
import { createAudioScheduler } from "../../utils/audioScheduler";
import type { AudioScheduler, AudioProgressReport } from "../../utils/audioScheduler";
import { segmentKokoroChunk } from "../../utils/audio/segmentKokoroChunk";
import * as ttsCache from "../../utils/ttsCache";
import { applyPronunciationOverrides, overrideHash } from "../../utils/pronunciationOverrides";
import type { PronunciationOverride } from "../../types";
import { perfStart, perfEnd } from "../../utils/narratePerf";
import { recordDiagEvent } from "../../utils/narrateDiagnostics";
import { resolveKokoroRatePlan } from "../../utils/kokoroRatePlan";

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
   * TTS-7R: Visual-only truth-sync callback. Called every ~12 words by the scheduler
   * to re-snap the visual overlay to the authoritative audio position.
   * This must NOT update narration state (cursorWordIndex, lastConfirmedAudioWordRef).
   * If not provided, falls back to onWordAdvance (legacy behavior).
   */
  onTruthSync?: (wordIndex: number) => void;
}

/**
 * Create a TtsStrategy backed by Kokoro via the NAR-2 pipeline + scheduler.
 * The pipeline handles progressive chunk sizing and IPC.
 * The scheduler handles pre-scheduled gapless playback with crossfade.
 */
export function createKokoroStrategy(deps: KokoroStrategyDeps): TtsStrategy & {
  getScheduler: () => AudioScheduler;
  getPipeline: () => GenerationPipeline;
  refreshBufferedTempo: () => void;
  warmUp: () => void;
  /** TTS-7Q: Continuous audio-progress report for smooth visual overlay. */
  getAudioProgress: () => AudioProgressReport | null;
} {
  const scheduler = createAudioScheduler();

  /**
   * Resolve Kokoro rate metadata from the live narration speed.
   * Same-bucket edits should flow into future chunk generation/scheduling
   * without forcing a restart; cross-bucket edits restart upstream.
   */
  const getRatePlan = () => resolveKokoroRatePlan(deps.getSpeed());

  /** Build the cache key voice segment: voiceId/rateBucket[/overrideHash] */
  const getCacheVoice = () => {
    const base = `${deps.getVoiceId()}/${getRatePlan().generationBucket}`;
    const oh = overrideHash(deps.getPronunciationOverrides?.());
    return oh ? `${base}/${oh}` : base;
  };

  // TTS-7G: Track first-chunk state for cold-start measurement
  let firstChunkReceived = false;

  const pipeline = createGenerationPipeline({
    generateFn: async (text, voiceId, speed, words) => {
      if (!api?.kokoroGenerate) return { error: "kokoroGenerate not available" };
      // Apply pronunciation overrides before generation
      const normalizedText = applyPronunciationOverrides(text, deps.getPronunciationOverrides?.());
      const ratePlan = resolveKokoroRatePlan(speed);
      const result = await api.kokoroGenerate(normalizedText, voiceId, ratePlan.generationBucket, words);
      if (result.error || !result.audio || !result.sampleRate) {
        return { error: result.error || "no audio returned" };
      }
      const durationMs = (result as any).durationMs ?? (result.audio.length / result.sampleRate) * 1000;
      return { audio: result.audio, sampleRate: result.sampleRate, durationMs, wordTimestamps: result.wordTimestamps || null };
    },
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
      } satisfies typeof chunk & KokoroSchedulerRatePlanMetadata);

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

      queueMicrotask(() => {
        // TTS-7C: Acknowledge chunk consumption to release backpressure (BUG-115)
        pipeline.acknowledgeChunk();
      });
    },
    onCacheChunk: (startIdx, audio, sampleRate, durationMs, wordCount) => {
      const bookId = deps.getBookId?.() || "";
      const voiceId = getCacheVoice();
      if (bookId) {
        ttsCache.cacheChunk(bookId, voiceId, startIdx, audio, sampleRate, durationMs, wordCount);
      }
    },
    isCached: async (startIdx) => {
      const bookId = deps.getBookId?.() || "";
      const voiceId = getCacheVoice();
      if (!bookId) return false;
      return ttsCache.isCached(bookId, voiceId, startIdx);
    },
    loadCached: async (startIdx) => {
      const bookId = deps.getBookId?.() || "";
      const voiceId = getCacheVoice();
      if (!bookId) return null;
      const words = deps.getWords();
      // TTS-7A: Pass remaining words from startIdx — loadCachedChunk uses
      // the real wordCount stored at cache-write time to slice correctly.
      const remainingWords = words.slice(startIdx);
      return ttsCache.loadCachedChunk(bookId, voiceId, startIdx, remainingWords);
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
        onChunkBoundary: () => {},
        onEnd,
        onError: () => deps.onFallbackToWeb(),
        onSegmentStart: (wordIndex: number) => {
          deps.onSegmentStart?.(wordIndex);
        },
        // TTS-7R: Truth-sync is visual-only — re-snap overlay to scheduler's authoritative position
        // without updating narration state. Route through dedicated deps.onTruthSync if provided;
        // fall back to onWordAdvance only when no visual-only handler is wired (legacy path).
        onTruthSync: (wordIndex: number) => {
          if (deps.onTruthSync) {
            deps.onTruthSync(wordIndex);
          } else {
            onWordAdvance(wordIndex);
          }
        },
        // TTS-7Q: Chunk handoff — forward last audio-confirmed word to the word-advance callback
        // so useNarration updates the canonical cursor position at each chunk boundary.
        onChunkHandoff: (lastConfirmedWordIndex: number) => {
          recordDiagEvent("chunk-handoff", `lastConfirmedWordIndex=${lastConfirmedWordIndex}`);
          if (import.meta.env.DEV) {
            console.debug("[TTS-7Q] chunk handoff carry-over: lastConfirmedWordIndex =", lastConfirmedWordIndex);
          }
          onWordAdvance(lastConfirmedWordIndex);
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

    getAudioProgress() {
      return scheduler.getAudioProgress();
    },
  };
}
