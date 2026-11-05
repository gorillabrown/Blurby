#### READER-PAGE-COUNTER-1 — The reader shows "p. 40 of ~312" beside the remaining time *(Seq 135; Full Spec 2026-11-03, cited against RC tip `70d64237`; UX polish; owner answers #5–#6 and Blurby.Brain1 ruling B, 2026-11-03)*

- **What:** the reader's bottom bar (ReaderBottomBar) info line shows an approximate page counter, "p. *n* of ~*total*", before the reading times: "p. 40 of ~312 · Ch: 12m | Doc: 3h 5m".
  - A page is 250 words, the same unit as the library card's "323p".
  - The current page comes from the active reading mode's published word index; the total from the book's total word count. The "~" stays on the total.
  - It is the same number in Page, Focus, Flow and Narrate at the same word.
  - It shows only when the word index is book-wide: an EPUB once its book words have loaded, or a tokenized document. Otherwise the slot is empty (no placeholder).
- **Out of scope:**
  - Publisher page numbers (an EPUB page-list) and Page mode's screen pages. The owner chose 250-word pages (#5).
  - Any new persistence, setting or IPC.
  - The library card's own "Np" rounding (`src/utils/bookData.ts:23`) and the Keep/Move prompt's `pg{n}` (`useProgressTracker.ts:315-319`); both unchanged.
  - The pages-read goal (PAGE-PAGES-READ-1).
  - The E-ink layout of the bar (EINK-MODE-AVAILABILITY-1 owns that file's E-ink rows).
- **Why (investigation at `70d64237`):**
  - **Where the time is.** `ReaderBottomBar.tsx:472-479`: the info line holds `rbb-info-progress` (`{Math.round(progress)}%`), the hint, and `rbb-info-time` (`Ch: … | Doc: …`, or the doc time alone). The line is a three-child flex row (`src/styles/page-reader.css:660-671`).
  - **The index is book-wide in every mode (Blurby.Brain1 ruling B).** The saved and published word index is book-wide (`src/reader/ports/ReaderPorts.ts:19-29`); each mode's `usePersistentReadingAnchor` clamps against `totalWordCount()` (for example `flow/helpers/usePersistentReadingAnchor.ts:83`, `focus/helpers/usePersistentReadingAnchor.ts:83`). The bar already receives that index as `wordIndex={currentWordIndex}` (`ReaderContainer.tsx:791`; `currentWordIndex = canonicalWordAnchor = toolbar.currentWordIndex`, `:437`, `:748`), the active runtime's snapshot.
  - **The condition.** On an EPUB the index is book-wide only once the book words are loaded (LL-170). Before that, Page can save a page with no index (`KEEP_STORED_POSITION`, `page/ModeRuntime.ts:590`), and the shell's `bookWords` is null (`ReaderContainer.tsx:196-197`; loaded after a 1–2 s delay, `:600-610`).
  - **The bar cannot tell today.** It receives `activeDoc`, `words` (the tokenized words, empty for an EPUB, `ReaderContainer.tsx:186-190`) and `foliateFraction`, but not `bookWords` or the shell's `totalWordCount` (`:205`). One new prop from the shell is therefore needed. That is a one-line edit in `ReaderContainer.tsx`, a shared-core file.
  - **Approximate pages elsewhere:** the card's total is `Math.max(1, Math.round(wordCount / 250))` (`bookData.ts:3`, `:23`); the prompt's current page is `Math.max(1, Math.ceil(wordIdx / 250))` (`useProgressTracker.ts:316-317`); `APPROX_WORDS_PER_PAGE = 250` (`src/constants.ts:164`).
- **Design:**
  - **Settled by the owner (#5, #6):** a 250-word page, matching the card's "323p"; the label "p. 40 of ~312", shown before the reading times in the bottom bar.
  - **Settled by Blurby.Brain1 (ruling B):** the counter renders only when the active document has book words (EPUB) or is tokenized; it reads the active runtime's published word index and the book's total word count; no new persistence; the "~" stays on the total.
  - **Engineering choices:**
    - **One new prop, `pageWordTotal: number | null`.** The shell passes `useFoliate ? (bookWords?.totalWords ?? null) : (words.length || null)`. Null means "not book-wide yet": no counter. This is the same total the runtimes clamp against when it is known (`ReaderContainer.tsx:205`).
    - **Rounding.** `total = Math.max(1, Math.round(pageWordTotal / APPROX_WORDS_PER_PAGE))`, the card's rule. `current = Math.min(total, Math.max(1, Math.ceil(wordIndex / APPROX_WORDS_PER_PAGE)))`, the Keep/Move prompt's rule, clamped so it never exceeds the total. The card is computed from `activeDoc.wordCount`, which can differ slightly from an EPUB's `bookWords.totalWords`; the counter uses the book-words total because that is the index's own space. Recorded, accepted: the "~" covers it.
    - **One shared helper.** `approxPage(wordIndex, totalWords)` in `src/utils/bookData.ts`, and `bookData.ts`'s private `WORDS_PER_PAGE` (`:3`) is replaced by `APPROX_WORDS_PER_PAGE` from `src/constants.ts` (Constants Separation Rule), so the card and the counter share one number.
    - **Markup.** Inside `rbb-info-time`, before the times: `<span className="rbb-info-page">p. {current} of ~{total}</span>`, then the times in their own `<span className="rbb-info-times">`. The " · " separator is CSS (`.rbb-info-page::after`), so the page span's text is exactly the label.
- **Prerequisites:**
  - The RC integration window merged to `origin/main`; cut from that merge and re-grep (standing rule 36).
  - A shared-core window for `ReaderContainer.tsx` (one prop line): no other active sprint may edit it (AUTO-ARCHIVE-1's Wave A, PAGE-PAGES-READ-1, EINK-VIEW-REFRESH-1 are the queued editors).
  - Shares `ReaderBottomBar.tsx` with DROPDOWN-DISMISS-1 (Seq 133, the chapter effect) and EINK-MODE-AVAILABILITY-1 (Seq 127, the mode buttons). Disjoint hunks; whichever lands later re-greps.
- **Done when** (PowerShell 7, `pwsh`, worktree root on RodneySr; each command passes only on exit 0 unless stated):
  1. **Red first (standing rule 43).** Commit `tests/readerPageCounter.test.tsx` alone. On the base, `npx vitest run tests/readerPageCounter.test.tsx` exits 1: (pc1)–(pc4) and (pc6) fail (no `.rbb-info-page`), and (pc5), (pc7) and (pc8) pass. Record the output.
  2. **The change** at the edit sites below, and nowhere else.
  3. `npx vitest run tests/readerPageCounter.test.tsx tests/readerBottomBarControls.test.tsx tests/einkControls.test.tsx tests/overlayThemeSweep.test.tsx` exits 0, with no existing test edited (standing rule 50).
  4. `npm test`, `npm run typecheck` and `npm run build` exit 0 (standing rule 48).
  5. **Live, packaged (standing rule 53; scratch profile proved before the first input, LL-165).** The probe is saved as `docs/governance/close-outs/Probe.READER-PAGE-COUNTER-1.mjs.txt` (standing rule 52). Nothing is persisted, so the probe reads the rendered `.rbb-info-page` text (standing rule 54).
     - Open the owned fixture `docs/planning/roadmap-reviews/reader-mode-separation-2/live/fixtures/g0-converted-chapters.epub` in Page in a fresh scratch profile.
     - **(p1) No counter before book words.** Sample the bar every 100 ms from the open: while the shell has no book words, `.rbb-info-page` is absent; once present, its text matches `^p\. \d+ of ~\d+$`.
     - **(p2) Same page in every mode.** Turn a few pages, wait for the counter, record its text. Switch Page → Focus → Flow → Narrate (each entered paused, by the bottom-bar mode buttons with real CDP presses) and record the text after each switch settles (500 ms). All four texts are identical, and the runtime's published word index (read through the bar's existing `%` and the canonical anchor in the probe's snapshot) is unchanged across the switches.
     - **(p3) Resize and text size.** Resize the window by −200 px and press Ctrl+= once: the counter text is unchanged.
     - **Detector control (standing rule 55):** the probe first asserts `.rbb-info-time` exists and reads its text, so an absent counter is a real absence; and on the base package (p1)'s sampler records `.rbb-info-page` absent throughout.
  6. Package verification (below) and Blurby.Brain1's confirmation recorded in the close-out.
  7. **Fence (standing rule 41):** `git diff --name-status <base>` lists exactly these paths, plus the memo and `Timing.READER-PAGE-COUNTER-1.jsonl`:
     - `M src/components/ReaderContainer.tsx` (the one prop line)
     - `M src/components/ReaderBottomBar.tsx`
     - `M src/utils/bookData.ts`
     - `M src/styles/page-reader.css`
     - `A tests/readerPageCounter.test.tsx`
     - `A docs/governance/close-outs/Probe.READER-PAGE-COUNTER-1.mjs.txt`
     - and `git diff <base> -- src/components/ReaderContainer.tsx` shows exactly one added line.
- **Effort:** S.
- **Owners:** Blurby.Roadmap (spec, shared-core window, merge go); Blurby.Brain1 (package confirmation); RodneySr implementation session (bounded, renderer-scope); spec-compliance then quality reviewer.
- **Source:** owner answers #5 and #6 (`docs/planning/roadmap-reviews/2026-11-03-owner-design-batch.md`); Blurby.Brain1 technical ruling B (2026-11-03); the 2026-10-26 proposal (`docs/planning/roadmap-reviews/2026-10-26-plan.md:31`); code at `70d64237`.
- **Path:** dispatch.

##### Implementation detail

- **Edit sites (line numbers on `70d64237`; re-grep at the cut):**
  1. **`src/utils/bookData.ts`:**
     - `:3`: delete `const WORDS_PER_PAGE = 250;` and import `APPROX_WORDS_PER_PAGE` from `../constants`; `:23` uses it (same value, same rounding).
     - Add `export function approxPage(wordIndex: number, totalWords: number): { current: number; total: number }` with the two formulas in Design. Non-finite or negative `wordIndex` is treated as 0.
  2. **`src/components/ReaderBottomBar.tsx`:**
     - Props interface (`:22-…`, beside `foliateFraction?: number;` at `:49`): add `/** READER-PAGE-COUNTER-1: the book-wide word total, or null while the index is not book-wide (no counter). */ pageWordTotal?: number | null;`, and destructure it.
     - After the time computation (`:146-152`): `const page = pageWordTotal && pageWordTotal > 0 ? approxPage(wordIndex, pageWordTotal) : null;`.
     - `:476-478` becomes:

       ```tsx
       <span className="rbb-info-time">
         {page && <span className="rbb-info-page">p. {page.current} of ~{page.total}</span>}
         <span className="rbb-info-times">{chapterTimeRemaining ? `Ch: ${chapterTimeRemaining} | Doc: ${timeRemaining}` : timeRemaining}</span>
       </span>
       ```

  3. **`src/styles/page-reader.css`**, after `.rbb-info-hint` (`:669-671`): `.rbb-info-page::after { content: " · "; }`. Existing tokens only; no inline style.
  4. **`src/components/ReaderContainer.tsx`** (shared core), in the `ReaderBottomBar` mount (`:788-823`), after `foliateFraction=…` (`:818`): `pageWordTotal={useFoliate ? (bookWords?.totalWords ?? null) : (words.length || null)}`. Nothing else in the file changes.
- **Tests:** new `tests/readerPageCounter.test.tsx` (jsdom). Harness: `baseProps` copied from `tests/readerBottomBarControls.test.tsx:10-33` (standing rule 52), with `activeDoc.wordCount` set per case.
  - **(pc1)** A tokenized doc of 1,000 words, `pageWordTotal: 1000`, `wordIndex: 750` → `.rbb-info-page` reads "p. 3 of ~4". *Base: absent.*
  - **(pc2)** An EPUB: `words: []`, `foliateFraction: 0.5`, `pageWordTotal: 78000`, `wordIndex: 9875` → "p. 40 of ~312". *Base: absent.*
  - **(pc3)** The clamp: `pageWordTotal: 78000`, `wordIndex: 77999` → "p. 312 of ~312". *Base: absent.*
  - **(pc4)** Mode switches: the same props re-rendered with `readingMode` "page", "focus", "flow" and "narrate" (and the matching `speed`) give the same text each time. *Base: absent.*
  - **(pc5) control:** `pageWordTotal: null` (an EPUB before its book words) → no `.rbb-info-page`, and `.rbb-info-time` still holds the times.
  - **(pc6)** A `focusTextSize` change (100 → 140) leaves (pc2)'s text unchanged. *Base: absent.*
  - **(pc7) control:** the times text (now `.rbb-info-times`, on the base `.rbb-info-time`) reads the same on the base and after, for (pc2)'s props.
  - **(pc8) control:** `formatBookDataLine(80750, 0)` starts with "323p" (the card is unchanged; no `bookData` test exists at `70d64237`, so this is the first).
- **Constants:** none new; `APPROX_WORDS_PER_PAGE` is reused.
- **Branch:** `eb/reader-page-counter-1` from `origin/main` after the RC merge; push `git push origin HEAD:refs/heads/eb/reader-page-counter-1` (LL-181).
- **Staging plan:** C1 the test (red); C2 `src/utils/bookData.ts`, `src/components/ReaderBottomBar.tsx`, `src/styles/page-reader.css`, `src/components/ReaderContainer.tsx`; C3 the probe `.mjs.txt`, the memo and the time log. Explicit paths only. Merge `--no-ff` after Blurby.Brain1's package confirmation and Blurby.Roadmap's merge go (Rule 5b).
- **Failure handling:**
  - **(p2) shows a different page after a mode switch:** the mode hand-off moved the published index (FOCUS-PAUSED-HANDOFF-1's territory), not the counter. Stop and return to Blurby.Brain1 with the four indices; do not change any runtime here.
  - **(p1) shows a counter before book words on an EPUB:** the prop expression is wrong; fix the prop only.
  - **(pc7) changes:** the time markup moved; restore the times text exactly.
  - Two repair passes per gate; then stop. Rollback: `git revert -m 1 <merge>`.
- **Execution host:** RodneySr (rule 6b), clone `C:\Users\estra\Projects\Blurby`, worktree `.worktrees\reader-page-counter-1` (`git -C C:/Users/estra/Projects/Blurby worktree add -b eb/reader-page-counter-1 .worktrees/reader-page-counter-1 origin/main`). Host prerequisites: `npm ci`; the fixture EPUB is in the tree. The arm64 launch runs on Rodney at merge.
- **Package verification (standing rule 53, RodneySr placement):** `--dir --x64` and `--dir --arm64` builds of the final commit with `origin/main` merged; a 25 s x64 scratch-profile launch with the LL-165 proof and no error or crash line; the renderer bundle in `app.asar` matches `dist/` (extract in the scratchpad); Done-when 5 on the packaged exe with its base detector run; a "Package verification" section in the close-out; Blurby.Brain1's confirmation before the merge go. The arm64 25 s launch runs on Rodney.
- **Lane ownership:** UX polish; execution surface C (reader chrome), plus the one shared-core prop line.
- **Forbidden during parallel run:** `src/reader/**`, `src/hooks/useProgressTracker.ts`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`, `main/`, `preload.js`; any `ReaderContainer.tsx` line other than the one prop.
- **Shared-core touches:** `src/components/ReaderContainer.tsx`, one added prop line at the `ReaderBottomBar` mount. Needs its own window: not in parallel with any other `ReaderContainer.tsx` editor.
- **Merge order:** after the RC merge. With DROPDOWN-DISMISS-1 (`ReaderBottomBar.tsx` chapter effect) and EINK-MODE-AVAILABILITY-1 (`ReaderBottomBar.tsx` mode buttons): the first to finish lands first, the other re-greps. With AUTO-ARCHIVE-1 and EINK-VIEW-REFRESH-1 (`ReaderContainer.tsx`): Seq order, one at a time.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red tests show no counter; the null-total, times and card controls pass | repeat | positive-control | bounded | low | 4m (median of 20 runs) | — | — |
| 2 | Shared page helper, the bar's counter, its CSS separator and the one shell prop | repeat | ui-fix | bounded | low | 5m (median of 3 runs) | — | — |
| 3 | Local gates, both reviews, rule 53 pair and the live probe with its base detector run | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |

**Total:** chain 21m · sum 21m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- **LL-170:** the counter shows only when the index is book-wide (book words loaded, or a tokenized document); (pc5) and (p1) prove the "not yet" case.
- **LL-161:** the live rows read the rendered label text, not an index alone.
- **LL-174:** the new value crosses one hop (shell → bar); the live probe drives the real shell.
- **Standing rule 36:** every site cited at `70d64237` and re-grepped at the cut; the shared files are named for rebase.
- **Standing rule 43 (LL-138):** red first, with three controls.
- **Standing rule 48 (LL-149), 41 (LL-136), 50 (LL-156), 52 (LL-146):** as written in Done-when.
- **Standing rule 53 (LL-167) and LL-165:** package with a proven scratch profile; the owned fixture EPUB only.
- **Standing rule 54 (LL-158):** considered: nothing is persisted, so every row reads rendered text.
- **Standing rule 55 (LL-151/LL-166):** the probe asserts the time element first, and the base package must show no counter.
- **LL-181:** worktree placement and the explicit `eb/` refspec.
- **Considered, not applicable:** LL-030 (no save), LL-142/173 (no audio), LL-159 (no deferred write), registry lessons.
