#### CFI-POSITION-CONSISTENCY-1 — A saved word and its saved page never disagree, so a book reopens where you left it *(Seq 97.5; Full Spec 2026-11-03, revised the same day for the owner's rulings O1–O3; cited against `origin/main` `c5bb507f`; Reader Engine; Blurby.Brain1 finding and ruling of 2026-11-03; serialized after CHAPTER-STEP-CFI-1 (Seq 97); needs a shared-core integration window; not a release gate)*

- **What:**
  - Every save that writes a word (the position) also writes the page of that word (the cfi), or clears the stored cfi.
  - A cold open of an EPUB at a saved word waits, behind the existing "Loading book..." state, until the book's word map is ready. It then opens straight on the saved page if that page holds the saved word, and otherwise on the saved word itself. There is no visible jump afterwards.
  - Narrate, reopened at a saved word, starts Play at the first word of that word's sentence.
  - **Out of scope:**
    - CHAPTER-STEP-CFI-1's landing save itself (Seq 97). This item builds on it.
    - Contents entries that point inside a section (TOC-FRAGMENT-WORD-1) and Flow's cursor after a jump (FLOW-TOC-JUMP-WORD-1).
    - Mode handovers (`handoff.source != null`), including Narrate's `arrivalSyncOwed` (NARRATE-ARRIVAL-SYNC-1). They are unchanged. The hold is cold-open only.
    - Focus, Flow and Narrate views. A cold open always mounts Page (`src/reader/useReaderModeOrchestrator.ts:336-341`), so only Page's view holds.
    - Repairing stale pairs already in a user's `library.json`. The hold corrects what the reader sees; the stored pair is fixed by the reader's next real save (LL-030: no save without engagement).
    - A main-process cache of the word map (question B12).
    - The standalone reader window (`src/App.tsx:76`, `src/hooks/useReader.ts:180`), pending question B6.
    - The legacy, test-only copies `src/hooks/usePersistentReadingAnchor.ts` and `src/utils/persistentReadingAnchor.ts`. The live app does not import them.
    - Focus Play under CDP input in the package. Brain1 owes that check separately.
    - `preload.js`. Its `updateDocProgress` already forwards a `null` third argument unchanged.
  - **Outcome:**
    - On *Meditations*: Page at word 8723, one page turn, then Flow, then "Next chapter", then quit. `library.json` holds a position and either no cfi or a cfi in that position's section. The reopen's first shown range contains the saved position.
    - A library seeded with the old stale pair (11652 with a spine-4 cfi) reopens with 11652's section as the first thing shown.
    - A library seeded with position 8723 and no cfi reopens with a range containing 8723 as the first thing shown.
    - Reopened at a word in the middle of a sentence, then Narrate and Play: the first word requested is that sentence's first word.
- **Why** (Blurby.Brain1 ruling, `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.CFI-POSITION-CONSISTENCY-1.2026-11-03.md`; Amendment 3 of `Brain1.NARRATE-ARRIVAL-SYNC-1.2026-11-03.md`; RodneySr repro on the `c5bb507f` x64 package, evidence `C:\Projects\Blurby-artifacts\narrate-arrival-sync-1\repro-base\` on RodneySr):
  - **R2, confirmed live.** Page at 8723, one turn (saved 9758 with a spine-4 cfi), Flow, "Next chapter" (view on spine 5, words 11652–11733), quit. `library.json` then holds 11652 with the spine-4 cfi. The reopen shows 9758–9870, a chapter behind.
  - **Cause, at `c5bb507f`:**
    - Each mode's `navigateTo` commits an explicit-navigation word with no cfi: Focus `focus/ModeRuntime.ts:758`, Flow `flow/ModeRuntime.ts:931`, Narrate `narrate/ModeRuntime.ts:479`. Page's is a no-op on an EPUB (`page/ModeRuntime.ts:356`) and commits only off-EPUB (`:357`).
    - The commit saves `options.cfi ?? state.cfi ?? undefined` (`helpers/usePersistentReadingAnchor.ts:99` in Focus, Flow and Narrate; `:100` in Page). `state.cfi` is the previous page's cfi.
    - `main/ipc/documents.js:22-24` sets the position, and sets `doc.cfi` only when a cfi is given (`if (cfi) doc.cfi = cfi`). There is no way to clear it. The library copy does the same (`src/hooks/useLibrary.ts:162-167`), and the port bridge forwards a cfi to it only when truthy (`src/components/ReaderContainer.tsx:313`).
    - Reopen prefers the cfi: `resolveBookOpenInitialCfi` returns `cfi || null` and ignores the word (`page/helpers/persistentReadingAnchor.ts:64-71`, called at `page/ModeRuntime.ts:167`). `page/FoliateView.tsx:881-894` then calls `view.init({ lastLocation })`.
  - **R1, unproven candidate.** On close or finish, `_persistAndLog` (`src/hooks/useProgressTracker.ts:243-259`) pairs the final word with `lastRelocateCfiRef`. That ref is set only by the relocate save (`ReaderContainer.tsx:330`), with no record of its word. Focus advancing words with no relocate, a suppressed relocate save, or a quit inside the debounce would save a new word with an old cfi. With no relocate at all it sends no cfi, and main keeps the stored one.
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
- **Design decisions** (planner proposal for Blurby.Brain1 to confirm; questions B1–B5 and B8–B13):
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
  8. **Mode isolation.** Each mode's anchor helper is edited in its own copy (Wave A). The hold lives in Page's own files only (Wave B). No sibling import, no shared mutable store, no new shared module. `src/constants.ts` is the shared constants file Page already imports (`page/ModeRuntime.ts:13-16`).
- **The change.** Line numbers are at `c5bb507f`. CHAPTER-STEP-CFI-1 and NARRATE-ARRIVAL-SYNC-1 move some lines, so the implementer re-greps every cited line at the cut (standing rule 36):

  ```
  git grep -n -F 'options.cfi ?? state.cfi' -- src/reader/modes
  git grep -n -F 'resolveBookOpenInitialCfi(' -- src/reader/modes/page
  git grep -n -F 'if (cfi) doc.cfi = cfi;' -- main/ipc/documents.js src/test-harness/electron-api-stub.ts
  git grep -n -F 'lastRelocateCfiRef' -- src/hooks/useProgressTracker.ts src/components/ReaderContainer.tsx
  git grep -n -E 'initialCfi|setLoading\(false\)|view\.init\(|goToFraction\(fraction\)|let cancelled' -- src/reader/modes/page/FoliateView.tsx src/reader/modes/page/useModeBindings.ts
  git grep -n -E 'private adoptDocument|select\(wordIndex|handleCommand\(command|jumpBack\(\): void|stop\(|FOLIATE_MIN_ENGAGEMENT_POSITION' -- src/reader/modes/page/ModeRuntime.ts
  git grep -n -E 'const clickedWord|sentenceStartAt\(|private effectiveWords' -- src/reader/modes/narrate/ModeRuntime.ts
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
  - **Wave C — gates, package and close-out** (about 35 tool uses): Done-when 4–10.
- **Prerequisites:**
  - NARRATE-ARRIVAL-SYNC-1 (Seq 88.5) merged, and gate (1) run 6 recorded.
  - CHAPTER-STEP-CFI-1 (Seq 97, amendment 1, `eb/chapter-step-cfi-1-r2`) merged. `<base>` is `origin/main` after that merge.
  - The `src/types.ts` and `src/components/ReaderContainer.tsx` integration window granted, with no other active sprint editing either file.
  - Blurby.Brain1 confirms B1–B5 before Wave A, and B8–B13 before Wave B.
  - RodneySr has the canonical clone `C:\Users\estra\Projects\Blurby` with `node_modules`, the sample *Meditations*, and the `c5bb507f` x64 `--dir` package from `repro-base` (or rebuilds it with the same recipe). Rodney has its canonical clone for the arm64 build.
- **Execution host:** RodneySr (x64) for the implementation, the tests, the packages and the probes. Rodney (arm64) only for the rule 53 arm64 launch.
- **Branch:** `eb/cfi-position-consistency-1` at `C:\Users\estra\Projects\Blurby\.worktrees\cfi-position-consistency-1` on RodneySr. Create it with `git -C C:/Users/estra/Projects/Blurby worktree add -b eb/cfi-position-consistency-1 .worktrees/cfi-position-consistency-1 origin/main` after CHAPTER-STEP-CFI-1 merges. Push with `git push origin HEAD:refs/heads/eb/cfi-position-consistency-1`.
- **Done when** (every command in `pwsh` from the worktree root):
  1. **Red first (standing rule 43).** Commit these three files alone, before any source edit. Reach new names only through behaviour, so each file runs on `<base>`. The red commit need not typecheck; step 5 does.

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

     Record every result in the memo. If a row named RED above is green on `<base>`, STOP: its guard cannot fail.
  2. **Wave A as specified.** Then:
     - `git grep -n -F 'options.cfi ?? state.cfi' -- src/reader/modes` exits 1. It exits 0 on `c5bb507f`, with 4 hits (Page `:100`; Focus, Flow and Narrate `:99`).
     - `git grep -c -F 'cfi === null' -- main/ipc/documents.js src/test-harness/electron-api-stub.ts` exits 0, with both paths listed. It exits 1 on `c5bb507f`.
     - `git diff --name-status <base> -- preload.js` prints nothing and exits 0.
  3. **Wave B as specified.** Then:
     - `git grep -c -F 'PAGE_OPEN_HOLD_TIMEOUT_MS' -- src/constants.ts src/reader/modes/page/ModeRuntime.ts` exits 0, with both paths listed. It exits 1 on `c5bb507f`.
     - `git grep -c -F 'cfiSpineIndex' -- src/reader/modes/page/helpers/persistentReadingAnchor.ts` exits 0. It exits 1 on `c5bb507f`.
     - `git diff --name-status <base> -- src/reader/modes/focus src/reader/modes/flow src/reader/modes/narrate` lists exactly the three `helpers/usePersistentReadingAnchor.ts` files and exits 0.
  4. **Tests.**
     - `npx vitest run tests/cfiPositionConsistency.ipc.test.js tests/cfiPositionConsistency.shell.test.tsx tests/readerModes/cfiPositionConsistency.test.ts` exits 0.
     - `npx vitest run tests/readerModes tests/readerModeIsolation.test.ts tests/useProgressTracker.test.ts tests/keepFurthest.test.tsx tests/pageReopenCfi.test.ts tests/updateDocProgressLastRead.test.js tests/persistentReadingAnchor.test.ts tests/useLibrary.test.ts tests/narrate` exits 0.
     - `tests/readerModes/chapterStepLanding.test.ts` (CHAPTER-STEP-CFI-1), `tests/readerModes/pagePositionSave.test.tsx` and `tests/narrate/narrate.playSavedPosition.test.ts` (NARRATE-ARRIVAL-SYNC-1) are green and unedited.
  5. `npm test`, `npm run typecheck` and `npm run build` exit 0 on RodneySr (standing rules 47 and 48). Record the counts.
  6. **Packaged probes**, on RodneySr x64 `--dir` packages of `c5bb507f`, `<base>` and the tip, all with one recipe (LL-152):
     - Launch each with `--user-data-dir=<scratch>` and `BLURBY_USER_DATA_DIR=<scratch>`.
     - Prove `app.getPath('userData')` over the inspector before the first input, and refuse an inspector port that already answers (LL-165).
     - Hash the live profile's `library.json` and `settings.json` before and after the session: unchanged.
     - Read verdicts from state, never from screenshots (standing rule 55):
       - `library.json`;
       - the saves seen through an `update-doc-progress` hook;
       - the first and last visible word indices at the moment `.rm-page-loading` leaves the DOM (the first thing shown);
       - every `relocate` from launch to 10 s after that moment.
     - Quit through `app.quit()` after detaching every debugger client.
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
       - **(P4, R1), conditional:** run only after Brain1's Focus-Play-under-CDP check passes. Open at 8723 in Page, switch to Focus, Play for 30 s with no page turn, pause, exit to the library, read `library.json`, reopen. On the tip the stored pair agrees and the first shown range contains the stored position; record `<base>` as the control. If the check has not passed by Wave C, record P4 as NOT RUN with the reason. It is then added to gate (2)'s list and does not hold the merge.
       - **(P5, the hold's cost):** five cold opens of *Meditations* at 8723 with its cfi, on `<base>` and on the tip, each a fresh launch on the same scratch profile. For each open record:
         - the time from the open IPC to `.rm-page-loading` leaving the DOM;
         - the time from the `extract-epub-words` request to its reply;
         - whether the timeout fired.

         Report the median and maximum per build and the tip's added wait (tip median minus base median). A timeout on the tip goes to Blurby.Brain1 with the numbers (question B9).
       - **(P6, O3):** pick a word in *Meditations* that is not the first word of its sentence. Use the extracted words and `sentenceStartAt`'s rule, and record both indices. Seed it with no cfi, reopen, switch to Narrate as soon as `.rm-page-loading` is gone, and press Play. The first request word is the sentence's first word on the tip. Record `<base>`'s result too, as the control for the hold's effect.
  7. **Rule 53 pair:**
     - on RodneySr, the tip's x64 `--dir` package with `origin/main` merged in;
     - on Rodney, an `--arm64 --dir` package of the same commit and a 25 s native-arm64 scratch-profile launch with no error or crash;
     - `npx asar list` checked against `dist/` on both;
     - P1–P3, P5 and P6 re-run on the packaged exe;
     - a "Package verification" section in the close-out;
     - Blurby.Brain1's confirmation before the merge go.
  8. **Fence (standing rule 41).** `git diff --name-status <base>` lists exactly the following, plus `docs/studies/investigations/CFI-POSITION-CONSISTENCY-1.*`, the governance staging memo and the time log:
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
     - `M src/reader/modes/page/helpers/persistentReadingAnchor.ts`
     - `M src/reader/modes/page/ModeRuntime.ts`
     - `M src/reader/modes/page/useModeBindings.ts`
     - `M src/reader/modes/page/FoliateView.tsx`
     - `M tests/useProgressTracker.test.ts`
     - `A tests/cfiPositionConsistency.ipc.test.js`
     - `A tests/cfiPositionConsistency.shell.test.tsx`
     - `A tests/readerModes/cfiPositionConsistency.test.ts`

     Nothing in `preload.js`, `src/utils/FlowScrollEngine.ts`, `src/styles/`, any `mode.css`, Focus's, Flow's or Narrate's runtime, view or bindings, `surface.ts`, `ReaderModeAdapter.ts`, `src/reader/useReaderModeOrchestrator.ts`, `src/App.tsx` or `src/hooks/useReader.ts`.
  9. **Merge-tree check:** `git merge-tree` of the tip against `origin/main` is clean at the merge go. A conflict in a fenced file goes to Blurby.Roadmap before resolution.
  10. **Owner, added to gate (2)'s list:**
      - after a chapter jump, quit and reopen: the book opens in the jumped-to chapter;
      - a book that had only a saved word opens at that word, after "Loading book..." and with no jump;
      - Narrate after a reopen starts at the saved word's sentence;
      - P4, if it was not run.
- **Effort:** M, in three waves (A, B, C; each about 40 tool uses or fewer, and each its own dispatch). Technical effort: medium for A and C, high for B.
- **Owners:**
  - Blurby.Brain1 confirms the contract (B1–B5) before Wave A and the hold (B8–B13) before Wave B, owns the Focus-Play check that gates P4, and confirms the rule 53 pair;
  - RodneySr implements, tests and probes; Rodney runs the arm64 launch;
  - spec-compliance, then quality review;
  - Blurby.Roadmap grants the integration window, gives the merge go and closes it out.
- **Merge order:**
  - after NARRATE-ARRIVAL-SYNC-1, gate (1) run 6 and CHAPTER-STEP-CFI-1;
  - before FLOW-TOC-JUMP-WORD-1 (Seq 110), FURTHEST-PERSIST-1 (Seq 114; `main/ipc/documents.js`, `src/hooks/useLibrary.ts`, `src/types.ts`) and FOCUS-PAUSED-HANDOFF-1 (Seq 118). Each re-greps after this lands.
  - Any later item that edits `src/reader/modes/page/FoliateView.tsx` or `page/ModeRuntime.ts` re-greps the hold's lines.
  - TOC-FRAGMENT-WORD-1's `ReaderContainer.tsx` window does not overlap this one.
  - The Focus, Flow and Narrate restamp items (Seq 111–112) edit only their own `FoliateView.tsx`, so they do not conflict.
- **Path:** dispatch (three waves).

##### Owner rulings (2026-11-03)
- **O1 — "At the saved word" (option A).** When the stored page does not hold the saved word, or there is no stored page, the book opens on the saved word, where "jump back to my place" lands in Page. In this spec that is design 5: Page's view opens the word's section and lands with `jumpFoliateToWordAnchor`, the jump-back helper.
- **O2 — "Wait before showing" (option B).** The cold open shows the existing "Loading book..." state until the word map is ready, then opens right on the word, with no visible jump, at the cost of a wait of about 1–2 s on a cold open. In this spec that is design 4, the hold in Page. The late "open settle" of the first draft is removed. After a failure or a timeout the book opens with today's choice, and a map that arrives later moves nothing.
- **O3 — "Also, on narrate, the start should be the start of the sentence from the saved word on restart".** When Narrate is reached after a reopen or restart at a saved word, the view is on that word (O1, after O2's hold), and Play starts at the first word of the sentence that holds it, not at the word itself. In this spec it is already met on the normal path (O3 finding); rows o3a and o3b and probe P6 pin it, and question B13 covers the edges.

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

##### Lessons applied
- **LL-029:** the open check compares section and word indices, never live ranges.
- **LL-030:** the hold and its word landing never save; nothing saves without engagement.
- **LL-142:** the stale pair is measured on the `c5bb507f` control before the fix is trusted, and P2, P3 and P5 record the base.
- **LL-143:** every gate names its shell and an exact exit code, and each was dry-run on `c5bb507f` (expected exit recorded beside it).
- **LL-152:** one recipe for the probes on `c5bb507f`, `<base>` and the tip.
- **LL-165:** the scratch profile is proved before the first input, and the live profile's hashes are unchanged.
- **LL-169:** the hold's timer and promise end with the runtime (`stop()`, `destroy()`), and the view checks `cancelled` after each await, separately from the target's own settle-once guard.
- **Standing rule 55 (promoted from LL-166):** verdicts come from saves, `library.json`, visible word indices and request words, not screenshots.
- **Standing rule 53 (promoted from LL-167):** package verification, with Blurby.Brain1's confirmation before the merge go.
