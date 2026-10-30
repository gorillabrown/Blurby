<a id="play-first-text-1"></a>

#### PLAY-FIRST-TEXT-1 — Play on a page with no words starts reading at the first text *(Queued; Full Spec; authored 2026-10-30)*

- **What:** pressing Play while the reading view shows a section with no words skips ahead. Reading starts on the first word of the first later section that has words. Covers, image plates and blank separators all count as sections with no words. This applies in Flow (ScrollReaderView's runtime), Focus (ReaderView's runtime) and Narrate, and each mode does it in its own runtime. If no later section has words, Play does nothing and today's no-text state stays.
  - **A section with no words.** The book's section map (`bookWords.sections`, the full-book word source, LL-071) has no entry for the section on screen. The main-process extractor records a section only when it yields at least one word (`main/epub-word-extractor.js:270-277` at `f3f254f3`: `if (endWordIdx > startWordIdx) sections.push(…)`). The cover, an image plate and an empty separator therefore have no entry, and their documents carry no `[data-word-index]` span.
  - **The section on screen** is the view's `lastLoadedSectionIndexRef`, which every mode's `FoliateView` sets on each section load, the cover included (`flow/FoliateView.tsx:935`, `focus/FoliateView.tsx:825`, `narrate/FoliateView.tsx:832`). Narrate already exposes it as `getDisplayedSectionIndex()` (`narrate/FoliateView.tsx:258`, `:1112`; `narrate/surface.ts:28`, `:52`). Flow and Focus each gain the same getter on their own view API and surface.
  - **The first text** is the first `bookWords.sections` entry whose `sectionIndex` is greater than the section on screen. Its `startWordIdx` is the start word.
  - **How each runtime does it** (its own private method `startAtFirstText`, the same shape in three files, no shared module, Brain1 ruling 2). It runs first in the runtime's `start()`, so the Play button, Space, the start that waits for the view's first load and Flow's cross-book resume all take it (Brain1 ruling Q6):
    1. The method sets the start word as the explicit start anchor and as the one-shot resume anchor, and publishes it as the highlighted word. It sets the mode's `currentSection` to the target, so the section follower does not navigate as well. Narrate also sets `sectionNavInFlight` (LL-070: one navigation owner).
    2. It calls `goToSection(target)` and then `waitForSectionReady(target)`.
    3. When the target section is ready, it re-enters `start()` once, with the skip switched off. The mode's normal start then lands its cursor on that word, starts its clock and saves through its normal path.
    4. Pause, stop or a newer start during the move cancels it (a per-runtime token, LL-169).
  - **Out of scope:**
    - Page (no Play);
    - manual navigation onto a section with no words: contents jumps, chapter steps, page keys and scrolling land where asked (owner ruling Q1);
    - resuming a paused Focus or Narrate engine, which resumes at the paused word (owner ruling Q3);
    - a timer of any kind for a Play before the full-book words exist (`bookWords` null). That case is handled by a flag that the map's arrival acts on once (Brain1 ruling Q2, option (a); Implementation detail);
    - crossings during playback. Section hand-off already skips sections with no words, because they have no `bookWords.sections` entry: Flow's `onScrollEngineComplete` (`flow/ModeRuntime.ts:1329`), Narrate's `followSpokenSection` (`narrate/ModeRuntime.ts:562-574`) and Focus's `syncSection` (`focus/ModeRuntime.ts:924-936`);
    - BUG-235 (Flow stops at a section's end), which is fixed before this item (Prerequisites);
    - the band;
    - `src/types.ts`, `ReaderContainer.tsx`, `src/utils/`, the Narrate engine (`engine/*`), main, preload and the settings schema.
  - **Outcome (one sentence):** on the packaged x64 build on RodneySr, pressing Play on *Meditations*' image-only cover starts reading at section 1's first word, "MEDITATIONS", in Flow, Focus and Narrate, where the base Flow package shows no cursor for 10 s.
- **Why:**
  - **BUG-236** (`docs/governance/BUG_REPORT.md:11-17` on `origin/main` @ `4a1b7aa5`) reports that in Flow, Play on *Meditations*' image-only cover leaves playing=true in section 0, with 0 words and no cursor, for 60 s. It happens on release `36ac7466` and on the held BAND-ALIGN stack alike. Evidence is on RodneySr at `C:\Projects\Blurby-artifacts\band-align-2-r7\live\rel36-L2-cover`.
  - **Code trace of the Flow stall (at `f3f254f3`).** Flow's `start()` (`flow/ModeRuntime.ts:677-734`) resolves the start word from its anchors. On a fresh book that is word 0, which is section 1's first word, because the cover has no section entry. It never moves the view there:
    - `jumpDisplayToWord` is a no-op in Flow (`:1498`);
    - `surface.highlight(0)` finds no span on the cover (`:726-728`);
    - the word timer's first advance misses (`onEngineWordAdvance`, `:1262-1271`), pauses the timer, sets `pendingResume` and calls the blind `surface.next()`, leaving `state.playing` true;
    - only `onWordsReextracted` (`:1063-1090`) resumes it, once a later section's words are stamped.

    The observed state (playing, section 0, no cursor) is that pause-on-miss waiting for a section load that `next()` did not bring. Narrate replaced the same blind `next()` with a direct `goToSection` for the cursor's own section (BUG-191, `narrate/ModeRuntime.ts:561-574`). This item uses a direct `goToSection` plus `waitForSectionReady`, so it does not depend on why `next()` failed on the cover.
  - **Focus and Narrate** already land on word 0 for a fresh book, by a different route. Focus's `syncSection` follows the published word's section, and Narrate navigates on the cursor's first miss. Neither applies the ruling when the anchor is elsewhere, for example a stale anchor while the cover or a plate is on screen; they start at that anchor. Brain1's ruling 2 extends the rule to every mode with Play, so the red rows for Focus and Narrate test those cases and the explicit move (Tests).
  - **Owner design ruling (2026-10-30, binding):** "Start at first text". Pressing Play on an image-only cover (a section with zero stamped words) skips ahead and starts reading at the first following section that has words, from its first word.
  - **Owner design rulings on the drafting questions (2026-10-30, binding; all as recommended, relayed by the coordinator):**
    - **Q1, skip only on Play.** Navigation lands where asked: a contents jump, a chapter step, the page keys and scrolling. Only Play skips ahead. No navigation path is edited (Out of scope).
    - **Q3, a paused session resumes.** A paused Focus or Narrate session resumes at the paused word, and `togglePlay` is unchanged. **The asymmetry is recorded:** Flow has no resume (its `togglePlay` always restarts from the anchor, `flow/ModeRuntime.ts:751-759`, Q-G). So a paused Flow session whose view now shows a section with no words takes the skip, where Focus and Narrate resume at the paused word. The memo restates this for the owner's gate (2) list.
    - **Q4, the literal ruling.** Play with the view on a section with no words starts at the next text's first word and replaces any later word the mode held (for example, after the reader scrolled back from word 300 to the cover, or with a stale saved anchor). Rows (f2), (o2) and (n2) pin it.
  - **Blurby.Brain1's technical rulings (2026-10-30, binding):**
    1. Generalise: whenever Play is pressed with the reading position in a section with no words, advance to the next section with words. Covers, image plates and blank separators all qualify. If no later section has words, Play does nothing and the existing no-text state stands.
    2. Every mode with Play gets this: Flow, Focus and Narrate. Each does it in its own runtime, with no shared module and no sibling-runtime imports. Each lands its cursor on that first word and saves the position through its own normal save path.
    3. Red tests first, per mode: a first section with no words, plus Play, lands on the first word of the next section with words. A book with no sections that have words stays inert (control).
    4. Packaged check on RodneySr (x64) with *Meditations*: Play on the cover starts reading at section 1's first word, in each mode. Also the standing rule 53 pair, under its temporary placement, and an owner-observed row for release gate (2).
  - **Blurby.Brain1's rulings on the drafting questions (2026-10-30, binding; relayed by the coordinator):**
    - **Q2, a Play before the section map exists (`bookWords` null): option (a), authorised by Blurby.Brain1 on 2026-10-30, after the code check below.** Each mode does it in its own runtime, with no shared module:
      - when `start()` takes the empty-words path while the view shows a section with no words, the runtime records `pendingFirstText = { sectionIndex, request }`, its own private field;
      - when `bookWords` arrives, `adoptDocument` re-runs `start()` **exactly once**, and only if the flag is still set and the view still shows that section. It clears the flag first;
      - Pause, stop, navigation (`hardSelect`, `jumpToWord`, `jumpBack`, `handleCommand`) or a new Play clears the flag;
      - **no timers.** On the flag path, the old 500 ms retry timer and its blind `next()` are not run, so `start()` can never fire twice. The old path stays where the flag does not apply: no displayed section is known (a view without the getter, as in the fixture replays).
      - Rows (f7)–(f8), (o7)–(o8) and (n7)–(n8) pin it: the map at 300 ms gives exactly one start, and the map at 800 ms gives one start too. Rows (fc4)–(fc5), (oc4)–(oc5) and (nc4)–(nc5) show that navigation or Pause before the map leaves no surprise start, and (f9), (o9) and (n9) show the same for a view that moved off the section.
      - **The code check that led to option (a)** (`f3f254f3`). All three modes have the retry: `flow/ModeRuntime.ts:699-708`, `focus/ModeRuntime.ts:524-533` and `narrate/ModeRuntime.ts:274-283`. Each calls `surface.next()`, then sets one timer of `FOLIATE_SECTION_LOAD_WAIT_MS` (500 ms, `src/constants.ts:178`). When it fires, it re-enters `start()` only if `effectiveWords()` is then non-empty. Each `adoptDocument` (`flow/ModeRuntime.ts:642-654`, `focus/ModeRuntime.ts:472-480`, `narrate/ModeRuntime.ts:231-239`) adopts the snapshot and notifies, and never starts. So a map that arrived after 500 ms was never acted on. The shell starts its extraction 1 s after open (2 s above 100,000 words; `ReaderContainer.tsx:598-608`).
    - **Q5, no cap.** In Narrate, when the next section with words is far away, the move is one `goToSection` whatever the distance. No audio is generated for the skipped sections, and the first chunk is the target's.
    - **Q6, yes.** The skip lives in `start()`, so automatic starts take it too: the start that waits for the view's first load (`pendingStartOnLoad`), and Flow's cross-book resume (`resumeFlowAfterBookOpen`, which opens the next book at its cover).
    - **Q7, a timeout leaves the mode not playing.** When `waitForSectionReady` returns null after 3 s (for example, foliate drops a `goTo` while a page turn holds its lock, `narrate/ModeRuntime.ts:572`), the mode stays not playing, a `play-first-text` diagnostic is recorded, and the next Play retries. There is no automatic retry.
    - **Q8, the port-level proof is enough** for ruling 2's "saves the position through its own normal save path". Rows (f5), (o5) and (n5) show the relocate save of the playing word, never the stale one. The shell's save path below the port (debounced save, QUIT-FLUSH-1) is unchanged code, so no live reopen row is written (standing rule 54 would need a proven trigger with a no-action control).
  - **Base and sequencing (coordinator, 2026-10-30):** as drafted. The item is stacked after R7a and R8 on `eb/band-align-2`, with Seq 86.75. The BUG-235 fix is now specified as **BAND-ALIGN-2 R7a**; the launch gate names it "the BUG-235 fix".
- **Prerequisites** (none is terminal, so the spec encodes each wait; U5):
  - **The BUG-235 fix, BAND-ALIGN-2 R7a** (after RodneySr job 6's bisect) is built on `eb/band-align-2`. **Wait:** this item does not launch until the dispatch names R7a's fix commit `<BUG235-FIX>` and Done-when 0 shows it is an ancestor of the base.
  - **BAND-ALIGN-2 R8** (`docs/planning/specs/2026-10-30/BAND-ALIGN-2-R8.md` on `origin/main`) is pushed to `eb/band-align-2` as Wave 4. **Wait:** Done-when 0 checks for R8's settings key on the base.
  - **NARRATE-PAUSE-CANCEL-1** (Seq 86.5, built at `origin/eb/narrate-pause-cancel-1` @ `53adf994` and stacked on NARRATE-QUIT-LINGER-1 @ `5de476ce`) shares `narrate/ModeRuntime.ts`. It is not a base; it merges first (Merge Order). Done-when 0 and the merge both run a `git merge-tree` check against it.
  - **Inputs on RodneySr:**
    - `C:\Projects\bq-main` (a clone with `origin` reachable);
    - Node 22.12 or later and `pwsh` 7;
    - the sample *Meditations* (the app's bundled sample, as in R6–R8);
    - a Kokoro models root for the Narrate live row: `C:\Projects\Blurby-artifacts\narrate-quit-linger-1\models`, else `C:\Projects\Blurby-artifacts\narrate-rebuild-1\models`;
    - R6's `cover-probe.mjs` from `refs/archive/rodneysr-inputs/band-align-2-r7` @ `bbdbf949` (`band-align-2-r6/cover-probe.mjs`);
    - `scripts/ui-sweep/sweep.mjs` on the base, which provides `Session`, `profilePreflight`, `modelsRoot` and `hashLive`.
- **Done when** (every command runs in `pwsh` 7 on RodneySr from the worktree root `C:\Projects\wt-play-first-text-1`, unless it names another directory. Each passes only on the exact exit code or output stated; any other result, or a command that did not run, fails it (standing rule 44). `$A` = `C:\Projects\Blurby-artifacts\play-first-text-1`.)
  0. **Launch gate (prerequisites and host).** Each check exits 0. If any fails, nothing is launched (F-host, F-base).
     - `hostname` prints `RODNEYSR`.
     - `git -C C:\Projects\bq-main rev-parse HEAD` prints `36ac7466…`. `git -C C:\Projects\bq-main stash list` is saved to `$A\bq-stash-before.txt`, and it must match the list at the end of the run (Done-when 9).
     - `git -C C:\Projects\bq-main fetch origin` exits 0. `git -C C:\Projects\bq-main rev-parse refs/remotes/origin/eb/band-align-2` prints `<BA2-TIP>`, the sha the dispatch names.
     - **R8 is on the base:** `git -C C:\Projects\bq-main grep -q flowBandEnabled <BA2-TIP> -- src/types.ts` exits 0.
     - **The BUG-235 fix (BAND-ALIGN-2 R7a) is on the base:** `git -C C:\Projects\bq-main merge-base --is-ancestor <BUG235-FIX> <BA2-TIP>` exits 0.
     - **No textual conflict with the Narrate branch:** `git -C C:\Projects\bq-main merge-tree --write-tree <BA2-TIP> refs/remotes/origin/eb/narrate-pause-cancel-1` exits 0.
     - `Test-Path` is `True` for one of the two models roots, and for `$A` (create it if absent).
  1. **Worktree, base M0 and the base package (no product code changed).**
     - `git -C C:\Projects\bq-main worktree add -b eb/play-first-text-1 C:\Projects\wt-play-first-text-1 <BA2-TIP>` exits 0. `npm ci` exits 0.
     - **M0:** if `git merge-base --is-ancestor refs/remotes/origin/main HEAD` exits 1, then `git merge --no-ff --no-edit refs/remotes/origin/main` exits 0 (F-merge), and `npm ci` runs again if `package-lock.json` changed. Record the resulting `HEAD` as `<M0>`. `git merge-base --is-ancestor refs/remotes/origin/main HEAD` now exits 0.
     - `npm run build` exits 0. `npx electron-builder --win --dir --x64 -c.directories.output=$A\build-base` exits 0 and gives `$A\build-base\win-unpacked\Blurby.exe`.
     - `npx vitest list --filesOnly > $A\vitest-files-base.txt` exits 0.
     - Make `$A\tools\`. Save R6's probe there: `git -C C:\Projects\bq-main show refs/archive/rodneysr-inputs/band-align-2-r7:band-align-2-r6/cover-probe.mjs > $A\tools\cover-probe.mjs` exits 0. Then write `$A\tools\pft-probe.mjs` (Implementation detail, Probe) and `$A\tools\check-pft.cjs` (below). Both live outside the tree (standing rule 52).
  2. **Base live, the opposite verdict (standing rule 55; LL-152, the same recipe as Done-when 7).** On `$A\build-base\win-unpacked\Blurby.exe`, run the probe once per mode, with a fresh scratch profile per run:
     - `node $A\tools\pft-probe.mjs scripts\ui-sweep $A\build-base\win-unpacked\Blurby.exe $A\profiles\base-<mode> <Mode> 9555 $A\base-<mode>.json` exits 0, for `<Mode>` in `Flow`, `Focus`, `Narrate` (Narrate also takes `--models <root>`).
     - **Gate:** `node $A\tools\check-pft.cjs $A\base-flow.json` exits **1**, with `reason` `no-cursor` or `wrong-start`. This is the instrument's opposite verdict on the bug's own case. If it exits 0, stop before task 3 (F-base-probe).
     - Focus's and Narrate's base verdicts are recorded in the memo and are not gated. The code trace predicts PASS on the fresh cover (Why).
  3. **Red first (standing rule 43), committed alone before any fix.**
     - The red commit C1 adds exactly `tests/readerModes/harness/zeroWordBook.ts`, `tests/readerModes/flowPlayFirstText.test.ts`, `tests/readerModes/focusPlayFirstText.test.ts` and `tests/narrate/narrate.playFirstText.test.ts`. `git show --name-only --format= HEAD` lists those four paths.
     - `npx vitest run tests/readerModes/flowPlayFirstText.test.ts tests/readerModes/focusPlayFirstText.test.ts tests/narrate/narrate.playFirstText.test.ts --reporter=json --outputFile=$A\red.json` exits 1.
     - This check exits 0: the failed titles are exactly rows (f1)–(f9), (o1)–(o9) and (n1)–(n9); every failure is an assertion, not a load error; and the controls (fc1)–(fc5), (oc1)–(oc5) and (nc1)–(nc5) pass.

       ```
       node -e "const r=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));const a=r.testResults.flatMap(t=>t.assertionResults);const tag=x=>(x.title.match(/^\((\w+)\)/)||[])[1];const failed=a.filter(x=>x.status==='failed').map(tag).sort();const passed=a.filter(x=>x.status==='passed').map(tag);const want=['f','o','n'].flatMap(m=>[1,2,3,4,5,6,7,8,9].map(i=>m+i)).sort();const ctl=['f','o','n'].flatMap(m=>[1,2,3,4,5].map(i=>m+'c'+i));const loadErr=r.testResults.some(t=>t.status==='failed'&&t.assertionResults.length===0);console.log({failed,ctlMissing:ctl.filter(c=>!passed.includes(c)),loadErr});process.exit(!loadErr&&JSON.stringify(failed)===JSON.stringify(want)&&ctl.every(c=>passed.includes(c))?0:1)" $A\red.json
       ```
     - `npm run typecheck` exits 0 at C1. The red tests are typed so they fail at run time, not compile time: they reach the new getter through the fake view API's cast, never through a typed `surface` member.
     - The failing output goes in the memo.
  4. **The change** (commit C2, at the edit sites in Implementation detail; re-grep at dispatch, standing rule 36).
     - **Q2 gate (Brain1 ruling Q2, option (a)).** Run this before the full target suite: `npx vitest run tests/readerModes/flowPlayFirstText.test.ts tests/readerModes/focusPlayFirstText.test.ts tests/narrate/narrate.playFirstText.test.ts -t "\((f|o|n)([789]|c[3-5])\)"` exits 0. That proves that the map re-runs the Play exactly once, inside and after the old 500 ms window ((f7), (f8), (o7), (o8), (n7), (n8)), and that a cleared flag or a moved view leaves no start ((f9), (o9), (n9), (fc4)–(fc5), (oc4)–(oc5), (nc4)–(nc5)). It is expected to pass. If (f7), (o7) or (n7) shows two starts, stop (F-double-start).
     - **No timers:** `git diff -U0 <M0> HEAD -- src/reader/modes | Select-String '^\+.*\b(setTimer|setTimeout|setInterval)\('` prints nothing.
     - `git grep -c "pendingFirstText" HEAD -- src/reader/modes/flow/ModeRuntime.ts src/reader/modes/focus/ModeRuntime.ts src/reader/modes/narrate/ModeRuntime.ts` prints a count of at least 9 for each file: the field, the set, the `start()` clear, the `adoptDocument` read and clear, and the clears in `pause()`, `stop()`, `hardSelect`, `jumpToWord`, `jumpBack` and `handleCommand`.
     - `npx vitest run tests/readerModes/flowPlayFirstText.test.ts tests/readerModes/focusPlayFirstText.test.ts tests/narrate/narrate.playFirstText.test.ts` exits 0.
     - These also exit 0, unedited (standing rule 50): `npx vitest run tests/readerModes tests/narrate tests/readerModeIsolation.test.ts tests/readerModeOwnership.test.ts tests/readerModeBoundaries.test.ts`. They include the fixture replays `flow.behavior.test.tsx` and `focus.behavior.test.tsx`, whose recording surface answers `undefined` to the new getter, so the skip stays off there; and `bandAlign2Cover.test.tsx` (c6)–(c8), R6's cover fixture.
     - `git grep -n "getDisplayedSectionIndex" HEAD -- src/reader/modes` prints 17 lines, against 6 at the base (all Narrate). The 11 new lines are: 2 in each of `flow/FoliateView.tsx`, `flow/surface.ts`, `focus/FoliateView.tsx` and `focus/surface.ts` (interface and implementation), and 1 in each of `flow/ModeRuntime.ts`, `focus/ModeRuntime.ts` and `narrate/ModeRuntime.ts`.
     - `git grep -c "private startAtFirstText" HEAD -- src/reader/modes/flow/ModeRuntime.ts src/reader/modes/focus/ModeRuntime.ts src/reader/modes/narrate/ModeRuntime.ts` prints `1` for each of the three files.
  5. **Gates on the final commit** (standing rules 47 and 48):
     - `npm test` exits 0 (record the counts);
     - `npm run typecheck` exits 0;
     - `npm run build` exits 0.
     - **Collected set (standing rule 52):** `npx vitest list --filesOnly > $A\vitest-files-after.txt` exits 0. `Compare-Object (Get-Content $A\vitest-files-base.txt) (Get-Content $A\vitest-files-after.txt)` shows exactly three `=>` lines, ending in `flowPlayFirstText.test.ts`, `focusPlayFirstText.test.ts` and `narrate.playFirstText.test.ts`, and no `<=` line.
  6. **Fence (standing rule 41) and isolation (CLAUDE.md reading-mode isolation; LL-120).**
     - `git diff --name-status <M0> HEAD` lists exactly the following, plus `docs/governance/close-outs/Timing.PLAY-FIRST-TEXT-1.jsonl`:
       - `M src/reader/modes/flow/ModeRuntime.ts`, `M src/reader/modes/flow/surface.ts`, `M src/reader/modes/flow/FoliateView.tsx`;
       - `M src/reader/modes/focus/ModeRuntime.ts`, `M src/reader/modes/focus/surface.ts`, `M src/reader/modes/focus/FoliateView.tsx`;
       - `M src/reader/modes/narrate/ModeRuntime.ts`;
       - `A tests/readerModes/harness/zeroWordBook.ts`, `A tests/readerModes/flowPlayFirstText.test.ts`, `A tests/readerModes/focusPlayFirstText.test.ts`, `A tests/narrate/narrate.playFirstText.test.ts`;
       - `M docs/governance/BUG_REPORT.md`, `A docs/governance/close-outs/Memo.PLAY-FIRST-TEXT-1.GovernanceStaging.2026-MM-DD.md`.
     - `git diff --name-only <M0> HEAD -- src/types.ts src/components src/utils src/constants.ts src/reader/modes/page src/reader/modes/narrate/engine src/reader/modes/narrate/FoliateView.tsx src/reader/modes/narrate/surface.ts src/reader/modes/flow/helpers src/reader/modes/focus/helpers src/reader/modes/flow/ModeState.ts src/reader/modes/focus/ModeState.ts src/reader/modes/narrate/ModeState.ts src/reader/modes/flow/useModeBindings.ts src/reader/modes/focus/useModeBindings.ts src/reader/modes/narrate/useModeBindings.ts src/reader/modes/ReaderModeAdapter.ts src/reader/ports main main.js preload.js package.json docs/planning/roadmap-reviews ROADMAP.md` prints nothing.
     - **No sibling import:** `git diff -U0 <M0> HEAD -- src/reader/modes | Select-String '^\+\s*import'` prints nothing, because the change adds no import. Each mode reaches its section entries through `this.document.bookWords.sections`.
  7. **Live, on the packaged x64 build of the final commit** (Done-when 8(a)'s `out-x64`; the probe and recipe of Done-when 2; standing rule 45 for the owner route and the throttle void):
     - **Setup for each run:**
       - a fresh scratch profile;
       - `Session.profilePreflight` passes before the first input (LL-165);
       - the sample *Meditations* opened from the library at its cover;
       - an 8 s wait before switching mode, so the full-book words exist (rows (f7)–(n9) test the Q2 path, not the live run);
       - then a click on the mode's own button.
     - **Precondition, read before Play:** every loaded section has 0 stamped words and no cursor span is marked. That is the cover on screen. If it is not, the run is void; re-run it once, then stop (F-live).
     - **L1 Flow, L2 Focus, L3 Narrate:** `node $A\tools\pft-probe.mjs scripts\ui-sweep <out-x64>\win-unpacked\Blurby.exe $A\profiles\after-<mode> <Mode> 9555 $A\after-<mode>.json` exits 0 (Narrate with `--models <root>`). Then `node $A\tools\check-pft.cjs $A\after-<mode>.json` exits 0 for each of the three. The checker passes when all of these hold:
       - the first cursor read after Space (sampled every 50 ms, within 10 s, or 30 s for Narrate's voice loading) is in section 1, the lowest section with stamped words;
       - that cursor is section 1's first stamped span, and its text is `MEDITATIONS` (LL-161);
       - a read 3 s later (5 s for Narrate) has a larger cursor index, so reading continues;
       - no read was taken while `document.visibilityState` was `hidden` (standing rule 45's throttle void);
       - the live `library.json` and `settings.json` hashes are unchanged.
     - **The checker** `$A\tools\check-pft.cjs`, saved verbatim:

       ```js
       // PLAY-FIRST-TEXT-1 live gate (Brain1 ruling 4). Input: a pft-probe.mjs output JSON.
       const r = JSON.parse(require("fs").readFileSync(process.argv[2], "utf8"));
       const fail = (reason, extra) => { console.log(JSON.stringify({ file: process.argv[2], verdict: "FAIL", reason, ...extra })); process.exit(1); };
       const pre = r.before;
       if (!pre || pre.cursor || pre.sections.some((s) => s.stampedWords > 0)) fail("precondition-not-cover", { pre: pre && pre.sections });
       if (r.reads.some((x) => x.visibility === "hidden")) fail("throttled");
       const c = r.firstCursor;
       if (!c) fail("no-cursor", { waitedMs: r.waitedMs });
       const text = (c.sections || []).filter((s) => s.stampedWords > 0).sort((a, b) => a.index - b.index)[0];
       if (!text || text.index !== 1 || c.cursor.section !== 1 || c.cursor.index !== text.firstIndex || c.cursor.word !== "MEDITATIONS")
         fail("wrong-start", { cursor: c.cursor, firstText: text && { index: text.index, firstIndex: text.firstIndex, firstWord: text.firstWords[0] } });
       if (!r.later || !r.later.cursor || !(r.later.cursor.index > c.cursor.index)) fail("not-reading-on", { later: r.later && r.later.cursor });
       if (r.liveUnchanged !== true) fail("live-profile-changed");
       console.log(JSON.stringify({ file: process.argv[2], verdict: "PASS", atMs: c.atMs, cursor: c.cursor, later: r.later.cursor.index }));
       ```
     - The figures go in the memo beside the base runs of Done-when 2.
  8. **Package verification (standing rule 53 and its temporary placement note, `ROADMAP.md:204-205`; Brain1's T1 pair check and T2 merge rule).**
     - **(a)** From the final commit, which descends from M0 (T2), build into separate empty folders:
       - `npx electron-builder --win --dir --x64 -c.directories.output=$A\out-x64`;
       - `npx electron-builder --win --dir --arm64 -c.directories.output=$A\out-arm64`.

       Both exit 0. Record both `app.asar` SHA-256 values. Extract each with `npx asar extract` into `$A\asar-x64` and `$A\asar-arm64`, never in a worktree. The pair check prints `0`:

       ```powershell
       $a="$env:A\asar-x64"; $b="$env:A\asar-arm64"
       $rel = { param($root) foreach ($p in 'dist','main','main.js','preload.js','package.json') { Get-ChildItem (Join-Path $root $p) -Recurse -File | % { $_.FullName.Substring($root.Length) } } }
       $ra = & $rel $a | Sort-Object; $rb = & $rel $b | Sort-Object
       (@(Compare-Object $ra $rb).Count) + (@($ra | ? { (Get-FileHash (Join-Path $a $_)).Hash -ne (Get-FileHash (Join-Path $b $_)).Hash }).Count)
       ```
       (`$env:A` is set to `$A` first.)
     - **(b)** `Select-String -Path $A\out-x64\win-unpacked\resources\app.asar -Pattern BLURBY_USER_DATA_DIR -SimpleMatch -Quiet` prints `True`. Then a 25 s x64 launch on a fresh scratch profile, with `userData` proved over the inspector before any input (LL-165):
       - it stays alive;
       - stdout, stderr and `error.log` hold no error, unhandled-rejection or crash line;
       - no crash dump appears;
       - the live `%APPDATA%\blurby\blurby-data\library.json` and `settings.json` hash the same before and after;
       - known noise is recorded, not failed: BUG-217's first-launch `ENOENT`, and `EADDRINUSE 127.0.0.1:48924` with its owner from `Get-NetTCPConnection -LocalPort 48924`.

       **The arm64 25 s launch on Rodney moves to merge time** (R-2026-10-30-2). Until then the item reads "package-verified (x64, RodneySr); arm64 launch at merge".
     - **(c)** No `main/` file changed (Done-when 6). The renderer bundle in the x64 asar equals the built `dist/` by SHA-256, file by file: `Compare-Object` over `Get-FileHash` of `$A\asar-x64\dist\**` and `dist\**` shows no difference.
     - **(d)** Done-when 7 ran on this x64 package.
     - **(e)** The memo has a "Package verification" section with these outputs. Blurby.Brain1 is sent the package path, the commit and the logs. Blurby.Roadmap gives no merge go before Brain1 confirms.
  9. **BUG-236, the owner row, the record and the push.**
     - In BUG-236's entry, the `**Status:**` line becomes `**Status:** RESOLVED in source (PLAY-FIRST-TEXT-1); held on eb/play-first-text-1 until its merge. Lane: Reader Engine.` (standing rule 49: no merge sha). `Select-String -Path docs\governance\BUG_REPORT.md -SimpleMatch "RESOLVED in source (PLAY-FIRST-TEXT-1)" -Quiet` prints `True`.
     - The memo lists owner check **(o-pft)** for release gate (2)'s batched owner-smoke list (standing rule 45). Blurby.Roadmap adds it there:
       > On *Meditations*, open the book at its cover. In Flow, press Play: reading starts at once on the title page's first word, "MEDITATIONS", with the cursor on it. Do the same in Focus and in Narrate (Narrate's voice says "Meditations" first). On a page with no words and no text after it, Play does nothing.

       `Select-String -Path docs\governance\close-outs\Memo.PLAY-FIRST-TEXT-1.GovernanceStaging.*.md -SimpleMatch "(o-pft)" -Quiet` prints `True`.
     - The memo has a `Lessons` section listing this specification's Lessons applied, and any new lesson.
     - `git -C C:\Projects\bq-main stash list` equals `$A\bq-stash-before.txt`. `git -C C:\Projects\bq-main rev-parse HEAD` still prints `36ac7466…`.
     - `git push origin HEAD:refs/heads/eb/play-first-text-1` exits 0. `git ls-remote origin refs/heads/eb/play-first-text-1` prints the local `HEAD`.
- **Effort:** S–M (Brain1). Seven source files each get small edits, written three times in parallel, one per runtime. There are three test files on one shared fixture, and live and package work in three modes.
- **Owners:**
  - implementation agent on RodneySr;
  - spec-compliance and quality reviewers, in parallel;
  - Blurby.Brain1: technical rulings Q2 and Q5–Q8 (given 2026-10-30), package confirmation, and the F-base-probe, F-double-start and F-live stops;
  - Blurby.Roadmap: the register (Seq, status), the merge go and adding (o-pft) to release gate (2)'s list;
  - the owner: design rulings Q1, Q3 and Q4 (given 2026-10-30), and (o-pft) at release gate (2).
- **Source:**
  - the owner's design ruling, 2026-10-30 ("Start at first text");
  - Blurby.Brain1's technical rulings 1–4, 2026-10-30;
  - BUG-236 and BUG-235 (`docs/governance/BUG_REPORT.md:11-28` on `origin/main` @ `4a1b7aa5`);
  - the code at `f3f254f3` (`origin/eb/band-align-2-r7-work`; code identical to `origin/eb/band-align-2` @ `a5273704`), cited at each edit site;
  - the extractor's section rule (`main/epub-word-extractor.js:270-277`);
  - Narrate's BUG-191 navigation pattern and its test (`narrate/ModeRuntime.ts:561-599`; `tests/narrate/narrate.sectionNav.test.ts`);
  - R6's cover fixture (`tests/readerModes/bandAlign2Cover.test.tsx`) and probe (`refs/archive/rodneysr-inputs/band-align-2-r7` @ `bbdbf949`);
  - BAND-ALIGN-2 R8 and NARRATE-PAUSE-CANCEL-1 (`docs/planning/specs/2026-10-30/` on `origin/main`);
  - ROADMAP.md standing rules 36, 41–55 (`ROADMAP.md:176-207`);
  - register snapshot 2026-10-30T20:47:30Z for the Seq values (re-read at dispatch; the live register is authority).
- **Path:** dispatch.

##### Implementation detail

- **Base decision: stacked on `eb/band-align-2` after R7a (the BUG-235 fix) and R8, with `origin/main` merged in as M0** (the user's recommended option, confirmed on the evidence):
  - **The held stack has rewritten Flow's play path.** `git diff --stat origin/main f3f254f3 -- src/reader/modes` changes six of this item's seven source files (+1,418 / −187 across the modes): `flow/ModeRuntime.ts` (+73), `flow/FoliateView.tsx` (+298), `flow/surface.ts`, `focus/ModeRuntime.ts` (+54), `focus/FoliateView.tsx` (+270) and `focus/surface.ts`.
  - **The suspects edit the code this item runs through.** BUG-235's prime suspect `860ad3ca` ("Flow runs on one clock") edits `flow/ModeRuntime.ts`, including `onEngineWordAdvance` (`:1273-1274`) and `onScrollEngineComplete` (`:1327-1329`); its second suspect `eabd0c07` edits both views. The fix will edit the same play path.
  - **Why not `main`.** A branch cut from `main` would test, and package, a play path that the stack's merge replaces. Rule 53's T2 asks for the bytes that will merge. That branch would conflict in `flow/ModeRuntime.ts`, `flow/FoliateView.tsx`, `flow/surface.ts`, `focus/ModeRuntime.ts`, `focus/FoliateView.tsx` and `focus/surface.ts` against BAND-ALIGN-1 → FOCUS-KEYS-FIX-1 → FLOW-KEYS-FIX-1 → FLOW-PARA-KEYS-1 → BAND-ALIGN-2 (R6–R8) and the BUG-235 fix. It could not merge before them anyway (Merge Order; the freeze).
  - **Narrate is unaffected by the choice:** `narrate/ModeRuntime.ts` is identical on `origin/main` and `f3f254f3`. Its conflicts are with the held Narrate branches, which the merge-tree checks cover.
  - **Line numbers below were read at `f3f254f3`.** R8 (`flow/ModeRuntime.ts` W4, both views) and R7a (the BUG-235 fix) will move them, so re-grep at dispatch (standing rule 36). These commands print each site at the base:
    - `git grep -n -E "^  (start|pause|togglePlay|stop)\(" HEAD -- src/reader/modes/flow/ModeRuntime.ts src/reader/modes/focus/ModeRuntime.ts src/reader/modes/narrate/ModeRuntime.ts`;
    - `git grep -n "lastLoadedSectionIndexRef.current = index" HEAD -- src/reader/modes/flow/FoliateView.tsx src/reader/modes/focus/FoliateView.tsx`;
    - `git grep -n -E "getSectionForWordIndex(: \(|,$)" HEAD -- src/reader/modes/flow/FoliateView.tsx src/reader/modes/focus/FoliateView.tsx`;
    - `git grep -n "findFirstVisibleWordIndex" HEAD -- src/reader/modes/flow/surface.ts src/reader/modes/focus/surface.ts`.
- **Edit sites:**
  - **V1, `src/reader/modes/flow/FoliateView.tsx`** (no other change):
    - in `FlowFoliateViewAPI` (`:248-270`), after `getSectionForWordIndex: (wordIndex: number) => number | null;` (`:259`), add `/** PLAY-FIRST-TEXT-1: the section on screen (the last loaded), as Narrate's view reports it; null before the first load. */` and `getDisplayedSectionIndex: () => number | null;`;
    - in the `viewApiRef.current = { … }` object (`:1210-1276`), after `getSectionForWordIndex,` (`:1227`), add `getDisplayedSectionIndex: () => lastLoadedSectionIndexRef.current,`. The ref is declared at `:344` and set at `:935`.
  - **V2, `src/reader/modes/focus/FoliateView.tsx`:** the same two lines, in `FocusFoliateViewAPI` (`:227-247`) after `:239`, and in the object (`:1100-…`) after `getSectionForWordIndex,` (`:1120`). The ref is declared at `:317` and set at `:825`.
  - **S1, `src/reader/modes/flow/surface.ts`:**
    - in `FlowSurface`, after `findFirstVisibleWordIndex(): number;` (`:30`), add `/** PLAY-FIRST-TEXT-1: the section on screen; null with no view, or a view without the getter. */` and `getDisplayedSectionIndex(): number | null;`;
    - in the factory, after `:56`, add `getDisplayedSectionIndex: () => api()?.getDisplayedSectionIndex?.() ?? null,` (optional call, as `narrate/surface.ts:52`, so a test fake without it answers null).
  - **S2, `src/reader/modes/focus/surface.ts`:**
    - the same getter, in `FocusSurface` after `:26` and in the factory after `:50`;
    - also add `waitForSectionReady(sectionIndex?: number | null): Promise<number | null>;` with factory `waitForSectionReady: (sectionIndex) => Promise.resolve(api()?.waitForSectionReady(sectionIndex) ?? null),`. Focus's view API already has `waitForSectionReady` (`focus/FoliateView.tsx:243`, `:1162`); its surface did not expose it.
    - `goToSection` (`:23`, `:48`) is unchanged (fire-and-forget).
  - **R1, `src/reader/modes/flow/ModeRuntime.ts`:**
    - **Fields**, beside the other private fields (`:540-564`):
      ```ts
      /** PLAY-FIRST-TEXT-1: the start in flight while the view moves from a section with no words to the first text after it. */
      private firstTextToken: symbol | null = null;
      /** PLAY-FIRST-TEXT-1: true only while start() re-enters after that move, so the re-entry never skips again. */
      private firstTextReentry = false;
      ```
    - **`start()`** (`:677`): the first statement after `if (!this.alive) return;` (`:678`) becomes `if (this.startAtFirstText(request)) return;`.
    - **`pause()`** (`:736-741`): after the alive check, add `this.firstTextToken = null;`.
    - **`stop()`** (`:761-776`): beside `this.clearTimers();` (`:766`), add `this.firstTextToken = null;`.
    - **Q2, option (a) (Brain1, 2026-10-30): a pending first-text start, with no timer.**
      - **Field:** `/** PLAY-FIRST-TEXT-1 (Brain1 Q2): a Play made on a section with no words before the section map exists. */ private pendingFirstText: { sectionIndex: number; request: ReaderModeStartRequestV1 } | null = null;`.
      - **`start()`:** directly after `if (!this.alive) return;` and before the `startAtFirstText` line, add `this.pendingFirstText = null;` (a new Play clears it).
      - **The retry site** (`:699-708`). At the top of the `if (this.document.useFoliate && effectiveWords.length === 0 && this.surface.isReady()) {` block, before `this.surface.next();`, add:
        ```ts
        const shownEmpty = this.surface.getDisplayedSectionIndex();
        if (!this.document.bookWords && shownEmpty != null) {
          // Brain1 Q2 (a): wait for the section map; adoptDocument re-runs this Play once. No next(), no timer.
          this.pendingFirstText = { sectionIndex: shownEmpty, request };
          this.ports.diagnostics.record("play-first-text", `section ${shownEmpty} has no words and no section map yet: waiting for it`);
          s.notify();
          return;
        }
        ```
        The existing `next()` and 500 ms retry below it are unchanged and now run only when no displayed section is known.
      - **`adoptDocument`** (`:642-654`). After its final `this.state.notify();`, add:
        ```ts
        const pending = this.pendingFirstText;
        if (pending && next.bookWords) {
          this.pendingFirstText = null; // exactly once
          if (this.surface.getDisplayedSectionIndex() === pending.sectionIndex) this.start(pending.request);
        }
        ```
      - **Clears:** add `this.pendingFirstText = null;` beside the `firstTextToken` clears in `pause()` and `stop()`, and as the first statement after the alive check in `jumpToWord` (`:784`), `hardSelect` (`:850`), `jumpBack` (`:903`) and `handleCommand` (`:920`).
    - **New private method**, beside `consumeModeStartAnchor` (`:1405`):
      ```ts
      /**
       * PLAY-FIRST-TEXT-1 (owner ruling 2026-10-30 "Start at first text"; Brain1 rulings 1–2). Play with the view on a
       * section that has no words (no entry in the book's section map) moves to the first later section with words and
       * starts on its first word. Returns true when it took the start over (moving, or inert because no later section has
       * words); false when the start goes on as before (a section with words, no section map yet, or no view).
       */
      private startAtFirstText(request: ReaderModeStartRequestV1): boolean {
        if (this.firstTextReentry || !this.document.useFoliate) return false;
        const bookWords = this.document.bookWords;
        const shown = this.surface.getDisplayedSectionIndex();
        if (!bookWords || shown == null) return false; // Brain1 Q2: no map yet; the empty-words path sets pendingFirstText
        if (bookWords.sections.some((section) => section.sectionIndex === shown)) return false;
        const target = bookWords.sections.find((section) => section.sectionIndex > shown);
        if (!target) {
          this.ports.diagnostics.record("play-first-text", `section ${shown} has no words and no later section has words: Play does nothing`);
          return true; // ruling 1: the existing no-text state stands (no engagement, no navigation, no clock)
        }
        const s = this.state;
        const token = Symbol("play-first-text");
        this.firstTextToken = token;
        s.explicitSelectionAnchor = target.startWordIdx; // the re-entry's consumeModeStartAnchor starts here
        s.resumeAnchor = target.startWordIdx; // no relocate save of an earlier word while the view moves
        this.publishHighlight(target.startWordIdx);
        s.currentSection = target.sectionIndex; // syncSection sees no change and does not navigate as well
        this.ports.diagnostics.record("play-first-text", `section ${shown} has no words: to section ${target.sectionIndex}, word ${target.startWordIdx}`);
        Promise.resolve(this.surface.goToSection(target.sectionIndex))
          .then(() => this.surface.waitForSectionReady(target.sectionIndex))
          .then((ready) => {
            if (!this.alive || this.firstTextToken !== token) return; // paused, stopped or superseded during the move
            this.firstTextToken = null;
            if (ready !== target.sectionIndex) {
              this.ports.diagnostics.record("play-first-text", `section ${target.sectionIndex} not ready: not started`);
              s.notify();
              return;
            }
            this.firstTextReentry = true;
            try { this.start(request); } finally { this.firstTextReentry = false; }
          })
          .catch((error: unknown) => {
            if (this.alive) this.ports.diagnostics.record("play-first-text", `move failed: ${String(error)}`); // LL-066
          });
        s.notify();
        return true;
      }
      ```
      The re-entry runs Flow's start unchanged:
      - `consumeModeStartAnchor` (`:1405-1421`) returns the target word;
      - `resolveFoliateStartWord` keeps it, because it is below `bookWords.totalWords`;
      - `surface.highlight(start, "flow", { allowMotion: true })` (`:726-728`) paints it, now that the target section is loaded;
      - the word timer starts there (`:732`);
      - the first advance past it consumes the one-shot resume anchor (`:1244-1251`), so `onRelocate`'s normal `scheduleRelocateSave` (`:1015-1030`) saves the playing word. That is Flow's own save path (ruling 2).
      - A target word of 0 is kept: the code compares with `== null` and `!==`, never truthiness (LL-108).
  - **R2, `src/reader/modes/focus/ModeRuntime.ts`:**
    - the same fields; the same first line in `start()` (`:502`, after `:503`, passing `_request`); `this.firstTextToken = null;` in `pause()` (`:564-574`) and `stop()` (`:600-613`, beside `:605`);
    - the same private method, with two differences:
      - `this.surface.goToSection(target.sectionIndex);` is a plain statement (Focus's surface returns void and catches);
      - the chain starts at `this.surface.waitForSectionReady(target.sectionIndex).then(…)`.
    - The re-entry runs Focus's start unchanged: the start word is published, and the engine starts after `FOCUS_MODE_START_DELAY_MS` (`:549-560`). The save path is Focus's `onRelocate` → `scheduleRelocateSave` (`:815-855`).
    - `togglePlay` (`:584-598`) is unchanged: a paused engine still resumes (owner ruling Q3).
    - **Q2, option (a):** the same field, `start()` clear, retry-site block and `adoptDocument` addition as Flow's. The sites are the retry at `:524-533` (passing `_request`) and `adoptDocument` at `:472-480`, after its `this.state.notify();` at `:479`. The clears go in `pause()`, `stop()`, `jumpToWord` (`:621`), `hardSelect` (`:680`), `jumpBack` (`:730`) and `handleCommand` (`:747`).
  - **R3, `src/reader/modes/narrate/ModeRuntime.ts`:**
    - the same fields; the same first line in `start()` (`:257`, after `:258`);
    - in `stop()` (`:329-351`), add `this.firstTextToken = null;`.
    - In `pause()` (`:306-312`), the guard `if (!this.alive || !this.state.playing) return;` (`:307`) becomes `if (!this.alive) return;`, then `this.firstTextToken = null;`, then `if (!this.state.playing) return;`. The move happens while `playing` is false, so a Pause during it still cancels it.
    - The private method is Flow's, with Narrate's navigation protocol:
      - before `goToSection`, set `s.sectionNavInFlight = target.sectionIndex;` (LL-070; `followSpokenSection`, `:562-574`, then waits);
      - call `this.traceSectionNav("play-first-text", target.startWordIdx, target.sectionIndex, shown);` (`:591-599`; BUG-191's rule that every caller that changes the displayed section traces first);
      - `this.surface.goToSection(…)` already returns a promise (`narrate/surface.ts:53`);
      - in both the success and the `.catch` handlers, clear `sectionNavInFlight` first if it still equals the target.
    - The re-entry runs Narrate's start unchanged:
      - `surface.highlight(start, "narrate", { allowMotion: true })` (`:296`);
      - `engineFor(…).play(start)` (`:301`): the cursor is the word at the playback sample from the exact word table (owner ruling #31, LL-142), first the target word;
      - the save path is `onRelocate` → `scheduleRelocateSave` (`:472-491`) once the cursor passes the resume anchor (`:664-667`).
    - **Q2, option (a):** the same field, `start()` clear, retry-site block and `adoptDocument` addition as Flow's. The sites are the retry at `:274-283` and `adoptDocument` at `:231-239`, after its `this.state.notify();` at `:238`. The flag path returns before the existing `this.traceSectionNav("empty-words-retry", …)` and `next()` (`:275-276`), so it makes no section move and needs no trace. The clears go in `pause()` (with the `firstTextToken` clear, before the `playing` check), `stop()`, `jumpToWord` (`:359`), `hardSelect` (`:411`), `jumpBack` (`:448`) and `handleCommand` (`:461`).
    - No engine file is edited.
- **Tests** (the red set of Done-when 3; existing tests unedited):
  - **Shared test fixture `tests/readerModes/harness/zeroWordBook.ts`** (test-only, like `harness/fakePorts.ts`; not collected):
    - `WORDS`: `["MEDITATIONS", "s1w1" … "s1w9", "s3w0" … "s3w9"]` (20 words).
    - `BOOK: ReaderBookWordsValue`: `sections` are `[{ sectionIndex: 1, startWordIdx: 0, endWordIdx: 10, wordCount: 10 }, { sectionIndex: 3, startWordIdx: 10, endWordIdx: 20, wordCount: 10 }]`, `totalWords: 20`, `footnoteCues: []`. Sections 0 (the cover), 2 (a plate) and 4 (a back cover) have no entry, as the extractor leaves them.
    - `NO_TEXT_BOOK`: `{ words: [], sections: [], totalWords: 0, footnoteCues: [] }`.
    - `zeroWordDocument(position, bookWords = BOOK)` returns `createFakeDocument({ useFoliate: true, bookWords, tokenWords: [...WORDS], wordCount: bookWords.totalWords, position, paragraphBreaks: [] })`.
    - **`createZeroWordView(shown, { holdReady = false } = {})`** returns `{ api, view, releaseReady }`. `view.shown` is mutable. The `api` (cast `as unknown as` each mode's view API) has:
      - `getDisplayedSectionIndex: vi.fn(() => view.shown)`;
      - `goToSection: vi.fn(async (i) => { view.shown = i; })`;
      - `waitForSectionReady: vi.fn(async (i) => { if (holdReady) await held; return i === view.shown && i in RANGE ? i : null; })`, where `RANGE = { 1: [0, 10], 3: [10, 20] }`;
      - `highlightWordByIndex: vi.fn((w) => view.shown in RANGE && w >= RANGE[view.shown][0] && w < RANGE[view.shown][1])`;
      - `next: vi.fn()` (it records only, which models the cover stall);
      - `getWords: vi.fn(() => …)`, the shown section's words as `{ word, range: null, sectionIndex: view.shown }`, or `[]`;
      - `getParagraphBreaks: () => new Set<number>()` and `getParagraphStartWordIndexes: () => []`;
      - `getSectionForWordIndex: (w) => (w < 10 ? 1 : w < 20 ? 3 : null)`;
      - `findFirstVisibleWordIndex: () => (view.shown in RANGE ? RANGE[view.shown][0] : -1)`;
      - `isUserBrowsing: () => false`, plus `vi.fn()` no-ops for `clearUserBrowsing`, `clearSoftHighlight`, `applySoftHighlight`, `clearHighlight`, `prev` and `goTo`;
      - `resolveWordState: () => ({})`, `getScrollContainer: () => null`, `getFlowZoneHost: () => null`.

      `releaseReady()` resolves `held`.
    - `settle()` runs 20 microtask turns (`await Promise.resolve()` in a loop). If a chain needs more, the count is raised here only.
  - **Runtime set-up** (as `tests/narrate/narrate.sectionNav.test.ts:16-39`):
    - `createFakeInfrastructure({ document: zeroWordDocument(P, book) })`;
    - `createReaderPorts`, `broker.openDocument`, then `broker.issue("<mode>")`;
    - `create<Mode>Runtime({ key, ports, document, settings, handoff: createInitialHandoff(document, document.wordCount), arrival: "silent" })`. Narrate also passes `{ producer: new FakeProducer(), createOutput: () => output }`.
    - Then `runtime.viewApiRef.current = api` and `runtime.select(P)`. Play is `runtime.togglePlay()`.
    - Flow and Focus use `vi.useFakeTimers({ now: 0 })` with `await vi.advanceTimersByTimeAsync(ms)`. Narrate uses real timers and `flush()`, as `narrate.mode.test.ts:18-21`, and the eval-trace sink override of `narrate.sectionNav.test.ts:21`.
    - `WORD_MS = 60_000 / 300` (the fake settings' 300 wpm).
  - **Flow, `tests/readerModes/flowPlayFirstText.test.ts`** (`// @vitest-environment jsdom`). Each title begins with its tag. The engine's own word is `runtime.exportHandoff("capture-current").highlightedWordIndex`.
    - **(f1)** Cover, fresh book (`shown 0`, `P 0`). After Play and `settle()`:
      - `api.goToSection` was called exactly once, with `1`;
      - `api.next` was not called;
      - `view.shown === 1`;
      - `api.highlightWordByIndex` was called with `(0, "flow", { allowMotion: true })`, and that call returned `true`;
      - the snapshot is `{ playing: true, highlightedWordIndex: 0 }`, the engine's word is `0`, and `BOOK.words[0] === "MEDITATIONS"`.

      Base: the start word is 0, but `highlight` misses and the timer pause-on-miss calls `next()` with no `goToSection` (the BUG-236 stall), so it fails.
    - **(f2)** Cover with a stale anchor (`shown 0`, `P 12`). As (f1): the start is word 0, not 12, and the engine's word is `0`. Base: it starts at 12.
    - **(f3)** Plate (`shown 2`, `P 5`). `api.goToSection` was called with `3`; the start and the engine's word are `10` (`"s3w0"`). Base: 5.
    - **(f4)** Back cover, no later text (`shown 4`, `P 15`). After Play and `await vi.advanceTimersByTimeAsync(1000)`:
      - `playing` is `false`;
      - `api.goToSection`, `api.next` and `api.highlightWordByIndex` were never called;
      - `fake.effects` has no `persistence.markEngaged` (LL-030: no ghost engagement).

      Base: it plays from 15.
    - **(f5)** The save path (the (f2) set-up). After Play, `settle()` and `await vi.advanceTimersByTimeAsync(WORD_MS)`, the engine's word is `1`. Then `runtime.onRelocate({ cfi: "epubcfi(/6/4!/4/2/1:0)", fraction: 0.1 })`.
      - The last `persistence.scheduleRelocateSave` effect has args `[{ wordIndex: 1, cfi: "epubcfi(/6/4!/4/2/1:0)" }]`.
      - No `scheduleRelocateSave` effect has `wordIndex` 12.

      Base: the timer stalls at 12 and no save of 1 is made.
    - **(f6)** Pause during the move (`shown 0`, `P 0`, `holdReady: true`). After Play and `settle()`, `api.goToSection` was called with `1`. Then `runtime.pause()`, `releaseReady()` and `await vi.advanceTimersByTimeAsync(1000)`:
      - `playing` is `false`;
      - `api.highlightWordByIndex` was never called with `allowMotion: true`;
      - the engine's word stays the published `0`, and no timer advance happened.

      Base: the precondition `goToSection(1)` fails.
    - **(f7) The map at 300 ms gives exactly one start (Brain1 ruling Q2)** (`bookWords: null`, `shown 0`, `P 0`, `getWords` → `[]` on the cover).
      1. Play. `playing` is `false`, and `api.next` was not called (no blind page turn on the flag path).
      2. At 300 ms, `fake.publishDocument(zeroWordDocument(0, BOOK))`; the runtime's `adoptDocument` takes it.
      3. After `await vi.advanceTimersByTimeAsync(1700)` (2,000 ms in all) and `settle()`:
         - `api.goToSection` was called exactly once, with `1`, and `view.shown === 1`;
         - `highlightWordByIndex(0, "flow", { allowMotion: true })` returned `true`, and the engine's word is `0` (`"MEDITATIONS"`) or later in section 1;
         - **exactly one start completed:** `fake.effects` holds exactly one `settings.update` with `{ readingMode: "flow", lastReadingMode: "flow" }`. Two would mean the map's re-run and the old timer both started (F-double-start).

      Base: `next()` is called, the 500 ms retry starts at the anchor with no move, and the word timer stalls, so it fails.
    - **(f8) The map at 800 ms** (as (f7), with the map published at 800 ms): the same assertions at 2,000 ms, with exactly one start. Base: the retry found no words at 500 ms and nothing re-enters `start()`, so it fails. After C2, `adoptDocument` re-runs the Play, so it passes.
    - **(f9) A moved view before the map: no start.** As (f7), but at 200 ms the view moves on its own (`view.shown = 3`, standing in for scrolling or a page key handled inside the view). At 300 ms the map is published. At 2,000 ms: no `settings.update` with `readingMode`, `playing` is `false`, and `api.goToSection` was not called. `adoptDocument` finds the view off the flagged section and clears the flag without starting.

      Base: the 500 ms retry finds section 3's words in the loaded slice and starts, so it fails.
    - **(fc1) Control, a book with no sections that have words** (`NO_TEXT_BOOK`, `shown 0`, `P 0`). After Play and 1000 ms, `playing` is `false`, and `api.goToSection` and `api.highlightWordByIndex` were never called. It passes on the base (the empty-words path) and after (ruling 1, inert).
    - **(fc2) Control, a section with words** (`shown 1`, `P 5`). The start is 5; `api.goToSection` and `api.next` were not called; `highlightWordByIndex(5, "flow", { allowMotion: true })` returned `true`. It passes on both.
    - **(fc3) Control, the map never arrives** (`bookWords: null`, `shown 0`, `getWords` → `[]`). After Play and 2,000 ms: `playing` is `false`, `api.goToSection` was not called, `highlightWordByIndex` was never called with `allowMotion: true`, and `fake.effects` has no `document.ensureBookWords`. It passes on both. The `next()` count is not asserted: 1 on the base, 0 after; (f7) asserts 0.
    - **(fc4) Control, navigation before the map clears the flag.** Set up as (f7). At 200 ms, `runtime.jumpToWord(5, "navigation")`. At 800 ms the map is published, after the base's 500 ms retry has already found no words. At 2,000 ms: `api.goToSection` was not called, there is no `settings.update` with `readingMode`, and `playing` is `false`. No surprise start. It passes on both.
    - **(fc5) Control, Pause before the map clears the flag.** As (fc4), with `runtime.pause()` at 200 ms instead. The same assertions. It passes on both.
  - **Focus, `tests/readerModes/focusPlayFirstText.test.ts`:** rows (o1)–(o9) and (oc1)–(oc5) mirror (f1)–(f9) and (fc1)–(fc5), with these differences:
    - "the engine's word" is the snapshot's `highlightedWordIndex` after `await vi.advanceTimersByTimeAsync(FOCUS_MODE_START_DELAY_MS)`;
    - Focus's start makes no `highlightWordByIndex` call, so (o1)–(o3) assert `view.shown` and the snapshot instead;
    - (o5) advances `FOCUS_MODE_START_DELAY_MS + 2 * WORD_MS`, then asserts `1 ≤ highlightedWordIndex ≤ 9`, and that the relocate save's `wordIndex` equals it;
    - (o6) asserts that no engine started: `highlightedWordIndex` stays `0` after 1000 ms, and `playing` is `false`;
    - (oc3) and (oc4)–(oc5) count completed starts by `settings.update` with `{ readingMode: "focus", lastReadingMode: "focus", isNarrating: false }`, as (o7) does.

    Base reasons:
    - (o1) fails: `goToSection` is never called by `start()`; only the bindings' `syncSection` would call it;
    - (o2), (o3) and (o5) fail: Focus starts at the stale anchor;
    - (o4) fails: it plays from 15;
    - (o6) fails at its precondition;
    - (o7) fails: Focus's retry (`focus/ModeRuntime.ts:524-533`) re-enters `start()` at the anchor with no move;
    - (o8) fails: nothing re-enters `start()` after the 500 ms retry;
    - (o9) fails: the 500 ms retry starts on the moved view's words.
  - **Narrate, `tests/narrate/narrate.playFirstText.test.ts`:** rows (n1)–(n9) and (nc1)–(nc5) mirror Flow's, with these differences:
    - **(n1):** immediately after Play, synchronously:
      - `api.goToSection` was called with `1`;
      - `producer.requests.length === 0`;
      - a `narrate-section-nav` trace has `caller: "play-first-text"`, `word: 0` and `targetSection: 1`.

      After `await flush(); await flush();`: `producer.requests[0].text.startsWith("MEDITATIONS ")`, `highlightWordByIndex` was called with `(0, "narrate", { allowMotion: true })`, and `playing` is `true`. Base: no `goToSection` before audio, so it fails.
    - **(n2):** the stale anchor 12 → the first request starts `"MEDITATIONS "`.
    - **(n3):** the plate → `goToSection(3)`, and the first request starts `"s3w0 "`.
    - **(n4):** the back cover → `producer.requests.length === 0` after 300 ms of real time, and no `goToSection`.
    - **(n5):** the save path, with the (n2) set-up:
      1. `output.advance(INTO_FIRST_WORD_S); runtime.tick(); output.advance(WORD_S); runtime.tick();`;
      2. the snapshot's `highlightedWordIndex` is `1`;
      3. `runtime.onRelocate({ cfi: "epubcfi(/6/4!/4/2/1:0)", fraction: 0.1 })`;
      4. the last `scheduleRelocateSave` has `wordIndex: 1`, and none has 12.
    - **(n6):** Pause during the move → no producer request after release.
    - **(n7):** the map is published 300 ms after Play (real timers). By 2,000 ms, after `flush()`:
      - `goToSection(1)` was called exactly once;
      - `producer.requests[0].text.startsWith("MEDITATIONS ")`;
      - **exactly one start:** exactly one `settings.update` with `{ readingMode: "narrate", lastReadingMode: "narrate", isNarrating: true }`, and no producer request starting anywhere but `"MEDITATIONS "`.

      Base: the 500 ms retry starts at the anchor with no move before audio, so it fails.
    - **(n8):** the map is published at 800 ms; at 2,000 ms, the same assertions as (n7). Base: it fails. After C2 it passes.
    - **(n9):** as (f9): no start, and `producer.requests.length === 0` at 2,000 ms. Base: the 500 ms retry starts on section 3's words, so it fails.
    - **(nc1)–(nc5):** as Flow's. In (nc3), the base's empty-words path traces `empty-words-retry` and calls `next()` once; after C2, the flag path does neither, and neither count is asserted. (nc4) and (nc5) also assert `producer.requests.length === 0`.
  - **Unchanged and must pass unedited:** the whole of `tests/readerModes` and `tests/narrate`, including:
    - `flow.behavior.test.tsx` and `focus.behavior.test.tsx` (fixture replays; the recording surface answers `undefined` to the getter, `fixtureReplay.tsx:139`);
    - `bandAlign2Cover.test.tsx`;
    - `narrate.sectionNav.test.ts` (its fake already has `getDisplayedSectionIndex`);
    - `flowKeys.test.tsx` and `focusKeys.test.tsx`;
    - `arrivalCursor.test.ts`;
    - `readerModeIsolation`, `readerModeOwnership` and `readerModeBoundaries`.
- **Constants:** none. The move's timeout is the views' existing `FOLIATE_SECTION_READY_TIMEOUT_MS` (3,000 ms, `src/constants.ts:180`), through `waitForSectionReady`'s default. `src/constants.ts` is not edited.
- **Probe** `$A\tools\pft-probe.mjs` (outside the tree), built from R6's `cover-probe.mjs`. Arguments: `<sweepDir> <exe> <profile> <Flow|Focus|Narrate> <port> <out.json> [--models <root>]`.
  - **Launch and open:**
    - `new Session({ exe, profile, port, liveProfile, modelsRoot })`, then `start()`, which runs the profile preflight;
    - `enter(…, "Reader — Page")` and `sleep(8000)` (so `bookWords` exists);
    - a click on `[aria-label="<Mode> mode"]`, then `sleep(3000)`.
  - **`READ`:** cover-probe's `READ` with these changes:
    - the cursor selector is `.page-word--highlighted, .page-word--flow-cursor, .page-word--narrate-cursor`;
    - it adds `visibility: document.visibilityState` and `atMs` (from the Space press).
  - **Reads and output:**
    - `before` is read, then Space is pressed;
    - `READ` runs every 50 ms until the first read with a cursor, saved as `firstCursor` (with its `sections`), or until 10 s (30 s with `--models`), recorded as `waitedMs`;
    - `later` is read after 3 s (5 s for Narrate);
    - Space is pressed again and `s.stop()` runs;
    - the output is `{ before, firstCursor, later, reads, waitedMs, liveUnchanged }`, every read included.
  - It never takes a screenshot as evidence (standing rule 55) and reads state only.
- **Branch:** `eb/play-first-text-1`, cut from `<BA2-TIP>` (`origin/eb/band-align-2` carrying R7a, the BUG-235 fix, and R8), with `origin/main` merged in as M0 (Done-when 0–1).
  - It is created in a **new worktree** `C:\Projects\wt-play-first-text-1` from `C:\Projects\bq-main` on RodneySr. Never touch `bq-main`'s detached `36ac7466`, its `stash@{0}` or the RUN 4 evidence.
  - **Build and hold:** auto-merge is **off** (this spec opts out of Rule 5b: the base is a held branch, and source merges are frozen).
  - Push with `git push origin HEAD:refs/heads/eb/play-first-text-1` (an `eb/` ref needs the explicit lowercase refspec). Never `--force`.
  - The dispatch carries the filled reconciliation recipe with `<BA2-TIP>` and `<BUG235-FIX>` (standing rule 42).
- **Host (CLAUDE.md rule 6b; standing rule 53's temporary placement):** **RodneySr**, the x64 quiet machine, for builds and checks, "for now (GoG bandwidth, 2026-10-30)". It runs the worktree, both packages, the base and after probes, the full suite and the x64 checks. Rodney, the owner's machine, runs only the arm64 25 s launch, at merge time (R-2026-10-30-2).
  - **Inputs:**
    - the pushed base branch, fetched into `C:\Projects\bq-main`;
    - `npm ci` in the new worktree;
    - artifacts under `C:\Projects\Blurby-artifacts\play-first-text-1\`, never in a worktree;
    - the Done-when 0 preflight before launch.
  - If the preflight fails, resolve placement with Blurby.Brain1 before launch, and never run silently on Rodney.
- **Waves** (8 tasks, so the dispatch is pre-split under the 40-tool-use ceiling, standing rule 10):
  - **Wave A:** tasks 1–4 (Done-when 0–4). It ends with C1 and C2 pushed and the memo started.
  - **Wave B:** tasks 5–8 (Done-when 5–9).
- **Staging plan** (explicit paths, never `git add -A`; `git diff --cached --name-only` checked before each commit):
  - **M0:** the merge as is.
  - **C1, red:** `git add tests/readerModes/harness/zeroWordBook.ts tests/readerModes/flowPlayFirstText.test.ts tests/readerModes/focusPlayFirstText.test.ts tests/narrate/narrate.playFirstText.test.ts`.
  - **C2, fix:** `git add src/reader/modes/flow/ModeRuntime.ts src/reader/modes/flow/surface.ts src/reader/modes/flow/FoliateView.tsx src/reader/modes/focus/ModeRuntime.ts src/reader/modes/focus/surface.ts src/reader/modes/focus/FoliateView.tsx src/reader/modes/narrate/ModeRuntime.ts`.
  - **C3, record:** `git add docs/governance/BUG_REPORT.md docs/governance/close-outs/Memo.PLAY-FIRST-TEXT-1.GovernanceStaging.2026-MM-DD.md docs/governance/close-outs/Timing.PLAY-FIRST-TEXT-1.jsonl`.
  - Before C3, `git diff --stat <M0> HEAD` shows no unexpected shrink.
  - Unstaged, always: `release\`, `dist\`, `tests/perf-baseline-results.json` and anything under `$A`.
  - Nothing is written to `ROADMAP.md` or the register (standing rule 46).
- **Register writes (standing rule 46):** none by the run. Blurby.Roadmap registers the item through `create-item` and assigns its Seq. Seq **86.75** (confirmed by the coordinator, 2026-10-30), after NARRATE-PAUSE-CANCEL-1 (86.5) and before LIBRARY-WRITE-RACE-2 (87). A fractional Seq goes through rule 11a's guarded helper. The item stays blocked, and does not count as queued, until its prerequisites land (rule 5a).
- **Failure handling:**
  - **F-host:** the Done-when 0 host checks fail → stop, and ask Blurby.Brain1 for placement.
  - **F-base:** `<BA2-TIP>` lacks R8 or R7a's `<BUG235-FIX>` → do not launch; report to Blurby.Roadmap. This is the encoded wait, not a defect.
  - **F-merge:** M0 conflicts.
    - If the only conflict is `docs/governance/BUG_REPORT.md`, resolve it as R7 and R8 did (main's text plus the branch's BAND-ALIGN-2 lines), record it, and continue.
    - Otherwise run `git merge --abort` and stop with the paths. A source conflict is never resolved in this run.
  - **F-base-probe:** the base Flow run passes `check-pft.cjs` (the bug does not reproduce on the base package) → stop before task 3. Send Brain1 the JSON: the after gate would not discriminate (rule 55).
    - A precondition void (`precondition-not-cover`) is re-run once.
    - Focus or Narrate passing on the base is recorded, not a stop.
  - **F-double-start (Brain1 ruling Q2, option (a)):** (f7), (o7) or (n7) records two starts for one Play (two completed-start settings writes, two `goToSection(1)` calls, or two first producer requests). The map's re-run and some other re-entry both fired. Stop and report to Blurby.Brain1 with the effect list and the times. Never fix it with a timer or a delay.
  - **F-q2 (any other Q2 row fails after C2):** for (f8), (o8), (n8) or (f9), (o9), (n9) or (fc4)–(nc5), fix the edit once against this specification (flag set only on the flag path; cleared before the re-run; cleared on Pause, stop, navigation and a new Play), then stop and report.
  - **F-red:** a red row passes on M0, a control fails, or a load error → fix the tests once, then stop and report. Never weaken an assertion to make a row red.
  - **F-pinned:** any existing test fails after C2, especially a fixture replay or `bandAlign2Cover` → stop and name it (standing rule 50). A replay failure means the `shown == null` guard was not taken for an `undefined` answer.
  - **F-census:** `readerModeOwnership`, `readerModeIsolation` or `readerModeBoundaries` fails → stop with the census line. Do not edit `docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json`.
  - **F-live** (any `check-pft.cjs` FAIL after the change):
    - capture the probe JSON, every read's `sections`, and the session's diagnostics records (`play-first-text`, `narrate-section-nav`), then stop and report to Brain1;
    - if `firstCursor` is null and a `section … not ready` record exists, the move timed out (Brain1 ruling Q7): report the timing;
    - if the cover's section index was null in the view, report it, and do not add a fallback;
    - if section 1 is not *Meditations*' first section with words, stop: ruling 4 names section 1.
  - **F-narrate-voice:** Narrate's first cursor needs more than 30 s (a cold model) → re-run once with the probe's wait at 60 s, record it, and do not change the gate's word rule.
  - **F-asar:** the pair check is non-zero → rebuild both once into fresh folders. If a `dist/`, `main/`, `main.js`, `preload.js` or `package.json` file still differs, stop and send Brain1 both packages and the path list.
  - **F-launch:** an exit code 0x80000003 or 0xC0000409, or a 45 s terminate → stop (the quit-crash class).
  - **F-preflight:** a preflight exits 4, or the live hashes move → stop at once (LL-165).
  - **Retry ceiling:** one repair attempt per failing gate, then stop with the evidence.
  - **Rollback:**
    - before the push: `git switch --detach <M0>` (the branch is kept; nothing is deleted, rule 10);
    - after the push, while held: `git revert --no-edit <C2> <C1>`;
    - after a merge: `git revert -m 1 <merge>`.

    There is no data or settings migration. With the change reverted, Play on a cover returns to the BUG-236 stall in Flow and to the anchor start in Focus and Narrate.
- **Lane Ownership:** Reader Engine (primary); cross-lane TTS / Narration Engine for `narrate/ModeRuntime.ts`. Execution surfaces:
  - A: the three runtimes' start paths;
  - C: the Flow and Focus views' API getter and their surfaces.
- **Forbidden During Parallel Run:**
  - `src/types.ts`, `src/components/ReaderContainer.tsx` and `src/utils/` (shared core);
  - `src/constants.ts`;
  - Page;
  - Narrate's `engine/` files, `FoliateView.tsx` and `surface.ts`;
  - each mode's `helpers/` (including Flow's own `FlowScrollEngine.ts`), `ModeState.ts`, `useModeBindings.ts`, `mode.css` and `foliateStyles.ts`;
  - `ReaderModeAdapter.ts` and `src/reader/ports/`;
  - `main/`, `main.js` and `preload.js`;
  - the census `boundary-policy.json`;
  - `C:\Projects\bq-main` itself, the live profile and the register.

  No other sprint may edit this item's seven source files while it runs.
- **Shared-Core Touches:** none. No file in the freeze set (`ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`) is edited (Done-when 6). The base carries BAND-ALIGN-2's own `ReaderContainer.tsx`/`types.ts` integration-window touches; this item adds none and does not hold the window.
- **Merge Order** (Blurby.Roadmap's scan of `origin/eb/*` on 2026-10-30, for branches not in `origin/main` that edit this item's seven source files. Seq values are from register snapshot 2026-10-30T20:47:30Z; re-read at dispatch):
  1. **The BUG-235 fix, BAND-ALIGN-2 R7a**, on BAND-ALIGN-2's stack.
  2. **BAND-ALIGN-2 with R6, R7, R7a and R8** (Seq 83, `eb/band-align-2`), in its own order: JUMP-LANDING-SAVE-1 (81) → BAND-ALIGN-1 (66) → FOCUS-KEYS-FIX-1 (76) → FLOW-KEYS-FIX-1 (77) / FLOW-PARA-KEYS-1 (84) → BAND-ALIGN-2. All of these but JUMP-LANDING-SAVE-1 are already in this item's base.
  3. **NARRATE-QUIT-LINGER-1** (86, `5de476ce`), then **NARRATE-PAUSE-CANCEL-1** (86.5, `53adf994`). NARRATE-PAUSE-CANCEL-1 adds to `narrate/ModeRuntime.ts` at `:119` (the port cast); this item edits `start()`, `pause()` and `stop()`.
  4. **This item** (recommended Seq 86.75), after `origin/main` is merged in and rule 53 is re-run on the merge candidate, including the arm64 launch on Rodney.

  - **Held branches that merge before it (lower Seq):**
    - NARRATE-SENTENCE-RESUME-1 (40, `35716c5f`) and NARRATE-SENTENCE-INITIALS-1 (71, `c93f7c09`). Both edit Narrate's `start()` at `:283-295`, the start-word resolution after this item's first line. They are different hunks, but their sentence-start rule then applies to the re-entry's start word (a section's first word is already a sentence start).
    - BLOCK-TAG-CASE-1 (85, `61cbbf7e`): `flow/FoliateView.tsx`, `flow/ModeRuntime.ts`, `flow/surface.ts` and `focus/FoliateView.tsx`, including the `FlowFoliateViewAPI` and `FocusFoliateViewAPI` interfaces.
  - **Held branches that merge after it (higher Seq):** each takes `origin/main` in and re-greps this item's sites at its own merge.
    - READER-ARROW-GUARD-1 (91, `51202c1c`): Flow's and Focus's `FoliateView.tsx` and `ModeRuntime.ts`, and `focus/surface.ts`;
    - CHAPTER-STEP-CFI-1 (97, `796282c2`, stopped at its Done-when 1): `flow/FoliateView.tsx`, including `FlowFoliateViewAPI` at `:249`, and Flow's and Focus's `ModeRuntime.ts` and `surface.ts`;
    - FLOW-PARA-PAUSE-INDEX-1 (108, `f61ae02d`): Flow's and Focus's views, `flow/surface.ts`, and `flow/ModeRuntime.ts` including `start()` at `:729`.
  - **Queued items whose specs edit these runtimes** take this item in at their own dispatch:
    - FLOW-TOC-JUMP-WORD-1 (110);
    - NARRATE-PAUSED-CLICK-1 (117);
    - FOCUS-PAUSED-HANDOFF-1 (118);
    - FOCUS-WORD-ONLY-1 (123);
    - NARRATE-SELECTION-START-1 (124);
    - EINK-FLOW-VIEWPORT-1 (128) and EINK-NARRATE-VIEWPORT-1 (129);
    - NARRATE-BAND-SPACE-1 (141).
  - **Checks:** at dispatch (Done-when 0) and again at merge, `git merge-tree --write-tree HEAD <tip>` reports no conflict for each held branch named above. A conflict goes to Blurby.Roadmap for merge-train order. It is never resolved by editing another branch here.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | RodneySr worktree at the verified BAND-ALIGN-2 tip (R7a, the BUG-235 fix, and R8 in it) with `origin/main` merged in as M0, `npm ci`, the base x64 package built outside `release\`, the base test list and probe tools saved | repeat | setup | mechanical | low | 1m (median of 9 runs) | — | — |
| 2 | Base probe: Flow on the cover shows no cursor in 10 s (the opposite verdict); Focus and Narrate base verdicts recorded | repeat | live-check | bounded | medium | 10m (median of 4 runs) | — | — |
| 3 | Red rows (f1–f9, o1–o9, n1–n9) fail by assertion on M0 while controls (fc1–fc5, oc1–oc5, nc1–nc5) pass, committed alone | repeat | positive-control | bounded | medium | 4m (median of 20 runs) | — | — |
| 4 | Play on a section with no words moves each mode to the first later text and starts on its first word, and a Play made before the section map arrives starts exactly once when it does; targeted and reader-mode suites green | repeat | renderer-fix | cross-cutting | high | 2m (median of 5 runs) | — | — |
| 5 | Full suite, typecheck, build, collected set, fence and isolation checks pass | repeat | verify-gate | bounded | low | 0m (median of 4 runs) | — | — |
| 6 | Live L1–L3 on the packaged x64 build: Flow, Focus and Narrate start on "MEDITATIONS" from the cover | repeat | live-check | bounded | medium | 10m (median of 4 runs) | — | — |
| 7 | x64/arm64 pair check, 25 s x64 scratch launch and asar contents verified; package sent to Brain1; arm64 launch noted for merge | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |
| 8 | BUG-236 status, memo with (o-pft) and Lessons, time log; pushed and held | calculable | governance-closeout | mechanical | low | 1m (median of 62 runs) | — | — |

**Total:** chain 40m · sum 40m; 8 of 8 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

**Wall-clock note:** the calibrated medians above measure agent working time. Expect about 4 h on RodneySr: two x64 packages plus the arm64 pair, six probe runs (Narrate's cold voice is the slowest), and the full suite. A "done by" forecast uses about 4 h, not the total line.

##### Lessons applied
- **Standing rule 43:** red first. C1 holds only the three test files and their fixture. Rows (f1)–(f9), (o1)–(o9) and (n1)–(n9) fail by assertion on M0, and the controls (fc1)–(fc5), (oc1)–(oc5) and (nc1)–(nc5) pass on both sides (Done-when 3). Each row's base reason is stated (Tests).
- **Standing rule 55:** the live checker is shown to give FAIL on the base Flow package (Done-when 2) before its PASS counts (Done-when 7). The probe reads state, never a screenshot.
- **Standing rule 53** with its temporary placement (`ROADMAP.md:204-205`):
  - M0 merges `origin/main` first (T2);
  - x64 and arm64 are built on RodneySr into separate folders, with the T1 pair check;
  - (c) compares the renderer bundle (no `main/` change);
  - the arm64 launch moves to merge (R-2026-10-30-2).
- **Standing rules 41, 44, 47, 48, 50 and 52:**
  - an exact fence that exempts the time log;
  - `pwsh` with exact exit codes;
  - the suite, typecheck and build on the execution host;
  - every existing test passes unedited;
  - the collected set grows by exactly three files.
- **Standing rules 36, 42, 45, 46 and 49:**
  - sites are re-grepped at dispatch (with commands);
  - the dispatch carries the recipe with `<BA2-TIP>` and `<BUG235-FIX>`;
  - (o-pft) goes to gate (2)'s batched list;
  - the run writes no register field;
  - BUG-236's line names the item, never a merge sha.
- **Standing rule 54:** no live persistence row is written without a trigger proven to commit. The save path is proven at the port (rows 5), as Brain1 ruled for Q8.
- **LL-030** (engagement gating): the inert case returns before `markEngaged`, and (f4), (o4) and (n4) assert no `persistence.markEngaged`.
- **LL-031 and LL-169** (stale async results; currentness separate from lifetime): a per-runtime `firstTextToken` drops a move that Pause, stop or a newer start superseded, apart from the `alive` lifetime check. (f6), (o6) and (n6) test it.
- **LL-066** (no silent catch): the move's `.catch` records a `play-first-text` diagnostic.
- **LL-070** (one owner for section navigation during narration): Narrate's move holds `sectionNavInFlight` and traces `narrate-section-nav` before acting, so `followSpokenSection` does not navigate as well. Flow and Focus set `currentSection`, so their `syncSection` stays still.
- **LL-071 and LL-081** (global word source; never mix full-book and slice indices): the target comes from `bookWords.sections` only. With no section map, the Play waits on a flag that the map's arrival acts on once (Brain1 ruling Q2, option (a)) rather than guessing from the loaded slice.
- **LL-073 and LL-108** (persistent resume anchor; preserve zero): the target is set as the one-shot resume anchor, so the relocate save never writes the stale word mid-move. A target word of 0 is compared with `== null` and `!==`, never truthiness.
- **LL-109** (async against a stop race): every continuation checks `alive` and the token before it acts. `adoptDocument` acts on `pendingFirstText` only while the runtime is alive and the view still shows the flagged section, and it clears the flag before re-running `start()`, so no stale or repeated start runs.
- **LL-120** (visual ownership per mode) and CLAUDE.md reading-mode isolation: three private copies, one per runtime, with no shared module and no new import (Done-when 6 greps it). Narrate's view is untouched; it already had the getter.
- **LL-125** (Narrate stays audio-owned): Narrate's cursor stays the engine's word at the playback sample. The move only places the view and the start word; the engine is not edited.
- **LL-086** (measure in the found document): the probe reads each loaded section's own document through `renderer.getContents()`, never `contents[0]` alone.
- **Standing rule 45** (owner route; throttle void): (o-pft) is the owner-observed row. Every probe read records `visibilityState`, and a hidden read voids the run.
- **LL-143** (dry-run every gate): the checker's FAIL reasons are named. The grep counts were taken at `f3f254f3`: 6 `getDisplayedSectionIndex` lines in `src/reader/modes`, 0 of them in Flow or Focus, and 0 `play-first-text` hits. The base Flow probe is the checker's dry run.
- **LL-152** (A/B on one recipe): base and after use the same probe, arguments, sample, machine and build recipe. BUG-236's `rel36-L2-cover` record is the earlier A.
- **LL-161** (check a word by its text): the live gate checks the cursor's text, `MEDITATIONS`, and the unit rows check `BOOK.words[…]` and the producer's request text.
- **LL-170** (an unchanged word array does not prove the DOM matches): the live gate reads the stamped span itself, in the section's own document: its `data-word-index`, its section and its text. It never infers the cursor from the word array alone.
- **LL-165** (prove the profile): every probe and the 25 s launch pass `profilePreflight` before the first input, and the live hashes are compared.
- **LL-142** (a timing label is not evidence): Narrate's exact-table cursor is unchanged. The live row reads the painted cursor, not a scheduled estimate.
