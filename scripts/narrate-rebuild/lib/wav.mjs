// 16-bit PCM WAV writer for the Phase 0 audio artifacts (outside the repository).
import fs from "node:fs";
import path from "node:path";

export function writeWav(file, pcm, sampleRate) {
  const buf = Buffer.alloc(44 + pcm.length * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + pcm.length * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24); buf.writeUInt32LE(sampleRate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(pcm.length * 2, 40);
  for (let i = 0; i < pcm.length; i++) buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(pcm[i] * 32767))), 44 + i * 2);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
  return buf.length;
}

export function readWav(file) {
  const buf = fs.readFileSync(file);
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 36, 40) !== "data") throw new Error("not a plain 16-bit WAV: " + file);
  const sampleRate = buf.readUInt32LE(24);
  const n = buf.readUInt32LE(40) / 2;
  const pcm = new Float32Array(n);
  for (let i = 0; i < n; i++) pcm[i] = buf.readInt16LE(44 + i * 2) / 32767;
  return { pcm, sampleRate };
}
