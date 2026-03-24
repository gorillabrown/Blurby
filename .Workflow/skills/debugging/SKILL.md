---
name: debugging
description: "Use when something isn't working as expected — before attempting any fix. Trigger: test failure, unexpected behavior, regression, user-reported bug, performance issue, data inconsistency."
---

# Debugging Skill

Debugging is systematic investigation before action. The goal is to find the ROOT CAUSE, not just apply a patch. Debugging proceeds in four phases:

1. **Reproduce** — Confirm the failure deterministically
2. **Isolate** — Find the exact cause
3. **Fix** — Repair the root cause
4. **Verify** — Confirm the fix works and doesn't break anything else

---

## Phase 1: Reproduce (Confirm the Failure)

**What to do:**
1. Reproduce the failure deterministically
   - If you can't reproduce it, you can't fix it
   - "Sometimes fails" → figure out the preconditions that trigger it
2. Capture the exact input, state, and output:
   - What were the inputs to the system?
   - What was the state before?
   - What happened? (actual output)
   - What should have happened? (expected output)
3. Measure the failure (don't just observe it):
   - Quantify: "85% of tests fail" not "tests fail sometimes"
   - Get specifics: seed values, exact error messages, line numbers
4. Create a minimal reproduction case:
   - Can you trigger the bug with simpler inputs?
   - Does it happen on the first call or after repeated calls?
   - Does it happen in isolation or only with certain other systems?

**Example:**
```
Failure: test_fight_engine_ko_rates FAILED

Reproduction:
  Command: pytest test_fight_engine.py::test_fight_engine_ko_rates -s
  Seed: 42
  Input: 20 sample fighters, 100 simulated fights
  Expected output: KO rate 10–15%
  Actual output: KO rate 34.2%
  Error: None (test assertion failure)

Minimal case:
  Can you trigger it with 1 fight? YES
  Can you trigger it with 2 fighters? YES
  Does it happen with a different seed? (testing now)
```

**Verification:**
```
Run: [Exact command that reproduces the failure]
Expected: Failure reproduces consistently
```

**Hard gate:** Do NOT move to Phase 2 until the failure reproduces consistently.

---

## Phase 2: Isolate (Find the Root Cause)

**What to do:**

Use binary search to isolate the failing subsystem:
1. Which module is the bug in?
   - Is it in module A or module B?
   - Narrow by toggling feature flags, removing subsystems
2. Which function is the bug in?
   - Print inputs and outputs at function boundaries
   - Compare actual data flow to expected data flow
3. Which line is the bug in?
   - Use print statements, logging, or debugger
   - Trace the exact value at each step

**Critical principle — Data dominates:**
- Ask "Is the DATA wrong?" before "Is the ALGORITHM wrong?"
- Right data structures → self-evident algorithms (Pike's Rule 5)
- If the data is correct but the result is wrong, the algorithm is the issue
- If the data is wrong, fix the data source (earlier in the pipeline)

**DUAL-PATH CHECK (Critical):**
If the system has multiple code paths for the same operation (e.g., single-item vs batch, legacy vs new feature, different branches), ALWAYS compare both paths:
- Single-item path produces [result A]
- Batch path produces [result B]
- If A ≠ B, you've found the bug

Why: Dual-path divergence is the #1 source of subtle bugs. Each path evolves independently. They drift.

**Example of DUAL-PATH investigation:**
```
System: Engine has TWO ways to apply damage
  Path 1: apply_damage_single() for individual strikes
  Path 2: apply_damage_sequence() for combo sequences

Bug: Single strikes do 100 damage, but identical strikes in a combo do 150.

Investigation:
  Compare Path 1 and Path 2 side by side
  Path 1: damage → apply_base_scaling → apply_position_modifier → apply_fatigue
  Path 2: damage → apply_base_scaling → apply_combo_bonus → apply_position_modifier → apply_fatigue

  FINDING: Path 2 has apply_combo_bonus (2.0x multiplier) that Path 1 doesn't have
  ROOT CAUSE: Combo bonus should NOT apply to identical repeated strikes
  FIX: Add guard in Path 2: only apply combo_bonus if current_action != previous_action
```

**Binary search process:**
```
Test A: Does bug happen if we disable all feature flags?
  YES → bug is in core engine, not features
  NO → bug is in a feature

Test B (assume YES): Is bug in physics module or state machine?
  Disable physics, run test
  YES → bug is in state machine
  NO → bug is in physics

Test C (assume YES from B): Is bug in state initialization or state transitions?
  Print state at each step
  Compare actual state to expected state
  Bug found: state not resetting between rounds
```

**Data Tracing:**
```
Fighter HP: 100 (start)
  → Strike 1 applied: 20 damage
  → Fighter HP: 80 (correct)
  → Fatigue penalty applied: 0.9x multiplier
  → Strike 2 should do 15 damage
  → But Fighter HP shows: 65 (implies 15 damage was done correctly)
  → But strike counter shows 2 strikes at 20 damage each (INCONSISTENT)

ROOT CAUSE: Strike counter is not reading fatigue multiplier
FIX: Counter should call get_actual_damage(), not hardcoded base_damage
```

**Hard gate:**
- Do NOT proceed to Phase 3 until you've isolated the root cause to a specific module, function, or line
- You should be able to say: "The bug is in [FILE] [FUNCTION] at [LINE], and the problem is [SPECIFIC ISSUE]"

---

## Phase 3: FIX (Repair the Root Cause)

**What to do:**
1. Fix the ROOT CAUSE, not the symptom
   - Symptom: KO rate is too high
   - Root cause: HP damage multiplier is 2x what it should be
   - FIX THE ROOT CAUSE (adjust multiplier), not the symptom (clamp KO checks)

2. Make the MINIMUM fix:
   - Change only what's necessary
   - Do NOT refactor surrounding code
   - Do NOT "optimize" while fixing

3. Write a test that would have caught this bug:
   - Before fixing: test should fail
   - After fixing: test should pass
   - This prevents regression

4. Fix the code

**Example:**

```
ROOT CAUSE: In engine_damage.py, apply_damage_strike(),
the fatigue multiplier is applied incorrectly:

BEFORE (WRONG):
  actual_damage = base_damage
  if fighter.fatigue > 0.8:
      actual_damage *= FATIGUE_SCALE  # Applied after damage is assigned
  fighter.hp -= actual_damage

AFTER (CORRECT):
  actual_damage = base_damage
  if fighter.fatigue > 0.8:
      actual_damage *= FATIGUE_SCALE  # Applied before assignment
  fighter.hp -= actual_damage
  # (Same logic, but more important: add test to catch ordering issues)

TEST (before fix):
  def test_fatigue_reduces_damage_correctly():
      fighter = create_fighter(hp=100, fatigue=0.9)
      strike = Strike(damage=20)
      # With fatigue > 0.8, expected damage should be 20 * FATIGUE_SCALE
      apply_damage_strike(fighter, strike)
      expected_damage = 20 * FATIGUE_SCALE
      assert fighter.hp == 100 - expected_damage
```

**Verification:**
```
Run: [Test you wrote above]
Expected: Test passes (confirms the fix)
Run: [Full test suite]
Expected: All tests pass (no regressions)
```

**Hard gate:**
- The fix must make the test pass
- The fix must not break any existing tests
- Do NOT proceed to Phase 4 until both conditions are met

---

## Phase 4: VERIFY (Confirm the Fix)

**What to do:**
1. Reproduce the original failure scenario
   - Use the exact reproduction case from Phase 1
   - Confirm it now works (failure is gone)
2. Run the full test suite
   - All tests must pass
   - No new failures
3. If the project has calibration or benchmarks, run them
   - Confirm metrics are within expected ranges
   - A bug fix might shift metrics (expected) but shouldn't cause wild changes
4. Check for similar bugs in related code
   - The same mistake pattern often appears in multiple places
   - Example: if you found a fatigue multiplier bug in one function, search for fatigue_scale usage elsewhere
   - Fix all instances of the pattern

**Example:**
```
Original failure: test_fight_engine_ko_rates
  BEFORE fix: KO rate 34.2% (vs target 10–15%)
  AFTER fix: KO rate 12.8% (within target ✓)

Regression check:
  pytest -q
  987 passed, 0 failed ✓

Calibration check:
  pytest --runslow -q (N=400x3 seeds)
  Decision: 45% (target 40–47%) ✓
  KO: 12.8% (target 10–15%) ✓
  TKO: 22.5% (target 20–25%) ✓
  Sub: 19.7% (target 20–25%) WARN (was 0.3% before fix, fix improved it)
  Draw: 0.1% (target 0–2%) ✓

Similar pattern check:
  grep "fatigue_scale" *.py
  Found 3 usages, all are correct ✓

Documentation:
  Updated LESSONS_LEARNED.md entry LL-XXX with bug, cause, fix, prevention
```

**Hard gate:**
- Original failure must be fixed
- Full test suite must pass
- Calibration (if applicable) must be in acceptable range
- Similar bugs must be fixed
- Documentation must be updated

---

## Fix Specification Format

When documenting a bug fix, use this format:

```
## Fix: [Title of Fix]

### Root Cause
[What's wrong. File, function, line number. The specific problem.]

Example:
File: engine_damage.py, function apply_damage_strike(), line 237
Problem: Fatigue multiplier applied AFTER hp assignment instead of BEFORE.
Effect: Fatigue reduces raw damage value, but hp loss calculation ignores the reduction.

### Fix
[Before/after code for each change site. Be specific.]

Example:
BEFORE:
  actual_damage = base_damage
  if fighter.fatigue > 0.8:
      actual_damage *= FATIGUE_SCALE
  fighter.hp -= actual_damage

AFTER:
  actual_damage = base_damage
  if fighter.fatigue > 0.8:
      actual_damage *= FATIGUE_SCALE
  fighter.hp -= actual_damage

(Note: Actually, the above is the same. Real fix is slightly different:
  Apply fatigue BEFORE all other modifiers, not after base damage.)

### Invariants to Verify
[Tests/checks that confirm correctness.]

Example:
1. test_fatigue_reduces_damage_correctly() passes
2. test_fatigue_combined_with_position_modifier() passes
3. All 987 regression tests pass
4. Calibration targets: KO 10–15% ✓, TKO 20–25% ✓

### Impact
[Side effects, calibration drift, downstream changes.]

Example:
- Fatigue now correctly reduces damage output
- KO rate drops from 34% to 13% (expected, was inflated due to bug)
- Sub rate unchanged (good, fix was isolated to damage)
- No code in other modules references the old behavior

### Prevention
[What guardrail prevents recurrence.]

Example:
1. Test: test_fatigue_reduces_damage_correctly() ensures fatigue multiplier is applied correctly
2. LESSONS_LEARNED entry: LL-XXX records multiplier application order
3. Code review: Any new fatigue-related changes must be reviewed against this test
```

---

## Red Flags (Signs You're Skipping Diagnosis)

- "I know what's wrong, let me just fix it" — You're guessing. Measure first.
- "It's probably just a typo" — Investigate anyway. Typos often mask deeper issues.
- "I'll fix it and run tests after" — Running tests BEFORE fixing establishes the baseline. Run tests first.
- "The error message tells me what's wrong" — Error messages describe symptoms. Diagnose the root cause.
- "I'll just refactor this section to make it work" — Refactoring is not debugging. Fix the bug first, then refactor.
- "This is too low-level to worry about" — The lowest-level bugs have the highest impact.

---

## Rationalization Table

| Rationalization | Reality |
|---|---|
| "I know what's wrong, I don't need to reproduce it" | You're guessing. Measure first. Guess-driven fixes cause new bugs. |
| "The error message is clear, I don't need to investigate further" | Error messages describe symptoms, not causes. Investigate. |
| "I'll patch the symptom and move on" | Patches are temporary. Root cause fixes are permanent. Patching costs you 5–10x more rework later. |
| "This edge case is too weird to matter" | Weird edge cases are where bugs hide. Test and fix them. |
| "The bug is probably in [module], I'll start there" | Don't assume. Measure. Binary search. You'll be surprised. |
| "I'll refactor and fix at the same time" | No. Fix first (minimal change, proven by test). Then refactor (same behavior, cleaner code). Sequence matters. |
| "I'm confident the fix is right, I don't need to run the full suite" | Confidence without evidence is overconfidence. Run the full suite. |

---

## Notes

- **Measure first:** Pike's Rule 1: "Don't guess where the bottleneck is. Measure first."
- **Root cause only:** Symptoms have multiple causes. Root cause is singular. Find it.
- **Minimal fix:** Small, focused changes are easier to review and less likely to introduce new bugs.
- **Documentation:** Every bug you fix teaches you something. Record it in LESSONS_LEARNED so you don't learn it twice.
- **Prevention:** The best fix is one that prevents the bug from happening again. Write a test.
