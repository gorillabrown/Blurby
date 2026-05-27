# Sprint Close-Out Governance Staging - TTS-DIAG-1

This file enumerates governance changes that TTS-DIAG-1 would normally apply to main governance documents. Because this sprint ran in an isolated worktree, phase-closeout should fold these into canonical main after the branch is integrated.

## Target: ROADMAP.md

### Fold-in 1 - Header State
Section: top metadata
Action: Replace
Old:
`**Last updated**: 2026-05-15 - TTS-SYNC-1 closeout... The next approved work is TTS-DIAG-1...`
New:
`**Last updated**: 2026-05-15 - TTS-DIAG-1 closeout. TTS-DIAG-1 adds a redacted provider-neutral narration diagnostics bundle (`tts-diagnostics-v1`) that captures provider capabilities, selected engine/voice/rate, segment IDs, normalized/original hashes, cache key components, timing sidecar summaries, scheduler truth events, highlight sync decisions, and relevant errors without audio payloads or raw book text by default. Qwen remains retired/disabled; Kokoro remains default/available.`

### Fold-in 2 - Conveyor Item Status
Section: TTS Architecture Completion sequence
Action: Replace
Old:
`9. TTS-DIAG-1 - provider-neutral diagnostics export bundle. NEXT`
New:
`9. TTS-DIAG-1 - provider-neutral diagnostics export bundle. COMPLETE`

### Fold-in 3 - Sprint Closeout
Section: Sprint TTS-DIAG-1: Provider-Neutral Narration Diagnostics Bundle
Action: Insert after branch/commit hygiene lines
Content:
`**Closeout (2026-05-15):** PASS, gated - implemented on branch `sprint/tts-diag-1-diagnostics-bundle` stacked on `sprint/tts-sync-1-highlight-controller` at `142dc24`; do not merge to main until TTS-SYNC-1 lands. `src/utils/narrateDiagnostics.ts` now creates and validates schema `tts-diagnostics-v1` with default `audioPayloadIncluded: false` and recursive redaction of raw text/audio-shaped fields. `useNarration` exports a diagnostics bundle from live timing metadata and highlight sync decisions; `TTSSettings` exposes an opt-in export action only when a developer handler is supplied; `scripts/tts_eval_runner.mjs` validates bundle artifacts; `docs/testing/tts-diagnostics-bundle.md` records usage and redaction policy. Verification: focused diagnostics slice 4 files / 18 tests passed; full `npm test` 184 files / 2606 tests passed; `npm run typecheck` passed; `npm run build` passed with existing `settings -> tts -> settings` circular chunk warning.`

## Target: docs/governance/SPRINT_QUEUE.md

### Fold-in 1 - Queue Status
Section: Queue status block
Action: Replace
Old:
`Next queue item: TTS-DIAG-1 - Provider-Neutral Narration Diagnostics Bundle`
New:
`Next queue item: Backfill required after TTS-DIAG-1 closeout. KOKORO-EXPORT-1 remains deferred until deliberately dispatched.`

### Fold-in 2 - Recent Closeout Table
Section: Recent Closeouts
Action: Append row
Content:
`| TTS-DIAG-1 | 2026-05-15 | PASS, gated - Provider-neutral diagnostics bundle landed on stacked branch `sprint/tts-diag-1-diagnostics-bundle`; do not merge to main until TTS-SYNC-1 lands. Schema `tts-diagnostics-v1` records provider capabilities, selected engine/voice/rate, segment IDs, original/normalized hashes, cache key components, timing sidecar summaries, scheduler truth events, highlight sync decisions, and errors without audio payloads or raw book text by default. Verification: focused diagnostics slice 4 files / 18 tests, full `npm test` 184 files / 2606 tests, `npm run typecheck`, and `npm run build` with existing circular chunk warning. |`

## Target: CLAUDE.md

### Fold-in 1 - Active State
Section: Current state / sprint status
Action: Replace or append current sprint note
Content:
`TTS-DIAG-1 closed PASS on 2026-05-15 on stacked branch `sprint/tts-diag-1-diagnostics-bundle`. It is gated behind TTS-SYNC-1 integration and must not be merged to main until the TTS-SYNC base is landed. Diagnostics bundle schema is `tts-diagnostics-v1`; default export excludes audio payloads and raw book text.`

### Fold-in 2 - Guardrail Note
Section: TTS architecture guardrails
Action: Append
Content:
`Diagnostics exports are evidence artifacts, not playback artifacts: no generated local user diagnostics should be committed unless a test fixture explicitly creates them; raw `rawText`, `originalText`, `normalizedText`, and audio payload fields must remain redacted or rejected.`

