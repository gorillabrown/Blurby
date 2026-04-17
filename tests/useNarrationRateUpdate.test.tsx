// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function flushPromises(): Promise<void> {
  return Promise.resolve().then(() => Promise.resolve()).then(() => Promise.resolve());
}

const kokoroStrategyMock = vi.hoisted(() => {
  const strategy = {
    speakChunk: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    refreshBufferedTempo: vi.fn(),
    warmUp: vi.fn(),
    getScheduler: vi.fn(() => ({
      stop: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
    })),
    getPipeline: vi.fn(() => ({
      acknowledgeChunk: vi.fn(),
    })),
    getAudioProgress: vi.fn(() => null),
  };
  return strategy;
});

vi.mock("../src/hooks/narration/kokoroStrategy", () => ({
  createKokoroStrategy: vi.fn(() => kokoroStrategyMock),
}));

vi.mock("../src/hooks/narration/webSpeechStrategy", () => ({
  createWebSpeechStrategy: vi.fn(() => ({
    speakChunk: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  })),
}));

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
        status: "ready",
        ready: true,
        loading: false,
        detail: null,
        reason: null,
        recoverable: false,
      }),
      kokoroVoices: vi.fn().mockResolvedValue({ voices: ["af_bella"] }),
      kokoroDownload: vi.fn().mockResolvedValue({ ok: true }),
      kokoroPreload: vi.fn().mockResolvedValue({ success: true }),
      onKokoroDownloadProgress: vi.fn((callback) => on("tts-kokoro-download-progress", callback)),
      onKokoroEngineStatus: vi.fn((callback) => on("tts-kokoro-engine-status", callback)),
      onKokoroDownloadError: vi.fn((callback) => on("tts-kokoro-download-error", callback)),
    },
  };
}

describe("useNarration rate updates", () => {
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

    kokoroStrategyMock.speakChunk.mockClear();
    kokoroStrategyMock.stop.mockClear();
    kokoroStrategyMock.pause.mockClear();
    kokoroStrategyMock.resume.mockClear();
    kokoroStrategyMock.refreshBufferedTempo.mockClear();
    kokoroStrategyMock.warmUp.mockClear();
    kokoroStrategyMock.getScheduler.mockClear();
    kokoroStrategyMock.getPipeline.mockClear();
    kokoroStrategyMock.getAudioProgress.mockClear();
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
      root = null;
    }
    container.remove();
    delete (window as any).electronAPI;
  });

  it("keeps same-bucket Kokoro rate changes live without a restart", async () => {
    const harness = await renderHarness();

    await act(async () => {
      harness.getSnapshot()?.setEngine("kokoro");
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(["one", "two", "three"], 0, 180, vi.fn());
      await flushPromises();
    });

    kokoroStrategyMock.speakChunk.mockClear();
    kokoroStrategyMock.stop.mockClear();

    await act(async () => {
      harness.getSnapshot()?.adjustRate(1.3);
      await flushPromises();
    });

    expect(harness.getSnapshot()?.rate).toBe(1.3);
    expect(kokoroStrategyMock.stop).not.toHaveBeenCalled();
    expect(kokoroStrategyMock.speakChunk).not.toHaveBeenCalled();
    expect(kokoroStrategyMock.refreshBufferedTempo).toHaveBeenCalledTimes(1);
  });

  it("restarts Kokoro playback when the requested speed crosses a generation bucket", async () => {
    const harness = await renderHarness();

    await act(async () => {
      harness.getSnapshot()?.setEngine("kokoro");
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(["one", "two", "three"], 0, 180, vi.fn());
      await flushPromises();
    });

    kokoroStrategyMock.speakChunk.mockClear();
    kokoroStrategyMock.stop.mockClear();

    await act(async () => {
      harness.getSnapshot()?.adjustRate(1.4);
      await flushPromises();
    });

    expect(harness.getSnapshot()?.rate).toBe(1.4);
    expect(kokoroStrategyMock.stop).toHaveBeenCalledTimes(1);
    expect(kokoroStrategyMock.speakChunk).toHaveBeenCalledTimes(1);
    expect(kokoroStrategyMock.refreshBufferedTempo).not.toHaveBeenCalled();
  });

  it("clears stale Kokoro state before resuming a paused handoff", async () => {
    const harness = await renderHarness();

    await act(async () => {
      harness.getSnapshot()?.setEngine("kokoro");
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(["zero", "one", "two", "three"], 0, 180, vi.fn());
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.pause();
      await flushPromises();
    });

    kokoroStrategyMock.stop.mockClear();
    kokoroStrategyMock.resume.mockClear();
    kokoroStrategyMock.speakChunk.mockClear();

    await act(async () => {
      harness.getSnapshot()?.updateWords(["two", "three"], 2, { mode: "handoff" });
      await flushPromises();
    });

    expect(kokoroStrategyMock.stop).toHaveBeenCalledTimes(1);

    await act(async () => {
      harness.getSnapshot()?.resume();
      await flushPromises();
    });

    expect(kokoroStrategyMock.stop).toHaveBeenCalledTimes(2);
    expect(kokoroStrategyMock.resume).not.toHaveBeenCalled();
  });
});
