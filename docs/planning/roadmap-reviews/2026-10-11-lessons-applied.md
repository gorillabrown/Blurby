# Roadmap Review — Lessons Applied — 2026-10-11

## Provenance

Lessons role `docs/governance/LESSONS_LEARNED.md` via `virtuoso_registry lessons` (plugin 1.14.0): 103 live lessons. Learning figures come from `kpis --json`. Close-outs read: 63.

## Lessons applied, by specification

| Specification | Lessons applied | What each changed |
|---|---|---|
| TEST-TIMEOUT-HEADROOM-1 (new) | Standing rule 41 (LL-136), LL-135, standing rule 13; LL-138 considered | Time-log exemption; recipe in the dispatch; fix the cause instead of waiving it as debt. LL-138 does not apply: no approved behaviour change |
| NARRATE-REMOVE-1 (absorbed HB-1, revision 3) | LL-131, LL-139, LL-128, LL-117, LL-106, LL-104, LL-121, LL-138, LL-068, LL-091, LL-135, LL-136, LL-141, LL-006 | As written by `/write-plan` and two adversarial reviews. `lessons --check --item NARRATE-REMOVE-1` passes after the rename |
| NARRATE-REBUILD-1 (epic stub) | LL-140 (hear the baseline first), SRL-070 / standing rule 38 (measure before perceptual rewrites) | The owner listening sign-off is a Done-when row; Phase 0 measures Kokoro before any build. The charter applies the full set at `/epic` |
| EINK-HOVER-FIX-1 (existing, D.4.5) | unchanged | `lessons --check` PASS |

## Promotions and retirements

- **LL-136 → standing rule 41** (status record appended). It recurred in three close-outs (TERMINAL-BACKFILL-1, TTS-ENGINE-SHARED-1, READER-MODE-SEPARATION-2).
- `lessons --candidates` also lists LL-024, LL-088 and LL-093. Their earlier decisions stand (not promoted; LL-088 is covered by rule 37).
- No retirements.

## Candidates left undecided

- **From the LIBRARY-SETTINGS-FIX-1 close-out (pending):**
  - a Done-when grep must target the exact construct, not a common literal (its "no literal 1000" row);
  - the run recorded no positive-control output.

  Both are recorded at that close-out.

## Learning figures

| Metric | 2026-10-10-2 | 2026-10-11 |
|---|---|---|
| live-count | 102 | 103 |
| lesson-yield | 1.77 | 1.79 per close-out |
| held-rate | 1 | 1 |
| promotion-rate | 0 → 2 recorded | 0.02 (3 with LL-136) |
| time-to-apply | median 1 day | median 143 days |
| repeated-trap-rate | 0.04 | 0.04 |
| effort-calibration | not computable | not computable: still 0 terminal records with an estimate and an actual. Standing rule 41 is the fix |

## Close-outs since the last review that recorded no lesson

None. READER-MODE-SEPARATION-2 recorded LL-139..LL-141.
