---
sprint: QUIT-FLUSH-1
date: 2026-10-14
runtime: 18m measured working time (estimate 3m); row 3 waited 19m on the owner smoke and the merge go
tokens: not measured (worker rows report subagent tokens in the time log)
status: has-discoveries
---

# Pointer Close-Out: QUIT-FLUSH-1

## Sprint Brief

**Goal:** Make every quit-time save finish before the app exits (BUG-192).
**Result:** The quit saves now run in the cancelled first `will-quit` (new `main/quit-sequence.js`).
- New work stops first: the watcher, the WebSocket server and auto-sync.
- The Narrate producer shutdown starts first and is awaited uncapped, on every path.
- Then, each step guarded, under one cap (`QUIT_FLUSH_TIMEOUT_MS` = 3000), in order:
  1. eval traces;
  2. the library;
  3. the pending debounced settings save (`flushPendingSettingsSave`);
  4. settings;
  5. pending JSON writes (`whenWritesSettled`);
  6. the cloud sync when signed in;
  7. the sync's library save;
  8. pending writes again.
- Then `app.quit()`; the second pass does nothing.
- Owner smoke on the production build: the accent changed just before Alt+F4 was kept, the process was gone in about 2 s, and no `*.tmp` was left ((a)–(e) pass). (f) was not testable as written; its quit side was clean.
- Merged as `d21009b3`.

**Learned:** LL-159 — A flush at exit must drain timer-armed writes, not only writes already in flight. Also an LL-158 status record (a live smoke row needs a trigger shown to commit its state).
**Recommend:** READER-VISUAL-DIAG-1 is next after the epic. LARGE-FOLDER-SYNC-1's prerequisite is now met, and its batched saves must join the quit step list (LL-159). The buffer is at 4, below the target of 5; Blurby Brain is raising `/roadmap-review` with the owner.
**Bottom line:** BUG-192 is fixed and merged: a quit no longer loses the last change or leaves a half-written file.

## Time

| Row | Task | Kind | Model | Effort | Predicted | Actual | Waited | Added | Flag | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Quit handler extracted verbatim into its own module; quit, settings-flush and write-drain tests committed and failing on the unchanged behaviour | positive-control | claude-sonnet-5-5 | medium | 1 min (median of 6 runs) | 5 min | — | — | confirmed | commit 2995bbe3; Done-when 1 re-run by orchestrator: exit 1, failing set exactly (a)(b)(c)(d)(d2)(f)(g), (e)+5 existing jsonStore pass; typecheck exit 0 |
| 2 | Cancelled-first-quit flush in place: capped, guarded, producer never cut; pending settings save and pending writes flushed; docs updated | main-process-fix | claude-sonnet-5-5 | medium | 2 min (median of 38 runs) | 3 min | — | — | — | commit 00dbba06; orchestrator re-run: DW2 6 files/89 tests exit 0; DW3 exit 1 empty; DW4-7 exact single lines exit 0; DW10-11 text verbatim |
| 3 | Full suite, typecheck and build green; production `--dir` build smoked by the owner; merged and pushed | merge-and-verify | claude-opus-5-5 | low | 0 min (median of 4 runs) | 4 min | 19 min | — | — | DW8 on tree 5bda58ad: npm test 2080/1/0, typecheck 0, build 0; DW9 (a)-(e) PASS, (f) not testable (Brain disposition); merge go Blurby Brain; --no-ff merge d21009b3 pushed to origin/main, merge tree == tested branch tree 714de752; artifacts-exist on origin/main |
| +4 | Zeus: load spec, conflict check, reconcile worktree, build plan, assign owners | setup | claude-opus-5-5 | high | 6 min (median of 22 runs) | 1 min | — | yes | — | worktree eb/quit-flush-1 @80c71c70 reconciled (npm ci exit 0); conflict check clean (no edit-site commits since 8a38d6fb, no open branch on edit sites); base code tree == 534b43d2 (only CLAUDE.md differs; recorded 2068/1/0 green); edit-site lines re-read and match spec |
| +5 | Spec-compliance (Solon) and code-quality (Plato) reviews of C2, in parallel | review | claude-sonnet-5-5 | medium | 3 min (median of 4 runs) | 7 min | — | yes | — | Solon APPROVED_WITH_CONCERNS (no code/test/doc deviation; fence exact 3-dot); Plato MINOR_FIXES: W1 (post-sync debounced library save not flushed) + W2 (no cut flag) confirmed by orchestrator reading main/sync-engine.js:836-841, main.js:129-140, main/quit-sequence.js; issue docs/governance/bug-reports/Issue.QUIT-FLUSH-1.2026-10-14.md |
| R6 | Fix round (pending Brain ruling): W2 cut flag + test (h); W1 library-after-sync step + source test; re-run DW2-8; new --dir build | fix-round | claude-sonnet-5-5 | medium | 2 min (median of 40 runs) | 6 min | — | yes | — | commit bd1216fc; tests h,i,j,i2 failed first then pass; orchestrator: DW2 93/93, DW3-7 ok, npm test 2080/1/0, typecheck 0, build 0, --dir build exit 0, asar == bd1216fc |

Estimate 3m (the first listing, sequential rows) · Actual 18m (measured working time, sequential rows)

Row 1 is confirmed as real work by the planner: the module, the wiring and seven test cases. Row 3's 19 m wait was the owner smoke (run by Blurby Brain with the owner's go) and the merge go. A fix-round row (R6) was raised by the review; a fix-round prediction belongs in plans whose prescribed code has not been reviewed before C2.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Done-when 1: controls fail on the unchanged behaviour | failing set at C1 (`2995bbe3`) | exactly (a), (b), (c), (d), (d2), (f), (g); (e) and existing `jsonStore` pass | exactly those; (c) unhandled rejection recorded | Pass | — | — |
| 2 | Done-when 2: targeted tests | `npx vitest run` 6 files | exit 0 | 89/89 at C2; 93/93 at `bd1216fc` | Pass | +4 with tests (h), (i), (i2), (j) | — |
| 3 | Done-when 3: old async listener gone | `git grep` | exit 1, empty | exit 1, empty | Pass | — | — |
| 4 | Done-when 4–7: wiring, call count, constant, debounce literal | `git grep` | exact single lines | `main.js:682`; `main.js:1`; `main/constants.js:2`; `main/ipc/state.js:42` | Pass | — | — |
| 5 | Done-when 8: full suite, typecheck, build (owner's machine) | `npm test`; typecheck; build | exit 0 | 153 files, 2,080 passed, 1 skipped (base `pdf-export` `it.skip`), 0 failed; 0; 0 | Pass | base 2,068 / 152 files; +12 tests, +1 file | — |
| 6 | Done-when 9(a)–(e): 1-second quit on a production build | owner smoke | pass each | accent kept (`#2F8FD8`), no process after about 2 s, no new `*.tmp`, relaunch shows the accent | Pass | — | — |
| 7 | Done-when 9(f): reopen at the new position | owner smoke | pass | quit side clean; reopen cannot be exercised (Page-mode page turns never commit a position) | Not testable as written | — | info (spec gap; LL-158 status record) |
| 8 | Done-when 10–11: BUG-192 Status and TECHNICAL_REFERENCE line | text | verbatim | verbatim | Pass | — | — |
| 9 | Done-when 12: diff fence | `git diff --name-status refs/remotes/origin/main` | 9 paths + time log, memo, issue file | exact | Pass (Fold-in 2 admits the issue file) | — | — |
| 10 | Review W1: the sync's library merge dropped at quit | code review | — | confirmed; fixed (`bd1216fc`, test (j)) | Fixed | — | medium (same class as BUG-192) |
| 11 | Review W2: later steps could start after the cap | code review | — | confirmed; fixed (test (h)) | Fixed | — | low |
| 12 | Review N1 + producer path: flush could stay "flushing"; prescribed `finally` skipped the producer wait | review + implementation agent | — | fixed; producer awaited first in `finally` (tests (i), (i2)) | Fixed | — | low (no realistic throw path) |
| 13 | Shipped artifact | `app.asar` vs `bd1216fc` | byte-identical in the five changed modules | identical (`cmp`) | Pass | — | — |
| 14 | Integrated identity | tested tree vs merge tree | equal | branch tree `714de752` = merge `d21009b3` tree; code tree `5bda58ad` tested | Pass | — | — |

## Interpretation

- **The fix does what BUG-192 needed.** On the production build, the owner's accent change, made and quit within one input batch, was on disk after the quit and showed on relaunch. No `*.tmp` was left, where the base left `settings.json.tmp`, `library.json.tmp` and a 0-byte `sync-queue.json.tmp`.
- **The review mattered.** The prescribed step list drained only writes already in the chain. The quit's cloud sync arms the debounced library save, so its merge was dropped (W1). Neither the specification's tests nor its gates could see this. A source-text test (j) now pins the step that flushes it. That is LL-159.
- **9(f) is a gap in the specification, not a quit failure.** Blurby Brain's no-quit control showed that Page-mode page turns never write a reading position. The library save path at quit is covered by tests (a)–(j), and live for settings by (c) and (d). Blurby Brain took no owner waiver, because this item changed nothing the user sees.
- **Failure classification:** no in-scope regression, no inherited failure, no custody failure. The one skipped test is the base's `pdf-export` `it.skip`, unchanged.

**Populations:**
- **Passed:** Done-when 1–8, 9(a)–(e) and 10–12.
- **Failed:** none.
- **Excluded under authority:** none. 9(f) is recorded as not testable as written (Blurby Brain's disposition, no waiver).
- **Unchanged:** `main/sync-engine.js`, `main/sync-queue.js`, `main/narrate/**`, `main/folder-watcher.js` and the startup block; the write-then-rename path (LL-006).
- **Published:** `main` at `d21009b3`.
- **Still open:** S1 (now a note on LARGE-FOLDER-SYNC-1) and S2 (a note on PACKAGING-FIX-1). Two user-visible defects found in the smoke were handed to Blurby Brain (see below).

## Proposed Dispositions

- BUG-192: RESOLVED (merge `d21009b3`; owner smoke (a)–(e) pass).
- Done-when 9(f): not testable as written; quit side verified clean (Blurby Brain's disposition, no waiver). The spec gap becomes the LL-158 status record.
- S1 (library-first sequential order can starve the settings flush past the cap on a very large library): a note on LARGE-FOLDER-SYNC-1's specification (Fold-in 4).
- S2 (`autoUpdater.quitAndInstall` starts the installer while the flush runs): a note on PACKAGING-FIX-1's specification (Fold-in 3).
- Plato N-a to N-d (fix-round review): recorded here only, no follow-up item.
  - N-a: `runQuitSteps`'s JSDoc "Never rejects" is untrue for a malformed `steps` entry, and the cap timer is not cleared on that path.
  - N-b: test (j) is a source-text check.
  - N-c: the test file's header comment lists the controls only through (g).
  - N-d: if the cloud sync is still running at the cap, "library after sync" does not start (by design; the merge is re-derived from the cloud at the next launch).
- **Found during the Done-when 9 smoke and handed to Blurby Brain, not filed here** (both user-visible; Brain takes them to the owner):
  1. Page-mode page turns do not save a reading position.
  2. A folder book on Drive will not open ("Could not read EPUB file") while `sourceFolder` is cleared.

## Mid-Dispatch Decisions

##### Mid-Dispatch Amendment — 2026-10-14 — W1/W2/N1 ruled by Blurby Brain, option A + N1
Decision Type: Technical, back-end (CLAUDE.md Rule 11, tier 1), ruled by the planner (Blurby Brain).
Context: The code-quality review of C2 (`00dbba06`) returned MINOR_FIXES. Issue: `docs/governance/bug-reports/Issue.QUIT-FLUSH-1.2026-10-14.md`.
- W1: the quit's cloud sync arms the debounced library save (`ctx.saveLibrary()`, the `main/sync-engine.js` "GC expired tombstones" branch). "writes after sync" (`whenWritesSettled`) cannot see it, so a merged library was dropped at quit.
- W2: `runQuitSteps` had no cut state, so a step finishing after the cap let later saves start during exit.
- N1: a throw outside the step guards could leave the handler in "flushing", cancelling every later quit.
- The owner smoke on `00dbba06` had not been run.
Decision: "option A, plus N1. Fix W1, W2 and N1 in one round, then smoke the fixed build only."
- W2: a `cut` flag set in the cap callback, and `if (cut) break;` first in the step loop. Test (h).
- N1: the flush body in try/catch/finally; `finally` awaits the producer, sets `state = "done"` and calls `app.quit()`. Tests (i) and (i2).
- W1: `["library after sync", () => (_libraryDirty ? saveLibraryNow() : undefined)]` between "cloud sync" and "writes after sync". Source-text test (j).
- Each new test was shown failing on the unfixed code first. Done-when 2–8 were re-run, a new `--dir` build was made, and only that build was smoked.
- Producer-path correction, inside the N1 ruling: as first prescribed, the `finally` skipped `await producer` when the steps threw. The producer now starts before the `try` and is awaited first in the `finally`. (i2) failed first.
Rationale (Brain): "Their ruling was that the quit awaits the final cloud sync. A local save, only when that sync re-dirtied the library and under the same cap, carries out that ruling and changes nothing the user sees except that merged data survives."

##### Planner rulings — 2026-10-14
- **Measurement window:** the heavy gates were cleared to run, with no epic trial or G2 session running.
- **Done-when 9(f):** "not testable as written; quit side verified clean (process exit, no *.tmp); reopen-at-position cannot be exercised because Page-mode page turns never commit a reading position, shown by a no-quit control on the bd1216fc build". This is not a waiver.
- **Merge go:** "CLAUDE.md Rule 11 tier 1 (Rule 5b merge go)", after verifying on origin.
- **Close-out:** S1 becomes a note on LARGE-FOLDER-SYNC-1, and S2 a note on PACKAGING-FIX-1. N-a to N-d are recorded here only. The 9(f) gap becomes a lesson under LL-158. Two smoke defects are handed to Brain, not filed. Row 1 is confirmed as work, and the staging memo is kept.
- Full record: `docs/governance/close-outs/Memo.QUIT-FLUSH-1.GovernanceStaging.2026-10-14.md`.

## Lessons

- **New:** LL-159 — A flush at exit must drain timer-armed writes, not only writes already in flight.
- **Status record:** LL-158 — recurred in a second form (QUIT-FLUSH-1 Done-when 9(f)). A rider is added, and it is a candidate for promotion at the next roadmap review.
- **Applied:**
  - **LL-157 (the core lesson):** held. The saves run in the cancelled first quit under an overall cap. Test (a) quits during pending real writes and reads the files back at the moment of exit.
  - **Standing rule 43 (LL-138):** held. C1 extracted the handler verbatim and committed the controls failing, and the fix round repeated the test-first pattern for (h), (i), (i2) and (j).
  - **Standing rule 39 (LL-112):** held. (e) characterized the producer guarantee and passed at C1, C2 and the fix round.
  - **Standing rule 44 (LL-143):** held. Every search gate gave its dry-run output exactly, with exact exit codes.
  - **Standing rule 45 (LL-141) and LL-152:** held only partly. The 1-second quit was observed on a production `--dir` build. Blurby Brain drove it on the owner's profile with the owner's go, rather than the owner in person.
  - **LL-006 / standing rule 3:** held. Write-then-rename is untouched.
  - **LL-142:** held. Durability is judged from files read back at exit (test (a), smoke (c) and (d)), and the shipped `app.asar` was compared byte for byte with the tested commit.
  - **LL-156:** held. The debounced sync enqueue at quit and `main/ipc/state.js` were brought into scope explicitly.
  - **Standing rule 47 (LL-147):** held. The full suite ran on the owner's machine.
  - **Standing rule 48 (LL-149):** held. Typecheck and build are in Done-when 8, both exit 0.
  - **Standing rule 41 (LL-136):** held. The fence exempts the time log, the memo and the issue file (Fold-in 2).
  - **Standing rule 42 (LL-135):** held. The dispatch carried the reconciliation recipe, and every STOP passed.
  - **Standing rule 46 (LL-153):** held. The run wrote nothing to the register; status moves were made by the ceremonies.
  - **SRL-086/087 (standing rule 36):** held. Line numbers were re-verified on the base at setup, and the anchors were re-grepped after `origin/main` was merged in.
  - **LL-158:** recurred. See the status record.

## Files Created

- **Removed (temporary):** none.
- **Committed:** `main/quit-sequence.js`, `tests/quitSequence.test.js`, the issue file, the staging memo, the time log, and this report.
- **Ignored:** none.
- **Left for a decision:** `tests/perf-baseline-results.json`. `npm test` rewrites it on every run, and it is never staged. It is left uncommitted in the `quit-flush-1` worktree (Rule 10). The worktrees `quit-flush-1` and `quit-flush-1-merge` are kept, since pruning is maintenance. The production build under `quit-flush-1\release\` is git-ignored.
- **Guard:** `created-files` against `80c71c70`: 6 committed, 0 temporary, 0 untracked. The final time log is committed by this close-out; `tests/perf-baseline-results.json` is the one uncommitted file.

## Governance Updates

- **ROADMAP.md:**
  - The QUIT-FLUSH-1 specification is archived to `docs/planning/.Archive/ROADMAP_legacy.md` with Fold-ins 1 and 2 applied, and a completion line keeps the anchor.
  - The header, the queue, the lane row and the Stage 8 order are updated.
  - Fold-in 3 (S2) is added to PACKAGING-FIX-1, and Fold-in 4 (S1) to LARGE-FOLDER-SYNC-1.
- **CLAUDE.md:** the queue, open-bug, latest-merge and suite-count lines are updated, and the checklist count becomes 2,080+.
- **BUG_REPORT.md:** BUG-192 is RESOLVED, and its Location line is updated.
- **LESSONS_LEARNED.md:** LL-159 and an LL-158 status record (Fold-in 5).
- **TECHNICAL_REFERENCE.md:** updated in the sprint (`00dbba06`).
- **Issue file:** a `## Decision` block for the review findings.
- **Terminal ledger:** one completion record.

## Roadmap & Queue Movement

- **Retired:** QUIT-FLUSH-1 (Seq 10 → Completed 2026-10-14; Seq cleared).
- **Elevated:** READER-VISUAL-DIAG-1 → Seq 10, the first dispatch-ready item after the epic (NARRATE-REBUILD-1, 9).
- **Renumbered:**
  - Full Specs: PACKAGING-FIX-1 11, UX-POLISH-1 12 (in flight), UX-POLISH-2 13, LARGE-FOLDER-SYNC-1 14 (its prerequisite is now met).
  - Stubs: FOLDER-UNREACHABLE-GUARD-1 15, PDF-IMPORT-DIAG-1 16, OVERLAY-THEME-SWEEP-1 17, EINK-CONTROLS-1 18, KF2-WAIVER-RETIRE-1 19, NARRATE-YEARS-1 20 (blocked).
- **Buffer:** dispatch-ready depth falls from 5 to 4 (READER-VISUAL-DIAG-1, PACKAGING-FIX-1, UX-POLISH-2, LARGE-FOLDER-SYNC-1), below the target of 5. Blurby Brain is raising `/roadmap-review` with the owner.

## Next Work Pointer

Run `/next-pointer` for READER-VISUAL-DIAG-1, a read-only diagnosis. LARGE-FOLDER-SYNC-1 is dispatchable: its specification already edits `stopNewWork`, and per LL-159 its new batched library saves must be covered by the quit step list in `main.js`'s `will-quit` block.

## Gates

- Evidence: Done-when 1–8 and 10–12 were run on the owner's machine. The full gate was re-run on `bd1216fc`, with `origin/main` `35e1e6eb` merged in. Done-when 9 was run by Blurby Brain on the owner's profile with the owner's go.
- Integrated identity: the tested branch tree `714de752` equals the tree of the merge `d21009b3`, and `origin/main` = `d21009b3`.

## Git Hand-Off

- [x] Merge `d21009b3` (`--no-ff`, pushed).
- [x] Close-out documents committed on `eb/closeout-quit-flush-1`, merged to `main` with `--no-ff`, and pushed (the sha is in the register's Notes and the terminal ledger).
