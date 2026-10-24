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

function liveLibrary() {
  return FIXTURE.docs
    .filter((d: any) => !d.deleted)
    .map((d: any) => ({ ...JSON.parse(JSON.stringify(d)), content: d.content ?? `Text of ${d.title}.` }));
}

// tests/folderNoticeBanner.test.tsx's mock, plus loadDocContent.
function createElectronApiMock(settingsOver: Record<string, unknown>) {
  const api: any = {
    getState: vi.fn().mockResolvedValue({
      settings: { ...DEFAULT_SETTINGS, firstRunCompleted: true, viewMode: "grid", ...settingsOver },
      library: liveLibrary(),
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

async function renderLibrary(settingsOver: Record<string, unknown> = {}) {
  api = createElectronApiMock(settingsOver);
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
