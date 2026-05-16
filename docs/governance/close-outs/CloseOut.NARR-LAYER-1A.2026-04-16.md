---
sprint: NARR-LAYER-1A
date: 2026-04-16
runtime: not fully exposed by platform
tokens: not fully exposed by platform
status: all-pass | has-discoveries
---

# Phase Close-Out: NARR-LAYER-1A

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Flow-layer narration foundation landed | Architectural goal | Narration becomes a flow-layer foundation | Implemented via `FlowScrollEngine` follower mode, flow-sync wiring, and `isNarrating` state | Pass | Positive | Pass |
| 2 | Flow follower mode added | Engine capability | Flow can follow narrated word position | `followerMode`, `setFollowerMode(enabled)`, and `followWord(wordIndex)` added | Pass | Positive | Pass |
| 3 | Flow+narration UI state landed | Reader controls | Flow+narrating behaves as first-class state | Bottom bar, keyboard, and ReaderContainer plumbing updated | Pass | Positive | Pass |
| 4 | Overlay conflict suppressed | Visual correctness | No dual progress representations during flow narration | Narration band and overlay loops suppressed while flow narration is active | Pass | Positive | Pass |
| 5 | Cross-section / cross-book handoff wired | Narration continuity | Narration can continue through section/book transitions | Section-end and cross-book flow-sync logic added | Pass | Positive | Pass |
| 6 | New focused regression suite added | New tests | Meet sprint spec | 18 new narration-layer tests added | Pass | Positive | Pass |
| 7 | Targeted verification green | Sprint verification | Targeted test file passes | `tests/narrationLayer.test.ts` passed | Pass | Positive | Pass |
| 8 | Full verification green | Full suite + build | Pass | `npm test` passed with 1985 tests; `npm run build` passed | Pass | Positive | Pass |
| 9 | Circular build warning persists | Build hygiene | No new blockers | `settings -> tts -> settings` circular chunk warning remains | Marginal | Unchanged | Marginal |
| 10 | Repo-state execution constraint surfaced | Sprint execution environment | Branch-safe execution under dirty tree | Sprint had to be executed on current branch to avoid disturbing unrelated worktree changes | Pass | Workflow signal | Discovery |

## Interpretation

This sprint achieved the core architectural move it was supposed to make: narration is no longer treated only as a separate visual reading mode. Flow can now act as the visual source of truth while narration follows it as a layer, which is the foundation needed before the legacy narration path can be safely removed in `NARR-LAYER-1B`.

The most important practical outcome is not any single UI change, but the alignment of engine, sync, state, and controls around `flow + narrating` as a real mode combination. That sharply reduces the odds that future TTS quality work keeps fighting a split architecture where visual progress and spoken progress disagree.

The remaining build warning is still real, but it did not block the sprint goal and should remain separate from the narration-layer close-out. The repo-state discovery is also important: the execution plan was fine, but branch hygiene was constrained by unrelated existing local changes, so the sprint had to proceed on the current branch rather than its nominal sprint branch.

## Dispositions

| Finding | Disposition | Reason |
|---|---|---|
| Flow-layer narration architecture | Accept | Core sprint goal achieved and verified |
| Circular chunk warning | Defer | Valid issue, non-blocking, belongs in a separate follow-up |
| Dirty-worktree branch constraint | Log | Workflow/environment lesson, not a product blocker |

## Governance Updates

This sprint likely requires the normal roadmap/queue close-out updates once merge/push is fully confirmed:

- mark `NARR-LAYER-1A` complete
- advance the active queue pointer to `NARR-LAYER-1B`
- preserve the note that the circular chunk warning remains deferred follow-up work

At close-out time, merge/push was reported as in progress rather than explicitly confirmed complete, so branch/merge state should only be finalized in governance docs once that finishes.

## Next Work Pointer

The next queued sprint should remain:

- `NARR-LAYER-1B` — [ROADMAP.md#L1185](C:/Users/estra/Projects/Blurby/ROADMAP.md#L1185)
- Queue pointer — [SPRINT_QUEUE.md#L37](C:/Users/estra/Projects/Blurby/docs/governance/SPRINT_QUEUE.md#L37)

`NARR-LAYER-1A` appears to have set up `NARR-LAYER-1B` correctly. The next sprint can now focus on deleting the legacy standalone narration path rather than trying to introduce the flow-layer foundation and remove the old mode at the same time.

## Gates

- Audit gate: none clearly triggered from this summary
- Milestone review: useful if you want a checkpoint note because this is an architectural pivot sprint
- Branch/merge gate: pending confirmation at close-out time; summary says merge/push is in progress

## Close-Out Verdict

`NARR-LAYER-1A` is a successful architectural close. It moved narration onto the path Blurby actually wants, verified the new combined flow+narration behavior with focused tests plus a green full suite/build, and left `NARR-LAYER-1B` as a cleaner consolidation sprint instead of a risky rewrite.
