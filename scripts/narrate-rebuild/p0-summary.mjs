import "./lib/app-icu-guard.mjs"; // P6b: refuse plain Node (exit 3)
// Phase 0 P1 gate summary: P0-1 (identity), P0-2 (token identity, units law, mapping policy) and
// P0-4 (all 25 rates) on both voices. Writes docs/studies/narrate-rebuild-1/phase0/summary.json.
// Exit 0 only when every check passes; 1 on any failure; 2 when the recorder cannot account for its checks.
// Positive control (LL-151, standing rule 43): `--break` corrupts one chunk's table in memory and must exit 1.
// Run from pwsh in the phase worktree: node scripts/narrate-rebuild/p0-summary.mjs [--break] [--quiet]
import fs from "node:fs";
import path from "node:path";
import { PHASE0_DIR, CORPUS_DIR, TOKEN_CAP } from "./lib/offline-kokoro.mjs";

const BREAK = process.argv.includes("--break");
const QUIET = process.argv.includes("--quiet");
const manifest = JSON.parse(fs.readFileSync(path.join(CORPUS_DIR, "manifest.json"), "utf8"));
const identityPath = path.join(PHASE0_DIR, "identity.json");
const identity = fs.existsSync(identityPath) ? JSON.parse(fs.readFileSync(identityPath, "utf8")) : null;

const results = []; let defined = 0;
function check(gate, name, ok, detail) { defined++; results.push({ gate, name, ok: ok === true, detail: detail ?? null }); }

// P0-1
check("P0-1", "identity.json present", !!identity);
if (identity) for (const [k, v] of Object.entries(identity.checks)) check("P0-1", k, v, identity.hashes?.[k] ?? null);

// P0-2 / P0-4 over the tables
let factors = new Set(); let largest = { tokens: 0 }; const coverage = {}; let chunkChecks = 0;
for (const voice of manifest.voices) for (const pm of manifest.passages) {
  const file = path.join(PHASE0_DIR, "tables", `${pm.id}.${voice}.json`);
  const key = `${pm.id}/${voice}`;
  if (!fs.existsSync(file)) { check("P0-4", `${key}: table present`, false, file); continue; }
  const table = JSON.parse(fs.readFileSync(file, "utf8"));
  if (BREAK && results.filter((r) => r.name.startsWith("BREAK")).length === 0) {
    const first = Object.values(table.rates)[0]?.chunks?.find((c) => !c.error);
    if (first) { first.durations[Math.min(5, first.durations.length - 1)] += 1; first.law = { ...first.law, sumFrames: first.law.sumFrames + 1 }; check("control", "BREAK applied to " + key, true, "durations[5] += 1 (law must now fail)"); }
  }
  const rateKeys = manifest.rates.map((r) => r.toFixed(2));
  check("P0-4", `${key}: all ${rateKeys.length} rates present and complete`, rateKeys.every((r) => table.rates[r]?.complete), rateKeys.filter((r) => !table.rates[r]?.complete));
  coverage[key] = {};
  for (const r of rateKeys) {
    const entry = table.rates[r]; if (!entry) continue;
    let words = 0, fused = 0, runs = 0, splitExact = 0;
    for (const c of entry.chunks) {
      chunkChecks++;
      if (c.error) { check("P0-2", `${key} ${r} chunk ${c.index}: synthesized`, false, c.error); continue; }
      const sum = c.durations.reduce((a, b) => a + b, 0);
      const lawNow = Number.isInteger(c.law.factor) && sum * c.law.factor === c.pcmSamples && c.durations.every((d) => Number.isInteger(d) && d >= 0);
      const ok = c.law.ok && lawNow && c.identity.ok && c.segmentsOk && c.reconciled && c.failures.length === 0 && c.tokens <= TOKEN_CAP && c.provenance?.source === "model-output" && !!c.pcmSha256;
      check("P0-2", `${key} ${r} chunk ${c.index}: law x${c.law.factor} (${sum} frames -> ${c.pcmSamples} samples), identity, mapping reconciled, tokens ${c.tokens} <= ${TOKEN_CAP}`, ok, ok ? null : { law: c.law, lawNow, identity: c.identity, segmentsOk: c.segmentsOk, reconciled: c.reconciled, failures: c.failures, tokens: c.tokens });
      factors.add(c.law.factor);
      if (c.tokens > largest.tokens) largest = { tokens: c.tokens, words: c.coverage.words, samples: c.pcmSamples, passage: pm.id, voice, rate: r, chunk: c.index };
      words += c.coverage.words; fused += c.coverage.wordsInFused; runs += c.coverage.fusedRuns; splitExact += c.coverage.fusedRunsSplitExact;
    }
    coverage[key][r] = { words, wordsInFused: fused, shareWordsInFused: words ? +(fused / words).toFixed(4) : null, fusedRuns: runs, fusedRunsSplitExact: splitExact };
  }
}
check("P0-2", "one samples-per-frame factor across every chunk", factors.size === 1, [...factors]);
check("P0-2", "largest chunk tested is under the cap", largest.tokens > 0 && largest.tokens <= TOKEN_CAP, largest);

// Recorder integrity (LL-151): every defined check was recorded.
if (results.length !== defined || defined === 0) { console.error(`recorder mismatch: defined ${defined}, recorded ${results.length}`); process.exit(2); }
const failed = results.filter((r) => !r.ok);
const byGate = {};
for (const r of results) { byGate[r.gate] ??= { pass: 0, fail: 0 }; byGate[r.gate][r.ok ? "pass" : "fail"]++; }
const verdict = { "P0-1": byGate["P0-1"]?.fail === 0, "P0-2": byGate["P0-2"]?.fail === 0, "P0-4": byGate["P0-4"]?.fail === 0 };
const pass = failed.length === 0 && Object.values(verdict).every(Boolean);
const summary = { schema: "narrate-rebuild-1/phase0/summary@1", recordedAt: new Date().toISOString(), control: BREAK ? "break" : null, pass, verdict, byGate, checksDefined: defined, checksRecorded: results.length, chunkChecks, factors: [...factors], largestChunk: largest, coverage, failed: failed.slice(0, 50) };
if (!BREAK) fs.writeFileSync(path.join(PHASE0_DIR, "summary.json"), JSON.stringify(summary, null, 1) + "\n");
if (!QUIET) {
  console.log(`P0-1 ${verdict["P0-1"] ? "PASS" : "FAIL"} | P0-2 ${verdict["P0-2"] ? "PASS" : "FAIL"} | P0-4 ${verdict["P0-4"] ? "PASS" : "FAIL"} | checks ${results.length - failed.length}/${results.length} pass${BREAK ? " | CONTROL --break" : ""}`);
  console.log("factor(s):", [...factors].join(","), "| largest chunk:", JSON.stringify(largest));
  for (const [k, v] of Object.entries(coverage)) { const r1 = v["1.00"], r2 = v["2.00"]; console.log(`coverage ${k}: words ${r1?.words ?? "-"}, in fused runs ${r1?.wordsInFused ?? "-"} (${r1?.shareWordsInFused ?? "-"}) at 1.00x, ${r2?.wordsInFused ?? "-"} at 2.00x; split-exact runs ${r1?.fusedRunsSplitExact ?? "-"}`); }
  for (const f of failed.slice(0, 20)) console.log("FAIL", f.gate, f.name, JSON.stringify(f.detail));
}
process.exit(pass ? 0 : 1);
