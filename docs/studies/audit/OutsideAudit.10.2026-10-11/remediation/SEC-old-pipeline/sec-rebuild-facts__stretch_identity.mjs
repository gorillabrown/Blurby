// Control: with the UNMODIFIED repo algorithm (copied verbatim except one type annotation), is the "stretched" output just the source prefix?
import { applyKokoroTempoStretch } from "./tempoStretch.mts";
const SR = 24000; let seed = 99; const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
function speechLike(n, noise) { const a = new Float32Array(n); for (let i = 0; i < n; i++) a[i] = noise * (rnd() * 2 - 1);
  let t = 0.01; while (t < n / SR - 0.05) { const dur = 0.1 + rnd() * 0.2, f0 = 90 + rnd() * 120, s = Math.round(t * SR), e = Math.min(n, Math.round((t + dur) * SR));
    for (let i = s; i < e; i++) { const tt = (i - s) / SR; let v = 0; for (let h = 1; h <= 6; h++) v += Math.sin(2 * Math.PI * f0 * h * tt * (1 + 0.3 * tt)) / h; a[i] += 0.25 * v; }
    t += dur + 0.02 + rnd() * 0.08; } return a; }
const ui = []; for (let h = 80; h <= 200; h += 5) ui.push(h / 100);
const buckets = [1.0, 1.2, 1.5]; const bucketOf = r => { let c = buckets[0], d = Math.abs(r - c); for (let i = 1; i < 3; i++) { const x = Math.abs(r - buckets[i]); if (x < d) { d = x; c = buckets[i]; } } return c; };
for (const speed of ui) {
  const b = bucketOf(speed), tf = speed / b; const n = Math.round(0.85 * tf * SR); const src = speechLike(n, 0.003);
  const r = applyKokoroTempoStretch({ audio: src, sampleRate: SR, durationMs: n / SR * 1000, silenceMs: 0, wordTimestamps: [{ word: "x", startTime: 0.5, endTime: 0.6 }], kokoroRatePlan: { tempoFactor: tf } });
  let maxDiffVsPrefix = 0; for (let i = 0; i < r.audio.length; i++) maxDiffVsPrefix = Math.max(maxDiffVsPrefix, Math.abs(r.audio[i] - (src[i] ?? 0)));
  let prefixLen = 0; while (prefixLen < r.audio.length && Math.abs(r.audio[prefixLen] - src[prefixLen]) < 1e-6) prefixLen++;
  console.log(JSON.stringify({ uiSpeed: speed, bucket: b, tempoFactor: +tf.toFixed(4), applied: r.applied, srcMs: +(n / SR * 1000).toFixed(1), outMs: +(r.audio.length / SR * 1000).toFixed(1),
    outputEqualsSourcePrefixForMs: +(prefixLen / SR * 1000).toFixed(1), maxDiffVsPrefix: +maxDiffVsPrefix.toFixed(4), tableWordAt500msNowSaysMs: +(r.wordTimestamps[0].startTime * 1000).toFixed(1) }));
}
