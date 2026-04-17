const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
const TRAILING_PUNCT_RE = /^[.!?,;:'"»)\]\u201D\u2019\u2026]+$/;
const REAL_WHITESPACE_RE = /\s/;
const STITCHABLE_GAP_RE = /^[\u200B\u200C\u200D\uFEFF]*$/;

export interface SegmentedWordSpan {
  word: string;
  start: number;
  end: number;
}

export function hasRealWhitespaceBoundary(text: string, start: number, end: number): boolean {
  return REAL_WHITESPACE_RE.test(text.slice(start, end));
}

export function shouldStitchWithoutWhitespace(text: string, start: number, end: number): boolean {
  const gap = text.slice(start, end);
  if (gap.length === 0) return true;
  if (REAL_WHITESPACE_RE.test(gap)) return false;
  return STITCHABLE_GAP_RE.test(gap);
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
    let lastConsumedIndex = si;
    for (let pi = si + 1; pi < segments.length; pi++) {
      const next = segments[pi];
      const gap = text.slice(endOffset, next.index);

      if (next.isWordLike) {
        if (!shouldStitchWithoutWhitespace(text, endOffset, next.index)) break;
        wordWithPunct += gap + next.segment;
        endOffset = next.index + next.segment.length;
        lastConsumedIndex = pi;
        continue;
      }

      if (!hasRealWhitespaceBoundary(text, endOffset, next.index) && TRAILING_PUNCT_RE.test(next.segment)) {
        wordWithPunct += gap + next.segment;
        endOffset = next.index + next.segment.length;
        lastConsumedIndex = pi;
      } else {
        break;
      }
    }

    words.push({ word: wordWithPunct, start: index, end: endOffset });
    si = lastConsumedIndex;
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
  return segmentWordSpans(text).length;
}
