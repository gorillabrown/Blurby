---
name: code-review-requesting
description: "Use when code changes are complete and need independent review. Trigger: implementation finished, tests pass, ready for review."
---

# Code Review Request Skill

Requesting a code review is how you signal completion AND hand off for quality assurance. A good review request contains everything the reviewer needs, so they don't have to dig through files or context.

---

## The Review Request Format

When submitting work for review, provide:

### 1. Scope

**What to include:**
- Which files changed
- How many lines (additions/deletions)
- A 1–2 sentence summary of what the changes do

**Example:**
```
### Scope
Files changed:
  - engine_damage.py (47 lines added, 3 modified)
  - engine.py (1 line modified)
  - test_damage_realism.py (78 lines added, NEW file)
  - constants.toml (3 lines added)

Summary: Added damage variance subsystem. Calculates variance in damage output
within configurable bounds, scaled by fighter fatigue. Integrated into engine
main loop after damage application.
```

### 2. Context

**What to include:**
- Which spec/plan this implements (reference the spec, don't repeat it)
- Any design decisions made during implementation
- Why certain approaches were chosen
- Any deviations from the original spec (if any)

**Example:**
```
### Context
Implements: Planning Spec §Task 1–3 (Damage Variance Subsystem)
Spec: /path/to/GoG_Roadmap.md §Phase 5.9

Design decisions:
- Used random.uniform() for variance distribution (simple, testable) vs
  other options considered: normal distribution (more realistic but slower),
  lookup table (faster but less flexible)
- Integrated variance into apply_damage_strike() rather than creating a
  separate post-processing pass (earlier integration avoids double calculations)

No deviations from spec.
```

### 3. Test Results

**What to include:**
- Full test suite pass count
- Any new tests added
- Any tests that are newly passing (if this is a bug fix)
- Any unexpected test behavior

**Example:**
```
### Test Results
Command: pytest --runslow -q
Result: 1,034 passed, 0 failed, 12 skipped in 24.1s

New tests added:
  - test_variance_within_bounds() ✓
  - test_variance_respects_scale() ✓
  - test_variance_integration_with_engine() ✓
  - test_variance_edge_cases() ✓

Regression check: All pre-existing tests pass ✓
```

### 4. Calibration Results (if applicable)

**What to include:**
- Calibration command run
- Results (metrics against targets)
- Any changes from previous calibration
- Whether targets are met

**Example:**
```
### Calibration
Command: pytest --runslow -q (N=400×3 seeds)

Results:
| Metric | Mean | Target | Status |
|--------|------|--------|--------|
| Decision | 45.2% | 40–47% | PASS |
| KO | 12.1% | 10–15% | PASS |
| TKO | 22.8% | 20–25% | PASS |
| Sub | 20.1% | 20–25% | PASS |
| Draw | 0.1% | 0–2% | PASS |

Overall: 5/5 PASS ✓
Change from CAL-028: KO down 0.4pp (expected, variance reduces outliers)
```

### 5. Self-Identified Risks

**What to include:**
- Parts of the code you're least confident in
- Edge cases you're worried about
- Integration points that might be fragile
- Performance hotspots (if applicable)

**Example:**
```
### Self-Identified Risks

**Low confidence:**
- Variance scaling formula in damage_realism_variance() uses variance_scale
  parameter. Sensitivity testing shows this is stable across 3 seeds, but
  wanted to flag for review.

**Edge cases:**
- Zero base_damage: handled (returns valid variance between min/max)
- Negative variance_scale: rejected with ValueError
- variance_scale > 1.0: clamped to 1.0 (acceptable, but verify this matches intent)

**Integration fragility:**
- Called from engine.main_fight_loop() after damage application. Sensitive to
  call ordering. If this moves, tests should catch it (test exists).
```

### 6. Review Focus

**What to include:**
- What you most want the reviewer to examine
- Specific areas of concern
- What you're asking the reviewer to validate

**Example:**
```
### Review Focus
Please verify:
1. Variance scaling formula is mathematically sound (constants are correct)
2. Integration into engine.main_fight_loop() is at the right position and doesn't
   break state invariants
3. Edge case handling is complete (test coverage adequate)
4. Documentation (docstring, CLAUDE.md, LESSONS_LEARNED) is accurate and complete
5. No performance impact (variance calculation happens once per strike, should be negligible)

Areas where I want extra scrutiny:
- The variance_scale parameter (I'm unsure about the clamping behavior)
- Integration with existing damage multipliers (is variance applied in the right order?)
```

---

## Complete Review Request Template

```
## Code Review Request: [TITLE]

### Scope
Files changed:
  - [file1] ([X] lines)
  - [file2] ([Y] lines)
  ...

Summary: [1–2 sentences]

### Context
Implements: [Spec or plan reference]
Link: [path/to/spec]

Design decisions:
- [Decision A]: [choice made] vs [alternatives considered]
- [Decision B]: [choice made] vs [alternatives considered]

Deviations from spec:
- [None] or [specific deviation + justification]

### Test Results
Command: [exact test command]
Result: [N] passed, 0 failed

New tests:
  - test_X ✓
  - test_Y ✓

Regression check: [All pre-existing tests pass / [N] pre-existing tests affected]

### Calibration
[If applicable]
Command: [calibration command]
Results: [table or summary]
Status: [All targets PASS / [N] targets WARN / [N] targets FAIL]

### Self-Identified Risks
**Confidence:**
- [Area of low confidence + why]

**Edge cases:**
- [Edge case] — [how it's handled]

**Integration:**
- [Integration point] — [why it might be fragile]

### Review Focus
Please verify:
1. [Key area 1]
2. [Key area 2]
3. [Key area 3]

Extra scrutiny on:
- [Specific area]
- [Specific area]

### Documentation
Updated:
- [ ] Docstrings
- [ ] Code comments
- [ ] Project docs (CLAUDE.md, etc.)
- [ ] Roadmap (phase marked complete)
- [ ] LESSONS_LEARNED (entry added)

### Ready for Review
- [ ] All checklist items above completed
- [ ] Verification skill checklist passed
- [ ] No TODOs or FIXMEs in new code
```

---

## Red Flags (Signs Your Review Request Is Incomplete)

- "I'll fill in the context later" — Do it now. Reviewers shouldn't have to ask.
- "Test results are... I ran them, trust me" — Provide actual output. "Trust me" is not evidence.
- "I didn't update the docs" — Update them before submitting for review.
- "No deviations from spec" — Confirm this explicitly. Don't assume.
- "I'm not sure about [area]" — Say so in Self-Identified Risks. Don't hide concerns.

---

## Rationalization Table

| Rationalization | Reality |
|---|---|
| "The reviewer can figure out the context from the code" | No. Context should be explicit. Implicit context is missed. |
| "I'll submit without complete test results, they can re-run tests" | Reviewers shouldn't have to. You've already run them. Provide output. |
| "Documentation isn't part of code review" | It is. Outdated docs mislead future developers. Review includes docs. |
| "My concerns aren't important enough to mention" | Surface your concerns. That's what Self-Identified Risks is for. Better to flag it than hide it. |
| "I did verify the spec compliance, but I'll skip listing it" | List it. Explicit is better than implied. Gives the reviewer confidence. |

---

## Notes

- **Explicit beats implicit:** Everything the reviewer needs should be in the request. No file digging, no "it's in the code if you look."
- **Risk transparency:** The more you surface your own concerns, the better the review will be.
- **Context is your job:** You've been working on this. You know the context. Provide it. Don't make the reviewer figure it out.
- **Verification first:** Don't request review until the verification checklist passes. You'd be wasting the reviewer's time.
