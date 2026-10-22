# Dispatch Close-Out Governance Staging — PAGE-POSITION-SAVE-2

Worktree-resident dispatch (`eb/page-position-save-2` from `refs/remotes/origin/main` @ `4193338a`). Run beside ELECTRON-42-UPGRADE-1's crash-count gates; the full suite, the build and the CDP live check were held until Blurby.Roadmap released them.

## Re-grep at dispatch (standing rule 36)

The specification was written on `0f285836`. On `4193338a`:

- **Same content, new lines** (the line-drift rule allows proceeding):
  - `FoliateView.tsx`: comment and declaration 297-298, motion guard 489, auto-clear 500-504, reset 518, `isUserBrowsing` 1027, `clearUserBrowsing` 1045-1047.
  - `ModeRuntime.ts`: `onUserBrowseAway` comment 568, `pollBrowsing` 597-605.
  - `useModeBindings.ts` 1-21 and `boundary-policy.json` 672 and 733: identical.
  - Test harness `mount()` 114-165.
- **Drifted, the N4 site** (`onSectionLoad`, now 648-682). Reported to Blurby.Roadmap, which routed it to Blurby.Brain as option (a).
  - `page-turn-lost` already exists at :644 with `reason=restamp`, from the PAGE-SAVE-RESTAMP items, and test (q) pins it. Done-when 6's count gate prints `FoliateView.tsx:1` on the base.
  - The held-turn branch is gated by `(!rendererNumberedDocsRef.current.has(doc) || bookWordsFailedRef.current)`, and `reportFirstWordOnPage` takes a fourth argument, `click`.

## Evidence

- **Done-when 1, partial (C1a `83fc1318`):** `npx vitest run tests/readerModes/pagePositionSave.test.tsx` exited 1, with `Tests 1 failed | 36 passed (37)`. The failure was (p1): `AssertionError: expected false to be true`. Every existing test passed after the `makeRuntime` extraction. (n4a) and (n4b) wait on the N4 ruling.
- **Done-when 2:** the source removal was in the working tree, and `boundary-policy.json` was not yet edited. `npx vitest run tests/readerModeOwnership.test.ts` exited 1: `Tests 1 failed | 8 passed (9)`. The Q-E presence half listed exactly two problems:
  - `src/components/FoliatePageView.tsx useRef userBrowsingRef @FoliatePageView#0 | page: anchor not found in src/reader/modes/page/FoliateView.tsx :: const userBrowsingRef = useRef(false);`
  - `src/hooks/useFoliateSync.ts setInterval timer @useFoliateSync#0 | page: anchor not found in src/reader/modes/page/useModeBindings.ts :: const timer = setInterval(runtime.pollBrowsing, FOLIATE_BROWSING_CHECK_INTERVAL_MS);`

  After the manifest edit it exited 0: `Tests 9 passed (9)`.
- **Done-when 3 (tree of C2a `553cc8f5`):** the 11 named files: `Test Files 11 passed (11)`, `Tests 184 passed (184)`, exit 0.
- **Done-when 4:** exit 1, no output.
- **Done-when 5:** `pollBrowsing` exit 1, no output. `FOLIATE_BROWSING_CHECK_INTERVAL_MS` in the Page directory: exit 1, no output. The count check printed `src/constants.ts:1`, `flow/useModeBindings.ts:2`, `focus/useModeBindings.ts:2` and `narrate/useModeBindings.ts:2`, exit 0.
- **Done-when 6, first half:** one line, `FoliateView.tsx:1017`, exit 0.
- **Done-when 7:** both entries `copy=False | notCopied=not-used-by-mode`, `count=271`. numstat `2	2`, exit 0.
- `npm run typecheck`: exit 0 on C2a.
- **Done-when 1, rest (C1b `b0e03134`, after the amendment):** exit 1, `Tests 1 failed | 38 passed (39)`. The failure was (n4a): `AssertionError: expected [] to have a length of 1 but got +0`, meaning no `page-turn-lost`. (n4b) and every existing test passed.
- **N4 (C2b `de071287`)** follows Mid-Dispatch Amendment 2026-10-22 option (a). It keeps the gate and `pendingTurn.click`, lifts `sectionStart` as a `let` starting at -1, and uses the prefix `reason=section-load`.
  - Done-when 3: `Test Files 11 passed (11)`, `Tests 186 passed (186)`, exit 0.
  - Done-when 4: exit 1, empty.
  - Done-when 6a: `FoliateView.tsx:1021`, exit 0.
  - Done-when 6b (amended): `src/reader/modes/page/FoliateView.tsx:1`, exit 0.
  - Typecheck: exit 0.
- **Base taken in:** `refs/remotes/origin/main` @ `e257c08a` was merged into the branch at `254eab46`. That brought in only governance files (ROADMAP.md, which carries the amendment, and the register), with no file in this item's fence. Done-when 10 on `254eab46` lists exactly the 5 files.
- **Reviews (in parallel, read-only, tree `254eab46`):**
  - **Spec compliance:** approved with one concern. Done-when 1–7 and 10 are met, and every edit site matches the specification and the amendment. Its concern was that `refs/remotes/origin/main` moved during the review (ROADMAP.md only), so the branch must take it in again before the merge.
  - **Code quality:** ready, with no critical or warning findings. Three notes are left for follow-up and not changed here:
    1. The `reason=section-load` line also fires when a held turn's non-empty range holds no wrapped word, or when the held action was a click, and it does not say which. Only the log is affected.
    2. **Follow-up candidate:** `checkBookWords`' `fail()` (`FoliateView.tsx:589-592`) leaves a held turn in place with no diagnostic when `reportFirstWordOnPage` returns false. That is a silent loss of the same class as N4, outside this item's sites.
    3. `onUserBrowseAwayRef` is assigned and never read. The specification keeps it as the hook a future Jump back trigger calls.
  - The quality review also found `tests/readerModeIsolation.test.ts:469` still calling `call("pollBrowsing")`. The helper skips missing methods, so it is stale but harmless, and outside the fence.
- **Done-when 8 (after Blurby.Roadmap's heavy-gate go, tree `3fd0ec2e` = branch with `refs/remotes/origin/main` @ `954c17d9` merged):**
  - `npm test`: `Test Files 175 passed (175)`, `Tests 2417 passed | 1 skipped (2418)`, exit 0.
  - `npm run typecheck`: exit 0.
  - `npm run build`: exit 0.
- **Done-when 9 (live check, N2):**
  - **Setup:** `npx electron-builder --win --x64 --dir --publish never` exited 0 in this worktree, under `release/`, which is gitignored; the G2 build was untouched. The app was launched as `release\win-unpacked\Blurby.exe --remote-debugging-port=9336`, with `BLURBY_USER_DATA_DIR` set to the scratch profile `%TEMP%\blurby-pps2-37e837ff-5c51-4ca1-b003-728ed795d443`. The owner's profile and Drive were not touched.
  - *Meditations* opened from its library card in Page mode. Every probe returned `visible`.
  - The driver, event log and probe are scratch files under `%TEMP%`, not committed. Each swipe ran in its own CDP connection, so touch emulation was enabled again in each.
  - **(a) Driver control, mid-section: PASS.**
    - From index 1, page 2 of 7, one forward swipe.
    - The log has exactly one `renderer` `snap` entry, on page 3.
    - The probe: index 1 (unchanged), page 3, word 136 "MEDITATIONS", cfi `epubcfi(/6/4!/4/6[pgepubid00000],/2,/2)`.
    - Saved: `position` 136 with the same cfi.
  - **(b) Forward crossing: PASS.**
    - From index 1, page 5 of 7 (`pages − 2`, so i = 1).
    - The log shows `renderer` `snap` with `page` 6 (`pages − 1`), then `view` index 2, then `navigation` and `anchor` relocates on index 2, page 1.
    - The probe: index 2, word 187 "INTRODUCTION", cfi `epubcfi(/6/6!/4/2[pgepubid00003]/2,/4,/4)`.
    - Saved: `position` 187 with the same cfi.
    - The screenshot shows "INTRODUCTION" as the first word on screen.
  - **(c) Backward crossing: PASS.**
    - From index 2, page 1, one backward swipe.
    - The log shows `renderer` `snap` with `page` 0, then `view` index 1, then `navigation` on page 5 of 7.
    - The probe: index 1, page 5 (`pages − 2`), word 184 "APPENDIX", cfi `epubcfi(/6/4!/4/48/2,/2,/2)`.
    - Saved: `position` 184 with the same cfi.
    - The log's clear did not take effect before this swipe, so (b)'s entries remained. The log was read by `t`: the swipe's entries start at t = 109245.
  - **(d) Book start (informational):**
    - From index 0, page 1 of 3 (the cover, which has no words), a backward swipe: the log shows one `view` index 0 entry and one `renderer` `snap` on page 1. The saved state was then `position` 0, cfi `epubcfi(/6/4!/4/2[pg-header]/2[pg-header-heading],/2,/2)`.
    - The chapter list then jumped to its second entry ("MARCUS AURELIUS ANTONINUS…"), which landed on index 1, page 3, word 136. After 5 s, the saved `position` was still 0, not the jump target, so the crossing flag did not linger.
    - **Observation:** the saved cfi changed to `epubcfi(/6/2!/4/2,,/2/2)`, a section-0 (cover) cfi, not the jump target's. It was not traced here; it is left for review, outside this item's acceptance.
  - **(e) Key turns: PASS.** PageDown ×3 from index 1, page 3 ended on index 2, page 1, word 187. The saved `position` is 187 with the probe's cfi, and no Jump back button is shown.
  - The app closed through CDP `Browser.close`: the process exited and the CDP port went down.
  - Owner smoke deferred to batched smoke by Blurby Brain (Rule 11; owner is away). The batched-smoke checklist row is OPTIONAL, since the owner has no touch device: on a touch screen, swipe past the end of a chapter, close the book and reopen it; it opens on the page you swiped to.
- **Staging-plan deviation:** C2 is split. C2a holds the dead-code removal and the manifest change together, as the specification requires. The N4 diagnostic follows as its own commit after the ruling (Blurby.Roadmap's instruction).
