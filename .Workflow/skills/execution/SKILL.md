---
name: execution
description: "Use when an approved plan exists and tasks need to be implemented — the actual coding/building phase. Trigger: plan approved, tasks assigned, ready to build. Also use for any multi-step implementation involving agents or sequential task execution."
---

# Execution Skill

The execution skill implements approved plans. It is PURE EXECUTION — no redesign, no deviation from the plan without escalation. Its input is an approved plan. Its output is completed, verified work ready for handoff or merge.

Execution has two paths, depending on whether you're orchestrating multiple agents or executing inline.

---

## Path A: Multi-Agent Orchestrated (Preferred for Complex Work)

Use this path when:
- Work spans 3+ tasks
- Tasks require different specialties
- Work is complex enough to warrant expert agents
- User has provided agent resources

### Per-Task Execution Loop

For each task in the plan:

**Step 1: Preparation**
1. Confirm task dependencies are satisfied:
   - All prerequisite tasks are DONE
   - All outputs from prerequisite tasks are available
2. Extract ALL context needed by the subagent:
   - Full code snippets (not just file paths)
   - Current values of constants or config
   - Recent test results
   - Relevant documentation
   - NEVER make the agent read files — extract and provide everything
3. Prepare dispatch prompt:
   - Task specification (from the plan)
   - Full context (code, data, docs)
   - Verification command (from the plan)
   - Success criteria (from the plan)

**Step 2: Dispatch**
1. Send task to specialist agent
2. Include: "Complete this task per the specification. Run the verification command. Report whether DONE, DONE_WITH_CONCERNS, BLOCKED, or NEEDS_CONTEXT."
3. Wait for completion signal

**Step 3: Dispatch Signal Handling**

**DONE:**
- Verification command passed
- No concerns reported
- Proceed to Step 4 (Specification Review)

**DONE_WITH_CONCERNS:**
- Task is technically complete, but agent raised concerns
- Evaluate concerns:
  - Are they blocking? If YES → mark task as BLOCKED, investigate
  - Are they informational? If YES → log and proceed to Step 4
- If concerns are significant, escalate to user

**BLOCKED:**
- Task could not be completed
- Reason: dependency not satisfied, external blocker, or unexpected technical issue
- Investigate:
  - Is the blocker preventable? (e.g., dependency task failed)
  - Is the blocker resolvable? (e.g., need to reassign or redesign)
  - Is the blocker a hard stop? (escalate to user)
- Do NOT retry the same dispatch. Either fix the underlying issue and re-dispatch, or escalate.

**NEEDS_CONTEXT:**
- Agent needs information not provided
- Provide the missing context
- Re-dispatch the same task
- Limit: 2 re-dispatches max. After 2, escalate (context extraction was incomplete).

**Step 4: Specification Review**
1. Different agent than the implementer
2. Task: "Review this completed work against the specification. Does the actual output match what was asked?"
3. Compare:
   - Original task spec (from the plan)
   - Actual changes made
   - Verification command output
4. Signal: COMPLIANT or NONCOMPLIANT

**If COMPLIANT:** Proceed to Step 5 (Quality Review)

**If NONCOMPLIANT:**
- Document the gap (what was asked vs what was delivered)
- Return to implementer: "Your output doesn't match spec. Spec says X, you delivered Y. Fix and re-submit."
- Implementer re-runs verification command
- Max 2 revision cycles. After 2, escalate (specification was ambiguous or implementer can't execute the spec).

**Step 5: Quality Review**
1. Fresh agent (different from implementer and spec reviewer)
2. Task: "Review this code/change for quality: architecture compliance, known traps, persistent rules, maintainability. Assume the spec is correct. Is the IMPLEMENTATION well-built?"
3. Check:
   - Architecture violations? (e.g., breaking layering rules, hardcoding what should be configurable)
   - Known traps triggered? (See LESSONS_LEARNED or project constitution)
   - Code clarity and maintainability?
   - Test coverage adequate?
4. Signal: APPROVED or ISSUES_FOUND

**If APPROVED:** Mark task DONE

**If ISSUES_FOUND:**
- Document issues with severity (critical vs warning)
- Return to implementer: "Issues found: [list]. Fix these."
- Implementer revises
- Re-review
- Max 2 revision cycles. After 2, escalate (issues are design-level or implementer is stuck).

**Step 6: Mark Complete**
- Task is DONE when: Specification Review = COMPLIANT AND Quality Review = APPROVED
- Log verification evidence (test output, before/after code, metrics)
- Proceed to next task

---

### Post-All-Tasks: Full-Scope Review

After ALL tasks are complete:

1. Dispatch a fresh agent (has not reviewed any individual tasks)
2. Task: "You have completed work that was composed of [N] tasks. Review the entire deliverable against the original spec (provided below). Does the work, as a whole, achieve the intended outcome? Are there any gaps or regressions?"
3. Read: Original spec, final code state, test results, calibration results (if applicable)
4. Verify:
   - No inadvertent regressions (tests still pass)
   - All acceptance criteria met
   - Documentation reflects the new state
   - Changes are cohesive (not fragmented or half-done)

**If APPROVED:** All work is done. Proceed to branch finishing.

**If ISSUES:**
- Determine: Is this a gap in one task, or a systemic issue?
- If task-specific: Return to relevant task owner, mark as NOT DONE
- If systemic: Escalate to user with summary

---

## Path B: Inline/Batch Execution (Simpler Work or Solo)

Use this path when:
- Work spans 1–2 tasks
- Single agent doing the work
- Straightforward implementation
- No specialist agents available

### Batch Workflow

1. **Batch Setup:** Group 3–5 related tasks
2. **Execute Batch:**
   - For each task in batch: implement, run verification command, log result
   - Do NOT review or revise during batch execution — just implement
3. **Self-Review Batch:**
   - Read your own work
   - Compare against spec
   - Run full test suite (not just task-specific tests)
   - Identify issues
4. **Fix Issues:**
   - For each issue: implement fix, re-run verification command
   - Max 1 fix cycle per batch. If issues persist, escalate.
5. **User Checkpoint:**
   - Present batch results to user
   - Get approval to proceed to next batch, or stop for rework
6. **Repeat:** Next batch of 3–5 tasks

**After All Batches Complete:**
- Run full test suite across entire deliverable
- Update all documentation
- Present final work to user

---

## Mandatory Progress Reporting

For ALL execution paths, report progress every task (or every batch):

```
===== PROGRESS: [TASK_ID] 0% Starting — [TASK_TITLE] =====
[Brief description of what you're about to do]

===== PROGRESS: [TASK_ID] 50% In Progress — [KEY_STEP_COMPLETED] =====
[Result of first verification check or major step]

===== PROGRESS: [TASK_ID] 100% Complete — [FINAL_RESULT] =====
[Verification command output, status, any concerns]
```

**Example:**
```
===== PROGRESS: Task 1 0% Starting — Add V5_VARIANCE constants =====
Reading constants.toml, identifying insertion point.

===== PROGRESS: Task 1 100% Complete — Constants Added =====
Verification: grep "V5_VARIANCE" constants.toml
Output:
V5_VARIANCE_MIN = 5.0
V5_VARIANCE_MAX = 10.0
V5_VARIANCE_SCALE = 0.15
Status: ✓ DONE
```

---

## Fresh Agent Per Task

**Critical rule:** Every task gets a fresh agent instance.

Why:
- Context from Task A pollutes Task B (agent thinks it's still in Task A)
- Copy-paste errors from A leak into B
- Agent accumulates "status" across tasks (gets tired, makes more mistakes)

Enforcement:
- Each task dispatch creates a new agent instance
- No shared state between task agents
- Controller (you) is the only entity holding task state

---

## Controller Provides Full Context

**Critical rule:** The orchestrator extracts all relevant information and provides it IN THE DISPATCH PROMPT.

Do NOT dispatch a task like this:
```
"Implement Task 3. See file engine.py line 234. Ref constants.toml for the tuning values."
```

DO dispatch like this:
```
"Implement Task 3. Here is the relevant code:

[FULL FUNCTION SIGNATURE + DOCSTRING + SURROUNDING CONTEXT from engine.py]

Here are the constants you'll use:
[FULL CONSTANTS: V5_VARIANCE_MIN = 5.0, etc.]

Here is the test you must pass:
[TEST CODE]

Verification command: pytest test_damage_realism.py::test_variance_bounds
Expected output: PASSED"
```

Why:
- Agents shouldn't have to fish through files
- You catch missing context before dispatch (not after)
- Faster execution (no file reads)
- Easier to review (context is visible in the dispatch)

---

## Escalation Signals

Stop execution and escalate to user when:

1. **BLOCKED → 3rd task:** A task has been blocked (dependency or technical issue) and cannot proceed despite attempts to resolve
2. **Revision cycle > 2:** Any phase (implementation, spec review, quality review) has cycled >2 times without resolution
3. **Systemic issue:** A problem affects multiple tasks or calls into question the plan itself
4. **Decision required:** A choice between alternatives that wasn't in the plan, and you don't have authority to choose
5. **Unexpected discovery:** Evidence that the original spec was incomplete or incorrect

Escalation format:
```
===== ESCALATION: [ISSUE_TYPE] =====
Issue: [1-sentence problem statement]
Evidence: [data or log output]
Attempted resolutions: [what you tried]
Recommendation: [what you believe should happen next]
User decision needed: [explicit question]
```

---

## Red Flags (Signs You're About to Deviate)

- "I know this task will have issues, let me just implement and fix as I go" — That's rework. Execute per plan first.
- "The spec is vague, I'll assume what it means" — Stop and escalate. Spec ambiguity is a blocker.
- "Task B is blocked, but I'll start on Task C anyway" — No. Task C might depend on Task B's output. Check the plan.
- "This test is failing for a weird reason, let me refactor" — Stop. You're now in design mode, not execution mode. Either implement a fix (execution) or escalate to redesign (brainstorming).
- "I'll parallelize tasks to speed things up" — Only if the plan explicitly says they're parallel. Do NOT add parallelism.
- "The user said something different than the plan, I'll follow the user instead" — Escalate. Plans and user are now in conflict.

---

## Rationalization Table

| Rationalization | Reality |
|---|---|
| "I'll skip the spec review, I know what I built" | You're the worst judge of your own work. Independent review catches errors you can't see. |
| "I'll do one big review at the end instead of per-task" | Late-stage discovery costs 5–10x more than per-task review. You'll have to rework multiple tasks. |
| "This is straightforward, no need for a quality review" | Straightforward code is where subtle bugs hide. Quality review catches them. |
| "I'll just fix the issue inline, no need to escalate" | You don't know if the issue calls into question the entire plan. Escalate and let the user decide. |
| "The plan is wrong, I'll follow what makes sense instead" — Executing against a wrong plan reveals the wrongness. Execute per plan. If plan is wrong, escalate. |
| "I'll make a small improvement while I'm in this code" | Scope creep. Improvements that weren't in the plan → escalation. Stay focused. |
| "Task B depends on Task A output, but Task A isn't done yet. I'll guess what the output will be" | Don't guess. Wait for Task A to complete or escalate the dependency. |

---

## Notes

- **Execution is not design:** If you discover during execution that the plan is wrong, STOP and escalate. Do NOT redesign mid-execution.
- **Verification is proof:** A passing verification command means DONE. No exceptions, no "but I think there might be an issue."
- **Agent ownership:** An agent owns their task end-to-end (spec review, quality review). They don't hand off mid-review.
- **Controller is orchestrator:** You manage task sequencing, escalation, and progress. You don't execute tasks unless on Path B.
- **Batch is not parallel:** Batch just groups related sequential tasks. They still execute one at a time.
