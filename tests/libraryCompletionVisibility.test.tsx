// @vitest-environment jsdom

import React, { act, type ComponentProps } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../src/constants";
import type { BlurbyDoc } from "../src/types";
import type LibraryViewType from "../src/components/LibraryView";

type Props = ComponentProps<typeof LibraryViewType>;
type ViewMode = "grid" | "list";
const modes: ViewMode[] = ["grid", "list"];
const flush = () => Promise.resolve().then(() => Promise.resolve());

function doc(id: string, patch: Partial<BlurbyDoc> = {}): BlurbyDoc {
  return { id, title: `Read ${id}`, source: "folder", ext: ".epub", wordCount: 91,
    position: 91, created: Date.now(), unread: false, ...patch };
}

describe("completed reads remain visible (LIBRARY-COMPLETION-VISIBILITY-1)", () => {
  let container: HTMLDivElement;
  let root: Root;
  let LibraryView: typeof LibraryViewType;
  let props: Props;

  beforeEach(async () => {
    vi.resetModules();
    // Same real-root setup as folderNoticeBanner.test.tsx; no library/card/filter mocks.
    (window as any).electronAPI = {
      getLaunchAtLogin: vi.fn().mockResolvedValue(false),
      cloudGetAuthState: vi.fn().mockResolvedValue(null),
      cloudGetSyncStatus: vi.fn().mockResolvedValue({ status: "idle", lastSync: 0 }),
      onCloudSyncStatusChanged: vi.fn(() => () => {}),
      onUpdateDownloaded: vi.fn(() => () => {}),
    };
    (globalThis as any).IntersectionObserver = (window as any).IntersectionObserver = class {
      observe() {} unobserve() {} disconnect() {}
    };
    LibraryView = (await import("../src/components/LibraryView")).default;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    props = {
      library: [], settings: { ...DEFAULT_SETTINGS, viewMode: "grid" },
      wpm: 400, isMac: false, folderName: "Owned fixtures", loadingContent: false, toast: null,
      // APP-TABS-1: LibraryView shows only the active tab's items; the fixtures' folder EPUBs live in the Library.
      activeTab: "library", onTabChange: vi.fn(),
      onOpenDoc: vi.fn(), onAddDoc: vi.fn(), onAddDocFromUrl: vi.fn(),
      onDeleteDoc: vi.fn(), onResetProgress: vi.fn(), onSelectFolder: vi.fn(),
      onSwitchFolder: vi.fn(), onSetWpm: vi.fn(), onSetFolderName: vi.fn(),
      onToggleFavorite: vi.fn(), onArchiveDoc: vi.fn(), onUnarchiveDoc: vi.fn(),
      onToggleFlap: vi.fn(), onSettingsChange: vi.fn(), onMarkDocsSeen: vi.fn(),
    };
  });

  afterEach(async () => {
    await act(async () => { root.unmount(); });
    container.remove();
    delete (window as any).electronAPI;
    delete (window as any).IntersectionObserver;
    delete (globalThis as any).IntersectionObserver;
  });

  async function render(library: BlurbyDoc[], mode: ViewMode = "grid") {
    props = { ...props, library, settings: { ...props.settings, viewMode: mode } };
    await act(async () => { root.render(<LibraryView {...props} />); await flush(); });
  }
  const cards = () => [...container.querySelectorAll<HTMLElement>("[data-doc-id]")];
  const ids = () => cards().map(el => el.dataset.docId!).sort();
  const card = (id: string) => container.querySelector<HTMLElement>(`[data-doc-id="${id}"]`);
  // APP-TABS-1: the status and type filters live in the tab bar's filter menu (FilterMenu), one menu per tab.
  async function tab(label: string) {
    const menuButton = container.querySelector<HTMLButtonElement>('.app-tab-bar button[aria-label="Filter"]');
    expect(menuButton, "missing real filter menu button").not.toBeNull();
    if (!container.querySelector('[role="menu"][aria-label="Filter"]')) {
      await act(async () => { menuButton!.click(); await flush(); });
    }
    const button = [...container.querySelectorAll<HTMLButtonElement>('[role="menu"] [role="menuitemradio"]')]
      .find(el => el.textContent?.trim().toLowerCase() === label.toLowerCase());
    expect(button, `missing real ${label} filter`).toBeDefined();
    await act(async () => { button!.click(); await flush(); });
  }
  async function search(value: string) {
    if (!container.querySelector('input[aria-label="Search library"]')) {
      await act(async () => {
        container.querySelector<HTMLButtonElement>('.app-tab-bar button[aria-label="Search"]')!.click();
        await flush();
      });
    }
    const input = container.querySelector<HTMLInputElement>('input[aria-label="Search library"]');
    expect(input).not.toBeNull();
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
      input!.dispatchEvent(new Event("input", { bubbles: true }));
      await flush();
    });
  }

  it.each(modes)("(lv0) incomplete and filter-exclusion controls render the production cards (%s)", async mode => {
    await render([doc("active", { position: 3, favorite: true }),
      doc("archive", { position: 3, archived: true }), doc("old", { position: 2, created: 1 })], mode);
    expect(ids()).toEqual(["active", "old"]);
    await tab("favorites"); expect(ids()).toEqual(["active"]);
    await tab("archived"); expect(ids()).toEqual(["archive"]);
  });

  it.each(modes)("(lv1) 91/91 remains once in All with unchanged data and no persistence callback (%s)", async mode => {
    const library = [doc("completed"), doc("control", { position: 3 })];
    const before = JSON.stringify(library);
    await render(library, mode);
    expect(ids()).toEqual(["completed", "control"]);
    expect(card("completed")?.closest('[role="list"]')?.previousElementSibling?.textContent).toBe("Reading Now");
    expect(JSON.stringify(library)).toBe(before);
    for (const callback of [props.onArchiveDoc, props.onUnarchiveDoc, props.onResetProgress, props.onOpenDoc]) {
      expect(callback).not.toHaveBeenCalled();
    }
  });

  it.each(modes)("(lv2) completed archive record appears once in Archive and not All (%s)", async mode => {
    await render([doc("archived", { archived: true }), doc("active", { position: 3 })], mode);
    expect(ids()).toEqual(["active"]);
    await tab("archived");
    expect(ids()).toEqual(["archived"]);
    expect(props.onArchiveDoc).not.toHaveBeenCalled();
  });

  it.each(modes)("(lv3) complete and over-complete cards reopen through their existing callback (%s)", async mode => {
    const library = [doc("complete"), doc("beyond", { position: 92 })];
    await render(library, mode);
    expect(ids()).toEqual(["beyond", "complete"]);
    for (const d of library) {
      await act(async () => { card(d.id)!.click(); });
      expect(props.onOpenDoc).toHaveBeenLastCalledWith(d, undefined);
    }
    expect(props.onOpenDoc).toHaveBeenCalledTimes(2);
  });

  for (const mode of modes) {
    it.each([91, 0, undefined])(`(lv4) all boundary positions have one actual card; wordCount=%s (${mode})`, async wordCount => {
      const positions = [undefined, 0, 2, 3, 90, 91, 92];
      const library = positions.map((position, i) => {
        const d = doc(`boundary-${i}`);
        if (position === undefined) delete (d as Partial<BlurbyDoc>).position; else d.position = position;
        if (wordCount === undefined) delete (d as Partial<BlurbyDoc>).wordCount; else d.wordCount = wordCount;
        return d;
      });
      await render(library, mode);
      expect(ids()).toEqual(library.map(d => d.id).sort());
      expect(new Set(ids()).size).toBe(library.length);
      expect(card("boundary-2")?.closest('[role="list"]')?.previousElementSibling?.textContent).toContain("Not Started");
      expect(card("boundary-3")?.closest('[role="list"]')?.previousElementSibling?.textContent).toBe("Reading Now");
    });
  }

  it.each(modes)("(lv5) New/Favorites/type/search filters retain inclusion and exclusion (%s)", async mode => {
    const library = [
      doc("book", { favorite: true }), doc("old", { position: 3, created: 1 }),
      doc("article", { source: "url", ext: undefined, title: "Article needle", position: 3 }),
      doc("pdf", { ext: ".pdf", position: 3 }), doc("archive", { archived: true }),
    ];
    // APP-TABS-1: the url article lives in Newsroom, and the "articles" type filter is gone (spec: "Filters belong to
    // each tab"). Each tab's filters are checked on that tab; across the two tabs New still admits article, book and pdf.
    await render(library, mode);
    await tab("new"); expect(ids()).toEqual(["book", "pdf"]);
    await tab("favorites"); expect(ids()).toEqual(["book"]);
    await tab("all");
    await tab("books"); expect(ids()).toEqual(["book", "old"]);
    await tab("PDFs"); expect(ids()).toEqual(["pdf"]);
    await tab("all types");
    await act(async () => { container.querySelector<HTMLButtonElement>('.app-tab-bar button[aria-label="Filter"]')!.click(); await flush(); });
    const libraryItems = [...container.querySelectorAll('[role="menu"] [role="menuitemradio"]')].map(el => el.textContent);
    expect(libraryItems).toEqual(["All", "New", "Favorites", "Archived", "All types", "Books", "PDFs"]);
    expect(libraryItems).not.toContain("Articles");
    props = { ...props, activeTab: "newsroom" };
    await render(library, mode);
    expect(ids()).toEqual(["article"]);
    await tab("new"); expect(ids()).toEqual(["article"]);
    await tab("favorites"); expect(ids()).toEqual([]);
    await act(async () => { container.querySelector<HTMLButtonElement>('.app-tab-bar button[aria-label="Filter"]')!.click(); await flush(); });
    expect([...container.querySelectorAll('[role="menu"] [role="menuitemradio"]')].map(el => el.textContent))
      .toEqual(["All", "New", "Favorites", "Archived"]);
    await tab("all");
    await search("needle"); expect(ids()).toEqual(["article"]);
    expect([...container.querySelectorAll(".search-result-item .search-result-tab")].map(el => el.textContent))
      .toEqual(["Newsroom"]);
    await search("absent"); expect(ids()).toEqual([]);
  });

  it.each(modes)("(lv6) progress and archive/unarchive transitions never lose or double a card (%s)", async mode => {
    await render([doc("transition", { position: 90 })], mode);
    expect(ids()).toEqual(["transition"]);
    await render([doc("transition", { position: 91 })], mode);
    expect(ids()).toEqual(["transition"]);
    await render([doc("transition", { archived: true })], mode);
    expect(ids()).toEqual([]);
    await tab("archived"); expect(ids()).toEqual(["transition"]);
    await render([doc("transition", { archived: false })], mode);
    expect(ids()).toEqual([]);
    await tab("all"); expect(ids()).toEqual(["transition"]);
    expect(props.onArchiveDoc).not.toHaveBeenCalled();
    expect(props.onUnarchiveDoc).not.toHaveBeenCalled();
  });

  it.each(modes)("(lv-tab) a completed Newsroom read stays once in Newsroom's All and only there (%s)", async mode => {
    // APP-TABS-1 x LIBRARY-COMPLETION-VISIBILITY-1: pasted text (manual, no ext) and an explicit home both live in Newsroom.
    const library = [doc("pasted", { source: "manual", ext: undefined }), doc("moved", { home: "newsroom" }),
      doc("book", { position: 3 })];
    const before = JSON.stringify(library);
    props = { ...props, activeTab: "newsroom" };
    await render(library, mode);
    expect(ids()).toEqual(["moved", "pasted"]);
    expect(new Set(ids()).size).toBe(2);
    expect(card("pasted")?.closest('[role="list"]')?.previousElementSibling?.textContent).toBe("Reading Now");
    expect(card("moved")?.closest('[role="list"]')?.previousElementSibling?.textContent).toBe("Reading Now");
    await tab("archived"); expect(ids()).toEqual([]);
    await tab("all"); expect(ids()).toEqual(["moved", "pasted"]);
    expect(JSON.stringify(library)).toBe(before);
    for (const callback of [props.onArchiveDoc, props.onUnarchiveDoc, props.onResetProgress, props.onOpenDoc]) {
      expect(callback).not.toHaveBeenCalled();
    }
  });
});
