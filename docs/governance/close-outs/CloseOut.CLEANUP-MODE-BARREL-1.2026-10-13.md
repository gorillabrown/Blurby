---
sprint: CLEANUP-MODE-BARREL-1
date: 2026-10-13
runtime: 3m (timing --summary)
tokens: not measured
status: has-discoveries
---

# Pointer Close-Out: CLEANUP-MODE-BARREL-1

Origin: roadmap item, Seq 13 (Stage 4). Branch `eb/cleanup-mode-barrel-1` from `main` @ `05a5480a`; C1 positive control, C2 `39f16cbf`; merged `03e218bd` (`--no-ff`), pushed. Specification as amended by the 2026-10-13 roadmap review (gate 3 and test (c)).

## Sprint Brief

**Goal:** Delete the unused barrel `src/modes/index.ts` and the three legacy engines, re-point the one test that imported them, drop the dead `NarrateMode` build rule, and guard against their return.
**Result:** `src/modes/` now holds only `ModeInterface.ts`; `tests/perf-baseline.test.ts` imports the per-mode runtimes; `vite.config.js:49` removed; new `tests/modeLegacyRetired.test.ts` failed (a) and (b) on the base and passes now; build exit 0; full suite 2,051 passed on the second run (the first had one failure, below); merged `03e218bd`.
**Learned:** No new lesson — LL-131's trap (a census keyed on an identifier, not a reference) recurred at spec time, when the 2026-10-12 gate keyed on the bare identifier `NarrateMode`, which the rebuilt mode reused. The 2026-10-13 review's re-audit caught it; a status record on LL-131 records the recurrence.
**Recommend:** After SETTINGS-WRITE-DURABLE-1 merges, watch `tests/sync-queue.test.js`; if "clearQueue empties all pending ops" fails again on the new writer, file it as a bug.
**Bottom line:** The legacy mode files are gone and a structural test stops them coming back; the one suite failure was in code this item could not reach.

## Time

| Row | Task | Kind | Model | Effort | Predicted | Actual | Waited | Added | Flag | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Structural test committed and failing on the legacy files | positive-control | claude-opus-5-5 | low | 0 min (median of 36 runs) | 0 min | — | — | — | C1 control exit 1: (a)(b) fail as stated |
| 2 | Legacy barrel and engines deleted; perf test re-pointed; dead build rule removed | dead-code-removal | claude-opus-5-5 | low | 0 min (median of 36 runs) | 3 min | — | — | — | C2 39f16cbf; DW1-5,7 pass; tsc 0 |
| 3 | Suites, typecheck and build green; merged and pushed | merge-and-verify | claude-opus-5-5 | low | 0 min (median of 36 runs) | 0 min | — | — | — | full suite run1 1 fail (sync-queue clearQueue, base writer, KF-2 class), run2 exit 0 2051 pass; build 0; merged --no-ff |

Estimate 0m (the first listing, sequential rows) · Actual 3m (measured working time, sequential rows)

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | DW1 `git ls-files src/modes` (re-run on `origin/main`) | listing | `src/modes/ModeInterface.ts` only | exactly that | Pass | was 5 files | — |
| 2 | DW2 legacy imports in tests/config | `git grep` exit | 1, empty | 1, empty (re-run) | Pass | — | — |
| 3 | DW3 `src/modes/NarrateMode` (amended) | `git grep` exit | 1, empty | 1, empty (re-run) | Pass | — | — |
| 4 | DW4 positive control | C1 run | exit 1, (a)(b) fail | exit 1, (a)(b) fail, (c) pass (memo) | Pass | — | — |
| 5 | DW5 seven suites | `npx vitest run …` | exit 0 | exit 0, 112 tests (memo) | Pass | — | — |
| 6 | DW6 full suite | `npm test` | exit 0 | run 1 exit 1 (1 failure); run 2 exit 0, 2,051 passed / 1 skipped (memo) | Pass on rerun | — | low |
| 7 | DW6 build and typecheck | exit codes | 0 | 0 / 0 | Pass | — | — |
| 8 | DW7 fence | `git diff --name-status 03e218bd^1 03e218bd` | 4 D, 2 M, 1 A + memo/time log | exactly that | Pass | — | — |
| 9 | Full-suite failure `tests/sync-queue.test.js > enqueue and getPendingOps > clearQueue empties all pending ops` | error text | captured | not captured | — | — | low |

## Interpretation

Finding 9 is classified as an **infrastructure failure, cause not established**. The error text was not captured, so it cannot be named. The test exercises the base's fixed-`.tmp` `saveQueue` (`main/sync-queue.js`), the writer behind BUG-185 and the Windows `EPERM` rename class (KF-2). This item's diff (four deleted unimported files, one test import, one config line) cannot reach it, and the rerun passed. Completion evidence holds.

## Proposed Dispositions

- Finding 9 → accepted with disclosure (owner-approved 2026-10-13). Re-check once SETTINGS-WRITE-DURABLE-1 (which replaces this writer and adds a rename retry) is on `main`; file a bug if it recurs.
- Effort calibration (0-minute pricing for full-suite rows) → the next roadmap review.

## Mid-Dispatch Decisions

None. The gate-3 and test-(c) amendment was made by the 2026-10-13 roadmap review before dispatch, not mid-dispatch.

## Lessons

- **New:** No new lesson — the spec-time defect is LL-131's own trap (a census matching an identifier instead of a reference), recorded as a recurrence under LL-131; the run itself followed LL-131, LL-139 and standing rule 43 exactly.
- **Applied:** LL-131 — held in execution (gates keyed on legacy paths and import specifiers after the amendment); did not hold at spec time (2026-10-12 gate 3); status record appended.
- **Applied:** LL-139 — held: the deletion list came from the import census, and the one remaining importer was an edit site.
- **Applied:** LL-150 — held: no stylesheet or asset deleted.
- **Applied:** LL-138 — held: the structural test failed (a)(b) on the legacy files before they were deleted.
- **Applied:** LL-143 — held: every gate dry-run on `05a5480a` and passed at its exact exit code.
- **Applied:** LL-147 — held: the full suite ran on the owner's machine.
- **Applied:** LL-149 — held: typecheck and build listed and exit 0.
- **Applied:** LL-136 — held: the fence exempted the memo and the time log.

## Files Created

- **Removed (temporary):** none
- **Committed:** 3 (`tests/modeLegacyRetired.test.ts`, the staging memo, the time log)
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** `created-files` exit 0 (base `03e218bd^1`)

The staging memo `Memo.CLEANUP-MODE-BARREL-1.GovernanceStaging.2026-10-13.md` carries evidence only and no fold-in instructions. It stays, as earlier memos do.

## Governance Updates

- `docs/governance/LESSONS_LEARNED.md`: status record under LL-131 (recurrence at spec stage).
- `ROADMAP.md`: completed-summary row; specification archived to `docs/planning/.Archive/ROADMAP_legacy.md`; Stage 4 note and queue line updated.
- `CLAUDE.md`: queue line.

## Roadmap & Queue Movement

- **Retired:** CLEANUP-MODE-BARREL-1 — Completed 2026-10-13, Seq cleared.
- **Elevated:** none — the head is NARRATE-REBUILD-1 (Seq 9, In Flight).

## Next Work Pointer

None printed here (`/next-pointer`).

## Gates

Done-when 1–7 pass. **Buffer check:** after this crossing the queue holds SETTINGS-WRITE-DURABLE-1 and UX-POLISH-1 (both awaiting the owner's G2 smokes before close-out), READER-VISUAL-DIAG-1 and the DEV-PERF-MEASURE-1 stub. Once the first two close, dispatch-ready depth falls to 1, below the target of 5 and below Rule 5a's floor of 3. A `/roadmap-review` is due then.

## Git Hand-Off

Committed on `eb/closeout-buffer-2026-10-13`, merged `--no-ff` to `main` and pushed (`policy.git` push).
