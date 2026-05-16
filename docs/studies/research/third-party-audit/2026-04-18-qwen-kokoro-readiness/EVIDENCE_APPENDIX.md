# Evidence Appendix

## Direct Evidence

| Item | Packet path | Why it matters | Type |
|---|---|---|---|
| Screening summary | `sources/engine-scan/SCREENING_SUMMARY.md` | Shows which candidates remained active, watchlist, or excluded after hard-gate screening. | direct evidence |
| Run log | `sources/engine-scan/RUN_LOG.md` | Records what was actually run on `2026-04-18` and what failed before audio. | direct evidence |
| Shortlist | `sources/engine-scan/SHORTLIST.md` | Captures the post-run ranking and explicitly marks Qwen as active but host-blocked. | direct evidence |
| Kokoro dossier | `sources/engine-scan/KOKORO.md` | Documents the baseline runtime and what was actually captured. | direct evidence |
| Qwen dossier | `sources/engine-scan/QWEN3-TTS.md` | Documents why Qwen remains active and what runtime shape it assumes. | direct evidence |
| MOSS dossier | `sources/engine-scan/MOSS-TTS.md` | Shows why MOSS was attempted but dropped before audio. | direct evidence |
| MeloTTS dossier | `sources/engine-scan/MELOTTS.md` | Shows why MeloTTS was attempted but dropped before audio. | direct evidence |
| Kokoro run manifest | `artifacts/kokoro/run-manifest.json` | Confirms Kokoro completed the six-fixture corpus and records runtime metadata. | direct evidence |
| Kokoro audio and notes | `artifacts/kokoro/audio/` and `artifacts/kokoro/notes/` | Provides the actual completed empirical output set for the current lane. | direct evidence |
| MOSS run manifest | `artifacts/moss-tts/run-manifest.json` | Confirms MOSS smoke failed before audio and records the exact failure posture. | direct evidence |
| MeloTTS run manifest | `artifacts/melotts/run-manifest.json` | Confirms MeloTTS smoke failed before audio and records the exact failure posture. | direct evidence |
| Index summaries | `artifacts/index/summary.json` and `artifacts/index/summary.txt` | Summarizes corpus completion state across candidates. | direct evidence |
| Kokoro code excerpts | `sources/code-excerpts/` | Confirms the current Blurby Kokoro path already returns `wordTimestamps`. | direct evidence |

## Audit Context

| Item | Packet path | Why it matters | Type |
|---|---|---|---|
| Implementation spec | `IMPLEMENTATION_READINESS_SPEC.md` | This is the proposed next prototype architecture under review. | proposal under audit |
| Audit brief | `AUDIT_BRIEF.md` | Gives the intended framing and the exact question for the reviewer. | packet framing |
| Authoritative record | `AUTHORITATIVE_RECORD.md` | Consolidates the current source-of-truth position. | packet synthesis |
| Evaluation rubric | `sources/engine-scan/EVALUATION_RUBRIC.md` | Shows how the engine-scan lane was intended to judge candidates. | context |
| Review template | `sources/engine-scan/REVIEW_TEMPLATE.md` | Shows the intended artifact-review shape even though only Kokoro completed the corpus. | context |

## Superseded Background

| Item | Packet path | Why it matters | Type |
|---|---|---|---|
| Older evaluation memo | `sources/investigations/TTS Model Evaluation for Blurby App.md` | Shows the broader earlier research posture, but it is not authoritative now. | superseded background |
| Older deep research report | `sources/investigations/deep-research-report.md` | Shows how earlier synthesis was written, but it contains unresolved citation markers and should not be treated as final authority. | superseded background |
| Superseded-background summary | `SUPERSEDED_BACKGROUND.md` | Explains the problems found in the older docs. | packet synthesis |
