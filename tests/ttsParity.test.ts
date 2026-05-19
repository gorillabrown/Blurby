// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  (globalThis as any).window = (globalThis as any).window || {};
  (globalThis as any).window.electronAPI = {
    ttsCacheRead: vi.fn(),
    ttsCacheWrite: vi.fn().mockResolvedValue({ success: true }),
    ttsCacheHas: vi.fn().mockResolvedValue(false),
    ttsCacheChunks: vi.fn().mockResolvedValue([]),
  };
});

import { KOKORO_SAMPLE_RATE } from "../src/constants";
import {
  createGenerationPipeline,
  type PipelineConfig,
} from "../src/utils/generationPipeline";
import type { TtsCacheIdentity } from "../src/types/ttsCache";
import { loadCachedChunk } from "../src/utils/ttsCache";
import {
  createAudioScheduler,
  type ScheduledChunk,
  type SchedulerCallbacks,
} from "../src/utils/audioScheduler";

function makeCallbacks(overrides: Partial<SchedulerCallbacks> = {}): SchedulerCallbacks {
  return {
    onWordAdvance: vi.fn(),
    onChunkBoundary: vi.fn(),
    onEnd: vi.fn(),
    onError: vi.fn(),
    ...overrides,
  };
}

describe("TTS-PARITY-1: cache silence parity", () => {
  beforeEach(() => {
    (window as any).electronAPI.ttsCacheRead.mockReset();
  });

  it("fresh vs cache parity preserves audio length, duration, silenceMs, and timingTruth", async () => {
    const words = ["Hello", "world."];
    const onChunkReady = vi.fn();
    const onCacheChunk = vi.fn();
    const config: PipelineConfig = {
      generateFn: vi.fn().mockResolvedValue({
        audio: new Float32Array(2400),
        sampleRate: 24000,
        durationMs: 100,
        wordTimestamps: [
          { word: "Hello", startTime: 0, endTime: 0.04 },
          { word: "world.", startTime: 0.04, endTime: 0.08 },
        ],
      }),
      getWords: () => words,
      getVoiceId: () => "af_heart",
      getSpeed: () => 1,
      getPauseConfig: () => ({
        commaMs: 60,
        clauseMs: 120,
        sentenceMs: 240,
        paragraphMs: 400,
        dialogueThreshold: 1,
      }),
      getCacheIdentity: (_text, _chunkWords, startIdx): TtsCacheIdentity => ({
        schemaVersion: 2,
        provider: "kokoro",
        voiceId: "af_heart",
        rateBucket: 1,
        sourceTextHash: "src",
        normalizedTextHash: "norm",
        normalizerVersion: "en-v2",
        pronunciationOverrideHash: "",
        documentLocator: { bookId: "book-1" },
        chunkId: `book-1:${startIdx}`,
        sampleRate: 24000,
        timingTruth: "word-native",
      }),
      onChunkReady,
      onCacheChunk,
      onError: vi.fn(),
      onEnd: vi.fn(),
    };

    const pipeline = createGenerationPipeline(config);
    pipeline.start(0);
    await vi.waitFor(() => expect(onCacheChunk).toHaveBeenCalled(), { timeout: 1000 });

    const freshChunk = onChunkReady.mock.calls[0][0] as ScheduledChunk;
    const cachedAudio = onCacheChunk.mock.calls[0][1] as Float32Array;
    const cachedSampleRate = onCacheChunk.mock.calls[0][2] as number;
    const cachedDurationMs = onCacheChunk.mock.calls[0][3] as number;
    const cachedWordCount = onCacheChunk.mock.calls[0][4] as number;
    const timingMetadata = onCacheChunk.mock.calls[0][6] as {
      timingTruth: string;
      chunkStartIdx: number;
      chunkEndIdx: number;
      boundaryType?: string;
      silenceMs?: number;
      wordTimestamps?: { word: string; startTime: number; endTime: number }[] | null;
    };

    (window as any).electronAPI.ttsCacheRead.mockResolvedValue({
      audio: cachedAudio,
      sampleRate: cachedSampleRate,
      durationMs: cachedDurationMs,
      wordCount: cachedWordCount,
      timing: {
        schemaVersion: 1,
        cacheSchemaVersion: 2,
        identityHash: "parity-hash",
        provider: "kokoro",
        voiceId: "af_heart",
        durationMs: cachedDurationMs,
        sampleRate: cachedSampleRate,
        wordCount: cachedWordCount,
        timingTruth: timingMetadata.timingTruth,
        timingClassification: "trusted",
        chunkStartIdx: timingMetadata.chunkStartIdx,
        chunkEndIdx: timingMetadata.chunkEndIdx,
        boundaryType: timingMetadata.boundaryType ?? null,
        silenceMs: timingMetadata.silenceMs ?? 0,
        createdAt: new Date().toISOString(),
        wordTimestamps: timingMetadata.wordTimestamps ?? null,
      },
    });

    const cached = await loadCachedChunk("book-1", "voice-1", 0, words);
    expect(cached).not.toBeNull();
    expect(cached?.audio.length).toBe(freshChunk.audio.length);
    expect(cached?.durationMs).toBe(freshChunk.durationMs);
    expect(cached?.silenceMs).toBe(freshChunk.silenceMs);
    expect(cached?.timingTruth).toBe(freshChunk.timingTruth);

    pipeline.stop();
  });
});

describe("TTS-PARITY-1: trusted progress should not lag", () => {
  let mockCurrentTime = 0;

  beforeEach(() => {
    mockCurrentTime = 0;

    class MockAudioBufferSourceNode {
      buffer: unknown = null;
      playbackRate = { value: 1.0 };
      onended: (() => void) | null = null;
      connect() { return this; }
      disconnect() {}
      start() {}
      stop() {}
    }

    class MockAudioBuffer {
      length = 0;
      getChannelData() { return new Float32Array(this.length); }
      copyToChannel() {}
    }

    class MockAudioContext {
      sampleRate = KOKORO_SAMPLE_RATE;
      state = "running";
      get currentTime() { return mockCurrentTime; }
      createBuffer(_channels: number, length: number) {
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

  it("getAudioProgress() applies output-latency lag for trusted word timing", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks(makeCallbacks());
    scheduler.play();
    scheduler.scheduleChunk({
      audio: new Float32Array(KOKORO_SAMPLE_RATE),
      sampleRate: KOKORO_SAMPLE_RATE,
      durationMs: 1000,
      words: ["alpha", "beta"],
      startIdx: 0,
      timingTruth: "word-native",
      wordTimestamps: [
        { word: "alpha", startTime: 0, endTime: 0.45 },
        { word: "beta", startTime: 0.45, endTime: 0.9 },
      ],
    });

    // NARR-FIX-1: Trusted timing now applies TTS_TRUSTED_CURSOR_LAG_MS (120ms)
    // to compensate for audio output latency. audioTime reflects the lagged clock.
    mockCurrentTime = 1.0;
    const report = scheduler.getAudioProgress();
    expect(report).not.toBeNull();
    expect(report?.audioTime).toBeCloseTo(0.88, 2);

    scheduler.stop();
  });
});

describe("TTS-PARITY-1: resume backpressure gating", () => {
  it("pipeline resume flush emits no more than queueDepth synchronously", async () => {
    const words = Array.from({ length: 800 }, (_, idx) => (idx % 8 === 7 ? `Word${idx}.` : `Word${idx}`));
    const queueDepth = 2;
    const onChunkReady = vi.fn();
    const generateFn = vi.fn().mockImplementation(
      async () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              audio: new Float32Array(2400),
              sampleRate: 24000,
              durationMs: 100,
            });
          }, 0);
        }),
    );

    const pipeline = createGenerationPipeline({
      generateFn,
      getWords: () => words,
      getVoiceId: () => "af_heart",
      getSpeed: () => 1,
      onChunkReady,
      onError: vi.fn(),
      onEnd: vi.fn(),
      queueDepth,
    });

    pipeline.start(0);
    pipeline.pause();

    await vi.waitFor(() => {
      expect(generateFn.mock.calls.length).toBeGreaterThan(queueDepth);
    }, { timeout: 1500 });

    const beforeResume = onChunkReady.mock.calls.length;
    pipeline.resume();
    const syncFlushCount = onChunkReady.mock.calls.length - beforeResume;
    expect(syncFlushCount).toBeGreaterThan(0);
    expect(syncFlushCount).toBeLessThanOrEqual(queueDepth);

    pipeline.acknowledgeChunk();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onChunkReady.mock.calls.length).toBeGreaterThan(beforeResume + syncFlushCount);

    pipeline.stop();
  });
});
