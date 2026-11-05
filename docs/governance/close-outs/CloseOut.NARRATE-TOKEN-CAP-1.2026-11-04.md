---
dispatch: NARRATE-TOKEN-CAP-1
date: 2026-11-04
runtime: not measured (no time log)
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: NARRATE-TOKEN-CAP-1

## Dispatch Brief

**Goal:** Stop Narrate's chunk planner from packing digit-dense passages (chess notation, numbered lists) into chunks the voice model cannot take, by estimating a digit at its spoken cost.
**Result:** `estimateTokens` in `src/reader/modes/narrate/engine/chunkPlan.ts` now counts each digit at `DIGIT_TOKEN_WEIGHT = 13` and every other character at 1.15; two tests in `narrate.chunkPlan.test.ts` pin it (digit-dense text splits; text with no digit is estimated exactly as before).
**Learned:** No new lesson — covered by LL-162, LL-160, LL-142 and the standing rules the spec listed.
**Recommend:** Close it; the combined owner-library sweep should be re-run at the next Narrate chunk-planner change, not for this close.
**Bottom line:** Digit-dense passages now split, and the owner-library sweep went from 18 class E chunks to 0 on the item's branch.

## Findings

Source: the group 3 evidence check on origin/main 14ce3d24 and the memo. No time log was kept (the spec fence expects one; custody gap, documentation only), so there is no Time section.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---|---|---|---|---|---|---|
| D1 | Positive control | digit test alone on base | red | `5c37e0da`; `-t digit` exit 1, `expected 1 to be >= 2` (memo) | Pass | n/a (new) | Pass |
| D2 | Two tests | exist and pass | present | `narrate.chunkPlan.test.ts:42-57` on origin/main; memo: 10 of 10 pass | Pass | n/a | Pass |
| D3 | Owner library has no class E | sweep under Electron | 0 class E | memo: fix 3 fail-closed of 11,258, 0 class E; base 21 of 11,030, 18 class E | Pass (memo evidence, not re-run) | 18 class E to 0 | Pass |
| D4 | Gate corpus, D2 route, control | `--gate`, `--from 2970 --to 6700`, `--control` | 0, 0, red control | 0/3,685 exit 0; 0/173 exit 0; 127/3,685 exit 1 (memo) | Pass (memo evidence, not re-run) | n/a | Pass |
| D5 | `DIGIT_TOKEN_WEIGHT` in exactly two lines | `git grep` | 2 lines | `chunkPlan.ts:24` and `:31` on origin/main | Pass | n/a | Pass |
| D6 | Suite, typecheck, build | counts | green | memo: 2,432 passed, 1 skipped, typecheck 0, build 0 | Pass | n/a | Pass |
| D7 | Fence | changed files | chunkPlan.ts, its test, memo | exactly those | Pass | n/a | Pass |

## Interpretation

No row failed. Population: gate (1) run 6, partial; D6 cold, D3 2.00x and Q3 s2 pending a quiet rerun. Run 6 on 14ce3d24 had 3,048 passed, 0 failed, typecheck 0 and 0 crashes. No row of this item depends on those unjudged rows.

Memo evidence, not re-run: the owner-library sweep (D3, D4). It needs the owner's library copy under Electron. The combined sweep (this item plus YEARS, INITIALS and RECONCILE-RESIDUAL) was last run at `c93f7c09`, not at 14ce3d24: `3 of 11318; 0 class E, 3 ruled residual, 0 other`. Later chunkPlan edits are not covered by a newer sweep; this is not a failure of this item's rows. On main the weight is still applied (`estimateTokens` uses 13 for digits).

## Proposed Dispositions

- **Accept:** close the item. Authority: Blurby.Brain1's run 6 close-out ruling (2026-11-03) plus the item's own evidence; owner approval 2026-11-04 of the close-out plan.
- **Log:** the missing time log and the un-rerun combined sweep at 14ce3d24.

## Mid-Dispatch Decisions

None

## Lessons

- **New:** No new lesson — LL-162 (the whole owner corpus is the gate), LL-160 (checkers run under the app's Electron), LL-142 (the weight is the measured cost) and standing rules 36, 43, 44, 50 covered it.
- **Applied:** LL-162 — held: the sweep covered all 8 owner books (11,258 chunks), not a sample.
- **Applied:** LL-160 — held: every sweep ran under Electron 42 through `app-node.ps1`.
- **Applied:** LL-142 — held: the weight 13 sits at the top of the measured range; no class E remains.
- **Applied:** standing rules 36, 43, 44, 50 — held: re-grep on `dcafc800`; red commit `5c37e0da` alone; no pinned test changed.

## Files Created

- **Removed (temporary):** none
- **Committed:** memo `Memo.NARRATE-TOKEN-CAP-1.GovernanceStaging.2026-10-23.md` earlier; this report is committed by Blurby.Roadmap
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** not run per item
- **Footprint:** none

## Governance Updates

None needed. The memo proposes no governance edits.

## Roadmap & Queue Movement

- **Retired:** NARRATE-TOKEN-CAP-1 — retired from In Flight; no sequence change.

## Next Work

No change from this close-out.

## Gates

- Integrated identity: branch tip `814ddc78` is an ancestor of origin/main; merged by `c5bb507f` (RC-INTEGRATION-WINDOW; reached main through the stacked merge `459a2ccb`); tested tree 14ce3d24.
- RC window package record: x64 pair on RodneySr at `70d64237`, Brain1's confirmation, arm64 launch on Rodney from `c5bb507f` (`C:\Projects\Blurby-artifacts\rc-merge-20261103\`). Raw run 6 record is on RodneySr (`C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` there).
- No owner check for this item.

## Git Hand-Off

- [ ] Committed by Blurby.Roadmap.
