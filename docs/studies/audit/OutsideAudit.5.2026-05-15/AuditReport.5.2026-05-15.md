# Audit Report — OutsideAudit.5 (2026-05-15)

**Audit:** OutsideAudit.5.2026-05-15
**Type:** Targeted re-audit (evidence-cleanup pass from OutsideAudit.4 at 8/10)
**Prior scores:** OA.1 = 5/10, OA.2 = 6/10, OA.3 = 7/10, OA.4 = 8/10
**Overall score:** 8/10

---

## (A) Dimension-by-dimension re-scoring table

| Dimension | OA.4 score | New score | Change rationale and cap |
|-----------|---:|---:|----|
| Grounding in current codebase | 8 | 8 | Stable. Batch 2 source files present. Capped at 8: `narrationPlanner.ts` cited in ROADMAP_SPECS.md:253-255 grounding blocks but absent from package; `narrateDiagnostics.ts` cited in architecture inventory but absent. |
| Architectural coherence | 8 | 9 | Improved. AD-1–AD-4 now read as a coherent, well-separated architecture set with clear ownership boundaries and explicit future-labeling. |
| Correct sequencing | 8 | 9 | Improved. Integration gates correctly placed. Dependency chain is sound and verifiable from included source. |
| Modeling soundness | 8 | 9 | Improved. NarrationSegmentAnchor half-open semantics precise and complete. Transform contract constraint correctly scoped. Three-level timing hierarchy well-motivated. |
| Extensibility | 7 | 8 | Improved. Provider evolution contract now has explicit fallback behaviors and language-independence note for alignment maps. |
| Testability | 8 | 8 | Stable. Strong gates remain. Capped at 8: test fixtures and test files not included in package. |
| Delivery practicality | 8 | 8 | Stable. Capped at 8: trailing NUL bytes present in delivered zip contents (ROADMAP.md: 2 bytes, ROADMAP_SPECS.md: 1,204 bytes); minor line-citation drift in two grounding blocks; normalizer transform order description inconsistent with source. |
| Overall confidence | 8 | 8 | Stable. Architecture is sound and dispatch-safe. Remaining issues are packaging precision and minor documentation accuracy defects. Capped at 8: NUL contamination, missing source files, and citation drift prevent 9. |

---

## (B) Grounding verification results

| Claim checked | Verification result | Assessment |
|---|---|---|
| documentLocator line citation | ROADMAP_SPECS.md:256 says `:151` but source has `documentLocator: { bookId }` at kokoroStrategy.ts:164 | Fail — off by 13 lines |
| TtsCacheReadResult.timing line citation | ROADMAP_SPECS.md:158 says `ttsCache.ts:58` but `timing?: TtsTimingSidecar \| null` is at src/types/ttsCache.ts:59 | Fail — off by 1 |
| Transform pipeline order | ROADMAP_SPECS.md describes transforms as list ending with "plus optional pronunciation overrides" — source applies overrides FIRST (lines 348-351), then 11 always-applied transforms | Fail — order inverted |
| TTS_NORMALIZER_VERSION location | ROADMAP_SPECS.md:216 says "lives in the constants section of segmentNormalizer.ts" — source imports it from `../constants` (src/constants.ts:159) | Fail — wrong file |
| narrationPlanner.ts in package | Cited at ROADMAP_SPECS.md:253-255 but not present in Batch 1 or Batch 2 zip | Fail — missing |
| narrateDiagnostics.ts in package | Cited in architecture inventory (ROADMAP_SPECS.md:293) but not in either batch | Fail — missing |
| NUL byte presence | Both ROADMAP.md and ROADMAP_SPECS.md contain trailing NUL bytes in the delivered zip | Fail — packaging defect |

---

## (C) Architecture decisions review

### AD-1–AD-4: All coherent and well-structured
Architecture decisions remain sound. No changes needed to the decisions themselves — the issues are in the documentation precision and packaging that presents them.

---

## (D) Type-flow matrix assessment

Sound. No changes from OA.4 assessment.

---

## (E) Remaining gaps — what would reach 9/10

1. **Strip NUL bytes** from all files in the delivered zip (packaging process defect — strip after all edits, immediately before zip creation)
2. **Include `narrationPlanner.ts`** (`src/utils/narrationPlanner.ts`) — cited in TTS-PIPELINE-1 grounding evidence
3. **Include `narrateDiagnostics.ts`** (`src/utils/narrateDiagnostics.ts`) — cited in architecture layer inventory
4. **Fix `documentLocator` line citation:** ROADMAP_SPECS.md:256 should say `:164` not `:151`
5. **Fix `TtsCacheReadResult.timing` line citation:** should reference `src/types/ttsCache.ts:59` not `ttsCache.ts:58`
6. **Fix normalizer transform order description:** pronunciation overrides are applied FIRST (lines 348-351), then 11 always-applied transforms — not listed last as "plus optional"
7. **Fix `TTS_NORMALIZER_VERSION` location:** imported from `../constants` (defined at `src/constants.ts:159`), not "lives in the constants section of segmentNormalizer.ts"

Items 1-7 are documentation/packaging fixes. Implementation of future contracts (item 7 from OA.4) remains the gate to 10/10.

---

## (F) Final recommendation

**Recommendation: remediate items 1-7, repackage, re-audit for 9/10.**

The architecture is sound and dispatch-ready. All remaining defects are narrow documentation precision and packaging hygiene issues. Fixing them should reach 9/10.
