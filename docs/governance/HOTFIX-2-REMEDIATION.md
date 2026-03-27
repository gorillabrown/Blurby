# HOTFIX-2: Foliate EPUB Mode Remediation

**Priority:** P0 — Core reading modes broken on EPUB files
**Scope:** Flow mode, Narration mode, Focus resume on foliate-rendered EPUBs
**Reference:** `Example App/` (Readest) for working foliate-js patterns
**Branch:** `hotfix/2-foliate-modes`

---

## Problem Statement

Sprint TD-2 introduced mode class verticals (FocusMode, FlowMode, NarrateMode) that assume a **static word array** for the entire document. But foliate-js renders EPUBs in **2-4 sections at a time** — word spans (`data-word-index`) exist only for currently loaded sections. As the reader pages forward, old sections unload and new ones load, creating a dynamic DOM that the static mode classes can't track.

### Symptoms

| Mode | Symptom | Root Cause |
|------|---------|------------|
| **Flow** | No visible underline/highlight; pages may turn erratically | `highlightWordByIndex()` can't find word spans beyond loaded sections; auto-advance fires repeatedly |
| **Narration** | Starts at wrong position (word 0, or last word, or random); no audio or highlight | `effectiveWords` is section-relative but `highlightedWordIndex` is global; TTS chunks from invalid position |
| **Focus resume** | Pause → resume starts from word 0 instead of last read word | `highlightedWordIndex` not synced from FocusMode's `currentWord` before closure captures it |

### What Works

- Focus mode initial start (RSVP word display) ✅
- Mode class instantiation with correct types ✅
- Word extraction from foliate DOM ✅
- `highlightWordByIndex()` when target span IS in the DOM ✅

---

## Root Cause Analysis

### The Fundamental Mismatch

```
Mode Classes (static)          Foliate Renderer (dynamic)
─────────────────────          ────────────────────────────
words: string[2887]            DOM sections: 2-4 loaded at a time
currentWord: 0→2886            data-word-index: only for visible sections
config.words frozen at start   Sections load/unload on page turn
```

- **FlowMode** receives `words[0..2886]` at start. Its timer increments `currentWord` linearly. When `currentWord` exceeds the highest `data-word-index` in the DOM, `highlightWordByIndex()` fails silently.
- **NarrateMode** receives the same snapshot. TTS chunks text from `words[startIdx..endIdx]`, but if `startIdx` exceeds the loaded section's range, chunking produces garbage or stops immediately.
- **Focus resume** calls `setHighlightedWordIndex(instance.getCurrentWord())` on pause, but `startFocus()` reads `highlightedWordIndex` from its closure — which captured the value BEFORE the state update flushed.

### Example App (Readest) Approach

Readest avoids this problem entirely by using **CFI (Canonical Fragment Identifiers)** instead of numeric word indices:
- TTS emits `tts-highlight-mark` events with CFI ranges
- Highlights resolve via `view.resolveCFI(cfi)` → DOM Range
- No global word count; positions are always relative to the current DOM state

Blurby can't switch to CFIs without a major rewrite. The fix must work within the existing word-index system.

---

## Fix Strategy: Section-Aware Mode Bridge

Instead of making mode classes section-aware (complex, violates single-responsibility), add a **bridge layer** between mode classes and the foliate renderer. This bridge:

1. Translates mode word indices to foliate DOM queries
2. Handles section boundaries (pause mode → turn page → resume mode)
3. Keeps `highlightedWordIndex` in sync across pause/resume cycles

### Architecture

```
FlowMode / NarrateMode / FocusMode
    │ onWordAdvance(idx)
    ▼
FoliateBridge (NEW)
    ├── highlightWordByIndex(idx) → found?
    │   ├── YES: apply CSS class, scroll into view
    │   └── NO: pause mode → turn page → wait for section load →
    │           re-extract words → update mode → resume from new position
    ├── syncWordPosition() → resolves current visible word index
    └── onSectionLoad() → extends mode's word array, remaps indices
```

### Implementation Plan

#### Step 1: Fix Focus Resume (Quick Win)

**File:** `src/hooks/useReaderMode.ts`

The `handlePauseToPage` function sets `highlightedWordIndex` from `instance.getCurrentWord()`, but `startFocus` captures `highlightedWordIndex` in a stale closure. Fix: use a ref for the highlighted word index that's always current.

```typescript
// In handlePauseToPage:
const currentWord = instance.getCurrentWord();
setHighlightedWordIndex(currentWord);
highlightedWordIndexRef.current = currentWord; // NEW: also set ref

// In startFocus:
const startWord = useFoliate
  ? resolveFoliateStartWord(highlightedWordIndexRef.current, ...) // Use ref, not state
  : highlightedWordIndexRef.current;
```

**Acceptance:** Pause Focus at word N → resume → Focus starts at word N (not 0).

#### Step 2: Fix Flow Mode Highlighting

**Files:** `src/hooks/useReadingModeInstance.ts`, `src/components/FoliatePageView.tsx`

The FlowMode `onWordAdvance` callback must handle the case where `highlightWordByIndex` returns `false` (span not in DOM):

```typescript
// In createInstance("flow") callback:
config.callbacks.onWordAdvance = (idx: number) => {
  onWordAdvanceRef.current(idx);
  if (foliateApiRefStable.current) {
    const found = foliateApiRefStable.current.highlightWordByIndex(idx, "flow");
    if (!found) {
      // Word not in current sections — pause flow, request page turn
      // The page turn triggers onSectionLoad → re-extract → resume
      modeRef.current?.pause();
      foliateApiRefStable.current.next(); // Turn page
      // onWordsReextracted will fire, update words, and we resume
      pendingResumeRef.current = idx;
    }
  }
};
```

In `onWordsReextracted` callback:
```typescript
if (pendingResumeRef.current != null) {
  const resumeIdx = pendingResumeRef.current;
  pendingResumeRef.current = null;
  // Words array now includes the new section
  modeInstanceHook.updateModeWords(wordStrings);
  // Resume flow from where we left off
  modeInstanceHook.modeRef.current?.jumpTo(resumeIdx);
  modeInstanceHook.resumeMode();
}
```

**Acceptance:** Flow mode advances through words with visible underline. When reaching end of page, automatically turns page and continues highlighting on the new page.

#### Step 3: Fix Narration Mode Start Position

**File:** `src/hooks/useReaderMode.ts`

The `startNarration` function must clamp `startIdx` to the effective word array, not use a global index directly:

```typescript
// Current (broken):
let startIdx = highlightedWordIndex; // Global index, may exceed section words

// Fixed:
let startIdx = useFoliate
  ? resolveFoliateStartWord(highlightedWordIndexRef.current, effectiveWords.length,
      () => foliateApiRef.current?.findFirstVisibleWordIndex?.() ?? -1)
  : highlightedWordIndexRef.current;
```

Also apply the same pause-on-miss pattern from Step 2 to Narration's `onWordAdvance`.

**Acceptance:** Narration starts from the visible page position. TTS audio plays. Word highlights advance in the foliate WebView. Page turns automatically when reaching section end.

#### Step 4: Prevent Duplicate Mode Instances

**File:** `src/hooks/useReadingModeInstance.ts`

Add a guard to `startMode` that tracks the active instance ID and ignores callbacks from stale instances:

```typescript
const instanceIdRef = useRef(0);

const startMode = useCallback((mode, wordIdx, words, paragraphBreaks) => {
  if (modeRef.current) {
    modeRef.current.destroy();
  }
  const id = ++instanceIdRef.current;
  const instance = createInstance(mode, words, paragraphBreaks);
  modeRef.current = instance;
  // Wrap callbacks to ignore stale instance calls
  const originalAdvance = instance.config?.callbacks?.onWordAdvance;
  // ... guard with id check
```

**Acceptance:** Rapid mode switching (Focus → Flow → Narration) doesn't leave orphan timers. Only one mode instance exists at a time.

---

## Testing Checklist

### Focus Mode
- [ ] Open EPUB → click word → press Space (Focus) → words display in RSVP ✅ (already works)
- [ ] Pause Focus (Space/Esc) → resume (Space) → resumes from last word, not word 0
- [ ] Pause Focus → click different word → resume → starts from clicked word

### Flow Mode
- [ ] Open EPUB → press Space (Flow selected) → underline cursor moves across words
- [ ] Underline reaches end of page → page turns automatically → underline continues
- [ ] Pause Flow → resume → continues from last position
- [ ] Change WPM during Flow → speed changes immediately

### Narration Mode
- [ ] Open EPUB → press N → Kokoro TTS starts speaking from visible page
- [ ] Word highlights advance in sync with speech
- [ ] Reaches end of page → page turns → speech continues
- [ ] Pause narration → resume → continues from last word
- [ ] Switch voice in settings → narration uses new voice

### Cross-Mode
- [ ] Focus → pause → Flow → words highlighted from same position
- [ ] Flow → pause → Narrate → TTS starts from Flow's last word
- [ ] Any mode → Esc → returns to Page mode at correct position

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useReaderMode.ts` | Use ref for highlightedWordIndex; add pendingResumeRef for section-boundary handling |
| `src/hooks/useReadingModeInstance.ts` | Pause-on-miss logic in Flow/Narration callbacks; instance ID guard |
| `src/components/ReaderContainer.tsx` | Wire onWordsReextracted to resume paused modes |
| `src/components/FoliatePageView.tsx` | highlightWordByIndex already returns boolean (done); verify onSectionLoad word wrapping |
| `src/modes/FlowMode.ts` | updateWords already added (done); verify bounds check in scheduleNext |
| `src/modes/NarrateMode.ts` | updateWords already added (done) |
| `src/utils/startWordIndex.ts` | Already fixed >= 0 (done) |
| `tests/startWordIndex.test.ts` | Already updated (done) |

---

## Tier

**Quick tier** — `npm test` only. No new features, no architecture changes. Targeted bug fix across 6-8 files.

## Estimate

2-3 hours focused work. Steps 1-2 are highest priority (Focus resume + Flow). Step 3 (Narration) follows the same pattern. Step 4 (duplicate guard) is defensive.

## Pre-existing Infrastructure (already done this session)

- `highlightWordByIndex` returns boolean ✅
- `updateWords()` on FlowMode/NarrateMode ✅
- `onWordsReextracted` callback wired to mode sync ✅
- `styleHint` parameter for highlight class ✅
- `foliateWordStrings` state for React-driven rendering ✅
- Guard against overwriting wordsRef for foliate EPUBs ✅
