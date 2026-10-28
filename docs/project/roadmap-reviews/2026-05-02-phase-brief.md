# Roadmap Review — Phase Brief: Desktop v2.0 Completion (2026-05-02)

## Phase Name & Goal

**Desktop v2.0 Completion** — Ship a feature-complete, polished Blurby desktop application with E-Ink independence, reading goals, brand finalization, and a UX polish pass.

## Sprints in Conveyor Belt Sequence

| Seq | Sprint | Title | Skeleton Status |
|-----|--------|-------|-----------------|
| 1 | SK-HYG-1 | Roadmap Hygiene & Queue Recovery | Eager skeleton (new) |
| 2 | EINK-6A | E-Ink Foundation & Greyscale Runtime | Eager skeleton (existing, full spec) |
| 3 | EINK-6B | E-Ink Reading Ergonomics & Mode Strategy | Eager skeleton (existing, full spec) |
| 4 | GOALS-6B | Reading Goal Tracking | Eager skeleton (existing, full spec) |
| 5 | POLISH-1 | Desktop Small Wins Bundle | Stub — spec at Stage 2 close |
| 6 | RELEASE-1 | Desktop v2.0 Release Baseline | Stub — spec at Stage 2 close |

## Lessons-Applied Summary

- All 10 Standing Rules reviewed against each active skeleton.
- No updates needed — existing specs already embody relevant lessons.
- Standing Rules section added to ROADMAP.md for first time (10 rules from LESSONS_LEARNED.md Persistent Rules table).

## Dependencies Into This Phase

- **From prior work:** All prerequisites are met. TTS-7D (required by EINK-6A) completed at v1.32.0. No blocking dependencies from any active lane.
- **From roadmap review:** SK-HYG-1 must complete first (archive lingering specs, commit brand, update queue) before CLI dispatch of EINK-6A.

## Dependencies Out of This Phase

- **Desktop v2.0 → Android track:** APK-0 modularization benefits from the refactored/polished desktop codebase but is not blocked by v2.0.
- **Desktop v2.0 → MOSS-NANO-13:** No dependency. MOSS-NANO-13 is deferred independently.
- **Desktop v2.0 → Qwen Streaming:** No dependency. Next streaming iteration deferred to post-v2.0.

## Exit Criteria

1. EINK-6A + EINK-6B landed: E-Ink is a behavioral overlay independent of theme.
2. GOALS-6B landed: Reading goal system with streak tracking and library widget.
3. POLISH-1 landed: ≥4 small UX wins from IDEAS.md.
4. RELEASE-1 landed: v2.0.0 versioned, full test suite green, clean build artifacts, release notes written.
5. Sprint queue depth ≥3 maintained throughout (or replenished from post-v2.0 backlog).

## Estimated Phase Duration

**3–4 weeks** at recent execution velocity, accounting for:
- SK-HYG-1: ~1 day (governance only, Cowork executes)
- EINK-6A: ~2–3 days (CSS refactor, settings restructure)
- EINK-6B: ~2–3 days (new reading mode variants)
- GOALS-6B: ~2–3 days (renderer-only, independent of E-Ink)
- POLISH-1: ~2–3 days (bounded small wins)
- RELEASE-1: ~1 day (verification + versioning)

## Top Risks

1. **EINK-6B reading mode variants:** Stepped Flow and Burst Focus are new interaction patterns that may need design iteration beyond the current spec. Risk: spec assumptions about FlowScrollEngine chunk-based advance may not work cleanly with the existing engine architecture.

2. **GOALS-6B corruption recovery:** SUCCESS CRITERIA item 11 was lost to binary corruption in a prior ROADMAP.md version. Reconstructed as "Widget displays correct progress percentage" — but if the original intent was different, the spec may have a gap.
