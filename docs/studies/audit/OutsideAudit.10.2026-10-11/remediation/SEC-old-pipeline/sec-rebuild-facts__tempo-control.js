const { stretchTempoPitchPreserving, applyKokoroTempoStretch } = require("./tempoStretch.cjs");
const SR = 24000;
// voiced-like signal: harmonic tone with pitch glide + bursts at known positions (word onsets)
function signal(len, onsets) {
  const x = new Float32Array(len);
  let ph = 0;
  for (let n = 0; n < len; n++) { const f0 = 120 + 40 * Math.sin(2 * Math.PI * n / (SR * 0.7)); ph += 2 * Math.PI * f0 / SR; x[n] = 0.15 * (Math.sin(ph) + 0.5 * Math.sin(2 * ph) + 0.3 * Math.sin(3 * ph)); }
  for (const c of onsets) for (let i = -240; i <= 240; i++) { const n = c + i; if (n >= 0 && n < len) x[n] += 0.8 * Math.exp(-(i * i) / (2 * 60 * 60)) * Math.cos(2 * Math.PI * 2500 * i / SR); }
  return x;
}
function locate(x, y, c, expected) { // find burst in y near expected via correlation with burst template from x
  let best = -1e9, at = expected;
  for (let p = expected - 1200; p <= expected + 1200; p++) { let s = 0; for (let i = -240; i <= 240; i += 1) { const a = 0.8 * Math.exp(-(i * i) / 7200) * Math.cos(2 * Math.PI * 2500 * i / SR); s += a * (y[p + i] || 0); } if (s > best) { best = s; at = p; } }
  return at;
}
const onsets = [3000, 9100, 15333, 22222, 30001, 38500, 45000];
const x = signal(48000, onsets);
for (const [speed, bucket] of [[0.8,1.0],[1.1,1.0],[1.35,1.2],[1.75,1.5],[2.0,1.5]]) {
  const tf = speed / bucket;
  const r = applyKokoroTempoStretch({ audio: x, sampleRate: SR, durationMs: 2000, silenceMs: 0, wordTimestamps: onsets.map((o, i) => ({ word: "w" + i, startTime: o / SR, endTime: (o + 100) / SR })), kokoroRatePlan: { selectedSpeed: speed, generationBucket: bucket, tempoFactor: tf } });
  const errs = onsets.map((o, i) => { const pred = Math.round(r.wordTimestamps[i].startTime * SR); const act = locate(x, r.audio, o, pred); return +(((act - pred) / SR) * 1000).toFixed(2); });
  console.log(JSON.stringify({ speed, bucket, tempoFactor: +tf.toFixed(4), applied: r.applied, outLen: r.audio.length, globalLen: Math.round(48000 / tf), errMs_actualMinusTable: errs, maxAbsErrMs: Math.max(...errs.map(Math.abs)) }));
}
