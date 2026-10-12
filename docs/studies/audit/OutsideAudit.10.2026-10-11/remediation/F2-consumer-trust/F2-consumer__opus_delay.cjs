const opus = require("C:/Projects/Blurby/main/tts-opus.js");
const SR = 24000, N = 54000; // 2.25 s, same as harness chunk
const pcm = new Float32Array(N);
const clicks = [2400, 12000, 30000, 50000];
for (const c of clicks) for (let k = 0; k < 24; k++) pcm[c + k] = 0.8 * Math.sin(Math.PI * k / 24); // 1 ms bumps
const dec = opus.decode(opus.encode(pcm, SR)).audio;
const peakNear = (a, c) => { let best = -1, bi = -1; for (let i = Math.max(0, c - 600); i < Math.min(a.length, c + 600); i++) if (Math.abs(a[i]) > best) { best = Math.abs(a[i]); bi = i; } return bi; };
const origPeaks = clicks.map(c => peakNear(pcm, c + 12));
const decPeaks = clicks.map(c => peakNear(dec, c + 12));
console.log(JSON.stringify({ origLen: N, decodedLen: dec.length, extraSamples: dec.length - N, extraMs: ((dec.length - N) / SR * 1000).toFixed(2),
  shiftsSamples: decPeaks.map((d, i) => d - origPeaks[i]), shiftsMs: decPeaks.map((d, i) => ((d - origPeaks[i]) / SR * 1000).toFixed(2)) }));
