# READER-PERSISTENT-ANCHOR-STEP3.1 Close-Out

**Date:** 2026-05-22
**Branch:** `hotfix/reader-persistent-anchor`
**Status:** Code-complete; manual QA pending before merge.

## Summary

**Goal:** Repair the three Step 3 manual-QA blockers: Page same-section Jump Back, Focus blank overlay, and Focus paused browse-away Jump Back.

**Result:** Commit `e6ebb07` landed four targeted source fixes for S1, S4, S5, and S18; S9 was investigated and intentionally deferred as high-risk.

**Learned:** Foliate's word-position index can hold stale CSS-column rect snapshots after page turns, so same-section visibility checks need live motion or invalidation.

**Recommend:** Treat Step 3.1 as code-complete but QA-pending; rerun the full 18-scenario matrix before merge.

**Bottom line:** The repair is exactly where it should be technically, but the merge gate remains closed until manual QA proves it.

**By the numbers:** One commit, four fixes, 2,794 tests passing, `tsc` clean, manual QA pending.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta | Severity |
|---|---|---|---|---|---|---|---|
| 1 | S1 Page same-section Jump Back | Same-section anchor recovery | Page moves to anchor | `forceMotion` bypass added to highlight pipeline | Code pass, QA pending | Improved | Critical |
| 2 | S4 Focus blank overlay | Focus active render | RSVP word appears | `onWordAdvance` now uses global words | Code pass, QA pending | Improved | Critical |
| 3 | S5 Focus paused browse-away | Focus return affordance | Jump Back appears after browse-away | Focus excluded from browse-away clear | Code pass, QA pending | Improved | Critical |
| 4 | S18 Page reopen mismatch | Reopen restore | Page opens at persistent word | Cheap separate-root fix landed | Code pass, QA pending | Improved | Medium |
| 5 | S9 Flow lazy follow | Flow centering | Stable centered follow | Deferred as high-risk scroll-system coordination | Deferred | Unchanged | Marginal |
| 6 | Automated verification | Tests/typecheck/diff | Green | 2,794 tests pass, `tsc` clean, diff clean | Pass | Maintained | Pass |
| 7 | Manual QA gate | SRL-053, SRL-057, SRL-058 | 18-scenario matrix passes | Not rerun yet | Miss | Pending | Critical |
| 8 | Merge readiness | Branch governance | Safe to merge | Not ready until manual QA passes | Miss | Unchanged | Critical |

## Implementation Evidence

Step 3.1 added this branch commit:

| Commit | Description |
|---|---|
| `e6ebb07` | Repair Page jump-back, Focus blank/browse-away, and reopen position |

Reported verification:

| Check | Result |
|---|---|
| Full test suite | 2,794 passing |
| TypeScript | `tsc --noEmit` clean |
| Diff hygiene | `git diff --check` clean |
| Commit shape | One focused repair commit after Step 3 |

## Interpretation

The Step 3.1 implementation targeted the correct failures. S1's root cause is especially useful: `FoliatePageView` stores word rects from `getBoundingClientRect()` at index-build time, and those snapshots can go stale in CSS-column paginated mode after page turns. Any same-section movement path that trusts `resolveWordState().visible` can falsely decide "already visible" and skip motion. The `forceMotion` path is an appropriate narrow bypass for Jump Back.

Focus needed its own fix path, which reinforces SRL-058. Flow and Narrate had become healthy enough that they could hide the fact that Focus' active renderer and paused browse-away affordance were still disconnected.

S9 was correctly deferred. Flow lazy-follow is not another simple anchor bug; it is a coordination problem between `FlowScrollEngine` zone descent and Foliate iframe scrolling. Folding that into Step 3.1 would risk breaking the recently repaired Flow/Narrate state.

## Dispositions

| Item | Disposition | Rationale |
|---|---|---|
| Commit `e6ebb07` | Accept as code-complete | It directly targets S1, S4, S5, and S18. |
| Automated verification | Accept | Full suite, typecheck, and diff hygiene are clean per closeout. |
| Manual QA gate | Fix Now / pending | Must rerun before merge or roadmap advancement. |
| Merge to `main` | Defer | SRL-053 requires live QA proof. |
| `READER-ISO-1A` | Defer | Adapter extraction waits until Step 3.1 QA passes. |
| S9 Flow lazy follow | Defer | Separate Flow-Foliate scroll sprint; high-risk to include now. |
| Stale CSS-column word rects | Log | This is a reusable Foliate navigation trap. |
| Existing local dirt | Exclude | `.idea`, perf baseline, and prior governance docs should be bucketed separately. |

## Follow-Up

1. Rerun the full 18-scenario manual QA matrix from the persistent-anchor manual QA template.
2. Pay special attention to S1, S4, S5, S9, and S18.
3. If QA passes, update the closeout and roadmap to complete, then merge/push according to branch policy and advance to `READER-ISO-1A`.
4. If QA finds residual failures, keep the branch open and repair only those failure clusters.
5. Track S9 Flow lazy-follow as a future Flow-Foliate scroll coordination sprint if it remains noticeable after adapter isolation.
