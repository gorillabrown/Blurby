# Workflow System — Orientation & Project Setup

**This document is both an orientation AND a setup procedure.** When you encounter this file at the start of a new project, execute it. When you encounter it at the start of a returning session, skip to §3 (Returning Sessions).

---

## §0. What You're Looking At

The `.Workflow/` directory sitting next to this file is a portable, project-agnostic process discipline system. It contains skills (step-by-step process definitions), agent templates (specialist role definitions), and documentation (lifecycle maps, catalogs, customization guides). It was extracted from a complex simulation project that evolved over 78 sessions, 3 external audits, and 147 documented engineering lessons.

The system exists because unstructured LLM assistance — where you "just do the task" — produces inconsistent results, skips verification, and accumulates technical debt across sessions. This workflow prevents that by enforcing hard gates, review loops, anti-rationalization defenses, and measurement-before-movement discipline at every phase.

**Your job right now:** Set up this project's infrastructure so future sessions can launch cleanly. Follow §1 and §2 below, in order, before doing any project work.

---

## §1. First-Time Project Setup

Execute these steps the first time this workflow is used on a new project. This creates the directory structure, governing documents, and agent infrastructure that all future sessions depend on.

### Step 1.1 — Survey the Project

Before creating anything, understand what exists. Read the project root directory and answer these questions:

1. **Does a `.claude/` directory exist?** If yes, read `.claude/CLAUDE.md` if present.
2. **Does a `CLAUDE.md` exist at project root?** If yes, read it — it may contain project-specific instructions.
3. **Is there a `LESSONS_LEARNED.md` or equivalent?** Note its location.
4. **Is there a `ROADMAP.md` or equivalent?** Note its location.
5. **Is there a `.claude/agents/` directory with agent definitions?** Note what agents exist.
6. **What is the tech stack?** (languages, frameworks, databases, test runners)
7. **What is the git state?** (`git status`, current branch, any uncommitted work)

Record your findings — you'll use them in the steps below.

### Step 1.2 — Create the Project Skeleton

Create any missing infrastructure directories and files. Skip anything that already exists.

```
[PROJECT_ROOT]/
├── .claude/
│   ├── CLAUDE.md                    ← Session state document (working memory)
│   └── agents/                      ← Agent definitions for this project
│       └── [agent-name].md          ← One file per specialist agent
├── LESSONS_LEARNED.md               ← Engineering journal
├── PROJECT_CONSTITUTION.md          ← Governing principles (optional but recommended)
├── ROADMAP.md                       ← Sprint plans and acceptance criteria
└── .Workflow/                       ← THIS SYSTEM (already present)
    ├── WORKFLOW_ORIENTATION.md      ← This file
    ├── session-bootstrap.md
    ├── skills/
    ├── agents/
    └── docs/
```

**Actions to execute:**

```bash
# Create .claude directory if it doesn't exist
mkdir -p .claude/agents

# Create agent memory directory if using persistent agent memory
mkdir -p .claude/agent-memory
```

If any of these files don't exist yet, create them in the following steps. If they already exist, read them and skip to step 1.5.

### Step 1.3 — Create or Update `.claude/CLAUDE.md`

This is the project's **working memory** — the document that every session reads first. It captures current state, forward plan, standing rules, and key references. It must stay under ~30k characters; archive older content when it grows.

If `.claude/CLAUDE.md` doesn't exist, **ask the user** the following (use multiple-choice where possible):

1. What is this project? (1-2 sentence description)
2. What tech stack are you using? (languages, frameworks, databases, test runner)
3. What's the current state? (early prototype / active development / mature / maintenance)
4. Are there specific rules or constraints Claude should follow?
5. Who does what? (Is Claude the sole developer? Is there a human team? Is Claude planning-only while another agent executes?)

Then create `.claude/CLAUDE.md` with:

```markdown
# [Project Name]

## Division of Labor
[FILL: Who plans? Who executes? Who reviews?]

### Standing Rules
- [FILL: Project-specific constraints — e.g., "all constants in config.toml", "test after every change"]
- Always read CLAUDE.md and LESSONS_LEARNED.md before sessions that may change the codebase
- Always update documentation after changes
- Parallelize independent work. Sequence dependent work.

## Key References
- **Workflow System**: `.Workflow/WORKFLOW_ORIENTATION.md` (read at session start)
- **Session Bootstrap**: `.Workflow/session-bootstrap.md` (skill gate rule, priorities)
- **Lessons Learned**: `LESSONS_LEARNED.md`
- **Roadmap**: `ROADMAP.md`
- [FILL: Project-specific references — tech authority doc, API spec, etc.]

## Current System State
- **Phase**: [FILL]
- **Tests**: [FILL: count, pass rate, command]
- **Open Issues**: [FILL]

## Phase Status
| Phase | Status | Notes |
|-------|--------|-------|
| [FILL] | [FILL] | [FILL] |
```

### Step 1.4 — Create Remaining Governing Documents

**LESSONS_LEARNED.md** (if it doesn't exist):

```markdown
# Lessons Learned

Entry format: `LL-###` — chronological, immutable (never edited after creation).
Create an entry after any non-trivial discovery: surprising bugs, unexpected measurement results, architectural decisions, gotchas, failed assumptions.

---

## LL-001: [DATE] Workflow System Adopted
**Area:** process
**Context:** Project adopted the portable workflow system from `.Workflow/`.
**Decision:** All future work follows the Skill Gate Rule — check `.Workflow/skills/` before any task.
**Guardrail:** Session bootstrap (`.Workflow/session-bootstrap.md`) is read at every session start.
```

**ROADMAP.md** (if it doesn't exist):

```markdown
# Roadmap

Spec out at least 3 sprints in advance. Each sprint has: scope, tasks, agent assignments, acceptance criteria.

---

## [Sprint 1 Name]
**Goal:** [What should be true at the end?]

### Tasks
| Step | Task | Owner |
|------|------|-------|
| 1 | [FILL] | [FILL] |

### Acceptance Criteria
- [ ] [Testable criterion]
- [ ] Tests pass
- [ ] Documentation updated
```

**PROJECT_CONSTITUTION.md** (optional but recommended for complex projects — ask the user if they want one):

See `.Workflow/docs/customization-guide.md` §Step 2b for the full template. The constitution captures engineering philosophy, architecture law, calibration discipline, and process governance. It's the supreme governing document that future sessions and agents defer to.

### Step 1.5 — Set Up the Agent Roster

The workflow system includes generic agent templates in `.Workflow/agents/`. For this project, you need to decide which agents to activate and customize them.

**Read `.Workflow/agents/orchestrator.md` first** — it defines the lead agent that coordinates all others.

**Ask the user:**

1. Will this project use multi-agent orchestration (Claude Code CLI with subagents), or single-session inline execution?
2. What specialist agents does this project need? Common roster:

| Agent | Role | Model | When to Use |
|-------|------|-------|-------------|
| orchestrator | Coordinates multi-step work | opus | Complex sprints, multi-agent campaigns |
| investigator | Deep root-cause analysis, read-only | opus | Bugs with unknown cause |
| quality-reviewer | Architecture + code quality review | sonnet | After implementation |
| spec-compliance-reviewer | Verifies implementation matches spec | sonnet | After implementation |
| test-runner | Runs tests, reports results | haiku | After every code change |
| doc-keeper | Updates all documentation | sonnet | After every phase/sprint |
| calibration-tuner | Measurement and constant tuning | sonnet | After logic changes |

**If using multi-agent orchestration**, copy and customize the relevant templates:

```bash
# Copy the generic templates into the project's agent directory
cp .Workflow/agents/orchestrator.md .claude/agents/lead.md
cp .Workflow/agents/investigator.md .claude/agents/investigator.md
cp .Workflow/agents/quality-reviewer.md .claude/agents/code-reviewer.md
cp .Workflow/agents/test-runner.md .claude/agents/test-runner.md
cp .Workflow/agents/doc-keeper.md .claude/agents/doc-keeper.md
# ... add others as needed
```

Then edit each copied file to replace `[CUSTOMIZE]` markers with project-specific content: file paths, test commands, module names, architecture rules, known traps.

**If using single-session inline execution**, the agent templates still serve as checklists for the roles you'll perform yourself. No file copying needed — just reference `.Workflow/agents/` when performing each role.

### Step 1.6 — Customize the Skill `[CUSTOMIZE]` Markers

The skills in `.Workflow/skills/` contain `[CUSTOMIZE]` markers at points where project-specific content is needed. The most important ones to fill in now:

| Marker | Where It Appears | What to Fill In |
|--------|-----------------|-----------------|
| `[PROJECT_CONFIG]` | Multiple skills | Path to `.claude/CLAUDE.md` |
| `[PROJECT_CONSTITUTION]` | brainstorming, verification | Path to `PROJECT_CONSTITUTION.md` |
| `[LESSONS_LEARNED]` | debugging, verification, doc-keeper | Path to `LESSONS_LEARNED.md` |
| `[PROJECT_TEST_FAST_COMMAND]` | tdd, verification, test-runner | e.g., `pytest -m "not slow" -q` |
| `[PROJECT_TEST_FULL_COMMAND]` | tdd, verification, calibration | e.g., `pytest -q` |
| `[BRANCH_NAMING_CONVENTION]` | workspace-isolation, branch-finishing | e.g., `<sprint>-<scope>` |
| `[AUDIT_DIR]` | external-audit | e.g., `audits/` |

**You have two options:**

**Option A (recommended for most projects):** Don't edit the workflow files directly. Instead, record the project-specific values in `.claude/CLAUDE.md` under a "Workflow Customization" section. When a skill references `[PROJECT_TEST_FAST_COMMAND]`, Claude reads the value from CLAUDE.md. This keeps the workflow package clean and portable.

```markdown
## Workflow Customization
- **Test (fast):** `pytest -m "not slow" -q`
- **Test (full):** `pytest --runslow -q`
- **Branch naming:** `<sprint>-<wave>` (e.g., `sprint1-wave-a`)
- **Audit directory:** `audits/`
```

**Option B (for locked-down environments):** Edit the `[CUSTOMIZE]` markers directly in the workflow skill files. This makes the workflow non-portable but self-contained.

### Step 1.7 — Wire the Session Bootstrap

The session bootstrap (`.Workflow/session-bootstrap.md`) must be read at the start of every session. Wire it into the project's entry point:

**Add to `.claude/CLAUDE.md`** (near the top, in the standing rules or first section):

```markdown
## Session Start Protocol
1. Read this file (CLAUDE.md)
2. Read `.Workflow/session-bootstrap.md` (Skill Gate Rule, priorities, red flags)
3. Read `LESSONS_LEARNED.md` (if session may change codebase)
4. Read `ROADMAP.md` (if session involves planned work)
```

### Step 1.8 — Establish Baseline

Before any work begins, establish a clean baseline so future sessions can detect regressions:

1. **Run tests** (if tests exist): Record pass count and any known failures.
2. **Record git state**: Current branch, latest commit hash, any uncommitted changes.
3. **Record project metrics** (if applicable): calibration results, benchmark scores, coverage.
4. **Document the baseline** in `.claude/CLAUDE.md`:

```markdown
## Baseline (Session 1)
- **Tests:** [N] pass, [M] fail, [K] skip
- **Git:** branch `main`, commit `abc1234`
- **Calibration:** [N/A or results]
```

### Step 1.9 — Report Setup Complete

After completing steps 1.1–1.8, report to the user:

```
Setup complete. Here's what was created:

CREATED:
- .claude/CLAUDE.md — session state document
- .claude/agents/ — [N] agent definitions copied and customized
- LESSONS_LEARNED.md — engineering journal (1 entry)
- ROADMAP.md — sprint plan template
- [any other files created]

ALREADY EXISTED (read, not modified):
- [list files that were already present]

BASELINE:
- Tests: [N] pass
- Git: branch [X], commit [Y]
- Calibration: [results or N/A]

NEXT: Ready for first task. The Skill Gate Rule is active —
every task will be checked against .Workflow/skills/ before execution.
```

---

## §2. Returning Sessions (Ongoing Work)

Execute these steps at the start of every session after initial setup.

### Step 2.1 — Context Loading

Read these files in order:

1. `.claude/CLAUDE.md` — current project state, standing rules, phase status
2. `.Workflow/session-bootstrap.md` — Skill Gate Rule, priority hierarchy, red flags
3. `LESSONS_LEARNED.md` — recent entries (last 10-20) for active gotchas
4. `ROADMAP.md` — current sprint scope and acceptance criteria (if applicable)

### Step 2.2 — State Verification

Before starting work:

1. **Git status**: Clean working tree? On the right branch?
2. **Test baseline**: Do existing tests still pass? (Quick run if feasible)
3. **Open issues**: Any blockers or unresolved findings from last session?

If anything is unexpected, report to the user before proceeding.

### Step 2.3 — Apply the Skill Gate

When the user gives you a task:

1. **Stop.** Before responding, check: "Does any skill in `.Workflow/skills/` apply?"
2. **Even a 30% match → read the skill.** False positives are cheap. False negatives cause rework.
3. **Follow the skill's process.** Don't abbreviate, don't skip steps, don't rationalize skipping steps.

Skill priority order (when multiple apply):

1. `brainstorming/` — Before any creative or design work
2. `planning/` — Before any multi-step implementation
3. `workspace-isolation/` — Before touching code
4. `tdd/` — During all code writing
5. `execution/` — During multi-task implementation
6. `debugging/` — When something is broken
7. `calibration/` — When tuning or measuring
8. `verification/` — Before claiming anything is complete
9. `code-review-*/` — After implementation, before merge
10. `branch-finishing/` — When integrating completed work
11. `external-audit/` — For third-party review
12. `writing-skills/` — When creating new skills

---

## §3. Reference: The Workflow Package

### Directory Layout

```
.Workflow/
├── WORKFLOW_ORIENTATION.md          ← THIS FILE
├── session-bootstrap.md             ← Injected at every session start
│
├── skills/                          ← Process discipline definitions
│   ├── brainstorming/SKILL.md       ← Design phase: explore → propose → approve
│   ├── planning/SKILL.md            ← Task decomposition + sprint dispatch template
│   ├── execution/SKILL.md           ← Multi-agent or inline implementation
│   ├── tdd/SKILL.md                 ← RED-GREEN-REFACTOR discipline
│   ├── debugging/SKILL.md           ← 4-phase systematic root-cause analysis
│   ├── verification/SKILL.md        ← Evidence-before-claims completion proof
│   ├── code-review-requesting/SKILL.md
│   ├── code-review-receiving/SKILL.md
│   ├── parallel-agents/SKILL.md     ← Safe parallelism identification
│   ├── workspace-isolation/SKILL.md ← Feature branch + clean baseline
│   ├── branch-finishing/SKILL.md    ← Merge / PR / keep / discard
│   ├── external-audit/SKILL.md      ← 6-step third-party review pipeline
│   ├── calibration/SKILL.md         ← Tiered measurement and tuning
│   └── writing-skills/SKILL.md      ← Meta-skill: TDD-for-documentation
│
├── agents/                          ← Generic agent prompt templates
│   ├── orchestrator.md              ← Lead coordinator
│   ├── investigator.md              ← Deep forensic analysis (read-only)
│   ├── spec-compliance-reviewer.md  ← "Does this match the spec?"
│   ├── quality-reviewer.md          ← "Is this well-built?"
│   ├── test-runner.md               ← Run tests, report results
│   ├── doc-keeper.md                ← Update all documentation layers
│   └── memory-guide.md              ← Persistent agent memory system
│
└── docs/                            ← Reference documentation
    ├── workflow-map.md              ← Full lifecycle directed graph
    ├── skill-catalog.md             ← Master index of all skills
    └── customization-guide.md       ← How to adapt for any project
```

### Instruction Priority Hierarchy

When you receive conflicting guidance:

1. **User explicit instructions** — highest priority
2. **Project constitution / governing docs** — project-specific principles
3. **Workflow skills** — process disciplines from this system
4. **Standing rules** — always-true constraints
5. **Default behavior** — lowest priority

### The Anti-Rationalization Architecture

Every skill contains a **rationalization table**. These are the highest-value content in the system. They prevent behavioral drift under pressure.

| What you'll think | What's actually true |
|---|---|
| "This is straightforward, no design needed" | Every 'straightforward' change that skipped design caused regressions |
| "I'll skip the review, it's clean" | The implementer is the worst judge of their own work |
| "I know what's wrong, let me just fix it" | You're guessing. Measure first. |
| "This is too simple for the full process" | Small changes cause the majority of production incidents |
| "I'll design as I go" | Designing during implementation means discovering problems after building the wrong thing |
| "Review is overkill for this small change" | The changes that skip review are the ones that break things |

### Standing Rules (Always Active)

1. **Measure before you move.** Don't tune without calibrating. Don't claim success without evidence.
2. **Data dominates.** When a bug occurs, ask "Is the data wrong?" before "Is the algorithm wrong?"
3. **Simple beats clever.** Don't get fancy until simple fails under measurement.
4. **Separation of concerns.** Each variable has one job. Each layer answers one question.
5. **Document everything.** Update docs after changes. Review docs before sessions.
6. **Test after every change.** No exceptions.
7. **Parallelize independent work. Sequence dependent work.** State which is which and why.
8. **Fresh agent per task.** Context from task A pollutes task B.
9. **Controller provides full context.** Subagents never read files to understand their task — the controller extracts and provides everything.
10. **Three failed fixes → question the approach.** Don't keep polishing a broken design. Escalate.

---

## §4. Key Files to Read (Quick Reference)

| File | When | What It Contains |
|------|------|-----------------|
| `.Workflow/session-bootstrap.md` | **Every session** | Skill Gate Rule, priorities, red flags |
| `.Workflow/docs/skill-catalog.md` | Choosing which skill applies | Master index with triggers, inputs, outputs |
| `.Workflow/docs/workflow-map.md` | Understanding full lifecycle | Directed graph: session start → branch finish |
| `.Workflow/docs/customization-guide.md` | Adapting for a new project | `[CUSTOMIZE]` markers, domain skills, agent extension |
| `.Workflow/skills/planning/SKILL.md` | Before breaking down work | Sprint Dispatch Template, decomposition rules |
| `.Workflow/skills/execution/SKILL.md` | Before implementing | Two paths, review loops, progress reporting |
| `.Workflow/agents/orchestrator.md` | Coordinating multi-agent work | Parallelism rules, dispatch protocol, escalation |

---

*This document is permanent and project-agnostic. Project-specific instructions belong in the project's `.claude/CLAUDE.md` and `PROJECT_CONSTITUTION.md`, not here.*
