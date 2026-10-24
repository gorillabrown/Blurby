import "./lib/app-icu-guard.mjs"; // P6b: refuse plain Node (exit 3)
// NARRATE-HARNESS-COLDCLICK-1 Done-when 2 — classify every D6 cold-click trial of a p5-latency-e2e run directory.
// Reads <outDir>/traces/cold-click-*.trace.json and <outDir>/summaries/trial-*.json; a summary belongs to a trace
// when its "clicked while playing" step falls between the trace's first and last event ts (epoch ms on both sides).
// Prints one row per trial (label, class, play word, clicked word, voiced-before-click, ms from Play's request to the
// click), then the class counts. Exit 0; 1 when no trial was classified, or under --break (LL-151: relabels the first
// attributed trial as lost-race, so the counts differ and the exit is 1); 2 on a usage error.
// Usage: pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 scripts/narrate-rebuild/coldclick-attribution.mjs <outDir> [--break]
import fs from "node:fs";
import path from "node:path";
import { readTraceEvents } from "./p5-recorded-output-check.mjs";
import { clickStepOf, describeColdClick } from "./lib/coldclick.mjs";

const args = process.argv.slice(2);
const BREAK = args.includes("--break");
const outDir = args.find((a) => !a.startsWith("--"));
if (!outDir || !fs.existsSync(path.join(outDir, "traces"))) {
  console.error(`usage: coldclick-attribution.mjs <outDir> [--break]  (no traces directory under ${outDir ?? "(none)"})`);
  process.exit(2);
}

const traceDir = path.join(outDir, "traces");
const summaryDir = path.join(outDir, "summaries");
const summaries = fs.existsSync(summaryDir)
  ? fs.readdirSync(summaryDir).filter((f) => /^trial-.*\.json$/.test(f)).map((f) => {
      try { return { file: f, summary: JSON.parse(fs.readFileSync(path.join(summaryDir, f), "utf8")) }; } catch { return null; }
    }).filter(Boolean)
  : [];

const rows = [];
for (const f of fs.readdirSync(traceDir).filter((x) => /^cold-click-.*\.trace\.json$/.test(x)).sort((a, b) => a.localeCompare(b, "en", { numeric: true }))) {
  const events = readTraceEvents(path.join(traceDir, f));
  const ts = events.map((e) => e.ts).filter((t) => typeof t === "number");
  const first = ts.length ? Math.min(...ts) : null, last = ts.length ? Math.max(...ts) : null;
  const match = first === null ? null : summaries.find(({ summary }) => { const s = clickStepOf(summary); return s && s.t >= first && s.t <= last; }) ?? null;
  const step = match ? clickStepOf(match.summary) : null;
  rows.push({ label: f.replace(/\.trace\.json$/, ""), summary: match ? match.file : null, ...describeColdClick({ events, step }) });
}

if (BREAK) { const r = rows.find((x) => x.class === "attributed"); if (r) { r.class = "lost-race"; r.broken = true; } }

const cols = ["label", "class", "playWord", "clicked", "voicedBeforeClick", "playToClickMs", "summary"];
console.log(cols.join("\t"));
for (const r of rows) console.log(cols.map((c) => (r[c] === null || r[c] === undefined ? "-" : String(r[c]))).join("\t") + (r.broken ? "\t(--break)" : ""));
const counts = {};
for (const r of rows) counts[r.class] = (counts[r.class] ?? 0) + 1;
console.log(`classes: ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(" ") || "(none)"} trials=${rows.length}`);
if (!rows.length) { console.error("no cold-click trial found"); process.exit(1); }
process.exit(BREAK ? 1 : 0);
