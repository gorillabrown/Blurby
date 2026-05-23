# Manual QA Template: Reader Persistent Anchor

**Default instantiated title:** `Manual QA Spec: Reader Persistent Anchor <Step or Sprint>`

**Audience:** Claude Screen Interaction tester
**Mode:** Read-only manual QA through the app UI
**Goal:** Verify Page, Focus, Flow, and Narrate persistent-anchor behavior after reader-anchor fixes.

## Template Use

Use this template for reader-mode persistent-anchor release gates, including Step 2, Step 3 repair, and future adapter-isolation validation. When instantiating it for a run, replace `<Step or Sprint>` with the sprint name, record the build under test, and save the completed report under `docs/studies/reviews/`.

## Tester Rules

- Do not edit code.
- Do not commit, stage, or run git operations.
- Use screen interaction as the primary modality.
- Use the console only for observation.
- Capture a screenshot for every failure.
- If behavior is ambiguous, pause and record exactly what happened instead of guessing.
- Treat word index `0` jumps, blank Focus, missing Jump back, double Flow cursor, or wrong Narrate start as hard failures.

## Setup

1. Open the Blurby Electron app on the target branch.
2. Open DevTools Console and keep it visible or easily accessible.
3. Clear the console before each scenario.
4. Open a long EPUB, preferably `Why Nations Fail` or another multi-chapter EPUB.
5. Confirm the app opens in `Page` mode.
6. Confirm the Play button is disabled or visually unavailable in `Page` mode.
7. Pick a visible word near the middle of a page and hard-click it.
8. Record the selected word text and surrounding sentence as the test anchor.
9. Use that same anchor until a scenario explicitly says to choose a new word.

## Global Pass Criteria

- Mode selection alone never starts playback.
- Space or Play starts Focus, Flow, or Narrate only after the mode is selected.
- Every mode starts from the persistent hard-selected word.
- Browse-away does not overwrite the persistent anchor.
- Jump back appears after user browse-away in every mode.
- Jump back returns the visual surface to the persistent anchor.
- Page mode Play remains disabled.
- Focus, Flow, and Narrate use infinite-scroll browsing surfaces while paused.
- Page mode uses pagination.
- Console does not spam `[TTS-7K] getEffectiveWords` repeatedly during idle or Focus startup.
- No mode unexpectedly jumps to word `0`.

## Evidence Format

For each failure, capture:

- Screenshot of the UI.
- Console snippet from the last 20 relevant lines.
- Current mode.
- Whether playback was active or paused.
- Anchor word text.
- Action immediately before failure.
- Expected result.
- Actual result.

## Scenario 1: Page Mode Jump Back Works

1. Start in `Page` mode.
2. Hard-click a visible word to create the persistent anchor.
3. Use the right page arrow to move one or more pages away.
4. Confirm `Jump back` appears.
5. Click `Jump back`.
6. Wait up to 2 seconds.
7. Confirm the page returns to the hard-selected word.
8. Confirm the hard-selected word is visible near the reading window, not merely stored internally.
9. Confirm `Jump back` disappears after returning.
10. Confirm Page mode remains paused and Play remains disabled.

Fail if:

- `Jump back` does not appear.
- `Jump back` disappears but the page does not move.
- The page returns to the wrong word.
- The app jumps to the start of the book.

## Scenario 2: Page Mode Does Not Save Browse-Away As Progress

1. Start in `Page` mode at the persistent anchor.
2. Navigate several pages away.
3. Do not click any word.
4. Switch to `Flow`.
5. Confirm Flow is paused.
6. Switch back to `Page`.
7. Click `Jump back` if visible.
8. Confirm the persistent anchor is still the original clicked word.

Fail if:

- The browsed-away page becomes the new anchor.
- Switching modes lands at the browsed-away location instead of the persistent anchor.
- The original clicked word is lost.

## Scenario 3: Focus Selection Does Not Auto-Start

1. Start in `Page` mode at the persistent anchor.
2. Click `Focus`.
3. Confirm the mode button changes to Focus.
4. Confirm playback does not begin.
5. Confirm the bottom Play button is enabled.
6. Confirm the content remains browsable as an infinite-scroll surface.
7. Confirm no single-word Focus overlay appears until Play is pressed.

Fail if:

- Focus starts immediately on mode selection.
- The screen goes blank before Play.
- The app jumps to word `0`.
- Console starts spamming `getEffectiveWords`.

## Scenario 4: Focus Play Starts Promptly At Anchor

1. Start in `Focus` mode paused.
2. Press Play or Space.
3. Wait up to 2 seconds.
4. Confirm the Focus single-word overlay appears.
5. Confirm the first displayed word is the persistent hard-selected word or the exact selected token.
6. Confirm Focus advances from that word.
7. Confirm the overlay is not blank.
8. Confirm console does not repeatedly print `[TTS-7K] getEffectiveWords`.

Fail if:

- Focus does not start within 2 seconds.
- Focus starts from word `0`.
- Focus starts one sentence or page before the selected word.
- Focus overlay is blank.
- Console floods with `getEffectiveWords`.

## Scenario 5: Focus Browse-Away And Jump Back

1. Select `Focus`.
2. Leave Focus paused.
3. Scroll away from the persistent anchor.
4. Confirm `Jump back` appears.
5. Click `Jump back`.
6. Confirm the scrolled surface returns to the persistent anchor.
7. Press Play.
8. Confirm Focus starts from the persistent anchor.

Fail if:

- `Jump back` does not appear in paused Focus.
- Jump back does not move the surface.
- Play starts from the browsed-away location.

## Scenario 6: Flow Selection Does Not Auto-Start

1. Start in `Page` mode at the persistent anchor.
2. Click `Flow`.
3. Confirm Flow is selected.
4. Confirm Flow is paused.
5. Confirm no cursor movement begins.
6. Confirm the surface is infinite-scroll.
7. Confirm the persistent anchor remains stable.

Fail if:

- Flow begins moving on selection.
- Flow starts from the wrong word.
- The page jumps unexpectedly.

## Scenario 7: Flow Play Centers Current Word

1. Select `Flow`.
2. Confirm Flow is paused.
3. Press Play or Space.
4. Wait up to 2 seconds.
5. Confirm the current persistent word is centered inside the reading window.
6. Confirm the active cursor attaches to the current word.
7. Confirm the reading window is not left above or below the cursor.

Fail if:

- Flow starts but the reading window does not move to the cursor.
- Cursor appears outside the reading window.
- Flow starts at word `0`.
- Flow starts from a stale prior page.

## Scenario 8: Flow Uses One Cursor Only

1. Start Flow playback.
2. Observe the active word.
3. Confirm there is exactly one active visual indicator.
4. Confirm the active visual is the single-word underline.
5. Confirm there is no second highlight band, background selection, or separate shrink cursor competing with the underline.

Fail if:

- A word underline and a second highlight both appear.
- A red/blue bar or separate cursor appears apart from the word underline.
- Flow uses Narrate-style chunk highlighting.

## Scenario 9: Flow Reading Window Follows Cursor

1. Start Flow playback.
2. Watch for at least 10 word advances.
3. Confirm the active underline remains in the reading window.
4. Confirm text rolls through the stable window.
5. Confirm the window does not lag behind while the cursor advances away.

Fail if:

- Cursor moves faster than the reading window.
- Active word drifts out of the reading window.
- Text stays static while cursor advances.
- Window jumps in large chunks unrelated to word progression.

## Scenario 10: Flow Browse-Away Pauses And Shows Jump Back

1. Start Flow playback.
2. Manually scroll away.
3. Confirm Flow pauses automatically.
4. Confirm `Jump back` appears.
5. Confirm Flow does not keep yanking the view back.
6. Click `Jump back`.
7. Confirm the surface returns to the persistent anchor.
8. Confirm Flow remains paused until Play is pressed again.

Fail if:

- Flow continues playing after manual scroll.
- Jump back does not appear.
- Jump back does not return to anchor.
- Flow resumes automatically after Jump back.

## Scenario 11: Narrate Selection Does Not Auto-Start

1. Start in `Page` mode at the persistent anchor.
2. Click `Narrate`.
3. Confirm Narrate mode is selected.
4. Confirm narration does not start.
5. Confirm Play is enabled.
6. Confirm the persistent anchor remains stable.

Fail if:

- Narration starts on mode selection.
- The app jumps to another page.
- The anchor changes without a hard click.

## Scenario 12: Narrate Starts At Selected Word

1. Select `Narrate`.
2. Press Play or Space.
3. Listen to the first spoken words.
4. Confirm narration begins exactly at the persistent hard-selected word.
5. Confirm the visual cursor is attached to the spoken word.
6. Confirm the reading window follows narration.

Fail if:

- Narration starts one sentence before the selected word.
- Narration starts at word `0`.
- Cursor runs ahead of narration.
- There is a sharp click followed by a jump to a new location.

## Scenario 13: Narrate Browse-Away Continues Audio

1. Start Narrate playback.
2. Manually scroll away.
3. Confirm narration continues.
4. Confirm `Jump back` appears.
5. Confirm the app does not pause Narrate.
6. Click `Jump back`.
7. Confirm the visual surface returns to the narrated/persistent position.
8. Confirm narration continues without restarting from the wrong word.

Fail if:

- Narrate pauses on scroll-away.
- Jump back does not appear.
- Jump back restarts narration at the wrong word.
- Cursor and audio desynchronize after Jump back.

## Scenario 14: Cross-Mode Anchor Handoff

1. Hard-click a new word in Page mode.
2. Switch to Focus.
3. Confirm Focus is paused at that anchor.
4. Switch to Flow.
5. Confirm Flow is paused at that anchor.
6. Switch to Narrate.
7. Confirm Narrate is paused at that anchor.
8. Press Play in Narrate.
9. Confirm narration starts from that exact anchor.
10. Stop or pause Narrate.
11. Switch back to Page.
12. Confirm Page can jump back to the same anchor.

Fail if:

- Any mode starts from a different word.
- Any switch auto-starts playback.
- Any mode consumes a stale `0` anchor.
- Anchor changes without hard click or active playback advancement.

## Scenario 15: New Hard Click Retargets Active Mode

1. Start Narrate or Flow playback.
2. Hard-click a different visible word.
3. Confirm the persistent anchor changes to the clicked word.
4. Confirm active playback retargets to the clicked word.
5. Confirm playback state remains consistent.
6. If mode was playing, it should continue from the new word unless the mode-specific browse-away rule pauses it.
7. If mode was paused, it should remain paused at the new word.

Fail if:

- Click is ignored.
- Click updates highlight but not playback.
- Click causes a jump to a prior sentence.
- Click changes mode state unexpectedly.

## Scenario 16: Button Styling In Page Mode

1. Enter Page mode.
2. Click Focus.
3. Click Page.
4. Confirm Page is the only filled active mode button.
5. Confirm Focus, Flow, and Narrate do not retain strange selected-looking blue outlines or fills.
6. Press Tab until a mode button receives keyboard focus, if the app supports keyboard focus traversal for mode buttons.
7. Confirm keyboard focus is visible but visually distinct from active selected state.

Fail if:

- Any inactive mode button looks active while Page is active.
- Keyboard focus disappears completely.
- Mouse click focus looks the same as selected mode.

## Scenario 17: Console Noise Check

1. Clear console.
2. Select Focus.
3. Press Play.
4. Wait 5 seconds.
5. Pause Focus.
6. Select Flow.
7. Press Play.
8. Wait 5 seconds.
9. Pause Flow.
10. Select Narrate.
11. Press Play.
12. Wait 5 seconds.
13. Inspect console.

Pass if:

- `getEffectiveWords` appears only a small number of times during source changes or mode start.
- There is no continuous repeated stream of `[TTS-7K] getEffectiveWords`.
- There are no repeated `highlightWordByIndex miss: word 0 not in DOM` logs unless anchor is actually word `0`.

Fail if:

- Console floods with `getEffectiveWords`.
- Console repeatedly reports word `0` misses after a nonzero hard selection.
- Console shows repeated relocate skip loops caused by stale anchors.

## Scenario 18: Startup Reopen Behavior

1. Close the reader or return to library.
2. Reopen the same book.
3. Confirm it opens in Page mode.
4. Confirm it opens at or near the persistent last-read word.
5. Confirm mode does not auto-start.
6. Confirm stale CFI does not override the persistent word.
7. Select Narrate and press Play.
8. Confirm Narrate starts from the persistent word.

Fail if:

- Book opens in Focus, Flow, or Narrate.
- Book opens at the wrong stale CFI location.
- Narrate starts from the beginning.
- Page mode opens but persistent anchor is lost.

## Final Report Format

Report each scenario as:

```text
Scenario #: PASS/FAIL
Mode:
Anchor word:
Action:
Expected:
Actual:
Screenshot:
Console notes:
```

Finish with:

```text
Totals:
- Pass:
- Partial:
- Fail:
- Hard failures:

Cross-cutting findings:
1.
2.
3.

Recommended fix priority:
1.
2.
3.
```
