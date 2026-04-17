// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
      kokoroPreload: vi.fn().mockResolvedValue({ success: true }),
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

describe("useNarration mount", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;
  let electronApiMock: ReturnType<typeof createElectronApiMock>;

  const renderHarness = async () => {
    vi.resetModules();
    const { default: useNarration } = await import("../src/hooks/useNarration");
    let latest: ReturnType<typeof useNarration> | null = null;

    function Harness() {
      latest = useNarration();
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(<Harness />);
      await flushPromises();
    });

    return {
      getSnapshot: () => latest,
    };
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

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

  afterEach(() => {
    if (root) {
      flushSync(() => root?.unmount());
      root = null;
    }
    container.remove();
    delete (window as any).electronAPI;
  });

  it("does not throw during initial render", async () => {
    await expect(renderHarness()).resolves.toBeDefined();
  });

  it("hydrates initial Kokoro error state from the authoritative status snapshot", async () => {
    electronApiMock = createElectronApiMock({
      status: "error",
      detail: "Warm-up failed before listeners attached",
      reason: "warm-up-failed",
      ready: false,
      loading: false,
      recoverable: false,
    });
    (window as any).electronAPI = electronApiMock.api;

    const harness = await renderHarness();
    const snapshot = harness.getSnapshot();

    expect(snapshot).not.toBeNull();
    expect(snapshot?.kokoroReady).toBe(false);
    expect(snapshot?.kokoroStatus).toMatchObject({
      status: "error",
      reason: "warm-up-failed",
      ready: false,
      loading: false,
      recoverable: false,
    });
    expect(snapshot?.kokoroError).toBe("Warm-up failed before listeners attached");
  });

  it("does not mark Kokoro ready from download progress heuristics alone", async () => {
    const harness = await renderHarness();

    await act(async () => {
      await electronApiMock.emit("tts-kokoro-download-progress", 100);
    });

    const snapshot = harness.getSnapshot();
    expect(snapshot).not.toBeNull();
    expect(snapshot?.kokoroDownloadProgress).toBe(100);
    expect(snapshot?.kokoroDownloading).toBe(true);
    expect(snapshot?.kokoroReady).toBe(false);
    expect(snapshot?.kokoroStatus).toMatchObject({
      status: "idle",
      ready: false,
      loading: false,
    });
  });

  it("clears stale ready state when authoritative error and idle snapshots arrive", async () => {
    const harness = await renderHarness();

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

    expect(harness.getSnapshot()?.kokoroReady).toBe(true);

    await act(async () => {
      await electronApiMock.emit("tts-kokoro-engine-status", {
        status: "error",
        detail: "Worker crashed during warm-up",
        reason: "worker-crash-retrying",
        ready: false,
        loading: true,
        recoverable: true,
      });
    });

    expect(harness.getSnapshot()?.kokoroReady).toBe(false);
    expect(harness.getSnapshot()?.kokoroStatus).toMatchObject({
      status: "error",
      reason: "worker-crash-retrying",
      ready: false,
      loading: true,
      recoverable: true,
    });
    expect(harness.getSnapshot()?.kokoroError).toBe("Worker crashed during warm-up");

    await act(async () => {
      await electronApiMock.emit("tts-kokoro-engine-status", {
        status: "idle",
        detail: null,
        reason: null,
        ready: false,
        loading: false,
        recoverable: false,
      });
    });

    expect(harness.getSnapshot()?.kokoroReady).toBe(false);
    expect(harness.getSnapshot()?.kokoroStatus).toMatchObject({
      status: "idle",
      ready: false,
      loading: false,
      recoverable: false,
    });
    expect(harness.getSnapshot()?.kokoroError).toBeNull();
  });

  it("preserves recoverable retrying semantics for direct downloads and keeps terminal failures terminal", async () => {
    electronApiMock.api.kokoroDownload
      .mockResolvedValueOnce({
        error: "Worker crashed; retrying bootstrap",
        reason: "worker-crash-retrying",
        status: "retrying",
        recoverable: true,
      })
      .mockResolvedValueOnce({
        error: "Warm-up failed permanently",
        reason: "warm-up-failed",
        status: "error",
        recoverable: false,
      });

    const harness = await renderHarness();
    const triggerDownload = harness.getSnapshot()?.downloadKokoroModel;
    expect(triggerDownload).toBeTypeOf("function");

    await act(async () => {
      await triggerDownload?.();
      await flushPromises();
    });

    expect(harness.getSnapshot()?.kokoroReady).toBe(false);
    expect(harness.getSnapshot()?.kokoroStatus).toMatchObject({
      status: "retrying",
      reason: "worker-crash-retrying",
      ready: false,
      loading: true,
      recoverable: true,
    });
    expect(harness.getSnapshot()?.kokoroError).toBeNull();

    await act(async () => {
      await triggerDownload?.();
      await flushPromises();
    });

    expect(harness.getSnapshot()?.kokoroReady).toBe(false);
    expect(harness.getSnapshot()?.kokoroStatus).toMatchObject({
      status: "error",
      reason: "warm-up-failed",
      ready: false,
      loading: false,
      recoverable: false,
    });
    expect(harness.getSnapshot()?.kokoroError).toBe("Warm-up failed permanently");
  });

  it("preserves structured terminal reason when the legacy Kokoro error arrives after engine status", async () => {
    const harness = await renderHarness();

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

    expect(harness.getSnapshot()?.kokoroStatus).toMatchObject({
      status: "error",
      reason: "warm-up-failed",
      ready: false,
      loading: false,
      recoverable: false,
    });
    expect(harness.getSnapshot()?.kokoroError).toBe("Warm-up failed during authoritative bootstrap");

    await act(async () => {
      await electronApiMock.emit("tts-kokoro-download-error", "Legacy Kokoro bootstrap error");
    });

    expect(harness.getSnapshot()?.kokoroStatus).toMatchObject({
      status: "error",
      reason: "warm-up-failed",
      ready: false,
      loading: false,
      recoverable: false,
    });
    expect(harness.getSnapshot()?.kokoroError).toBe("Warm-up failed during authoritative bootstrap");
  });

  it("creates a generic terminal snapshot when only the legacy Kokoro error event exists", async () => {
    const harness = await renderHarness();

    await act(async () => {
      await electronApiMock.emit("tts-kokoro-download-error", "Legacy-only Kokoro failure");
    });

    expect(harness.getSnapshot()?.kokoroReady).toBe(false);
    expect(harness.getSnapshot()?.kokoroStatus).toMatchObject({
      status: "error",
      reason: null,
      ready: false,
      loading: false,
      recoverable: false,
    });
    expect(harness.getSnapshot()?.kokoroError).toBe("Legacy-only Kokoro failure");
  });
});
