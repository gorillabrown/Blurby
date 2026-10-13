/**
 * Narrate engine — chunk bounds over the book's words (charter choice T2, NARRATE-REBUILD-1 P3; ramp P5).
 *
 * The first chunk of an epoch is one short sentence of at most 15 words (a longer first sentence is cut at its last
 * pause mark within the first 15 words, else at word 15); later chunks pack whole sentences under an estimated
 * token count. A ramp (P5, the latency lever) caps the first chunks of an epoch by word count instead — a small
 * first chunk sounds sooner, and each next chunk may grow while the previous one plays — until the ramp is spent
 * and the token packing takes over. The estimate only packs; the exact cap (400 input ids) is enforced by the
 * producer, which fails closed on an over-long chunk. A chunk's text is its words joined by single spaces, so the
 * producer's units map back to book words by count alone. Pure; no timing anywhere.
 */

export const FIRST_CHUNK_MAX_WORDS = 15;
export const PACK_TARGET_TOKENS = 400;
/** Phoneme characters per text character measured on the Phase 0 smoke run (1.04), padded. */
export const estimateTokens = (text: string): number => Math.ceil(text.length * 1.15) + 2;

const SENTENCE_END = /[.!?]["'”’)\]]*$/;
const PAUSE_MARK = /[,;:—]["'”’)\]]*$/;

export interface ChunkPlanEntry {
  readonly startWord: number;
  /** Exclusive. */
  readonly endWord: number;
  readonly text: string;
}

export interface ChunkPlanOptions {
  readonly maxChunks?: number;
  /** Word indices after which a paragraph or section break follows (a chunk never crosses one). */
  readonly breaks?: ReadonlySet<number>;
  /** Word caps for the first chunks of an epoch, by step; past its end the token packing applies. Empty = T2's 15-word first chunk only. */
  readonly ramp?: readonly number[];
  /** The step this plan starts at (the engine plans one chunk per call and counts the steps of an epoch). */
  readonly rampIndex?: number;
}

/** Sentence boundaries as exclusive end indices, from `from`, stopping after `limit` words or at a hard break. */
function sentenceEnds(words: readonly string[], from: number, to: number, breaks: ReadonlySet<number>): number[] {
  const ends: number[] = [];
  for (let i = from; i < to; i++) {
    if (SENTENCE_END.test(words[i]) || breaks.has(i) || i === to - 1) ends.push(i + 1);
  }
  return ends;
}

/** Cut a run that starts at `at` to at most `limit` words: at the last pause mark within the limit, else at the limit. */
function cutAtPause(words: readonly string[], at: number, limit: number): number {
  let end = at + limit;
  for (let i = at + limit - 1; i >= at; i--) if (PAUSE_MARK.test(words[i])) { end = i + 1; break; }
  return end;
}

/** Whole sentences from `at` while `fits(end)` holds; stops at a hard break. `at` when the first sentence does not fit. */
function packSentences(words: readonly string[], at: number, to: number, breaks: ReadonlySet<number>, fits: (end: number) => boolean): number {
  let end = at;
  for (const e of sentenceEnds(words, at, to, breaks)) {
    if (!fits(e)) break;
    end = e;
    if (breaks.has(e - 1)) break; // a hard break ends the chunk
  }
  return end;
}

/**
 * Plan up to `maxChunks` chunks starting at word `from`. Returns [] when `from` is past the end.
 */
export function planChunks(words: readonly string[], from: number, options: ChunkPlanOptions = {}): ChunkPlanEntry[] {
  const maxChunks = options.maxChunks ?? Infinity;
  const breaks = options.breaks ?? new Set<number>();
  const ramp = options.ramp ?? [];
  let step = options.rampIndex ?? 0;
  const out: ChunkPlanEntry[] = [];
  let at = Math.max(0, from);
  const total = words.length;
  const entry = (start: number, end: number): ChunkPlanEntry => ({ startWord: start, endWord: end, text: words.slice(start, end).join(" ") });
  const tokens = (start: number, end: number) => estimateTokens(words.slice(start, end).join(" "));

  while (at < total && out.length < maxChunks) {
    const cap = step < ramp.length ? ramp[step] : null;
    let end: number;
    if (step === 0) {
      // The first chunk of an epoch: one sentence of at most FIRST_CHUNK_MAX_WORDS words (or the ramp's first cap).
      const limit = cap ?? FIRST_CHUNK_MAX_WORDS;
      end = sentenceEnds(words, at, total, breaks)[0];
      if (end - at > limit) end = cutAtPause(words, at, limit);
    } else if (cap !== null) {
      // A ramp step: whole sentences under the word cap; a sentence too long on its own is cut to fit.
      end = packSentences(words, at, total, breaks, (e) => e - at <= cap);
      if (end === at) end = cutAtPause(words, at, cap);
    } else {
      // Steady state: whole sentences packed under the token estimate; a sentence too long on its own is cut to fit.
      end = packSentences(words, at, total, breaks, (e) => tokens(at, e) <= PACK_TARGET_TOKENS);
      if (end === at) {
        // One sentence over the estimate: cut at the last pause mark that fits, else at the last word that fits.
        const sentenceEnd = sentenceEnds(words, at, total, breaks)[0];
        let cut = at + 1;
        for (let i = at + 1; i <= sentenceEnd; i++) { if (tokens(at, i) > PACK_TARGET_TOKENS) break; cut = i; }
        let atPause = -1;
        for (let i = cut - 1; i > at; i--) if (PAUSE_MARK.test(words[i])) { atPause = i + 1; break; }
        end = atPause > at ? atPause : cut;
      }
    }
    out.push(entry(at, end));
    at = end;
    step += 1;
  }
  return out;
}
