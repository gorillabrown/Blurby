// ── Book word array types (moved from bookWordExtractor.ts in HOTFIX-6) ──────

/** Section boundary in the book-wide word array */
export interface SectionBoundary {
  sectionIndex: number;
  startWordIdx: number;  // first word of this section in the global array
  endWordIdx: number;    // last word + 1
  wordCount: number;
}
