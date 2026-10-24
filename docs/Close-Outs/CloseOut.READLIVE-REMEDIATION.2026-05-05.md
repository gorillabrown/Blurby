---
sprint: READLIVE-REMEDIATION
date: 2026-05-05
branch: reading-mode-live-remediation
commit: cfe6128 fix: remediate reading mode live test findings
status: code-complete; automated gates green; ready for merge/push decision; manual live smoke pending
---

# Phase Close-Out: Reading Mode Live Test Remediation

## Sprint Brief

Reading Mode Live Test Remediation addressed the live Blurby v1.75.1 findings from the Windows EPUB smoke against *Meditations*. The branch tightened the reader contracts that matter most in live use: narration startup truth, EPUB resume accuracy, Flow paused behavior, Focus pause/start polish, Page exit affordance, and cursor visibility.

**Branch:** `reading-mode-live-remediation`

**Commit state:** Implementation committed as `cfe6128 fix: remediate reading mode live test findings`. The branch was clean at CLI closeout; Cowork Wave 2 governance updates may be committed separately or folded into the merge.

## Implementation Summary

The remediation made Narrate startup truthful before audio is confirmed. Startup now separates engine loading, first-audio buffering, active narration, and recoverable TTS error states, with watchdogs around engine warmup and first audio so terminal Kokoro/startup failures do not strand the UI in a false `Narrating` state.

EPUB resume and anchor reconciliation were hardened so saved word progress and Foliate CFI restore cannot silently drift apart. The branch added resume-anchor helpers, mismatch detection, fresh relocation persistence, stale-CFI avoidance, and current Flow anchor capture so reopen and first Flow-to-Narrate transitions preserve the user's real reading position.

Flow now has a paused preview/cursor contract: entering Flow while paused initializes a visible cursor without scheduling advancement, and Up/Down line controls work without leaking browser/page scroll. Focus pause preserves the last word and context, and Focus start paints immediately before any configured advancement delay.

Reader affordances were polished across surfaces. Page mode gained visible exit/home cues, `H` remains the canonical home shortcut, Flow cursor contrast was strengthened, and review hardening closed terminal TTS error handling plus untracked Flow preview timer risks.

## Automated Gates

Focused gates passed during the remediation run, including the representative focused groups below:

| Gate group | Representative files/tests | Result |
| --- | ---: | --- |
| Narration startup and status gates | 3 files / 26 tests | Passed |
| EPUB resume and mode-anchor gates | 3 files / 54 tests | Passed |
| Flow paused preview, line controls, Focus/H-home gates | 4 files / 130 tests | Passed |
| Review-fix targeted gates for TTS terminal errors and Flow preview timers | 2 files / 31 tests | Passed |

Final release gates also passed:

- `npm test`: 173 files / 2552 tests passed.
- `npm run build`: passed with the known circular manual chunk warning `settings -> tts -> settings`.
- `git diff --check`: passed.
- `npm audit --audit-level=high`: exited 0, with only the known moderate `uuid` chain remaining.

## Spec And Quality Review

Solon review: APPROVED.

Plato review: READY after fixes.

Review hardening landed for the two non-trivial findings: selected/current-engine scoping for startup failures and recovery, and Flow preview timer cleanup so paused preview cannot schedule untracked advancement.

## Manual Live Smoke

Manual live smoke was not run in this CLI session and remains pending/manual-required. This closeout does not mark live validation complete.

Pending smoke checklist summary:

- Open the Windows Electron app on the live machine.
- Open the Meditations EPUB from the library.
- Confirm Page restore lands near the stored library progress and does not jump back to the Introduction unexpectedly.
- Enter Flow while paused and confirm the cursor appears immediately.
- Use Up/Down in paused Flow and confirm line movement without page scroll.
- Switch Flow to Narrate and confirm the current anchor is preserved.
- Pause Focus and confirm the current word/context remains visible.
- Confirm Page exposes exit/home affordance and `H` exits reader.
- Confirm Narrate live audio starts, shows truthful loading/buffering states, advances a word cursor, or surfaces a recoverable TTS error.

Narrate live audio still specifically needs confirmation on Windows audio/model availability. Kokoro startup may pass automated state-machine gates while still depending on local model presence and available Windows audio devices.

## Remaining Risk

- Live Kokoro narration depends on local model availability and Windows audio devices.
- Manual live smoke remains required before treating the remediation as live-verified.
- The known moderate `uuid` dependency chain remains.
- The known circular build chunk warning `settings -> tts -> settings` remains.

## Generated Artifacts

`tests/perf-baseline-results.json` was restored/excluded. No generated perf output is intended for the commit.

## Governance Updates

Added a concise lessons-learned entry for the review discovery: engine-specific startup failures/recovery must be scoped to the selected/current engine, and Flow preview must not schedule untracked advancement timers.

Cowork Wave 2 updated the roadmap and sprint queue to record READLIVE-REMEDIATION as code-complete at `cfe6128` while keeping manual live smoke pending. The next recommended pointer is `READLIVE-LIVE-SMOKE-1`, a narrow Windows manual validation pass for live Kokoro audio and reader behavior.

## Disposition

Accept the implementation subject to pending manual live smoke. The automated evidence is green, the quality reviews are approved/ready after fixes, and the remaining work is live-environment validation rather than another code pass.
