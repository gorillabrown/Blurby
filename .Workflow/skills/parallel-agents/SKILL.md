---
name: parallel-agents
description: "Use when 2+ independent problems need solving simultaneously. Trigger: independent bugs, parallel investigations, concurrent reviews, any tasks with no data dependencies between them."
---

# Parallel Agents Skill

Parallelism is how you save time when work is truly independent. Parallelism is also how you introduce subtle bugs when you assume independence wrongly.

This skill teaches the discipline of identifying what can truly run in parallel and what must run sequentially.

---

## Rule 1: Parallel When There Are No Data Dependencies

**What this means:**
- Task A and Task B are parallel if: Output of A is NOT input to B, AND output of B is NOT input to A
- If either output feeds into the other, they are sequential

**Examples:**

PARALLEL (no data dependencies):
```
Task 1: Fix typo in function_alpha() docstring
Task 2: Fix typo in function_beta() docstring
→ These don't depend on each other. They can run in parallel.

Task 1: Implement new damage variance subsystem
Task 2: Update documentation (for damage variance)
→ WAIT! Task 2 depends on Task 1 being done (docs reflect new code)
→ Sequential, not parallel
```

---

## Rule 2: Sequential When Outputs Feed Inputs

**What this means:**
- Task A must complete before Task B starts if: B needs A's output

**Examples:**

SEQUENTIAL (Task 1 output is Task 2 input):
```
Task 1: Add V5_VARIANCE_MIN constant to constants.toml
Task 2: Modify engine.py to use V5_VARIANCE_MIN
→ Task 1 must complete first. Task 2 needs the constant to exist.

Task 1: Implement damage_realism_variance() function
Task 2: Write tests for damage_realism_variance()
→ Task 1 must complete first. Task 2 needs the function to exist.

Task 1: Run calibration and produce results
Task 2: Interpret results and decide on next tuning
→ Task 1 must complete first. Task 2 needs the results.
```

---

## Rule 3: Never Parallelize Tasks That Modify the Same Files

**What this means:**
- If two tasks both write to the same file, they MUST be sequential
- Parallel writes to the same file cause merge conflicts and lost changes

**Examples:**

SEQUENTIAL (same file modification):
```
Task 1: Modify engine.py line 100–120 (add variance subsystem)
Task 2: Modify engine.py line 200–230 (add reporting)
→ Both touch engine.py. Must be sequential.

Task 1: Add test_variance_bounds() to test_damage_realism.py
Task 2: Add test_variance_scale() to test_damage_realism.py
→ Both touch the same test file. Must be sequential.
```

PARALLEL (different files):
```
Task 1: Modify engine_damage.py (add variance logic)
Task 2: Modify test_damage_realism.py (add tests)
→ Different files, no data dependency between them.
→ Safe to parallelize (Task 1 completes first, Task 2 can start immediately after).
```

---

## The Parallelism Decision Tree

Use this to decide: parallel or sequential?

```
Question 1: Does Task A produce output that Task B needs as input?
  YES → SEQUENTIAL
  NO → Question 2

Question 2: Does Task B produce output that Task A needs as input?
  YES → SEQUENTIAL
  NO → Question 3

Question 3: Do both tasks write to the same files?
  YES → SEQUENTIAL
  NO → Question 4

Question 4: Does the project have global state or shared config that both tasks modify?
  YES → Probably SEQUENTIAL (requires careful coordination)
  NO → PARALLEL (safe)
```

---

## Multi-Agent Parallel Execution

When work is truly parallel:

**Setup:**
1. Identify all truly independent tasks
2. Dispatch each to a fresh agent instance (one task per agent)
3. Provide each agent with full context (they shouldn't have to read files)

**Execution:**
1. All agents run simultaneously
2. NO shared state between agents (each gets its own copy of context)
3. Agents do not communicate with each other during execution

**Aggregation:**
1. Wait for ALL parallel agents to complete
2. Verify results don't conflict
3. Proceed to dependent work

**Example:**
```
Parallel tasks (no dependencies):
  Agent 1: Fix bug in engine_damage.py (20 min)
  Agent 2: Fix bug in engine_finish.py (15 min)
  Agent 3: Update documentation (10 min)

Dispatch: All three simultaneously
Wait for: All three to complete (max 20 min)
Verify: Results don't conflict in shared files (they don't; different files)
Proceed: To integration testing (depends on all three)
```

---

## Common Parallelism Mistakes

**Mistake 1: Assuming independence when there is a dependency**

```
Task 1: Modify damage formula in constants.toml (add V5_VARIANCE_SCALE = 0.15)
Task 2: Implement damage_realism_variance() function in engine.py

You think: "These are independent, I'll parallelize"
Reality: Task 2 needs the constant from Task 1 to be available
Outcome: Task 2 agent writes code that references a constant that doesn't exist yet
Blocker: Code won't run until Task 1 is done

Lesson: Data dependencies matter. If B needs data from A, they're sequential.
```

**Mistake 2: Modifying the same file in parallel**

```
Task 1: Add variance subsystem to engine.py (lines 300–350)
Task 2: Add reporting subsystem to engine.py (lines 400–450)

You think: "Different line ranges, I'll parallelize"
Reality: Both agents write to engine.py simultaneously
Outcome: Merge conflict. One agent's changes are lost or corrupted
Blocker: Manual conflict resolution required

Lesson: Even different line ranges in the same file can conflict if git sees overlapping hunks.
```

**Mistake 3: Shared global state**

```
Task 1: Initialize a shared cache
Task 2: Populate the cache

You parallelize Task 1 and Task 2
Reality: Task 2 starts before Task 1 finishes initializing
Outcome: Task 2 tries to populate a cache that doesn't exist yet, crashes
Blocker: Initialization race condition

Lesson: Shared state requires sequencing. One task must complete before the other.
```

---

## Verification of Parallelism

Before dispatching parallel work:

1. **Data dependency check:** Does output of A feed into B? Or B into A?
   - If YES → sequential
   - If NO → continue
2. **File conflict check:** Do both tasks modify the same files?
   - If YES → sequential
   - If NO → continue
3. **Global state check:** Is there shared state (config, cache, database)?
   - If YES → consider sequential (unless state is read-only)
   - If NO → continue
4. **Timing check:** Is there any ordering requirement?
   - If YES → sequential
   - If NO → parallel is safe

---

## Parallel + Sequential Hybrid

Many projects have hybrid patterns:

```
Phase A (Sequential):
  Task 1 → Task 2 → Task 3

Phase B (Parallel):
  Task 4a ∥ Task 4b ∥ Task 4c (all three independent)

Phase C (Sequential):
  Task 5 → Task 6
  (Task 5 depends on all Phase B results)
```

**Execution:**
```
1. Task 1 → 2 → 3 (sequential, takes 30 min)
2. Task 4a, 4b, 4c (parallel, max 20 min)
3. Task 5 → 6 (sequential, takes 15 min)
Total: 30 + 20 + 15 = 65 min (vs 30+20+20+15 = 85 min if all sequential)
```

---

## Red Flags (Signs You're Parallelizing Wrongly)

- "These tasks are in different files, so they're independent" — Not necessarily. Check for data dependencies.
- "Task B is waiting for Task A anyway, so I'll start B first" — If B needs A's output, B will fail until A completes. Don't parallelize.
- "I'll coordinate between the agents to manage dependencies" — No. Agents can't coordinate in parallel. Sequential is simpler.
- "The tasks are small, they'll probably finish at the same time" — Timing is unpredictable. If order matters, make it sequential.

---

## Rationalization Table

| Rationalization | Reality |
|---|---|
| "These tasks are independent, I'm sure" | Verify independence explicitly (data check, file check, state check). Don't assume. |
| "If there's a dependency, the agents will just retry" — | No. Retries add delay and complexity. Sequence from the start if there's a dependency. |
| "I'll handle merge conflicts if they happen" | Merge conflicts are a sign of bad planning. If you anticipated them, you should have sequenced. |
| "Parallelism will save time" | Only if tasks are truly independent and take significant time. A 5-minute task doesn't justify the coordination overhead. |
| "One task can start while the other is still setting up" | Maybe. But if the first task needs the second's output, it will block. Better to be explicit about ordering. |

---

## Notes

- **Parallelism requires certainty about independence.** If you're not 100% sure, sequence.
- **Coordination overhead:** Parallelism adds coordination overhead (waiting, aggregating results). For small tasks, sequential is often faster.
- **Debugging is harder:** Parallel bugs are harder to reproduce and fix. Use parallelism only when the time savings justify the risk.
- **Plan determines execution:** If your plan says tasks are parallel, agents run them in parallel. If your plan is wrong, execution fails. Get the plan right.
