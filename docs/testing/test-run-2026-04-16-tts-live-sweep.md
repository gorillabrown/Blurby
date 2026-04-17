# TTS Live Sweep — Session Run Sheet

Use this file to record the active live QA session against [TTS_LIVE_BUG_SWEEP_CHECKLIST.md](C:/Users/estra/Projects/Blurby/docs/testing/TTS_LIVE_BUG_SWEEP_CHECKLIST.md). It is pre-filled with the current workspace metadata and the latest known automated baseline so findings can be logged directly.

## 1. Run Metadata

- Date: `2026-04-16`
- Branch: `main`
- Commit: `f906eb1`
- App version (`package.json`): `1.5.0`
- Roadmap state: `v1.55.0 stable`
- Tester:
- OS:
- Audio output device:
- Kokoro voice:
- Default speed:
- Primary prose book:
- Primary decorative EPUB:
- Secondary decorative EPUB:

## 2. Automated Preflight

Status:

- `npm run typecheck`: PASS
- `npm test`: PASS
- `npm run build`: PASS
- `npm run tts:eval:matrix:gated -- --run-id live-sweep-main --out artifacts/tts-eval/live-sweep-main`: PASS

Artifacts:

- gated artifact directory: `artifacts/tts-eval/live-sweep-main`
- `gate-report.txt`: `PASS`
- startup p50: `465ms`
- startup p95: `502.8ms`
- startup max: `507ms`
- drift p50: `2`
- drift p95: `2`
- drift max: `2`
- pause/resume failures: `0`
- handoff failures: `0`

Preflight notes:

- Existing non-blocking warning remains unchanged: circular chunk warning during build.
- This run was executed from the clean `main` baseline at `f906eb1`.

## 3. Session Setup

Session readiness:

- [x] Built Electron app launched
- [ ] Kokoro active, not Web Speech fallback
- [ ] Local model present if offline behavior will be tested
- [ ] Prose-heavy EPUB selected
- [ ] Multi-section or multi-chapter book selected
- [ ] Two decorative EPUBs with styled split-token cases selected
- [ ] DevTools closed for main listening pass

Setup notes:

- 

## 4. Core Startup and Control Sanity

Results:

| ID | Result | Notes |
|----|--------|-------|
| LIVE-START-01 |  |  |
| LIVE-START-02 |  |  |
| LIVE-START-03 |  |  |
| LIVE-START-04 |  |  |
| LIVE-START-05 |  |  |
| LIVE-CTRL-01 |  |  |
| LIVE-CTRL-02 |  |  |
| LIVE-CTRL-03 |  |  |
| LIVE-CTRL-04 |  |  |
| LIVE-CTRL-05 |  |  |

Capture:

- warm or uncached startup time felt:
- warm or cached startup time felt:
- control response quality:
- control visual consistency:
- controls state quality:
- notes:

## 5. Flow and Narration Sync

Results:

| ID | Result | Notes |
|----|--------|-------|
| LIVE-FLOW-01 |  |  |
| LIVE-FLOW-02 |  |  |
| LIVE-FLOW-03 |  |  |
| LIVE-FLOW-04 |  |  |
| LIVE-FLOW-05 |  |  |
| LIVE-FLOW-06 |  |  |
| LIVE-FLOW-07 |  |  |

Capture:

- sync quality:
- any cursor jump:
- any mismatch between spoken and indicated position:
- any blank-screen or stuck-surface event:
- when it happens:
- notes:

## 6. Audio Seam and Punctuation Quality

Results:

| ID | Result | Notes |
|----|--------|-------|
| LIVE-AUDIO-01 |  |  |
| LIVE-AUDIO-02 |  |  |
| LIVE-AUDIO-03 |  |  |
| LIVE-AUDIO-04 |  |  |
| LIVE-AUDIO-05 |  |  |

Capture:

- seam quality:
- comma pause quality:
- sentence pause quality:
- paragraph pause quality:
- audible issues:
- notes:

## 7. Speed Ladder

Results:

| ID | Result | Notes |
|----|--------|-------|
| LIVE-RATE-01 |  |  |
| LIVE-RATE-02 |  |  |
| LIVE-RATE-03 |  |  |
| LIVE-RATE-04 |  |  |
| LIVE-RATE-05 |  |  |

Per-speed capture:

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

Results:

| ID | Result | Notes |
|----|--------|-------|
| LIVE-CACHE-01 |  |  |
| LIVE-CACHE-02 |  |  |
| LIVE-CACHE-03 |  |  |
| LIVE-CACHE-04 |  |  |
| LIVE-CACHE-05 |  |  |
| LIVE-CACHE-06 |  |  |
| LIVE-CACHE-07 |  |  |

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

Results:

| ID | Result | Notes |
|----|--------|-------|
| LIVE-UI-01 |  |  |
| LIVE-UI-02 |  |  |
| LIVE-UI-03 |  |  |
| LIVE-UI-04 |  |  |
| LIVE-UI-05 |  |  |
| LIVE-UI-06 |  |  |
| LIVE-UI-07 |  |  |
| LIVE-UI-08 |  |  |
| LIVE-UI-09 |  |  |

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

## 8B. Keyboard vs Click Parity and Ctrl+K

Results:

| ID | Result | Notes |
|----|--------|-------|
| PARITY-01 |  | Compare play/pause via UI click vs keyboard path |
| PARITY-02 |  | Compare narration toggle via `N` vs button click in Flow |
| PARITY-03 |  | Compare speed change via button/slider vs keyboard if both are available |
| CMDK-01 |  | `Ctrl+K` opens command palette cleanly |
| CMDK-02 |  | Search results match the intended action or destination |
| CMDK-03 |  | Clicking a command executes or navigates where it says it will |
| CMDK-04 |  | After command execution, visible app state matches the command label |
| CMDK-05 |  | Reopening `Ctrl+K` after command use still works and is visually coherent |

Capture:

- keyboard vs click parity:
- any mismatch between keyboard path and click path:
- `Ctrl+K` response quality:
- command click accuracy:
- incorrect destination or action:
- notes:

## 8C. Boundary Values, Loading States, and Visual Truthfulness

Results:

| ID | Result | Notes |
|----|--------|-------|
| BOUND-01 |  | Min speed state looks and behaves correct at boundary |
| BOUND-02 |  | Max speed state looks and behaves correct at boundary |
| BOUND-03 |  | Min/max punctuation or narration slider values look and behave correctly |
| LOAD-01 |  | Visible loading or transient states appear when work is in flight |
| LOAD-02 |  | Disabled states during transitions are believable and not misleading |
| STATUS-01 |  | Speed label remains truthful during speed changes |
| STATUS-02 |  | Chapter/progress label remains truthful during handoff |
| STATUS-03 |  | Active mode indicators remain truthful during pause/resume/stop/restart |
| THEME-01 |  | Controls remain visually coherent in the primary theme |
| THEME-02 |  | Controls remain visually coherent in one secondary theme if exercised |
| ERRMSG-01 |  | Any surfaced error or warning messaging is clear and actionable |

Capture:

- boundary behavior quality:
- loading/transient-state quality:
- status/progress truthfulness:
- theme consistency notes:
- error messaging quality:
- notes:

## 9. Section, Chapter, and Book Handoff

Results:

| ID | Result | Notes |
|----|--------|-------|
| LIVE-HANDOFF-01 |  |  |
| LIVE-HANDOFF-02 |  |  |
| LIVE-HANDOFF-03 |  |  |
| LIVE-HANDOFF-04 |  |  |
| LIVE-HANDOFF-05 |  |  |
| LIVE-HANDOFF-06 |  |  |

Capture:

- section handoff quality:
- chapter handoff quality:
- chapter label update quality:
- end-of-book behavior:
- queue or cross-book continuation quality:
- notes:

## 10. EPUB Styled-Token Fidelity

Results:

| ID | Result | Notes |
|----|--------|-------|
| LIVE-EPUB-01 |  |  |
| LIVE-EPUB-02 |  |  |
| LIVE-EPUB-03 |  |  |
| LIVE-EPUB-04 |  |  |
| LIVE-EPUB-05 |  |  |
| LIVE-EPUB-06 |  |  |

Capture:

- exact visible text:
- pattern type:
- tokenization behavior:
- did the user see one word or multiple visible fragments:
- did cursoring split it:
- did narration split, skip, duplicate, or resume incorrectly:
- notes:

## 11. Reliability and Recovery

Results:

| ID | Result | Notes |
|----|--------|-------|
| LIVE-RECOVER-01 |  |  |
| LIVE-RECOVER-02 |  |  |
| LIVE-RECOVER-03 |  |  |
| LIVE-RECOVER-04 |  |  |
| LIVE-RECOVER-05 |  |  |
| LIVE-RECOVER-06 |  |  |

Capture:

- rendering recovery quality:
- app responsiveness quality:
- any blank-screen event:
- any unrecoverable state:
- offline behavior:
- notes:

## 12. Bug Log

Use one block per finding:

```md
### Bug ID
- Title:
- Severity: CRIT / HIGH / MED / LOW
- Area: startup / cache / controls / audio / seam / speed / sync / handoff / persistence / epub-token / rendering / recovery
- Build / commit: f906eb1
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
  - gated run dir: artifacts/tts-eval/live-sweep-main
  - screenshot:
  - video or audio note:
- Candidate sprint:
  - TTS-RATE-1
  - EPUB-TOKEN-1
  - runtime follow-up or hotfix
  - flow-sync follow-up
```

### Finding 1

- Title:
- Severity:
- Area:
- Build / commit: `f906eb1`
- Book / file:
- Repro steps:
  1.
  2.
  3.
- Expected:
- Actual:
- Frequency:
- First observed at speed:
- Related artifacts:
  - gated run dir: `artifacts/tts-eval/live-sweep-main`
  - screenshot:
  - video or audio note:
- Candidate sprint:

## 13. Session Closeout Summary

- Build / commit: `f906eb1`
- Tester:
- Result: `usable / usable with issues / blocked`
- Total findings:
- CRIT:
- HIGH:
- MED:
- LOW:

### Routed to TTS-RATE-1

- 

### Routed to EPUB-TOKEN-1

- 

### Routed to flow-sync follow-up

- 

### Routed to runtime follow-up or hotfix

- 

## Artifact Discipline

For each finding, try to capture:

- screenshot for visual/control issues
- exact timestamp or felt timing bucket for startup or pause defects
- whether issue is reproducible on first attempt
- whether issue happens on click path, keyboard path, or both
- whether issue occurs only on one book or across multiple books
