# Audit Report — OutsideAudit.8 (2026-05-15)

**Final score: 9/10 — Approved for dispatch**

The OA.8 orientation states that the two remaining OA.7 evidence-package gaps were addressed by adding `useNarration.ts` and `FoliatePageView.tsx` to Batch 2, bringing the package to 10 Batch 1 files and 9 Batch 2 files. I verified both zip batches directly.

---

## (A) Dimension-by-dimension re-scoring table

| Dimension | OA.7 score | OA.8 score | Change rationale and remaining cap |
|---|---:|---:|---|
| Grounding in current codebase | 8 | 9 | The two previously missing cited files, `useNarration.ts` and `FoliatePageView.tsx`, are now present and readable. Core grounding claims across provider registry, IPC disabled pattern, cache identity, normalizer ordering, cache-hit asymmetry, scheduler shape, render DOM lookup, timing metadata, and diagnostics are now verifiable from the package. Capped below 10 because one `useNarration.ts` grounding line is still imprecise: the listed `lastConfirmedAudioWordRef` write sites omit some actual write/call paths. |
| Architectural coherence | 9 | 9 | AD-1 through AD-4 remain coherent. The roadmap correctly separates cache identity from durable segment identity, establishes a three-level timing model, constrains normalization for alignment safety, and defers provider dispatch intentionally. Capped below 10 because several constructs remain future sprint products rather than implemented code. |
| Correct sequencing | 9 | 9 | Sequencing remains correct: dormancy → integration → cache hardening → event sync → normalizer enrichment → render map → pipeline validation → architecture doc. The Sprint 3 and Sprint 4 integration gates are still properly placed. Capped below 10 because `TTS-INTEGRATE-1` still depends on branch-only sync/diagnostic artifacts landing cleanly. |
| Modeling soundness | 9 | 9 | `NarrationSegmentAnchor = { bookId, startIdx, endIdx }` with half-open semantics remains the right durable identity model, and the roadmap correctly treats `chunkId` as normalization-sensitive cache identity. Capped below 10 because the anchor and `normalizedToOriginalMap` are specified but not yet implemented. |
| Extensibility | 8 | 8 | AD-4 is still appropriate for this Kokoro-focused phase: `ProviderCapabilities` is the extension seam, and `emitsWordBoundaryEvents` is correctly marked as future. Capped at 8 because registry-driven runtime dispatch remains deliberately deferred, so extensibility is documented but not operational. |
| Testability | 8 | 8 | The roadmap specifies strong test gates: cache-hit/fresh-hit parity, alignment-map proof, render-map performance validation, and full pipeline integration testing. Capped at 8 because the package does not include actual test files or fixture files, so executable readiness cannot be independently verified. |
| Delivery practicality | 8 | 9 | OA.8 resolves the prior packaging-control blocker. All current source files cited by grounding blocks are now present. `ROADMAP.md` and `ROADMAP_SPECS.md` are complete for the active eight-sprint conveyor. Capped below 10 because the optional future `KOKORO-EXPORT-1` tail in `ROADMAP.md` still ends mid-sentence, and a small citation hygiene issue remains in `useNarration.ts` write-site inventory. |
| Overall confidence | 8 | 9 | The roadmap is now dispatch-safe with high confidence. Remaining issues are not architecture blockers; they are implementation-proof and minor document-polish items. |

---

## (B) Grounding verification results

| Verification target | Result | Assessment |
|---|---|---|
| `useNarration.ts` now included | Present in Batch 2, 1,784 lines. The cited `onTruthSync` path exists at `useNarration.ts:419-423`; `getAudioProgress` exists at `useNarration.ts:1766-1782`; there is no `requestAnimationFrame` loop inside the hook. | Pass. This resolves the OA.7 missing-file blocker. |
| `FoliatePageView.tsx` now included | Present in Batch 2, 1,444 lines. The cited live DOM lookup path is verifiable: `querySelector` at `FoliatePageView.tsx:989` and `1012`; `getBoundingClientRect()` at `991` and `1014`; `querySelectorAll("[data-word-index]")` at `1062`; resize invalidation hooks at `1256` and `1269`. | Pass. This resolves the OA.7 missing-file blocker. |
| All cited current source files in grounding blocks are present | Present: `ttsProvider.ts`, `ttsProviderRegistry.ts`, `segmentNormalizer.ts`, `ttsCache_types.ts`, `ttsCache_utils.ts`, `audioScheduler.ts`, `kokoroStrategy.ts`, `generationPipeline.ts`, `tts-cache.js`, `tts_ipc.js`, `constants.ts`, `highlightSyncController.ts`, `timingMetadataStore.ts`, `narrationPlanner.ts`, `narrateDiagnostics.ts`, `useNarration.ts`, and `FoliatePageView.tsx`. | Pass for current source grounding. Future/new edit targets and test files are not included, which is acceptable for roadmap dispatch. |
| NUL byte absence | Verified zero NUL bytes across all 19 extracted OA.8 package files. | Pass. |
| `chunkId` and `documentLocator` grounding | `kokoroStrategy.ts:164` sets `documentLocator: { bookId }`; `kokoroStrategy.ts:165` sets `chunkId: \`${bookId}:${startIdx}:${normalization.normalizationHash}\``; `timingTruth: "word-native"` is line 167. | Pass. |
| `TTS_NORMALIZER_VERSION` provenance | `segmentNormalizer.ts:1` imports `TTS_NORMALIZER_VERSION` from `../constants`; `constants.ts:159` defines `export const TTS_NORMALIZER_VERSION = "en-v1";`. | Pass. |
| Normalizer transform order | `segmentNormalizer.ts:348-351` applies optional pronunciation overrides first; `segmentNormalizer.ts:353-363` applies the 11 always-applied transforms in order. | Pass. |
| Citation-marker deletion exception | `segmentNormalizer.ts:263-267` removes citation-marker artifacts. `ROADMAP_SPECS.md` now correctly treats this as non-word-artifact deletion rather than ordinary N:1 word contraction. | Pass. |
| Provider posture grounding | `ttsProviderRegistry.ts:37-57` shows Kokoro as selectable, default, cacheable, word-native, and local-model. `ttsProviderRegistry.ts:8-28` shows Web Speech remains selectable but browser/non-cacheable/unreliable-boundary. `ttsProviderRegistry.ts:95-151` shows Nano and Pocket still selectable sidecars before `ENGINE-DORMANCY-1`. | Pass. |
| Qwen IPC disabled pattern | `tts_ipc.js:6-7` defines `QWEN_DISABLED_REASON` and `QWEN_DISABLED_DETAIL`; `tts_ipc.js:28-34` returns `error: QWEN_DISABLED_DETAIL`, `reason: QWEN_DISABLED_REASON`, `status: "unavailable"`, and `recoverable: false`. | Pass. |
| Cache-hit metadata asymmetry | `ttsCache_utils.ts:47-54` returns `audio`, `sampleRate`, `durationMs`, `words`, `startIdx`, and `wordTimestamps`; it does not return `timingTruth`, `boundaryType`, `silenceMs`, or `weightConfig`. `generationPipeline.ts:496-506` creates fresh chunks with `weightConfig`, `boundaryType`, `silenceMs`, and `wordTimestamps`. | Pass. |
| `ScheduledChunk` current shape | `audioScheduler.ts:79-103` defines `ScheduledChunk` with `audio`, `sampleRate`, `durationMs`, `words`, `startIdx`, optional rate/weight/boundary/silence fields, and `wordTimestamps`. It does not yet include `timingTruth` or `chunkId`. | Pass. |
| Timing metadata branch artifact | `timingMetadataStore.ts:38-44` implements `classifyTiming()` with trusted timing only when provider truth is `word-native`, timestamps exist, and timestamp count matches chunk span. `highlightSyncController.ts:52-83` resolves word mode when trusted timing exists and otherwise falls back to chunk/segment mode. | Pass. |
| `lastConfirmedAudioWordRef` write-site inventory | The roadmap correctly identifies major lines, including declaration at `useNarration.ts:151`, Kokoro writes at `994`, and resume writes at `1566`/`1580`. However, actual write/call paths also include `syncNarrationCursor()` at `302`, Qwen callback write at `1045`, and handoff-mediated paths such as `1357`. | Minor partial. This is the only meaningful citation precision issue remaining. It does not undermine the architecture, but it prevents a 10/10 grounding score. |
| `ROADMAP_SPECS.md` completeness | `ROADMAP_SPECS.md` now completes `TTS-ARCH-DOC-1` with all 9 done-when items. | Pass. |
| `ROADMAP.md` TTS-ARCH-DOC-1 done-when | `ROADMAP.md` includes a `Done when` cross-reference and summary for `TTS-ARCH-DOC-1`. | Pass. |

---

## (C) Architecture decisions review

**AD-1: Segment Identity vs Cache Identity.** Coherent and dispatch-ready. The roadmap correctly treats `chunkId` as cache identity because it depends on `normalizationHash`, and `normalizationHash` depends on normalizer version, locale, source hash, normalized hash, override hash, and transform IDs. The durable identity model, `NarrationSegmentAnchor = { bookId, startIdx, endIdx }`, is the right abstraction for later highlight, export, and subtitle work.

**AD-2: Three-Level Timing Hierarchy.** Coherent and well-grounded. The distinction between provider-level timing capability, cache identity timing truth, and per-chunk trusted/heuristic classification is technically sound. The roadmap correctly assigns canonical `classifyTiming()` consolidation to `TTS-CACHE-HARDEN-1`.

**AD-3: Transform Contract Constraint.** Coherent. The roadmap now accurately states that optional pronunciation overrides apply first, followed by 11 always-applied transforms. It also correctly scopes `citation-marker-removal` as non-word-artifact deletion. The remaining risk is execution-level: `normalizedToOriginalMap` must prove alignment correctness with adversarial fixtures.

**AD-4: Provider Evolution Contract.** Coherent and appropriately bounded. `ProviderCapabilities` is the right contract surface. The roadmap correctly labels `emitsWordBoundaryEvents` as future and deliberately defers registry-driven runtime dispatch while Kokoro is the only active local/cacheable model engine.

---

## (D) Type-flow matrix assessment

The type-flow matrix is coherent and complete enough for dispatch.

The dependency chain is correct:

1. `ENGINE-DORMANCY-1` narrows active local/cacheable engine surface and removes Nano/Pocket test instability.
2. `TTS-INTEGRATE-1` lands `HighlightSyncController` and `TimingMetadataStore`.
3. `TTS-CACHE-HARDEN-1` fixes cache-hit/fresh-hit parity before event sync consumes timing truth.
4. `TTS-EVENT-SYNC-1` introduces `normalizedToOriginalMap`, `NarrationSegmentAnchor`, word-boundary events, and `emitsWordBoundaryEvents`.
5. `NORMALIZER-ENRICH-1` expands transforms only after alignment safety is established.
6. `TTS-RENDER-MAP-1` builds O(1) word-position lookup after word identity and event sync are stable.
7. `TTS-PIPELINE-1` verifies the full planner → normalizer → cache → timing → event → render chain.
8. `TTS-ARCH-DOC-1` consolidates decisions and research provenance into governance.

The two key gates are still correctly placed: cache-hit/fresh-hit parity at Sprint 3, and normalizer → alignment map → word-boundary event → highlight-controller proof at Sprint 4.

---

## (E) Remaining gaps: what would reach 10/10

1. Fix the `useNarration.ts` write-site inventory so it is exhaustive or explicitly scoped to "major Kokoro-relevant write/call paths." Include `syncNarrationCursor()` at line 302 and the mediated call paths, or explain why disabled/legacy engine paths are intentionally excluded.
2. Finish or remove the optional future `KOKORO-EXPORT-1` tail in `ROADMAP.md`. It ends mid-sentence after "offline readiness." This is outside the active eight-sprint conveyor, so it does not block dispatch, but it is not audit-perfect document hygiene.
3. Implement the future contracts: `NarrationSegmentAnchor`, `normalizedToOriginalMap`, `classifyTiming()`, `emitsWordBoundaryEvents`, and `WordPositionIndex`.
4. Include representative test files and fixtures once implementation starts, especially cache-hit/fresh-hit parity tests, alignment-map fixtures, render-map latency tests, and the end-to-end narration pipeline integration test.
5. Provide proof that `NarrationSegmentAnchor` remains stable across normalizer-version changes while cache `chunkId` changes as expected.

---

## (F) Final recommendation

**Recommendation: approve for dispatch at 9/10.**

OA.8 resolves the OA.7 package blockers. The cited source files are now present, the key grounding claims are verifiable, the architecture decisions are coherent, and the sprint sequence is correct. Remaining issues are minor document precision or implementation-proof items, not roadmap-specification blockers.

**Overall score: 9/10.**
