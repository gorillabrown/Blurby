# SELECTION-1 Investigation: Word Anchor Contract

**Date:** 2026-04-06
**Investigator:** Athena (opus doer)
**Scope:** Read-only investigation of how "current word position" is resolved, stored, and consumed across all reading modes and navigation events.

---

## Section 1: Word Index Sources

### 1A. Distinct Word Lists

There are **four** distinct word lists in the codebase. Each serves a different purpose, and the active source depends on document type and extraction state.

| # | Name | Location | Populated By | Size | Consumers |
|---|------|----------|-------------|------|-----------|
| 1 | `tokenized.words` | `ReaderContainer.tsx:188–191` | `tokenizeWithMeta(activeDoc.content)` in a `useMemo` | Full document word count (non-EPUB) or empty for EPUBs | `wordsRef.current` (non-EPUB path), PageReaderView, legacy chapter detection, keyboard navigation |
| 2 | `foliateWordsRef.current` | `ReaderContainer.tsx:174` | `extractWordsFromView()` or `extractWordsFromSection()` called from FoliatePageView's `onSectionLoad` handler | Only words in currently loaded EPUB sections (DOM viewport) | DOM highlighting via `highlightWordByIndex`, section word management, `foliateWordStrings` state |
| 3 | `bookWordsRef.current.words` | `ReaderContainer.tsx:466` | Main-process IPC `extractEpubWords()` (AdmZip + cheerio extraction of full EPUB) | **Full book** word count — all sections | `getEffectiveWords()` (when `.complete` is true), narration word scheduling, focus/flow word arrays |
| 4 | `wordsRef.current` (from `useReader`) | `src/hooks/useReader.ts:33` | Assigned in `ReaderContainer.tsx:227–229` from `tokenized.words` (non-EPUB) or from `bookWordsRef.current.words` (EPUB when extraction complete), or from `foliateWordsRef` (EPUB pre-extraction) | Varies by document type and extraction state | `useReader` tick loop (legacy Focus mode only), `getEffectiveWords()` fallback, mode instance word arrays |

### 1B. Which Modes Use Which List

| Mode | Primary Word Source | Fallback | Notes |
|------|-------------------|----------|-------|
| **Page** | Not consumed for auto-advance; `highlightedWordIndex` is the position anchor | N/A | Page mode does not advance words. Words are only used for keyboard navigation delta (`handleMoveWordSelection`) |
| **Focus** | `getEffectiveWords()` at start time, passed to `FocusMode.start()` | `tokenized.words` for non-EPUB | Focus receives the words snapshot at start and works from it. `updateWords()` can extend it during EPUB section loads. |
| **Flow** | `getEffectiveWords()` at start time, passed to `FlowMode.start()` | `tokenized.words` for non-EPUB | Same pattern as Focus. FlowScrollEngine additionally builds its own line map from DOM word spans. |
| **Narration** | `getEffectiveWords()` at start time, passed to `NarrateMode.start()` which calls `narration.startCursorDriven()` | `tokenized.words` for non-EPUB | Narration also receives words through `narration.updateWords()` when full-book extraction completes mid-narration. |

### 1C. `getEffectiveWords()` Resolution Order (ReaderContainer.tsx:236-252)

```
if (useFoliate) {
  if (bookWordsRef.current?.complete) return bookWordsRef.current.words;  // Full-book global
  if (foliateApiRef.current) return foliateApiRef.current.getWords().map(w => w.word);  // DOM slice
}
return words;  // tokenized.words (non-EPUB)
```

**Mismatch flag:** Before full-book extraction completes, the DOM-slice word array uses **section-local** indices (e.g., 0-14 for the visible section), but after extraction completes the array uses **global** indices (e.g., 0-50000). The `resolveFoliateStartWord()` function and `resolveRenderedWordIndexToGlobal()` utility manage this transition, but the window between "DOM slice loaded" and "full extraction complete" is a known fragile zone (multiple TTS-7 bugs lived here).

---

## Section 2: Position Resolution -- Per Mode

### 2A. Page Mode

**Start word resolution:** Page mode does not resolve a start word for reading. It is the "home" state. When activated (via `setReadingMode("page")`), the `highlightedWordIndex` state retains whatever value it had.

**On initial book open** (`ReaderContainer.tsx:254-288`):
1. `initReader(activeDoc.position || 0)` -- sets `useReader`'s internal `wordIndex` to saved position
2. `setHighlightedWordIndex(activeDoc.position || 0)` -- sets the page-mode position anchor
3. `resumeAnchorRef.current = (activeDoc.position || 0) > 0 ? activeDoc.position! : null` -- protects saved position from passive events
4. `setReadingMode("page")` -- always starts in page mode
5. For EPUBs: `initialCfi` prop navigates Foliate to the saved CFI

**What happens on mode switch TO Page:** `handlePauseToPage()` (`useReaderMode.ts:367-400`) captures the current mode's word position via `modeInstance.getCurrentWord()`, writes it to `highlightedWordIndex`, and for narration also sets `resumeAnchorRef.current`. Then `stopAllModes()` runs and `setReadingMode("page")`.

**PageMode class** (`PageMode.ts`): Trivial -- `start()` stores the word index, `getCurrentWord()` returns it, `jumpTo()` calls `onWordAdvance`. No timer, no auto-advance.

### 2B. Focus Mode

**Start word resolution** (`useReaderMode.ts:300-333`):
1. `stopAllModes()` -- clears any running mode
2. `extractFoliateWords()` -- refreshes DOM word array if EPUB
3. `getEffectiveWords()` -- gets the active word array
4. Checks `resumeAnchorRef.current` -- if set, uses it as `focusStartSource` and clears the anchor
5. Falls back to `highlightedWordIndexRef.current` as `focusStartSource`
6. For EPUB: calls `resolveFoliateStartWord(focusStartSource, ...)` which validates the index against `wordsLength` (or `globalWordsLength`), tries `findFirstVisibleWordIndex()` if invalid, falls back to 0
7. For non-EPUB: uses `focusStartSource` directly
8. Syncs: `setHighlightedWordIndex(startWord)`, `reader.jumpToWord(startWord)`
9. After `FOCUS_MODE_START_DELAY_MS` timeout: `modeInstance.startMode("focus", startWord, effectiveWords, pBreaks)`

**FocusMode class** (`FocusMode.ts:29-33`): `start(wordIndex)` stores the index, fires `onWordAdvance(wordIndex)` to show the first word, then starts the setTimeout chain via `scheduleNext()`.

**Mode switch inheritance:** Focus inherits from `highlightedWordIndex` (which reflects the previous mode's last position) or from `resumeAnchorRef` (which is set on narration/focus pause).

### 2C. Flow Mode

**Start word resolution** (`useReaderMode.ts:336-364`): Identical pattern to Focus:
1. `stopAllModes()`, `extractFoliateWords()`, `getEffectiveWords()`
2. Resume anchor > highlighted word index
3. `resolveFoliateStartWord()` for EPUB, direct use for non-EPUB
4. `modeInstance.startMode("flow", startWord, effectiveWords, pBreaks)`

**FlowMode class** (`FlowMode.ts:29-33`): Same as FocusMode -- `start(wordIndex)` stores index, fires initial `onWordAdvance`, starts setTimeout chain.

**FlowScrollEngine** (`FlowScrollEngine.ts`): For FLOW-3A infinite scroll, the engine builds a line map from DOM `.page-word` spans, finds the line containing `wordIndex`, scrolls to it, and animates the cursor. Position tracking is done through word spans in the DOM. `jumpToWord()` remaps to a line, `onWordAdvance` callback fires on each word.

### 2D. Narrate Mode

**Start word resolution** (`useReaderMode.ts:177-297`): Most complex due to render-readiness gating:
1. `stopAllModes()`, `extractFoliateWords()`, `getEffectiveWords()`
2. Resume anchor > highlighted word index
3. `resolveFoliateStartWord()` produces the start word
4. **Frozen launch index** (`frozenLaunchIdx`): Once resolved, this value is immutable for this launch attempt. It survives retry loops and async gate polls.
5. **Render-readiness gate** (EPUB only): Uses `resolveWordState()` to poll whether the target word span is visible in the Foliate DOM. If not visible after 3 seconds, navigates to the correct section and retries.
6. Once the word is visible (or after navigation fallback): `modeInstance.startMode("narration", frozenLaunchIdx, effectiveWords, pBreaks)`

**NarrateMode class** (`NarrateMode.ts:62-87`): `start(wordIndex)` stores the word, sets `this.playing = true`, configures rhythm pauses and TTS rate, then calls `narration.startCursorDriven(words, wordIndex, effectiveWpm, onAdvanceCallback)`. The narration engine takes over timing from this point. Word advances come from TTS chunk boundary events, not a timer.

**Narration cursor ownership** (`useNarration.ts:60, 95-97`): The `cursorWordIndex` in the narration reducer is the canonical narration position. It advances via `WORD_ADVANCE` actions dispatched by the TTS strategy callbacks. The `onWordAdvance` callback from the mode config propagates this to `highlightedWordIndex` in ReaderContainer.

---

## Section 3: Navigation Events

### 3A. onRelocate (Foliate)

**What fires it:** The `<foliate-view>` custom element dispatches a `relocate` event whenever the visible content position changes -- page turns, section loads, CFI navigation, scroll position changes.

**Data it carries:** `{ cfi: string, fraction: number, tocItem?: any, pageItem?: any }`

**Who listens:** The `onRelocate` prop on FoliatePageView, which is wired inline in ReaderContainer.tsx:1158-1189.

**State it updates:**
1. `foliateFractionRef.current` = fraction (the SINGLE AUTHORITY for position-as-fraction)
2. `setFoliateFraction(fraction)` for UI rendering
3. `activeDoc.cfi` = detail.cfi (for persistence)
4. `setHighlightedWordIndex(approxWordIdx)` -- BUT ONLY when mode is NOT narration/flow AND no resume anchor is active. The approximate word index is `Math.floor(fraction * wordCount)`.
5. Debounced `updateDocProgress()` IPC call -- only after engagement gate passes and no resume anchor.

**Guard conditions:**
- During narration/flow: skipped (word-advance callback owns position)
- When `resumeAnchorRef.current != null`: skipped (resume anchor is authoritative)
- Before engagement: progress save skipped

### 3B. onLoad (Section Load)

**What fires it:** FoliatePageView's `onSectionLoad` handler calls `onLoadRef.current?.()` at the end of section initialization (after styles injected, words extracted, spans wrapped, click/selection handlers attached).

**Who listens:** The inline `onLoad` callback in ReaderContainer.tsx:1227-1274.

**State it updates** (with a 200ms delay for render completion):
1. Checks `readingModeRef.current` -- skips extraction during narration/flow
2. Calls `extractFoliateWords()` (Page/Focus only)
3. Guard: if `resumeAnchorRef.current != null`, returns early (resume anchor protected)
4. Guard: if `userExplicitSelectionRef.current`, returns early (user click protected)
5. If `activeDoc.position >= FOLIATE_MIN_ENGAGEMENT_POSITION`:
   - `setHighlightedWordIndex(savedPos)` -- sets state to saved position for mode start
   - `findFirstVisibleWordIndex()` + `highlightWordByIndex()` -- visually highlights the first visible word in DOM
6. Else: `findFirstVisibleWordIndex()` -> `setHighlightedWordIndex(firstVisible)`

**Key behavior:** The onLoad handler is the primary mechanism for restoring saved position on book reopen AND for tracking position during page-mode reading. It fires on every section load, not just the first.

### 3C. Page Turn (Paginated Mode)

**What updates wordIndex:**
- Foliate handles pagination internally via CSS multi-column layout
- Page turns trigger `onRelocate` events, which update `highlightedWordIndex` via the fraction-to-word-index approximation (see 3A above)
- In non-EPUB modes, PageReaderView manages its own page state and calls `onWordAdvance` callbacks

### 3D. Scroll (Flow Mode)

**What updates wordIndex:**
- FlowScrollEngine tracks position by line. When a line completes, it fires `onWordAdvance(wordIndex)` with the first word of the next line.
- For EPUB flow (scrolled renderer), Foliate's `relocate` events fire on scroll, but during active flow mode these are ignored (flow-advance callback owns position).

### 3E. Word Click

**What happens when a user clicks a word in Foliate:**

1. The delegated click handler on `doc.body` in `FoliatePageView.tsx:1080-1112`:
   - Finds the clicked `.page-word[data-word-index]` span
   - Resolves the global word index via `resolveRenderedWordIndexToGlobal()`
   - Adds `.page-word--highlighted` CSS class to the clicked span
   - Calls `onWordClick(cfi, word, sectionIndex, wordOffsetInSection, globalWordIndex)`

2. The `onWordClick` handler in `ReaderContainer.tsx:1205-1226`:
   - Sets `hasEngagedRef.current = true`
   - Sets `userExplicitSelectionRef.current = true` (protects from passive overwrites)
   - Sets `resumeAnchorRef.current = null` (explicit selection replaces any resume anchor)
   - Stores CFI: `activeDoc.cfi = cfi`
   - Calls `handleHighlightedWordChange(globalWordIndex)`

3. `handleHighlightedWordChange` (`ReaderContainer.tsx:1054-1065`):
   - Updates `highlightedWordIndexRef.current` synchronously (for same-frame mode starts)
   - `setHighlightedWordIndex(index)` (React state)
   - If narration is actively speaking: calls `narration.resyncToCursor(index, wpm)` to restart TTS from clicked word

4. `selectionchange` handler (`FoliatePageView.tsx:1118-1167`):
   - Fires on double-click word selection
   - Resolves the `.page-word` span from the selection's anchor node
   - Same payload as click: reports exact `globalWordIndex`
   - Falls back to logging + skip if no `.page-word` span found (no guessing)

---

## Section 4: Persistence & Resume

### 4A. Saving Position on Book Close

**Fields in BlurbyDoc** (`src/types.ts:43-94`):
- `position: number` -- word index (integer), the primary saved position
- `cfi?: string` -- EPUB CFI string for exact Foliate navigation
- `furthestPosition?: number` -- high-water mark for backtrack detection

**Save triggers:**

1. **Debounced periodic save (non-EPUB):** `useProgressTracker.ts:110-124` -- fires when `currentPos` changes, debounced with `NON_FOLIATE_PROGRESS_SAVE_MS`. Calls `api.updateDocProgress(docId, currentPos)`.

2. **Debounced periodic save (EPUB):** `ReaderContainer.tsx:1182-1187` inside the `onRelocate` handler -- fires on position changes after engagement, debounced with `FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS`. Calls `api.updateDocProgress(docId, approxWordIdx, cfi)`.

3. **RSVP progress save:** `ReaderContainer.tsx:818-829` -- throttled save during Focus mode, using both time interval (`RSVP_PROGRESS_SAVE_INTERVAL_MS`) and word delta (`RSVP_PROGRESS_SAVE_WORD_DELTA`).

4. **finishReading():** `useProgressTracker.ts:127-157` -- final flush on reader exit. For EPUB: saves `Math.floor(foliateFraction * wordCount)`. For non-EPUB: saves `finalPos`. Also updates `furthestPosition`.

**Position type:** The saved `position` is always a **word index** (integer), never a CFI. CFI is stored separately in `BlurbyDoc.cfi` and used only for Foliate navigation on reopen.

### 4B. Restoring Position on Book Reopen

**Code path** (`ReaderContainer.tsx:254-288`):
1. `initReader(activeDoc.position || 0)` -- sets `useReader`'s `wordIndex`
2. `setHighlightedWordIndex(activeDoc.position || 0)` -- sets the UI anchor
3. `resumeAnchorRef.current = position > 0 ? position : null` -- protects from passive events
4. For EPUB: `initialCfi={activeDoc.cfi || null}` prop on FoliatePageView triggers Foliate navigation
5. After Foliate loads the section: `onLoad` handler fires (see 3B), sets `highlightedWordIndex` to `savedPos`, and visually highlights the first visible word

**Resume anchor lifecycle:**
- **SET** on: narration pause (live cursor), book reopen (saved position > 0), focus/flow pause (when future support added)
- **CONSUMED** on: mode start (Focus/Flow/Narration read it, null it, and use the value)
- **REPLACED** on: explicit user word click (nulled immediately)
- **PROTECTED FROM**: passive `onRelocate` events, passive `onLoad` events

### 4C. Reading Resume Anchor vs wordIndex

There are **two** position anchors:

| Anchor | Type | Owner | Used By |
|--------|------|-------|---------|
| `highlightedWordIndex` (state) | React state (number) | ReaderContainer | All modes at start time, bottom bar position display, progress tracking, keyboard navigation |
| `resumeAnchorRef` (ref) | Mutable ref (number or null) | ReaderContainer | Mode start functions (consumed on use). Protects position from passive Foliate events during the gap between book-open and first mode start. |

For narration specifically, there is also:
| `cursorWordIndex` | Reducer state (number) | `useNarration` | Narration's internal canonical position, advanced by TTS callbacks |
| `lastConfirmedAudioWordRef` | Ref (number) | `useNarration` | Scheduler's authoritative position for chunk generation (TTS-7R) |

---

## Section 5: Current Highlight/Selection Visuals

### 5A. CSS Classes on Word Spans

Found in `src/styles/global.css`:

| Class | Lines | Purpose | Status |
|-------|-------|---------|--------|
| `.page-word` | 3706-3711 | Base class on all word spans. `cursor: pointer`, hover background. | **ACTIVE** -- applied by `wrapWordsInSpans()` in FoliatePageView |
| `.page-word:hover` | 3713-3715 | Hover highlight: `background: var(--accent-faded)` | **ACTIVE** |
| `.page-word--highlighted` | 3717-3723 | Selected/active word: `background: var(--accent-highlighted)`, padding, border-radius | **ACTIVE** -- applied by click handler and `highlightWordByIndex()` |
| `.page-word--flow-cursor` | 3727-3730 | Flow mode cursor: `border-bottom: 3px solid var(--accent)` | **ACTIVE** -- applied by `applyVisualHighlightByIndex()` in FoliatePageView when `styleHint === "flow"` |
| `.page-word--noted` | 3767-3769 | Word with a note annotation: `border-bottom: 2px dotted var(--accent)` | **ACTIVE** -- applied by note system |
| `.reader-pause-word-highlighted` | 659-662 | Highlighted word in pause text view | **ACTIVE** -- used by ReaderView pause display |

### 5B. Narration Overlay (Non-CSS-Class)

Narration does NOT use CSS classes on individual word spans. Instead, it uses a **floating overlay `<div>`** (`highlightRef.current`) positioned via `transform: translate3d()`. This overlay is a fixed-width band spanning the full content area width and one line-height tall. Its Y-position is driven by either:
- Wall-clock lerp (estimate-based, `ensureNarrationOverlayLoop`)
- Audio-progress glide (Kokoro only, `ensureAudioProgressGlideLoop`)

This is a **visual-only** highlight -- it never writes back to any anchor ref. The canonical narration position is always `cursorWordIndex` in the narration reducer.

### 5C. Soft vs Hard Selection

Currently, there is **no** "soft" auto-selected word on page load in the traditional sense. The behavior is:

- On **book reopen with saved position**: `onLoad` calls `findFirstVisibleWordIndex()` and adds `.page-word--highlighted` to that span. This is a visual-only CSS class application; it does not fire `onWordClick` or set `userExplicitSelectionRef`.
- On **word click**: `.page-word--highlighted` is toggled to the clicked word AND `handleHighlightedWordChange` fires, which updates React state.
- On **passive page turn**: No word is highlighted. `highlightedWordIndex` updates via the fraction approximation, but no CSS class is applied to any word span.
- During **Focus mode**: ReaderView shows the single focused word (large, centered). No `.page-word--highlighted` in the EPUB DOM.
- During **Flow mode**: `.page-word--flow-cursor` underlines the current word as the cursor slides.
- During **Narration mode**: The floating overlay band highlights the current line.

---

## Section 6: Gaps and Ambiguities

### 6A. Ambiguous Position Sources

**GAP-1: Fraction-based vs word-index-based position (EPUB)**
- `onRelocate` computes an approximate word index: `Math.floor(fraction * wordCount)`
- This is an **estimate** that can differ from the actual first visible word by dozens of words (especially near section boundaries)
- Mode starts use the **exact** `highlightedWordIndex` (which may have been set from this estimate)
- On book reopen: saved `position` is the fraction-based estimate from the last relocate save
- **Risk:** The saved position and the actual first visible word after Foliate navigation can disagree. The `findFirstVisibleWordIndex()` call in `onLoad` mitigates this for visual highlighting, but `highlightedWordIndex` state still holds the saved estimate.

**GAP-2: Two wordIndex values during Focus mode**
- `wordIndex` from `useReader` (Focus mode's advancement counter)
- `highlightedWordIndex` from ReaderContainer (shared position anchor)
- `useProgressTracker.ts:81`: `currentPos = readingMode === "focus" ? wordIndex : highlightedWordIndex`
- These can diverge: `highlightedWordIndex` is only updated via `onWordAdvance` from the mode instance, which writes to `setHighlightedWordIndex`. But `useReader`'s `wordIndex` is also independently tracked.
- **Risk:** On Focus mode exit, `handleExitReader` syncs them: `setHighlightedWordIndex(wordIndex)`. If this sync is missed (e.g., error path), the two can disagree.

**GAP-3: Section-local vs global indices during extraction transition**
- Before `bookWordsRef.current.complete`: DOM word spans have section-local `data-word-index` attributes (e.g., 0-14)
- After extraction: DOM spans are restamped with global indices (e.g., 5000-5014)
- During the transition window: a word click could report a local index that gets interpreted as a global index
- **Mitigation:** `resolveRenderedWordIndexToGlobal()` handles this, but the timing window between extraction completion and restamping (`requestIdleCallback`) is a fragile gap

### 6B. Fallback to Word 0

**FALLBACK-1: `resolveFoliateStartWord()` returns 0** (`startWordIndex.ts:65`)
- When `highlightedWordIndex` is invalid AND `findFirstVisibleWordIndex()` returns -1
- This means the mode starts from the very beginning of the book
- Can happen when: EPUB cover page has no `.page-word` spans, or Foliate hasn't finished rendering

**FALLBACK-2: `getStartWordIndex()` with out-of-range index** (`startWordIndex.ts:19`)
- If `useFoliate && highlightedWordIndex >= effectiveWordsLength`, returns 0
- Pre-extraction: the effective words length can be tiny (e.g., 14 words for one section) while `highlightedWordIndex` could be 50000. This would fall back to 0.
- **Mitigation (TTS-7K):** `globalWordsLength` parameter added to `resolveFoliateStartWord()` validates against the larger of DOM-slice and full-book lengths

**FALLBACK-3: `onLoad` handler with no saved position** (`ReaderContainer.tsx:1266-1271`)
- If `activeDoc.position` is 0 or undefined and `findFirstVisibleWordIndex()` returns -1, `highlightedWordIndex` stays at 0
- Benign for a new book, but could be confusing if a Foliate render failure causes -1

### 6C. Position Lost on Mode Switch

**LOSS-1: Narration to Page without live cursor capture**
- `handlePauseToPage()` calls `modeInstance.getCurrentWord()` to capture the narration cursor
- If the mode instance has already been destroyed (race condition in cleanup), this could return stale data
- **Mitigation:** The ref-based `modeInstance.modeRef.current` check guards against null

**LOSS-2: Focus mode exit via handleExitReader**
- `handleExitReader()` checks `readingMode === "focus"` and syncs `setHighlightedWordIndex(wordIndex)`
- If `readingMode` has already been changed by a prior call, this sync is skipped
- The `handlePauseToPage()` path handles this correctly; only the direct `handleExitReader()` path has the ordering concern

**LOSS-3: Browse-away during narration**
- When the user manually pages away during narration (`isBrowsedAway = true`), the narration cursor continues advancing
- On pause, `handlePauseToPage` reconciles: `pageStart = pageNavRef.current.getCurrentPageStart()`, sets `highlightedWordIndex = pageStart`
- If `getCurrentPageStart()` returns null (no page nav ref), the browsed-to position is lost and narration's last cursor position is used instead

### 6D. Summary of Ambiguity Points

| Location | What Can Disagree | Severity | Existing Mitigation |
|----------|-------------------|----------|---------------------|
| EPUB fraction estimate vs actual first visible word | `highlightedWordIndex` (estimate) vs DOM truth | Low | `findFirstVisibleWordIndex()` for visual highlight |
| Focus `wordIndex` vs `highlightedWordIndex` | Two counters tracking same position | Medium | Explicit sync on mode exit |
| Section-local vs global indices during extraction | Click reports wrong global index | Medium | `resolveRenderedWordIndexToGlobal()` + restamping |
| Resume anchor vs passive onRelocate | Passive event could overwrite saved position | Was High | `resumeAnchorRef` guard (TTS-7M fix) |
| Narration `cursorWordIndex` vs `highlightedWordIndex` | React state lags behind narration by 1 RAF | Low | RAF-batched flushing in `onWordAdvance` callback |
| `onLoad` position restore vs user click | Passive restore overwrites explicit selection | Was High | `userExplicitSelectionRef` guard (TTS-7J fix) |

---

## Appendix A: Key File References

| File | Key Lines | Role |
|------|-----------|------|
| `src/components/ReaderContainer.tsx:135` | `highlightedWordIndex` state declaration | Central position anchor |
| `src/components/ReaderContainer.tsx:169` | `resumeAnchorRef` declaration | Resume protection |
| `src/components/ReaderContainer.tsx:236-252` | `getEffectiveWords()` | Word source resolution |
| `src/components/ReaderContainer.tsx:254-288` | Book open initialization | Position restore |
| `src/components/ReaderContainer.tsx:1158-1189` | `onRelocate` handler | Fraction-based position update |
| `src/components/ReaderContainer.tsx:1227-1274` | `onLoad` handler | Section load position restore |
| `src/components/ReaderContainer.tsx:1205-1226` | `onWordClick` handler | User word selection |
| `src/components/ReaderContainer.tsx:1054-1065` | `handleHighlightedWordChange` | Narration resync on word change |
| `src/hooks/useReaderMode.ts:177-297` | `startNarration()` | Narration start with render gate |
| `src/hooks/useReaderMode.ts:300-333` | `startFocus()` | Focus start |
| `src/hooks/useReaderMode.ts:336-364` | `startFlow()` | Flow start |
| `src/hooks/useReaderMode.ts:367-400` | `handlePauseToPage()` | Mode exit with position capture |
| `src/hooks/useProgressTracker.ts:59-205` | Progress tracking hook | Debounced saves, backtrack |
| `src/utils/startWordIndex.ts:45-66` | `resolveFoliateStartWord()` | EPUB start word resolution |
| `src/components/FoliatePageView.tsx:1355-1374` | `findFirstVisibleWordIndex()` | DOM viewport word query |
| `src/components/FoliatePageView.tsx:1284-1323` | `resolveWordState()` | Shared render-state resolver |
| `src/components/FoliatePageView.tsx:1080-1112` | Click handler on word spans | Word click -> onWordClick |
| `src/components/FoliatePageView.tsx:1118-1167` | `selectionchange` handler | Double-click selection |
| `src/modes/ModeInterface.ts` | Mode contract | `start(wordIndex)`, `getCurrentWord()`, `jumpTo()` |
| `src/modes/PageMode.ts` | Page mode | No auto-advance, stores position |
| `src/modes/FocusMode.ts` | Focus mode | setTimeout chain, word advancement |
| `src/modes/FlowMode.ts` | Flow mode | setTimeout chain, visual cursor |
| `src/modes/NarrateMode.ts` | Narrate mode | TTS-driven, delegates to useNarration |
| `src/types.ts:43-94` | `BlurbyDoc` schema | `position`, `cfi`, `furthestPosition` |
| `src/utils/FlowScrollEngine.ts` | Flow scroll engine | Line-based position tracking |

## Appendix B: Position Data Flow Diagram

```
Book Open
  |
  v
activeDoc.position (saved word index)
activeDoc.cfi (saved EPUB CFI)
  |
  +---> initReader(position)          --> useReader.wordIndex (Focus counter)
  +---> setHighlightedWordIndex(pos)  --> highlightedWordIndex (shared anchor)
  +---> resumeAnchorRef = position    --> protects from passive events
  +---> initialCfi -> Foliate         --> triggers section load + onRelocate
          |
          v
     onLoad fires
          |
          +--[if page mode, no anchor, no user selection]-->
          |    findFirstVisibleWordIndex() --> highlight CSS class
          |    setHighlightedWordIndex(savedPos or firstVisible)
          |
     onRelocate fires
          |
          +--[if page mode, no anchor]--> setHighlightedWordIndex(fraction * wordCount)
          +--[if narration/flow]-------> SKIP (mode callback owns position)
          +--[if resume anchor]--------> SKIP (anchor is authoritative)

Mode Start (Focus/Flow/Narration)
  |
  v
resumeAnchorRef.current ?? highlightedWordIndexRef.current
  |
  +---> resolveFoliateStartWord()  [EPUB: validate, findFirstVisible, fallback 0]
  +---> direct use                  [non-EPUB: clamp to range]
  |
  v
frozenLaunchIdx (immutable for this launch)
  |
  v
modeInstance.startMode(mode, frozenLaunchIdx, words, paragraphBreaks)
  |
  v
Mode.start(wordIndex) --> onWordAdvance callback --> setHighlightedWordIndex

Mode Pause (any -> Page)
  |
  v
modeInstance.getCurrentWord() --> setHighlightedWordIndex(currentWord)
  [narration only: resumeAnchorRef = currentWord]
  stopAllModes()
  setReadingMode("page")

Word Click (User Action)
  |
  v
onWordClick(cfi, word, ..., globalWordIndex)
  |
  +---> userExplicitSelectionRef = true
  +---> resumeAnchorRef = null
  +---> handleHighlightedWordChange(globalWordIndex)
          |
          +---> highlightedWordIndexRef = index (synchronous)
          +---> setHighlightedWordIndex(index) (React)
          +---> [if narration speaking] narration.resyncToCursor(index)

Book Close
  |
  v
finishReading(finalPos)
  |
  +---> api.updateDocProgress(docId, position, cfi)
  +---> furthestPosition = max(furthest, savePos)
  +---> recordReadingSession(...)
```
