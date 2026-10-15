import "./lib/app-icu-guard.mjs"; // P6b: refuse plain Node (exit 3)
// P0-5 Latency (one component of the Latency budget; ruling R3; charter choices T6, T7).
// Harness time = request -> first voiced PCM sample: generation (normalization, phonemization, synthesis,
// timing extraction) plus the leading silence before the first voiced 1 ms window (T6: RMS >= 1% of the
// chunk's peak 1 ms RMS). Warm: 20 trials per request type at 1.00x and 2.00x. Cold: 5 per type, each in
// a fresh process (model load included). Every trial is recorded; the worst is reported, never a mean.
// Writes docs/studies/narrate-rebuild-1/phase0/latency.json. Exit 0 only when every warm trial < 2000 ms,
// every cold trial < 8000 ms and generation outpaces playback at 2.00x; 1 otherwise.
// Never run while npm test or npm run build runs. Run from pwsh in the phase worktree:
//   node scripts/narrate-rebuild/p0-latency.mjs [--warm 20] [--cold 5] [--threads N] [--voice af_bella]
// --threads N sets onnxruntime's intra-op thread count (default: onnxruntime-node's own). Fewer trials than T7's
// 20/5 is a thread sweep and writes latency.sweep.threads-<N|default>.json instead of latency.json.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadRuntime, loadKokoro, attachCapture, synthesize, PHASE0_DIR, SAMPLE_RATE, EXPOSED_MODEL_ID } from "./lib/offline-kokoro.mjs";
import { envelope } from "./p0-acoustic.mjs";

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const WARM = Number(arg("--warm", 20)), COLD = Number(arg("--cold", 5)), THREADS = arg("--threads", null), VOICE = arg("--voice", "af_bella");
export const WARM_BUDGET_MS = 2000, COLD_BUDGET_MS = 8000, VOICED = 0.01; // R3, T6

// Request texts fixed before measurement (passage A, Casaubon). "speed-change" is the next word onward at the new speed.
export const REQUESTS = {
  play: "Of my grandfather Verus I have learned to be gentle and meek,",
  resume: "Of my mother I have learned to be religious, and bountiful;",
  "word-click": "not only to do, but to intend any evil;",
  "speed-change": "and to fly all such excess as is incidental to great wealth.",
};
const RATES = [1.0, 2.0];

export function firstVoicedMs(pcm) { const env = envelope(pcm); const peak = Math.max(...env); const thr = VOICED * peak; for (let i = 0; i < env.length; i++) if (env[i] >= thr) return i; return null; }
function cpuSnapshot() { const c = os.cpus(); let idle = 0, total = 0; for (const x of c) { idle += x.times.idle; for (const v of Object.values(x.times)) total += v; } return { idle, total }; }
const busyPct = (a, b) => +(100 * (1 - (b.idle - a.idle) / Math.max(1, b.total - a.total))).toFixed(1);

async function loadWithThreads(rt) {
  if (!THREADS) return loadKokoro(rt);
  const t0 = performance.now();
  const n = Number(THREADS);
  const model = await rt.tf.StyleTextToSpeech2Model.from_pretrained(EXPOSED_MODEL_ID, { dtype: "q4", device: "cpu", session_options: { intraOpNumThreads: n, interOpNumThreads: 1 } });
  const tokenizer = await rt.tf.AutoTokenizer.from_pretrained(EXPOSED_MODEL_ID);
  const tts = new rt.KokoroTTS(model, tokenizer);
  return { tts, loadMs: performance.now() - t0, dtype: "q4", device: "cpu" };
}

async function oneTrial(tts, cap, type, rate) {
  const before = cpuSnapshot();
  const t0 = performance.now();
  const rec = await synthesize(tts, cap, REQUESTS[type], { voice: VOICE, speed: rate });
  const genMs = performance.now() - t0;
  const leadMs = firstVoicedMs(rec.pcm);
  return { type, rate, genMs: +genMs.toFixed(1), leadMs, totalMs: +(genMs + (leadMs ?? 0)).toFixed(1), audioMs: +(rec.pcm.length / SAMPLE_RATE * 1000).toFixed(0), tokens: rec.ids.length, hostBusyPct: busyPct(before, cpuSnapshot()) };
}

// ---- cold child: fresh process, load + one generation --------------------------------------------------
if (process.argv.includes("--cold-child")) {
  const type = arg("--cold-child"), rate = Number(arg("--rate", "1.0"));
  const tStart = performance.now();
  const rt = loadRuntime();
  const { tts, loadMs } = await loadWithThreads(rt);
  const cap = attachCapture(tts, rt.ph);
  const trial = await oneTrial(tts, cap, type, rate);
  console.log(JSON.stringify({ ...trial, loadMs: +loadMs.toFixed(1), processToFirstVoicedMs: +(performance.now() - tStart + (trial.leadMs ?? 0)).toFixed(1) }));
  process.exit(0);
}

// ---- parent ---------------------------------------------------------------------------------------------
const rt = loadRuntime();
const { tts, loadMs } = await loadWithThreads(rt);
const cap = attachCapture(tts, rt.ph);
const result = { schema: "narrate-rebuild-1/phase0/latency@1", recordedAt: new Date().toISOString(), voice: VOICE, threads: THREADS ? Number(THREADS) : "onnxruntime-node default", host: rt.host, runtime: rt.versions, budgets: { warmMs: WARM_BUDGET_MS, coldMs: COLD_BUDGET_MS, voicedThreshold: VOICED }, requests: REQUESTS, parentLoadMs: +loadMs.toFixed(1), warm: [], cold: [], rtf: {} };

// warm-up is one untimed generation per rate, so "warm" means the voice and session are ready
for (const r of RATES) await synthesize(tts, cap, "Warm up.", { voice: VOICE, speed: r });
for (const type of Object.keys(REQUESTS)) for (const r of RATES) for (let k = 0; k < WARM; k++) {
  const t = await oneTrial(tts, cap, type, r); t.trial = k; result.warm.push(t);
  process.stdout.write(`warm ${type} ${r.toFixed(2)} #${k}: gen ${t.genMs} + lead ${t.leadMs} = ${t.totalMs} ms (audio ${t.audioMs} ms, host busy ${t.hostBusyPct}%)\n`);
}
const self = fileURLToPath(import.meta.url);
for (const type of Object.keys(REQUESTS)) for (let k = 0; k < COLD; k++) {
  const t0 = performance.now();
  const outp = execFileSync(process.execPath, [self, "--cold-child", type, "--rate", "1.0", "--voice", VOICE, ...(THREADS ? ["--threads", THREADS] : [])], { encoding: "utf8", maxBuffer: 1 << 24 });
  const wallMs = performance.now() - t0;
  const child = JSON.parse(outp.trim().split("\n").at(-1));
  const t = { ...child, trial: k, wallMs: +wallMs.toFixed(1), coldTotalMs: +(child.loadMs + child.genMs + (child.leadMs ?? 0)).toFixed(1) };
  result.cold.push(t);
  process.stdout.write(`cold ${type} #${k}: load ${t.loadMs} + gen ${t.genMs} + lead ${t.leadMs} = ${t.coldTotalMs} ms (process wall ${t.wallMs} ms)\n`);
}
// Real-time factor at the P0-3 rates from the generation tables (audio seconds per generation second).
for (const r of ["0.80", "1.00", "1.40", "2.00"]) {
  let audio = 0, gen = 0;
  for (const f of fs.readdirSync(path.join(PHASE0_DIR, "tables"))) { const t = JSON.parse(fs.readFileSync(path.join(PHASE0_DIR, "tables", f), "utf8")); for (const c of t.rates[r]?.chunks ?? []) if (!c.error) { audio += c.pcmSamples / SAMPLE_RATE; gen += c.genMs / 1000; } }
  result.rtf[r] = gen ? { audioSec: +audio.toFixed(1), genSec: +gen.toFixed(1), audioPerGenSecond: +(audio / gen).toFixed(2) } : null;
}
const worstWarm = result.warm.reduce((w, t) => (t.totalMs > (w?.totalMs ?? -1) ? t : w), null);
const worstCold = result.cold.reduce((w, t) => (t.coldTotalMs > (w?.coldTotalMs ?? -1) ? t : w), null);
result.checks = {
  everyWarmUnderBudget: result.warm.every((t) => t.totalMs < WARM_BUDGET_MS),
  everyColdUnderBudget: result.cold.every((t) => t.coldTotalMs < COLD_BUDGET_MS),
  generationOutpacesPlaybackAt2x: (result.rtf["2.00"]?.audioPerGenSecond ?? 0) > 1,
  worstWarm, worstCold,
  worstWarmByType: Object.fromEntries(Object.keys(REQUESTS).map((ty) => [ty, result.warm.filter((t) => t.type === ty).reduce((w, t) => (t.totalMs > (w?.totalMs ?? -1) ? t : w), null)])),
};
result.pass = result.checks.everyWarmUnderBudget && result.checks.everyColdUnderBudget && result.checks.generationOutpacesPlaybackAt2x;
// T7's counts (20 warm, 5 cold) are the measurement and own latency.json; anything smaller is a sweep over thread settings.
const SWEEP = WARM < 20 || COLD < 5;
fs.writeFileSync(path.join(PHASE0_DIR, SWEEP ? `latency.sweep.threads-${THREADS ?? "default"}.json` : "latency.json"), JSON.stringify(result, null, 1) + "\n");
console.log(JSON.stringify({ pass: result.pass, checks: { ...result.checks, worstWarm: worstWarm?.totalMs, worstCold: worstCold?.coldTotalMs }, rtf: result.rtf }));
process.exit(result.pass ? 0 : 1);
