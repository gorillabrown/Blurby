# TTS-INTEGRATE-1 Close-Out - Integrate TTS Sync And Diagnostics Stack

**Date:** 2026-05-15
**Branch:** `sprint/tts-integrate-1-sync-diag-main`
**Worktree:** `C:\tmp\Blurby-tts-integrate-1`
**Decision:** BLOCKED at broad verification. Do not commit, push, or merge until the MOSS Nano performance-probe gate is resolved or explicitly waived.

## Sprint Brief

**Goal:** Land the already-complete TTS-SYNC-1 and stacked TTS-DIAG-1 branches into canonical `main` from a clean integration context.
**Result:** The clean integration worktree merged sync first and diagnostics second, and focused verification passed, but full `npm test` failed in `tests/mossNanoProbe.test.js`.
**Learned:** The known resource-sensitive MOSS Nano probe is now a hard integration blocker, not just closeout noise.
**Recommend:** Keep `TTS-INTEGRATE-1` open/blocked and run the probe-stabilization work as the unblocker against the integration branch/worktree context.
**Bottom line:** The stack merge is technically clean, but the sprint is blocked because the required broad gate failed.

## Summary

TTS-INTEGRATE-1 created a clean integration worktree at `C:\tmp\Blurby-tts-integrate-1`, merged `origin/sprint/tts-sync-1-highlight-controller` first, then merged stacked `origin/sprint/tts-diag-1-diagnostics-bundle`. The integration branch reached `594abd4` (`Merge TTS-DIAG-1 diagnostics bundle`) and is ahead of `origin/main` by 4 merge/source commits.

The sprint stopped correctly before commit, push, or merge because the full-suite gate failed in the already-identified resource-sensitive MOSS Nano performance lane.

## Verification

- Focused sync verification passed: 9 files / 94 tests.
- Focused diagnostics verification passed: 4 files / 18 tests.
- `npm run typecheck` passed.
- `npm run build` passed with the existing settings/tts circular chunk warning.
- Full `npm test` failed: 184 files total, 183 passed; `tests/mossNanoProbe.test.js` failed 3 performance-class tests; 2603 / 2606 tests passed.
- `git diff --check` was not run because the full-suite gate failed.
- Generated `tests/perf-baseline-results.json` was restored.

## Repository State

- Branch: `sprint/tts-integrate-1-sync-diag-main`
- HEAD: `594abd4` (`Merge TTS-DIAG-1 diagnostics bundle`)
- Ahead of `origin/main` by 4 merge/source commits.
- Uncommitted governance changes remain in the integration worktree: `CLAUDE.md`, `ROADMAP.md`, `docs/governance/SPRINT_QUEUE.md`, plus deletion of the transient TTS-DIAG governance staging memo.
- No commit, push, or merge to `main` was performed.

## Disposition

- `TTS-INTEGRATE-1` remains active and blocked at broad verification.
- The stack integration itself appears clean based on merge completion plus focused sync/diagnostics verification.
- `TEST-HARNESS-1` becomes the unblocker and should run against the integration branch/worktree context, not stale canonical `main`.
- Canonical governance must not mark TTS-SYNC-1 or TTS-DIAG-1 as landed on `main` until the integration branch is committed, pushed, and merged or PR-approved.

