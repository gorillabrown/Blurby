#### PAGE-LINK-HELD-TURN-1 — A link that never lands keeps the page the reader turned to *(Seq 97.8; Full Spec 2026-11-05, cited against `origin/main` `14ce3d24`; Reader Engine; split from PAGE-SAVE-RESTAMP-3 Wave B by Blurby.Brain1, 2026-11-05; after BLOCK-TEXT-ORDER-1, which edits the same file; not a release gate)* <a id="page-link-held-turn-1"></a>

- **What:** in page reading (PageReaderView, `src/reader/modes/page/FoliateView.tsx`), a held page turn is cancelled when a jump lands, not when it starts. A jump that never lands leaves the held turn to save once the word numbers apply.
  - **Outcome:** a reader who turns a page and then presses a link foliate cannot resolve keeps the turned page. A jump that lands saves the landing, and never the older turn.
  - **Out of scope:**
    - Flow, Focus and Narrate (their runtimes stay isolated);
    - the other four cancels (`FoliateView.tsx:494`, `:511`, `:885`, `:1043`), which are not `goToLanding`;
    - the count amendment for PAGE-SAVE-RESTAMP-2 and PAGE-SAVE-RESTAMP-GUARD-1 (Findings F-031), which stays with the planner, the owner and an independent reviewer.
- **Why (root cause, rule 6c):** `goToLanding` (`:810-813`) clears `pendingTurnRef` at line 811, before `view.goTo` has moved anything. If the jump never lands, the reader is still on the turned page and its save is gone. PAGE-SAVE-RESTAMP-2 observed this live (L9: a link at +203 ms dropped the turn; the view stayed on the turned page).
- **Origin:** PAGE-SAVE-RESTAMP-3 Wave B ([snapshot](../../.Archive/ROADMAP_snapshot_2026-10-23-4.md#page-save-restamp-3)), Findings F-028, and `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.post-halt-rulings.2026-11-05.md` section 1b. This specification replaces Wave B, including its B-0 re-check: JUMP-LANDING-SAVE-1 moved the cancel into `goToLanding` and did not remove it, so (lc1) is red on main.

##### Design decisions (Blurby.Brain1, 2026-11-05, binding)

- **The cancel moves to the landing.** `goToLanding` marks a jump in flight and clears the mark in its existing `finally`. The `relocate` branch at `:823-828` clears `pendingTurnRef` when a jump is in flight, before `reportTurn`.
- **Removing the cancel alone opens a hole.** `reportTurn` returns early on a blank edge page (`:609`, `start === end`). A jump landing there would leave the older held turn to save later, for a page the reader has left. Clearing before `reportTurn` closes it; (lc3) pins it.
- **The mark is a counter, `jumpsInFlightRef`.** This is the idiom of `pageTurnsInFlightRef` (`:812`). Two overlapping jumps must not clear each other's mark. It is mode-local to this file.
- **A jump with no relocate leaves the held turn alone.**

##### Edit sites (verified at `14ce3d24`; re-verify after BLOCK-TEXT-ORDER-1 merges)

- `src/reader/modes/page/FoliateView.tsx`:
  - near `:310`, add `jumpsInFlightRef`;
  - `:810-813`, `goToLanding`: remove line 811's cancel, count the jump, and decrement it in the `finally`. Keep the `TOC-JUMP-SAVE-1, JUMP-LANDING-SAVE-1` comment and add this item's id;
  - `:823-828`, `relocate`: inside the `if`, clear `pendingTurnRef` when `jumpsInFlightRef.current > 0`, before `reportTurn(e.detail.range)`.
- `tests/readerModes/pagePositionSave.test.tsx`: the `JUMPS` table (`:90-97`), row (y) (`:522-534`), and three new tests.

##### Tests

All new tests are in `tests/readerModes/pagePositionSave.test.tsx`, in the (y) describe block, using `mount`, `rawDoc`, `loadSection`, `spanRange` and `BOOK_WORDS`.

- **(lc1) A link jump that never lands.** A held turn on `spanRange(doc, 2, 3)`, then a `link` event with no relocate after it, then `render(BOOK_WORDS)` and `settle()`. Assert `saves(fake).map((e) => e.args)` equals `[["doc-1", 22, "cfi:3:gamma"]]`.
- **(lc2) A link jump that lands.** The same, with the landing relocate on another page. Assert the landing's save, or its hold if provisional, replaces the held turn, and no entry for word 22 is ever saved.
- **(lc3) A jump landing on a blank edge page.** The same, with the landing relocate's `range` collapsed so `start === end`. Assert `saves(fake).map((e) => e.args)` equals `[]`: the older turn is never saved.
- **(y), rule 50 update.** The waiver "a jump cancels a held turn" moves with this code. Both rows that route through `goToLanding` change: `internal link` and `TOC (go-to-href)` (through `goTo` at `:1002`).
  - Current: both expect the default `saved = []` with no landing relocate.
  - Intended: each row dispatches a landing relocate after the jump, and keeps `saved = []`. (lc1) now carries the no-landing case.
  - The `goToSection`, `highlight with motion` and `word click` rows do not change. Their cancels are `:885`, `:1043` and the click path.

##### Done when

| # | Criterion | Verify |
|---|---|---|
| 1 | (lc1) and (lc3) were committed alone and fail by assertion on the base | Commit named in the memo; `npx vitest run tests/readerModes/pagePositionSave.test.tsx -t "lc1"` exits 1 at it, and likewise `-t "lc3"` |
| 2 | (lc1), (lc2), (lc3) and all (y) rows pass | `npx vitest run tests/readerModes/pagePositionSave.test.tsx` exits 0 |
| 3 | No unconditional cancel remains in `goToLanding` | `git grep -n -A2 "const goToLanding" -- src/reader/modes/page/FoliateView.tsx` prints no `pendingTurnRef.current = null` |
| 4 | The relocate clear runs before `reportTurn` | `git grep -n -B2 "reportTurn(e.detail.range)" -- src/reader/modes/page/FoliateView.tsx` prints `jumpsInFlightRef` in the first branch |
| 5 | The other cancels are untouched | `git diff <base>...HEAD -- src/reader/modes/page/FoliateView.tsx` removes exactly one line matching `pendingTurnRef.current = null` |
| 6 | Suite, typecheck and build pass | `npm test`, `npm run typecheck` and `npm run build` each exit 0 |
| 7 | Fence held | `git diff --name-only <base>...HEAD` lists only `FoliateView.tsx` (Page), the test file, the memo and the time log |
| 8 | Rule 53 package verification | The memo's "Package verification" section, with Blurby.Brain1's confirmation, per the post-completion checklist |
| 9 | Live check on the packaged build | A scratch-profile probe of a link with an unresolvable target after a held turn saves the turned page, and the same probe's resolvable link saves the landing. The memo records both saves |

##### Failure handling

- **If (lc1) passes on the base:** stop and report to Blurby.Brain1. The cancel has moved again.
- **If BLOCK-TEXT-ORDER-1 changed `goToLanding` or the relocate branch:** re-verify the sites. A structural change is a STOP to Blurby.Brain1.
- **If any other test in the file fails after the fix:** stop and report. Do not change an expectation that this specification does not name.
- **Retry ceiling:** two fix attempts, then a STOP to Blurby.Brain1 with both results.
- **Rollback:** `git revert -m 1 <merge>`.

##### Repository plan and host (rule 6b)

- **Host:** RodneySr, in `<clone>\.worktrees\page-link-held-turn-1`, with `npm ci`. Brain1 confirms the host's inputs before launch.
- **Branch:** `eb/page-link-held-turn-1` from `refs/remotes/origin/main` after BLOCK-TEXT-ORDER-1 merges. Push with `HEAD:refs/heads/eb/page-link-held-turn-1`.
- **Staging:** exact paths: `src/reader/modes/page/FoliateView.tsx`, `tests/readerModes/pagePositionSave.test.tsx`, `docs/governance/close-outs/Memo.PAGE-LINK-HELD-TURN-1.GovernanceStaging.<date>.md` and `docs/governance/close-outs/Timing.PAGE-LINK-HELD-TURN-1.jsonl`. Never stage `tests/perf-baseline-results.json`.
- **Merge:** `--no-ff`, on Blurby.Brain1's package confirmation and Blurby.Roadmap's merge go.
- **Lane ownership:** surface C. **Forbidden during a parallel run:** the other modes' views and runtimes, `main/`, `preload.js`, `src/components/ReaderContainer.tsx`. **Shared-core touches:** none. **Merge order:** after BLOCK-TEXT-ORDER-1, and after FLOW-SAVE-AS-YOU-GO-1 and NARRATE-SAVE-AS-YOU-GO-1 in sequence order.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red tests lc1 and lc3 committed alone on the base | calculable | positive-control | bounded | medium | 10m | — | — |
| 2 | The cancel moves to the landing, lc2 added, and (y) updated | calculable | renderer-fix | bounded | medium | 15m | — | — |
| 3 | Suite, typecheck and build pass | calculable | verify-gate | mechanical | low | 10m | — | — |
| 4 | Package verified, with the live link check | calculable | live-check | bounded | medium | 20m | — | — |
| 5 | Memo, time log and push | calculable | merge-and-docs | mechanical | low | 5m | — | — |

**Total:** chain 1h · sum 1h; 0 of 5 estimated tasks calibrated

##### Lessons applied

- **Standing rule 43:** (lc1) and (lc3) are committed alone and fail by assertion before the fix.
- **Standing rule 50:** the (y) waiver moves with its code, so both `goToLanding` rows are brought into scope, and the TOC row is named here rather than found at test time.
- **Standing rule 53:** the item carries a packaged check, because the file ships.
- **LL-142:** the live check reads real saves on a packaged build, not the test double's.
