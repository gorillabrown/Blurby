# Audit Orientation — OutsideAudit.7 (2026-05-15)

**Audit type:** Targeted re-audit (OA.6 remediation pass — targeting 9/10)
**Prior scores:** OA.1=5, OA.2=6, OA.3=7, OA.4=8, OA.5=8, OA.6=8
**Changes since OA.6:** 4 specific remediations addressing all section (E) gaps

---

## What Changed Since OA.6

### 1. `src/utils/ttsCache.ts` now included (NEW FILE — Batch 2)

OA.6 identified that the package contained `src/types/ttsCache.ts` (type definitions) but NOT `src/utils/ttsCache.ts` (the renderer utility with `loadCachedChunk`). The spec cites `loadCachedChunk` at lines 26-55 — that's the utility file. **Now included as `ttsCache_utils.ts` in Batch 2** (renamed to disambiguate from `ttsCache_types.ts` in Batch 1).

### 2. ROADMAP_SPECS.md tail completed (was truncated)

OA.6 found the file ended mid-sentence at done-when item 6: "Findings provenance table accounts for every P1/P2 item from". **Now complete** — items 6 through 9 fully articulated, covering findings provenance, cache evolution roadmap, AD-1–AD-4 migration, and governance document cross-reference.

### 3. All `ttsCache.ts` citations disambiguated with full paths

Every reference to `ttsCache.ts` in ROADMAP_SPECS.md now uses the full path to distinguish the two files:
- `src/types/ttsCache.ts` — type definitions (TtsCacheIdentityV2, TtsTimingSidecar, TtsCacheReadResult)
- `src/utils/ttsCache.ts` — renderer utility (loadCachedChunk, cacheChunk, isCached, eviction, coverage)

Architecture layer inventory (line 293) now explicitly lists both files plus `main/tts-cache.js`.

### 4. ROADMAP.md now has TTS-ARCH-DOC-1 `Done when` block

Added a cross-reference done-when block pointing to ROADMAP_SPECS.md for the full 9-item acceptance criteria, with an inline summary of what the 11 sections cover.

---

## Package Contents

### Batch 1 — AuditPackage.7.2026-05-15.Batch1.zip (10 files)

| File in zip | Source path | Role |
|---|---|---|
| ROADMAP.md | `ROADMAP.md` | Lean dispatch document — sprint structural fields |
| ROADMAP_SPECS.md | `ROADMAP_SPECS.md` | Companion — AD-1–AD-4, type-flow matrix, grounding evidence |
| ttsProvider.ts | `src/types/ttsProvider.ts` | Provider capability types + TtsProviderTimingTruth |
| ttsProviderRegistry.ts | `src/utils/ttsProviderRegistry.ts` | Registry implementation |
| segmentNormalizer.ts | `src/utils/segmentNormalizer.ts` | Normalization pipeline (transforms, hashing) |
| ttsCache_types.ts | `src/types/ttsCache.ts` | Cache identity types, timing sidecar, read result |
| audioScheduler.ts | `src/utils/audioScheduler.ts` | Audio scheduling + ScheduledChunk interface |
| kokoroStrategy.ts | `src/hooks/narration/kokoroStrategy.ts` | Kokoro generation strategy (cache identity construction) |
| generationPipeline.ts | `src/utils/generationPipeline.ts` | Generation pipeline (chunk production, silence injection) |
| tts-cache.js | `main/tts-cache.js` | Main-process cache persistence (v1/v2 dual-path) |

### Batch 2 — AuditPackage.7.2026-05-15.Batch2.zip (7 files)

| File in zip | Source path | Role |
|---|---|---|
| constants.ts | `src/constants.ts` | All tunable constants (TTS_NORMALIZER_VERSION at line 159) |
| highlightSyncController.ts | `src/utils/highlightSyncController.ts` | Highlight sync decisions (on TTS-SYNC-1 branch) |
| timingMetadataStore.ts | `src/utils/timingMetadataStore.ts` | Timing metadata persistence (on TTS-SYNC-1 branch) |
| narrateDiagnostics.ts | `src/utils/narrateDiagnostics.ts` | Diagnostics bundle (on TTS-DIAG-1 branch) |
| narrationPlanner.ts | `src/utils/narrationPlanner.ts` | Pause-boundary planner |
| ttsCache_utils.ts | `src/utils/ttsCache.ts` | **NEW** — Renderer cache utility (loadCachedChunk, cacheChunk) |
| tts_ipc.js | `main/ipc/tts.js` | TTS IPC handlers (shape guards, cache read relay) |

---

## Audit Instructions

This is a **targeted re-audit** of the same project and architecture reviewed in OA.1–OA.6. Please:

1. Re-score all 8 dimensions using the same rubric as prior audits
2. Verify the 4 specific remediations above resolved the OA.6 section (E) gaps
3. Identify any remaining gaps that would prevent a 9/10 score
4. Note: the two `ttsCache` files are deliberately renamed in the zips (`_types` vs `_utils`) to disambiguate — the original source paths are shown in the table above

---

## File Disambiguation Guide

Two distinct files share the base name `ttsCache.ts`:

| Zip filename | Source path | Contains |
|---|---|---|
| `ttsCache_types.ts` (Batch 1) | `src/types/ttsCache.ts` | Type definitions: `TtsCacheIdentityV2`, `TtsTimingSidecar`, `TtsCacheReadResult`, `TtsCacheWriteTimingMetadata` |
| `ttsCache_utils.ts` (Batch 2) | `src/utils/ttsCache.ts` | Renderer utility: `loadCachedChunk()`, `cacheChunk()`, `isCached()`, `getCachedChunks()`, `evictBook()`, `evictBookVoice()`, `getCacheInfo()`, `getOpeningCoverageMs()` |

Citations in ROADMAP_SPECS.md now use full paths (e.g., `src/types/ttsCache.ts:23` vs `src/utils/ttsCache.ts:26-54`).
