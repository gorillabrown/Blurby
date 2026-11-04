---
dispatch: RENAME-TMP-RACE-1
date: 2026-11-04
runtime: not measured (no time log)
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: RENAME-TMP-RACE-1

## Dispatch Brief

**Goal:** Stop the sync state file and the sign-in tokens file from racing on their own temp file when two saves overlap.
**Result:** `saveSyncState` in `main/sync-engine.js` and `saveTokens` in `main/auth.js` now call the shared `writeJSON` from `main/json-store.js`, which serializes writes per path, instead of building their own `.tmp` file and renaming it. A scan test (`WRITE_JSON_SITES` in `tests/renameRetrySites.test.js`) fails if either file goes back to its own temp file.
**Learned:** No new lesson — standing rules 41, 43, 44, 46, 47, 48 and 50 and LL-164 covered it.
**Recommend:** Nothing further is owed by this item. The memo's review note, that the scan matches the literal `+ ".tmp"` only, stays logged.
**Bottom line:** Both files now save through one serialized writer, and this is on `main`.

## Findings

Rows are the item's Done-when list, checked read-only against origin/main 14ce3d24.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Positive control, scan test red alone | vitest on commit 9052a19e | red by assertion | `1 failed \| 2 passed` (memo) | Pass | — | Pass |
| 2 | `WRITE_JSON_SITES` scan test | `tests/renameRetrySites.test.js` | import, call, no `.rename(`, no `+ ".tmp"` | present (line 25, test at 47-59); the other three named test files exist | Pass | — | Pass |
| 3 | No own temp file | `git grep -F '.tmp"' -- main/sync-engine.js main/auth.js` | exit 1 | exit 1 | Pass | — | Pass |
| 4 | `writeJSON(` per file | `git grep -c` | 1 each | `main/auth.js:1`, `main/sync-engine.js:1`; no `.rename(` or `renameWithRetry` left | Pass | — | Pass |
| 5 | npm test, typecheck, build | gate | all exit 0 | run 6 3,048 passed, typecheck 0; memo: 2,431 passed on afd80266 | Pass | — | Pass |
| 6 | Fence | `git diff --name-status` over main, tests, src | M sync-engine.js, M auth.js, M renameRetrySites test | exactly those three | Pass | — | Pass |

Population: gate (1) run 6, partial; D6 cold, D3 2.00x and Q3 s2 pending a quiet rerun (tree 14ce3d24: 3,048 passed, 0 failed, typecheck 0, 0 crashes). No row of this item depends on those unjudged rows.

## Interpretation

No non-pass row. Memo evidence, not re-run here: the red-first result, the four-file run (48 passed) and the owner-machine counts on afd80266. The memo says no time log was kept, so the report carries no Time section. The memo has no Lessons section, so the applied lessons below come from the specification's own list.

## Proposed Dispositions

- **Log:** the memo's review note on the scan test's literal match and on `writeJSON(` also matching comments. Neither affects the current files.

## Mid-Dispatch Decisions

None.

## Lessons

- **New:** No new lesson — followed standing rules 41, 43, 44, 46, 47, 48 and 50 and LL-164 (the specification's list).
- **Applied:** Standing rule 50 — held: `tests/auth.test.js`'s fs mock still reaches the write, as the review confirmed.
- **Applied:** Standing rule 43 — held: the scan test was committed alone in 9052a19e and failed 1 of 3.
- **Applied:** Standing rule 44 — held: Done-when 3 and 4 greps recorded with their output.
- **Applied:** Standing rule 41 — held: the memo records no departure; the fence matched.
- **Applied:** Standing rule 46 — held: the memo records no register write.
- **Applied:** Standing rule 47 — held: full suite on the owner's machine, 2,431 passed on afd80266.
- **Applied:** Standing rule 48 — held: typecheck and build exited 0.
- **Applied:** LL-164 — held: the memo records no departure from it.

## Files Created

- **Removed (temporary):** none
- **Committed:** the memo `docs/governance/close-outs/Memo.RENAME-TMP-RACE-1.GovernanceStaging.2026-10-23.md` (committed earlier); no time log was kept; this report is committed with the close-out.
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** not run per item
- **Footprint:** none

## Governance Updates

None. The memo proposes no fold-in.

## Roadmap & Queue Movement

- **Retired:** RENAME-TMP-RACE-1 — retired from In Flight. No sequence change: it held no Seq slot at the head.

## Next Work

Unchanged. The next dispatch comes from the queue through `/next-dispatch`.

## Gates

- **Integrated identity:** branch tip b37d199b is an ancestor of origin/main; merged by c5bb507f (RC-INTEGRATION-WINDOW); tested tree 14ce3d24.
- **Package:** the RC window's package record covers this item: x64 pair on RodneySr at 70d64237, Brain1's confirmation, and an arm64 launch on Rodney from c5bb507f (`C:\Projects\Blurby-artifacts\rc-merge-20261103\`). The raw run 6 record is on RodneySr (`C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` there).
- **Authority to close:** Blurby.Brain1's run 6 close-out ruling (2026-11-03) plus this item's own evidence; owner approval of the close-out plan on 2026-11-04.

## Git Hand-Off

Committed by Blurby.Roadmap.
