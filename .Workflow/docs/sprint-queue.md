# Sprint Queue

**Purpose:** A conveyor belt of ready-to-dispatch sprint specs. Copy the next sprint from this file, paste it into CLI, and execute. After a sprint completes, remove it from the queue and backfill so the queue always has ≥3 sprints.

**Standing rule:** This queue must contain at least 3 un-dispatched sprints at all times. If the queue drops below 3 after a sprint completes, the next planning session must replenish it before any new execution work begins.

**Format:** Each sprint below is a complete dispatch spec using the CLI Evergreen Template (`docs/sprint-dispatch-template.md`). Sprints are ordered top-to-bottom by priority — the next sprint to run is always at the top.

---

## How to Use

### Grabbing the Next Sprint
1. Open this file
2. Copy everything between the first `---` separator and the next one (the entire top sprint block)
3. Paste into CLI as the dispatch prompt
4. Execute

### After a Sprint Completes
1. **Remove** the completed sprint from this file (delete the entire block)
2. **Log** the completion in CLAUDE.md (sprint ID, date, outcome, key metrics)
3. **Check queue depth** — if fewer than 3 sprints remain, flag for planning
4. **Backfill** — next planning session must add sprints until queue ≥ 3

### Adding New Sprints
1. Complete the planning skill (`skills/planning/SKILL.md`)
2. Generate a dispatch spec using the CLI Evergreen Template
3. Append the new sprint to the **bottom** of this file (queue is FIFO)
4. Verify the sprint has all REQUIRED sections filled

### Queue Health Check
Run this check at the start of every session:

```
SPRINT QUEUE STATUS:
Queue depth: [number of sprints in queue]
Next sprint: [sprint ID and title]
Health: [OK if ≥3 / WARNING if 2 / CRITICAL if ≤1]
Action needed: [None / Plan 1 more sprint / Plan 2+ sprints before executing]
```

---

## Queue

> **Instructions:** Place complete sprint dispatch specs below, separated by `---`. Each sprint must follow the CLI Evergreen Template format. The top sprint is next to execute.
>
> When a sprint completes: delete its block, shift everything up.
> When planning produces a new sprint: append it to the bottom.

---

<!-- NEXT SPRINT — Copy from here to the next --- separator -->

```
[Paste complete dispatch spec here using the CLI Evergreen Template format]

## [SPRINT-ID] [WAVE] — [Short Description]

### KEY CONTEXT
...

### PROBLEM
...

### EVIDENCE OF PROBLEM
...

### HYPOTHESIZED SOLUTION
...

### WHAT (Tasks to Complete)
| Step | Task | Agent | Model |
|------|------|-------|-------|
| ... | ... | ... | ... |

### WHERE (Read in This Order)
1. ...

### HOW (Agent Assignments)
| Agent | Model | Responsibility |
|-------|-------|----------------|
| ... | ... | ... |

### WHEN (Execution Order)
...

### ADDITIONAL GUIDANCE
...

### SUCCESS CRITERIA
1. ...
```

---

<!-- SPRINT 2 — Next in line after the above completes -->

```
[Next sprint dispatch spec]
```

---

<!-- SPRINT 3 — Third in queue -->

```
[Third sprint dispatch spec]
```

---

## Completed Sprints (Recent History)

> **Instructions:** When removing a completed sprint from the queue above, log a one-line summary here. Keep the last 10 completions for context. Archive older entries to LESSONS_LEARNED or a sprint history file.

| Sprint ID | Completed | Outcome | Key Result |
|-----------|-----------|---------|------------|
| _example_ | _2026-03-24_ | _PASS 6/6_ | _Decision rate 42%, KD 0.21/fight_ |

---

## Queue Rules

1. **Minimum depth: 3.** If queue < 3, planning takes priority over execution.
2. **FIFO order.** Sprints execute top-to-bottom. No skipping unless a sprint is explicitly blocked (mark it with `⛔ BLOCKED: [reason]` and move to bottom).
3. **No partial specs.** Every sprint in the queue must have all REQUIRED sections from the CLI Evergreen Template filled. Incomplete specs stay in ROADMAP.md until ready.
4. **One sprint in flight at a time.** Do not pull the next sprint until the current one is complete, verified, and removed from the queue.
5. **Backfill immediately.** After removing a completed sprint, check depth. If < 3, the next session starts with planning, not execution.
6. **Doc-keeper owns queue maintenance.** After sprint completion, doc-keeper removes the sprint, logs the summary, and checks queue depth.
