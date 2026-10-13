// P3 producer identity check (NARRATE-REBUILD-1): the product's producer (main/narrate/producer.js, worker, the
// exposed model, the capture seams) must reproduce the Phase 0 harness for passage A chunk 0 at 1.00x on af_bella
// (docs/studies/narrate-rebuild-1/phase0/tables/passage-a.af_bella.json and the recorded WAV in the artifacts folder).
// Two runs:
//   A. onnxruntime's default thread count, as Phase 0 generated: the table AND the PCM sha256 must be identical
//      (code identity: the same model, seams and mapping);
//   B. Decision #7's 4 intra-op threads, as the product runs: the table must be identical; the waveform may differ
//      by rounding amplified through the decoder's cumulative harmonic phase, so it is compared at the level the
//      acoustic reference reads it — the P0-3 detector's pauses and onsets (T3) and the first voiced sample (T6)
//      must be the same to the millisecond; the 1 ms envelope's largest deviation is reported.
// Exit 0 only when every required check holds in both runs; 1 otherwise; 2 when the models root is unset.
// Runs offline against the artifacts folder (never the profile):
//   $env:NARRATE_MODELS_ROOT="C:\Projects\Blurby-artifacts\narrate-rebuild-1\models"; node scripts/narrate-rebuild/p3-producer-check.mjs
// With --break it corrupts run A's comparison on purpose and must exit 1 (LL-151).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { readWav } from "./lib/wav.mjs";
import { envelope as t3Envelope, findPauses } from "./p0-acoustic.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
if (!process.env.NARRATE_MODELS_ROOT) { console.error("set NARRATE_MODELS_ROOT to the artifacts models folder; this check never touches the profile"); process.exit(2); }
const producer = require(path.join(REPO_ROOT, "main/narrate/producer.js"));
const BREAK = process.argv.includes("--break");
const ARTIFACTS = process.env.NARRATE_REBUILD_ARTIFACTS || "C:/Projects/Blurby-artifacts/narrate-rebuild-1";

const table = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "docs/studies/narrate-rebuild-1/phase0/tables/passage-a.af_bella.json"), "utf8"));
const ref = table.rates["1.00"].chunks[0];
const refUnits = ref.units.map((u) => ({ words: u.words, kind: u.kind, frameStart: u.frameStart, frameEnd: u.frameEnd, sampleStart: u.sampleStart, sampleEnd: u.sampleEnd }));
const wav = readWav(path.join(ARTIFACTS, "audio", ref.wav));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sha256 = (pcm) => crypto.createHash("sha256").update(Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength)).digest("hex");

// T3/T6 as the acoustic reference reads a waveform: 1 ms RMS windows; first window at 1 % of the peak.
function envelope(pcm, sr = 24000) { const win = sr / 1000; const n = Math.floor(pcm.length / win); const e = new Float32Array(n); for (let i = 0; i < n; i++) { let s = 0; for (let k = 0; k < win; k++) { const v = pcm[i * win + k]; s += v * v; } e[i] = Math.sqrt(s / win); } return e; }
function firstVoicedMs(env) { const peak = Math.max(...env); for (let i = 0; i < env.length; i++) if (env[i] >= 0.01 * peak) return i; return null; }

async function run(label, threadsEnv) {
  process.env.NARRATE_INTRA_OP_THREADS = threadsEnv;
  const t0 = performance.now();
  const status = await producer.ensureReady();
  const readyMs = Math.round(performance.now() - t0);
  const r = await producer.generate(ref.text, { voice: "af_bella", speed: 1.0 });
  producer.shutdown();
  if (BREAK && label === "A") r.table.durations[5] += 1;
  const envA = envelope(r.pcm), envB = envelope(wav.pcm);
  const peakA = Math.max(...envA), peakB = Math.max(...envB);
  let envMaxDiff = 0;
  for (let i = 0; i < Math.min(envA.length, envB.length); i++) envMaxDiff = Math.max(envMaxDiff, Math.abs(envA[i] / peakA - envB[i] / peakB));
  const tableChecks = {
    ready: status.state === "ready" && status.runtime?.outputNames?.includes("durations"),
    exposedSha: status.exposed?.sha256 === "2eccfc53272a6d9b302320cf522a0f3cd6201cd29f0c872fad9433c207b95cad",
    tokens: r.table.tokens === ref.ids.length,
    durations: same(r.table.durations, ref.durations),
    factor: r.table.samplesPerFrame === ref.law.factor && r.table.law.ok === true,
    pcmLength: r.pcm.length === ref.pcmSamples && r.pcm.length === wav.pcm.length,
    units: same(r.table.units, refUnits),
    reconciled: r.table.reconciled === true && r.table.failures.length === 0,
    provenance: r.table.provenance.source === "model-output" && same(r.table.provenance.outputNames, ref.provenance.outputNames),
  };
  // The P0-3 reference's own detector (T3: pauses >= 60 ms below 1 % of peak; onsets at the 1 % and 3 % crossings)
  // on both waveforms: every onset the reference would resolve must sit at the same millisecond.
  const onsets = (p) => { const e = t3Envelope(p); return findPauses(e, Math.max(...e), 1.0).filter((x) => !x.trailing).map((x) => ({ onsetMs: x.onsetMs, spreadMs: x.spreadMs, lenMs: x.lenMs })); };
  const oA = onsets(r.pcm), oB = onsets(wav.pcm);
  const onsetMaxDiffMs = oA.length === oB.length ? Math.max(0, ...oA.map((x, i) => Math.abs(x.onsetMs - oB[i].onsetMs))) : null;
  const pcm = { shaIdentical: sha256(r.pcm) === ref.pcmSha256, envelopeMaxDiff: +envMaxDiff.toFixed(4), firstVoicedMs: firstVoicedMs(envA), refFirstVoicedMs: firstVoicedMs(envB), onsets: oA.length, refOnsets: oB.length, onsetMaxDiffMs };
  return { label, threads: status.runtime?.threads, readyMs, loadMs: status.runtime?.loadMs, genMs: r.genMs, tableChecks, pcm };
}

const A = await run("A", "default");
const B = await run("B", "4");
const required = {
  A_table: Object.values(A.tableChecks).every(Boolean),
  A_pcmShaIdentical: A.pcm.shaIdentical,
  B_table: Object.values(B.tableChecks).every(Boolean),
  B_threads4: B.threads === 4,
  B_firstVoicedWithin1ms: Math.abs(B.pcm.firstVoicedMs - B.pcm.refFirstVoicedMs) <= 1,
  B_sameOnsetsWithin1ms: B.pcm.onsets === B.pcm.refOnsets && B.pcm.onsets > 0 && B.pcm.onsetMaxDiffMs <= 1,
};
const pass = Object.values(required).every(Boolean);
console.log(JSON.stringify({ pass, control: BREAK ? "break" : null, required, runs: [A, B] }));
process.exit(pass ? 0 : 1);
