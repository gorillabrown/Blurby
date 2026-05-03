# Roadmap Review — Phase Brief: Desktop v2.0 Completion + MOSS-NANO Productization (2026-05-02 PM)

> Supersedes the morning's `2026-05-02-phase-brief.md`. The phase scope expanded to include the MOSS-NANO productization track per both 3rd-party audits.

## Phase Name & Goal

**Desktop v2.0 Completion + MOSS-NANO Productization** — Ship a feature-complete polished Blurby desktop application AND record a provenance-backed MOSS-NANO productization decision (`PAUSE_NANO_PRODUCTIZATION`, `NANO_EXPERIMENTAL_ONLY`, or `NANO_RECOMMENDED_OPT_IN`) against a hardened evidence gate that no longer accepts hand-authored boolean JSON.

## Sprints in Conveyor Belt Sequence

| Seq | Sprint | Title | Skeleton Status |
|-----|--------|-------|-----------------|
| ✅ 1 | SK-HYG-1 | Roadmap Hygiene & Queue Recovery | Complete |
| ✅ 2 | EINK-6A | E-Ink Foundation & Greyscale Runtime | Complete (today) |
| 3 | EINK-6B | E-Ink Reading Ergonomics & Mode Strategy | Eager (existing, full spec) |
| 4 | GOALS-6B | Reading Goal Tracking | Eager (existing, full spec; parallel-safe with 3) |
| 5 | MOSS-NANO-13a | Real Sidecar Adapter | **Eager (new this afternoon, full WHERE/Tasks/SUCCESS CRITERIA, 2-wave split)** |
| 6 | MOSS-NANO-13b | Engine Hardening + Strategy Invariants | **Eager (new this afternoon, full spec)** |
| 7 | MOSS-NANO-13c | Live Evidence Schema + Producer + Gate Validation | **Eager (new this afternoon, full spec, 2-wave split)** |
| 8 | MOSS-NANO-13d | Audit Memo Reframing & Default-Engine Posture | Stub — spec at Stage 3 mid (after 13c) |
| 9 | MOSS-NANO-13e | Live Capture Run + Decision | Stub — spec at Stage 3 mid (after 13d) |
| 10 | POLISH-1 | Desktop Small-Wins Bundle | Stub — spec at Stage 3 close |
| 11 | RELEASE-1 | Desktop v2.0 Release Baseline | Stub — spec at Stage 3 close |

## Lessons-Applied Summary

- All 10 Standing Rules walked against MOSS-NANO-13a, 13b, 13c. No deviations or waivers — every applicable rule is embodied in the skeleton.
- LL-031 (Generation ID Pattern for Stale Async Results) called out specifically in 13b — the bug being fixed there is precisely a generation-ID-pattern miss in `setContinuityScope`.
- Standing Rules section in `ROADMAP.md` unchanged — no new universally-applicable rules surfaced. Sprint-specific lessons stay inline.
- Two sprints (13a and 13c) explicitly carry pre-split wave declarations in their specs per Standing Rule 10 (40 tool-use ceiling).

## Dependencies Into This Phase

- **From morning:** SK-HYG-1 ✅, EINK-6A ✅. Standing Rules section established. Active conveyor structurally healthy.
- **From audits (2026-05-02):** Both third-party audit responses converge on three blocking changes (real adapter, machine-produced evidence schema with provenance, evidence producer). All three are now folded into 13a + 13c, with 13b absorbing the related engine/strategy invariant fixes.
- **From investigation:** Audit response §10 identifies seven specific scope changes (items 1–7) and two governance hygiene items (items 8–9). All seven scope changes are sequenced into 13a–e; both governance items are subsumed by Phase D's pre-registration of the sprint track in `SPRINT_QUEUE.md` and its inline appearance in `ROADMAP.md`.

## Dependencies Out of This Phase

- **Desktop v2.0 → KOKORO-RETIRE:** Even a `NANO_RECOMMENDED_OPT_IN` decision from 13e does NOT auto-retire Kokoro. Kokoro retirement gates remain separately governed.
- **Desktop v2.0 → APK track:** No change. APK still blocked on its own investigation gates.
- **Desktop v2.0 → Cloud Sync / RSS:** No change. Both deferred post-v2.0.
- **Desktop v2.0 → Qwen Streaming:** No change. ITERATE decision from QWEN-STREAM-4 stands; next streaming iteration deferred post-v2.0.

## Exit Criteria (revised)

1. EINK-6B + GOALS-6B landed.
2. MOSS-NANO-13a–e landed: real sidecar adapter shipped, engine hardened, evidence schema v2 with provenance enforced by gate, evidence producer built, live capture run executed, decision recorded in `MOSS_DECISION_LOG.md`.
3. POLISH-1 landed: ≥4 small UX wins from IDEAS.md (final selection informed by MOSS-NANO-13e decision — e.g., onboarding affordance for `NANO_RECOMMENDED_OPT_IN` may roll into POLISH-1).
4. RELEASE-1 landed: v2.0.0 versioned, full test suite green, clean build artifacts, release notes written reflecting MOSS-NANO decision posture.
5. Sprint queue depth ≥3 maintained (or replenished from post-v2.0 backlog).

## Estimated Phase Duration

**~4–6 weeks** at sustained velocity, accounting for:

- EINK-6B: ~2–3 days (new reading-mode variants)
- GOALS-6B: ~2–3 days (renderer-only, parallel with EINK-6B)
- MOSS-NANO-13a: ~5–7 days (real systems work — subprocess + Python adapter)
- MOSS-NANO-13b: ~2–3 days (bounded fixes with explicit edit sites)
- MOSS-NANO-13c: ~5–7 days (new tool category + schema design + gate refactor + test rewrite)
- MOSS-NANO-13d: ~1 day (governance edits)
- MOSS-NANO-13e: ~2–3 days (run + decision; possible expansion if PROMOTE branch)
- POLISH-1: ~2–3 days (bounded small wins)
- RELEASE-1: ~1 day (verification + versioning)

Phase D pre-split work (waves for 13a and 13c) reduces the risk of mid-sprint dispatch ceiling hits by ~30–40%.

## Top Risks

1. **MOSS-NANO-13a — sidecar adapter is real systems work.** Spawning Python from Electron main, framing stdin/stdout, handling crashes, lifecycle on app shutdown, zombie reaping. Largest discrete unknown in the conveyor. L (8) estimate could expand if subprocess lifecycle quirks surface during integration.
2. **MOSS-NANO-13c — schema + producer + gate refactor.** Three coupled deliverables in one sprint. The schema design must anticipate v3 evolution; the producer must work end-to-end against the integrated app; the gate must reject legacy boolean JSON without breaking unrelated tests. Risk of mid-sprint scope discovery.
3. **MOSS-NANO-13e decision branch.** Three possible outcomes:
   - `NANO_RECOMMENDED_OPT_IN` → settings UX surface needed (likely folded into POLISH-1, possibly its own sprint).
   - `NANO_EXPERIMENTAL_ONLY` → status quo; no further MOSS work in v2.0.
   - `PAUSE_NANO_PRODUCTIZATION` → investigation sub-sprint needed before re-running 13e. This branch is not currently sized; contingent +M if it fires.
4. **EINK-6B reading-mode variants.** Carried forward from morning's risk register. Stepped Flow + Burst Focus introduce new interaction patterns; FlowScrollEngine assumptions may not cleanly support chunk-based advance.
5. **Stub hardening pressure.** POLISH-1 and RELEASE-1 are deferred to Stage 3 close. If MOSS-NANO sub-sprints take longer than estimated, the phase pause to harden them risks compressing.

## Recommendation Going Forward

1. Dispatch EINK-6B next (queue position 3, eager skeleton, no MOSS dependency). GOALS-6B is parallel-safe and can dispatch alongside.
2. Once EINK-6B and GOALS-6B land, dispatch MOSS-NANO-13a. Plan Wave A (implementation + tests) and Wave B (verify + docs + git) explicitly at dispatch time.
3. Sequence 13b sequentially after 13a (engine + strategy share files; cannot parallelize).
4. Sequence 13c after 13b (producer needs hardened engine + strategy to capture meaningful events).
5. At 13c close, write 13d eager skeleton.
6. At 13d close, write 13e eager skeleton.
7. At 13e close, write POLISH-1 + RELEASE-1 eager skeletons informed by 13e's decision.
