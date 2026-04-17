// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { KokoroStrategyDeps } from "../src/hooks/narration/kokoroStrategy";

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

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
  const api = { kokoroGenerate: vi.fn() as any };
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

import { createKokoroStrategy } from "../src/hooks/narration/kokoroStrategy";

describe("kokoroStrategy live rate continuity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates future same-bucket chunks to the latest tempo plan without restarting generation", async () => {
    const words = Array.from({ length: 80 }, (_, index) => `word${index}`);
    let currentSpeed = 1.2;
    const pendingGenerations: Array<ReturnType<typeof createDeferred<any>>> = [];

    electronAPI.kokoroGenerate.mockImplementation(() => {
      const deferred = createDeferred<{
        audio: Float32Array;
        sampleRate: number;
        durationMs: number;
        wordTimestamps: null;
      }>();
      pendingGenerations.push(deferred);
      return deferred.promise;
    });

    const deps: KokoroStrategyDeps = {
      getVoiceId: () => "af_heart",
      getSpeed: () => currentSpeed,
      getStatus: () => "speaking",
      getWords: () => words,
      getBookId: () => "book-1",
      onFallbackToWeb: vi.fn(),
    };

    const strategy = createKokoroStrategy(deps);
    strategy.speakChunk("", [], 0, currentSpeed, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(electronAPI.kokoroGenerate).toHaveBeenCalledTimes(2));
    expect(electronAPI.kokoroGenerate.mock.calls[0][2]).toBe(1.2);
    expect(electronAPI.kokoroGenerate.mock.calls[1][2]).toBe(1.2);

    pendingGenerations[0].resolve({
      audio: new Float32Array(2400),
      sampleRate: 24000,
      durationMs: 100,
      wordTimestamps: null,
    });
    pendingGenerations[1].resolve({
      audio: new Float32Array(2400),
      sampleRate: 24000,
      durationMs: 100,
      wordTimestamps: null,
    });

    await vi.waitFor(() => expect(schedulerMock.scheduleChunk).toHaveBeenCalledTimes(2));
    expect(schedulerMock.scheduleChunk.mock.calls[0][0].kokoroRatePlan).toMatchObject({
      selectedSpeed: 1.2,
      generationBucket: 1.2,
    });
    expect(schedulerMock.scheduleChunk.mock.calls[1][0].kokoroRatePlan).toMatchObject({
      selectedSpeed: 1.2,
      generationBucket: 1.2,
    });

    currentSpeed = 1.3;

    await vi.waitFor(() => expect(electronAPI.kokoroGenerate).toHaveBeenCalledTimes(3));
    expect(electronAPI.kokoroGenerate.mock.calls[2][2]).toBe(1.2);

    pendingGenerations[2].resolve({
      audio: new Float32Array(2400),
      sampleRate: 24000,
      durationMs: 100,
      wordTimestamps: null,
    });

    await vi.waitFor(() => expect(schedulerMock.scheduleChunk).toHaveBeenCalledTimes(3));

    const thirdChunk = schedulerMock.scheduleChunk.mock.calls[2][0];
    expect(thirdChunk.startIdx).toBeGreaterThan(schedulerMock.scheduleChunk.mock.calls[1][0].startIdx);
    expect(thirdChunk.kokoroRatePlan).toMatchObject({
      selectedSpeed: 1.3,
      generationBucket: 1.2,
    });
    expect(thirdChunk.kokoroRatePlan?.tempoFactor).toBeCloseTo(1.3 / 1.2, 12);

    strategy.stop();
  });

  it("forwards live same-bucket tempo changes to already-buffered scheduler chunks", () => {
    let currentSpeed = 1.2;
    const deps: KokoroStrategyDeps = {
      getVoiceId: () => "af_heart",
      getSpeed: () => currentSpeed,
      getStatus: () => "speaking",
      getWords: () => ["one", "two", "three"],
      getBookId: () => "book-1",
      onFallbackToWeb: vi.fn(),
    };

    const strategy = createKokoroStrategy(deps);

    currentSpeed = 1.3;
    strategy.refreshBufferedTempo();

    expect(schedulerMock.refreshBufferedTempo).toHaveBeenCalledWith(expect.objectContaining({
      selectedSpeed: 1.3,
      generationBucket: 1.2,
      tempoFactor: 1.3 / 1.2,
    }));
  });
});
