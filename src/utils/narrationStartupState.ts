import type { KokoroStatusSnapshot, TtsEngine } from "../types";
import type { NarrationStatus } from "../types/narration";

export type NarrationStartupPhase = "idle" | "loading-engine" | "buffering-audio" | "speaking" | "paused" | "error";
export type NarrationStartupTone = "neutral" | "info" | "success" | "warning" | "error";

export interface NarrationStartupStateInput {
  status: NarrationStatus;
  selectedEngine: TtsEngine;
  kokoroReady: boolean;
  kokoroStatus: KokoroStatusSnapshot;
  firstAudioObserved: boolean;
  pendingPlayback: boolean;
  startupError: string | null;
  nowMs: number;
}

export interface NarrationStartupStateOutput {
  phase: NarrationStartupPhase;
  label: string;
  tone: NarrationStartupTone;
  showSpinner: boolean;
  isActuallyNarrating: boolean;
  errorMessage?: string;
}

export function getNarrationStartupState(input: NarrationStartupStateInput): NarrationStartupStateOutput {
  void input.nowMs;

  const kokoroError =
    input.selectedEngine === "kokoro" && input.kokoroStatus.status === "error"
      ? input.kokoroStatus.detail || input.kokoroStatus.reason || "Kokoro unavailable"
      : null;
  const errorMessage = input.startupError || kokoroError;
  if (input.status === "error" || errorMessage) {
    return {
      phase: "error",
      label: "TTS unavailable",
      tone: "error",
      showSpinner: false,
      isActuallyNarrating: false,
      errorMessage: errorMessage ?? undefined,
    };
  }

  if (input.status === "paused" || input.status === "holding") {
    return {
      phase: "paused",
      label: "Paused",
      tone: "neutral",
      showSpinner: false,
      isActuallyNarrating: false,
    };
  }

  const loadingSelectedEngine =
    input.status === "warming" ||
    input.status === "loading" ||
    (input.selectedEngine === "kokoro" && !input.kokoroReady && input.kokoroStatus.loading);
  if (loadingSelectedEngine) {
    return {
      phase: "loading-engine",
      label: "Loading TTS...",
      tone: "info",
      showSpinner: true,
      isActuallyNarrating: false,
    };
  }

  if ((input.status === "speaking" || input.pendingPlayback) && !input.firstAudioObserved) {
    return {
      phase: "buffering-audio",
      label: "Buffering audio...",
      tone: "info",
      showSpinner: true,
      isActuallyNarrating: false,
    };
  }

  if (input.status === "speaking" && input.firstAudioObserved) {
    return {
      phase: "speaking",
      label: "Narrating",
      tone: "success",
      showSpinner: false,
      isActuallyNarrating: true,
    };
  }

  return {
    phase: "idle",
    label: "",
    tone: "neutral",
    showSpinner: false,
    isActuallyNarrating: false,
  };
}
