# Phase Brief - 2026-05-21

## Phase: Reader Runtime Solidification

### Goal

Stabilize the shared Foliate reader surface, sync the governance baseline after the sweep, and isolate Page, Focus, Flow, and Narrate behind mode ownership contracts so future fixes do not ricochet across modes.

### Why This Phase Comes Next

The prior queue pointed at UX polish and CI wiring. Phase 0 showed that the reader runtime itself is still the load-bearing risk. GOVERNANCE-SWEEP then showed the governance tree needed a source-of-truth reset before new dispatches rely on it. That means the next work should commit the baseline, harden ownership, and restore test health before adding more polish on top.

### Buffer Recommendation

| Seq | Sprint | LOE | Purpose |
|---:|---|---|---|
| 1 | BASELINE-SYNC-1 | M | Commit and clean Phase 0 plus governance sweep |
| 2 | TEST-GREEN-1 | M | Classify/fix broad-suite failures |
| 3 | READER-ISO-1A | M | Add adapter and anchor contracts |
| 4 | READER-ISO-1B | L | Extract orchestrator shell |
| 5 | READER-ISO-1C | M | Migrate Focus and start passive surface boundary |

### Later Sprints

| Sprint | Purpose |
|---|---|
| READER-ISO-1D | Flow adapter and section-handoff restart ownership |
| READER-ISO-1E | Narrate adapter and audio truth-sync ownership |
| GOV-HUMAN-REVIEW-1 | Resolve deferred governance sweep review items |
| TTS-QUAL-CI-1 | CI quality gate wiring after suite health is restored |
| UX-POLISH-1 | Library/command/space-bar polish after reader mode controls stabilize |

### Exit Criteria

1. Phase 0 stabilization and GOVERNANCE-SWEEP are committed and recoverable.
2. Broad-suite failures are fixed or formally classified.
3. Current word anchor service preserves hard selection, resume, soft visible fallback, and word `0`.
4. Mode selection is separate from playback across Page, Focus, Flow, and Narrate.
5. Flow and Narrate have separate runtime owners and cannot start each other's clocks.
6. Local Foliate visual refs reset on mode lifecycle boundaries.

### Top Risks

| Risk | Mitigation |
|---|---|
| Adapter extraction becomes a large rewrite | Split into 1A-1E slices and keep each behavior-preserving |
| Governance sweep and Phase 0 changes get tangled | Use explicit staging and split commits for baseline sync |
| Test failures hide real regressions | Run TEST-GREEN-1 before CI gate wiring |
| Flow section-handoff restart reintroduces Narrate coupling | Keep restart semantics inside Flow adapter only |
| Narrate exact-start regresses again | Preserve Phase 0 and delayed extraction tests as mandatory gates |

### Recommendation

Applied on 2026-05-22: `ROADMAP.md` and `docs/governance/sprint-queue.xlsx` now reflect this resequence, and the first five Reader Runtime Solidification sprints are full specs. Next dispatch is `BASELINE-SYNC-1`.
