# Sprint Close-Out Governance Staging — FOLDER-SCAN-PERF-1

This file lists every governance change the sprint would have made to main governance
documents during execution. They are staged here because this is a worktree-resident run
(`eb/folder-scan-perf-1`, `C:\Projects\Blurby\.worktrees\folder-scan-perf-1`). `/pointer-closeout`
applies these fold-ins to canonical main at close. Gate evidence for the close-out is recorded
under "Gate evidence" below.

## Target: ROADMAP.md

### Fold-in 1 — Mid-Dispatch Amendment (control (h) budget)
Section: §FOLDER-SCAN-PERF-1 (inline full spec)
Action: Migrate
Source: This amendment block (below)
Destination: Close-out memo §Mid-Dispatch Decisions
Content:
##### Mid-Dispatch Amendment — 2026-10-14 — control (h) read budget 250 ms → 50 ms
Decision Type: Specification correction. The base changed under a pre-registered C1 stop, "(h) under its budget on the base".
Context: At C1, control (h) passed on the unmodified base `978b5fa6`. A 1 MB read 20 ms after the chokidar `startWatcher` took 149–228 ms, with event-loop gaps of 36–71 ms (vitest, plain Node 24.14.0, and a 3,000/12,000/30,000-file sweep). Bare recursive `fs.watch` measured 1–2 ms reads and 17–19 ms gaps. The planner probe's 607–814 ms reads and 405–575 ms gaps did not reproduce, and a larger tree does not restore them. Issue: `docs/governance/bug-reports/Issue.FOLDER-SCAN-PERF-1.2026-10-14.md`.
Decision: Owner chose option A (2026-10-14).
- (h)'s read budget is 50 ms, and its title reads "resolves within 50 ms".
- The event-loop-gap assertion keeps its 250 ms budget, as a non-control guard.
- Done-when 1's (h) reason becomes "times the read over 50 ms".
- The failure-handling load contingency becomes: "If (h) fails after C2 only under full-suite load, record both runs and raise its read budget once, to 100 ms. That is still below the base's lowest observed read of 149 ms. Any further raise is BLOCKER(USER)."
Rationale: At 50 ms, the base fails by 3× or more and `fs.watch` passes by about 25×. The gap margin (36–71 ms against 17–19 ms) is too thin to serve as a timing control.

### Fold-in 2 — Diff fence covers the issue file
Section: §FOLDER-SCAN-PERF-1, Done-when 10
Action: Replace
Old: `git diff --name-status refs/remotes/origin/main` lists exactly these paths, plus the time log and staging memo if kept (standing rule 41):
New: `git diff --name-status refs/remotes/origin/main` lists exactly these paths, plus the time log, the staging memo and `docs/governance/bug-reports/Issue.FOLDER-SCAN-PERF-1.2026-10-14.md` (the C1 stop) if kept (standing rule 41):

### Fold-in 2a — QUIT-FLUSH-1 inherits two quit-time items (planner ruling D1(b), 2026-10-14)
Section: §QUIT-FLUSH-1 (inline full spec): edit sites and Done-when
Action: Insert after (the spec's `will-quit` edit-site list)
Content:
- **Watcher closed flag (from FOLDER-SCAN-PERF-1's review).** `main/folder-watcher.js` `startWatcher`: add `let closed = false;` and set it in the `close` wrapper. Check `if (closed) return;` at the top of `onEvent`, and again after each `await` in `settle` (after `lstat`, and after `await realRoot` / `isPathWithinFolder`). Then no `onAdd`, `onChange` or `onUnlink` fires after `close()`. Today, a `settle` suspended at `await lstat` when `close()` runs still calls back. At quit, that is a late `debouncedSyncLibraryWithFolder` during the final flush. The base had the same gap: chokidar's async handlers awaited `realpath`, then called back.
- **Cancellable startup timer.** `main.js` `startFolderWork` (the "Folder watcher + sync" block): keep the `setTimeout` handle, and `clearTimeout` it in `will-quit`. Then a quit within `FOLDER_SYNC_STARTUP_DELAY_MS` of `did-finish-load` starts neither a watcher nor a sync.

Rationale: QUIT-FLUSH-1 owns `will-quit` and the library-save debounce race, and it is the next item to merge. Keeping FOLDER-SCAN-PERF-1 on its prescribed shape keeps its green gates valid.

### Fold-in 2b — remove the dissolved item's leftover anchor (planner ruling D4, 2026-10-14)
Section: ROADMAP.md, the line directly above `#### Stage 8 — Launch, quit and packaging defects found at G2`
Action: Remove
Content:
<a id="dev-perf-measure-1"></a>

Nothing links to it. The only other hit is a backup snapshot under `Virtuoso/.backups`, which is not a live link. Apply this with the close-out's ROADMAP edit.

## Target: CLAUDE.md

### Fold-in 3 — chokidar leaves the dependency list
Section: §Tech Stack, "Dependencies:" line
Action: Replace
Old: `chokidar (folder watch, lazy-loaded), `
New: (delete the fragment; folder watching is native recursive `fs.watch`)

## Target: docs/governance/BUG_REPORT.md

### Fold-in 4 — BUG-193 resolved
Section: §BUG-193, Status line
Action: Replace
Content: `**Status:** RESOLVED (FOLDER-SCAN-PERF-1)`. Add the merge sha at close-out (LL-148), plus Done-when 9's timed results.
Condition: Done-when 9(c) passes. This is pending: the owner gate after G2.

### Fold-in 5 — BUG-189 (conditional)
Section: §BUG-189, Status line
Action: Replace, only if Done-when 9(e) closes it
Content: `**Status:** RESOLVED (FOLDER-SCAN-PERF-1)`, with the 9(e) dev-mode times. Otherwise record the 9(e) numbers on the open status, and the planner files a fresh measurement item.

## Note for the close-out

- The specification's "DEV-PERF-MEASURE-1 stub (`ROADMAP.md:521-527`) is removed as dissolved" is already done on `978b5fa6`, apart from the anchor. Fold-in 2b removes the anchor (planner ruling D4).

## Planner rulings (Blurby.Brain, 2026-10-14)

- **D1:** (b). The two quit-time items go to QUIT-FLUSH-1 (Fold-in 2a). No change on this branch.
- **D2:** held for the owner, as a hybrid. The atomic save settles as `onAdd`, so the word count is not refreshed. This is a user-visible difference against the owner's "no feature change" ruling. The planner recommends (b): map a rename onto an existing supported file to `onChange` as well, with one test. Until the owner answers, apply nothing and write no close-out note for (a).
- **D3:** confirmed.
  - Done-when 9 runs after G2, on the owner's real profile.
  - The fix build is the branch tip (`96cc6de8` is docs on top of `ac8485f9`), or a later commit if D2(b) is chosen.
  - QUIT-FLUSH-1 does not dispatch until this item merges.
  - Of this item and PACKAGING-FIX-1, the second to merge takes `refs/remotes/origin/main` in first.
- **D4:** remove the anchor (Fold-in 2b).

## Code-quality review findings (row 8): no blockers; recommendation MINOR_FIXES

- **Should-fix 1: (h)'s 50 ms read budget could flake under load.** The full suite passed with it (Done-when 7), so no change was made. The pre-registered 100 ms load contingency stands.
- **Should-fix 2: a callback can fire after `close()`.** A `settle` suspended at `await lstat` when `close()` runs still calls `onUnlink`, `onAdd` or `onChange`. **Not applied.**
  - The specification prescribes `close()` exactly: clear the pending timers, then close the handle.
  - The base had the same in-flight gap. Chokidar's async `add` and `change` handlers awaited `isPathWithinFolder` and then called `onAdd` or `onChange` after close.
  - Native `fs.watch` delivers no events after `close()`, so only the in-flight step remains.
  - The reviewer's 4-line fix is a `closed` flag checked in `onEvent` and after each await in `settle`. It is offered to **QUIT-FLUSH-1**, which owns the quit-time library-save race this feeds (`will-quit`, then a late `debouncedSyncLibraryWithFolder`).
- **Nit 3, handed to QUIT-FLUSH-1.** The startup `setTimeout` in `startFolderWork` cannot be cancelled. A quit within `FOLDER_SYNC_STARTUP_DELAY_MS` of `did-finish-load` starts a watcher and a sync after `will-quit` has closed the watcher. Fix there by keeping the timer handle and calling `clearTimeout` on it in `will-quit`.
- **Nit 4, accepted by the specification.** A folder picked during the 3 s window, or during the deferred sync, runs one extra concurrent sync. The specification calls this "one more sync". A re-entrancy guard in `syncLibraryWithFolder` would be a later item.
- **Nit 5.** `did-finish-load` never fires if the load fails, so folder work waits until a folder is picked. This affects dev only, when the dev server is down. Adding `did-fail-load` as a trigger is optional.
- **Nit 6, a planner note, possibly a follow-up.** An editor's atomic save (write a temp file, then rename it over the target) now settles as `onAdd` (sticky `renamed`) where chokidar's `atomic` option reported `change`. `main.js`'s `onAdd` debounces a sync that keeps the existing `wordCount`, so the word count is not refreshed after an atomic save. This follows the specification's own rule, "if any event in the window was `rename`, the settled event counts as a rename". It is the one observable difference from chokidar found so far. Done-when 9(d) does not cover it.
- **Nit 7, parity.** A burst of events gives a burst of `lstat` calls, one per path. Chokidar did the same; Done-when 9(d) observes it.

## Downstream (flag for the review, not this run's to edit)

- **QUIT-FLUSH-1** edits `main.js` after this item merges. Re-grep its edit sites, since this item shifted `main.js` by one line below the startup hunk. Also consider findings 2 and 3 above.
- **PACKAGING-FIX-1** also edits `package.json`. Whichever item merges second merges `refs/remotes/origin/main` in first.

## Done-when 9: owner re-measure (pending; waits for G2 to finish)

Run it as specified, on the fix build of this branch (`ac8485f9` or later). Record (a) through (e) here: the setup counts, base and fix click-to-first-render times (cap 180 s, pass ≤ 10 s), live add and delete times (≤ 30 s each), the folder-document count against (a), any `error.log` lines, and dev-mode library and book times. The rest of the close-out follows the specification's failure handling.

## Gate evidence

- Base suite (row 6, before any edit), `npx vitest run` on `978b5fa6`: exit 0. 151 files; 2,058 passed, 1 skipped (`tests/pdf-export.test.js` "preserves text through pdfkit write → pdf-parse read", `it.skip`). The failing set is empty.
- Search gates dry-run on the base: Done-when 3 shows 7 lines and exits 0; Done-when 4 shows `:4392` and `:8997`; Done-when 5a shows `main/folder-watcher.js:43`; Done-when 5b shows `main.js:655`; Done-when 5c exits 1 with no output; Done-when 8 shows `:51`, `:136`, `:159` and `:712`. Every one matches the specification's dry-run.
- Done-when 1 (C1, commit `f43bf0c0`): `npx vitest run tests/folderWatcher.test.js tests/perfAudit.test.ts`, run in pwsh from the worktree root with the source at base, exits 1 with `Tests  5 failed | 37 passed (42)` in three runs (two by the implementation agent, one by the orchestrator). Exactly the controls fail:
  - (a) `realpath calls made from folder-watcher.js: expected 100 to be less than or equal to 1`
  - (b) `setImmediate yields made from folder-watcher.js: expected 0 to be greater than or equal to 4`
  - (g) `realpath calls made from folder-watcher.js: expected 6 to be less than or equal to 1`
  - (h) `1 MB read 208 / 1198 / 243 ms, max event-loop gap 116 / 56 / 52 ms (read budget 50 ms, gap guard 250 ms)`. It fails on the read in all three runs; the 1,198 ms run was under machine load.
  - (i) fails three assertions: the slice lacks `once("did-finish-load", startFolderWork)`, lacks the `setTimeout(… FOLDER_SYNC_STARTUP_DELAY_MS)` string, and matches the bare `startWatcherFn();` line.

  Passing: (c), (d), (e), (f) and all 33 other `perfAudit` tests. Before the amendment, with the specified 250 ms budget, (h) passed on base (`Tests  4 failed | 38 passed (42)`, three runs). That is the stop recorded in the issue file.
- **Done-when 2 (C2, commit `ac8485f9`):** `npx vitest run tests/folderWatcher.test.js tests/perfAudit.test.ts tests/fileHashesCleanup.test.ts tests/jsonStore.test.js` exits 0 with 73/73. It was run twice by the implementation agent and once by the orchestrator. Control (h) on `fs.watch` (implementation agent, four runs with temporary logging, since removed): 2 ms reads and 17/18/17/22 ms gaps.
- **Done-when 3, 4, 5 and 8 (orchestrator, pwsh, tree `ac8485f9`):**
  - 3, 4, 5a, 5b and 8 each exit 1 with empty output.
  - 5c prints `main.js:2`, `main/constants.js:4` and `main/folder-watcher.js:2`, and exits 0.
- **Done-when 6 and 7 (orchestrator, owner's machine, tree `ac8485f9`):**
  - `npm ci` exits 0, and `node_modules/chokidar` and `node_modules/readdirp` are absent afterwards.
  - `npx vitest run` exits 0: 152 files, 2,067 passed and 1 skipped. The skip is the base's `tests/pdf-export.test.js` `it.skip`, and the diff adds no skip. The failing set is empty, the same as the base. Control (h) passed under full-suite load, so the 100 ms load contingency was not used.
  - `npm run typecheck` exits 0, and `npm run build` exits 0.
- **Done-when 10:** `git diff --name-status 978b5fa6..HEAD` lists exactly the 8 specified paths (`A tests/folderWatcher.test.js`, the rest `M`). Run against the working tree, it also lists `tests/perf-baseline-results.json`, which `npm test` rewrites. The staging plan says never to stage that file, and it was not staged. The time log, this memo and the issue file are added by the governance commit (Fold-in 2).
- **Spec-compliance review (row 7):** every edit site and every test (a)–(i) PASS, with quoted anchors. Done-when 3, 4, 5, 8 and 10 PASS. The one unprescribed addition, `settle(rel, renamed).catch(…)` (it logs `[watcher] settle error:`), was ruled compliant: it logs only and prevents an unhandled rejection in the main process.
