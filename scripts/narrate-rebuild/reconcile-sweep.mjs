import "./lib/app-icu-guard.mjs"; // P6b: refuse plain Node (exit 3) before anything else loads
// NARRATE-REBUILD-1 P6b — the reconciliation sweep. Every chunk the engine would plan for a corpus goes through the
// producer's text side exactly as main/narrate/producer-worker.js generate() runs it (kokoro-js's normalizer, espeak, the
// real tokenizer, capture.js, wordmap.js, normalize.js mapUnitsToSourceWords) and the engine's verifyTable. The ONNX
// model is a stub that returns one duration frame per input id and 600 zero samples per frame: reconciliation reads
// frames only as spans, so every text-side fail-closed chunk reproduces exactly. No audio; no timing is estimated.
//
// Usage (pwsh, worktree root): pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 scripts/narrate-rebuild/reconcile-sweep.mjs <mode>
//   --gate                    the gate corpus; exit 0 iff no chunk fails closed
//   --gate --control          the same with main/narrate/{normalize,wordmap}.js as at CONTROL_BASE (before P6b); must exit 1
//   --gate --from W --to X    the sample book only, as the engine plans an epoch started at book word W (app numbering),
//                             the chunks that start before X (a live route: D2 is --from 2970 --to 6700); add --control too
//   --changed [--break]       chunks that pass before and after P6b with different tables: each old table must hold a
//                             wrong split unit that the new table replaces; exit 0 iff all do and no chunk newly fails.
//                             --break plants one changed correct table and must exit 1 (LL-151)
//   --changed --owner <dir>   the same over the owner copies instead of the gate corpus; no text in the output
//   --base <sha>              with --changed or --control: the commit whose main/narrate/{normalize,wordmap}.js are the
//                             "before" modules (default CONTROL_BASE; NARRATE-RECONCILE-RESIDUAL-1)
//   --owner <dir> [--control] every .epub in <dir> (copies, never the profile); books named sha256(file name)[0:8],
//                             counts and word positions only, never text; exit 0 iff every failure is class E (token cap)
//   --check-tokenizer         the committed tokenizer fixture equals the artifacts copy; exit 0 / 1
// Exit 2 = usage or setup error; 3 = refused (not the app's Electron).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const req = createRequire(path.join(ROOT, "main/narrate/producer-worker.js"));
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const argOf = (f) => (has(f) ? args[args.indexOf(f) + 1] : null);
const die = (msg) => { console.error(msg); process.exit(2); };

export const CONTROL_BASE = "2b78f1ca0eea9aeb1ca1e5397eb44ca35b3af9e7"; // the P6 tip before P6b (S5, D2 failure recorded)
const FIXTURES = path.join(ROOT, "tests/fixtures/narrate-rebuild");
const TOKENIZER_DIR = path.join(FIXTURES, "kokoro-tokenizer");
export const TOKENIZER_SHA256 = "77a02c8e164413299b4b4c403b14f8e0e1c1b727db4d46a09d6327b861060a34";
const ARTIFACTS_TOKENIZER = "C:/Projects/Blurby-artifacts/narrate-rebuild-1/models/local/kokoro-dur/tokenizer.json";
// Owner-library chunks that still fail closed for a reason other than the token cap and that Blurby.Brain has ruled on,
// by sha256(chunk text)[0:16] so no text is kept: NARRATE-RECONCILE-RESIDUAL-1 (2026-10-15), a two-word capitalised name
// whose second word espeak reads [k] alone and [tʃ] in the phrase (fused unit cost 0.67; fails closed, never guesses).
export const RULED_RESIDUALS = new Set(["4e7915ce2410e10e"]);
const LEGACY = ["chapter-transition", "dialogue-switches", "long-sentence", "pause-resume", "prose-basic", "punctuation-dense", "queued-handoff", "section-transition"];
const GATE = [
  ["passage-a", path.join(FIXTURES, "passage-a.txt")],
  ["passage-b", path.join(FIXTURES, "passage-b.txt")],
  ...LEGACY.map((n) => [`legacy/${n}`, path.join(FIXTURES, "legacy", `${n}.txt`)]),
  ["raven-1845", path.join(FIXTURES, "raven-1845.txt")],
  ["meditations", path.join(ROOT, "resources/sample-meditations.epub")],
];
const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");

if (has("--check-tokenizer")) {
  const ours = sha256(fs.readFileSync(path.join(TOKENIZER_DIR, "tokenizer.json")));
  if (!fs.existsSync(ARTIFACTS_TOKENIZER)) die(`artifacts copy missing: ${ARTIFACTS_TOKENIZER}`);
  const theirs = sha256(fs.readFileSync(ARTIFACTS_TOKENIZER));
  console.log(JSON.stringify({ fixture: ours, artifacts: theirs, pinned: TOKENIZER_SHA256 }));
  process.exit(ours === theirs && ours === TOKENIZER_SHA256 ? 0 : 1);
}
const mode = has("--gate") ? "gate" : has("--changed") ? "changed" : has("--owner") ? "owner" : die("usage: --gate [--control] | --changed [--owner <dir>] [--break] | --owner <dir> [--control] | --check-tokenizer; --base <sha> with --changed or --control");
if (sha256(fs.readFileSync(path.join(TOKENIZER_DIR, "tokenizer.json"))) !== TOKENIZER_SHA256) die("tokenizer fixture hash differs from TOKENIZER_SHA256");

// ── The producer's text side, with a stub model ────────────────────────────────────────────────────────────────
const { attachCapture, synthesize } = req("./capture");
const { extractWords } = req("../epub-word-extractor");
const { planChunks } = await import(pathToFileURL(path.join(ROOT, "src/reader/modes/narrate/engine/chunkPlan.ts")).href);
const { verifyTable } = await import(pathToFileURL(path.join(ROOT, "src/reader/modes/narrate/engine/wordTable.ts")).href);
const { NARRATE_CHUNK_RAMP, NARRATE_STEADY_CHUNK_MAX_WORDS } = await import(pathToFileURL(path.join(ROOT, "src/constants.ts")).href);
const kokoroPath = path.join(ROOT, "node_modules/kokoro-js/dist/kokoro.cjs");
const kreq = createRequire(kokoroPath);
const kokoro = kreq(kokoroPath), tf = kreq("@huggingface/transformers"), ph = kreq("phonemizer");
Object.assign(tf.env, { allowRemoteModels: false, allowLocalModels: true, localModelPath: FIXTURES.replace(/[\\/]*$/, "/"), useFSCache: false, useBrowserCache: false });
const tokenizer = await tf.AutoTokenizer.from_pretrained("kokoro-tokenizer");
const stubModel = async (inputs) => {
  const n = inputs.input_ids.dims.at(-1);
  return { waveform: { data: new Float32Array(600 * n) }, durations: { data: new Float32Array(n).fill(1), type: "float32", dims: [1, n] } };
};
const tts = new kokoro.KokoroTTS(stubModel, tokenizer);
const capture = attachCapture(tts, ph);

const CURRENT = { ...req("./wordmap"), ...req("./normalize") };
const CONTROL = has("--base") ? (argOf("--base") ?? die("--base needs a commit")) : CONTROL_BASE;
function controlModules() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "reconcile-control-"));
  for (const f of ["normalize.js", "wordmap.js"]) fs.writeFileSync(path.join(dir, f), execFileSync("git", ["-C", ROOT, "show", `${CONTROL}:main/narrate/${f}`]));
  const r = createRequire(path.join(dir, "x.js"));
  return { ...r("./wordmap"), ...r("./normalize") };
}
const BASE = mode === "changed" || has("--control") ? controlModules() : null;

/** producer-worker.js generate() + narrateEngine's verifyTable, for one chunk: { ok, reason, detail, wm, table }. */
async function reconcile(text, sourceWords, mods) {
  let rec, wm, units;
  try {
    rec = await synthesize(tts, capture, text, { voice: "af_bella", speed: 1.0 });
    wm = await mods.buildWordMap(rec, capture.phonemizeIsolated);
    units = wm.reconciled ? mods.mapUnitsToSourceWords(text, rec.segments, wm.units) : wm.units;
  } catch (err) {
    return { ok: false, reason: "producer-error", detail: err?.message || String(err), wm };
  }
  const table = {
    provenance: rec.provenance, durations: rec.durations, samplesPerFrame: wm.law.factor, sampleRate: rec.sampleRate,
    units: units.map((u) => ({ words: u.words, spoken: u.spoken ?? u.words, kind: u.kind, frameStart: u.frameStart, frameEnd: u.frameEnd, sampleStart: u.sampleStart, sampleEnd: u.sampleEnd })),
    reconciled: wm.reconciled,
  };
  const v = verifyTable({ table, sourceWords, pcmSamples: rec.pcm.length });
  return v.ok ? { ok: true, wm, table } : { ok: false, reason: v.reason, detail: wm.failures.join(" | ") || null, wm };
}

function classify(r) {
  const d = r.detail ?? "";
  if (r.reason === "producer-error" && /token cap/.test(d)) return "E";
  if (/segment unalignable: \s*'+\s*$/.test(d)) return "A";
  if (/normalization changed the word count/.test(d)) return "B/F";
  if (/segment unalignable/.test(d)) return "C";
  if (/evidence cost/.test(d)) return "D";
  return `Z:${r.reason}`;
}

function loadTxt(file) {
  const raw = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const words = [], breaks = new Set();
  for (const para of raw.split(/\n\s*\n/)) {
    const w = para.trim().split(/\s+/).filter(Boolean);
    if (!w.length) continue;
    words.push(...w); breaks.add(words.length - 1);
  }
  return { words, breaks };
}
async function loadBook(file) {
  if (!file.toLowerCase().endsWith(".epub")) return loadTxt(file);
  const b = await extractWords(file);
  return { words: b.words, breaks: new Set(b.sections.filter((s) => s.endWordIdx > 0).map((s) => s.endWordIdx - 1)) }; // = ModeRuntime.chunkBreaks
}
/** The engine's plan for one epoch from word `from` (narrateEngine: one chunk per call, the ramp counted per epoch). */
function planAll(words, breaks, from = 0) {
  const out = [];
  for (let at = from, step = 0; at < words.length; step++) {
    const [e] = planChunks(words, at, { maxChunks: 1, breaks, ramp: NARRATE_CHUNK_RAMP, rampIndex: step, maxWords: NARRATE_STEADY_CHUNK_MAX_WORDS });
    if (!e) break;
    out.push(e); at = e.endWord;
  }
  return out;
}

const unitKey = (u) => `${u.charStart}-${u.charEnd}`; // the phoneme string is the same capture before and after
const tableKey = (t) => JSON.stringify(t.units.map((u) => [u.words, u.frameStart, u.frameEnd, u.sampleStart, u.sampleEnd]));
/** Split-word units of the old table that are not the word's own isolated sounds (cost > 0) and that the new table drops. */
const replacedSplits = (oldWm, newWm) => {
  const kept = new Set(newWm.units.map(unitKey));
  return oldWm.units.filter((u) => u.kind === "split-word" && u.evidenceCost > 0 && !kept.has(unitKey(u)));
};

// --from <word> --to <word>: the sample book only, planned as an epoch the reader starts at <word> (a live route such
// as D2's from "ancient"), chunks starting before <to>; same pass rule as --gate.
const FROM = has("--from") ? Number(argOf("--from")) : null, TO = has("--to") ? Number(argOf("--to")) : Infinity;
if (FROM !== null && !(Number.isInteger(FROM) && FROM >= 0 && TO > FROM)) die("--from <word> --to <word>: integers, from < to");
const books = FROM !== null ? GATE.filter(([id]) => id === "meditations") : has("--owner")
  ? (() => {
      const dir = path.resolve(argOf("--owner") ?? die("--owner needs a directory"));
      if (process.env.APPDATA && dir.toLowerCase().startsWith(path.join(process.env.APPDATA, "Blurby").toLowerCase())) die("refusing the live profile; sweep copies");
      return fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".epub")).sort().map((f) => [sha256(f).slice(0, 8), path.join(dir, f)]);
    })()
  : GATE;
const priv = has("--owner"); // owner books: counts, positions and costs only, never text (detail and units name words)
const mods = has("--control") ? BASE : CURRENT;
let failed = 0, nonE = 0, ruledCount = 0, chunksPlanned = 0, chunksRecorded = 0, changedBad = 0, changedOk = 0, newlyFailing = 0;
let planted = !has("--break");
for (const [id, file] of books) {
  if (!fs.existsSync(file)) die(`missing corpus file: ${file}`);
  const { words, breaks } = await loadBook(file);
  const plan = FROM === null ? planAll(words, breaks) : planAll(words, breaks, FROM).filter((e) => e.startWord < TO);
  chunksPlanned += plan.length;
  const row = { id, words: words.length, chunks: plan.length, failed: 0, byClass: {} };
  const changed = [];
  for (const e of plan) {
    const src = words.slice(e.startWord, e.endWord);
    const r = await reconcile(e.text, src, mods);
    chunksRecorded++;
    if (mode === "changed") {
      const old = await reconcile(e.text, src, BASE);
      if (old.ok && !r.ok) { newlyFailing++; changed.push({ at: e.startWord, newlyFailing: r.reason, ...(priv ? {} : { detail: r.detail }) }); continue; }
      if (!old.ok || !r.ok) continue;
      let newTable = r.table;
      if (!planted && tableKey(old.table) === tableKey(r.table)) { newTable = { ...r.table, units: [{ ...r.table.units[0], frameEnd: r.table.units[0].frameEnd + 1 }, ...r.table.units.slice(1)] }; planted = true; } // --break
      if (tableKey(old.table) === tableKey(newTable)) continue;
      const replaced = newTable === r.table ? replacedSplits(old.wm, r.wm) : [];
      if (replaced.length) changedOk++; else changedBad++;
      changed.push({ at: e.startWord, wrongSplitsReplaced: replaced.map((u) => ({ ...(priv ? {} : { word: u.words.join(" "), group: u.group }), cost: u.evidenceCost, overLimit: u.evidenceCost > 0.5 })), ...(priv ? {} : { text: e.text }) });
      continue;
    }
    if (r.ok) continue;
    const ruled = priv && RULED_RESIDUALS.has(sha256(e.text).slice(0, 16));
    const cls = ruled ? `${classify(r)}:ruled` : classify(r);
    row.failed++; failed++;
    if (ruled) ruledCount++; else if (cls !== "E") nonE++;
    (row.byClass[cls] ??= []).push(e.startWord);
    if (!priv && row.failed <= 5) (row.examples ??= []).push({ at: e.startWord, cls, detail: r.detail, text: e.text });
  }
  if (mode === "changed") console.log(JSON.stringify({ id, chunks: plan.length, changed: changed.length, changes: changed }));
  else console.log(JSON.stringify(row));
}
if (chunksRecorded !== chunksPlanned || chunksPlanned === 0) { console.error(`recorder mismatch: ${chunksRecorded}/${chunksPlanned} chunks`); process.exit(2); } // LL-151
const control = has("--control") ? ` (control: modules at ${CONTROL.slice(0, 8)})` : "";
if (mode === "gate") { console.log(`GATE${control}: ${failed} fail-closed chunks of ${chunksPlanned}`); process.exit(failed ? 1 : 0); }
if (mode === "owner") { console.log(`OWNER${control}: ${failed} fail-closed chunks of ${chunksPlanned} in ${books.length} books; ${failed - nonE - ruledCount} class E, ${ruledCount} ruled residual, ${nonE} other`); process.exit(nonE ? 1 : 0); }
console.log(`CHANGED${has("--break") ? " (--break)" : ""} (before: modules at ${CONTROL.slice(0, 8)}): ${changedOk} changed tables replace a wrong split unit; ${changedBad} changed without one; ${newlyFailing} newly failing`);
process.exit(changedBad || newlyFailing || !planted ? 1 : 0);
