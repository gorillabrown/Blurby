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

describe("TTSSettings Qwen deactivation", () => {
  let container: HTMLDivElement;
  let root: Root;
  let electronApiMock: ReturnType<typeof createElectronApiMock>;

  const renderSettings = async (settings: BlurbySettings, onSettingsChange = vi.fn()) => {
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

    electronApiMock = createElectronApiMock();
    (window as any).electronAPI = electronApiMock;

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

  it("renders Qwen as unavailable for selection even when its runtime reports ready", async () => {
    await renderSettings(DEFAULT_SETTINGS as BlurbySettings);

    const qwenButton = Array.from(container.querySelectorAll(".tts-engine-toggle button")).find(
      (button) => button.textContent?.includes("Qwen AI"),
    );
    expect(qwenButton).toBeDefined();
    expect(qwenButton?.hasAttribute("disabled")).toBe(true);
    expect(qwenButton?.getAttribute("aria-disabled")).toBe("true");
    expect(qwenButton?.className).not.toContain("active");
    expect(container.textContent).toContain("Qwen is currently disabled.");
    expect(container.querySelector('[aria-label="Qwen voice"]')).toBeNull();
  });

  it("normalizes a saved Qwen selection to the Kokoro settings surface", async () => {
    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "qwen",
      ttsVoiceName: "Ryan",
    });

    const engineButtons = Array.from(container.querySelectorAll(".tts-engine-toggle button"));
    const qwenButton = engineButtons.find((button) => button.textContent?.includes("Qwen AI"));
    const kokoroButton = engineButtons.find((button) => button.textContent?.includes("Kokoro AI"));
    const nanoButton = engineButtons.find((button) => button.textContent?.includes("Nano AI"));

    expect(qwenButton?.className).not.toContain("active");
    expect(kokoroButton?.className).toContain("active");
    expect(nanoButton?.className).not.toContain("active");
    expect(container.textContent).not.toContain("Qwen runtime ready");
  });

  it("does not persist Qwen selection or start Qwen preload from the disabled button", async () => {
    const onSettingsChange = await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "web",
      ttsVoiceName: null,
    });

    const qwenButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Qwen AI"),
    );

    await act(async () => {
      qwenButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();
    });

    expect(onSettingsChange).not.toHaveBeenCalledWith(expect.objectContaining({ ttsEngine: "qwen" }));
    expect(electronApiMock.qwenPreload).not.toHaveBeenCalled();
    expect(electronApiMock.qwenGenerate).not.toHaveBeenCalled();
  });
});
