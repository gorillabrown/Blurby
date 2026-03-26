import { describe, it, expect } from "vitest";
import { segmentWords, countWordsSegmenter } from "../src/utils/segmentWords";

describe("segmentWords", () => {
  it("splits simple sentence", () => {
    expect(segmentWords("Hello world")).toEqual(["Hello", "world"]);
  });
  it("handles punctuation-attached words", () => {
    const words = segmentWords("Hello, world! How's it going?");
    expect(words).toContain("Hello");
    expect(words).toContain("world");
  });
  it("handles multiple spaces and newlines", () => {
    expect(segmentWords("a  b\n\nc")).toEqual(["a", "b", "c"]);
  });
  it("returns empty for empty/whitespace input", () => {
    expect(segmentWords("")).toEqual([]);
    expect(segmentWords("   ")).toEqual([]);
  });
  it("countWordsSegmenter matches segmentWords length", () => {
    const text = "The quick brown fox jumps over the lazy dog.";
    expect(countWordsSegmenter(text)).toBe(segmentWords(text).length);
  });
});
