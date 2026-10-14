# Issue — FOLDER-SCAN-PERF-1 — 2026-10-14

**Sprint:** FOLDER-SCAN-PERF-1 (ROADMAP.md#folder-scan-perf-1), branch `eb/folder-scan-perf-1`, worktree `C:\Projects\Blurby\.worktrees\folder-scan-perf-1`, base `978b5fa6` (contains the specification commit `5cd38888`).
**Task:** 1 (C1: positive controls and characterization), blocked at Done-when 1.
**Trigger:** the specification's own failure-handling rule: "If a control passes at C1 or fails for another reason, stop: the base has changed since this spec. Examples: (h) under its budget on the base".

## 1. tl;dr

Control (h) passes on the unmodified base: on this machine, a 1 MB read 20 ms after the chokidar `startWatcher` takes about 150–230 ms, below its 250 ms budget, so Done-when 1 ("exactly (a), (b), (g), (h) and (i) fail") cannot be met as written.

## 2. Executive Summary

The C1 tests are written and match the specification. Four of the five controls fail for their stated reasons, the four characterization tests pass, and every existing `perfAudit` test passes. Control (h) passes on the base: the planner probe's 607–814 ms reads and 405–575 ms gaps (2026-10-14) do not reproduce today, in vitest or in plain Node 24.14.0. Growing the tree to 30,000 files does not restore the control. The chokidar read stays at 170–230 ms, while native recursive `fs.watch` stays at 1–2 ms. The control still separates the two implementations by about 100×, but not at a 250 ms budget, so it needs a planner decision before C1 can be committed.

## 3. Evidence of issue

- **Done-when 1 gate**, run in `pwsh` from the worktree root: `npx vitest run tests/folderWatcher.test.js tests/perfAudit.test.ts` exits 1 with `Tests  4 failed | 38 passed (42)`. The implementation agent ran it twice; the orchestrator re-ran it independently. All three results are identical.
  - Failing as specified:
    - (a) `realpath calls made from folder-watcher.js: expected 100 to be less than or equal to 1`
    - (b) `setImmediate yields made from folder-watcher.js: expected 0 to be greater than or equal to 4`
    - (g) `realpath calls made from folder-watcher.js: expected 6 to be less than or equal to 1`
    - (i) the slice lacks `once("did-finish-load", startFolderWork)` and the `setTimeout(() => { startWatcherFn(); syncLibraryWithFolder(); }, FOLDER_SYNC_STARTUP_DELAY_MS)` string, and matches `/^\s*startWatcherFn\(\);\s*$/m`.
  - Passing as specified: (c), (d), (e), (f), and all 33 other `perfAudit` tests, including "c".
  - **Not as specified:** (h) "a 1 MB read started 20 ms after startWatcher on a 3,000-file tree resolves within 250 ms, and no event-loop gap exceeds 250 ms in the next second" passes.
- **(h) values inside vitest** (implementation agent, 3 isolated runs): reads of 158, 206 and 176 ms; maximum gaps of 45, 43 and 45 ms.
- **(h) in plain Node 24.14.0** (implementation agent, 6 runs): reads of 149–193 ms, maximum gaps of 36–44 ms. `startWatcher()` itself returns in 0–10 ms.
- **Orchestrator probe, size sweep.** The probe is the control's exact shape: 1 MB read 20 ms after start, 5 ms gap sampler, 1 s window, 10 files per directory with one `.epub`. It was run with plain Node 24.14.0 against the base `main/folder-watcher.js`, two runs per cell. The script is in the session scratchpad (`hprobe/hprobe.js`) and is not committed.

  | Files | chokidar read | chokidar max gap | bare `fs.watch(root, { recursive: true })` read | `fs.watch` max gap |
  |---|---|---|---|---|
  | 3,000 | 186, 184 ms | 40, 44 ms | 1, 2 ms | 17, 17 ms |
  | 12,000 | 170, 189 ms | 44, 71 ms | 1, 2 ms | 17, 17 ms |
  | 30,000 | 228, 186 ms | 67, 60 ms | 2, 2 ms | 17, 19 ms |

- **Base suite** before any edit (row 6): `npx vitest run` on `978b5fa6` exits 0, with 151 files, 2,058 passed and 1 skipped (`tests/pdf-export.test.js` "preserves text through pdfkit write → pdf-parse read", `it.skip`). The failing set is empty.
- **The test matches the specification:** `tests/folderWatcher.test.js`, `describe("startWatcher — does not starve the main process (BUG-193)")`. It builds 300 directories of 10 files, writes the 1 MB file outside the watched tree, samples gaps with `setInterval(…, 5)`, sleeps 20 ms after `startWatcher`, and reads with `fs/promises.readFile`.

## 4. Possible cause(s)

1. **The planner probe ran under load or on a cold metadata cache.** Examples are the P6 production app or build, or Defender scanning freshly created files. That would inflate chokidar's crawl stall by about 3–4×. Today's measurements are steady across 11 runs and three tree sizes, which points to a different environment then, not a regression now.
2. **chokidar 4 throttles its initial crawl.** Its readdirp stream hands back the loop between batches, so the stall in the first second is roughly constant (about 170–230 ms) rather than proportional to tree size. This fits the sweep. The probe's 40,000-file figures (46.4 s to `ready`, a 10.97 s stall) may then reflect conditions the 1 s window never reaches.
3. **(Less likely) The probe differed from the test in shape:** a different read API, or the big file inside the tree. This is not checked; the probe scripts are in the planner's scratchpad, not this session's.

## 5. Likely solution(s)

- **A (recommended): lower (h)'s read budget to 50 ms.** Keep the gap assertion at 250 ms as a non-control guard, and amend Done-when 1 and the (h) title to match. The base reads 149–228 ms, which fails by 3× or more. `fs.watch` reads 1–2 ms, which passes by 25×.
  - Pre-register the load contingency in place of "raise once to 350 ms": if (h) fails after C2 only under full-suite load, raise the read budget once to 100 ms. That is still below the base's lowest observed read, 149 ms. Any further raise is BLOCKER(USER).
  - The gap cannot be a control. The base reaches 36–71 ms against 17–19 ms on `fs.watch`, which is too thin a margin for a timing budget.
- **B: make (h) a structural control instead of a timing one.** For example, assert that `startWatcher` opens one watch handle, or that it makes no `readdir`/`stat` calls from `folder-watcher.js` or its dependencies during the first second. This is immune to machine speed, but it is a new test design rather than a budget change, so it needs a specification revision.
- **C: drop (h) as a control.** Rely on (a), (b), (g) and (i), plus the owner's Done-when 9 A/B on the real Drive profile, which is the measurement that proves BUG-193. This weakens LL-138 coverage of the watcher change, the change the probe found to matter most.
- **Not viable: a larger tree.** The sweep shows no increase from 3,000 to 30,000 files.

## 6. Confidence in cause and solution identification (1–10)

**7.** The facts are solid: three independent gate runs and 17 measurements agree, and solution A's margins are measured in both directions. Cause 1 (load or a cold cache when the probe ran) is inferred, not reproduced.

## State preserved

- `tests/folderWatcher.test.js` (new) and `tests/perfAudit.test.ts` (test (i) added) are in the worktree, uncommitted. C1 is not committed because its gate is not met.
- No source file is changed. `tests/perf-baseline-results.json` is dirty from the base suite run and will not be staged (staging plan).
- Time log: `docs/governance/close-outs/Timing.FOLDER-SCAN-PERF-1.jsonl`. Row 1 is waiting on the owner.
