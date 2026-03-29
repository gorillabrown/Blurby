// src/hooks/narration/kokoroStrategy.ts — Kokoro TTS strategy (delegates to audioQueue)
import type { TtsStrategy } from "../../types/narration";
import { createAudioQueue } from "../../utils/audioQueue";
import type { AudioQueue, AudioQueueCallbacks } from "../../utils/audioQueue";
import { TTS_CHUNK_SIZE } from "../../constants";

const api = window.electronAPI;

export interface KokoroStrategyDeps {
  /** Get current Kokoro voice ID */
  getVoiceId: () => string;
  /** Get current speed */
  getSpeed: () => number;
  /** Get the current narration status */
  getStatus: () => string;
  /** Get all words for narration */
  getWords: () => string[];
  /** Get paragraph break indices */
  getParagraphBreaks: () => Set<number>;
  /** Find sentence-aligned chunk end index */
  findChunkEnd: (words: string[], startIdx: number) => number;
  /** Called when Kokoro fails — caller should fall back to Web Speech */
  onFallbackToWeb: () => void;
}

/**
 * Create a TtsStrategy backed by Kokoro via a rolling audio queue.
 * The strategy is a thin wrapper — all buffering, playback, and pause logic
 * lives in audioQueue.ts.
 */
export function createKokoroStrategy(deps: KokoroStrategyDeps): TtsStrategy & { getQueue: () => AudioQueue } {
  const queue = createAudioQueue({
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
    findChunkEnd: deps.findChunkEnd,
    getParagraphBreaks: deps.getParagraphBreaks,
  });

  return {
    speakChunk(_text, _words, startIdx, _speed, onWordAdvance, onEnd, onError) {
      if (!api?.kokoroGenerate) {
        onError();
        return;
      }

      const callbacks: AudioQueueCallbacks = {
        onWordAdvance,
        onChunkBoundary: () => {},
        onEnd,
        onError: () => deps.onFallbackToWeb(),
      };

      queue.start(startIdx, callbacks);
    },

    stop() {
      queue.stop();
    },

    pause() {
      queue.pause();
    },

    resume() {
      queue.resume();
    },

    getQueue() {
      return queue;
    },
  };
}
