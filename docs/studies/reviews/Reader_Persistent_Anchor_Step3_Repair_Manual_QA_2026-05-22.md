# Manual QA Report — Reader Persistent Anchor (Step 3 Repair)

**Date:** 2026-05-22
**Tester:** Cowork (Claude) — screen-interaction manual QA
**Sprint:** READER-PERSISTENT-ANCHOR-STEP3-REPAIR (Reader Runtime Solidification / Stage 1)
**Branch:** `hotfix/reader-persistent-anchor` (code-complete through 4e854a8)
**Build:** Blurby **dev build** at `http://localhost:5173/` (Vite). Source line numbers in console shifted vs Step 2 (`FoliatePageView.tsx` refs at 1189/1197 and 935/611 vs Step 2's 1182/1190 and 928/610), confirming Step 3 source is loaded.
**Book:** *Why Nations Fail* (multi-chapter EPUB). 2-column pagination on the single wide monitor.
**Mode of testing:** Read-only manual QA through the live UI. No code edits, no git. Console for observation only.

---

## Result Summary (Step 3) with Step 2 comparison

| # | Scenario | Step 2 | **Step 3** | Change |
|---|----------|--------|-----------|--------|
| 1 | Page Mode Jump Back Works | FAIL | **FAIL** | Improved (cross-chapter works; within-chapter no-op) |
| 2 | Page Does Not Save Browse-Away As Progress | PASS | **PASS** | — |
| 3 | Focus Selection Does Not Auto-Start | PASS | **PASS** | — |
| 4 | Focus Play Starts Promptly At Anchor | FAIL | **FAIL** | No change (overlay still blank) |
| 5 | Focus Browse-Away And Jump Back | FAIL | **FAIL** | No change (no jump-back in paused Focus) |
| 6 | Flow Selection Does Not Auto-Start | PASS | **PASS** | — |
| 7 | Flow Play Centers Current Word | FAIL | **PASS** | FIXED |
| 8 | Flow Uses One Cursor Only | PASS | **PASS** | — |
| 9 | Flow Reading Window Follows Cursor | FAIL | **PARTIAL** | Improved (follows, but lazily) |
| 10 | Flow Browse-Away Pauses And Shows Jump Back | FAIL | **PASS** | FIXED |
| 11 | Narrate Selection Does Not Auto-Start | PASS | **PASS** | — |
| 12 | Narrate Starts At Selected Word | FAIL | **PASS** | FIXED |
| 13 | Narrate Browse-Away Continues Audio | PASS | **PASS** | — |
| 14 | Cross-Mode Anchor Handoff | FAIL | **PASS** | FIXED (Page-jumpback caveat) |
| 15 | New Hard Click Retargets Active Mode | FAIL | **PASS** | FIXED |
| 16 | Button Styling In Page Mode | FAIL | **PASS** | FIXED (ghost fill gone) |
| 17 | Console Noise Check | PASS | **PASS** | — |
| 18 | Startup Reopen Behavior | PARTIAL | **PARTIAL** | Minor improvement |

**Totals (Step 3):** 13 PASS · 2 PARTIAL · 3 FAIL  (Step 2 was 7 PASS · 1 PARTIAL · 10 FAIL.)

**Net:** 7 scenarios moved to PASS (S7, S10, S12, S14, S15, S16, and S9→PARTIAL). The Step 2 "hard failures" largely cleared: Flow jump-back (S10), Narrate wrong-start (S12), Flow cursor-outside-window (S7) are fixed. **Three failures remain, two of them in Focus mode.**

---

## Remaining Failures (fix targets)

1. **S4 — Focus single-word overlay is still BLANK during playback.** Cursor guides render but no word appears; progress frozen. Unchanged from Step 2. (Notably, Flow playback WAS fixed but the Focus RSVP overlay was not.)
2. **S5 — Focus paused browse-away surfaces no jump-back.** Scrolling away in paused Focus shows a viewport-centered focus lens that follows the scroll, but no "Jump back"/"Return to reading" affordance. Unchanged.
3. **S1 — Page Jump Back is a no-op for within-chapter browse-away.** It now correctly returns to the anchor when the browse-away crossed a chapter/section boundary (verified 2/2), but does nothing when browsing within the same chapter (verified 2/2): the button dismisses and the page doesn't move. The common case (page a few pages within a chapter, then Jump back) still fails.

---

## Per-Scenario Detail

```text
Scenario 1: FAIL (improved)
Mode: Page | Anchor: "Jasmine" (Preface)
Action: Hard-click "Jasmine" -> page 2 spreads away (right arrow) -> click "Jump back".
Expected: Returns to the "Jasmine" page; Jump back disappears after returning.
Actual: WITHIN-CHAPTER browse-away (Preface->Preface): Jump back dismisses but the page does NOT move
        (failed 2/2). CROSS-CHAPTER browse-away (paged into Chapter 1, then Jump back): correctly
        returned to the Preface "Jasmine" page with "Jasmine" highlighted (worked 2/2). Step 2 never
        returned at all, so this is a partial fix. Play stays hidden in Page mode (OK).
Console: no anchor/jump logs on the Jump-back click.

Scenario 2: PASS
Mode: Page->Flow | Anchor: "Jasmine"
Action: Browse 2 spreads away in Page (no word click) -> switch to Flow.
Actual: Flow positioned at the "Jasmine" anchor area (not the browse-away page), paused. Anchor preserved.

Scenario 3: PASS
Mode: Page->Focus | Anchor: "Jasmine"
Actual: Focus selected; did not auto-start; Play enabled; dimmed infinite-scroll surface; no overlay until Play.

Scenario 4: FAIL (no change)
Mode: Focus | Anchor: "Jasmine"
Action: Press Play; sampled multiple frames + 2 zooms.
Actual: Focus single-word overlay is BLANK during playback - cursor guides render but no word between
        them; progress frozen. Identical to Step 2. (Flow playback was fixed; Focus overlay was not.)

Scenario 5: FAIL (no change)
Mode: Focus (paused) | Anchor: "Jasmine"
Action: Scroll away from the anchor (~40 ticks).
Actual: No "Jump back"/"Return to reading" affordance appeared. Paused Focus shows a viewport-centered
        focus lens that follows the scroll, not a persistent return target. Steps 6-8 untestable.

Scenario 6: PASS
Mode: Flow | Anchor: "Jasmine"
Actual: Flow selection did not auto-start; paused; infinite-scroll; positioned at anchor.

Scenario 7: PASS (FIXED)
Mode: Flow | Anchor: "Jasmine"
Action: Press Play.
Actual: Flow Play STARTED at the anchor; a single-word underline cursor rendered INSIDE the reading
        window, attached to the current word, and advanced. Step 2 had the cursor outside a stale window.
        (Centering not perfect - see S9.)

Scenario 8: PASS
Mode: Flow
Actual: Exactly one single-word underline cursor; no second highlight band / chunk highlighting.

Scenario 9: PARTIAL (improved)
Mode: Flow
Action: Watch the reading window over many word advances.
Actual: The window DOES now follow the cursor (it scrolled when the cursor neared the bottom), but
        lazily: the active word drifts from its start position down to the bottom edge before the window
        chunk-scrolls, rather than staying centered. Step 2 never followed at all. Residual: word not
        kept centered; window catches up in chunks.

Scenario 10: PASS (FIXED)
Mode: Flow (playing) | Anchor: "Jasmine"
Action: Manually scroll away.
Actual: Flow AUTO-PAUSED and showed a centered "Return to reading" button; clicking it returned to the
        anchor/reading position and Flow stayed paused. Step 2 failed both (kept playing, no affordance).

Scenario 11: PASS
Mode: Page->Narrate
Actual: Narrate selection did not auto-start; Play enabled; no jump.

Scenario 12: PASS (FIXED)
Mode: Narrate | Anchor: "desert" (fresh hard-click)
Action: Hard-click "desert" -> Play.
Actual: Narration STARTED at "desert" and advanced; reading window followed; audioScheduler.ts active
        (audio presumably playing - not machine-verifiable by ear). Step 2 ignored the hard-click and
        resumed from the last-read word. This is the headline Narrate fix.

Scenario 13: PASS
Mode: Narrate (playing)
Action: Scroll away -> click Jump back.
Actual: Narration continued (not paused, audioScheduler active); Jump back present (faint pill, tooltip
        "Jump back to persistent last-read word"); clicking it returned to the narrated position without
        restarting.

Scenario 14: PASS (improved)
Mode: Page->Focus/Flow/Narrate->Page | Anchor: "Medicare" (Chapter 1)
Actual: Flow and Narrate both held the anchor when switched (paused, anchor visible); Narrate Play
        STARTED at the "Medicare" anchor region (Step 2 started at word 0/section start). Caveat: the
        Page->jump-back sub-step inherits the S1 within-chapter limitation.

Scenario 15: PASS (improved)
Mode: Narrate (playing)
Action: Hard-click a different word during active narration.
Actual: Narration retargeted - the view jumped to the clicked region (far more than ~1s of natural
        advancement). Step 2 only moved the highlight, not playback. (Window scrolls during narration,
        so word-level precision is approximate, but the retarget clearly occurred.)

Scenario 16: PASS (FIXED)
Mode: Page
Actual: The Flow button's light-blue "ghost" FILL is gone. Page is the only filled (blue) button;
        Focus & Flow show a neutral grey outline; Narrate is borderless. No inactive button looks active.
        Minor cosmetic note: Narrate lacks the outline box that Focus/Flow have (inconsistent inactive
        styling, not the ghost-active bug). Keyboard-focus traversal not tested (Tab opens the Reading
        Queue, per the "tab menu" hint).

Scenario 17: PASS
Mode: Focus/Flow/Narrate
Actual: After clearing the console and playing, only a few performance violations appeared
        (setTimeout/Forced reflow from FoliatePageView.tsx; requestAnimationFrame from audioScheduler.ts).
        No getEffectiveWords flood (zero occurrences), no repeated "word 0 not in DOM" misses.

Scenario 18: PARTIAL (minor improvement)
Mode: (reload) -> Page -> Narrate | last-read ~Chapter 1 (3%)
Action: Reload app -> reopen book -> select Narrate -> Play.
Actual: Opens in Page mode (PASS); no auto-start (PASS); Narrate Play resumes at the persistent last-read
        position in Chapter 1 ~3%, not the book start (PASS). BUT Page mode reopened at the Preface body
        (~2%), BEHIND the persistent last-read; switching to Narrate jumped forward to the true last-read.
        Page-vs-persistent reopen discrepancy persists (Page lands in the prior section). Slightly better
        landing than Step 2 (Preface 2% vs Contents 1%).
```

---

## Final Report Block (template format)

```text
Totals:
- Pass: 13 (S2, S3, S6, S7, S8, S10, S11, S12, S13, S14, S15, S16, S17)
- Partial: 2 (S9 Flow window-follow lazy; S18 Page reopen lags persistent position)
- Fail: 3 (S1 Page jump-back within-chapter no-op; S4 Focus overlay blank; S5 Focus paused jump-back absent)
- Hard failures: 2 (S4 blank Focus; S5 missing Focus jump-back). S1 is a partial-fix FAIL.

Cross-cutting findings:
1. Narrate and Flow are now substantially fixed. Narrate starts at the hard-selected word (S12),
   retargets on click (S15), and hands off across modes at the anchor (S14). Flow renders a single
   in-window cursor that starts at the anchor (S7/S8) and auto-pauses with a working return on
   browse-away (S10).
2. Focus mode remains broken: the single-word RSVP overlay renders blank during playback (S4) and
   paused-Focus browse-away surfaces no jump-back (S5). Focus appears to be on a different (unfixed)
   playback path than Flow/Narrate.
3. "Jump back" reliability is now section-dependent in Page mode (S1): it works when the return crosses
   a chapter/section boundary but is a no-op within the same chapter. The same section-boundary logic
   likely explains the S18 Page-reopen lag (Page restores a CFI in the prior section while Narrate uses
   the true persistent word). Two surfaces (Page CFI vs persistent word) are not fully reconciled.

Recommended fix priority:
1. Focus overlay blank (S4) + Focus paused jump-back (S5) - bring Focus onto the same fixed playback /
   anchor path that Flow and Narrate now use.
2. Page Jump Back within-chapter no-op (S1) - make same-section returns scroll/paginate to the anchor,
   not just dismiss the button. This likely also fixes the S18 Page-vs-persistent reopen lag.
3. Flow window-follow centering (S9) - keep the active word centered instead of letting it drift to the
   edge before a chunk scroll.
```

---

## Limitations of this pass
- **Audio is not machine-verifiable** — the tester cannot hear TTS. Narrate audio is inferred from `audioScheduler.ts` activity + the visual cursor/window only.
- **Screenshots were captured live but the screen harness does not persist them as openable files**; failure/again states are described in each scenario's "Actual" field.
- The pre-reload state for S18 involved heavy navigation, so "last-read" is approximate; the Page-vs-persistent discrepancy is the reportable signal.

## Merge-gate read
13/18 PASS with the two highest-impact Step 2 hard failures (Narrate wrong-start, Flow playback/jump-back) resolved. **Focus mode (S4/S5) is still broken and Page within-chapter Jump Back (S1) still fails** — these are the blockers to a clean gate. Recommend a Step 3.1 targeting Focus parity + Page same-section jump-back before merge sign-off.
