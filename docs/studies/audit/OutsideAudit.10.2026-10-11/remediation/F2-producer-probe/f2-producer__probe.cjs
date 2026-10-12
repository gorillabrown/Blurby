// Read-only probe of the installed (patched) kokoro-js against a scratch copy of the owner's cached model.
// Network is blocked; nothing under the repo or %APPDATA% is written.
const { createRequire } = require("module");
const path = require("path");
const W = __dirname;
const kokoroPath = "C:/Projects/Blurby/node_modules/kokoro-js/dist/kokoro.cjs";
const req = createRequire(kokoroPath);
globalThis.fetch = async (u) => { throw new Error("NETWORK BLOCKED " + u); };
const tf = req("@huggingface/transformers");
tf.env.allowRemoteModels = false;
tf.env.allowLocalModels = true;
tf.env.localModelPath = path.join(W, "models") + "/";
tf.env.cacheDir = path.join(W, "cache");
tf.env.useFSCache = false;
const { KokoroTTS } = require(kokoroPath);

const warns = [];
const origWarn = console.warn;
console.warn = (...a) => { warns.push(a.join(" ")); };

function ids(t) { const x = t.input_ids; return Array.from(x.data, Number); }

(async () => {
  const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q4", device: "cpu" });
  const sess = tts.model.sessions.model || Object.values(tts.model.sessions)[0];
  console.log("ONNX inputNames", sess.inputNames, "outputNames", sess.outputNames);

  // 1. Tokenizer: does a per-call tokenize add specials?
  for (const s of ["həlˈoʊ", "a", ""]) {
    const t = tts.tokenizer(s, { truncation: true });
    console.log("tokenize", JSON.stringify(s), "dims", t.input_ids.dims, "ids", ids(t));
  }

  const voice = process.argv[2] || "af_bella";
  const sentences = [
    "Hello world.",
    "The quick brown fox jumps over the lazy dog.",
    "It was a bright cold day in April, and the clocks were striking thirteen.",
    "She paid $5.50 for 3 apples in 1984.",
  ];
  const out = [];
  for (const text of sentences) {
    warns.length = 0;
    const words = text.split(/\s+/).filter(Boolean);
    const audio = await tts.generate(text, { voice, speed: 1, words });
    const dur = audio._durations ? Array.from(audio._durations) : null;
    const rounded = dur ? dur.map((d) => Math.max(0, Math.round(d))) : null;
    const sumFrames = rounded ? rounded.reduce((a, b) => a + b, 0) : null;
    const fullPh = await (async () => {
      // re-derive the synthesis phonemes and ids exactly as generate() does
      const n2 = tts._validate_voice(voice);
      return null;
    })();
    out.push({
      text,
      words: words.length,
      waveformSamples: (audio.audio || audio.data).length, hasDataGetter: audio.data !== undefined, hasDurations: audio._durations !== undefined, hasWordTimestamps: Object.prototype.hasOwnProperty.call(audio, "wordTimestamps"),
      durationsLen: dur ? dur.length : null,
      durationsRawHead: dur ? dur.slice(0, 8) : null,
      sumRoundedFrames: sumFrames,
      samplesPerFrame: null,
      wordTimestamps: audio.wordTimestamps || null,
      warnings: warns.slice(),
    });
  }
  console.log(JSON.stringify(out, null, 1));
})().catch((e) => { origWarn("FATAL", e && e.stack || e); process.exit(1); });
