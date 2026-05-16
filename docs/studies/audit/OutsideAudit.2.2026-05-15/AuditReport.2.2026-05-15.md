# Audit Report — OutsideAudit.2 (2026-05-15)

**Audit:** OutsideAudit.2.2026-05-15
**Type:** Targeted re-audit
**Prior audit:** OutsideAudit.1 (score: 5/10)
**Overall score:** 6/10

---

## (A) Dimension-by-dimension re-scoring

| Dimension | Prior score | New score | Change rationale |
|-----------|----------:|--------:|-----------------|
| Grounding in current codebase | 5-6 | 7 | The revised material is substantially more grounded than OutsideAudit.1. AD-1, AD-2, AD-3, ENGINE-DORMANCY-1, and several SPRINT_QUEUE pointers now tie directly to actual Batch 2 files. However, the packaged `ROADMAP.md` still does not contain all eight sprint bodies. It is 679 lines and ends after `ENGINE-DORMANCY-1`; therefore I could not verify "grounding evidence blocks on all 8 sprints" as claimed. |
| Architectural coherence | 6 | 7 | AD-1 through AD-4 materially improve architectural coherence. The distinction between cache identity and durable segment anchor is the most important improvement. AD-2's three-level timing hierarchy is also conceptually sound. Coherence is still limited by unresolved document drift and by future fields, such as `emitsWordBoundaryEvents`, being discussed before they exist in the current type model. |
| Correct sequencing | 5 | 6 | The sequence is better justified: dormancy → integration → cache hardening → event sync is still the correct critical path. The new type-flow matrix places integration gates at the right conceptual points. The score remains capped because the sprint bodies needed to verify sequencing detail are absent from the delivered `ROADMAP.md`, and `SPRINT_QUEUE.md` still contains older wording for TTS-EVENT-SYNC-1. |
| Modeling soundness | 4 | 7 | AD-1 directly addresses the largest prior modeling defect: cache-derived `chunkId` is no longer treated as the durable segment identity. `NarrationSegmentAnchor = { bookId, startIdx, endIdx }` is a good baseline model. It is not yet a 9 because the anchor contract still needs exact semantics: inclusive/exclusive `endIdx`, global index stability, section-boundary behavior, and whether `sectionId`/`cfi` are required for export-grade durability. |
| Extensibility | 5-6 | 7 | AD-4 improves provider extensibility by tying future engines to `ProviderCapabilities`. The provider model is better than before, but the registry still is not runtime dispatch, and `emitsWordBoundaryEvents` is not present in current `ProviderCapabilities`. Deferring registry dispatch is reasonable for a Kokoro-only phase, but it limits the extensibility score. |
| Testability | 5 | 6 | The added integration gates improve testability, especially cache-hit parity before event sync and alignment-map proof before normalizer enrichment. However, the detailed test criteria are not fully visible in the delivered `ROADMAP.md`, and `SPRINT_QUEUE.md` does not fully reflect the claimed segment identity hard gate. |
| Delivery practicality | 6 | 6 | Effort adjustments are directionally better: TTS-EVENT-SYNC-1 moving to M-L and TTS-PIPELINE-1 moving to M are more realistic than the original sizing. Delivery practicality is still constrained by artifact drift. If the implementation team works from an unseen canonical roadmap, execution may be practical; if it works from this package, the roadmap is not complete enough. |
| Overall confidence | 5 | 6 | The architecture is materially improved, but the re-audit package does not fully substantiate the claimed remediation. I would raise the roadmap from 5/10 to 6/10, not higher, because the most important conceptual defect was addressed but the primary execution artifact remains incomplete in the delivered package. |

---

## (B) Grounding verification results

### Block 1: ENGINE-DORMANCY-1 registry grounding
**Claim checked:** `ROADMAP.md:667-670` states that MOSS-Nano is selectable with `disabledReason: null`, `statusKind: "sidecar"`, and `timingTruth: "segment-following"`; Pocket TTS is also selectable with `disabledReason: null` and `statusKind: "sidecar"`; Qwen is the disabled reference pattern.
**Source verification:** Accurate.
**Assessment:** Pass. This is a correctly grounded evidence block.

### Block 2: AD-1 cache identity vs segment identity
**Claim checked:** `ROADMAP.md:545-555` states that `TtsCacheIdentityV2.chunkId` is `${bookId}:${startIdx}:${normalizationHash}`, and that `normalizationHash` includes `TTS_NORMALIZER_VERSION`, locale, source hash, normalized hash, pronunciation override hash, and transform IDs.
**Source verification:** Conceptually accurate, with a minor line-number error. The actual `chunkId` line is `kokoroStrategy.ts:165`, not `kokoroStrategy.ts:168` as stated.
**Assessment:** Substantive pass; citation precision needs correction.

### Block 3: AD-2 three-level timing hierarchy
**Claim checked:** `ROADMAP.md:557-567` states timing exists at provider capability, cache identity, and per-chunk sidecar classification levels.
**Source verification:** Mostly accurate. `timingClassification` is at line 46, not 47. `classifyTiming()` is not present in Batch 2 source — should be phrased as a target helper.
**Assessment:** Conceptual pass; current-state wording should distinguish present fields from future helper.

### Block 4: AD-3 transform contract constraint
**Claim checked:** `TransformFn = (text: string) => string` and current transforms are word-count-preserving or word-count-expanding.
**Source verification:** Mostly accurate. Contract is coherent but requires adversarial alignment fixtures for enforcement.
**Assessment:** Pass with a testing caveat.

### Block 5: TTS-CACHE-HARDEN-1 grounding
**Claim checked:** ScheduledChunk, loadCachedChunk, and TtsTimingSidecar as current-state grounding for cache-hit parity work.
**Source verification:** Accurate. Correctly identifies the fresh-generation/cache-hit asymmetry.
**Assessment:** Pass. This is one of the strongest grounding blocks.

### Block 6: TTS-EVENT-SYNC-1 remediation consistency
**Source verification:** Partially inconsistent. Type-flow matrix improved, but SPRINT_QUEUE.md still uses stale wording and does not show the claimed Phase 0 segment identity hard stop.
**Assessment:** Partial pass.

---

## (C) Architecture decisions review

### AD-1: Segment Identity vs Cache Identity
**Verdict:** Coherent and materially responsive to OutsideAudit.1. Key correction. Needs exact anchor semantics (inclusive/exclusive endIdx, global index stability, section-boundary behavior, sectionId/cfi optionality).

### AD-2: Three-Level Timing Hierarchy
**Verdict:** Coherent and well-evidenced. `classifyTiming()` should be labeled as future (TTS-CACHE-HARDEN-1 target).

### AD-3: Transform Contract Constraint
**Verdict:** Coherent but test-dependent. Enforcement mechanism (adversarial fixtures in TTS-EVENT-SYNC-1 Phase 0) is not optional.

### AD-4: Provider Evolution Contract
**Verdict:** Directionally coherent. `emitsWordBoundaryEvents` should be labeled as future field. `highlightSyncController.ts` not in Batch 2 for fallback verification.

---

## (D) Type-flow matrix assessment

Dependency chain is broadly sound. Integration gates correctly placed. Three weaknesses:
1. Depends on branch-only artifacts (HighlightSyncController, TimingMetadataStore)
2. Declares future types without sprint body definitions visible
3. TTS-PIPELINE-1 NarrationSegment assessment not reflected in SPRINT_QUEUE.md detail

---

## (E) Remaining gaps — what would reach 9/10 or 10/10

1. **Deliver the complete ROADMAP.md** — the central claim is not verifiable from the package
2. **Synchronize SPRINT_QUEUE.md** with claimed remediation
3. **Fix line-level citation drift** (kokoroStrategy.ts:168→165, ttsCache.ts:47→46)
4. **Mark future constructs explicitly** (classifyTiming, NarrationSegmentAnchor, normalizedToOriginalMap, emitsWordBoundaryEvents, WordPositionIndex)
5. **Include all referenced source files** (main/ipc/tts.js, main/tts-cache.js, highlightSyncController.ts, timingMetadataStore.ts)
6. **Define NarrationSegmentAnchor precisely** (endIdx inclusive/exclusive, global index source, section relocation, sectionId/cfi optionality, migration behavior)
7. **Make AD-3 enforceable** with tests proving token-count preservation
8. **Expand TTS-PIPELINE-1 detail** to explicitly cover NarrationSegment assessment and all integration paths

---

## (F) Final recommendation

**Final recommendation: conditional approval after artifact repair.**

The architecture is materially improved. AD-1 is the key correction. The type-flow matrix gives the conveyor a more defensible dependency chain. Those changes justify raising from 5/10 to 6/10.

Cannot score higher because the central claim (all 8 sprint specs with grounding evidence) is not verifiable from the delivered package.

**Overall score: 6/10.**
