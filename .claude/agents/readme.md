# .claude/agents/ — Agent Definitions

Agent role definitions used by the CLI orchestration system. Each `.md` carries YAML
frontmatter (name, model, tools) for Claude Code auto-discovery. The orchestrator
protocol is `zeus.md`; the canonical roster is mirrored in CLAUDE.md.

## Active roster
| File | Agent | Model | Role |
|------|-------|-------|------|
| `zeus.md` | Zeus | opus | Orchestrator protocol (read by CLI, never spawned) |
| `hermes.md` | Hermes | haiku | Mechanical execution |
| `Hercules.md` | Hercules | sonnet | Single-domain implementation |
| `athena.md` | Athena | opus | Cross-system implementation |
| `aristotle.md` | Aristotle | opus | Root-cause diagnosis |
| `hippocrates.md` | Hippocrates | haiku | Test execution |
| `solon.md` | Solon | sonnet | Spec compliance |
| `plato.md` | Plato | sonnet | Code quality |
| `herodotus.md` | Herodotus | sonnet | Documentation |
| `simonides.md` | Simonides | sonnet | Memory / continuity |

## Pending / flagged
| File | Status |
|------|--------|
| `MarcusAurelius.md` | Stub — frontmatter `name: MarcusAurelius` but body is an uncustomized Herodotus template. Retained per owner decision; needs proper authoring or removal (see deferred-review). |

## Naming convention
Agent filenames are lowercase (`hermes.md`, `athena.md`, …). `Hercules.md` and
`MarcusAurelius.md` are TitleCase outliers (see deferred-review).
