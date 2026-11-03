#### PAGE-SENTENCE-KEYS-1 — Page's sentence keys move to a real sentence start *(Seq 116 (new item; see the register note); Full Spec 2026-11-03, cited against RC tip `70d64237`; Reader Engine; follows PAGE-PARA-KEYS-1 (Seq 115) in the same file; not a release gate)*

- **What:** in page reading (PageModeRuntime), Ctrl+↓ and Ctrl+↑ move the highlight to the next sentence start and to the start of the current (or previous) sentence, in the highlight's own word-index space. On an EPUB that is the book-wide word table, `this.document.bookWords.words`. Until the book's words have arrived, the keys do nothing. Tokenized documents (not Foliate) keep today's behaviour.
  - **In scope:** the `sentence` case of Page's `handleCommand` (`src/reader/modes/page/ModeRuntime.ts:422-424`).
  - **Out of scope:**
    - Page's paragraph keys: PAGE-PARA-KEYS-1 (Seq 115), whose fence (`page/helpers/foliateParagraphStarts.ts`, `page/FoliateView.tsx`, `page/surface.ts` and the `paragraph` case) this item does not touch.
    - Turning the page to show an off-screen target. The highlight moves without page motion, as the paragraph keys do (PAGE-PARA-KEYS-1, out of scope there too).
    - Focus, Flow and Narrate (their sentence keys already read `effectiveWords()`, `focus/ModeRuntime.ts:788-789`, `flow/ModeRuntime.ts:967-968`).
    - `src/utils/text.ts` (read only) and `src/components/ReaderContainer.tsx` (no edit).
    - The `move-selection` branch, recorded below and left as it is.
  - **Outcome:** on a packaged build, Ctrl+↓ from a clicked word in Page highlights the word right after the next sentence-ending word, never word 0.
- **Why (root cause confirmed by Blurby.Brain1 and re-traced on `70d64237`):**
  - Page's `handleCommand` reads `const words = this.document.tokenWords as string[];` (`ModeRuntime.ts:384`; Brain1's note cites `:383`, the line above). The `sentence` case passes `words` to `findSentenceBoundary` (`:422-424`).
  - `tokenWords` is empty for every EPUB: the shell tokenizes only `activeDoc.content` (`ReaderContainer.tsx:186-190`), and `load-doc-content` returns a file path, not content, for EPUBs and converted documents (`main/ipc/library.js:170-178`).
  - `findSentenceBoundary([], …)` returns 0 (`src/utils/text.ts:47-48`). So Ctrl+↑ and Ctrl+↓ jump the highlight to the book's first word.
  - **Source rule (Blurby.Brain1, 2026-11-03):** the sentence branch reads the book-wide word table `this.document.bookWords?.words`, in the highlight's own index space. It must **not** use `effectiveWords()` (`ModeRuntime.ts:643-651`): before the book's words arrive that falls back to `surface.getWords()`, the loaded slice, whose indices are slice-local, not book-wide (LL-170). With no book words yet, the key is a no-op.
  - **The key path is live.** `useKeyboardShortcuts.ts:233-234` (Ctrl+↑/↓, all modes) → `handleSentencePrev`/`handleSentenceNext` (`ReaderContainer.tsx:706-707`) → the router → Page's `handleCommand`.
- **Scope check: the `move-selection` branch (recorded, not changed).**
  - `:387-394` clamps to `words.length - 1`, which is −1 on an EPUB, so `Math.max(0, Math.min(-1, …))` publishes 0. It has the same wrong source.
  - `ReaderContainer.tsx:701-703` still forwards `move-selection` to the active runtime (`handleMoveWordSelection`).
  - **At `70d64237` no key reaches it.** `moveWordSelection` is passed into `useReaderKeys` (`useKeyboardShortcuts.ts:148`, held in its state at `:167`, `:178`) but no handler calls it: Page's plain ←/→ turn pages (`:253-254`), Ctrl+←/→ seek (`:230-231`), Shift+←/→ are the paragraph keys (`:236-237`), Shift+↑/↓ are chapters (`:239-240`), and plain ↑/↓ adjust speed (`:260-261`). After READER-ARROW-GUARD-1 (in the RC window) this still holds.
  - **The implementer re-greps at the cut** (Done-when 1). If a Page key path now reaches `move-selection` on an EPUB, fold that branch into this item with the same source rule (book words, else a no-op; clamp to `bookWords.words.length - 1`), add its red row (sk7) and widen the fence by nothing else. If no path reaches it, record that in the memo and leave it.
- **Design:**
  - **Engineering choice (inside Brain1's source rule):**

    ```ts
    case "sentence": {
      // PAGE-SENTENCE-KEYS-1: the highlight's own index space. An EPUB's tokenWords are empty, and the loaded
      // slice is not book-wide (LL-170), so an EPUB uses its book words only; with none yet the key does nothing.
      const source = this.document.useFoliate ? this.document.bookWords?.words : this.document.tokenWords;
      if (!source || source.length === 0) return;
      this.publishHighlight(findSentenceBoundary(source as string[], idx, command.direction === "prev" ? "backward" : "forward"));
      break;
    }
    ```

    - The `return` skips `this.state.notify()`, as the `default` branch does, because nothing changed.
    - The cast is to the utility's parameter type only; `findSentenceBoundary` reads the array and never writes it (`text.ts:47-86`).
    - The direction mapping (`"prev"` → backward) is kept exactly.
    - For a tokenized document the source is `tokenWords`, so the result equals today's (control (sk5)). An empty tokenized document now does nothing instead of publishing 0.
- **Prerequisites:**
  - The RC integration window's merge to `origin/main`.
  - **PAGE-PARA-KEYS-1 merged first** (same file, `ModeRuntime.ts`; it also edits the import at `:17`). Cut from `main` after its merge and re-grep every cited line (standing rule 36).
  - Serialize with PAGE-ENTRY-KEYS-1 (Seq 119) only if it is active at the same time; it edits Page's `FoliateView.tsx`, not this case.
- **Register note:** Seq 116 is held at the 2026-11-03-2 snapshot by LIBRARY-COMPLETION-VISIBILITY-1 (In Flight, carried by the RC window). Assign 116 once that item's close-out clears its Seq; if it is still held when this item is registered, use 115.5 (rule 11a's managed fix carries fractional Seq).
- **Done when** (PowerShell 7, `pwsh`, worktree root on RodneySr; each command passes only on exit 0 unless stated):
  1. **Re-grep the scope check at the cut.** `git grep -n "moveWordSelection" -- src/hooks src/components` and `git grep -n "\"move-selection\"" -- src`. Record in the memo whether any key handler calls `moveWordSelection` in Page. "No caller" leaves the branch out; a caller folds it in as stated above.
  2. **Red first (standing rule 43).** Commit `tests/readerModes/pageSentenceKeys.test.ts` alone. On the base (`main` after PAGE-PARA-KEYS-1), `npx vitest run tests/readerModes/pageSentenceKeys.test.ts` exits 1: (sk1)–(sk4) and (sk6) fail as stated, and (sk5) passes. Record the output.
  3. **The change** at the edit site below, and nowhere else.
  4. `npx vitest run tests/readerModes/pageSentenceKeys.test.ts tests/readerModes/pageParagraphKeys.test.tsx tests/readerModes/page.behavior.test.tsx tests/readerModes/page.contract.test.ts tests/readerModes/pagePositionSave.test.tsx tests/readerModeIsolation.test.ts tests/readerModeBoundaries.test.ts tests/readerModeOwnership.test.ts` exits 0, with no existing test edited (standing rule 50).
  5. `npm test`, `npm run typecheck` and `npm run build` exit 0 (standing rules 47 and 48).
  6. **Live, packaged (standing rule 53; scratch profile proved before the first input, LL-165).** The trigger is the key press; nothing is saved, so the probe reads the rendered highlight (standing rule 54). The probe is saved as `docs/governance/close-outs/Probe.PAGE-SENTENCE-KEYS-1.mjs.txt` (standing rule 52).
     - The probe (a CDP evaluate over the section documents) reads the element carrying `page-word--highlighted` (`src/reader/modes/page/helpers/foliateWordHighlight.ts:30`): its `data-word-index`, its text, and the text of the stamped word span just before it in document order.
     - Steps: open the bundled sample *Meditations* in Page and wait until the spans are re-stamped book-wide. Click a word in the middle of a sentence on the current page, then press Ctrl+↓.
       - **Pass:** the highlighted index is greater than the clicked index, and the word before it ends with sentence punctuation by `findSentenceBoundary`'s rule (`/[.!?;:]["'»)\]]*$/`, `text.ts:34-37`). Texts, not only indices (LL-161).
     - Then press Ctrl+↑.
       - **Pass:** the highlighted index is lower than the previous one and ≥ 0, and the word before it also ends with sentence punctuation (or the index is 0).
     - **Control on the base package (standing rule 55):** the same steps leave the highlight at index 0 (no `page-word--highlighted` element on the current page, or one with `data-word-index="0"`) after Ctrl+↓. Record both runs' indices and texts.
  7. **Package verification (standing rule 53):** (a)–(e) below on the final commit with `origin/main` merged in; Blurby.Brain1 confirms.
  8. **Fence (standing rule 41):** `git diff --name-status <base>` lists exactly these paths, plus the memo and `Timing.PAGE-SENTENCE-KEYS-1.jsonl`:
     - `M src/reader/modes/page/ModeRuntime.ts`
     - `A tests/readerModes/pageSentenceKeys.test.ts`
     - `A docs/governance/close-outs/Probe.PAGE-SENTENCE-KEYS-1.mjs.txt`
- **Effort:** S.
- **Owners:** the implementation agent (bounded, renderer-scope); reviewers for spec compliance, then quality; Blurby.Brain1 for package verification; Blurby.Roadmap for the register Seq and the merge go.
- **Source:** Blurby.Brain1 technical ruling G (2026-11-03); PAGE-PARA-KEYS-1's out-of-scope note (`docs/planning/specs/2026-11-03/PAGE-PARA-KEYS-1.md`, "Page's sentence keys"); code at `70d64237`.
- **Path:** dispatch.

##### Implementation detail

- **Edit site (line numbers on `70d64237`; PAGE-PARA-KEYS-1 lands first, so re-grep at the cut):**
  - `src/reader/modes/page/ModeRuntime.ts:422-424`: replace the `sentence` case with the block in Design. `findSentenceBoundary` is already imported (`:17`). The `const words` line (`:384`) stays for `move-selection`.
  - If Done-when 1 finds a live key path into `move-selection`, also replace `:393` with a clamp to the same source: `const source = this.document.useFoliate ? this.document.bookWords?.words : this.document.tokenWords; if (!source || source.length === 0) return; this.publishHighlight(Math.max(0, Math.min(source.length - 1, idx + delta)));` after the existing `markEngaged`/`markPageActivity` calls.
- **Tests:** new `tests/readerModes/pageSentenceKeys.test.ts`.
  - **Harness:** copied (standing rule 52; not imported) from `tests/readerModes/pageParagraphKeys.test.tsx` as PAGE-PARA-KEYS-1 lands it (itself from `tests/readerModes/flowParagraphStarts.test.ts:14-55`): the router with `modules: { page: pageMode }` only, `createFakeDocument({ bookWords: BOOK_WORDS, wordCount: 200, position, tokenWords: [], paragraphBreaks: [] })`, `router.hardSelect({ cfi: null, word: \`w${position}\`, globalWordIndex: position })`, and a Proxy view API on the Page runtime's `viewApiRef` whose `getWords` returns a slice.
  - **Words:** `BOOK_WORDS.words` is 200 words `w0`…`w199`, except that words 9, 49, 119 and 159 end in "." (`w9.`). So sentence starts are 10, 50, 120 and 160. The slice the view API returns is words 100–199 re-indexed 0–99, with "." on slice words 4 and 30, so a slice-sourced answer is recognizably different.
  - **Coverage (LL-174):** each case sends `router.command({ kind: "sentence", direction })` and reads `getSnapshot().highlightedWordIndex`.
  - Cases:
    - **(sk1)** From 105: next → 120, then next → 160. *Base: 0.*
    - **(sk2)** From 125: prev → 120, then prev → 50. *Base: 0.*
    - **(sk3)** `bookWords: null`, with the slice view API set, from 105: next and prev both leave the highlight at 105 (the slice is never the source). *Base: 0.*
    - **(sk4)** `bookWords: null` and no view API, from 105: next leaves it at 105. *Base: 0.*
    - **(sk5) control:** `createFakeDocument({ useFoliate: false, filepath: null, tokenWords: 40 words with "." on 13 and 25, wordCount: 40, paragraphBreaks: [], position: 7 })`. From 7: next → 14, then next → 26. From 20: prev → 14. Passes on the base and after.
    - **(sk6)** From 165: next → 199, the book's last word (no later punctuation). *Base: 0.*
    - **(sk7)** only if Done-when 1 folds `move-selection` in: on the EPUB document from 105, `{ kind: "move-selection", direction: "right" }` → 106. *Base: 0.*
- **Constants:** none.
- **Branch:** `eb/page-sentence-keys-1` from `main` after PAGE-PARA-KEYS-1's merge.
- **Staging plan:** C1 the test (red); C2 `src/reader/modes/page/ModeRuntime.ts`; C3 the probe `.mjs.txt`, the memo and the time log. Explicit paths only. Push `git push origin HEAD:refs/heads/eb/page-sentence-keys-1` (LL-181). Merge `--no-ff` to `main` after Blurby.Brain1's package confirmation and Blurby.Roadmap's merge go (Rule 5b); push `main`.
- **Failure handling:**
  - **(sk5) fails on the base:** the harness differs from the base runtime. Stop and report; do not adjust expected values.
  - **(sk1)–(sk4) or (sk6) pass on the base:** the red does not reproduce the defect. Stop and report (standing rule 43).
  - **The live control highlights a word other than 0 after Ctrl+↓:** the probe cannot see the defect. Stop and report (standing rule 55).
  - **The live pass fails only because the section is not yet book-stamped:** wait for the re-stamp and re-run once; a second failure stops the run.
  - **`readerModeBoundaries` or `readerModeOwnership` flags the change:** the change adds no import and no state; re-read it. If the failure persists, ask Blurby.Brain1 before touching any manifest.
  - One re-run per failing gate, then stop and file an issue. Rollback: `git revert -m 1 <merge>`. No stored data changes.
- **Execution host:** RodneySr (rule 6b). Canonical clone `C:\Users\estra\Projects\Blurby`, worktree `C:\Users\estra\Projects\Blurby\.worktrees\page-sentence-keys-1`, created with `git -C C:/Users/estra/Projects/Blurby worktree add -b eb/page-sentence-keys-1 .worktrees/page-sentence-keys-1 origin/main`. Host prerequisites: `origin/main` contains the RC merge and PAGE-PARA-KEYS-1's merge; `npm ci` completes; the sample *Meditations* opens in a fresh scratch profile. The arm64 launch runs on Rodney at merge.
- **Package verification:** standing rule 53 on RodneySr: (a) `npx electron-builder --win --dir --x64` and the arm64 `--dir` build; (b) a 25 s scratch-profile launch with the LL-165 proof and no error, unhandled-rejection or crash line; (c) `npx asar list` shows the rebuilt `dist/` bundle (extract in the scratchpad, never a worktree root); (d) Done-when 6 on the packaged exe with its base control; (e) a "Package verification" section in the close-out. The arm64 25 s launch runs on Rodney.
- **Lane ownership:** Reader Engine; execution surface A (Page runtime).
- **Forbidden during parallel run:** the Focus, Flow and Narrate mode directories; `src/reader/modes/page/FoliateView.tsx`, `surface.ts` and `helpers/` (PAGE-PARA-KEYS-1 and PAGE-ENTRY-KEYS-1); `src/components/ReaderContainer.tsx`; `src/hooks/useKeyboardShortcuts.ts`; `src/utils/text.ts` (read only).
- **Shared-core touches:** none.
- **Merge order:** after the RC window and after PAGE-PARA-KEYS-1 (same file). Independent of PAGE-ENTRY-KEYS-1 (Seq 119) by file; if both are active, the later one re-greps `ModeRuntime.ts`.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Scope re-grep recorded; red tests (sk1–sk6) committed alone with the tokenized control green | calculable | positive control | bounded | low | 20m | — | — |
| 2 | The sentence case reads the book's words in the highlight's index space, or does nothing | calculable | fix | bounded | low | 10m | — | — |
| 3 | Targeted runs, suite, typecheck, build | calculable | verify | bounded | low | 30m | — | — |
| 4 | Packaged live sentence-key check with base control; rule 53; memo, time log, push | calculable | live verification | bounded | medium | 45m | — | — |

**Total:** chain 1h45m · sum 1h45m; 0 of 4 estimated tasks calibrated (priced by planner estimate)

##### Lessons applied

- **LL-170:** the source is the book-wide word table only; the loaded slice (`effectiveWords()`'s fallback) is not book-wide, and (sk3) proves it is never used.
- **LL-081 / LL-071:** the target is computed in the highlight's own index space, never from `tokenWords` on an EPUB.
- **LL-174:** the red tests go through `router.command` into the real Page runtime.
- **LL-161:** the live check compares texts (the word before the highlight ends a sentence), not only indices.
- **LL-139 / reading-mode isolation:** no import from `focus/` or `flow/`; `findSentenceBoundary` is a shared utility already imported.
- **Standing rule 36:** the scope check and every line are re-grepped at the cut, after PAGE-PARA-KEYS-1.
- **Standing rule 43 (LL-138):** red first, with a tokenized control.
- **Standing rule 48 (LL-149), 41 (LL-136), 44 (LL-143), 50 (LL-156), 52 (LL-146):** as written in Done-when.
- **Standing rule 53 (LL-167), LL-165, standing rule 54 (LL-158), standing rule 55 (LL-151/LL-166):** package, scratch-profile proof, named trigger, base control.
- **LL-181:** worktree placement and the explicit `eb/` refspec.
- **Considered, not applicable:** LL-030 and LL-108 (no save, no anchor commit), LL-159 (no deferred writer), LL-169 (no async lifetime), LL-120 (no class change).
