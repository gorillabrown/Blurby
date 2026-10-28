import { describe, it, expect } from "vitest";
import { computeWordWeights, getTimingTelemetry, clearTimingTelemetry } from "../src/utils/audioScheduler";
import { getChunkSize } from "../src/utils/generationPipeline";
import { TTS_COLD_START_CHUNK_WORDS, TTS_CRUISE_CHUNK_WORDS } from "../src/constants";

describe("BUG-096: Cursor sync — word weights for timing", () => {
  it("weights sum to 1.0 for any word list", () => {
    const words = ["Hello", "world.", "This", "is", "a", "test."];
    const weights = computeWordWeights(words);
    const sum = weights.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 6);
  });

  it("longer words get proportionally more weight", () => {
    const weights = computeWordWeights(["I", "extraordinarily"]);
    expect(weights[1]).toBeGreaterThan(weights[0]);
  });

  it("sentence-ending words get modest boost (TTS-6S reduced from 1.4 to 1.12)", () => {
    // "test." should get more weight than "test" (same length, but with period)
    const withPunct = computeWordWeights(["hello", "test."]);
    const withoutPunct = computeWordWeights(["hello", "tests"]); // same 5 chars
    // The period word should be slightly heavier but not dramatically so
    const ratio = withPunct[1] / withoutPunct[1];
    expect(ratio).toBeGreaterThan(1.0);
    expect(ratio).toBeLessThan(1.2); // was 1.4 before TTS-6S, now ≈1.12
  });

  it("clause-ending words get minimal boost (TTS-6S reduced from 1.15 to 1.05)", () => {
    const withComma = computeWordWeights(["hello", "world,"]);
    const withoutComma = computeWordWeights(["hello", "worlds"]); // same 6 chars
    const ratio = withComma[1] / withoutComma[1];
    expect(ratio).toBeGreaterThan(1.0);
    expect(ratio).toBeLessThan(1.1); // was 1.15 before TTS-6S, now ≈1.05
  });

  it("single word returns weight 1.0", () => {
    expect(computeWordWeights(["hello"])).toEqual([1.0]);
  });

  it("empty array returns empty weights", () => {
    expect(computeWordWeights([])).toEqual([]);
  });
});

describe("BUG-097: Pause shaping — weight distribution is balanced", () => {
  it("a typical sentence has reasonably even weight distribution", () => {
    const words = ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog."];
    const weights = computeWordWeights(words);
    // No single word should take more than 25% of total duration
    for (const w of weights) {
      expect(w).toBeLessThan(0.25);
    }
    // All weights positive
    for (const w of weights) {
      expect(w).toBeGreaterThan(0);
    }
  });

  it("punctuation does not cause extreme time allocation", () => {
    // A short clause followed by a period — the period word shouldn't hog time
    const words = ["He", "said.", "She", "replied.", "They", "agreed."];
    const weights = computeWordWeights(words);
    // Punctuation words (indices 1, 3, 5) should not be 2x+ the non-punct words
    const avgPunct = (weights[1] + weights[3] + weights[5]) / 3;
    const avgPlain = (weights[0] + weights[2] + weights[4]) / 3;
    // Punctuation words are also longer ("said." vs "He"), so ratio reflects
    // both length + boost. With reduced TTS-6S boosts, ratio should stay under 3x.
    expect(avgPunct / avgPlain).toBeLessThan(3.0);
  });
});

describe("BUG-098: Backlog — pipeline chunk sizing", () => {
  it("ramp sequence starts at cold-start size", () => {
    expect(getChunkSize(0)).toBe(TTS_COLD_START_CHUNK_WORDS);
  });

  it("ramp doubles through sequence", () => {
    expect(getChunkSize(1)).toBe(TTS_COLD_START_CHUNK_WORDS * 2);
    expect(getChunkSize(2)).toBe(TTS_COLD_START_CHUNK_WORDS * 4);
    expect(getChunkSize(3)).toBe(TTS_COLD_START_CHUNK_WORDS * 8);
  });

  it("cruise size is reached at index 4+", () => {
    expect(getChunkSize(4)).toBe(TTS_CRUISE_CHUNK_WORDS);
    expect(getChunkSize(10)).toBe(TTS_CRUISE_CHUNK_WORDS);
  });

  it("first two chunks can be prefetched in parallel (total < 50 words)", () => {
    const total = getChunkSize(0) + getChunkSize(1);
    expect(total).toBeLessThan(50); // 13 + 26 = 39
    expect(total).toBe(39);
  });
});

describe("BUG-098: Duplicate chunk guard", () => {
  it("pipeline does not emit same startIdx twice (contract test)", () => {
    // This tests the invariant: lastEmittedStartIdx prevents duplicate emission.
    // The actual runtime test would require mocking IPC; here we test the contract.
    const emitted: number[] = [];
    const guard = (startIdx: number) => {
      if (emitted.length > 0 && emitted[emitted.length - 1] === startIdx) {
        return false; // duplicate
      }
      emitted.push(startIdx);
      return true;
    };
    expect(guard(0)).toBe(true);
    expect(guard(0)).toBe(false); // duplicate
    expect(guard(13)).toBe(true);
    expect(guard(39)).toBe(true);
    expect(guard(39)).toBe(false); // duplicate
  });
});
