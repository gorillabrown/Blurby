---
dispatch: JUMP-LANDING-SAVE-1
date: 2026-11-04
runtime: 24m
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: JUMP-LANDING-SAVE-1

## Dispatch Brief

**Goal:** In page reading (PageReaderView, Foliate), make internal links, footnote references and Previous/Next chapter save the page they land on, and make chapter steps work again in every reading mode.
**Result:** Links and footnotes now go through `goToLanding` in `src/reader/modes/page/FoliateView.tsx`, and chapter steps use a new `tocChapterStep` (`src/utils/text.ts`, `ReaderContainer.tsx`); live, the link, Next chapter, Previous chapter, footnote, quit and reopen checks (a-f) were all met, where the control build failed a-c.
**Learned:** LL-192 — an attached debugger holds Electron's quit, so detach before quitting in a live driver; LL-193 — read the page from `lastLocation.range`, not screen geometry.
**Recommend:** Close it as integrated, then decide PAGE-SAVE-RESTAMP-3 Wave B (build it, split it out or drop it by ruling), because it is still unbuilt and is not closed by this item.
**Bottom line:** Jumps by link, footnote and chapter step now save and reopen on the landed page, and the fix is merged.

## Time

Timing log: `docs/governance/close-outs/Timing.JUMP-LANDING-SAVE-1.jsonl`. Estimate 21m, actual 24m (23.6 min), complete, nothing parked. The memo notes rows 2-5 were ended late, so their minutes read near 0; their work ran under row 1's clock.

| # | Row | Kind | Added | Predicted | Actual | Waited | Flag |
|---|-----|------|-------|-----------|--------|--------|------|
| 1 | Setup: reconcile base, load spec, conflict check, plan | setup | no | 0m | 7.7m | 0 | none |
| 2 | Positive control: link, footnote, never-landing jumps and chapter step red on the base | positive-control | no | 4m | 0.1m | 0 | none |
| 3 | Links and footnotes through goToLanding; Page navigateTo no early commit on an EPUB | bug-fix | no | 2m | 0.1m | 0 | none |
| 4 | Chapter steps through the contents list (tocChapterStep, ReaderContainer) | bug-fix | no | 2m | 0.1m | 0 | none |
| 5 | Suite, typecheck, build; reviews | verify-gate | no | 0m | 0.1m | 0 | none |
| 6 | Live check a-f on an x64 --dir build, scratch profile | live-check | no | 10m | 14.0m | 0 | none |
| 7 | Staging memo, time log, push and hold; report | merge-and-docs | no | 3m | 1.5m | 0 | none |

## Findings

Evidence population: the committed memo `Memo.JUMP-LANDING-SAVE-1.GovernanceStaging.2026-10-23.md` plus a read-only check of origin/main 14ce3d24. Suite population: gate (1) run 6 on 14ce3d24, 3,048 passed, 0 failed, typecheck 0, 0 crashes. Cited exactly as gate (1) run 6, partial; D6 cold, D3 2.00x and Q3 s2 pending a quiet rerun. No row of this item depends on those unjudged rows.

Memo evidence, not re-run: the live checks (a-f) ran on x64 `--dir` builds of `6cdd51b9` (fixed) and `075d10b0` (control) on their own branch, not on the merged tree. Nobody asked for an owner check and none is on the gate (2) list.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| DW1 | Positive control | Reds on base | 7 by assertion | `d48f391e`: 5 failed in `pagePositionSave` plus 2 in `chapterStep` = 7; controls (jl2) and "Next at the last entry" green | Pass | n/a | Pass |
| DW2 | Tests jl1-jl4, `chapterStep.test.ts` | Present | Present | (jl1) :831, (jl2) :844, (jl3) :854, (jl4) :871; `chapterStep.test.ts` 3 rows; only (fr1n)'s setup changed | Pass | n/a | Pass |
| DW3a | `pageTurnsInFlightRef.current += 1` | Lines | 2 | `FoliateView.tsx:812` (`goToLanding`) and `:1196` (`turnPage`) | Pass | n/a | Pass |
| DW3b | `e.preventDefault(); void goToLanding` | Lines | 1 | `FoliateView.tsx:816` | Pass | n/a | Pass |
| DW3c | `chaptersFromCharOffsets(activeDoc.content` | Lines | 4, not 3 (spec correction, below) | `ReaderContainer.tsx:662, :674, :685, :801`; also 4 on the base | Pass | n/a | Pass |
| DW4 | Targeted tests | Two files | All pass | Memo 58/58; green in gate (1) run 6 | Pass | n/a | Pass |
| DW5 | Live check a-f | Saves and reopen | All met, control fails a-c | Link 9431; Next 11652; Previous 9431; quit exit 0 in 2.9 s and reopen on 9431; Focus Next chapter shows word 69100; footnote 63198; live profile hashes unchanged | Pass (memo) | n/a | Pass |
| DW6 | Suite, typecheck, build | Counts | Green | Memo 182 files, 2,471 passed / 1 skipped / 0 failed, typecheck and build 0; gate (1) run 6 above | Pass | n/a | Pass |
| DW7 | Fence | Files changed | Listed files only | ReaderContainer, Page FoliateView, Page ModeRuntime, text.ts, two tests, memo and time log; shared-core touch (ReaderContainer) covered by the RC integration window | Pass | n/a | Pass |
| Spec | Done-when 3 count | Published correction | 4 | The memo's published correction: DW3c prints 4, not 3 (the fourth is the chapter-label line); the spec is not amended | Correction recorded | n/a | Pass |

## Interpretation

Live findings 2 and 3 (Focus's chapter step saves the entry's word with the old section's cfi; paused Focus paints no cursor after a chapter jump) are carried by CHAPTER-STEP-CFI-1, which is a full spec and was kept out of the RC. They are not failures of this item.

## Proposed Dispositions

- **Accept** all rows. **Defer** the Focus findings to CHAPTER-STEP-CFI-1.

## Mid-Dispatch Decisions

Tier-1 builder decisions recorded in the memo (Blurby.Brain was not reachable):
- **(fr1n) setup:** it now sets `explicitSelectionAnchor` directly because fix (C) makes `navigateTo` a no-op on an EPUB; the assertion is unchanged and a mutation control fails it, so it is not vacuous.
- **`tocChapterStep` edges:** fewer than two entries returns -1; with no entry at or before the word, Next and Previous give 0.

## Lessons

- **New:** LL-192 — an attached debugger holds Electron's quit; detach before quitting in a live driver. LL-193 — in foliate's paginated view, read the page from `lastLocation.range`, not screen geometry.
- **Applied:** Standing rule 43 / LL-138 — held: red first and alone (`d48f391e`), 7 failures by assertion.
- **Applied:** LL-165 — held: the profile read-back caught another session's app on the debug port before any action.
- **Applied:** LL-166 — held: the state-reading probe replaced the geometry probe.
- **Applied:** LL-151 (the memo's LL-NEW-a, PAGE-SAVE-RESTAMP-3) — held: the control build ran first and every pass condition fails on it.
- **Applied:** Standing rules 36, 44, 47, 48 and LL-143, LL-136 — held: lines re-grepped, grep count error found by running on the base, gates run, fence lists the time log.

## Files Created

- **Removed (temporary):** none
- **Committed:** memo and time log committed earlier; this report committed by Blurby.Roadmap
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** not run per item
- **Footprint:** none

## Governance Updates

- Fold-in 2 (DW3 count 3 to 4) is the memo's published correction, recorded in the Findings table; moot once the spec is archived.
- Fold-in 3 (merge order) states PAGE-SAVE-RESTAMP-3 Wave B follows this item; Wave B is still unbuilt, so that text conflicts with the close-out and must be reworked.
- Fold-in 4 (CHAPTER-STEP-CFI-1 stub) is superseded by the full spec.
- Fold-ins 5 and 6 become LL-192 and LL-193; Fold-ins 1 and 7 (held status, queue line) are stale.

## Roadmap & Queue Movement

- **Retired:** JUMP-LANDING-SAVE-1 — retired from In Flight; no sequence change.
- **Elevated:** none.

## Next Work

PAGE-SAVE-RESTAMP-3 Wave B stays unbuilt and is a separate open item: Wave B1 removes the cancel that `goToLanding` still applies to a held turn when a link never lands, with tests (lc1) and (lc2). Nothing in this item built or closes it. CHAPTER-STEP-CFI-1 covers the Focus and Flow chapter-step cfi.

## Gates

- Integrated identity: branch tip `8a7c9db6` is an ancestor of origin/main; merged by c5bb507f (RC-INTEGRATION-WINDOW); tested tree 14ce3d24. The RC window's package record: x64 pair on RodneySr at 70d64237, Brain1's confirmation, arm64 launch on Rodney from c5bb507f (`C:\Projects\Blurby-artifacts\rc-merge-20261103\`). The raw run 6 record is on RodneySr (`C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` there).
- Authority to close: Blurby.Brain1's run 6 close-out ruling (2026-11-03) plus the item's own evidence; owner approval 2026-11-04 of the close-out plan.

## Git Hand-Off

- [x] Committed by Blurby.Roadmap.
