#### PAGE-PARA-KEYS-1 — Page's paragraph keys move the highlight to a real paragraph start *(Seq 115; Queued; Full Spec 2026-11-03, traced on the RC tip `70d64237`; BUG-220; Reader Engine; not a release gate)*

- **What:** in page reading (PageModeRuntime), Shift+→ and Shift+← move the highlight to the next and previous paragraph start in the same word-index space the highlight uses. On an EPUB that is the book-wide index space: rendered block starts of sections stamped against the book plus the book's section starts, exactly as focus reading and flow reading do since FOCUS-KEYS-FIX-1 and FLOW-PARA-KEYS-1. With no words known yet, the keys do nothing.
  - **In scope:** Page's `paragraph` command; a Page-owned copy of the paragraph-start collector; the Page view's book-stamped document tracking and loaded-slice paragraph breaks; two Page surface methods.
  - **Out of scope:**
    - Page's sentence keys (Ctrl+↑/↓). They have the same empty-word-source defect on an EPUB: `findSentenceBoundary([], …)` returns 0 (`src/reader/modes/page/ModeRuntime.ts:422-424`, `src/utils/text.ts:47-48`). This item does not fix them; the report asks Blurby.Brain1 to scope them.
    - Turning the page to show an off-screen target. The highlight moves without page motion today (`FoliateView.tsx:1187-1190`, `allowMotion` false), and that stays.
    - Focus, Flow and Narrate.
  - **Outcome:** on a packaged build, Shift+→ from a highlighted word in Page lands on the first word of the next paragraph (index ≥ 0, the word's text is its block's first word), never −1 or the book's first word.
- **Why (root cause, traced on `70d64237`):**
  - Page's `handleCommand` reads `words = this.document.tokenWords` (`src/reader/modes/page/ModeRuntime.ts:384`) and `breaks = this.document.paragraphBreaks` (`:398`).
  - For every EPUB both are empty. The shell tokenizes only `activeDoc.content` (`src/components/ReaderContainer.tsx:186-189`), and `load-doc-content` returns a file path, not content, for every EPUB and converted document (`main/ipc/library.js:170-178`, `:181-193`).
  - So **next** finds no break and falls through to `target = words.length - 1 = -1` (`ModeRuntime.ts:410-418`), and **prev** finds none and keeps `target = 0` (`:400-408`). That is exactly BUG-220: word 187 → −1 on Shift+→, → 0 on Shift+←.
  - The Page runtime already has the right word source, `effectiveWords()` (`ModeRuntime.ts:644-651`), but its paragraph command does not use it. Page's surface has no paragraph-start method (`src/reader/modes/page/surface.ts:10-27`), and Page's view keeps neither the loaded slice's breaks nor a book-stamped set (`FoliateView.tsx:293`, `:313`).
- **Prerequisites:**
  - The RC integration window's merge to `main` (`docs/planning/specs/2026-11-03/RC-INTEGRATION-WINDOW.md`). It carries both stub prerequisites, READER-ARROW-GUARD-1 (tip 18) and BLOCK-TAG-CASE-1 (tip 19), plus FOCUS-KEYS-FIX-1 and FLOW-PARA-KEYS-1 (tip 14), whose pattern this copies.
  - Wait, encoded: cut only after that merge is on `origin/main`; re-grep every cited line at the cut (standing rule 36).
  - Serialize with PAGE-ENTRY-KEYS-1 (Seq 119): both edit `src/reader/modes/page/FoliateView.tsx`'s `onSectionLoad`. This item lands first (lower Seq).
- **Done when** (PowerShell 7, `pwsh`, from the worktree root; each command passes only on exit 0 unless stated):
  1. **Red first (standing rule 43).** Commit the two new test files alone. On the base, `npx vitest run tests/readerModes/pageParagraphKeys.test.tsx tests/readerModes/pageParagraphStarts.test.ts` exits 1. (pk1)–(pk5) and (ps1) fail as stated below, and (pk6) and (ps2) pass. Record the output in the memo.
  2. **The change** at the edit sites below, and nowhere else.
  3. `npx vitest run tests/readerModes/pageParagraphKeys.test.tsx tests/readerModes/pageParagraphStarts.test.ts tests/readerModes/page.behavior.test.tsx tests/readerModes/page.contract.test.ts tests/readerModes/pagePositionSave.test.tsx tests/readerModes/blockTagCase.test.ts tests/readerModes/focusParagraphStarts.test.ts tests/readerModes/flowParagraphStarts.test.ts tests/bookParagraphStart.test.ts tests/readerModeIsolation.test.ts tests/readerModeBoundaries.test.ts tests/readerModeOwnership.test.ts` exits 0, with no existing test edited (standing rule 50).
  4. `npm test` exits 0, `npm run typecheck` exits 0 and `npm run build` exits 0 (standing rules 47 and 48).
  5. **Live, packaged (standing rule 53(a); scratch profile proved before the first input, LL-165).**
     - The trigger is the key press; Page's paragraph key saves nothing. So the check reads the rendered highlight, not a file (standing rule 54).
     - The probe, a CDP evaluate over the section documents, reads the element carrying `page-word--highlighted` (`src/reader/modes/page/helpers/foliateWordHighlight.ts:30`). It records that element's `data-word-index` and its text. It also records the first stamped word span of the block (`p`, `div`, `li`, `h1`–`h6`, `blockquote`) that contains it.
     - Steps: open the sample *Meditations* in Page and wait for the book's words (the probe sees spans re-stamped book-wide). Click a word in the middle of a paragraph on the current page, then press Shift+→.
       - **Pass:** the highlighted index is greater than the clicked index, and the highlighted span is the first stamped word of its block. The texts must match, not only the indices (LL-161).
     - Then press Shift+←.
       - **Pass:** the highlighted index is lower than the previous one, ≥ 0, and is also its block's first word.
     - **Control on a base `--dir` build (standing rules 54 and 55):** the same steps leave no element with `page-word--highlighted` at an index ≥ 0 after Shift+→ (the runtime published −1). Record both runs' indices and texts in the memo.
  6. **Package verification (standing rule 53):** (a)–(e) on the final commit with `origin/main` merged in. `npx asar list` shows the rebuilt `dist/` bundle, and the bundle contains the string `getParagraphStartWordIndexes` in Page's chunk. Blurby.Brain1 confirms.
  7. **Fence (standing rule 41):** `git diff --name-status <base>` lists exactly these paths, plus the staging memo and the time log:
     - `A src/reader/modes/page/helpers/foliateParagraphStarts.ts`
     - `M src/reader/modes/page/FoliateView.tsx`
     - `M src/reader/modes/page/surface.ts`
     - `M src/reader/modes/page/ModeRuntime.ts`
     - `A tests/readerModes/pageParagraphKeys.test.tsx`
     - `A tests/readerModes/pageParagraphStarts.test.ts`
     - `M docs/governance/BUG_REPORT.md` (BUG-220's status line only)
- **Effort:** S.
- **Owners:** the implementation agent; reviewers for spec compliance, then quality (standing rule 9); Blurby.Brain1 for package verification.
- **Source:**
  - BUG-220 (`docs/governance/BUG_REPORT.md`, "BUG-220"), measured by Blurby.Brain on a packaged build, 2026-10-25.
  - The ROADMAP stub `#page-para-keys-1`.
  - The code trace above on `70d64237`.
  - The Focus and Flow precedents: `src/reader/modes/focus/ModeRuntime.ts:791-796`, `:828-841`; `src/reader/modes/flow/ModeRuntime.ts:1006-1020`; `src/reader/modes/focus/helpers/foliateParagraphStarts.ts`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites (line numbers on `70d64237`; re-grep at the cut):**
  1. **New `src/reader/modes/page/helpers/foliateParagraphStarts.ts`.** Copy `isParagraphBlock`, `firstOwnWordIndex` and `collectParagraphStartWordIndexes` from `src/reader/modes/focus/helpers/foliateParagraphStarts.ts:1-46`. Import `BLOCK_TAGS`, `parseWordIndexAttribute` and `queryWordSpans` from Page's own `./foliateHelpers` (`page/helpers/foliateHelpers.ts:24-34`). Do not copy `bookParagraphBreaks`, because Page has no engine pauses.
     - The header comment names PAGE-PARA-KEYS-1 and the reason it is a copy: reading-mode isolation forbids importing a sibling runtime's file.
  2. **`src/reader/modes/page/FoliateView.tsx`:**
     - `:213-229` `PageFoliateViewAPI`: add `getParagraphBreaks: () => Set<number>;` and `getParagraphStartWordIndexes: () => number[];`.
     - `:293`, beside `foliateWordsRef`, add two refs:
       - `const foliateParagraphBreaksRef = useRef<Set<number>>(new Set());`
       - `const bookStampedDocsRef = useRef(new WeakSet<Document>()); // PAGE-PARA-KEYS-1: wrapped against the book's sections`
     - In `onSectionLoad`:
       - After `const extracted = extractWordsFromView(v2);` (`:659`), add `foliateParagraphBreaksRef.current = extracted.paragraphBreaks;`.
       - Inside `if (sectionStart >= 0) {` (`:665`), before the wrap at `:672`, add:
         - `const stampsWithBook = Boolean(liveSections()?.some((section) => section.sectionIndex === index));`
         - `bookStampedDocsRef.current.delete(doc);`
       - After `await wrap;` (`:674`), add `if (stampsWithBook) bookStampedDocsRef.current.add(doc);`.
       - Leave `rendererNumberedDocsRef` (`:671`) unchanged.
     - In `viewApiRef.current` (`:995-1001`):
       - In `getWords`, store `foliateParagraphBreaksRef.current = extracted.paragraphBreaks;` beside `foliateWordsRef.current = extracted.words;`.
       - Add `getParagraphBreaks: () => foliateParagraphBreaksRef.current,`.
       - Add `getParagraphStartWordIndexes: () => collectParagraphStartWordIndexes(view.renderer?.getContents?.() ?? [], (d) => bookStampedDocsRef.current.has(d)),`.
       - Import the collector from `./helpers/foliateParagraphStarts`.
     - In the re-stamp effect (`:1103-1138`):
       - Immediately before `unwrapWordSpans(doc);` (`:1119`), add `bookStampedDocsRef.current.delete(doc);`.
       - After `await rewrap; if (cancelled) return;` (`:1124-1125`), add `if ((bookWordSections as SectionBoundary[]).some((section) => section.sectionIndex === index)) bookStampedDocsRef.current.add(doc);`.
  3. **`src/reader/modes/page/surface.ts`:**
     - In `PageSurface` (`:10-27`), add `getParagraphBreaks(): readonly number[];` (the loaded slice's breaks, sorted) and `getParagraphStarts(): readonly number[];` (book-wide rendered block starts of book-stamped sections).
     - In `createPageSurface` (`:29-43`), add both, copied from `src/reader/modes/focus/surface.ts:46-50`.
  4. **`src/reader/modes/page/ModeRuntime.ts`:**
     - `:17`: import `findBookParagraphStart`, `findParagraphStart` and `findSentenceBoundary` from `../../../utils/text`. This is a shared utility, not a sibling runtime; Focus and Flow import it the same way.
     - `:396-420`: replace the `paragraph` case body with:

       ```ts
       case "paragraph": {
         // PAGE-PARA-KEYS-1 (BUG-220): the start in the highlight's own index space; null when no words are known.
         const target = this.paragraphTarget(command.direction === "next" ? "forward" : "backward", idx);
         if (target == null) return; // the key does nothing
         this.publishHighlight(target);
         break;
       }
       ```

     - After `effectiveWords()` (`:644-651`), add:

       ```ts
       /** PAGE-PARA-KEYS-1: as Focus and Flow (Blurby.Brain ruling A): book-wide with full-book words, else the view's slice breaks, else the document's. */
       private paragraphTarget(direction: "forward" | "backward", current: number): number | null {
         const lastIndex = this.effectiveWords().length - 1;
         if (lastIndex < 0) return null;
         if (!this.document.useFoliate) return findParagraphStart(this.document.paragraphBreaks, current, direction, lastIndex);
         const bookWords = this.document.bookWords;
         if (!bookWords) return findParagraphStart(this.surface.getParagraphBreaks(), current, direction, lastIndex);
         const sectionStarts = bookWords.sections.map((section) => section.startWordIdx);
         return findBookParagraphStart(this.surface.getParagraphStarts(), sectionStarts, current, direction, lastIndex);
       }
       ```

     - Engineering choices:
       - **`lastIndex < 0 → null`.** With no word known the key must not publish −1. Focus avoids −1 only by clamping in `moveReadingWord`; Page has no clamp.
       - **`findParagraphStart` for the tokenized path.** It returns exactly what the removed loop returned (`src/utils/text.ts:87-102`), which (pk6) pins.
- **Tests:**
  - **`tests/readerModes/pageParagraphKeys.test.tsx` (new).**
    - **Harness:** copied (standing rule 52; not imported) from `tests/readerModes/flowParagraphStarts.test.ts:14-55`, with the router's `modules: { page: pageMode }` only, and with `createFakeDocument({ bookWords: BOOK_WORDS, wordCount: 200, position, tokenWords: [], paragraphBreaks: [] })`, because an EPUB carries no tokenized words.
    - **Setup:** `router.hardSelect({ cfi: null, word: \`w${position}\`, globalWordIndex: position })` sets the highlight. Then set `viewApiRef.current` of the Page runtime to the same Proxy API (`getWords` → SLICE, `getParagraphBreaks` → `new Set([11, 39, 99])`, `getParagraphStartWordIndexes` → `[100, 112, 140]`).
    - **Coverage (LL-174):** each case sends `router.command({ kind: "paragraph", … })` and reads `getSnapshot().highlightedWordIndex`, so it passes through the real `createPageSurface` hop.
    - Cases:
      - **(pk1)** From 105: next → 112, then next → 140. *Base: −1.*
      - **(pk2)** From 115: prev → 112, then prev → 100. *Base: 0.*
      - **(pk3)** From 150: next → 199, the book's last word. *Base: −1.*
      - **(pk4)** `bookWords: null` with the view API set, from 5: next → 12 (slice breaks). *Base: −1.*
      - **(pk5)** `bookWords: null` and no view API, from 5: next and prev both leave the highlight at 5. *Base: −1, then 0.*
      - **(pk6) control:** `createFakeDocument({ useFoliate: false, filepath: null, tokenWords: 40 words, wordCount: 40, paragraphBreaks: [13, 25], position: 7 })`, from 7: next → 14 → 26; from 20, prev → 14. Passes on the base and after.
  - **`tests/readerModes/pageParagraphStarts.test.ts` (new).** Copied from `tests/readerModes/focusParagraphStarts.test.ts:1-45`, loading `../../src/reader/modes/page/helpers/foliateParagraphStarts` through the same `loadCollector` fallback.
    - **(ps1)** Blocks `[[100,101,102],[112,113],[140]]` with leading text give `[100, 112, 140]`. *Base: the module is absent, and the fallback returns `[]`.*
    - **(ps2) control:** a document the predicate rejects gives `[]`.
- **Constants:** none.
- **Branch:** `eb/page-para-keys-1` from `main` after the RC window's merge.
- **Staging plan:** stage the Done-when 7 paths by exact path. Commit on the branch. Push with `git push origin HEAD:refs/heads/eb/page-para-keys-1` (LL-181). Merge `--no-ff` to `main` after Blurby.Brain1's package confirmation and the merge go from Blurby.Roadmap (Rule 5b). Push `main`.
- **Execution host:** RodneySr (rule 6b). Canonical clone `C:\Users\estra\Projects\Blurby`, worktree `C:\Users\estra\Projects\Blurby\.worktrees\page-para-keys-1`, created with `git -C C:/Users/estra/Projects/Blurby worktree add -b eb/page-para-keys-1 .worktrees/page-para-keys-1 origin/main`.
  - **Prerequisites on the host:** `origin/main` contains the RC merge, `npm ci` completes in the worktree, and the sample *Meditations* is present in a fresh scratch profile.
  - **Arm64 launch at merge:** Rodney.
- **Package verification:** standing rule 53, run on RodneySr:
  - (a) `npx electron-builder --win --dir --x64`, plus the arm64 `--dir` build;
  - (b) a 25 s scratch-profile launch with the LL-165 profile proof, and no error, unhandled-rejection or crash line;
  - (c) `npx asar list`;
  - (d) Done-when 5 re-run on the packaged exe;
  - (e) a "Package verification" section in the close-out.
  - The arm64 launch runs on Rodney at merge.
- **Failure handling:**
  - **(pk6) fails on the base:** the harness differs from the base runtime. Stop and report; do not adjust the expected values.
  - **(pk1)–(pk5) pass on the base:** the red does not reproduce BUG-220. Stop and report (standing rule 43).
  - **`readerModeOwnership.test.ts` flags the new helper as an undeclared module singleton:** the helper has no module state. Re-read it, remove any module-level mutable value, and re-run. If the failure persists, ask Blurby.Brain1 before editing the ownership manifest.
  - **The live control (Done-when 5, base) highlights a word ≥ 0 after Shift+→:** the probe cannot see the defect. Stop and report (standing rule 55).
  - **Live pass fails only because the target is in a section not yet book-stamped:** wait for the re-stamp (the probe sees book-wide indices) and re-run once. A second failure stops the run.
  - **Retry ceiling:** one re-run per failing gate. After that, stop and file an issue.
  - **Rollback:** `git revert -m 1 <merge>`. No stored data changes.
- **Lane ownership:** Reader Engine; execution surface A (Page runtime) and C (Page view). **Forbidden during a parallel run:** the Focus, Flow and Narrate mode directories, `src/components/ReaderContainer.tsx`, `src/hooks/useKeyboardShortcuts.ts` and `src/utils/text.ts` (read only). **Shared-core touches:** none. **Merge order:** after the RC window; before PAGE-ENTRY-KEYS-1 (Seq 119), which re-cuts on this item's `FoliateView.tsx`.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red tests (pk1–pk6, ps1–ps2) committed alone; base failures recorded | calculable | positive control | bounded | medium | 30m | — | — |
| 2 | Page paragraph target, surface methods, view book-stamped set and collector copy | calculable | feature | bounded | medium | 40m | — | — |
| 3 | Targeted runs, suite, typecheck, build | calculable | verify | bounded | low | 30m | — | — |
| 4 | Packaged live paragraph-key check with base control; rule 53; memo, time log, push | calculable | live verification | bounded | medium | 50m | — | — |

**Total:** chain 2h30m · sum 2h30m; 0 of 4 estimated tasks calibrated (priced by planner estimate)

##### Lessons applied
- **LL-081 / LL-071:** the target is computed in the highlight's index space, from `effectiveWords()` and book-wide starts, never from `tokenWords`, which is empty on an EPUB. This is the root cause of the defect.
- **LL-170:** only documents wrapped against the book's sections count as book-stamped. The set is cleared before every wrap and re-stamp, so a provisionally numbered section never supplies a start.
- **LL-174:** the red tests drive `router.command`, through the real Page surface, to the fake view API, so a dropped hop fails them.
- **LL-139 / reading-mode isolation:** Page gets its own collector copy, with no import from `focus/` or `flow/`.
- **LL-161:** the live check compares the highlighted span's text with its block's first word, not only the index.
- **LL-165, LL-167 / standing rule 53:** scratch-profile proof before the first key, then package verification.
- **LL-158 / standing rule 54:** the trigger is named (the key press); the state is read from the rendered highlight, because nothing is persisted.
- **LL-151 / LL-166 / standing rule 55:** the base build control must show the defect.
- **LL-138 / standing rule 43:** red first.
- **LL-149 / standing rule 48:** typecheck and build in the Done-when.
- **LL-136 / standing rule 41:** the fence exempts the time log.
- **LL-146 / standing rule 52:** the harness is copied, not imported from a test file.
- **LL-143 / standing rule 44:** each command names `pwsh` and its exit code.
- **LL-156 / standing rule 50:** no existing test is edited, and the out-of-scope sentence-key defect is named against its own lines.
- **Standing rule 51:** this specification appends no lesson-status line.
- **Considered, not applicable:**
  - LL-030 (no save);
  - LL-072 (the click path is unchanged);
  - LL-108 (no anchor commit);
  - LL-159 (no deferred writer);
  - LL-169 (no new async lifetime: the set is a WeakSet updated inside existing awaits);
  - LL-120 (no class change);
  - LL-181 (applied in the staging plan only).
