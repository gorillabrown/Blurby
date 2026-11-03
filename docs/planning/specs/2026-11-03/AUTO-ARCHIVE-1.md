#### AUTO-ARCHIVE-1 — Leaving a finished book asks "Finished *Title*?" instead of archiving it silently *(Seq 113.5 recommended, register Seq 111 today; Full Spec 2026-11-03, cited against RC tip `70d64237`; owner amendment "confirmation-first" 2026-10-26, owner answers #17–#21 2026-11-03, Blurby.Brain1 rulings A/T1–T5 2026-11-03; Library & Content, with a Reader Engine dependency; two waves; not a release gate)*

- **What:**
  - **Wave A (reader side).** Leaving the reader at the end of a book shows a dialog, "Finished *Title*?", with **Keep in Library** (focused) and **Archive**.
    - **Keep in Library** counts the finish: the book's position moves to its last word (the "done" badge), history's completed count +1, the books goal +1. The book stays where it was.
    - **Archive** counts the finish the same way and also archives the book.
    - **Escape** dismisses: the reader leaves, the ordinary exit save stands, and nothing else is recorded.
    - "At the end" means the last word saved, or, in Page, the last page on screen (foliate's `atEnd`), which Page never reached before.
    - The dialog shows every time a reader leaves an engaged session at the end, unless the book is already archived.
    - The silent archive is gone everywhere: the exit, Flow's cross-book auto-continue (which now counts as a dismissal) and the legacy standalone reader window (also a dismissal).
    - The empty Archive tab's hint reads "No archived documents. Books you archive appear here."
  - **Wave B (library side).**
    - An archive chosen at the dialog shows `Archived "Title"` with **Undo** for 5 s. Undo restores the archive state only. The finish stays counted, because the reader said they had finished.
    - **Mark complete** on the list card (an icon button) and in the grid card's right-click menu. It moves the position to the last word, counts the finish in history, archives the book, and shows `Archived "Title"` with **Undo** for 5 s. Undo restores the previous position and cfi, unarchives, and takes the finish back out of history (new `unmark-doc-completed` IPC).
    - The list card shows **Archive** for a complete, unarchived book (#20), as the grid card already does.
- **Out of scope:**
  - The furthest-page mark (FURTHEST-PERSIST-1, Seq 114).
  - The pages-read goal (PAGE-PAGES-READ-1, Seq 113).
  - The legacy reader window's own word source. It tokenizes `activeDoc.content`, which is empty for an EPUB, so that window never reaches an EPUB's end (`src/App.tsx:71`). Recorded for Blurby.Brain1 (ruling A/T2), not fixed here.
  - The keyboard E/Z archive and its toast (`LibraryContainer.tsx:334-341`). It is unchanged, including its existing race, where `archiveDoc`'s own "Document archived" toast can replace the "Press Z to undo" toast once the IPC resolves. That is recorded, not fixed.
  - The books goal for **Mark complete**. The 2026-10-25 design counts Mark complete in history only (ROADMAP historical AUTO-ARCHIVE-1 design, "counts as a completed book in history"), and the goal hook lives in the reader (`ReaderContainer.tsx:144`). Unchanged here.
  - The list card's and grid card's other controls, the Delete flow (LIBRARY-DELETE-SAFE-1), the duplicate badge (LIBRARY-CONTENT-DEDUP-1).
- **Why (investigation at `70d64237`):**
  1. **Today's silent archive.** `_persistAndLog` archives with no question when the saved word is the last one: `if (savePos >= resolvedTotalWords - 1 && resolvedTotalWords > 0) { api.markDocCompleted(); onBookCompleted?.(); onArchiveDoc(activeDoc.id); }` (`src/hooks/useProgressTracker.ts:278-282`). Two callers reach it: `finishReading` (`:295-299`, the exit) and `finishReadingWithoutExit` (`:301-304`, Flow's cross-book auto-continue, `src/components/ReaderContainer.tsx:406`). The 2026-10-26 amendment supersedes it.
  2. **Every exit finishes from Page.** `handleExitReader` (`ReaderContainer.tsx:614-630`) returns Focus, Flow and Narrate to Page (`handleExitToPage`); from Page it runs `checkBacktrack` and then `finishReading(canonicalWordAnchor)`. During a cross-book transition it calls `finishReading(exitAnchor)` directly (`:617-622`).
  3. **Page never meets the end test.** Page's saved word is the first word of the page on screen (`src/reader/modes/page/ModeRuntime.ts:578-591`). foliate exposes `atEnd`, no next linear section and the last page of this one (`node_modules/foliate-js/paginator.js:1088-1090`, read in the main clone because `rc-read` has no `node_modules`). Page's relocate listener reports only `{ cfi, fraction }` (`src/reader/modes/page/FoliateView.tsx:818-822`). `PageModeRuntime.onRelocate` forwards that to `ports.shell.reportRelocate` (`ModeRuntime.ts:439-443`), whose type has no `atEnd` (`src/reader/ports/ReaderPorts.ts:54`). The shell keeps only the fraction (`ReaderContainer.tsx:367-371`).
  4. **Completion side effects.** `mark-doc-completed` only increments `history.docsCompleted` (`main/ipc/documents.js:137-141`). No decrement exists. `onBookCompleted` is `readingGoals.recordCompletedBook` (`ReaderContainer.tsx:464`; `src/hooks/useReadingGoals.ts:64-66`).
  5. **Archive feedback.** `onArchiveDoc` is `useLibrary.archiveDoc` (`src/components/LibraryContainer.tsx:577`). It toasts "Document archived" with no Undo (`src/hooks/useLibrary.ts:181-192`). The toast takes an action (`showToast(message, duration, action)`, `useLibrary.ts:33`; `ToastAction`, `src/types.ts:222-225`), and `UNDO_DISMISS_MS = 5000` exists (`src/constants.ts:154`).
  6. **A kept finished book has no list-card Archive.** The list card hides Archive for a complete, unarchived book (`src/components/DocCard.tsx:86`, `:232-244`, `!isComplete && …`) and shows "done" (`:151`). The grid card's Archive has no completion gate (`src/components/DocGridCard.tsx:185-186`).
  7. **No Mark complete exists.** "Marked as read" toggles `unread` only (`LibraryContainer.tsx:370-377`).
  8. **The legacy reader window is reachable** (Blurby.Brain1 ruling A/T2). The list card's "Open in new window" (`DocCard.tsx:207-210`) calls `handleOpenNewWindow` → `openReaderWindow` (`src/components/LibraryView.tsx:402`; `preload.js:114`; `main/ipc/documents.js:133`). Its `finishReading` archives silently (`src/App.tsx:82-86`).
  9. **The empty Archive hint** says "No archived documents — completed readings auto-archive here" (`LibraryView.tsx:691`), which becomes false.
  10. **Visibility is already right.** LIBRARY-COMPLETION-VISIBILITY-1 (RC window) keeps a complete, unarchived book in the active list. Nothing here changes the lists.
- **Design:**
  - **Settled by the owner (2026-11-03 batch #17–#21):** the dialog text, buttons, focus, Escape and the empty-Archive hint (#17); Keep and Archive both count the finish, and Dismiss records nothing extra (#18); asked at every exit at the end unless archived (#19); Archive shown on a kept finished book's list card (#20); Undo `Archived "Title"` for 5 s after the dialog's Archive (#21). From 2026-10-25: Mark complete on both cards with a 5 s Undo, and "the end" means Page's last page or the last word.
  - **Settled by Blurby.Brain1 (2026-11-03):**
    - **T1:** Flow's cross-book auto-continue is a dismissal: no archive, no finish counted, no dialog later.
    - **T2:** the legacy window's silent block is removed and treated as a dismissal. Its EPUB word gap is recorded, not fixed.
    - **T3:** a new `unmark-doc-completed` IPC (`docsCompleted = max(0, n − 1)`, `saveHistory`), exposed as preload `unmarkDocCompleted`. Only the Undo of that same Mark complete calls it. A test shows finish + Undo leaves the count unchanged and never below 0.
    - **T4:** the cut follows the RC merge and PAGE-PAGES-READ-1, in its own shared-core window, as two waves: A reader side, B library side. No wait on FURTHEST-PERSIST-1.
    - **T5:** the shell keeps the relocate's `atEnd` in a ref with no re-query at exit. A test shows that a later relocate with `atEnd` false clears it.
  - **Engineering choices:**
    - **The end rule** at `finishReading`: `savePos >= resolvedTotalWords - 1 && resolvedTotalWords > 0`, **or** the last relocate in *this* book reported `atEnd` (`bookEndRef.current?.docId === activeDoc.id && bookEndRef.current.atEnd`). The dialog shows only when the rule holds, `!activeDoc.archived` and `hasEngagedRef.current` (LL-030: an engaged session. Opening a finished book and closing it at once is not "leaving it at the end").
    - **Save first, then ask.** `finishReading` always runs `_persistAndLog` (the exit save and session log) before deciding. The dialog therefore never holds an unsaved position, and a quit with the dialog open loses nothing (LL-159).
    - **`_persistAndLog` returns `savePos`** and loses its completion block (`:278-282`), so neither caller archives or counts anything by itself.
    - **Confirming the finish** (Keep and Archive): `api.updateDocProgress(id, resolvedTotalWords - 1)` and `onUpdateProgress(id, resolvedTotalWords - 1)` with **no cfi**, so main keeps the last page's cfi (`documents.js:22-24`); then `api.markDocCompleted()` and `onBookCompleted?.()`. Archive then calls `onArchiveDoc(id)`. Both then exit through `onExitReader(savePos)`. The card's `isComplete` (`DocCard.tsx:86`) needs `position >= wordCount - 1`. `resolvedTotalWords - 1 >= wordCount - 1` always holds (`useProgressTracker.ts:115`).
    - **The cross-book exit path** (`ReaderContainer.tsx:617-622`) calls `finishReading(exitAnchor, undefined, { finishPrompt: false })`. That path is part of the auto-continue, so per T1 it never asks.
    - **Backtrack first.** At exit, `checkBacktrack` runs first, as today. If Keep at furthest lands on the last word, the finish dialog follows the backtrack prompt. Two dialogs in a row are accepted, because each answers a different question.
    - **The `atEnd` hops (LL-174):** paginator getter → Page `FoliateView` relocate listener (`view.renderer?.atEnd === true`) → `onRelocate` detail → `PageModeRuntime.onRelocate` → `ports.shell.reportRelocate({ cfi, fraction, atEnd })` → shell `noteRelocateEnd(docId, atEnd)` → the tracker's `bookEndRef`. Focus, Flow and Narrate do not send `atEnd`; the shell stores `atEnd === true`, so their relocates clear it (`false`). A missing `atEnd` therefore never leaves a stale `true`.
    - **The dialog component** `FinishPrompt.tsx` follows `BacktrackPrompt.tsx`'s pattern (a window capture keydown listener, `role="dialog"`, `autoFocus` on the primary button), with three differences. It is `aria-modal="true"` with `aria-labelledby` on the title. Escape calls `onDismiss`. Enter activates the focused button of the two (Keep when focus is elsewhere). The listener stops propagation of every key except Tab and Shift+Tab, so reader shortcuts (Space, arrows, Escape at `useKeyboardShortcuts.ts:242`) never act behind it, while Tab still moves focus.
    - **Undo is library state.** Wave B adds `archiveWithUndo(doc)` and `markCompleteWithUndo(doc)` as pure helpers in a new `src/utils/completionActions.ts`, wired by `LibraryContainer.tsx`. The reader's `onArchiveDoc` becomes `archiveWithUndo`, so the dialog's Archive shows the Undo toast after the exit. `useLibrary.archiveDoc` gains `options?: { silent?: boolean }` and returns `Promise<boolean>` (true on success). The helpers pass `silent: true`, so "Document archived" does not replace the Undo toast.
- **Prerequisites:**
  - The RC integration window merged to `origin/main`; cut from that merge and re-grep every site (standing rule 36).
  - **PAGE-PAGES-READ-1 (Seq 113) merged** (Blurby.Brain1 T4). It edits `useProgressTracker.ts:150-164` and `ReaderContainer.tsx:323-327`: different hunks, the same files.
  - **LIBRARY-DELETE-SAFE-1 (Seq 109 recommended) merged before Wave B.** It edits `DocCard.tsx:251-254` and `DocGridCard.tsx:135/:138`, which Wave B's card edits sit beside.
  - **A shared-core window** for `src/components/ReaderContainer.tsx` (Wave A) and `src/types.ts` (Wave B), held for the whole item. No other sprint edits either file meanwhile. FURTHEST-PERSIST-1 (`src/types.ts`), READER-PAGE-COUNTER-1 and EINK-VIEW-REFRESH-1 (`ReaderContainer.tsx`) run before or after it, never during.
  - **FURTHEST-PERSIST-1** is not a prerequisite (T4). It touches `documents.js`, `useLibrary.ts` and `src/types.ts` in other hunks; whichever lands second re-greps.
- **Done when** (PowerShell 7, `pwsh`, worktree root on RodneySr; each command passes only on exit 0 unless stated):
  1. **Red first, Wave A (standing rule 43).** Commit `tests/finishPrompt.test.tsx` and `tests/readerModes/pageAtEnd.test.tsx` alone. On the base, `npx vitest run tests/finishPrompt.test.tsx tests/readerModes/pageAtEnd.test.tsx` exits 1, as follows. (fp1)–(fp8), (fp10) and (fp11) fail; the base archives at once, has no `bookEndRef`, no `FinishPrompt` module and no options argument. (ae1) and (ae2) fail; there is no `atEnd` in the detail. The controls (fp9) and (ae3) pass. Record the output.
  2. **Wave A change** at Wave A's edit sites, and nowhere else.
  3. `npx vitest run tests/finishPrompt.test.tsx tests/readerModes/pageAtEnd.test.tsx tests/useProgressTracker.test.ts tests/keepFurthest.test.tsx tests/readerModes/pagePositionSave.test.tsx tests/libraryCompletionVisibility.test.tsx tests/features.test.js` exits 0, with no existing test edited (standing rule 50).
  4. **Red first, Wave B.** Commit `tests/completionActions.test.ts`, `tests/unmarkDocCompleted.test.js` and `tests/markCompleteCards.test.tsx` alone on the Wave A tip. They exit 1, as follows. (ca1)–(ca6) fail; there is no helper module. (um1)–(um3) fail; there is no handler. (mc1)–(mc4) fail; there is no control and the list card has no Archive for a complete book. (um4) and (mc5) pass as controls.
  5. **Wave B change** at Wave B's edit sites, and nowhere else.
  6. Every test file named in 3 and 4 passes in one `npx vitest run …` with no existing test edited.
  7. `npm test`, `npm run typecheck` and `npm run build` exit 0 at the end of each wave (standing rule 48).
  8. `rg -n "markDocCompleted|archiveDoc\(" src/App.tsx src/hooks/useProgressTracker.ts` prints only the confirmed-finish call in `useProgressTracker.ts` (`api.markDocCompleted()` inside `confirmFinish`) and no `archiveDoc(`. `rg -n "auto-archive" src` prints nothing.
  9. **Live, packaged (standing rule 53; scratch profile proved before the first input, LL-165), run at the end of Wave B.** The probe is saved as `docs/governance/close-outs/Probe.AUTO-ARCHIVE-1.mjs.txt` (standing rule 52). Every row reads `library.json` and `history.json` in the scratch profile's `blurby-data` folder after the committing step (standing rule 54: the exit, the dialog answer or the Undo is the committing trigger). Only the owned fixtures `docs/planning/roadmap-reviews/reader-mode-separation-2/live/fixtures/g0-converted-chapters.epub` and `g0-converted-text.epub` are used, copied into the scratch profile's own source folder, never the owner's books. All presses are real CDP key or mouse events.
     - **(p1) Page end, Escape.** Open `g0-converted-chapters.epub` in Page. Press ArrowRight until the bar's progress reads 100% or 400 presses, then Escape. A `[role="dialog"]` whose title reads `Finished <title>?` is present, and `document.activeElement` is its "Keep in Library" button. Press Escape. The library shows; `library.json`'s doc has `archived` falsy and `position < wordCount - 1`; `history.json`'s `docsCompleted` is unchanged.
     - **(p2) Asked again; Keep.** Reopen the same book. Press ArrowLeft then ArrowRight (an engaged session at the end), then Escape. The dialog shows again (#19). Press Enter. `position >= wordCount - 1`, `archived` falsy, `docsCompleted` +1. In list view, the card shows "done" and an Archive button (`aria-label="Archive document"`).
     - **(p3) Archive and Undo.** Reopen, press ArrowLeft and ArrowRight, then Escape, Tab, Enter (Archive). `archived` is true and `docsCompleted` is +1 again. The toast reads `Archived "<title>"` with an Undo button. Click Undo within 5 s: `archived` is false and `docsCompleted` is unchanged by the Undo.
     - **(p4) Mark complete and Undo.** In list view, press Mark complete on `g0-converted-text.epub`'s card (opened once and left mid-book first, so it has a position and a cfi). `position = wordCount - 1`, `archived` true, `docsCompleted` +1. Click Undo: `position` and `cfi` equal the values recorded before the press, `archived` is false, and `docsCompleted` equals its value before the press.
     - **Detector control (standing rule 55):** before (p1)'s Escape, the probe reads `library.json` once and checks the doc entry exists, so a missing write is a real absence. On the base package, (p1) shows no `Finished` dialog after the exit. The probe proves its dialog query by finding the backtrack prompt (`[role="dialog"][aria-label="Save position"]`) in a scripted backtrack: open, read 3 pages ahead, go back 3, exit.
  10. Package verification (below) and Blurby.Brain1's confirmation recorded in the close-out.
  11. **Fence (standing rule 41):** `git diff --name-status <base>` lists exactly these paths, plus the memo and `Timing.AUTO-ARCHIVE-1.jsonl`:
      - Wave A: `M src/hooks/useProgressTracker.ts`, `A src/components/FinishPrompt.tsx`, `M src/styles/page-reader.css`, `M src/components/ReaderContainer.tsx`, `M src/reader/ports/ReaderPorts.ts`, `M src/reader/modes/page/FoliateView.tsx`, `M src/reader/modes/page/ModeRuntime.ts`, `M src/App.tsx`, `M src/components/LibraryView.tsx`, `A tests/finishPrompt.test.tsx`, `A tests/readerModes/pageAtEnd.test.tsx`
      - Wave B: `M main/ipc/documents.js`, `M preload.js`, `M src/types.ts`, `M src/test-harness/electron-api-stub.ts`, `M src/hooks/useLibrary.ts`, `A src/utils/completionActions.ts`, `M src/components/LibraryContainer.tsx`, `M src/components/DocCard.tsx`, `M src/components/DocGridCard.tsx`, `M src/components/IconBtn.tsx`, (`M src/components/LibraryView.tsx` again), `A tests/completionActions.test.ts`, `A tests/unmarkDocCompleted.test.js`, `A tests/markCompleteCards.test.tsx`
      - and `A docs/governance/close-outs/Probe.AUTO-ARCHIVE-1.mjs.txt`.
- **Effort:** M (two waves: A ≈ S–M, B ≈ S–M).
- **Owners:** Blurby.Roadmap (spec, shared-core window, merge go); Blurby.Brain1 (package confirmation); RodneySr implementation session (bounded in each wave; Wave A crosses the reader port, so its implementer is the cross-cutting tier); spec-compliance then quality reviewer after each wave.
- **Source:** the 2026-10-26 owner amendment (`docs/planning/roadmap-reviews/2026-10-26-plan.md:35`; ROADMAP `#auto-archive-1-spec`); the 2026-10-25 owner answers (`docs/planning/roadmap-reviews/2026-10-25-phase-brief.md:22`); owner answers #17–#21 (`docs/planning/roadmap-reviews/2026-11-03-owner-design-batch.md`); Blurby.Brain1 ruling A (T1–T5, 2026-11-03); code at `70d64237`.
- **Path:** dispatch (two waves on one branch; one merge after Wave B).

##### Implementation detail

- **Edit sites, Wave A (line numbers on `70d64237`; re-grep at the cut, after PAGE-PAGES-READ-1):**
  1. **`src/hooks/useProgressTracker.ts`:**
     - `UseProgressTrackerReturn` (`:36-70`): add `finishPrompt: { title: string } | null`, `handleFinishKeep: () => void`, `handleFinishArchive: () => void`, `handleFinishDismiss: () => void`, `bookEndRef: React.MutableRefObject<{ docId: string; atEnd: boolean } | null>`, `noteRelocateEnd: (docId: string, atEnd: boolean) => void`. Change `finishReading`'s type (`:56`) to `(finalPos: number, cfi?: string, options?: { finishPrompt?: boolean }) => void`, and correct the two doc comments at `:55` and `:57` ("archives if complete" → "never archives").
     - `_persistAndLog` (`:243-292`): delete the completion block `:278-282` and `onArchiveDoc`/`onBookCompleted` from its dependency list; `return savePos;`.
     - `finishReading` (`:295-299`) becomes: run `const savePos = _persistAndLog(finalPos, cfi)`; compute the end rule (Design); if `options?.finishPrompt !== false && atEnd && !activeDoc.archived && hasEngagedRef.current`, store the exit position in a new `pendingExitPosRef` (`pendingExitPosRef.current = finalPos`) and call `setFinishPrompt({ title: activeDoc.title || "Untitled" })`, and return without exiting; otherwise `onExitReader(finalPos)`.
     - Add `const confirmFinish = () => { const last = resolvedTotalWords - 1; onUpdateProgress(activeDoc.id, last); api.updateDocProgress(activeDoc.id, last); lastSavedPosRef.current = last; api.markDocCompleted(); onBookCompleted?.(); }`. Add `handleFinishKeep` (confirm, clear the dialog, exit with the stored exit position), `handleFinishArchive` (confirm, `onArchiveDoc(activeDoc.id)`, clear, exit) and `handleFinishDismiss` (clear, exit). Each handler runs at most once per dialog: a ref guard covers a double press.
     - `bookEndRef` (a `useRef<{ docId: string; atEnd: boolean } | null>(null)`) and `noteRelocateEnd = useCallback((docId, atEnd) => { bookEndRef.current = { docId, atEnd: atEnd === true }; }, [])`.
     - `finishReadingWithoutExit` (`:301-304`) is unchanged in shape; it now records no finish (T1).
     - Return the new members (`:339-358`).
  2. **`src/components/FinishPrompt.tsx`** (new). Props `{ title: string; onKeep: () => void; onArchive: () => void; onDismiss: () => void }`. The markup is `<div className="finish-prompt" role="dialog" aria-modal="true" aria-labelledby="finish-prompt-title">`, then `<p id="finish-prompt-title" className="finish-prompt-title">Finished <em>{title}</em>?</p>`, then the Keep button (`backtrack-prompt-btn backtrack-prompt-btn--primary`, `autoFocus`, text "Keep in Library") and the Archive button (`backtrack-prompt-btn backtrack-prompt-btn--secondary`, text "Archive"). The keydown listener is a window capture listener as in `BacktrackPrompt.tsx:16-30`. For Escape it calls `preventDefault`, `stopPropagation` and `onDismiss()`. For Enter it calls `preventDefault` and `stopPropagation`, then clicks the focused button if it is one of the two, otherwise calls `onKeep()`. For Tab and Shift+Tab it returns without acting. Any other key gets `stopPropagation` only.
  3. **`src/styles/page-reader.css`**, after the `.backtrack-prompt` block (`:495-…`): `.finish-prompt` reuses `.backtrack-prompt`'s placement and surface tokens, with `flex-wrap: wrap` and `.finish-prompt-title { flex-basis: 100%; margin: 0 0 4px; color: var(--text); }`. Existing tokens only; no inline style.
  4. **`src/reader/ports/ReaderPorts.ts:54`:** `reportRelocate(value: { readonly cfi: string; readonly fraction: number; readonly atEnd?: boolean }): void;` (comment: "atEnd: Page only, foliate's last page of the book (AUTO-ARCHIVE-1)").
  5. **`src/reader/modes/page/FoliateView.tsx`:** the prop type (`:241`) gains `atEnd?: boolean` in the detail. The relocate listener (`:818-822`) sends `onRelocateRef.current?.({ cfi, fraction, atEnd: view.renderer?.atEnd === true })`.
  6. **`src/reader/modes/page/ModeRuntime.ts`:** `onRelocate`'s detail type (`:439`) gains `readonly atEnd?: boolean`. `:443` sends `this.ports.shell.reportRelocate({ cfi: detail.cfi, fraction, atEnd: detail.atEnd === true })`. Focus, Flow and Narrate runtimes are not edited.
  7. **`src/components/ReaderContainer.tsx`** (shared core):
     - `shellRef`'s initial object (`:251-272`): add `noteRelocateEnd: (_docId: string, _atEnd: boolean) => {}`. The live binding (`:474-494`) adds `noteRelocateEnd: progress.noteRelocateEnd`.
     - `reportRelocate` (`:367-371`) becomes `({ fraction, atEnd }) => { const live = shellRef.current; live.handleEinkPageTurn(); live.noteRelocateEnd(live.activeDoc.id, atEnd === true); foliateFractionRef.current = fraction; setFoliateFraction(fraction); }`.
     - `:467`: destructure `finishPrompt, handleFinishKeep, handleFinishArchive, handleFinishDismiss` too.
     - The cross-book exit (`:620`): `finishReading(exitAnchor, undefined, { finishPrompt: false });`.
     - `ReturnToReadingPill`'s `activeOverlay` (`:829`): `menuFlapOpen || showBacktrackPrompt || finishPrompt !== null`.
     - After the `BacktrackPrompt` mount (`:833-840`): `{finishPrompt && <FinishPrompt title={finishPrompt.title} onKeep={handleFinishKeep} onArchive={handleFinishArchive} onDismiss={handleFinishDismiss} />}`, and the import beside `:29`.
  8. **`src/App.tsx`:** delete `:82-86` (`const docWords = words;` through the closing brace of the completion `if`). Drop `words` from `finishReading`'s dependency list (`:88`) if nothing else in the callback uses it. Comment: "AUTO-ARCHIVE-1 (Brain1 T2): leaving this window never counts or archives a finish."
  9. **`src/components/LibraryView.tsx:691`:** the hint text becomes `No archived documents. Books you archive appear here.`
- **Edit sites, Wave B:**
  1. **`main/ipc/documents.js`**, after `mark-doc-completed` (`:137-141`): `ipcMain.handle("unmark-doc-completed", () => { const history = ctx.getHistory(); history.docsCompleted = Math.max(0, (history.docsCompleted || 0) - 1); ctx.saveHistory(); });`.
  2. **`preload.js`**, after `:80`: `unmarkDocCompleted: () => ipcRenderer.invoke("unmark-doc-completed"),`.
  3. **`src/types.ts`** (shared core), after `:307`: `unmarkDocCompleted: () => Promise<void>;`. This is the only `src/types.ts` line.
  4. **`src/test-harness/electron-api-stub.ts`**, after `:463-466`: `unmarkDocCompleted: async () => { readingStats.docsCompleted = Math.max(0, readingStats.docsCompleted - 1); return traceMut("unmarkDocCompleted", [], undefined); },`.
  5. **`src/hooks/useLibrary.ts`** `archiveDoc` (`:181-192`): the signature becomes `async (docId: string, options?: { silent?: boolean }): Promise<boolean>`. The success path skips `showToast("Document archived")` when `options?.silent`, then returns `true`. The catch path keeps its toast and recovery and returns `false`.
  6. **`src/utils/completionActions.ts`** (new, no React):
     - `archiveWithUndo(doc, deps)`: `if (!(await deps.archiveDoc(doc.id, { silent: true }))) return;` then `deps.showToast(\`Archived "${doc.title}"\`, UNDO_DISMISS_MS, { label: "Undo", onClick: () => { void deps.unarchiveDoc(doc.id); } })`.
     - `markCompleteWithUndo(doc, deps)`: records `prev = { position: doc.position ?? 0, cfi: doc.cfi }` and `last = Math.max(0, (doc.wordCount || 0) - 1)`. It calls `await deps.api.updateDocProgress(doc.id, last)`, `deps.updateProgress(doc.id, last)` and `await deps.api.markDocCompleted()`, then archives silently and stops if that fails. It toasts `Archived "${doc.title}"` with Undo for `UNDO_DISMISS_MS`. Undo runs `deps.api.updateDocProgress(doc.id, prev.position, prev.cfi)`, `deps.updateProgress(doc.id, prev.position, prev.cfi)`, `deps.unarchiveDoc(doc.id)` and `deps.api.unmarkDocCompleted()`, and a guard makes a second Undo click do nothing.
     - `deps` is `{ api: Pick<ElectronAPI, "updateDocProgress" | "markDocCompleted" | "unmarkDocCompleted">; archiveDoc; unarchiveDoc; updateProgress; showToast }`.
     - A Mark complete on a book with `wordCount` 0 does nothing.
  7. **`src/components/LibraryContainer.tsx`:**
     - Build `archiveWithUndoById = useCallback((id) => { const doc = library.find((d) => d.id === id); if (doc) void archiveWithUndo(doc, deps); }, […])` and `markCompleteById` the same way.
     - `:577`: `onArchiveDoc={archiveWithUndoById}`, so the dialog's Archive gets the Undo toast (#21).
     - `LibraryView` mount (`:690-705`): add `onMarkComplete={markCompleteById}`. The card's own Archive stays on `archiveDoc` (`:705`), unchanged.
  8. **`src/components/LibraryView.tsx`:** add `onMarkComplete?: (id: string) => void` to the props (`:24-60`), destructure it, and pass it to every `DocCard` (`:755-766`, `:796-807`) and `DocGridCard` (`:703`, `:735`) mount.
  9. **`src/components/DocCard.tsx`:**
     - Props (`:55-79`): `onMarkComplete?: (id: string) => void`.
     - In the action row before the archive ternary (`:221`): `{onMarkComplete && !isComplete && !doc.archived && <IconBtn onClick={() => onMarkComplete(doc.id)} title="Mark complete" icon="check" />}`.
     - `:233`: remove the `!isComplete &&` gate and its wrapping parentheses, so the Archive button shows for every unarchived book (#20).
  10. **`src/components/DocGridCard.tsx`:** props (`:10-25`) get `onMarkComplete?: (id: string) => void`, destructured at `:46`. In the context menu, after the Move block (`:110-117`): `{onMarkComplete && !isComplete && !doc.archived && <button onClick={() => { onMarkComplete(doc.id); setContextMenu(null); }}>Mark complete</button>}`.
  11. **`src/components/IconBtn.tsx`** `paths` (`:3-7`): add `check: <polyline points="20 6 9 17 4 12" />`.
- **Tests:**
  - **`tests/finishPrompt.test.tsx`** (jsdom). The tracker harness is copied from `tests/useProgressTracker.test.ts:338-352` (`renderTracker`; standing rule 52), with `onExitReader`, `onArchiveDoc` and `onBookCompleted` as spies, and `markDocCompleted` and `unmarkDocCompleted` in the mock API. The book is 1,000 words at position 500, engaged through `markEngaged()`.
    - **(fp1)** `finishReading(999)` → `finishPrompt` is `{ title }`; `onExitReader`, `onArchiveDoc` and `markDocCompleted` are not called. *Base: archives and exits.*
    - **(fp2)** Keep → `updateDocProgress` last called with `("book", 999)` and no cfi; `markDocCompleted` ×1; `onBookCompleted` ×1; `onArchiveDoc` ×0; `onExitReader` ×1; `finishPrompt` null.
    - **(fp3)** Archive → as (fp2) plus `onArchiveDoc("book")` ×1.
    - **(fp4)** Dismiss → `markDocCompleted` ×0, `onBookCompleted` ×0, `onArchiveDoc` ×0, `onExitReader` ×1, and the only `updateDocProgress` call is the exit save.
    - **(fp5)** Page end: `noteRelocateEnd("book", true)` then `finishReading(800)` → dialog shown. Then (T5) `noteRelocateEnd("book", true)` and `noteRelocateEnd("book", false)` then `finishReading(800)` → no dialog, exit ×1. And `noteRelocateEnd("other", true)` then `finishReading(800)` → no dialog. *Base: no `noteRelocateEnd`.*
    - **(fp6)** An archived book: `finishReading(999)` → no dialog, exit ×1, `markDocCompleted` ×0.
    - **(fp7)** Not engaged: `finishReading(999)` → no dialog, exit ×1, nothing counted.
    - **(fp8)** Cross-book (T1): `finishReadingWithoutExit(999)` → `markDocCompleted` ×0, `onArchiveDoc` ×0, `finishPrompt` null. *Base: archives.*
    - **(fp9) control:** `finishReading(500)` → exit ×1, no dialog, `updateDocProgress("book", 500, undefined)`.
    - **(fp10)** `finishReading(999, undefined, { finishPrompt: false })` → no dialog, exit ×1. *Base: archives.*
    - **(fp11)** `FinishPrompt`, rendered alone with a bubble-phase window keydown spy registered first, covers these cases. The title reads "Finished Book?". The focused element is "Keep in Library". Escape → `onDismiss` ×1, and the spy sees no Escape. With focus on Archive, Enter → `onArchive` ×1. Tab is not prevented (`defaultPrevented` false). A press on Keep and then a second press calls `onKeep` ×1 through the tracker's guard (fp2 harness). *Base: no module.*
  - **`tests/readerModes/pageAtEnd.test.tsx`** (jsdom). The harness is copied from `tests/readerModes/pagePositionSave.test.tsx:21-181` (`FakePaginator`, `FakeFoliateView`, `makeRuntime`, `mount`, `relocate`), and the copy's `FakePaginator` gains `atEnd = false`.
    - **(ae1)** `renderer.atEnd = true`; a relocate with `{ cfi, fraction: 1 }` → the last `shell.reportRelocate` effect carries `atEnd: true`. *Base: absent.*
    - **(ae2)** Then `renderer.atEnd = false` and another relocate → `atEnd: false`. *Base: absent.*
    - **(ae3) control:** the relocate's `cfi` and `fraction` reach `shell.reportRelocate` unchanged.
  - **`tests/completionActions.test.ts`** (node). `deps` are spies, with `archiveDoc` resolving `true` unless stated.
    - **(ca1)** `archiveWithUndo` → `archiveDoc(id, { silent: true })`; the toast is `Archived "T"` for 5000 ms with label "Undo".
    - **(ca2)** Running that toast's `onClick` → `unarchiveDoc(id)`, and `unmarkDocCompleted` ×0.
    - **(ca3)** `markCompleteWithUndo` on `{ wordCount: 100, position: 40, cfi: "c40" }` → `updateDocProgress(id, 99)`, `markDocCompleted` ×1, `archiveDoc(id, { silent: true })`, and the toast.
    - **(ca4)** Its Undo → `updateDocProgress(id, 40, "c40")`, `updateProgress(id, 40, "c40")`, `unarchiveDoc(id)` and `unmarkDocCompleted` ×1. A second click adds nothing.
    - **(ca5)** `archiveDoc` resolving `false` → no Undo toast.
    - **(ca6)** `wordCount` 0 → no calls.
  - **`tests/unmarkDocCompleted.test.js`** (node). The harness is copied from `tests/updateDocProgressLastRead.test.js:17-50`, with a real history object.
    - **(um1)** From 3: `mark-doc-completed` then `unmark-doc-completed` → 3, `saveHistory` ×2 (T3: finish + Undo leaves the count unchanged).
    - **(um2)** From 0: `unmark-doc-completed` → 0 (never below 0).
    - **(um3)** With `docsCompleted` missing: → 0.
    - **(um4) control:** `mark-doc-completed` from 3 → 4.
  - **`tests/markCompleteCards.test.tsx`** (jsdom). The harness is copied from `tests/libraryCompletionVisibility.test.tsx:20-60` (the real `LibraryView`), with `onMarkComplete: vi.fn()`.
    - **(mc1)** List view, an unfinished book → a "Mark complete" button; a click calls `onMarkComplete(id)`.
    - **(mc2)** Grid view, a right-click → a "Mark complete" menu item; a click calls `onMarkComplete(id)`.
    - **(mc3)** List view, a complete, unarchived book → an `aria-label="Archive document"` button and no "Mark complete". *Base: no Archive.*
    - **(mc4)** The Archive tab, empty → the hint reads "No archived documents. Books you archive appear here." (On the Wave A tip this passes; on the base it fails.)
    - **(mc5) control:** an archived book in the Archive tab shows "Restore from archive" and no "Mark complete".
- **Constants:** none new. `UNDO_DISMISS_MS` (`src/constants.ts:154`) is reused.
- **Branch:** `eb/auto-archive-1` from `origin/main` after the RC merge and PAGE-PAGES-READ-1's merge. Push with `git push origin HEAD:refs/heads/eb/auto-archive-1` (LL-181). Wave B continues on the same branch.
- **Staging plan:**
  - Wave A: C1 the two Wave A tests (red); C2 the tracker, `FinishPrompt.tsx` and CSS; C3 the port type, Page view and runtime; C4 `ReaderContainer.tsx`, `App.tsx` and `LibraryView.tsx`; then push (checkpoint, no merge).
  - Wave B: C5 the three Wave B tests (red); C6 IPC, preload, types and stub; C7 `useLibrary.ts`, `completionActions.ts` and `LibraryContainer.tsx`; C8 the cards, `IconBtn.tsx` and `LibraryView.tsx`; C9 the probe `.mjs.txt`, memo and time log.
  - Explicit paths only. One `--no-ff` merge after Wave B, Blurby.Brain1's package confirmation and Blurby.Roadmap's merge go (Rule 5b).
- **Failure handling:**
  - **(p1) shows no dialog at Page's last page:** read the relocate detail in the probe. If `atEnd` is false on the last page, the fixture's last section may be `linear="no"` or the page count off by one. Stop and return to Blurby.Brain1 with the paginator's `page`, `pages` and the section list. Do not add a fraction threshold.
  - **The dialog shows mid-book:** the end rule is reading a stale `bookEndRef`; check the `docId` match and the `false` reset from non-Page relocates.
  - **Escape exits the reader *and* dismisses (two exits):** the capture listener is not stopping propagation; fix the listener only.
  - **(p3)'s Undo toast never shows after the dialog's Archive:** the reader's `onArchiveDoc` is still `archiveDoc`; fix the `:577` wiring only.
  - **(um1) ends at 2 or 4:** the handler is wrong; fix the handler only.
  - Two repair passes per gate; then stop and return to Blurby.Brain1. Rollback: `git revert -m 1 <merge>`.
- **Execution host:** RodneySr (rule 6b), clone `C:\Users\estra\Projects\Blurby`, worktree `.worktrees\auto-archive-1` (`git -C C:/Users/estra/Projects/Blurby worktree add -b eb/auto-archive-1 .worktrees/auto-archive-1 origin/main`). Host prerequisites: `npm ci`; both fixture EPUBs are in the tree. The arm64 25 s launch runs on Rodney at merge.
- **Package verification (standing rule 53, RodneySr placement):**
  - `--dir --x64` and `--dir --arm64` builds of the final Wave B commit with `origin/main` merged.
  - A 25 s x64 scratch-profile launch with the LL-165 proof and no error or crash line.
  - `npx asar list` shows `main/ipc/documents.js` and `preload.js`, and the renderer bundle matches `dist/`. Extract in the scratchpad, never a worktree root.
  - Done-when 9 on the packaged exe with its base detector run.
  - A "Package verification" section in the close-out, and Blurby.Brain1's confirmation before the merge go.
  - The arm64 25 s launch runs on Rodney.
- **Lane ownership:** Library & Content (primary), Reader Engine (the `atEnd` hop). Execution surfaces: A (progress hook, Page runtime), C (dialog, cards), D (one IPC and one preload line).
- **Forbidden during parallel run:** `src/utils/FlowScrollEngine.ts`; the Focus, Flow and Narrate runtimes and views under `src/reader/modes/{focus,flow,narrate}/`; `main/` other than `main/ipc/documents.js`; `src/components/BacktrackPrompt.tsx`; `src/components/ReaderBottomBar.tsx`; the keyboard archive at `LibraryContainer.tsx:334-341`.
- **Shared-core touches:**
  - `src/components/ReaderContainer.tsx` (Wave A: the shell binding, `reportRelocate`, the cross-book exit argument, the overlay flag and the dialog mount).
  - `src/types.ts` (Wave B: one `ElectronAPI` line).
  - The item holds one shared-core window across both waves. Nothing else editing either file runs at the same time.
- **Merge order:**
  - After the RC merge, PAGE-PAGES-READ-1 (Seq 113) and LIBRARY-DELETE-SAFE-1 (card files).
  - Before FURTHEST-PERSIST-1 (Seq 114, `src/types.ts`, `useLibrary.ts`, `documents.js`), READER-PAGE-COUNTER-1 (Seq 135, `ReaderContainer.tsx`), EINK-VIEW-REFRESH-1 (Seq 130, `ReaderContainer.tsx`) and LIBRARY-CONTENT-DEDUP-1 (Seq 138, `DocGridCard.tsx` menu, `src/types.ts`). Each of those re-greps after this merge.
  - The register moves from Seq 111 to 113.5, between PAGE-PAGES-READ-1 and FURTHEST-PERSIST-1, per T4.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Wave A red tests: finish dialog, cross-book, Page `atEnd` hop; controls pass | repeat | positive-control | bounded | medium | 6m (median of 20 runs) | — | A |
| 2 | Tracker end rule, confirm/keep/archive/dismiss, `FinishPrompt` and CSS | novel | feature | bounded | medium | 15m | 30m | A |
| 3 | `atEnd` through Page view, runtime, port type and shell; cross-book flag; dialog mount; legacy window; hint | novel | feature | cross-cutting | medium | 15m | 30m | A |
| 4 | Wave A local gates, both reviews, checkpoint push | repeat | verify | bounded | low | 8m (median of 4 runs) | — | A |
| 5 | Wave B red tests: helpers, unmark IPC, card controls; controls pass | repeat | positive-control | bounded | medium | 6m (median of 20 runs) | — | B |
| 6 | Unmark IPC, preload, type, stub; silent archive; Undo helpers and wiring | novel | feature | bounded | medium | 15m | 30m | B |
| 7 | Mark complete on both cards, Archive on complete list cards, check icon | repeat | ui-fix | bounded | low | 6m (median of 3 runs) | — | B |
| 8 | Wave B local gates, both reviews, rule 53 pair, live probe with base detector | repeat | packaging-verify | bounded | medium | 14m (median of 4 runs) | — | B |

**Total:** chain 85m · sum 85m; 5 of 8 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- **LL-030:** the dialog needs an engaged session; (fp7) proves it.
- **LL-108:** zero stays a valid anchor; Mark complete's Undo restores a previous position of 0 exactly, because the helper reads `doc.position ?? 0`, never `||`.
- **LL-159:** the exit save runs before the dialog, so a quit with the dialog open loses no position; the dialog's writes are ordinary IPC writes the quit flush covers.
- **LL-174:** `atEnd` crosses four hops (view → runtime → port → shell → tracker). Each is an edit site; (ae1) drives the real view and runtime, and the packaged (p1) drives the whole chain.
- **LL-106:** the new `unmark-doc-completed` channel lands in handler, preload, `ElectronAPI` type and test stub together.
- **LL-141 / standing rule 45:** dialog focus and keys are proved by real presses in the packaged rows, not by synthetic events alone.
- **LL-170:** not applicable to the end rule (it uses `resolvedTotalWords` and foliate's `atEnd`, not book-word indices).
- **Standing rule 36:** every site cited at `70d64237`, re-grepped at the cut after PAGE-PAGES-READ-1.
- **Standing rule 43 (LL-138):** red first in each wave, with controls.
- **Standing rule 48 (LL-149), 41 (LL-136), 50 (LL-156), 52 (LL-146):** as written in Done-when.
- **Standing rule 53 (LL-167) and LL-165:** package with a proven scratch profile; owned fixture EPUBs only.
- **Standing rule 54 (LL-158):** the live rows read `library.json` and `history.json` after the committing step.
- **Standing rule 55 (LL-151/LL-166):** the probe proves its dialog query on the backtrack prompt and its file read on a known entry; the base package must show no finish dialog.
- **LL-181:** worktree placement and the explicit `eb/` refspec.
- **Considered, not applicable:** LL-142/173 (no audio), registry lessons.
