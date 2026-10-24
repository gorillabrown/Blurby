# Release gate (1), run 4 — quiet full suite and narration timing on the release-fix sha

**Verdict: PASSED** (Blurby.Brain, 2026-10-23). Every pass condition holds: 0 crashed launches out of 51, the quiet suite green, both timed sessions PASS, D3 and D5 clean, D6 within the mainstream row, and Electron 42.11.18. Gate (11)'s re-run condition (0 crashed launches on the quiet machine's full launcher run) is met.

**Commit:** `36ac7466749688c9ba5e17de841224fab08d7bae` (KEEP-FURTHEST-FIX-1's merge, the release-fix sha), checked out detached in `C:\Projects\bq-main` on the quiet machine. `git status` was clean before and after; `stash@{0}` untouched.

**Machine:** the quiet test machine (session "Blurby.Quiet Test"), Intel i7-1185G7, 4 cores / 8 threads, 15.8 GB: D6's mainstream class (Decision #22). Highest foreign CPU on any launch: 16.7 %.

**Instructions:** RUN-INSTRUCTIONS.md run 4, sent inline by Blurby.Brain because Google Drive was not mounted on that machine. Evidence stays on the quiet machine at `C:\Projects\Blurby-artifacts\narrate-rebuild-1\final-main-d3d6-run4\` (2,653 files: traces, logs, JSON); nothing was copied to Drive, committed or pushed.

## Results

| Row | Result | Pass condition | Verdict |
|---|---|---|---|
| Setup | `npm ci` 0 (`node_modules/electron/install.js` run once for the missing `path.txt`, exit 0); `npm run build` 0 | exit 0 | pass |
| Q1 quiet suite | `npm test` exit 0: 181 files, 2,452 passed / 1 skipped / 0 failed (2,453); `npm run typecheck` exit 0 | 0 failures | pass |
| Crashes | 0 of 51 launches; every launch exited 0 | 0 crashed | pass |
| D3 sessions | 1.00x PASS (802 commits, 5.03 min, worst late 16.95 ms, mapping spread 0.64 ms); 2.00x PASS (1,511 commits, 5.02 min, worst late 68.79 ms, mapping spread 0.68 ms) | both PASS, mapping ≤ 10 ms | pass |
| D5 | 0 outside one refresh, 0 drops, 0 repeats in both sessions | 0 / 0 / 0 | pass |
| Q3 | `p5-recorded-output-check` exit 0 (both traces PASS); with `--break` exit 1 (session 1: 1 commit outside one display frame, worst 108.21 ms) | 0, then 1 | pass |
| D6 warm | worst counting: 1.00x play 1,455, resume 85, click 1,833, speed 2,171 ms; 2.00x play 737, resume 85, click 1,266, speed 1,662 ms | < 2,500 ms (mainstream) | pass |
| D6 cold | worst counting: 1.00x play 1,209, resume 812, click 2,589, speed 1,123 ms; 2.00x play 1,731, resume 1,063, click 1,544, speed 1,498 ms | < 8,000 ms | pass |
| Electron | 42.11.18 (latency JSON's `electron` field and `node_modules/electron`) | 42.11.x | pass |

## Notes

- **The launcher exits 1, as expected.** It judges warm trials against the reference class's 2,000 ms, and one 1.00x speed trial took 2,171 ms (the next-worst 1,780 ms); this machine is mainstream class, so the budget is 2,500 ms. Its other failures are cold-click attribution: 1.00x trials 3 and 5 and 2.00x trials 4, 5 and 6 had the first voiced sample answer play, not the click. Cold click is judged on a reference-class run only until NARRATE-HARNESS-COLDCLICK-1, so these are listed, not counted.
- **Counting trials:** every warm cell has at least 20 counting trials (1.00x: 20/23, 23/23, 23/23, 45/46; 2.00x: 20/24, 20/24, 23/24, 47/48). The non-counting warm trials were excluded for foreign CPU above the 25 % ceiling (26.2 % to 48.8 %), as the rule requires; their latencies were 78 to 808 ms.
- **Compared with run 1** (`1da81be2`, Electron 41.10.7, 2026-10-15): 57 of 121 launches exited 0x80000003 after the quit flush. Under Electron 42 that crash is gone (ELECTRON-42-UPGRADE-1, gate (11)).
- **Tree handling on the quiet machine:** Q1 changed `tests/perf-baseline-results.json` and Q2 changed `docs/studies/narrate-rebuild-1/phase5/recorded-output.json`; both were copied into the evidence folder and restored with `git show HEAD`. Q2 wrote `latency-e2e.json`, untracked at this sha; it was copied, then moved out of the tree (`latency-e2e.moved-out-of-tree.json`), not deleted. The pre-run untracked copy is `pre-run-latency-e2e.json`.

## What this gate does not cover

Gate (2), the owner's smoke re-check on the installers built from this sha (`Smoke.STAGE8-RECHECK.2026-10-24.md`), is still owed.
