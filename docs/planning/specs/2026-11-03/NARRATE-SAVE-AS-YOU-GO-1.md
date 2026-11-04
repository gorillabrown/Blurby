#### NARRATE-SAVE-AS-YOU-GO-1 — Narrate saves your place every few seconds while it speaks, so a quit or crash reopens within a few words *(Seq 97.7; Full Spec 2026-11-03, cited against `origin/main` `14ce3d24`, after NARRATE-ARRIVAL-SYNC-1's merge; TTS / Narration Engine; owner rulings O5 and O3 and Blurby.Brain1's general rules G1–G8 of 2026-11-03; Q1–Q5 ruled 2026-11-03; STOP-Q5a ruled 2026-11-03 (one read-only engine method); STOP-CLOSE ruled (A) 2026-11-03; dispatch-ready (the close-save fix lands in CFI-POSITION-CONSISTENCY-1 Wave C, with owner ruling O6; F4 and Q4 restated in the ruling section); after CFI-POSITION-CONSISTENCY-1 and FLOW-SAVE-AS-YOU-GO-1; no shared-core edit; not a release gate)*

- **What:**
  - Narrate saves the spoken word while it plays: the exact word-table word at the heard sample, read through the engine's one new read-only query `wordAtPlaybackSample()` (STOP-Q5a ruling), never a chunk's first word and never the last painted word. It saves every `RSVP_PROGRESS_SAVE_INTERVAL_MS` (5,000 ms) from a timer, so it keeps saving while the window is hidden or minimized (Q5 ruling), and once more when playback pauses or stops, each time only if the word has changed since Narrate's last save.
  - Every such save sends an explicit `null` cfi, so main clears the stored page whenever the word moved.
  - Browsing away does not stop Narrate. While the reader browses, the timed saves keep recording the spoken word, never the page on screen.
  - A reopen at the saved word starts Play at the first word of its sentence (owner ruling O3). This item adds no code for that; it pins it.
  - **Out of scope:**
    - Focus (CFI-POSITION-CONSISTENCY-1 Wave C) and Flow (FLOW-SAVE-AS-YOU-GO-1, Seq 97.6).
    - Narrate's relocate save and its guards (`shouldPersistRelocateProgress`, browse-away, the resume anchor). They are unchanged (G8).
    - The producer (`main/narrate/`), the view and the bindings, including how often the frame path publishes the cursor (`tick()`).
    - The engine (`src/reader/modes/narrate/engine/`) beyond one public read-only method, `wordAtPlaybackSample()` in `narrateEngine.ts` (STOP-Q5a ruling, design 16). No other engine line changes, and no existing engine test row is edited.
    - Ticking the engine from a timer. Brain1 rejected that option (STOP-Q5a option (b)); it must not be used.
    - The sentence-start rule itself (`sentenceStartAt`, NARRATE-SENTENCE-RESUME-1).
    - The shell's bridge, its debounced relocate timer, main's write path and `src/constants.ts` (CPC-1 Wave C rewrites the interval's comment; G2).
    - The end of the book. `onEngineComplete` stops playback before the router stops Narrate (`narrate/ModeRuntime.ts:763-769`), and the shell's completion path owns the finish save, unchanged.
  - **Outcome:**
    - On *Meditations*, Narrate speaks at 1.00x for 20 s with the window visible, then the app is killed with no graceful quit. The reopen shows a word at most 17 words behind the last spoken cursor word (22 if a relocate save landed last; see G5), and the stored cfi is absent unless a relocate save landed last.
    - The same with the window minimized for the 20 s: the reopen shows a word within the hidden-window bound (Crash window) of the word being spoken at the kill.
    - Narrate plays, pauses, and the app is killed. The stored word is the word at the paused sample with no cfi, and after the reopen Narrate's Play starts at that word's sentence start.
    - Narrate plays while the reader pages away. The saved word is the spoken word, not the page on screen.
    - Narrate plays, pauses, the reader clicks word X, and Narrate stops. The stored word is X.
    - Narrate plays for about 12 s, then the reader closes the book the normal way (Escape twice). The stored word is not older than the last timed save. At `14ce3d24` the close save writes an older word; CPC-1 Wave C fixes it (STOP-CLOSE ruled (A)), and row n19 keeps it fixed.
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
  - **The cursor is published only on display frames.** The binding ticks once per animation frame while playing (`narrate/useModeBindings.ts:33-41`), and a hidden or minimized window gets no frames. Only the timer-driven `pump` runs then (`:40`, every `NARRATE_PUMP_INTERVAL_MS`, 250 ms, `src/constants.ts:37`). So a hidden window publishes no cursor, and a save driven by the published cursor would stop. Brain1 overruled Q5's "accept": the timed save runs from a timer and reads the word at the current sample (design 15).
  - **The engine has no public word-at-sample query** (checked at `14ce3d24`; STOP-Q5a, ruled (a) on 2026-11-03: one new read-only method, design 16):
    - `getSnapshot().cursor` (`narrateEngine.ts:195-197`) is the last word `tick()` published, the last painted word, not the word at the current sample.
    - `tick()` (`:333-348`) is the only public path from `output.playbackPosition()` to a table word. It needs no frame, but it is not a query: it publishes through `onCursor` (`commitUnit`, `:351-352`; `publish`, `:548-553`), sets `lastTickPerf`, the trace record's frame interval (`:338-340`), and after a long gap publishes every unit sounded since the last publish (D5, `:344-347`).
    - `position()` (`:500-509`) and `wordAt()` (`:512-515`) do the lookup but are private.
    - `pump()` (`:316-331`) reads the sample but returns no word.
    - The runtime's `tick` (`narrate/ModeRuntime.ts:638-641`) only forwards to `engine.tick()`.
  - **What the new query sees at each moment** (all at `14ce3d24`):
    - **A restart drops every chunk.** `play()` calls `reset()` (`narrateEngine.ts:201-202`), which adds one to `epoch` (`:535`) and drops every chunk (`dropFrom(0)`, `:537`). `position()` finds a chunk only if it has a live `source` (`:503`). So from a restart until the new epoch's first chunk is scheduled, the query returns `null`.
    - **Leading silence:** `position()` reports unit `-1` (`:505`), and `tick()` treats it as silence (`:342`). The query returns `null` there too.
    - **A pause cancels the sources.** `engine.pause()` reads the heard sample (`:212-214`), then cancels every source (`stopSource`, `:215`, `:481`), then reports `paused` (`:220`). So by the time the runtime's `onEngineState` hears `paused`, the query returns `null`. The runtime must read the paused sample just before it calls `engine.pause()` (design 1).
    - **An F4 pause** comes from the engine after the scheduled audio has played out (`pump`, `:324-328`; `fail`, `:494-495`). No unit is at the sample then.
    - **The epoch also moves without a runtime restart:** a speed change (`setSpeed`, `:279`), a resume that abandons a prefetch (`:251`), and a resume that replays the sentence from an earlier chunk (`:238`, through `play`). Each of these is inside a runtime call (`setSpeed`, `ModeRuntime.ts:449`; `applySettings`, `:438`; `resume`, `:359`).
  - **The reader's close save does not follow the spoken word** (traced at `14ce3d24`; STOP-CLOSE-narrate, ruled (A) below and fixed by CPC-1 Wave C step 6; row n19). The normal close is Escape twice:
    - The first Escape reaches `handleExitReader` (`src/components/ReaderContainer.tsx:614-630`). Outside Page it calls `handleExitToPage()` (`:627-629`), which is `router.exitToPage()` (`src/reader/useReaderModeOrchestrator.ts:133`, `:354-357`). That stops Narrate with `"user-stop"`, so this item's exit save writes the spoken word (design 14).
    - The handover to Page is `exportHandoff("persistent")` (`narrate/ModeRuntime.ts:414-430`), with `highlightedWordIndex` replaced by `publishedWordIndex` (`useReaderModeOrchestrator.ts:356`). Page copies `publishedWordIndex` from it (`page/ModeState.ts:33`).
    - The second Escape, now in Page, runs `finishReading(exitAnchor)` (`ReaderContainer.tsx:625-626`), where `exitAnchor` is `canonicalWordAnchor` (`:615`), which is the router snapshot's `currentWordIndex` (`:437`), which is the active runtime's `publishedWordIndex` (`useReaderModeOrchestrator.ts:258`).
    - `finishReading` calls `_persistAndLog(finalPos)` (`src/hooks/useProgressTracker.ts:296-299`), which writes `savePos` through `onUpdateProgress` and `api.updateDocProgress` (`:258-259`). Main sets the position with no forward-only check (`main/ipc/documents.js:22-23`).
    - **Narrate's cursor does not move `publishedWordIndex`.** `onEngineCursor` commits with `persist: false, publishState: false` (`narrate/ModeRuntime.ts:732`). The anchor helper writes `publishedWordIndex` only when `publishState` is true (`narrate/helpers/usePersistentReadingAnchor.ts:85-88`). The cursor still moves `canonicalWordIndex` (`:60`) and the highlight (`ModeRuntime.ts:733`), but neither reaches the shell's word index state.
    - So `finalPos` is the word Narrate was entered at (`syncVisualToPersistentWord` on select, `ModeRuntime.ts:271`), or the last click, navigation or jump back (`commitShared`, `:899-903`; `jumpBack`, `:504`). After 12 s of listening, the close save overwrites the last timed save W with that older word. The backtrack prompt does not catch it: it shows only when the word trails the furthest mark by about two pages (`checkBacktrack`, `useProgressTracker.ts:308-324`; `APPROX_WORDS_PER_PAGE = 250`, `src/constants.ts:164`).
    - `tests/readerModeIsolation.test.ts:348` pins "exitToPage hands off the published word as the highlight".
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
    - So a pause save of the paused word is all O3 needs.
  - **The bridge after CPC-1 Wave A.** `ports.persistence.updateDocProgress(docId, word, null)` reaches `ReaderContainer.tsx:311-316`. It calls `api.updateDocProgress`, forwards `null` to the library copy, and raises keep-at-furthest's mark through `noteHighWater` (`:315`) with a `null` furthest cfi (G6). Main clears the stored cfi only when the position changed (CPC-1 design 1). **No shared-core edit is needed here.**
  - **Write cost** (G5, G7). `update-doc-progress` (`main/ipc/documents.js:14-31`) calls `ctx.saveLibrary()` (`:28`) and enqueues `update-progress` (`:31`). `saveLibrary` (`main.js:120-131`) coalesces over `LIBRARY_SAVE_DEBOUNCE_MS` (500 ms, `main/constants.js:155`). A graceful quit flushes it (`main.js:643`); a kill inside the window loses the newest save. `enqueue` rewrites `sync-queue.json` per call (`main/sync-queue.js:169-182`; Findings F-018). The new saves add at most 12 of each a minute (G7), plus at most one extra write per pause (design 10).
  - **Facts G1–G8 did not settle** (questions Q1–Q5, ruled 2026-11-03; see "Blurby.Brain1 rulings on Q1–Q5"):
    1. **A mode-exit save was rejected by the port broker.** The router stops the outgoing mode inside `broker.teardown` (`src/reader/useReaderModeOrchestrator.ts:303-307`). At `14ce3d24` only `settings.update{isNarrating}` and `diagnostics.*` pass there (`src/reader/ports/createReaderPorts.ts:46-49`, `:108-110`). Narrate's own `settings.update({ isNarrating: false })` in `stop()` (`:394`) is such a release-class call. CPC-1 Wave C adds `persistence.updateDocProgress` and `persistence.updateProgress` to the list, once for all three modes, with the pinned rows of `tests/readerModeIsolation.test.ts` under a named exception (Q1 ruling). This item makes no broker edit.
    2. **A pending relocate save can land after a newer pause save.** The view turns pages to follow the spoken word, and each turn schedules a relocate save of the word at that turn. A pause within 2 s of a turn is then overwritten by that older word and its page's cfi, and the reopen can start a sentence early (Q2).
    3. The map guard (Q3), the stale cursor after a restart (Q4) and a hidden window (Q5), above.
  - **The structural guard.** `tests/narrate/narrate.structural.test.ts:33-44` scans `narrate/ModeRuntime.ts`'s code, with comments stripped, for estimator markers: `\bwpm\b`, `msPerWord`, `wordsPerMinute`, `(lag|offset)Ms = <digit>` and others. The new code uses none of them.
  - **Users see:** listen for a few minutes on one long page, close the app hard, and the book reopens where Narrate started.
- **Design decision:** technical (Blurby.Brain1 G1–G8); the behaviour is owner ruling O5 ("save as you go", like Focus under O4), with O3's sentence-start restart unchanged.
- **The design** (mirrors CPC-1 design 9 and FLOW-SAVE-AS-YOU-GO-1; every line in `src/reader/modes/narrate/ModeRuntime.ts`, except design 16's one engine method in `narrateEngine.ts`):
  1. **Which word (G1; STOP-Q5a ruling):** the exact table word at the heard sample, read through `engine.wordAtPlaybackSample()` (design 16). It reads the same table at the same sample as the frame path (`tick()`, `narrateEngine.ts:333-348`), so owner ruling #31 holds. It is never the chunk's start (`inFlightStart`, `nextWord`), never the scheduling head, never the view's page and never the last painted word.
     - **Timed save:** the read at each timer tick (design 15).
     - **Pause save:** the paused sample. The runtime reads it just before it calls `engine.pause()`, because the pause cancels the sources and the read is `null` afterwards (Why).
     - **Stop save:** the committed word, if a user intent (a click, a key, a navigation) committed one after the pause. That is Narrate's version of CPC-1's C3 (row n20). Otherwise the read at the stop, taken before the engine stops.
     - **Silence:** a read in a gap between chunks, or after an F4 pause has played out the scheduled audio, is `null`. Silence holds the last word (R6), so a pause or stop save then uses `heardWord`: the last save-eligible word heard since the latest restart, from a read or from `onEngineCursor` (design 2), and only while its epoch is the engine's current epoch (`heardEpoch`, design 2). A timed save in silence saves nothing; the next tick reads again.
     - **F4 (Brain1, 2026-11-03):** if the engine pauses after its audio drains, the pause save records the last heard word, the last published cursor (R6). Neither F4 path moves the epoch (`pump`, `narrateEngine.ts:324-328`; `fail`, `:484-495`), so `heardWord` is save-eligible there. With the window shown, `onEngineCursor` sets `heardWord` to each published cursor, and a read after the drain is `null`, so `heardWord` is the last published cursor. With the window hidden, it is the timer's last read, a later heard word: the save never goes behind the last timed save.
  2. **A fresh epoch only (Q4 ruling):** after a restart, the first save-eligible read is the first non-null read whose `epoch` equals the restart's epoch. A read from the previous epoch never saves. This replaces the first draft's "first published word" mechanism.
     - **The restart's epoch** is `engine.getSnapshot().epoch`, read right after every runtime call that restarts the engine (`engineFor(...).play`, `:340`; `this.engine.play`, `:409`, `:477`, `:495`; and, once CHAPTER-STEP-CFI-1 has merged, its landing restart. At `14ce3d24` these four are the only `.play(` calls in the file). `play()` moves the epoch synchronously (`narrateEngine.ts:202`, `:535`).
     - At each restart the runtime also clears `heardWord`, marks the restart as not yet sounded, clears the paused intent (design 1) and re-arms the save timer (design 15), so the interval restarts with the new epoch.
     - **Epoch moves inside a restart.** Until the restart has sounded, the runtime reads the epoch again after its own `engine.resume()` (`:359`) and `engine.setSpeed(` (`:438`, `:449`), which can move it without a restart (Why). Once a read has matched, the restart has sounded, and later reads save at any later epoch of the same engine.
     - **Q4 (Brain1, 2026-11-03):** the runtime re-reads the epoch after its own resume() and setSpeed() until the restarted audio has sounded. A read whose epoch predates the latest restart, resume or speed change never saves.
       - A fresh read always carries the current epoch (`wordAtPlaybackSample()` returns `this.epoch`; `onEngineCursor` reads `getSnapshot().epoch`). The stale one is the held `heardWord`. So `noteHeard` records `heardEpoch` with `heardWord`, `noteRestart` clears both, and a pause or stop save uses `heardWord` only while `heardEpoch` equals `engine.getSnapshot().epoch` (`freshHeard()`, Wave A step 12).
       - A speed change moves the epoch (`narrateEngine.ts:279`), and so can a resume (`:251`, or `play` at `:238`). After one of them, a pause in silence before the new audio sounds saves nothing (row n23). The pause before a resume already saved the paused word.
     - So a pause, stop or timed save before the new epoch sounds saves nothing (rows n9, n18, n21 and n23).
     - `lastSavedWord` is not reset. A click's or a navigation's own save sets it (design 4), and resetting it would only write that word a second time.
  3. **When (G2):**
     - every `RSVP_PROGRESS_SAVE_INTERVAL_MS` while playing, from the runtime's own timer, not from animation frames (Q5 ruling; design 15);
     - once more when the engine reports `paused` while the runtime was playing. That covers `pause()`, `togglePlay()`'s pause branch and an F4 failure pause;
     - once more on `stop()` while playing: a mode exit or a cross-book open, inside the router's teardown window (design 14, Q1). Not on unmount.
     - Each fires only if the word differs from Narrate's last save.
  4. **"Narrate's last save"** is the last word Narrate itself wrote: a save from this design, or a persisted commit through `commitShared` (`:899-903`: a click, an off-EPUB navigation, and CHAPTER-STEP-CFI-1's landing once merged). A relocate save counts only under G8.
  5. **The interval restarts at each start, resume and restart** (the save timer is re-armed there, design 15). The pause before a resume already saved, so this avoids a save of the first word heard after a long pause.
  6. **Only on playback that was playing.** A `pause()` while paused returns early today (`:349`). A click while paused saves its own word and does not restart the engine (`:475-477`), so a later stop records that committed word, which is already Narrate's last save, and writes nothing (design 1; row n20).
  7. **The cfi (G3):** every save is `updateDocProgress(documentId, word, null)` then `updateProgress(documentId, word)`. No cfi is derived for the word. The relocate save keeps its own viewport cfi.
  8. **The map guard (G4, Q3 ruling):** the guard checks the word space the running engine started on, and saves only if that start used the map's words: `engineOnBookWords`, set at each `start()` from the word source `effectiveWords()` just used (`!useFoliate || bookWords != null`). An engine started on the pre-arrival fallback words never saves, even after the map arrives, until it restarts on the map, which is the next `start()`. Clicks, navigations and resumes reuse the engine's words, so they keep the flag.
  9. **No double write (G8):** `onRelocate` records `{ word, at }` just before it schedules its save. A save of the same word within `RSVP_PROGRESS_SAVE_INTERVAL_MS` of that record is skipped and counted as Narrate's last save.
  10. **The re-save after a pending relocate save (Q2 ruling; as FLOW-SAVE-AS-YOU-GO-1 design 9).** Narrate re-saves after a pending relocate save lands, only if that save's word differs from the pause word, so the final stored word is the pause word (row n16). After a pause save of `w`, if the last relocate save was scheduled less than `FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS` ago with a different word, one `setTimer` (`:917-920`) fires 1 ms after it is due and writes `w` again with `null`. It writes only if Narrate is still paused, its last save is still `w`, and no newer relocate was scheduled. `stop()` clears it (`clearTimers`, `:927-932`; LL-169).
  11. **Only after Play (LL-030):** the last-saved word starts as the word Narrate arrived at (`handoff.canonicalWordIndex`, `:180`), and nothing saves until a start has run the engine.
  12. **O3 is unchanged.** The pause save stores the word at the paused sample. The sentence-start rewind is applied when Play starts after the reopen (`:331-332`), never at save time. Storing the sentence start instead would move the reopened view back across a page for no gain.
  13. **Isolation:** no shared helper, no sibling import, no new shared module. The constants come from `src/constants.ts`, which Narrate already imports (`:13-22`).
  14. **The exit save (Q1 ruling, with Brain1's C1 condition).** Narrate relies on CPC-1 Wave C's release list and makes no broker edit.
      - The exit save is made synchronously inside `stop()`, during `broker.teardown`, after every save timer is cleared: design 10's re-save and design 15's save timer, both cleared by `clearTimers()` (`:376`). Its word is read at the top of `stop()`, before anything stops, because `engine.stop()` drops every chunk (`narrateEngine.ts:264-266`). It is written after the engine stops (`:381-382`), and the frame path cannot publish then, because the runtime's `tick` returns once `alive` is false (`:638-641`).
      - Nothing asynchronous saves after release. The broker's release allowance ends with the teardown frame (`createReaderPorts.ts:189-200`, `:109-110`), and row n15 shows nothing is even attempted.
      - **Not on unmount.** `router.destroy()` runs `closeAll(false)`, which closes every key with no release window before `destroy()` calls `stop("teardown")` (`useReaderModeOrchestrator.ts:312-326`, `:377-379`; `narrate/ModeRuntime.ts:399-403`). So `stop()` skips the exit save when its reason is `"teardown"`, which reaches it only from that path (row n17).
  15. **The timed save runs from a timer (Q5 ruling).** Listening with the window hidden or minimized is a main use of Narrate, and a hidden window gets no animation frames.
      - **The timer:** a re-arming chain on the runtime's own `setTimer` (`:917-920`), so `stop()`'s `clearTimers()` ends it and its callback checks `alive` (LL-169). A field `saveTimerToken: symbol | null` and `private armSaveTimer()` set a new token and schedule `onSaveTimer(token)` after `RSVP_PROGRESS_SAVE_INTERVAL_MS`.
      - `onSaveTimer(token)` returns unless the token is current and the runtime is playing. It saves the heard word (below) with reason `"interval"`, then re-arms.
      - It is armed at `start()`, at `resume()` and at every restart (design 2). The `paused` branch of `onEngineState` sets the token to `null`.
      - **The word at each tick:** `engine.wordAtPlaybackSample()` (design 16; STOP-Q5a ruling), the word at the current playback sample through the same exact word-table lookup the frame path uses (`position()` and `wordAt()`, `narrateEngine.ts:500-509`, `:512-515`), never the last painted word and never `getSnapshot().cursor`. The read is save-eligible under design 2 (Q4).
      - **Not by ticking.** The timer never calls `engine.tick()` or the runtime's `tick()`. Brain1 rejected that option (STOP-Q5a option (b)).
      - **Throttling:** Chromium throttles timers on hidden pages. Brain1 accepts about once a minute after 5 minutes hidden. The bound is under "Crash window".
  16. **The engine query (STOP-Q5a ruling (a)).** One public read-only method in `src/reader/modes/narrate/engine/narrateEngine.ts`, beside `getSnapshot()` (`:195-197`):
      - `wordAtPlaybackSample(): { word: number; epoch: number } | null`.
      - It is composed only of the private `position(t)` (`:500-509`) and `wordAt()` (`:512-515`), at `this.output.playbackPosition()`: `const pos = this.position(this.output.playbackPosition()); if (!pos || pos.unit < 0) return null; return { word: this.wordAt(pos), epoch: this.epoch };`.
      - It returns `null` when no unit is playing (no live chunk at the sample: before the first chunk, in a gap, after a pause or a stop), during leading silence (`pos.unit < 0`), and during an epoch switch (a restart drops every chunk, Why).
      - With `pos.unit >= 0`, `wordAt(pos)` is `c.entry.startWord + c.unitWord[pos.unit]`, the word `commitUnit` publishes for that unit (`:352`). So it reads the same exact word table at the same sample as the frame path (`tick()`, `:333-348`), and rule #31 holds.
      - It has no side effects: it calls no `publish`, `commitUnit`, `pump`, `fill` or event, and writes no field (`cursor`, `lastTickPerf`, `lastPublished`, the trace).
      - Its doc comment names this item, STOP-Q5a and rule #31. No other engine line changes.
- **Crash window (G5).** Narrate's typical rate is 1.00x (`ttsRate` defaults to 1.0, `:179`). Kokoro speaks about 166 words a minute there (S5's measured pace, `docs/planning/epics/2026-10-12-narrate-rebuild/plan.md:312`). Silences between chunks hold the cursor, so they only lower the count.
  - **Last write a timed or pause save:** at most one interval, main's 500 ms and one word: `ceil(166 × 5,500 / 60,000) + 1` = **17 words**.
  - **Last write a relocate save** (a stored cfi is present): add the 2,000 ms relocate debounce: `ceil(166 × 7,500 / 60,000) + 1` = **22 words**.
  - **Unit rows:** the fake producer speaks 200 ms a word (300 words a minute; `tests/narrate/harness/fakeProducer.ts:24-25`), with fake timers and no shell timer, so the bound is `ceil(300 × 5,000 / 60,000) + 1` = **26 words**.
  - **A hidden or minimized window** (Q5 ruling). The timed save runs from a timer, so it continues, but Chromium throttles timers on hidden pages:
    - **Hidden for up to 5 minutes:** timers wake at most once a second, so add 1 s: `ceil(166 × 6,500 / 60,000) + 1` = **19 words**, or **25** if a relocate save landed last.
    - **Hidden for more than 5 minutes:** about once a minute, which Brain1 accepts. The stored word then trails by up to about one minute of listening: `ceil(166 × 60,500 / 60,000) + 1` = **169 words**, or **174** if a relocate save landed last.
    - Chromium may spare an audible page the once-a-minute throttling. The bound does not rely on that.
    - Design 15's word is the word at the sample, so a late save is late but never ahead.
    - **Checked against Brain1's bounds of 2026-11-03:** hidden window, 19 (25) words for the first 5 minutes, then 169 (174) under Chromium throttling. The numbers above match.
- **The change.** Line numbers are at `14ce3d24`. CHAPTER-STEP-CFI-1 and CFI-POSITION-CONSISTENCY-1 move lines in this file, so re-grep every cited line at the cut (standing rule 36):

  ```
  git grep -n -E '^  (start|pause|resume|togglePlay|stop|jumpToWord|hardSelect|navigateTo|setSpeed|applySettings)\(|private (onEngineCursor|onEngineState|commitShared|setTimer|clearTimers|completeLanding)|onRelocate = |scheduleRelocateSave|const effectiveWords = \[|\.play\(|\.resume\(\)|\.setSpeed\(|\} from "\.\./\.\./\.\./constants"' -- src/reader/modes/narrate/ModeRuntime.ts
  git grep -n -E '^  getSnapshot\(\)|^  tick\(\)|private (position|wordAt|reset|publish)\(|this\.epoch \+= 1' -- src/reader/modes/narrate/engine/narrateEngine.ts
  git grep -n -E 'RSVP_PROGRESS_SAVE_INTERVAL_MS|FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS' -- src/constants.ts src/reader/modes
  git grep -n -E 'READER_PORT_RELEASE_CALLS = |persistence\.updateDocProgress' -- src/reader/ports/createReaderPorts.ts
  git grep -n -E 'cfi\?: string' -- src/reader/ports/ReaderPorts.ts
  ```

  git grep -n -F 'publishedWordIndex: s.canonicalWordIndex,' -- src/reader/modes/narrate/ModeRuntime.ts
  ```

  If `ReaderPorts.ts` still types the cfi as `string` only, CPC-1 Wave A has not merged: STOP. If `READER_PORT_RELEASE_CALLS` lacks `"persistence.updateDocProgress"` or `"persistence.updateProgress"`, or Narrate's `exportHandoff` lacks CPC-1 Wave C step 6's line, CPC-1 Wave C has not merged: STOP.

  - **Wave A — red rows, the change and the tests** (about 36 tool uses; STOP-CLOSE-narrate is ruled (A), and its fix is CPC-1 Wave C step 6, so this wave makes no `exportHandoff` edit):
    1. **Imports** (`:13-22`): add `RSVP_PROGRESS_SAVE_INTERVAL_MS` and `FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS`. Add no constant and rename none (G2).
    2. **Fields** (after `arrivalSyncInFlight`, `:168`):
       - `private lastSavedWord: number`, set in the constructor (`:180-182`) to `handoff.canonicalWordIndex`;
       - `private saveTimerToken: symbol | null = null` (design 15; it replaces the first draft's `lastSaveAt`, because the interval is now the timer's);
       - `private playedSinceSave = false`;
       - `private engineOnBookWords = false`;
       - `private heardWord: number | null = null` (design 1; it replaces the first draft's `cursorWord`), and `private heardEpoch: number | null = null`, the epoch of the read that set it (design 2, Q4);
       - `private restartEpoch: number | null = null` and `private restartSounded = false` (design 2, Q4);
       - `private intentWord: number | null = null` (design 1, the stop rule);
       - `private lastRelocateSave: { readonly word: number; readonly at: number } | null = null`.
    3. **`private saveProgressWord(word: number | null, reason: "interval" | "pause" | "stop"): void`.** It returns unless all of these hold:
       - `word != null` and `word >= 0`;
       - `playedSinceSave` and `engineOnBookWords` are true;
       - `word !== this.lastSavedWord`.

       Then:
       - **G8:** if `lastRelocateSave` has the same word and was recorded less than `RSVP_PROGRESS_SAVE_INTERVAL_MS` ago, set `lastSavedWord = word` and return.
       - Otherwise call `this.ports.persistence.updateDocProgress(this.document.documentId, word, null)` and `this.ports.persistence.updateProgress(this.document.documentId, word)`. Set `lastSavedWord = word`.
       - **Q2:** if `reason === "pause"`, arm design 10's re-save exactly as FLOW-SAVE-AS-YOU-GO-1 Wave A step 3 does, with a `resaveAfterRelocate(word, relocate)` that returns unless `!this.state.playing`, `this.lastSavedWord === word` and `this.lastRelocateSave === relocate`.

       Its comment names this item, owners O5 and O3, G1–G8 and LL-030. No identifier or code text matches the structural test's estimator markers.
    4. **`start()`** (`:282`): right after `const effectiveWords = [...this.effectiveWords()];` (`:300`), compute `const onBookWords = !this.document.useFoliate || this.document.bookWords != null;`. Just before `this.engineFor(effectiveWords).play(startWord);` (`:340`), set `this.engineOnBookWords = onBookWords` and `this.playedSinceSave = true`. Immediately after it, call `this.noteRestart()` (step 12). Nothing changes on the early returns (`:285`, `:295`, `:308`, `:317`).
    5. **`resume()`** (`:356-362`): after `this.engine.resume()` (`:359`), set `this.intentWord = null`, call `this.armSaveTimer()`, and `if (!this.restartSounded) this.restartEpoch = this.engine.getSnapshot().epoch;` (design 2). `heardWord` is kept: the engine replays from the paused sentence.
    6. **The other restarts (Q4):** immediately after `this.engine.play(...)` in `jumpToWord` (`:409`), `hardSelect` (`:477`) and `navigateTo` (`:495`), and after any further `.play(` the re-grep finds (CHAPTER-STEP-CFI-1's `completeLanding`, if merged; it is not on `14ce3d24`), call `this.noteRestart()`. Every runtime `.play(` call is followed by it. In `jumpToWord` the call goes inside the `if` before its `return`.
    7. **`onEngineCursor`** (`:722`): after `s.currentWordIndex = word;` (`:734`), add `if (this.engine) this.noteHeard({ word, epoch: this.engine.getSnapshot().epoch });`. It makes no save: the timed save is design 15's timer (Q5). The commit stays `persist: false` (`:732`).
    8. **The pause save (design 1).**
       - In `pause()` (`:345-354`), immediately before `this.engine?.pause();` (`:351`), add `if (this.engine) this.noteHeard(this.engine.wordAtPlaybackSample());`. That reads the paused sample: the same sample `engine.pause()` reads next (`narrateEngine.ts:212`). `togglePlay()`'s pause branch reaches this through `this.pause()` (`:366`).
       - In `onEngineState` (`:745`), in the `paused` branch (`:749`), capture `const wasPlaying = s.playing;` before it clears `playing`, and set `this.saveTimerToken = null`. After the branch, add `if (wasPlaying) this.saveProgressWord(this.freshHeard(), "pause");`. For an F4 pause, which the engine raises itself, no read precedes it, and `heardWord` is the last word heard, the last published cursor (R6; design 1, F4).
       - The `playing` and `stopped` branches are unchanged.
    9. **`stop()`** (`:371`; design 14). The parameter `_reason` becomes `reason`.
       - After `if (!this.alive) return;` (`:372`), capture `const exitWord = reason !== "teardown" ? this.exitWord() : null;`, with `private exitWord(): number | null`:
         - if `this.intentWord != null`, return it (a user intent committed a word after the pause);
         - else if `this.state.playing && this.engine`, call `this.noteHeard(this.engine.wordAtPlaybackSample())` and return `this.freshHeard()`;
         - else return `null` (paused with no intent since: the pause save already holds the paused sample).
       - Immediately after `this.engine = null;` (`:382`), which follows `this.clearTimers();` (`:376`) and `this.engine?.stop();` (`:381`), add `this.saveProgressWord(exitWord, "stop");`. A `null` word returns at once.
       - `engine.stop()` runs after `alive` is false, so its `stopped` state saves nothing. A second `stop()` returns early.
    10. **`onRelocate`** (`:527`): just before `this.ports.persistence.scheduleRelocateSave(...)` (`:545`), add `this.lastRelocateSave = { word: progressAnchor, at: Date.now() };`. Nothing else in the handler changes.
    11. **`commitShared`** (`:899-903`): after the commit, `this.lastSavedWord = clamped;` and `if (!this.state.playing) this.intentWord = clamped;`.
    12. **The save timer and the read helpers (designs 2 and 15):**
        - `private armSaveTimer(): void`: `const token = Symbol("narrate-save"); this.saveTimerToken = token; this.setTimer(() => this.onSaveTimer(token), RSVP_PROGRESS_SAVE_INTERVAL_MS);`;
        - `private noteRestart(): void`: `this.heardWord = null; this.heardEpoch = null; this.restartSounded = false; this.intentWord = null; this.restartEpoch = this.engine ? this.engine.getSnapshot().epoch : null; this.armSaveTimer();`;
        - `private noteHeard(read: { word: number; epoch: number } | null): number | null`: returns `null` if `read` is `null`, or if `!this.restartSounded` and `read.epoch !== this.restartEpoch` (a read from the previous epoch). Otherwise it sets `this.restartSounded = true`, `this.heardWord = read.word` and `this.heardEpoch = read.epoch`, and returns `read.word`;
        - `private freshHeard(): number | null`: returns `this.heardWord` if `this.engine` and `this.heardEpoch === this.engine.getSnapshot().epoch`, else `null` (Q4: a read whose epoch predates the latest restart, resume or speed change never saves);
        - `private onSaveTimer(token: symbol): void`: returns unless `this.saveTimerToken === token` and `this.state.playing`. It then calls `const word = this.engine ? this.noteHeard(this.engine.wordAtPlaybackSample()) : null;`, `this.saveProgressWord(word, "interval")` (a `null` word returns at once), and `this.armSaveTimer()`;
        - in `setSpeed` (`:449`) and `applySettings` (`:438`), after `this.engine?.setSpeed(rate)`: `if (this.engine && !this.restartSounded) this.restartEpoch = this.engine.getSnapshot().epoch;` (design 2);
        - no `requestAnimationFrame`, no `document.visibilityState` read, no call to `tick()` and no new constant.
    13. **The engine query (design 16; STOP-Q5a ruling (a)).** In `src/reader/modes/narrate/engine/narrateEngine.ts`, add the public method `wordAtPlaybackSample(): { word: number; epoch: number } | null` right after `getSnapshot()` (`:195-197`), with the body design 16 gives. Its doc comment names this item, STOP-Q5a and rule #31. No other engine line changes.
    14. Nothing else changes: not Narrate's view, bindings, surface or helpers, no other mode, no other engine line, and no existing test.
  - **Wave B — package, probes and close-out** (about 35 tool uses): Done-when 5–8.
- **Prerequisites:**
  - CFI-POSITION-CONSISTENCY-1 merged (Waves A–D): the `null` contract, the open hold, and its O3 pins (rows o3a and o3b).
  - FLOW-SAVE-AS-YOU-GO-1 merged or closed (Seq order on one executor). The two share no file.
  - Blurby.Brain1 ruled Q1–Q5 and STOP-Q5a on 2026-11-03 (below). Q1's broker change lands in CPC-1 Wave C, which must be merged. STOP-CLOSE-narrate was ruled (A) on 2026-11-03 with owner ruling O6; its fix, Narrate's persistent hand-off, also lands in CPC-1 Wave C (step 6). This item makes no `exportHandoff` edit.
  - RodneySr has the canonical clone `C:\Users\estra\Projects\Blurby` with `node_modules`, the sample *Meditations*, the Kokoro model used by gate (1), and the recipe for x64 `--dir` packages. Rodney has its canonical clone for the arm64 build.
- **Execution host:** RodneySr (x64) for the implementation, the tests, the packages, the probes and the rule 53 pair. Rodney (arm64) only for the rule 53 arm64 launch.
- **Branch:** `eb/narrate-save-as-you-go-1` at `C:\Users\estra\Projects\Blurby\.worktrees\narrate-save-as-you-go-1` on RodneySr. Create it after CFI-POSITION-CONSISTENCY-1 merges (and after FLOW-SAVE-AS-YOU-GO-1, in Seq order), with `git -C C:/Users/estra/Projects/Blurby worktree add -b eb/narrate-save-as-you-go-1 .worktrees/narrate-save-as-you-go-1 origin/main`. `<base>` is that `origin/main`. Push with `git push origin HEAD:refs/heads/eb/narrate-save-as-you-go-1` (LL-181).
- **Done when** (every command in `pwsh` from the worktree root):
  1. **Red first (standing rule 43).** Commit `tests/narrate/narrate.saveAsYouGo.test.ts` and `tests/narrate/narrate.wordAtSample.test.ts` alone, before any source edit. The first reaches no new name. The second reaches `wordAtPlaybackSample` only through a test-local optional call, `(engine as unknown as { wordAtPlaybackSample?: () => unknown }).wordAtPlaybackSample?.()`, so it runs on `<base>` and fails by assertion. Record every row's result on `<base>` in the memo. If a row named RED is green on `<base>`, STOP: its guard cannot fail.

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
       - after n1, `runtime.pause()` makes exactly one more save: the word at the paused sample with `null`. `run` ticks at each step, so it equals the cursor word here. A second run pauses with `togglePlay()`: the same.
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
     - **(n9, Q4: no save from the previous epoch):**
       - `run(6_000)` (one save; the cursor is `C`);
       - `producer.setHold(true)`, then `hardSelect` word 250 with a cfi while playing. That is the click's own save, `("doc-1", 250, <its cfi>)`, and a new epoch `E + 1`;
       - `pause()` before any unit of the new epoch sounds. The pause's read is `null` (the restart dropped every chunk), `heardWord` was cleared at the restart, and `C`, heard in epoch `E`, never saves: there is no pause save. The last save is still the click's.
       - Guard row: green on `<base>`.
     - **(n10, an F4 pause saves the last timed word):** `run(6_000)`; `producer.nextControl("missing-table")` for the next request; `run` until the notice is "timing-missing" and `playing` is false. There is exactly one more save, of the last cursor word (`heardWord`: the engine raised the pause after the scheduled audio played out, so no read is at the sample; R6), with `null`. **RED.**
     - **(n11, Q2: the re-save after a pending relocate save):** `run(6_000)`; `onRelocate` while the cursor is on `W1`; `run(600)` (the cursor is on `W1 + 3`); pause. There is exactly one pause save of `W1 + 3`, and exactly one more save of it with `null` 1,401 ms later, and none after. **RED** (no save).
     - **(n12, Q1: mode exit while playing):** `run(7_000)` (one save), then the router's own exit sequence: `broker.invalidate(key)` and `broker.teardown(key, () => { runtime.stop("mode-switch"); runtime.destroy(); })` (`useReaderModeOrchestrator.ts:303-307`). There is exactly one more save, of the cursor word, accepted (no `port-rejected` diagnostic names a `persistence.` method). **RED.** (The Q1 (C) branch of the first draft is dropped: Q1 was ruled (B).)
     - **(n13, Q5: the window is hidden while playing):** a helper `runHidden(ms)` is `run(ms)` without `runtime.tick()`: frames are stubbed off. `vi.spyOn(document, "visibilityState", "get")` returns `"hidden"` for its span.
       - Play, `run(1_000)` (visible, so the epoch's first word is published), then `runHidden(6_000)`.
       - There is exactly one timed save in the hidden span, at 5,000 ms after Play.
       - Its word is the word at the current sample, `wordAtPlaybackSample().word` at that instant: a single `runtime.tick()` at the same fake instant, with no time advanced, publishes a `highlightedWordIndex` equal to it. It is ahead of the cursor published before the window hid. No `runtime.tick()` ran in the hidden span (the timer does not tick, STOP-Q5a option (b) rejected).
       - **RED** (no save).
     - **(n14, Q5: no save ever names a word ahead of the sample):** n1's lagging output (0.3 s, LL-173). A spy on the fake's `persistence.updateDocProgress` records `output.playbackPosition()` at each save.
       - `run(6_000)`, `runHidden(6_000)`, `run(3_000)`, `pause()`, `togglePlay()` (resume), `run(2_000)`, then n12's exit sequence.
       - There are at least four saves. Each saved word is at or behind the table word at its recorded position, computed from the fake producer's 200 ms-per-word tables and the chunk's start.
       - **RED** (fewer than four saves).
     - **(n15, Q1 condition: nothing saves after teardown):**
       - (a) `run(6_000)`, `onRelocate` while the cursor is on `W1`, `run(600)`, `pause()` (design 10's re-save is armed), then n12's exit sequence at once. Advance 30,000 ms of fake time and of the output. Then call the old runtime's private `onEngineCursor(W1 + 10)` through a cast, and `runtime.tick()`. No `persistence.*` call is accepted or rejected after the teardown: `broker.stats.rejected` has no `persistence.` key, and the effect count is unchanged.
       - (b) The same while playing: `run(7_000)`, then the exit sequence (one exit save inside it), then 30,000 ms: nothing more. The save timer, armed at Play, never fires after `stop()`.
       - Guard row: green on `<base>`, where nothing saves. After the change it fails if the save timer or the re-save outlives `stop()`.
     - **(n16, Q2: the pause word is the final stored word):** n11's steps, with the count's fold also applying each recorded `scheduleRelocateSave({ wordIndex, cfi })` to the stored doc `FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS` after it is recorded. That is a test-local model of the shell's debounced writer (`ReaderContainer.tsx:323-337`); a newer schedule replaces a pending one (`:331`). 3,000 ms after the pause, the stored position is `W1 + 3` with no `cfi`. **RED** (the stored position is `W1`).
     - **(n17, no save on unmount):** `run(7_000)` (one save), then the router's unmount order with no release window: `broker.closeAll()`, then `runtime.destroy()` (`useReaderModeOrchestrator.ts:325-326`). No `persistence.*` call is made: none is accepted, `broker.stats.rejected` has no `persistence.` key, and no `port-rejected` diagnostic names one. Guard row: green on `<base>`.
     - **(n18, Q4: no timed save before the restarted audio's first word):**
       - `run(6_000)` (one timed save), `producer.setHold(true)`, then `hardSelect` word 250 with a cfi while playing (the click's own save);
       - `run(7_000)`: no save besides the click's, though the save timer fired once in that span;
       - `producer.setHold(false)` and `run` until the first word of the new epoch is published. The next timed save names a word at or after 250, from the new epoch (its read's `epoch` equals the restart's), and the 5,000 ms cadence holds from the restart.
       - **RED** (no timed save on `<base>`).
     - **(n19, the close row: the close save keeps the last timed save):**
       - **The close path**, composed test-locally as the shell runs it: `router.exitToPage()` (the first Escape, `ReaderContainer.tsx:627-629`), then the second Escape in Page: `checkBacktrack(a, total, true)` and, when it returns `false`, `finishReading(a)` from `renderHook(() => useProgressTracker({...}))`, where `a` is `router.getSnapshot().currentWordIndex` (`ReaderContainer.tsx:437`, `:615`, `:625-626`). `window.electronAPI.updateDocProgress` is the stub pattern of `tests/useProgressTracker.test.ts`, and its calls are folded into the stored doc with the rest.
       - This row runs over the real router (`createReaderModeRouter` over this file's own `createReaderPorts(fake.infra)`), whose `modules` option takes `{ page: pageMode, narrate: { ...narrateMode, createRuntime: (input) => createNarrateRuntime(input, { producer, createOutput }) } }`, the module-map pattern of `tests/readerModes/bandAlign2.test.tsx:71-72` and `createNarrateRuntime(input, deps)` (`narrate/ModeRuntime.ts:936`). The book opens at word 20 through `router.openDocument`, then `router.select("narrate")`.
       - Play, `run(12_000)`, so a timed save writes `W`. Then the close path.
       - The stored position is not older than `W` (`>= W`).
       - **RED** on `<base>` (no timed save, so there is no `W`). Green after Wave A. It is a regression row for CPC-1 Wave C step 6 (STOP-CLOSE ruled (A)). At `14ce3d24` the close save writes Narrate's `publishedWordIndex`, the word 20. On this item's `<base>`, Narrate's `exportHandoff("persistent")` already hands Page Narrate's `canonicalWordIndex`, the last published cursor (`narrate/ModeRuntime.ts:422` at `14ce3d24`, as CPC-1 changed it), which is at or after `W`. If it is still RED after Wave A because the close wrote an older word, CPC-1 Wave C step 6 has not merged or has regressed: STOP to Blurby.Brain1.
       - The close's word can trail this item's exit save by the unit sounding since the last frame. The router exports before it stops Narrate (`useReaderModeOrchestrator.ts:302-307`), and the exit save reads the sample. The row asserts `>= W` only.
     - **(n20, the stop records a paused intent; Narrate's C3):** `run(6_000)` (one timed save), `pause()` (one pause save), then `hardSelect` word X (any word the paused engine is not on) with a cfi: the click's own save `("doc-1", X, <its cfi>)`. Then n12's exit sequence. The folded doc's position is X, and the last `updateDocProgress` is the click's: the stop made no save. Guard row: green on `<base>`, where the click's save is the last write. After the change it fails if the stop saves the sample or the paused word.
     - **(n21, Q4 while hidden: a restart then a hidden window):** `run(6_000)` (one timed save), `producer.setHold(true)`, `hardSelect` word 250 while playing (the click's save), `producer.setHold(false)`, then `runHidden(12_000)` with no `runtime.tick()`. There is a timed save of a word at or after 250 in the hidden span: the epoch was matched by the timer's own read, with no published cursor. **RED** (no timed save on `<base>`).
     - **(n22, a pause while hidden saves the paused sample, not the painted word):** Play, `run(1_000)`, `runHidden(8_000)` (one timed save at 5,000 ms after Play), then `pause()` with no tick. The pause save's word is the table word at the paused sample, computed from the fake producer's 200 ms-per-word tables and the chunk's start. It is ahead of `getSnapshot().highlightedWordIndex` (the word painted before the window hid) and ahead of the timed save. **RED** (no pause save on `<base>`).
     - **(n23, Q4: a speed change in silence, then a pause, makes no save):**
       - **(a)** `run(6_000)` (one timed save), `producer.setHold(true)`, and `run` until the scheduled audio has played out, before the timer's next tick (the row asserts the timed-save count is still one): a gap, with the engine still `playing` and the published cursor `C` held (R6). Then `setSpeed(1.25)`, which moves the epoch (`narrateEngine.ts:279`) and drops the unplayed chunks, then `pause()`. There is no pause save: the pause's read is `null` (the gap), and `heardWord` was heard at the old epoch. Guard row: green on `<base>` (no pause save exists). After the change it fails if the pause saves `C` without the `heardEpoch` check.
       - **(b) control:** the same with no `setSpeed`. There is one pause save, of `C` with `null`: silence holds the last word at the current epoch. **RED** (no pause save on `<base>`).

     **The engine contract** (STOP-Q5a ruling), in `tests/narrate/narrate.wordAtSample.test.ts`. The name follows the engine tests' `narrate.<topic>.test.ts` pattern (`narrate.engine.test.ts`, `narrate.gapPause.test.ts`, `narrate.pauseCancel.test.ts`). Setup copies the `harness()` and `run()` pattern of `tests/narrate/narrate.engine.test.ts:15-38` (copied, not imported or edited): `new NarrateEngine({...})` over `FakeProducer` and `FakeAudioOutput`, with `onCursor`, `onState`, `onFailure`, `onComplete`, `onDiagnostic` and `onTrace` each recorded into an array. Existing engine tests read no private field; this file reads `lastTickPerf` and `lastPublished` through one test-local read-only cast, and also checks them through the trace.
     - **(ws1, no side effects):** play, `run(1.5)` so a unit is sounding. Take `before`: `getSnapshot()`, the cast's `lastTickPerf` and `lastPublished`, and the length of every event array. Call `wordAtPlaybackSample()` three times with no time advanced. Take `after`. `after` deep-equals `before`. Then advance one frame and `tick()`: the `narrate-commit` records that tick makes equal those of a twin harness run the same way without the three calls, field by field, with `performance.now` stubbed to the same sequence in both. **RED** (the method is missing).
     - **(ws2, the same word as `tick()`):** play, `run(1.5)`, then advance the fake output by part of a unit with no tick. `wordAtPlaybackSample()` returns `{ word: w, epoch: e }`. The next `tick()` at that same sample publishes `w` as its last `onCursor` word, and `e` equals `getSnapshot().epoch`. Repeat at five samples across a chunk boundary. **RED**.
     - **(ws3, the null cases):**
       - before the first chunk is scheduled (`hold: true`, play, no release): `null`;
       - in leading silence: release, then advance the output to a sample before the first unit's `sampleStart` (`pos.unit < 0`): `null`;
       - during an epoch switch: after `run(1.5)`, `play(30)` with the producer held. The epoch is one higher, and the read is `null` until the new chunk is released and scheduled. The first non-null read then has the new epoch;
       - after `pause()` and after `stop()`: `null`.
       - **RED**.
     - **(ws4, composed only of the lookup):** the file reads `src/reader/modes/narrate/engine/narrateEngine.ts` as text, cuts out the `wordAtPlaybackSample` method body, and checks that it calls `this.position(`, `this.wordAt(` and `this.output.playbackPosition()`, and nothing among `publish(`, `commitUnit(`, `pump(`, `fill(`, `tick(`, `this.events.`, `setState(` or an assignment to a `this.` field. **RED** (no method on `<base>`).
     - **Existing rows unedited (standing rule 50):** every existing engine test runs unedited (Done-when 3 and 7).
  2. **Wave A as specified.** Then:
     - `git grep -c -F 'RSVP_PROGRESS_SAVE_INTERVAL_MS' -- src/reader/modes/narrate/ModeRuntime.ts` exits 0. It exits 1 on `<base>`.
     - `git grep -n -F 'updateDocProgress(this.document.documentId' -- src/reader/modes/narrate/ModeRuntime.ts` exits 0. It exits 1 on `<base>`.
     - `git grep -n -E '\b5000\b|5_000|\b2000\b' -- src/reader/modes/narrate/ModeRuntime.ts` exits 1 (no literal interval or debounce).
     - `git grep -n -E 'reason !== "teardown"' -- src/reader/modes/narrate/ModeRuntime.ts` exits 0. It exits 1 on `<base>`.
     - `git grep -c -F 'armSaveTimer' -- src/reader/modes/narrate/ModeRuntime.ts` exits 0. It exits 1 on `<base>`.
     - `git grep -c -F 'wordAtPlaybackSample' -- src/reader/modes/narrate/engine/narrateEngine.ts src/reader/modes/narrate/ModeRuntime.ts` exits 0, with both paths listed. It exits 1 on `<base>`.
     - `git grep -c -F 'heardEpoch' -- src/reader/modes/narrate/ModeRuntime.ts` exits 0. It exits 1 on `<base>` (Q4).
     - `git grep -c -F 'publishedWordIndex: s.canonicalWordIndex,' -- src/reader/modes/narrate/ModeRuntime.ts` prints 1 and exits 0, on `<base>` and on the tip: CPC-1 Wave C step 6's export line is kept, and this item makes no `exportHandoff` edit.
     - `git grep -n -E '\.tick\(' -- src/reader/modes/narrate/ModeRuntime.ts` prints only the runtime's existing forward to `engine.tick()` (`:638-641` at `14ce3d24`): the timer never ticks (STOP-Q5a option (b) rejected).
     - `git diff --name-status <base> -- src/reader/modes/narrate/engine` prints exactly `M src/reader/modes/narrate/engine/narrateEngine.ts` and exits 0.
     - `git diff --numstat <base> -- src/reader/modes/narrate/engine/narrateEngine.ts` prints `0` deleted lines: the method is added and no engine line is changed.
     - `git diff --name-status <base> -- src/constants.ts src/components src/types.ts src/utils src/reader/ports src/reader/modes/page src/reader/modes/focus src/reader/modes/flow main preload.js` prints nothing and exits 0.
  3. **Tests.**
     - `npx vitest run tests/narrate/narrate.saveAsYouGo.test.ts tests/narrate/narrate.wordAtSample.test.ts` exits 0.
     - `npx vitest run tests/narrate tests/readerModes tests/readerModeIsolation.test.ts tests/readerModeBoundaries.test.ts tests/keepFurthest.test.tsx tests/persistentReadingAnchor.test.ts tests/useProgressTracker.test.ts` exits 0.
     - These stay green and unedited:
       - `tests/narrate/narrate.structural.test.ts` (the estimator scan; it scans the engine too);
       - every existing engine test (standing rule 50): `tests/narrate/narrate.engine.test.ts`, `narrate.crossings.test.ts`, `narrate.negativeControls.test.ts`, `narrate.recordedOutput.test.ts`, `narrate.startStack.test.ts` and `narrate.trace.test.ts` (with `narrate.gapPause.test.ts` and `narrate.pauseCancel.test.ts` below, these are the files on `14ce3d24` that import `narrateEngine`);
       - `tests/narrate/narrate.playSavedPosition.test.ts` (NARRATE-ARRIVAL-SYNC-1);
       - `tests/narrate/narrate.pauseCancel.test.ts` and `tests/narrate/narrate.gapPause.test.ts`;
       - CPC-1's `tests/readerModes/cfiPositionConsistency.test.ts` (rows o3a and o3b);
       - `tests/chapterStep.test.ts`, and CHAPTER-STEP-CFI-1's `tests/readerModes/chapterStepLanding.test.ts` if it has merged (it is not on `14ce3d24`);
       - `tests/readerModeIsolation.test.ts`, as CPC-1 Wave C step 4 left it.
     - `tests/keepFurthest.test.tsx` stays green and unedited, or STOP to Blurby.Brain1 (G6).
  4. `npm test`, `npm run typecheck` and `npm run build` exit 0 on RodneySr (standing rules 47 and 48). Record the counts.
  5. **Packaged probes**, on RodneySr x64 `--dir` packages of `<base>` and the tip, with one recipe (LL-152):
     - Launch each with `--user-data-dir=<scratch>` and `BLURBY_USER_DATA_DIR=<scratch>`. Prove `app.getPath('userData')` over the inspector before the first input, and refuse an inspector port that already answers (LL-165). Hash the live profile's `library.json` and `settings.json` before and after: unchanged.
     - Keep the window shown and focused for P1–P3. P4 hides it on purpose (Q5), and records `document.visibilityState` over the inspector so a span that was not really hidden is refused (standing rule 45).
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
         - The tip: after the pause, the hook saw one save of the paused word (the word at the paused sample; with the window shown it is the last sampled cursor word or the next one) with `null`, plus at most one re-save of the same word within 2,100 ms (design 10), and nothing else. The stored position is that word with no cfi.
         - Then Narrate and Play: the first request word is the first word of the stored word's sentence, computed with `sentenceStartAt`'s rule over the extracted words (record both indices).
         - `<base>`: recorded.
       - **(P3, browse away while speaking):** open at 8723, Narrate, Play for 6 s, then turn two pages forward with native mouse-wheel events in the book's frame and keep listening for 8 s, then kill and reopen.
         - The tip: Narrate kept speaking; the saves after the browse carry cursor words, each equal to a sampled cursor word, with `null`. The stored position is not on the browsed pages (record the first visible word at the kill).
         - `<base>`: recorded.
       - **(P4, minimized while speaking, Q5):** open at 8723, Narrate, Play at 1.00x for 5 s. Minimize the window over the main-process inspector (`BrowserWindow.getAllWindows()[0].minimize()`) for 20 s, with `document.visibilityState` sampled as `"hidden"` throughout. Restore it, sample the cursor word within 250 ms (the first frames publish the word at the sample), then kill and reopen.
         - The tip: while minimized, the hook saw a save with a `null` cfi about every 5 s (at most 6 s apart; the span is under 5 minutes). Their words rise. The stored position is at or behind the cursor word sampled on restore, by at most 19 words, or 25 if a cfi is present. The reopen's first shown range contains it.
         - `<base>`: the control, recorded; no save while minimized.
  6. **Rule 53 pair:**
     - on RodneySr, the tip's x64 `--dir` package with `origin/main` merged in;
     - on Rodney, an `--arm64 --dir` package of the same commit and a 25 s native-arm64 scratch-profile launch with no error or crash;
     - `npx asar list` checked against `dist/` on both;
     - P1–P4 re-run on the packaged exe;
     - a "Package verification" section in the close-out;
     - Blurby.Brain1's confirmation before the merge go.
  7. **Fence (standing rule 41).** `git diff --name-status <base>` lists exactly the following, plus `docs/studies/investigations/NARRATE-SAVE-AS-YOU-GO-1.*`, the governance staging memo and the time log:
     - `M src/reader/modes/narrate/ModeRuntime.ts`
     - `M src/reader/modes/narrate/engine/narrateEngine.ts` (the one method, STOP-Q5a ruling)
     - `A tests/narrate/narrate.saveAsYouGo.test.ts`
     - `A tests/narrate/narrate.wordAtSample.test.ts`

     Nothing in `tests/readerModeIsolation.test.ts` or any existing `tests/narrate/` file, and otherwise nothing in `src/reader/ports/`, `src/components/ReaderContainer.tsx`, `src/types.ts`, `src/utils/FlowScrollEngine.ts`, `src/constants.ts`, `src/hooks/`, `src/reader/useReaderModeOrchestrator.ts`, Narrate's engine beyond that method, view, bindings, surface or helpers, any other mode, `main/` or `preload.js`.
  8. **Merge-tree check:** `git merge-tree` of the tip against `origin/main` is clean at the merge go. A conflict in a fenced file goes to Blurby.Roadmap before resolution.
  9. **Owner, added to release gate (2)'s list:** listen in Narrate for a while, then close the app any way at all: the book reopens within a few seconds' listening of the spoken word. Do the same with the window minimized while listening. Pause Narrate and reopen: Play starts at the start of the paused sentence.
- **Effort:** M, in two waves (A: red rows, the change and the tests; B: package, probes and close-out), each about 35 tool uses and its own dispatch. Technical effort: medium.
- **Owners:**
  - Blurby.Brain1 ruled Q1–Q5, STOP-Q5a and STOP-CLOSE-narrate (option (A)); it coordinates and confirms the package (rule 53);
  - RodneySr implements, tests and probes; Rodney runs the arm64 launch;
  - spec-compliance review, then quality review;
  - Blurby.Roadmap gives the merge go and closes it out.
- **Merge order:**
  - after CFI-POSITION-CONSISTENCY-1 (Seq 97.5) and FLOW-SAVE-AS-YOU-GO-1 (Seq 97.6), in Seq order on the single executor, RodneySr.
  - This item edits `narrate/ModeRuntime.ts` after CPC-1 Wave C changed its `exportHandoff` line (`:422` at `14ce3d24`). It re-greps that line at the cut and leaves it as CPC-1 left it.
  - Later items that edit `narrate/ModeRuntime.ts` re-grep `saveProgressWord`, `noteHeard`, `freshHeard`, `noteRestart`, `intentWord` and `armSaveTimer`, and keep their calls in `onEngineCursor`, `onEngineState`, `pause` (the read before `engine.pause()`), `stop` (the read at the top; the save after `clearTimers()` and the engine stop, not on `"teardown"`), `start`, `resume`, `setSpeed`, `applySettings`, `commitShared` and after every engine restart. Later items that edit `narrateEngine.ts` keep `wordAtPlaybackSample()` read-only and composed only of `position()` and `wordAt()`. The items: FOCUS-PAUSED-HANDOFF-1 (Seq 118), NARRATE-SELECTION-START-1 (Seq 124), EINK-VIEW-REFRESH-1 (Seq 130), EINK-NARRATE-VIEWPORT-1 (Seq 130.5), and NARRATE-PAUSED-CLICK-1's post-RC amendment if it has not merged.
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

##### Blurby.Brain1 rulings on Q1–Q5 (2026-11-03, binding)
- **Q1, accepted with one condition (option B, made once in CPC-1 Wave C).** CPC-1 Wave C adds `persistence.updateDocProgress` and `persistence.updateProgress` to `READER_PORT_RELEASE_CALLS` (`src/reader/ports/createReaderPorts.ts:46-49`) for all three playback modes, with the pinned rows of `tests/readerModeIsolation.test.ts` under a named rule-50 exception. Narrate makes no broker edit.
  - **Condition:** the exit save is made synchronously inside `stop()`, during `broker.teardown`, after every save timer has been cleared. Nothing asynchronous may save after release.
  - **Broker check:** the release allowance ends with the teardown frame (`createReaderPorts.ts:189-200`, `:109-110`). No STOP.
  - **Applied in:** designs 3 and 14; Wave A step 9; rows n12, n15 (a timed-save callback after teardown makes no persistence call) and n17 (unmount); Done-when 2, 3 and 7.
- **Q2, accepted.** Narrate re-saves after a pending relocate save lands, only if that save's word differs from the pause word. Applied in design 10, Wave A step 3, and rows n11 and n16 (pause while a relocate save is pending, let it land, and the final stored word is the pause word).
- **Q3, accepted.** The guard checks the word space the running engine started on, and saves only if that start used the map's words. An engine that started on fallback words never saves, even after the map arrives, until it restarts on the map. Applied in design 8, Wave A step 4 and row n8 (b).
- **Q4, accepted.** On each restart, reset the last-saved marker and make no timed save until the restarted audio's first published word. Applied in design 2 (`lastSavedWord` kept, with the reason), Wave A steps 4–6 and 12, and rows n9 and n18. Its mechanism was tightened by the STOP-Q5a rulings: the epoch of a sample read, not the first published word, marks the restart as sounded.
- **Q5, overruled. Listening with the window hidden or minimized is a main use of Narrate.**
  - The timed save runs from a timer (`setTimeout` or `setInterval`), not from animation frames.
  - At each tick it reads the word at the current playback sample, through the same exact word-table lookup the frame path uses, not the last painted word.
  - Chromium throttles timers on hidden pages to about once a minute after 5 minutes hidden. That is acceptable, and the bound is stated under "Crash window".
  - **The engine has no frame-independent "word at the current sample" query (Why), so the read was STOP-Q5a, ruled (a) below.** The timer itself, the throttling bound and rows n13 and n14 are folded in: design 15, Wave A step 12, Crash window and probe P4.
- **Worst-case losses stand:** 17 words, or 22 if a relocate save landed last, with the window shown (Crash window).

##### Blurby.Brain1 rulings on STOP-Q5a and the close row (2026-11-03, binding)
- **STOP-Q5a is ruled (a): one public read-only engine method.** `wordAtPlaybackSample(): { word: number; epoch: number } | null` in `src/reader/modes/narrate/engine/narrateEngine.ts`. It adds one file to the fence.
  - It is composed only of the private `position(t)` (`:500-509`) and `wordAt()` (`:512-515`), at `this.output.playbackPosition()`.
  - It returns `null` when no unit is playing, during leading silence, and during an epoch switch.
  - Rule #31 holds: it reads the same exact word table at the same sample as the frame path (`tick()`, `:333-348`).
  - **Applied in:** design 16; Wave A step 13; the Out of scope, Done-when 2 and fence lines; rows ws1–ws4 in `tests/narrate/narrate.wordAtSample.test.ts`.
- **Option (b), ticking from a timer, is rejected** and must not be used. Applied in design 15 and the Done-when 2 `.tick(` gate.
- **The engine contract rows,** each a row in the new engine test file `tests/narrate/narrate.wordAtSample.test.ts`:
  - no side effects: `getSnapshot()`, `lastTickPerf`, the trace and every publish counter are unchanged, compared deep-equal before and after (ws1);
  - the same word as `tick()` at a fixed fake sample (ws2);
  - `null` in leading silence and during an epoch switch (ws3);
  - existing engine rows run unedited (standing rule 50), and no other engine line changes (ws4; Done-when 2, 3 and 7).
- **The timed save** reads `wordAtPlaybackSample()` at each timer tick, not the last published cursor. Applied in designs 1 and 15, Wave A step 12, rows n13, n14 and n21.
- **Narrate's pause save** reads the sample: the paused sample. The runtime reads it just before `engine.pause()`, which cancels the sources (Why). Applied in design 1, Wave A step 8, rows n2 and n22. An F4 pause, which the engine raises after its scheduled audio has played out, has no sample to read and saves the last word heard (R6; row n10). That is the planner's reading of the ruling for the one pause the runtime does not start.
- **Narrate's stop save** records the committed word if a user intent (click, keys, navigation) committed one after the pause: Narrate's version of CPC-1's C3. Otherwise it reads the sample. Applied in design 1, Wave A steps 9 and 11, row n20 (pause, click X, stop: the stored word is X).
- **Q4.** After a restart, the first save-eligible read is the first non-null read whose `epoch` equals the restart's epoch. A read from the previous epoch never saves. It replaces the earlier "first published word" mechanism. Applied in design 2, Wave A steps 4–7 and 12, rows n9, n18 and n21; its held-word half (`heardEpoch`) is restated exactly in the STOP-CLOSE ruling section below, with row n23.
  - The restart's epoch is read after each runtime `.play(`. Until the restart has sounded, it is read again after the runtime's own `engine.resume()` and `engine.setSpeed(`, which move the epoch without a restart (`narrateEngine.ts:238`, `:251`, `:279`). Without that, a speed change before the first word would block every save until the next restart.
- **Unmount-skip is confirmed.** On stop reason `"teardown"`, Narrate skips the exit save and makes no call the broker would reject (design 14, row n17). The close row is added as n19:
  - play about 12 s so a timed save writes W, then close the reader by the normal close path; the stored word is not older than W.
  - **The investigation found it fails** (Why, "The reader's close save does not follow the spoken word"). Per the ruling, no fix is designed here; STOP-CLOSE-narrate below goes to Blurby.Brain1, and this spec stays not dispatch-ready. (Ruled (A) on 2026-11-03; see the next section.)
- **Bounds.** Hidden window: 19 (25) words for the first 5 minutes, then 169 (174) under Chromium throttling. Already present under "Crash window"; confirmed to match.

##### Blurby.Brain1 ruling on STOP-CLOSE and owner ruling O6 (2026-11-03, binding)
Source: `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.ESCAPE-LANDS-AT-PLAYBACK-1.2026-11-03.md`.
- **Owner ruling O6, "Where I stopped".** You start Narrate at word 100, listen to 500 and press Escape. Page shows 500's page, and the book reopens there.
- **Blurby.Brain1, option (A).** Each playback mode's `exportHandoff("persistent")` reports its committed playback word as `publishedWordIndex`, mode-local, with no router, orchestrator or shared-core edit. For Narrate that is the exact engine cursor word. "Committed" is the latest of the playback word and any user-intent commit since then, so a click while paused wins. (B) and (C) are rejected.
- **Narrate hands over the word itself.** The sentence-start rule (owner ruling O3, NARRATE-SENTENCE-RESUME-1) applies when playback restarts, not on the Page landing. This item's pause save is unchanged by it: it records the word, and the next Play starts at that word's sentence start.
- **Placement:** CPC-1 Wave C step 6 makes the change, in Narrate's own commit: `:422` at `14ce3d24` reports `s.canonicalWordIndex` for `"persistent"`. `onEngineCursor` writes that field with each published cursor (`:732`), and `commitShared` writes it on a click (`:899-903`). CPC-1 rows f24–f29 pin it, including f29: an Escape during leading silence or an epoch switch hands over the last published cursor, never a word ahead of the sample.
- **In this item:** no `exportHandoff` edit. Row n19 stays as a regression row (Done-when 1). Done-when 2 checks that CPC-1's line is kept.
- **F4, stated exactly:** if the engine pauses after its audio drains, the pause save records the last heard word, the last published cursor (R6). Applied in design 1 (F4), Wave A step 8 and row n10.
- **Q4, stated exactly:** the runtime re-reads the epoch after its own resume() and setSpeed() until the restarted audio has sounded. A read whose epoch predates the latest restart, resume or speed change never saves. Applied in design 2 (`heardEpoch`, `freshHeard()`), Wave A steps 2, 5, 8, 9 and 12, and rows n9, n18, n21 and n23.
- **Not covered by (A), and not a STOP for this item:**
  - CPC-1's STOP-LAND-focus and STOP-PAGE-BUTTON were ruled (a) on 2026-11-03 and land in CPC-1 Wave C steps 6 and 7, which merge before this item: the bottom bar's Page button hands over the same cursor word, and Page's view jumps to the handed-over word on arrival. Narrate's view already follows the spoken word (`followSpokenSection`, `narrate/ModeRuntime.ts:738`), so the jump rarely moves it.
  - **For Findings (planner's note):** an F4 pause while the window is hidden leaves the published cursor where it was painted before the window hid, since a paused engine publishes nothing (`tick`, `narrateEngine.ts:333-336`). When the reader then shows the window and closes with Escape twice, the hand-off and the close save carry that older painted word, behind this item's timed and pause saves. Brain1's (A) names the engine cursor for the hand-off, so this item does not change it. Its reach is a failed passage while minimized.

##### STOP-CLOSE-narrate (ruled (A) 2026-11-03; kept as the record)
- **Question.** On the normal close path (Escape twice), the close save writes Narrate's `publishedWordIndex`, which the spoken cursor never moves. After a timed save of W, the close overwrites W with the word Narrate was entered at, or the last click or navigation. How should the close save treat a session that left a playback mode? Row n19 cannot pass until this is ruled. The planner designs no fix here, per Brain1's instruction.
- **The lines** (all at `14ce3d24`):
  - `src/components/ReaderContainer.tsx:437`: `const canonicalWordAnchor = toolbar?.currentWordIndex ?? (activeDoc.position || 0);`
  - `src/reader/useReaderModeOrchestrator.ts:258` (the router snapshot): `currentWordIndex: s.publishedWordIndex,`
  - `ReaderContainer.tsx:614-630`, `handleExitReader`: `const exitAnchor = canonicalWordAnchor;` … `if (readingMode === "page") { … if (checkBacktrack(exitAnchor, totalWords, useFoliate)) return; finishReading(exitAnchor); } else { handleExitToPage(); }`
  - `useReaderModeOrchestrator.ts:354-357`, `exitToPage`: `transition("page", "silent", "persistent", "user-stop", (h) => ({ ...h, highlightedWordIndex: h.publishedWordIndex }));`
  - `src/reader/modes/narrate/ModeRuntime.ts:414-430`, `exportHandoff`: `publishedWordIndex: s.publishedWordIndex,`; `src/reader/modes/page/ModeState.ts:33`: `this.publishedWordIndex = handoff.publishedWordIndex;`
  - `narrate/ModeRuntime.ts:732`, `onEngineCursor`: `this.anchor.commitPersistentWordIndex(word, "mode-advance", { persist: false, publishState: false, navigate: false, syncVisual: false });`
  - `narrate/helpers/usePersistentReadingAnchor.ts:85-88`: `const shouldPublishState = options.publishState ?? cause !== "mode-advance"; if (shouldPublishState) { state.publishedWordIndex = clamped; }`
  - `src/hooks/useProgressTracker.ts:296-299` and `:243-259`: `finishReading` → `_persistAndLog(finalPos)` → `onUpdateProgress(activeDoc.id, savePos, cfi); api.updateDocProgress(activeDoc.id, savePos, cfi);`
  - `main/ipc/documents.js:22-23`: `if (hasPosition) doc.position = position;` (no forward-only check).
- **What else it touches:**
  - The same path writes Focus's and Flow's pre-play word (STOP-CLOSE-focus in CFI-POSITION-CONSISTENCY-1, STOP-CLOSE-flow in FLOW-SAVE-AS-YOU-GO-1), so one ruling may serve all three.
  - Page's arrival seeds its resume anchor from the handed-over highlight, which `exitToPage` sets to the published word (`page/ModeState.ts:40`). So Page's own relocate saves stay suppressed after the exit.
  - `tests/readerModeIsolation.test.ts:348` pins "exitToPage hands off the published word as the highlight". `src/components/ReaderContainer.tsx` is shared core.
  - The backtrack prompt catches the overwrite only when the published word trails the furthest mark by about two pages (`useProgressTracker.ts:308-324`, `APPROX_WORDS_PER_PAGE = 250`).

##### Questions for Blurby.Brain1 (ruled 2026-11-03; kept as the record)
- **STOP-Q5a. No word-at-sample query exists (ruled (a) on 2026-11-03; see the STOP-Q5a rulings above).** Q5's ruling needs the timer to read the word at the current playback sample through the frame path's lookup. At `14ce3d24` the engine exposes no such query.
  - **The lines checked:**
    - `narrateEngine.ts:195-197`, `getSnapshot()` returns `cursor`, the last word `tick()` published: the last painted word.
    - `:333-348`, `tick()` ("Publish the cursor for the current playback sample. Called once per display frame by the binding."). It is the only public path from `output.playbackPosition()` (`:337`) to a table word (`position`, `:341`; `commitUnit`, `:346`). It is not a query: it publishes through `onCursor` (`:548-553`), which drives the runtime's highlight, section follow and trace (`narrate/ModeRuntime.ts:722-743`). It also sets the trace's frame interval (`:338-340`), and it publishes every unit sounded since the last publish (D5, `:344-347`).
    - `:500-509` `position()` and `:512-515` `wordAt()` are `private`.
    - `:316-331`, `pump()` reads the sample but returns no word.
    - `narrate/ModeRuntime.ts:638-641`, the runtime's `tick` only forwards to `engine.tick()`. `narrate/useModeBindings.ts:33-41`: the frame path is `requestAnimationFrame(frame)` calling `runtime.tick()`, with `pump` on a 250 ms interval.
  - **Why it is a STOP and not a design here:** any answer changes who reads or publishes the cursor, which is owner ruling #31's domain (the cursor is the word at the current playback sample, from an exact word table, with no estimated timing). The two shapes in view are:
    - the timer calls the existing `tick()`, which publishes the cursor from a timer as well as from frames;
    - or the engine gains a public, side-effect-free read of the word at the sample, which is an engine edit outside this item's fence.

    The planner makes no recommendation between them; this belongs to Blurby.Brain1.
  - **Points the ruling needs to settle with it:**
    1. which call the timer makes, with its file:line;
    2. how the timer tells that the current epoch has sounded (Q4). Wave A step 12 gates on `cursorWord != null`. That holds only if the timer's read also publishes; otherwise a reader who restarts and then hides the window gets no timed save until the window is shown again;
    3. whether the pause and stop saves (Wave A steps 8 and 9) also read the word at the sample. While hidden, `cursorWord` can be minutes old, so a pause while minimized (a media key) would write a word behind the last timed save.
  - Rows n13, n14 and n18 and probe P4 are written so that either shape can pass them.
- **Q1. The mode-exit save meets the port broker's teardown window (STOP before Wave A).** As in FLOW-SAVE-AS-YOU-GO-1 Q1: the router stops Narrate inside `broker.teardown`, which accepts only `settings.update{isNarrating}` and `diagnostics.*` (`createReaderPorts.ts:46-49`). A `persistence.updateDocProgress` from `stop()` is rejected. **Recommendation: (B)**: one signature rule admitting `persistence.updateDocProgress` with a `null` cfi, and `persistence.updateProgress`, as release-class calls. Make it once, in CPC-1 Wave C, where Focus's row f5 needs it first. (C), no exit save, is the fallback: the handover carries the cursor word, and the last timed save bounds a later kill to one interval.
- **Q2. A pending relocate save can overwrite a newer pause save.** Narrate's view turns pages to follow the spoken word, and each turn schedules a relocate save of the word at that turn, written up to 2,000 ms later (`ReaderContainer.tsx:331-336`). A pause within 2 s of a turn is overwritten by an older word and its page's cfi, so the reopen can start a sentence early. **Recommendation:** the same mode-local re-save as FLOW-SAVE-AS-YOU-GO-1 (design 10 here). During play, accept G5's relocate term (at most 22 words at 1.00x).
- **Q3. G4's map guard reads the running engine's words.** `start()` requests the map only after the engine starts (`:341`), and `adoptDocument` does not restart it, so an engine started on the fallback words keeps them. **Recommendation:** save only while the running engine was started on the map (`engineOnBookWords`), which is G4's intent. Row n8 (b) pins it.
- **Q4. The engine's cursor is stale after a restart until the new epoch sounds.** `play()` does not reset `cursor` (`narrateEngine.ts:534-545`). A click while playing, a navigation or a new Play leaves the old word in `cursor` until the first unit of the new epoch is heard. A pause in that gap would save the old word over the click's own save. **Recommendation:** design 2: clear the runtime's `cursorWord` before every engine restart, and save only a word published since. Row n9 pins it. G1 is unchanged: the saved word is always a published table word.
- **Q5. A hidden window publishes no cursor, so it makes no timed save.** The cursor is published only on animation frames (`useModeBindings.ts:33-41`), and a minimized or hidden window gets none. Narration keeps going through `pump`. A kill after minutes in the background loses everything since the window was hidden. Publishing the cursor from `pump` would change the engine's publication cadence, which this item does not own. **Recommendation:** accept here, keep the probes' window shown, and register a finding for the item that owns Narrate's cursor publication (a timer-driven `tick` while hidden would cover it).

##### Lessons applied
- **LL-029:** the save compares word indices only. No range, offset or page position is read to pick the word.
- **LL-030:** nothing saves before a start has run the engine (row n7).
- **LL-073:** the resume anchor and its relocate suppression are untouched; the timed save reads the word at the sample, not the anchor.
- **LL-108:** Narrate saves its authoritative narration cursor, never visual state.
- **LL-126:** the saved word is the produced-and-heard table word, never the prefetch frontier or a chunk's start.
- **LL-127:** no instrumented twin or scheduling head seeds the saved position. Only the table word at the heard sample does: `wordAtPlaybackSample()`, or `onCursor`'s word for the last word heard (R6). The query is read-only, so it adds no second publisher (row ws1).
- **LL-142:** the base's behaviour is measured on `<base>` (rows and probes) before the fix is trusted. The saved word is a timing-table word, never an estimate.
- **LL-143:** every gate names its shell and an exact exit code, with the base's expected exit beside it.
- **LL-152:** one recipe for the `<base>` and tip probes.
- **LL-159:** a kill skips the quit flush and main's 500 ms timer, and the shell's relocate timer is a deferred writer too. The bound counts both.
- **LL-165:** the scratch profile is proved before the first input, and the live profile's hashes are unchanged.
- **LL-169:** the new timers, design 10's re-save and design 15's save timer, are the runtime's own `setTimer`, cleared by `stop()`. The re-save checks its captured relocate record, and the save timer its token, before writing. The exit save comes after `clearTimers()` (row n15).
- **LL-109:** no continuation saves after release. The exit save is synchronous inside `broker.teardown`, and unmount, which has no window, makes no attempt (rows n15 and n17).
- **LL-014:** the timed save is not driven by React or by display frames. It runs on the runtime's own timer (Q5).
- **Standing rule 45 (promoted from LL-141):** the hidden-window probe records `document.visibilityState`, so a run that was not really hidden is refused (P4).
- **LL-173:** row n1 also runs with an output whose heard position lags the scheduling head, so a save that read the wrong clock would fail.
- **LL-181:** the branch lives under `.worktrees`, and the push uses an explicit lowercase refspec.
- **Standing rule 55:** verdicts come from saves, `library.json`, sampled word indices and request words, not screenshots.
- **Standing rule 53:** package verification, with Blurby.Brain1's confirmation before the merge go.
