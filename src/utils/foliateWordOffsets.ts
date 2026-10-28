import type { SectionBoundary } from "../types/narration";

export interface SectionIndexedWordLike {
  sectionIndex: number;
}

function collapseRenderedWordIndexes(
  renderedWordIndex: number,
  stitchedRenderedWordIndexes?: number[],
): number {
  const collapsed = [
    renderedWordIndex,
    ...(stitchedRenderedWordIndexes ?? []),
  ].filter((value) => Number.isFinite(value));

  if (collapsed.length === 0) return renderedWordIndex;
  return Math.min(...collapsed);
}

function getLoadedSectionStart(
  sectionIndex: number,
  loadedWords: SectionIndexedWordLike[],
): number {
  return loadedWords.findIndex((w) => w.sectionIndex === sectionIndex);
}

function getLoadedSectionWordCount(
  sectionIndex: number,
  loadedWords: SectionIndexedWordLike[],
): number {
  let count = 0;
  for (const word of loadedWords) {
    if (word.sectionIndex === sectionIndex) count++;
  }
  return count;
}

/**
 * Resolve the global start offset for a rendered section.
 * Prefer full-book extraction boundaries when available; otherwise fall back
 * to the local loaded-slice index for older/non-global contexts.
 */
export function getSectionGlobalOffset(
  sectionIndex: number,
  loadedWords: SectionIndexedWordLike[],
  bookWordSections?: SectionBoundary[],
): number {
  const bookSection = bookWordSections?.find((s) => s.sectionIndex === sectionIndex);
  if (bookSection) return bookSection.startWordIdx;
  return getLoadedSectionStart(sectionIndex, loadedWords);
}

/**
 * Convert a rendered `data-word-index` into a global book index.
 *
 * The rendered DOM may still be stamped with section-local or loaded-slice
 * offsets if the full-book boundaries arrived after initial section load.
 * When that happens, map the rendered offset back into the book-wide section.
 */
export function resolveRenderedWordIndexToGlobal(
  sectionIndex: number,
  renderedWordIndex: number,
  loadedWords: SectionIndexedWordLike[],
  bookWordSections?: SectionBoundary[],
  stitchedRenderedWordIndexes?: number[],
): number {
  const collapsedRenderedWordIndex = collapseRenderedWordIndexes(
    renderedWordIndex,
    stitchedRenderedWordIndexes,
  );
  const bookSection = bookWordSections?.find((s) => s.sectionIndex === sectionIndex);
  if (!bookSection) return collapsedRenderedWordIndex;

  if (
    collapsedRenderedWordIndex >= bookSection.startWordIdx &&
    collapsedRenderedWordIndex < bookSection.endWordIdx
  ) {
    return collapsedRenderedWordIndex;
  }

  const localStart = getLoadedSectionStart(sectionIndex, loadedWords);
  const localCount = getLoadedSectionWordCount(sectionIndex, loadedWords);
  if (localStart >= 0 && localCount > 0) {
    const localEnd = localStart + localCount;
    if (
      collapsedRenderedWordIndex >= localStart &&
      collapsedRenderedWordIndex < localEnd
    ) {
      return bookSection.startWordIdx + (collapsedRenderedWordIndex - localStart);
    }
    if (
      localStart === 0 &&
      collapsedRenderedWordIndex >= 0 &&
      collapsedRenderedWordIndex < localCount
    ) {
      return bookSection.startWordIdx + collapsedRenderedWordIndex;
    }
  }

  return collapsedRenderedWordIndex;
}

/**
 * Convert a global book index into the currently rendered `data-word-index`.
 *
 * Used as a fallback when the DOM has not yet been re-stamped with global
 * offsets but the section boundaries are known.
 */
export function resolveGlobalWordIndexToRendered(
  sectionIndex: number,
  globalWordIndex: number,
  loadedWords: SectionIndexedWordLike[],
  bookWordSections?: SectionBoundary[],
): number {
  const bookSection = bookWordSections?.find((s) => s.sectionIndex === sectionIndex);
  if (!bookSection) return globalWordIndex;

  const localStart = getLoadedSectionStart(sectionIndex, loadedWords);
  if (localStart < 0) return globalWordIndex;

  if (
    globalWordIndex >= bookSection.startWordIdx &&
    globalWordIndex < bookSection.endWordIdx
  ) {
    return localStart + (globalWordIndex - bookSection.startWordIdx);
  }

  return globalWordIndex;
}
