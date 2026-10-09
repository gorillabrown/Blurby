#!/usr/bin/env node
// Test-only G6 assembler: merges candidate g6-cases.json files (one per fixture run) into the live-qa.json shape
// read by scripts/check_reader_mode_evidence.mjs, plus a B0-vs-candidate comparison for the owner checklist.
//   node assemble-live-qa.mjs --candidate-cases=<a.json>,<b.json> [--b0-cases=<c.json>,<d.json>] [--out=<path>]
// Without --out it prints to stdout. It never writes <evidence>/live-qa.json itself. It never adds heardAudio or
// known-defect rulings (the owner's), and leaves removedCrossOwnerEffects empty for the owner/lead to fill.
// stderr: the comparison table and a dry validator pass (scripts/check_reader_mode_evidence.mjs validate()).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildManifestSha256, validate } from "../../../../../scripts/check_reader_mode_evidence.mjs";

const E = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const W = path.resolve(E, "../../../..");
const arg = (n) => process.argv.find((v) => v.startsWith(`--${n}=`))?.slice(n.length + 3);
const list = (v) => (v ? v.split(",").filter(Boolean).map((p) => path.resolve(p)) : []);
const die = (m) => { console.error(`REFUSED: ${m}`); process.exit(2); };
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const candFiles = list(arg("candidate-cases"));
const b0Files = list(arg("b0-cases"));
const outPath = arg("out") && path.resolve(arg("out"));
if (!candFiles.length) die("--candidate-cases is required");
if (outPath && outPath.toLowerCase() === path.join(E, "live-qa.json").toLowerCase()) die("will not write the evidence live-qa.json; choose another --out");

function load(file, target) {
  const doc = readJson(file);
  if (doc.harness !== "g6" || doc.target !== target) die(`${file} is not a g6 ${target} cases file`);
  const profile = path.resolve(path.dirname(file), "..", "..");
  const iso = readJson(path.join(profile, "isolation.json"));
  if (iso.target !== target || iso.runId !== doc.runId || iso.buildManifestSha256 !== doc.buildManifestSha256) die(`${file} does not match its isolation.json`);
  return { file, doc, iso };
}
const cand = candFiles.map((f) => load(f, "candidate"));
const b0 = b0Files.map((f) => load(f, "b0"));
const [first] = cand;
for (const x of cand) {
  if (x.doc.candidate !== first.doc.candidate || x.doc.head !== x.doc.candidate || x.doc.buildManifestSha256 !== first.doc.buildManifestSha256 || x.doc.buildDir !== first.doc.buildDir) die(`${x.file}: candidate/build differs from ${first.file}`);
}
const candidate = first.doc.candidate;
const buildDir = first.doc.buildDir;
const cb = readJson(path.join(buildDir, "..", "candidate-build.json"));
if (cb.candidate !== candidate || cb.buildManifestSha256 !== first.doc.buildManifestSha256) die("candidate-build.json disagrees with the runs");
const fresh = buildManifestSha256(buildDir);
if (fresh !== cb.buildManifestSha256) die(`build dir re-hash ${fresh} != recorded ${cb.buildManifestSha256}`);

const documents = {};
for (const x of cand) for (const f of x.iso.fixtures) {
  if (documents[f.id] && documents[f.id] !== f.sha256) die(`document ${f.id} hash differs between runs`);
  documents[f.id] = f.sha256;
}
const cases = cand.flatMap((x) => x.doc.cases.map((c) => ({ ...c, run: x.doc.runId })));
const ids = new Set();
for (const c of cases) { if (ids.has(c.id)) die(`duplicate case id ${c.id}`); ids.add(c.id); }

const pick = (c) => c && { expected: c.expectedCanonicalIndex, actual: c.actualCanonicalIndex, result: c.result, owner: c.owner, playback: c.playback, visibleCursorCount: c.visibleCursorCount, staleEffectCount: c.staleEffectCount };
const b0Cases = new Map(b0.flatMap((x) => x.doc.cases).map((c) => [c.id, c]));
const b0Comparison = b0.length ? [...new Set([...cases.map((c) => c.id), ...b0Cases.keys()])].map((id) => {
  const k = cases.find((c) => c.id === id); const b = b0Cases.get(id);
  const bk = pick(b), ck = pick(k);
  const differs = bk && ck ? Object.keys(bk).filter((f) => bk[f] !== ck[f]) : ["missing on " + (bk ? "candidate" : "b0")];
  return { id, category: (k ?? b).category, documentKind: (k ?? b).documentKind, b0: bk ?? null, candidate: ck ?? null, differs };
}) : [];

const out = {
  candidate,
  build: { dir: buildDir, manifestSha256: cb.buildManifestSha256 },
  documents,
  cases,
  removedCrossOwnerEffects: [],
  provenance: {
    assembledAt: new Date().toISOString(), harness: "docs/planning/roadmap-reviews/reader-mode-separation-2/live/",
    candidateRuns: cand.map((x) => ({ file: x.file, runId: x.doc.runId, fixture: x.doc.fixture })),
    b0Runs: b0.map((x) => ({ file: x.file, runId: x.doc.runId, head: x.doc.head, buildManifestSha256: x.doc.buildManifestSha256, fixture: x.doc.fixture })),
    staleEffectCountDefinition: first.doc.staleEffectCountDefinition,
    heardAudio: "absent by design: audio cases need the owner's heardAudio before the validator can pass (R6)",
  },
  b0Comparison,
};
const json = JSON.stringify(out, null, 2);
if (outPath) fs.writeFileSync(outPath, json); else process.stdout.write(json + "\n");

if (b0Comparison.length) {
  const cell = (x) => (x ? `${x.expected}/${x.actual} ${x.result} s${x.staleEffectCount} v${x.visibleCursorCount}` : "-");
  console.error("| case | B0 exp/act result stale vis | candidate exp/act result stale vis | differs |\n|---|---|---|---|");
  for (const r of b0Comparison) console.error(`| ${r.id} | ${cell(r.b0)} | ${cell(r.candidate)} | ${r.differs.join(", ") || "same"} |`);
}
const g0Documents = Object.fromEntries(readJson(path.join(E, "admission", "g0-matrix.json")).documents.map((d) => [d.id, d.sha256]));
const resolved = execFileSync("git", ["rev-parse", `${candidate}^{commit}`], { cwd: W, encoding: "utf8" }).trim();
const v = validate(out, { resolvedCandidate: resolved, g0Documents, buildManifestSha256: fresh, requireSpeed: false });
const byRule = v.reduce((m, x) => ((m[x.slice(0, 2)] = (m[x.slice(0, 2)] ?? 0) + 1), m), {});
console.error(`dry validator pass: ${v.length} violation(s) ${JSON.stringify(byRule)}${outPath ? ` -> ${outPath}` : ""}`);
