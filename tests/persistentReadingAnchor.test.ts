// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clampPersistentWordIndex,
  isAwayFromPersistentAnchor,
  resolveBookOpenInitialCfi,
  reducePersistentWordAnchor,
  shouldClearBrowseAwayOnAnchorEvent,
  shouldPersistRelocateProgress,
  shouldWriteRelocateCfi,
} from "../src/utils/persistentReadingAnchor";
import { renderHook, act } from "@testing-library/react";
import { usePersistentReadingAnchor } from "../src/hooks/usePersistentReadingAnchor";

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
