# Close-Out — READER-PERSISTENT-ANCHOR Step 3.6 / NARRATE-CURSOR-SYNC-5

**Date:** 2026-05-24
**Sprint:** READER-PERSISTENT-ANCHOR-STEP3-REPAIR — Step 3.6 (Content-Contiguous Synthesis, Bug 2)
**Branch / commit:** `hotfix/reader-persistent-anchor` @ `816bff7` — not merged
**Outcome:** FAILED at manual QA; repair lane closed by explicit disposition; unified Narrate sync deferred post-isolation.

## Sprint Brief

- **Goal:** Stop Narrate from dropping spoken words at chunk re-entry by making automatic continuation content-contiguous.
- **Result:** `816bff7` made generation contiguous (`produceChunk 0→…→1111`) and added `nextGenWordIndexRef`, but manual audio QA still heard omitted content because playback continued from an ahead-of-heard position.
- **Learned:** Bug 2 (content omission) and Bug 1 (cursor lead) are the same playback-layer defect: every available continuation reference is ahead of what the listener has actually heard.
- **Recommend:** Stop pre-isolation scheduler patching, merge the persistent-anchor branch for the fixed non-sync behavior, and move the unified Narrate fix to `NARRATE-CLOSED-LOOP-CURSOR` after adapter isolation.
- **Bottom line:** The repair lane is closed; `READER-ISO-1A` is unblocked, while Narrate cursor/content continuity becomes a single post-isolation closed-loop audio-truth sprint.

## Problem

Step 3.5 showed that Narrate still failed S13 after source-owned cursor clamping: the cursor stayed closer to the active source, but the listener still heard skip-ahead at chunk boundaries. Step 3.5 analysis split the issue into:

1. **Bug 1 — visual cursor lead.** The cursor advances from predicted word-boundary timing, not from a real heard-audio signal.
2. **Bug 2 — content omission.** Re-entry and continuation seed playback from a position ahead of what was actually heard, so audible words are dropped.

Step 3.6 attempted to fix Bug 2 in isolation by introducing a produced-content truth reference, `nextGenWordIndexRef`, and using it for automatic continuation instead of the cursor-twin `lastConfirmedAudioWordRef`.

## Implementation Result

`816bff7` introduced `nextGenWordIndexRef`, updated by an `onChunkProduced` callback, and changed `speakNextChunkKokoro` to seed automatic continuation from produced-content truth. The implementation also reset the generation-truth index only on hard-click re-anchor and authoritative section handoff, preserved the exact-start gate, and added a `scheduleChunk` schedule-vs-wallclock DEV log.

Reported verification:

| Check | Result |
|---|---|
| Full test suite | 2,821 passing |
| TypeScript | `npx tsc --noEmit` clean |
| Diff hygiene | `git diff --check` clean |
| Tests added | 4 tests: content-contiguity invariant, hard-click override, and structural coverage |

## Manual QA Result

Manual QA on The Raven FAILED. Generation was contiguous in logs, but Evan did not hear the line "This it is and nothing more." Playback still continued from a position ahead of what had actually been heard.

The decisive signal was the new schedule-vs-wallclock drift log: the pipeline had effectively prefetched the whole poem (`drift ≈ -227s`). That meant `nextGenWordIndexRef` was also ahead-of-heard. It was a different reference, but not an actually heard reference.

## Unified Diagnosis

The attempted separation failed because all three available references are ahead of the listener:

| Reference | Why it cannot seed audible continuation |
|---|---|
| `cursorWordIndex` | Boundary/schedule-driven visual cursor; known to lead heard audio. |
| `lastConfirmedAudioWordRef` | Written in the same boundary callback as the cursor; a cursor twin, not audio truth. |
| `nextGenWordIndexRef` | Produced-end truth; ahead-of-heard when chunks/book are prefetched far into the AudioContext future. |

The system lacks a signal for "what was actually spoken." Therefore Bug 2 is not separable from Bug 1. Both require a closed-loop real-audio-position source of truth.

## Dispositions

| Item | Disposition | Rationale |
|---|---|---|
| Step 3.6 code | Accept as partial hardening/instrumentation, not as an S13 fix | It proved generation contiguity and exposed the ahead-of-heard prefetch frontier. |
| S13 | Defer to `NARRATE-CLOSED-LOOP-CURSOR` | S13 requires real playing-source heard position, not another ahead-of-heard proxy. |
| Persistent-anchor repair lane | Close | S1, S4, S8, S12 exact-start, and S18 are fixed; S5 accepted partial; S9 deferred; S13 now explicitly dispositioned. |
| `READER-ISO-1A` | Unblock | Adapter isolation should proceed so Narrate truth-sync can be owned cleanly before scheduler surgery. |
| `hotfix/reader-persistent-anchor` | Ready for git hygiene and merge | The non-sync repairs are sound; the remaining Narrate sync defect is documented and moved post-isolation. |

## Governance Updates Applied

- `ROADMAP.md`: Step 3.6 marked FAILED; repair lane closed; `READER-ISO-1A` moved to next dispatch; `NARRATE-CLOSED-LOOP-CURSOR` expanded to the unified Bug 1 + Bug 2 fix.
- `docs/studies/reviews/Reader_Persistent_Anchor_Step3.6_Manual_QA_2026-05-24.md`: saved the failed manual QA result and unified diagnosis.
- `docs/governance/LESSONS_LEARNED.md`: corrected LL-126 to the four-quantity guardrail; only real heard position may seed playback.
- `docs/governance/close-outs/SpecRetro.Lessons_Learned.md`: appended SRL-072, warning against iterating on ahead-of-heard references.
- `docs/governance/sprint-queue.xlsx`: repair lane closed; `READER-ISO-1A` is Seq 1; `NARRATE-CLOSED-LOOP-CURSOR` added post-isolation.

## Post-Isolation Fix Shape

`NARRATE-CLOSED-LOOP-CURSOR` should make the currently-playing audio source's real word position the single source of truth for both:

1. Visual cursor position.
2. Re-entry / continuation seeding.

The post-isolation fix should retire ahead-of-heard continuation sources, bound or redesign prefetch so schedule drift cannot run hundreds of seconds ahead, and verify by ear in both prose and poetry that no cursor lead or audible content omission remains.

## Gates

| Gate | Result |
|---|---|
| Automated verification | Pass |
| Step 3.6 manual QA | Fail |
| Repair lane | Closed by disposition |
| Adapter isolation | Unblocked |
| Unified Narrate sync | Deferred to post-isolation `NARRATE-CLOSED-LOOP-CURSOR` |

## Git State

Commit `816bff7` is on `hotfix/reader-persistent-anchor`; branch is not merged. Governance edits from this close-out remain working-tree changes until staged and committed through the normal git-hygiene flow.

## Key Engineering Finding

A "decoupling" reference is only as good as its independence. `lastConfirmedAudioWordRef` was the cursor's boundary-driven twin, and `nextGenWordIndexRef` was the produced-content frontier; both can be ahead of heard audio. Durable Narrate sync requires closing the loop around the real playing-source heard position.
