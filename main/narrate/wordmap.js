"use strict";
// main/narrate/wordmap.js — P0-2: token identity, the units law and the word -> token-span map.
// Moved from the Phase 0 harness (scripts/narrate-rebuild/lib/wordmap.mjs re-exports this file) so the
// product's producer and the harness share one implementation. The spans come only from the single
// phonemization pass that produced the input_ids actually sent (captured). Isolated per-word phonemes
// are used ONLY to identify which source words share a fused group; no span, frame or sample is ever
// derived from them. Policy text: docs/studies/narrate-rebuild-1/phase0/MAPPING_POLICY.md

const PUNCT = ";:,.!?¡¿—…\"«»“”(){}[]";
const isSep = (ch) => ch === " " || PUNCT.includes(ch);

// kokoro-js 1.2.1 post-phonemization replacements (dist/kokoro.cjs, function c), reproduced so a
// segment's phonemizer output can be compared exactly with the final phoneme string.
function kokoroPost(s, lang) {
  let u = s.replace(/kəkˈoːɹoʊ/g, "kˈoʊkəɹoʊ").replace(/kəkˈɔːɹəʊ/g, "kˈəʊkəɹəʊ").replace(/ʲ/g, "j").replace(/r/g, "ɹ").replace(/x/g, "k").replace(/ɬ/g, "l")
    .replace(/(?<=[a-zɹː])(?=hˈʌndɹɪd)/g, " ").replace(/ z(?=[;:,.!?¡¿—…"«»“” ]|$)/g, "z");
  if (lang === "a" || lang === "en-us") u = u.replace(/(?<=nˈaɪn)ti(?!ː)/g, "di");
  return u;
}

// Groups = maximal runs of non-separator characters in the final phoneme string, with char ranges.
function phonemeGroups(phonemes) {
  const chars = [...phonemes];
  const groups = [];
  let start = -1;
  for (let i = 0; i <= chars.length; i++) {
    const sep = i === chars.length || isSep(chars[i]);
    if (!sep && start < 0) start = i;
    if (sep && start >= 0) { groups.push({ text: chars.slice(start, i).join(""), charStart: start, charEnd: i }); start = -1; }
  }
  return { chars, groups };
}

// Identification evidence only. Vowel quality is exactly what context reduction changes
// ("a" = eɪ alone, ə in "for a"), so the comparison uses the consonant skeleton (stable) plus a
// syllable-count term (vowel runs), never the vowels themselves.
const VOWELS = "aeiouyæɐɑɒɔəɚɛɜɪᵻʊʌʏøœɨɯɤɵ";
const isVowel = (ch) => VOWELS.includes(ch);
function compareForm(s) {
  return s.replace(/[ˈˌːʔ]/g, "").replace(/ɾ/g, "t").replace(/ʲ/g, "");
}
function consonants(s) { return [...compareForm(s)].filter((ch) => !isVowel(ch)); }
function syllables(s) { let n = 0, inV = false; for (const ch of compareForm(s)) { const v = isVowel(ch); if (v && !inV) n++; inV = v; } return n; }
// Edit distance between consonant skeletons a (isolated forms) and b (the group). `freeInsert` is a consonant the
// group may carry that the isolated forms lack, at no cost: a linking r (en-gb "for a" carries an r that "for" alone,
// non-rhotic, has not; en-us "our own" carries ɹ after the r-coloured vowel of "our" alone).
function lev(a, b, freeInsert = null) {
  const ins = (ch) => (ch === freeInsert ? 0 : 1);
  const m = a.length, n = b.length;
  let prev = new Array(n + 1), cur = new Array(n + 1);
  prev[0] = 0; for (let j = 1; j <= n; j++) prev[j] = prev[j - 1] + ins(b[j - 1]);
  for (let i = 1; i <= m; i++) { cur[0] = i; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + ins(b[j - 1]), prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); [prev, cur] = [cur, prev]; }
  return prev[n];
}
const SYLLABLE_WEIGHT = 0.34;
// cost of pairing isolated word forms with group forms: relative consonant edit distance + 0.34 per syllable of
// mismatch. Syllables are counted per form and summed, so two vowel-adjacent words ("for" + "a") keep both
// syllables instead of merging into one vowel run. A linking r is free in both languages (P6b F4).
const LINKING_R = "ɹ";
const relCost = (isoForms, groupForms, lang) => {
  const A = isoForms.flatMap(consonants), B = groupForms.flatMap(consonants);
  const syl = (forms) => forms.reduce((n, f) => n + syllables(f), 0);
  return lev(A, B, LINKING_R) / Math.max(1, Math.max(A.length, B.length)) + SYLLABLE_WEIGHT * Math.abs(syl(isoForms) - syl(groupForms));
};

const ACCEPT_UNIT_COST = 0.5; // a unit whose identification evidence costs more is unreconciled (fail closed)
const MAX_FUSE = 4; // at most 4 source words in one group
const MIN_SPLIT = 3; // one word may span max(3, its own isolated group count) groups (P6b F3)
const { isSilentToken } = require("./normalize");

// Monotone alignment of W words to G groups. Each unit is (k words <-> 1 group) or (1 word <-> k groups).
// isoGroups[i]: word i's isolated phoneme groups, the evidence (syllables counted per group, P6b F3); spelled[i]: the
// groups of an all-caps word read letter by letter, a second piece of evidence for a one-word unit, or null (P6b F5).
// phrase (second pass only): phrase[i][k] holds the groups of words i..i+k-1 read together, a second piece of evidence
// for a fused unit (NARRATE-RECONCILE-RESIDUAL-1). Each back pointer records which evidence won.
function align(isoGroups, spelled, groupForms, lang, phrase = null) {
  const W = isoGroups.length, G = groupForms.length;
  const forms = (i, k) => isoGroups.slice(i, i + k).flat();
  const maxSplit = (i) => Math.max(MIN_SPLIT, isoGroups[i].length, spelled[i]?.length ?? 0);
  const cost = (i, k, gs) => {
    const c = relCost(forms(i, k), gs, lang);
    const alt = k === 1 ? spelled[i] : phrase?.[i]?.[k];
    if (!alt) return { c, ev: "isolated" };
    const a = relCost(alt, gs, lang);
    return a < c ? { c: a, ev: k === 1 ? "spelled" : "phrase" } : { c, ev: "isolated" };
  };
  const INF = 1e9;
  const dp = Array.from({ length: W + 1 }, () => new Array(G + 1).fill(INF));
  const back = Array.from({ length: W + 1 }, () => new Array(G + 1).fill(null));
  dp[0][0] = 0;
  for (let i = 0; i <= W; i++) for (let j = 0; j <= G; j++) {
    if (dp[i][j] >= INF) continue;
    for (let k = 1; k <= MAX_FUSE && i + k <= W && j + 1 <= G; k++) { // k words -> 1 group
      const { c, ev } = cost(i, k, [groupForms[j]]);
      const v = dp[i][j] + c;
      if (v < dp[i + k][j + 1]) { dp[i + k][j + 1] = v; back[i + k][j + 1] = { i, j, k: k, g: 1, c, ev }; }
    }
    for (let g = 2; i + 1 <= W && g <= maxSplit(i) && j + g <= G; g++) { // 1 word -> g groups
      const { c, ev } = cost(i, 1, groupForms.slice(j, j + g));
      const v = dp[i][j] + c;
      if (v < dp[i + 1][j + g]) { dp[i + 1][j + g] = v; back[i + 1][j + g] = { i, j, k: 1, g, c, ev }; }
    }
  }
  if (dp[W][G] >= INF) return null;
  const units = [];
  for (let i = W, j = G; i > 0 || j > 0;) { const b = back[i][j]; units.unshift(b); i = b.i; j = b.j; }
  return { cost: dp[W][G], units };
}

/**
 * Build the word map for one synthesized chunk record (from capture.synthesize).
 * Returns { law, identity, segmentsOk, units, words, coverage, reconciled, failures[] }.
 * `isolated` is an async (word, lang) => string[] used for identification evidence only.
 */
async function buildWordMap(rec, isolated) {
  const failures = [];
  const { chars, groups } = phonemeGroups(rec.phonemes);
  const n = rec.ids.length;
  // Token identity: one id per phoneme character, wrapped as [0, ..., 0]; one duration per id.
  const identity = { ids: n, chars: chars.length, bosEos: rec.ids[0] === 0 && rec.ids[n - 1] === 0, durations: rec.durations.length, ok: false };
  identity.ok = identity.bosEos && n === chars.length + 2 && rec.durations.length === n;
  if (!identity.ok) failures.push("token identity");
  // Units law: duration frames x samples per frame = PCM length exactly.
  const sum = rec.durations.reduce((a, b) => a + b, 0);
  const allInt = rec.durations.every((d) => Number.isInteger(d) && d >= 0);
  const factor = sum > 0 ? rec.pcm.length / sum : NaN;
  const law = { sumFrames: sum, pcmSamples: rec.pcm.length, factor, allIntegerFrames: allInt, ok: allInt && Number.isInteger(factor) && factor * sum === rec.pcm.length };
  if (!law.ok) failures.push("units law");
  // Sample offsets per character from the exact table. frames[c] belongs to chars[c]; BOS/EOS frames are leading/trailing audio.
  const leadFrames = rec.durations[0], tailFrames = rec.durations[n - 1];
  const charStartFrame = new Array(chars.length + 1);
  let acc = leadFrames;
  for (let c = 0; c < chars.length; c++) { charStartFrame[c] = acc; acc += rec.durations[c + 1]; }
  charStartFrame[chars.length] = acc;
  // Segment reconciliation: the phonemizer's per-segment groups, post-processed as kokoro does, must equal the final groups in order.
  const expected = [];
  const lang = rec.segments[0]?.lang === "en" ? "b" : "a";
  // Characters the tokenizer has no id for were dropped from rec.phonemes (capture.js); drop them here too.
  const dropped = new Set(rec.droppedChars ?? []);
  const keep = (s) => (dropped.size ? [...s].filter((ch) => !dropped.has(ch)).join("") : s);
  for (const seg of rec.segments) {
    const segWords = seg.text.trim().split(/\s+/).filter((w) => w && !isSilentToken(w)); // P6b F1
    const segGroups = kokoroPost(seg.out.join(" "), lang).split(" ").map(keep).filter(Boolean);
    expected.push({ text: seg.text, words: segWords, groups: segGroups });
  }
  const expectedFlat = expected.flatMap((e) => e.groups);
  const segmentsOk = expectedFlat.length === groups.length && expectedFlat.every((g, i) => g === groups[i].text);
  if (!segmentsOk) failures.push("segment/group sequence mismatch");
  // Word -> group alignment per segment (identification), then units with exact spans.
  const units = []; const words = [];
  let gi = 0; let fusedWords = 0, fusedRuns = 0, splitExact = 0, wordsInSplitGroups = 0;
  if (segmentsOk) {
    for (const seg of expected) {
      const W = seg.words.length, G = seg.groups.length;
      const iso = [], isoGroups = [], spelled = [];
      const groupsOf = async (text) => kokoroPost((await isolated(text, rec.segments[0].lang)).join(" "), lang).split(" ").map(keep).filter(Boolean);
      for (const w of seg.words) {
        const gs = await groupsOf(w);
        isoGroups.push(gs); iso.push(gs.join(""));
        const letters = w.replace(/[^A-Za-z]/g, "");
        spelled.push(letters.length >= 2 && !/[a-z]/.test(w) ? await groupsOf([...letters].join(" ")) : null); // P6b F5
      }
      const groupTexts = seg.groups;
      let plan;
      if (W === G) plan = { cost: 0, units: seg.words.map((_, i) => ({ i, j: i, k: 1, g: 1, c: relCost([iso[i]], [groupTexts[i]], lang), diagonal: true })) };
      else plan = align(isoGroups, spelled, groupTexts, lang);
      // Second pass, this segment only, when the first plan has a non-diagonal unit over the limit: each run of 2..MAX_FUSE
      // words read together is a second piece of evidence for a fused candidate (NARRATE-RECONCILE-RESIDUAL-1). A segment
      // that passes the first time is never re-planned. The phrase form is identification evidence only, never a span.
      let phrase = null;
      if (plan && plan.units.some((u) => !u.diagonal && !(u.c <= ACCEPT_UNIT_COST))) {
        phrase = [];
        for (let i = 0; i < W; i++) {
          phrase.push([]);
          for (let k = 2; k <= MAX_FUSE && i + k <= W; k++) phrase[i][k] = await groupsOf(seg.words.slice(i, i + k).join(" "));
        }
        const again = align(isoGroups, spelled, groupTexts, lang, phrase);
        if (again) plan = again;
      }
      if (!plan) { failures.push(`segment unalignable: ${seg.text}`); break; }
      for (const u of plan.units) {
        const gs = groups.slice(gi + u.j, gi + u.j + u.g);
        const charStart = gs[0].charStart, charEnd = gs.at(-1).charEnd;
        const unit = {
          words: seg.words.slice(u.i, u.i + u.k), wordIndex: words.length,
          kind: u.k > 1 ? "fused" : u.g > 1 ? "split-word" : "word",
          group: gs.map((g) => g.text).join(" "), charStart, charEnd,
          frameStart: charStartFrame[charStart], frameEnd: charStartFrame[charEnd],
          sampleStart: charStartFrame[charStart] * factor, sampleEnd: charStartFrame[charEnd] * factor,
          evidenceCost: +u.c.toFixed(3), isolated: iso.slice(u.i, u.i + u.k), evidence: u.ev ?? "isolated",
        };
        if (u.ev === "phrase") unit.phrase = phrase[u.i][u.k].join("");
        if (u.k > 1) {
          fusedRuns++; fusedWords += u.k;
          // Split option coverage: exact only when the group is the words' own isolated sounds back to back.
          const concat = unit.isolated.join("");
          unit.splitExact = concat === unit.group;
          if (unit.splitExact) splitExact++;
          unit.wordBoundaryMarkInside = false; // the phonemizer emits none (probe, S1)
        }
        if (u.g > 1) wordsInSplitGroups += 1;
        // Every non-diagonal one-word unit is cost-checked, a split word too (P6b F3: a split was never checked).
        if (!(u.c <= ACCEPT_UNIT_COST) && u.k === 1 && !u.diagonal) failures.push(`unit evidence cost ${u.c.toFixed(2)} > ${ACCEPT_UNIT_COST}: ${unit.words.join(" ")} ~ ${unit.group}`);
        if (u.k > 1 && !(u.c <= ACCEPT_UNIT_COST)) failures.push(`fused unit evidence cost ${u.c.toFixed(2)} > ${ACCEPT_UNIT_COST}: ${unit.words.join(" ")} ~ ${unit.group}`);
        units.push(unit);
        for (let w = 0; w < u.k; w++) words.push({ word: seg.words[u.i + w], unit: units.length - 1 });
      }
      gi += G;
    }
  }
  const totalWords = words.length;
  const coverage = { words: totalWords, units: units.length, fusedRuns, wordsInFused: fusedWords, shareWordsInFused: totalWords ? +(fusedWords / totalWords).toFixed(4) : null, fusedRunsSplitExact: splitExact, wordsInSplitGroups };
  const reconciled = failures.length === 0;
  return { law, identity, segmentsOk, leadFrames, tailFrames, units, words, coverage, reconciled, failures };
}

module.exports = { PUNCT, SYLLABLE_WEIGHT, ACCEPT_UNIT_COST, kokoroPost, phonemeGroups, compareForm, consonants, syllables, buildWordMap };
