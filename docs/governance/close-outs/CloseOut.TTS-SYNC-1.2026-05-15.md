# TTS-SYNC-1 Close-Out — Timing Metadata Store And Highlight Sync Controller

**Date:** 2026-05-15
**Branch:** `sprint/tts-sync-1-highlight-controller`
**Commit:** `142dc24 feat: centralize TTS highlight sync timing policy`
**Decision:** PASS — branch complete and pushed; canonical `main` merge pending because the main worktree contains unrelated dirty tracked/untracked work.

## Summary

TTS-SYNC-1 centralized narration visual sync policy around explicit timing truth. `TimingMetadataStore` records chunk timing metadata with trusted, heuristic, or missing classification and supports chunk, segment, word, and time queries. `HighlightSyncController` chooses word, chunk, segment, or off sync modes from that metadata.

Trusted word-native timing can produce word-synced decisions. Heuristic or missing timing falls back to chunk/segment highlighting with `activeWordIndex: null`, so Blurby does not invent word progress when the provider or cache sidecar cannot prove it.

## Implementation Notes

- Added `src/utils/timingMetadataStore.ts` and `src/utils/highlightSyncController.ts`.
- `src/utils/audioScheduler.ts` publishes timing metadata for scheduled chunks.
- `src/hooks/narration/kokoroStrategy.ts` and `src/hooks/useNarration.ts` pass timing metadata into the store and expose `resolveHighlightSync`.
- `src/utils/generationPipeline.ts` and `src/utils/audio/segmentKokoroChunk.ts` preserve cache timing identity into scheduled chunks and split segments.
- `src/components/ReaderContainer.tsx` consumes controller decisions for narration chunk boundary visual state.
- No autoplay behavior, default engine posture, Qwen disablement, Flow WPM clock, Narrate spoken-timing clock, or `lastConfirmedAudioWordRef` ownership changed.

## Verification

- Pre-change focused baseline: `npm test -- --run tests/audioScheduler.test.ts tests/audioSchedulerTempo.test.ts tests/foliateWordHighlight.test.ts tests/foliateChunkHighlight.test.ts tests/narrTiming.test.ts tests/useNarration.test.ts tests/useNarrationCaching.test.tsx tests/useNarrationRateUpdate.test.tsx` — 8 files / 85 tests passed.
- Controller tests: `npm test -- --run tests/highlightSyncController.test.ts` — 1 file / 6 tests passed.
- Scheduler/controller slice: `npm test -- --run tests/audioScheduler.test.ts tests/highlightSyncController.test.ts` — 2 files / 18 tests passed.
- Hook slice: `npm test -- --run tests/useNarrationRateUpdate.test.tsx` — 1 file / 10 tests passed.
- Focused sync regression: `npm test -- --run tests/highlightSyncController.test.ts tests/audioScheduler.test.ts tests/audioSchedulerTempo.test.ts tests/foliateWordHighlight.test.ts tests/foliateChunkHighlight.test.ts tests/narrTiming.test.ts tests/useNarration.test.ts tests/useNarrationCaching.test.tsx tests/useNarrationRateUpdate.test.tsx` — 9 files / 93 tests passed.
- Full suite: `npm test` — 181 files / 2598 tests passed.
- `npm run typecheck` passed.
- `npm run build` passed with the existing Vite circular chunk warning: `settings -> tts -> settings`.
- `git diff --check` passed.

## Follow-On

`TTS-DIAG-1` remains the next approved sprint, but it should not dispatch from canonical `main` until `TTS-SYNC-1` is merged or the diagnostic sprint intentionally branches from `sprint/tts-sync-1-highlight-controller`. The branch governance files had older queue-depth language; canonical governance keeps the 2026-05-14 TTS Architecture Completion conveyor and treats only the integration gate as pending.
