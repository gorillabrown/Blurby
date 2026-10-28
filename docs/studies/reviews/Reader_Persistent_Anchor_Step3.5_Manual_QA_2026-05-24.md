# Manual QA Report — Reader Persistent Anchor (Step 3.5 Gate / NARRATE-CURSOR-SYNC-4)

**Date:** 2026-05-24
**Tester:** Cowork (Claude) — screen-interaction QA + DevTools diagnostics + ULTRATHINK diagnosis; audio confirmed by Evan
**Sprint:** READER-PERSISTENT-ANCHOR-STEP3-REPAIR — Step 3.5 merge gate
**Branch / commit:** `hotfix/reader-persistent-anchor` @ **c647362** (`getPlayingSourceMaxWordIndex` clamp on `tick`/`getAudioProgress`).
**Books:** *Why Nations Fail* (prose) and **The Raven** (poetry — added as a stress test for prosodic pauses, hard line breaks, dense punctuation).
**Gate rule:** Do not merge or dispatch READER-ISO-1A until S13 passes by ear or the miss is explicitly dispositioned.

---

## Headline

**S13 still fails — the clamp helped but did not cure it.** The cursor leads the audible audio in **both** prose and The Raven (Evan-confirmed by ear), so chunk size is not the variable and the Step 3.5 source-clamp is a cap, not a correction. The console boundary-drift metric (~9ms) is **self-referential** (cursor-vs-schedule, not cursor-vs-audio) and must not be trusted as a sync proxy — recognizing that prevented a wrong fix. ULTRATHINK analysis decomposed S13 into **two coupled bugs**:

- **Bug 1 — visual cursor lead** (open-loop schedule drift). Deferred to a **post-READER-ISO** closed-loop fix (Evan). Does not block READER-ISO-1A.
- **Bug 2 — content omission** (synthesis re-entry re-seeds from the cursor-twin ref, dropping spoken words). **The pre-isolation blocker → Step 3.6 / NARRATE-CURSOR-SYNC-5.**

---

## What was tested and found

**Setup:** Confirmed the c647362 clamp is present and effective at its stated job — with a clean play, `scroll-follow` tracked at reading pace and ignored a prefetch chunk produced far ahead (word 19254 while playback was ~4090), which Step 3.4 would not have done.

**S13 — by ear (the decider):**
- Prose (*Why Nations Fail*): "tighter for longer, then the cursor outpaces and the narration skips at a chunk load."
- The Raven: cursor **still leads** the audible word; at re-entry the narration **skips and omits content**. Poetry did not hide the bug.

**The self-referential-metric trap:** The Raven console showed boundary drift averaging ~9ms and all chunks `WORD-NATIVE` — which *looked* like tight sync. But that metric compares the cursor to the scheduler's own predicted timeline, not to the real audio. Evan's ear showed the cursor leading despite the 9ms number. Conclusion: the schedule itself drifts ahead of the audio; the cursor tracks the drifted schedule faithfully. No console number currently available is a valid sync proxy — only the ear is.

**Two-bug decomposition (root cause, verified by ear + console + code trace):**

1. **Bug 1 — visual lead.** Cursor advances on a predicted boundary timeline (`audioScheduler.ts tick`, `boundary.time` vs `audioCtx.currentTime − lag`) that accumulates ahead of real audio. The 450ms lag (escalated 120→220→350→450 over prior steps) and the c647362 clamp cap the lead but cannot correct an accumulating offset. Leads regardless of medium → general drift, not chunk-size-dependent.

2. **Bug 2 — content omission (correctness).** `speakNextChunkKokoro` seeds each chunk-chain start from `lastConfirmedAudioWordRef` (`useNarration.ts:1190`). That ref is a **misnomer** — it is written in the boundary callback (`:1240`, the cursor's mechanism), so it carries the cursor lead. Within a continuous run, generation is contiguous via the pipeline's `nextProduceIdx`; but at **re-entry** (section handoff / stall / resume) `speakChunk` restarts from the cursor-twin ref, omitting the words between the previous chunk's real end and the cursor. Evan-confirmed: the skip drops content. Console: handoff `lastConfirmedWordIndex = 171` == cursor `scroll-follow 170–178`. The prior fix TTS-7R/BUG-145c tried to decouple synthesis from `cursorWordIndex` but used `lastConfirmedAudioWordRef` — the cursor's twin — so it was ineffective.

Causal chain: schedule drifts ahead → cursor leads (Bug 1) → `lastConfirmedAudioWordRef` leads → next chunk synthesized from the cursor → content omitted (Bug 2).

---

## Regression spot checks

S8 (Flow single cursor), S1 (Page jump-back), S4 (Focus overlay), S18 (reopen) were verified on Step 3.4 (2142d4a) and are **unaffected by c647362**, which changed only `audioScheduler` cursor-advance clamping (no word-stamping or Page/Focus/Flow paths). Carried as PASS.

---

## Disposition & gate

| Item | Status | Disposition |
|------|--------|-------------|
| S12 (start at clicked word) | PASS | Held (Step 3.4 Approach B) |
| S13 — Bug 2 (content omission) | FAIL | **Fix now → Step 3.6 / NARRATE-CURSOR-SYNC-5.** Pre-isolation blocker. |
| S13 — Bug 1 (visual cursor lead) | FAIL | **Deferred to post-READER-ISO** (NARRATE-CLOSED-LOOP-CURSOR), Evan-approved. Does NOT block READER-ISO-1A. |
| S8 / S1 / S4 / S18 | PASS | Carried from Step 3.4 |

**Gate read:** Not clean. Per the gate rule, the remaining miss is explicitly dispositioned: Step 3.6 fixes the correctness defect (content omission) and is required before READER-ISO-1A; the visual cursor lead is scheduled as a post-isolation closed-loop fix. Once Step 3.6 passes manual audio QA (no words omitted), READER-ISO-1A unblocks.

---

## Method note (why this took an extra diagnostic loop)

The decisive lesson: this subsystem has been debugged with **self-referential telemetry** — every metric (drift, scroll-follow, handoff index) is computed from the same predicted schedule, so none can detect a schedule-vs-audio offset. That is why four prior fixes (index-align, lag escalation ×3, content-align, source-clamp) reduced symptoms without curing them. Step 3.6 adds the first non-self-referential instrument: a DEV log of `ctx.currentTime − chunkStartTime` (schedule vs wall clock), which will make the post-isolation Bug 1 fix tractable. Ground truth for audio sync remains Evan's ear until that instrument lands.

## Limitations
- Audio not machine-verifiable by the tester; S13 confirmed by Evan's ear.
- Recurring environment friction (focus-steal, stray Electron splash) worked around; did not affect results.
