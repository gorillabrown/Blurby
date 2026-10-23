# Dispatch Close-Out Governance Staging — PAGE-REOPEN-CFI-1

**Run setup:**
- **Branch:** `eb/page-reopen-cfi-1` from `refs/remotes/origin/main` @ `67678dbb`, which is main after the SMOKE8-DIAG-1 owner-decision docs merge. It follows Roadmap's dispatch base `d86dead4`.
- **Worktree:** `C:\Projects\Blurby\.worktrees\page-reopen-cfi-1`, set up with `npm ci`.
- **Shared-core integration window:** this item held it for `src/components/ReaderContainer.tsx`.
- **Machine:** the owner's ARM64 Windows 11 machine.
- **Register:** nothing was written (standing rule 46).

## The change

| File | Change |
|---|---|
| `src/hooks/useLibrary.ts` | `updateProgress(docId, position, cfi?)` sets `cfi` when one is given. A negative position (Page's `KEEP_STORED_POSITION`, the cfi-only save) leaves the stored position alone. |
| `src/components/ReaderContainer.tsx` | (1) The persistence port's `updateDocProgress` also passes a saved cfi to the shell's `onUpdateProgress`. It is the single path for Page, Focus, Flow and Narrate (`ModeRuntime.ts:586`, `:611`, each mode's `usePersistentReadingAnchor`). (2) `scheduleRelocateSave` records `{ docId, cfi }` in `lastRelocateCfiRef` and passes the cfi to `onUpdateProgress`. (3) The `onUpdateProgress` prop takes an optional cfi. (4) The shell ref carries `lastRelocateCfiRef`. |
| `src/hooks/useProgressTracker.ts` | `_persistAndLog` sends the cfi of the last relocate in this book, or `undefined`, instead of `activeDoc.cfi`, and passes the same cfi to `onUpdateProgress`. `lastRelocateCfiRef` is returned. |
| `tests/pageReopenCfi.test.ts` (A) | 3 tests that render `useLibrary`: a cfi save reaches the library entry; a cfi-only save keeps the position; a position-only save keeps the cfi (the control). |
| `tests/useProgressTracker.test.ts` | 3 tests that render `useProgressTracker`: no relocate means no cfi; after a relocate, that cfi; a relocate recorded for another book is not sent. |

## Evidence by Done-when

| # | Result | Evidence |
|---|---|---|
| 1 | Met | `tests/pageReopenCfi.test.ts`. On `47ae6e1f`, in a detached base worktree with the same tests, 2 of 3 fail; the position-only control passes on both. On the fix, 3 of 3 pass. |
| 2 | Met | `tests/useProgressTracker.test.ts`. On `47ae6e1f`, all 3 new tests fail (they send `activeDoc.cfi`, and the ref does not exist); on the fix they pass. |
| 3 | Met (with the planner's relaunch amendment) | **Route:** an ARM64 `--dir` build of the fix, on a scratch profile with the bundled *Meditations*, real CDP mouse events. Session 1: 20 turns, exit, quit. Session 2 (relaunch): 12 turns, exit, reopen, exit. Session 3 (a full relaunch): open, exit.<br>**S2 exit:** disk pos 7272, cfi `/6/8!/4/2[pgepubid00004]/40,/300,/300`.<br>**S2 reopen:** `init({lastLocation: "/6/8!…/40,/300,/300"})`, landing on page 31, the exit page. The view's cfi starts at the saved `/40,/300`, so it shows the same word.<br>**S2 second exit:** sends no cfi, and the disk keeps `/40,/300`.<br>**S3:** lands on page 31; its exit keeps `/40,/300`.<br>**On `47ae6e1f`, by contrast:** the S2 reopen landed on page 18 (`/38,/874`), and the exit wrote that cfi back. Timeline: `C:\Projects\Blurby-artifacts\page-reopen-cfi-1\live\timeline-1.json`. |
| 4 | Met | `npm test`: 178 files, 2,436 passed, 1 skipped, 0 failed. `npm run typecheck` exits 0. `npm run build` exits 0. |

## Notes for the planner

- **In Page mode the exit save now sends no cfi.** Page's turns save through the port (the word-anchor and restamp saves) more often than through `scheduleRelocateSave`, which only runs when the relocate gate allows it (`shouldPersistRelocateProgress`). The exit then keeps main's stored cfi, which is the last turn's cfi, written on each turn. The live check shows this: the S2 exit wrote the position and main kept `/40,/300`.
- **Unchanged and pre-existing:** "Keep at furthest" in the backtrack prompt saves the furthest *position* with the cfi of the page on screen, as `activeDoc.cfi` did before. This is not in BUG-201's route. A candidate for PAGE-SAVE-RESTAMP-3's list.
- **Quit timing in the harness:** sessions quit through `app.quit()` with the inspector attached. That holds the process (SMOKE8-DIAG-1, BUG-207 method), so the harness's "exit code timeout" lines are a harness artifact.

## Lessons

- **Applied:**
  - LL-161: the landing is checked by cfi and page, not by index alone.
  - LL-142: the verdict comes from a live run on a build of the fix.
  - Standing rules 47 and 48: full suite, typecheck and build on the owner's machine.
  - Standing rule 46: no register writes.
  - LL-146: the harness scripts stay in the scratchpad.
- **Added:** none.
