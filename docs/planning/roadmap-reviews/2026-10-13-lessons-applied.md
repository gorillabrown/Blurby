# Roadmap review 2026-10-13 — Lessons applied

**Provenance:** `lessons --open` and `lessons --candidates` (70 close-outs read) against `docs/governance/LESSONS_LEARNED.md` on `d21ad58e`; `kpis --json` learning block over the snapshot of 2026-10-13T21:56:00Z.

## New live lessons since 2026-10-12

LL-151 (prove a gate recorder can fail), LL-152 (A/B the base before blaming slowness), LL-153 (settle register writes at dispatch), LL-154 (the Notion connector cannot build cross-relation formulas or formula view filters), LL-155 (verify Notion text against the SQL plain text).

## Which specification applied which

| Specification | Lessons cited (U9 check: pass) | Change this review made |
|---|---|---|
| UX-POLISH-1 (re-authored) | SR 43, 44, 45, 37, 36, 41, 46; LL-152, LL-149, LL-147 | SR 36: every line re-grepped after P4, with a failure-handling row for further drift; SR 46: no register writes by the run |
| CLEANUP-MODE-BARREL-1 | LL-131, LL-139, LL-150; SR 43, 44, 41; LL-149, LL-147 | LL-131 applied again: gate 3 and test (c) now match the legacy path, not the identifier, which the rebuilt mode reused |
| SETTINGS-WRITE-DURABLE-1 | SR 43, 44, 3, 45, 41, 42; LL-006, LL-142, LL-149, LL-148 | Merge order and shared-file plan with P5 |
| TEST-BUDGET-WORDINDEX-1 | SR 44, 41, 43; LL-147, LL-149, LL-148 | Measurement-window note |
| READER-VISUAL-DIAG-1 | LL-152, LL-142, LL-146; SR 45, 38, 41 | Measurement-window note |

LL-153 to LL-155 are about the Notion register, and LL-151 is about gate recorders. None of them changes a buffer specification: no buffer item writes to the register or adds a gate script.

## Promotions and retirements

- **LL-153 → standing rule 46** (applied and held in HB-2 and HB-3). Status record appended: `Promoted -> standing rule 46`.
- **Kept as observations (previous decisions stand):** LL-024, LL-088 (covered by standing rule 37), LL-093, LL-121, LL-131, LL-137. They are narrow, and the specifications that need them already include them.
- Retirements: none.
- Undecided candidates carried forward: none.

## Learning figures

| Figure | 2026-10-13 |
|---|---|
| Live lessons | 112 |
| Lesson yield | 1.81 per close-out (0 of 70 said "no new lesson") |
| Held rate | 1.0 |
| Promotion rate | 0.06 |
| Time to apply | 68 days median (40 lessons) |
| Repeated-trap rate | 0.03 |
| Effort calibration | 0.15 actual ÷ estimate (median of 3 records) |

The 2026-10-12 review's figures are in its own lessons-applied file. The one notable figure is effort calibration: 0.15 means runs finish in about a sixth of their estimate. The task-level `timing` prices already account for this, since they come from medians of real runs.

## Close-outs since the last review without a lesson

None. Both HB-2 and HB-3 recorded lessons.
