---
dispatch: LARGE-FOLDER-SYNC-3
date: 2026-11-04
runtime: not measured (no time log)
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: LARGE-FOLDER-SYNC-3

## Dispatch Brief

**Goal:** Stop a large or slow library folder from hanging or corrupting folder sync: system folders imported by the watcher, a Saved Articles document pruned on a case difference, and unbounded waits on a hung mount.
**Result:** The watcher (`main/folder-watcher.js`) skips system folders such as `$Recycle.Bin`; Saved Articles matches by a case-insensitive path key; `switch-folder` and file stats use the bounded `timeLimit`; and a 60-second per-folder breaker (`FOLDER_ROOT_BREAKER_MS`) stops repeated listings of a hung mount, with a listing that answers clearing it and the banner Retry checking outside it.
**Learned:** LL-184 — a module-level breaker shared across tests in one file needs a clearing path.
**Recommend:** Nothing further is owed by this item. The scale run is memo evidence from the build machine and was not repeated; rerun it only if folder sync changes again.
**Bottom line:** Folder sync no longer waits on a hung mount or drops Saved Articles on a case difference, and this is on `main`.

## Findings

Rows are the item's Done-when list, checked read-only against origin/main 14ce3d24.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Positive control | vitest on commit 844b6cca | red by assertion | 5 failed, 3 passed (memo) | Pass | — | Pass |
| 2 | Tests W1, W2, W3a, W3b, W3c (and W3d, gap tests) | `folderWatcher.test.js`, `folderSync.test.js` | present | W1 :363, W3c :385, W3d :426; W2 :750 (win32 only), W3a :798, W3b :832, gaps :852/866/891 | Pass | — | Pass |
| 3a | `FOLDER_ROOT_BREAKER_MS` lines in main | `git grep -n -F -- main` | 3 per spec | 4 lines (declaration, export, require, use); the spec miscounted, as the memo records | Pass | — | Pass |
| 3b | `parts.some(isSystemFolder)` | `git grep` | one line | `main/folder-watcher.js:166` | Pass | — | Pass |
| 3c | W2 and W3 edit sites | read at origin/main | present | `library.js:457`, `:496`; `state.js:94`; `main.js:335` | Pass | — | Pass |
| 4 | Scale run before and after, stop at 2x | `scripts/perf/folder-sync-scale.mjs` | worst add under 2x base | worst add 447.84 ms base, 342.86 ms after (0.77x) | Pass | — | Pass |
| 5 | npm test, typecheck, build | gate | all exit 0 | run 6 3,048 passed, typecheck 0; memo: 2,439 passed on e5a2d58e | Pass | — | Pass |
| 6 | Fence (7 paths) | `git diff --name-status dc8c2c30 043ef79a` | the 7 spec paths | the 7 paths plus 2 rule-50 pin updates (`folderUnreachableGuard.test.js`, `folderNotice.test.js`) and the memo, as the memo declares | Pass | — | Pass |

Population: gate (1) run 6, partial; D6 cold, D3 2.00x and Q3 s2 pending a quiet rerun (tree 14ce3d24: 3,048 passed, 0 failed, typecheck 0, 0 crashes). No row of this item depends on those unjudged rows.

## Interpretation

No non-pass row. Memo evidence, not re-run here: the scale run in row 4 (a timing taken on the build machine, which load would distort, LL-152), the red-first result and the owner-machine counts on e5a2d58e. The two rule-50 pins still match `main.js:15` and `:335` on origin/main. W2 runs only on win32, which the gate machine is. Later commits on these files (53a89e55, 7bd61fce, ee330577, a61752a3) are RC merge resolutions for other items and supersede no row.

## Proposed Dispositions

None.

## Mid-Dispatch Decisions

None. The memo records three tier-1 design choices (the breaker is per folder; a listing that answers clears it; banner Retry lists afresh) as decisions inside the item, not mid-dispatch amendments.

## Lessons

- **New:** LL-184 — a module-level breaker shared across tests in one file needs a clearing path (a listing that answers clears it, with no test-only API). Stated in the memo; appended to the lessons role by the close-out.
- **Applied:** Standing rule 36 — held: every site re-grepped on dc8c2c30 and matched.
- **Applied:** Standing rule 41 — held: the memo records no departure; the fence matched.
- **Applied:** Standing rule 43 — held: tests committed alone in 844b6cca, 5 failed for the named reasons.
- **Applied:** Standing rule 44 — held: Done-when 3 greps exit 1 on the base; the 4-line count was found by running them.
- **Applied:** Standing rule 47 — held: full suite on the owner's machine, 2,439 passed on e5a2d58e.
- **Applied:** Standing rule 48 — held: typecheck and build exited 0.
- **Applied:** Standing rule 50 — held: the two pinned tests were updated to follow the specified change.
- **Applied:** LL-152 — held: base and after scale runs were taken on the same machine.

## Files Created

- **Removed (temporary):** none
- **Committed:** the memo `docs/governance/close-outs/Memo.LARGE-FOLDER-SYNC-3.GovernanceStaging.2026-10-23.md` (committed earlier); no time log was kept; this report is committed with the close-out.
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** not run per item
- **Footprint:** none

## Governance Updates

None to governance files. The memo proposes no fold-in; LL-184 is the one lessons entry.

## Roadmap & Queue Movement

- **Retired:** LARGE-FOLDER-SYNC-3 — retired from In Flight. No sequence change: it held no Seq slot at the head.

## Next Work

Unchanged. The next dispatch comes from the queue through `/next-dispatch`.

## Gates

- **Integrated identity:** branch tip 043ef79a is an ancestor of origin/main; merged by c5bb507f (RC-INTEGRATION-WINDOW); tested tree 14ce3d24.
- **Package:** the RC window's package record covers this item: x64 pair on RodneySr at 70d64237, Brain1's confirmation, and an arm64 launch on Rodney from c5bb507f (`C:\Projects\Blurby-artifacts\rc-merge-20261103\`). The raw run 6 record is on RodneySr (`C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` there).
- **Authority to close:** Blurby.Brain1's run 6 close-out ruling (2026-11-03) plus this item's own evidence; owner approval of the close-out plan on 2026-11-04.

## Git Hand-Off

Committed by Blurby.Roadmap.
