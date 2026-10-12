// F3 refute probe: run the repo's patched kokoro-js (CJS) in plain Node against a COPY of the
// owner's model cache. No network (allowRemoteModels=false), no writes outside scratch.
const path = require("path");
const fs = require("fs");
const REPO = "C:/Projects/Blurby";
const W = process.argv[2]; // scratch work dir
const OUT = path.join(W, "out");
const kokoroDir = path.join(REPO, "node_modules", "kokoro-js", "dist");
const tf = require(require.resolve("@huggingface/transformers", { paths: [kokoroDir] }));
tf.env.allowRemoteModels = false;
tf.env.allowLocalModels = true;
tf.env.localModelPath = path.join(W, "models") + "/";
tf.env.cacheDir = path.join(OUT, "tfcache");
tf.env.useFSCache = false;
const { KokoroTTS } = require(path.join(kokoroDir, "kokoro.cjs"));

const now = () => Number(process.hrtime.bigint()) / 1e6;
const warns = [];
const ow = console.warn;
console.warn = (...a) => { warns.push(a.join(" ")); };

const PASSAGES = {
  // Meditations, Book I (public domain, Long translation style)
  med: "From my grandfather Verus I learned good morals and the government of my temper. From the reputation and remembrance of my father, modesty and a manly character. From my mother, piety and beneficence, and abstinence, not only from evil deeds, but even from evil thoughts.",
  stress: "In 1867, Dr. Smith paid $4.50 for 3 books; the the books were old, worn, and loved.",
};

function rms(pcm, start, end) { let s = 0, n = 0; for (let i = Math.max(0, start); i < Math.min(pcm.length, end); i++) { s += pcm[i] * pcm[i]; n++; } return n ? Math.sqrt(s / n) : 0; }

// Independent reference: silences found from the waveform alone (5 ms frames).
function silences(pcm, sr, { frameMs = 5, minMs = 40, rel = 0.03 } = {}) {
  const F = Math.round(sr * frameMs / 1000); const n = Math.floor(pcm.length / F); const e = [];
  for (let i = 0; i < n; i++) e.push(rms(pcm, i * F, (i + 1) * F));
  const peak = Math.max(...e); const thr = peak * rel; const out = []; let s = -1;
  for (let i = 0; i <= n; i++) {
    const quiet = i < n && e[i] < thr;
    if (quiet && s < 0) s = i;
    if (!quiet && s >= 0) { if ((i - s) * frameMs >= minMs) out.push([s * frameMs / 1000, i * frameMs / 1000]); s = -1; }
  }
  return { out, thr, peak };
}

(async () => {
  const report = { node: process.version, platform: process.platform, arch: process.arch, cpus: require("os").cpus().length, cpuModel: require("os").cpus()[0].model };
  let t0 = now();
  const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q4", device: "cpu" });
  report.loadMs = now() - t0;
  const sess = tts.model.sessions && (tts.model.sessions.model || Object.values(tts.model.sessions)[0]);
  report.outputNames = sess && sess.outputNames; report.inputNames = sess && sess.inputNames;
  t0 = now(); const hello = await tts.generate("Hello.", { voice: "af_bella", speed: 1.0 }); report.warmupMs = now() - t0;
  const RAP = Object.getPrototypeOf(hello); report.rawAudioKeys = Object.keys(hello); report.rawAudioHasData = "data" in hello;
  const shim = (on) => { if (on) Object.defineProperty(RAP, "data", { get() { return this.audio; }, configurable: true }); else delete RAP.data; };

  // Wrap tokenizer to record every call (full text + per-word calls inside _alignWordsToTimestamps).
  const origTok = tts.tokenizer; let calls = []; let noSpecials = false;
  tts.tokenizer = (text, opts) => { const o = noSpecials && calls.length > 0 ? { ...opts, add_special_tokens: false } : opts; const r = origTok(text, o); calls.push({ text, ids: Array.from(r.input_ids.data, Number) }); return r; };

  report.runs = [];
  for (const [name, text] of Object.entries(PASSAGES)) {
    const words = text.split(/\s+/).filter(Boolean);
    for (const speed of [0.8, 1.0, 1.4, 2.0]) {
      for (const mode of ["asShipped", "dataShim", "dataShimNoSpecials"]) {
        calls = []; warns.length = 0; noSpecials = mode === "dataShimNoSpecials"; shim(mode !== "asShipped");
        t0 = now();
        const audio = await tts.generate(text, { voice: "af_bella", speed, words });
        const genMs = now() - t0;
        const pcm = audio.audio; const sr = audio.sampling_rate; const dur = audio._durations ? Array.from(audio._durations) : null;
        const full = calls[0]; const perWord = calls.slice(1);
        const rd = dur ? dur.map((d) => Math.max(0, Math.round(d))) : [];
        const sumBins = rd.reduce((a, b) => a + b, 0);
        const run = { name, speed, mode, genMs: Math.round(genMs), pcmSamples: pcm.length, sr, audioSec: +(pcm.length / sr).toFixed(3),
          fullIdsLen: full.ids.length, fullFirstLast: [full.ids[0], full.ids.at(-1)], durLen: dur && dur.length,
          sumRoundedBins: sumBins, samplesPerBin: +(pcm.length / sumBins).toFixed(2),
          perWordLens: perWord.map((c) => c.ids.length), perWordSpecialWrapped: perWord.filter((c) => c.ids[0] === 0 && c.ids.at(-1) === 0).length,
          warns: [...warns], gotTable: !!audio.wordTimestamps };
        // Identity check: per-word content ids joined by the space id vs the synthesized sequence.
        const strip = (ids) => (ids[0] === 0 && ids.at(-1) === 0 ? ids.slice(1, -1) : ids);
        const spaceId = (() => { const r = origTok(" ", { add_special_tokens: false }); return Number(r.input_ids.data[0]); })();
        const joined = []; perWord.forEach((c, i) => { if (i) joined.push(spaceId); joined.push(...strip(c.ids)); });
        const synth = strip(full.ids);
        let firstDiff = -1; for (let i = 0; i < Math.max(joined.length, synth.length); i++) if (joined[i] !== synth[i]) { firstDiff = i; break; }
        run.identity = { joinedLen: joined.length, synthLen: synth.length, exactMatch: firstDiff === -1, firstDiff, fullPhonemes: full.text, perWordPhonemes: perWord.map((c) => c.text) };
        if (audio.wordTimestamps) {
          const ts = audio.wordTimestamps; const sil = silences(pcm, sr);
          // For each detected interior silence, find the table's nearest word end before it / word start after it.
          run.silenceCheck = sil.out.filter(([a, b]) => a > 0.05 && b < pcm.length / sr - 0.05).map(([a, b]) => {
            let prev = null, next = null;
            for (const w of ts) { if (w.endTime <= (a + b) / 2) prev = w; if (!next && w.startTime >= (a + b) / 2) next = w; }
            return { silStart: a, silEnd: b, prevWord: prev && prev.word, prevEnd: prev && +prev.endTime.toFixed(3), errEndMs: prev && Math.round((prev.endTime - a) * 1000), nextWord: next && next.word, nextStart: next && +next.startTime.toFixed(3), errStartMs: next && Math.round((next.startTime - b) * 1000) };
          });
          run.table = ts.map((w) => [w.word, +w.startTime.toFixed(3), +w.endTime.toFixed(3)]);
          if (name === "med" && speed === 1.0) {
            const wav = Buffer.alloc(44 + pcm.length * 2); wav.write("RIFF", 0); wav.writeUInt32LE(36 + pcm.length * 2, 4); wav.write("WAVEfmt ", 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(sr, 24); wav.writeUInt32LE(sr * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write("data", 36); wav.writeUInt32LE(pcm.length * 2, 40);
            for (let i = 0; i < pcm.length; i++) wav.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(pcm[i] * 32767))), 44 + i * 2);
            fs.writeFileSync(path.join(OUT, `med_1.0_${mode}.wav`), wav);
          }
        }
        report.runs.push(run);
      }
    }
  }
  // Warm latency: a start-sized chunk (~13 words) at several rates, 3 repeats, words supplied (production path).
  const start = "From my mother, piety and beneficence, and abstinence, not only from evil deeds.";
  report.latency = [];
  noSpecials = true; shim(true);
  for (const speed of [0.8, 1.0, 1.4, 2.0]) for (let k = 0; k < 3; k++) { calls = []; t0 = now(); const a = await tts.generate(start, { voice: "af_bella", speed, words: start.split(/\s+/) }); report.latency.push({ speed, k, ms: Math.round(now() - t0), gotTable: !!a.wordTimestamps, audioSec: +(a.audio.length / 24000).toFixed(2) }); }
  fs.writeFileSync(path.join(OUT, "probe-report.json"), JSON.stringify(report, null, 1));
  console.log(JSON.stringify({ loadMs: report.loadMs, warmupMs: report.warmupMs, outputNames: report.outputNames, inputNames: report.inputNames }, null, 0));
})().catch((e) => { ow("FAIL", e && e.stack || e); process.exit(1); });
