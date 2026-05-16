# Sprint: Mode System Hardening

**Priority:** P0 — Prevent regression of reading modes (broken 3x in TD-2 → HOTFIX-2 → HOTFIX-2B)
**Branch:** `sprint/mode-hardening`
**Tier:** Quick — `npm test` only. Test-focused sprint, minimal production code changes.
**Prerequisite:** HOTFIX-2B merged to main, Sprint 23 complete.

---

## Problem Statement

The reading mode system has broken three times in three sprints. The root cause isn't bad code — it's that the **glue layer** between mode classes, React hooks, and foliate's dynamic DOM has zero test coverage. Every breakage happened in code that no test could catch:

| Breakage | Layer | Test File | Coverage |
|----------|-------|-----------|----------|
| TD-2: Mode classes created wrong type | `useReadingModeInstance.createInstance` | None | 0% |
| TD-2: wordsRef overwritten for foliate | `useReaderMode.startFocus` | None | 0% |
| TD-2: onWordUpdateRef not called | `useReadingModeInstance.onWordAdvance` | None | 0% |
| HOTFIX-2B: Stale closure on resume | `useReaderMode.handlePauseToPage` | None | 0% |
| HOTFIX-2B: Double page turn | `FoliatePageView.highlightWordByIndex` | None | 0% |
| HOTFIX-2B: Narration global vs section idx | `useReaderMode.startNarration` | None | 0% |

What IS tested: `modes.test.ts` has 420 lines covering mode classes in isolation (start, pause, resume, jumpTo, destroy, rhythm). That's good — the classes themselves are solid. What's missing is everything that wires them together.

---

## Four Tracks

### Track A — Bridge & Orchestration Tests (Highest Value)

**New file:** `tests/useReadingModeInstance.test.ts`

Test the bridge hook that wires mode classes to React state and foliate. Mock the mode classes and foliate API — test that the *wiring* is correct.

| Test Case | What It Verifies |
|-----------|------------------|
| `startMode("focus")` creates FocusMode instance | Correct class instantiation |
| `startMode("flow")` creates FlowMode instance | Correct class instantiation |
| `startMode("narration")` creates NarrateMode with narration interface | Correct class + dependency injection |
| `startMode` destroys previous instance before creating new one | No orphan timers |
| Focus `onWordAdvance` calls both `jumpToWord` and `onWordAdvance` | Dual callback wiring |
| Flow (foliate) `onWordAdvance` calls `highlightWordByIndex` | Foliate highlight wiring |
| Flow `onWordAdvance` pauses mode when `highlightWordByIndex` returns false | Pause-on-miss bridge |
| Flow `onWordAdvance` sets `pendingResumeRef` on miss | Resume state tracking |
| Flow `onWordAdvance` calls `foliateApi.next()` on miss | Page turn trigger |
| Narration `onWordAdvance` calls `highlightWordByIndex` | Foliate highlight wiring |
| Narration `onWordAdvance` does NOT pause mode on miss | TTS continues through boundaries |
| Narration `onWordAdvance` sets `pendingResumeRef` on miss | Page turn tracking |
| `updateModeWords` calls `mode.updateWords()` | Dynamic word array contract |
| `stopMode` nulls `modeRef` | Clean shutdown |
| Non-foliate Flow delegates to `setFlowPlaying` | Legacy FlowCursorController path |

**New file:** `tests/useReaderMode.test.ts`

Test the orchestration hook. Mock the instance hook — test state machine transitions and ref sync.

| Test Case | What It Verifies |
|-----------|------------------|
| `startFocus` reads from `highlightedWordIndexRef`, not state | No stale closure |
| `startFlow` reads from `highlightedWordIndexRef`, not state | No stale closure |
| `startNarration` reads from `highlightedWordIndexRef`, not state | No stale closure |
| `handlePauseToPage` syncs both state AND ref | Ref/state consistency |
| `handleExitReader` syncs both state AND ref | Ref/state consistency |
| `startFocus` setTimeout is guarded by Symbol | No orphan delayed start |
| `stopAllModes` clears `pendingFocusStartRef` | Cancels pending focus |
| `handleTogglePlay` from "page" starts last used mode | Mode memory works |
| `startNarration` caps WPM and restores on stop | WPM cap lifecycle |
| `startFocus` with foliate + empty words triggers page turn + retry | Cover page handling |
| `startFlow` with foliate calls `resolveFoliateStartWord` | Correct start position |

### Track B — TypeScript Contract Enforcement

**File:** `src/modes/ModeInterface.ts`

Make `updateWords` required (not optional `?`). Modes that don't support dynamic words should have a concrete no-op implementation. This prevents future refactors from silently dropping the method.

```typescript
// Before (optional — easy to forget):
updateWords?(words: string[]): void;

// After (required — compiler enforces):
updateWords(words: string[]): void;
```

**File:** `src/modes/PageMode.ts`

Add no-op `updateWords`:
```typescript
updateWords(_words: string[]): void { /* Page mode doesn't track words */ }
```

**File:** `src/modes/FocusMode.ts`

Add `updateWords` (FocusMode currently lacks it — if section loads during Focus, the word array should update):
```typescript
updateWords(words: string[]): void {
  this.config.words = words;
}
```

**New type:** `src/types/bridge.ts`

Formalize the pause-on-miss protocol so Flow and Narration resume paths are type-safe:

```typescript
export interface PendingResume {
  readonly wordIndex: number;
  readonly mode: "flow" | "narration";
}

export interface SectionBridgeCallbacks {
  onMiss: (pending: PendingResume) => void;
  onResume: (pending: PendingResume) => void;
}
```

### Track C — Integration Tests with Mock Foliate

**New file:** `tests/foliate-bridge.test.ts`

Create a `MockFoliateAPI` that simulates section load/unload. Test the full pipeline: mode → bridge → foliate → section load → resume.

**MockFoliateAPI spec:**
```typescript
class MockFoliateAPI {
  private sections: Map<number, Set<number>>; // sectionIndex → wordIndices in DOM
  private currentSection: number = 0;
  private onWordsReextracted: (() => void) | null = null;

  // Simulates highlightWordByIndex — returns true only if word is in loaded sections
  highlightWordByIndex(wordIndex: number, _styleHint?: string): boolean {
    for (const [, words] of this.sections) {
      if (words.has(wordIndex)) return true;
    }
    return false;
  }

  // Simulates page turn — loads next section, unloads oldest if > 3 sections
  next(): void {
    this.currentSection++;
    // Load new section with word range
    this.sections.set(this.currentSection, new Set(range(start, end)));
    // Unload old sections if > 3
    if (this.sections.size > 3) { /* remove oldest */ }
    // Fire reextraction callback
    setTimeout(() => this.onWordsReextracted?.(), 0);
  }

  getWords(): { word: string; sectionIndex: number }[] { /* ... */ }
  findFirstVisibleWordIndex(): number { /* ... */ }
  getParagraphBreaks(): Set<number> { return new Set(); }
}
```

| Test Case | What It Verifies |
|-----------|------------------|
| Flow: advance to word in loaded section → highlight succeeds | Happy path |
| Flow: advance past loaded section → pause → page turn → section loads → resume | Section boundary bridge |
| Flow: advance past TWO sections → multi-page-turn recovery | Deep miss recovery |
| Narration: advance past section → page turn → highlight re-applies (no pause) | Narration continuity |
| Focus: pause at word N → handlePauseToPage → startFocus → resumes at N | Focus resume cycle |
| Mode switch during pending resume → pending cleared, new mode starts clean | Cross-mode safety |
| `updateWords` mid-play → mode continues from correct position | Dynamic word array |
| Rapid mode switching (Focus → Flow → Narration in < 100ms) → only one instance alive | Instance cleanup |
| `stopAllModes` during pending resume → pending cleared | Clean shutdown |

### Track D — Defensive Runtime Guards

**File:** `src/hooks/useReadingModeInstance.ts`

Add bounds check in `onWordAdvance` callbacks:
```typescript
config.callbacks.onWordAdvance = (idx: number) => {
  if (idx < 0 || idx >= config.words.length) {
    console.warn(`[FlowMode] onWordAdvance out of bounds: ${idx} / ${config.words.length}`);
    return; // Swallow — don't crash the timer chain
  }
  // ... existing logic
};
```

**File:** `src/modes/FlowMode.ts`, `src/modes/FocusMode.ts`

Add bounds guard in `scheduleNext`:
```typescript
private scheduleNext(): void {
  if (!this.playing) return;
  if (this.currentWord < 0 || this.currentWord >= this.config.words.length) {
    // Defensive: word array may have been swapped via updateWords
    this.stop();
    this.config.callbacks.onComplete();
    return;
  }
  // ... existing logic
}
```

**File:** `src/hooks/useReadingModeInstance.ts`

Freeze callbacks after creation to prevent accidental overwrite:
```typescript
const createInstance = useCallback((mode: ModeType, words: string[], paragraphBreaks: Set<number>): ReadingMode => {
  const config = buildConfig(words, paragraphBreaks);
  // ... switch/case to customize callbacks ...
  Object.freeze(config.callbacks); // Prevent mutation after wiring
  return instance;
}, [...]);
```

**File:** `src/components/FoliatePageView.tsx`

Add observability logging when `highlightWordByIndex` returns false:
```typescript
if (!targetSpan) {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[foliate] highlightWordByIndex miss: word ${wordIndex} not in DOM (${contents.length} sections loaded)`);
  }
  return false;
}
```

---

## Files Summary

| File | Track | Action |
|------|-------|--------|
| `tests/useReadingModeInstance.test.ts` | A | NEW — Bridge hook tests (~15-20 test cases) |
| `tests/useReaderMode.test.ts` | A | NEW — Orchestration hook tests (~11 test cases) |
| `src/modes/ModeInterface.ts` | B | Make `updateWords` required (remove `?`) |
| `src/modes/PageMode.ts` | B | Add no-op `updateWords` |
| `src/modes/FocusMode.ts` | B | Add `updateWords` implementation |
| `src/types/bridge.ts` | B | NEW — `PendingResume`, `SectionBridgeCallbacks` types |
| `tests/foliate-bridge.test.ts` | C | NEW — Integration tests with MockFoliateAPI (~9 test cases) |
| `tests/modes.test.ts` | A | ADD — `updateWords` tests for Flow, Narrate, Focus (~6 test cases) |
| `src/hooks/useReadingModeInstance.ts` | D | Bounds check in callbacks, freeze callbacks |
| `src/modes/FlowMode.ts` | D | Bounds guard in `scheduleNext` |
| `src/modes/FocusMode.ts` | D | Bounds guard in `scheduleNext` |
| `src/components/FoliatePageView.tsx` | D | Debug logging on highlight miss |

---

## Testing Strategy

All new tests use Vitest. React hooks are tested via `@testing-library/react-hooks` (renderHook). Mode classes are tested directly (no React needed). The MockFoliateAPI is a plain class — no actual DOM or iframe needed.

**Existing test count:** 639 tests across 29 files
**Expected new tests:** ~55-60 tests across 4 new files + additions to 1 existing file
**Target:** 695+ tests across 33+ files, 0 failures

---

## Estimate

~3 hours focused work. Track A is the bulk (~90 min). Track C (~45 min). Track B (~20 min). Track D (~25 min).
