# Dispatch Close-Out Governance Staging — FOCUS-KEYS-FIX-1 (rebuilt to the 2026-10-23 amendment at `568acc60`; every gate passed; merge held for the Stage 8 freeze)

**Run setup:**
- **Branch:** `eb/focus-keys-fix-1` from `refs/remotes/origin/main` @ `b6db250a`.
- **Worktree:** `C:\Projects\Blurby\.worktrees\focus-keys-fix-1`. `node_modules` is a junction to `keep-furthest-fix-1`'s; `package.json` and `package-lock.json` are identical to `36ac7466`.
- **Timing:** after the Stage 8 release (Blurby.Roadmap, 2026-10-23; Seq 76).
- **Register:** nothing was written (standing rule 46).
- **Shared core:** none touched.
- **Bug:** BUG-210.

## The change (per the spec and its prototype)

- **`src/reader/modes/focus/ModeRuntime.ts`, `handleCommand`:**
  - `seek-words` moves the reading word by `delta`.
  - New `sentence` case: moves to `findSentenceBoundary`.
  - New `paragraph` case: moves to `findParagraphStart`, over the surface's paragraph breaks for an EPUB, else the document's.
  - `navigationWord()` gives the word to step from: the engine's word, else the highlighted word.
  - `moveReadingWord(target)` clamps the target. With an engine, it calls `FocusMode.jumpTo`, whose advance publishes the word. Without one, it sets `explicitSelectionAnchor`, the highlight, the display word and the surface highlight.
- **`src/utils/text.ts`:** `findParagraphStart`, v1.28.0's paragraph rule as a pure function.
- **`boundary-policy.json`:** `findParagraphStart` added to `src/utils/text.ts`'s declared exports.
- **`src/reader/modes/ReaderModeAdapter.ts`:** the `paragraph` and `sentence` comments now read `// Page, Focus, Flow`.

### Live finding and Brain ruling A (paragraph keys on an EPUB with full-book words)

- **Finding:** the live triage re-run on `4ea05617` measured Shift+Right in Focus jumping from word 187 to 5290. The surface's paragraph breaks are indices into the loaded slice; the words the keys step over are book-wide.
- **First fix (`39d69454` red, `523a48be`):** `bookParagraphBreaks` mapped loaded-slice breaks to book-wide indices for sections whose word count matched the book's. The live run showed the counts differ per section, so Brain ruled for rendered block starts instead (ruling A).
- **Ruling A (`a20b050b` and `e309bd9d` red, `703a5b89`):**
  - **`src/utils/text.ts`:** `findBookParagraphStart` merges the rendered paragraph starts with the book's section starts. With no sections known it returns `null` and the key does nothing. It replaces `bookParagraphBreaks`.
  - **`src/reader/modes/focus/helpers/foliateParagraphStarts.ts`** (new): reads each block's first stamped word.
  - **`src/reader/modes/focus/FoliateView.tsx`:** tracks the section documents stamped against the book's sections and exposes `getParagraphStartWordIndexes`. A document wrapped before the sections arrived, or mid re-stamp, is left out.
  - **`src/reader/modes/focus/surface.ts`:** passes `getParagraphStartWordIndexes` through. It replaces `getWordSections`.
  - **`ModeRuntime.ts`:** the `paragraph` case uses `findBookParagraphStart` on an EPUB with full-book words.
  - **`boundary-policy.json`:** `findBookParagraphStart` declared.

### Amendment — 2026-10-23 (owner: the paragraph keys use a case-insensitive block lookup)

- **Base:** `refs/remotes/origin/main` was merged in at `64a88faf`. The only conflict was in BUG_REPORT: main's BUG-211 to BUG-216 were kept along with this branch's BUG-210 entry. The amendment's edit sites were re-grepped afterwards (standing rule 36): `BLOCK_TAGS` and `getBlockParent` in `focus/helpers/foliateHelpers.ts` had not changed.
- **Red (`e513db58`, p1):** `focusParagraphStarts.test.ts` adds an XHTML section (`DOMParser`, `application/xhtml+xml`, lowercase `h2`/`p`/`div`/`blockquote`, stamped from 187).
  - On `48203707` the XHTML test fails by assertion, returning `[187]` where `[187, 188, 572, 600]` is expected.
  - The `text/html` control with the same markup passes.
- **Change (`8a0c485f`, then `568acc60`):** `foliateParagraphStarts.ts` no longer uses `collectBlockTextNodes`.
  - It walks the body, plus every element that `isParagraphBlock` accepts, and takes each block's first `[data-word-index]` that is not inside a nested block.
  - The body counts as a block, which keeps the old fallback for words that sit outside any block.
  - The sort and dedupe are kept.
  - `getBlockParent` is untouched (BLOCK-TAG-CASE-1).
- **Deviation in form, a tier 1 technical decision:** the spec wrote `isParagraphBlock` over a new lowercase `PARAGRAPH_BLOCK_TAGS` set.
  - At `8a0c485f`, `tests/readerModeOwnership.test.ts` (G1) failed on that set as an "undeclared module singleton in a mode directory". Declaring it would have meant editing the ownership rules, which are outside the fence.
  - `568acc60` therefore matches the declared `BLOCK_TAGS` with `el.localName.toUpperCase()`. It has the same members and is just as case-insensitive.

## Evidence

| # | Done-when | State | Evidence |
|---|---|---|---|
| 1 | Red first | Done | `1f8ffc40`: the spec's `focusKeys.test.tsx.txt` copied unchanged. On `b6db250a`, 6 of 7 fail, all `AssertionError`; the control passes. |
| 2 | The change | Done | `aa71601b`. The red file passes 7/7. `tests/readerModes/`, `readerModeBoundaries`, `readerModeOwnership`, `focusModeAdapter` and `modes`: 18 files, 132 tests, all passed. `npm run typecheck` exit 0. |
| 2b | Ruling A | Done | Red: `a20b050b` and `e309bd9d`; `findBookParagraphStart` 6 of 6 and the Focus collector 2 of 3 fail by assertion (the "nothing stamped" guard passes). Change: `703a5b89`. Re-run on `703a5b89` (2026-10-23): `bookParagraphStart`, `tests/readerModes/`, `readerModeBoundaries`, `readerModeOwnership`, `focusModeAdapter` and `modes`: 20 files, 141 tests, all passed; `npm run typecheck` exit 0. |
| 3 | Live, `--dir` build, triage re-run of #92–95 | Words and sentences passed on `48203707`; paragraphs failed there and **passed on `568acc60`** | On `48203707` (Blurby.Roadmap's re-run), Ctrl+→, Ctrl+↓ and playing Ctrl+← passed. Shift+→ jumped from section start to section start, and Shift+← landed on 0, which reopened the item. On `568acc60`, the amendment's row (x64 `--dir` package built from a clean `git archive` copy with real `node_modules`, `C:\Projects\Blurby-artifacts\keys-fix\src-568acc60`; scratch profile with preflight; *Meditations*, a TOC jump to INTRODUCTION, Focus at word 187; `focus-568acc60-para.*`, `word-probe.mjs` with `PARA=amend`): Shift+→ paused 187 → 188 → 572 → 610, Shift+← paused 610 → 572 → 188 → 187, Shift+→ playing 195 → 572. All 7 presses equal the probe's DOM block list (`nextBlockStart`/`prevBlockStart`). `liveUnchanged: true`. |
| 4 | `npm test`, typecheck, build | Done on `568acc60`, this machine | `npm run typecheck` exit 0. `npm test`: 184 files, 2,470 passed, 1 skipped, 0 failed. `npm run build` exit 0. At `8a0c485f` the suite's single failure was G1 (`readerModeOwnership`, "every mutable resource has one active owner", the new `PARAGRAPH_BLOCK_TAGS`), which `568acc60` fixed. Logs: `C:\Projects\Blurby-artifacts\keys-fix\focus-568acc60-{typecheck,test,build}.log`. |
| p1 | Amendment red first | Done | `e513db58`: the XHTML test fails by assertion on `48203707`; the `text/html` control passes on both. |
| 5 | Fence | Done (the amendment touched only `foliateParagraphStarts.ts`, `focusParagraphStarts.test.ts`, BUG-210 and this memo) | `M src/reader/modes/focus/ModeRuntime.ts`, `M src/utils/text.ts`, `M src/reader/modes/ReaderModeAdapter.ts`, `M .../boundary-policy.json`, `A tests/readerModes/focusKeys.test.tsx`, `M src/reader/modes/focus/FoliateView.tsx`, `A src/reader/modes/focus/helpers/foliateParagraphStarts.ts`, `M src/reader/modes/focus/surface.ts`, `A tests/bookParagraphStart.test.ts`, `A tests/readerModes/focusParagraphStarts.test.ts`, `M docs/governance/BUG_REPORT.md` (BUG-210), this memo and the time log. `tests/perf-baseline-results.json` is not staged. |

## Lessons

- **Applied:**
  - Standing rule 43: red first, with a control.
  - LL-142: classified from measurement.
  - Reading-mode separation: no sibling import; the helper is shared through the declared `allowedShared` path.
- **Applied in the amendment:** LL-166 (the verdict comes from the runtime's own state through the probe, not from a screenshot), LL-142 (the cause was measured live before the change), and standing rule 36 (the edit sites were re-grepped after the merge).
- **Candidate (amendment, for the close-out):** an XHTML document's `tagName` is lowercase (`application/xhtml+xml`; EPUB sections are XHTML), so a tag check must be case-insensitive (`localName`). The first probe's CSS selector (`querySelectorAll("p, h1, …")`) matches case-insensitively and so hid the difference: the probe found the blocks that the code missed.
- **Candidate:** a renderer's paragraph breaks are indices into what is loaded. Map them to book-wide words from what is rendered, not by matching word counts per section; the counts can differ.
