// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../src/constants";

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve()).then(() => Promise.resolve());
}

function createElectronApiMock() {
  let downloadedCallback: ((version: string) => void) | null = null;
  let availableCallback: ((version: string) => void) | null = null;
  return {
    api: {
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
      onUpdateAvailable: vi.fn((callback: (version: string) => void) => {
        availableCallback = callback;
        return () => {
          availableCallback = null;
        };
      }),
      onUpdateDownloaded: vi.fn((callback: (version: string) => void) => {
        downloadedCallback = callback;
        return () => {
          downloadedCallback = null;
        };
      }),
    },
    emitAvailable(version: string) {
      availableCallback?.(version);
    },
    emitDownloaded(version: string) {
      downloadedCallback?.(version);
    },
  };
}

describe("update install gating", () => {
  let container: HTMLDivElement;
  let root: Root;
  let electronApiMock: ReturnType<typeof createElectronApiMock>;

  beforeEach(() => {
    vi.resetModules();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    electronApiMock = createElectronApiMock();
    (window as any).electronAPI = electronApiMock.api;
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

  it("does not offer install after update-available check until update-downloaded fires", async () => {
    const { HelpSettings } = await import("../src/components/settings/HelpSettings");

    await act(async () => {
      root.render(<HelpSettings isMac={false} />);
      await flushPromises();
    });

    const checkButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Check for updates",
    );
    expect(checkButton).toBeTruthy();

    await act(async () => {
      checkButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();
    });

    expect(container.textContent).toContain("Update available: v1.75.2");
    expect(container.textContent).not.toContain("Install & restart");
    expect(electronApiMock.api.installUpdate).not.toHaveBeenCalled();

    await act(async () => {
      electronApiMock.emitDownloaded("1.75.2");
      await flushPromises();
    });

    expect(container.textContent).toContain("Update downloaded: v1.75.2");
    expect(container.textContent).toContain("Install & restart");

    const installButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Install & restart",
    );
    expect(installButton).toBeTruthy();

    await act(async () => {
      installButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();
    });

    expect(electronApiMock.api.installUpdate).toHaveBeenCalledTimes(1);
  });

  it("shows update-available as a passive library toast without install action", async () => {
    const { default: LibraryContainer } = await import("../src/components/LibraryContainer");

    await act(async () => {
      root.render(<LibraryContainer />);
      await flushPromises();
    });

    await act(async () => {
      electronApiMock.emitAvailable("1.75.2");
      await flushPromises();
    });

    expect(container.textContent).toContain("Update available: v1.75.2. Downloading...");
    expect(container.querySelector(".toast-action")).toBeNull();
    expect(container.textContent).not.toContain("Install");
    expect(electronApiMock.api.installUpdate).not.toHaveBeenCalled();
  });

  it("wires update-downloaded library banner to installUpdate", async () => {
    const { default: LibraryContainer } = await import("../src/components/LibraryContainer");

    await act(async () => {
      root.render(<LibraryContainer />);
      await flushPromises();
    });

    await act(async () => {
      electronApiMock.emitDownloaded("1.75.2");
      await flushPromises();
    });

    expect(container.textContent).toContain("Blurby 1.75.2 ready to install");

    const restartButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "restart",
    );
    expect(restartButton).toBeTruthy();

    await act(async () => {
      restartButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();
    });

    expect(electronApiMock.api.installUpdate).toHaveBeenCalledTimes(1);
  });
});
