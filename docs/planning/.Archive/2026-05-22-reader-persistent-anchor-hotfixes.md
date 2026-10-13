# Reader Persistent Anchor Hotfixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make one durable per-book word anchor control book open, mode switching, playback starts, click retargeting, and jump-back behavior across Page, Focus, Flow, and Narrate.

**Architecture:** Add a small persistent word-anchor policy and hook, then route mode selection, mode start, hard word clicks, and active mode advancement through it. Keep Page as the only paginated surface, make Focus/Flow/Narrate use the scrolled Foliate surface when selected, and keep mode selection paused until Play or Space starts the selected mode.

**Tech Stack:** React, TypeScript, Vitest, Electron renderer APIs, Foliate EPUB renderer, existing `useReaderMode` and `ReaderContainer` orchestration.

---

## Requirements Trace

| Requirement | Implementation Tasks |
|---|---|
| Persistent single-word hard selection per book across all modes | Tasks 1, 2, 4, 5 |
| Book open always starts in Page mode at persistent last-read word | Tasks 3, 4 |
| Switching modes starts paused | Tasks 5, 7 |
| Switching modes starts at persistent last-read word | Tasks 4, 5 |
| User can navigate away from persistent word in every mode | Tasks 6, 7 |
| Page jump-back button after browsing away | Task 6 |
| Focus paused uses infinite scroll and jump-back; Play starts single-word Focus at persistent word | Tasks 5, 6, 7 |
| Flow uses infinite scroll; browsing away while playing pauses Flow | Tasks 5, 6 |
| Narrate uses infinite scroll; browsing away does not stop audio | Tasks 5, 6 |
| Page Play/Pause is disabled | Task 7 |
| Clicking a word updates persistent anchor and preserves engagement state | Tasks 4, 5 |
| Focus, Flow, Narrate use infinite scroll; Page uses pagination | Task 6 |
| All modes hand off persistent word without progress disruption | Tasks 4, 5, 8 |
| Switching modes pauses all modes until re-engaged | Tasks 5, 7 |

## File Structure

- Create `src/utils/persistentReadingAnchor.ts`: pure anchor reducer and clamp policy.
- Create `src/hooks/usePersistentReadingAnchor.ts`: React owner for the per-book anchor, refs, visual sync, and immediate persistence on hard selections.
- Modify `src/components/ReaderContainer.tsx`: seed the persistent anchor, route clicks and mode advancement through it, pass jump-back props, and choose scrolled versus paginated Foliate surface.
- Modify `src/hooks/useDocumentLifecycle.ts`: open every book in Page mode at the saved persistent word.
- Modify `src/hooks/useReaderMode.ts`: start selected modes from persistent anchor, stop using visible browse-away position as mode handoff, disable Page playback behavior, and preserve Narrate audio on browse-away.
- Modify `src/hooks/useFoliateSync.ts`: report browse-away for Page, Focus, Flow, and Narrate without treating browse-away as progress.
- Modify `src/components/FoliatePageView.tsx`: expose user browse-away events, show a jump-back button when requested, use scrolled layout for Focus/Flow/Narrate, and keep Page paginated.
- Modify `src/components/ReaderBottomBar.tsx`: disable Play/Pause in Page mode.
- Modify `src/styles/page-reader.css`: disabled Play styling and jump-back button copy/position.
- Test `tests/persistentReadingAnchor.test.ts`: pure anchor policy.
- Test `tests/useReaderMode.test.ts`: mode selection/start and playback behavior.
- Test `tests/useDocumentLifecycle.test.ts` or structural equivalent: book open forces Page.
- Test `tests/readerBottomBarControls.test.tsx`: Page Play disabled.
- Test `tests/foliate-bridge.test.ts`: jump-back button and scrolled surface gates.
- Test `tests/narrationIntegration.test.ts`: update structural expectations for scrolled surface naming.

## Core Invariants

- `persistentWordIndexRef.current` is the shared durable current word for the active book.
- `highlightedWordIndex` is a visual cursor and may temporarily differ when the user browses away.
- `softWordIndexRef.current` is a passive visible-page hint and must not override the persistent anchor.
- `resumeAnchorRef.current` remains a legacy bridge, but mode start must prefer the persistent anchor.
- Hard word clicks and explicit chapter jumps update the persistent anchor immediately.
- Hard word clicks clear browse-away state because the clicked word becomes the new persistent anchor.
- Active Focus, Flow, and Narrate advancement updates `persistentWordIndexRef.current` continuously, but does not publish React state every word; existing visual and debounced progress paths handle UI and disk writes.
- Browsing away never updates the persistent anchor.
- Browsing away never writes `activeDoc.cfi`, persisted progress, or the parent progress callback in any mode.
- Book startup treats CFI as auxiliary only. If a valid persistent word exists, `initialCfi` must be `null` so stale CFI cannot override the word anchor.
- Mode selection never starts playback.
- Page mode never starts playback from Play or Space.
- Narrate is audio-owned: browse-away may show jump-back, but must not stop TTS.
- Focus has a split surface contract: `readingMode === "focus" && !focusPlaying` renders the scrolled browse surface; `readingMode === "focus" && focusPlaying` renders the existing single-word Focus engine.

---

### Task 1: Add Pure Persistent Anchor Policy

**Files:**
- Create: `src/utils/persistentReadingAnchor.ts`
- Create: `tests/persistentReadingAnchor.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/persistentReadingAnchor.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  clampPersistentWordIndex,
  isAwayFromPersistentAnchor,
  resolveBookOpenInitialCfi,
  reducePersistentWordAnchor,
  shouldClearBrowseAwayOnAnchorEvent,
  shouldPersistRelocateProgress,
  shouldWriteRelocateCfi,
} from "../src/utils/persistentReadingAnchor";

describe("persistentReadingAnchor", () => {
  it("preserves word 0 as a valid persistent anchor", () => {
    expect(clampPersistentWordIndex(0, 100)).toBe(0);
    expect(reducePersistentWordAnchor(42, { type: "hard-selection", wordIndex: 0 }, 100)).toBe(0);
  });

  it("clamps invalid or out-of-range word indices", () => {
    expect(clampPersistentWordIndex(Number.NaN, 100)).toBe(0);
    expect(clampPersistentWordIndex(-4, 100)).toBe(0);
    expect(clampPersistentWordIndex(500, 100)).toBe(99);
    expect(clampPersistentWordIndex(500, 0)).toBe(0);
  });

  it("updates the anchor for hard selection, mode advance, explicit navigation, and book open", () => {
    expect(reducePersistentWordAnchor(5, { type: "hard-selection", wordIndex: 14 }, 100)).toBe(14);
    expect(reducePersistentWordAnchor(14, { type: "mode-advance", wordIndex: 15 }, 100)).toBe(15);
    expect(reducePersistentWordAnchor(15, { type: "explicit-navigation", wordIndex: 40 }, 100)).toBe(40);
    expect(reducePersistentWordAnchor(40, { type: "book-open", wordIndex: 7 }, 100)).toBe(7);
  });

  it("does not update the anchor for browse-away, mode switch, jump-back, or soft visible movement", () => {
    expect(reducePersistentWordAnchor(30, { type: "browse-away", visibleWordIndex: 80 }, 100)).toBe(30);
    expect(reducePersistentWordAnchor(30, { type: "mode-switch" }, 100)).toBe(30);
    expect(reducePersistentWordAnchor(30, { type: "jump-back" }, 100)).toBe(30);
    expect(reducePersistentWordAnchor(30, { type: "soft-visible", visibleWordIndex: 80 }, 100)).toBe(30);
  });

  it("clears browse-away only when a hard selection becomes the new anchor", () => {
    expect(shouldClearBrowseAwayOnAnchorEvent({ type: "hard-selection", wordIndex: 50 })).toBe(true);
    expect(shouldClearBrowseAwayOnAnchorEvent({ type: "explicit-navigation", wordIndex: 50 })).toBe(true);
    expect(shouldClearBrowseAwayOnAnchorEvent({ type: "jump-back" })).toBe(true);
    expect(shouldClearBrowseAwayOnAnchorEvent({ type: "mode-advance", wordIndex: 51 })).toBe(false);
    expect(shouldClearBrowseAwayOnAnchorEvent({ type: "browse-away", visibleWordIndex: 80 })).toBe(false);
  });

  it("does not let a stale CFI override a persistent word on book open", () => {
    expect(resolveBookOpenInitialCfi({
      persistentWordIndex: 0,
      cfi: "epubcfi(/6/2!/4/1:20)",
    })).toBeNull();
    expect(resolveBookOpenInitialCfi({
      persistentWordIndex: 42,
      cfi: "epubcfi(/6/2!/4/1:20)",
    })).toBeNull();
    expect(resolveBookOpenInitialCfi({
      persistentWordIndex: null,
      cfi: "epubcfi(/6/2!/4/1:20)",
    })).toBe("epubcfi(/6/2!/4/1:20)");
  });

  it("detects browse-away relative to the persistent anchor", () => {
    expect(isAwayFromPersistentAnchor(31, 30)).toBe(true);
    expect(isAwayFromPersistentAnchor(30, 30)).toBe(false);
    expect(isAwayFromPersistentAnchor(35, 30, 5)).toBe(false);
    expect(isAwayFromPersistentAnchor(36, 30, 5)).toBe(true);
  });

  it.each(["page", "focus", "flow", "narrate"] as const)(
    "blocks relocate CFI and progress saves while browsing away in %s mode",
    (mode) => {
      expect(shouldWriteRelocateCfi({ mode, userBrowsing: true })).toBe(false);
      expect(shouldPersistRelocateProgress({
        mode,
        hasEngaged: true,
        hasResumeAnchor: false,
        userBrowsing: true,
      })).toBe(false);
    },
  );

  it("allows relocate progress only after engagement, without resume anchor, and without browse-away", () => {
    expect(shouldPersistRelocateProgress({
      mode: "page",
      hasEngaged: true,
      hasResumeAnchor: false,
      userBrowsing: false,
    })).toBe(true);
    expect(shouldPersistRelocateProgress({
      mode: "page",
      hasEngaged: false,
      hasResumeAnchor: false,
      userBrowsing: false,
    })).toBe(false);
    expect(shouldPersistRelocateProgress({
      mode: "page",
      hasEngaged: true,
      hasResumeAnchor: true,
      userBrowsing: false,
    })).toBe(false);
  });
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run:

```powershell
npm test -- tests/persistentReadingAnchor.test.ts
```

Expected: `FAIL` because `src/utils/persistentReadingAnchor.ts` does not exist.

- [ ] **Step 3: Add the pure implementation**

Create `src/utils/persistentReadingAnchor.ts`:

```ts
export type PersistentAnchorWriteEvent =
  | { type: "book-open"; wordIndex: number | null | undefined }
  | { type: "hard-selection"; wordIndex: number | null | undefined }
  | { type: "mode-advance"; wordIndex: number | null | undefined }
  | { type: "explicit-navigation"; wordIndex: number | null | undefined };

export type PersistentAnchorReadOnlyEvent =
  | { type: "browse-away"; visibleWordIndex: number | null | undefined }
  | { type: "mode-switch" }
  | { type: "jump-back" }
  | { type: "soft-visible"; visibleWordIndex: number | null | undefined };

export type PersistentAnchorEvent = PersistentAnchorWriteEvent | PersistentAnchorReadOnlyEvent;

export type PersistentAnchorMode = "page" | "focus" | "flow" | "narrate";

export function clampPersistentWordIndex(
  wordIndex: number | null | undefined,
  totalWords?: number | null,
): number {
  if (typeof wordIndex !== "number" || !Number.isFinite(wordIndex)) return 0;
  const normalized = Math.max(0, Math.trunc(wordIndex));
  if (totalWords != null && totalWords <= 0) return 0;
  if (totalWords == null) return normalized;
  const maxIndex = Math.max(0, Math.trunc((totalWords ?? 0) - 1));
  return Math.min(normalized, maxIndex);
}

export function reducePersistentWordAnchor(
  currentWordIndex: number,
  event: PersistentAnchorEvent,
  totalWords?: number | null,
): number {
  switch (event.type) {
    case "book-open":
    case "hard-selection":
    case "mode-advance":
    case "explicit-navigation":
      return clampPersistentWordIndex(event.wordIndex, totalWords);
    case "browse-away":
    case "mode-switch":
    case "jump-back":
    case "soft-visible":
      return clampPersistentWordIndex(currentWordIndex, totalWords);
  }
}

export function isAwayFromPersistentAnchor(
  visibleWordIndex: number | null | undefined,
  persistentWordIndex: number | null | undefined,
  toleranceWords = 0,
): boolean {
  const visible = clampPersistentWordIndex(visibleWordIndex);
  const persistent = clampPersistentWordIndex(persistentWordIndex);
  return Math.abs(visible - persistent) > Math.max(0, toleranceWords);
}

export function shouldClearBrowseAwayOnAnchorEvent(event: PersistentAnchorEvent): boolean {
  return event.type === "hard-selection"
    || event.type === "explicit-navigation"
    || event.type === "jump-back";
}

export function resolveBookOpenInitialCfi({
  persistentWordIndex,
  cfi,
}: {
  persistentWordIndex: number | null | undefined;
  cfi?: string | null;
}): string | null {
  const hasPersistentWord = typeof persistentWordIndex === "number"
    && Number.isFinite(persistentWordIndex)
    && persistentWordIndex >= 0;
  if (hasPersistentWord) return null;
  return cfi || null;
}

export function shouldWriteRelocateCfi({
  userBrowsing,
}: {
  mode: PersistentAnchorMode;
  userBrowsing: boolean;
}): boolean {
  return !userBrowsing;
}

export function shouldPersistRelocateProgress({
  hasEngaged,
  hasResumeAnchor,
  userBrowsing,
}: {
  mode: PersistentAnchorMode;
  hasEngaged: boolean;
  hasResumeAnchor: boolean;
  userBrowsing: boolean;
}): boolean {
  return hasEngaged && !hasResumeAnchor && !userBrowsing;
}
```

- [ ] **Step 4: Run the focused test and confirm pass**

Run:

```powershell
npm test -- tests/persistentReadingAnchor.test.ts
```

Expected: `PASS` with 5 tests passing.

- [ ] **Step 5: Commit the policy helper**

Run:

```powershell
git add src/utils/persistentReadingAnchor.ts tests/persistentReadingAnchor.test.ts
git commit -m "fix(reader): add persistent word anchor policy"
```

Expected: commit succeeds.

---

### Task 2: Add the Persistent Anchor Hook

**Files:**
- Create: `src/hooks/usePersistentReadingAnchor.ts`
- Modify: `tests/persistentReadingAnchor.test.ts`

- [ ] **Step 1: Add hook-level tests**

Update the top import in `tests/persistentReadingAnchor.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
```

Add these imports below the existing imports:

```ts
import { renderHook, act } from "@testing-library/react";
import { usePersistentReadingAnchor } from "../src/hooks/usePersistentReadingAnchor";
```

Append these tests to `tests/persistentReadingAnchor.test.ts`:

```ts
beforeEach(() => {
  vi.stubGlobal("electronAPI", {
    updateDocProgress: vi.fn(),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("usePersistentReadingAnchor", () => {
  it("seeds from the active document position and preserves word 0", () => {
    const highlightedRef = { current: 99 };
    const softRef = { current: null as number | null };
    const explicitRef = { current: null as number | null };
    const resumeRef = { current: null as number | null };
    const setHighlightedWordIndex = vi.fn();
    const jumpToWord = vi.fn();
    const onUpdateProgress = vi.fn();

    const { result } = renderHook(() => usePersistentReadingAnchor({
      activeDoc: { id: "book-1", position: 0, wordCount: 100 },
      totalWordCount: 100,
      highlightedWordIndexRef: highlightedRef,
      softWordIndexRef: softRef,
      explicitSelectionAnchorRef: explicitRef,
      resumeAnchorRef: resumeRef,
      setHighlightedWordIndex,
      jumpToWord,
      onUpdateProgress,
    }));

    expect(result.current.persistentWordIndex).toBe(0);
    expect(result.current.persistentWordIndexRef.current).toBe(0);
    expect(highlightedRef.current).toBe(0);
  });

  it("hard selection persists immediately and synchronizes visual refs", () => {
    const highlightedRef = { current: 5 };
    const softRef = { current: 5 as number | null };
    const explicitRef = { current: null as number | null };
    const resumeRef = { current: null as number | null };
    const setHighlightedWordIndex = vi.fn();
    const jumpToWord = vi.fn();
    const onUpdateProgress = vi.fn();

    const { result } = renderHook(() => usePersistentReadingAnchor({
      activeDoc: { id: "book-1", position: 5, wordCount: 100, cfi: "old-cfi" },
      totalWordCount: 100,
      highlightedWordIndexRef: highlightedRef,
      softWordIndexRef: softRef,
      explicitSelectionAnchorRef: explicitRef,
      resumeAnchorRef: resumeRef,
      setHighlightedWordIndex,
      jumpToWord,
      onUpdateProgress,
    }));

    act(() => {
      result.current.commitPersistentWordIndex(22, "hard-selection", {
        cfi: "new-cfi",
        persist: true,
        navigate: true,
      });
    });

    expect(result.current.persistentWordIndexRef.current).toBe(22);
    expect(highlightedRef.current).toBe(22);
    expect(softRef.current).toBe(22);
    expect(explicitRef.current).toBe(22);
    expect(resumeRef.current).toBe(22);
    expect(setHighlightedWordIndex).toHaveBeenCalledWith(22);
    expect(jumpToWord).toHaveBeenCalledWith(22);
    expect(onUpdateProgress).toHaveBeenCalledWith("book-1", 22);
  });

  it("mode advancement updates the in-memory anchor without forcing immediate persistence", () => {
    const highlightedRef = { current: 5 };
    const softRef = { current: 5 as number | null };
    const explicitRef = { current: null as number | null };
    const resumeRef = { current: null as number | null };
    const onUpdateProgress = vi.fn();

    const { result } = renderHook(() => usePersistentReadingAnchor({
      activeDoc: { id: "book-1", position: 5, wordCount: 100 },
      totalWordCount: 100,
      highlightedWordIndexRef: highlightedRef,
      softWordIndexRef: softRef,
      explicitSelectionAnchorRef: explicitRef,
      resumeAnchorRef: resumeRef,
      setHighlightedWordIndex: vi.fn(),
      jumpToWord: vi.fn(),
      onUpdateProgress,
    }));

    act(() => {
      result.current.commitPersistentWordIndex(6, "mode-advance", {
        persist: false,
        navigate: false,
        publishState: false,
      });
    });

    expect(result.current.persistentWordIndexRef.current).toBe(6);
    expect(result.current.persistentWordIndex).toBe(5);
    expect(explicitRef.current).toBeNull();
    expect(resumeRef.current).toBe(6);
    expect(onUpdateProgress).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run:

```powershell
npm test -- tests/persistentReadingAnchor.test.ts
```

Expected: `FAIL` because `usePersistentReadingAnchor` does not exist.

- [ ] **Step 3: Add the hook implementation**

Create `src/hooks/usePersistentReadingAnchor.ts`:

```ts
import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { clampPersistentWordIndex } from "../utils/persistentReadingAnchor";

type PersistentAnchorCause =
  | "book-open"
  | "hard-selection"
  | "mode-advance"
  | "explicit-navigation"
  | "jump-back";

interface ActiveAnchorDoc {
  id: string;
  position?: number | null;
  wordCount?: number | null;
  cfi?: string | null;
}

interface CommitPersistentWordOptions {
  cfi?: string | null;
  navigate?: boolean;
  publishState?: boolean;
  persist?: boolean;
  syncVisual?: boolean;
}

interface UsePersistentReadingAnchorParams {
  activeDoc: ActiveAnchorDoc;
  totalWordCount: number;
  highlightedWordIndexRef: MutableRefObject<number>;
  softWordIndexRef: MutableRefObject<number | null>;
  explicitSelectionAnchorRef: MutableRefObject<number | null>;
  resumeAnchorRef: MutableRefObject<number | null>;
  setHighlightedWordIndex: Dispatch<SetStateAction<number>>;
  jumpToWord: (wordIndex: number) => void;
  onUpdateProgress: (docId: string, position: number) => void;
}

interface UsePersistentReadingAnchorReturn {
  persistentWordIndex: number;
  persistentWordIndexRef: MutableRefObject<number>;
  commitPersistentWordIndex: (
    wordIndex: number,
    cause: PersistentAnchorCause,
    options?: CommitPersistentWordOptions,
  ) => number;
  syncVisualToPersistentWord: (options?: { navigate?: boolean }) => number;
}

export function usePersistentReadingAnchor({
  activeDoc,
  totalWordCount,
  highlightedWordIndexRef,
  softWordIndexRef,
  explicitSelectionAnchorRef,
  resumeAnchorRef,
  setHighlightedWordIndex,
  jumpToWord,
  onUpdateProgress,
}: UsePersistentReadingAnchorParams): UsePersistentReadingAnchorReturn {
  const initialWordIndex = clampPersistentWordIndex(activeDoc.position ?? 0, totalWordCount);
  const persistentWordIndexRef = useRef(initialWordIndex);
  const [persistentWordIndex, setPersistentWordIndex] = useState(initialWordIndex);

  const writeRefs = useCallback((wordIndex: number, cause: PersistentAnchorCause) => {
    persistentWordIndexRef.current = wordIndex;
    highlightedWordIndexRef.current = wordIndex;
    softWordIndexRef.current = wordIndex;
    resumeAnchorRef.current = wordIndex;
    explicitSelectionAnchorRef.current = cause === "hard-selection" || cause === "explicit-navigation"
      ? wordIndex
      : null;
  }, [
    explicitSelectionAnchorRef,
    highlightedWordIndexRef,
    persistentWordIndexRef,
    resumeAnchorRef,
    softWordIndexRef,
  ]);

  useEffect(() => {
    const restoredWordIndex = clampPersistentWordIndex(activeDoc.position ?? 0, totalWordCount);
    writeRefs(restoredWordIndex, "book-open");
    setPersistentWordIndex(restoredWordIndex);
    setHighlightedWordIndex(restoredWordIndex);
  }, [activeDoc.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const commitPersistentWordIndex = useCallback((
    wordIndex: number,
    cause: PersistentAnchorCause,
    options: CommitPersistentWordOptions = {},
  ): number => {
    const clamped = clampPersistentWordIndex(wordIndex, totalWordCount);
    writeRefs(clamped, cause);
    const shouldPublishState = options.publishState ?? cause !== "mode-advance";
    if (shouldPublishState) {
      setPersistentWordIndex(clamped);
    }

    if (options.syncVisual !== false) {
      setHighlightedWordIndex(clamped);
    }
    if (options.navigate !== false) {
      jumpToWord(clamped);
    }

    const shouldPersist = options.persist ?? (cause === "hard-selection" || cause === "explicit-navigation");
    if (shouldPersist) {
      const cfi = options.cfi ?? activeDoc.cfi ?? undefined;
      window.electronAPI.updateDocProgress(activeDoc.id, clamped, cfi);
      onUpdateProgress(activeDoc.id, clamped);
    }

    return clamped;
  }, [
    activeDoc.cfi,
    activeDoc.id,
    jumpToWord,
    onUpdateProgress,
    setHighlightedWordIndex,
    totalWordCount,
    writeRefs,
  ]);

  const syncVisualToPersistentWord = useCallback((options: { navigate?: boolean } = {}): number => {
    const clamped = clampPersistentWordIndex(persistentWordIndexRef.current, totalWordCount);
    writeRefs(clamped, "jump-back");
    setPersistentWordIndex(clamped);
    setHighlightedWordIndex(clamped);
    if (options.navigate !== false) {
      jumpToWord(clamped);
    }
    return clamped;
  }, [jumpToWord, setHighlightedWordIndex, totalWordCount, writeRefs]);

  return {
    persistentWordIndex,
    persistentWordIndexRef,
    commitPersistentWordIndex,
    syncVisualToPersistentWord,
  };
}
```

- [ ] **Step 4: Run the focused test and confirm pass**

Run:

```powershell
npm test -- tests/persistentReadingAnchor.test.ts
```

Expected: `PASS` with hook and pure policy tests passing.

- [ ] **Step 5: Commit the hook**

Run:

```powershell
git add src/hooks/usePersistentReadingAnchor.ts tests/persistentReadingAnchor.test.ts
git commit -m "fix(reader): own persistent word anchor in a hook"
```

Expected: commit succeeds.

---

### Task 3: Force Book Open Into Page Mode At Saved Word

**Files:**
- Modify: `src/hooks/useDocumentLifecycle.ts`
- Modify: `tests/useReaderMode.test.ts` or create `tests/documentLifecycleModeRestore.test.ts`

- [ ] **Step 1: Add a structural regression test**

Create `tests/documentLifecycleModeRestore.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("document lifecycle mode restore contract", () => {
  it("opens every book in Page mode instead of restoring Focus, Flow, or Narrate", () => {
    const source = readFileSync("src/hooks/useDocumentLifecycle.ts", "utf8");

    expect(source).toContain('setReadingMode("page")');
    expect(source).not.toContain("resolveRestoredMode");
    expect(source).not.toContain("const restoredMode =");
  });

  it("keeps word 0 as an explicit resume anchor on book open", () => {
    const source = readFileSync("src/hooks/useDocumentLifecycle.ts", "utf8");

    expect(source).toContain("resumeAnchorRef.current = restoredWordIndex");
    expect(source).not.toContain("resumeAnchorRef.current = (activeDoc.position || 0) > 0");
  });
});
```

- [ ] **Step 2: Run the structural test and confirm failure**

Run:

```powershell
npm test -- tests/documentLifecycleModeRestore.test.ts
```

Expected: `FAIL` because `useDocumentLifecycle.ts` still restores `settings.readingMode`.

- [ ] **Step 3: Replace saved-mode restore with Page-mode open**

In `src/hooks/useDocumentLifecycle.ts`, remove this function:

```ts
  const resolveRestoredMode = (): ReaderMode => {
    const savedMode = settings.readingMode;
    if (savedMode === "page" || savedMode === "focus" || savedMode === "flow" || savedMode === "narrate") {
      return savedMode;
    }
    return "page";
  };
```

In the document-change effect, replace:

```ts
    const restoredMode = resolveRestoredMode();
    initReader(activeDoc.position || 0);
    setHighlightedWordIndex(activeDoc.position || 0);
    // TTS-7M (BUG-135): Set resume anchor from saved position on reopen.
    // This prevents passive onLoad/onRelocate from downgrading the start point.
    resumeAnchorRef.current = (activeDoc.position || 0) > 0 ? activeDoc.position! : null;
```

with:

```ts
    const restoredWordIndex = activeDoc.position || 0;
    initReader(restoredWordIndex);
    setHighlightedWordIndex(restoredWordIndex);
    // The saved word is load-bearing even when it is word 0.
    // Page opens at this anchor; other modes may read it only after explicit Play.
    resumeAnchorRef.current = restoredWordIndex;
```

In the same effect, replace:

```ts
    setReadingMode(restoredMode);
```

with:

```ts
    setReadingMode("page");
```

- [ ] **Step 4: Run the structural test and focused lifecycle-adjacent tests**

Run:

```powershell
npm test -- tests/documentLifecycleModeRestore.test.ts tests/useReaderMode.test.ts
```

Expected: `PASS` for the new structural test. If `tests/useReaderMode.test.ts` fails because an existing assertion expects restored non-Page mode on book open, update that assertion to expect Page mode and saved word anchor.

- [ ] **Step 5: Commit the Page-open contract**

Run:

```powershell
git add src/hooks/useDocumentLifecycle.ts tests/documentLifecycleModeRestore.test.ts tests/useReaderMode.test.ts
git commit -m "fix(reader): open books in page mode at saved word"
```

Expected: commit succeeds.

---

### Task 4: Wire Persistent Anchor Through ReaderContainer

**Files:**
- Modify: `src/components/ReaderContainer.tsx`
- Modify: `tests/wordAnchor.test.ts`
- Modify: `tests/useReaderMode.test.ts`

- [ ] **Step 1: Add regression coverage for hard selection and mode advancement**

Append to `tests/wordAnchor.test.ts`:

```ts
describe("persistent anchor integration policy", () => {
  it("documents that hard clicks must update the persistent anchor before any mode start", () => {
    const source = readFileSync("src/components/ReaderContainer.tsx", "utf8");

    expect(source).toContain("usePersistentReadingAnchor");
    expect(source).toContain("commitPersistentWordIndex(resolvedClickWordIndex, \"hard-selection\"");
    expect(source).toContain("persistentWordIndexRef");
  });

  it("documents that mode advancement writes the persistent anchor without immediate disk writes", () => {
    const source = readFileSync("src/components/ReaderContainer.tsx", "utf8");

    expect(source).toContain("commitPersistentWordIndex(idx, \"mode-advance\"");
    expect(source).toContain("persist: false");
    expect(source).toContain("publishState: false");
    expect(source).toContain("navigate: false");
  });

  it("documents that hard clicks clear browse-away and hide the jump-back affordance", () => {
    const source = readFileSync("src/components/ReaderContainer.tsx", "utf8");

    expect(source).toContain("foliateApiRef.current?.clearUserBrowsing?.()");
    expect(source).toContain("setIsBrowsedAway(false)");
    expect(source).toContain("shouldClearBrowseAwayOnAnchorEvent({ type: \"hard-selection\"");
  });

  it("documents that stale CFI cannot override persistent word on Foliate startup", () => {
    const source = readFileSync("src/components/ReaderContainer.tsx", "utf8");

    expect(source).toContain("resolveBookOpenInitialCfi");
    expect(source).toContain("initialCfi={initialFoliateCfi}");
    expect(source).not.toContain("initialCfi={activeDoc.cfi || null}");
  });
});
```

If `tests/wordAnchor.test.ts` does not already import `readFileSync`, add:

```ts
import { readFileSync } from "node:fs";
```

- [ ] **Step 2: Run the regression tests and confirm failure**

Run:

```powershell
npm test -- tests/wordAnchor.test.ts
```

Expected: `FAIL` because `ReaderContainer.tsx` does not use `usePersistentReadingAnchor`.

- [ ] **Step 3: Import and initialize the hook**

In `src/components/ReaderContainer.tsx`, add:

```ts
import { usePersistentReadingAnchor } from "../hooks/usePersistentReadingAnchor";
import {
  resolveBookOpenInitialCfi,
  shouldClearBrowseAwayOnAnchorEvent,
} from "../utils/persistentReadingAnchor";
```

Delete the current `const canonicalWordAnchor = resolveCanonicalWordAnchor(...)` block. After `clampToEffectiveWordRange` is declared, add:

```ts
  const {
    persistentWordIndex,
    persistentWordIndexRef,
    commitPersistentWordIndex,
    syncVisualToPersistentWord,
  } = usePersistentReadingAnchor({
    activeDoc,
    totalWordCount,
    highlightedWordIndexRef,
    softWordIndexRef,
    explicitSelectionAnchorRef,
    resumeAnchorRef,
    setHighlightedWordIndex,
    jumpToWord,
    onUpdateProgress,
  });
```

After the hook call, add the canonical alias:

```ts
  const canonicalWordAnchor = persistentWordIndex;
```

Keep `resolveCanonicalWordAnchor` imported until every remaining local use is removed. If the import becomes unused after this task, remove it.

Add this CFI policy near `canonicalWordAnchor`:

```ts
  const initialFoliateCfi = resolveBookOpenInitialCfi({
    persistentWordIndex,
    cfi: activeDoc.cfi,
  });
```

In the `FoliatePageView` props, replace:

```tsx
      initialCfi={activeDoc.cfi || null}
```

with:

```tsx
      initialCfi={initialFoliateCfi}
```

- [ ] **Step 4: Replace `commitSharedWordAnchor`**

Replace the existing `commitSharedWordAnchor` with:

```ts
  const commitSharedWordAnchor = useCallback((
    wordIndex: number,
    cause: "hard-selection" | "explicit-navigation" | "mode-advance" = "explicit-navigation",
    cfi?: string | null,
  ) => {
    const clamped = commitPersistentWordIndex(wordIndex, cause, {
      cfi,
      persist: cause !== "mode-advance",
      publishState: cause !== "mode-advance",
      navigate: true,
    });

    if (isNarratingRef.current && narration.speaking && !narration.warming) {
      narration.resyncToCursor(clamped, effectiveWpm);
    }

    return clamped;
  }, [commitPersistentWordIndex, narration, effectiveWpm]);
```

- [ ] **Step 5: Route mode advancement through the anchor**

In the `useReadingModeInstance` `onWordAdvance` callback, after `explicitSelectionAnchorRef.current = null;`, add:

```ts
      commitPersistentWordIndex(idx, "mode-advance", {
        persist: false,
        publishState: false,
        navigate: false,
        syncVisual: false,
      });
```

Leave the existing state-update logic in place for this hotfix so the visual cursor behavior does not change more than needed.

- [ ] **Step 6: Route hard word clicks through the anchor**

After `useFlowScrollSync(...)`, add a helper that preserves active engagement when a hard click retargets the anchor:

```ts
  const retargetActiveModeToWord = useCallback((wordIndex: number) => {
    const mode = readingModeRef.current;
    if (mode === "focus" && focusPlaying) {
      modeInstanceHook.jumpToWordInMode(wordIndex);
      return;
    }
    if (mode === "flow" && flowPlaying) {
      modeInstanceHook.jumpToWordInMode(wordIndex);
      flowScrollEngineRef.current?.jumpToWord(wordIndex);
    }
  }, [flowPlaying, focusPlaying, flowScrollEngineRef, modeInstanceHook]);
```

In the Foliate `onWordClick` branch where `resolvedClickWordIndex != null`, replace:

```ts
          resumeAnchorRef.current = (isNarratingRef.current && narration.speaking && !narration.warming)
            ? null
            : resolvedClickWordIndex;
          explicitSelectionAnchorRef.current = resolvedClickWordIndex;
          handleHighlightedWordChange(resolvedClickWordIndex);
          return;
```

with:

```ts
          resumeAnchorRef.current = resolvedClickWordIndex;
          explicitSelectionAnchorRef.current = resolvedClickWordIndex;
          const anchoredWordIndex = commitSharedWordAnchor(resolvedClickWordIndex, "hard-selection", cfi);
          retargetActiveModeToWord(anchoredWordIndex);
          if (shouldClearBrowseAwayOnAnchorEvent({ type: "hard-selection", wordIndex: anchoredWordIndex })) {
            foliateApiRef.current?.clearUserBrowsing?.();
            setIsBrowsedAway(false);
          }
          return;
```

This preserves the current engagement state. Active Narrate resyncs inside `commitSharedWordAnchor`; paused modes remain paused at the new anchor.

- [ ] **Step 7: Route chapter jumps through explicit navigation**

Keep `handlePrevChapter`, `handleNextChapter`, and `handleJumpToChapter` calling `commitSharedWordAnchor(...)`. Confirm these calls use the default `"explicit-navigation"` cause. No code change is needed if Step 4 made the default cause explicit navigation.

- [ ] **Step 8: Run focused anchor tests**

Run:

```powershell
npm test -- tests/persistentReadingAnchor.test.ts tests/wordAnchor.test.ts tests/tts7l-exact-selection-mapping.test.ts
```

Expected: all selected tests pass.

- [ ] **Step 9: Commit ReaderContainer anchor wiring**

Run:

```powershell
git add src/components/ReaderContainer.tsx tests/wordAnchor.test.ts
git commit -m "fix(reader): route reader progress through persistent anchor"
```

Expected: commit succeeds.

---

### Task 5: Enforce Paused Mode Switching And Persistent Start Word

**Files:**
- Modify: `src/hooks/useReaderMode.ts`
- Modify: `src/components/ReaderContainer.tsx`
- Modify: `tests/useReaderMode.test.ts`

- [ ] **Step 1: Add tests for mode selection and Page playback**

Add these cases to `tests/useReaderMode.test.ts` near the existing `handleSelectMode` and `handleTogglePlay` tests:

```ts
it("selecting Focus, Flow, or Narrate pauses every engine and queues post-layout anchor sync", () => {
  const harness = createUseReaderModeHarness({
    readingMode: "page",
    highlightedWordIndex: 12,
    persistentWordIndexRef: { current: 42 },
  });

  harness.snapshot()?.handleSelectMode("flow");

  expect(harness.modeInstance.stopMode).toHaveBeenCalled();
  expect(harness.setReadingMode).toHaveBeenCalledWith("flow");
  expect(harness.setFlowPlaying).toHaveBeenCalledWith(false);
  expect(harness.setFocusPlaying).toHaveBeenCalledWith(false);
  expect(harness.setIsNarrating).toHaveBeenCalledWith(false);
  expect(harness.syncVisualToPersistentWord).toHaveBeenCalledWith({ navigate: false });
  expect(harness.queuePostModeAnchorSync).toHaveBeenCalledWith(42, "flow");
  expect(harness.modeInstance.startMode).not.toHaveBeenCalled();
  expect(harness.narration.startCursorDriven).not.toHaveBeenCalled();
});

it("Page mode Play is a no-op", () => {
  const harness = createUseReaderModeHarness({
    readingMode: "page",
    persistentWordIndexRef: { current: 42 },
  });

  harness.snapshot()?.handleTogglePlay();

  expect(harness.modeInstance.startMode).not.toHaveBeenCalled();
  expect(harness.narration.startCursorDriven).not.toHaveBeenCalled();
  expect(harness.setReadingMode).not.toHaveBeenCalledWith("flow");
  expect(harness.setReadingMode).not.toHaveBeenCalledWith("focus");
  expect(harness.setReadingMode).not.toHaveBeenCalledWith("narrate");
});

it("Narrate Play starts exactly at the persistent anchor", () => {
  const persistentWordIndexRef = { current: 77 };
  const harness = createUseReaderModeHarness({
    readingMode: "narrate",
    persistentWordIndexRef,
    highlightedWordIndex: 11,
  });

  harness.snapshot()?.handleTogglePlay();

  expect(harness.narration.startCursorDriven).toHaveBeenCalledWith(
    expect.any(Array),
    77,
    expect.any(Number),
    expect.any(Function),
  );
});

it("Narrate browse-away does not turn Play into recenter", () => {
  const harness = createUseReaderModeHarness({
    readingMode: "narrate",
    isBrowsedAway: true,
    isNarratingRefValue: true,
  });

  harness.snapshot()?.handleTogglePlay();

  expect(harness.narration.stop).toHaveBeenCalled();
  expect(harness.handleReturnToReadingSpy).not.toHaveBeenCalled();
});
```

Update the test harness factory in `tests/useReaderMode.test.ts` to accept:

```ts
persistentWordIndexRef?: { current: number };
syncVisualToPersistentWord?: ReturnType<typeof vi.fn>;
commitPersistentWordIndex?: ReturnType<typeof vi.fn>;
queuePostModeAnchorSync?: ReturnType<typeof vi.fn>;
isNarratingRefValue?: boolean;
handleReturnToReadingSpy?: ReturnType<typeof vi.fn>;
```

Pass those through to `useReaderMode` in the harness.

- [ ] **Step 2: Run the focused tests and confirm failure**

Run:

```powershell
npm test -- tests/useReaderMode.test.ts
```

Expected: `FAIL` because `useReaderMode` does not accept persistent anchor props and Page Play still starts the last mode.

- [ ] **Step 3: Add persistent anchor params to `useReaderMode`**

In `src/hooks/useReaderMode.ts`, add these fields to `UseReaderModeParams`:

```ts
  persistentWordIndexRef: React.MutableRefObject<number>;
  commitPersistentWordIndex: (
    wordIndex: number,
    cause: "book-open" | "hard-selection" | "mode-advance" | "explicit-navigation" | "jump-back",
    options?: { cfi?: string | null; navigate?: boolean; persist?: boolean; publishState?: boolean; syncVisual?: boolean },
  ) => number;
  syncVisualToPersistentWord: (options?: { navigate?: boolean }) => number;
  queuePostModeAnchorSync: (wordIndex: number, mode: "focus" | "flow" | "narrate") => void;
```

Destructure them from the hook params.

Before the `useReaderMode` call in `src/components/ReaderContainer.tsx`, add a post-layout anchor queue:

```ts
  const pendingModeSurfaceAnchorRef = useRef<{ wordIndex: number; mode: "focus" | "flow" | "narrate" } | null>(null);
  const [pendingModeSurfaceAnchorVersion, setPendingModeSurfaceAnchorVersion] = useState(0);

  const queuePostModeAnchorSync = useCallback((wordIndex: number, mode: "focus" | "flow" | "narrate") => {
    pendingModeSurfaceAnchorRef.current = { wordIndex, mode };
    setPendingModeSurfaceAnchorVersion((version) => version + 1);
  }, []);
```

In `src/components/ReaderContainer.tsx`, pass the hook values into `useReaderMode`:

```tsx
    persistentWordIndexRef,
    commitPersistentWordIndex,
    syncVisualToPersistentWord,
    queuePostModeAnchorSync,
```

- [ ] **Step 4: Make mode start consume persistent anchor first**

Replace the body of `consumeModeStartAnchor` in `src/hooks/useReaderMode.ts` with:

```ts
    const explicitAnchor = explicitSelectionAnchorRef?.current ?? null;
    const startAnchor = resolveModeStartWordIndex(
      explicitAnchor,
      persistentWordIndexRef.current,
      resumeAnchorRef.current,
      highlightedWordIndexRef.current,
      softWordIndexRef.current,
    );

    if (explicitSelectionAnchorRef) {
      explicitSelectionAnchorRef.current = null;
    }
    resumeAnchorRef.current = startAnchor;

    return startAnchor;
```

Add `persistentWordIndexRef` to the dependency list.

- [ ] **Step 5: Make mode selection paused and anchored**

Replace `handleSelectMode` with:

```ts
  const handleSelectMode = useCallback((mode: "focus" | "flow" | "narrate") => {
    const fromMode = readingModeRef.current;
    if (fromMode === mode) return;
    pendingNarrationResumeRef.current = false;
    stopAllModes();
    setFocusPlaying(false);
    setFlowPlaying(false);
    setIsNarrating(false);
    const anchor = syncVisualToPersistentWord({ navigate: false });
    queuePostModeAnchorSync(anchor, mode);
    setIsBrowsedAway(false);
    setReadingMode(mode);
    updateSettings({
      readingMode: mode,
      lastReadingMode: mode,
      isNarrating: false,
    });
    if (evalTrace?.enabled) {
      evalTrace.record({
        kind: "transition",
        transition: "handoff",
        from: fromMode,
        to: mode,
        context: "mode-switch-persistent-anchor-paused",
        latencyMs: 0,
      });
    }
  }, [
    evalTrace,
    pendingNarrationResumeRef,
    setFlowPlaying,
    setFocusPlaying,
    setIsBrowsedAway,
    setIsNarrating,
    setReadingMode,
    stopAllModes,
    syncVisualToPersistentWord,
    queuePostModeAnchorSync,
    updateSettings,
  ]);
```

- [ ] **Step 6: Re-anchor after the target surface has rendered**

In `src/components/ReaderContainer.tsx`, add this effect after `useFlowScrollSync(...)`:

```ts
  useEffect(() => {
    const pending = pendingModeSurfaceAnchorRef.current;
    if (!pending || pending.mode !== readingMode) return;

    let firstRaf = 0;
    let secondRaf = 0;

    firstRaf = requestAnimationFrame(() => {
      secondRaf = requestAnimationFrame(() => {
        const latest = pendingModeSurfaceAnchorRef.current;
        if (!latest || latest.mode !== readingMode) return;
        syncVisualToPersistentWord({ navigate: true });
        foliateApiRef.current?.clearUserBrowsing?.();
        setIsBrowsedAway(false);
        pendingModeSurfaceAnchorRef.current = null;
      });
    });

    return () => {
      cancelAnimationFrame(firstRaf);
      cancelAnimationFrame(secondRaf);
    };
  }, [
    foliateApiRef,
    foliateRenderVersion,
    pendingModeSurfaceAnchorVersion,
    readingMode,
    setIsBrowsedAway,
    syncVisualToPersistentWord,
  ]);
```

This deliberately syncs refs before the mode switch, but waits two animation frames before Foliate navigation so Page-to-scrolled layout changes do not scroll the old surface.

- [ ] **Step 7: Make Page Play a no-op**

In `handleTogglePlay`, replace the `readingMode === "page"` branch with:

```ts
    if (readingMode === "page") {
      return;
    }
```

- [ ] **Step 8: Remove Narrate browse-away recenter from Play**

In the `readingMode === "narrate"` branch of `handleTogglePlay`, remove this block:

```ts
      if (isBrowsedAway && isNarratingRef.current) {
        handleReturnToReading();
        return;
      }
```

Leave the existing stop/start Narrate behavior intact.

- [ ] **Step 9: Make Flow auto-pause on browse-away, but not Narrate**

In `src/components/ReaderContainer.tsx`, add this effect after `useFlowScrollSync(...)`:

```ts
  useEffect(() => {
    if (readingMode !== "flow" || !flowPlaying || !isBrowsedAway) return;
    modeInstanceHook.pauseMode();
    setFlowPlaying(false);
  }, [flowPlaying, isBrowsedAway, modeInstanceHook, readingMode]);
```

- [ ] **Step 10: Run focused mode tests**

Run:

```powershell
npm test -- tests/useReaderMode.test.ts tests/persistentReadingAnchor.test.ts
```

Expected: all selected tests pass.

- [ ] **Step 11: Commit mode start and selection changes**

Run:

```powershell
git add src/hooks/useReaderMode.ts src/components/ReaderContainer.tsx tests/useReaderMode.test.ts
git commit -m "fix(reader): start modes paused from persistent anchor"
```

Expected: commit succeeds.

---

### Task 6: Add Browse-Away Jump-Back And Scrolled Surfaces

**Files:**
- Modify: `src/components/ReaderContainer.tsx`
- Modify: `src/hooks/useFoliateSync.ts`
- Modify: `src/utils/persistentReadingAnchor.ts`
- Modify: `src/components/FoliatePageView.tsx`
- Modify: `src/styles/page-reader.css`
- Modify: `tests/foliate-bridge.test.ts`
- Modify: `tests/narrationIntegration.test.ts`

- [ ] **Step 1: Add structural tests for scrolled surfaces and jump-back**

Update `tests/foliate-bridge.test.ts`:

```ts
it("shows jump-back based on browse-away state rather than active reading only", () => {
  const src = readFileSync("src/components/FoliatePageView.tsx", "utf8");

  expect(src).toContain("showJumpBackToAnchor");
  expect(src).toContain("onJumpBackToAnchor");
  expect(src).toContain("Jump back");
  expect(src).not.toContain("{isReading && onJumpToHighlight && (");
});

it("marks user browsing in Page, Focus, Flow, and Narrate surfaces", () => {
  const src = readFileSync("src/components/FoliatePageView.tsx", "utf8");

  expect(src).toContain('mode === "page"');
  expect(src).toContain('mode === "focus"');
  expect(src).toContain('mode === "flow"');
  expect(src).toContain('mode === "narrate"');
  expect(src).toContain("onUserBrowseAwayRef.current?.()");
});

it("documents Focus paused versus active surface ownership", () => {
  const src = readFileSync("src/components/ReaderContainer.tsx", "utf8");

  expect(src).toContain('const showFocusOverlay = readingMode === "focus" && focusPlaying');
  expect(src).toContain('readingMode === "focus" || readingMode === "flow" || readingMode === "narrate"');
});
```

Update `tests/narrationIntegration.test.ts` by replacing the old `flowMode={isFlowSurfaceMode}` expectation with:

```ts
expect(src).toContain("flowMode={isScrolledSurfaceMode}");
expect(src).toContain('readingMode === "focus" || readingMode === "flow" || readingMode === "narrate"');
```

- [ ] **Step 2: Run bridge tests and confirm failure**

Run:

```powershell
npm test -- tests/foliate-bridge.test.ts tests/narrationIntegration.test.ts
```

Expected: `FAIL` because the new props and `isScrolledSurfaceMode` do not exist.

- [ ] **Step 3: Keep browse-away state alive for Page and Focus**

In `src/hooks/useFoliateSync.ts`, replace:

```ts
  const isActivelyReading = isNarrating || !!flowPlaying || readingMode === "flow";
```

with:

```ts
  const isBrowseAwareSurface = readingMode === "page"
    || readingMode === "focus"
    || readingMode === "flow"
    || isNarrating
    || !!flowPlaying;
```

In the browse-away effect, replace:

```ts
    if (!useFoliate || !isActivelyReading) {
```

with:

```ts
    if (!useFoliate || !isBrowseAwareSurface) {
```

Change the effect dependency list from:

```ts
  }, [useFoliate, isActivelyReading]); // eslint-disable-line react-hooks/exhaustive-deps
```

to:

```ts
  }, [useFoliate, isBrowseAwareSurface]); // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 4: Block browse-away CFI and progress persistence in all modes**

In `src/components/ReaderContainer.tsx`, add this import:

```ts
import {
  shouldPersistRelocateProgress,
  shouldWriteRelocateCfi,
} from "../utils/persistentReadingAnchor";
```

In the Foliate `onRelocate` handler, replace the mode-specific CFI save guard:

```ts
          if (!(isBrowsingAway && (mode === "flow" || mode === "narrate"))) {
            activeDoc.cfi = detail.cfi;
          }
```

with:

```ts
          if (shouldWriteRelocateCfi({ mode, userBrowsing: isBrowsingAway })) {
            activeDoc.cfi = detail.cfi;
          }
```

Then replace:

```ts
          if (!hasEngagedRef.current || hasResumeAnchor) return;
```

with:

```ts
          const shouldPersistRelocate = shouldPersistRelocateProgress({
            mode,
            hasEngaged: hasEngagedRef.current,
            hasResumeAnchor,
            userBrowsing: isBrowsingAway,
          });
          if (!shouldPersistRelocate) return;
```

This is the load-bearing persistence gate: Page, Focus, Flow, and Narrate may browse away visually, but that visual browse must not become saved progress or saved CFI.

- [ ] **Step 5: Add browse-away props to FoliatePageView**

In `src/components/FoliatePageView.tsx`, add props:

```ts
  showJumpBackToAnchor?: boolean;
  onJumpBackToAnchor?: () => void;
  onUserBrowseAway?: () => void;
```

In the function parameters, destructure them.

Near the existing refs for callbacks, add:

```ts
  const onUserBrowseAwayRef = useRef(onUserBrowseAway);
  onUserBrowseAwayRef.current = onUserBrowseAway;
```

Add this helper:

```ts
  const markUserBrowsingAway = useCallback(() => {
    const mode = readingModeRef.current;
    if (mode === "page" || mode === "focus" || mode === "flow" || mode === "narrate") {
      userBrowsingRef.current = true;
      onUserBrowseAwayRef.current?.();
      if (import.meta.env.DEV) {
        console.debug("[foliate] user browsing away (mode:", mode, ")");
      }
    }
  }, []);
```

- [ ] **Step 6: Route wheel and page buttons through the helper**

Replace the current wheel handler body with:

```ts
    const handleWheel = () => {
      markUserBrowsingAway();
    };
```

Change the effect dependency from `[flowMode]` to:

```ts
  }, [flowMode, markUserBrowsingAway]);
```

Replace `goNext` and `goPrev` with:

```ts
  const goNext = useCallback(() => {
    markUserBrowsingAway();
    viewRef.current?.renderer?.next();
  }, [markUserBrowsingAway]);

  const goPrev = useCallback(() => {
    markUserBrowsingAway();
    viewRef.current?.renderer?.prev();
  }, [markUserBrowsingAway]);
```

- [ ] **Step 7: Replace the recenter button with jump-back button**

Replace:

```tsx
      {isReading && onJumpToHighlight && (
        <button
          className="recenter-reading-box-btn"
          onClick={onJumpToHighlight}
          aria-label="Recenter reading box on current sentence"
          title="Recenter reading box on current sentence"
        >
          ↩ Recenter box
        </button>
      )}
```

with:

```tsx
      {showJumpBackToAnchor && onJumpBackToAnchor && (
        <button
          className="recenter-reading-box-btn"
          onClick={onJumpBackToAnchor}
          aria-label="Jump back to persistent last-read word"
          title="Jump back to persistent last-read word"
        >
          Jump back
        </button>
      )}
```

- [ ] **Step 8: Make Focus, Flow, and Narrate use scrolled Foliate surface**

In `src/components/ReaderContainer.tsx`, replace:

```ts
  const isFlowSurfaceMode = readingMode === "flow" || readingMode === "narrate";
```

with:

```ts
  const isScrolledSurfaceMode = readingMode === "focus" || readingMode === "flow" || readingMode === "narrate";
```

Replace:

```tsx
      flowMode={isFlowSurfaceMode}
```

with:

```tsx
      flowMode={isScrolledSurfaceMode}
```

In the `onLoad` callback, replace:

```ts
          const isFlowSurfaceMode = mode === "flow" || mode === "narrate";
          if (!isFlowSurfaceMode) {
```

with:

```ts
          const isScrolledSurfaceMode = mode === "focus" || mode === "flow" || mode === "narrate";
          if (!isScrolledSurfaceMode) {
```

Define active Focus overlay ownership in `ReaderContainer.tsx`:

```ts
  const showFocusOverlay = readingMode === "focus" && focusPlaying;
```

In `renderView`, replace:

```tsx
      if (readingMode === "focus") {
```

with:

```tsx
      if (showFocusOverlay) {
```

Do not show the single-word Focus UI when Focus is only selected and paused; the existing `return foliateView;` path below this branch keeps the Foliate surface scrolled and browseable.

- [ ] **Step 9: Pass jump-back props from ReaderContainer**

In `ReaderContainer.tsx`, add:

```ts
  const handleJumpBackToPersistentWord = useCallback(() => {
    syncVisualToPersistentWord({ navigate: true });
    foliateApiRef.current?.clearUserBrowsing?.();
    setIsBrowsedAway(false);
  }, [setIsBrowsedAway, syncVisualToPersistentWord]);

  const handleFoliateUserBrowseAway = useCallback(() => {
    setIsBrowsedAway(true);
  }, [setIsBrowsedAway]);
```

If `FoliateViewAPI` does not currently expose `clearUserBrowsing`, add it in Task 6 Step 8.

Pass these props to `FoliatePageView`:

```tsx
      showJumpBackToAnchor={isBrowsedAway}
      onJumpBackToAnchor={handleJumpBackToPersistentWord}
      onUserBrowseAway={handleFoliateUserBrowseAway}
```

- [ ] **Step 10: Add `clearUserBrowsing` to the Foliate API**

In `src/components/FoliatePageView.tsx`, add to `FoliateViewAPI`:

```ts
  clearUserBrowsing: () => void;
```

In the exposed API object, add:

```ts
            clearUserBrowsing: () => {
              userBrowsingRef.current = false;
              lastScrollFollowPosRef.current = null;
            },
```

- [ ] **Step 11: Keep jump-back label on one line**

Keep the existing `.recenter-reading-box-btn` selector. If the text now wraps, add:

```css
.recenter-reading-box-btn {
  white-space: nowrap;
}
```

- [ ] **Step 12: Run bridge and integration tests**

Run:

```powershell
npm test -- tests/foliate-bridge.test.ts tests/narrationIntegration.test.ts tests/useReaderMode.test.ts
```

Expected: all selected tests pass.

- [ ] **Step 13: Commit browse-away and scrolled surface behavior**

Run:

```powershell
git add src/components/ReaderContainer.tsx src/components/FoliatePageView.tsx src/hooks/useFoliateSync.ts src/styles/page-reader.css tests/foliate-bridge.test.ts tests/narrationIntegration.test.ts
git commit -m "fix(reader): add jump-back browsing surfaces"
```

Expected: commit succeeds.

---

### Task 7: Disable Page Mode Play/Pause In The Bottom Bar

**Files:**
- Modify: `src/components/ReaderBottomBar.tsx`
- Modify: `src/styles/page-reader.css`
- Modify: `tests/readerBottomBarControls.test.tsx`

- [ ] **Step 1: Add bottom-bar tests**

Add to `tests/readerBottomBarControls.test.tsx`:

```tsx
it("disables Play in Page mode", async () => {
  const onTogglePlay = vi.fn();
  const root = createRoot(container);

  await act(async () => {
    root.render(<ReaderBottomBar {...baseProps} readingMode="page" onTogglePlay={onTogglePlay} />);
  });

  const playButton = container.querySelector(".rbb-play-btn") as HTMLButtonElement;
  expect(playButton).toBeTruthy();
  expect(playButton.disabled).toBe(true);
  expect(playButton.getAttribute("aria-disabled")).toBe("true");

  playButton.click();
  expect(onTogglePlay).not.toHaveBeenCalled();
});

it("keeps Play enabled for Focus, Flow, and Narrate", async () => {
  const onTogglePlay = vi.fn();
  const root = createRoot(container);

  for (const mode of ["focus", "flow", "narrate"] as const) {
    await act(async () => {
      root.render(<ReaderBottomBar {...baseProps} readingMode={mode} onTogglePlay={onTogglePlay} />);
    });

    const playButton = container.querySelector(".rbb-play-btn") as HTMLButtonElement;
    expect(playButton.disabled).toBe(false);
  }
});
```

- [ ] **Step 2: Run the bottom-bar tests and confirm failure**

Run:

```powershell
npm test -- tests/readerBottomBarControls.test.tsx
```

Expected: `FAIL` because Page Play is still enabled.

- [ ] **Step 3: Disable the button in Page mode**

In `src/components/ReaderBottomBar.tsx`, before the return block or before the Play button JSX, add:

```ts
  const playDisabled = readingMode === "page";
```

Replace the Play button with:

```tsx
          <button
            className={`rbb-play-btn ${playing ? "rbb-play-btn--active" : ""}${playDisabled ? " rbb-play-btn--disabled" : ""}`}
            onClick={() => {
              if (playDisabled) return;
              triggerCoachHint("play");
              onTogglePlay();
            }}
            disabled={playDisabled}
            aria-disabled={playDisabled}
            aria-label={playing ? "Pause" : "Play"}
            title={playDisabled ? "Page mode is browsing only" : playing ? "Pause (Space)" : "Play (Space)"}
          >
            {playing ? "||" : ">"}
          </button>
```

Use ASCII text for the icon replacement in this hotfix. If the existing file intentionally uses glyph icons and the test suite expects them, keep the current glyphs and only add the disabled behavior.

- [ ] **Step 4: Add disabled styling**

Add to `src/styles/page-reader.css`:

```css
.rbb-play-btn--disabled,
.rbb-play-btn--disabled:hover {
  cursor: not-allowed;
  opacity: 0.45;
  filter: grayscale(1);
}
```

- [ ] **Step 5: Run the bottom-bar tests**

Run:

```powershell
npm test -- tests/readerBottomBarControls.test.tsx
```

Expected: all selected tests pass.

- [ ] **Step 6: Commit Page Play disabled behavior**

Run:

```powershell
git add src/components/ReaderBottomBar.tsx src/styles/page-reader.css tests/readerBottomBarControls.test.tsx
git commit -m "fix(reader): disable playback controls in page mode"
```

Expected: commit succeeds.

---

### Task 8: Lock The Full Mode Handoff Matrix

**Files:**
- Modify: `tests/useReaderMode.test.ts`
- Modify: `tests/foliate-bridge.test.ts`
- Modify: `tests/persistentReadingAnchor.test.ts`

- [ ] **Step 1: Add a compact matrix test for mode switching**

Add to `tests/useReaderMode.test.ts`:

```ts
it.each(["focus", "flow", "narrate"] as const)(
  "selecting %s does not start playback and uses the persistent anchor",
  (mode) => {
    const harness = createUseReaderModeHarness({
      readingMode: "page",
      persistentWordIndexRef: { current: 64 },
    });

    harness.snapshot()?.handleSelectMode(mode);

    expect(harness.syncVisualToPersistentWord).toHaveBeenCalledWith({ navigate: false });
    expect(harness.queuePostModeAnchorSync).toHaveBeenCalledWith(64, mode);
    expect(harness.setReadingMode).toHaveBeenCalledWith(mode);
    expect(harness.modeInstance.startMode).not.toHaveBeenCalled();
    expect(harness.narration.startCursorDriven).not.toHaveBeenCalled();
    expect(harness.setFlowPlaying).toHaveBeenCalledWith(false);
    expect(harness.setFocusPlaying).toHaveBeenCalledWith(false);
    expect(harness.setIsNarrating).toHaveBeenCalledWith(false);
  },
);
```

- [ ] **Step 2: Add a compact matrix test for click retargeting policy**

Add to `tests/persistentReadingAnchor.test.ts`:

```ts
it("click retargeting is the only user browse action that mutates the persistent anchor", () => {
  let anchor = 10;

  anchor = reducePersistentWordAnchor(anchor, { type: "browse-away", visibleWordIndex: 90 }, 100);
  expect(anchor).toBe(10);

  anchor = reducePersistentWordAnchor(anchor, { type: "hard-selection", wordIndex: 90 }, 100);
  expect(anchor).toBe(90);
});
```

- [ ] **Step 3: Run the reader matrix tests**

Run:

```powershell
npm test -- tests/useReaderMode.test.ts tests/foliate-bridge.test.ts tests/persistentReadingAnchor.test.ts tests/readerBottomBarControls.test.tsx
```

Expected: all selected tests pass.

- [ ] **Step 4: Run typecheck**

Run:

```powershell
npx tsc --noEmit
```

Expected: no TypeScript errors.

- [ ] **Step 5: Run full test suite**

Run:

```powershell
npm test
```

Expected: full suite passes. If environmental flakes appear that pass in isolation, document the failing file, isolated pass command, and exact failure text in the final handoff before committing.

- [ ] **Step 6: Run diff hygiene**

Run:

```powershell
git diff --check
```

Expected: no whitespace errors.

- [ ] **Step 7: Commit matrix hardening**

Run:

```powershell
git add tests/useReaderMode.test.ts tests/foliate-bridge.test.ts tests/persistentReadingAnchor.test.ts
git commit -m "test(reader): lock persistent anchor mode matrix"
```

Expected: commit succeeds.

---

### Task 9: Final Verification And Handoff

**Files:**
- Read: `git status --short`
- Read: `git log --oneline -5`

- [ ] **Step 1: Verify focused suites**

Run:

```powershell
npm test -- tests/persistentReadingAnchor.test.ts tests/useReaderMode.test.ts tests/readerBottomBarControls.test.tsx tests/foliate-bridge.test.ts tests/narrationIntegration.test.ts tests/wordAnchor.test.ts
```

Expected: all selected tests pass.

- [ ] **Step 2: Verify TypeScript**

Run:

```powershell
npx tsc --noEmit
```

Expected: no TypeScript errors.

- [ ] **Step 3: Verify full suite**

Run:

```powershell
npm test
```

Expected: full suite passes.

- [ ] **Step 4: Inspect status**

Run:

```powershell
git status --short
```

Expected: no unstaged changes from the hotfix. Existing unrelated local dirt may remain if it was present before implementation.

- [ ] **Step 5: Push after human confirmation**

Run only after the user confirms the commit series:

```powershell
git push origin main
```

Expected: `main...origin/main` becomes `0/0`.

## Implementation Notes

- Do not reintroduce `startFlow({ targetMode: "narrate" })` retry paths that drop the original options object.
- Do not make `handleSelectMode` call `startFocus`, `startFlow`, `narration.startCursorDriven`, `modeInstance.resumeMode`, or `modeInstance.startMode`.
- Do not let `findFirstVisibleWordIndex()` override `persistentWordIndexRef.current` while a persistent anchor exists.
- Do not stop Narrate when a user scrolls away. Jump-back is visual only for Narrate.
- Do not persist browse-away CFIs as reading progress.
- Preserve word index `0` in every guard. Avoid `> 0` checks for anchors.
- The later adapter-isolation work can move these responsibilities into adapters. This hotfix should first make the current composition root obey the same contracts.
