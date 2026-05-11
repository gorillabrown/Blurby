// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../src/constants";
import { KOKORO_UI_SPEEDS } from "../src/utils/kokoroRatePlan";
import type { BlurbySettings } from "../src/types";

const playBufferMock = vi.hoisted(() => vi.fn());
const applyKokoroTempoStretchMock = vi.hoisted(() => vi.fn((input) => ({
  audio: input.audio,
  durationMs: 1234,
  wordTimestamps: input.wordTimestamps,
  applied: true,
})));

vi.mock("../src/utils/audioPlayer", () => ({
  playBuffer: playBufferMock,
}));

vi.mock("../src/utils/audio/tempoStretch", () => ({
  applyKokoroTempoStretch: applyKokoroTempoStretchMock,
}));

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve()).then(() => Promise.resolve());
}

function createKokoroPreflightReport(overrides: Record<string, unknown> = {}) {
  return {
    ok: false,
    status: "download-needed",
    reason: "model-cache-empty",
    detail: null,
    ready: false,
    loading: false,
    recoverable: true,
    offlineReady: false,
    checkedAt: "2026-05-11T05:00:00.000Z",
    model: {
      id: "onnx-community/Kokoro-82M-v1.0-ONNX",
      device: "cpu",
      dtype: "q8",
      cacheLocation: "C:\\Users\\estra\\AppData\\Roaming\\Blurby\\kokoro",
      cacheDir: "C:\\Users\\estra\\AppData\\Roaming\\Blurby\\kokoro",
      modelDir: "C:\\Users\\estra\\AppData\\Roaming\\Blurby\\kokoro\\model",
      configPath: "C:\\Users\\estra\\AppData\\Roaming\\Blurby\\kokoro\\model\\config.json",
      modelAvailable: false,
      configAvailable: false,
      tokenizerAvailable: false,
      missingAssets: ["model weights", "config", "tokenizer"],
    },
    voice: {
      defaultVoice: "af_bella",
      assetPath: "C:\\Users\\estra\\AppData\\Roaming\\Blurby\\kokoro\\voices\\af_bella.bin",
      available: false,
    },
    download: {
      needed: true,
      inProgress: false,
      progress: 0,
      lastError: null,
      retrying: false,
      retryCount: 0,
    },
    engine: {
      status: "idle",
      detail: null,
      reason: null,
      ready: false,
      loading: false,
      recoverable: true,
    },
    checks: [],
    ...overrides,
  };
}

function createElectronApiMock(
  initialStatus: Record<string, unknown> = { status: "idle", ready: false, loading: false },
  initialPreflight: Record<string, unknown> = createKokoroPreflightReport(),
) {
  const listeners = new Map<string, Set<(value: unknown) => void>>();

  const on = (channel: string, callback: (value: unknown) => void) => {
    if (!listeners.has(channel)) listeners.set(channel, new Set());
    listeners.get(channel)?.add(callback);
    return () => listeners.get(channel)?.delete(callback);
  };

  return {
    api: {
      kokoroModelStatus: vi.fn().mockResolvedValue(initialStatus),
      kokoroPreflight: vi.fn().mockResolvedValue(initialPreflight),
      kokoroVoices: vi.fn().mockResolvedValue({ voices: ["af_bella"] }),
      kokoroDownload: vi.fn().mockResolvedValue({ ok: true }),
      kokoroGenerate: vi.fn().mockResolvedValue({ audio: new Float32Array([1]), sampleRate: 24000, durationMs: 10 }),
      onKokoroDownloadProgress: vi.fn((callback) => on("tts-kokoro-download-progress", callback)),
      onKokoroEngineStatus: vi.fn((callback) => on("tts-kokoro-engine-status", callback)),
      onKokoroDownloadError: vi.fn((callback) => on("tts-kokoro-download-error", callback)),
    },
    async emit(channel: string, payload?: unknown) {
      for (const callback of listeners.get(channel) ?? []) {
        callback(payload);
      }
      await flushPromises();
    },
  };
}

describe("TTSSettings Kokoro truth wiring", () => {
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
        pause: () => {},
        resume: () => {},
      },
    });

    playBufferMock.mockClear();
    applyKokoroTempoStretchMock.mockClear();
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    delete (window as any).electronAPI;
  });

  it("keeps preload failures visible from the initial authoritative snapshot and hides the Kokoro voice picker", async () => {
    const errorStatus = {
      status: "error",
      detail: "Warm-up failed before settings mounted",
      reason: "warm-up-failed",
      ready: false,
      loading: false,
      recoverable: false,
    };
    electronApiMock = createElectronApiMock(errorStatus, createKokoroPreflightReport({
      status: "runtime-error",
      reason: "warm-up-failed",
      detail: "Warm-up failed before settings mounted",
      recoverable: false,
      engine: errorStatus,
    }));
    (window as any).electronAPI = electronApiMock.api;

    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "kokoro",
      ttsVoiceName: null,
    });

    expect(container.textContent).toContain("Kokoro unavailable: Warm-up failed before settings mounted");
    expect(container.querySelector('[aria-label="Kokoro voice"]')).toBeNull();
    expect(container.textContent).toContain("Retry Kokoro setup");
  });

  it("runs Kokoro preflight when Kokoro settings mount and treats download-needed as not playable", async () => {
    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "kokoro",
      ttsVoiceName: "af_bella",
    });

    expect(electronApiMock.api.kokoroPreflight).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain("Kokoro download needed");
    expect(container.textContent).toContain("Kokoro needs its local model, config, tokenizer, and default voice assets before playback.");
    expect(container.textContent).toContain("Download voice model (92 MB)");
    expect(container.querySelector('[aria-label="Kokoro voice"]')).toBeNull();
  });

  it("shows missing asset details and keeps the download action available", async () => {
    electronApiMock = createElectronApiMock(
      { status: "idle", ready: false, loading: false },
      createKokoroPreflightReport({
        status: "missing-assets",
        reason: "model-cache-incomplete",
        detail: null,
        model: {
          id: "onnx-community/Kokoro-82M-v1.0-ONNX",
          device: "cpu",
          dtype: "q8",
          cacheLocation: "C:\\Users\\estra\\AppData\\Roaming\\Blurby\\kokoro",
          cacheDir: "C:\\Users\\estra\\AppData\\Roaming\\Blurby\\kokoro",
          modelDir: "C:\\Users\\estra\\AppData\\Roaming\\Blurby\\kokoro\\model",
          configPath: "C:\\Users\\estra\\AppData\\Roaming\\Blurby\\kokoro\\model\\config.json",
          modelAvailable: true,
          configAvailable: false,
          tokenizerAvailable: true,
          missingAssets: ["config"],
        },
        voice: {
          defaultVoice: "af_bella",
          assetPath: "C:\\Users\\estra\\AppData\\Roaming\\Blurby\\kokoro\\voices\\af_bella.bin",
          available: false,
        },
        download: { needed: true, inProgress: false, progress: 0, lastError: null, retrying: false, retryCount: 0 },
      }),
    );
    (window as any).electronAPI = electronApiMock.api;

    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "kokoro",
      ttsVoiceName: null,
    });

    expect(container.textContent).toContain("Kokoro assets missing");
    expect(container.textContent).toContain("Missing config, voice af_bella.");
    expect(container.textContent).toContain("Download voice model (92 MB)");
    expect(container.querySelector('[aria-label="Kokoro voice"]')).toBeNull();
  });

  it("shows failed and runtime-error preflight states as retryable setup failures", async () => {
    const cases = [
      createKokoroPreflightReport({
        status: "download-failed",
        reason: "load-error",
        detail: null,
        download: { needed: true, inProgress: false, progress: 0, lastError: "Network failed while downloading Kokoro.", retrying: false, retryCount: 1 },
      }),
      createKokoroPreflightReport({
        status: "runtime-error",
        reason: "runtime-dependency-missing",
        detail: "Kokoro runtime dependency or packaged voice asset is missing.",
        recoverable: false,
        download: { needed: false, inProgress: false, progress: 0, lastError: null, retrying: false, retryCount: 0 },
      }),
    ];

    for (const report of cases) {
      await act(async () => {
        root.unmount();
      });
      container.textContent = "";
      root = createRoot(container);
      electronApiMock = createElectronApiMock({ status: "idle", ready: false, loading: false }, report);
      (window as any).electronAPI = electronApiMock.api;

      await renderSettings({
        ...(DEFAULT_SETTINGS as BlurbySettings),
        ttsEngine: "kokoro",
        ttsVoiceName: null,
      });

      expect(container.textContent).toContain(
        report.status === "download-failed" ? "Kokoro download failed" : "Kokoro runtime unavailable",
      );
      expect(container.textContent).toContain(
        report.status === "download-failed"
          ? "Network failed while downloading Kokoro."
          : "Kokoro runtime dependency or packaged voice asset is missing.",
      );
      expect(container.textContent).toContain("Retry Kokoro setup (92 MB)");
      expect(container.querySelector('[aria-label="Kokoro voice"]')).toBeNull();
    }
  });

  it("shows offline-ready preflight as locally playable without offering download", async () => {
    electronApiMock = createElectronApiMock(
      { status: "idle", ready: false, loading: false },
      createKokoroPreflightReport({
        ok: true,
        status: "offline-ready",
        reason: null,
        detail: null,
        recoverable: false,
        offlineReady: true,
        model: {
          id: "onnx-community/Kokoro-82M-v1.0-ONNX",
          device: "cpu",
          dtype: "q8",
          cacheLocation: "C:\\Users\\estra\\AppData\\Roaming\\Blurby\\kokoro",
          cacheDir: "C:\\Users\\estra\\AppData\\Roaming\\Blurby\\kokoro",
          modelDir: "C:\\Users\\estra\\AppData\\Roaming\\Blurby\\kokoro\\model",
          configPath: "C:\\Users\\estra\\AppData\\Roaming\\Blurby\\kokoro\\model\\config.json",
          modelAvailable: true,
          configAvailable: true,
          tokenizerAvailable: true,
          missingAssets: [],
        },
        voice: {
          defaultVoice: "af_bella",
          assetPath: "C:\\Users\\estra\\AppData\\Roaming\\Blurby\\kokoro\\voices\\af_bella.bin",
          available: true,
        },
        download: { needed: false, inProgress: false, progress: 0, lastError: null, retrying: false, retryCount: 0 },
      }),
    );
    (window as any).electronAPI = electronApiMock.api;

    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "kokoro",
      ttsVoiceName: null,
    });

    expect(container.textContent).toContain("Kokoro ready offline");
    expect(container.textContent).toContain("Offline-ready: required Kokoro assets are present in the local cache.");
    expect(container.textContent).not.toContain("Download voice model");
    expect(container.textContent).not.toContain("Retry Kokoro setup");
  });

  it("does not unlock Kokoro voices when download progress reaches 100 without a ready snapshot", async () => {
    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "kokoro",
      ttsVoiceName: null,
    });

    await act(async () => {
      await electronApiMock.emit("tts-kokoro-download-progress", 100);
    });

    expect(container.textContent).toContain("Downloading voice model... 100%");
    expect(container.querySelector('[aria-label="Kokoro voice"]')).toBeNull();

    await act(async () => {
      await electronApiMock.emit("tts-kokoro-engine-status", {
        status: "ready",
        detail: null,
        reason: null,
        ready: true,
        loading: false,
        recoverable: false,
      });
    });

    expect(container.querySelector('[aria-label="Kokoro voice"]')).not.toBeNull();
    expect(container.textContent).toContain("Using default Kokoro voices.");
  });

  it("shows the full Kokoro speed ladder once the engine is ready", async () => {
    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "kokoro",
      ttsVoiceName: "af_bella",
      ttsRate: 1.3,
    });

    await act(async () => {
      await electronApiMock.emit("tts-kokoro-engine-status", {
        status: "ready",
        detail: null,
        reason: null,
        ready: true,
        loading: false,
        recoverable: false,
      });
    });

    const speedButtons = Array.from(container.querySelectorAll(".tts-rate-bucket-toggle button"));
    expect(speedButtons.map((button) => button.textContent?.trim())).toEqual(
      KOKORO_UI_SPEEDS.map((speed) => `${speed.toFixed(1)}x`),
    );
    expect(speedButtons.find((button) => button.className.includes("active"))?.textContent?.trim()).toBe("1.3x");
  });

  it("routes Kokoro test preview through the rate plan so exact UI speed survives bucketed generation", async () => {
    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "kokoro",
      ttsVoiceName: "af_bella",
      ttsRate: 1.3,
    });

    await act(async () => {
      await electronApiMock.emit("tts-kokoro-engine-status", {
        status: "ready",
        detail: null,
        reason: null,
        ready: true,
        loading: false,
        recoverable: false,
      });
    });

    const testVoiceButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Test voice"),
    );
    expect(testVoiceButton).toBeDefined();

    await act(async () => {
      testVoiceButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();
    });

    expect(electronApiMock.api.kokoroGenerate).toHaveBeenCalledWith(
      "The quick brown fox jumps over the lazy dog.",
      "af_bella",
      1.2,
    );
    expect(applyKokoroTempoStretchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        durationMs: 10,
        sampleRate: 24000,
        kokoroRatePlan: expect.objectContaining({
          selectedSpeed: 1.3,
          generationBucket: 1.2,
          tempoFactor: 1.3 / 1.2,
        }),
      }),
    );
    expect(playBufferMock).toHaveBeenCalledWith(
      expect.any(Float32Array),
      24000,
      1234,
      9,
      undefined,
      expect.any(Function),
    );
  });

  it("keeps direct Kokoro setup retries in a loading state when the IPC result is recoverable", async () => {
    electronApiMock.api.kokoroDownload.mockResolvedValueOnce({
      error: "Worker crashed; retrying bootstrap",
      reason: "worker-crash-retrying",
      status: "retrying",
      recoverable: true,
    });
    electronApiMock.api.kokoroPreflight.mockResolvedValueOnce(createKokoroPreflightReport()).mockResolvedValue({
      ok: false,
      status: "loading",
      reason: "worker-crash-retrying",
      detail: "Retrying Kokoro setup...",
      ready: false,
      loading: true,
      recoverable: true,
      offlineReady: false,
      checkedAt: "2026-05-11T05:00:00.000Z",
      checks: [],
      engine: {
        status: "retrying",
        detail: "Worker crashed; retrying bootstrap",
        reason: "worker-crash-retrying",
        ready: false,
        loading: true,
        recoverable: true,
      },
    });

    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "kokoro",
      ttsVoiceName: null,
    });

    const downloadButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Download voice model"),
    );
    expect(downloadButton).toBeDefined();

    await act(async () => {
      downloadButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();
    });

    expect(container.textContent).toContain("Retrying Kokoro setup...");
    expect(container.textContent).not.toContain("Kokoro unavailable:");
    expect(container.querySelector('[aria-label="Kokoro voice"]')).toBeNull();
    expect(
      Array.from(container.querySelectorAll("button")).some((button) =>
        button.textContent?.includes("Download voice model"),
      ),
    ).toBe(false);
  });

  it("keeps the existing structured terminal snapshot visible when a legacy Kokoro error follows", async () => {
    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "kokoro",
      ttsVoiceName: null,
    });

    await act(async () => {
      await electronApiMock.emit("tts-kokoro-engine-status", {
        status: "error",
        detail: "Warm-up failed during authoritative bootstrap",
        reason: "warm-up-failed",
        ready: false,
        loading: false,
        recoverable: false,
      });
    });

    expect(container.textContent).toContain("Kokoro unavailable: Warm-up failed during authoritative bootstrap");

    await act(async () => {
      await electronApiMock.emit("tts-kokoro-download-error", "Legacy Kokoro bootstrap error");
    });

    expect(container.textContent).toContain("Kokoro unavailable: Warm-up failed during authoritative bootstrap");
    expect(container.textContent).not.toContain("Legacy Kokoro bootstrap error");
    expect(container.querySelector('[aria-label="Kokoro voice"]')).toBeNull();
    expect(container.textContent).toContain("Retry Kokoro setup");
  });

  it("falls back to a generic terminal snapshot when only the legacy Kokoro error event exists", async () => {
    await renderSettings({
      ...(DEFAULT_SETTINGS as BlurbySettings),
      ttsEngine: "kokoro",
      ttsVoiceName: null,
    });

    await act(async () => {
      await electronApiMock.emit("tts-kokoro-download-error", "Legacy-only Kokoro failure");
    });

    expect(container.textContent).toContain("Kokoro unavailable: Legacy-only Kokoro failure");
    expect(container.querySelector('[aria-label="Kokoro voice"]')).toBeNull();
    expect(container.textContent).toContain("Retry Kokoro setup");
  });
});
