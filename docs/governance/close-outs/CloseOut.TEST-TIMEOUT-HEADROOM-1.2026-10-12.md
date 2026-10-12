---
sprint: TEST-TIMEOUT-HEADROOM-1
date: 2026-10-12
runtime: not measured (no time log)
tokens: not measured
status: all-pass
---

# Give the three slow tests explicit time limits Close-Out  *(TEST-TIMEOUT-HEADROOM-1)*

**Goal:** Stop the three tests that time out under full-suite load (KF-3) from failing the suite, so the full suite can pass reliably.
**Result:**
- **Time limits:** `tests/readerModeBoundaries.test.ts` G1 and the two `tests/updateInstallGating.test.tsx` tests now carry a per-test 30 s timeout.
- **Typecheck:** under a mid-dispatch amendment, `tests/seenBatcher.test.ts` types its `onFlush` mock, so `npm run typecheck` exits 0 again.
- **Suite:** the full suite passed twice in a row on the owner's machine (3,410 passed, 0 failed, 133 skipped).
- **Where it ran:** the first, cloud-container run stopped before merging, and the planner finished the item on the owner's machine.
- **Merge:** `--no-ff` as `072a65f3`, pushed.

**Learned:** LL-146 — Evidence that looks like a test is a test: never commit `*.test.*` files outside the suite. LL-147 — A gate defined on the owner's machine needs a local session; one-click task chips start cloud sessions.
**Recommend:** With the Ctrl+K and e-ink fixes closed out alongside, the Narrate removal is the head and dispatches next.
**Bottom line:** The suite is green and the typecheck is clean on the machine that matters, which every later gate, the Narrate removal's included, depends on.

- **Item:** TEST-TIMEOUT-HEADROOM-1 (monday item 13261060490, Seq 5)
- **Branch / merge:**
  - `eb/test-timeout-headroom-1` from `c77d10e5`;
  - commit `ff2cd5f1`;
  - merge `072a65f3` onto `c77d10e5`, pushed to `origin/main` together with the branch.
- **Specification:** ROADMAP.md § TEST-TIMEOUT-HEADROOM-1 at `c77d10e5`, including its mid-dispatch amendment. This close-out archives it to `docs/planning/.Archive/ROADMAP_legacy.md`.
- **runtime:** not measured (no time log)

## Findings

Verified by the planner on the owner's Windows machine, not taken from an executor summary.

| # | Done when | Result | Evidence |
|---|---|---|---|
| 1 | `git grep -c -F '}, 30_000);'` prints `:1` and `:2` | PASS | On `ff2cd5f1`, in PowerShell 7: `tests/readerModeBoundaries.test.ts:1`, `tests/updateInstallGating.test.tsx:2`, exit 0. No other test in either file gained a timeout |
| 2 | The two files' targeted run exits 0 | PASS | `npx vitest run tests/readerModeBoundaries.test.ts tests/updateInstallGating.test.tsx`: 2 files, 10/10 |
| 3 | Full `npm test` exits 0 twice in a row on this machine | PASS | Run 1: exit 0, 234 passed and 1 skipped of 235 files, 3,410 passed and 133 skipped of 3,543 tests, 42.0 s. Run 2: identical counts, 41.6 s. None of the amendment's exceptions was needed |
| 4 | `npm run typecheck` exits 0 | PASS | Exit 0 on `ff2cd5f1`. On `c77d10e5` it exited 2, on `tests/seenBatcher.test.ts(14,58)` TS2322 |
| 5 | The diff is exactly the amended file list | PASS | `git diff --name-only refs/remotes/origin/main` at the sprint tip lists exactly `tests/readerModeBoundaries.test.ts`, `tests/seenBatcher.test.ts` and `tests/updateInstallGating.test.tsx` |

Other checks:
- **Integrated identity:** `git diff --quiet ff2cd5f1 072a65f3` holds, so the tree tested is the tree published.
- **Accepted population:** 3,410 tests passed. **Excluded:** 133 skipped, the same count as before the change. **Failed:** none, in either run.

## Interpretation

The change does what KF-3 needed: the three tests no longer race the 10 s default under load. The first run went to a cloud container (a Linux environment) and could never prove Done-when 3, which names the owner's machine. Its full suite there also failed for two reasons outside the item:
- two OutsideAudit.10 evidence scripts named `*.test.*`, which vitest collected from `main` since `d4184a1c`, a planner error now fixed in `c77d10e5`;
- the pre-existing `seenBatcher` typecheck error.

Finishing on the owner's machine removed both doubts.

## Proposed Dispositions

| # | Finding | Disposition (confirmed by the owner 2026-10-12) |
|---|---|---|
| 1 | All five *Done when* rows pass, amendment included | Close the item |
| 2 | The cloud run could not satisfy the machine-bound check | Resolved by the mid-dispatch decision below; LL-147 |
| 3 | The audit evidence files were collected as tests | Resolved in `c77d10e5`; LL-146 |
| 4 | The cloud container still holds commit `f8064b2` and generated files | Nothing to preserve. The owner stops or archives that session |
| 5 | The cloud session moved the board item to In Flight (started 2026-10-12) | This close-out's register write follows the full handshake |

## Mid-Dispatch Decisions

#### Mid-Dispatch Amendment — 2026-10-12

**Pause point:** The first run, in a cloud container, stopped before merging. Typecheck and full-suite failures outside this item stood in its way, and the safety check refused its push.
**Decision:** Type 1b — Advance, planner-originated. The owner approved it on 2026-10-12 (option A): execution moves to the owner's machine.
**Rationale:**
- Done-when 3 is defined "on this machine", which a cloud container cannot satisfy. On the owner's machine, with the three edits, none of the three slow tests failed in two full runs.
- The typecheck failure is pre-existing on `main`. `tests/seenBatcher.test.ts` lines 8 and 13 hold an untyped `vi.fn()` added by LIBRARY-SETTINGS-FIX-1 (`685b7f35`), and it blocks every later typecheck gate.
- Two OutsideAudit.10 evidence scripts named `*.test.*` had been collected by vitest since `d4184a1c`. The planner renamed them to `*.test.ts.txt` and `*.test.js.txt`, in the same planning merge as this amendment.

**Scope change:**
- **Edit sites:** add `tests/seenBatcher.test.ts`.
  - Line 8: `  let onFlush: ReturnType<typeof vi.fn>;` becomes `  let onFlush: ReturnType<typeof vi.fn<(ids: string[]) => void>>;`.
  - Line 13: `    onFlush = vi.fn();` becomes `    onFlush = vi.fn<(ids: string[]) => void>();`.
  - With these, `npm run typecheck` exits 0 (planner-verified on the owner's machine).
- **Staging plan and Done-when 5:** the commit, and the `git diff --name-only` list, hold exactly the three test files.
- **Done-when 3:** every test must pass in both runs, with two exceptions.
  - `tests/qwenRuntimeHardening.test.js` failing only under full-suite load, while passing alone, does not fail the row, because NARRATE-REMOVE-1 deletes it. Record its runs in the close-out.
  - `tests/wordPositionIndex.test.ts` "builds a 5,000-span section and keeps lookup coverage intact" asserts `buildTimeMs < 200`. If it fails in one run and passes alone, record it as a new low bug, not fixed here. If it fails in both runs, stop with BLOCKER(USER).

**Follow-up items:**
- A low bug for the load-sensitive word-index timing assertion, if it fails.
- Lessons LL-146 (evidence named like tests) and LL-147 (machine-bound gates need a local session).
- The missing typecheck row in LIBRARY-SETTINGS-FIX-1 belongs to that item's close-out.

**Close-Out Preservation:**
- **Where:** migrate this block verbatim into `docs/governance/close-outs/CloseOut.TEST-TIMEOUT-HEADROOM-1.<date>.md`, under §Mid-Dispatch Decisions.
- **When:** before the spec is archived.
- **Risk if skipped:** the third file and the narrowed Done-when 3 lose their authority, and a later reader sees an out-of-fence edit.

## Lessons

- **New:**
  - LL-146 — Evidence that looks like a test is a test: never commit `*.test.*` files outside the suite. Recorded 2026-10-12 during the mid-dispatch decision.
  - LL-147 — A gate defined on the owner's machine needs a local session; one-click task chips start cloud sessions. Recorded with LL-146.
- **Applied:**
  - LL-136 (standing rule 41) — held: no time log was kept, so the exact-path fence never met one.
  - LL-135 — held: the dispatch prompt carried the reconciliation recipe, and the cloud run executed a bash translation of it.
  - Standing rule 13 — held: the cause was fixed rather than waived, and the amendment's load exceptions went unused.
  - LL-138 — considered, not applicable: no behaviour change needed a positive control.

## Files Created

- **Removed (temporary):** none.
- **Committed:** the three test files in `ff2cd5f1`.
- **Ignored:** none.
- **Reverted (owner-approved):** `tests/perf-baseline-results.json` in the sprint worktree, regenerated by `npm test` and never staged.
- **Guard:** `created-files --base c77d10e5` exits 0 after the revert.

## Governance Updates

- LESSONS_LEARNED: LL-146 and LL-147 were recorded during the decision. No change here.
- ROADMAP: the specification is archived, Stage 6 records the item as completed, and the header is updated.
- CLAUDE.md: the queue line is updated.

## Roadmap & Queue Movement

- **Retired:** TEST-TIMEOUT-HEADROOM-1, Completed in the register and recorded in the terminal ledger as TR-062.
- **Elevated:** NARRATE-REMOVE-1 (Seq 8) becomes the head once the e-ink and Ctrl+K close-outs, which cross in the same session, also read Completed.

## Gates

- **Queue depth:** one dispatch-ready item remains against a target of five. Owner ruling R1 waives the Rule 5a and standing rule 8 stop for NARRATE-REMOVE-1's dispatch only. `/roadmap-review` backfills at its close-out.

## Git Hand-Off

- [x] Committed on `eb/closeout-2026-10-12`, merged `--no-ff` to `main` and pushed (policy.git = push).
