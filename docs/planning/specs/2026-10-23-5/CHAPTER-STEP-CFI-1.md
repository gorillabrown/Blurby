<a id="chapter-step-cfi-1-spec"></a>

#### CHAPTER-STEP-CFI-1 — Contents jumps and chapter steps in Focus, Flow and Narrate save the landed word with the landed cfi, and Focus shows the chapter's first word as the reading word *(position 97 — Full Spec; absorbs FOCUS-TOC-JUMP-WORD-1 (position 99); authored 2026-10-23 by Blurby.Roadmap (roadmap review 2026-10-23-5) on the stacked base `origin/eb/band-align-2` @ `85e32777` + `origin/eb/jump-landing-save-1` @ `8a7c9db6`, edit sites read on both; owner ruling 2026-10-23 (tier 3): "First word of chapter"; after JUMP-LANDING-SAVE-1 and BAND-ALIGN-2; build-and-hold; not a release gate)*

**Why one item.** FOCUS-TOC-JUMP-WORD-1 is folded in here (a tier-1 process decision). Both items edit the same three places in Focus: `navigateTo`, the `go-to-href` case and `onRelocate`. The cursor paint the owner ruled for needs the landing hook that the save fix creates: the moment the jump has landed, and the word and cfi it landed on. Two items would mean one red file and one live run each, with the second stacked on the first and re-editing the same lines. One item needs one landing mechanism, one red file and one control and fixed build pair. Register action at the review's close: FOCUS-TOC-JUMP-WORD-1 (Seq 99) becomes Superseded, absorbed by this item, and its ruling is carried here.

- **What:** on an EPUB, a contents-list jump or a Previous or Next chapter step in Focus, Flow or Narrate does three things. It saves the entry's word with the cfi of the place it landed, never the previous section's. It saves nothing if the jump never lands. In Focus it also makes that word the reading word: the paused cursor is painted on it, and a paused engine resumes from it.
- **Why** (traced on the stacked base):
  - **The shell's path.** `handleJumpToChapter` (`src/components/ReaderContainer.tsx:648-667` on `8a7c9db6`) first calls `handleNavigateTo(docChapters[i].charOffset)`, then `handleCommand({ kind: "go-to-href", href })`. On a foliate book, JUMP-LANDING-SAVE-1's fix B sends Previous and Next chapter through the same function (`:670-692`, `tocChapterStep`). The contents list in the bottom bar also calls it (`onJumpToChapter`, `:811`). For a foliate book, `charOffset` is `resolveTocWordIndex` (`:100-113`): the section's `startWordIdx` when full-book words are loaded, otherwise a proportional estimate.
  - **The early save with the old cfi.** Each mode's `navigateTo` calls `commitShared(word, "explicit-navigation", undefined)`. On `85e32777` that is Focus `src/reader/modes/focus/ModeRuntime.ts:723-727`, Flow `flow/ModeRuntime.ts:896-900` and Narrate `narrate/ModeRuntime.ts:441-446`. `commitShared` calls the mode's own `commitPersistentWordIndex` with `persist: true`. That saves with `options.cfi ?? state.cfi` (`helpers/usePersistentReadingAnchor.ts:99` in each mode). Here `state.cfi` is still the previous section's relocate cfi.
  - **The landing saves nothing.** `go-to-href` only calls `this.surface.goTo(href)`: Focus `:762-767`, Flow `:941-946`, Narrate `:461-469`. Each surface's `goTo` discards the promise (`focus/surface.ts:54`, `flow/surface.ts:60`, `narrate/surface.ts:59`). The landing relocate then reaches `onRelocate` (Focus `:815`, Flow `:994`, Narrate `:472`). It records the new cfi in memory, but `resumeAnchor` was just set by `navigateTo`, so `shouldPersistRelocateProgress` (`hasEngaged && !hasResumeAnchor && !userBrowsing`, `helpers/persistentReadingAnchor.ts:82-93`) returns false. Nothing saves the new cfi.
  - **Seen live.** JUMP-LANDING-SAVE-1 check (e) saved position 69100 with `epubcfi(/6/32!/4/2[pgepubid00018],/16/386/1:4,/22/312/1:4)`, a section-15 range, after Next chapter into section 16. A reopen goes by cfi first, so it can land in the old section.
  - **No cursor in Focus.** Nothing in `go-to-href` or in the landing paints. Focus paints a paused cursor only through `paintArrivalCursor` (`:877-882`, armed by a mode handover only) and BAND-ALIGN-2's `moveReadingWord` (`:799-811`, the keys). A paused engine keeps its own word (`pause()` keeps `this.engine`, `:564-574`). `navigateTo` does not retarget it, so Play after a jump can resume in the old section.
  - **The landing relocate fires before `view.goTo` resolves** (code reading, foliate-js 1.0.1). `view.goTo` awaits `renderer.goTo` (`node_modules/foliate-js/view.js:447-457`). In a scrolled renderer, a navigation scroll is not animated: `#scrollTo` calls `#afterScroll` at once (`paginator.js:924-948`), which dispatches `relocate` (`:987-1004`). `view.js#onRelocate` re-emits it synchronously (`:316-325`). A locked renderer returns with no relocate (`paginator.js:1057-1060`). `view.goTo` catches its own errors and never rejects. Focus is always scrolled (`focus/FoliateView.tsx`, "Focus is always scrolled"). Done-when 1 measures this order on the control before any code changes (LL-142).
  - **Page is the model.** JUMP-LANDING-SAVE-1 fix C makes Page's `navigateTo` a no-op on an EPUB (`page/ModeRuntime.ts:352-358` on `8a7c9db6`), and the landing saves. This item applies the same model to each other mode, in that mode's own copy.
- **Design (tier 1, decided here):**
  1. **Defer the commit to the landing, as Page does.** On an EPUB, `navigateTo` only records the entry's word (`pendingJumpWord`). `go-to-href` takes that word into a landing record `{ word, cfi: null }`, replacing any earlier landing. While the landing record is armed, `onRelocate` stores `detail.cfi` in it, after the existing cfi write. It then returns before the passive highlight and before `scheduleRelocateSave`. Without this early return, a debounced relocate save could overwrite the landing save with an estimated word.
  2. **The landing completes when `surface.goTo` resolves, if it is still the current landing and a cfi was captured.** It runs the old `navigateTo` body with the landed cfi: `commitShared(word, "explicit-navigation", landing.cfi)`. For Narrate, it then restarts the engine if playing (unchanged). A landing with no captured cfi (the jump never moved), or a runtime no longer alive, changes and saves nothing. Each surface's `goTo` returns `Promise<void>`.
  3. **Focus only, the owner's ruling.** After the landing commit, while not playing:
     - if a paused engine exists, call `this.engine.jumpTo(word)`;
     - then set `arrivalCursorPending = true` and call `paintArrivalCursor()`, which paints `publishedHighlightedWordIndex` with the paused cursor (`"flow"`, `allowMotion: false`, as BAND-ALIGN-2's keys do);
     - if it did not paint, retry once after `FOCUS_SURFACE_LOAD_DELAY_MS`. `onSurfaceLoad` also retries, as it already does.
  4. **Which word is "the chapter's first word".** It is the entry's word that the shell passes, which is what Page's tocChapterStep and Focus's play already use. With full-book words this is the section's first word, and live (e) showed 69100 "NOTES". **Known limit, not changed here:** a contents entry that points into the middle of a section (an href with a fragment) gets its section's first word, because `resolveTocWordIndex` maps by section only. Changing that is a `ReaderContainer.tsx` change; see Owner question 3. Done-when 1 counts such entries in both books.
  5. Page, the shell, `tocChapterStep` and the non-EPUB path are unchanged. Without foliate, `navigateTo` commits and saves at once, as today.
- **Prerequisites:**
  - JUMP-LANDING-SAVE-1 (built and held at `8a7c9db6`). Its fix B makes foliate chapter steps move at all; on its control they are dead.
  - BAND-ALIGN-2 (built and held at `85e32777`, carrying BAND-ALIGN-1, FOCUS-KEYS-FIX-1, FLOW-KEYS-FIX-1 and FLOW-PARA-KEYS-1). It rewrites Focus's and Flow's runtime and view, including the paused-cursor paint this item reuses.
  - This item unblocks BAND-ALIGN-2's Done-when 7 contents-jump check, which is run here (Done-when 5).
- **Done when** (every command in `pwsh` from the worktree root; `<base>` is the base merge commit recorded in the memo):
  1. **Base measurement, no code change (LL-142, LL-152).**
     - Build two packaged apps, each from a clean `git archive` copy with real `node_modules`, using `npm run build`, then `npx electron-builder --win --arm64 --dir --publish never`:
       - the **control**, from `<base>`;
       - later, the **fixed** build, from the tip, with the same recipe.
     - Use a fresh scratch profile per run, proved with `app.getPath('userData')` over the inspector before the first input (LL-165). Hash the live-profile `library.json` and `settings.json` before and after, unchanged. Refuse an inspector port that already answers.
     - On *Meditations* (the JUMP-LANDING-SAVE-1 sample) in each of Focus, Flow and Narrate, all paused, run (i) Next chapter from section 15, (ii) Previous chapter, and (iii) a contents-list jump to "THE SECOND BOOK". Then quit through the app: schedule `app.quit()` and detach every debugger client first, as JUMP-LANDING-SAVE-1 Live finding 1 showed. Reopen on the same profile.
     - Record per action:
       - every `update-doc-progress` save, through an IPC hook: position and cfi spine step;
       - `library.json` 4 s later;
       - whether the foliate view's `relocate` fired before `view.goTo` resolved, through a CDP wrapper on the view element;
       - in Focus, whether a span with that `data-word-index` carries a cursor class within 10 s;
       - the section and word the reopen shows.
     - Read state, not screenshots (LL-166).
     - Also count, in both books' contents lists, the entries whose href has a fragment and the entries that share a section with another entry.
     - Save to `docs/studies/investigations/CHAPTER-STEP-CFI-1.base.2026-MM-DD.md`. Save the driver as `CHAPTER-STEP-CFI-1.driver.mjs.txt` (standing rule 52).
     - **Expected on the control:** each mode saves the entry's word with the previous section's cfi, and the Focus span has no cursor class. If a mode already saves the landed cfi, record it and drop that mode from step 3. **If a relocate fires after `goTo` resolves in any mode, stop:** design 2 rests on that order.
  2. **Red first (standing rule 43).** Commit `tests/readerModes/chapterStepLanding.test.ts` on its own. It runs the real router and runtimes over `harness/fakePorts`. The EPUB document is `createFakeDocument()` with `useFoliate: true`, plus a `viewApiRef` stub as in `arrivalCursor.test.ts`, whose `goTo` calls `runtime.onRelocate({ cfi: "cfi:new", fraction: 0.5 })` and then resolves. A prior `onRelocate({ cfi: "cfi:old" })` sets the old cfi. For each of Focus, Flow and Narrate:
     - **(cl1)** `navigateTo(20)`, then `handleCommand({ kind: "go-to-href", href: "ch9.xhtml" })`, then flush. The `persistence.updateDocProgress` calls since the jump equal `[["doc-1", 20, "cfi:new"]]`, and none carries `"cfi:old"`. The base fails by assertion: `[["doc-1", 20, "cfi:old"]]`.
     - **(cl2)** The same, with a `goTo` that resolves without a relocate: no `updateDocProgress` since the jump, and `highlightedWordIndex` is unchanged. The base fails: it saves 20 with `"cfi:old"`.
     - **(cl3), Focus only:** after (cl1), the stub's `highlightWordByIndex` was called with `(20, "flow", { allowMotion: false })`. With a paused engine (play, advance two words, pause before the jump), `engine.getCurrentWord()` is 20 and the next resume tick shows 21. The base fails both.
     - **(cl4) Control:** with `useFoliate: false`, `navigateTo(20)` saves at once, as today. It passes on the base and after.
     - **(cl5) Control:** no `persistence.scheduleRelocateSave` call is made by the landing relocate. It passes on the base too, because `resumeAnchor` is set there; after the fix it guards the early return.

     Record the failing output in the memo. Reach new names only through behaviour, so the file runs on the base.
  3. **The change, in each mode's own files** (no sibling import):
     - **`src/reader/modes/<mode>/surface.ts`** (Focus `:31`, `:54`; Flow `:35`, `:60`; Narrate `:36`, `:59`): `goTo(href: string): Promise<void>`, implemented as `Promise.resolve(api()?.goTo(href)).then(() => undefined)`.
     - **`navigateTo`** (Focus `:723`, Flow `:896`, Narrate `:441`): if `this.document.useFoliate`, set `this.pendingJumpWord = wordIndex` and return. Otherwise run today's body.
     - **The `go-to-href` case** (Focus `:762`, Flow `:941`, Narrate `:461`): keep today's lines. Before `goTo`:
       - build `const landing = { word: this.pendingJumpWord, cfi: null as string | null }`;
       - clear `pendingJumpWord`;
       - set `this.landing = landing`;
       - then `void this.surface.goTo(href).then(() => this.completeLanding(landing))`.
     - **`onRelocate`** (Focus `:815`, Flow `:994`, Narrate `:472`): after the existing cfi write, if `this.landing` is set, store `this.landing.cfi = detail.cfi`, call `s.notify()` and return.
     - **`completeLanding(landing)`, a new private method in each mode:**
       - return if not alive, if `this.landing !== landing`, if `landing.word == null` or if `landing.cfi == null`;
       - clear `this.landing`;
       - call `this.commitShared(landing.word, "explicit-navigation", landing.cfi)`;
       - Narrate: then `if (this.state.playing && this.engine) this.engine.play(this.state.currentWordIndex, "navigate")`, moved unchanged from its `navigateTo`;
       - Focus: then design 3;
       - finally `this.state.notify()`.

       If `goTo` resolves with no captured cfi, clear `this.landing` too, so later relocates take the normal path.
     - **`stop()`** in each mode clears `landing` and `pendingJumpWord`.
     - Do not edit `ReaderContainer.tsx`, `ReaderModeAdapter.ts`, `src/types.ts`, Page or `main/`.
  4. **Tests.**
     - `npx vitest run tests/readerModes/chapterStepLanding.test.ts tests/readerModes tests/readerModeIsolation.test.ts tests/chapterStep.test.ts` exits 0.
     - The JUMP-LANDING-SAVE-1, BAND-ALIGN-2, FOCUS-KEYS-FIX-1, FLOW-KEYS-FIX-1 and FLOW-PARA-KEYS-1 tests are green and unedited, or named under standing rule 50. A test that pins the early save on an EPUB is named, not edited.
     - `git grep -n "pendingJumpWord" -- src/reader/modes/focus/ModeRuntime.ts src/reader/modes/flow/ModeRuntime.ts src/reader/modes/narrate/ModeRuntime.ts` exits 0, with hits in all three files. On `<base>` it exits 1.
  5. **After measurement, on the fixed build,** with the same recipe, book, actions and probe as step 1 (LL-152):
     - **(a)** In each mode, each of (i)–(iii) makes exactly one save: the entry's word with a cfi whose spine step is the landed section's, and `library.json` agrees.
     - **(b)** The reopen opens on that section and word.
     - **(c)** In paused Focus, the entry's word span carries the paused cursor class within 10 s, and Play shows that word first. This is BAND-ALIGN-2 Done-when 7's contents-jump check; record it against that item too.
     - **(d)** In Focus, paused after playing, Play after the jump resumes at the entry's word, not the old section's word.
     - **(e)** The control fails (a) and (c) as recorded in step 1.

     A save with a cfi from another section stops the item, with that save.
  6. `npm test`, `npm run typecheck` and `npm run build` exit 0 on the owner's machine (standing rules 47 and 48).
  7. **Package verification (standing rule 53):** run (a)–(e) of the rule on the fixed build, with `origin/main` merged in, built `--arm64 --dir` in this worktree:
     - a 25 s scratch-profile native launch with no error line;
     - `npx asar list` and the `dist/` match;
     - the automatable checks of step 5 re-run on the packaged exe.

     The memo gets a "Package verification" section. Blurby.Brain confirms before any merge go.
  8. **Fence:** `git diff --name-status <base>` lists exactly the following, plus `docs/studies/investigations/CHAPTER-STEP-CFI-1.*`, the staging memo and the time log (standing rule 41):
     - `M src/reader/modes/focus/ModeRuntime.ts`, `M src/reader/modes/flow/ModeRuntime.ts` and `M src/reader/modes/narrate/ModeRuntime.ts`;
     - `M src/reader/modes/focus/surface.ts`, `M src/reader/modes/flow/surface.ts` and `M src/reader/modes/narrate/surface.ts`;
     - `A tests/readerModes/chapterStepLanding.test.ts`.

     Nothing in `main/`, `src/types.ts`, `src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/reader/modes/page/` or `ReaderModeAdapter.ts`.
  9. **Owner (next smoke, added to gate (2)'s list):** in Focus, a contents jump shows the paused cursor on the chapter's first word, and Play starts there. After quitting and reopening in Focus, Flow and Narrate, the book opens in the jumped-to chapter.
- **Effort:** M.
- **Owners:** the implementation agent; reviewers for spec compliance and quality, in parallel; Blurby.Brain for rule 53; the owner at the next smoke.
- **Source:** JUMP-LANDING-SAVE-1 staging memo, live check (e) and Live findings 2 and 3 (`8a7c9db6`); BAND-ALIGN-2's live finding (2026-10-23); the owner's tier-3 ruling 2026-10-23, "First word of chapter".
- **Path:** dispatch.

##### Owner questions (none block dispatch; the spec is built around the current answer)
1. **Flow and Narrate after a contents jump.** The ruling names Focus only, so this item changes only their save. Their cursor and reading word behave as today.
   - Options: (A) a follow-up gives Flow the same paused cursor on the chapter's first word (Narrate already restarts there when playing); (B) leave them as they are.
   - **Recommendation: A**, as a stub after this item, once Done-when 1 has recorded what Flow shows today.
2. **A contents jump while Focus is playing.** Today the running engine keeps reading its own word while the view moves. This item leaves the playing case unchanged.
   - Options: (A) retarget the running engine to the chapter's first word, as Narrate already does; (B) pause on the jump; (C) leave it.
   - **Recommendation: A.** It matches the ruling's intent and Narrate. It is about three lines in `completeLanding` and would join this item if ruled before dispatch.
3. **Contents entries inside a section** (href with a fragment). These get the section's first word as their reading word, because `resolveTocWordIndex` maps by section.
   - Options: (A) a follow-up in the `ReaderContainer.tsx` integration window resolves a fragment entry to its own first word; (B) accept section starts.
   - **Recommendation: A only if** Done-when 1's count finds such entries in the test books; otherwise B.

##### Implementation detail
- **Edit sites:** listed under Why and Done-when 3, read at `85e32777` (Focus, Flow and Narrate files are identical at `<base>`: neither `8a7c9db6` nor `origin/main` @ `d2a70ff1` changes them). Re-grep at `<base>` (standing rule 36):

  ```
  git grep -n -E "navigateTo\(wordIndex: number\)|\"go-to-href\"|this.surface.goTo\(command.href\)|onRelocate = |private paintArrivalCursor|private commitShared" -- src/reader/modes/focus/ModeRuntime.ts src/reader/modes/flow/ModeRuntime.ts src/reader/modes/narrate/ModeRuntime.ts
  git grep -n -E "goTo\(href" -- src/reader/modes/focus/surface.ts src/reader/modes/flow/surface.ts src/reader/modes/narrate/surface.ts
  ```
- **Tests:** the new red file; the existing `tests/readerModes/`, `tests/readerModeIsolation.test.ts` and `tests/chapterStep.test.ts`, unedited.
- **Constants:** none new. The retry reuses `FOCUS_SURFACE_LOAD_DELAY_MS`.
- **Branch:** `eb/chapter-step-cfi-1`, the stacked base:
  1. `git switch -c eb/chapter-step-cfi-1 origin/eb/band-align-2` (@ `85e32777`).
  2. `git merge --no-ff origin/eb/jump-landing-save-1` (@ `8a7c9db6`). `git merge-tree` is clean.
  3. `git merge --no-ff origin/main` (@ `d2a70ff1` or later). The one expected conflict is `docs/governance/BUG_REPORT.md`, between BAND-ALIGN-2's BUG-217 entry and `main`'s edits. Keep both sides' entries (tier 1). No source file conflicts.

  Record this merge as `<base>`. Push with `git push origin HEAD:refs/heads/eb/chapter-step-cfi-1`; do not merge (Stage 8 freeze).
  - **Why this base:** BAND-ALIGN-2 rewrites Focus's and Flow's runtimes and views, and owns the paused-cursor paint this item reuses. JUMP-LANDING-SAVE-1 makes foliate chapter steps move, without which (i) and (ii) cannot be checked. Neither contains the other.
  - `git merge-tree` of BAND-ALIGN-2 with FLOW-PARA-PAUSE-INDEX-1 (`f61ae02d`) is clean, and so is JUMP-LANDING-SAVE-1's. Re-run it against this tip before close-out.
- **Merge order (after the release):** JUMP-LANDING-SAVE-1's page chain (TOC-JUMP-SAVE-1 → PAGE-HELD-TURN-FAIL-1 → PAGE-SAVE-RESTAMP-3 → JUMP-LANDING-SAVE-1); the keys and band chain through BAND-ALIGN-2; FLOW-PARA-PAUSE-INDEX-1 with BLOCK-TAG-CASE-1; then this branch last. A fresh rule 53 check is needed if `main` moves past docs before then.
- **Waves (dispatch sizing):** Wave A is tasks 1–4 (measure, red, fix). Wave B is tasks 5–6 (after measurement, gates, package verification, memo, push).
- **Staging plan:** explicit paths only. `tests/perf-baseline-results.json` and the Timing backfills of other items stay unstaged.
- **Failure handling:**
  - If a relocate lands after `goTo` resolves (Done-when 1), stop and report the order per mode; the planner amends design 2.
  - If the Focus cursor does not paint within 10 s after the fix, record the `highlightWordByIndex` return values and stop.
  - Rollback: `git revert -m 1 <merge>`.
- **Shared-core touches:** none. The shell's dispatch in `ReaderContainer.tsx` already does what is needed (`navigateTo` then `go-to-href`); the fix is mode-local.
- **Lane:** Reader Engine. Execution surface A.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Control build measured in Focus, Flow and Narrate: saves, reopen, relocate order, Focus cursor, contents census | calculable | measurement | bounded | medium | 55m | — | — |
| 2 | Red file (cl1–cl5) committed alone, failures recorded | calculable | positive control | bounded | low | 25m | — | — |
| 3 | Landing save in Focus, Flow and Narrate; surfaces return the jump's promise | calculable | bug fix | bounded | medium | 45m | — | — |
| 4 | Focus landing paints the paused cursor and retargets a paused engine | calculable | bug fix | bounded | medium | 25m | — | — |
| 5 | Fixed build measured with the same recipe; reopen and BAND-ALIGN-2 contents-jump check | calculable | measurement | bounded | medium | 45m | — | — |
| 6 | Suite, typecheck, build, rule 53 package verification, reviews, memo, time log, push | calculable | verify | bounded | medium | 50m | — | — |

##### Lessons applied
- **LL-142:** the old-cfi save and the relocate order are measured on the control before any change; the design's reliance on relocate-before-resolve is checked, not assumed.
- **LL-152:** the control and fixed builds use the same recipe, book, actions and probe.
- **LL-165:** every live launch proves its scratch profile before the first input and refuses a busy inspector port.
- **LL-166:** each verdict reads saves, `library.json`, runtime state and span classes, not screenshots.
- **Standing rule 53:** package verification on an `--arm64 --dir` build with Blurby.Brain's confirmation before any merge go.
- **Standing rule 43:** the red file goes first, with controls for the non-EPUB path and the relocate-save guard.
- **Standing rule 50:** a pinned test that asserts the early save is named, not edited.
- **Standing rule 36:** every cited line is re-grepped at `<base>`.
- **Standing rule 41:** the fence exempts the time log.
- **Standing rules 47 and 48:** full suite, typecheck and build on the owner's machine.
- **Standing rule 52:** the driver is saved as `.txt`.
- **Standing rule 51:** this specification appends no lesson-status line.
