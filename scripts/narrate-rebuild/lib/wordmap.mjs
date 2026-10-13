// P0-2: token identity, the units law and the word -> token-span map.
// The spans come only from the single phonemization pass that produced the input_ids
// actually sent (captured). Isolated per-word phonemes are used ONLY to identify which
// source words share a fused group; no span, frame or sample is ever derived from them.
// Policy text: docs/studies/narrate-rebuild-1/phase0/MAPPING_POLICY.md

export const PUNCT = ";:,.!?¡¿—…\"«»“”(){}[]";
const isSep = (ch) => ch === " " || PUNCT.includes(ch);

// kokoro-js 1.2.1 post-phonemization replacements (dist/kokoro.cjs, function c), reproduced so a
// segment's phonemizer output can be compared exactly with the final phoneme string.
export function kokoroPost(s, lang) {
  let u = s.replace(/kəkˈoːɹoʊ/g, "kˈoʊkəɹoʊ").replace(/kəkˈɔːɹəʊ/g, "kˈəʊkəɹəʊ").replace(/ʲ/g, "j").replace(/r/g, "ɹ").replace(/x/g, "k").replace(/ɬ/g, "l")
    .replace(/(?<=[a-zɹː])(?=hˈʌndɹɪd)/g, " ").replace(/ z(?=[;:,.!?¡¿—…"«»“” ]|$)/g, "z");
  if (lang === "a" || lang === "en-us") u = u.replace(/(?<=nˈaɪn)ti(?!ː)/g, "di");
  return u;
}

// Groups = maximal runs of non-separator characters in the final phoneme string, with char ranges.
export function phonemeGroups(phonemes) {
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
export function compareForm(s) {
  return s.replace(/[ˈˌːʔ]/g, "").replace(/ɾ/g, "t").replace(/ʲ/g, "");
}
export function consonants(s) { return [...compareForm(s)].filter((ch) => !isVowel(ch)); }
export function syllables(s) { let n = 0, inV = false; for (const ch of compareForm(s)) { const v = isVowel(ch); if (v && !inV) n++; inV = v; } return n; }
// Edit distance between consonant skeletons a (isolated forms) and b (the group). `freeInsert` is a consonant the
// group may carry that the isolated forms lack, at no cost: en-gb linking r ("for a" is phonemized with an r
// that "for" alone, non-rhotic, has not).
function lev(a, b, freeInsert = null) {
  const ins = (ch) => (ch === freeInsert ? 0 : 1);
  const m = a.length, n = b.length;
  let prev = new Array(n + 1), cur = new Array(n + 1);
  prev[0] = 0; for (let j = 1; j <= n; j++) prev[j] = prev[j - 1] + ins(b[j - 1]);
  for (let i = 1; i <= m; i++) { cur[0] = i; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + ins(b[j - 1]), prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); [prev, cur] = [cur, prev]; }
  return prev[n];
}
export const SYLLABLE_WEIGHT = 0.34;
// cost of pairing isolated word forms with group forms: relative consonant edit distance + 0.34 per syllable of
// mismatch. Syllables are counted per form and summed, so two vowel-adjacent words ("for" + "a") keep both
// syllables instead of merging into one vowel run. lang "b" (en-gb) allows a linking r at no cost.
const LINKING_R = "ɹ";
const relCost = (isoForms, groupForms, lang) => {
  const A = isoForms.flatMap(consonants), B = groupForms.flatMap(consonants);
  const syl = (forms) => forms.reduce((n, f) => n + syllables(f), 0);
  return lev(A, B, lang === "b" ? LINKING_R : null) / Math.max(1, Math.max(A.length, B.length)) + SYLLABLE_WEIGHT * Math.abs(syl(isoForms) - syl(groupForms));
};

export const ACCEPT_UNIT_COST = 0.5; // a unit whose identification evidence costs more is unreconciled (fail closed)
const MAX_FUSE = 4; // at most 4 source words in one group, at most 3 groups for one word

// Monotone alignment of W words to G groups. Each unit is (k words <-> 1 group) or (1 word <-> k groups).
function align(wordForms, groupForms, lang) {
  const W = wordForms.length, G = groupForms.length;
  const INF = 1e9;
  const dp = Array.from({ length: W + 1 }, () => new Array(G + 1).fill(INF));
  const back = Array.from({ length: W + 1 }, () => new Array(G + 1).fill(null));
  dp[0][0] = 0;
  for (let i = 0; i <= W; i++) for (let j = 0; j <= G; j++) {
    if (dp[i][j] >= INF) continue;
    for (let k = 1; k <= MAX_FUSE && i + k <= W && j + 1 <= G; k++) { // k words -> 1 group
      const c = relCost(wordForms.slice(i, i + k), [groupForms[j]], lang);
      const v = dp[i][j] + c;
      if (v < dp[i + k][j + 1]) { dp[i + k][j + 1] = v; back[i + k][j + 1] = { i, j, k: k, g: 1, c }; }
    }
    for (let g = 2; g <= 3 && i + 1 <= W && j + g <= G; g++) { // 1 word -> g groups
      const c = relCost([wordForms[i]], groupForms.slice(j, j + g), lang);
      const v = dp[i][j] + c;
      if (v < dp[i + 1][j + g]) { dp[i + 1][j + g] = v; back[i + 1][j + g] = { i, j, k: 1, g, c }; }
    }
  }
  if (dp[W][G] >= INF) return null;
  const units = [];
  for (let i = W, j = G; i > 0 || j > 0;) { const b = back[i][j]; units.unshift(b); i = b.i; j = b.j; }
  return { cost: dp[W][G], units };
}

/**
 * Build the word map for one synthesized chunk record (from offline-kokoro.synthesize).
 * Returns { law, identity, segmentsOk, units, words, coverage, reconciled, failures[] }.
 * `isolated` is an async (word, lang) => string[] used for identification evidence only.
 */
export async function buildWordMap(rec, isolated) {
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
  for (const seg of rec.segments) {
    const segWords = seg.text.trim().split(/\s+/).filter(Boolean);
    const segGroups = kokoroPost(seg.out.join(" "), lang).split(" ").filter(Boolean);
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
      const iso = [];
      for (const w of seg.words) iso.push(kokoroPost((await isolated(w, rec.segments[0].lang)).join(" "), lang).replace(/ /g, ""));
      const groupTexts = seg.groups;
      let plan;
      if (W === G) plan = { cost: 0, units: seg.words.map((_, i) => ({ i, j: i, k: 1, g: 1, c: relCost([iso[i]], [groupTexts[i]], lang), diagonal: true })) };
      else plan = align(iso, groupTexts, lang);
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
          evidenceCost: +u.c.toFixed(3), isolated: iso.slice(u.i, u.i + u.k),
        };
        if (u.k > 1) {
          fusedRuns++; fusedWords += u.k;
          // Split option coverage: exact only when the group is the words' own isolated sounds back to back.
          const concat = unit.isolated.join("");
          unit.splitExact = concat === unit.group;
          if (unit.splitExact) splitExact++;
          unit.wordBoundaryMarkInside = false; // the phonemizer emits none (probe, S1)
        }
        if (u.g > 1) wordsInSplitGroups += 1;
        if (!(u.c <= ACCEPT_UNIT_COST) && u.k === 1 && u.g === 1 && !u.diagonal) failures.push(`unit evidence cost ${u.c.toFixed(2)} > ${ACCEPT_UNIT_COST}: ${unit.words.join(" ")} ~ ${unit.group}`);
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
