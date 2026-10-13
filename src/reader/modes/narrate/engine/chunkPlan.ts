/**
 * Narrate engine — chunk bounds over the book's words (charter choice T2, NARRATE-REBUILD-1 P3).
 *
 * The first chunk is one short sentence of at most 15 words (a longer first sentence is cut at its last pause
 * mark within the first 15 words, else at word 15); later chunks pack whole sentences under an estimated token
 * count. The estimate only packs; the exact cap (400 input ids) is enforced by the producer, which fails closed
 * on an over-long chunk. A chunk's text is its words joined by single spaces, so the producer's units map back
 * to book words by count alone. Pure.
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

/** Sentence boundaries as exclusive end indices, from `from`, stopping after `limit` words or at a hard break. */
function sentenceEnds(words: readonly string[], from: number, to: number, breaks: ReadonlySet<number>): number[] {
  const ends: number[] = [];
  for (let i = from; i < to; i++) {
    if (SENTENCE_END.test(words[i]) || breaks.has(i) || i === to - 1) ends.push(i + 1);
  }
  return ends;
}

/**
 * Plan up to `maxChunks` chunks starting at word `from`. `breaks` holds word indices after which a paragraph or
 * section break follows (a chunk never crosses one). Returns [] when `from` is past the end.
 */
export function planChunks(
  words: readonly string[],
  from: number,
  options: { readonly maxChunks?: number; readonly breaks?: ReadonlySet<number> } = {},
): ChunkPlanEntry[] {
  const maxChunks = options.maxChunks ?? Infinity;
  const breaks = options.breaks ?? new Set<number>();
  const out: ChunkPlanEntry[] = [];
  let at = Math.max(0, from);
  const total = words.length;
  const entry = (start: number, end: number): ChunkPlanEntry => ({ startWord: start, endWord: end, text: words.slice(start, end).join(" ") });

  // First chunk: one sentence of at most 15 words.
  if (at < total && out.length < maxChunks) {
    const firstEnd = sentenceEnds(words, at, total, breaks)[0];
    let end = firstEnd;
    if (firstEnd - at > FIRST_CHUNK_MAX_WORDS) {
      end = at + FIRST_CHUNK_MAX_WORDS;
      for (let i = at + FIRST_CHUNK_MAX_WORDS - 1; i >= at; i--) if (PAUSE_MARK.test(words[i])) { end = i + 1; break; }
    }
    out.push(entry(at, end));
    at = end;
  }

  // Later chunks: whole sentences packed under the token estimate; a sentence too long on its own is cut to fit.
  while (at < total && out.length < maxChunks) {
    const ends = sentenceEnds(words, at, total, breaks);
    let end = at;
    for (const e of ends) {
      if (end > at && estimateTokens(words.slice(at, e).join(" ")) > PACK_TARGET_TOKENS) break;
      end = e;
      if (breaks.has(e - 1)) break; // a hard break ends the chunk
      if (estimateTokens(words.slice(at, e).join(" ")) > PACK_TARGET_TOKENS) break;
    }
    if (estimateTokens(words.slice(at, end).join(" ")) > PACK_TARGET_TOKENS) {
      // One sentence over the estimate: cut at the last pause mark that fits, else at the last word that fits.
      let cut = at + 1;
      for (let i = at + 1; i <= end; i++) { if (estimateTokens(words.slice(at, i).join(" ")) > PACK_TARGET_TOKENS) break; cut = i; }
      let atPause = -1;
      for (let i = cut - 1; i > at; i--) if (PAUSE_MARK.test(words[i])) { atPause = i + 1; break; }
      end = atPause > at ? atPause : cut;
    }
    out.push(entry(at, end));
    at = end;
  }
  return out;
}
