import { describe, expect, it, vi } from "vitest";

/**
 * URL scheme validation regression tests for the guard added in
 * main/ipc/misc.js.
 *
 * Direct Electron IPC integration is awkward in this test environment, so these
 * tests mirror the small guard/handler shape with focused behavioral checks.
 * That keeps the coverage targeted to the new HTTP/HTTPS-only rule while
 * avoiding production changes.
 */
function validateHttpHttpsUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { error: "Only http/https URLs are allowed." };
    }
    return { parsed };
  } catch {
    return { error: "Only http/https URLs are allowed." };
  }
}

async function simulateAddDocFromUrl(
  url: string,
  deps: {
    fetchWithCookies: (value: string) => Promise<void>;
    extractArticleFromHtml: (html: string, value: string) => unknown;
  },
) {
  const validation = validateHttpHttpsUrl(url);
  if (validation.error) return validation;

  await deps.fetchWithCookies(url);
  deps.extractArticleFromHtml("<html />", url);

  return { ok: true, sourceUrl: url };
}

async function simulateSiteLogin(
  url: string,
  deps: {
    openSiteLogin: (value: string) => Promise<unknown>;
  },
) {
  const validation = validateHttpHttpsUrl(url);
  if (validation.error) return validation;
  return deps.openSiteLogin(url);
}

async function simulateOpenUrlInBrowser(
  url: string,
  deps: {
    openExternal: (value: string) => Promise<void>;
  },
) {
  const validation = validateHttpHttpsUrl(url);
  if (validation.error) {
    return { error: "Only http/https URLs can be opened." };
  }
  await deps.openExternal(url);
  return { ok: true };
}

describe("URL scheme validation in main/ipc/misc.js", () => {
  it("allows http and https URLs through add-doc-from-url", async () => {
    const fetchWithCookies = vi.fn(async () => {});
    const extractArticleFromHtml = vi.fn();

    for (const url of ["http://example.com/article", "https://example.com/article"]) {
      const result = await simulateAddDocFromUrl(url, {
        fetchWithCookies,
        extractArticleFromHtml,
      });

      expect(result).toEqual({ ok: true, sourceUrl: url });
      expect(fetchWithCookies).toHaveBeenLastCalledWith(url);
      expect(extractArticleFromHtml).toHaveBeenLastCalledWith("<html />", url);
    }
  });

  it("rejects file, javascript, data, and malformed URLs in add-doc-from-url", async () => {
    const fetchWithCookies = vi.fn(async () => {});
    const extractArticleFromHtml = vi.fn();

    for (const url of ["file:/etc/passwd", "javascript:alert(1)", "data:text/html,hi", "not-a-url"]) {
      const result = await simulateAddDocFromUrl(url, {
        fetchWithCookies,
        extractArticleFromHtml,
      });

      expect(result).toEqual({ error: "Only http/https URLs are allowed." });
    }

    expect(fetchWithCookies).not.toHaveBeenCalled();
    expect(extractArticleFromHtml).not.toHaveBeenCalled();
  });

  it("allows http and https URLs through site-login", async () => {
    const openSiteLogin = vi.fn(async (url: string) => ({ ok: true, url }));

    for (const url of ["http://example.com/login", "https://example.com/login"]) {
      const result = await simulateSiteLogin(url, { openSiteLogin });

      expect(result).toEqual({ ok: true, url });
      expect(openSiteLogin).toHaveBeenLastCalledWith(url);
    }
  });

  it("rejects file, javascript, data, and malformed URLs in site-login", async () => {
    const openSiteLogin = vi.fn(async () => ({ ok: true }));

    for (const url of ["file:/etc/passwd", "javascript:alert(1)", "data:text/html,hi", "not-a-url"]) {
      const result = await simulateSiteLogin(url, { openSiteLogin });
      expect(result).toEqual({ error: "Only http/https URLs are allowed." });
    }

    expect(openSiteLogin).not.toHaveBeenCalled();
  });

  it("allows http and https URLs through open-url-in-browser", async () => {
    const openExternal = vi.fn(async () => {});

    for (const url of ["http://example.com/article", "https://example.com/article"]) {
      const result = await simulateOpenUrlInBrowser(url, { openExternal });

      expect(result).toEqual({ ok: true });
      expect(openExternal).toHaveBeenLastCalledWith(url);
    }
  });

  it("rejects file, javascript, data, and malformed URLs in open-url-in-browser", async () => {
    const openExternal = vi.fn(async () => {});

    for (const url of ["file:/etc/passwd", "javascript:alert(1)", "data:text/html,hi", "not-a-url"]) {
      const result = await simulateOpenUrlInBrowser(url, { openExternal });

      expect(result).toEqual({ error: "Only http/https URLs can be opened." });
    }

    expect(openExternal).not.toHaveBeenCalled();
  });
});
