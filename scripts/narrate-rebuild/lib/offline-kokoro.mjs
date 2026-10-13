// NARRATE-REBUILD-1 Phase 0 harness: offline Kokoro loader and capture.
// Calls kokoro-js directly (never main/tts-worker.js). Network is blocked. The model
// is the hash-checked copy in the artifacts folder, never %APPDATA%\Blurby.
// The capture seams (attachCapture, synthesize) moved to main/narrate/capture.js in P3 so the
// product's producer and this harness share one implementation; they are re-exported here.
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import capture from "../../../main/narrate/capture.js";

export const { TOKEN_CAP, PROVENANCE_SOURCE, attachCapture, synthesize } = capture;

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
export const ARTIFACTS_ROOT = process.env.NARRATE_REBUILD_ARTIFACTS || "C:/Projects/Blurby-artifacts/narrate-rebuild-1";
export const MODELS_ROOT = path.join(ARTIFACTS_ROOT, "models");
export const AUDIO_ROOT = path.join(ARTIFACTS_ROOT, "audio");
export const ORIGINAL_MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
export const EXPOSED_MODEL_ID = "local/kokoro-dur";
export const SAMPLE_RATE = 24000;
export const PHASE0_DIR = path.join(REPO_ROOT, "docs/studies/narrate-rebuild-1/phase0");
export const CORPUS_DIR = path.join(REPO_ROOT, "tests/fixtures/narrate-rebuild");

const kokoroPath = path.join(REPO_ROOT, "node_modules/kokoro-js/dist/kokoro.cjs");
const req = createRequire(kokoroPath);

export function sha256File(p) {
  return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
}
export function sha256Bytes(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export function blockNetwork() {
  globalThis.fetch = async (u) => { throw new Error("NETWORK BLOCKED: " + u); };
}

export function loadRuntime() {
  blockNetwork();
  const tf = req("@huggingface/transformers");
  const ph = req("phonemizer");
  const ort = req("onnxruntime-node");
  Object.assign(tf.env, {
    allowRemoteModels: false,
    allowLocalModels: true,
    localModelPath: MODELS_ROOT + "/",
    useFSCache: false,
    useBrowserCache: false,
  });
  const { KokoroTTS } = req(kokoroPath);
  return {
    tf, ph, ort, KokoroTTS, kokoroPath,
    versions: {
      node: process.version,
      ...Object.fromEntries(["kokoro-js", "@huggingface/transformers", "onnxruntime-node", "phonemizer"].map((name) => [name, JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "node_modules", name, "package.json"), "utf8")).version])),
    },
    host: { platform: process.platform, release: os.release(), arch: process.arch, cpus: os.cpus().length, cpuModel: os.cpus()[0]?.model ?? null, totalMemGB: +(os.totalmem() / 2 ** 30).toFixed(1) },
  };
}

export function modelFile(modelId) {
  return path.join(MODELS_ROOT, ...modelId.split("/"), "onnx", "model_q4.onnx");
}

export async function loadKokoro(rt, { modelId = EXPOSED_MODEL_ID, dtype = "q4", device = "cpu" } = {}) {
  const t0 = performance.now();
  const tts = await rt.KokoroTTS.from_pretrained(modelId, { dtype, device });
  const loadMs = performance.now() - t0;
  const sess = tts.model.sessions?.model ?? Object.values(tts.model.sessions ?? {})[0];
  return { tts, loadMs, dtype, device, inputNames: sess?.inputNames ?? null, outputNames: sess?.outputNames ?? null };
}
