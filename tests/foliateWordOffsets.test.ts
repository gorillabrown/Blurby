import { describe, it, expect } from "vitest";
import {
  getSectionGlobalOffset,
  resolveRenderedWordIndexToGlobal,
  resolveGlobalWordIndexToRendered,
} from "../src/utils/foliateWordOffsets";
import type { SectionBoundary } from "../src/types/narration";

type LoadedWord = { sectionIndex: number };

function makeLoadedWords(sectionIndex: number, count: number): LoadedWord[] {
  return Array.from({ length: count }, () => ({ sectionIndex }));
}

function makeSections(...sections: Array<SectionBoundary>): SectionBoundary[] {
  return sections;
}

describe("foliateWordOffsets", () => {
  describe("getSectionGlobalOffset", () => {
    it("prefers bookWordSections when a matching section exists", () => {
      const loadedWords = [...makeLoadedWords(2, 2), ...makeLoadedWords(7, 3)];
      const bookWordSections = makeSections(
        { sectionIndex: 2, startWordIdx: 100, endWordIdx: 102, wordCount: 2 },
        { sectionIndex: 7, startWordIdx: 200, endWordIdx: 203, wordCount: 3 },
      );

      expect(getSectionGlobalOffset(7, loadedWords, bookWordSections)).toBe(200);
    });

    it("falls back to the first loaded index when bookWordSections are missing", () => {
      const loadedWords = [...makeLoadedWords(2, 2), ...makeLoadedWords(7, 3)];

      expect(getSectionGlobalOffset(7, loadedWords)).toBe(2);
    });

    it("returns -1 for an empty loadedWords array", () => {
      expect(getSectionGlobalOffset(7, [])).toBe(-1);
    });

    it("returns -1 when the requested sectionIndex is not present in loadedWords", () => {
      const loadedWords = [...makeLoadedWords(2, 2), ...makeLoadedWords(7, 3)];

      expect(getSectionGlobalOffset(4, loadedWords)).toBe(-1);
    });
  });

  describe("resolveRenderedWordIndexToGlobal", () => {
    it("returns the rendered index unchanged when bookWordSections are not available", () => {
      const loadedWords = [...makeLoadedWords(7, 3)];

      expect(resolveRenderedWordIndexToGlobal(7, 12, loadedWords)).toBe(12);
    });

    it("keeps a word at the exact global section start unchanged", () => {
      const loadedWords = [...makeLoadedWords(7, 3)];
      const bookWordSections = makeSections({
        sectionIndex: 7,
        startWordIdx: 200,
        endWordIdx: 203,
        wordCount: 3,
      });

      expect(resolveRenderedWordIndexToGlobal(7, 200, loadedWords, bookWordSections)).toBe(200);
    });

    it("keeps the last word in the section unchanged", () => {
      const loadedWords = [...makeLoadedWords(7, 3)];
      const bookWordSections = makeSections({
        sectionIndex: 7,
        startWordIdx: 200,
        endWordIdx: 203,
        wordCount: 3,
      });

      expect(resolveRenderedWordIndexToGlobal(7, 202, loadedWords, bookWordSections)).toBe(202);
    });

    it("maps a stale local index back into the global book range when the section starts later in the loaded slice", () => {
      const loadedWords = [...makeLoadedWords(2, 2), ...makeLoadedWords(7, 3)];
      const bookWordSections = makeSections({
        sectionIndex: 7,
        startWordIdx: 200,
        endWordIdx: 203,
        wordCount: 3,
      });

      expect(resolveRenderedWordIndexToGlobal(7, 3, loadedWords, bookWordSections)).toBe(201);
    });

    it("maps a local index from the section start when the loaded slice starts at zero", () => {
      const loadedWords = [...makeLoadedWords(7, 3)];
      const bookWordSections = makeSections({
        sectionIndex: 7,
        startWordIdx: 500,
        endWordIdx: 503,
        wordCount: 3,
      });

      expect(resolveRenderedWordIndexToGlobal(7, 1, loadedWords, bookWordSections)).toBe(501);
    });

    it("falls back unchanged at the section end boundary", () => {
      const loadedWords = [...makeLoadedWords(7, 3)];
      const bookWordSections = makeSections({
        sectionIndex: 7,
        startWordIdx: 500,
        endWordIdx: 503,
        wordCount: 3,
      });

      expect(resolveRenderedWordIndexToGlobal(7, 503, loadedWords, bookWordSections)).toBe(503);
    });
  });

  describe("resolveGlobalWordIndexToRendered", () => {
    it("maps the global section start to the first loaded word index", () => {
      const loadedWords = [...makeLoadedWords(2, 2), ...makeLoadedWords(7, 3)];
      const bookWordSections = makeSections({
        sectionIndex: 7,
        startWordIdx: 200,
        endWordIdx: 203,
        wordCount: 3,
      });

      expect(resolveGlobalWordIndexToRendered(7, 200, loadedWords, bookWordSections)).toBe(2);
    });

    it("maps the last global word in the section to the last rendered index", () => {
      const loadedWords = [...makeLoadedWords(2, 2), ...makeLoadedWords(7, 3)];
      const bookWordSections = makeSections({
        sectionIndex: 7,
        startWordIdx: 200,
        endWordIdx: 203,
        wordCount: 3,
      });

      expect(resolveGlobalWordIndexToRendered(7, 202, loadedWords, bookWordSections)).toBe(4);
    });

    it("returns the global index unchanged at the section end boundary", () => {
      const loadedWords = [...makeLoadedWords(2, 2), ...makeLoadedWords(7, 3)];
      const bookWordSections = makeSections({
        sectionIndex: 7,
        startWordIdx: 200,
        endWordIdx: 203,
        wordCount: 3,
      });

      expect(resolveGlobalWordIndexToRendered(7, 203, loadedWords, bookWordSections)).toBe(203);
    });

    it("returns the global index unchanged when the section is missing from loadedWords", () => {
      const loadedWords = [...makeLoadedWords(2, 2)];
      const bookWordSections = makeSections({
        sectionIndex: 7,
        startWordIdx: 200,
        endWordIdx: 203,
        wordCount: 3,
      });

      expect(resolveGlobalWordIndexToRendered(7, 200, loadedWords, bookWordSections)).toBe(200);
    });

    it("returns the global index unchanged when bookWordSections are missing", () => {
      const loadedWords = [...makeLoadedWords(7, 3)];

      expect(resolveGlobalWordIndexToRendered(7, 200, loadedWords)).toBe(200);
    });
  });

  describe("stitched rendered word indexes", () => {
    it("collapses stitched fragments to the first rendered index when mapping to global", () => {
      const loadedWords = [...makeLoadedWords(4, 3)];
      const bookWordSections = makeSections({
        sectionIndex: 4,
        startWordIdx: 100,
        endWordIdx: 103,
        wordCount: 3,
      });

      expect(
        resolveRenderedWordIndexToGlobal(4, 101, loadedWords, bookWordSections, [100, 101]),
      ).toBe(100);
    });

    it("leaves ordinary rendered indexes unchanged when no stitched fragment list is provided", () => {
      const loadedWords = [...makeLoadedWords(4, 3)];
      const bookWordSections = makeSections({
        sectionIndex: 4,
        startWordIdx: 100,
        endWordIdx: 103,
        wordCount: 3,
      });

      expect(resolveRenderedWordIndexToGlobal(4, 101, loadedWords, bookWordSections)).toBe(101);
    });
  });
});
