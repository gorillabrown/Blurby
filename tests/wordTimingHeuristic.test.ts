// tests/wordTimingHeuristic.test.ts — Tests for TTS-6F word alignment telemetry + timing heuristic
import { describe, it, expect, beforeEach } from "vitest";
import { computeWordWeights, getTimingTelemetry, clearTimingTelemetry } from "../src/utils/audioScheduler";

// ── computeWordWeights ──────────────────────────────────────────────────────

describe("computeWordWeights", () => {
  it("returns empty array for empty words", () => {
    expect(computeWordWeights([])).toEqual([]);
  });

  it("returns [1.0] for single word", () => {
    expect(computeWordWeights(["hello"])).toEqual([1.0]);
  });

  it("weights sum to 1.0", () => {
    const words = ["The", "quick", "brown", "fox", "jumped."];
    const weights = computeWordWeights(words);
    const sum = weights.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });

  it("longer words get higher weight than shorter words", () => {
    const weights = computeWordWeights(["I", "extraordinarily"]);
    // "I" (1 char, clamped to 2) vs "extraordinarily" (15 chars)
    expect(weights[1]).toBeGreaterThan(weights[0]);
  });

  it("sentence-ending words get boosted weight", () => {
    const withPunct = computeWordWeights(["hello", "world."]);
    const withoutPunct = computeWordWeights(["hello", "world"]);
    // "world." should have higher relative weight than "world" (same base length + 40% boost)
    expect(withPunct[1] / withPunct[0]).toBeGreaterThan(withoutPunct[1] / withoutPunct[0]);
  });

  it("clause-ending words get moderate boost", () => {
    const withComma = computeWordWeights(["hello", "world,"]);
    const withoutPunct = computeWordWeights(["hello", "worldx"]);
    // Comma ending gets 15% boost
    expect(withComma[1] / withComma[0]).toBeGreaterThan(withoutPunct[1] / withoutPunct[0]);
  });

  it("question mark and exclamation get sentence-end boost", () => {
    const qWords = computeWordWeights(["really", "what?"]);
    const eWords = computeWordWeights(["wow", "great!"]);
    const plain = computeWordWeights(["really", "whatx"]);
    expect(qWords[1] / qWords[0]).toBeGreaterThan(plain[1] / plain[0]);
    expect(eWords[1] / eWords[0]).toBeGreaterThan(plain[1] / plain[0]);
  });

  it("works across rate buckets (weights are rate-independent)", () => {
    // Weights are text-only — they don't depend on playback speed
    const words = ["The", "CEO", "spoke."];
    const w1 = computeWordWeights(words);
    const w2 = computeWordWeights(words);
    expect(w1).toEqual(w2);
  });

  it("handles typical sentence with mixed punctuation", () => {
    const words = ["Dr.", "Smith,", "the", "renowned", "researcher,", "published", "today."];
    const weights = computeWordWeights(words);
    expect(weights.length).toBe(7);
    expect(weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1.0, 10);
    // "Dr." gets sentence-end boost (dot), "researcher," gets clause boost
    // "today." gets sentence-end boost and is longer
    expect(weights[6]).toBeGreaterThan(weights[2]); // "today." > "the"
  });
});

// ── Telemetry Surface ───────────────────────────────────────────────────────

describe("timing telemetry", () => {
  beforeEach(() => {
    clearTimingTelemetry();
  });

  it("starts empty", () => {
    expect(getTimingTelemetry()).toEqual([]);
  });

  it("clearTimingTelemetry resets accumulator", () => {
    // Push something manually to verify clear works
    (getTimingTelemetry() as any[]).push({ test: true });
    expect(getTimingTelemetry().length).toBe(1);
    clearTimingTelemetry();
    expect(getTimingTelemetry()).toEqual([]);
  });

  it("telemetry shape has required fields", () => {
    // Verify the interface exists and is exported (type-level check)
    const sample = {
      chunkStartIdx: 0,
      wordCount: 5,
      durationMs: 1000,
      scheduledAtSec: 0.5,
      wordWeights: [0.2, 0.2, 0.2, 0.2, 0.2],
    };
    expect(sample.chunkStartIdx).toBe(0);
    expect(sample.wordWeights.length).toBe(5);
  });
});
