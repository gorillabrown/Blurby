// Read-only probe of the patched kokoro-js producer, offline, scratch model cache.
import { createRequire } from "module";
import { pathToFileURL } from "url";
import fs from "fs";
const require = createRequire(import.meta.url);
const BL = "C:/Projects/Blurby/node_modules/";
const CACHE = process.argv[2];
const MODE = process.argv[3] || "esm"; // esm = dev path, cjs = packaged path
let kokoro, tenv, resolved;
if (MODE === "esm") {
  resolved = BL + "kokoro-js/dist/kokoro.js";
  kokoro = await import(pathToFileURL(resolved).href);
  tenv = (await import(pathToFileURL(BL + "@huggingface/transformers/dist/transformers.node.mjs").href)).env;
} else {
  resolved = require.resolve(BL + "kokoro-js"); // CJS resolution via exports.node.require
  kokoro = require(resolved);
  tenv = require(BL + "@huggingface/transformers").env;
}
const src = fs.readFileSync(resolved, "utf8");
console.log("RESOLVED", MODE, resolved, "hasPatch", src.includes("_alignWordsToTimestamps") && src.includes("HOP_LENGTH=256"));
tenv.cacheDir = CACHE; tenv.localModelPath = CACHE; tenv.allowRemoteModels = false; tenv.allowLocalModels = true;
const { normalizeSegmentText, filterSpokenWords } = require("./norm.cjs");

const t0 = Date.now();
const tts = await kokoro.KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q4", device: "cpu" });
console.log("LOADED ms", Date.now() - t0);

// instrumentation (wrappers only; no behavior change)
const tokLog = [];
const origTok = tts.tokenizer;
tts.tokenizer = new Proxy(origTok, { apply(t, th, args) { const r = Reflect.apply(t, th, args); const ids = r.input_ids; tokLog.push({ text: args[0], ids: Array.from(ids.data, Number) }); return r; } });
const modelLog = [];
const origModel = tts.model;
const realModel = origModel;
const sess = realModel.sessions ? Object.fromEntries(Object.entries(realModel.sessions).map(([k,v])=>[k,{inputs:v.inputNames,outputs:v.outputNames}])) : null;
console.log("SESSIONS", JSON.stringify(sess));
tts.model = async (inputs) => { const out = await realModel(inputs); modelLog.push({ outKeys: Object.keys(out), outDims: Object.fromEntries(Object.entries(out).map(([k,v])=>[k,[v?.type,v?.dims]])), dur: out.durations ? Array.from(out.durations.data, Number) : null, idsLen: inputs.input_ids.dims.at(-1) }); return out; };
const warns = [];
const ow = console.warn; console.warn = (...a) => { warns.push(a.join(" ")); };

// warm-up exactly as the worker does
await tts.generate("Hello.", { voice: "af_bella", speed: 1.0 });
tokLog.length = 0; modelLog.length = 0; warns.length = 0;

const texts = ["The cat sat on the mat.", "In 1984, Dr. Smith paid $3.50 for it.", "Wait. Wait, wait! Really?"];
const results = [];
for (const speed of [1.0, 1.5]) for (const raw of texts) {
  tokLog.length = 0; modelLog.length = 0; warns.length = 0;
  // production path: kokoroStrategy.ts:379-388
  const displayWords = raw.split(/\s+/);
  const { spokenWords } = filterSpokenWords(displayWords);
  const words = spokenWords.length > 0 ? spokenWords : displayWords;
  const text = normalizeSegmentText(words.join(" "), { locale: "en-US" }).normalizedText;
  const audio = await tts.generate(text, { voice: "af_bella", speed, words });
  const m = modelLog[0];
  const D = m.dur || []; const durSumRaw = D.reduce((a, b) => a + b, 0);
  const durSumRound = D.reduce((a, b) => a + Math.max(0, Math.round(b)), 0);
  const full = tokLog[0];
  const perWord = tokLog.slice(1).map((x) => ({ ipa: x.text, len: x.ids.length, ids: x.ids }));
  results.push({
    speed, raw, text, words, samples: audio.audio.length, sr: audio.sampling_rate, audioHasDataField: audio.data !== undefined,
    outKeys: m.outKeys, outDims: m.outDims, hasAudioDurations: audio._durations !== undefined,
    fullPhonemes: full.text, fullIdsLen: full.ids.length, fullIds: full.ids,
    durLen: m.dur ? m.dur.length : null, durSumRaw, durSumRound,
    samplesPerDurRaw: audio.audio.length / durSumRaw, samplesPerDurRound: audio.audio.length / durSumRound,
    perWord, sumPerWordLens: perWord.reduce((a, b) => a + b.len, 0),
    alignSynthetic: await (async () => { tokLog.length = 0; const fake = new Float32Array(full.ids.length).fill(5); try { const r = await tts._alignWordsToTimestamps(words, fake, speed, full.text, audio.audio.length); return { ok: true, n: r.length, perWordLens: tokLog.map(x=>x.ids.length) }; } catch (e) { return { ok: false, err: e.message, perWordLens: tokLog.map(x=>x.ids.length), perWordIds: tokLog.map(x=>x.ids) }; } })(),
    wordTimestamps: audio.wordTimestamps ?? null, warns: [...warns], dur: m.dur,
  });
}
console.warn = ow;
// step 4: single word tokenization exactly as the patch does (tokenizer(ipa,{truncation:true}))
const single = origTok("kˈæt", { truncation: true });
const vocab = JSON.parse(fs.readFileSync(CACHE + "/onnx-community/Kokoro-82M-v1.0-ONNX/tokenizer.json", "utf8"));
results.push({ singleWord: { ipa: "kˈæt", ids: Array.from(single.input_ids.data, Number), dims: single.input_ids.dims }, post_processor: vocab.post_processor, spaceId: vocab.model.vocab[" "] });
fs.writeFileSync(new URL("./probe-out-" + MODE + ".json", import.meta.url), JSON.stringify(results, null, 1));
console.log("DONE");
