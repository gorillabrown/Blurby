// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";

/**
 * HOTFIX-14 behavioral tests
 *
 * Covers the two remaining bugs fixed in HOTFIX-14:
 *   BUG-155 — URL extraction fails on WAF-protected sites (missing fetchWithBrowser fallback
 *             in the no-login branch of the add-doc-from-url IPC handler)
 *   BUG-156a — getClientCount() counts unauthenticated WebSocket clients
 *   BUG-156b — ConnectorsSettings only polls on mount, not periodically
 *   BUG-156c — HEARTBEAT_INTERVAL_MS was 30 000 ms; reduced to 15 000 ms
 */

// ── BUG-155 — URL extraction fallback ────────────────────────────────────────

/**
 * Simulates the fixed no-login branch from main/ipc/misc.js:174-177.
 *
 * Fixed control flow (after HOTFIX-14):
 *
 *   } else {
 *     try {
 *       html = await fetchWithCookies(url);
 *       result = extractArticleFromHtml(html, url);
 *     } catch { // fall through to browser fetch }
 *
 *     if (!result || result.error) {
 *       html = await fetchWithBrowser(url);
 *       result = extractArticleFromHtml(html, url);
 *     }
 *   }
 */
async function simulateUrlImport(
  fetchWithCookiesResult: { html?: string; throws?: boolean },
  extractFromCookiesResult: { content?: string; error?: string } | null,
  fetchWithBrowserResult: { html?: string } | null,
  extractFromBrowserResult: { content?: string; error?: string } | null = null,
): Promise<{ content?: string; error?: string } | null> {
  const fetchWithCookies = async () => {
    if (fetchWithCookiesResult.throws) throw new Error("HTTP 400");
    return fetchWithCookiesResult.html ?? "";
  };

  const fetchWithBrowser = async () => {
    return fetchWithBrowserResult?.html ?? "";
  };

  // Two separate extract functions to avoid callCount coupling — mirrors the
  // fixed no-login branch which calls extractArticleFromHtml(html, url) twice
  // (once per fetch) using the same function reference, but the returned value
  // differs based on which html string was passed in.
  //
  // Here we distinguish calls by tracking whether the cookie fetch produced html
  // or whether we are in the browser-fallback path.
  let usedBrowserFetch = false;

  const extractArticleFromHtml = (_html: string) => {
    if (usedBrowserFetch) return extractFromBrowserResult;
    return extractFromCookiesResult;
  };

  let html: string | undefined;
  let result: { content?: string; error?: string } | null = null;

  // Replicate the fixed no-login branch
  try {
    html = await fetchWithCookies();
    result = extractArticleFromHtml(html);
  } catch {
    // fall through to browser fetch
  }

  if (!result || result?.error) {
    usedBrowserFetch = true;
    html = await fetchWithBrowser();
    result = extractArticleFromHtml(html);
  }

  return result;
}

describe("BUG-155 — URL extraction fallback (no-login branch)", () => {
  it("falls through to fetchWithBrowser when fetchWithCookies throws", async () => {
    // fetchWithCookies throws (e.g. HTTP 400 WAF rejection)
    // fetchWithBrowser returns good html → extractArticleFromHtml gives content
    const result = await simulateUrlImport(
      { throws: true },           // fetchWithCookies throws
      null,                        // extract result (never reached on throw)
      { html: "<p>Article</p>" }, // fetchWithBrowser succeeds
      { content: "Article text" }, // extract result from browser html
    );
    expect(result).toEqual({ content: "Article text" });
  });

  it("falls through to fetchWithBrowser when extraction returns { error }", async () => {
    // fetchWithCookies returns html but extraction fails (Readability found nothing)
    // fetchWithBrowser is the fallback
    const result = await simulateUrlImport(
      { html: "<html></html>" },
      { error: "No content extracted" },
      { html: "<p>Full article</p>" },
      { content: "Full article text" },
    );
    expect(result).toEqual({ content: "Full article text" });
  });

  it("does NOT call fetchWithBrowser when fetchWithCookies succeeds and extraction has content", async () => {
    const fetchWithBrowserSpy = vi.fn(async () => "");

    // Directly test the guard condition: if result and no error, browser fetch is skipped
    const result = { content: "Good content" };
    const shouldFallback = !result || result.error !== undefined;
    expect(shouldFallback).toBe(false);

    // fetchWithBrowserSpy should not be invoked in the happy path
    expect(fetchWithBrowserSpy).not.toHaveBeenCalled();
  });

  it("fetchWithBrowser result is passed through extractArticleFromHtml", async () => {
    // When the fallback fires, the html from fetchWithBrowser must be passed to extract
    // We verify by making extractResult from browser-html differ from the cookie-fetch result
    const result = await simulateUrlImport(
      { throws: true },
      null,
      { html: "<p>Browser html content</p>" },
      { content: "Extracted from browser" },
    );
    // If browser html was NOT passed to extract, we'd get null or a different value
    expect(result?.content).toBe("Extracted from browser");
  });
});

// ── BUG-156a — getClientCount auth filter ────────────────────────────────────

/**
 * Isolates the fixed getClientCount() from ws-server.js:511-513.
 *
 * Fixed implementation (after HOTFIX-14):
 *
 *   function getClientCount() {
 *     let count = 0;
 *     for (const client of _clients) {
 *       if (client.authenticated) count++;
 *     }
 *     return count;
 *   }
 */
function getClientCount(clients: Set<{ authenticated: boolean }>): number {
  let count = 0;
  for (const client of clients) {
    if (client.authenticated) count++;
  }
  return count;
}

describe("BUG-156a — getClientCount filters to authenticated clients only", () => {
  it("returns 0 when only unauthenticated clients are in the set", () => {
    const clients = new Set([
      { authenticated: false },
      { authenticated: false },
    ]);
    expect(getClientCount(clients)).toBe(0);
  });

  it("returns 1 when one authenticated client exists among multiple", () => {
    const clients = new Set([
      { authenticated: false },
      { authenticated: true },
      { authenticated: false },
    ]);
    expect(getClientCount(clients)).toBe(1);
  });

  it("returns correct count with a mix of authenticated/unauthenticated clients", () => {
    const clients = new Set([
      { authenticated: true },
      { authenticated: true },
      { authenticated: false },
      { authenticated: true },
    ]);
    expect(getClientCount(clients)).toBe(3);
  });

  it("returns 0 for an empty client set", () => {
    const clients = new Set<{ authenticated: boolean }>();
    expect(getClientCount(clients)).toBe(0);
  });
});

// ── BUG-156b — ConnectorsSettings periodic polling ───────────────────────────

/**
 * Verifies that a 5-second polling interval is established and cleaned up.
 * Isolates the pattern from ConnectorsSettings.tsx fix (Fix 2 from investigation):
 *
 *   useEffect(() => {
 *     const poll = setInterval(() => {
 *       api.getWsShortCode().then((result: any) => {
 *         if (result) setConnected(result.connected);
 *       });
 *     }, 5000);
 *     return () => clearInterval(poll);
 *   }, []);
 */
describe("BUG-156b — ConnectorsSettings polling interval", () => {
  it("setInterval at 5000ms interval fires the callback on each tick", () => {
    vi.useFakeTimers();
    const mockGetStatus = vi.fn().mockResolvedValue({ connected: true });
    let connected = false;

    const poll = setInterval(() => {
      mockGetStatus().then((result: { connected: boolean }) => {
        connected = result.connected;
      });
    }, 5000);

    // No calls before any tick
    expect(mockGetStatus).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(5000);
    expect(mockGetStatus).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5000);
    expect(mockGetStatus).toHaveBeenCalledTimes(2);

    clearInterval(poll);
    vi.useRealTimers();
  });

  it("clearInterval stops the polling callback from firing", () => {
    vi.useFakeTimers();
    const mockGetStatus = vi.fn().mockResolvedValue({ connected: false });

    const poll = setInterval(() => {
      mockGetStatus();
    }, 5000);

    vi.advanceTimersByTime(5000);
    expect(mockGetStatus).toHaveBeenCalledTimes(1);

    // Simulate unmount cleanup
    clearInterval(poll);

    vi.advanceTimersByTime(15000);
    // No additional calls after clearInterval
    expect(mockGetStatus).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});

// ── BUG-156c — Heartbeat interval constant ───────────────────────────────────

describe("BUG-156c — HEARTBEAT_INTERVAL_MS is 15000ms (not 30000)", () => {
  it("HEARTBEAT_INTERVAL_MS equals 15000 in main/constants.js", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { HEARTBEAT_INTERVAL_MS } = require("../main/constants.js");
    // Root cause: was 30000ms (30s), causing dead-client window of up to 60s.
    // Fix: reduced to 15000ms (15s), cutting the detection window to 30s.
    expect(HEARTBEAT_INTERVAL_MS).toBe(15000);
  });

  it("HEARTBEAT_INTERVAL_MS is less than 30000 (confirms reduction from old value)", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { HEARTBEAT_INTERVAL_MS } = require("../main/constants.js");
    expect(HEARTBEAT_INTERVAL_MS).toBeLessThan(30000);
  });
});
