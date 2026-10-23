// FOCUS-KEYS-FIX-1 (live check, 2026-10-23): on an EPUB with full-book words, the surface's paragraph breaks are
// loaded-slice indices while the words the keys step over are book-wide, so Shift+Right jumped 187 → 5290.
// bookParagraphBreaks maps the loaded breaks to book-wide indices, exactly, section by section.
import { describe, expect, it } from "vitest";
import * as text from "../src/utils/text";

type Sections = readonly { sectionIndex: number; startWordIdx: number; endWordIdx: number }[];
type Fn = (loadedWordSections: readonly number[], loadedBreaks: readonly number[], sections: Sections) => number[];
const bookParagraphBreaks = (text as unknown as { bookParagraphBreaks?: Fn }).bookParagraphBreaks;
const map: Fn = (a, b, c) => bookParagraphBreaks?.(a, b, c) ?? [];

// Book: section 0 = words 0–99, section 3 = words 100–159, section 4 = words 160–199.
const SECTIONS: Sections = [
  { sectionIndex: 0, startWordIdx: 0, endWordIdx: 100 },
  { sectionIndex: 3, startWordIdx: 100, endWordIdx: 160 },
  { sectionIndex: 4, startWordIdx: 160, endWordIdx: 200 },
];

describe("bookParagraphBreaks", () => {
  it("maps a loaded section's breaks to book-wide indices and keeps every section end", () => {
    // Only section 3 is loaded: 60 loaded words (local 0–59), paragraphs end at local 9, 29 and 59.
    const loaded = Array.from({ length: 60 }, () => 3);
    expect(map(loaded, [9, 29, 59], SECTIONS)).toEqual([99, 109, 129, 159, 199]);
  });

  it("maps two loaded sections, each from its own first loaded word", () => {
    const loaded = [...Array.from({ length: 60 }, () => 3), ...Array.from({ length: 40 }, () => 4)];
    expect(map(loaded, [29, 59, 79, 99], SECTIONS)).toEqual([99, 129, 159, 179, 199]);
  });

  it("skips a loaded section whose word count differs from the book's (no estimated mapping)", () => {
    const loaded = Array.from({ length: 58 }, () => 3); // the book says 60
    expect(map(loaded, [9, 29, 57], SECTIONS)).toEqual([99, 159, 199]);
  });

  it("with nothing loaded, the section ends are the breaks", () => {
    expect(map([], [], SECTIONS)).toEqual([99, 159, 199]);
  });
});
