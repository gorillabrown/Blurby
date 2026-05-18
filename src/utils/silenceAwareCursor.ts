import { TTS_SILENCE_HOLD_THRESHOLD_MS } from "../constants";
import type { PauseReason } from "../types/narration";
import type { AudioProgressReport } from "./audioScheduler";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function shouldFreezeCursorForPauseReason(pauseReason: PauseReason | null | undefined): boolean {
  return pauseReason === "rate-change"
    || pauseReason === "voice-change"
    || pauseReason === "user-stop";
}

export function shouldHoldCursorForSilenceGap(
  progress: AudioProgressReport | null | undefined,
  thresholdMs: number = TTS_SILENCE_HOLD_THRESHOLD_MS,
): boolean {
  if (!progress || progress.isInSilenceGap !== true) return false;
  const gapMs = progress.silenceGapMs;
  if (!Number.isFinite(gapMs ?? Number.NaN)) return false;
  return (gapMs ?? 0) >= thresholdMs;
}

export interface CursorHoldDecision {
  freezeForPause: boolean;
  holdForSilence: boolean;
  effectiveFraction: number;
}

export function resolveCursorHoldDecision(params: {
  pauseReason: PauseReason | null | undefined;
  progress: AudioProgressReport | null | undefined;
  thresholdMs?: number;
}): CursorHoldDecision {
  const { pauseReason, progress, thresholdMs = TTS_SILENCE_HOLD_THRESHOLD_MS } = params;
  const freezeForPause = shouldFreezeCursorForPauseReason(pauseReason);
  const holdForSilence = shouldHoldCursorForSilenceGap(progress, thresholdMs);

  if (!progress) {
    return {
      freezeForPause,
      holdForSilence,
      effectiveFraction: 0,
    };
  }

  if (holdForSilence) {
    return {
      freezeForPause,
      holdForSilence,
      effectiveFraction: 1,
    };
  }

  return {
    freezeForPause,
    holdForSilence,
    effectiveFraction: clamp01(progress.fraction),
  };
}
