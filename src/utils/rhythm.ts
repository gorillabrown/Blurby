import type { RhythmPauses } from "../types";
import { TTS_PAUSE_COMMA_MS, TTS_PAUSE_SENTENCE_MS, TTS_PAUSE_PARAGRAPH_MS } from "../constants";
import { getChunkBoundaryPauseMs, countSentences } from "./pauseDetection";

/**
 * Calculate extra pause duration for a word based on rhythm pause settings.
 * Returns extra milliseconds to add to the word's display time.
 * Used by Focus and Flow modes (non-Kokoro rhythm).
 */
export function calculatePauseMs(
  word: string,
  pauses: RhythmPauses,
  punctMs: number,
  isParagraphEnd: boolean
): number {
  let extra = 0;

  // Sentence endings (.!?) — longest punctuation pause
  if (pauses.sentences && /[.!?]["'»)\]]*$/.test(word)) {
    extra += Math.round(punctMs * 1.5);
    // Paragraph break adds on top of sentence pause
    if (pauses.paragraphs && isParagraphEnd) {
      extra += Math.round(punctMs * 0.5); // total ~2x for paragraph
    }
  }
  // Comma/colon/semicolon — shorter pause (only if not already a sentence end)
  else if (pauses.commas && /[,;:]["'»)\]]*$/.test(word)) {
    extra += punctMs;
    if (pauses.paragraphs && isParagraphEnd) {
      extra += punctMs;
    }
  }
  // Paragraph break without punctuation
  else if (pauses.paragraphs && isParagraphEnd) {
    extra += Math.round(punctMs * 2);
  }

  // Numbers — additive
  if (pauses.numbers && /\d/.test(word)) {
    extra += Math.round(punctMs * 0.5);
  }

  // Longer words (>8 chars) — additive
  if (pauses.longerWords && word.length > 8) {
    extra += (word.length - 8) * 15;
  }

  return extra;
}

/**
 * Calculate the pause duration at a TTS chunk boundary.
 * Delegates to pauseDetection for smart abbreviation/dialogue-aware logic.
 */
export function calculateChunkBoundaryPause(
  lastWord: string,
  lastWordGlobalIdx: number,
  paragraphBreaks: Set<number>,
  rhythmPauses: RhythmPauses | null,
  allWords: string[],
  nextWord?: string,
): number {
  if (!rhythmPauses) return 0;

  const isParagraphEnd = paragraphBreaks.has(lastWordGlobalIdx);

  // Compute sentence count for the preceding paragraph if at a paragraph break
  let sentenceCount = 1;
  if (isParagraphEnd && rhythmPauses.paragraphs) {
    // Find paragraph start (previous break + 1, or 0)
    const sortedBreaks = [...paragraphBreaks].filter(b => b < lastWordGlobalIdx).sort((a, b) => a - b);
    const paraStart = sortedBreaks.length > 0 ? sortedBreaks[sortedBreaks.length - 1] + 1 : 0;
    const paraWords = allWords.slice(paraStart, lastWordGlobalIdx + 1);
    sentenceCount = countSentences(paraWords);
  }

  return getChunkBoundaryPauseMs(lastWord, nextWord, isParagraphEnd, sentenceCount);
}
