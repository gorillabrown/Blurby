# ROADMAP Companion — Architecture Decisions, Type-Flow Matrix, and Sprint Detail

> This file is the companion to ROADMAP.md. It contains architecture decisions, the cross-sprint type-flow matrix, dissolved sprint rationale, and grounding evidence + implementation detail for each active sprint. ROADMAP.md contains the structural dispatch fields.

---

### Architecture Decisions (Resolved)

> Canonical home (post `TTS-ARCH-DOC-1`): `docs/governance/TTS_ARCHITECTURE_DECISIONS.md`.

#### AD-1: Segment Identity vs Cache Identity

Two distinct identity concepts exist in the TTS pipeline:

**Cache identity** (`TtsCacheIdentityV2.chunkId`): `${bookId}:${startIdx}:${normalizationHash}`. This is normalization-sensitive by design — when `TTS_NORMALIZER_VERSION` changes (e.g., NORMALIZER-ENRICH-1 adds transforms), the same text at the same position gets a new `chunkId`, triggering re-generation. This is correct for cache invalidation but WRONG for durable references (export, subtitles, highlight persistence, bookmarks).

**Segment anchor** (`NarrationSegmentAnchor`) *(future — introduced by TTS-EVENT-SYNC-1, validated by TTS-PIPELINE-1; does not exist in current codebase)*: `{ bookId: string, startIdx: number, endIdx: number }`. This is the content-stable identity — it identifies "words 150-175 of this book" regardless of normalizer version, voice, or provider. It does not change when normalization, caching, or audio generation changes.

**NarrationSegmentAnchor precise semantics** (defined here for all consumers):
- `startIdx`: inclusive, 0-based global word index into the book's word array (same coordinate space as `wrapWordsInSpans` `data-word-index` values)
- `endIdx`: exclusive (half-open interval `[startIdx, endIdx)`) — consistent with JavaScript `Array.slice()` and `String.substring()` semantics
- **Global index source:** the word array produced by `epub-word-extractor.js` for the full book, persisted in library as `wordCount`. The global index is stable across sessions because it derives from the EPUB content document order, not from rendering or pagination
- **Section-boundary behavior:** anchors may span section boundaries. A segment that crosses from section N to section N+1 is valid; consumers split rendering at section boundaries but the anchor itself is continuous
- **`sectionId`/`cfi` optionality:** NOT required in the anchor. The anchor is position-based (word indices), not location-based (CFI). Consumers needing CFI (e.g., KOKORO-EXPORT-1 subtitle export) derive it from the word index via the book's section map — the anchor does not carry it
- **Migration behavior:** since the anchor is content-derived (word indices from the EPUB content), it is stable across normalizer version changes, voice changes, and cache invalidation. It only changes if the source EPUB content itself changes (re-import)

Evidence: `kokoroStrategy.ts:165` constructs `chunkId` as `` `${bookId}:${startIdx}:${normalization.normalizationHash}` ``. The `normalizationHash` (computed at `segmentNormalizer.ts:367-374`) includes `TTS_NORMALIZER_VERSION`, `locale`, `sourceTextHash`, `normalizedTextHash`, `pronunciationOverrideHash`, and transform IDs. Any normalizer change produces a different hash → different `chunkId` → cache miss → correct behavior for audio caching, incorrect behavior for segment persistence.

**Decision:** Both identity types coexist. `chunkId` remains the cache key. `NarrationSegmentAnchor` is the durable reference. Export/subtitle/bookmark features (KOKORO-EXPORT-1, deferred) consume `NarrationSegmentAnchor`, not `chunkId`.

#### AD-2: Three-Level Timing Hierarchy

Timing information exists at three deliberate levels of abstraction:

1. **Provider capability** — `TtsProviderTimingTruth` (`src/types/ttsProvider.ts:4-8`): `"word-native" | "segment-following" | "unreliable-boundary" | "none"`. This is the provider's inherent timing quality. Set once in the registry. Kokoro = `"word-native"`, Web Speech = `"unreliable-boundary"`, dormant sidecar engines = `"segment-following"`.

2. **Cache identity** — `TtsCacheIdentityV2.timingTruth` (`src/types/ttsCache.ts:23`): Records which timing truth was active when the chunk was generated and cached. Ensures cache reads know what quality of timing data to expect in the sidecar. Same enum as (1).

3. **Per-chunk classification** — `TtsTimingSidecar.timingClassification` (`src/types/ttsCache.ts:46`): `"trusted" | "heuristic"`. Derived binary decision: "given the provider's truth level AND the actual timestamp data for this specific chunk, can the highlight controller use word-level sync?" Computed by `classifyTiming()` *(future — introduced by TTS-CACHE-HARDEN-1; does not exist in current codebase)* — `"trusted"` requires `timingTruth === "word-native"` AND `wordTimestamps` is non-empty AND `wordTimestamps.length === chunkEndIdx - chunkStartIdx`.

These are NOT redundant. Each serves a different consumer: (1) → settings UI / provider selection, (2) → cache integrity / sidecar expectations, (3) → highlight controller sync-mode decisions. TTS-CACHE-HARDEN-1 makes `classifyTiming()` the single derivation point for (3), ensuring no parallel classification logic exists.

#### AD-3: Transform Contract Constraint

`TransformFn = (text: string) => string` (`segmentNormalizer.ts:48`). All transforms must be **alignment-safe**: word-count-preserving (1:1) or word-count-expanding (1:N). This constraint ensures the diff-based `normalizedToOriginalMap` *(future — produced by TTS-EVENT-SYNC-1; does not exist in current codebase)* can produce correct mappings without per-transform alignment provenance.

The one exception is `citation-marker-removal`, which deletes non-word artifacts (superscript citation markers like 1 2 3); these deletions are handled as non-word-artifact removal in the alignment map — the removed tokens map to no original word index. If a future transform requires N:1 contraction of actual words, the transform contract must be upgraded to a result-object returning alignment info.

Evidence: all 12 current transforms (`segmentNormalizer.ts:5-17`, applied pipeline at `segmentNormalizer.ts:348-363`) are 1:1, 1:N, or non-word-artifact removal. Application order: optional pronunciation overrides FIRST (lines 348-351), then 11 always-applied transforms: `unicode-nfkc`, `citation-marker-removal`, `whitespace-normalization`, `roman-numeral-expansion`, `date-expansion`, `time-expansion`, `currency-expansion`, `abbreviation-expansion`, `spaced-initials`, `ordinal-expansion`, `cardinal-expansion`. Of these, `citation-marker-removal` is the only deletion-type transform; all others are 1:1 or 1:N. NORMALIZER-ENRICH-1 transforms (fractions, decimals, ranges, URLs) are also expansive. No N:1 contraction of actual words is anticipated in the current conveyor.

#### AD-4: Provider Evolution Contract

When a dormant engine is reactivated or a new engine is added, it must implement `ProviderCapabilities` (`src/types/ttsProvider.ts:16-35`). The critical fields for TTS architecture integration are:

- `timingTruth`: determines highlight sync mode (word-native → event-driven, segment-following → chunk-synced fallback)
- `cacheable`: determines whether audio is persisted to disk cache with timing sidecars
- `providesWordTimings`: whether the engine returns `wordTimestamps` on generated chunks
- `emitsWordBoundaryEvents` *(future — added by TTS-EVENT-SYNC-1; not present in current `ProviderCapabilities`)*: whether the engine drives word-boundary callbacks

**Fallback behavior when capabilities are absent:**
- No word boundary events → highlight controller falls back to chunk-synced mode (`highlightSyncController.ts:75-83`, on branch `sprint/tts-sync-1-highlight-controller` — not yet on `main`)
- No word timestamps → timing sidecar records `timingClassification: "heuristic"`, controller uses chunk-synced mode
- Not cacheable → chunks are generated fresh each time, no sidecar, no parity concern

**Language independence of alignment maps:** `normalizedToOriginalMap` maps token positions, not language features. The map is `number[]` where `map[normalizedTokenIndex] = originalWordIndex`. This works for any language whose normalizer produces the same word-count-preserving/expanding transform constraint (AD-3).

### Cross-Sprint Type-Flow Matrix

Shows which types flow between sprints and which sprint produces each type consumed downstream.

```
Sprint 1: ENGINE-DORMANCY-1
  Produces: Updated registry entries (selectable: false, disabledReason, statusKind: "disabled")
  Consumed by: All downstream (test stability, single-engine path)

Sprint 2: TTS-INTEGRATE-1
  Produces: HighlightSyncController + TimingMetadataStore on main
  Consumed by: TTS-CACHE-HARDEN-1 (parity verification), TTS-EVENT-SYNC-1 (event trigger target)

Sprint 3: TTS-CACHE-HARDEN-1
  Produces: ScheduledChunk + {timingTruth?, chunkId?} | classifyTiming() helper | IPC shape guard
  Consumed by: TTS-EVENT-SYNC-1 (trusts cached chunks carry timing), TTS-PIPELINE-1 (parity test)
  Integration gate: cached chunk → scheduler → highlightSyncController produces same decision as fresh chunk

Sprint 4: TTS-EVENT-SYNC-1
  Produces: normalizedToOriginalMap | NarrationSegmentAnchor type | word-boundary event contract | emitsWordBoundaryEvents capability
  Consumed by: NORMALIZER-ENRICH-1 (map must survive new transforms), TTS-RENDER-MAP-1 (anchor for position index), TTS-PIPELINE-1 (end-to-end chain)
  Integration gate: normalizer → alignment map → word-boundary event → highlight controller decision chain

Sprint 5: NORMALIZER-ENRICH-1
  Produces: 8+ new transforms (all word-count-expanding per AD-3) | updated normalizerVersion
  Consumed by: TTS-RENDER-MAP-1 (richer normalized text), TTS-PIPELINE-1 (fixture expansion)
  Constraint: normalizedToOriginalMap.length must still === normalizedTokenCount after new transforms

Sprint 6: TTS-RENDER-MAP-1
  Produces: WordPositionIndex (word → rendered DOM position) | NarrationSegmentAnchor → visual range mapping
  Consumed by: TTS-PIPELINE-1 (position lookup in integration test), TTS-ARCH-DOC-1 (documented)

Sprint 7: TTS-PIPELINE-1
  Produces: End-to-end integration test | NarrationSegment domain type assessment | 15+ golden fixtures
  Consumed by: TTS-ARCH-DOC-1 (test evidence), KOKORO-EXPORT-1 (export-readiness proof)

Sprint 8: TTS-ARCH-DOC-1
  Produces: Architecture decisions document | error taxonomy | findings provenance
  Consumed by: Future audits, onboarding, export planning
```

### Dissolved Sprints

| Sprint | Dissolved | Reason |
|--------|-----------|--------|
| TEST-HARNESS-1 | 2026-05-15 | **Superseded.** The probe failures that motivated this sprint are addressed differently: ENGINE-DORMANCY-1 disables sidecar engines, making Nano probes irrelevant to `npm test`. The eval harness is already stable for the Kokoro-only path. TTS-INTEGRATE-1's integration worktree verified full tests pass (2603/2606) with only pre-existing Nano performance-class failures — evidence that the harness itself is sound. |
| TTS-CANARY-1 | 2026-05-15 | Sidecar readiness probes serve no purpose when MOSS-Nano and Pocket TTS are dormant/disabled; Kokoro readiness is already verified at startup via `KOKORO-DEEPEN-1`. |
| TTS-REGISTRY-DISPATCH-1 | 2026-05-15 | Registry-driven strategy dispatch adds no value with a single active engine; the registry exists (`TTS-REGISTRY-1`) but dispatch routing is unnecessary until a second engine is reactivated. |

> **Dormancy rationale note:** Engine dormancy is a **strategic focus choice**, not a research finding that MOSS-Nano or Pocket TTS are technically invalid. Both engines passed their respective evaluation gates (MOSS-Nano: `NANO_RECOMMENDED_OPT_IN` from 13d; Pocket TTS: functional opt-in from POCKET-TTS-1). Dormancy is motivated by: (a) test instability from MOSS Nano probes blocking TTS-INTEGRATE-1, (b) maintenance surface reduction during Kokoro-focused architecture work, and (c) the product decision to ship one polished engine rather than three partially-maintained ones. Dormancy is **reversible** — reactivation requires only changing registry posture and re-enabling settings selection. No production code is deleted. The research findings support "do not promote sidecar engines to default" and "keep evidence gates"; dormancy extends that to "temporarily disable at settings boundary for focus."



---

### ENGINE-DORMANCY-1 — Detail

##### Grounding evidence (current state)
- **MOSS-Nano registry** (`ttsProviderRegistry.ts:95-122`): `selectable: true`, `disabledReason: null`, `statusKind: "sidecar"`, `timingTruth: "segment-following"`. Must change to: `selectable: false`, `disabledReason: "engine-dormant"`, `statusKind: "disabled"`.
- **Pocket TTS registry** (`ttsProviderRegistry.ts:124-151`): `selectable: true`, `disabledReason: null`, `statusKind: "sidecar"`. Same target state.
- **Qwen reference pattern** (`ttsProviderRegistry.ts:66-93`): `selectable: false`, `disabledReason: "retired-desktop-v2"`, `statusKind: "disabled"`. This is the exact pattern to replicate.
- **IPC guard reference:** `main/ipc/tts.js` — Qwen handlers return `{ reason: "qwen-disabled", error: QWEN_DISABLED_DETAIL, status: "unavailable" }`. Replicate for `tts-nano-*` and `tts-pocket-*` with `reason: "engine-dormant"`.

##### Implementation detail
- **Edit sites:** `src/utils/ttsProviderRegistry.ts` (update MOSS-Nano and Pocket TTS entries); `src/components/settings/TTSSettings.tsx` (dormancy UX); `main/ipc/tts.js` (IPC guards for nano/pocket handlers); `src/hooks/useNarration.ts` (profile migration on load); `tests/mossNanoProbe.test.js` (skip or opt-in gate).
- **Reference:** POSTV2-ENGINE-1 Qwen-disable pattern — `grep` for `qwen-disabled` across `main/ipc/tts.js`, `src/utils/ttsProviderRegistry.ts`, and `src/hooks/useNarration.ts` to see the exact boundary.
- **Tests:** Existing settings/provider tests updated; no new test file needed — this is a posture change, not new functionality.
- **Branch:** `sprint/engine-dormancy-1-kokoro-only`.
- **Commit hygiene:** explicit-stage; do not delete any Nano/Pocket production code.

---

### TTS-INTEGRATE-1 — Detail

##### Grounding evidence (current state)
- **TTS-SYNC-1 branch:** `sprint/tts-sync-1-highlight-controller` at `142dc24` (pushed). Adds `timingMetadataStore.ts` and `highlightSyncController.ts`. Verified: 9 files / 93 tests passed.
- **TTS-DIAG-1 branch:** `sprint/tts-diag-1-diagnostics-bundle` at `c97e446` (pushed, stacked on TTS-SYNC-1). Adds `narrateDiagnostics.ts` updates, settings export, eval-runner validation. Verified: 4 files / 18 tests passed.
- **Prior integration attempt:** Clean worktree `C:\tmp\Blurby-tts-integrate-1` on branch `sprint/tts-integrate-1-sync-diag-main`. Both merges succeeded. Focused sync 9/94 tests passed, focused diagnostics 4/18 passed, typecheck passed, build passed. Full `npm test` failed only in `tests/mossNanoProbe.test.js` (3 performance-class failures, 2603/2606 passed). ENGINE-DORMANCY-1 makes these failures irrelevant.
- **Verification commands:** `npx vitest run tests/highlightSync*.test.ts tests/timingMetadata*.test.ts tests/calmNarration*.test.ts` (sync); `npx vitest run tests/narrateDiag*.test.ts tests/ttsDiag*.test.ts` (diagnostics); `npm run typecheck`; `npm run build`; `npm test`.

##### Implementation detail
- **Recommended branch/worktree:** create a clean temporary worktree from `origin/main`, branch `sprint/tts-integrate-1-sync-diag-main`, merge `origin/sprint/tts-sync-1-highlight-controller`, then merge `origin/sprint/tts-diag-1-diagnostics-bundle`.
- **Conflict policy:** prefer canonical `main` governance structure, then fold in net-new implementation facts from sprint branches. Do not copy branch-local stale roadmap/queue sections wholesale.
- **Verification commands:** focused sync suite from TTS-SYNC-1 closeout; focused diagnostics suite from TTS-DIAG-1 closeout; `npm run typecheck`; `npm run build`; `npm test`; `git diff --check`.
- **Non-goals:** no new TTS architecture, no provider default changes, no Qwen reactivation, no MOSS/Pocket runtime changes, no test-harness refactor yet.
- **Commit hygiene:** explicit-stage only integration-owned files; do not stage unrelated dirty files from canonical main.

---

### TTS-CACHE-HARDEN-1 — Detail

##### Grounding evidence (current state)
- **`ScheduledChunk` interface** (`audioScheduler.ts:79-103`): Currently has `audio`, `sampleRate`, `durationMs`, `words`, `startIdx`, `kokoroRatePlan?`, `weightConfig?`, `boundaryType?`, `silenceMs?`, `wordTimestamps?`. Does NOT have `timingTruth` or `chunkId` — this sprint adds them as optional fields.
- **`loadCachedChunk` return** (`src/utils/ttsCache.ts:26-54`): Returns `{ audio, sampleRate, durationMs, words, startIdx, wordTimestamps }`. Missing vs fresh chunks: `kokoroRatePlan`, `weightConfig`, `boundaryType`, `silenceMs`. The `TtsCacheReadResult.timing` field (`src/types/ttsCache.ts:59`) carries the sidecar but `loadCachedChunk` doesn't currently extract `timingTruth`/`boundaryType` from it.
- **Fresh chunk output** (`generationPipeline.ts:496-506`): Sets `audio`, `sampleRate`, `durationMs`, `words`, `startIdx`, `weightConfig`, `boundaryType`, `silenceMs`, `wordTimestamps`. The asymmetry is observable: scheduler/highlightSyncController receive different metadata for cache hits vs cache misses.
- **Timing hierarchy** (see AD-2 above): Three levels — `TtsProviderTimingTruth` (provider capability, `ttsProvider.ts:4-8`), `TtsCacheIdentityV2.timingTruth` (cache identity, `src/types/ttsCache.ts:23`), `TtsTimingSidecar.timingClassification` (per-chunk derived, `src/types/ttsCache.ts:46`). This sprint's `classifyTiming()` helper makes the derivation from (1)+(data) → (3) explicit and singular.

##### Implementation detail
- **Edit sites (core):** `src/utils/audioScheduler.ts:79-103` (add `timingTruth?`, `chunkId?` to `ScheduledChunk`); `src/utils/ttsCache.ts:26-55` (rehydrate `timingTruth`/`boundaryType` from sidecar in `loadCachedChunk` — the renderer utility); `src/types/ttsCache.ts:36-52` (add `classifyTiming` helper taking full timing record, document `timingClassification` as derived — the type definitions); `src/types/ttsProvider.ts:4-8` (canonical — no change, document as single source); `main/tts-cache.js:135` (v1 key slash encoding); `main/ipc/tts.js` (IPC shape guard on cache read responses).
- **Edit sites (opportunistic, if touched):** `src/utils/generationPipeline.ts` (dangling promise audit, resume flush backpressure check — only if file is already open for cache-parity work).
- **Timing harmonization approach:** `TtsProviderTimingTruth` (`"word-native" | "segment-following" | "unreliable-boundary" | "none"`) is the canonical type. `TtsTimingSidecar.timingClassification` becomes derived: `classifyTiming({ timingTruth, wordTimestamps, chunkStartIdx, chunkEndIdx })` returns `"trusted"` only when all three conditions hold (truth is word-native, timestamps exist, count matches chunk span). No new enum. The helper lives in `src/types/ttsCache.ts` alongside the sidecar type.
- **Integration gate (sprint-level):** At least one test must generate a chunk, cache it, read it back, pipe both the fresh and cached `ScheduledChunk` through a mock `highlightSyncController.resolve()` call, and assert both produce the same `HighlightSyncDecision.mode`. This is the parity proof that downstream consumers can't distinguish cache hits from cache misses.
- **Tests:** New `tests/cacheHitParity.test.ts` (generate a chunk, cache it, read it back, assert metadata fields match + highlight decision parity); expand `tests/segmentNormalizer.test.ts` if normalization-related; new IPC shape validation tests.
- **Branch:** `sprint/tts-cache-harden-1-timing-parity`.
- **Commit hygiene:** explicit-stage; do not change cache eviction behavior; do not delete v1 legacy read path; do not change engine posture.



**Done when (opportunistic — do if touched during core work, skip otherwise):**
8. `generationPipeline.ts` dangling promise audit: verify that every `async` call in the generation hot path is either `await`-ed or has its rejection handled. If dangling promises exist, add explicit `.catch()` handlers that log to diagnostics rather than swallowing silently. *(Do if generationPipeline.ts is already open for cache-parity fixes; otherwise defer.)*
9. Resume flush backpressure: verify that `generationPipeline.ts` resume path does not flush all queued chunks synchronously when unpausing after a long pause. If it does, add a yield point (e.g., `await new Promise(r => setTimeout(r, 0))`) between chunk flushes to prevent audio scheduling starvation. *(Do if resume path is touched during core work; otherwise defer.)*
10. **documentLocator enrichment (opportunistic):** Populate `sectionId` in the `documentLocator` field of `kokoroStrategy.ts` — the `TtsCacheIdentityV2` type already anticipates `sectionId` and `cfi` but the strategy currently only populates `{ bookId }`. If the EPUB section/chapter ID is readily available from the narration context, add it. *(Do if kokoroStrategy cache identity construction is already open for other fixes; otherwise defer.)*



**Full Why (from ROADMAP.md):**
**Why:** The implementation review (2026-05-15) identified that `loadCachedChunk` (`src/utils/ttsCache.ts:46-54`) returns only `audio/sampleRate/durationMs/words/startIdx/wordTimestamps` — it does NOT return `boundaryType`, `silenceMs`, `weightConfig`, or timing truth metadata. Fresh chunks from `generationPipeline.ts:496-506` carry `boundaryType`, `silenceMs`, and `weightConfig`. This means cache hits and cache misses are observably different to the audio scheduler and to TTS-SYNC-1's `HighlightSyncController` (which needs `timingTruth` to make correct highlight decisions). The cross-codebase literature review (2026-05-11 §4.6) additionally identified that composite voice IDs containing `/` can break the legacy v1 cache key format. Timing classification is expressed by three overlapping concepts (`TtsProviderTimingTruth` in `ttsProvider.ts`, `timingClassification: "trusted"|"heuristic"` in `TtsTimingSidecar`, and `timingTruth` on `TtsCacheIdentityV2`) that should be harmonized before TTS-EVENT-SYNC-1 builds on them.


---

### TTS-EVENT-SYNC-1 — Detail

##### Grounding evidence (current state)
- **`SegmentNormalizationResult`** (`segmentNormalizer.ts:28-38`): Currently has `originalText`, `normalizedText`, `locale`, `transforms`, `sourceTextHash`, `normalizedTextHash`, `normalizerVersion`, `pronunciationOverrideHash`. Does NOT have `normalizedToOriginalMap` — this sprint adds it.
- **`ProviderCapabilities`** (`ttsProvider.ts:16-35`): Has `timingTruth`, `cacheable`, `providesWordTimings`, `selectable`, `disabledReason`, `statusKind`. Does NOT have `emitsWordBoundaryEvents` — this sprint adds it.
- **`onTruthSync` current path** (`useNarration.ts:419-423`): Visual-only — does NOT write `lastConfirmedAudioWordRef`. Called from `kokoroStrategy.ts:281-290`. This is the callback to promote from visual-hint to primary trigger.
- **`lastConfirmedAudioWordRef` write sites** (`useNarration.ts`): All Kokoro-relevant writes: 151 (declaration), 302 (syncNarrationCursor — external mode-start trigger), 843, 857, 928, 936 (Kokoro chunk-completion callbacks), 994 (Kokoro word-progress callback), 1199, 1254, 1310 (auto-start/resume entry points), 1566, 1580 (pause/reopen resume writes). Line 1045 is a Qwen-engine callback (disabled path — included for completeness). Line 1382 is a read-guard, not a write. Ownership invariant (LL-079) — event-driven path feeds into existing writes, does not add new write sites.
- **RAF absence in useNarration:** No RAF loop inside the hook — callers run their own RAF. `getAudioProgress` (`useNarration.ts:1766-1782`) routes to active engine. The RAF demotion target is in `FoliatePageView.tsx`, not `useNarration.ts`.
- **`highlightSyncController.resolve()`** (on UNMERGED branch `sprint/tts-sync-1-highlight-controller`): Takes `HighlightSyncResolveInput` with optional `chunkId`, `wordIndex`, `followingEnabled`, `fallbackMode`. Returns `HighlightSyncDecision` with `mode: "word" | "chunk" | "segment" | "off"`. Interface is unchanged by this sprint — called from event handler instead of RAF.
- **12 current transforms** (`segmentNormalizer.ts:5-17`, pipeline at `segmentNormalizer.ts:348-363`): Optional pronunciation overrides applied FIRST (lines 348-351), then 11 always-applied transforms in order: `unicode-nfkc`, `citation-marker-removal`, `whitespace-normalization`, `roman-numeral-expansion`, `date-expansion`, `time-expansion`, `currency-expansion`, `abbreviation-expansion`, `spaced-initials`, `ordinal-expansion`, `cardinal-expansion`. All are alignment-safe per AD-3: 1:1 (word-count-preserving), 1:N (expanding), or non-word-artifact removal (`citation-marker-removal`).
- **`chunkId` construction** (`kokoroStrategy.ts:165`): `` `${bookId}:${startIdx}:${normalization.normalizationHash}` ``. The `normalizationHash` is normalization-sensitive (AD-1). This sprint introduces `NarrationSegmentAnchor = { bookId, startIdx, endIdx }` as the content-stable identity alongside it.
- **Integration gate:** normalizer produces `normalizedToOriginalMap` → Kokoro strategy uses map to resolve normalized token index to original word index → word-boundary event carries resolved original index → `highlightSyncController.resolve()` receives original `wordIndex` and produces same `HighlightSyncDecision.mode` as current RAF-driven path. End-to-end test must verify this chain.

##### Implementation detail
- **Edit sites:** `src/utils/segmentNormalizer.ts` (add `normalizedToOriginalMap` to result, build during normalization); `src/types/ttsProvider.ts` (add `emitsWordBoundaryEvents` to `ProviderCapabilities`, define `WordBoundaryEvent` type, add `NarrationSegmentAnchor` type); `src/utils/ttsProviderRegistry.ts` (set capability per provider); `src/hooks/narration/kokoroStrategy.ts` (resolve normalizedIdx → originalIdx via map before emitting, promote to provider-level callback); `src/hooks/useNarration.ts` (consume word-boundary events as primary trigger, remove RAF polling from word-highlight path); `src/utils/narrateDiagnostics.ts` (add `"word-boundary-event"` type); `tests/fixtures/tts-normalization/english-v1.json` (add `expectedAlignmentMap` to fixtures).
- **Reference implementation:** RealtimeTTS `StreamPlayer._play_wav_chunk` — drains timing queue, fires `on_word_spoken(timing)` when `timing.start_time <= seconds_played`. Blurby's equivalent: Kokoro scheduler emits word boundary when audio playback crosses the word's start timestamp.
- **Key invariant:** `normalizedToOriginalMap.length === normalizedTokenCount`. Every normalized token maps to exactly one original word index. Expansions (one original → multiple normalized) produce repeated original indices. Contractions (multiple original → one normalized) should not occur in the current transform set but must be handled defensively.
- **Tests:** New `tests/normalizedToOriginalMap.test.ts` (alignment table correctness across all transforms); update `tests/segmentNormalizer.test.ts` (verify map in existing fixtures); update `tests/highlightSyncController.test.ts` (event-driven trigger path); new `tests/eventDrivenSync.test.ts` (end-to-end event → highlight decision).
- **Branch:** `sprint/tts-event-sync-1-word-boundary-events`.
- **Commit hygiene:** explicit-stage; do not re-open Qwen or change engine posture; do not modify `lastConfirmedAudioWordRef` ownership.- **RAF fallback preservation:** The RAF `getAudioProgress()` polling loop MUST be preserved as a fallback path for `timingTruth !== "word-native"` modes. Event-driven sync replaces RAF only for word-native timing. RAF removal is conditional on measurement, not assumed.
- **Segment identity scoping (RESOLVED — see AD-1):** The assessment is complete. `chunkId` (`${bookId}:${startIdx}:${normalizationHash}`) IS normalization-sensitive — confirmed by code inspection: `kokoroStrategy.ts:165` constructs it with `normalizationHash`, which includes `TTS_NORMALIZER_VERSION` (`segmentNormalizer.ts:367-374`). Any normalizer change (e.g., NORMALIZER-ENRICH-1) produces a different hash → different `chunkId`. This is correct for cache invalidation but wrong for durable references. **Resolution:** This sprint introduces `NarrationSegmentAnchor = { bookId: string, startIdx: number, endIdx: number }` as the content-stable identity. Both identity types coexist: `chunkId` remains the cache key, `NarrationSegmentAnchor` is the durable reference for export/subtitles/bookmarks (KOKORO-EXPORT-1). **Verification gate:** Confirm `NarrationSegmentAnchor` is sufficient for all downstream consumers identified in TTS-PIPELINE-1's domain type assessment (criterion 9). No separate `TTS-SEGMENT-ALIGN-1` sprint is needed.


---

### NORMALIZER-ENRICH-1 — Detail

##### Grounding evidence (current state)
- **Current transform pipeline** (`segmentNormalizer.ts:348-363`): Optional pronunciation overrides applied FIRST (lines 348-351), then 11 always-applied transforms in order: `unicode-nfkc`, `citation-marker-removal`, `whitespace-normalization`, `roman-numeral-expansion`, `date-expansion`, `time-expansion`, `currency-expansion`, `abbreviation-expansion`, `spaced-initials`, `ordinal-expansion`, `cardinal-expansion`. All are alignment-safe per AD-3.
- **`TransformFn` interface** (`segmentNormalizer.ts:48`): `(text: string) => string`. This is NOT changed — new transforms use the same interface.
- **`TTS_NORMALIZER_VERSION`**: Bumping this value triggers lazy cache invalidation for all segments. Imported at `segmentNormalizer.ts:1` from `../constants` (defined in `src/constants.ts`). NORMALIZER-ENRICH-1 bumps it once after all new transforms are added.
- **`normalizedToOriginalMap`** (added by TTS-EVENT-SYNC-1): Must remain valid after new transforms. Each new 1:N expansion (e.g., "3/4" → "three quarters") produces repeated original indices in the map. The diff-based map builder walks token lists before/after each transform — new expansive transforms are naturally supported.
- **abogen transform gap**: abogen has 20+ transforms; Blurby has 12. Missing: dotted-acronym, address-abbreviation, URL normalization, fraction, decimal, number-range, terminal-punctuation, all-caps-quote-downcasing, heteronym disambiguation. Each gap produces raw text that Kokoro must guess at phonemizing.

##### Implementation detail
- **Edit sites:** `src/utils/segmentNormalizer.ts` (add 9 new transform functions, insert into pipeline array at correct positions, update `normalizedToOriginalMap` building); `tests/fixtures/tts-normalization/english-v1.json` (add ≥18 new fixture entries); `src/utils/segmentNormalizer.ts` constants section (heteronym lookup table, address abbreviation map, URL regex).
- **Transform reference (abogen pipeline order):** dates → times → dotted-acronyms → address-abbreviations → (internet-slang, opt-in) → apostrophes/contractions → titles/suffixes → terminal-punctuation → all-caps-quotes → phoneme-hints. Blurby adapts this order into its existing 12-transform pipeline, interleaving new transforms at the correct positions.
- **Alignment-map compatibility (A9 awareness):** Each new transform must maintain alignment-map compatibility per TTS-EVENT-SYNC-1's contract. The `TransformFn = (text: string) => string` interface is NOT changed — instead, the `normalizedToOriginalMap` is built by diffing token lists before/after each transform. Transforms that expand tokens (e.g., "$5" → "five dollars") produce repeated original indices in the map. Verify this works for each new transform's expansion patterns.
- **Heteronym approach:** Pure text substitution — replace "read" (past tense context: preceded by "had", "have", "has", "already", followed by past-tense indicators) with "red" as the phonemizer input. Map maintained in a `HETERONYM_TABLE: Record<string, {alternateSpelling: string, contextTest: (before: string[], after: string[]) => boolean}>`.
- **Tests:** Expand `tests/segmentNormalizer.test.ts` with new transform coverage; new `tests/heteronymDisambiguation.test.ts` for context-window heuristics; verify `normalizedToOriginalMap` integrity across all new transforms.
- **Branch:** `sprint/normalizer-enrich-1-abogen-gap-fill`.
- **Commit hygiene:** explicit-stage; do not change normalization behavior for existing transforms; version bump triggers lazy cache invalidation only.

---

### TTS-RENDER-MAP-1 — Detail

##### Grounding evidence (current state)
- **Live DOM queries per word advance** (`FoliatePageView.tsx`): `querySelector(`[data-word-index="${wordIndex}"]`)` at lines 989 and 1012, each followed by `getBoundingClientRect()` at lines 991 and 1014. These run on every word advance during narration — O(n) DOM search + forced layout reflow per word.
- **`querySelectorAll("[data-word-index]")`** (`FoliatePageView.tsx:1062`): Used for first-visible-word walk. Each element gets `getBoundingClientRect()` (line 1064). This is the pattern the index replaces.
- **ResizeObserver** (`FoliatePageView.tsx:1256, 1269`): Already observes container for flow-zone CSS recalculation and Foliate renderer reflow. These existing callbacks are natural invalidation triggers for the word position index.
- **Word span injection**: foliate-js renders word spans with `data-word-index` attributes via `wrapWordsInSpans` (async batched, `STAB-1A`). The index builds after this injection completes.
- **Estimated latency**: Each `querySelector` + `getBoundingClientRect` call is ~5-8ms at p95 on mid-range hardware with 3,000+ word spans. Pre-built index lookup is O(1) Map.get — target ≤2ms at p95.

##### Implementation detail
- **Edit sites:** New `src/utils/wordPositionIndex.ts` (index class: build from DOM, get by wordIndex, invalidate, rebuild); `src/components/FoliatePageView.tsx` (build index after word-span injection, use index in event-driven highlight path, wire invalidation to resize/render/section events); `src/utils/narrateDiagnostics.ts` (add `"word-position-index-build"` and `"word-position-index-miss"` event types); `src/utils/foliateHelpers.ts` (extract word-span query logic if currently inlined).
- **Index structure:** `Map<number, {top: number, left: number, width: number, height: number, lineTop: number, lineHeight: number}>`. Built by iterating all `[data-word-index]` spans once via `querySelectorAll` + `getBoundingClientRect()`. Stored as a ref on FoliatePageView, not in React state (avoids re-render on build).
- **Invalidation triggers:** `foliateRenderVersion` change (existing ref), `ResizeObserver` callback (existing — lines 1256, 1269), section navigation (`onLoad`/`onRelocate`), font-size/zoom settings change. Debounced rebuild (100ms) to avoid thrashing during resize drag.
- **Tests:** New `tests/wordPositionIndex.test.ts` (build, lookup, invalidation, fallback); update `tests/calmNarrationBand.test.ts` (verify indexed lookup path); performance test with mocked 5,000-span section.
- **Branch:** `sprint/tts-render-map-1-word-position-index`.
- **Commit hygiene:** explicit-stage; do not modify narration state machine or word-advance ownership.

---

### TTS-PIPELINE-1 — Detail

##### Grounding evidence (current state)
- **Pipeline modules to chain in integration test:**
  - `narrationPlanner.ts`: `buildNarrationPlan()` → produces `PlannedChunk[]` with `startIdx`, `endIdx`, `boundaryType`, `silenceMs`
  - `segmentNormalizer.ts`: `normalizeSegmentText()` → produces `SegmentNormalizationResult` with `originalText`, `normalizedText`, `sourceTextHash`, `normalizedTextHash`, `normalizerVersion`, `pronunciationOverrideHash`, `normalizedToOriginalMap` (from TTS-EVENT-SYNC-1)
  - `kokoroStrategy.ts:151-169`: Cache identity construction — `chunkId` at line 165, `documentLocator: { bookId }` at line 164
  - `src/types/ttsCache.ts`: `TtsCacheIdentityV2` type (`src/types/ttsCache.ts:10-24`) — `schemaVersion: 2`, `provider`, `voiceId`, `rateBucket`, `modelVersion`, `sourceTextHash`, `normalizedTextHash`, `normalizerVersion`, `pronunciationOverrideHash`, `documentLocator`, `chunkId`, `sampleRate`, `timingTruth`
  - `src/types/ttsCache.ts:36-52`: `TtsTimingSidecar` — `timingClassification: "trusted" | "heuristic"`
  - `src/utils/ttsCache.ts`: Renderer-side cache utility — `loadCachedChunk` (lines 26-55), `cacheChunk` (lines 61-75), `isCached`, `getCachedChunks`, `evictBook`, `evictBookVoice`, `getCacheInfo`, `getOpeningCoverageMs`
- **Current fixture count:** 8 golden fixtures in `english-v1.json` (ordinary-prose, dialogue, heading-roman, line-break, number-ordinals, footnote-marker, numeric-us-date, abbreviations). Target: ≥15.
- **Missing coverage:** No test currently chains planner → normalizer → cache identity → timing sidecar → word-boundary event → position index. Each module has isolated unit tests.
- **NarrationSegment assessment target:** Four overlapping types describe the same entity — `PlannedChunk` (planner), `SegmentNormalizationResult` (normalizer), `TtsCacheIdentityV2` (cache), `TimingMetadataChunk` (timing store). The integration test exercises all four and documents whether consolidation into a single `NarrationSegment` domain type reduces coupling.
- **`NarrationSegmentAnchor`** (from TTS-EVENT-SYNC-1, AD-1): The integration test validates that `NarrationSegmentAnchor = { bookId, startIdx, endIdx }` is content-stable across normalizer version changes by running the same text through two normalizer versions and asserting identical anchors with different `chunkId`s.

##### Implementation detail
- **Edit sites:** New `tests/narrationPipelineIntegration.test.ts`; `tests/fixtures/tts-normalization/english-v1.json` (expand fixtures array); optional pure helper extraction from `src/hooks/narration/kokoroStrategy.ts` into `src/utils/ttsCacheIdentity.ts` if the production cache identity path is otherwise private.
- **Imports needed:** `buildNarrationPlan` from `src/utils/narrationPlanner.ts`; `normalizeSegmentText`, `stableSegmentTextHash` from `src/utils/segmentNormalizer.ts`; `TtsCacheIdentityV2` type from `src/types/ttsCache.ts`.
- **Tests:** Integration test(s) in new file; expanded fixture validation in existing `tests/segmentNormalizer.test.ts`; if helper extraction occurs, focused tests must prove Kokoro still uses the same identity fields.
- **Branch:** `sprint/tts-pipeline-1-integration-test`.
- **Commit hygiene:** explicit-stage; keep production edits limited to pure-helper extraction if needed for production-path identity coverage.

---

### TTS-ARCH-DOC-1 — Detail

**Implementation detail:**

Create `docs/governance/TTS_ARCHITECTURE_DECISIONS.md` with the following sections:

1. **Document header** — purpose, scope, last-updated date, link to TECHNICAL_REFERENCE for runtime details.
2. **Engine Posture Decisions** — table of all engines (Kokoro, MOSS-Nano, Pocket TTS, Qwen, Web Speech) with current status (active/dormant/retired/disabled), decision date, rationale, and reactivation conditions. Source: MOSS_DECISION_LOG, QWEN_SUPPORTED_HOST_POLICY, ENGINE-DORMANCY-1 closeout.
3. **Architecture Layer Inventory** — table mapping each TTS subsystem (provider registry, segment normalizer, cache identity, timing sidecars, highlight sync controller, timing metadata store, diagnostics bundle, narration planner, audio scheduler, generation pipeline) to its source file, sprint of origin, and architectural invariants. Source: TECHNICAL_REFERENCE + sprint closeouts.
4. **Adopt/Reject/Defer Register** — structured table of every technology, pattern, or approach evaluated during the TTS literature review and adversarial review, with verdict (adopt/reject/defer) and one-line rationale. Source: literature review, adversarial review.
5. **Key Architectural Invariants** — numbered list of invariants that must hold across all future TTS work (e.g., "timing metadata must be fail-closed — missing/heuristic timing downgrades to chunk sync, never invents word boundaries"; "cache identity must include normalizer version and pronunciation override hash"; "diagnostics bundle must never contain raw book text or audio payloads"). Source: LESSONS_LEARNED TTS entries + sprint specs.
6. **Dormancy Contract** — what "dormant" means for MOSS-Nano and Pocket TTS (disabled at settings boundary, disabled at IPC runtime entry, registry posture = dormant, reactivation requires changing registry posture + re-enabling settings selection). Source: ENGINE-DORMANCY-1 spec.
7. **Research Provenance** — table linking each research-driven sprint (TTS-EVENT-SYNC-1, NORMALIZER-ENRICH-1, TTS-RENDER-MAP-1) to its source codebase (readest, RealtimeTTS, abogen, sioyek) and what was adopted vs. adapted.
8. **Future Work** — KOKORO-EXPORT-1 scope and prerequisites; conditions for engine reactivation; deferred lanes.
9. **Error Taxonomy** — classified error states across the TTS pipeline: generation failures (model load, inference timeout, OOM), cache errors (corrupt manifest, sidecar mismatch, key collision), scheduling errors (buffer underrun, stale chunk, timing drift), and IPC errors (shape validation failure, timeout, disconnected engine). Each error class has: name, source module, current handling, severity, and recommended recovery. Source: Implementation review P3 #15.
10. **Findings Provenance** — table linking every adopted action item from both research documents (cross-codebase TTS literature review 2026-05-11, Kokoro TTS implementation review 2026-05-15) to its target sprint, disposition (adopted/adapted/rejected/deferred), and rationale.
11. **Cache Evolution Roadmap** — document the v1→v2 cache identity migration (TTS-CACHE-TIMING-1), the timing parity fix (TTS-CACHE-HARDEN-1), the current dual-path read (v1 legacy + v2 structured), and the path to potential content-addressed caching (TTS-PIPELINE-1 assessment).

##### Grounding evidence (source files)
- **Engine posture decisions:** `docs/testing/MOSS_DECISION_LOG.md` (MOSS-Nano gate decisions), `docs/governance/QWEN_SUPPORTED_HOST_POLICY.md` (Qwen disable rationale), ENGINE-DORMANCY-1 closeout (dormancy enforcement pattern)
- **Architecture layer inventory:** 10 TTS subsystems with source files: provider registry (`ttsProviderRegistry.ts`), segment normalizer (`segmentNormalizer.ts`), cache identity (`src/types/ttsCache.ts` types + `src/utils/ttsCache.ts` renderer utility + `main/tts-cache.js` main-process persistence), timing sidecars (`src/types/ttsCache.ts` TtsTimingSidecar), highlight sync controller (`highlightSyncController.ts` — on TTS-SYNC-1 branch), timing metadata store (`timingMetadataStore.ts` — on TTS-SYNC-1 branch), diagnostics bundle (`narrateDiagnostics.ts`), narration planner (`narrationPlanner.ts`), audio scheduler (`audioScheduler.ts`), generation pipeline (`generationPipeline.ts`)
- **Adopt/reject/defer register source:** `docs/planning/roadmap-reviews/2026-05-11-literature-review.md` (765 lines, 4 codebases evaluated), `docs/planning/roadmap-reviews/2026-05-14-adversarial-review.md` (gap analysis)
- **Key invariants source:** `docs/governance/LESSONS_LEARNED.md` — TTS-tagged entries (LL-079 through LL-116), plus sprint specs in ROADMAP.md
- **Research provenance:** TTS-EVENT-SYNC-1 ← readest + RealtimeTTS + sioyek; NORMALIZER-ENRICH-1 ← abogen; TTS-RENDER-MAP-1 ← sioyek
- **Resolved architecture decisions (AD-1 through AD-4):** Already documented in ROADMAP_SPECS.md `### Architecture Decisions (Resolved)` section — this sprint migrates them to the standing governance document

**Done when:**
1. `docs/governance/TTS_ARCHITECTURE_DECISIONS.md` exists with all 11 sections populated.
2. Every engine has a posture entry with status, date, rationale, and reactivation conditions.
3. Every TTS subsystem has an architecture layer entry with source file and invariants.
4. TECHNICAL_REFERENCE.md § "Narrate Mode Architecture" links to the new document.
5. Error taxonomy covers ≥4 error classes with source module, handling, severity, and recovery.
6. Findings provenance table accounts for every P1/P2 item from both research documents (cross-codebase TTS literature review, Kokoro TTS implementation review) with disposition and target sprint.
7. Cache evolution roadmap documents v1→v2 migration, timing parity fix, dual-path read, and content-addressed caching assessment path.
8. AD-1 through AD-4 migrated verbatim from ROADMAP_SPECS.md into the governance document.
9. ROADMAP_SPECS.md updated to reference the new governance document as the canonical home for architecture decisions post-completion.
