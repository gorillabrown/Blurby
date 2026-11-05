---
dispatch: FLOW-PARA-KEYS-1
date: 2026-11-04
runtime: 13m
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: FLOW-PARA-KEYS-1

## Dispatch Brief

**Goal:** Make Flow's paragraph keys (Shift+Right and Shift+Left in flow reading, ScrollReaderView's Foliate surface) step to the next or previous paragraph start of an EPUB instead of jumping to the end of the book.
**Result:** Flow now takes paragraph starts from the whole-book word table through its own collector copy (`helpers/foliateParagraphStarts.ts`, `paragraphTarget` in `ModeRuntime.ts`); live, Shift+Right went 187 to 188 to 572 to 610 and back, where the base went 191 to 5290 and then 80492.
**Learned:** No new lesson — standing rule 43 (LL-138), LL-142, LL-152 and rule 52 (LL-146) already covered what this item met.
**Recommend:** Close it as built and merged; the lost bug entry needs a new number so BUG_REPORT records the paragraph-key bug and its resolution, and the gate (2) owner list should carry the Flow paragraph-key check.
**Bottom line:** Flow's paragraph keys land on real paragraph starts, proved red first and live on the packaged build, and the item is ready to retire.

## Time

Timing log: `docs/governance/close-outs/Timing.FLOW-PARA-KEYS-1.jsonl`. Estimate 19m, actual 13m (12.7 min), complete, nothing parked.

| # | Row | Kind | Added | Predicted | Actual | Waited | Flag |
|---|-----|------|-------|-----------|--------|--------|------|
| 1 | Load spec, reconcile repository, build plan | setup | no | 1m | 1.9m | 0 | none |
| 2 | Red test with full-book words plus fr2 XHTML collector; commit alone; record red | positive-control | no | 3m | 1.4m | 0 | none |
| 3 | Fix: paragraphTarget, Flow collector, FoliateView and surface per ruling A | renderer-fix | no | 2m | 0.0m | 0 | none |
| 4 | Targeted suites, npm test, typecheck and build | verify-gate | no | 0m | 4.4m | 0 | none |
| 5 | x64 --dir build from git archive and live Shift+arrow check on scratch profile | live-check | no | 10m | 3.9m | 0 | none |
| 6 | Bug entry, staging memo, push, report to Blurby.Roadmap | merge-and-docs | no | 3m | 1.1m | 0 | none |

## Findings

Evidence population: the committed memo `Memo.FLOW-PARA-KEYS-1.GovernanceStaging.2026-10-23.md` plus a read-only check of origin/main 14ce3d24. Suite population: gate (1) run 6 on 14ce3d24, 3,048 passed, 0 failed, typecheck 0, 0 crashes. Cited exactly as gate (1) run 6, partial; D6 cold, D3 2.00x and Q3 s2 pending a quiet rerun. No row of this item depends on those unjudged rows.

Memo evidence, not re-run here: the live Shift+arrow checks ran on x64 `--dir` builds of `5fb00ab5` and `f78a3b28` on scratch profiles (artifacts under `C:\Projects\Blurby-artifacts\keys-fix\`). Row 3 rests on the committed memo.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Red first, full-book words | Test red by assertion, committed alone | Red on base | `16d2114f`: Shift+Right from 105 gave 199, not 112; test file present at origin/main | Pass | n/a | Pass |
| 2 | Fix per ruling A and amendment | Flow collector copy, no sibling import | Present, no import | `ModeRuntime.ts:1019`, `surface.ts:23,53`, `FoliateView.tsx:251,1224`, `foliateParagraphStarts.ts:8`; sibling-import grep empty | Pass | n/a | Pass |
| 3 | Live Shift+Right three times, paused and playing | Word index per press | 187, 188, 572, 610; never 5290, 80492 or 0 | Met; playing 191 to 572 and kept playing (572 to 579) at `100b41dd`; base 191 to 5290 | Pass (memo) | n/a | Pass |
| 4 | Suite, typecheck, build | Counts | All green | Memo 2,511 passed / 1 skipped / 0 failed, typecheck 0, build 0, x64 package 0 at `100b41dd`; gate (1) run 6 above | Pass | n/a | Pass |
| 5 | Fence | Files changed vs FLOW-KEYS-FIX-1 tip | Flow files and BUG_REPORT only | FoliateView, ModeRuntime, new foliateParagraphStarts.ts, surface.ts, new flowParagraphStarts.test.ts, BUG_REPORT | Pass | n/a | Pass |
| 6 | Merge order | FOCUS-KEYS-FIX-1, FLOW-KEYS-FIX-1, then this | Ancestors in order | All three tips are ancestors; integrated in one merge `fa760dc3` | Pass | n/a | Pass |
| 7 | Bug entry | Entry exists in BUG_REPORT | Present | Filed as BUG-217, which origin/main uses for a different bug; the entry was lost in the merge | Flag | n/a | Discovery |

## Interpretation

Row 7 is a bookkeeping loss, not a product fault. The keep-main merge dropped Flow's entry because BUG-217 was taken on main by the first-launch backup-failure bug. This close-out restores the entry as BUG-240, resolved.

## Proposed Dispositions

- Row 7: **Fix Now** at close-out — file the bug under a new number with its resolution and fix the memo and ROADMAP references.
- All other rows: **Accept**.

## Mid-Dispatch Decisions

None.

## Lessons

- **New:** No new lesson — standing rule 43 (LL-138), LL-142, LL-152 and rule 52 (LL-146) covered it; the memo adds none.
- **Applied:** Standing rule 43 / LL-138 — held: the test was committed alone and failed by assertion with controls (`16d2114f`).
- **Applied:** LL-142 — held: the playback stop was measured live and A/B'd on the base build `60b86aff` before it was attributed.
- **Applied:** LL-152 — held: same build recipe, book, start word and probe as Focus's `568acc60` run.
- **Applied:** Standing rule 52 / LL-146 — held: the new test is in `tests/readerModes/`, and the probe's evidence copy is `.txt`.

## Files Created

- **Removed (temporary):** none
- **Committed:** memo and time log committed earlier; this report committed by Blurby.Roadmap
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** not run per item
- **Footprint:** none

## Governance Updates

From the evidence check and the memo's fold-ins:
- BUG entry: restored as BUG-240 with its resolution line (the number BUG-217 belongs to main's first-launch backup-failure bug).
- "Finding for Blurby.Roadmap" (playback stops on any nav key): resolved by the FLOW-KEYS-FIX-1 amendment `1d2ee3a4`; nothing to fold.
- "Merge-train note" (BAND-ALIGN-1 also edits Flow's FoliateView): satisfied, merged by text.
- Gate (2) owner list: add the Flow paragraph-key check (the memo asks Blurby.Roadmap to).

## Roadmap & Queue Movement

- **Retired:** FLOW-PARA-KEYS-1 — retired from In Flight; no sequence change.
- **Elevated:** none.

## Next Work

READER-ARROW-GUARD-1 (Narrate and Page arrow keys, BUG-218) is a separate item and is not changed by this close-out.

## Gates

- Integrated identity: branch tip `100b41dd` is an ancestor of origin/main; merged by c5bb507f (RC-INTEGRATION-WINDOW); tested tree 14ce3d24. The RC window's package record: x64 pair on RodneySr at 70d64237, Brain1's confirmation, arm64 launch on Rodney from c5bb507f (`C:\Projects\Blurby-artifacts\rc-merge-20261103\`). The raw run 6 record is on RodneySr (`C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` there).
- Authority to close: Blurby.Brain1's run 6 close-out ruling (2026-11-03) plus the item's own evidence; owner approval 2026-11-04 of the close-out plan.

## Git Hand-Off

- [x] Committed by Blurby.Roadmap.
