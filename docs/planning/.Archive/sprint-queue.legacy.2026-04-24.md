# Workflow System — Sprint Queue

> Live dispatch buffer. Next 3 sprints in CLI-ready format. FIFO execution.
> After each sprint: remove completed entry, verify depth ≥ 3, backfill if needed.
>
> **CLI execution rule:** CLI IS the orchestrator. On receiving any dispatch below, CLI reads the spec, loads `zeus.md` as a behavioral reference, builds a task plan, discovers agents, and delegates each task to sub-agents via `Agent()`. CLI coordinates — sub-agents implement. Each sub-agent runs in its own tool budget. See `WORKFLOW_REFERENCE.md` §1 and Virtuoso Phases 1–4.
>
> **Agent name resolution:** At dispatch time, CLI MUST use each agent's `name:` field from its YAML frontmatter (e.g., `Hermes.md` has `name: Hermes` — pass `"Hermes"` to `Agent()`). See zeus.md §Agent Name Resolution.

---

## WF-01 WAVE-A — Consistency Pass: Stale Agent Names & Document Counts

**Effort:** Medium | Override: tasks #4, #5, #7, #8 → Low

### KEY CONTEXT
The workflow package has three new authoritative reference documents (WORKFLOW_REFERENCE.md, AGENT_REFERENCE.md, SKILL_ENUMERATION.md) that use the Greek agent naming convention (Zeus, Athena, Hercules, Hermes, etc.) and reference 8 governance documents. However, 10 older workflow files still use the original English agent names (orchestrator, test-runner, doc-keeper, etc.) and reference "7 governing documents." This creates agent routing confusion at session start.

### PROBLEM
Agents read session-bootstrap.md and WORKFLOW_ORIENTATION.md at session start. These files reference `orchestrator`, `test-runner`, `doc-keeper`, `memory-guide`, `spec-compliance-reviewer`, `quality-reviewer`, and all `debt-scan-*` names — but the actual agent files use Greek names (zeus.md, hippocrates.md, herodotus.md, etc.). This mismatch causes wasted tool uses as agents try to resolve the discrepancy, and can cause dispatch failures when Zeus references old filenames.

### EVIDENCE OF PROBLEM
Grep across `.Workflow/` (excluding the 5 new reference docs) returns 60+ stale agent name references:
- `session-bootstrap.md`: 23 stale agent names (lines 106–128), 2 stale doc counts (lines 69, 228)
- `WORKFLOW_ORIENTATION.md`: 25+ stale references (lines 29, 165, 364–604), including cp commands and directory tree
- `docs/skill-catalog.md`: 20+ stale references (lines 12–20, 813–974)
- `docs/sprint-dispatch-template.md`: 2 stale references (lines 139, 142)
- `docs/workflow-map.md`: 1 stale reference (line 256)
- `docs/customization-guide.md`: 3 stale references (lines 298, 352, 671)
- `docs/sprint-queue.md`: 1 stale reference (line 130)
- `README.md`: 2 stale references (lines 206, 209)
- `skills/planning/SKILL.md`: 3 stale references (lines 158–160)

### HYPOTHESIZED SOLUTION
Bulk Python replacement script. Process each file, apply replacements in order (longest patterns first to prevent partial matches), write back. This is the same proven pattern used for the Greek rename session.

Replacement map (agent names — apply in this order):
1. `spec-compliance-reviewer` → `solon`
2. `quality-reviewer` → `plato`
3. `debt-scan-complexity` → `anaximander`
4. `debt-scan-test-gaps` → `eratosthenes`
5. `debt-scan-duplication` → `zeno`
6. `debt-scan-dead-code` → `diogenes`
7. `debt-scan-dependencies` → `anaximenes`
8. `debt-scan-doc-drift` → `thucydides`
9. `debt-scan-spec-drift` → `protagoras`
10. `debt-scan-todo-markers` → `xenophon`
11. `debt-scan-coupling` → `democritus`
12. `debt-scan-churn` → `heraclitus`
13. `debt-synthesizer` → `empedocles`
14. `orchestrator` → `zeus` (only agent-name contexts, NOT historical prose)
15. `test-runner` → `hippocrates`
16. `doc-keeper` → `herodotus`
17. `memory-guide` → `simonides`
18. `investigator` → `aristotle` (only agent-name contexts, NOT job descriptions)

For file path references (e.g., `agents/orchestrator.md`), replace the filename portion only.

Count replacements:
- `seven governing` → `eight governing`
- `7 governing` → `8 governing`
- `18 agent templates` → update to correct count

**Critical:** Do NOT replace "orchestrator" in AGENT_REFERENCE.md line 311 (historical prose about the two-layer management anti-pattern). Do NOT replace "investigator" when used as a job description (e.g., "read-only investigator").

### WHAT

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Write Python bulk-replacement script with ordered replacement map | Hercules | sonnet |
| 2 | Run script across all 10 target files | Hercules | sonnet |
| 3 | Manually fix context-sensitive replacements (historical prose, job descriptions) | Hercules | sonnet |
| 4 | Update model tiers for debt-scan agents: all `sonnet` references → `haiku` (AGENT_REFERENCE uses haiku for Stoa scanners) | Hermes | haiku |
| 5 | Grep verification: zero stale agent-name matches | Hippocrates | haiku |
| 6 | Update WORKFLOW_ORIENTATION.md governance doc templates to include KNOWN_TRAPS.md as 8th document | Hercules | sonnet |
| 7 | Final grep + review | Hippocrates | haiku |
| 8 | Git commit: `wf-01: consistency pass — Greek names and 8-doc model across workflow package` | Hermes | haiku |

### WHERE (Read in This Order)

1. `.Workflow/AGENT_REFERENCE.md` — Authoritative agent names, model tiers, and roster (the source of truth for all replacements)
2. `.Workflow/WORKFLOW_REFERENCE.md` §2 — 8-document governance model (the source of truth for doc counts)
3. `.Workflow/session-bootstrap.md` — Highest-priority update target (read at every session)
4. `.Workflow/WORKFLOW_ORIENTATION.md` — Second-highest priority (read at setup and returning sessions)
5. `.Workflow/docs/skill-catalog.md` — Third priority (referenced during skill gate)
6. Remaining files: README.md, docs/workflow-map.md, docs/sprint-dispatch-template.md, docs/customization-guide.md, docs/sprint-queue.md, skills/planning/SKILL.md

### HOW

| Agent | Model | Responsibility |
|-------|-------|----------------|
| Hercules | sonnet | Write replacement script, execute, handle context-sensitive fixes, add KNOWN_TRAPS template |
| Hermes | haiku | Model tier corrections, git commit |
| Hippocrates | haiku | Grep verification passes |

### WHEN

```
[1-3] Hercules: Write script → run → manual fixes (sequential, ~15 min)
  ↓
[4] Hermes: Model tier corrections (~3 min)
  ↓
[5] Hippocrates: First verification grep (~2 min)
  ↓
[6] Hercules: KNOWN_TRAPS template addition (~5 min)
  ↓
[7] Hippocrates: Final verification grep (~2 min)
  ↓
[8] Hermes: Git commit (~2 min)
```

Total: ~30 minutes

### OUT OF BOUNDS

- Do NOT modify WORKFLOW_REFERENCE.md, AGENT_REFERENCE.md, SKILL_ENUMERATION.md, GOG_WORKFLOW_COMPARISON.md, or WORKFLOW_SYSTEM_ROADMAP.md
- Do NOT modify any agent definition files (zeus.md, athena.md, etc.) — those are already correct
- Do NOT modify skills other than `skills/planning/SKILL.md` — other skill upgrades are Phase 6
- Do NOT rename actual agent files on disk — only update references within documentation
- Do NOT change prose/historical references to "orchestrator" (e.g., AGENT_REFERENCE.md line 311 discussing the two-layer management anti-pattern)

### ADDITIONAL GUIDANCE

- **Debt-scan model tier discrepancy:** WORKFLOW_ORIENTATION.md and session-bootstrap.md list all debt-scan agents as `sonnet`, but AGENT_REFERENCE.md lists them as `haiku`. AGENT_REFERENCE.md is authoritative. Update all debt-scan model tiers to `haiku` and Empedocles to `sonnet`.
- **Agent count:** WORKFLOW_ORIENTATION.md line 364 says "18 agent templates." Current canonical count: 7 core (Academy) + 11 debt-scan (Stoa) = 18 in the standard package. GoG adds 9 Gymnasium specialists. The template count of 18 is correct for the standard package — verify before changing.
- **File path replacements:** When replacing `agents/orchestrator.md`, replace with `agents/zeus.md`. Same pattern for all agent file references.
- **"investigator" as job description:** Lines like "read-only investigator" or "debug-investigator" in prose descriptions are fine as English. Only replace `investigator` when it's an agent name (e.g., in tables, file paths, or dispatch references).

### SUCCESS CRITERIA

1. `grep -rn "orchestrator\|test-runner\|doc-keeper\|memory-guide\|spec-compliance-reviewer\|quality-reviewer" .Workflow/ --include="*.md"` returns ONLY:
   - AGENT_REFERENCE.md line 311 (historical prose)
   - AGENT_REFERENCE.md line 160 (memory-guide in Simonides rationale)
   - AGENT_REFERENCE.md line 133 (doc-keeper in Herodotus rationale)
   - Any other clearly prose/descriptive usages
2. `grep -rn "debt-scan-\|debt-synthesizer" .Workflow/ --include="*.md"` returns zero matches outside AGENT_REFERENCE.md (which uses Greek names already)
3. `grep -rn "seven governing\|7 governing" .Workflow/ --include="*.md"` returns zero matches
4. All debt-scan agent model tiers show `haiku` (not `sonnet`). Empedocles shows `sonnet`.
5. KNOWN_TRAPS.md appears as document #8 in WORKFLOW_ORIENTATION.md §1.4 governance templates
6. Git commit created on feature branch

---

## WF-02 WAVE-A — KNOWN_TRAPS Template Integration

**Effort:** Low | Override: task #1 → Medium

### KEY CONTEXT
WF-01 updated all document counts to 8 and added KNOWN_TRAPS to governance listings. This sprint completes the integration by creating the actual template content, updating the setup flow, and ensuring KNOWN_TRAPS is woven into session bootstrap and CLAUDE.md templates.

### PROBLEM
WORKFLOW_REFERENCE.md §2 defines KNOWN_TRAPS as the 8th governance document and §13 specifies the format. But the project onboarding flow (WORKFLOW_ORIENTATION.md §1.4) only creates 7 documents. New projects adopting the workflow will skip KNOWN_TRAPS because the setup procedure doesn't create it.

### EVIDENCE OF PROBLEM
- WORKFLOW_ORIENTATION.md §1.4 has templates for documents 1–7 but no template for KNOWN_TRAPS
- session-bootstrap.md checklist does not include KNOWN_TRAPS review
- CLAUDE.md template (§1.3) Session Start Protocol does not mention KNOWN_TRAPS
- Gap analysis table (§1.2b) does not include KNOWN_TRAPS as a required document

### HYPOTHESIZED SOLUTION
Add KNOWN_TRAPS.md template to §1.4, add it to all checklists and tables that reference the governance doc set, and add a conditional check to the session bootstrap.

### WHAT

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Add KNOWN_TRAPS.md template to WORKFLOW_ORIENTATION.md §1.4 (between IDEAS and CLAUDE.md sections) | Hercules | sonnet |
| 2 | Add KNOWN_TRAPS row to §1.2b gap analysis template table | Hermes | haiku |
| 3 | Add KNOWN_TRAPS to CLAUDE.md template Session Start Protocol (§1.3) as conditional: "Read .governance/KNOWN_TRAPS.md — if session modifies code in areas with known traps" | Hermes | haiku |
| 4 | Add KNOWN_TRAPS to session-bootstrap.md conditional checklist: "I've checked .governance/KNOWN_TRAPS.md for dangers in areas I'll touch (if modifying code)" | Hermes | haiku |
| 5 | Add KNOWN_TRAPS to CLAUDE.md template Governing Documents table as row #8 | Hermes | haiku |
| 6 | Add KNOWN_TRAPS to session-bootstrap.md Seven Governing Documents table (now Eight) | Hermes | haiku |
| 7 | Verify all 8 governance documents appear consistently across WORKFLOW_ORIENTATION, session-bootstrap, and CLAUDE.md template | Hippocrates | haiku |
| 8 | Git commit: `wf-02: integrate KNOWN_TRAPS template into onboarding flow` | Hermes | haiku |

### WHERE

1. `.Workflow/WORKFLOW_REFERENCE.md` §2 and §13 — Authoritative definition of KNOWN_TRAPS format and governance model
2. `.Workflow/WORKFLOW_ORIENTATION.md` §1.3, §1.4, §1.2b — Setup flow to modify
3. `.Workflow/session-bootstrap.md` — Checklist and governance table to modify

### HOW

| Agent | Model | Responsibility |
|-------|-------|----------------|
| Hercules | sonnet | Template creation (§1.4 addition) |
| Hermes | haiku | Mechanical insertions across tables and checklists |
| Hippocrates | haiku | Cross-document verification |

### WHEN

```
[1] Hercules: Create KNOWN_TRAPS template in §1.4 (~5 min)
  ↓
[2-6] Hermes: 5 mechanical insertions (parallel within Hermes, ~8 min total)
  ↓
[7] Hippocrates: Verification pass (~3 min)
  ↓
[8] Hermes: Git commit (~2 min)
```

Total: ~18 minutes

### OUT OF BOUNDS

- Do NOT modify WORKFLOW_REFERENCE.md — it's already correct
- Do NOT create actual KNOWN_TRAPS.md files in any project — that happens during project setup or Phase 7 deployment
- Do NOT modify any agent files
- Do NOT modify skills

### SUCCESS CRITERIA

1. WORKFLOW_ORIENTATION.md §1.4 contains a KNOWN_TRAPS.md template with the format from WORKFLOW_REFERENCE §13
2. §1.2b gap analysis template includes KNOWN_TRAPS as document #8
3. CLAUDE.md template Session Start Protocol includes KNOWN_TRAPS as a conditional read
4. CLAUDE.md template Governing Documents table has 8 rows
5. session-bootstrap.md conditional checklist includes KNOWN_TRAPS
6. session-bootstrap.md governance table has 8 rows
7. `grep -c "KNOWN_TRAPS" .Workflow/WORKFLOW_ORIENTATION.md` ≥ 5
8. `grep -c "KNOWN_TRAPS" .Workflow/session-bootstrap.md` ≥ 3
9. Git commit created on feature branch

---

## WF-03 WAVE-A — Sprint Dispatch Template Upgrade

**Effort:** Medium | Override: tasks #5, #7, #9 → Low

### KEY CONTEXT
WORKFLOW_REFERENCE.md §4 defines the authoritative sprint dispatch system with sizing rules, precision requirements, wave-splitting, and scope fences. But the actual sprint-dispatch-template.md (which agents copy when authoring dispatches) pre-dates these rules. Dispatches authored against the current template will be missing critical sections.

### PROBLEM
The sprint-dispatch-template.md lacks 4 critical sections defined in WORKFLOW_REFERENCE §4:
1. No OUT OF BOUNDS section (scope fence)
2. No sizing rules (≤40 tool uses, ≤60 minutes)
3. No wave-splitting guidance
4. No precision checklist (exact paths, exact flags, expected runtimes, Bash timeouts)

Additionally, calibration tier is mentioned vaguely ("Run calibration") without requiring the explicit tier declaration (None / Quick / Full with N-values).

### EVIDENCE OF PROBLEM
Reading sprint-dispatch-template.md:
- "OUT OF BOUNDS" does not appear anywhere in the file
- "40 tool" does not appear
- "60 min" does not appear
- "wave" does not appear (no wave-splitting guidance)
- "precision" does not appear
- Calibration is referenced as "Run calibration" without specifying N-values or tier
- Common Mistakes table has 8 rows; at least 4 more are needed

### HYPOTHESIZED SOLUTION
Add the missing sections to the template, update the Common Mistakes table, and add a cross-reference to WORKFLOW_REFERENCE §4. The template structure (PROBLEM → EVIDENCE → HYPOTHESIS → WHAT/WHERE/HOW/WHEN → SUCCESS CRITERIA) is already correct — it just needs the new required sections and guidance inserted.

### WHAT

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Add OUT OF BOUNDS as a required section in the template (after WHEN, before ADDITIONAL GUIDANCE) | Hercules | sonnet |
| 2 | Add Sizing Rules section to Template Usage Notes: ≤40 tool uses, ≤60 min wall time, 2–5 min per task | Hercules | sonnet |
| 3 | Add Wave-Splitting Guidance section: when to split (>40 tools or >60 min), Wave A/B structure, how to link waves | Hercules | sonnet |
| 4 | Add Precision Checklist to ADDITIONAL GUIDANCE section: exact paths, exact flags, expected runtimes, Bash timeouts | Hercules | sonnet |
| 5 | Update calibration references: require explicit tier (None / Quick N=?×? / Full N=?×?) instead of vague "run calibration" | Hermes | haiku |
| 6 | Add 4 new rows to Common Mistakes table: missing scope fence, no sizing check, vague calibration spec, missing wave-split | Hercules | sonnet |
| 7 | Add cross-reference to WORKFLOW_REFERENCE §4 at top of file | Hermes | haiku |
| 8 | Verify template sections match WORKFLOW_REFERENCE §4 requirements | Hippocrates | haiku |
| 9 | Git commit: `wf-03: upgrade sprint dispatch template with sizing, precision, scope fences` | Hermes | haiku |

### WHERE

1. `.Workflow/WORKFLOW_REFERENCE.md` §4 — Authoritative dispatch system definition (source of truth for all additions)
2. `.Workflow/docs/sprint-dispatch-template.md` — File to modify
3. `.Workflow/WORKFLOW_REFERENCE.md` §5 — Calibration tier definitions (for explicit tier requirement)

### HOW

| Agent | Model | Responsibility |
|-------|-------|----------------|
| Hercules | sonnet | Template section additions, Common Mistakes expansion, wave-splitting guidance |
| Hermes | haiku | Calibration tier update, cross-reference insertion, git commit |
| Hippocrates | haiku | Verification against WORKFLOW_REFERENCE §4 |

### WHEN

```
[1-4] Hercules: Add OUT OF BOUNDS, sizing, wave-splitting, precision checklist (sequential, ~15 min)
  ↓
[5] Hermes: Calibration tier update (~3 min)
  ↓
[6] Hercules: Common Mistakes expansion (~5 min)
  ↓
[7] Hermes: Cross-reference + git prep (~2 min)
  ↓
[8] Hippocrates: Verification (~3 min)
  ↓
[9] Hermes: Git commit (~2 min)
```

Total: ~30 minutes

### OUT OF BOUNDS

- Do NOT modify WORKFLOW_REFERENCE.md — it's the source of truth
- Do NOT modify any other docs/ files — only sprint-dispatch-template.md
- Do NOT modify skills or agent files
- Do NOT change the existing template structure (PROBLEM → EVIDENCE → WHAT/WHERE/HOW/WHEN → SUCCESS CRITERIA) — only ADD new sections
- Do NOT remove any existing Common Mistakes rows — only add new ones

### SUCCESS CRITERIA

1. "OUT OF BOUNDS" appears as a required `[REQUIRED]` section in the template
2. Sizing rules (≤40 tool uses, ≤60 min, 2–5 min per task) appear in Template Usage Notes
3. Wave-splitting guidance section exists with Wave A/B structure
4. Precision checklist exists in ADDITIONAL GUIDANCE section
5. Calibration references require explicit tier with N-values
6. Common Mistakes table has ≥ 12 rows (was 8, +4 new)
7. Cross-reference to WORKFLOW_REFERENCE §4 appears near top of file
8. All new content is consistent with WORKFLOW_REFERENCE §4 (verified by Hippocrates)
9. Git commit created on feature branch
