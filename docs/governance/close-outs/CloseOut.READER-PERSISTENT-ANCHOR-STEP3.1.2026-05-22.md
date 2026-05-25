---
sprint: READER-PERSISTENT-ANCHOR-STEP3.1
date: 2026-05-22
runtime: manual QA rerun
tokens: n/a
status: has-regressions
---

# Phase Close-Out: READER-PERSISTENT-ANCHOR-STEP3.1

## Sprint Brief

**Goal:** Verify whether Step 3.1 fixed the remaining persistent-anchor manual QA blockers before merge.
**Result:** S1, S4, and S18 are fixed, S5 improved, but S8 Flow double-underline and S12/S13 Narrate cursor/audio desync block the gate.
**Learned:** Visual cursor correctness is not enough for Narrate; audio-owned modes need human-audible sync gates.
**Recommend:** Keep `hotfix/reader-persistent-anchor` open and run a Step 3.2 repair for Narrate sync plus Flow single-cursor ownership.
**Bottom line:** Step 3.1 moved the branch forward, but it is still manual-QA-red and should not merge.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | S1 Page Jump Back | Within-chapter anchor recovery | Jump Back returns to hard-selected anchor | PASS, within-chapter returns 2/2 | Pass | Fixed | Pass |
| 2 | S4 Focus overlay | Active Focus render | RSVP single-word overlay renders and advances | PASS, active Focus renders words from anchor region | Pass | Fixed | Pass |
| 3 | S18 startup reopen | Reopen restore | Page opens at exact last-read word without auto-start | PASS, Page reopens at exact persistent position and Narrate resumes there | Pass | Improved | Pass |
| 4 | S5 Focus browse-away | Paused and active return affordance | Jump Back/Return appears after browse-away | PARTIAL, active Focus return works; paused Focus still has no affordance | Partial | Improved | Marginal |
| 5 | S8 Flow cursor ownership | Cursor visual count | Exactly one Flow underline/cursor | FAIL, `.flow-shrink-cursor` overlay and `.page-word--flow-cursor` both render | Fail | Regressed | Regression |
| 6 | S12 Narrate exact spoken sync | Cursor/audio agreement | Cursor follows heard narration without leading | FAIL, visual cursor leads audio | Fail | Regressed | Regression |
| 7 | S13 Narrate browse-away | Audio-owned browse-away | Narration continues and Jump Back returns without sync loss | FAIL, mechanics work but S12 desync compromises the scenario | Fail | Regressed | Regression |
| 8 | S14 cross-mode handoff | Anchor handoff | Modes land on the same hard-selected anchor | PASS with Narrate desync caveat | Pass | Maintained | Marginal |
| 9 | S15 active hard-click retarget | Active playback retarget | Hard-click retargets playback without changing engagement state | PASS with Narrate desync caveat | Pass | Maintained | Marginal |
| 10 | S16 Page button styling | Button visual state | Only Page appears selected | PASS, ghost-fill fix holds | Pass | Maintained | Pass |
| 11 | S17 console noise | Runtime console | No `getEffectiveWords` flood or word-0 miss spam | PASS | Pass | Maintained | Pass |
| 12 | S9 Flow lazy follow | Flow window follow | Cursor remains in reading window | PARTIAL, unchanged and deferred | Partial | Unchanged | Marginal |
| 13 | S10 Flow browse-away | Browse-away pause/return | Flow pauses and Jump Back appears | Not rerun; carried PASS from Step 3 | Carried | Unchanged | Marginal |
| 14 | Merge readiness | Manual QA gate | Full 18-scenario matrix passes or misses are approved | Not clean: S8, S12, and S13 block | Fail | Still blocked | Regression |

## Interpretation

Step 3.1 fixed the failures it was designed to fix. Page same-section Jump Back now moves instead of dismissing, Focus active mode renders the single-word RSVP overlay instead of going blank, and startup reopen now lands in Page mode at the exact persistent reading position. The earlier same-section Foliate rect lesson remains valid: recovery actions need live movement or forced movement when cached CSS-column rects may be stale.

The remaining blockers are different from the Step 3 failures. Flow now has a visual ownership regression: the parent-document overlay cursor and iframe per-word cursor render simultaneously. Evan's decision is locked: keep the per-word `.page-word--flow-cursor` underline and suppress the visible `.flow-shrink-cursor` overlay for FLOW-3A.

Narrate has the highest-impact defect. The visible cursor starts at the selected anchor but then outruns heard audio, and at chunk boundaries the audio can skip ahead to the cursor's location. That means the visual playback path and the audio truth source are not synchronized tightly enough. S13's browse-away mechanics still work, but they cannot be accepted while S12 causes audible skip-ahead.

S5 improved but remains literal-spec partial. Focus playback browse-away now exposes a working return affordance; paused Focus browse-away still follows the scroll with no affordance. This is lower priority than Narrate sync and Flow single-cursor repair.

## Proposed Dispositions

| Item | Disposition | Rationale |
|---|---|---|
| Commit `e6ebb07` | Accept as partial repair | It fixes S1, S4, and S18 and improves S5. |
| S1 Page Jump Back | Accept | Manual QA proves the target behavior now works. |
| S4 Focus overlay | Accept | Active Focus now renders and advances words. |
| S18 startup reopen | Accept | Reopen now lands at the exact persistent position. |
| S5 paused Focus return | Defer unless cheap | Improved active case is useful; paused affordance is lower-impact than S8/S12/S13. |
| S8 Flow double cursor | Fix Now | The owner decision is clear: keep per-word cursor, suppress visible overlay. |
| S12/S13 Narrate cursor/audio desync | Fix Now | Highest-impact blocker; breaks spoken reading coherence. |
| S9 Flow lazy follow | Defer | Already identified as higher-risk Flow-Foliate scroll coordination work. |
| Merge to `main` | Defer | SRL-053 manual QA gate remains red. |
| `READER-ISO-1A` | Defer | Adapter isolation must not extract unstable runtime behavior. |
| Step 3.1 QA report | Accept as evidence | Save as the gating evidence for Step 3.2 dispatch. |

## Governance Updates

- `ROADMAP.md` should name Step 3.2 as the active gate, not generic Step 3.1 QA-pending.
- `docs/governance/sprint-queue.xlsx` should keep `READER-PERSISTENT-ANCHOR-STEP3-REPAIR` at Seq 1 but update its title/description to Step 3.2 repair.
- `SpecRetro.Lessons_Learned.md` should append SRL-060 and SRL-061.
- `READER-ISO-1A` remains blocked until Step 3.2 has a clean manual QA pass.

## Next Work Direction

Fold `NARRATE-CURSOR-SYNC-1` and `FLOW-DOUBLE-CURSOR-1` into the existing `READER-PERSISTENT-ANCHOR-STEP3-REPAIR` lane as Step 3.2 rather than adding two independent queue rows.

Step 3.2 must:

1. Fix Narrate cursor/audio desync and stop chunk-boundary skip-ahead.
2. Suppress the visible `.flow-shrink-cursor` overlay while keeping `.page-word--flow-cursor`.
3. Preserve the Step 3.1 wins for S1, S4, and S18.
4. Rerun the 18-scenario manual QA matrix.
5. Keep the merge gate closed until S8, S12, and S13 pass or receive explicit user-approved disposition.

## Gates

| Gate | Result |
|---|---|
| Automated verification | Accepted from Step 3.1 implementation, but insufficient for closeout. |
| Manual QA | Failed: S8, S12, and S13 block. |
| Merge | Blocked. |
| Adapter isolation | Blocked behind Step 3.2 clean QA. |
| Release | Not applicable. |

## Evidence

- `docs/studies/reviews/Reader_Persistent_Anchor_Step3.1_Manual_QA_2026-05-22.md`
- `docs/governance/close-outs/CloseOut.READER-PERSISTENT-ANCHOR-STEP3-REPAIR.2026-05-22.md`
- `docs/governance/close-outs/CloseOut.READER-PERSISTENT-ANCHOR-STEP3.1.2026-05-22.md`
