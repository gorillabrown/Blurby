# Roadmap review 2026-11-03 — Phase D lessons review

*Provenance.*
- **Lessons:** the registered `docs/governance/LESSONS_LEARNED.md`, 127 live lessons.
- **Helper:** qualified, guard PASS at `fcfa9295`.
- **Inputs:** `lessons --candidates` over 87 close-outs, `kpis` as of 2026-11-03.
- **Previous complete review:** 2026-11-02.
- **Close-outs since then:** none, so no close-out lessons gate to run and no "no lesson, no reason" close-out to name.

## New live lessons since 2026-11-02 (120 → 127)

LL-175 to LL-181. They came from the Codex-era stop, the pause and the handback.

| Lesson | Where it applies now |
|---|---|
| LL-175 (PDF cross-reference separators) | BLURBY-BUSINESS-1, held at Seq 150. Carried by its card for when it resumes; no current specification touches PDF writing. |
| LL-176 (PowerShell completion objects in binary collectors) | Any rule 53 evidence script on Windows. Applies to the RC window's package pair and the post-RC items' pairs, as a Brain1 review point on returned evidence. |
| LL-177 (source, representation and child-output escaping) | NARRATE-CPU-PROFILE-1's remaining Wave A (A3 + A4). Its control strings are checked in their own domain. |
| LL-178 (compare evidence in its declared path and data-type domain) | The independent assessment of the RC window's evidence and every post-RC close-out: path and type are compared exactly as declared, never normalised by eye. |
| LL-179 (qualify Windows authoring transport) and LL-180 (close inputs before an authoring or review clock) | Codex-era procedure. Brain1's triage adopts their measurement meaning only; the read-accounting machinery is DO-NOT-ADOPT. No current specification adds a clock or transport ritual. |
| LL-181 (worktree placement; packed `eb/` refs) | Applied in all five post-RC amendments (*Lessons applied*), in the RC window spec, and in this review: the planning worktree was moved out of `.codex`, and every push uses `HEAD:refs/heads/eb/<name>`. |

## Specifications this review checked (D.4.4 / D.4.5)

This review wrote no new specification. All six items below were checked against the live lessons with `lessons --check ROADMAP.md --item <ID>`:

| Item | U9 | Lessons it applies (from its card and the 2026-11-03 amendment) |
|---|---|---|
| A library edit stamps only what the reader changed (LIBRARY-WRITE-RACE-3) | PASS | LL-181, LL-169, plus the card's set |
| In Narrate, an arrow with a modifier pauses and the cursor holds its word (NARRATE-ARROW-PAUSE-1) | PASS | LL-181, LL-174, plus the card's set |
| Narrate resumes from the word selected while paused (NARRATE-PAUSED-CLICK-1) | PASS | LL-181, LL-169 |
| Page receives navigation keys before word wrapping completes (PAGE-ENTRY-KEYS-1) | PASS | LL-181, LL-169 |
| Focus keeps its word cursor without the dimming band (FOCUS-WORD-ONLY-1) | PASS | LL-181, LL-174 |
| Narrate saturates a 4-core CPU during warm requests (NARRATE-CPU-PROFILE-1) | PASS | carries F-009 |

**Warnings, not failures.** The LWR-3 and NAP-1 cards cite lessons since promoted to standing rules: LL-158 became rule 54, LL-166 rule 55, LL-138 rule 43, LL-156 rule 50, LL-146 rule 52 and LL-149 rule 48. Each specification keeps the cited guard. The citation should name the rule, and that wording fix rides each item's kickoff readiness pass. No live lesson was declined by all six.

## Promotion candidates (16, computed)

The 16 candidates are the same set as on 2026-11-02. No close-out since then adds application or recurrence evidence, so the 2026-11-02 dispositions stand unchanged:

- 14 lessons are retained as Observations, each for its recorded reason: LL-006, LL-024, LL-068, LL-088, LL-093, LL-109, LL-117, LL-121, LL-129, LL-137, LL-139, LL-150, LL-154 and LL-157.
- LL-142 keeps its charter and direct-citation disposition.
- LL-143 was revised, not retired, on 2026-11-02 (rule 44 receipts, CH-005). With no newer close-out, its "did not hold" count has no new data. Its result is read at the next close-out that applies it.

No candidate is left undecided. No promotion, retirement or standing-rule change is made, and no status record is appended.

## Learning figures

| Figure | 2026-11-02 | 2026-11-03 |
|---|---|---|
| Live lessons | 120 | 127 |
| Lesson yield (per close-out) | 1.68 | 1.76 |
| Held rate | 0.98 | 0.98 |
| Promotion rate | 0.12 | 0.11 |
| Time to apply (median days) | 3.5 | 3.5 |
| Repeated-trap rate | 0.03 | 0.03 |
| Effort calibration (actual ÷ estimate) | 0.62 | 0.62 |
| Row error | 0.90 | 0.90 |

The yield rose and the promotion rate fell because seven lessons were added with no close-out. Starting load is **not computable**: no time log was opened by a bound session.
