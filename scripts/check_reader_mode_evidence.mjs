#!/usr/bin/env node
// G6 live-QA evidence completeness validator (READER-MODE-SEPARATION-2, design §D.7, charter D7/D8).
// Completeness only: it does not replace listening.
//
// Usage: node scripts/check_reader_mode_evidence.mjs --candidate <rev> --evidence <dir> [--require-speed]
//        node scripts/check_reader_mode_evidence.mjs --self-test
// Exit: 0 all rules hold | 1 violations (incl. missing live-qa.json, the pre-G6 state) | 2 usage / unreadable inputs.
// Reads <evidence>/live-qa.json and <evidence>/admission/g0-matrix.json.
//
// live-qa.json schema:
// {
//   candidate: "<full 40-hex sha>",                       // R1, must equal git rev-parse <rev>^{commit}
//   build: { dir: "<path, resolved from cwd>",            // R1, re-hashed here exactly like admission/isolated-launch.cjs:
//            manifestSha256 },                            //   sha256(JSON.stringify([{path,sha256,bytes}] sorted by path.localeCompare))
//   documents: { "<id>": "<sha256>", ... },               // R2, must equal g0-matrix.json documents[] (id -> sha256)
//   cases: [{ id, documentKind: "epub"|"non-epub", category /* REQUIRED table below */,
//             expectedCanonicalIndex, actualCanonicalIndex,            // integers
//             owner, playback, visibleCursorCount,                     // non-empty strings / non-negative integer
//             staleEffectCount /* must be 0 */, result: "pass"|"known-defect",
//             knownDefect?: "KD-CURSOR-LEAD"|"KD-RATE-1.4-OVERLAP",    // required iff known-defect
//             heardAudio?: { observer: "owner", captureRef? }, notes? }],
//   removedCrossOwnerEffects: [...],                      // must be an array (may be empty)
//   speedDialog?: {                                       // only checked with --require-speed (R7)
//     focus: { values: [{ multiplier, wpm }] }, flow: { values: [{ multiplier, wpm }] },  // 89: 0.40..4.80 step 0.05, wpm = x*250
//     narrate: { values: [rate] },                        // 25: 0.80..2.00 step 0.05
//     page: { hasSpeedAction: false }, keyboardOperable: true,
//     liveObservation: { observer: "owner", result: "pass" } }
// }
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MODES = ["page", "focus", "flow", "narrate"];
const TRANSITIONS = MODES.flatMap((a) => MODES.filter((b) => b !== a).map((b) => `transition-${a}-${b}`)); // 12
// Rule 3: required categories, per document kind. Single source of truth.
const REQUIRED_CATEGORIES = [
  "page-nav-selection", "focus-pacing-pause-resume", "flow-follow", "flow-browse-same-section", "flow-browse-cross-section",
  "narrate-start-0", "narrate-start-nonzero", "narrate-pause-resume-no-cold-restart", "narrate-section-transition",
  "narrate-book-transition", "narrate-rate-1.0-1.4-1.0", ...TRANSITIONS, ...MODES.map((m) => `same-mode-${m}`),
];
const KINDS = ["epub", "non-epub"];
const KNOWN_DEFECTS = ["KD-CURSOR-LEAD", "KD-RATE-1.4-OVERLAP"];
const isAudio = (c) => c.startsWith("narrate-") || c === "same-mode-narrate" || (c.startsWith("transition-") && c.split("-").includes("narrate"));
const BAD_WORD = /\bpending\b|\bfail(s|ed)?\b|not verified/i;
const range = (n, f) => Array.from({ length: n }, (_, i) => f(i));
// Rule 7 expected lists, computed from integers (no float drift): 89 Focus/Flow, 25 Narrate.
const EXPECT_SPEED = range(89, (i) => ({ multiplier: (40 + 5 * i) / 100, wpm: (40 + 5 * i) * 2.5 }));
const EXPECT_NARRATE = range(25, (j) => (80 + 5 * j) / 100);

const sha = (b) => createHash("sha256").update(b).digest("hex");
export function buildManifestSha256(dir) {
  const files = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile()) files.push({ path: path.relative(dir, p).replaceAll(path.sep, "/"), sha256: sha(fs.readFileSync(p)), bytes: fs.statSync(p).size });
    }
  };
  walk(dir);
  files.sort((a, b) => a.path.localeCompare(b.path));
  return sha(JSON.stringify(files));
}

const deepEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const stringsIn = (v) => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(stringsIn) : []);

// Pure: returns an array of violation strings, each prefixed with its rule ("R1".."R7").
export function validate(q, { resolvedCandidate, g0Documents, buildManifestSha256: freshBuild, requireSpeed }) {
  const v = [];
  if (q.candidate !== resolvedCandidate) v.push(`R1 candidate: live-qa has ${q.candidate}, resolved ${resolvedCandidate}`);
  if (!q.build?.manifestSha256 || q.build.manifestSha256 !== freshBuild) v.push(`R1 build: recorded ${q.build?.manifestSha256} != fresh re-hash ${freshBuild}`);
  for (const id of new Set([...Object.keys(q.documents ?? {}), ...Object.keys(g0Documents)])) {
    if (q.documents?.[id] !== g0Documents[id]) v.push(`R2 document ${id}: live-qa ${q.documents?.[id]} != g0-matrix ${g0Documents[id]}`);
  }
  const cases = Array.isArray(q.cases) ? q.cases : [];
  if (!Array.isArray(q.cases)) v.push("R3 cases: missing or not an array");
  for (const kind of KINDS) {
    for (const cat of REQUIRED_CATEGORIES) {
      if (!cases.some((c) => c.documentKind === kind && c.category === cat)) v.push(`R3 ${kind}/${cat}: required case missing`);
    }
  }
  if (!Array.isArray(q.removedCrossOwnerEffects)) v.push("R3 removedCrossOwnerEffects: must be an array");
  const seen = new Set();
  cases.forEach((c, n) => {
    const id = c.id ?? `#${n}`;
    const bad = (rule, msg) => v.push(`${rule} case ${id}: ${msg}`);
    if (!c.id || seen.has(c.id)) bad("R4", "id missing or duplicate");
    seen.add(c.id);
    if (!KINDS.includes(c.documentKind)) bad("R4", `documentKind ${c.documentKind} invalid`);
    if (!REQUIRED_CATEGORIES.includes(c.category)) bad("R4", `unknown category ${c.category}`);
    for (const f of ["expectedCanonicalIndex", "actualCanonicalIndex"]) if (!Number.isInteger(c[f])) bad("R4", `${f} must be an integer`);
    for (const f of ["owner", "playback"]) if (typeof c[f] !== "string" || !c[f]) bad("R4", `${f} must be a non-empty string`);
    if (!Number.isInteger(c.visibleCursorCount) || c.visibleCursorCount < 0) bad("R4", "visibleCursorCount must be a non-negative integer");
    if (c.staleEffectCount !== 0) bad("R4", `staleEffectCount ${c.staleEffectCount} !== 0`);
    if (!["pass", "known-defect"].includes(c.result)) bad("R4", `result ${JSON.stringify(c.result)} not in {pass, known-defect}`);
    if (c.result === "pass" && c.expectedCanonicalIndex !== c.actualCanonicalIndex) bad("R4", "pass requires expectedCanonicalIndex === actualCanonicalIndex");
    const w = stringsIn(c).find((s) => BAD_WORD.test(s));
    if (w) bad("R4", `contains pending/fail/NOT VERIFIED text: "${w}"`);
    if (c.result === "known-defect" ? !KNOWN_DEFECTS.includes(c.knownDefect) : c.knownDefect !== undefined) {
      bad("R5", `knownDefect ${JSON.stringify(c.knownDefect)} invalid for result ${c.result} (allowed only with known-defect: ${KNOWN_DEFECTS.join(", ")})`);
    }
    if (isAudio(c.category) && !(c.heardAudio?.observer === "owner" || (typeof c.heardAudio?.captureRef === "string" && c.heardAudio.captureRef))) {
      bad("R6", "audio case lacks heardAudio.observer === \"owner\" or a captureRef");
    }
  });
  if (requireSpeed) {
    const s = q.speedDialog;
    const chk = (ok, msg) => { if (!ok) v.push(`R7 speedDialog: ${msg}`); };
    chk(s && typeof s === "object", "missing");
    chk(deepEq(s?.focus?.values, EXPECT_SPEED), `focus.values must be exactly 89 values 0.40..4.80 step 0.05 with wpm = x*250 (got ${s?.focus?.values?.length})`);
    chk(deepEq(s?.flow?.values, EXPECT_SPEED), `flow.values must be exactly 89 values 0.40..4.80 step 0.05 with wpm = x*250 (got ${s?.flow?.values?.length})`);
    chk(deepEq(s?.narrate?.values, EXPECT_NARRATE), `narrate.values must be exactly 25 values 0.80..2.00 step 0.05 (got ${s?.narrate?.values?.length})`);
    chk(s?.page?.hasSpeedAction === false, "page.hasSpeedAction must be false");
    chk(s?.keyboardOperable === true, "keyboardOperable must be true");
    chk(s?.liveObservation?.observer === "owner" && s?.liveObservation?.result === "pass", "liveObservation must be {observer: owner, result: pass}");
  }
  return v;
}

const here = path.dirname(fileURLToPath(import.meta.url));
const G0_REL = "admission/g0-matrix.json";
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const loadG0Documents = (evidence) => Object.fromEntries(readJson(path.join(evidence, G0_REL)).documents.map((d) => [d.id, d.sha256]));
const usage = (msg) => { console.error(`usage error: ${msg}\nnode scripts/check_reader_mode_evidence.mjs --candidate <rev> --evidence <dir> [--require-speed] | --self-test`); process.exit(2); };

function selfTest() {
  const g0Documents = loadG0Documents(path.resolve(here, "../docs/planning/roadmap-reviews/reader-mode-separation-2"));
  const sha1 = "a".repeat(40);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rms2-evidence-"));
  try {
    fs.mkdirSync(path.join(dir, "assets"));
    fs.writeFileSync(path.join(dir, "index.html"), "<html></html>");
    fs.writeFileSync(path.join(dir, "assets", "app.js"), "console.log(1)");
    const manifest = buildManifestSha256(dir);
    const cases = KINDS.flatMap((kind) => REQUIRED_CATEGORIES.map((category) => ({
      id: `${kind}-${category}`, documentKind: kind, category, expectedCanonicalIndex: 7, actualCanonicalIndex: 7, owner: "narrate",
      playback: "playing", visibleCursorCount: 1, staleEffectCount: 0, result: "pass",
      ...(isAudio(category) ? { heardAudio: { observer: "owner" } } : {}),
    })));
    const good = {
      candidate: sha1, build: { dir, manifestSha256: manifest }, documents: g0Documents, cases, removedCrossOwnerEffects: [],
      speedDialog: { focus: { values: EXPECT_SPEED }, flow: { values: EXPECT_SPEED }, narrate: { values: EXPECT_NARRATE }, page: { hasSpeedAction: false }, keyboardOperable: true, liveObservation: { observer: "owner", result: "pass" } },
    };
    const base = { resolvedCandidate: sha1, g0Documents, buildManifestSha256: manifest, requireSpeed: true };
    const audioIdx = cases.findIndex((c) => c.category === "narrate-start-0");
    const controls = [
      ["valid object passes", () => good, null, base],
      ["missing required category", (q) => { q.cases = q.cases.filter((c) => !(c.documentKind === "epub" && c.category === "flow-follow")); }, /^R3 epub\/flow-follow/],
      ["result pending", (q) => { q.cases[0].result = "pending"; }, /^R4 case .*result/],
      ["pass with index mismatch", (q) => { q.cases[0].actualCanonicalIndex = q.cases[0].expectedCanonicalIndex + 1; }, /^R4 case .*pass requires/],
      ["staleEffectCount 1", (q) => { q.cases[0].staleEffectCount = 1; }, /^R4 case .*staleEffectCount/],
      ["unknown knownDefect id", (q) => { Object.assign(q.cases[0], { result: "known-defect", knownDefect: "KD-NOPE" }); }, /^R5 /],
      ["missing heardAudio on narrate case", (q) => { delete q.cases[audioIdx].heardAudio; }, /^R6 /],
      ["wrong candidate sha", (q) => { q.candidate = "b".repeat(40); }, /^R1 candidate/],
      ["wrong document hash", (q) => { q.documents[Object.keys(q.documents)[0]] = "0".repeat(64); }, /^R2 /],
      ["tampered build file", () => { fs.writeFileSync(path.join(dir, "assets", "app.js"), "tampered"); return good; }, /^R1 build/, { ...base, rehash: true }],
      ["88 Focus values (--require-speed)", (q) => { q.speedDialog.focus.values.pop(); }, /^R7 speedDialog: focus/],
    ];
    let bad = 0;
    for (const [name, mutate, expect, opts = base] of controls) {
      const q = structuredClone(good);
      const out = mutate(q) ?? q;
      const viol = validate(out, opts.rehash ? { ...opts, buildManifestSha256: buildManifestSha256(dir) } : opts);
      const ok = expect ? viol.some((x) => expect.test(x)) : viol.length === 0;
      if (!ok) bad++;
      console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : ` -> got ${viol.length ? viol.slice(0, 3).join(" | ") : "no violations"}`}`);
    }
    console.log(bad ? `self-test: ${bad} control(s) misbehaved` : `self-test: all ${controls.length} controls behaved`);
    return bad ? 1 : 0;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--self-test")) process.exit(selfTest());
  const val = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
  const rev = val("--candidate"), evidence = val("--evidence"), requireSpeed = argv.includes("--require-speed");
  if (!rev || !evidence) usage("--candidate and --evidence are required");
  let resolvedCandidate, g0Documents;
  try { resolvedCandidate = execFileSync("git", ["rev-parse", `${rev}^{commit}`], { encoding: "utf8" }).trim(); } catch { usage(`cannot resolve candidate ${rev}`); }
  try { g0Documents = loadG0Documents(evidence); } catch (e) { usage(`cannot read ${path.join(evidence, G0_REL)}: ${e.message}`); }
  const liveQaPath = path.join(evidence, "live-qa.json");
  if (!fs.existsSync(liveQaPath)) {
    console.log(`R0 live-qa.json: missing at ${liveQaPath} (expected before G6 live QA is recorded)`);
    console.log("FAIL: 1 violation");
    process.exit(1);
  }
  let q;
  try { q = readJson(liveQaPath); } catch (e) { usage(`cannot parse ${liveQaPath}: ${e.message}`); }
  let fresh = null;
  try { fresh = buildManifestSha256(path.resolve(q.build.dir)); } catch (e) { console.log(`R1 build: cannot re-hash build dir ${q.build?.dir}: ${e.message}`); }
  const violations = validate(q, { resolvedCandidate, g0Documents, buildManifestSha256: fresh, requireSpeed });
  violations.forEach((x) => console.log(x));
  console.log(violations.length ? `FAIL: ${violations.length} violation(s)` : `PASS: candidate ${resolvedCandidate} evidence complete${requireSpeed ? " (incl. speed dialog)" : ""}`);
  process.exit(violations.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
