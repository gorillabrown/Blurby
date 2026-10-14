---
sprint: TEST-BUDGET-WORDINDEX-1
date: 2026-10-13
runtime: 0m (timing --summary; both rows priced and measured at 0 min)
tokens: not measured
status: all-pass
---

# Pointer Close-Out: TEST-BUDGET-WORDINDEX-1

Origin: roadmap item, Seq 10 (Stage 7). Branch `eb/test-budget-wordindex-1` from `main` @ `05a5480a`; merged `76956729` (`--no-ff`), pushed. Dispatched beside NARRATE-REBUILD-1 under the 2026-10-13 parallel run plan.

## Sprint Brief

**Goal:** Stop the 5,000-span word-index build test from failing full-suite gates under load (BUG-186).
**Result:** `tests/wordPositionIndex.test.ts` budget raised from 200 ms to 1,000 ms, with a one-line comment giving the reason; every coverage assertion kept; BUG-186's status line set; full suite 2,048 passed, typecheck exit 0; merged `76956729`.
**Learned:** No new lesson — the same change as TEST-TIMEOUT-HEADROOM-1 (headroom for a load-sensitive test), and LL-143 (standing rule 44) and LL-136 (standing rule 41) held.
**Recommend:** Close BUG-186 outright: the fix is test-only, so the rebuild gate (standing rule 35) does not apply.
**Bottom line:** A one-line headroom fix that removes a known source of false-red gates for every later full-suite run.

## Time

| Row | Task | Kind | Model | Effort | Predicted | Actual | Waited | Added | Flag | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Budget raised and bug status updated | test-edit | claude-opus-5-5 | low | 0 min (median of 36 runs) | 0 min | — | — | — | DW1 both gates pass; DW4 status line exact; fence exact |
| 2 | Full suite and typecheck green, merged and pushed | merge-and-verify | claude-opus-5-5 | low | 0 min (median of 36 runs) | 0 min | — | — | — | npm test exit 0 (2048 pass); DW2 exit 0 5/5; tsc 0; merged --no-ff |

Estimate 0m (the first listing, sequential rows) · Actual 0m (measured working time, sequential rows)

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | DW1 budget gate | `git grep -c -F 'toBeLessThan(1000)'` / `(200)` on `origin/main` | `:1` exit 0 / exit 1 | `:1` exit 0 / exit 1 (re-run at close-out) | Pass | — | — |
| 2 | DW2 file suite | `npx vitest run tests/wordPositionIndex.test.ts` | exit 0, 5/5 | exit 0, 5/5 (time log) | Pass | — | — |
| 3 | DW3 full suite and typecheck | `npm test`; `npm run typecheck` | exit 0 | 2,048 passed, exit 0; tsc 0 (time log) | Pass | — | — |
| 4 | DW4 BUG-186 status line | exact text | spec text | exact (re-read on `origin/main`) | Pass | — | — |
| 5 | DW5 fence | `git diff --name-status 76956729^1 76956729` | 2 paths + time log | `M BUG_REPORT.md`, `M tests/wordPositionIndex.test.ts`, `A Timing…jsonl` | Pass | — | — |
| 6 | Effort calibration | time-log pricing | a plausible estimate | 0 min "median of 36 runs" for a row that ran a full suite | — | — | info |

## Interpretation

Every Done-when row passes. Finding 6 is retrospective only: the pricing history gives 0 minutes to rows that include a full `npm test` run, so effort calibration for small items is not informative. It goes to the next roadmap review.

## Proposed Dispositions

- BUG-186 → **RESOLVED** (test-only fix; no binary to rebuild). Owner-approved 2026-10-13.
- Finding 6 → the next roadmap review (effort calibration).

## Mid-Dispatch Decisions

None.

## Lessons

- **New:** No new lesson — the same change as TEST-TIMEOUT-HEADROOM-1 (inline test-harness budget with a reason comment), and the risks were covered by LL-143 (standing rule 44, dry-run gates) and LL-136 (standing rule 41, time-log exemption).
- **Applied:** LL-143 — held: both search gates were dry-run on the base and passed at exact exit codes.
- **Applied:** LL-147 — held: the full suite ran on the owner's machine.
- **Applied:** LL-149 — held: typecheck was in the Done-when list and exited 0.
- **Applied:** LL-148 — held: the bug status line names the item, not a merge sha.
- **Applied:** LL-136 — held: the fence exempted the time log.

## Files Created

- **Removed (temporary):** none
- **Committed:** 1 (`docs/governance/close-outs/Timing.TEST-BUDGET-WORDINDEX-1.jsonl`)
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** `created-files` exit 0 (base `76956729^1`)

## Governance Updates

- `docs/governance/BUG_REPORT.md`: BUG-186 status → RESOLVED (TEST-BUDGET-WORDINDEX-1, merge `76956729`).
- `ROADMAP.md`: completed-summary row; specification archived to `docs/planning/.Archive/ROADMAP_legacy.md`; queue line updated.
- `CLAUDE.md`: queue line and open-bug list.

## Roadmap & Queue Movement

- **Retired:** TEST-BUDGET-WORDINDEX-1 — Completed 2026-10-13, Seq cleared.
- **Elevated:** none — the head is NARRATE-REBUILD-1 (Seq 9, In Flight).

## Next Work Pointer

None printed here (`/next-pointer`).

## Gates

Done-when 1–5 pass. Buffer check: see CLEANUP-MODE-BARREL-1's close-out of the same date.

## Git Hand-Off

Committed on `eb/closeout-buffer-2026-10-13`, merged `--no-ff` to `main` and pushed (`policy.git` push).
