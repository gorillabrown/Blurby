---
name: verification
description: "Use when claiming any work is complete — before marking a task done. Trigger: task completion, phase completion, bug fix, feature implementation, any claim of 'done'. Evidence before claims."
---

# Verification Skill

Verification is the discipline of proving completion. A task is NOT complete until verification evidence exists. "I wrote the code" is not completion. "I wrote the code, all tests pass, calibration is 6/6 PASS, and docs are updated" is completion.

---

## The Verification Checklist

Use this checklist for EVERY completion claim:

### 1. Tests Pass

**What to do:**
1. Run the full test suite for the project
2. Capture the output: test count, pass count, fail count
3. Verify: 0 failures, 0 errors

**Verification command:**
```
[PROJECT_TEST_FULL_COMMAND]
Expected output: [N] passed, 0 failed
```

**Hard requirement:** If ANY test fails, the work is NOT complete. Fix the failing test or regress the change.

**Example:**
```
$ pytest --runslow -q
987 passed, 0 failed, 12 skipped in 23.4s ✓
```

---

### 2. Behavior Matches Spec

**What to do:**
1. Read the specification (brainstorming output, task spec, acceptance criteria)
2. For each requirement in the spec, verify the implementation matches:
   - Does the function signature match? (parameters, return type)
   - Does the output format match? (JSON structure, CSV columns, etc.)
   - Do the constants match? (tuning values should be exact)
   - Does the integration match? (hooks in the right place, called correctly)
3. Compare line by line if necessary

**Example:**
```
Spec requirement: "add constant V5_VARIANCE_MIN = 5.0 to constants.toml"
Verification:
  grep "V5_VARIANCE_MIN" constants.toml
  Output: V5_VARIANCE_MIN = 5.0 ✓

Spec requirement: "integrate damage_realism_variance() into engine.main_fight_loop() after damage application"
Verification:
  Read engine.py, find main_fight_loop()
  Confirm call to damage_realism_variance() exists
  Confirm it's positioned after damage application ✓
```

**If spec and implementation don't match:**
- Either the implementation is wrong (fix it), or
- The spec was unclear (escalate to user)
- Do NOT declare completion if they don't match

---

### 3. No Regressions

**What to do:**
1. Identify tests that existed BEFORE this change
2. Run those tests
3. Verify they still pass
4. If any fail, investigate: did your change cause the failure?

**Verification command:**
```
[PROJECT_TEST_FAST_COMMAND]  (includes pre-existing tests)
Expected: All pre-existing tests pass
```

**Example:**
```
You implemented: new damage variance subsystem
Pre-existing tests affected:
  - test_fight_engine_core.py (uses engine main loop)
  - test_finish_conditions_ko.py (KO logic might be affected by damage changes)

Verify:
  pytest test_fight_engine_core.py test_finish_conditions_ko.py -v
  test_fight_engine_core.py::test_main_loop PASSED ✓
  test_finish_conditions_ko.py::test_ko_at_zero_hp PASSED ✓
  (all others also pass)
```

**Hard gate:** If a pre-existing test fails, your change caused a regression. Fix it or revert the change. Do NOT declare completion.

---

### 4. Edge Cases Covered

**What to do:**
1. Identify the boundary conditions for the work
2. Write tests for them (if not already covered)
3. Verify tests pass

**Example edge cases:**
```
Feature: Damage variance subsystem
Edge cases:
  - Min variance value (5.0)
  - Max variance value (10.0)
  - Variance scale at extremes (0.0, 1.0)
  - Zero base damage
  - Negative inputs (if applicable)
  - Large/extreme inputs

Tests:
  test_variance_at_minimum_bound()
  test_variance_at_maximum_bound()
  test_variance_scale_zero()
  test_variance_scale_one()
  test_zero_base_damage()
  test_negative_inputs_rejected()
  test_large_inputs_handled()

Verify: pytest test_damage_realism.py -v
Result: 7 passed ✓
```

**Hard gate:** Edge cases should be identified and tested. If you skip edge cases, bugs lurk there.

---

### 5. Cross-Tab Math (Data Consistency)

**What to do:**
If your work produces aggregated data (sums, counts, rates, percentages):
1. Verify the aggregate calculations are correct
2. Check that subtotals sum to totals
3. Check that percentages sum to 100% (if they should)
4. Check for off-by-one errors

**Example:**
```
Feature: Fight outcome distribution reporting
Output:
  Decision: 100 fights
  KO: 15 fights
  TKO: 25 fights
  Sub: 20 fights
  Draw: 0 fights
  Total: ??? fights

Verify: 100 + 15 + 25 + 20 + 0 = 160 fights
Expected: Should equal 100 (one outcome per fight)
ERROR: Numbers don't add up. Fix: outcomes are not mutually exclusive in the code.
```

**Verification:**
```
For each aggregate metric:
  - Verify summing logic
  - Spot-check with manual calculation
  - Run test: test_aggregate_consistency() passes
```

---

### 6. Calibration / Benchmarks (if applicable)

**What to do:**
If your project has calibration targets or benchmarks:
1. Run calibration with your changes
2. Verify metrics are within acceptable ranges
3. Document the results

**Verification command:**
```
[PROJECT_CALIBRATION_COMMAND]
Example: pytest --runslow -q
```

**Expected output:**
```
Calibration results:
  Decision: 45% (target 40–47%) ✓
  KO: 12% (target 10–15%) ✓
  TKO: 23% (target 20–25%) ✓
  Sub: 20% (target 20–25%) ✓
  Draw: 0% (target 0–2%) ✓

Status: 5/5 PASS ✓
```

**Hard gate:** If calibration targets are not met, the work is not complete. Tune or escalate.

---

### 7. Documentation Current

**What to do:**
1. Update all documentation that reflects the new state:
   - Code comments (for implementation details)
   - Docstrings (for function signatures and behavior)
   - Project docs (CLAUDE.md, LESSONS_LEARNED, etc.)
   - README (if it exists)
   - Architecture docs (if applicable)
2. Do NOT just update the title — update the detailed sections too
3. Verify no stale references to old behavior

**Example:**
```
You added: damage_realism_variance() function

Documentation updates required:
  1. Code comment in engine.py near the function call
  2. Docstring on damage_realism_variance()
  3. CLAUDE.md §Architecture Summary if architecture changed
  4. LESSONS_LEARNED entry (what you learned)
  5. GoG_Roadmap.md §Phase Status (mark phase/task complete)

Verify:
  - Read CLAUDE.md, confirm new subsystem is documented ✓
  - Read docstring, confirm parameters and behavior described ✓
  - Read LESSONS_LEARNED, confirm entry exists ✓
  - Search for old references, found none ✓
```

**Hard gate:** Documentation must reflect the new code. Out-of-date docs are worse than no docs (they're actively misleading).

---

## Verification Evidence Template

When declaring a task complete, provide evidence using this format:

```
## Task: [TASK_TITLE] — VERIFICATION COMPLETE

### Tests
Command: pytest --runslow -q
Result: 987 passed, 0 failed
Evidence: [output log or screenshot]

### Spec Compliance
Spec: [requirement from plan]
Implementation: [what you built]
Match: ✓ (or ✗ and description of mismatch)

### Pre-Existing Tests
Command: pytest test_engine_core.py test_finish_conditions_ko.py -v
Result: All 47 tests pass
Evidence: [output log]

### Edge Cases
Tests written:
  - test_variance_at_minimum_bound ✓
  - test_variance_at_maximum_bound ✓
  - test_zero_base_damage ✓
  - test_large_inputs_handled ✓

### Calibration (if applicable)
Command: pytest --runslow -q (N=400x3 seeds)
Result: 6/6 targets PASS
Evidence: [results table]

### Documentation
Updated:
  - engine.py docstring ✓
  - CLAUDE.md §Architecture ✓
  - LESSONS_LEARNED entry ✓
  - GoG_Roadmap.md mark complete ✓

### Ready for Merge
All verification criteria met ✓
Task is COMPLETE
```

---

## The NOT-DONE Anti-Pattern

Be ruthless about what counts as "not done":

```
"I wrote the code" → NOT DONE (tests might fail, docs might be stale)
"Tests pass on my machine" → NOT DONE (need to run full suite, confirm no regressions)
"I ran the tests" → NOT DONE (did all 7 checklist items pass?)
"The feature works" → NOT DONE (edge cases? calibration? docs updated?)
"Code review is positive" → NOT DONE (still need to verify via checklist)

DONE = All 7 checklist items ✓
```

---

## Escalation Conditions

If ANY checklist item fails and cannot be fixed:

1. **Tests fail:** Investigate. If it's a regression, fix it. If it's an edge case, add a test. If it's a design issue, escalate.
2. **Spec mismatch:** Either fix the implementation or escalate to user (spec was unclear).
3. **Calibration out of bounds:** Tune or escalate (might need design change).
4. **Documentation incomplete:** Add it. Do NOT skip documentation.

Escalation format:
```
Task: [TITLE]
Blocker: [Which checklist item failed]
Evidence: [Error output, test failure, etc.]
Attempted fix: [What you tried]
Need: [What decision is required to proceed]
```

---

## Red Flags (Signs You're Claiming Completion Too Early)

- "All my new tests pass, so I'm done" — What about pre-existing tests? Edge cases? Integration?
- "The code works on my test case" — Does it work on ALL test cases?
- "I'll update the docs after the code review" — Update them now. Stale docs are worse than no docs.
- "The calibration is close enough" — No. Targets are targets. Tune or escalate.
- "Nobody's complained, so it's probably fine" — Users don't know about failures until they find them in production.

---

## Rationalization Table

| Rationalization | Reality |
|---|---|
| "Tests pass, I'm done" | All 7 checklist items must be verified, not just tests. |
| "The user didn't ask for docs updates" | Docs are part of completion. Stale docs mislead future developers (including you). |
| "Edge cases can be handled later" | Edge cases are where bugs live. Test them now. |
| "This is a minor change, I don't need to run full calibration" | "Minor" changes have broken systems before. Full verification every time. |
| "My code passed review, I'm done" | Review is one signal. Verification checklist is the gate. Both matter. |
| "Calibration is close enough" | Not good enough. Hit the target or escalate. |

---

## Notes

- **Verification is objective:** All checklist items have binary answers (pass/fail, match/mismatch). No "probably fine."
- **Escalate decisively:** If you can't complete verification, don't fake it. Escalate and let the user decide.
- **Documentation is part of the work:** Not an afterthought. Not optional.
- **Regressions are high-priority:** Pre-existing tests failing means your change broke something. Fix it or escalate.
