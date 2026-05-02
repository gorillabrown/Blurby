// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

const schedulerMock = vi.hoisted(() => ({
  warmUp: vi.fn(),
  scheduleChunk: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  refreshBufferedTempo: vi.fn(),
  stop: vi.fn(),
  isPlaying: vi.fn(() => true),
  setCallbacks: vi.fn(),
  markPipelineDone: vi.fn(),
  getContext: vi.fn(() => null),
  getAudioProgress: vi.fn(() => null),
}));

const electronAPI = vi.hoisted(() => {
  const api = {
    nanoStatus: vi.fn(),
    nanoSynthesize: vi.fn(),
    nanoCancel: vi.fn(),
  };
  (globalThis as any).window = (globalThis as any).window || {};
  (globalThis as any).window.electronAPI = api;
  return api;
});

vi.mock("../src/utils/audioScheduler", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/utils/audioScheduler")>();
  return {
    ...actual,
    createAudioScheduler: vi.fn(() => schedulerMock),
  };
});

import {
  createMossNanoStrategy,
  type MossNanoStrategyDeps,
} from "../src/hooks/narration/mossNanoStrategy";
import type { MossNanoSynthesizeResult } from "../src/types";

const words = ["MOSS", "Nano", "keeps", "segment", "truth."];

function makeDeps(overrides?: Partial<MossNanoStrategyDeps>): MossNanoStrategyDeps {
  return {
    getVoiceId: vi.fn(() => "default"),
    getWords: vi.fn(() => words),
    onStatus: vi.fn(),
    onError: vi.fn(),
    ...overrides,
  } as MossNanoStrategyDeps;
}

function successfulSynthesis(overrides?: Record<string, unknown>) {
  return {
    ok: true,
    requestId: "nano-req-1",
    audio: new Float32Array(2400),
    sampleRate: 24000,
    durationMs: 100,
    ...overrides,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, resolve, reject };
}

describe("createMossNanoStrategy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    schedulerMock.isPlaying.mockReturnValue(true);
    electronAPI.nanoStatus.mockResolvedValue({
      ok: true,
      status: "ready",
      ready: true,
      loading: false,
      recoverable: false,
      detail: "resident runtime warm",
    });
    electronAPI.nanoSynthesize.mockResolvedValue(successfulSynthesis());
    electronAPI.nanoCancel.mockResolvedValue({
      ok: true,
      cancelled: true,
      requestId: "nano-req-1",
    });
  });

  it("checks and propagates Nano readiness before synthesizing when status IPC is available", async () => {
    const status = {
      ok: true,
      status: "ready",
      ready: true,
      loading: false,
      recoverable: false,
      detail: "ready from resident sidecar",
    };
    electronAPI.nanoStatus.mockResolvedValue(status);
    const deps = makeDeps();
    const strategy = createMossNanoStrategy(deps);

    strategy.speakChunk("MOSS Nano speaks.", words, 12, 1.25, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(electronAPI.nanoSynthesize).toHaveBeenCalled());
    expect(electronAPI.nanoStatus).toHaveBeenCalledTimes(1);
    expect(deps.onStatus).toHaveBeenCalledWith(status);
    expect(electronAPI.nanoStatus.mock.invocationCallOrder[0])
      .toBeLessThan(electronAPI.nanoSynthesize.mock.invocationCallOrder[0]);
  });

  it("sends text, rate, and voice to nanoSynthesize", async () => {
    const deps = makeDeps({ getVoiceId: vi.fn(() => "serena") });
    const strategy = createMossNanoStrategy(deps);

    strategy.speakChunk("MOSS Nano speaks.", words, 12, 1.4, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(electronAPI.nanoSynthesize).toHaveBeenCalled());
    expect(electronAPI.nanoSynthesize).toHaveBeenCalledWith({
      text: "MOSS Nano speaks.",
      voice: "serena",
      rate: 1.4,
    });
  });

  it("schedules returned audio as one segment-following playback chunk without word timestamps", async () => {
    const audio = new Float32Array([0.1, 0.2, 0.3, 0.4]);
    electronAPI.nanoSynthesize.mockResolvedValue(successfulSynthesis({
      audio,
      sampleRate: 24000,
      durationMs: 25,
    }));
    const strategy = createMossNanoStrategy(makeDeps());

    strategy.speakChunk("MOSS Nano speaks.", words, 12, 1.0, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(schedulerMock.scheduleChunk).toHaveBeenCalledTimes(1));
    expect(schedulerMock.play).toHaveBeenCalled();

    const chunk = schedulerMock.scheduleChunk.mock.calls[0][0] as any;
    expect(chunk).toMatchObject({
      audio,
      sampleRate: 24000,
      durationMs: 25,
      words,
      startIdx: 12,
      timingTruth: "segment-following",
    });
    expect(chunk.wordTimestamps).toBeNull();
  });

  it("marks the scheduler pipeline done after scheduling Nano segment audio so playback end can fire", async () => {
    const strategy = createMossNanoStrategy(makeDeps());

    strategy.speakChunk("MOSS Nano speaks.", words, 12, 1.0, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(schedulerMock.scheduleChunk).toHaveBeenCalledTimes(1));
    expect(schedulerMock.markPipelineDone).toHaveBeenCalledTimes(1);
    expect(schedulerMock.markPipelineDone.mock.invocationCallOrder[0])
      .toBeGreaterThan(schedulerMock.scheduleChunk.mock.invocationCallOrder[0]);
  });

  it("uses the public Nano synth result contract with scheduler-ready PCM audio", async () => {
    const ipcResult: MossNanoSynthesizeResult = {
      ok: true,
      requestId: "nano-public-audio-1",
      audio: new Float32Array([0.05, 0.1, 0.15]),
      sampleRate: 24000,
      durationMs: 30,
    };
    electronAPI.nanoSynthesize.mockResolvedValue(ipcResult);
    const strategy = createMossNanoStrategy(makeDeps());

    strategy.speakChunk("MOSS Nano speaks.", words, 12, 1.0, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(schedulerMock.scheduleChunk).toHaveBeenCalledTimes(1));
    expect(schedulerMock.scheduleChunk.mock.calls[0][0]).toMatchObject({
      audio: ipcResult.audio,
      sampleRate: 24000,
      durationMs: 30,
      timingTruth: "segment-following",
    });
  });

  it("reports a structured failure when Nano returns success without scheduler-usable audio", async () => {
    electronAPI.nanoSynthesize.mockResolvedValue({
      ok: true,
      requestId: "nano-missing-audio-1",
      outputPath: "C:\\fake\\nano-missing-audio-1.wav",
      sampleRate: 24000,
      durationMs: 30,
    });
    const onError = vi.fn();
    const strategy = createMossNanoStrategy(makeDeps());

    strategy.speakChunk("MOSS Nano speaks.", words, 12, 1.0, vi.fn(), vi.fn(), onError);

    await vi.waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      ok: false,
      requestId: "nano-missing-audio-1",
      reason: "missing-audio",
      recoverable: true,
    }));
    expect(schedulerMock.scheduleChunk).not.toHaveBeenCalled();
    expect(schedulerMock.play).not.toHaveBeenCalled();
  });

  it("does not fabricate wordTimestamps when Nano returns only segment-level timing", async () => {
    electronAPI.nanoSynthesize.mockResolvedValue(successfulSynthesis({
      wordTimestamps: undefined,
    }));
    const strategy = createMossNanoStrategy(makeDeps());

    strategy.speakChunk("MOSS Nano speaks.", words, 12, 1.0, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(schedulerMock.scheduleChunk).toHaveBeenCalledTimes(1));

    const chunk = schedulerMock.scheduleChunk.mock.calls[0][0] as any;
    expect(chunk.timingTruth).toBe("segment-following");
    expect(chunk.wordTimestamps ?? null).toBeNull();
  });

  it("routes structured Nano synthesis failures through onError and preserves failure details", async () => {
    const failure = {
      ok: false,
      error: "Nano sidecar unavailable",
      reason: "sidecar-not-ready",
      status: "unavailable",
      recoverable: true,
    };
    electronAPI.nanoSynthesize.mockResolvedValue(failure);
    const deps = makeDeps();
    const onError = vi.fn();
    const strategy = createMossNanoStrategy(deps);

    strategy.speakChunk("MOSS Nano speaks.", words, 12, 1.0, vi.fn(), vi.fn(), onError);

    await vi.waitFor(() => expect(onError).toHaveBeenCalledWith(failure));
    expect(deps.onError).toHaveBeenCalledWith(failure);
    expect(schedulerMock.scheduleChunk).not.toHaveBeenCalled();

    const maybeSnapshot = (strategy as any).getStatusSnapshot?.();
    if (maybeSnapshot) {
      expect(maybeSnapshot).toMatchObject({
        status: "unavailable",
        reason: "sidecar-not-ready",
        recoverable: true,
      });
    }

    const maybeLastError = (strategy as any).getLastError?.();
    if (maybeLastError) {
      expect(maybeLastError).toMatchObject(failure);
    }
  });

  it("stop cancels the active Nano request id", async () => {
    electronAPI.nanoSynthesize.mockResolvedValue(successfulSynthesis({
      requestId: "nano-active-42",
    }));
    const strategy = createMossNanoStrategy(makeDeps());

    strategy.speakChunk("MOSS Nano speaks.", words, 12, 1.0, vi.fn(), vi.fn(), vi.fn());
    await vi.waitFor(() => expect(schedulerMock.scheduleChunk).toHaveBeenCalledTimes(1));

    strategy.stop();

    expect(electronAPI.nanoCancel).toHaveBeenCalledWith("nano-active-42");
    expect(schedulerMock.stop).toHaveBeenCalled();
  });

  it("suppresses late synthesis results after stop so stale audio is never scheduled", async () => {
    const pending = deferred<ReturnType<typeof successfulSynthesis>>();
    electronAPI.nanoSynthesize.mockReturnValue(pending.promise);
    const strategy = createMossNanoStrategy(makeDeps());

    strategy.speakChunk("MOSS Nano speaks.", words, 12, 1.0, vi.fn(), vi.fn(), vi.fn());
    await vi.waitFor(() => expect(electronAPI.nanoSynthesize).toHaveBeenCalledTimes(1));

    strategy.stop();
    pending.resolve(successfulSynthesis({ requestId: "nano-too-late" }));
    await Promise.resolve();
    await Promise.resolve();

    expect(schedulerMock.stop).toHaveBeenCalledTimes(1);
    expect(schedulerMock.scheduleChunk).not.toHaveBeenCalled();
    expect(schedulerMock.play).not.toHaveBeenCalled();
  });

  it("reuses a matching cached Nano segment without calling nanoSynthesize again", async () => {
    const strategy = createMossNanoStrategy(makeDeps());

    strategy.speakChunk("MOSS Nano speaks.", words, 12, 1.0, vi.fn(), vi.fn(), vi.fn());
    await vi.waitFor(() => expect(schedulerMock.scheduleChunk).toHaveBeenCalledTimes(1));
    electronAPI.nanoSynthesize.mockClear();
    schedulerMock.scheduleChunk.mockClear();

    strategy.speakChunk("MOSS Nano speaks.", words, 12, 1.0, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(schedulerMock.scheduleChunk).toHaveBeenCalledTimes(1));
    expect(electronAPI.nanoSynthesize).not.toHaveBeenCalled();
    expect((strategy as any).getCacheStats()).toMatchObject({
      hits: 1,
      misses: 1,
      size: 1,
    });
    expect((strategy as any).getLastPlaybackTrace()).toMatchObject({
      kind: "nano-segment",
      cacheHit: true,
      timingTruth: "segment-following",
      wordTimestamps: null,
    });
  });

  it("does not reuse cached audio across voice, rate, text, or book-section scope changes", async () => {
    const voiceRef = { current: "voice-a" };
    const strategy = createMossNanoStrategy(makeDeps({
      getVoiceId: vi.fn(() => voiceRef.current),
    }));

    (strategy as any).setContinuityScope({ bookId: "book-a", sectionId: "section-a", generation: 1 });
    strategy.speakChunk("MOSS Nano speaks.", words, 12, 1.0, vi.fn(), vi.fn(), vi.fn());
    await vi.waitFor(() => expect(schedulerMock.scheduleChunk).toHaveBeenCalledTimes(1));

    const cases = [
      () => { voiceRef.current = "voice-b"; },
      () => { voiceRef.current = "voice-a"; },
      () => { (strategy as any).setContinuityScope({ bookId: "book-b", sectionId: "section-a", generation: 1 }); },
    ];

    electronAPI.nanoSynthesize.mockClear();
    schedulerMock.scheduleChunk.mockClear();
    cases[0]();
    strategy.speakChunk("MOSS Nano speaks.", words, 12, 1.0, vi.fn(), vi.fn(), vi.fn());
    await vi.waitFor(() => expect(electronAPI.nanoSynthesize).toHaveBeenCalledTimes(1));

    electronAPI.nanoSynthesize.mockClear();
    schedulerMock.scheduleChunk.mockClear();
    cases[1]();
    strategy.speakChunk("MOSS Nano speaks.", words, 12, 1.25, vi.fn(), vi.fn(), vi.fn());
    await vi.waitFor(() => expect(electronAPI.nanoSynthesize).toHaveBeenCalledTimes(1));

    electronAPI.nanoSynthesize.mockClear();
    schedulerMock.scheduleChunk.mockClear();
    cases[2]();
    strategy.speakChunk("MOSS Nano speaks.", words, 12, 1.0, vi.fn(), vi.fn(), vi.fn());
    await vi.waitFor(() => expect(electronAPI.nanoSynthesize).toHaveBeenCalledTimes(1));
  });

  it("prefetches a future segment and admits it only when request ownership and scope still match", async () => {
    const pending = deferred<ReturnType<typeof successfulSynthesis>>();
    electronAPI.nanoSynthesize.mockReturnValueOnce(pending.promise);
    const strategy = createMossNanoStrategy(makeDeps());

    (strategy as any).setContinuityScope({ bookId: "book-a", sectionId: "section-a", generation: 7 });
    const prefetchPromise = (strategy as any).prefetchChunk("Prefetched segment.", ["Prefetched", "segment."], 20, 1.0);
    await vi.waitFor(() => expect(electronAPI.nanoSynthesize).toHaveBeenCalledTimes(1));

    (strategy as any).setContinuityScope({ bookId: "book-a", sectionId: "section-b", generation: 8 });
    pending.resolve(successfulSynthesis({ requestId: "stale-prefetch" }));
    await prefetchPromise;

    expect((strategy as any).getCacheStats()).toMatchObject({
      stalePrefetches: 1,
      size: 0,
    });
  });

  it("uses a ready prefetch on the next matching speak and emits prefetch readiness trace metadata", async () => {
    const onSegmentTrace = vi.fn();
    const strategy = createMossNanoStrategy({
      ...makeDeps(),
      onSegmentTrace,
    } as any);

    (strategy as any).setContinuityScope({ bookId: "book-a", sectionId: "section-a", generation: 1 });
    await (strategy as any).prefetchChunk("Prefetched segment.", ["Prefetched", "segment."], 20, 1.0);

    expect(onSegmentTrace).toHaveBeenCalledWith(expect.objectContaining({
      kind: "nano-segment",
      phase: "prefetch-ready",
      prefetchReady: true,
      startIdx: 20,
    }));

    electronAPI.nanoSynthesize.mockClear();
    schedulerMock.scheduleChunk.mockClear();
    strategy.speakChunk("Prefetched segment.", ["Prefetched", "segment."], 20, 1.0, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(schedulerMock.scheduleChunk).toHaveBeenCalledTimes(1));
    expect(electronAPI.nanoSynthesize).not.toHaveBeenCalled();
    expect(onSegmentTrace).toHaveBeenCalledWith(expect.objectContaining({
      kind: "nano-segment",
      phase: "playback",
      cacheHit: true,
      prefetchReady: true,
      latencyMs: expect.any(Number),
    }));
  });

  it("bounds the Nano segment cache by evicting the oldest cached segment", async () => {
    const strategy = createMossNanoStrategy({
      ...makeDeps(),
      cacheLimit: 2,
    } as any);

    for (let index = 0; index < 3; index += 1) {
      strategy.speakChunk(`Segment ${index}.`, [`Segment`, `${index}.`], index * 2, 1.0, vi.fn(), vi.fn(), vi.fn());
      await vi.waitFor(() => expect(schedulerMock.scheduleChunk).toHaveBeenCalledTimes(index + 1));
    }

    expect((strategy as any).getCacheStats()).toMatchObject({
      size: 2,
      evictions: 1,
    });
  });
});
