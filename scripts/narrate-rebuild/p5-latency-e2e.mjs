import "./lib/app-icu-guard.mjs"; // P6b: refuse plain Node (exit 3)
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
//        [--types play,resume,click,speed] [--class auto|reference|mainstream]
// Writes docs/studies/narrate-rebuild-1/phase5/latency-e2e.json (D6) and recorded-output.json (D3 and D5 in the app,
// through p5-recorded-output-check.mjs's analysis). Exit 0 only when every warm trial < 2,000 ms, every cold trial
// < 8,000 ms and every session analysis is PASS; 1 otherwise. --analyze-only re-reads the traces already in --out.
// The warm budget follows the host's D6 class (Decision #22): reference 2,000 ms, mainstream 2,500 ms; a host below
// mainstream exits 2 before any launch. Cold click is classified per trial (lib/coldclick.mjs) and counts only when
// attributed (NARRATE-HARNESS-COLDCLICK-1).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { analyze, readTraceEvents } from "./p5-recorded-output-check.mjs";
import { classifyColdClick, clickStepOf } from "./lib/coldclick.mjs";

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
// The book word every session opens at. 8723 is 708 words before THE SECOND BOOK (word 9431 in the app's numbering,
// Electron 41's ICU; plain Node says 9423), so a five-minute session crosses a section boundary (D5, F2) inside plain body text.
const POSITION = Number(arg("--position", 8723));
const MODELS_ROOT = process.env.NARRATE_MODELS_ROOT || "C:/Projects/Blurby-artifacts/narrate-rebuild-1/models";
const RECORDS_DIR = path.join(ROOT, "docs/studies/narrate-rebuild-1/phase5");
// D6 hardware classes and budgets (charter, Decision #22): 8+ physical cores is the reference class, 4 to 7 the
// mainstream class (the i7-1185G7), below 4 is not judged. The cold budget is the same for both classes.
export const REFERENCE_MIN_CORES = 8, MAINSTREAM_MIN_CORES = 4;
export const REFERENCE_WARM_BUDGET_MS = 2000, MAINSTREAM_WARM_BUDGET_MS = 2500, COLD_BUDGET_MS = 8000; // R3
const ALL_TYPES = ["play", "resume", "click", "speed"];
const TYPES = arg("--types", null) ? String(arg("--types")).split(",").map((t) => t.trim()).filter((t) => ALL_TYPES.includes(t)) : ALL_TYPES;
if (!TYPES.length) { console.error(`--types: none of ${arg("--types")} is one of ${ALL_TYPES.join(",")}`); process.exit(2); }

/** Physical cores, read as epic-window.ps1 reads them (Win32_Processor NumberOfCores, summed); null when unreadable. */
function physicalCores() {
  const r = spawnSync("pwsh", ["-NoProfile", "-NonInteractive", "-Command", "(Get-CimInstance Win32_Processor | Measure-Object -Property NumberOfCores -Sum).Sum"], { encoding: "utf8", windowsHide: true });
  const n = parseInt(String(r.stdout ?? "").trim(), 10);
  return Number.isFinite(n) ? n : null;
}
export const d6ClassOf = (cores) => (cores >= REFERENCE_MIN_CORES ? "reference" : cores >= MAINSTREAM_MIN_CORES ? "mainstream" : "below-mainstream");
const CLASS_ARG = String(arg("--class", "auto"));
if (!["auto", "reference", "mainstream"].includes(CLASS_ARG)) { console.error(`--class must be auto, reference or mainstream (got ${CLASS_ARG})`); process.exit(2); }
const PHYSICAL_CORES = physicalCores();
const D6CLASS = CLASS_ARG === "auto" ? (PHYSICAL_CORES === null ? "below-mainstream" : d6ClassOf(PHYSICAL_CORES)) : CLASS_ARG;
if (D6CLASS === "below-mainstream" && !ANALYZE_ONLY) { console.error(`D6 class below-mainstream (${PHYSICAL_CORES ?? "unknown"} physical cores): no launch`); process.exit(2); }
const WARM_BUDGET_MS = D6CLASS === "reference" ? REFERENCE_WARM_BUDGET_MS : MAINSTREAM_WARM_BUDGET_MS;

// The live profile (LL-165): hashed before the first launch and after the last; any change fails the run. The app
// keeps settings.json and library.json in the profile's blurby-data folder; the profile root is hashed too.
const LIVE_PROFILE = process.env.APPDATA ? path.join(process.env.APPDATA, "blurby") : null;
const liveHashes = () => Object.fromEntries(["settings.json", "library.json", "blurby-data/settings.json", "blurby-data/library.json"].map((f) => {
  const p = LIVE_PROFILE ? path.join(LIVE_PROFILE, f) : null;
  return [f, p && fs.existsSync(p) ? crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex") : null];
}));

const slug = (v) => String(v).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "trace"; // = main.js safeTraceSlug
const rateLabel = (r) => r.toFixed(2);
function cpuSnapshot() { let idle = 0, total = 0; for (const c of os.cpus()) { idle += c.times.idle; for (const v of Object.values(c.times)) total += v; } return { idle, total }; }
const busyPct = (a, b) => +(100 * (1 - (b.idle - a.idle) / Math.max(1, b.total - a.total))).toFixed(1);

// CPU while a launch runs (Decision #18): every 500 ms, the host's busy and idle time (os.cpus) and the app's own
// processor time (every electron.exe started from this worktree, read by one long-lived PowerShell loop), so each
// trial carries narration's own CPU share apart from the foreign load. The sampler's own cost is foreign, and small.
const CPU_SAMPLE_MS = 500;
function startCpuSampler() {
  const host = [];
  const app = [];
  const hostTimer = setInterval(() => { const s = cpuSnapshot(); host.push({ t: Date.now(), ...s }); }, CPU_SAMPLE_MS);
  const ps = `$root = '${ROOT.replace(/'/g, "''")}'; while ($true) { $s = 0; Get-Process electron -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne ${process.pid} -and $_.Path -and $_.Path.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) } | ForEach-Object { $s += $_.TotalProcessorTime.TotalSeconds }; [Console]::Out.WriteLine(([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()).ToString() + ' ' + $s.ToString([Globalization.CultureInfo]::InvariantCulture)); Start-Sleep -Milliseconds ${CPU_SAMPLE_MS} }`;
  const child = spawn("pwsh", ["-NoProfile", "-NonInteractive", "-Command", ps], { stdio: ["ignore", "pipe", "ignore"], windowsHide: true });
  let buf = "";
  child.stdout.on("data", (d) => { buf += d; let i; while ((i = buf.indexOf("\n")) >= 0) { const [t, sec] = buf.slice(0, i).trim().split(" ").map(Number); buf = buf.slice(i + 1); if (Number.isFinite(t) && Number.isFinite(sec)) app.push({ t, sec }); } });
  return { stop() { clearInterval(hostTimer); child.kill(); return { cores: os.cpus().length, host, app }; } };
}

/** Over [t0, t1] (epoch ms, widened to at least 1 s): host busy %, the app's share % of all cores, foreign = host − app. */
export function cpuShare(series, t0, t1) {
  if (!series || !series.host?.length || !series.app?.length) return null;
  if (t1 - t0 < 1000) { const mid = (t0 + t1) / 2; t0 = mid - 500; t1 = mid + 500; }
  const near = (arr, t) => arr.reduce((best, x) => (Math.abs(x.t - t) < Math.abs(best.t - t) ? x : best), arr[0]);
  const h0 = near(series.host, t0), h1 = near(series.host, t1), a0 = near(series.app, t0), a1 = near(series.app, t1);
  if (h1.t <= h0.t || a1.t <= a0.t) return null;
  const hostPct = 100 * (1 - (h1.idle - h0.idle) / Math.max(1, h1.total - h0.total));
  const appPct = (100 * (a1.sec - a0.sec)) / (((a1.t - a0.t) / 1000) * series.cores);
  return { hostPct: +hostPct.toFixed(1), appPct: +appPct.toFixed(1), foreignPct: +Math.max(0, hostPct - appPct).toFixed(1) };
}

const traceDir = path.join(OUT, "traces");
const tracePathFor = (label) => path.join(traceDir, `${slug(label)}.trace.json`);

async function launch(label, trial) {
  if (!fs.existsSync(path.join(ROOT, "dist", "index.html"))) throw new Error("dist/index.html is missing: run npm run build first");
  // A fresh scratch profile per launch: a reused one carries the last run's reading anchor and rate into the next.
  const profile = path.join(OUT, "profiles", `${label}-${Date.now()}`);
  for (const d of [traceDir, path.join(OUT, "logs"), path.join(OUT, "summaries"), profile]) fs.mkdirSync(d, { recursive: true });
  try { fs.rmSync(tracePathFor(label), { force: true }); } catch { /* none */ }
  const { ELECTRON_RUN_AS_NODE: _asNode, ...inherited } = process.env; // the launcher runs as Node; the app must not
  const env = {
    ...inherited,
    BLURBY_USE_DIST: "1",
    BLURBY_USER_DATA_DIR: profile,
    BLURBY_TTS_EVAL_TRACE_DIR: traceDir,
    BLURBY_TTS_EVAL_TRACE_CONFIG: JSON.stringify({ mode: label, runId: label }),
    BLURBY_NARRATE_TRIAL: JSON.stringify({ ...trial, label, position: POSITION, timeoutMs: TRIAL_TIMEOUT_MS, diag: DIAG, out: path.join(OUT, "summaries") }),
    NARRATE_MODELS_ROOT: MODELS_ROOT,
  };
  const before = cpuSnapshot();
  const sampler = startCpuSampler();
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
  const cpu = sampler.stop();
  fs.writeFileSync(path.join(OUT, "logs", `${slug(label)}.cpu.json`), JSON.stringify(cpu));
  const share = cpuShare(cpu, t0, Date.now());
  const result = { label, code, wallMs: Date.now() - t0, hostBusyPct: busyPct(before, cpuSnapshot()), appCpuPct: share?.appPct ?? null, foreignCpuPct: share?.foreignPct ?? null, tracePath: tracePathFor(label), traceExists: fs.existsSync(tracePathFor(label)) };
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
  const cpuPath = path.join(OUT, "logs", path.basename(tracePath).replace(/\.trace\.json$/, ".cpu.json"));
  const series = fs.existsSync(cpuPath) ? JSON.parse(fs.readFileSync(cpuPath, "utf8")) : null;
  const out = [];
  ev.forEach((e, i) => {
    if (e.kind !== "narrate-first-voiced") return;
    const pair = ev.slice(i + 1).find((c) => c.kind === "narrate-commit" && c.otsPerf > 0 && typeof c.otsCtx === "number");
    let latencyMs = pair ? +(pair.otsPerf + (e.startAt - pair.otsCtx) * 1000 - e.requestT).toFixed(0) : null;
    if (BREAK && !breakPlanted && latencyMs !== null) { latencyMs += 2500; breakPlanted = true; }
    const requestEpoch = typeof e.ts === "number" ? e.ts - (e.t - e.requestT) : null;
    const cpu = requestEpoch !== null && latencyMs !== null ? cpuShare(series, requestEpoch, requestEpoch + latencyMs) : null;
    out.push({ cause: e.cause, speed: e.speed, word: e.word, latencyMs, cpu, ctxLatencyMs: +(e.latencyS * 1000).toFixed(0), scheduledWallMs: e.latencyWallMs == null ? null : +e.latencyWallMs.toFixed(0), leadMs: +(e.leadS * 1000).toFixed(0), trimMs: +((e.trimSamples / 24000) * 1000).toFixed(0) });
  });
  return out;
}

const failures = [];
const report = { generatedAt: new Date().toISOString(), host: { platform: os.platform(), release: os.release(), cpus: os.cpus().length, physicalCores: PHYSICAL_CORES, d6class: D6CLASS, model: os.cpus()[0]?.model ?? null, totalMemGb: +(os.totalmem() / 2 ** 30).toFixed(1) }, electron: process.versions.electron ?? null, budgets: { warmMs: WARM_BUDGET_MS, coldMs: COLD_BUDGET_MS, foreignCeilingPct: 25, cycleCap: 40 }, rates: RATES, types: TYPES, runs: [], warm: {}, cold: {}, sessions: {} };
const liveBefore = ANALYZE_ONLY ? null : liveHashes();
// A launch that exits 4 opened a profile other than its scratch one (main/narrate/trial.js profileMismatch, LL-165).
// The run stops at once (spec, failure handling): the app may already have loaded the live profile.
const launchChecked = async (label, trial) => {
  const run = await launch(label, trial);
  if (run.code === 4) { report.runs.push(run); failures.push(`${label}: profile mismatch (see ${path.join(OUT, "summaries")})`); finish(); }
  return run;
};

const want = (k) => !ONLY || ONLY === k;

// ── D3 sessions ───────────────────────────────────────────────────────────────────────────────────────────
if (want("session")) {
  for (const rate of RATES) {
    const label = `session-${rateLabel(rate)}`;
    if (!ANALYZE_ONLY) report.runs.push(await launchChecked(label, { kind: "session", rate, minutes: MINUTES }));
    const tp = tracePathFor(label);
    const r = fs.existsSync(tp) ? analyze(readTraceEvents(tp), { minMinutes: MINUTES }) : { verdict: "INCONCLUSIVE", failures: [], holds: ["no trace written"], stats: {} };
    report.sessions[rateLabel(rate)] = { tracePath: tp, ...r };
    if (r.verdict !== "PASS") failures.push(`session ${rateLabel(rate)}: ${r.verdict} ${[...r.failures, ...r.holds].join("; ")}`);
  }
}

// ── D6 counting (charter D6 as amended 2026-10-13, Decision #19) ─────────────────────────────────────────────
// A trial counts only when foreign CPU (host busy minus Blurby's own process tree) averages <= 25 % over it. A trial
// above the ceiling (or with no CPU split) is listed separately, never counted, never dropped; another cycle replaces
// it, up to 40 cycles per type, after which the run stops and asks the owner for a quiet window.
const FOREIGN_CEILING_PCT = 25;
const CYCLE_CAP = 40;
const counts = (x) => x.latencyMs !== null && x.cpu !== null && x.cpu.foreignPct <= FOREIGN_CEILING_PCT;
const brief = (x) => ({ latencyMs: x.latencyMs, cause: x.cause, cpu: x.cpu, run: x.run ?? null });

// ── D6 warm ───────────────────────────────────────────────────────────────────────────────────────────────
if (want("warm")) {
  for (const rate of RATES) {
    const r = rateLabel(rate);
    const all = [];
    let cycles = 0;
    // Cycles still needed for every type to reach WARM counting trials (a speed cycle makes two speed requests).
    const need = () => Math.max(...TYPES.map((t) => Math.ceil(Math.max(0, WARM - all.filter((x) => x.cause === t && counts(x)).length) / (t === "speed" ? 2 : 1))));
    for (let part = 1; ; part++) {
      const label = part === 1 ? `warm-${r}` : `warm-${r}-${part}`;
      if (ANALYZE_ONLY) {
        if (!fs.existsSync(tracePathFor(label))) break;
      } else {
        const repeat = part === 1 ? WARM : Math.min(need(), CYCLE_CAP - cycles);
        if (repeat <= 0) break;
        report.runs.push({ ...(await launchChecked(label, { kind: "warm", rate, repeat })), cycles: repeat });
        cycles += repeat;
      }
      all.push(...firstVoiced(tracePathFor(label)).map((x) => ({ ...x, run: label })));
      if (!ANALYZE_ONLY && (need() <= 0 || cycles >= CYCLE_CAP)) break;
    }
    const byCause = {};
    for (const t of TYPES) {
      const own = all.filter((x) => x.cause === t);
      const counting = own.filter(counts);
      const unmeasured = own.filter((x) => x.latencyMs === null);
      const overCeiling = own.filter((x) => x.latencyMs !== null && !counts(x));
      byCause[t] = {
        n: own.length, counting: counting.length,
        worstMs: counting.length ? Math.max(...counting.map((x) => x.latencyMs)) : null,
        over: counting.filter((x) => x.latencyMs >= WARM_BUDGET_MS).length,
        unmeasured: unmeasured.length, overCeiling: overCeiling.map(brief), trials: own,
      };
      if (unmeasured.length) failures.push(`warm ${r} ${t}: ${unmeasured.length} trials with no output-timestamp pair`);
      if (counting.length < WARM) failures.push(`warm ${r} ${t}: only ${counting.length} counting trials (< ${WARM}) within ${CYCLE_CAP} cycles - ask the owner for a quiet window`);
      if (byCause[t].over) failures.push(`warm ${r} ${t}: ${byCause[t].over} counting trials at or over ${WARM_BUDGET_MS} ms (worst ${byCause[t].worstMs})`);
    }
    report.warm[r] = byCause;
  }
}

// ── D6 cold ───────────────────────────────────────────────────────────────────────────────────────────────
if (want("cold")) {
  for (const rate of RATES) {
    const r = rateLabel(rate);
    report.cold[r] = {};
    for (const type of TYPES) {
      const rows = [];
      const countingRows = () => rows.filter((x) => x.counts).length;
      let erroredInRow = 0;
      for (let i = 1; i <= CYCLE_CAP && countingRows() < COLD; i++) {
        const label = `cold-${type}-${r}-${i}`;
        let run = null;
        if (ANALYZE_ONLY) { if (!fs.existsSync(tracePathFor(label))) break; }
        else { run = await launchChecked(label, { kind: "cold", rate, type }); report.runs.push(run); }
        const voiced = firstVoiced(tracePathFor(label));
        const first = voiced[0] ?? null;
        const row = { trial: i, label, latencyMs: first ? first.latencyMs : null, cause: first ? first.cause : null, cpu: first ? first.cpu : null, hostBusyPct: run ? run.hostBusyPct : null, wallMs: run ? run.wallMs : null };
        if (type === "click") {
          // NARRATE-HARNESS-COLDCLICK-1: the class comes from engine state (the traced requests and the first voiced
          // cause) beside the driver's step; only an attributed trial can count.
          const summaryPath = path.join(OUT, "summaries", `trial-${label}.json`);
          let summary = null;
          try { summary = fs.existsSync(summaryPath) ? JSON.parse(fs.readFileSync(summaryPath, "utf8")) : null; } catch { /* half-written: no step, class no-click or no-voice */ }
          const step = clickStepOf(summary);
          const events = fs.existsSync(tracePathFor(label)) ? readTraceEvents(tracePathFor(label)) : [];
          const d = (step && step.detail) || {};
          Object.assign(row, {
            class: classifyColdClick({ events, step }), playWord: d.playWord ?? null, clicked: d.clicked ?? null,
            clickOffset: typeof d.clicked === "number" && typeof d.playWord === "number" ? d.clicked - d.playWord : null,
            spansReadyMs: d.spansReadyMs ?? null, voicedBeforeClick: d.voicedBeforeClick ?? null, clickRequested: d.clickRequested ?? null,
            clickLatencyMs: voiced.find((x) => x.cause === "click")?.latencyMs ?? null, error: summary && summary.error ? String(summary.error).split("\n")[0] : null,
          });
          if (row.class === "undelivered") {
            row.lastEvents = events.filter((e) => e.kind !== "narrate-commit").slice(-12);
            failures.push(`cold click ${r} trial ${i}: click sent before the first voice and never requested`);
          }
        }
        if (!first) failures.push(`cold ${type} ${r} trial ${i}: no first voiced sample recorded`);
        else if (first.latencyMs === null) failures.push(`cold ${type} ${r} trial ${i}: no output-timestamp pair`);
        row.counts = Boolean(first) && counts(first) && (type !== "click" || row.class === "attributed");
        if (row.counts && row.latencyMs >= COLD_BUDGET_MS) failures.push(`cold ${type} ${r} trial ${i}: ${row.latencyMs} ms >= ${COLD_BUDGET_MS}`);
        rows.push(row);
        // Ten errored launches in a row stop the type: the harness, not the hardware, is failing (spec, failure handling).
        erroredInRow = run && run.code !== 0 ? erroredInRow + 1 : 0;
        if (erroredInRow >= 10) {
          failures.push(`cold ${type} ${r}: ten errored launches in a row (last ${label}) - run stopped, report to Blurby.Brain`);
          report.cold[r][type] = { n: rows.length, counting: rows.filter((x) => x.counts).length, worstMs: null, stopped: true, trials: rows };
          finish();
        }
      }
      const counting = rows.filter((x) => x.counts);
      if (counting.length < COLD) failures.push(`cold ${type} ${r}: only ${counting.length} counting trials (< ${COLD}) within ${CYCLE_CAP} launches - ask the owner for a quiet window`);
      report.cold[r][type] = {
        n: rows.length, counting: counting.length,
        worstMs: counting.length ? Math.max(...counting.map((x) => x.latencyMs)) : null,
        overCeiling: rows.filter((x) => x.latencyMs !== null && !x.counts), trials: rows,
      };
    }
  }
}

finish();

// Writes the records and exits; also the early stop (a profile mismatch, ten errored launches in a row), so a stopped
// run still leaves its rows and the live-profile check.
function finish() {
  if (liveBefore) {
    report.liveProfile = { path: LIVE_PROFILE, before: liveBefore, after: liveHashes() };
    if (JSON.stringify(report.liveProfile.before) !== JSON.stringify(report.liveProfile.after)) failures.push("live profile changed");
  }
  report.verdict = failures.length ? "FAIL" : "PASS";
  report.failures = failures;
  fs.mkdirSync(RECORDS_DIR, { recursive: true });
  if (want("warm") || want("cold")) fs.writeFileSync(path.join(RECORDS_DIR, "latency-e2e.json"), JSON.stringify(report, null, 2));
  if (want("session")) fs.writeFileSync(path.join(RECORDS_DIR, "recorded-output.json"), JSON.stringify({ generatedAt: report.generatedAt, host: report.host, minutes: MINUTES, sessions: report.sessions, runs: report.runs.filter((r) => r.label.startsWith("session")) }, null, 2));
  console.log(JSON.stringify({ verdict: report.verdict, failures, warm: Object.fromEntries(Object.entries(report.warm).map(([r, c]) => [r, Object.fromEntries(Object.entries(c).map(([t, v]) => [t, v?.worstMs ?? null]))])), cold: Object.fromEntries(Object.entries(report.cold).map(([r, c]) => [r, Object.fromEntries(Object.entries(c).map(([t, v]) => [t, v?.worstMs ?? null]))])), sessions: Object.fromEntries(Object.entries(report.sessions).map(([r, s]) => [r, s.verdict])) }, null, 1));
  process.exit(failures.length ? 1 : 0);
}
