# Manual QA Report — Reader Persistent Anchor (Step 2)

**Date:** 2026-05-22
**Tester:** Cowork (Claude) — screen-interaction manual QA
**Build:** Blurby **dev build** running from source via Electron at `http://localhost:5173/` (the Step 2 branch). See "Build Identification" below.
**Book:** *Why Nations Fail* (multi-chapter EPUB), opened from the library.
**Mode of testing:** Read-only manual QA through the live UI. No code edits, no git operations. DevTools console used for observation only.

---

## Build Identification (important)

The first attempt ran against the **packaged** install (`%LOCALAPPDATA%\Programs\blurby\blurby.exe`), where the persistent-anchor feature was largely absent (no "Jump back", dead page arrows, only Focus/Flow/Narrate buttons — no "Page" button). That binary is **not** the Step 2 build.

Testing was redirected to the **dev build** (`...\Projects\Blurby\node_modules\electron\dist\electron.exe`, DevTools title `Developer Tools – http://localhost:5173/`). All results below are from that dev build. It exposes the full **Page | Focus | Flow | Narrate** selector with a distinct **Page** mode, matching the spec's model. Source references in the console (`FoliatePageView.tsx`, `paginator-*.js`, `audioScheduler.ts`) confirm the running TypeScript source.

---

## Result Summary

| # | Scenario | Result |
|---|----------|--------|
| 1 | Page Mode Jump Back Works | **FAIL** |
| 2 | Page Mode Does Not Save Browse-Away As Progress | PASS |
| 3 | Focus Selection Does Not Auto-Start | PASS |
| 4 | Focus Play Starts Promptly At Anchor | **FAIL** (hard) |
| 5 | Focus Browse-Away And Jump Back | **FAIL** (hard) |
| 6 | Flow Selection Does Not Auto-Start | PASS |
| 7 | Flow Play Centers Current Word | **FAIL** |
| 8 | Flow Uses One Cursor Only | PASS |
| 9 | Flow Reading Window Follows Cursor | **FAIL** |
| 10 | Flow Browse-Away Pauses And Shows Jump Back | **FAIL** (hard) |
| 11 | Narrate Selection Does Not Auto-Start | PASS |
| 12 | Narrate Starts At Selected Word | **FAIL** (hard) |
| 13 | Narrate Browse-Away Continues Audio | PASS |
| 14 | Cross-Mode Anchor Handoff | **FAIL** |
| 15 | New Hard Click Retargets Active Mode | **FAIL** |
| 16 | Button Styling In Page Mode | **FAIL** |
| 17 | Console Noise Check | PASS |
| 18 | Startup Reopen Behavior | PARTIAL |

**Totals:** 7 PASS, 1 PARTIAL, 10 FAIL (5 of which are "hard failures" per the spec: blank Focus, missing Jump back ×2, wrong Narrate start, Page Jump-back-to-wrong-place).

---

## Cross-Cutting Findings

1. **Mode selection never auto-starts playback** in any mode (S3, S6, S11 all pass). This part of the Step 2 work is solid.
2. **The persistent hard-click anchor is preserved across mode switches while paused** (S2; S14 positioning) — switching modes lands on the anchor, not the browse-away location. Good.
3. **Playback rendering is broken in Focus and Flow.** Focus shows a **blank single-word overlay** (cursor guides but no word; S4). Flow advances a single underline cursor but the **reading window never moves to/follows it** (S7, S9) — the cursor ends up outside the window.
4. **"Jump back" behavior is inconsistent across modes:**
   - Page: the pill **appears** but clicking it does **not** return to the anchor (page doesn't move, or jumps to the book/Preface start). (S1)
   - Focus (paused): **never appears** after scrolling away. (S5)
   - Flow (playing): **never appears**, and Flow **does not auto-pause** on manual scroll. (S10)
   - Narrate: **works correctly** — appears, continues audio, returns to the narrated position. (S13)
5. **The hard-click anchor is not honored as the playback start point.** A new hard-click moves the visible highlight box but does **not** retarget playback (S15: "click updates highlight but not playback"). Narrate Play resumes from the prior "last-read" word or the section start, not the hard-selected word (S12, S14). The Narrate "Jump back" tooltip reads *"Jump back to persistent last-read word"* — i.e., the implementation tracks a *last-read* position, distinct from the hard-click anchor the spec expects modes to start from.
6. **Narrate is the most functional mode** — chunk highlight renders, the reading window follows narration, browse-away continues audio with a working Jump back, and `audioScheduler.ts` is active (audio presumably plays; not machine-verifiable by ear). Its one substantive failure is start-at-anchor (S12).
7. **Button ghost highlight (user-flagged):** the **Flow** mode button persistently shows a light-blue "selected-looking" fill while **Page** is the active (solid blue) mode (S16).
8. **Console is clean.** No `[TTS-7K] getEffectiveWords` flood at any point (zero occurrences), and no repeated `word 0 not in DOM` misses (S17). Only performance violations appear (Forced reflow, requestAnimationFrame from `audioScheduler.ts`, setTimeout from `FoliatePageView.tsx`).

### Limitations of this pass
- **Audio is not machine-verifiable** — the screen tester cannot hear TTS. Narrate audio checks are inferred from `audioScheduler.ts` activity and the visual cursor only.
- **Screenshots were captured live during testing but the screen-interaction harness does not persist them as openable image files.** Key visual states are described in each scenario's "Actual" field.
- A few late scenarios (S15 active-retarget, S18) were partly confounded by accumulated navigation state from the long session; these caveats are noted inline.

---

## Per-Scenario Detail

```text
Scenario 1: FAIL  (hard)
Mode: Page
Anchor word: "desert" (clean test); originally "transformed"
Action: Hard-click "desert" -> page forward exactly 2 pages (right arrow) -> click "Jump back" once.
Expected: Page returns to the "desert" page with "desert" visible; Jump back disappears after returning.
Actual: Jump back disappeared but the page did NOT move (stayed on the browse-away page). In an earlier
        variant the click jumped to the Preface start (~2%) instead of the anchor. Never returned to the
        persistent anchor. (Page stayed paused and Play stayed disabled = those sub-points OK.)
        Side note: the right page-arrow chevron DOES work in the dev build (it did not in the packaged build).
Screenshot: captured live (not persisted).
Console notes: no anchor/jump logs emitted on the Jump-back click.

Scenario 2: PASS
Mode: Page -> (mode switch)
Anchor word: "desert"
Action: In Page, browse 2 pages away from "desert" (no word click), switch modes.
Expected: Persistent anchor remains the original clicked word; mode switch lands on it, not the browse-away page.
Actual: Switching modes positioned the surface on the "desert" anchor, not the browsed-away page. Anchor preserved.
Console notes: clean.

Scenario 3: PASS
Mode: Page -> Focus
Anchor word: "desert"
Action: Click Focus.
Expected: Focus selected, playback does not begin, Play enabled, infinite-scroll surface, no overlay until Play.
Actual: Focus selected; dimmed infinite-scroll surface centered on the anchor; Play shows the play icon (paused);
        no single-word overlay; no jump to word 0; no console flood. All conditions met.
Console notes: no getEffectiveWords logs.

Scenario 4: FAIL  (hard - "blank Focus")
Mode: Focus
Anchor word: "desert"
Action: Press Play (speed lowered to 100 wpm to catch the first word). Sampled multiple frames.
Expected: Single-word overlay appears starting at the anchor and advancing; overlay not blank.
Actual: The Focus overlay shows only the two cursor guide arrows with a COMPLETELY BLANK word area across
        all sampled frames (0.4s/1.0s/1.6s). Guides and progress do not advance. No word ever renders, so
        start-at-anchor could not be verified. Reproduced again later (S17).
Screenshot: captured live (not persisted).
Console notes: NO getEffectiveWords activity on Focus start (consistent with words not being processed).

Scenario 5: FAIL  (hard - "missing Jump back")
Mode: Focus (paused)
Anchor word: "desert"
Action: With Focus paused, scroll away from the anchor (15, then +25 ticks).
Expected: Jump back appears; clicking it returns to the anchor; Play then starts at the anchor.
Actual: Scrolling moved the surface (anchor scrolled off the top) but NO Jump back affordance ever appeared,
        at any scroll distance. Steps 5-8 untestable because the affordance never showed.
Console notes: clean.

Scenario 6: PASS
Mode: Flow
Anchor word: "desert"
Action: Click Flow.
Expected: Flow selected and paused; no cursor movement; infinite-scroll; anchor stable.
Actual: Flow selected; Play shows play icon (paused); no movement; infinite-scroll surface; no jump; no flood.
Console notes: clean.

Scenario 7: FAIL
Mode: Flow
Anchor word: "desert"
Action: Press Play (surface was scrolled to end-of-Preface, away from the anchor).
Expected: The current word is centered in the reading window; cursor attached; window not above/below cursor.
Actual: Flow entered the playing state ("~1712 min left") but the reading window stayed at the stale scrolled
        position and did NOT move to the anchor. No cursor was visible in the window; progress did not change.
        (The single underline cursor was later found on the word "it" - i.e., OUTSIDE the reading window.)
Screenshot: captured live (not persisted).
Console notes: clean.

Scenario 8: PASS
Mode: Flow
Anchor word: "desert"
Action: Inspect the active cursor.
Expected: Exactly one active indicator (single-word underline); no second highlight band / competing cursor.
Actual: Exactly ONE indicator observed - a single-word underline (on "it"), with no competing highlight band
        or chunk highlight. The single-cursor requirement is met. (Caveat: during playback the cursor was
        outside the reading window per S7/S9, so it had to be located by scrolling.)
Console notes: clean.

Scenario 9: FAIL
Mode: Flow
Anchor word: "desert"
Action: Start Flow playback; watch the reading window.
Expected: The active underline stays in the reading window; text rolls through a stable window.
Actual: The reading window does NOT follow the cursor. The cursor advanced (reached "it") while the window
        stayed static at the stale position - cursor drifted out of the reading window.
Console notes: clean.

Scenario 10: FAIL  (hard - "missing Jump back")
Mode: Flow (playing)
Anchor word: "desert"
Action: With Flow playing, manually scroll away.
Expected: Flow auto-pauses; Jump back appears; clicking it returns to the anchor; stays paused.
Actual: Manual scroll did NOT auto-pause Flow (button still showed Pause = still playing), and NO Jump back
        appeared. Failed both conditions.
Screenshot: captured live (not persisted).
Console notes: clean.

Scenario 11: PASS
Mode: Page -> Narrate
Anchor word: (Preface position)
Action: Click Narrate.
Expected: Narrate selected; narration does not start; Play enabled; anchor stable.
Actual: Narrate selected (1.0x-1.5x speed presets appear); Play shows play icon (paused); no narration; no jump.
Console notes: clean.

Scenario 12: FAIL  (hard - "wrong Narrate start")
Mode: Narrate
Anchor word: "Botswana" (fresh hard-click while paused)
Action: Hard-click "Botswana" (anchor box appears) -> press Play.
Expected: Narration begins exactly at the persistent hard-selected word ("Botswana").
Actual: Narration resumed at the PRIOR last-read word ("happened", earlier in the text) and advanced forward,
        ignoring the freshly hard-clicked "Botswana". Narrate DOES render a chunk highlight and the reading
        window DOES follow narration, and audioScheduler.ts runs (audio active, not verifiable by ear) - but
        the START point is wrong. The Jump-back tooltip ("persistent last-read word") explains the behavior:
        the implementation honors a last-read position, not the hard-click anchor.
Screenshot: captured live (not persisted).
Console notes: audioScheduler.ts requestAnimationFrame + FoliatePageView.tsx setTimeout violations during play.

Scenario 13: PASS
Mode: Narrate (playing)
Anchor word: (Chapter 1 narrated position)
Action: While narrating, manually scroll away; then click Jump back.
Expected: Narration continues (not paused); Jump back appears; clicking it returns to the narrated position
          without restarting at the wrong word.
Actual: Narration continued (status "Narrating", audioScheduler still active) on scroll-away; Jump back was
        present; clicking it scrolled back to the narrated position (Chapter 1 start) without restarting.
        Tooltip: "Jump back to persistent last-read word". All conditions met.
Console notes: audioScheduler.ts activity continued through the scroll (audio not paused).

Scenario 14: FAIL
Mode: Page -> Focus -> Flow -> Narrate -> Page
Anchor word: "Jasmine" (fresh hard-click)
Action: Hard-click "Jasmine"; cycle Focus/Flow/Narrate (paused); press Play in Narrate; switch to Page.
Expected: Each mode paused at the anchor; Narrate Play starts from the exact anchor; Page can jump back to it.
Actual: HANDOFF POSITIONING WORKS - Focus, Flow, and Narrate all stayed paused and positioned at the "Jasmine"
        anchor. BUT Narrate Play did NOT start at "Jasmine" - it started at the section beginning (~word 0 of
        the Preface) and advanced. Page jump-back to the anchor is also broken (per S1). Net: FAIL.
Screenshot: captured live (not persisted).
Console notes: clean handoff; audioScheduler on Narrate play.

Scenario 15: FAIL
Mode: Narrate (paused and playing)
Anchor word: "Botswana"/"Jasmine" (paused); "Cairo"-area (active)
Action: Hard-click a different word while paused (then Play) and while actively narrating.
Expected: The persistent anchor changes to the clicked word AND active playback retargets to it (or, if paused,
          stays paused at the new word and then plays from it).
Actual: The hard-click moves the visible anchor HIGHLIGHT BOX but does NOT retarget playback. Paused-then-Play
        started elsewhere (not the clicked word); active narration continued forward instead of jumping to the
        clicked word. This is exactly the "click updates highlight but not playback" failure mode.
Screenshot: captured live (not persisted).
Console notes: clean.

Scenario 16: FAIL
Mode: Page
Anchor word: n/a
Action: Enter Page; click Focus; click Page; inspect mode buttons (cursor moved away); press Tab.
Expected: Page is the only filled active button; no other button retains a selected-looking outline/fill;
          keyboard focus is visible but distinct from the active selected state.
Actual: The FLOW button persistently shows a light-blue "ghost" fill while Page is the active (solid blue) mode
        - a non-active button looks selected (user-flagged). Focus did NOT retain a ghost after Focus->Page
        (good). Keyboard-focus check NOT testable: Tab opens the Reading Queue side panel ("tab menu"), not
        button-focus navigation.
Screenshot: captured live (not persisted).
Console notes: n/a.

Scenario 17: PASS
Mode: Focus (and observed across all modes)
Anchor word: n/a
Action: Clear console; play Focus ~3.5s; (and extensive prior cycling through Flow/Narrate).
Expected: getEffectiveWords appears only a few times (or not at all); no continuous stream; no repeated word-0 misses.
Actual: After clearing, Focus playback produced ZERO console logs. Across the whole session there was never a
        getEffectiveWords stream and never a repeated "word 0 not in DOM" miss. Only performance violations
        appear (Forced reflow, requestAnimationFrame, setTimeout). No flood, no relocate-skip loops.
Console notes: clean.

Scenario 18: PARTIAL
Mode: (reload) -> Page -> Narrate
Anchor word: (Preface "last-read")
Action: Reload the dev app (forces the persistence/restore path) -> reopen Why Nations Fail -> select Narrate -> Play.
Expected: Opens in Page mode at/near the last-read word; no auto-start; stale CFI does not override the persistent
          word; Narrate starts from the persistent word.
Actual: Opens in PAGE mode (PASS); Play disabled / no auto-start (PASS); Narrate Play resumed from the persistent
        Preface position, NOT from the book start (PASS). CAVEAT: Page mode reopened on the table of CONTENTS
        (~1%) with no highlighted last-read word, while switching to Narrate jumped to the deeper Preface body
        (~2%) - a Page-vs-persistent position discrepancy (looks like a stale-CFI/early position in the Page
        reopen). Pre-reload navigation state was messy, so this caveat is reported, not scored as a hard fail.
Screenshot: captured live (not persisted).
Console notes: clean reload; audioScheduler on Narrate play.
```

---

## Recommended Priorities (suggested)

1. **Focus blank overlay (S4)** and **Flow window-follow (S7/S9)** — playback rendering is non-functional in two of four modes. Highest impact.
2. **Jump back parity (S1/S5/S10 vs S13)** — Narrate's Jump back is the working reference; bring Page (return action), Focus (never appears), and Flow (never appears + no auto-pause) up to that behavior.
3. **Hard-click anchor as playback start (S12/S14/S15)** — reconcile the "persistent last-read word" implementation with the spec's expectation that a hard-click sets the start point for the next Play.
4. **Flow button ghost highlight (S16)** — non-active mode button should not render a selected-looking fill.
5. **S18 Page-vs-persistent reopen discrepancy** — verify Page mode restores the same position the persistent/last-read tracking uses.
