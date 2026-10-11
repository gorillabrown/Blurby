# G0 owner checklist — heard audio and residual live checks (READER-MODE-SEPARATION-2)

This is the human half of the G0 admission gate. The automated matrix already recorded every mode
transition, position and cursor count on the baseline build (B0). See `admission/g0-matrix.json`.
What remains needs your ears and eyes. **About 20 minutes. Headphones on.**

Record your answers in `g0-owner-observations.json`, next to this file. Fill every `observed` field
and every `result` field. Then write "done" in the `Answer:` slot of the BLOCKER in
`docs/planning/epics/2026-10-09-reader-mode-separation-2/state.md`.

## Setup (once)

1. Open PowerShell 7 and run:
   ```
   cd C:\Projects\Blurby\.worktrees\reader-mode-separation-2
   pwsh -File docs\planning\roadmap-reviews\reader-mode-separation-2\admission\owner-launch.ps1
   ```
   This opens the **baseline** Blurby in a throwaway profile. Your real library is untouched; the
   script checks that when you close the window.
2. Put in `g0-owner-observations.json`: your name (observer), the headphone device, and today's date.
3. The library has three test books: **G0 Bundled Meditations** (EPUB), **G0 Converted Two Chapters**
   and **G0 Converted Plain Text** (both non-EPUB text converted on import).
4. Each item below starts with the same steps: open the book from the library (it opens in Page),
   click **Flow** (the text appears with words), then click the word named in the item.

## Items

Each item has the same answer fields: *observed* (what you heard and saw, in a sentence or two) and
*result* (`as-expected`, `known-defect:<id>`, or `new-problem`).

### Narrate on the EPUB (G0 Bundled Meditations)

- **H1 — start at the first word.** Click the **first word of the text**. Click **Narrate**, then
  **Play**. Does speech begin at that word? Is the moving highlight ahead of the voice?
  - The known cursor-lead defect is `KD-CURSOR-LEAD`.
- **H2 — start mid-paragraph.** Pause. Click the **8th word** of the same paragraph. Click **Play**.
  What is the first word you hear?
- **H3 — pause and resume.** After a few seconds, **Pause**. Wait 3 seconds. **Play**. Does speech
  continue from where it stopped, rather than restarting the sentence or jumping ahead?
- **H4 — rate change.** While it speaks, click the **1.4x** speed button. Listen for 5 seconds,
  then click **1.0x**. Do you hear two voices overlapping, missing words, or new pauses?
  - The known overlap defect is `KD-RATE-1.4-OVERLAP`.
- **H5 — section change.** Pause. In Flow, click a word in the **last line of the first text
  section** ("BOOKS"). Click **Narrate**, then **Play**. Does narration carry on into the next
  section without skipping or stopping?

### Narrate on the non-EPUB (G0 Converted Two Chapters)

- **H6 — start, pause/resume, rate.** Repeat H1–H4 on this book.
- **H7 — chapter change.** Click a word in the **last line of Chapter One** and narrate across into
  Chapter Two. Is the transition clean?
- **H8 — end of book.** Click a word in the **last line of Chapter Two** and narrate to the end of
  the book. What happens at the end (stops, returns to Page, moves to another book)?

### Visual checks (no audio)

- **V1 — Flow scroll-away and return.** In Flow, press **Play**. Scroll the text with the mouse wheel
  or trackpad. Does Flow pause and offer **Return to reading**? Click it. Does it return to the
  reading position?
  - Automation could not trigger this with a synthetic wheel (`OBS-A3-4`).
- **V2 — Narrate to Page highlight.** Click the 8th word in Flow. Click **Narrate** (do not play),
  then **Page**. Which word is highlighted?
  - Automation saw the highlight land on the first word while the saved position stayed on the
    8th (`OBS-A3-1`).
- **V3 — Next chapter during Narrate.** In Narrate (playing or paused) on the EPUB, click the **›**
  next-chapter arrow in the bottom bar. Does the chapter change?
  - Automation saw no change (`OBS-A3-5`).

## When finished

Close the Blurby window. The script prints `Live profile unchanged: True/False`. Paste that line into
the observations file (`liveProfileUnchanged`), and keep the printed profile folder (do not delete it).
