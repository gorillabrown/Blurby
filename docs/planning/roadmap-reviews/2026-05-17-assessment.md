# Roadmap Assessment — 2026-05-17

## Prior Finish Line: TTS Architecture Complete

**Status:** REACHED (2026-05-17)

- 10 of 10 conveyor sprints shipped
- 3 sprints dissolved by design (Kokoro-only pivot)
- 0% work remaining on this finish line
- Pace: AHEAD — 10 sprints in 6 days (avg 1.67/day vs ~1/day target)
- Scope discipline: 100% — zero sideways additions during the phase

## LOE Summary

| Category | Count | LOE Points |
|----------|-------|-----------|
| Completed | 15 (excl. dissolved) | 27 (9S + 6M) |
| Dissolved | 3 | — |
| Active | 0 | 0 |
| **% Complete** | **100%** | **100%** |

## New Finish Line: TTS Quality Confidence + Reading Experience v2

Starting from zero. Dual-track:
- **Track 1 (TTS Quality):** Exercise the evaluation harness against real scenarios, establish quality gates and regression detection
- **Track 2 (Reading Experience):** Ship the narration UX improvements that sit on top of the completed TTS architecture — MediaSession, named-pause, silence-aware cursor, pronunciation UI, spoken/display separation, library polish

## Research Item Disposition

| Item | Disposition | Placement |
|------|------------|-----------|
| Registry-driven strategy dispatch | Deferred | Premature while non-Kokoro engines dormant |
| Playback-buffered-seconds backpressure | Deferred | Revisit if TTS-EVAL-3 reveals need |
| SSML as internal format | **Rejected** | Research consensus: structured text + normalizer trace is cleaner |
| MediaSession integration | **Sprint** | NARR-MEDIA-1 |
| M4B/SRT/ASS export | Deferred | Deferred Lanes (KOKORO-EXPORT-1 prerequisite) |
| Normalizer alignment map | Deferred | Revisit when word-position rendering needs original-text cross-reference |

## Health Read

**FRESH START** — No work remaining, no drift, no debt. Clean slate for the next conveyor.
