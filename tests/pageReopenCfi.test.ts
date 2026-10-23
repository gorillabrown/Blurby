// @vitest-environment jsdom
// PAGE-REOPEN-CFI-1 (BUG-201): the library copy a reopen opens from must carry the cfi main last saved.
// On 47ae6e1f, useLibrary.updateProgress wrote the position only, so a reopen landed on the launch-time cfi.

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import type { BlurbyDoc } from "../src/types";

const DOC: BlurbyDoc = { id: "book", title: "Book", wordCount: 80493, position: 4155, cfi: "epubcfi(/6/6!/4/2/38,/874,/874)", created: 1, source: "folder" };

const mockApi = {
  getState: vi.fn().mockResolvedValue({ library: [DOC], settings: {} }),
  getPlatform: vi.fn().mockResolvedValue("win32"),
  onLibraryUpdated: vi.fn(() => () => {}),
};
(window as any).electronAPI = mockApi;
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let useLibrary: typeof import("../src/hooks/useLibrary").default;
beforeAll(async () => { useLibrary = (await import("../src/hooks/useLibrary")).default; });

let root: Root | null = null;
afterEach(() => { act(() => root?.unmount()); root = null; });

async function renderLibrary() {
  const box: { current: ReturnType<typeof useLibrary> | null } = { current: null };
  function Harness() { box.current = useLibrary(); return null; }
  root = createRoot(document.createElement("div"));
  await act(async () => { root!.render(React.createElement(Harness)); });
  await act(async () => { await Promise.resolve(); });
  return box;
}

describe("PAGE-REOPEN-CFI-1 — the library copy keeps the saved cfi", () => {
  it("a relocate save's cfi reaches the library entry a reopen hands to openDoc", async () => {
    const lib = await renderLibrary();
    expect(lib.current!.library[0].cfi).toBe(DOC.cfi);
    const saved = "epubcfi(/6/8!/4/2/40,/300,/300)";
    await act(async () => { lib.current!.updateProgress("book", 7272, saved); });
    expect(lib.current!.library[0].cfi).toBe(saved);
    expect(lib.current!.library[0].position).toBe(7272);
  });

  it("a cfi-only save (position -1) updates the cfi and keeps the stored position", async () => {
    const lib = await renderLibrary();
    await act(async () => { lib.current!.updateProgress("book", -1, "epubcfi(/6/8!/4/2/2,/4,/4)"); });
    expect(lib.current!.library[0].cfi).toBe("epubcfi(/6/8!/4/2/2,/4,/4)");
    expect(lib.current!.library[0].position).toBe(4155);
  });

  it("a position-only save keeps the stored cfi", async () => {
    const lib = await renderLibrary();
    await act(async () => { lib.current!.updateProgress("book", 5000); });
    expect(lib.current!.library[0].cfi).toBe(DOC.cfi);
    expect(lib.current!.library[0].position).toBe(5000);
  });
});
