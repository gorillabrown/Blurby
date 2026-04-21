// @vitest-environment jsdom

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const playBufferMock = vi.hoisted(() => vi.fn());

vi.mock("../src/utils/audioPlayer", () => ({
  playBuffer: playBufferMock,
}));

describe("previewSelectedTtsVoice truthfulness", () => {
  const originalSpeechSynthesis = window.speechSynthesis;

  beforeEach(() => {
    playBufferMock.mockReset();
  });

  afterEach(() => {
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: originalSpeechSynthesis,
    });
    delete (window as any).electronAPI;
  });

  it("does not fall back to Web Speech when Qwen is selected but not ready", async () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        speak,
        cancel,
        getVoices: () => [],
      },
    });

    (window as any).electronAPI = {
      qwenGenerate: vi.fn(),
    };

    const { previewSelectedTtsVoice } = await import("../src/components/settings/ttsPreview");

    const onPlaybackStateChange = vi.fn();
    const result = await previewSelectedTtsVoice({
      engine: "qwen",
      settings: {
        ttsEngine: "qwen",
        ttsRate: 1.0,
        ttsVoiceName: "Ryan",
      } as any,
      voices: [],
      kokoroReady: false,
      qwenReady: false,
      preferredQwenVoice: "Ryan",
      onPlaybackStateChange,
    });

    expect(result).toMatchObject({
      played: false,
      engine: "qwen",
      error: expect.stringContaining("not ready"),
    });
    expect((window as any).electronAPI.qwenGenerate).not.toHaveBeenCalled();
    expect(speak).not.toHaveBeenCalled();
    expect(playBufferMock).not.toHaveBeenCalled();
    expect(onPlaybackStateChange).toHaveBeenCalledWith(false);
  });

  it("returns truthful Qwen preview timing and timeout metadata instead of silently swallowing failures", async () => {
    (window as any).electronAPI = {
      qwenGenerate: vi.fn().mockResolvedValue({
        error: "Qwen preview timed out after 3200 ms",
        reason: "generate-timeout",
        timingMs: 3200,
        spikeWarningThresholdMs: 3000,
        spikeWarning: true,
      }),
    };

    const { previewSelectedTtsVoice } = await import("../src/components/settings/ttsPreview");

    const onPlaybackStateChange = vi.fn();
    const result = await previewSelectedTtsVoice({
      engine: "qwen",
      settings: {
        ttsEngine: "qwen",
        ttsRate: 1.0,
        ttsVoiceName: "Ryan",
      } as any,
      voices: [],
      kokoroReady: false,
      qwenReady: true,
      preferredQwenVoice: "Ryan",
      onPlaybackStateChange,
    });

    expect(result).toMatchObject({
      played: false,
      engine: "qwen",
      error: "Qwen preview timed out after 3200 ms",
      reason: "generate-timeout",
      timingMs: 3200,
      spikeWarningThresholdMs: 3000,
      spikeWarning: true,
    });
    expect(playBufferMock).not.toHaveBeenCalled();
    expect(onPlaybackStateChange).toHaveBeenCalledWith(false);
  });
});
