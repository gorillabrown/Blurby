# TTS-DIAG-1 Close-Out - Provider-Neutral Narration Diagnostics Bundle

**Date:** 2026-05-15
**Branch:** `sprint/tts-diag-1-diagnostics-bundle`
**Base:** stacked on `sprint/tts-sync-1-highlight-controller` at `142dc24`
**Decision:** PASS, gated - do not merge to `main` until `TTS-SYNC-1` lands.

## Summary

TTS-DIAG-1 adds a redacted provider-neutral diagnostics bundle for active narration sessions. The bundle captures provider capabilities, selected engine/voice/rate, segment IDs, normalized/original hashes, cache key components, timing sidecar summaries, scheduler truth events, highlight sync decisions, and relevant errors without including audio payloads or raw book text by default.

## Implementation Notes

- Added `tts-diagnostics-v1` bundle creation and validation in `src/utils/narrateDiagnostics.ts`.
- Added eval-runner schema validation in `scripts/tts_eval_runner.mjs`.
- Added `TimingMetadataStore.listChunks()` so diagnostics can summarize live timing sidecars without exposing raw timestamps beyond counts and classifications.
- Added `useNarration().exportNarrationDiagnosticsBundle()` and passive capture of highlight sync decisions.
- Added opt-in `TTSSettings` diagnostics export action, hidden unless a developer handler is supplied.
- Added runbook documentation at `docs/testing/tts-diagnostics-bundle.md`.

## Verification

- Red check: `npm test -- --run tests/ttsDiagnosticsBundle.test.ts tests/ttsEvalDiagnosticsBundle.test.ts tests/ttsSettingsDiagnosticsExport.test.tsx tests/useNarrationRateUpdate.test.tsx` failed for missing bundle factory/validator, eval validator, settings action, and hook export.
- Focused diagnostics slice: `npm test -- --run tests/ttsDiagnosticsBundle.test.ts tests/ttsEvalDiagnosticsBundle.test.ts tests/ttsSettingsDiagnosticsExport.test.tsx tests/useNarrationRateUpdate.test.tsx` - 4 files / 18 tests passed.
- `npm run typecheck` passed.
- `npm run build` passed with the existing Vite circular chunk warning: `settings -> tts -> settings`.
- Full suite: `npm test` - 184 files / 2606 tests passed.

## Guardrails

- No audio payloads are exported by default.
- Raw `rawText`, `originalText`, `normalizedText`, and audio-shaped fields are recursively stripped from caller-supplied cache/event metadata and rejected by validators if present.
- Original display/highlight words remain display truth; normalized text remains engine/cache identity input only.
- Highlight diagnostics observe `HighlightSyncController` decisions and do not change cursor ownership or `lastConfirmedAudioWordRef`.
- Qwen remains retired/disabled; Kokoro remains default/available; no provider default changed.

## Follow-On

`KOKORO-EXPORT-1` remains deferred until diagnostics closeout is folded into canonical governance and the next sprint is deliberately dispatched from current project state.

