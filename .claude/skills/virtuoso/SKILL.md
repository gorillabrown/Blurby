---
name: virtuoso
description: >
  Structural execution discipline for multi-step agent tasks. Use this skill whenever
  dispatching a multi-step implementation plan, running a sprint, executing a checklist,
  or performing any work that involves 3+ sequential tool calls. This skill enforces
  task planning, narration, and progress tracking so that behavioral discipline persists
  throughout long execution runs — not just at session start. Trigger on: "execute this plan",
  "run this sprint", "implement these changes", any dispatch prompt with multiple steps,
  or any task where completion quality depends on maintaining focus across many tool calls.
  When in doubt, use this skill — the overhead is minimal and the discipline prevents regressions.
---

# Virtuoso

You are about to execute a multi-step task. This skill keeps you disciplined throughout
the entire run — not just the first few tool calls. The problem it solves: behavioral
rules read at session start get deprioritized under context pressure after 10+ tool calls.
This skill stays in active context because you reference it at every step boundary.

**Announce at start:** "Using the Virtuoso skill to maintain execution discipline."

---

## Phase 1: Load and Understand

Before touching any file or running any command:

1. **Read the full task specification.** If the task references external docs, read those too.
2. **Identify every discrete deliverable.** A deliverable is something you can point to when done
   (a file changed, a test passing, a document updated, a commit made).
3. **Flag anything unclear.** If a step is ambiguous, a file path might be wrong, or a dependency
   might not exist — stop and ask NOW. Guessing wastes 10x more time than asking.

If you have concerns about the plan, raise them before proceeding. Plans are not sacred —
they're starting points. But once you start executing, follow the plan unless you hit a
genuine blocker.

---

## Phase 2: Build the Task Plan

Print a numbered task plan with checkbox markers. Every deliverable from Phase 1 gets a line.
Use these markers consistently throughout:

```
□ = not started
■ = in progress
✓ = completed
✗ = blocked (with reason)
```

### Task format

Every task line follows this format: `□ N. agent-name: Task description [model]`

- **Task #1 is always `lead: Launch lead agent`.** Non-negotiable.
  This is a concrete action, not a formality. Launching the lead means:
  1. The lead agent is spawned (or confirmed active)
  2. It prints the full task plan to confirm it has loaded correctly
  3. It begins dispatching tasks to assigned agents one at a time
  Task #1 is marked ✓ only after the lead has printed the plan and is ready
  to dispatch. Do not skip this step or treat it as implicit.
- Every subsequent task starts with `unassigned:` as a placeholder — Phase 3 replaces
  these with real agent names.
- Each task gets a model annotation in brackets at the end: `[haiku]`, `[sonnet]`, or `[opus]`.

### Model tiers

Annotate each task with the minimum viable model — the cheapest tier that can handle
the task without sacrificing accuracy.

**haiku** — deterministic steps with a known correct answer. Running a test suite,
formatting a file, updating a version number, committing and pushing. Speed and
reliability, not reasoning depth.

**sonnet** — single-domain work requiring judgment within a bounded scope. Writing a
function, tuning a constant, fixing a bug in one module, updating documentation to
match code changes. Domain knowledge but not cross-cutting awareness.

**opus** — work that touches multiple modules, requires understanding interactions
between subsystems, or involves architectural decisions. Root-cause analysis across
files, calibration interpretation, resolving conflicting requirements.

### Example (Phase 2 output — tasks enumerated, agents not yet assigned)

```
## Task Plan
□ 1. lead: Launch lead agent
□ 2. unassigned: Modify calc_defense_effectiveness() — WEIGHT 3.0→2.0  [sonnet]
□ 3. unassigned: Update constants.toml default                          [haiku]
□ 4. unassigned: Run fast test suite — all shards pass                  [haiku]
□ 5. unassigned: Run calibration N=1,200×3 seeds                       [haiku]
□ 6. unassigned: Interpret cal results + decide if tuning needed        [opus]
□ 7. unassigned: Generate profiler snapshot with pathway metrics        [haiku]
□ 8. unassigned: Analyze profiler — does freed space flow to both?      [opus]
□ 9. unassigned: Update CLAUDE.md with constants and cal results        [sonnet]
□ 10. unassigned: Commit, merge to main, push                          [haiku]
```

Also create a TodoWrite to track the same tasks programmatically. The printed plan is for
human readability; TodoWrite is for persistent tracking.

### Rules

- Task #1 is always launching the lead. No exceptions.
- One task per logical deliverable. Don't bundle "edit file AND run tests" into one line.
- **No collapsing tasks into batches or waves.** Every task from Phase 1 stays its own
  numbered line item in the plan. If you need to batch dispatches for practical reasons
  (e.g., tool-count ceilings), that is a dispatch optimization inside Phase 4 — but the
  task plan still tracks each deliverable individually. Never merge tasks like
  "implement tasks 1-6 + write tests" into a single line. Each task is dispatched,
  tracked, and reported on independently.
- If the spec says to do it, it gets a line. Don't silently absorb steps.
- If you discover a new required step during execution, ADD it to the plan and reprint.

---

## Phase 3: Discover and Assign Agents

With the task plan built, the lead now determines who executes each task.
This phase exists because agent discovery should be deliberate — not a checkbox
buried inside planning. The lead needs a complete picture of its workforce
before any work begins.

### The Agent Hierarchy

```
Claude CLI / Cowork
  └── Lead (manage only — zero implementation)
        ├── Hermes  — mechanical execution, known-correct changes
        ├── Hephaestus — single-domain implementation, bounded judgment
        ├── Athena   — cross-system implementation, architectural decisions
        └── Specialists — bounded job descriptions (aristotle, hippocrates, etc.)
```

The lead NEVER does implementation work — not even trivial config edits.
Every implementation task goes to a doer or a specialist. The lead's reasoning
tokens are spent on coordination, not on writing code.

### Step 1: Scan for available agents

Search the project directory for agent definitions. Look in:
- Agent definition files (e.g., `agents/*.md`, sub-agent rosters)
- The Workflow agents directory for default templates
- The dispatch spec or task description for named agents
- Your own toolset — do you have an Agent tool or sub-agent spawning capability?

Build a complete inventory. Don't just check what the spec mentions — discover
everything that's available.

### Step 2: Analyze each agent's intent and model

For every discovered agent, read its definition and extract:
- **Intent**: what is this agent designed to do?
- **Model**: what model does it run on (haiku / sonnet / opus)?
- **Type**: doer (general implementation) or specialist (bounded job)?
- **Tools**: what tools does it have access to?
- **Constraints**: any specializations, limitations, or scoping rules?

Print the roster:

```
## Agent Roster
Doers:
- hermes [haiku] — mechanical execution, prescribed changes. Tools: Read, Edit, Bash.
- hephaestus [sonnet] — single-domain implementation with judgment. Tools: Read, Edit, Bash.
- athena [opus] — cross-system implementation, architectural. Tools: Read, Edit, Bash.

Specialists:
- hippocrates [haiku] — runs test suites, reports pass/fail. Tools: Bash.
- herodotus [sonnet] — updates documentation to match code changes. Tools: Read, Edit.
- aristotle [opus] — read-only root-cause analysis. Tools: Read, Grep, Glob.
- calibration-analyst [opus] — interprets calibration results. Tools: Read, Bash.
```

If doer agents are not defined in the project, the lead can use the Agent tool
with model annotations to dispatch at the appropriate tier. The three doer definitions
exist as templates — the concept (cheap/mid/expensive implementation tiers) applies
regardless of whether the formal agent files are present.

### Step 3: Pair agents to tasks — the routing decision tree

For every task in the plan, walk this tree top-to-bottom. Take the FIRST match.

**1. Specialist match?**
Does a specialist's job description match this task exactly?
- Running tests → **hippocrates**
- Verifying spec compliance → **solon**
- Reviewing code quality → **plato**
- Updating governing docs → **herodotus**
- Diagnosing unknown bug → **aristotle**
- Project specialist exists and matches → **that specialist**

If yes → assign to the specialist. Stop.

**2. Exact diff known?**
Can you write the precise file + old text + new text right now, with zero judgment?
(Config value changes, renames, version bumps, git stage/commit/push, file copies)
→ **hermes**

**3. Single module / single domain?**
Does the doer only need to understand ONE area of the codebase?
(Write a function, fix a known bug, implement a scoped feature, apply a fix spec,
write tests for one module)
→ **hephaestus**

**4. Cross-system / architectural?**
Does the doer need to hold multiple subsystems in mind? Could a change in file A
break file B? (Multi-module refactors, interface changes, pipeline integration,
data flow redesigns)
→ **athena**

**5. When in doubt:** Default to **hephaestus** — it can self-escalate to opus
or report that the task only needed haiku.

**The lead does NOT take implementation tasks as a fallback.** If no doer agent
file exists, dispatch an ad-hoc Agent call at the appropriate model tier.

### Step 4: Print the assignment table

Reprint the task plan with real agent names replacing `unassigned:`. This is the
final plan that governs execution.

```
## Task Plan (delegating — 7 agents available)
□ 1. lead: Launch lead agent
□ 2. hephaestus: Modify calc_defense_effectiveness() — WEIGHT 3.0→2.0  [sonnet]
□ 3. hermes: Update constants.toml default                           [haiku]
□ 4. hippocrates: Run fast test suite — all shards pass                  [haiku]
□ 5. hippocrates: Run calibration N=1,200×3 seeds                       [haiku]
□ 6. athena: Interpret cal results + decide if tuning needed          [opus]
□ 7. hippocrates: Generate profiler snapshot with pathway metrics        [haiku]
□ 8. athena: Analyze profiler — does freed space flow to both?        [opus]
□ 9. herodotus: Update CLAUDE.md with constants and cal results         [sonnet]
□ 10. hermes: Commit, merge to main, push                           [haiku]
```

The header states the execution mode (delegating) and agent count so the human knows
upfront how work will be distributed. Note: the lead only appears on Task #1
(launch). All implementation and specialist tasks go to their assigned agents.

---

## Phase 4: Execute

The lead walks through the task plan in order, dispatching each task to its assigned
agent one at a time. The lead does not do the sub-agents' work — it dispatches,
waits for the result, updates the plan, and moves to the next task.

### Dispatch model

Tasks are dispatched individually, not in bulk. The lead:
1. Takes the next task from the plan
2. Dispatches it to the assigned agent (or executes it directly if assigned to lead)
3. Waits for the result
4. Marks the task ✓ or ✗
5. Reprints the plan
6. Moves to the next task

Independent tasks assigned to different agents may be parallelized — but each task
is still its own dispatch with its own result. Never bundle multiple tasks into a
single mega-dispatch like "implement tasks 1-6." If a sub-agent is unavailable at
execution time, mark the task ✗ (blocked) and report it — don't silently take over.

### Before each action

Print what you're about to do. Use a consistent prefix so the human can scan the log:

```
> Delegating: hephaestus — task #2, modify calc_defense_effectiveness()
> Delegating: hermes — task #3, update constants.toml default
> Delegating: hippocrates — task #4, run fast test suite
> Delegating: athena — task #6, interpret calibration results
```

The prefix tells the human three things: what agent, what task number, and what it does.

### Respect the model annotations

`[haiku]` tasks get executed quickly without extended reasoning. `[opus]` tasks get
deliberate thinking — read the relevant context, think through interactions, and
narrate your reasoning before acting. If a `[haiku]` task turns out to need real
reasoning, update the annotation and note the change.

### During each action

Stay within scope. If you notice something unrelated that needs fixing, note it for later —
don't context-switch. Scope creep is how 30-minute tasks become 90-minute tasks.

### After completing each task

1. Mark the task ✓ in TodoWrite
2. **Reprint the full task plan** with updated markers

This is the most important habit. Reprinting the plan after each task:
- Proves you're tracking progress (not just blazing through tool calls)
- Gives the human a clear snapshot at any interruption point
- Forces you to notice if something got skipped

**The reprinting rule:** After completing each task, reprint the FULL checklist
with a status bar. Not "see above." Not a partial update. The full list with
current markers plus a one-line status bar at the top.

**Status bar format:** `[X% complete] One sentence on current state.`

```
## Task Plan — [30% complete] Fast tests running, code changes landed.
✓ 1. lead: Launch lead agent
✓ 2. hephaestus: Modify calc_defense_effectiveness() — WEIGHT 3.0→2.0  [sonnet]
✓ 3. hermes: Update constants.toml default                           [haiku]
■ 4. hippocrates: Run fast test suite — all shards pass                  [haiku]
□ 5. hippocrates: Run calibration N=1,200×3 seeds                       [haiku]
□ 6. athena: Interpret cal results + decide if tuning needed          [opus]
□ 7. hippocrates: Generate profiler snapshot with pathway metrics        [haiku]
□ 8. athena: Analyze profiler — does freed space flow to both?        [opus]
□ 9. herodotus: Update CLAUDE.md with constants and cal results         [sonnet]
□ 10. hermes: Commit, merge to main, push                           [haiku]
```

### Three-call rule

If you make 3 consecutive tool calls without printing narration text between them,
something has gone wrong. Stop, reorient, and narrate what you're doing and why.
Silent chains of tool calls are where plans go off the rails.

---

## Phase 5: Handle Blockers

When you hit something unexpected:

**STOP executing immediately when:**
- A test fails that the plan expected to pass
- A file or function referenced in the plan doesn't exist
- You're unsure which of two approaches is correct
- The results of a step contradict the plan's assumptions
- You've been working on a single task for significantly longer than expected
- An external dependency is missing or broken
- A sub-agent is unavailable or fails to produce expected output

**What to do when stopped:**
1. Mark the current task ✗ (blocked)
2. Reprint the full task plan showing current state
3. Describe what went wrong in plain language
4. Propose options if you have them, but don't pick one without approval
5. Wait for direction

**Do not:**
- Guess and keep going ("it's probably fine")
- Try a different approach without saying so
- Skip the blocked task and come back later (unless explicitly told to)
- Retry the same thing more than twice
- Silently absorb a sub-agent's task into the lead

---

## Phase 6: Close Out

After all tasks show ✓, print the close-out in this exact order:

1. **Problem / Opportunity / Goal** — 1-2 sentences: what was broken, missing, or
   inadequate before this work started — or what opportunity or goal motivated it.
   Restate from the dispatch spec in plain language.
2. **Solution** — 1-2 sentences: what was done. Name the specific changes (constants
   tuned, functions added, architecture decisions made).
3. **Task Plan — Final Status** — the full task plan with every line ✓ and the status
   bar showing `[100% complete]`. If any line is ✗, explain why.
4. **Agent Utilization Report** — two tables: a summary by agent (quick scan) and
   a detail by task (for tracing specific issues).

   **Table 1 — Agent Summary.** One row per agent. Shows aggregate metrics across
   all tasks that agent handled.

   ```
   ## Agent Utilization — Summary

   | Agent                     | Tasks            | Duration  | Tool Calls | Tokens  |
   |---------------------------|------------------|-----------|------------|---------|
   | lead                      | #1               | 0m 05s    | 1          | 800     |
   | hermes                | #3, #10          | 1m 27s    | 9          | 4,400   |
   | hephaestus               | #2               | 1m 05s    | 6          | 12,800  |
   | athena                 | #6, #8           | 4m 10s    | 12         | 46,600  |
   | hippocrates [haiku]       | #4, #5, #7       | 2m 40s    | 9          | 8,200   |
   | herodotus [sonnet]       | #9               | 0m 45s    | 3          | 5,100   |
   |                           | **Total**        | **10m 12s** | **40**   | **77,900** |
   ```

   **Table 2 — Task Detail.** One row per task. Shows which agent ran it and that
   task's individual metrics. This is where bloat becomes traceable — if one task
   consumed 72 of 132 tool calls, it shows up immediately.

   ```
   ## Agent Utilization — Task Detail

   | #  | Agent               | Task                                    | Duration | Tools | Tokens |
   |----|---------------------|-----------------------------------------|----------|-------|--------|
   | 1  | lead                | Launch lead agent                       | 0m 05s   | 1     | 800    |
   | 2  | hephaestus         | Modify calc_defense_effectiveness()     | 1m 05s   | 6     | 12,800 |
   | 3  | hermes          | Update constants.toml default           | 0m 15s   | 2     | 1,200  |
   | 4  | hippocrates         | Run fast test suite                     | 0m 50s   | 3     | 2,800  |
   | 5  | hippocrates         | Run calibration N=1,200×3 seeds         | 1m 20s   | 4     | 3,600  |
   | 6  | athena           | Interpret cal results + tuning decision  | 1m 30s   | 4     | 18,500 |
   | 7  | hippocrates         | Generate profiler snapshot               | 0m 30s   | 2     | 1,800  |
   | 8  | athena           | Analyze profiler — freed space flow     | 2m 40s   | 8     | 28,100 |
   | 9  | herodotus          | Update CLAUDE.md                        | 0m 45s   | 3     | 5,100  |
   | 10 | hermes          | Commit, merge to main, push             | 1m 12s   | 7     | 3,200  |
   ```

   **Mismatches** — flag after both tables. Note any model annotation that didn't
   match actual complexity, any sub-agent that was unavailable and had to be replaced,
   or any task whose metrics are disproportionate to its tier (e.g., a haiku task
   that consumed more tokens than an opus task).

5. **Performance Recommendations** — based on the utilization data above, recommend
   specific improvements for future runs. Focus on three dimensions:
   - **Tool efficiency**: were there redundant or unnecessary tool calls? Could any
     sequence be collapsed (e.g., multiple reads that could be one, repeated searches)?
   - **Token efficiency**: did any agent consume disproportionate tokens relative to
     its task complexity? Should a model annotation be changed (e.g., a sonnet task
     that only needed haiku, or a haiku task that burned tokens retrying)?
   - **Speed**: which tasks were on the critical path? Could any be parallelized that
     weren't? Were there idle gaps between sequential tasks that could be eliminated?

   Be concrete — name the specific task numbers, agents, and changes. Vague advice
   like "consider parallelizing more" is not useful. Instead: "Tasks #4 and #7 were
   both assigned to hippocrates and ran sequentially, but have no dependency — run
   them in parallel to save ~1m 20s."

6. **Summary** — one paragraph: key results, metrics, anything surprising. Verify
   clean state — whatever "clean" means for the project (tests pass, no uncommitted
   files, documentation updated, etc.)

---

## The Rationalization Table

Before skipping narration, skipping a reprint, or taking a shortcut, check this table.

| What you'll think | Why it's wrong |
|---|---|
| "I'll narrate the next one, this one's trivial" | Trivial actions compound. Skip one, skip ten. |
| "Reprinting the plan again is redundant" | Redundancy IS the point. It's a forcing function. |
| "I know what I'm doing, don't need the checklist" | Confidence without tracking is how steps get skipped. |
| "I'll fix this unrelated thing while I'm here" | Scope creep. Note it, finish the plan, then address it. |
| "This blocker is minor, I can work around it" | Minor blockers become major regressions. Stop and report. |
| "The human can see what I'm doing from the tool calls" | Tool calls show WHAT. Narration shows WHY. Both matter. |
| "I'll just do this quick task myself, not worth delegating" | If it's implementation, delegate it — even trivial config edits go to hermes. Your reasoning tokens are for coordination. |
| "This task needs my full attention to be safe" | Does it? Or does it just need correct inputs and a known procedure? Match agent to actual complexity, not anxiety. |
| "The sub-agent failed, I'll just do it myself" | Mark it blocked, report it, get direction. Don't silently absorb work. |
| "There's no doer agent defined, so I'll do the code work" | Dispatch an ad-hoc Agent call at the appropriate model tier. The lead never writes code, even as a fallback. |

---

## Project-Specific Overlays

This skill provides the generic execution framework. Projects can layer additional
requirements on top without modifying this skill.

**How to add a project overlay:**
In your dispatch prompt or agent brief, add an `EXECUTION RULES` block that references
this skill and adds project-specific constraints. Example:

```
### EXECUTION RULES (Virtuoso + project overlay)
- All rules from Virtuoso skill apply
- Additional: clear __pycache__ after every engine edit
- Additional: run segmented 4-shard test suite, not single pytest command
- Additional: include agent utilization in summary (which sub-agents were used)
```

The overlay inherits everything from this skill and adds to it. The skill handles the
universal execution discipline; the overlay handles project-specific requirements.
