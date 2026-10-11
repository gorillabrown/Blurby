// Test-only analyzer for capture.mjs output. Reads dom.ndjson / console.ndjson / capture.json from one
// capture directory and prints a per-phase summary. It reports raw DOM facts only; it never infers a
// canonical index from word text, and it is not audible evidence.
// node analyze-capture.mjs <capture-dir> [--json]
import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
if (!dir) throw new Error("usage: analyze-capture.mjs <capture-dir> [--json]");
const lines = (file) => (fs.existsSync(path.join(dir, file)) ? fs.readFileSync(path.join(dir, file), "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);
const dom = lines("dom.ndjson");
const consoleEvents = lines("console.ndjson");
const capture = JSON.parse(fs.readFileSync(path.join(dir, "capture.json"), "utf8"));

const phaseOf = (label) => label.replace(/-(start|end)$/, "");
const activeIndices = (s) => s.surfaces.flatMap((surface) => surface.activeWords.map((w) => Number(w.rawWordIndex ?? w.rawWidx))).filter((n) => Number.isFinite(n));
const visibleWords = (s) => s.surfaces.reduce((n, surface) => n + surface.visibleWithinOwnDocumentCount, 0);
const domWords = (s) => s.surfaces.reduce((n, surface) => n + surface.wordCountInDom, 0);
const firstVisible = (s) => {
  for (const surface of s.surfaces) for (const w of surface.firstVisibleWords) { const n = Number(w.rawWordIndex ?? w.rawWidx); if (Number.isFinite(n)) return n; }
  return null;
};

const phases = [];
for (const s of dom) {
  const name = phaseOf(s.label);
  let p = phases.at(-1);
  if (!p || p.phase !== name) { p = { phase: name, samples: [] }; phases.push(p); }
  p.samples.push(s);
}
const summary = phases.map(({ phase, samples }) => {
  const t0 = Date.parse(samples[0].at), t1 = Date.parse(samples.at(-1).at);
  const vis = samples.map(visibleWords);
  const act = samples.map(activeIndices);
  const activeFirst = act.map((a) => (a.length ? Math.min(...a) : null));
  const changes = activeFirst.filter((v, i) => i > 0 && v !== activeFirst[i - 1]).length;
  return {
    phase,
    samples: samples.length,
    observedMs: t1 - t0,
    selectedModes: [...new Set(samples.map((s) => s.selectedMode))],
    playControl: [...new Set(samples.map((s) => (s.controls.find((c) => c.label === "Pause") ? "Pause" : s.controls.find((c) => c.label === "Play") ? "Play" : "none")))],
    surfaces: [...new Set(samples.map((s) => s.surfaces.map((x) => x.origin).join("+")))],
    visibleWords: { min: Math.min(...vis), max: Math.max(...vis), zeroSamples: vis.filter((v) => v === 0).length },
    domWords: { min: Math.min(...samples.map(domWords)), max: Math.max(...samples.map(domWords)) },
    activeWordCount: { min: Math.min(...act.map((a) => a.length)), max: Math.max(...act.map((a) => a.length)) },
    activeFirstIndex: { first: activeFirst[0], last: activeFirst.at(-1), changes, sequence: activeFirst },
    firstVisibleIndex: { first: firstVisible(samples[0]), last: firstVisible(samples.at(-1)) },
    focusText: [...new Set(samples.map((s) => s.focusText).filter(Boolean))].slice(0, 6),
    progressText: [samples[0].progressText, samples.at(-1).progressText],
  };
});
const errors = consoleEvents.filter((e) => e.method === "Runtime.exceptionThrown" || (e.method === "Runtime.consoleAPICalled" && ["error", "assert"].includes(e.params?.type)) || (e.method === "Log.entryAdded" && e.params?.entry?.level === "error"));
const out = {
  dir, run: capture.run, fixture: capture.fixture?.id, fixtureSha256: capture.fixture?.sha256, scenario: capture.scenario,
  captureCompleted: capture.captureCompleted, playbackStopped: capture.playbackStopped, elapsedMs: capture.elapsedMs,
  screencastFrames: capture.screencastFrames, actions: capture.actions.map((a) => `${a.at} ${a.selector}`),
  persisted: capture.persistedAppState && { readingMode: capture.persistedAppState.settings?.readingMode, lastReadingMode: capture.persistedAppState.settings?.lastReadingMode, positions: capture.persistedAppState.library.map((d) => `${d.id}:${d.position}${d.cfi ? " cfi" : ""}`) },
  consoleErrors: errors.map((e) => (e.params?.exceptionDetails?.exception?.description || e.params?.args?.map((a) => a.value ?? a.description).join(" ") || e.params?.entry?.text || "").slice(0, 240)),
  phases: summary,
};
if (process.argv.includes("--json")) console.log(JSON.stringify(out, null, 2));
else {
  console.log(`${out.run} ${out.fixture} completed=${out.captureCompleted} stopped=${out.playbackStopped} frames=${out.screencastFrames} consoleErrors=${out.consoleErrors.length}`);
  for (const p of summary) console.log(`  ${p.phase.padEnd(18)} n=${String(p.samples).padStart(3)} ${String(p.observedMs).padStart(5)}ms mode=${p.selectedModes.join("/")} ctl=${p.playControl.join("/")} vis[min ${p.visibleWords.min} max ${p.visibleWords.max} zero ${p.visibleWords.zeroSamples}] active[n ${p.activeWordCount.min}-${p.activeWordCount.max} idx ${p.activeFirstIndex.first}→${p.activeFirstIndex.last} chg ${p.activeFirstIndex.changes}] firstVis ${p.firstVisibleIndex.first}→${p.firstVisibleIndex.last} surf=${p.surfaces.join("|")}`);
  for (const e of out.consoleErrors) console.log("  ERR " + e);
  console.log("  persisted " + JSON.stringify(out.persisted));
}
