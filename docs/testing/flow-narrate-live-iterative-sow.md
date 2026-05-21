# Flow/Narrate Live Iterative SOW

**Purpose:** Provide one exhaustive live test loop for Flow and Narrate zone behavior, including the current May 20 regressions around zone tracking, mode continuity, TTS playback sync, and screenshot capture reliability.

**Scope:** Desktop Electron app, real rendered EPUB content, Flow mode, Narrate mode, and Kokoro playback when the local model is available.

**Out of scope:** Browser-only harness behavior, Web Speech fallback quality, Qwen, MOSS/Pocket, export features, and non-TTS reader UI polish.

## 1. Success Definition

This SOW is complete only when the same book passes three consecutive live iterations without a CRIT or HIGH failure.

Required pass conditions:

- Flow starts with the active zone around 15% down the visible page.
- Flow descends naturally through the visible page while playing.
- Flow performs an instant viewport/page jump when the active zone bottom crosses roughly 67% of the visible page.
- After each jump, the active zone resets to the top reading position and resumes descending.
- Flow, Narrate, and Flow again preserve continuity across mode switches.
- Narrate with Kokoro playback keeps the active box aligned to spoken progress.
- Trusted word timing, when available, visibly advances the active word; without trusted timing, the chunk highlight remains truthful and no fake word progress appears.
- User scroll/browse-away is allowed, and recenter returns the active sentence/chunk to the top of the active reading box.
- Bug-report screenshots preview correctly and saved PNGs are fresh captures, not stale duplicates.

## 2. Test Matrix

Run the full loop across this minimum matrix:

| Dimension | Required Values |
|---|---|
| Window size | Fullscreen, medium window, narrow/truncated window |
| Zone | Upper, Center, Lower |
| Mode path | Flow only, Flow -> Narrate -> Flow, Narrate only |
| Playback | Flow visual play, Narrate + Kokoro TTS if model is downloaded |
| Speed | 1.0x, 1.1x, 1.2x |
| Book position | Start of book, mid-book paragraph, near section/chapter boundary, final page/chunk |

If time is limited, prioritize fullscreen + Center zone + 1.0x and 1.1x first because that path reproduces the current user-facing failures most clearly.

## 3. Required Instrumentation

Before each iteration, record:

- Date and tester:
- Branch and commit:
- App version:
- Book title and extension:
- Window size:
- Zone:
- Speed:
- Reading mode:
- TTS engine and voice:
- Kokoro readiness:
- DevTools open: yes/no:

During each iteration, collect:

- Screenshot at start of Flow playback.
- Screenshot immediately before the 67% threshold crossing if practical.
- Screenshot immediately after the jump/reset.
- Screenshot after Flow -> Narrate -> Flow.
- Screenshot during Narrate + Kokoro playback.
- Bug-report JSON and PNG if any failure occurs.
- Console lines containing `scroll-follow`, `word-boundary`, `chunk`, `rate`, `pipeline`, `Maximum update depth`, `screenshot`, or `capture`.

## 4. Iteration Loop

Each iteration uses this exact loop. Do not skip steps inside a round; mark unavailable steps as `SKIP` with a reason.

### Step A: Setup

1. Launch the desktop Electron app.
2. Open a prose-heavy EPUB with enough text to span multiple visible pages.
3. Confirm Kokoro is selected and ready if Narrate + TTS will be exercised.
4. Set the zone to the value under test.
5. Set speed to the value under test.
6. Start at the book position under test.

Expected result:

- The rendered surface is stable.
- The current active word/chunk can be identified.
- No stale highlight or duplicate cursor is visible before pressing Play.

### Step B: Flow Start And Descent

1. Enter Flow mode.
2. Press Play.
3. Confirm the active highlighted zone starts around 15% down the page.
4. Let playback continue until the active zone visibly descends.

Expected result:

- The highlighted zone is not pinned to the absolute top of the book.
- The active text remains readable and visually controlled.
- Active-word or WPM-driven progress is visible according to Flow's clock.

Fail if:

- The first active chunk cannot move into the selected zone because there is no synthetic leading space.
- The active zone starts too low or too high for the selected zone.
- The text block remains static while playback advances.

### Step C: Flow Threshold Jump

1. Continue Flow playback until the zone bottom crosses roughly 67% of the visible page.
2. Watch the viewport/page transition.
3. Confirm the jump is instant.
4. Confirm the zone resets to the top reading position after the jump.

Expected result:

- The transition is fast and deliberate, not a slow drift.
- After the jump, the active text starts near the top of the reading path and descends again.
- No duplicate cursor appears.

Fail if:

- The active zone remains stuck at the bottom.
- The jump happens too early or too late by a visibly large margin.
- The reset loses the active chunk/word neighborhood.

### Step D: Flow -> Narrate -> Flow Continuity

1. While Flow is active, switch to Narrate.
2. Confirm the Flow cursor is removed or suppressed.
3. Confirm Narrate keeps the same active chunk/word neighborhood.
4. Switch back to Flow.
5. Confirm Flow resumes from the same active area without a stale Narrate highlight.

Expected result:

- One visual owner is active at a time.
- No duplicate cursor, stale band, or ghost highlight remains.
- The user does not lose their place.

Fail if:

- Flow and Narrate cursors both render.
- Mode switching jumps to a stale word.
- The old mode continues to drive the visual state after switching.

### Step E: Narrate With Kokoro Playback

Run this step only if Kokoro is downloaded and ready.

1. Enter Narrate mode.
2. Press Play.
3. Listen for TTS audio.
4. Watch the active chunk box for 60 seconds.
5. Confirm the box follows spoken progress.
6. Confirm the active word advances only when trusted word timing exists.

Expected result:

- Audio starts and continues.
- The active box moves with narration.
- Trusted word timing visibly drives the active word.
- Chunk-only fallback remains truthful if timing is unavailable.

Fail if:

- Audio plays but the visual box stays behind.
- The visual box moves without matching audio progress.
- The active word advances from a fake timer when trusted timing is absent.
- Speed changes cause crackle, long gaps, or stale runtime rate.

### Step F: User Browse-Away And Recenter

1. While Flow or Narrate is active, scroll away from the active box.
2. Confirm the app allows user browsing and does not immediately yank the view back.
3. Click the recenter control.
4. Confirm the active sentence/chunk start aligns to the top of the reading box.
5. Resume normal following.

Expected result:

- Browse-away is respected.
- Recenter is clickable and visibly effective.
- Recenter uses chunk/sentence start alignment, not just "somewhere near the active word."

Fail if:

- The button is present but not clickable.
- Clicking does nothing.
- Recenter lands on the wrong line or stale chunk.

### Step G: Screenshot/Bug Report Capture

1. Open the bug-report modal.
2. Confirm the screenshot preview renders inside the modal.
3. Save a report.
4. Confirm the JSON references a screenshot file.
5. Confirm the PNG is a fresh capture and not byte-identical to the prior report unless the screen truly did not change.

Expected result:

- The modal preview is not broken.
- The saved PNG exists and opens.
- Consecutive screenshots differ when the visible screen differs.

Fail if:

- The preview image is broken.
- The modal says no screenshot saved while JSON references one.
- The saved PNG is stale or duplicated from an earlier capture.

## 5. Accuracy Measurements

Record these per run:

| Measurement | Target |
|---|---|
| Initial Flow zone top | Around 15% down visible page for the top-zone behavior under test |
| Flow jump threshold | Trigger when active zone bottom crosses roughly 67% visible page height |
| Post-jump reset | Active zone returns to top reading position within one visible frame |
| Narrate visual lag | No persistent visible lag between spoken progress and active box |
| Active-word timing | Trusted timing only; no invented per-word progress |
| Recenter accuracy | Active sentence/chunk start lands at the top of the reading box within visible tolerance |
| Screenshot freshness | New capture hash changes when visible state changes |

Use pixel-level automated checks when available, but live observation is valid for this SOW because the failure class is currently visible UX drift.

## 6. Iteration Exit Rules

After each full loop:

- If all checks pass, repeat with the next matrix combination.
- If one MED/LOW issue appears, continue the loop and log it.
- If any CRIT/HIGH issue appears, stop the iteration and file an implementation-ready bug.
- If the same CRIT/HIGH issue appears twice, stop the SOW and route it to the active bug-fix lane.

## 7. Bug Routing

Route findings as follows:

- Zone start, jump, reset, or synthetic leading/trailing space failures: Flow/Narrate visual sync bug.
- Narrate box not tracking spoken progress: Narrate timing/sync bug.
- Trusted word not advancing: timing metadata or HighlightSyncController bug.
- Word advancing without trusted timing: timing truth policy bug.
- Flow cursor surviving into Narrate: visual ownership regression.
- Speed changes causing gaps/crackle/stale rate: Kokoro rate/runtime coherence bug.
- Broken preview, stale duplicate PNG, or missing screenshot: bug-report capture bug.
- Sentence/chunk boundaries wrong: natural chunking or narration planner bug.

## 8. Final SOW Closeout

At the end, produce this summary:

```md
## Flow/Narrate Live Iterative SOW Summary
- Date:
- Branch / commit:
- Tester:
- Book:
- Result: pass / pass with issues / blocked
- Iterations completed:
- Matrix coverage:
- CRIT:
- HIGH:
- MED:
- LOW:

### Confirmed Passes
- ...

### Bugs To Elevate
- ...

### Evidence
- screenshots:
- bug-report JSON:
- console excerpts:
- timing notes:
```
