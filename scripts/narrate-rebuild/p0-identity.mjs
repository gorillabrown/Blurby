import "./lib/app-icu-guard.mjs"; // P6b: refuse plain Node (exit 3)
// P0-1 Producer identity. Records every hash and runtime fact the Phase 0 evidence depends on and
// checks the pinned model, the original copy and the duration-exposed copy against the OutsideAudit.10
// record. Writes docs/studies/narrate-rebuild-1/phase0/identity.json. Exit 0 only when P0-1 passes.
// Run from pwsh in the phase worktree: node scripts/narrate-rebuild/p0-identity.mjs
import fs from "node:fs";
import path from "node:path";
import { loadRuntime, loadKokoro, sha256File, modelFile, ORIGINAL_MODEL_ID, EXPOSED_MODEL_ID, MODELS_ROOT, REPO_ROOT, PHASE0_DIR } from "./lib/offline-kokoro.mjs";

const RECORD = { // docs/studies/audit/OutsideAudit.10.2026-10-11/remediation/d4-evidence/units/{model-hashes,run-config}.txt
  pinnedModel: "04cf570cf9c4153694f76347ed4b9a48c1b59ff1de0999e6605d123966b197c7",
  exposedModel: "2eccfc53272a6d9b302320cf522a0f3cd6201cd29f0c872fad9433c207b95cad",
  tokenizer: "77a02c8e164413299b4b4c403b14f8e0e1c1b727db4d46a09d6327b861060a34",
  tokenizerConfig: "be1cb066d6ef6b074b3f15e6a6dd21ac88ff3cdaedf325f0aaed686c70f75d20",
  config: "df34b4f930b23447cd4dc410fabfb42eb3f24e803e6c3f97d618fb359380a36f",
  voice_af_bella: "f69d836209b78eb8c66e75e3cda491e26ea838a3674257e9d4e5703cbaf55c8b",
  graphEdit: { script: "docs/studies/audit/OutsideAudit.10.2026-10-11/remediation/F2-producer-probe/f2-producer__expose_dur.cjs", tensor: "/encoder/Clip_output_0", elemType: 1, output: "durations" },
};
const PINNED = path.join(process.env.APPDATA ?? "", "Blurby/models/onnx-community/Kokoro-82M-v1.0-ONNX/onnx/model_q4.onnx");

const rt = loadRuntime();
const origDir = path.join(MODELS_ROOT, ...ORIGINAL_MODEL_ID.split("/"));
const exposedDir = path.join(MODELS_ROOT, ...EXPOSED_MODEL_ID.split("/"));
const hashes = {
  pinnedModel: fs.existsSync(PINNED) ? sha256File(PINNED) : null, // read-only
  originalCopy: sha256File(modelFile(ORIGINAL_MODEL_ID)),
  exposedCopy: sha256File(modelFile(EXPOSED_MODEL_ID)),
  exposedBytes: fs.statSync(modelFile(EXPOSED_MODEL_ID)).size,
  originalBytes: fs.statSync(modelFile(ORIGINAL_MODEL_ID)).size,
  tokenizer: sha256File(path.join(exposedDir, "tokenizer.json")),
  tokenizerConfig: sha256File(path.join(exposedDir, "tokenizer_config.json")),
  config: sha256File(path.join(exposedDir, "config.json")),
  tokenizerOriginalCopy: sha256File(path.join(origDir, "tokenizer.json")),
  voice_af_bella: sha256File(path.join(REPO_ROOT, "node_modules/kokoro-js/voices/af_bella.bin")),
  voice_bf_emma: sha256File(path.join(REPO_ROOT, "node_modules/kokoro-js/voices/bf_emma.bin")),
  kokoroDist: sha256File(rt.kokoroPath),
  kokoroPatch: sha256File(path.join(REPO_ROOT, "patches/kokoro-js+1.2.1.patch")),
  packageLock: sha256File(path.join(REPO_ROOT, "package-lock.json")),
  graphEditScript: sha256File(path.join(REPO_ROOT, RECORD.graphEdit.script)),
};
// Output names: the original copy through a bare onnxruntime session, the exposed copy through kokoro-js itself.
const origSession = await rt.ort.InferenceSession.create(modelFile(ORIGINAL_MODEL_ID));
const originalOutputs = origSession.outputNames.slice();
const originalInputs = origSession.inputNames.slice();
await origSession.release?.();
const { loadMs, inputNames, outputNames, dtype, device } = await loadKokoro(rt);
const checks = {
  pinnedMatchesRecord: hashes.pinnedModel === RECORD.pinnedModel,
  originalCopyUnchanged: hashes.originalCopy === RECORD.pinnedModel,
  exposedMatchesRecord: hashes.exposedCopy === RECORD.exposedModel,
  tokenizerMatchesRecord: hashes.tokenizer === RECORD.tokenizer && hashes.tokenizerConfig === RECORD.tokenizerConfig && hashes.config === RECORD.config && hashes.tokenizerOriginalCopy === RECORD.tokenizer,
  voiceBellaMatchesRecord: hashes.voice_af_bella === RECORD.voice_af_bella,
  originalOutputsWaveformOnly: originalOutputs.length === 1 && originalOutputs[0] === "waveform",
  exposedListsDurations: Array.isArray(outputNames) && outputNames.includes("waveform") && outputNames.includes("durations"),
};
const pass = Object.values(checks).every(Boolean);
const identity = {
  schema: "narrate-rebuild-1/phase0/identity@1",
  recordedAt: new Date().toISOString(),
  pass, checks, hashes, record: RECORD,
  model: { id: EXPOSED_MODEL_ID, originalId: ORIGINAL_MODEL_ID, dtype, device, threadSettings: "onnxruntime-node defaults (no session_options set)", envThreads: { OMP_NUM_THREADS: process.env.OMP_NUM_THREADS ?? null, ORT_NUM_THREADS: process.env.ORT_NUM_THREADS ?? null }, loadMs: Math.round(loadMs), originalInputs, originalOutputs, exposedInputs: inputNames, exposedOutputs: outputNames },
  runtime: rt.versions,
  host: rt.host,
  paths: { modelsRoot: MODELS_ROOT, pinned: PINNED, repoRoot: REPO_ROOT },
};
fs.mkdirSync(PHASE0_DIR, { recursive: true });
fs.writeFileSync(path.join(PHASE0_DIR, "identity.json"), JSON.stringify(identity, null, 1) + "\n");
console.log(JSON.stringify({ pass, checks, exposedOutputs: outputNames, originalOutputs, loadMs: Math.round(loadMs) }));
process.exit(pass ? 0 : 1);
