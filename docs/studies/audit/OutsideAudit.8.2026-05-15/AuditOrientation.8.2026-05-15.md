# Audit Orientation — OutsideAudit.8 (2026-05-15)

**Audit type:** Targeted re-audit (OA.7 remediation pass — targeting 9/10)
**Prior scores:** OA.1=5, OA.2=6, OA.3=7, OA.4=8, OA.5=8, OA.6=8, OA.7=8
**Changes since OA.7:** Added the 2 remaining cited source files that blocked the "all grounding evidence verifiable from package" standard.

---

## What Changed Since OA.7

### 1. `useNarration.ts` now included (Batch 2)

OA.7 section (E) item 1 identified that `ROADMAP_SPECS.md:191-193` cites `useNarration.ts` in grounding blocks but the file was absent from the package. **Now included as `useNarration.ts` in Batch 2.** Source path: `src/hooks/useNarration.ts` (69,366 bytes).

### 2. `FoliatePageView.tsx` now included (Batch 2)

OA.7 section (E) item 2 identified that `ROADMAP_SPECS.md:234-236` cites `FoliatePageView.tsx` in render-map grounding blocks but the file was absent. **Now included as `FoliatePageView.tsx` in Batch 2.** Source path: `src/components/FoliatePageView.tsx` (63,388 bytes).

---

## Package Contents

### Batch 1 — AuditPackage.8.2026-05-15.Batch1.zip (10 files, unchanged from OA.7)

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

### Batch 2 — AuditPackage.8.2026-05-15.Batch2.zip (9 files)

| File in zip | Source path | Role |
|---|---|---|
| constants.ts | `src/constants.ts` | All tunable constants (TTS_NORMALIZER_VERSION at line 159) |
| highlightSyncController.ts | `src/utils/highlightSyncController.ts` | Highlight sync decisions (on TTS-SYNC-1 branch) |
| timingMetadataStore.ts | `src/utils/timingMetadataStore.ts` | Timing metadata persistence (on TTS-SYNC-1 branch) |
| narrateDiagnostics.ts | `src/utils/narrateDiagnostics.ts` | Diagnostics bundle (on TTS-DIAG-1 branch) |
| narrationPlanner.ts | `src/utils/narrationPlanner.ts` | Pause-boundary planner |
| ttsCache_utils.ts | `src/utils/ttsCache.ts` | Renderer cache utility (loadCachedChunk, cacheChunk) |
| tts_ipc.js | `main/ipc/tts.js` | TTS IPC handlers (shape guards, cache read relay) |
| useNarration.ts | `src/hooks/useNarration.ts` | **NEW** — Narration hook (generation orchestration, state machine) |
| FoliatePageView.tsx | `src/components/FoliatePageView.tsx` | **NEW** — Reader view component (word rendering, render-map source) |

---

## Audit Instructions

This is a **targeted re-audit** of the same project reviewed in OA.1–OA.7. Please:

1. Re-score all 8 dimensions using the same rubric as prior audits
2. Verify the 2 specific remediations above resolved the OA.7 section (E) gaps
3. Confirm whether "all cited source files are present" standard is now met
4. Identify any remaining gaps that would prevent a 9/10 score

---

## File Disambiguation Guide (unchanged from OA.7)

Two distinct files share the base name `ttsCache.ts`:

| Zip filename | Source path | Contains |
|---|---|---|
| `ttsCache_types.ts` (Batch 1) | `src/types/ttsCache.ts` | Type definitions: `TtsCacheIdentityV2`, `TtsTimingSidecar`, `TtsCacheReadResult` |
| `ttsCache_utils.ts` (Batch 2) | `src/utils/ttsCache.ts` | Renderer utility: `loadCachedChunk()`, `cacheChunk()`, `isCached()`, etc. |

Citations in ROADMAP_SPECS.md use full paths (e.g., `src/types/ttsCache.ts:23` vs `src/utils/ttsCache.ts:26-54`).

---

## Cumulative Remediation History

| Audit | Score | Key fix |
|---|---|---|
| OA.1→OA.2 | 5→6 | Spec language tightened, segment identity gate added |
| OA.2→OA.3 | 6→7 | Line citations fixed, future constructs labeled |
| OA.3→OA.4 | 7→8 | ROADMAP split to ROADMAP_SPECS.md, NarrationSegmentAnchor semantics |
| OA.4→OA.5 | 8→8 | NUL stripped, narrationPlanner + narrateDiagnostics added, citations fixed |
| OA.5→OA.6 | 8→8 | ttsCache_utils added, SPECS tail completed, citations disambiguated |
| OA.6→OA.7 | 8→8 | Same as OA.5→OA.6 (repackage after mount-sync issue) |
| OA.7→OA.8 | 8→? | useNarration.ts + FoliatePageView.tsx added (final cited files) |
