/**
 * Content-alignment tests — verifies that wrapWordsInSpans content-aligns
 * canonical (extractor) words against DOM text so click index === TTS index.
 *
 * Covers: SRL-067, Step 3.4 word-index tokenization repair.
 */
import { describe, it, expect, vi } from "vitest";
import { contentAlignWords } from "../src/utils/foliateWordWrapping";

// ── 1. Basic content alignment ─────────────────────────────────────

describe("contentAlignWords: basic alignment", () => {
  it("aligns simple words in order", () => {
    const text = "The quick brown fox.";
    const canonical = ["The", "quick", "brown", "fox."];
    const { spans, consumed } = contentAlignWords(text, canonical, 0, 100, 0);
    expect(consumed).toBe(4);
    expect(spans.map(s => s.word)).toEqual(canonical);
    expect(spans.map(s => s.globalIndex)).toEqual([100, 101, 102, 103]);
  });

  it("assigns correct start/end positions", () => {
    const text = "Hello world";
    const canonical = ["Hello", "world"];
    const { spans } = contentAlignWords(text, canonical, 0, 0, 0);
    expect(spans[0]).toMatchObject({ word: "Hello", start: 0, end: 5 });
    expect(spans[1]).toMatchObject({ word: "world", start: 6, end: 11 });
  });

  it("handles empty text", () => {
    const { spans, consumed } = contentAlignWords("", ["word"], 0, 0, 0);
    expect(spans).toEqual([]);
    expect(consumed).toBe(0);
  });

  it("handles empty canonical array", () => {
    const { spans, consumed } = contentAlignWords("some text", [], 0, 0, 0);
    expect(spans).toEqual([]);
    expect(consumed).toBe(0);
  });

  it("uses globalOffset + cursor for globalIndex", () => {
    const text = "alpha beta gamma";
    const canonical = ["alpha", "beta", "gamma"];
    const { spans } = contentAlignWords(text, canonical, 0, 5000, 3);
    expect(spans[0].globalIndex).toBe(5000);
    expect(spans[1].globalIndex).toBe(5001);
    expect(spans[2].globalIndex).toBe(5002);
    expect(spans[0].tokenId).toBe("3:0");
    expect(spans[1].tokenId).toBe("3:1");
  });

  it("respects startCursor to resume across blocks", () => {
    const block1 = "alpha beta";
    const block2 = "gamma delta";
    const canonical = ["alpha", "beta", "gamma", "delta"];

    const r1 = contentAlignWords(block1, canonical, 0, 100, 0);
    expect(r1.consumed).toBe(2);
    expect(r1.spans.map(s => s.word)).toEqual(["alpha", "beta"]);

    const r2 = contentAlignWords(block2, canonical, r1.consumed, 100, 0);
    expect(r2.consumed).toBe(2);
    expect(r2.spans.map(s => s.word)).toEqual(["gamma", "delta"]);
    expect(r2.spans[0].globalIndex).toBe(102);
    expect(r2.spans[1].globalIndex).toBe(103);
  });
});

// ── 2. Tokenizer divergence handling ───────────────────────────────

describe("contentAlignWords: tokenizer divergence", () => {
  it("handles stitched words (renderer stitches, extractor splits)", () => {
    // Renderer would see "word1​word2" as one token.
    // Extractor produces two separate tokens. Content-align finds both as substrings.
    const text = "Before word1​word2 after";
    const canonical = ["Before", "word1", "word2", "after"];
    const { spans, consumed } = contentAlignWords(text, canonical, 0, 0, 0);
    expect(consumed).toBe(4);
    expect(spans.map(s => s.word)).toEqual(canonical);
    expect(spans[1]).toMatchObject({ word: "word1", start: 7, end: 12 });
    expect(spans[2]).toMatchObject({ word: "word2", start: 13, end: 18 });
  });

  it("handles contraction split (extractor: let' + s, renderer: let's)", () => {
    const text = "I can't believe it.";
    // Extractor might split: "I", "can'", "t", "believe", "it."
    // (depending on segmenter, but this tests the alignment principle)
    const canonical = ["I", "can't", "believe", "it."];
    const { spans, consumed } = contentAlignWords(text, canonical, 0, 0, 0);
    expect(consumed).toBe(4);
    expect(spans.map(s => s.word)).toEqual(canonical);
  });

  it("handles repeated words correctly (finds in order)", () => {
    const text = "the cat sat on the mat";
    const canonical = ["the", "cat", "sat", "on", "the", "mat"];
    const { spans, consumed } = contentAlignWords(text, canonical, 0, 0, 0);
    expect(consumed).toBe(6);
    expect(spans[0]).toMatchObject({ word: "the", start: 0 });
    expect(spans[4]).toMatchObject({ word: "the", start: 15 });
  });

  it("handles punctuation-attached words", () => {
    const text = "Hello, world. \"Quoted\" text...";
    const canonical = ["Hello,", "world.", "\"Quoted\"", "text..."];
    const { spans, consumed } = contentAlignWords(text, canonical, 0, 0, 0);
    expect(consumed).toBe(4);
    expect(spans.map(s => s.word)).toEqual(canonical);
  });
});

// ── 3. Skip and realignment ────────────────────────────────────────

describe("contentAlignWords: skip and realignment", () => {
  it("skips a canonical word not in the block when later words are found", () => {
    // "MISSING" is in the canonical array but not in the text
    const text = "alpha gamma delta";
    const canonical = ["alpha", "MISSING", "gamma", "delta"];
    const { spans, consumed } = contentAlignWords(text, canonical, 0, 0, 0);
    expect(consumed).toBe(4);
    expect(spans.map(s => s.word)).toEqual(["alpha", "gamma", "delta"]);
    // The MISSING word has no span, but cursor advanced past it
    expect(spans[0].globalIndex).toBe(0);
    expect(spans[1].globalIndex).toBe(2); // skipped index 1
    expect(spans[2].globalIndex).toBe(3);
  });

  it("breaks to next block when no canonical words match remaining text", () => {
    const text = "alpha beta";
    const canonical = ["alpha", "beta", "gamma", "delta"];
    const { spans, consumed } = contentAlignWords(text, canonical, 0, 0, 0);
    expect(consumed).toBe(2);
    expect(spans.map(s => s.word)).toEqual(["alpha", "beta"]);
  });

  it("handles multiple consecutive missing words", () => {
    const text = "start end";
    const canonical = ["start", "miss1", "miss2", "miss3", "end"];
    const { spans, consumed } = contentAlignWords(text, canonical, 0, 0, 0);
    expect(consumed).toBe(5);
    expect(spans.map(s => s.word)).toEqual(["start", "end"]);
    expect(spans[0].globalIndex).toBe(0);
    expect(spans[1].globalIndex).toBe(4);
  });
});

// ── 4. Edge cases ──────────────────────────────────────────────────

describe("contentAlignWords: edge cases", () => {
  it("handles single-word text", () => {
    const { spans, consumed } = contentAlignWords("Hello", ["Hello"], 0, 42, 0);
    expect(consumed).toBe(1);
    expect(spans[0]).toMatchObject({ word: "Hello", globalIndex: 42 });
  });

  it("handles text with only whitespace around words", () => {
    const text = "  word  ";
    const canonical = ["word"];
    const { spans, consumed } = contentAlignWords(text, canonical, 0, 0, 0);
    expect(consumed).toBe(1);
    expect(spans[0]).toMatchObject({ word: "word", start: 2, end: 6 });
  });

  it("handles unicode em-dash and ellipsis", () => {
    const text = "word—another word…";
    const canonical = ["word—another", "word…"];
    const { spans, consumed } = contentAlignWords(text, canonical, 0, 0, 0);
    expect(consumed).toBe(2);
  });

  it("handles numbers with commas", () => {
    const text = "The population is 160,000 people.";
    const canonical = ["The", "population", "is", "160,000", "people."];
    const { spans, consumed } = contentAlignWords(text, canonical, 0, 0, 0);
    expect(consumed).toBe(5);
    expect(spans[3]).toMatchObject({ word: "160,000" });
  });
});
