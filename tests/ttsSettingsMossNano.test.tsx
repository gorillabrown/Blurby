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
      status: "unavailable",
      detail: "Qwen is retired for Desktop v2 and remains disabled.",
      reason: "qwen-disabled",
      ready: false,
      loading: false,
      recoverable: false,
    }),
    qwenPreload: vi.fn().mockResolvedValue({
      error: "Qwen is retired for Desktop v2 and remains disabled.",
      status: "unavailable",
      reason: "qwen-disabled",
      recoverable: false,
    }),
    qwenVoices: vi.fn().mockResolvedValue({ voices: [] }),
    onQwenEngineStatus: vi.fn(() => () => {}),
    onQwenRuntimeError: vi.fn(() => () => {}),
    nanoStatus: vi.fn().mockResolvedValue({
      ok: false,
      status: "unavailable",
      detail: "MOSS-Nano is dormant for this Kokoro-focused architecture phase and is unavailable.",
      reason: "engine-dormant",
      ready: false,
      loading: false,
      recoverable: false,
    }),
    nanoSynthesize: vi.fn(),
    pocketStatus: vi.fn().mockResolvedValue({
      ok: false,
      status: "unavailable",
      detail: "Pocket TTS is dormant for this Kokoro-focused architecture phase and is unavailable.",
      reason: "engine-dormant",
      ready: false,
      loading: false,
      recoverable: false,
    }),
    pocketSynthesize: vi.fn(),
  };
}

describe("TTSSettings MOSS Nano dormancy UI", () => {
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

    (window as any).electronAPI = createElectronApiMock();
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

  it("shows Nano as dormant and non-selectable while Kokoro stays active", async () => {
    await renderSettings(DEFAULT_SETTINGS as BlurbySettings);

    const engineButtons = Array.from(container.querySelectorAll(".tts-engine-toggle button"));
    expect(engineButtons.map((button) => button.textContent?.trim())).toEqual([
      "Qwen AI (Retired)",
      "System",
      "Kokoro (Default)",
      "MOSS-Nano (Dormant)",
      "Pocket TTS (Dormant)",
    ]);

    const kokoroButton = engineButtons.find((button) => button.textContent?.includes("Kokoro"));
    const nanoButton = engineButtons.find((button) => button.textContent?.includes("MOSS-Nano"));

    expect(kokoroButton?.className).toContain("active");
    expect(nanoButton?.hasAttribute("disabled")).toBe(true);
    expect(container.textContent).toContain("MOSS-Nano is dormant for this Kokoro-focused architecture phase");
  });

  it("does not allow selecting dormant Nano", async () => {
    const onSettingsChange = await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "web",
      ttsVoiceName: null,
    });

    const nanoButton = Array.from(container.querySelectorAll(".tts-engine-toggle button")).find(
      (button) => button.textContent?.includes("MOSS-Nano"),
    );
    expect(nanoButton?.hasAttribute("disabled")).toBe(true);

    await act(async () => {
      nanoButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();
    });

    expect(onSettingsChange).not.toHaveBeenCalledWith(expect.objectContaining({ ttsEngine: "nano" }));
  });
});
