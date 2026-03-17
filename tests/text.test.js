import { describe, it, expect } from "vitest";
import { tokenize, formatTime, focusChar } from "../src/utils/text";

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
