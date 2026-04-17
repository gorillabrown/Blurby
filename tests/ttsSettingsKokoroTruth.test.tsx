// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../src/constants";
import type { BlurbySettings } from "../src/types";

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve()).then(() => Promise.resolve());
}

function createElectronApiMock(initialStatus = { status: "idle", ready: false, loading: false }) {
  const listeners = new Map<string, Set<(value: unknown) => void>>();

  const on = (channel: string, callback: (value: unknown) => void) => {
    if (!listeners.has(channel)) listeners.set(channel, new Set());
    listeners.get(channel)?.add(callback);
    return () => listeners.get(channel)?.delete(callback);
  };

  return {
    api: {
      kokoroModelStatus: vi.fn().mockResolvedValue(initialStatus),
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
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    delete (window as any).electronAPI;
  });

  it("keeps preload failures visible from the initial authoritative snapshot and hides the Kokoro voice picker", async () => {
    electronApiMock = createElectronApiMock({
      status: "error",
      detail: "Warm-up failed before settings mounted",
      reason: "warm-up-failed",
      ready: false,
      loading: false,
      recoverable: false,
    });
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
    expect(container.textContent).toContain("Using Kokoro AI voices.");
  });

  it("keeps direct Kokoro setup retries in a loading state when the IPC result is recoverable", async () => {
    electronApiMock.api.kokoroDownload.mockResolvedValueOnce({
      error: "Worker crashed; retrying bootstrap",
      reason: "worker-crash-retrying",
      status: "retrying",
      recoverable: true,
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
