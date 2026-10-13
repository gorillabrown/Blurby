// NARRATE-REBUILD-1 Phase 0 harness: offline Kokoro loader and capture.
// Calls kokoro-js directly (never main/tts-worker.js). Network is blocked. The model
// is the hash-checked copy in the artifacts folder, never %APPDATA%\Blurby.
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
export const ARTIFACTS_ROOT = process.env.NARRATE_REBUILD_ARTIFACTS || "C:/Projects/Blurby-artifacts/narrate-rebuild-1";
export const MODELS_ROOT = path.join(ARTIFACTS_ROOT, "models");
export const AUDIO_ROOT = path.join(ARTIFACTS_ROOT, "audio");
export const ORIGINAL_MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
export const EXPOSED_MODEL_ID = "local/kokoro-dur";
export const SAMPLE_RATE = 24000;
export const TOKEN_CAP = 400; // T2: about 400 phoneme tokens, under the model's 512
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

// Wrap the three seams the production call path crosses so one generate() yields the exact
// phoneme string, the exact input_ids sent, the raw duration tensor and the phonemizer's
// per-segment output. Nothing is re-phonemized word by word here.
export function attachCapture(tts, ph) {
  const cap = { ph: [], tok: [], model: [] };
  const origPh = ph.phonemize;
  ph.phonemize = async (text, lang) => { const out = await origPh(text, lang); cap.ph.push({ text, lang, out }); return out; };
  const origTok = tts.tokenizer;
  tts.tokenizer = (text, opts) => {
    const r = origTok(text, opts);
    const ids = Array.from(r.input_ids.data, Number);
    if (ids.length > TOKEN_CAP) throw new Error(`token cap: ${ids.length} input_ids exceed ${TOKEN_CAP} (T2); chunk rejected before synthesis`);
    cap.tok.push({ text, ids });
    return r;
  };
  const origModel = tts.model;
  tts.model = async (inputs) => {
    const out = await origModel(inputs);
    cap.model.push({
      outputNames: Object.keys(out),
      waveformType: out.waveform?.type ?? null,
      durationsType: out.durations?.type ?? null,
      durationsDims: out.durations?.dims ?? null,
      durations: out.durations ? Array.from(out.durations.data, Number) : null, // explicit int64/float handling
      idsSent: Array.from(inputs.input_ids.data, Number),
      speedSent: Number(inputs.speed.data[0]),
    });
    return out;
  };
  const vocab = origTok.model.tokens_to_ids ?? origTok.model.vocab;
  const spaceId = vocab instanceof Map ? vocab.get(" ") : vocab[" "];
  return {
    phonemizeIsolated: origPh, // identification evidence only (see MAPPING_POLICY.md)
    spaceId,
    take() { const t = { ph: cap.ph, tok: cap.tok, model: cap.model }; cap.ph = []; cap.tok = []; cap.model = []; return t; },
  };
}

// One production-path generate() with everything captured. Fails closed on any seam mismatch.
export async function synthesize(tts, capture, text, { voice, speed }) {
  capture.take();
  const t0 = performance.now();
  const audio = await tts.generate(text, { voice, speed });
  const genMs = performance.now() - t0;
  const c = capture.take();
  if (c.tok.length !== 1 || c.model.length !== 1) throw new Error(`capture: expected 1 tokenizer and 1 model call, saw ${c.tok.length} and ${c.model.length}`);
  const tok = c.tok[0], m = c.model[0];
  if (!m.durations) throw new Error("producer returned no durations output (fail closed)");
  if (m.idsSent.length !== tok.ids.length || m.idsSent.some((v, i) => v !== tok.ids[i])) throw new Error("ids sent to the model differ from the tokenizer output");
  if (m.durations.length !== tok.ids.length) throw new Error(`durations length ${m.durations.length} != input_ids length ${tok.ids.length}`);
  if (m.speedSent !== speed) throw new Error(`speed sent ${m.speedSent} != requested ${speed}`);
  const pcm = audio.audio;
  if (!(pcm instanceof Float32Array)) throw new Error("RawAudio.audio is not a Float32Array");
  return {
    text, voice, speed,
    phonemes: tok.text,
    ids: tok.ids,
    durations: m.durations,
    durationsType: m.durationsType,
    segments: c.ph, // [{text: normalized punctuation-free segment, lang, out: string[]}]
    pcm,
    sampleRate: audio.sampling_rate,
    genMs,
    provenance: { source: "model-output", outputNames: m.outputNames, durationsType: m.durationsType },
  };
}
