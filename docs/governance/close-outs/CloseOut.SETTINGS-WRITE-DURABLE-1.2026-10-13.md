---
sprint: SETTINGS-WRITE-DURABLE-1
date: 2026-10-13
runtime: 2m (timing --summary)
tokens: not measured
status: has-discoveries
---

# Pointer Close-Out: SETTINGS-WRITE-DURABLE-1

Origin: roadmap item, Seq 11 (Stage 7). Branch `eb/settings-write-durable-1` from `main` @ `05a5480a`; C1 positive control, C2 `ec0ef419` (review fix `c4471608`), amendment 1 `0d97ea43`, smoke record `ed0b4e79`, `origin/main` (`205d91c8`) merged in at `69c9bc7f`; merged `b728a3e8` (`--no-ff`), pushed. Dispatched beside NARRATE-REBUILD-1 under the 2026-10-13 parallel run plan, to land before P6's production build.

## Sprint Brief

**Goal:** Stop settings and sync-queue saves racing on one `.tmp` file (ENOENT, stale overwrites), make saves report failure without crashing, and flush settings at quit (BUG-185).
**Result:** New `main/json-store.js` serializes writes per file; the settings, history and site-cookie saves return `true`/`false` instead of rejecting; `main/sync-queue.js` uses the same writer; a bounded rename retry (EPERM/EBUSY/EACCES, 20/40/80 ms, `JSON_RENAME_RETRY_DELAYS_MS` in `main/constants.js`, added by mid-dispatch amendment) absorbs Windows file locks; `will-quit` now awaits a settings save; full suite 2,054 passed / 1 skipped, typecheck and build exit 0; owner smoke: no ENOENT at startup, quit or relaunch; merged `b728a3e8`.
**Learned:** LL-156 — an out-of-scope waiver tied to a code location moves with the code; LL-157 — Electron does not wait for an async quit listener.
**Recommend:** Lift the P6 build hold now; fix BUG-192 (saves at quit are abandoned) as its own item after the epic, since it edits `main.js`'s quit handler.
**Bottom line:** The write race and the crash path are gone; the save at quit still drops the last change, now tracked as BUG-192.

## Time

| Row | Task | Kind | Model | Effort | Predicted | Actual | Waited | Added | Flag | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Writer moved to its own module; concurrency and failure tests committed and failing on the unchanged writer | positive-control | claude-opus-5-5 | medium | 2 min (median of 31 runs) | 1 min | — | — | — | C1 committed; control exit 1 with 4 named failures (memo); tsc exit 0 |
| 2 | Serialized writer, non-rejecting saves, quit flush and sync-queue writer in place; docs updated | main-process-fix | claude-opus-5-5 | medium | 2 min (median of 31 runs) | 1 min | — | — | — | C2 committed; DW2 exit 0 (39 tests); DW3 exit1 empty x2; DW4 main.js:2; DW5 main.js:3; tsc 0; fence exact |
| 3 | Full suite, typecheck and build green; owner smoke recorded; merged and pushed | merge-and-verify | claude-opus-5-5 | low | 0 min (median of 36 runs) | 0 min | — | — | — | full suite exit 1: EPERM in jsonStore (a) + 3 env onnx failures; routed to planner (issue file); smoke deferred |
| +4 | Zeus: load spec, build plan, assign owners, conflict check | setup | claude-opus-5-5 | high | 8 min (median of 20 runs) | 0 min | — | yes | — | conflict check clean: P6 branch touches none of the edit sites; edit sites verified at main.js:62/135/158/159/298/705 |

Estimate 4m (the first listing, sequential rows) · Actual 2m (measured working time, sequential rows)

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | DW1 positive control at C1 | targeted vitest | exit 1, concurrency + `saveJSON` tests fail | exit 1, 4 named failures (ENOENT ×2, `saveJSON is not a function` ×2) (memo) | Pass | — | — |
| 2 | Amendment control (rename retry) | targeted vitest | (d)(e) fail on the unchanged writer | exit 1, (d) EPERM rejects, (e) 1 rename call not 4 (memo) | Pass | — | — |
| 3 | DW2 suites on the merged tree | 4 files | exit 0 | exit 0, 41 tests (executor, merged tree) | Pass | 39 → 41 tests | — |
| 4 | DW3 fixed-name `.tmp` lines | `git grep` ×2 on `origin/main` | exit 1, empty | exit 1, empty (re-run at close-out) | Pass | — | — |
| 5 | DW4 `await saveSettingsFn();` count | `git grep -c` | `main.js:2` | `main.js:2` (re-run) | Pass | was 1 | — |
| 6 | DW5 `return saveJSON(` count | `git grep -c` | `main.js:3` | `main.js:3` (re-run) | Pass | — | — |
| 7 | DW6 full suite, typecheck, build | exit codes | 0 | `npm test` 2,054 passed / 1 skipped / 0 failed in 150 files, no EPERM/EBUSY/EACCES in the log; typecheck 0; build 0 (memo, amended tree) | Pass | first run: 4 failed (3 environmental, 1 EPERM → amendment) | — |
| 8 | DW7(a) no ENOENT at startup, quit, relaunch | owner smoke, dev build `5abdd405` | none | none in either terminal | Pass | was seen live in the NARRATE-REMOVE-1 smoke | — |
| 9 | DW7(b) change survives a quit within 1 s | owner smoke | change kept | theme (saved 10 s before quit) kept; accent changed just before quit **lost** — `settings.json.tmp` never renamed, `sync-queue.json.tmp` 0 bytes; a second quit left `library.json.tmp` | **Excluded by the owner** (BUG-192) | — | medium |
| 10 | DW8 doc lines | exact text | BUG-185 status and TECHNICAL_REFERENCE sentence | both exact on `origin/main` (re-run) | Pass | — | — |
| 11 | DW9 fence | `git diff --name-status b728a3e8^1 b728a3e8` | spec's 7 paths + amendment's `main/constants.js` + memo/time log/issue | exactly that | Pass | — | — |
| 12 | Dev-mode load time during the smoke | wall clock | — | 2½–4 min to first render; one settings write took ~4 s from `.tmp` to rename (completed) | — | — | info |

## Interpretation

What passed: Done-when 1–6 and 8–9, and Done-when 7(a). The write race (ENOENT, stale overwrite) and the unhandled-rejection path are gone, verified by the concurrency tests on the real file system and by a smoke with no ENOENT.

What was excluded under authority: Done-when 7(b). The owner decided before the smoke that a failing quit check is filed separately and does not hold the merge, and restated it after the smoke. It is reported as excluded, never as passed. The cause is outside this item's change: Electron does not wait for an `async` `will-quit` listener, so every awaited flush on the handler's second pass (the library flush before this item, and this item's settings flush) can be cut off at exit. Filed as BUG-192 (`205d91c8`).

What the smoke could not test as written: the "quit within 1 s" timing. Dev mode was too slow to make it possible (finding 12); the theme survived only because the debounced save had already landed. The accent change, made just before quit, is the real test, and it failed (BUG-192).

What remains open: BUG-192; BUG-185 stays "RESOLVED in source" until the P6 production build and the owner's G2 smoke (standing rule 35); the KF-2 waiver's retirement (next roadmap review); the issue file's reference to "SRL-095", which exists nowhere — LL-156 and LL-157 carry the lessons it pointed at.

## Proposed Dispositions

All approved by the owner on 2026-10-13:

- Done-when 7(b) → authorized exclusion; BUG-192 open, fix after the epic (it edits `main.js`'s quit handler).
- BUG-185 → stays "RESOLVED in source" until the P6 production build and the G2 smoke.
- KF-2 waiver → propose retirement at the next roadmap review after clean full runs.
- The staging memo → its one fold-in migrated below; the memo archived verbatim with the specification in `docs/planning/.Archive/ROADMAP_legacy.md`, then deleted from `close-outs/`.

## Mid-Dispatch Decisions

Migrated verbatim from `Memo.SETTINGS-WRITE-DURABLE-1.GovernanceStaging.2026-10-13.md` (fold-in 1). Issue file: `docs/governance/bug-reports/Issue.SETTINGS-WRITE-DURABLE-1.2026-10-13.md`, whose `## Decision (planner, 2026-10-13)` block chose Option A.

#### Mid-Dispatch Amendment — 2026-10-13
**Pause point:** The first full `npm test` on C2 (`c4471608`) failed `tests/jsonStore.test.js` (a) once with `EPERM … rename concurrent.json.tmp -> concurrent.json` at `main/json-store.js:25`. The spec's Out of scope excluded the Windows EPERM rename (separation KF-2).
**Decision:** Type 1b — Advance (Cowork-originated), Option A of `docs/governance/bug-reports/Issue.SETTINGS-WRITE-DURABLE-1.2026-10-13.md`.
**Rationale:** The exclusion assumed the EPERM lived in `main/sync-queue.js`'s own writer, but C2 moved that writer into `main/json-store.js`. Without a retry the new test cannot pass reliably, and real settings saves (including the quit flush) are dropped on a transient AV or indexer lock.
**Scope change:** (1) `JSON_RENAME_RETRY_DELAYS_MS = [20, 40, 80]` in `main/constants.js`. (2) In `main/json-store.js`'s serialized write, retry the rename on EPERM/EBUSY/EACCES after each delay, then rethrow the last error; rethrow other codes at once; never retry writeFile. (3) `tests/jsonStore.test.js` (d): transient EPERM ×2, then success, 3 rename calls. (e): persistent EPERM rejects after 4 calls. Both spy on the CommonJS `fs/promises` object and must fail before the retry lands (standing rule 43). (4) Done-when 9's fence adds `M main/constants.js`. (5) The KF-2 waiver does not apply: any EPERM/EBUSY/EACCES escaping `json-store.js` after the retries is BLOCKER(USER), and the delays are not lengthened.
**Follow-up items:** This completes READER-MODE-SEPARATION-2 follow-up 4 (KF-2, Decision #25). Propose retiring the KF-2 waiver at the next /roadmap-review after clean full runs. Separate: Electron does not await an async `will-quit` listener (Plato). If Done-when 7's quit check fails, file it as a new issue; do not fix it in this sprint.

## Lessons

- **New:** LL-156 — An out-of-scope waiver tied to a code location moves with the code.
- **New:** LL-157 — Electron does not wait for an async quit listener.
- **Applied:** LL-152 — did not hold at spec stage: Done-when 7 prescribed `npm run dev` for a 1-second quit check, which the dev build's 2½–4-minute load made impossible; status record appended.
- **Applied:** LL-138 (standing rule 43) — held: the C1 controls and the amendment's (d)(e) controls failed on the unchanged writer before each change.
- **Applied:** LL-143 (standing rule 44) — held: every search gate dry-run on the base and passing at its exact exit code on `origin/main`.
- **Applied:** LL-006 (standing rule 3) — held: write-then-rename kept; only ordering and the rename retry changed.
- **Applied:** LL-142 — held: the tests read the files back; the smoke judged durability from the files on disk, not from the UI.
- **Applied:** LL-141 (standing rule 45) — held: the startup and quit checks were owner-observed.
- **Applied:** LL-147 — held: the full suite ran on the owner's machine.
- **Applied:** LL-149 — held: typecheck and build listed and exit 0.
- **Applied:** LL-148 — held: the bug status line names the item, not a merge sha.
- **Applied:** LL-136 (standing rule 41) — held: the fence exempted the memo, time log and issue file.
- **Applied:** LL-135 (standing rule 42) — held: the dispatch carried the filled reconciliation recipe.

## Files Created

- **Removed (temporary):** none
- **Committed:** 5 (`main/json-store.js`, `tests/jsonStore.test.js`, the staging memo, the time log, the issue file)
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** `created-files` exit 0 (base `b728a3e8^1`)

The staging memo is deleted by this close-out after its fold-in lands; its full text is preserved in `docs/planning/.Archive/ROADMAP_legacy.md`.

## Governance Updates

- `docs/governance/LESSONS_LEARNED.md`: LL-156, LL-157; status record under LL-152.
- `ROADMAP.md`: completed-summary row; specification archived; Stage 7 parallel-run line and queue line updated.
- `CLAUDE.md`: queue line.

## Roadmap & Queue Movement

- **Retired:** SETTINGS-WRITE-DURABLE-1 — Completed 2026-10-13, Seq cleared.
- **Elevated:** none — the head is NARRATE-REBUILD-1 (Seq 9, In Flight; P6 holds its production build for G2, and the hold can now be lifted).

## Next Work Pointer

None printed here (`/next-pointer`).

## Gates

Done-when 1–6 and 8–9 pass; Done-when 7(a) passes; Done-when 7(b) is excluded by the owner (BUG-192). **Buffer check:** after this crossing the queue holds READER-VISUAL-DIAG-1 (dispatch-ready), UX-POLISH-1 (merged, close-out after G2) and the DEV-PERF-MEASURE-1 stub. Dispatch-ready depth is 1, below the target of 5 and Rule 5a's floor of 3: a `/roadmap-review` is due.

## Git Hand-Off

Committed on `eb/closeout-settings-write-durable-1`, merged `--no-ff` to `main` and pushed (`policy.git` push).
