---
name: code-review-receiving
description: "Use when performing a code review of someone else's changes. Trigger: review requested, code committed, changes to evaluate."
---

# Code Review Receiving Skill

Receiving a code review is how you validate that work meets quality standards before it merges. A good reviewer is independent, skeptical, and thorough.

Trust model: DO NOT trust the implementer's self-report. Verify independently.

---

## Phase 1: Context

**What to do:**
1. Read the review request (the implementer provided this)
   - Scope: what files changed
   - Context: why, design decisions
   - Risks: areas of low confidence
2. Read the original spec/plan
   - What was supposed to be built?
   - What are the acceptance criteria?
3. Read LESSONS_LEARNED or similar project knowledge
   - What traps should you watch for?
   - What patterns does the project follow?

**Questions to answer:**
- What is this code supposed to do?
- Why are they building it this way?
- What are the risks?
- What are the known traps in this area of the codebase?

---

## Phase 2: Tests

**What to do:**
1. Run the full test suite INDEPENDENTLY (don't trust the implementer's output)
   - Use the exact command they specified
   - Verify the results yourself
2. Examine the new tests:
   - Do they test the claimed behavior?
   - Do they test edge cases?
   - Are they well-written (clear intent, good naming)?
3. Check pre-existing tests:
   - Are all pre-existing tests still passing?
   - If any fail, is it expected (per the review request)?
4. Missing tests:
   - Are there cases that should be tested but aren't?
   - Boundary conditions, edge cases, error paths?

**Verification:**
```
Command: [exact test command from review request]
Expected: [N] passed, 0 failed
Actual: [run yourself and confirm]
```

**If tests fail:**
- Is this expected (per the review request)? If YES, acceptable (with explanation in request).
- Is this unexpected? If YES, blocker. Code must not be merged if tests fail.

**Questions to ask:**
- Are all critical paths covered by tests?
- Do edge cases have explicit tests?
- Is test coverage adequate for the changes made?

---

## Phase 3: Calibration (if applicable)

**What to do:**
1. Run calibration independently (if the project has calibration targets)
2. Verify results match the review request
3. Assess impact:
   - Are targets met?
   - Is drift acceptable?
   - Is this aligned with the goal of the change?

**Example:**
```
Review request claims: "5/5 calibration targets PASS"
You run: pytest --runslow -q
You get: 4/6 PASS, 2 WARN (different results!)

Issue: Numbers don't match. Either:
  - Review request was incorrect
  - Your environment is different
  - Code is unstable (results vary between runs)

Action: Investigate. Do NOT accept if results are inconsistent.
```

**If calibration is out of bounds:**
- Is this acceptable per the spec? If NO, blocker.
- Did the implementer explain this? If NOT, blocker (missing context).

---

## Phase 4: Code Analysis

**What to do:**

### Subsection 4A: Architecture Compliance
1. Are there layering violations? (e.g., high-level code calling low-level internals directly)
2. Are data structures used correctly? (e.g., is a dict being accessed like a list?)
3. Are invariants maintained? (e.g., state that should be immutable is being mutated)
4. Is the code integrated into the right place? (not bolted on haphazardly)

### Subsection 4B: Known Traps
1. Consult LESSONS_LEARNED, project constitution, or architecture docs
2. Does this code fall into a known trap?
   - Copy-paste bugs (same logic in multiple places, slight differences)
   - Hardcoding values that should be configurable
   - Mutable shared state
   - Order dependencies (function A must run before function B)
   - Off-by-one errors in loops/indices
3. If a trap is present, it's a blocker (known mistake).

### Subsection 4C: Persistent Rules
1. Does the project have persistent rules? (e.g., "all constants go in constants.toml", "all tests are in test_X.py")
2. Does this code follow them?
3. If rules are violated, it's a blocker.

**Example:**
```
Rule: "All tunable constants must be in constants.toml, never hardcoded"
Found: In new code, V5_VARIANCE_SCALE = 0.15 is hardcoded in engine.py line 342
Severity: CRITICAL BLOCKER
Action: Require the constant be moved to constants.toml

Rule: "Single-item and batch operations must use the same code path (DRY)"
Found: apply_damage_single() and apply_damage_batch() both have fatigue scaling logic
Severity: WARNING (code smell, not blocker, but worth flagging)
Action: Suggest refactoring to shared helper
```

### Subsection 4D: Code Quality
1. Readability: Is the code easy to understand?
   - Variable names are clear?
   - Functions are reasonably sized?
   - Comments explain WHY, not WHAT?
2. Maintainability: Will this be easy to modify later?
   - Is it well-factored (single responsibility)?
   - Are dependencies explicit?
3. Robustness: Does it handle errors?
   - Are edge cases checked?
   - Are preconditions validated?

---

## Phase 5: Output — Structured Review Report

**What to do:**
Produce a structured review report with findings organized by severity:

### Review Template

```
## Code Review: [TITLE]

### Summary
[1–2 sentences: overall impression. Approvable? Does it meet the spec?]

### Critical Blockers
Issues that must be fixed before merge:

**[Issue ID 1]: [Short title]**
- What: [What's wrong]
- Where: [File, line, function]
- Why it matters: [Impact]
- How to fix: [Specific suggestion]
- Evidence: [Code snippet or output]

**[Issue ID 2]: [Short title]**
...

### Warnings (Fix Preferred, Not Required)
Issues that should be fixed but aren't strictly blockers:

**[Issue ID 3]: [Short title]**
- What: [What could be better]
- Where: [Location]
- Why it matters: [Impact]
- Suggestion: [What to do instead]

### Notes (Informational)
Observations that don't require action:

- [Note 1]: [Observation]
- [Note 2]: [Observation]

### Verification
- [ ] Tests run independently, all pass: [N] passed, 0 failed
- [ ] Calibration targets met (if applicable): [results]
- [ ] Pre-existing tests still pass: Yes / No
- [ ] Code follows architecture: [Yes / No / Mostly]
- [ ] No known traps detected: Yes / No ([if No, list them])
- [ ] Persistent rules followed: Yes / No
- [ ] Code quality acceptable: Yes / No
- [ ] Documentation present and current: Yes / No

### Recommendation
- [ ] **APPROVE** — Merge as-is
- [ ] **APPROVE WITH FIXES** — Merge after fixes below
- [ ] **REQUEST REVISION** — Return for rework before re-review
- [ ] **REJECT** — Fundamental issues, restart

### Fixes Required (if APPROVE WITH FIXES)
1. [Fix 1]: [Implementation guidance]
2. [Fix 2]: [Implementation guidance]

After fixes, re-run tests and re-submit for verification.

### Re-Review Notes
[If this is a re-review, note what changed since last review]
- Last findings addressed: [Yes / Partially / No]
- New issues introduced: [List any]
```

---

## Trust Model: You Are Skeptical

Key principle: **Do NOT trust the implementer's claims. Verify independently.**

**Examples:**
```
Claim: "All tests pass"
Action: Run tests yourself. Don't just read the output they provided.

Claim: "No regressions"
Action: Run pre-existing tests independently. Confirm.

Claim: "This follows the architecture"
Action: Read the architecture docs. Verify alignment yourself.

Claim: "Edge cases are handled"
Action: Think of edge cases and look for code that handles them. Don't assume.
```

---

## Red Flags (Signs the Code Isn't Ready)

- Tests don't pass (or output isn't provided)
- Pre-existing tests fail
- Calibration targets aren't met
- Review request is incomplete (missing context, risks aren't identified)
- Known traps are present (and not flagged by the implementer)
- Persistent rules are violated
- Code is hardcoded where it should be configurable
- Duplicate logic (same code in two places)
- No edge case handling
- Documentation is stale or missing

---

## Rationalization Table (For the Reviewer)

| Rationalization | Reality |
|---|---|
| "They said tests pass, I'll trust them" | Run the tests yourself. Trust but verify. |
| "The code looks fine, I don't need to run calibration" | Run calibration. "Looks fine" ≠ "works correctly." |
| "This is a small change, I don't need full review" | Small changes cause the majority of production bugs. Full review every time. |
| "I'll give them the benefit of the doubt on the architecture" | No. Architecture violations compound. Catch them now. |
| "The test output looks good, I won't actually run it" | Run it yourself. Output can be misleading or outdated. |

---

## Approval Criteria

Code is approvable ONLY if:

1. All tests pass (verified by you, not reported)
2. No critical blockers
3. Calibration targets met (if applicable)
4. Architecture is sound
5. No known traps
6. Persistent rules followed
7. Documentation is current
8. Edge cases are covered

If ANY criteria is unmet, do NOT approve. Return for fixes or request revision.

---

## Notes

- **You are the quality gate:** Don't let code through if you're not confident it's correct.
- **Skepticism is your job:** Trust but verify. Verify independently.
- **No shortcuts:** Small changes still get full review. You can't know what's safe without looking.
- **Document your findings:** A clear review is a gift to future reviewers and to the implementer (they learn what quality looks like).
