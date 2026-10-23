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
/**
 * The packing target, under the producer's hard cap of 400 input ids (T2) by a margin for the estimate's error: packed to
 * 400 itself, a chunk came out at 405 ids in the D6 warm run (2026-10-13) and failed closed (F4) on ordinary text.
 */
export const PACK_TARGET_TOKENS = 360;
/**
 * Input ids per digit. A digit is spoken as a whole word ("1974" → "nineteen seventy four", "e4" → "e four"), so it
 * costs far more than a letter: 5.6–12.5 ids per digit on the owner library's class-E chunks (NARRATE-TOKEN-CAP-1 probe,
 * 2026-10-23), padded to the top of that range so a digit-dense chunk is planned under the cap.
 */
export const DIGIT_TOKEN_WEIGHT = 13;
/**
 * Phoneme characters per text character measured on the Phase 0 smoke run (1.04), padded; each digit at its own weight (above).
 * The estimate only packs; the producer enforces the exact cap.
 */
export const estimateTokens = (text: string): number => {
  const digits = (text.match(/\d/g) || []).length;
  return Math.ceil((text.length - digits) * 1.15 + digits * DIGIT_TOKEN_WEIGHT) + 2;
};

const SENTENCE_END = /[.!?]["'”’)\]]*$/;
const PAUSE_MARK = /[,;:—]["'”’)\]]*$/;

/**
 * Periods that do not end a sentence when a word follows that does not start one (P6b). The table is written for the
 * words this receives in the app: Electron's ICU segments "B.C." as "B." "C.", "i.e." as "i." "e." and
 * "www.gutenberg.org" as "www." "gutenberg." "org" (plain Node's ICU keeps them whole, so the whole forms are listed too).
 */
const ABBREVIATION = /^(?:i\.e\.|e\.g\.|etc\.|vs\.|a\.d\.|b\.c\.)$/i; // a regex, not a Set: no module singleton in a mode directory
/** Titles are followed by a name, which is capitalised: they never end a sentence when any word follows (Brain, P6b). */
const TITLE = /^(?:mr|mrs|ms|dr|st)\.$/i;
const SINGLE_LETTER = /^[A-Za-z]\.$/;
/** The next piece of a segmented dotted abbreviation ("C." after "B.", "e." after "i."). */
const LETTER_PIECE = /^[A-Za-z](?:\.|$)/;
const WEB_START = /^www\.$/i;
const WEB_PIECE = /^[a-z0-9-]+\.$/i;
const NEW_SENTENCE = /^["'“‘(\[]*[A-Z]/;
/** An uppercase initial other than "I.": before a capitalised name it is a name's initial ("M. Annius"), not an end. */
const NAME_INITIAL = /^[A-HJ-Z]\.$/;
/** Words that open sentences, so "Section B. The next" and "B. C. He" still end at the letter (not a name after it). */
const SENTENCE_OPENER = /^["'“‘(\[]*(?:the|a|an|this|that|these|those|it|its|he|she|they|we|you|i|his|her|their|our|my|but|and|or|so|then|there|here|in|on|at|if|when|as|after|before|for|with|what|who|how|why|no|not|yet)\b/i;

function isAbbreviation(words: readonly string[], i: number): boolean {
  if (SINGLE_LETTER.test(words[i]) || ABBREVIATION.test(words[i])) return true;
  for (let j = i; j >= 0 && WEB_PIECE.test(words[j]); j--) if (WEB_START.test(words[j])) return true;
  return false;
}

function isSentenceEnd(words: readonly string[], i: number): boolean {
  if (!SENTENCE_END.test(words[i])) return false;
  const next = words[i + 1];
  if (next === undefined) return true;
  if (TITLE.test(words[i])) return false;
  if (!isAbbreviation(words, i)) return true;
  if (SINGLE_LETTER.test(words[i]) && LETTER_PIECE.test(next)) return false;
  // NARRATE-SENTENCE-INITIALS-1; the second piece of a dotted abbreviation ("B." "C.") keeps the rule below.
  const completesAbbreviation = i > 0 && ABBREVIATION.test(words[i - 1] + words[i]);
  if (NAME_INITIAL.test(words[i]) && !completesAbbreviation && NEW_SENTENCE.test(next) && !SENTENCE_OPENER.test(next)) return false;
  return NEW_SENTENCE.test(next);
}

/**
 * The first word of the sentence holding word `i` (NARRATE-SENTENCE-RESUME-1): Narrate starts and resumes there. It
 * never goes back across a chunk break, and an index outside the words is returned as it is.
 */
export function sentenceStartAt(words: readonly string[], i: number, breaks: ReadonlySet<number>): number {
  if (i <= 0 || i >= words.length) return i;
  let j = i;
  while (j > 0 && !isSentenceEnd(words, j - 1) && !breaks.has(j - 1)) j--;
  return j;
}

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
  /** Decision #18: past the ramp, a chunk holds at most this many words (bounds the stale work a request can wait on). */
  readonly maxWords?: number;
  /** The step this plan starts at (the engine plans one chunk per call and counts the steps of an epoch). */
  readonly rampIndex?: number;
}

/** Sentence boundaries as exclusive end indices, from `from`, stopping after `limit` words or at a hard break. */
function sentenceEnds(words: readonly string[], from: number, to: number, breaks: ReadonlySet<number>): number[] {
  const ends: number[] = [];
  for (let i = from; i < to; i++) {
    if (isSentenceEnd(words, i) || breaks.has(i) || i === to - 1) ends.push(i + 1);
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
      // Steady state: whole sentences packed under the token estimate and the word cap; a sentence too long on its own is cut to fit.
      const maxWords = options.maxWords ?? Infinity;
      end = packSentences(words, at, total, breaks, (e) => e - at <= maxWords && tokens(at, e) <= PACK_TARGET_TOKENS);
      if (end === at) {
        // One sentence over the estimate: cut at the last pause mark that fits, else at the last word that fits.
        const sentenceEnd = sentenceEnds(words, at, total, breaks)[0];
        let cut = at + 1;
        for (let i = at + 1; i <= sentenceEnd; i++) { if (tokens(at, i) > PACK_TARGET_TOKENS) break; cut = i; }
        let atPause = -1;
        for (let i = cut - 1; i > at; i--) if (PAUSE_MARK.test(words[i])) { atPause = i + 1; break; }
        end = atPause > at ? atPause : cut;
        if (end - at > maxWords) end = cutAtPause(words, at, maxWords);
      }
    }
    out.push(entry(at, end));
    at = end;
    step += 1;
  }
  return out;
}
