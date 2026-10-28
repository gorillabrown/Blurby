# HOTFIX-10 Investigation: Word Cursor Doesn't Track TTS

**Date:** 2026-03-30
**Investigator:** Cowork (architecture review)
**Status:** Root cause confirmed. Ready for dispatch.

---

## Symptoms

1. **Word cursor doesn't track TTS audio during playback.** Audio plays, user can hear narration, but the highlighted word doesn't advance.
2. **Initial forward-then-backward jump.** On first play, cursor jumps forward briefly then snaps back.
3. **Pause/resume feels unreliable.** Audio may resume but visual cursor doesn't update.

## Root Cause: Global vs. Local Index Mismatch

After HOTFIX-6 extraction completes, the narration pipeline switches from **section-local** word indices to **book-wide global** indices. But the foliate DOM's `<span data-word-index="N">` attributes still use **foliate-local** indices (continuous within the loaded view, starting from 0).

### The Timeline

1. **User starts narration.** Foliate extracts section-local words. `wrapWordsInSpans(doc, sectionIndex, 0)` stamps spans with local indices (0, 1, 2, ...). Narration uses the same local indices. **Cursor tracks correctly.**

2. **HOTFIX-6 extraction completes** (~1-2 seconds later). Main-process IPC returns the full-book word array with global indices. `narration.updateWords(globalWords, globalIdx)` restarts the pipeline with global indices. For example, section-local word 50 maps to global word 6978.

3. **Word timer fires `onWordAdvance(6978)`.** The callback calls `highlightWordByIndex(6978)`, which queries `[data-word-index="6978"]` in the foliate DOM. But the DOM only has spans with indices 0-500 (section-local). **Every single highlight lookup fails.**

4. **Miss handler fires on every word.** In `useReadingModeInstance`, the narration miss handler calls `foliateApiRef.current.next()` for every missed highlight — potentially hundreds of times per second. This triggers cascading page turns and section navigations.

5. **NAR-3 section-boundary effect navigates to correct section** via `goToSection()`. But when the new section loads, `wrapWordsInSpans` is called with `sectionStart = foliateWordsRef.current.length` (foliate-local continuation) — STILL not the global book-wide offset. The mismatch persists.

### Why It Looked Like "Timer Not Working"

The word timer in `audioScheduler.ts` IS firing correctly. `onWordAdvance` callbacks ARE being called with the right global indices. `dispatch({ type: "WORD_ADVANCE" })` IS updating React state. The `setHighlightedWordIndex` IS receiving the global index.

But the DOM highlight query (`[data-word-index="6978"]`) always misses because foliate spans use local indices. The cursor appears frozen because no visual highlight is applied. The React state updates (`highlightedWordIndex`) do update the number, but the foliate-side visual highlight is the user's primary feedback mechanism.

### Evidence Supporting This Theory

- Console showed three narration starts at words 6846, 6978, 7726. The jump from 6846→6978 aligns with `updateWords` converting section-local to global.
- Cursor positions advance BETWEEN restarts (via `stateRef.current.cursorWordIndex`) but don't produce visible highlight DURING playback (DOM query misses).
- "Forward-then-backward jump" = section-local highlight works briefly → extraction completes → updateWords restarts at a different global index → no highlight.
- Pause/resume "unreliable" = audio pauses/resumes correctly (AudioContext suspend/resume) but cursor highlight is broken regardless, making it hard to tell if pause worked.

## Impact on Related Behavior

### Miss-Handler Storm
After extraction, EVERY `onWordAdvance` fires the miss handler, calling `foliateApi.next()`. For 3 words/sec at 1.2x speed, that's ~3 page-advance calls per second. Foliate probably debounces these, but it could cause:
- Unnecessary section loads/unloads
- Performance degradation
- Visual flickering

### Section Navigation Loop
The NAR-3 section-boundary effect correctly navigates to the section containing the global word. But the miss handler ALSO calls `.next()`. These compete, potentially causing back-and-forth navigation.

## Fix Design

### Core Fix: Global Index Stamping

When HOTFIX-6 extraction data is available (`bookWordsRef.current?.complete`), `wrapWordsInSpans` must use the extraction's `section.startWordIdx` as the `globalOffset` — not the foliate-local continuation index.

#### Changes Required

**1. FoliatePageView.tsx — `onSectionLoad` handler (lines 362-372)**

The active-mode branch currently uses:
```typescript
const sectionStart = existingEnd; // = foliateWordsRef.current.length
wrapWordsInSpans(doc, index, sectionStart);
```

After fix — when book extraction is complete, use the extraction's section boundary:
```typescript
const bookSection = bookWordSections?.find(s => s.sectionIndex === index);
const sectionStart = bookSection ? bookSection.startWordIdx : existingEnd;
wrapWordsInSpans(doc, index, sectionStart);
```

**2. FoliatePageView.tsx — Props**

Add a new prop for the book-wide section boundaries:
```typescript
bookWordSections?: SectionBoundary[];
```

Pass `bookWordsRef.current?.sections` from ReaderContainer when extraction is complete.

**3. ReaderContainer.tsx — Post-extraction re-stamp**

After HOTFIX-6 extraction completes and `bookWordsRef.current` is set, re-stamp ALL currently loaded foliate sections with global indices:
```typescript
// After extraction completes:
const contents = foliateApiRef.current?.getView()?.renderer?.getContents?.() ?? [];
for (const { doc: d, index: sectionIndex } of contents) {
  const sec = bookWords.sections.find(s => s.sectionIndex === sectionIndex);
  if (sec) {
    // Remove old spans and re-wrap with global indices
    unwrapWordSpans(d);
    wrapWordsInSpans(d, sectionIndex, sec.startWordIdx);
  }
}
```

This requires exporting `wrapWordsInSpans` (or a wrapper) and adding an `unwrapWordSpans` function.

**4. Miss handler throttle**

In `useReadingModeInstance.ts`, the narration miss handler should NOT call `.next()` when book extraction is complete. The NAR-3 section-boundary effect already handles section navigation. The miss handler should be a no-op (or just log a warning) when `bookWordsRef.current?.complete` is true.

### Pause/Resume Fix

Pause/resume works correctly at the scheduler level. The perceived unreliability is because the cursor highlight is broken (no visual feedback). Once the global index fix is applied, pause/resume will appear to work correctly because the cursor will track.

### Forward-Backward Jump Fix

The jump is caused by `updateWords` restarting narration at a different (global) index while the DOM still has local indices. The re-stamp step (change #3) eliminates this: after extraction, the DOM is re-stamped with global indices, so the cursor transitions smoothly from local → global without a visible jump.

## Files to Change

| File | Change | Risk |
|------|--------|------|
| `src/components/FoliatePageView.tsx` | Add `bookWordSections` prop, use global offset in `onSectionLoad` active-mode branch | Medium — core DOM wiring |
| `src/components/ReaderContainer.tsx` | Pass `bookWordSections` prop, add post-extraction re-stamp | Medium — extraction effect |
| `src/hooks/useReadingModeInstance.ts` | Guard narration miss handler when extraction complete | Low — conditional skip |

## Not Changed

- `src/utils/audioScheduler.ts` — Word timer is working correctly. No changes needed.
- `src/utils/generationPipeline.ts` — Pipeline is working correctly.
- `src/hooks/narration/kokoroStrategy.ts` — Strategy wiring is correct.
- `src/hooks/useNarration.ts` — Callbacks are wired correctly.

## Test Plan

1. Start narration on an EPUB. Verify cursor tracks audio BEFORE and AFTER extraction completes (no gap).
2. Navigate to a new section during narration. Verify cursor continues tracking in the new section.
3. Pause narration. Verify cursor freezes. Resume. Verify cursor resumes from correct position.
4. Change speed during narration. Verify cursor restarts and continues tracking.
5. All 860 existing tests pass. No new test files needed (this is a DOM-wiring fix, not a logic change).
