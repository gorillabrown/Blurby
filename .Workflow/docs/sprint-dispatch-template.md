# Sprint Dispatch Template (CLI Evergreen)

**Purpose:** Standard work order format for dispatching sprints to Claude Code CLI or sub-agents. This is a POINTER, not a PAYLOAD — it references detailed specs, it doesn't duplicate them.

**When to use:** Every time work is dispatched to execution agents. Copy this template, fill in every section. Sections marked [REQUIRED] must be completed. Sections marked [IF APPLICABLE] can be omitted when genuinely irrelevant.

---

```markdown
## [SPRINT-ID] [VERSION] — [Short Description]

### KEY CONTEXT
[REQUIRED. 2–4 sentences. Project state, what just happened, why this work matters now. Include any failed prior attempts and what was learned from them.]

### PROBLEM
[REQUIRED. What is broken, missing, or inadequate. Be specific — no hand-waving. State the gap between current state and target state with numbers where possible.]

### EVIDENCE OF PROBLEM
[REQUIRED. Concrete data, not intuition. Reference specific outputs, logs, metrics, file paths, or session artifacts. Include exact values and where they came from.]

### HYPOTHESIZED SOLUTION
[REQUIRED. What we believe will fix it and why. If tuning multiple values, state the tuning order and rationale for coupling/decoupling. Include starting values and expected direction of change.]

### EVIDENCE FOR HYPOTHESIS
[IF APPLICABLE. Why we believe this solution is correct. Reference prior calibration runs, sensitivity analysis, lessons learned entries, or known relationships between variables. Omit only if the solution is mechanically obvious (e.g., a bug fix with a clear root cause).]

### WHAT (Tasks to Complete)

[REQUIRED. Numbered task table. Every task has an owner and model tier.]

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | [Action verb] [specific deliverable] | [agent-name] | [opus/sonnet/haiku/—] |
| 2 | ... | ... | ... |
| N | Print summary results in terminal | [lead-agent] | — |

**Task rules:**
- Each task should be 2–5 minutes of focused work (longer tasks must be decomposed)
- Final task should always be a terminal summary of what changed and what the results were
- Include git commit/merge as an explicit task when code changes are involved
- Include documentation updates (CLAUDE.md, Roadmap, LESSONS_LEARNED) as an explicit task

### WHERE (Read in This Order)

[REQUIRED. Ordered list of files/docs the executing agent must read before starting. Reading order matters — list context files first, then implementation files, then reference/target files.]

1. [File path] — [what to look for / why it matters]
2. [File path] — [what to look for / why it matters]
3. ...

### HOW (Agent Assignments)

[REQUIRED. Who does what, with model tier. One row per agent involved.]

| Agent | Model | Responsibility |
|-------|-------|----------------|
| [agent-name] | [opus/sonnet/haiku] | [Specific scope — what they do and don't do] |
| ... | ... | ... |

**Execution mode notes:**
- State whether calibration/long-running commands should be run directly in bash vs. through sub-agents (sub-agents may timeout on commands >2 min)
- State whether agents should use explicit timeouts on commands

### WHEN (Execution Order)

[REQUIRED. Dependency graph. Show what runs in parallel vs. sequential. Use arrows for dependencies.]

```
[1] [task name] ([agent], [parallelizable? Y/N])
    ↓
[2] [task name] ([agent])
    ↓
[3–4] PARALLEL:
    ├─ [3] [task name] ([agent])
    └─ [4] [task name] ([agent])
    ↓ (both complete)
[5] [task name] ([agent])
```

**Parallelism rules:**
- Tasks with shared file dependencies are SEQUENTIAL
- Tasks with independent code paths MAY be parallel
- Review tasks (spec-compliance, quality) are always SEQUENTIAL after implementation
- Git operations are always LAST

### ADDITIONAL GUIDANCE

[IF APPLICABLE. Operational constraints, gotchas, guardrails, and failure modes. Include anything the executing agent needs to know that isn't captured in the task list.]

Topics to consider:
- **Tuning guardrails:** Acceptable ranges for constants; when to stop and escalate
- **Execution environment:** Clean working tree required? Specific branch? Seed values?
- **Timeout thresholds:** Maximum acceptable runtime per step; what to do if exceeded
- **Failure modes:** What to do if a step fails, hangs, or produces unexpected output
- **Git workflow:** Branch naming convention, merge strategy, commit message format
- **Anti-patterns:** Specific mistakes this type of work is prone to (e.g., "Do NOT run through sub-agents — run directly in bash to avoid timeout")

### SUCCESS CRITERIA

[REQUIRED. Numbered, testable acceptance criteria. Every criterion must be objectively verifiable — no subjective assessments.]

1. [Metric]: [operator] [threshold] (e.g., "Decision rate: ≥30%")
2. [Artifact]: [exists/updated/committed] (e.g., "CLAUDE.md updated with new calibration baseline")
3. [Test suite]: [pass count], [fail count] (e.g., "960+ pass, 0 fail")
4. [Version]: `package.json` version bumped to [VERSION] (e.g., "package.json version bumped to 0.9.1")
5. [Git]: [branch merged, pushed] (e.g., "Feature branch merged to main, main pushed")
6. [Terminal output]: Summary printed with [specific items]
```

---

## Template Usage Notes

### Sizing Guide

| Sprint Scope | Expected Sections | Typical Length |
|-------------|-------------------|----------------|
| Single-constant tune | All REQUIRED | ~40 lines |
| Multi-step feature | All sections | ~60–80 lines |
| Recovery / remediation | All sections (EVIDENCE FOR HYPOTHESIS critical) | ~80–100 lines |
| Multi-agent parallel sprint | All sections (WHEN section most complex) | ~80–120 lines |

### Version Convention

Every sprint header includes a `[VERSION]` tag — the version `package.json` will be after the sprint merges. Agents must bump `package.json` as part of the git commit task.

| Bump | When | Example |
|------|------|---------|
| **Patch** (0.9.x) | Bug fixes, test harness, docs, remediation — no user-facing behavior change | `0.9.0 → 0.9.1` |
| **Minor** (0.x.0) | New features, keyboard remaps, UX changes — user notices something different | `0.9.1 → 0.10.0` |
| **Major** (x.0.0) | Release gates only (v1.0.0, v2.0.0) | `0.10.0 → 1.0.0` |

When parallel sprints dispatch, assign versions in merge order (first to merge gets lower version). If merge order is unknown at dispatch time, assign both and let the second sprint to merge read `package.json` for the current value before bumping.

### Common Mistakes

| Mistake | Why It's Wrong | Fix |
|---------|---------------|-----|
| Omitting EVIDENCE OF PROBLEM | Agents can't verify they've solved the right problem | Always include concrete data with source references |
| Vague success criteria ("it should work better") | Can't be objectively verified | Use numbers, thresholds, and operators |
| Missing WHERE section | Agents waste tokens reading irrelevant files | List exact files in priority order |
| Combining implementation + review in one task | Violates separation of concerns | Separate into distinct tasks with different agents |
| No terminal summary task | No way to confirm what happened at a glance | Always end with a print-summary step |
| Omitting git as an explicit task | Git operations get forgotten or done incorrectly | Always include branch/commit/merge/push as a task |
| "Run calibration" without specifying N/seeds/timeout | Non-reproducible results | Specify exact parameters |
| Dispatching long commands to sub-agents | Sub-agents timeout on >2 min commands | State "run directly in bash" for long commands |

### Integration with Workflow

This template is referenced by:
- `skills/planning/SKILL.md` — Generated at end of planning phase
- `agents/orchestrator.md` — Consumed at start of execution phase
- `docs/workflow-map.md` — Phase 3 (Execution) entry point

After dispatch, the orchestrator follows the WHEN section to dispatch agents in order. Each completed task goes through spec-compliance review (does output match the task spec?) before the next task begins.
