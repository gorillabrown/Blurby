import type { BlurbySettings } from "../../types";
import { resolveKokoroRatePlan } from "../../utils/kokoroRatePlan";
import { applyKokoroTempoStretch } from "../../utils/audio/tempoStretch";

interface PreviewSelectedTtsVoiceOptions {
  engine: BlurbySettings["ttsEngine"];
  settings: BlurbySettings;
  voices: SpeechSynthesisVoice[];
  kokoroReady: boolean;
  qwenReady: boolean;
  nanoReady: boolean;
  preferredQwenVoice: string;
  onPlaybackStateChange: (playing: boolean) => void;
}

export interface TtsVoicePreviewResult {
  engine: BlurbySettings["ttsEngine"];
  played: boolean;
  error?: string | null;
  reason?: string | null;
  timingMs?: number | null;
  spikeWarningThresholdMs?: number | null;
  spikeWarning?: boolean;
}

export async function previewSelectedTtsVoice({
  engine,
  settings,
  voices,
  kokoroReady,
  qwenReady,
  nanoReady,
  preferredQwenVoice,
  onPlaybackStateChange,
}: PreviewSelectedTtsVoiceOptions): Promise<TtsVoicePreviewResult> {
  const api = window.electronAPI;

  if (engine === "kokoro") {
    if (!kokoroReady || !api?.kokoroGenerate) {
      onPlaybackStateChange(false);
      return {
        engine: "kokoro",
        played: false,
        error: "Legacy Kokoro is not ready for preview playback.",
      };
    }
    onPlaybackStateChange(true);
    try {
      const voice = settings.ttsVoiceName || "af_bella";
      const ratePlan = resolveKokoroRatePlan(settings.ttsRate || 1.0);
      const result = await api.kokoroGenerate(
        "The quick brown fox jumps over the lazy dog.",
        voice,
        ratePlan.generationBucket,
      );
      if (!result.error && result.audio) {
        const { playBuffer } = await import("../../utils/audioPlayer");
        const playback = applyKokoroTempoStretch({
          audio: result.audio,
          sampleRate: result.sampleRate ?? 24000,
          durationMs: result.durationMs ?? 0,
          wordTimestamps: result.wordTimestamps,
          kokoroRatePlan: ratePlan,
        });
        playBuffer(
          playback.audio,
          result.sampleRate ?? 24000,
          playback.durationMs,
          9,
          undefined,
          () => onPlaybackStateChange(false),
        );
        return {
          engine: "kokoro",
          played: true,
        };
      }
    } catch (error) {
      onPlaybackStateChange(false);
      return {
        engine: "kokoro",
        played: false,
        error: error instanceof Error ? error.message : "Legacy Kokoro preview failed.",
      };
    }
    onPlaybackStateChange(false);
    return {
      engine: "kokoro",
      played: false,
      error: "Legacy Kokoro preview failed.",
    };
  }

  if (engine === "qwen") {
    if (!qwenReady || !api?.qwenGenerate) {
      onPlaybackStateChange(false);
      return {
        engine: "qwen",
        played: false,
        error: "Qwen runtime is not ready for preview playback.",
      };
    }
    onPlaybackStateChange(true);
    try {
      const result = await api.qwenGenerate(
        "The quick brown fox jumps over the lazy dog.",
        preferredQwenVoice,
        settings.ttsRate || 1.0,
        undefined,
      );
      if (!result.error && result.audio) {
        const { playBuffer } = await import("../../utils/audioPlayer");
        playBuffer(
          result.audio,
          result.sampleRate ?? 24000,
          result.durationMs ?? ((result.audio.length / (result.sampleRate ?? 24000)) * 1000),
          9,
          undefined,
          () => onPlaybackStateChange(false),
        );
        return {
          engine: "qwen",
          played: true,
          timingMs: result.timingMs ?? null,
          spikeWarningThresholdMs: result.spikeWarningThresholdMs ?? null,
          spikeWarning: Boolean(result.spikeWarning),
        };
      }
      onPlaybackStateChange(false);
      return {
        engine: "qwen",
        played: false,
        error: result.error || "Qwen preview failed.",
        reason: result.reason ?? null,
        timingMs: result.timingMs ?? null,
        spikeWarningThresholdMs: result.spikeWarningThresholdMs ?? null,
        spikeWarning: Boolean(result.spikeWarning),
      };
    } catch (error) {
      onPlaybackStateChange(false);
      return {
        engine: "qwen",
        played: false,
        error: error instanceof Error ? error.message : "Qwen preview failed.",
      };
    }
  }

  if (engine === "nano") {
    if (!nanoReady || !api?.nanoStatus || !api.nanoSynthesize) {
      onPlaybackStateChange(false);
      return {
        engine: "nano",
        played: false,
        error: "Nano runtime is not ready for preview playback.",
      };
    }

    onPlaybackStateChange(true);
    try {
      const status = await api.nanoStatus();
      if (!status || !("ready" in status) || !status.ready || status.status !== "ready") {
        onPlaybackStateChange(false);
        return {
          engine: "nano",
          played: false,
          error: "Nano runtime is not ready for preview playback.",
          reason: "nano-not-ready",
        };
      }

      const result = await api.nanoSynthesize({
        text: "The quick brown fox jumps over the lazy dog.",
        voice: settings.ttsVoiceName || "default",
        rate: settings.ttsRate || 1.0,
      });
      if ("ok" in result && result.ok && result.audio) {
        const { playBuffer } = await import("../../utils/audioPlayer");
        const audio = result.audio instanceof Float32Array
          ? result.audio
          : Float32Array.from(result.audio);
        playBuffer(
          audio,
          result.sampleRate ?? 24000,
          result.durationMs ?? ((audio.length / (result.sampleRate ?? 24000)) * 1000),
          9,
          undefined,
          () => onPlaybackStateChange(false),
        );
        return {
          engine: "nano",
          played: true,
        };
      }
      onPlaybackStateChange(false);
      return {
        engine: "nano",
        played: false,
        error: "error" in result ? result.error : result.detail || "Nano preview failed.",
        reason: result.reason ?? null,
      };
    } catch (error) {
      onPlaybackStateChange(false);
      return {
        engine: "nano",
        played: false,
        error: error instanceof Error ? error.message : "Nano preview failed.",
      };
    }
  }

  if (!window.speechSynthesis) {
    return {
      engine: "web",
      played: false,
      error: "Web Speech is unavailable in this environment.",
    };
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance("The quick brown fox jumps over the lazy dog.");
  const voice = voices.find((candidate) => candidate.name === settings.ttsVoiceName);
  if (voice) utterance.voice = voice;
  utterance.rate = settings.ttsRate || 1.0;
  utterance.onend = () => onPlaybackStateChange(false);
  utterance.onerror = () => onPlaybackStateChange(false);
  onPlaybackStateChange(true);
  window.speechSynthesis.speak(utterance);
  return {
    engine: "web",
    played: true,
  };
}
