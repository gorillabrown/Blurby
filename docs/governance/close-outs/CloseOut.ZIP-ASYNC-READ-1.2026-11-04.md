---
dispatch: ZIP-ASYNC-READ-1
date: 2026-11-04
runtime: 2m (Estimate 7m; complete)
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: ZIP-ASYNC-READ-1

## Dispatch Brief

**Goal:** Stop `openZip` in `main/zip-read.js` from reading an EPUB synchronously (adm-zip's path constructor uses `readFileSync`), as the standing rule requires async main-process file I/O.
**Result:** `openZip` now checks the size by `stat`, reads with `fsPromises.readFile`, re-checks the cap on the bytes actually read, maps a missing path to the same "ADM-ZIP: Invalid filename" error as before, and hands the buffer to adm-zip. `tests/zipAsyncRead.test.js` pins three cases.
**Learned:** No new lesson — standing rules 36, 43, 47, 48, 50 and 51 and LL-138, LL-156, LL-158 and LL-164 covered it.
**Recommend:** Nothing further is owed by this item. The local `EB/zip-async-read-1` ref is ahead of the item's tip (4e821a04) with preserved timing and perf files; it is not part of the item and needs no action here.
**Bottom line:** EPUB opens no longer block on a synchronous read, and this is on `main`.

## Time

| Row | Task | Kind | Predicted | Actual | Waited | Added | Flag |
|---|---|---|---|---|---|---|---|
| 1 | Re-grep; positive control: (za1) and (za2) red by assertion on the base | positive-control | 3 min (median of 20 runs) | 0.5 min | — | — | — |
| 2 | `openZip` reads with `fsPromises.readFile`, re-checks the cap on the bytes read, and keeps adm-zip's missing-path error | bug-fix | 2 min (median of 3 runs) | 0.3 min | — | — | — |
| 3 | Greps; full suite, typecheck and build; merged and pushed | merge-and-verify | 2 min (median of 14 runs) | 1.3 min | — | — | — |

Estimate 7m · Actual 2m (measured working time, sequential rows). No row is flagged.

## Findings

Rows are the item's Done-when list, checked read-only against origin/main 14ce3d24.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Re-grep on the base | memo | one `new AdmZip(` site, five callers | recorded in the memo | Pass | — | Pass |
| 2 | Positive control, (za1) and (za2) red by assertion | vitest on commit 6ad30e42 | 2 failed, 1 passed | 2 failed, 1 passed (memo) | Pass | — | Pass |
| 3 | Tests (za1) to (za3); (o), (p), (r), (s) unchanged | test files | present | `tests/zipAsyncRead.test.js` :31, :46, :60; zipEntryCap tests exist | Pass | — | Pass |
| 4a | One `new AdmZip(` line | `git grep -n "new AdmZip(" -- main` | `zip-read.js: return new AdmZip(buffer);` | `main/zip-read.js:26: return new AdmZip(buffer);` | Pass | — | Pass |
| 4b | No `readFileSync` in zip-read.js | `git grep -n` | nothing | exit 1, empty | Pass | — | Pass |
| 5 | npm test, typecheck, build | gate | all exit 0 | run 6 3,048 passed, typecheck 0; memo: 2,439 passed on 16064a99, typecheck 0, build 0 | Pass | — | Pass |
| 6 | Live check | none | none by design | not applicable | Pass | — | Pass |
| 7 | Fence against the stacked base | `git diff --name-status 29b3e7e5 4e821a04` | M zip-read.js, A zipAsyncRead test | exactly those two plus the memo and time log | Pass | — | Pass |

Population: gate (1) run 6, partial; D6 cold, D3 2.00x and Q3 s2 pending a quiet rerun (tree 14ce3d24: 3,048 passed, 0 failed, typecheck 0, 0 crashes). No row of this item depends on those unjudged rows.

## Interpretation

No non-pass row. Read on origin/main, `main/zip-read.js:12-27` matches the spec's fix steps (stat cap, read, ENOENT and ENOTDIR to the adm-zip message, post-read cap, buffer constructor), and `addLocalFile` and `addLocalFolder` are unused in `main`. Memo evidence, not re-run here: the red-first result and the owner-machine counts. The item stacks on ZIP-READ-FOLLOWUPS-1 and both merged together at 53a89e55.

## Proposed Dispositions

None.

## Mid-Dispatch Decisions

None.

## Lessons

- **New:** No new lesson — followed standing rules 36, 43, 47, 48, 50 and 51 and LL-138, LL-156, LL-158 and LL-164.
- **Applied:** Standing rule 43 (LL-138) — held: (za1) and (za2) committed alone in 6ad30e42, red by assertion on the base.
- **Applied:** Standing rule 36 — held: every cited line re-grepped on the base before editing.
- **Applied:** LL-158 — held: the cap is checked again on the bytes read (`main/zip-read.js`).
- **Applied:** Standing rule 50 (LL-156) — held: the DEPS-AUDIT-1 adm-zip reachability note was re-read and is unchanged by a buffer-backed constructor.
- **Applied:** Standing rules 47 and 48 — held: full suite, typecheck and build on the owner's machine, 2,439 passed on 16064a99.
- **Applied:** LL-164 and standing rule 51 — held: no lesson-status line was appended.

## Files Created

- **Removed (temporary):** none
- **Committed:** the memo `docs/governance/close-outs/Memo.ZIP-ASYNC-READ-1.GovernanceStaging.2026-10-23.md` and the time log `docs/governance/close-outs/Timing.ZIP-ASYNC-READ-1.jsonl` (committed earlier); this report is committed with the close-out.
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** not run per item
- **Footprint:** none

## Governance Updates

None. The memo states "None to governance documents".

## Roadmap & Queue Movement

- **Retired:** ZIP-ASYNC-READ-1 — retired from In Flight. No sequence change: it held no Seq slot at the head.

## Next Work

Unchanged. The next dispatch comes from the queue through `/next-dispatch`.

## Gates

- **Integrated identity:** branch tip 4e821a04 is an ancestor of origin/main; merged by c5bb507f (RC-INTEGRATION-WINDOW, integration commit 53a89e55 together with ZIP-READ-FOLLOWUPS-1); tested tree 14ce3d24.
- **Package:** the RC window's package record covers this item: x64 pair on RodneySr at 70d64237, Brain1's confirmation, and an arm64 launch on Rodney from c5bb507f (`C:\Projects\Blurby-artifacts\rc-merge-20261103\`). The raw run 6 record is on RodneySr (`C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` there).
- **Authority to close:** Blurby.Brain1's run 6 close-out ruling (2026-11-03) plus this item's own evidence; owner approval of the close-out plan on 2026-11-04.

## Git Hand-Off

Committed by Blurby.Roadmap.
