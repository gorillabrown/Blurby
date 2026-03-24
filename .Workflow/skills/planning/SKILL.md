---
name: planning
description: "Use when a spec has been approved and work needs to be broken into executable tasks — before any code is written. Trigger: approved design/spec, sprint planning, task decomposition, implementation sequencing."
---

# Planning Skill

The planning skill takes an approved specification and breaks it into bite-sized, independently executable tasks. Planning happens AFTER brainstorming (spec approved) and BEFORE execution. Its output is a task manifest and execution order that the execution skill will consume.

## Phase 1: File Structure Mapping

**What to do:**
1. List every file that will be created or modified
2. For each file, identify:
   - Current state (does it exist? how many lines? what does it do?)
   - What will change (which lines modified, new functions, new data structures)
   - Dependencies (what other files must be modified before this one can be completed)
3. Build a dependency graph:
   - If A depends on B, then B must be completed (and tested) before A can start
   - Identify which files are independent (can be worked on in parallel)
4. Identify any new files that need to be created:
   - What directory do they go in?
   - What is their purpose?
   - What existing files reference them?

**Example:**
```
File: engine.py (existing, 2,415 lines)
  - Change: Add new function damage_realism_variance()
  - Depends on: constants.toml (for new tuning parameters)

File: constants.toml (existing, 247 lines)
  - Change: Add 3 new constants: V5_VARIANCE_MIN, V5_VARIANCE_MAX, V5_VARIANCE_SCALE
  - No dependencies

File: test_damage_realism.py (NEW)
  - Purpose: Tests for damage_realism_variance()
  - Depends on: engine.py, constants.toml
```

**Hard gate:** Do NOT proceed until you have a complete file manifest with dependencies mapped.

---

## Phase 2: Task Decomposition

**What to do:**
1. Break the work into tasks (each should take 2–5 minutes for an agent, longer for a human to understand/review)
2. Each task must be independently testable:
   - It produces an observable, verifiable output
   - You can write a test that passes or fails based on whether the task is done
   - It doesn't depend on tasks that haven't been completed yet
3. Sequence tasks to respect dependencies:
   - Task A (add constants to constants.toml) must complete before Task B (modify engine.py to use those constants)
   - Task C (write tests) can start when the code is done but doesn't need to wait for other tests

4. Aim for granularity:
   - TOO FINE: "Add the opening brace on line 47" (useless task)
   - GOOD: "Add damage_realism_variance() function with full signature, docstring, and parameter validation"
   - TOO COARSE: "Implement the entire feature" (not verifiable)

**Example task list:**
```
Task 1: Add 3 new constants to constants.toml
Task 2: Add damage_realism_variance() function signature and docstring to engine.py
Task 3: Implement damage_realism_variance() logic in engine.py
Task 4: Add integration hook in engine.main_fight_loop() to call damage_realism_variance()
Task 5: Write test_damage_realism.py with 8 unit tests
Task 6: Run full test suite and verify 0 regressions
Task 7: Update documentation
```

**Hard gate:** Every task must have a verification command (how will you know it's done?).

---

## Phase 3: Plan Writing

**What to do:**
For each task, write a specification:
```
### Task N: [Title]

**What to change:**
- File: [path]
- Lines/sections: [specific locations or "new file"]
- Change: [exact description of what will be different after this task]

**Why:**
- [How does this task move the work toward completion?]

**Verification command:**
- [Exact command to run or check to perform]

**Expected outcome:**
- [What will the output look like if successful?]

**Dependencies:**
- [Which tasks must be complete before this one?]

**Duration estimate:**
- [Expected implementation time for an agent or human reviewer]
```

**Example:**
```
### Task 1: Add 3 new constants to constants.toml

**What to change:**
- File: 2. Project Documentation/../constants.toml
- Add at end of file (before final closing bracket)
- Three new lines:
  - V5_VARIANCE_MIN = 5.0
  - V5_VARIANCE_MAX = 10.0
  - V5_VARIANCE_SCALE = 0.15

**Why:**
These constants control the damage variance subsystem. They must exist before any code can use them.

**Verification command:**
- `grep "V5_VARIANCE" constants.toml`

**Expected outcome:**
Three lines present, values match spec.

**Dependencies:**
None — this can start immediately.

**Duration estimate:**
1 minute
```

**Hard gate:** Every task must have a verification command. If you can't verify a task, it's not defined well enough.

---

## Phase 4: Agent Assignment (if using multi-agent)

**What to do:**
1. Identify which agent specialties are needed:
   - Engine/logic implementation
   - Testing/verification
   - Documentation
   - Data/constants
   - Other domain specialists
2. Assign each task to one agent:
   - Never split a task across multiple agents
   - One concern per agent (don't ask the same agent to implement AND test AND document)
3. Group related tasks for the same agent only if they're truly independent OR one directly follows the other
4. Create a task→agent mapping table

**Example:**
```
| Task | Agent | Model |
|------|-------|-------|
| 1 (Add constants) | data-quality-auditor | sonnet |
| 2-4 (Implement function) | engine-investigator | opus |
| 5 (Write tests) | test-runner | haiku |
| 6 (Full suite) | test-runner | haiku |
| 7 (Documentation) | doc-keeper | sonnet |
```

**Principle:** Different agents bring different expertise. Leverage it.

**Hard gate:** Every task must have exactly one assigned agent.

---

## Phase 5: Execution Ordering

**What to do:**
1. For each task pair, ask: "Does task A need to complete before task B starts?"
   - YES → Sequential: A → B
   - NO → Parallel: A ∥ B
2. Write out the execution flow:
   ```
   Task 1 → Task 2 → Task 3 → Task 4
   Task 5 ∥ Task 6 ∥ Task 7 (can all run at same time)
   Then: Task 8 (depends on all three above)
   ```
3. Identify the critical path (the longest chain of sequential dependencies)
   - This is the minimum time to completion
   - Everything else must fit around it
4. For parallel work, identify the join point (where the parallel work converges)

**Example:**
```
Phase A (Sequential):
  Task 1 (constants) → Task 2 (function signature) → Task 3 (logic)

Phase B (Parallel with Phase A):
  Task 5 (tests) can start once Task 2 is done
  Task 6 (full suite) must wait for Task 3 AND Task 5

Phase C (Sequential after Phase B):
  Task 7 (documentation) starts after Task 6 is done
```

**Hard gate:** Sequential vs parallel MUST be explicitly justified for every pair. Do NOT just assume something can be parallel.

---

## Phase 6: Plan Review Loop

**What to do:**
1. Present the plan to the user
2. Focus on:
   - Is the decomposition right? Are tasks the right size?
   - Are dependencies correct? Have you missed any dependencies or flagged false ones?
   - Are verification commands specific and testable?
3. Incorporate feedback and revise
4. Re-present
5. Limit to 2 iterations max. If you're past 2 rounds and still getting major pushback, escalate with a summary of the disagreement

**Example feedback and revision:**
- User: "Task 2 is too vague. What exactly does 'function signature' mean?"
- Response: "Task 2 revised: Add function `damage_realism_variance(damage: float, variance_scale: float) -> float:` with docstring explaining variance calculation, parameter ranges, and return value meaning."

**Hard gate:** Do NOT proceed to execution until the plan is explicitly approved.

**Hard gate:** After generating a dispatch spec, append it to the bottom of `docs/sprint-queue.md`. The queue must contain ≥ 3 un-dispatched sprints at all times. If the queue is below 3, continue planning before handing off to execution.

---

## Sprint Dispatch Template

**Canonical template:** `docs/sprint-dispatch-template.md` (CLI Evergreen)

When dispatching work to Claude Code CLI or subagents, use the evergreen template above. It is a POINTER, not a PAYLOAD — it references the detailed plan, it doesn't duplicate it.

The inline example below shows the template in use. For the authoritative fillable version with usage notes, sizing guide, and common mistakes, always reference the standalone template file.

```
## [SPRINT NAME / TASK TITLE]

### KEY CONTEXT
[1–3 sentences. What state is the project in? What just happened? Why does this work matter?]

Example:
"FightEngine calibration is at 4/6 PASS targets after CAL-029. Two metrics are in WARN zone: KO+TKO 35.4% (target 30–35%) and Sub 19.8% (target 20–25%). This sprint tunes V4_HP_DAMAGE_MULTIPLIER to bring both within spec."

### PROBLEM
[What is broken, missing, or inadequate? Be specific — no hand-waving.]

Example:
"KO+TKO mean 35.4% is at upper bound. Sub mean 19.8% is below target. Root cause: HP damage multiplier at 130 slightly overshoots stoppage, undershoots submission opportunity."

### EVIDENCE OF PROBLEM
[Concrete data, not intuition.]

Example:
"CAL-029 results: N=400×3 seeds. Seed 42: KO+TKO 32.8%, Sub 21.2%. Seed 99: KO+TKO 39.5%, Sub 17.5%. Seed 7: KO+TKO 33.8%, Sub 20.8%. Mean: KO+TKO 35.37% (WARN, target ≤35%), Sub 19.83% (WARN, target ≥20%)."

### HYPOTHESIZED SOLUTION
[What we believe will fix it and why.]

Example:
"Reduce V4_HP_DAMAGE_MULTIPLIER from 130 to 125 (−5 units). This will reduce KO+TKO by ~1.5pp (toward lower bound) and increase Sub by ~0.8pp (toward target), with minimal cross-impact to other metrics."

### EVIDENCE FOR HYPOTHESIS
[Why we believe this solution is correct.]

Example:
"From CAL-026: KO sensitivity to HP multiplier is ~0.3pp per 10 units change. Sub sensitivity is ~0.4pp per 10 units. A −5 unit change predicts KO+TKO drop to ~33.9% and Sub rise to ~20.2%. See LL-146 for tuning history."

### WHAT (Task List)
| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Modify V4_HP_DAMAGE_MULTIPLIER constant to 125 in constants.toml | data-quality-auditor | sonnet |
| 2 | Run calibration: `pytest --runslow -q` (N=400×3, 3 seeds: 42/99/7) | calibration-tuner | sonnet |
| 3 | Compare CAL-030 results to CAL-029. Evaluate whether KO+TKO ≤35%, Sub ≥20%. | display-stats-fixer | sonnet |
| 4 | If targets met: merge to main. If not: revise hypothesis and re-dispatch. | (human) | — |

### WHERE (Reading Order)
1. CLAUDE.md §Current System State — calibration baseline and tuning history
2. GoG_Roadmap.md §CAL-027/Phase 2 — fatigue anchor work (parallel track)
3. LESSONS_LEARNED.md entries LL-146, LL-140, LL-139 — HP multiplier sensitivity
4. constants.toml — current value and all related constants

### HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|-----------------|
| data-quality-auditor | sonnet | Modify constant, verify no side effects in other tunable values |
| calibration-tuner | sonnet | Execute 3-seed calibration run. Monitor for anomalies. |
| display-stats-fixer | sonnet | Parse results, compare to targets, generate acceptance report. |

### WHEN (Execution Order)
```
Step 1 (constants update)
  → Step 2 (calibration run, ~25 min wall time)
  → Step 3 (results evaluation)
  → Step 4 (decision + merge or re-dispatch)
```

### ADDITIONAL GUIDANCE
- **Tuning guardrails:** Do not adjust HP multiplier beyond 120–135 range without explicit approval (beyond range leads to instability in other metrics).
- **Constant consistency:** Verify that no other code has hardcoded HP multiplier values. Check for "130" in grep. (See AR-10 in LESSONS_LEARNED.)
- **Calibration environment:** Run on clean main (verify with `git status` before starting). Use explicit seed values (42, 99, 7) to match historical runs.
- **Failure mode:** If calibration hangs or crashes, check for workers saturation. May need to reduce N or use sequential mode.

### SUCCESS CRITERIA
1. Constant updated to 125 in constants.toml (verified with grep)
2. Calibration completes: CAL-030 N=400×3 with seeds 42/99/7
3. All 3 seeds produce valid fight statistics (no NaNs, no infinite loops)
4. Results table: KO+TKO mean ≤35.0% AND Sub mean ≥20.0%
5. All other metrics remain within historical bounds (±2pp variance)
6. 6/6 acceptance criteria met → merge to main with message "Calibration: CAL-030 ✓ (HP=125)"
7. Update CLAUDE.md §Current System State with new calibration numbers and baseline
```

### Anti-Pattern Defenses

Do NOT deviate by:
- **"Let me try multiple values in one run"** → No. One tuning variable per dispatch. Measure, evaluate, re-dispatch.
- **"I'll run N=200 to save time"** → No. Use the defined tier (N=400×3 for this phase). Quick checks are for single-parameter tweaks, not multi-seed validation.
- **"I'll skip step 3, the results will speak for themselves"** → No. Explicit evaluation against acceptance criteria is mandatory.
- **"I'll commit the change before calibration finishes"** → No. Sequential: constant change → calibration run → evaluation → decision → commit.

---

## Red Flags (Signs You're About to Deviate)

- "This plan is too detailed, let me just start coding" — The detail is what prevents you from building the wrong thing
- "The user said what to do, I don't need to write a formal plan" — Verbal requests are often ambiguous. Writing clarifies
- "I know how to parallelize this, I don't need to justify each parallel pair" — Unjustified parallelism is the #1 cause of missed dependencies
- "Verification commands are overkill, I'll just eyeball the output" — Objective verification is non-negotiable
- "This task is too small to need a spec" — Small tasks are where miscommunication happens most
- "I'll design as I plan" — You already designed (brainstorming). Now you're sequencing. Keep them separate.

---

## Rationalization Table

| Rationalization | Reality |
|---|---|
| "This plan is too detailed for such a small change" | Detail prevents you from building the wrong thing. Small changes cause the majority of production incidents. |
| "The user wants speed, not a formal plan" | A formal plan saves time. Without it, you build the wrong thing and have to rewrite it. |
| "I know the dependencies already, no need to write them out" | You don't. You're going to discover a dependency you missed halfway through. Writing prevents this. |
| "Verification commands are overkill" | Objective verification is non-negotiable. Without it, you don't know if you're done. |
| "I'll parallelize everything to speed things up" | Parallelism is safe only when there are zero dependencies. Unjustified parallelism causes subtle bugs. |
| "This is so similar to work I did last week, I don't need a plan" | Similarity is where you skip the details and miss the differences. Write the plan. |
| "I'll plan as I code" | Planning during coding means discovering problems after you've built the wrong thing. Rework costs 5–10x more. |

---

## Notes

- **Plan is contract:** Once the plan is approved, deviations require escalation. You don't get to change the plan on the fly without asking.
- **Task granularity:** If a task takes an agent more than 5–10 minutes to understand, it's too coarse. Break it finer.
- **Verification is proof:** A passing verification command means done. No exceptions.
- **Escalate decisively:** If you can't sequence work without dependencies you don't understand, ask. Don't guess.
