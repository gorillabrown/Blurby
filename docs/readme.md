# docs/ — Documentation Hub

Top-level home for all Blurby documentation. The authoritative map of where content
belongs is CLAUDE.md → "Where Things Live"; this readme summarizes the directory.

## Files
| File | Type | Purpose |
|------|------|---------|
| `code-signing.md` | markdown | Code-signing procedure/notes for releases |
| `Superhuman_Keyboard_Shortcuts.pdf` | pdf | External reference (keyboard-shortcut design inspiration) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `brand/` | Brand standards (PDF) |
| `bug-reports/` | Raw in-app bug captures (gitignored, local-only) |
| `evidence/` | Curated, tracked evidence artifacts promoted from local runs |
| `governance/` | Governing source-of-truth docs (see its readme) |
| `planning/` | Roadmap reviews, plans, specs, archives (see its readme) |
| `studies/` | Audits, investigations, research, reviews (see its readme) |
| `testing/` | Test checklists, runbooks, eval baselines (see its readme) |

## What does NOT belong here
Source code, build output, and runtime binaries. Raw local captures stay in the
gitignored `bug-reports/`.
