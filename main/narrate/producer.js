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
let slotCount = 0;
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
  for (const job of queue.splice(0)) job.reject(err);
}

/** Ask a worker to finish what it is running and exit; terminate it only if it has not exited by the deadline. */
function stopWorker(w) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => { w.terminate().catch(() => {}).finally(resolve); }, C.NARRATE_STOP_TIMEOUT_MS);
    w.once("exit", () => { clearTimeout(timer); resolve(); });
    try { w.postMessage({ type: "stop" }); } catch { clearTimeout(timer); resolve(); }
  });
}

/** Stop every worker (gracefully, or at once after a worker error) and fail what is pending. Resolves when all have exited. */
function dispose(reason, graceful = false) {
  const slots = workers; workers = [];
  const stopped = Promise.all(slots.map((s) => (graceful ? stopWorker(s.w) : s.w.terminate().catch(() => {}))));
  ready = false; loading = null;
  if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
  failPending(new Error(`narrate producer stopped: ${reason}`));
  setStatus({ state: "idle", detail: reason });
  return stopped;
}

function touchIdle() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { dispose("idle unload", true); }, C.NARRATE_IDLE_UNLOAD_MS);
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
  const slot = { w: new Worker(path.join(__dirname, "producer-worker.js")), ready: false, busy: 0, index: ++slotCount };
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
        case "model-ready": clearTimeout(timer); slot.ready = true; resolve(msg.runtime); dispatch(); break;
        case "load-error": clearTimeout(timer); reject(new Error(msg.error)); lost(`load error: ${msg.error}`); break;
        case "lag": plog("lag", `w${slot.index}`, msg.ms, "ms", "gen", msg.genMs, "free", msg.freeMs, msg.mem); break;
        case "result": { plog("result", msg.id, `w${slot.index}`, msg.error ? "error " + msg.error : `gen ${msg.genMs}`); const p = pending.get(msg.id); if (!p) break; pending.delete(msg.id); slot.busy -= 1; if (msg.error) p.reject(new Error(msg.error)); else p.resolve({ table: msg.table, pcm: msg.pcm, sampleRate: msg.sampleRate, genMs: msg.genMs, worker: slot.index, busyAtAssign: p.busyAtAssign, stages: { queued: p.queued, posted: p.posted, ...(msg.stages ?? {}), received: performance.timeOrigin + performance.now() } }); dispatch(); break; }
        default: break;
      }
    });
    w.on("error", (err) => { clearTimeout(timer); reject(err); lost(`worker error: ${err.message}`); });
    w.on("exit", (code) => { clearTimeout(timer); reject(new Error(`worker exited (${code})`)); lost(`worker exited (${code})`); });
    w.postMessage({ type: "load", modelsRoot, modulePath: getPackagedModulePath(), threads: getThreads() });
  });
}

/** Generate one chunk: { table, pcm: Float32Array, sampleRate, genMs }. Rejects on any producer failure. */
// Jobs not yet posted to a worker (Decision #18): a worker runs one generation at a time, and only idle workers take
// jobs, so nothing ever queues inside a worker behind work that cannot be aborted.
const queue = [];
const epochNow = () => performance.timeOrigin + performance.now();
// Diagnostics (NARRATE_PRODUCER_LOG=1 only): every post and result per worker, stale ones included, and worker stalls.
const plog = process.env.NARRATE_PRODUCER_LOG === "1" ? (...a) => console.log("[narrate-producer]", Math.round(epochNow()), ...a) : () => {};
if (process.env.NARRATE_PRODUCER_LOG === "1") {
  // The main thread's own stalls, to tell a process-wide freeze from a worker-only one.
  let last = epochNow();
  setInterval(() => {
    const now = epochNow();
    if (now - last > 250) { const m = process.memoryUsage(); plog("lag", "main", Math.round(now - last - 50), "ms", `rss ${Math.round(m.rss / 1048576)} heap ${Math.round(m.heapUsed / 1048576)}`); }
    last = now;
  }, 50).unref();
}

/**
 * Post queued jobs to idle workers. A request takes any idle worker; a prefetch takes one only while
 * NARRATE_RESERVED_WORKERS others stay idle for the next request (all of them when fewer are ready).
 */
function dispatch() {
  for (let i = 0; i < queue.length;) {
    const idle = workers.filter((s) => s.ready && s.busy === 0);
    const readyCount = workers.filter((s) => s.ready).length;
    const job = queue[i];
    const need = job.priority === "prefetch" ? Math.min(1 + C.NARRATE_RESERVED_WORKERS, readyCount) : 1;
    if (idle.length < need || idle.length === 0) { i += 1; continue; }
    queue.splice(i, 1);
    const slot = idle[0];
    // D6 analysis: what the pool was running when the job was posted, and how long it waited for a worker.
    const busyAtAssign = { worker: slot.busy, pool: workers.reduce((n, s) => n + s.busy, 0), workers: readyCount };
    slot.busy += 1;
    const posted = epochNow();
    pending.set(job.id, { resolve: job.resolve, reject: job.reject, slot, busyAtAssign, posted, queued: job.queued });
    plog("post", job.id, `w${slot.index}`, job.priority, job.group, job.text.split(" ").length, "words", `busy ${JSON.stringify(busyAtAssign)}`);
    slot.w.postMessage({ type: "generate", id: job.id, text: job.text, voice: job.voice, speed: job.speed });
  }
}

/**
 * Generate one chunk: { table, pcm: Float32Array, sampleRate, genMs }. Rejects on any producer failure. priority:
 * "request" (the first chunk after a Play, click, resume or speed change) or "prefetch"; a request drops every queued,
 * not yet started prefetch of another group (an engine epoch), which rejects with "superseded".
 */
async function generate(text, { voice = C.NARRATE_DEFAULT_VOICE, speed = 1.0, priority = "request", group = null } = {}) {
  await ensureReady();
  touchIdle();
  if (priority === "request" && group !== null) {
    for (let i = queue.length - 1; i >= 0; i--) {
      if (queue[i].priority === "prefetch" && queue[i].group !== group) queue.splice(i, 1)[0].reject(new Error("narrate generation superseded"));
    }
  }
  return new Promise((resolve, reject) => {
    queue.push({ id: ++requestId, text, voice, speed, priority, group, resolve, reject, queued: epochNow() });
    dispatch();
  });
}

function getStatus() { return { ...status, ready, pending: pending.size + queue.length, workersReady: workers.filter((w) => w.ready).length }; }
/** Resolves once every worker has exited (before the process may exit: see stopWorker). */
function shutdown() { return dispose("shutdown", true); }

module.exports = { ensureReady, generate, getStatus, shutdown, getModelsRoot };
