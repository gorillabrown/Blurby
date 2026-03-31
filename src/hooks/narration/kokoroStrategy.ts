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

const api = window.electronAPI;

export interface KokoroStrategyDeps {
  /** Get current Kokoro voice ID */
  getVoiceId: () => string;
  /** Get current speed (playbackRate, not generation speed) */
  getSpeed: () => number;
  /** Get the current narration status */
  getStatus: () => string;
  /** Get all words for narration */
  getWords: () => string[];
  /** Get the active book ID (for caching) */
  getBookId?: () => string;
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

  const pipeline = createGenerationPipeline({
    generateFn: async (text, voiceId, speed) => {
      if (!api?.kokoroGenerate) return { error: "kokoroGenerate not available" };
      const result = await api.kokoroGenerate(text, voiceId, speed);
      if (result.error || !result.audio || !result.sampleRate) {
        return { error: result.error || "no audio returned" };
      }
      const durationMs = (result as any).durationMs ?? (result.audio.length / result.sampleRate) * 1000;
      return { audio: result.audio, sampleRate: result.sampleRate, durationMs };
    },
    getWords: deps.getWords,
    getVoiceId: deps.getVoiceId,
    getSpeed: deps.getSpeed,
    onChunkReady: (chunk) => {
      scheduler.scheduleChunk(chunk);
    },
    onCacheChunk: (startIdx, audio, sampleRate, durationMs) => {
      if (deps.getSpeed() !== 1.0) return; // Don't cache speed-specific audio
      const bookId = deps.getBookId?.() || "";
      const voiceId = deps.getVoiceId();
      if (bookId) {
        ttsCache.cacheChunk(bookId, voiceId, startIdx, audio, sampleRate, durationMs);
      }
    },
    isCached: async (startIdx) => {
      if (deps.getSpeed() !== 1.0) return false; // Skip stale 1.0x cache at other speeds
      const bookId = deps.getBookId?.() || "";
      const voiceId = deps.getVoiceId();
      if (!bookId) return false;
      return ttsCache.isCached(bookId, voiceId, startIdx);
    },
    loadCached: async (startIdx) => {
      const bookId = deps.getBookId?.() || "";
      const voiceId = deps.getVoiceId();
      if (!bookId) return null;
      const words = deps.getWords();
      // Reconstruct chunk words from the word array
      // (cached chunks don't store words, just audio)
      const chunkWords = words.slice(startIdx, startIdx + 148); // approximate — cruise size
      return ttsCache.loadCachedChunk(bookId, voiceId, startIdx, chunkWords);
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
    },

    pause() {
      scheduler.pause();
    },

    resume() {
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
