# READER-PERSISTENT-ANCHOR-STEP3-REPAIR Close-Out

**Date:** 2026-05-22
**Branch:** `hotfix/reader-persistent-anchor`
**Status:** Code-complete with manual QA rerun complete; merge blocked by Step 3.1 repair.

## Summary

**Goal:** Repair the manual-QA failures from Step 2 without extracting broken reader behavior into adapter isolation.

**Result:** Four local commits fixed major Narrate and Flow failures, then the Step 3 manual QA rerun improved the matrix from 7 pass / 1 partial / 10 fail to 13 pass / 2 partial / 3 fail.

**Learned:** Passing Flow and Narrate behavior does not prove Focus or Page parity; same-section Foliate movement and cross-section movement must be tested separately.

**Recommend:** Hold merge and run a narrow Step 3.1 repair for Focus blank overlay, Focus paused Jump Back, and Page same-section Jump Back.

**Bottom line:** Step 3 removed the scary Narrate and Flow blockers, but the gate remains red until S1, S4, and S5 pass or receive explicit user-approved dispositions.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta | Severity |
|---|---|---|---|---|---|---|---|
| 1 | Full manual QA matrix rerun | 18 scenarios | 18 pass or approved dispositions | 13 pass, 2 partial, 3 fail | Miss | Improved from 7/1/10 | Miss |
| 2 | Narrate exact hard-selected start | S12 | Start at selected word | Passed | Pass | Fixed | Pass |
| 3 | Narrate active hard-click retarget | S15 | Retarget playback to clicked word | Passed | Pass | Fixed | Pass |
| 4 | Flow play, single cursor, and browse-away return | S7, S8, S10 | Cursor visible, single, and recoverable | Passed | Pass | Fixed | Pass |
| 5 | Flow reading-window follow | S9 | Keep active word centered in stable window | Follows lazily; chunk-scrolls after drift | Partial | Improved | Marginal |
| 6 | Page Jump Back | S1 | Return to anchor in same-section and cross-section cases | Cross-section works; same-section no-op | Fail | Improved | Miss |
| 7 | Focus active overlay | S4 | Render first active word promptly | Overlay blank, progress frozen | Fail | Unchanged | Miss |
| 8 | Focus paused browse-away | S5 | Show Jump Back / Return to reading | No affordance appears | Fail | Unchanged | Miss |
| 9 | Startup reopen | S18 | Page opens at persistent last-read word | Page lags behind; Narrate resumes correctly | Partial | Slightly improved | Discovery |
| 10 | Inactive button ghost fill | S16 | No inactive mode appears selected | Passed | Pass | Fixed | Pass |
| 11 | Automated verification | Full suite and typecheck | Green after repair | Reported 2,794 tests pass and `tsc --noEmit` clean | Pass | Improved | Pass |
| 12 | Merge readiness | Branch governance | Safe to merge to `main` | Not ready until Step 3.1 passes manual QA | Fail | Unchanged | Critical |

## Implementation Evidence

Step 3 added these branch commits:

| Commit | Description | Files |
|---|---|---|
| `99548aa` | Repair jump-back visibility, navigation, and reopen position | `ReaderContainer.tsx`, `useFlowScrollSync.ts`, `FlowScrollEngine.ts`, `foliateAnchorNavigation.ts` |
| `f379070` | Preserve explicit selection anchor across mode transitions | `usePersistentReadingAnchor.ts` |
| `285b98a` | Fix Focus blank overlay and Flow window follow | `FoliatePageView.tsx`, `useReaderMode.ts` |
| `4e854a8` | Remove ghost fill from inactive mode buttons | `page-reader.css` |

Reported verification:

| Check | Result |
|---|---|
| Full test suite | 2,794 passing |
| TypeScript | `tsc --noEmit` clean |
| Diff hygiene | `git diff --check` clean |
| Commit shape | Four focused commits grouped by failure cluster |

Manual QA evidence:

| Artifact | Result |
|---|---|
| `docs/studies/reviews/Reader_Persistent_Anchor_Step3_Repair_Manual_QA_2026-05-22.md` | 13 pass, 2 partial, 3 fail |
| Step 2 baseline | 7 pass, 1 partial, 10 fail |
| Merge gate | Still blocked |

## Interpretation

This sprint should be treated as a successful partial repair, not a completed release gate. It eliminated the highest-risk Narrate failures: Narrate now starts at the hard-selected word, active hard-click retargeting works, and Narrate browse-away remains audio-owned. Flow also moved from detached and stale to visibly usable: it starts at the anchor, renders one underline cursor, and pauses with a working return affordance on manual browse-away.

The remaining failures are concentrated and actionable. Page Jump Back now works when recovery crosses a chapter or section boundary, but it dismisses without movement when the target anchor is in the same chapter. That points to a same-section Foliate movement path, not the global anchor model. Focus remains on a broken active-render path: the Focus overlay goes blank during playback and paused Focus browsing never surfaces the return affordance.

The reopen partial likely shares the Page same-section problem. Page can reopen behind the persistent position while Narrate resumes correctly, so Page still has a stale CFI or same-section navigation mismatch.

## Dispositions

| Item | Disposition | Rationale |
|---|---|---|
| Step 3 source fixes | Accept as partial repair | They materially fixed Narrate, Flow, retargeting, and button styling. |
| Automated verification | Accept | Reported full suite and typecheck are clean. |
| Step 3 manual QA report | Accept | It is the current source of truth for merge readiness. |
| Branch merge | Defer | S1, S4, and S5 remain blocking failures. |
| Roadmap/queue advancement to `READER-ISO-1A` | Defer | Adapter isolation must wait until Step 3.1 passes SRL-053. |
| S4 Focus blank overlay | Fix Now | Active Focus playback remains unusable. |
| S5 Focus paused Jump Back absent | Fix Now | Focus lacks the required persistent-anchor recovery affordance. |
| S1 Page same-section Jump Back | Fix Now | Common Page-mode return path still fails. |
| S9 Flow lazy follow | Investigate / Defer | Improved and usable, but not perfectly centered; fix only if cheap during Step 3.1. |
| S18 Page reopen lag | Investigate with S1 | Likely related to same-section movement or stale CFI precedence. |
| QA template docs | Track separately | Useful standard template; can be committed as docs, but not required for source repair completion. |
| `.idea/workspace.xml` and perf baseline dirt | Exclude | Local/unrelated artifacts. |

## Follow-Up

1. Run a focused Step 3.1 repair for S1, S4, and S5.
2. Re-run the full 18-scenario manual QA matrix after Step 3.1, with special attention to S1, S4, S5, S9, and S18.
3. If QA passes, update this sprint status to complete, merge/push according to branch policy, and advance the queue to `READER-ISO-1A`.
4. If QA still finds residual failures, keep the branch open and repair only those failure clusters; do not start adapter isolation.
5. Decide whether to commit the reusable manual QA template as a separate docs commit.
