# Dispatch Close-Out Governance Staging — NARRATE-TRACE-LABELS-1

This item was built in a worktree during the Stage 8 code/lockfile freeze. It merges on Blurby.Roadmap's go once the freeze lifts.
- **Branch:** `eb/narrate-trace-labels-1`, from `refs/remotes/origin/main` @ `dcafc800`.
- **Shared core:** none.

## Evidence

- **Re-grep (rule 36)** on `dcafc800`: every site the specification cites matches.
  - The labels are at `main.js:185`, `:187`, `:192` and `:193`.
  - `Number` parses the rates at `p5-latency-e2e.mjs:32`.
  - `latency-e2e.json` is written into `RECORDS_DIR` at `:245`.
  - The header comment is at `:14`.
  - On the base, each label grep printed 2 lines, and `selected-nano` in tests, scripts, src and main exited 1.
- **Done-when 1, positive control.** The test was committed alone in `3c698144`. `npx vitest run tests/narrate/narrate.rateArgs.test.js` exited 1 with `Cannot find module '../../scripts/narrate-rebuild/lib/rates.mjs'`.
  - A first run piped through `Select-String` printed exit 0. The direct re-run shows the true code, 1.
- **The change** (`eaa0e2e1`):
  - **`main.js`:** the four label lines change, and nothing else. They now read `real-app-narrate-kokoro` (twice), `narrate-kokoro-${slug}` and `narrate-kokoro-${slug}-live-evidence`.
  - **New parser:** `scripts/narrate-rebuild/lib/rates.mjs` exports `parseRates` and the grid constants.
  - **Launcher:** it calls `parseRates` inside a `try` that exits 2 before anything launches. It writes `latency-e2e.json` into `--out`, after running `mkdirSync(OUT)`. The header comment is updated. `recorded-output.json` stays in `RECORDS_DIR`.
- **Done-when 2:** 8 of 8 pass, exit 0. That covers the two valid lists, the six rejected values, and the grid's ends matching `src/constants.ts`.
- **Done-when 3:** the launcher exits 2 and prints `--rates: "1.0 2.0" is not a number (use commas: 1.0,2.0)`. No Electron child was started: the count was 1 before and 1 after, and the `--out` folder was not created.
  - **Deviation from the specification's command:** the launcher's first import is `lib/app-icu-guard.mjs`, which refuses plain Node with exit 3 before argument parsing. The check therefore ran as `pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 scripts/narrate-rebuild/p5-latency-e2e.mjs --rates "1.0 2.0" --analyze-only --out $env:TEMP\p5-rates-check`. The plain-`node` command as written exits 3 with the guard's refusal.
- **Done-when 4:** `real-app-selected-nano` and `moss-nano-13` in `main.js` each exit 1. `selected-nano` in tests, scripts, src and main exits 1, so no checker matched the old labels.
- **Done-when 5:** `path.join(RECORDS_DIR, "latency-e2e.json")` exits 1. `path.join(OUT, "latency-e2e.json")` prints `:1`.
- **Done-when 6** (owner's machine, tree `eaa0e2e1`):
  - `npm test` exited 0 with `Test Files 178 passed (178)` and `Tests 2438 passed | 1 skipped (2439)`. Nothing failed, so nothing was re-run.
  - `npm run typecheck` exited 0. `npm run build` exited 0.
- **Done-when 7, fence** (`origin/main...HEAD`): `M main.js` (four lines), `M scripts/narrate-rebuild/p5-latency-e2e.mjs`, `A scripts/narrate-rebuild/lib/rates.mjs` and `A tests/narrate/narrate.rateArgs.test.js`, plus this memo. No time log was kept.
- **Review:** self-review, because the item is XS. `main.js` changes only the four label values. The parser treats an empty part, a space-separated list, an out-of-range value and an off-grid value as errors.

## Lessons

- **Applied:**
  - LL-151: a bad argument is an exit 2, never a default PASS.
  - LL-160: the launcher check ran under the app's Electron.
  - Standing rules 36, 43, 44 and 50.
- **Added:** none.
  - The `Select-String` pipeline masking `$LASTEXITCODE` is a known PowerShell behaviour. It is recorded here for gate commands: read the exit code from a direct run.
