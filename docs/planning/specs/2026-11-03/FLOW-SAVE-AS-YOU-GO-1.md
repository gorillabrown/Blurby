#### FLOW-SAVE-AS-YOU-GO-1 — Flow saves your place every few seconds while it plays, so a quit or crash reopens within a few words *(Seq 97.6; Full Spec 2026-11-03, cited against `origin/main` `14ce3d24`; Reader Engine; owner ruling O5 and Blurby.Brain1's general rules G1–G8 of 2026-11-03; Q1–Q3 ruled 2026-11-03; close row added 2026-11-03; not dispatch-ready: STOP-CLOSE-flow (the reader's close save writes the word Flow was entered at, not the cursor) is open with Blurby.Brain1; after CFI-POSITION-CONSISTENCY-1; no shared-core edit; not a release gate)*

- **What:**
  - Flow saves its reading cursor (the word timer's word) while it plays: every `RSVP_PROGRESS_SAVE_INTERVAL_MS` (5,000 ms), and once more when playback pauses or stops, each time only if the word has changed since Flow's last save.
  - Every such save sends an explicit `null` cfi, so main clears the stored page whenever the word moved, and the stored pair never disagrees.
  - A scroll-away pauses Flow today. Its pause save records the cursor word, never the word the view scrolled to.
  - Flow keeps no sentence-start rule. A reopen resumes at the saved word itself.
  - **Out of scope:**
    - Focus (CFI-POSITION-CONSISTENCY-1 Wave C) and Narrate (NARRATE-SAVE-AS-YOU-GO-1, Seq 97.7).
    - Flow's relocate save and its guards (`shouldPersistRelocateProgress`, browse-away, the resume anchor). They are unchanged (G8).
    - The shell's bridge, its debounced relocate timer and main's write path. They are unchanged.
    - `src/constants.ts`. CPC-1 Wave C already rewrites the interval's comment for all three modes (G2).
    - The end of the book. Flow's completion stops playback before the router stops Flow (`onEngineComplete`, `flow/ModeRuntime.ts:1352-1358`), and the shell's completion path owns the finish save, unchanged.
    - The legacy, test-only `src/hooks/usePersistentReadingAnchor.ts`.
  - **Outcome:**
    - On *Meditations*, Flow plays at 300 words a minute for 20 s, then the app is killed with no graceful quit. The reopen shows a word at most 29 words behind the last cursor word (39 if a relocate save landed last; see G5), and the stored cfi is absent unless a relocate save landed last.
    - Flow plays, pauses, and the app is killed. The reopen opens at the paused word, with no stored cfi.
    - Flow plays and the reader scrolls away. Flow pauses, and the saved word is the cursor word, not the word on screen.
    - Flow plays for about 12 s, then the reader closes the book the normal way (Escape twice). The stored word is not older than the last timed save. **Held:** at `14ce3d24` the close save writes an older word (STOP-CLOSE-flow).
- **Why** (owner ruling O5, 2026-11-03; Findings F-016; Blurby.Brain1 G1–G8, 2026-11-03). All lines are at `origin/main` `14ce3d24`:
  - **Flow saves during play only when the view moves.**
    - Every word advance commits with `persist: false` (`src/reader/modes/flow/ModeRuntime.ts:1316-1321`, in `onEngineWordAdvance`, `:1302`).
    - The only save during play is the relocate save (`:1078`, `ports.persistence.scheduleRelocateSave`). It is gated by the resume anchor, engagement and browsing (`:1054-1069`; `shouldPersistRelocateProgress` is `hasEngaged && !hasResumeAnchor && !userBrowsing`, `flow/helpers/persistentReadingAnchor.ts:82-93`).
    - The shell debounces it by `FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS` (2,000 ms, `src/constants.ts:172`) and writes the word it was scheduled with (`src/components/ReaderContainer.tsx:323-337`). Each new relocate restarts that timer (`:331`).
    - `pause()` (`:763`), the pause branch of `togglePlay()` (`:780-786`) and `stop()` (`:790`) save nothing.
    - So a span read while the view does not relocate, or while a guard returns early, is lost on a kill.
  - **A scroll-away pauses Flow.** The line pacer's `onUserBrowseAway` (`:1387`) and `pollBrowsing` (`:1172-1178`) reach `setBrowsedAway(true)` (`:1473-1476`), which calls `pausePlayback()` (`:1464-1470`). While browsing, the relocate handler neither writes the cfi (`shouldWriteRelocateCfi`, `:1049`) nor saves (`:1069`).
  - **The reading cursor is the word timer's word.** `FlowMode.start` publishes the start word at once (`:108-113`); each tick advances it (`:234-238`); `getCurrentWord()` returns it (`:132-134`). Under BAND-ALIGN-2's one clock the line pacer follows it (`syncToWord`, `:1347`). During a section hand-off hold (`handoffHold`, `:1327-1336`) or a page-turn wait (`pendingResume`, `:1339-1343`) the timer is paused with `playing` still true, and its word is the held word.
  - **Flow's engine words.** `start()` copies `effectiveWords()` (`:717`): the book's word map when `document.bookWords` is loaded, else the view's loaded slice, else `tokenWords` (`:1559-1566`). An engine started before the map keeps the slice: `adoptDocument` (`:654-671`) does not restart it, and `onWordsReextracted` only refreshes the slice while there is no map (`:1117-1119`). So "the map is loaded now" does not prove the engine's indices are the book's (question Q3).
  - **The bridge after CPC-1 Wave A.** `ports.persistence.updateDocProgress(docId, word, null)` reaches `ReaderContainer.tsx:311-316`. It calls `api.updateDocProgress`, forwards `null` to the library copy, and raises keep-at-furthest's mark through `noteHighWater` (`:315`) with a `null` furthest cfi (G6). Main sets the position and clears the stored cfi only when the position changed (CPC-1 design 1). Today `ReaderPorts.ts:20` types the cfi as `string`; CPC-1 Wave A widens it to `string | null`. **No shared-core edit is needed here.**
  - **Write cost** (G5, G7). `update-doc-progress` (`main/ipc/documents.js:14-31`) mutates the in-memory doc, calls `ctx.saveLibrary()` (`:28`) and enqueues `update-progress` (`:31`). `saveLibrary` (`main.js:120-131`) coalesces writes over `LIBRARY_SAVE_DEBOUNCE_MS` (500 ms, `main/constants.js:155`). A graceful quit flushes it (`main.js:643`); a kill inside the window loses the newest save. `enqueue` rewrites `sync-queue.json` on each call (`main/sync-queue.js:169-182`, `saveQueue` `:53`; Findings F-018). Only one mode plays at a time, so the new saves add at most 12 of each a minute (G7), plus at most one extra write per pause (design 6).
  - **Three facts G1–G8 did not settle** (questions Q1–Q3, all ruled 2026-11-03; see "Blurby.Brain1 rulings on Q1–Q3"):
    1. **A mode-exit save was rejected by the port broker.** The router stops the outgoing mode inside `broker.teardown` (`src/reader/useReaderModeOrchestrator.ts:303-307`). At `14ce3d24` only release-class calls pass there (`src/reader/ports/createReaderPorts.ts:46-49`, `:108-110`): `settings.update{isNarrating}` and `diagnostics.*`. CPC-1 Wave C adds `persistence.updateDocProgress` and `persistence.updateProgress` to that list, once for all three modes, with the pinned rows of `tests/readerModeIsolation.test.ts` under a named exception (Q1 ruling). This item makes no broker edit.
    2. **A pending relocate save can land after a newer pause save.** The shell's relocate timer writes the word it was scheduled with, up to 2,000 ms later. If the reader pauses within 2 s of the last relocate, that older word, with its viewport cfi, overwrites the pause save. While Flow plays, its scrolled view relocates as lines scroll, so a pending relocate save is the normal case at a pause (Q2).
    3. **An engine started before the word map keeps slice indices** (above; Q3).
  - **The B0 baseline replay is unaffected.** `tests/readerModes/flow.behavior.test.tsx:52-55` replays `docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/flow.baseline.json` byte for byte, and `:82` pins core-0 step 11's effects (a stop while playing). Its document has `useFoliate: true` and `bookWords: null` (`tests/readerModes/harness/fixtureReplay.tsx:264-266`), so under G4 Flow's engine runs on slice words and never saves there. The test stays green and unedited. If it goes red, STOP to Blurby.Brain1 with the diff: it means the G4 guard is wrong.
  - **The reader's close save does not follow the reading cursor** (traced at `14ce3d24`; STOP-CLOSE-flow, below; row fl15). The normal close is Escape twice:
    - The first Escape reaches `handleExitReader` (`src/components/ReaderContainer.tsx:614-630`). Outside Page it calls `handleExitToPage()` (`:627-629`), which is `router.exitToPage()` (`src/reader/useReaderModeOrchestrator.ts:133`, `:354-357`). That stops Flow with `"user-stop"`, so this item's exit save writes the cursor word (design 12).
    - The handover to Page is `exportHandoff("persistent")` (`flow/ModeRuntime.ts:827-845`), with `highlightedWordIndex` replaced by `publishedWordIndex` (`useReaderModeOrchestrator.ts:356`). Page copies `publishedWordIndex` from it (`page/ModeState.ts:33`).
    - The second Escape, now in Page, runs `finishReading(exitAnchor)` (`ReaderContainer.tsx:625-626`). `exitAnchor` is `canonicalWordAnchor` (`:615`), the router snapshot's `currentWordIndex` (`:437`), which is the active runtime's `publishedWordIndex` (`useReaderModeOrchestrator.ts:258`).
    - `finishReading` calls `_persistAndLog(finalPos)` (`src/hooks/useProgressTracker.ts:296-299`), which writes `savePos` through `onUpdateProgress` and `api.updateDocProgress` (`:258-259`). Main sets the position with no forward-only check (`main/ipc/documents.js:22-23`).
    - **Flow's cursor does not move `publishedWordIndex`.** Each advance commits with `persist: false, publishState: false` (`flow/ModeRuntime.ts:1316-1321`), and the anchor helper writes `publishedWordIndex` only when `publishState` is true (`flow/helpers/usePersistentReadingAnchor.ts:85-88`). `pausePlayback()` publishes nothing (`:1464-1470`).
    - So `finalPos` is the word Flow was entered at (`syncVisualToPersistentWord` on select, `:684`, and two frames later, `:1546`), or the last click, navigation or jump back. After 12 s of reading, the close save overwrites the last timed save W with that older word. The backtrack prompt does not catch it: it shows only when the word trails the furthest mark by about two pages (`useProgressTracker.ts:308-324`; `APPROX_WORDS_PER_PAGE = 250`, `src/constants.ts:164`).
  - **Users see:** read in Flow for a minute without the page moving much, close the app hard, and the book reopens where Flow started.
- **Design decision:** technical (Blurby.Brain1 G1–G8); the behaviour is owner ruling O5 ("save as you go", like Focus under O4).
- **The design** (mirrors CPC-1 design 9; every line in `src/reader/modes/flow/ModeRuntime.ts` only):
  1. **Which word (G1):** the word timer's word: the advanced index at an advance, `this.engine.getCurrentWord()` at a pause or a stop. Never the viewport's word, the relocate fraction or `findFirstVisibleWordIndex`.
  2. **When (G2):**
     - at the first word advance at least `RSVP_PROGRESS_SAVE_INTERVAL_MS` after the last save or the latest start of playback;
     - once more when playback pauses: `pausePlayback()` with `playing` true before it. That covers `pause()`, `togglePlay()`'s pause branch, the scroll-away pause and the cross-book pause (`onScrollEngineComplete`, `:1413`);
     - once more on `stop()` with `playing` true: a mode exit or a cross-book open, inside the router's teardown window (design 12, Q1). Not on unmount.
     - Each fires only if the word differs from Flow's last save.
     - **Not frame-driven.** The timed save runs in `onEngineWordAdvance`, which Flow's word timer calls from a `setTimeout` chain (`FlowMode.scheduleNext`, `flow/ModeRuntime.ts:234-238`), not from animation frames. A hidden window slows that chain under Chromium's timer throttling, and the cursor with it, so a save never leads the cursor.
  3. **"Flow's last save"** is the last word Flow itself wrote: a save from this design, or a persisted commit through `commitShared` (`:1594-1603`: a click, an off-EPUB navigation, and CHAPTER-STEP-CFI-1's landing). A relocate save counts only under G8.
  4. **The interval clock restarts at each start or resume of playback.** Flow's Play is always a cold restart (`togglePlay`, `:780-788`), and the pause before it already saved. Unlike CPC-1 Wave C, which arms the clock once, this avoids a save on the first word after a long pause.
  5. **Only on paused or stopped playback that was playing.** A `pause()` or `stop()` while already paused saves nothing. A click while paused (`hardSelect`, `:882`) saves its own word and leaves the engine where it was (`:905-908`). A later stop must not overwrite that click with the engine's older word.
  6. **The cfi (G3):** every save is `updateDocProgress(documentId, word, null)` then `updateProgress(documentId, word)`. No cfi is derived for the word. The relocate save keeps its own viewport cfi.
  7. **The map guard (G4, Q3 ruling):** the guard checks the word space the running engine started on, and saves only if that start used the map's words: `engineOnBookWords`, set at each `start()` from the word source `effectiveWords()` just used (`!useFoliate || bookWords != null`). An engine started on slice words never saves, even after the map arrives, until it restarts on the map. In Flow that is the next Play, because Flow's Play is always a cold `start()` (`togglePlay`, `:780-788`).
  8. **No double write (G8):** `onRelocate` records `{ word, at }` just before it schedules its save. A save of the same word within `RSVP_PROGRESS_SAVE_INTERVAL_MS` of that record is skipped and counted as Flow's last save.
  9. **The re-save after a pending relocate save (Q2 ruling).** Flow re-saves after a pending relocate save lands, only if that save's word differs from the pause word. When a pause save writes word `w`, and the last relocate save was scheduled less than `FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS` ago with a different word, Flow arms one timer from its own `setTimer` (`:1625-1631`). It fires 1 ms after that relocate save is due and writes `w` again with `null`, but only if Flow is still paused, its last save is still `w`, and no newer relocate was scheduled. The final stored word is then the pause word (row fl13). `stop()` clears it with every other timer (`clearTimers`, `:1641-1646`; LL-169). A stop has no such re-save, because the runtime is gone. That case is bounded by G5's relocate term.
  10. **Only after Play (LL-030):** the last-saved word starts as the word Flow opened at (`handoff.canonicalWordIndex`), and nothing saves until a start has run the engine.
  11. **Isolation:** no shared helper, no sibling import, no new shared module. The constants come from `src/constants.ts`, which Flow already imports (`:19-27`).
  12. **The exit save (Q1 ruling, with Brain1's C1 condition).** Flow relies on CPC-1 Wave C's release list and makes no broker edit.
      - The exit save is made synchronously inside `stop()`, during `broker.teardown`, after every save timer is cleared. Flow's save timers are design 9's re-save (cleared by `clearTimers()`, `:795`) and the word timer that drives the timed save (cleared by `stopEngine()`, `:801`; `FlowMode.stop`, `:127-130`). So the word is read first and saved after both.
      - Nothing asynchronous saves after release. The broker's release allowance ends with the teardown frame (`createReaderPorts.ts:189-200`, `:109-110`), and row fl12 shows nothing is even attempted.
      - **Not on unmount.** `router.destroy()` runs `closeAll(false)`, which closes every key with no release window before `destroy()` calls `stop("teardown")` (`useReaderModeOrchestrator.ts:312-326`, `:377-379`). So `stop()` skips the exit save when its reason is `"teardown"`. That reason reaches it only from `destroy()` with no earlier `stop()`, because transitions pass `"mode-switch"` or `"user-stop"` and a cross-book open passes `"user-stop"` (`:321`). The last timed save bounds an unmount, as it bounds a kill (row fl14).
- **Crash window (G5).** Flow's default speed is 300 words a minute: Flow reads `flowWpm ?? wpm` (`:516-518`), and `wpm` defaults to `DEFAULT_WPM = 300` (`src/constants.ts:7`, `DEFAULT_SETTINGS` `:312`). Rhythm pauses only slow it.
  - **Last write a timed or pause save:** the stored word trails the last cursor word by at most one interval, main's 500 ms and one word: `ceil(300 × 5,500 / 60,000) + 1` = **29 words**.
  - **Last write a relocate save** (a stored cfi is present): add the relocate debounce's 2,000 ms: `ceil(300 × 7,500 / 60,000) + 1` = **39 words**.
  - The unit rows run with fake timers and no shell timer, so their bound is one interval and one word: `ceil(300 × 5,000 / 60,000) + 1` = **26 words**.
- **The change.** Line numbers are at `14ce3d24`. CHAPTER-STEP-CFI-1 and CFI-POSITION-CONSISTENCY-1 move lines in this file, so re-grep every cited line at the cut (standing rule 36):

  ```
  git grep -n -E '^  (start|pause|resume|togglePlay|stop)\(|private (onEngineWordAdvance|startEngine|pausePlayback|setBrowsedAway|commitShared|setTimer|clearTimers|completeLanding)|onRelocate = |scheduleRelocateSave|const effectiveWords = \[|this\.startEngine\(|\} from "\.\./\.\./\.\./constants"' -- src/reader/modes/flow/ModeRuntime.ts
  git grep -n -E 'RSVP_PROGRESS_SAVE_INTERVAL_MS|FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS' -- src/constants.ts src/reader/modes
  git grep -n -E 'READER_PORT_RELEASE_CALLS = |persistence\.updateDocProgress' -- src/reader/ports/createReaderPorts.ts
  git grep -n -E 'cfi\?: string' -- src/reader/ports/ReaderPorts.ts
  ```

  If `ReaderPorts.ts` still types the cfi as `string` only, CPC-1 Wave A has not merged: STOP. If `READER_PORT_RELEASE_CALLS` lacks `"persistence.updateDocProgress"` or `"persistence.updateProgress"`, CPC-1 Wave C has not merged: STOP.

  - **Wave A — red rows, the change and the tests** (about 35 tool uses):
    1. **Imports** (`:19-27`): add `RSVP_PROGRESS_SAVE_INTERVAL_MS` and `FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS`. Add no constant and rename none (G2).
    2. **Fields** (after `arrivalCursorPending`, `:576`):
       - `private lastSavedWord: number`, set in the constructor beside `initialCfi` (`:588`) to `handoff.canonicalWordIndex`;
       - `private lastSaveAt = 0`;
       - `private playedSinceSave = false`;
       - `private engineOnBookWords = false`;
       - `private lastRelocateSave: { readonly word: number; readonly at: number } | null = null`.
    3. **`private saveProgressWord(word: number, reason: "interval" | "pause" | "stop"): void`.** It returns unless all of these hold:
       - `playedSinceSave` and `engineOnBookWords` are true;
       - `word >= 0` and `word !== this.lastSavedWord`.

       Then:
       - **G8:** if `lastRelocateSave` has the same word and was recorded less than `RSVP_PROGRESS_SAVE_INTERVAL_MS` ago, set `lastSavedWord = word` and `lastSaveAt = Date.now()`, and return.
       - Otherwise call `this.ports.persistence.updateDocProgress(this.document.documentId, word, null)` and `this.ports.persistence.updateProgress(this.document.documentId, word)`. Set `lastSavedWord = word` and `lastSaveAt = Date.now()`.
       - **Q2:** if `reason === "pause"`, arm design 9's re-save. Capture `const relocate = this.lastRelocateSave`. If it is set, its word differs from `word`, and `relocate.at + FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS - Date.now() >= 0`, call `this.setTimer(() => this.resaveAfterRelocate(word, relocate), <that remainder> + 1)`.

       Its comment names this item, owner O5, G1–G8 and LL-030.
    4. **`private resaveAfterRelocate(word: number, relocate: { word: number; at: number }): void`:** returns unless `!this.state.playing`, `this.lastSavedWord === word` and `this.lastRelocateSave === relocate`. Then it makes the same two port calls with `null`, without the changed-word check.
    5. **`start()`** (`:694`): right after `const effectiveWords = [...this.effectiveWords()];` (`:717`), compute `const onBookWords = !this.document.useFoliate || this.document.bookWords != null;`. Just before `this.startEngine(startWord, effectiveWords, paragraphBreaks)` (`:759`), set `this.engineOnBookWords = onBookWords`, `this.playedSinceSave = true` and `this.lastSaveAt = Date.now()`. Nothing changes on the early returns (`:697`, `:713`, `:725`, `:734`).
    6. **`resume()`** (`:772-777`): after `this.engine.resume()`, `this.lastSaveAt = Date.now()`.
    7. **`onEngineWordAdvance`** (`:1302`): after `s.currentWordIndex = idx;` (`:1323`) and before the `found` check, add `if (Date.now() - this.lastSaveAt >= RSVP_PROGRESS_SAVE_INTERVAL_MS) this.saveProgressWord(idx, "interval");`. The commit stays `persist: false` (`:1316-1321`).
    8. **`pausePlayback()`** (`:1464`): first `const wasPlaying = this.state.playing;`. After `this.state.playing = false;` (`:1469`), add `if (wasPlaying && this.engine) this.saveProgressWord(this.engine.getCurrentWord(), "pause");`.
    9. **`stop()`** (`:790`; design 12). The parameter `_reason` becomes `reason`.
       - After `if (!this.alive) return;` (`:791`), read the word while the engine still exists: `const exitWord = reason !== "teardown" && this.state.playing && this.engine ? this.engine.getCurrentWord() : null;`.
       - Immediately after `this.stopEngine();` (`:801`), which follows `this.clearTimers();` (`:795`), add `if (exitWord != null) this.saveProgressWord(exitWord, "stop");`.
       - `saveProgressWord` does not read `alive` (`:792` has already cleared it). A `"stop"` save arms no re-save.
       - `destroy()` reaches `stop("teardown")` (`:812`) only when nothing stopped the runtime first, which is the unmount path. A second `stop()` returns early.
    10. **`onRelocate`** (`:1042`): just before `this.ports.persistence.scheduleRelocateSave(...)` (`:1078`), add `this.lastRelocateSave = { word: progressAnchor, at: Date.now() };`. Nothing else in the handler changes.
    11. **`commitShared`** (`:1594-1603`): after the commit, `this.lastSavedWord = clamped;`.
    12. Nothing else changes: not Flow's view, bindings, surface, helpers or engine class, no other mode, and no existing test.
  - **Wave B — package, probes and close-out** (about 35 tool uses): Done-when 5–8.
- **Prerequisites:**
  - CFI-POSITION-CONSISTENCY-1 merged (Waves A–D). Wave A gives the `null` contract (`ReaderPorts.ts`, the bridge, main and the library copy); Wave B gives the open hold, so a reopen at a word with no cfi opens on that word.
  - Blurby.Brain1 ruled Q1–Q3 on 2026-11-03 (below). Q1's broker change lands in CPC-1 Wave C, which must be merged. **STOP-CLOSE-flow is open: Blurby.Brain1 rules it before Wave A.**
  - RodneySr has the canonical clone `C:\Users\estra\Projects\Blurby` with `node_modules`, the sample *Meditations* and the recipe for x64 `--dir` packages. Rodney has its canonical clone for the arm64 build.
- **Execution host:** RodneySr (x64) for the implementation, the tests, the packages, the probes and the rule 53 pair. Rodney (arm64) only for the rule 53 arm64 launch.
- **Branch:** `eb/flow-save-as-you-go-1` at `C:\Users\estra\Projects\Blurby\.worktrees\flow-save-as-you-go-1` on RodneySr. Create it after CFI-POSITION-CONSISTENCY-1 merges, with `git -C C:/Users/estra/Projects/Blurby worktree add -b eb/flow-save-as-you-go-1 .worktrees/flow-save-as-you-go-1 origin/main`. `<base>` is that `origin/main`. Push with `git push origin HEAD:refs/heads/eb/flow-save-as-you-go-1` (LL-181).
- **Done when** (every command in `pwsh` from the worktree root):
  1. **Red first (standing rule 43).** Commit `tests/readerModes/flowSaveAsYouGo.test.ts` alone, before any source edit. It reaches no new name. Record every row's result on `<base>` in the memo. If a row named RED is green on `<base>`, STOP: its guard cannot fail.

     **Setup.** The real router and runtimes over `harness/fakePorts` (`createReaderModeRouter`, `createReaderPorts(fake.infra)`), so a mode exit runs through `broker.teardown`. `vi.useFakeTimers({ now: 0 })`.
     - **The book** is a test-local fixture, not an edit of `harness/zeroWordBook.ts`: 600 words `w0`…`w599` with a sentence end every 10th word, and two sections (`sectionIndex` 1: 0–300; 2: 300–600) with spine cfis `epubcfi(/6/4!/4/2)` and `epubcfi(/6/6!/4/2)`.
     - **The view** is modelled on `createZeroWordView` (`zeroWordBook.ts:43`). It shows one section, `highlightWordByIndex` is true for that section's words, and `isUserBrowsing` is a test switch. It is set on the active runtime's `viewApiRef` after each select.
     - **The open:** `openDocument` at word 20 with the section-1 cfi and the map loaded, then `router.select("flow")`. Flow's WPM is 300 with rhythm pauses off. Play is `router.togglePlay()`.
     - **The count:** every `persistence.updateDocProgress` effect is counted and folded into a stored doc `{ position: 20, cfi: section-1 }` with CPC-1's rule (`null` clears the cfi when the position changes).
     - **(fl1, row 1: kill during play):** play 12,000 ms. There are exactly two saves, each `("doc-1", w, null)`. The first comes at the first advance at least 5,000 ms after Play, the second at least 5,000 ms after the first. The last saved word trails the engine's word at 12,000 ms by at most 26 words. **RED** (no save).
     - **(fl2, row 2: pause, then reopen at the paused word):**
       - after fl1, `router.togglePlay()` makes exactly one more save: `engine.getCurrentWord()` (read as `getSnapshot().highlightedWordIndex`) with `null`. A second run pauses with `runtime.pause()`: the same.
       - Then a new router opens the folded doc and selects Flow, and Play's first word is the saved word itself (no sentence start).
       - **RED.**
     - **(fl3, row 3: scroll away while playing):**
       - play 3,000 ms;
       - set the view's `isUserBrowsing` to true, call `onUserBrowseAway()`, then `onRelocate({ cfi: section-2 cfi, fraction: 0.8 })` (the viewport's word would be 480).
       - Flow is paused; exactly one save was made, of the cursor word at the scroll, with `null`; no `scheduleRelocateSave` was recorded after the scroll began.
       - **RED** (no save).
     - **(fl4, row 4: no write while paused or unchanged):** play 7,000 ms (one timed save), `togglePlay()` (one pause save), 30,000 ms of fake time, `pause()` again, then `router.select("page")`. The count is exactly 2. **RED** (0).
     - **(fl5, row 5: the stored cfi is null after a timed save):** after fl1, the folded doc holds the last saved word and no `cfi`. **RED** (section-1 cfi kept).
     - **(fl6, G8: no duplicate after a relocate save of the same word):** play 6,000 ms (one timed save). Call `onRelocate` with the section-1 cfi while the engine is on word `W`; the fake records `scheduleRelocateSave({ wordIndex: W })`. Pause at once. There is no pause save, and no re-save timer fires in the next 3,000 ms. Guard row: green on `<base>`, where nothing saves.
     - **(fl7, GREEN control):** select Flow, wait 10,000 ms with no Play, then `router.select("page")`. There is no save from Flow (LL-030). Green on `<base>` and after.
     - **(fl8, G4: no map, no save):**
       - (a) the same as fl1 with `bookWords: null`, the engine on the view's slice words: no save in 12,000 ms.
       - (b) during (a), publish the map through the fake document port: still no save until a pause and a new Play; after the new Play, fl1's cadence holds.
       - Guard row: green on `<base>`.
     - **(fl9, Q2: the re-save after a pending relocate save):** play 6,000 ms. Call `onRelocate` while the engine is on `W1`, advance 600 ms (the engine is on `W1 + 3`), then pause. There is exactly one pause save of `W1 + 3`, and exactly one more save of `W1 + 3` with `null` 1,401 ms later (2,001 ms after the relocate), and none after it. **RED** (no save).
     - **(fl10, Q1: mode exit while playing):** play 7,000 ms (one save), then `router.select("page")` with no pause. There is exactly one more save, of the word at the stop, with `null`, accepted by the broker (no `port-rejected` diagnostic names a `persistence.` method). Then `router.destroy()`: no further save. **RED.** (The Q1 (C) branch of the first draft is dropped: Q1 was ruled (B).)
     - **(fl11, a click while paused is not overwritten):** play 3,000 ms, pause (one save), `hardSelect` word 250 with a cfi (Flow's click save), then `router.select("page")`. The last save is the click's `("doc-1", 250, <its cfi>)`. Guard row: green on `<base>`.
     - **(fl12, Q1 condition: nothing saves after teardown):** the router runs over this file's own `createReaderPorts(fake.infra)`, so `broker.stats` and the fake's diagnostics are readable.
       - Play 6,000 ms, call `onRelocate` while the engine is on `W1`, advance 600 ms and pause, which arms design 9's re-save. Keep the Flow runtime as `old`.
       - Then `router.select("page")` at once, before the re-save is due, and advance 30,000 ms. No `persistence.*` call from `old` is accepted or rejected after the switch: `broker.stats.rejected` has no `persistence.` key, and the effect count is unchanged.
       - Also call `old`'s private `onEngineWordAdvance(W1 + 10)` through a cast: still nothing.
       - Guard row: green on `<base>`, where nothing saves. After the change it fails if the re-save timer or the word timer outlives `stop()`.
     - **(fl13, Q2: the pause word is the final stored word):** fl9's steps, with the count's fold also applying each recorded `scheduleRelocateSave({ wordIndex, cfi })` to the stored doc `FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS` after it is recorded. That is a test-local model of the shell's debounced writer (`ReaderContainer.tsx:323-337`); a newer schedule replaces a pending one, as `:331` does.
       - 3,000 ms after the pause, the stored position is `W1 + 3`, the pause word, with no `cfi`.
       - A second run, in which the relocate comes while the engine is already on the pause word, makes no pause save (G8) and no re-save. The stored position is still the pause word, from the relocate save.
       - **RED** (the stored position is the relocate's `W1`).
     - **(fl14, no save on unmount):** play 7,000 ms (one save), then `router.destroy()` with no pause. No `persistence.*` call is made: none is accepted, `broker.stats.rejected` has no `persistence.` key, and no `port-rejected` diagnostic names one (design 12). Guard row: green on `<base>`.
     - **(fl15, the close row: the close save keeps the last timed save):**
       - **The close path**, composed test-locally as the shell runs it: `router.exitToPage()` (the first Escape, `ReaderContainer.tsx:627-629`), then the second Escape in Page: `checkBacktrack(a, total, true)` and, when it returns `false`, `finishReading(a)` from `renderHook(() => useProgressTracker({...}))`, where `a` is `router.getSnapshot().currentWordIndex` (`ReaderContainer.tsx:437`, `:615`, `:625-626`). `window.electronAPI.updateDocProgress` is the stub pattern of `tests/useProgressTracker.test.ts`, and its calls are folded into the stored doc with the rest.
       - Play 12,000 ms, so a timed save writes `W`. Then the close path.
       - The stored position is not older than `W` (`>= W`).
       - **RED** on `<base>` (no timed save). **Held:** by the trace under STOP-CLOSE-flow it stays RED after Wave A as written, because the close save writes Flow's `publishedWordIndex`, the word 20. Wave A does not start until Blurby.Brain1 rules STOP-CLOSE-flow.
  2. **Wave A as specified.** Then:
     - `git grep -c -F 'RSVP_PROGRESS_SAVE_INTERVAL_MS' -- src/reader/modes/flow/ModeRuntime.ts` exits 0. It exits 1 on `<base>`.
     - `git grep -n -F 'updateDocProgress(this.document.documentId' -- src/reader/modes/flow/ModeRuntime.ts` exits 0. It exits 1 on `<base>`.
     - `git grep -n -E '\b5000\b|5_000|\b2000\b' -- src/reader/modes/flow/ModeRuntime.ts` exits 1 (no literal interval or debounce).
     - `git grep -n -E 'reason !== "teardown"' -- src/reader/modes/flow/ModeRuntime.ts` exits 0. It exits 1 on `<base>`.
     - `git diff --name-status <base> -- src/constants.ts src/components src/types.ts src/utils src/reader/ports src/reader/modes/page src/reader/modes/focus src/reader/modes/narrate main preload.js` prints nothing and exits 0.
  3. **Tests.**
     - `npx vitest run tests/readerModes/flowSaveAsYouGo.test.ts` exits 0.
     - `npx vitest run tests/readerModes tests/readerModeIsolation.test.ts tests/readerModeBoundaries.test.ts tests/keepFurthest.test.tsx tests/persistentReadingAnchor.test.ts tests/useProgressTracker.test.ts` exits 0.
     - `tests/keepFurthest.test.tsx` stays green and unedited, or STOP to Blurby.Brain1 (G6).
     - `tests/readerModes/flow.behavior.test.tsx` (the B0 replay, as CPC-1 Wave A step 10 left it) and `tests/readerModeIsolation.test.ts` (as CPC-1 Wave C step 4 left it) stay green and unedited here.
     - CPC-1's `tests/readerModes/cfiPositionConsistency.test.ts`, CHAPTER-STEP-CFI-1's `tests/readerModes/chapterStepLanding.test.ts` and `tests/readerModes/flow.arrivalSavedPosition.test.ts` stay green and unedited.
  4. `npm test`, `npm run typecheck` and `npm run build` exit 0 on RodneySr (standing rules 47 and 48). Record the counts.
  5. **Packaged probes**, on RodneySr x64 `--dir` packages of `<base>` and the tip, with one recipe (LL-152):
     - Launch each with `--user-data-dir=<scratch>` and `BLURBY_USER_DATA_DIR=<scratch>`. Prove `app.getPath('userData')` over the inspector before the first input, and refuse an inspector port that already answers (LL-165). Hash the live profile's `library.json` and `settings.json` before and after: unchanged.
     - Read verdicts from state, never from screenshots (standing rule 55):
       - `library.json`;
       - every save seen through an `update-doc-progress` hook, with its cfi argument;
       - **the last cursor word:** the `data-word-index` of the span carrying Flow's cursor class in the book's frame, sampled every 250 ms over the inspector; the last sample before the kill counts.
     - **A kill** is `Stop-Process -Id <the app's main process id> -Force`, so the quit flush (`main.js:643`) does not run.
     - Save the driver as `docs/studies/investigations/FLOW-SAVE-AS-YOU-GO-1.driver.mjs.txt` (standing rule 52).
     - **Probes:**
       - **(P1, kill while playing):** open *Meditations* at 8723, switch to Flow, Play at 300 words a minute for 20 s with no input, kill, read `library.json` 4 s later, reopen.
         - The tip: the hook saw at least three saves with a `null` cfi.
         - If the stored cfi is absent, the stored position is at or behind the last cursor word by at most 29 words. If a cfi is present (a relocate save landed last), the bound is 39 words.
         - The reopen's first shown range contains the stored position.
         - `<base>`: the control, recorded; only relocate saves are seen.
       - **(P2, pause, then reopen):** open at 8723, Flow, Play for about 8 s, pause, wait 10 s with no input, kill, reopen.
         - The tip: after the pause, the hook saw one save of the paused word with `null`, plus at most one re-save of the same word within 2,100 ms (design 9), and nothing else.
         - The stored position is the paused word with no cfi, and the reopen's first shown range contains it.
         - Then Flow and Play: the first cursor word is the paused word.
         - `<base>`: recorded.
       - **(P3, scroll away):** open at 8723, Flow, Play for 6 s, then scroll the book's frame with native mouse-wheel events until the cursor's span is off screen. Wait 4 s, kill, reopen.
         - The tip: Flow paused; the last save before the kill has the last cursor word sampled before the scroll, with `null`. The stored position is that word, not the first visible word at the kill (record both).
         - `<base>`: recorded.
  6. **Rule 53 pair:**
     - on RodneySr, the tip's x64 `--dir` package with `origin/main` merged in;
     - on Rodney, an `--arm64 --dir` package of the same commit and a 25 s native-arm64 scratch-profile launch with no error or crash;
     - `npx asar list` checked against `dist/` on both;
     - P1–P3 re-run on the packaged exe;
     - a "Package verification" section in the close-out;
     - Blurby.Brain1's confirmation before the merge go.
  7. **Fence (standing rule 41).** `git diff --name-status <base>` lists exactly the following, plus `docs/studies/investigations/FLOW-SAVE-AS-YOU-GO-1.*`, the governance staging memo and the time log:
     - `M src/reader/modes/flow/ModeRuntime.ts`
     - `A tests/readerModes/flowSaveAsYouGo.test.ts`

     Nothing in `tests/readerModeIsolation.test.ts`, the B0 replays or their fixtures, and nothing in `src/reader/ports/`, `src/components/ReaderContainer.tsx`, `src/types.ts`, `src/utils/FlowScrollEngine.ts`, `src/constants.ts`, Flow's view, bindings, surface or helpers, any other mode, `main/` or `preload.js`.
  8. **Merge-tree check:** `git merge-tree` of the tip against `origin/main` is clean at the merge go. A conflict in a fenced file goes to Blurby.Roadmap before resolution.
  9. **Owner, added to release gate (2)'s list:** read in Flow for a while, then close the app any way at all: the book reopens within a few seconds' reading of the Flow cursor. Pause Flow and reopen: the book opens at the paused word.
- **Effort:** M, in two waves (A: red rows, the change and the tests; B: package, probes and close-out), each about 35 tool uses and its own dispatch. Technical effort: medium.
- **Owners:**
  - Blurby.Brain1 ruled Q1–Q3 and rules STOP-CLOSE-flow; it coordinates and confirms the package (rule 53);
  - RodneySr implements, tests and probes; Rodney runs the arm64 launch;
  - spec-compliance review, then quality review;
  - Blurby.Roadmap gives the merge go and closes it out.
- **Merge order:**
  - after CFI-POSITION-CONSISTENCY-1 (Seq 97.5), and before NARRATE-SAVE-AS-YOU-GO-1 (Seq 97.7). Both run in Seq order on the single executor, RodneySr.
  - Later items that edit `flow/ModeRuntime.ts` re-grep `saveProgressWord` and keep its calls in `onEngineWordAdvance`, `pausePlayback` and `stop` (after `stopEngine()`, not on `"teardown"`): FLOW-TOC-JUMP-WORD-1 (Seq 110), PAGE-PARA-KEYS-1 (Seq 115), PAGE-SENTENCE-KEYS-1 (Seq 116), FOCUS-PAUSED-HANDOFF-1 (Seq 118), EINK-VIEW-REFRESH-1 (Seq 130) and EINK-FLOW-VIEWPORT-1.
  - FLOW-RESTAMP-CURRENT-1 (Seq 111) edits only Flow's `FoliateView.tsx`, so it does not conflict.
- **Path:** dispatch (two waves).

##### Owner ruling O5 (2026-11-03)
Flow and Narrate "save as you go" while playing, like Focus under O4, so a quit or crash reopens within a few words. In this spec that is the design and Wave A.

##### Blurby.Brain1 rulings (binding)
General rules for every playback mode, 2026-11-03:
- **G1, what is saved:** the mode's playback word, never the viewport's. Flow saves its reading cursor. After a scroll-away the save still records the playback word. Applied in design 1 and rows fl2 and fl3.
- **G2, cadence:** `RSVP_PROGRESS_SAVE_INTERVAL_MS` (5,000 ms, `src/constants.ts:168`) while playing, plus one save on pause, stop and mode exit, only when the word has changed since the mode's last save. Import the constant; add no second constant and rename none. CPC-1 Wave C rewrites its comment; this item does not edit `src/constants.ts`. Applied in designs 2–4 and rows fl1, fl2 and fl4.
- **G3, cfi:** every timed or pause save sends `null`. Main clears the cfi only when the position changes. No cfi is derived for the playback word. CPC-1 Wave B's open hold makes the position win on reopen. The relocate saves keep their viewport cfi, unchanged. Applied in design 6 and row fl5.
- **G4, map guard:** save only while `document.bookWords` is loaded, or off EPUB. Flow's surface words before the map never save. Applied in design 7 and row fl8; Q3 asks to read it as "the running engine's words".
- **G5, crash window:** main's 500 ms `LIBRARY_SAVE_DEBOUNCE_MS` window is accepted. The bound at Flow's default 300 words a minute is under "Crash window".
- **G6, furthest mark:** raised with a `null` furthest cfi through the bridge's `noteHighWater`. `tests/keepFurthest.test.tsx` stays green and unedited, or STOP to Blurby.Brain1. Applied in Done-when 3.
- **G7, sync queue:** only one mode plays at a time, so the new writes stay at most 12 a minute (Findings F-018), plus at most one re-save per pause (design 9).
- **G8, no double writes:** a timed save is skipped if the mode's relocate save already wrote the same word within the interval. The existing relocate-suppression rules are unchanged. Applied in design 8 and row fl6.
- **Isolation:** each mode implements this in its own runtime, with no shared helper and no sibling-mode import. The shared core (`src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`) is not edited. None is needed: the bridge carries `null` after CPC-1 Wave A.
- **Required rows**, committed alone first (standing rule 43): kill during play (fl1), pause (fl2), scroll away (fl3), no write while paused or unchanged (fl4), the stored cfi is null (fl5), a GREEN control (fl7) and a G8 row (fl6).
- **Sequencing:** after CFI-POSITION-CONSISTENCY-1 Waves A (the `null` contract) and B (the open hold); in Seq order on RodneySr.

##### Blurby.Brain1 rulings on Q1–Q3 (2026-11-03, binding)
- **Q1, accepted with one condition (option B, made once in CPC-1 Wave C).** CPC-1 Wave C adds `persistence.updateDocProgress` and `persistence.updateProgress` to `READER_PORT_RELEASE_CALLS` (`src/reader/ports/createReaderPorts.ts:46-49`) for all three playback modes, with the pinned rows of `tests/readerModeIsolation.test.ts` under a named rule-50 exception. Flow makes no broker edit.
  - **Condition:** the exit save is made synchronously inside `stop()`, during `broker.teardown`, after every save timer has been cleared. Nothing asynchronous may save after release.
  - **Broker check:** the release allowance ends with the teardown frame (`createReaderPorts.ts:189-200`, `:109-110`), so the after-teardown row passes because the timers are cleared, and the broker would reject a late call anyway. No STOP.
  - **Applied in:** design 2 and design 12; Wave A step 9; rows fl10, fl12 (a timed-save callback after teardown makes no persistence call) and fl14 (unmount); Done-when 2, 3 and 7.
- **Q2, accepted.** Flow re-saves after a pending relocate save lands, only if that save's word differs from the pause word. Applied in design 9, Wave A steps 3–4 and 10, and rows fl9 and fl13 (pause while a relocate save is pending, let it land, and the final stored word is the pause word).
- **Q3, accepted.** The guard checks the word space the running engine started on, and saves only if that start used the map's words. An engine that started on fallback words never saves, even after the map arrives, until it restarts on the map. Applied in design 7, Wave A step 5 and row fl8 (b).
- **Worst-case losses stand:** 29 words, or 39 if a relocate save landed last (Crash window).
- **Q5 (ruled for Narrate only)** is not applied here. Flow's timed save is not frame-driven (design 2).

##### Blurby.Brain1 rulings on STOP-Q5a and the close row (2026-11-03, binding)
- **STOP-Q5a** (the Narrate engine's word-at-sample query) is Narrate's alone. Flow is unchanged by it.
- **Unmount-skip is confirmed.** On stop reason `"teardown"`, Flow skips the exit save and makes no call the broker would reject. Already in design 12, Wave A step 9 and row fl14; no change.
- **The close row is added as fl15:** play about 12 s so a timed save writes W, then close the reader by the normal close path; the stored word is not older than W.
- **The investigation found it fails** (Why, "The reader's close save does not follow the reading cursor"). Per the ruling, no fix is designed here. STOP-CLOSE-flow below goes to Blurby.Brain1, and this spec stays not dispatch-ready until it is ruled.

##### STOP-CLOSE-flow (open; for Blurby.Brain1 before Wave A)
- **Question.** On the normal close path (Escape twice), the close save writes Flow's `publishedWordIndex`, which the reading cursor never moves. After a timed save of W, the close overwrites W with the word Flow was entered at, or the last click or navigation. How should the close save treat a session that left a playback mode? Row fl15 cannot pass until this is ruled. The planner designs no fix here, per Brain1's instruction.
- **The lines** (all at `14ce3d24`):
  - `src/components/ReaderContainer.tsx:437`: `const canonicalWordAnchor = toolbar?.currentWordIndex ?? (activeDoc.position || 0);`
  - `src/reader/useReaderModeOrchestrator.ts:258` (the router snapshot): `currentWordIndex: s.publishedWordIndex,`
  - `ReaderContainer.tsx:614-630`, `handleExitReader`: `const exitAnchor = canonicalWordAnchor;` … `if (readingMode === "page") { … if (checkBacktrack(exitAnchor, totalWords, useFoliate)) return; finishReading(exitAnchor); } else { handleExitToPage(); }`
  - `useReaderModeOrchestrator.ts:354-357`, `exitToPage`: `transition("page", "silent", "persistent", "user-stop", (h) => ({ ...h, highlightedWordIndex: h.publishedWordIndex }));`
  - `src/reader/modes/flow/ModeRuntime.ts:827-845`, `exportHandoff`: `publishedWordIndex: s.publishedWordIndex,`; `src/reader/modes/page/ModeState.ts:33`: `this.publishedWordIndex = handoff.publishedWordIndex;`
  - `flow/ModeRuntime.ts:1316-1321`, `onEngineWordAdvance`: `this.anchor.commitPersistentWordIndex(idx, "mode-advance", { persist: false, publishState: false, navigate: false, syncVisual: false });`
  - `flow/helpers/usePersistentReadingAnchor.ts:85-88`: `const shouldPublishState = options.publishState ?? cause !== "mode-advance"; if (shouldPublishState) { state.publishedWordIndex = clamped; }`
  - `src/hooks/useProgressTracker.ts:296-299` and `:243-259`: `finishReading` → `_persistAndLog(finalPos)` → `onUpdateProgress(activeDoc.id, savePos, cfi); api.updateDocProgress(activeDoc.id, savePos, cfi);`
  - `main/ipc/documents.js:22-23`: `if (hasPosition) doc.position = position;` (no forward-only check).
- **What else it touches:**
  - The same path writes Focus's and Narrate's pre-play word (STOP-CLOSE-focus in CFI-POSITION-CONSISTENCY-1, STOP-CLOSE-narrate in NARRATE-SAVE-AS-YOU-GO-1), so one ruling may serve all three.
  - Page's arrival seeds its resume anchor from the handed-over highlight, which `exitToPage` sets to the published word (`page/ModeState.ts:40`), so Page's own relocate saves stay suppressed after the exit.
  - `tests/readerModeIsolation.test.ts:348` pins "exitToPage hands off the published word as the highlight". `src/components/ReaderContainer.tsx` is shared core.
  - Probe P2 ("pause, then reopen") kills the app rather than closing it, so it does not exercise this path.

##### Questions for Blurby.Brain1 (ruled 2026-11-03; kept as the record)
- **Q1. The mode-exit save meets the port broker's teardown window (STOP before Wave A).** The router stops the outgoing mode inside `broker.teardown` (`useReaderModeOrchestrator.ts:303-307`), which accepts only `settings.update{isNarrating}` and `diagnostics.*` (`createReaderPorts.ts:46-49`, `:108-110`). G2's stop and mode-exit save is therefore rejected, with a `port-rejected` diagnostic. CPC-1 Wave C's Focus `stop()` save and its row f5 meet the same wall first. Options:
  - **(A)** move the exit save before `invalidate`, for example from `exportHandoff("capture-current")`. That puts a side effect in an export and changes the router's contract.
  - **(B)** add `persistence.updateDocProgress` with a `null` cfi, and `persistence.updateProgress`, to `READER_PORT_RELEASE_CALLS`, a signature rule in `releaseSignature` (`:76-81`). That needs a named change to the pinned rows `tests/readerModeIsolation.test.ts:101-125` and `:208`. `createReaderPorts.ts` is not in the shared-core freeze set, but it is every mode's broker.
  - **(C)** no exit save. The handover already carries the playback word to the next mode, and the last timed save bounds a kill after the exit to one interval, as during play.

  **Recommendation: (B), made once in CPC-1 Wave C**, where f5 needs it first, so these items need no broker edit. If it is ruled after CPC-1 merges, this item takes the `createReaderPorts.ts` line and the two pinned rows into its fence. (C) is the fallback, with row fl10's (C) branch.
- **Q2. A pending relocate save can overwrite a newer pause save.** The shell's relocate timer writes its scheduled word up to 2,000 ms later (`ReaderContainer.tsx:331-336`), and Flow relocates as lines scroll. A pause within 2 s of the last relocate is then overwritten by an older word with its viewport cfi, and row 2 fails in the package. Cancelling the shell's timer would need a shared-core edit. **Recommendation:** design 9, a mode-local re-save 1 ms after the pending relocate save is due, only after a pause, only while still paused and only if nothing newer was saved or scheduled. During play, accept G5's relocate term (at most 39 words at 300 words a minute). A stop has no re-save, because the runtime is gone.
- **Q3. G4's map guard reads the running engine's words.** An engine started on the view's slice keeps slice indices after the map arrives (`adoptDocument` does not restart it; `onWordsReextracted` refreshes the slice only without a map). **Recommendation:** save only while the running engine was started on the map (`engineOnBookWords`, set at each `start()`), which is G4's intent. Row fl8 (b) pins it. It also keeps the B0 replay (`bookWords: null`) unchanged.

##### Lessons applied
- **LL-029:** the save compares word indices only. No range, offset or viewport position is read to pick the word.
- **LL-030:** nothing saves before a start has run the engine (row fl7).
- **LL-073:** the resume anchor and its relocate suppression are untouched; the timed save reads the word timer's word, not the anchor.
- **LL-108:** the saved word comes from the mode's own playback truth (Flow's word timer), never from visual drift or a fraction.
- **LL-142:** the base's behaviour is measured on `<base>` (rows and probes) before the fix is trusted.
- **LL-143:** every gate names its shell and an exact exit code, with the base's expected exit beside it.
- **LL-152:** one recipe for the `<base>` and tip probes.
- **LL-159:** a kill skips the quit flush and main's 500 ms timer, and the shell's relocate timer is a deferred writer too. The bound counts both.
- **LL-165:** the scratch profile is proved before the first input, and the live profile's hashes are unchanged.
- **LL-169:** the only new timer, design 9's re-save, is the runtime's own `setTimer`, cleared by `stop()`. It checks its captured relocate record before it writes. The exit save comes after `clearTimers()` and `stopEngine()` (row fl12).
- **LL-109:** no continuation saves after release. The exit save is synchronous inside `broker.teardown`, and unmount, which has no window, makes no attempt (rows fl12 and fl14).
- **LL-181:** the branch lives under `.worktrees`, and the push uses an explicit lowercase refspec.
- **Standing rule 55:** verdicts come from saves, `library.json` and sampled word indices, not screenshots.
- **Standing rule 53:** package verification, with Blurby.Brain1's confirmation before the merge go.
