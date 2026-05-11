// main/tts-engine.js — Kokoro TTS engine (worker thread wrapper)
// All inference runs in a worker thread so the main Electron process never blocks.

const { Worker } = require("worker_threads");
const path = require("path");
const fs = require("fs/promises");
const {
  KOKORO_SAMPLE_RATE,
  KOKORO_MODEL_ID,
  KOKORO_MODEL_DTYPE,
  KOKORO_DEFAULT_VOICE,
  TTS_IDLE_TIMEOUT_MS,
  TTS_MODEL_LOAD_TIMEOUT_MS,
} = require("./constants");

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
let downloadState = {
  inProgress: false,
  progress: null,
  lastAttemptAt: null,
  lastSuccessAt: null,
  lastFailureAt: null,
  lastError: null,
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

function isoNow() {
  return new Date().toISOString();
}

function beginDownloadAttempt() {
  downloadState = {
    ...downloadState,
    inProgress: true,
    progress: null,
    lastAttemptAt: isoNow(),
    lastError: null,
  };
}

function updateDownloadProgress(progress) {
  downloadState = {
    ...downloadState,
    inProgress: true,
    progress: Number.isFinite(progress) ? progress : downloadState.progress,
  };
}

function finishDownloadAttempt() {
  downloadState = {
    ...downloadState,
    inProgress: false,
    progress: 100,
    lastSuccessAt: isoNow(),
    lastError: null,
  };
}

function failDownloadAttempt(err) {
  downloadState = {
    ...downloadState,
    inProgress: false,
    lastFailureAt: isoNow(),
    lastError: err?.message || String(err || "Kokoro model load failed"),
  };
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

  onProgressCb = (progress) => {
    updateDownloadProgress(progress);
    if (typeof onProgress === "function") onProgress(progress);
  };

  try {
    const { app } = require("electron");
    const cacheDir = path.join(app.getPath("userData"), "models");
    await fs.mkdir(cacheDir, { recursive: true });

    beginDownloadAttempt();
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
    finishDownloadAttempt();
  } catch (err) {
    loadingPromise = null;
    failDownloadAttempt(err);
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

function getCacheDir() {
  const { app } = require("electron");
  return path.join(app.getPath("userData"), "models");
}

function getPackagedModulePath() {
  try {
    const { app } = require("electron");
    if (!app.isPackaged) return null;
    return path.join(process.resourcesPath, "app.asar.unpacked", "node_modules");
  } catch {
    return null;
  }
}

function resolveRuntimeModule(request, modulePath = null) {
  try {
    const resolved = modulePath
      ? require.resolve(request, { paths: [modulePath] })
      : require.resolve(request);
    return { available: true, path: resolved, error: null };
  } catch (err) {
    return { available: false, path: null, error: err?.message || String(err) };
  }
}

async function statPath(filePath, kind = "file") {
  try {
    const stat = await fs.stat(filePath);
    const kindMatches = kind === "directory" ? stat.isDirectory() : stat.isFile();
    return {
      path: filePath,
      available: kindMatches,
      bytes: stat.isFile() ? stat.size : null,
      kind: stat.isDirectory() ? "directory" : "file",
      error: kindMatches ? null : `Expected ${kind}`,
    };
  } catch (err) {
    return {
      path: filePath,
      available: false,
      bytes: null,
      kind,
      error: err?.code || err?.message || String(err),
    };
  }
}

function getModelCachePaths(cacheDir) {
  const modelDir = path.join(cacheDir, ...KOKORO_MODEL_ID.split("/"));
  const modelFile =
    KOKORO_MODEL_DTYPE === "fp32"
      ? "model.onnx"
      : `model_${KOKORO_MODEL_DTYPE}.onnx`;
  return {
    modelDir,
    configPath: path.join(modelDir, "config.json"),
    tokenizerPath: path.join(modelDir, "tokenizer.json"),
    modelPath: path.join(modelDir, "onnx", modelFile),
  };
}

function getVoicePath(modulePath = null) {
  if (modulePath) {
    return path.join(modulePath, "kokoro-js", "voices", `${KOKORO_DEFAULT_VOICE}.bin`);
  }
  try {
    return path.join(path.dirname(require.resolve("kokoro-js")), "..", "voices", `${KOKORO_DEFAULT_VOICE}.bin`);
  } catch {
    return path.join(process.cwd(), "node_modules", "kokoro-js", "voices", `${KOKORO_DEFAULT_VOICE}.bin`);
  }
}

async function inspectKokoroRuntime() {
  const modulePath = getPackagedModulePath();
  let deps;
  if (modulePath) {
    const packagedDeps = {
      kokoroJs: { path: path.join(modulePath, "kokoro-js", "dist", "kokoro.cjs"), kind: "file" },
      transformers: { path: path.join(modulePath, "@huggingface", "transformers", "dist", "transformers.node.cjs"), kind: "file" },
      phonemizer: { path: path.join(modulePath, "phonemizer", "dist", "phonemizer.cjs"), kind: "file" },
      onnxruntimeNode: { path: path.join(modulePath, "onnxruntime-node"), kind: "directory" },
    };
    deps = {};
    for (const [key, dep] of Object.entries(packagedDeps)) {
      const depStat = await statPath(dep.path, dep.kind);
      deps[key] = {
        available: depStat.available,
        path: dep.path,
        error: depStat.error,
      };
    }
  } else {
    deps = {
      kokoroJs: resolveRuntimeModule("kokoro-js"),
      transformers: resolveRuntimeModule("@huggingface/transformers"),
      phonemizer: resolveRuntimeModule("phonemizer"),
      onnxruntimeNode: resolveRuntimeModule("onnxruntime-node"),
    };
  }
  const voicePath = getVoicePath(modulePath);
  const voiceAsset = await statPath(voicePath);
  const dependencyEntries = Object.entries(deps);
  return {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    packaged: Boolean(modulePath),
    modulePath,
    dependencies: deps,
    voiceAsset: {
      defaultVoice: KOKORO_DEFAULT_VOICE,
      ...voiceAsset,
    },
    ok: dependencyEntries.every(([, dep]) => dep.available) && voiceAsset.available,
  };
}

async function inspectKokoroAssets(cacheDir) {
  const paths = getModelCachePaths(cacheDir);
  const modelDir = await statPath(paths.modelDir, "directory");
  const files = {
    config: {
      key: "config",
      label: "Model config",
      required: true,
      ...(await statPath(paths.configPath)),
    },
    tokenizer: {
      key: "tokenizer",
      label: "Tokenizer",
      required: true,
      ...(await statPath(paths.tokenizerPath)),
    },
    model: {
      key: "model",
      label: `${KOKORO_MODEL_DTYPE} ONNX model`,
      required: true,
      ...(await statPath(paths.modelPath)),
    },
  };
  const fileValues = Object.values(files);
  const anyPresent = modelDir.available || fileValues.some((entry) => entry.available);
  const missing = fileValues.filter((entry) => entry.required && !entry.available).map((entry) => entry.key);
  return {
    cacheDir,
    modelDir: paths.modelDir,
    configPath: paths.configPath,
    files,
    anyPresent,
    allRequiredPresent: missing.length === 0,
    missing,
  };
}

function checkStatus(pass) {
  return pass ? "pass" : "fail";
}

function makePreflightChecks(runtime, assets, workerSnapshot) {
  const checks = [];
  for (const [key, dep] of Object.entries(runtime.dependencies)) {
    checks.push({
      key: `runtime-${key}`,
      label: `Runtime dependency: ${key}`,
      status: checkStatus(dep.available),
      detail: dep.available ? dep.path : dep.error,
    });
  }
  checks.push({
    key: "voice-default",
    label: `Default voice: ${KOKORO_DEFAULT_VOICE}`,
    status: checkStatus(runtime.voiceAsset.available),
    detail: runtime.voiceAsset.available ? runtime.voiceAsset.path : runtime.voiceAsset.error,
  });
  for (const file of Object.values(assets.files)) {
    checks.push({
      key: `asset-${file.key}`,
      label: file.label,
      status: checkStatus(file.available),
      detail: file.available ? file.path : `${file.path} (${file.error})`,
    });
  }
  checks.push({
    key: "worker-warm-up",
    label: "Worker warm-up",
    status: workerSnapshot?.modelReady || modelReady ? "pass" : worker || loadingPromise ? "warn" : "skip",
    detail:
      workerSnapshot?.modelReady || modelReady
        ? "Warm-up inference has completed."
        : worker || loadingPromise
        ? "Worker exists but warm-up has not reported ready."
        : "Worker is not running; preflight did not start it.",
  });
  return checks;
}

async function queryWorkerPreflight() {
  const currentWorker = worker;
  if (!currentWorker) return null;
  const id = ++requestId;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      cleanup();
      resolve({
        unavailable: true,
        detail: "Timed out waiting for Kokoro worker preflight status.",
      });
    }, 500);
    const handler = (msg) => {
      if (msg.type !== "preflight" || msg.id !== id) return;
      cleanup();
      resolve(msg.worker || null);
    };
    function cleanup() {
      clearTimeout(timer);
      currentWorker.off("message", handler);
    }
    currentWorker.on("message", handler);
    try {
      currentWorker.postMessage({ type: "preflight", id });
    } catch (err) {
      cleanup();
      resolve({
        unavailable: true,
        detail: err?.message || "Unable to query Kokoro worker preflight status.",
      });
    }
  });
}

function classifyPreflight({ runtime, assets, workerSnapshot }) {
  const reason = engineStatusSnapshot.reason;
  if (modelReady || workerSnapshot?.modelReady) {
    return {
      status: "ready",
      reason: null,
      detail: "Kokoro worker is loaded and warm-up inference has completed.",
      recoverable: false,
    };
  }
  if (loadingPromise || engineStatusSnapshot.loading || retryTimer) {
    return {
      status: "loading",
      reason: reason || "model-loading",
      detail: engineStatusSnapshot.detail || "Kokoro model is loading.",
      recoverable: true,
    };
  }
  if (engineStatusSnapshot.status === "error") {
    const downloadReasons = new Set(["load-error", "load-timeout"]);
    if (downloadReasons.has(reason) && !assets.allRequiredPresent) {
      return {
        status: "download-failed",
        reason,
        detail: engineStatusSnapshot.detail || downloadState.lastError || "Kokoro model download failed.",
        recoverable: true,
      };
    }
    return {
      status: "runtime-error",
      reason: reason || "runtime-error",
      detail: engineStatusSnapshot.detail || "Kokoro runtime failed.",
      recoverable: Boolean(engineStatusSnapshot.recoverable),
    };
  }
  if (!runtime.ok) {
    return {
      status: "runtime-error",
      reason: "runtime-dependency-missing",
      detail: "Kokoro runtime dependency or packaged voice asset is missing.",
      recoverable: false,
    };
  }
  if (!assets.anyPresent) {
    return {
      status: "download-needed",
      reason: "model-cache-empty",
      detail: "Kokoro model assets are not present in the local cache.",
      recoverable: true,
    };
  }
  if (!assets.allRequiredPresent) {
    return {
      status: "missing-assets",
      reason: "model-cache-incomplete",
      detail: `Kokoro cache is missing required assets: ${assets.missing.join(", ")}.`,
      recoverable: true,
    };
  }
  return {
    status: "offline-ready",
    reason: null,
    detail: "Kokoro model assets and runtime dependencies are available locally; worker is not warm.",
    recoverable: false,
  };
}

async function preflight() {
  const started = Date.now();
  const cacheDir = getCacheDir();
  const [runtime, assets, workerSnapshot] = await Promise.all([
    inspectKokoroRuntime(),
    inspectKokoroAssets(cacheDir),
    queryWorkerPreflight(),
  ]);
  const classified = classifyPreflight({ runtime, assets, workerSnapshot });
  const offlineReady = runtime.ok && assets.allRequiredPresent;
  const loading = classified.status === "loading";
  const ready = classified.status === "ready";
  return {
    ok: ready || classified.status === "offline-ready",
    status: classified.status,
    reason: classified.reason,
    detail: classified.detail,
    ready,
    loading,
    recoverable: classified.recoverable,
    offlineReady,
    checkedAt: isoNow(),
    timingMs: Date.now() - started,
    model: {
      id: KOKORO_MODEL_ID,
      dtype: KOKORO_MODEL_DTYPE,
      device: "cpu",
      cacheDir,
      cacheLocation: "electron-userData/models",
      modelDir: assets.modelDir,
      configPath: assets.configPath,
      configAvailable: assets.files.config.available,
      tokenizerAvailable: assets.files.tokenizer.available,
      modelAvailable: assets.files.model.available,
      missingAssets: assets.missing,
    },
    voice: {
      defaultVoice: KOKORO_DEFAULT_VOICE,
      available: runtime.voiceAsset.available || workerSnapshot?.voices?.available || false,
      assetPath: runtime.voiceAsset.path,
      workerAvailable: workerSnapshot?.voices?.available ?? null,
      workerCount: workerSnapshot?.voices?.count ?? null,
      workerIds: workerSnapshot?.voices?.ids ?? null,
    },
    runtime,
    download: {
      needed:
        classified.status === "download-needed" ||
        classified.status === "missing-assets" ||
        classified.status === "download-failed",
      inProgress: downloadState.inProgress || loading,
      progress: downloadState.progress,
      lastAttemptAt: downloadState.lastAttemptAt,
      lastSuccessAt: downloadState.lastSuccessAt,
      lastFailureAt: downloadState.lastFailureAt,
      lastError: downloadState.lastError,
      retrying: engineStatusSnapshot.status === "retrying" || Boolean(retryTimer),
      retryCount: crashCount,
      maxRetries: MAX_CRASH_RETRIES,
    },
    engine: { ...engineStatusSnapshot },
    worker: workerSnapshot,
    checks: makePreflightChecks(runtime, assets, workerSnapshot),
  };
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

module.exports = { generate, listVoices, isModelReady, getModelStatus, preflight, downloadModel, preload, setLoadingCallback, SAMPLE_RATE };
