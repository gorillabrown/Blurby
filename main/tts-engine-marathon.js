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
let marathonRequestId = 0;
const marathonPending = new Map(); // id → { resolve, reject }

const SAMPLE_RATE = KOKORO_SAMPLE_RATE;

function getMarathonWorker(cacheDir) {
  if (marathonWorker) return marathonWorker;
  const { app } = require("electron");
  const workerOpts = {};
  if (app.isPackaged) {
    const unpackedModules = path.join(process.resourcesPath, "app.asar.unpacked", "node_modules");
    workerOpts.workerData = { modulePath: unpackedModules };
    workerOpts.env = { ...process.env, NODE_PATH: unpackedModules };
  }
  marathonWorker = new Worker(path.join(__dirname, "tts-worker.js"), workerOpts);

  marathonWorker.on("message", (msg) => {
    switch (msg.type) {
      case "model-ready":
        marathonModelReady = true;
        break;
      case "warm-up-done":
        break;
      case "load-error":
        console.error("[kokoro-marathon] Worker load failed:", msg.error);
        marathonLoadingPromise = null;
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

  marathonWorker.on("error", (err) => {
    for (const [, p] of marathonPending) {
      p.reject(err);
    }
    marathonPending.clear();
    marathonWorker = null;
    marathonModelReady = false;
    marathonLoadingPromise = null;
  });

  marathonWorker.postMessage({ type: "load", cacheDir });
  return marathonWorker;
}

async function ensureReady() {
  if (marathonModelReady) return;
  if (marathonLoadingPromise) return marathonLoadingPromise;

  try {
    const { app } = require("electron");
    const cacheDir = path.join(app.getPath("userData"), "models");
    await fs.mkdir(cacheDir, { recursive: true });

    const w = getMarathonWorker(cacheDir);

    marathonLoadingPromise = Promise.race([
      new Promise((resolve) => {
        const handler = (msg) => {
          if (msg.type === "model-ready") {
            w.off("message", handler);
            resolve();
          }
        };
        w.on("message", handler);
      }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Marathon model load timed out")), TTS_MODEL_LOAD_TIMEOUT_MS);
      }),
    ]);

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
    marathonPending.set(id, { resolve, reject });
    marathonWorker.postMessage({ type: "generate", id, text, voice, speed });
  });
}

function isModelReady() { return marathonModelReady; }

async function preload() {
  try { await ensureReady(); } catch { /* non-fatal */ }
}

function shutdown() {
  if (marathonWorker) {
    marathonWorker.terminate();
    marathonWorker = null;
    marathonModelReady = false;
    marathonLoadingPromise = null;
    marathonPending.clear();
  }
}

module.exports = { generate, preload, isModelReady, shutdown, SAMPLE_RATE };
