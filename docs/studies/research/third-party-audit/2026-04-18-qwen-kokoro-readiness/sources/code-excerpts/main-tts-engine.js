// main/tts-engine.js — Kokoro TTS engine (worker thread wrapper)
// All inference runs in a worker thread so the main Electron process never blocks.

const { Worker } = require("worker_threads");
const path = require("path");
const fs = require("fs/promises");
const { KOKORO_SAMPLE_RATE, TTS_IDLE_TIMEOUT_MS, TTS_MODEL_LOAD_TIMEOUT_MS } = require("./constants");

let worker = null;
let modelReady = false;
let loadingPromise = null;
let loadingState = null;
let requestId = 0;
const pending = new Map(); // id → { resolve, reject, owner }
let crashCount = 0;
const MAX_CRASH_RETRIES = 2;
const CRASH_BACKOFF_MS = 1000;
let retryTimer = null;
let workerLifecycle = 0;
const expectedWorkerStops = new WeakSet();
const handledWorkerFailures = new WeakSet();
let loadingSignalActive = false;
let engineStatusSnapshot = {
  status: "idle",
  detail: null,
  reason: null,
  ready: false,
  loading: false,
  recoverable: false,
};

// Progress/status callbacks
let onProgressCb = null;
let onLoadingCb = null;

const SAMPLE_RATE = KOKORO_SAMPLE_RATE;

// Idle unload timer — terminate worker after inactivity
let idleTimer = null;
const IDLE_TIMEOUT_MS = TTS_IDLE_TIMEOUT_MS;

function clearRetryTimer() {
  if (!retryTimer) return;
  clearTimeout(retryTimer);
  retryTimer = null;
}

function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (worker) {
      workerLifecycle++;
      clearRetryTimer();
      markWorkerStopExpected(worker);
      worker.terminate();
      worker = null;
      modelReady = false;
      loadingPromise = null;
      loadingState = null;
      setLoadingSignal(false, { notify: false });
      sendEngineStatus("idle");
    }
  }, IDLE_TIMEOUT_MS);
}

/**
 * Unified engine status: "warming" | "ready" | "retrying" | "error"
 * Sent on every meaningful lifecycle transition so the renderer sees one event stream.
 */
function toEngineError(err, meta = {}) {
  const engineError = err instanceof Error ? err : new Error(String(err || "Kokoro engine error"));
  if (meta.reason !== undefined) engineError.reason = meta.reason;
  if (meta.recoverable !== undefined) engineError.recoverable = meta.recoverable;
  if (meta.status !== undefined) engineError.status = meta.status;
  return engineError;
}

function emitRendererError(message) {
  try {
    const { BrowserWindow } = require("electron");
    const win = BrowserWindow.getAllWindows()[0];
    if (win && !win.isDestroyed()) {
      win.webContents.send("tts-kokoro-download-error", message);
    }
  } catch { /* non-fatal */ }
}

function setLoadingSignal(loading, { notify = true } = {}) {
  if (loadingSignalActive === loading) return;
  loadingSignalActive = loading;
  if (notify && onLoadingCb) onLoadingCb(loading);
}

function sendEngineStatus(status, detail, options = {}) {
  const next = {
    status,
    detail: detail || null,
    reason: options.reason || null,
    ready: status === "ready",
    loading: status === "warming" || status === "retrying",
    recoverable: Boolean(options.recoverable),
  };
  const changed =
    engineStatusSnapshot.status !== next.status ||
    engineStatusSnapshot.detail !== next.detail ||
    engineStatusSnapshot.reason !== next.reason ||
    engineStatusSnapshot.ready !== next.ready ||
    engineStatusSnapshot.loading !== next.loading ||
    engineStatusSnapshot.recoverable !== next.recoverable;
  engineStatusSnapshot = next;
  if (!changed) return;

  try {
    const { BrowserWindow } = require("electron");
    const win = BrowserWindow.getAllWindows()[0];
    if (win && !win.isDestroyed()) {
      win.webContents.send("tts-kokoro-engine-status", next);
    }
  } catch { /* non-fatal */ }
}

function markWorkerStopExpected(targetWorker) {
  if (targetWorker) expectedWorkerStops.add(targetWorker);
}

function rejectLoadingForWorker(targetWorker, err) {
  if (loadingState?.owner !== targetWorker) return;
  loadingState.settle(err);
}

function rejectPendingForWorker(targetWorker, err) {
  for (const [id, request] of pending) {
    if (request.owner !== targetWorker) continue;
    pending.delete(id);
    request.reject(err);
  }
}

function disposeWorker(targetWorker, terminate = false) {
  if (terminate && targetWorker) {
    markWorkerStopExpected(targetWorker);
    try {
      targetWorker.terminate();
    } catch { /* non-fatal */ }
  }
  if (worker === targetWorker) {
    worker = null;
    modelReady = false;
    loadingPromise = null;
    setLoadingSignal(false, { notify: false });
    if (loadingState?.owner === targetWorker) {
      loadingState = null;
    }
  }
}

function handleWorkerFailure(targetWorker, err) {
  if (!targetWorker || handledWorkerFailures.has(targetWorker)) return;
  handledWorkerFailures.add(targetWorker);

  const willRetry = crashCount < MAX_CRASH_RETRIES;
  const crashError = toEngineError(err, {
    reason: willRetry ? "worker-crash-retrying" : "worker-crash-exhausted",
    recoverable: willRetry,
    status: willRetry ? "retrying" : "error",
  });
  console.error(`[kokoro] Worker crashed (attempt ${crashCount + 1}/${MAX_CRASH_RETRIES + 1}):`, crashError.message);

  // Anything owned by the dead worker fails now; future calls can recover on a fresh worker.
  rejectLoadingForWorker(targetWorker, crashError);
  rejectPendingForWorker(targetWorker, crashError);
  disposeWorker(targetWorker);

  if (willRetry) {
    crashCount++;
    const backoff = CRASH_BACKOFF_MS * crashCount;
    const retryLifecycle = workerLifecycle;
    console.log(`[kokoro] Retrying worker in ${backoff}ms...`);
    setLoadingSignal(true);
    sendEngineStatus("retrying", `Attempt ${crashCount + 1}/${MAX_CRASH_RETRIES + 1}`, {
      reason: "worker-crash-retrying",
      recoverable: true,
    });
    clearRetryTimer();
    retryTimer = setTimeout(() => {
      retryTimer = null;
      if (retryLifecycle !== workerLifecycle || worker || modelReady || loadingPromise) return;
      sendEngineStatus("warming", "Retrying Kokoro worker", {
        reason: "worker-crash-retrying",
        recoverable: true,
      });
      ensureReady(onProgressCb).catch((retryErr) => {
        console.error("[kokoro] Retry failed:", retryErr.message);
      });
    }, backoff);
    return;
  }

  crashCount = 0;
  sendEngineStatus("error", `TTS worker crashed after ${MAX_CRASH_RETRIES + 1} attempts: ${crashError.message}`, {
    reason: "worker-crash-exhausted",
    recoverable: false,
  });
  emitRendererError(`TTS worker crashed after ${MAX_CRASH_RETRIES + 1} attempts: ${crashError.message}`);
}

function getWorker(cacheDir) {
  if (worker) return worker;
  workerLifecycle++;
  clearRetryTimer();
  const { app } = require("electron");
  const workerOpts = {};
  if (app.isPackaged) {
    // In packaged app, unpacked modules live in app.asar.unpacked/node_modules/
    const unpackedModules = path.join(process.resourcesPath, "app.asar.unpacked", "node_modules");
    workerOpts.workerData = { modulePath: unpackedModules };
    workerOpts.env = { ...process.env, NODE_PATH: unpackedModules };
  }
  const currentWorker = new Worker(path.join(__dirname, "tts-worker.js"), workerOpts);
  worker = currentWorker;

  currentWorker.on("message", (msg) => {
    switch (msg.type) {
      case "progress":
        if (onProgressCb) onProgressCb(msg.value);
        break;
      case "model-loaded":
        // Informational only: the worker has constructed Kokoro, but synthesis is still gated on `model-ready`.
        sendEngineStatus("warming", "Model loaded; running Kokoro warm-up");
        break;
      case "model-ready":
        modelReady = true;
        crashCount = 0; // Reset crash counter on successful load
        clearRetryTimer();
        setLoadingSignal(false);
        sendEngineStatus("ready");
        break;
      case "warm-up-done":
        // Model fully primed
        break;
      case "arm-cpuinfo-warning":
        console.log("[kokoro] ARM cpuinfo warning (non-fatal):", msg.warning);
        break;
      case "warm-up-failed":
        // Warm-up inference failed — model loaded but inference may not work.
        // Surface to renderer so it can fall back to Web Speech proactively.
        console.error("[kokoro] Warm-up inference failed:", msg.error);
        sendEngineStatus("error", `Kokoro warm-up failed: ${msg.error}`, {
          reason: "warm-up-failed",
          recoverable: false,
        });
        emitRendererError(`Kokoro TTS warm-up failed: ${msg.error}. Using system voice instead.`);
        disposeWorker(currentWorker, true);
        break;
      case "load-error":
        console.error("[kokoro] Worker load failed:", msg.error);
        if (msg.stack) console.error("[kokoro] Stack:", msg.stack);
        sendEngineStatus("error", msg.error || "Kokoro model load failed", {
          reason: "load-error",
          recoverable: false,
        });
        emitRendererError(msg.error || "Kokoro model load failed");
        disposeWorker(currentWorker, true);
        break;
      case "result": {
        const p = pending.get(msg.id);
        if (p) {
          pending.delete(msg.id);
          if (msg.error) p.reject(new Error(msg.error));
          else p.resolve({ audio: msg.audio, sampleRate: msg.sampleRate, durationMs: msg.durationMs, wordTimestamps: msg.wordTimestamps || null });
        }
        break;
      }
      case "voices": {
        const p = pending.get(msg.id);
        if (p) {
          pending.delete(msg.id);
          p.resolve(msg.voices || []);
        }
        break;
      }
    }
  });

  currentWorker.on("error", (err) => {
    handleWorkerFailure(currentWorker, err);
  });

  currentWorker.on("exit", (code) => {
    if (expectedWorkerStops.has(currentWorker) || handledWorkerFailures.has(currentWorker)) {
      expectedWorkerStops.delete(currentWorker);
      return;
    }
    const reason = code === 0 ? "Worker exited unexpectedly" : `Worker exited with code ${code}`;
    handleWorkerFailure(currentWorker, new Error(reason));
  });

  // Start loading model in the worker
  currentWorker.postMessage({ type: "load", cacheDir });
  return currentWorker;
}

/**
 * Ensure the worker is started and model is loading/loaded.
 * @param {(progress: number) => void} [onProgress]
 * @returns {Promise<void>}
 */
async function ensureReady(onProgress) {
  if (modelReady) { resetIdleTimer(); return; }
  if (loadingPromise) return loadingPromise;

  onProgressCb = onProgress || null;

  try {
    const { app } = require("electron");
    const cacheDir = path.join(app.getPath("userData"), "models");
    await fs.mkdir(cacheDir, { recursive: true });

    setLoadingSignal(true);
    sendEngineStatus("warming", "Loading Kokoro model");
    const w = getWorker(cacheDir);

    // Bootstrap only resolves once synthesis is safe. `model-loaded` is informational;
    // `model-ready` is the sole readiness gate.
    loadingPromise = new Promise((resolve, reject) => {
      let settled = false;
      const handler = (msg) => {
        if (msg.type === "model-ready") {
          settle();
        } else if (msg.type === "load-error") {
          settle(toEngineError(msg.error || "Kokoro model load failed", {
            reason: "load-error",
            recoverable: false,
            status: "error",
          }));
        } else if (msg.type === "warm-up-failed") {
          settle(toEngineError(msg.error ? `Kokoro warm-up failed: ${msg.error}` : "Kokoro warm-up failed", {
            reason: "warm-up-failed",
            recoverable: false,
            status: "error",
          }));
        }
      };
      const timer = setTimeout(() => {
        settle(toEngineError("Kokoro model load timed out", {
          reason: "load-timeout",
          recoverable: false,
          status: "error",
        }));
      }, TTS_MODEL_LOAD_TIMEOUT_MS);

      function cleanup() {
        w.off("message", handler);
        clearTimeout(timer);
        if (loadingState?.owner === w) {
          loadingState = null;
        }
      }

      function settle(err) {
        if (settled) return;
        settled = true;
        cleanup();
        if (err) reject(err);
        else resolve();
      }

      loadingState = { owner: w, settle };
      w.on("message", handler);
    });

    await loadingPromise;
  } catch (err) {
    loadingPromise = null;
    if (err?.reason === "load-timeout") {
      sendEngineStatus("error", err.message, {
        reason: "load-timeout",
        recoverable: false,
      });
      emitRendererError(err.message);
      disposeWorker(worker, true);
    }
    throw err;
  }
}

/**
 * Generate speech audio for text. Runs in worker thread — never blocks main.
 */
async function generate(text, voice = "af_bella", speed = 1.0, words = null) {
  if (!modelReady) await ensureReady();
  resetIdleTimer();

  const id = ++requestId;
  return new Promise((resolve, reject) => {
    const requestWorker = worker;
    pending.set(id, { resolve, reject, owner: requestWorker });
    requestWorker.postMessage({ type: "generate", id, text, voice, speed, words });
  });
}

/**
 * List available Kokoro voices.
 */
async function listVoices() {
  if (!modelReady) await ensureReady();
  const id = ++requestId;
  return new Promise((resolve, reject) => {
    const requestWorker = worker;
    pending.set(id, { resolve, reject, owner: requestWorker });
    requestWorker.postMessage({ type: "list-voices", id });
  });
}

function isModelReady() { return modelReady; }
function getModelStatus() { return { ...engineStatusSnapshot }; }

async function downloadModel(onProgress) {
  await ensureReady(onProgress);
}

/**
 * Pre-load model (call when reader opens, before user hits N).
 */
async function preload() {
  await ensureReady();
}

/**
 * Set loading state callback (for UI notification).
 */
function setLoadingCallback(cb) { onLoadingCb = cb; }

module.exports = { generate, listVoices, isModelReady, getModelStatus, downloadModel, preload, setLoadingCallback, SAMPLE_RATE };
