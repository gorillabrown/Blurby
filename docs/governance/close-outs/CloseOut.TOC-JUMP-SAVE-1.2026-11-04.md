---
dispatch: TOC-JUMP-SAVE-1
date: 2026-11-04
runtime: not measured (no time log)
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: TOC-JUMP-SAVE-1

## Dispatch Brief

**Goal:** In page reading (PageReaderView, Foliate), save the page a contents-list (table of contents) jump lands on, so quitting and reopening returns to that chapter.
**Result:** The API `goTo` in `src/reader/modes/page/FoliateView.tsx` now raises `pageTurnsInFlightRef` until `view.goTo` resolves; live, a jump to the second contents entry saved position 136 and its cfi (before the fix it saved 0 and the cover cfi), and the book reopened on the same page.
**Learned:** No new lesson — standing rules 43, 36, 44, 41, 46, 47 and 48 and LL-138, LL-142, LL-161 and LL-164 already covered what this item met.
**Recommend:** Close it as integrated; the contents-jump quit-and-reopen check stays on the gate (2) owner list.
**Bottom line:** A contents jump now saves the landed page, shown live on a packaged build, and the fix is merged.

## Findings

Evidence population: the committed memo `Memo.TOC-JUMP-SAVE-1.GovernanceStaging.2026-10-23.md` plus a read-only check of origin/main 14ce3d24. Suite population: gate (1) run 6 on 14ce3d24, 3,048 passed, 0 failed, typecheck 0, 0 crashes. Cited exactly as gate (1) run 6, partial; D6 cold, D3 2.00x and Q3 s2 pending a quiet rerun. No row of this item depends on those unjudged rows.

Memo evidence, not re-run: the live check (DW4) ran on a scratch-profile `--dir` build of `72c29e6c` on its own branch, not on the merged tree. The memo has no Lessons section; the applied list below comes from the spec.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| DW1 | Positive control | `-t "TOC jump"` on base | Red by assertion | `c732010f` exit 1: (tj1) `expected [] to deeply equal [[doc-1, 12, cfi:0:twelve]]`, (tj3) red; (tj2) and (WC3) green | Pass | n/a | Pass |
| DW2 | Tests tj1-tj3 | Present, (y) and (WC3) unchanged | Present | `describe` :681, (tj1) :684, (tj2) :697, (tj3) :707 | Pass | n/a | Pass |
| DW3 | Counter lines | `pageTurnsInFlightRef.current += 1` | Exactly 2 | origin/main prints 2: `FoliateView.tsx:812` (in `goToLanding`, which the API `goTo` now delegates to at :1002) and `:1196` (`turnPage`). JUMP-LANDING-SAVE-1 (`d031cc89`) moved the counter; the guarded behaviour is intact | Pass (restructured by later work) | n/a | Pass |
| DW4 | Live check, quit, reopen | Saved position and cfi | Landed page saved and reopened | Memo: second entry saves 136 and the cfi; quit by CDP `Browser.close` (no kill); reopen on the same page; before the fix 0 and the cover cfi | Pass (memo) | n/a | Pass |
| DW5 | Suite, typecheck, build | Counts | Green | Memo 177 files, 2,433 passed / 1 skipped / 0 failed, typecheck and build 0 (one earlier `folderWatcher` timing flake under reviewer load, green alone); gate (1) run 6 above | Pass | n/a | Pass |
| DW6 | Fence | Files changed | `FoliateView.tsx` and the test only | Matches; no time log was kept (the memo says so) | Pass | n/a | Pass |

## Interpretation

Quality-review notes 1-5 live in the memo only. Note 1 (a mode switch after a contents jump starts at the landed page's first word) is accepted behaviour, the same as a page turn. Note 4 (link and footnote jumps and chapter steps saved no landing) was fixed by JUMP-LANDING-SAVE-1.

## Proposed Dispositions

- **Accept** all rows. **Log** nothing further.

## Mid-Dispatch Decisions

None.

## Lessons

- **New:** No new lesson — standing rules 43, 36, 44, 41, 46, 47 and 48 and LL-138, LL-142, LL-161 and LL-164 covered it.
- **Applied:** Standing rule 43 / LL-138 — held: Done-when 1 was red on the base for the named reason (no save), `c732010f`.
- **Applied:** LL-142 — held: foliate's installed paginator was read (`#scrollTo`, `#afterScroll`) and the live check confirmed it.
- **Applied:** LL-161 — held: the live check compared the reopened page's word text ("MEDITATIONS") and index.
- **Applied:** Standing rules 36 and 44 / LL-143 — held: sites re-grepped; Done-when 3 dry-run on the base (1 line).
- **Applied:** Standing rules 41, 46, 47 and 48 — held: fence, no register write, gates run on the owner machine.
- **Applied:** LL-164 — held: the memo appends no lesson-status line.

## Files Created

- **Removed (temporary):** none
- **Committed:** memo committed earlier (no time log was kept); this report committed by Blurby.Roadmap
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** not run per item
- **Footprint:** none

## Governance Updates

None. The memo stages no ROADMAP, CLAUDE.md or LESSONS_LEARNED text. Its one request, the batched owner smoke for a contents jump, quit and reopen, is already on the gate (2) list (`SMOKE_CHECKLIST_STAGE8.md:138`, Next batch).

## Roadmap & Queue Movement

- **Retired:** TOC-JUMP-SAVE-1 — retired from In Flight; no sequence change.
- **Elevated:** none.

## Next Work

None from this item.

## Gates

- Integrated identity: branch tip `db03f2f5` is an ancestor of origin/main; merged by c5bb507f (RC-INTEGRATION-WINDOW); tested tree 14ce3d24. The RC window's package record: x64 pair on RodneySr at 70d64237, Brain1's confirmation, arm64 launch on Rodney from c5bb507f (`C:\Projects\Blurby-artifacts\rc-merge-20261103\`). The raw run 6 record is on RodneySr (`C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` there).
- Authority to close: Blurby.Brain1's run 6 close-out ruling (2026-11-03) plus the item's own evidence; owner approval 2026-11-04 of the close-out plan.

## Git Hand-Off

- [x] Committed by Blurby.Roadmap.
