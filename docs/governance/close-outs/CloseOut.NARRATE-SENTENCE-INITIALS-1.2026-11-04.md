---
dispatch: NARRATE-SENTENCE-INITIALS-1
date: 2026-11-04
runtime: incomplete time log (rows 1 to 3 not measured); no Actual stated
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: NARRATE-SENTENCE-INITIALS-1

## Dispatch Brief

**Goal:** Stop Narrate's chunk planner (`isSentenceEnd` in `chunkPlan.ts`) from treating a name initial such as "M." in "M. Annius Verus" as the end of a sentence.
**Result:** An uppercase single letter other than "I." (`NAME_INITIAL`) no longer ends a sentence when the next word is capitalised, is not a common opener (`SENTENCE_OPENER`) and does not complete a dotted abbreviation such as "B. C."; seven tests in `narrate.chunkPlan.test.ts` pin the cases, and the owner-library sweep was no worse than base.
**Learned:** LL-185 — the chunk-bound diff with a "every diverged region holds a flipped verdict" check (it found the "B. C." regression the fail-closed counts could not show).
**Recommend:** Close it; the Roman paragraph numerals now open their paragraph, an owner-visible side effect that needs no document edit.
**Bottom line:** Initials like "M. Annius" and "J. R. R. Tolkien" now stay inside their sentence, with `I.` and `x.` unchanged.

## Time

The time log `Timing.NARRATE-SENTENCE-INITIALS-1.jsonl` is incomplete: rows 1, 2 and 3 were not measured. No Actual is given.

| Row | Kind | State |
|---|---|---|
| 1 | positive-control | done, not measured |
| 2 | engine-fix | done, not measured |
| 3 | verification | done, not measured |
| 4 | verification | done |
| 5 | merge-and-verify | done |

## Findings

Source: the group 3 evidence check on origin/main 14ce3d24 and the memo. "Memo evidence" means not re-run.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---|---|---|---|---|---|---|
| D1 | Red first | tests alone on base | red, controls pass | `295b3436`; "M. Annius" gives 3 (expected 0), "J. R. R. Tolkien" fails; `I.` and `x.` controls pass (memo) | Pass (memo evidence, not re-run) | n/a (new) | Pass |
| D1/D2 | Cases: initials, era, opener, numeral, controls | tests exist | present | `narrate.chunkPlan.test.ts` :89, :92, :97, :99, :102, :109, :115 on origin/main | Pass | n/a | Pass |
| Code | The rule | grep on origin/main | rule present | `chunkPlan.ts:52` `NAME_INITIAL`, `:54` `SENTENCE_OPENER`, `:71` the rule | Pass | n/a | Pass |
| D3 | Owner sweep no worse than base; bounds diff | sweep under Electron | no worse | fix 3 of 11,318 (0 class E, 3 ruled residual, 0 other); base 3 of 11,258, same classes; 158 diverged regions, 0 without a flipped verdict (memo) | Pass (memo evidence, not re-run) | 11,258 to 11,318 chunks | Pass |
| D4 | Suite, typecheck, build | counts | green | memo: 2,447 passed, 1 skipped, typecheck 0, build 0 on `95ffc0cc` | Pass | n/a | Pass |
| D5 | Fence | changed files | chunkPlan.ts, test, memo, time log | exactly those | Pass | n/a | Pass |

## Interpretation

No row failed. Population: gate (1) run 6, partial; D6 cold, D3 2.00x and Q3 s2 pending a quiet rerun. Run 6 on 14ce3d24 had 3,048 passed, 0 failed, typecheck 0 and 0 crashes. No row of this item depends on those unjudged rows.

Memo evidence, not re-run: the owner-library sweep and bounds diff (D3). The sweep needs the owner's library under Electron and was last run at `c93f7c09`, not 14ce3d24. The Roman-numeral class (47 of 65 flips in *Meditations*) means a resume inside a numbered paragraph now starts at its numeral; Blurby.Roadmap named this an expected class on 2026-10-23. The item interacts with NARRATE-SENTENCE-RESUME-1 (rewind target) and still holds on main.

## Proposed Dispositions

- **Accept:** close the item. Authority: Blurby.Brain1's run 6 close-out ruling (2026-11-03) plus the item's own evidence; owner approval 2026-11-04 of the close-out plan.

## Mid-Dispatch Decisions

- 2026-10-23, tier 1, accepted by Blurby.Roadmap (recorded in the memo): the spec's literal rule ("before any capitalised word") broke two pinned tests whose expected behaviour is correct English ("in Section B. The next", "B. C. He"), so an opener exclusion (`SENTENCE_OPENER`) was added.
- 2026-10-23, same acceptance: the bounds diff showed the literal rule also joined "250 B. C. Cyprus has been"; the spec requires the dotted case to stay unchanged, so a red test was added first, then a dotted-abbreviation guard.

## Lessons

- **New:** LL-185 — chunk-bound diff with a "diverged region must hold a flipped verdict" check.
- **Applied:** standing rule 43 — held: red tests first, with controls, including a red test for the regression the bound diff found (era test red on `68916c45`).
- **Applied:** LL-160 — held: the sweep and bounds diff ran under the app's Electron.
- **Applied:** LL-142 — held: the rule was classified from measured flips, not assumed.
- **Applied:** LL-162 — held: the whole 8-book owner corpus was swept.

## Files Created

- **Removed (temporary):** none
- **Committed:** memo `Memo.NARRATE-SENTENCE-INITIALS-1.GovernanceStaging.2026-10-23.md` and `Timing.NARRATE-SENTENCE-INITIALS-1.jsonl` earlier; this report is committed by Blurby.Roadmap
- **Ignored:** none
- **Left for a decision:** `C:\Projects\Blurby-artifacts\narrate-sentence-initials-1\changed-bounds-snippets.txt` stays uncommitted (owner-book text)
- **Guard:** not run per item
- **Footprint:** none

## Governance Updates

None beyond the memo and time log already on main. LL-185 is appended to the lessons role.

## Roadmap & Queue Movement

- **Retired:** NARRATE-SENTENCE-INITIALS-1 — retired from In Flight; no sequence change.

## Next Work

No change from this close-out.

## Gates

- Integrated identity: branch tip `c93f7c09` is an ancestor of origin/main (stacked on RESUME and TOKEN-CAP); merged by `c5bb507f` (RC-INTEGRATION-WINDOW; stacked merge `459a2ccb`); tested tree 14ce3d24.
- RC window package record: x64 pair on RodneySr at `70d64237`, Brain1's confirmation, arm64 launch on Rodney from `c5bb507f` (`C:\Projects\Blurby-artifacts\rc-merge-20261103\`). Raw run 6 record is on RodneySr (`C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` there).
- No owner check for this item.

## Git Hand-Off

- [ ] Committed by Blurby.Roadmap.
