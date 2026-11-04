#### NARRATE-SAVE-AS-YOU-GO-1 — Narrate saves your place every few seconds while it speaks, so a quit or crash reopens within a few words *(Seq 97.7; Full Spec 2026-11-03, cited against `origin/main` `14ce3d24`, after NARRATE-ARRIVAL-SYNC-1's merge; TTS / Narration Engine; owner rulings O5 and O3 and Blurby.Brain1's general rules G1–G8 of 2026-11-03; after CFI-POSITION-CONSISTENCY-1 and FLOW-SAVE-AS-YOU-GO-1; no shared-core edit; not a release gate)*

- **What:**
  - Narrate saves the engine's cursor word while it plays: the exact word-table word at the heard sample, never a chunk's first word. It saves every `RSVP_PROGRESS_SAVE_INTERVAL_MS` (5,000 ms), and once more when playback pauses or stops, each time only if the word has changed since Narrate's last save.
  - Every such save sends an explicit `null` cfi, so main clears the stored page whenever the word moved.
  - Browsing away does not stop Narrate. While the reader browses, the timed saves keep recording the spoken word, never the page on screen.
  - A reopen at the saved word starts Play at the first word of its sentence (owner ruling O3). This item adds no code for that; it pins it.
  - **Out of scope:**
    - Focus (CFI-POSITION-CONSISTENCY-1 Wave C) and Flow (FLOW-SAVE-AS-YOU-GO-1, Seq 97.6).
    - Narrate's relocate save and its guards (`shouldPersistRelocateProgress`, browse-away, the resume anchor). They are unchanged (G8).
    - The engine (`src/reader/modes/narrate/engine/`), the producer (`main/narrate/`), the view and the bindings, including how often the cursor is published (question Q5).
    - The sentence-start rule itself (`sentenceStartAt`, NARRATE-SENTENCE-RESUME-1).
    - The shell's bridge, its debounced relocate timer, main's write path and `src/constants.ts` (CPC-1 Wave C rewrites the interval's comment; G2).
    - The end of the book. `onEngineComplete` stops playback before the router stops Narrate (`narrate/ModeRuntime.ts:763-769`), and the shell's completion path owns the finish save, unchanged.
  - **Outcome:**
    - On *Meditations*, Narrate speaks at 1.00x for 20 s with the window visible, then the app is killed with no graceful quit. The reopen shows a word at most 17 words behind the last spoken cursor word (22 if a relocate save landed last; see G5), and the stored cfi is absent unless a relocate save landed last.
    - Narrate plays, pauses, and the app is killed. The stored word is the paused cursor word with no cfi, and after the reopen Narrate's Play starts at that word's sentence start.
    - Narrate plays while the reader pages away. The saved word is the spoken word, not the page on screen.
- **Why** (owner ruling O5, 2026-11-03; Findings F-016; Blurby.Brain1 G1–G8, 2026-11-03). All lines are at `origin/main` `14ce3d24`, which includes NARRATE-ARRIVAL-SYNC-1:
  - **Narrate saves during play only when the view moves.**
    - Every cursor advance commits with `persist: false` (`src/reader/modes/narrate/ModeRuntime.ts:732`, in `onEngineCursor`, `:722-743`).
    - The only save during play is the relocate save (`:545`, `ports.persistence.scheduleRelocateSave`). It is gated by the resume anchor, engagement and browsing (`:536-537`).
    - The shell debounces it by `FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS` (2,000 ms, `src/constants.ts:172`) and writes the word it was scheduled with (`src/components/ReaderContainer.tsx:323-337`).
    - `pause()` (`:345-354`), `togglePlay()` (`:364-369`) and `stop()` (`:371-397`) save nothing.
    - So a passage spoken while the page does not turn, or while a guard returns early, is lost on a kill.
  - **Browsing away never stops narration** (`:597-603`). While the reader browses, the relocate handler neither writes the cfi (`:532`) nor saves (`:537`), so today nothing is saved for the whole browse.
  - **The cursor is the exact word-table word.**
    - The engine publishes, once per display frame, the unit at the heard sample (`tick`, `narrate/engine/narrateEngine.ts:333-348`, reading `output.playbackPosition()`).
    - The word is the chunk's start plus the unit's word offset from the table (`commitUnit`, `:351-352`). `publish` (`:548-553`) stores it in `cursor` and calls `onCursor`.
    - `getSnapshot().cursor` (`:195-197`) holds the last published word through silence (R6) and through a pause. It is `-1` before the first unit sounds.
  - **The cursor is stale after a restart.** `play()` resets the epoch (`reset`, `:534-545`) but not `cursor`. After the runtime restarts the engine (a start, `:340`; a click while playing, `:477`; a navigation, `:495`; `jumpToWord`, `:409`), the cursor is the previous epoch's word until the new epoch's first unit sounds (question Q4).
  - **The cursor is published only on display frames.** The binding ticks once per animation frame while playing (`narrate/useModeBindings.ts:33-41`), and a hidden or minimized window gets no frames. Only the timer-driven `pump` runs then. So a hidden window publishes no cursor, and makes no timed save (question Q5).
  - **The pause states.**
    - A user pause runs `engine.pause()` (`:351`). The engine sets `paused` (`narrateEngine.ts:210-221`), and the runtime's `onEngineState` clears `playing` (`:745-752`).
    - A failed passage (F4) also pauses through `onEngineState` (`narrateEngine.ts:328`, `:495`): "Narration paused on the last timed word" (`:232`).
  - **Narrate's engine words.**
    - `start()` copies `effectiveWords()` (`:300`): the book's word map when `document.bookWords` is loaded; else the view's own section words, the pre-arrival fallback; else `tokenWords` (`:876-883`).
    - The map may still arrive after Play: `start()` requests it after the engine starts (`:341`), and `adoptDocument` (`:246-261`) does not restart the engine. So "the map is loaded now" does not prove the engine's indices are the book's (question Q3).
  - **O3 is already met on reopen.**
    - A Play not started by a click rewinds to the sentence's first word: `clickedWord` (`:321`), then `sentenceStartAt` (`:331-332`; `narrate/engine/chunkPlan.ts:79-84`).
    - A reopen reaches Narrate only by a handover from Page, which sets no `explicitSelectionAnchor`. CPC-1's rows o3a and o3b pin it.
    - The engine's own resume also restarts at the paused sentence's first word (`narrateEngine.ts:223-262`).
    - So a pause save of the cursor word is all O3 needs.
  - **The bridge after CPC-1 Wave A.** `ports.persistence.updateDocProgress(docId, word, null)` reaches `ReaderContainer.tsx:311-316`. It calls `api.updateDocProgress`, forwards `null` to the library copy, and raises keep-at-furthest's mark through `noteHighWater` (`:315`) with a `null` furthest cfi (G6). Main clears the stored cfi only when the position changed (CPC-1 design 1). **No shared-core edit is needed here.**
  - **Write cost** (G5, G7). `update-doc-progress` (`main/ipc/documents.js:14-31`) calls `ctx.saveLibrary()` (`:28`) and enqueues `update-progress` (`:31`). `saveLibrary` (`main.js:120-131`) coalesces over `LIBRARY_SAVE_DEBOUNCE_MS` (500 ms, `main/constants.js:155`). A graceful quit flushes it (`main.js:643`); a kill inside the window loses the newest save. `enqueue` rewrites `sync-queue.json` per call (`main/sync-queue.js:169-182`; Findings F-018). The new saves add at most 12 of each a minute (G7), plus at most one extra write per pause (design 10).
  - **Facts G1–G8 do not settle** (questions Q1–Q5):
    1. **A mode-exit save is rejected by the port broker.** The router stops the outgoing mode inside `broker.teardown` (`src/reader/useReaderModeOrchestrator.ts:303-307`). Inside that window only `settings.update{isNarrating}` and `diagnostics.*` pass (`src/reader/ports/createReaderPorts.ts:46-49`, `:108-110`). Narrate's own `settings.update({ isNarrating: false })` in `stop()` (`:394`) is such a release-class call. A `persistence.updateDocProgress` there is rejected. `tests/readerModeIsolation.test.ts:101-125` and `:208` pin that (Q1; shared with CPC-1 Wave C and FLOW-SAVE-AS-YOU-GO-1).
    2. **A pending relocate save can land after a newer pause save.** The view turns pages to follow the spoken word, and each turn schedules a relocate save of the word at that turn. A pause within 2 s of a turn is then overwritten by that older word and its page's cfi, and the reopen can start a sentence early (Q2).
    3. The map guard (Q3), the stale cursor after a restart (Q4) and a hidden window (Q5), above.
  - **The structural guard.** `tests/narrate/narrate.structural.test.ts:33-44` scans `narrate/ModeRuntime.ts`'s code, with comments stripped, for estimator markers: `\bwpm\b`, `msPerWord`, `wordsPerMinute`, `(lag|offset)Ms = <digit>` and others. The new code uses none of them.
  - **Users see:** listen for a few minutes on one long page, close the app hard, and the book reopens where Narrate started.
- **Design decision:** technical (Blurby.Brain1 G1–G8); the behaviour is owner ruling O5 ("save as you go", like Focus under O4), with O3's sentence-start restart unchanged.
- **The design** (mirrors CPC-1 design 9 and FLOW-SAVE-AS-YOU-GO-1; every line in `src/reader/modes/narrate/ModeRuntime.ts` only):
  1. **Which word (G1):** the cursor word the engine published through `onCursor`, the exact table word at the heard sample. It is never the chunk's start (`inFlightStart`, `nextWord`), never the scheduling head and never the view's page. The runtime keeps it as `cursorWord`, set in `onEngineCursor`.
  2. **A fresh cursor only (Q4):** `cursorWord` is set to `null` just before every runtime call that restarts the engine (`engineFor(...).play`, `:340`; `this.engine.play`, `:409`, `:477`, `:495`; and, once CHAPTER-STEP-CFI-1 has merged, its landing restart. At `14ce3d24` these four are the only `.play(` calls in the file). A pause or stop saves only a word published since the latest restart.
  3. **When (G2):**
     - at the first cursor advance at least `RSVP_PROGRESS_SAVE_INTERVAL_MS` after the last save or the latest start or resume;
     - once more when the engine reports `paused` while the runtime was playing. That covers `pause()`, `togglePlay()`'s pause branch and an F4 failure pause;
     - once more on `stop()` while playing (mode exit, book close, teardown), subject to Q1.
     - Each fires only if the word differs from Narrate's last save.
  4. **"Narrate's last save"** is the last word Narrate itself wrote: a save from this design, or a persisted commit through `commitShared` (`:899-903`: a click, an off-EPUB navigation, and CHAPTER-STEP-CFI-1's landing once merged). A relocate save counts only under G8.
  5. **The interval clock restarts at each start and resume.** The pause before a resume already saved, so this avoids a save of the first word heard after a long pause.
  6. **Only on playback that was playing.** A `pause()` while paused returns early today (`:349`). A click while paused saves its own word and does not restart the engine (`:477`), so a later stop must not overwrite it with the old cursor.
  7. **The cfi (G3):** every save is `updateDocProgress(documentId, word, null)` then `updateProgress(documentId, word)`. No cfi is derived for the word. The relocate save keeps its own viewport cfi.
  8. **The map guard (G4, Q3):** saves happen only while the running engine's words are the book's: `engineOnBookWords`, set at each `start()` from the word source `effectiveWords()` just used (`!useFoliate || bookWords != null`). The pre-arrival fallback words never save, even after the map arrives, until the next Play. Clicks, navigations and resumes reuse the engine's words, so they keep the flag.
  9. **No double write (G8):** `onRelocate` records `{ word, at }` just before it schedules its save. A save of the same word within `RSVP_PROGRESS_SAVE_INTERVAL_MS` of that record is skipped and counted as Narrate's last save.
  10. **The re-save after a pending relocate save (Q2, proposal; as FLOW-SAVE-AS-YOU-GO-1 design 9).** After a pause save of `w`, if the last relocate save was scheduled less than `FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS` ago with a different word, one `setTimer` (`:917-920`) fires 1 ms after it is due and writes `w` again with `null`. It writes only if Narrate is still paused, its last save is still `w`, and no newer relocate was scheduled. `stop()` clears it (`clearTimers`, `:927-932`; LL-169).
  11. **Only after Play (LL-030):** the last-saved word starts as the word Narrate arrived at (`handoff.canonicalWordIndex`, `:180`), and nothing saves until a start has run the engine.
  12. **O3 is unchanged.** The pause save stores the cursor word. The sentence-start rewind is applied when Play starts after the reopen (`:331-332`), never at save time. Storing the sentence start instead would move the reopened view back across a page for no gain.
  13. **Isolation:** no shared helper, no sibling import, no new shared module. The constants come from `src/constants.ts`, which Narrate already imports (`:13-22`).
- **Crash window (G5).** Narrate's typical rate is 1.00x (`ttsRate` defaults to 1.0, `:179`). Kokoro speaks about 166 words a minute there (S5's measured pace, `docs/planning/epics/2026-10-12-narrate-rebuild/plan.md:312`). Silences between chunks hold the cursor, so they only lower the count.
  - **Last write a timed or pause save:** at most one interval, main's 500 ms and one word: `ceil(166 × 5,500 / 60,000) + 1` = **17 words**.
  - **Last write a relocate save** (a stored cfi is present): add the 2,000 ms relocate debounce: `ceil(166 × 7,500 / 60,000) + 1` = **22 words**.
  - **Unit rows:** the fake producer speaks 200 ms a word (300 words a minute; `tests/narrate/harness/fakeProducer.ts:24-25`), with fake timers and no shell timer, so the bound is `ceil(300 × 5,000 / 60,000) + 1` = **26 words**.
  - **A hidden window** saves nothing until it is shown again, or until a pause or stop (Q5).
- **The change.** Line numbers are at `14ce3d24`. CHAPTER-STEP-CFI-1 and CFI-POSITION-CONSISTENCY-1 move lines in this file, so re-grep every cited line at the cut (standing rule 36):

  ```
  git grep -n -E '^  (start|pause|resume|togglePlay|stop|jumpToWord|hardSelect|navigateTo)\(|private (onEngineCursor|onEngineState|commitShared|setTimer|clearTimers|completeLanding)|onRelocate = |scheduleRelocateSave|const effectiveWords = \[|\.play\(|\} from "\.\./\.\./\.\./constants"' -- src/reader/modes/narrate/ModeRuntime.ts
  git grep -n -E 'RSVP_PROGRESS_SAVE_INTERVAL_MS|FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS' -- src/constants.ts src/reader/modes
  git grep -n -E 'READER_PORT_RELEASE_CALLS = |persistence\.updateDocProgress' -- src/reader/ports/createReaderPorts.ts
  git grep -n -E 'cfi\?: string' -- src/reader/ports/ReaderPorts.ts
  ```

  If `ReaderPorts.ts` still types the cfi as `string` only, CPC-1 Wave A has not merged: STOP.

  - **Wave A — red rows, the change and the tests** (about 35 tool uses):
    1. **Imports** (`:13-22`): add `RSVP_PROGRESS_SAVE_INTERVAL_MS` and `FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS`. Add no constant and rename none (G2).
    2. **Fields** (after `arrivalSyncInFlight`, `:168`):
       - `private lastSavedWord: number`, set in the constructor (`:180-182`) to `handoff.canonicalWordIndex`;
       - `private lastSaveAt = 0`;
       - `private playedSinceSave = false`;
       - `private engineOnBookWords = false`;
       - `private cursorWord: number | null = null`;
       - `private lastRelocateSave: { readonly word: number; readonly at: number } | null = null`.
    3. **`private saveProgressWord(word: number | null, reason: "interval" | "pause" | "stop"): void`.** It returns unless all of these hold:
       - `word != null` and `word >= 0`;
       - `playedSinceSave` and `engineOnBookWords` are true;
       - `word !== this.lastSavedWord`.

       Then:
       - **G8:** if `lastRelocateSave` has the same word and was recorded less than `RSVP_PROGRESS_SAVE_INTERVAL_MS` ago, set `lastSavedWord` and `lastSaveAt` and return.
       - Otherwise call `this.ports.persistence.updateDocProgress(this.document.documentId, word, null)` and `this.ports.persistence.updateProgress(this.document.documentId, word)`. Set `lastSavedWord = word` and `lastSaveAt = Date.now()`.
       - **Q2:** if `reason === "pause"`, arm design 10's re-save exactly as FLOW-SAVE-AS-YOU-GO-1 Wave A step 3 does, with a `resaveAfterRelocate(word, relocate)` that returns unless `!this.state.playing`, `this.lastSavedWord === word` and `this.lastRelocateSave === relocate`.

       Its comment names this item, owners O5 and O3, G1–G8 and LL-030. No identifier or code text matches the structural test's estimator markers.
    4. **`start()`** (`:282`): right after `const effectiveWords = [...this.effectiveWords()];` (`:300`), compute `const onBookWords = !this.document.useFoliate || this.document.bookWords != null;`. Just before `this.engineFor(effectiveWords).play(startWord);` (`:340`), set `this.engineOnBookWords = onBookWords`, `this.playedSinceSave = true`, `this.lastSaveAt = Date.now()` and `this.cursorWord = null`. Nothing changes on the early returns (`:285`, `:295`, `:308`, `:317`).
    5. **`resume()`** (`:356-362`): after `this.engine.resume()`, `this.lastSaveAt = Date.now()`. `cursorWord` is kept: the engine replays from the paused sentence and republishes.
    6. **The other restarts:** `this.cursorWord = null` immediately before `this.engine.play(...)` in `jumpToWord` (`:409`), `hardSelect` (`:477`) and `navigateTo` (`:495`), and before any further `.play(` the re-grep finds (CHAPTER-STEP-CFI-1's `completeLanding`, if merged; it is not on `14ce3d24`). Every runtime `.play(` call is preceded by `this.cursorWord = null`.
    7. **`onEngineCursor`** (`:722`): after `s.currentWordIndex = word;` (`:734`), add `this.cursorWord = word;` and `if (Date.now() - this.lastSaveAt >= RSVP_PROGRESS_SAVE_INTERVAL_MS) this.saveProgressWord(word, "interval");`. The commit stays `persist: false` (`:732`).
    8. **`onEngineState`** (`:745`): in the `paused` branch (`:749`), capture `const wasPlaying = s.playing;` before it clears `playing`. After the branch, add `if (wasPlaying) this.saveProgressWord(this.cursorWord, "pause");`. The `playing` and `stopped` branches are unchanged.
    9. **`stop()`** (`:371`): after `if (!this.alive) return;` (`:372`) and before `this.alive = false;` (`:373`), add `if (this.state.playing) this.saveProgressWord(this.cursorWord, "stop");`, as Q1's ruling allows. Under Q1 (C) this step is omitted. `engine.stop()` (`:381`) runs after `alive` is false, so its `stopped` state saves nothing. A second `stop()` returns early.
    10. **`onRelocate`** (`:527`): just before `this.ports.persistence.scheduleRelocateSave(...)` (`:545`), add `this.lastRelocateSave = { word: progressAnchor, at: Date.now() };`. Nothing else in the handler changes.
    11. **`commitShared`** (`:899-903`): after the commit, `this.lastSavedWord = clamped;`.
    12. Nothing else changes: not the engine, Narrate's view, bindings, surface or helpers, no other mode, and no existing test.
  - **Wave B — package, probes and close-out** (about 35 tool uses): Done-when 5–8.
- **Prerequisites:**
  - CFI-POSITION-CONSISTENCY-1 merged (Waves A–D): the `null` contract, the open hold, and its O3 pins (rows o3a and o3b).
  - FLOW-SAVE-AS-YOU-GO-1 merged or closed (Seq order on one executor). The two share no file.
  - Blurby.Brain1 rules Q1–Q5 before Wave A. Q1 and Q2 should carry the same ruling as for FLOW-SAVE-AS-YOU-GO-1.
  - RodneySr has the canonical clone `C:\Users\estra\Projects\Blurby` with `node_modules`, the sample *Meditations*, the Kokoro model used by gate (1), and the recipe for x64 `--dir` packages. Rodney has its canonical clone for the arm64 build.
- **Execution host:** RodneySr (x64) for the implementation, the tests, the packages, the probes and the rule 53 pair. Rodney (arm64) only for the rule 53 arm64 launch.
- **Branch:** `eb/narrate-save-as-you-go-1` at `C:\Users\estra\Projects\Blurby\.worktrees\narrate-save-as-you-go-1` on RodneySr. Create it after CFI-POSITION-CONSISTENCY-1 merges (and after FLOW-SAVE-AS-YOU-GO-1, in Seq order), with `git -C C:/Users/estra/Projects/Blurby worktree add -b eb/narrate-save-as-you-go-1 .worktrees/narrate-save-as-you-go-1 origin/main`. `<base>` is that `origin/main`. Push with `git push origin HEAD:refs/heads/eb/narrate-save-as-you-go-1` (LL-181).
- **Done when** (every command in `pwsh` from the worktree root):
  1. **Red first (standing rule 43).** Commit `tests/narrate/narrate.saveAsYouGo.test.ts` alone, before any source edit. It reaches no new name. Record every row's result on `<base>` in the memo. If a row named RED is green on `<base>`, STOP: its guard cannot fail.

     **Setup.** The pattern of `tests/narrate/narrate.playSavedPosition.test.ts:24-50`: `createReaderPorts(fake.infra)`, `broker.issue("narrate")`, `createNarrateRuntime(..., { producer, createOutput })`, a handover from Page with `arrival: "select"`, and `vi.useFakeTimers({ now: 0 })`.
     - **The book** is a test-local fixture, not an edit of a harness: 600 words `w0`…`w599`, with every 10th word ending a sentence (`w9.`, `w19.`, …), and two sections (`sectionIndex` 1: 0–300; 2: 300–600) with spine cfis `epubcfi(/6/4!/4/2)` and `epubcfi(/6/6!/4/2)`.
     - **The view** is modelled on `createZeroWordView` (`tests/readerModes/harness/zeroWordBook.ts:43`). It shows one section, `highlightWordByIndex` is true for its words, and `isUserBrowsing` is a test switch.
     - **The audio:** `FakeProducer` at its default 200 ms a word, and `FakeAudioOutput`.
     - **Time:** a helper `run(ms)` advances, in 50 ms steps, fake time (`await vi.advanceTimersByTimeAsync(50)`) and the output (`output.advance(0.05)`), then calls `runtime.tick()`.
     - **The open:** the runtime arrives at word 20 with the map loaded, and Play is `runtime.togglePlay()`. Every `persistence.updateDocProgress` effect is counted and folded into a stored doc `{ position: 20, cfi: section-1 }` with CPC-1's rule. "The cursor" is `runtime.getSnapshot().highlightedWordIndex`, which `onEngineCursor` publishes.
     - **(n1, row 1: kill during play):** Play, then `run(12_000)`.
       - There are exactly two saves, each `("doc-1", w, null)`. Each `w` is a word the cursor showed at that moment. The first comes at least 5,000 ms after Play, and the second at least 5,000 ms after the first.
       - The last saved word trails the cursor at 12,000 ms by at most 26 words.
       - Run it again with a test-local `FakeAudioOutput` subclass whose `playbackPosition()` lags `now()` by 0.3 s (LL-173). Every saved word is at or behind the word at the heard sample, never ahead of it.
       - **RED** (no save).
     - **(n2, row 2: pause, then reopen at the sentence start, O3):**
       - after n1, `runtime.pause()` makes exactly one more save: the cursor word with `null`. A second run pauses with `togglePlay()`: the same.
       - Pick the run so the paused word is not a sentence's first word (record both indices).
       - Reopen: a new runtime arrives from Page at the folded position, then Play. The first word of `producer.requests[0]` is `sentenceStartAt`'s word for the saved word: the word after the previous `.`.
       - **RED** (no pause save, so the reopen is at 20).
     - **(n3, row 3: browse away while playing):**
       - `run(3_000)`;
       - set the view's `isUserBrowsing` to true, call `onUserBrowseAway()`, then `onRelocate({ cfi: section-2 cfi, fraction: 0.8 })` (the page's word would be 480);
       - `run(6_000)`. Narrate is still playing. Exactly one save was made, of a cursor word below 300, with `null`, and no `scheduleRelocateSave` was recorded after the browse began.
       - **RED** (no save).
     - **(n4, row 4: no write while paused or unchanged):** `run(7_000)` (one timed save), `pause()` (one pause save), `run(30_000)` with no Play, `pause()` again, then `togglePlay()`'s pause path is not reached (still paused). The count is exactly 2. **RED** (0).
     - **(n5, row 5: the stored cfi is null after a timed save):** after n1, the folded doc holds the last saved word and no `cfi`. **RED** (section-1 cfi kept).
     - **(n6, G8: no duplicate after a relocate save of the same word):** `run(6_000)`. Call `onRelocate` with the section-1 cfi while the cursor is on `W`; the fake records `scheduleRelocateSave({ wordIndex: W })`. Pause at once. There is no pause save, and no re-save fires in the next 3,000 ms. Guard row: green on `<base>`.
     - **(n7, GREEN control):** arrive, wait 10,000 ms with no Play, then stop through the broker's teardown. There is no save from Narrate (LL-030). Green on `<base>` and after.
     - **(n8, G4: no map, no save):**
       - (a) arrive with `bookWords: null`, so Play speaks the view's section words. `run(12_000)`: no save.
       - (b) during (a), publish the map through the fake document port: still no save until a pause and a new Play. After the new Play, n1's cadence holds.
       - Guard row: green on `<base>`.
     - **(n9, Q4: no save of a stale cursor):**
       - `run(6_000)` (one save; the cursor is `C`);
       - `producer.setHold(true)`, then `hardSelect` word 250 with a cfi while playing. That is the click's own save, `("doc-1", 250, <its cfi>)`;
       - `pause()` before any unit of the new epoch sounds: there is no pause save. The last save is still the click's.
       - Guard row: green on `<base>`.
     - **(n10, an F4 pause saves the last timed word):** `run(6_000)`; `producer.nextControl("missing-table")` for the next request; `run` until the notice is "timing-missing" and `playing` is false. There is exactly one more save, of the last cursor word, with `null`. **RED.**
     - **(n11, Q2: the re-save after a pending relocate save):** `run(6_000)`; `onRelocate` while the cursor is on `W1`; `run(600)` (the cursor is on `W1 + 3`); pause. There is exactly one pause save of `W1 + 3`, and exactly one more save of it with `null` 1,401 ms later, and none after. **RED** (no save).
     - **(n12, Q1: mode exit while playing):** `run(7_000)` (one save), then the router's own exit sequence: `broker.invalidate(key)` and `broker.teardown(key, () => { runtime.stop("mode-switch"); runtime.destroy(); })` (`useReaderModeOrchestrator.ts:303-307`).
       - Under Q1 (B): exactly one more save, of the cursor word, accepted (no `port-rejected` diagnostic). **RED.**
       - Under Q1 (C): no further save, and `exportHandoff("capture-current").highlightedWordIndex`, taken before the teardown, is the cursor word. Green.
  2. **Wave A as specified.** Then:
     - `git grep -c -F 'RSVP_PROGRESS_SAVE_INTERVAL_MS' -- src/reader/modes/narrate/ModeRuntime.ts` exits 0. It exits 1 on `<base>`.
     - `git grep -n -F 'updateDocProgress(this.document.documentId' -- src/reader/modes/narrate/ModeRuntime.ts` exits 0. It exits 1 on `<base>`.
     - `git grep -n -E '\b5000\b|5_000|\b2000\b' -- src/reader/modes/narrate/ModeRuntime.ts` exits 1 (no literal interval or debounce).
     - `git diff --name-status <base> -- src/constants.ts src/components src/types.ts src/utils src/reader/ports src/reader/modes/page src/reader/modes/focus src/reader/modes/flow src/reader/modes/narrate/engine main preload.js` prints nothing and exits 0.
  3. **Tests.**
     - `npx vitest run tests/narrate/narrate.saveAsYouGo.test.ts` exits 0.
     - `npx vitest run tests/narrate tests/readerModes tests/readerModeIsolation.test.ts tests/readerModeBoundaries.test.ts tests/keepFurthest.test.tsx tests/persistentReadingAnchor.test.ts` exits 0.
     - These stay green and unedited:
       - `tests/narrate/narrate.structural.test.ts` (the estimator scan);
       - `tests/narrate/narrate.playSavedPosition.test.ts` (NARRATE-ARRIVAL-SYNC-1);
       - `tests/narrate/narrate.pauseCancel.test.ts` and `tests/narrate/narrate.gapPause.test.ts`;
       - CPC-1's `tests/readerModes/cfiPositionConsistency.test.ts` (rows o3a and o3b);
       - `tests/chapterStep.test.ts`, and CHAPTER-STEP-CFI-1's `tests/readerModes/chapterStepLanding.test.ts` if it has merged (it is not on `14ce3d24`);
       - `tests/readerModeIsolation.test.ts`, unless Q1 is ruled (B) after CPC-1 merges (then only its two named rows change).
     - `tests/keepFurthest.test.tsx` stays green and unedited, or STOP to Blurby.Brain1 (G6).
  4. `npm test`, `npm run typecheck` and `npm run build` exit 0 on RodneySr (standing rules 47 and 48). Record the counts.
  5. **Packaged probes**, on RodneySr x64 `--dir` packages of `<base>` and the tip, with one recipe (LL-152):
     - Launch each with `--user-data-dir=<scratch>` and `BLURBY_USER_DATA_DIR=<scratch>`. Prove `app.getPath('userData')` over the inspector before the first input, and refuse an inspector port that already answers (LL-165). Hash the live profile's `library.json` and `settings.json` before and after: unchanged.
     - Keep the window shown and focused for every probe (Q5).
     - Read verdicts from state, never from screenshots (standing rule 55):
       - `library.json`;
       - every save seen through an `update-doc-progress` hook, with its cfi argument;
       - **the last cursor word:** the `data-word-index` of the span Narrate highlights in the book's frame, sampled every 250 ms over the inspector; the last sample before the kill counts;
       - **the first request word:** the first word of the first `narrate-generate` request after Play, mapped to its index as NARRATE-ARRIVAL-SYNC-1's probes do.
     - **A kill** is `Stop-Process -Id <the app's main process id> -Force`, so the quit flush (`main.js:643`) does not run.
     - Save the driver as `docs/studies/investigations/NARRATE-SAVE-AS-YOU-GO-1.driver.mjs.txt` (standing rule 52).
     - **Probes:**
       - **(P1, kill while speaking):** open *Meditations* at 8723, switch to Narrate, Play at 1.00x for 20 s with no input, kill, read `library.json` 4 s later, reopen.
         - The tip: the hook saw at least three saves with a `null` cfi.
         - If the stored cfi is absent, the stored position is at or behind the last cursor word by at most 17 words. If a cfi is present (a relocate save landed last), the bound is 22 words.
         - The reopen's first shown range contains the stored position.
         - `<base>`: the control, recorded; only relocate saves are seen.
       - **(P2, pause, then reopen, O3):** open at 8723, Narrate, Play for about 8 s, pause, wait 10 s with no input, kill, reopen.
         - The tip: after the pause, the hook saw one save of the paused cursor word with `null`, plus at most one re-save of the same word within 2,100 ms (design 10), and nothing else. The stored position is that word with no cfi.
         - Then Narrate and Play: the first request word is the first word of the stored word's sentence, computed with `sentenceStartAt`'s rule over the extracted words (record both indices).
         - `<base>`: recorded.
       - **(P3, browse away while speaking):** open at 8723, Narrate, Play for 6 s, then turn two pages forward with native mouse-wheel events in the book's frame and keep listening for 8 s, then kill and reopen.
         - The tip: Narrate kept speaking; the saves after the browse carry cursor words, each equal to a sampled cursor word, with `null`. The stored position is not on the browsed pages (record the first visible word at the kill).
         - `<base>`: recorded.
  6. **Rule 53 pair:**
     - on RodneySr, the tip's x64 `--dir` package with `origin/main` merged in;
     - on Rodney, an `--arm64 --dir` package of the same commit and a 25 s native-arm64 scratch-profile launch with no error or crash;
     - `npx asar list` checked against `dist/` on both;
     - P1–P3 re-run on the packaged exe;
     - a "Package verification" section in the close-out;
     - Blurby.Brain1's confirmation before the merge go.
  7. **Fence (standing rule 41).** `git diff --name-status <base>` lists exactly the following, plus `docs/studies/investigations/NARRATE-SAVE-AS-YOU-GO-1.*`, the governance staging memo and the time log:
     - `M src/reader/modes/narrate/ModeRuntime.ts`
     - `A tests/narrate/narrate.saveAsYouGo.test.ts`
     - only if Q1 is ruled (B) after CPC-1 and FLOW-SAVE-AS-YOU-GO-1 merge without it: `M src/reader/ports/createReaderPorts.ts` and `M tests/readerModeIsolation.test.ts`

     Otherwise nothing in `src/reader/ports/`, `src/components/ReaderContainer.tsx`, `src/types.ts`, `src/utils/FlowScrollEngine.ts`, `src/constants.ts`, Narrate's engine, view, bindings, surface or helpers, any other mode, `main/` or `preload.js`.
  8. **Merge-tree check:** `git merge-tree` of the tip against `origin/main` is clean at the merge go. A conflict in a fenced file goes to Blurby.Roadmap before resolution.
  9. **Owner, added to release gate (2)'s list:** listen in Narrate for a while, then close the app any way at all: the book reopens within a few seconds' listening of the spoken word. Pause Narrate and reopen: Play starts at the start of the paused sentence.
- **Effort:** M, in two waves (A: red rows, the change and the tests; B: package, probes and close-out), each about 35 tool uses and its own dispatch. Technical effort: medium.
- **Owners:**
  - Blurby.Brain1 rules Q1–Q5, coordinates and confirms the package (rule 53);
  - RodneySr implements, tests and probes; Rodney runs the arm64 launch;
  - spec-compliance review, then quality review;
  - Blurby.Roadmap gives the merge go and closes it out.
- **Merge order:**
  - after CFI-POSITION-CONSISTENCY-1 (Seq 97.5) and FLOW-SAVE-AS-YOU-GO-1 (Seq 97.6), in Seq order on the single executor, RodneySr.
  - Later items that edit `narrate/ModeRuntime.ts` re-grep `saveProgressWord` and `cursorWord`, and keep their calls in `onEngineCursor`, `onEngineState`, `stop` and before every engine restart: FOCUS-PAUSED-HANDOFF-1 (Seq 118), NARRATE-SELECTION-START-1 (Seq 124), EINK-VIEW-REFRESH-1 (Seq 130), EINK-NARRATE-VIEWPORT-1 (Seq 130.5), and NARRATE-PAUSED-CLICK-1's post-RC amendment if it has not merged.
  - NARRATE-RESTAMP-CURRENT-1 edits only Narrate's `FoliateView.tsx`, so it does not conflict.
- **Path:** dispatch (two waves).

##### Owner rulings (2026-11-03)
- **O5:** Flow and Narrate "save as you go" while playing, like Focus under O4, so a quit or crash reopens within a few words. In this spec that is the design and Wave A.
- **O3:** "on narrate, the start should be the start of the sentence from the saved word on restart". Already met at `narrate/ModeRuntime.ts:321`, `:331-332` and `narrate/engine/chunkPlan.ts:79-84` (re-grepped at `14ce3d24`). This item pins it through row n2 and probe P2, and adds no code for it (design 12).

##### Blurby.Brain1 rulings (binding)
General rules for every playback mode, 2026-11-03:
- **G1, what is saved:** the mode's playback word, never the viewport's. Narrate saves the engine's cursor word: the exact word-table word, not the chunk start. After a browse-away the timed save still records the playback word. Applied in designs 1 and 2 and rows n1, n3 and n9.
- **G2, cadence:** `RSVP_PROGRESS_SAVE_INTERVAL_MS` (5,000 ms, `src/constants.ts:168`) while playing, plus one save on pause, stop and mode exit, only when the word has changed since the mode's last save. Import the constant; add no second constant and rename none. CPC-1 Wave C rewrites its comment; this item does not edit `src/constants.ts`. Applied in designs 3–5 and rows n1, n2 and n4.
- **G3, cfi:** every timed or pause save sends `null`. Main clears the cfi only when the position changes. No cfi is derived for the playback word. CPC-1 Wave B's open hold makes the position win on reopen. The relocate saves keep their viewport cfi, unchanged. Applied in design 7 and row n5.
- **G4, map guard:** save only while `document.bookWords` is loaded, or off EPUB. Narrate's pre-arrival fallback words never save. Applied in design 8 and row n8; Q3 asks to read it as "the running engine's words".
- **G5, crash window:** main's 500 ms `LIBRARY_SAVE_DEBOUNCE_MS` window is accepted. The bound at 1.00x is under "Crash window".
- **G6, furthest mark:** raised with a `null` furthest cfi through the bridge's `noteHighWater`. `tests/keepFurthest.test.tsx` stays green and unedited, or STOP to Blurby.Brain1. Applied in Done-when 3.
- **G7, sync queue:** only one mode plays at a time, so the new writes stay at most 12 a minute (Findings F-018), plus at most one re-save per pause (design 10).
- **G8, no double writes:** a timed save is skipped if the mode's relocate save already wrote the same word within the interval. The existing relocate-suppression rules are unchanged. Applied in design 9 and row n6.
- **Isolation:** each mode implements this in its own runtime, with no shared helper and no sibling-mode import. The shared core (`src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`) is not edited. None is needed: the bridge carries `null` after CPC-1 Wave A.
- **Required rows**, committed alone first (standing rule 43): kill during play (n1), pause, then reopen at the sentence start (n2), browse away (n3), no write while paused or unchanged (n4), the stored cfi is null (n5), a GREEN control (n7) and a G8 row (n6).
- **Sequencing:** after CFI-POSITION-CONSISTENCY-1 Waves A (the `null` contract) and B (the open hold); in Seq order on RodneySr.

##### Questions for Blurby.Brain1
- **Q1. The mode-exit save meets the port broker's teardown window (STOP before Wave A).** As in FLOW-SAVE-AS-YOU-GO-1 Q1: the router stops Narrate inside `broker.teardown`, which accepts only `settings.update{isNarrating}` and `diagnostics.*` (`createReaderPorts.ts:46-49`). A `persistence.updateDocProgress` from `stop()` is rejected. **Recommendation: (B)**: one signature rule admitting `persistence.updateDocProgress` with a `null` cfi, and `persistence.updateProgress`, as release-class calls. Make it once, in CPC-1 Wave C, where Focus's row f5 needs it first. (C), no exit save, is the fallback: the handover carries the cursor word, and the last timed save bounds a later kill to one interval.
- **Q2. A pending relocate save can overwrite a newer pause save.** Narrate's view turns pages to follow the spoken word, and each turn schedules a relocate save of the word at that turn, written up to 2,000 ms later (`ReaderContainer.tsx:331-336`). A pause within 2 s of a turn is overwritten by an older word and its page's cfi, so the reopen can start a sentence early. **Recommendation:** the same mode-local re-save as FLOW-SAVE-AS-YOU-GO-1 (design 10 here). During play, accept G5's relocate term (at most 22 words at 1.00x).
- **Q3. G4's map guard reads the running engine's words.** `start()` requests the map only after the engine starts (`:341`), and `adoptDocument` does not restart it, so an engine started on the fallback words keeps them. **Recommendation:** save only while the running engine was started on the map (`engineOnBookWords`), which is G4's intent. Row n8 (b) pins it.
- **Q4. The engine's cursor is stale after a restart until the new epoch sounds.** `play()` does not reset `cursor` (`narrateEngine.ts:534-545`). A click while playing, a navigation or a new Play leaves the old word in `cursor` until the first unit of the new epoch is heard. A pause in that gap would save the old word over the click's own save. **Recommendation:** design 2: clear the runtime's `cursorWord` before every engine restart, and save only a word published since. Row n9 pins it. G1 is unchanged: the saved word is always a published table word.
- **Q5. A hidden window publishes no cursor, so it makes no timed save.** The cursor is published only on animation frames (`useModeBindings.ts:33-41`), and a minimized or hidden window gets none. Narration keeps going through `pump`. A kill after minutes in the background loses everything since the window was hidden. Publishing the cursor from `pump` would change the engine's publication cadence, which this item does not own. **Recommendation:** accept here, keep the probes' window shown, and register a finding for the item that owns Narrate's cursor publication (a timer-driven `tick` while hidden would cover it).

##### Lessons applied
- **LL-029:** the save compares word indices only. No range, offset or page position is read to pick the word.
- **LL-030:** nothing saves before a start has run the engine (row n7).
- **LL-073:** the resume anchor and its relocate suppression are untouched; the timed save reads the engine's cursor, not the anchor.
- **LL-108:** Narrate saves its authoritative narration cursor, never visual state.
- **LL-126:** the saved word is the produced-and-heard table word, never the prefetch frontier or a chunk's start.
- **LL-127:** no instrumented twin or scheduling head seeds the saved position. Only `onCursor`'s word at the heard sample does.
- **LL-142:** the base's behaviour is measured on `<base>` (rows and probes) before the fix is trusted. The saved word is a timing-table word, never an estimate.
- **LL-143:** every gate names its shell and an exact exit code, with the base's expected exit beside it.
- **LL-152:** one recipe for the `<base>` and tip probes.
- **LL-159:** a kill skips the quit flush and main's 500 ms timer, and the shell's relocate timer is a deferred writer too. The bound counts both.
- **LL-165:** the scratch profile is proved before the first input, and the live profile's hashes are unchanged.
- **LL-169:** the only new timer, design 10's re-save, is the runtime's own `setTimer`, cleared by `stop()`. It checks its captured relocate record before it writes.
- **LL-173:** row n1 also runs with an output whose heard position lags the scheduling head, so a save that read the wrong clock would fail.
- **LL-181:** the branch lives under `.worktrees`, and the push uses an explicit lowercase refspec.
- **Standing rule 55:** verdicts come from saves, `library.json`, sampled word indices and request words, not screenshots.
- **Standing rule 53:** package verification, with Blurby.Brain1's confirmation before the merge go.
