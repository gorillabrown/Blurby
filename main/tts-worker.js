// main/tts-worker.js — Kokoro TTS worker thread
// Runs in a separate thread so inference never blocks the main Electron process.
// Communicates via parentPort message passing.

const { parentPort, workerData } = require("worker_threads");
const path = require("path");
const Module = require("module");
const { KOKORO_MODEL_ID, KOKORO_MODEL_DTYPE, KOKORO_DEFAULT_VOICE } = require("./constants");

let KokoroTTS = null;
let ttsInstance = null;
let modelLoaded = false;
let modelReady = false;

const SAMPLE_RATE = 24000;
const OPTIONAL_PACKAGED_MODULE_STUBS = new Map([
  ["sharp", path.join(__dirname, "sharp-stub.js")],
]);

async function withPackagedModuleResolution(modulePath, callback) {
  const origResolve = Module._resolveFilename;
  Module._resolveFilename = function(request, parent, isMain, options) {
    // Redirect phonemizer to its explicit CJS entry (required by kokoro-js for TTS)
    if (request === "phonemizer") {
      return path.join(modulePath, "phonemizer", "dist", "phonemizer.cjs");
    }
    try {
      return origResolve.call(this, request, parent, isMain, options);
    } catch (err) {
      const stubPath = OPTIONAL_PACKAGED_MODULE_STUBS.get(request);
      if (err?.code === "MODULE_NOT_FOUND" && stubPath) {
        return stubPath;
      }
      throw err;
    }
  };

  try {
    return await callback();
  } finally {
    Module._resolveFilename = origResolve;
  }
}

async function loadModel(cacheDir) {
  if (modelReady) return;

  if (!modelLoaded) {
    let kokoro, transformersEnv;
    if (workerData?.modulePath) {
      // Packaged app: require explicit CJS entry points from the unpacked directory.
      // Asar/unpacked boundary issues solved here:
      // 1. ESM "exports" map — require() can't resolve across asar boundary, use .cjs paths
      // 2. Required deps (phonemizer) — redirect to explicit CJS path in unpacked dir
      // 3. Explicitly-allowed optional deps (sharp) — stub with empty module (not needed for TTS)
      // 4. import() hangs — Electron worker threads can't dynamic-import from unpacked asar
      const modulePath = workerData.modulePath;
      ({ kokoro, transformersEnv } = await withPackagedModuleResolution(modulePath, async () => {
        const packagedKokoro = require(path.join(modulePath, "kokoro-js", "dist", "kokoro.cjs"));
        const transformers = require(path.join(modulePath, "@huggingface", "transformers", "dist", "transformers.node.cjs"));
        return { kokoro: packagedKokoro, transformersEnv: transformers.env };
      }));
    } else {
      // Dev mode: normal ESM import
      kokoro = await import("kokoro-js");
      const transformersMod = await import("@huggingface/transformers");
      transformersEnv = transformersMod.env;
    }
    KokoroTTS = kokoro.KokoroTTS;
    transformersEnv.cacheDir = cacheDir;
    // Suppress non-fatal cpuinfo warnings on ARM devices (e.g., Snapdragon X Elite).
    // onnxruntime's cpuinfo library prints to stderr when it doesn't recognize the SoC,
    // but inference still works via generic ARM64 kernels.
    const origStderrWrite = process.stderr.write;
    let cpuinfoWarning = null;
    process.stderr.write = function(chunk, ...args) {
      const str = typeof chunk === "string" ? chunk : chunk.toString();
      if (str.includes("cpuinfo") || str.includes("arm/windows/init.c")) {
        cpuinfoWarning = str.trim();
        return true; // suppress
      }
      return origStderrWrite.call(this, chunk, ...args);
    };

    try {
      ttsInstance = await KokoroTTS.from_pretrained(KOKORO_MODEL_ID, {
        dtype: KOKORO_MODEL_DTYPE,
        device: "cpu",
        progress_callback: (progress) => {
          if (progress.status === "progress") {
            parentPort.postMessage({ type: "progress", value: Math.round(progress.progress || 0) });
          }
        },
      });
    } finally {
      process.stderr.write = origStderrWrite;
    }

    if (cpuinfoWarning) {
      console.log("[kokoro] ARM device detected — cpuinfo chip not in database, using generic ARM64 kernels.");
      parentPort.postMessage({ type: "arm-cpuinfo-warning", warning: cpuinfoWarning });
    }

    modelLoaded = true;
    parentPort.postMessage({ type: "model-loaded" });
  }

  modelReady = false;
  // Warm-up inference is the truth boundary: loaded != ready.
  try {
    await ttsInstance.generate("Hello.", { voice: KOKORO_DEFAULT_VOICE, speed: 1.0 });
    modelReady = true;
    parentPort.postMessage({ type: "warm-up-done" });
    parentPort.postMessage({ type: "model-ready" });
  } catch (warmupErr) {
    console.error("[kokoro] Warm-up inference failed:", warmupErr.message);
    if (warmupErr.stack) console.error("[kokoro] Stack:", warmupErr.stack);
    // Fail closed: keep the loaded model out of the "ready" state until inference works.
    parentPort.postMessage({ type: "warm-up-failed", error: warmupErr.message });
    return;
  }
}

function getVoiceSnapshot() {
  const voiceMap = ttsInstance?.voices || KokoroTTS?.voices || null;
  const voices = voiceMap ? Object.keys(voiceMap) : null;
  return {
    available: Array.isArray(voices) ? voices.includes(KOKORO_DEFAULT_VOICE) : null,
    count: Array.isArray(voices) ? voices.length : null,
    ids: Array.isArray(voices) ? voices : null,
    defaultVoice: KOKORO_DEFAULT_VOICE,
  };
}

function getWorkerStatus() {
  return {
    modelId: KOKORO_MODEL_ID,
    dtype: KOKORO_MODEL_DTYPE,
    modelLoaded,
    modelReady,
    runtime: {
      packagedModulePath: workerData?.modulePath || null,
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    voices: getVoiceSnapshot(),
  };
}

async function generate(id, text, voice, speed, words) {
  try {
    if (!ttsInstance || !modelReady) {
      parentPort.postMessage({ type: "result", id, error: "Model not ready" });
      return;
    }
    const result = await ttsInstance.generate(text, { voice, speed, words: words || null });
    const audioData = result.audio || result;
    const pcm = audioData.data || audioData;
    const sr = audioData.sampling_rate || SAMPLE_RATE;
    const durationMs = (pcm.length / sr) * 1000;
    // Transfer PCM as Float32Array via Transferable (zero-copy)
    const f32 = pcm instanceof Float32Array ? pcm : new Float32Array(pcm);
    const msg = { type: "result", id, audio: f32, sampleRate: sr, durationMs, wordTimestamps: result.wordTimestamps || null };
    parentPort.postMessage(msg, [f32.buffer]);
  } catch (err) {
    parentPort.postMessage({ type: "result", id, error: err.message });
  }
}

async function listVoices(id) {
  try {
    if (!ttsInstance) {
      parentPort.postMessage({ type: "voices", id, voices: [] });
      return;
    }
    const voices = ttsInstance.list_voices ? ttsInstance.list_voices() : [];
    parentPort.postMessage({ type: "voices", id, voices });
  } catch (err) {
    parentPort.postMessage({ type: "voices", id, voices: [], error: err.message });
  }
}

// Message handler
parentPort.on("message", async (msg) => {
  switch (msg.type) {
    case "load":
      try {
        await loadModel(msg.cacheDir);
      } catch (err) {
        parentPort.postMessage({ type: "load-error", error: err.message, stack: err.stack });
      }
      break;
    case "generate":
      await generate(msg.id, msg.text, msg.voice, msg.speed, msg.words);
      break;
    case "list-voices":
      await listVoices(msg.id);
      break;
    case "preflight":
      parentPort.postMessage({ type: "preflight", id: msg.id, worker: getWorkerStatus() });
      break;
  }
});
