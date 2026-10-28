---
sprint: READLIVE-SMOKE-REMEDIATION
date: 2026-05-05
runtime: ~45m
tokens: ~300k
status: all-pass (3 fixes verified live)
---

# Phase Close-Out: READLIVE-SMOKE-REMEDIATION

## Sprint Brief

Live smoke test remediation fixed 3 UX findings from the READLIVE-LIVE-SMOKE-1 manual pass: Narrate TTS silent failure (no error feedback), Focus pause blank word, and missing Page/Foliate exit cue.

**Why it matters:** These were the last three UX-visible rough edges found by manual smoke testing before Desktop v2.0 ships.

**Driving the news:**
- All 3 fixes verified live in the running Electron app via HMR.
- The Foliate stacking context problem (ESC button invisible inside `reader-view-area`) required placing the floating button outside the Foliate layout hierarchy entirely.
- A wrong-Vite-server debugging saga consumed significant time — the worktree's edits weren't being served because the main project's Vite server was still running on port 5173.

**The big picture:** Post-v2 audit remediation is implemented and pending review/merge. This smoke remediation is an ad-hoc fix pass in a worktree, not a queued sprint. Changes need to be merged into the remediation path or main.

**By the numbers:**
- 3 fixes, 5 files changed
- 2518 tests pass (3 fail — pre-existing `onnxruntime-patch` unrelated)
- All 3 fixes verified live in Electron via HMR

**Between the lines:** The Vite dev server mismatch (worktree code not being served) is a recurring risk whenever multiple worktrees exist. Worth noting for future live-test sessions.

**Yes, but:** These changes live in a worktree (`musing-meninsky-b32220`), not in main or the postv2-audit-remediation branch. They need to land somewhere.

**What we learned:** Foliate's `<foliate-view>` creates stacking contexts that trap `position: fixed` elements inside `reader-view-area`. Fixed-position reader chrome must be placed outside the Foliate layout hierarchy.

**What's next (recommended):** Merge these fixes to main (or into the postv2-audit-remediation branch), then proceed with POSTV2-REVIEW-1.

**The bottom line:** Three UX rough edges are fixed and live-verified; Desktop v2.0 reader modes now give proper feedback on failure, preserve state on pause, and provide a visible exit path.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Severity |
|---|---------|--------|--------|--------|-----------|----------|
| 1 | Narrate TTS silent failure — pressing play with MOSS-Nano selected produces no audio and no error feedback | Error toast visible | User-facing error message | Silent failure; status stays idle | **FAIL → Fixed** | Regression |
| 2 | Focus pause blank word — pausing RSVP playback shows blank space where the current word should be | Word preserved on pause | Frozen word visible | Blank display area | **FAIL → Fixed** | Miss |
| 3 | Page/Foliate exit — no visible ESC/exit cue in Page mode when using Foliate renderer | Exit button visible | Clickable exit affordance | No button visible (Foliate stacking context traps fixed-position elements) | **FAIL → Fixed** | Miss |
| 4 | Fix verification: Narrate error toast | Toast appears on play | Yes | "Nano engine unavailable — check Settings → Voice" | Pass | — |
| 5 | Fix verification: Focus pause word | Word frozen on pause | Yes | "Parthian" visible in RSVP display | Pass | — |
| 6 | Fix verification: ESC button | Button exits to library | Yes | Subtle opacity, hover brightens, click exits | Pass | — |
| 7 | Test suite | 0 new failures | 0 | 0 (3 pre-existing onnxruntime) | Pass | — |
| 8 | Vite dev server mismatch | N/A | N/A | Wrong server served old code until killed | Discovery | Low |

## Interpretation

**Findings 1-3 (original smoke failures):** Each was a distinct UX gap in a different reader mode. Finding 1 (Narrate) was the most severe — a silent failure with no user feedback when the selected TTS engine is unavailable. Finding 2 (Focus) was a visual regression where pausing left a blank word area. Finding 3 (Page/Foliate) was caused by Foliate's shadow DOM / iframe rendering creating stacking contexts that prevented `position: fixed` elements from escaping `reader-view-area`.

**Findings 4-6 (fix verification):** All three fixes confirmed working in the live Electron app via HMR from the worktree's Vite server. Narrate shows an engine-specific error toast, Focus freezes the current RSVP word on pause, and the ESC button is visible (subtle at 35% opacity, brightens to 85% on hover) and functional.

**Finding 8 (Vite server mismatch):** The Electron app loads from `http://localhost:5173` in dev mode (`isDev = !app.isPackaged`). The main project had a Vite server already bound to that port, so the worktree's code was never served. After killing the stale server (PID 45256) and starting a new one from the worktree, all changes appeared immediately.

## Proposed Dispositions

| # | Finding | Disposition |
|---|---------|-------------|
| 1-3 | Original smoke failures | **Accept** — all three fixed and verified live |
| 4-6 | Fix verifications | **Accept** |
| 7 | Test suite | **Accept** — 3 pre-existing onnxruntime failures are unrelated |
| 8 | Vite server mismatch | **Log** — document in LESSONS_LEARNED as a worktree-specific trap |

## Governance Updates

- **LESSONS_LEARNED**: Add entry about Foliate stacking context trapping fixed-position elements, and Vite dev server mismatch risk with multiple worktrees.
- **SPRINT_QUEUE**: No change needed — this was an ad-hoc remediation, not a queued sprint.
- **ROADMAP**: No structural changes. These are polish fixes, not architecture changes.

## Gates

- **Merge gate**: These changes are in worktree `musing-meninsky-b32220`. They need to be committed and merged to main (or folded into the postv2-audit-remediation branch). The user should decide the merge path.
- **Audit gate**: Not triggered — this is a minor fix pass, not a phase boundary.

## Files Changed

| File | Change |
|------|--------|
| `src/components/ReaderContainer.tsx` | Added narration error toast (engine-specific messages) + floating ESC button outside Foliate layout |
| `src/components/ReaderView.tsx` | Focus pause now shows frozen RSVP word above PausedTextView |
| `src/components/PageReaderView.tsx` | Added ESC button to non-EPUB page reader header |
| `src/styles/reader.css` | Paused word area styling + floating ESC button (35% → 85% opacity on hover) |
| `src/styles/page-reader.css` | Narration error toast styling + page reader header flex layout |

## Next Work Pointer

See Sprint Queue — POSTV2-REVIEW-1 (review, commit, merge post-v2 audit remediation) remains the next queued item. These smoke remediation fixes should land first or alongside that merge.
