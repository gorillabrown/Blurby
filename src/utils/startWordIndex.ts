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
 * TTS-7K (BUG-132): When full-book EPUB extraction is complete, the highlighted
 * word index is global (e.g. 1603) but the DOM-loaded slice may only have 14 words.
 * The optional `globalWordsLength` parameter allows validation against the full-book
 * word count so global selections are not discarded.
 *
 * @param highlightedWordIndex - Current position from word click or progress
 * @param wordsLength - Number of words in the active array (may be DOM slice or global)
 * @param findFirstVisibleWordIndex - Function to query foliate for first on-screen word
 * @param globalWordsLength - Optional full-book word count for global index validation
 * @returns Resolved word index
 */
export function resolveFoliateStartWord(
  highlightedWordIndex: number,
  wordsLength: number,
  findFirstVisibleWordIndex: () => number,
  globalWordsLength?: number
): number {
  // TTS-7K: Validate against the larger of wordsLength and globalWordsLength.
  // This ensures a global index like 1603 is not discarded just because the
  // DOM slice only has 14 words.
  const validationLength = globalWordsLength != null ? Math.max(wordsLength, globalWordsLength) : wordsLength;

  // If user has a valid position (clicked a word or resumed from saved progress), use it
  const isValid = highlightedWordIndex >= 0 && highlightedWordIndex < validationLength;
  if (isValid) return highlightedWordIndex;

  // Find first visible word on current page
  const firstVisible = findFirstVisibleWordIndex();
  if (firstVisible >= 0) return firstVisible;

  // Last resort
  return 0;
}
