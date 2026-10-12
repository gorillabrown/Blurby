import { pump, gen, SR, initCache } from "./setup";
import { createKokoroStrategy } from "C:/Projects/Blurby/src/hooks/narration/kokoroStrategy";
import {
  createAudioScheduler,
  computeWordWeights,
  getTimingTelemetry,
  clearTimingTelemetry,
  type ScheduledChunk,
} from "C:/Projects/Blurby/src/utils/audioScheduler";
import { resolveKokoroRatePlan } from "C:/Projects/Blurby/src/utils/kokoroRatePlan";
import { segmentKokoroChunk } from "C:/Projects/Blurby/src/utils/audio/segmentKokoroChunk";

const WORDS = "The quick brown fox jumps over the lazy dog.".split(" ");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const out: Record<string, unknown> = {};

function nativeTable(words: string[]) {
  // A plausible "native" table: 0.2 s voiced + 0.05 s gap per word (deliberately not weight-shaped).
  return words.map((w, i) => ({ word: w, startTime: i * 0.25, endTime: i * 0.25 + 0.2 }));
}

async function runStrategy(label: string, opts: { bookId: string; speed: number; ts: any }) {
  gen.wordTimestamps = opts.ts;
  const callsBefore = gen.calls;
  clearTimingTelemetry();
  const rec = { segmentsIn: [] as any[], timingMetadata: [] as any[], truthSync: [] as any[], wordAdvance: [] as any[] };
  const strategy = createKokoroStrategy({
    getVoiceId: () => "af_heart",
    getSpeed: () => opts.speed,
    getStatus: () => "speaking",
    getWords: () => WORDS,
    getBookId: () => opts.bookId,
    onFallbackToWeb: () => { rec.truthSync.push({ fallbackToWeb: true }); },
    onTimingMetadata: (m) => rec.timingMetadata.push({
      chunkId: m.chunkId, timingTruth: m.timingTruth, timingClassification: m.timingClassification,
      hasTrustedWordTiming: m.hasTrustedWordTiming, words: `${m.chunkStartIdx}-${m.chunkEndIdx}`,
    }),
    onTruthSync: (e) => rec.truthSync.push({ w: e.resolvedWordIndex, trusted: e.isTrustedWordTiming, timingTruth: e.timingTruth }),
  });
  const sched = strategy.getScheduler();
  const orig = sched.scheduleChunk;
  (sched as any).scheduleChunk = (seg: ScheduledChunk) => {
    rec.segmentsIn.push({
      startIdx: seg.startIdx, n: seg.words.length, timingTruth: seg.timingTruth,
      wordTimestamps: seg.wordTimestamps ? seg.wordTimestamps.map((t) => +t.startTime.toFixed(4)) : null,
      durationMs: +seg.durationMs.toFixed(1), audioLen: seg.audio.length,
    });
    return orig(seg);
  };
  strategy.speakChunk("", [], 0, opts.speed, (w, trusted) => rec.wordAdvance.push({ w, trusted }), () => {}, () => {});
  for (let i = 0; i < 20 && rec.segmentsIn.length === 0; i++) await sleep(20);
  pump(4);
  const telemetry = getTimingTelemetry().map((t: any) => ({ startIdx: t.chunkStartIdx, source: t.timestampSource, durMs: +t.durationMs.toFixed(1), starts: t.realTimestamps ? t.realTimestamps.map((x: any) => +x.startTime.toFixed(4)) : null }));
  strategy.stop();
  out[label] = { generateCalls: gen.calls - callsBefore, ...rec, telemetry };
  return rec;
}

function weightedExpectation(words: string[], voicedSec: number) {
  const w = computeWordWeights(words);
  let c = 0;
  return w.map((x) => { const s = c; c += x * voicedSec; return +s.toFixed(4); });
}

function absoluteStarts(segmentsIn: any[]) {
  // Re-assemble segment-relative starts into chunk-relative seconds.
  const starts: number[] = [];
  let offset = 0;
  for (const s of segmentsIn) {
    for (const t of s.wordTimestamps ?? []) starts.push(+(offset + t).toFixed(4));
    offset += s.audioLen / SR;
  }
  return starts;
}

function readSidecars() {
  const fs = eval("require")("fs"); const p = eval("require")("path");
  const found: any[] = [];
  const walk = (d: string) => { for (const f of fs.readdirSync(d)) { const q = p.join(d, f); if (fs.statSync(q).isDirectory()) walk(q); else if (!f.endsWith(".opus") && f !== "manifest.json") { const j = JSON.parse(fs.readFileSync(q, "utf8")); found.push({ file: f, timingTruth: j.timingTruth, timingClassification: j.timingClassification, hasWordTimestamps: Array.isArray(j.wordTimestamps), durationMs: j.durationMs }); } } };
  walk(p.join(process.env.F2_SCRATCH, "userData"));
  return found;
}

async function main() {
  await initCache();

  // A. Production path, native timestamps missing (producer threw -> worker sends null), fresh cache.
  const a = await runStrategy("A_native_missing_fresh", { bookId: "book-A", speed: 1.0, ts: null });
  out["A_weighted_expectation"] = weightedExpectation(WORDS, (WORDS.length * 0.25));
  out["A_reassembled_starts"] = absoluteStarts(a.segmentsIn);

  // C. Same book/voice/speed again: cache hit through the real main/tts-cache.js + Opus round trip.
  await sleep(500);
  await runStrategy("C_cache_hit_after_native_missing", { bookId: "book-A", speed: 1.0, ts: null });

  // C2. Different book, same text/voice/bucket: content-indexed cross-book cache hit.
  await runStrategy("C2_cross_book_cache_hit", { bookId: "book-Z", speed: 1.0, ts: null });
  out["A_sidecars_on_disk"] = readSidecars();

  // D. Tempo path: UI speed 1.1 -> bucket 1.0, tempo 1.1, native missing.
  out["D_rate_plan"] = resolveKokoroRatePlan(1.1);
  await runStrategy("D_tempo_1_1_native_missing", { bookId: "", speed: 1.1, ts: null });

  // E. Native table present but in a different word space (count mismatch) -> remap fails.
  const misaligned = nativeTable([...WORDS, "extra"]);
  await runStrategy("E_native_misaligned", { bookId: "", speed: 1.0, ts: misaligned });

  // F. Positive control: a native table that matches the words.
  await runStrategy("F_native_ok", { bookId: "", speed: 1.0, ts: nativeTable(WORDS) });

  // B. Control: the scheduler's own fallback branch when segmentation is bypassed.
  {
    clearTimingTelemetry();
    const s = createAudioScheduler();
    const ev: any[] = [];
    const md: any[] = [];
    s.setCallbacks({
      onWordAdvance: (w, trusted, e) => ev.push({ w, trusted, timingTruth: e?.timingTruth }),
      onChunkBoundary: () => {}, onEnd: () => {}, onError: () => {},
      onTimingMetadata: (m) => md.push({ timingTruth: m.timingTruth, cls: m.timingClassification }),
    });
    s.play();
    const audio = new Float32Array(Math.round(2.25 * SR));
    s.scheduleChunk({ audio, sampleRate: SR, durationMs: 2250, words: WORDS, startIdx: 0, wordTimestamps: null, timingTruth: "word-native" });
    pump(4);
    out["B_unsegmented_null_table"] = { wordAdvance: ev, timingMetadata: md, telemetry: getTimingTelemetry().map((t: any) => t.timestampSource) };
    s.stop();
  }

  // B2. Same, but routed through segmentKokoroChunk with timingTruth undefined (legacy/no identity).
  {
    clearTimingTelemetry();
    const s = createAudioScheduler();
    const ev: any[] = [];
    const md: any[] = [];
    s.setCallbacks({
      onWordAdvance: (w, trusted, e) => ev.push({ w, trusted, timingTruth: e?.timingTruth }),
      onChunkBoundary: () => {}, onEnd: () => {}, onError: () => {},
      onTimingMetadata: (m) => md.push({ timingTruth: m.timingTruth, cls: m.timingClassification }),
    });
    s.play();
    const audio = new Float32Array(Math.round(2.25 * SR));
    for (const seg of segmentKokoroChunk({ audio, sampleRate: SR, durationMs: 2250, words: WORDS, startIdx: 0, wordTimestamps: null }, { maxSegmentDurationMs: 850, minSegmentWords: 1 })) {
      s.scheduleChunk(seg);
    }
    pump(4);
    out["B2_segmented_null_table_no_truth"] = { wordAdvance: ev, timingMetadata: md, telemetry: getTimingTelemetry().map((t: any) => t.timestampSource) };
    s.stop();
  }

  // G. Interior-boundary counterexample: same words, same total, monotone, different interior boundary.
  {
    const words = ["alpha", "beta"];
    const t1 = [{ word: "alpha", startTime: 0, endTime: 0.4 }, { word: "beta", startTime: 0.4, endTime: 1.0 }];
    const t2 = [{ word: "alpha", startTime: 0, endTime: 0.7 }, { word: "beta", startTime: 0.7, endTime: 1.0 }];
    const res: any[] = [];
    for (const ts of [t1, t2]) {
      clearTimingTelemetry();
      const s = createAudioScheduler();
      const ev: any[] = [];
      s.setCallbacks({ onWordAdvance: (w, trusted) => ev.push({ w, trusted }), onChunkBoundary: () => {}, onEnd: () => {}, onError: () => {} });
      s.play();
      s.scheduleChunk({ audio: new Float32Array(SR), sampleRate: SR, durationMs: 1000, words, startIdx: 0, wordTimestamps: ts });
      pump(2);
      res.push({ betaStart: ts[1].startTime, events: ev, telemetry: getTimingTelemetry().map((t: any) => t.timestampSource) });
      s.stop();
    }
    out["G_interior_boundary"] = res;
  }

  console.log("F2_RESULT " + JSON.stringify(out, null, 1));
  process.exit(0);
}

main().catch((e) => { console.error("HARNESS_ERROR", e); process.exit(1); });
