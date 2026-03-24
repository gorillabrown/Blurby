# Workflow System: AI-Assisted Software Development

## What This Is

This is a **portable, project-agnostic workflow system** designed for AI-assisted software development with human oversight. It enforces a strict division of labor between planning/architecture (human-led or planning agent) and execution (multi-agent orchestrated), builds anti-rationalization guardrails into every phase, and treats measurement as a non-negotiable precondition for every major decision.

The system is extracted from a sophisticated MMA fight engine project that evolved through 78+ sessions, 3 external audits, and 147 documented lessons learned. It proved itself under conditions of:
- High complexity (7 interconnected engine modules, 40+ calibration constants, 84 unique action types)
- Tight coupling (changes ripple across modules in non-obvious ways)
- Stakeholder scrutiny (external audits forced architectural clarity)
- Long development (sessions 1-78, with multiple rollbacks and remediation cycles)

**Philosophy:** Rationalization is the enemy. Developers instinctively skip process steps they believe "don't apply" or "will slow them down." This workflow bakes anti-rationalization defenses into every major phase. Skills are process disciplines that contain guardrails you won't think of in the moment. The workflow forces you to use them.

---

## Core Principles

1. **Separation of Concerns:** Planning, execution, review, and documentation are distinct roles with non-overlapping authority.

2. **Measurement Before Movement:** No tuning without calibration. No claims without evidence. No proceeding without verification.

3. **Anti-Rationalization Defaults:** Every phase has a "red flags" table listing the most common excuses people use to skip safety steps, paired with the reality. The system is designed to prevent "I'll just do it quickly and verify after" from happening.

4. **Review Loops, Not One-Shot Execution:** Every major deliverable (spec, plan, code, calibration results) goes through review. Iterations are expected and budgeted.

5. **Multi-Agent Division of Labor:** Each specialist agent has a narrow scope, strict output rules, and clear escalation protocols. Agents report findings and stop; they do NOT suggest next steps.

6. **Documentation as First-Class Artifact:** LESSONS_LEARNED, project constitution, governing technical references, and sprint dispatch records are not add-ons — they are the audit trail and the institutional memory.

---

## Directory Structure

```
.Workflow/
├── README.md                           # This file
├── session-bootstrap.md                # Injected at session start
├── docs/
│   ├── workflow-map.md                # Full lifecycle flow diagram + phase specs
│   ├── customization-guide.md         # How to adopt for a new project
│   ├── sprint-dispatch-template.md    # CLI Evergreen Template (fillable format)
│   ├── sprint-queue.md                # Conveyor belt of ready-to-dispatch sprints (≥3)
│   ├── agent-template.md              # [CUSTOMIZE] Copy and modify per agent
│   └── skill-catalog.md               # [CUSTOMIZE] Project-specific skill list
├── skills/
│   ├── brainstorming.md               # Design phase
│   ├── planning.md                    # Sprint planning
│   ├── execution.md                   # Task execution (single or multi-agent)
│   ├── workspace-isolation.md         # Branching and environment setup
│   ├── branch-finishing.md            # Tests, calibration, documentation, merge
│   ├── systematic-debugging.md        # Root cause before fix
│   ├── verification.md                # Evidence-based claim validation
│   ├── calibration.md                 # Measurement discipline
│   ├── external-audit.md              # 3rd party review pipeline
│   └── meta-skills.md                 # Skills for modifying the system itself
└── templates/
    ├── project-constitution.md        # [CUSTOMIZE] Governing principles
    ├── lessons-learned-entry.md       # [CUSTOMIZE] LL-### entry format
    └── session-state-template.md      # [CUSTOMIZE] CLAUDE.md starting point
```

---

## Quick Start (Adopt for a New Project)

### Step 1: Copy and Configure (30 min)

```bash
# 1. Copy .Workflow/ directory into your project root
cp -r .Workflow/ /your-project/

# 2. Create project config files
touch /your-project/.claude/CLAUDE.md              # Session state (copy template)
touch /your-project/LESSONS_LEARNED.md            # Engineering journal
touch /your-project/PROJECT_CONSTITUTION.md       # Governing docs

# 3. Customize markers (search for [CUSTOMIZE])
#    - .Workflow/docs/customization-guide.md has full list
#    - Minimum: skill-catalog.md, project-constitution.md, agent roster
```

### Step 2: First Session

1. **Read** `session-bootstrap.md` (5 min)
2. **Read** `workflow-map.md` (10 min)
3. **Review** your project constitution (your governing principles)
4. **Skim** the skill catalog (know what's available)
5. **Start work** using the skill gate rule (before ANY response, check if a skill applies)

### Step 3: Team Handoff

If passing to another team:
- Share the entire `.Workflow/` directory
- Point to your project-specific customizations: CLAUDE.md, PROJECT_CONSTITUTION.md, LESSONS_LEARNED.md
- Include a "Lessons Learned for New Team Members" summary (top 20 entries from LESSONS_LEARNED.md)

---

## Key Concepts

### Skill Gate Rule
**Before ANY response that involves work, check if a skill applies. Even a 30% match → invoke it.**

Skills are not shortcuts. They are process disciplines that contain guardrails you won't think of in the moment. They slow you down by 10-20% but prevent regressions that cost 3-10x more. The most dangerous moment is when you're confident you already know how to do something.

**Skill priority order:**
1. Brainstorming (if designing or exploring)
2. Planning (if breaking down multi-step work)
3. Execution (if implementing)
4. Verification (if claiming something works)
5. Calibration (if tuning constants or claiming improvement)
6. Documentation (if recording decisions or lessons)
7. Debugging (if something is broken)

### Session Bootstrap

Every session starts with injection of:
- The Skill Gate Rule (why it matters, how to apply it)
- Red flags table (common rationalizations)
- Standing rules (what's always true in your project)
- Skill catalog (what's available)

This is stored in `session-bootstrap.md` and injected by the orchestrator agent at the start of each session.

### Sprint Dispatch

When the planning agent has a complete spec, they emit a **sprint dispatch** — a compact, template-driven work order for execution agents.

**Template sections:**
- **WHAT:** Scope (what will be completed, what won't)
- **WHERE:** File reading order (what to understand first)
- **HOW:** Agent roster and sequence (who does what, dependencies)
- **WHEN:** Compute budget (wall clock time)
- **DONE WHEN:** Acceptance criteria (exact verification commands)

Dispatches are **pointers, not payloads**. They reference detailed specs in the roadmap, not inline code.

### External Audit Pipeline

Periodic third-party audits formalize skepticism. The pipeline has 6 steps over 3 interactions:

**Cowork owns:** Packaging (D1), Remediation (D3), Decisions (D5)
**3rd Party owns:** Audit Report (D2), Findings (D4)

After an audit closes, a remediation plan is created, executed in the next sprint, and verified in the following audit. See `skills/external-audit.md`.

### Anti-Rationalization Defenses

Every skill has a "red flags" table. Example from the execution skill:

| What You'll Think | Why It's Wrong | What Actually Happens |
|---|---|---|
| "This test suite is too slow, I'll test manually" | Tests are the only proof you didn't break something else | Manual testing misses 60% of regressions |
| "I'm confident this constant change is safe" | Confidence is not measurement | You discover breakage in production calibration |
| "This file is small, no need for a review" | Small files introduce systemic bugs | The bug ships and consumes 5x the time |

The workflow forces you to read these tables and make a conscious choice to skip the step — not an unconscious one.

---

## Architecture: Cowork + Executor Model

### Cowork (Planning Agent or Human)

**Role:** Architect, designer, reviewer, interpreter

**Does:**
- Brainstorm and refine requirements
- Design architecture and decomposition
- Write detailed specs (exact file paths, exact code, exact verification commands)
- Review agent outputs against spec
- Identify drift, gaps, regressions
- Maintain documentation layers

**Never does:**
- Write or change code (unless explicitly asked by user)
- Suggest next steps (that's the user's role)
- Decide test thresholds (evidence → user decision)

### Executor (Lead Agent or Human)

**Role:** Dispatcher, sequence manager, escalation handler

**Does:**
- Decompose each task into 2-5 minute units
- Dispatch specialists in correct sequence
- Handle escalations (BLOCKED, NEEDS_CONTEXT, DISAGREE_WITH_SPEC)
- Ensure each task meets spec before marking complete
- Parallelize independent work

**Never does:**
- Rewrite specs (escalate to Cowork if spec is ambiguous)
- Skip verification steps (every completed task gets reviewed)
- Suggest architectural changes (that's Cowork's role)

### Specialist Agents

**Role:** Domain experts with narrow scope

**Constraint:** Report findings and stop. Do NOT suggest next steps or propose rewrites.

**Examples:**
- `test-runner`: Execute tests, report pass/fail and metrics
- `calibration-tuner`: Run monte carlo, report KPIs against targets
- `code-reviewer`: Audit code against patterns, report violations
- `debug-investigator`: Root-cause analysis, report findings
- `document-auditor`: Check alignment between code and docs, report gaps

---

## Verification and Review Loops

Every major deliverable (spec, plan, code, calibration, documentation) goes through:

1. **Spec Review:** Does it match requirements? Is it complete? Any ambiguities?
2. **Execution Review:** Does the output match the spec exactly? Any gaps or overreach?
3. **Quality Review:** Code style, test coverage, performance, maintainability?
4. **Integration Review:** Does it work with the rest of the system?

Review loops are **not optional**. They are where the majority of bugs are caught.

---

## Measurement and Calibration

This workflow treats calibration as a non-negotiable gatekeeping mechanism, not a nice-to-have.

**Tiered Calibration Policy:**

| Tier | When | Command | Budget |
|------|------|---------|--------|
| **Full** | New mechanics, major tuning, multi-system changes | `pytest --runslow -q` | ~25 min |
| **Quick** | Single-point fix, energy tweak | `pytest -m "not slow" -q` | ~3 min |
| **None** | Display-only, docs-only, data-only | Skip | 0 min |

After any logic change, run the appropriate tier. If tests fail, fix the code — don't change the tests.

---

## Git Workflow

**Rule 1:** Never commit to main. All work happens on feature branches.

**Rule 2:** Branch per sprint dispatch (e.g., `sprint-5-wave-a`). Don't reuse across dispatches.

**Rule 3:** After merge, main must pass all tests.

**Flow:**
```
checkout main → pull → checkout -b feature → work → tests pass → commit →
push branch → code review → merge --no-ff → push main
```

See `skills/branch-finishing.md` for details.

---

## How to Use This README

1. **New to the project?** Read the Quick Start section, then `session-bootstrap.md`, then `workflow-map.md`.

2. **Starting work?** Check the skill catalog. Does your task match any skill? Invoke it.

3. **Stuck?** Check the relevant skill's escalation protocol. If still stuck, escalate to human oversight.

4. **Designing or planning?** Start with the brainstorming skill, then planning.

5. **Executing?** Use the execution skill. Dispatch agents in sequence. Review before moving on.

6. **Adopting for a new project?** Read `customization-guide.md`. It walks you through every [CUSTOMIZE] marker.

---

## Next Steps

- **For project adoption:** `customization-guide.md`
- **For workflow overview:** `workflow-map.md`
- **For session startup:** `session-bootstrap.md`
- **For specific task:** Check `docs/skill-catalog.md` and invoke the skill
