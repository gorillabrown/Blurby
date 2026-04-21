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
  const listeners = new Map<string, Set<(value: unknown) => void>>();

  const on = (channel: string, callback: (value: unknown) => void) => {
    if (!listeners.has(channel)) listeners.set(channel, new Set());
    listeners.get(channel)?.add(callback);
    return () => listeners.get(channel)?.delete(callback);
  };

  return {
    api: {
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
      qwenPreflight: vi.fn().mockResolvedValue({
        status: "ready",
        reason: null,
        detail: 'Qwen runtime preflight passed for configured device "cpu".',
        recoverable: false,
        supportedHost: true,
        requestedDevice: "cpu",
        pythonExe: process.execPath,
        modelId: "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
        configPath: "C:\\Users\\estra\\Projects\\Blurby\\.runtime\\qwen\\config.json",
        checkedAt: "2026-04-20T12:00:00.000Z",
        checks: [
          { key: "host", status: "pass", detail: 'Configured Qwen runtime uses device "cpu". CPU-backed narration is allowed in this phase, but startup and synthesis will be slower than CUDA.' },
          { key: "cuda", status: "skip", detail: 'Configured device "cpu" does not require CUDA visibility checks.' },
          { key: "python", status: "pass", detail: "Python executable found." },
        ],
      }),
      qwenVoices: vi.fn().mockResolvedValue({ voices: [] }),
      qwenGenerate: vi.fn().mockResolvedValue({
        audio: new Float32Array([0, 0.25, -0.25, 0]),
        sampleRate: 24000,
        durationMs: 50,
        wordTimestamps: null,
      }),
      onQwenEngineStatus: vi.fn((callback) => on("tts-qwen-engine-status", callback)),
      onQwenRuntimeError: vi.fn((callback) => on("tts-qwen-runtime-error", callback)),
    },
  };
}

describe("Qwen provisioning UI", () => {
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
    (window as any).electronAPI = electronApiMock.api;

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

  it("shows runtime validation and setup guidance actions when Qwen is unavailable", async () => {
    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "qwen",
      ttsVoiceName: null,
    });

    expect(container.textContent).toContain("Validate runtime");
    expect(container.textContent).toContain("View setup guidance");
    expect(container.textContent).toContain("Qwen runtime setup");
    expect(container.textContent).toContain("CPU-backed Qwen can be used for live narration");
  });

  it("runs qwenPreflight and renders deterministic unsupported-host guidance", async () => {
    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "qwen",
      ttsVoiceName: null,
    });

    const validateButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Validate runtime"),
    );
    expect(validateButton).toBeDefined();

    await act(async () => {
      validateButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();
    });

    expect(electronApiMock.api.qwenPreflight).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain("Qwen runtime setup");
    expect(container.textContent).toContain("Qwen runtime preflight passed for configured device \"cpu\"");
    expect(container.textContent).toContain("C:\\Users\\estra\\Projects\\Blurby\\.runtime\\qwen\\config.json");
  });
});
