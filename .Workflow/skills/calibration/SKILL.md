---
name: calibration
description: "Use when the project has quantitative targets that need measurement and tuning. Trigger: after any change to core logic, data, or parameters; when benchmarks need verification; when metrics have drifted; when tuning constants."
---

# Calibration Skill

Calibration is the process of measuring outcomes and tuning parameters to hit targets. It is MEASUREMENT-DRIVEN tuning. Never tune by guessing.

---

## The Tiered Calibration Policy

Not every change requires the same calibration level. Use tiers to match effort to risk.

### Tier 1: Full Calibration

**When to use:**
- New mechanics or subsystems
- Constant tuning (multiple parameters changed)
- Multi-system changes (core logic rewritten)
- Calibration gate for production/phase completion

**Run:**
```
Blurby does not have a traditional calibration suite. Use the performance benchmarks:
  Command: npm run perf
  Wall time: ~2-3 minutes
  21 automated benchmarks covering critical paths
```

**Output:**
- Metrics table (every target)
- Per-seed results (confirm consistency)
- Pass/Warn/Fail classification

**Acceptance gate:**
- All targets PASS, OR
- Acceptable WARN (≤2 targets, within 1–2pp of bounds)

### Tier 2: Quick Check Calibration

**When to use:**
- Targeted single-parameter fix (e.g., adjust one constant)
- Small energy/damage tweak
- Regression after Tier 1 fix

**Run:**
```
Quick check — run test suite only:
  Command: npm test
  Wall time: ~30-60 seconds
  860+ tests across 43 files
```

**Output:**
- Quick metrics check (key targets only)
- Single-seed result (spot check for direction of change)

**Acceptance gate:**
- Metrics move in expected direction
- No unexpected regressions in other metrics

### Tier 3: None (Tests Only)

**When to use:**
- Display-only changes (formatting, UI)
- Stats-only changes (calculations, output format)
- Data-only changes (constants with no logic change)
- Documentation-only changes

**Run:**
```
Tests only — no calibration:
  Command: npm test
  Wall time: ~30-60 seconds
```

**Output:**
- Test pass/fail count
- Regression check only (no calibration)

**Acceptance gate:**
- All tests pass
- No regressions

---

## Decision Tree: Which Tier?

```
Question 1: Does this change affect the probability distribution of outcomes?
  NO → Tier 3 (tests only)
  YES → Question 2

Question 2: How many parameters are you changing?
  1 parameter → Tier 2 (quick check)
  2+ parameters or mechanics → Tier 1 (full)
  YES → Question 3

Question 3: Is this a production gate / phase completion gate?
  YES → Tier 1 (full)
  NO → Tier 2 (quick check acceptable)
```

---

## Tuning Workflow

This is how you adjust constants to hit targets.

### Phase 1: Measure Current State

**What to do:**
1. Run calibration at current tier
2. Record baseline metrics
3. Compare to targets
4. Identify which metrics are off

**Example:**
```
Current calibration (Tier 1):
  Decision: 42% (target 40–47%) — PASS
  KO: 18% (target 10–15%) — FAIL (too high)
  TKO: 19% (target 20–25%) — WARN (slightly low)
  Sub: 12% (target 20–25%) — FAIL (too low)
  Draw: 1% (target 0–2%) — PASS

Off-target metrics:
  1. KO is 3pp too high (18 vs 10–15 range)
  2. TKO is 1pp too low (19 vs 20–25 range)
  3. Sub is 8pp too low (12 vs 20–25 range)
```

**Hard gate:** Do NOT proceed to tuning until you've identified which metrics are off and by how much.

### Phase 2: Identify Which Parameter Controls Each Metric

**What to do:**
For each off-target metric, identify which parameter(s) control it:

```
Metric: KO (too high)
  Parameters that affect KO:
    - V4_KO_ELIGIBLE_BASE_PROB (directly controls KO threshold)
    - V4_KO_ELIGIBLE_DAMAGE_SCALE (scaling based on damage)
    - V4_HP_DAMAGE_MULTIPLIER (more damage = higher KO rate)

  Most sensitive: V4_HP_DAMAGE_MULTIPLIER (1 point change ≈ 3pp KO change)

Metric: Sub (too low)
  Parameters that affect Sub:
    - V4_TRACK_DRAIN_MULTIPLIER (fatigue wears down submission)
    - EVM_ATK_SUB_BASE (attacker preference for submission)
    - Positional opportunities (how often grappler gets position for sub)

  Most sensitive: EVM_ATK_SUB_BASE (1 point change ≈ 4pp sub change)
```

**Sensitivity testing (if unsure):**
```
Test 1: Change V4_HP_DAMAGE_MULTIPLIER by ±5
  Measure: Does KO change? By how much?
  Record: Sensitivity coefficient

Test 2: Change EVM_ATK_SUB_BASE by ±1
  Measure: Does Sub change? By how much?
  Record: Sensitivity coefficient
```

**Hard gate:** Know which parameter controls which metric. Do NOT tune blindly.

### Phase 3: Adjust One Parameter at a Time

**What to do:**
1. Select one off-target metric
2. Identify the most sensitive parameter for that metric
3. Calculate required adjustment:
   ```
   Current value: 138
   Current metric: 18% (target 10–15%)
   Sensitivity: 3pp per 1-unit change
   Adjustment needed: (18 - 12.5) / 3 ≈ -1.8 units → try -2 units
   New value: 138 - 2 = 136
   ```
4. Update the constant
5. Re-measure (Tier 2 quick check is sufficient)
6. Observe the direction of change

**Example:**
```
Tuning arc: V4_HP_DAMAGE_MULTIPLIER
  Start: 138 (KO = 18%, Sub = 12%)
  Adjustment 1: 138 → 135 (KO down to 15%, Sub still low)
  Adjustment 2: 135 → 130 (KO = 12%, Sub = 18%, closer!)
  Adjustment 3: 130 → 128 (KO = 11%, Sub = 20%, both in range!)
  Final: 128 (both targets passed)
```

**Hard gate:** One parameter at a time. Changing multiple parameters simultaneously obscures which one caused the effect.

### Phase 4: Re-Measure After Each Adjustment

**What to do:**
1. Run calibration (Tier 2 quick check minimum)
2. Measure new metrics
3. Confirm direction of change (moving toward target or away?)
4. Update baseline

**Example:**
```
After adjustment (V4_HP_DAMAGE_MULTIPLIER 138 → 135):
  Decision: 41% (was 42%, slight decrease expected)
  KO: 15% (was 18%, good, moving toward target 10–15%)
  TKO: 21% (was 19%, unexpected, moved away from previous)
  Sub: 16% (was 12%, moving toward target 20–25%)

  Analysis: Good progress on KO and Sub. TKO moved away — possibly coupled.
  Next: Measure TKO sensitivity to HP multiplier in isolation.
```

**Hard gate:** After each adjustment, measure. Do NOT apply multiple adjustments and measure once at the end (you won't know which adjustment had which effect).

### Phase 5: Stop When Targets are Passing

**What to do:**
1. When all off-target metrics are now within target range, STOP
2. Do NOT continue adjusting to "optimize" passing metrics
3. Run Tier 1 full calibration to confirm stability across seeds

**Why STOP?**
- Each adjustment has risk (you might introduce new problems)
- Passing metrics are passing — they're done
- Further tuning is chasing noise, not signal
- Risk: You'll break something else

**Example:**
```
Before tuning:
  KO: 18% (FAIL) — off by 3pp
  Sub: 12% (FAIL) — off by 8pp

After tuning (V4_HP_DAMAGE_MULTIPLIER: 138 → 128):
  KO: 11% (PASS, within 10–15%)
  Sub: 20% (PASS, within 20–25%)

Decision: STOP. Targets are met.
Do NOT adjust further to make KO exactly 12.5% (perfect center).
```

**Hard gate:** Resist the urge to optimize passing metrics. Done is done.

---

## Constant Tracking

**What to do:**
1. All tunable constants must be in a central config file (constants.toml, config.json, etc.)
2. NEVER hardcode a constant in logic
3. NEVER capture a constant in a frozen dataclass at module load time (it can't be changed)
4. Every constant must have:
   - A name
   - A current value
   - A comment explaining what it controls
   - A tuning history (if it's been tuned)

**Example (constants.toml):**
```
# Damage Pipeline

## HP and Damage Scaling
V4_HP_DAMAGE_MULTIPLIER = 128.0
  # Controls raw damage output. Higher = more damage, higher KO rate.
  # Tuning history: 138 (CAL-025) → 93 (CAL-026, experiment) → 130 (CAL-027 base)
  # → 128 (CAL-029, target KO/Sub both PASS)
  # Sensitivity: ~3pp KO per 1-unit change, ~4pp Sub per 1-unit change
  # Note: Cross-correlated with TKO rate (1pp increase KO ≈ 0.5pp TKO)

V4_KO_ELIGIBLE_BASE_PROB = 0.018
  # Base probability of becoming KO-eligible after a single strike.
  # Lower = harder to KO. Only tune if KO targets systematically drift
  # after HP_DAMAGE_MULTIPLIER tuning is complete.
```

**Hard gate:** All constants documented. New constants have explanations.

---

## Calibration Results Documentation

After calibration, document:

```
## CAL-[N]: [Descriptive Title]

Date: YYYY-MM-DD
Tier: 1 (full) / 2 (quick) / 3 (tests)

### Parameters Adjusted
- V4_HP_DAMAGE_MULTIPLIER: 130 → 128
- (others if multiple)

### Results
| Metric | Seed 42 | Seed 99 | Seed 7 | Mean | Target | Status |
|--------|---------|---------|--------|------|--------|--------|
| Decision | 42% | 45% | 41% | 42.7% | 40–47% | PASS |
| KO | 11% | 12% | 10% | 11.0% | 10–15% | PASS |
| TKO | 21% | 22% | 20% | 21.0% | 20–25% | PASS |
| Sub | 20% | 21% | 19% | 20.0% | 20–25% | PASS |
| Draw | 0% | 0% | 1% | 0.3% | 0–2% | PASS |

**Overall: 5/5 PASS** ✓

### Changes from CAL-[N-1]
- Decision: ±0.5pp (no change, stable)
- KO: +0.3pp (expected, HP multiplier reduced)
- Sub: +2.5pp (expected, inverse of KO)
- Others: ±0.2pp (noise margin)

### Interpretation
Target reduction in HP damage multiplier (138→128) achieved desired KO
reduction without over-correcting. Sub rate recovered (was 12% pre-tuning).
All metrics now within bounds. Recommend freeze current constants for
Phase 6 work.

### Next Steps
- Phase 6 (Cognitive Runtime) can proceed. No blocking calibration issues.
- Monitor metrics during Phase 6 integration for unexpected drift.
```

---

## Red Flags (Signs You're Tuning Wrong)

- "I'll change multiple constants and measure once at the end" — Change one at a time. Measure after each.
- "Calibration results are close enough, I'll tune more next sprint" — No. If targets aren't met, tune now.
- "The constant is hardcoded in the logic" — Move it to the config file. Hardcoding prevents tuning.
- "I don't know which parameter controls this metric" — Find out before tuning. Test sensitivity.
- "I'll optimize all metrics to be perfectly centered in the target range" — No. Passing is passing. Stop.

---

## Rationalization Table

| Rationalization | Reality |
|---|---|
| "I'll guess which parameter to adjust" | You'll guess wrong. Measure sensitivity first. |
| "Changing two constants at once saves time" | No. You won't know which one caused the effect. Takes longer to debug. |
| "The target is just guidance, I can be close" | Targets exist for a reason. Hit them, or escalate why you can't. |
| "This constant has been stable, I don't need to document it" | Documentation is for future developers and future you. Document everything. |
| "I'll skip full calibration and just run a quick check" | If you're at a gate (phase completion, production), run full. Don't cut corners. |

---

## Notes

- **Measurement first:** Pike's Rule 1: "Don't guess where the bottleneck is. Measure first."
- **One parameter at a time:** Multi-variable tuning is chaos. Single-variable is diagnostic.
- **Targets exist for a reason:** They're the specification. Hit them.
- **Passing metrics are done:** Resist the urge to optimize. More tuning = more risk.
- **Constant tracking is essential:** Without it, you can't reproduce results or understand what changed.
