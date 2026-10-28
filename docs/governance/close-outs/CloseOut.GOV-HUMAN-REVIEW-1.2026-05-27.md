# Close-Out — GOV-HUMAN-REVIEW-1

**Date:** 2026-05-27
**Sprint:** GOV-HUMAN-REVIEW-1 — Deferred Governance Review Items
**Branch / merge:** `sprint/gov-human-review-1` → `main` (pending — git ops handed off to user per git-handoff rule)
**Outcome:** Complete (docs-only). All six deferred governance-hygiene items resolved.

## Sprint Brief

- **Goal:** Resolve the six human-review hygiene items GOVERNANCE-SWEEP (2026-05-22) deferred: (1) MarcusAurelius stub, (2) ROADMAP header traces, (3) ROADMAP_SPECS.md duplication, (4) close-out volume, (5) naming-convention outliers, (6) roster consistency.
- **Result:** Doc-keeper agent renamed from Herodotus → MarcusAurelius across all canonical surfaces (the project had two competing names for the same role; user direction selected MarcusAurelius). ROADMAP_SPECS preface clarified as historical/reference. 8 superseded close-outs moved to `.Archive/`. `Hercules.md` renamed to `hercules.md` with live references updated. Roster consistency confirmed across readme.md, CLAUDE.md, and live agent files (10 agents, MarcusAurelius replacing Herodotus). Governance-sweep-spec archived.
- **Learned:** When two agent files point at the same role (one uncustomized stub, one customized canonical), the resolution is a rename — pick the intended name and propagate. The workflow docs (`WORKFLOW_REFERENCE.md`, virtuoso `SKILL.md`) signal which name the project considers canonical.
- **Bottom line:** Active close-out set is leaner (41 entries + SpecRetro vs. 47+Memo); agent file naming follows the documented convention; MarcusAurelius is the canonical doc-keeper across CLAUDE.md, agents/, agents/readme.md, ROADMAP.md, LESSONS_LEARNED.md, WORKFLOW_REFERENCE.md, and the virtuoso skill.

## Findings

| Item | Result | Disposition |
|---|---|---|
| (1) MarcusAurelius stub vs herodotus.md (competing names) | Two files claimed the doc-keeper role: `.claude/agents/MarcusAurelius.md` was an uncustomized template; `.claude/agents/herodotus.md` was the customized canonical. CLAUDE.md referenced Herodotus; `WORKFLOW_REFERENCE.md` and Virtuoso `SKILL.md` referenced MarcusAurelius. | Rename to MarcusAurelius (user direction): deleted `herodotus.md`; created `.claude/agents/marcusaurelius.md` with the customized doc-keeper content (frontmatter `name: MarcusAurelius (sonnet/Chronicler)`); body uses `MarcusAurelius` / `marcusaurelius` consistently. |
| (2) ROADMAP header | Current at 2026-05-27 READER-ISO-1E close-out; no stale traces | No edit needed. |
| (3) ROADMAP_SPECS.md | All per-sprint detail sections are for completed sprints; preface said "for each active sprint" | Updated preface to clarify file holds historical reference + Type-Flow Matrix + Dissolved Sprints; canonical architecture decisions now live in `docs/governance/TTS_ARCHITECTURE_DECISIONS.md`. New full specs go in `ROADMAP.md`. Link `[ROADMAP_SPECS.md](ROADMAP_SPECS.md)` resolves. |
| (4) Close-out volume | 47 close-outs + 1 Memo in active set, several superseded | Created `.Archive/`; moved 8 files: `CloseOut.READER-PERSISTENT-ANCHOR-STEP3.1`–`STEP3.6` (6, superseded by STEP3-REPAIR), `CloseOut.TTS-INTEGRATE-1.2026-05-15.md` (superseded by 05-16), `Memo.TTS-DIAG-1.GovernanceStaging.2026-05-15.md` (transient staging file). Active set now 41 close-outs + SpecRetro. |
| (5) Naming-convention outliers | `Hercules.md` and `MarcusAurelius.md` were TitleCase | Both resolved: `Hercules.md` renamed to `hercules.md` (Windows two-step rename); the old `MarcusAurelius.md` stub was replaced by the lowercase `marcusaurelius.md` per item (1). Live `Hercules.md` references in `CLAUDE.md:117` and `.claude/agents/readme.md:12` updated to `hercules.md`. Agent names preserved in YAML frontmatter. |
| (6) Roster consistency | `.claude/agents/readme.md`, CLAUDE.md roster tables, actual files | All three now agree on the 10 active agents: `zeus`, `hermes`, `hercules`, `athena`, `aristotle`, `hippocrates`, `solon`, `plato`, `marcusaurelius`, `simonides`. Pending/flagged section in readme.md removed. |
| Governance-sweep-spec | Completed sweep spec from 2026-05-21 still in project root | Moved to `docs/planning/.Archive/governance-sweep-spec.2026-05-21.md` per Document Lifecycle. |

## Interpretation

This sprint closed the residual governance-debt items from the 2026-05-22 GOVERNANCE-SWEEP that needed human judgment. The two notable judgment calls:

1. **MarcusAurelius rename, not removal.** The first-pass resolution treated MarcusAurelius as a stub to delete (since `.claude/agents/MarcusAurelius.md` was uncustomized and Herodotus was canonical in CLAUDE.md). User correction redirected: the workflow docs already treated MarcusAurelius as the canonical doc-keeper name; the right resolution was to rename Herodotus → MarcusAurelius across the project, preserving the customized agent definition under the new name. SRL-078 captures this: when two competing names exist for the same role, treat the workflow-doc references as the canonical signal.
2. **Close-out supersession.** STEP3.1–STEP3.6 roll up into STEP3-REPAIR's unified disposition. TTS-INTEGRATE-1 had two close-outs (05-15 stopped on broad-suite failure per SRL-029; 05-16 was the successful re-run). Memo.TTS-DIAG-1.GovernanceStaging was the transient worktree governance-staging file.

No runtime code touched. `git diff --check` will be clean (docs-only).

## Implementation Evidence

| Check | Result |
|---|---|
| Agent rename (item 1) | `.claude/agents/herodotus.md` deleted; `.claude/agents/marcusaurelius.md` created with customized doc-keeper content under `name: MarcusAurelius (sonnet/Chronicler)`. Propagated to: `CLAUDE.md` (roster table line, key references, mandatory pass section, efficiency rule), `.claude/agents/readme.md` (roster table), `.claude/agents/zeus.md` (orchestration references), `.claude/agents/hercules.md` (cross-agent reference), `.claude/agents/athena.md` (cross-agent reference), `.claude/agents/simonides.md` (memory examples + scenario 4 heading), `ROADMAP.md` (TTS-QUAL-CI-1 Herodotus task label + Roster line), `docs/governance/LESSONS_LEARNED.md` (PR-091 doc-keeper reference), `.claude/WORKFLOW_REFERENCE.md` (3 spots), `.claude/skills/virtuoso/SKILL.md` (specialist hierarchy + roster example + routing rule + 4 example/table spots). |
| Filename naming (item 5) | `Hercules.md` → `hercules.md` (two-step rename on Windows); `MarcusAurelius.md` → `marcusaurelius.md` (new file under correct casing as part of item 1). |
| File moves | 8 close-outs → `docs/governance/close-outs/.Archive/`; `governance-sweep-spec.2026-05-21.md` → `docs/planning/.Archive/`. |
| Grep-clean | No active surfaces still reference `Herodotus`/`herodotus` outside historical archives (verified with project-wide grep). |
| No code touched | `src/` and `main/` untouched. |
| Runtime behavior | None — docs-only. |

## Governance Updates

- `ROADMAP.md` — GOV-HUMAN-REVIEW-1 marked complete in Completed Work Summary; header advanced; spec block removed.
- `docs/governance/sprint-queue.xlsx` — GOV-HUMAN-REVIEW-1 marked Complete with Seq cleared; queue renumbered (NARRATE=1 stub, TTS-QUAL-CI-1=2 full spec, UX-POLISH-1=3 stub).
- `docs/governance/close-outs/SpecRetro.Lessons_Learned.md` — SRL-078 appended (workflow-doc role drift; rename-vs-removal heuristic).

## Gates

| Gate | Result |
|---|---|
| Automated verification | N/A (docs-only; Test/Build tier = None per spec) |
| Manual screen QA | N/A |
| Merge | Pending — git handoff packet provided to user |
| Next sprint | TTS-QUAL-CI-1 (CI regression gate wiring) — NARRATE-CLOSED-LOOP-CURSOR still a buffer-gap stub awaiting full spec per SRL-072 |

## Key Engineering Finding

Workflow documents (`.claude/WORKFLOW_REFERENCE.md`, project-local Virtuoso `SKILL.md`) can carry the project's *intended* agent names while the canonical-roster file holds an obsolete name. When CLAUDE.md and workflow docs disagree, the disagreement is signal — treat the workflow docs as the project's evolving intent and rename the canonical roster to match, rather than deleting the workflow-doc references to silence the inconsistency. Standing Rule #14 should be extended to grep `.claude/` recursively; SRL-078 captures the pattern for promotion review on a second occurrence.
