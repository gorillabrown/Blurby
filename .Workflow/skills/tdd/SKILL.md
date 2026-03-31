---
name: tdd
description: "Use when writing any code that has testable behavior — which is nearly all code. Trigger: implementing a new feature, fixing a bug, modifying existing behavior, adding a subsystem. RED-GREEN-REFACTOR discipline."
---

# Test-Driven Development (TDD) Skill

TDD is the defensive practice of writing tests BEFORE production code. It prevents bugs, clarifies intention, and provides regression protection. TDD applies to every code change in this project.

The three phases:

1. **RED:** Write a test that fails (it describes what you want to build)
2. **GREEN:** Write minimum production code to make the test pass
3. **REFACTOR:** Clean up the code without breaking tests

---

## Phase 1: RED (Write Failing Test)

**What to do:**
1. Write a test that describes the desired behavior
2. Run the test
3. Confirm it FAILS for the RIGHT reason (not because the test is broken)
4. If the test doesn't fail, your test is wrong — fix the test, not the code

**Test anatomy:**
```python
def test_damage_realism_variance_within_bounds():
    """Verify variance scaling produces results within min/max bounds."""
    variance_scale = 0.15
    min_variance = 5.0
    max_variance = 10.0

    # Arrange: prepare test data
    base_damage = 100.0

    # Act: call the function you haven't written yet
    variance = damage_realism_variance(
        base_damage, variance_scale, min_variance, max_variance
    )

    # Assert: verify the behavior
    assert min_variance <= variance <= max_variance
    assert variance != base_damage  # variance should not be zero
```

**Key principles:**
- One assertion per test (or one logical concept per test)
- Test name describes what is being tested (test_[thing]_[expectation])
- Arrange → Act → Assert (clear structure)
- Test behavior, not implementation (test "variance is in bounds", not "the function calls multiplier three times")

**Verification:**
```
Run: [PROJECT_TEST_FAST_COMMAND]
Expected: Test fails with clear error message
Example: "AssertionError: test_damage_realism_variance_within_bounds failed:
           NameError: name 'damage_realism_variance' is not defined"
```

**Hard gate:** Do NOT move to Phase 2 until the test fails for the right reason.

---

## Phase 2: GREEN (Write Minimum Code)

**What to do:**
1. Write the MINIMUM production code to make the test pass
2. No more. Do not implement the full algorithm. Do not handle edge cases not tested. Do not optimize.
3. Run the test
4. Confirm it PASSES
5. Run the FULL test suite (not just your new test)
6. Confirm all tests still pass (no regressions)

**Example of MINIMUM code (for the test above):**
```python
def damage_realism_variance(base_damage, variance_scale, min_variance, max_variance):
    """Calculate damage variance within bounds."""
    import random
    variance = random.uniform(min_variance, max_variance)
    return variance
```

This passes the test. It doesn't handle negative inputs, doesn't use base_damage or variance_scale, but it PASSES THE TEST. That's the goal.

**Verification:**
```
Run: [PROJECT_TEST_FAST_COMMAND]
Expected: Your new test passes, all existing tests pass
Example output:
  test_damage_realism_variance_within_bounds PASSED
  test_existing_feature_1 PASSED
  test_existing_feature_2 PASSED
  ========================= 3 passed in 0.15s =========================
```

**Anti-pattern:** "I'll implement the full feature and then check if tests pass."
Reality: You're not doing TDD anymore. You're implementing without guidance. You'll discover later that your implementation doesn't match what was needed.

**Hard gate:**
- Your new test MUST pass
- ALL existing tests MUST pass
- Do NOT proceed to Phase 3 if any test fails

---

## Phase 3: REFACTOR (Clean Up)

**What to do:**
1. Look at the code you just wrote
2. Make it clean, maintainable, readable:
   - Extract magic numbers to constants
   - Add docstrings
   - Simplify logic
   - Remove dead code
3. After EVERY change, run the full test suite
4. Confirm tests still pass (refactoring didn't break anything)

**Example refactoring (of the code above):**
```python
# BEFORE (from Phase 2):
def damage_realism_variance(base_damage, variance_scale, min_variance, max_variance):
    import random
    variance = random.uniform(min_variance, max_variance)
    return variance

# AFTER (refactored):
import random

def damage_realism_variance(base_damage, variance_scale, min_variance, max_variance):
    """
    Calculate damage variance with configurable bounds.

    Args:
        base_damage: The baseline damage before variance application.
        variance_scale: Scaling factor (0.0-1.0) controlling variance magnitude.
        min_variance: Minimum variance value (lower bound).
        max_variance: Maximum variance value (upper bound).

    Returns:
        float: Variance value within [min_variance, max_variance].

    Raises:
        ValueError: If min_variance > max_variance.
    """
    if min_variance > max_variance:
        raise ValueError(f"min_variance {min_variance} > max_variance {max_variance}")

    # Scale the variance range based on input parameter
    scaled_range = (max_variance - min_variance) * variance_scale
    adjusted_max = min_variance + scaled_range

    return random.uniform(min_variance, adjusted_max)
```

**Verification:**
```
Run: [PROJECT_TEST_FAST_COMMAND]
Expected: All tests still pass
Example output:
  test_damage_realism_variance_within_bounds PASSED
  test_damage_realism_variance_respects_scale PASSED (NEW)
  test_existing_feature_1 PASSED
  test_existing_feature_2 PASSED
  ========================= 4 passed in 0.18s =========================
```

**Hard gate:**
- Tests must STILL pass after refactoring
- If a test fails, undo the refactoring and investigate
- The test is the guardrail — it prevents refactoring from breaking functionality

---

## TDD Workflow (Full Cycle)

This is the cycle you repeat for every feature or fix:

```
1. RED: Write failing test
   └─ Run test, confirm it fails for the RIGHT reason

2. GREEN: Write minimum code to pass test
   └─ Run test, confirm it passes
   └─ Run full suite, confirm no regressions

3. REFACTOR: Clean up code
   └─ After each change, run full suite
   └─ Stop refactoring when satisfied

4. REPEAT: For next feature
   └─ Start with new failing test
   └─ Repeat cycle
```

**Example:** Implementing a 3-function feature in TDD

```
Feature: Damage Realism Subsystem
├─ Test 1: variance bounds (RED) → Code (GREEN) → Refactor
├─ Test 2: variance respects scale (RED) → Code (GREEN) → Refactor
├─ Test 3: variance integration with engine (RED) → Code (GREEN) → Refactor
└─ Full test suite passes, documentation updated → DONE
```

---

## Test Organization

**One test file per module/concern:**
- `test_engine_core.py` — FightEngine main loop
- `test_damage_realism.py` — Damage variance subsystem
- `test_finish_conditions.py` — KO/TKO/Sub logic
- etc.

**Naming:**
- File: `test_[concern].py`
- Test function: `test_[what]_[expected_behavior]()`
- Fixture: `fixture_[resource_name]()`

**Grouping:**
- Use test classes to group related tests
- Example:
  ```python
  class TestDamageRealism:
      def test_variance_within_bounds(self): ...
      def test_variance_respects_scale(self): ...
      def test_variance_handles_edge_cases(self): ...
  ```

---

## Project Test Commands

**Fast suite** (after every change, ~2-5 minutes):
```
npm test
```

**Full suite** (before merging, ~2-3 minutes):
```
npm test && npm run build
```

---

## Red Flags (Signs You're Abandoning TDD)

- "I'll write the tests after I finish the code" — That's not TDD. You'll find it much harder to test after the fact.
- "This test is too hard to write, the code must be fine" — If it's hard to test, the code design is wrong. Refactor.
- "This is too simple to test" — Simple code still needs tests. Simple tests catch simple bugs.
- "The test I wrote is failing for a weird reason, let me just fix the code" — Stop. The weird failure is a message from the test. Listen.
- "I'll implement the feature and run tests once at the end" — That's implementation-first, not test-first. Rework the approach.
- "All my tests pass, so the code must be correct" — Tests prove what you tested, not what you didn't test. Write more tests for edge cases.

---

## Rationalization Table

| Rationalization | Reality |
|---|---|
| "TDD is slow, I'll just code and test after" | TDD is 2–3x faster long-term. "Testing after" means discovering bugs after the feature is shipped, which costs way more. |
| "I'll write the tests once the feature is done" | Tests written after are always incomplete. Test-first forces you to think about the full behavior. |
| "The test I wrote is too strict" | A failing test is telling you something. Usually, it's that your code is wrong. Listen to the test. |
| "I'll just run the tests once at the end" | By then, you've built 5 things that all depend on the first one. Bug in #1 breaks all 5. Test as you go. |
| "Tests slow down my development" | They slow down initial coding by ~10%. They speed up debugging and maintenance by 10–100x. Net: faster. |
| "This edge case is too weird to test" | Weird edge cases are where bugs hide. Test them explicitly. |

---

## Edge Cases Checklist

For every feature, identify and test:
- **Boundary values:** Min, max, zero, negative, infinity (as applicable)
- **Empty/null:** Empty input, no results, null references
- **Duplicates:** Identical inputs, repeated operations
- **Conflicts:** Contradictory inputs, incompatible states
- **Sequential:** First call vs subsequent calls, initialization state
- **Scale:** Single item vs large batch, tiny values vs huge values
- **Type mismatches:** String instead of int, dict instead of list
- **Integration:** How does this interact with existing code?

---

## Notes

- **Red → Green → Refactor is a discipline.** You follow it even when you're confident in your approach. It's called a discipline because it prevents the errors you can't see.
- **The test is the spec.** The test defines what the code should do. Code is an implementation of the test.
- **Regression protection:** Tests prevent old bugs from coming back. Every bug you find should get a test before you fix it.
- **Confidence through evidence:** A passing test suite is evidence that the code works. Confidence without evidence is overconfidence.
