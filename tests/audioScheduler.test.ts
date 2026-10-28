// @vitest-environment jsdom
// tests/audioScheduler.test.ts — Tests for NAR-2 audio scheduler
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TTS_CROSSFADE_MS, KOKORO_SAMPLE_RATE } from "../src/constants";

// Mock AudioContext
let mockCurrentTime = 0;
let startedSources: { startTime: number; playbackRate: number; bufferLength: number }[] = [];

beforeEach(() => {
  mockCurrentTime = 0;
  startedSources = [];

  class MockAudioBufferSourceNode {
    buffer: any = null;
    playbackRate = { value: 1.0 };
    onended: (() => void) | null = null;
    connect() { return this; }
    start(when?: number) {
      startedSources.push({
        startTime: when || 0,
        playbackRate: this.playbackRate.value,
        bufferLength: this.buffer?.length ?? 0,
      });
      // Fire onended after a delay — use arrow fn to capture `this` so onended is read at fire time
      const self = this;
      setTimeout(() => { if (self.onended) self.onended(); }, 30);
    }
    stop() {}
  }
  class MockAudioBuffer {
    length = 0;
    constructor(opts?: any) { this.length = opts?.length || 0; }
    copyToChannel() {}
  }
  class MockAudioContext {
    sampleRate = KOKORO_SAMPLE_RATE;
    get currentTime() { return mockCurrentTime; }
    state: string = "running";
    createBuffer(_channels: number, length: number, _sampleRate: number) {
      const buf = new MockAudioBuffer();
      buf.length = length;
      return buf;
    }
    createBufferSource() { return new MockAudioBufferSourceNode(); }
    resume() { this.state = "running"; return Promise.resolve(); }
    suspend() { this.state = "suspended"; return Promise.resolve(); }
  }
  (globalThis as any).AudioContext = MockAudioContext;
});

afterEach(() => {
  delete (globalThis as any).AudioContext;
});

import { createAudioScheduler, type ScheduledChunk } from "../src/utils/audioScheduler";
import { NARRATION_CURSOR_LAG_MS } from "../src/constants";

function makeChunk(startIdx: number, wordCount: number): ScheduledChunk {
  return {
    audio: new Float32Array(KOKORO_SAMPLE_RATE), // 1 second of audio
    sampleRate: KOKORO_SAMPLE_RATE,
    durationMs: 1000,
    words: Array.from({ length: wordCount }, (_, i) => `word${startIdx + i}`),
    startIdx,
  };
}

describe("createAudioScheduler", () => {
  it("warmUp creates AudioContext", () => {
    const scheduler = createAudioScheduler();
    scheduler.warmUp();
    expect(scheduler.getContext()).not.toBeNull();
    scheduler.stop();
  });

  it("scheduleChunk schedules a source", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    scheduler.scheduleChunk(makeChunk(0, 10));

    expect(startedSources.length).toBe(1);
    scheduler.stop();
  });

  it("publishes timing metadata when a chunk is scheduled", () => {
    const onTimingMetadata = vi.fn();
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({
      onWordAdvance: vi.fn(),
      onChunkBoundary: vi.fn(),
      onEnd: vi.fn(),
      onError: vi.fn(),
      onTimingMetadata,
    } as any);
    scheduler.play();

    scheduler.scheduleChunk({
      ...makeChunk(10, 2),
      chunkId: "book-a:10",
      segmentId: "book-a:10:0",
      timingTruth: "word-native",
      wordTimestamps: [
        { word: "word10", startTime: 0, endTime: 0.4 },
        { word: "word11", startTime: 0.4, endTime: 1 },
      ],
    } as any);

    expect(onTimingMetadata).toHaveBeenCalledTimes(1);
    expect(onTimingMetadata).toHaveBeenCalledWith(expect.objectContaining({
      chunkId: "book-a:10",
      segmentId: "book-a:10:0",
      chunkStartIdx: 10,
      chunkEndIdx: 12,
      timingTruth: "word-native",
      timingClassification: "trusted",
      hasTrustedWordTiming: true,
    }));
    scheduler.stop();
  });

  it("multiple chunks are pre-scheduled at sequential times", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    scheduler.scheduleChunk(makeChunk(0, 10));
    scheduler.scheduleChunk(makeChunk(10, 10));
    scheduler.scheduleChunk(makeChunk(20, 10));

    expect(startedSources.length).toBe(3);
    // Each source should start after the previous one (minus crossfade overlap)
    expect(startedSources[1].startTime).toBeGreaterThan(startedSources[0].startTime);
    expect(startedSources[2].startTime).toBeGreaterThan(startedSources[1].startTime);
    scheduler.stop();
  });

  it("crossfade: chunks overlap by TTS_CROSSFADE_MS", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    scheduler.scheduleChunk(makeChunk(0, 10));
    scheduler.scheduleChunk(makeChunk(10, 10));

    const crossfadeSec = TTS_CROSSFADE_MS / 1000;
    const gap = startedSources[1].startTime - startedSources[0].startTime;
    // Gap should be chunkDuration - crossfade (1.0 - 0.008 = 0.992 at 1x speed)
    expect(gap).toBeCloseTo(1.0 - crossfadeSec, 2);
    scheduler.stop();
  });

  it("applies Kokoro tempo shaping before scheduling without changing playbackRate", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    const kokoroChunk = {
      ...makeChunk(0, 10),
      kokoroRatePlan: {
        selectedSpeed: 1.1,
        generationBucket: 1.0,
        tempoFactor: 1.1,
      },
    };

    scheduler.scheduleChunk(kokoroChunk);
    scheduler.scheduleChunk({ ...kokoroChunk, startIdx: 10 });

    const crossfadeSec = TTS_CROSSFADE_MS / 1000;
    const gap = startedSources[1].startTime - startedSources[0].startTime;

    expect(startedSources[0].playbackRate).toBe(1);
    expect(startedSources[1].playbackRate).toBe(1);
    expect(startedSources[0].bufferLength).toBeGreaterThan(21000);
    expect(startedSources[0].bufferLength).toBeLessThan(22500);
    expect(gap).toBeCloseTo((1 / 1.1) - crossfadeSec, 2);

    scheduler.stop();
  });

  it("preserves injected silence after Kokoro tempo shaping", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    const voicedSamples = KOKORO_SAMPLE_RATE;
    const silenceSamples = KOKORO_SAMPLE_RATE / 2;
    const chunk = {
      audio: new Float32Array(voicedSamples + silenceSamples),
      sampleRate: KOKORO_SAMPLE_RATE,
      durationMs: 1500,
      words: ["one", "two", "three"],
      startIdx: 0,
      silenceMs: 500,
      kokoroRatePlan: {
        selectedSpeed: 1.5,
        generationBucket: 1.2,
        tempoFactor: 1.25,
      },
    };

    scheduler.scheduleChunk(chunk);
    scheduler.scheduleChunk({ ...chunk, startIdx: 3 });

    const crossfadeSec = TTS_CROSSFADE_MS / 1000;
    const gap = startedSources[1].startTime - startedSources[0].startTime;

    expect(startedSources[0].bufferLength).toBeGreaterThan(30000);
    expect(startedSources[0].bufferLength).toBeLessThan(32000);
    expect(gap).toBeCloseTo(1.3 - crossfadeSec, 2);

    scheduler.stop();
  });

  it("does not expose setSpeed (removed in HOTFIX-9 — native speed generation)", () => {
    const scheduler = createAudioScheduler();
    expect((scheduler as any).setSpeed).toBeUndefined();
    scheduler.stop();
  });

  it("stop clears all sources", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    scheduler.scheduleChunk(makeChunk(0, 10));
    scheduler.stop();

    expect(scheduler.isPlaying()).toBe(false);
  });

  it("pause suspends AudioContext", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();
    scheduler.scheduleChunk(makeChunk(0, 10));

    scheduler.pause();
    const ctx = scheduler.getContext();
    expect(ctx?.state).toBe("suspended");
    scheduler.stop();
  });

  it("resume unsuspends AudioContext", async () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();
    scheduler.scheduleChunk(makeChunk(0, 10));

    scheduler.pause();
    scheduler.resume();

    await vi.waitFor(() => {
      const ctx = scheduler.getContext();
      expect(ctx?.state).toBe("running");
    });
    scheduler.stop();
  });

  it("onChunkBoundary fires when source ends", async () => {
    const onChunkBoundary = vi.fn();
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary, onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    scheduler.scheduleChunk(makeChunk(0, 5));

    // Mock source fires onended after ~20ms
    await vi.waitFor(() => expect(onChunkBoundary).toHaveBeenCalledWith(5), { timeout: 1000 });
    scheduler.stop();
  });

  it("emits parent chunk boundary metadata only for final Kokoro playback segment", async () => {
    const onChunkBoundary = vi.fn();
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary, onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    const firstSegment = {
      ...makeChunk(0, 3),
      parentChunkStartIdx: 0,
      parentChunkWordCount: 6,
      segmentIndex: 0,
      isFinalSegment: false,
    } as ScheduledChunk;
    const finalSegment = {
      ...makeChunk(3, 3),
      parentChunkStartIdx: 0,
      parentChunkWordCount: 6,
      segmentIndex: 1,
      isFinalSegment: true,
    } as ScheduledChunk;

    scheduler.scheduleChunk(firstSegment);
    scheduler.scheduleChunk(finalSegment);

    await vi.waitFor(() => {
      expect(onChunkBoundary).toHaveBeenCalledTimes(1);
      expect(onChunkBoundary).toHaveBeenCalledWith(6, expect.objectContaining({
        parentChunkStartIdx: 0,
        parentChunkWordCount: 6,
        segmentIndex: 1,
        isFinalSegment: true,
        lastConfirmedWordIndex: 5,
        endIdx: 6,
      }));
    }, { timeout: 1000 });

    scheduler.stop();
  });
});

describe("cursor clamp — Step 3.5 NARRATE-CURSOR-SYNC-4", () => {
  // These tests exercise getAudioProgress()'s belt-and-suspenders clamp that
  // prevents the reported wordIndex from outrunning the currently-playing source.
  // tick() is RAF-driven and cannot fire in jsdom, so we test the clamp path
  // in getAudioProgress() directly by setting mockCurrentTime and asserting
  // the reported wordIndex stays within the playing source's word range.

  it("getAudioProgress wordIndex never exceeds the playing source's max word (single chunk)", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    // Chunk 1: words 0–4. Chunk 2: words 5–9. Chunk 3: words 10–14.
    // All three are scheduled at mockCurrentTime=0, so they're queued sequentially.
    scheduler.scheduleChunk(makeChunk(0, 5));
    scheduler.scheduleChunk(makeChunk(5, 5));
    scheduler.scheduleChunk(makeChunk(10, 5));

    // Mid-chunk-1: only chunk 1 has started (startTime=0 <= 0.5).
    // getAudioProgress must not report a wordIndex beyond chunk 1's range.
    mockCurrentTime = 0.5;
    const report1 = scheduler.getAudioProgress();
    expect(report1).not.toBeNull();
    expect(report1!.wordIndex).toBeLessThanOrEqual(4);

    // Well into chunk 2: chunk 2 has started (startTime ~0.986 <= 2.0).
    // getAudioProgress may now report words up to chunk 2's max.
    mockCurrentTime = 2.0;
    const report2 = scheduler.getAudioProgress();
    expect(report2).not.toBeNull();
    expect(report2!.wordIndex).toBeLessThanOrEqual(9);

    scheduler.stop();
  });

  it("getAudioProgress returns null before the first scheduled source starts", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    // Schedule the chunk at a future time (mockCurrentTime=1.0 → playbackStartTime=1.0).
    // Then rewind the clock to before that start time — getAudioProgress must return null
    // because audio has not started yet (audioCtx.currentTime < playbackStartTime).
    mockCurrentTime = 1.0;
    scheduler.scheduleChunk(makeChunk(0, 5));

    // Clock is before the scheduled start — no audio has played yet.
    mockCurrentTime = 0.5;
    const report = scheduler.getAudioProgress();
    expect(report).toBeNull();

    scheduler.stop();
  });

  it("cursor clamp holds across many prefetched chunks", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    // Schedule 10 chunks: words 0–4, 5–9, …, 45–49.
    for (let i = 0; i < 10; i++) {
      scheduler.scheduleChunk(makeChunk(i * 5, 5));
    }

    // Only chunk 0 has started at t=0.5. All 50 word boundaries are in the
    // timeline but the clamp must keep the reported wordIndex within chunk 0's
    // range (0–4). This verifies that bulk-prefetching cannot push the cursor
    // forward before the audio has actually reached those words.
    mockCurrentTime = 0.5;
    const report = scheduler.getAudioProgress();
    expect(report).not.toBeNull();
    expect(report!.wordIndex).toBeLessThanOrEqual(4);

    scheduler.stop();
  });

  it("cursor clamp transitions when a later source crosses its start boundary", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    // Chunk 1: words 0–4 (starts at t=0, boundary/handoff at t≈0.986).
    // Chunk 2: words 5–9 (starts at t≈0.986).
    scheduler.scheduleChunk(makeChunk(0, 5));
    scheduler.scheduleChunk(makeChunk(5, 5));

    // Before chunk 2 starts: max playing word is 4.
    mockCurrentTime = 0.5;
    const beforeCrossover = scheduler.getAudioProgress();
    expect(beforeCrossover).not.toBeNull();
    expect(beforeCrossover!.wordIndex).toBeLessThanOrEqual(4);

    // After chunk 2 has started: it is now the latest source with startTime <= now,
    // so its max word (9) becomes the new ceiling. The clamp must not block chunk 2.
    // Chunk 2 startTime = crossfade boundary of chunk 1 ≈ 1.0 - (14ms/1000) = 0.986.
    mockCurrentTime = 1.5;
    const afterCrossover = scheduler.getAudioProgress();
    expect(afterCrossover).not.toBeNull();
    // Max playing word is now 9; wordIndex must be within [0, 9].
    expect(afterCrossover!.wordIndex).toBeLessThanOrEqual(9);

    scheduler.stop();
  });
});
