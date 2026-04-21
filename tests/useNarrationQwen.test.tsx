// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function flushPromises(): Promise<void> {
  return Promise.resolve().then(() => Promise.resolve()).then(() => Promise.resolve());
}

const qwenStrategyMock = vi.hoisted(() => ({
  speakChunk: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
}));

vi.mock("../src/hooks/narration/qwenStrategy", () => ({
  createQwenStrategy: vi.fn(() => qwenStrategyMock),
}));

vi.mock("../src/hooks/narration/kokoroStrategy", () => ({
  createKokoroStrategy: vi.fn(() => ({
    speakChunk: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    refreshBufferedTempo: vi.fn(),
    warmUp: vi.fn(),
    getScheduler: vi.fn(() => ({ stop: vi.fn(), pause: vi.fn(), resume: vi.fn() })),
    getPipeline: vi.fn(() => ({ acknowledgeChunk: vi.fn() })),
    getAudioProgress: vi.fn(() => null),
  })),
}));

vi.mock("../src/hooks/narration/webSpeechStrategy", () => ({
  createWebSpeechStrategy: vi.fn(() => ({
    speakChunk: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  })),
}));

function createElectronApiMock(initialQwenStatus = {
  status: "ready",
  detail: "Qwen runtime ready",
  reason: null,
  ready: true,
  loading: false,
  recoverable: false,
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
        ready: false,
        loading: false,
        detail: null,
        reason: null,
        recoverable: false,
      }),
      kokoroVoices: vi.fn().mockResolvedValue({ voices: ["af_bella"] }),
      onKokoroDownloadProgress: vi.fn(() => () => {}),
      onKokoroEngineStatus: vi.fn(() => () => {}),
      onKokoroDownloadError: vi.fn(() => () => {}),
      qwenModelStatus: vi.fn().mockResolvedValue(initialQwenStatus),
      qwenPreload: vi.fn().mockResolvedValue({ success: true }),
      qwenVoices: vi.fn().mockResolvedValue({ voices: ["Ryan", "Aiden"] }),
      onQwenEngineStatus: vi.fn((callback) => on("tts-qwen-engine-status", callback)),
      onQwenRuntimeError: vi.fn((callback) => on("tts-qwen-runtime-error", callback)),
    },
  };
}

describe("useNarration Qwen lane", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

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
    (window as any).electronAPI = createElectronApiMock().api;

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

    qwenStrategyMock.speakChunk.mockClear();
    qwenStrategyMock.stop.mockClear();
    qwenStrategyMock.pause.mockClear();
    qwenStrategyMock.resume.mockClear();
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

  it("starts live narration through the dedicated Qwen strategy when the runtime is ready", async () => {
    const harness = await renderHarness();

    await act(async () => {
      harness.getSnapshot()?.setEngine("qwen");
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(["one", "two", "three"], 0, 180, vi.fn());
      await flushPromises();
    });

    expect(qwenStrategyMock.speakChunk).toHaveBeenCalledTimes(1);
    expect(qwenStrategyMock.stop).toHaveBeenCalledTimes(1);
  });

  it("uses restart-based rate changes and pause/resume through the Qwen strategy", async () => {
    const harness = await renderHarness();

    await act(async () => {
      harness.getSnapshot()?.setEngine("qwen");
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(["one", "two", "three"], 0, 180, vi.fn());
      await flushPromises();
    });

    qwenStrategyMock.speakChunk.mockClear();
    qwenStrategyMock.stop.mockClear();

    await act(async () => {
      harness.getSnapshot()?.adjustRate(1.3);
      await flushPromises();
    });

    expect(qwenStrategyMock.stop).toHaveBeenCalledTimes(1);
    expect(qwenStrategyMock.speakChunk).toHaveBeenCalledTimes(1);

    await act(async () => {
      harness.getSnapshot()?.pause();
      await flushPromises();
    });
    expect(qwenStrategyMock.pause).toHaveBeenCalledTimes(1);

    await act(async () => {
      harness.getSnapshot()?.resume();
      await flushPromises();
    });
    expect(qwenStrategyMock.resume).toHaveBeenCalledTimes(1);
  });

  it("starts Qwen narration immediately when a CPU-backed runtime is already ready", async () => {
    const apiMock = createElectronApiMock({
      status: "ready",
      detail: "Qwen runtime ready for live narration playback",
      reason: null,
      ready: true,
      loading: false,
      recoverable: false,
    });
    (window as any).electronAPI = apiMock.api;

    const harness = await renderHarness();

    await act(async () => {
      harness.getSnapshot()?.setEngine("qwen");
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(["one", "two", "three"], 0, 180, vi.fn());
      await flushPromises();
    });

    expect(qwenStrategyMock.speakChunk).toHaveBeenCalledTimes(1);
    expect(harness.getSnapshot()?.warming).toBe(false);
    expect(harness.getSnapshot()?.qwenError).toBeNull();
  });

  it("does not report speaking while Qwen is only warming", async () => {
    const apiMock = createElectronApiMock({
      status: "idle",
      detail: null,
      reason: null,
      ready: false,
      loading: false,
      recoverable: true,
    });
    apiMock.api.qwenPreload.mockResolvedValue({ success: true });
    (window as any).electronAPI = apiMock.api;

    const harness = await renderHarness();

    await act(async () => {
      harness.getSnapshot()?.setEngine("qwen");
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(["one", "two", "three"], 0, 180, vi.fn());
      await flushPromises();
    });

    expect(harness.getSnapshot()?.warming).toBe(true);
    expect(harness.getSnapshot()?.speaking).toBe(false);
  });

  it("stops active Qwen playback when the engine is switched away from Qwen", async () => {
    const harness = await renderHarness();

    await act(async () => {
      harness.getSnapshot()?.setEngine("qwen");
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(["one", "two", "three"], 0, 180, vi.fn());
      await flushPromises();
    });

    qwenStrategyMock.stop.mockClear();

    await act(async () => {
      harness.getSnapshot()?.setEngine("web");
      await flushPromises();
    });

    expect(qwenStrategyMock.stop).toHaveBeenCalledTimes(1);
  });
});
