---
dispatch: FOCUS-KEYS-FIX-1
date: 2026-11-04
runtime: incomplete time log (rows 3 to 5 open); no Actual stated
tokens: not measured
status: all-pass
---

# Dispatch Close-Out: FOCUS-KEYS-FIX-1

## Dispatch Brief

**Goal:** Make focus reading's (Focus) word, sentence and paragraph keys move the reading word (BUG-210).
**Result:** `ModeRuntime.ts` handles `seek-words`, `sentence` and `paragraph`; `findParagraphStart` and `findBookParagraphStart` are in `src/utils/text.ts`; paragraph starts come from rendered blocks (`foliateParagraphStarts.ts`) with a case-insensitive block test; live on the x64 package, Shift+Right paused 187, 188, 572, 610 and back, matching the DOM block list.
**Learned:** LL-186 and LL-187 — XHTML tag names are lowercase, so tag checks must be case-insensitive; a renderer's paragraph breaks are loaded-slice indices and must be mapped to book-wide words from what is rendered.
**Recommend:** Close it, and resolve BUG-210 in BUG_REPORT by a separate edit, since main still shows it OPEN.
**Bottom line:** Focus's paragraph keys now land on the next rendered block, never jump to a section start or word 0.

## Time

The time log `Timing.FOCUS-KEYS-FIX-1.jsonl` is incomplete: rows 3, 4 and 5 are still open and rows 3 to 5 were not measured. No Actual is given.

| Row | Kind | State |
|---|---|---|
| 1 | positive-control | done |
| 2 | bug-fix | done |
| 3 | merge-and-verify | open |
| 4 | merge-and-verify | open |
| 5 | docs | open |

## Findings

Source: the group 4 evidence check on origin/main 14ce3d24 and the memo. Spec: snapshot 2026-10-23 plus the 2026-10-23 amendment.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---|---|---|---|---|---|---|
| 1 | Red first `focusKeys.test.tsx` | red on base | 6 of 7 fail, control passes | `1f8ffc40` (memo); also `focusParagraphStarts.test.ts` (red `e513db58`) and `bookParagraphStart.test.ts`, all on origin/main | Pass | n/a (new) | Pass |
| 2 | Red files plus boundary, ownership, mode tests | suites | pass | files exist; memo 141 tests passed at `703a5b89`; counted in run 6 | Pass | n/a | Pass |
| 2-src | Implementation | grep on origin/main | present | `text.ts:92`, `:111`; policy lines 381-382; ModeRuntime cases 785 to 847; `isParagraphBlock` at `foliateParagraphStarts.ts:8` | Pass | n/a | Pass |
| 3 | Live: triage #92-95 and amendment Shift+Right 187, 188, 572, 610 | x64 package, scratch profile | equals DOM block list | all 7 presses equal the list, `liveUnchanged: true` (memo, `C:\Projects\Blurby-artifacts\keys-fix\`) | Pass (memo evidence, not re-run) | prior build: 187 to 5480, Left to 0 | Pass |
| 4 | Suite, typecheck, build | counts | green | memo: 2,470 passed, 1 skipped, typecheck 0, build 0 on `568acc60` | Pass | n/a | Pass |
| 5 | Fence | changed files | as listed | matches the memo's list | Pass | n/a | Pass |
| 6 | BUG-210 resolved | BUG_REPORT on main | resolved | main still shows OPEN (lines 231-234) | Pass for the item; documentation fold-in due | n/a | Discovery |

## Interpretation

No row of the item failed. Population: gate (1) run 6, partial; D6 cold, D3 2.00x and Q3 s2 pending a quiet rerun. Run 6 on 14ce3d24 had 3,048 passed, 0 failed, typecheck 0 and 0 crashes. No row of this item depends on those unjudged rows.

Memo evidence, not re-run: row 3 (live package run). Row 6: the branch said "RESOLVED in source", but the RC window kept main's text (ruling R5), so main's BUG-210 is stale. A separate edit resolves BUG-210 and BUG-211. No gate (2) owner row for this item.

## Proposed Dispositions

- **Accept:** close the item. Authority: Blurby.Brain1's run 6 close-out ruling (2026-11-03) plus the item's own evidence; owner approval 2026-11-04 of the close-out plan.

## Mid-Dispatch Decisions

- 2026-10-23, Brain ruling A: the live run on `4ea05617` measured Shift+Right jumping 187 to 5290, because the surface's paragraph breaks index the loaded slice while the keys step over book-wide words. The first fix (`bookParagraphBreaks`, matching per-section word counts) failed live since counts differ per section; Brain ruled for rendered block starts (`findBookParagraphStart`, `703a5b89`).
- 2026-10-23, owner amendment (case-insensitive block lookup): the live re-run on `48203707` passed Ctrl+Right, Ctrl+Down and playing Ctrl+Left but failed Shift+Right (187 to 5480 and on, section starts) and Shift+Left (to 0). Reason: EPUB section documents are `application/xhtml+xml`, so `tagName` is lowercase while `BLOCK_TAGS` is uppercase, and `getBlockParent` never found a block. Fix kept local to the key path; shared `getBlockParent` left to BLOCK-TAG-CASE-1. Red `e513db58`, change `8a0c485f`, then `568acc60`.
- 2026-10-23, tier 1 form deviation: the spec's new lowercase `PARAGRAPH_BLOCK_TAGS` set failed ownership gate G1 (undeclared module singleton), so `568acc60` uses `BLOCK_TAGS.has(el.localName.toUpperCase())`, same members, same case-insensitivity.

## Lessons

- **New:** LL-186 — XHTML `tagName` is lowercase; tag checks must be case-insensitive (`localName`). LL-187 — map a renderer's paragraph breaks to book-wide words from what is rendered, not by matching per-section word counts.
- **Applied:** standing rule 43 — held: red first with a control (`1f8ffc40`, `e513db58`).
- **Applied:** LL-142 — held: the cause was measured live before each change.
- **Applied:** reading-mode separation — held: no sibling import; the helper is shared through the declared path; ownership gates pass.
- **Applied:** LL-166 — held: verdicts came from the runtime's own state through the probe.
- **Applied:** standing rule 36 — held: edit sites re-grepped after the 2026-10-23 merge.

## Files Created

- **Removed (temporary):** none
- **Committed:** memo `Memo.FOCUS-KEYS-FIX-1.GovernanceStaging.2026-10-23.md` and `Timing.FOCUS-KEYS-FIX-1.jsonl` earlier; this report is committed by Blurby.Roadmap
- **Ignored:** none
- **Left for a decision:** none
- **Guard:** not run per item
- **Footprint:** none

## Governance Updates

- BUG-210 resolution line (BUG_REPORT): resolved by a separate edit together with BUG-211.
- Boundary-policy lines and the adapter comment are already in code. LL-186 and LL-187 are appended to the lessons role.

## Roadmap & Queue Movement

- **Retired:** FOCUS-KEYS-FIX-1 — retired from In Flight; no sequence change.

## Next Work

No change from this close-out. BLOCK-TAG-CASE-1 owns the shared `getBlockParent` case fix.

## Gates

- Integrated identity: branch tip `3bfb016e` is an ancestor of origin/main; merged by `c5bb507f` (RC-INTEGRATION-WINDOW; integration commit `fa760dc3`); tested tree 14ce3d24.
- RC window package record: x64 pair on RodneySr at `70d64237`, Brain1's confirmation, arm64 launch on Rodney from `c5bb507f` (`C:\Projects\Blurby-artifacts\rc-merge-20261103\`). Raw run 6 record is on RodneySr (`C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` there). The item's own live packaged run was on `568acc60`, before the merge.

## Git Hand-Off

- [ ] Committed by Blurby.Roadmap.
