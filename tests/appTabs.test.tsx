// @vitest-environment jsdom

import fs from "node:fs";
import path from "node:path";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../src/constants";

// APP-TABS-1: the four-tab shell, rendered through the real LibraryContainer with the reader stubbed.
// The library is the fixture's live records, each with inline content so opening one needs no load.
vi.mock("../src/components/ReaderContainer", () => ({
  default: (props: any) => (
    <div data-testid="reader-stub" data-doc={props.activeDoc?.id}>
      <button onClick={() => props.onExitReader(0)}>exit</button>
    </div>
  ),
}));

const FIXTURE = JSON.parse(fs.readFileSync(path.resolve(__dirname, "fixtures/app-tabs/library-v6.json"), "utf-8"));
const LIBRARY_IDS = ["f-epub", "f-pdf", "m-drop", "s-sample"]; // the Library's non-archived ids
const NEWSROOM_IDS = ["m-text", "u-art", "u-ext"];
const TAB_NAMES = ["Library", "Newsroom", "Podcasts", "Marketplace"];

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve()).then(() => Promise.resolve());
}

type Patch = Record<string, Record<string, unknown>>;

function liveLibrary(patch: Patch = {}) {
  return FIXTURE.docs
    .filter((d: any) => !d.deleted)
    .map((d: any) => ({ ...JSON.parse(JSON.stringify(d)), content: d.content ?? `Text of ${d.title}.`, ...(patch[d.id] || {}) }));
}

// tests/folderNoticeBanner.test.tsx's mock, plus loadDocContent.
function createElectronApiMock(settingsOver: Record<string, unknown>, patch: Patch = {}) {
  const api: any = {
    getState: vi.fn().mockResolvedValue({
      settings: { ...DEFAULT_SETTINGS, firstRunCompleted: true, viewMode: "grid", ...settingsOver },
      library: liveLibrary(patch),
    }),
    getPlatform: vi.fn().mockResolvedValue("win32"),
    saveSettings: vi.fn().mockResolvedValue(undefined),
    saveLibrary: vi.fn().mockResolvedValue(undefined),
    getSiteLogins: vi.fn().mockResolvedValue([]),
    kokoroPreload: vi.fn().mockResolvedValue({ success: true }),
    onLibraryUpdated: vi.fn(() => () => {}),
    onWatcherError: vi.fn(() => () => {}),
    onCloudAuthRequired: vi.fn(() => () => {}),
    onWsConnectionAttempt: vi.fn(() => () => {}),
    onWsPairingSuccess: vi.fn(() => () => {}),
    cloudGetAuthState: vi.fn().mockResolvedValue(null),
    cloudGetSyncStatus: vi.fn().mockResolvedValue({ status: "idle", lastSync: 0, provider: null }),
    onCloudSyncStatusChanged: vi.fn(() => () => {}),
    getLaunchAtLogin: vi.fn().mockResolvedValue(false),
    checkForUpdates: vi.fn().mockResolvedValue({ status: "checked", version: "1.75.2" }),
    installUpdate: vi.fn(),
    onUpdateAvailable: vi.fn(() => () => {}),
    onUpdateDownloaded: vi.fn(() => () => {}),
    getFolderProblem: vi.fn().mockResolvedValue(null),
    retrySourceFolder: vi.fn().mockResolvedValue(null),
    onFolderProblem: vi.fn(() => () => {}),
    loadDocContent: vi.fn().mockResolvedValue("Loaded text."),
    setDocHome: vi.fn().mockResolvedValue({ ok: true }),
    addDocFromUrl: vi.fn(),
    addManualDoc: vi.fn(),
    applyMetadataUpdates: vi.fn().mockResolvedValue(undefined),
  };
  return api;
}

let container: HTMLDivElement;
let root: Root;
let api: any;

beforeEach(() => {
  vi.resetModules();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  (window as any).IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  (globalThis as any).IntersectionObserver = (window as any).IntersectionObserver;
  if (!(Element.prototype as any).scrollIntoView) (Element.prototype as any).scrollIntoView = () => {};
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
  vi.useRealTimers();
  delete (window as any).electronAPI;
  delete (window as any).IntersectionObserver;
  delete (globalThis as any).IntersectionObserver;
});

const settle = async () => {
  for (let i = 0; i < 5; i++) await act(async () => { await flushPromises(); });
};

async function renderLibrary(settingsOver: Record<string, unknown> = {}, patch: Patch = {}) {
  api = createElectronApiMock(settingsOver, patch);
  (window as any).electronAPI = api;
  const { default: LibraryContainer } = await import("../src/components/LibraryContainer");
  await act(async () => {
    root.render(<LibraryContainer />);
    await flushPromises();
  });
  await settle();
}

const tabBar = () => document.querySelector(".app-tab-bar [role=\"tablist\"]");
const tabs = () => Array.from(tabBar()?.querySelectorAll<HTMLButtonElement>("[role=\"tab\"]") || []);
const tabNamed = (name: string) => tabs().find((t) => t.textContent === name) || null;
const selectedTab = () => tabs().find((t) => t.getAttribute("aria-selected") === "true")?.textContent ?? null;
const visibleIds = () => [...new Set(Array.from(container.querySelectorAll<HTMLElement>("[data-doc-id]")).map((e) => e.dataset.docId))].sort();
const card = (id: string) => container.querySelector<HTMLElement>(`[data-doc-id="${id}"]`);
const readerStub = () => document.querySelector("[data-testid=\"reader-stub\"]");
const click = async (el: Element | null) => {
  expect(el, "element to click").not.toBeNull();
  await act(async () => { (el as HTMLElement).click(); await flushPromises(); });
  await settle();
};
const exitReader = async () => click(Array.from(document.querySelectorAll("button")).find((b) => b.textContent === "exit") || null);
const key = async (init: KeyboardEventInit) => {
  await act(async () => {
    document.body.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }));
    await flushPromises();
  });
  await settle();
};
const ctrlDigit = (n: number, mod: "ctrlKey" | "metaKey" = "ctrlKey") => key({ code: `Digit${n}`, key: String(n), [mod]: true });

describe("APP-TABS-1 tab shell (Wave A)", () => {
  it("(a1) frame 1: four tabs, Library selected, only Library items shown", async () => {
    await renderLibrary();
    expect(tabs().map((t) => t.textContent)).toEqual(TAB_NAMES);
    expect(tabNamed("Library")?.getAttribute("aria-selected")).toBe("true");
    expect(visibleIds()).toEqual(LIBRARY_IDS);
    for (const id of NEWSROOM_IDS) expect(card(id)).toBeNull();
  }, 30_000);

  it("(a2) clicking Newsroom shows its items and saves the tab", async () => {
    await renderLibrary();
    await click(tabNamed("Newsroom"));
    expect(selectedTab()).toBe("Newsroom");
    expect(visibleIds()).toEqual(NEWSROOM_IDS);
    expect(api.saveSettings).toHaveBeenCalledWith({ libraryTab: "newsroom" });
  }, 30_000);

  it("(a3) frame 1: the reader is full-screen and returns to Newsroom", async () => {
    await renderLibrary();
    await click(tabNamed("Newsroom"));
    await click(card("u-art"));
    expect(readerStub()).not.toBeNull();
    expect(document.querySelector("[role=\"tablist\"]")).toBeNull();
    await exitReader();
    expect(selectedTab()).toBe("Newsroom");
    expect(card("u-art")).not.toBeNull();
  }, 30_000);

  it("(a4) Ctrl+1 in the reader changes nothing", async () => {
    await renderLibrary();
    await click(tabNamed("Newsroom"));
    await click(card("u-art"));
    expect(readerStub()).not.toBeNull();
    await ctrlDigit(1);
    expect(readerStub()).not.toBeNull();
    await exitReader();
    expect(selectedTab()).toBe("Newsroom");
  }, 30_000);

  it("(a5) the app opens on the last-used tab, or the Library", async () => {
    const cases: Array<[unknown, string]> = [["newsroom", "Newsroom"], ["marketplace", "Marketplace"], ["x", "Library"], [undefined, "Library"]];
    for (const [value, expected] of cases) {
      await act(async () => { root.unmount(); });
      root = createRoot(container);
      vi.resetModules();
      await renderLibrary(value === undefined ? {} : { libraryTab: value });
      expect(selectedTab(), `libraryTab ${String(value)}`).toBe(expected);
    }
  }, 60_000);

  it("(a6) Ctrl+1 to Ctrl+4 (and Cmd) switch tabs; not while an overlay is open", async () => {
    await renderLibrary();
    for (let n = 1; n <= 4; n++) {
      await ctrlDigit(n);
      expect(selectedTab()).toBe(TAB_NAMES[n - 1]);
    }
    for (let n = 1; n <= 4; n++) {
      await ctrlDigit(n, "metaKey");
      expect(selectedTab()).toBe(TAB_NAMES[n - 1]);
    }
    await ctrlDigit(1);
    expect(selectedTab()).toBe("Library");
    await key({ key: "?", code: "Slash", shiftKey: true });
    await ctrlDigit(2);
    expect(selectedTab()).toBe("Library");
  }, 30_000);

  it("(a7) frame 5 (shell): Podcasts and Marketplace each have a panel; Ctrl+1 returns", async () => {
    await renderLibrary();
    for (const name of ["Podcasts", "Marketplace"]) {
      await click(tabNamed(name));
      expect(selectedTab()).toBe(name);
      expect(document.querySelector(`[role="tabpanel"][id="app-tabpanel-${name.toLowerCase()}"]`)).not.toBeNull();
      await ctrlDigit(1);
      expect(selectedTab()).toBe("Library");
      expect(visibleIds()).toEqual(LIBRARY_IDS);
    }
  }, 30_000);

  it("(a8) control: the hamburger still opens the menu flap", async () => {
    await renderLibrary();
    expect(document.querySelector(".menu-flap.open")).toBeNull();
    await click(document.querySelector("[aria-label=\"Open menu\"]"));
    expect(document.querySelector(".menu-flap.open")).not.toBeNull();
  }, 30_000);
});

// ── Wave B: search, filters, moves and the two unbuilt tabs ────────────────────────────────────────────────────

const hoverCloseMs = async () => ((await import("../src/constants")) as any).FILTER_MENU_HOVER_CLOSE_MS as number;
const barButton = (label: string) => document.querySelector<HTMLButtonElement>(`.app-tab-bar [aria-label="${label}"]`);
const filterButton = () => barButton("Filter");
const menu = () => document.querySelector("[role=\"menu\"]");
const menuItems = () => Array.from(document.querySelectorAll<HTMLElement>("[role=\"menu\"] [role=\"menuitemradio\"]"));
const menuItemTexts = () => menuItems().map((i) => i.textContent);
const checkedItem = () => menuItems().find((i) => i.getAttribute("aria-checked") === "true")?.textContent ?? null;
const toastText = () => Array.from(document.querySelectorAll(".toast")).map((t) => t.textContent || "").join(" | ");
const fire = async (el: Element | null, type: string, init: Record<string, unknown> = {}) => {
  expect(el, `element for ${type}`).not.toBeNull();
  await act(async () => {
    const Ctor: any = type.startsWith("key") ? KeyboardEvent : MouseEvent;
    el!.dispatchEvent(new Ctor(type, { bubbles: !["mouseenter", "mouseleave"].includes(type), cancelable: true, ...init }));
    await flushPromises();
  });
};
// React reads enter and leave from mouseover and mouseout, so a hover dispatches both, as a browser does.
const hover = async (el: Element | null) => {
  await fire(el, "mouseover", { relatedTarget: document.body });
  await fire(el, "mouseenter", { relatedTarget: document.body });
};
const unhover = async (el: Element | null) => {
  await fire(el, "mouseout", { relatedTarget: document.body });
  await fire(el, "mouseleave", { relatedTarget: document.body });
};
async function typeInto(el: HTMLInputElement | HTMLTextAreaElement | null, value: string) {
  expect(el, "input").not.toBeNull();
  await act(async () => {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value")!.set!.call(el, value);
    el!.dispatchEvent(new Event("input", { bubbles: true }));
    await flushPromises();
  });
  await settle();
}
const searchRows = () => Array.from(document.querySelectorAll<HTMLElement>(".search-result-item"));
const searchRow = (title: string) => searchRows().find((r) => r.querySelector(".search-result-title")?.textContent === title) || null;
async function searchMeditations() {
  await click(barButton("Search"));
  await typeInto(document.querySelector<HTMLInputElement>("[aria-label=\"Search library\"]"), "meditations");
}
const openCardMenu = async (id: string) => {
  await fire(card(id), "contextmenu", { clientX: 10, clientY: 10 });
  await settle();
  return document.querySelector(".doc-context-menu");
};
const menuButton = (scope: Element | null, text: string) =>
  (Array.from(scope?.querySelectorAll("button") || []).find((b) => b.textContent === text) || null) as HTMLButtonElement | null;

describe("APP-TABS-1 search, filters, moves and the unbuilt tabs (Wave B)", () => {
  it("(b1) frame 3: search covers every tab, labels each result, and opens on its tab", async () => {
    await renderLibrary();
    await searchMeditations();
    expect(searchRows().map((r) => r.querySelector(".search-result-title")?.textContent).sort())
      .toEqual(["Meditations", "Meditations on modern Stoicism"]);
    expect(searchRow("Meditations")?.querySelector(".search-result-tab")?.textContent).toBe("Library");
    expect(searchRow("Meditations on modern Stoicism")?.querySelector(".search-result-tab")?.textContent).toBe("Newsroom");
    await fire(searchRow("Meditations on modern Stoicism"), "mousedown");
    await settle();
    expect(readerStub()?.getAttribute("data-doc")).toBe("u-art");
    await exitReader();
    expect(selectedTab()).toBe("Newsroom");
  }, 30_000);

  it("(b2) the same search on Podcasts lists the same two labelled results", async () => {
    await renderLibrary();
    await click(tabNamed("Podcasts"));
    await searchMeditations();
    expect(searchRows().map((r) => r.querySelector(".search-result-tab")?.textContent).sort()).toEqual(["Library", "Newsroom"]);
  }, 30_000);

  it("(b3) the command palette lists both homes, labelled, and opens on the item's tab", async () => {
    await renderLibrary();
    await key({ key: "/", code: "Slash" });
    const items = Array.from(document.querySelectorAll<HTMLElement>(".command-palette-item"));
    const labelled = (label: string) => items.find((i) => i.querySelector(".command-palette-label")?.textContent === label) || null;
    const sub = (el: Element | null) => el?.querySelector(".command-palette-sublabel")?.textContent ?? "";
    expect(items.length).toBe(8);
    expect(sub(labelled("Meditations"))).toMatch(/(^| · )Library$/);
    expect(sub(labelled("Meditations on modern Stoicism"))).toMatch(/(^| · )Newsroom$/);
    for (const i of items) expect(sub(i)).toMatch(/(^| · )(Library|Newsroom)$/);
    await click(labelled("Meditations on modern Stoicism"));
    expect(readerStub()?.getAttribute("data-doc")).toBe("u-art");
    await exitReader();
    expect(selectedTab()).toBe("Newsroom");
  }, 30_000);

  it("(b4) frame 4: hovering the filter opens Newsroom's four filters; leaving closes it", async () => {
    await renderLibrary();
    await click(tabNamed("Newsroom"));
    expect(filterButton()?.getAttribute("aria-haspopup")).toBe("menu");
    await hover(filterButton());
    expect(menu()).not.toBeNull();
    expect(menuItemTexts()).toEqual(["All", "New", "Favorites", "Archived"]);
    expect(filterButton()?.getAttribute("aria-expanded")).toBe("true");
    const ms = await hoverCloseMs();
    expect(typeof ms).toBe("number");
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    await unhover(filterButton());
    await act(async () => { vi.advanceTimersByTime(ms); });
    vi.useRealTimers();
    expect(menu()).toBeNull();
  }, 30_000);

  it("(b5) click toggles; Enter opens and focuses; arrows move; Escape closes to the button", async () => {
    await renderLibrary();
    await click(filterButton());
    expect(menu()).not.toBeNull();
    await click(filterButton());
    expect(menu()).toBeNull();
    filterButton()!.focus();
    await fire(filterButton(), "keydown", { key: "Enter", code: "Enter" });
    expect(menu()).not.toBeNull();
    expect(document.activeElement).toBe(menuItems()[0]);
    await fire(document.activeElement, "keydown", { key: "ArrowDown", code: "ArrowDown" });
    expect(document.activeElement).toBe(menuItems()[1]);
    await fire(document.activeElement, "keydown", { key: "Escape", code: "Escape" });
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(filterButton());
  }, 30_000);

  it("(b6) frame 4 on E-ink: a tap (enter then click) opens the menu; a second tap closes it", async () => {
    await renderLibrary({ einkMode: true });
    await hover(filterButton());
    await click(filterButton());
    expect(menu()).not.toBeNull();
    await click(filterButton());
    expect(menu()).toBeNull();
  }, 30_000);

  it("(b7) each tab keeps its own filters", async () => {
    await renderLibrary({}, { "f-epub": { favorite: true } });
    await click(filterButton());
    expect(menuItemTexts()).toEqual(["All", "New", "Favorites", "Archived", "All types", "Books", "PDFs"]);
    expect(Array.from(menu()?.children || [])[4]?.classList.contains("filter-menu-sep")).toBe(true);
    await click(menuItems().find((i) => i.textContent === "Favorites") || null);
    await click(tabNamed("Newsroom"));
    await click(filterButton());
    expect(checkedItem()).toBe("All");
    await click(filterButton());
    await click(tabNamed("Library"));
    await click(filterButton());
    expect(checkedItem()).toBe("Favorites");
    await click(filterButton());
    expect(visibleIds()).toEqual(["f-epub"]);
  }, 30_000);

  it("(b8) frame 2: Move to Newsroom from a grid card", async () => {
    await renderLibrary();
    await click(menuButton(await openCardMenu("f-pdf"), "Move to Newsroom"));
    expect(api.setDocHome).toHaveBeenCalledWith("f-pdf", "newsroom");
    expect(card("f-pdf")).toBeNull();
    expect(toastText()).toContain("Moved to Newsroom");
    await click(tabNamed("Newsroom"));
    expect(card("f-pdf")).not.toBeNull();
    expect(menuButton(await openCardMenu("f-pdf"), "Move to Library")).not.toBeNull();
  }, 30_000);

  it("(b9) frame 2 in list view: list rows have the same menu", async () => {
    await renderLibrary({ viewMode: "list" });
    expect(card("f-pdf")?.classList.contains("doc-card")).toBe(true);
    const m = await openCardMenu("f-pdf");
    expect(m?.classList.contains("doc-context-menu")).toBe(true);
    await click(menuButton(m, "Move to Newsroom"));
    expect(api.setDocHome).toHaveBeenCalledWith("f-pdf", "newsroom");
    expect(card("f-pdf")).toBeNull();
    await click(tabNamed("Newsroom"));
    expect(card("f-pdf")).not.toBeNull();
  }, 30_000);

  it("(b10) a failed move leaves the card and says so", async () => {
    await renderLibrary();
    api.setDocHome.mockResolvedValue({ ok: false });
    await click(menuButton(await openCardMenu("f-pdf"), "Move to Newsroom"));
    expect(api.setDocHome).toHaveBeenCalledWith("f-pdf", "newsroom");
    expect(card("f-pdf")).not.toBeNull();
    expect(toastText()).toContain("Could not move this item — please try again.");
  }, 30_000);

  it("(b11) frame 5: the Podcasts empty state, the Marketplace banner, a disabled filter; search and Ctrl+1-4 work", async () => {
    await renderLibrary();
    await click(tabNamed("Podcasts"));
    expect(document.querySelector("#app-tabpanel-podcasts")?.textContent).toContain("No podcasts yet");
    await click(tabNamed("Marketplace"));
    expect(document.querySelector("#app-tabpanel-marketplace [role=\"status\"]")?.textContent).toBe("Coming soon");
    for (const n of [3, 4]) {
      await ctrlDigit(n);
      expect(filterButton()?.getAttribute("aria-disabled")).toBe("true");
      await hover(filterButton());
      await click(filterButton());
      expect(menu()).toBeNull();
    }
    await searchMeditations();
    expect(searchRows().length).toBe(2);
    for (let n = 1; n <= 4; n++) {
      await ctrlDigit(n);
      expect(selectedTab()).toBe(TAB_NAMES[n - 1]);
    }
  }, 30_000);

  it("(b12) owner question 3: an article added from the Library tab says Saved to Newsroom", async () => {
    await renderLibrary();
    api.addDocFromUrl.mockResolvedValue({ doc: { id: "u-new", title: "New Article", source: "url", wordCount: 10, position: 0, created: 1 } });
    await click(document.querySelector("[aria-label=\"Add from URL\"]"));
    await typeInto(document.querySelector<HTMLInputElement>("[aria-label=\"Article URL\"]"), "https://example.com/new");
    await click(Array.from(document.querySelectorAll("button")).find((b) => b.textContent === "fetch") || null);
    expect(api.addDocFromUrl).toHaveBeenCalledWith("https://example.com/new");
    expect(toastText()).toContain("Saved to Newsroom");
    expect(selectedTab()).toBe("Library");
  }, 30_000);

  it("(b13) control: + add still opens the Add form, and the metadata save still applies", async () => {
    await renderLibrary();
    await click(document.querySelector("[aria-label=\"Add document\"]"));
    expect(document.querySelector("[aria-label=\"Document title\"]")).not.toBeNull();
    await click(menuButton(document.querySelector(".add-edit-actions"), "cancel"));
    await click(menuButton(await openCardMenu("f-epub"), "Edit Metadata"));
    await typeInto(document.querySelector<HTMLInputElement>("[aria-label=\"Document title\"]"), "Meditations II");
    await click(menuButton(document.querySelector(".add-edit-actions"), "save"));
    expect(api.applyMetadataUpdates).toHaveBeenCalledWith([{ docId: "f-epub", updates: expect.objectContaining({ title: "Meditations II" }) }]);
  }, 30_000);
});
