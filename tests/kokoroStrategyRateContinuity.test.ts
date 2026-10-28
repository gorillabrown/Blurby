// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { KOKORO_LIVE_RATE_MAX_SEGMENT_DURATION_MS } from "../src/constants";
import type { KokoroStrategyDeps } from "../src/hooks/narration/kokoroStrategy";
import * as ttsCache from "../src/utils/ttsCache";

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

  it("enqueues short playback segments from one Kokoro generation chunk so same-bucket edits can land before the parent chunk finishes", async () => {
    const words = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot"];

    electronAPI.kokoroGenerate.mockResolvedValue({
      audio: new Float32Array(26400),
      sampleRate: 24000,
      durationMs: 1100,
      wordTimestamps: [
        { word: "alpha", startTime: 0.0, endTime: 0.16 },
        { word: "bravo", startTime: 0.16, endTime: 0.34 },
        { word: "charlie", startTime: 0.36, endTime: 0.54 },
        { word: "delta", startTime: 0.54, endTime: 0.72 },
        { word: "echo", startTime: 0.74, endTime: 0.92 },
        { word: "foxtrot", startTime: 0.92, endTime: 1.1 },
      ],
    });

    const deps: KokoroStrategyDeps = {
      getVoiceId: () => "af_heart",
      getSpeed: () => 1.3,
      getStatus: () => "speaking",
      getWords: () => words,
      getBookId: () => "book-1",
      onFallbackToWeb: vi.fn(),
    };

    const strategy = createKokoroStrategy(deps);
    strategy.speakChunk("", [], 0, 1.3, vi.fn(), vi.fn(), vi.fn());

    try {
      await vi.waitFor(() => expect(electronAPI.kokoroGenerate).toHaveBeenCalledTimes(1));
      await vi.waitFor(() => expect(schedulerMock.scheduleChunk).toHaveBeenCalled());

      const scheduledSegments = schedulerMock.scheduleChunk.mock.calls.map(([chunk]) => chunk as any);
      expect(scheduledSegments.length).toBeGreaterThan(1);

      let nextStartIdx = 0;
      const flattenedWords: string[] = [];

      for (const [segmentIndex, segment] of scheduledSegments.entries()) {
        const timestamps = segment.wordTimestamps;
        expect(segment.parentChunkStartIdx).toBe(0);
        expect(segment.parentChunkWordCount).toBe(words.length);
        expect(segment.segmentIndex).toBe(segmentIndex);
        expect(segment.isFinalSegment).toBe(segmentIndex === scheduledSegments.length - 1);
        expect(segment.startIdx).toBe(nextStartIdx);
        expect(segment.words.length).toBeGreaterThan(0);
        expect(segment.kokoroRatePlan).toMatchObject({
          selectedSpeed: 1.3,
          generationBucket: 1.2,
          tempoFactor: 1.3 / 1.2,
        });
        expect(timestamps).not.toBeNull();
        expect(timestamps?.[0]?.startTime ?? Number.NaN).toBeCloseTo(0, 6);
        expect((timestamps?.[timestamps.length - 1]?.endTime ?? Number.POSITIVE_INFINITY) * 1000)
          .toBeLessThanOrEqual(KOKORO_LIVE_RATE_MAX_SEGMENT_DURATION_MS);

        flattenedWords.push(...segment.words);
        nextStartIdx += segment.words.length;
      }

      expect(flattenedWords).toEqual(words);
    } finally {
      strategy.stop();
    }
  });

  it("segments cached same-bucket Kokoro chunks into multiple scheduler enqueues on cache hits", async () => {
    const words = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot"];
    const isCachedSpy = vi.spyOn(ttsCache, "isCached").mockResolvedValue(true);
    const loadCachedChunkSpy = vi.spyOn(ttsCache, "loadCachedChunk").mockResolvedValue({
      audio: new Float32Array(26400),
      sampleRate: 24000,
      durationMs: 1100,
      words,
      startIdx: 0,
      wordTimestamps: [
        { word: "alpha", startTime: 0.0, endTime: 0.16 },
        { word: "bravo", startTime: 0.16, endTime: 0.34 },
        { word: "charlie", startTime: 0.36, endTime: 0.54 },
        { word: "delta", startTime: 0.54, endTime: 0.72 },
        { word: "echo", startTime: 0.74, endTime: 0.92 },
        { word: "foxtrot", startTime: 0.92, endTime: 1.1 },
      ],
    } as any);

    const deps: KokoroStrategyDeps = {
      getVoiceId: () => "af_heart",
      getSpeed: () => 1.3,
      getStatus: () => "speaking",
      getWords: () => words,
      getBookId: () => "book-1",
      onFallbackToWeb: vi.fn(),
    };

    const strategy = createKokoroStrategy(deps);
    strategy.speakChunk("", [], 0, 1.3, vi.fn(), vi.fn(), vi.fn());

    try {
      await vi.waitFor(() => expect(loadCachedChunkSpy).toHaveBeenCalledWith("book-1", "af_heart/1.2", 0, words));
      await vi.waitFor(() => expect(schedulerMock.scheduleChunk).toHaveBeenCalled());

      const scheduledSegments = schedulerMock.scheduleChunk.mock.calls.map(([chunk]) => chunk as any);
      expect(isCachedSpy).toHaveBeenCalledWith("book-1", "af_heart/1.2", 0);
      expect(electronAPI.kokoroGenerate).not.toHaveBeenCalled();
      expect(scheduledSegments.length).toBeGreaterThan(1);
      expect(scheduledSegments.every((segment) => segment.parentChunkStartIdx === 0)).toBe(true);
      expect(scheduledSegments[scheduledSegments.length - 1]?.isFinalSegment).toBe(true);
      expect(scheduledSegments.flatMap((segment) => segment.words)).toEqual(words);
    } finally {
      strategy.stop();
      isCachedSpy.mockRestore();
      loadCachedChunkSpy.mockRestore();
    }
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
