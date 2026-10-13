// NARRATE-REBUILD-1 P5 — D3 recorded-output check, and the in-app half of D5 (charter rows D3, D5).
// Reads eval-trace files written by main.js setupTtsEvalTraceCapture (BLURBY_TTS_EVAL_TRACE_DIR) from Narrate
// sessions and checks, per highlight commit, that the playback clock at the commit — the output timestamp pair
// extrapolated to the commit's frame timestamp, recomputed here from the raw fields, never the engine's own
// figure — sits within one display frame after the unit's table boundary. The audio-clock ↔ performance.now
// mapping must hold to MAPPING_LIMIT_MS over the session (a straight line, drift allowed), else the file is
// INCONCLUSIVE, never a pass. The schedules and stops must describe non-overlapping sounding intervals, and the
// commits inside every chunk played to its end must name its units once each, in order (no drop, no repeat).
//
// Usage: node scripts/narrate-rebuild/p5-recorded-output-check.mjs <trace.json ...> [--min-minutes 5] [--break]
// Exit 0 = PASS on every file; 1 = any FAIL or INCONCLUSIVE. --break plants a late commit in the first file's
// records before analysis and must exit 1 (the positive control, LL-151). Nothing here estimates timing.
import fs from "node:fs";

export const FRAME_TOLERANCE_MS = 1;   // measurement slack on either side of the refresh interval
export const MAPPING_LIMIT_MS = 10;    // D3: clock-mapping uncertainty ceiling
export const MIN_COMMITS = 100;

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

/** Max |residual| of ys against the least-squares line over xs (a drifting but steady clock pair is one line). */
export function maxLineResidual(xs, ys) {
  const n = xs.length;
  if (n < 2) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) { sxx += (xs[i] - mx) ** 2; sxy += (xs[i] - mx) * (ys[i] - my); }
  const b = sxx === 0 ? 0 : sxy / sxx;
  const a = my - b * mx;
  let worst = 0;
  for (let i = 0; i < n; i++) worst = Math.max(worst, Math.abs(ys[i] - (a + b * xs[i])));
  return worst;
}

/** Sounding intervals from the schedule and stop records: [startAt, min(endAt, stop.at)). */
export function soundingIntervals(schedules, stops) {
  const out = [];
  for (let i = 0; i < schedules.length; i++) {
    const s = schedules[i];
    const next = schedules.slice(i + 1).find((x) => x.chunkStart === s.chunkStart);
    const stop = stops.find((x) => x.chunkStart === s.chunkStart && x.t >= s.t && (!next || x.t < next.t));
    const end = Math.min(s.endAt, stop ? stop.at : Infinity);
    if (end > s.startAt) out.push({ start: s.startAt, end, schedule: s, stopped: Boolean(stop) });
  }
  return out.sort((a, b) => a.start - b.start);
}

export function analyze(events, { minMinutes = 5 } = {}) {
  const commits = events.filter((e) => e.kind === "narrate-commit");
  const schedules = events.filter((e) => e.kind === "narrate-schedule");
  const stops = events.filter((e) => e.kind === "narrate-stop");
  const firstVoiced = events.filter((e) => e.kind === "narrate-first-voiced");
  const failures = [];
  const holds = [];
  const stats = { commits: commits.length, schedules: schedules.length, stops: stops.length, requests: firstVoiced.length };

  if (commits.length < MIN_COMMITS) holds.push(`only ${commits.length} commits (need ${MIN_COMMITS})`);
  const minutes = commits.length ? (commits.at(-1).t - commits[0].t) / 60000 : 0;
  stats.minutes = +minutes.toFixed(2);
  if (minutes < minMinutes) holds.push(`session ${minutes.toFixed(2)} min < ${minMinutes} min`);
  stats.speeds = [...new Set(commits.map((c) => c.speed))].sort((a, b) => a - b);

  // The display refresh interval: the median tick interval the commits recorded.
  const dts = commits.map((c) => c.frameDt).filter((x) => typeof x === "number" && x > 0 && x < 1000);
  const refreshMs = median(dts);
  stats.refreshMs = refreshMs === null ? null : +refreshMs.toFixed(2);
  if (refreshMs === null) holds.push("no frame interval recorded");

  // Clock mapping: otsCtx against otsPerf over the session is one line within the limit.
  const mapped = commits.filter((c) => typeof c.otsCtx === "number" && typeof c.otsPerf === "number");
  if (mapped.length < 2) { holds.push("no output timestamps recorded"); stats.mappingSpreadMs = null; }
  else {
    const spread = maxLineResidual(mapped.map((c) => c.otsPerf / 1000), mapped.map((c) => c.otsCtx)) * 1000;
    stats.mappingSpreadMs = +spread.toFixed(2);
    if (spread > MAPPING_LIMIT_MS) holds.push(`clock-mapping uncertainty ${spread.toFixed(1)} ms > ${MAPPING_LIMIT_MS} ms`);
  }

  // Lateness on the playback clock, recomputed from the raw pair (the engine's nowCtx is not trusted here). One
  // display frame is the session's refresh interval, or the commit's own frame when that frame ran long (the
  // commit is made at the first tick after the boundary, so a long frame is the frame it lands in).
  const outside = [];
  let worstLateMs = null;
  const baseLimit = (refreshMs ?? 0) + FRAME_TOLERANCE_MS;
  for (const c of mapped) {
    const playback = c.otsCtx + (c.t - c.otsPerf) / 1000;
    const lateMs = (playback - c.boundaryCtx) * 1000;
    const frame = typeof c.frameDt === "number" && c.frameDt > 0 && c.frameDt < 1000 ? c.frameDt : 0;
    const limit = Math.max(baseLimit, frame + FRAME_TOLERANCE_MS);
    if (worstLateMs === null || Math.abs(lateMs) > Math.abs(worstLateMs)) worstLateMs = lateMs;
    if (lateMs < -FRAME_TOLERANCE_MS || lateMs > limit) outside.push({ word: c.word, lateMs: +lateMs.toFixed(2), frameMs: +frame.toFixed(2) });
  }
  stats.outside = outside.length;
  stats.worstLateMs = worstLateMs === null ? null : +worstLateMs.toFixed(2);
  stats.limitMs = +baseLimit.toFixed(2);
  if (outside.length) failures.push(`${outside.length} commits outside one display frame (worst ${stats.worstLateMs} ms, refresh limit ${stats.limitMs})`);
  const failed = events.filter((e) => e.kind === "narrate-failure");
  stats.failures = failed.map((e) => ({ reason: e.reason, atWord: e.atWord, detail: e.detail }));
  if (failed.length) failures.push(`${failed.length} chunk failures (F4): ${failed.map((e) => `${e.reason}@${e.atWord}${e.detail ? " " + String(e.detail).slice(0, 80) : ""}`).join("; ")}`);

  // D5 in the app: no two sounding intervals overlap.
  const intervals = soundingIntervals(schedules, stops);
  let overlaps = 0;
  for (let i = 1; i < intervals.length; i++) if (intervals[i].start < intervals[i - 1].end - 1e-6) overlaps++;
  stats.overlaps = overlaps;
  if (overlaps) failures.push(`${overlaps} overlapping sounding intervals`);

  // D5 in the app: a chunk played to its end commits every unit once, in order.
  let drops = 0, repeats = 0, fullChunks = 0;
  for (const iv of intervals) {
    if (iv.stopped) continue;
    fullChunks++;
    const inside = commits.filter((c) => c.chunkStart === iv.schedule.chunkStart && c.nowCtx >= iv.start - 1e-9 && c.nowCtx < iv.end + 1e-9).map((c) => c.word);
    const expected = iv.schedule.unitStarts.filter((w, i) => iv.schedule.unitBoundaryCtx[i] >= iv.start - 1e-9);
    const seen = new Set();
    for (const w of inside) { if (seen.has(w)) repeats++; seen.add(w); }
    for (const w of expected) if (!seen.has(w)) drops++;
    for (let i = 1; i < inside.length; i++) if (inside[i] < inside[i - 1]) repeats++;
  }
  stats.fullChunks = fullChunks; stats.drops = drops; stats.repeats = repeats;
  if (drops) failures.push(`${drops} units never committed inside a fully played chunk (drop)`);
  if (repeats) failures.push(`${repeats} units committed twice or out of order (repeat)`);

  // Informational: the worst first-voiced latency per request cause on the playback clock (D6 has its own script).
  stats.latency = {};
  for (const r of firstVoiced) stats.latency[r.cause] = Math.max(stats.latency[r.cause] ?? 0, +(r.latencyS * 1000).toFixed(0));

  const verdict = failures.length ? "FAIL" : holds.length ? "INCONCLUSIVE" : "PASS";
  return { verdict, failures, holds, stats, outside: outside.slice(0, 20) };
}

export function readTraceEvents(file) {
  const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  return Array.isArray(parsed) ? parsed : Array.isArray(parsed.events) ? parsed.events : [];
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop());
if (isMain) {
  const args = process.argv.slice(2);
  const minIdx = args.indexOf("--min-minutes");
  const minMinutes = minIdx >= 0 ? Number(args[minIdx + 1]) : 5;
  const breakIt = args.includes("--break");
  const files = args.filter((a, i) => !a.startsWith("--") && !(minIdx >= 0 && i === minIdx + 1));
  if (!files.length) { console.error("usage: p5-recorded-output-check.mjs <trace.json ...> [--min-minutes N] [--break]"); process.exit(2); }
  let exit = 0;
  files.forEach((file, i) => {
    const events = readTraceEvents(file);
    if (breakIt && i === 0) {
      const c = events.find((e) => e.kind === "narrate-commit");
      if (c) c.t += 100; // a commit a tenth of a second late on the playback clock
    }
    const r = analyze(events, { minMinutes });
    console.log(JSON.stringify({ file, ...r }));
    if (r.verdict !== "PASS") exit = 1;
  });
  process.exit(exit);
}
