// Control: exact source->output sample map from the repo's WSOLA loop (traced copy), compared with the global t/tempoFactor rule.
import { stretchTempoPitchPreserving } from "./tempoStretchTraced.mts";
const SR = 24000;
let seed = 777; const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
function speechLike(sec) { // voiced bursts with pauses, like words
  const n = Math.round(sec * SR), a = new Float32Array(n); let t = 0.02;
  while (t < sec - 0.2) { const dur = 0.12 + rnd() * 0.25, f0 = 90 + rnd() * 120, s = Math.round(t * SR), e = Math.min(n, Math.round((t + dur) * SR));
    for (let i = s; i < e; i++) { const tt = (i - s) / SR; let v = 0; for (let h = 1; h <= 6; h++) v += Math.sin(2 * Math.PI * f0 * h * tt * (1 + 0.1 * tt)) / h; a[i] = 0.25 * v; }
    t += dur + 0.03 + rnd() * 0.12; }
  return a; }
function run(label, a, tf) {
  globalThis.__trace = [];
  const out = stretchTempoPitchPreserving(a, SR, tf);
  const tr = globalThis.__trace; const W = 960, HOP = 960 - 336; // 40 ms window, 14 ms overlap at 24 kHz
  // map source sample s -> output position via the last hop whose copied window starts at or before s
  const errs = [];
  for (let s = W; s < a.length - 2 * W; s += 240) {
    let best = null; for (const [op, cand] of tr) if (cand <= s && s < cand + W) best = [op, cand];
    if (!best) continue; const actual = best[0] + (s - best[1]); errs.push((actual - s / tf) / SR * 1000);
  }
  const abs = errs.map(Math.abs);
  console.log(JSON.stringify({ label, tempoFactor: +tf.toFixed(4), hops: tr.length, outLen: out.length, idealLen: Math.round(a.length / tf),
    meanErrMs: +(errs.reduce((x, y) => x + y, 0) / errs.length).toFixed(1), maxAbsErrMs: +Math.max(...abs).toFixed(1), finalErrMs: +errs[errs.length - 1].toFixed(1) }));
}
for (const tf of [0.8, 1.05, 1.1, 1.25, 1.3333333]) { run("speech-like 6s", speechLike(6), tf); }
for (const tf of [1.05, 1.3333333]) { const sil = new Float32Array(SR * 3); run("pure silence 3s", sil, tf); }
