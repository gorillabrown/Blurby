// Read-only control: round-trip synthetic PCM through the repo's own main/tts-opus.js.
const opus = require("C:/Projects/Blurby/main/tts-opus.js");
const SR = 24000;
function run(len, clicks) {
  const pcm = new Float32Array(len);
  // Gaussian-windowed 1 kHz tone bursts (opus at 64 kbps preserves these; a lone impulse is smeared)
  for (const c of clicks) for (let i = -240; i <= 240; i++) {
    const n = c + i; if (n < 0 || n >= len) continue;
    pcm[n] += 0.8 * Math.exp(-(i * i) / (2 * 60 * 60)) * Math.cos(2 * Math.PI * 1000 * i / SR);
  }
  const dec = opus.decode(opus.encode(pcm, SR)).audio;
  // locate each burst by envelope-weighted cross-correlation against the original burst
  const offs = clicks.map(c => {
    let best = -1e9, bestLag = 0;
    for (let lag = -400; lag <= 400; lag++) {
      let s = 0;
      for (let i = -240; i <= 240; i++) { const a = pcm[c + i] || 0, b = dec[c + i + lag] || 0; s += a * b; }
      if (s > best) { best = s; bestLag = lag; }
    }
    return bestLag;
  });
  return { inSamples: len, outSamples: dec.length, extraSamples: dec.length - len, extraMs: ((dec.length - len) / SR * 1000).toFixed(2), burstOffsetsSamples: offs, burstOffsetsMs: offs.map(o => (o / SR * 1000).toFixed(2)) };
}
console.log(JSON.stringify(run(24000, [2400, 12000, 21000])));
console.log(JSON.stringify(run(24001, [2400, 12000, 21000])));
console.log(JSON.stringify(run(24480 - 1, [2400, 12000])));
console.log(JSON.stringify(run(17000, [1200, 9000, 15000])));
