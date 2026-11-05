#### FURTHEST-PERSIST-1 — The furthest page a reader reached is remembered across sessions *(Seq 114; Full Spec 2026-11-03, cited against RC tip `70d64237`; owner ruling 2026-10-25, tier 2, and owner ruling 2026-11-03, design batch #16; Reader Engine; not a release gate)*

- **What:** main records each book's furthest word ever reached (`furthestPosition`) and that page's cfi (`furthestCfi`) in `library.json`.
  - It raises them, and never lowers them, on every progress save that carries a word index. That includes the save made by "Save at page" / "Move Position" (owner ruling 2026-11-03, design batch #16).
  - Only a progress reset clears them (design batch #16).
  - Cloud sync merges them by the higher mark.
  - The renderer's library copy follows the same rule, so a reopen in the same session sees it.
  - The reader already reads both fields at open (`src/hooks/useProgressTracker.ts:150-157`). The backtrack prompt and "Keep at furthest" therefore use the persisted mark with no reader change.
  - **Outcome:** a reader who reads ahead, backs up and quits without the exit prompt is offered the furthest page at the next session's exit prompt, and "Keep" reopens on it. A reader who answers that prompt with "Move Position" is offered the same furthest page again next time, until they read past it or reset the book.
- **Out of scope:**
  - The prompt's labels (POSITION-PROMPT-COPY-1).
  - The pages-read count (PAGE-PAGES-READ-1).
  - Any change to `useProgressTracker.ts`, `BacktrackPrompt.tsx` or `ReaderContainer.tsx`.
  - The in-session reset of the in-memory mark by "Move Position" (`useProgressTracker.ts:326-330`). It stays. It only affects the open that is ending; see the design note below.
- **Why (investigation, 2026-11-03, on `70d64237`):** today the furthest mark lives only in memory for one open.
  - `furthestPositionRef` is seeded from `activeDoc.furthestPosition ?? activeDoc.position` (`useProgressTracker.ts:150-157`) and raised by `noteHighWater` (`:160-164`).
  - `update-doc-progress` (`main/ipc/documents.js:15-33`) saves only `position` and `cfi`.
  - `useLibrary.updateProgress` (`src/hooks/useLibrary.ts:162-168`) copies only those two.
  - `_persistAndLog` (`useProgressTracker.ts:243`) writes `furthestPosition` and `furthestCfi` only onto the in-memory `activeDoc` (`:250`, `:257`). `activeDoc` is always a spread copy of the library entry (`src/components/LibraryContainer.tsx:241-243`, `src/utils/loadDocResult.ts:39`, `:43`), so these writes never reach the library or `library.json` and are lost at quit.
  - `src/types.ts:107-108` declares `furthestPosition` with a wrong comment ("Page number (non-EPUB) or fraction 0.0-1.0 (EPUB)"; it is a word index) and has no `furthestCfi`.
  - `mergeLibrary` copies whichever record wins and merges only `position` (`main/sync-engine.js:323`, `:330-341`).
- **Design (settled):**
  - **Recorded ruling, design batch #16 (owner ruling 2026-11-03):** "Move Position" does not lower the saved furthest point. It stays where it was; only Reset clears it. This replaces the draft's open owner confirmation.
  - **Monotonic stored mark, written in main.** In `update-doc-progress`, before `position` and `cfi` are written:
    - **Seed:** if `doc.furthestPosition` is not a finite number (a record saved before this item), set it to `max(0, doc.position || 0)` and `doc.furthestCfi` to the stored `doc.cfi`. Delete `furthestCfi` when there is no stored cfi.
    - **Raise:** if the incoming `position` is a finite number ≥ 0 and greater than `doc.furthestPosition`, set `furthestPosition = position` and `furthestCfi = cfi`. Delete `furthestCfi` when the save carries no cfi. That mirrors `noteHighWater`'s `cfi ?? null` (`useProgressTracker.ts:163`).
    - **Ignore:** a cfi-only save (`position` −1, PAGE-SAVE-RESTAMP-2, `documents.js:22`) neither seeds nor raises.
    - **Why main:** every mode's save already goes through this one IPC (`tests/updateDocProgressLastRead.test.js`, header and (m)). That covers Page turns, Focus and Flow relocate saves, exit saves, the Move/Keep prompt answers and the legacy standalone window. One site covers every writer, and no preload channel or `ElectronAPI` member changes (LL-106).
    - **Move Position needs no special case.** `handleSaveAtCurrent` (`useProgressTracker.ts:326-330`) saves `currentPos` through the same IPC. That position is below the stored mark, so the raise rule leaves the mark alone, which is the ruling.
  - **Reset clears it.** `reset-progress` (`documents.js:35-50`) deletes `furthestPosition` and `furthestCfi`. A reset is an explicit restart, and a kept mark would make the next prompt contradict it. The renderer's `resetProgress` (`useLibrary.ts:70-80`) does the same.
  - **Sync merge by the higher mark.** In `mergeLibrary`, after the position merge (`sync-engine.js:335-341`):
    - in the pending-reset branch, delete both fields;
    - otherwise take `furthestPosition` and `furthestCfi` from the side whose mark is higher. A record without the field counts its `position`, with its `cfi`. A tie keeps local.
    - This matches "ever reached" across devices and the existing furthest-ahead position merge.
  - **Renderer copy.** A new pure helper, `raiseFurthestMark(doc, position, cfi)` in `src/utils/furthestMark.ts`, applies the same seed and raise rule and returns `{ furthestPosition, furthestCfi }`. `useLibrary.updateProgress` spreads it when `position >= 0`.
    - It is a second copy because main is CommonJS and the renderer is ESM (standing rule). Both tests use one case table, copied into each.
  - **Design note: the in-session ref.** "Move Position" still resets `furthestPositionRef` in memory (`useProgressTracker.ts:328`) and then exits through `finishReading`. That ref dies with the open. The mutation of `activeDoc.furthestPosition` at `:250` lands on the spread copy only. The library entry, which the next open reads, is changed only by `updateProgress` and therefore keeps the higher mark. Both the same-session reopen and the next session see the stored mark, as ruling #16 requires. Done-when 5 proves this live.
- **Prerequisites:**
  - The RC integration window's merge to `main`.
  - **LIBRARY-WRITE-RACE-3 (Seq 89) merged first.** Both items edit shared-core `src/types.ts`. LIBRARY-WRITE-RACE-3's post-RC amendment (`docs/planning/specs/2026-11-03/LIBRARY-WRITE-RACE-3.post-rc-amendment.md`, "Shared core") bars any other sprint from `src/types.ts` while it runs. This item cuts from `main` after LIBRARY-WRITE-RACE-3's merge, never in parallel with it. The only other route is a declared integration window that Brain1 serializes.
  - APP-TABS-1 (carried by the RC window) also touched `src/types.ts`; the RC merge settles it.
  - No hard dependency on PAGE-PAGES-READ-1 (Seq 113). This item edits neither `useProgressTracker.ts` nor `ReaderContainer.tsx`.
  - Re-grep every cited line at the cut (standing rule 36).
- **Done when** (PowerShell 7, `pwsh`, from the worktree root; each command passes only on exit 0 unless stated):
  1. **Red first (standing rule 43).** Commit the three new test files alone. On the base, `npx vitest run tests/furthestPersist.test.js tests/furthestMerge.test.js tests/furthestMark.test.ts` exits 1. The red cases fail as marked below, and the controls (fp5, fp7, fm4) pass. Record the output in the memo.
  2. **The change** is made at the edit sites below, and nowhere else.
  3. `npx vitest run tests/furthestPersist.test.js tests/furthestMerge.test.js tests/furthestMark.test.ts tests/updateDocProgressLastRead.test.js tests/keepFurthest.test.tsx tests/useProgressTracker.test.ts tests/pageReopenCfi.test.ts tests/useLibrary.test.ts tests/libraryWriteRace2.test.js tests/appTabsMove.test.js tests/saveLibraryMerge.test.js tests/sync-hardening.test.js tests/quitSequence.test.js` exits 0, with no existing test edited (standing rule 50).
  4. `npm test`, `npm run typecheck` and `npm run build` each exit 0 (standing rules 47 and 48).
  5. **Live, packaged** (standing rule 53(a); scratch profile proved before the first input, LL-165).
     - **Triggers that commit the state (standing rule 54):**
       - each Page turn's `update-doc-progress`;
       - each prompt answer's `update-doc-progress`;
       - the app's quit, whose QUIT-FLUSH-1 sequence drains the debounced library save (LL-159).

       Each check reads `library.json` on the scratch profile after a 2 s settle following the quit.
     - **Session 1:** open the sample *Meditations* (`resources/sample-meditations.epub`) in Page and turn forward 8 pages. Record the landed word index from `library.json`'s `position` after a 2 s settle; this is F. Turn back 5 pages, which is more than `BACKTRACK_THRESHOLD_WORDS` (500, `src/constants.ts:166`). Quit with the window's close button and do not press Escape, so no prompt is shown.
       - **Pass (file):** the record has `furthestPosition === F`, a non-empty `furthestCfi`, and `position < F`.
     - **Session 2 (ruling #16):** relaunch on the same scratch profile, open *Meditations* and press Escape.
       - The backtrack prompt appears. Its furthest button names page `ceil(F / 250)` (`APPROX_WORDS_PER_PAGE`, `src/constants.ts:164`), whatever its label wording.
       - Choose the save-at-current button: the prompt's first button, wired to `onSaveAtCurrent` (`src/components/BacktrackPrompt.tsx:34-40`).
       - Quit.
       - **Pass (Move keeps the mark):** `position < F`, `furthestPosition === F`, and `furthestCfi` is unchanged from session 1.
     - **Session 3:** relaunch, open *Meditations* and press Escape.
       - **Pass (prompt again):** the prompt appears and names page `ceil(F / 250)` again.
       - Choose Keep (`onKeepFurthest`, `BacktrackPrompt.tsx:41-48`), then quit.
       - **Pass (Keep):** `library.json` has `position === F` and `cfi === furthestCfi`. A reopen lands on that page.
     - **Control on a base `--dir` build (standing rules 54 and 55):** the same session 1 leaves no `furthestPosition` in the record, and session 2 shows no prompt.
     - Record every session's values for both builds in the memo.
  6. **Package verification (standing rule 53):** (a)–(e) on the final commit with `origin/main` merged in. `npx asar list` shows `main/ipc/documents.js` and `main/sync-engine.js`, and `dist/` is rebuilt. Blurby.Brain1 confirms before the merge go.
  7. **Fence (standing rule 41):** `git diff --name-status <base>` lists exactly these paths, plus the staging memo and the time log:
     - `M main/ipc/documents.js`
     - `M main/sync-engine.js`
     - `M src/hooks/useLibrary.ts`
     - `A src/utils/furthestMark.ts`
     - `M src/types.ts`
     - `A tests/furthestPersist.test.js`
     - `A tests/furthestMerge.test.js`
     - `A tests/furthestMark.test.ts`
- **Effort:** S.
- **Owners:**
  - planner;
  - implementation agent (bounded; electron-scope and renderer-scope);
  - spec-compliance reviewer, then quality reviewer;
  - repository operator;
  - package verifier on RodneySr;
  - Blurby.Brain1 for package confirmation and any ruling on a failing pinned test;
  - Blurby.Roadmap for the merge go.
- **Source:**
  - Owner ruling 2026-10-25, tier 2 (`docs/planning/roadmap-reviews/2026-10-25-phase-brief.md`, "Owner design answers").
  - Owner ruling 2026-11-03, design batch #16 (`docs/planning/roadmap-reviews/2026-11-03-owner-design-batch.md:22`, `:38`).
  - The ROADMAP stub `#furthest-persist-1`.
  - The PAGE-SAVE-RESTAMP-3 Wave C re-scope (`docs/planning/roadmap-reviews/2026-10-25-audit.md`, "Re-scope due").
  - KEEP-FURTHEST-FIX-1's tests (`tests/keepFurthest.test.tsx`).
  - The code trace above, on `70d64237`.
- **Path:** dispatch.

##### Implementation detail

- **Edit sites (line numbers on `70d64237`; re-grep at the cut):**
  1. **`main/ipc/documents.js`:**
     - Beside `snoozedDocIds` (`:12`), add a module-level `function raiseFurthest(doc, position, cfi)` that implements the seed and raise rule above.
     - In `update-doc-progress` (`:15-33`), add `if (hasPosition) raiseFurthest(doc, position, cfi);` between `const hasPosition = …` (`:22`) and `if (hasPosition) doc.position = position;` (`:23`). The seed must read the stored position and cfi before they are overwritten.
     - In `reset-progress` (`:35-50`), add `delete doc.furthestPosition; delete doc.furthestCfi;` after `delete doc.cfi;` (`:39`).
     - Comment both sites with `FURTHEST-PERSIST-1`.
  2. **`main/sync-engine.js` `mergeLibrary`, `:335-341`:**
     - In the reset branch, after `mergedDoc.position = 0;` (`:337`), add `delete mergedDoc.furthestPosition; delete mergedDoc.furthestCfi;`.
     - In the normal branch, after the `Math.max` line (`:340`):

       ```js
       // FURTHEST-PERSIST-1: the higher furthest mark, with its own page's cfi; a record without one counts its position.
       const furthestOf = (d) => (Number.isFinite(d.furthestPosition) ? d.furthestPosition : (d.position || 0));
       const furthestCfiOf = (d) => (Number.isFinite(d.furthestPosition) ? d.furthestCfi : d.cfi);
       const furthestSource = furthestOf(cloudDoc) > furthestOf(localDoc) ? cloudDoc : localDoc;
       mergedDoc.furthestPosition = furthestOf(furthestSource);
       if (furthestCfiOf(furthestSource)) mergedDoc.furthestCfi = furthestCfiOf(furthestSource); else delete mergedDoc.furthestCfi;
       ```

  3. **New `src/utils/furthestMark.ts`:**
     - Signature: `export function raiseFurthestMark(doc: Pick<BlurbyDoc, "position" | "cfi" | "furthestPosition" | "furthestCfi">, position: number, cfi?: string): { furthestPosition: number; furthestCfi: string | undefined }`.
     - It applies the same seed and raise rule. It returns `furthestCfi: undefined` wherever main deletes the field.
     - Header comment: "renderer copy of main/ipc/documents.js raiseFurthest (CommonJS/ESM boundary); the two tests copy one case table".
  4. **`src/hooks/useLibrary.ts`:**
     - In `updateProgress` (`:162-168`), add `...(position >= 0 ? raiseFurthestMark(d, position, cfi) : {})` after the `cfi` spread (`:166`).
     - In `resetProgress` (`:73`), set `{ ...d, position: 0, furthestPosition: undefined, furthestCfi: undefined }`.
     - Import `raiseFurthestMark` from `../utils/furthestMark`.
  5. **`src/types.ts:107-108`** (shared core; serialized after LIBRARY-WRITE-RACE-3):
     - Replace the two comments with `// Sprint 25S / FURTHEST-PERSIST-1: the furthest word index ever reached; main raises it on each progress save, only a reset clears it`.
     - Add `furthestCfi?: string; // the cfi of that word's page, when the raising save carried one` after `furthestPosition`.
  - **Unchanged by design:**
    - `useProgressTracker.ts` already reads both fields at open (`:150-157`). Its `as any` casts stay, because removing them would widen the fence into a file PAGE-PAGES-READ-1 owns.
    - `preload.js:54` is unchanged, because there is no new channel.
- **Tests** (case tables copied, not imported; standing rule 52):
  - **`tests/furthestPersist.test.js` (new).**
    - **Harness:** copied from `tests/updateDocProgressLastRead.test.js:7-55` (the `Module._load` patch and the documents harness). Each case calls the real `update-doc-progress` or `reset-progress` handler on a doc object and asserts its fields.
    - **(fp1)** `{ position: 1290, cfi: "C1290" }`, then save `(2673, "C2673")` → `furthestPosition 2673`, `furthestCfi "C2673"`. *Base: undefined.*
    - **(fp2)** Then save `(416, "C416")` → `position 416`, and the furthest fields stay `2673` / `"C2673"`. *Base: undefined.*
    - **(fp3) Seed:** `{ position: 5000, cfi: "C5000" }`, then save `(100, "C100")` → `furthestPosition 5000`, `furthestCfi "C5000"`, `position 100`. *Base: undefined.*
    - **(fp4) No cfi:** `{ position: 10, furthestPosition: 10, furthestCfi: "C10" }`, then save `(50)` → `furthestPosition 50`, and `"furthestCfi" in doc` is false. *Base: 10 and "C10".*
    - **(fp5) Control:** `{ position: 10 }`, then a cfi-only save `(-1, "Cx")` → `"furthestPosition" in doc` is false, and `position` is 10.
    - **(fp6)** `{ position: 400, furthestPosition: 2673, furthestCfi: "C2673" }`, then `reset-progress` → neither field is present. *Base: both kept.*
    - **(fp7) Control, ruling #16 (Move Position's save):** `{ position: 2673, furthestPosition: 2673, furthestCfi: "C2673" }`, then save `(900, "C900")` → `position 900`, `furthestPosition 2673`, `furthestCfi "C2673"`. *Passes on the base because the fields are untouched there. It pins that a lower save never lowers the mark.*
  - **`tests/furthestMerge.test.js` (new).**
    - **Harness:** the `vi.mock`s copied from `tests/libraryWriteRace2.test.js:11-31`, with `getPendingOps` as a `vi.fn(() => [])` that each case can set. It imports the real `mergeLibrary`.
    - **(fm1)** Local `{ position: 400, furthestPosition: 2673, furthestCfi: "C2673", revision: 5 }`, cloud `{ position: 900, furthestPosition: 1000, furthestCfi: "C1000", revision: 6 }` → merged `furthestPosition 2673`, `furthestCfi "C2673"`, `position 900`. *Base: 1000, because cloud wins the record.*
    - **(fm2)** Local `{ position: 900, furthestPosition: 1000, furthestCfi: "C1000", revision: 7 }`, cloud `{ position: 800, furthestPosition: 3000, furthestCfi: "C3000", revision: 6 }` → `3000` and `"C3000"`. *Base: 1000.*
    - **(fm3)** `getPendingOps` returns `[{ op: "reset-progress", docId: "x", revision: 9 }]` → merged `position 0`, and neither furthest field is present. *Base: kept.*
    - **(fm4) Control:** two records without furthest fields → `position` is the higher of the two, as today.
  - **`tests/furthestMark.test.ts` (new).**
    - It loads `../src/utils/furthestMark` through a dynamic import with a fallback that returns `{}`, the pattern of `tests/readerModes/focusParagraphStarts.test.ts:9-13`.
    - **(f1)–(f4)** run (fp1)–(fp4)'s table on the pure helper. *Base: the module is absent, so each case fails on its assertion.*
    - **(f5)** is a `useLibrary` round trip, with the harness copied from `tests/pageReopenCfi.test.ts:1-33`. `updateProgress("book", 7272, "S")` then `updateProgress("book", 100, "T")` → the library entry has `furthestPosition 7272`, `furthestCfi "S"` and `position 100`. *Base: undefined.*
- **Constants:** none.
- **Branch:** `eb/furthest-persist-1`, cut from `main` after the RC window's merge and LIBRARY-WRITE-RACE-3's merge. Push with `git push origin HEAD:refs/heads/eb/furthest-persist-1` (LL-181).
- **Staging plan:**
  - Stage the Done-when 7 paths by exact path and commit on the branch.
  - At close-out, add `docs/governance/close-outs/CloseOut.FURTHEST-PERSIST-1.<date>.md`, which includes a Lessons section and a "Package verification" section.
  - Merge `--no-ff` after Blurby.Brain1's package confirmation and Blurby.Roadmap's merge go (Rule 5b), then push `main`.
- **Execution host:** RodneySr (rule 6b). The clone is `C:\Users\estra\Projects\Blurby` and the worktree is `C:\Users\estra\Projects\Blurby\.worktrees\furthest-persist-1`, created with `git -C C:/Users/estra/Projects/Blurby worktree add -b eb/furthest-persist-1 .worktrees/furthest-persist-1 origin/main`.
  - **Prerequisites on the host:**
    - the base contains both merges;
    - `npm ci` completes;
    - `resources/sample-meditations.epub` opens on a fresh scratch profile.
  - Build and suite run on RodneySr. The arm64 native launch runs on Rodney at merge (standing rule 53).
- **Package verification:** standing rule 53, (a)–(e), on RodneySr:
  - the x64 `--dir` and arm64 `--dir` builds;
  - a 25 s x64 scratch launch with the LL-165 profile proof and no error line;
  - `npx asar list` showing the two `main/` files;
  - Done-when 5 run on the packaged exe;
  - a "Package verification" section in the close-out.

  The arm64 launch is at merge on Rodney.
- **Failure handling:**
  - **A pinned test fails because a record now carries the furthest fields** (for example, a deep-equal on a doc after `update-doc-progress` or `mergeLibrary`): name it in the memo and ask Blurby.Brain1 before editing it (standing rule 50).
  - **Done-when 5 shows no `furthestPosition` after the quit:** check whether the quit flushed the library (LL-159).
    - If `position` is also stale, the quit flush is at fault, which is outside this item: STOP and report.
    - If only the furthest fields are missing, the fix is wrong: STOP.
  - **Session 2 lowers `furthestPosition`:** a writer other than `update-doc-progress` is persisting the in-memory `activeDoc` mark. STOP and return to Brain1 with the writer's call site. Do not widen the fence.
  - **The base control shows a prompt in session 2:** the check cannot see the defect. STOP and report (standing rule 55).
  - **Retry ceiling:** one re-run per failing gate, then STOP and file an issue.
  - **Rollback:** `git revert -m 1 <merge>`. Records that already carry the two fields stay valid on the reverted code. It ignores `furthestCfi` and seeds the ref from `furthestPosition`, as it does today.
- **Lane ownership:** Reader Engine; execution surfaces D (main IPC and sync) and C (library state).
- **Forbidden during parallel run:**
  - `src/hooks/useProgressTracker.ts`
  - `src/components/ReaderContainer.tsx`
  - `src/components/BacktrackPrompt.tsx`
  - `preload.js`
  - `src/reader/modes/`
- **Shared-core touches:** `src/types.ts` (the `BlurbyDoc.furthestPosition` comment and the new `furthestCfi`). Serialized after LIBRARY-WRITE-RACE-3; no other sprint edits `src/types.ts`, `ReaderContainer.tsx` or `FlowScrollEngine.ts` while this item runs.
- **Merge order:** after the RC window, then LIBRARY-WRITE-RACE-3, then this item. It is independent of PAGE-PAGES-READ-1 and POSITION-PROMPT-COPY-1, which share no files with it. Any later `src/types.ts` item, for example NARRATE-BAND-SPACE-1, waits for this merge.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red tests (fp1–fp7, fm1–fm4, f1–f5) committed alone; base failures and controls recorded | calculable | positive-control | bounded | medium | 35m | — | — |
| 2 | Main raise and reset, merge by the higher mark, renderer copy, type | calculable | feature | bounded | medium | 35m | — | — |
| 3 | Targeted runs, suite, typecheck, build | calculable | verify | bounded | low | 30m | — | — |
| 4 | Packaged three-session check (Move keeps the mark, Keep reopens), base control, rule 53, memo, time log, push | calculable | live-verification | bounded | medium | 60m | — | — |

**Total:** chain 2h40m · sum 2h40m; 0 of 4 estimated tasks calibrated (priced by planner estimate)

##### Lessons applied

- **LL-159:** the live check's quit relies on QUIT-FLUSH-1 draining the debounced library save. Failure handling separates a flush fault from a fix fault.
- **LL-158 / standing rule 54:** the live row names its committing triggers (each turn's and each prompt answer's `update-doc-progress`, then the quit). It reads `library.json` after a settle and has a base control.
- **LL-174:** the raise sits at the one IPC that every mode's save already crosses, and (f5) drives the outer `useLibrary` entry. No callback is widened, so no hop can drop the value.
- **LL-106:** no preload channel or `ElectronAPI` member changes. Only `BlurbyDoc` gains a field.
- **LL-030:** only engagement-gated saves reach `update-doc-progress`, so an open's automatic relocate cannot raise the mark.
- **LL-108:** zero stays a valid mark (`max(0, …)`), and a cfi-only save is not a word anchor.
- **LL-165 and standing rule 53 (LL-167):** scratch-profile proof and package verification.
- **LL-151 / LL-166 / standing rule 55:** the base control must show no mark and no prompt.
- **Standing rule 43 (LL-138):** red first. (fp5), (fp7) and (fm4) are controls.
- **Standing rule 48 (LL-149):** typecheck and build.
- **Standing rule 41 (LL-136):** the fence exempts the time log.
- **Standing rule 52 (LL-146):** harnesses and case tables are copied.
- **Standing rule 44 (LL-143):** named shell, exact exit codes.
- **Standing rule 50 (LL-156):** no existing test is edited, and out-of-scope items are named against their own files.
- **Standing rule 36:** re-grep at the cut.
- **LL-181:** worktree placement and the push refspec.
- **Considered, not applicable:**
  - LL-157 (no new quit listener);
  - LL-081 and LL-071 (word indices are already book-wide at save);
  - LL-170 (no regrouping);
  - LL-169 (no async lifetime);
  - Narrate, registry and evidence-encoding lessons (LL-142, 154, 155, 160–163, 171–173, 175–180).
