// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_SETTINGS,
  QWEN_TTS_DISABLED,
  TTS_DEFAULT_ENGINE,
  normalizeSelectableTtsEngine,
  profileFromSettings,
} from "../src/constants";
import type { BlurbySettings, PocketTtsStatusSnapshot } from "../src/types";

const playBufferMock = vi.hoisted(() => vi.fn());

vi.mock("../src/utils/audioPlayer", () => ({
  playBuffer: playBufferMock,
}));

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve()).then(() => Promise.resolve());
}

function createElectronApiMock(initialPocketStatus?: Partial<PocketTtsStatusSnapshot> | null) {
  return {
    kokoroModelStatus: vi.fn().mockResolvedValue({
      status: "idle",
      detail: null,
      reason: null,
      ready: false,
      loading: false,
      recoverable: false,
    }),
    kokoroVoices: vi.fn().mockResolvedValue({ voices: ["af_bella"] }),
    onKokoroDownloadProgress: vi.fn(() => () => {}),
    onKokoroEngineStatus: vi.fn(() => () => {}),
    onKokoroDownloadError: vi.fn(() => () => {}),
    qwenModelStatus: vi.fn().mockResolvedValue({
      status: "unavailable",
      detail: "Qwen runtime config was not found",
      reason: "config-missing",
      ready: false,
      loading: false,
      recoverable: true,
    }),
    qwenPreload: vi.fn().mockResolvedValue({
      error: "Qwen runtime config was not found",
      status: "unavailable",
      reason: "config-missing",
      recoverable: true,
    }),
    qwenVoices: vi.fn().mockResolvedValue({ voices: [] }),
    onQwenEngineStatus: vi.fn(() => () => {}),
    onQwenRuntimeError: vi.fn(() => () => {}),
    nanoStatus: vi.fn().mockResolvedValue({
      ok: true,
      status: "unavailable",
      detail: "Nano sidecar is not running",
      reason: "sidecar-not-started",
      ready: false,
      loading: false,
      recoverable: true,
    }),
    nanoSynthesize: vi.fn(),
    pocketStatus: initialPocketStatus === null
      ? undefined
      : vi.fn().mockResolvedValue({
          ok: true,
          status: "unavailable",
          detail: "Pocket sidecar is not running",
          reason: "sidecar-missing",
          ready: false,
          loading: false,
          recoverable: true,
          ...initialPocketStatus,
        }),
    pocketSynthesize: vi.fn().mockResolvedValue({
      ok: true,
      status: "ready",
      audio: new Float32Array([0, 0.2, -0.2, 0]),
      sampleRate: 24000,
      durationMs: 60,
      requestId: "preview-1",
      ownerToken: "owner-1",
    }),
  };
}

describe("TTSSettings Pocket TTS opt-in UI", () => {
  let container: HTMLDivElement;
  let root: Root;

  const renderSettings = async (
    settings: BlurbySettings,
    onSettingsChange = vi.fn(),
  ) => {
    vi.resetModules();
    const { TTSSettings } = await import("../src/components/settings/TTSSettings");

    await act(async () => {
      root.render(<TTSSettings settings={settings} onSettingsChange={onSettingsChange} />);
      await flushPromises();
    });

    return onSettingsChange;
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    playBufferMock.mockClear();
    (window as any).electronAPI = createElectronApiMock(null);
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        getVoices: () => [],
        addEventListener: () => {},
        removeEventListener: () => {},
        speak: vi.fn(),
        cancel: vi.fn(),
      },
    });
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    delete (window as any).electronAPI;
  });

  it("keeps Kokoro as default while adding Pocket after Nano", async () => {
    await renderSettings(DEFAULT_SETTINGS as BlurbySettings);

    const engineButtons = Array.from(container.querySelectorAll(".tts-engine-toggle button"));
    expect(engineButtons.map((button) => button.textContent?.trim())).toEqual([
      "Qwen AI",
      "System",
      "Kokoro AI (Legacy)",
      "Nano AI (Recommended opt-in)",
      "Pocket TTS (Opt-in)",
    ]);
    expect(TTS_DEFAULT_ENGINE).toBe("kokoro");
    expect((DEFAULT_SETTINGS as BlurbySettings).ttsEngine).toBe("kokoro");
  });

  it("keeps Qwen disabled when Pocket is introduced", async () => {
    await renderSettings(DEFAULT_SETTINGS as BlurbySettings);

    const qwenButton = Array.from(container.querySelectorAll(".tts-engine-toggle button")).find(
      (button) => button.textContent?.includes("Qwen AI"),
    );
    expect(QWEN_TTS_DISABLED).toBe(true);
    expect(qwenButton?.hasAttribute("disabled")).toBe(true);
    expect(qwenButton?.className).not.toContain("active");
    expect(container.textContent).toContain("Qwen is currently disabled.");
  });

  it("selects Pocket only when the Pocket sidecar API exists", async () => {
    (window as any).electronAPI = createElectronApiMock({
      status: "unavailable",
      detail: "Pocket sidecar has not been started",
      reason: "sidecar-not-started",
      ready: false,
      loading: false,
      recoverable: true,
    });
    const onSettingsChange = await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "web",
      ttsVoiceName: null,
    });

    const pocketButton = Array.from(container.querySelectorAll(".tts-engine-toggle button")).find(
      (button) => button.textContent?.includes("Pocket TTS"),
    );
    expect(pocketButton?.hasAttribute("disabled")).toBe(false);

    await act(async () => {
      pocketButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();
    });

    expect(onSettingsChange).toHaveBeenCalledWith({ ttsEngine: "pocket-tts", ttsVoiceName: null });
  });

  it("disables Pocket selection when the sidecar API is unavailable", async () => {
    (window as any).electronAPI = createElectronApiMock(null);

    await renderSettings(DEFAULT_SETTINGS as BlurbySettings);

    const pocketButton = Array.from(container.querySelectorAll(".tts-engine-toggle button")).find(
      (button) => button.textContent?.includes("Pocket TTS"),
    );
    expect(pocketButton?.hasAttribute("disabled")).toBe(true);
    expect(container.textContent).toContain("Pocket sidecar API is unavailable.");
  });

  it("shows Pocket blocked status without enabling preview", async () => {
    (window as any).electronAPI = createElectronApiMock({
      status: "unavailable",
      detail: "Pocket runtime directory is missing",
      reason: "runtime-missing",
      ready: false,
      loading: false,
      recoverable: true,
    });

    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "pocket-tts",
      ttsVoiceName: null,
    });

    expect(container.textContent).toContain("Pocket runtime blocked");
    expect(container.textContent).toContain("Pocket runtime directory is missing");
    const testVoiceButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Test voice"),
    );
    expect(testVoiceButton?.hasAttribute("disabled")).toBe(true);
    expect((window as any).electronAPI.pocketSynthesize).not.toHaveBeenCalled();
  });

  it("previews ready Pocket through pocketStatus and pocketSynthesize", async () => {
    (window as any).electronAPI = createElectronApiMock({
      status: "ready",
      detail: "Pocket sidecar ready",
      reason: null,
      ready: true,
      loading: false,
      recoverable: false,
    });

    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "pocket-tts",
      ttsVoiceName: null,
      ttsRate: 1.1,
    });

    const testVoiceButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Test voice"),
    );
    expect(testVoiceButton?.hasAttribute("disabled")).toBe(false);

    await act(async () => {
      testVoiceButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();
    });

    expect((window as any).electronAPI.pocketStatus).toHaveBeenCalled();
    expect((window as any).electronAPI.pocketSynthesize).toHaveBeenCalledWith({
      text: "The quick brown fox jumps over the lazy dog.",
      voice: "default",
      rate: 1.1,
    });
    expect(playBufferMock).toHaveBeenCalledWith(
      expect.any(Float32Array),
      24000,
      60,
      9,
      undefined,
      expect.any(Function),
    );
  });

  it("normalizes Pocket as selectable while unknown engines fall back to Kokoro", () => {
    expect(normalizeSelectableTtsEngine("pocket-tts")).toBe("pocket-tts");
    expect(normalizeSelectableTtsEngine("qwen")).toBe("kokoro");
    expect(normalizeSelectableTtsEngine("surprise")).toBe("kokoro");
  });

  it("keeps Pocket profile voice internal-only like Nano", () => {
    const profile = profileFromSettings("Pocket", {
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "pocket-tts",
      ttsVoiceName: "should-not-persist",
    });

    expect(profile.ttsEngine).toBe("pocket-tts");
    expect(profile.ttsVoiceName).toBeNull();
  });
});
