## Flow/Narrate Live Iterative SOW Summary
- Date: 2026-05-20
- Branch / commit: main (current)
- Tester: Cowork (computer-use live testing)
- Book: Meditations by Marcus Aurelius (EPUB)
- Result: **blocked**
- Iterations completed: 1 (partial — stopped at Step C)
- Matrix coverage: Fullscreen + Flow-only + 325 wpm + 1.0x speed
- CRIT: 1 (reproduced twice)
- HIGH: 0
- MED: 0
- LOW: 0

### Confirmed Passes
- **Step A (Setup):** Rendered surface stable, active word identifiable, no stale highlight before Play. PASS.
- **Step B (Flow Start and Descent):** Zone started at ~15% from viewport top. Zone visibly descended through text as playback continued. Active-word/WPM-driven progress visible. PASS.
- **Step B accuracy:** Initial zone top around 15% of visible page — matches `FLOW_ZONE_INITIAL_TOP` target. PASS.

### Bugs To Elevate

#### BUG — CRIT: Flow mode drops to Page mode at section/chapter boundary

**Reproduced:** 2 times in 1 session (same book, same path)

**Symptoms:**
1. Flow mode playing normally, zone descending through text
2. Zone reaches the end of a chapter/section (all words consumed, whitespace below)
3. App spontaneously switches from Flow to Page mode
4. Play stops, bottom bar shows Page highlighted, text reflows to narrow Page column
5. Page navigation arrows appear on sides
6. User loses reading position and mode context

**Reproduction steps:**
1. Open Meditations EPUB
2. Enter Flow mode, press Play at 325 wpm
3. Let playback continue through a full chapter/section
4. When the zone reaches the last word of the section, observe

**Root cause (confirmed in code):**

`src/hooks/useFlowScrollSync.ts` line 263-270:
```typescript
onComplete: () => {
  if (isNarratingRef.current) return;
  const doc = activeDocRef.current;
  const nextDoc = getNextQueuedBook(doc.id, libraryRef.current);
  if (!nextDoc) {
    setFlowPlaying(false);
    setReadingMode("page");  // <-- BUG: drops to Page without checking for more EPUB sections
    return;
  }
  // ... cross-book transition
}
```

`FlowScrollEngine.animateLine()` (line 528-531) fires `onComplete` when `lineIdx >= lines.length` — i.e., when all lines in the current Foliate section are consumed. But the `onComplete` handler only checks for a next *queued book*, not for more *sections within the current book*. In a multi-section EPUB, "section done" ≠ "book done."

**Fix approach:**

Before dropping to Page mode in `onComplete`, check if Foliate has more sections:
1. Query `foliateApiRef.current` for section count / current section index
2. If sections remain: call `renderer.next()` to advance, wait for `onLoad`/section-ready, rebuild line map, resume Flow
3. If no sections remain: then and only then treat as book-complete (either cross-book transition or pause at end)

**Edit sites:**
- `src/hooks/useFlowScrollSync.ts` lines 263-286 — `onComplete` callback
- `src/components/FoliatePageView.tsx` — may need to expose section count / has-next-section API
- `src/utils/FlowScrollEngine.ts` — may need a `rebuildAndResume()` method for post-section-advance

**Route:** Flow/Narrate visual sync bug — section-boundary handling

### Step C (Flow Threshold Jump)
- **NOT TESTED** — Flow dropped to Page mode before the 67% threshold could be observed. The zone was descending correctly and the text was advancing, but the section ended before the zone reached 67% of the visible page.

### Steps D-G
- **NOT TESTED** — blocked by CRIT in Step C

### Evidence
- screenshots: Multiple live screenshots captured via computer-use during testing
- bug-report JSON: N/A (app mode dropped before bug report could be filed in-app)
- console excerpts: N/A (DevTools not opened during live test to avoid interference)
- timing notes: Zone descended through ~3 paragraphs (XV-XVII) of Meditations Book II over ~60s before section end triggered the mode drop. Second reproduction followed the same pattern after manually re-entering Flow mode.
