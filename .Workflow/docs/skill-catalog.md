# Skill Catalog

A complete index of workflows, skills, and agents for the GoG project. Use this as a reference when planning work, dispatching agents, or troubleshooting process gaps.

---

## Quick Reference: When to Use What

| Scenario | Use Skill | Agent |
|----------|-----------|-------|
| "Help me design Phase X" | brainstorming + planning | — (human + Claude) |
| "Implement Phase X spec" | execution | orchestrator |
| "Bug reported; root cause unknown" | debugging (investigator) | investigator |
| "Implementation done; verify spec" | code-review (spec-compliance) | spec-compliance-reviewer |
| "Verify code quality" | code-review (quality) | quality-reviewer |
| "Run tests" | verification | test-runner |
| "Update docs after changes" | documentation | doc-keeper |
| "Multiple independent tasks" | parallel-agents | orchestrator (coordinates) |
| "Team audit" | external-audit | — (orchestrator coordinates) |

---

## SKILLS (Workflow Disciplines)

### Skill 1: Brainstorming

**Type:** Flexible-pattern (adapt principles to context)

**Trigger:** "Help me design X," "Think through implications," "What could go wrong?"

**Purpose:** Collaborative ideation. Generate options, explore tradeoffs, pressure-test assumptions.

**Disciplines:**
1. **Divergence first.** Generate >3 options before evaluating.
2. **No veto yet.** Collect all ideas; criticism comes later.
3. **Pressure test.** Ask "what if?" and "what breaks if?"
4. **Document tradeoffs.** Every option has pros/cons; state them.
5. **Narrow to decision.** Vote or user chooses; record rationale.

**Input:**
- Problem statement
- Constraints
- Success criteria
- Decision deadline

**Output:**
- Brainstorm transcript
- 3+ options with tradeoff analysis
- Recommended direction (with reasoning)
- Remaining unknowns

**Integration points:**
- Feeds into Planning (turn chosen option into spec)
- May trigger external audit if high-stakes decision

**Example:** "Design the personality cube (Ego × Risk × Tempo). What could go wrong? How many identities emerge? Should we use 3 knobs or 4?"

---

### Skill 2: Planning

**Type:** Rigid-discipline (follow exactly)

**Trigger:** "Create a spec," "Plan Phase X," "Break down work," "Dispatch sprint"

**Purpose:** Turn a chosen design into an executable specification. Produce detailed, step-by-step implementation instructions.

**Disciplines:**
1. **Scope precisely.** What is in scope? What is explicitly OUT?
2. **List all acceptance criteria.** These must be testable.
3. **Break into steps.** 5–20 steps, each with clear input/output.
4. **Assign agents.** Which specialist for each step? Parallel or sequential?
5. **Identify dependencies.** Which steps must run first? Parallelism opportunities?
6. **Estimate effort.** Rough time + token budget.
7. **Document assumptions.** What must be true for plan to succeed?

**Input:**
- Design choice (from brainstorming)
- Project context (phase, dependencies, constraints)
- Success criteria

**Output:**
- Specification document (file: `GoG_Roadmap.md` or `[phase_name]_SPEC.md`)
- Agent dispatch template (ready to paste)
- Risk/mitigation list
- 3-sprint lookahead

**Integration points:**
- Receives brainstorm output
- Produces spec for execution (orchestrator uses this)
- References roadmap and lessons learned

**Example:** "Plan FI-v2-D calibration. Break into steps: 1) Read spec, 2) Implement risk modifier, 3) Run CAL-028, 4) Check 4/6 gate, 5) Update docs. Assign: impl + test-runner in parallel, docs sequentially."

---

### Skill 3: Execution

**Type:** Rigid-discipline (follow specification exactly)

**Trigger:** "Execute the plan," "Implement [spec]," "Do the work"

**Purpose:** Take a specification and produce working code.

**Disciplines:**
1. **Read spec first.** Understand scope, steps, acceptance criteria.
2. **TDD loop.** RED → GREEN → REFACTOR (see Skill 4).
3. **Verify no assumptions.** If spec is unclear, ask before coding.
4. **One change at a time.** Single commit per logical unit.
5. **Test after every change.** Run tests; confirm passing before next step.
6. **Document as you code.** Comments in code, not commit message.
7. **Stage specific files.** Never `git add -A`; always explicit.

**Input:**
- Specification
- Acceptance criteria
- Code base (state before change)
- Test suite

**Output:**
- Working code (committed)
- All tests passing
- Commit with message: "[TASK] Brief description. Acceptance criteria: [list]"

**Integration points:**
- Receives spec from Planning
- Produces code for Spec-Compliance-Reviewer
- Uses Test-Runner for verification

**Example:** "Implement Risk Tolerance modifier in EVM-1. Spec: add 7th cognitive attribute, apply modifier formula (1.0 + scale*(50-RT)/50), apply after Ego before Instinct. TDD: write test first (expect modifier=1.4 at RT=0), implement, verify. Commit when 12 tests pass."

---

### Skill 4: TDD (Test-Driven Development)

**Type:** Rigid-discipline (follow exactly)

**Trigger:** "Add feature," "Fix bug," "Improve code"

**Purpose:** Ensure correctness and prevent regressions. Write tests BEFORE code.

**Disciplines:**
1. **RED.** Write test that fails (feature not yet implemented).
2. **GREEN.** Implement minimum code to pass test (crude is OK).
3. **REFACTOR.** Clean up; remove duplication; improve clarity.
4. **Repeat.** For each piece of functionality.

**Cycle:**
```
1. Write failing test
   ├─ Test is specific (one behavior per test)
   ├─ Test name describes what is tested (test_risk_modifier_aggressive_at_rt_0)
   └─ Test fails because feature missing
2. Implement minimum code to pass
   ├─ Write simplest code that satisfies test
   ├─ Don't worry about style or efficiency
   └─ Test passes
3. Refactor
   ├─ Clean up: remove duplication, improve naming
   ├─ Extract constants
   ├─ Simplify logic
   └─ Test still passes (verify with pytest after every change)
4. Repeat for next behavior
```

**Input:**
- Feature to implement (from spec)
- Existing test suite

**Output:**
- Test file (new tests)
- Implementation file (feature)
- All tests passing
- Clean code (no duplication, clear intent)

**Integration points:**
- Part of Execution skill
- Uses Test-Runner for verification
- Feeds Quality-Reviewer

**Example:**
```
FEATURE: Risk Tolerance modifier

RED:
def test_risk_modifier_scales_inversely():
    fighter = Fighter(risk_tolerance=0)
    modifier = calc_modifier(fighter)
    assert modifier > 1.0  # Aggressive (high utility)
    # Test fails: function doesn't exist yet

GREEN:
def calc_modifier(fighter):
    return 1.0 + 0.40 * (50 - fighter.risk_tolerance) / 50.0
# Test passes

REFACTOR:
def calc_risk_modifier(fighter):
    """Calculate action utility modifier from Risk Tolerance.
    Higher RT → lower utility (conservative).
    """
    return 1.0 + SCALE * (NEUTRAL_RT - fighter.risk_tolerance) / NEUTRAL_RT

# Repeat for next test (e.g., conservative at RT=100)
```

---

### Skill 5: Debugging

**Type:** Flexible-pattern (adapt approach to symptom)

**Trigger:** "Tests are failing," "Behavior is wrong," "Why is X broken?"

**Purpose:** Systematically isolate and fix bugs.

**Disciplines:**
1. **Reproduce.** Get the bug to happen consistently.
2. **Isolate.** Narrow to smallest failing test/scenario.
3. **Trace.** Follow code execution step-by-step.
4. **Hypothesize.** Form root-cause hypothesis.
5. **Test hypothesis.** Design minimal test that confirms/refutes.
6. **Fix.** Implement minimal fix that passes test.

**4-Phase Debugging Process:**

```
PHASE 1: REPRODUCE
- Do you see the bug consistently?
- Can you reproduce with minimal input?
- Does it happen in isolation or only with other changes?
Action: Reduce to smallest failing scenario

PHASE 2: ISOLATE
- Is it in code, data, or configuration?
- Which subsystem (engine, EVM, damage, etc.)?
- Which function/file?
Action: Binary search: disable half the code, does bug persist?

PHASE 3: TRACE
- Step through code with failing input
- What are the actual values at each step?
- Where does actual diverge from expected?
Action: Add print statements / use debugger

PHASE 4: FIX
- Confirm root cause with targeted test
- Implement minimal fix
- Verify fix with full test suite
- No regressions
Action: Commit with LL entry
```

**Integration points:**
- Uses Investigator for root-cause analysis (if complex)
- Uses Test-Runner for regression verification
- Updates Lessons Learned (via Doc-Keeper)

**Example:**
```
BUG: Block rate 51% (target 35%)

PHASE 1: Reproduce
Run 1000 sample fights, measure block rate.
Result: 51% consistently across different seeds.
Isolated: Bug is deterministic, not random.

PHASE 2: Isolate
Is it EVM-1? EVM-2? Damage? Position?
Hypothesis: EVM-1 (defender choices).
Test: EVM-1 reward table should have Block=0.5 ONLY in Standing.
Found: Block reward applied in all positions (CLINCH, GROUND too).
Root cause: Reward table not gated by position.

PHASE 3: Trace
_apply_evm_defender() line 625:
  rewards = EVM1_REWARDS  # All actions
  softmax([0.5 for Block, 1.5 for Evade, ...])
  → Block 51% when Clinch/Ground (should be unavailable)

PHASE 4: Fix
Add position gating before softmax:
  valid_actions = get_available_for_position(pos)
  rewards = {k: v for k, v in EVM1_REWARDS if k in valid_actions}
  softmax([rewards[a] for a in valid_actions])
Test: Block rate now 19% in Standing, 0% in Clinch/Ground.
Overall: 19% (target 35% — within tolerance).
Commit: "Fix: Gate EVM-1 reward table by position"
```

---

### Skill 6: Verification

**Type:** Rigid-discipline (follow process exactly)

**Trigger:** "Verify X works," "Validate before shipping," "Double-check results"

**Purpose:** Ensure claims are based on evidence, not assumption.

**Disciplines:**
1. **Claim first.** State the claim clearly.
2. **Evidence required.** What data proves this?
3. **Run measurement.** Collect evidence.
4. **Analyze.** Compare to claim.
5. **Conclude.** Claim supported or refuted?

**Verification Checklist:**
```
[ ] Is the claim specific? (Not "it works"; but "block rate is 35%")
[ ] What test/measurement proves it?
[ ] Did you run the test?
[ ] Did the test pass?
[ ] Is the result stable (multiple runs? multiple seeds?)
[ ] Does it match the target?
[ ] Are there edge cases?
[ ] Did you test boundaries?
```

**Integration points:**
- Uses Test-Runner for code verification
- Feeds Spec-Compliance and Quality reviews
- Documents findings in memory (for future agents)

**Example:**
```
CLAIM: "Risk Tolerance modifier is working correctly"

VERIFICATION:
1. Claim specificity: "Risk modifier scales from 0.6–1.4 for RT 0–100, with 1.0 at RT=50"
2. Test: test_risk_tolerance_modifier_full_range
3. Run: pytest test_fight_engine.py::TestEVM5RiskTolerance -v
4. Result: 12/12 PASS
5. Edge cases: RT=0 (1.4), RT=50 (1.0), RT=100 (0.6), invalid (-1, 101) rejected
6. Stability: Run 3 times with different seeds → consistent results
7. Conclusion: VERIFIED. Claim supported.
```

---

### Skill 7: Code Review (Requesting)

**Type:** Flexible-pattern (adapt to review type)

**Trigger:** "Review my code," "Is this compliant?", "Should I merge this?"

**Purpose:** Get independent verification before merging.

**When to request review:**
- After implementing a spec
- Before merging to main
- When architecture decision made
- When constants tuned
- When tests added

**How to request:**
1. Code is committed to feature branch (not main)
2. All tests pass
3. Request includes: spec, branch name, what to check
4. Provide context: why was this change made?

**Template:**
```
REVIEW REQUEST:

Type: [SPEC_COMPLIANCE | QUALITY | BOTH]
Branch: feature/fix-ko-gate-fatigue
Spec: "Add fatigue modifier to KO gate. Formula: ko_prob * (1 - fatigue*0.15)"

What to check:
- Does code implement the spec?
- Are constants properly separated?
- Are tests adequate?
- Any architecture violations?

Context:
CAL-029 achieved 4/6 PASS. KO+TKO at boundary (35.4%, target 30-35%).
Benchmark analysis (B-35) shows KO rate should decline R1→R3 (fatigue effect).
Adding fatigue modifier to KO gate to match TKO/Sub behavior.

Related: LL-147, CAL-030
```

**Integration points:**
- Requests go to Spec-Compliance-Reviewer or Quality-Reviewer
- Receives feedback
- Makes changes or escalates (if disagreement)
- Merges after approval

---

### Skill 8: Code Review (Receiving)

**Type:** Rigid-discipline (follow review protocol exactly)

**Trigger:** "Review this implementation," "Verify spec compliance," "Check quality"

**Purpose:** Provide independent verification. See agents: Spec-Compliance-Reviewer and Quality-Reviewer.

**Review process:**
1. Read the review request (context, what to check)
2. Read the specification
3. Read the code changes
4. Verify requirements one by one
5. Report findings: APPROVED / APPROVED_WITH_CONCERNS / REJECTED

**Outcome:**
- APPROVED: Merge immediately
- APPROVED_WITH_CONCERNS: Merge after minor fixes
- REJECTED: Do not merge; request rewrite

**Integration points:**
- Receives review request (via orchestrator or direct)
- Produces APPROVED/concerns/REJECTED verdict
- If REJECTED, improvement is feedback for implementer

---

### Skill 9: Parallel Agents

**Type:** Rigid-discipline (follow rules exactly)

**Trigger:** "Multiple independent tasks," "Run in parallel," "Speed up delivery"

**Purpose:** Execute independent work concurrently. Reduce wall time.

**Rules for Parallelism:**

```
PARALLEL when:
- Tasks have NO data dependencies (A doesn't use B's output)
- Tasks touch DIFFERENT code files (no merge conflicts)
- Tasks use DIFFERENT test categories (no interference)

Examples:
✓ Implement Feature A + Implement Feature B (separate files)
✓ Test run + Doc update (independent processes)
✓ Quality review + Test run (first doesn't depend on second)

SEQUENTIAL when:
- Task B uses Task A's output (B depends on A)
- Tasks modify SAME code (merge conflict risk)
- Task B's test uses Task A's feature (implementation must come first)

Examples:
✗ Implement X + Spec compliance review X (review needs implementation)
✗ Implement A + Implement B (if B calls A)
✗ Implementation + Merge to main (implementation first, then merge)
```

**Coordination:**
1. Identify independent tasks
2. Dispatch agents in parallel
3. Wait for all to complete
4. Sequence dependent tasks
5. Report total wall time saved

**Example:**
```
DISPATCH (Parallel):
- Agent 1: Implement risk modifier (engine_evm.py)
- Agent 2: Implement fatigue modifier (engine_finish.py)
- Agent 3: Run tests (test suite, fast)
- Agent 4: Update docs (CLAUDE.md, Roadmap)

Wait for all to complete...

NEXT (Sequential):
- Agent 5: Spec-compliance review (after implementation done)
- Agent 6: Merge to main (after review passes)

Wall time saved: ~30 min (parallel saves test time + doc time)
```

---

### Skill 10: Workspace Isolation

**Type:** Rigid-discipline (follow exactly)

**Trigger:** "Start coding," "Before any code change," "New feature or bug fix"

**Purpose:** Prevent conflicts. Keep main clean. Enable safe parallel work.

**Git Workflow (Feature Branching):**

```
1. BEFORE CODING:
   git checkout main
   git pull origin main

2. CREATE BRANCH:
   git checkout -b feature/[sprint]-[wave]-[short-name]
   Example: feature/stab1-wave-a-ko-fatigue

3. IMPLEMENT:
   [Make changes]
   [Commit frequently]
   git add [specific files, not .]
   git commit -m "[TASK] Implement X. Acceptance: Y, Z."

4. TEST:
   pytest -m "not slow" -q

5. PUSH:
   git push -u origin feature/stab1-wave-a-ko-fatigue

6. REVIEW:
   [Get approval from reviewers]

7. MERGE:
   git checkout main
   git pull origin main  # Get latest
   git merge --no-ff feature/stab1-wave-a-ko-fatigue -m "Merge: KO fatigue fix (CAL-030 6/6 PASS)"
   git push origin main

8. CLEANUP:
   git branch -d feature/stab1-wave-a-ko-fatigue
```

**Rules:**
- Never commit directly to main
- Never force-push
- Feature branches are throwaway (delete after merge)
- Main always passes tests
- One branch per dispatch (don't reuse)

**Integration points:**
- Start of Execution skill
- End of Execution skill (merge)
- Used by all code-changing agents

---

### Skill 11: Branch Finishing

**Type:** Flexible-pattern (three strategies)

**Trigger:** "Merge done," "Feature complete," "What do I do with this branch?"

**Purpose:** Decide branch fate: merge to main, keep for rework, or discard.

**Three Strategies:**

```
STRATEGY 1: MERGE to main (Success)
When: All tests pass + reviews approved
How:
  git checkout main
  git pull origin main
  git merge --no-ff feature/... -m "Merge: [summary]"
  git push origin main
  git branch -d feature/...
Result: Feature in main, branch deleted, history preserved

STRATEGY 2: KEEP for rework (Partial success)
When: Some progress made, more work needed, OR reviews found issues
How:
  git push -u origin feature/...  # Keep branch up to date
  Commit WIP to branch (don't merge)
  Next session: continue on same branch
Result: Feature branch preserved; work-in-progress safe

STRATEGY 3: DISCARD (Failure or abandoned)
When: Approach didn't work, or deprioritized, OR investigation closed
How:
  git branch -D feature/...  (force delete, lose work)
  OR keep but mark with [ARCHIVED] tag in git log
Result: Branch gone; clean history
```

**Decision Matrix:**

| Tests | Reviews | Decision | Action |
|-------|---------|----------|--------|
| PASS | APPROVED | Merge | Strategy 1 |
| PASS | WITH_CONCERNS | Merge | Strategy 1 (apply feedback in next phase) |
| FAIL | N/A | Rework | Strategy 2 (keep branch) |
| N/A | REJECTED | Rework | Strategy 2 (substantial changes) |
| STALE | N/A | Abandon | Strategy 3 (delete) |

---

### Skill 12: External Audit

**Type:** Rigid-discipline (follow 6-step procedure exactly)

**Trigger:** "3rd party audit," "Independent review," "Verification by external party"

**Purpose:** Get unbiased assessment of system state. Compliance check.

**6-Step Procedure:**

```
STEP 1: Audit Charter
- User + Orchestrator define scope (what areas? what questions?)
- Acceptance criteria (what constitutes "pass"?)
- Audit lead assigned
- Schedule: duration, dates, deliverable timeline

STEP 2: Code Freeze & Setup
- Orchestrator: Ensure all tests pass, no work in progress
- Provide audit lead: codebase access, test suite, docs
- Freeze code: no changes during audit (changes violate audit integrity)

STEP 3: Independent Analysis (3rd Party)
- Audit lead: Read code, run tests, examine design
- Produce findings: architectural assessment, risk analysis, recommendations
- Write Audit Report (D2 deliverable)

STEP 4: Findings Review (User + Orchestrator)
- Review audit findings
- Triage: critical (fix immediately) vs warning vs informational
- Generate remediation plan: who fixes what, timeline

STEP 5: Remediation (Orchestrator)
- Implement fixes per remediation plan
- Re-run tests, verify regressions fixed
- Prepare response to audit findings

STEP 6: Closeout (3rd Party)
- Audit lead: Verify fixes address findings
- Accept or request re-work
- Sign off: "Audit complete. Issues resolved."

DELIVERABLES:
- D1 (Audit Charter) — User + Orchestrator
- D2 (Audit Report) — 3rd Party
- D3 (Remediation Plan) — User + Orchestrator
- D4 (Remediation Evidence) — Orchestrator
- D5 (Audit Closeout) — 3rd Party
```

**Audit Folder Convention:**
```
6. Outside Audits/
  ├─ OutsideAudit.1.2026-03-16/
  ├─ OutsideAudit.2.2026-03-17/
  ├─ OutsideAudit.3.2026-03-23/
  │   ├─ Charter.md
  │   ├─ AuditReport.3.2026-03-23.md
  │   ├─ AuditRemediationPlan.3.2026-03-23.md
  │   ├─ RemediationEvidence/
  │   │   ├─ FixedIssue_1.md
  │   │   ├─ TestResults.log
  │   │   └─ ...
  │   └─ Audit3_Closeout_Note.md
  └─ OutsideAudit.4.TBD/
```

**Integration points:**
- Triggered by major phase completion or user request
- Produces findings that drive next sprint (STAB-1, etc.)
- Feeds Lessons Learned
- Results in updated roadmap

**Related artifact:** `6. Outside Audits/3rd_Party_Audit_Procedure.md` (full 6-step details)

---

### Skill 13: Calibration

**Type:** Flexible-pattern (tiered approach based on change scope)

**Trigger:** "Tune constants," "Verify behavior," "Measure system response"

**Purpose:** Adjust tunable parameters to meet behavioral targets.

**Three Calibration Tiers:**

```
TIER 1: FULL (Most comprehensive)
Run: N=1,200 × 3 seeds (~25 min)
Command: pytest --runslow -q (~22 min)
When: New mechanics, multi-system changes, sign-off required
Use: Before major release, final validation, Audit sign-off

TIER 2: QUICK CHECK (Fast validation)
Run: N=200 × 1 seed (~3 min)
Command: pytest -n auto -m "not slow" -q (~2 min)
When: Single-constant tweak, targeted fix, mid-sprint check
Use: "Did this change work?" verification

TIER 3: NONE (No calibration)
Skip: No test run
When: Display-only, stats-only, docs-only, comments-only
Use: Safe to deploy without measurement
```

**Calibration Workflow:**

```
1. MEASURE BASELINE
   Run Tier 2 test to get current metrics
   Record: Decision%, KO%, TKO%, KO+TKO%, Sub%, Draw%

2. IDENTIFY DEVIATION
   Compare baseline to target
   Example: KO%=14.5%, target 10-15% → OK but upper bound
            Sub%=19.8%, target 20-25% → below target

3. FORM HYPOTHESIS
   What constant affects Sub rate? V4_HP_DAMAGE_MULTIPLIER? V4_TRACK_DRAIN?
   Which direction? Increase or decrease?

4. ADJUST CONSTANT
   Make minimal change (e.g., 130 → 132)
   Commit change

5. RE-MEASURE
   Run Tier 2 test again
   Did metric move toward target?
   If yes: continue tuning. If no: revert and try different constant.

6. CONVERGE
   Repeat steps 3–5 until metrics within band
   Typical: 3–5 iterations per constant

7. VALIDATE
   Run Tier 1 full suite
   Verify: All metrics within target
   Check: No regressions (other metrics didn't move)
```

**Constants to tune (in order of leverage):**
1. V4_HP_DAMAGE_MULTIPLIER (affects KO, TKO, Sub)
2. V4_KO_ELIGIBLE_BASE_PROB (affects KO frequency)
3. V4_TRACK_DRAIN_MULTIPLIER (affects fatigue → affects all finishes)

**Integration points:**
- Uses Test-Runner for measurement
- Produces tuned constants (committed)
- Documents in CLAUDE.md (new constant values)
- Creates LL entry if discovery made

---

### Skill 14: Writing Skills

**Type:** Flexible-pattern (adapt to document type)

**Trigger:** "Create a new skill," "Write a guide," "Document a discovery"

**Purpose:** Author workflows, guides, and documentation.

**Structure for Process Documents:**

```
1. HEADER
   - Title
   - Type (workflow, skill, guide, template)
   - Trigger (when is this used?)
   - Purpose (why does it exist?)

2. OVERVIEW
   - Role description
   - Scope and boundaries
   - Integration points (what feeds this? what does this feed?)

3. DISCIPLINES
   - 3–5 core principles (not negotiable)
   - Strict rules vs flexible principles

4. STEP-BY-STEP PROCESS
   - Numbered steps with clear input/output
   - Decision points
   - Common pitfalls

5. TEMPLATES
   - Example output
   - Full-worked example

6. STRICT RULES
   - Non-negotiable requirements
   - Quality gates
   - Output contract

7. CHECKLISTS
   - Verification steps
   - Before/after verification

8. EXAMPLES
   - Real scenario
   - Common pitfalls and how to avoid them
```

**Quality Standards for Docs:**
- Specific (not vague)
- Concise (readers shouldn't need a glossary)
- Cross-referenced (links to related docs)
- Timestamped (current as of X date)
- Actionable (reader knows what to do)

**Integration points:**
- Contributes to memory system (becomes reference)
- Informs agent templates
- Updated by doc-keeper when approach changes

---

## AGENTS (Specialized Responders)

### Agent 1: Orchestrator

**Model:** Most capable (e.g., claude-opus)
**File:** `.Workflow/agents/orchestrator.md`

**Role:** Decompose large tasks, dispatch specialists, monitor quality

**Responsibilities:**
- Reads user request
- Plans work (scope, agents, dependencies)
- Dispatches specialists (test-runner, investigator, etc.)
- Verifies output against spec
- Escalates when blockers occur
- Reports progress and status

**Triggers:**
- Multi-step implementations
- Phase work
- QA cycles
- Complex problem-solving

**Output:** Orchestrated workflow; coordinated agent results; clear next steps

**When NOT to use:** Single-step work (use specialist directly); design-only (use Planning skill)

---

### Agent 2: Investigator

**Model:** Most capable (e.g., claude-opus)
**File:** `.Workflow/agents/investigator.md`

**Role:** Root-cause analysis. Read-only. Produces fix specifications.

**Responsibilities:**
- Trace code to understand behavior
- Compare code to spec
- Identify divergence
- Propose fix specification (not implementation)

**Triggers:**
- "Root cause unknown"
- "Why is X broken?"
- "Deep analysis needed"

**Output:** Root-cause analysis + actionable fix specification

**Strict boundary:** READ-ONLY. Does not modify code. Does not run tests directly. Does not suggest next steps.

---

### Agent 3: Spec-Compliance-Reviewer

**Model:** Capable mid-tier (e.g., claude-sonnet)
**File:** `.Workflow/agents/spec-compliance-reviewer.md`

**Role:** Verify implementation matches specification

**Responsibilities:**
- Read specification
- Read implementation
- Verify every requirement → code
- Report: APPROVED / APPROVED_WITH_CONCERNS / REJECTED

**Triggers:**
- "Verify spec compliance"
- "Did we build what was asked?"
- After implementation, before quality review

**Output:** APPROVED verdict + detailed checklist (with file:line citations)

**Trust model:** Independent verification. Don't trust implementer's self-report.

---

### Agent 4: Quality-Reviewer

**Model:** Capable mid-tier (e.g., claude-sonnet)
**File:** `.Workflow/agents/quality-reviewer.md`

**Role:** Verify code quality and architecture compliance

**Responsibilities:**
- Read code
- Check architecture rules [CUSTOMIZE per project]
- Detect known traps [from LESSONS_LEARNED.md]
- Report: Critical/Warning/Note findings
- Assess: Ready / Minor Fixes / Major Revision

**Triggers:**
- "Check code quality"
- "Architecture review"
- After spec-compliance passes

**Output:** Quality assessment + severity findings

**Note:** Different from spec-compliance. Spec asks "is it what we asked?" Quality asks "is it well-built?"

---

### Agent 5: Test-Runner

**Model:** Cheapest/fastest (e.g., claude-haiku)
**File:** `.Workflow/agents/test-runner.md`

**Role:** Execute test suite and report results

**Responsibilities:**
- Run test command exactly as specified
- Categorize failures (regression / constant-mismatch / environment / flaky / new-feature)
- Report: pass count, failure list, recommendations

**Triggers:**
- "Run tests"
- "Verify no regression"
- Before/after any code change

**Output:** Test results + categorized failures (if any)

**Strict boundary:** Execution-only. Does not interpret results or suggest fixes. Reports facts only.

---

### Agent 6: Doc-Keeper

**Model:** Capable mid-tier (e.g., claude-sonnet)
**File:** `.Workflow/agents/doc-keeper.md`

**Role:** Maintain all living documentation

**Responsibilities:**
- Update CLAUDE.md after code changes
- Add LL entries for non-trivial discoveries
- Tag roadmap items [COMPLETED]
- Keep constants table current
- Maintain index and cross-references

**Triggers:**
- "Update docs after changes"
- After code completion
- After discovery or design decision

**Output:** Updated docs with timestamps + LL entries (if applicable)

**Boundary:** Does not modify code. Only updates documentation.

---

## Integration Map

```
BRAINSTORM → PLANNING → EXECUTION → SPEC-COMPLIANCE → QUALITY → TEST → DOCS

User's design choice → Specification → Implementation → Verification (spec) → Quality checks → Tests → Documentation

Agent involvement:
- Brainstorm: User + Claude (collaborative)
- Planning: Planning skill (rigid discipline)
- Execution: Implementation agent (code) + TDD skill (rigor)
- Spec-compliance: Spec-compliance-reviewer (rigid)
- Quality: Quality-reviewer (rigid)
- Test: Test-runner (rigid)
- Docs: Doc-keeper (rigid)

Parallel opportunities:
- Implementation + Tests can run parallel (if independent)
- Quality + Test can run parallel (if implementation done)
- Docs can run parallel with Test

Feedback loops:
- Quality issues → back to Implementation (minor fixes)
- Test failures → back to Investigator (root-cause)
- Spec compliance fails → back to Planning (redesign)
```

---

## Decision Tree: Which Skill/Agent to Use

```
START: "I need to do X"

├─ Is it a DESIGN question?
│  └─ YES → Use BRAINSTORMING skill (explore options)
│  └─ NO → Continue
│
├─ Is it a PLANNING question?
│  └─ YES → Use PLANNING skill (turn design into spec)
│  └─ NO → Continue
│
├─ Is it IMPLEMENTATION?
│  └─ YES → Use EXECUTION skill (write code with TDD)
│  └─ NO → Continue
│
├─ Is a PROBLEM happening?
│  ├─ Need root-cause analysis?
│  │  └─ YES → Dispatch INVESTIGATOR agent (read-only analysis)
│  ├─ Tests failing?
│  │  └─ YES → Dispatch TEST-RUNNER (measure) + INVESTIGATOR (analyze)
│  └─ NO → Continue
│
├─ Is work DONE and needs VERIFICATION?
│  ├─ Verify spec match?
│  │  └─ YES → Dispatch SPEC-COMPLIANCE-REVIEWER
│  ├─ Verify quality?
│  │  └─ YES → Dispatch QUALITY-REVIEWER (after spec passes)
│  ├─ Run tests?
│  │  └─ YES → Dispatch TEST-RUNNER
│  ├─ Update docs?
│  │  └─ YES → Dispatch DOC-KEEPER (after all other agents done)
│  └─ NO → Continue
│
├─ Multiple independent tasks?
│  └─ YES → Use PARALLEL-AGENTS skill (orchestrate concurrent work)
│  └─ NO → Continue
│
├─ Need 3rd party review?
│  └─ YES → Use EXTERNAL-AUDIT skill (6-step procedure)
│  └─ NO → Continue
│
├─ Need to tune constants?
│  └─ YES → Use CALIBRATION skill (measure + adjust)
│  └─ NO → Continue
│
└─ Anything else?
   └─ Escalate to user + discuss approach
```

---

## Quick Dispatch Template

Copy this when dispatching work to agents:

```
[AGENT DISPATCH]
Agent: [Name]
Sprint: [STAB-1 | CAL-030 | etc]
Scope: [1-2 sentence what to do]

FILES TO READ:
1. [path] : [why]
2. [path] : [why]

TASK:
[Clear instructions. Reference spec, not duplication.]

ACCEPTANCE CRITERIA:
[ ] Criterion 1
[ ] Criterion 2
[ ] Tests pass: [command]
[ ] Docs updated: [which docs]

WHEN DONE:
Next agent: [who runs next]
Report format: [what should result look like]
```

---

## When to Escalate

Stop work and escalate to user when:

- Spec is ambiguous or contradictory
- Architecture decision needed (impacts multiple subsystems)
- Blocker encountered (agent can't proceed)
- Risk discovered (potential regression, data loss, etc.)
- Resources exhausted (token budget, time limit)
- Multiple agent failures on same task (>3 attempts)

Escalation template:

```
[ESCALATION]
Issue: [One sentence problem]
Blocker: [What can't be done? Why?]
Context: [Relevant facts]
Request: [User decision needed; specific options listed]
Timeline: [How urgent?]
```

