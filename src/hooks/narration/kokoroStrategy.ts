// src/hooks/narration/kokoroStrategy.ts — Kokoro TTS strategy (NAR-2: pipeline + scheduler)
//
// Uses the new generationPipeline for progressive chunk sizing and pipelined IPC,
// and audioScheduler for pre-scheduled gapless playback with crossfade.
// Replaces the old audioQueue-based approach.

import type { TtsStrategy } from "../../types/narration";
import { createGenerationPipeline } from "../../utils/generationPipeline";
import type { GenerationPipeline } from "../../utils/generationPipeline";
import { createAudioScheduler } from "../../utils/audioScheduler";
import type { AudioScheduler } from "../../utils/audioScheduler";
import * as ttsCache from "../../utils/ttsCache";
import { resolveKokoroBucket } from "../../constants";
import { applyPronunciationOverrides, overrideHash } from "../../utils/pronunciationOverrides";
import type { PronunciationOverride } from "../../types";
import { perfStart, perfEnd } from "../../utils/narratePerf";

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
  /** Called when Kokoro fails — caller should fall back to Web Speech */
  onFallbackToWeb: () => void;
}

/**
 * Create a TtsStrategy backed by Kokoro via the NAR-2 pipeline + scheduler.
 * The pipeline handles progressive chunk sizing and IPC.
 * The scheduler handles pre-scheduled gapless playback with crossfade.
 */
export function createKokoroStrategy(deps: KokoroStrategyDeps): TtsStrategy & {
  getScheduler: () => AudioScheduler;
  getPipeline: () => GenerationPipeline;
  warmUp: () => void;
} {
  const scheduler = createAudioScheduler();

  /** Resolve current speed to a Kokoro native-rate bucket */
  const getBucket = () => resolveKokoroBucket(deps.getSpeed());

  /** Build the cache key voice segment: voiceId/rateBucket[/overrideHash] */
  const getCacheVoice = () => {
    const base = `${deps.getVoiceId()}/${getBucket()}`;
    const oh = overrideHash(deps.getPronunciationOverrides?.());
    return oh ? `${base}/${oh}` : base;
  };

  // TTS-7G: Track first-chunk state for cold-start measurement
  let firstChunkReceived = false;

  const pipeline = createGenerationPipeline({
    generateFn: async (text, voiceId, speed) => {
      if (!api?.kokoroGenerate) return { error: "kokoroGenerate not available" };
      // Apply pronunciation overrides before generation
      const normalizedText = applyPronunciationOverrides(text, deps.getPronunciationOverrides?.());
      // Generate at native bucket rate — no scheduler stretch needed
      const bucket = resolveKokoroBucket(speed);
      const result = await api.kokoroGenerate(normalizedText, voiceId, bucket);
      if (result.error || !result.audio || !result.sampleRate) {
        return { error: result.error || "no audio returned" };
      }
      const durationMs = (result as any).durationMs ?? (result.audio.length / result.sampleRate) * 1000;
      return { audio: result.audio, sampleRate: result.sampleRate, durationMs };
    },
    getWords: deps.getWords,
    getVoiceId: deps.getVoiceId,
    getSpeed: () => getBucket(),
    getWeightConfig: deps.getWeightConfig,
    getPauseConfig: deps.getPauseConfig,
    onChunkReady: (chunk) => {
      // TTS-7G: Instrument the first-chunk response path for BUG-117 verification.
      const isFirst = !firstChunkReceived;
      firstChunkReceived = true;

      if (import.meta.env.DEV) {
        const responseMark = perfStart("first-chunk-response");
        responseMark.meta = { chunkWordCount: chunk.words.length, startIdx: chunk.startIdx, isFirstChunk: isFirst };

        const scheduleMark = perfStart("schedule-chunk");
        scheduleMark.meta = { chunkWordCount: chunk.words.length, startIdx: chunk.startIdx, isFirstChunk: isFirst };
        scheduler.scheduleChunk(chunk);
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
        scheduler.scheduleChunk(chunk);
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
        // TTS-7O: Truth-sync forces highlight to re-snap to scheduler's authoritative position
        onTruthSync: (wordIndex: number) => onWordAdvance(wordIndex),
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

    warmUp() {
      scheduler.warmUp();
    },
  };
}
