---
dispatch: RESTAMP-RERUN-RACE-1
date: 2026-11-04
runtime: 42m
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: RESTAMP-RERUN-RACE-1

## Dispatch Brief

**Goal:** Find out whether page reading's (PageReaderView, Foliate) re-stamp effect, which renumbers a section's word spans when the book's word list arrives, can run twice on one section at once, and fix it if it can.
**Result:** A deterministic harness (rc0, rr1-rr5) showed the race is real (rr4 and rr2 red on the base), so branch (A) applied: red first `dd0b8524`, fix `b1f7097c` in the re-stamp effect of `src/reader/modes/page/FoliateView.tsx` (wait on any registered wrap, re-check `cancelled`, read `sectionStart` after the wait, register the re-stamp's own wrap).
**Learned:** LL-190 — apply a decision rule's clauses as written; LL-191 — a concurrent first dynamic import under StrictMode in vitest can miss `vi.mock`.
**Recommend:** Close it as integrated; the fixed-layout numbering follow-up (FIXED-LAYOUT-RESTAMP-1) is filed separately as a finding.
**Bottom line:** The re-stamp can no longer interleave with itself, readers see no difference, and the fix is merged.

## Time

Timing log: `docs/governance/close-outs/Timing.RESTAMP-RERUN-RACE-1.jsonl`. No prediction was recorded (estimate 0m); actual 42m (41.8 min), complete, nothing parked.

| # | Row | Kind | Added | Predicted | Actual | Waited | Flag |
|---|-----|------|-------|-----------|--------|--------|------|
| 1 | Identity census measured (rc0) and tabled with file:line in the evidence file | diagnosis | no | none | 6.9m | 0 | none |
| 2 | Deterministic interleave harness (k1 holds) with rr1-rr5 run on the base, each oracle's result recorded | positive-control | no | none | 6.0m | 0 | none |
| 3 | Decision applied: red committed then the effect fixed (A) | renderer-fix | no | none | 5.0m | 0 | none |
| 4 | Targeted tests, suite, typecheck and build green; fence checked; memo and time log; pushed | verify-gate | no | none | 17.0m | 0 | none |
| 5 | Rule 53 arm64 package built, launched on a proved scratch profile, and sent to Blurby.Brain | packaging-verify | no | none | 6.9m | 0 | none |

## Findings

Evidence population: the committed memo `Memo.RESTAMP-RERUN-RACE-1.GovernanceStaging.2026-10-23.md` plus a read-only check of origin/main 14ce3d24. Suite population: gate (1) run 6 on 14ce3d24, 3,048 passed, 0 failed, typecheck 0, 0 crashes. Cited exactly as gate (1) run 6, partial; D6 cold, D3 2.00x and Q3 s2 pending a quiet rerun. No row of this item depends on those unjudged rows.

Memo evidence, not re-run here: the rule 53 arm64 launch ran on the item's own branch build `b1f7097c`. The item has no user-visible behaviour and no owner smoke.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| DW1 | Identity census (rc0) and evidence file | Non-empty `bookWordSections` identities per document | Measured, tabled | 1 per document; `describe` :884, (rc0) :943; evidence file at origin/main | Pass | n/a | Pass |
| DW2 | Harness rr1-rr5, k1 | Spans held | k1 holds | k1 = 50 spans first try; (rr1)-(rr5) at :991-:1041; `mount({strict})` :133 | Pass | n/a | Pass |
| DW3 | Decision rule | Branch | (A) when red | rr4 red on base (`o7 section 1 start: expected +0 to be 5`), rr2 red; all four edits present at `FoliateView.tsx:1114-1125` | Pass | n/a | Pass |
| DW4 | Targeted tests | `pagePositionSave` | All pass, none edited | Memo 61/61, no existing test edited; (pr1) later reworded by `a7e4ff08` (same assertion, `vi.waitFor` on the end state) | Pass | n/a | Pass |
| DW5 | Suite, typecheck, build | Counts | Green | Memo 2,476 passed / 2 skipped / 0 failed (two earlier runs each had one load flake, green alone: `folderWatcher`, `narrate.runaway`); gate (1) run 6 above | Pass | n/a | Pass |
| DW6 | Fence | Files changed | Page `FoliateView`, its test, evidence file | Matches; nothing in `main/`, shared core, Flow, Focus or Narrate | Pass | n/a | Pass |
| DW7 | Rule 53 package | Arm64 launch, asar | Alive at 25 s, identical | Scratch profile proved at 0.44 s, alive at 25 s, no dump, asar 11,581 entries, dist byte-identical; RC pair covers the merged tree | Pass (memo) | n/a | Pass |

## Interpretation

One case has no test: a cancelled run returns without renumbering when the next set is empty. The census shows the set is never emptied within a mount, so this is a named stop reason, not a failure.

## Proposed Dispositions

- **Accept** all rows. **Log** FIXED-LAYOUT-RESTAMP-1 (Fold-in 2): it is filed as a finding by a separate edit, not in this report.

## Mid-Dispatch Decisions

Tier-1 builder decisions recorded in the memo:
- **Deviation 1:** the first build took branch (B) by arguing the rr4 fixture is unreachable; Solon ruled the decision rule is literal, and the item was rebuilt as (A).
- **Deviation 2:** rr2 is committed as one of the red cases under (A).
- **Deviation 3:** rr5 stubs `customElements.define` during the StrictMode mount, restored in `finally`.
- **Deviation 4:** Plato's quality fixes applied (timer reset, define-spy restore, run 2 proved by a probe, the reachable-shape rr4 dropped).

## Lessons

- **New:** LL-190 — A decision rule's clauses are applied as written; reachability arguments go to the planner. LL-191 — Under React StrictMode in vitest, a concurrent first dynamic import can miss `vi.mock`.
- **Applied:** LL-142 — held: the census was measured, and the decision followed the rule's checkable clauses after review.
- **Applied:** Standing rule 43 — held: red first, alone (`dd0b8524`).
- **Applied:** LL-166 and LL-165 — held: verdicts read state through oracles; the scratch profile was proved before the launch.
- **Applied:** Standing rules 36, 47, 48, 50, 52 and LL-136 — held: lines re-grepped, gates run, no existing test edited, launch script saved as `.txt`, fence lists the time log.

## Files Created

- **Removed (temporary):** none
- **Committed:** memo and time log committed earlier; this report committed by Blurby.Roadmap
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** not run per item
- **Footprint:** none

## Governance Updates

- ROADMAP Fold-in 1 ("built and held") and CLAUDE.md Fold-in 5 (queue line) are stale now the item is merged; the section moves to the legacy archive instead.
- Fold-in 2, the FIXED-LAYOUT-RESTAMP-1 stub (fixed-layout `getContents()` has no `index`, so the re-stamp numbers every page from 0): filed as a finding by a separate edit, not here.
- Fold-ins 3 and 4 become LL-190 and LL-191.

## Roadmap & Queue Movement

- **Retired:** RESTAMP-RERUN-RACE-1 — retired from In Flight; no sequence change.
- **Elevated:** none.

## Next Work

FIXED-LAYOUT-RESTAMP-1 is tracked as a finding (filed separately).

## Gates

- Integrated identity: branch tip `79e1d9d0` is an ancestor of origin/main; merged by c5bb507f (RC-INTEGRATION-WINDOW); tested tree 14ce3d24. The RC window's package record: x64 pair on RodneySr at 70d64237, Brain1's confirmation, arm64 launch on Rodney from c5bb507f (`C:\Projects\Blurby-artifacts\rc-merge-20261103\`). The raw run 6 record is on RodneySr (`C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` there).
- Authority to close: Blurby.Brain1's run 6 close-out ruling (2026-11-03) plus the item's own evidence; owner approval 2026-11-04 of the close-out plan.

## Git Hand-Off

- [x] Committed by Blurby.Roadmap.
