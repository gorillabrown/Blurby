/**
 * Computes the correct starting word index for any reading mode.
 *
 * Centralizes the logic that was previously duplicated in startFocus,
 * startFlow, and startNarration within ReaderContainer.
 *
 * @param highlightedWordIndex - Current highlighted position
 * @param effectiveWordsLength - Length of the active word array (may be partial for foliate EPUBs)
 * @param useFoliate - Whether the EPUB foliate renderer is active
 * @returns Clamped, valid word index to start from
 */
export function getStartWordIndex(
  highlightedWordIndex: number,
  effectiveWordsLength: number,
  useFoliate: boolean
): number {
  // For foliate EPUBs, the word array only covers visible sections.
  // If the index exceeds the loaded words, fall back to 0 (first loaded word).
  if (useFoliate && highlightedWordIndex >= effectiveWordsLength) {
    return 0;
  }
  // Clamp to valid range [0, length-1]
  return Math.max(0, Math.min(highlightedWordIndex, Math.max(effectiveWordsLength - 1, 0)));
}

/**
 * Resolves the best starting word for a mode on a foliate EPUB.
 *
 * Priority:
 * 1. If highlightedWordIndex is valid and > 0, use it (user clicked a word)
 * 2. Otherwise, find the first visible word on the current page
 * 3. Fall back to 0
 *
 * @param highlightedWordIndex - Current position from word click or progress
 * @param wordsLength - Number of extracted words
 * @param findFirstVisibleWordIndex - Function to query foliate for first on-screen word
 * @returns Resolved word index
 */
export function resolveFoliateStartWord(
  highlightedWordIndex: number,
  wordsLength: number,
  findFirstVisibleWordIndex: () => number
): number {
  // If user has a valid position (clicked a word or resumed from saved progress), use it
  const isValid = highlightedWordIndex >= 0 && highlightedWordIndex < wordsLength;
  if (isValid) return highlightedWordIndex;

  // Find first visible word on current page
  const firstVisible = findFirstVisibleWordIndex();
  if (firstVisible >= 0) return firstVisible;

  // Last resort
  return 0;
}
