# Manual QA Report — Reader Persistent Anchor (Step 3.6 Gate / NARRATE-CURSOR-SYNC-5)

**Date:** 2026-05-24
**Tester:** Cowork (Claude) — screen-interaction QA + DevTools diagnostics; audio confirmed by Evan
**Sprint:** READER-PERSISTENT-ANCHOR-STEP3-REPAIR — Step 3.6 (Content-Contiguous Synthesis, Bug 2)
**Branch / commit:** `hotfix/reader-persistent-anchor` @ **816bff7**
**Book:** The Raven (poetry — maximizes chunk re-entries/pauses)
**Verdict:** **FAIL** — content still omitted audibly. Decision: Bug 2 is not separable from Bug 1; merge into the post-isolation closed-loop fix; unblock READER-ISO-1A.

---

## Headline

Step 3.6 made the **generation** index contiguous (verified in the console: `produceChunk` chains `0→13→42→78→172→314→477→602→715→849→996→1111` with no gaps, and audio sub-chunks cover every word). **But the audio still skipped a line.** Narrating The Raven, Evan did **not hear** "This it is and nothing more." — playback continued from an ahead-of-heard position, omitting the words. Step 3.6's fix swapped the cursor (`lastConfirmedAudioWordRef`) for the produced-end (`nextGenWordIndexRef`), but the pipeline **prefetches the entire poem** (DEV log shows `drift = −227s`, the whole book scheduled into the AudioContext future at once), so the produced-end is just as far ahead of the heard audio as the cursor was. Re-entry seeds from "ahead of what was heard" either way, so it still skips.

## Decisive evidence

- **Generation contiguous:** `[pipeline] produceChunk: startIdx=0,endIdx=13 … 13→42 → 42→78 → 78→172 → (plan rebuilt @172) → 172→314 → 314→477 → (@477) → 477→602 → 602→715 → (@715) → 715→849 → 849→996 → (@996) → 996→1111`. No index gap; every word produced in order.
- **Schedule far ahead of audio:** `[scheduler] scheduleChunk: drift=−227519ms (ctx=2042.363 start=2269.882)` — ~227s of audio scheduled past the playback clock; the whole poem is queued up front.
- **Audible skip (Evan):** "I did not hear them. It did not play them. It played from where the cursor was, not the contiguous words." (Re: "This it is and nothing more.")

## Root cause (unified)

The audible content omission is **caused by seeding playback continuation from a position ahead of what has actually been heard.** Every reference the code exposes is some flavor of ahead-of-heard:
- `cursorWordIndex` — boundary/schedule-driven, leads the audio (Bug 1).
- `lastConfirmedAudioWordRef` — a misnomer; written in the boundary callback, the cursor's twin.
- `nextGenWordIndexRef` (Step 3.6) — the produced-end; ahead because the whole poem is prefetched.

The system has **no signal for what has actually been spoken**, so any re-entry (section handoff / stall / resume) restarts playback ahead of the heard position and drops the gap. Therefore **Bug 2 (content omission) is not separable from Bug 1 (cursor lead)** — they are the same defect at the playback layer, and both require a real heard-position signal to fix.

## Disposition (Evan-approved, 2026-05-24)

- **Stop the pre-isolation patch cycle.** Six rounds (3.1–3.6) each partially worked then skipped; each adds risk to the tangled scheduler.
- **Merge Bug 2 into the post-isolation `NARRATE-CLOSED-LOOP-CURSOR` item** as one unified fix: make the **currently-playing audio source's real word position** the single source of truth for (a) the visual cursor and (b) re-entry/continuation seeding. (`getPlayingSourceMaxWordIndex` from Step 3.5 already locates the playing source — the position is computable.)
- **Revise the merge gate: READER-ISO-1A proceeds.** The Narrate cursor/content sync is deferred to after the Narrate adapter isolates this module, where scheduler surgery is safe. The branch's other repairs (S1, S4, S8, S12 exact-start, S18) are sound and may land.

## Net status of the persistent-anchor repair lane

| Scenario | Status |
|----------|--------|
| S1 Page jump-back, S4 Focus overlay, S8 Flow single cursor, S12 start-at-clicked-word, S18 reopen | PASS (held across Step 3.x) |
| S5 Focus paused browse-away | Accepted partial |
| S9 Flow lazy-follow | Deferred |
| S13 Narrate cursor/audio sync + content contiguity | **Deferred to post-isolation `NARRATE-CLOSED-LOOP-CURSOR` (unified Bug 1 + Bug 2)** |

## Limitations
- Audio not machine-verifiable by the tester; the skip was confirmed by Evan's ear. The console proves generation contiguity but cannot prove what was *heard* — which is exactly why the open-loop design has been so hard to fix.
