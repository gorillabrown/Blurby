---
dispatch: FOLIATE-OBSERVER-LEAK-1
date: 2026-11-04
runtime: not measured (no time log)
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: FOLIATE-OBSERVER-LEAK-1

## Dispatch Brief

**Goal:** Stop the Foliate book viewer (foliate-js) from leaking resize observers when a view is torn down (BUG-187, the "ResizeObserver loop" error flood).
**Result:** `patches/foliate-js+1.0.1.patch` adds `this.#observer.disconnect()` to `View.destroy()` and `Paginator.destroy()`; the packaged scripted session wrote 0 "ResizeObserver loop" lines against 14,428 on the base, and the census found 0 observers on disconnected targets against 5 on the base.
**Learned:** LL-189 — CDP `Page.reload` no longer re-runs injected scripts on this packaged build, so inject in the running page.
**Recommend:** Close the item as integrated; update BUG-187's status line now that the packaged count it was waiting for exists.
**Bottom line:** Two added lines stop the observer flood, proved on the packaged app, and the repair is merged.

## Findings

Evidence population: the committed memo `Memo.FOLIATE-OBSERVER-LEAK-1.GovernanceStaging.2026-10-23.md` plus a read-only check of origin/main 14ce3d24. Suite population: gate (1) run 6 on 14ce3d24, 3,048 passed, 0 failed, typecheck 0, 0 crashes. Cited exactly as gate (1) run 6, partial; D6 cold, D3 2.00x and Q3 s2 pending a quiet rerun. No row of this item depends on those unjudged rows.

Memo evidence, not re-run here: the packaged sessions ran on `--dir` builds recorded in the memo and re-proven on the combined candidate on 2026-10-30. The native runs and raw receipts are on RodneySr (`C:\Projects\Blurby-artifacts\foliate-observer-leak-1\` and the display-lifetime folder); those rows rest on the committed memos.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| DW1 | Positive control | `tests/foliateObserverPatch.test.js` asserts both `destroy()` bodies hold `disconnect()` | Red on base, green after | `b92fcdc6` exit 1 on base, both tests failing; file at origin/main; patch has the call at lines 116 and 488 | Pass | n/a | Pass |
| DW2 | Patch applies | Clean `npm ci`, `npx patch-package` | Exit 0 | `foliate-js@1.0.1` applied; again in the 2026-10-30 native builds | Pass (memo) | n/a | Pass |
| DW3 | Packaged uninstrumented session | "ResizeObserver loop" lines | 0 (base 14,428) | 0 (`s1-fix.json`); 0 again on all five runs of the 2026-10-30 combined candidate against 264 on base `36ac7466` | Pass (memo) | n/a | Pass |
| DW4 | Census with ro-wrap | Observers on disconnected target or 0x0 body | 0 | 0 (base 5); `s8-census-fix.json`; roErrors 0 in the later native census | Pass (memo) | n/a | Pass |
| DW5 | Suite, typecheck, build, four-mode open | Counts and modes | Green | Memo 178 files, 2,432 passed / 1 skipped / 0 failed; typecheck and build 0; four modes open with 5,293 words (`dw5-modes.json`); gate (1) run 6 above | Pass | n/a | Pass |
| DW6 | Fence and BUG-187 text | Files changed; status line | Patch, test, BUG_REPORT | Fence matches; origin/main BUG-187 reads RESOLVED in source with the packaged count "owed" | Pass | n/a | Pass |
| - | Branch tip | Ancestry | Ancestor of origin/main | `51759276` | Pass | n/a | Pass |

## Interpretation

The memo's one "Cannot destructure property 'style'" line at Focus entry is BUG-222's symptom, present on the base, and closed by FOLIATE-DISPLAY-LIFETIME-1 in the same stack (0 across 9 runs).

## Proposed Dispositions

- **Accept** all rows. **Log** the BUG-187 status update.

## Mid-Dispatch Decisions

None.

## Lessons

- **New:** LL-189 — CDP `Page.reload` no longer re-runs `addScriptToEvaluateOnNewDocument` scripts on this packaged build; inject in the running page (the memo's recorded observation, now a lesson).
- **Applied:** Standing rules 36, 41, 43, 44, 47, 48, 49 and 50 — held: re-grep done, red test committed alone, fence and gates recorded.
- **Applied:** LL-142 — held: the installed foliate file was read and the packaged app run.
- **Applied:** LL-152 — held: same route, script and book as the base.
- **Applied:** LL-146 — held: scripts stay in the artifacts folder.

## Files Created

- **Removed (temporary):** none
- **Committed:** memo committed earlier; this report committed by Blurby.Roadmap
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** not run per item
- **Footprint:** none

## Governance Updates

- `BUG_REPORT.md`: BUG-187 reads "RESOLVED in source ... packaged-session count owed"; the count is now supplied (0 lines), so update the line.
- LL-189 is appended with this close-out.
- No other fold-ins in the memo.

## Roadmap & Queue Movement

- **Retired:** FOLIATE-OBSERVER-LEAK-1 — retired from In Flight; no sequence change.
- **Elevated:** none.

## Next Work

None from this item.

## Gates

- Integrated identity: branch tip `51759276` is an ancestor of origin/main; merged by c5bb507f (RC-INTEGRATION-WINDOW); tested tree 14ce3d24. The RC window's package record: x64 pair on RodneySr at 70d64237, Brain1's confirmation, arm64 launch on Rodney from c5bb507f (`C:\Projects\Blurby-artifacts\rc-merge-20261103\`). The raw run 6 record is on RodneySr (`C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` there).
- Authority to close: Blurby.Brain1's run 6 close-out ruling (2026-11-03) plus the item's own evidence; owner approval 2026-11-04 of the close-out plan.

## Git Hand-Off

- [x] Committed by Blurby.Roadmap.
