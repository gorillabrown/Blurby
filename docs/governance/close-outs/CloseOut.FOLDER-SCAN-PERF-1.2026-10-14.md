---
sprint: FOLDER-SCAN-PERF-1
date: 2026-10-14
runtime: 27m measured working time (estimate 1m); row 4 waited 4h 51m on the owner gate
tokens: not measured
status: has-discoveries
---

# Pointer Close-Out: FOLDER-SCAN-PERF-1

## Sprint Brief

**Goal:** Stop a large source folder stalling launch and book opens, by making folder work cheap and keeping it off the startup path, without changing any feature (BUG-193).
**Result:**
- Folder watching (`startWatcher`) moved from chokidar to Node's native recursive `fs.watch`. It keeps the same callbacks, and an atomic save still reports a change (D2(b)).
- The folder scan (`scanFolderAsync`) dropped its two per-file `realpath` calls and yields every 500 entries.
- Startup folder work runs 3 s after the window loads.
- chokidar and readdirp are removed.
- On the owner's profile, *Meditations* on Drive opens in about 2 s, against 140–150 s on the base build, and the local book opens in under 1 s.
- Live folder updates do not work on the owner's 120,190-file folder (Done-when 9(d), waived by the owner). The cause predates this item.

**Learned:** LL-158 — Trace what a live-behaviour acceptance row triggers, end to end, at the real data size.
**Recommend:** QUIT-FLUSH-1 next, unchanged. Specify LARGE-FOLDER-SYNC-1's technical half (per-file sync, re-entry guard, batched saves, the watcher closed flag) ahead of its design half, which waits on the owner's large-folder policy.
**Bottom line:** The launch stall is fixed and merged (`534b43d2`). Live sync on very large folders is now its own item, and the owner keeps `sourceFolder` cleared until it lands.

## Time

| Row | Task | Kind | Model | Effort | Predicted | Actual | Waited | Added | Flag | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Scan-cost, watcher-starvation and startup-order controls committed and failing on the current code; watcher contract characterized | positive-control | claude-sonnet-5-5 | medium | 1 min (median of 5 runs) | 11 min | 8 min | — | confirmed | C1 committed f43bf0c0 (pushed): Done-when 1 exit 1, exactly (a)(b)(g)(h)(i) fail in 3 runs incl. orchestrator re-run; (c)-(f) + 33 perfAudit pass; (h) read budget 50 ms by owner decision A after the pre-registered stop |
| 2 | Scan cheap and yielding, watcher on native recursive `fs.watch` with the same contract, startup folder work after the window loads, chokidar gone | main-process-fix | claude-sonnet-5-5 | high | 0 min (median of 5 runs) | 4 min | — | — | — | C2 committed ac8485f9 (pushed); orchestrator re-run: Done-when 2 exit 0 (73/73), 3/4/5a/5b/8 exit 1 empty, 5c main.js:2 constants.js:4 folder-watcher.js:2 exit 0 |
| 3 | `npm ci`, suites, typecheck and build green on the owner's machine | merge-and-verify | claude-opus-5-5 | low | 0 min (median of 3 runs) | 2 min | — | — | — | tree ac8485f9: npm ci exit 0 (node_modules/chokidar and readdirp absent); npx vitest run exit 0, 152 files, 2067 passed, 1 skipped (same pdf-export it.skip as base; diff adds no skip), failing set empty; typecheck exit 0; build exit 0; Done-when 3/4/5/8 pass; Done-when 10: origin/main..HEAD = exactly the 8 listed paths (worktree-only extra: run-generated tests/perf-baseline-results.json, never staged) |
| 4 | Owner re-measure on base and fixed production builds and on dev, recorded; merged and pushed | owner-gate | claude-opus-5-5 | low | 0 min (median of 42 runs) | 3 min | 4h 51m | — | — | Done-when 9 run by the planner on the owner's profile after G2: (c) PASS Meditations on Drive ~2 s (base 140-150 s), The Raven <1 s; (d) FAIL waived by owner (full rescan+import of a 120,190-file folder per watcher event; LARGE-FOLDER-SYNC-1); (e) not run, BUG-189 open. Pre-merge gates on 6d5a849f all pass (npm ci, DW2 74/74, npm test 2068/1 skipped, typecheck, build, DW10). Merged 534b43d2 --no-ff, pushed. |
| +5 | Zeus: Load spec, reconcile worktree, conflict check, build plan, assign owners | setup | claude-opus-5-5 | high | 7 min (median of 21 runs) | 0 min | — | yes | — | worktree eb/folder-scan-perf-1 @978b5fa6 created off origin/main (contains 5cd38888); npm ci exit 0; conflict check: no eb/* branch has unmerged commits on the 8 edit sites; no drift 66f15981..origin/main on them; spec line numbers re-verified |
| +6 | Base suite measured before the first edit (red-base procedure): npm test on origin/main tip | baseline-suite | claude-opus-5-5 | low | 0 min (median of 42 runs) | 1 min | — | yes | — | base 978b5fa6: npx vitest run exit 0; 151 files, 2058 passed, 1 skipped (tests/pdf-export.test.js 'preserves text through pdfkit write -> pdf-parse read', it.skip); failing set empty |
| +7 | Spec-compliance review (Solon) of C1+C2 against Done-when 1-8 and 10 | review | claude-opus-5-5 | medium | 2 min (median of 34 runs) | 2 min | — | yes | — | spec-compliance review: every edit site and test (a)-(i) PASS with quoted anchors; Done-when 3,4,5,8,10 PASS; 1,2,6,7,9 not verifiable read-only (run by orchestrator/owner); settle().catch ruled compliant |
| +8 | Code-quality review (Plato) of C1+C2 | review | claude-opus-5-5 | medium | 2 min (median of 34 runs) | 4 min | — | yes | — | code-quality review: no blockers, MINOR_FIXES; should-fix 1 moot (full suite green at 50 ms), should-fix 2 not applied (base had same in-flight hole; spec prescribes close(); handed to QUIT-FLUSH-1); nits 3-7 recorded in staging memo |
| +9 | Governance staging memo: Done-when 1 control output, gate evidence, close-out fold-ins | merge-and-docs | claude-opus-5-5 | low | 4 min (median of 8 runs) | 2 min | — | yes | — | staging memo: amendment fold-in (h), fence fold-in, CLAUDE.md/BUG_REPORT fold-ins, Done-when 1-8,10 evidence, review findings, downstream flags, Done-when 9 placeholder |
| R10 | D2(b) fix round: renamed supported file reports onAdd then onChange (atomic save refreshes word count); failing-first test (j); re-run Done-when 2, 7, 10 | fix-round | claude-sonnet-5-5 | medium | 2 min (median of 36 runs) | 3 min | — | yes | — | 234a12b9: (j) failed first on ac8485f9 watcher then passes; Done-when 2 exit 0 74/74; full suite exit 0 152 files 2068 passed 1 skipped (pdf-export it.skip), failing set empty; typecheck 0; build 0; Done-when 10 three-dot = 8 paths + 3 exempted governance files |

Estimate 1m (the first listing, sequential rows) · Actual 27m (measured working time, sequential rows)

Row 1 is confirmed as real work by the planner (D6): the eight controls, plus the (h) probe behind the C1 stop. Row 4's 4h 51m wait was the owner gate (G2, then the Done-when 9 run).

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Done-when 1: controls fail on base | failing set at C1 | exactly (a), (b), (g), (h), (i) | exactly those, 3 runs (`f43bf0c0`) | Pass (after amendment) | (h) passed on base at 250 ms; budget amended to 50 ms by the owner | info |
| 2 | Done-when 2: targeted tests | `npx vitest run` 4 files | exit 0 | 74/74 on `6d5a849f` | Pass | 73 → 74 with test (j), D2(b) | — |
| 3 | Done-when 3, 4, 5a, 5b, 8: search gates | `git grep` | no output (exit 1) | exit 1, empty | Pass | — | — |
| 4 | Done-when 5c: constants used | `git grep -c` | `main.js:2`, `main/constants.js:4`, `main/folder-watcher.js:2` | exact | Pass | — | — |
| 5 | Done-when 6: lockfile | `npm ci` | exit 0 | exit 0 | Pass | — | — |
| 6 | Done-when 7: full suite, typecheck, build | `npm test`; typecheck; build | exit 0 | 152 files, 2,068 passed, 1 skipped (base `pdf-export` `it.skip`); 0; 0 | Pass | base 151 files / 2,058 passed | — |
| 7 | Done-when 9(b): base build open | click to first render | under 180 s cap | 140–150 s | Pass (baseline) | — | — |
| 8 | Done-when 9(c): fix build opens | click to first render | ≤ 10 s each | *Meditations* ~2 s; The Raven < 1 s | Pass | −138 to −148 s | — |
| 9 | Done-when 9(d): live add and delete | appears in library | ≤ 30 s | never (> 3 min); delete untestable | **Fail — authorized exclusion** | the cause predates this item | high (moved to LARGE-FOLDER-SYNC-1) |
| 10 | Done-when 9(d): `error.log` | new `[watcher]` / `read-file-buffer blocked` lines | 0 | 0 / 0 (924 ResizeObserver lines) | Pass | — | — |
| 11 | Done-when 9(e): dev mode | library ≤ 30 s, book ≤ 10 s | measured | not run | Not run | — | BUG-189 stays open |
| 12 | Done-when 10: diff fence | `git diff --name-status refs/remotes/origin/main` | 8 paths + time log, memo, issue file | exact, two-dot and three-dot | Pass | — | — |
| 13 | Integrated identity | tree of tested `6d5a849f`/`beec04a8` vs merge `534b43d2` | equal | `36bea111` both | Pass | — | — |

## Interpretation

- **The fix does what BUG-193 needed.** Launch and book opens no longer wait on the folder: 140–150 s became about 2 s on the same book, on production builds, on the owner's real profile.
- **9(d) is not a regression.** Drive delivers the events: a bare recursive `fs.watch` saw them. Every add or unlink then runs `syncLibraryWithFolder` (`main.js:333-398`), which:
  - rescans the whole 120,190-file tree (93.6 s);
  - extracts each of the roughly 120k files the library has never imported;
  - saves once, at the end, with no re-entry guard.

  The base had the same shape, and its launch stall hid it. With the stall gone, the startup import now actually proceeds. That is why the owner keeps `sourceFolder` cleared until LARGE-FOLDER-SYNC-1 lands.
- **Failure classification:** 9(d) is an authorized exclusion (owner ruling, Blurby.Brain session, 2026-10-14) whose cause is inherited from the base. 9(e) was not run, so BUG-189 stays open. This close-out closes only FOLDER-SCAN-PERF-1 and BUG-193.

**Populations:**
- **Passed:** Done-when 1–8, 9(b), 9(c), the `error.log` half of 9(d), and 10.
- **Failed:** the live add of 9(d).
- **Excluded under authority:** 9(d).
- **Not run:** 9(e).
- **Unchanged:** the sync's pruning and the `read-file-buffer` allowed-roots check. Both are out of scope by design; the pruning hazard is BUG-195.
- **Published:** `main` at `534b43d2`.
- **Still open:** LARGE-FOLDER-SYNC-1, BUG-189 and BUG-195.

## Proposed Dispositions

- 9(d): authorized exclusion; the cause moves to LARGE-FOLDER-SYNC-1 (Seq 15, stub).
- BUG-193: RESOLVED (`534b43d2`).
- BUG-189: open; the dev-mode re-measure is still owed.
- Fold-in 2a (the watcher closed flag and a cancellable startup timer): moved to LARGE-FOLDER-SYNC-1 (D1 re-routed). QUIT-FLUSH-1 is not edited.
- Latent defect, recorded in LARGE-FOLDER-SYNC-1: a cancelled sync (`main.js:373-381`) saves before non-folder documents are appended. Today nothing in the renderer calls it.

## Mid-Dispatch Decisions

##### Mid-Dispatch Amendment — 2026-10-14 — control (h) read budget 250 ms → 50 ms
Decision Type: Specification correction. The base changed under a pre-registered C1 stop, "(h) under its budget on the base".
Context: At C1, control (h) passed on the unmodified base `978b5fa6`. A 1 MB read 20 ms after the chokidar `startWatcher` took 149–228 ms, with event-loop gaps of 36–71 ms (vitest, plain Node 24.14.0, and a 3,000/12,000/30,000-file sweep). Bare recursive `fs.watch` measured 1–2 ms reads and 17–19 ms gaps. The planner probe's 607–814 ms reads and 405–575 ms gaps did not reproduce, and a larger tree does not restore them. Issue: `docs/governance/bug-reports/Issue.FOLDER-SCAN-PERF-1.2026-10-14.md`.
Decision: Owner chose option A (2026-10-14).
- (h)'s read budget is 50 ms, and its title reads "resolves within 50 ms".
- The event-loop-gap assertion keeps its 250 ms budget, as a non-control guard.
- Done-when 1's (h) reason becomes "times the read over 50 ms".
- The failure-handling load contingency becomes: "If (h) fails after C2 only under full-suite load, record both runs and raise its read budget once, to 100 ms. That is still below the base's lowest observed read of 149 ms. Any further raise is BLOCKER(USER)."
Rationale: At 50 ms, the base fails by 3× or more and `fs.watch` passes by about 25×. The gap margin (36–71 ms against 17–19 ms) is too thin to serve as a timing control.

##### Mid-Dispatch Amendment — 2026-10-14 — D2(b): a renamed supported file reports onAdd then onChange
Decision Type: Hybrid (it touches the owner's "no feature change" ruling), so it was elevated to the owner.
Context: Code-quality nit 6. An editor's atomic save (a temp file renamed over the target) settled as `onAdd` only, where chokidar's `atomic` option reported `change`, so the word count was not refreshed.
Decision: Owner chose (b): "fix it now in FOLDER-SCAN-PERF-1 (option b), one test, re-run Done-when 2, 7 and 10."
- `settle` calls `if (renamed) onAdd(full); onChange(full);`.
- Test (j) failed first on `ac8485f9`, then passed (`234a12b9`).
Rationale: It restores chokidar parity for two lines and one test, before Done-when 9 runs.

##### Mid-Dispatch Decision — 2026-10-14 — Done-when 9(d) waived
Decision Type: Authorized exclusion (owner), together with a new item.
Context: The live add failed on the owner's 120,190-file Drive folder: a full rescan plus a roughly 120k-file import per event (see Interpretation).
Decision: "Merge FOLDER-SCAN-PERF-1 with Done-when 9(d) waived. Keep sourceFolder cleared, and file a new item for per-file live sync and a policy for very large folders."
- This is the owner's instruction, typed in the Blurby.Brain session; the confirm dialog in the implementation session was not the authority.
- Merged as `534b43d2`.
Rationale: The fix delivers the item's goal. The live-sync gap predates it and needs its own design.

##### Planner rulings — 2026-10-14
- **D1:** re-routed. Fold-in 2a moves from QUIT-FLUSH-1 to LARGE-FOLDER-SYNC-1, because QUIT-FLUSH-1's specification forbids `main/folder-watcher.js` and `main.js:640-665`.
- **D3:** Done-when 9 runs after G2, on the owner's profile, and QUIT-FLUSH-1 dispatches after this merge.
- **D4:** the stray anchor is removed.
- **D6:** row 1 is confirmed as real work, and LARGE-FOLDER-SYNC-1 goes at Seq 15.
- Full record: `docs/governance/close-outs/Memo.FOLDER-SCAN-PERF-1.GovernanceStaging.2026-10-14.md`.

## Lessons

- **New:** LL-158 — Trace what a live-behaviour acceptance row triggers, end to end, at the real data size.
- **Applied:**
  - **Standing rule 43 (LL-138):** held. The five controls failed on base. The C1 stop caught (h) passing on base before any fix was written.
  - **Standing rule 44 (LL-143):** did not hold for (h). Its dry run used the planner's plain-Node probe, not the committed vitest control, so a control that passes on base was not seen until C1. Status record appended. The search-gate dry runs matched exactly.
  - **Standing rule 39 (LL-112):** held. The contract tests (c)–(f) passed unchanged on the native watcher.
  - **LL-152:** held. Done-when 9 was an A/B of base against fix on production builds, with the same book: 140–150 s against about 2 s.
  - **LL-142:** held. "Fixed" is claimed only from timed renders read back on the owner's profile; Drive behaviour was measured, not assumed.
  - **LL-157:** held. The startup hook is a synchronous `did-finish-load` listener, and `will-quit` was untouched.
  - **LL-156:** held. The pruning line (`main/folder-watcher.js` `access` → `[]`) and the allowed-roots check were kept verbatim; BUG-195 is unchanged.
  - **SRL-086/087 (standing rule 36):** held. Line numbers were re-verified on the base at setup.
  - **Standing rule 47 (LL-147):** held. The full suite ran on the owner's machine (`6d5a849f`).
  - **Standing rule 48 (LL-149):** held. Typecheck and build were in Done-when 7, both exit 0.
  - **Standing rule 45 (LL-141):** held only partly. The planner drove and timed Done-when 9 on the owner's profile and machine, with the owner's go, rather than the owner timing it in person.
  - **Standing rule 41 (LL-136):** held. The fence exempts the time log, memo and issue file (Fold-in 2).
  - **Standing rule 46 (LL-153):** held. The run wrote nothing to the register; status moves were made by the ceremonies.
  - **LL-148:** held. No branch file names the merge sha; it appears only in what was written after the merge.

## Files Created

- **Removed (temporary):** none.
- **Committed:** 5 (`tests/folderWatcher.test.js`, the issue file, the staging memo, the time log, and this report).
- **Ignored:** none.
- **Left for a decision:** `tests/perf-baseline-results.json`. `npm test` rewrites it on every run, and the staging plan never stages it. It is left uncommitted in the worktree (Rule 10).
- **Guard:** `created-files` exit 0. The only uncommitted file is `tests/perf-baseline-results.json`.

## Governance Updates

- **ROADMAP.md:**
  - The specification is archived to `docs/planning/.Archive/ROADMAP_legacy.md`, with Fold-ins 1, 1b and 2 applied; a completion line keeps the anchor.
  - The stray `dev-perf-measure-1` anchor is removed.
  - The header, queue, lane row and Stage 8 order are updated.
  - The LARGE-FOLDER-SYNC-1 stub is added.
- **CLAUDE.md:** chokidar is dropped from the dependencies, and the queue, open-bug, latest-merge and suite-count lines are updated.
- **BUG_REPORT.md:** BUG-193 is RESOLVED, and BUG-189 gets the 9(e) note.
- **LESSONS_LEARNED.md:** LL-158 and an LL-143 status record.
- **TECHNICAL_REFERENCE.md:** updated in the sprint (`ac8485f9`).
- **Issue file:** `## Decision` blocks for the C1 stop and 9(d).
- **Terminal ledger:** one completion record.

## Roadmap & Queue Movement

- **Retired:** FOLDER-SCAN-PERF-1 (Seq 10 → Completed 2026-10-14; Seq cleared).
- **Elevated:** QUIT-FLUSH-1 → Seq 10, the first dispatch-ready item after the epic (NARRATE-REBUILD-1, 9). Then READER-VISUAL-DIAG-1 11, PACKAGING-FIX-1 12, UX-POLISH-1 13, UX-POLISH-2 14, and LARGE-FOLDER-SYNC-1 15 (new stub). Stubs 16–21 are unchanged. Dispatch-ready depth stays 5.

## Next Work Pointer

Run `/next-pointer` for QUIT-FLUSH-1. Its specification is unchanged; re-grep its `main.js` edit sites, since this item moved the startup block by one line. LARGE-FOLDER-SYNC-1's technical half can be specified ahead of its design half.

## Gates

- Evidence: Done-when 1–8 and 10 re-run on `6d5a849f` (`origin/main` merged in) on the owner's machine. Done-when 9 was run by the planner on the owner's profile after G2.
- Integrated identity: tested tree `36bea111` = `main` `534b43d2`'s tree; `origin/main` = `534b43d2`.

## Git Hand-Off

- [x] Merge `534b43d2` (`--no-ff`, pushed).
- [x] Close-out documents committed on `eb/closeout-folder-scan-perf-1`, merged to `main` with `--no-ff`, and pushed (sha in the register's Evidence and the terminal ledger).
