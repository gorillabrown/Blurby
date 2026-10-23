# Close-out — JSONSTORE-TIMEOUT-1: Give the jsonStore concurrency test real headroom (2026-10-22)

runtime: not measured (no time log; XS test-only item, every step recorded in the staging memo)

**Goal:** stop `tests/jsonStore.test.js` failing under full-suite load, so it can leave Stage 8's closed list of admitted load failures.
**Result:**
- Test (a) gets a 30 s timeout.
- Tests (d) and (e) wait for earlier writes (`whenWritesSettled`) and count only their own `.tmp` renames, so a timed-out (a) can no longer fail them.
- The closed list now admits exactly two load failures (folderWatcher and readerModeBoundaries). Any jsonStore failure is now a product failure.
- Merged as `8e834ea3` (branch tip `f84d5760`).

**Learned:** No new lesson — the item followed standing rule 50 (LL-156): the closed-list entry left together with its cause. LL-152 held: three runs before the change and three after, all identical.
**Recommend:** nothing further for this file. Gate (1)'s quiet run now reads jsonStore failures as real.
**Bottom line:** one fewer admitted load failure in the release gate.

## Evidence (Done-when, verified 2026-10-22)

| # | Criterion | Evidence | Result |
|---|---|---|---|
| 1 | Positive control on the base | With (a) at a temporary 1 ms timeout, all 3 runs gave the same result: (a) timed out, (d) saw 4 renames instead of 3, and (e) saw 8 instead of 4. Exit 1. Restored; `git diff -- tests` empty (memo). | pass |
| 2 | Isolation after the change | Same 1 ms on (a), 3 of 3 runs: only (a) fails; (d), (e), both saveJSON tests and (g) pass. Restored (memo). | pass |
| 3 | The file passes | 6 of 6, exit 0. Re-run after taking in `46cd71ae`: 6 of 6. | pass |
| 4 | Shape | `30_000` appears once, at `:32`; `await whenWritesSettled()` appears 3 times. | pass |
| 5 | Suite and typecheck | On `012c58b1`: 176 files, 2,419 passed, 1 skipped, 0 failed. Typecheck 0. | pass |
| 6 | Fence | `git diff --name-status 8e834ea3^1 8e834ea3`: `tests/jsonStore.test.js` and the memo (planner-verified). | pass |
| 7 | Closed-list fold-in | Applied by this close-out to the `^**Release gate` line. `ROADMAP.md` now matches "admits exactly two load failures" once. | pass |

- **Populations:** the full suite, with 1 skipped test (pre-existing). No failure was excluded.
- **Review:** approved. The narrowed spies are not vacuous: a changed temp path fails (d) and (e).

## Mid-Dispatch Decisions

None.

## Lessons

No new lesson — applied standing rules 36, 41, 43, 44, 46, 47, 48 and 50 (LL-156), and LL-152. All held. LL-164 was checked: the specification appended no lesson-status line.

## Files Created

- `docs/governance/close-outs/Memo.JSONSTORE-TIMEOUT-1.GovernanceStaging.2026-10-22.md`: committed with the merge; its one fold-in is applied here.
- The worktrees `jsonstore-timeout-1` and `jsonstore-timeout-1-merge` are kept (maintenance).
