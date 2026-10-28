// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TtsEvalTraceInputEvent, TtsEvalTraceSink } from "../src/types/eval";

function flushPromises(): Promise<void> {
  return Promise.resolve().then(() => Promise.resolve()).then(() => Promise.resolve());
}

const kokoroStrategyMock = vi.hoisted(() => {
  const strategy = {
    speakChunk: vi.fn((
      _text: string,
      _words: string[],
      startIdx: number,
      speed: number,
      onWordAdvance: (wordIndex: number) => void,
      onEnd: () => void,
      onError: () => void,
    ) => {
      kokoroStrategyDriver.captureSpeak(startIdx, speed, onWordAdvance, onEnd, onError);
    }),
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
    getAudioProgress: vi.fn(() => kokoroStrategyDriver.getAudioProgress()),
  };
  return strategy;
});

const kokoroStrategyDriver = vi.hoisted(() => {
  let latestDeps: { onTruthSync?: (wordIndex: number) => void; onSegmentStart?: (wordIndex: number) => void } | null = null;
  let latestSpeak:
    | {
        startIdx: number;
        speed: number;
        onWordAdvance: (wordIndex: number) => void;
        onEnd: () => void;
        onError: () => void;
      }
    | null = null;
  let audioProgress: { wordIndex: number; fractionInWord: number } | null = null;

  return {
    captureDeps(deps: { onTruthSync?: (wordIndex: number) => void; onSegmentStart?: (wordIndex: number) => void }) {
      latestDeps = deps;
    },
    captureSpeak(
      startIdx: number,
      speed: number,
      onWordAdvance: (wordIndex: number) => void,
      onEnd: () => void,
      onError: () => void,
    ) {
      latestSpeak = { startIdx, speed, onWordAdvance, onEnd, onError };
    },
    emitWord(wordIndex: number) {
      latestSpeak?.onWordAdvance(wordIndex);
    },
    emitTruthSync(wordIndex: number) {
      latestDeps?.onTruthSync?.(wordIndex);
    },
    emitSegmentStart(wordIndex: number) {
      latestDeps?.onSegmentStart?.(wordIndex);
    },
    setAudioProgress(progress: { wordIndex: number; fractionInWord: number } | null) {
      audioProgress = progress;
    },
    getAudioProgress() {
      return audioProgress;
    },
    getLatestSpeak() {
      return latestSpeak;
    },
    reset() {
      latestDeps = null;
      latestSpeak = null;
      audioProgress = null;
    },
  };
});

vi.mock("../src/hooks/narration/kokoroStrategy", () => ({
  createKokoroStrategy: vi.fn((deps) => {
    kokoroStrategyDriver.captureDeps(deps);
    return kokoroStrategyMock;
  }),
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

interface RenderHarnessOptions {
  evalTrace?: TtsEvalTraceSink | null;
}

describe("useNarration rate updates", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;
  let electronApiMock: ReturnType<typeof createElectronApiMock>;

  const renderHarness = async (options: RenderHarnessOptions = {}) => {
    vi.resetModules();
    const { default: useNarration } = await import("../src/hooks/useNarration");
    let latest: ReturnType<typeof useNarration> | null = null;

    function Harness() {
      latest = useNarration(options);
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
    kokoroStrategyDriver.reset();
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

  it("keeps segmented Kokoro continuity live across a non-final seam during same-bucket rate changes", async () => {
    const harness = await renderHarness();
    const heardWords: number[] = [];
    const truthSyncWords: number[] = [];

    await act(async () => {
      harness.getSnapshot()?.setEngine("kokoro");
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.setOnTruthSync?.((wordIndex) => {
        truthSyncWords.push(wordIndex);
      });
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(
        ["zero", "one", "two", "three", "four", "five"],
        0,
        180,
        (wordIndex) => {
          heardWords.push(wordIndex);
        },
      );
      await flushPromises();
    });

    expect(kokoroStrategyDriver.getLatestSpeak()?.startIdx).toBe(0);

    await act(async () => {
      kokoroStrategyDriver.emitWord(1);
      await flushPromises();
    });

    kokoroStrategyMock.stop.mockClear();
    kokoroStrategyMock.speakChunk.mockClear();
    kokoroStrategyMock.refreshBufferedTempo.mockClear();

    await act(async () => {
      harness.getSnapshot()?.adjustRate(1.3);
      await flushPromises();
    });

    expect(kokoroStrategyMock.stop).not.toHaveBeenCalled();
    expect(kokoroStrategyMock.speakChunk).not.toHaveBeenCalled();
    expect(kokoroStrategyMock.refreshBufferedTempo).toHaveBeenCalledTimes(1);

    await act(async () => {
      kokoroStrategyDriver.setAudioProgress({ wordIndex: 2, fractionInWord: 0.25 });
      kokoroStrategyDriver.emitTruthSync(2);
      await flushPromises();
    });

    expect(truthSyncWords).toEqual([2]);
    expect(harness.getSnapshot()?.getAudioProgress?.()?.wordIndex).toBe(2);

    await act(async () => {
      kokoroStrategyDriver.emitWord(2);
      kokoroStrategyDriver.emitWord(3);
      await flushPromises();
    });

    expect(heardWords).toEqual([1, 2, 3]);
    expect(harness.getSnapshot()?.cursorWordIndex).toBe(3);
  });

  it("emits a runtime rate-response transition for segmented same-bucket Kokoro rate changes", async () => {
    const evalEvents: TtsEvalTraceInputEvent[] = [];
    const harness = await renderHarness({
      evalTrace: {
        enabled: true,
        record: (event) => evalEvents.push(event),
      },
    });

    await act(async () => {
      harness.getSnapshot()?.setEngine("kokoro");
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(
        ["zero", "one", "two", "three", "four", "five"],
        0,
        180,
        vi.fn(),
      );
      await flushPromises();
    });

    await act(async () => {
      kokoroStrategyDriver.emitWord(1);
      await flushPromises();
    });

    expect(evalEvents).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "lifecycle", state: "start", wordIndex: 0 }),
      expect.objectContaining({ kind: "lifecycle", state: "first-audio", wordIndex: 1, latencyMs: expect.any(Number) }),
      expect.objectContaining({ kind: "word", source: "audio", wordIndex: 1 }),
    ]));

    await act(async () => {
      harness.getSnapshot()?.adjustRate(1.3);
      await flushPromises();
    });

    await act(async () => {
      kokoroStrategyDriver.emitSegmentStart(2);
      await flushPromises();
    });

    const rateResponseEvent = evalEvents.find(
      (event) => event.kind === "transition" && event.transition === "rate-response",
    );

    expect(rateResponseEvent).toEqual(expect.objectContaining({
      kind: "transition",
      transition: "rate-response",
      context: expect.stringContaining("same-bucket"),
      latencyMs: expect.any(Number),
    }));
  });

  it("emits only one pending rate-response transition across consecutive same-bucket edits", async () => {
    const evalEvents: TtsEvalTraceInputEvent[] = [];
    const harness = await renderHarness({
      evalTrace: {
        enabled: true,
        record: (event) => evalEvents.push(event),
      },
    });

    await act(async () => {
      harness.getSnapshot()?.setEngine("kokoro");
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(
        ["zero", "one", "two", "three", "four", "five"],
        0,
        195,
        vi.fn(),
      );
      await flushPromises();
    });

    await act(async () => {
      kokoroStrategyDriver.emitWord(1);
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.adjustRate(1.2);
      harness.getSnapshot()?.adjustRate(1.3);
      await flushPromises();
    });

    expect(kokoroStrategyMock.refreshBufferedTempo).toHaveBeenCalledTimes(2);

    await act(async () => {
      kokoroStrategyDriver.emitSegmentStart(2);
      await flushPromises();
    });

    const rateResponseEvents = evalEvents.filter(
      (event) => event.kind === "transition" && event.transition === "rate-response",
    );

    expect(rateResponseEvents).toHaveLength(1);
    expect(rateResponseEvents[0]).toEqual(expect.objectContaining({
      from: 1.2,
      to: 1.3,
      context: "same-bucket-segmented-live-rate",
    }));
  });

  it("clears a pending rate-response trace when a handoff restart replaces the live Kokoro chain", async () => {
    const evalEvents: TtsEvalTraceInputEvent[] = [];
    const harness = await renderHarness({
      evalTrace: {
        enabled: true,
        record: (event) => evalEvents.push(event),
      },
    });

    await act(async () => {
      harness.getSnapshot()?.setEngine("kokoro");
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(
        ["zero", "one", "two", "three", "four", "five"],
        0,
        180,
        vi.fn(),
      );
      await flushPromises();
    });

    await act(async () => {
      kokoroStrategyDriver.emitWord(1);
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.adjustRate(1.3);
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.updateWords(["two", "three", "four", "five"], 2, { mode: "handoff" });
      await flushPromises();
    });

    await act(async () => {
      kokoroStrategyDriver.emitSegmentStart(2);
      await flushPromises();
    });

    const rateResponseEvents = evalEvents.filter(
      (event) => event.kind === "transition" && event.transition === "rate-response",
    );

    expect(kokoroStrategyMock.stop).toHaveBeenCalled();
    expect(rateResponseEvents).toHaveLength(0);
  });

  it("clears a pending rate-response trace when narration pauses before the refreshed segment starts", async () => {
    const evalEvents: TtsEvalTraceInputEvent[] = [];
    const harness = await renderHarness({
      evalTrace: {
        enabled: true,
        record: (event) => evalEvents.push(event),
      },
    });

    await act(async () => {
      harness.getSnapshot()?.setEngine("kokoro");
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(
        ["zero", "one", "two", "three", "four", "five"],
        0,
        180,
        vi.fn(),
      );
      await flushPromises();
    });

    await act(async () => {
      kokoroStrategyDriver.emitWord(1);
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.adjustRate(1.3);
      harness.getSnapshot()?.pause();
      await flushPromises();
    });

    await act(async () => {
      kokoroStrategyDriver.emitSegmentStart(2);
      await flushPromises();
    });

    const rateResponseEvents = evalEvents.filter(
      (event) => event.kind === "transition" && event.transition === "rate-response",
    );

    expect(rateResponseEvents).toHaveLength(0);
  });

  it("does not carry a stale pending rate-response trace across pause and resume", async () => {
    const evalEvents: TtsEvalTraceInputEvent[] = [];
    const harness = await renderHarness({
      evalTrace: {
        enabled: true,
        record: (event) => evalEvents.push(event),
      },
    });

    await act(async () => {
      harness.getSnapshot()?.setEngine("kokoro");
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(
        ["zero", "one", "two", "three", "four", "five"],
        0,
        180,
        vi.fn(),
      );
      await flushPromises();
    });

    await act(async () => {
      kokoroStrategyDriver.emitWord(1);
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.adjustRate(1.3);
      harness.getSnapshot()?.pause();
      harness.getSnapshot()?.resume();
      await flushPromises();
    });

    await act(async () => {
      kokoroStrategyDriver.emitSegmentStart(2);
      await flushPromises();
    });

    const rateResponseEvents = evalEvents.filter(
      (event) => event.kind === "transition" && event.transition === "rate-response",
    );

    expect(rateResponseEvents).toHaveLength(0);
  });
});
