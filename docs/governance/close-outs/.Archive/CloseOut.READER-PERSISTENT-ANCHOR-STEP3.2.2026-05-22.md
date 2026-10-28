---
sprint: READER-PERSISTENT-ANCHOR-STEP3.2
date: 2026-05-22
runtime: implementation + manual QA gate
tokens: n/a
status: manual-qa-failed
---

# Phase Close-Out: READER-PERSISTENT-ANCHOR-STEP3.2

## Sprint Brief

**Goal:** Verify whether `bb00e17` cleared the Step 3.2 merge gate for Flow cursor ownership and Narrate audio sync.
**Result:** S8 is fixed, S1/S4/S18 still hold, but S12/S13 still fail because Narrate audio starts behind the selected word.
**Learned:** Narrate sync has two separate gates: chunk-boundary continuity and exact selected-word audio start; fixing one can leave the other broken.
**Recommend:** Do not merge and do not advance to `READER-ISO-1A`; run a Step 3.3 / `NARRATE-CURSOR-SYNC-2` repair for the audio start-offset.
**Bottom line:** Step 3.2 improved the branch, but the manual QA gate is still red.

**By the numbers:** 13 pass, 2 partial, 2 fail, 1 not re-run; the hard failure is S12/S13 Narrate exact-start audio sync.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | S8 Flow double-cursor | Visible Flow cursor count | Exactly one visible cursor | PASS: single per-word underline; overlay gone | Pass | Fixed | Pass |
| 2 | S12 Narrate exact selected-word start | Audio start position | Audio begins at hard-selected word | FAIL: selecting "At" plays audio from "Cusco" behind it | Fail | Improved but still wrong | Critical |
| 3 | S13 Narrate browse-away with sync | Audio-owned browse-away | Narration continues and Jump Back works without sync loss | FAIL by S12 dependency; start-offset keeps sync caveat open | Fail | Improved but still wrong | Critical |
| 4 | Chunk-boundary skip-ahead | Transition continuity | No audio jump at chunk boundaries | Improved: no visible chunk skip-ahead observed | Partial | Improved | Marginal |
| 5 | S1 Page Jump Back | Within-chapter anchor recovery | Jump Back returns to exact anchor | PASS | Pass | Holds | Pass |
| 6 | S4 Focus overlay | Active Focus render | RSVP overlay renders words and advances | PASS | Pass | Holds | Pass |
| 7 | S18 startup reopen | Reopen restore | Page opens at exact last-read word | PASS | Pass | Holds | Pass |
| 8 | S5 Focus paused browse-away | Paused Focus return affordance | Jump Back appears after paused browse-away | PARTIAL: unchanged accepted partial | Partial | Unchanged | Marginal |
| 9 | S9 Flow lazy follow | Flow-Foliate scroll coordination | Stable centered follow | PARTIAL: deferred | Partial | Unchanged | Marginal |
| 10 | Manual QA gate | SRL-053 live screen/audio QA | S8/S12/S13 pass or misses accepted | Failed: S12/S13 not accepted | Fail | Still blocked | Critical |
| 11 | Merge readiness | Branch governance | Safe to merge | Not ready until Narrate exact-start is repaired or explicitly accepted | Fail | Unchanged | Critical |

## Implementation And QA Evidence

Step 3.2 added this branch commit:

| Commit | Description |
|---|---|
| `bb00e17` | Suppress Flow double-cursor and increase Narrate cursor lag |

Step 3.2 QA evidence:

| Check | Result |
|---|---|
| Flow cursor S8 | PASS: exactly one visible cursor |
| Narrate exact start S12 | FAIL: audio starts behind selected word |
| Narrate browse-away S13 | FAIL by S12 sync dependency |
| Page Jump Back S1 | PASS |
| Focus overlay S4 | PASS |
| Reopen S18 | PASS |
| Focus paused browse-away S5 | PARTIAL, accepted partial remains |

## Interpretation

Step 3.2 fixed the Flow side cleanly. The visible cursor owner is now the iframe per-word underline, and the parent overlay no longer creates the double-underline regression.

Narrate improved but did not pass. The `450ms` lag appears to eliminate the visible chunk-boundary skip-ahead from Step 3.1, but the audio now starts behind the selected word. Evan's repro is precise: selecting "At" in "At this point" starts the audio from "Cusco" in the prior sentence. That means the next problem is likely not a simple cursor-lag constant; it is the mapping from selected word index to TTS chunk start, audio scheduler start offset, or cursor tick state.

The S12/S13 miss should not be accepted. Narrate is a headline reading mode, and "click word -> audio starts earlier" violates its core start-at-anchor promise.

## Dispositions

| Item | Disposition | Rationale |
|---|---|---|
| Commit `bb00e17` | Accept as partial repair | It fixes S8 and improves chunk-boundary behavior. |
| S8 Flow double-cursor | Accept | Manual QA confirms the duplicate cursor is gone. |
| S12 Narrate exact start | Fix Now | Audio starts behind the selected word. |
| S13 Narrate browse-away | Fix Now | Cannot be accepted while exact-start sync is wrong. |
| Chunk-boundary skip-ahead | Accept as partial progress | The visible skip symptom appears gone. |
| S1/S4/S18 regressions | Accept | Manual QA spot checks hold. |
| S5 Focus paused browse-away | Accept partial / Defer | Unchanged accepted partial; not the current blocker. |
| S9 Flow lazy follow | Defer | Separate Flow-Foliate scroll coordination issue. |
| Merge to `main` | Defer | SRL-053 manual QA gate remains red. |
| `READER-ISO-1A` | Defer | Adapter extraction must wait for Narrate exact-start repair or explicit acceptance. |

## Governance Updates

- `ROADMAP.md` should record Step 3.2 as manual-QA-failed but partially successful.
- `docs/governance/sprint-queue.xlsx` should keep `READER-PERSISTENT-ANCHOR-STEP3-REPAIR` at Seq 1 and update the active gate to Step 3.3 / `NARRATE-CURSOR-SYNC-2`.
- `SpecRetro.Lessons_Learned.md` should append SRL-064.
- `READER-ISO-1A` remains blocked until S12/S13 pass or the miss is explicitly accepted.

## Next Work Direction

Run Step 3.3 / `NARRATE-CURSOR-SYNC-2` on `hotfix/reader-persistent-anchor`. The scope should repair Narrate start-offset so audio begins at the selected word, not an earlier chunk or sentence boundary. The investigation should trace selected word index to TTS chunk selection, audio scheduler start offset, and the cursor tick path around `FoliatePageView.tsx` / `audioScheduler.ts`.

Step 3.3 should preserve S8, S1, S4, and S18, then rerun focused Narrate QA plus the necessary regression spot checks. Do not merge or dispatch adapter isolation until S12/S13 pass or receive explicit user-approved disposition.

## Gates

| Gate | Result |
|---|---|
| Automated verification | Pass from implementation closeout. |
| Manual QA | Failed: S12/S13. |
| Merge | Blocked. |
| Adapter isolation | Blocked behind Step 3.3 or explicit acceptance. |
| Release | Not applicable. |

## Evidence

- Commit `bb00e17`
- `docs/studies/reviews/Reader_Persistent_Anchor_Step3.2_Manual_QA_2026-05-22.md`
- `docs/governance/close-outs/CloseOut.READER-PERSISTENT-ANCHOR-STEP3.1.2026-05-22.md`
