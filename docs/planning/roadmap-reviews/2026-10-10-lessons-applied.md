# Roadmap Review — Lessons Applied — 2026-10-10

## Provenance

Lessons role `docs/governance/LESSONS_LEARNED.md` via `virtuoso_registry lessons` (plugin 1.13.0), read 2026-10-10: 98 live lessons. Learning figures from `kpis --json` (same date). Close-outs read: 60.

## Lessons applied, by specification

| Specification | Lessons applied | What each changed |
|---|---|---|
| TTS-ENGINE-SHARED-1 (new spec) | LL-112, LL-132, LL-088 / standing rule 37, LL-130 | LL-112: a characterization commit precedes extraction. LL-132: the synchronous-exit, pid-bearing fakes are banned, and a fake with a pid is a stop condition. LL-088 / rule 37: Task 1 before Task 2, file-disjoint from the backfill. LL-130: plan only to execute |
| TERMINAL-BACKFILL-1 (new spec) | LL-129, LL-130, standing rule 36 | LL-129: the manifest resolves every variant up front, so nothing is parsed at run time. LL-130: no register writes. Rule 36: the manifest is re-checked against the live register before appending |
| READER-MODE-SEPARATION-2 (existing, D.4.5) | its packet's set, plus the 2026-10-09 amendments | `lessons --check` PASS; no lesson recorded since its last review bears on it differently |

Considered and declined by both new specs: LL-131 (no module deletion), LL-133 and LL-134 (not epics).

## U9 and U10 (rubric 1.2)

- `lessons --check ROADMAP.md --item …`: PASS for TTS-ENGINE-SHARED-1, TERMINAL-BACKFILL-1 and READER-MODE-SEPARATION-2.
- `timing --rows-from-spec`: PASS for TTS-ENGINE-SHARED-1 (chain 1h50m · sum 1h50m) and TERMINAL-BACKFILL-1 (chain 35m · sum 35m). 0 of 6 tasks are calibrated, because no time logs exist yet.

## Promotions and retirements

`lessons --candidates` listed two promotion candidates. The owner decided neither is promoted, and a status record was appended under each (append-only):

- **LL-024** (recurred in LL-026; CSS, Electron, window management): `Observation — not promoted (roadmap review 2026-10-10): recurred once, but no active or queued work touches this area; revisit if it recurs again`.
- **LL-093** (recurred in LL-094; refactoring line-count estimates): the same status.

No retirements. `policy.standingRules.ids` declares none; the ROADMAP's numbered standing rules are unchanged.

## Candidates left undecided

- The brittle GUI-automation admission candidate (from READER-MODE-SEPARATION-2) is carried to that item's close-out.

## Learning figures

| Metric | 2026-10-08 | 2026-10-10 |
|---|---|---|
| live-count | 0 (parser could not read the file) | 98 |
| lesson-yield | 0.0 | 1.77 per close-out (60 close-outs) |
| held-rate | not computable | 1 (every applied lesson recorded as held) |
| promotion-rate | not computable | 0 |
| time-to-apply | not computable | median 168 days (4 lessons) |
| repeated-trap-rate | not computable | 0.04 |
| effort-calibration | not computable | not computable: 0 terminal records carry an estimate and an actual |
| row-error / total-error / added-share (new in 1.13) | — | not computable: no closed time logs in the closeOuts role yet |

## Close-outs since the last review that recorded no lesson

None. Both (GOV-HYGIENE-2026-10-09 and EPIC-MAIN-PROCESS-CLEANUP) recorded lessons, LL-129/130 and LL-131 to LL-134.
