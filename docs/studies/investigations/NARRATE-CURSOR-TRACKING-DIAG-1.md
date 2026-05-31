# NARRATE-CURSOR-TRACKING-DIAG-1 — Cursor Tracking Signal Diagnostics (Investigation)

**Sprint:** NARRATE-CURSOR-TRACKING-DIAG-1
**Lane:** Lane B (Evaluation Harness) + diagnostics
**Spec:** `ROADMAP.md` → "NARRATE-CURSOR-TRACKING-DIAG-1 — Cursor Tracking Signal Diagnostics (Investigation)"

## Goal

Instrument all 7 candidate cursor-tracking signals so a live narration trace can rank which signal best tracks heard audio.

## Problem

Narration cursor sometimes leads or lags the heard word. We have 7 candidate signals but no empirical data on which best matches the audio the user actually hears. We cannot pick a winner by reasoning alone — we need a live trace.

## The 7 candidate signals

1. `schedulerActiveWord` — word index the audio scheduler currently considers active
2. `chunkPlayheadWord` — word derived from the playing chunk's playhead offset
3. `decodedFrontierWord` — last word whose audio has been decoded
4. `emittedWord` — last word emitted to the renderer
5. `wordAdvanceLatest` — most recent word-advance event target
6. `heardFloor` — lower bound of what has definitely been heard
7. `resumeTarget` — the resume anchor target

## Hypothesis (UNPROVEN — requires live trace)

`schedulerActiveWord` best tracks heard audio, but lead/lag versus the other six signals is unmeasured. The live trace decides.

## Diagnostics channel to reuse

Instrumentation rides on the existing diagnostics flag. Both `src/hooks/useNarration.ts` and `src/utils/audioScheduler.ts` bind `const DIAG = isDiagEnabled()` from a single shared source, `src/utils/diagFlag.ts` — so this is one shared, mockable flag seam (two bindings, one source), not two independent constants. Extend the existing `word-advance`, `chunk-start`, and `chunk-end` diagnostic events with the 7 candidate signals plus a high-resolution timestamp, and add a new `signal-leadlag-summary` event emitted on pause/stop.

## Signal map (to be filled by live trace)

| Signal | Source location | Expected behavior | Current evidence |
|--------|-----------------|-------------------|------------------|
| schedulerActiveWord | audioScheduler.ts | Tracks active playback word | (pending live trace) |
| chunkPlayheadWord | audioScheduler.ts | Derived from playhead offset | (pending live trace) |
| decodedFrontierWord | audioScheduler.ts | Last decoded word | (pending live trace) |
| emittedWord | useNarration.ts | Last word sent to renderer | (pending live trace) |
| wordAdvanceLatest | useNarration.ts | Latest word-advance target | (pending live trace) |
| heardFloor | useNarration.ts | Lower bound of heard audio | (pending live trace) |
| resumeTarget | useNarration.ts | Resume anchor target | (pending live trace) |

## WHERE (read order)

1. `src/utils/audioScheduler.ts` — DIAG emissions for chunk-start/chunk-end
2. `src/hooks/useNarration.ts` — DIAG emissions for word-advance
3. `src/utils/diagFlag.ts` — shared `isDiagEnabled()` seam
4. `tests/narration-cursor-tracking-diag.test.ts` — new test file

## Success criteria

- All 7 signals captured in extended diag payloads
- `signal-leadlag-summary` event emitted on pause/stop
- Zero hot-path cost when DIAG disabled
- Full suite green + new tests
- Investigation doc updated with instrumentation status

## Status & deferred items (as of 2026-05-31)

- Instrumentation merged behind the shared `DIAG` (isDiagEnabled) flag: extended `word-advance`, `chunk-start`, `chunk-end` payloads with all 7 candidate signals + `t: performance.now()`; new `signal-leadlag-summary` event on pause/stop with per-signal min/median/max vs `schedulerActiveWord`.
- Verification: full suite 3053/3053 passing (+9 new tests in `tests/narration-cursor-tracking-diag.test.ts`); `npm run build` succeeds; Solon APPROVED (diagnostics-only scope); Plato READY (zero hot-path cost when DIAG off).
- DEFERRED to live QA (cannot be done autonomously by CLI): capture a live narration trace with DIAG enabled, populate the signal-map table's "Current evidence" column with real lead/lag data, produce the ranked accuracy table, and confirm or refute the hypothesis that `schedulerActiveWord` best tracks heard audio.
- DEFERRED governance updates (to be done at sprint close after the live trace): mark this sprint complete in ROADMAP.md and sprint-queue.xlsx, and add the LESSONS_LEARNED entry naming the proven winning signal. Not done in this commit to avoid colliding with concurrent uncommitted governance edits.
