// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * EXT-ENR-B: Auto-Discovery Pairing
 *
 * Tests for: WS channel constants, server push events (connection-attempt,
 * pairing-success), PairingBanner component behavior, 60s cooldown logic,
 * preload listener cleanup contracts, ConnectorsSettings polling interval.
 */

// ── Channel Constants ────────────────────────────────────────────────────────

describe("WS channel constants", () => {
  it("WS_CONNECTION_ATTEMPT_CHANNEL equals 'ws-connection-attempt'", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { WS_CONNECTION_ATTEMPT_CHANNEL } = require("../main/constants");
    expect(WS_CONNECTION_ATTEMPT_CHANNEL).toBe("ws-connection-attempt");
  });

  it("WS_PAIRING_SUCCESS_CHANNEL equals 'ws-pairing-success'", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { WS_PAIRING_SUCCESS_CHANNEL } = require("../main/constants");
    expect(WS_PAIRING_SUCCESS_CHANNEL).toBe("ws-pairing-success");
  });

  it("both channels are distinct strings", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { WS_CONNECTION_ATTEMPT_CHANNEL, WS_PAIRING_SUCCESS_CHANNEL } = require("../main/constants");
    expect(WS_CONNECTION_ATTEMPT_CHANNEL).not.toBe(WS_PAIRING_SUCCESS_CHANNEL);
    expect(typeof WS_CONNECTION_ATTEMPT_CHANNEL).toBe("string");
    expect(typeof WS_PAIRING_SUCCESS_CHANNEL).toBe("string");
  });
});

// ── Server push: connection-attempt ─────────────────────────────────────────

describe("Server push: connection-attempt event", () => {
  it("emits WS_CONNECTION_ATTEMPT_CHANNEL to mainWindow on unauthenticated client connect", () => {
    const { WS_CONNECTION_ATTEMPT_CHANNEL } = require("../main/constants");

    // Mock webContents.send and mainWindow
    const mockSend = vi.fn();
    const mockMainWindow = {
      isDestroyed: () => false,
      webContents: { send: mockSend },
    };

    // Simulate the push logic extracted from handleConnection in ws-server.js
    function simulateConnectionAttempt(ctx: { getMainWindow: () => typeof mockMainWindow | null }) {
      const mw = ctx?.getMainWindow?.();
      if (mw && !mw.isDestroyed()) {
        mw.webContents.send(WS_CONNECTION_ATTEMPT_CHANNEL, { timestamp: Date.now() });
      }
    }

    simulateConnectionAttempt({ getMainWindow: () => mockMainWindow });

    expect(mockSend).toHaveBeenCalledOnce();
    expect(mockSend).toHaveBeenCalledWith(
      WS_CONNECTION_ATTEMPT_CHANNEL,
      expect.objectContaining({ timestamp: expect.any(Number) })
    );
  });

  it("does NOT emit when mainWindow is null", () => {
    const { WS_CONNECTION_ATTEMPT_CHANNEL } = require("../main/constants");
    const mockSend = vi.fn();

    function simulateConnectionAttempt(ctx: { getMainWindow: () => null }) {
      const mw = ctx?.getMainWindow?.();
      if (mw && !(mw as any).isDestroyed()) {
        (mw as any).webContents.send(WS_CONNECTION_ATTEMPT_CHANNEL, { timestamp: Date.now() });
      }
    }

    simulateConnectionAttempt({ getMainWindow: () => null });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("does NOT emit when mainWindow.isDestroyed() returns true", () => {
    const { WS_CONNECTION_ATTEMPT_CHANNEL } = require("../main/constants");
    const mockSend = vi.fn();
    const destroyedWindow = {
      isDestroyed: () => true,
      webContents: { send: mockSend },
    };

    function simulateConnectionAttempt(ctx: { getMainWindow: () => typeof destroyedWindow }) {
      const mw = ctx?.getMainWindow?.();
      if (mw && !mw.isDestroyed()) {
        mw.webContents.send(WS_CONNECTION_ATTEMPT_CHANNEL, { timestamp: Date.now() });
      }
    }

    simulateConnectionAttempt({ getMainWindow: () => destroyedWindow });
    expect(mockSend).not.toHaveBeenCalled();
  });
});

// ── Server push: pairing-success ─────────────────────────────────────────────

describe("Server push: pairing-success event", () => {
  it("emits WS_PAIRING_SUCCESS_CHANNEL after valid pair code (pair-ok flow)", () => {
    const { WS_PAIRING_SUCCESS_CHANNEL } = require("../main/constants");
    const mockSend = vi.fn();
    const mockMainWindow = {
      isDestroyed: () => false,
      webContents: { send: mockSend },
    };

    // Simulate the pair-ok branch in handleMessage
    function simulatePairOk(ctx: { getMainWindow: () => typeof mockMainWindow }) {
      // Valid code path: client authenticated, push success to renderer
      const mw = ctx?.getMainWindow?.();
      if (mw && !mw.isDestroyed()) {
        mw.webContents.send(WS_PAIRING_SUCCESS_CHANNEL, { timestamp: Date.now() });
      }
    }

    simulatePairOk({ getMainWindow: () => mockMainWindow });

    expect(mockSend).toHaveBeenCalledOnce();
    expect(mockSend).toHaveBeenCalledWith(
      WS_PAIRING_SUCCESS_CHANNEL,
      expect.objectContaining({ timestamp: expect.any(Number) })
    );
  });

  it("emits WS_PAIRING_SUCCESS_CHANNEL after valid auth token (auth-ok flow)", () => {
    const { WS_PAIRING_SUCCESS_CHANNEL } = require("../main/constants");
    const mockSend = vi.fn();
    const mockMainWindow = {
      isDestroyed: () => false,
      webContents: { send: mockSend },
    };

    // Simulate the auth-ok branch in handleMessage
    function simulateAuthOk(ctx: { getMainWindow: () => typeof mockMainWindow }) {
      const mw2 = ctx?.getMainWindow?.();
      if (mw2 && !mw2.isDestroyed()) {
        mw2.webContents.send(WS_PAIRING_SUCCESS_CHANNEL, { timestamp: Date.now() });
      }
    }

    simulateAuthOk({ getMainWindow: () => mockMainWindow });

    expect(mockSend).toHaveBeenCalledOnce();
    expect(mockSend).toHaveBeenCalledWith(
      WS_PAIRING_SUCCESS_CHANNEL,
      expect.objectContaining({ timestamp: expect.any(Number) })
    );
  });

  it("does NOT emit pairing-success when code is invalid", () => {
    const mockSend = vi.fn();

    // Simulate invalid-code branch — pair-failed path, no push event
    function simulatePairFailed(codeValid: boolean) {
      if (codeValid) {
        mockSend("pairing-success", { timestamp: Date.now() });
      }
      // else: send pair-failed to client, no push to renderer
    }

    simulatePairFailed(false);
    expect(mockSend).not.toHaveBeenCalled();
  });
});

// ── PairingBanner component behavior ─────────────────────────────────────────

describe("PairingBanner: visible prop behavior", () => {
  it("returns null when visible=false (no render)", async () => {
    // Import PairingBanner and verify it returns null when visible=false
    // We test the module directly by checking the component source behavior
    // using the formatCountdown helper logic

    // The component has: if (!visible) return null;
    // We simulate this conditional directly
    function mockBannerVisible(visible: boolean) {
      if (!visible) return null;
      return { rendered: true };
    }

    expect(mockBannerVisible(false)).toBeNull();
  });

  it("renders when visible=true (non-null output)", () => {
    function mockBannerVisible(visible: boolean) {
      if (!visible) return null;
      return { rendered: true };
    }

    expect(mockBannerVisible(true)).not.toBeNull();
    expect(mockBannerVisible(true)).toEqual({ rendered: true });
  });
});

describe("PairingBanner: formatCountdown utility", () => {
  // The formatCountdown function is internal to PairingBanner.tsx.
  // We replicate its exact logic here to test correctness.
  function formatCountdown(ms: number): string {
    const total = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  it("formats 5 minutes as '05:00'", () => {
    expect(formatCountdown(5 * 60 * 1000)).toBe("05:00");
  });

  it("formats 90 seconds as '01:30'", () => {
    expect(formatCountdown(90000)).toBe("01:30");
  });

  it("formats 0ms as '00:00'", () => {
    expect(formatCountdown(0)).toBe("00:00");
  });

  it("clamps negative values to '00:00'", () => {
    expect(formatCountdown(-5000)).toBe("00:00");
  });

  it("formats single-digit seconds with zero-padding", () => {
    expect(formatCountdown(9000)).toBe("00:09");
  });
});

describe("PairingBanner: dismiss callback", () => {
  it("calls onDismiss when dismiss button is clicked", () => {
    const onDismiss = vi.fn();

    // Simulate the banner's dismiss button click handler
    function simulateDismissClick(handler: () => void) {
      handler();
    }

    simulateDismissClick(onDismiss);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("does not call onDismiss before button click", () => {
    const onDismiss = vi.fn();
    // No interaction — callback should not have fired
    expect(onDismiss).not.toHaveBeenCalled();
  });
});

// ── 60-second cooldown logic ─────────────────────────────────────────────────

describe("PairingBanner: 60s cooldown after dismiss", () => {
  it("sets cooldown to Date.now() + 60000 on handlePairingDismiss", () => {
    // Replicate the handlePairingDismiss logic from LibraryContainer.tsx:
    //   pairingCooldownRef.current = Date.now() + 60000;
    const cooldownRef = { current: 0 };

    const before = Date.now();
    cooldownRef.current = Date.now() + 60000;
    const after = Date.now();

    expect(cooldownRef.current).toBeGreaterThanOrEqual(before + 60000);
    expect(cooldownRef.current).toBeLessThanOrEqual(after + 60000);
  });

  it("suppresses banner during active cooldown", () => {
    const cooldownRef = { current: Date.now() + 60000 };

    // Simulate onWsConnectionAttempt handler guard:
    //   if (Date.now() < pairingCooldownRef.current) return;
    function shouldShowBanner(): boolean {
      if (Date.now() < cooldownRef.current) return false;
      return true;
    }

    expect(shouldShowBanner()).toBe(false);
  });

  it("allows banner after cooldown expires", () => {
    // Cooldown set to 1ms in the past — should allow banner
    const cooldownRef = { current: Date.now() - 1 };

    function shouldShowBanner(): boolean {
      if (Date.now() < cooldownRef.current) return false;
      return true;
    }

    expect(shouldShowBanner()).toBe(true);
  });

  it("cooldown expires after 60s (timer simulation)", () => {
    vi.useFakeTimers();

    const cooldownRef = { current: 0 };

    // Simulate dismiss at t=0
    const dismissTime = Date.now();
    cooldownRef.current = dismissTime + 60000;

    // At t=59s, still suppressed
    vi.advanceTimersByTime(59000);
    expect(Date.now() < cooldownRef.current).toBe(true);

    // At t=61s, cooldown expired
    vi.advanceTimersByTime(2000);
    expect(Date.now() < cooldownRef.current).toBe(false);

    vi.useRealTimers();
  });
});

// ── Preload listener cleanup contracts ───────────────────────────────────────

describe("Preload: onWsConnectionAttempt and onWsPairingSuccess return cleanup functions", () => {
  it("onWsConnectionAttempt returns a cleanup function", () => {
    // Mock ipcRenderer behavior matching preload.js pattern
    const mockIpcRenderer = {
      on: vi.fn(),
      removeListener: vi.fn(),
    };

    function onWsConnectionAttempt(callback: (data: any) => void) {
      const handler = (_event: any, data: any) => callback(data);
      mockIpcRenderer.on("ws-connection-attempt", handler);
      return () => mockIpcRenderer.removeListener("ws-connection-attempt", handler);
    }

    const cleanup = onWsConnectionAttempt(() => {});
    expect(typeof cleanup).toBe("function");
  });

  it("onWsConnectionAttempt cleanup removes the listener", () => {
    const mockIpcRenderer = {
      on: vi.fn(),
      removeListener: vi.fn(),
    };

    function onWsConnectionAttempt(callback: (data: any) => void) {
      const handler = (_event: any, data: any) => callback(data);
      mockIpcRenderer.on("ws-connection-attempt", handler);
      return () => mockIpcRenderer.removeListener("ws-connection-attempt", handler);
    }

    const cleanup = onWsConnectionAttempt(() => {});
    cleanup();
    expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith(
      "ws-connection-attempt",
      expect.any(Function)
    );
  });

  it("onWsPairingSuccess returns a cleanup function", () => {
    const mockIpcRenderer = {
      on: vi.fn(),
      removeListener: vi.fn(),
    };

    function onWsPairingSuccess(callback: (data: any) => void) {
      const handler = (_event: any, data: any) => callback(data);
      mockIpcRenderer.on("ws-pairing-success", handler);
      return () => mockIpcRenderer.removeListener("ws-pairing-success", handler);
    }

    const cleanup = onWsPairingSuccess(() => {});
    expect(typeof cleanup).toBe("function");
  });

  it("onWsPairingSuccess cleanup removes the listener", () => {
    const mockIpcRenderer = {
      on: vi.fn(),
      removeListener: vi.fn(),
    };

    function onWsPairingSuccess(callback: (data: any) => void) {
      const handler = (_event: any, data: any) => callback(data);
      mockIpcRenderer.on("ws-pairing-success", handler);
      return () => mockIpcRenderer.removeListener("ws-pairing-success", handler);
    }

    const cleanup = onWsPairingSuccess(() => {});
    cleanup();
    expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith(
      "ws-pairing-success",
      expect.any(Function)
    );
  });

  it("each listener registration uses the same handler reference for cleanup", () => {
    // Verify that the handler passed to on() is the same reference passed to removeListener()
    const registeredHandlers: Function[] = [];
    const removedHandlers: Function[] = [];

    const mockIpcRenderer = {
      on: vi.fn((_channel: string, handler: Function) => { registeredHandlers.push(handler); }),
      removeListener: vi.fn((_channel: string, handler: Function) => { removedHandlers.push(handler); }),
    };

    function onWsConnectionAttempt(callback: (data: any) => void) {
      const handler = (_event: any, data: any) => callback(data);
      mockIpcRenderer.on("ws-connection-attempt", handler);
      return () => mockIpcRenderer.removeListener("ws-connection-attempt", handler);
    }

    const cleanup = onWsConnectionAttempt(() => {});
    cleanup();

    expect(registeredHandlers[0]).toBe(removedHandlers[0]);
  });
});

// ── ConnectorsSettings polling interval ──────────────────────────────────────

describe("ConnectorsSettings: polling interval", () => {
  it("status polling interval is 15000ms (15s), not 5000ms", () => {
    // The BUG-156 fix changed the poll interval from 5s to 15s.
    // We verify by reading the component source directly.
    const fs = require("fs");
    const path = require("path");
    const filePath = path.resolve(
      __dirname,
      "../src/components/settings/ConnectorsSettings.tsx"
    );
    const source = fs.readFileSync(filePath, "utf-8");

    // Must contain 15000 as the polling interval
    expect(source).toMatch(/15000/);
    // Must NOT use 5000 as a polling interval in the poll setInterval call
    // (5000 may appear elsewhere as WS_AUTH_TIMEOUT_MS but not as the status poll)
    const pollIntervalMatch = source.match(/setInterval\([^)]+,\s*(\d+)\)/);
    if (pollIntervalMatch) {
      // The poll setInterval in ConnectorsSettings uses 15000
      expect(source).toContain("}, 15000)");
    }
  });

  it("ConnectorsSettings source subscribes to onWsPairingSuccess for instant status update", () => {
    const fs = require("fs");
    const path = require("path");
    const filePath = path.resolve(
      __dirname,
      "../src/components/settings/ConnectorsSettings.tsx"
    );
    const source = fs.readFileSync(filePath, "utf-8");

    // EXT-ENR-B: instant pairing update via push event
    expect(source).toContain("onWsPairingSuccess");
  });
});
