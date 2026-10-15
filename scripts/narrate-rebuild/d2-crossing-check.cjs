// NARRATE-REBUILD-1 D2 log-half check (Blurby.Brain criteria, 2026-10-15; P6b: the app's numbering, checked by text).
// Usage (pwsh): pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 scripts/narrate-rebuild/d2-crossing-check.cjs
//   <trace.json> <firstIdx> <firstText> <boundaryIdx> <boundaryText> [--min-past-s 120] [--break]
// 0. the indices name the expected words in the app's own numbering (book words from the app's Electron ICU), by text;
// 1. the first voiced word is the expected word ("ancient");
// 2. across the boundary the voiced units follow the text order: chunks contiguous (next chunkStart = previous chunkEnd),
//    units strictly increasing inside each chunk, the committed cursor sequence equal to the scheduled units in order
//    (nothing skipped, repeated or out of order), and no stop between the first word and the boundary;
// 3. the reading continues at least --min-past-s seconds past the boundary's first commit;
// 4. timing (boundary gap, latency) is printed for information only. Exit 0 PASS, 1 FAIL, 2 usage, 3 refused.
require("./lib/app-icu.cjs").assertAppIcu();
const fs = require("fs"), path = require("path");
const repo = path.resolve(__dirname, "../..");
const pos = process.argv.slice(2).filter((a, i, all) => !a.startsWith("--") && all[i - 1] !== "--min-past-s");
const [tracePath, firstArg, firstText, boundaryArg, boundaryText] = pos;
const FIRST = Number(firstArg), BOUNDARY = Number(boundaryArg), BREAK = process.argv.includes("--break");
const mp = process.argv.indexOf("--min-past-s");
const MIN_PAST_S = mp > 0 ? Number(process.argv[mp + 1]) : 120;
if (!tracePath || !Number.isInteger(FIRST) || !firstText || !Number.isInteger(BOUNDARY) || !boundaryText || !(MIN_PAST_S >= 0)) {
  console.error("usage: d2-crossing-check.cjs <trace.json> <firstIdx> <firstText> <boundaryIdx> <boundaryText> [--min-past-s 120] [--break]");
  process.exit(2);
}
const norm = (w) => String(w ?? "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
const { extractWords } = require(path.join(repo, "main/epub-word-extractor.js"));
(async () => {
  const text = (await extractWords(path.join(repo, "resources/sample-meditations.epub"))).words;
  const ev = JSON.parse(fs.readFileSync(tracePath, "utf8")).events;
  const fails = [];
  // 0: the numbering, by text
  if (norm(text[FIRST]) !== norm(firstText)) fails.push(`word ${FIRST} is "${text[FIRST]}", want "${firstText}" (numbering)`);
  if (norm(text[BOUNDARY]) !== norm(boundaryText)) fails.push(`word ${BOUNDARY} is "${text[BOUNDARY]}", want "${boundaryText}" (numbering)`);
  const fv = ev.filter((e) => e.kind === "narrate-first-voiced");
  const sched = ev.filter((e) => e.kind === "narrate-schedule").sort((a, b) => a.startAt - b.startAt);
  let ci = ev.filter((e) => e.kind === "narrate-commit");
  if (BREAK) { const drop = ci.find((e) => e.word >= BOUNDARY)?.word; ci = ci.filter((e) => e.word !== drop); } // plant a dropped unit at the boundary
  const commits = ci.map((e) => e.word);
  const stops = ev.filter((e) => e.kind === "narrate-stop");
  // 1
  const firstSched = sched[0];
  const firstWord = firstSched ? firstSched.unitStarts[0] : null;
  if (fv.length < 1 || fv[0].word !== FIRST || firstWord !== FIRST || commits[0] !== FIRST) fails.push(`first voiced: request ${fv[0]?.word}, first unit ${firstWord}, first commit ${commits[0]} (want ${FIRST})`);
  if (norm(text[commits[0]]) !== norm(firstText)) fails.push(`first committed word is "${text[commits[0]]}", want "${firstText}"`);
  // 2: scheduled units in order, chunks contiguous
  const units = [];
  sched.forEach((s, i) => {
    if (i > 0 && s.chunkStart !== sched[i - 1].chunkEnd) fails.push(`chunk gap: ${sched[i - 1].chunkStart}-${sched[i - 1].chunkEnd} then ${s.chunkStart}`);
    if (s.unitStarts[0] !== s.chunkStart) fails.push(`chunk ${s.chunkStart} first unit ${s.unitStarts[0]}`);
    s.unitStarts.forEach((u, k) => { if (k > 0 && u <= s.unitStarts[k - 1]) fails.push(`unit order in chunk ${s.chunkStart}: ${s.unitStarts[k - 1]} then ${u}`); units.push(u); });
  });
  const crossed = sched.some((s) => s.chunkStart >= BOUNDARY) && commits.some((w) => w >= BOUNDARY);
  if (!crossed) fails.push(`never crossed word ${BOUNDARY}`);
  for (let i = 0; i < commits.length; i++) if (commits[i] !== units[i]) { fails.push(`commit ${i}: ${commits[i]} but unit ${units[i]} expected (prev ${commits[i - 1]})`); break; }
  const lastC = commits[commits.length - 1];
  const earlyStop = stops.find((s) => s.chunkStart < BOUNDARY);
  if (earlyStop) fails.push(`stop before the boundary: ${JSON.stringify(earlyStop)}`);
  // 3: past the boundary
  const bi = ci.findIndex((e) => e.word >= BOUNDARY);
  const pastS = bi >= 0 ? +((ci[ci.length - 1].t - ci[bi].t) / 1000).toFixed(1) : null;
  if (crossed && !(pastS >= MIN_PAST_S)) fails.push(`only ${pastS} s past the boundary (want >= ${MIN_PAST_S} s)`);
  const words = (a, b) => text.slice(a, b).join(" ");
  const gapMs = bi > 0 ? +((ci[bi].t - ci[bi - 1].t)).toFixed(1) : null;
  const gaps = ci.slice(1).map((e, i) => e.t - ci[i].t).sort((a, b) => b - a);
  const out = {
    verdict: fails.length ? "FAIL" : "PASS", failures: fails, break: BREAK, icu: process.versions.icu, bookWords: text.length,
    firstVoiced: { index: firstWord, text: text[firstWord], context: words(FIRST - 4, FIRST + 4), latencyMs: fv[0] ? Math.round(fv[0].latencyS * 1000) : null, cause: fv[0]?.cause },
    crossing: { boundary: BOUNDARY, boundaryText: words(BOUNDARY, BOUNDARY + 3), pastBoundaryS: pastS, committedAround: bi > 0 ? ci.slice(Math.max(0, bi - 4), bi + 5).map((e) => `${e.word}:${text[e.word]}`) : null, chunksAround: sched.filter((s) => s.chunkEnd >= BOUNDARY - 30 && s.chunkStart <= BOUNDARY + 30).map((s) => [s.chunkStart, s.chunkEnd]), gapAtBoundaryMs: gapMs, worstGapsMs: gaps.slice(0, 3).map((g) => +g.toFixed(1)) },
    counts: { commits: commits.length, scheduledUnits: units.length, chunks: sched.length, stops: stops.map((s) => ({ chunkStart: s.chunkStart, reason: s.reason })), firstCommit: commits[0], lastCommit: lastC },
  };
  console.log(JSON.stringify(out, null, 2));
  process.exit(fails.length ? 1 : 0);
})();
