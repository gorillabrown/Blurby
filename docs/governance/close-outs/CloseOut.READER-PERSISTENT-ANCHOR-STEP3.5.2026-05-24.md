---
sprint: READER-PERSISTENT-ANCHOR-STEP3.5
date: 2026-05-24
runtime: implementation closeout
tokens: n/a
status: code-complete-manual-qa-pending
---

# Phase Close-Out: READER-PERSISTENT-ANCHOR Step 3.5 / NARRATE-CURSOR-SYNC-4

## Sprint Brief

**Goal:** Stop Narrate's visual cursor from outrunning heard audio and causing chunk-boundary skip-ahead.
**Result:** Commit `c647362` clamps scheduler cursor advancement to the currently-playing `ActiveSource`; automation is green, but manual QA is still pending.
**Learned:** Audio-clock timing alone is not enough when future chunks are prefetched; cursor advancement must also be source-owned.
**Recommend:** Keep the hotfix branch unmerged until S13 is verified by ear, then close the persistent-anchor repair gate.
**Bottom line:** This is the right structural fix for the S13 failure, but SRL-053/SRL-060 keep the gate closed until live audio QA passes.

## Findings

| Item | Finding | Disposition |
|---|---|---|
| Core fix | `audioScheduler` now clamps cursor progress to the active source's max word index | Accept |
| Chunk prefetch | Prefetching remains intact; only cursor emission/progress is gated | Accept |
| Tests | 4 behavioral + 2 structural tests added; 2,819 tests pass; `tsc` clean | Accept |
| Merge readiness | Branch is not ready for merge until manual QA confirms cursor/audio sync by ear | Hold |
| Current branch | `hotfix/reader-persistent-anchor` has commit `c647362` and remains unmerged | Hold pending QA |

## Implementation Evidence

Reported verification:

| Check | Result |
|---|---|
| Full test suite | 2,819 passing |
| TypeScript | `npx tsc --noEmit` clean |
| Diff hygiene | `git diff --check` clean |
| Commit | `c647362 fix(tts): clamp narrate cursor to the currently-playing audio source` |

## Interpretation

Step 3.4 fixed the selected-word start problem by putting click, highlight, and TTS chunking into one canonical word-index space. Step 3.5 addresses the separate continuous-sync defect: the scheduler was consuming a flat `currentWordBoundaries` timeline without checking whether the boundary belonged to the source currently audible to the user.

The fix adds source ownership to cursor advancement. `getPlayingSourceMaxWordIndex(now)` identifies the latest active source whose playback has actually started, and `tick()` plus `getAudioProgress()` clamp emitted cursor progress to that source's range. This preserves chunk prefetching while preventing future scheduled boundaries from driving the visual cursor early.

The code result is credible, but the acceptance gate is explicitly auditory. SRL-060 applies: visual logs and automation are insufficient if the user can still hear cursor lead or chunk-boundary skip-ahead.

## Proposed Dispositions

| Item | Disposition | Rationale |
|---|---|---|
| Commit `c647362` | Accept as Step 3.5 code result | It targets the structural boundary-ownership flaw found in Step 3.4 QA. |
| Manual QA | Required before merge | The original failure was heard-audio desync, not just a visual cursor mismatch. |
| `READER-ISO-1A` | Keep blocked | Adapter extraction should not begin until the persistent-anchor repair gate is green or explicitly accepted. |
| S9 Flow lazy-follow | Keep deferred | It is separate Flow/Foliate scroll coordination work. |
| S13 recheck | Highest-priority next action | It is the only remaining active blocker named by Step 3.5. |

## Governance Updates

- `ROADMAP.md` should mark Step 3.5 as code-complete with manual QA pending.
- `docs/governance/sprint-queue.xlsx` should mark `READER-PERSISTENT-ANCHOR-STEP3-REPAIR` as in-flight/manual-QA pending, not fresh queued work.
- `SpecRetro.Lessons_Learned.md` should append SRL-069.

## Manual QA Gate

Run the manual matrix from the reader persistent-anchor QA template with emphasis on:

1. Click a mid/end-of-sentence word and start Narrate.
2. Confirm by ear that audio starts at the clicked word (S12 remains green).
3. Confirm the cursor stays with the spoken word and does not visibly lead.
4. Confirm no chunk-boundary skip-ahead occurs during S13.
5. Spot-check S8, S1, S4, and S18.

## Gates

| Gate | Result |
|---|---|
| Automated verification | Pass |
| Manual QA | Pending |
| Merge | Blocked |
| Adapter isolation | Blocked behind Step 3.5 manual audio QA |

## Evidence

- Commit `c647362`
- `ROADMAP.md` Step 3.5 repair gate
- `docs/studies/reviews/Reader_Persistent_Anchor_Step3.4_Manual_QA_2026-05-23.md`
- `docs/governance/close-outs/CloseOut.READER-PERSISTENT-ANCHOR-STEP3.4.2026-05-23.md`
