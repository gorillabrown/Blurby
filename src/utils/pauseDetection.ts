// src/utils/pauseDetection.ts — Smart pause heuristics for TTS chunk boundaries
//
// Replaces naive regex-only detection with a multi-step pipeline that handles
// abbreviations (Dr., Mr.), acronyms (J.P., N.A.S.A.), and dialogue paragraphs.

import {
  TTS_PAUSE_COMMA_MS,
  TTS_PAUSE_CLAUSE_MS,
  TTS_PAUSE_SENTENCE_MS,
  TTS_PAUSE_PARAGRAPH_MS,
  TTS_DIALOGUE_SENTENCE_THRESHOLD,
} from "../constants";

/** Pause configuration — callers pass runtime settings values. */
export interface PauseConfig {
  commaMs: number;
  clauseMs: number;
  sentenceMs: number;
  paragraphMs: number;
  dialogueThreshold: number;
}

/** Default pause config from constants (used when no settings override). */
export const DEFAULT_PAUSE_CONFIG: PauseConfig = {
  commaMs: TTS_PAUSE_COMMA_MS,
  clauseMs: TTS_PAUSE_CLAUSE_MS,
  sentenceMs: TTS_PAUSE_SENTENCE_MS,
  paragraphMs: TTS_PAUSE_PARAGRAPH_MS,
  dialogueThreshold: TTS_DIALOGUE_SENTENCE_THRESHOLD,
};

/** Known abbreviations that end with a period but are NOT sentence endings. */
const KNOWN_ABBREVIATIONS = new Set([
  "dr.", "mr.", "mrs.", "ms.", "jr.", "sr.", "st.", "vs.",
  "etc.", "i.e.", "e.g.", "prof.", "gen.", "lt.", "rev.",
  "inc.", "ltd.", "sgt.", "capt.", "gov.", "corp.",
]);

/**
 * Strip trailing quote/bracket characters from a word for punctuation analysis.
 * e.g. `"Hello."` → `Hello.`, `world?'` → `world?`
 */
function stripTrailingQuotes(word: string): string {
  return word.replace(/["'\u201D\u2019\u00BB)\]]+$/, "");
}

/**
 * Strip trailing quotes but preserve closing parenthesis for clause detection.
 * Only strips quote characters, not `)`.
 */
function stripQuotesOnly(word: string): string {
  return word.replace(/["'\u201D\u2019\u00BB\]]+$/, "");
}

/**
 * Determine whether a word represents a real sentence ending.
 *
 * Priority order:
 * 1. Internal period (e.g. `J.P.`, `N.A.S.A.`, `U.S.A.`) → acronym, not sentence end
 * 2. Known abbreviation set (dr., mr., etc.) → not sentence end
 * 3. Next word starts with lowercase → not sentence end (e.g. `Dr. Brown`)
 * 4. Otherwise → real sentence end
 * 5. `!` and `?` always trigger sentence end (no false-positive risk)
 */
export function isSentenceEnd(word: string, nextWord?: string): boolean {
  const stripped = stripTrailingQuotes(word);

  // ! and ? are always sentence endings
  if (/[!?]$/.test(stripped)) return true;

  // Must end with a period to be a candidate
  if (!/\.$/.test(stripped)) return false;

  // Step 1: Internal period check — period followed by a word character
  // Matches J.P., N.A.S.A., U.S.A. but NOT "end."
  const withoutTrailingPeriod = stripped.slice(0, -1);
  if (/\.\w/.test(withoutTrailingPeriod)) return false;

  // Step 2: Known abbreviation check
  if (KNOWN_ABBREVIATIONS.has(stripped.toLowerCase())) return false;

  // Step 3: Next word starts with lowercase → not a sentence end
  if (nextWord && /^[a-z]/.test(nextWord)) return false;

  // Step 4: Real sentence end
  return true;
}

/**
 * Get paragraph pause duration based on sentence count.
 * Dialogue paragraphs (≤ threshold sentences) get 0ms.
 * Expository paragraphs (> threshold) get full paragraph pause.
 */
export function getParagraphPauseMs(sentenceCount: number, config?: PauseConfig): number {
  const cfg = config ?? DEFAULT_PAUSE_CONFIG;
  if (sentenceCount <= cfg.dialogueThreshold) return 0;
  return cfg.paragraphMs;
}

/**
 * Count sentences in a paragraph by scanning words for sentence-ending punctuation
 * that passes the isSentenceEnd check. Returns at least 1.
 */
export function countSentences(words: string[]): number {
  let count = 0;
  for (let i = 0; i < words.length; i++) {
    const nextWord = i + 1 < words.length ? words[i + 1] : undefined;
    if (isSentenceEnd(words[i], nextWord)) count++;
  }
  return Math.max(count, 1);
}

/**
 * Calculate the pause duration at a TTS chunk boundary.
 *
 * @param lastWord - Last word of the just-finished chunk
 * @param nextWord - First word of the next chunk (if any)
 * @param isParagraphBreak - Whether a paragraph break occurs at this boundary
 * @param precedingParagraphSentenceCount - Sentence count of the paragraph ending here
 * @param config - Runtime pause configuration (from settings)
 */
export function getChunkBoundaryPauseMs(
  lastWord: string,
  nextWord: string | undefined,
  isParagraphBreak: boolean,
  precedingParagraphSentenceCount: number,
  config?: PauseConfig,
): number {
  const cfg = config ?? DEFAULT_PAUSE_CONFIG;

  // Paragraph boundary — use sentence-count heuristic
  if (isParagraphBreak) {
    const paragraphPause = getParagraphPauseMs(precedingParagraphSentenceCount, cfg);
    if (paragraphPause > 0) return paragraphPause;
    // Dialogue paragraph: fall through to check for sentence-end punctuation
  }

  // Sentence ending
  if (isSentenceEnd(lastWord, nextWord)) return cfg.sentenceMs;

  // Check for clause punctuation: colon and closing parenthesis
  const quotesStripped = stripQuotesOnly(lastWord);
  if (/\)$/.test(quotesStripped)) return cfg.clauseMs;
  if (/:$/.test(quotesStripped)) return cfg.clauseMs;

  // Comma/semicolon
  const stripped = stripTrailingQuotes(lastWord);
  if (/[,;]$/.test(stripped)) return cfg.commaMs;

  return 0;
}
