// NARRATE-REBUILD-1 P5 — D6 end-to-end latency, and the launcher for the D3 recorded-output sessions.
// Launches the built app unpackaged from this worktree (BLURBY_USE_DIST=1) with a scratch profile under --out
// (BLURBY_USER_DATA_DIR: the real profile is never touched), the duration-exposed model copy (NARRATE_MODELS_ROOT),
// the eval-trace writer (BLURBY_TTS_EVAL_TRACE_DIR) and the in-app trial driver (BLURBY_NARRATE_TRIAL; main/narrate/trial.js).
// It measures nothing itself: the engine records every request and the first voiced sample that answers it on the
// playback clock (latencyS = startAt − ctxAtRequest), and this script reads the traces and reports every trial and
// the worst per request type and rate, never a mean. T7: warm 20 per type at 1.00x and 2.00x (one process per rate);
// cold 5 per type, each a fresh process with the model unloaded, through the type's entry path. Host busy is sampled
// around every run as P0-5 did; the figures are what the owner's ordinary desktop gave (Decision #13).
// Usage (pwsh, in the phase worktree, after `npm run build`; never while npm test or npm run build runs):
//   node scripts/narrate-rebuild/p5-latency-e2e.mjs [--only session|warm|cold] [--warm 20] [--cold 5] [--rates 1.0,2.0]
//        [--minutes 5] [--out C:\Projects\Blurby-artifacts\narrate-rebuild-1\p5] [--analyze-only]
// Writes docs/studies/narrate-rebuild-1/phase5/latency-e2e.json (D6) and recorded-output.json (D3 and D5 in the app,
// through p5-recorded-output-check.mjs's analysis). Exit 0 only when every warm trial < 2,000 ms, every cold trial
// < 8,000 ms and every session analysis is PASS; 1 otherwise. --analyze-only re-reads the traces already in --out.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { analyze, readTraceEvents } from "./p5-recorded-output-check.mjs";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ELECTRON = require("electron");
const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const ONLY = arg("--only", null);
const WARM = Number(arg("--warm", 20));
const COLD = Number(arg("--cold", 5));
const RATES = String(arg("--rates", "1.0,2.0")).split(",").map(Number);
const MINUTES = Number(arg("--minutes", 5));
const OUT = path.resolve(arg("--out", "C:/Projects/Blurby-artifacts/narrate-rebuild-1/p5"));
const ANALYZE_ONLY = process.argv.includes("--analyze-only");
const TRIAL_TIMEOUT_MS = Number(arg("--trial-timeout", 120000));
const DIAG = process.argv.includes("--diag");
// --break plants 2.5 s on the first trial read (the positive control, LL-151): any run must then exit 1.
const BREAK = process.argv.includes("--break");
let breakPlanted = false;
// The book word every session opens at. 8723 is 700 words before THE SECOND BOOK (word 9423 of the sample EPUB's
// extraction), so a five-minute session crosses a section boundary (D5, F2) inside plain body text.
const POSITION = Number(arg("--position", 8723));
const MODELS_ROOT = process.env.NARRATE_MODELS_ROOT || "C:/Projects/Blurby-artifacts/narrate-rebuild-1/models";
const RECORDS_DIR = path.join(ROOT, "docs/studies/narrate-rebuild-1/phase5");
export const WARM_BUDGET_MS = 2000, COLD_BUDGET_MS = 8000; // R3
const TYPES = ["play", "resume", "click", "speed"];

const slug = (v) => String(v).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "trace"; // = main.js safeTraceSlug
const rateLabel = (r) => r.toFixed(2);
function cpuSnapshot() { let idle = 0, total = 0; for (const c of os.cpus()) { idle += c.times.idle; for (const v of Object.values(c.times)) total += v; } return { idle, total }; }
const busyPct = (a, b) => +(100 * (1 - (b.idle - a.idle) / Math.max(1, b.total - a.total))).toFixed(1);

const traceDir = path.join(OUT, "traces");
const tracePathFor = (label) => path.join(traceDir, `${slug(label)}.trace.json`);

async function launch(label, trial) {
  if (!fs.existsSync(path.join(ROOT, "dist", "index.html"))) throw new Error("dist/index.html is missing: run npm run build first");
  // A fresh scratch profile per launch: a reused one carries the last run's reading anchor and rate into the next.
  const profile = path.join(OUT, "profiles", `${label}-${Date.now()}`);
  for (const d of [traceDir, path.join(OUT, "logs"), path.join(OUT, "summaries"), profile]) fs.mkdirSync(d, { recursive: true });
  try { fs.rmSync(tracePathFor(label), { force: true }); } catch { /* none */ }
  const env = {
    ...process.env,
    BLURBY_USE_DIST: "1",
    BLURBY_USER_DATA_DIR: profile,
    BLURBY_TTS_EVAL_TRACE_DIR: traceDir,
    BLURBY_TTS_EVAL_TRACE_CONFIG: JSON.stringify({ mode: label, runId: label }),
    BLURBY_NARRATE_TRIAL: JSON.stringify({ ...trial, position: POSITION, timeoutMs: TRIAL_TIMEOUT_MS, diag: DIAG, out: path.join(OUT, "summaries") }),
    NARRATE_MODELS_ROOT: MODELS_ROOT,
  };
  const before = cpuSnapshot();
  const t0 = Date.now();
  const limitMs = ((trial.minutes ?? 0) + 15) * 60000;
  const code = await new Promise((resolve) => {
    const p = spawn(ELECTRON, ["."], { cwd: ROOT, env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    let out = "";
    p.stdout.on("data", (d) => { out += d; });
    p.stderr.on("data", (d) => { out += d; });
    const timer = setTimeout(() => { out += "\n[launcher] timeout, killing\n"; p.kill(); }, limitMs);
    p.on("exit", (c) => { clearTimeout(timer); fs.writeFileSync(path.join(OUT, "logs", `${slug(label)}.log`), out); resolve(c); });
  });
  const result = { label, code, wallMs: Date.now() - t0, hostBusyPct: busyPct(before, cpuSnapshot()), tracePath: tracePathFor(label), traceExists: fs.existsSync(tracePathFor(label)) };
  console.log(JSON.stringify(result));
  return result;
}

// Request → the first voiced sample heard (T6, the playback clock): the sample's context time (startAt) mapped to
// performance.now() through the output-timestamp pair of the first commit after it, minus the request's
// performance.now(). The context clock does not run before the first audio, so startAt − ctxAtRequest alone (kept as
// ctxLatencyMs) can read near zero for a first request. No pair → no measurement (null, a failure, never a pass).
function firstVoiced(tracePath) {
  if (!fs.existsSync(tracePath)) return [];
  const ev = readTraceEvents(tracePath);
  const out = [];
  ev.forEach((e, i) => {
    if (e.kind !== "narrate-first-voiced") return;
    const pair = ev.slice(i + 1).find((c) => c.kind === "narrate-commit" && c.otsPerf > 0 && typeof c.otsCtx === "number");
    let latencyMs = pair ? +(pair.otsPerf + (e.startAt - pair.otsCtx) * 1000 - e.requestT).toFixed(0) : null;
    if (BREAK && !breakPlanted && latencyMs !== null) { latencyMs += 2500; breakPlanted = true; }
    out.push({ cause: e.cause, speed: e.speed, word: e.word, latencyMs, ctxLatencyMs: +(e.latencyS * 1000).toFixed(0), scheduledWallMs: e.latencyWallMs == null ? null : +e.latencyWallMs.toFixed(0), leadMs: +(e.leadS * 1000).toFixed(0), trimMs: +((e.trimSamples / 24000) * 1000).toFixed(0) });
  });
  return out;
}

const failures = [];
const report = { generatedAt: new Date().toISOString(), host: { platform: os.platform(), release: os.release(), cpus: os.cpus().length, model: os.cpus()[0]?.model ?? null, totalMemGb: +(os.totalmem() / 2 ** 30).toFixed(1) }, electron: process.versions.electron ?? null, budgets: { warmMs: WARM_BUDGET_MS, coldMs: COLD_BUDGET_MS }, rates: RATES, runs: [], warm: {}, cold: {}, sessions: {} };

const want = (k) => !ONLY || ONLY === k;

// ── D3 sessions ───────────────────────────────────────────────────────────────────────────────────────────
if (want("session")) {
  for (const rate of RATES) {
    const label = `session-${rateLabel(rate)}`;
    if (!ANALYZE_ONLY) report.runs.push(await launch(label, { kind: "session", rate, minutes: MINUTES }));
    const tp = tracePathFor(label);
    const r = fs.existsSync(tp) ? analyze(readTraceEvents(tp), { minMinutes: MINUTES }) : { verdict: "INCONCLUSIVE", failures: [], holds: ["no trace written"], stats: {} };
    report.sessions[rateLabel(rate)] = { tracePath: tp, ...r };
    if (r.verdict !== "PASS") failures.push(`session ${rateLabel(rate)}: ${r.verdict} ${[...r.failures, ...r.holds].join("; ")}`);
  }
}

// ── D6 warm ───────────────────────────────────────────────────────────────────────────────────────────────
if (want("warm")) {
  for (const rate of RATES) {
    const label = `warm-${rateLabel(rate)}`;
    if (!ANALYZE_ONLY) report.runs.push(await launch(label, { kind: "warm", rate, repeat: WARM }));
    const trials = firstVoiced(tracePathFor(label));
    const byCause = {};
    for (const t of TYPES) {
      const own = trials.filter((x) => x.cause === t);
      const measured = own.filter((x) => x.latencyMs !== null);
      byCause[t] = { n: own.length, worstMs: measured.length ? Math.max(...measured.map((x) => x.latencyMs)) : null, over: measured.filter((x) => x.latencyMs >= WARM_BUDGET_MS).length, unmeasured: own.length - measured.length, trials: own };
      if (byCause[t].unmeasured) failures.push(`warm ${rateLabel(rate)} ${t}: ${byCause[t].unmeasured} trials with no output-timestamp pair`);
      if (own.length < WARM) failures.push(`warm ${rateLabel(rate)} ${t}: ${own.length} trials < ${WARM}`);
      if (byCause[t].over) failures.push(`warm ${rateLabel(rate)} ${t}: ${byCause[t].over} trials at or over ${WARM_BUDGET_MS} ms (worst ${byCause[t].worstMs})`);
    }
    report.warm[rateLabel(rate)] = byCause;
  }
}

// ── D6 cold ───────────────────────────────────────────────────────────────────────────────────────────────
if (want("cold")) {
  for (const rate of RATES) {
    report.cold[rateLabel(rate)] = {};
    for (const type of TYPES) {
      const rows = [];
      for (let i = 0; i < COLD; i++) {
        const label = `cold-${type}-${rateLabel(rate)}-${i + 1}`;
        let run = null;
        if (!ANALYZE_ONLY) { run = await launch(label, { kind: "cold", rate, type }); report.runs.push(run); }
        const first = firstVoiced(tracePathFor(label))[0] ?? null;
        rows.push({ trial: i + 1, latencyMs: first ? first.latencyMs : null, cause: first ? first.cause : null, hostBusyPct: run ? run.hostBusyPct : null, wallMs: run ? run.wallMs : null });
        if (!first) failures.push(`cold ${type} ${rateLabel(rate)} trial ${i + 1}: no first voiced sample recorded`);
        else if (first.latencyMs === null) failures.push(`cold ${type} ${rateLabel(rate)} trial ${i + 1}: no output-timestamp pair`);
        else if (first.latencyMs >= COLD_BUDGET_MS) failures.push(`cold ${type} ${rateLabel(rate)} trial ${i + 1}: ${first.latencyMs} ms >= ${COLD_BUDGET_MS}`);
      }
      report.cold[rateLabel(rate)][type] = { n: rows.length, worstMs: rows.some((r) => r.latencyMs !== null) ? Math.max(...rows.filter((r) => r.latencyMs !== null).map((r) => r.latencyMs)) : null, trials: rows };
    }
  }
}

report.verdict = failures.length ? "FAIL" : "PASS";
report.failures = failures;
fs.mkdirSync(RECORDS_DIR, { recursive: true });
if (want("warm") || want("cold")) fs.writeFileSync(path.join(RECORDS_DIR, "latency-e2e.json"), JSON.stringify(report, null, 2));
if (want("session")) fs.writeFileSync(path.join(RECORDS_DIR, "recorded-output.json"), JSON.stringify({ generatedAt: report.generatedAt, host: report.host, minutes: MINUTES, sessions: report.sessions, runs: report.runs.filter((r) => r.label.startsWith("session")) }, null, 2));
console.log(JSON.stringify({ verdict: report.verdict, failures, warm: Object.fromEntries(Object.entries(report.warm).map(([r, c]) => [r, Object.fromEntries(Object.entries(c).map(([t, v]) => [t, v.worstMs]))])), cold: Object.fromEntries(Object.entries(report.cold).map(([r, c]) => [r, Object.fromEntries(Object.entries(c).map(([t, v]) => [t, v.worstMs]))])), sessions: Object.fromEntries(Object.entries(report.sessions).map(([r, s]) => [r, s.verdict])) }, null, 1));
process.exit(failures.length ? 1 : 0);
