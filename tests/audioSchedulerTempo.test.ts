// @vitest-environment jsdom
// tests/audioSchedulerTempo.test.ts — focused coverage for Kokoro tempo continuity

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KOKORO_SAMPLE_RATE, TTS_CROSSFADE_MS } from "../src/constants";
import { createAudioScheduler, type ScheduledChunk } from "../src/utils/audioScheduler";

let mockCurrentTime = 0;
let stoppedSources = 0;
let startedSources: {
  startTime: number;
  playbackRate: number;
  bufferLength: number;
}[] = [];

beforeEach(() => {
  mockCurrentTime = 0;
  stoppedSources = 0;
  startedSources = [];

  class MockAudioBufferSourceNode {
    buffer: any = null;
    playbackRate = { value: 1.0 };
    onended: (() => void) | null = null;
    connect() { return this; }
    start(when?: number) {
      startedSources.push({
        startTime: when ?? 0,
        playbackRate: this.playbackRate.value,
        bufferLength: this.buffer?.length ?? 0,
      });
      const self = this;
      setTimeout(() => { if (self.onended) self.onended(); }, 30);
    }
    stop() { stoppedSources += 1; }
    disconnect() {}
  }

  class MockAudioBuffer {
    length = 0;
    copyToChannel() {}
  }

  class MockAudioContext {
    sampleRate = KOKORO_SAMPLE_RATE;
    get currentTime() { return mockCurrentTime; }
    state: string = "running";
    get destination() { return {}; }
    createBuffer(_channels: number, length: number, _sampleRate: number) {
      const buffer = new MockAudioBuffer();
      buffer.length = length;
      return buffer;
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

function makeChunk(startIdx: number, wordCount: number, durationMs = 1000): ScheduledChunk {
  return {
    audio: new Float32Array(KOKORO_SAMPLE_RATE),
    sampleRate: KOKORO_SAMPLE_RATE,
    durationMs,
    words: Array.from({ length: wordCount }, (_, i) => `word${startIdx + i}`),
    startIdx,
  };
}

describe("audioScheduler tempo continuity", () => {
  it("stretches Kokoro audio before scheduling and keeps source playbackRate at 1", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({
      onWordAdvance: vi.fn(),
      onChunkBoundary: vi.fn(),
      onEnd: vi.fn(),
      onError: vi.fn(),
    });
    scheduler.play();

    scheduler.scheduleChunk({
      ...makeChunk(0, 10),
      kokoroRatePlan: {
        selectedSpeed: 1.5,
        generationBucket: 1.5,
        tempoFactor: 1.5,
      },
    });

    expect(startedSources).toHaveLength(1);
    expect(startedSources[0].playbackRate).toBe(1);
    expect(startedSources[0].bufferLength).toBeGreaterThan(15000);
    expect(startedSources[0].bufferLength).toBeLessThan(17000);

    scheduler.stop();
  });

  it("uses the post-tempo transition point when chaining the next chunk", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({
      onWordAdvance: vi.fn(),
      onChunkBoundary: vi.fn(),
      onEnd: vi.fn(),
      onError: vi.fn(),
    });
    scheduler.play();

    scheduler.scheduleChunk({
      ...makeChunk(0, 10),
      kokoroRatePlan: {
        selectedSpeed: 1.1,
        generationBucket: 1.0,
        tempoFactor: 1.1,
      },
    });
    scheduler.scheduleChunk(makeChunk(10, 10));

    expect(startedSources).toHaveLength(2);
    expect(startedSources[1].startTime).toBeGreaterThan(startedSources[0].startTime);
    expect(startedSources[1].startTime).toBeCloseTo(
      (startedSources[0].bufferLength / KOKORO_SAMPLE_RATE) - (TTS_CROSSFADE_MS / 1000),
      2,
    );

    scheduler.stop();
  });

  it("keeps chained chunk starts monotonic and gapless across tempo changes", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({
      onWordAdvance: vi.fn(),
      onChunkBoundary: vi.fn(),
      onEnd: vi.fn(),
      onError: vi.fn(),
    });
    scheduler.play();

    scheduler.scheduleChunk({
      ...makeChunk(0, 10),
      kokoroRatePlan: {
        selectedSpeed: 1.5,
        generationBucket: 1.5,
        tempoFactor: 1.5,
      },
    });
    scheduler.scheduleChunk({
      ...makeChunk(10, 10),
      kokoroRatePlan: {
        selectedSpeed: 1.2,
        generationBucket: 1.2,
        tempoFactor: 1.0,
      },
    });
    scheduler.scheduleChunk({
      ...makeChunk(20, 10),
      kokoroRatePlan: {
        selectedSpeed: 1.3,
        generationBucket: 1.2,
        tempoFactor: 1.3 / 1.2,
      },
    });

    expect(startedSources).toHaveLength(3);
    expect(startedSources[1].startTime).toBeGreaterThan(startedSources[0].startTime);
    expect(startedSources[2].startTime).toBeGreaterThan(startedSources[1].startTime);

    const crossfadeSec = TTS_CROSSFADE_MS / 1000;
    const gap01 = startedSources[1].startTime - startedSources[0].startTime;
    const gap12 = startedSources[2].startTime - startedSources[1].startTime;

    expect(gap01).toBeCloseTo((startedSources[0].bufferLength / KOKORO_SAMPLE_RATE) - crossfadeSec, 2);
    expect(gap12).toBeCloseTo((startedSources[1].bufferLength / KOKORO_SAMPLE_RATE) - crossfadeSec, 2);

    scheduler.stop();
  });

  it("re-times already-buffered future chunks when the Kokoro tempo changes within the same bucket", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({
      onWordAdvance: vi.fn(),
      onChunkBoundary: vi.fn(),
      onEnd: vi.fn(),
      onError: vi.fn(),
    });
    scheduler.play();

    const bucketPlan = {
      selectedSpeed: 1.2,
      generationBucket: 1.2,
      tempoFactor: 1,
    } as const;

    scheduler.scheduleChunk({
      ...makeChunk(0, 10),
      kokoroRatePlan: bucketPlan,
    });
    scheduler.scheduleChunk({
      ...makeChunk(10, 10),
      kokoroRatePlan: bucketPlan,
    });
    scheduler.scheduleChunk({
      ...makeChunk(20, 10),
      kokoroRatePlan: bucketPlan,
    });

    const originalSecondStart = startedSources[1].startTime;
    const originalThirdStart = startedSources[2].startTime;
    const originalSecondLength = startedSources[1].bufferLength;
    const originalThirdLength = startedSources[2].bufferLength;

    scheduler.refreshBufferedTempo({
      selectedSpeed: 1.3,
      generationBucket: 1.2,
      tempoFactor: 1.3 / 1.2,
    });

    expect(stoppedSources).toBe(2);
    expect(startedSources).toHaveLength(5);
    expect(startedSources[3].startTime).toBeCloseTo(originalSecondStart, 5);
    expect(startedSources[3].bufferLength).toBeLessThan(originalSecondLength);
    expect(startedSources[4].startTime).toBeLessThan(originalThirdStart);
    expect(startedSources[4].bufferLength).toBeLessThan(originalThirdLength);

    const crossfadeSec = TTS_CROSSFADE_MS / 1000;
    expect(startedSources[4].startTime - startedSources[3].startTime).toBeCloseTo(
      (startedSources[3].bufferLength / KOKORO_SAMPLE_RATE) - crossfadeSec,
      2,
    );

    scheduler.stop();
  });
});
