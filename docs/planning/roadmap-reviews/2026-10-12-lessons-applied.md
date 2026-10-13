# Roadmap Review 2026-10-12 — Lessons Applied

**Provenance:** `lessons --open` and `lessons --candidates` over `docs/governance/LESSONS_LEARNED.md` (114 live lessons before this review's promotions; 67 close-outs read), 2026-10-12. Previous: the 2026-10-11 lessons-applied.

## Which specification applied which lesson

| Specification | Lessons applied (all pass `lessons --check`) |
|---|---|
| TEST-BUDGET-WORDINDEX-1 | Standing rule 44 (LL-143), LL-147, LL-149, LL-148, standing rule 41 (LL-136), standing rule 43 (LL-138, considered) |
| SETTINGS-WRITE-DURABLE-1 | Standing rules 43, 44, 45, 42, 41; LL-006 / standing rule 3; LL-142; LL-147; LL-149; LL-148 |
| READER-VISUAL-DIAG-1 | LL-152, LL-142, LL-146, standing rule 45 (LL-141), standing rule 38, standing rule 41 |
| CLEANUP-MODE-BARREL-1 | LL-131, LL-139, LL-150, standing rules 43, 44, 41; LL-149; LL-147 |
| UX-POLISH-1 | Standing rules 43, 44, 45, 37, 41; LL-152; LL-149; LL-147 |

The only warning is cosmetic: specifications cite "standing rule 41 (LL-136)", and the checker prefers the rule alone.

No existing dispatch-ready specification needed a re-check (D.4.5): the buffer was empty before this review, and NARRATE-REBUILD-1 is an epic, chartered against the live lessons by `/epic`.

Live lessons every new specification declined: LL-121 (normalize at the ingress) and LL-137 (read governance JSON as UTF-8) apply to none of these items; correct.

## Promotions and retirements

Owner decision at this review (2026-10-12): promote the four broad candidates.

| Lesson | Became | Evidence |
|---|---|---|
| LL-135 — a dispatch carries its reconciliation recipe | Standing rule 42 | Held in four close-outs |
| LL-138 — a behaviour change needs a positive control | Standing rule 43 | Held in four close-outs |
| LL-143 — dry-run every acceptance gate | Standing rule 44 | Recurred (OutsideAudit.10; LIBRARY-SETTINGS-FIX-1) |
| LL-141 — live UI gates keep an owner-observed route | Standing rule 45 | Held in two close-outs |

Status records `Promoted -> ROADMAP standing rule 42…45` are appended under each.

Not promoted, by decision: LL-121, LL-131 and LL-137 stay observations (narrow; already built into the specifications that need them). The earlier no-promote decisions on LL-024, LL-088 (covered by standing rule 37) and LL-093 stand. No retirements.

## Candidates left undecided

None.

## Learning figures

| Metric | 2026-10-11 | 2026-10-12 |
|---|---|---|
| live-count | 103 | 114 (before promotions) |
| lesson-yield | 1.79 per close-out | 1.87 per close-out |
| held-rate | — | 1.0 |
| promotion-rate | — | 0.02 before this review (4 promotions added here) |
| effort-calibration | not computable | not computable (1 of 3 terminal records with estimate and actual) |

## Close-outs without a lesson or reason

None. All four close-outs since 2026-10-11 pass the lessons gate.
