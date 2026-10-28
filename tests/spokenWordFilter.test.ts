import { describe, expect, it } from "vitest";
import { filterSpokenWords, isPunctuationOnlyWord } from "../src/utils/spokenWordFilter";

describe("isPunctuationOnlyWord", () => {
  it("returns true for punctuation-only tokens", () => {
    expect(isPunctuationOnlyWord("...")).toBe(true);
    expect(isPunctuationOnlyWord("—")).toBe(true);
    expect(isPunctuationOnlyWord("\"")).toBe(true);
  });

  it("returns false for lexical words and mixed alphanumerics", () => {
    expect(isPunctuationOnlyWord("hello")).toBe(false);
    expect(isPunctuationOnlyWord("$12.50")).toBe(false);
    expect(isPunctuationOnlyWord("co-op")).toBe(false);
  });

  it("trims whitespace before classification", () => {
    expect(isPunctuationOnlyWord("  ...  ")).toBe(true);
    expect(isPunctuationOnlyWord("  hello  ")).toBe(false);
  });

  it("handles unicode punctuation and symbol runs", () => {
    expect(isPunctuationOnlyWord("“”")).toBe(true);
    expect(isPunctuationOnlyWord("§¶")).toBe(true);
  });
});

describe("filterSpokenWords", () => {
  it("returns empty structures for empty input", () => {
    expect(filterSpokenWords([])).toEqual({
      spokenWords: [],
      spokenToDisplayMap: [],
      displayToSpokenMap: [],
    });
  });

  it("keeps all words when there are no punctuation-only tokens", () => {
    expect(filterSpokenWords(["Hello", "world"])).toEqual({
      spokenWords: ["Hello", "world"],
      spokenToDisplayMap: [0, 1],
      displayToSpokenMap: [0, 1],
    });
  });

  it("excludes standalone punctuation from spokenWords", () => {
    expect(filterSpokenWords(["Hello", "...", "world"])).toEqual({
      spokenWords: ["Hello", "world"],
      spokenToDisplayMap: [0, 2],
      displayToSpokenMap: [0, null, 1],
    });
  });

  it("excludes standalone quote tokens while preserving display positions", () => {
    expect(filterSpokenWords(["\"", "Hello", "\""])).toEqual({
      spokenWords: ["Hello"],
      spokenToDisplayMap: [1],
      displayToSpokenMap: [null, 0, null],
    });
  });

  it("excludes em-dash sequences used as display-only separators", () => {
    expect(filterSpokenWords(["wait", "—", "—", "now"])).toEqual({
      spokenWords: ["wait", "now"],
      spokenToDisplayMap: [0, 3],
      displayToSpokenMap: [0, null, null, 1],
    });
  });

  it("keeps punctuation-attached lexical words", () => {
    expect(filterSpokenWords(["Hello,", "world!"])).toEqual({
      spokenWords: ["Hello,", "world!"],
      spokenToDisplayMap: [0, 1],
      displayToSpokenMap: [0, 1],
    });
  });

  it("keeps apostrophe words", () => {
    expect(filterSpokenWords(["don't", "stop"])).toEqual({
      spokenWords: ["don't", "stop"],
      spokenToDisplayMap: [0, 1],
      displayToSpokenMap: [0, 1],
    });
  });

  it("keeps hyphenated lexical words", () => {
    expect(filterSpokenWords(["co-op", "mode"])).toEqual({
      spokenWords: ["co-op", "mode"],
      spokenToDisplayMap: [0, 1],
      displayToSpokenMap: [0, 1],
    });
  });

  it("keeps numeric/currency tokens as spoken words", () => {
    expect(filterSpokenWords(["$12.50", "paid"])).toEqual({
      spokenWords: ["$12.50", "paid"],
      spokenToDisplayMap: [0, 1],
      displayToSpokenMap: [0, 1],
    });
  });

  it("excludes symbol-only tokens", () => {
    expect(filterSpokenWords(["Alpha", "§§", "Beta"])).toEqual({
      spokenWords: ["Alpha", "Beta"],
      spokenToDisplayMap: [0, 2],
      displayToSpokenMap: [0, null, 1],
    });
  });

  it("handles leading punctuation-only token", () => {
    expect(filterSpokenWords(["...", "Begin"])).toEqual({
      spokenWords: ["Begin"],
      spokenToDisplayMap: [1],
      displayToSpokenMap: [null, 0],
    });
  });

  it("handles trailing punctuation-only token", () => {
    expect(filterSpokenWords(["End", "..."])).toEqual({
      spokenWords: ["End"],
      spokenToDisplayMap: [0],
      displayToSpokenMap: [0, null],
    });
  });

  it("handles alternating punctuation and words", () => {
    expect(filterSpokenWords(["(", "A", ")", ",", "B", "!"])).toEqual({
      spokenWords: ["A", "B"],
      spokenToDisplayMap: [1, 4],
      displayToSpokenMap: [null, 0, null, null, 1, null],
    });
  });

  it("handles all-punctuation display input", () => {
    expect(filterSpokenWords(["...", "—", "\""])).toEqual({
      spokenWords: [],
      spokenToDisplayMap: [],
      displayToSpokenMap: [null, null, null],
    });
  });

  it("preserves spoken order for long mixed input", () => {
    const result = filterSpokenWords(["“", "The", "quick", "—", "brown", "fox", "...", "jumped"]);
    expect(result.spokenWords).toEqual(["The", "quick", "brown", "fox", "jumped"]);
    expect(result.spokenToDisplayMap).toEqual([1, 2, 4, 5, 7]);
    expect(result.displayToSpokenMap).toEqual([null, 0, 1, null, 2, 3, null, 4]);
  });
});
