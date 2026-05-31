# NARRATE-DUAL-SOURCE-DIAG-1 — A4 Mechanism Addendum (hard-click "gravity well")

**Date:** 2026-05-30
**Source:** Evan live observation + second instrumented run (logs pasted in dispatch thread).
**Purpose:** Sharpen the A4 root cause beyond "resume goes back" → it is a self-reinforcing
cycle in which a hard-click resume anchor **overrides all continued progress** for the entire
session. This addendum feeds the refocused NARRATE-INTENT-CURSOR-1 spec.

## The observation (Evan)

> "The hard click now even overrides continued progress — if you pause and play again, it goes
> back to the hard click."

## The vicious cycle (from the second run's logs)

The `resumeAnchor` is set to the hard-click word (66 = "December") and **stays active for the
entire session**, even as audio plays forward to word ~227 (`getPlayingSourceMaxWordIndex`
climbs to 226 while every `resumeAnchor:active-skip` still reads 66):

1. Hard click → `resumeAnchor = 66`; persisted reading position = 66.
2. While the anchor is non-null, `onRelocate` skips **both** the cursor update **and the
   progress-save** (`shouldPersistRelocateProgress` is gated on `!hasResumeAnchor`,
   `ReaderContainer.tsx` ~1276–1282). Evidence: `[TTS-7M] onRelocate: resume anchor active at
   66 — skipping approx 520`.
3. So as audio plays 66 → 227, the **persisted position is frozen at 66** — it never advances.
4. On pause→play (and mode re-entry), `useReaderMode:mode-change` re-seeds the anchor **from the
   frozen 66** → `startCursorDriven:speaking-seed {startIdx:66}` → `speakNextChunkKokoro:seed
   {startIdx:66, word:"December;"}` → restart at the hard click.
5. Back to step 2 — indefinitely.

The only clear-to-null is `ReaderContainer.tsx:1353` (explicit-deselect-with-no-index), which
never fires during normal play. So a hard click stops being "start here **now**" and becomes a
permanent **gravity well** that overrides continued progress.

## Why this matters for the fix (sharpens NARRATE-INTENT-CURSOR-1)

Clearing the anchor's *seed role* is not sufficient on its own — the **progress-save
suppression** must also be broken, or continued progress is still lost across a pause/resume or
mode re-entry (the persisted position would remain frozen). The refocused INTENT-CURSOR-1 must
therefore deliver **two** coupled behaviors:

1. **CONSUME on first word-advance past the anchor** → `resumeAnchor` clears to null once
   narration has advanced beyond it (one-shot intent, not a persistent target).
2. **Restore progress persistence once consumed** → with the anchor null, `onRelocate` resumes
   persisting progress, so the persisted reading position advances with playback; subsequent
   `useReaderMode:mode-change` / pause→play re-seed from the *advanced* position, not the stale
   click.

### Added success criteria for NARRATE-INTENT-CURSOR-1
- After a hard click + play, pausing mid-stanza and resuming **continues from the heard
  position** (±2 words), NOT from the clicked word. (Evan's ear; SRL-070.)
- During playback after a consumed click, the persisted reading position **advances** (no longer
  frozen at the click) — verifiable by a `resumeAnchor:consumed` event firing and `onRelocate`
  no longer logging "resume anchor active … skipping".
- A hard click sets a **one-shot** intent: it is honored for the next chunk start and then
  yields to live progress; it does not re-assert on later resumes or mode switches.

## Cross-reference
- Verdict: `NARRATE-DUAL-SOURCE-DIAG-1.md` (A4 = never-cleared reader-layer resumeAnchor).
- Lifecycle map: `NARRATE-DUAL-SOURCE-DIAG-1-prep.md` §4.
- Decision 4a: `NARRATE-DUAL-SOURCE-DIAG-1-decisions.md`.
