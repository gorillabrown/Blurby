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
});
