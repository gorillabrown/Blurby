"use strict";
// main/narrate/producer-worker.js — the rebuilt Narrate's producer, in a worker thread (NARRATE-REBUILD-1 P3).
// Loads the duration-exposed Kokoro copy with an explicit intra-op thread count, wraps kokoro-js's production
// generate() path in the capture seams (main/narrate/capture.js) and returns, per chunk, the exact word table
// built from what the model returned (main/narrate/wordmap.js) together with the PCM. It never repairs,
// estimates or relabels: a chunk whose mapping does not reconcile is returned with reconciled=false and its
// failures, and the renderer refuses it (F4). Communicates with producer.js via parentPort.

const { parentPort, workerData } = require("worker_threads");
const path = require("path");
const Module = require("module");
const { attachCapture, synthesize } = require("./capture");
const { buildWordMap } = require("./wordmap");
const { mapUnitsToSourceWords } = require("./normalize");
const C = require("./constants");

const OPTIONAL_PACKAGED_MODULE_STUBS = new Map([["sharp", path.join(__dirname, "..", "sharp-stub.js")]]);

let tts = null, capture = null, ready = false, loaded = false, runtime = null;

// Packaged app: kokoro-js, transformers and phonemizer live unpacked beside the asar and must be required by
// explicit CJS entry points (main/tts-worker.js documents why). The phonemizer redirect keeps kokoro-js and
// the capture on the same module instance, which the phonemize seam depends on.
async function withPackagedModuleResolution(modulePath, callback) {
  const origResolve = Module._resolveFilename;
  Module._resolveFilename = function (request, parent, isMain, options) {
    if (request === "phonemizer") return path.join(modulePath, "phonemizer", "dist", "phonemizer.cjs");
    try {
      return origResolve.call(this, request, parent, isMain, options);
    } catch (err) {
      const stubPath = OPTIONAL_PACKAGED_MODULE_STUBS.get(request);
      if (err?.code === "MODULE_NOT_FOUND" && stubPath) return stubPath;
      throw err;
    }
  };
  try { return await callback(); } finally { Module._resolveFilename = origResolve; }
}

function loadModules(modulePath) {
  if (modulePath) {
    return withPackagedModuleResolution(modulePath, async () => {
      const kokoro = require(path.join(modulePath, "kokoro-js", "dist", "kokoro.cjs"));
      const tf = require(path.join(modulePath, "@huggingface", "transformers", "dist", "transformers.node.cjs"));
      const ph = require(path.join(modulePath, "phonemizer", "dist", "phonemizer.cjs"));
      return { kokoro, tf, ph };
    });
  }
  // Dev: require kokoro-js's CJS build by path (its exports map hides the subpath) and resolve its dependencies
  // from the same place, so the phonemizer instance the capture wraps is the one kokoro-js calls.
  const kokoroPath = path.join(__dirname, "..", "..", "node_modules", "kokoro-js", "dist", "kokoro.cjs");
  const req = Module.createRequire(kokoroPath);
  return { kokoro: require(kokoroPath), tf: req("@huggingface/transformers"), ph: req("phonemizer") };
}

async function load({ modelsRoot, modulePath, threads }) {
  if (ready) return;
  if (!loaded) {
    const { kokoro, tf, ph } = await loadModules(modulePath);
    Object.assign(tf.env, { allowRemoteModels: false, allowLocalModels: true, localModelPath: modelsRoot.replace(/[\\/]*$/, "/"), useFSCache: false, useBrowserCache: false });
    const t0 = performance.now();
    // threads: a number sets onnxruntime's intra-op count (Decision #7); null keeps onnxruntime's own default.
    const model = await tf.StyleTextToSpeech2Model.from_pretrained(C.NARRATE_EXPOSED_MODEL_ID, {
      dtype: C.NARRATE_MODEL_DTYPE, device: "cpu",
      ...(threads === null ? {} : { session_options: { intraOpNumThreads: threads, interOpNumThreads: C.NARRATE_INTER_OP_THREADS } }),
    });
    const tokenizer = await tf.AutoTokenizer.from_pretrained(C.NARRATE_EXPOSED_MODEL_ID);
    tts = new kokoro.KokoroTTS(model, tokenizer);
    const sess = tts.model.sessions?.model ?? Object.values(tts.model.sessions ?? {})[0];
    const outputNames = sess?.outputNames ?? [];
    if (!outputNames.includes("durations")) throw new Error(`exposed model lists no durations output (outputs: ${outputNames.join(",")})`);
    capture = attachCapture(tts, ph);
    runtime = { loadMs: Math.round(performance.now() - t0), outputNames, threads: threads === null ? "onnxruntime default" : threads, modelsRoot };
    loaded = true;
    parentPort.postMessage({ type: "model-loaded", runtime });
  }
  // Warm-up on the production path is the readiness boundary: loaded != ready.
  await synthesize(tts, capture, C.NARRATE_WARMUP_TEXT, { voice: C.NARRATE_DEFAULT_VOICE, speed: 1.0 });
  ready = true;
  parentPort.postMessage({ type: "model-ready", runtime });
}

const epochNow = () => performance.timeOrigin + performance.now();

async function generate(id, text, voice, speed, recv = epochNow()) {
  try {
    if (!ready) { parentPort.postMessage({ type: "result", id, error: "producer not ready" }); return; }
    const start = epochNow();
    const rec = await synthesize(tts, capture, text, { voice, speed });
    const synthDone = epochNow();
    const wm = await buildWordMap(rec, capture.phonemizeIsolated);
    const mapDone = epochNow();
    // The units' words are the spoken (normalized, punctuation-free) words; the engine needs the chunk's source words
    // (NARRATE-REBUILD-1 P5). mapUnitsToSourceWords is exact and verified against the capture; it throws (F4) otherwise.
    const units = wm.reconciled ? mapUnitsToSourceWords(text, rec.segments, wm.units) : wm.units;
    const table = {
      provenance: rec.provenance,
      durations: rec.durations,
      durationsType: rec.durationsType,
      samplesPerFrame: wm.law.factor,
      sampleRate: rec.sampleRate,
      units: units.map((u) => ({ words: u.words, spoken: u.spoken ?? u.words, kind: u.kind, frameStart: u.frameStart, frameEnd: u.frameEnd, sampleStart: u.sampleStart, sampleEnd: u.sampleEnd })),
      reconciled: wm.reconciled,
      failures: wm.failures,
      identity: wm.identity.ok,
      law: { ok: wm.law.ok, sumFrames: wm.law.sumFrames, factor: wm.law.factor },
      tokens: rec.ids.length,
      leadFrames: wm.leadFrames,
      tailFrames: wm.tailFrames,
    };
    const pcm = rec.pcm;
    // D6 analysis: epoch ms at receipt, the start of synthesis, its end, the word map's end, the post.
    const stages = { recv, start, synthDone, mapDone, post: epochNow() };
    parentPort.postMessage({ type: "result", id, table, pcm, sampleRate: rec.sampleRate, genMs: Math.round(rec.genMs), stages }, [pcm.buffer]);
  } catch (err) {
    parentPort.postMessage({ type: "result", id, error: err?.message || String(err) });
  }
}

// Stop (P5): no new generation starts; the ones in progress finish (onnxruntime cannot abort a run, and a thread
// ended under a live native run takes the process down with 0xC0000409); then the thread exits.
const inflight = new Set();
let stopping = false;

// Diagnostics (NARRATE_PRODUCER_LOG=1 only): report any stall of this worker's event loop over 200 ms.
if (process.env.NARRATE_PRODUCER_LOG === "1") {
  let last = epochNow();
  setInterval(() => {
    const now = epochNow();
    if (now - last > 250) {
      const m = process.memoryUsage();
      const mb = (b) => Math.round(b / 1048576);
      parentPort.postMessage({ type: "lag", ms: Math.round(now - last - 50), at: now, inflight: inflight.size, mem: `heap ${mb(m.heapUsed)}/${mb(m.heapTotal)} ext ${mb(m.external)} ab ${mb(m.arrayBuffers)} rss ${mb(m.rss)}` });
    }
    last = now;
  }, 50).unref();
}

parentPort.on("message", async (msg) => {
  switch (msg.type) {
    case "stop":
      stopping = true;
      await Promise.allSettled([...inflight]);
      process.exit(0);
      break;
    case "load":
      try { await load(msg); } catch (err) { parentPort.postMessage({ type: "load-error", error: err?.message || String(err), stack: err?.stack }); }
      break;
    case "generate": {
      if (stopping) { parentPort.postMessage({ type: "result", id: msg.id, error: "producer stopping" }); break; }
      const run = generate(msg.id, msg.text, msg.voice, msg.speed, epochNow());
      inflight.add(run);
      await run;
      inflight.delete(run);
      break;
    }
    case "status":
      parentPort.postMessage({ type: "status", id: msg.id, loaded, ready, runtime });
      break;
  }
});
