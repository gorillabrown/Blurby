# Manual QA Report — Reader Persistent Anchor (Step 3.4 Gate / NARRATE-CURSOR-SYNC-3, Approach B)

**Date:** 2026-05-23
**Tester:** Cowork (Claude) — screen-interaction manual QA with DevTools diagnostics; audio confirmed by Evan
**Sprint:** READER-PERSISTENT-ANCHOR-STEP3-REPAIR — Step 3.4 merge gate
**Branch / commit:** `hotfix/reader-persistent-anchor` @ **2142d4a** (Approach B content-alignment). Dev Electron build; DevTools console live (`consoleCapture.ts:46`). Fix confirmed present (see S12).
**Book:** *Why Nations Fail* (chapter 1, ~3%).
**Dispatch focus:** S12/S13 start-word equality with DevTools diagnostics; regression spot checks S8/S1/S4/S18.
**Gate rule:** Do not merge `hotfix/reader-persistent-anchor` or dispatch READER-ISO-1A until S12/S13 pass or the miss is explicitly accepted.

---

## Headline

**Approach B fixed the start-word bug (S12) — verified by diagnostics AND by ear — but a separate, residual cursor/audio sync defect (S13) remains.** Clicking a word now starts the audio at that word (no more "starts at the sentence beginning"). However, during playback the visual cursor advances faster than the audio, leads it, and at chunk-load the narration skips forward to catch up. Regression checks S8/S1/S4/S18 all hold. **Gate not fully met** — S13 still fails; a follow-up fix (Step 3.5 / NARRATE-CURSOR-SYNC-4) is specced.

---

## Result Summary (Step 3.3 → Step 3.4)

| # | Scenario | Step 3.3 | **Step 3.4** | Change |
|---|----------|----------|-------------|--------|
| 1 | Page Jump Back Works | PASS | **PASS** | Holds (anchor "Purchase" 3905; browse-away + Jump back → exact anchor, highlight restored) |
| 4 | Focus Play renders at anchor | PASS | **PASS** | Holds (RSVP overlay renders word + focal dot; not blank) |
| 8 | Flow uses one cursor only | PASS | **PASS** | Holds (single per-word underline; no double) |
| 12 | Narrate starts at selected word | FAIL | **PASS** | **FIXED** by Approach B — audio/cursor/pipeline all start at clicked word |
| 13 | Narrate cursor/audio stay in sync | FAIL | **FAIL** | Residual: cursor leads audio, chunk-load skip-ahead (separate defect) |
| 18 | Startup reopen behavior | PASS | **PASS** | Holds (reopened at persistent chapter position, no auto-start) |

---

## Priority finding — S12 PASS (fixed), S13 FAIL (residual)

### S12 — Narrate starts at selected word: **PASS** (machine-verified + Evan's ear)
Hard-clicked **"Medicare"** (end of "Many of the residents… have access to Medicare."), pressed Play. DevTools:

```
[TTS-7L] onWordClick: resolved globalWordIndex: 3383 word: "Medicare."
[narrate] cursor-driven — start: 3383
[narrate] speakNextChunkKokoro: startIdx=3383, word="Medicare.", prev="to"
[pipeline] produceChunk: startIdx=3383, firstWord="Medicare.", text="Medicare. It's just one of the many services the government..."
```

All three now resolve index 3383 to **"Medicare"** (in Step 3.3 the same index split into "Medicare" for the click vs "Many" for the TTS array). The click index now uses the canonical word-array space — Approach B's content-alignment worked. Evan confirmed by ear: audio begins at the clicked word, not the sentence start.

### S13 — Narrate cursor/audio sync: **FAIL** (residual, separate defect)
Evan, listening: *"It started where it was supposed to but the cursor is still running ahead, allowing the narration to skip ahead when a new chunk loads."* Console corroborates: `[foliate] narrate scroll-follow — word 3742` while the audio anchor was still `3383` — the cursor was ~360 words ahead of the audio.

This is a **different code path** from the index alignment we fixed. Root cause (traced + verified):
- The Narrate cursor is boundary-driven: `audioScheduler.ts` `tick` (lines 566-571) advances while `currentWordBoundaries[i].time <= audioCtx.currentTime - lag`, firing `onWordAdvance` → `cursorWordIndex` (`useNarration.ts:1240-1242`, `narration.ts:142`).
- The tick consumes the **entire** `currentWordBoundaries` timeline, including boundaries for prefetched/rebuilt chunks whose `.time` can fall ≤ `now - lag` before their audio actually plays → the cursor races ahead of real playback.
- `source.start(chunkStartTime)` and `activeSources{startTime,endTime,boundaryTime,boundaries}` (`scheduleChunk` 715-729) give a real per-source playback window to clamp against, but the tick is not bounded to the playing source.
- `TTS_TRUSTED_CURSOR_LAG_MS = 450` / `NARRATION_CURSOR_LAG_MS = 350` (`constants.ts:113,119`) are fixed shifts — they cannot gate a multi-second / hundreds-of-words lead.
- The chunk-load "skip" is the boundary stream re-basing at transitions; the Kokoro restart index itself is correct (`lastConfirmedAudioWordRef`, `useNarration.ts:1190`).

**Fix (specced as Step 3.5 / NARRATE-CURSOR-SYNC-4):** bound cursor advancement to the currently-playing source's window (clamp emitted cursor word index ≤ real audio word index); continue chunk transitions from the audio position; add an invariant test "cursor word index ≤ `getAudioProgress().wordIndex` (cursor never leads)." Fix sites: `audioScheduler.ts` `startWordTimer.tick` (543-617) + `getAudioProgress` (907-966). Tests: `tts7b-cursorContract.test.ts`, `audioScheduler.test.ts`, `cursorNarrationSync.test.ts`.

---

## Regression spot checks (all hold)

- **S8 — Flow single cursor (PASS).** One per-word underline on the active word (zoomed "valley"); no overlay duplicate. (The cursor leading the dark window is the deferred S9 lazy-follow, not S8.)
- **S1 — Page Jump Back (PASS).** Anchor "Purchase" (`onWordClick` 3905); paged forward twice (`user browsing away (mode: page)`, anchor preserved at 3905); Jump back → exact anchor page, "Purchase" highlight restored.
- **S4 — Focus Play (PASS).** RSVP overlay renders (word + focal-point dot, advancing); not blank.
- **S18 — Reopen (PASS).** Book reopened in Page mode at the persistent chapter position, no auto-start.

Approach B's content-aligned stamping was exercised correctly across all three modes — click indices now resolve to the right canonical word (Narrate 3383, Flow 3904, Page 3905) — so the shared word-index change did not regress Page/Focus/Flow.

---

## Final Report Block (template format)

```text
Totals (checks run this gate):
- Pass: S1, S4, S8, S12, S18
- Fail: S13 (Narrate cursor leads audio; chunk-load skip-ahead)
- Hard failure: S13 — gate blocker

Key result:
- S12 FIXED by Approach B (content-align). Machine-verified index equality
  (onWordClick == speakNextChunkKokoro == produceChunk = 3383 'Medicare') + Evan's ear.
- S13 is a SEPARATE residual defect: the cursor advances from the full boundary timeline,
  not the currently-playing source, so it leads audio; chunk-load re-bases and audio skips.

Recommended fix:
- NARRATE-CURSOR-SYNC-4 (Step 3.5): clamp cursor advance to the active source / real audio
  word index; chunk transitions continue from audio position; invariant test cursor<=audio.
```

---

## Merge-gate read

**Not a clean pass — but real, decisive progress.** The hard index-space bug that defeated Steps 3.1–3.3 is fixed (S12, confirmed two ways), and S8/S1/S4/S18 hold. The remaining blocker is **S13 — the cursor outruns the audio and the narration skips forward at chunk boundaries** — a narrower, well-localized defect in the audio scheduler's cursor tick. Per the gate rule, keep READER-ISO-1A blocked until S13 passes or is explicitly accepted. Step 3.5 / NARRATE-CURSOR-SYNC-4 is specced (ROADMAP + queue) to land the fix.

## Limitations
- **Audio is not machine-verifiable** by the tester; S12 audio-start and S13 cursor-lead/skip were confirmed by Evan listening. The `produceChunk firstWord` log makes the start word machine-checkable independent of audio.
- Background apps repeatedly stole window focus and a stray Electron splash resurfaced; both were worked around (re-focus + close splash). The window also toggled maximize/restore on relayout. None affected results.
- S2/S3/S5/S6/S7/S9/S10/S11/S14/S15/S16/S17 not re-driven (unaffected by the Narrate/word-index changes); carry prior dispositions. S9 Flow lazy-follow remains deferred.
