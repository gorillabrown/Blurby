// main/tts-engine.js — Kokoro TTS engine (worker thread wrapper)
// All inference runs in a worker thread so the main Electron process never blocks.

const { Worker } = require("worker_threads");
const path = require("path");
const fs = require("fs/promises");
const { KOKORO_SAMPLE_RATE, TTS_IDLE_TIMEOUT_MS, TTS_MODEL_LOAD_TIMEOUT_MS } = require("./constants");

let worker = null;
let modelReady = false;
let loadingPromise = null;
let requestId = 0;
const pending = new Map(); // id → { resolve, reject }
let crashCount = 0;
const MAX_CRASH_RETRIES = 2;
const CRASH_BACKOFF_MS = 1000;

// Progress/status callbacks
let onProgressCb = null;
let onLoadingCb = null;

const SAMPLE_RATE = KOKORO_SAMPLE_RATE;

// Idle unload timer — terminate worker after inactivity
let idleTimer = null;
const IDLE_TIMEOUT_MS = TTS_IDLE_TIMEOUT_MS;

function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (worker) {
      worker.terminate();
      worker = null;
      modelReady = false;
      loadingPromise = null;
    }
  }, IDLE_TIMEOUT_MS);
}

/**
 * Unified engine status: "warming" | "ready" | "retrying" | "error"
 * Sent on every meaningful lifecycle transition so the renderer sees one event stream.
 */
function sendEngineStatus(status, detail) {
  try {
    const { BrowserWindow } = require("electron");
    const win = BrowserWindow.getAllWindows()[0];
    if (win && !win.isDestroyed()) {
      win.webContents.send("tts-kokoro-engine-status", { status, detail: detail || null });
    }
  } catch { /* non-fatal */ }
}

/** Notify renderer that Kokoro is loading (used after idle timeout re-warm). */
function sendLoadingSignal(loading) {
  if (onLoadingCb) onLoadingCb(loading);
  sendEngineStatus(loading ? "warming" : "ready");
  try {
    const { BrowserWindow } = require("electron");
    const win = BrowserWindow.getAllWindows()[0];
    if (win && !win.isDestroyed()) {
      win.webContents.send("tts-kokoro-loading", loading);
    }
  } catch { /* non-fatal */ }
}

function getWorker(cacheDir) {
  if (worker) return worker;
  const { app } = require("electron");
  const workerOpts = {};
  if (app.isPackaged) {
    // In packaged app, unpacked modules live in app.asar.unpacked/node_modules/
    const unpackedModules = path.join(process.resourcesPath, "app.asar.unpacked", "node_modules");
    workerOpts.workerData = { modulePath: unpackedModules };
    workerOpts.env = { ...process.env, NODE_PATH: unpackedModules };
  }
  worker = new Worker(path.join(__dirname, "tts-worker.js"), workerOpts);

  worker.on("message", (msg) => {
    switch (msg.type) {
      case "progress":
        if (onProgressCb) onProgressCb(msg.value);
        break;
      case "model-ready":
        modelReady = true;
        crashCount = 0; // Reset crash counter on successful load
        if (onLoadingCb) onLoadingCb(false);
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
        {
          const { BrowserWindow } = require("electron");
          const win = BrowserWindow.getAllWindows()[0];
          if (win && !win.isDestroyed()) {
            win.webContents.send("tts-kokoro-download-error", `Kokoro TTS warm-up failed: ${msg.error}. Using system voice instead.`);
          }
        }
        break;
      case "load-error":
        console.error("[kokoro] Worker load failed:", msg.error);
        if (msg.stack) console.error("[kokoro] Stack:", msg.stack);
        loadingPromise = null;
        sendEngineStatus("error", msg.error);
        // Forward error to renderer so UI can show it
        {
          const { BrowserWindow } = require("electron");
          const win = BrowserWindow.getAllWindows()[0];
          if (win && !win.isDestroyed()) {
            win.webContents.send("tts-kokoro-download-error", msg.error);
          }
        }
        break;
      case "result": {
        const p = pending.get(msg.id);
        if (p) {
          pending.delete(msg.id);
          if (msg.error) p.reject(new Error(msg.error));
          else p.resolve({ audio: msg.audio, sampleRate: msg.sampleRate, durationMs: msg.durationMs });
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

  worker.on("error", (err) => {
    console.error(`[kokoro] Worker crashed (attempt ${crashCount + 1}/${MAX_CRASH_RETRIES + 1}):`, err.message);
    // Reset engine state so next call creates a fresh worker
    worker = null;
    modelReady = false;
    loadingPromise = null;

    if (crashCount < MAX_CRASH_RETRIES) {
      crashCount++;
      const backoff = CRASH_BACKOFF_MS * crashCount;
      console.log(`[kokoro] Retrying worker in ${backoff}ms...`);
      sendEngineStatus("retrying", `Attempt ${crashCount + 1}/${MAX_CRASH_RETRIES + 1}`);
      setTimeout(() => {
        sendEngineStatus("warming");
        ensureReady(onProgressCb).catch(retryErr => {
          console.error("[kokoro] Retry failed:", retryErr.message);
        });
      }, backoff);
    } else {
      // Max retries exhausted — reject all pending and surface error to renderer
      for (const [, p] of pending) {
        p.reject(err);
      }
      pending.clear();
      crashCount = 0;

      sendEngineStatus("error", `Worker crashed after ${MAX_CRASH_RETRIES + 1} attempts: ${err.message}`);
      try {
        const { BrowserWindow } = require("electron");
        const win = BrowserWindow.getAllWindows()[0];
        if (win && !win.isDestroyed()) {
          win.webContents.send("tts-kokoro-download-error", `TTS worker crashed after ${MAX_CRASH_RETRIES + 1} attempts: ${err.message}`);
        }
      } catch { /* non-fatal */ }
    }
  });

  // Start loading model in the worker
  worker.postMessage({ type: "load", cacheDir });
  return worker;
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

    sendEngineStatus("warming");
    const w = getWorker(cacheDir);

    // Wait for model-ready message or timeout — whichever comes first
    loadingPromise = new Promise((resolve, reject) => {
      const handler = (msg) => {
        if (msg.type === "model-ready") {
          cleanup();
          resolve();
        }
      };
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error("Kokoro model load timed out"));
      }, TTS_MODEL_LOAD_TIMEOUT_MS);

      function cleanup() {
        w.off("message", handler);
        clearTimeout(timer);
      }

      w.on("message", handler);
    });

    await loadingPromise;
  } catch (err) {
    loadingPromise = null;
    throw err;
  }
}

/**
 * Generate speech audio for text. Runs in worker thread — never blocks main.
 */
async function generate(text, voice = "af_bella", speed = 1.0) {
  if (!modelReady) {
    sendLoadingSignal(true);
    await ensureReady();
    sendLoadingSignal(false);
  }
  resetIdleTimer();

  const id = ++requestId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    worker.postMessage({ type: "generate", id, text, voice, speed });
  });
}

/**
 * List available Kokoro voices.
 */
async function listVoices() {
  if (!modelReady) await ensureReady();
  const id = ++requestId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    worker.postMessage({ type: "list-voices", id });
  });
}

function isModelReady() { return modelReady; }

async function downloadModel(onProgress) {
  await ensureReady(onProgress);
}

/**
 * Pre-load model (call when reader opens, before user hits N).
 */
async function preload() {
  try { await ensureReady(); } catch { /* non-fatal */ }
}

/**
 * Set loading state callback (for UI notification).
 */
function setLoadingCallback(cb) { onLoadingCb = cb; }

module.exports = { generate, listVoices, isModelReady, downloadModel, preload, setLoadingCallback, SAMPLE_RATE };
