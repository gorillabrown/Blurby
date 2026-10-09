# Roadmap Review — Phase B Assessment (2026-06-01)

## Work remaining

Active conveyor (uncompleted): 5 sprints — HEARD-CURSOR-1 (S), APPLYRATECHANGE-COLLAPSE-1 (M), SUBSCRIBER-CURSOR-1 (M, gated/may dissolve), UX-POLISH-1 (L, stub), HYG-XLSX-DASHBOARD-RESTORE (XS, stub). Against the large completed history (68+ sprints), the project is deep into the **TTS Quality + Reading Experience v2** finish line; the narration unification is the last open quality lane before UX polish.

The LOE-weighted % figures on the Dashboard (`B3:H3`) are **not trustworthy** right now (formula remnants stripped — HYG sprint will restore). Do not cite them until HYG-XLSX-DASHBOARD-RESTORE lands.

## Pace

Narration sprints have been landing roughly daily (DIAG-1, INTENT-CURSOR-1, PAUSE-RESUME-UNIFY-1, CURSOR-TRACKING-DIAG-1, A5 position fix — 2026-05-30 → 2026-05-31). Pace is healthy; the constraint is not velocity but **correctness under live-QA** (all narration sprints are shared-core and sequential, so they cannot be parallelized).

## Scope discipline

**Forward.** This review is a scope-*tightening* move, not creep: it inserts a cheap probe (S) that can **close the desync line without** the heavier reducer surgery (M), and makes that surgery contingent. Net expected effort is lower, not higher. The from-scratch-rewrite option (highest blast radius, discards the regression net) was explicitly rejected.

One discipline note: buffer carries **3 full specs + 2 stubs** (depth 5), below the skill's strict "5 full specs" target but at/above CLAUDE.md's mandatory minimum of 3 and consistent with the project's established 3-full-+-2-stub operating pattern. Full-speccing UX-POLISH-1 / HYG now would be cross-lane scope creep while the narration window is sequential and shared-core-locked. **Recommendation:** full-spec UX-POLISH-1 + HYG at the next review, once the narration desync line closes.

## Verdict

Healthy and tightening. Proceed to dispatch NARRATE-HEARD-CURSOR-1.
