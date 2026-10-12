// Read-only control: round-trip PCM through the repo's own main/tts-opus.js and measure length/offset change.
const opus = require(process.argv[2]);
const SR = 24000;
function make(len, onset) {
  const a = new Float32Array(len);
  for (let i = onset; i < Math.min(len, onset + 4800); i++) a[i] = 0.5 * Math.sin(2 * Math.PI * 440 * (i - onset) / SR);
  return a;
}
function onsetOf(a, thr) { for (let i = 0; i < a.length; i++) if (Math.abs(a[i]) > thr) return i; return -1; }
function bestLag(ref, dec, maxLag) {
  let best = 0, bestV = -Infinity;
  for (let lag = -maxLag; lag <= maxLag; lag++) {
    let s = 0;
    for (let i = 0; i < ref.length; i++) { const j = i + lag; if (j >= 0 && j < dec.length) s += ref[i] * dec[j]; }
    if (s > bestV) { bestV = s; best = lag; }
  }
  return best;
}
for (const len of [24000, 24017, 36123, 7211]) {
  const onset = Math.floor(len / 3);
  const pcm = make(len, onset);
  const enc = opus.encode(pcm, SR);
  const dec = opus.decode(enc);
  const lag = bestLag(pcm, dec.audio, 400);
  console.log(JSON.stringify({ inSamples: len, outSamples: dec.audio.length, extraSamples: dec.audio.length - len,
    extraMs: +((dec.audio.length - len) / SR * 1000).toFixed(3), sampleRate: dec.sampleRate,
    onsetIn: onsetOf(pcm, 0.05), onsetOut: onsetOf(dec.audio, 0.05), xcorrLagSamples: lag, xcorrLagMs: +(lag / SR * 1000).toFixed(3) }));
}
