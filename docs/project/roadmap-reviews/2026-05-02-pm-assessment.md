# Roadmap Review — Phase B Assessment (2026-05-02 PM)

> Second-pass review on the same day. Uses the morning's review as the baseline. The morning numbers stand except where the EINK-6A landing or the queue state has changed them.

## % Work Remaining (Desktop v2.0 Finish Line)

The Desktop v2.0 conveyor is the only critical path between here and the finish line. The wider remaining-work table from the morning still holds for the broader project, but it includes deferred lanes (APK, Phase 7, Phase 8, MOSS-NANO-13, KOKORO-RETIRE) that are explicitly past the finish line.

### Desktop v2.0 LOE (t-shirts: S=1, M=3, L=8)

| Sprint | LOE | Status |
|--------|-----|--------|
| SK-HYG-1 | S (1) | ✅ complete |
| BRAND-HYG-1 | S (1) | shelved/no-op |
| EINK-6A | M (3) | ✅ complete (v1.75.1, today) |
| EINK-6B | M (3) | dispatch-ready |
| GOALS-6B | M (3) | dispatch-ready |
| POLISH-1 | M (3) | **stub** — Phase D will harden |
| RELEASE-1 | S (1) | **stub** — Phase D will harden |

- **Desktop v2.0 total LOE:** ~15
- **Desktop v2.0 LOE remaining:** 10 (EINK-6B + GOALS-6B + POLISH-1 + RELEASE-1)
- **Desktop v2.0 % remaining:** ~67%

The morning's overall ~25% remaining figure still holds for the broader project (Desktop v2.0 + APK + Cloud Sync + RSS + MOSS-NANO-13 + KOKORO-RETIRE). The Desktop v2.0–only number is what gates the finish line.

## Pace

The morning's pace metrics still apply: 61 sprints / ~127 LOE over 4 weeks → ~31.8 LOE/week.

EINK-6A landed today — adding 1 sprint (M = 3 LOE) to the period. New 4-week roll-forward (Apr 4 → May 2) is functionally equivalent: ~62 sprints / ~130 LOE. Pace is unchanged.

**Required pace to finish Desktop v2.0:**

- Remaining LOE: 10
- At 31.8 LOE/week: ~0.3 weeks → **~2 working days at recent burst velocity**
- Realistic estimate (accounting for stub hardening, design pauses on EINK-6B reading-mode variants, and Stage 3 verification): **2–3 weeks**

## Scope Discipline

Now that the morning's review exists as a baseline, scope discipline can be scored.

### Delta vs morning baseline

| Direction | Items | Notes |
|-----------|-------|-------|
| **Forward** (advances Desktop v2.0) | EINK-6A landing (now in Completed Work Summary) | +1 forward |
| **Sideways** (off-path work) | None detected this afternoon | 0 |
| **Backward** (re-opens prior work) | None | 0 |

Score this afternoon: 1 / (1 + 0 + 0) = **100%** — within review-window-only.

### Cumulative score (Desktop v2.0 conveyor lifetime)

Holding the morning's MOSS-NANO retrospective as the inherited drift:

- **Forward** sprints since v2.0 conveyor was declared: SK-HYG-1, EINK-6A (= 2)
- **Sideways**: 0 since the conveyor was declared (MOSS-NANO closed pre-conveyor and the conveyor explicitly excluded it)
- **Backward**: 0

Conveyor-lifetime score: **100%**. The conveyor as a structural mechanism appears to be working — work landing on it is on-path, and exploration lanes have been kept off.

## Health Signals

| Signal | Morning | Now | Direction |
|--------|---------|-----|-----------|
| Queue depth (dispatch-ready) | 2 | 2 | unchanged (EINK-6A landed, EINK-6B promoted to next-up) |
| Queue color | YELLOW | YELLOW | unchanged — POLISH-1/RELEASE-1 still stubs |
| Length ceiling | 754 | 695 | improved |
| Archive-forward compliance | 1 violation | 0 violations | improved |
| Standing Rules section | exists | exists | unchanged |
| Test count | 2,397 | 2,397 | unchanged |
| Verdict | AT RISK | AT RISK (improving) | one rung shy of ON TRACK |

## Risk Factors (refreshed)

1. **Queue still YELLOW.** The two ship-stage stubs (POLISH-1, RELEASE-1) keep dispatch-ready depth at 2. Hardening them is the single highest-leverage move we can make in Phase D.
2. **EINK-6B mode-variant risk persists.** Stepped Flow and Burst Focus introduce new interaction patterns. Existing FlowScrollEngine assumptions may not hold for chunk-based advance — design iteration is plausible mid-sprint.
3. **POLISH-1 scope uncertainty.** A "small wins bundle" with up-to-six candidate items is a scope-creep magnet. Phase D should narrow to a fixed-count bundle (e.g., "exactly 4 items") with named candidates and a clear non-goals list.
4. **RELEASE-1 versioning timing.** v2.0.0 jump from v1.75.x is large — release notes and CHANGELOG burden is non-trivial. Phase D should size this honestly.

## Overall Verdict: **AT RISK (improving)**

### Reasoning

1. **The morning's diagnosis is intact:** Desktop v2.0 conveyor exists, EINK lane is healthy, and exploration is held off-path. Velocity remains strong.
2. **Queue health is unchanged from morning** — still YELLOW pending POLISH-1 and RELEASE-1 hardening.
3. **The single material delta** (EINK-6A landing) is unambiguously positive: forward progress, archive-forward compliance restored, no new technical debt visible.
4. **Verdict moves to AT RISK (improving)** rather than ON TRACK because POLISH-1 and RELEASE-1 are still stubs. We will only deserve ON TRACK once those skeletons exist with WHERE/Tasks/SUCCESS CRITERIA at the same fidelity as EINK-6B.

### Recommendation

Phase C: keep the existing conveyor sequence (it's still optimal). Phase D: prioritize hardening POLISH-1 and RELEASE-1 from stubs to dispatch-ready skeletons. A scoped POLISH-1 ("exactly 4 wins from the IDEAS.md F/G/I list, named") and a sized RELEASE-1 ("v2.0 versioning, manual smoke checklist, release notes draft") will move queue health to GREEN and verdict to ON TRACK.
