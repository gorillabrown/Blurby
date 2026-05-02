// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function flushPromises(): Promise<void> {
  return Promise.resolve().then(() => Promise.resolve()).then(() => Promise.resolve());
}

const nanoStrategyMock = vi.hoisted(() => ({
  speakChunk: vi.fn(),
  prefetchChunk: vi.fn(() => Promise.resolve({ ok: true, cacheHit: false })),
  setContinuityScope: vi.fn(),
  clearCache: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getAudioProgress: vi.fn(() => null),
  getLastPlaybackTrace: vi.fn(() => null),
}));

const kokoroStrategyMock = vi.hoisted(() => ({
  speakChunk: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  refreshBufferedTempo: vi.fn(),
  warmUp: vi.fn(),
  getScheduler: vi.fn(() => ({ stop: vi.fn(), pause: vi.fn(), resume: vi.fn() })),
  getPipeline: vi.fn(() => ({ acknowledgeChunk: vi.fn() })),
  getAudioProgress: vi.fn(() => null),
}));

const webStrategyMock = vi.hoisted(() => ({
  speakChunk: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
}));

const createMossNanoStrategyMock = vi.hoisted(() => vi.fn(() => nanoStrategyMock));

vi.mock("../src/hooks/narration/mossNanoStrategy", () => ({
  createMossNanoStrategy: createMossNanoStrategyMock,
}));

vi.mock("../src/hooks/narration/kokoroStrategy", () => ({
  createKokoroStrategy: vi.fn(() => kokoroStrategyMock),
}));

vi.mock("../src/hooks/narration/qwenStrategy", () => ({
  createQwenStrategy: vi.fn(() => ({
    speakChunk: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  })),
}));

vi.mock("../src/hooks/narration/qwenStreamingStrategy", () => ({
  createQwenStreamingStrategy: vi.fn(() => ({
    speakChunk: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  })),
}));

vi.mock("../src/hooks/narration/webSpeechStrategy", () => ({
  createWebSpeechStrategy: vi.fn(() => webStrategyMock),
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
      kokoroPreload: vi.fn().mockResolvedValue({ success: true }),
      onKokoroDownloadProgress: vi.fn((callback) => on("tts-kokoro-download-progress", callback)),
      onKokoroEngineStatus: vi.fn((callback) => on("tts-kokoro-engine-status", callback)),
      onKokoroDownloadError: vi.fn((callback) => on("tts-kokoro-download-error", callback)),
      nanoStatus: vi.fn().mockResolvedValue({
        ok: true,
        status: "ready",
        ready: true,
        loading: false,
        recoverable: false,
      }),
    },
  };
}

interface RenderHarnessOptions {
  experimentalNano?: boolean;
}

describe("useNarration experimental Moss Nano lane", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  const renderHarness = async (options: RenderHarnessOptions = {}) => {
    vi.resetModules();
    const { default: useNarration } = await import("../src/hooks/useNarration");
    let latest: ReturnType<typeof useNarration> | null = null;

    function Harness() {
      latest = useNarration(options as any);
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(<Harness />);
      await flushPromises();
    });

    if (options.experimentalNano) {
      await act(async () => {
        latest?.setEngine("nano");
        await flushPromises();
      });
    }

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

    createMossNanoStrategyMock.mockClear();
    nanoStrategyMock.speakChunk.mockClear();
    nanoStrategyMock.prefetchChunk.mockClear();
    nanoStrategyMock.setContinuityScope.mockClear();
    nanoStrategyMock.clearCache.mockClear();
    nanoStrategyMock.stop.mockClear();
    nanoStrategyMock.pause.mockClear();
    nanoStrategyMock.resume.mockClear();
    nanoStrategyMock.getAudioProgress.mockClear();
    kokoroStrategyMock.speakChunk.mockClear();
    kokoroStrategyMock.stop.mockClear();
    kokoroStrategyMock.pause.mockClear();
    kokoroStrategyMock.resume.mockClear();
    kokoroStrategyMock.refreshBufferedTempo.mockClear();
    kokoroStrategyMock.warmUp.mockClear();
    kokoroStrategyMock.getAudioProgress.mockClear();
    webStrategyMock.speakChunk.mockClear();
    webStrategyMock.stop.mockClear();
    webStrategyMock.pause.mockClear();
    webStrategyMock.resume.mockClear();
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

  it("routes cursor-driven chunks to Nano only through the explicit experimental option and Nano engine selection", async () => {
    const harness = await renderHarness({ experimentalNano: true });
    const words = ["nano", "speaks", "segments"];

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(words, 1, 180, vi.fn());
      await flushPromises();
    });

    expect(createMossNanoStrategyMock).toHaveBeenCalledTimes(1);
    expect(nanoStrategyMock.stop).toHaveBeenCalledTimes(1);
    expect(nanoStrategyMock.speakChunk).toHaveBeenCalledTimes(1);
    expect(nanoStrategyMock.speakChunk).toHaveBeenCalledWith(
      "speaks segments",
      ["speaks", "segments"],
      1,
      1.2,
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    );
    expect(webStrategyMock.speakChunk).not.toHaveBeenCalled();
    expect(kokoroStrategyMock.speakChunk).not.toHaveBeenCalled();
  });

  it("does not create or use Nano on the default render/start path", async () => {
    const harness = await renderHarness();

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(["default", "uses", "web"], 0, 180, vi.fn());
      await flushPromises();
    });

    expect(createMossNanoStrategyMock).not.toHaveBeenCalled();
    expect(nanoStrategyMock.speakChunk).not.toHaveBeenCalled();
    expect(webStrategyMock.speakChunk).toHaveBeenCalledTimes(1);
  });

  it("keeps normal TtsEngine flow on Kokoro and never treats nano as a public engine", async () => {
    const harness = await renderHarness({ experimentalNano: true });

    await act(async () => {
      harness.getSnapshot()?.setEngine("kokoro");
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(["kokoro", "stays", "selected"], 0, 180, vi.fn());
      await flushPromises();
    });

    expect(kokoroStrategyMock.speakChunk).toHaveBeenCalledTimes(1);
    expect(nanoStrategyMock.speakChunk).not.toHaveBeenCalled();
  });

  it("cleans up Nano pause/resume/stop only when the experimental strategy is active", async () => {
    const defaultHarness = await renderHarness();

    await act(async () => {
      defaultHarness.getSnapshot()?.startCursorDriven(["plain", "web"], 0, 180, vi.fn());
      defaultHarness.getSnapshot()?.pause();
      defaultHarness.getSnapshot()?.resume();
      defaultHarness.getSnapshot()?.stop();
      await flushPromises();
    });

    expect(createMossNanoStrategyMock).not.toHaveBeenCalled();
    expect(nanoStrategyMock.pause).not.toHaveBeenCalled();
    expect(nanoStrategyMock.resume).not.toHaveBeenCalled();
    expect(nanoStrategyMock.stop).not.toHaveBeenCalled();

    act(() => {
      root?.unmount();
      root = null;
    });
    container.remove();
    container = document.createElement("div");
    document.body.appendChild(container);

    webStrategyMock.stop.mockClear();
    kokoroStrategyMock.stop.mockClear();

    const nanoHarness = await renderHarness({ experimentalNano: true });

    await act(async () => {
      nanoHarness.getSnapshot()?.startCursorDriven(["nano", "cleanup"], 0, 180, vi.fn());
      await flushPromises();
    });

    nanoStrategyMock.stop.mockClear();

    await act(async () => {
      nanoHarness.getSnapshot()?.pause();
      nanoHarness.getSnapshot()?.resume();
      nanoHarness.getSnapshot()?.stop();
      await flushPromises();
    });

    expect(nanoStrategyMock.pause).toHaveBeenCalledTimes(1);
    expect(nanoStrategyMock.resume).toHaveBeenCalledTimes(1);
    expect(nanoStrategyMock.stop).toHaveBeenCalledTimes(1);
    expect(kokoroStrategyMock.pause).not.toHaveBeenCalled();
    expect(kokoroStrategyMock.resume).not.toHaveBeenCalled();
  });

  it("chains from one completed Nano segment to the next chunk", async () => {
    const harness = await renderHarness({ experimentalNano: true });
    const words = ["First.", "Second."];

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(words, 0, 150, vi.fn());
      await flushPromises();
    });

    expect(nanoStrategyMock.speakChunk).toHaveBeenCalledTimes(1);
    expect(nanoStrategyMock.speakChunk.mock.calls[0]).toEqual([
      "First.",
      ["First."],
      0,
      1,
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    ]);

    const completeFirstSegment = nanoStrategyMock.speakChunk.mock.calls[0][5] as () => void;
    await act(async () => {
      completeFirstSegment();
      await flushPromises();
    });

    expect(nanoStrategyMock.speakChunk).toHaveBeenCalledTimes(2);
    expect(nanoStrategyMock.speakChunk.mock.calls[1]).toEqual([
      "Second.",
      ["Second."],
      1,
      1,
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    ]);
  });

  it("stops active Nano playback before restarting on a rate change", async () => {
    const harness = await renderHarness({ experimentalNano: true });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(["nano", "rate", "restart"], 0, 150, vi.fn());
      await flushPromises();
    });

    expect(nanoStrategyMock.speakChunk).toHaveBeenCalledTimes(1);
    nanoStrategyMock.stop.mockClear();

    await act(async () => {
      harness.getSnapshot()?.updateWpm(225);
      await flushPromises();
    });

    expect(nanoStrategyMock.stop).toHaveBeenCalledTimes(1);
    expect(nanoStrategyMock.speakChunk).toHaveBeenCalledTimes(2);
    expect(nanoStrategyMock.speakChunk.mock.calls[1][3]).toBe(1.5);
  });

  it("keeps structured Nano failures in error state instead of overwriting them with idle stop", async () => {
    const harness = await renderHarness({ experimentalNano: true });
    const failure = {
      ok: false,
      error: "Nano sidecar unavailable",
      reason: "sidecar-not-ready",
      status: "unavailable",
      recoverable: true,
    };

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(["nano", "fails"], 0, 150, vi.fn());
      await flushPromises();
    });

    const reportFailure = nanoStrategyMock.speakChunk.mock.calls[0][6] as (error?: unknown) => void;
    await act(async () => {
      reportFailure(failure);
      await flushPromises();
    });

    expect((harness.getSnapshot() as any)?.status).toBe("error");
    expect((harness.getSnapshot() as any)?.nanoError).toEqual(failure);

    await act(async () => {
      harness.getSnapshot()?.pause();
      await flushPromises();
    });

    expect((harness.getSnapshot() as any)?.status).toBe("error");
    expect((harness.getSnapshot() as any)?.nanoError).toEqual(failure);
    expect(nanoStrategyMock.pause).not.toHaveBeenCalled();
    expect(webStrategyMock.pause).not.toHaveBeenCalled();
    expect(kokoroStrategyMock.pause).not.toHaveBeenCalled();
  });

  it("clears Nano ownership when a section-ending segment invokes onSectionEnd", async () => {
    const harness = await renderHarness({ experimentalNano: true });
    const onSectionEnd = vi.fn();

    await act(async () => {
      harness.getSnapshot()?.setOnSectionEnd(onSectionEnd);
      harness.getSnapshot()?.startCursorDriven(["final."], 0, 150, vi.fn());
      await flushPromises();
    });

    const completeFinalSegment = nanoStrategyMock.speakChunk.mock.calls[0][5] as () => void;
    await act(async () => {
      completeFinalSegment();
      await flushPromises();
    });

    expect(onSectionEnd).toHaveBeenCalledTimes(1);

    nanoStrategyMock.pause.mockClear();
    nanoStrategyMock.stop.mockClear();
    nanoStrategyMock.getAudioProgress.mockClear();
    webStrategyMock.pause.mockClear();

    await act(async () => {
      harness.getSnapshot()?.pause();
      harness.getSnapshot()?.getAudioProgress();
      harness.getSnapshot()?.updateWpm(210);
      await flushPromises();
    });

    expect(nanoStrategyMock.pause).not.toHaveBeenCalled();
    expect(nanoStrategyMock.getAudioProgress).not.toHaveBeenCalled();
    expect(nanoStrategyMock.stop).not.toHaveBeenCalled();
    expect(nanoStrategyMock.speakChunk).toHaveBeenCalledTimes(1);
  });

  it("ignores stale Nano onEnd after stop without completing the chunk or ending the section", async () => {
    const harness = await renderHarness({ experimentalNano: true });
    const onWordAdvance = vi.fn();
    const onSectionEnd = vi.fn();

    await act(async () => {
      harness.getSnapshot()?.setOnSectionEnd(onSectionEnd);
      harness.getSnapshot()?.startCursorDriven(["final."], 0, 150, onWordAdvance);
      await flushPromises();
    });

    const staleEnd = nanoStrategyMock.speakChunk.mock.calls[0][5] as () => void;

    await act(async () => {
      harness.getSnapshot()?.stop();
      await flushPromises();
    });

    expect((harness.getSnapshot() as any)?.status).toBe("idle");
    expect((harness.getSnapshot() as any)?.cursorWordIndex).toBe(0);
    nanoStrategyMock.speakChunk.mockClear();

    await act(async () => {
      staleEnd();
      await flushPromises();
    });

    expect((harness.getSnapshot() as any)?.status).toBe("idle");
    expect((harness.getSnapshot() as any)?.cursorWordIndex).toBe(0);
    expect(onWordAdvance).not.toHaveBeenCalled();
    expect(onSectionEnd).not.toHaveBeenCalled();
    expect(nanoStrategyMock.speakChunk).not.toHaveBeenCalled();
  });

  it("ignores stale Nano onError after stop when Nano ownership has been cleared", async () => {
    const harness = await renderHarness({ experimentalNano: true });
    const staleFailure = {
      ok: false,
      error: "Old Nano chunk failed late",
      reason: "late-stale-error",
      status: "error",
      recoverable: true,
    };

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(["old", "chunk"], 0, 150, vi.fn());
      await flushPromises();
    });

    const staleError = nanoStrategyMock.speakChunk.mock.calls[0][6] as (error?: unknown) => void;

    await act(async () => {
      harness.getSnapshot()?.stop();
      await flushPromises();
    });

    expect((harness.getSnapshot() as any)?.status).toBe("idle");
    expect((harness.getSnapshot() as any)?.nanoError).toBeNull();

    await act(async () => {
      staleError(staleFailure);
      await flushPromises();
    });

    expect((harness.getSnapshot() as any)?.status).toBe("idle");
    expect((harness.getSnapshot() as any)?.nanoError).toBeNull();
  });

  it("prefetches the next Nano segment after starting the current one", async () => {
    const harness = await renderHarness({ experimentalNano: true });
    const words = ["First.", "Second.", "Third."];

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(words, 0, 150, vi.fn());
      await flushPromises();
    });

    expect(nanoStrategyMock.speakChunk).toHaveBeenCalledWith(
      "First.",
      ["First."],
      0,
      1,
      expect.any(Function),
      expect.any(Function),
      expect.any(Function),
    );
    expect(nanoStrategyMock.prefetchChunk).toHaveBeenCalledWith(
      "Second.",
      ["Second."],
      1,
      1,
      expect.objectContaining({
        reason: "next-segment",
      }),
    );
  });

  it("prefetches the first segment of the next section before a section-ending segment completes", async () => {
    const harness = await renderHarness({ experimentalNano: true });
    const onSectionEnd = vi.fn();

    await act(async () => {
      harness.getSnapshot()?.setOnSectionEnd(onSectionEnd);
      harness.getSnapshot()?.startCursorDriven(["Final."], 0, 150, vi.fn());
      await flushPromises();
    });

    expect(nanoStrategyMock.prefetchChunk).toHaveBeenCalledWith(
      "Final.",
      ["Final."],
      0,
      1,
      expect.objectContaining({
        reason: "next-section",
      }),
    );
  });

  it("emits Nano segment trace events for request, prefetch, cache, and segment-following anchors", async () => {
    const events: any[] = [];
    const harness = await renderHarness({
      experimentalNano: true,
      evalTrace: {
        enabled: true,
        record: (event: any) => events.push(event),
      },
    } as any);

    nanoStrategyMock.getLastPlaybackTrace.mockReturnValue({
      kind: "nano-segment",
      phase: "playback",
      startIdx: 0,
      endIdx: 1,
      latencyMs: 42,
      cacheHit: false,
      prefetchReady: false,
      timingTruth: "segment-following",
      wordTimestamps: null,
    });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(["First.", "Second."], 0, 150, vi.fn());
      await flushPromises();
    });

    const completeFirst = nanoStrategyMock.speakChunk.mock.calls[0][5] as () => void;
    await act(async () => {
      completeFirst();
      await flushPromises();
    });

    expect(events).toEqual(expect.arrayContaining([
      expect.objectContaining({
        kind: "nano-segment",
        phase: "request",
        startIdx: 0,
        timingTruth: "segment-following",
        wordTimestamps: null,
      }),
      expect.objectContaining({
        kind: "nano-segment",
        phase: "prefetch-start",
        prefetchReady: false,
      }),
      expect.objectContaining({
        kind: "nano-segment",
        phase: "playback",
        latencyMs: 42,
        cacheHit: false,
        timingTruth: "segment-following",
        wordTimestamps: null,
      }),
    ]));
  });

  it("clears Nano cache and ownership on handoff word replacement for cross-book cleanup", async () => {
    const harness = await renderHarness({ experimentalNano: true });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(["Old", "book."], 0, 150, vi.fn());
      await flushPromises();
    });

    nanoStrategyMock.clearCache.mockClear();

    await act(async () => {
      harness.getSnapshot()?.updateWords(["New", "book."], { mode: "handoff" });
      await flushPromises();
    });

    expect(nanoStrategyMock.stop).toHaveBeenCalled();
    expect(nanoStrategyMock.clearCache).toHaveBeenCalledWith(expect.objectContaining({
      reason: "handoff",
    }));
  });
});
