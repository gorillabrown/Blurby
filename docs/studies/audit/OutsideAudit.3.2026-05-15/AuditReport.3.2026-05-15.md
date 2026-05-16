# Audit Report — OutsideAudit.3 (2026-05-15)

**Audit:** OutsideAudit.3.2026-05-15
**Type:** Targeted re-audit
**Prior audits:** OutsideAudit.1 (5/10), OutsideAudit.2 (6/10)
**Overall score:** 7/10

---

## (A) Dimension-by-dimension re-scoring

| Dimension | Prior score | New score | Change rationale |
|-----------|----------:|--------:|-----------------|
| Grounding in current codebase | 7 | 7 | Package now contains complete lean ROADMAP.md + companion ROADMAP_SPECS.md + source files. Caps: some grounding claims point to files not included (audioScheduler.ts, generationPipeline.ts, useNarration.ts, FoliatePageView.tsx). Stale kokoroStrategy.ts line reference at ROADMAP_SPECS.md:284 and inaccurate transform list. |
| Architectural coherence | 7 | 8 | AD-1 through AD-4 make core architecture legible. Cache/segment identity split is the major correction. Caps: AD-3 overstates transform contract; Web Speech remains selectable contradicting "sole active engine." |
| Correct sequencing | 6 | 8 | Conveyor has defensible chain with two integration gates at right points. Caps: branch-only artifacts remain prerequisites for TTS-INTEGRATE-1. |
| Modeling soundness | 7 | 8 | NarrationSegmentAnchor with half-open interval semantics addresses segment-identity gap. Caps: anchor is still future type; epub-word-extractor.js not included. |
| Extensibility | 7 | 7 | AD-4 correctly labels emitsWordBoundaryEvents as future. Caps: runtime dispatch deliberately deferred; system depends on hard-coded strategy paths. |
| Testability | 6 | 8 | Better test gates: cache-hit parity, Phase 0 alignment proof, normalizer alignment tests, stress fixtures. Caps: test/fixture files not included for verification. |
| Delivery practicality | 6 | 7 | Effort sizing more realistic. Split roadmap structure more usable. Caps: duplicate blocks in ROADMAP_SPECS.md, trailing NUL padding in ROADMAP.md. |
| Overall confidence | 6 | 7 | Roadmap substantially more coherent and near dispatch-safe. Caps: residual evidence drift, some claims not verifiable or contradicted by source. |

---

## (B) Grounding verification results

### Block 1: AD-1 cache identity construction
**Claim:** chunkId is `${bookId}:${startIdx}:${normalizationHash}`
**Verification:** Correct. kokoroStrategy.ts:151-168 builds v2 identity, chunkId at line 165.
**Assessment:** Pass. Strongest grounding block.

### Block 2: AD-2 timing hierarchy
**Claim:** Three levels: provider capability, cache identity, per-chunk classification.
**Verification:** Correct. ttsProvider.ts:4-8, ttsCache.ts:23, ttsCache.ts:45-46.
**Assessment:** Pass. classifyTiming() correctly marked as future.

### Block 3: ENGINE-DORMANCY-1 registry state
**Claim:** Qwen disabled, Nano/Pocket selectable sidecars.
**Verification:** Correct. ttsProviderRegistry.ts:66-93 (Qwen), 95-122 (Nano), 124-151 (Pocket).
**Assessment:** Pass.

### Block 4: IPC handlers
**Claim:** Qwen handlers return disabled response.
**Verification:** Partially correct. tts.js:6-35 defines QWEN_DISABLED_REASON. Field wording imprecise.
**Assessment:** Substantive pass; field wording should be corrected.

### Block 5: Cache v1/v2 paths
**Claim:** Legacy v1 uses raw bookId/voiceId, needs slash-safe encoding.
**Verification:** Correct. tts-cache.js:134-136 builds raw path; v2 uses safePathSegment at 90-95.
**Assessment:** Pass.

### Block 6: Timing sidecar classification
**Claim:** Currently derives trusted/heuristic timing.
**Verification:** Mostly correct. tts-cache.js:193-221. Future classifyTiming() adds stricter count-match.
**Assessment:** Pass with future/current distinction.

### Block 7: Transform pipeline
**Claim:** 12 transforms, all 1:1 or 1:N.
**Verification:** Partially inaccurate. Transform IDs in spec use stale names. citation-marker-removal can remove tokens.
**Assessment:** Fail/partial. Main source-grounding defect.

### Block 8: Line citation kokoroStrategy.ts:165
**Claim:** Fixed from 168→165.
**Verification:** Mostly corrected but ROADMAP_SPECS.md:284 still says line 168.
**Assessment:** Partial fail. One stale citation remains.

### Block 9: Engine posture
**Claim:** Kokoro sole active engine.
**Verification:** Needs narrowing. Web Speech remains selectable (ttsProviderRegistry.ts:8-28).
**Assessment:** Partial. Wording precision issue.

---

## (C) Architecture decisions review

### AD-1: Segment Identity vs Cache Identity
Coherent and substantially complete. Key correction since OutsideAudit.1. Precise semantics now defined. Remaining cap: NarrationSegmentAnchor not yet in source; epub-word-extractor.js not included.

### AD-2: Three-Level Timing Hierarchy
Coherent and well-evidenced. classifyTiming() correctly labeled as future. Near dispatch-quality.

### AD-3: Transform Contract Constraint
Directionally coherent but not fully grounded. Transform names stale. citation-marker-removal can remove material. Wording too absolute.

### AD-4: Provider Evolution Contract
Coherent and appropriately scoped. emitsWordBoundaryEvents correctly labeled as future. Extensibility is documentary not operational — acceptable for Kokoro-only phase.

---

## (D) Type-flow matrix assessment

Structurally sound. Critical dependency chain correct. Two integration gates correctly placed. SPRINT_QUEUE.md:82 should reference both ROADMAP.md and ROADMAP_SPECS.md given the split.

---

## (E) Remaining gaps — what would reach 9/10 or 10/10

1. Fix ROADMAP_SPECS.md:284 chunkId line 168→165
2. Replace stale transform list at ROADMAP_SPECS.md:242 with actual IDs from segmentNormalizer.ts:5-17
3. Tighten AD-3: citation-marker removal must be explicitly handled as non-word artifact deletion
4. Clarify engine posture: "Kokoro sole active local/cacheable model engine; Web Speech remains platform fallback"
5. Remove duplicate blocks and NUL padding from ROADMAP_SPECS.md and ROADMAP.md
6. Make NarrationSegmentAnchor executable with type definition and fixture-backed proof
7. Provide fixture/test evidence in package

---

## (F) Final recommendation

**Recommendation: conditionally approve after evidence-cleanup edits.**

Overall score: 7/10. A narrow cleanup pass on evidence defects would raise to 8/10. 9/10+ requires implementation-backed proof.
