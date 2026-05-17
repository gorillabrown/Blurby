# TTS-PIPELINE-1 Close-Out

**Status:** Main Landed
**Date:** 2026-05-17
**Branch:** `sprint/tts-pipeline-1-integration-test`
**Sprint commit:** `022d161`
**Canonical main merge commit:** `994f218`

## Sprint Brief

**Goal:** Prove the narration pipeline works end-to-end from chunk planning through normalization, cache identity, timing metadata, word-boundary sync, and word-position lookup.
**Result:** A production `buildKokoroCacheIdentity()` helper now feeds Kokoro strategy and background caching, while `tests/narrationPipelineIntegration.test.ts` exercises the full pipeline chain.
**Learned:** Integration tests are most trustworthy when they call a pure helper used by production instead of reconstructing private identity logic in test-only code.
**Recommend:** Dispatch TTS-ARCH-DOC-1 from clean `main`.
**Bottom line:** TTS-PIPELINE-1 landed on canonical `main` with focused, full-suite, typecheck, build, and diff-check gates passing.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---|---|---|---|---|---|---|
| 1 | Production cache identity helper extracted | Production path | Test the real v2 identity construction path | Added `src/utils/ttsCacheIdentity.ts` and routed Kokoro strategy plus background cacher through it | Pass | Improved | Pass |
| 2 | End-to-end narration pipeline test landed | Integration coverage | Chain planner -> normalizer -> cache identity -> timing sidecar -> word-boundary event -> word-position lookup | Added `tests/narrationPipelineIntegration.test.ts` with the required chain and cache-hit parity assertions | Pass | Improved | Pass |
| 3 | Normalization fixture corpus expanded | Fixture breadth | >=15 fixtures covering required categories | Expanded `english-v1.json` with OCR, poetry, table, footnote-heavy, mixed-language, ellipsis/em-dash, and nested-quote coverage | Pass | Improved | Pass |
| 4 | Fixture corpus guard added | Regression protection | Prevent future accidental fixture shrinkage | `tests/segmentNormalizer.test.ts` now asserts required fixture families are present | Pass | Improved | Pass |
| 5 | Stress and assessment coverage included | Sprint-specific criteria | Exercise cache-hit, pause/resume, content-addressed viability, and segment-type assessment | Integration test covers mixed-length/all-cache-hit rapid pause/resume cycles and documents stable anchor/content-addressed viability | Pass | Improved | Pass |
| 6 | Verification gates passed | Quality gate | Focused tests, full test, typecheck, build, diff-check | All requested gates passed; build retains the existing `settings -> tts -> settings` circular chunk warning | Pass | Preserved | Pass |

## Verification

- `npm test -- --run tests/segmentNormalizer.test.ts tests/narrationPipelineIntegration.test.ts tests/kokoroStrategy.test.ts`: passed, 3 files / 24 tests.
- `npm test -- --run tests/tts7a-cacheCorrectness.test.ts tests/tts7f-entryCacheCruiseWarm.test.ts`: passed, 2 files / 25 tests.
- `npm run typecheck`: passed.
- `npm run build`: passed with existing `settings -> tts -> settings` circular chunk warning.
- `npm test`: passed, 192 files passed / 1 skipped; 2534 tests passed / 132 skipped.
- `git diff --check`: passed.

## Dispositions

| Item | Disposition | Rationale |
|---|---|---|
| `buildKokoroCacheIdentity()` helper | Accept | Keeps production and tests on the same cache identity construction path. |
| Pipeline integration test | Accept | Covers the cross-module chain that was previously only unit-tested in pieces. |
| Expanded normalization fixtures | Accept | Required fixture categories are represented and guarded. |
| `KOKORO-EXPORT-1` workbook backfill | Accept as optional future pointer | Keeps a post-finish-line queue pointer without making export part of the TTS Architecture Complete finish line. |
| `tests/perf-baseline-results.json` runtime drift | Exclude from sprint payload | Test-run noise unrelated to the sprint behavior contract. |

## Governance Updates

- Marked `TTS-PIPELINE-1` complete in `ROADMAP.md`.
- Advanced workbook queue head to `TTS-ARCH-DOC-1` in `docs/governance/sprint-queue.xlsx`.
- Kept `KOKORO-EXPORT-1` as the optional future pointer after `TTS-ARCH-DOC-1`; queue depth is now 2, not 3.
- Added `SRL-038` to `docs/governance/close-outs/SpecRetro.Lessons_Learned.md`.
- Saved this closeout as `Main Landed` with sprint and merge commit evidence.

## Next Work

Dispatch `TTS-ARCH-DOC-1` from clean `main`.
