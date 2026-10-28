import { describe, it, expect } from "vitest";
import { tokenize, tokenizeWithMeta, detectChapters, formatTime, focusChar } from "../src/utils/text";
import { sortReadingQueue } from "../src/utils/queue";

/**
 * Stress tests — 100k-word documents and large-scale data.
 * Verifies that core functions complete in reasonable time
 * and produce correct results on large inputs.
 */

function generateLargeText(wordCount: number): string {
  const words = ["the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog", "and", "cat"];
  const result: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    result.push(words[i % words.length]);
  }
  return result.join(" ");
}

function generateLargeTextWithParagraphs(wordCount: number, wordsPerParagraph = 100): string {
  const words = ["the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog", "and", "cat"];
  const result: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    result.push(words[i % words.length]);
    if ((i + 1) % wordsPerParagraph === 0 && i < wordCount - 1) {
      result.push("\n\n");
    }
  }
  return result.join(" ");
}

function generateLargeTextWithChapters(wordCount: number, chapterInterval = 5000): string {
  const words = ["the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog", "and", "cat"];
  const result: string[] = [];
  let chapterNum = 1;
  for (let i = 0; i < wordCount; i++) {
    if (i % chapterInterval === 0) {
      result.push(`\nChapter ${chapterNum}: Title ${chapterNum}\n`);
      chapterNum++;
    }
    result.push(words[i % words.length]);
  }
  return result.join(" ");
}

describe("stress — tokenize 100k words", () => {
  it("tokenizes 100,000 words in under 1 second", () => {
    const text = generateLargeText(100000);
    const start = performance.now();
    const words = tokenize(text);
    const elapsed = performance.now() - start;
    expect(words).toHaveLength(100000);
    expect(elapsed).toBeLessThan(1000);
  });

  it("word count is correct for large input", () => {
    const text = generateLargeText(50000);
    const words = tokenize(text);
    expect(words).toHaveLength(50000);
  });

  it("tokenize handles 500k words", () => {
    const text = generateLargeText(500000);
    const start = performance.now();
    const words = tokenize(text);
    const elapsed = performance.now() - start;
    expect(words).toHaveLength(500000);
    expect(elapsed).toBeLessThan(5000);
  });
});

describe("stress — tokenizeWithMeta 100k words", () => {
  it("tokenizes with meta 100k words in under 2 seconds", () => {
    const text = generateLargeTextWithParagraphs(100000);
    const start = performance.now();
    const result = tokenizeWithMeta(text);
    const elapsed = performance.now() - start;
    expect(result.words.length).toBeGreaterThan(90000); // some words lost to paragraph splitting
    expect(result.paragraphBreaks.size).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(2000);
  });

  it("paragraph breaks are correctly identified in large text", () => {
    const text = generateLargeTextWithParagraphs(1000, 50);
    const result = tokenizeWithMeta(text);
    // ~20 paragraphs of 50 words each
    expect(result.paragraphBreaks.size).toBeGreaterThanOrEqual(15);
  });
});

describe("stress — chapter detection on large text", () => {
  it("detects chapters in 100k-word document in under 2 seconds", () => {
    const text = generateLargeTextWithChapters(100000, 5000);
    const words = tokenize(text);
    const start = performance.now();
    const chapters = detectChapters(text, words);
    const elapsed = performance.now() - start;
    expect(chapters.length).toBeGreaterThanOrEqual(15); // 100k / 5k = 20 chapters
    expect(elapsed).toBeLessThan(2000);
  });

  it("chapter detection does not hang on text with many lines", () => {
    // Create text with 10,000 short lines
    const lines: string[] = [];
    for (let i = 0; i < 10000; i++) {
      lines.push(`Line ${i} has some words here`);
    }
    const text = lines.join("\n");
    const words = tokenize(text);
    const start = performance.now();
    const chapters = detectChapters(text, words);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
    // No chapter markers in this text
    expect(chapters).toHaveLength(0);
  });
});

describe("stress — focusChar on many words", () => {
  it("computes focusChar for 100k words without error", () => {
    const words = generateLargeText(100000).split(" ");
    const start = performance.now();
    for (let i = 0; i < words.length; i++) {
      focusChar(words[i]);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });
});

describe("stress — formatTime on extreme values", () => {
  it("handles very large word counts", () => {
    const result = formatTime(10000000, 300);
    expect(result).toContain("h");
  });

  it("handles very high WPM", () => {
    const result = formatTime(1000, 100000);
    expect(result).toBe("<1m");
  });
});

describe("stress — sortReadingQueue with many docs", () => {
  it("sorts 10,000 documents without hanging", () => {
    const docs = Array.from({ length: 10000 }, (_, i) => ({
      id: String(i),
      position: i % 3 === 0 ? 50 : 0,
      wordCount: 100,
      lastReadAt: i % 3 === 0 ? 1000000 + i : null,
      created: i,
    }));
    const start = performance.now();
    const result = sortReadingQueue(docs);
    const elapsed = performance.now() - start;
    expect(result.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(1000);
  });
});

describe("stress — memory usage", () => {
  it("tokenizing 100k words does not cause excessive memory growth", () => {
    // Warm up
    tokenize(generateLargeText(1000));

    if (typeof process !== "undefined" && process.memoryUsage) {
      const before = process.memoryUsage().heapUsed;
      const text = generateLargeText(100000);
      const words = tokenize(text);
      const after = process.memoryUsage().heapUsed;
      const growth = after - before;
      // Growth should be less than 100MB for 100k words
      expect(growth).toBeLessThan(100 * 1024 * 1024);
      expect(words).toHaveLength(100000);
    } else {
      // If process.memoryUsage isn't available, just verify it completes
      const words = tokenize(generateLargeText(100000));
      expect(words).toHaveLength(100000);
    }
  });
});
