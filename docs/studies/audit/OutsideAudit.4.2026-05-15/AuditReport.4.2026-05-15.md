# Audit Report — OutsideAudit.4 (2026-05-15)

**Audit:** OutsideAudit.4.2026-05-15
**Type:** Targeted re-audit (evidence-cleanup pass from OutsideAudit.3 at 7/10)
**Prior scores:** OutsideAudit.1 = 5/10, OutsideAudit.2 = 6/10, OutsideAudit.3 = 7/10
**Overall score:** 8/10

---

## (A) Dimension-by-dimension re-scoring table

| Dimension | OutsideAudit.3 score | New score | Change rationale and cap |
|-----------|-------------------:|--------:|----|
| Grounding in current codebase | 7 | 8 | Improved. chunkId citation corrected to kokoroStrategy.ts:165; transform list matches segmentNormalizer.ts:5-17; engine posture clarified in ROADMAP.md; key registry/IPC/cache/normalizer/strategy files included. Capped at 8: package still omits audioScheduler.ts, generationPipeline.ts, useNarration.ts, FoliatePageView.tsx, and src/types/ttsCache.ts. Included ttsCache.ts is renderer utility, not the type file cited by AD-2. |
| Architectural coherence | 8 | 8 | Improved within band. AD-1–AD-4 now read as coherent architecture set. Cache/segment identity separation is clean. Capped at 8: several constructs remain future products rather than implemented types; a few documentation references still point to wrong logical file. |
| Correct sequencing | 8 | 8 | Stable. Sequence sound: dormancy → integration → cache hardening → event sync → normalizer enrichment → render map → pipeline validation → architecture doc. Integration gates at right points. Capped at 8: TTS-INTEGRATE-1 depends on branch-only artifacts; package lacks source/test material to verify all downstream assumptions. |
| Modeling soundness | 8 | 8 | Improved within band. NarrationSegmentAnchor has half-open interval semantics and stability rationale. AD-3 correctly scopes citation-marker-removal as non-word-artifact deletion. Capped at 8: NarrationSegmentAnchor, normalizedToOriginalMap, and future event contract are specified but not implemented in included code. |
| Extensibility | 7 | 7 | Mostly unchanged. AD-4 directionally correct with emitsWordBoundaryEvents explicitly marked future. Capped at 7: runtime strategy dispatch deliberately deferred; provider extensibility is documentary not operational. Acceptable deferral for Kokoro-focused conveyor. |
| Testability | 8 | 8 | Stable. Strong gates: cache-hit/fresh parity before event sync, alignment-map proof before normalizer enrichment, end-to-end pipeline validation before architecture closure. Capped at 8: actual test files and fixtures not included; fixture counts and executability of proposed gates cannot be independently verified. |
| Delivery practicality | 7 | 8 | Improved. Split between lean dispatch ROADMAP.md and implementation detail ROADMAP_SPECS.md is practical; NUL padding gone. Capped at 8: ROADMAP_SPECS.md still has duplicated TTS-CACHE-HARDEN opportunistic criteria, SPRINT_QUEUE.md has one stale AD-1 pointer, ROADMAP.md has minor numbering typo in TTS-PIPELINE-1 (2.2.). |
| Overall confidence | 7 | 8 | Improved. Roadmap is broadly dispatch-safe as a plan. Remaining issues are evidence-packaging and document-polish defects, not core architecture defects. Capped at 8: several critical claims remain unverified from included source set; future contracts require implementation proof. |

---

## (B) Grounding verification results

| Claim checked | Verification result | Assessment |
|---|---|---|
| Fix 1: stale chunkId citation corrected to line 165 | Correct. kokoroStrategy.ts:151-168 builds v2 cache identity. Line 165 sets chunkId. | Pass |
| Fix 2: transform list replaced with actual IDs from segmentNormalizer.ts:5-17 | Correct in substance. 12 IDs match source. Minor: "12 transforms" count includes optional pronunciation overrides; explicit pipeline has 11 always-applied plus optional override. | Pass |
| Fix 3: AD-3 citation-marker-removal exception scoped | Correct. ROADMAP_SPECS.md:43-47 correctly identifies citation-marker-removal as deletion of non-word artifacts. Source confirms at segmentNormalizer.ts:263-267. | Pass |
| Fix 4: engine posture clarified | Partially correct. ROADMAP.md:4-5 correct. Residual: SPRINT_QUEUE.md:58 and :346 still use unqualified "sole active engine." | Mostly pass |
| Fix 5: NUL padding stripped | Correct. All three files have nul_count = 0. | Pass |
| Fix 6: NarrationSegmentAnchor half-open semantics defined | Correct. ROADMAP_SPECS.md:15-23 defines future, content-stable identity with half-open [startIdx, endIdx). | Pass |
| Fix 7: SPRINT_QUEUE.md updated to point to both roadmap files | Mostly correct. Line 82 updated. Residual: SPRINT_QUEUE.md:208 says "see AD-1 in ROADMAP.md" but AD-1 now lives in ROADMAP_SPECS.md. | Mostly pass |
| Qwen disabled IPC reference | Imprecise. ROADMAP_SPECS.md:126 says error: "qwen-disabled" but source returns reason: "qwen-disabled", error: QWEN_DISABLED_DETAIL. | Partial fail |
| AD-2 timing hierarchy | Partially verifiable. ttsProvider.ts:4-8 verified. But src/types/ttsCache.ts not included; included ttsCache.ts is src/utils/ttsCache.ts. | Partial pass |

---

## (C) Architecture decisions review

### AD-1: Segment Identity vs Cache Identity
Coherent and materially complete at design level. Source supports cache identity premise. NarrationSegmentAnchor half-open semantics are the largest improvement since OutsideAudit.3. Remaining cap: anchor not yet implemented; epub-word-extractor.js referenced but not included. Acceptable for 8/10; implementation proof required for 9/10.

### AD-2: Three-Level Timing Hierarchy
Architecturally sound. Three levels distinct and well-evidenced. classifyTiming() correctly labeled as future. Remaining cap: src/types/ttsCache.ts not included in package.

### AD-3: Transform Contract Constraint
Substantially improved. No longer claims all transforms are 1:1 or 1:N. Correctly scopes citation-marker-removal as non-word-artifact deletion. Alignment-safety rule is the right compromise. Remaining cap: alignment model is test-dependent; normalizedToOriginalMap must prove correctness across deletion, expansion, punctuation normalization, and pronunciation overrides.

### AD-4: Provider Evolution Contract
Coherent and properly scoped. emitsWordBoundaryEvents explicitly labeled future. Deferral of registry-driven runtime dispatch acceptable for Kokoro-focused conveyor. Remaining cap: extensibility is documentary not operational.

---

## (D) Type-flow matrix assessment

Coherent and complete enough for dispatch. Dependency chain logically sound. Two most important integration gates correctly placed: Sprint 3 gate (cache-hit/fresh parity before event sync) and Sprint 4 gate (normalizer → alignment map → word-boundary event → highlight controller). Matrix depends on branch-only files and omitted package files — acceptable for sequencing but not for 9/10 source-grounding.

---

## (E) Remaining gaps — what would reach 9/10 or 10/10

1. Include all source files cited by grounding blocks (src/types/ttsCache.ts, audioScheduler.ts, generationPipeline.ts, useNarration.ts, FoliatePageView.tsx)
2. Correct Qwen IPC field wording: reason: "qwen-disabled", not error: "qwen-disabled"
3. Fix cross-document pointer drift: SPRINT_QUEUE.md:208 should point AD-1 to ROADMAP_SPECS.md; ROADMAP_SPECS.md:302 should self-reference not point to ROADMAP.md
4. Fully qualify engine posture in SPRINT_QUEUE.md:58 and :346
5. Remove duplicate TTS-CACHE-HARDEN opportunistic criteria in ROADMAP_SPECS.md
6. Fix minor numbering typo: ROADMAP.md:221 has "2.2." in TTS-PIPELINE-1 done-when list
7. Implement future contracts (NarrationSegmentAnchor, normalizedToOriginalMap, classifyTiming(), emitsWordBoundaryEvents, WordPositionIndex) — required for 9/10+
8. Provide test/fixture evidence in package — required for 9/10 testability

---

## (F) Final recommendation

**Recommendation: approve for dispatch with minor documentation cleanup.**

Overall score: 8/10. Remaining defects are narrow — mostly packaging and documentary precision issues, not architecture blockers. The strongest remaining technical cap is that several future contracts are still specifications rather than implemented code, which is appropriate for a roadmap but prevents 9/10 or 10/10.
