#### FLOW-TOC-JUMP-WORD-1 — After a contents jump, Flow makes the chapter's first word the reading word *(live Seq 110; Full Spec 2026-11-03, cited against `origin/main` `c5bb507f`; Reader Engine; after CHAPTER-STEP-CFI-1 (amendment 1); not a release gate)*

- **What:** in flow reading (Flow `ModeRuntime`), on an EPUB, when a contents-list jump or a Previous or Next chapter step lands, Flow makes the chapter's first word the reading word:
  - **Paused:** the word carries Flow's paused cursor (the `"flow"` highlight with no motion), and Play starts from it.
  - **Playing:** the engine and the scroll engine jump to that word and keep playing. This mirrors the owner's question 2 ruling for Focus ("keep playing") on CHAPTER-STEP-CFI-1.
  - **Out of scope:**
    - which word or cfi is saved (CHAPTER-STEP-CFI-1);
    - Focus and Narrate (CHAPTER-STEP-CFI-1);
    - mid-section contents entries (TOC-FRAGMENT-WORD-1);
    - Page;
    - non-EPUB documents, whose `navigateTo` path is unchanged.
  - **Outcome:** on a packaged build, after a contents jump in paused Flow, the chapter's first word shows the paused cursor within 10 s, and Play reads from it.
- **Why:**
  - **Owner ruling 2026-10-23:** "Yes, as a follow-up" to CHAPTER-STEP-CFI-1. The ruling gives Flow the same cursor on the jumped-to chapter's first word that Focus gets there.
  - **Flow paints a paused cursor only in two places:**
    - its keys, through `moveReadingWord` (`flow/ModeRuntime.ts:1026-1038` at `c5bb507f`). Paused, it sets `explicitSelectionAnchor` and `currentWordIndex`, publishes the word, and calls `surface.highlight(word, "flow", { allowMotion: false })`. Playing, it calls `engine.jumpTo` and `scrollEngine.jumpToWord`.
    - a mode handover, through `paintArrivalCursor` (`:1100-1105`), retried by `onSurfaceLoad` (`:1081-1095`).
  - **Nothing in the jump path calls either one.** That holds today and after CHAPTER-STEP-CFI-1, whose `completeLanding` gives Flow only the save. So after a jump, Flow shows no cursor, and Play resumes from the old `currentWordIndex`.
  - **The CHAPTER-STEP-CFI-1 control run** (base memo, 2026-10-23) recorded Flow landing on 69100 / 63019 / 9431 with no cursor probe, because Flow was out of its scope. This item adds that probe.
- **Design (tier 1, decided here):**
  - In Flow's `completeLanding` (created by CHAPTER-STEP-CFI-1 amendment 1), call `this.moveReadingWord(landing.word)` after the landing commit and before `this.state.notify()`.
  - **The fallback when the highlight cannot paint yet:** `moveReadingWord` paints only when `this.surface.isReady()`. When it is not ready, or `surface.highlight` returns false (spans not stamped yet):
    1. set `this.arrivalCursorPending = true`;
    2. call `this.paintArrivalCursor()`, which paints `publishedHighlightedWordIndex`, the word just published;
    3. retry once after `FLOW_SURFACE_LOAD_DELAY_MS`. `onSurfaceLoad` also retries, as it already does.
  - No new state and no new constant. The one existing paint path is reused, so the cursor matches Flow's keys exactly.
  - The cursor style follows Flow's keys exactly. Flow's ModeView has no separate "focus" cursor.
- **Prerequisites:** CHAPTER-STEP-CFI-1 merged, with its `completeLanding` in Flow (amendment 1). Both items edit `flow/ModeRuntime.ts`, so this one is cut from `origin/main` after CHAPTER-STEP-CFI-1's merge.
- **Execution host:** RodneySr (x64) implements and runs the tests. The arm64 package build, launch and live checks run on Rodney (rule 6b; standing rule 53).
- **Done when** (every command in `pwsh` from `C:\Projects\Blurby\.worktrees\flow-toc-jump-word-1`; branch `eb/flow-toc-jump-word-1` from `origin/main`; `<base>` recorded in the memo):
  1. **Re-grep (standing rule 36):** Flow `completeLanding`, `moveReadingWord`, `paintArrivalCursor`, `onSurfaceLoad` and `FLOW_SURFACE_LOAD_DELAY_MS` at `<base>`. Record the lines.
  2. **Red first (standing rule 43):** commit alone `tests/readerModes/flowTocJumpWord.test.ts`. Use the harness of `tests/readerModes/chapterStepLanding.test.ts`: the real router and Flow runtime over `harness/fakePorts`, `useFoliate: true`, and a `viewApiRef` stub whose `goTo` relocates and resolves.
     - **(ft1) Paused:** `navigateTo(20)`, `go-to-href`, flush. The stub's `highlightWordByIndex` was called with `(20, "flow", { allowMotion: false })`, and `state.currentWordIndex` is 20. Then `start({ cause: "play-button" })`: the engine's first word is 20.
     - **(ft2) Playing:** play, advance two words, then jump. The engine's current word is 20, and `playing` is still true.
     - **(ft3) Spans not ready:** the stub's `highlight` returns false on the first call. After advancing `FLOW_SURFACE_LOAD_DELAY_MS` (reached through behaviour: advance 300 ms), it was called again with 20.
     - **(ft4) Control:** a landing with no relocate (CHAPTER-STEP-CFI-1's (cl2) stub) moves nothing. `highlightWordByIndex` is not called with 20, and `currentWordIndex` is unchanged. It passes on the base and after.
     - **(ft5) Control:** with `useFoliate: false`, the jump path is unchanged.

     Record the failing output: (ft1)–(ft3) fail by assertion on the base.
  3. **The change:** only `src/reader/modes/flow/ModeRuntime.ts`, `completeLanding` plus the fallback in the design. No sibling-mode import.
  4. `npx vitest run tests/readerModes/flowTocJumpWord.test.ts tests/readerModes tests/readerModeIsolation.test.ts` exits 0. The CHAPTER-STEP-CFI-1, BAND-ALIGN-2 and FLOW-KEYS-FIX-1 tests are green and unedited.
  5. **Live, on the packaged arm64 build:** use CHAPTER-STEP-CFI-1's driver and recipe (LL-152), with a scratch profile proved before the first input (LL-165). On *Meditations*, in paused Flow, run (i) Next chapter, (ii) Previous chapter and (iii) a contents jump to "THE SECOND BOOK". Then:
     - **(a)** the entry's word span carries the paused cursor class within 10 s;
     - **(b)** Play reads that word first;
     - **(c)** CHAPTER-STEP-CFI-1's single save per jump still holds.

     State, not screenshots (standing rule 55).
  6. `npm test`, `npm run typecheck` and `npm run build` exit 0.
  7. **Package verification (standing rule 53):** `--dir --arm64` build of the final commit with `origin/main` merged; a 25 s scratch-profile launch with no error; asar contents checked; step 5 re-run on the packaged exe; a "Package verification" section in the close-out; Blurby.Brain1 confirms before the merge go.
  8. **Fence:** `git diff --name-status <base>` lists exactly the following, plus the memo, staging memo and time log:
     - `M src/reader/modes/flow/ModeRuntime.ts`;
     - `A tests/readerModes/flowTocJumpWord.test.ts`.

     Nothing in `ReaderContainer.tsx`, `FlowScrollEngine.ts`, `src/types.ts`, Focus, Narrate, Page or `main/`.
  9. **Owner (added to release gate (2)'s list):** in Flow, a contents jump shows the paused cursor on the chapter's first word, and Play starts there.
- **Effort:** S. Technical effort: low.
- **Owners:** the implementation agent; spec-compliance then quality review; Blurby.Brain1 for rule 53; the owner at gate (2).
- **Source:**
  - owner ruling 2026-10-23 (roadmap review 2026-10-23-5, owner question 1, recommendation A);
  - CHAPTER-STEP-CFI-1 base memo (`796282c2`) and [amendment 1](CHAPTER-STEP-CFI-1.amendment-1.md).
- **Path:** dispatch.

##### Lessons applied
- **LL-142:** the cursor is measured live, not assumed from the unit stub.
- **LL-152:** one recipe.
- **LL-165:** scratch profile.
- **Standing rule 55 (promoted from LL-166):** state, not screenshots.
- **Standing rule 53 (promoted from LL-167):** package verification.
