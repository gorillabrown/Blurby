// Precision trial comparison (VERDICT.md addendum; G1 route b): q4 (phase0/tables, acoustic) against fp32 and
// fp16 (tables-<dtype>, acoustic-<dtype>) on passage A at 1.00x, both voices. Prints the P0-2 facts per table,
// whether the duration tables differ, the P0-3 summaries with the chunk-start / interior split, and the
// anchor-by-anchor paired errors. A report only: exit 0. Run from pwsh in the phase worktree after
//   node scripts/narrate-rebuild/p0-generate.mjs --dtype fp32 --passages passage-a --rates 1.00   (and fp16)
//   node scripts/narrate-rebuild/p0-acoustic.mjs --dtype fp32 --passages passage-a --rates 1.00   (and fp16)
import fs from "node:fs";
import path from "node:path";
import { PHASE0_DIR } from "./lib/offline-kokoro.mjs";

const DT = ["q4", "fp32", "fp16"];
const dir = (kind, d) => path.join(PHASE0_DIR, d === "q4" ? kind : `${kind}-${d}`);
const voices = ["af_bella", "bf_emma"];
const R = "1.00";
const mean = (v) => (v.length ? +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : null);
const fmt = (v) => (v === null || v === undefined ? "-" : v);

for (const voice of voices) {
  console.log(`\n==== passage-a / ${voice} / ${R}`);
  const tables = {}, ac = {};
  for (const d of DT) {
    const tf = path.join(dir("tables", d), `passage-a.${voice}.json`), af = path.join(dir("acoustic", d), `passage-a.${voice}.json`);
    if (fs.existsSync(tf)) tables[d] = JSON.parse(fs.readFileSync(tf, "utf8"));
    if (fs.existsSync(af)) ac[d] = JSON.parse(fs.readFileSync(af, "utf8"));
  }
  for (const d of Object.keys(tables)) {
    const e = tables[d].rates[R]; if (!e) { console.log(`${d}: no rate ${R}`); continue; }
    const cs = e.chunks;
    const law = cs.every((c) => !c.error && c.law.ok), rec = cs.every((c) => !c.error && c.reconciled), id = cs.every((c) => !c.error && c.identity.ok);
    const factors = [...new Set(cs.filter((c) => !c.error).map((c) => c.law.factor))];
    const gen = cs.reduce((a, c) => a + (c.genMs ?? 0), 0);
    console.log(`P0-2 ${d.padEnd(4)} dtype=${tables[d].dtype} durations ${cs[0]?.durationsType} | chunks ${cs.length} complete=${e.complete} law=${law} factor=${factors} reconciled=${rec} identity=${id} | tokens ${cs.map((c) => c.tokens)} | BOS frames ${cs.map((c) => c.leadFrames)} | samples ${cs.map((c) => c.pcmSamples)} | gen ${gen} ms`);
  }
  if (tables.q4) for (const d of ["fp32", "fp16"]) {
    if (!tables[d]) continue;
    const a = tables.q4.rates[R].chunks, b = tables[d].rates[R].chunks;
    const rows = [];
    for (let i = 0; i < a.length; i++) {
      const x = a[i], y = b[i]; if (!x || !y || x.error || y.error) { rows.push(`chunk ${i}: missing`); continue; }
      const sameIds = x.ids.length === y.ids.length && x.ids.every((v, k) => v === y.ids[k]);
      let diff = 0, maxAbs = 0, sumAbs = 0;
      for (let k = 0; k < Math.min(x.durations.length, y.durations.length); k++) { const dd = y.durations[k] - x.durations[k]; if (dd) diff++; maxAbs = Math.max(maxAbs, Math.abs(dd)); sumAbs += Math.abs(dd); }
      const onsetDiffs = y.units.map((u, k) => (u.sampleStart - (x.units[k]?.sampleStart ?? NaN)) / 24).filter((v) => !Number.isNaN(v));
      rows.push(`chunk ${i}: ids same=${sameIds} tokens ${x.ids.length}; durations differ at ${diff}/${x.durations.length} positions, max |d| ${maxAbs} frames, sum |d| ${sumAbs}; total frames ${x.law.sumFrames} -> ${y.law.sumFrames}; unit-onset shifts ms: mean ${mean(onsetDiffs)} max ${Math.max(...onsetDiffs.map(Math.abs)).toFixed(1)}; pcm sha equal=${x.pcmSha256 === y.pcmSha256}`);
    }
    console.log(`TABLE DIFF q4 -> ${d}:\n  ` + rows.join("\n  "));
  }
  for (const d of Object.keys(ac)) {
    const e = ac[d].rates[R]; if (!e) { console.log(`${d}: no acoustic ${R}`); continue; }
    const s = e.summary;
    const cs = e.anchors.filter((a) => a.mark === "chunk-start"), it = e.anchors.filter((a) => a.mark !== "chunk-start");
    const st = (xs) => (xs.length ? `n=${xs.length} mean ${mean(xs.map((a) => a.errMs))} min ${Math.min(...xs.map((a) => a.errMs))} max ${Math.max(...xs.map((a) => a.errMs))}` : "n=0");
    console.log(`P0-3 ${d.padEnd(4)} ${s.verdict.padEnd(12)} resolved ${s.resolved}/${s.totalAnchors} worst ${fmt(s.worstErrMs)} mean ${fmt(s.signedMeanMs)} p50 ${fmt(s.p50AbsMs)} p90 ${fmt(s.p90AbsMs)} >30: ${s.over30} maxUnc ${fmt(s.maxUncertaintyMs)} | chunk-start ${st(cs)} | interior ${st(it)} | lead pause ms ${cs.map((a) => a.pauseLenMs)} | control ${JSON.stringify(ac[d].control ?? null)}`);
  }
  if (ac.q4) {
    // key = chunk | mark | word | nth occurrence of that triple within the run (passage A repeats ", and" inside a chunk)
    const keyed = (anchors) => { const seen = new Map(); return anchors.map((a) => { const k0 = `${a.chunk}|${a.mark}|${a.word}`; const n = (seen.get(k0) ?? 0) + 1; seen.set(k0, n); return [`${k0}|${n}`, a]; }); };
    const keyOf = new Map(); for (const d of DT) if (ac[d]) for (const [k, a] of keyed(ac[d].rates[R].anchors)) keyOf.set(a, k);
    const key = (a) => keyOf.get(a);
    const base = new Map(keyed(ac.q4.rates[R].anchors));
    for (const d of ["fp32", "fp16"]) {
      if (!ac[d]) continue;
      const lines = [];
      for (const a of ac[d].rates[R].anchors) {
        const b = base.get(key(a));
        lines.push(`${String(a.chunk).padStart(2)} ${String(a.mark).padEnd(11)} ${a.word.padEnd(16)} q4 ${b ? String(b.errMs).padStart(6) : "   n/a"}  ${d} ${String(a.errMs).padStart(6)}  acoustic ${b ? (a.acousticMs - b.acousticMs).toFixed(1).padStart(7) : "    n/a"}  table ${b ? (a.tableMs - b.tableMs).toFixed(1).padStart(7) : "    n/a"}`);
      }
      const paired = ac[d].rates[R].anchors.filter((a) => base.has(key(a)));
      const dErr = paired.map((a) => a.errMs - base.get(key(a)).errMs);
      console.log(`PAIRED q4 vs ${d}: ${paired.length} common anchors; mean change in error ${mean(dErr)} ms (range ${dErr.length ? Math.min(...dErr) : "-"}..${dErr.length ? Math.max(...dErr) : "-"})\n   ch mark        word             err(q4)  err(${d})  d(acoustic) d(table)\n  ` + lines.join("\n  "));
    }
  }
}
