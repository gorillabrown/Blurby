import type { TtsStrategy } from "../../types/narration";
import { createGenerationPipeline } from "../../utils/generationPipeline";
import type { GenerationPipeline } from "../../utils/generationPipeline";
import { createAudioScheduler } from "../../utils/audioScheduler";
import type { AudioScheduler, AudioProgressReport } from "../../utils/audioScheduler";
import { applyKokoroTempoStretch } from "../../utils/audio/tempoStretch";
import { applyPronunciationOverrides } from "../../utils/pronunciationOverrides";
import type { PronunciationOverride } from "../../types";
import {
  QWEN_CRUISE_CHUNK_WORDS,
  QWEN_DEFAULT_SPEAKER,
  QWEN_OPENING_RAMP_WORD_COUNTS,
  QWEN_PLANNER_WINDOW_WORDS,
  QWEN_QUEUE_DEPTH,
} from "../../constants";

const api = window.electronAPI;

export interface QwenStrategyDeps {
  getSpeaker: () => string;
  getSpeed: () => number;
  getStatus: () => string;
  getWords: () => string[];
  getBookId?: () => string;
  getPronunciationOverrides?: () => PronunciationOverride[];
  getPauseConfig?: () => import("../../utils/pauseDetection").PauseConfig | undefined;
  getParagraphBreaks?: () => Set<number>;
  getFootnoteMode?: () => "skip" | "read";
  getFootnoteCues?: () => Array<{ afterWordIdx: number; text: string }>;
  onError: () => void;
  onSegmentStart?: (wordIndex: number) => void;
  onTruthSync?: (wordIndex: number) => void;
}

export function createQwenStrategy(deps: QwenStrategyDeps): TtsStrategy & {
  getScheduler: () => AudioScheduler;
  getPipeline: () => GenerationPipeline;
  getAudioProgress: () => AudioProgressReport | null;
} {
  const scheduler = createAudioScheduler();

  const pipeline = createGenerationPipeline({
    generateFn: async (text, _voiceId, speed, words) => {
      if (!api?.qwenGenerate) return { error: "qwenGenerate not available" };

      const normalizedText = applyPronunciationOverrides(text, deps.getPronunciationOverrides?.());
      const result = await api.qwenGenerate(
        normalizedText,
        deps.getSpeaker() || QWEN_DEFAULT_SPEAKER,
        speed,
        words,
      );
      if (result.error || !result.audio || !result.sampleRate) {
        return { error: result.error || "no audio returned" };
      }

      const stretched = applyKokoroTempoStretch({
        audio: result.audio,
        sampleRate: result.sampleRate,
        durationMs: result.durationMs ?? (result.audio.length / result.sampleRate) * 1000,
        tempoFactor: speed,
        wordTimestamps: result.wordTimestamps || null,
      });

      return {
        audio: stretched.audio,
        sampleRate: result.sampleRate,
        durationMs: stretched.durationMs,
        wordTimestamps: stretched.wordTimestamps || null,
      };
    },
    getWords: deps.getWords,
    getVoiceId: () => deps.getSpeaker() || QWEN_DEFAULT_SPEAKER,
    getSpeed: deps.getSpeed,
    getPauseConfig: deps.getPauseConfig,
    getParagraphBreaks: deps.getParagraphBreaks,
    getFootnoteMode: deps.getFootnoteMode,
    getFootnoteCues: deps.getFootnoteCues,
    onChunkReady: (chunk) => {
      scheduler.scheduleChunk(chunk);
    },
    onError: deps.onError,
    onEnd: () => {
      scheduler.markPipelineDone();
    },
    openingRampWordCounts: QWEN_OPENING_RAMP_WORD_COUNTS,
    cruiseChunkWords: QWEN_CRUISE_CHUNK_WORDS,
    queueDepth: QWEN_QUEUE_DEPTH,
    plannerWindowWords: QWEN_PLANNER_WINDOW_WORDS,
  });

  return {
    speakChunk(_text, _words, startIdx, _speed, onWordAdvance, onEnd, onError) {
      if (!api?.qwenGenerate) {
        deps.onError();
        onError();
        return;
      }

      scheduler.setCallbacks({
        onWordAdvance,
        onChunkBoundary: () => {},
        onEnd,
        onError: deps.onError,
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
      });

      pipeline.start(startIdx);
      scheduler.play();
    },

    stop() {
      pipeline.stop();
      scheduler.stop();
    },

    pause() {
      scheduler.pause();
      pipeline.pause();
    },

    resume() {
      pipeline.resume();
      scheduler.resume();
    },

    getScheduler() {
      return scheduler;
    },

    getPipeline() {
      return pipeline;
    },

    getAudioProgress() {
      return scheduler.getAudioProgress();
    },
  };
}
