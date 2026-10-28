---
name: Simonides (sonnet/Memory)
---

# Memory Guide

**Scope:** Shared memory system for all agents (zeus, aristotle, reviewers, hippocrates, herodotus)

**Purpose:** Enable continuity across agent dispatches, preserve discoveries, and avoid re-investigation of solved problems.

---

## Memory Types

### Type 1: User Memory

Facts about the user's project, preferences, and constraints.

```yaml
memory:
  user_name: "Project Owner"
  project_name: "[CUSTOMIZE: project name]"
  timezone: "US Pacific"
  architecture_rules:
    - "All constants isolated in config file, never hardcoded"
    - "API routes defined in routes/ directory"
    - "Shared utilities live in src/lib/, no duplication across modules"
  preferences:
    - "Prefer Haiku for cheap tasks; Sonnet for focused; Opus for cross-system"
    - "No force-push to main"
    - "Parallel when independent; sequential when dependent"
  escalation_contacts:
    - "High-severity bugs -> report immediately"
    - "Architecture violations -> escalate before fix"
```

**Save location:** `.claude/agents/memory.yaml` (root of project)

### Type 2: Feedback Memory

Lessons from past dispatches. What worked, what didn't.

```yaml
feedback:
  - dispatch_id: "SPRINT-12-wave-a"
    agent: "zeus"
    task: "Coordinate sprint calibration run"
    outcome: "SUCCESS"
    learning: "Parallelizing hippocrates with herodotus saved 30 min"
    next_time: "Always parallel test + docs when independent"

  - dispatch_id: "PERF-3-investigation"
    agent: "aristotle"
    task: "Root-cause API latency spike"
    outcome: "PARTIAL (found blocker, but didn't find fix)"
    learning: "DB connection pool exhaustion under load; needs load test, not code reading"
    next_time: "For behavioral issues, run small load test to validate hypothesis"
```

**Save location:** `.claude/agents/feedback.log` (append-only)

### Type 3: Project Memory

State of the codebase at key milestones.

```yaml
project_milestones:
  - name: "v2.1 Auth Rewrite"
    date: "2026-03-23"
    version: "v2.1.0"
    key_changes:
      - "Migrated from session-based to JWT auth"
      - "Added refresh token rotation"
    test_status: "482/482 PASS"
    phase: "Auth rewrite complete; performance tuning pending"

  - name: "v2.2 Performance Sprint"
    date: "2026-03-24"
    phase: "API latency optimization"
    deliverables_done: [1, 2, 7, 8]
    deliverables_pending: [3, 4, 5, 6, 9, 10, 11, 12, 13]
    blocking_issues: ["DB connection pool sizing under concurrent load"]
```

**Save location:** `.claude/agents/project_milestones.yaml`

### Type 4: Reference Memory

Pointers to solved problems, architectural decisions, and code locations.

```yaml
reference:
  - problem: "API latency reduced from 800ms to 200ms"
    solution: "Added connection pooling and query result caching"
    file: "src/middleware/cache.ts:85"
    constant: "MAX_POOL_SIZE = 20"
    session: "Session 79, 2026-03-24"

  - pattern: "DUAL-PATH BUG"
    description: "Two code paths should behave identically but diverge"
    example: "POST /users had validation; PUT /users did not"
    detection: "Grep for similar function patterns; compare validation logic"
    lesson: "LL-110"

  - architecture: "Request Pipeline"
    components: ["Auth middleware", "Rate limiter", "Route handler", "Response serializer"]
    invariant: "All requests pass through auth middleware before reaching route handlers"
    authority: "Architecture Decision Record #5"
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
source_agent: lead | aristotle | spec-reviewer | etc
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
source_agent: hippocrates
priority: HIGH
---

## Findings from Sprint 12 Calibration

**Dispatch:** Session 79, hippocrates + calibration

**Outcome:** SUCCESS (6/6 PASS, up from Sprint 11 4/6)

**Key Learning:**
Input validation was missing from the PUT endpoint but present on POST. Adding shared
validation middleware to both routes fixed consistency issues across the API surface.

**Next Time:**
When two endpoints serve similar purposes (POST and PUT for the same resource), always
compare middleware chains across both. DUAL-PATH BUG detection: search for divergence.

**Related:** LL-147, LL-110, src/routes/users.ts:40-80
```

### Example: Saving a Reference Memory

```yaml
---
type: reference
timestamp: 2026-03-24T14:32:00Z
session: 79
source_agent: zeus
priority: MEDIUM
---

## Problem: Rate Limiting Not Applied to WebSocket Connections

**Root Cause:** Rate limiting middleware only attached to HTTP routes. WebSocket
upgrade requests bypassed the middleware chain entirely.

**Solution:** Add rate limiting check to WebSocket handshake handler.

**Code Location:** src/middleware/rate-limit.ts:125

**Fix:**
```typescript
// BEFORE:
app.use('/api', rateLimiter);  // HTTP only

// AFTER:
app.use('/api', rateLimiter);
wss.on('connection', (ws, req) => {
  if (!rateLimiter.check(req)) {
    ws.close(1008, 'Rate limit exceeded');
    return;
  }
});
```

**Constant:** None (logic fix, not tuning)

**Session:** Session 78, 2026-03-23 (Investigation by Aristotle agent)

**Related:** LL-145 (middleware audit), ADR-4 (WebSocket architecture)
```

---

## Rules: Save

### Rule 1: Don't duplicate code/git
Never save full code in memory. Save file:line reference instead.

```yaml
# BAD (too much code):
memory: "The function contains 50 lines of complex logic..."

# GOOD:
memory: "See src/middleware/rate-limit.ts:120-160 (checkRateLimit)"
```

### Rule 2: Don't save ephemeral state
Don't save runtime values (intermediate test results, in-flight changes). Save only stable facts.

```yaml
# BAD (ephemeral):
memory: "Test run at 14:32 had 455/482 pass (27 failures)"

# GOOD:
memory: "After session 79 code change, Sprint 12 calibration achieved 6/6 PASS (stable)"
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
memory: "API latency 800ms. Root cause unknown. TBD."

# UPDATED (2026-03-24):
memory: "API latency 800ms (FIXED). Root cause: missing connection pooling and query
caching. Fix applied in v2.2 sprint. See LL-147. New latency: 200ms."
```

### Rule 5: Index everything
Every memory entry must be findable. Include keywords, related LL entries, code locations.

```yaml
keywords: ["rate-limit", "websocket", "middleware", "security"]
related_ll: ["LL-147", "LL-110", "LL-131"]
code_locations: ["src/middleware/rate-limit.ts:125", "src/ws/handler.ts:45"]
architecture: "Request pipeline middleware"
```

---

## Findings Queue

All agents write discoveries to a shared findings queue. Findings are triaged by the lead.

### Finding Structure

```yaml
---
type: finding
timestamp: 2026-03-24T15:30:00Z
session: 79
source_agent: aristotle
status: NEW  # NEW | TRIAGED | IMPLEMENTATION | DEFERRED | WONTFIX
priority: HIGH | MEDIUM | LOW
---

## Finding: Rate Limiting Bypass on WebSocket Connections

**Summary:** Rate limiting middleware is not applied to WebSocket upgrade requests.
Clients can bypass rate limits entirely by using WebSocket connections.

**Evidence:** Load test shows unlimited WS connections accepted while HTTP is properly
throttled. See LL-110 (DUAL-PATH BUG pattern).

**Impact:** Potential abuse vector. API stability at risk under high WS traffic.

**Proposed Fix:** Add rate limit check to WebSocket handshake handler before upgrade.

**Effort:** LOW (1 middleware addition, 1 handler change)

**Acceptance Criteria:**
- [ ] Load test: WS connections rate-limited at same threshold as HTTP
- [ ] Existing WS functionality unaffected (integration tests pass)
- [ ] All 482 tests pass

**Related:** LL-110, LL-131, LL-146, ADR-4
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
| CRITICAL | Architecture violation | "Auth bypassed on internal route" | IMPLEMENT immediately |
| CRITICAL | Regression | "Response time doubled after deploy" | IMPLEMENT this sprint |
| HIGH | Trap triggered | "Hardcoded secret found in source" | IMPLEMENT this sprint |
| MEDIUM | Boundary issue | "Test at concurrency limits fails intermittently" | Implement next sprint |
| LOW | Enhancement | "Consider renaming function for clarity" | DEFER or WONTFIX |

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
archived_reason: "Session 79 complete. No active blockers. Next work in Sprint 13."
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
6. **Always prioritize.** Priority: HIGH/MEDIUM/LOW (impacts zeus triage).
7. **Never assume context.** Memory entries must be readable standalone.
8. **Always close the loop.** When finding moves to IMPLEMENTATION, update memory when complete.

---

## Example: Memory in Action

### Scenario 1: Aristotle Discovers Issue

```
INVESTIGATOR AGENT (Session 79):

Investigating rate limiting bypass...
Found: WebSocket connections skip rate limiter
Saving to memory...

---
type: finding
timestamp: 2026-03-24T15:30:00Z
session: 79
source_agent: aristotle
status: NEW
priority: HIGH
---

## Finding: Rate Limiting Bypass on WebSocket Connections

[Full finding as documented above]
```

### Scenario 2: Orchestrator Receives Finding

```
ORCHESTRATOR AGENT (Session 79, later):

Triage findings from memory queue...

Finding "Rate Limiting Bypass on WebSocket Connections":
- Status: NEW
- Priority: HIGH
- Effort: LOW
- Impact: Security and stability risk

Decision: IMPLEMENT this sprint (Sprint 12 Wave B)
Update: Change status from NEW -> TRIAGED
Dispatch: Implementation agent with fix spec from aristotle
```

### Scenario 3: Implementation Complete

```
IMPLEMENTATION AGENT (Session 79):

Applied fix from aristotle...
Tests: All 482 PASS
Ready to merge.

Update memory:

---
type: finding
timestamp: 2026-03-24T15:30:00Z (ORIGINAL)
session: 79
source_agent: aristotle
status: IMPLEMENTATION  # UPDATED
priority: HIGH
completed_timestamp: 2026-03-24T17:45:00Z
completed_agent: implementation
---

[FINDING COMPLETE: See LL-147, Sprint 12 results, session 79 merge commit]
```

### Scenario 4: Herodotus Updates Memory

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

## Resolved: Rate Limiting Bypass on WebSocket Connections

**Finding:** LL-147
**Sprint:** Sprint 12 (6/6 PASS)
**Code:** src/middleware/rate-limit.ts:125, src/ws/handler.ts:45
**Session:** 79, 2026-03-24
**Impact:** All connection types now rate-limited consistently
```

---

## Memory Query Examples

All agents can query memory. Examples:

```
QUERY 1: "Show all findings with status NEW"
-> Returns findings queue with new discoveries

QUERY 2: "Show solutions to API latency > 500ms"
-> Returns reference memory: "API latency 800ms root cause was missing connection
  pooling. See LL-145. Fix: added pooling in src/db/pool.ts and caching in
  src/middleware/cache.ts."

QUERY 3: "Show feedback on hippocrates efficiency"
-> Returns feedback log: "Parallelizing hippocrates with herodotus saves 30 min.
  Always parallel when independent. See Sprint 11 dispatch."

QUERY 4: "Show all LL entries related to middleware"
-> Returns: LL-90, LL-93, LL-135, LL-140, LL-147 (with brief summaries)

QUERY 5: "Show architecture rules"
-> Returns user memory: [list of project-specific architecture rules]
```
