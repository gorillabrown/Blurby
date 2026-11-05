---
dispatch: LIBRARY-WRITE-RACE-1
date: 2026-11-04
runtime: not measured (no time log)
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: LIBRARY-WRITE-RACE-1

## Dispatch Brief

**Goal:** Stop five library actions (delete, add to queue, remove from queue, reorder queue, apply metadata) and the three book conversions from replacing a live library record with a stale copy.
**Result:** The five handlers now write to the live record, and the new `main/library-write.js` (`writeConversionResult`) carries the lazy conversion, the URL import and the extension import. A converted file is unlinked when its record is gone or deleted. Five identity tests and four helper tests cover it.
**Learned:** No new lesson — standing rules 36, 43, 44 and 50 and LL-142 covered it.
**Recommend:** Nothing further is owed by this item. The memo's review notes (a stale `newDoc` in the URL import, the unconditional unlink, the untested extension-import failure branch) stay logged; LIBRARY-WRITE-RACE-2 and its follow-on already stack on this module.
**Bottom line:** The five handlers and three conversions no longer overwrite a live record, and this is on `main`.

## Findings

Rows are the item's Done-when list, checked read-only against origin/main 14ce3d24 by `git grep`, `git show` and `git diff --name-status`.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Positive control, identity tests red alone | vitest on commit d83a8291 | red by assertion | `Tests 5 failed (5)`, `toBe` identity (memo) | Pass | — | Pass |
| 2 | Five handler identity tests | `tests/libraryWriteThrough.test.js` | 5 tests | 5 `it` for delete-doc, add-to-queue, remove-from-queue, reorder-queue, apply-metadata-updates | Pass | — | Pass |
| 3 | Helper tests | same file | live replaced, deleted, gone, unlink fails | all four present | Pass | — | Pass |
| 4a | No `setLibrary(x.map(` in the three files | `git grep` | exit 1 | exit 1 | Pass | — | Pass |
| 4b | `writeConversionResult(` per file | `git grep -c` | 1 each | `library.js:1`, `misc.js:1`, `ws-server.js:1` | Pass | — | Pass |
| 4c | No `\|\| doc;` in library.js | `git grep -F` | exit 1 | exit 1 | Pass | — | Pass |
| 5 | One `ctx.setLibrary(` in library.js | `git grep` | the rescan only | one line, `main/ipc/library.js:505` | Pass | — | Pass |
| 6 | Four-file vitest | vitest | exit 0 | the four files exist; run 6 0 failed | Pass | — | Pass |
| 7 | npm test, typecheck, build | gate | all exit 0 | run 6 3,048 passed, typecheck 0; memo: 2,451 passed on 0b38f14a, typecheck and build 0 | Pass | — | Pass |
| 8 | Fence | `git diff --name-status 4944def6 3b7aaa6f` | A library-write.js, M library.js, M misc.js, M ws-server.js, A test | exactly those five paths plus the memo | Pass | — | Pass |

Population: gate (1) run 6, partial; D6 cold, D3 2.00x and Q3 s2 pending a quiet rerun (tree 14ce3d24: 3,048 passed, 0 failed, typecheck 0, 0 crashes). No row of this item depends on those unjudged rows.

## Interpretation

No non-pass row. Memo evidence, not re-run here: the red-first result (row 1), the owner-machine counts on 0b38f14a (row 7) and the independent review. Rows 2 to 6 and 8 were re-read on origin/main. Later work on the same files (LIBRARY-WRITE-RACE-2) supersedes no row of this item; the one `ctx.setLibrary(` line moved from :490 to :505.

## Proposed Dispositions

- **Log:** the memo's review notes (stale `newDoc` in the URL import, unconditional unlink on the gone path, untested extension-import failure branch). No register item exists for them.

## Mid-Dispatch Decisions

None.

## Lessons

- **New:** No new lesson — followed standing rules 36, 43, 44 and 50 and LL-142.
- **Applied:** Standing rule 36 — held: every cited site re-grepped on 4944def6 and matched by content.
- **Applied:** Standing rule 43 — held: the tests were committed alone in d83a8291 and failed 5 of 5 by identity.
- **Applied:** Standing rule 44 — held: Done-when 4 and 5 were dry-run on the base before the change.
- **Applied:** Standing rule 50 — held: SAVE-LIBRARY-MERGE-1's race table was read, and its index-window test (g) is unchanged and passing.
- **Applied:** LL-142 — held: the fresh-object claim was proven by grep and the suite; sync hashes are content-based (`main/sync-engine.js:56`).

## Files Created

- **Removed (temporary):** none
- **Committed:** the memo `docs/governance/close-outs/Memo.LIBRARY-WRITE-RACE-1.GovernanceStaging.2026-10-23.md` (committed earlier); no time log was kept; this report is committed with the close-out.
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** not run per item
- **Footprint:** none

## Governance Updates

None. The memo proposes no edit to any governance file.

## Roadmap & Queue Movement

- **Retired:** LIBRARY-WRITE-RACE-1 — retired from In Flight. No sequence change: it held no Seq slot at the head.

## Next Work

Unchanged. The next dispatch comes from the queue through `/next-dispatch`.

## Gates

- **Integrated identity:** branch tip 3b7aaa6f is an ancestor of origin/main; merged by c5bb507f (RC-INTEGRATION-WINDOW); tested tree 14ce3d24.
- **Package:** the RC window's package record covers this item: x64 pair on RodneySr at 70d64237, Brain1's confirmation, and an arm64 launch on Rodney from c5bb507f (`C:\Projects\Blurby-artifacts\rc-merge-20261103\`). The raw run 6 record is on RodneySr (`C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` there).
- **Authority to close:** Blurby.Brain1's run 6 close-out ruling (2026-11-03) plus this item's own evidence; owner approval of the close-out plan on 2026-11-04.

## Git Hand-Off

Committed by Blurby.Roadmap.
