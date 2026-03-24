# Memory Guide

**Scope:** Shared memory system for all agents (orchestrator, investigator, reviewers, test-runner, doc-keeper)

**Purpose:** Enable continuity across agent dispatches, preserve discoveries, and avoid re-investigation of solved problems.

---

## Memory Types

### Type 1: User Memory

Facts about the user's project, preferences, and constraints.

```yaml
memory:
  user_name: "Project Owner"
  project_name: "Game of Grappling (GoG)"
  timezone: "US Pacific"
  architecture_rules:
    - "All constants in constants.toml, never hardcoded"
    - "Positions change ONLY via DC-1 + FRO routing"
    - "Finish gates replicated across all code paths"
  preferences:
    - "Prefer Haiku for cheap tasks; Sonnet for focused; Opus for cross-system"
    - "No force-push to main"
    - "Parallel when independent; sequential when dependent"
  escalation_contacts:
    - "High-severity bugs → report immediately"
    - "Architecture violations → escalate before fix"
```

**Save location:** `.claude/agents/memory.yaml` (root of project)

### Type 2: Feedback Memory

Lessons from past dispatches. What worked, what didn't.

```yaml
feedback:
  - dispatch_id: "CAL-029-wave-a"
    agent: "orchestrator"
    task: "Coordinate calibration run"
    outcome: "SUCCESS"
    learning: "Parallelizing test-runner with doc-keeper saved 30 min"
    next_time: "Always parallel test + docs when independent"

  - dispatch_id: "BM-1-investigation"
    agent: "investigator"
    task: "Root-cause action density too low"
    outcome: "PARTIAL (found blocker, but didn't find fix)"
    learning: "Idle model + cooldown too aggressive; needs simulation, not code reading"
    next_time: "For behavioral issues, run small calibration to validate hypothesis"
```

**Save location:** `.claude/agents/feedback.log` (append-only)

### Type 3: Project Memory

State of the codebase at key milestones.

```yaml
project_milestones:
  - name: "CAL-029 (FI-v2-D calibration)"
    date: "2026-03-23"
    version: "v4.24"
    key_constants:
      V4_HP_DAMAGE_MULTIPLIER: 130.0
      EVM_RISK_TOLERANCE_SCALE: 0.40
    test_status: "962/962 PASS (no slow)"
    phase: "FI-v2-D calibration complete; STAB-1 pending"

  - name: "STAB-1 Wave A"
    date: "2026-03-24"
    phase: "Audit #3 remediation"
    deliverables_done: [1, 2, 7, 8]
    deliverables_pending: [3, 4, 5, 6, 9, 10, 11, 12, 13]
    blocking_issues: ["CEM-04 (dual-source attribute access)"]
```

**Save location:** `.claude/agents/project_milestones.yaml`

### Type 4: Reference Memory

Pointers to solved problems, architectural decisions, and code locations.

```yaml
reference:
  - problem: "KO rate too high"
    solution: "Fatigue modifier in _v4_apply_ko_eligible (LL-147)"
    file: "engine_finish.py:365"
    constant: "V4_KO_ELIGIBLE_FATIGUE_MODIFIER = 0.15"
    session: "Session 79, 2026-03-24"

  - pattern: "DUAL-PATH BUG"
    description: "Two code paths should behave identically but diverge"
    example: "TKO gate had fatigue modifier; KO gate didn't (LL-110)"
    detection: "Grep for similar function patterns; compare modifiers"
    lesson: "LL-110"

  - architecture: "v4 Exchange Pipeline"
    components: ["Gate A (DC-4)", "DC-1 state selection", "FRO", "_v4_snapshot()"]
    invariant: "_v4_snapshot() is sole bridge between FightState and ExchangeResult"
    authority: "Technical Authority §Part V"
```

**Save location:** `.claude/agents/reference.yaml`

---

## How to Save Memory

### Frontmatter Format

All memory entries use YAML frontmatter:

```yaml
---
type: user | feedback | project | reference
timestamp: 2026-03-24T14:32:00Z
session: 79
source_agent: orchestrator | investigator | spec-reviewer | etc
priority: HIGH | MEDIUM | LOW
expires: 2026-04-24 (optional; leave blank if no expiry)
---

[Memory content in markdown or YAML]
```

### Example: Saving a Feedback Memory

```yaml
---
type: feedback
timestamp: 2026-03-24T15:45:00Z
session: 79
source_agent: test-runner
priority: HIGH
---

## Findings from CAL-030

**Dispatch:** Session 79, test-runner + calibration

**Outcome:** SUCCESS (6/6 PASS, up from CAL-029 4/6)

**Key Learning:**
Fatigue modifier missing from KO gate (only in TKO/Sub). Adding fatigue_modifier =
1.0 - (fatigue × 0.15) to _v4_apply_ko_eligible() fixed KO+TKO and Sub boundary issues.

**Next Time:**
When two gates have similar purpose (KO, TKO, Sub all "finish checks"), always
compare modifiers across all three. DUAL-PATH BUG detection: search for divergence.

**Related:** LL-147, LL-110, engine_finish.py:340-380
```

### Example: Saving a Reference Memory

```yaml
---
type: reference
timestamp: 2026-03-24T14:32:00Z
session: 79
source_agent: orchestrator
priority: MEDIUM
---

## Problem: Block Rate 51% (Target 35%)

**Root Cause:** Block reward applied in CLINCH and GROUND (should be Standing-only).
EVM-1 reward table lacked position gating.

**Solution:** Gate reward table by position before softmax.

**Code Location:** engine_evm.py:625 (_apply_evm_defender)

**Fix:**
```python
# BEFORE:
rewards = EVM1_REWARDS  # All 9 actions
action_utils = [rewards.get(action) for action in all_actions]

# AFTER:
valid_actions = get_available_actions_for_position(position)
rewards = {k: v for k, v in EVM1_REWARDS.items() if k in valid_actions}
action_utils = [rewards[action] for action in valid_actions]
```

**Constant:** None (logic fix, not tuning)

**Session:** Session 78, 2026-03-23 (Investigation by Investigator agent)

**Related:** LL-145 (archetype monitor), AK-4 (block dominance trap)
```

---

## Rules: Save

### Rule 1: Don't duplicate code/git
Never save full code in memory. Save file:line reference instead.

```yaml
# BAD (too much code):
memory: "The function contains 50 lines of complex logic..."

# GOOD:
memory: "See engine_finish.py:340-390 (_v4_apply_ko_eligible)"
```

### Rule 2: Don't save ephemeral state
Don't save runtime values (intermediate test results, in-flight changes). Save only stable facts.

```yaml
# BAD (ephemeral):
memory: "Test run at 14:32 had 955/962 pass (7 failures)"

# GOOD:
memory: "After session 79 code change, CAL-030 achieved 6/6 PASS (stable calibration)"
```

### Rule 3: Convert relative dates
Don't use "yesterday," "last week." Always use absolute dates.

```yaml
# BAD:
date: "Yesterday"

# GOOD:
date: "2026-03-24"
timestamp: "2026-03-24T14:32:00Z"
```

### Rule 4: Update outdated memories
If memory is stale, update it with new info. Don't create duplicate entries.

```yaml
# OLD (2026-03-20):
memory: "Block rate 51%. Root cause unknown. TBD."

# UPDATED (2026-03-24):
memory: "Block rate 51% (FIXED). Root cause: position gating missing in EVM-1 reward
table. Fix applied in STAB-1 Wave B. See LL-147. New block rate: target 35%."
```

### Rule 5: Index everything
Every memory entry must be findable. Include keywords, related LL entries, code locations.

```yaml
keywords: ["KO", "fatigue", "finish gate", "eligibility"]
related_ll: ["LL-147", "LL-110", "LL-131"]
code_locations: ["engine_finish.py:365", "engine_evm.py:280"]
architecture: "v4 finish gates"
```

---

## Findings Queue

All agents write discoveries to a shared findings queue. Findings are triaged by the orchestrator.

### Finding Structure

```yaml
---
type: finding
timestamp: 2026-03-24T15:30:00Z
session: 79
source_agent: investigator
status: NEW  # NEW | TRIAGED | IMPLEMENTATION | DEFERRED | WONTFIX
priority: HIGH | MEDIUM | LOW
---

## Finding: KO Gate Missing Fatigue Modifier

**Summary:** _v4_apply_ko_eligible() applies no fatigue modifier, while TKO and Sub gates do.
Causes inverted KO rate across rounds.

**Evidence:** CAL-030 baseline shows KO constant R1-R3 (should decline). BM-1 benchmark
B-35 expects finishing rate to decline R1→R3. See LL-110 (DUAL-PATH BUG pattern).

**Impact:** KO+TKO rate 35.4% (target 30-35%, at upper bound). Sub rate 19.8% (target 20-25%).

**Proposed Fix:** Add fatigue_modifier = 1.0 - (fatigue × 0.15) to ko_prob calculation.

**Effort:** LOW (1 function, 1 constant addition)

**Acceptance Criteria:**
- [ ] CAL-030 run: KO+TKO, Sub both within target bands
- [ ] Benchmark B-35: KO rate declines R1→R3 at p>0.70 correlation
- [ ] All 962 tests pass

**Related:** LL-110, LL-131, LL-146, BM-1
```

### Finding Triage

**Status flow:**
1. NEW: Finding just discovered (agent sends finding)
2. TRIAGED: Orchestrator reviewed; prioritized; assigned agent
3. IMPLEMENTATION: Implementation agent assigned; work in progress
4. DEFERRED: Valid but lower priority; scheduled for future sprint
5. WONTFIX: Reviewed; decided not actionable; reasoning documented

**Orchestrator responsibility:**
- Review all NEW findings daily
- Prioritize by: criticality (architecture violation > regression > nice-to-have)
- Assign to agent or defer with rationale
- Update status and document decision

**Finding priority matrix:**

| Priority | Type | Example | Action |
|----------|------|---------|--------|
| CRITICAL | Architecture violation | "Position changes outside DC-1" | IMPLEMENT immediately |
| CRITICAL | Regression | "KO rate jumped 5pp unintentionally" | IMPLEMENT this sprint |
| HIGH | Trap triggered | "Hardcoded constant found (AR-10)" | IMPLEMENT this sprint |
| MEDIUM | Boundary issue | "Test at limits fails intermittently" | Implement next sprint |
| LOW | Enhancement | "Consider renaming function" | DEFER or WONTFIX |

---

## Memory Hygiene

### Archival Policy

Keep active memories small (<10 MB total). Archive old memories by session:

```
.claude/agents/
  memory.yaml (current session, user constants)
  feedback.log (append-only, ~100 KB)
  reference.yaml (current, ~50 KB)
  archive/
    memory_session_78.yaml (archived)
    memory_session_77.yaml (archived)
    reference_session_78.yaml (archived)
```

### When to Archive

- Session complete AND no forward dependency
- Finding status is WONTFIX (decision final)
- Memory is >6 months old AND no active reference

### Cleanup Rules

Never delete. Append to archive. Keep timestamps for audit trail.

```yaml
---
type: memory
timestamp: 2026-03-24T23:59:00Z
session: 79
archived_timestamp: 2026-03-25T00:00:00Z
archived_reason: "Session 79 complete. No active blockers. Next blocker in STAB-1 Wave C."
---

[Original memory content]
```

---

## Strict Output Rules

All agents sharing memory MUST:

1. **Always timestamp entries.** ISO 8601 format with timezone.
2. **Always cite sources.** File:line, LL number, or session reference.
3. **Never duplicate findings.** Check memory before saving; update existing instead.
4. **Always index.** Keywords, related LL entries, code locations.
5. **Never delete.** Archive instead; preserve full audit trail.
6. **Always prioritize.** Priority: HIGH/MEDIUM/LOW (impacts orchestrator triage).
7. **Never assume context.** Memory entries must be readable standalone.
8. **Always close the loop.** When finding moves to IMPLEMENTATION, update memory when complete.

---

## Example: Memory in Action

### Scenario 1: Investigator Discovers Issue

```
INVESTIGATOR AGENT (Session 79):

Investigating KO rate mismatch...
Found: Block modifier missing from KO gate
Saving to memory...

---
type: finding
timestamp: 2026-03-24T15:30:00Z
session: 79
source_agent: investigator
status: NEW
priority: HIGH
---

## Finding: Fatigue Modifier Missing from KO Gate

[Full finding as documented above]
```

### Scenario 2: Orchestrator Receives Finding

```
ORCHESTRATOR AGENT (Session 79, later):

Triage findings from memory queue...

Finding "Fatigue Modifier Missing from KO Gate":
- Status: NEW
- Priority: HIGH
- Effort: LOW
- Impact: KO+TKO, Sub both at boundary

Decision: IMPLEMENT this sprint (STAB-1 Wave B)
Update: Change status from NEW → TRIAGED
Dispatch: Implementation agent with fix spec from investigator
```

### Scenario 3: Implementation Complete

```
IMPLEMENTATION AGENT (Session 79):

Applied fix from investigator...
Tests: CAL-030 6/6 PASS ✓
Ready to merge.

Update memory:

---
type: finding
timestamp: 2026-03-24T15:30:00Z (ORIGINAL)
session: 79
source_agent: investigator
status: IMPLEMENTATION  # UPDATED
priority: HIGH
completed_timestamp: 2026-03-24T17:45:00Z
completed_agent: implementation
---

[FINDING COMPLETE: See LL-147, CAL-030 results, session 79 merge commit]
```

### Scenario 4: Doc-Keeper Updates Memory

```
DOC-KEEPER AGENT (Session 79):

Updated CLAUDE.md, LESSONS_LEARNED.md, Roadmap...
Created LL-147 entry.

Update memory (reference type):

---
type: reference
timestamp: 2026-03-24T18:00:00Z
session: 79
source_agent: doc_keeper
---

## Resolved: KO Gate Fatigue Modifier

**Finding:** LL-147
**Calibration:** CAL-030 (6/6 PASS)
**Code:** engine_finish.py:365, V4_KO_ELIGIBLE_FATIGUE_MODIFIER = 0.15
**Session:** 79, 2026-03-24
**Impact:** KO+TKO and Sub now within target bands
```

---

## Memory Query Examples

All agents can query memory. Examples:

```
QUERY 1: "Show all findings with status NEW"
→ Returns findings queue with new discoveries

QUERY 2: "Show solutions to block rate > 35%"
→ Returns reference memory: "Block rate 51% root cause is position gating missing
  in EVM-1 reward table. See LL-145, AK-4. Fix: gate by position in _apply_evm_defender."

QUERY 3: "Show feedback on test-runner efficiency"
→ Returns feedback log: "Parallelizing test-runner with doc-keeper saves 30 min.
  Always parallel when independent. See CAL-029 dispatch."

QUERY 4: "Show all LL entries related to fatigue"
→ Returns: LL-90, LL-93, LL-135, LL-140, LL-147 (with brief summaries)

QUERY 5: "Show architecture rules"
→ Returns user memory: [list of 8 project-specific rules]
```

