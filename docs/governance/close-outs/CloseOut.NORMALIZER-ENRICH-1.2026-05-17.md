# NORMALIZER-ENRICH-1 Close-Out

**Status:** Main Landed  
**Date:** 2026-05-17  
**Branch:** `sprint/normalizer-enrich-1-kokoro-text-normalization`  
**Sprint commit:** `de5b441`  
**Canonical main merge commit:** `dcf8a7d`

## Sprint Brief

**Goal:** Fill Kokoro normalization gaps against the abogen reference by adding missing transforms and context-window heteronym disambiguation while preserving the `normalizedToOriginalMap` contract from TTS-EVENT-SYNC-1.  
**Result:** Nine new transforms landed in `segmentNormalizer.ts`, normalizer fixtures expanded from 8 to 33 (including `St. Louis` guard coverage), heteronym-specific tests were added, and cache identity versioning was advanced to `TTS_NORMALIZER_VERSION = "en-v2"`.  
**Learned:** Enrichment transforms must be guarded conservatively to avoid collateral changes to legacy fixtures (for example, heading punctuation and `a.m./p.m.` abbreviation paths).  
**Recommend:** Dispatch `TTS-RENDER-MAP-1` next; event-driven sync and enriched normalization are now both landed prerequisites.  
**Bottom line:** NORMALIZER-ENRICH-1 shipped cleanly to `main` with full regression gates passing.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---|---|---|---|---|---|---|
| 1 | New transform set landed | Transform count | Add 9 specified transforms | Added all 9: dotted acronym, address abbreviation, URL, fraction, decimal, range, terminal punctuation, all-caps quote downcasing, heteronym disambiguation | Pass | Improved | Pass |
| 2 | Ordering constraints held | Ordering | Dotted before abbreviation, address before number conversion, URL before number conversion, heteronym last | Explicitly validated via new ordering assertions in `tests/segmentNormalizer.test.ts` | Pass | Improved | Pass |
| 3 | Fixture expansion coverage | Fixture breadth | ≥2 cases per new transform incl. edge guards | 25 new fixtures; 33 total. Each new transform has ≥2 entries; heteronym has 8 entries; includes `St. Louis` non-expansion guard | Pass | Improved | Pass |
| 4 | Alignment map compatibility | Mapping contract | `normalizedToOriginalMap` remains correct for 1:N expansions | All fixtures include expected maps and pass; expansion paths validated across new transforms | Pass | Preserved | Pass |
| 5 | Heteronym heuristic layer | Context disambiguation | Context-window rules for initial heteronym list | Added `HETERONYM_TABLE` + `tests/heteronymDisambiguation.test.ts` with positive and negative cases | Pass | Improved | Pass |
| 6 | Normalizer version bump | Cache invalidation | Bump normalizer schema/version | `TTS_NORMALIZER_VERSION` advanced `en-v1` → `en-v2`; expectation updates landed in cache-identity tests | Pass | Improved | Pass |
| 7 | Verification gate | Quality gate | `npm test`, `npm run typecheck` | Full `npm test` passed (184 passed, 1 skipped files; 2472 passed, 132 skipped tests); `npm run typecheck` passed; `npm run build` passed (existing circular chunk warning unchanged) | Pass | Improved | Pass |

## Verification

- `npm test`: passed, 184 files passed / 1 skipped; 2472 tests passed / 132 skipped.
- `npm run typecheck`: passed.
- `npm run build`: passed (existing warning: `settings -> tts -> settings` circular chunk).

## Dispositions

| Item | Disposition | Rationale |
|---|---|---|
| Normalizer implementation + fixtures | Accept | All sprint acceptance criteria met, including edge-case guard behavior. |
| Heteronym context heuristics | Accept | Heuristic layer is explicit and test-covered without introducing full POS tagging complexity. |
| `tests/perf-baseline-results.json` runtime drift | Exclude from sprint payload | Perf baseline noise came from test execution and is unrelated to sprint behavior. |

## Governance Updates

- Marked `NORMALIZER-ENRICH-1` complete in `ROADMAP.md`.
- Advanced queue head to `TTS-RENDER-MAP-1` in `docs/governance/SPRINT_QUEUE.md`.
- Added `SRL-035` to `docs/governance/close-outs/SpecRetro.Lessons_Learned.md`.
- Saved this closeout as `Main Landed`.

## Next Work

Dispatch `TTS-RENDER-MAP-1` from clean `main`.
