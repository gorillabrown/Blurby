# HOTFIX-10 v1.4.6 — Global Index Alignment

## CLI Dispatch (Ready to Paste)

```
## HOTFIX-10 v1.4.6 — Global Index Alignment

### KEY CONTEXT
After HOTFIX-6 main-process extraction, the narration pipeline uses book-wide global word indices, but foliate DOM `<span data-word-index="N">` attributes still use section-local indices. Every `highlightWordByIndex(globalIdx)` query misses. Cursor appears frozen during TTS playback even though audio plays correctly. All pipeline/scheduler code is working — the bug is purely DOM index mapping.

### PROBLEM
1. Word cursor doesn't track TTS after HOTFIX-6 extraction completes — `[data-word-index="6978"]` query fails because DOM has local indices (0-500).
2. Miss handler fires `foliateApi.next()` ~3/sec during narration — unnecessary page turns.
3. "Forward-then-backward jump" on first play — extraction switches index space mid-playback.

### EVIDENCE OF PROBLEM
Console shows narration starts at 6846→6978→7726 with no cursor advance during playback. Investigation: `docs/project/HOTFIX-10-investigation.md`.

### HYPOTHESIZED SOLUTION
Three changes: (1) Use extraction's `section.startWordIdx` as `globalOffset` in `wrapWordsInSpans` during narration. (2) Re-stamp loaded foliate sections with global indices after extraction completes. (3) Guard narration miss handler when extraction is complete (skip `.next()`).

### WHAT (Tasks to Complete)

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Add `bookWordSectionsRef` to FoliatePageView props; in `onSectionLoad` active-mode branch, use `section.startWordIdx` as globalOffset when available | `renderer-fixer` | sonnet |
| 2 | In ReaderContainer HOTFIX-6 extraction useEffect, re-stamp all loaded foliate sections with global indices BEFORE calling `narration.updateWords()` — create `unwrapWordSpans(doc)` helper, call `wrapWordsInSpans(doc, sectionIndex, sec.startWordIdx)` for each loaded section | `renderer-fixer` | sonnet |
| 3 | In useReadingModeInstance narration `onWordAdvance`, skip `foliateApi.next()` miss handler when `bookWordSectionsRef` is provided and has data | `renderer-fixer` | sonnet |
| 4 | `npm test` — 860+ pass, 0 fail | `test-runner` | — |
| 5 | `npm run build` — succeeds | `test-runner` | — |
| 6 | Doc-keeper: ROADMAP, CLAUDE.md, LESSONS_LEARNED, bump package.json to 1.4.6 | `doc-keeper` | — |
| 7 | Git: commit on `hotfix/10-global-index-alignment`, merge to main with --no-ff | `doc-keeper` | — |
| 8 | Print terminal summary | `renderer-fixer` | — |

### WHERE (Read in This Order)

1. `docs/project/HOTFIX-10-investigation.md` — Full root cause analysis and fix design
2. `docs/governance/LESSONS_LEARNED.md` — Scan LL-054, LL-055
3. `src/components/FoliatePageView.tsx` lines 137-190 — `wrapWordsInSpans` function
4. `src/components/FoliatePageView.tsx` lines 340-385 — `onSectionLoad` handler
5. `src/components/FoliatePageView.tsx` lines 195-215 — Props interface
6. `src/components/ReaderContainer.tsx` lines 290-336 — HOTFIX-6 extraction effect
7. `src/hooks/useReadingModeInstance.ts` lines 155-170 — Narration miss handler
8. `src/types/narration.ts` — `SectionBoundary` type

### HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|----------------|
| `renderer-fixer` | sonnet | Steps 1-3: props threading, re-stamp logic, miss handler guard |
| `test-runner` | — | Steps 4-5: test + build |
| `doc-keeper` | — | Steps 6-7: docs + git |

### WHEN (Execution Order)

[1] FoliatePageView: bookWordSectionsRef prop + global offset (renderer-fixer)
    ↓
[2] ReaderContainer: post-extraction re-stamp (renderer-fixer)
    ↓
[3] useReadingModeInstance: miss handler guard (renderer-fixer)
    ↓
[4-5] PARALLEL: npm test + npm run build
    ↓ (both pass)
[6-7] SEQUENTIAL: doc-keeper + git
    ↓
[8] Terminal summary

### ADDITIONAL GUIDANCE

- **DO NOT modify audioScheduler.ts, generationPipeline.ts, kokoroStrategy.ts, or useNarration.ts.** The pipeline and word timer are working correctly.
- **Create `unwrapWordSpans(doc: Document)`** — Remove all `.page-word` wrapper spans, restore text content as plain text nodes. Handle CSS classes `page-word--highlighted` and `page-word--flow-cursor`.
- **Re-stamp timing:** Re-stamp BEFORE `narration.updateWords()`. DOM must have global indices by the time pipeline restarts with global indices.
- **Thread via ref, not state.** `bookWordSectionsRef` (React ref to `SectionBoundary[] | null`) avoids re-renders. FoliatePageView reads it in the `onSectionLoad` callback.
- **`view.renderer.getContents()`** returns `{ doc, index }[]` for loaded sections. Use `index` to look up the section in bookWordSections.
- **Export `wrapWordsInSpans` and new `unwrapWordSpans`** from FoliatePageView (or extract to a utility) so ReaderContainer can call them during re-stamp.
- **Anti-pattern:** Do NOT convert global indices back to local in the callback chain. Stamp global indices in the DOM.

### SUCCESS CRITERIA

1. Cursor visually tracks TTS during narration — no frozen cursor after extraction
2. Cursor tracks across section boundaries
3. No forward-then-backward jump on first play
4. Pause/resume shows cursor at correct position
5. No `[foliate] highlightWordByIndex miss` console logs during narration with extraction complete
6. `npm test`: 860+ pass, 0 fail
7. `npm run build`: succeeds
8. `package.json`: `1.4.6`
9. Docs updated (ROADMAP, CLAUDE.md, LESSONS_LEARNED)
10. Branch merged to main
```
