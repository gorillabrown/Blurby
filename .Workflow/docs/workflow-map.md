# Workflow Map: Full Lifecycle Flow Diagram and Phase Specifications

This document maps the complete AI-assisted software development lifecycle from session start through external audit. Each phase specifies:
- Hard gates (what MUST happen before proceeding)
- Review loops with iteration limits
- Escalation paths
- Which agents are involved
- Success criteria

---

## Session Lifecycle (High-Level Flow)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SESSION START                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Inject session-bootstrap.md into context                                 │
│ 2. Load CLAUDE.md (session state)                                           │
│ 3. Load PROJECT_CONSTITUTION (governing principles)                         │
│ 4. Load LESSONS_LEARNED (institutional memory)                              │
│ 5. Skim skill catalog (know what's available)                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ USER REQUEST RECEIVED                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ Parse request: What does the user want?                                     │
│ • Feature? Bug fix? Measurement? Audit? Documentation?                      │
│ • Scale? Single file? Multi-file? Multi-agent?                              │
│ • Urgency? Deadline? Dependencies?                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ SKILL GATE CHECK                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ For each skill in catalog:                                                  │
│   • Check trigger keywords (30%+ match → invoke)                            │
│   • Check scope against project domain                                      │
│ If multiple skills match → follow priority order (brainstorm → plan →       │
│ execute → verify → calibrate → document)                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                   ↓
        ┌────────────────────────────────────────────────────────────┐
        │ Route to appropriate phase based on skill invoked           │
        └────────────────────────────────────────────────────────────┘
        │
        ├──→ Design Phase (if brainstorming skill invoked)
        ├──→ Planning Phase (if planning skill invoked)
        ├──→ Execution Phase (if execution skill invoked)
        ├──→ Verification Phase (if verification skill invoked)
        ├──→ Calibration Phase (if calibration skill invoked)
        └──→ Documentation Phase (if documentation skill invoked)
        │
        └──→ [After skill completes]
                                   ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ USER DECISION POINT                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ If multiple phases still needed: Loop back to SKILL GATE CHECK              │
│ If session complete: → Finalize and Archive                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ FINALIZE AND ARCHIVE                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Update CLAUDE.md with session summary                                     │
│ • Create LESSONS_LEARNED entries for non-trivial discoveries                │
│ • Commit or push branch if work was code/spec                               │
│ • Close any open escalations                                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ SESSION END                                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase Details

### Phase 1: Design Phase (Brainstorming Skill)

**When to invoke:** User is designing, exploring, or deciding between approaches.

**Duration:** 15-30 min

**Agents involved:** Planning agent (you)

**Steps:**

```
┌─ DESIGN PHASE ─────────────────────────────────────────────────────────┐
│                                                                         │
│ 1. EXPLORE PROJECT CONTEXT (READ-ONLY)                                 │
│    ├─ Read PROJECT_CONSTITUTION (what matters here?)                   │
│    ├─ Read LESSONS_LEARNED (what have we learned?)                     │
│    ├─ Read CLAUDE.md current state (where are we now?)                 │
│    ├─ Skim relevant technical authorities (API specs, architecture)    │
│    └─ Identify constraints (time, scope, dependencies)                 │
│                                                                         │
│ 2. CLARIFYING QUESTIONS                                                │
│    ├─ Ask one question at a time (give user multiple-choice where)     │
│    ├─ Record answers in working notes                                  │
│    └─ Stop when you have clarity on: what, why, who, scope, risks      │
│                                                                         │
│ 3. EXPLORATION: 2-3 APPROACHES                                         │
│    ├─ Describe Approach A (trade-offs, pros, cons, time estimate)      │
│    ├─ Describe Approach B (alternative with different trade-offs)      │
│    ├─ Describe Approach C (optional third perspective)                 │
│    ├─ State your recommendation with reasoning                         │
│    └─ Ask user: "Which direction should we go?"                        │
│                                                                         │
│ 4. DESIGN DOCUMENT (ITERATIVE APPROVAL)                                │
│    ├─ Section 1: Problem statement and requirements                    │
│    │   [Review: "Does this capture the requirement?" → iterate]        │
│    │                                                                   │
│    ├─ Section 2: Architecture and decomposition                        │
│    │   [Review: "Is the structure sound?" → iterate]                   │
│    │                                                                   │
│    ├─ Section 3: API/interfaces and contracts                          │
│    │   [Review: "Are these interfaces clean?" → iterate]               │
│    │                                                                   │
│    ├─ Section 4: Data structures and state management                  │
│    │   [Review: "Is data structure right?" → iterate]                  │
│    │                                                                   │
│    ├─ Section 5: Known risks and mitigations                           │
│    │   [Review: "Have we covered the risks?" → iterate]                │
│    │                                                                   │
│    └─ Section 6: Verification and success criteria                     │
│        [Review: "How will we know it works?" → iterate]                │
│                                                                         │
│ 5. DESIGN SIGN-OFF                                                     │
│    └─ User approves design in full                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Hard gates before proceeding to Planning Phase:**
- Design document has been reviewed section-by-section
- User has approved the overall direction
- Risks have been identified and mitigations proposed
- Scope is clear ("what's in" vs "what's out")

**Review loop iteration limit:** Max 3 rounds per section. If can't reach agreement, escalate to user with "I need a decision: which approach?"

**Escalation paths:**
- **Blocked by unclear requirement:** Ask the user a more specific question (multiple-choice preferred)
- **Blocked by missing technical context:** Read another reference document or ask user
- **Blocked by conflicting constraints:** List the conflicts explicitly and ask user which takes priority

**Quality checks:**
- [ ] Every assumption is explicit (not buried in prose)
- [ ] Every trade-off is named (no hidden costs)
- [ ] Recommendation is clear and justified
- [ ] Risks are realistic, not hypothetical

---

### Phase 2: Planning Phase (Planning Skill)

**When to invoke:** Design is approved and you need to break it into executable tasks.

**Duration:** 20-40 min

**Agents involved:** Planning agent (you), execution lead (who will run tasks)

**Steps:**

```
┌─ PLANNING PHASE ───────────────────────────────────────────────────────┐
│                                                                         │
│ 1. FILE STRUCTURE MAP                                                  │
│    ├─ List exact files to create (with paths)                          │
│    ├─ List exact files to modify (with line ranges if possible)        │
│    ├─ List exact files to delete (with justification)                  │
│    └─ Verify: No file touched twice in different ways                  │
│                                                                         │
│ 2. DECOMPOSITION INTO BITE-SIZED TASKS                                 │
│    ├─ Each task: 2-5 minutes of focused work                           │
│    ├─ Tasks ordered: Dependencies first                                │
│    ├─ No task depends on more than 1 prior task                        │
│    ├─ Parallelizable tasks identified (can run in parallel)            │
│    └─ Risk areas identified (hard stuff, novel algorithms, integrations)
│                                                                         │
│ 3. TASK SPECIFICATION (PER TASK)                                       │
│    ├─ Task ID (e.g., T-01, T-02, ...)                                  │
│    ├─ Description (one sentence)                                       │
│    ├─ Input state (what exists before this task)                       │
│    ├─ Exact steps (not vague prose, exact code/actions)                │
│    ├─ Files affected (exact paths, exact lines)                        │
│    ├─ Output (what will exist after; what will be tested)              │
│    ├─ Verification command (exact command to verify completion)        │
│    └─ Dependencies (which task(s) must complete first)                 │
│                                                                         │
│ 4. FULL CODE PREVIEW (WHERE APPLICABLE)                                │
│    ├─ Write out the exact code you expect to see                       │
│    ├─ Show exact file paths, exact line numbers                        │
│    ├─ Include context (imports, class definitions, etc.)               │
│    └─ This is NOT what you'll implement; it's what you'll verify       │
│                                                                         │
│ 5. VERIFICATION STRATEGY                                               │
│    ├─ How will tests verify each task?                                 │
│    ├─ Are any tests new or modified?                                   │
│    ├─ Run order (tests that must pass in sequence)                     │
│    ├─ Acceptance criteria (what "done" looks like)                     │
│    └─ Calibration requirements (if applicable, which tier?)            │
│                                                                         │
│ 6. PLAN REVIEW (LOOP WITH USER)                                        │
│    ├─ User reviews file structure → approve or iterate                 │
│    ├─ User reviews task list → approve or iterate                      │
│    ├─ User reviews verification strategy → approve or iterate          │
│    └─ When all approved: create sprint dispatch                        │
│                                                                         │
│ 7. SPRINT DISPATCH GENERATION                                          │
│    ├─ Template from `.claude/agents/lead.md` (or equivalent)           │
│    ├─ Sections: PROBLEM, EVIDENCE, HYPOTHESIS, WHAT, WHERE, HOW,       │
│    │            WHEN, DONE WHEN                                        │
│    ├─ Review dispatch for completeness                                 │
│    └─ Hand off to execution agent(s)                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Hard gates before proceeding to Execution Phase:**
- File structure is clear and non-overlapping
- Tasks are bite-sized (2-5 min each)
- Dependencies are explicit and acyclic
- Verification commands are exact and reproducible
- User has approved the plan in full
- Sprint dispatch is ready

**Review loop iteration limit:** Max 2 rounds total. If can't reach agreement after 2 iterations, escalate: "Here are the constraints. Which should we relax?"

**Escalation paths:**
- **Blocked by ambiguous task boundaries:** Break the task into even smaller pieces
- **Blocked by circular dependencies:** Reorder or split tasks differently
- **Blocked by unclear verification:** Write the verification command first, then define the task

**Quality checks:**
- [ ] Each task is <= 5 minutes of work
- [ ] Each task has one clear output
- [ ] Dependencies form a DAG (directed acyclic graph)
- [ ] Verification is testable and measurable
- [ ] Parallelizable tasks are identified
- [ ] Sprint dispatch references the plan, doesn't duplicate it

---

### Phase 3: Execution Phase (Execution Skill)

**When to invoke:** Plan is approved and you're ready to execute.

**Duration:** Varies (short tasks: 5 min, complex: hours)

**Agents involved:** Lead orchestrator, specialist agents (test-runner, code-reviewer, debug-investigator, etc.)

**Two execution paths:** Choose based on scope.

#### Path A: Multi-Agent Orchestrated (Recommended for Complex Work)

```
┌─ EXECUTION (MULTI-AGENT) ──────────────────────────────────────────────┐
│                                                                         │
│ FOR EACH TASK IN SEQUENCE (or parallel groups):                        │
│                                                                         │
│   Step 1: PRE-EXECUTION CHECK                                          │
│   ├─ Verify task preconditions are met                                 │
│   ├─ Verify no unexpected file state (no uncommitted changes)          │
│   └─ If preconditions fail: escalate to planner                        │
│                                                                         │
│   Step 2: DISPATCH SPECIALIST AGENT                                    │
│   ├─ Send full context (not file references)                           │
│   ├─ Send task spec with steps, inputs, outputs, verification          │
│   ├─ Set wall-clock budget (e.g., 10 min for a 5-min task)             │
│   └─ Specialist executes and reports findings                          │
│                                                                         │
│   Step 3: HANDLE ESCALATIONS                                           │
│   ├─ If BLOCKED: → ask for clarification → escalate if still stuck     │
│   ├─ If NEEDS_CONTEXT: → provide missing info → re-dispatch            │
│   ├─ If DISAGREE_WITH_SPEC: → evaluate disagreement → escalate to      │
│   │                             planner if substantive                  │
│   └─ If no escalation: proceed to Step 4                               │
│                                                                         │
│   Step 4: DISPATCH SPEC-COMPLIANCE REVIEWER                            │
│   ├─ Reviewer checks: "Does this match the spec exactly?"              │
│   ├─ Allowed checks: File contents, test results, execution logs       │
│   ├─ If COMPLIANT: → proceed to Step 5                                 │
│   ├─ If DRIFT: → (1) note the drift, (2) ask specialist to fix,        │
│   │           (3) re-review, (4) escalate if > 2 fix iterations        │
│   └─ If NON-COMPLIANT: → escalate to planner                           │
│                                                                         │
│   Step 5: DISPATCH QUALITY REVIEWER                                    │
│   ├─ Reviewer checks: Code style, test coverage, perf, maintainability │
│   ├─ Severity levels: blocker (fix now), warning (note), info (ok)     │
│   ├─ If APPROVED: → proceed to Step 6                                  │
│   ├─ If ISSUES FOUND:                                                  │
│   │   • Blockers: → dispatch specialist to fix → re-review              │
│   │   • Warnings: → note and proceed                                   │
│   └─ If > 2 fix iterations for blocker: escalate to planner            │
│                                                                         │
│   Step 6: MARK TASK COMPLETE                                           │
│   ├─ Record: timestamp, specialist, reviewer sign-off, output summary  │
│   ├─ Commit (if code): exact message, exact files staged                │
│   └─ Move to next task                                                 │
│                                                                         │
│ AFTER ALL TASKS COMPLETE:                                              │
│                                                                         │
│   Step 7: FULL-SCOPE REVIEW                                            │
│   ├─ Reviewer checks integration: does it all work together?           │
│   ├─ Reviewer runs full test suite                                     │
│   ├─ If tests pass: → complete                                         │
│   ├─ If tests fail:                                                    │
│   │   • Debug why (which task caused breakage?)                        │
│   │   • If clear fix: dispatch specialist → fix → re-test              │
│   │   • If unclear: escalate to planner for architectural review       │
│   └─ On pass: proceed to Finishing Phase                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Path B: Inline Execution (For Simple/Solo Work)

```
┌─ EXECUTION (INLINE) ───────────────────────────────────────────────────┐
│                                                                         │
│ FOR EACH TASK:                                                         │
│   1. Read task spec                                                    │
│   2. Execute steps exactly as written                                  │
│   3. Verify output matches spec                                        │
│   4. Run verification command                                          │
│   5. If verification fails → debug → fix → re-verify                   │
│   6. Commit (if code)                                                  │
│                                                                         │
│ AFTER N TASKS (CHECKPOINT):                                            │
│   1. Run full test suite                                               │
│   2. If pass → continue to next batch                                  │
│   3. If fail → investigate which task broke it                         │
│                                                                         │
│ AFTER ALL TASKS:                                                       │
│   1. Run full test suite again                                         │
│   2. If pass → proceed to Finishing Phase                              │
│   3. If fail → escalate for architectural review                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Hard gates before proceeding to Finishing Phase:**
- All tasks marked complete
- Full test suite passes (appropriate tier)
- No uncommitted code changes
- No escalations open

**Escalation paths:**
- **Task marked BLOCKED:** Collect all context and escalate to planner with "what do I do?"
- **Test failures after task:** Run debugging skill; if root cause unclear, escalate to planner
- **Disagreement with spec:** Escalate to planner with "specialist says the spec is wrong because..."
- **> 2 fix iterations on one task:** Escalate to planner with "the task might be mis-specified"

**Cross-Cutting Disciplines (Always Active During Execution):**

1. **TDD (Red-Green-Refactor)**
   - RED: Write failing test for the feature
   - GREEN: Write minimal code to make it pass
   - REFACTOR: Clean up code while test still passes
   - Repeat for each task

2. **Systematic Debugging (If Tests Fail)**
   - Invoke debugging skill
   - Root cause before fix
   - Test case that reproduces the bug
   - Fix the root cause, not the symptom
   - Verify fix doesn't break other tests

3. **Verification Before Completion**
   - Never claim "done" without evidence
   - Run the verification command for this task
   - Run the full test suite for integration
   - Only then mark complete

4. **Calibration (If Logic Changes)**
   - After logic change, run calibration
   - Record before/after metrics
   - If not within tolerance, either fix code or escalate
   - Never ignore calibration results

---

### Phase 4: Verification Phase (Verification Skill)

**When to invoke:** You're claiming something works and need evidence.

**Duration:** 10-20 min

**Agents involved:** Verification agent (domain expert)

**Steps:**

```
┌─ VERIFICATION PHASE ───────────────────────────────────────────────────┐
│                                                                         │
│ 1. CLAIM SPECIFICATION                                                 │
│    ├─ What are you claiming? (e.g., "this fixes the regression")       │
│    ├─ Why are you claiming it? (gut feel, intuition, reasoning)        │
│    └─ What evidence would prove it false? (falsifiability)             │
│                                                                         │
│ 2. EVIDENCE GATHERING                                                  │
│    ├─ Test results (pass/fail, before/after metrics)                   │
│    ├─ Calibration results (KPIs within tolerance?)                     │
│    ├─ Code inspection (does it do what we think?)                      │
│    ├─ Scenario testing (does it handle edge cases?)                    │
│    └─ Integration testing (does it work with the rest?)                │
│                                                                         │
│ 3. EVIDENCE EVALUATION                                                 │
│    ├─ For each piece of evidence: Does it support or refute claim?     │
│    ├─ Is the evidence complete? (any gaps?)                            │
│    ├─ Is the evidence reliable? (test flaky? measurement noisy?)       │
│    └─ Is the evidence sufficient? (one test? multiple tests?)          │
│                                                                         │
│ 4. VERDICT                                                             │
│    ├─ APPROVED: Evidence supports claim. Safe to proceed.              │
│    ├─ CONDITIONAL: Evidence partially supports claim. Proceed with     │
│    │               these caveats (list them).                          │
│    ├─ REJECTED: Evidence contradicts claim. Fix the code/claim.        │
│    └─ INSUFFICIENT: Need more evidence. Run these additional tests.    │
│                                                                         │
│ 5. DOCUMENTATION                                                       │
│    ├─ Record the claim, evidence, and verdict                          │
│    ├─ If rejected, record why and what to fix                          │
│    └─ If approved, proceed to next phase                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Hard gates before proceeding:**
- Claim is specific (not vague)
- Evidence is complete (no gaps)
- Verdict is clear (approved, conditional, or rejected)

**Escalation paths:**
- **Claim is unfalsifiable:** Rephrase the claim to be testable
- **Evidence is missing:** Run the test or measurement to gather it
- **Evidence contradicts claim:** Either fix the code or adjust the claim

---

### Phase 5: Calibration Phase (Calibration Skill)

**When to invoke:** You've changed logic or constants and need to measure impact.

**Duration:** 3-30 min (depending on tier)

**Agents involved:** Calibration agent (Sonnet or Opus)

**Steps:**

```
┌─ CALIBRATION PHASE ────────────────────────────────────────────────────┐
│                                                                         │
│ 1. SCOPE DETERMINATION                                                 │
│    ├─ What changed? (logic? constants? both?)                          │
│    ├─ How significant? (10% tweak? major rework?)                      │
│    ├─ Affects what? (single module? multi-module? system-wide?)        │
│    └─ → Determine calibration tier                                     │
│                                                                         │
│ 2. TIER-BASED CALIBRATION                                              │
│                                                                         │
│    TIER: NONE (Display/docs/data-only)                                 │
│    └─ Skip calibration. Proceed to next phase.                         │
│                                                                         │
│    TIER: QUICK (Single-point fix, 2-3 constants, one module)           │
│    ├─ Run: pytest -m "not slow" -q (~3 min)                            │
│    ├─ Check: Fast tests pass?                                          │
│    ├─ If yes → Proceed to comparison                                   │
│    └─ If no → Fix code → Re-run until pass                             │
│                                                                         │
│    TIER: FULL (New mechanics, major tuning, multi-system)              │
│    ├─ Run: pytest --runslow -q (~25 min)                               │
│    ├─ Check: All tests pass?                                           │
│    ├─ If yes → Proceed to KPI measurement                              │
│    └─ If no → Fix code → Re-run until pass                             │
│                                                                         │
│ 3. KPI MEASUREMENT (TIER: QUICK OR FULL)                               │
│    ├─ Run: benchmark suite (e.g., `python benchmark_suite.py`)         │
│    ├─ Collect: KPI results (decision%, KO%, TKO%, etc.)                │
│    ├─ Format: Before / After / Target / Status                         │
│    └─ Report: Which KPIs are in/out of tolerance?                      │
│                                                                         │
│ 4. DECISION GATE                                                       │
│    ├─ All KPIs within tolerance → PASS → Proceed to next phase         │
│    ├─ Some KPIs out of tolerance →                                     │
│    │   • WARN: Proceed but flag as concern                             │
│    │   • FAIL: Don't proceed. Fix code or adjust target.                │
│    └─ Uncertain → Escalate to planner: "Is this acceptable?"            │
│                                                                         │
│ 5. DOCUMENTATION                                                       │
│    ├─ Record: Tier, command, date, seed, KPI results                   │
│    ├─ Record: Decisions made (pass/warn/fail)                          │
│    ├─ Record: If fail, what was tried and why                          │
│    └─ Archive: Benchmark JSON to git (for history)                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Hard gates before proceeding:**
- Calibration tier chosen
- Tests pass (appropriate tier)
- KPIs measured
- Decision recorded (pass/warn/fail)

**Escalation paths:**
- **Tests fail in calibration:** Fix the code that broke them; don't adjust tests
- **KPIs miss targets:** Either adjust the constants to hit targets, or escalate to user with "should we relax this target?"
- **Uncertain about results:** Ask the planner "is this within acceptable variance?"

---

### Phase 6: Finishing Phase (Branch Finishing Skill)

**When to invoke:** All execution done, ready to merge or clean up.

**Duration:** 10-30 min

**Agents involved:** Finishing agent, verification agent

**Steps:**

```
┌─ FINISHING PHASE ──────────────────────────────────────────────────────┐
│                                                                         │
│ 1. FINAL VERIFICATION                                                  │
│    ├─ Run full test suite (appropriate tier)                           │
│    ├─ If tests pass → proceed to Step 2                                │
│    ├─ If tests fail → investigate → fix → re-run                       │
│    └─ Must have 0 test failures to proceed                             │
│                                                                         │
│ 2. CALIBRATION CHECK (IF APPLICABLE)                                   │
│    ├─ Did logic change? → Run full calibration                         │
│    ├─ Did constants change? → Run full calibration                     │
│    ├─ Display/docs only? → Skip                                        │
│    ├─ If calibration done: Are KPIs within tolerance?                  │
│    └─ If not → fix → re-calibrate                                      │
│                                                                         │
│ 3. DOCUMENTATION UPDATE                                                │
│    ├─ Update CLAUDE.md with sprint summary                             │
│    ├─ Create LESSONS_LEARNED entries for non-trivial discoveries       │
│    ├─ Update technical reference docs (if architecture changed)        │
│    ├─ Create inline code comments (if complex logic added)             │
│    └─ Check: All docs up-to-date and consistent with code?             │
│                                                                         │
│ 4. GIT CLEANUP & VERIFICATION                                          │
│    ├─ Review: `git status` (any uncommitted changes?)                  │
│    ├─ Stage: Specific files only (`git add <file>`, never `git add .`) │
│    ├─ Commit: Exact message with context                               │
│    ├─ Verify: `git log --oneline` shows the commit                     │
│    └─ Verify: `git diff main..feature` shows intended changes          │
│                                                                         │
│ 5. PRESENT OPTIONS TO USER                                             │
│    ├─ Option A: Merge to main (if tests pass + calibration passes)     │
│    │   → Execute: `git merge --no-ff feature -m "Merge: ..."`          │
│    │   → Execute: `git push origin main`                               │
│    │                                                                   │
│    ├─ Option B: Create PR for review (if stakeholder sign-off needed)  │
│    │   → Execute: `gh pr create --title "..." --body "..."`            │
│    │   → Provide: PR URL to user                                       │
│    │                                                                   │
│    ├─ Option C: Keep branch open (if work is incomplete)               │
│    │   → Document: What's left to do                                   │
│    │   → Provide: Branch name for next session                         │
│    │                                                                   │
│    ├─ Option D: Discard branch (if work was exploratory)               │
│    │   → Document: What was learned                                    │
│    │   → Execute: `git branch -D feature`                              │
│    │                                                                   │
│    └─ User chooses → Execute choice                                    │
│                                                                         │
│ 6. WORKSPACE CLEANUP                                                   │
│    ├─ If merged or discarded: → Delete feature branch                  │
│    ├─ If PR created: → Keep branch, mark as awaiting review            │
│    ├─ Archive: Temporary files, logs, debug outputs                    │
│    └─ Update CLAUDE.md: Current branch, current state                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Hard gates before offering options to user:**
- Full test suite passes
- Calibration passes (if applicable)
- Documentation updated
- All files staged correctly
- No uncommitted changes

**Escalation paths:**
- **Test failures in finishing:** Don't proceed. Fix the code. Investigation may require going back to execution phase.
- **Calibration still out of bounds:** Escalate to user with "KPI X is still Y% out of range. Should we adjust the constant more or relax the target?"

**Option Acceptance:**
- User explicitly chooses one option
- Execute exactly that option
- Do not execute options not chosen

---

### Phase 7: External Audit Phase (External Audit Skill)

**When to invoke:** User requests "3rd Party Audit" or regular audit cycle triggers.

**Duration:** 120-180 min (6 steps, multiple interactions)

**Agents involved:** Planning agent (Cowork), 3rd party, execution lead

**Overview:**

The external audit pipeline has 6 steps across 3 interactions, with 5 deliverables and 4 prompts.

```
┌─────────────────────────────────────────────────────────────────┐
│ INTERACTION 1: COWORK PREPARES AUDIT PACKAGE (D1)              │
├─────────────────────────────────────────────────────────────────┤
│ Step 1: Package (Cowork owns)                                  │
│   • Collect all code, docs, tests, calibration results         │
│   • Write audit scope document (what's in scope, what's out)    │
│   • List specific questions for 3rd party                      │
│   • Prepare: Deliverable 1 (audit package + prompt 1)          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ INTERACTION 2: 3RD PARTY CONDUCTS AUDIT (D2/D3/D4)             │
├─────────────────────────────────────────────────────────────────┤
│ Step 2: Handoff (Cowork owns handoff, 3rd party owns audit)    │
│   • Send audit package to 3rd party                            │
│   • Brief 3rd party on project goals, constraints              │
│   • Prepare: Deliverable 2 (audit report + findings + prompt 2)│
│                                                                 │
│ Step 3: Audit Report Review (Cowork owns response)            │
│   • Read audit report and findings from 3rd party              │
│   • Classify findings (critical, major, minor, informational)  │
│   • Create remediation plan for each finding                   │
│   • Prepare: Deliverable 3 (remediation plan + prompt 3)      │
│                                                                 │
│ Step 4: 3rd Party Response (3rd party owns)                   │
│   • Review Cowork's remediation plan                           │
│   • Validate plans (sufficient? realistic? complete?)          │
│   • Identify gaps or questions                                 │
│   • Prepare: Deliverable 4 (response to remediation + prompt 4)│
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ INTERACTION 3: COWORK EXECUTES AND CLOSES (D5)                 │
├─────────────────────────────────────────────────────────────────┤
│ Step 5: Remediation Execution (Cowork owns)                    │
│   • Execute all remediation plans                              │
│   • Run calibration to verify fixes                            │
│   • Update documentation and audit trail                       │
│   • Prepare: Evidence of execution                             │
│                                                                 │
│ Step 6: Audit Closure (Cowork owns)                            │
│   • Summarize what was fixed                                   │
│   • Report: KPI improvements, test coverage, findings closed   │
│   • Prepare: Deliverable 5 (audit closure note)               │
└─────────────────────────────────────────────────────────────────┘
```

**Hard gates before closing audit:**
- All remediation plans executed
- Calibration passing
- 3rd party confirms all findings addressed
- Closure note filed

See `skills/external-audit.md` for full procedural details.

---

## Cross-Cutting Concerns

### Review Loops and Iteration Limits

Every major phase has a review loop. Iteration limits prevent infinite refinement:

| Phase | Review Type | Iteration Limit | Escalation if Exceeded |
|-------|---|---|---|
| Design | Per-section | 3 rounds per section | Escalate with "which approach?" |
| Planning | Overall plan | 2 rounds total | Escalate with "which constraints relax?" |
| Execution | Spec compliance | 2 fix iterations per task | Escalate for architectural review |
| Finishing | Final verification | 1 retry (re-run tests + fix) | Escalate for root cause analysis |

### Escalation Hierarchy

```
        Task is blocked or stuck
                      ↓
        → Specialist escalates to Lead
                      ↓
        Lead attempts to resolve (check skill, reframe, gather context)
                      ↓
        → If Lead can't resolve: Lead escalates to Planning Agent
                      ↓
        Planning Agent attempts to resolve (re-examine spec, gather context)
                      ↓
        → If Planning Agent can't resolve: Escalate to User
                      ↓
        User decides: Which constraint relaxes? Which assumption changes?
```

### Parallelization

Independent tasks run in parallel. Dependent tasks run in sequence.

**Identification:**
- Task A and Task B have no shared files → can parallelize
- Task A writes to FILE.X, Task B reads FILE.X → must sequence (A then B)
- Task A and Task B both read FILE.X → can parallelize

**Dispatch:**
- Parallelize: Send both tasks to separate agents at same time
- Sequence: Send A, wait for completion, send B

---

## Success Criteria (Per Phase)

### Design Phase Success
- [ ] Design document is complete (6 sections)
- [ ] User has approved design in full
- [ ] Risks identified and mitigations proposed
- [ ] No ambiguities or hidden assumptions

### Planning Phase Success
- [ ] File structure is clear and non-overlapping
- [ ] Tasks are bite-sized (2-5 min each)
- [ ] Dependencies are explicit and acyclic
- [ ] Verification commands are exact and reproducible
- [ ] Sprint dispatch is ready

### Execution Phase Success
- [ ] All tasks marked complete
- [ ] Full test suite passes (appropriate tier)
- [ ] Specialist reviews confirm compliance and quality
- [ ] No open escalations

### Verification Phase Success
- [ ] Claim is specific and testable
- [ ] Evidence is complete and reliable
- [ ] Verdict is clear (approved, conditional, or rejected)

### Calibration Phase Success
- [ ] Tests pass (appropriate tier)
- [ ] KPIs measured and within tolerance (or escalated)
- [ ] Results recorded and archived
- [ ] Decision gate cleared

### Finishing Phase Success
- [ ] Full test suite passes
- [ ] Calibration passing (if applicable)
- [ ] Documentation updated
- [ ] Merge/PR/branch option chosen and executed

### External Audit Phase Success
- [ ] All findings addressed
- [ ] Remediation plans executed
- [ ] Calibration passing
- [ ] Audit closure note filed

---

## How to Use This Map

- **Starting a session?** Read the high-level flow diagram at the top.
- **In the middle of a phase?** Find your phase in Phase Details and follow the flowchart.
- **Getting stuck?** Check the Escalation Paths for your phase.
- **Wondering if you're done?** Check the Success Criteria for your phase.
- **Designing a new phase or workflow?** Use this map as your template.
