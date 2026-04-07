// @vitest-environment jsdom
// tests/narrTiming.test.ts — Tests for NARR-TIMING real word timestamps feature
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { KOKORO_SAMPLE_RATE } from "../src/constants";

// ── MockAudioContext (same pattern as audioScheduler.test.ts) ─────────────────

let mockCurrentTime = 0;
let startedSources: { startTime: number; playbackRate: number }[] = [];

beforeEach(() => {
  mockCurrentTime = 0;
  startedSources = [];

  class MockAudioBufferSourceNode {
    buffer: any = null;
    playbackRate = { value: 1.0 };
    onended: (() => void) | null = null;
    connect() { return this; }
    start(when?: number) {
      startedSources.push({ startTime: when || 0, playbackRate: this.playbackRate.value });
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

import {
  createAudioScheduler,
  computeWordWeights,
  getTimingTelemetry,
  clearTimingTelemetry,
  type ScheduledChunk,
} from "../src/utils/audioScheduler";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeChunkWithTimestamps(
  startIdx: number,
  words: string[],
  timestamps: { word: string; startTime: number; endTime: number }[] | null,
  opts?: { durationMs?: number; silenceMs?: number }
): ScheduledChunk {
  const durationMs = opts?.durationMs ?? 1000;
  return {
    audio: new Float32Array(Math.round((durationMs / 1000) * KOKORO_SAMPLE_RATE)),
    sampleRate: KOKORO_SAMPLE_RATE,
    durationMs,
    words,
    startIdx,
    wordTimestamps: timestamps,
    silenceMs: opts?.silenceMs,
  };
}

function makeValidTimestamps(words: string[], durationSec = 1.0): { word: string; startTime: number; endTime: number }[] {
  return words.map((word, i) => ({
    word,
    startTime: (i / words.length) * durationSec,
    endTime: ((i + 1) / words.length) * durationSec,
  }));
}

// ── Duplicate of computeWordTimestamps from kokoro-js fork (pure function, no deps) ──

function computeWordTimestamps(
  durations: Float32Array,
  words: string[],
  tokenCounts: number[],
  sampleRate: number,
  waveformLength: number
): { word: string; startTime: number; endTime: number }[] {
  const HOP_LENGTH = 256;
  const roundedDur = new Float32Array(durations.length);
  for (let i = 0; i < durations.length; i++) {
    roundedDur[i] = Math.max(0, Math.round(durations[i]));
  }
  const timestamps: { word: string; startTime: number; endTime: number }[] = [];
  let tokenOffset = 1;
  let sampleOffset = roundedDur[0] * HOP_LENGTH;
  for (let w = 0; w < words.length; w++) {
    const numTokens = tokenCounts[w];
    if (numTokens === 0) {
      timestamps.push({ word: words[w], startTime: sampleOffset / sampleRate, endTime: sampleOffset / sampleRate });
      continue;
    }
    const startSample = sampleOffset;
    for (let t = 0; t < numTokens; t++) {
      const idx = tokenOffset + t;
      if (idx >= roundedDur.length) {
        throw new Error(`Token underrun at word ${w} ("${words[w]}"): need token ${idx} but tensor has ${roundedDur.length} entries`);
      }
      sampleOffset += roundedDur[idx] * HOP_LENGTH;
    }
    timestamps.push({ word: words[w], startTime: startSample / sampleRate, endTime: sampleOffset / sampleRate });
    tokenOffset += numTokens;
    if (w < words.length - 1) {
      if (tokenOffset >= roundedDur.length) {
        throw new Error(`Separator underrun after word ${w} ("${words[w]}"): need token ${tokenOffset} but tensor has ${roundedDur.length} entries`);
      }
      sampleOffset += roundedDur[tokenOffset] * HOP_LENGTH;
      tokenOffset += 1;
    }
  }
  let totalPredictedSamples = sampleOffset;
  for (let i = tokenOffset; i < roundedDur.length; i++) {
    totalPredictedSamples += roundedDur[i] * HOP_LENGTH;
  }
  const actualDurationSec = waveformLength / sampleRate;
  const totalPredictedDurationSec = totalPredictedSamples / sampleRate;
  const driftSec = Math.abs(totalPredictedDurationSec - actualDurationSec);
  const driftToleranceSec = Math.min(0.040, actualDurationSec * 0.05);
  if (driftSec > driftToleranceSec) {
    throw new Error(`Duration drift too large: predicted ${totalPredictedDurationSec.toFixed(3)}s vs actual ${actualDurationSec.toFixed(3)}s`);
  }
  for (let i = 1; i < timestamps.length; i++) {
    if (timestamps[i].startTime < timestamps[i - 1].startTime) {
      throw new Error(`Non-monotone timestamps at word ${i}`);
    }
  }
  for (let i = 0; i < timestamps.length; i++) {
    if (!isFinite(timestamps[i].startTime) || !isFinite(timestamps[i].endTime) ||
        timestamps[i].startTime < 0 || timestamps[i].endTime < 0) {
      throw new Error(`Invalid timestamp at word ${i}`);
    }
  }
  return timestamps;
}

// ── computeWordTimestamps unit tests ──────────────────────────────────────────

describe("computeWordTimestamps (duplicated pure function)", () => {
  const SR = KOKORO_SAMPLE_RATE; // 24000
  const HOP = 256;

  it("produces correct timestamps for two words with known durations", () => {
    // Layout: [leading, word0_tok0, separator, word1_tok0, trailing]
    // Each duration value D means D * HOP samples
    // leading=2, word0=10, sep=1, word1=8, trailing=3
    const durations = new Float32Array([2, 10, 1, 8, 3]);
    const words = ["hello", "world"];
    const tokenCounts = [1, 1];
    // waveformLength must match predicted total = (2+10+1+8+3)*HOP = 24*HOP
    const waveformLength = 24 * HOP;

    const result = computeWordTimestamps(durations, words, tokenCounts, SR, waveformLength);

    expect(result).toHaveLength(2);
    // word0: startSample = leading*HOP = 2*256 = 512, endSample = (2+10)*256 = 3072
    expect(result[0].word).toBe("hello");
    expect(result[0].startTime).toBeCloseTo(512 / SR, 6);
    expect(result[0].endTime).toBeCloseTo(3072 / SR, 6);
    // word1: startSample = (2+10+1)*256 = 3328, endSample = (2+10+1+8)*256 = 5376
    expect(result[1].word).toBe("world");
    expect(result[1].startTime).toBeCloseTo(3328 / SR, 6);
    expect(result[1].endTime).toBeCloseTo(5376 / SR, 6);
  });

  it("throws on token underrun (tensor too short for all words)", () => {
    // Only 2 entries: leading + word0 token, no room for word1
    const durations = new Float32Array([2, 10]);
    const words = ["hello", "world"];
    const tokenCounts = [1, 1];
    const waveformLength = 12 * HOP;

    expect(() => computeWordTimestamps(durations, words, tokenCounts, SR, waveformLength)).toThrow(
      /Token underrun|Separator underrun/
    );
  });

  it("throws when predicted duration vs actual exceeds drift tolerance", () => {
    // durations predict 24*HOP samples but waveformLength is only 10*HOP
    const durations = new Float32Array([2, 10, 1, 8, 3]);
    const words = ["hello", "world"];
    const tokenCounts = [1, 1];
    const waveformLength = 10 * HOP; // massively shorter than predicted 24*HOP

    expect(() => computeWordTimestamps(durations, words, tokenCounts, SR, waveformLength)).toThrow(
      /Duration drift too large/
    );
  });

  it("zero-token punctuation word gets zero-duration entry (startTime === endTime)", () => {
    // Single word with 0 tokens — punctuation-only / filler
    // Layout: [leading, actual_word_tok, trailing]
    // But for zero-token: leading=2, no tokens for ".", word "hello" has 1 token, trailing=1
    // words: ["hello", "."], tokenCounts: [1, 0]
    // [leading=2, word0_tok=8, separator=1, trailing=2] — no separator needed after last word
    const durations = new Float32Array([2, 8, 1, 2]);
    const words = ["hello", "."];
    const tokenCounts = [1, 0];
    const waveformLength = 13 * HOP; // (2+8+1+2)*HOP = 13*HOP

    const result = computeWordTimestamps(durations, words, tokenCounts, SR, waveformLength);

    expect(result).toHaveLength(2);
    // "hello": startSample=2*256=512, endSample=(2+8)*256=2560
    expect(result[0].startTime).toBeCloseTo(512 / SR, 6);
    expect(result[0].endTime).toBeCloseTo(2560 / SR, 6);
    // ".": zero-token, startTime === endTime === current sampleOffset at that point
    // After word0: tokenOffset = 1+1=2, sampleOffset includes separator = (2+8+1)*256=2816
    expect(result[1].startTime).toBeCloseTo(result[1].endTime, 6);
  });

  it("throws on separator underrun (tensor missing separator between words)", () => {
    // Layout needs: [leading, w0_tok, separator, w1_tok]
    // Provide only [leading, w0_tok] — missing separator
    const durations = new Float32Array([2, 8]);
    const words = ["hello", "world"];
    const tokenCounts = [1, 1];
    const waveformLength = 10 * HOP;

    expect(() => computeWordTimestamps(durations, words, tokenCounts, SR, waveformLength)).toThrow(
      /Separator underrun|Token underrun/
    );
  });

  it("timestamps are monotonically increasing for normal input", () => {
    // Three words, well-formed tensor
    const durations = new Float32Array([1, 5, 1, 6, 1, 4, 2]);
    // leading=1, w0=5, sep=1, w1=6, sep=1, w2=4, trailing=2 → total=20
    const words = ["one", "two", "three"];
    const tokenCounts = [1, 1, 1];
    const waveformLength = 20 * HOP;

    const result = computeWordTimestamps(durations, words, tokenCounts, SR, waveformLength);

    expect(result).toHaveLength(3);
    expect(result[1].startTime).toBeGreaterThan(result[0].startTime);
    expect(result[2].startTime).toBeGreaterThan(result[1].startTime);
  });
});

// ── validateWordTimestamps via scheduler (indirect, via telemetry) ────────────

describe("validateWordTimestamps — scheduler fallback behavior (via telemetry)", () => {
  beforeEach(() => {
    clearTimingTelemetry();
  });

  it("scheduler uses real timestamps when chunk has valid wordTimestamps", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    const words = ["hello", "world", "foo"];
    const timestamps = makeValidTimestamps(words, 1.0);
    const chunk = makeChunkWithTimestamps(0, words, timestamps, { durationMs: 1000 });
    scheduler.scheduleChunk(chunk);

    const telemetry = getTimingTelemetry();
    expect(telemetry.length).toBe(1);
    expect((telemetry[0] as any).timestampSource).toBe("kokoro-duration-tensor");

    scheduler.stop();
  });

  it("scheduler falls back to heuristic when wordTimestamps is null", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    const words = ["hello", "world", "foo"];
    const chunk = makeChunkWithTimestamps(0, words, null, { durationMs: 1000 });
    scheduler.scheduleChunk(chunk);

    const telemetry = getTimingTelemetry();
    expect(telemetry.length).toBe(1);
    expect((telemetry[0] as any).timestampSource).toBe("heuristic");

    scheduler.stop();
  });

  it("scheduler falls back to heuristic when timestamps array length mismatches words", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    const words = ["hello", "world", "foo"];
    // Only 2 timestamps for 3 words — length mismatch
    const badTimestamps = [
      { word: "hello", startTime: 0, endTime: 0.3 },
      { word: "world", startTime: 0.3, endTime: 0.7 },
    ];
    const chunk = makeChunkWithTimestamps(0, words, badTimestamps, { durationMs: 1000 });
    scheduler.scheduleChunk(chunk);

    const telemetry = getTimingTelemetry();
    expect(telemetry.length).toBe(1);
    expect((telemetry[0] as any).timestampSource).toBe("heuristic");

    scheduler.stop();
  });

  it("scheduler falls back when timestamps have non-monotone startTimes", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    const words = ["hello", "world", "foo"];
    // word1 startTime is less than word0 startTime — non-monotone
    const badTimestamps = [
      { word: "hello", startTime: 0.4, endTime: 0.6 },
      { word: "world", startTime: 0.2, endTime: 0.7 }, // 0.2 < 0.4 — non-monotone
      { word: "foo",   startTime: 0.7, endTime: 0.9 },
    ];
    const chunk = makeChunkWithTimestamps(0, words, badTimestamps, { durationMs: 1000 });
    scheduler.scheduleChunk(chunk);

    const telemetry = getTimingTelemetry();
    expect(telemetry.length).toBe(1);
    expect((telemetry[0] as any).timestampSource).toBe("heuristic");

    scheduler.stop();
  });

  it("scheduler falls back when timestamps have word string mismatch", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    const words = ["hello", "world", "foo"];
    const badTimestamps = [
      { word: "hello",  startTime: 0.0, endTime: 0.33 },
      { word: "WRONG",  startTime: 0.33, endTime: 0.66 }, // word mismatch
      { word: "foo",    startTime: 0.66, endTime: 0.99 },
    ];
    const chunk = makeChunkWithTimestamps(0, words, badTimestamps, { durationMs: 1000 });
    scheduler.scheduleChunk(chunk);

    const telemetry = getTimingTelemetry();
    expect(telemetry.length).toBe(1);
    expect((telemetry[0] as any).timestampSource).toBe("heuristic");

    scheduler.stop();
  });

  it("scheduler falls back when timestamps overshoot speech duration beyond tolerance", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    const words = ["hello", "world"];
    // durationMs=1000ms → speechDurationSec=1.0; tolerance = min(0.040, 0.05) = 0.040
    // endTime 1.1 > 1.040 → overshoot rejection
    const badTimestamps = [
      { word: "hello", startTime: 0.0, endTime: 0.5 },
      { word: "world", startTime: 0.5, endTime: 1.1 },
    ];
    const chunk = makeChunkWithTimestamps(0, words, badTimestamps, { durationMs: 1000 });
    scheduler.scheduleChunk(chunk);

    const telemetry = getTimingTelemetry();
    expect(telemetry.length).toBe(1);
    expect((telemetry[0] as any).timestampSource).toBe("heuristic");

    scheduler.stop();
  });

  it("silenceMs is correctly excluded from speech duration in validation", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    const words = ["hello", "world"];
    // durationMs=1500, silenceMs=500 → speechDurationSec=1.0
    // timestamps end at 0.95 which is within 1.0 + tolerance → should pass validation
    const timestamps = [
      { word: "hello", startTime: 0.0, endTime: 0.45 },
      { word: "world", startTime: 0.45, endTime: 0.95 },
    ];
    const chunk = makeChunkWithTimestamps(0, words, timestamps, { durationMs: 1500, silenceMs: 500 });
    scheduler.scheduleChunk(chunk);

    const telemetry = getTimingTelemetry();
    expect(telemetry.length).toBe(1);
    expect((telemetry[0] as any).timestampSource).toBe("kokoro-duration-tensor");

    scheduler.stop();
  });
});

// ── computeWordBoundaries via scheduler ───────────────────────────────────────

describe("computeWordBoundaries — boundary times (via scheduler)", () => {
  beforeEach(() => {
    clearTimingTelemetry();
  });

  it("real timestamps produce correct boundary times in telemetry entry", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    const words = ["alpha", "beta", "gamma"];
    const timestamps = [
      { word: "alpha", startTime: 0.0,  endTime: 0.30 },
      { word: "beta",  startTime: 0.30, endTime: 0.65 },
      { word: "gamma", startTime: 0.65, endTime: 0.95 },
    ];
    const chunk = makeChunkWithTimestamps(0, words, timestamps, { durationMs: 1000 });
    scheduler.scheduleChunk(chunk);

    const telemetry = getTimingTelemetry();
    expect(telemetry.length).toBe(1);
    const entry = telemetry[0] as any;
    expect(entry.timestampSource).toBe("kokoro-duration-tensor");
    // Real timestamps were stored in the telemetry entry
    expect(entry.realTimestamps).toBeDefined();
    expect(entry.realTimestamps).toHaveLength(3);
    expect(entry.realTimestamps[0].word).toBe("alpha");
    expect(entry.realTimestamps[0].startTime).toBeCloseTo(0.0, 6);
    expect(entry.realTimestamps[1].word).toBe("beta");
    expect(entry.realTimestamps[1].startTime).toBeCloseTo(0.30, 6);

    scheduler.stop();
  });

  it("heuristic fallback (null timestamps) still produces a telemetry entry with wordWeights", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    const words = ["one", "two", "three", "four"];
    const chunk = makeChunkWithTimestamps(0, words, null, { durationMs: 1000 });
    scheduler.scheduleChunk(chunk);

    const telemetry = getTimingTelemetry();
    expect(telemetry.length).toBe(1);
    const entry = telemetry[0] as any;
    expect(entry.timestampSource).toBe("heuristic");
    expect(entry.wordWeights).toBeDefined();
    expect(entry.wordWeights).toHaveLength(4);
    // Heuristic weights must sum to 1.0
    const sum = (entry.wordWeights as number[]).reduce((a: number, b: number) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 10);

    scheduler.stop();
  });
});

// ── Regression: computeWordWeights heuristic unchanged ───────────────────────

describe("computeWordWeights regression", () => {
  it("heuristic produces expected normalized weights for a known sentence", () => {
    const words = ["The", "quick", "fox."];
    const weights = computeWordWeights(words);

    // Weights must sum to 1.0
    expect(weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1.0, 10);
    // "fox." (4 chars × 1.12 sentence factor = 4.48) vs "quick" (5 chars, no boost = 5.0)
    // "quick" wins on raw length, "fox." wins over "The" (3 chars)
    expect(weights[1]).toBeGreaterThan(weights[2]); // "quick" (5) > "fox." (4 * 1.12 = 4.48)
    expect(weights[2]).toBeGreaterThan(weights[0]); // "fox." (4.48) > "The" (3)
    // "quick" (5 chars) should outweigh "The" (3 chars, clamped to 3)
    expect(weights[1]).toBeGreaterThan(weights[0]);
  });

  it("heuristic is deterministic — same words produce identical weights", () => {
    const words = ["Hello,", "beautiful", "world."];
    const w1 = computeWordWeights(words);
    const w2 = computeWordWeights(words);
    expect(w1).toEqual(w2);
  });

  it("heuristic with custom weight config scales punctuation weights", () => {
    const words = ["keep", "going."];
    const defaultWeights = computeWordWeights(words);
    const scaledWeights = computeWordWeights(words, { sentenceWeightFactor: 2.0 });

    // With factor 2.0 vs default 1.12, "going." should have a higher relative weight
    expect(scaledWeights[1] / scaledWeights[0]).toBeGreaterThan(defaultWeights[1] / defaultWeights[0]);
  });
});
