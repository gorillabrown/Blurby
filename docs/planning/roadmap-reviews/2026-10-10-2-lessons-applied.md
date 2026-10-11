# Roadmap Review — Lessons Applied — 2026-10-10 (second review)

## Provenance

Lessons role `docs/governance/LESSONS_LEARNED.md` via `virtuoso_registry lessons` (plugin 1.13.0), read 2026-10-10/11: 102 live lessons. Learning figures from `kpis --json`. Close-outs read: 62.

## Lessons applied, by specification

| Specification | Lessons applied | What each changed |
|---|---|---|
| EINK-HOVER-FIX-1 (new) | LL-138, LL-136, LL-135, LL-137, standing rule 35 (SRL-079); LL-024 considered | LL-138: positive-control row (Done-when 3). LL-136: the timing log is exempt from the exact-path fence. LL-135: the dispatch carries its recipe. LL-137: UTF-8 reads. SRL-079: BUG-184 stays OPEN until rebuild + owner smoke. LL-024: not applicable (no window chrome). |
| LIBRARY-SETTINGS-FIX-1 (new) | LL-138, LL-136, LL-135, LL-137, LL-016, LL-017, standing rule 37; LL-131 considered | LL-138: both new tests must fail first, on the listed defects only. LL-016: the batcher lives in a ref across effect re-runs. LL-017: the flush calls `onMarkDocsSeenRef.current`, never a closure. Rule 37: Task 1 before Task 2. LL-131: no deletion. |
| READER-MODE-SEPARATION-2 (existing, D.4.5) | unchanged | No lesson recorded since the morning review bears on its remaining owner-gated steps. |

## U9 and U10 (rubric 1.2)

- `lessons --check ROADMAP.md --item …`: PASS for EINK-HOVER-FIX-1 and LIBRARY-SETTINGS-FIX-1.
- `timing --rows-from-spec`: EINK-HOVER-FIX-1 chain 40m · sum 40m; LIBRARY-SETTINGS-FIX-1 chain 1h20m · sum 1h20m. 0 of 6 tasks calibrated, because no time logs exist yet.

## Promotions and retirements

`lessons --candidates` listed LL-024, LL-088, LL-093, LL-112 and LL-130. Owner decisions:

- **LL-112** → **standing rule 39** (characterize before extracting shared code). Status record appended.
- **LL-130** → **standing rule 40** (plan an external register write only to execute it). Status record appended.
- **LL-088**: not promoted. Standing rule 37 (SRL-089) already covers it; a status record says so.
- **LL-024, LL-093**: already decided at the morning review (not promoted); no change.

No retirements.

## Candidates left undecided

- **LL-136** (exact-path fences forbid the timing log) recurred in a second close-out (TTS-ENGINE-SHARED-1). The `--candidates` scan does not detect recurrence recorded in status records, so it was not offered at this checkpoint. Both new specs apply it. Carry it to the next review as a promotion candidate.
- The GUI-automation candidate from READER-MODE-SEPARATION-2 is still carried to that item's close-out.

## Learning figures

| Metric | 2026-10-10 (morning) | 2026-10-10-2 |
|---|---|---|
| live-count | 98 | 102 |
| lesson-yield | 1.77 per close-out | 1.77 per close-out (62 close-outs; 0 said "no new lesson") |
| held-rate | 1 | 1 |
| promotion-rate | 0 | 0 before this review; 2 promotions recorded now |
| time-to-apply | median 168 days | median 1 day (7 lessons) |
| repeated-trap-rate | 0.04 | 0.04 |
| effort-calibration | not computable | not computable: 0 terminal records carry an estimate and an actual (LL-136) |

## Close-outs since the last review that recorded no lesson

None. TERMINAL-BACKFILL-1 recorded LL-135..LL-137, and TTS-ENGINE-SHARED-1 recorded LL-138.
