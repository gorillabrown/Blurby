import type { RhythmPauses } from "../types";
import { TTS_PAUSE_COMMA_MS, TTS_PAUSE_SENTENCE_MS, TTS_PAUSE_PARAGRAPH_MS } from "../constants";

/**
 * Calculate extra pause duration for a word based on rhythm pause settings.
 * Returns extra milliseconds to add to the word's display time.
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
 * Only returns a non-zero pause if the pre-buffer is ready —
 * when not ready, generation time IS the natural pause.
 */
export function calculateChunkBoundaryPause(
  lastWord: string,
  lastWordGlobalIdx: number,
  paragraphBreaks: Set<number>,
  rhythmPauses: RhythmPauses | null,
  hasPreBuffer: boolean
): number {
  if (!hasPreBuffer || !rhythmPauses) return 0;

  const isParagraphEnd = paragraphBreaks.has(lastWordGlobalIdx);
  if (isParagraphEnd && rhythmPauses.paragraphs) {
    return TTS_PAUSE_PARAGRAPH_MS;
  }
  if (/[.!?]["'\u201D\u2019)]*$/.test(lastWord) && rhythmPauses.sentences) {
    return TTS_PAUSE_SENTENCE_MS;
  }
  if (/[,;:]["'\u201D\u2019)]*$/.test(lastWord) && rhythmPauses.commas) {
    return TTS_PAUSE_COMMA_MS;
  }
  return 0;
}
