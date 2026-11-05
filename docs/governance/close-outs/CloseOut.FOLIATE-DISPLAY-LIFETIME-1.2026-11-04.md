---
dispatch: FOLIATE-DISPLAY-LIFETIME-1
date: 2026-11-04
runtime: not measured (no time log)
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: FOLIATE-DISPLAY-LIFETIME-1

This report supersedes the hold in `CloseOut.FOLIATE-DISPLAY-LIFETIME-1.2026-10-27.md`. That earlier report was a held, non-terminal report that left the item open (Blocked, Seq 68) and is not edited. The 2026-10-30 native A/B passed, and the issue file `docs/governance/bug-reports/Issue.FOLIATE-DISPLAY-LIFETIME-1.2026-10-27.md` now carries its Decision and its Resolution.

## Dispatch Brief

**Goal:** Stop the Foliate book viewer (foliate-js patch) from failing on a null body while loading, and stop old asynchronous display work from reviving a retired view, without breaking the four independent reading modes.
**Result:** The patch (`patches/foliate-js+1.0.1.patch`) adds per-view ownership (`#opCurrent`, `#viewLive`, `#cancelLoad`, `#disposed`); in the 2026-10-30 native A/B on RodneySr the control build showed 1 "Cannot destructure property 'style'" line and the candidate showed 0 across 9 runs, with identical route checks on both.
**Learned:** LL-169 — operation currentness and retained-resource lifetime need separate guards (already recorded); the LL-165 profile gate held throughout.
**Recommend:** Close the item as integrated and verified; at close-out flip BUG-222 to resolved and describe the retained-view ownership in the technical reference.
**Bottom line:** The collector failure that held this item was an evidence-capture problem, the native A/B cleared it, and the repair is merged.

## Findings

Evidence population: the committed memos `Memo.FOLIATE-DISPLAY-LIFETIME-1.Local.2026-10-27.md`, `Memo.FOLIATE-DISPLAY-LIFETIME-1.NativeHold.2026-10-27.md` and `docs/studies/investigations/FOLIATE-DISPLAY-LIFETIME-1.native.2026-10-30.md`, plus a read-only check of origin/main 14ce3d24. Suite population: gate (1) run 6 on 14ce3d24, 3,048 passed, 0 failed, typecheck 0, 0 crashes. Cited exactly as gate (1) run 6, partial; D6 cold, D3 2.00x and Q3 s2 pending a quiet rerun. No row of this item depends on those unjudged rows.

Memo evidence, not re-run here: the native runs and their raw receipts (`C:\Projects\Blurby-artifacts\foliate-display-lifetime-1\`) are on RodneySr; those rows rest on the committed memos.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Fence | Files changed | Patch plus `foliateViewReadiness.test.js` and `foliateDisplayLifetime.test.js` | All three exist at origin/main; patch holds `#opCurrent`, `#viewLive`, `#cancelLoad`, `#disposed` and two `disconnect()` calls | Pass | n/a | Pass |
| 2 | Portable R1, L1-L7 (51 cases) | Tests present and green | Present, passing | 31 plus 4 `it` blocks present; green in gate (1) run 6 | Pass | n/a | Pass |
| 3 | Patch applies on clean `npm ci` | Install log | Applied | `foliate-js@1.0.1` applied from `patches/` in each native build | Pass (memo) | n/a | Pass |
| 4 | Native R1/L1-L7 controls | Run natively | Superseded | Replaced by the A/B under ruling R-2026-10-30-1 | Superseded | n/a | Pass |
| 5 | Original 329 s session x5 | style-null lines | 0 | 0/0/0/0/0 candidate and control; RO-loop 0; Flow 187 to 817-818; 178/178 samples with cursor | Pass (memo) | n/a | Pass |
| 6 | Observer census (Page, Focus, Flow) | Live observers | One on a connected view | One live observer on connected `div.rm-flow-view` 1002x630, roErrors 0 | Pass (memo) | n/a | Pass |
| 7 | Four roots, 5,293 words, 5 Flow/Narrate cycles | Roots reached; style-null | All four; candidate 0 | All reached 5,293; 5/5 cycles; control 1 style-null line, candidate 0 (cycle timing authored, spec silent) | Pass (memo) | n/a | Pass |
| 8 | Owned91 All/Archive route | Grid, list, open, return, reopen | Same on both builds | Same on candidate and control (the Archive difference is LIBRARY-COMPLETION-VISIBILITY-1's) | Pass (memo) | n/a | Pass |
| 9 | Fresh-profile defaults session | Defaults and steps | focus/dark/list/300, all steps true | Met; one record `sample-meditations` | Pass (memo) | n/a | Pass |
| 10 | Standing gates | Survival, asar, main override, PE arch, profile hashes | >=25 s, identical, unchanged | x64 alive at 25 s, exit 0; asar x64/arm64 identical; 4,088 live files and 4 updater files unchanged; arm64 launch at merge: `rc-merge-20261103\launch25-arm64.json` | Pass (memo) | n/a | Pass |
| 11 | npm test, typecheck, build | Counts | All green | Memo 185 files, 2,523 passed / 1 skipped / 0 failed on `2d5772d3`; typecheck and build 0; gate (1) run 6 above | Pass | n/a | Pass |
| 12 | Branch tip | Ancestry | Ancestor of origin/main | `4ac4ff76`, `merge-base --is-ancestor` exit 0 | Pass | n/a | Pass |

## Interpretation

The earlier hold (the data-only collector stopped at MODULE_CONSTRUCTOR in both permitted runs) was an evidence-capture admission failure, not a product defect. The control build's single style-null line is the defect the item fixes, not a regression.

## Proposed Dispositions

- Close the item. Accept rows 1-12. Log the BUG-222 flip and the technical reference entry as governance work.

## Mid-Dispatch Decisions

From the issue file `Issue.FOLIATE-DISPLAY-LIFETIME-1.2026-10-27.md`:
- **Decision (2026-10-27):** Blurby.Brain's delegated technical ruling and independent evidence review: continued capability hold, collector NOT QUALIFIED. Both admitted matrix runs were consumed (two primary children used, no secondary). Stop qualification and release custody; do not invoke getters, traverse higher prototypes, guess fallback anchors or launch Blurby. Owner confirmed 2026-10-27: record built and held, mark Blocked, persist report and lesson, no completion record.
- **Resolution (2026-10-30):** ruling R-2026-10-30-1 (Blurby.Brain1) replaced the collector with a native A/B on RodneySr (inspector-proved scratch profile, LL-165); ruling R-2026-10-30-2 moved the arm64 launch to merge time. The candidate passed.

## Lessons

- **New:** LL-169 — Operation currentness and retained-resource lifetime need separate guards (already recorded in LESSONS_LEARNED).
- **Applied:** LL-165 — held: no input was sent until the scratch profile was proved; the native runs proved `userData` before any input on every run.
- **Applied:** LL-029, LL-031 and LL-109 — held: the portable lifetime tests pass (31 and 4 `it` blocks, green in gate (1) run 6).

## Files Created

- **Removed (temporary):** none
- **Committed:** memos, receipt and held report committed earlier; this report committed by Blurby.Roadmap
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** not run per item
- **Footprint:** none

## Governance Updates

- `TECHNICAL_REFERENCE.md`: describe per-instance display, retained View and anchor-intent ownership in the dependency patch (memo fold-in 1; absent from origin/main).
- LL-169 and the LL-165 status line are already in LESSONS_LEARNED.
- `BUG_REPORT.md`: BUG-222 still reads OPEN; flip to resolved now the stack has merged.
- No `GovernanceStaging` memo exists; the Local and NativeHold memos stand in.

## Roadmap & Queue Movement

- **Retired:** FOLIATE-DISPLAY-LIFETIME-1 — retired from In Flight (was Blocked, Seq 68); no sequence change.
- **Elevated:** none.

## Next Work

None from this item.

## Gates

- Integrated identity: branch tip `4ac4ff76` is an ancestor of origin/main; merged by c5bb507f (RC-INTEGRATION-WINDOW); tested tree 14ce3d24. The RC window's package record: x64 pair on RodneySr at 70d64237, Brain1's confirmation, arm64 launch on Rodney from c5bb507f (`C:\Projects\Blurby-artifacts\rc-merge-20261103\`). The raw run 6 record is on RodneySr (`C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` there).
- Authority to close: Blurby.Brain1's run 6 close-out ruling (2026-11-03) plus the item's own evidence; owner approval 2026-11-04 of the close-out plan.

## Git Hand-Off

- [x] Committed by Blurby.Roadmap.
