# Phase Brief - 2026-05-22

## Phase: Reader Runtime Solidification

### Goal

Repair persistent-anchor behavior under live screen QA, then isolate Page, Focus, Flow, and Narrate behind mode ownership contracts so future fixes no longer ricochet across modes.

### Why This Phase Comes Next

The broad suite is no longer the primary blocker. Manual QA proved the current risk is user-visible reader behavior: Page jump-back, Focus render, Flow follow, Narrate exact start, hard-click retarget, and button state. Adapter isolation remains the right architecture, but it must extract passing behavior, not broken behavior.

### Buffer Recommendation

| Seq | Sprint | LOE | Purpose |
|---:|---|---|---|
| 1 | READER-PERSISTENT-ANCHOR-STEP3-REPAIR | L | Repair manual-QA failures before merge |
| 2 | READER-ISO-1A | M | Add adapter and anchor contracts |
| 3 | READER-ISO-1B | L | Extract orchestrator shell |
| 4 | READER-ISO-1C | M | Migrate Focus and start passive surface boundary |
| 5 | READER-ISO-1D | L | Migrate Flow and isolate section-handoff restart |

### Later Sprints

| Sprint | Purpose |
|---|---|
| READER-ISO-1E | Narrate adapter and audio truth-sync ownership |
| GOV-HUMAN-REVIEW-1 | Resolve deferred governance sweep review items |
| TTS-QUAL-CI-1 | CI quality gate wiring after suite/runtime health is restored |
| UX-POLISH-1 | Library/command/space-bar polish after reader mode controls stabilize |

### Exit Criteria

1. Step 3 repair passes the 18-scenario manual QA matrix or has explicit user-approved residual dispositions.
2. Current word anchor service preserves hard selection, last-read progress, live playback cursor, browse-away position, and word `0` without ambiguity.
3. Mode selection is separate from playback across Page, Focus, Flow, and Narrate.
4. Flow and Narrate have separate runtime owners and cannot start each other's clocks.
5. Local Foliate visual refs reset on mode lifecycle boundaries.
6. Live UI gates cover jump-back motion, active render, reading-window follow, exact start, and hard-click retarget.

### Top Risks

| Risk | Mitigation |
|---|---|
| Step 3 becomes a broad rewrite | Fix only failed manual-QA clusters and preserve passing Step 2 contracts |
| Hard-selected anchor remains conflated with last-read progress | Apply SRL-054 taxonomy in Step 3 and READER-ISO-1A |
| Adapter isolation extracts broken behavior | Block READER-ISO-1A until Step 3 passes manual QA |
| Structural tests stay green while UI remains broken | Require SRL-053/SRL-055 live screen QA gates |
| Flow fixes break Narrate again | Use Narrate's working browse-away/follow path as reference and preserve audio ownership |

### Recommendation

Applied on 2026-05-22: `ROADMAP.md` and `docs/governance/sprint-queue.xlsx` now make `READER-PERSISTENT-ANCHOR-STEP3-REPAIR` the next dispatch, with `READER-ISO-1A` moved behind the manual QA repair gate.
