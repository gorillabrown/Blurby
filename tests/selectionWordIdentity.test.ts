import { describe, expect, it } from "vitest";
import { resolveRenderedWordIndexToGlobal } from "../src/utils/foliateWordOffsets";
import { resolveFoliateStartWord } from "../src/utils/startWordIndex";

type LoadedWord = { sectionIndex: number };
type SectionBoundaryLike = {
  sectionIndex: number;
  startWordIdx: number;
  endWordIdx: number;
  wordCount: number;
};

function makeLoadedWords(sectionIndex: number, count: number): LoadedWord[] {
  return Array.from({ length: count }, () => ({ sectionIndex }));
}

function makeSection(
  sectionIndex: number,
  startWordIdx: number,
  endWordIdx: number,
  wordCount: number,
): SectionBoundaryLike[] {
  return [{ sectionIndex, startWordIdx, endWordIdx, wordCount }];
}

describe("selection and interaction identity for stitched EPUB tokens", () => {
  it("maps any click on a stitched fragment to the same global word index", () => {
    const loadedWords = makeLoadedWords(7, 3);
    const bookWordSections = makeSection(7, 4065, 4068, 3);
    const stitchedRenderedWordIndexes = [0, 1];

    const firstFragmentIndex = resolveRenderedWordIndexToGlobal(
      7,
      0,
      loadedWords,
      bookWordSections,
      stitchedRenderedWordIndexes,
    );
    const secondFragmentIndex = resolveRenderedWordIndexToGlobal(
      7,
      1,
      loadedWords,
      bookWordSections,
      stitchedRenderedWordIndexes,
    );

    expect(firstFragmentIndex).toBe(4065);
    expect(secondFragmentIndex).toBe(4065);
    expect(firstFragmentIndex).toBe(secondFragmentIndex);
  });

  it("keeps selection-driven narration start anchored to the stitched token start", () => {
    const loadedWords = makeLoadedWords(7, 3);
    const bookWordSections = makeSection(7, 4065, 4068, 3);
    const stitchedRenderedWordIndexes = [0, 1];

    const selectedFragmentIndex = resolveRenderedWordIndexToGlobal(
      7,
      1,
      loadedWords,
      bookWordSections,
      stitchedRenderedWordIndexes,
    );
    const narrationStartIndex = resolveFoliateStartWord(
      selectedFragmentIndex,
      3,
      () => 999,
      270494,
    );

    expect(selectedFragmentIndex).toBe(4065);
    expect(narrationStartIndex).toBe(4065);
  });
});
