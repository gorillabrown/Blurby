import { describe, it, expect } from "vitest";
import { tokenize, tokenizeWithMeta, formatTime, focusChar, hasPunctuation, detectChapters, currentChapterIndex, calculateFocusOpacity, formatDisplayTitle, findSentenceBoundary } from "../src/utils/text";

describe("tokenize", () => {
  it("returns empty array for empty string", () => {
    expect(tokenize("")).toEqual([]);
  });

  it("returns empty array for null/undefined", () => {
    expect(tokenize(null)).toEqual([]);
    expect(tokenize(undefined)).toEqual([]);
  });

  it("returns single word", () => {
    expect(tokenize("hello")).toEqual(["hello"]);
  });

  it("splits on multiple spaces", () => {
    expect(tokenize("hello   world")).toEqual(["hello", "world"]);
  });

  it("trims leading and trailing whitespace", () => {
    expect(tokenize("  hello world  ")).toEqual(["hello", "world"]);
  });

  it("handles tabs, newlines, and mixed whitespace", () => {
    expect(tokenize("hello\tworld\nfoo  bar")).toEqual(["hello", "world", "foo", "bar"]);
  });

  it("handles only whitespace", () => {
    expect(tokenize("   \t\n  ")).toEqual([]);
  });
});

describe("focusChar", () => {
  it("returns empty parts for empty/null input", () => {
    expect(focusChar("")).toEqual({ before: "", focus: "", after: "" });
    expect(focusChar(null)).toEqual({ before: "", focus: "", after: "" });
    expect(focusChar(undefined)).toEqual({ before: "", focus: "", after: "" });
  });

  it("single character word: pivot at 0", () => {
    const result = focusChar("A");
    expect(result).toEqual({ before: "", focus: "A", after: "" });
  });

  it("2-5 character words: pivot at 1", () => {
    expect(focusChar("Hi")).toEqual({ before: "H", focus: "i", after: "" });
    expect(focusChar("cat")).toEqual({ before: "c", focus: "a", after: "t" });
    expect(focusChar("Hello")).toEqual({ before: "H", focus: "e", after: "llo" });
  });

  it("6-9 character words: pivot at 2", () => {
    expect(focusChar("twelve")).toEqual({ before: "tw", focus: "e", after: "lve" });
    expect(focusChar("elephant")).toEqual({ before: "el", focus: "e", after: "phant" });
    expect(focusChar("ninechars")).toEqual({ before: "ni", focus: "n", after: "echars" });
  });

  it("10-13 character words: pivot at 3", () => {
    expect(focusChar("abcdefghij")).toEqual({ before: "abc", focus: "d", after: "efghij" });
    expect(focusChar("extraordinary")).toEqual({ before: "ext", focus: "r", after: "aordinary" });
  });

  it("14+ character words: pivot at 4", () => {
    expect(focusChar("representation")).toEqual({ before: "repr", focus: "e", after: "sentation" });
    expect(focusChar("internationalize")).toEqual({ before: "inte", focus: "r", after: "nationalize" });
  });
});

describe("formatTime", () => {
  it("returns '0m' for 0 words or 0 WPM", () => {
    expect(formatTime(0, 300)).toBe("0m");
    expect(formatTime(100, 0)).toBe("0m");
    expect(formatTime(0, 0)).toBe("0m");
  });

  it("returns '<1m' for less than 1 minute", () => {
    expect(formatTime(100, 300)).toBe("<1m");
  });

  it("returns minutes for less than 60", () => {
    expect(formatTime(600, 300)).toBe("2m");
    expect(formatTime(3000, 300)).toBe("10m");
  });

  it("returns hours and minutes for 60+", () => {
    expect(formatTime(30000, 300)).toBe("1h 40m");
  });

  it("returns just hours for exact hour", () => {
    expect(formatTime(18000, 300)).toBe("1h");
  });

  it("handles null/undefined words", () => {
    expect(formatTime(null, 300)).toBe("0m");
    expect(formatTime(undefined, 300)).toBe("0m");
  });
});

describe("hasPunctuation", () => {
  it("detects sentence-ending punctuation", () => {
    expect(hasPunctuation("word.")).toBe(true);
    expect(hasPunctuation("word!")).toBe(true);
    expect(hasPunctuation("word?")).toBe(true);
    expect(hasPunctuation("word;")).toBe(true);
    expect(hasPunctuation("word:")).toBe(true);
  });

  it("detects punctuation followed by quotes", () => {
    expect(hasPunctuation('word."')).toBe(true);
    expect(hasPunctuation("word.'")).toBe(true);
    expect(hasPunctuation("word.)")).toBe(true);
  });

  it("returns false for words without ending punctuation", () => {
    expect(hasPunctuation("word")).toBe(false);
    expect(hasPunctuation("word,")).toBe(false);
    expect(hasPunctuation("U.S")).toBe(false);
  });
});

describe("detectChapters", () => {
  it("returns empty for null/empty content", () => {
    expect(detectChapters(null, [])).toEqual([]);
    expect(detectChapters("", [])).toEqual([]);
  });

  it("detects 'Chapter X' headings", () => {
    const content = "Chapter 1: The Beginning\n\nSome text here.\n\nChapter 2: The Middle\n\nMore text.";
    const words = tokenize(content);
    const chapters = detectChapters(content, words);
    expect(chapters).toHaveLength(2);
    expect(chapters[0].title).toBe("Chapter 1: The Beginning");
    expect(chapters[0].wordIndex).toBe(0);
    expect(chapters[1].title).toBe("Chapter 2: The Middle");
  });

  it("detects markdown headings", () => {
    const content = "# Introduction\n\nHello world.\n\n## Methods\n\nWe did things.";
    const words = tokenize(content);
    const chapters = detectChapters(content, words);
    expect(chapters).toHaveLength(2);
    expect(chapters[0].title).toBe("Introduction");
    expect(chapters[1].title).toBe("Methods");
  });

  it("detects Part/Prologue/Epilogue headings", () => {
    const content = "Prologue\n\nOnce upon a time.\n\nPart 1\n\nThe story begins.";
    const words = tokenize(content);
    const chapters = detectChapters(content, words);
    expect(chapters).toHaveLength(2);
    expect(chapters[0].title).toBe("Prologue");
  });
});

describe("currentChapterIndex", () => {
  const chapters = [
    { title: "Ch 1", wordIndex: 0 },
    { title: "Ch 2", wordIndex: 100 },
    { title: "Ch 3", wordIndex: 250 },
  ];

  it("returns -1 for no chapters", () => {
    expect(currentChapterIndex([], 50)).toBe(-1);
  });

  it("returns correct chapter for word position", () => {
    expect(currentChapterIndex(chapters, 0)).toBe(0);
    expect(currentChapterIndex(chapters, 50)).toBe(0);
    expect(currentChapterIndex(chapters, 100)).toBe(1);
    expect(currentChapterIndex(chapters, 200)).toBe(1);
    expect(currentChapterIndex(chapters, 300)).toBe(2);
  });
});

describe("tokenizeWithMeta", () => {
  it("returns words and paragraph break indices", () => {
    const result = tokenizeWithMeta("Hello world.\n\nSecond paragraph.\n\nThird.");
    expect(result.words).toEqual(["Hello", "world.", "Second", "paragraph.", "Third."]);
    expect(result.paragraphBreaks.has(1)).toBe(true);
    expect(result.paragraphBreaks.has(3)).toBe(true);
    expect(result.paragraphBreaks.has(4)).toBe(true);
  });

  it("handles single paragraph", () => {
    const result = tokenizeWithMeta("Just one paragraph here.");
    expect(result.words).toEqual(["Just", "one", "paragraph", "here."]);
    expect(result.paragraphBreaks.size).toBe(1);
    expect(result.paragraphBreaks.has(3)).toBe(true);
  });

  it("handles empty input", () => {
    const result = tokenizeWithMeta("");
    expect(result.words).toEqual([]);
    expect(result.paragraphBreaks.size).toBe(0);
  });

  it("handles null/undefined", () => {
    expect(tokenizeWithMeta(null).words).toEqual([]);
    expect(tokenizeWithMeta(undefined).words).toEqual([]);
  });
});

describe("calculateFocusOpacity", () => {
  it("returns 1.0 for characters within span range", () => {
    expect(calculateFocusOpacity(3, 3, 13, 0.4)).toBe(1);
    expect(calculateFocusOpacity(4, 3, 13, 0.4)).toBe(1);
  });

  it("returns reduced opacity for characters outside span", () => {
    expect(calculateFocusOpacity(10, 3, 13, 0.4)).toBeLessThan(1);
  });

  it("returns 1.0 for all chars when focusSpan is 1.0", () => {
    expect(calculateFocusOpacity(0, 3, 13, 1.0)).toBe(1);
    expect(calculateFocusOpacity(12, 3, 13, 1.0)).toBe(1);
  });

  it("returns 0.3 for distant characters", () => {
    expect(calculateFocusOpacity(12, 3, 13, 0.2)).toBe(0.3);
  });
});

describe("formatDisplayTitle", () => {
  it("replaces underscore-space with colon-space", () => {
    expect(formatDisplayTitle("Blink_ The Power")).toBe("Blink: The Power");
  });

  it("replaces remaining underscores with spaces", () => {
    const result = formatDisplayTitle("trading_options_ebook");
    expect(result.toLowerCase()).toContain("trading");
    expect(result).not.toContain("_");
  });

  it("converts ALL CAPS to title case", () => {
    expect(formatDisplayTitle("REIMAGINING CIVIL SOCIETY")).toBe("Reimagining Civil Society");
  });

  it("replaces dash-author with pipe", () => {
    expect(formatDisplayTitle("Steve Jobs - Walter Isaacson")).toBe("Steve Jobs | Walter Isaacson");
  });

  it("capitalizes first letter", () => {
    const result = formatDisplayTitle("lowercase");
    expect(result[0]).toBe("L");
  });
});

describe("findSentenceBoundary", () => {
  const words = ["The", "cat", "sat.", "A", "dog", "ran.", "Then", "it", "stopped."];
  // Sentence boundaries: after index 2 ("sat."), after index 5 ("ran."), after index 8 ("stopped.")
  // Sentence starts: 0 ("The"), 3 ("A"), 6 ("Then")

  describe("forward", () => {
    it("finds next sentence start from beginning", () => {
      expect(findSentenceBoundary(words, 0, "forward")).toBe(3);
    });

    it("finds next sentence from mid-sentence", () => {
      expect(findSentenceBoundary(words, 1, "forward")).toBe(3);
    });

    it("finds third sentence from second sentence", () => {
      expect(findSentenceBoundary(words, 3, "forward")).toBe(6);
    });

    it("returns last index at end of doc", () => {
      expect(findSentenceBoundary(words, 8, "forward")).toBe(8);
    });

    it("returns last index when no more sentences", () => {
      expect(findSentenceBoundary(words, 7, "forward")).toBe(8);
    });
  });

  describe("backward", () => {
    it("finds previous sentence start from mid-sentence", () => {
      expect(findSentenceBoundary(words, 4, "backward")).toBe(3);
    });

    it("finds first sentence from second sentence start", () => {
      expect(findSentenceBoundary(words, 3, "backward")).toBe(0);
    });

    it("returns 0 from first word", () => {
      expect(findSentenceBoundary(words, 0, "backward")).toBe(0);
    });

    it("returns 0 from second word (no prior boundary)", () => {
      expect(findSentenceBoundary(words, 1, "backward")).toBe(0);
    });

    it("finds start of current sentence from end", () => {
      expect(findSentenceBoundary(words, 8, "backward")).toBe(6);
    });
  });

  describe("edge cases", () => {
    it("handles empty words array", () => {
      expect(findSentenceBoundary([], 0, "forward")).toBe(0);
      expect(findSentenceBoundary([], 0, "backward")).toBe(0);
    });

    it("handles text with no punctuation", () => {
      const noPunct = ["hello", "world", "foo", "bar"];
      expect(findSentenceBoundary(noPunct, 1, "forward")).toBe(3); // last index
      expect(findSentenceBoundary(noPunct, 2, "backward")).toBe(0); // first index
    });

    it("handles single word", () => {
      expect(findSentenceBoundary(["hello."], 0, "forward")).toBe(0);
      expect(findSentenceBoundary(["hello."], 0, "backward")).toBe(0);
    });

    it("handles consecutive punctuation words", () => {
      const consec = ["He", "said...", '"Sure."', "Then", "left."];
      // "said..." at index 1 has punctuation, '"Sure."' at index 2 also has punctuation
      // Forward from 0: finds "said..." at 1, skips '"Sure."' at 2, returns 3
      expect(findSentenceBoundary(consec, 0, "forward")).toBe(3);
    });

    it("handles punctuation with quotes", () => {
      const quoted = ["She", "asked,", '"Why?"', "He", "shrugged."];
      expect(findSentenceBoundary(quoted, 0, "forward")).toBe(3);
    });
  });
});
