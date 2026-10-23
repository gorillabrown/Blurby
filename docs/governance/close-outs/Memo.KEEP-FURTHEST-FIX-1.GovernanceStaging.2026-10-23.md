# Dispatch Close-Out Governance Staging — KEEP-FURTHEST-FIX-1 (gates run; merge waits for the owner's answer)

**Run setup:**
- **Branch:** `eb/keep-furthest-fix-1` from `refs/remotes/origin/main` @ `832df03f`.
- **Worktree:** `C:\Projects\Blurby\.worktrees\keep-furthest-fix-1`, set up with `npm ci`.
- **Shared core:** blurby-6b holds the `ReaderContainer.tsx` window (Blurby.Roadmap, 2026-10-23).
- **Register:** nothing was written (standing rule 46).
- **Bug:** BUG-209 is filed in `BUG_REPORT.md`.

## The change

- **`src/hooks/useProgressTracker.ts`:**
  - **`furthestCfiRef`:** the cfi of the furthest mark's page. It is set where `furthestPositionRef` is set: at open, from the doc's in-memory `furthestCfi`, else its `cfi`.
  - **`noteHighWater(wordIndex, cfi)`:** raises the mark to a page past it and records that page's cfi. It never saves.
  - **`_persistAndLog(finalPos, cfiOverride?)` and `finishReading(finalPos, cfi?)`:** a caller may name the cfi.
  - **The in-memory doc:** it keeps `furthestCfi` beside `furthestPosition`, so a reopen in the same run starts from the furthest page's cfi.
  - **`handleKeepFurthest`:** sends `furthestPositionRef.current` with `furthestCfiRef.current`.
  - **The owner's choice is one constant, `KEEP_FURTHEST_REOPENS_AT_FURTHEST`** (now `true`, the prototype and Blurby.Brain's recommendation). Set to `false`, Keep sends no cfi, and `_persistAndLog` uses the last relocate's on-screen cfi as before. The saved position is the furthest either way.
- **`src/components/ReaderContainer.tsx`:**
  - The persistence port's `updateDocProgress` (the Page-turn save) calls `noteHighWater` for the open document.
  - `scheduleRelocateSave` raises the mark through `noteHighWater` too, so its cfi is recorded.
  - The shell object carries `noteHighWater`, bound from the tracker like its refs.

**A tier-1 change from the spec's "Where":** the raise lives in the hook as `noteHighWater`, not inline in the port. That way the red test drives it through the tracker without mounting `ReaderContainer`. The port only calls it.

## Evidence

| # | Done-when | State | Evidence |
|---|---|---|---|
| 1 | Red first | Done | `tests/keepFurthest.test.tsx`, committed alone first (`f228905f`). On the base, 3 of 4 fail by assertion: Keep saved `['book', 1290, 'epubcfi(page-416)']` where `['book', 2673, 'epubcfi(page-2673)']` was expected. The mark stayed 1290, not 2673. With no turn past the open position, Keep sent the on-screen cfi, not the open cfi. The "Save at page" control passes on the base. All 4 pass on the fix. The test calls `noteHighWater` optionally, so on the base it fails by assertion and not by a TypeError. |
| 2 | "Save at page" unchanged | Done | Control test: `['book', 416, 'epubcfi(page-416)']` on base and fix. |
| 3 | Live | Done | ARM64 `electron-builder --dir` of this tree, scratch profiles, CDP (`furthest-probe.mjs`, scratch only). Session 1 read 10 pages forward and exited, saving 1290. Session 2 turned 5 forward to 2673, 8 back to 416, then exited. **Keep:** the prompt read "Save at page 2 \| Keep at page 11"; Keep saved 2673 with `epubcfi(/6/6!/4/2[pgepubid00003]/30,/356,/356)` in `library.json`; reopen 2673, same cfi. **Save at page:** saved 416 with `…/4,/458,/458`; reopen 416, same cfi. The release build `97527896` gave "Keep at page 6", saving 1290 with the 416 page's cfi. Every window closed itself (exit 0). |
| 4 | Gates | Done, with load failures disclosed | `npm run typecheck` exit 0; `npm run build` exit 0. `npm test`, three runs, while blurby-f0's four UI-SWEEP app processes were running on the machine: (1) 3 failed of 2,453 (not captured); (2) 2,452 passed / 1 skipped / 0 failed in 181 files; (3) 1 failed, `tests/sync-queue.test.js` "concurrent enqueues all persist" timed out at 10 s. It passes alone (21/21) and touches nothing this change does. The targeted files (`keepFurthest`, `useProgressTracker`, `pageReopenCfi`, `pagePositionSave`) passed 76/76. (4) Re-run at 08:37Z with no app process but the owner's 1.1.2 install: 4 failed / 2,448 passed / 1 skipped. All four were 10 s timeouts (one a hook): `auditGate.test.js` (b), `folderNotice.test.js` (fn-z), `folderWatcher.test.js` "yields to the event loop every FOLDER_SCAN_YIELD_EVERY entries", `zipEntryCap.test.js` (b). Import time was 182 s (46 s in run 2), with CPU at 99% from OneDrive sync, IntelliJ, Defender and git, while f0's `keys-probe.mjs` was still running. None touches this change. **Ruling (Blurby.Roadmap, 2026-10-23, tier 1): condition 2 is met by run 2**, a full suite on the owner's machine with 0 failures (standing rule 47). Gate (1) re-runs the whole suite on the quiet machine on the final sha. |
| 5 | Fence | Done | `M src/components/ReaderContainer.tsx`, `M src/hooks/useProgressTracker.ts`, `A tests/keepFurthest.test.tsx`, `M docs/governance/BUG_REPORT.md` (BUG-209), this memo and the time log. `tests/perf-baseline-results.json` stays unstaged. |

## Release effect (from the spec)

- The release-fix sha moves to this item's merge. Gate (1) targets that sha, and the `97527896` installers are superseded and rebuilt.
- The smoke adds the backtrack scenario: in Page, open, turn ahead several pages, go back, choose Keep at furthest, then reopen.

## Out of scope (after the release; in BUG-209)

- Page turns counted toward pages read.
- Persisting the furthest mark.

## Lessons

- **Applied:**
  - Standing rule 43: red first, with a control.
  - LL-161: positions are checked by word index and cfi together.
  - Standing rule 45: the owner's route is re-checked in the smoke.
- **Candidate:** when a save path moves (PAGE-POSITION-SAVE-1 moved Page saves off the relocate path), list every side effect the old path carried: the high-water mark, the pages-read count, the cfi pairing. Each one needs a home on the new path or a test that pins its loss.
