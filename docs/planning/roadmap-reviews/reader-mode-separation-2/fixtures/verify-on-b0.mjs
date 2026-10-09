// READER-MODE-SEPARATION-2 E3 (Decision #18): reproduce the committed G4 fixtures on the genuine B0 source tree.
// After E1 the run branch no longer carries the legacy orchestrator hook the recorder drives, so the recorder,
// its config and the four fixtures are copied (unchanged; only the config's include path names the copy) into
// a fresh sibling directory of the B0 checkout, run there, and the copy is removed.
// Usage (from the run worktree): node docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/verify-on-b0.mjs
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const B0 = "C:/Projects/Blurby-artifacts/rms2-b0-checkout";
const PIN = "1e5485c66e547392e7752240df71700267e8ede7";
const REL = "docs/planning/roadmap-reviews/reader-mode-separation-2";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const git = (...a) => execFileSync("git", ["--no-optional-locks", ...a], { cwd: B0, encoding: "utf8" }).trim();

if (git("rev-parse", "HEAD") !== PIN) throw new Error("B0 checkout HEAD is not the B0 pin");
execFileSync("git", ["--no-optional-locks", "diff", "--quiet", "HEAD", "--", "src"], { cwd: B0 }); // throws if src differs
const sub = `fixtures-b0verify-${Date.now()}`;
const dest = path.join(B0, REL, sub);
if (fs.existsSync(dest)) throw new Error(`refusing existing ${dest}`);
fs.mkdirSync(dest, { recursive: true });
let status = 2;
try {
  const files = ["record-mode-baselines.recorder.tsx", "page.baseline.json", "focus.baseline.json", "flow.baseline.json", "narrate.baseline.json"];
  for (const f of files) fs.copyFileSync(path.join(HERE, f), path.join(dest, f));
  const config = fs.readFileSync(path.join(HERE, "vitest.config.mjs"), "utf8");
  const include = `${REL}/fixtures/record-mode-baselines.recorder.tsx`;
  if (!config.includes(include)) throw new Error("config include path not found");
  fs.writeFileSync(path.join(dest, "vitest.config.mjs"), config.replace(include, `${REL}/${sub}/record-mode-baselines.recorder.tsx`));
  const run = spawnSync("npx", ["vitest", "run", "--config", `${REL}/${sub}/vitest.config.mjs`], { cwd: B0, encoding: "utf8", shell: true });
  const out = `${run.stdout}\n${run.stderr}`;
  console.log(out.split("\n").filter((l) => /Test Files|Tests {2}|✓|×|FAIL/.test(l)).join("\n"));
  console.log(`B0 tree ${git("rev-parse", "HEAD:src")} (pin ${PIN.slice(0, 8)})`);
  status = run.status ?? 2;
} finally {
  fs.rmSync(dest, { recursive: true, force: true });
}
process.exit(status);
