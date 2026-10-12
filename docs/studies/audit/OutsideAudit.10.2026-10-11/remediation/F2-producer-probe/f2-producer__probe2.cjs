// Run the installed PATCHED kokoro-js against a scratch model copy that also exposes the internal
// pred_dur tensor (/encoder/Clip_output_0, float, post-round, post-clamp(min=1)) as "durations".
// Read-only on repo and %APPDATA%; network blocked.
const { createRequire } = require("module");
const path = require("path");
const W = __dirname;
const kokoroPath = "C:/Projects/Blurby/node_modules/kokoro-js/dist/kokoro.cjs";
const req = createRequire(kokoroPath);
globalThis.fetch = async (u) => { throw new Error("NETWORK BLOCKED " + u); };
const tf = req("@huggingface/transformers");
Object.assign(tf.env, { allowRemoteModels: false, allowLocalModels: true, localModelPath: path.join(W, "models") + "/", cacheDir: path.join(W, "cache"), useFSCache: false });
const { KokoroTTS } = require(kokoroPath);
const warns = []; const origWarn = console.warn; console.warn = (...a) => warns.push(a.join(" "));

(async () => {
  const tts = await KokoroTTS.from_pretrained("local/kokoro-dur", { dtype: "q4", device: "cpu" });
  const calls = []; const origTok = tts.tokenizer;
  tts.tokenizer = (text, opts) => { const r = origTok(text, opts); calls.push({ text, ids: Array.from(r.input_ids.data, Number) }); return r; };
  const vocab = origTok.model.tokens_to_ids || origTok.model.vocab; // Map or object
  const SPACE = vocab instanceof Map ? vocab.get(" ") : vocab[" "];
  const voice = process.argv[2] || "af_bella";
  const sentences = [
    "Hello world.",
    "The quick brown fox jumps over the lazy dog.",
    "It was a bright cold day in April, and the clocks were striking thirteen.",
    "I have a dream that one day this nation will rise up.",
    "She paid $5.50 for 3 apples in 1984.",
  ];
  const results = [];
  for (const text of sentences) {
    warns.length = 0; calls.length = 0;
    const words = text.split(/\s+/).filter(Boolean);
    const audio = await tts.generate(text, { voice, speed: 1, words });
    const wav = audio.audio || audio.data;
    const dur = audio._durations ? Array.from(audio._durations) : null;
    const full = calls[0];
    const perWord = calls.slice(1);
    const sumDur = dur ? dur.reduce((a, b) => a + b, 0) : null;
    // patch arithmetic, reproduced
    const tokenCounts = perWord.map((c) => c.ids.length);
    const expected = 1 + tokenCounts.reduce((a, b) => a + b, 0) + Math.max(0, words.length - 1) + 1;
    // context spans from the actual synthesis token stream (split on the space token)
    const inner = full.ids.slice(1, -1);
    const spans = []; let cur = [];
    inner.forEach((id, i) => { if (id === SPACE) { spans.push(cur); cur = []; } else cur.push(i + 1); });
    spans.push(cur);
    const wordPhCtx = full.text.split(" ");
    let corrected = null, contextual = null, maxBoundaryErrMs = null;
    if (dur) {
      const HOP = 600, SR = 24000;
      // (a) patch method with the two fixes (strip 2 specials per word, hop 600)
      const fixedCounts = tokenCounts.map((n) => Math.max(0, n - 2));
      let off = 1, s = dur[0] * HOP; corrected = [];
      for (let w = 0; w < words.length; w++) {
        const st = s; for (let t = 0; t < fixedCounts[w]; t++) s += (dur[off + t] ?? NaN) * HOP;
        corrected.push([st / SR, s / SR]); off += fixedCounts[w];
        if (w < words.length - 1) { s += (dur[off] ?? NaN) * HOP; off += 1; }
      }
      // (b) context spans
      const cum = [0]; dur.forEach((d) => cum.push(cum[cum.length - 1] + d * HOP));
      contextual = spans.map((sp) => sp.length ? [cum[sp[0]] / SR, cum[sp[sp.length - 1] + 1] / SR] : null);
      if (contextual.length === corrected.length) {
        maxBoundaryErrMs = Math.max(...corrected.map((c, i) => contextual[i] ? Math.max(Math.abs(c[0] - contextual[i][0]), Math.abs(c[1] - contextual[i][1])) * 1000 : 0));
      }
    }
    results.push({
      text, nWords: words.length, waveformSamples: wav.length, durationsLen: dur && dur.length,
      fullIdsLen: full.ids.length, firstLastIds: [full.ids[0], full.ids[full.ids.length - 1]],
      sumDurFrames: sumDur, samplesPerFrame: sumDur ? wav.length / sumDur : null,
      patchPredictedSecAt256: sumDur ? (sumDur * 256) / 24000 : null, actualSec: wav.length / 24000,
      patchExpectedTokens: expected, patchDelta: dur ? dur.length - expected : null,
      perWordPhonemes: perWord.map((c) => c.text), contextPhonemes: wordPhCtx,
      phonemeMismatches: perWord.map((c, i) => c.text !== wordPhCtx[i] ? [words[i], c.text, wordPhCtx[i]] : null).filter(Boolean),
      perWordTokenCountsWithSpecials: tokenCounts, contextSpanCounts: spans.map((s) => s.length),
      wordTimestampsFromPatch: audio.wordTimestamps || null,
      correctedPatchMethodSec: corrected, contextSpansSec: contextual, maxBoundaryErrMs_correctedVsContext: maxBoundaryErrMs,
      warnings: warns.slice(),
    });
  }
  console.log(JSON.stringify(results, null, 1));
})().catch((e) => { origWarn("FATAL", (e && e.stack) || e); process.exit(1); });
