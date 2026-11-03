#### FOCUS-PAUSED-HANDOFF-1 — Focus shows the correct word immediately on entry *(Seq 118; Full Spec 2026-11-03, cited against RC tip `70d64237`; owner ruling 2026-11-03, design batch #22 and #23; Reader Engine; proposed P1; diagnosis first: Wave A is dispatch-ready, and Wave B is specified by amendment from Wave A's verdict)*

- **What:** when Focus is entered from a paused mode, the word it shows before Play is the word the owner ruled correct. Play, pausing again and reopening the book all keep that word.
  - The item runs in two waves.
  - **Wave A (dispatch-ready):** a read-only diagnosis on the packaged build. It tries the hand-off into paused Focus from each paused mode, Page, Flow and Narrate, along fixed paths, and returns a verdict among the hypotheses below.
  - **Wave B (fix):** the planner writes an amendment from Wave A's verdict, using the fix direction pre-stated for that verdict below. It is dispatched once the amendment passes readiness.
- **Out of scope:**
  - Focus mask removal and the word-only view (FOCUS-WORD-ONLY-1). FOCUS-WORD-ONLY-1's card says this item "remains a distinct diagnosis and is not certified fixed by mask removal" (ROADMAP.md, FOCUS-WORD-ONLY-1 Prerequisites).
  - Chapter-jump landing.
  - Carrying any Focus fix to Flow's identical arrival code, which would be a separate item (reading-mode isolation).
  - The `displayWordIndex` → 0 clamp (Investigation item 7), unless the trace implicates it.
- **Why (investigation, 2026-11-03, on `70d64237`; all paths under `src/reader/` unless stated):**
  - **The stub (ROADMAP `#focus-paused-handoff-1`).** Switching from Page to paused Focus first shows the wrong word, and Play corrects it. Nothing yet shows whether the display or the position is stale.
  - **Readiness requirement.** "a real-view re-stamp/arrival trace distinguishing stale painted highlight from stale canonical position" (`docs/planning/roadmap-reviews/2026-10-26-readiness.md:88`).
  - **Reproduction status.** RodneySr did not reproduce it on 2026-10-31 (`docs/planning/roadmap-reviews/2026-10-31-handoff-upcoming-work.md:62`). The owner's exact steps were requested (`:81`), and none were given (design batch #23).
  1. **The hand-off.**
     - The router mounts the target runtime and calls `runtime.select(handoff.canonicalWordIndex)` (`useReaderModeOrchestrator.ts:281-290`, `:289`). The hand-off is built from the outgoing runtime's `exportHandoff` (`:302`).
     - Each source builds its hand-off in its own `exportHandoff`: Page at `modes/page/ModeRuntime.ts:276-291`, Flow at `modes/flow/ModeRuntime.ts:827-844`, Narrate at `modes/narrate/ModeRuntime.ts:401-417`.
     - Page's `hardSelect` (`page/ModeRuntime.ts:305-345`) sets the explicit-selection and resume anchors.
     - Page's `onPageTurned` (`:579-599`) clears the held click and the explicit anchor and saves the first word of the new page. A held click (`onHeldClickSave`, `:611-624`) saves the clicked word.
     - Focus is entered by the bottom bar's "Focus mode" button (`components/ReaderBottomBar.tsx:342-349`) from any mode. From Page it is also entered by Space when the remembered mode is Focus (`hooks/useKeyboardShortcuts.ts:249`). Both routes call `handleSelectMode("focus")` (`useReaderModeOrchestrator.ts:97-111`).
  2. **Paused entry.** Focus's `select()` (`modes/focus/ModeRuntime.ts:500-516`):
     - sets `currentWordIndex`;
     - calls `anchor.syncVisualToPersistentWord({ navigate: false })` (`helpers/usePersistentReadingAnchor.ts:107-116`), which copies the persistent word into the resume anchor and the highlighted, soft and published indexes;
     - queues a double animation frame that repeats the sync with `navigate: true` (`queuePostModeAnchorSync`, `:1145-1159`).
  3. **What the paused view shows.**
     - While paused, the RSVP overlay is not rendered (`modes/focus/ModeView.tsx:304`, `useFoliate && playing`), so the reader sees only the foliate page.
     - The cursor on that page is painted once, by index. `paintArrivalCursor` (`ModeRuntime.ts:925-930`) calls `surface.highlight(publishedHighlightedWordIndex, "flow", { allowMotion: false })`, which adds `page-word--flow-cursor`. It runs at `onSurfaceLoad` and again after `FOCUS_SURFACE_LOAD_DELAY_MS` (200 ms; `:353`, `:907-922`).
     - It clears `arrivalCursorPending` on its first success, so it never repaints.
     - The arrival scroll aligns the span whose `data-word-index` equals `highlightedWordIndexRef` (`modes/focus/FoliateView.tsx:1176-1194`).
  4. **Spans can be renumbered after that paint.**
     - When full-book sections arrive, `restampVisibleSections` (`FoliateView.tsx:1243-1264`) unwraps and re-wraps each visible section with canonical indexes. It neither repaints the arrival cursor nor notifies the runtime.
     - Before the re-stamp, a section can carry provisional (renderer-numbered) indexes. The book-stamped set (`FoliateView.tsx:315`, `:823-825`, `:1252`, `:1257`) records which documents are canonical, and the arrival paint does not consult it.
  5. **Play re-derives the word.** `start()` (`ModeRuntime.ts:519-591`) works through these steps:
     - `consumeModeStartAnchor()` (`:1121-1137`: explicit, then resume, canonical, highlighted, soft);
     - then `resolveFoliateStartWord`;
     - then, when the index is beyond the loaded slice and there are no full-book words, the first visible word (`:571-575`);
     - then it publishes the highlight and starts the RSVP overlay.

     Play can therefore show a different word from the paused paint even when the canonical index never changed.
  6. **Passive relocates are suppressed** while a resume anchor exists (`onRelocate`, `:863-905`). Without a resume anchor, a relocate publishes `floor(fraction × wordCount)`, which is an estimate.
  7. **The display index can collapse to 0.** `jumpDisplayToWord` (`:1225-1228`) clamps to the engine's words or the effective words. Both can be empty on an EPUB without full-book words or a loaded slice. The paused view does not render this index.
  - **Hypotheses (none proven):**
    - **H1, stale paint.** The arrival cursor is painted by index on provisionally numbered spans, or before full-book words arrive. The re-stamp then moves the index to another word, or strips the cursor class, and nothing repaints it. *Predicts:* the canonical index is correct throughout; the painted span's text differs from the intended word; a re-stamp pass touches the painted document after the paint.
    - **H2, a stamp mismatch.** Canonical stamping does not match the DOM text for that section (LL-170), so even a book-stamped paint lands on the wrong word. *Predicts:* the painted span carries the canonical index but different text, and the error persists on Play in the same section.
    - **H3, a stale anchor.** The source hands over a word other than the intended one (for example after a held click followed by page turns, or a stale resume anchor), and Play corrects it through the first-visible fallback. *Predicts:* `handoff.canonicalWordIndex` is not the intended word, and `start()` takes the `:571-575` branch.
- **Design (settled):**
  - **Recorded ruling, design batch #22 (owner ruling 2026-11-03).** When Focus is entered from a paused mode, it starts on the word you clicked; otherwise, on the first word on the page. This replaces the draft's open question 2 with option (a). For a Page source, the intended word is:
    - the word clicked (explicit selection or held click) since the last page turn;
    - otherwise the first word of the page on screen, which is the word Page saves on a turn (`onPageTurned`).

    This is the same word Page persists, so "correct on entry", "correct after a pause" and "correct after reopen" all name one word.
  - **Applying #22 to Flow and Narrate sources.** A word clicked while paused is "the word you clicked". With no click, the trace records two candidates: the paused cursor word (the source's `publishedHighlightedWordIndex`, which today's hand-off carries) and the first visible word on screen.
    - **Planner's reading:** in Flow and Narrate, the paused cursor is the visible marked word, which plays the role a click plays in Page. Focus starts on it, and "first word on the page" applies when nothing is marked.
    - This reading changes nothing in today's Flow and Narrate hand-offs. If Wave A shows that a Wave B fix would change a Flow- or Narrate-sourced entry, the amendment raises this reading with the owner first. It is a design question, not Brain1's.
  - **Recorded ruling, design batch #23.** No reproduction steps were given. Wave A therefore keeps the diagnosis-first route, and the run must itself try the hand-off from each paused mode (Page, Flow and Narrate) along the fixed path matrix below.
  - **Trace channel, read-only.** No source change:
    - The packaged renderer already logs every runtime diagnostics transition (for example `resumeAnchor:set`) as `[DUAL-SOURCE-DIAG]` console lines when the scratch profile's `localStorage.BLURBY_DUAL_SOURCE_DIAG === "1"` (`components/ReaderContainer.tsx:362`, `utils/dualSourceDiag.ts:58-90`).
    - The DOM side is read through CDP `Runtime.evaluate`, by a `MutationObserver` on each foliate section document. It records the `page-word--flow-cursor` / `page-word--highlighted` class changes, with each span's `data-word-index` and `textContent` (LL-161). It also records childList passes that remove and re-add `[data-word-index]` spans (re-stamp passes), each with a timestamp.
    - Book-stamped membership is a `WeakSet` in a React ref (`FoliateView.tsx:315`) and cannot be read. Its proxy is "a re-stamp pass touched the painted document after the paint".
- **Prerequisites:**
  - The RC integration window's merge to `main`. Wave A traces a packaged `--dir` build of that merge.
  - Wave A is admitted by Blurby.Brain1 as read-only investigation (T1, 2026-11-03). The conditions:
    - a CDP trace on RodneySr against the packaged RC merge `c5bb507f`;
    - at most 4 optional arm64 rows on Rodney;
    - no source edits;
    - a scratch profile with APPDATA and LOCALAPPDATA redirected;
    - the sample book or synthetic fixtures only, never the owner's own books.
  - **Wave A also reads NARRATE-ARRIVAL-SYNC-1's Focus row,** `tests/readerModes/focus.arrivalSavedPosition.test.ts`. It covers the same arrival-sync class of defect.
    - If that row is RED, it is the leading hypothesis: Narrate's arrival sync failed while the section map loaded. The trace then checks Focus's arrival sync first.
    - If the row is not yet on `main` at the cut, Wave A records that and runs the row from NARRATE-ARRIVAL-SYNC-1's branch.
  - Wave B's prerequisites are:
    - Wave A's verdict;
    - Blurby.Brain1's same-day ruling on the direction the memo chooses (T2: no pre-approval);
    - FOCUS-WORD-ONLY-1 merged, since it owns `modes/focus/FoliateView.tsx` (T3).
- **Done when (Wave A, diagnosis)** (PowerShell 7, from the worktree root; packaged x64 `--dir` build of the RC merge on RodneySr):
  1. **Detector positive control (standing rule 55).** Before any live run, the trace comparator script is run on two hand-made records. One has a painted span text equal to the intended word, and the other has a different text. It prints `match` and `mismatch` respectively and exits 0. Record the output.
  2. **Profile proof (LL-165).** The scratch profile is proved before the first input, and the live-profile hash is unchanged after the run. `localStorage.BLURBY_DUAL_SOURCE_DIAG` is set to `"1"` on the scratch profile only, followed by a reload.
  3. **Path matrix (design batch #23), 12 runs.** All runs use `resources/sample-meditations.epub`, plus one long EPUB of at least 100k words from the owner-safe test corpus, so that full-book words arrive late. The three sources are:
     - **Page**, as opened.
     - **Flow**, entered from Page, played for 3 s, then paused with Space.
     - **Narrate**, entered from Page, played for 3 s, then paused.

     Each source runs four paths:
     - **(p1)** switch to Focus within 2 s of the source being paused (Page: within 2 s of the book opening);
     - **(p2)** the same switch after 10 s;
     - **(p3)** click a word while paused, then switch;
     - **(p4)** move three screens while paused (Page: three page turns with →; Flow and Narrate: three wheel scrolls of one screen each), then switch.

     The switch uses the bottom bar's "Focus mode" button (`[aria-label="Focus mode"]`). In addition, (p1) and (p4) from Page are each run once more with Space, with the remembered mode set to Focus. That gives 12 runs per book plus 2 Space runs.
  4. **Recorded per run** (from the switch until 3 s later, then at a real CDP Space press for Play):
     - the source's intended word per ruling #22: the clicked span's index and text; otherwise, for Page, the first visible span's index and text; for Flow and Narrate, both the paused cursor span and the first visible span;
     - the `[DUAL-SOURCE-DIAG]` lines, including the hand-off's anchors;
     - each `page-word--flow-cursor` paint in Focus, with time, index, text and document;
     - each re-stamp pass, with time and section;
     - at Play, the RSVP overlay's word and the highlighted span's index and text.
  5. **Verdict per run, then overall:**
     - **H1:** the canonical index equals the intended word, the painted text differs, and a re-stamp pass touched the painted document after the paint.
     - **H2:** the painted span's index equals the canonical index, but its text differs from the intended word, with no later re-stamp.
     - **H3:** the hand-off's canonical index differs from the intended word.
     - **Other:** a wrong word fitting none of these, with the trace attached.
     - **Not reproduced:** every run shows the intended word before Play.
  6. **Base control (standing rule 55).** Repeat (p3) and (p4) from Page with **Flow** as the destination (`[aria-label="Flow mode"]`). Flow shares the arrival-paint pattern, so this shows whether a reproduced defect is Focus-only.
  7. **Optional arm64 pass.** If every RodneySr run is "not reproduced", and only with Brain1's admission (T1), run the Page (p1)–(p4) rows once on Rodney's native arm64 package. Rodney is the owner's machine class. This is a brief check under rule 6b.
  8. **Verdict memo.** `docs/governance/close-outs/Diag.FOCUS-PAUSED-HANDOFF-1.<date>.md` contains the per-run table, the overall verdict, the control output and a Lessons section. It is pushed on the branch and returned to Brain1. No source file changes: `git diff --name-status origin/main` lists only the memo and the trace script under `docs/governance/close-outs/evidence/`.
- **Done when (Wave B, fix; the amendment fills in the rows):**
  - **Red first (standing rule 43):** a runtime-level test reproduces the verdict's mechanism, and a control passes.
  - **Live:** the Wave A matrix row that reproduced the defect shows the intended word before Play, at Play, after pausing Focus, and after closing and reopening the book, read as span index and text.
  - **Matrix:** every other matrix row is unchanged.
  - **Gates:** `npm test`, `npm run typecheck` and `npm run build` exit 0 (standing rule 48).
  - **Package:** standing rule 53 package check; Brain1 confirms.
  - **If Wave A's verdict is "not reproduced":** Wave B is not written. The item returns to the register as Blocked, "not reproducible on the matrix", with the memo as evidence, for Blurby.Roadmap to dispose.
- **Effort:** Wave A S. Wave B is unsized until the verdict (provisionally S for H1 or H3, M for H2).
- **Owners:**
  - planner, who writes the Wave B amendment;
  - diagnosis agent (cross-cutting, read-only) on RodneySr;
  - Blurby.Brain1 for T1–T5;
  - for Wave B: implementation agent (bounded, renderer-scope), spec-compliance then quality reviewer, package verifier;
  - owner only if the Flow/Narrate reading of ruling #22 would change behaviour.
- **Source:**
  - The ROADMAP stub `#focus-paused-handoff-1` (`ROADMAP.md:1780-1781`).
  - The readiness requirement (`2026-10-26-readiness.md:88`).
  - The 2026-10-31 hand-off (`2026-10-31-handoff-upcoming-work.md:62`, `:81`).
  - Owner ruling 2026-11-03, design batch #22 and #23 (`docs/planning/roadmap-reviews/2026-11-03-owner-design-batch.md:28-29`, `:38`).
  - The code trace above, on `70d64237`.
- **Path:** dispatch (Wave A as investigation; Wave B by amendment).

##### Implementation detail

- **Wave A trace script (new; evidence only, never under `src/` or `tests/`):** `docs/governance/close-outs/evidence/focus-handoff-trace.mjs`.
  - It connects to the packaged exe's `--remote-debugging-port` and enables `Runtime` and `Log`.
  - It collects console lines that start with `[DUAL-SOURCE-DIAG]`.
  - It injects the `MutationObserver` into each `iframe` section document through `Runtime.evaluate` and pulls its records every 100 ms.
  - It drives input with `Input.dispatchMouseEvent` and `Input.dispatchKeyEvent`.
  - It writes one JSON record per run.
  - The comparator is a pure function in the same file, so Done-when 1 tests the same code that judges the live runs.
- **Wave B fix directions, pre-stated per verdict.** The amendment selects one. Blurby.Brain1 did **not** pre-approve them (T2, 2026-11-03). Wave A's memo returns to Brain1 with the trace and the chosen direction, and Brain1 rules the same day.
  - **H1:**
    - `modes/focus/ModeRuntime.ts` `paintArrivalCursor` (`:925-930`) keeps `arrivalCursorPending` set until a repaint after the last re-stamp of the painted section.
    - The Focus view's `restampVisibleSections` (`modes/focus/FoliateView.tsx:1243-1264`) reports each finished pass to the runtime through a new Focus-only view callback (for example `onSectionRestamped`). While paused and not yet played, the runtime repaints `publishedHighlightedWordIndex` on it.
    - The change stays inside Focus, with no sibling import (reading-mode isolation).
  - **H3:** the source runtime's `exportHandoff` or anchor bookkeeping is corrected so that `canonicalWordIndex` is the ruling-#22 word. For a Page source, that means a held click survives no page turn (`onPageTurned`, `page/ModeRuntime.ts:579-600`) and is otherwise exported. The fix stays inside the source runtime.
  - **H2:** a stamp/DOM mismatch is a word-stamping defect, not a Focus defect. STOP; Brain1 decides whether it becomes its own item under LL-170.
- **Branch:** `eb/focus-paused-handoff-1` from `main` after the RC merge. Wave A commits only the memo and the trace script. Wave B continues on the same branch after the amendment. Push with `git push origin HEAD:refs/heads/eb/focus-paused-handoff-1` (LL-181).
- **Staging plan (Wave A):** `docs/governance/close-outs/Diag.FOCUS-PAUSED-HANDOFF-1.<date>.md` and `docs/governance/close-outs/evidence/focus-handoff-trace.mjs`, by exact path. No merge to `main` until Wave B's close-out.
- **Failure handling (Wave A):**
  - **The detector control does not print `mismatch` on the mismatching record:** STOP. A broken comparator cannot clear the item.
  - **`[DUAL-SOURCE-DIAG]` lines are absent after the flag and the reload:** the hand-off anchors come from the DOM only. Record this and continue, and mark the verdict "index-side unobserved" where it matters.
  - **A run is ambiguous between H1 and H2** (the re-stamp proxy cannot settle it): T5 (Blurby.Brain1, 2026-11-03) admits one second run on a local, uncommitted instrumentation build that logs `bookStampedDocsRef` membership at paint time. Conditions:
    - RodneySr only, in its own worktree;
    - the evidence is copied to the artifacts folder;
    - nothing is committed or pushed;
    - the worktree stays until Wave A's memo is accepted, then is removed as maintenance (rule 10: never wiped on the side).
  - **Live profile hash changed:** STOP (LL-165).
  - **Retry ceiling:** each matrix row is re-run at most once, and only for a harness fault.
- **Execution host:** RodneySr, clone `C:\Users\estra\Projects\Blurby`, worktree `C:\Users\estra\Projects\Blurby\.worktrees\focus-paused-handoff-1`, created with `git -C C:/Users/estra/Projects/Blurby worktree add -b eb/focus-paused-handoff-1 .worktrees/focus-paused-handoff-1 origin/main`.
  - **Host prerequisites:** the RC merge is on `origin/main`; `npm ci`; a `--dir --x64` build of that merge; the sample and the long EPUB available on the scratch profile.
  - Wave A's optional arm64 rows and Wave B's arm64 native launch at merge run on Rodney (standing rule 53).
- **Package verification:** Wave A traces a package and changes none, so its memo records "package unchanged" with the empty `build.files` diff. Wave B uses the full standing rule 53 set:
  - `--dir --x64` and `--dir --arm64` builds from the final commit with `origin/main` merged;
  - a 25 s x64 scratch launch with the LL-165 proof;
  - `npx asar list` showing the changed Focus files;
  - the reproduced matrix row re-run on the package;
  - Brain1's confirmation before the merge go;
  - the arm64 launch at merge on Rodney.
- **Lane ownership:** Reader Engine; execution surface A (runtime). Wave A is read-only.
- **Forbidden during parallel run:**
  - Wave A: every source file.
  - Wave B: `src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`, `src/reader/modes/flow/`, `src/reader/modes/narrate/` (unless the verdict is H3 with that source), `preload.js` and `main/`.
- **Shared-core touches:** none in either wave.
- **Merge order:**
  - Wave A is independent of every item and may run beside other work when RodneySr has capacity.
  - Wave B lands after FOCUS-WORD-ONLY-1, inside the Focus ownership window, and after the held BAND-ALIGN-2 if it is admitted first. Both of those own `modes/focus/FoliateView.tsx`.

##### Blurby.Brain1 rulings (2026-11-03, `C:\Projects\Blurby-artifactsrain1-rulings\Brain1.held-items-TQ.2026-11-03.md`)

- **T1, Wave A admission: approved** as investigation, with the conditions under Prerequisites. The owner's description is enough to trace from: "Page → paused Focus shows the wrong word; Play corrects it".
- **T2, pre-approval of H1/H3: not granted.** The memo brings the trace and the chosen direction, and Brain1 rules the same day. H2 stays a STOP.
- **T3, sequencing: approved.** Wave A is independent. Wave B lands after FOCUS-WORD-ONLY-1, in the Focus ownership window.
- **T4: approved.** The `displayWordIndex → 0` clamp is untouched unless the trace implicates it.
- **T5: approved with a wording change.** Written into Failure handling above.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Trace script and comparator; detector control prints match and mismatch | calculable | positive-control | cross-cutting | medium | 30m | — | A |
| 2 | Packaged RC build, scratch profile proof, diagnostics flag | calculable | packaging-verify | bounded | low | 20m | — | A |
| 3 | Twelve-run Page/Flow/Narrate hand-off matrix on two books plus the Space runs and the Flow-destination control | calculable | diagnosis | cross-cutting | high | 60m | 90m | A |
| 4 | Verdict memo returned to Brain1; push | calculable | docs | bounded | low | 15m | — | A |
| 5 | Wave B fix per verdict (amendment-defined) | — | ui-fix | bounded | medium | unsized until the verdict | — | B |

**Total:** Wave A chain 2h05m · sum 2h05m; 0 of 4 estimated Wave A tasks calibrated (priced by planner estimate). Wave B is unsized until the verdict.

##### Lessons applied

- **LL-161:** every paint and hand-off reading records the span's index and its text, never the index alone.
- **LL-170:** H2 is the stamp/DOM correspondence. A mismatch is routed out of Focus.
- **LL-174:** each hop from the source's `exportHandoff` to the Focus paint is a trace point and a candidate edit site.
- **LL-165:** scratch-profile proof and the live-profile hash.
- **Standing rule 53 (LL-167):** Wave A records "package unchanged"; Wave B gets the full package pair and the arm64 launch on Rodney.
- **LL-151 / LL-166 / standing rule 55:** the comparator's positive control and the Flow-destination base control.
- **LL-158 / standing rule 54:** each live row names its trigger (a real CDP click, key or mode-button press) and reads the DOM after it.
- **Standing rule 43 (LL-138):** Wave B's tests go red first, once the cause is known.
- **Standing rule 48 (LL-149):** Wave B's typecheck and build.
- **Rule 6a:** no fix is specified before the verdict. Wave B is written as an amendment, not guessed.
- **LL-181:** worktree placement and the push refspec.
- **Not applicable:** the Narrate word-table lessons (LL-142, LL-160); Narrate is only a hand-off source here and its engine is untouched. Also not applicable: registry/Notion (LL-154, 155, 163, 171, 172), quit/flush (LL-157, 159) and evidence encoding (LL-175–180).
