# Close-out — KF2-WAIVER-RETIRE-1: Retire the KF-2 rename waiver (2026-10-22)

runtime: not measured (no time log; XS docs-only item, every step recorded in the staging memo)

**Goal:** retire the KF-2 waiver (a Windows EPERM on rename under full-suite load) on recorded clean runs, and write Stage 8's closed list of admitted load failures down by error type.
**Result:** the Stage 8 release-gate paragraph now says KF-2 is retired. It also names the three tests the closed-list rule admits, by error type (`tests/jsonStore.test.js`, `tests/folderWatcher.test.js`, `tests/readerModeBoundaries.test.ts`), so a load allowance cannot readmit a real rename error. An LL-156 outcome record was appended. Merged `3f4798b2` (branch tip `a6c4ee37`).
**Learned:** LL-164: a lesson-status write in an older specification can silently undo a newer promotion. The run's specified LL-156 "held" record overrode the promotion to standing rule 50 made at the 2026-10-22 review.
**Recommend:** JSONSTORE-TIMEOUT-1 (in flight) takes `tests/jsonStore.test.js` off the closed list at its close-out.
**Bottom line:** KF-2 is gone from live text. The run also exposed a quiet governance trap, now recorded.

## Evidence (Done-when, verified 2026-10-22)

| # | Criterion | Evidence | Result |
|---|---|---|---|
| 1–3 | Clean-run evidence cited; no stale waiver line | DW1 `:50`, DW2 `:62`, exit 0; DW3 exit 1, empty (memo) | pass |
| 4 | KF-2 restated as retired | Planner re-run on `main` @ `3f4798b2`: one line, `ROADMAP.md:349` | pass |
| 5 | Closed list written down | Planner re-run: the three-test pattern matches exactly 1 line | pass |
| 6 | LL-156 record | `LESSONS_LEARNED.md:1` (memo) | pass |
| 7 | No live waiver text outside history | Exit 1, empty; control 24 files, at least 17 as amended (memo) | pass |
| 8 | Every KF-2 line in ROADMAP.md is inside the spec or the restated line (amended 2026-10-22, Blurby.Brain) | Rule 50's line hash `c8b70300…92b43` unchanged; real run exit 0, empty; the look-alike-line control and the stray-line control each print and exit 1 (memo; plants made in scratch copies) | pass |
| 9 | Fence | `git diff --name-status 3f4798b2^1 3f4798b2`: `ROADMAP.md`, `LESSONS_LEARNED.md`, memo (planner-verified) | pass |

No suite was run: test tier None, docs only. Standing rules 47 and 48 do not bind.

## Findings and dispositions

| Finding | Disposition |
|---|---|
| Done-when 8 failed on three lines added after the specification was written. RENAME-RETRY-1's close-out archived two of them; the third, standing rule 50, is history. | Mid-dispatch amendment: exempt rule 50's exact line by its SHA-256, with a look-alike control (Blurby.Brain, option (a) with condition). Recorded in ROADMAP.md. |
| The specified LL-156 "Observation — held" record overrode LL-156's promotion to standing rule 50. | The close-out appended a restating `Promoted -> ROADMAP standing rule 50` record (append-only), and recorded **LL-164**. |

## Mid-Dispatch Decisions

- **Done-when 8 exemption (2026-10-22, Blurby.Brain, tier 1):** exempt standing rule 50's line by its exact text (SHA-256), not by prefix. Add a control that plants a look-alike `50. **LL-156` line with a live waiver phrase, and keep the stray-line control. Recorded as a mid-dispatch amendment in the specification.

## Lessons

- **New:** LL-164 — A lesson-status write in an older specification can silently undo a newer promotion (KF2-WAIVER-RETIRE-1, 2026-10-22).
- **Applied and held:** standing rules 41, 44 (every gate dry-run on the base; the controls go red), 46 and 50 (LL-156: the waiver was re-read against the moved writer), and LL-143.
- **LL-156:** promotion restated after the run's held record (status record, 2026-10-22).

## Files Created

- `docs/governance/close-outs/Memo.KF2-WAIVER-RETIRE-1.GovernanceStaging.2026-10-22.md`: committed with the merge.
- The worktrees `kf2-waiver-retire-1` and `kf2-waiver-retire-1-merge` are kept (maintenance).
