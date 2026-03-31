// @vitest-environment jsdom
// tests/generationPipeline.test.ts — Tests for NAR-2 generation pipeline
import { describe, it, expect, vi, beforeEach } from "vitest";

// Must set up electronAPI before imports
vi.hoisted(() => {
  (globalThis as any).window = (globalThis as any).window || {};
  (globalThis as any).window.electronAPI = {
    ttsCacheHas: vi.fn().mockResolvedValue(false),
    ttsCacheRead: vi.fn().mockResolvedValue({ miss: true }),
    ttsCacheWrite: vi.fn().mockResolvedValue({ success: true }),
  };
});

import { getChunkSize, createGenerationPipeline, type PipelineConfig } from "../src/utils/generationPipeline";
import { TTS_COLD_START_CHUNK_WORDS, TTS_CRUISE_CHUNK_WORDS } from "../src/constants";

// ── Chunk Sizing Tests ────────────────────────────────────────────────────────

describe("getChunkSize", () => {
  it("chunk 0 returns TTS_COLD_START_CHUNK_WORDS", () => {
    expect(getChunkSize(0)).toBe(TTS_COLD_START_CHUNK_WORDS);
  });

  it("chunk 1 is double chunk 0 (doubling ramp-up)", () => {
    expect(getChunkSize(1)).toBe(TTS_COLD_START_CHUNK_WORDS * 2);
  });

  it("chunk 4+ returns TTS_CRUISE_CHUNK_WORDS", () => {
    expect(getChunkSize(4)).toBe(TTS_CRUISE_CHUNK_WORDS);
  });

  it("chunk 10 is capped at TTS_CRUISE_CHUNK_WORDS (no unbounded growth)", () => {
    expect(getChunkSize(10)).toBe(TTS_CRUISE_CHUNK_WORDS);
  });

  it("doubling ramp sequence: 13 → 26 → 52 → 104 → 148", () => {
    const sizes = [0, 1, 2, 3, 4].map(i => getChunkSize(i));
    expect(sizes).toEqual([13, 26, 52, 104, TTS_CRUISE_CHUNK_WORDS]);
  });
});

// ── Pipeline Tests ────────────────────────────────────────────────────────────

function makeWords(count: number): string[] {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(i % 10 === 9 ? `word${i}.` : `word${i}`);
  }
  return words;
}

function makeConfig(overrides?: Partial<PipelineConfig>): PipelineConfig {
  const words = makeWords(200);
  return {
    generateFn: vi.fn().mockResolvedValue({
      audio: new Float32Array(24000),
      sampleRate: 24000,
      durationMs: 1000,
    }),
    getWords: () => words,
    getVoiceId: () => "af_heart",
    getSpeed: () => 1.0,
    onChunkReady: vi.fn(),
    onError: vi.fn(),
    onEnd: vi.fn(),
    ...overrides,
  };
}

describe("createGenerationPipeline", () => {
  it("start fires generation and calls onChunkReady", async () => {
    const config = makeConfig();
    const pipeline = createGenerationPipeline(config);

    pipeline.start(0);
    await vi.waitFor(() => expect(config.onChunkReady).toHaveBeenCalled());

    pipeline.stop();
  });

  it("generates at the speed returned by getSpeed (native speed generation)", async () => {
    const generateFn = vi.fn().mockResolvedValue({
      audio: new Float32Array(24000),
      sampleRate: 24000,
      durationMs: 1000,
    });
    const config = makeConfig({ generateFn, getSpeed: () => 1.5 });
    const pipeline = createGenerationPipeline(config);

    pipeline.start(0);
    await vi.waitFor(() => expect(generateFn).toHaveBeenCalled());

    // Third argument to generateFn is speed — should match getSpeed()
    expect(generateFn.mock.calls[0][2]).toBe(1.5);

    pipeline.stop();
  });

  it("first chunk uses TTS_COLD_START_CHUNK_WORDS words", async () => {
    const onChunkReady = vi.fn();
    const config = makeConfig({ onChunkReady });
    const pipeline = createGenerationPipeline(config);

    pipeline.start(0);
    await vi.waitFor(() => expect(onChunkReady).toHaveBeenCalled());

    const firstChunk = onChunkReady.mock.calls[0][0];
    expect(firstChunk.startIdx).toBe(0);
    expect(firstChunk.words.length).toBe(TTS_COLD_START_CHUNK_WORDS);

    pipeline.stop();
  });

  it("stop cancels generation (no more onChunkReady after stop)", async () => {
    const onChunkReady = vi.fn();
    const config = makeConfig({ onChunkReady });
    const pipeline = createGenerationPipeline(config);

    pipeline.start(0);
    await vi.waitFor(() => expect(onChunkReady).toHaveBeenCalled());

    const callCount = onChunkReady.mock.calls.length;
    pipeline.stop();

    await new Promise(r => setTimeout(r, 50));
    // May have one more in flight, but shouldn't keep growing
    expect(onChunkReady.mock.calls.length).toBeLessThanOrEqual(callCount + 1);
  });

  it("flush restarts from new position", async () => {
    const onChunkReady = vi.fn();
    const config = makeConfig({ onChunkReady });
    const pipeline = createGenerationPipeline(config);

    pipeline.start(0);
    await vi.waitFor(() => expect(onChunkReady).toHaveBeenCalled());

    const countBefore = onChunkReady.mock.calls.length;
    pipeline.flush(100);
    await vi.waitFor(() => expect(onChunkReady.mock.calls.length).toBeGreaterThan(countBefore));

    // After flush, at least one chunk should start at 100 (the first ramp chunk)
    const postFlushCalls = onChunkReady.mock.calls.slice(countBefore);
    const hasChunkAt100 = postFlushCalls.some((call: any) => call[0].startIdx === 100);
    expect(hasChunkAt100).toBe(true);

    pipeline.stop();
  });

  it("fires onEnd when all words exhausted", async () => {
    const shortWords = makeWords(10);
    const onEnd = vi.fn();
    const config = makeConfig({ getWords: () => shortWords, onEnd });
    const pipeline = createGenerationPipeline(config);

    pipeline.start(0);
    await vi.waitFor(() => expect(onEnd).toHaveBeenCalled(), { timeout: 3000 });

    pipeline.stop();
  });

  it("fires onError on generation failure", async () => {
    const onError = vi.fn();
    const config = makeConfig({
      generateFn: vi.fn().mockResolvedValue({ error: "model crash" }),
      onError,
    });
    const pipeline = createGenerationPipeline(config);

    pipeline.start(0);
    await vi.waitFor(() => expect(onError).toHaveBeenCalled());

    pipeline.stop();
  });
});
