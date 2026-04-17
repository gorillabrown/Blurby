# TTS Live Bug Sweep Checklist

Use this checklist for a real Electron-app live QA pass after automated gates are green. This document is the human bug-bash companion to the `TTS-EVAL-*` harness lane and is designed to produce implementation-ready findings for `TTS-RATE-1`, `EPUB-TOKEN-1`, and any runtime hotfix follow-up.

This checklist is for:

- subjective audio quality
- narration and Flow relationship
- button, toggle, and slider control behavior
- visual consistency of controls and state indicators
- speed-change UX
- cache, settings, and persistence behavior
- section, chapter, and book handoff behavior
- EPUB styled-token fidelity
- reliability and recovery defects that automated traces may not surface

This checklist is not a replacement for the eval harness. Run automated preflight first, then use this document to collect live findings.

## Scope

Environment:

- Desktop Electron app only
- Real Kokoro pipeline
- OS-default audio output only

Out of scope:

- browser harness-only validation
- Bluetooth routing or device-picker testing
- future MediaSession or headset transport behavior
- release closeout gates already covered by `TTS_EVAL_RELEASE_CHECKLIST.md`

## Result Markers

Use these consistently:

- `PASS` = behavior matches expectation
- `FAIL` = reproducible defect
- `PARTIAL` = usable but clearly degraded
- `SKIP` = not exercised

Severity:

- `CRIT` = blocks release or makes narration unusable
- `HIGH` = major UX degradation
- `MED` = noticeable but tolerable
- `LOW` = cosmetic or polish

Shared capture vocabulary:

- warm or uncached startup time felt: `<200ms / ~500ms / ~1s / >1s / severe`
- warm or cached startup time felt: `<200ms / 200-500ms / >500ms`
- control response quality: `instant / slight delay / laggy / broken`
- control visual consistency: `consistent / minor mismatch / confusing / broken`
- sync quality: `tight / slight offset / visible drift / severe`
- speed quality: `acceptable / borderline / bad`
- seam quality: `seamless / micro-gap / obvious seam / restart-like`
- tokenization behavior: `stitched / split visually only / split functionally / broken`

## 1. Run Metadata

Record this before starting:

- Date:
- Branch:
- Commit:
- App version:
- Tester:
- OS:
- Audio output device:
- Kokoro voice:
- Default speed:
- Primary prose book:
- Primary decorative EPUB:
- Secondary decorative EPUB:

## 2. Automated Preflight

Primary lane: runtime follow-up / hotfix

Required baseline before live QA:

- `npm run typecheck` passes
- `npm test` passes
- `npm run build` passes
- `npm run tts:eval:matrix:gated -- --run-id <id> --out <dir>` passes
- `gate-report.txt` status is `PASS`

Attach or note:

- gated artifact directory:
- startup p50:
- startup p95:
- drift p50:
- drift p95:
- drift max:
- pause/resume failures:
- handoff failures:

If any preflight item fails, stop and log that first instead of continuing with subjective QA.

## 3. Session Setup

Primary lane: runtime follow-up / hotfix

Before starting the live sweep:

- Launch the built Electron app, not the browser harness.
- Confirm Kokoro is active, not Web Speech fallback.
- Confirm the model is already available locally if you plan to exercise offline behavior.
- Use one prose-heavy EPUB with punctuation variety.
- Use one book with at least 3 sections or chapters for handoff testing.
- Use two decorative EPUBs that contain styled split-token patterns.
- Keep DevTools closed during the main listening pass unless you are checking a specific timing issue.

Recommended content mix:

- long-form prose for pacing and seams
- dialogue-heavy text for pause quality
- decorative EPUB with drop caps or split inline styling
- decorative EPUB with a second styling pattern beyond drop caps

## 4. Core Startup and Control Sanity

Primary lane: runtime follow-up / hotfix

Goal: confirm the app is stable enough for deeper QA.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| LIVE-START-01 | Open a new uncached book and press play/narrate | Audible audio begins within a usable delay; record current feel against target | CRIT |
| LIVE-START-02 | Stop, reopen the same position after cache exists, and start again | Cached restart feels materially faster than uncached start | CRIT |
| LIVE-START-03 | Pause and resume after 1-2 seconds | Resume is exact and interruption-free | CRIT |
| LIVE-START-04 | Pause and resume after 20-30 seconds | Resume is still correct; no restart from an earlier point | HIGH |
| LIVE-START-05 | Stop narration and start again from current position | Restart uses the current reading position, not a stale earlier point | HIGH |
| LIVE-CTRL-01 | Use play/pause from the app UI during active narration | Controls respond immediately and state remains coherent | HIGH |
| LIVE-CTRL-02 | Use `N` while in Flow | Toggles narration without breaking Flow state | HIGH |
| LIVE-CTRL-03 | Pause, change nothing, then resume after a delay | Pause state remains stable and resumable | HIGH |
| LIVE-CTRL-04 | Click the bottom-bar mode or narration control buttons repeatedly but deliberately | UI state always matches the actual reader state; no ghost-active button or stale icon | HIGH |
| LIVE-CTRL-05 | Use stop, then click play again from the app UI | Stop fully ends playback and the next play starts a fresh active session from the expected position | HIGH |

Capture:

- warm or uncached startup time felt:
- warm or cached startup time felt:
- control response quality:
- control visual consistency:
- controls state quality:
- notes:

## 5. Flow and Narration Sync

Primary lane: flow-sync follow-up

Goal: verify the current product model where narration follows the Flow layer.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| LIVE-FLOW-01 | Start narration while in Flow | Flow becomes the active visual reading layer during narration | CRIT |
| LIVE-FLOW-02 | Watch cursor/highlight for 30-60 seconds at `1.0x` | Visual movement is stable and tracks spoken progress without obvious jumping | CRIT |
| LIVE-FLOW-03 | Let narration cross a section or chapter boundary in Flow | Handoff is smooth; Flow remains visually coherent | CRIT |
| LIVE-FLOW-04 | Pause during Flow narration | Visual position freezes exactly where narration stops | HIGH |
| LIVE-FLOW-05 | Resume during Flow narration | Flow resumes from the same visual or word position | HIGH |
| LIVE-FLOW-06 | Navigate away from the book and back while narration state is active if supported | Active position is preserved; no blank or invalid surface | HIGH |
| LIVE-FLOW-07 | Open narrated content from the library after it was recently active | Reader surface loads cleanly; no blank-screen regression | CRIT |

Capture:

- sync quality:
- any cursor jump:
- any mismatch between spoken and indicated position:
- any blank-screen or stuck-surface event:
- when it happens: `chunk boundary / speed change / section handoff / chapter handoff / unknown`
- notes:

## 6. Audio Seam and Punctuation Quality

Primary lane: runtime follow-up / hotfix

Goal: catch issues that automated traces cannot hear.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| LIVE-AUDIO-01 | Listen through the first 20-30 seconds of a new narration run | No pops, dead air, or obvious seam between startup chunks | CRIT |
| LIVE-AUDIO-02 | Continue listening for 2+ minutes | Quality stays stable over time; no cumulative roughness | HIGH |
| LIVE-AUDIO-03 | Listen through punctuation-heavy prose | Comma, clause, sentence, and paragraph pacing are audibly distinct and subjectively natural enough | HIGH |
| LIVE-AUDIO-04 | Listen at a section or chapter handoff | Transition sounds continuous and not restart-like | HIGH |
| LIVE-AUDIO-05 | Listen after a pause/resume cycle | Voice quality and timing remain stable after resume | HIGH |

Capture:

- seam quality:
- comma pause quality:
- sentence pause quality:
- paragraph pause quality:
- audible issues:
- notes:

## 7. Speed Ladder

Primary lane: `TTS-RATE-1`

Goal: identify the first objectionable speed and isolate whether the problem is pitch, tempo, sync, transition roughness, or all four.

Test these speeds in one continuous session:

- `1.0x`
- `1.1x`
- `1.2x`
- `1.3x`
- `1.4x`
- `1.5x`

Then sweep back down to `1.0x` without restarting the app.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| LIVE-RATE-01 | Start at `1.0x` and listen for baseline quality | Voice sounds natural and stable | CRIT |
| LIVE-RATE-02 | Change from `1.0x` to `1.1x` during active narration | Change applies without restart; note quality impact | HIGH |
| LIVE-RATE-03 | Sweep upward to `1.5x` in `0.1` steps | No restart; identify the first speed where pitch becomes objectionable | CRIT |
| LIVE-RATE-04 | Sweep downward back to `1.0x` | No stale state, restart, or cursor desync | HIGH |
| LIVE-RATE-05 | Rapidly change speed 3-5 times during one paragraph | App stays stable; note any sync jump or rough transition | HIGH |

Per-speed capture table:

| Speed | Speed quality | Pitch quality | Tempo quality | Fatigue / harshness | Cursor sync | Restart or rebuffer feel | Notes |
|-------|---------------|---------------|---------------|---------------------|-------------|--------------------------|-------|
| 1.0x |  |  |  |  |  |  |  |
| 1.1x |  |  |  |  |  |  |  |
| 1.2x |  |  |  |  |  |  |  |
| 1.3x |  |  |  |  |  |  |  |
| 1.4x |  |  |  |  |  |  |  |
| 1.5x |  |  |  |  |  |  |  |

Record explicitly:

- first speed where pitch becomes objectionable:
- first speed where tempo becomes objectionable:
- first speed where sync becomes objectionable:
- whether transition roughness appears before pitch issues:
- whether button or slider interaction ever caused hidden restart behavior:

## 8. Cache, Settings, and Persistence

Primary lane: runtime follow-up / hotfix

Goal: exercise already-shipped Kokoro and cache behaviors that are still regression-prone.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| LIVE-CACHE-01 | Compare uncached start vs cached restart on the same book and same position | Cached restart is clearly faster and behaves consistently | CRIT |
| LIVE-CACHE-02 | Change speed, stop, then restart from the same position | Cache is not invalidated unexpectedly by speed change alone | HIGH |
| LIVE-CACHE-03 | Change voice and replay the same paragraph | Regeneration happens cleanly for the new voice with no broken stale cache behavior | HIGH |
| LIVE-CACHE-04 | Change a relevant TTS setting, restart the app, and reopen the book | Setting persists across restart | HIGH |
| LIVE-CACHE-05 | Pause mid-book, close the app, relaunch, and return to the same book | Position behavior is sensible and reproducible | HIGH |
| LIVE-CACHE-06 | Stop narration, leave the book, reopen the same book, and start again | Reopen behavior uses the expected saved position | HIGH |
| LIVE-CACHE-07 | Change a TTS setting using the actual UI control, then verify the visible control value after restart | Button, toggle, or slider state is persisted and reloaded correctly | HIGH |

Capture:

- cached-start behavior:
- speed-change cache behavior:
- voice-change regeneration behavior:
- settings persistence behavior:
- settings control persistence behavior:
- pause-position persistence behavior:
- reopen-the-same-book behavior:
- notes:

## 8A. Button, Toggle, and Slider Interactions

Primary lane: runtime follow-up / hotfix

Goal: verify that visible controls do what they claim and that UI interactions match underlying playback state.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| LIVE-UI-01 | Click play/pause in the bottom bar while observing active playback state | Button state, icon state, and actual playback state stay in sync | HIGH |
| LIVE-UI-02 | Click stop from the UI if exposed, then click play again | Stop fully clears active playback and play starts from the expected position | HIGH |
| LIVE-UI-03 | Click a speed increase or decrease button, or use the speed slider if that is the active control | Visible speed value updates immediately and playback behavior matches it | HIGH |
| LIVE-UI-04 | Click a voice selector or voice-related control, then replay the same paragraph | UI selection matches the voice actually used after regeneration | HIGH |
| LIVE-UI-05 | Toggle a TTS-related setting in Settings, close Settings, and reopen it | Toggle state is preserved visually and functionally | MED |
| LIVE-UI-06 | Adjust a punctuation-pause or narration-related slider if available | Slider value updates correctly and does not leave the UI in a stale state | MED |
| LIVE-UI-07 | Inspect toggles, sliders, labels, and active buttons before and after interaction | Visual state remains coherent: labels align with values, active states are obvious, and disabled states are believable | MED |
| LIVE-UI-08 | Compare the same control before and after reopening Settings or restarting the app | Persisted visual state matches the actual underlying setting | MED |
| LIVE-UI-09 | Watch for layout or styling glitches while interacting repeatedly with controls | No flicker, overlap, clipped labels, jumping handles, or mismatched highlight states | LOW |

Capture:

- control response quality:
- control visual consistency:
- button/icon state coherence:
- toggle visual consistency:
- slider visual consistency:
- active/inactive state clarity:
- label/value alignment:
- any stale, clipped, overlapping, or misleading control state:
- any click that failed to change real playback state:
- any click that changed playback state without the UI reflecting it:
- any slider or toggle that appeared saved but was not actually applied:
- notes:

## 9. Section, Chapter, and Book Handoff

Primary lane: flow-sync follow-up

Goal: make handoff an explicit tested surface instead of a side effect.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| LIVE-HANDOFF-01 | Cross a section boundary within the same book | Handoff is smooth and state remains coherent | HIGH |
| LIVE-HANDOFF-02 | Cross a chapter boundary within the same session | Handoff is smooth and chapter display updates correctly | HIGH |
| LIVE-HANDOFF-03 | Observe chapter label or progress during handoff | Display updates without lagging behind the true narration position | MED |
| LIVE-HANDOFF-04 | Reach the end of the book | End behavior is clean and expected | HIGH |
| LIVE-HANDOFF-05 | If queue or cross-book continuation is active, allow continuation to occur | Continuation is coherent and not surprising | MED |
| LIVE-HANDOFF-06 | Return to the library and reopen the same book after a long narration session | Reopen state is sensible and not obviously stale | HIGH |

Capture:

- section handoff quality:
- chapter handoff quality:
- chapter label update quality:
- end-of-book behavior:
- queue or cross-book continuation quality:
- notes:

## 10. EPUB Styled-Token Fidelity

Primary lane: `EPUB-TOKEN-1`

Goal: collect exact failures around lexical word identity vs styled markup fragments.

Exercise these concrete cases if present:

- drop cap first-letter split like `T` + `his`
- one visible word split across multiple inline spans
- decorative small caps without visible spaces
- emphasized fragments inside one lexical word
- adjacent punctuation wrapped separately from the word

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| LIVE-EPUB-01 | Open a decorative EPUB page with a drop cap like `T` + `his` | Reader presents it correctly and treats it as one lexical word for selection/cursoring | CRIT |
| LIVE-EPUB-02 | Start narration on that line | Narration tracks the lexical word, not the markup fragments | CRIT |
| LIVE-EPUB-03 | Move the cursor or selection through the styled word | Cursor advances as one word, not multiple artificial pieces | HIGH |
| LIVE-EPUB-04 | Resume narration near a styled split word | Resume anchor lands on the true lexical word boundary | HIGH |
| LIVE-EPUB-05 | Repeat on a second styled EPUB case with a different split pattern | Behavior is consistent across books and patterns | HIGH |
| LIVE-EPUB-06 | Exercise punctuation wrapped separately from a word if present | Selection and narration still respect the true lexical token boundary | MED |

For each issue, log:

- exact visible text:
- pattern type:
- tokenization behavior:
- did the user see one word or multiple visible fragments:
- did cursoring split it:
- did narration split, skip, duplicate, or resume incorrectly:
- notes:

## 11. Reliability and Recovery

Primary lane: runtime follow-up / hotfix

Goal: catch the “app became unworkable” class of failures.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| LIVE-RECOVER-01 | Stop and restart narration multiple times in one session | State remains coherent and the app stays responsive | HIGH |
| LIVE-RECOVER-02 | Leave narration running for 5-10 minutes with periodic pause/resume | App remains responsive and visually correct | HIGH |
| LIVE-RECOVER-03 | Switch away from the reading surface and back during an active session | Recovery is clean; no invalid or unusable reader state | HIGH |
| LIVE-RECOVER-04 | Check app responsiveness while narration is active | UI remains usable; no severe lag or lockups | HIGH |
| LIVE-RECOVER-05 | Test offline behavior with a local model already present if practical | Local-model narration remains usable without network dependency | MED |
| LIVE-RECOVER-06 | Open narrated content from the library after prior playback | No blank-screen or unusable-reader regression | CRIT |

Capture:

- rendering recovery quality:
- app responsiveness quality:
- any blank-screen event:
- any unrecoverable state:
- offline behavior:
- notes:

## 12. Bug Intake Template

Use one block per finding:

```md
### Bug ID
- Title:
- Severity: CRIT / HIGH / MED / LOW
- Area: startup / cache / controls / audio / seam / speed / sync / handoff / persistence / epub-token / rendering / recovery
- Build / commit:
- Book / file:
- Repro steps:
  1.
  2.
  3.
- Expected:
- Actual:
- Frequency: always / often / intermittent / once
- First observed at speed:
- Related artifacts:
  - gated run dir:
  - screenshot:
  - video or audio note:
- Candidate sprint:
  - TTS-RATE-1
  - EPUB-TOKEN-1
  - runtime follow-up or hotfix
  - flow-sync follow-up
```

## 13. Session Closeout Summary

At the end of the sweep, summarize:

- total issues found
- count by severity
- count by target sprint or lane
- top 3 blockers
- whether the current build is usable for continued live testing
- whether another automated gated run is needed after fixes

Recommended final output format:

```md
## Live Sweep Summary
- Build / commit:
- Tester:
- Result: usable / usable with issues / blocked
- Total findings:
- CRIT:
- HIGH:
- MED:
- LOW:

### Routed to TTS-RATE-1
- ...

### Routed to EPUB-TOKEN-1
- ...

### Routed to flow-sync follow-up
- ...

### Routed to runtime follow-up or hotfix
- ...
```

## Companion Docs

Use these alongside this checklist:

- `docs/testing/TTS_EVAL_MATRIX_RUNBOOK.md`
- `docs/testing/TTS_EVAL_RELEASE_CHECKLIST.md`
- `docs/testing/tts-electron-test-checklist.md`
- `docs/governance/TTS_EVAL_RUNBOOK.md`
