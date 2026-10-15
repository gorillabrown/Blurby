// NARRATE-REBUILD-1 D2 log-half check (Blurby.Brain criteria, 2026-10-15). Usage: node scripts/narrate-rebuild/d2-crossing-check.cjs <trace.json> <firstWordIdx> <boundaryIdx> [--break]
// 1. the first voiced word is the expected word ("ancient");
// 2. across the boundary the voiced units follow the text order: chunks contiguous (next chunkStart = previous chunkEnd),
//    units strictly increasing inside each chunk, the committed cursor sequence equal to the scheduled units in order
//    (nothing skipped, repeated or out of order), and no stop between the first word and the boundary;
// 3. timing (boundary gap, latency) is printed for information only.
const fs = require("fs"), path = require("path");
const repo = path.resolve(__dirname, "../..");
const [tracePath, firstArg, boundaryArg] = process.argv.slice(2);
const FIRST = Number(firstArg), BOUNDARY = Number(boundaryArg), BREAK = process.argv.includes("--break");
const { extractWords } = require(path.join(repo, "main/epub-word-extractor.js"));
(async () => {
  const text = (await extractWords(path.join(repo, "resources/sample-meditations.epub"))).words;
  const ev = JSON.parse(fs.readFileSync(tracePath, "utf8")).events;
  const fails = [];
  const fv = ev.filter((e) => e.kind === "narrate-first-voiced");
  const sched = ev.filter((e) => e.kind === "narrate-schedule").sort((a, b) => a.startAt - b.startAt);
  let commits = ev.filter((e) => e.kind === "narrate-commit").map((e) => e.word);
  if (BREAK) commits = commits.filter((w) => w !== commits.find((x) => x >= BOUNDARY)); // plant a dropped unit at the boundary
  const stops = ev.filter((e) => e.kind === "narrate-stop");
  // 1
  const firstSched = sched[0];
  const firstWord = firstSched ? firstSched.unitStarts[0] : null;
  if (fv.length < 1 || fv[0].word !== FIRST || firstWord !== FIRST || commits[0] !== FIRST) fails.push(`first voiced: request ${fv[0]?.word}, first unit ${firstWord}, first commit ${commits[0]} (want ${FIRST})`);
  // 2: scheduled units in order, chunks contiguous
  const units = [];
  sched.forEach((s, i) => {
    if (i > 0 && s.chunkStart !== sched[i - 1].chunkEnd) fails.push(`chunk gap: ${sched[i - 1].chunkStart}-${sched[i - 1].chunkEnd} then ${s.chunkStart}`);
    if (s.unitStarts[0] !== s.chunkStart) fails.push(`chunk ${s.chunkStart} first unit ${s.unitStarts[0]}`);
    s.unitStarts.forEach((u, k) => { if (k > 0 && u <= s.unitStarts[k - 1]) fails.push(`unit order in chunk ${s.chunkStart}: ${s.unitStarts[k - 1]} then ${u}`); units.push(u); });
  });
  const crossed = sched.some((s) => s.chunkStart >= BOUNDARY) && commits.some((w) => w >= BOUNDARY);
  if (!crossed) fails.push(`never crossed word ${BOUNDARY}`);
  // committed sequence = scheduled units, compared up to the last committed word
  for (let i = 0; i < commits.length; i++) if (commits[i] !== units[i]) { fails.push(`commit ${i}: ${commits[i]} but unit ${units[i]} expected (prev ${commits[i - 1]})`); break; }
  const lastC = commits[commits.length - 1];
  const earlyStop = stops.find((s) => s.chunkStart < BOUNDARY);
  if (earlyStop) fails.push(`stop before the boundary: ${JSON.stringify(earlyStop)}`);
  const words = (a, b) => text.slice(a, b).join(" ");
  const ci = ev.filter((e) => e.kind === "narrate-commit");
  const bi = ci.findIndex((e) => e.word >= BOUNDARY);
  const gapMs = bi > 0 ? +((ci[bi].t - ci[bi - 1].t)).toFixed(1) : null;
  const gaps = ci.slice(1).map((e, i) => e.t - ci[i].t).sort((a, b) => b - a);
  const out = {
    verdict: fails.length ? "FAIL" : "PASS", failures: fails, break: BREAK,
    firstVoiced: { index: firstWord, text: text[firstWord], context: words(FIRST - 4, FIRST + 4), latencyMs: fv[0] ? Math.round(fv[0].latencyS * 1000) : null, cause: fv[0]?.cause },
    crossing: { boundary: BOUNDARY, boundaryText: words(BOUNDARY, BOUNDARY + 3), committedAround: bi > 0 ? ci.slice(Math.max(0, bi - 4), bi + 5).map((e) => `${e.word}:${text[e.word]}`) : null, chunksAround: sched.filter((s) => s.chunkEnd >= BOUNDARY - 30 && s.chunkStart <= BOUNDARY + 30).map((s) => [s.chunkStart, s.chunkEnd]), gapAtBoundaryMs: gapMs, worstGapsMs: gaps.slice(0, 3).map((g) => +g.toFixed(1)) },
    counts: { commits: commits.length, scheduledUnits: units.length, chunks: sched.length, stops: stops.map((s) => ({ chunkStart: s.chunkStart, reason: s.reason })), firstCommit: commits[0], lastCommit: lastC },
  };
  console.log(JSON.stringify(out, null, 2));
  process.exit(fails.length ? 1 : 0);
})();
