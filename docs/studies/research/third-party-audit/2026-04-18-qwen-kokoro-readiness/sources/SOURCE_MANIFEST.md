# Source Manifest

## Copied Current Sources

| Packet path | Original repo path | Capture date | Notes |
|---|---|---|---|
| `sources/engine-scan/SCREENING_SUMMARY.md` | `docs/studies/research/tts-engine-scan/SCREENING_SUMMARY.md` | `2026-04-18` | Current screening state |
| `sources/engine-scan/RUN_LOG.md` | `docs/studies/research/tts-engine-scan/RUN_LOG.md` | `2026-04-18` | Current empirical record |
| `sources/engine-scan/SHORTLIST.md` | `docs/studies/research/tts-engine-scan/SHORTLIST.md` | `2026-04-18` | Current shortlist and bucket framing |
| `sources/engine-scan/KOKORO.md` | `docs/studies/research/tts-engine-scan/candidates/KOKORO.md` | `2026-04-18` | Baseline dossier |
| `sources/engine-scan/QWEN3-TTS.md` | `docs/studies/research/tts-engine-scan/candidates/QWEN3-TTS.md` | `2026-04-18` | Active but unrun Qwen dossier |
| `sources/engine-scan/MOSS-TTS.md` | `docs/studies/research/tts-engine-scan/candidates/MOSS-TTS.md` | `2026-04-18` | Attempted-but-dropped dossier |
| `sources/engine-scan/MELOTTS.md` | `docs/studies/research/tts-engine-scan/candidates/MELOTTS.md` | `2026-04-18` | Attempted-but-dropped dossier |
| `sources/engine-scan/EVALUATION_RUBRIC.md` | `docs/studies/research/tts-engine-scan/EVALUATION_RUBRIC.md` | `2026-04-18` | Context for scoring intent |
| `sources/engine-scan/REVIEW_TEMPLATE.md` | `docs/studies/research/tts-engine-scan/REVIEW_TEMPLATE.md` | `2026-04-18` | Context for review shape |

## Copied Code Evidence

| Packet path | Original repo path | Capture date | Notes |
|---|---|---|---|
| `sources/code-excerpts/main-ipc-tts.js` | `main/ipc/tts.js` | `2026-04-18` | IPC return path for Kokoro including `wordTimestamps` |
| `sources/code-excerpts/main-tts-engine.js` | `main/tts-engine.js` | `2026-04-18` | Engine forwarding path for `wordTimestamps` |
| `sources/code-excerpts/main-tts-worker.js` | `main/tts-worker.js` | `2026-04-18` | Worker result path for `wordTimestamps` |

## Copied Background Sources

| Packet path | Original repo path | Capture date | Notes |
|---|---|---|---|
| `sources/investigations/TTS Model Evaluation for Blurby App.md` | `docs/studies/investigations/TTS Model Research/TTS Model Evaluation for Blurby App.md` | `2026-04-18` | Superseded background; copied as-is for audit history |
| `sources/investigations/deep-research-report.md` | `docs/studies/investigations/TTS Model Research/deep-research-report.md` | `2026-04-18` | Superseded background; copied as-is and retains unresolved citation markers |

## Copied Artifacts

| Packet path | Original repo path | Capture date | Notes |
|---|---|---|---|
| `artifacts/kokoro/run-manifest.json` | `artifacts/tts-eval/engine-scan/kokoro/run-manifest.json` | `2026-04-18` | Completed empirical lane manifest |
| `artifacts/kokoro/audio/` | `artifacts/tts-eval/engine-scan/kokoro/audio/` | `2026-04-18` | Six Kokoro audio outputs |
| `artifacts/kokoro/notes/` | `artifacts/tts-eval/engine-scan/kokoro/notes/` | `2026-04-18` | Six Kokoro notes files |
| `artifacts/moss-tts/run-manifest.json` | `artifacts/tts-eval/engine-scan/moss-tts/run-manifest.json` | `2026-04-18` | Smoke-failure manifest |
| `artifacts/melotts/run-manifest.json` | `artifacts/tts-eval/engine-scan/melotts/run-manifest.json` | `2026-04-18` | Smoke-failure manifest |
| `artifacts/index/summary.json` | `artifacts/tts-eval/engine-scan/index/summary.json` | `2026-04-18` | Completion-state summary |
| `artifacts/index/summary.txt` | `artifacts/tts-eval/engine-scan/index/summary.txt` | `2026-04-18` | Human-readable completion summary |
