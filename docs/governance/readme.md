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
| `RELEASE_RUNBOOK.md` | markdown | Manual desktop release procedure (build, check, upload, publish) |
| `SMOKE_CHECKLIST_STAGE8.md` | markdown | Stage 8 batched owner smoke checklist (release gate 2) |
| `DEPENDENCY_ADVISORIES.md` | markdown | `npm audit` advisory status after DEPS-AUDIT-1 |
| `sprint-queue.xlsx` | binary/xlsx | Retired XLSX queue, read-only evidence. The live queue is the [Notion work register](https://www.notion.so/heyevanbrown/3f87c96cc31e800580cfe019c89a56ca) |
| `terminal-ledger.jsonl` | jsonl | Append-only ledger of terminal (completed) work items |
| `TTS_ARCHITECTURE_DECISIONS.md` | markdown | TTS architecture decisions (historical since NARRATE-REMOVE-1) |

The TTS audit set, TTS eval runbook and template, and the Qwen host policy were archived to `docs/planning/.Archive/` on 2026-10-13.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `close-outs/` | Per-sprint close-out reports (`CloseOut.<ID>.<YYYY-MM-DD>.md`) and SpecRetro |
| `bug-reports/` | Issue documents (`Issue.<ID>.<date>.md`) from stops, holds and escalations. Raw in-app bug reports land in the gitignored `docs/bug-reports/` |

## Naming conventions
- Close-outs: `CloseOut.<SPRINT-ID>.<YYYY-MM-DD>.md`
- Memos: `Memo.<ID>.<context>.<YYYY-MM-DD>.md`

## What does NOT belong here
Completed sprint/hotfix **dispatches** (archive to `docs/planning/.Archive/`) and
one-off investigation memos (file under `docs/studies/investigations/`).
