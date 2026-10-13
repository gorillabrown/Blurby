"use strict";
// main/narrate/normalize.js — kokoro-js 1.2.1's text normalization (dist/kokoro.cjs, the inner function of `c`)
// reproduced verbatim, so the producer can map the normalized words kokoro actually spoke back to the book's
// source words (NARRATE-REBUILD-1 P5). The mapping is word identity only — no span, frame or sample ever comes
// from it — and it is verified on every chunk against the capture: the reproduced normalization, split at
// kokoro's punctuation runs, must equal the segments the phonemizer received, and the per-word counts must add up
// to the spoken word count. Any disagreement fails the chunk closed (F4 producer-error), nothing is guessed.

// kokoro.cjs `n`: years, times and decimals.
function yearOrTime(e) {
  if (e.includes(".")) return e;
  if (e.includes(":")) { const [a, t] = e.split(":").map(Number); return t === 0 ? `${a} o'clock` : t < 10 ? `${a} oh ${t}` : `${a} ${t}`; }
  const a = parseInt(e.slice(0, 4), 10);
  if (a < 1100 || a % 1e3 < 10) return e;
  const t = e.slice(0, 2), r = parseInt(e.slice(2, 4), 10), n = e.endsWith("s") ? "s" : "";
  if (a % 1e3 >= 100 && a % 1e3 <= 999) { if (r === 0) return `${t} hundred${n}`; if (r < 10) return `${t} oh ${r}${n}`; }
  return `${t} ${r}${n}`;
}
// kokoro.cjs `l`: currency.
function currency(e) {
  const a = e[0] === "$" ? "dollar" : "pound";
  if (isNaN(Number(e.slice(1)))) return `${e.slice(1)} ${a}s`;
  if (!e.includes(".")) { const t = e.slice(1) === "1" ? "" : "s"; return `${e.slice(1)} ${a}${t}`; }
  const [t, r] = e.slice(1).split("."), n = parseInt(r.padEnd(2, "0"), 10);
  return `${t} ${a}${t === "1" ? "" : "s"} and ${n} ${e[0] === "$" ? (n === 1 ? "cent" : "cents") : n === 1 ? "penny" : "pence"}`;
}
// kokoro.cjs `s`: decimals.
function decimal(e) { const [a, t] = e.split("."); return `${a} point ${t.split("").join(" ")}`; }

const PUNCT = ';:,.!?¡¿—…"«»“”(){}[]';
const PUNCT_RUN = new RegExp(`(\\s*[${PUNCT.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]+\\s*)+`, "g");

/** kokoro-js 1.2.1 `c(text, lang, normalize = true)`'s normalization, verbatim. */
function normalize(e) {
  return e.replace(/[‘’]/g, "'").replace(/«/g, "“").replace(/»/g, "”").replace(/[“”]/g, '"').replace(/\(/g, "«").replace(/\)/g, "»")
    .replace(/、/g, ", ").replace(/。/g, ". ").replace(/！/g, "! ").replace(/，/g, ", ").replace(/：/g, ": ").replace(/；/g, "; ").replace(/？/g, "? ")
    .replace(/[^\S \n]/g, " ").replace(/  +/, " ").replace(/(?<=\n) +(?=\n)/g, "")
    .replace(/\bD[Rr]\.(?= [A-Z])/g, "Doctor").replace(/\b(?:Mr\.|MR\.(?= [A-Z]))/g, "Mister").replace(/\b(?:Ms\.|MS\.(?= [A-Z]))/g, "Miss").replace(/\b(?:Mrs\.|MRS\.(?= [A-Z]))/g, "Mrs")
    .replace(/\betc\.(?! [A-Z])/gi, "etc").replace(/\b(y)eah?\b/gi, "$1e'a")
    .replace(/\d*\.\d+|\b\d{4}s?\b|(?<!:)\b(?:[1-9]|1[0-2]):[0-5]\d\b(?!:)/g, yearOrTime)
    .replace(/(?<=\d),(?=\d)/g, "")
    .replace(/[$£]\d+(?:\.\d+)?(?: hundred| thousand| (?:[bm]|tr)illion)*\b|[$£]\d+\.\d\d?\b/gi, currency)
    .replace(/\d*\.\d+/g, decimal).replace(/(?<=\d)-(?=\d)/g, " to ").replace(/(?<=\d)S/g, " S")
    .replace(/(?<=[BCDFGHJ-NP-TV-Z])'?s\b/g, "'S").replace(/(?<=X')S\b/g, "s")
    .replace(/(?:[A-Za-z]\.){2,} [a-z]/g, (m) => m.replace(/\./g, "-")).replace(/(?<=[A-Z])\.(?=[A-Z])/gi, "-")
    .trim();
}

/** kokoro's segmentation of a normalized text: the pieces between punctuation runs, in order (what phonemize gets). */
function segments(normalized) {
  const out = [];
  let r = 0;
  for (const m of normalized.matchAll(PUNCT_RUN)) {
    if (r < m.index) out.push(normalized.slice(r, m.index));
    r = m.index + m[0].length;
  }
  if (r < normalized.length) out.push(normalized.slice(r));
  return out;
}

const wordsOf = (pieces) => pieces.flatMap((s) => s.trim().split(/\s+/).filter(Boolean));
const spokenWordsOf = (text) => wordsOf(segments(normalize(text)));

/**
 * How many spoken (normalized, punctuation-free) words each source word becomes. Every rule of the normalizer
 * keeps the space between two words, so a word without a digit or a currency sign becomes exactly one spoken
 * word (or none, when it is punctuation only); a word with digits or a currency sign is normalized on its own.
 */
function spokenCounts(sourceWords) {
  return sourceWords.map((w) => {
    if (/[\d$£]/.test(w)) return spokenWordsOf(w).length;
    return spokenWordsOf(w).length === 0 ? 0 : 1;
  });
}

/**
 * Map the word map's units (over the spoken words) onto the chunk's source words (the chunk text split on single
 * spaces). Returns units whose `words` are source words covering the chunk exactly, in order, with the spoken words
 * beside them; consecutive spoken-word units are merged only where a source word was spoken as several words
 * (a year, an amount), so every span is still a table span. Throws on any disagreement (the caller fails closed).
 * @param {string} text the chunk text, source words joined by single spaces
 * @param {{text: string}[]} capturedSegments the phonemizer's segments from the capture
 * @param {{words: string[], wordIndex: number, kind: string, frameStart: number, frameEnd: number, sampleStart: number, sampleEnd: number}[]} units
 */
function mapUnitsToSourceWords(text, capturedSegments, units) {
  const src = text.split(" ");
  const spoken = spokenWordsOf(text);
  const captured = wordsOf(capturedSegments.map((s) => s.text));
  if (spoken.length !== captured.length || spoken.some((w, i) => w !== captured[i])) {
    throw new Error(`normalizer mismatch: reproduced ${spoken.length} spoken words, kokoro phonemized ${captured.length}`);
  }
  const counts = spokenCounts(src);
  const total = counts.reduce((a, b) => a + b, 0);
  if (total !== spoken.length) throw new Error(`normalization changed the word count: ${src.length} source words, ${spoken.length} spoken, ${total} expected`);
  const unitSpoken = units.flatMap((u) => u.words);
  if (unitSpoken.length !== spoken.length || unitSpoken.some((w, i) => w !== spoken[i])) throw new Error("word map units do not cover the spoken words");

  const srcStart = [];
  let j = 0;
  for (const c of counts) { srcStart.push(j); j += c; }
  srcStart.push(j);
  const boundary = new Set(srcStart);

  // Group consecutive units until a group ends on a source-word boundary.
  const groups = [];
  let cur = null;
  for (const u of units) {
    const start = u.wordIndex, end = u.wordIndex + u.words.length;
    if (!cur) {
      if (!boundary.has(start)) throw new Error(`unit at spoken word ${start} does not start a source word`);
      cur = { normStart: start, normEnd: end, kinds: [u.kind], spoken: [...u.words], frameStart: u.frameStart, frameEnd: u.frameEnd, sampleStart: u.sampleStart, sampleEnd: u.sampleEnd, words: [] };
    } else {
      cur.normEnd = end; cur.kinds.push(u.kind); cur.spoken.push(...u.words); cur.frameEnd = u.frameEnd; cur.sampleEnd = u.sampleEnd;
    }
    if (boundary.has(end)) { groups.push(cur); cur = null; }
  }
  if (cur) throw new Error("the last unit does not end on a source-word boundary");

  // Every source word belongs to exactly one group: spoken words by their range; punctuation-only words to the
  // group that starts where they stand (or the last group at the end of the chunk).
  for (let i = 0; i < src.length; i++) {
    const s = srcStart[i], e = srcStart[i + 1];
    const g = counts[i] === 0
      ? (groups.find((x) => x.normStart === s) ?? groups.at(-1))
      : groups.find((x) => x.normStart <= s && e <= x.normEnd);
    if (!g) throw new Error(`no unit covers source word ${i} ("${src[i]}")`);
    g.words.push(src[i]);
  }
  return groups.map((g) => ({
    words: g.words,
    spoken: g.spoken,
    kind: g.kinds.length === 1 ? g.kinds[0] : "merged",
    frameStart: g.frameStart, frameEnd: g.frameEnd, sampleStart: g.sampleStart, sampleEnd: g.sampleEnd,
  }));
}

module.exports = { normalize, segments, spokenWordsOf, spokenCounts, mapUnitsToSourceWords, PUNCT };
