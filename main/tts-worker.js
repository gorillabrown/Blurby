// main/tts-worker.js — Kokoro TTS worker thread
// Runs in a separate thread so inference never blocks the main Electron process.
// Communicates via parentPort message passing.

const { parentPort, workerData } = require("worker_threads");
const path = require("path");

let KokoroTTS = null;
let ttsInstance = null;
let modelReady = false;

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const DTYPE = "q4"; // q4 is ~30-50% faster than q8 on CPU, Kokoro handles it well
const SAMPLE_RATE = 24000;

async function loadModel(cacheDir) {
  if (ttsInstance && modelReady) return;

  const kokoro = await import("kokoro-js");
  KokoroTTS = kokoro.KokoroTTS;

  const { env } = await import("@huggingface/transformers");
  env.cacheDir = cacheDir;

  ttsInstance = await KokoroTTS.from_pretrained(MODEL_ID, {
    dtype: DTYPE,
    device: "cpu",
    progress_callback: (progress) => {
      if (progress.status === "progress") {
        parentPort.postMessage({ type: "progress", value: Math.round(progress.progress || 0) });
      }
    },
  });

  modelReady = true;
  parentPort.postMessage({ type: "model-ready" });

  // Warm-up inference — primes ONNX session
  try {
    await ttsInstance.generate("Hello.", { voice: "af_bella", speed: 1.0 });
  } catch { /* warm-up failure is non-fatal */ }

  parentPort.postMessage({ type: "warm-up-done" });
}

async function generate(id, text, voice, speed) {
  try {
    if (!ttsInstance || !modelReady) {
      parentPort.postMessage({ type: "result", id, error: "Model not loaded" });
      return;
    }
    const result = await ttsInstance.generate(text, { voice, speed });
    const audioData = result.audio || result;
    const pcm = audioData.data || audioData;
    const sr = audioData.sampling_rate || SAMPLE_RATE;
    const durationMs = (pcm.length / sr) * 1000;
    // Transfer the Float32Array buffer for zero-copy
    parentPort.postMessage(
      { type: "result", id, audio: Array.from(pcm), sampleRate: sr, durationMs },
    );
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
      await loadModel(msg.cacheDir);
      break;
    case "generate":
      await generate(msg.id, msg.text, msg.voice, msg.speed);
      break;
    case "list-voices":
      await listVoices(msg.id);
      break;
  }
});
