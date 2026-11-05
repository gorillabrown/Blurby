---
dispatch: ERROR-LOG-CAP-1
date: 2026-11-05
runtime: 2m recorded for the first build (Timing.ERROR-LOG-CAP-1.jsonl)
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: ERROR-LOG-CAP-1

## Dispatch Brief

**Goal:** Stop `error.log` growing without bound: rotate it to `error.log.1` at 10 MB, through one shared appender.
**Result:** `main/error-log.js` is the one appender, and `main/ipc/library.js`, `main/ipc/misc.js` and `main/library-write.js` all use it. The item merged in the RC window, but `library-write.js`, added by another branch, kept a private uncapped appender (F-027). The ERROR-LOG fix removed it and added a test that walks all of `main/`, merged as `c630f9a4`.
**Learned:** LL-194 — a single-copy check searches every place a later merge can add a copy, and stays as a test.
**Recommend:** Nothing further is owed by this item.
**Bottom line:** Every write to `error.log` now goes through the 10 MB cap, and a later copy of the appender fails a test.

## Findings

Rows are the item's Done-when list from `ROADMAP_snapshot_2026-10-23.md#error-log-cap-1`, plus the rows of Blurby.Brain1's fix ruling, checked on `origin/main` `c630f9a4`.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Re-grep on the base | `git grep` on `48ce4db9` | exactly the two sites | `main/ipc/library.js:20`, `main/ipc/misc.js:21` (memo) | Pass | — | Pass |
| 2 | Red first | `tests/errorLogCap.test.js` | fails on the base | committed first in `e7f5c8bb`; 3 of 5 failed (memo) | Pass | — | Pass |
| 3 | Second rotation, under-cap append, rename failure | test file | covered and passing | 5 tests on `origin/main`, all passing in the suite | Pass | — | Pass |
| 4 | Only `main/error-log.js` appends | `git grep -n "appendFile(errorLogPath" -- main` | `main/error-log.js` only | `main/error-log.js:18` only | Pass | Failed on `14ce3d24` (F-027) | Pass |
| 5 | Suite, typecheck, build | gate | all exit 0 | 3,050 passed / 1 skipped / 0 failed; typecheck 0; build 0, on the tree of `2faadd7f`, which is the merge's tree | Pass | 3,048 on run 6 | Pass |
| 6 | Fence | `git diff --name-status` | the six named paths | exactly those, plus the memo and time log; the fix's fence was `main/library-write.js`, the new test, memo and time log | Pass | — | Pass |
| F1 | No appender outside `main/error-log.js`, as a test | `tests/errorLogSingleAppender.test.js` (a) | red on the base, green on the fix | red in `5fd9c0e5`; green | Pass | New | Pass |
| F2 | The failed-unlink path rotates at the cap | same file (b) | red on the base, green on the fix | red in `5fd9c0e5`; green; also run against each packaged exe's own asar on x64 (tip passes, base fails) | Pass | New | Pass |

Population: the x64 suite on RodneySr at `2faadd7f`. Gate (1) has not been re-run on this merge. It re-runs after the last merge of the release set, and no row here depends on it.

## Interpretation

No row is open. Row 4 failed the 2026-11-04 close-out review because of F-027, which held this item back from the 21 closed then. Its cause is that the RC window's single-copy check searched only `main/ipc`, so a copy merged from another branch sat outside it. The fix removes the copy, and row F1 keeps a later copy from returning unseen. Blurby.Brain1's ruling set that shape, a test and not a one-off grep.

The memo's two tier 1 deviations stand: rotation triggers when the append would take the file past the cap, which the spec's own red test requires, and `logToFile` takes an optional `maxBytes` for tests. Production calls pass two arguments.

## Proposed Dispositions

- **Close:** F-027, resolved by `c630f9a4`.
- **Log:** the reconcile log (`main/sync-engine.js:463`) is a separate file with no cap. It is outside this item, and Cloud Sync is a deferred lane.

## Mid-Dispatch Decisions

- **2026-11-05, the fix's shape (Blurby.Brain1, `Brain1.post-halt-rulings.2026-11-05.md` 1a).** Replace the private appender with the shared helper, keep `fsPromises` for `unlink`, and ship a test, not a grep.

## Lessons

- **New:** LL-194 — A single-copy check searches every place a later merge can add a copy, and stays as a test.
- **Applied:** Standing rule 43 — held: `e7f5c8bb` for the item, and `5fd9c0e5` for the fix, each red on its base first.
- **Applied:** Standing rule 53 — held: both architectures passed, with the arm64 half on Rodney, and Blurby.Brain1 confirmed before the merge go.

## Files Created

- **Removed (temporary):** none
- **Committed:** `Memo.ERROR-LOG-CAP-1.GovernanceStaging.2026-10-23.md`, `Memo.ERROR-LOG-CAP-FIX.2026-11-05.md`, and both time logs, on `main`; this report with the close-out.
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** not run per item
- **Footprint:** none on this machine beyond the evidence folders below, which stay as evidence.

## Governance Updates

- `docs/governance/Findings.md`: F-027 resolved.
- `docs/governance/LESSONS_LEARNED.md`: LL-194.

## Roadmap & Queue Movement

- **Retired:** ERROR-LOG-CAP-1, from In Flight; Seq 75 cleared. Nothing else moves, because it was not at the head.

## Next Work

Unchanged. BLOCK-TEXT-ORDER-1 stays held for Job 1c and F-036, and the release merge set follows Blurby.Brain1's order.

## Gates

- **Integrated identity:** the item merged by `7bd61fce` (RC window); the fix merged by `c630f9a4`, `--no-ff`, parents `14ce3d24` and `2faadd7f`, whose tree equals `2faadd7f`.
- **Package:** `Brain1.ERROR-LOG-CAP-FIX.package-confirmation.2026-11-05.md`. x64 pair on RodneySr (`C:\Projects\Blurby-artifacts\error-log-cap-fix\`); arm64 on Rodney (`C:\Projects\Blurby-artifacts\error-log-fix-arm64-20261105\`), including a launch on the merge commit: alive at 25 s, scratch profile proved, no `error.log`, 0 dumps, live profile unchanged.
- **Authority to close:** the owner's standing goal and the approved close-out plan's order (rule, fix, close); Blurby.Brain1's package confirmation; Blurby.Roadmap's own evidence review and merge go.

## Git Hand-Off

Committed by Blurby.Roadmap.
