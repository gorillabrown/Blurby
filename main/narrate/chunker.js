"use strict";
// main/narrate/chunker.js — T2 chunk bounds over a passage text (charter choice T2).
// Moved from the Phase 0 harness (scripts/narrate-rebuild/lib/chunker.mjs re-exports this file).
// Sentences come from kokoro-js's own TextSplitterStream (the library's sentence splitter).
// Chunks are packed by an estimated token count; the EXACT cap is enforced on input_ids
// before synthesis (capture throws), so an over-long chunk fails closed, never truncates.
const FIRST_CHUNK_MAX_WORDS = 15;
const PACK_TARGET_TOKENS = 400;
const PAUSE_MARK = /[,;:—]/;

const words = (s) => s.trim().split(/\s+/).filter(Boolean);
// Phoneme characters per text character, measured on the smoke run (108 phoneme chars for 104 text chars);
// padded to stay on the safe side of the exact cap. Used only to pack sentences, never for timing.
const estimateTokens = (text) => Math.ceil(text.length * 1.15) + 2;

function splitSentences(TextSplitterStream, text) {
  const s = new TextSplitterStream();
  s.push(text);
  s.close();
  return s.sentences.slice();
}

// First chunk: one short sentence of at most 15 words; a longer first sentence is cut at the
// last pause mark within the first 15 words, else at word 15 (recorded as `firstChunkCut`).
function firstChunk(sentence) {
  const w = words(sentence);
  if (w.length <= FIRST_CHUNK_MAX_WORDS) return { text: sentence, rest: null, cut: "sentence" };
  let cutAt = -1;
  for (let i = FIRST_CHUNK_MAX_WORDS - 1; i >= 0; i--) if (PAUSE_MARK.test(w[i].slice(-1))) { cutAt = i; break; }
  if (cutAt < 0) cutAt = FIRST_CHUNK_MAX_WORDS - 1;
  return { text: w.slice(0, cutAt + 1).join(" "), rest: w.slice(cutAt + 1).join(" "), cut: cutAt === FIRST_CHUNK_MAX_WORDS - 1 && !PAUSE_MARK.test(w[cutAt].slice(-1)) ? "word-15" : "pause-mark" };
}

// A blank line is a section break and a hard chunk boundary; single newlines are spaces.
function chunkPassage(TextSplitterStream, passageText) {
  const sections = passageText.replace(/\r\n/g, "\n").split(/\n\s*\n/).map((s) => s.replace(/\n+/g, " ").trim()).filter(Boolean);
  const chunks = [];
  let first = true;
  sections.forEach((section, sectionIndex) => {
    let sentences = splitSentences(TextSplitterStream, section);
    if (first && sentences.length) {
      const fc = firstChunk(sentences[0]);
      chunks.push({ index: chunks.length, sectionIndex, text: fc.text, words: words(fc.text).length, firstChunkCut: fc.cut, sectionBreakBefore: false, estTokens: estimateTokens(fc.text) });
      sentences = fc.rest ? [fc.rest, ...sentences.slice(1)] : sentences.slice(1);
      first = false;
    }
    let cur = [];
    const flush = (sectionBreakBefore) => {
      if (!cur.length) return;
      const text = cur.join(" ");
      chunks.push({ index: chunks.length, sectionIndex, text, words: words(text).length, sectionBreakBefore, estTokens: estimateTokens(text) });
      cur = [];
    };
    let breakPending = sectionIndex > 0 && !(chunks.length && chunks.at(-1).sectionIndex === sectionIndex);
    for (const s of sentences) {
      if (cur.length && estimateTokens([...cur, s].join(" ")) > PACK_TARGET_TOKENS) { flush(breakPending); breakPending = false; }
      cur.push(s);
    }
    flush(breakPending);
  });
  return chunks;
}

module.exports = { FIRST_CHUNK_MAX_WORDS, PACK_TARGET_TOKENS, PAUSE_MARK, estimateTokens, splitSentences, chunkPassage };
