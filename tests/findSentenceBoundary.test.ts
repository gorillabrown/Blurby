import { describe, it, expect } from "vitest";

/**
 * Copy of findSentenceBoundary from src/hooks/useNarration.ts (lines 33-51).
 * This function is not exported, so we replicate it here for testing.
 * Keep in sync with source — if source changes, update this copy.
 */
function findSentenceBoundary(
  words: string[],
  startIdx: number,
  chunkSize: number,
  pageEnd?: number | null
): number {
  const hardMax =
    pageEnd != null ? Math.min(pageEnd + 1, words.length) : words.length;
  const maxEnd = Math.min(startIdx + chunkSize, hardMax);

  // Find the FIRST sentence ending — one sentence per chunk for natural pauses
  // Start scanning from word 1 (allow at least 1 word per chunk)
  for (let i = startIdx; i < maxEnd; i++) {
    if (/[.!?]["'\u201D\u2019)]*$/.test(words[i])) return Math.min(i + 1, hardMax);
  }
  // No sentence ending within chunk — scan further (up to 2x) for one
  if (hardMax > maxEnd) {
    const extendedMax = Math.min(startIdx + chunkSize * 2, hardMax);
    for (let i = maxEnd; i < extendedMax; i++) {
      if (/[.!?]["'\u201D\u2019)]*$/.test(words[i])) return Math.min(i + 1, hardMax);
    }
  }
  // Still no boundary — use the chunk size limit
  return maxEnd;
}

describe("findSentenceBoundary", () => {
  it("finds sentence ending with period", () => {
    const words = ["Hello", "world.", "Next"];
    expect(findSentenceBoundary(words, 0, 40)).toBe(2);
  });

  it("finds sentence ending with exclamation mark", () => {
    const words = ["What", "a", "great", "day!", "More", "words"];
    expect(findSentenceBoundary(words, 0, 40)).toBe(4);
  });

  it("finds sentence ending with question mark", () => {
    const words = ["Is", "this", "right?", "Yes"];
    expect(findSentenceBoundary(words, 0, 40)).toBe(3);
  });

  it("finds sentence ending with closing quote after period", () => {
    const words = ["He", "said", 'goodbye."', "Then"];
    expect(findSentenceBoundary(words, 0, 40)).toBe(3);
  });

  it("returns maxEnd when no sentence ending within chunk", () => {
    const words = ["no", "punctuation", "here", "at", "all"];
    expect(findSentenceBoundary(words, 0, 5)).toBe(5);
  });

  it("extended scan finds boundary beyond chunk size within 2x", () => {
    // chunkSize=5, sentence ends at word 7 (index 7), words.length > 10
    const words = [
      "word0", "word1", "word2", "word3", "word4",
      "word5", "word6", "done.", "word8", "word9", "word10",
    ];
    // maxEnd = 0+5 = 5; no sentence ending in [0..4]
    // extended scan [5..9] finds "done." at index 7 → returns 8
    expect(findSentenceBoundary(words, 0, 5)).toBe(8);
  });

  it("extended scan returns maxEnd when no boundary even in 2x range", () => {
    const words = [
      "a", "b", "c", "d", "e",
      "f", "g", "h", "i", "j",
      "end.", // at index 10, beyond 2x range (0+5*2=10, extendedMax=10, loop is < 10)
    ];
    // maxEnd = 5, hardMax = 11, extendedMax = min(10, 11) = 10
    // extended scan [5..9] — no sentence ending → returns maxEnd = 5
    expect(findSentenceBoundary(words, 0, 5)).toBe(5);
  });

  it("pageEnd limits boundary", () => {
    // Sentence at word 5, but pageEnd=3 → hardMax=4, maxEnd=4
    const words = ["one", "two", "three", "four", "five.", "six"];
    // hardMax = min(3+1, 6) = 4, maxEnd = min(0+40, 4) = 4
    // scan [0..3]: no sentence ending → returns maxEnd = 4
    expect(findSentenceBoundary(words, 0, 40, 3)).toBe(4);
  });

  it("returns 0 for empty words array", () => {
    expect(findSentenceBoundary([], 0, 40)).toBe(0);
  });

  it("returns 1 for single word with period", () => {
    expect(findSentenceBoundary(["Done."], 0, 40)).toBe(1);
  });

  it("finds first sentence ending after startIdx mid-array", () => {
    const words = ["skip", "this.", "also", "skip", "this", "end.", "more"];
    // startIdx=2, chunkSize=10 → maxEnd = min(12, 7) = 7
    // scan [2..6]: "end." at index 5 → returns 6
    expect(findSentenceBoundary(words, 2, 10)).toBe(6);
  });

  it("pageEnd before chunkSize constrains hardMax", () => {
    const words = ["a", "b.", "c", "d", "e"];
    // pageEnd=2, hardMax = min(3, 5) = 3, maxEnd = min(0+40, 3) = 3
    // scan [0..2]: "b." at index 1 → returns min(2, 3) = 2
    expect(findSentenceBoundary(words, 0, 40, 2)).toBe(2);
  });
});
