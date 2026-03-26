const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });

/**
 * Tokenize text into words using Intl.Segmenter.
 * Consistent tokenization for both word extraction and click position mapping.
 */
export function segmentWords(text: string): string[] {
  return Array.from(segmenter.segment(text))
    .filter(s => s.isWordLike)
    .map(s => s.segment);
}

/**
 * Count words using Intl.Segmenter tokenization (same as segmentWords).
 * Named differently from text.ts countWords to avoid confusion.
 */
export function countWordsSegmenter(text: string): number {
  let count = 0;
  for (const s of segmenter.segment(text)) {
    if (s.isWordLike) count++;
  }
  return count;
}
