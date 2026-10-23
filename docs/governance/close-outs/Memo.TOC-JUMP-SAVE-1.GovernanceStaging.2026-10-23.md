# Dispatch Close-Out Governance Staging — TOC-JUMP-SAVE-1

Worktree-resident dispatch, built during the Stage 8 code/lockfile freeze; it merges only after the freeze lifts, on Blurby.Roadmap's go.
- **Branch:** `eb/toc-jump-save-1`, from `refs/remotes/origin/main` @ `cda68fed`.
- **Shared core:** `ReaderContainer.tsx` is not touched.

## Re-grep at dispatch (standing rule 36)

On `cda68fed`, every site matched the specification:
- **The API `goTo`** in `src/reader/modes/page/FoliateView.tsx`: content identical. Its body is `pendingTurnRef.current = null; …; return view.goTo(target);`.
- **`turnPage`'s counter:** `:1170`.
- **The relocate handler's turn check:** `:804`.
- **`ModeRuntime.ts`'s `go-to-href`:** `:422-427`. It calls `this.surface.goTo(command.href)` without awaiting it.
- **Test anchors:** the JUMPS row "TOC (go-to-href)" at `:90`, (y) at `:519`, (WC3) at `:599`, and (a) and (r).

**LL-142, foliate's installed paginator:**
- **Navigation scroll:** for a navigation (not `snap`, not `smooth`), `#scrollTo` (`:927-947`) runs `#afterScroll(reason)` before returning.
- **`goTo` (`:1057`):** it awaits `#goTo`, so the landing relocate fires before `view.goTo` resolves, after awaits rather than synchronously.

## Evidence

- **Done-when 1 (C1 `c732010f`, tests alone, base source):** `npx vitest run tests/readerModes/pagePositionSave.test.tsx -t "TOC jump"` exited 1 with `Tests 2 failed | 2 passed | 38 skipped (42)`.
  - (tj1): `expected [] to deeply equal [ [ 'doc-1', 12, 'cfi:0:twelve' ] ]`. The jump saved nothing.
  - (tj3): `expected [] to deeply equal [ [ 'doc-1', 22, 'cfi:3:gamma' ] ]`.
  - (tj2) and the existing (WC3) passed.
- **The fix (`72c29e6c`):** the API `goTo` increments `pageTurnsInFlightRef` and decrements it in `.finally` on `view.goTo(target)`, exactly as the Implementation detail specifies. Nothing else in the file changed. `goToSection` still calls `view.goTo` directly.
- **Done-when 2:** `tests/readerModes/pagePositionSave.test.tsx` passes 42/42. (y), including its "TOC (go-to-href)" row, and (WC3) are unchanged and pass. The related Page suites pass 58/58: `page.behavior`, `page.contract`, `foliateViewTeardown`, `readerModeOwnership`, `readerModeIsolation` and `readerModeBoundaries`.
- **Done-when 3:** `git grep -n -F 'pageTurnsInFlightRef.current += 1' -- src/reader/modes/page/FoliateView.tsx` printed exactly 2 lines, `:984` (the API `goTo`) and `:1172` (`turnPage`), and exited 0. The base printed 1 line, `:1170`.
- **Done-when 4 (live check):** a `--dir` build of `72c29e6c` (`electron-builder --win --x64 --dir --publish never`, exit 0), on scratch profile `%TEMP%\blurby-tocjump-0e1dc3e0-…` with CDP on port 9337. The owner's profile was not touched.
  - **Book open:** *Meditations* opened in Page mode on the cover, index 0, page 1 of 3. Saved state: `position` 0.
  - **The jump:** the contents list's second entry ("MARCUS AURELIUS ANTONINUS…"). The probe read index 1, page 3 of 7, word 136 "MEDITATIONS", cfi `epubcfi(/6/4!/4/6[pgepubid00000],/2,/2)`, visible. `library.json` held `position` 136 and the same cfi. The screenshot's first word on screen is "MEDITATIONS".
    - Before this fix, PAGE-POSITION-SAVE-2's live check (d) saw `position` 0 and the cover cfi for the same jump.
  - **After the quit:** the app was quit through CDP `Browser.close`, a normal quit with no kill, and no app process was left. `library.json` still held `position` 136 and the same cfi.
  - **After the reopen:** the app was relaunched on the same profile and the book opened from its card. The probe read index 1, page 3, word 136 "MEDITATIONS", with the same cfi, and `library.json` was unchanged. The book reopens on the page the jump landed on.
  - The final tree differs from `72c29e6c` only in a code comment and in the tests, so the packaged behaviour is the same.
- **Done-when 5:**
  - **Run 1 (`72c29e6c`):** `npm test` exited 1 with `1 failed | 2432 passed | 1 skipped`. The one failure was outside the diff: `tests/folderWatcher.test.js` "a 1 MB read started 20 ms after startWatcher …", first error line `AssertionError: 1 MB read 113 ms, max event-loop gap 97 ms (read budget 50 ms, gap guard 250 ms)`. While it ran, this run's two read-only reviewers were running their own vitest checks. No failure is classified here.
  - **Re-run (same tree, no packaging processes):** `npm test` exited 0 with `2433 passed | 1 skipped`. `tests/folderWatcher.test.js` alone passed 11/11, twice.
  - **Final tree `f39285ab`:** `npm test` exited 0 with `Test Files 177 passed (177)`, `Tests 2433 passed | 1 skipped (2434)`. `npm run typecheck` exited 0, and `npm run build` exited 0.
- **Done-when 6:** the merge-base diff lists exactly `M src/reader/modes/page/FoliateView.tsx` and `M tests/readerModes/pagePositionSave.test.tsx`, plus this memo. No time log was kept. `tests/perf-baseline-results.json`, dirtied by the suite, is left unstaged.

## Reviews (in parallel, read-only, `72c29e6c`)

- **Spec compliance:** all criteria met, no failures.
- **Quality:** minor fixes. The code is sound. The finding was taken and fixed in `f39285ab`:
  - **Problem:** the (tj1) and (tj3) fakes fired `relocate` before their first `await`. A version that released the counter early would still pass.
  - **Fix:** they now yield once (`setTimeout 0`) before dispatching, as foliate does, and the tests `settle()` afterwards, because `go-to-href` does not await the jump.
  - **Proof:** with that early-release version planted (counter released straight after calling `view.goTo`), (tj1) and (tj3) fail. With the real fix they pass. The code comment now says "after awaits inside view.goTo, before it resolves" instead of "synchronously".
- **Notes from the quality review, for Blurby.Roadmap or Blurby.Brain (none blocks the item):**
  1. **Behaviour change:** the landing save runs the whole of `onPageTurned`, as a page turn does. After a contents-list jump, a mode switch starts at the landed page's first word, not at the contents entry's own word. These differ when a chapter heading sits mid-page. Turns already behave this way, and tests (c) and (W2) pin that for turns.
  2. **Wider window for cross-section jumps:** the in-flight window spans the section load. A non-turn `anchor` relocate on the new section can save once before the landing relocate, which saves last, so the final state is right.
  3. **Unchanged limits:** these cases still keep the early commit, as the blank-edge case does:
     - a jump foliate drops while a turn holds its lock;
     - an unresolvable href;
     - an anchor with no rects or pages.
  4. **Same defect class, out of scope:** internal-link and footnote jumps, and next/previous chapter, still save no landing.
  5. **Animated renderer:** not reachable for `go-to-href`, because nothing sets `animated` and a navigation scroll never animates. The specification's stop condition cannot occur on this path.

## Owner smoke (batched)

Add to gate (2)'s list: in Page mode, open a book, jump from the contents list to a later chapter, quit and reopen; it reopens on that chapter's page.
