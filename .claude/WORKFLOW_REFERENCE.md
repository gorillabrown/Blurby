# Workflow Reference

The authoritative process discipline document for the Workflow system. This document defines how work gets planned, dispatched, executed, measured, and governed across every project that adopts the system. It pairs with `AGENT_REFERENCE.md`, which defines who does the work. This document defines how.

**Companion documents:**
- `AGENT_REFERENCE.md` — Agent hierarchy, naming convention, routing decision tree, full roster
- `WORKFLOW_ORIENTATION.md` — First-time project setup procedures and returning-session checklists
- `session-bootstrap.md` — Per-session injection: Skill Gate Rule, red flags, quick checklist

---

## 1. Division of Labor

Work happens across two physically separate surfaces. The boundary is hard — not a guideline, a wall.

### Cowork (Planning Surface)

**Role:** Architect, specifier, reviewer, interpreter.

Cowork is where strategy lives. It brainstorms with the user, designs systems, writes detailed sprint specs, reviews execution output, interprets measurement results, triages findings, and maintains all governance documents. It has full read access to the codebase for context but never modifies it directly.

**Does:**
- Brainstorm and refine requirements with the user
- Design architecture and decomposition strategies
- Write sprint dispatch specs (exact file paths, exact code, exact verification commands)
- Review execution output against spec
- Interpret calibration and measurement results
- Maintain all eight governance documents
- Triage agent findings and escalations

**Never does:**
- Write or modify code (unless the user explicitly overrides)
- Execute tests or calibration harnesses
- Make commits or branch operations
- Decide thresholds unilaterally — evidence goes to the user, user decides
- Dismiss or rewrite specialist findings — escalate disagreements to the user

### CLI (Execution Surface)

**Role:** Orchestrator. Coordinates all execution using the Virtuoso discipline.

CLI is both the entry point for execution AND the orchestrator. On receiving a sprint dispatch, CLI reads the spec, loads the coordination protocol (`zeus.md`), builds a task plan, discovers available agents, and delegates each task to sub-agents via `Agent()`. CLI never implements — it coordinates.

**Why CLI orchestrates directly:** Sub-agents spawned via `Agent()` cannot spawn further sub-agents. A spawned orchestrator would have to do all implementation work directly in its own tool budget (~40 calls), hitting the ceiling at ~55% on non-trivial sprints. CLI has the `Agent()` tool, the largest tool budget, and full filesystem access. Each sub-agent CLI spawns gets its own independent tool budget. This two-layer model (CLI → sub-agents) is the only architecture where delegation works.

**Does:**
- Read the dispatch spec and load `zeus.md` as a behavioral reference (Virtuoso Phase 1)
- Decompose specs into numbered task plans with agent assignments (Virtuoso Phases 2–3)
- Delegate every implementation task to sub-agents via `Agent()` (Virtuoso Phase 4)
- Track progress, reprint the task plan after each completion, narrate status
- Extract results from completed tasks and bridge them to downstream dispatches
- Escalate blockers to Cowork with evidence
- Handle environment setup (branch checkout, dependency install)

**Never does:**
- Write or modify code — all implementation goes to doer agents via `Agent()`
- Read source files to "understand" them — sub-agents read source in their own context
- Run tests directly — dispatch hippocrates
- Update documentation directly — dispatch marcusaurelius
- Absorb a sub-agent's failed task — mark it blocked, report it, get direction
- Rewrite or expand specs — escalate to Cowork
- Skip verification steps
- Merge without passing tests

### The One-Way Flow

Specs flow Cowork → CLI. Results flow CLI → Cowork. Specs never flow in reverse. If CLI discovers a spec flaw during execution, it marks DISAGREE_WITH_SPEC with evidence, and the sprint returns to Cowork for resolution. CLI never rewrites specs unilaterally.

### Parallelization Standing Order

Aggressively parallelize work across Cowork and CLI. While CLI executes Sprint N, Cowork should be speccing Sprint N+1 or reviewing Sprint N-1's output. Dead time on either surface is waste.

---

## 2. Governance Model

Every project is governed by **eight canonical documents**, each with a dedicated lane. Content goes in the right document — crossing lanes is prohibited.

| # | Document | Lane | Updated |
|---|----------|------|---------|
| 1 | `.governance/TECHNICAL_REFERENCE.md` | What the project IS — architecture, data model, features | At phase boundaries |
| 2 | `ROADMAP.md` | What we're building next — sprints, acceptance criteria | Every sprint |
| 3 | `.governance/BUG_REPORT.md` | What's broken — severity, location, resolution status | Continuously |
| 4 | `.governance/LESSONS_LEARNED.md` | What we've discovered — persistent rules, anti-patterns | On non-trivial discoveries |
| 5 | `.governance/IDEAS.md` | What we MIGHT build — unroadmapped concepts | Anytime, reviewed at phase pauses |
| 6 | `CLAUDE.md` | How agents operate — rules, agent table, workflow config | On process changes |
| 7 | `docs/governance/sprint-queue.xlsx` | Next 3 ready-to-dispatch sprint specs (FIFO) | After each sprint completion |
| 8 | `.governance/KNOWN_TRAPS.md` | Active technical land mines — curated danger register | On discovery or resolution |

### Document Distinctions

**LESSONS_LEARNED vs KNOWN_TRAPS:** Lessons are chronological and permanent — an engineering journal. Traps are curated and current — a danger register. A lesson captures "what we learned in Session 47." A trap captures "if you touch module X, check for Y first." Lessons never get deleted. Traps get removed when the underlying danger is eliminated.

**LESSONS_LEARNED vs BUG_REPORT:** Lessons capture insights and decisions. Bugs capture defects. "We learned that frozen dataclass instances capture stale constants" is a lesson. "Score display shows NaN when fighter has no strikes" is a bug.

**ROADMAP vs sprint-queue:** The roadmap is the full plan — all phases, all sprints, all acceptance criteria. The sprint queue is the live dispatch buffer — the next 3 sprints in CLI-ready format (FIFO). Roadmap is strategic; sprint queue is operational.

**IDEAS vs ROADMAP:** Ideas are unroadmapped concepts — things that might be worth building but haven't been evaluated, scoped, or committed to. The roadmap is committed work with acceptance criteria and sprint assignments. An idea becomes a roadmap item only after deliberate promotion (reviewed at phase pauses, scoped, and approved). Anyone can add an idea at any time with no approval. Promoting an idea to the roadmap requires user approval.

### Non-Trivial Discovery Definition

A discovery is non-trivial if forgetting it would change behavior in a future session. If yes, write it down. If unsure, write it down. The cost of a redundant entry is one paragraph. The cost of a forgotten lesson is a repeated failure.

---

## 3. Authority Hierarchy & Amendment Process

### Hierarchy of Authority

When documents conflict, higher-numbered documents yield to lower-numbered ones:

1. **Project Constitution / First Principles** — Supreme authority for "how we work" and "what we model." Immutable axioms live here.
2. **CLAUDE.md** — Current operational config and agent rules.
3. **ROADMAP.md** — Implementation plans and acceptance criteria.
4. **LESSONS_LEARNED.md** — Accumulated wisdom and guardrails.
5. **KNOWN_TRAPS.md** — Active danger register.

**Immutable axioms** are engineering truths that never change regardless of project context. Pike's Rules (Section 10) are immutable. Sprint sizing limits are immutable. Whether a specific constant should be 30 or 45 is a project decision, not an axiom.

### Amendment Process

Governance evolves through a four-step promotion path:

1. **Discovery.** Something surprising happens — a bug, a measurement, a failed approach. Capture it immediately in LESSONS_LEARNED with full context, root cause, and guardrail.

2. **Validation.** The lesson proves useful across multiple sessions. It catches a bug that would have recurred. It prevents a mistake someone was about to make. It gets referenced during planning.

3. **Promotion.** A validated lesson becomes a standing rule. It moves from LESSONS_LEARNED into the appropriate governance document — CLAUDE.md for operational rules, KNOWN_TRAPS for active dangers, TECHNICAL_REFERENCE for architectural decisions, or the project constitution for immutable principles.

4. **Conflict Resolution.** When two rules contradict, the authority hierarchy resolves it. Lower-numbered documents win. The resolution is documented with rationale so the same conflict doesn't recur.

Pike's Rules and engineering axioms are exempt from amendment. They are truths about software engineering, not project decisions.

---

## 4. Sprint Dispatch System

Every piece of work dispatched to CLI follows a standard format. The dispatch is a POINTER, not a PAYLOAD — it references detailed specs in the Roadmap rather than duplicating them.

### Dispatch Format

Every dispatch contains these sections:

| Section | Status | Content |
|---------|--------|---------|
| **KEY CONTEXT** | Required | 2–4 sentences: project state, what just happened, why now |
| **PROBLEM** | Required | What is broken/missing/inadequate — concrete gap with numbers |
| **EVIDENCE OF PROBLEM** | Required | Specific outputs, logs, metrics, file paths, exact values |
| **HYPOTHESIZED SOLUTION** | Required | What we believe will fix it and why; tuning order if multi-variable |
| **EVIDENCE FOR HYPOTHESIS** | Recommended | Prior calibration, sensitivity analysis, lessons learned references |
| **EFFORT** | Required | Default effort level + per-task overrides (see Effort Levels below) |
| **WHAT** | Required | Numbered task table: step, task, agent, model tier, effort override |
| **WHERE** | Required | Ordered file list to read before starting (context first, then implementation) |
| **HOW** | Required | Agent roster with scope and responsibility per agent |
| **WHEN** | Required | Dependency graph: parallel vs sequential, with arrows |
| **OUT OF BOUNDS** | Required | What is explicitly NOT in scope for this dispatch |
| **ADDITIONAL GUIDANCE** | Recommended | Tuning guardrails, timeouts, failure modes, anti-patterns |
| **SUCCESS CRITERIA** | Required | Numbered, testable, objectively verifiable acceptance criteria |

### Sizing Rules

These limits are immutable. They exist because exceeding them causes context degradation, timeout failures, and unrecoverable execution drift.

| Constraint | Limit | Rationale |
|-----------|-------|-----------|
| Tool uses per dispatch | ≤ 40 | Context window fills; agent loses track of plan |
| Wall time per dispatch | ≤ 60 minutes | Timeout risk; diminishing coherence |
| Task granularity | 2–5 minutes each | Larger tasks lose trackability; smaller tasks add dispatch overhead |

### Wave-Splitting

When a sprint exceeds sizing limits, split it into sequential waves:

- **Wave A:** Implement + fast tests (30–45 minutes)
- **Wave B:** Calibrate + docs + merge (30–45 minutes)

Each wave is a separate CLI dispatch. Wave B's KEY CONTEXT references Wave A's results. Quick-calibration sprints (N=200×1, ~3 min) can remain single-dispatch.

### Effort-Based Wave Splitting

If a sprint mixes effort levels significantly (3+ tasks at a different effort tier than the sprint default), split into effort-aligned waves:

- **Wave A:** Low + Medium effort tasks (fast, cheap, mechanical + standard)
- **Wave B:** High + Max effort tasks (slow, expensive, analytical + critical)

This is additive to the sizing-based wave splitting above. A sprint can be split for effort reasons even if it fits within the tool and time budgets. The three splitting criteria are:

1. Tool budget exceeded → split
2. Wall time exceeded → split
3. Effort levels significantly mixed → split

If any criterion triggers, split.

### Effort Levels

Every dispatch declares a default effort level that controls how deeply sub-agents reason on each task. Effort level is a real cost lever — a single task at max effort can consume 10×+ more tokens than the same task at low effort.

| Level | Thinking Budget | Cost Multiplier | When to Use |
|-------|----------------|-----------------|-------------|
| **Low** | Minimal | ~1× | Fully prescribed tasks: typo fixes, renames, config changes, git ops |
| **Medium** | Moderate | ~2–3× | Standard work: feature additions, known bug fixes, writing tests, docs |
| **High** | Substantial | ~5× | Complex work: multi-file refactors, unclear root causes, architecture decisions |
| **Max** | Full available | ~10×+ | Hardest problems: algorithmic design, race conditions, critical code from scratch |

**Effort ↔ Model Tier Defaults:** haiku → low, sonnet → medium, opus → high. Only annotate effort when overriding the default.

**Dispatch header format:**
```
Effort: Medium | Override: tasks #6, #8 → High
```

**Task format with effort override:**
```
□ 6. aristotle: Redesign session cache eviction [opus] {max}
```

Square brackets = model tier. Curly braces = effort override. Omit curly braces when effort matches the model-tier default.

For full guidance on selecting effort levels — decision framework, task type reference table, anti-rationalization — see the `effort-levels` Cowork skill.

### Dispatch Precision Requirements

Every dispatch must include:
- Exact file paths (not "the config file" — the actual path)
- Exact CLI commands with full flag syntax
- Expected runtime per step
- Recommended Bash timeout for long-running commands
- Explicit scope fence: what is IN bounds and what is OUT

Vague dispatches produce vague results. The cost of over-specifying is a few extra lines. The cost of under-specifying is a failed sprint.

---

## 5. Calibration Policy

Calibration is the discipline of measuring whether changes produced the intended effect without breaking anything else. It is a gate, not a suggestion.

### Tiered Framework

| Tier | When | Spec | Duration |
|------|------|------|----------|
| **None** | Display-only, docs-only, data-only, stats-only | Skip | 0 min |
| **Quick** | Single-fix, targeted constant tweak, one logic module | N=200 × 1 seed (project-configurable) | ~3 min |
| **Full** | New mechanics, multi-constant changes, major tuning, multi-system changes | N=1,200 × 3 seeds (project-configurable) | ~25 min |

### Escalation Rule

If a Quick calibration metric moves more than 3 percentage points from baseline, escalate to Full. No exceptions. The 3pp threshold exists because small movements within Quick's smaller sample size could be noise, but 3pp is large enough to be signal.

### Constant Tuning Bounds

Tune constants within a **≤2× range** of their current value. If a constant needs to move more than 2× to achieve the target, the data is wrong — not the constant. Fix the data model, not the tuning parameter.

### Stop When Passing

When calibration passes all acceptance criteria: **stop tuning**. Do not optimize passing metrics. The temptation to "make it even better" is how you break something else. Passing means done.

### Anti-Rationalization

| What You'll Think | Why It's Wrong |
|---|---|
| "I'm 99% sure this constant is right" | Confidence is not data. Calibrate. |
| "Calibration was fine last sprint" | Changes cascade non-linearly. Always measure. |
| "Just one small constant" | Small constants have large leverage. Measure the delta. |
| "We're mid-sprint, can't afford calibration" | You can't afford NOT to. Shipping without measurement accumulates broken constants. |

---

## 6. Agent System

The full agent hierarchy, naming convention, routing decision tree, and individual agent descriptions are in `AGENT_REFERENCE.md`. This section covers only the operational rules that govern how agents interact with the workflow.

### Hierarchy Summary

```
Cowork (Planning Surface)
  └── User (authorizes specs, resolves escalations)

CLI (Execution Surface) — orchestrator, zero implementation
  ├── Aristotle — cross-system, architectural, lead
  ├── Hercules — single-domain, bounded
  ├── Hermes — mechanical, prescriptive
  └── Specialists (Academy, Gymnasium, Stoa)
```

**CLI is the orchestrator.** CLI reads `zeus.md` as a behavioral reference at Phase 1, inheriting the routing decision tree, escalation rules, and coordination protocol. CLI then delegates all implementation to sub-agents via `Agent()`. The boundary is coordination vs implementation — CLI coordinates, sub-agents implement. See §1 (Division of Labor) for the full model.

### Model Tier Selection

| Tier | Cost | Use When |
|------|------|----------|
| Haiku | Lowest | Tests, simple refactors, mechanical fixes, prescriptive changes |
| Sonnet | Mid | Focused analysis, targeted rewrites, domain expertise, calibration |
| Opus | Highest | Cross-system reasoning, architecture decisions, complex debugging |

The routing decision tree in `AGENT_REFERENCE.md` maps every task type to the correct tier. When in doubt, prefer Hercules (sonnet). Only escalate to Aristotle (opus) when the task genuinely crosses module boundaries.

### Agent Behavioral Contracts

**Specialists report findings and stop.** They do not suggest next steps, propose architectural rewrites, or expand scope. Their output is a bounded report with a verdict.

**CLI dispatches one task at a time.** No mega-batches. Each dispatch: narrate → delegate → await result → mark complete/failed → reprint full plan.

**Fresh agent per task.** Context from task A pollutes task B. Each specialist dispatch starts clean.

**Concise dispatch prompts.** Sub-agents have full filesystem access via `Agent()`. CLI's dispatch prompt specifies WHAT to do and WHERE — the sub-agent reads source files in its own context. Pre-reading source files to "write a better prompt" is the first step toward implementing directly.

---

## 7. Escalation & Retry Protocol

### Retry Ceiling

**Three attempts maximum.** If an approach fails three times, it is wrong. Do not retry a fourth time. Escalate:
- Specialist → CLI
- CLI → Cowork
- Cowork → User

Three is the ceiling because: attempt 1 catches obvious errors, attempt 2 catches subtle errors, attempt 3 confirms the approach is fundamentally flawed. Attempt 4+ burns context on a dead end.

### Escalation Signals

| Signal | Meaning | Action |
|--------|---------|--------|
| COMPLETE | Task finished successfully | CLI marks ✓, proceeds to next task |
| FAILED | Task attempted but could not succeed | CLI marks ✗, evaluates retry vs escalation |
| BLOCKED | Cannot proceed without external input | CLI escalates to Cowork with specific question |
| NEEDS_CONTEXT | Missing information to execute | CLI provides context or escalates |
| DISAGREE_WITH_SPEC | Spec asks for something harmful or impossible | CLI evaluates; if substantive, sprint returns to Cowork |

### Substantive Disagreement Definition

A disagreement is substantive when the spec asks for something that would:
- Break a known invariant or standing rule
- Contradict a constitutional/first-principle rule
- Require more than 2× the scoped effort
- Introduce a known trap without mitigation

If CLI agrees the disagreement is substantive, the sprint returns to Cowork for re-spec. If CLI disagrees, execution continues and the disagreement is logged in LESSONS_LEARNED for review.

---

## 8. Execution Discipline (Virtuoso)

Virtuoso is the structural execution framework that governs how CLI orchestrates sprints. It is not an agent — it is a skill that CLI follows. CLI loads `zeus.md` as a behavioral reference at Phase 1 to inherit the routing decision tree and coordination protocol. Full specification is in `.claude/skills/virtuoso/SKILL.md`.

### Six Phases

| Phase | Name | Gate |
|-------|------|------|
| 1 | Load and Understand | All deliverables identified. Ambiguities resolved. |
| 2 | Build the Task Plan | Numbered checklist with agent assignments and model tiers printed. |
| 3 | Discover and Assign Agents | `.claude/agents/` scanned. Routing decision tree applied. Plan reprinted with names. |
| 4 | Execute | Tasks dispatched one at a time. Three-call narration rule enforced. Plan reprinted after each. |
| 5 | Handle Blockers | Failures marked ✗. Plan reprinted. Options proposed. Awaiting direction. |
| 6 | Close Out | Problem → Solution → Final plan → Agent utilization → Performance recommendations → Summary. |

### Critical Rules

**Three-call rule:** Never make 3+ consecutive tool calls without narrating progress. This prevents silent drift.

**Reprint rule:** After every task completion (✓ or ✗), reprint the full task plan with status markers. Never say "see above."

**Anti-batching rule:** One task per dispatch. Never collapse multiple tasks into a single agent call. Each task is individually tracked.

**No absorption rule:** CLI never absorbs a specialist's work into its own execution. If a specialist fails, CLI escalates or re-dispatches — it does not "just do it myself."

---

## 9. Sprint Queue Discipline

### Depth Rule

The sprint queue (`docs/governance/sprint-queue.xlsx`) must contain at least **3 un-dispatched sprints** at all times. If the queue drops below 3 after a sprint completes, planning takes priority over execution. Cowork refills the queue before CLI starts new work.

### FIFO Execution

Sprints execute top-to-bottom. No skipping unless a sprint is explicitly blocked (with documented reason). One sprint in flight at a time — do not pull the next until the current one is complete, verified, and removed from the queue.

### Post-Sprint Sequence

After every sprint completion:
1. MarcusAurelius removes the completed sprint from the queue
2. MarcusAurelius checks queue depth
3. If depth < 3: flag to Cowork for refill before next dispatch
4. If depth ≥ 3: next sprint is ready for dispatch

---

## 10. Engineering Axioms (Pike's Rules)

Five immutable axioms adapted from Rob Pike. These are engineering truths, not project decisions. They cannot be amended.

**E-1: Don't guess the bottleneck. Measure first.**
Before optimizing, profile. Before claiming a fix, show before/after data. Intuition about performance is wrong more often than not. The bug is not where you think it is.

**E-2: Don't tune until you've measured.**
Change one variable at a time. Run calibration after each change. Record the delta. If you can't measure the improvement, don't ship the change.

**E-3: Fancy algorithms are slow when n is small. Keep it simple.**
Linear search beats binary search for n < 100. Simple data structures beat clever ones for small datasets. Ship simple. Optimize only when measured slow.

**E-4: Simple algorithms, simple data structures.**
Data structure choice determines 80% of algorithm behavior. If you're fighting your data structure, change the structure, not the algorithm.

**E-5: Data dominates. Right data structures produce self-evident algorithms.**
Spend 2× effort on data structure design. Spend 0.5× on algorithm cleverness. When the data is right, the algorithm is obvious. Fix data before fixing code.

---

## 11. Anti-Rationalization Architecture

Every skill in the workflow contains a rationalization table. These are the highest-value content in the system — they prevent behavioral drift under pressure.

### Master Red Flags Table

| What You'll Think | Why It's Wrong |
|---|---|
| "This is a simple change, no full process needed" | Simple changes cause the majority of regressions. Guardrails exist for exactly these cases. |
| "I already know how to do this" | Confidence is the enemy of rigor. The skill contains edge cases you haven't seen. |
| "The skill will slow me down" | Skills slow you 10–20% upfront but prevent 3–10× larger regressions. |
| "Doesn't quite fit any skill, I'll make an exception" | 30%+ match = invoke the skill. Exceptions are where bugs hide. |
| "I'll verify after, not during" | Bugs caught during execution cost hours. Bugs caught in production cost days. |
| "User seems impatient, skip the review" | Users prefer correct work over fast broken work. |
| "This test is flaky, disable it" | Flaky tests signal real problems. Fix, don't disable. |
| "No need to calibrate, I'm 99% sure" | Confidence is not data. Calibrate. |
| "Small file, no review needed" | Small files introduce systemic bugs. Both small and large need review. |
| "I'll add docs later" | "Later" never comes. Document now. |
| "We don't need a written constitution" | Written constitutions prevent drift. Without them, standards degrade. |
| "Edge case, probably doesn't matter" | Edge cases are where systemic bugs hide. They always matter. |
| "Calibration passed, let me optimize further" | Stop when passing. Optimizing passing metrics breaks other things. |

---

## 12. Standing Rules

Non-negotiable constraints. These apply to every session, every task, every sprint.

### Code and Constants
- All tunable constants separated from main codebase (constants file, read at startup)
- Every constant must have at least one consumer (verify during review)
- Never capture tunable values in module-level frozen instances (use factory functions)

### Testing
- After any logic change: run tests before proceeding. No exceptions.
- If a test fails: fix the code, not the test (confirm with Cowork first if test seems wrong)
- Flaky tests: fix the underlying problem. Never disable.

### Documentation
- LESSONS_LEARNED: updated immediately on non-trivial discovery
- BUG_REPORT: updated immediately when bug found (don't wait for fix)
- CLAUDE.md: stays under 30k characters. Archive at 25k to `.governance/archive/`.
- TECHNICAL_REFERENCE: source of truth for "what the project IS"
- Respect document lanes — content in the right document

### Git
- Never commit to main. Feature branch per sprint.
- Branch naming: `<sprint>-<wave>` (e.g., `tts-7p-wave-a`)
- Stage specific files, never `git add .` or `git add -A`
- Tests pass before merge
- Merge with `--no-ff` to preserve branch history

### Work Patterns
- Parallelize independent work. Sequence dependent work.
- Two tasks are independent iff they touch zero overlapping files and neither reads the other's output. Any file overlap → sequential.
- Use cheaper models for mechanical tasks, opus only for cross-system reasoning.
- Three failed fixes → question the approach. Escalate.

---

## 13. Known Traps Template

Every project maintains a curated danger register at `.governance/KNOWN_TRAPS.md`. Unlike LESSONS_LEARNED (chronological, permanent), this document is actively maintained — traps are added on discovery and removed when the underlying danger is eliminated.

### Format

```markdown
# Known Traps

> Active technical land mines. Check this before touching any area listed below.
> Remove entries when the underlying danger is eliminated (with dated note).

| # | Trap | Area | Mitigation | Root Cause |
|---|------|------|------------|------------|
| T-001 | [What goes wrong] | [Module/file/area] | [How to avoid it] | [Why it happens] |
```

### Review Cadence

Agents review KNOWN_TRAPS at session start if the session touches areas listed in the register. CLI checks the register during Phase 3 (Discover and Assign) to flag any tasks that intersect with known traps.

---

## 14. Quality Review Severity

When review agents (Plato, Solon) report findings, they classify by severity:

| Severity | Definition | Action |
|----------|-----------|--------|
| **Blocker** | Would fail tests OR violate a constitutional/first-principle rule | Must fix before sprint can complete |
| **Warning** | Code smell, style violation, or non-idiomatic pattern | Fix in current sprint if time permits; otherwise log for next sprint |
| **Info** | Suggestion for future improvement | Log in IDEAS.md or ignore |

---

## 15. CLAUDE.md Archival Protocol

CLAUDE.md is the operational config — it must stay lean so agents can load it quickly.

- **Archive trigger:** 25k characters
- **Archive target:** < 20k characters post-archive
- **Archive destination:** `.governance/archive/CLAUDE_md_session_NNN.md`
- **What to archive:** Completed sprint details, resolved phase status, historical baselines
- **What to keep:** Current state, active rules, forward plan, agent table, governing doc references

---

## 16. 3rd Party Audit Process

External audits provide independent, evidence-based assessment of a project's codebase, roadmap, and architecture. Audits are conducted by **legitimate independent 3rd-party auditors** — separate AI instances with no access to the project's conversation history, prior decisions, or internal context. They receive only the audit package and orientation brief and evaluate the project on its own merits.

**Owner:** Cowork (architect role)
**Trigger:** User says "3rd Party Audit" or audit is required at phase close
**Location:** Project-specific audit folder (e.g., `Outside Audits/` or as defined in project structure)

### Folder Structure & Naming Convention

```
[Audit Folder]/
   3rd_Party_Audit_Procedure.md          ← Procedure reference (permanent)
   OutsideAudit.1.YYYY-MM-DD/            ← First audit package
   OutsideAudit.N.YYYY-MM-DD/            ← Nth audit package
```

**Naming convention:** `OutsideAudit.[sequential #].[date of package creation]`

Each audit folder accumulates deliverables through the lifecycle:

| File | Deliverable | Created By | Step |
|------|-------------|------------|------|
| `AuditOrientation.N.Date.docx` | D1a — Auditor orientation brief | Cowork | 1 |
| `AuditPackage.N.Date.BatchM.zip` | D1b — Zipped project files | Cowork | 1 |
| `AuditReport.N.Date.md` | D2 — 3rd party audit report | 3rd Party | 3 |
| `AuditRemediationPlan.N.Date.md` | D3 — Response to audit findings | Cowork + User | 4 |
| `AuditReviewResponse.N.Date.md` | D4 — Auditor response to remediation | 3rd Party | 5 |
| `AuditDecisions.N.Date.md` | D5 — Final decisions + doc updates | Cowork + User | 6 |

### Audit Pipeline (6 Steps, 5 Deliverables)

**Step 1 — Package Creation (Cowork).** Confirm audit scope with user. Generate the AuditOrientation document (D1a): executive summary, build status, architecture overview, file manifest with tier classification, forward plan. Assemble audit package zip(s) (D1b) under 35 MB per zip. If materials exceed 35 MB, split into logically separated batches by tier.

**Step 2 — Handoff to Auditor (User).** User delivers all batch zips + orientation to the 3rd-party auditor along with the audit prompt. The prompt instructs the auditor to perform a full evidence-based vetting of the project against the actual codebase.

**Step 3 — Audit Report (3rd Party).** The auditor produces a comprehensive report: executive verdict, codebase reality check, roadmap item-by-item audit, major contradictions, sequencing analysis, structural/modeling review, testing review, top risks, missing work, proposed revised roadmap, and scored assessment (1–10) across 8 dimensions.

**Step 4 — Remediation Plan (Cowork + User).** For every major finding, assign a disposition: Accept, Accept with narrowing, Defer, or Reject. Produce a remediation plan with: management summary, audit feedback response matrix, exact roadmap rewrite actions, grouped implementation packages, blocking decisions, testing/validation plan, corrected execution order, and final decision-ready conclusion.

**Step 5 — Auditor Review of Response (3rd Party).** User sends the remediation plan back to the auditor. The auditor provides line-by-line responses with disposition: Accept, Accept with narrowing, Defer, Reject, Convert to documentation-only correction, or Convert to later-phase calibration task.

**Step 6 — Final Decisions & Implementation (Cowork + User).** Treat the audit loop as closed. Update the project roadmap with all accepted changes. Update all affected governance documents. Produce AuditDecisions summarizing: all roadmap changes, deferred items with placement, rejected items with rationale, and new lessons-learned entries.

### Audit Package Scoping

Organize materials into tiers for batching:

| Tier | Contents | Inclusion Rule |
|------|----------|---------------|
| **Tier 1 — Core** | Main codebase, test suites, databases, roadmap, algorithm specs, CLAUDE.md | Always included |
| **Tier 2 — Supporting** | Design specs, lessons learned, findings, frameworks, calibration data | Include when relevant to audit scope |
| **Tier 3 — Reference** | Workbooks, data files, onboarding docs, prior audit history | Include for full-scope audits |

**Batching rules:** Try single batch first. Split by tier if over 35 MB. Sub-split if a single tier exceeds 35 MB. AuditOrientation always goes in Batch 1. Label all batches in the orientation document.

**Exclusion rules:** Never include `.git/`, `__pycache__/`, `.pytest_cache/`, `node_modules/`, API keys, meta-archives, or desktop metadata files.

### Review Dimensions (Scoring Rubric)

The auditor scores the project 1–10 on each dimension:

1. Grounding in current codebase
2. Architectural coherence
3. Correct sequencing
4. Modeling soundness
5. Extensibility
6. Testability
7. Delivery practicality
8. Overall confidence

### Disposition System

| Disposition | Meaning |
|------------|---------|
| **Accept** | Implement as recommended |
| **Accept with narrowing** | Implement with reduced scope |
| **Defer** | Valid but not now — place in roadmap at correct position |
| **Reject** | Disagree with evidence or reasoning — explain why |

### Cowork Execution Checklist

When "3rd Party Audit" is triggered, Cowork follows this sequence:

1. Confirm scope with user (phases covered, full vs. targeted)
2. Determine audit number (check last `OutsideAudit.N.*` folder)
3. Create `OutsideAudit.N+1.YYYY-MM-DD/` folder
4. Generate AuditOrientation document (D1a)
5. Assemble and zip audit package under 35 MB (D1b)
6. Provide user with audit prompt for the auditor
7. **WAIT** — User delivers to auditor and returns with D2
8. Save audit report (D2)
9. Execute remediation plan (D3)
10. **WAIT** — User delivers D3 to auditor and returns with D4
11. Save auditor review response (D4)
12. Execute final decisions, update all docs (D5)
13. Update CLAUDE.md, add lessons-learned entry, print roadmap change summary

**Note:** Auditor prompts are project-specific and should be maintained in the project's audit procedure document. The prompts instruct the auditor on project context, review dimensions, and expected output format. See the project's `3rd_Party_Audit_Procedure.md` for ready-to-use prompt templates.

---

## Document Relationship Map

```
WORKFLOW_REFERENCE.md (this file)
  ├── Defines: HOW work gets done
  ├── References: AGENT_REFERENCE.md (WHO does the work)
  ├── Supersedes scattered guidance in:
  │     ├── session-bootstrap.md (Standing Rules, Division of Labor)
  │     ├── sprint-dispatch-template.md (Sizing, Precision, Scope Fences)
  │     └── WORKFLOW_ORIENTATION.md (Calibration, Git, Testing rules)
  └── Consumed by:
        ├── Cowork — for planning, speccing, reviewing
        ├── CLI — for execution discipline (loads zeus.md as coordination protocol)
        └── All agents — for standing rules and escalation protocol
```

**Note on existing documents:** `WORKFLOW_ORIENTATION.md` remains the setup and onboarding document (how to adopt the workflow for a new project). `session-bootstrap.md` remains the per-session injection (Skill Gate Rule, quick checklist, red flags). This document (`WORKFLOW_REFERENCE.md`) is the authoritative reference that both of those point to for detailed rules. Where they overlap, this document wins.

---

*This document is project-agnostic and permanent. Project-specific rules belong in the project's governing documents (CLAUDE.md, .governance/TECHNICAL_REFERENCE.md, etc.), not here. Amendment to this document follows the same four-step process: discover → validate → promote → resolve conflicts.*
