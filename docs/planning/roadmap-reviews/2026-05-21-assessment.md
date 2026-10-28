# Roadmap Assessment - 2026-05-21

## Finish Line Assessment

The previous finish line, `TTS Quality Confidence + Reading Experience v2`, is still directionally right, but the route has changed. Reader-mode instability has become the gating risk for the reading experience side of the finish line.

## Health Read

**Status:** YELLOW/RED.

The product direction is clear, and the Phase 0 stabilization was the right move. The execution system is currently at risk because the active queue, roadmap, and dirty worktree do not describe the same next step.

The governance sweep improved document hygiene but widened the uncommitted baseline. The next action should be a deliberate sync commit, not more feature work.

## Progress Since Prior Review

| Area | Prior State | Current State | Read |
|---|---|---|---|
| Narrate/Flow stability | Recently stabilized but fragile | Phase 0 fixed word-0 recentering and browse-away reset | Improved |
| Runtime architecture | Shared helpers and shared Foliate surface | Isolation spec exists with adapter ownership contracts | Improved |
| Verification posture | Focused tests often green | Full suite has 12 unrelated failures | Worse |
| Queue health | Two stubs active | True next work is not represented in workbook | Worse |
| Governance capture | Lessons scattered | Phase 0 close-out + SRL-046/SRL-047 persisted | Improved |
| Governance hygiene | 13 known doc-tree issues | GOVERNANCE-SWEEP completed 25 actions and left 6 human-review items | Improved |
| Git baseline | Phase 0 dirty | Phase 0 + sweep + roadmap-review drafts all dirty | Worse until committed |

## Scope Discipline

Scope discipline is mixed. The project correctly pivoted away from UX polish when core reader stability regressed. That is forward motion, not sideways drift. The problem is that the canonical queue did not pivot with the actual work.

## Work Remaining Estimate

Using t-shirt points as S=1, M=3, L=8:

| Bucket | Sprints | Approx Points |
|---|---:|---:|
| Immediate baseline sync and stabilization | 2 | 4 |
| Adapter isolation core | 5 | 25 |
| Governance human-review follow-ups | 1 | 1 |
| Deferred UX/CI polish | 2 | 9 |
| Total active path | 10 | 39 |

This is a larger finish-line remainder than the current roadmap implies. The extra work is justified because it prevents repeated Flow/Narrate regressions.

## Key Risks

| Risk | Why It Matters | Mitigation |
|---|---|---|
| Starting adapter extraction before committing Phase 0 | Reopens the same regression loop | Commit/stage Phase 0 bundle first |
| Treating visual refs as component details | Adapters can be correct while UI remains broken | Add lifecycle reset requirements to adapter contracts |
| Deferring broad-suite failures indefinitely | CI gate sprint becomes noisy or blocked | Insert TEST-GREEN-1 before TTS-QUAL-CI-1 |
| Letting queue workbook stay stale | `/next-pointer` and future dispatches target wrong work | Update workbook after roadmap approval |
| Combining unrelated dirt into one commit | Makes rollback and review harder | Use explicit staging and split commits for Phase 0, governance sweep, and roadmap-review updates |
| Ignoring deferred sweep findings | Hygiene drift returns | Track the 6 deferred items as a small follow-up, not as hidden debt |

## Assessment Recommendation

Adopt a short Reader Runtime Solidification phase ahead of UX polish, preceded by a baseline sync pass that reviews, stages, and commits the Phase 0 and GOVERNANCE-SWEEP changes cleanly. This phase should treat runtime ownership, visual reset lifecycle, exact anchor preservation, broad-suite health, and governance source-of-truth consistency as prerequisites for further feature polish.
