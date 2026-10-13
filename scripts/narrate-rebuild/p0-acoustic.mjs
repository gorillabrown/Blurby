// P0-3 Independent acoustic check (charter choices T3, T4, T5; ruling R4).
// Reference anchors are speech onsets after pauses, found from the PCM alone (T3); each anchor is
// associated with a source word by pause order and text-only priors (T4), never by consulting the
// tested table. Then, and only then, the table's onset for that word is compared with the anchor.
// Writes docs/studies/narrate-rebuild-1/phase0/acoustic/<passage>.<voice>.json and acoustic-summary.json.
// Exit 0 only when every passage x voice x rate passes (>= 10 resolved anchors, uncertainty <= 10 ms,
// worst |error| <= 30 ms) and the 40 ms negative control is caught; 1 otherwise; 2 on a recorder fault.
// Run from pwsh in the phase worktree: node scripts/narrate-rebuild/p0-acoustic.mjs [--rates 0.80,1.00,1.40,2.00]
import fs from "node:fs";
import path from "node:path";
import { PHASE0_DIR, CORPUS_DIR, AUDIO_ROOT, SAMPLE_RATE } from "./lib/offline-kokoro.mjs";
import { readWav } from "./lib/wav.mjs";
import { pathToFileURL } from "node:url";

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const manifest = JSON.parse(fs.readFileSync(path.join(CORPUS_DIR, "manifest.json"), "utf8"));
const rates = arg("--rates", "0.80,1.00,1.40,2.00").split(",");
const voices = arg("--voices", manifest.voices.join(",")).split(",");
const passages = arg("--passages", manifest.passages.map((p) => p.id).join(",")).split(",");
const OUT = path.join(PHASE0_DIR, "acoustic");
fs.mkdirSync(OUT, { recursive: true });

// ---- T3: envelope, pauses, onsets ------------------------------------------------------------------
export const WIN_MS = 1, WIN = SAMPLE_RATE / 1000 * WIN_MS; // 24 samples
export const LOW = 0.01, HIGH = 0.03;      // onset thresholds: 1% and 3% of the passage's peak 1 ms RMS
export const MAX_SPREAD_MS = 9.5;          // |t3 - t1| above this: unresolved, not failed (spread + the 0.5 ms floor stays within R4's 10 ms)
export const UNCERTAINTY_FLOOR_MS = 0.5;   // half the analysis hop
export const minPauseMs = (rate) => rate <= 1 ? 60 : Math.max(35, 60 - 25 * (rate - 1)); // 60 ms; 35 ms at 2.00x
export const ERROR_LIMIT_MS = 30, UNCERTAINTY_LIMIT_MS = 10, MIN_RESOLVED = 10; // R4, T5

export function envelope(pcm) {
  const n = Math.floor(pcm.length / WIN); const e = new Float32Array(n);
  for (let i = 0; i < n; i++) { let s = 0; for (let k = 0; k < WIN; k++) { const v = pcm[i * WIN + k]; s += v * v; } e[i] = Math.sqrt(s / WIN); }
  return e;
}
// Pauses = runs of >= minPause ms below 1% of peak (the leading and trailing silences count whatever their length).
// Onset after a pause: t1 = first window >= 1%, t3 = first window >= 3%; uncertainty = (t3 - t1) + 0.5 ms.
// Offset before a pause: the decay's 1% crossing (the pause start) and its last window >= 3%; uncertainty likewise.
export function findPauses(env, peak, rate) {
  const lo = LOW * peak, hi = HIGH * peak, minRun = Math.round(minPauseMs(rate));
  const out = []; let start = -1;
  for (let i = 0; i <= env.length; i++) {
    const quiet = i < env.length && env[i] < lo;
    if (quiet && start < 0) start = i;
    if (!quiet && start >= 0) {
      const trailing = i === env.length;
      if (i - start >= minRun || start === 0 || trailing) {
        let t3 = i; while (t3 < env.length && env[t3] < hi) t3++;
        let d3 = start - 1; while (d3 >= 0 && env[d3] < hi) d3--; // last window >= 3% before the pause
        const offsetSpread = start - (d3 + 1);
        out.push({ pauseStartMs: start, pauseEndMs: i, lenMs: i - start, leading: start === 0, trailing,
          onsetMs: trailing ? null : i, onset3Ms: trailing ? null : t3, spreadMs: trailing ? null : t3 - i, uncertaintyMs: trailing ? null : t3 - i + UNCERTAINTY_FLOOR_MS,
          offsetMs: start === 0 ? null : start, offsetSpreadMs: start === 0 ? null : offsetSpread, offsetUncertaintyMs: start === 0 ? null : offsetSpread + UNCERTAINTY_FLOOR_MS });
      }
      start = -1;
    }
  }
  return out;
}

// ---- T4: marks and association ---------------------------------------------------------------------
const MARK = /[.,;:—?!…]/;                 // pause-making marks (section breaks are chunk starts)
const SEP = " ;:,.!?¡¿—…\"«»“”(){}[]";
export const ASSOC_MAX_COST = 0.3;         // max over the two stretches adjoining a pair of |log(stretch rate / chunk mean rate)|
export const MIN_SPAN_CHARS = 6;           // text on both sides of a pair must be at least this many voiced phoneme chars
const SKIP_MARK_COST = 0.6;                // a mark Kokoro did not realize as a pause (common at dense commas)
const SKIP_PAUSE_COST = 1.2;               // a long pause with no mark (prosodic); rarer than a skipped mark
export const minAnchorPauseMs = (rate) => 120 / rate; // shorter gaps are stop closures or breaths, never mark anchors
const DEBUG = process.argv.includes("--debug");

function marksOf(chunk) {
  const chars = [...chunk.phonemes]; const marks = [];
  for (let i = 0; i < chars.length; i++) if (MARK.test(chars[i]) && !(i > 0 && MARK.test(chars[i - 1]))) marks.push(i);
  const interior = marks.filter((m) => chunk.units.some((u) => u.charStart > m));
  const bounds = [-1, ...interior, chars.length];
  const spans = []; for (let k = 0; k + 1 < bounds.length; k++) { let n = 0; for (let i = bounds[k] + 1; i < bounds[k + 1]; i++) if (!SEP.includes(chars[i])) n++; spans.push(n); }
  return { chars, interior, spans };
}
// Monotone DP pairing interior pauses with interior marks. A stretch (between paired boundaries) costs
// |log(voiced ms per voiced char / chunk mean)|; skipping a mark or a pause costs SKIP_COST. Text-only priors.
function associate(pausesIn, marks, leadEndMs, chunkEndMs) {
  const P = pausesIn.length, M = marks.interior.length;
  const voicedMs = chunkEndMs - leadEndMs - pausesIn.reduce((a, p) => a + p.lenMs, 0);
  const chars = marks.spans.reduce((a, b) => a + b, 0);
  const rateMean = voicedMs / Math.max(1, chars);
  const charCum = [0]; for (const s of marks.spans) charCum.push(charCum.at(-1) + s);
  const startOf = (j) => j === 0 ? leadEndMs : pausesIn[j - 1].pauseEndMs;
  const endOf = (j) => j <= P ? pausesIn[j - 1].pauseStartMs : chunkEndMs;
  const stretch = (i0, i1, j0, j1) => { const ch = charCum[i1] - charCum[i0]; const ms = endOf(j1) - startOf(j0); return ch <= 0 || ms <= 0 ? 2 : Math.abs(Math.log((ms / ch) / rateMean)); };
  const INF = 1e9, dp = Array.from({ length: M + 2 }, () => new Array(P + 2).fill(INF)), back = Array.from({ length: M + 2 }, () => new Array(P + 2).fill(null));
  dp[0][0] = 0;
  for (let i = 0; i <= M; i++) for (let j = 0; j <= P; j++) {
    if (dp[i][j] >= INF) continue;
    for (let di = 1; di <= 3 && i + di <= M + 1; di++) for (let dj = 1; dj <= 3 && j + dj <= P + 1; dj++) {
      const endI = i + di === M + 1, endJ = j + dj === P + 1;
      if (endI !== endJ) continue; // the chunk end pairs only with the chunk end
      const c = stretch(i, i + di, j, j + dj);
      const v = dp[i][j] + c + SKIP_MARK_COST * (di - 1) + SKIP_PAUSE_COST * (dj - 1);
      if (v < dp[i + di][j + dj]) { dp[i + di][j + dj] = v; back[i + di][j + dj] = { i, j, c, skippedMarks: di - 1, skippedPauses: dj - 1 }; }
    }
  }
  if (dp[M + 1][P + 1] >= INF) return { pairs: [], rateMean };
  const pairs = []; let next = back[M + 1][P + 1]; // the stretch after each pair (the final stretch for the last pair)
  for (let i = M + 1, j = P + 1; i > 0 || j > 0;) {
    const b = back[i][j];
    if (i <= M && j <= P) { pairs.push({ mark: i - 1, pause: j - 1, cost: Math.max(b.c, next.c), costBefore: b.c, costAfter: next.c, skippedMarks: b.skippedMarks, skippedPauses: b.skippedPauses, skippedAfter: next.skippedMarks + next.skippedPauses }); next = b; }
    i = b.i; j = b.j;
  }
  return { pairs: pairs.reverse(), rateMean };
}

// ---- the table's claim for a word onset -------------------------------------------------------------
// Primary (policy §2): the first frame of the unit's first phoneme character. Also reported: the onset if the
// separator (space) frames immediately before the unit were assigned to it instead ("space" rule).
function tableOffsets(chunk, unit) {
  const F = chunk.law.factor;
  const chars = [...chunk.phonemes]; let ce = unit.charEnd; while (ce < chars.length && chars[ce] === " ") ce++;
  let frame = chunk.durations[0]; for (let k = 0; k < ce; k++) frame += chunk.durations[k + 1];
  return { charMs: (unit.frameEnd * F) / SAMPLE_RATE * 1000, spaceMs: (frame * F) / SAMPLE_RATE * 1000 };
}
function tableOnsets(chunk, unit) {
  const F = chunk.law.factor;
  const charRule = (unit.frameStart * F) / SAMPLE_RATE * 1000;
  const chars = [...chunk.phonemes]; let cs = unit.charStart; while (cs > 0 && chars[cs - 1] === " ") cs--;
  let frame = chunk.durations[0]; for (let k = 0; k < cs; k++) frame += chunk.durations[k + 1];
  return { charMs: charRule, spaceMs: (frame * F) / SAMPLE_RATE * 1000 };
}

// ---- run -------------------------------------------------------------------------------------------
async function main() {
const results = []; let recorded = 0, defined = 0;
const rec = (ok, name, detail) => { defined++; results.push({ ok, name, detail }); recorded++; };
const perRun = {};
let control = null;
for (const voice of voices) for (const passageId of passages) {
  const tablePath = path.join(PHASE0_DIR, "tables", `${passageId}.${voice}.json`);
  if (!fs.existsSync(tablePath)) { rec(false, `${passageId}/${voice}: table present`, tablePath); continue; }
  const table = JSON.parse(fs.readFileSync(tablePath, "utf8"));
  const out = { schema: "narrate-rebuild-1/phase0/acoustic@1", passage: passageId, voice, params: { WIN_MS, LOW, HIGH, MAX_SPREAD_MS, UNCERTAINTY_FLOOR_MS, ASSOC_MAX_COST, MIN_SPAN_CHARS, SKIP_MARK_COST, SKIP_PAUSE_COST, minAnchorPauseMs: minAnchorPauseMs(1), ERROR_LIMIT_MS, UNCERTAINTY_LIMIT_MS, MIN_RESOLVED }, rates: {} };
  for (const r of rates) {
    const entry = table.rates[r];
    if (!entry?.complete) { rec(false, `${passageId}/${voice} ${r}: rate present in table`, null); continue; }
    const rate = Number(r);
    const chunks = entry.chunks.filter((c) => !c.error);
    const wavs = chunks.map((c) => readWav(path.join(AUDIO_ROOT, c.wav)));
    for (let k = 0; k < chunks.length; k++) if (wavs[k].pcm.length !== chunks[k].pcmSamples) rec(false, `${passageId}/${voice} ${r} chunk ${chunks[k].index}: WAV length = table pcmSamples`, { wav: wavs[k].pcm.length, table: chunks[k].pcmSamples });
    const envs = wavs.map((w) => envelope(w.pcm));
    const peak = Math.max(...envs.map((e) => Math.max(...e)));
    const anchors = [], unresolved = [], offsets = []; // offsets: word ends before pauses, reported beside the anchors, never counted as anchors
    let totalAnchors = 0, largest = { words: 0, samples: 0 };
    chunks.forEach((c, ci) => {
      if (c.coverage.words > largest.words) largest = { words: c.coverage.words, samples: c.pcmSamples, tokens: c.tokens, chunk: c.index };
      const env = envs[ci];
      const found = findPauses(env, peak, rate);
      const marks = marksOf(c);
      totalAnchors += marks.interior.length + 1; // T3 anchors are onsets: one per interior mark plus the chunk start
      const lead = found.find((p) => p.leading);
      const interiorPauses = found.filter((p) => !p.leading && !p.trailing && p.lenMs >= minAnchorPauseMs(rate));
      const trail = found.find((p) => p.trailing);
      const shortGaps = found.filter((p) => !p.leading && p.lenMs < minAnchorPauseMs(rate)).length;
      const assoc = associate(interiorPauses, marks, lead?.onsetMs ?? 0, env.length);
      if (DEBUG) { console.log(`  [${passageId}/${voice}/${r}] chunk ${c.index}: ${shortGaps} short gaps ignored; pauses ${interiorPauses.map((p) => `${p.pauseStartMs}+${p.lenMs}`).join(" ")}`); console.log(`    marks ${marks.interior.map((m, k) => `${marks.chars[m]}->${c.units.find((u) => u.charStart > m)?.words[0]}(${marks.spans[k]}|${marks.spans[k + 1]})`).join(" ")}`); console.log(`    pairs ${assoc.pairs.map((p) => `m${p.mark}~p${p.pause}:${p.costBefore.toFixed(2)}/${p.costAfter.toFixed(2)}${p.skippedMarks ? " skipM" + p.skippedMarks : ""}${p.skippedPauses ? " skipP" + p.skippedPauses : ""}`).join(" ")}`); }
      const candidates = [];
      if (lead) candidates.push({ label: "chunk-start", markIndex: -1, pause: lead, unit: c.units[0], unitBefore: null, cost: 0 });
      if (trail) candidates.push({ label: "chunk-end", markIndex: -2, pause: trail, unit: null, unitBefore: c.units.at(-1), cost: 0 });
      else unresolved.push({ chunk: c.index, mark: "chunk-start", word: c.units[0]?.words.join("+"), why: "no leading silence" });
      const paired = new Set();
      for (const p of assoc.pairs) {
        const m = marks.interior[p.mark]; const unit = c.units.find((u) => u.charStart > m); if (!unit) continue;
        paired.add(p.mark);
        const spanBefore = marks.spans[p.mark], spanAfter = marks.spans[p.mark + 1];
        const reasons = [];
        if (p.cost > ASSOC_MAX_COST) reasons.push(`association cost ${p.costBefore.toFixed(2)}/${p.costAfter.toFixed(2)} > ${ASSOC_MAX_COST}`);
        if (p.skippedMarks + p.skippedPauses + p.skippedAfter > 0) reasons.push(`counts disagree next to this mark (${p.skippedMarks} marks / ${p.skippedPauses} pauses skipped before, ${p.skippedAfter} after): neighbour of a mismatch, unresolved (T4)`);
        if (spanBefore < MIN_SPAN_CHARS || spanAfter < MIN_SPAN_CHARS) reasons.push(`text span ${spanBefore}/${spanAfter} chars < ${MIN_SPAN_CHARS}`);
        if (reasons.length) { unresolved.push({ chunk: c.index, mark: marks.chars[m], word: unit.words.join("+"), why: reasons.join("; ") }); continue; }
        candidates.push({ label: marks.chars[m], markIndex: p.mark, pause: interiorPauses[p.pause], unit, unitBefore: c.units.filter((u) => u.charEnd <= m).at(-1) ?? null, cost: p.cost });
      }
      for (let i = 0; i < marks.interior.length; i++) if (!paired.has(i)) unresolved.push({ chunk: c.index, mark: marks.chars[marks.interior[i]], word: c.units.find((u) => u.charStart > marks.interior[i])?.words.join("+"), why: "no pause paired with this mark" });
      for (const cand of candidates) {
        if (cand.unit) { // onset of the word after the pause
          if (cand.pause.spreadMs > MAX_SPREAD_MS) unresolved.push({ chunk: c.index, mark: cand.label, word: cand.unit.words.join("+"), why: `onset spread ${cand.pause.spreadMs} ms > ${MAX_SPREAD_MS}` });
          else { const t = tableOnsets(c, cand.unit); anchors.push({ boundary: "onset", chunk: c.index, mark: cand.label, word: cand.unit.words.join("+"), kind: cand.unit.kind, acousticMs: cand.pause.onsetMs, uncertaintyMs: cand.pause.uncertaintyMs, pauseLenMs: cand.pause.lenMs, assocCost: +cand.cost.toFixed(3), tableMs: +t.charMs.toFixed(1), errMs: +(t.charMs - cand.pause.onsetMs).toFixed(1), tableSpaceMs: +t.spaceMs.toFixed(1), errSpaceMs: +(t.spaceMs - cand.pause.onsetMs).toFixed(1) }); }
        }
        if (cand.unitBefore && cand.pause.offsetMs !== null) { // offset of the word before the pause
          if (cand.pause.offsetSpreadMs <= MAX_SPREAD_MS) { const t = tableOffsets(c, cand.unitBefore); offsets.push({ boundary: "offset", chunk: c.index, mark: cand.label, word: cand.unitBefore.words.join("+"), kind: cand.unitBefore.kind, acousticMs: cand.pause.offsetMs, uncertaintyMs: cand.pause.offsetUncertaintyMs, pauseLenMs: cand.pause.lenMs, assocCost: +cand.cost.toFixed(3), tableMs: +t.charMs.toFixed(1), errMs: +(t.charMs - cand.pause.offsetMs).toFixed(1), tableSpaceMs: +t.spaceMs.toFixed(1), errSpaceMs: +(t.spaceMs - cand.pause.offsetMs).toFixed(1) }); }
        }
      }
      // every fused run's interior boundary is unresolved by construction (no pause to anchor)
      for (const u of c.units) if (u.kind === "fused") unresolved.push({ chunk: c.index, mark: null, word: u.words.join("+"), why: "fused-run interior (no pause)" });
    });
    const errs = anchors.map((a) => a.errMs), abs = errs.map(Math.abs).sort((a, b) => a - b);
    const absSpace = anchors.map((a) => Math.abs(a.errSpaceMs)).sort((a, b) => a - b);
    const worst = anchors.reduce((w, a) => (Math.abs(a.errMs) > Math.abs(w?.errMs ?? -1) ? a : w), null);
    const maxUnc = anchors.length ? Math.max(...anchors.map((a) => a.uncertaintyMs)) : null;
    const summary = {
      rate, chunks: chunks.length, largestChunk: largest, totalAnchors, resolved: anchors.length, resolvedShare: totalAnchors ? +(anchors.length / totalAnchors).toFixed(3) : null,
      offsets: (() => { const e = offsets.map((o) => o.errMs), a = e.map(Math.abs).sort((x, y) => x - y); return { resolved: offsets.length, signedMeanMs: e.length ? +(e.reduce((x, y) => x + y, 0) / e.length).toFixed(1) : null, p50AbsMs: a[Math.floor(a.length / 2)] ?? null, worstAbsMs: a.at(-1) ?? null, note: "word end before a pause vs the table's last-phoneme frame end; the pause's frames belong to the preceding phoneme in the table, so this is reported, not judged" }; })(),
      unresolved: unresolved.length, unresolvedInteriorFusedRuns: unresolved.filter((u) => u.why.startsWith("fused")).length,
      maxUncertaintyMs: maxUnc, worstErrMs: worst?.errMs ?? null, worstAnchor: worst, signedMeanMs: errs.length ? +(errs.reduce((a, b) => a + b, 0) / errs.length).toFixed(1) : null,
      p50AbsMs: abs[Math.floor(abs.length / 2)] ?? null, p90AbsMs: abs[Math.floor(abs.length * 0.9)] ?? null, over30: abs.filter((x) => x > ERROR_LIMIT_MS).length,
      spaceRule: { signedMeanMs: anchors.length ? +(anchors.reduce((a, b) => a + b.errSpaceMs, 0) / anchors.length).toFixed(1) : null, worstAbsMs: absSpace.at(-1) ?? null, p50AbsMs: absSpace[Math.floor(absSpace.length / 2)] ?? null, over30: absSpace.filter((x) => x > ERROR_LIMIT_MS).length },
    };
    summary.inconclusive = anchors.length < MIN_RESOLVED || (maxUnc ?? Infinity) > UNCERTAINTY_LIMIT_MS;
    summary.pass = !summary.inconclusive && (abs.at(-1) ?? Infinity) <= ERROR_LIMIT_MS;
    summary.verdict = summary.inconclusive ? "INCONCLUSIVE" : summary.pass ? "PASS" : "FAIL";
    out.rates[r] = { summary, anchors, offsets, unresolved };
    rec(summary.pass, `${passageId}/${voice} ${r}: P0-3 ${summary.verdict} (resolved ${anchors.length}/${totalAnchors}, worst ${summary.worstErrMs} ms, max unc ${maxUnc} ms)`, summary.inconclusive ? "inconclusive: reference repair required (T5/R4)" : null);
    perRun[`${passageId}/${voice}/${r}`] = summary;
    // Negative control (R4): shift the best-agreeing resolved anchor's table onset by +40 ms; it must be caught.
    if (!control && anchors.length) {
      const best = anchors.reduce((b, a) => (Math.abs(a.errMs) < Math.abs(b.errMs) ? a : b));
      const shifted = +(best.tableMs + 40 - best.acousticMs).toFixed(1);
      control = { passage: passageId, voice, rate: r, anchor: best.word, errMs: best.errMs, shiftedErrMs: shifted, caught: Math.abs(shifted) > ERROR_LIMIT_MS && Math.abs(shifted - best.errMs - 40) < 1e-6 };
    }
  }
  fs.writeFileSync(path.join(OUT, `${passageId}.${voice}.json`), JSON.stringify(out, null, 1) + "\n");
}
rec(!!control?.caught, "40 ms negative control caught", control);
if (recorded !== defined || defined === 0) { console.error(`recorder mismatch ${recorded}/${defined}`); process.exit(2); }
const pass = results.every((r) => r.ok);
const summary = { schema: "narrate-rebuild-1/phase0/acoustic-summary@1", recordedAt: new Date().toISOString(), pass, control, runs: perRun, checks: results };
fs.writeFileSync(path.join(OUT, "acoustic-summary.json"), JSON.stringify(summary, null, 1) + "\n");
for (const [k, s] of Object.entries(perRun)) console.log(`${k.padEnd(28)} ${s.verdict.padEnd(12)} resolved ${String(s.resolved).padStart(2)}/${s.totalAnchors} unc<=${s.maxUncertaintyMs} ms  worst ${s.worstErrMs} ms  mean ${s.signedMeanMs}  p50 ${s.p50AbsMs}  >30: ${s.over30}  | offsets n=${s.offsets.resolved} mean ${s.offsets.signedMeanMs}  | space rule mean ${s.spaceRule.signedMeanMs} worst ${s.spaceRule.worstAbsMs} >30: ${s.spaceRule.over30}  | fused interiors ${s.unresolvedInteriorFusedRuns}  largest ${s.largestChunk.words} w / ${s.largestChunk.samples} smp`);
console.log("control:", JSON.stringify(control));
console.log(pass ? "P0-3 PASS on every run" : "P0-3 not passed (see runs above)");
process.exit(pass ? 0 : 1);
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
