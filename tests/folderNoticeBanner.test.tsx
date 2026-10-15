// @vitest-environment jsdom

import fs from "node:fs";
import path from "node:path";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../src/constants";

// FOLDER-NOTICE-1: the library banner, rendered through the real LibraryContainer, so a C1 failure shows the banner
// missing from the library and not only a missing file. (fn-n)-(fn-r) fail at C1; (fn-w) is a control.
const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, "..", rel), "utf-8"); // jsdom: import.meta.url is not a file URL
const TEXT = "Blurby can't reach your source folder. Your books are kept. Reconnect the drive, then press Retry.";

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve()).then(() => Promise.resolve());
}

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
}

// tests/updateInstallGating.test.tsx's mock, plus the banner's three members.
function createElectronApiMock(initial: string | null) {
  const gate = deferred<string | null>();
  const s: { push: ((code: string | null) => void) | null } = { push: null };
  const api: any = {
    getState: vi.fn().mockResolvedValue({
      settings: { ...DEFAULT_SETTINGS, firstRunCompleted: true },
      library: [],
    }),
    getPlatform: vi.fn().mockResolvedValue("win32"),
    saveSettings: vi.fn().mockResolvedValue(undefined),
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
    getFolderProblem: vi.fn().mockResolvedValue(initial),
    retrySourceFolder: vi.fn(() => gate.promise),
    onFolderProblem: vi.fn((cb: (code: string | null) => void) => { s.push = cb; return () => { s.push = null; }; }),
  };
  return { api, gate, s };
}

describe("folder notice banner (FOLDER-NOTICE-1)", () => {
  let container: HTMLDivElement;
  let root: Root;
  let mock: ReturnType<typeof createElectronApiMock>;

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
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    delete (window as any).electronAPI;
    delete (window as any).IntersectionObserver;
    delete (globalThis as any).IntersectionObserver;
  });

  const settle = async () => {
    for (let i = 0; i < 5; i++) await act(async () => { await flushPromises(); });
  };

  async function renderLibrary(initial: string | null) {
    mock = createElectronApiMock(initial);
    (window as any).electronAPI = mock.api;
    const { default: LibraryContainer } = await import("../src/components/LibraryContainer");
    await act(async () => {
      root.render(<LibraryContainer />);
      await flushPromises();
    });
    await settle();
  }

  const banner = () => Array.from(container.querySelectorAll('[role="alert"]')).find((el) => (el.textContent || "").includes(TEXT)) || null;
  const retryBtn = () => (Array.from(banner()?.querySelectorAll("button") || []).find((b) => b.textContent === "Retry") || null) as HTMLButtonElement | null;
  const toastWithText = () => Array.from(container.querySelectorAll(".toast")).some((el) => (el.textContent || "").includes(TEXT));
  const press = async () => { await act(async () => { retryBtn()?.click(); await flushPromises(); }); };

  it("(fn-n) it shows on mount when main already holds a problem", async () => {
    await renderLibrary("root-unlistable");
    expect(banner(), "the library shows no folder banner").not.toBeNull();
    expect(retryBtn()).not.toBeNull();
    expect(retryBtn()!.disabled).toBe(false);
    const mainSrc = read("main.js");
    expect(mainSrc.includes(TEXT), "the toast in main.js does not say what the banner says").toBe(true);
    expect(toastWithText(), "a toast replayed on mount").toBe(false);
  }, 30_000);

  it("(fn-o) one press, one call; a press during the attempt is ignored", async () => {
    await renderLibrary("root-unlistable");
    expect(retryBtn(), "no Retry button").not.toBeNull();
    await press();
    expect(mock.api.retrySourceFolder).toHaveBeenCalledTimes(1);
    expect(retryBtn()!.disabled, "Retry is not disabled while its check runs").toBe(true);
    await press();
    expect(mock.api.retrySourceFolder, "a press during the attempt made a second call").toHaveBeenCalledTimes(1);
  }, 30_000);

  it("(fn-p) a failed attempt keeps the banner, re-enables Retry, and nothing retries on its own", async () => {
    await renderLibrary("root-unlistable");
    expect(retryBtn(), "no Retry button").not.toBeNull();
    await press();
    await press();
    await act(async () => { mock.gate.resolve("root-unlistable"); await flushPromises(); });
    await settle();
    expect(banner(), "a failed attempt removed the banner").not.toBeNull();
    expect(retryBtn()!.disabled, "Retry stayed disabled after a failed attempt").toBe(false);
    await act(async () => { await new Promise((r) => setTimeout(r, 300)); });
    await settle();
    expect(mock.api.retrySourceFolder, "something retried on its own").toHaveBeenCalledTimes(1);
    expect(toastWithText()).toBe(false);
    const src = read("src/components/FolderNoticeBanner.tsx");
    expect(/setTimeout|setInterval|requestAnimationFrame/.test(src), "the banner arms a timer").toBe(false);
  }, 30_000);

  it("(fn-q) it clears on a success from any source", async () => {
    await renderLibrary("root-unlistable");
    expect(banner(), "no banner at the start").not.toBeNull();
    await act(async () => { mock.s.push?.(null); await flushPromises(); });
    expect(banner()).toBeNull();
    await act(async () => { mock.s.push?.("watch-failed"); await flushPromises(); });
    expect(banner(), "a pushed problem did not show the banner").not.toBeNull();
    await act(async () => { mock.s.push?.(null); await flushPromises(); });
    expect(banner()).toBeNull();
  }, 30_000);

  it("(fn-r) a successful Retry clears it", async () => {
    await renderLibrary("root-unlistable");
    expect(retryBtn(), "no Retry button").not.toBeNull();
    await press();
    await act(async () => { mock.gate.resolve(null); await flushPromises(); });
    await settle();
    expect(banner(), "a successful Retry left the banner up").toBeNull();
  }, 30_000);

  it("(fn-w) control: no problem, no banner; the library renders", async () => {
    await renderLibrary(null);
    expect((container.textContent || "").includes(TEXT)).toBe(false);
    expect(container.querySelector(".library-header")).not.toBeNull();
  }, 30_000);
});
