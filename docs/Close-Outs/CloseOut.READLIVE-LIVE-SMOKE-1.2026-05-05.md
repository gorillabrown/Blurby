---
sprint: READLIVE-LIVE-SMOKE-1
date: 2026-05-05
branch: reading-mode-live-remediation
baseline-commit: cfe6128 fix: remediate reading mode live test findings
status: smoke-complete; 5 PASS, 2 QUALIFIED, 1 FAIL; remediation NOT live-verified
---

# Manual Live Smoke: READLIVE-LIVE-SMOKE-1

## Environment

- **Machine:** Windows 11 Home (10.0.26200)
- **Worktree:** `C:\tmp\Blurby-worktrees\reading-mode-live-remediation` at commit `cfe6128`
- **App launch:** `npx electron .` from worktree (dev mode)
- **Book under test:** *Meditations* by Marcus Aurelius (EPUB)
- **TTS engine configured:** `nano` (MOSS-Nano) per `settings.json`
- **Kokoro model present:** Yes (`$APPDATA/Blurby/models/onnx-community/Kokoro-82M-v1.0-ONNX`, 292MB)

## Smoke Results Summary

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1 | Page restore lands near stored library progress | **PASS** | Library showed 1%, reader opened to INTRODUCTION at ~2%. Within tolerance. |
| 2 | Flow paused preview: cursor appears immediately | **PASS** | Reading zone gradient visible on Flow entry while paused. Cursor present (subtle underline, too thin for screenshot capture but functionally present). |
| 3 | Up/Down in paused Flow: line movement without page scroll | **PASS** | 3x Down arrow moved exactly 3 lines. No page/browser scroll observed. |
| 4 | Flow-to-Narrate anchor preserved | **PASS** | Position at "consular Annius Verus" passage preserved across mode switch from Flow to Narrate. |
| 5 | Focus pause: current word/context visible | **QUALIFIED** | "Resume reading" button visible in Focus pause state. However, the word display area goes blank on pause rather than preserving the last word visually. Functional but not fully meeting the "word/context remains visible" claim. |
| 6 | Page exit/home affordance and H key | **QUALIFIED** | Focus mode shows "ESC" cue in header. Page mode has no visible exit button or home affordance. H key shortcut was not present in this branch. Escape key could not be tested due to Claude computer-use overlay intercepting it. |
| 7 | Narrate live audio: truthful loading/buffering states | **FAIL** | TTS engine is set to `nano` (MOSS-Nano) in settings, not `kokoro`. Pressing play in Narrate mode produces no audio AND no visible feedback (no loading spinner, no buffering state, no error message). The UI stays in the paused state with no indication that anything failed. This contradicts the remediation's "truthful startup states" claim. |
| 8 | Reopen position: library and reader agree after close/reopen | **PASS** | Closed app, relaunched. Library showed 1%. Reopened Meditations: landed on INTRODUCTION at 1%, same page content with "consular Annius Verus" visible. Position consistent. |

## Detailed Findings

### Check 7 — Narrate TTS (FAIL)

This is the critical finding. The READLIVE-REMEDIATION closeout claims:

> Startup now separates engine loading, first-audio buffering, active narration, and recoverable TTS error states, with watchdogs around engine warmup and first audio so terminal Kokoro/startup failures do not strand the UI in a false Narrating state.

However, with `ttsEngine: "nano"` and MOSS-Nano not running/available, pressing play in Narrate mode:

1. Produces no audio output
2. Shows no loading/buffering indicator
3. Shows no error message or recovery option
4. Leaves the UI in a paused state with no feedback

The remediation's startup state machine and watchdogs appear to be Kokoro-specific. When a different engine is selected but unavailable, the "truthful startup" contract is not honored.

**Root cause hypothesis:** The narration startup truth machinery (loading, buffering, watchdog states) is wired to Kokoro engine events. The Nano engine path either bypasses this machinery or its failure mode is not caught by the watchdogs.

**Possible resolutions:**
- (a) Switch `ttsEngine` to `kokoro` in settings and retest to confirm the Kokoro-specific path works correctly
- (b) File the silent Nano failure as a remediation gap requiring engine-agnostic startup truth
- (c) Accept as out-of-scope: the remediation targeted Kokoro startup truth specifically, and Nano is a separate engine with its own availability contract

### Check 5 — Focus Pause (QUALIFIED)

Focus pause shows "Resume reading" correctly, but the word display area blanks out rather than preserving the last-shown word. The remediation claims "Focus pause preserves the last word and context." The functional contract (pause works, resume works) is met, but the visual preservation of the word is not observed.

### Check 6 — Page Exit (QUALIFIED)

The remediation claims "Page mode gained visible exit/home cues." In the live app:
- Focus mode correctly shows "ESC" header cue
- Page mode shows no visible exit button, home icon, or navigation cue
- The `H` shortcut for home is not active in this branch
- Escape could not be tested (Claude overlay intercepts it)

## Disposition

**The smoke does NOT pass cleanly.** The remediation cannot be marked as live-verified due to:

1. **FAIL on Check 7 (Narrate TTS)** — No audio AND no visible error/loading state when the configured engine (Nano) is unavailable. The "truthful startup" claim is not met for the active engine configuration.
2. **Two QUALIFIED results** that represent partial fulfillment of remediation claims.

### Recommended Next Steps

1. **Retest TTS with Kokoro selected** — Switch `ttsEngine` to `kokoro` in settings.json and rerun Check 7 to determine if the Kokoro-specific startup truth machinery works as designed.
2. **Scope decision on Nano startup truth** — Decide whether the remediation's "truthful startup" contract was intended to be engine-agnostic or Kokoro-specific. If engine-agnostic, file the Nano silent failure as a bug.
3. **Focus word preservation** — Verify whether Focus pause word visibility is a CSS/rendering timing issue or a genuine gap in the implementation.
4. **Page exit affordance** — Verify whether the Page exit cues were implemented but not visible in this configuration, or if they were not implemented.

## Test Execution Notes

- Mode switching via Shift+Space (cycles Page/Focus/Flow/Narrate button highlight) then Space (activates the mode). Direct bottom-bar button clicks were unreliable due to coordinate precision.
- Claude computer-use overlay intercepts Escape key, preventing testing of Escape-based exit functionality.
- Two Blurby processes observed (PIDs 26144, 33512) during testing; did not affect results.
- Screenshots captured throughout but Flow cursor (.flow-shrink-cursor) is too subtle (thin underline) for screenshot verification.
