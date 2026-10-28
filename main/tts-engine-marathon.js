// main/tts-engine-marathon.js — Marathon TTS worker (NAR-5: background caching)
// Independent worker thread for background cache generation.
// Runs same tts-worker.js but with no idle timeout and no loading UI callbacks.
// Stays warm while any book is open. Sprint worker handles real-time playback.

const { Worker } = require("worker_threads");
const path = require("path");
const fs = require("fs/promises");
const { KOKORO_SAMPLE_RATE, TTS_MODEL_LOAD_TIMEOUT_MS } = require("./constants");

let marathonWorker = null;
let marathonModelReady = false;
let marathonLoadingPromise = null;
let marathonLoadingState = null;
let marathonRequestId = 0;
const marathonPending = new Map(); // id → { resolve, reject, owner }
let crashCount = 0;
const MAX_CRASH_RETRIES = 2;
const CRASH_BACKOFF_MS = 1000;
let marathonRetryTimer = null;
let marathonLifecycle = 0;
const expectedWorkerStops = new WeakSet();
const handledWorkerFailures = new WeakSet();

const SAMPLE_RATE = KOKORO_SAMPLE_RATE;

function toEngineError(err, meta = {}) {
  const engineError = err instanceof Error ? err : new Error(String(err || "Kokoro marathon engine error"));
  if (meta.reason !== undefined) engineError.reason = meta.reason;
  if (meta.recoverable !== undefined) engineError.recoverable = meta.recoverable;
  if (meta.status !== undefined) engineError.status = meta.status;
  return engineError;
}

function markWorkerStopExpected(targetWorker) {
  if (targetWorker) expectedWorkerStops.add(targetWorker);
}

function clearRetryTimer() {
  if (!marathonRetryTimer) return;
  clearTimeout(marathonRetryTimer);
  marathonRetryTimer = null;
}

function rejectLoadingForWorker(targetWorker, err) {
  if (marathonLoadingState?.owner !== targetWorker) return;
  marathonLoadingState.settle(err);
}

function rejectCurrentLoading(err) {
  if (!marathonLoadingState) return;
  marathonLoadingState.settle(err);
}

function rejectPendingForWorker(targetWorker, err) {
  for (const [id, request] of marathonPending) {
    if (request.owner !== targetWorker) continue;
    marathonPending.delete(id);
    request.reject(err);
  }
}

function rejectAllPending(err) {
  for (const [id, request] of marathonPending) {
    marathonPending.delete(id);
    request.reject(err);
  }
}

function disposeMarathonWorker(targetWorker, terminate = false) {
  if (terminate && targetWorker) {
    markWorkerStopExpected(targetWorker);
    try {
      targetWorker.terminate();
    } catch { /* non-fatal */ }
  }
  if (marathonWorker === targetWorker) {
    marathonWorker = null;
    marathonModelReady = false;
    marathonLoadingPromise = null;
    if (marathonLoadingState?.owner === targetWorker) {
      marathonLoadingState = null;
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
  console.error(`[kokoro-marathon] Worker crashed (attempt ${crashCount + 1}/${MAX_CRASH_RETRIES + 1}):`, crashError.message);

  rejectLoadingForWorker(targetWorker, crashError);
  rejectPendingForWorker(targetWorker, crashError);
  disposeMarathonWorker(targetWorker);

  if (willRetry) {
    crashCount++;
    const backoff = CRASH_BACKOFF_MS * crashCount;
    const retryLifecycle = marathonLifecycle;
    console.log(`[kokoro-marathon] Retrying worker in ${backoff}ms...`);
    clearRetryTimer();
    marathonRetryTimer = setTimeout(() => {
      marathonRetryTimer = null;
      if (retryLifecycle !== marathonLifecycle) return;
      ensureReady().catch((retryErr) => {
        console.error("[kokoro-marathon] Retry failed:", retryErr.message);
      });
    }, backoff);
    return;
  }

  crashCount = 0;
}

function getMarathonWorker(cacheDir) {
  if (marathonWorker) return marathonWorker;
  const { app } = require("electron");
  const workerOpts = {};
  if (app.isPackaged) {
    const unpackedModules = path.join(process.resourcesPath, "app.asar.unpacked", "node_modules");
    workerOpts.workerData = { modulePath: unpackedModules };
    workerOpts.env = { ...process.env, NODE_PATH: unpackedModules };
  }
  const currentWorker = new Worker(path.join(__dirname, "tts-worker.js"), workerOpts);
  marathonWorker = currentWorker;

  currentWorker.on("message", (msg) => {
    switch (msg.type) {
      case "model-loaded":
        // Informational only: marathon generation still waits for `model-ready`.
        break;
      case "model-ready":
        marathonModelReady = true;
        crashCount = 0;
        clearRetryTimer();
        break;
      case "warm-up-done":
        break;
      case "warm-up-failed":
        console.error("[kokoro-marathon] Warm-up inference failed:", msg.error);
        disposeMarathonWorker(currentWorker, true);
        break;
      case "load-error":
        console.error("[kokoro-marathon] Worker load failed:", msg.error);
        disposeMarathonWorker(currentWorker, true);
        break;
      case "result": {
        const p = marathonPending.get(msg.id);
        if (p) {
          marathonPending.delete(msg.id);
          if (msg.error) p.reject(new Error(msg.error));
          else p.resolve({ audio: msg.audio, sampleRate: msg.sampleRate, durationMs: msg.durationMs });
        }
        break;
      }
      case "voices": {
        const p = marathonPending.get(msg.id);
        if (p) {
          marathonPending.delete(msg.id);
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

  currentWorker.postMessage({ type: "load", cacheDir });
  return currentWorker;
}

async function ensureReady() {
  if (marathonModelReady) return;
  if (marathonLoadingPromise) return marathonLoadingPromise;

  try {
    const { app } = require("electron");
    const cacheDir = path.join(app.getPath("userData"), "models");
    await fs.mkdir(cacheDir, { recursive: true });

    const w = getMarathonWorker(cacheDir);

    marathonLoadingPromise = new Promise((resolve, reject) => {
      let settled = false;
      const handler = (msg) => {
        if (msg.type === "model-ready") {
          settle();
        } else if (msg.type === "load-error") {
          settle(toEngineError(msg.error || "Marathon model load failed", {
            reason: "load-error",
            recoverable: false,
            status: "error",
          }));
        } else if (msg.type === "warm-up-failed") {
          settle(toEngineError(msg.error ? `Marathon warm-up failed: ${msg.error}` : "Marathon warm-up failed", {
            reason: "warm-up-failed",
            recoverable: false,
            status: "error",
          }));
        }
      };
      const timer = setTimeout(() => {
        settle(toEngineError("Marathon model load timed out", {
          reason: "load-timeout",
          recoverable: false,
          status: "error",
        }));
      }, TTS_MODEL_LOAD_TIMEOUT_MS);

      function cleanup() {
        w.off("message", handler);
        clearTimeout(timer);
        if (marathonLoadingState?.owner === w) {
          marathonLoadingState = null;
        }
      }

      function settle(err) {
        if (settled) return;
        settled = true;
        cleanup();
        if (err) reject(err);
        else resolve();
      }

      marathonLoadingState = { owner: w, settle };
      w.on("message", handler);
    });

    await marathonLoadingPromise;
  } catch (err) {
    marathonLoadingPromise = null;
    throw err;
  }
}

async function generate(text, voice = "af_bella", speed = 1.0) {
  if (!marathonModelReady) await ensureReady();

  const id = ++marathonRequestId;
  return new Promise((resolve, reject) => {
    const requestWorker = marathonWorker;
    if (!requestWorker) {
      reject(toEngineError("Marathon engine unavailable", {
        reason: "shutdown",
        recoverable: false,
        status: "idle",
      }));
      return;
    }
    marathonPending.set(id, { resolve, reject, owner: requestWorker });
    requestWorker.postMessage({ type: "generate", id, text, voice, speed });
  });
}

function isModelReady() { return marathonModelReady; }

async function preload() {
  await ensureReady();
}

function shutdown() {
  const shutdownError = toEngineError("Marathon engine shut down", {
    reason: "shutdown",
    recoverable: false,
    status: "idle",
  });
  const targetWorker = marathonWorker;

  marathonLifecycle++;
  clearRetryTimer();
  crashCount = 0;

  rejectCurrentLoading(shutdownError);
  rejectAllPending(shutdownError);
  disposeMarathonWorker(targetWorker, true);

  marathonModelReady = false;
  marathonLoadingPromise = null;
  marathonLoadingState = null;
}

module.exports = { generate, preload, isModelReady, shutdown, SAMPLE_RATE };
