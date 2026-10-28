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
    pocketStatus: vi.fn(),
    pocketSynthesize: vi.fn(),
    pocketCancel: vi.fn(),
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
  createPocketTtsStrategy,
  type PocketTtsStrategyDeps,
} from "../src/hooks/narration/pocketTtsStrategy";

const words = ["Pocket", "keeps", "segment", "truth."];

function makeDeps(overrides?: Partial<PocketTtsStrategyDeps>): PocketTtsStrategyDeps {
  return {
    getVoiceId: vi.fn(() => "default"),
    getWords: vi.fn(() => words),
    onStatus: vi.fn(),
    onError: vi.fn(),
    ...overrides,
  } as PocketTtsStrategyDeps;
}

function successfulSynthesis(overrides?: Record<string, unknown>) {
  return {
    ok: true,
    requestId: "pocket-req-1",
    ownerToken: "owner-1",
    audio: new Float32Array(2400),
    sampleRate: 24000,
    durationMs: 100,
    syntheticAudio: false,
    runtime: { backend: "pocket-tts", modelVariant: "pocket-tts-local" },
    ...overrides,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

describe("createPocketTtsStrategy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    schedulerMock.isPlaying.mockReturnValue(true);
    electronAPI.pocketStatus.mockResolvedValue({
      ok: true,
      status: "ready",
      ready: true,
      loading: false,
      recoverable: false,
      detail: "resident Pocket runtime warm",
    });
    electronAPI.pocketSynthesize.mockResolvedValue(successfulSynthesis());
    electronAPI.pocketCancel.mockResolvedValue({ ok: true, cancelled: true, requestId: "pocket-req-1" });
  });

  it("checks Pocket readiness before synthesizing", async () => {
    const status = { ok: true, status: "ready", ready: true, loading: false, recoverable: false };
    electronAPI.pocketStatus.mockResolvedValue(status);
    const deps = makeDeps();
    const strategy = createPocketTtsStrategy(deps);

    strategy.speakChunk("Pocket speaks.", words, 4, 1.25, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(electronAPI.pocketSynthesize).toHaveBeenCalled());
    expect(electronAPI.pocketStatus).toHaveBeenCalledTimes(1);
    expect(deps.onStatus).toHaveBeenCalledWith(status);
    expect(electronAPI.pocketStatus.mock.invocationCallOrder[0])
      .toBeLessThan(electronAPI.pocketSynthesize.mock.invocationCallOrder[0]);
  });

  it("sends text, rate, and voice to pocketSynthesize", async () => {
    const deps = makeDeps({ getVoiceId: vi.fn(() => "narrator") });
    const strategy = createPocketTtsStrategy(deps);

    strategy.speakChunk("Pocket speaks.", words, 4, 1.4, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(electronAPI.pocketSynthesize).toHaveBeenCalled());
    expect(electronAPI.pocketSynthesize).toHaveBeenCalledWith({
      text: "Pocket speaks.",
      voice: "narrator",
      rate: 1.4,
    });
  });

  it("schedules returned Pocket audio as segment-following playback", async () => {
    const audio = new Float32Array([0.1, 0.2, 0.3]);
    electronAPI.pocketSynthesize.mockResolvedValue(successfulSynthesis({ audio, durationMs: 25 }));
    const strategy = createPocketTtsStrategy(makeDeps());

    strategy.speakChunk("Pocket speaks.", words, 4, 1, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(schedulerMock.scheduleChunk).toHaveBeenCalledTimes(1));
    expect(schedulerMock.play).toHaveBeenCalled();
    expect(schedulerMock.scheduleChunk.mock.calls[0][0]).toMatchObject({
      audio,
      sampleRate: 24000,
      durationMs: 25,
      words,
      startIdx: 4,
      timingTruth: "segment-following",
      wordTimestamps: null,
    });
  });

  it("reports a structured failure when Pocket returns success without audio", async () => {
    electronAPI.pocketSynthesize.mockResolvedValue({
      ok: true,
      requestId: "pocket-missing-audio-1",
      sampleRate: 24000,
    });
    const onError = vi.fn();
    const strategy = createPocketTtsStrategy(makeDeps());

    strategy.speakChunk("Pocket speaks.", words, 4, 1, vi.fn(), vi.fn(), onError);

    await vi.waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      ok: false,
      requestId: "pocket-missing-audio-1",
      reason: "missing-audio",
      recoverable: true,
    }));
    expect(schedulerMock.scheduleChunk).not.toHaveBeenCalled();
  });

  it("does not expose reference WAV or cloning controls in synthesize payloads", async () => {
    const strategy = createPocketTtsStrategy(makeDeps());

    strategy.speakChunk("Pocket speaks.", words, 4, 1, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(electronAPI.pocketSynthesize).toHaveBeenCalled());
    expect(electronAPI.pocketSynthesize.mock.calls[0][0]).not.toHaveProperty("referenceWavPath");
    expect(electronAPI.pocketSynthesize.mock.calls[0][0]).not.toHaveProperty("cloneVoice");
  });

  it("includes text length and text hash in cache identity", async () => {
    const strategy = createPocketTtsStrategy(makeDeps({ cacheLimit: 4 }));
    const first = "Aa";
    const sameStartDifferentTextLength = "BBA";

    await strategy.prefetchChunk(first, words, 4, 1, { reason: "next-segment" });
    await strategy.prefetchChunk(sameStartDifferentTextLength, words, 4, 1, { reason: "next-segment" });

    expect(electronAPI.pocketSynthesize).toHaveBeenCalledTimes(2);
    expect(strategy.getCacheStats().size).toBe(2);
  });

  it("invalidates playback and prefetch generations when continuity scope changes", async () => {
    const pending = deferred<ReturnType<typeof successfulSynthesis>>();
    electronAPI.pocketSynthesize.mockReturnValue(pending.promise);
    const strategy = createPocketTtsStrategy(makeDeps());

    const prefetch = strategy.prefetchChunk("Pocket speaks.", words, 4, 1, { reason: "next-segment" });
    strategy.speakChunk("Pocket speaks.", words, 4, 1, vi.fn(), vi.fn(), vi.fn());
    strategy.setContinuityScope({ bookId: "new-book", sectionId: "2" });
    pending.resolve(successfulSynthesis());

    await expect(prefetch).resolves.toMatchObject({ ok: false, stale: true });
    await Promise.resolve();
    expect(schedulerMock.scheduleChunk).not.toHaveBeenCalled();
  });

  it("cancels active Pocket requests on stop", async () => {
    const strategy = createPocketTtsStrategy(makeDeps());

    strategy.speakChunk("Pocket speaks.", words, 4, 1, vi.fn(), vi.fn(), vi.fn());
    await vi.waitFor(() => expect(schedulerMock.scheduleChunk).toHaveBeenCalledTimes(1));
    strategy.stop();

    expect(electronAPI.pocketCancel).toHaveBeenCalledWith("pocket-req-1");
    expect(schedulerMock.stop).toHaveBeenCalled();
  });
});
