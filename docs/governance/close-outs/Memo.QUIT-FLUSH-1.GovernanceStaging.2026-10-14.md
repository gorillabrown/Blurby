# Sprint Close-Out Governance Staging — QUIT-FLUSH-1

This file lists every governance change the sprint would have made to main governance
documents during execution. They are staged here because this is a worktree-resident run
(`eb/quit-flush-1`, `C:\Projects\Blurby\.worktrees\quit-flush-1`, from `refs/remotes/origin/main` @ `80c71c70`).
`/pointer-closeout` applies these fold-ins to canonical main at close. Gate evidence for the
close-out is recorded under "Gate evidence" below.

The two governance-document edits the specification names as edit sites (Done-when 10:
BUG-192's **Status** line; Done-when 11: `docs/governance/TECHNICAL_REFERENCE.md:235`) are made
in the branch, as the specification and its diff fence (Done-when 12) require.

## Gate evidence

### Setup (2026-10-14)
- Reconciliation recipe: every STOP check passed; `npm ci` exited 0; on `eb/quit-flush-1` at `80c71c70`.
- Conflict check: no commit at the edit sites since `8a38d6fb` (where the line numbers were re-read); no open `eb/` branch carries commits at the edit sites; NARRATE-REBUILD-1 P6 (ahead in order) is file-disjoint.
- Base suite: the code tree equals `534b43d2` (only `CLAUDE.md` differs, `git diff --stat 534b43d2 80c71c70`), whose recorded suite is 2,068 passed / 1 skipped / 0 failed (CLAUDE.md, 2026-10-14). Not re-run.
- Measurement windows: Blurby.Brain, 2026-10-14: "your heavy gates are clear to run now; no epic trial or G2 session is running."

### Done-when 1 — positive control at C1
`npx vitest run tests/quitSequence.test.js tests/jsonStore.test.js` (pwsh, worktree root, re-run by the orchestrator after the implementation agent's run): **exit 1**; `Tests 7 failed | 6 passed (13)`; `Errors 1 error`.
- Failing, exactly the expected set:
  - (a) `AssertionError: expected null to deeply equal { docs: [ { id: 'a', …(1) } ], …(1) }` — `library.json` missing at the fake exit.
  - (b) `AssertionError: expected 1 to be +0` — the fake exited at about 0 ms, before `QUIT_FLUSH_TIMEOUT_MS - 1`.
  - (c) `AssertionError: expected +0 to be 1` — step 3 had not run at exit (the thrown step is unguarded).
  - (d) `AssertionError: expected [ 2, 1, 2, 2 ] to deeply equal [ 1, 1, 1, 1 ]` — the second pass re-ran `stopNewWork` and both steps.
  - (d2) `AssertionError: expected false to be true` — a will-quit during the producer shutdown was not cancelled.
  - (f) `TypeError: flushPendingSettingsSave is not a function`.
  - (g) `TypeError: whenWritesSettled is not a function`.
- Passing: (e) (the producer shutdown holds the quit to 5,000 ms) and all 5 existing `jsonStore` tests.
- Unhandled rejection recorded (from (c)): `Error: sync failure`, from the unguarded `boom-sync` step rejecting the C1 handler's promise.
- `npm run typecheck` (orchestrator): exit 0.
- Companion run (implementation agent): `npx vitest run tests/einkFoundation.test.ts tests/perfAudit.test.ts tests/settingsNarrateNormalization.test.js` exit 0 (3 files, 55 tests).
- Deviations: `tests/jsonStore.test.js`'s import destructure was at line 11, not 10 (edited in place). `QUIT_FLUSH_TIMEOUT_MS` is read in the test through `createRequire`.

### Done-when 2–7, 10–11 — at C2 (re-run by the orchestrator, pwsh, worktree root)
- Done-when 2: `npx vitest run tests/quitSequence.test.js tests/jsonStore.test.js tests/sync-queue.test.js tests/settingsNarrateNormalization.test.js tests/perfAudit.test.ts tests/einkFoundation.test.ts` → `Test Files 6 passed (6)`, `Tests 89 passed (89)`, no unhandled errors; **exit 0**. (The implementation agent also ran the two new test files five more times: 13 of 13 each time.)
- Done-when 3: `git grep -n -F 'app.on("will-quit", async' -- main.js` → empty stdout and stderr; **exit 1**.
- Done-when 4: → `main.js:682:app.on("will-quit", createWillQuitHandler({`; **exit 0**.
- Done-when 5: → `main.js:1`; **exit 0**.
- Done-when 6: → `main/constants.js:2`; **exit 0**.
- Done-when 7: → `main/ipc/state.js:42:    saveSettingsTimeout = setTimeout(() => { flushSettingsSave(); }, 500);`; **exit 0**.
- Done-when 10: BUG-192's **Status** line is the specified text verbatim.
- Done-when 11: `docs/governance/TECHNICAL_REFERENCE.md:235` ends with the specified sentence verbatim.
- `npm run typecheck` (implementation agent): exit 0.

### Done-when 8 — full suite, typecheck, build (owner's machine, orchestrator, HEAD `00dbba06`, tree `3f56d7dc541dd1e64322d83c9edb1d5b732ddf22`)
- `npm ci`: exit 0 (reconciliation recipe, 2026-10-14).
- `npm test`: `Test Files 153 passed (153)`, `Tests 2076 passed | 1 skipped (2077)`, no failures, no unhandled errors; **exit 0**. Against the base (2,068 passed / 1 skipped in 152 files): +8 tests (seven in `tests/quitSequence.test.js`, one in `tests/jsonStore.test.js`) and +1 file.
- `npm run typecheck`: **exit 0**.
- `npm run build`: `✓ built in 2.11s`; **exit 0**.
- Run while Blurby.Brain had cleared the measurement window (no epic trial or G2 session running).

### Done-when 9 — owner smoke on a production build
- Build: `npx electron-builder --win --x64 --dir --publish never` → **exit 0**; `C:\Projects\Blurby\.worktrees\quit-flush-1\release\win-unpacked\Blurby.exe` (223,001,088 bytes, 2026-10-14 17:39:26), from `00dbba06` (`npm run build` exit 0 first, Done-when 8).
- Shipped-artifact check: `main.js`, `main/quit-sequence.js`, `main/ipc/state.js`, `main/json-store.js` and `main/constants.js` extracted from `resources/app.asar` are byte-identical (`cmp`) to `00dbba06`.
- That first checklist (for the `00dbba06` build) was held by Blurby Brain and never run; superseded by the fix-round build below.

### Merge-order step — origin/main merged into the branch (spec, Lane ownership → Merge order)
- `git merge refs/remotes/origin/main` (35e1e6eb: three planning commits, `CLAUDE.md`, `ROADMAP.md`, two `Virtuoso/` register files; no edit-site overlap) → `cfd07f9d`, tree `07915e21701b576ed557df54d625a04dbcf35c6c`. Edit-site anchors re-grepped: `main.js:682`, `main/constants.js:147`, `main/ipc/state.js:11`, `main/json-store.js:60`.
- Done-when 2–8 re-run on `cfd07f9d`: DW2 6 files / 89 tests, exit 0; DW3 exit 1, empty; DW4 `main.js:682:…`, exit 0; DW5 `main.js:1`; DW6 `main/constants.js:2`; DW7 one line (`main/ipc/state.js:42`); `npm test` 153 files, 2,076 passed / 1 skipped / 0 failed, exit 0; typecheck exit 0; build exit 0.
- Done-when 12 (two-dot against origin/main): exactly the nine specified paths plus this memo.

### Reviews
- Spec compliance (Solon): APPROVED_WITH_CONCERNS — no deviation in code, tests or docs; concerns were process items (origin/main moved; memo uncommitted), both resolved above.
- Code quality (Plato): MINOR_FIXES — W1 and W2 confirmed by the orchestrator; routed to Blurby.Brain with `docs/governance/bug-reports/Issue.QUIT-FLUSH-1.2026-10-14.md` (recommendation A: fix round, one smoke on the fixed build). Ruling: **W1/W2/N1 ruled by Blurby Brain 2026-10-14, option A + N1** (see Fold-in 1).

## Planner items for the close-out (from the code-quality review; no action in this run)
- **S1 — sequential, library-first order.** A library write slower than `QUIT_FLUSH_TIMEOUT_MS` (very large libraries) is cut and starves the settings flush after it. Running the local saves in parallel under the cap (distinct files, per-path chains), cloud sync last, would avoid it.
- **S2 — `autoUpdater.quitAndInstall`.** electron-updater spawns the installer and then calls `app.quit()` (`BaseUpdater.js` `doInstall`, then `setImmediate(app.quit)`), so the installer starts while the flush runs (up to 3 s; 30 s when the Narrate producer is stopping). Unverified whether the NSIS running-app check can kill the app mid-flush; the update path is not smoke-tested.
- **N2 — test gaps.** The real `save-settings` debounce path has no behavioural regression test (perfAudit "e" copies the logic and greps the literal); test (e) would pass if the producer started after the steps.

## Target: ROADMAP.md

### Fold-in 1 — Mid-Dispatch Amendment (review findings W1, W2, N1: one fix round)
Section: §QUIT-FLUSH-1 (inline full spec)
Action: Migrate
Source: This amendment block (below)
Destination: Close-out memo §Mid-Dispatch Decisions
Content:
##### Mid-Dispatch Amendment — 2026-10-14 — W1/W2/N1 ruled by Blurby Brain, option A + N1
Decision Type: Technical, back-end (CLAUDE.md Rule 11, tier 1), ruled by the planner (Blurby Brain).
Context: Code-quality review of C2 (`00dbba06`), MINOR_FIXES; issue `docs/governance/bug-reports/Issue.QUIT-FLUSH-1.2026-10-14.md`.
- W1: the quit's cloud sync arms the debounced library save (`ctx.saveLibrary()`, `main/sync-engine.js` "GC expired tombstones" branch). "writes after sync" (`whenWritesSettled`) cannot see it, so a merged library was dropped at quit.
- W2: `runQuitSteps` had no cut state, so a step finishing after the cap let later saves start during exit.
- N1: a throw outside the step guards could leave the handler in "flushing", cancelling every later quit.
The owner smoke on `00dbba06` had not been run.
Decision: Brain's words: "option A, plus N1. Fix W1, W2 and N1 in one round, then smoke the fixed build only."
- W2: a `cut` flag set in the cap callback, and `if (cut) break;` first in the step loop. Test (h).
- N1: the flush body in try/catch/finally; `finally` sets `state = "done"` and calls `app.quit()`. Test (i).
- W1: `["library after sync", () => (_libraryDirty ? saveLibraryNow() : undefined)]` between "cloud sync" and "writes after sync". Source-text test (j).
- Each new test is shown failing on the unfixed code first. Done-when 2–8 are re-run, a new `--dir` build is made, and only that build is smoked (Done-when 9).
Rationale (Brain): all three are back-end and the planner's to rule. "Their ruling was that the quit awaits the final cloud sync. A local save, only when that sync re-dirtied the library and under the same cap, carries out that ruling and changes nothing the user sees except that merged data survives."

### Fold-in 2 — Diff fence covers the issue file
Section: §QUIT-FLUSH-1, Done-when 12
Action: Replace
Old: `git diff --name-status refs/remotes/origin/main` lists exactly the following, plus the time log and staging memo if kept (standing rule 41):
New: `git diff --name-status refs/remotes/origin/main` lists exactly the following, plus the time log, the staging memo and `docs/governance/bug-reports/Issue.QUIT-FLUSH-1.2026-10-14.md` (the review-findings stop) if kept (standing rule 41):

## Target: ROADMAP.md §PACKAGING-FIX-1 (planner ruling, 2026-10-14: "S2 belongs with PACKAGING-FIX-1's updater work, so note it for that item's spec rather than filing a new stub")

### Fold-in 3 — note S2 for PACKAGING-FIX-1's specification
Section: §PACKAGING-FIX-1 (inline full spec), Planner resolutions or equivalent notes
Action: Insert after
Content:
- **From QUIT-FLUSH-1's review (S2, 2026-10-14):** `autoUpdater.quitAndInstall` (`main/ipc/misc.js`) reaches the QUIT-FLUSH-1 `will-quit` flush. electron-updater spawns the installer first and then calls `app.quit()` (`node_modules/electron-updater/out/BaseUpdater.js`, `doInstall` then `setImmediate(app.quit)`). So the installer starts while the flush runs: up to `QUIT_FLUSH_TIMEOUT_MS` (3 s), or up to `NARRATE_STOP_TIMEOUT_MS` (30 s) while the Narrate producer is stopping. It has not been verified whether the NSIS running-app check can kill the app mid-flush. Atomic writes keep the files intact, but a `*.tmp` may be left. The update path is not smoke-tested.

## Follow-ups for the close-out (planner ruling: "file them as follow-ups in the close-out, not this run")
- S1 — see "Planner items for the close-out" above.

### Fix round (Fold-in 1 ruling) — positive controls and the producer-path correction
- Tests first, run against the unfixed C2 code (`npx vitest run tests/quitSequence.test.js`): exit 1, with 3 failed and 7 passed.
  - (h): `expected "vi.fn()" to not be called at all, but actually been called 1 times` (step 3 started after the cap).
  - (i): `expected +0 to be 1` (no exit; stuck in "flushing"). Unhandled rejection recorded: `TypeError: .for is not iterable` at `main/quit-sequence.js:13`.
  - (j): `expected -1 to be greater than 806` ("library after sync" absent).
- **Producer-path correction** (implementation agent's finding, accepted by the orchestrator as within the N1 ruling and the owner decision "Keep the Narrate producer shutdown guarantee").
  - The problem: as first prescribed, N1's `finally` skipped `await producer` whenever `runQuitSteps` threw, and so quit without waiting for the shutdown (0xC0000409 risk).
  - The fix: the producer now starts before the `try`, and `await producer` is the first line of the `finally`.
  - Test first: (i2) failed on the uncorrected code with `expected 1 to be +0` (the app exited while the producer was pending). It passes now.
- After the fix (implementation agent), all exit 0: Done-when 2 (6 files, 93 tests, no unhandled errors); Done-when 3 exit 1 with empty output; Done-when 4–7 with unchanged output; typecheck. `tests/quitSequence.test.js` gave 11 of 11 on five repeat runs.

### Done-when 2–8 and the smoke build — on the fix round (orchestrator, HEAD `bd1216fc`, tree `5bda58ad5e3d66247debeeb372ec766f9307dc13`; origin/main `35e1e6eb` contained)
- Done-when 2: 6 files / 93 tests, no unhandled errors, **exit 0**. Done-when 3: exit 1, empty. Done-when 4: `main.js:682:app.on("will-quit", createWillQuitHandler({`. Done-when 5: `main.js:1`. Done-when 6: `main/constants.js:2`. Done-when 7: `main/ipc/state.js:42:…}, 500);` (all exit 0).
- Done-when 8: `npm test` 153 files, 2,080 passed / 1 skipped / 0 failed (base 2,068 + 12 new: (a)–(f), (h), (i), (i2), (j) in `tests/quitSequence.test.js`; (g) in `tests/jsonStore.test.js`), **exit 0**; `npm run typecheck` **exit 0**; `npm run build` **exit 0**.
- Done-when 12: unchanged file set (fix round touched only `main.js`, `main/quit-sequence.js`, `tests/quitSequence.test.js` and this memo) plus the issue file (Fold-in 2).
- Smoke build: `npx electron-builder --win --x64 --dir --publish never` **exit 0** → `C:\Projects\Blurby\.worktrees\quit-flush-1\release\win-unpacked\Blurby.exe`, 223,001,088 bytes, 2026-10-14 17:50:53. `main.js`, `main/quit-sequence.js`, `main/ipc/state.js`, `main/json-store.js`, `main/constants.js` in `resources/app.asar` are byte-identical (`cmp`) to `bd1216fc`.
- Checklist sent to Blurby.Brain for the owner (2026-10-14).

### Done-when 9 — results (run by Blurby Brain on the owner's profile, with the owner's go in that session; relayed 2026-10-14)
- Setup: no Blurby running. `*.tmp` listing before: empty. `sourceFolder` cleared. Not signed in to cloud sync (`sync-state.json` `lastSync` 0, revision 0). Profile backup: `blurby-data\qf1-backup-20261014`. Launches: 17:52:28.937, 17:53:24.318, 17:54:23.648 (control).
- **(a) PASS.** Settings → Theme → blue preset, then Alt+F4 in the same input batch (well under 1 s).
- **(b) PASS.** No Blurby process at the first check, about 2 s after Alt+F4.
- **(c) PASS.** `accentColor` `#FF5B7F` → `#2F8FD8`.
- **(d) PASS.** `*.tmp` listing after the quit: empty.
- **(e) PASS.** The relaunch showed the blue accent.
- **(f) NOT TESTABLE as written; quit side PASS.**
  - After page turns and Alt+F4, the process exited at once and the `*.tmp` listing stayed empty.
  - The book did not reopen at a new position, but the control shows the quit is not the cause. On the sample *Meditations* (saved position 26672, cfi `epubcfi(/6/18!/4/2[pgepubid00011],/2,/10/104/1:9)`), 5 page turns in Page mode and then Alt+F4 left the position, cfi and `lastReadAt` unchanged.
  - Control, launch 3, with no quit: 3 page turns (screenshots show paragraph I → XI and a "Jump back" button), then 10 s with the app open. `library.json` was not written, and the position was unchanged.
  - So Page-mode page turns do not save a reading position at all, quit or no quit, and (f) cannot exercise the quit flush.
  - A folder book on Drive (*Why Nations Fail*) would not open ("Could not read EPUB file") while `sourceFolder` is cleared. Out of scope; Blurby Brain is filing it.
- Files written during the run: `library.json`, `settings.json`, `sync-queue.json` (17:53:50, while running; none a `.tmp`).
- Profile restored after the run: `settings.json` and `library.json` copied back from the backup and verified byte-identical (accent `#FF5B7F`, `readingMode` narrate, `sourceFolder` cleared).

## Findings for the close-out (from the smoke; no action in this run)
- **Done-when 9(f) spec gap.** Page-mode page turns do not commit a reading position (Brain's control above), so (f) as written cannot test the quit flush. A future quit smoke needs an action that does commit a position before the quit.
- **Page mode does not save the reading position on page turns** (observed on the sample *Meditations*, production build `bd1216fc`). This may be a separate defect for the planner to triage. It is not caused by this item: the base quit path was not involved, and the position was unchanged with no quit.

### Fix-round review (code quality + ruling compliance, Plato, on `7f47006a..bd1216fc`)
- Verdict **READY**; no confirmed defects. W2, N1 (with the producer awaited first in `finally`) and W1 match the ruling. Tests (h), (i), (i2) and (j) each fail if their fix is reverted. `npx vitest run tests/quitSequence.test.js tests/jsonStore.test.js`: 17 of 17 pass.
- Non-blocking notes, left for the close-out. No code change after the smoke.
  - N-a: `runQuitSteps`'s JSDoc says "Never rejects", which is untrue for a malformed `steps` entry. On that path the cap timer is not cleared. This is harmless, because the app quits.
  - N-b: test (j) is a source-text check; `main.js` cannot be loaded in a unit test.
  - N-c: the header comment of `tests/quitSequence.test.js` lists the controls only through (g).
  - N-d: if the cloud sync is still running at the cap, "library after sync" does not start. That is by design, because the merge is re-derived from the cloud at the next launch.
