const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
const TRAILING_PUNCT_RE = /^[.!?,;:'"»)\]\u201D\u2019\u2026]+$/;

export interface SegmentedWordSpan {
  word: string;
  start: number;
  end: number;
}

/**
 * Segment text into words using the same punctuation-attaching contract as the
 * EPUB extraction and Foliate range builders.
 */
export function segmentWordSpans(text: string): SegmentedWordSpan[] {
  const segments = Array.from(segmenter.segment(text));
  const words: SegmentedWordSpan[] = [];

  for (let si = 0; si < segments.length; si++) {
    const { segment, isWordLike, index } = segments[si];
    if (!isWordLike) continue;

    let wordWithPunct = segment;
    let endOffset = index + segment.length;
    for (let pi = si + 1; pi < segments.length; pi++) {
      const next = segments[pi];
      if (next.isWordLike) break;
      if (TRAILING_PUNCT_RE.test(next.segment)) {
        wordWithPunct += next.segment;
        endOffset = next.index + next.segment.length;
      } else {
        break;
      }
    }

    words.push({ word: wordWithPunct, start: index, end: endOffset });
  }

  return words;
}

/**
 * Tokenize text into words using Intl.Segmenter.
 * Consistent tokenization for both word extraction and click position mapping.
 */
export function segmentWords(text: string): string[] {
  return segmentWordSpans(text).map((s) => s.word);
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
