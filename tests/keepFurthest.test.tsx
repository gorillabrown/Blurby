// @vitest-environment jsdom
// KEEP-FURTHEST-FIX-1 — in Page mode, "Keep at furthest" saves the furthest page the reader reached. Page-turn saves
// (PAGE-POSITION-SAVE-1) never raised the furthest mark, so Keep saved the stale open position and the on-screen cfi
// (live on 97527896: read 1290 → 2673, back to 416, Keep saved [1290, the 416 page's cfi]).
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockApi = {
  updateDocProgress: vi.fn().mockResolvedValue(undefined),
  recordReadingSession: vi.fn(),
  logReadingSession: vi.fn().mockResolvedValue(undefined),
  markDocCompleted: vi.fn(),
  saveSettings: vi.fn(),
};
(window as any).electronAPI = mockApi;

const CFI_OPEN = "epubcfi(/6/6!/4/2/12,/2,/2)";
const cfiAt = (word: number) => `epubcfi(page-${word})`;

let root: Root | null = null;
beforeEach(() => { (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true; mockApi.updateDocProgress.mockClear(); });
afterEach(() => { act(() => root?.unmount()); root = null; });

/** The tracker for a book opened at word 1290, on screen at `onScreen` (the page the reader went back to). */
async function mountAt(onScreen: number) {
  const { useProgressTracker } = await import("../src/hooks/useProgressTracker");
  const doc = { id: "book", title: "Book", wordCount: 80479, position: 1290, cfi: CFI_OPEN, created: 1, source: "folder" } as any;
  const box: { current: any } = { current: null };
  function Harness() {
    box.current = useProgressTracker({
      activeDoc: doc, wordIndex: onScreen, anchorWordIndex: onScreen, readingMode: "page", useFoliate: true,
      foliateFractionRef: { current: 0 }, wpm: 300, wordsLength: 80479, totalWords: 80479,
      sessionStartWordRef: { current: 1290 }, activeReadingMsRef: { current: 0 }, activeReadingStartRef: { current: null },
      onUpdateProgress: vi.fn(), onArchiveDoc: vi.fn(), onExitReader: vi.fn(),
    } as any);
    return null;
  }
  root = createRoot(document.createElement("div"));
  flushSync(() => root!.render(React.createElement(Harness)));
  return box;
}

/** The Page-turn saves the persistence port sees: forward to 2673, then back to 416 (each turn saves its landed page). */
function turns(box: { current: any }) {
  for (const word of [1600, 2000, 2400, 2673, 2200, 1700, 1290, 900, 416]) {
    box.current.noteHighWater?.(word, cfiAt(word)); // the port's raise (absent on the base)
    box.current.lastRelocateCfiRef.current = { docId: "book", cfi: cfiAt(word) };
  }
}

describe("KEEP-FURTHEST-FIX-1 Keep at furthest after reading ahead and backing up", () => {
  it("Keep saves the furthest page reached (2673) with that page's cfi, not the open position", async () => {
    const box = await mountAt(416);
    turns(box);
    act(() => box.current.handleKeepFurthest());
    expect(mockApi.updateDocProgress.mock.calls.at(-1)).toEqual(["book", 2673, cfiAt(2673)]);
  });

  it("the prompt offers the furthest page: the mark has risen to 2673", async () => {
    const box = await mountAt(416);
    turns(box);
    expect(box.current.furthestPositionRef.current).toBe(2673);
  });

  it("with no turn past the open position, Keep saves the open position with the cfi the book opened with", async () => {
    const box = await mountAt(416);
    for (const word of [900, 416]) {
      box.current.noteHighWater?.(word, cfiAt(word));
      box.current.lastRelocateCfiRef.current = { docId: "book", cfi: cfiAt(word) };
    }
    act(() => box.current.handleKeepFurthest());
    expect(mockApi.updateDocProgress.mock.calls.at(-1)).toEqual(["book", 1290, CFI_OPEN]);
  });

  it("control: Save at page saves the on-screen page and its cfi", async () => {
    const box = await mountAt(416);
    turns(box);
    act(() => box.current.handleSaveAtCurrent());
    expect(mockApi.updateDocProgress.mock.calls.at(-1)).toEqual(["book", 416, cfiAt(416)]);
  });
});
