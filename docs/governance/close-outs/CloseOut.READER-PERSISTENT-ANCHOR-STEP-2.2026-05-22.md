# READER-PERSISTENT-ANCHOR Step 2 Close-Out

**Date:** 2026-05-22
**Branch:** `hotfix/reader-persistent-anchor`
**Status:** Branch-complete; manual QA failed; repair required before merge.

## Summary

**Goal:** Repair persistent-anchor reader behavior across Page, Focus, Flow, and Narrate after Step 1 exposed jump-back, Flow follow, Focus start, and button-state regressions.

**Result:** The branch is automation-green with 13 commits over `main`, but screen-interaction manual QA failed with 7 pass, 1 partial, and 10 fail across the 18-scenario reader-mode matrix.

**Learned:** Automated tests can prove contracts while Foliate screen behavior still fails, so reader runtime changes need live screen QA gates before merge.

**Recommend:** Do not merge Step 2 as-is; dispatch a focused Step 3 repair sprint using Narrate's working follow and jump-back behavior as the reference path.

**Bottom line:** Step 2 preserved several important contracts, but the user-facing persistent-anchor experience is not ready to land.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta | Severity |
|---|---|---|---|---|---|---|---|
| 1 | Step 2 implementation landed on branch | Commits | Targeted hotfix commits | 5 Step 2 commits, 13 total branch commits | Pass | Improved | Pass |
| 2 | Automated verification | Tests/typecheck | Focused + full green | 2794 tests, 0 failures; `tsc --noEmit` clean; 183 focused pass | Pass | Improved | Pass |
| 3 | Manual QA overall | Screen QA | All critical scenarios pass before merge | 7 pass, 1 partial, 10 fail | Fail | Regressed release posture | Critical |
| 4 | Mode selection startup semantics | Mode select | Selecting modes does not auto-start playback | Page, Focus, Flow, and Narrate all stay paused on selection | Pass | Improved | Pass |
| 5 | Paused anchor handoff | Cross-mode paused state | Switching modes lands on hard-click anchor, not browse-away page | Focus, Flow, and Narrate stayed positioned on the anchor while paused | Pass | Improved | Pass |
| 6 | Console noise | Runtime logs | No `getEffectiveWords` flood or repeated word-0 misses | Console stayed clean; only performance warnings appeared | Pass | Improved | Pass |
| 7 | Page jump-back | User recovery | Jump back returns Page to hard-click anchor | Button appears but does not move, or jumps to the wrong early page | Fail | New evidence | Critical |
| 8 | Focus playback | Active Focus | Play renders and advances the anchor word | Focus overlay shows cursor guides with a blank word area | Fail | New evidence | Critical |
| 9 | Focus browse-away | Passive Focus | Scrolling away shows Jump back | Jump back never appears | Fail | New evidence | Critical |
| 10 | Flow active follow | Active Flow | Play centers/follows the active underline cursor | Single cursor exists, but the window does not move to or follow it | Fail | New evidence | High |
| 11 | Flow browse-away | Active Flow | Manual scroll pauses Flow and shows Jump back | Flow stays playing and no Jump back appears | Fail | New evidence | Critical |
| 12 | Narrate exact start | Active Narrate | Play starts at the hard-click selected word | Narrate resumes from prior last-read/section start instead | Fail | New evidence | Critical |
| 13 | Narrate browse-away | Active Narrate | Audio continues and Jump back returns to narrated position | Works correctly | Pass | Improved | Pass |
| 14 | Hard-click retarget | Active/paused playback | Clicking a new word retargets playback start | Highlight moves, but playback ignores the clicked word | Fail | New evidence | Critical |
| 15 | Button styling | Page mode chrome | Only active Page button has selected fill | Flow keeps a ghost selected-looking fill while Page is active | Fail | New evidence | Medium |
| 16 | Startup reopen | Book restore | Page opens at persistent last-read word with no stale CFI override | Opens Page/no auto-start, but Page and Narrate restore different positions | Partial | New evidence | Medium |

## Implementation Evidence

Step 2 added these branch commits:

| Commit | Description |
|---|---|
| `9dc140b` | Foliate anchor navigation helper + tests |
| `be9b380` | Wire jump-back through Foliate navigation and route browse-away through `markUserBrowsingAway()` |
| `0f683d8` | Mode-aware highlight class in click/selection/return paths for Flow single-cursor behavior |
| `9cea8bc` | Flow centers on Play, Focus starts from persistent anchor, `getEffectiveWords` stabilized |
| `4aba485` | Inactive mode button focus highlight cleaned up |

Reported automated verification:

| Check | Result |
|---|---|
| Full test suite | 2794 passing, 0 failures |
| Focused dispatch tests | 183 passing |
| TypeScript | `tsc --noEmit` clean |
| Scope control | No unrelated files staged |

Manual QA evidence:

| Evidence | Location |
|---|---|
| Screen-interaction manual QA report | `docs/studies/reviews/Reader_Persistent_Anchor_Step2_Manual_QA_2026-05-22.md` |
| Build under test | Dev build at `http://localhost:5173/`, not packaged install |
| Scenario matrix | 18 scenarios covering Page, Focus, Flow, Narrate, cross-mode handoff, startup reopen, console noise, and button styling |

## Interpretation

The branch is not mergeable yet. The automated suite proves useful internal contracts, but the live Foliate surface still violates the user-facing contract in three clusters: recovery navigation, active playback rendering/follow, and hard-click anchor precedence.

The most important preserved wins are still real: mode selection no longer auto-starts, paused mode switches preserve the hard-click anchor, Flow no longer has double visual cursors, Narrate browse-away behavior works, and `getEffectiveWords` logging is no longer flooding the console. Step 3 should preserve those wins while repairing the failed screen behavior.

The root mismatch is now clearer: the implementation still distinguishes "persistent last-read word" from "hard-selected anchor" in ways the spec does not allow. A hard click can move the visual highlight without retargeting playback, and Narrate's working Jump back explicitly targets the last-read word rather than always honoring the hard-selected word as playback start.

Narrate is the reference implementation for the recovery/follow path. It renders a visible chunk highlight, follows active narration, keeps audio running during browse-away, and offers a working Jump back. Page, Focus, and Flow should be repaired against that behavior, while Narrate needs exact-start and retarget fixes.

Per SRL-033, branch-complete work must not imply main-landed queue advancement. Per the new manual QA evidence, `READER-ISO-1A` should remain blocked until the persistent-anchor repair passes the same 18-scenario gate.

## Dispositions

| Item | Disposition | Rationale |
|---|---|---|
| Step 2 branch implementation | Do not merge yet | Automation is green, but manual QA failed user-facing acceptance. |
| Manual QA report | Accept as gating evidence | It used the correct dev build and directly exercises the spec's user-visible requirements. |
| Automated verification | Accept as necessary but insufficient | It protects internal contracts but missed live Foliate behavior failures. |
| Passing contracts | Preserve | No auto-start, paused handoff, single Flow cursor, Narrate browse-away, and clean console are valuable wins. |
| Page/Focus/Flow jump-back parity | Fix Now | Recovery affordance is required across modes and currently works only in Narrate. |
| Focus/Flow playback rendering and follow | Fix Now | Focus blank overlay and Flow non-follow make two modes unusable when active. |
| Hard-click anchor precedence | Fix Now | Playback must start from, and retarget to, the hard-selected word. |
| Flow button ghost highlight | Fix Now | Non-active modes must not look selected. |
| Startup reopen Page/Narrate split | Investigate in repair sprint | Page and Narrate restore different positions, suggesting CFI/progress precedence drift. |
| Roadmap and queue advancement | Defer | Repair sprint must precede `READER-ISO-1A`; do not mark this hotfix as landed. |

## Follow-Up

1. Dispatch a focused `READER-PERSISTENT-ANCHOR-STEP3-REPAIR` sprint before adapter isolation.
2. Use Narrate's working browse-away and jump-back behavior as the reference for Page, Focus, and Flow.
3. Make hard-click anchor precedence explicit across Play, Space, active retarget, Jump back, and book reopen.
4. Re-run the 18-scenario manual QA matrix after repair.
5. Only after manual QA passes, run adversarial review, merge the branch, and then update roadmap/queue status as landed.
