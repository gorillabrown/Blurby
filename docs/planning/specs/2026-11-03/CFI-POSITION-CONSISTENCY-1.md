#### CFI-POSITION-CONSISTENCY-1 — A saved word and its saved page never disagree, so a book reopens where you left it *(Seq 97.5; Full Spec 2026-11-03, revised the same day for the owner's rulings O1–O4 and Blurby.Brain1's O4 rulings; B1–B18 adopted by Blurby.Brain1 2026-11-03; C1–C3 ruled 2026-11-03; close row added 2026-11-03; STOP-CLOSE ruled (A) 2026-11-03 with owner ruling O6, folded into Wave C for all three playback modes; STOP-LAND-focus and STOP-PAGE-BUTTON ruled (a) 2026-11-03 and folded into Wave C (steps 6 and 7) on 2026-11-04; dispatch-ready on its prerequisites; cited against `origin/main` `c5bb507f`, with every file Waves A and C add for C1–C3 re-checked unchanged at `14ce3d24`, and O6's lines cited at `14ce3d24`; Reader Engine; Blurby.Brain1 finding and ruling of 2026-11-03; serialized after CHAPTER-STEP-CFI-1 (Seq 97); needs a shared-core integration window; not a release gate)*

- **What:**
  - Every save that writes a word (the position) also writes the page of that word (the cfi), or clears the stored cfi.
  - A cold open of an EPUB at a saved word waits, behind the existing "Loading book..." state, until the book's word map is ready. It then opens straight on the saved page if that page holds the saved word, and otherwise on the saved word itself. There is no visible jump afterwards.
  - Narrate, reopened at a saved word, starts Play at the first word of that word's sentence.
  - Focus saves the word as you read (O4): every 5 s while it plays, and once more on pause, stop and mode exit, each time only if the word has changed since its last save. Each Focus save sends an explicit `null` cfi, so the stored page is cleared and the pair never disagrees. Focus has no sentence-start rule: it resumes at the saved word itself.
  - **"Where I stopped" (O6).** Leaving Focus, Flow or Narrate with Escape hands Page the mode's committed playback word, so Page's close save writes it and the book reopens there. Each runtime's `exportHandoff("persistent")` reports that word (Blurby.Brain1 option (A)): Focus its displayed word, Flow its reading cursor, Narrate its last published cursor. All three are the runtime's `canonicalWordIndex` (design 10).
  - **Whatever the control (STOP-PAGE-BUTTON (a)).** Leaving with the bottom bar's Page button (`"capture-current"`) hands over the same word, so the close save after it stores where reading stopped too (design 10).
  - **Page shows the stopped word's page (STOP-LAND-focus (a)).** On every arrival from another mode, Page's view moves to the handed-over word with `jumpFoliateToWordAnchor`, as "jump back to my place" does, so the page shown holds the highlight. The move saves nothing (design 11).
  - **Out of scope:**
    - CHAPTER-STEP-CFI-1's landing save itself (Seq 97). This item builds on it.
    - Contents entries that point inside a section (TOC-FRAGMENT-WORD-1) and Flow's cursor after a jump (FLOW-TOC-JUMP-WORD-1).
    - Mode handovers (`handoff.source != null`), including Narrate's `arrivalSyncOwed` (NARRATE-ARRIVAL-SYNC-1). They are unchanged. The hold is cold-open only.
    - Focus, Flow and Narrate views. A cold open always mounts Page (`src/reader/useReaderModeOrchestrator.ts:336-341`), so only Page's view holds. Focus's runtime is in scope for O4 and O6 (Wave C). Flow's and Narrate's runtimes are in scope for O6's one export line only (Wave C step 6).
    - Flow's and Narrate's saves during play. They are FLOW-SAVE-AS-YOU-GO-1 and NARRATE-SAVE-AS-YOU-GO-1, not changed here.
    - The router (`src/reader/useReaderModeOrchestrator.ts`), including `exitToPage`'s highlight adjust (`:354-357`). Ruling (A) needs no router, orchestrator or shared-core edit.
    - Page beyond its arrival branch (design 11), except one view method and its surface pass-through for the uncertified hold. `ModeState.ts` does not change.
    - Page's arrival highlight painted by span index in an uncertified section (F-026; UNCERTIFIED-ANCHOR-HOLD-1).
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
    - Focus Play for about 12 s, then the reader closes the book the normal way (Escape twice). The stored word is not older than the last timed save. At `14ce3d24` the close save writes an older word; Wave C step 6 fixes it (STOP-CLOSE ruled (A)).
    - **O6:** start Focus, Flow or Narrate at word 8723, read on, and press Escape. Page holds the word reading stopped at, and the second Escape stores it, so the book reopens there. With no reading since the mode was entered, the entry word is handed over, as today. A click while paused hands over the clicked word.
    - **STOP-LAND-focus (a):** after the first Escape, Page's view shows the stopped word's page with the highlight on screen, in all three modes. A brief view of the handed-over cfi's page before the jump is accepted (Brain1), as with "jump back to my place" today. A page turn right after the landing saves the page after the stopped word's page.
    - **STOP-PAGE-BUTTON (a):** read on, press the bottom bar's Page button, then Escape: Page lands at the stopped word and the book reopens there, in all three modes. With no reading since the mode was entered, the Page button hands over the entry word.
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
    - **The close save's word does not follow Focus's displayed word** (traced at `14ce3d24`, 2026-11-03; STOP-CLOSE-focus, ruled (A) below; rows f13 and f14):
      - `finishReading(exitAnchor)` in Page writes `exitAnchor = canonicalWordAnchor` (`ReaderContainer.tsx:615`, `:625-626`), the router snapshot's `currentWordIndex` (`:437`), which is the active runtime's `publishedWordIndex` (`useReaderModeOrchestrator.ts:258`). `_persistAndLog` writes it (`useProgressTracker.ts:243-259`, `:296-299`), and main sets it with no forward-only check (`main/ipc/documents.js:22-23`).
      - The first Escape's `router.exitToPage()` hands Page `exportHandoff("persistent")` (`focus/ModeRuntime.ts:663-681`) with `highlightedWordIndex` replaced by `publishedWordIndex` (`useReaderModeOrchestrator.ts:354-357`). Page copies `publishedWordIndex` (`page/ModeState.ts:33`).
      - Focus's displayed word never moves `publishedWordIndex`. Each advance commits with `persist: false, publishState: false` (`focus/ModeRuntime.ts:1053-1058`), and the anchor helper writes `publishedWordIndex` only when `publishState` is true (`focus/helpers/usePersistentReadingAnchor.ts:85-88`). `pause()` and `togglePlay()`'s pause branch only publish the highlight (`captureCurrentAnchor`, `:1140-1142`; `publishHighlight`, `:1214-1217`).
      - So `finalPos` is the word Focus was entered at (`syncVisualToPersistentWord` on select, `:510`, and two frames later, `:1152`), or the last click, navigation or jump back. Wave C's timed save writes W, and the close then overwrites it with that older word. The useProgressTracker parameter `wordIndex` (`ReaderContainer.tsx:443`, Focus's `currentWordIndex`) feeds only the non-EPUB save and "Save at current" (`useProgressTracker.ts:114`, `:224-240`, `:326-330`), not the close.
      - This also bears on probe P4's tip expectation ("the stored position is the paused word"): by this trace the close writes the select-time word 8723, unless the backtrack prompt shows.
      - Flow and Narrate share the defect. Their advances commit with `publishState: false` too (Flow `flow/ModeRuntime.ts:1316-1321`; Narrate `narrate/ModeRuntime.ts:732`), and their `exportHandoff` hands over `s.publishedWordIndex` (Flow `:836`, in `:827-845`; Narrate `:422`, in `:414-430`). It exists today, without any save as you go.
    - **Each runtime's committed playback word is its `canonicalWordIndex`** (traced at `14ce3d24`; design 10):
      - In Focus, Flow and Narrate, only the anchor helper writes `canonicalWordIndex` after construction (`writeRefs`, `helpers/usePersistentReadingAnchor.ts:60` in each). No runtime assigns it directly.
      - Every helper path that writes it also writes `publishedWordIndex`: a commit with `publishState` (`:85-88`) and `syncVisualToPersistentWord` (`:107-110`). The one exception is the mode-advance commit, which each runtime makes with `publishState: false`: Focus `focus/ModeRuntime.ts:1053-1058`, Flow `flow/ModeRuntime.ts:1316-1321`, Narrate `narrate/ModeRuntime.ts:732`.
      - So `canonicalWordIndex` equals `publishedWordIndex` until playback advances, and after that it is the last advanced word. Today's handover already carries it as `canonicalWordIndex` (Focus `:671`, Flow `:835`, Narrate `:421`), and Page selects it (`useReaderModeOrchestrator.ts:289`; `page/ModeState.ts:43`). Only `publishedWordIndex`, the word the close save writes, lags.
      - **Focus:** the advance commits the word it has just displayed (`jumpDisplayToWord(idx)`, `:1041`, then the commit). A paused engine's `getCurrentWord()` is that word (`FocusMode`, `:121-123`; its timer advances the word and then calls `onWordAdvance`, `:204-208`).
      - **Flow:** the advance commits the word timer's word, the reading cursor, including the held word during a section hand-off or page-turn wait (FLOW-SAVE-AS-YOU-GO-1, Why).
      - **Narrate:** `onEngineCursor` commits each word the engine publishes (`:722-734`). The engine publishes only from `tick()`, at the heard sample, through the exact word table (`narrateEngine.ts:333-348`). So the word is the last published cursor, never a timer read: it holds through silence (R6) and a pause, and a restart (`play()` drops every chunk, `narrateEngine.ts:534-537`) publishes nothing until the new audio sounds.
      - **A click while paused** commits through `commitShared` with `publishState: true` (Focus `:1202-1211`, Flow `:1594-1603`, Narrate `:899-903`), and no paused engine moves (Focus `:735`, Flow `:905-908`, Narrate `:475-477`). So the reported word is the clicked word.
      - **Why not `currentWordIndex`:** before an engine exists, Focus's key moves (`moveReadingWord`, `:847-859`) and each mode's `jumpToWord` when it does not reach the engine (Focus `:652-661`, Flow `:816-825`, Narrate `:405-412`) move `currentWordIndex` without a commit. Reporting it would hand over an uncommitted word with no playback since entry.
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
  8. **Mode isolation.** Each mode's anchor helper is edited in its own copy (Wave A). The hold lives in Page's own files only (Wave B). Focus's saves as you go live in `focus/ModeRuntime.ts` only (Wave C). O6's hand-off changes one line in each playback runtime's own `exportHandoff`, one runtime per commit (Wave C step 6). Wave C also adds two entries to the port broker's release list (`src/reader/ports/createReaderPorts.ts:46-49`), once for all three playback modes (C1). That file is not in the shared-core freeze set, but it is every mode's broker, so it is named in Wave C's steps and the fence. No sibling import, no shared mutable store, no new shared module. `src/constants.ts` is the shared constants file Page and Focus already import (`page/ModeRuntime.ts:13-16`, `focus/ModeRuntime.ts:16-23`).
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
  10. **The hand-off reports the committed playback word (O6; Blurby.Brain1 option (A) and STOP-PAGE-BUTTON (a)).**
      - In Focus, Flow and Narrate, `exportHandoff` sets `publishedWordIndex` to `s.canonicalWordIndex` instead of `s.publishedWordIndex`, for both captures: `"persistent"` (Escape) and `"capture-current"` (the bottom bar's Page button and completion; Blurby.Brain1, STOP-PAGE-BUTTON (a), under O6: where you stopped, whatever the control). Nothing else in the export changes: `"capture-current"` still sets the highlight to the engine's word.
      - **Which word** (Why, "Each runtime's committed playback word"; source `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.ESCAPE-LANDS-AT-PLAYBACK-1.2026-11-03.md`): Focus's displayed word, Flow's reading cursor and Narrate's last published cursor. "Committed" is the latest of the playback word and any user-intent commit since then. `canonicalWordIndex` is that word: each advance and each user-intent commit (`commitShared`) writes it, and the later write stands. So an exit with no playback since entry hands over the entry word, and a click while paused hands over the clicked word.
      - **Narrate hands over the word itself,** never its sentence's first word. The sentence-start rule (O3) applies when playback restarts, not when Page lands.
      - **Narrate and rule #31:** the word is the last cursor the engine published at the heard sample. It is never `wordAtPlaybackSample()` or another timer read, never `getSnapshot().cursor` (stale after a restart) and never a chunk start. After a restart it stays the click's or navigation's word until the new audio publishes.
      - **Where it takes effect:** `exitToPage` (`useReaderModeOrchestrator.ts:354-357`) copies the export's `publishedWordIndex` into the highlight. Page copies both (`page/ModeState.ts:33-35`), seeds its resume anchor from the highlight (`:40`, so its relocates save nothing, LL-030), and the router snapshot then reads that word (`useReaderModeOrchestrator.ts:258`). The second Escape's `finishReading(canonicalWordAnchor)` writes it (`ReaderContainer.tsx:437`, `:615`, `:625-626`).
      - **Mode switches** also export `"persistent"` (`router.select`, `:342-345`). There the receiving playback mode's first `select()` already republishes its canonical word (`syncVisualToPersistentWord`: Focus `:510`, Flow `:684`, Narrate `:271`; helper `:107-110`), so nothing a reader sees changes. `resumeFlowAfterBookOpen` exports from Page (`:372-376`), which is unchanged.
      - **Isolation:** each runtime edits its own `exportHandoff`, one commit per mode, with no sibling import, no shared helper, and no router, orchestrator or shared-core edit.
      - **The Page button and completion** (`"capture-current"`; `pauseToPage`, `useReaderModeOrchestrator.ts:346-353`; `requestCompletionToPage`, `:358-363`) hand Page the same word. Page copies it (`page/ModeState.ts:33`), the router snapshot reads it (`:258`), and the close save after it writes it, so the Page button no longer undoes a save as you go. The highlight stays the engine's word, as today.
  11. **Page lands on the handed-over word (STOP-LAND-focus (a); Blurby.Brain1, 2026-11-03).**
      - **Cause** (STOP-LAND-focus's lines, below): Page's view opens at the handed-over cfi (`page/ModeRuntime.ts:167`; `page/FoliateView.tsx:881-882`) and paints the highlight with no motion (`paintArrivalCursor`, `page/ModeRuntime.ts:547-552`). Focus's cfi changes only on a relocate, and its view does not follow the word inside a section, so after Focus reads on, the cfi is the entry page and the highlight is off screen. Flow's scrolled view can leave the cfi one page short.
      - **Fix:** on every arrival from another mode (`handoff.source != null`, the condition that already sets `arrivalCursorPending`, `:161`), Page's arrival branch calls `this.surface.jumpToWordAnchor(word)` once for an EPUB, where `word` is the handed-over highlight, `this.state.publishedHighlightedWordIndex`. That is `jumpFoliateToWordAnchor` (`page/surface.ts:42`), the helper `jumpBack` uses (`:362-368`). It moves the view only when it has to: on a loaded section it re-highlights with forced motion, which scrolls to the word's own page, and otherwise it opens the word's section first (`helpers/foliateAnchorNavigation.ts`).
      - **Which arrivals:** `exitToPage` arrives `"silent"` with a source, the Page button `"pause-to-page"`, completion `"silent"` with a source, and a `router.select("page")` `"select"` (`useReaderModeOrchestrator.ts:342-363`). Page cannot tell `exitToPage` from completion without a router edit, which the fence forbids, and Brain1's row 5 says the Page button "lands at the playback word". So the jump runs on every arrival with a source; book open (`source` null) runs none. This reading of Brain1's rows 1 and 5 together is sent to Brain1 with the fold; an objection changes only the gate. Completion lands on the end word, which is where the reader stopped.
      - **It saves nothing.** A handover seeds Page's resume anchor from the highlight (`page/ModeState.ts:40`), so the relocates the jump causes take the active-skip path and `shouldPersistRelocateProgress` declines (`page/ModeRuntime.ts:440-488`; LL-030). They still record the new page's cfi (`:446-449`), which is the page of the stored word.
      - **Accepted (Brain1):** a brief view of the handed-over cfi's page before the jump, as `jumpBack` shows today. The memo records it and says whether probe P4 sees it.
      - **Held in an uncertified document (Blurby.Brain1's condition, 2026-11-04).** In a section BLOCK-TEXT-ORDER-1 holds as uncertified, the spans keep the legacy stamps, whose indices BLOCK-TEXT-ORDER-1 says cannot be trusted. The "is the word on the shown page" test then finds no span carrying the handed index, or the wrong one, and the jump can move to a wrong page. Today there is no jump, so that would be a new wrong landing. So while any rendered section document is in the view's `uncertifiedDocsRef` (`page/FoliateView.tsx:320` at BLOCK-TEXT-ORDER-1's tip `d3184d0b`), the landing does not jump: the view stays on the handed cfi's page, which is right, and the runtime logs `arrivalLand:held-uncertified`. The runtime cannot see that set, so the view answers one query, `isWordAnchorHeld()`, which Page's surface passes through (step 7). This is the safety net, not the fix: the cause, the two word numberings, belongs to WORD-INDEX-UNIFY-1 and XHTML-PARSE-MEASURE-1 (rule 6c).
      - **Isolation:** the jump is in Page's own runtime with Page's own surface. No sibling import, `ModeState.ts`, router or shared-core edit. `page/ModeRuntime.ts` joins Wave C's fence for this arrival branch only (Brain1); `page/FoliateView.tsx` (already in the fence for Wave B) gains one API method, and `page/surface.ts` one pass-through line.
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
  git grep -n -E '^  exportHandoff\(|publishedWordIndex: s\.publishedWordIndex' -- src/reader/modes/focus/ModeRuntime.ts src/reader/modes/flow/ModeRuntime.ts src/reader/modes/narrate/ModeRuntime.ts
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
  - **Wave C — Focus saves as you go, the broker's release list, and O6's hand-off in all three playback modes** (about 50 tool uses with steps 6 and 7, so two dispatches under the 40-tool ceiling: C-a is steps 1–5, about 32; C-b is steps 6–7 with the uncertified hold and rows f35–f36, about 28, after C-a; the step numbers below stay as written; needs Wave A's `null` contract; runs after BLOCK-TEXT-ORDER-1's merge, because BLOCK-TEXT-ORDER-1's Wave B holds the Focus window; STOP-LAND-focus and STOP-PAGE-BUTTON ruled (a), steps 6 and 7):
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
    5. Nothing else in Focus changes: not its view, bindings, anchor helper (beyond Wave A) or engine. Flow and Narrate change only in step 6, Page only in step 7.
    6. **O6, the hand-off word for both captures (design 10; Blurby.Brain1 option (A) and STOP-PAGE-BUTTON (a)).** Three commits, one runtime each, in this order. Each commit touches only its own `ModeRuntime.ts` and, for Focus and Flow, its own B0 replay test; none imports from a sibling mode. The fence is the three `ModeRuntime.ts` files, Page's arrival branch (step 7) and the tests.
       - `src/reader/modes/focus/ModeRuntime.ts`, `exportHandoff` (`:663-681`): `:672` becomes `publishedWordIndex: s.canonicalWordIndex,`.
       - `src/reader/modes/flow/ModeRuntime.ts`, `exportHandoff` (`:827-845`): the same at `:836`.
       - `src/reader/modes/narrate/ModeRuntime.ts`, `exportHandoff` (`:414-430`): the same at `:422`.
       - Each gets a one-line comment above it that names this item, owner ruling O6 and Brain1's options (A) and STOP-PAGE-BUTTON (a): "the committed playback word (canonical), for either capture, so leaving for Page by any control stores where reading stopped".
       - `highlightedWordIndex`, `canonicalWordIndex`, `cfi` and every other field stay as they are. The `"capture-current"` highlight (the engine's word) is unchanged.
       - **Pinned rows (STOP-PAGE-BUTTON; Blurby.Brain1's named exception to standing rule 50).** The B0 replays export `"capture-current"`: their `selectMode` of `page` is `router.pauseToPage()` (`tests/readerModes/harness/fixtureReplay.tsx:316`), and completion is `requestCompletionToPage` (`useReaderModeOrchestrator.ts:358-363`). Exactly four recorded observation values change, each to the observation's own `canonicalWordIndex` (the fixtures at `14ce3d24`):

         | Replay | Script, command | Field | Recorded | After |
         |---|---|---|---|---|
         | Focus | `focus-core-start-0`, 12 (`selectMode` page) | `publishedWordIndex` | 10 | 12 |
         | Focus | `focus-runs-to-completion-start-7`, 3 (completion) | `publishedWordIndex` | 7 | 24 |
         | Flow | `flow-core-start-7`, 7 (completion) | `publishedWordIndex` | 7 | 24 |
         | Flow | `flow-core-start-0`, 11 (`selectMode` page) | `publishedWordIndex` | 10 | 12 |

         `focus-core-start-7` command 12 and `flow-core-start-7` command 11 already record 17 = 17, so they do not change. No effect changes: Page's arrival effects carry no published word, and the step 7 jump goes through the recording surface's `jumpToWordAnchor`, an unrecorded query (`fixtureReplay.tsx:137`).
         - The review-record fixtures under `docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/` stay byte-unchanged, and `tests/readerModes/harness/fixtureReplay.tsx` is not edited (Brain1 names `:316` as the route, not as a file to edit).
         - In each of the two replay tests, beside Wave A step 10's `hardSelectionCfiAsRecorded`, add one test-local helper, `capturedWordAsRuled(baselineText)`. It parses the committed baseline, sets exactly the table's rows for that mode to their "After" value, after checking each recorded value equals "Recorded" (it throws otherwise), and returns the text. Its comment names this item, STOP-PAGE-BUTTON (a) and the rule-50 exception.
         - "preserves the recorded mode baseline" compares against it: Focus `expect(compareReplay(capturedWordAsRuled(readFixtureText("focus")), candidate).diff).toBeNull();` (Wave A step 10's line), and the same for Flow. The negative controls keep the committed text, since each still fails for its own mutation.
         - `focus.behavior.test.tsx:63-65` and `flow.behavior.test.tsx:68-70` expect `publishedWordIndex: 24` where they expect 7.
         - The Focus commit carries the Focus replay edit, the Flow commit the Flow one. The memo quotes each edited line and each table row before and after.
         - **Not pinned, unchanged:** Narrate has no behaviour replay (`tests/readerModes/narrate.contract.test.ts` runs the shared contract only). `tests/readerModeIsolation.test.ts`, "exitToPage hands off the published word as the highlight" (`:348-355`), and its `pauseToPage` and completion rows (`:303-340`) run over the file's own fake runtimes (`fakeModule`, `:186-245`), so they stay green and unedited. `focus.behavior.test.tsx:100-130` asserts only Page's highlight after `pauseToPage`, which is unchanged. `assertNoLeak` (`tests/readerModes/harness/contractAssertions.ts:173-194`) compares exports with no playback between them.

         If any other row or replay value fails on step 6, STOP to Blurby.Brain1 with its name and values before editing it.
    7. **Page lands on the handed-over word (design 11; STOP-LAND-focus (a), with Brain1's uncertified hold).** One commit, after step 6's three, touching only `src/reader/modes/page/ModeRuntime.ts` in its arrival branch, `src/reader/modes/page/FoliateView.tsx` (one API method) and `src/reader/modes/page/surface.ts` (one pass-through), plus the new rows. Runtime lines are at `14ce3d24`, view lines at BLOCK-TEXT-ORDER-1's tip `d3184d0b`; Wave B and BLOCK-TEXT-ORDER-1 edit these files first, so re-grep `arrivalCursorPending`, `paintArrivalCursor`, `uncertifiedDocsRef` and `viewApiRef.current = {` at the cut.
       - **`page/FoliateView.tsx`.** In `PageFoliateViewAPI` (`:212-230` at `14ce3d24`), add `/** CPC-1 (Brain1's condition on STOP-LAND-focus): true while a rendered section is uncertified (BLOCK-TEXT-ORDER-1), so a word-anchor landing must not move the view. */ isWordAnchorHeld: () => boolean;`. In the API object (`viewApiRef.current = {`, `:1042` at `d3184d0b`), after `getSectionForWordIndex,`: `isWordAnchorHeld: () => (view.renderer?.getContents?.() ?? []).some(({ doc }: { doc: Document }) => uncertifiedDocsRef.current.has(doc)),`. Nothing else in the view changes. The answer is current at the arrival paint: the wrap reports its certification before it first yields (`:696-700` at `d3184d0b`), and Page's load callback follows the wrap.
       - **`page/surface.ts`.** In `PageSurface`, after `jumpToWordAnchor`: `/** CPC-1: the view holds word-anchor landings (an uncertified section is rendered). */ isWordAnchorHeld(): boolean;`. In `createPageSurface`, after `jumpToWordAnchor: …`: `isWordAnchorHeld: () => api()?.isWordAnchorHeld() ?? false,`. No other surface change. The B0 replays' recording surface answers any unknown method with a no-op returning `undefined` (`fixtureReplay.tsx:139`), so it reads as not held and records nothing.
       - **Field**, beside `arrivalCursorPending` (`:155`): `/** CPC-1 STOP-LAND-focus (a): land the view on the handed-over word once, on an arrival from another mode. */ private arrivalLandPending: boolean;`. In the constructor, after `:161`: `this.arrivalLandPending = input.handoff.source != null;`.
       - **`private landArrivalWord(): void`**, placed after `paintArrivalCursor` (`:547-552`): returns unless `this.arrivalLandPending`, `this.document.useFoliate` and `this.surface.isReady()`. Then it sets `this.arrivalLandPending = false`, reads `const word = this.state.publishedHighlightedWordIndex;`, and:
         - if `this.surface.isWordAnchorHeld()`, calls `this.ports.diagnostics.transition("arrivalLand:held-uncertified", () => ({ word, mode: "page" }))` and returns, leaving the view on the handed cfi's page;
         - otherwise, if `this.arrivalCursorPending` is still set (the no-motion paint just before found no span for `word` in any rendered document, so the handed cfi's section does not hold the handed word), calls `this.ports.diagnostics.transition("arrivalLand:cross-section", () => ({ word, mode: "page" }))` and then jumps (Brain1, 2026-11-04: position wins, as in the CPC-1 ruling; the log is the evidence if Waves A and B's contract is ever broken);
         - in both of those non-held cases, calls `void this.surface.jumpToWordAnchor(word);`.

         It reads no result and changes no other state. **Named gap (memo only, no machinery; Brain1):** in the cross-section case the target section is not rendered yet, so its certification is unknown before the jump. That needs a CPC-1 violation and an uncertified target together. Its comment names this item, STOP-LAND-focus (a), `jumpBack` (`:362-368`) and LL-030 (the handover's resume anchor makes the jump's relocates save nothing).
       - **`paintArrivalCursor`**: add `this.landArrivalWord();` at the end of the method, after the `if (this.surface.highlight(...)) { ... }` block (`:549-551`), so the jump follows the no-motion paint on the same load, in both callers (`onSurfaceLoad`, `:497`, and its delayed callback, `:503`). The early return at `:548` is kept: while the cursor is still pending the landing is reached, and the landing's own flag stops a second jump. A failed paint (the word's section is not loaded, or no view yet) still reaches the landing, which opens the word's section, or waits for a ready view.
       - Nothing else in Page changes: not `jumpBack`, `onRelocate`, `onSurfaceLoad`'s restore branch, `paintArrivalCursor`'s paint (F-026), `ModeState.ts`, `helpers/foliateAnchorNavigation.ts`, the view beyond its one method, the surface beyond its one line, or the bindings. If the hold needs any other route, STOP to Blurby.Brain1 with the lines.
       - **Not pinned:** `tests/readerModes/arrivalCursor.test.ts` asserts with `toContainEqual` on handovers (`:85`), and "book open in Page paints no cursor" (`:90-94`) has no source, so no jump. The B0 replays record no jump (step 6). `tests/readerModes/page.behavior.test.tsx`, `page.contract.test.ts`, `pageTurnKey.test.ts` and `pagePositionSave.test.tsx` (`createInitialHandoff`, `:127`) open books with no source. If any of them fails on step 7, STOP to Blurby.Brain1 with its name.
  - **Wave D — gates, package and close-out** (about 35 tool uses): Done-when 5–11.
- **Prerequisites:**
  - NARRATE-ARRIVAL-SYNC-1 (Seq 88.5) merged, and gate (1) run 6 recorded.
  - CHAPTER-STEP-CFI-1 (Seq 97, amendment 1, `eb/chapter-step-cfi-1-r2`) merged. `<base>` is `origin/main` after that merge.
  - For Wave C: BLOCK-TEXT-ORDER-1 merged (its Wave B holds the Focus window). Wave C re-greps `exportHandoff` in all three runtimes at its cut.
  - The `src/types.ts` and `src/components/ReaderContainer.tsx` integration window granted, with no other active sprint editing either file.
  - Blurby.Brain1 confirmed B1–B18 and ruled C1–C3 (2026-11-03). Design 9 is Brain1's binding O4 ruling, with C1's and C3's conditions folded in. STOP-CLOSE-focus was ruled (A) on 2026-11-03, with owner ruling O6 (design 10, Wave C step 6). STOP-LAND-focus and STOP-PAGE-BUTTON were ruled (a) on 2026-11-03 (Wave C steps 6 and 7).
  - RodneySr has the canonical clone `C:\Users\estra\Projects\Blurby` with `node_modules`, the sample *Meditations*, and the `c5bb507f` x64 `--dir` package from `repro-base` (or rebuilds it with the same recipe). Rodney has its canonical clone for the arm64 build.
- **Execution host:** RodneySr (x64) for the implementation, the tests, the packages and the probes. Rodney (arm64) only for the rule 53 arm64 launch.
- **Branch:** `eb/cfi-position-consistency-1` at `C:\Users\estra\Projects\Blurby\.worktrees\cfi-position-consistency-1` on RodneySr. Create it with `git -C C:/Users/estra/Projects/Blurby worktree add -b eb/cfi-position-consistency-1 .worktrees/cfi-position-consistency-1 origin/main` after CHAPTER-STEP-CFI-1 merges. Push with `git push origin HEAD:refs/heads/eb/cfi-position-consistency-1`.
- **Done when** (every command in `pwsh` from the worktree root):
  1. **Red first (standing rule 43).** Commit these five files alone, before any source edit, with every row below, Wave C's included (the fourth, `tests/readerModes/cfiPositionConsistency.landing.test.ts`, holds rows f30–f34 and f37; the fifth, `tests/readerModes/cfiPositionConsistency.landingHold.test.tsx`, rows f35–f36, and needs BLOCK-TEXT-ORDER-1 merged, so it is committed red at Wave C's cut, before step 7). Reach new names only through behaviour, so each file runs on `<base>`. The red commit need not typecheck; step 6 does.

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
         - **(f13, the close row: the close save keeps the last timed save):**
           - **The close path**, composed test-locally as the shell runs it: `router.exitToPage()` (the first Escape, `ReaderContainer.tsx:627-629`), then the second Escape in Page: `checkBacktrack(a, total, true)` and, when it returns `false`, `finishReading(a)` from `renderHook(() => useProgressTracker({...}))`, where `a` is `router.getSnapshot().currentWordIndex` (`ReaderContainer.tsx:437`, `:615`, `:625-626`). `window.electronAPI.updateDocProgress` is the stub pattern of `tests/useProgressTracker.test.ts`, and its calls are folded into the stored doc with the rest.
           - Play about 12,000 ms, so a timed save writes `W`. Then the close path.
           - The stored position is not older than `W` (`>= W`).
           - **RED** on `<base>` (no timed save). Green after Wave C step 6 (STOP-CLOSE ruled (A)): the close save writes the hand-off's word, Focus's canonical word, which is not older than `W` (rows f14 and f15).
       - **O6, the persistent hand-off (Wave C step 6; Blurby.Brain1 option (A); rows 1–6 of `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.ESCAPE-LANDS-AT-PLAYBACK-1.2026-11-03.md`).** Sixteen rows: Brain1's rows 1–5 for each playback mode, and row 6 for Narrate. They run over the real router with the f-rows' open (8723 stands for Brain1's word 100; the spine-4 cfi; the map loaded) and fake timers.
         - **Focus and Flow** play at 300 words a minute with rhythm pauses off. **Narrate** runs through the module map of `tests/readerModes/bandAlign2.test.tsx:71-72`, with `createNarrateRuntime(input, { producer, createOutput })` (`narrate/ModeRuntime.ts:936`), `FakeProducer` at its default 200 ms a word and `FakeAudioOutput`. A test-local `run(ms)` advances, in 50 ms steps, fake time, the output and then `runtime.tick()`.
         - **"The playback word" `p`** is read on the mode's runtime just before the exit. Focus and Flow: `exportHandoff("capture-current").highlightedWordIndex`, the engine's word (`focus/ModeRuntime.ts:666-668`, `flow/ModeRuntime.ts:830-832`). Narrate: `getSnapshot().highlightedWordIndex`, the last published cursor (`onEngineCursor`, `narrate/ModeRuntime.ts:731-733`).
         - **"The close path"** is f13's: `router.exitToPage()`, then `checkBacktrack` and `finishReading(a)` with `a = router.getSnapshot().currentWordIndex`, folded into the stored doc.
         - **(f14 Focus, f19 Flow, f24 Narrate; Brain1 row 1) enter at 100, play to about 500, then Escape: Page shows 500's page, and the highlight is on 500.** Play for 12,000 ms with no input; `p` is not 8723. After `router.exitToPage()`, Page's `highlightedWordIndex` and `router.getSnapshot().currentWordIndex` are both `p`, and Page's view lands on `p`'s page. **RED** on `<base>` (8723). **The landing half** is row f30 (step 7), in its own file because it mocks Page's surface. The shown page is probe P4's verdict (the final shown range contains `p`, with the highlight on screen).
         - **(f15 Focus, f20 Flow, f25 Narrate; Brain1 row 2) Escape again: the stored word is 500 (it reopens there).** After row 1, the second half of the close path. The stored position is `p`. **RED** on `<base>` (8723).
         - **(f16 Focus, f21 Flow, f26 Narrate; Brain1 row 3) enter at 100, no playback, then Escape: Page lands at 100 (control).** Select the mode and wait 3,000 ms with no Play, then the close path. The snapshot's `currentWordIndex` and Page's highlight after `exitToPage()`, and the stored position, are all 8723. Green on `<base>` and after.
         - **(f17 Focus, f22 Flow, f27 Narrate; Brain1 row 4) pause, click X, then Escape: Page lands at X.** Play for 3,000 ms, pause with `router.togglePlay()`, then `hardSelect` word X (a word the paused engine is not on) with the spine-4 cfi, then the close path. The snapshot's `currentWordIndex` and Page's highlight after `exitToPage()`, and the stored position, are all X. Guard row: green on `<base>` (the click publishes through `commitShared`) and after; it fails if the export reports the engine's older word.
         - **(f18 Focus, f23 Flow, f28 Narrate; Brain1 row 5, as ruled under STOP-PAGE-BUTTON (a)) the Page button, then Escape: Page lands at the playback word and stores it.** Play for 12,000 ms, then `router.pauseToPage()` (the `"capture-current"` export behind the bottom bar's Page button), then the second half of the close path (`checkBacktrack` and `finishReading(a)` with `a = router.getSnapshot().currentWordIndex`; Page is already active). Page's `highlightedWordIndex` and the snapshot's `currentWordIndex` are `p`, and the stored position is `p`. **RED** on `<base>` (the snapshot and the stored position are 8723). **Control in the same row:** a fresh open, select the mode, wait 3,000 ms with no Play, `router.pauseToPage()`, the close path: everything is 8723, on `<base>` and after.
         - **(f29, Narrate only; Brain1 row 6) an Escape during leading silence or an epoch switch hands over the last published cursor, never a word ahead of the sample.** Each part reads `c`, the last published cursor (`getSnapshot().highlightedWordIndex`), then calls `router.exitToPage()` with no tick between:
           - (a) leading silence: Play with `producer.setHold(true)`, release it, and `run` until the first chunk is scheduled but its sample is before the first unit (`wordAtPlaybackSample()` returns `null`, and nothing is published). The hand-off's word is 8723, the entry word, not the sentence start the engine started from.
           - (b) an epoch switch with no commit: `run(6_000)`, `producer.setHold(true)`, then `runtime.jumpToWord(c + 40, "navigation")`, which restarts the engine (`narrate/ModeRuntime.ts:409`) without a commit. The hand-off's word is `c`, not `c + 40`.
           - (c) an epoch switch after a click: `run(6_000)`, `producer.setHold(true)`, then `hardSelect` word X while playing. The hand-off's word is X, the click's commit (rule 1 of the ruling: the latest user-intent commit wins).
           - In every part the hand-off's word is at or behind the word at the heard sample, or is the latest commit. **RED** on `<base>` for (b) (8723); (a) and (c) are guard rows, green on `<base>` and after.
       - **Page's landing (Wave C step 7; STOP-LAND-focus (a); `tests/readerModes/cfiPositionConsistency.landing.test.ts`, new).** This file alone mocks `../../src/reader/modes/page/surface` with a test-local fake: `isReady` answers `true`, `highlight` answers `true`, `jumpToWordAnchor` records its word and resolves `true`, and every other method is a no-op. It uses the f-rows' open, router and fake timers for Focus and Flow (300 words a minute, rhythm pauses off), and f24's Narrate setup. "Load Page" means: call the active Page runtime's `onSurfaceLoad()` (`router.getActive().runtime`) once, with no timer advance.
         - **(f30 Focus, Flow and Narrate; Brain1 row 1, the landing) Escape lands the view on the stopped word.** Play for 12,000 ms, read `p` as f14 does, `router.exitToPage()`, load Page: the fake saw exactly one `jumpToWordAnchor`, with `p`. **RED** on `<base>` (no call).
         - **(f31 Focus, Flow and Narrate) the Page button lands the view too.** Play for 12,000 ms, read `p`, `router.pauseToPage()`, load Page: exactly one `jumpToWordAnchor(p)`. **RED** on `<base>`.
         - **(f32) book open lands nothing.** `router.openDocument(...)` only, load Page: no `jumpToWordAnchor` call. Then advance timers by `PAGE_SURFACE_LOAD_DELAY_MS`: still no call from the arrival (a call from the restore branch, `page/ModeRuntime.ts:515-517`, is allowed only with the stored position's word). Green on `<base>` and after.
         - **(f33 Focus) the landing saves nothing (LL-030).** After f30's landing, call the Page runtime's `onRelocate({ cfi: "epubcfi(/6/12!/4/2)", fraction: 0.5 })`: the fake infrastructure saw no `persistence.scheduleRelocateSave` and no `persistence.updateDocProgress` since `exitToPage()`, and Page's `highlightedWordIndex` is still `p`. Guard row: green on `<base>` and after (the handover's resume anchor).
         - **(f34 Focus) one landing per arrival.** After f30's landing, call `onSurfaceLoad()` twice more and advance timers by 1,000 ms: still exactly one `jumpToWordAnchor`. **RED** on `<base>` (none).
         - **(f37 Focus) a cross-section arrival jumps and logs.** As f30, but the fake's `highlight` answers `false` (the word's span is not rendered): exactly one `jumpToWordAnchor(p)` and exactly one `arrivalLand:cross-section` transition with `{ word: p, mode: "page" }`. In f30 (where `highlight` answers `true`) there is no such transition. **RED** on `<base>` (no call, no transition).
       - **The uncertified hold (Wave C step 7; Brain1's condition; `tests/readerModes/cfiPositionConsistency.landingHold.test.tsx`, new).** It runs the real Page runtime with the real Page `FoliateView` over a fake foliate view, on the harness of BLOCK-TEXT-ORDER-1's `tests/readerModes/blockTextOrderHold.page.test.tsx` (`FakePaginator`, `FakeFoliateView`, `sectionDoc`, the `wrapWordsInSpans` hook that records each `onCertification`, and the `SECTIONS` / `MISMATCHED` / `MATCHING_2` slices), copied, not imported, as that file copied `pagePositionSave.test.tsx`'s. Its `FakePaginator` adds `scrollToAnchor(range)`, which records its calls, and its `FakeFoliateView.goTo` records its target. The Page runtime is created through `pageMode` with `handoff: createReaderModeHandoff({ ...createInitialHandoff(snapshot, snapshot.wordCount), source: "flow", canonicalWordIndex: 22, publishedWordIndex: 22, highlightedWordIndex: 22, cfi: "cfi:3:a" })` and `arrival: "silent"`, as `exitToPage` from Flow would.
         - **(f35) arriving from Flow into an uncertified section, the view stays on the handed cfi's page.** Section 3 loads with the `C2_BODY` document against the `MISMATCHED` slice, so its certification fails and the view holds it. After the load callback and `PAGE_SURFACE_LOAD_DELAY_MS`: no `scrollToAnchor` call, no `goTo` call, the diagnostics port saw exactly one `arrivalLand:held-uncertified` transition with `{ word: 22, mode: "page" }`, and `persistence` saw no save. Green after step 7. On `<base>` there is no jump either, so the row's RED half is the log: **RED** on `<base>` (no transition).
         - **(f36, control) the same arrival into a certified section lands.** The same steps with `CERTIFIED_BODY` ("a x b") against the same `MISMATCHED` slice, which it matches, so the section certifies and 22 is "b": at least one `scrollToAnchor` call (the jump re-highlights once after 60 ms, so two are expected), no `arrivalLand:held-uncertified` transition, and no save. **RED** on `<base>` (no `scrollToAnchor` call).
         - If BLOCK-TEXT-ORDER-1's harness names differ at the cut, re-grep them in `blockTextOrderHold.page.test.tsx` and copy what is there; the rows' setups and assertions stay as written.

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
     - `git diff --name-status <base> -- src/reader/modes/focus src/reader/modes/flow src/reader/modes/narrate` lists exactly the three `helpers/usePersistentReadingAnchor.ts` files and the three `ModeRuntime.ts` files (Focus, Flow and Narrate), and exits 0.
     - `git grep -c -F 'publishedWordIndex: s.canonicalWordIndex,' -- src/reader/modes/focus/ModeRuntime.ts src/reader/modes/flow/ModeRuntime.ts src/reader/modes/narrate/ModeRuntime.ts` exits 0 and lists all three paths, each with `1`. It exits 1 on `<base>`.
     - `git grep -c -F 'publishedWordIndex: s.publishedWordIndex' -- src/reader/modes/focus/ModeRuntime.ts src/reader/modes/flow/ModeRuntime.ts src/reader/modes/narrate/ModeRuntime.ts` lists each path with `1`: only `getSnapshot`'s line is left (Focus `:461`, Flow `:624`, Narrate `:220` at `14ce3d24`), so no capture still reports the old word. Each path has `2` on `<base>`.
     - `git grep -c -F 'arrivalLandPending' -- src/reader/modes/page/ModeRuntime.ts` exits 0 and prints 4 (field, constructor, check, clear). It exits 1 on `<base>`.
     - `git grep -c -F 'jumpToWordAnchor(this.state.publishedHighlightedWordIndex)' -- src/reader/modes/page/ModeRuntime.ts` exits 0 and prints 1. It exits 1 on `<base>`.
     - `git diff --numstat <base> -- src/reader/modes/flow/ModeRuntime.ts src/reader/modes/narrate/ModeRuntime.ts` shows 2 added and 1 deleted line for each path: the comment and the changed line.
     - **One runtime per commit:** for every commit in `git rev-list <base>..HEAD`, `git show --name-only --format= <sha> -- src/reader/modes/focus/ModeRuntime.ts src/reader/modes/flow/ModeRuntime.ts src/reader/modes/narrate/ModeRuntime.ts` prints at most one path. Record the three step 6 commits in the memo. The step 6 Focus and Flow commits may also list their own replay test (`focus.behavior.test.tsx`, `flow.behavior.test.tsx`), never the other's.
     - **Step 7's commit:** `git show --name-only --format= <step 7 sha>` lists only `src/reader/modes/page/ModeRuntime.ts`, `src/reader/modes/page/FoliateView.tsx` and `src/reader/modes/page/surface.ts` (the landing rows are in the red commits). Record it in the memo.
     - `git grep -c -F 'isWordAnchorHeld' -- src/reader/modes/page/FoliateView.tsx src/reader/modes/page/surface.ts src/reader/modes/page/ModeRuntime.ts` lists each path: FoliateView `2` (type and method), surface `3` (type, method, call), ModeRuntime `1`. It exits 1 on `<base>`.
     - `git grep -c -F 'arrivalLand:held-uncertified' -- src/reader/modes/page/ModeRuntime.ts` prints 1. It exits 1 on `<base>`.
     - `git grep -c -F 'arrivalLand:cross-section' -- src/reader/modes/page/ModeRuntime.ts` prints 1. It exits 1 on `<base>`.
     - `git diff <base> -- src/reader/modes/page/surface.ts` shows only the two added declarations and their comment (no line removed).
     - `git diff --name-status <base> -- src/reader/useReaderModeOrchestrator.ts src/reader/modes/page/ModeState.ts` prints nothing and exits 0 (no router edit).
     - `git grep -c -E '"persistence\.update(DocProgress|Progress)"' -- src/reader/ports/createReaderPorts.ts` exits 0 and prints 2. It exits 1 on `<base>`.
     - `git diff <base> -- src/reader/ports/createReaderPorts.ts` shows only the two added list lines (C1: only the list changes).
     - `git grep -n -E 'reason !== "teardown"' -- src/reader/modes/focus/ModeRuntime.ts` exits 0. It exits 1 on `<base>`.
  5. **Tests.**
     - `npx vitest run tests/cfiPositionConsistency.ipc.test.js tests/cfiPositionConsistency.shell.test.tsx tests/readerModes/cfiPositionConsistency.test.ts tests/readerModes/cfiPositionConsistency.landing.test.ts tests/readerModes/cfiPositionConsistency.landingHold.test.tsx` exits 0.
     - BLOCK-TEXT-ORDER-1's `tests/readerModes/blockTextOrderHold.page.test.tsx` is green and unedited.
     - `npx vitest run tests/readerModes tests/readerModeIsolation.test.ts tests/readerModeOwnership.test.ts tests/useProgressTracker.test.ts tests/keepFurthest.test.tsx tests/pageReopenCfi.test.ts tests/updateDocProgressLastRead.test.js tests/persistentReadingAnchor.test.ts tests/useLibrary.test.ts tests/narrate` exits 0.
     - `tests/readerModes/chapterStepLanding.test.ts` (CHAPTER-STEP-CFI-1), `tests/readerModes/pagePositionSave.test.tsx` and `tests/narrate/narrate.playSavedPosition.test.ts` (NARRATE-ARRIVAL-SYNC-1) are green and unedited.
     - `tests/readerModes/flow.behavior.test.tsx` and `tests/readerModes/focus.behavior.test.tsx` (the B0 replays) are green, edited only as Wave A step 10 lists. `tests/readerModeIsolation.test.ts` is green, edited only as Wave C step 4 lists; its "exitToPage hands off the published word as the highlight" (`:348-355`) is unedited. `tests/readerModeOwnership.test.ts` is green and unedited.
     - Wave C steps 6 and 7 edit no existing test beyond step 6's replay exception (the four table values and the two completion expectations). `tests/readerModes/focus.contract.test.ts`, `flow.contract.test.ts`, `narrate.contract.test.ts`, `page.contract.test.ts`, `page.behavior.test.tsx`, `arrivalCursor.test.ts` and `pagePositionSave.test.tsx` are green and unedited.
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
         - The tip (rows f13, f14 and f15): after the first Escape, the router snapshot's `currentWordIndex`, read over the inspector, is the paused word. After the second, the stored pair agrees (no cfi, or a cfi in the stored position's section), the stored position is the paused word, and the reopen's first shown range contains it.
         - **The landing (STOP-LAND-focus (a); rows f30 and f33):** after the first Escape, wait 2 s. On the tip, the first and last visible word indices in Page contain the paused word, and its highlighted span is inside the viewport. Record every relocate from the Escape to then, and say in the memo whether the handed-over cfi's page is shown briefly first (accepted). The save hook saw no save between the two Escapes. `<base>`: recorded (the entry word's page).
         - **A page turn right after the landing (Brain1 row 1):** a second run of the same steps, but after the 2 s press ArrowRight once as a native key event, wait 4 s, and read the save hook: the saved word is the first visible word of the new page, greater than the last visible word recorded before the turn, and its cfi is in that word's section. Then Escape as usual. `<base>`: recorded.
         - **P4 by the Page button (STOP-PAGE-BUTTON (a)):** the same steps, but leave Focus with the bottom bar's Page button (a click on it over the inspector), then one Escape. On the tip, Page's view shows the paused word as above, and the stored position is the paused word. `<base>`: 8723, recorded.
         - `<base>`: the control, recorded. There, the close save is Focus's only save (Why), and it writes 8723.
         - **P4 from Flow and from Narrate (O6):** the same steps with Flow, then with Narrate at 1.00x, sampling the cursor word as FLOW- and NARRATE-SAVE-AS-YOU-GO-1's probes do. On the tip, the snapshot after the first Escape and the stored position are the last sampled cursor word before the pause (for Narrate, it or the next word), and Page's visible range after the first Escape contains it. `<base>`: 8723, recorded, with the visible range.
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
     - `M src/reader/modes/flow/ModeRuntime.ts` (Wave C step 6, one export line)
     - `M src/reader/modes/narrate/ModeRuntime.ts` (Wave C step 6, one export line)
     - `M src/reader/modes/page/helpers/persistentReadingAnchor.ts`
     - `M src/reader/modes/page/ModeRuntime.ts`
     - `M src/reader/modes/page/useModeBindings.ts`
     - `M src/reader/modes/page/FoliateView.tsx`
     - `M tests/useProgressTracker.test.ts`
     - `M tests/readerModes/flow.behavior.test.tsx` (Wave A, C2; Wave C step 6, STOP-PAGE-BUTTON)
     - `M tests/readerModes/focus.behavior.test.tsx` (Wave A, C2; Wave C step 6, STOP-PAGE-BUTTON)
     - `M tests/readerModeIsolation.test.ts` (Wave C, C1)
     - `A tests/cfiPositionConsistency.ipc.test.js`
     - `A tests/cfiPositionConsistency.shell.test.tsx`
     - `A tests/readerModes/cfiPositionConsistency.test.ts`
     - `A tests/readerModes/cfiPositionConsistency.landing.test.ts` (Wave C step 7)
     - `A tests/readerModes/cfiPositionConsistency.landingHold.test.tsx` (Wave C step 7, Brain1's uncertified hold)
     - `M src/reader/modes/page/surface.ts` (Wave C step 7, one pass-through)

     Nothing in `preload.js`, `src/utils/FlowScrollEngine.ts`, `src/styles/`, any `mode.css`, Focus's view or bindings, Flow's or Narrate's runtime beyond step 6's export line, their views, bindings, engines or helpers beyond Wave A, `page/ModeState.ts`, any other mode's `surface.ts`, Page's `surface.ts` beyond step 7's line, `helpers/foliateAnchorNavigation.ts`, `ReaderModeAdapter.ts`, `src/reader/useReaderModeOrchestrator.ts`, `src/App.tsx`, `src/hooks/useReader.ts`, `tests/readerModes/harness/` or `docs/planning/roadmap-reviews/reader-mode-separation-2/`.
  10. **Merge-tree check:** `git merge-tree` of the tip against `origin/main` is clean at the merge go. A conflict in a fenced file goes to Blurby.Roadmap before resolution.
  11. **Owner, added to gate (2)'s list:**
      - after a chapter jump, quit and reopen: the book opens in the jumped-to chapter;
      - a book that had only a saved word opens at that word, after "Loading book..." and with no jump;
      - Narrate after a reopen starts at the saved word's sentence;
      - read in Focus for a while, then close the app any way at all: the book reopens within a few seconds' reading of where Focus was;
      - pause in Focus and reopen: the book opens at the paused word;
      - "Escape from Focus, Flow or Narrate lands where I stopped." (O6; Brain1's gate (2) row.) Page shows that word's page with the highlight on screen.
      - "The bottom bar's Page button, then Escape, also reopens where I stopped." (O6, STOP-PAGE-BUTTON (a).)
- **Effort:** M, in four waves and five dispatches (A, B, C-a, C-b, D; each about 40 tool uses or fewer). Technical effort: medium for A, C and D, high for B.
- **Owners:**
  - Blurby.Brain1 ruled B1–B18, C1–C3, STOP-CLOSE (option (A)), STOP-LAND-focus (a) and STOP-PAGE-BUTTON (a), and confirms the rule 53 pair;
  - RodneySr implements, tests and probes; Rodney runs the arm64 launch;
  - spec-compliance, then quality review;
  - Blurby.Roadmap grants the integration window, gives the merge go and closes it out.
- **Merge order:**
  - after NARRATE-ARRIVAL-SYNC-1, gate (1) run 6 and CHAPTER-STEP-CFI-1; Wave C also after BLOCK-TEXT-ORDER-1's merge (Brain1's O6 ruling);
  - before FLOW-TOC-JUMP-WORD-1 (Seq 110), FURTHEST-PERSIST-1 (Seq 114; `main/ipc/documents.js`, `src/hooks/useLibrary.ts`, `src/types.ts`) and FOCUS-PAUSED-HANDOFF-1 (Seq 118). Each re-greps after this lands.
  - Any later item that edits `src/reader/modes/page/FoliateView.tsx` or `page/ModeRuntime.ts` re-greps the hold's lines. Any later item that edits `focus/ModeRuntime.ts` (FOCUS-PAUSED-HANDOFF-1 among them) re-greps `saveProgressWord` and keeps its calls in `pause()`, `togglePlay()`, `stop()` (after `stopEngine()`, not on `"teardown"`) and `commitShared`.
  - FLOW-SAVE-AS-YOU-GO-1 (Seq 97.6) and NARRATE-SAVE-AS-YOU-GO-1 (Seq 97.7) rely on Wave C's release list and make no broker edit. Any later item that edits `src/reader/ports/createReaderPorts.ts` keeps both entries.
  - Both also rely on Wave C step 6's export line and make no `exportHandoff` edit. They edit `flow/ModeRuntime.ts` and `narrate/ModeRuntime.ts` after this merges, in Seq order, so each re-greps the line and keeps it. Any later item that edits a playback mode's `exportHandoff` keeps both captures reporting `s.canonicalWordIndex`. Any later item that edits Page's `paintArrivalCursor` keeps the `landArrivalWord()` call.
  - TOC-FRAGMENT-WORD-1's `ReaderContainer.tsx` window does not overlap this one.
  - The Focus, Flow and Narrate restamp items (Seq 111–112) edit only their own `FoliateView.tsx`, so they do not conflict.
- **Path:** dispatch (four waves, five dispatches).

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

**Queue:** Waves A–D go behind BLOCK-TEXT-ORDER-1's Waves A and B, and after CHAPTER-STEP-CFI-1 merges. Wave C runs after BLOCK-TEXT-ORDER-1's merge (Brain1's O6 ruling: BLOCK-TEXT-ORDER-1's Wave B holds the Focus window).

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

##### Blurby.Brain1 rulings on STOP-Q5a and the close row (2026-11-03, binding)
- **STOP-Q5a** (the Narrate engine's word-at-sample query) is Narrate's alone. Focus is unchanged by it.
- **Unmount-skip is confirmed.** On stop reason `"teardown"`, Focus skips the exit save and makes no call the broker would reject. Already in design 9 ("Not on unmount"), Wave C step 2 (`stop()`) and row f11; no change.
- **The close row is added to Wave C as f13:** play about 12 s so a timed save writes W, then close the reader by the normal close path; the stored word is not older than W.
- **The investigation found it fails** (Why, "The close save's word does not follow Focus's displayed word"). Per the ruling, no fix is designed here. STOP-CLOSE-focus below goes to Blurby.Brain1, and this spec stays not dispatch-ready until it is ruled. Waves A and B do not depend on the answer; whether they may run before it is Blurby.Roadmap's call. (Ruled (A) on 2026-11-03; see the next section.)

##### Blurby.Brain1 ruling on STOP-CLOSE and owner ruling O6 (2026-11-03, binding)
Source: `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.ESCAPE-LANDS-AT-PLAYBACK-1.2026-11-03.md`, including its "Superseded on placement" section.
- **Owner ruling O6, "Where I stopped".** You start Focus, Flow or Narrate at word 100, read to 500 and press Escape. Page shows 500's page, and the book reopens there.
- **Blurby.Brain1, technical option (A).** Each mode's `exportHandoff("persistent")` reports its committed playback word as `publishedWordIndex`. It is mode-local in each runtime: one commit per runtime, and nothing in the router, the orchestrator or shared core, and no sibling import. Narrate: the exact engine cursor word. Focus: the displayed word. Flow: the reading cursor.
  - **"Committed"** means the latest of the playback word and any user-intent commit since then. A click while paused wins. `canonicalWordIndex` is exactly that: each advance and each user-intent commit writes it, and the later write stands (design 10).
  - **Narrate hands over the word itself.** The sentence-start rule (O3) applies when playback restarts, not when Page lands. Design 10 hands over the cursor word, never `sentenceStartAt`'s word.
  - **Rejected (B):** it hides a wrong landing behind the save, and O6 rules it out.
  - **Rejected (C):** it churns the router snapshot every 5 s.
- **Placement.** Brain1 accepts the fold into CPC-1 Wave C, so no separate item (ESCAPE-LANDS-AT-PLAYBACK-1) is registered. Wave C makes the export change in all three runtimes, one commit per mode (step 6). FLOW-SAVE-AS-YOU-GO-1 and NARRATE-SAVE-AS-YOU-GO-1 build on it, make no `exportHandoff` edit, and keep their close rows (fl15, n19) as regression rows.
- **Fence and STOP condition.** The fence is the three `ModeRuntime.ts` files plus the tests. If Page's landing needs anything outside them, STOP to Brain1 with the lines. It does for Focus: that is STOP-LAND-focus, below.
- **Order.** Wave C runs after BLOCK-TEXT-ORDER-1's merge, because BLOCK-TEXT-ORDER-1's Wave B holds the Focus window. Waves A and B are independent of this ruling.
- **Rule 53:** the package pair (Done-when 8).
- **Owner gate (2) row:** "Escape from Focus, Flow or Narrate lands where I stopped." (Done-when 11.)
- **The field** (design 10; Why, "Each runtime's committed playback word"): `s.canonicalWordIndex` in each runtime, at Focus `focus/ModeRuntime.ts:672`, Flow `flow/ModeRuntime.ts:836` and Narrate `narrate/ModeRuntime.ts:422`.
  - Focus: the word the last advance displayed and committed (`:1041`, `:1053-1058`).
  - Flow: the word timer's word, committed at each advance (`:1316-1321`).
  - Narrate: the last cursor the engine published at the heard sample (`onEngineCursor`, `:732`; `tick()`, `narrateEngine.ts:333-348`). That is rule #31's exact cursor word. `getSnapshot().cursor` is stale after a restart (FLOW- and NARRATE-SAVE-AS-YOU-GO-1, Q4), and `wordAtPlaybackSample()` is a timer read, so neither is used.
  - A click while paused commits through `commitShared` with `publishState: true`, which writes the same field, so the reported word is the clicked word.
- **Rows:** f14–f29: Brain1's rows 1–5 for each mode (Focus f14–f18, Flow f19–f23, Narrate f24–f28) and row 6 for Narrate (f29). Rows 1 and 2 are split with Brain1's wording. Rows 1 and 2 are probe P4's route, and P4's text is aligned to them. Row f13 now passes through row 2's mechanism.
- **Pinned rows:** none under (A) alone. STOP-PAGE-BUTTON (a) names the replay exception (Wave C step 6).
- **Not covered by (A), found while folding it (2026-11-03):** STOP-LAND-focus (Page's view after Escape from Focus) and STOP-PAGE-BUTTON (the bottom bar's Page button), both below. Both ruled (a) the same day.

##### Blurby.Brain1 rulings on STOP-LAND-focus and STOP-PAGE-BUTTON (2026-11-03, binding; folded 2026-11-04)
Source: `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.ESCAPE-LANDS-AT-PLAYBACK-1.2026-11-03.md`, section "STOP-LAND-focus and STOP-PAGE-BUTTON". Brain1 corrected one premise: Space is togglePlay, and the capture-current route is the bottom bar's Page button (`ReaderBottomBar.tsx:336`). This spec already says so.
- **STOP-LAND-focus: (a).** On an `exitToPage` arrival, when the opened page does not show the handed-over word, Page jumps to it with `jumpFoliateToWordAnchor`, as `jumpBack` does. The relocate falls under the resume anchor and saves nothing (LL-030). `page/ModeRuntime.ts` joins Wave C's fence, limited to that arrival branch. A brief view of the handed-over cfi's page before the jump is accepted and recorded. Rows: row 1 asserts the final shown page holds the word with the highlight on screen, in all three modes; a page turn right after the landing saves the next page.
  - **Applied in:** What; Outcome; design 11; Wave C step 7; rows f30–f34; probe P4 ("The landing", "A page turn right after the landing"); Done-when 4, 5, 9 and 11.
  - **Planner's application (sent to Brain1 2026-11-04):** the jump runs on every Page arrival with a source, not on `exitToPage` alone. Page cannot tell `exitToPage` from completion without a router edit, which the fence forbids, and STOP-PAGE-BUTTON's row 5 needs the Page button to land too (design 11, "Which arrivals"). The jump itself moves the view only when the word is not on the shown page.
  - **Brain1's reply (2026-11-04): no objection, with one condition.** No word-anchor jump while the view holds a section as uncertified (BLOCK-TEXT-ORDER-1): the landing stays on the handed cfi and logs `arrivalLand:held-uncertified`, through one narrow `page/FoliateView.tsx` edit named as a fence addition; any other route is a STOP to Brain1. A new row arrives from Flow into a section certified off through the `wrapWordsInSpans` hook. The cause stays with WORD-INDEX-UNIFY-1 and XHTML-PARSE-MEASURE-1; the arrival paint by index there is pre-existing and goes to Findings for UNCERTIFIED-ANCHOR-HOLD-1. Brain1 also accepted the replay exception's in-test application and the C-a / C-b split.
    - **Applied in:** design 11 ("Held in an uncertified document"); Wave C step 7 (`isWordAnchorHeld` on the view, with its surface pass-through); rows f35 and f36; Done-when 4, 5 and 9; F-026.
    - **The surface line.** The runtime reaches its view only through `page/surface.ts` (its header: the subset of the view the runtime calls, which the behaviour replays fake). So the view's answer reaches `landArrivalWord()` by one pass-through line there, beside the view's method. This is the same route, not another one: it carries the view's answer and nothing else. It was sent to Brain1 with this fold (2026-11-04).
  - **Brain1's reply on the surface line (2026-11-04): OK.** It is the same route through the G4 seam; reading `viewApiRef` directly is rejected. "Any rendered document is held" is a superset of the shown section, and accepted: a false positive lands on the handed cfi, today's behaviour, and in paginated Page the handed cfi and word share a section. **The cross-section case:** if the handed word is not in the shown section, position wins: jump and log `arrivalLand:cross-section` (Waves A and B remove the cause at its source; the log is the evidence if the contract breaks). The unknown certification of an unrendered target section is a named gap for the memo, with no machinery. Rows f35, f36 and F-026 accepted as folded.
    - **Applied in:** Wave C step 7 (`landArrivalWord()`'s cross-section branch, read from the failed no-motion paint, `arrivalCursorPending`), row f37, Done-when 4.
- **STOP-PAGE-BUTTON: (a).** Both captures report `canonicalWordIndex`, under O6 (where you stopped, whatever the control), so there is no new owner question. Named rule-50 exception, limited to the B0 replay observations that change because of it (`focus.behavior :63-65`, `flow.behavior :68-70`, the `fixtureReplay.tsx :316` route); only the observed word values change, and the memo quotes each before and after. Row 5: the Page button, then Escape, lands at the playback word and stores it, in all three modes; the control (no playback since entry) lands at the entry word.
  - **Applied in:** What; Outcome; design 10; Wave C step 6 (the export line, and the table of exactly four replay values, applied in-test so the review-record fixtures stay byte-unchanged); rows f18, f23, f28 and f31; probe P4 by the Page button; Done-when 4, 5, 9 and 11.
- F-024 is noted by Brain1.

##### STOP-LAND-focus (ruled (a) 2026-11-03; kept as the record)
- **Question.** This is the ruling's own STOP condition: Page's landing needs lines outside the three `ModeRuntime.ts` files. O6 and Brain1's row 1 say Page shows 500's page. Option (A) fixes the word Page holds and stores, but not the page Page's view opens on. After Focus, that page is the one Focus was entered at. How should Page land after an Escape from Focus?
- **The lines** (all at `14ce3d24`):
  - A handover opens Page's view at the handed-over cfi: `initialCfi` from `handoff.cfi` (`page/ModeRuntime.ts:167`), then `view.init({ lastLocation: initialCfi })` (`page/FoliateView.tsx:881-882`). Wave B's hold settles a handover at once with this same choice (design 4).
  - Page paints the handed-over highlight with `allowMotion: false` (`paintArrivalCursor`, `page/ModeRuntime.ts:547-552`). The view scrolls to a word only when motion is allowed (`page/FoliateView.tsx:490`). Page's resume anchor, seeded from the highlight (`page/ModeState.ts:40`), then skips its load-time word jump (`page/ModeRuntime.ts:505-510`).
  - Focus's `cfi` changes only on a relocate (`focus/ModeRuntime.ts:870-873`). Its view moves only to follow a section (`syncSection`, `:975-987`), because Focus advances its word display alone (`jumpDisplayToWord`, `:1225-1228`).
  - So after Focus reads from 100 to 500 in one section, Page opens on the page of word 100 (or the section's first page after a section crossing), with 500 highlighted off screen. The stored word and the reopen are right (row f15); the page shown in between is not, so row f14 cannot pass for Focus. A page turn there would then save that page's first word (`onPageTurned`, `page/ModeRuntime.ts:579-599`).
- **Flow and Narrate.** Their views follow the cursor, so their `cfi` is their view's last relocate. Narrate turns the page to the spoken word (`narrate/ModeRuntime.ts:735-739`, `followSpokenSection`) and records each relocate's cfi unless browsing (`:532-535`). Flow's scrolled view relocates as lines scroll (`flow/ModeRuntime.ts:1049-1052`), so Page opens on the page holding the view's top, which is the cursor's page or the one before it. Probe P4's Flow and Narrate runs record it.
- **Options:**
  - **(a)** Page's arrival by `exitToPage` lands on the handed-over word with `jumpFoliateToWordAnchor`, as `jumpBack` does (`page/ModeRuntime.ts:362-368`), when the opened page does not show it. The relocate it causes falls under the resume anchor, so it saves nothing (LL-030). This is a Page change, outside (A)'s "mode-local in each runtime", and it serves all three modes.
  - **(b)** Focus's persistent export also sends `cfi: null` when it reports a word its `cfi` was not recorded with, and Wave B's open target treats a handover with no cfi and a loaded map as a word target (design 5's landing). Focus and Page change; Flow's and Narrate's cfi stay.
  - **(c)** Accept it. Page shows the old page, and the stored word and the reopen are right. It becomes a finding.
- **Recommendation: (a).** It reuses the jump-back helper Page already has, adds no export field, and also closes Flow's one-page gap. Its lines would join Wave C's fence (`page/ModeRuntime.ts`, which Wave B already edits).

##### STOP-PAGE-BUTTON (ruled (a) 2026-11-03; kept as the record)
- **Question.** The ruling's Defect section says the pause-to-page exit, `"capture-current"`, "already hands over the playback word", and its row 5 keeps that exit unchanged as a control. It hands the word over as the highlight only. The route is the bottom bar's Page button, not Space. Knowing that, should row 5 stand (option (b)), or should (A) also apply to `"capture-current"` (option (a))?
- **The lines** (all at `14ce3d24`):
  - The bottom bar's Page button (`src/components/ReaderBottomBar.tsx:336`; `ReaderContainer.tsx:643-645`) calls `router.pauseToPage()`, a `"capture-current"` transition (`useReaderModeOrchestrator.ts:346-353`). Space is `togglePlay` (`src/hooks/useKeyboardShortcuts.ts:269`), not this route.
  - `"capture-current"` sets the highlight to the engine's word (Focus `:666-668`, Flow `:830-832`, Narrate `:416-418`) but still hands over `s.publishedWordIndex` (Focus `:672`, Flow `:836`, Narrate `:422`). Page copies it (`page/ModeState.ts:33`), and the router snapshot reads it (`useReaderModeOrchestrator.ts:258`).
  - So read to 500, press the Page button, then Escape: the close save writes the entry word (`ReaderContainer.tsx:615`, `:625-626`). With Wave C, Focus's stop save writes 500 first (`"mode-switch"`), and the close then overwrites it. Flow's and Narrate's saves as you go meet the same.
- **Pinned rows.** Extending (A) to `"capture-current"` changes recorded values in both B0 replays: their completion observations (`publishedWordIndex: 7`, `focus.behavior.test.tsx:63-65`, `flow.behavior.test.tsx:68-70`) and each `selectMode` `page` observation (`fixtureReplay.tsx:316`). That is more than one value per replay, so the planner cannot fold it under a rule-50 exception.
- **Options:**
  - **(a)** Report `s.canonicalWordIndex` for both captures, with a Brain1-named rule-50 exception for the replay observations, and Brain1's row 5 (f18, f23, f28) turned into a Page-button-then-Escape row that hands over the playback word.
  - **(b)** `"persistent"` only, as ruled, with row 5 (f18, f23, f28) as written. The Page-button route becomes a finding.
- **Recommendation: (a).** Where the reader stopped should not depend on which control left the mode, and under (b) this route undoes every save as you go.

##### STOP-CLOSE-focus (ruled (A) 2026-11-03; kept as the record)
- **Question.** On the normal close path (Escape twice; Why, "The reader's real close route from Focus"), the close save writes Focus's `publishedWordIndex`, which the displayed word never moves. After Wave C's timed save of W, the close overwrites W with the word Focus was entered at, or the last click or navigation. How should the close save treat a session that left a playback mode? Row f13 cannot pass until this is ruled, and probe P4's tip expectation (the paused word) conflicts with the same trace. The planner designs no fix here, per Brain1's instruction.
- **The lines** (all at `14ce3d24`):
  - `src/components/ReaderContainer.tsx:437`: `const canonicalWordAnchor = toolbar?.currentWordIndex ?? (activeDoc.position || 0);`
  - `src/reader/useReaderModeOrchestrator.ts:258` (the router snapshot): `currentWordIndex: s.publishedWordIndex,`
  - `ReaderContainer.tsx:614-630`, `handleExitReader`: `const exitAnchor = canonicalWordAnchor;` … `if (readingMode === "page") { … if (checkBacktrack(exitAnchor, totalWords, useFoliate)) return; finishReading(exitAnchor); } else { handleExitToPage(); }`
  - `useReaderModeOrchestrator.ts:354-357`, `exitToPage`: `transition("page", "silent", "persistent", "user-stop", (h) => ({ ...h, highlightedWordIndex: h.publishedWordIndex }));`
  - `src/reader/modes/focus/ModeRuntime.ts:663-681`, `exportHandoff`: `publishedWordIndex: s.publishedWordIndex,`; `src/reader/modes/page/ModeState.ts:33`: `this.publishedWordIndex = handoff.publishedWordIndex;`
  - `focus/ModeRuntime.ts:1053-1058`, `onEngineWordAdvance`: `this.anchor.commitPersistentWordIndex(idx, "mode-advance", { persist: false, publishState: false, navigate: false, syncVisual: false });`
  - `focus/helpers/usePersistentReadingAnchor.ts:85-88`: `const shouldPublishState = options.publishState ?? cause !== "mode-advance"; if (shouldPublishState) { state.publishedWordIndex = clamped; }`
  - `src/hooks/useProgressTracker.ts:296-299` and `:243-259`: `finishReading` → `_persistAndLog(finalPos)` → `onUpdateProgress(activeDoc.id, savePos, cfi); api.updateDocProgress(activeDoc.id, savePos, cfi);`
  - `main/ipc/documents.js:22-23`: `if (hasPosition) doc.position = position;` (no forward-only check).
- **What else it touches:**
  - The same path writes Flow's and Narrate's pre-play word (STOP-CLOSE-flow in FLOW-SAVE-AS-YOU-GO-1, STOP-CLOSE-narrate in NARRATE-SAVE-AS-YOU-GO-1), so one ruling may serve all three.
  - Page's arrival seeds its resume anchor from the handed-over highlight, which `exitToPage` sets to the published word (`page/ModeState.ts:40`), so Page's own relocate saves stay suppressed after the exit.
  - `tests/readerModeIsolation.test.ts:348` pins "exitToPage hands off the published word as the highlight". `src/components/ReaderContainer.tsx` is shared core, already in this item's Wave A window.
  - The backtrack prompt catches the overwrite only when the published word trails the furthest mark by about two pages (`useProgressTracker.ts:308-324`; `APPROX_WORDS_PER_PAGE = 250`, `src/constants.ts:164`). P4's 30 s at 300 words a minute is about 150 words, so no prompt shows.

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
- **LL-108:** the hand-off word comes from each mode's own playback truth, its committed canonical word, never the view's page or a fraction (design 10). For Narrate it is the last published cursor, never a timer read (rule #31).
- **Standing rule 55 (promoted from LL-166):** verdicts come from saves, `library.json`, visible word indices and request words, not screenshots.
- **Standing rule 53 (promoted from LL-167):** package verification, with Blurby.Brain1's confirmation before the merge go.
