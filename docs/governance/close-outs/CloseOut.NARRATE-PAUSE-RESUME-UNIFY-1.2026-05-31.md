# Close-Out: NARRATE-PAUSE-RESUME-UNIFY-1

**Date:** 2026-05-31  
**Result:** Source-complete, merged to `main`; live A4 retest still recommended.

## Summary

`NARRATE-PAUSE-RESUME-UNIFY-1` landed the pause-time resume target and unified resume seed priority needed for the A4 pause/resume repair. A follow-up hotfix corrected the reader-layer bypass: bottom-bar Narrate Play/Pause now uses one Narrate lifecycle instead of stopping narration and cold-starting from a stale hard-click anchor.

## Commits

- `db2d1bc` — Merge `sprint/narrate-pause-resume-unify-1`: `resumeTargetRef` capture-at-pause plus unified resume seed.
- `1299808` — Merge anchor-correctness hotfix, including bottom-bar resume routing and deferred startup warm-up.
- `3d1c836` — Hotfix implementation commit: unified Narrate anchor/resume path plus Kokoro background startup deferral.

## What Changed

- `pause()` captures the heard/live resume target before strategy pause can clear scheduler state.
- Resume seed priority now protects the heard/resume target from stale reader-layer anchors.
- Bottom-bar Narrate pause/resume no longer bypasses `useNarration.resume()` through a cold restart.
- Narrate truth-sync publishes live persistent anchor progress without rearming resume intent on ordinary mode advancement.

## Verification

- `npm test` passed: 3,065 passing, 133 skipped.
- `npm run typecheck` passed.
- `npm run build` passed.
- `git diff --check` passed before commit.

## Remaining Gate

Run the live A4 gate again before declaring the user-facing defect fully closed: play for about 15 seconds, pause, resume, and confirm 3-of-3 cycles continue from the pause position rather than the original clicked anchor.
