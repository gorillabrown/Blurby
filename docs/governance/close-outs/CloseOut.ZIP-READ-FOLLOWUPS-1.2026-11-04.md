---
dispatch: ZIP-READ-FOLLOWUPS-1
date: 2026-11-04
runtime: 14m (Estimate 8m; complete; row 3 flagged)
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: ZIP-READ-FOLLOWUPS-1

## Dispatch Brief

**Goal:** Give every EPUB open one size-checked door (`openZip` in `main/zip-read.js`) so an oversized archive is refused before it is read, and add the two missing cap tests.
**Result:** All five callers (`epub-converter.js`, `epub-word-extractor.js`, three sites in `file-parsers.js`) open through `openZip`, which refuses a file above `ZIP_FILE_MAX_BYTES`. By Blurby.Brain's 2026-10-23 ruling that cap is 2 GiB - 1, not the spec's 512 MiB, because no parser reads every entry. Tests (o), (p), (q), (r), (s) and (n) cover the archive cap, the operation cap, the missing-path message and a STORED entry with a lying header.
**Learned:** LL-182 and LL-183 — a size-based no-regression argument must use what the code reads, and an error-text test must keep its input out of the text it matches.
**Recommend:** Apply the memo's three ROADMAP.md fold-ins when the archived spec is moved, so the 512 MiB text stops disagreeing with the code. Nothing else is owed by this item.
**Bottom line:** Every EPUB open now goes through one size check, and this is on `main`.

## Time

| Row | Task | Kind | Predicted | Actual | Waited | Added | Flag |
|---|---|---|---|---|---|---|---|
| 1 | Positive control shows every EPUB open reading the whole file on the base | positive-control | 3 min (median of 19 runs) | 0.5 min | — | — | — |
| 2 | One size-checked open for all five callers, plus the two missing cap tests | bug-fix | 3 min (median of 61 runs) | 2.4 min | — | — | — |
| 3 | Suite, typecheck and build pass; merged and pushed | merge-and-verify | 2 min (median of 14 runs) | 9 min | — | — | possible unseen wait |
| +4 | Zeus: load spec, reconcile, re-grep five open sites, plan | setup | 0 min (median of 8 runs) | 0 min | — | yes | — |
| +5 | Review (spec compliance + quality, parallel) | review | 3 min (median of 8 runs) | 0 min | — | yes | — |
| +6 | Base suite before the edit (red-base attribution) | baseline-suite | 1 min (median of 3 runs) | 2.2 min | — | yes | — |

Estimate 8m · Actual 14m (measured working time, sequential rows)

- Row 3 is flagged "possible unseen wait" and is not confirmed. Its 9 minutes include the merge held for the Stage 8 freeze (state blocked at the time of the log), so it is not clean working time. It stays out of the pricing history unless the owner confirms it.

## Findings

Rows are the item's Done-when list, checked read-only against origin/main 14ce3d24.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Positive control, archive-cap tests red on base | vitest on commit b046684c | red by assertion | (o) failed at `extractWords`, (p) passed (memo; the base is gone) | Pass | — | Pass |
| 2 | One door | `git grep -E 'new (AdmZip\|Zip)\([A-Za-z]' -- main` | one line in zip-read.js | `main/zip-read.js:26: return new AdmZip(buffer);` (the `buffer` form comes from ZIP-ASYNC-READ-1, 16064a99) | Pass | — | Pass |
| 3 | Archive size cap tests (o), (p), (r), (s) | `tests/zipEntryCap.test.js` | present, five callers covered | describe at :146; (o) :152, (r) :175, (s) :195, (p) :205 | Pass | — | Pass |
| 4 | Operation cap at parser level (q) | `tests/zipEntryCap.test.js` | present | (q) at :132; recipe deviation (2048-byte OPF pad instead of the cover) recorded in the memo, since `extractWords` never reads the cover | Pass | — | Pass |
| 5 | STORED lying header (n) and mutation control | `tests/zipRead.test.js` | present | (n) at :107; mutation control in the memo | Pass | — | Pass |
| 6 | `vitest run zipRead zipEntryCap` | vitest | exit 0 | files exist; memo 21 of 21 | Pass | — | Pass |
| 7 | npm test, typecheck, build | gate | all exit 0 | run 6 3,048 passed, typecheck 0; memo: 2,436 passed on 64a66fd9, typecheck 0, build 0 | Pass | — | Pass |
| 8 | Fence | `git diff --name-status dcafc800 29b3e7e5` | the seven specified files | exactly those seven plus the memo and time log | Pass | — | Pass |
| x | No-regression controls (f2), (f3) | `tests/zipEntryCap.test.js` | present | :99 and :112 | Pass | — | Pass |

Population: gate (1) run 6, partial; D6 cold, D3 2.00x and Q3 s2 pending a quiet rerun (tree 14ce3d24: 3,048 passed, 0 failed, typecheck 0, 0 crashes). No row of this item depends on those unjudged rows.

## Interpretation

No non-pass row. The cap value differs from the spec's text by an authorized ruling (Brain, tier 1, 2026-10-23); `main/constants.js:75` holds 2 GiB - 1. Memo evidence, not re-run here: the red-first result, the four mutation controls, the base suite's two load failures and the owner-machine counts. Row 2's line text was superseded by the stacked ZIP-ASYNC-READ-1, and still names one line.

## Proposed Dispositions

- **Fix Now (documentation):** the three ROADMAP.md fold-ins in the memo (cap reasoning and value, Done-when 4 recipe, Done-when 5 line reference), applied when the archived spec moves.

## Mid-Dispatch Decisions

- **2026-10-23, archive cap value (Blurby.Brain, tier 1).** `ZIP_FILE_MAX_BYTES = 2 GiB - 1`, not 512 MiB: no parser reads every entry, so a large archive of unread media imports today, and 2 GiB - 1 is where Node's whole-file read already fails. The 64 MiB entry cap and 512 MiB operation cap stay as the memory bounds. Brain also asked for follow-up ZIP-ASYNC-READ-1 (registered, since closed on its own report).

## Lessons

- **New:** LL-182 — a size-based no-regression argument must use what the code reads, not what the file contains. LL-183 — a test of error text must keep the input out of the text it matches. Both stated in the memo; appended to the lessons role by the close-out.
- **Applied:** Standing rule 43 (LL-138) — held: tests (o) and (p) committed alone in b046684c, red by assertion.
- **Applied:** Standing rule 44 (LL-143) — held: Done-when 2 re-grepped on the base, five sites found.
- **Applied:** LL-151 — held: four mutants (STORED size check, cap value, stat fallback, read order) each failed the new assertions.
- **Applied:** LL-142 — held: the no-regression claim was tested by reading the parsers, which found the cap-value problem.
- **Applied:** Standing rule 41 — held: the memo records no departure; the fence matched.
- **Applied:** Standing rule 46 — held: the run wrote nothing to the register.
- **Applied:** Standing rule 47 — held: full suite on the owner's machine, 2,436 passed on 64a66fd9.
- **Applied:** Standing rule 48 — held: typecheck and build exited 0.
- **Applied:** Standing rule 50 — held: the memo records no departure from it.

## Files Created

- **Removed (temporary):** none
- **Committed:** the memo `docs/governance/close-outs/Memo.ZIP-READ-FOLLOWUPS-1.GovernanceStaging.2026-10-23.md` and the time log `docs/governance/close-outs/Timing.ZIP-READ-FOLLOWUPS-1.jsonl` (committed earlier); this report is committed with the close-out.
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** not run per item
- **Footprint:** none

## Governance Updates

Proposed in the memo, not applied by this report:
- ROADMAP.md fold-in 1: replace the 512 MiB cap reasoning with the 2 GiB - 1 reasoning.
- ROADMAP.md fold-in 2: Done-when 4 recipe (4096-byte chapter, 2048-byte OPF pad).
- ROADMAP.md fold-in 3: Done-when 5 line reference (`createEntryReader`, method-0 branch).
- LESSONS_LEARNED.md: append LL-182 and LL-183.
- Register ZIP-ASYNC-READ-1: done.

## Roadmap & Queue Movement

- **Retired:** ZIP-READ-FOLLOWUPS-1 — retired from In Flight. No sequence change: it held no Seq slot at the head.

## Next Work

Unchanged. The next dispatch comes from the queue through `/next-dispatch`.

## Gates

- **Integrated identity:** branch tip 29b3e7e5 is an ancestor of origin/main; merged by c5bb507f (RC-INTEGRATION-WINDOW, integration commit 53a89e55); tested tree 14ce3d24.
- **Package:** the RC window's package record covers this item: x64 pair on RodneySr at 70d64237, Brain1's confirmation, and an arm64 launch on Rodney from c5bb507f (`C:\Projects\Blurby-artifacts\rc-merge-20261103\`). The raw run 6 record is on RodneySr (`C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` there).
- **Authority to close:** Blurby.Brain1's run 6 close-out ruling (2026-11-03) plus this item's own evidence; owner approval of the close-out plan on 2026-11-04.

## Git Hand-Off

Committed by Blurby.Roadmap.
