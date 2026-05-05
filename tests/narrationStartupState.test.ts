import { describe, expect, it } from "vitest";

import { getNarrationStartupState } from "../src/utils/narrationStartupState";

const kokoroIdle = {
  status: "idle",
  detail: null,
  reason: null,
  ready: false,
  loading: false,
  recoverable: false,
} as const;

describe("getNarrationStartupState", () => {
  it("shows loading while the selected Kokoro engine is warming", () => {
    const result = getNarrationStartupState({
      status: "warming",
      selectedEngine: "kokoro",
      kokoroReady: false,
      kokoroStatus: { ...kokoroIdle, status: "warming", loading: true },
      firstAudioObserved: false,
      pendingPlayback: true,
      startupError: null,
      nowMs: 1000,
    });

    expect(result).toMatchObject({
      phase: "loading-engine",
      label: "Loading TTS...",
      tone: "info",
      showSpinner: true,
      isActuallyNarrating: false,
    });
  });

  it("shows buffering instead of Narrating after playback starts but before first audio truth", () => {
    const result = getNarrationStartupState({
      status: "speaking",
      selectedEngine: "kokoro",
      kokoroReady: true,
      kokoroStatus: { ...kokoroIdle, status: "ready", ready: true },
      firstAudioObserved: false,
      pendingPlayback: true,
      startupError: null,
      nowMs: 2000,
    });

    expect(result).toMatchObject({
      phase: "buffering-audio",
      label: "Buffering audio...",
      tone: "info",
      showSpinner: true,
      isActuallyNarrating: false,
    });
  });

  it("shows Narrating only after first audio has been observed", () => {
    const result = getNarrationStartupState({
      status: "speaking",
      selectedEngine: "kokoro",
      kokoroReady: true,
      kokoroStatus: { ...kokoroIdle, status: "ready", ready: true },
      firstAudioObserved: true,
      pendingPlayback: false,
      startupError: null,
      nowMs: 3000,
    });

    expect(result).toMatchObject({
      phase: "speaking",
      label: "Narrating",
      tone: "success",
      showSpinner: false,
      isActuallyNarrating: true,
    });
  });

  it("surfaces recoverable startup errors as unavailable", () => {
    const result = getNarrationStartupState({
      status: "speaking",
      selectedEngine: "kokoro",
      kokoroReady: false,
      kokoroStatus: {
        ...kokoroIdle,
        status: "error",
        detail: "Kokoro preload failed",
        reason: "warm-up-failed",
        recoverable: true,
      },
      firstAudioObserved: false,
      pendingPlayback: false,
      startupError: "Kokoro preload failed",
      nowMs: 4000,
    });

    expect(result).toMatchObject({
      phase: "error",
      label: "TTS unavailable",
      tone: "error",
      showSpinner: false,
      isActuallyNarrating: false,
      errorMessage: "Kokoro preload failed",
    });
  });
});
