#### CFI-POSITION-CONSISTENCY-1 — A saved word and its saved page never disagree, so a book reopens where you left it *(Seq 97.5; Full Spec 2026-11-03, revised the same day for the owner's rulings O1–O4 and Blurby.Brain1's O4 rulings; cited against `origin/main` `c5bb507f`; Reader Engine; Blurby.Brain1 finding and ruling of 2026-11-03; serialized after CHAPTER-STEP-CFI-1 (Seq 97); needs a shared-core integration window; not a release gate)*

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
- **Design decisions** (planner proposal for Blurby.Brain1 to confirm; questions B1–B5, B8–B13 and B14–B18; design 9 is Brain1's binding O4 ruling):
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
  8. **Mode isolation.** Each mode's anchor helper is edited in its own copy (Wave A). The hold lives in Page's own files only (Wave B). Focus's saves as you go live in `focus/ModeRuntime.ts` only (Wave C). No sibling import, no shared mutable store, no new shared module. `src/constants.ts` is the shared constants file Page and Focus already import (`page/ModeRuntime.ts:13-16`, `focus/ModeRuntime.ts:16-23`).
  9. **Focus saves as you go (O4; Brain1's binding O4 rulings).**
     - **When:** at the first word advance at least `RSVP_PROGRESS_SAVE_INTERVAL_MS` (5000 ms, `src/constants.ts:168`, never a literal) after the last save or the start of play; and once more on pause, on the pause branch of `togglePlay`, and on `stop()`, which covers a mode switch, Escape to Page, the end of the book and teardown. Each fires only if the word differs from the last word saved.
     - **What:** `ports.persistence.updateDocProgress(documentId, word, null)` then `ports.persistence.updateProgress(documentId, word)`, from one private method. The cfi is an explicit `null`, never `state.cfi`. Under design 1 main then clears the stored cfi whenever the word changed, so B1's rule holds.
     - **Which word:** at an advance, the advanced word. On pause and stop, the engine's current word, the one `captureCurrentAnchor` publishes, read before `stopEngine()`.
     - **Only after Play:** the last-saved word starts as the word Focus opened at, and nothing saves until the engine has run (Play marks engagement, `focus/ModeRuntime.ts:532`; LL-030). Selecting Focus and leaving without Play saves nothing.
     - **No timer:** the interval is checked against `Date.now()` on each advance. Nothing new needs clearing on `stop()` (LL-169).
     - **Only in the book's index space:** on an EPUB, only while the word map is loaded (`document.bookWords`); off EPUB always (question B15).
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
       - "with no relocate since the open, it sends the position with no cfi" and "a relocate recorded for another book is not sent": change only their expected third argument from `undefined` to `null` (both `updateDocProgress` and `onUpdateProgress` where asserted).
       - "after a relocate, it sends that relocate's cfi" stays unedited and green: its ref has no `wordIndex`.

       No other existing test is edited. If any other test pins the `state.cfi` fallback or `undefined` on a close, STOP to Blurby.Brain1 with its name before editing it.
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
  - **Wave C — Focus saves as you go, Focus only** (about 20 tool uses; needs Wave A's `null` contract):
    1. `src/constants.ts:167-168`: keep `RSVP_PROGRESS_SAVE_INTERVAL_MS = 5000` and its value. Change only its comment to name Focus's saves as you go, this item and owner ruling O4. `RSVP_PROGRESS_SAVE_WORD_DELTA` (`:170`) is left as it is (question B14).
    2. `src/reader/modes/focus/ModeRuntime.ts`:
       - add `RSVP_PROGRESS_SAVE_INTERVAL_MS` to the `../../../constants` import (`:16-23`);
       - **fields:** `private lastSavedWord: number` (the word Focus opened at: `handoff.canonicalWordIndex`, set beside `initialCfi` in the constructor, `:425`), `private lastSaveAt = 0`, and `private playedSinceSave = false`;
       - **`private saveProgressWord(word: number): void`:** returns unless `playedSinceSave` is set, `word !== this.lastSavedWord`, the word is at least 0, and either `!this.document.useFoliate` or `this.document.bookWords` is set (B15). Otherwise it calls `this.ports.persistence.updateDocProgress(this.document.documentId, word, null)` and `this.ports.persistence.updateProgress(this.document.documentId, word)`, then sets `lastSavedWord = word` and `lastSaveAt = Date.now()`;
       - **`startEngine`** (`:1009`): on creating an engine, if `playedSinceSave` is false, set it and set `lastSaveAt = Date.now()`, so the first periodic save comes one interval after Play;
       - **`onEngineWordAdvance`** (`:1038`): after the existing `persist: false` commit (`:1053`), `if (Date.now() - this.lastSaveAt >= RSVP_PROGRESS_SAVE_INTERVAL_MS) this.saveProgressWord(idx);`. The commit itself stays `persist: false`;
       - **`pause()`** (`:591`) and **`togglePlay()`'s pause branch** (`:615-620`): right after `captureCurrentAnchor()`, `this.saveProgressWord(this.engine.getCurrentWord())`;
       - **`stop()`** (`:629`): after `if (!this.alive) return;` and **before** `this.alive = false`, `if (this.engine) this.saveProgressWord(this.engine.getCurrentWord());`. `destroy()` reaches it through `stop("teardown")`, and a second `stop()` returns early, so nothing saves twice;
       - a comment on `saveProgressWord` names this item, O4, `3dd4b504` as the regression and LL-030.
    3. Nothing else in Focus changes: not its view, bindings, anchor helper (beyond Wave A) or engine. No other mode changes in Wave C.
  - **Wave D — gates, package and close-out** (about 35 tool uses): Done-when 5–11.
- **Prerequisites:**
  - NARRATE-ARRIVAL-SYNC-1 (Seq 88.5) merged, and gate (1) run 6 recorded.
  - CHAPTER-STEP-CFI-1 (Seq 97, amendment 1, `eb/chapter-step-cfi-1-r2`) merged. `<base>` is `origin/main` after that merge.
  - The `src/types.ts` and `src/components/ReaderContainer.tsx` integration window granted, with no other active sprint editing either file.
  - Blurby.Brain1 confirms B1–B5 before Wave A, B8–B13 before Wave B, and B14–B18 before Wave C. Design 9 is already Brain1's binding ruling.
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

     Record every result in the memo. If a row named RED above is green on `<base>`, STOP: its guard cannot fail.
  2. **Wave A as specified.** Then:
     - `git grep -n -F 'options.cfi ?? state.cfi' -- src/reader/modes` exits 1. It exits 0 on `c5bb507f`, with 4 hits (Page `:100`; Focus, Flow and Narrate `:99`).
     - `git grep -c -F 'cfi === null' -- main/ipc/documents.js src/test-harness/electron-api-stub.ts` exits 0, with both paths listed. It exits 1 on `c5bb507f`.
     - `git diff --name-status <base> -- preload.js` prints nothing and exits 0.
  3. **Wave B as specified.** Then:
     - `git grep -c -F 'PAGE_OPEN_HOLD_TIMEOUT_MS' -- src/constants.ts src/reader/modes/page/ModeRuntime.ts` exits 0, with both paths listed. It exits 1 on `c5bb507f`.
     - `git grep -c -F 'cfiSpineIndex' -- src/reader/modes/page/helpers/persistentReadingAnchor.ts` exits 0. It exits 1 on `c5bb507f`.
     - `git diff --name-status <base> -- src/reader/modes/focus src/reader/modes/flow src/reader/modes/narrate` lists exactly the three `helpers/usePersistentReadingAnchor.ts` files and exits 0.
  4. **Wave C as specified.** Then:
     - `git grep -c -F 'RSVP_PROGRESS_SAVE_INTERVAL_MS' -- src/reader/modes/focus/ModeRuntime.ts` exits 0. It exits 1 on `c5bb507f`.
     - `git grep -c -F 'updateDocProgress' -- src/reader/modes/focus/ModeRuntime.ts` exits 0. It exits 1 on `c5bb507f`.
     - `git grep -n -E '\b5000\b|5_000' -- src/reader/modes/focus/ModeRuntime.ts` exits 1 (no literal interval). It exits 1 on `c5bb507f` too.
     - `git diff --name-status <base> -- src/reader/modes/focus src/reader/modes/flow src/reader/modes/narrate` lists exactly the three `helpers/usePersistentReadingAnchor.ts` files and `src/reader/modes/focus/ModeRuntime.ts`, and exits 0.
  5. **Tests.**
     - `npx vitest run tests/cfiPositionConsistency.ipc.test.js tests/cfiPositionConsistency.shell.test.tsx tests/readerModes/cfiPositionConsistency.test.ts` exits 0.
     - `npx vitest run tests/readerModes tests/readerModeIsolation.test.ts tests/useProgressTracker.test.ts tests/keepFurthest.test.tsx tests/pageReopenCfi.test.ts tests/updateDocProgressLastRead.test.js tests/persistentReadingAnchor.test.ts tests/useLibrary.test.ts tests/narrate` exits 0.
     - `tests/readerModes/chapterStepLanding.test.ts` (CHAPTER-STEP-CFI-1), `tests/readerModes/pagePositionSave.test.tsx` and `tests/narrate/narrate.playSavedPosition.test.ts` (NARRATE-ARRIVAL-SYNC-1) are green and unedited.
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
     - `A tests/cfiPositionConsistency.ipc.test.js`
     - `A tests/cfiPositionConsistency.shell.test.tsx`
     - `A tests/readerModes/cfiPositionConsistency.test.ts`

     Nothing in `preload.js`, `src/utils/FlowScrollEngine.ts`, `src/styles/`, any `mode.css`, Focus's view or bindings, Flow's or Narrate's runtime, view or bindings, `surface.ts`, `ReaderModeAdapter.ts`, `src/reader/useReaderModeOrchestrator.ts`, `src/App.tsx` or `src/hooks/useReader.ts`.
  10. **Merge-tree check:** `git merge-tree` of the tip against `origin/main` is clean at the merge go. A conflict in a fenced file goes to Blurby.Roadmap before resolution.
  11. **Owner, added to gate (2)'s list:**
      - after a chapter jump, quit and reopen: the book opens in the jumped-to chapter;
      - a book that had only a saved word opens at that word, after "Loading book..." and with no jump;
      - Narrate after a reopen starts at the saved word's sentence;
      - read in Focus for a while, then close the app any way at all: the book reopens within a few seconds' reading of where Focus was;
      - pause in Focus and reopen: the book opens at the paused word.
- **Effort:** M, in four waves (A, B, C, D; each about 40 tool uses or fewer, and each its own dispatch). Technical effort: medium for A, C and D, high for B.
- **Owners:**
  - Blurby.Brain1 confirms the contract (B1–B5) before Wave A, the hold (B8–B13) before Wave B and Focus's open details (B14–B18) before Wave C, and confirms the rule 53 pair;
  - RodneySr implements, tests and probes; Rodney runs the arm64 launch;
  - spec-compliance, then quality review;
  - Blurby.Roadmap grants the integration window, gives the merge go and closes it out.
- **Merge order:**
  - after NARRATE-ARRIVAL-SYNC-1, gate (1) run 6 and CHAPTER-STEP-CFI-1;
  - before FLOW-TOC-JUMP-WORD-1 (Seq 110), FURTHEST-PERSIST-1 (Seq 114; `main/ipc/documents.js`, `src/hooks/useLibrary.ts`, `src/types.ts`) and FOCUS-PAUSED-HANDOFF-1 (Seq 118). Each re-greps after this lands.
  - Any later item that edits `src/reader/modes/page/FoliateView.tsx` or `page/ModeRuntime.ts` re-greps the hold's lines. Any later item that edits `focus/ModeRuntime.ts` (FOCUS-PAUSED-HANDOFF-1 among them) re-greps `saveProgressWord` and keeps its calls in `pause()`, `togglePlay()` and `stop()`.
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

##### Questions for Blurby.Brain1
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
- **LL-169:** the hold's timer and promise end with the runtime (`stop()`, `destroy()`), and the view checks `cancelled` after each await, separately from the target's own settle-once guard. Focus's saves as you go add no timer: the interval is checked on each word advance, and `stop()` saves before it marks the runtime dead.
- **Standing rule 55 (promoted from LL-166):** verdicts come from saves, `library.json`, visible word indices and request words, not screenshots.
- **Standing rule 53 (promoted from LL-167):** package verification, with Blurby.Brain1's confirmation before the merge go.
