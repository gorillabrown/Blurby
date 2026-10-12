// Control on REAL narration audio (repo-committed loopback WAV, read-only): does the repo stretch keep the source prefix unchanged?
import { readFileSync } from "node:fs";
import { applyKokoroTempoStretch } from "./tempoStretch.mts";
const buf = readFileSync(process.argv[2]);
let p = 12, fmt = null, data = null; while (p < buf.length) { const id = buf.toString("ascii", p, p + 4), sz = buf.readUInt32LE(p + 4);
  if (id === "fmt ") fmt = { tag: buf.readUInt16LE(p + 8), ch: buf.readUInt16LE(p + 10), sr: buf.readUInt32LE(p + 12), bits: buf.readUInt16LE(p + 22) };
  if (id === "data") data = buf.subarray(p + 8, p + 8 + sz); p += 8 + sz + (sz & 1); }
const n = data.length / (fmt.bits / 8) / fmt.ch; const mono = new Float32Array(n);
for (let i = 0; i < n; i++) { let s = 0; for (let c = 0; c < fmt.ch; c++) { const o = (i * fmt.ch + c) * (fmt.bits / 8); s += fmt.bits === 16 ? buf.readInt16LE(data.byteOffset - buf.byteOffset + o) / 32768 : fmt.tag === 3 ? data.readFloatLE(o) : data.readInt32LE(o) / 2147483648; } mono[i] = s / fmt.ch; }
// resample to 24 kHz linearly (only to match the scheduler's rate; content is what matters)
const SR = 24000, ratio = fmt.sr / SR, m = Math.floor(n / ratio), a = new Float32Array(m); for (let i = 0; i < m; i++) { const x = i * ratio, k = Math.floor(x), f = x - k; a[i] = mono[k] + f * ((mono[k + 1] ?? mono[k]) - mono[k]); }
let rms = 0; for (const v of a) rms += v * v; rms = Math.sqrt(rms / a.length);
console.log(JSON.stringify({ fmt, seconds: +(n / fmt.sr).toFixed(2), rms: +rms.toFixed(4) }));
const results = {};
for (const tf of [0.8, 0.9167, 1.0417, 1.0833, 1.1, 1.3, 1.3333]) {
  let identical = 0, total = 0, droppedMs = 0;
  for (let start = SR * 2; start + 1.2 * SR < a.length; start += Math.round(0.9 * SR)) {
    const len = Math.round(0.85 * tf * SR); const seg = a.slice(start, start + len);
    let e = 0; for (const v of seg) e += v * v; if (Math.sqrt(e / seg.length) < 0.01) continue; // skip silent windows
    const r = applyKokoroTempoStretch({ audio: seg, sampleRate: SR, durationMs: len / SR * 1000, silenceMs: 0, wordTimestamps: null, kokoroRatePlan: { tempoFactor: tf } });
    let k = 0; while (k < r.audio.length && Math.abs(r.audio[k] - seg[k]) < 1e-6) k++;
    total++; if (k >= Math.min(r.audio.length, seg.length) - 0.03 * SR) identical++;
    if (tf > 1) droppedMs += (seg.length - r.audio.length) / SR * 1000;
  }
  results[tf] = { segments: total, outputIsUnchangedSourcePrefix: identical, avgSourceMsDroppedPerSegment: tf > 1 ? +(droppedMs / total).toFixed(1) : null };
}
console.log(JSON.stringify(results, null, 1));
