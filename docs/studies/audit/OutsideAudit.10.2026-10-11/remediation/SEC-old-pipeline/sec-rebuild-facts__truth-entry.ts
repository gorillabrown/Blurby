import { segmentKokoroChunk } from "C:/Projects/Blurby/src/utils/audio/segmentKokoroChunk";
import { createAudioScheduler, getTimingTelemetry } from "C:/Projects/Blurby/src/utils/audioScheduler";
let now = 0; const started: any[] = [];
(globalThis as any).AudioContext = class { currentTime = 0; state = "running"; destination = {}; get _t() { return now; }
  createBuffer(_c: number, len: number, sr: number) { return { length: len, sampleRate: sr, copyToChannel() {} }; }
  createBufferSource() { const s: any = { connect() {}, disconnect() {}, start(t: number) { started.push({ t, len: s.buffer.length }); }, stop() {}, onended: null }; return s; }
  resume() { return Promise.resolve(); } };
let rafQ: any[] = []; (globalThis as any).requestAnimationFrame = (f: any) => { rafQ.push(f); return rafQ.length; }; (globalThis as any).cancelAnimationFrame = () => {};
const words = ["It", "was", "a", "bright", "cold", "day", "in", "April,", "and", "the", "clocks", "were", "striking", "thirteen."];
const SR = 24000; const audio = new Float32Array(SR * 3); // 3 s, NO native timestamps
const segs = segmentKokoroChunk({ audio, sampleRate: SR, durationMs: 3000, words, startIdx: 0, wordTimestamps: null, timingTruth: "word-native", silenceMs: 0,
  kokoroRatePlan: { selectedSpeed: 1, generationBucket: 1, tempoFactor: 1 } } as any, { maxSegmentDurationMs: 850, minSegmentWords: 1 });
console.log("segments:", segs.length, "each has wordTimestamps:", segs.every(s => Array.isArray(s.wordTimestamps) && s.wordTimestamps.length === s.words.length));
const sched = createAudioScheduler(); const adv: any[] = []; const ctx0 = () => (sched.getContext() as any);
sched.setCallbacks({ onWordAdvance: (i: number, trusted: boolean) => adv.push(["advance", i, +ctx0().currentTime.toFixed(3)]), onTruthSync: (i: number, trusted: boolean) => adv.push(["truthSync", i, +ctx0().currentTime.toFixed(3), trusted]), onChunkBoundary() {}, onEnd() {}, onError() {} } as any);
sched.play(); for (const s of segs) sched.scheduleChunk(s as any);
console.log("telemetry timestampSource per segment:", getTimingTelemetry().map((t: any) => t.timestampSource));
// advance the clock and run RAF ticks
const ctx: any = sched.getContext(); for (let k = 0; k < 400; k++) { ctx.currentTime = k * 0.01; const q = rafQ; rafQ = []; q.forEach(f => f()); }
console.log("overlap ms between consecutive sources:", started.slice(1).map((s, i) => +(((started[i].t + started[i].len / SR) - s.t) * 1000).toFixed(3)));
console.log("onWordAdvance (wordIndex, isTrusted):", JSON.stringify(adv));
