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

### Fold-in 1b — Mid-Dispatch Amendment (D2(b): an atomic save reports a change)
Section: §FOLDER-SCAN-PERF-1 (inline full spec), Design decisions → Watcher → Settle, and Tests
Action: Migrate
Source: This amendment block (below)
Destination: Close-out memo §Mid-Dispatch Decisions
Content:
##### Mid-Dispatch Amendment — 2026-10-14 — D2(b): a renamed supported file reports onAdd then onChange
Decision Type: Hybrid (CLAUDE.md rule 11). A technical change with a user-visible effect, against the owner's "no feature change" ruling. The owner decided.
Context: The code-quality review (nit 6) found that an editor's atomic save settled as `onAdd` only. An atomic save writes a temp file and renames it over the book, and the prescribed rule counts any rename in the window as a rename. `main.js`'s `onAdd` debounces a sync that keeps the existing `wordCount`, so the word count went stale. Chokidar's `atomic` option reported `change`.
Decision: The owner's words: "D2: fix it now in FOLDER-SCAN-PERF-1 (option b), one test, re-run Done-when 2, 7 and 10."
- The prescribed `settle` ending `(renamed ? onAdd : onChange)(full)` becomes `if (renamed) onAdd(full);` followed by `onChange(full);`.
- A non-renamed file still calls `onChange` only.
- A new file now fires both callbacks. `main.js`'s `onChange` ignores a path not yet in the library, so new books behave as before.
- New test (j) in `tests/folderWatcher.test.js`: "reports a change when a supported file is atomically replaced (temp file renamed over it)". It failed first on `ac8485f9`'s watcher (`onChange` never called with the replaced path, after the 4 s wait) and passes after the fix.
- Commit: `234a12b9`.
Rationale: This restores chokidar parity for atomic saves, as the owner's "no feature change" ruling requires. It costs two lines and one test, and it lands before Done-when 9 runs, so no measurement is wasted. Both files are already inside Done-when 10's fence.

### Fold-in 2 — Diff fence covers the issue file
Section: §FOLDER-SCAN-PERF-1, Done-when 10
Action: Replace
Old: `git diff --name-status refs/remotes/origin/main` lists exactly these paths, plus the time log and staging memo if kept (standing rule 41):
New: `git diff --name-status refs/remotes/origin/main` lists exactly these paths, plus the time log, the staging memo and `docs/governance/bug-reports/Issue.FOLDER-SCAN-PERF-1.2026-10-14.md` (the C1 stop) if kept (standing rule 41):

### Fold-in 2a — two quit-time items go to LARGE-FOLDER-SYNC-1 (planner ruling D1, re-routed 2026-10-14)
**Re-routed:** "D1 re-routed 2026-10-14 by Blurby Brain: 2a moves from QUIT-FLUSH-1 to LARGE-FOLDER-SYNC-1, because QUIT-FLUSH-1's spec forbids main/folder-watcher.js and main.js:640-665." QUIT-FLUSH-1's specification is not edited.
Section: §LARGE-FOLDER-SYNC-1 (stub), technical half
Action: Insert (as part of Fold-in 6)
Content:
- **Watcher closed flag (from FOLDER-SCAN-PERF-1's review).** `main/folder-watcher.js` `startWatcher`: add `let closed = false;` and set it in the `close` wrapper. Check `if (closed) return;` at the top of `onEvent`, and again after each `await` in `settle` (after `lstat`, and after `await realRoot` / `isPathWithinFolder`). Then no `onAdd`, `onChange` or `onUnlink` fires after `close()`. Today, a `settle` suspended at `await lstat` when `close()` runs still calls back. At quit, that is a late `debouncedSyncLibraryWithFolder` during the final flush. The base had the same gap: chokidar's async handlers awaited `realpath`, then called back.
- **Cancellable startup timer.** `main.js` `startFolderWork` (the "Folder watcher + sync" block): keep the `setTimeout` handle, and `clearTimeout` it in `will-quit`. Then a quit within `FOLDER_SYNC_STARTUP_DELAY_MS` of `did-finish-load` starts neither a watcher nor a sync.

Rationale: LARGE-FOLDER-SYNC-1 owns `main/folder-watcher.js` and the folder startup and sync code in `main.js`, which is where both items live, and they sit beside the sync re-entry guard. The gap predates this item and is low severity, and the owner's profile keeps `sourceFolder` cleared. Keeping FOLDER-SCAN-PERF-1 on its prescribed shape keeps its green gates valid.

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
Content: `**Status:** RESOLVED (FOLDER-SCAN-PERF-1)`, with the merge sha (LL-148) and Done-when 9's timed results. *Meditations* on Drive went from 140–150 s on the base to about 2 s on the fix, and the local book opens in under 1 s.
- The live-sync gap does not stay on BUG-193; it moves to LARGE-FOLDER-SYNC-1 (Fold-in 6).
- The owner's workaround stands: `sourceFolder` stays cleared until that item lands.
Condition: met. Done-when 9(c) passed, and the owner waived 9(d).

### Fold-in 5 — BUG-189 stays open
Section: §BUG-189, Status line
Action: Append
Content: Done-when 9(e) was not run on 2026-10-14; it was held with 9(d). BUG-189 stays open, and the dev-mode re-measure is still owed.

### Fold-in 6 — new stub item LARGE-FOLDER-SYNC-1 (owner ruling 2026-10-14)
Targets: the ROADMAP.md stub list and the Notion register (create-item). Lane: Library & Content.
- **Placement (planner ruling 2026-10-14):** Seq 15, at the head of the stubs, so the dispatch-ready items each move up one: QUIT-FLUSH-1 10, READER-VISUAL-DIAG-1 11, PACKAGING-FIX-1 12, UX-POLISH-1 13, UX-POLISH-2 14. Stubs 16–21 are unchanged. A stub at Seq 11 would have stalled `/next-pointer`'s FIFO.
- This is a stub, not dispatch-ready. "The technical half (per-file sync, re-entry guard, batched saves, Fold-in 2a) does not depend on the owner's large-folder answer and may be spec'd and dispatched first, split from the design half."
- **Technical (already ruled by the planner):**
  - A watcher event applies a single-file add, remove or change to the library, with no full rescan.
  - `syncLibraryWithFolder` gets a re-entry guard, so a second sync cannot run alongside the first.
  - A long import saves progress in batches, not once at the end.
  - Also a latent defect on the same path (`main.js:373-381`): a cancelled sync saves `synced` before non-folder and Saved Articles documents are appended, so a cancel with partial progress would drop them. Nothing in the renderer calls `cancelSync` today; only the `cancel-sync` IPC and its preload method reach it. The batched save must keep those documents.
- **Design (owner's call, open):** what Blurby does with a very large source folder. The owner's folder has 120,190 supported files (120,166 EPUBs), mostly under `Books\` and `Books\Books\`, and a full scan took 93.6 s. The options to put to the owner:
  - import everything;
  - cap the import;
  - ask the user to choose subfolders.
- **Evidence:** FOLDER-SCAN-PERF-1 Done-when 9(d), 2026-10-14 (this memo).

## Note for the close-out

- The specification's "DEV-PERF-MEASURE-1 stub (`ROADMAP.md:521-527`) is removed as dissolved" is already done on `978b5fa6`, apart from the anchor. Fold-in 2b removes the anchor (planner ruling D4).

## Planner rulings (Blurby.Brain, 2026-10-14)

- **D1:** (b). The two quit-time items go to QUIT-FLUSH-1 (Fold-in 2a). No change on this branch.
- **D2:** a hybrid, so it was held for the owner. The owner answered (b): "fix it now in FOLDER-SCAN-PERF-1 (option b), one test, re-run Done-when 2, 7 and 10". Applied in `234a12b9` (Fold-in 1b).
- **D3:** confirmed.
  - Done-when 9 runs after G2, on the owner's real profile.
  - The fix build is the branch tip (`96cc6de8` is docs on top of `ac8485f9`), or a later commit if D2(b) is chosen.
  - QUIT-FLUSH-1 does not dispatch until this item merges.
  - Of this item and PACKAGING-FIX-1, the second to merge takes `refs/remotes/origin/main` in first.
- **D4:** remove the anchor (Fold-in 2b).
- **D5 (owner ruling, relayed by the planner):** merge with Done-when 9(d) waived, keep `sourceFolder` cleared, and file LARGE-FOLDER-SYNC-1 (Fold-in 6). BUG-193 is resolved by this merge (Fold-in 4); BUG-189 stays open (Fold-in 5).
  - **Merge authority:** the owner's instruction, typed by the owner in the Blurby.Brain session on 2026-10-14: "Merge FOLDER-SCAN-PERF-1 with Done-when 9(d) waived. Keep sourceFolder cleared, and file a new item for per-file live sync and a policy for very large folders."
  - The confirm dialog in the implementation session was not the authority. The owner then said, "I did not approve. Send those questions to Blurby.Brain for decision." The planner read that as a routing correction, not a withdrawal: the merge (`534b43d2`) stands, and every later decision is routed to the planner.
- **D1 re-routed (planner, 2026-10-14):** Fold-in 2a moves from QUIT-FLUSH-1 to LARGE-FOLDER-SYNC-1, and QUIT-FLUSH-1's specification is not edited.
- **D6 (planner, close-out):** time-log row 1 is confirmed as real work. It covered the eight controls and the (h) probe behind the C1 stop. LARGE-FOLDER-SYNC-1 is placed at Seq 15 (Fold-in 6).

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
- **Nit 6. RESOLVED by D2(b) in `234a12b9` (Fold-in 1b).** The original finding follows. An editor's atomic save (write a temp file, then rename it over the target) now settles as `onAdd` (sticky `renamed`) where chokidar's `atomic` option reported `change`. `main.js`'s `onAdd` debounces a sync that keeps the existing `wordCount`, so the word count is not refreshed after an atomic save. This follows the specification's own rule, "if any event in the window was `rename`, the settled event counts as a rename". It is the one observable difference from chokidar found so far. Done-when 9(d) does not cover it.
- **Nit 7, parity.** A burst of events gives a burst of `lstat` calls, one per path. Chokidar did the same; Done-when 9(d) observes it.

## Downstream (flag for the review, not this run's to edit)

- **QUIT-FLUSH-1** edits `main.js` after this item merges. Re-grep its edit sites, since this item shifted `main.js` by one line below the startup hunk. Findings 2 and 3 above went to LARGE-FOLDER-SYNC-1, not QUIT-FLUSH-1 (D1 re-routed).
- **PACKAGING-FIX-1** also edits `package.json`. Whichever item merges second merges `refs/remotes/origin/main` in first.

## Done-when 9: owner re-measure (run 2026-10-14 by the planner, Blurby.Brain, on the owner's profile)

G2 was finished first: the owner approved D12, D2 and D7 F5 in the planner's session before the run. Result: (b) and (c) pass; (d) fails and is **waived by the owner**; (e) was not run.

- **(a) Setup.**
  - Backup: `%APPDATA%\blurby\blurby-data\fsp1-backup-20261014\` (`library.json` 92,744 B, `settings.json` 1,486 B).
  - 131 folder documents; `G:` reachable; only `sourceFolder` was set.
  - `error.log` baseline: 26,971,867 B, 205,551 lines.
- **(b) Base build** (`narrate-rebuild-1-p6`, `f677353f`): *Meditations* on Drive (`pg2680-images-3.epub`) rendered 140–150 s after the click, with a spinner from about 8 s. That is under the 180 s cap. Window-focus problems forced two relaunches, so this number comes from the third launch, with the book opened about 25 s after start.
- **(c) Fix build** (tree `6d2be87c`): **PASS.** *Meditations* on Drive rendered in about 2 s, and the local book in under 1 s.
  - The local book is "The Raven", at `converted\1779591611769k92w18.epub`.
  - The specification's `converted9591611769k92w18.epub` is the same path with `\177` lost when the specification was written.
- **(d) Live checks: FAIL, waived.**
  - Two EPUBs were copied into the Drive folder root: a 3 KB fixture, then a known-good 280 KB file. Neither reached `library.json` within 30 s, nor after more than 3 minutes. `library.json` was not written after 16:35:38.
  - The delete check could not be run, and the folder count stayed at 131.
  - `error.log` since the baseline: 924 new lines, all ResizeObserver-loop noise. There were 0 `[watcher]` lines and 0 `read-file-buffer blocked` lines.
- **(d) Root cause** (traced by the planner and confirmed against `main.js:303-398`):
  1. Drive is not the cause. A bare Node `fs.watch` (recursive) on `G:\My Drive\Personal\Readings` saw rename and change events, exactly as on a local control folder. The Drive stop rule does not apply.
  2. The folder holds 120,190 supported files (120,166 `.epub`), mostly under `Books\` and `Books\Books\`, against 131 in the library. `scanFolderAsync` took 93.6 s on it.
  3. Every watcher event runs `syncLibraryWithFolder`. That rescans the whole tree, then extracts every file not already in the library (about 120k here), then calls `saveLibrary` once at the end. So an add or delete waits behind a ~94 s scan and a ~120k-book import. A sync that completed would add about 120k books.
  4. `syncLibraryWithFolder` has no re-entry guard. The debounced sync resets `syncCancelled` and runs alongside the startup sync.

  The base has the same sync shape. The change for this sprint: launch and opens no longer stall, so on this folder the startup import now actually proceeds.
- **(e) Dev mode: not run.** It was held with (d). BUG-189 stays open (Fold-in 5).
- **Profile restored:** `sourceFolder` cleared; `readingMode` put back to `narrate` (the test builds had left it on `page`).
  - `settings.json` is byte-identical to the backup.
  - `library.json` differs from the backup only by the reading positions from the two opens.
  - Both test EPUBs were deleted from the Drive folder, and Blurby is not running.

### Owner ruling (relayed by the planner, 2026-10-14)

"Merge FOLDER-SCAN-PERF-1 with Done-when 9(d) waived. Keep sourceFolder cleared, and file a new item for per-file live sync and a policy for very large folders."

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
- **D2(b) re-run (row R10; orchestrator; tree `234a12b9`; pwsh):**
  - **Done-when 2:** exits 0, 74/74, including new test (j). (j) failed first on `ac8485f9`'s watcher with `expected false to be true` (`onChange` never called with `a/old.epub`).
  - **Done-when 7:**
    - `npx vitest run --reporter=default` exits 0: 152 files, 2,068 passed, 1 skipped. The skip is `tests/pdf-export.test.js (8 tests | 1 skipped)`, the base's `it.skip`. The failing set is empty.
    - `npm run typecheck` exits 0, and `npm run build` exits 0.
  - **Done-when 5c:** unchanged (`main.js:2`, `main/constants.js:4`, `main/folder-watcher.js:2`).
  - **Done-when 10:** `git diff --name-status refs/remotes/origin/main...HEAD` lists exactly the 8 specified paths plus the time log, this memo and the issue file (Fold-in 2).
    - `origin/main` moved during the run to `7cf39fd9`: the CLAUDE.md trim and Rule 11 / Constitution docs, with no overlap with this branch's files. A two-tree diff therefore also lists `CLAUDE.md`, `docs/planning/Blurby_Project_Constitution.md` and `docs/planning/CLAUDE_md_archive_session1.md`; those are origin's changes, not this branch's.
    - At merge, take `refs/remotes/origin/main` in first and re-run the gates.
  - `npm ci` (Done-when 6) was not re-run, because the dependencies are unchanged since `ac8485f9`.
- **Pre-merge re-run (row 4; orchestrator; pwsh).** Run on tree `6d5a849f`, which is `6d2be87c` with `refs/remotes/origin/main` (`7cf39fd9`) merged in, with no conflicts:
  - **Done-when 6:** `npm ci` exits 0.
  - **Done-when 2:** exits 0, 74/74.
  - **Done-when 3, 4, 5a, 5b and 8:** each exits 1 with empty output.
  - **Done-when 5c:** prints `main.js:2`, `main/constants.js:4` and `main/folder-watcher.js:2`, and exits 0.
  - **Done-when 7:**
    - `npm test` exits 0: 152 files, 2,068 passed and 1 skipped (the base's `tests/pdf-export.test.js` `it.skip`).
    - `npm run typecheck` exits 0, and `npm run build` exits 0.
  - **Done-when 10:** the two-dot and three-dot diffs against `refs/remotes/origin/main` now agree. Each lists exactly the 8 specified paths, plus the time log, this memo and the issue file.
- **Spec-compliance review (row 7):** every edit site and every test (a)–(i) PASS, with quoted anchors. Done-when 3, 4, 5, 8 and 10 PASS. The one unprescribed addition, `settle(rel, renamed).catch(…)` (it logs `[watcher] settle error:`), was ruled compliant: it logs only and prevents an unhandled rejection in the main process.
