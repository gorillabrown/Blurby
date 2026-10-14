# Roadmap review 2026-10-14 — Lessons applied

**Provenance:** `lessons --open`, `lessons --candidates` (73 close-outs read) and `lessons --check ROADMAP.md --item <ID>` against `docs/governance/LESSONS_LEARNED.md` on `eb/roadmap-review-2026-10-14`; `kpis --json` learning block, as of 2026-10-14.

## New live lessons since 2026-10-13

LL-156 (a waiver tied to code moves with that code) and LL-157 (Electron does not await an async `will-quit` listener), both from SETTINGS-WRITE-DURABLE-1.

## Which specification applied which

| Specification | Lessons cited (U9: pass) | Effect on the specification |
|---|---|---|
| FOLDER-SCAN-PERF-1 | SR 43, 39, 44, 47, 48, 45, 41, 46, 36; LL-152, LL-142, LL-157, LL-156, LL-148 | LL-152: the cause was measured before the design was fixed, which moved the main control from the scan to the watcher. LL-156: the pruning waiver is restated and its hazard filed as BUG-195 |
| QUIT-FLUSH-1 | LL-157 (core), SR 43, 39, 44, 45, 47, 48, 41, 42, 46, 36; LL-152, LL-006, LL-142, LL-156 | LL-157: saves move into the cancelled first quit, and test (a) reads files back at the fake exit. LL-156: SETTINGS-WRITE-DURABLE-1's waiver on `main/ipc/state.js` is brought into scope |
| PACKAGING-FIX-1 | SR 43, 44, 45, 47, 48, 41, 42, 46; LL-151, LL-142, LL-152, LL-150, LL-156, LL-157 | LL-151: the launch-log scan must first find the four errors on the defective build |
| UX-POLISH-2 | SR 43, 44, 45, 47, 48, 41, 42, 46, 36, 37, 2, 15, 20; LL-152, LL-105, LL-080, LL-012, LL-156, LL-150 | LL-080: the overlay consumes Escape in the capture phase; SR 37: the `src/types.ts` comment edit is declared |
| READER-VISUAL-DIAG-1 | unchanged, plus the BUG-193 confound amendment | live sessions run with `sourceFolder` empty or after FOLDER-SCAN-PERF-1 |

The `lesson-closed-cited` warnings are the roadmap's convention: a standing rule is cited with the lesson it was promoted from in parentheses.

## Promotions and retirements

- **LL-147 → standing rule 47** and **LL-149 → standing rule 48** (owner decision). Status records appended.
- **Kept as observations:** LL-006, LL-024, LL-088, LL-093, LL-121, LL-137, LL-139, LL-142, LL-148, LL-150 (the tool lists them as candidates). LL-006 is already standing rule 3's subject; LL-142 is the charter principle the epic carries; the others are narrow and the specifications that need them cite them. Revisit LL-142 and LL-148 at the next review if they recur.
- **LL-156 and LL-157:** applied for the first time in this review's specifications; promotion waits for a held outcome at their close-outs.
- Retirements: none.

## Learning figures

| Figure | 2026-10-14 |
|---|---|
| Live lessons | 111 |
| Lesson yield | 1.77 per close-out (2 of 73 said "no new lesson") |
| Held rate | 0.98 |
| Promotion rate | 0.08 |
| Time to apply | 3 days median (41 lessons) |
| Repeated-trap rate | 0.03 |
| Effort calibration | 0.21 actual ÷ estimate (median of 4 records) |
| Row error | 0.94 (56 rows) |

Effort calibration of 0.21 means runs finish in about a fifth of their estimate. The `timing` totals in the new specifications (1–3 minutes) come from the calibrated medians and are not useful as wall-clock plans; they include none of the owner smokes.
