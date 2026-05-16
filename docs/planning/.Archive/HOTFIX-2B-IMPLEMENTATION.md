# HOTFIX-2B: Foliate EPUB Mode Bridge — Revised Implementation Plan

**Priority:** P0 — Core reading modes broken on EPUB files
**Supersedes:** `HOTFIX-2-REMEDIATION.md` (retains root cause analysis; replaces implementation plan)
**Branch:** `hotfix/2b-foliate-bridge`
**Tier:** Quick — `npm test` only. Targeted bug fix, no new features.

---

## What Changed From HOTFIX-2

The original spec correctly identified all root causes. This revision fixes three implementation issues discovered during code review:

1. **Double page-advance bug:** `highlightWordByIndex()` already calls `view.renderer.next()` when a span isn't found (line 533 of FoliatePageView). The original spec's bridge *also* calls `.next()` on miss — causing two page turns per miss. Fix: make `highlightWordByIndex` pure (return boolean, no side effects).

2. **Missing ref in handlePauseToPage/handleExitReader:** Original spec adds `highlightedWordIndexRef` to `startFocus` but doesn't address the *write* side in `handlePauseToPage` and `handleExitReader`, which also need to set the ref immediately.

3. **Overly broad instance guard:** Full instance-ID wrapping is overkill. The actual risk is the `setTimeout` in `startFocus` (line 215 of useReaderMode.ts). A targeted guard there is cheaper and sufficient.

---

## Implementation Steps (5 Steps, Priority Order)

### Step 0: Make `highlightWordByIndex` Pure

**File:** `src/components/FoliatePageView.tsx`
**Lines:** 530-535

Remove the auto-advance side effect from `highlightWordByIndex`. Currently when a word span isn't found, it calls `view.renderer.next()` *and* returns `false`. This couples highlighting to page navigation. The bridge (Step 2) needs to own page-turn decisions — if highlighting also triggers page turns, we get double advances.

**Before:**
```typescript
// Word not found in DOM — auto-advance page to load the next section
if (!targetSpan) {
  try { view.renderer.next(); } catch { /* */ }
  return false;
}
```

**After:**
```typescript
// Word not found in loaded sections — caller decides what to do
if (!targetSpan) {
  return false;
}
```

**Acceptance:** `highlightWordByIndex` returns `false` without side effects when span not found.

---

### Step 1: Add `highlightedWordIndexRef` (Fixes Focus Resume + Narration Start)

**File:** `src/hooks/useReaderMode.ts`

The `highlightedWordIndex` state variable is captured in stale closures. Add a ref that's always current, and use it everywhere a callback reads the position.

**1a. Declare ref (after line 122):**
```typescript
const highlightedWordIndexRef = useRef(highlightedWordIndex);
highlightedWordIndexRef.current = highlightedWordIndex;
```

**1b. Update ref in `handlePauseToPage` (line 247-256):**
```typescript
const handlePauseToPage = useCallback(() => {
  const instance = modeInstance.modeRef.current;
  if (instance && readingMode === "focus") {
    const currentWord = instance.getCurrentWord();
    setHighlightedWordIndex(currentWord);
    highlightedWordIndexRef.current = currentWord; // Sync ref immediately
  }
  stopAllModes();
  setReadingMode("page");
  updateSettings({ readingMode: "page" });
}, [readingMode, updateSettings, stopAllModes, setHighlightedWordIndex, modeInstance]);
```

**1c. Update ref in `handleExitReader` (line 301-311):**
Same pattern — after `instance.getCurrentWord()`, set both state and ref.

**1d. Use ref in `startFocus` (line 206-208):**
```typescript
const startWord = useFoliate
  ? resolveFoliateStartWord(highlightedWordIndexRef.current, effectiveWords.length,
      () => foliateApiRef.current?.findFirstVisibleWordIndex?.() ?? -1)
  : highlightedWordIndexRef.current;
```

**1e. Use ref in `startFlow` (line 234-236):**
Same substitution — `highlightedWordIndexRef.current` instead of `highlightedWordIndex`.

**1f. Use ref in `startNarration` (line 179):**
```typescript
let startIdx = highlightedWordIndexRef.current;
```

**1g. Update `useCallback` dependency arrays:**
Remove `highlightedWordIndex` from the dependency arrays of `startFocus`, `startFlow`, and `startNarration`. The ref replaces it — no dependency needed since refs don't trigger re-renders.

**Acceptance:**
- Pause Focus at word N → resume → Focus starts at word N (not 0)
- Start Narration → starts from visible page position (not word 0 or last word)
- Start Flow → starts from correct position

---

### Step 2: Add Pause-on-Miss Bridge for Flow Mode

**Files:** `src/hooks/useReadingModeInstance.ts`, `src/components/ReaderContainer.tsx`

When FlowMode advances to a word not in the DOM, pause the mode, let foliate load the next section, then resume.

**2a. Add `pendingResumeRef` in `useReadingModeInstance.ts`:**
```typescript
const pendingResumeRef = useRef<{ wordIndex: number; mode: "flow" | "narration" } | null>(null);
```

**2b. Update Flow's `onWordAdvance` in `createInstance` (line 131-139):**
```typescript
case "flow":
  if (isFoliate) {
    config.callbacks.onWordAdvance = (idx: number) => {
      onWordAdvanceRef.current(idx);
      if (foliateApiRefStable.current) {
        const found = foliateApiRefStable.current.highlightWordByIndex(idx, "flow");
        if (!found) {
          // Word not in loaded sections — pause, turn page, wait for section load
          modeRef.current?.pause();
          pendingResumeRef.current = { wordIndex: idx, mode: "flow" };
          foliateApiRefStable.current.next(); // Request page turn
          // onWordsReextracted (wired in ReaderContainer) will resume
        }
      }
    };
  }
  return new FlowMode(config);
```

**2c. Expose `pendingResumeRef` and `resumeMode` from the hook return:**
Add `pendingResumeRef` to `UseReadingModeInstanceReturn` interface and the return object.

**2d. Wire resume logic in `ReaderContainer.tsx` `onWordsReextracted` callback (line 697-707):**
```typescript
onWordsReextracted={() => {
  const newWords = foliateApiRef.current?.getWords?.() ?? [];
  if (newWords.length > 0) {
    const wordStrings = newWords.map((w: { word: string }) => w.word);
    wordsRef.current = wordStrings;
    setFoliateWordStrings(wordStrings);
    modeInstanceHook.updateModeWords(wordStrings);

    // Resume a paused mode after section load
    const pending = modeInstanceHook.pendingResumeRef.current;
    if (pending) {
      modeInstanceHook.pendingResumeRef.current = null;
      // Allow DOM to settle after word extraction + span wrapping
      requestAnimationFrame(() => {
        const instance = modeInstanceHook.modeRef.current;
        if (instance && instance.type === pending.mode) {
          // Try highlighting the pending word in the new section
          const found = foliateApiRef.current?.highlightWordByIndex(
            pending.wordIndex, pending.mode
          );
          if (found) {
            instance.resume();
          } else {
            // Still not found — word may be further ahead. Turn another page.
            modeInstanceHook.pendingResumeRef.current = pending;
            foliateApiRef.current?.next();
          }
        }
      });
    }
  }
}}
```

**Acceptance:**
- Flow mode advances through words with visible underline/cursor
- When underline reaches end of loaded section, page turns automatically
- After page turn, underline continues on the new page from the correct word
- No double page turns
- Pausing and resuming Flow works across section boundaries

---

### Step 3: Apply Same Bridge to Narration Mode

**File:** `src/hooks/useReadingModeInstance.ts`

Narration's `onWordAdvance` needs the same pause-on-miss treatment as Flow.

**3a. Update Narration's `onWordAdvance` in `createInstance` (line 143-151):**
```typescript
case "narration":
  config.callbacks.onWordAdvance = (idx: number) => {
    onWordAdvanceRef.current(idx);
    if (isFoliate && foliateApiRefStable.current) {
      const found = foliateApiRefStable.current.highlightWordByIndex(idx, "narration");
      if (!found) {
        // Narration continues playing (TTS doesn't need DOM) —
        // but we need to turn the page so highlights catch up
        pendingResumeRef.current = { wordIndex: idx, mode: "narration" };
        foliateApiRefStable.current.next();
        // Note: we do NOT pause NarrateMode here. TTS should keep speaking.
        // The bridge just ensures the page turns so highlights resume.
      }
    }
  };
  return new NarrateMode(config, narration);
```

**Key difference from Flow:** Narration doesn't pause the mode. TTS should keep speaking through section boundaries — only the visual highlight is lost temporarily. The page turn loads new sections, `onWordsReextracted` fires, and the next `onWordAdvance` call will find its span.

For Narration, the `onWordsReextracted` resume logic needs a variant: instead of pausing/resuming, it just re-highlights the current word:
```typescript
if (pending && pending.mode === "narration") {
  modeInstanceHook.pendingResumeRef.current = null;
  requestAnimationFrame(() => {
    // Just re-apply the highlight — narration is still playing
    foliateApiRef.current?.highlightWordByIndex(pending.wordIndex, "narration");
  });
}
```

**Acceptance:**
- Narration starts from visible page position
- TTS audio plays continuously
- Word highlights advance in the foliate view
- Page turns automatically when reaching section end
- TTS does not stutter or pause at section boundaries

---

### Step 4: Guard the `startFocus` setTimeout

**File:** `src/hooks/useReaderMode.ts`, line 215

The `setTimeout(() => modeInstance.startMode(...), FOCUS_MODE_START_DELAY_MS)` can fire after a mode switch if the user changes modes during the delay.

**Fix:**
```typescript
// Capture current mode ref before scheduling
const focusStartId = Symbol();
pendingFocusStartRef.current = focusStartId;
setTimeout(() => {
  // Only start if no other mode was started during the delay
  if (pendingFocusStartRef.current !== focusStartId) return;
  modeInstance.startMode("focus", startWord, effectiveWords, pBreaks);
}, FOCUS_MODE_START_DELAY_MS);
```

Add `pendingFocusStartRef` as a `useRef<symbol | null>(null)` at the top of `useReaderMode`, and clear it in `stopAllModes`.

**Acceptance:**
- Rapid mode switching (Focus → Flow within FOCUS_MODE_START_DELAY_MS) doesn't leave orphan timers
- Focus mode still starts correctly after the delay

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `src/components/FoliatePageView.tsx` | Remove auto-advance side effect from `highlightWordByIndex` (Step 0) |
| `src/hooks/useReaderMode.ts` | Add `highlightedWordIndexRef`, use in all start functions, guard setTimeout (Steps 1, 4) |
| `src/hooks/useReadingModeInstance.ts` | Add `pendingResumeRef`, pause-on-miss in Flow/Narration callbacks, expose ref (Steps 2, 3) |
| `src/components/ReaderContainer.tsx` | Wire resume logic in `onWordsReextracted` callback (Steps 2, 3) |

No changes to mode class files (FocusMode.ts, FlowMode.ts, NarrateMode.ts). Modes stay simple.

---

## Testing Checklist

### Focus Mode
- [ ] Open EPUB → start Focus → words display in RSVP ✅ (already works)
- [ ] Pause Focus (Space/Esc) → resume (Space) → resumes from last word, not word 0
- [ ] Pause Focus → click different word → resume → starts from clicked word

### Flow Mode
- [ ] Open EPUB → start Flow → underline cursor moves across words
- [ ] Underline reaches end of page → page turns automatically → underline continues
- [ ] No double page turns at section boundaries
- [ ] Pause Flow → resume → continues from last position
- [ ] Change WPM during Flow → speed changes immediately

### Narration Mode
- [ ] Open EPUB → start Narration → TTS starts speaking from visible page
- [ ] Word highlights advance in sync with speech
- [ ] Reaches end of page → page turns → speech continues without stutter
- [ ] Pause narration → resume → continues from last word

### Cross-Mode
- [ ] Focus → pause → Flow → highlights from same position
- [ ] Flow → pause → Narrate → TTS starts from Flow's last word
- [ ] Any mode → Esc → returns to Page mode at correct position
- [ ] Rapid Focus → Flow switch during FOCUS_MODE_START_DELAY_MS → no orphan timer

### Regression
- [ ] Non-EPUB documents: Focus, Flow, Narration all still work (no foliate code paths)
- [ ] `npm test` passes (all 585+ tests)
- [ ] `npm run build` succeeds

---

## Estimate

~2 hours focused work. Step 0-1 are quick (~30 min). Steps 2-3 are the bulk (~75 min). Step 4 is ~15 min.
