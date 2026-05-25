# Roadmap Assessment - 2026-05-22

## Finish Line Assessment

`TTS Quality Confidence + Reading Experience v2` remains correct, but the project has a sharper immediate constraint: reader-mode behavior must pass live screen QA before architecture extraction can continue.

## Health Read

**Status:** YELLOW/RED.

The execution system is healthier than it was before TEST-GREEN-1 because the broad suite is no longer noisy. The risk moved from test drift to live UI correctness: the Step 2 branch can be fully green in automation while still failing the reading experience in the dev build.

## Progress Since Prior Review

| Area | Prior State | Current State | Read |
|---|---|---|---|
| Broad suite | 12 failures waived as unrelated | TEST-GREEN-1 resolved/classified them | Improved |
| Governance hygiene | Sweep complete but queue sync needed | Baseline and closeouts exist; Step 2 closeout updated | Improved |
| Persistent anchor branch | Step 2 claimed ready for QA | Manual QA failed 10 of 18 scenarios | Worse |
| Queue source of truth | Workbook pointed at ISO-1A | Must be updated to Step 3 repair | Worse until synced |
| Lessons learned | SRL-046/SRL-047 loaded | SRL-053/SRL-054/SRL-055 add screen-QA and anchor taxonomy rules | Improved |
| Eager spec buffer | 1A-1C full, later stubs | Step 3 and 1D need full-spec coverage | Needs update |

## Scope Discipline

The correct move is not to abandon the persistent-anchor branch or jump straight into adapter isolation. The branch contains useful repairs that passed: no auto-start, paused handoff, Flow single cursor, Narrate browse-away, and clean logging. The disciplined path is a focused Step 3 repair that preserves those wins while closing the manual-QA failures.

## Work Remaining Estimate

Using t-shirt points as S=1, M=3, L=8:

| Bucket | Sprints | Approx Points |
|---|---:|---:|
| Persistent-anchor repair gate | 1 | 8 |
| Adapter isolation core | 5 | 35 |
| Governance human-review follow-up | 1 | 1 |
| Deferred CI/UX polish | 2 | 9 |
| Total active path | 9 | 53 |

The remainder grew because manual QA found product-visible defects that automation missed. That is real scope, not drift.

## Key Risks

| Risk | Why It Matters | Mitigation |
|---|---|---|
| Dispatching `READER-ISO-1A` next | It may extract/codify broken anchor behavior | Insert Step 3 repair before adapter isolation |
| Treating last-read and hard-selected anchor as one concept | Recreates Narrate wrong-start and click-retarget failures | Apply SRL-054 taxonomy in Step 3 and 1A |
| Trusting structural tests alone | Step 2 was automation-green but UI-red | Apply SRL-053/SRL-055 live UI gates |
| Rolling back Step 2 wholesale | Loses working no-auto-start/Narrate browse-away fixes | Preserve passing contracts explicitly |
| Letting workbook stay stale | `/next-pointer` targets the wrong sprint | Update Dashboard and Catalog immediately |

## Assessment Recommendation

Adopt `READER-PERSISTENT-ANCHOR-STEP3-REPAIR` as the next dispatch, promote `READER-ISO-1D` to full spec to keep the eager buffer healthy, and update the workbook queue so every dispatch path points at the repair gate before adapter isolation.
