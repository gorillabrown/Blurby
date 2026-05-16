# Sprint: Mode Verticals + Hotfix

**Priority:** P0 — Fix infinite render loop (blocks Narration), off-by-one Focus bug, and structurally prevent future mode regressions
**Branch:** `sprint/mode-verticals`
**Tier:** Quick — `npm test` only. Focused refactor with bug fixes.
**Prerequisite:** Sprint Mode Hardening merged to main, 683 tests passing.

---

## Problem Statement

Two bugs block normal use and one structural problem keeps causing regressions:

1. **Infinite render loop** — Legacy `useEffect` chains in ReaderContainer.tsx (lines 570-576, 579-596) conflict with HOTFIX-2B's `onWordAdvance` bridge in `useReadingModeInstance`. Both systems try to drive `highlightedWordIndex` and call `highlightWordByIndex`, creating a circular cascade that triggers React's "Maximum update depth exceeded" error. **Blocks Narration entirely; causes console spam in Flow.**

2. **Focus off-by-one** — Focus starts one word *after* the selected word instead of *at* it. The mode's `start(wordIndex)` likely schedules the first advance immediately, skipping the starting word.

3. **Shared mutable state fragility** — ReaderContainer is a 700+ line god component where all four modes share `highlightedWordIndex`, `flowPlaying`, and scattered `useEffect` chains. Every sprint that touches one mode breaks another. The bridge layer (HOTFIX-2B) and hardening tests mitigate this, but the architecture itself breeds regressions.

4. **Keyboard shortcut inconsistency** — Narrate uses `N` key while Focus and Flow share `Shift+Space`. All three should cycle on `Shift+Space` for consistency.

---

## Four Steps

### Step 1 — Kill Legacy Effects (Hotfix)

**File:** `src/components/ReaderContainer.tsx`

**Delete lines 570-576** — the `useEffect` that watches `highlightedWordIndex` and calls `highlightWordByIndex` for Flow/Narration modes. This is now handled by `useReadingModeInstance`'s `onWordAdvance` callbacks (lines 138-149 for Flow, lines 159-169 for Narration). The legacy effect creates a duplicate call path that loops.

```typescript
// DELETE THIS ENTIRE BLOCK (lines 570-576):
useEffect(() => {
  if (!useFoliate || readingMode === "page" || readingMode === "focus") return;
  if (!foliateApiRef.current) return;
  foliateApiRef.current.highlightWordByIndex(highlightedWordIndex);
}, [highlightedWordIndex, readingMode, useFoliate]);
```

**Delete lines 579-596** — the `useEffect` with `setInterval` that drives Flow word advancement for foliate EPUBs. This is now handled by `FlowMode`'s internal setTimeout chain via `useReadingModeInstance.startMode("flow", ...)`. The legacy timer creates a second concurrent word advancement loop.

```typescript
// DELETE THIS ENTIRE BLOCK (lines 579-596):
useEffect(() => {
  if (!useFoliate || readingMode !== "flow" || !flowPlaying) return;
  if (!foliateWordsRef.current.length) return;
  const msPerWord = 60000 / effectiveWpm;
  const timer = setInterval(() => {
    setHighlightedWordIndex(prev => {
      const next = prev + 1;
      if (next >= foliateWordsRef.current.length) {
        setFlowPlaying(false);
        return prev;
      }
      return next;
    });
  }, msPerWord);
  return () => clearInterval(timer);
}, [useFoliate, readingMode, flowPlaying, effectiveWpm]);
```

**Why safe:** Both code paths are fully superseded by the HOTFIX-2B bridge in `useReadingModeInstance.ts`:
- Flow highlighting: `createInstance` case "flow" (lines 136-150) calls `highlightWordByIndex` on each `onWordAdvance` and handles pause-on-miss
- Narration highlighting: `createInstance` case "narration" (lines 155-170) calls `highlightWordByIndex` on each `onWordAdvance` and handles page-turn-on-miss
- Flow word advancement: `FlowMode.scheduleNext()` is the timer chain, started by `startMode("flow", ...)` (line 208)

**Verification:** After deletion, test that:
- Flow mode advances words (FlowMode timer drives it)
- Flow highlights appear in foliate DOM (onWordAdvance callback drives it)
- Narration highlights appear (onWordAdvance callback drives it)
- No "Maximum update depth exceeded" errors in console
- `npm test` passes

### Step 2 — Fix Focus Off-by-One

**File:** `src/modes/FocusMode.ts`

The issue is in `start()`. When Focus starts, it should display the starting word FIRST, then begin advancing after the initial delay. Check the `start()` method — if it calls `scheduleNext()` immediately without first calling `onWordAdvance(wordIndex)` for the starting word, that's the bug.

**Expected fix pattern:**
```typescript
start(wordIndex: number): void {
  this.currentWord = wordIndex;
  this.playing = true;
  // Show the starting word FIRST
  this.config.callbacks.onWordAdvance(wordIndex);
  // Then schedule the advance to the NEXT word
  this.scheduleNext();
}
```

If `scheduleNext` increments `currentWord` before calling `onWordAdvance`, then the first word displayed is `wordIndex + 1`. The fix is to ensure the starting word fires `onWordAdvance` before the first `scheduleNext` call.

**Also check:** `useReaderMode.startFocus()` (line 216) calls `reader.jumpToWord(startWord)` which may be the source. If `jumpToWord` advances the word index by 1, that's the off-by-one. Trace the exact path.

**Verification:** Start Focus from Page mode with a word selected. Focus should display that exact word first, then advance.

### Step 3 — Keyboard Shortcut: Shift+Space Cycles All Three Modes

**File:** `src/hooks/useKeyboardShortcuts.ts`

**Current bindings (Page mode, lines 188-194):**
- `KeyN` (no modifiers) → `s.toggleNarration?.()` — enters Narration
- `Space` (no shift) → `s.togglePlay()` — enters last used mode (default Flow)
- `Shift+Space` → `s.enterFocus?.()` — enters Focus

**New bindings (Page mode):**
- **Remove** `KeyN` binding for narration (line 190). `Shift+N` for notes stays.
- `Space` (no shift) → `s.togglePlay()` — unchanged, starts last used mode
- `Shift+Space` → **cycle `lastReadingMode`** clockwise: Flow → Narrate → Focus → Flow

The cycle doesn't START a mode — it just rotates which mode Space will activate. This matches the existing UX where clicking a mode button selects it (sets `lastReadingMode`) and Space starts it.

**Implementation:**

Add a new callback to `useReaderMode.ts` return interface:

```typescript
// In useReaderMode.ts
const handleCycleMode = useCallback(() => {
  const current = settings.lastReadingMode || "flow";
  const cycle: Record<string, "focus" | "flow" | "narration"> = {
    flow: "narration",
    narration: "focus",
    focus: "flow",
  };
  const next = cycle[current] || "flow";
  updateSettings({ lastReadingMode: next });
}, [settings.lastReadingMode, updateSettings]);
```

In `useKeyboardShortcuts.ts`, Page-mode section:

```typescript
// REMOVE: KeyN → toggleNarration (line 190)
// REPLACE Shift+Space binding (line 194):
if (e.code === "Space" && e.shiftKey) { e.preventDefault(); s.cycleMode?.(); return; }
```

**In Focus/Flow/Narration modes** (lines 218+):
- `Space` (no shift) → pause/return to Page — **unchanged**
- `Shift+Space` while in an active mode → cycle to next mode AND start it:

```typescript
// In Focus/Flow/Narration section (after line 220):
if (e.code === "Space" && e.shiftKey) {
  e.preventDefault();
  s.cycleAndStart?.();
  return;
}
```

Add `handleCycleAndStart` to `useReaderMode.ts`:

```typescript
const handleCycleAndStart = useCallback(() => {
  const current = readingModeRef.current;
  if (current === "page") return; // Should not happen — page mode handled above
  const cycle: Record<string, "focus" | "flow" | "narration"> = {
    flow: "narration",
    narration: "focus",
    focus: "flow",
  };
  const next = cycle[current] || "flow";
  stopAllModes();
  setReadingMode("page"); // Brief transition to page
  updateSettings({ lastReadingMode: next });
  // Start the next mode
  if (next === "focus") startFocus();
  else if (next === "narration") startNarration();
  else startFlow();
}, [readingModeRef, stopAllModes, updateSettings, startFocus, startNarration, startFlow]);
```

**Cycle order (clockwise):** Flow → Narrate → Focus → Flow
- From Page mode with Flow selected: Shift+Space → now Narrate is selected (Space would start Narrate)
- From Page mode with Narrate selected: Shift+Space → now Focus is selected
- From active Flow: Shift+Space → stops Flow, starts Narrate
- From active Narrate: Shift+Space → stops Narrate, starts Focus
- From active Focus: Shift+Space → stops Focus, starts Flow

**Wire into keyboard shortcuts interface:** Add `cycleMode` and `cycleAndStart` to the shortcuts interface type and pass from ReaderContainer.

**Verification:**
- In Page mode: Shift+Space cycles the selected mode indicator (bottom bar should reflect)
- In Page mode: Space starts whatever mode is currently selected
- In active mode: Shift+Space switches to next mode seamlessly
- `N` key no longer triggers narration
- `Shift+N` still creates notes

### Step 4 — Update Tests

**File:** `tests/useReaderMode.test.ts` (existing from hardening sprint)

Add test cases:
- `handleCycleMode` rotates flow → narration → focus → flow
- `handleCycleAndStart` from active Flow starts Narration
- `handleCycleAndStart` from active Narration starts Focus
- `handleCycleAndStart` from active Focus starts Flow
- Verify `handleTogglePlay` still starts `lastReadingMode`

**File:** `tests/useKeyboardShortcuts.test.ts` (if exists, or add to relevant test file)

- `KeyN` in page mode does NOT trigger narration
- `Shift+Space` in page mode calls `cycleMode`
- `Shift+Space` in active mode calls `cycleAndStart`
- `Space` in page mode calls `togglePlay`
- `Space` in active mode calls `togglePlay` (pause)

---

## Files Summary

| File | Step | Action |
|------|------|--------|
| `src/components/ReaderContainer.tsx` | 1 | DELETE legacy useEffect blocks (lines 570-576, 579-596) |
| `src/modes/FocusMode.ts` | 2 | Fix start() to display starting word before scheduling advance |
| `src/hooks/useReaderMode.ts` | 3 | Add `handleCycleMode` + `handleCycleAndStart`, export both |
| `src/hooks/useKeyboardShortcuts.ts` | 3 | Remove `KeyN` narration binding, change `Shift+Space` to cycle, add `Shift+Space` in active modes |
| `src/components/ReaderContainer.tsx` | 3 | Wire `cycleMode`/`cycleAndStart` into keyboard shortcuts interface |
| `tests/useReaderMode.test.ts` | 4 | Add cycle mode + cycle-and-start test cases (~5 tests) |

---

## Testing Strategy

**Tier:** Quick — `npm test` only.

Step 1 is the critical hotfix. After deleting the legacy effects, Flow and Narration should work correctly through the HOTFIX-2B bridge path alone. If anything breaks, it means the bridge path has a gap that was masked by the legacy effect — debug that gap rather than restoring the legacy code.

Step 2 is a targeted fix in a single mode class method.

Step 3 is additive — new callbacks and changed key bindings. Low regression risk.

**Target:** 688+ tests (683 existing + ~5 new), 0 failures.

---

## Estimate

~2 hours focused work. Step 1 (~15 min). Step 2 (~20 min). Step 3 (~50 min). Step 4 (~25 min). Smoke test (~10 min).
