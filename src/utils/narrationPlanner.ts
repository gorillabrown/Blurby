// src/utils/narrationPlanner.ts — TTS-7P: Rolling pause-boundary planner
//
// Builds a lightweight forward-looking plan for the active narration text window.
// The plan is LOCAL (next N words only) and cheap to rebuild. It classifies every
// legal chunk-end position and exposes that classification to the generation pipeline,
// silence injector, and resume logic.
//
// Design principles:
// - Single source of truth for where a chunk MAY legally end. Mid-sentence cuts
//   are prohibited by planner contract — the pipeline defers to the planner.
// - Cursor authority is never touched. The plan is read-only relative to the
//   resume anchor; it classifies future positions but never mutates past ones.
// - Dialogue-aware: short quote paragraphs get smaller inter-chunk pauses.
// - Cheap to rebuild: O(windowWords) scan with no allocations beyond the plan array.

import {
  TTS_PLANNER_WINDOW_WORDS,
  TTS_PLANNER_MIN_CHUNK_WORDS,
} from "../constants";
import {
  isSentenceEnd,
  classifyChunkBoundary,
  type ChunkBoundaryType,
  type PauseConfig,
  DEFAULT_PAUSE_CONFIG,
  getParagraphPauseMs,
  countSentences,
} from "./pauseDetection";

// ── Types ────────────────────────────────────────────────────────────────────

/**
 * A single planned chunk boundary in the forward window.
 *
 * `endIdx` is the exclusive end of the chunk (i.e. `words[startIdx..endIdx]`).
 * `boundaryType` is the classification at `endIdx - 1` (the last word of the chunk).
 * `silenceMs` is the recommended inter-chunk silence after this chunk.
 * `isDialogue` indicates the chunk ends inside a dialogue paragraph (short quote block).
 */
export interface PlannedChunk {
  startIdx: number;
  endIdx: number; // exclusive
  boundaryType: ChunkBoundaryType;
  /** Recommended silence to inject AFTER this chunk (ms). 0 when none needed. */
  silenceMs: number;
  /** True when this chunk ends inside a dialogue paragraph */
  isDialogue: boolean;
}

/**
 * The active narration plan for the rolling forward window.
 *
 * `anchorIdx` is the word index at which the plan was built (the active cursor).
 * `chunks` is an ordered array of planned chunks covering anchorIdx…(anchorIdx+windowWords).
 * `windowEnd` is the exclusive last word covered by this plan.
 */
export interface NarrationPlan {
  anchorIdx: number;
  windowEnd: number;
  chunks: PlannedChunk[];
}

// ── Dialogue detection ───────────────────────────────────────────────────────

/**
 * TTS-7P: Detect dialogue context for a word range.
 *
 * A word range is considered "dialogue" when the containing paragraph:
 *   1. Contains an opening quotation mark (", ', \u201C, \u2018) among its words.
 *   2. Has at most `dialogueThreshold` sentences (short blocks = dialogue lines).
 *
 * This prevents flattening multi-sentence dialogue into prose-like long pauses.
 */
function isDialogueParagraph(
  words: string[],
  paraStart: number,
  paraEnd: number, // inclusive
  dialogueThreshold: number,
): boolean {
  const paraWords = words.slice(paraStart, paraEnd + 1);
  const text = paraWords.join(" ");
  // Must contain an opening quote character
  if (!/["'\u201C\u2018\u00AB]/.test(text)) return false;
  // Must be short enough to count as dialogue (not a long quoted block)
  const sentences = countSentences(paraWords);
  return sentences <= dialogueThreshold;
}

// ── Paragraph boundary detection ─────────────────────────────────────────────

/**
 * TTS-7P: Given a word array and a set of paragraph breaks, find the paragraph
 * that contains `wordIdx` and return [paraStart, paraEnd] (both inclusive).
 */
function findParagraphBounds(
  wordIdx: number,
  words: string[],
  paragraphBreaks: Set<number>,
): [number, number] {
  let paraStart = 0;
  let paraEnd = words.length - 1;

  // Find the last break BEFORE wordIdx → that's the paragraph start
  for (const brk of paragraphBreaks) {
    if (brk < wordIdx && brk + 1 > paraStart) {
      paraStart = brk + 1;
    }
  }

  // Find the smallest break AT or AFTER wordIdx → that's the paragraph end
  for (const brk of paragraphBreaks) {
    if (brk >= wordIdx && brk < paraEnd) {
      paraEnd = brk;
    }
  }

  return [paraStart, paraEnd];
}

// ── Silence for boundary ─────────────────────────────────────────────────────

/**
 * TTS-7P: Compute silence to inject after a chunk based on:
 *   - boundary type (sentence / clause / comma / paragraph / none)
 *   - whether we're in a dialogue paragraph (reduces paragraph pause)
 *   - the pause config
 */
export function computeSilenceMs(
  boundaryType: ChunkBoundaryType,
  isParagraphBreak: boolean,
  isDialogue: boolean,
  precedingSentenceCount: number,
  config: PauseConfig,
): number {
  if (boundaryType === "none" && !isParagraphBreak) return 0;

  if (isParagraphBreak) {
    // Dialogue paragraphs: use sentence pause instead of full paragraph pause
    if (isDialogue) {
      return boundaryType === "none" ? 0 : config.sentenceMs;
    }
    const paraMs = getParagraphPauseMs(precedingSentenceCount, config);
    if (paraMs > 0) return paraMs;
    // Dialogue paragraph threshold not triggered — fall through to sentence check
  }

  switch (boundaryType) {
    case "paragraph": return config.paragraphMs;
    case "sentence": return config.sentenceMs;
    case "clause": return config.clauseMs;
    case "comma": return config.commaMs;
    default: return 0;
  }
}

// ── Core planner ─────────────────────────────────────────────────────────────

/**
 * TTS-7P: Build a rolling narration plan for the active forward window.
 *
 * The planner scans `words[anchorIdx .. anchorIdx+windowWords]` and emits
 * planned chunks whose boundaries are always at sentence endings (or clause
 * endings when no sentence boundary exists within the cruise target).
 *
 * Rules:
 * - A chunk NEVER ends mid-sentence unless the entire remaining window has no
 *   sentence boundary (end-of-book fallback only).
 * - A chunk is at least TTS_PLANNER_MIN_CHUNK_WORDS long (prohibits tiny fragments).
 * - Silence between chunks comes from the planner — downstream code trusts the plan.
 *
 * @param words        Full word array for the current narration session
 * @param anchorIdx    The active cursor / resume position (first word to plan from)
 * @param targetChunkWords  Preferred chunk size in words (cruise size)
 * @param paragraphBreaks  Set of word indices that are the LAST word of their paragraph
 * @param pauseConfig  User-configured pause durations
 * @param windowWords  How many words ahead to plan (defaults to TTS_PLANNER_WINDOW_WORDS)
 */
export function buildNarrationPlan(
  words: string[],
  anchorIdx: number,
  targetChunkWords: number,
  paragraphBreaks: Set<number>,
  pauseConfig?: PauseConfig,
  windowWords = TTS_PLANNER_WINDOW_WORDS,
): NarrationPlan {
  const cfg = pauseConfig ?? DEFAULT_PAUSE_CONFIG;
  const windowEnd = Math.min(anchorIdx + windowWords, words.length);
  const chunks: PlannedChunk[] = [];

  let pos = anchorIdx;

  while (pos < windowEnd) {
    const rawTarget = Math.min(pos + targetChunkWords, windowEnd);
    const minEnd = Math.min(pos + TTS_PLANNER_MIN_CHUNK_WORDS, windowEnd);

    // Find best sentence boundary for this chunk.
    // Strategy: search backward from rawTarget, then forward, within a tolerance window.
    // Never allow a chunk to end at a point that is not a sentence boundary
    // (unless no sentence boundary exists in the remaining window at all).
    const tolerance = Math.min(15, Math.floor(targetChunkWords / 3));
    let endIdx = findBestBoundary(words, pos, rawTarget, windowEnd, minEnd, tolerance);

    // Determine boundary type at the last word of this chunk
    const lastWordIdx = endIdx - 1;
    const boundaryType = classifyChunkBoundary(words, lastWordIdx);

    // Determine paragraph context at this chunk's end
    const isParagraphBreak = paragraphBreaks.has(lastWordIdx);
    const [paraStart, paraEnd] = findParagraphBounds(lastWordIdx, words, paragraphBreaks);

    // Count sentences in the preceding paragraph for paragraph-pause scaling
    let sentenceCount = 1;
    if (isParagraphBreak) {
      const paraWords = words.slice(paraStart, paraEnd + 1);
      sentenceCount = countSentences(paraWords);
    }

    // Detect dialogue context
    const dialogue = isDialogueParagraph(words, paraStart, paraEnd, cfg.dialogueThreshold);

    // Compute inter-chunk silence
    const silenceMs = computeSilenceMs(
      boundaryType,
      isParagraphBreak,
      dialogue,
      sentenceCount,
      cfg,
    );

    chunks.push({
      startIdx: pos,
      endIdx,
      boundaryType,
      silenceMs,
      isDialogue: dialogue,
    });

    pos = endIdx;
  }

  return { anchorIdx, windowEnd, chunks };
}

/**
 * TTS-7P: Find the best legal chunk boundary in [pos .. windowEnd].
 *
 * Priority order:
 * 1. Sentence boundary within backward tolerance from rawTarget
 * 2. Sentence boundary within forward tolerance from rawTarget
 * 3. Sentence boundary anywhere in [minEnd .. windowEnd] (expanded search)
 * 4. Clause boundary (colon, parenthesis) near rawTarget
 * 5. Hard rawTarget (no sentence found — end-of-book fallback only)
 *
 * The returned index is EXCLUSIVE (chunk ends AFTER this word, i.e. words[result-1]
 * is the last word of the chunk).
 */
function findBestBoundary(
  words: string[],
  chunkStart: number,
  rawTarget: number,
  windowEnd: number,
  minEnd: number,
  tolerance: number,
): number {
  const maxIdx = windowEnd;
  const clampedTarget = Math.min(rawTarget, maxIdx);

  // Skip tiny chunks — nothing meaningful to snap for short ramp-up chunks
  if (clampedTarget - chunkStart <= TTS_PLANNER_MIN_CHUNK_WORDS) {
    return clampedTarget;
  }

  // 1. Backward from rawTarget
  for (let i = clampedTarget - 1; i >= Math.max(minEnd, clampedTarget - tolerance); i--) {
    const next = i + 1 < maxIdx ? words[i + 1] : undefined;
    if (isSentenceEnd(words[i], next)) return i + 1;
  }

  // 2. Forward from rawTarget
  for (let i = clampedTarget; i < Math.min(maxIdx, clampedTarget + tolerance); i++) {
    const next = i + 1 < maxIdx ? words[i + 1] : undefined;
    if (isSentenceEnd(words[i], next)) return i + 1;
  }

  // 3. Expanded backward (beyond tolerance — prevents mid-sentence cuts)
  for (let i = Math.max(minEnd, clampedTarget - tolerance) - 1; i >= minEnd; i--) {
    const next = i + 1 < maxIdx ? words[i + 1] : undefined;
    if (isSentenceEnd(words[i], next)) return i + 1;
  }

  // 4. Expanded forward (scan rest of window)
  for (let i = Math.min(maxIdx, clampedTarget + tolerance); i < maxIdx; i++) {
    const next = i + 1 < maxIdx ? words[i + 1] : undefined;
    if (isSentenceEnd(words[i], next)) return i + 1;
  }

  // 5. Fallback: use rawTarget (truly no sentence boundary in remaining text)
  return clampedTarget;
}

// ── Plan lookup helpers ───────────────────────────────────────────────────────

/**
 * TTS-7P: Look up the planned chunk that covers a given start index.
 * Returns undefined when the startIdx is outside the current plan's window
 * (caller should rebuild the plan).
 */
export function findPlannedChunk(
  plan: NarrationPlan,
  startIdx: number,
): PlannedChunk | undefined {
  return plan.chunks.find(c => c.startIdx === startIdx);
}

/**
 * TTS-7P: Check whether the active plan needs to be rebuilt.
 * Returns true when:
 *   - No plan exists
 *   - The new anchor is outside the current plan window
 *   - The new anchor is more than half the window ahead (proactive refresh)
 */
export function planNeedsRebuild(
  plan: NarrationPlan | null,
  newAnchor: number,
  windowWords = TTS_PLANNER_WINDOW_WORDS,
): boolean {
  if (!plan) return true;
  if (newAnchor < plan.anchorIdx) return true; // Jumped backward
  if (newAnchor >= plan.windowEnd) return true; // Exhausted window
  // Proactive: rebuild when we're past the halfway point of the current plan
  const halfPoint = plan.anchorIdx + Math.floor(windowWords / 2);
  return newAnchor >= halfPoint;
}
