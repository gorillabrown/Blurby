// Cheap independent reference: waveform-only pause detection, and its threshold sensitivity.
const path = require("path"); const fs = require("fs");
const W = process.argv[2]; const kokoroDir = "C:/Projects/Blurby/node_modules/kokoro-js/dist";
const tf = require(require.resolve("@huggingface/transformers", { paths: [kokoroDir] }));
Object.assign(tf.env, { allowRemoteModels: false, allowLocalModels: true, localModelPath: path.join(W, "models") + "/", cacheDir: path.join(W, "out", "tfcache"), useFSCache: false });
const { KokoroTTS } = require(path.join(kokoroDir, "kokoro.cjs"));
const TEXT = "From my grandfather Verus I learned good morals and the government of my temper. From the reputation and remembrance of my father, modesty and a manly character. From my mother, piety and beneficence, and abstinence, not only from evil deeds, but even from evil thoughts.";
function env(pcm, F) { const e = []; for (let i = 0; i + F <= pcm.length; i += F) { let s = 0; for (let j = i; j < i + F; j++) s += pcm[j] * pcm[j]; e.push(Math.sqrt(s / F)); } return e; }
function sil(e, frameMs, rel, minMs) { const thr = Math.max(...e) * rel; const out = []; let s = -1; for (let i = 0; i <= e.length; i++) { const q = i < e.length && e[i] < thr; if (q && s < 0) s = i; if (!q && s >= 0) { if ((i - s) * frameMs >= minMs) out.push([s * frameMs, i * frameMs]); s = -1; } } return out; }
(async () => {
  const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q4", device: "cpu" });
  const res = {};
  for (const speed of [1.0, 2.0]) {
    const a = await tts.generate(TEXT, { voice: "af_bella", speed }); const pcm = a.audio; const sr = a.sampling_rate;
    const e = env(pcm, Math.round(sr * 0.005));
    const byThr = {}; for (const rel of [0.01, 0.02, 0.03, 0.05]) byThr[rel] = sil(e, 5, rel, speed === 1 ? 60 : 35).filter(([s, t]) => s > 50 && t < pcm.length / sr * 1000 - 50);
    res[speed] = { audioMs: Math.round(pcm.length / sr * 1000), byThr };
  }
  fs.writeFileSync(path.join(W, "out", "silence-report.json"), JSON.stringify(res, null, 1));
  for (const [sp, r] of Object.entries(res)) { console.log("speed", sp, "audioMs", r.audioMs); for (const [rel, s] of Object.entries(r.byThr)) console.log("  rel", rel, "n", s.length, JSON.stringify(s)); }
})().catch((e) => { console.error(e); process.exit(1); });
