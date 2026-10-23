# Close-out — RENAME-RETRY-1: Every atomic rename in the main process retries a transient Windows lock (2026-10-22)

runtime: estimate 9m · actual 6m (time log `Timing.RENAME-RETRY-1.jsonl`, complete; 18 min waited on the heavy-gate hold)

**Goal:** route every temp-then-rename write in the main process through the existing bounded retry, so a scanner's brief Windows lock (EPERM/EBUSY) no longer fails a save outright.
**Result:** the seven raw renames now call `renameWithRetry`, which `main/json-store.js` exports unchanged: `sync-engine.js:98`, `auth.js:110`, `ipc/reader.js:187` and `:244`, `ipc/stats.js:206`, `tts-cache.js:197`, and `narrate/expose-durations.js:76`. Merged `40c01ceb` (branch tip `142bec88`, tested combined tree `09274a74`).
**Learned:** No new lesson. Standing rule 36 (re-grep at dispatch) did its job: the seventh site came in with NARRATE-REBUILD-1, after Brain's list of six, and the planner's trace found it before dispatch. The run then held every site at its specified line.
**Recommend:** route `saveSyncState` and `saveTokens` through `writeJSON`, or give them unique temp names. That is the follow-up the review found (filed as stub RENAME-TMP-RACE-1).
**Bottom line:** every main-process atomic save now survives a transient lock, proven by a test that failed on the base and by a clean suite on the combined tree.

## Evidence (Done-when, verified 2026-10-22)

| # | Criterion | Evidence | Result |
|---|---|---|---|
| 1 | Positive control | C1 `bcc8210f` (test alone): vitest exit 1, 2 of 2 failed. The scan listed the seven sites; the behaviour test failed with "expected 'undefined' to be 'function'" (staging memo). | pass |
| 2 | Site scan and behaviour test | `renameRetrySites` and `jsonStore`: 8 of 8, exit 0 (memo). | pass |
| 3 | No raw rename left | Re-run by the planner on `main` @ `40c01ceb`: `git grep -n -E "(fsPromises\|fs)\.rename\(" -- main` prints only `main/json-store.js:13`, exit 0. | pass |
| 4 | Helper exported unchanged | The json-store diff is the `module.exports` line only (memo; review). | pass |
| 5 | Suite, typecheck and build on the owner's machine | `cbe41b1d`: 176 files, 2,416 passed, 1 skipped, 0 failed. Combined tree `09274a74` (with PAGE-POSITION-SAVE-2): 2,419 passed, 1 skipped, 0 failed. Typecheck 0 and build 0 on both. | pass |
| 6 | Fence | `git diff --name-status 40c01ceb^1 40c01ceb`: the 8 specified paths plus the memo and time log (planner-verified). | pass |

- **Populations:** the suite runs above are the whole suite, with 1 skipped test (pre-existing). No failure was excluded, and no closed-list admission was used.
- **Published:** `40c01ceb` on `origin/main`.
- **Unchanged:** `main/json-store.js` beyond its export line; the renderer; `preload.js`.

## Findings and dispositions

| Finding | Disposition |
|---|---|
| `saveSyncState` and `saveTokens` share a fixed `.tmp` name with no write serialization, so a retry slightly widens an existing overlap race (review, low; predates this item). | New stub **RENAME-TMP-RACE-1** (XS, Platform & Maintenance, not a release gate). |
| The implementer's targeted run named `tests/auth.test.js`, and how vitest selected its two files is unresolved. | Accepted. The full suite and the reviewer's 14-file run cover the changed modules. |

## Mid-Dispatch Decisions

None. The heavy gates were held while ELECTRON-42-UPGRADE-1's crash-count runs used the machine, by the conductor's sequencing and not by a decision issue.

## Lessons

No new lesson — the work followed standing rules 36 (re-grep at dispatch), 41 (fence exempts the time log and memo), 43 (positive control), 44 (dry-run gates: Done-when 3 printed 8 lines on the base), 46 (no register writes by the run), 47 and 48 (suite, typecheck and build on the owner's machine) and 50 (the KF-2 waiver re-read). Each held, and none was strained. LL-156, which became rule 50 this review, was applied a third time: the specification re-read the KF-2 waiver against its own edit sites and recorded that it does not touch the moved writer.

## Files Created

- `docs/governance/close-outs/Memo.RENAME-RETRY-1.GovernanceStaging.2026-10-22.md` and `Timing.RENAME-RETRY-1.jsonl`: committed with the merge. The final time-log copy (row 3's resume and end) is folded in by this close-out.
- `tests/renameRetrySites.test.js`: committed.
- The worktrees `rename-retry-1` and `rename-retry-1-merge` are kept (maintenance).
