// NARRATE-REBUILD-1 P3 — D4 structural test: no estimated-timing path exists in the rebuilt Narrate.
// Scans the timing modules as text: the engine (src/reader/modes/narrate/engine/**), the runtime, state and
// binding that forward its cursor (ModeRuntime, ModeState, useModeBindings) and the producer (main/narrate/**).
// The display files (FoliateView and helpers/, restored for P4) paint a word index and carry no timing.
//   1. timing provenance is written in exactly one place, the capture seam, from what the model returned;
//   2. no module computes timing from word lengths, weights, rates, stretching or a lag constant;
//   3. the engine imports no sibling runtime and no legacy mode module.
// The scanner is first shown to catch each planted violation (positive control, LL-151).
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");
const NARRATE_DIR = path.join(ROOT, "src/reader/modes/narrate");
const ENGINE_DIR = path.join(NARRATE_DIR, "engine");
const RUNTIME_FILES = ["ModeRuntime.ts", "ModeState.ts", "useModeBindings.ts"].map((f) => path.join(NARRATE_DIR, f));
const PRODUCER_DIR = path.join(ROOT, "main/narrate");
const PROVENANCE_WRITER = "main/narrate/capture.js";

function listFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(p));
    else if (/\.(ts|tsx|js|cjs|mjs)$/.test(entry.name)) out.push(p);
  }
  return out;
}

const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

/** Estimator markers: any of these in a timing module means a boundary could come from somewhere other than the table. */
const ESTIMATOR_PATTERNS: RegExp[] = [
  /\bwpm\b/i,
  /charsPerSecond|msPerWord|msPerChar|wordsPerMinute/i,
  /\bweights?\b.*\b(durations?|timing|onsets?|boundar(y|ies))\b/i,
  /\b(durations?|timing|onsets?|boundar(y|ies))\b.*\bweights?\b/i,
  /\bword\.length\b/,
  /\bstretch(ed|ing)?\b/i,
  /\btempo\b/i,
  /\b(lag|offset)Ms\s*=\s*\d/i,
  /TRUSTED_LAG|HEURISTIC_LAG|estimatedTiming|estimateTiming|timingTruth/,
  /source:\s*["'`]word-native["'`]/,
];
const SIBLING_IMPORT = /from\s+["'][^"']*(\b(flow|focus|page)\/|src\/modes\/|hooks\/narration)[^"']*["']/;

export interface Finding { readonly file: string; readonly line: number; readonly rule: string; readonly text: string }

export function scan(files: ReadonlyArray<{ readonly file: string; readonly text: string }>): Finding[] {
  const findings: Finding[] = [];
  for (const { file, text } of files) {
    const rel = file.split(path.sep).join("/");
    const lines = stripComments(text).split("\n");
    lines.forEach((line, i) => {
      if (/["'`]model-output["'`]/.test(line) && !rel.endsWith(PROVENANCE_WRITER) && !/NATIVE_SOURCE\s*=/.test(line)) {
        findings.push({ file: rel, line: i + 1, rule: "provenance-written-elsewhere", text: line.trim() });
      }
      for (const re of ESTIMATOR_PATTERNS) if (re.test(line)) findings.push({ file: rel, line: i + 1, rule: `estimator:${re.source.slice(0, 24)}`, text: line.trim() });
      if (SIBLING_IMPORT.test(line)) findings.push({ file: rel, line: i + 1, rule: "sibling-import", text: line.trim() });
    });
  }
  return findings;
}

const read = (files: string[]) => files.map((file) => ({ file, text: fs.readFileSync(file, "utf8") }));
const timingFiles = () => [...listFiles(ENGINE_DIR), ...RUNTIME_FILES, ...listFiles(PRODUCER_DIR)];

describe("narrate structural test (D4: no estimated-timing path)", () => {
  it("scans every timing module (engine, runtime, producer) and finds nothing", () => {
    expect(RUNTIME_FILES.every((f) => fs.existsSync(f))).toBe(true);
    const files = timingFiles();
    expect(files.length).toBeGreaterThanOrEqual(8);
    expect(scan(read(files))).toEqual([]);
  });

  it("the provenance literal lives in the capture seam and in the engine's constant only", () => {
    const hits = read(timingFiles())
      .filter(({ text }) => /["'`]model-output["'`]/.test(stripComments(text)))
      .map(({ file }) => path.relative(ROOT, file).split(path.sep).join("/"));
    expect(hits.sort()).toEqual(["main/narrate/capture.js", "src/reader/modes/narrate/engine/wordTable.ts"]);
  });

  it("positive control (LL-151): each planted violation is reported", () => {
    const planted = [
      { file: "src/reader/modes/narrate/engine/x.ts", text: "const t = { source: \"model-output\" };", rule: "provenance-written-elsewhere" },
      { file: "src/reader/modes/narrate/engine/x.ts", text: "const ms = word.length * 60;", rule: "estimator:" },
      { file: "src/reader/modes/narrate/engine/x.ts", text: "const d = durations.map((x) => x * weights[i]);", rule: "estimator:" },
      { file: "src/reader/modes/narrate/engine/x.ts", text: "const lagMs = 450;", rule: "estimator:" },
      { file: "src/reader/modes/narrate/engine/x.ts", text: "import { FlowScrollEngine } from \"../../flow/helpers/FlowScrollEngine\";", rule: "sibling-import" },
      { file: "main/narrate/y.js", text: "result.timingTruth = \"word-native\";", rule: "estimator:" },
    ];
    for (const p of planted) {
      const findings = scan([{ file: p.file, text: p.text }]);
      expect(findings.length, p.text).toBeGreaterThan(0);
      expect(findings.some((f) => f.rule.startsWith(p.rule)), `${p.text} -> ${p.rule}`).toBe(true);
    }
    // And a comment never triggers it.
    expect(scan([{ file: "src/reader/modes/narrate/engine/x.ts", text: "// the old word.length estimator is gone" }])).toEqual([]);
  });
});
