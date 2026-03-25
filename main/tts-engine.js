// main/tts-engine.js — Kokoro TTS engine (worker thread wrapper)
// All inference runs in a worker thread so the main Electron process never blocks.

const { Worker } = require("worker_threads");
const path = require("path");
const fs = require("fs/promises");

let worker = null;
let modelReady = false;
let loadingPromise = null;
let requestId = 0;
const pending = new Map(); // id → { resolve, reject }

// Progress/status callbacks
let onProgressCb = null;
let onLoadingCb = null;

const SAMPLE_RATE = 24000;

// Idle unload timer — terminate worker after 5 min of no use
let idleTimer = null;
const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

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

function getWorker(cacheDir) {
  if (worker) return worker;
  worker = new Worker(path.join(__dirname, "tts-worker.js"));

  worker.on("message", (msg) => {
    switch (msg.type) {
      case "progress":
        if (onProgressCb) onProgressCb(msg.value);
        break;
      case "model-ready":
        modelReady = true;
        if (onLoadingCb) onLoadingCb(false);
        break;
      case "warm-up-done":
        // Model fully primed
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
    // Reject all pending requests
    for (const [id, p] of pending) {
      p.reject(err);
    }
    pending.clear();
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

  loadingPromise = new Promise(async (resolve, reject) => {
    try {
      const { app } = require("electron");
      const cacheDir = path.join(app.getPath("userData"), "models");
      await fs.mkdir(cacheDir, { recursive: true });

      const w = getWorker(cacheDir);

      // Wait for model-ready message
      const handler = (msg) => {
        if (msg.type === "model-ready") {
          w.off("message", handler);
          resolve();
        }
      };
      w.on("message", handler);

      // Timeout after 120s
      setTimeout(() => {
        w.off("message", handler);
        reject(new Error("Kokoro model load timed out"));
      }, 120000);
    } catch (err) {
      loadingPromise = null;
      reject(err);
    }
  });

  return loadingPromise;
}

/**
 * Generate speech audio for text. Runs in worker thread — never blocks main.
 */
async function generate(text, voice = "af_bella", speed = 1.0) {
  if (!modelReady) await ensureReady();
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
