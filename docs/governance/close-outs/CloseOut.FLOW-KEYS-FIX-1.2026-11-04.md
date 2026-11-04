---
dispatch: FLOW-KEYS-FIX-1
date: 2026-11-04
runtime: incomplete time log (rows 3 to 5 open); no Actual stated
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: FLOW-KEYS-FIX-1

## Dispatch Brief

**Goal:** Make flow reading's (Flow) line, word, sentence and paragraph keys move both pacers, the word timer and the line pacer (BUG-211).
**Result:** `src/reader/modes/flow/ModeRuntime.ts` now handles `flow-line`, `seek-words`, `sentence` and `paragraph`; the amendment added `isFlowBrowseKey` (`flow/helpers/flowBrowseKey.ts`) so only plain PageUp and PageDown turn the page and pause; live, every arrow keeps playing and plain Right and Left change speed by 25.
**Learned:** LL-188 — when a mode has two pacers, a navigation command must move both, and a test must read each pacer's own position.
**Recommend:** Close it, and resolve BUG-211 by a separate edit, since main still shows it OPEN.
**Bottom line:** Flow's navigation keys no longer stop playback; the one original live check (triage #100-103) was never rerun as written.

## Time

The time log `Timing.FLOW-KEYS-FIX-1.jsonl` is incomplete: rows 3, 4 and 5 are still open and were not measured. No Actual is given.

| Row | Kind | State |
|---|---|---|
| 1 | positive-control | done |
| 2 | bug-fix | done |
| 3 | merge-and-verify | open |
| 4 | merge-and-verify | open |
| 5 | docs | open |

## Findings

Source: the group 4 evidence check on origin/main 14ce3d24 and the memo. Spec: snapshot 2026-10-23 plus the 2026-10-23 amendment (k1, k2).

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---|---|---|---|---|---|---|
| 1 | Red first `flowKeys.test.tsx` | red on base | 8 of 9 fail, control passes | `5d88cd28` (memo); file exists on origin/main | Pass | n/a (new) | Pass |
| 2 | Red files plus boundary and mode suites | suites | pass | `flowKeys.test.tsx`, `flowBrowseKey.test.ts` present; memo 213 tests passed; counted in run 6 | Pass | n/a | Pass |
| 2-src | Implementation | grep on origin/main | present | ModeRuntime `flow-line` 958, `seek-words` 964, `sentence` 967, `paragraph` 970, `navigationWord` 989, `moveReadingWord` 1026 | Pass | n/a | Pass |
| k1 | `isFlowBrowseKey` unit rows | red then green | 18 of 25 red, 25 of 25 green | red `79909736`, fix `64c2c0b6` (memo); helper at `flowBrowseKey.ts:8`, used at `FoliateView.tsx:1495` | Pass | n/a | Pass |
| k2 | Live while playing | x64 `--dir` package of `64c2c0b6` | arrows keep playing, speed +/-25, Ctrl+Down continues, PgDn pauses and turns page | all rows met (memo table, `keys-fix\flow-64c2c0b6-k2.json`); base `60b86aff` stops at 192 | Pass (memo evidence, not re-run) | base stopped at 192 | Pass |
| 3 (orig) | Live triage #100-103 as written | paused moves, Play starts at moved word, paused Down leaves speed | as spec | never rerun as written; memo row stays "Held". Covered in part by the amendment's k2, the paused word and sequence runs on `60b86aff`, and the paused table in `flowKeys.test.tsx` | Not run as written; covered in part | n/a | Discovery |
| 4 | Suite, typecheck, build | counts | green | memo: 2,504 passed, 1 skipped, typecheck 0, build 0 on `64c2c0b6` | Pass | n/a | Pass |
| 5 | Fence | changed files | as listed | flow FoliateView, ModeRuntime, helper and test, `flowKeys.test.tsx`, BUG_REPORT, IDEAS; no shared core | Pass | n/a | Pass |
| Fix 3 | No key doc calls Flow arrows look-ahead | grep | none | ShortcutsOverlay already lists them as WPM; only the helper comment mentions look-ahead | Pass | n/a | Pass |
| IDEAS | A5 FLOW-PAUSED-LINE-1 filed | file | present | `IDEAS.md:31` on origin/main | Pass | n/a | Pass |
| Bug | BUG-211 resolved | BUG_REPORT on main | resolved | main shows OPEN (lines 224-227) | Pass for the item; documentation fold-in due | n/a | Discovery |

## Interpretation

No row of the item failed. Population: gate (1) run 6, partial; D6 cold, D3 2.00x and Q3 s2 pending a quiet rerun. Run 6 on 14ce3d24 had 3,048 passed, 0 failed, typecheck 0 and 0 crashes. No row of this item depends on those unjudged rows.

Triage rows #100-103 were never rerun as written. The amendment's k2 checks, the paused runs on `60b86aff` and the FLOW-PARA-KEYS-1 builds cover most of it, and the paused table is in the unit tests, but I did not read every row of the paused runs. Memo evidence, not re-run: k2. The memo's open question (Flow's paragraph case steps over loaded-slice breaks) was answered by FLOW-PARA-KEYS-1, so nothing to fold. READER-ARROW-GUARD-1 (Narrate and Page) is a separate item.

## Proposed Dispositions

- **Accept:** close the item. Authority: Blurby.Brain1's run 6 close-out ruling (2026-11-03) plus the item's own evidence; owner approval 2026-11-04 of the close-out plan.

## Mid-Dispatch Decisions

- 2026-10-23, Blurby.Brain (tier 1) with owner ruling (tier 3): amend the item, no new item. Live finding: in Flow, any navigation key pressed while playing stopped playback (Ctrl+Right 191 to 192, then stopped). Cause: Flow's book-view window keydown listener (`FoliateView.tsx:1301-1320` at `60b86aff`, from `9fa253b0`) treated ArrowRight, ArrowLeft, PageDown and PageUp alike, called `markUserBrowsingAway()` (which pauses) and turned a page. Owner ruling, verbatim: "In Flow, plain ← and → should change speed only, without pausing or turning a page. PgUp and PgDn stay the keys to look ahead." Fix: the listener reacts only to plain PageUp and PageDown through the pure helper `isFlowBrowseKey(e)`; added Done-when k1 (red first) and k2 (live while playing); merge order unchanged.

## Lessons

- **New:** LL-188 — when a mode has two pacers, a navigation command must move both; a test must read each pacer's own position.
- **Applied:** standing rule 43 — held: red first with a control (`5d88cd28`, `79909736`).
- **Applied:** LL-142 — held: the playing failure was classified from measurement (the word timer overwriting the line pacer; the live control on `60b86aff` stopping at 192).
- **Applied:** reading-mode separation — held: the helper lives in Flow's own helpers; no sibling import; ownership gates pass.

## Files Created

- **Removed (temporary):** none
- **Committed:** memo `Memo.FLOW-KEYS-FIX-1.GovernanceStaging.2026-10-23.md` and `Timing.FLOW-KEYS-FIX-1.jsonl` earlier; this report is committed by Blurby.Roadmap
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** not run per item
- **Footprint:** none

## Governance Updates

- BUG-211 resolution (BUG_REPORT): resolved by a separate edit together with BUG-210.
- IDEAS A5 (FLOW-PAUSED-LINE-1) is already on main. LL-188 is appended to the lessons role.

## Roadmap & Queue Movement

- **Retired:** FLOW-KEYS-FIX-1 — retired from In Flight; no sequence change.

## Next Work

No change from this close-out. FLOW-PAUSED-LINE-1 (IDEAS A5) covers paused line keys.

## Gates

- Integrated identity: branch tip `1d2ee3a4` is an ancestor of origin/main; merged by `c5bb507f` (RC-INTEGRATION-WINDOW; integration commit `fa760dc3`); tested tree 14ce3d24.
- RC window package record: x64 pair on RodneySr at `70d64237`, Brain1's confirmation, arm64 launch on Rodney from `c5bb507f` (`C:\Projects\Blurby-artifacts\rc-merge-20261103\`). Raw run 6 record is on RodneySr (`C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` there). The item's own live k2 run was on `64c2c0b6`, before the merge.

## Git Hand-Off

- [ ] Committed by Blurby.Roadmap.
