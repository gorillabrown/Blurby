# Roadmap review 2026-11-06: Phase B assessment

*Provenance.* `kpis --json` through the provider (connector and snapshot, `notion:database/3f87c96cc31e800580cfe019c89a56ca`, taken 2026-11-07T05:32:20Z, not stale). Previous complete review: 2026-11-03-2. Its register copy is `2026-11-03-2-live-register.json` (203 items). Findings are from the registered role. Board comments: 0 open.

## Read

The desktop release is the only thing moving, and it has stopped on one host. Nothing else is wrong with the plan: the register is clean and no scope went backward. Until the owner resumes the work and RodneySr's session and display return, no item can move.

## B.1 Work remaining

| Figure | Value |
|---|---|
| Total items | 221 |
| Completed / Dissolved / Superseded | 95 / 9 / 6 |
| In Flight | 50 |
| Queued | 61 |
| Blocked | 0 |
| Complete by count | 49.8% |
| Effort totals and complete by effort | **Not computable:** 24 items have no Effort value, 20 of them active (listed in the plan) |

The register shows 0 Blocked, though the release chain is held by the pause. The hold is recorded in the roadmap and the close-out, not in a status.

## B.2 Pace

No deadline is declared, so pace against a date is not computable. The first finish line has no dated deadline (owner, 2026-11-03).

## B.3 Scope discipline

Window: 2026-11-03-2 to now. Calls below are judgements, and each counts once.

| Class | Count | Items |
|---|---|---|
| Forward | 22 | The 21 RC close-outs and ERROR-LOG-CAP-1. All are part of a fully functional Windows app |
| Sideways | 1 | The governance sweep (GOV-SWEEP-FOLLOWTHROUGH-1) |
| Backward | 0 | No revert, no reopened terminal item, no withdrawn release |

**Score:** 22 / 23 = 0.96.

**Shipped with no register item:** the planning and close-out records through the pause (`83ed8c4d`), and gate (1) run 6 and its package record. All are sideways and unscored.

**Status moves that are not terminal:** CHAPTER-STEP-CFI-1 went from In Flight to Queued, BLOCK-TEXT-ORDER-1 went from Queued to In Flight, and the two diagnoses returned to Queued in this review.

**Added scope: 18 items, unscored.**

| Would be | Items |
|---|---|
| Forward (Windows app) | NARRATE-ARRIVAL-SYNC-1, UNCERTIFIED-ANCHOR-HOLD-1, CFI-POSITION-CONSISTENCY-1, FLOW-SAVE-AS-YOU-GO-1, NARRATE-SAVE-AS-YOU-GO-1, PAGE-LINK-HELD-TURN-1, DEPS-REFRESH-1, NARRATE-FRAME-GATE-1, PDF-CANVAS-ARM64-1, LIBRARY-DELETE-SAFE-1, FLOW-RESTAMP-CURRENT-1, FOCUS-RESTAMP-CURRENT-1, NARRATE-RESTAMP-CURRENT-1, PAGE-SENTENCE-KEYS-1, TOC-FRAGMENT-WORD-1, XHTML-PARSE-MEASURE-1 |
| Sideways | BUILD-CHAIN-REFRESH-1 (after the release), FOOTNOTE-INLINE-READ-1 (owner feature, Seq 141.5) |

**Scope grew faster than it closed.** 23 items closed and 18 arrived in three days, and 16 of the 18 are release work found by the release gates. That is the gates working, not drift, but the release set is larger than it was on 2026-11-03.

**Held entries:** none open, so none absorbed or withdrawn.

## Carried from the previous cycle

- **Promotion candidates.** 16 candidates have stood undecided since 2026-11-02. This review has 23 close-outs to test them against, so D.4 decides them.
- **F-002 (lessons hygiene).** Deferred to "the next review that has close-outs to read". That is this one, so D.4 takes it.

## Open findings

| Finding | First raised | Proposed for the plan |
|---|---|---|
| F-031: two count gates were changed by later authorized work | 2026-11-04 | Fixed by a count amendment through the planner, the owner and an independent reviewer, before those items close |
| F-033: the 4.25:1 light-theme link accent is tracked nowhere, and the contrast script is outside the repository | 2026-11-04 | Needs an owner. Open a stub item |
| F-034: the fixed-layout re-stamp follow-up is filed nowhere | 2026-11-04 | Needs an owner. Open a stub item |
| F-036: long frames came from RodneySr's display being off | 2026-11-05 | Fixed by NARRATE-FRAME-GATE-1 |
| F-037: BLOCK-TAG-CASE-1's live checks were never recorded | 2026-11-05 | Fixed by the gate (1) rerun and smoke row (w) |

None has yet stayed open across two reviews.

## Learning figures

Live lessons 142 (LL-196 is the latest). Lesson yield 1.51 per close-out, held rate 0.98, repeated-trap rate 0.02 (inferred), effort calibration 0.65, row error 0.89, total error 0.75. Time estimates remain weak: row error near 0.9 means single-row predictions are poor, and only totals are usable.

## Risks

1. **One host carries the release.** RodneySr's session dropped about 15:48 on 2026-11-05, and the cause is unknown from here. Everything behind BLOCK-TEXT-ORDER-1 needs it, and the bridge's HTTP 409 was never diagnosed.
2. **The release set keeps growing.** Each gate run has added items. A rerun will likely add more.
3. **Gate (2) depends on the owner's time.** 27 older items, the batched smoke rows and row (w) all close there.
4. **The account gates from 2026-11-03-2 still stand.** Nothing has started on them, and the Azure and Play validations take days.
