#### CFI-POSITION-CONSISTENCY-1 — A saved word and its saved page never disagree, so a book reopens where you left it *(Seq 97.5; Full Spec 2026-11-03, revised the same day for the owner's rulings O1–O4 and Blurby.Brain1's O4 rulings; B1–B18 adopted by Blurby.Brain1 2026-11-03; C1–C3 ruled 2026-11-03; dispatch-ready; cited against `origin/main` `c5bb507f`, with every file Waves A and C add for C1–C3 re-checked unchanged at `14ce3d24`; Reader Engine; Blurby.Brain1 finding and ruling of 2026-11-03; serialized after CHAPTER-STEP-CFI-1 (Seq 97); needs a shared-core integration window; not a release gate)*

- **What:**
  - Every save that writes a word (the position) also writes the page of that word (the cfi), or clears the stored cfi.
  - A cold open of an EPUB at a saved word waits, behind the existing "Loading book..." state, until the book's word map is ready. It then opens straight on the saved page if that page holds the saved word, and otherwise on the saved word itself. There is no visible jump afterwards.
  - Narrate, reopened at a saved word, starts Play at the first word of that word's sentence.
  - Focus saves the word as you read (O4): every 5 s while it plays, and once more on pause, stop and mode exit, each time only if the word has changed since its last save. Each Focus save sends an explicit `null` cfi, so the stored page is cleared and the pair never disagrees. Focus has no sentence-start rule: it resumes at the saved word itself.
  - **Out of scope:**
    - CHAPTER-STEP-CFI-1's landing save itself (Seq 97). This item builds on it.
    - Contents entries that point inside a section (TOC-FRAGMENT-WORD-1) and Flow's cursor after a jump (FLOW-TOC-JUMP-WORD-1).
    - Mode handovers (`handoff.source != null`), including Narrate's `arrivalSyncOwed` (NARRATE-ARRIVAL-SYNC-1). They are unchanged. The hold is cold-open only.
    - Focus, Flow and Narrate views. A cold open always mounts Page (`src/reader/useReaderModeOrchestrator.ts:336-341`), so only Page's view holds. Focus's runtime is in scope for O4 only (Wave C).
    - Flow's and Narrate's saves during play. They are a finding only (Flow and Narrate finding below), not changed here.
    - The orphaned `RSVP_PROGRESS_SAVE_WORD_DELTA` (`src/constants.ts:170`). O4's save is time-only, so it stays unused and is a finding (question B14).
    - Repairing stale pairs already in a user's `library.json`. The hold corrects what the reader sees; the stored pair is fixed by the reader's next real save (LL-030: no save without engagement).
    - A main-process cache of the word map (question B12).
    - The standalone reader window (`src/App.tsx:76`, `src/hooks/useReader.ts:180`), pending question B6.
    - The legacy, test-only copies `src/hooks/usePersistentReadingAnchor.ts` and `src/utils/persistentReadingAnchor.ts`. The live app does not import them.
    - `preload.js`. Its `updateDocProgress` already forwards a `null` third argument unchanged.
  - **Outcome:**
    - On *Meditations*: Page at word 8723, one page turn, then Flow, then "Next chapter", then quit. `library.json` holds a position and either no cfi or a cfi in that position's section. The reopen's first shown range contains the saved position.
    - A library seeded with the old stale pair (11652 with a spine-4 cfi) reopens with 11652's section as the first thing shown.
    - A library seeded with position 8723 and no cfi reopens with a range containing 8723 as the first thing shown.
    - Reopened at a word in the middle of a sentence, then Narrate and Play: the first word requested is that sentence's first word.
    - Focus Play for about 12 s, then the app is killed with no graceful quit. The reopen shows a word within one save interval of the last word read, and the stored cfi is absent.
    - Focus Play, then pause, then reopen: the book opens at the paused word.
- **Why** (Blurby.Brain1 ruling, `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.CFI-POSITION-CONSISTENCY-1.2026-11-03.md`; Amendment 3 of `Brain1.NARRATE-ARRIVAL-SYNC-1.2026-11-03.md`; RodneySr repro on the `c5bb507f` x64 package, evidence `C:\Projects\Blurby-artifacts\narrate-arrival-sync-1\repro-base\` on RodneySr):
  - **R2, confirmed live.** Page at 8723, one turn (saved 9758 with a spine-4 cfi), Flow, "Next chapter" (view on spine 5, words 11652–11733), quit. `library.json` then holds 11652 with the spine-4 cfi. The reopen shows 9758–9870, a chapter behind.
  - **Cause, at `c5bb507f`:**
    - Each mode's `navigateTo` commits an explicit-navigation word with no cfi: Focus `focus/ModeRuntime.ts:758`, Flow `flow/ModeRuntime.ts:931`, Narrate `narrate/ModeRuntime.ts:479`. Page's is a no-op on an EPUB (`page/ModeRuntime.ts:356`) and commits only off-EPUB (`:357`).
    - The commit saves `options.cfi ?? state.cfi ?? undefined` (`helpers/usePersistentReadingAnchor.ts:99` in Focus, Flow and Narrate; `:100` in Page). `state.cfi` is the previous page's cfi.
    - `main/ipc/documents.js:22-24` sets the position, and sets `doc.cfi` only when a cfi is given (`if (cfi) doc.cfi = cfi`). There is no way to clear it. The library copy does the same (`src/hooks/useLibrary.ts:162-167`), and the port bridge forwards a cfi to it only when truthy (`src/components/ReaderContainer.tsx:313`).
    - Reopen prefers the cfi: `resolveBookOpenInitialCfi` returns `cfi || null` and ignores the word (`page/helpers/persistentReadingAnchor.ts:64-71`, called at `page/ModeRuntime.ts:167`). `page/FoliateView.tsx:881-894` then calls `view.init({ lastLocation })`.
  - **R1, unproven candidate, not yet exercised.** On close or finish, `_persistAndLog` (`src/hooks/useProgressTracker.ts:243-259`) pairs the final word with `lastRelocateCfiRef`. That ref is set only by the relocate save (`ReaderContainer.tsx:330`), with no record of its word. Focus advancing words with no relocate, a suppressed relocate save, or a quit inside the debounce would save a new word with an old cfi. With no relocate at all it sends no cfi, and main keeps the stored one.
    - Brain1's RodneySr idle checks (Update of 2026-11-03 to the CFI ruling) found that Focus Play works in the package, so it is not a regression and no longer blocks probe P4. R1 itself has still not been exercised.
    - **The reader's real close route from Focus**, at `c5bb507f`:
      - Escape, from the keyboard handler `src/hooks/useKeyboardShortcuts.ts:242` (`s.exitReader()`; keys pressed in the book's frame reach it through `focus/FoliateView.tsx:931-933`), or the "ESC" button (aria-label "Exit reader", `focus/ModeView.tsx:228-232`). That button sits in Focus's overlay, which renders only while Focus plays on an EPUB (`focus/ModeView.tsx:304`). Paused, only the key remains.
      - Both reach `handleExitReader` (`ReaderContainer.tsx:614-630`, wired at `:742-745`). Outside Page it calls `handleExitToPage()` (`:627-629`, `router.exitToPage()`, `src/reader/useReaderModeOrchestrator.ts:133`) and saves nothing.
      - A second Escape, now in Page, runs `checkBacktrack` (`:624`, which can show the backtrack prompt when the reader is behind the furthest mark) and then `finishReading(exitAnchor)` (`:625`). That is the close save, `_persistAndLog`, R1's path.
      - So R1's route is Escape twice. Probe P4 drives it with native Escape key events (`windowsVirtualKeyCode` 27), never a synthetic DOM event.
  - **Focus saves nothing while it plays or is paused (O4).**
    - Every Focus word advance commits with `persist: false` (`focus/ModeRuntime.ts:1053`, in `onEngineWordAdvance`, `:1038`). `pause()` (`:591`) and the pause branch of `togglePlay()` (`:613`) only publish the highlight (`captureCurrentAnchor`, `:1140`). `stop()` (`:629`) saves nothing. Focus moves the word display only (`jumpDisplayToWord`, `:1225`), so its view does not relocate and the relocate save never fires.
    - So a Focus session reaches `library.json` only through the close save in Page, and a crash or kill loses all of it.
    - **This is a regression, not a design.** The legacy hook `src/hooks/useDocumentLifecycle.ts` saved every `RSVP_PROGRESS_SAVE_INTERVAL_MS` (5000 ms) or `RSVP_PROGRESS_SAVE_WORD_DELTA` (50 words) while Focus played. The shell cutover of READER-MODE-SEPARATION-2 (`3dd4b504`) copied only that hook's shell half, and NARRATE-REMOVE-1 deleted the dead file (`0c89dd79`). Both constants remain in `src/constants.ts:168` and `:170`, with no user.
    - Focus has no sentence-start rule. Nothing in `focus/ModeRuntime.ts` calls `sentenceStartAt`; "sentence" appears only as the sentence-step key command (`:788-789`). A Focus resume starts at the saved word itself.
  - **Position-only open.** With no cfi, `page/FoliateView.tsx:884-894` calls `goToFraction(position / wordCount)`. On the repro this landed about 830 words late (8723 → 9552–9698). Page never moves to the word afterwards: it skips its word jump while the book-open `resumeAnchor` is set (`page/ModeRuntime.ts:505-510`).
  - **The word map is never ready at a cold open today.** That is why every check must wait for it.
    - `ReaderContainer` is mounted only while a book is open (`src/components/LibraryContainer.tsx:558-563`). Its map cache is per instance (`ReaderContainer.tsx:196-200`; the module-level cache was removed, Q-D).
    - Main re-extracts on every call (`main/ipc/tts.js:162-174`).
    - The shell starts extraction 1000 ms after open, or 2000 ms for books over 100,000 words (`ReaderContainer.tsx:600-608`).
    - The only in-shell open, Flow's cross-book `openDocument`, opens a different book, which is cold too.
  - **Users see:** jump to a chapter, close soon after, and the book reopens a chapter earlier.
- **Writers of a word without its own cfi, at `c5bb507f`** (re-grep at the cut):
  - Mode anchor fallback, every persisted commit: `src/reader/modes/page/helpers/usePersistentReadingAnchor.ts:100`; `focus/…:99`; `flow/…:99`; `narrate/…:99`.
  - Explicit navigation with `cfi` undefined: Focus `focus/ModeRuntime.ts:758`; Flow `flow/ModeRuntime.ts:931`; Narrate `narrate/ModeRuntime.ts:479`; Page `page/ModeRuntime.ts:357` (off-EPUB only).
  - Close and finish: `src/hooks/useProgressTracker.ts:255-259` (R1).
  - Consistent, no change needed: hard selections with the click's cfi (Page `:327-328`, Focus `:733`, Flow `:903`, Narrate `:461`); Page's turn save (`page/ModeRuntime.ts:590-595`) and held-click save (`:615`); the relocate save (`ReaderContainer.tsx:323-336`). An empty click cfi falls through the anchor fallback above.
  - Position-only, off-EPUB only: `useProgressTracker.ts:235`.
  - New with O4 (Wave C), consistent by construction: Focus's saves as you go send an explicit `null` cfi.
  - Standalone reader window, position only: `src/App.tsx:76`, `src/hooks/useReader.ts:180` (question B6).
- **What CHAPTER-STEP-CFI-1 already fixes, and what stays here.** CHAPTER-STEP-CFI-1 (amendment 1; full specification `docs/planning/specs/2026-10-23-5/CHAPTER-STEP-CFI-1.md`):
  - **Covers:** in Focus, Flow and Narrate on an EPUB, `navigateTo` only records `pendingJumpWord`. The landing commits the entry's word with the landed cfi (`completeLanding`), and a jump that never lands saves nothing. That covers every contents jump and every Previous/Next chapter step, the path R2 took (`handleJumpToChapter`, `ReaderContainer.tsx:648-667`, the only `navigateTo` caller). After it, R2's exact steps save a consistent pair.
  - **Left for this item:**
    1. The anchor fallback to `state.cfi` in all four copies. After CHAPTER-STEP-CFI-1 no EPUB jump reaches it, but every persisted commit without a cfi still takes it: an empty click cfi today, and any future caller.
    2. No way to clear a stored cfi: `documents.js`, the library copy and the port bridge.
    3. The close and finish path (R1).
    4. The reopen check, for stale pairs already stored by `c5bb507f` and earlier builds.
    5. The position-only open.
- **O3 finding (Narrate's start at a reopened saved word).** On the normal path it is already met, so this item adds a pinning row, not a change.
  - The rule exists. NARRATE-SENTENCE-RESUME-1 rewinds the start to the sentence's first word unless the reader clicked the word (`narrate/ModeRuntime.ts:311`, `:321-322`; `sentenceStartAt`, `narrate/engine/chunkPlan.ts:79-84`).
  - A reopen reaches Narrate only by a handover from Page, because every cold open mounts Page. Nothing in that path sets `explicitSelectionAnchor` (`createInitialHandoff`, `src/reader/document/ReaderDocumentSnapshot.ts:152-166`; Page's turn save clears it, `page/ModeRuntime.ts:586`), so the rewind applies.
  - NARRATE-ARRIVAL-SYNC-1 (Seq 88.5, merged before this item) makes that Play start at the saved word's sentence, not the cover's first text (its rows sp1–sp3).
  - **It holds only when the word map is loaded.**
    - Without the map, `effectiveWords` is the loaded section's own word list (`narrate/ModeRuntime.ts:823-830`).
    - The saved word's global index then lies past its end, so the start becomes the first visible word (`:316-320`).
    - `sentenceStartAt` returns an out-of-range index unchanged (`chunkPlan.ts:80`).
  - With O2's hold, the map is loaded before the book is shown, so a reader can't reach Narrate without it on the normal path. The two remaining edges are a hold that ended by failure or timeout, and a mode switch during the hold. They are question B13.
- **Flow and Narrate finding (finding only; no change in this item).**
  - Flow and Narrate save during play only through the relocate save: Flow `flow/ModeRuntime.ts:1078`, Narrate `narrate/ModeRuntime.ts:528`, both `scheduleRelocateSave`, debounced by `FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS` (2000 ms). Their word advances commit with `persist: false` (Flow `:1316`, Narrate `:709`).
  - So their saves follow page movement, not time. While the cursor moves within one page, or while the relocate handler returns before its save (its resume-anchor, engagement and browsing guards: Flow `:1054-1069`, Narrate `:519-520`), nothing is saved, and a kill loses that span. It is the same gap as Focus's, narrower because their views move.
  - Blurby.Roadmap registers it as a finding in `docs/governance/Findings.md`, for an item that applies O4's rule to Flow and Narrate if the owner wants it there too.
- **Write cost of a save, traced at `c5bb507f`.**
  - The renderer's `updateDocProgress` reaches `ipcMain.handle("update-doc-progress")` (`main/ipc/documents.js:15-31`). It mutates the in-memory doc (`:23-27`), then calls `ctx.saveLibrary()` (`:28`) and, with a position, `syncQueue.enqueue("update-progress")` (`:31`).
  - `saveLibrary` (`main.js:120-131`) only marks the library dirty and arms a single timer of `LIBRARY_SAVE_DEBOUNCE_MS` (500 ms, `main/constants.js:155`). When it fires, the whole `library.json` is written once from memory. Saves inside one window coalesce into one write. `saveLibraryNow` (`main.js:132-136`) is the immediate form; the quit flush calls it (`main.js:643`, `:648`).
  - `enqueue` (`main/sync-queue.js:169-182`) pushes an entry and calls `saveQueue` (`:53-56`), which rewrites the whole `sync-queue.json` with no debounce, compacting above 200 entries.
  - **At O4's cadence**, a Focus session adds at most one `library.json` write and one `sync-queue.json` write per 5 s: 12 of each a minute. That is the legacy rate before `3dd4b504`, below the relocate save's 2 s debounce in Flow and Narrate, and far below the debounce's own ceiling of two writes a second.
  - **Crash window:** a kill within 500 ms of a save loses that save, so the stored word can trail the word read by up to one interval plus 500 ms plus one word (question B16).
- **LIBRARY-WRITE-RACE-3 and O4.**
  - LIBRARY-WRITE-RACE-3 is Seq 89, a Full Spec in `ROADMAP.md` (`:863`), with its post-RC amendment `docs/planning/specs/2026-11-03/LIBRARY-WRITE-RACE-3.post-rc-amendment.md`. It is not merged: `origin/main` carries only LIBRARY-WRITE-RACE-1 and 2 (`2b2b41a5`).
  - Its race is the renderer's library edits, which stamp fields the reader did not change (W2). Those edits can set only `RENDERER_FIELDS` (`main/ipc/library.js:44`: `unread`, `seenAt`, `tags`, `collection`; merged by `mergeRendererEdits`, `:57`, behind `save-library`, `:79`). `position` and `cfi` are main's alone, written only through `update-doc-progress` into the single in-memory library that one debounced writer saves.
  - **Chosen option: route O4 through the existing debounced path**, `update-doc-progress` and `saveLibrary`, with no LIBRARY-WRITE-RACE-3 prerequisite. A Focus save adds writes of fields no renderer library edit can carry, through the writer that already coalesces them, so it neither widens nor reopens that race. Making LIBRARY-WRITE-RACE-3 a prerequisite would hold this item behind the RC window for a race it does not touch. A new renderer-side debounce would add a second timer for what main already coalesces.
- **Design decisions** (confirmed by Blurby.Brain1 through B1–B18 and C1–C3, 2026-11-03; design 9 is Brain1's binding O4 ruling):
  1. **One contract for the cfi argument, everywhere it travels** (`documents.js`, the port, `ElectronAPI`, the library copy, the stub):
     - `undefined`: keep the stored cfi. Unchanged, so every existing caller behaves as today.
     - `null`: "this save knows no cfi for its word". Main sets the position, then clears the stored cfi unless the position is unchanged. An unchanged position means the stored pair still stands.
     - A non-empty string: set it.
     - Position `-1` (Page's cfi-only save) ignores `null`: neither field changes.
     - **Why "unless unchanged":** a close in Page right after a turn has no matching relocate. A plain clear would drop the turn's correct cfi and undo PAGE-REOPEN-CFI-1 (question B1).
  2. **The mode anchor never borrows `state.cfi`.** A persisted commit sends `options.cfi || null`: the caller's cfi, or "unknown". Empty strings count as unknown.
  3. **The close save pairs a word only with its own relocate.** The relocate ref records its word. `_persistAndLog` sends that relocate's cfi when it is in this book and its word is unknown or equals the saved word. Otherwise it sends `null`. Keep-at-furthest's named cfi (`cfiOverride`) is unchanged.
  4. **The cold-open hold (O2-B), in Page only.**
     - Page's runtime owns one open target, `{ cfi, word }`, as a promise. Page's view awaits it before `view.init`.
     - Until it settles, nothing is rendered: foliate draws nothing before `init` (foliate-js 1.0.1 `view.js:301-312`). The existing "Loading book..." overlay stays up, unchanged (`page/FoliateView.tsx:299`, `:1245`; `.rm-page-loading` in `src/reader/modes/page/mode.css`). No new CSS.
     - **When it holds:** a cold open (`handoff.source == null`) of an EPUB with a saved word above 0 and no sections in the snapshot. Today that is every such cold open (Why). It settles at once in every other case:
       - word 0;
       - not an EPUB;
       - a mode handover, which uses today's `initialCfi`;
       - sections already in the snapshot (no case today; kept for a future cache and for the tests).
     - **What starts it:** Page's first `select()` asks for the map at once (`ports.document.ensureBookWords()`), which skips the shell's 1000/2000 ms pre-extraction delay. The shell dedupes the request (`ReaderContainer.tsx:280-281`).
     - **How it settles, at the first of:**
       - the map arrives through `adoptDocument` with non-empty sections. The target is then chosen from the word, the cfi and the sections: the stored cfi if its spine section holds the word, otherwise the word.
       - the map request returns `null`, rejects, or returns empty sections (BUG-239: `main/epub-word-extractor.js:171`, `:188`). The target is then today's choice: the stored cfi, else the estimate.
       - `PAGE_OPEN_HOLD_TIMEOUT_MS` (3000 ms, in `src/constants.ts`) passes. The target is today's choice. A map that arrives later moves nothing (O2: no visible jump).
       - `stop()`, for example a mode switch during the hold. The target is today's choice, and the timer is cleared.
  5. **Opening on the word (O1-A).** For a word target, Page's view calls `view.init` with the word's section (the same `section.id`, else `section.href`, that `goToSection` uses). Before clearing "Loading book...", it lands on the word with `jumpFoliateToWordAnchor`, the helper Page's jump-back already uses (`page/surface.ts:42`, `page/ModeRuntime.ts:362-366`). That makes this open land where "jump back to my place" lands. A cfi target opens on the saved page exactly as today. Nothing saves: Page's relocates fall under the book-open `resumeAnchor` (LL-030).
  6. **Input during the hold is ignored, not blocked.**
     - Nothing is rendered, so no word, page or link can be clicked, and Page's own keys live in the view, which isn't initialised yet.
     - Shell commands still reach the runtime. While the hold is pending, Page's `handleCommand` and `jumpBack` return at once. Page's `navigateTo` is already a no-op on an EPUB.
     - A mode switch is not blocked, because that would need the shell, which is shared core. It ends the hold through `stop()`, and the handover proceeds as today (question B11).
  7. **Shared core is needed, narrowly, for Wave A only.**
     - `src/types.ts:298` types `ElectronAPI.updateDocProgress`'s cfi as `string`.
     - The bridge in `ReaderContainer.tsx` passes the port's cfi into it (`:312`), drops a falsy cfi before the library copy (`:313`), and owns the relocate ref (`:271`, `:330`).
     - There is no type-honest way to carry `null` without editing both. **An integration window is requested** for `src/types.ts` and `src/components/ReaderContainer.tsx` from the cut to the merge. `src/utils/FlowScrollEngine.ts` is untouched.
  8. **Mode isolation.** Each mode's anchor helper is edited in its own copy (Wave A). The hold lives in Page's own files only (Wave B). Focus's saves as you go live in `focus/ModeRuntime.ts` only (Wave C). Wave C also adds two entries to the port broker's release list (`src/reader/ports/createReaderPorts.ts:46-49`), once for all three playback modes (C1). That file is not in the shared-core freeze set, but it is every mode's broker, so it is named in Wave C's steps and the fence. No sibling import, no shared mutable store, no new shared module. `src/constants.ts` is the shared constants file Page and Focus already import (`page/ModeRuntime.ts:13-16`, `focus/ModeRuntime.ts:16-23`).
  9. **Focus saves as you go (O4; Brain1's binding O4 rulings).**
     - **When:** at the first word advance at least `RSVP_PROGRESS_SAVE_INTERVAL_MS` (5000 ms, `src/constants.ts:168`, never a literal) after the last save or the start of play; and once more on pause, on the pause branch of `togglePlay`, and on `stop()`, which covers a mode switch, Escape to Page, a cross-book open and the end of the book. Each fires only if the word differs from the last word saved.
     - **The exit save runs inside the teardown window (C1).** The router stops the outgoing mode inside `broker.teardown` (`src/reader/useReaderModeOrchestrator.ts:303-307`; a cross-book open's `closeAll(true)` does the same, `:318-323`). Wave C adds `persistence.updateDocProgress` and `persistence.updateProgress` to `READER_PORT_RELEASE_CALLS`, so the exit save is accepted there.
       - Brain1's condition: the exit save is made synchronously inside `stop()`, after every save timer is cleared. In Focus that is after `clearTimers()` and `stopEngine()` (the engine's word timer, `FocusMode.scheduleNext`, `focus/ModeRuntime.ts:204-208`, is what drives the timed save). Nothing asynchronous saves after release.
       - The broker enforces the same, with no help from the mode. Its release allowance does not outlive the teardown frame: `teardown` sets `releasing` only around `run()` and, in `finally`, clears it and deletes the key (`createReaderPorts.ts:189-200`). A release call passes only while `state === "closing" && releasing === id` (`:109-110`). Any later call is rejected with a `port-rejected` diagnostic (`:111-117`). Row f10 still requires that no such call is even attempted.
       - **Not on unmount.** `router.destroy()` (the shell's unmount, `useReaderModeOrchestrator.ts:87`, `:377-379`) runs `closeAll(false)`: `broker.closeAll()` closes every key with no release window, then `runtime.destroy()` calls `stop("teardown")` (`:325-326`). A save there would only be rejected. So `stop()` skips the exit save when its reason is `"teardown"`. That reason reaches the save only from `destroy()` without an earlier `stop()`: every transition passes `"mode-switch"` or `"user-stop"` (`:344`, `:352`, `:356`, `:361`, `:374`), and a cross-book open passes `"user-stop"` (`:321`). On unmount the last timed save bounds the loss to one interval, as for a kill (row f11).
     - **What:** `ports.persistence.updateDocProgress(documentId, word, null)` then `ports.persistence.updateProgress(documentId, word)`, from one private method. The cfi is an explicit `null`, never `state.cfi`. Under design 1 main then clears the stored cfi whenever the word changed, so B1's rule holds.
     - **Which word:** at an advance, the advanced word. On pause, the engine's current word, the one `captureCurrentAnchor` publishes. On stop, the committed word, `state.currentWordIndex` (C3): a click while paused commits the clicked word there (`commitShared`, `focus/ModeRuntime.ts:1202-1211`) without moving a paused engine (`:735`), so the click wins over the engine's older word.
     - **"The last word saved"** includes Focus's own persisted commits: `commitShared` (a click, an off-EPUB navigation, CHAPTER-STEP-CFI-1's landing) sets it too. So a stop right after a paused click finds the word unchanged and saves nothing, and the click's own save, with its cfi, stays the last write (row f9).
     - **Only after Play:** the last-saved word starts as the word Focus opened at, and nothing saves until the engine has run (Play marks engagement, `focus/ModeRuntime.ts:532`; LL-030). Selecting Focus and leaving without Play saves nothing.
     - **No timer:** the interval is checked against `Date.now()` on each advance. Nothing new needs clearing on `stop()` (LL-169).
     - **Only in the book's index space (B15, aligned with FLOW- and NARRATE-SAVE-AS-YOU-GO-1's Q3 ruling):** saves happen only while the running engine was started on the book's words. `start()` copies `effectiveWords()` (`:542`): the map when loaded, else the view's own words (`surface.getWords()`), else `tokenWords` (`:1167-1174`). The delayed start hands that copy to the engine (`:583-587`). `adoptDocument` does not restart a running engine (`:484-497`), and `resume()` reuses it (`:605-610`). So "the map is loaded now" does not prove the engine's indices are the book's. A flag, `engineOnBookWords`, records at each `start()` whether its words came from the map, or the book is not an EPUB. An engine started on fallback words never saves, even after the map arrives, until a new `start()` on the map (row f12).
     - **Focus and a pending relocate save (Q2 check).** Focus does have a relocate save: `onRelocate` (`:863-904`) schedules `scheduleRelocateSave` (`:903`). But Focus advances only its word display (`jumpDisplayToWord`, `:1225`), so its view does not relocate while it plays. A pause save can be overwritten only if a relocate from outside playback (a resize or a layout setting) came within 2 s before the pause. Brain1 ruled Q2's re-save for Flow and Narrate, whose views relocate as they play. Focus is unchanged here; the narrow case is a findings candidate for Blurby.Roadmap.
     - **Reopen:** a Focus save stores a word and no cfi, so the reopen goes through design 4's hold to a word target and opens on that word. Focus has no sentence-start rule (Why), so a Focus resume starts at that word, not its sentence. Narrate's sentence-start rule (O3) still applies if the reader switches to Narrate.
     - **Expected loss:** about 20–40 words at 250–480 words a minute, the interval's span, plus main's 500 ms debounce on a hard kill (B16).
     - **Furthest mark:** each save raises keep-at-furthest's mark through the bridge's `noteHighWater` (`ReaderContainer.tsx:315`) with a `null` cfi (question B17).
- **The change.** Line numbers are at `c5bb507f`. CHAPTER-STEP-CFI-1 and NARRATE-ARRIVAL-SYNC-1 move some lines, so the implementer re-greps every cited line at the cut (standing rule 36):

  ```
  git grep -n -F 'options.cfi ?? state.cfi' -- src/reader/modes
  git grep -n -F 'resolveBookOpenInitialCfi(' -- src/reader/modes/page
  git grep -n -F 'if (cfi) doc.cfi = cfi;' -- main/ipc/documents.js src/test-harness/electron-api-stub.ts
  git grep -n -F 'lastRelocateCfiRef' -- src/hooks/useProgressTracker.ts src/components/ReaderContainer.tsx
  git grep -n -E 'initialCfi|setLoading\(false\)|view\.init\(|goToFraction\(fraction\)|let cancelled' -- src/reader/modes/page/FoliateView.tsx src/reader/modes/page/useModeBindings.ts
  git grep -n -E 'private adoptDocument|select\(wordIndex|handleCommand\(command|jumpBack\(\): void|stop\(|FOLIATE_MIN_ENGAGEMENT_POSITION' -- src/reader/modes/page/ModeRuntime.ts
  git grep -n -E 'const clickedWord|sentenceStartAt\(|private effectiveWords' -- src/reader/modes/narrate/ModeRuntime.ts
  git grep -n -E 'private onEngineWordAdvance|^  pause\(\)|^  togglePlay\(\)|^  stop\(|private captureCurrentAnchor|private stopEngine|private markEngaged|\} from "\.\./\.\./\.\./constants"' -- src/reader/modes/focus/ModeRuntime.ts
  git grep -n -E 'RSVP_PROGRESS_SAVE_(INTERVAL_MS|WORD_DELTA)' -- src
  ```

  - **Wave A — contract and writers** (about 35 tool uses):
    1. `main/ipc/documents.js` (`:22-24`). Compute `const clearCfi = cfi === null && hasPosition && position !== doc.position;` before the position is written. Then set the position as today; `if (typeof cfi === "string" && cfi) doc.cfi = cfi; else if (clearCfi) delete doc.cfi;`. The sync enqueue is unchanged; the cfi is not synced.
    2. `src/test-harness/electron-api-stub.ts` (`:327-336`): the same rule, as its comment already mirrors main. The parameter becomes `cfi?: string | null`.
    3. `src/types.ts:298` (window): `cfi?: string | null`.
    4. `src/reader/ports/ReaderPorts.ts:20`: `cfi?: string | null`, with a one-line doc comment stating the three meanings.
    5. `src/components/ReaderContainer.tsx` (window):
       - `:68`, the `onUpdateProgress` prop: `cfi?: string | null`;
       - `:313`: forward to the library copy when `cfi` is a non-empty string **or** `null`;
       - `:271` and `:330`: the relocate ref becomes `{ docId, cfi, wordIndex }`, set with the `wordIndex` the relocate save already receives.
    6. `src/hooks/useLibrary.ts:162-167`: `cfi?: string | null`. A `null` with `position >= 0` and a position different from the copy's removes `cfi` from the copy. Otherwise as today.
    7. `src/hooks/useProgressTracker.ts`:
       - `:28`: `cfi?: string | null`;
       - `:72` and `:105`: the ref type gains an optional `wordIndex`;
       - `:255-256`: the relocate's cfi is used only if `relocated.docId === activeDoc.id` and (`relocated.wordIndex == null` or `relocated.wordIndex === savePos`). Otherwise `null`. `cfiOverride` still wins.
    8. Each mode's `helpers/usePersistentReadingAnchor.ts` (Page `:100`; Focus, Flow and Narrate `:99`): `const cfi = options.cfi || null;`, with a comment naming this item.
    9. **Pinned rows brought into scope (standing rule 50).** `tests/useProgressTracker.test.ts`, describe block "the exit save's cfi (PAGE-REOPEN-CFI-1)" at `:330-376`:
       - "with no relocate since the open, it sends the position with no cfi" and "a relocate recorded for another book is not sent": change only their expected third argument from `undefined` to `null` (both `updateDocProgress` and `onUpdateProgress` where asserted). This is Blurby.Brain1's named exception to standing rule 50 (B3 ruling): everything else in both rows stays byte-identical, and the memo quotes each row before and after.
       - "after a relocate, it sends that relocate's cfi" stays unedited and green: its ref has no `wordIndex`.
    10. **The B0 replay baselines (C2; Blurby.Brain1's named exception to standing rule 50).** Under step 8 the hard-selection commit sends `null` where B0 recorded `"<undefined>"`. Each fixture records it twice, both `hardSelect` steps: `flow-core-start-7` and `flow-core-start-0` command 8, `focus-core-start-7` and `focus-core-start-0` command 9 (`["fixture-doc", 17, "<undefined>"]` and `["fixture-doc", 10, "<undefined>"]`). The fixtures under `docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/` stay byte-unchanged.
       - In `tests/readerModes/flow.behavior.test.tsx` and `tests/readerModes/focus.behavior.test.tsx` only, add one test-local helper, `hardSelectionCfiAsRecorded(scripts)`. It returns a deep copy in which, for every step whose `command` is `"hardSelect"`, an effect with `channel === "persistence.updateDocProgress"`, three arguments and `args[2] === null` gets `args[2] = "<undefined>"`. Nothing else is touched, so every other argument and effect still compares exactly. Its comment names this item, C2 and the rule-50 exception.
       - In the test "preserves the recorded mode baseline", take `const candidate = hardSelectionCfiAsRecorded(result.candidateScripts);`.
         - Flow: `:54` `expect(result.diff).toBeNull();` becomes `expect(compareReplay(readFixtureText("flow"), candidate).diff).toBeNull();`. The four negative controls (`:88`, `:92`, `:96`, `:101`) pass `candidate` in place of `result.candidateScripts`, so they still fail for their own mutation and not for the cfi.
         - Focus: the same at `:32` (with `"focus"`) and at `:72`, `:76`, `:80`.
       - `result.errors`, `droppedEffects`, `droppedObservations` and the channel checks (Flow `:62-82`, Focus `:40-66`) are unchanged. Nothing in `tests/readerModes/harness/fixtureReplay.tsx` changes: `replayFixture` already returns `candidateScripts` (`:439-450`), and `compareReplay` takes any baseline text and candidate (`:372`).
       - Both tests stay green on `<base>` (the candidate still emits `"<undefined>"`) and after step 8. The memo quotes each edited line before and after.

       No other existing test is edited in Wave A. If any other test pins the `state.cfi` fallback or `undefined` on a close, STOP to Blurby.Brain1 with its name before editing it.
  - **Wave B — the cold-open hold, Page only** (about 35 tool uses):
    1. `src/constants.ts`, beside `FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS` (`:172`): `export const PAGE_OPEN_HOLD_TIMEOUT_MS = 3000;`, with a comment naming this item and Brain1 question B9.
    2. `src/reader/modes/page/helpers/persistentReadingAnchor.ts`:
       - `export interface PageOpenTarget { readonly cfi: string | null; readonly word: number | null }`;
       - `cfiSpineIndex(cfi)`: for `^epubcfi\(/6/(\d+)` with an even step `n`, return `n / 2 - 1`; otherwise `null`. The extractor's `sectionIndex` is the spine index (`main/epub-word-extractor.js:219-271`), and so is foliate's section index.
       - `chooseOpenTarget({ word, cfi, sections })`:
         - with no usable sections, return today's choice, `{ cfi: cfi || null, word: null }`;
         - otherwise find the section with `startWordIdx <= word < endWordIdx`;
         - if `cfi` is set, `cfiSpineIndex(cfi)` is not `null` and equals that section's `sectionIndex`, return `{ cfi, word: null }`;
         - if `cfi` is unparseable, return `{ cfi, word: null }` (today's behaviour);
         - otherwise return `{ cfi: null, word }`.
       - Compare indices only, never ranges (LL-029).
       - `resolveBookOpenInitialCfi` is unchanged.
    3. `src/reader/modes/page/ModeRuntime.ts`:
       - **Fields:** `private readonly openTarget: Promise<PageOpenTarget>` with its resolver, and `private openHold: { timer: ReturnType<typeof setTimeout> | null } | null`.
       - **Constructor** (after `initialCfi`, `:167`): the fallback is `{ cfi: this.initialCfi, word: null }`.
         - If not `document.useFoliate`, or `handoff.source != null`, or the word is 0: settle with the fallback.
         - Else if the snapshot has non-empty sections: settle with `chooseOpenTarget`.
         - Else arm `openHold`.
       - **`resolveOpenTarget = (): Promise<PageOpenTarget> => this.openTarget`**, a bound arrow.
       - **The first `select()`** (where `adoptDocument` is subscribed, `:229`), if `openHold` is armed:
         - start the `PAGE_OPEN_HOLD_TIMEOUT_MS` timer, which settles with the fallback;
         - call `this.ports.document.ensureBookWords()`. It settles with the fallback on `null`, on a rejection, or on empty sections, and with `chooseOpenTarget` on non-empty sections.
       - **`adoptDocument`** (`:215`): after adopting, if `openHold` is armed and the new snapshot has non-empty sections, settle with `chooseOpenTarget`.
       - **`settleOpen(target)`:** acts only if `openHold` is armed (once). It clears the timer, sets `openHold = null` and resolves the promise. It never saves and never calls the surface.
       - **`stop()` and `destroy()`:** settle with the fallback (LL-169: the timer and the promise end with the runtime).
       - **While `openHold` is armed:** `handleCommand` and `jumpBack` return at once.
    4. `src/reader/modes/page/useModeBindings.ts` (`:20`): pass `resolveOpenTarget: runtime.resolveOpenTarget` beside `initialCfi`.
    5. `src/reader/modes/page/FoliateView.tsx`:
       - a new prop `resolveOpenTarget: () => Promise<PageOpenTarget>`, kept in a ref;
       - before the `initOptions` line (`:881`): `const target = await resolveOpenTargetRef.current(); if (cancelled) return;`;
       - `initOptions` is `{ lastLocation: target.cfi }` for a cfi target, `{ lastLocation: <the word's section id or href> }` for a word target (found with the `getSectionForWordIndex` logic over `liveSections()`), and `{}` otherwise;
       - the `goToFraction` branch (`:884-894`) runs only when the target has neither a cfi nor a word;
       - just before `setLoading(false)` (`:1060`), for a word target: `await jumpFoliateToWordAnchor(viewApiRef.current, target.word); if (cancelled) return;`, imported from `./helpers/foliateAnchorNavigation`;
       - `initialCfi` stays a prop for the handover path; for Page it now only feeds the fallback target.
  - **Wave C — Focus saves as you go, and the broker's release list** (about 30 tool uses; needs Wave A's `null` contract):
    1. `src/constants.ts:167-168`: keep `RSVP_PROGRESS_SAVE_INTERVAL_MS = 5000` and its value. Change only its comment, once, to name all three playback modes' saves as you go (Focus here; Flow and Narrate under FLOW-SAVE-AS-YOU-GO-1 and NARRATE-SAVE-AS-YOU-GO-1, owner O5), this item and owner ruling O4 (Brain1 G2). `RSVP_PROGRESS_SAVE_WORD_DELTA` (`:170`) is left as it is (question B14).
    2. `src/reader/modes/focus/ModeRuntime.ts`:
       - add `RSVP_PROGRESS_SAVE_INTERVAL_MS` to the `../../../constants` import (`:16-23`);
       - **fields:** `private lastSavedWord: number` (the word Focus opened at: `handoff.canonicalWordIndex`, set beside `initialCfi` in the constructor, `:425`), `private lastSaveAt = 0`, `private playedSinceSave = false` and `private engineOnBookWords = false`;
       - **`private saveProgressWord(word: number): void`:** returns unless `playedSinceSave` and `engineOnBookWords` are set, `word !== this.lastSavedWord`, and the word is at least 0 (B15, as aligned with Q3). Otherwise it calls `this.ports.persistence.updateDocProgress(this.document.documentId, word, null)` and `this.ports.persistence.updateProgress(this.document.documentId, word)`, then sets `lastSavedWord = word` and `lastSaveAt = Date.now()`;
       - **`start()`** (`:519`): right after `const effectiveWords = [...this.effectiveWords()];` (`:542`), `const onBookWords = !this.document.useFoliate || this.document.bookWords != null;`. In the delayed-start callback, just before `this.startEngine(startWord, effectiveWords, paragraphBreaks);` (`:586`), `this.engineOnBookWords = onBookWords;`. The early returns (`:520`, `:522`, `:538`, `:550`, `:559`, `:584`) change nothing;
       - **`startEngine`** (`:1009`): on creating an engine, if `playedSinceSave` is false, set it and set `lastSaveAt = Date.now()`, so the first periodic save comes one interval after Play;
       - **`onEngineWordAdvance`** (`:1038`): after the existing `persist: false` commit (`:1053`), `if (Date.now() - this.lastSaveAt >= RSVP_PROGRESS_SAVE_INTERVAL_MS) this.saveProgressWord(idx);`. The commit itself stays `persist: false`;
       - **`pause()`** (`:591`) and **`togglePlay()`'s pause branch** (`:615-620`): right after `captureCurrentAnchor()`, `this.saveProgressWord(this.engine.getCurrentWord())`;
       - **`stop()`** (`:629`): the parameter `_reason` becomes `reason`. Immediately after `this.stopEngine();` (`:640`), which follows `this.clearTimers();` (`:634`), add `if (reason !== "teardown") this.saveProgressWord(this.state.currentWordIndex);` (C1 condition, C3). It runs after `this.alive = false` (`:631`), which `saveProgressWord` does not read. `destroy()` reaches `stop("teardown")` only when nothing stopped the runtime first, which is the unmount path with no release window. A second `stop()` returns early, so nothing saves twice;
       - **`commitShared`** (`:1202-1211`): after the commit, `this.lastSavedWord = clamped;` (C3);
       - a comment on `saveProgressWord` names this item, O4, C1–C3, `3dd4b504` as the regression and LL-030.
    3. **`src/reader/ports/createReaderPorts.ts` (C1).** In `READER_PORT_RELEASE_CALLS` (`:46-49`), add `"persistence.updateDocProgress"` and `"persistence.updateProgress"` after `"diagnostics.*"`. Only the list changes:
       - `releaseSignature` (`:76-81`) already returns the bare method name for these calls. Their argument count is 3 or 2, so neither the `settings.update{…}` rule nor the one-`null`-argument rule applies;
       - `call`, `teardown` and `closeAll` are unchanged;
       - the header comment (`:9`) is unchanged; it names the list, not its entries.

       Under one list for all three modes, FLOW-SAVE-AS-YOU-GO-1 and NARRATE-SAVE-AS-YOU-GO-1 make no broker edit. The review-record design `docs/planning/roadmap-reviews/reader-mode-separation-2/design/waves-b-e-design.md:293`, which says persistence writes are rejected in the window, is superseded by C1 for these two calls. It is a review record, so it is not edited; the memo cites C1.
    4. **The isolation rows that pin the list (C1; Blurby.Brain1's named exception to standing rule 50).** Only `tests/readerModeIsolation.test.ts` changes, and in it only what follows from the two new list entries. The memo quotes each line before and after.
       - **"lets teardown run only release-class calls, then closes the key"** (`:101-131`). It makes `ports.persistence.updateProgress("doc-1", 3)` inside the window and expects it rejected.
         - The comment `// Not release-class: rejected inside the window.` (`:111`) moves below that call (`:112`), above `setWpm` (`:113`).
         - `:117` expects `["settings.update", "persistence.updateProgress"]`.
         - `:119-123` drops the `"persistence.updateProgress": 1` entry.
         - `:129` expects `toHaveLength(2)`.
         - `setWpm` and `settings.update({ readingMode })` still prove that non-release calls are rejected, and the closed-key half (`:125-130`) is otherwise unchanged.
       - **"transitions in order: export, invalidate, teardown(stop, destroy), issue, create, select"** (`:276-291`). The fake runtime's `stop` calls `updateProgress` (`:208`). `:289` reads `broker.stats.accepted["persistence.updateProgress"]` where it read `broker.stats.rejected[...]`, still `toBe(1)`.
       - **"openDocument starts a new generation and releases the old session inside a teardown window"** (`:313-324`). Two fake stops now reach infrastructure: Page's at `router.select("flow")`, and Flow's in `openDocument`'s release window. `:321` expects `[{ method: "persistence.updateProgress", args: ["doc-1", 7] }, { method: "persistence.updateProgress", args: ["doc-1", 7] }]`.
       - The fake module's comment at `:208` (`// not release-class: rejected`) becomes `// release-class since CFI-POSITION-CONSISTENCY-1 (C1)`.
       - **Unchanged and still green:**
         - "closeAll and openDocument close every key with no release window" (`:133-149`): no release window, so still rejected;
         - the G3 rows over the real modes (`:497-629`): their document is an EPUB with `bookWords: null` (`tests/readerModes/harness/fakePorts.ts:29`, `:35`), so no mode saves. Their after-teardown check (`:541`) stays as written;
         - `tests/readerModeOwnership.test.ts:221-236`: its teardown runs nothing, and its later calls are on closed keys.

       If any other row fails on the list change, STOP to Blurby.Brain1 with its name before editing it.
    5. Nothing else in Focus changes: not its view, bindings, anchor helper (beyond Wave A) or engine. No other mode changes in Wave C.
  - **Wave D — gates, package and close-out** (about 35 tool uses): Done-when 5–11.
- **Prerequisites:**
  - NARRATE-ARRIVAL-SYNC-1 (Seq 88.5) merged, and gate (1) run 6 recorded.
  - CHAPTER-STEP-CFI-1 (Seq 97, amendment 1, `eb/chapter-step-cfi-1-r2`) merged. `<base>` is `origin/main` after that merge.
  - The `src/types.ts` and `src/components/ReaderContainer.tsx` integration window granted, with no other active sprint editing either file.
  - Blurby.Brain1 confirmed B1–B18 and ruled C1–C3 (2026-11-03). Design 9 is Brain1's binding O4 ruling, with C1's and C3's conditions folded in. No question is open.
  - RodneySr has the canonical clone `C:\Users\estra\Projects\Blurby` with `node_modules`, the sample *Meditations*, and the `c5bb507f` x64 `--dir` package from `repro-base` (or rebuilds it with the same recipe). Rodney has its canonical clone for the arm64 build.
- **Execution host:** RodneySr (x64) for the implementation, the tests, the packages and the probes. Rodney (arm64) only for the rule 53 arm64 launch.
- **Branch:** `eb/cfi-position-consistency-1` at `C:\Users\estra\Projects\Blurby\.worktrees\cfi-position-consistency-1` on RodneySr. Create it with `git -C C:/Users/estra/Projects/Blurby worktree add -b eb/cfi-position-consistency-1 .worktrees/cfi-position-consistency-1 origin/main` after CHAPTER-STEP-CFI-1 merges. Push with `git push origin HEAD:refs/heads/eb/cfi-position-consistency-1`.
- **Done when** (every command in `pwsh` from the worktree root):
  1. **Red first (standing rule 43).** Commit these three files alone, before any source edit, with every row below, Wave C's included. Reach new names only through behaviour, so each file runs on `<base>`. The red commit need not typecheck; step 6 does.

     In the mode file, a helper `openTargetOf(runtime)` returns `runtime.resolveOpenTarget()` when that exists. Otherwise it returns `Promise.resolve({ cfi: runtime.initialCfi, word: null })`, which is what the base's view opens with. A missing name then fails by assertion.
     - `tests/cfiPositionConsistency.ipc.test.js`, over `main/ipc/documents.js` with the harness pattern of `tests/updateDocProgressLastRead.test.js` (copied, not imported or edited):
       - **(ip1)** stored `{ position: 9758, cfi: spine-4 }`, save `(11652, null)`: position 11652, `cfi` absent. **RED** on `<base>`.
       - **(ip2)** save `(9758, null)`: the spine-4 cfi kept. Green control.
       - **(ip3)** save `(11652)` with no cfi: cfi kept. Green control.
       - **(ip4)** save `(11652, spine-5)`: set. Green control.
       - **(ip5)** save `(-1, null)`: neither field changes. Green control.
       - **(ip6)** `electronAPIStub.updateDocProgress` repeats ip1 and ip2. ip1 is **RED**.
     - `tests/cfiPositionConsistency.shell.test.tsx`:
       - **(sh1)** `useLibrary().updateProgress("book", 11652, null)` on a copy at 9758 with a cfi: `cfi` absent. **RED**.
       - **(sh2)** the same at an unchanged position keeps it. Green control.
       - **(sh3, R1)** the tracker with `lastRelocateCfiRef = { docId: "book", cfi: A, wordIndex: 100 }`, then `finishReading(400)`: `updateDocProgress` and `onUpdateProgress` get `null` as the cfi. **RED** (they get `A`).
       - **(sh4)** the same with `wordIndex: 400`: they get `A`. Green control.
     - `tests/readerModes/cfiPositionConsistency.test.ts`, the real router and runtimes over `harness/fakePorts`, with fake timers. Sections are *Meditations*-shaped (`{ sectionIndex: 4, startWordIdx: 9000, endWordIdx: 11652 }`, `{ sectionIndex: 5, startWordIdx: 11652, endWordIdx: 13000 }`). The spine-4 cfi is `epubcfi(/6/10!/4/2)` and the spine-5 cfi `epubcfi(/6/12!/4/2)`. The book opens through `router.openDocument` (Page, `source: null`) unless a row says otherwise.
       - **(cm1), all four mode copies of `createPersistentReadingAnchor`:** with `state.cfi = "cfi:old"`, a persisted `explicit-navigation` commit of 20 with no cfi saves `("doc-1", 20, null)`. **RED** (`"cfi:old"`).
       - **(cm2, R2), Focus, Flow and Narrate:**
         - `navigateTo(11652)`, then `go-to-href` with a stub `goTo` that relocates to the spine-5 cfi, then flush past `LANDING_SETTLE_MS`;
         - fold every `updateDocProgress` into a fake stored doc with ip1's rules;
         - reopen that stored doc through `openDocument`, publish the sections;
         - `openTargetOf` settles to a cfi in the stored position's section, or to the stored word.

         **Green** on `<base>` (CHAPTER-STEP-CFI-1). **RED** on `c5bb507f`: run this file in a scratch worktree at `c5bb507f` and record it as the control. If cm2 is RED on `<base>` in any mode, STOP to Blurby.Brain1 with the trace: CHAPTER-STEP-CFI-1 did not cover that mode.
       - **(ph1) the stale pair:** 11652 with the spine-4 cfi and `bookWords: null`. After the fake document port publishes the sections, the target is `{ cfi: null, word: 11652 }`. **RED** (spine-4).
       - **(ph2) it waits:** in ph1, before the sections are published, the target has not settled after 2,999 ms of fake time. **RED** (the base settles at once).
       - **(ph3) the hold asks for the map at once:** `document.ensureBookWords` is recorded during `openDocument`, before any timer advances. **RED**.
       - **(ph4) the position-only open:** 8723 with `cfi: null`, then sections published: `{ cfi: null, word: 8723 }`. **RED** (`word: null`, the estimate).
       - **(ph5) control, an agreeing pair:** 11652 with the spine-5 cfi, then sections published: `{ cfi: spine-5, word: null }`. Green.
       - **(ph6) failure:** `ensureBookWords` resolves `null`, or resolves a BUG-239 empty book (`sections: []`). The target is today's choice (`{ cfi: spine-4, word: null }`) at once, with no timer advance. Green on the base by the fallback model; it pins the failure path.
       - **(ph7) timeout:** the map never arrives. The target is still pending at 2,999 ms and is today's choice at 3,000 ms. A map published afterwards changes nothing and calls no surface method. **RED** (the base settles at once).
       - **(ph8) controls, no hold:** a word of 0, a non-EPUB document, and Page reached by a handover from Flow (`source` not null) each settle at once with `initialCfi`. Green.
       - **(ph9) no save and no input during the hold:**
         - from `openDocument` until settled, there is no `persistence.updateDocProgress` or `persistence.scheduleRelocateSave`;
         - `handleCommand({ kind: "go-to-href", href: "ch9.xhtml" })` and `jumpBack()` during the hold make no surface call and no save;
         - after settling, `go-to-href` reaches the surface again.

         **RED** (the base reaches the surface).
       - **(ph10) a mode switch during the hold:** `router.select("flow")` before the map arrives settles Page's target with the fallback, and the timer count returns to its value before the open (LL-169). Flow arrives with today's handover. Green on the base by the fallback model, except the timer check, which is **RED**.
       - **(o3a, O3 pin), Narrate:**
         - the words hold a sentence such as `a b c. d e f g.`, and the saved word is `f`;
         - cold open, publish the sections and words, `router.select("narrate")`, Play;
         - the engine's first request starts at `d`, the sentence's first word, read as NARRATE-ARRIVAL-SYNC-1's sp rows read it.

         Expected **green** on `<base>` by code reading (O3 finding). If it is RED, STOP to Blurby.Brain1 with the trace before any Narrate edit.
       - **(o3b) control:** the same, but with a click on `f` in Page before the switch. Play starts at `f`.
       - **Focus saves as you go (O4; Wave C).** Each row opens a book with the map loaded through `openDocument` at word 8723 with the spine-4 cfi, publishes the sections and words, switches with `router.select("focus")`, and plays at 300 words a minute with rhythm pauses off, under `vi.useFakeTimers({ now: 0 })`. Every `persistence.updateDocProgress` is counted and folded into a fake stored doc (`{ position: 8723, cfi: spine-4 }`) with ip1's rules.
         - **(f1) play about 12 s:** after 12,000 ms of fake time there are exactly two saves. Each is `("doc-1", w, null)`, the first at the first advance at least 5,000 ms after the engine started (after `FOCUS_MODE_START_DELAY_MS`) and the second at least 5,000 ms after the first. The last saved word trails the engine's current word at 12,000 ms by no more than `ceil(300 × 5000 / 60000) + 1` (26) words. **RED** (no save).
         - **(f2) pause:** after f1, `pause()` makes exactly one more save, of the engine's current word, with `null`. A second run uses `togglePlay()` for the pause: the same. **RED**.
         - **(f3) paused with the word unchanged:** after f2, 30,000 ms more of fake time, a second `pause()`, then `router.select("page")`: the count stays as it was after f2. Green on `<base>`, where nothing ever saves; it is the guard against repeat saves once f2 is green.
         - **(f4) the stored cfi is null:** after f1, the folded doc has the last saved position and no `cfi`. **RED** (spine-4 kept).
         - **(f5) mode exit while playing:** play 7,000 ms (one save, near 5,000 ms), then `router.select("page")` with no pause: exactly one more save, of the word at the stop, with `null`. Then `router.destroy()`: no further save. **RED**.
         - **(f6) no save without Play:** select Focus, wait 10,000 ms with no Play, then `router.select("page")`: no save from Focus (LL-030). Green control.
         - **(f7) no map, no save:** the same as f1 with `bookWords: null` and the section's words served by the fake surface: no save (B15). Green control.
         - **(f8) no sentence start in Focus:** open at word `f` of `a b c. d e f g.` with no cfi, `router.select("focus")`, Play: the engine's first word is `f`. Expected **green** on `<base>` by code reading (Why). If it is RED, STOP to Blurby.Brain1 with the trace.
         - **(f9, C3) a click while paused wins:** play 3,000 ms, `pause()`, then `hardSelect` word X (any word the paused engine is not on) with the spine-4 cfi, then `router.select("page")`. The folded doc's position is X, and the last `updateDocProgress` is the click's own `("doc-1", X, spine-4)`: the stop made no save. Guard row: green on `<base>`, where the click's save is the last write.
         - **(f10, C1) the exit save is accepted, and nothing saves after teardown:** this file builds the router over its own `createReaderPorts(fake.infra)`, so the broker's `stats` and the fake's `diagnostics` are readable.
           - `READER_PORT_RELEASE_CALLS` contains `"persistence.updateDocProgress"` and `"persistence.updateProgress"`.
           - Play 7,000 ms (one timed save), keep the Focus runtime as `old`, then `router.select("page")` with no pause. There is exactly one more save, of the word at the stop, with `null`. No `port-rejected` diagnostic names a `persistence.` method.
           - Then advance 30,000 ms of fake time, and call `old`'s private `onEngineWordAdvance(w + 5)` through a cast, `w` being the stopped word. No `persistence.*` call is accepted or rejected after the switch: `broker.stats.rejected` has no `persistence.` key, and the effect count is unchanged.
           - **RED** (no exit save, and the list lacks both entries).
         - **(f11, C1) no save on unmount:** play 7,000 ms (one timed save), then `router.destroy()` with no pause. No `persistence.*` call is made: none is accepted, `broker.stats.rejected` has no `persistence.` key, and no `port-rejected` diagnostic names one. Guard row: green on `<base>`.
         - **(f12, Q3 alignment) an engine started before the map never saves:** f7's setup (`bookWords: null`; the fake surface serves the section's words). Play, and at 2,000 ms publish the map through the fake document port.
           - Play to 12,000 ms, `pause()`, `togglePlay()` (a resume of the same engine) and play 12,000 ms more: no save.
           - Then `router.select("page")`, `router.select("focus")` and Play: a new `start()` on the map. f1's cadence holds from there.
           - **RED** (the last part; the base never saves).

     Record every result in the memo. If a row named RED above is green on `<base>`, STOP: its guard cannot fail.
  2. **Wave A as specified.** Then:
     - `git grep -n -F 'options.cfi ?? state.cfi' -- src/reader/modes` exits 1. It exits 0 on `c5bb507f`, with 4 hits (Page `:100`; Focus, Flow and Narrate `:99`).
     - `git grep -c -F 'cfi === null' -- main/ipc/documents.js src/test-harness/electron-api-stub.ts` exits 0, with both paths listed. It exits 1 on `c5bb507f`.
     - `git diff --name-status <base> -- preload.js` prints nothing and exits 0.
     - `git diff --name-status <base> -- docs/planning/roadmap-reviews/reader-mode-separation-2 tests/readerModes/harness` prints nothing and exits 0 (C2: the fixtures and the replay harness are byte-unchanged).
     - `git grep -c -F 'hardSelectionCfiAsRecorded' -- tests/readerModes/flow.behavior.test.tsx tests/readerModes/focus.behavior.test.tsx` exits 0, with both paths listed. It exits 1 on `<base>`.
  3. **Wave B as specified.** Then:
     - `git grep -c -F 'PAGE_OPEN_HOLD_TIMEOUT_MS' -- src/constants.ts src/reader/modes/page/ModeRuntime.ts` exits 0, with both paths listed. It exits 1 on `c5bb507f`.
     - `git grep -c -F 'cfiSpineIndex' -- src/reader/modes/page/helpers/persistentReadingAnchor.ts` exits 0. It exits 1 on `c5bb507f`.
     - `git diff --name-status <base> -- src/reader/modes/focus src/reader/modes/flow src/reader/modes/narrate` lists exactly the three `helpers/usePersistentReadingAnchor.ts` files and exits 0.
  4. **Wave C as specified.** Then:
     - `git grep -c -F 'RSVP_PROGRESS_SAVE_INTERVAL_MS' -- src/reader/modes/focus/ModeRuntime.ts` exits 0. It exits 1 on `c5bb507f`.
     - `git grep -c -F 'updateDocProgress' -- src/reader/modes/focus/ModeRuntime.ts` exits 0. It exits 1 on `c5bb507f`.
     - `git grep -n -E '\b5000\b|5_000' -- src/reader/modes/focus/ModeRuntime.ts` exits 1 (no literal interval). It exits 1 on `c5bb507f` too.
     - `git diff --name-status <base> -- src/reader/modes/focus src/reader/modes/flow src/reader/modes/narrate` lists exactly the three `helpers/usePersistentReadingAnchor.ts` files and `src/reader/modes/focus/ModeRuntime.ts`, and exits 0.
     - `git grep -c -E '"persistence\.update(DocProgress|Progress)"' -- src/reader/ports/createReaderPorts.ts` exits 0 and prints 2. It exits 1 on `<base>`.
     - `git diff <base> -- src/reader/ports/createReaderPorts.ts` shows only the two added list lines (C1: only the list changes).
     - `git grep -n -E 'reason !== "teardown"' -- src/reader/modes/focus/ModeRuntime.ts` exits 0. It exits 1 on `<base>`.
  5. **Tests.**
     - `npx vitest run tests/cfiPositionConsistency.ipc.test.js tests/cfiPositionConsistency.shell.test.tsx tests/readerModes/cfiPositionConsistency.test.ts` exits 0.
     - `npx vitest run tests/readerModes tests/readerModeIsolation.test.ts tests/readerModeOwnership.test.ts tests/useProgressTracker.test.ts tests/keepFurthest.test.tsx tests/pageReopenCfi.test.ts tests/updateDocProgressLastRead.test.js tests/persistentReadingAnchor.test.ts tests/useLibrary.test.ts tests/narrate` exits 0.
     - `tests/readerModes/chapterStepLanding.test.ts` (CHAPTER-STEP-CFI-1), `tests/readerModes/pagePositionSave.test.tsx` and `tests/narrate/narrate.playSavedPosition.test.ts` (NARRATE-ARRIVAL-SYNC-1) are green and unedited.
     - `tests/readerModes/flow.behavior.test.tsx` and `tests/readerModes/focus.behavior.test.tsx` (the B0 replays) are green, edited only as Wave A step 10 lists. `tests/readerModeIsolation.test.ts` is green, edited only as Wave C step 4 lists. `tests/readerModeOwnership.test.ts` is green and unedited.
  6. `npm test`, `npm run typecheck` and `npm run build` exit 0 on RodneySr (standing rules 47 and 48). Record the counts.
  7. **Packaged probes**, on RodneySr x64 `--dir` packages of `c5bb507f`, `<base>` and the tip, all with one recipe (LL-152):
     - Launch each with `--user-data-dir=<scratch>` and `BLURBY_USER_DATA_DIR=<scratch>`.
     - Prove `app.getPath('userData')` over the inspector before the first input, and refuse an inspector port that already answers (LL-165).
     - Hash the live profile's `library.json` and `settings.json` before and after the session: unchanged.
     - Read verdicts from state, never from screenshots (standing rule 55):
       - `library.json`;
       - the saves seen through an `update-doc-progress` hook;
       - the first and last visible word indices at the moment `.rm-page-loading` leaves the DOM (the first thing shown);
       - every `relocate` from launch to 10 s after that moment.
     - Quit through `app.quit()` after detaching every debugger client, except where a probe says to kill.
     - **A kill** is `Stop-Process -Id <the app's main process id> -Force`, with no graceful quit, so the quit flush (`main.js:643`) does not run.
     - **The last word read in Focus** is the `data-word-index` of the word span Focus highlights in the book's frame, sampled every 250 ms over the inspector; the last sample before the kill counts.
     - Save the driver as `docs/studies/investigations/CFI-POSITION-CONSISTENCY-1.driver.mjs.txt` (standing rule 52).
     - **Probes:**
       - **(P1, R2 live):** Page at 8723, one page turn, Flow, "Next chapter", quit within 1 s, read `library.json` after 4 s, reopen.
         - `c5bb507f`: the control is the stale pair (11652 with the spine-4 cfi) and a reopen at 9758–9870. Recorded.
         - `<base>` and the tip: the stored cfi is absent or in the stored position's section, and the first shown range contains the stored position. Record whether the quit came before or after the landing.
       - **(P2, stored stale pair):** seed the scratch `library.json` with position 11652 and the control's spine-4 cfi, reopen, and give no input for 10 s.
         - `<base>`: 9758–9870. **RED**, recorded.
         - The tip: the first shown range contains 11652; no relocate after that moment leaves 11652's section; `library.json` is unchanged.
       - **(P3, position only):** seed position 8723 with no cfi, reopen, and give no input for 10 s.
         - `<base>`: about 9552–9698. **RED**, recorded.
         - The tip: the first shown range contains 8723, and there is no save.
       - **(P4, R1, the real close route):** open at 8723 in Page, switch to Focus, Play for 30 s with no page turn, pause, then press Escape twice as native key events (Why: the first returns to Page, the second runs the close save). Wait 4 s, read `library.json`, reopen.
         - Record whether the backtrack prompt appeared; P4 reads forward, so it should not. If it does, record it and dismiss it with "stay".
         - The tip: the stored pair agrees (no cfi, or a cfi in the stored position's section), the stored position is the paused word, and the first shown range contains it.
         - `<base>`: the control, recorded. There, the close save is Focus's only save (Why).
       - **(P7, O4, kill while playing):** open at 8723, switch to Focus, Play at 300 words a minute for about 12 s with no input, then kill. Read `library.json` 4 s later and reopen.
         - The tip: the stored position is at or behind the last word read, by no more than `ceil(300 / 10)` (30) words: one interval, main's 500 ms debounce and one word. There is no stored cfi. The save hook saw two saves, each with a `null` cfi. The reopen's first shown range contains the stored position.
         - `<base>`: the control. The stored pair is still 8723 and its cfi, and the hook saw no save. Recorded.
       - **(P8, O4, pause, then reopen):** open at 8723, switch to Focus, Play for about 8 s, pause, wait 10 s with no input, then kill and reopen.
         - The tip: the hook saw exactly one save after the pause, of the paused word, and none in the 10 s after it. The stored position is the paused word, with no cfi. The reopen's first shown range contains it.
         - Then switch to Focus and Play: the first word Focus shows is the paused word itself, not its sentence's first word (row f8).
         - `<base>`: the control, recorded.
       - **(P5, the hold's cost):** five cold opens of *Meditations* at 8723 with its cfi, on `<base>` and on the tip, each a fresh launch on the same scratch profile. For each open record:
         - the time from the open IPC to `.rm-page-loading` leaving the DOM;
         - the time from the `extract-epub-words` request to its reply;
         - whether the timeout fired.

         Report the median and maximum per build and the tip's added wait (tip median minus base median). A timeout on the tip goes to Blurby.Brain1 with the numbers (question B9).
       - **(P6, O3):** pick a word in *Meditations* that is not the first word of its sentence. Use the extracted words and `sentenceStartAt`'s rule, and record both indices. Seed it with no cfi, reopen, switch to Narrate as soon as `.rm-page-loading` is gone, and press Play. The first request word is the sentence's first word on the tip. Record `<base>`'s result too, as the control for the hold's effect.
  8. **Rule 53 pair:**
     - on RodneySr, the tip's x64 `--dir` package with `origin/main` merged in;
     - on Rodney, an `--arm64 --dir` package of the same commit and a 25 s native-arm64 scratch-profile launch with no error or crash;
     - `npx asar list` checked against `dist/` on both;
     - P1–P8 re-run on the packaged exe;
     - a "Package verification" section in the close-out;
     - Blurby.Brain1's confirmation before the merge go.
  9. **Fence (standing rule 41).** `git diff --name-status <base>` lists exactly the following, plus `docs/studies/investigations/CFI-POSITION-CONSISTENCY-1.*`, the governance staging memo and the time log:
     - `M main/ipc/documents.js`
     - `M src/test-harness/electron-api-stub.ts`
     - `M src/types.ts`
     - `M src/components/ReaderContainer.tsx`
     - `M src/constants.ts`
     - `M src/reader/ports/ReaderPorts.ts`
     - `M src/reader/ports/createReaderPorts.ts` (Wave C, C1)
     - `M src/hooks/useLibrary.ts`
     - `M src/hooks/useProgressTracker.ts`
     - `M src/reader/modes/page/helpers/usePersistentReadingAnchor.ts`
     - `M src/reader/modes/focus/helpers/usePersistentReadingAnchor.ts`
     - `M src/reader/modes/flow/helpers/usePersistentReadingAnchor.ts`
     - `M src/reader/modes/narrate/helpers/usePersistentReadingAnchor.ts`
     - `M src/reader/modes/focus/ModeRuntime.ts`
     - `M src/reader/modes/page/helpers/persistentReadingAnchor.ts`
     - `M src/reader/modes/page/ModeRuntime.ts`
     - `M src/reader/modes/page/useModeBindings.ts`
     - `M src/reader/modes/page/FoliateView.tsx`
     - `M tests/useProgressTracker.test.ts`
     - `M tests/readerModes/flow.behavior.test.tsx` (Wave A, C2)
     - `M tests/readerModes/focus.behavior.test.tsx` (Wave A, C2)
     - `M tests/readerModeIsolation.test.ts` (Wave C, C1)
     - `A tests/cfiPositionConsistency.ipc.test.js`
     - `A tests/cfiPositionConsistency.shell.test.tsx`
     - `A tests/readerModes/cfiPositionConsistency.test.ts`

     Nothing in `preload.js`, `src/utils/FlowScrollEngine.ts`, `src/styles/`, any `mode.css`, Focus's view or bindings, Flow's or Narrate's runtime, view or bindings, `surface.ts`, `ReaderModeAdapter.ts`, `src/reader/useReaderModeOrchestrator.ts`, `src/App.tsx`, `src/hooks/useReader.ts`, `tests/readerModes/harness/` or `docs/planning/roadmap-reviews/reader-mode-separation-2/`.
  10. **Merge-tree check:** `git merge-tree` of the tip against `origin/main` is clean at the merge go. A conflict in a fenced file goes to Blurby.Roadmap before resolution.
  11. **Owner, added to gate (2)'s list:**
      - after a chapter jump, quit and reopen: the book opens in the jumped-to chapter;
      - a book that had only a saved word opens at that word, after "Loading book..." and with no jump;
      - Narrate after a reopen starts at the saved word's sentence;
      - read in Focus for a while, then close the app any way at all: the book reopens within a few seconds' reading of where Focus was;
      - pause in Focus and reopen: the book opens at the paused word.
- **Effort:** M, in four waves (A, B, C, D; each about 40 tool uses or fewer, and each its own dispatch). Technical effort: medium for A, C and D, high for B.
- **Owners:**
  - Blurby.Brain1 ruled B1–B18 and C1–C3, and confirms the rule 53 pair;
  - RodneySr implements, tests and probes; Rodney runs the arm64 launch;
  - spec-compliance, then quality review;
  - Blurby.Roadmap grants the integration window, gives the merge go and closes it out.
- **Merge order:**
  - after NARRATE-ARRIVAL-SYNC-1, gate (1) run 6 and CHAPTER-STEP-CFI-1;
  - before FLOW-TOC-JUMP-WORD-1 (Seq 110), FURTHEST-PERSIST-1 (Seq 114; `main/ipc/documents.js`, `src/hooks/useLibrary.ts`, `src/types.ts`) and FOCUS-PAUSED-HANDOFF-1 (Seq 118). Each re-greps after this lands.
  - Any later item that edits `src/reader/modes/page/FoliateView.tsx` or `page/ModeRuntime.ts` re-greps the hold's lines. Any later item that edits `focus/ModeRuntime.ts` (FOCUS-PAUSED-HANDOFF-1 among them) re-greps `saveProgressWord` and keeps its calls in `pause()`, `togglePlay()`, `stop()` (after `stopEngine()`, not on `"teardown"`) and `commitShared`.
  - FLOW-SAVE-AS-YOU-GO-1 (Seq 97.6) and NARRATE-SAVE-AS-YOU-GO-1 (Seq 97.7) rely on Wave C's release list and make no broker edit. Any later item that edits `src/reader/ports/createReaderPorts.ts` keeps both entries.
  - TOC-FRAGMENT-WORD-1's `ReaderContainer.tsx` window does not overlap this one.
  - The Focus, Flow and Narrate restamp items (Seq 111–112) edit only their own `FoliateView.tsx`, so they do not conflict.
- **Path:** dispatch (four waves).

##### Owner rulings (2026-11-03)
- **O1 — "At the saved word" (option A).** When the stored page does not hold the saved word, or there is no stored page, the book opens on the saved word, where "jump back to my place" lands in Page. In this spec that is design 5: Page's view opens the word's section and lands with `jumpFoliateToWordAnchor`, the jump-back helper.
- **O2 — "Wait before showing" (option B).** The cold open shows the existing "Loading book..." state until the word map is ready, then opens right on the word, with no visible jump, at the cost of a wait of about 1–2 s on a cold open. In this spec that is design 4, the hold in Page. The late "open settle" of the first draft is removed. After a failure or a timeout the book opens with today's choice, and a map that arrives later moves nothing.
- **O3 — "Also, on narrate, the start should be the start of the sentence from the saved word on restart".** When Narrate is reached after a reopen or restart at a saved word, the view is on that word (O1, after O2's hold), and Play starts at the first word of the sentence that holds it, not at the word itself. In this spec it is already met on the normal path (O3 finding); rows o3a and o3b and probe P6 pin it, and question B13 covers the edges.
- **O4 — "Save as you go".** Focus saves the current word every few seconds while it plays, and when it is paused. In this spec that is design 9 and Wave C, shaped by Blurby.Brain1's binding rulings below.

##### Blurby.Brain1 rulings on O4 (2026-11-03, binding)
Brain1's RodneySr idle checks (Update of 2026-11-03 to `Brain1.CFI-POSITION-CONSISTENCY-1.2026-11-03.md`) established three facts. Focus Play is not a regression and no longer blocks P4. R1 is still unexercised, so the spec names the reader's real close route from Focus before R1 counts as a red row (Why: Escape twice; probe P4). And Focus saves nothing while it plays or is paused (Why). Brain1 then ruled the shape of O4:
- **R-O4.1, cadence.** Save every 5 s while Focus plays, and once more on pause, stop and mode exit; only when the word has changed since the last save. The 5 s is a named constant in `src/constants.ts`, never a literal. That bounds a reopen to about 20–40 words behind at typical speeds. Sentence-start resume does not apply in Focus: Focus resumes at the saved word. Applied in design 9, Wave C, rows f1–f3, f5 and f8, probes P7 and P8, and the Done-when 4 gate on literals.
- **R-O4.2, cfi.** Focus saves send an explicit `null`, never `state.cfi`. A Focus save on a changed word therefore clears the stored cfi, and B1's rule stays consistent. Applied in design 9 and rows f1 and f4.
- **R-O4.3, write cost.** Trace `updateDocProgress` in main and decide between making LIBRARY-WRITE-RACE-3 a prerequisite or routing through an existing debounced path; the 5 s cadence must not reopen the library write race. Traced under "Write cost of a save"; decided under "LIBRARY-WRITE-RACE-3 and O4": route through the existing debounced `update-doc-progress` and `saveLibrary` path, with no prerequisite.
- **R-O4.4, rows.** Play about 12 s, kill with no graceful quit, reopen within one interval of the last word read (row f1, probe P7). Pause, then reopen at the paused word (row f2, probe P8). No save while paused with the word unchanged, with writes counted (row f3, probe P8). The stored cfi is null after a Focus save (row f4, probe P7).
- **R-O4.5, Flow and Narrate.** A finding only, not changed here (Flow and Narrate finding).

##### Blurby.Brain1 rulings on B1–B18 (2026-11-03, binding)
Blurby.Brain1 adopted B1–B18 as recommended (on spec `e0512b0f`), with three conditions:
- **B3, pinned rows.** The two `tests/useProgressTracker.test.ts` rows change from `undefined` to `null` as a named exception to standing rule 50. Only the expected cfi value changes; the rest of each row stays byte-identical, and the memo quotes before and after (Wave A step 9).
- **B5, integration window.** `src/types.ts` (one line) and `src/components/ReaderContainer.tsx` (the bridge and the relocate ref) are granted from Wave A's cut to its merge, only if no other active item holds the shared-core freeze set at the cut.
  - On 2026-11-03 none does. BLOCK-TEXT-ORDER-1, NARRATE-ARRIVAL-SYNC-1 and the restamp items stay out of it.
  - TOC-FRAGMENT-WORD-1 needs its own later window and must not overlap.
  - Blurby.Roadmap records the window in ROADMAP.md's integration-window line when Wave A is dispatched.
- **B11, mode switch during the hold.** Accepted. A switch during the open hold carries the stored cfi into Focus or Flow, and neither corrects the section the way Narrate's arrival sync does. After Wave A no new stale pairs are written, so this matters only for pairs stored before the fix. Logged as Findings F-019.

Everything else stands as recommended:
- B6 and B13 are findings: F-020, and F-021 for WORD-INDEX-UNIFY-1.
- B7 keeps Seq 97.5.
- B9's `PAGE_OPEN_HOLD_TIMEOUT_MS = 3000` is revisited only if P5's tip maximum exceeds 2000 ms.
- B12's extraction cache follow-up is registered only if P5's median exceeds 1000 ms.
- B17: `tests/keepFurthest.test.tsx` stays green and unedited, or STOP to Blurby.Brain1.

B14–B18 are also ruled as general rules G1–G8 for every playback mode. They apply here to Focus, and to FLOW-SAVE-AS-YOU-GO-1 and NARRATE-SAVE-AS-YOU-GO-1.

**Queue:** Waves A–D go behind BLOCK-TEXT-ORDER-1's Waves A and B, and after CHAPTER-STEP-CFI-1 merges.

##### Blurby.Brain1 rulings on C1–C3 (2026-11-03, binding)
- **C1, accepted with one condition.** Wave C adds `persistence.updateDocProgress` and `persistence.updateProgress` to `READER_PORT_RELEASE_CALLS` (`src/reader/ports/createReaderPorts.ts:46-49`), once, for all three playback modes. The isolation rows that pin the list get a named exception to standing rule 50, and only the list entry changes.
  - **Condition:** the exit save is made synchronously inside the mode's `stop()`, during `broker.teardown`, after every save timer has been cleared. Nothing asynchronous may save after release.
  - **Required row:** a timed-save callback that fires after teardown makes no persistence call.
  - **Broker check (done for this ruling).** The release allowance does not outlive the teardown frame. `teardown` sets `releasing` only around `run()`, and its `finally` clears it and deletes the key (`createReaderPorts.ts:189-200`). A release call passes only while `releasing === id` (`:109-110`). So the row passes for two reasons, the broker and the cleared timers, and it asserts that no call is even attempted. No STOP.
  - **Applied in:** design 9 ("The exit save runs inside the teardown window"); Wave C steps 2 (`stop()`), 3 (the list) and 4 (the pinned rows: `tests/readerModeIsolation.test.ts`, "lets teardown run only release-class calls, then closes the key", "transitions in order: export, invalidate, teardown(stop, destroy), issue, create, select" and "openDocument starts a new generation and releases the old session inside a teardown window"); rows f5, f10 and f11; Done-when 4, 5 and 9.
  - **Derived from the condition:** `router.destroy()` has no teardown window (`closeAll(false)`, `useReaderModeOrchestrator.ts:312-326`). So Focus's `stop()` skips the exit save when its reason is `"teardown"` rather than make a call the broker must reject (row f11).
- **C2, accepted.** `tests/readerModes/flow.behavior.test.tsx` and `focus.behavior.test.tsx` treat `"<undefined>"` and `null` as equal for exactly one argument: the third argument of the hard-selection `persistence.updateDocProgress`. This is under a named rule-50 exception. The review-record fixtures under `docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/` stay byte-unchanged, and every other argument still compares exactly. Applied in Wave A step 10, Done-when 2, 5 and 9.
- **C3, accepted.** Focus's stop save records the committed word (a click while paused wins over the engine's older word), and it is skipped when that word is unchanged. Applied in design 9 ("Which word", "The last word saved"), Wave C step 2 (`stop()`, `commitShared`) and row f9 (pause, click word X, stop: the stored word is X).
- **Carried from FLOW- and NARRATE-SAVE-AS-YOU-GO-1's rulings:**
  - **Q2 (re-save after a pending relocate save):** ruled for Flow and Narrate. Focus has a relocate save (`focus/ModeRuntime.ts:903`), but its view does not relocate while it plays, so the case is narrow and Focus is unchanged (design 9; a findings candidate).
  - **Q3 (the engine's word space):** B15's guard is aligned to read the running engine's start, as `engineOnBookWords` (design 9, Wave C step 2, row f12).

##### Open after the B-rulings (C1–C3; ruled 2026-11-03; kept as the record)
- **C1. The mode-exit save is refused.** The router stops the outgoing mode inside `broker.teardown` (`src/reader/useReaderModeOrchestrator.ts:303-307` at `14ce3d24`). Only `READER_PORT_RELEASE_CALLS` pass there (`src/reader/ports/createReaderPorts.ts:46-49`): `settings.update{isNarrating}` and `diagnostics.*`. Wave C's mode-exit save (R-O4.1, row f5) is therefore rejected. Recommendation: Wave C adds `persistence.updateDocProgress` and `persistence.updateProgress` to the release calls, once for all three playback modes, with the isolation rows that pin the list named as a rule-50 exception. Fallback: no save on mode exit, and f5 is dropped.
- **C2. Wave A changes the B0 replay baselines.** `docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/{flow,focus}.baseline.json` record the hard-selection commit's `persistence.updateDocProgress` third argument as `"<undefined>"`. Under B2 (`options.cfi || null`) it becomes `null`, so `tests/readerModes/{flow,focus}.behavior.test.tsx` fail byte-for-byte replay. Those fixtures sit in a review-record folder. Recommendation: do not rewrite the fixtures; the two replay tests normalize that one argument (`"<undefined>"` and `null` compare equal for `persistence.updateDocProgress` argument 3 only), named as a rule-50 exception. The alternative is a dated baseline copy under the item's own folder.
- **C3. Focus's stop save can overwrite a paused click.** Wave C saves on stop when an engine exists. A click while paused commits the clicked word, and a later stop then saves the engine's older word. Recommendation: the stop save records the mode's current committed word, not the engine's last word, and is skipped when the word equals the last save (G2).

##### Questions for Blurby.Brain1 (ruled 2026-11-03; kept as the record)
- **B1. The `null` meaning.** Main clears the stored cfi on `null` only when the position changes; an unchanged position keeps the pair. `undefined` keeps, a string sets, and `-1` ignores `null`. Recommendation: confirm. A plain clear would also drop Page's correct turn cfi on every close with no matching relocate.
- **B2. The anchor rule.** A persisted commit sends `options.cfi || null` in all four copies, never `state.cfi`, and an empty string counts as unknown. Recommendation: confirm.
- **B3. The R1 rule.** The close save uses the last relocate's cfi only when it is in this book and its recorded word is unknown or equal to the saved word; otherwise `null`. This changes two pinned rows in `tests/useProgressTracker.test.ts` from `undefined` to `null`, named here under standing rule 50. Recommendation: confirm.
- **B4. The reopen check never saves.** The hold chooses what to show; the stale pair stays stored until the reader's next real save. Recommendation: confirm, per LL-030.
- **B5. The integration window** for `src/types.ts` (one line) and `src/components/ReaderContainer.tsx` (the bridge and the relocate ref), Wave A only. Recommendation: grant it from the cut to the merge.
- **B6. The standalone reader window** (`src/App.tsx:76`, `src/hooks/useReader.ts:180`) saves a position with no cfi, from tokenized text whose numbering may not match the EPUB's. Recommendation: leave it out of this item and register a finding, because its word numbering is the deeper question.
- **B7. Placement.** This spec keeps Seq 97.5, directly after CHAPTER-STEP-CFI-1. Recommendation: confirm. Wave A could run as soon as CHAPTER-STEP-CFI-1 merges.
- **B8. Where the hold lives.** Page only. A cold open always mounts Page (`useReaderModeOrchestrator.ts:340`), so Focus, Flow and Narrate never see `source: null`. Page's runtime owns the target promise and its timers, so the choice is unit-tested over `fakePorts`. Page's view awaits it before `view.init`, behind the existing "Loading book..." overlay; foliate renders nothing before `init`. Recommendation: confirm. Holding in each view instead would put the cfi check where the tests cannot reach it, and copy it into three views that never cold-open.
- **B9. The timeout:** `PAGE_OPEN_HOLD_TIMEOUT_MS = 3000`, in `src/constants.ts` beside `FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS`, per the Constants Separation Rule. Page already imports that file. CHAPTER-STEP-CFI-1 instead keeps its timing constants in each `ModeRuntime.ts`.
  - **Rationale:** the hold now asks for the map at open instead of after the shell's 1000/2000 ms delay. The book's own parse in the view runs at the same time, so the added wait is extraction minus parse.
  - 3000 ms covers the owner's stated 1–2 s with margin. Beyond it, a blank "Loading book..." stops looking like loading and starts looking broken.
  - P5 measures it on the sample. Recommendation: 3000 ms in `src/constants.ts`, revisited if P5's tip maximum exceeds 2000 ms.
- **B10. Failure fallback.** A `null` map, a rejection, a BUG-239 empty book (`sections: []`), a timeout or a `stop()` all open with today's choice (the stored cfi, else the `goToFraction` estimate) at once. A map that arrives after a timeout moves nothing. Recommendation: confirm. It is the only fallback that keeps O2's "no visible jump", and it is exactly today's behaviour.
- **B11. Input during the hold.** It is ignored, not blocked:
  - nothing is rendered, so the page has nothing to click and its keys are not yet bound;
  - Page's `handleCommand` and `jumpBack` return at once while pending, so a contents jump can't arm a landing that races the open;
  - a mode switch is allowed, because blocking it needs the shell, which is shared core. It ends the hold with the fallback, and the receiving mode's handover is today's. That handover can carry a stale cfi: Narrate's arrival sync corrects the section, and Focus and Flow do not.

  Recommendation: accept. A switch within the first second or two of an open is rare, and B13 records its Narrate effect.
- **B12. Skipping the hold.** The map is never ready at a cold open today: there is no cache in main, and the renderer's cache is per shell. A main-process extraction cache, keyed by file and modification time, would remove most of the wait. Recommendation: not in this item. Register it as a follow-up only if P5's tip median exceeds 1000 ms.
- **B13. O3's edges.** Narrate's Play without the map (after a hold that failed or timed out, or a mode switch during the hold) starts at the first visible word (`narrate/ModeRuntime.ts:316-320`), not the sentence start. A BUG-239 book has no sentence data at all. Recommendation: no Narrate change here; record it as a finding and fold it into WORD-INDEX-UNIFY-1, which already owns how a missing map is handled.

Questions B14–B18 are what O4 leaves open after Brain1's binding rulings. Each needs Brain1's confirmation before Wave C.
- **B14. Which constant.** `src/constants.ts:168` already holds `RSVP_PROGRESS_SAVE_INTERVAL_MS = 5000`, commented "How often to save progress during RSVP/Focus mode playback", with no user since `3dd4b504`. Wave C reuses it and only rewrites its comment, rather than adding a second constant with the same meaning. `RSVP_PROGRESS_SAVE_WORD_DELTA` (`:170`, 50 words) stays unused, because R-O4.1 is time-only. Recommendation: reuse it, and register the unused word-delta constant as a finding for removal, not a drive-by edit here.
- **B15. Saves without the word map.** On an EPUB without the map, Focus plays the loaded section's own word list (`effectiveWords`, `focus/ModeRuntime.ts`, falling back to `surface.getWords()`), whose indices this spec has not proven to be the book's. Wave C saves only while `document.bookWords` is loaded, or off EPUB. With O2's hold the map is normally loaded before Focus can be reached, so this skips only the failure and timeout edges (row f7). Recommendation: confirm. Saving an index from the wrong space would write a wrong position, which is worse than saving nothing.
- **B16. The crash window.** Main coalesces library writes over 500 ms (`LIBRARY_SAVE_DEBOUNCE_MS`). A kill inside that window loses the newest save, so the stored word can trail the word read by up to one interval plus 500 ms plus one word: 30 words at 300 words a minute, which is P7's bound. Recommendation: accept. Calling `saveLibraryNow` on each Focus save would bypass the coalescing that keeps the write rate bounded, for half a second of reading.
- **B17. The furthest mark.** Each Focus save goes through the bridge's `noteHighWater` (`ReaderContainer.tsx:315`), so it raises keep-at-furthest's mark, with a `null` furthest cfi. Today Focus never raises it. Recommendation: accept. The mark should be the furthest word read, and a `null` furthest cfi means "unknown" under design 1, so it cannot pair the furthest word with a stale page. Wave D's `tests/keepFurthest.test.tsx` run (Done-when 5) must stay green and unedited; a failure there is a STOP to Blurby.Brain1.
- **B18. The sync queue.** Each save with a position also enqueues `update-progress`, and `saveQueue` rewrites the whole `sync-queue.json` with no debounce (`main/sync-queue.js:53-56`, `:169-182`): 12 writes a minute while Focus plays. Sync is off until BLURBY-SERVER-1. Recommendation: accept here, and register a finding that BLURBY-SERVER-1 coalesce `update-progress` per document before sync is on for anyone.

##### Lessons applied
- **LL-029:** the open check compares section and word indices, never live ranges.
- **LL-030:** the hold and its word landing never save; nothing saves without engagement. Focus saves only after Play has run the engine (row f6).
- **LL-142:** the stale pair is measured on the `c5bb507f` control before the fix is trusted, and P2, P3 and P5 record the base.
- **LL-143:** every gate names its shell and an exact exit code, and each was dry-run on `c5bb507f` (expected exit recorded beside it).
- **LL-152:** one recipe for the probes on `c5bb507f`, `<base>` and the tip.
- **LL-165:** the scratch profile is proved before the first input, and the live profile's hashes are unchanged.
- **LL-169:** the hold's timer and promise end with the runtime (`stop()`, `destroy()`), and the view checks `cancelled` after each await, separately from the target's own settle-once guard. Focus's saves as you go add no timer: the interval is checked on each word advance. `stop()` saves once, synchronously, after `clearTimers()` and `stopEngine()`, inside the teardown window (C1). Row f10 proves nothing it left behind saves afterwards.
- **LL-109:** no continuation saves after release. The exit save is synchronous inside `broker.teardown`, and the broker rejects anything later (row f10).
- **Standing rule 55 (promoted from LL-166):** verdicts come from saves, `library.json`, visible word indices and request words, not screenshots.
- **Standing rule 53 (promoted from LL-167):** package verification, with Blurby.Brain1's confirmation before the merge go.
