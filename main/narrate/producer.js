"use strict";
// main/narrate/producer.js — main-thread wrapper of the rebuilt Narrate's producer (NARRATE-REBUILD-1 P3).
// Derives the duration-exposed model copy at first use (Decision #15; expose-durations.js), runs the worker
// (producer-worker.js) and resolves one promise per generate request. No cache is read or written (R10):
// every chunk is freshly generated. The models root is the app's own model cache unless NARRATE_MODELS_ROOT
// is set (this epic's gates and tests set it to the artifacts folder).

const { Worker } = require("worker_threads");
const path = require("path");
const { ensureExposedModel } = require("./expose-durations");
const C = require("./constants");

// A pool of NARRATE_PRODUCER_WORKERS workers (P5, Decision #17): a request goes to an idle worker, so a click or a
// speed change never waits behind the stale prefetch generation another worker is still finishing (onnxruntime
// cannot abort a run). The first worker gates readiness; the others load behind it and join when warm.
let workers = [], ready = false, loading = null, requestId = 0, lifecycle = 0, idleTimer = null;
const pending = new Map(); // id -> { resolve, reject, slot }
let status = { state: "idle", detail: null, modelsRoot: null, exposed: null, runtime: null };

function getModelsRoot() {
  const fromEnv = process.env[C.NARRATE_MODELS_ROOT_ENV];
  if (fromEnv) return fromEnv;
  const { app } = require("electron");
  return path.join(app.getPath("userData"), "models");
}

/** Decision #7's thread count, or the NARRATE_INTRA_OP_THREADS override ("default" = onnxruntime's own; this epic's checks use it). */
function getThreads() {
  const raw = process.env.NARRATE_INTRA_OP_THREADS;
  if (!raw) return C.NARRATE_INTRA_OP_THREADS;
  if (raw === "default") return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : C.NARRATE_INTRA_OP_THREADS;
}

function getPackagedModulePath() {
  try {
    const { app } = require("electron");
    return app.isPackaged ? path.join(process.resourcesPath, "app.asar.unpacked", "node_modules") : null;
  } catch { return null; }
}

function setStatus(patch) { status = { ...status, ...patch }; }

function failPending(err) {
  for (const [id, p] of pending) { pending.delete(id); p.reject(err); }
}

function dispose(reason) {
  const slots = workers; workers = [];
  for (const s of slots) s.w.terminate().catch(() => {});
  ready = false; loading = null;
  if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
  failPending(new Error(`narrate producer stopped: ${reason}`));
  setStatus({ state: "idle", detail: reason });
}

function touchIdle() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => dispose("idle unload"), C.NARRATE_IDLE_UNLOAD_MS);
  idleTimer.unref?.();
}

/** Start the worker (if needed) and resolve once the warm-up on the production path has completed. */
async function ensureReady() {
  if (ready) { touchIdle(); return status; }
  if (loading) return loading;
  const thisLifecycle = ++lifecycle;
  loading = (async () => {
    const modelsRoot = getModelsRoot();
    setStatus({ state: "deriving", detail: null, modelsRoot });
    const exposed = await ensureExposedModel({
      modelsRoot, originalId: C.NARRATE_ORIGINAL_MODEL_ID, exposedId: C.NARRATE_EXPOSED_MODEL_ID, modelFile: C.NARRATE_MODEL_FILE,
      tensor: C.NARRATE_DURATION_TENSOR, elemType: C.NARRATE_DURATION_ELEM_TYPE,
      originalSha256: C.NARRATE_PINNED_MODEL_SHA256, exposedSha256: C.NARRATE_EXPOSED_MODEL_SHA256,
    });
    if (thisLifecycle !== lifecycle) throw new Error("narrate producer restarted during load");
    setStatus({ state: "loading", exposed });
    const runtime = await startWorker(modelsRoot, true);
    ready = true;
    setStatus({ state: "ready", runtime });
    for (let i = 1; i < C.NARRATE_PRODUCER_WORKERS; i++) {
      startWorker(modelsRoot, false).catch((err) => console.warn("[narrate] extra producer worker not started:", err.message));
    }
    touchIdle();
    return status;
  })();
  try { return await loading; } catch (err) { dispose(err.message); throw err; } finally { loading = null; }
}

/** One worker; resolves with its runtime once its model is loaded and warmed up on the production path. */
function startWorker(modelsRoot, primary) {
  const slot = { w: new Worker(path.join(__dirname, "producer-worker.js")), ready: false, busy: 0 };
  workers.push(slot);
  const { w } = slot;
  // A ready or primary worker failing stops the producer (its requests fail closed); an extra one still loading just leaves.
  const lost = (reason) => {
    if (!workers.includes(slot)) return;
    if (primary || slot.ready) dispose(reason);
    else { workers = workers.filter((s) => s !== slot); w.terminate().catch(() => {}); }
  };
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { reject(new Error("narrate producer load timed out")); lost("load timed out"); }, C.NARRATE_LOAD_TIMEOUT_MS);
    w.on("message", (msg) => {
      switch (msg.type) {
        case "model-ready": clearTimeout(timer); slot.ready = true; resolve(msg.runtime); break;
        case "load-error": clearTimeout(timer); reject(new Error(msg.error)); lost(`load error: ${msg.error}`); break;
        case "result": { const p = pending.get(msg.id); if (!p) break; pending.delete(msg.id); slot.busy -= 1; if (msg.error) p.reject(new Error(msg.error)); else p.resolve({ table: msg.table, pcm: msg.pcm, sampleRate: msg.sampleRate, genMs: msg.genMs }); break; }
        default: break;
      }
    });
    w.on("error", (err) => { clearTimeout(timer); reject(err); lost(`worker error: ${err.message}`); });
    w.on("exit", (code) => { clearTimeout(timer); reject(new Error(`worker exited (${code})`)); lost(`worker exited (${code})`); });
    w.postMessage({ type: "load", modelsRoot, modulePath: getPackagedModulePath(), threads: getThreads() });
  });
}

/** Generate one chunk: { table, pcm: Float32Array, sampleRate, genMs }. Rejects on any producer failure. */
async function generate(text, { voice = C.NARRATE_DEFAULT_VOICE, speed = 1.0 } = {}) {
  await ensureReady();
  touchIdle();
  const id = ++requestId;
  // The least busy ready worker: an idle one when any is idle.
  const slot = workers.filter((s) => s.ready).reduce((a, b) => (b.busy < a.busy ? b : a));
  slot.busy += 1;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, slot });
    slot.w.postMessage({ type: "generate", id, text, voice, speed });
  });
}

function getStatus() { return { ...status, ready, pending: pending.size, workersReady: workers.filter((w) => w.ready).length }; }
function shutdown() { dispose("shutdown"); }

module.exports = { ensureReady, generate, getStatus, shutdown, getModelsRoot };
