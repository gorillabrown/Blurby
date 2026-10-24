// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../src/constants";

// LIBRARY-WRITE-RACE-2 part 2 (owner ruling 2026-10-23, "Stay open, inline retry"): the Edit form waits for main's
// answer. On a failed save it stays open with the typed values and shows "Couldn't save — try again" beside Save.
// Rendered through the real LibraryContainer; (ef1)-(ef5) fail on the base, (ef6) and (ef7) are controls.
const ALERT = "Couldn't save — try again";
const ADD_TOAST = "Could not save document — please try again.";

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve()).then(() => Promise.resolve());
}

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
}

const f1 = { id: "f1", title: "Old", author: "Ann", source: "file", filepath: "C:\\books\\old.epub", ext: ".epub", position: 0, wordCount: 100, created: 1 };
const m1 = { id: "m1", title: "Manual", content: "one two", source: "manual", position: 0, wordCount: 2, created: 1 };

// tests/folderNoticeBanner.test.tsx's mock, plus the Edit form's members.
function createElectronApiMock() {
  const api: any = {
    getState: vi.fn().mockResolvedValue({
      settings: { ...DEFAULT_SETTINGS, firstRunCompleted: true, viewMode: "list" },
      library: [structuredClone(f1), structuredClone(m1)],
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
    applyMetadataUpdates: vi.fn(),
    updateDoc: vi.fn(),
    addManualDoc: vi.fn(),
    logError: vi.fn(),
  };
  return api;
}

describe("the Edit form waits for its save (LIBRARY-WRITE-RACE-2)", () => {
  let container: HTMLDivElement;
  let root: Root;
  let api: any;
  let unhandled: ReturnType<typeof vi.fn>;

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
    unhandled = vi.fn();
    process.on("unhandledRejection", unhandled);
  });

  afterEach(async () => {
    process.off("unhandledRejection", unhandled);
    await act(async () => {
      root.unmount();
    });
    container.remove();
    delete (window as any).electronAPI;
    delete (window as any).IntersectionObserver;
    delete (globalThis as any).IntersectionObserver;
  });

  // microtasks, then a macrotask turn so Node can report an unhandled rejection
  const settle = async () => {
    for (let i = 0; i < 5; i++) await act(async () => { await flushPromises(); });
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  };

  async function renderLibrary() {
    api = createElectronApiMock();
    (window as any).electronAPI = api;
    const { default: LibraryContainer } = await import("../src/components/LibraryContainer");
    await act(async () => {
      root.render(<LibraryContainer />);
      await flushPromises();
    });
    await settle();
  }

  const card = (title: string) => Array.from(container.querySelectorAll(".doc-card-wrapper"))
    .find((el) => el.querySelector(".doc-card-title")?.textContent === title) || null;
  const panel = () => container.querySelector(".add-edit-panel");
  const titleInput = () => container.querySelector<HTMLInputElement>('.add-edit-panel input[aria-label="Document title"]');
  const contentInput = () => container.querySelector<HTMLTextAreaElement>('.add-edit-panel textarea[aria-label="Document content"]');
  const saveBtn = () => container.querySelector<HTMLButtonElement>(".add-edit-actions .btn-fill");
  const alert = () => container.querySelector('.add-edit-actions [role="alert"]');
  const toastTexts = () => Array.from(container.querySelectorAll(".toast")).map((el) => el.textContent || "");

  function type(el: HTMLInputElement | HTMLTextAreaElement | null, value: string) {
    expect(el, "the field is not rendered").not.toBeNull();
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value")!.set!.call(el, value);
    el!.dispatchEvent(new Event("input", { bubbles: true }));
  }

  async function openEdit(title: string) {
    const btn = card(title)?.querySelector<HTMLButtonElement>('button[title="Edit"]') || null;
    expect(btn, `no Edit button on the "${title}" card`).not.toBeNull();
    await act(async () => { btn!.click(); await flushPromises(); });
    expect(panel(), "the Edit form did not open").not.toBeNull();
  }

  async function save() {
    await act(async () => { saveBtn()!.click(); await flushPromises(); });
    await settle();
  }

  async function failedMetadataSave() {
    await openEdit("Old");
    await act(async () => { type(titleInput(), "Typed"); });
    await save();
  }

  function expectStillOpenWithAlert() {
    expect(panel(), "the form closed on a failed save").not.toBeNull();
    expect(titleInput()!.value).toBe("Typed");
    expect(alert(), "no inline alert beside Save").not.toBeNull();
    expect(alert()!.textContent).toBe(ALERT);
  }

  it("(ef1) a rejected metadata save keeps the form open, the typed title and the old card", async () => {
    await renderLibrary();
    api.applyMetadataUpdates.mockRejectedValue(new Error("boom"));
    await failedMetadataSave();
    expectStillOpenWithAlert();
    expect(card("Old"), "the card does not show the saved title").not.toBeNull();
    expect(unhandled).not.toHaveBeenCalled();
  }, 30_000);

  it("(ef2) { updated: 0 } is a failed save", async () => {
    await renderLibrary();
    api.applyMetadataUpdates.mockResolvedValue({ updated: 0 });
    await failedMetadataSave();
    expectStillOpenWithAlert();
    expect(card("Old")).not.toBeNull();
    expect(unhandled).not.toHaveBeenCalled();
  }, 30_000);

  it("(ef3) Save again retries with the same payload, and success closes the form", async () => {
    await renderLibrary();
    api.applyMetadataUpdates.mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce({ updated: 1 });
    await failedMetadataSave();
    expect(alert(), "no inline alert after the failed save").not.toBeNull();
    await save();
    expect(panel(), "the form did not close on success").toBeNull();
    expect(alert()).toBeNull();
    const payload = [{ docId: "f1", updates: { title: "Typed", author: "Ann" } }];
    expect(api.applyMetadataUpdates).toHaveBeenCalledTimes(2);
    expect(api.applyMetadataUpdates).toHaveBeenNthCalledWith(1, payload);
    expect(api.applyMetadataUpdates).toHaveBeenNthCalledWith(2, payload);
  }, 30_000);

  it("(ef4) Save is disabled while the save is pending, and a second click makes no call", async () => {
    await renderLibrary();
    const gate = deferred<{ updated: number }>();
    api.applyMetadataUpdates.mockReturnValue(gate.promise);
    await openEdit("Old");
    await act(async () => { type(titleInput(), "Typed"); });
    await act(async () => { saveBtn()!.click(); await flushPromises(); });
    expect(saveBtn(), "the form closed before main answered").not.toBeNull();
    expect(saveBtn()!.disabled).toBe(true);
    await act(async () => { saveBtn()!.click(); await flushPromises(); });
    expect(api.applyMetadataUpdates).toHaveBeenCalledTimes(1);
    await act(async () => { gate.resolve({ updated: 1 }); await flushPromises(); });
    await settle();
    expect(panel()).toBeNull();
  }, 30_000);

  it("(ef5) a rejected content save keeps the form open with the typed title and text, and no toast", async () => {
    await renderLibrary();
    api.updateDoc.mockRejectedValue(new Error("boom"));
    await openEdit("Manual");
    await act(async () => { type(titleInput(), "Typed"); type(contentInput(), "three four"); });
    await save();
    expectStillOpenWithAlert();
    expect(contentInput()!.value).toBe("three four");
    expect(toastTexts().some((t) => t.includes("Could not save document"))).toBe(false);
  }, 30_000);

  it("(ef6) control: a successful metadata save closes the form", async () => {
    await renderLibrary();
    api.applyMetadataUpdates.mockResolvedValue({ updated: 1 });
    await failedMetadataSave();
    expect(panel()).toBeNull();
    expect(api.applyMetadataUpdates).toHaveBeenCalledWith([{ docId: "f1", updates: { title: "Typed", author: "Ann" } }]);
  }, 30_000);

  it("(ef7) control: the Add form keeps its toast", async () => {
    await renderLibrary();
    api.addManualDoc.mockRejectedValue(new Error("boom"));
    const add = container.querySelector<HTMLButtonElement>('button[aria-label="Add document"]');
    expect(add, "no + add button").not.toBeNull();
    await act(async () => { add!.click(); await flushPromises(); });
    await act(async () => { type(titleInput(), "New note"); type(contentInput(), "some words"); });
    await save();
    expect(toastTexts()).toContain(ADD_TOAST);
  }, 30_000);
});
