# Roadmap Review 2026-10-25 — Lessons Applied

**Provenance:**
- Lessons: `docs/governance/LESSONS_LEARNED.md` (prefix LL), read through `lessons --open` and `lessons --candidates` (85 close-outs).
- Learning figures: `kpis --json` on the snapshot taken 2026-10-26T01:41:00Z, imported from the live Notion register `notion:database/3f87c96cc31e800580cfe019c89a56ca`.
- Previous figures: this review's first `kpis` run, on the snapshot of 2026-10-24T01:28:08Z. Review 2026-10-23-5 wrote no lessons-applied file.

## Live lessons

114 live (117 before this review's three promotions).

## Promotions and retirements recorded

| Lesson | Decision | Record |
|---|---|---|
| LL-158 — trace what a live row triggers, at the real data size | **Promoted → standing rule 54.** It occurred twice: SETTINGS-WRITE-DURABLE-1, then QUIT-FLUSH-1 Done-when 9(f). Its own status line named it a candidate. | `lessons --record-status`, 2026-10-25 |
| LL-151 — a gate recorder must be proven able to record a failure | **Promoted → standing rule 55**, merged with LL-166. Review 2026-10-23-2 kept it an observation because rule 43 covers tests; LL-166 is its second occurrence on the null-verdict side, beyond tests. | same |
| LL-166 — a no-effect verdict needs a detector that reads state | **Promoted → standing rule 55** (with LL-151). | same |

The other computed candidates keep review 2026-10-23-2's decisions and reasons: LL-006, LL-024, LL-088, LL-093, LL-121, LL-137, LL-139, LL-142, LL-150, LL-154 and LL-157. Nothing has changed since then: no close-out was written in this cycle. **Undecided:** none.

**New candidate, from LIBRARY-WRITE-RACE-2's memo (W2):** a spec that sends whole records should say whether a stamp follows the renderer's edit or main's diff. It is not yet a lesson entry, because the item has not closed out. LIBRARY-WRITE-RACE-3 applies it in its Lessons applied. Its close-out should record it.

## Which specification applied which

U9 (`lessons --check`) passes for every specification this review wrote or changed:

| Item | Lessons applied |
|---|---|
| WORD-INDEX-UNIFY-1 (88; Blurby.Brain's corrections applied) | LL-160 (copy parity also under the packaged runtime), LL-142, LL-152, LL-161, LL-162, LL-165, LL-166 |
| LIBRARY-WRITE-RACE-3 (89) | LL-158/rule 54, LL-166/rule 55, LL-165, LL-138, LL-156, LL-146, LL-149, LL-167 |
| NARRATE-ARROW-PAUSE-1 (99) | LL-158/rule 54, LL-166/rule 55, LL-165, LL-161, LL-138, LL-146, LL-149, LL-167 |
| AUTO-ARCHIVE-1 (111) | LL-158/rule 54, LL-166/rule 55, LL-165, LL-138, LL-146, LL-156, LL-149, LL-167 |
| PAGE-PAGES-READ-1 (113) | LL-158/rule 54, LL-166/rule 55, LL-165, LL-152, LL-138, LL-149, LL-167, LL-156 |

**D.4.4:** every new specification applies the two new standing rules. No live lesson was declined by all of them. The ones none of them cite, such as the Narrate-only LL-142 and the governance lessons, do not bear on these edit sites.

**D.4.5, existing specifications:** NARRATE-CPU-PROFILE-1 (95) was re-checked and passes U9. The dispatched specifications are In Flight and are not re-gated here. Rules 54 and 55 apply to them at their close-outs.

## Learning figures

| Figure | Before this review | This review |
|---|---|---|
| live lessons | 117 | 114 |
| lesson yield (per close-out) | 1.64 | 1.64 |
| held rate | 0.98 | 0.98 |
| promotion rate | 0.10 | 0.12 |
| time to apply (median days) | 3 | 3 |
| repeated-trap rate | 0.03 | 0.03 |

## Close-outs with no lesson and no reason

None this cycle: no close-out was written since review 2026-10-23-5.
