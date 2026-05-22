# docs/governance/ — Governing Documents

Source-of-truth operational and governance documents. Several of these are the
"7 Governing Documents" referenced in CLAUDE.md.

## Files
| File | Type | Purpose |
|------|------|---------|
| `TECHNICAL_REFERENCE.md` | markdown | Architecture, data model, every feature |
| `BUG_REPORT.md` | markdown | Active bugs — severity, location, resolution |
| `LESSONS_LEARNED.md` | markdown | Engineering discoveries, standing rules, anti-patterns |
| `IDEAS.md` | markdown | Unroadmapped concepts, reviewed at phase pauses |
| `DEVELOPMENT_SYNC.md` | markdown | Local-first git workflow SOP |
| `sprint-queue.xlsx` | binary/xlsx | **Authoritative** FIFO sprint queue (Catalog + Dashboard tabs) |
| `TTS_ARCHITECTURE_DECISIONS.md` | markdown | Canonical TTS architecture decisions |
| `TTS-AUDIT-2026-03-28.md` | markdown | TTS audit record |
| `TTS-AUDIT-ORIENTATION.md` | markdown | TTS audit orientation |
| `TTS-AUDIT-REVIEW.md` | markdown | TTS audit review |
| `TTS_EVAL_RUNBOOK.md` | markdown | TTS eval runbook |
| `TTS_EVAL_REVIEW_TEMPLATE.md` | markdown | TTS eval review template |
| `QWEN_SUPPORTED_HOST_POLICY.md` | markdown | Qwen supported-host policy |
| `blurby-tts-audit-package.zip` | binary/zip | Bundled TTS audit package (historical) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `close-outs/` | Per-sprint close-out reports (`CloseOut.<ID>.<YYYY-MM-DD>.md`) and SpecRetro |
| `bug-reports/` | In-app bug-report intake (with `.Archive/` for processed reports) |

## Naming conventions
- Close-outs: `CloseOut.<SPRINT-ID>.<YYYY-MM-DD>.md`
- Memos: `Memo.<ID>.<context>.<YYYY-MM-DD>.md`

## What does NOT belong here
Completed sprint/hotfix **dispatches** (archive to `docs/planning/.Archive/`) and
one-off investigation memos (file under `docs/studies/investigations/`).
