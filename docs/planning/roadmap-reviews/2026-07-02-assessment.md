# Roadmap Review — Phase B Assessment (2026-07-02)

## Headline

**The project has been idle for a full month.** The last commit is `145c385`
(2026-06-01, A5 merge); the trailing 4 weeks (2026-06-04 → 2026-07-02) show
**zero commits**. The roadmap was left in a healthy, dispatch-ready state — the
probe sprint NARRATE-HEARD-CURSOR-1 fully specced at conveyor position 1 — but
**it was never dispatched**. This review's job is less "recalibrate a drifted
roadmap" and more "confirm the head is still correct and get it moving."

## B.1 — Work remaining

The Dashboard LOE KPIs (`F3:H3` = 125/90/35) are **stale and unreliable** —
the sheet is fully static (0 formula cells) and internally inconsistent
(B3 "Total" = C3 "Completed" = 35, yet D3 "Remaining" = 3). So remaining work is
assessed by **finish-line tier** and **active queue**, not the Dashboard.

**Finish line = "TTS Quality Confidence + Reading Experience v2"** (4 graduated tiers):

| Tier | Status |
|---|---|
| 1. CI quality gate active (TTS-QUAL-CI-1) | ✅ Done |
| 2. Narration dual-source unification w/ proven cursor/view authority | 🔄 **In flight** (the bulk of remaining work) |
| 3. All 2026-05-28 discovery bugs closed (EXT-PAIR, THEME-SYNC, SINGLE-INSTANCE) | ✅ Done |
| 4. UX polish lands (UX-POLISH-1 + downstream) | ⏳ Pending |

**2 of 4 tiers complete.** The remaining active queue is **5 sprints**
(~7.5–10.5 LOE, SUBSCRIBER-CURSOR-1 gated so possibly 0):

| Sprint | LOE | Note |
|---|---|---|
| NARRATE-HEARD-CURSOR-1 | S (1) | The probe; gates the heavy surgery |
| NARRATE-APPLYRATECHANGE-COLLAPSE-1 | M (3) | Owns A5 1.4x residual |
| NARRATE-SUBSCRIBER-CURSOR-1 | M (3) | **Gated** — may dissolve if probe PASSes |
| UX-POLISH-1 | ~M (3) | Stub → full-spec this review |
| HYG-XLSX-DASHBOARD-RESTORE | XS (0.5) | Stub → full-spec this review |

**Estimate: ~15–20% of finish-line effort remains**, concentrated in the
narration cursor/sync lane (tier 2) plus one UX sprint (tier 4) and one XS
governance sprint. If the HEARD-CURSOR-1 probe PASSes, SUBSCRIBER-CURSOR-1
dissolves and remaining work shrinks further.

## B.2 — Pace

| Window | Completions | Pace |
|---|---|---|
| Trailing 4 weeks (06-04 → 07-02) | 0 | **0 / week (idle)** |
| Prior burst (05-11 → 06-01, ~3 wk) | ~30 | ~10 / week (small sprints, high velocity) |

**Read: STALLED.** Velocity went from very high to zero. This is not a scope or
planning problem — the plan is ready. It's a dispatch-gap: the next sprint
requires a **live-QA session with Evan** (tune-by-ear cursor lag), and that
human-in-the-loop gate is the likely reason work paused. Required pace to finish
tier 2 + tier 4 is low (5 sprints); the constraint is scheduling the live-QA
sessions, not engineering throughput.

## B.3 — Scope discipline

**Since the prior review (2026-06-01): 100% forward.** The only movement was the
2 planned completions (DIAG, A5), both already in-flight at the last review. No
new scope, no sideways churn, no backward reversal. Delta score = 2 / (2+0+0) = **1.0**.

**Lifetime caution (the real risk signal).** The narration cursor/sync problem
has consumed **~8 sprints** (DUAL-SOURCE-DIAG → INTENT-CURSOR → PAUSE-RESUME-UNIFY
→ CURSOR-TRACKING-DIAG → A5-RATE-RESEED → HEARD-CURSOR → COLLAPSE → SUBSCRIBER-CURSOR)
with **multiple live-QA PARTIALs** (INTENT-CURSOR-1 A4 FAIL 0-of-3), **one
dissolved sprint** (CLOSED-LOOP-CURSOR), and **one reverted hotfix** (`fcea6a8`).
That is a lot of thrash on one perceptual defect. The 2026-06-01 restructuring is
the disciplined corrective — **SRL-090: prove a cheap compensation-and-tune probe
fails before committing to architectural removal** — but it is **unvalidated**:
HEARD-CURSOR-1 has not been dispatched, so we do not yet know whether the
probe-first bet pays off.

## B.4 — Verdict

- **Roadmap health: GOOD.** Well-maintained, archive-forward clean (after Phase A),
  buffer depth 5, head sprint dispatch-ready.
- **Momentum: STALLED.** One month idle. The bottleneck is the live-QA human gate,
  not the plan.
- **Top risk: narration-lane thrash.** Eight sprints and counting on one desync.
  The probe-first restructuring must be validated by dispatching HEARD-CURSOR-1 and
  running the live-QA gate — that single session determines whether the remaining
  two narration sprints (COLLAPSE, SUBSCRIBER) are both needed or one dissolves.
- **Recommended next action:** dispatch NARRATE-HEARD-CURSOR-1 and schedule the
  tune-by-ear live-QA with Evan. Everything downstream gates on its verdict.
