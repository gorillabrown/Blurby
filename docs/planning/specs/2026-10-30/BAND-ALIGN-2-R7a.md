#### BAND-ALIGN-2 — The cursor word's line sits in the fixed band: Focus scrolls to it, Flow runs on one clock

*(Amendment block only. Append it to BAND-ALIGN-2's full specification, after the R7 amendment and before R8. The heading above exists so `--item BAND-ALIGN-2` can find this file; the appended text starts at the `#####` line below.)*

##### Mid-Dispatch Amendment — 2026-10-30 (R7a: Flow hands off to the next section under one clock, BUG-235)

**The bug** (`docs/governance/BUG_REPORT.md` BUG-235, HIGH, a regression that blocks BAND-ALIGN-2's merge):
- In Flow on *Meditations*, at NOTES#185 the band switches off, the cursor disappears, and playback never enters section 2.
- Release `36ac7466` crosses into section 2 at sample 15 (AURELIUS#189) and keeps playing.

**Bisect** (Blurby.Brain1, RodneySr job 6; evidence on RodneySr at `C:\Projects\Blurby-artifacts\bug-235-bisect\`):
- **First bad commit:** `860ad3ca`, "BAND-ALIGN-2: Flow runs on one clock (wordClock, syncToWord)". Its last cursor is NOTES#185; it never crosses, and 20 samples have no cursor.
- **Good:** `b8ded60c` and `f96552bd` (`860ad3ca`'s grandparent). Both cross into section 2 at sample 15 (AURELIUS#189).
- `368dcc15`, the parent, adds only a test.
- R7's run shows the same failure: RodneySr `C:\Projects\Blurby-artifacts\band-align-2-r7\live\` (`base-L2*`, `cand-L2text-L5-Flow`; release `rel36-L2-text`).

**Diagnosis** (Blurby.Brain1, technical; red test (h1) must confirm it before any fix):
- Under `wordClock` the line pacer schedules nothing itself. Its section hand-off now fires only inside `FlowScrollEngine.syncToWord`, when `wordIndex > lines[last].lastWord` calls `onComplete`. That runs the runtime's next-section hand-off, `onScrollEngineComplete`.
- `FlowModeRuntime.onEngineWordAdvance` reaches `syncToWord` only after `surface.highlight` succeeds.
- A word past the last rendered line cannot be highlighted, because the next section is not loaded. So `found` is false, `syncToWord` never sees that word, and the hand-off is unreachable.
- The not-found branch (`engine.pause`, `surface.next`, then wait for `onWordsReextracted`) does not recover under one clock. The band goes off, the cursor disappears and playback stops.
- On release `36ac7466` the old line clock handed off on the last rendered word.

**Fix direction** (Blurby.Brain1):
- Under `wordClock`, when `highlight(idx)` fails and `idx` is past the pacer's last rendered line, call `scrollEngine.syncToWord(idx)` so the pacer runs its one-shot `onComplete` hand-off.
- Otherwise call `syncToWord` only after the found check; a not-found word that is not past the end does not reach `syncToWord`.
- The existing not-found pause-and-next path stays, only for genuinely missing mid-section words.
- Keep `860ad3ca`'s `>=` next-section lookup, and test it against the exact cases.

**Based on:** `origin/eb/band-align-2-r7-work` @ `f3f254f30da9c844e4416a988bb9325a160b109f`, fetched 2026-10-30. Blurby.Roadmap settled this base to keep R8's fast-forward plan intact.
- Its code is identical to `a52737045ceaabf4ebd76d13e705df43d4de68d4`, the `origin/eb/band-align-2` tip Brain names: `git diff --quiet a5273704 f3f254f3 -- src tests main` exits 0.
- `origin/main` is now `9a3800e8`.
  - `git merge-tree --write-tree origin/main origin/eb/band-align-2-r7-work` reports **no conflicting file**.
  - `git diff --name-only 80dbe938 origin/main` (R7's last merged `main`) lists only governance documents.
- Every line number below was read at `f3f254f3` with `git show`. Re-grep at dispatch (standing rule 36).

**Sequencing.**
- R7a merges after the existing stack items and before R8. BAND-ALIGN-2 does not merge until BUG-235 is fixed (`ROADMAP.md` card, "MERGE BLOCKED by BUG-235").
- R8 then bases on R7a's pushed tip instead of `f3f254f3`.
- R8 changes Flow's band writer but must keep R7a's hand-off: its red suite runs (h1)–(h6) unchanged.

**Hold confirmed (Blurby.Brain1, B-R7a-1, 2026-10-30):** the word timer is held on the past-the-end word until the section loads, then resumed through `onWordsReextracted`. The hold is internal and is kept apart from the reader's own Pause by a separate `handoffHold` field, never a shared paused bit.

- **What:** under one clock, Flow crosses a section end as the release did.
  - When the word timer reaches a word past the last rendered line of the loaded section, the pacer's one-shot hand-off goes to the next section.
  - The word timer is held on that word (`handoffHold`) until the section has stamped its words. It then resumes exactly on it, with the cursor and band restored and no word skipped or repeated.
  - If the reader presses Pause during the hold, the section load does not resume playback. It stays paused on the held word, and the next Play continues from it.
  - A genuinely missing word inside the rendered range keeps today's pause-and-next path (`pendingResume`).
  - **Out of scope:**
    - a navigation key pressed during the hold (it lasts one section load). The hold is cleared by any user pause, and a navigation key's move is today's path;
    - the release's line-clock path (`wordClock` false), which is unchanged;
    - e-ink page stepping;
    - the band's extent (R8);
    - Focus, Page and Narrate.
- **Why:** the bisect and diagnosis above, read from the code at `f3f254f3`:
  - **`src/reader/modes/flow/ModeRuntime.ts`, `onEngineWordAdvance` (`:1240-1276`):**
    - `:1263` `const found = this.surface.highlight(idx, "flow", { allowMotion: false });`
    - `:1264-1272` the not-found branch: `this.engine?.pause(); s.pendingResume = idx; this.surface.next(); s.notify(); return;`
    - `:1274` `this.scrollEngine?.syncToWord(idx);`, reached only when found.
  - **`src/reader/modes/flow/helpers/FlowScrollEngine.ts`, `syncToWord` (`:405-434`):**
    - `:406` returns unless `running && wordClock && lines.length > 0`;
    - `:407-413` past the last line, call `callbacks.onComplete()` once (`completeSent`, `:132`; reset in `start` at `:187` and in `rebuildLineMap` at `:574`).
  - **The hand-off, `ModeRuntime.onScrollEngineComplete` (`:1322-1344`):**
    - `:1329` `meta?.sections.find((section) => section.startWordIdx >= currentWord)`;
    - then `surface.goToSection` → `waitForSectionReady` → `scrollEngine.rebuildLineMap()`.
  - **The resume, `onWordsReextracted` (`:1063-1090`):** with `s.pendingResume` set, on the next frame (`:1077`) it highlights the pending word; if found it calls `engine.resume()` (`:1079-1081`), else it turns another page (`:1083-1086`).
  - **The reader's pause:**
    - `pausePlayback` (`:1391-1396`) clears `pendingResume` (`:1392`), pauses the word timer, stops the pacer and sets `playing = false`.
    - `togglePlay` (`:751-759`) calls it, or makes a cold restart from the anchor with `start({ cause: "space" })`.
    - `stop` clears `pendingResume` at `:768`.
  - **The word timer** (`FlowMode`, `:107-127`, `:198-233`): `resume()` schedules the *next* word after one dwell (`scheduleNext`), so the word it resumes on is not re-emitted. That is what makes "no repeat" hold.
  - **`ModeState.ts:28-29`** declares `pendingResume: number | null = null`.
- **Prerequisites:**
  - None outstanding. The work is on the held branch.
  - `origin/main` is merged into the R7a base first (rule 53's temporary note, T2: the package is the bytes that will merge).
- **Done when** (run every command in `pwsh` from the worktree root on RodneySr, unless it names another host):
  0. **Base M7a.** The worktree's first commit is M7a, the `--no-ff` merge of `refs/remotes/origin/main` into `f3f254f3`.
     - `git rev-parse HEAD^1` prints `f3f254f30da9c844e4416a988bb9325a160b109f`.
     - `git merge-base --is-ancestor refs/remotes/origin/main HEAD` exits 0.
     - Record in the memo the merge's conflicting files: none at authoring.
  1. **Red first (standing rule 43).** Commit C1 holds only `tests/readerModes/flowSectionHandoff.test.tsx`.
     - `npx vitest run tests/readerModes/flowSectionHandoff.test.tsx` exits **1** on C1.
     - (h1), (h2), (h5) and (h6) fail **by assertion**. (h3), (h4a) and (h4b) are controls and pass.
     - Record the failure output in the memo. It is the confirmation of Brain1's diagnosis: on the tip, word 100 is not found, `surface.next` is called, and `goToSection(1)` never is.
  2. **The change.**
     - `npx vitest run tests/readerModes/flowSectionHandoff.test.tsx` exits 0.
     - `npx vitest run tests/readerModes tests/flow-scroll-engine.test.js tests/flowZoneAuto.test.ts tests/readerModeIsolation.test.ts tests/readerModeOwnership.test.ts` exits 0 with no file in it edited, including `bandAlign2.test.tsx` (f1)–(f4) and (c1), and `flowKeys.test.tsx`.
     - If one of them fails because it asserts the old not-found path for a past-end word, stop and name it (standing rule 50).
  3. `npm test` exits 0 (record the counts). `npm run typecheck` and `npm run build` exit 0 (standing rules 47 and 48).
  4. **Fence (standing rule 41).** `git diff --name-status <M7a> HEAD` lists exactly the paths below, plus `M docs/governance/close-outs/Memo.BAND-ALIGN-2.GovernanceStaging.2026-10-23.md` and `M docs/governance/close-outs/Timing.BAND-ALIGN-2.jsonl`:
     - `M src/reader/modes/flow/ModeRuntime.ts`, `M src/reader/modes/flow/ModeState.ts`, `M src/reader/modes/flow/helpers/FlowScrollEngine.ts`;
     - `A tests/readerModes/flowSectionHandoff.test.tsx`;
     - `M docs/governance/BUG_REPORT.md`, where BUG-235's Status reads "RESOLVED in source (BAND-ALIGN-2 R7a); closes with BAND-ALIGN-2's merge and the owner's smoke" and names no sha (standing rule 49).

     `git diff --name-only <M7a> HEAD -- src/utils src/components src/types.ts src/constants.ts main src/reader/modes/focus src/reader/modes/page src/reader/modes/narrate` prints nothing.
  5. **Live, on the packaged x64 build on RodneySr** (Done-when 6(a)'s package). It uses R7's route and probe, RodneySr `C:\Projects\Blurby-artifacts\band-align-2-r7\tools\r7-probe.mjs` L2, unchanged, so the run compares like for like with the release and bisect runs (LL-152).
     - **Setup:**
       - a fresh scratch profile per run;
       - `Session.profilePreflight` passes before the first input (LL-165);
       - the sample *Meditations*, at 100 % text size;
       - Flow, played from MEDITATIONS#136;
       - one probe sample a second for 30 s.
     - **(L2a) Crossing:** by sample 15 the cursor word is AURELIUS#189 in section 2, checked by its text and index (LL-161). The release crossed at sample 15.
     - **(L2b) Continuing:**
       - every sample from the crossing to sample 30 has a cursor;
       - each sample's cursor index is ≥ the previous one, and it rises by at least 10 over samples 16–30;
       - the band is present (non-empty `--flow-zone-top/bottom`, no band-off class) on every sample whose cursor is on screen;
       - Flow's `playing` stays true throughout.
     - **(L2c) Against the bad run:** no sample has no cursor (the bad run had 20). Record each figure beside `rel36-L2-text` and `cand-L2text-L5-Flow`.
     - After each run, close every window. The live `%APPDATA%\blurby\blurby-data\library.json` and `settings.json` hashes are unchanged.
  6. **Package verification** (standing rule 53, per its 2026-10-30 Temporary placement note as defined by Blurby.Brain1, `ROADMAP.md:204`).
     - **(a)** From the final R7a commit, which descends from M7a, build into separate empty folders:
       - `npx electron-builder --win --dir --x64 -c.directories.output=C:\Projects\Blurby-artifacts\band-align-2-r7a\out-x64`;
       - `npx electron-builder --win --dir --arm64 -c.directories.output=C:\Projects\Blurby-artifacts\band-align-2-r7a\out-arm64`.

       Record both `app.asar` SHA-256 values. Extract each with `npx asar extract` into `…\band-align-2-r7a\asar-x64` and `asar-arm64`, never in a worktree. Then run the pair check, which prints `0`:
       ```powershell
       $a='C:\Projects\Blurby-artifacts\band-align-2-r7a\asar-x64'; $b='C:\Projects\Blurby-artifacts\band-align-2-r7a\asar-arm64'
       $rel = { param($root) foreach ($p in 'dist','main','main.js','preload.js','package.json') { Get-ChildItem (Join-Path $root $p) -Recurse -File | % { $_.FullName.Substring($root.Length) } } }
       $ra = & $rel $a | Sort-Object; $rb = & $rel $b | Sort-Object
       (@(Compare-Object $ra $rb).Count) + (@($ra | ? { (Get-FileHash (Join-Path $a $_)).Hash -ne (Get-FileHash (Join-Path $b $_)).Hash }).Count)
       ```
     - **(b)** `Select-String -Path <x64 win-unpacked>\resources\app.asar -Pattern BLURBY_USER_DATA_DIR -SimpleMatch -Quiet` prints `True`. Then a 25 s x64 scratch launch:
       - it stays alive;
       - stdout, stderr and `error.log` hold no error, unhandled-rejection or crash line;
       - no crash dump appears;
       - the live `library.json` and `settings.json` hashes are unchanged;
       - known noise is recorded, not failed: BUG-217's `ENOENT`, and `EADDRINUSE 127.0.0.1:48924` with its owner taken from `Get-NetTCPConnection`.

       The arm64 launch on Rodney is deferred to merge (R-2026-10-30-2). The item reads "package-verified (x64, RodneySr); arm64 launch at merge".
     - **(c)** No `main/` file changed: `package unchanged` for `main/`, with `git diff --name-only <M7a> HEAD -- main main.js preload.js package.json` empty. The renderer bundle extracted from the x64 asar equals `dist/`'s file by SHA-256.
     - **(d)** Done-when 5 runs on the x64 package.
     - **(e)** The memo's "Package verification" section holds the outputs. Package path, commit and logs go to Blurby.Brain1, and Blurby.Roadmap gives no merge go before Brain confirms.
  7. **Owner (batched):** the memo carries one row for Blurby.Roadmap to add to release gate (2)'s owner-smoke list:
     > On *Meditations* in Flow, play from the start of the text through the end of the first section: the reading carries on into the next section (AURELIUS…) without stopping, the cursor never disappears, and the band stays on.

     Nothing is written to `ROADMAP.md` or the register (standing rule 46).
- **Effort:** S.
- **Owners:**
  - implementation agent on RodneySr (job 7);
  - spec-compliance and quality reviewers, in parallel;
  - Blurby.Brain1: package verification;
  - repository operator: push, and merge on Blurby.Roadmap's go;
  - owner: release gate (2).
- **Source:**
  - BUG-235 (`docs/governance/BUG_REPORT.md` on `origin/main`);
  - Blurby.Brain1's bisect, diagnosis and fix direction (2026-10-30; RodneySr `C:\Projects\Blurby-artifacts\bug-235-bisect\`);
  - `860ad3ca`'s diff (`ModeRuntime.ts` +12/−2, `FlowScrollEngine.ts` +133/−17, `foliateLayout.ts` +127/−1, `constants.ts` +12/−2);
  - the BAND-ALIGN-2 card's "MERGE BLOCKED by BUG-235" line (`ROADMAP.md:642`);
  - standing rule 53's Temporary placement (`ROADMAP.md:204`).
- **Path:** dispatch (RodneySr job 7; build and hold).

##### Implementation detail

- **Edit sites** (line numbers at `f3f254f3`; Flow only, no shared module).
  - **E1, `src/reader/modes/flow/helpers/FlowScrollEngine.ts`.** Add a public query directly after `syncToWord`'s closing brace (`:434`), preceded by one blank line. That is 5 inserted lines, so everything from `:435` on shifts by +5; R8 relies on this offset.
    ```ts
    /** BUG-235: whether a word is past the last rendered line while the pacer follows the word timer (its section hand-off point). */
    isPastRenderedEnd(wordIndex: number): boolean {
      return this.running && this.wordClock && this.lines.length > 0 && wordIndex > this.lines[this.lines.length - 1].lastWord;
    }
    ```
    `syncToWord` (`:405-434`), `completeSent` and `rebuildLineMap` are unchanged. The one-shot hand-off at `:407-413` is the path R7a makes reachable.
  - **E1b, `src/reader/modes/flow/ModeState.ts`.** After `pendingResume` (`:28-29`), add:
    ```ts
    /** BUG-235 (BAND-ALIGN-2 R7a): the word the word timer is held on while the line pacer hands off to the next section.
     *  An internal hold, never the reader's pause: `playing` stays true. Set in onEngineWordAdvance; cleared when
     *  onWordsReextracted resumes on it, and by pausePlayback and stop. */
    handoffHold: number | null = null;
    ```
  - **E2, `src/reader/modes/flow/ModeRuntime.ts`, `onEngineWordAdvance` (`:1262-1275`).** Replace the not-found branch `:1264-1272` with:
    ```ts
    if (!found) {
      if (this.scrollEngine?.isPastRenderedEnd(idx)) {
        // BUG-235: under one clock the next section's first word is not loaded yet. Hold the word timer on it (an
        // internal hold, handoffHold; `playing` stays true) and let the line pacer run its one-shot section hand-off
        // (onScrollEngineComplete → goToSection). The section's load calls onWordsReextracted, which resumes on it.
        // No page turn here: the hand-off owns the navigation.
        this.engine?.pause();
        s.handoffHold = idx;
        this.scrollEngine.syncToWord(idx);
        s.notify();
        return;
      }
      // A genuinely missing word inside the rendered range: pause, turn the page, wait for the section load (unchanged).
      this.engine?.pause();
      s.pendingResume = idx;
      this.surface.next();
      s.notify();
      return;
    }
    ```
    - `:1274` (`this.scrollEngine?.syncToWord(idx);` after the found check) is unchanged.
    - `onScrollEngineComplete` (`:1322-1344`) and its `>=` lookup (`:1329`) are unchanged. `s.highlightedWordIndex` is set to `idx` at `:1253` before the highlight, so the lookup's `currentWord` is the next section's first word.
    - The pacer's line map is rebuilt by the hand-off's `.then(() => this.scrollEngine?.rebuildLineMap())` (`:1333-1335`). That resets `completeSent`, so the next section's end hands off again.
  - **E3, `ModeRuntime.ts`, `onWordsReextracted` (`:1063-1090`).** After the `pendingResume` block (`:1073-1088`) and before `s.notify()` (`:1089`), add the hold's own resume:
    ```ts
    const held = s.handoffHold;
    if (held != null) {
      // BUG-235: resume exactly on the held word, only while the reader still wants playback.
      this.requestFrame(() => {
        if (!this.engine || s.handoffHold !== held || !s.playing) return; // the reader paused (pausePlayback cleared it)
        if (!this.surface.highlight(held, "flow")) return;                // not stamped yet: the next reextraction retries
        s.handoffHold = null;
        this.engine.resume();                                              // schedules held + 1 after one dwell
        s.notify();
      });
    }
    ```
    - There is no `surface.next()` on a miss: the hand-off owns navigation (LL-070).
    - `engine.resume()` (`FlowMode.resume`, `:119-124`) schedules the next word without re-emitting the held one, so nothing is repeated. The held word was already published by `onEngineWordAdvance` and is now painted, so nothing is skipped.
  - **E4, `ModeRuntime.ts`, `pausePlayback` (`:1391-1396`).** Add `this.state.handoffHold = null;` beside `this.state.pendingResume = null;` (`:1392`).
    - The reader's Pause (`togglePlay`, `:751-759`), a browse-away pause (`setBrowsedAway`, `:1399-1402`) and end-of-book (`onScrollEngineComplete`'s `:1340`) all clear the hold this way.
    - So a later section load does not resume, and the anchor stays on the held word (it was committed at `onEngineWordAdvance`, `:1254-1259`).
    - The next Play's cold restart (`start({ cause: "space" })`) begins from it.
  - **E5, `ModeRuntime.ts`, `stop` (`:761-776`).** Add `this.state.handoffHold = null;` beside `this.state.pendingResume = null;` (`:768`).
  - **Where `handoffHold` is cleared:**
    - E3, on the resume;
    - E4, on any `pausePlayback`;
    - E5, on `stop`.

    Nothing else reads or writes it. `pendingResume` keeps its own meaning, the mid-section miss.
  - **Not edited:**
    - `src/utils/FlowScrollEngine.ts`, the shared-core pacer; R7a edits only Flow's own helper;
    - `src/components/ReaderContainer.tsx`, `src/types.ts`;
    - every other mode;
    - `flow/FoliateView.tsx`, `flow/useModeBindings.ts` and `flow/helpers/foliateLayout.ts`.
- **Tests: new `tests/readerModes/flowSectionHandoff.test.tsx`** (`// @vitest-environment jsdom`).
  - It copies (not imports) the harness of `tests/readerModes/bandAlign2.test.tsx:1-92` and `:141-176`:
    - `rect`, `layout`, `openFlow`, `runtime` and `timerWord`;
    - fake timers;
    - `WORDS` = 200 words;
    - `BOOK_WORDS` with sections `{ 0: 0–100, 1: 100–200 }`, `totalWords: 200`;
    - `openFlow(WORDS, 95, { useFoliate: true, bookWords: BOOK_WORDS, filepath: undefined })`;
    - a Proxy `viewApiRef` as in (f4).
  - The view API differs from (f4) in three ways:
    - `highlightWordByIndex: vi.fn((i) => i < loadedEnd)`, with `loadedEnd = 100` (only section 0 is loaded);
    - `next: vi.fn()`;
    - `goToSection: vi.fn(() => Promise.resolve())`.
  - `layout(100)` is the pacer's container; the band callback records each `band` argument.
  - **(h1) Hand-off fires once.**
    - After `togglePlay()` and `startScrollEngine(container, cursor, onBand)`, advance `WORD_MS * 5 + 1`. Then:
      - `timerWord(r) === 100`;
      - `highlightWordByIndex` returned false for 100;
      - `goToSection` has been called exactly once, with `1`;
      - `next` has not been called.
    - Advance a further `WORD_MS * 3`. Then:
      - `goToSection` is still called once;
      - `next` still has 0 calls;
      - `timerWord(r) === 100` (the timer holds on the held word);
      - `runtime(r).state.handoffHold === 100`, `pendingResume === null` and `playing === true`.
    - On the tip this fails: `goToSection` has 0 calls and `next` has 1.
  - **(h2) Playback continues with cursor and band.** After (h1)'s first step, simulate the next section's load:
    1. Set `loadedEnd = 200`.
    2. Append spans for words 100–199 to the container: `layout`'s line rule, lines 20–39.
    3. Make `getWords` return all 200 words.
    4. `await` the hand-off's `goToSection` → `waitForSectionReady` promise chain (`await vi.runAllTicks()` or `await Promise.resolve()` ×3), so `rebuildLineMap` runs.
    5. Call `runtime(r).onWordsReextracted()` and advance one frame.

    Then:
    - the last `highlightWordByIndex` call was `(100, "flow", …)` and returned true, and `handoffHold === null`;
    - after `WORD_MS * 6`, `timerWord(r) >= 105`;
    - the pacer's `getState().lineIndex` is the line of `timerWord(r)` (`Math.floor(w / 5)`, which is ≥ 21);
    - the band callback has received a defined band since the load, and it contains that line's box (`band.top <= line top` and `band.bottom >= line top + 16`);
    - `r.getActive()!.runtime` reports `playing` true.

    On the tip this fails at the first assertion: the resumed pending path never ran the hand-off, so no section-1 line map exists.
  - **(h3) Control: a genuinely missing mid-section word.** With `highlightWordByIndex: (i) => i !== 97` and `loadedEnd` 100, advance to word 97. Then:
    - `next` is called once;
    - `goToSection` is not called;
    - `timerWord(r) === 97` and Flow's word timer is paused (`pendingResume` 97).

    It passes on the tip and after.
  - **(h4) The `>=` lookup, `860ad3ca`'s.** `BOOK_WORDS3` has sections `0: 0–100`, `1: 100–150` and `2: 150–200`. Call `runtime(r).onScrollEngineComplete()` directly, with `goToSection` spied:
    - **(h4a)** `state.highlightedWordIndex = 99`, the last found word, with the next section starting after it: `goToSection(1)`.
    - **(h4b)** `state.highlightedWordIndex = 100`, the next section's first word (the case R7a creates): `goToSection(1)`, not `2`.

    Both are controls and pass on the tip and after.
  - **(h5) A user pause during the hold is honoured.**
    1. Run (h1)'s first step; the hold is on 100.
    2. Call `r.togglePlay()`, the reader's Pause. `playing === false` and `handoffHold === null`.
    3. Simulate the section load as in (h2) steps 1–5, including `onWordsReextracted` and one frame.

    Then:
    - no `highlightWordByIndex(100, "flow")` resume call was made after the pause;
    - after a further `WORD_MS * 5`, `timerWord(r) === 100` and `playing === false`;
    - `goToSection` was called once.

    Then `r.togglePlay()` (Play):
    - the next `onEngineWordAdvance` word is 100, the cold restart from the anchor, which highlights 100 and returns true;
    - after `WORD_MS * 2 + 1`, `timerWord(r) === 102`;
    - `goToSection` still has exactly 1 call.

    On the tip this fails at its first assertion (`goToSection` has 0 calls when the hold should begin).
  - **(h6) Resume exactly on the held word, once.** Record every `onEngineWordAdvance` word through a spy on the view API's `highlightWordByIndex` calls whose kind is `"flow"`, in order.
    1. Run (h1)'s first step, then (h2)'s load, then advance `WORD_MS * 4 + 1`.

    Then:
    - the recorded sequence from 95 is exactly `95, 96, 97, 98, 99, 100 (miss), 100 (resume, found), 101, 102, 103, 104`;
    - each of 101–104 appears once, so no word is skipped or repeated after the held word;
    - the first word shown after the reextraction is 100, section 2's first word;
    - `goToSection` has exactly 1 call;
    - `next` has 0 calls.

    On the tip this fails: `goToSection` has 0 calls, and the sequence has no found 100 before `next`.
- **Constants:** none.
- **Branch:** `eb/band-align-2-r7a-work` on RodneySr, pushed to the held `eb/band-align-2`. **Execution host: RodneySr, job 7** ("for now (GoG bandwidth, 2026-10-30)", rule 53's Temporary placement).
  1. **Before launch:**
     - RodneySr is reachable;
     - `C:\Projects\bq-main`'s detached `HEAD` is `36ac7466` and `stash@{0}` is unchanged;
     - RodneySr's R7 worktree and the bisect evidence are preserved as they are (rule 10).

     If any of these fails, stop and ask Blurby.Brain1.
  2. `git -C C:\Projects\bq-main fetch origin`, then:
     - `git -C C:\Projects\bq-main rev-parse refs/remotes/origin/eb/band-align-2-r7-work` prints `f3f254f30da9c844e4416a988bb9325a160b109f`;
     - `git -C C:\Projects\bq-main merge-base --is-ancestor refs/remotes/origin/eb/band-align-2 refs/remotes/origin/eb/band-align-2-r7-work` exits 0 (F-tip).
  3. `git -C C:\Projects\bq-main worktree add --detach C:\Projects\bq-band-align-2-r7a refs/remotes/origin/eb/band-align-2-r7-work`, then `git switch -c eb/band-align-2-r7a-work`, then `npm ci`.
  4. **M7a:** `git merge --no-ff refs/remotes/origin/main`. Record the conflicting files, if any (F-merge). Run `npm ci` again only if `package.json` or `package-lock.json` changed.
  5. Copy R7's `r7-probe.mjs` into `C:\Projects\Blurby-artifacts\band-align-2-r7a\tools\`, unchanged.
  6. **Push:** `git push origin HEAD:refs/heads/eb/band-align-2`. This is a fast-forward from `a5273704` through `f3f254f3` and M7a. Never `--force`. Use the lowercase refspec.
- **Staging plan** (explicit paths, never `-A`):
  - **M7a:** the merge as is.
  - **C1, red:** `git add tests/readerModes/flowSectionHandoff.test.tsx`.
  - **C2, fix:** `git add src/reader/modes/flow/ModeRuntime.ts src/reader/modes/flow/ModeState.ts src/reader/modes/flow/helpers/FlowScrollEngine.ts docs/governance/BUG_REPORT.md`.
  - **C3, record:** `git add docs/governance/close-outs/Memo.BAND-ALIGN-2.GovernanceStaging.2026-10-23.md docs/governance/close-outs/Timing.BAND-ALIGN-2.jsonl`.
    - The memo gains an "R7a (2026-10-30, BUG-235)" section with: the bisect and diagnosis, M7a's sha and conflicts, the red output, Done-when 2–3, live L2a–L2c beside the release and bad runs, Package verification (both asar hashes, the pair-check output), and the gate (2) row.
    - The time log gains rows 16–20.
  - Before each commit, `git diff --cached --name-only` shows only that commit's paths. Before C3, `git diff --stat <M7a> HEAD` shows no unexpected shrink.
  - Auto-merge is **off**: build and hold.
- **Failure handling:**
  - **F-tip:** `origin/eb/band-align-2-r7-work` is not `f3f254f3`, or `eb/band-align-2` does not lead to it. Stop and report to Blurby.Roadmap.
  - **F-merge:** M7a conflicts.
    - If only `docs/governance/BUG_REPORT.md` conflicts, resolve it as R7 did (main's text plus the branch's BAND-ALIGN-2 lines), record it, and continue.
    - Otherwise run `git merge --abort` and stop with the paths.
  - **F-diagnosis:** (h1) fails on the tip for a reason other than "`goToSection` 0 calls, `next` 1 call". Or it passes on the tip, which would mean the diagnosis is wrong. Stop with the output; do not write the fix.
  - **F-red:** a C1 row fails by error, or a control fails on the tip. Fix the test only, at most 2 rounds, then stop.
  - **F-pinned:** a test outside this file fails after the fix. Stop and name it (standing rule 50).
  - **F-hold:** (h5) shows a resume after the reader's Pause, or (h6) shows a repeated or skipped word. Record the order of `handoffHold` writes, `playing`, `onWordsReextracted`, `requestFrame` runs and `engine.resume`, and stop. Do not merge the hold into `pendingResume` or into a shared paused bit.
  - **F-resume:** (h2) or live L2b shows the timer resuming before the section's spans are stamped (a skipped word, or a second hand-off).
    - Capture the order of `goToSection`, `waitForSectionReady`, `rebuildLineMap`, `onWordsReextracted` and `engine.resume`, and stop.
    - Do not add a second resume path.
  - **F-live:** L2a crosses after sample 15. Compare with `rel36-L2-text`'s sample timing on the same host before judging, because load varies (LL-152). If the crossing happens but late by more than 2 samples, record it and ask Blurby.Brain1. If it never crosses, stop.
  - **F-asar:** the pair check is non-zero. Rebuild both once into fresh folders. If a `dist/`, `main/`, `main.js`, `preload.js` or `package.json` file still differs, stop and send Brain the paths.
  - **Retry ceiling:** two repair passes per failing row, then stop with the evidence.
  - **Rollback:**
    - Before push: `git switch --detach f3f254f30da9c844e4416a988bb9325a160b109f`.
    - After push: `git revert --no-edit <C3> <C2> <C1>`.
    - After merge: `git revert -m 1 <merge>`.
    - Nothing is deleted (rule 10).
- **Lane Ownership:** Reader Engine. Execution surface A (Flow's runtime and pacer).
- **Forbidden During Parallel Run:**
  - `src/utils/` (including the shared-core `src/utils/FlowScrollEngine.ts`), `src/components/`, `src/types.ts`, `src/constants.ts`, `main/`;
  - Focus, Page and Narrate;
  - Flow's view, bindings and layout helper;
  - `C:\Projects\bq-main` itself, RodneySr's R7 worktree, the bisect evidence, the live profile and the register.

  R8 waits for R7a's push.
- **Shared-Core Touches:** none. R7a edits Flow's own `src/reader/modes/flow/helpers/FlowScrollEngine.ts`, not the frozen `src/utils/FlowScrollEngine.ts`, which it does not touch (Done-when 4).
- **Merge Order:**
  - R7a rides BAND-ALIGN-2's order: after the existing stack items JUMP-LANDING-SAVE-1 → BAND-ALIGN-1 → FOCUS-KEYS-FIX-1 → FLOW-KEYS-FIX-1 / FLOW-PARA-KEYS-1, and before R8.
  - R7a, R7 and R8 merge as one BAND-ALIGN-2 merge in its `ReaderContainer.tsx` integration window. R8's merge-order list then applies to the whole branch.
  - R7a lifts the "MERGE BLOCKED by BUG-235" hold once Brain confirms its package and BUG-235's live rows.

**Rulings this amendment relies on (all 2026-10-30; nothing is open):**
- Blurby.Brain1's diagnosis and fix direction.
- Blurby.Brain1's confirmation of B-R7a-1: hold the word timer on the past-the-end word and resume through `onWordsReextracted`, with the hold kept apart from the reader's pause (h5, h6).
- Blurby.Roadmap's base settlement: `f3f254f3`, pushed to `eb/band-align-2` as a fast-forward.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 16 | RodneySr worktree at `f3f254f3` with `origin/main` merged in as M7a, `npm ci`, R7 probe copied | repeat | setup | mechanical | low | 1m (median of 9 runs) | — | — |
| 17 | Red (h1), (h2), (h5), (h6) fail by assertion on the tip, confirming the unreachable hand-off; controls (h3), (h4) pass; committed alone | repeat | positive-control | bounded | medium | 4m (median of 20 runs) | — | — |
| 18 | Under one clock, a past-end word hands off once, the timer holds on it apart from the reader's pause, and resumes exactly on it; suites, `npm test`, typecheck and build green | repeat | renderer-fix | bounded | medium | 2m (median of 5 runs) | — | — |
| 19 | Live L2 on the packaged x64 build crosses into section 2 by sample 15 (AURELIUS#189) and keeps playing, beside the release and bad runs | repeat | live-check | bounded | medium | 10m (median of 4 runs) | — | — |
| 20 | x64 and arm64 packages verified by the pair check; memo, time log and gate (2) row recorded; pushed and held for Brain | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |

**Total:** chain 29m · sum 29m; 5 of 5 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 43:** red first. (h1) and (h2) must fail by assertion on the tip, and that failure is also the confirmation of Brain1's diagnosis (F-diagnosis). (h3) and (h4) are controls that pass on the tip.
- **Standing rule 50:** no existing test is edited. A failure outside the new file stops the run.
- **Standing rule 53:** Done-when 6 follows the Temporary placement as defined by Brain1:
  - M7a merges `origin/main` first;
  - x64 and arm64 are built on RodneySr, the pair check runs, and both asar hashes are recorded;
  - the x64 launch, (c) and (d) run on x64;
  - the arm64 launch is deferred to merge.
- **Standing rules 36, 41, 46, 47, 48 and 49:**
  - line numbers were re-read at `f3f254f3`;
  - the fence is exact;
  - nothing is written to the register;
  - the suite, typecheck and build run on the host;
  - BUG-235's line names no sha.
- **LL-031** (generation ID pattern for stale async results): the hand-off's async chain (`goToSection` → `waitForSectionReady` → `rebuildLineMap`) is guarded by the existing `alive` check and the one-shot `completeSent`. (h1) proves a second past-end tick cannot fire a second hand-off, and F-resume stops on any double hand-off. E3's deferred resume re-checks at run time that the hold is still the same word and that `playing` is still true, so a stale frame cannot resume after the reader paused (h5).
- **LL-016 and LL-017** (pause/resume flows break on shared or stale state; closures capture stale state): the internal hold is its own field, `handoffHold`, never the reader's `playing` or a shared paused bit. E3's frame callback reads `s.handoffHold` and `s.playing` when it runs, not when it was queued.
- **LL-070** (single ownership for section navigation): exactly one owner turns the section at a past-end word, the pacer's hand-off. R7a removes the competing `surface.next()` for that case, and (h1) asserts `next` is never called there.
- **LL-081** (full-book and DOM-slice indices never mix): the past-end test compares the book-wide word index with the pacer's line map of book-wide `data-word-index` values. The `>=` lookup uses `bookWords.sections`' book-wide starts, tested at both edges in (h4).
- **LL-142** (prove by executing): the bisect named `860ad3ca` by running packaged builds, and red (h1) must reproduce the diagnosis before any edit.
- **LL-152** (A/B on one recipe): the live row reuses R7's L2 route and probe unchanged, beside the release (`rel36-L2-text`) and bad (`cand-L2text-L5-Flow`) runs on the same host.
- **LL-161** (check a word by its text): the crossing is checked as AURELIUS#189 by text and index.
- **LL-165** (prove the profile): every launch passes `Session.profilePreflight` before the first input. The live hashes are checked after.
