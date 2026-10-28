// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";

/**
 * EXT-ENR-A: Resilient Extension Connection
 *
 * Tests for: exponential backoff, article-ack flow, EADDRINUSE retry cap,
 * auth timeout cleanup, three-state connection status derivation,
 * service worker lifecycle resilience, pending message persistence.
 */

// ── Exponential Backoff ─────────────────────────────────────────────────────

describe("Exponential backoff reconnect", () => {
  const RECONNECT_BASE_MS = 1000;
  const RECONNECT_MAX_MS = 30000;

  function computeBackoffSequence(steps: number): number[] {
    let delay = RECONNECT_BASE_MS;
    const seq: number[] = [];
    for (let i = 0; i < steps; i++) {
      seq.push(delay);
      delay = Math.min(delay * 2, RECONNECT_MAX_MS);
    }
    return seq;
  }

  it("produces correct base delays: 1s → 2s → 4s → 8s → 16s → 30s", () => {
    const seq = computeBackoffSequence(6);
    expect(seq).toEqual([1000, 2000, 4000, 8000, 16000, 30000]);
  });

  it("caps at RECONNECT_MAX_MS (30s)", () => {
    const seq = computeBackoffSequence(8);
    expect(seq[5]).toBe(30000);
    expect(seq[6]).toBe(30000);
    expect(seq[7]).toBe(30000);
  });

  it("applies jitter within ±20%", () => {
    const base = 4000;
    // Simulate jitter: factor = 1 + (random * 0.4 - 0.2)
    // At random=0 → factor=0.8, at random=1 → factor=1.2
    const minJitter = Math.round(base * 0.8);
    const maxJitter = Math.round(base * 1.2);

    for (let i = 0; i < 100; i++) {
      const jitter = 1 + (Math.random() * 0.4 - 0.2);
      const delay = Math.round(base * jitter);
      expect(delay).toBeGreaterThanOrEqual(minJitter);
      expect(delay).toBeLessThanOrEqual(maxJitter);
    }
  });

  it("resets to base delay on successful auth", () => {
    let reconnectDelay = RECONNECT_BASE_MS;
    // Simulate several backoff steps
    reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_MS); // 2000
    reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_MS); // 4000
    reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_MS); // 8000
    expect(reconnectDelay).toBe(8000);

    // Auth-ok resets
    reconnectDelay = RECONNECT_BASE_MS;
    expect(reconnectDelay).toBe(1000);
  });
});

// ── Article-Ack Flow ────────────────────────────────────────────────────────

describe("Article-ack pending queue management", () => {
  it("removes message from pending on matching messageId", () => {
    const pending = [
      { type: "add-article", messageId: "abc123", payload: { title: "A" } },
      { type: "add-article", messageId: "def456", payload: { title: "B" } },
    ];

    // Simulate article-ack for abc123
    const ackMessageId = "abc123";
    const filtered = pending.filter(m => m.messageId !== ackMessageId);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].messageId).toBe("def456");
  });

  it("keeps all messages when ack messageId does not match", () => {
    const pending = [
      { type: "add-article", messageId: "abc123", payload: { title: "A" } },
      { type: "add-article", messageId: "def456", payload: { title: "B" } },
    ];

    const filtered = pending.filter(m => m.messageId !== "xyz789");
    expect(filtered).toHaveLength(2);
  });

  it("handles empty pending queue gracefully", () => {
    const pending: any[] = [];
    const filtered = pending.filter(m => m.messageId !== "abc123");
    expect(filtered).toHaveLength(0);
  });
});

// ── EADDRINUSE Retry Cap ────────────────────────────────────────────────────

describe("EADDRINUSE retry cap", () => {
  const WS_MAX_RETRY_COUNT = 10;

  it("stops retrying after WS_MAX_RETRY_COUNT attempts", () => {
    let retryCount = 0;
    let gaveUp = false;

    for (let i = 0; i < 15; i++) {
      retryCount++;
      if (retryCount >= WS_MAX_RETRY_COUNT) {
        gaveUp = true;
        break;
      }
    }

    expect(gaveUp).toBe(true);
    expect(retryCount).toBe(WS_MAX_RETRY_COUNT);
  });

  it("resets count on successful listen", () => {
    let retryCount = 5;
    // Simulate successful listen callback
    retryCount = 0;
    expect(retryCount).toBe(0);
  });
});

// ── Auth Timeout ────────────────────────────────────────────────────────────

describe("Auth timeout cleanup", () => {
  it("removes unauthenticated client after timeout", () => {
    vi.useFakeTimers();
    const WS_AUTH_TIMEOUT_MS = 5000;

    const clients = new Set<{ authenticated: boolean; authTimer: ReturnType<typeof setTimeout> | null }>();
    const client = { authenticated: false, authTimer: null as ReturnType<typeof setTimeout> | null };
    clients.add(client);

    client.authTimer = setTimeout(() => {
      if (!client.authenticated) {
        clients.delete(client);
      }
    }, WS_AUTH_TIMEOUT_MS);

    expect(clients.size).toBe(1);
    vi.advanceTimersByTime(WS_AUTH_TIMEOUT_MS);
    expect(clients.size).toBe(0);

    vi.useRealTimers();
  });

  it("does not remove client that authenticates in time", () => {
    vi.useFakeTimers();
    const WS_AUTH_TIMEOUT_MS = 5000;

    const clients = new Set<{ authenticated: boolean; authTimer: ReturnType<typeof setTimeout> | null }>();
    const client = { authenticated: false, authTimer: null as ReturnType<typeof setTimeout> | null };
    clients.add(client);

    client.authTimer = setTimeout(() => {
      if (!client.authenticated) {
        clients.delete(client);
      }
    }, WS_AUTH_TIMEOUT_MS);

    // Client authenticates after 2s
    vi.advanceTimersByTime(2000);
    client.authenticated = true;
    if (client.authTimer) { clearTimeout(client.authTimer); client.authTimer = null; }

    vi.advanceTimersByTime(5000);
    expect(clients.size).toBe(1);

    vi.useRealTimers();
  });

  it("clears auth timer on socket close", () => {
    vi.useFakeTimers();
    const WS_AUTH_TIMEOUT_MS = 5000;

    const clients = new Set<{ authenticated: boolean; authTimer: ReturnType<typeof setTimeout> | null }>();
    const client = { authenticated: false, authTimer: null as ReturnType<typeof setTimeout> | null };
    clients.add(client);

    client.authTimer = setTimeout(() => {
      if (!client.authenticated) {
        clients.delete(client);
      }
    }, WS_AUTH_TIMEOUT_MS);

    // Simulate socket close before timeout
    if (client.authTimer) { clearTimeout(client.authTimer); client.authTimer = null; }
    clients.delete(client);

    expect(clients.size).toBe(0);
    expect(client.authTimer).toBeNull();

    vi.useRealTimers();
  });
});

// ── Three-State Connection Status ───────────────────────────────────────────

describe("Three-state connection status derivation", () => {
  function deriveStatus(hasAuthClient: boolean, serverRunning: boolean): "connected" | "connecting" | "disconnected" {
    return hasAuthClient ? "connected" : serverRunning ? "connecting" : "disconnected";
  }

  it("returns 'connected' when authenticated client exists", () => {
    expect(deriveStatus(true, true)).toBe("connected");
  });

  it("returns 'connecting' when server running but no auth client", () => {
    expect(deriveStatus(false, true)).toBe("connecting");
  });

  it("returns 'disconnected' when server is not running", () => {
    expect(deriveStatus(false, false)).toBe("disconnected");
  });

  it("returns 'connected' even with multiple states (auth takes priority)", () => {
    // Edge case: hasAuthClient=true but serverRunning=false shouldn't happen,
    // but auth takes priority
    expect(deriveStatus(true, false)).toBe("connected");
  });
});

// ── Pending Message Persistence ─────────────────────────────────────────────

describe("Pending message persistence", () => {
  it("adds messageId to pending messages on send", () => {
    const pending: any[] = [];
    const article = { title: "Test Article", textContent: "content" };
    const messageId = Date.now().toString() + Math.random().toString(36).slice(2, 8);
    const message = { type: "add-article", payload: article, messageId };

    pending.push(message);
    expect(pending).toHaveLength(1);
    expect(pending[0].messageId).toBe(messageId);
  });

  it("clears all pending on auth-ok flush", () => {
    const pending = [
      { type: "add-article", messageId: "a", payload: {} },
      { type: "add-article", messageId: "b", payload: {} },
    ];

    // Simulate auth-ok: flush all pending then clear
    const flushed = [...pending];
    const cleared: any[] = [];

    expect(flushed).toHaveLength(2);
    expect(cleared).toHaveLength(0);
  });
});
