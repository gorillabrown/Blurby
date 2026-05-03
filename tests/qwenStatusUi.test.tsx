// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_SETTINGS } from "../src/constants";
import type { BlurbySettings } from "../src/types";

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve()).then(() => Promise.resolve());
}

function createElectronApiMock() {
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
      status: "ready",
      detail: "Qwen runtime ready",
      reason: null,
      ready: true,
      loading: false,
      recoverable: false,
    }),
    qwenPreload: vi.fn().mockResolvedValue({ success: true }),
    qwenPreflight: vi.fn(),
    qwenVoices: vi.fn().mockResolvedValue({ voices: ["Ryan"] }),
    qwenGenerate: vi.fn(),
    onQwenEngineStatus: vi.fn(() => () => {}),
    onQwenRuntimeError: vi.fn(() => () => {}),
    nanoStatus: vi.fn().mockResolvedValue({
      ok: true,
      status: "unavailable",
      detail: "Nano sidecar has not been started",
      reason: "sidecar-not-started",
      ready: false,
      loading: false,
      recoverable: true,
    }),
    nanoSynthesize: vi.fn(),
  };
}

describe("Qwen provisioning UI deactivation", () => {
  let container: HTMLDivElement;
  let root: Root;
  let electronApiMock: ReturnType<typeof createElectronApiMock>;

  const renderSettings = async (settings: BlurbySettings) => {
    vi.resetModules();
    const { TTSSettings } = await import("../src/components/settings/TTSSettings");

    await act(async () => {
      root.render(
        <TTSSettings
          settings={settings}
          onSettingsChange={vi.fn()}
        />,
      );
      await flushPromises();
    });
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    electronApiMock = createElectronApiMock();
    (window as any).electronAPI = electronApiMock;

    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        getVoices: () => [],
        addEventListener: () => {},
        removeEventListener: () => {},
        speak: () => {},
        cancel: () => {},
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

  it("does not show Qwen runtime validation controls for a saved Qwen selection", async () => {
    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "qwen",
      ttsVoiceName: null,
    });

    expect(container.textContent).toContain("Qwen is currently disabled.");
    const engineButtons = Array.from(container.querySelectorAll(".tts-engine-toggle button"));
    const kokoroButton = engineButtons.find((button) => button.textContent?.includes("Kokoro AI"));
    const nanoButton = engineButtons.find((button) => button.textContent?.includes("Nano AI"));
    expect(kokoroButton?.className).toContain("active");
    expect(nanoButton?.className).not.toContain("active");
    expect(container.textContent).not.toContain("Nano runtime blocked");
    expect(container.textContent).not.toContain("Validate runtime");
    expect(container.textContent).not.toContain("View setup guidance");
    expect(container.textContent).not.toContain("Qwen runtime setup");
    expect(electronApiMock.qwenPreflight).not.toHaveBeenCalled();
  });
});
