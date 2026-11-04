// FOCUS-KEYS-FIX-1 (live check, 2026-10-23): on an EPUB with full-book words, the view's paragraph breaks index the
// loaded slice while the keys step over book-wide words, so Shift+Right jumped 187 → 5290. Blurby.Brain's ruling
// (option A): paragraph starts come from the rendered block-start spans of book-stamped sections; past them, the
// book's section starts; with no sections known, no move. findBookParagraphStart merges the two.
import { describe, expect, it } from "vitest";
import * as text from "../src/utils/text";

type Fn = (renderedStarts: readonly number[], sectionStarts: readonly number[], currentIndex: number, direction: "forward" | "backward", lastIndex: number) => number | null;
const findBookParagraphStart = (text as unknown as { findBookParagraphStart?: Fn }).findBookParagraphStart;
const find: Fn = (...a) => (findBookParagraphStart ? findBookParagraphStart(...a) : -999);

// Book: sections start at 0, 100 and 160; the last word is 199. Section 100's rendered blocks start at 100, 112 and 140.
const SECTION_STARTS = [0, 100, 160];
const RENDERED = [100, 112, 140];

describe("findBookParagraphStart", () => {
  it("next and previous use the rendered block starts inside a stamped section", () => {
    expect(find(RENDERED, SECTION_STARTS, 105, "forward", 199)).toBe(112);
    expect(find(RENDERED, SECTION_STARTS, 120, "backward", 199)).toBe(112);
    expect(find(RENDERED, SECTION_STARTS, 112, "backward", 199)).toBe(100);
  });

  it("past the rendered starts, next is the next section start (Brain test 3)", () => {
    expect(find(RENDERED, SECTION_STARTS, 145, "forward", 199)).toBe(160);
  });

  it("before the rendered starts, previous is the previous section start", () => {
    expect(find(RENDERED, SECTION_STARTS, 100, "backward", 199)).toBe(0);
  });

  it("with nothing rendered, it moves by section starts only", () => {
    expect(find([], SECTION_STARTS, 105, "forward", 199)).toBe(160);
  });

  it("past the last start, next is the last word; before the first, previous is 0", () => {
    expect(find(RENDERED, SECTION_STARTS, 170, "forward", 199)).toBe(199);
    expect(find(RENDERED, SECTION_STARTS, 0, "backward", 199)).toBe(0);
  });

  it("with no sections known, it returns null (the key does nothing)", () => {
    expect(find(RENDERED, [], 105, "forward", 199)).toBeNull();
  });
});
