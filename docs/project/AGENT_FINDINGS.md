# Agent Findings Intake Queue — Blurby

This is the centralized intake queue for findings from Blurby specialist agents. Agents write raw findings here; the user and Cowork triage them into `ROADMAP.md` for scoping and implementation.

## Workflow

1. **Agent writes finding** — after investigation, audit, or QA pass
2. **User + Cowork triage** — review findings, assign severity, scope effort, decide priority
3. **Promote to Roadmap** — accepted items get a sprint assignment in `ROADMAP.md`
4. **Mark as triaged** — change status from `NEW` to `TRIAGED → Sprint N` or `DEFERRED` or `WONTFIX`

## Finding Template

```markdown
### [FINDING-ID] Short Title
- **Status**: NEW | TRIAGED → Sprint N | DEFERRED | WONTFIX
- **Source Agent**: agent-name
- **Date**: YYYY-MM-DD
- **Severity**: CRITICAL | SIGNIFICANT | MODERATE | LOW
- **Category**: Electron | React | Format | UX | Performance | Build | Data | Documentation
- **Root Cause**: [Brief root cause or "investigation needed"]
- **Files Affected**: [file1:lineN, file2:lineN]
- **Fix Spec**: [Brief description of required change]
- **Test Impact**: None | New tests needed | Existing tests affected
- **Effort Estimate**: Trivial (<30 min) | Small (1-2 hr) | Medium (half day) | Large (full day+)
```

---

## Active Findings

*(No findings yet — queue will populate as agents execute sprints.)*

---

## Resolved Findings

*(None yet.)*
