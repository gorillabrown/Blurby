# Customization Guide: Adapting the Workflow for Your Project

This guide walks you through every step of adopting this workflow system for a new project. Follow it sequentially. Each step builds on the previous one.

---

## Overview: What You'll Customize

The workflow system is **project-agnostic by design** but **project-specific in execution**. You will customize:

1. **Project identity** (name, tech stack, governing principles)
2. **Team composition** (who are your agents? what are their domains?)
3. **Testing and verification** (how do you prove code works?)
4. **Measurement and calibration** (what metrics matter? what are targets?)
5. **Documentation standards** (how do you record decisions and lessons?)
6. **Tools and infrastructure** (CI/CD, git, issue tracking, etc.)

---

## Step 1: Copy the Workflow Directory

```bash
cd /your-project
cp -r /path/to/.Workflow ./.Workflow

ls .Workflow/
# Output:
# README.md
# session-bootstrap.md
# docs/
#   workflow-map.md
#   customization-guide.md (you are here)
#   skill-catalog.md         [CUSTOMIZE]
#   sprint-dispatch-template.md [CUSTOMIZE]
#   agent-template.md        [CUSTOMIZE]
# skills/
#   brainstorming.md
#   planning.md
#   execution.md
#   ... etc ...
# templates/
#   project-constitution.md  [CUSTOMIZE]
#   lessons-learned-entry.md [CUSTOMIZE]
#   session-state-template.md [CUSTOMIZE]
```

---

## Step 2: Create Project Identity Files

### 2a. Create `.claude/CLAUDE.md` (Session State)

This file is your **working memory** for the project. It updates every session and captures:
- Current phase and sprint
- Key decisions made
- Open issues and blockers
- Forward plan (next 3 sprints)
- Known gotchas and lessons

**To create:**

```bash
mkdir -p .claude
cp .Workflow/templates/session-state-template.md .claude/CLAUDE.md
```

**Edit `.claude/CLAUDE.md`:**
- Replace `[PROJECT_NAME]` with your project name
- Replace `[TECH_STACK]` with your tech (e.g., "Python 3.11, FastAPI, SQLite")
- Replace `[PHASE]` with current phase (e.g., "Phase 1: MVP")
- Fill in one session entry as an example

**Keep under ~30k characters.** As it grows, archive old entries to `CLAUDE_md_archive_session##.md`.

### 2b. Create `PROJECT_CONSTITUTION.md`

This is your **governing document** — the source of truth for what your project values, constrains, and requires.

**To create:**

```bash
cp .Workflow/templates/project-constitution.md ./PROJECT_CONSTITUTION.md
```

**Edit `PROJECT_CONSTITUTION.md`:**

Replace `[CUSTOMIZE]` markers with your project specifics:

```markdown
# [PROJECT_NAME] Project Constitution

## Article I: Core Values
[CUSTOMIZE: What does this project optimize for? Speed? Stability? Correctness? Maintainability?]

Example:
- **Correctness over speed.** We measure before we optimize.
- **Documentation as artifact.** Decisions are recorded, not just implemented.
- **Testing as evidence.** No changes ship without test coverage.

## Article II: Technical Principles
[CUSTOMIZE: What architectural patterns does this project commit to?]

Example:
- All constants live in `constants.toml` and are loaded at startup.
- All data models are validated at boundaries (input and output).
- All external service calls are mocked in tests.
- All breaking changes require migration steps.

## Article III: Engineering Discipline
[CUSTOMIZE: What process rules are non-negotiable?]

Example:
- Feature branches only; no direct commits to main.
- Tests pass before merge; no exceptions.
- Code review required for all PRs; minimum 1 approval.
- Lessons Learned entries created within 24 hours of non-trivial discovery.
- Full calibration required after any logic change.

## Article IV: Team Roles
[CUSTOMIZE: Who is responsible for what?]

Example:
- Planning agent (Cowork): Designs, plans, reviews, interprets measurement.
- Execution lead: Dispatches specialists, ensures spec compliance.
- Specialist agents: Execute within their domain, report findings.
- Human user: Makes final decisions, breaks ties, escalates concerns.

## Article V: Definition of Done
[CUSTOMIZE: What must be true for work to be considered complete?]

Example:
- Code is written and tested.
- Tests pass (both fast and slow suites).
- Calibration measurements within tolerance.
- Documentation updated (inline comments, LESSONS_LEARNED, CLAUDE.md).
- PR approved and merged to main.
- Changelog entry created.
```

### 2c. Create `LESSONS_LEARNED.md`

This is your **engineering journal** — a chronological record of non-trivial discoveries, decisions, and gotchas.

**To create:**

```bash
cp .Workflow/templates/lessons-learned-entry.md ./LESSONS_LEARNED.md
```

**Edit `LESSONS_LEARNED.md`:**

Add one section at the top with instructions:

```markdown
# Lessons Learned (Engineering Journal)

**Format:** Each entry is `LL-###` (LL-001, LL-002, ...). Entries are **chronological** and **immutable** (never deleted or edited after creation).

**When to create:** After any non-trivial discovery:
- Surprising bug
- Unexpected measurement result
- Architectural decision
- Gotcha that could bite someone else
- Test that revealed hidden assumption

**How to write:** Factual, concise (1 paragraph). Include: What happened, why it matters, what we'll do differently next time.

---

## LL-001: [Date] [Title]
[Summary of discovery and implication]

## LL-002: [Date] [Title]
[etc.]
```

---

## Step 3: Customize the Skill System

### 3a. Customize `skill-catalog.md`

This lists all available process disciplines your team will use.

**To create:**

```bash
cp .Workflow/docs/skill-catalog-template.md .Workflow/docs/skill-catalog.md
```

**Edit `.Workflow/docs/skill-catalog.md`:**

For each skill in your project, define:

```markdown
## Skill: [Name]

**Triggers:** When you need to [describe purpose]. Keywords: [e.g., "design", "architecture", "refactor"]

**Duration:** X min

**Model:** Haiku / Sonnet / Opus (or human)

**Steps:**
1. [Step 1]
2. [Step 2]
3. [etc.]

**Review Loop:**
- [ ] Checklist item 1
- [ ] Checklist item 2

**Escalation:**
- If blocked by X → do Y
- If blocked by Z → escalate to [role]

**Red Flags (Rationalizations to Avoid):**
| What You'll Think | Reality | Outcome |
|---|---|---|
| [Rationalization] | [Truth] | [Consequence] |
```

**Common project-specific skills:**

| Skill | Trigger | Example Domain |
|-------|---------|---|
| [CUSTOMIZE: e.g., "Database Migration"] | Changing schema | Systems requiring zero-downtime schema changes |
| [CUSTOMIZE: e.g., "Performance Profiling"] | Claiming something is slow | Systems where latency is measured and critical |
| [CUSTOMIZE: e.g., "Security Audit"] | Touching auth/encryption | Systems handling sensitive data |
| [CUSTOMIZE: e.g., "API Contract Review"] | Changing public API | Systems with external consumers |
| [CUSTOMIZE: e.g., "Data Consistency Check"] | Changing transaction logic | Systems with consistency guarantees |

### 3b. Customize Sprint Dispatch Template

Copy and customize the sprint dispatch template for your execution lead.

**To create:**

```bash
cp .Workflow/docs/sprint-dispatch-template.md .claude/agents/lead.md
```

**Template sections (customize examples):**

```markdown
# Sprint Dispatch Template

## Format
Every dispatch is a compact, template-driven work order referencing the full spec in ROADMAP.md.

## Sections (REQUIRED IN ORDER)

### PROBLEM
[CUSTOMIZE: Describe the problem being solved in 2-3 sentences. Context for why this sprint matters.]

Example: "We have N slow tests blocking rapid iteration. Root cause: integration tests aren't parallelized. This sprint parallelizes them to reduce feedback latency from 12 min to 2 min."

### EVIDENCE
[CUSTOMIZE: What data supports this problem?]

Example: "Current test run: 12 minutes serial. Expected parallel: 2 minutes (6 workers). Measured: baseline."

### HYPOTHESIS
[CUSTOMIZE: What change will fix it? Why?]

Example: "Hypothesis: pytest-xdist with worker=auto will parallelize I/O-bound tests. Tests are currently bottlenecked on database I/O, not CPU."

### EVIDENCE FOR HYPOTHESIS
[CUSTOMIZE: Why do we think this will work?]

Example: "Proof: Ran 3 tests in isolation. Each: 500ms. Run all 3 serial: 1.5s. Run all 3 parallel (2 workers): 800ms. So parallelization works; scale to full suite."

### WHAT
[CUSTOMIZE: Scope. What will be complete. What won't be complete.]

Scope: Parallelize all fast tests (pytest -m "not slow")
In:
- Pytest configuration update
- Test isolation fixes (if needed)
- Measured 2-min baseline

Out:
- Slow test parallelization (separate sprint)
- CI/CD integration (separate sprint)

### WHERE
[CUSTOMIZE: Files to read first.]

Read order:
1. `tests/conftest.py` — shared fixtures (need to parallelize?)
2. `pyproject.toml` — pytest config (where to add xdist)
3. `tests/test_*.py` — sample tests (do they have isolation issues?)

### HOW
[CUSTOMIZE: Agents and sequence.]

Agent roster:
- `specialist-1` (test-runner): Run tests, identify serial bottlenecks
- `specialist-2` (code-reviewer): Audit conftest.py for race conditions
- `specialist-3` (execution-lead): Coordinate changes, verify parallelization

Sequence:
1. Specialist-1: Profile current tests → identify bottlenecks → report
2. (If needed) Specialist-2: Audit conftest → identify isolation issues → report
3. Specialist-3: Update pytest config → fix isolation issues → re-run → verify

### WHEN
[CUSTOMIZE: Wall-clock budget.]

Wall-clock budget: 45 min (30 min execution + 15 min verification)

### DONE WHEN
[CUSTOMIZE: Exact acceptance criteria with commands.]

Acceptance Criteria:
- [ ] `pytest -m "not slow" -q` completes in < 2 min 30 sec
- [ ] All tests pass (0 failures, 0 skips)
- [ ] `pytest -m "not slow" --co -q | wc -l` >= 900 (no tests dropped)
- [ ] Measured on machine X with Y cores
- [ ] Recorded: before/after metrics in CALIBRATION.txt
```

---

## Step 4: Customize Agent Roster

Define your specialist agents and their domains.

**To create:**

```bash
mkdir -p .claude/agents
cp .Workflow/docs/agent-template.md .claude/agents/roster.md
```

**Edit `.claude/agents/roster.md`:**

```markdown
# Agent Roster

[CUSTOMIZE: Define your specialist agents.]

## Standard Agents (Required)

### gog-lead (Orchestration/Coordination)
Model: Opus
Scope: Decompose tasks, dispatch specialists, ensure spec compliance, handle escalations
Input: Sprint dispatch + context + task list
Output: Task completion reports + escalations
Trust: Trusted to make sequencing decisions; escalates on ambiguity

### [CUSTOMIZE: e.g., test-runner]
Model: Haiku
Scope: Execute test suites, report pass/fail, identify failures
Input: Code + test command
Output: Test results, failure analysis
Trust: Trusted to run tests; not trusted to fix code without plan

### [CUSTOMIZE: e.g., code-reviewer]
Model: Sonnet
Scope: Audit code against patterns, detect violations, report
Input: Code + patterns
Output: Violations found with severity and line refs
Trust: Trusted to review; escalates on architectural questions

### [CUSTOMIZE: e.g., calibration-tuner]
Model: Sonnet
Scope: Run measurement, collect KPIs, compare to targets
Input: Code + target ranges + seed
Output: KPI results, recommendations
Trust: Trusted to measure; user decides if results acceptable

## Project-Specific Agents

[CUSTOMIZE: Add agents specific to your tech stack and domain.]

### [e.g., database-migration-specialist]
Model: [Haiku/Sonnet/Opus]
Scope: Design and validate schema changes
Input: [Describe input contract]
Output: [Describe output contract]
Trust: [What can this agent decide? What must escalate?]

[... repeat for other specialists ...]
```

---

## Step 5: Customize Testing and Verification

### 5a. Define Test Tiers

**To create:** Add to `PROJECT_CONSTITUTION.md` under "Article III: Engineering Discipline"

```markdown
## Test Tiers

[CUSTOMIZE: Define what "fast," "medium," "slow" mean in your project.]

| Tier | Markers | What It Tests | Time |
|------|---------|---|---|
| **Fast** | `-m "not slow"` | Unit tests, isolated functions, mocks external deps | ~ 3 min |
| **Medium** | `-m "medium"` | Integration tests (in-process), small datasets | ~ 10 min |
| **Slow** | `--runslow` | End-to-end, live external services, large datasets | ~ 30 min |

**Rule:** After code logic change → run Fast tier. After constant tuning or multi-module change → run Full suite.
```

### 5b. Define Acceptance Criteria

**To create:** Add to `PROJECT_CONSTITUTION.md`

```markdown
## Definition of Done: Code

Before marking a task complete:
- [ ] Code written and reviewed
- [ ] Tests written for new logic
- [ ] Fast test suite passes (`pytest -m "not slow" -q`)
- [ ] Code review checklist passed
- [ ] No test coverage regression (coverage >= baseline)
- [ ] Documentation updated (inline comments, docstrings)
- [ ] Commit message is clear and references issue if applicable

Before merging to main:
- [ ] Feature branch fully tested
- [ ] Full test suite passes (or medium if slow suite too long)
- [ ] Calibration measurements (if applicable)
- [ ] CLAUDE.md and LESSONS_LEARNED updated
- [ ] All reviewer feedback addressed
- [ ] No merge conflicts
```

---

## Step 6: Customize Measurement and Calibration

### 6a. Define Your KPIs

**To create:** New file `CALIBRATION.md` with:

```markdown
# Calibration Specification

[CUSTOMIZE: Define the metrics that prove your code works.]

## Key Performance Indicators (KPIs)

| KPI | Definition | Measurement Command | Target Range | Notes |
|-----|---|---|---|---|
| [CUSTOMIZE: e.g., "Test Pass Rate"] | % of tests passing | `pytest -q \| tail -1` | 95-100% | Should be 100% always |
| [CUSTOMIZE: e.g., "Latency P99"] | 99th percentile latency | `python bench.py \| grep p99` | < 100ms | Production SLA |
| [CUSTOMIZE: e.g., "Error Rate"] | % of requests that error | Load test logs | < 0.1% | Measured in prod |
| [CUSTOMIZE: e.g., "Throughput"] | Requests per second | `wrk -c 100 ...` | >= 1000 | Baseline measured |

## Calibration Tiers

[CUSTOMIZE: When to run which tier.]

| Scope of Change | Tier | Command | Time |
|---|---|---|---|
| Display/docs/data only | None | Skip | 0 min |
| Single-point fix (1 var, ±10%) | Quick | `pytest -m "not slow" -q` | ~3 min |
| Targeted multi-fix (2-3 vars or 1 module) | Quick | `pytest -m "not slow" -q` | ~3 min |
| New mechanics, major changes (3+ vars or 2+ modules) | Full | `pytest -q` + `python bench.py` | ~20 min |

## Success Criteria (Per Tier)

**Tier: None**
- Skip calibration

**Tier: Quick**
- Fast test suite passes (0 failures)
- Any KPIs that could be affected are measured
- Results within tolerance or logged as known deviation

**Tier: Full**
- Full test suite passes (0 failures)
- All KPIs measured
- All KPIs within target range (or escalated)
- Results recorded to git history
```

### 6b. Create Measurement Scripts

**To create:** Scripts that measure your KPIs

```bash
# Example: tests/run-calibration.sh
#!/bin/bash

echo "=== CALIBRATION: QUICK TIER ==="
echo "Running fast tests..."
pytest -m "not slow" -q
FAST_RESULT=$?

if [ $FAST_RESULT -eq 0 ]; then
  echo "✓ Fast tests pass"
  exit 0
else
  echo "✗ Fast tests FAIL (fix code before proceeding)"
  exit 1
fi
```

---

## Step 7: Customize Documentation Standards

### 7a. Define Documentation Layers

**To create:** Add to `PROJECT_CONSTITUTION.md`

```markdown
## Documentation Requirements

[CUSTOMIZE: What docs must exist and be kept in sync?]

| Layer | Purpose | Owner | Update Frequency | Tool |
|-------|---------|-------|---|---|
| CLAUDE.md | Session state (current phase, plan, blockers) | Planning Agent | Every session | Markdown |
| LESSONS_LEARNED.md | Engineering journal (LL-###) | All agents | After non-trivial discovery | Markdown |
| PROJECT_CONSTITUTION.md | Governing principles (immutable) | User | Quarterly or on major decision | Markdown |
| Code Comments | Why non-obvious code exists | Author | At code review | Inline |
| Docstrings | Function contracts (inputs, outputs, exceptions) | Author | At code review | Inline |
| Technical Authority Docs | System architecture, design decisions, rationale | Planning Agent | After major architecture change | Markdown |
| ROADMAP.md | Sprint plan (what, when, acceptance criteria) | Planning Agent | Every sprint | Markdown |
| API Documentation | External interfaces, contracts, versioning | Author | With API changes | Markdown or Swagger |
```

### 7b. Create Entry Template for LESSONS_LEARNED

**To create:** Use the template in `.Workflow/templates/lessons-learned-entry.md`

```markdown
## Entry Format

### LL-### (Lesson Learned Number)

**Date:** YYYY-MM-DD
**Category:** [Bug / Decision / Gotcha / Architecture / Tool / Process]
**Title:** [One-sentence summary]

**What happened:**
[1 paragraph. What did we discover? What surprised us?]

**Why it matters:**
[1 paragraph. What's the implication? How does this affect the project?]

**What we'll do differently:**
[1 paragraph. How will this inform our future decisions?]

**Example:**

### LL-023
**Date:** 2026-03-15
**Category:** Bug
**Title:** Forgetting to parallelize database fixtures causes test suite to stay slow

**What happened:**
We parallelized the test suite and measured 12 min → 2 min. But after one sprint, it was back to 8 min. Root cause: new tests added shared database fixtures without `scope="function"`, so they serialized.

**Why it matters:**
Shared fixtures that don't parallelize silently degrade performance. Without a guard, the problem creeps back in.

**What we'll do differently:**
Add a test rule: "Database fixtures must have `scope='function'` unless explicitly justified in a comment."
```

---

## Step 8: Customize Tools and Infrastructure

### 8a. Define Your Git Workflow

**To create:** Add to `.claude/agents/lead.md` (or separate git-workflow.md)

```markdown
## Git Workflow

[CUSTOMIZE: Your branch naming, commit format, merge strategy.]

### Branch Naming
Feature branches follow: `<sprint>-<scope>`
Examples: `sprint-1-auth`, `hotfix-db-connection`, `refactor-payment-module`

### Commit Messages
Format: `<TYPE>: <DESCRIPTION>`
Types: feat, fix, refactor, test, docs, chore, perf, revert
Example: `feat: add OAuth2 support to authentication module`

### Merge Strategy
- All work on feature branches
- Merge with `--no-ff` to preserve branch history
- Main branch must always pass tests
- PR required (minimum 1 approval) before merge

### Squash vs. Preserve
[CUSTOMIZE: When do you squash commits? When preserve?]
Example: Squash small fix-ups; preserve logical features.
```

### 8b. Define CI/CD Integration Points

**To create:** Add to `PROJECT_CONSTITUTION.md`

```markdown
## CI/CD Checkpoints

[CUSTOMIZE: What automated checks run before merge?]

| Checkpoint | Trigger | Command | Must Pass | Timeout |
|---|---|---|---|---|
| Lint | On push | `pylint src/` | Yes | 5 min |
| Unit Tests | On push | `pytest -m "not slow" -q` | Yes | 10 min |
| Type Check | On push | `mypy src/` | Yes | 3 min |
| Security Scan | On PR | `bandit -r src/` | Yes | 5 min |
| Integration Tests | On PR | `pytest -q` | Yes | 20 min |
| Code Coverage | On PR | `coverage report` | Yes (>80%) | 10 min |
| Performance | Daily | `python bench.py` | No (informational) | 30 min |
```

---

## Step 9: Create Initial Roadmap

**To create:** Create `ROADMAP.md` with your first 3 sprints

```bash
cat > ROADMAP.md << 'EOF'
# Project Roadmap

[CUSTOMIZE: Fill in your sprint plan for the next 3 months.]

## Sprint 1: [Title]
**Duration:** [Date range]
**Goal:** [What should be true at the end of this sprint?]

### Tasks
- [ ] Task 1-A: [Description] (assign to [agent])
- [ ] Task 1-B: [Description] (assign to [agent])
- [ ] Task 1-C: [Description] (assign to [agent])

**Verification:**
- [ ] Test command 1 passes
- [ ] KPI 1 in range
- [ ] Documentation updated

---

## Sprint 2: [Title]
[Repeat structure]

---

## Sprint 3: [Title]
[Repeat structure]
EOF
```

---

## Step 10: Customize Workflow for Your Platform

### Option A: Claude Code CLI with Subagents

**Use if:** You have access to Claude Code CLI and can dispatch multiple agents

**Customizations:**
- `.claude/agents/` contains all agent specs (one per file)
- `gog-lead.md` (or equivalent) is the main orchestrator
- Sprint dispatches are sent to lead agent
- Lead agent spawns specialist agents as needed

### Option B: Single-Model Conversation

**Use if:** You're in a conversational session (browser, API, etc.)

**Customizations:**
- All review loops are inline (no separate agents)
- Skill execution happens serially (not parallel)
- Specialist roles are performed by same model
- Escalations are to human user

**To adapt:** In `session-bootstrap.md`, change:

```markdown
### Available Skills (Conversation Mode)

Each skill contains all review loops inline. Execute serially.
Skills are still mandatory before work.
```

### Option C: Team Workflow with Human Reviewers

**Use if:** You have a human team and want to use this for project management

**Customizations:**
- Agent roles are performed by humans (engineer, code reviewer, QA, etc.)
- Dispatches are tickets or PRs
- Escalations are team discussions
- Measurements are recorded in shared dashboard

---

## [CUSTOMIZE] Markers: Complete Catalog

Search your copied files for `[CUSTOMIZE]`. Here's where they appear:

### In `session-bootstrap.md`
- `[Skill Catalog section]` — replace with your skills

### In `PROJECT_CONSTITUTION.md`
- `[PROJECT_NAME]` (3x) — your project name
- `[CUSTOMIZE: Core Values]` — what your project optimizes for
- `[CUSTOMIZE: Technical Principles]` — architecture patterns
- `[CUSTOMIZE: Engineering Discipline]` — process rules
- `[CUSTOMIZE: Team Roles]` — who does what
- `[CUSTOMIZE: Definition of Done]` — completion criteria
- `[CUSTOMIZE: Test Tiers]` — fast/medium/slow definitions
- `[CUSTOMIZE: Test Coverage]` — required coverage %
- `[CUSTOMIZE: Performance Baselines]` — latency/throughput targets
- `[CUSTOMIZE: Documentation Requirements]` — docs that must exist
- `[CUSTOMIZE: CI/CD Checkpoints]` — automated gates
- `[CUSTOMIZE: External Dependencies]` — third-party tools/services

### In `.claude/CLAUDE.md`
- `[PROJECT_NAME]` — your project name
- `[TECH_STACK]` — languages, frameworks, databases
- `[PHASE]` — current phase (e.g., "MVP")
- `[Current Tasks]` — what's in flight

### In `.claude/agents/lead.md` (or sprint-dispatch-template.md)
- All examples marked with `[CUSTOMIZE: e.g., ...]` — replace with your examples
- Problem domain examples
- KPI examples
- Task scope examples

### In `CALIBRATION.md`
- All KPI rows marked with `[CUSTOMIZE: e.g., ...]`
- All measurement commands (replace with your commands)
- All target ranges (replace with your targets)

### In `skill-catalog.md`
- Each custom skill needs triggers, steps, review loop, escalation, red flags

---

## Pressure Testing Your Customizations

After customization, pressure test your workflow:

### Test 1: Can a New Team Member Adopt It?
- Have someone unfamiliar with the project read `session-bootstrap.md` and try to do work
- Do they get stuck? Where? Fix those places.

### Test 2: Does the Skill Gate Rule Work?
- Describe a random task to yourself
- Does invoking a skill make sense? Is it obvious?
- If not, rewrite the trigger keywords

### Test 3: Do the Success Criteria Actually Work?
- After completing one task, check each success criterion
- Are they measurable? Are they binary (pass/fail)?
- If vague, make them more specific

### Test 4: Can You Escalate Cleanly?
- Simulate getting stuck (make up a blocker)
- Follow the escalation path
- Does it lead to a clear user decision point?
- If not, rewrite the escalation path

---

## Ongoing Maintenance

### Monthly
- Review LESSONS_LEARNED entries (20 most recent)
- Update CLAUDE.md summary
- Check if any skills need refinement

### Quarterly
- Review PROJECT_CONSTITUTION (still true? need updates?)
- Review CALIBRATION.md (targets still realistic? measured correctly?)
- Review agent roster (any new specialists needed?)

### Annually
- Review entire workflow system (still fit for purpose?)
- Archive older LESSONS_LEARNED to separate file (keep recent 50)
- Create new project roadmap for next year

---

## Support and Questions

If you get stuck:

1. **Check the original system:** Read the relevant file in `/path/to/original/.Workflow/`
2. **Check LESSONS_LEARNED:** Similar issues might be documented
3. **Check PROJECT_CONSTITUTION:** The governing principles might clarify
4. **Escalate to user:** If still unclear, ask the user for guidance and record answer in LESSONS_LEARNED
