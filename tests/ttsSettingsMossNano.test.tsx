// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../src/constants";
import type { BlurbySettings, MossNanoStatusSnapshot } from "../src/types";

const playBufferMock = vi.hoisted(() => vi.fn());

vi.mock("../src/utils/audioPlayer", () => ({
  playBuffer: playBufferMock,
}));

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve()).then(() => Promise.resolve());
}

function createElectronApiMock(initialNanoStatus?: Partial<MossNanoStatusSnapshot> | null) {
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
    nanoStatus: initialNanoStatus === null
      ? undefined
      : vi.fn().mockResolvedValue({
          ok: true,
          status: "unavailable",
          detail: "Nano sidecar is not running",
          reason: "sidecar-missing",
          ready: false,
          loading: false,
          recoverable: true,
          ...initialNanoStatus,
        }),
    nanoSynthesize: vi.fn().mockResolvedValue({
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

describe("TTSSettings Moss Nano experimental UI", () => {
  let container: HTMLDivElement;
  let root: Root;

  const renderSettings = async (
    settings: BlurbySettings,
    onSettingsChange = vi.fn(),
  ) => {
    vi.resetModules();
    const { TTSSettings } = await import("../src/components/settings/TTSSettings");

    await act(async () => {
      root.render(
        <TTSSettings
          settings={settings}
          onSettingsChange={onSettingsChange}
        />,
      );
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

  it("keeps Qwen as the default while showing Nano as experimental and blocked without the sidecar API", async () => {
    await renderSettings(DEFAULT_SETTINGS as BlurbySettings);

    const engineButtons = Array.from(container.querySelectorAll(".tts-engine-toggle button"));
    expect(engineButtons.map((button) => button.textContent?.trim())).toEqual([
      "Qwen AI",
      "System",
      "Kokoro AI (Legacy)",
      "Nano AI (Experimental)",
    ]);
    expect((DEFAULT_SETTINGS as BlurbySettings).ttsEngine).toBe("qwen");
    expect(container.textContent).toContain("Nano is experimental and requires the local MOSS Nano sidecar.");
    expect(container.textContent).toContain("Nano sidecar API is unavailable.");

    const nanoButton = engineButtons.find((button) => button.textContent?.includes("Nano AI"));
    expect(nanoButton?.hasAttribute("disabled")).toBe(true);
  });

  it("does not present blocked Nano as ready-for-use or previewable", async () => {
    (window as any).electronAPI = createElectronApiMock({
      status: "unavailable",
      detail: "Nano runtime directory is missing",
      reason: "runtime-missing",
      ready: false,
      loading: false,
      recoverable: true,
    });

    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "nano",
      ttsVoiceName: null,
    });

    expect(container.textContent).toContain("Nano runtime blocked");
    expect(container.textContent).toContain("Nano runtime directory is missing");
    expect(container.textContent).toContain("Nano preview becomes available only after the sidecar reports ready.");

    const testVoiceButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Test voice"),
    );
    expect(testVoiceButton?.hasAttribute("disabled")).toBe(true);
    expect((window as any).electronAPI.nanoSynthesize).not.toHaveBeenCalled();
  });

  it("selects Nano only after nanoStatus reports ready", async () => {
    (window as any).electronAPI = createElectronApiMock({
      status: "ready",
      detail: "Nano sidecar ready",
      reason: null,
      ready: true,
      loading: false,
      recoverable: false,
    });

    const onSettingsChange = await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "qwen",
      ttsVoiceName: null,
    });

    const nanoButton = Array.from(container.querySelectorAll(".tts-engine-toggle button")).find(
      (button) => button.textContent?.includes("Nano AI"),
    );
    expect(nanoButton?.hasAttribute("disabled")).toBe(false);

    await act(async () => {
      nanoButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();
    });

    expect(onSettingsChange).toHaveBeenCalledWith({ ttsEngine: "nano", ttsVoiceName: null });
  });

  it("previews ready Nano through nanoStatus and nanoSynthesize without falling back to another engine", async () => {
    (window as any).electronAPI = createElectronApiMock({
      status: "ready",
      detail: "Nano sidecar ready",
      reason: null,
      ready: true,
      loading: false,
      recoverable: false,
    });
    const speak = (window.speechSynthesis?.speak as ReturnType<typeof vi.fn>) ?? vi.fn();

    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "nano",
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

    expect((window as any).electronAPI.nanoStatus).toHaveBeenCalled();
    expect((window as any).electronAPI.nanoSynthesize).toHaveBeenCalledWith({
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
    expect(speak).not.toHaveBeenCalled();
  });
});
