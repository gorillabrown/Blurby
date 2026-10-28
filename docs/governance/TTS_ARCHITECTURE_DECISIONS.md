# TTS Architecture Decisions

## Document Header

- Purpose: capture the durable architecture decisions that govern Blurby's TTS pipeline after the TTS Architecture Completion conveyor.
- Scope: engine posture, pipeline layers, invariants, dormancy/reactivation rules, research provenance, and deferred architecture lanes.
- Last updated: 2026-05-17.
- Runtime implementation detail reference: `docs/governance/TECHNICAL_REFERENCE.md` (see Narrate Mode Architecture section).

## 1. Engine Posture Decisions

| Engine | Current status | Decision date | Rationale | Reactivation conditions |
|---|---|---|---|---|
| Kokoro | Active default / operational floor | 2026-05-16 (`ENGINE-DORMANCY-1` close-out reaffirmation) | Only engine kept fully active through TTS Architecture Completion; provides trusted word-native timing. | N/A (already active). |
| MOSS-Nano | Dormant (settings + IPC disabled) | 2026-05-16 (`ENGINE-DORMANCY-1`) | Prevent multi-engine drift while finishing Kokoro reliability conveyor. Keep code intact for reversible posture. | 1) Change registry posture (`selectable`, `disabledReason`, copy) in `src/utils/ttsProviderRegistry.ts`; 2) re-enable runtime IPC entry points in `main/ipc/tts.js`; 3) re-enable settings selection UX; 4) pass full gate verification. |
| Pocket TTS | Dormant (settings + IPC disabled) | 2026-05-16 (`ENGINE-DORMANCY-1`) | Same dormancy rationale as Nano; isolate Kokoro stabilization path while preserving future optional lane. | Same four-step reactivation contract as Nano. |
| Qwen | Retired/disabled | 2026-05-15 (`QWEN_SUPPORTED_HOST_POLICY.md`) | Desktop v2 posture keeps Qwen non-selectable and non-runtime-active. | Separate post-v2 approved sprint; must not ride along with unrelated TTS work. |
| Web Speech | Active fallback only | Reaffirmed 2026-05-11 literature/codebase review | Keep platform reach layer but do not treat boundary events as timing truth authority. | N/A; fallback role remains by design. |

Notes:
- `MOSS-NANO-13e` recorded Nano as "recommended opt-in" at product-decision time, but current architecture conveyor posture is still dormant until explicit reactivation.
- Qwen remains disabled regardless of local runtime presence (`reason: "qwen-disabled"` contract).

## 2. Architecture Layer Inventory

| Subsystem | Primary source file(s) | Sprint of origin | Architectural invariants |
|---|---|---|---|
| Provider registry | `src/types/ttsProvider.ts`, `src/utils/ttsProviderRegistry.ts` | `TTS-REGISTRY-1` + posture updates in `ENGINE-DORMANCY-1`, boundary contract in `TTS-EVENT-SYNC-1` | Provider capability truth is explicit data; disabled providers are non-selectable; timing truth is declared per provider. |
| Segment normalizer | `src/utils/segmentNormalizer.ts` | `TTS-NORMALIZE-1`, expanded by `NORMALIZER-ENRICH-1` | Normalization is engine input only; display/highlight truth remains original words; alignment map contract preserved. |
| Cache identity | `src/types/ttsCache.ts`, `src/utils/ttsCacheIdentity.ts`, `src/utils/ttsCache.ts`, `main/tts-cache.js` | v2 identity in `TTS-CACHE-TIMING-1`, parity hardening in `TTS-CACHE-HARDEN-1`, production helper in `TTS-PIPELINE-1` | Identity is structured data (not path text); includes normalizer/version/hash fields; supports lazy invalidation. |
| Timing sidecars | `src/types/ttsCache.ts`, `main/tts-cache.js` | `TTS-CACHE-TIMING-1`, hardened in `TTS-CACHE-HARDEN-1` | Word timestamps are trusted only when classification is trusted; sidecar read failure degrades timing metadata, not audio decode. |
| Highlight sync controller | `src/utils/highlightSyncController.ts` | `TTS-SYNC-1` | Sync mode is capability/timing-truth driven (`word`, `chunk`, `segment`, `off`); no fabricated word-following when trust is absent. |
| Timing metadata store | `src/utils/timingMetadataStore.ts` | `TTS-SYNC-1` | Classification is centralized; query paths are read-only consumers of stored timing records. |
| Diagnostics bundle | `src/utils/narrateDiagnostics.ts` | `TTS-DIAG-1` | Diagnostics must be provider-neutral and redacted (no raw text/audio payload by default). |
| Narration planner | `src/utils/narrationPlanner.ts` | `TTS-7P` stabilization lane; validated in `TTS-PIPELINE-1` | Planner is single authority for forward chunk boundaries/silence policy; prohibits mid-sentence chunk endings by contract. |
| Audio scheduler | `src/utils/audioScheduler.ts` | `TTS-7Q` + `NARR-TIMING`; event-sync integration in `TTS-EVENT-SYNC-1` | Confirmed audio boundaries own canonical progress truth; invalid timing falls back to heuristic/segment-safe behavior. |
| Generation pipeline | `src/utils/generationPipeline.ts` | `TTS-7B/7C`, planner integration in `TTS-7P`, parity proven in `TTS-PIPELINE-1` | Start/pause/resume/backpressure rules preserve queue continuity and avoid stale generation reuse. |
| Word position index | `src/utils/wordPositionIndex.ts` | `TTS-RENDER-MAP-1` | Index-first lookup is primary path; fallback to live DOM query is mandatory when entries are stale/missing. |

## 3. Adopt/Reject/Defer Register

| Item | Verdict | Source(s) | One-line rationale |
|---|---|---|---|
| Provider capability registry contract | Adopt | 2026-05-11 literature review (`Gap Analysis`, `Recommended Architecture`) | Makes engine posture, timing truth, and selectability explicit and testable. |
| Event-driven word-boundary sync | Adopt (adapted) | readest + RealtimeTTS patterns, implemented via `TTS-EVENT-SYNC-1` | Use callback-driven sync, but keep Blurby's LL-079 canonical cursor ownership boundary intact. |
| Segment normalizer with golden fixtures | Adopt | abogen text normalization guidance + `NORMALIZER-ENRICH-1` | Improves spoken correctness while preserving map-based alignment guarantees. |
| Pre-built render-time word index | Adopt (adapted) | sioyek render-position mapping + `TTS-RENDER-MAP-1` | O(1)-like lookup path with explicit fail-open fallback for transient render churn. |
| Structured cache identity + timing sidecars | Adopt | ttsreader/sioyek identity ideas + `TTS-CACHE-TIMING-1`/`TTS-CACHE-HARDEN-1` | Safer migration, deterministic invalidation, and timing provenance persistence. |
| Diagnostics as redacted bundle | Adopt | RealtimeTTS callback metadata + adversarial R1/R2 context | Provider-neutral runtime explainability without raw text/audio leakage. |
| RealtimeTTS full playback stack replacement | Reject | 2026-05-11 model/framework evaluation | Useful orchestration patterns, but not a drop-in replacement for Blurby's Electron runtime pipeline. |
| Cloud-first TTS core (Edge/Readest cloud lanes) | Reject | 2026-05-11 engine framework table | Violates offline/local-first product posture for Desktop v2 core path. |
| Coqui as default core engine | Reject | 2026-05-11 engine evaluation | Packaging/licensing/runtime complexity is high relative to current Kokoro baseline. |
| Qwen streaming promotion before live gate evidence | Defer | Qwen policy + 2026-05-11/2026-05-14 recommendations | Must remain disabled until explicitly approved post-v2 lane with fresh evidence. |
| Unified `NarrationSegment` cross-layer type | Defer | 2026-05-14 adversarial R5 + 2026-05-15 implementation review | Valuable consolidation, but intentionally queued as post-conveyor/post-release work. |

## 4. Key Architectural Invariants

1. Timing metadata is fail-closed: missing/untrusted timing downgrades sync mode to chunk/segment; no invented word boundaries.
2. Cache identity is structured data first, path material second; semantic invalidation comes from schema/content/normalizer fields.
3. Cache identity must include `normalizerVersion`, `sourceTextHash`, `normalizedTextHash`, and `pronunciationOverrideHash`.
4. Normalized text is engine input only; scheduler/display/highlight anchor truth remains original word arrays and global word indices.
5. Canonical chunk start authority is audio-confirmed progress (`lastConfirmedAudioWordRef`), not visual cursor state.
6. Engine dormancy requires dual gates: settings boundary disablement plus runtime IPC fail-closed handling.
7. Diagnostics bundles must never include raw book text or raw audio payloads by default.
8. Timing sidecars are advisory metadata; sidecar corruption/mismatch must not discard decodable audio.
9. Provider capability metadata is authoritative for selectability/timing truth; no implicit runtime-only posture drift.
10. Index-first word lookup must preserve continuity by falling back to direct DOM query when index entries are stale/missing.

## 5. Dormancy Contract

"Dormant" for MOSS-Nano and Pocket TTS means all of the following are true:

1. Settings boundary disabled:
- `selectable: false`
- `statusKind: "disabled"`
- `disabledReason: "engine-dormant"`
2. Runtime boundary disabled:
- IPC handlers return structured unavailable responses with `reason: "engine-dormant"`.
3. Product posture explicit:
- Provider copy states dormant posture and non-availability for live narration.
4. No silent substitution:
- Explicit-only fallback semantics are preserved (selected dormant engine does not silently become another engine).

Reactivation checklist (required as a set):

1. Registry posture change (`src/utils/ttsProviderRegistry.ts`).
2. IPC/runtime enablement (`main/ipc/tts.js` and engine adapters).
3. Settings selection + readiness UX re-enable.
4. Verification gates for cache/timing/fallback behavior across Page, Focus, Flow, Narrate.

## 6. Research Provenance

| Sprint | Source codebase(s) | Adopted | Adapted |
|---|---|---|---|
| `TTS-EVENT-SYNC-1` | readest, RealtimeTTS, sioyek | Provider-level boundary contract and event-driven sync path; normalized-to-original alignment map. | Kept LL-079 cursor ownership rule: visual correction cannot mutate canonical audio truth refs. |
| `NORMALIZER-ENRICH-1` | abogen | Transform gap-fill strategy, richer normalization fixture families, context-sensitive heteronym handling. | Mapped to Blurby's alignment-safe transform contract and chunk-local cache identity semantics. |
| `TTS-RENDER-MAP-1` | sioyek | Pre-built lookup map for rendered text positions with rebuild triggers. | Added diagnostics and mandatory fail-open DOM fallback to preserve continuity during reflow/section churn. |

## 7. Future Work

### KOKORO-EXPORT-1 (optional future lane)

- Scope: long-form audio/subtitle export from stable narration segments.
- Hard prerequisites already established:
  - durable segment anchor semantics (AD-1),
  - structured cache identity + timing sidecars,
  - event-driven sync contracts,
  - render-time position indexing.
- Additional gate: export artifacts must consume durable anchors, not cache `chunkId`.

### Engine reactivation conditions

- Nano/Pocket: run the full dormancy reactivation checklist in this document.
- Qwen: separate approved post-v2 sprint only (`QWEN_SUPPORTED_HOST_POLICY.md`).

### Deferred architecture lanes

- Unified `NarrationSegment` domain model consolidation (post-conveyor).
- Registry-driven strategy dispatch cleanup.
- Cache telemetry and schema simplification items from implementation review P2 backlog.

## 8. Error Taxonomy

| Error class | Representative failure | Source module(s) | Current handling | Severity | Recommended recovery |
|---|---|---|---|---|---|
| Generation failures | model load timeout, warm-up failure, worker crash, inference failure | `main/tts-engine.js`, `main/tts-worker.js`, `src/hooks/narration/kokoroStrategy.ts` | Engine status transitions (`warming/retrying/error`), bounded retries, structured errors, fallback path trigger. | High | Surface structured reason + recoverability in UI, retry with backoff where recoverable, preserve explicit fallback semantics. |
| Cache errors | malformed payload shape, corrupt/missing sidecar, identity mismatch/collision risk | `main/tts-cache.js`, `main/ipc/tts.js`, `src/utils/ttsCache.ts` | Shape validation rejects malformed reads; sidecar parse failure treated as missing timing; audio decode path remains primary. | Medium | Keep fail-open audio path, record diagnostics, tighten runtime identity shape validation before content-addressed expansion. |
| Scheduling errors | buffer underrun, stale generation payloads, timing drift between expected and observed boundaries | `src/utils/generationPipeline.ts`, `src/utils/audioScheduler.ts`, `src/hooks/useNarration.ts` | Generation IDs discard stale results; scheduler classification falls back to heuristic; truth-sync records correction events. | High | Preserve queue backpressure invariants, add long-form drift regression gates, keep canonical audio cursor authority separated from visual state. |
| IPC/availability errors | disconnected engine, dormant engine requested, disabled engine requested, cache IPC payload mismatch | `main/ipc/tts.js`, preload bridge, strategy adapters | Structured `{error, reason, status, recoverable}` responses; dormant/disabled reasons are explicit (`engine-dormant`, `qwen-disabled`). | Medium | Maintain typed IPC contracts across main/preload/renderer, prevent silent fallback for explicitly selected dormant/disabled engines. |

## 9. Findings Provenance (P1/P2 Coverage)

This table accounts for every P1/P2 item from:
- `Blurby_TTS_Literature_Codebase_Review_2026-05-11.md` (Gap Analysis Matrix rows with P1/P2)
- `Blurby_Kokoro_TTS_Implementation_Review_2026-05-15.md` (Ranked Action Items P1/P2)

| Source finding | Priority | Target sprint(s) | Disposition | Rationale |
|---|---|---|---|---|
| Add `TTSProviderRegistry` | P1 | `TTS-REGISTRY-1` | Adopted | Registry and provider capability contracts are live and referenced by diagnostics/settings surfaces. |
| Add `SegmentNormalizer` + golden fixtures | P1 | `TTS-NORMALIZE-1`, `NORMALIZER-ENRICH-1` | Adopted | Normalizer and expanded fixture corpus are landed with versioned identity coupling. |
| Keep honest non-Kokoro segment/sentence fallback | P2 | `TTS-EVENT-SYNC-1` | Adopted | Event-sync path preserves fallback classification; non-word-native providers do not claim word-truth timing. |
| Defer Qwen streaming promotion | P1 | Post-v2 Qwen lane | Deferred | Qwen remains disabled by policy; no promotion path opened during conveyor. |
| Reader TTS control UX enhancements | P2 | Post-conveyor UX lane | Deferred | Not required for architecture completion gate; tracked as optional enhancement lane. |
| Add PDF structure-to-segment regression fixtures | P1 | Future fixture lane | Deferred | Outside current conveyor scope; remains documented future validation work. |
| Normalize provider error taxonomy | P1 | `TTS-DIAG-1`, `TTS-ARCH-DOC-1` | Adopted | Diagnostics bundle schema + this taxonomy centralize error-class handling semantics. |
| Formalize experimental model gates | P1 | MOSS decision lane + policy docs | Adopted | Gate-driven posture captured in decision logs/policies and reflected in provider statuses. |
| Land dormancy/integration before event-sync | P1 | `ENGINE-DORMANCY-1`, `TTS-INTEGRATE-1` | Adopted | Dependency ordering was followed before Stage 2 precision infrastructure sprints. |
| Harmonize timing classification criteria | P1 | `TTS-CACHE-HARDEN-1` | Adopted | Shared timing classification gates are now explicit and used in cache/timing paths. |
| Rehydrate cache-hit timing identity + parity test | P1 | `TTS-EVENT-SYNC-1`, `TTS-PIPELINE-1` | Adopted | Cache-hit identity parity and end-to-end integration assertions are landed. |
| Set nano/pocket `selectable: false` + `disabledReason` | P1 | `ENGINE-DORMANCY-1` | Adopted | Registry marks both dormant with explicit disabled reasons. |
| Remove `durationMs` cast gap in Kokoro strategy IPC typing | P1 | `TTS-INTEGRATE-1` | Deferred | `kokoroStrategy.ts` still carries `(result as any).durationMs`; follow-on typing cleanup remains open. |
| Move to alignment-aware transform result contract pre-map | P2 | `TTS-EVENT-SYNC-1`, `NORMALIZER-ENRICH-1` | Rejected (by design) | AD-3 retained alignment-safe transform contract; map correctness proven without contract replacement. |
| Add `.catch(config.onError)` on `runPipeline` start call | P2 | `TTS-PIPELINE-1` | Deferred | Current `start()` still invokes `runPipeline(...)` without catch wrapper. |
| Widen `ChunkTimingTelemetry` type/remove `as any` | P2 | `TTS-PIPELINE-1` | Partial | Fields were added in practice, but `as any` remains in telemetry pushes. |
| Add resume-flush backpressure guard | P2 | `TTS-PIPELINE-1` | Deferred | Resume flush currently emits buffered chunks without `pendingChunks < queueDepth` check. |
| Reduce duplicated `timingTruth` storage locations | P2 | `TTS-PIPELINE-1` | Deferred | Timing truth still appears in multiple cache metadata surfaces; simplification remains backlog work. |
| Validate full structured identity shape (not schema only) | P2 | `TTS-PIPELINE-1` | Deferred | `isStructuredIdentity` in `main/tts-cache.js` still keys primarily on schema version. |

## 10. Cache Evolution Roadmap

### v1 (legacy)

- Key form: `{bookId}/{safeVoiceId}/chunk-{startIdx}.opus`.
- Characteristics: path-shaped identity, limited semantic fields, no structured timing sidecar contract.

### v2 foundation (`TTS-CACHE-TIMING-1`)

- Structured identity object (`TtsCacheIdentityV2`) with schema versioning.
- Hash-based safe disk layout under `tts-cache/v2/{bookIdSafe}/{identityHash}`.
- Timing sidecars (`.timing.json`) persisted with classification context.
- Atomic writes via temp-file rename.

### parity hardening (`TTS-CACHE-HARDEN-1`)

- Cache-hit timing parity with fresh chunks.
- Shared classification semantics and sidecar trust gating.
- Legacy key safety + IPC payload validation hardening.

### current dual-path read behavior (as of `TTS-PIPELINE-1`)

- Reads support:
  - exact v2 structured identity lookup,
  - legacy v1 lookup,
  - content-indexed v2 fallback (`manifest.contentIndex`) for content-addressed style retrieval.
- Production paths now share a pure identity builder (`buildKokoroCacheIdentity()`), reducing drift between generation and cache assessment logic.

### path to content-addressed caching (deferred)

1. Keep v2 identity schema as canonical write path.
2. Tighten runtime identity shape validation in main-process cache guards.
3. Add v1/v2 hit telemetry and analyze legacy prevalence before removing compatibility.
4. Evaluate reducing duplicated timing truth fields to one authoritative source with derived read metadata.

## 11. AD-1 Through AD-4 Migration (Verbatim)

The following AD blocks are migrated verbatim from `ROADMAP_SPECS.md` ("Architecture Decisions (Resolved)") and are now governed here as the standing architecture-decision reference.

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
