# Manual QA Report — Reader Persistent Anchor (Step 3.2 Gate)

**Date:** 2026-05-22
**Tester:** Cowork (Claude) — screen-interaction manual QA
**Sprint:** READER-PERSISTENT-ANCHOR-STEP3-REPAIR — Step 3.2 merge gate
**Branch / commit:** `hotfix/reader-persistent-anchor` @ **bb00e17** (clean app restart; dev build confirmed via console source refs — `useFoliateSync.ts:142`, `audioScheduler.ts:749`, `useProgressTracker.ts:100`, `useReaderMode.ts` — shifted vs Step 3.1's e6ebb07).
**Book:** *Why Nations Fail* (2-column pagination on the wide monitor; "1. So Close and Yet So D…" chapter, ~4–5%).
**Dispatch focus:** Priority S8, S12, S13. Regression spot checks S1, S4, S18. Confirm S5 paused-Focus browse-away remains accepted partial. **Gate rule:** do not merge or dispatch READER-ISO-1A until Step 3.2 passes or any miss is explicitly accepted.

---

## Headline

**One of the two Step 3.1 defects is fixed; the other is not.** The **Flow double-underline regression (S8) is FIXED** — Flow now renders exactly one cursor (the per-word underline). The **Narrate cursor/audio desync (S12/S13) is improved but NOT cleanly passed**: the visual cursor no longer skips ahead at chunk boundaries, but **the audio starts behind the selected word** (Evan's repro: selecting "At" in "At this point" plays audio from "Cusco" in the prior sentence). All three regression spot checks (S1, S4, S18) hold.

**Gate read: NOT a clean pass.** S12/S13 still fail. Per the dispatch rule, READER-ISO-1A should not be dispatched/merged unless the S12/S13 miss is explicitly accepted.

---

## Result Summary (Step 3.1 → Step 3.2)

| # | Scenario | Step 3.1 | **Step 3.2** | Change |
|---|----------|----------|-------------|--------|
| 1 | Page Jump Back Works | PASS | **PASS** | Holds (browse-away + Jump back → exact anchor, highlight restored) |
| 2 | Page browse-away not saved | PASS | **PASS\*** | Carried (Page selection unchanged) |
| 3 | Focus selection no auto-start | PASS | **PASS\*** | Carried |
| 4 | Focus Play starts at anchor | PASS | **PASS** | Holds (overlay renders RSVP words, focal-letter highlight, advancing) |
| 5 | Focus browse-away + Jump back | PARTIAL | **PARTIAL** | Unchanged — playing-case return works; paused-case still no affordance (accepted) |
| 6 | Flow selection no auto-start | PASS | **PASS\*** | Carried |
| 7 | Flow Play centers word | PASS | **PASS\*** | Carried |
| 8 | Flow uses one cursor only | FAIL | **PASS** | **FIXED** — overlay `.flow-shrink-cursor` removed; only per-word `.page-word--flow-cursor` renders |
| 9 | Flow window follows cursor | PARTIAL | **PARTIAL** | Unchanged (lazy follow; deferred) |
| 10 | Flow browse-away pause + Jump back | (not re-run) | **(not re-run)** | Carried PASS from Step 3 |
| 11 | Narrate selection no auto-start | PASS | **PASS\*** | Carried |
| 12 | Narrate starts at selected word | FAIL | **FAIL** | Improved (no chunk skip) but audio starts **behind** the selected word |
| 13 | Narrate browse-away continues audio | FAIL | **FAIL** | Compromised by the S12 start-offset |
| 14 | Cross-mode anchor handoff | PASS\* | **PASS\*** | Handoff OK; *Narrate-desync caveat |
| 15 | New hard-click retargets active mode | PASS\* | **PASS\*** | Mechanism OK; *desync confounds Narrate verification |
| 16 | Button styling in Page mode | PASS | **PASS\*** | Ghost-fill fix holds |
| 17 | Console noise check | PASS | **PASS** | Only benign `[Violation]` perf warnings, no errors |
| 18 | Startup reopen behavior | PASS | **PASS** | Holds — book reopened at exact last-read position (Page mode) |

`*` = carried from Step 3.1; bb00e17 only changed Flow cursor (S8) and Narrate sync (S12/S13), so non-Narrate, non-Flow-cursor behavior is unchanged and was not re-driven end-to-end.

**Totals:** 13 PASS (incl. S14/S15 with caveat) · 2 PARTIAL (S5, S9) · 2 FAIL (S12, S13) · 1 not re-run (S10).

---

## Priority checks

### S8 — Flow single cursor (FIXED)
The FLOW-DOUBLE-CURSOR-1 hotfix landed. Flow now renders **one** underline on the current word — the per-word cursor (`.page-word--flow-cursor`, `border-bottom: 3px solid var(--accent)` inside the foliate iframe). The overlay/shrink cursor (`.flow-shrink-cursor`) is no longer rendered. Verified by zooming the current word during Flow playback: a single clean underline, no doubled bar. This matches Evan's decision (keep per-word, remove overlay). **S8 PASS.**

### S12 / S13 — Narrate cursor/audio sync (IMPROVED, still FAIL)
The chunk-boundary **skip-ahead is gone** — the visual cursor advanced smoothly through the "At this point… Cusco" region with no observed snap-forward at chunk transitions (the Step 3.1 symptom). That is real progress from NARRATE-CURSOR-SYNC-1.

**But the start position is now wrong in the other direction.** Evan-observed (audio not machine-verifiable by the tester): selecting **"At"** (in "At this point") starts the audio at **"Cusco"** — a word in the *prior* sentence. So the audio begins **behind** the hard-clicked/selected word instead of at it. This trips S12 ("starts at selected word") and, by extension, S13 (browse-away-continues can't be cleanly verified while the start anchor is off). **S12/S13 FAIL.**

Likely area: the mapping from the selected word index to the TTS chunk/utterance start offset (cursor scheduler vs. audio start index) — see `FoliatePageView.tsx:1688-1712` cursor tick and `audioScheduler.ts` chunk start. The earlier fix removed the cursor-leads-audio skip but appears to have shifted the audio start to a chunk/sentence boundary at or before the selection rather than the exact selected word.

---

## Regression spot checks (all hold)

- **S1 — Page Jump Back (PASS).** Set anchor on "which" (after "Potosí"), paged forward twice within the chapter (Jump back affordance appeared bottom-right), pressed Jump back → returned to the exact anchor page with "which" highlight restored.
- **S4 — Focus Play (PASS).** Set anchor on "conquistadors", pressed Play → the RSVP overlay rendered words ("Inca" with focal-letter highlighting on the focal letter) and advanced; Pause/Play toggled correctly. No blank overlay (the Step 2/3 failure mode).
- **S18 — Reopen position (PASS).** Confirmed at setup: after restart the book reopened in Page mode at the exact last-read position, no auto-start.

## S5 confirmation (accepted partial, unchanged)
Scrolling away while Focus is **paused** surfaces **no** "Return to reading"/"Jump back" affordance — the paused lens simply follows the scroll (verified: the catchment-area map scrolled into view with no return control). Playing-case return works (from 3.1). This remains the accepted partial; not cheaply fixable within this gate.

---

## Final Report Block (template format)

```text
Totals:
- Pass: 13 (S1, S2*, S3*, S4, S6*, S7*, S8, S11*, S14*, S15*, S16*, S17, S18)
  (* carried from 3.1 / Narrate-desync caveat on S14/S15)
- Partial: 2 (S5 paused jump-back absent / playing works; S9 lazy follow, deferred)
- Fail: 2 (S12 Narrate audio starts behind selected word; S13 desync-compromised)
- Not re-run: 1 (S10 — carried PASS from Step 3)
- Hard failures: S12 (wrong Narrate start — audio behind selection)

Cross-cutting findings:
1. S8 Flow double-underline is FIXED — single per-word cursor, overlay removed (per Evan).
2. Narrate chunk-boundary skip-ahead is GONE (real improvement), but the audio now starts
   BEHIND the selected word: select "At" -> audio plays from "Cusco" (prior sentence).
   S12/S13 still fail.
3. Regression spot checks S1/S4/S18 all hold. S5 remains accepted partial.

Recommended fix priority:
1. Narrate start offset (S12/S13) — map the selected word index to the correct TTS chunk
   start so audio begins at the selected word, not an earlier sentence/chunk boundary.
   Highest user impact; the sole remaining gate blocker.
```

---

## Merge-gate read

**Step 3.2 does NOT cleanly pass.** S8 is fixed; S1/S4/S18 hold; S5 is the accepted partial. The remaining blocker is **S12/S13 — Narrate audio starts behind the selected word** (Evan's "At" → "Cusco" repro). Per the dispatch rule — *"Do not merge or dispatch READER-ISO-1A until Step 3.2 passes or any miss is explicitly accepted"* — the gate is **not met**. Two paths: (a) Evan explicitly accepts the S12/S13 miss and unblocks READER-ISO-1A, or (b) a Step 3.3 lands a NARRATE-CURSOR-SYNC-2 fixing the audio start offset before sign-off.

## Limitations
- **Audio is not machine-verifiable** by the screen tester — the Narrate start-offset (S12/S13) was identified by Evan listening; I confirmed only the visual cursor behavior (smooth, no chunk skip) and the on-screen "Cusco / At this point" repro context.
- Carried scenarios (marked `*`) were not re-driven end-to-end in 3.2; they are unaffected by bb00e17's Flow-cursor and Narrate-sync changes.
- A background app intermittently stole window focus and a stray Electron splash resurfaced; both were worked around and did not affect results.
