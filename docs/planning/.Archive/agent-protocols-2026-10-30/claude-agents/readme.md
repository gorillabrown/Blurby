# .claude/agents/ — Agent Definitions

Agent role definitions used by the CLI orchestration system. Each `.md` carries YAML
frontmatter (name, model, tools) for Claude Code auto-discovery. The orchestrator
protocol is `zeus.md`; the canonical roster is mirrored in CLAUDE.md.

## Active roster
| File | Agent | Model | Role |
|------|-------|-------|------|
| `zeus.md` | Zeus | opus | Orchestrator protocol (read by CLI, never spawned) |
| `hermes.md` | Hermes | haiku | Mechanical execution |
| `hercules.md` | Hercules | sonnet | Single-domain implementation |
| `athena.md` | Athena | opus | Cross-system implementation |
| `aristotle.md` | Aristotle | opus | Root-cause diagnosis |
| `hippocrates.md` | Hippocrates | haiku | Test execution |
| `solon.md` | Solon | sonnet | Spec compliance |
| `plato.md` | Plato | sonnet | Code quality |
| `marcusaurelius.md` | MarcusAurelius | sonnet | Documentation |
| `simonides.md` | Simonides | sonnet | Memory / continuity |

## Naming convention
Agent filenames are lowercase (`hermes.md`, `athena.md`, …) with the agent name preserved in the YAML frontmatter `name:` field.
