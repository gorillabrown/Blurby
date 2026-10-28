# TTS-EVENT-SYNC-1 Close-Out

**Status:** Main Landed  
**Date:** 2026-05-16  
**Branch:** `sprint/tts-event-sync-1-word-boundary-sync`  
**Sprint commit:** `a71df02`  
**Canonical main merge commit:** `2c946ad`

## Sprint Brief

**Goal:** Promote event-driven word-boundary callbacks to the primary narration highlight sync path, including normalized-to-original word index alignment for Kokoro timing events.  
**Result:** The sprint landed on canonical `main` with provider-level boundary contracts, scheduler boundary metadata propagation, and event-driven `resolveHighlightSync` consumption in `useNarration`.  
**Learned:** Boundary callbacks must carry source and resolved indexes plus trust metadata to keep LL-079 ownership boundaries intact while still enabling alignment correction and diagnostics.  
**Recommend:** Dispatch `NORMALIZER-ENRICH-1` next to extend normalization transforms while preserving the new `normalizedToOriginalMap` contract.  
**Bottom line:** Event-driven word-boundary sync is now canonical on `main`, with fallback behavior preserved for non-word-native timing.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---|---|---|---|---|---|---|
| 1 | Alignment map landed | Contract | `normalizedToOriginalMap` in normalizer output + fixtures | `SegmentNormalizationResult` now includes map; fixtures/tests validate expansions | Pass | Improved | Pass |
| 2 | Provider contract promoted | API contract | Provider capability + provider-level boundary callback type | `emitsWordBoundaryEvents` added; Kokoro true, dormant engines false; callback type lifted to provider layer | Pass | Improved | Pass |
| 3 | Kokoro remap and boundary emission landed | Runtime behavior | Emit resolved original-word boundaries from normalized timing space | Strategy remaps normalized timestamps to original words and emits boundary metadata (`sourceWordIndex`, `resolvedWordIndex`, trust/correction flags) | Pass | Improved | Pass |
| 4 | `useNarration` now consumes boundary events as primary trigger | Sync behavior | Call `resolveHighlightSync` from event handler instead of RAF hot path | Event handler drives trusted visual updates and diagnostics; RAF kept for non-word-native fallback/progress surfaces | Pass | Improved | Pass |
| 5 | LL-079 ownership preserved | Guardrail | `lastConfirmedAudioWordRef` remains scheduler-confirmed only | Ref writes remain in `onWordAdvance` confirmed path; truth-sync stays visual-only | Pass | Preserved | Pass |
| 6 | Adaptive lag behavior landed | Timing policy | Trusted boundaries bypass fixed lag; fallback retains lag | Trusted word-native path bypasses `NARRATION_CURSOR_LAG_MS`; non-event-driven paths keep fallback lag behavior | Pass | Improved | Pass |
| 7 | Verification gate passed | Quality gate | `typecheck`, full tests, build | `npm run typecheck`, `npm test` (183 passed/1 skipped files; 2469 passed/132 skipped tests), and `npm run build` passed (existing circular chunk warning unchanged) | Pass | Improved | Pass |

## Verification

- `npm run typecheck`: passed.
- `npm test`: passed, 183 files passed / 1 skipped; 2469 tests passed / 132 skipped.
- `npm run build`: passed (existing warning: `settings -> tts -> settings` circular chunk).

## Dispositions

| Item | Disposition | Rationale |
|---|---|---|
| Implementation + tests | Accept | All acceptance criteria were met and regression gates passed. |
| Provider boundary contract elevation | Accept | Cross-provider contract is now explicit and test-covered. |
| Non-word-native fallback behavior | Accept | Preserved by design; no fallback regression detected. |
| `tests/perf-baseline-results.json` runtime noise | Exclude from sprint payload | Perf baseline timestamp/value drift came from test execution and is not part of this sprint's code contract. |

## Governance Updates

- Marked `TTS-EVENT-SYNC-1` complete in `ROADMAP.md`.
- Advanced queue head to the then-active `NORMALIZER-ENRICH-1` pointer in `docs/governance/sprint-queue.xlsx`; the legacy Markdown queue was retired on 2026-05-17.
- Added `SRL-034` to `docs/governance/close-outs/SpecRetro.Lessons_Learned.md`.
- Saved this closeout as `Main Landed`.

## Next Work

Dispatch `NORMALIZER-ENRICH-1` from clean `main`.
