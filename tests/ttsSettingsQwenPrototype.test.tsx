// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../src/constants";
import type { BlurbySettings } from "../src/types";

const playBufferMock = vi.hoisted(() => vi.fn());

vi.mock("../src/utils/audioPlayer", () => ({
  playBuffer: playBufferMock,
}));

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve()).then(() => Promise.resolve());
}

function createElectronApiMock(initialQwenStatus = {
  status: "unavailable",
  detail: "Qwen runtime config was not found",
  reason: "config-missing",
  ready: false,
  loading: false,
  recoverable: true,
}) {
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
      qwenModelStatus: vi.fn().mockResolvedValue(initialQwenStatus),
      qwenPreload: vi.fn().mockResolvedValue({
        error: initialQwenStatus.detail,
        status: initialQwenStatus.status,
        reason: initialQwenStatus.reason,
        recoverable: initialQwenStatus.recoverable,
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
    async emit(channel: string, payload?: unknown) {
      for (const callback of listeners.get(channel) ?? []) {
        callback(payload);
      }
      await flushPromises();
    },
  };
}

describe("TTSSettings Qwen prototype wiring", () => {
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

  it("shows Qwen as a selectable engine with explicit unavailable state and no voice picker", async () => {
    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "qwen",
      ttsVoiceName: null,
    });

    expect(container.textContent).toContain("Qwen AI");
    expect(container.textContent).toContain("Qwen isn't set up on this machine yet");
    expect(container.textContent).toContain("Blurby could not find the local Qwen runtime configuration.");
    expect(container.querySelector('[aria-label="Qwen voice"]')).toBeNull();

    const testVoiceButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Test voice"),
    );
    expect(testVoiceButton?.hasAttribute("disabled")).toBe(true);
  });

  it("presents Qwen first and labels Kokoro as legacy fallback copy", async () => {
    await renderSettings(DEFAULT_SETTINGS as BlurbySettings);

    const engineButtons = Array.from(container.querySelectorAll(".tts-engine-toggle button"));
    expect(engineButtons.map((button) => button.textContent?.trim())).toEqual([
      "Qwen AI",
      "System",
      "Kokoro AI (Legacy)",
    ]);

    expect(container.textContent).toContain("Qwen is Blurby's default narration engine.");
    expect(container.textContent).toContain("Kokoro remains available as a deprecated fallback while retirement gates are still open.");
  });

  it("shows generic unavailable copy for a configured but not-ready Qwen runtime", async () => {
    electronApiMock = createElectronApiMock({
      status: "ready",
      detail: "Qwen runtime ready",
      reason: null,
      ready: true,
      loading: false,
      recoverable: false,
    });
    electronApiMock.api.qwenVoices.mockResolvedValue({ voices: ["Ryan"] });
    (window as any).electronAPI = electronApiMock.api;

    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "qwen",
      ttsVoiceName: "Ryan",
    });

    expect(container.textContent).toContain("Qwen AI");
    expect(container.textContent).not.toContain("Unsupported Qwen host");
    expect(container.textContent).not.toContain("prototype");
    expect(container.querySelector('[aria-label="Qwen voice"]')).not.toBeNull();
  });

  it("persists Qwen selection and triggers a safe preload instead of silently using another engine", async () => {
    const onSettingsChange = await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "web",
      ttsVoiceName: null,
    });

    const qwenButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Qwen AI"),
    );
    expect(qwenButton).toBeDefined();

    await act(async () => {
      qwenButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();
    });

    expect(onSettingsChange).toHaveBeenCalledWith({ ttsEngine: "qwen", ttsVoiceName: null });
    expect(electronApiMock.api.qwenPreload).toHaveBeenCalledTimes(1);
  });

  it("updates the status copy when Qwen enters warming and then returns to unavailable", async () => {
    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "qwen",
      ttsVoiceName: null,
    });

    await act(async () => {
      await electronApiMock.emit("tts-qwen-engine-status", {
        status: "warming",
        detail: "Checking external Qwen runtime",
        reason: "preload-started",
        ready: false,
        loading: true,
        recoverable: true,
      });
    });

    expect(container.textContent).toContain("Qwen is warming up");
    expect(container.textContent).toContain("Checking external Qwen runtime");

    await act(async () => {
      await electronApiMock.emit("tts-qwen-engine-status", {
        status: "unavailable",
        detail: "Qwen runtime config was not found at C:\\Users\\estra\\Projects\\Blurby\\.runtime\\qwen\\config.json",
        reason: "config-missing",
        ready: false,
        loading: false,
        recoverable: true,
      });
    });

    expect(container.textContent).toContain("Qwen isn't set up on this machine yet");
    expect(container.textContent).toContain("Qwen runtime config was not found at C:\\Users\\estra\\Projects\\Blurby\\.runtime\\qwen\\config.json");
  });

  it("shows runtime-backed voices and uses qwenGenerate for preview once Qwen is ready", async () => {
    electronApiMock = createElectronApiMock({
      status: "ready",
      detail: "Qwen runtime ready",
      reason: null,
      ready: true,
      loading: false,
      recoverable: false,
    });
    electronApiMock.api.qwenVoices.mockResolvedValue({ voices: ["Ryan", "Aiden"] });
    (window as any).electronAPI = electronApiMock.api;

    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "qwen",
      ttsVoiceName: "Ryan",
    });

    expect(container.querySelector('[aria-label="Qwen voice"]')).not.toBeNull();

    const testVoiceButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Test voice"),
    );
    expect(testVoiceButton?.hasAttribute("disabled")).toBe(false);

    await act(async () => {
      testVoiceButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();
    });

    expect(electronApiMock.api.qwenGenerate).toHaveBeenCalledWith(
      "The quick brown fox jumps over the lazy dog.",
      "Ryan",
      1.0,
      undefined,
    );
    expect(playBufferMock).toHaveBeenCalled();
  });
});
