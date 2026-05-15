# TTS Diagnostics Bundle

`TTS-DIAG-1` adds a provider-neutral narration diagnostics artifact with schema version `tts-diagnostics-v1`.

## Purpose

The bundle records why a narration session behaved the way it did without exporting audio payloads or raw book text by default. It is meant for debugging provider selection, cache identity, timing sidecars, scheduler truth, and highlight sync decisions.

## Contents

- Provider capability snapshot for Web Speech, Kokoro, disabled Qwen, MOSS-Nano, and Pocket TTS.
- Selected engine, voice, rate, session/book IDs when supplied, and segment IDs.
- Original and normalized text hashes, not raw original or normalized text.
- Cache key components and timing sidecar summaries.
- Scheduler truth events and highlight sync decisions.
- Relevant error messages without stacks.

## Redaction Policy

Default bundle creation sets `audioPayloadIncluded: false` and `redaction.includeAudio: false`.

The producer strips these raw fields recursively from caller-supplied cache and event metadata:

- `rawText`
- `originalText`
- `normalizedText`
- `audioPayload`
- `audioBuffer`
- `audioBytes`
- `pcm`
- `wav`
- `opus`

The validator rejects any artifact that still contains those fields.

## Validation

Renderer/unit validation lives in `src/utils/narrateDiagnostics.ts` via `validateNarrationDiagnosticsBundle`.

Eval-runner validation lives in `scripts/tts_eval_runner.mjs` via `validateTtsDiagnosticsBundleArtifact`. The eval runner does not need audio or local user diagnostics to validate schema shape.

## Tests

Run the focused diagnostics slice with:

```bash
npm test -- --run tests/ttsDiagnosticsBundle.test.ts tests/ttsEvalDiagnosticsBundle.test.ts tests/ttsSettingsDiagnosticsExport.test.tsx tests/useNarrationRateUpdate.test.tsx
```

