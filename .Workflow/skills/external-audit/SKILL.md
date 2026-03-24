---
name: external-audit
description: "Use when an independent external review of the project is needed. Trigger: phase completion, major milestone, periodic review, user requests audit, quality gate requires external validation."
---

# External Audit Skill

An external audit is a structured 6-step process where an independent third party reviews the project and provides findings. This skill covers Cowork's role (planning and remediation). The 3rd party handles the review itself.

---

## Step 1: Package Creation (Planning Agent)

**What to do:**

### 1A: Confirm Scope with User
```
"What aspects of the project should the audit cover?"
  Options:
    - Full system: simulation fidelity, architecture, roadmap, docs
    - Specific domain: e.g., just calibration metrics, just code quality
    - Specific phase: e.g., just Phase 5.9 work

"What are the acceptance criteria for the audit?"
  Examples:
    - Identify all blocking issues
    - Grade architecture quality
    - Assess roadmap feasibility
    - Validate calibration approach
```

### 1B: Create Orientation Brief

**Structure:**
```
# Audit Orientation Brief

## Executive Summary
[1 paragraph: What is this project? What stage is it in? What are key uncertainties?]

## Current State
[Status: Which phases complete, which in progress, which queued]
[Major decisions made and their rationale]
[Current metrics and targets]
[Known issues and open questions]

## Architecture Overview
[High-level description of the system]
[Key subsystems and how they interact]
[Data model (what entities, what relationships)]
[Key algorithms and how they govern behavior]

## File Manifest
[Directory structure with annotations]
[Which files contain core logic vs config vs tests]
[Lines of code per module]

## Scope of Audit
[What the auditor should examine]
[What is explicitly out of scope]

## Success Criteria
[What would make this audit valuable?]
[What decisions hang on this audit?]
```

**Example (fictitious):**
```
# Audit Orientation Brief: GameOfGrappling Engine

## Executive Summary
GameOfGrappling is a Monte Carlo simulator for MMA fights. Phase 5 is complete
(core physics, state machine, exchange semantics). Phase 6 (Cognitive runtime)
is in design. Uncertainty: Is the calibration approach sound? Can we achieve
6/6 targets across all fight lengths?

## Current State
- Phases 1-5: COMPLETE (foundation through DSP-4 narration)
- Phase 6: DESIGN (EVM cognitive model)
- Known issues: Block dominance too high (AK-4), KO+TKO at upper bound (35.4% vs 30-35%)
- Latest calibration: CAL-029, 4/6 PASS + 2 WARN

## Architecture Overview
Engine.py (2,415 lines) orchestrates main loop:
- 300-slot temporal model (one slot = ~6 seconds)
- Positional state machine (standing / clinch / ground)
- Per-round skill decay (fatigue)
- Damage pipeline: physical → injury → TKO eligibility
...

[continues with specific technical detail]
```

### 1C: Assemble Audit Package

**Tiered structure:**
```
Tier 1 (Core — must review):
  - Orientation brief (this document)
  - Engine main files (core logic, 2,500 lines)
  - Test results (proof of current state)
  - Calibration baseline (quantitative targets)

Tier 2 (Supporting — should review):
  - Architecture docs (decisions and rationale)
  - Constants.toml (tuning values with history)
  - Lessons learned (discovered issues)
  - Code comments (implementation details)

Tier 3 (Reference — can review):
  - Full codebase (all modules)
  - Test suite (all tests)
  - Historical roadmap (past phases)
  - Benchmark data (raw measurements)
```

**Package assembly:**
```
# Create audit package directory
mkdir -p 6. Outside Audits/OutsideAudit.[N].[YYYY-MM-DD]/

# Copy orientation and docs
cp Orientation_Brief.md 6. Outside Audits/.../
cp CLAUDE.md 6. Outside Audits/.../
cp GoG_Roadmap.md 6. Outside Audits/.../
cp LESSONS_LEARNED.md 6. Outside Audits/.../

# Copy Tier 1 code
cp engine.py engine_*.py 6. Outside Audits/.../
cp test_fight_engine.py 6. Outside Audits/.../

# Create summary of calibration
cp calibration_results.json 6. Outside Audits/.../

# Create symlink or reference to Tier 2/3 (don't duplicate large directories)
ln -s ../../3. Reference 6. Outside Audits/.../Reference
```

### 1D: Exclusion Rules

**Never include in package:**
- `.git/` directory (gives auditor too much history noise)
- `.env` or credential files
- `.vscode/`, IDE config
- `__pycache__/`, build artifacts
- Large datasets or model weights
- `.DS_Store`, temp files
- Node modules or pip cache

**Verification:**
```
find 6. Outside Audits/[AUDIT_DIR] -name ".env" -o -name "*.pyc" -o -name ".git"
  Expected: No results
```

**Hard gate:** Package is clean (no secrets, no noise) before handoff.

---

## Step 2: Handoff (User Action)

**What to do:**
1. User delivers package + orientation brief + auditor instructions to the independent reviewer
2. User specifies:
   - Audit scope
   - Acceptance criteria
   - Timeline
   - How to submit findings

**Cowork's role:** Done for Step 2. Wait for Step 3.

---

## Step 3: Audit Report (3rd Party)

**What to do (3rd party):**
Independent reviewer produces findings across domains:
- Simulation fidelity (do the outputs match MMA reality?)
- Functional correctness (does the code work as intended?)
- Architecture soundness (is it well-designed for future changes?)
- Roadmap/sequencing (are upcoming phases feasible and well-ordered?)
- Documentation (is the project well-documented for future work?)

**Finding format (3rd party specifies, but suggest):**
```
## Finding [ID]: [Title]
Severity: CRITICAL / WARNING / NOTE
Domain: [Simulation fidelity / Functional / Architecture / Roadmap / Docs]

Evidence: [What was examined, what was found]
Impact: [Why does this matter? What could go wrong?]
Recommendation: [How should the project team respond?]
```

**Scoring rubric (example):**
```
1. Simulation Fidelity (1–10)
2. Code Correctness (1–10)
3. Architecture Design (1–10)
4. Testing Adequacy (1–10)
5. Documentation Completeness (1–10)
6. Roadmap Clarity (1–10)
7. Technical Debt (1–10)
8. Scalability (1–10)
9. Maintainability (1–10)
```

**Cowork's role:** Receive report. Proceed to Step 4.

---

## Step 4: Remediation Plan (Cowork + User)

**What to do:**

### 4A: Triage Findings
```
For each finding:
1. Classify: Is this a bug, design issue, or process issue?
2. Assess: How critical is it? (CRITICAL blocks progress, WARNING is important, NOTE is good to know)
3. Localize: Can we fix it in isolation, or does it affect multiple systems?
```

### 4B: Create Response Matrix
```
Finding [ID] | Severity | Disposition | Response | Owner | Timeline
[ID1]        | CRITICAL | ACCEPT      | Will fix with remediation X | [owner] | Sprint N
[ID2]        | WARNING  | DEFER       | Noted for Phase X, not blocking current work | [owner] | Phase X
[ID3]        | NOTE     | ACCEPT_WITH_NARROWING | Will fix but with limited scope | [owner] | Sprint N+1
```

**Disposition options:**
- **ACCEPT:** We'll fix this. No conditions.
- **ACCEPT_WITH_NARROWING:** We'll fix this, but with a narrower scope than auditor recommended.
- **DEFER:** We acknowledge this but will address it in a future phase (explain why deferral is acceptable).
- **REJECT:** We disagree. Explain why.

### 4C: Create Implementation Packages

For each ACCEPT finding, create a remediation package:
```
## Remediation Package: [Finding ID]

Finding: [Restate finding]

Root cause: [Why does this exist?]

Solution: [How will we fix it?]

Files affected: [Which files change?]

Testing strategy: [How will we verify the fix?]

Timeline: [When will this be done?]

Success criteria: [How do we know it's fixed?]

Risk: [Could this fix break anything else?]
```

### 4D: Create Execution Order

```
Phase 1 (Critical fixes): [Findings that block other work]
  → Finding A-001 (code bug)
  → Finding A-003 (architecture violation)

Phase 2 (High priority): [Important but not blocking]
  → Finding A-002 (performance issue)
  → Finding A-004 (documentation gap)

Phase 3 (Lower priority / Deferred): [Important for later]
  → Finding A-005 (design consideration, not yet actionable)
```

**Hard gate:** Every finding has a disposition. No "we'll figure it out later."

---

## Step 5: Auditor Review (3rd Party)

**What to do (3rd party):**
Reviewer evaluates remediation plan:
- Are dispositions justified?
- Are fixes addressing root causes, not symptoms?
- Is execution order sensible?
- Are deferred items truly not blocking?

**Output:** Auditor approval or request for revisions.

**Cowork's role:** Receive auditor feedback. Revise if needed. Proceed to Step 6.

---

## Step 6: Final Decisions (Cowork + User)

**What to do:**

### 6A: Implement Accepted Fixes
1. Create implementation plan per execution skill
2. Dispatch work per planning skill
3. Verify fixes per verification skill
4. Merge per branch-finishing skill

### 6B: Update Documentation
1. Record audit details (date, scope, key findings)
2. Update LESSONS_LEARNED with insights
3. Update CLAUDE.md §Current System State to reflect post-audit status
4. Link to audit findings in project documentation

**Example LESSONS_LEARNED entry:**
```
## LL-XXX: Audit #3 Finding A-001

Finding: Block dominance too high (42–51% of defensive actions). Blocks progression to Phase 6.

Root cause: Evaluator reward for successful block is 0.5, while reward for successful evade is 1.5.
The 3x gap creates pathological block preference.

Fix: Adjusted EVM-1 block reward from 0.5 to 1.2 (narrower gap to evade).

Result: Block dominance dropped to 35%, acceptable range. Other metrics stable.

Prevention: Added test asserting block/evade ratio within bounds. Test fails if dominance drifts.
```

### 6C: Create Audit Closeout Note
```
# Audit #[N] Closeout Note

Audit date: [YYYY-MM-DD]
Auditor: [Organization/Name]
Scope: [What was reviewed]

Findings: [N] total
- [M] CRITICAL (all accepted)
- [K] WARNING ([K] accepted, [J] deferred)
- [L] NOTE ([L] accepted, [L] deferred)

Status: CLOSED
- All CRITICAL findings fixed and verified
- All ACCEPT findings implemented
- All DEFER findings documented in roadmap with timeline

Next steps: [What comes next in the project]

Evidence:
- Audit report: [path]
- Remediation plan: [path]
- Implementation commits: [git hashes]
- Verification results: [test output]

Trigger for next audit:
- Phase [N] completion, OR
- [N] major findings discovered, OR
- [Timeline], whichever comes first
```

**Hard gate:** Audit is not closed until all ACCEPT findings are implemented and verified.

---

## Folder Naming Convention

All audits follow standard naming:
```
6. Outside Audits/
  ├─ OutsideAudit.1.2026-03-16/
  │  ├─ Orientation_Brief.md
  │  ├─ Audit_Report.md
  │  ├─ Remediation_Plan.md
  │  ├─ Audit_Closeout_Note.md
  │  └─ [other audit docs]
  ├─ OutsideAudit.2.2026-03-17/
  │  └─ [docs]
  ├─ OutsideAudit.3.2026-03-23/
  │  └─ [docs]
  └─ ...
```

---

## 6-Step Summary

| Step | Actor | Input | Output | Role |
|------|-------|-------|--------|------|
| 1 | Cowork | Project state | Package + orientation | Plan |
| 2 | User | Package | Auditor receives it | Handoff |
| 3 | Auditor | Package | Audit report | Review |
| 4 | Cowork + User | Report | Remediation plan | Respond |
| 5 | Auditor | Plan | Approval or feedback | Validate |
| 6 | Cowork + User | Approved plan | Fixes implemented | Execute |

---

## Red Flags (Signs You're Conducting an Audit Wrong)

- Package includes `.git/`, secrets, or noise — repackage
- Orientation brief is vague ("the project is about fighting") — be specific
- Remediation plan has findings with no disposition — assign one for every finding
- Auditor feedback is dismissed without explanation — respond to every point
- Fixes are applied but not tested — verification is mandatory

---

## Rationalization Table

| Rationalization | Reality |
|---|---|
| "The audit is too expensive" | Audits prevent expensive mistakes. They pay for themselves. |
| "We don't have time for an audit" | Not auditing leads to discovering problems in production. Auditing earlier is faster overall. |
| "The auditor doesn't understand the project" | That's part of the value. Fresh eyes catch what you missed. |
| "This finding is too minor, we can ignore it" | Minor findings compound. Respond to all. |
| "We'll defer all the findings and fix later" | Deferral is valid only when you can justify why the issue isn't blocking. Defer selectively. |

---

## Notes

- **Independence matters:** Auditor should be external (not team member). Objectivity is the whole point.
- **Structured process:** All 6 steps must happen, in order. No shortcuts.
- **Evidence over opinion:** Every finding needs evidence. "I think there's a problem" is not evidence.
- **Disposition is contract:** Once you accept a finding, you own fixing it. Track it in your roadmap.
- **Audit cadence:** After major milestones (phase completion), or annually, or after major findings, whichever comes first.
