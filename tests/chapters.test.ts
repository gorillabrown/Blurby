import { describe, it, expect } from "vitest";
import { detectChapters, currentChapterIndex, tokenize, chaptersFromCharOffsets } from "../src/utils/text";

/**
 * Chapter detection edge cases — testing boundary conditions
 * for the detectChapters and related functions.
 */

describe("detectChapters — edge cases", () => {
  it("empty document returns no chapters", () => {
    expect(detectChapters("", [])).toEqual([]);
  });

  it("null content returns no chapters", () => {
    expect(detectChapters(null, [])).toEqual([]);
  });

  it("undefined content returns no chapters", () => {
    expect(detectChapters(undefined, [])).toEqual([]);
  });

  it("content with no words returns no chapters", () => {
    expect(detectChapters("   \n\n   ", [])).toEqual([]);
  });

  it("single chapter document returns 1 chapter", () => {
    const content = "Chapter 1: The Only Chapter\n\nSome text here.";
    const words = tokenize(content);
    const chapters = detectChapters(content, words);
    expect(chapters).toHaveLength(1);
    expect(chapters[0].title).toBe("Chapter 1: The Only Chapter");
    expect(chapters[0].wordIndex).toBe(0);
  });

  it("plain text without chapter markers returns empty", () => {
    const content = "This is just a plain paragraph with no chapter headings at all.";
    const words = tokenize(content);
    const chapters = detectChapters(content, words);
    expect(chapters).toHaveLength(0);
  });

  it("malformed chapter markers are still detected if they match pattern", () => {
    const content = "Chapter \n\nSome text.";
    const words = tokenize(content);
    const chapters = detectChapters(content, words);
    // "Chapter" alone on a line matches the pattern
    expect(chapters).toHaveLength(1);
  });

  it("very long chapter title is preserved", () => {
    const longTitle = "Chapter 1: " + "A".repeat(200);
    const content = `${longTitle}\n\nSome text follows.`;
    const words = tokenize(content);
    const chapters = detectChapters(content, words);
    expect(chapters).toHaveLength(1);
    expect(chapters[0].title.length).toBeGreaterThan(100);
  });

  it("Unicode chapter titles are preserved", () => {
    const content = "# Chapitre Un: Les Miserables\n\nText here.\n\n# Kapitel Zwei: Ubung\n\nMore text.";
    const words = tokenize(content);
    const chapters = detectChapters(content, words);
    expect(chapters).toHaveLength(2);
    expect(chapters[0].title).toContain("Miserables");
    expect(chapters[1].title).toContain("Ubung");
  });

  it("CJK characters in markdown heading", () => {
    const content = "# \u7B2C\u4E00\u7AE0\n\nSome text.\n\n# \u7B2C\u4E8C\u7AE0\n\nMore text.";
    const words = tokenize(content);
    const chapters = detectChapters(content, words);
    expect(chapters).toHaveLength(2);
  });

  it("emoji in chapter title", () => {
    const content = "# Introduction \uD83D\uDCDA\n\nHello world.";
    const words = tokenize(content);
    const chapters = detectChapters(content, words);
    expect(chapters).toHaveLength(1);
    expect(chapters[0].title).toContain("\uD83D\uDCDA");
  });

  it("standalone roman numeral as chapter marker", () => {
    const content = "Some preamble text.\nIII\n\nThird chapter content.";
    const words = tokenize(content);
    const chapters = detectChapters(content, words);
    expect(chapters.length).toBeGreaterThanOrEqual(1);
    const romanChapter = chapters.find((c) => c.title.includes("III"));
    expect(romanChapter).toBeDefined();
  });

  it("numbered standalone marker", () => {
    const content = "Some preamble.\n5\n\nFifth chapter.";
    const words = tokenize(content);
    const chapters = detectChapters(content, words);
    expect(chapters.length).toBeGreaterThanOrEqual(1);
  });

  it("Section heading is detected", () => {
    const content = "Section 1: Introduction\n\nText here.\n\nSection 2: Methods\n\nMore text.";
    const words = tokenize(content);
    const chapters = detectChapters(content, words);
    expect(chapters).toHaveLength(2);
  });

  it("Prologue and Epilogue are detected", () => {
    const content = "Prologue\n\nOnce upon a time.\n\nEpilogue\n\nThe end.";
    const words = tokenize(content);
    const chapters = detectChapters(content, words);
    expect(chapters).toHaveLength(2);
  });

  it("Introduction, Conclusion, Afterword, Foreword, Preface are detected", () => {
    const headings = ["Introduction", "Conclusion", "Afterword", "Foreword", "Preface"];
    for (const heading of headings) {
      const content = `${heading}\n\nSome text follows.`;
      const words = tokenize(content);
      const chapters = detectChapters(content, words);
      expect(chapters.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("case-insensitive chapter detection", () => {
    const content = "CHAPTER 1\n\nText.\n\nchapter 2\n\nMore text.";
    const words = tokenize(content);
    const chapters = detectChapters(content, words);
    expect(chapters).toHaveLength(2);
  });

  it("multiple newlines between chapters", () => {
    const content = "Chapter 1\n\n\n\nText.\n\n\n\nChapter 2\n\n\n\nMore.";
    const words = tokenize(content);
    const chapters = detectChapters(content, words);
    expect(chapters).toHaveLength(2);
  });
});

describe("currentChapterIndex — edge cases", () => {
  it("returns -1 for empty chapters", () => {
    expect(currentChapterIndex([], 0)).toBe(-1);
  });

  it("returns 0 when at first chapter start", () => {
    const chapters = [{ title: "Ch 1", wordIndex: 0 }];
    expect(currentChapterIndex(chapters, 0)).toBe(0);
  });

  it("returns last chapter for very large wordIndex", () => {
    const chapters = [
      { title: "Ch 1", wordIndex: 0 },
      { title: "Ch 2", wordIndex: 100 },
    ];
    expect(currentChapterIndex(chapters, 99999)).toBe(1);
  });

  it("returns -1 when wordIndex is before first chapter", () => {
    const chapters = [{ title: "Ch 1", wordIndex: 10 }];
    expect(currentChapterIndex(chapters, 5)).toBe(-1);
  });

  it("handles single chapter correctly", () => {
    const chapters = [{ title: "Only", wordIndex: 0 }];
    expect(currentChapterIndex(chapters, 0)).toBe(0);
    expect(currentChapterIndex(chapters, 500)).toBe(0);
  });
});

describe("chaptersFromCharOffsets", () => {
  it("converts char offsets to word indices", () => {
    const content = "Hello world this is a test document";
    const charOffsetChapters = [
      { title: "Start", charOffset: 0 },
      { title: "Middle", charOffset: 18 }, // "a test document"
    ];
    const chapters = chaptersFromCharOffsets(content, charOffsetChapters);
    expect(chapters).toHaveLength(2);
    expect(chapters[0].wordIndex).toBe(0);
    expect(chapters[1].wordIndex).toBeGreaterThan(0);
  });

  it("returns empty for empty content", () => {
    expect(chaptersFromCharOffsets("", [{ title: "Ch", charOffset: 0 }])).toEqual([]);
  });

  it("returns empty for empty chapters array", () => {
    expect(chaptersFromCharOffsets("Hello world", [])).toEqual([]);
  });

  it("offset at start gives wordIndex 0", () => {
    const chapters = chaptersFromCharOffsets("Hello world", [{ title: "Start", charOffset: 0 }]);
    expect(chapters[0].wordIndex).toBe(0);
  });

  it("offset at end gives correct word count", () => {
    const content = "one two three";
    const chapters = chaptersFromCharOffsets(content, [{ title: "End", charOffset: content.length }]);
    expect(chapters[0].wordIndex).toBe(3);
  });
});
