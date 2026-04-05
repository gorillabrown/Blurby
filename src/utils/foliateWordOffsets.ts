import type { SectionBoundary } from "../types/narration";

export interface SectionIndexedWordLike {
  sectionIndex: number;
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
): number {
  const bookSection = bookWordSections?.find((s) => s.sectionIndex === sectionIndex);
  if (!bookSection) return renderedWordIndex;

  if (
    renderedWordIndex >= bookSection.startWordIdx &&
    renderedWordIndex < bookSection.endWordIdx
  ) {
    return renderedWordIndex;
  }

  const localStart = getLoadedSectionStart(sectionIndex, loadedWords);
  const localCount = getLoadedSectionWordCount(sectionIndex, loadedWords);
  if (localStart >= 0 && localCount > 0) {
    const localEnd = localStart + localCount;
    if (renderedWordIndex >= localStart && renderedWordIndex < localEnd) {
      return bookSection.startWordIdx + (renderedWordIndex - localStart);
    }
    if (localStart === 0 && renderedWordIndex >= 0 && renderedWordIndex < localCount) {
      return bookSection.startWordIdx + renderedWordIndex;
    }
  }

  return renderedWordIndex;
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
