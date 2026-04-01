import { describe, it, expect, vi } from "vitest";

// Extended timeout: this test does real jsdom + @mozilla/readability parsing
vi.setConfig({ testTimeout: 30000 });

// provenance.test.js — Sprint 19I-K
//
// Tests provenance extraction from HTML (extractArticleFromHtml) and APA
// formatting helpers (formatAuthorAPA, formatDateAPA) in url-extractor.js.
//
// url-extractor.js depends on Electron APIs and lazy-loaded @mozilla/readability
// + jsdom. We mock Electron, but let jsdom and readability run for real (they
// are available as regular npm packages in the test environment).

vi.mock("electron", () => ({
  BrowserWindow: class {
    constructor() {}
    loadURL() {}
    on() {}
    webContents = { setWindowOpenHandler() {}, setUserAgent() {}, on() {}, executeJavaScript: vi.fn() };
    isDestroyed() { return false; }
    destroy() {}
    setMenuBarVisibility() {}
  },
  session: {
    fromPartition: vi.fn(() => ({
      cookies: { get: vi.fn().mockResolvedValue([]) },
    })),
  },
}));

vi.mock("fs/promises", () => ({
  default: {
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

const {
  extractArticleFromHtml,
  formatAuthorAPA,
  formatSingleAuthorAPA,
  formatDateAPA,
} = await import("../main/url-extractor.js");

// ── HTML builder helpers ───────────────────────────────────────────────────

function buildHtml({ title = "Test Article", body = "", head = "" } = {}) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  ${head}
</head>
<body>
  <article>
    <h1>${title}</h1>
    <div class="article-body">${body}</div>
  </article>
</body>
</html>`;
}

// Body long enough to pass Readability's extraction threshold
const LONG_BODY = "<p>" + "This is article content. ".repeat(30) + "</p>";

// ── extractArticleFromHtml — general shape ─────────────────────────────────

describe("extractArticleFromHtml — return shape", () => {
  it("returns author, sourceDomain, publishedDate fields", () => {
    const html = buildHtml({
      body: LONG_BODY,
      head: `
        <meta name="author" content="Jane Smith" />
        <meta property="og:site_name" content="Example News" />
        <meta property="article:published_time" content="2025-06-15T12:00:00Z" />
      `,
    });
    const result = extractArticleFromHtml(html, "https://example.com/article");
    expect(result).not.toHaveProperty("error");
    expect(result).toHaveProperty("author");
    expect(result).toHaveProperty("sourceDomain");
    expect(result).toHaveProperty("publishedDate");
  });
});

// ── Author extraction ──────────────────────────────────────────────────────

describe("extractArticleFromHtml — author from JSON-LD single author object", () => {
  it("extracts author.name from JSON-LD", () => {
    const html = buildHtml({
      body: LONG_BODY,
      head: `
        <script type="application/ld+json">
        {
          "@type": "Article",
          "headline": "Test Article",
          "author": { "@type": "Person", "name": "Alice Walker" },
          "datePublished": "2025-01-01T00:00:00Z"
        }
        </script>
      `,
    });
    const result = extractArticleFromHtml(html, "https://example.com/article");
    expect(result.author).toBe("Alice Walker");
  });

  it("extracts multiple authors joined with &", () => {
    const html = buildHtml({
      body: LONG_BODY,
      head: `
        <script type="application/ld+json">
        {
          "@type": "Article",
          "headline": "Two Authors",
          "author": [
            { "@type": "Person", "name": "Alice Walker" },
            { "@type": "Person", "name": "Bob Smith" }
          ]
        }
        </script>
      `,
    });
    const result = extractArticleFromHtml(html, "https://example.com/article");
    expect(result.author).toContain("Alice Walker");
    expect(result.author).toContain("Bob Smith");
  });
});

describe("extractArticleFromHtml — author from meta tags", () => {
  it("extracts author from meta[name='author']", () => {
    const html = buildHtml({
      body: LONG_BODY,
      head: `<meta name="author" content="John Doe" />`,
    });
    const result = extractArticleFromHtml(html, "https://example.com/article");
    expect(result.author).toBe("John Doe");
  });

  it("strips 'By ' prefix from meta author", () => {
    const html = buildHtml({
      body: LONG_BODY,
      head: `<meta name="author" content="By Jane Doe" />`,
    });
    const result = extractArticleFromHtml(html, "https://example.com/article");
    expect(result.author).toBe("Jane Doe");
  });
});

describe("extractArticleFromHtml — no author returns null", () => {
  it("returns null (not 'Unknown') when no author signal present", () => {
    const html = buildHtml({ body: LONG_BODY });
    const result = extractArticleFromHtml(html, "https://example.com/article");
    // author should be null, never the string "Unknown"
    expect(result.author).toBeNull();
  });
});

// ── Source domain extraction ───────────────────────────────────────────────

describe("extractArticleFromHtml — sourceDomain from og:site_name", () => {
  it("uses og:site_name when present", () => {
    const html = buildHtml({
      body: LONG_BODY,
      head: `<meta property="og:site_name" content="The Daily Example" />`,
    });
    const result = extractArticleFromHtml(html, "https://example.com/article");
    expect(result.sourceDomain).toBe("The Daily Example");
  });
});

describe("extractArticleFromHtml — sourceDomain fallback to hostname", () => {
  it("falls back to hostname when og:site_name is absent", () => {
    const html = buildHtml({ body: LONG_BODY });
    const result = extractArticleFromHtml(html, "https://example.com/article");
    // www. is stripped; hostname title-cased
    expect(result.sourceDomain).toMatch(/example/i);
    expect(result.sourceDomain).not.toMatch(/^www\./);
  });
});

// ── Publication date extraction ────────────────────────────────────────────

describe("extractArticleFromHtml — publishedDate from article:published_time", () => {
  it("parses article:published_time meta to ISO string", () => {
    const html = buildHtml({
      body: LONG_BODY,
      head: `<meta property="article:published_time" content="2025-06-15T12:00:00Z" />`,
    });
    const result = extractArticleFromHtml(html, "https://example.com/article");
    expect(result.publishedDate).toBe("2025-06-15T12:00:00.000Z");
  });
});

describe("extractArticleFromHtml — no publish date returns null", () => {
  it("returns null when no date signal present", () => {
    const html = buildHtml({ body: LONG_BODY });
    const result = extractArticleFromHtml(html, "https://example.com/article");
    expect(result.publishedDate).toBeNull();
  });
});

// ── Lead image extraction ──────────────────────────────────────────────────

describe("extractArticleFromHtml — lead image from og:image", () => {
  it("extracts og:image URL", () => {
    const html = buildHtml({
      body: LONG_BODY,
      head: `<meta property="og:image" content="https://example.com/hero.jpg" />`,
    });
    const result = extractArticleFromHtml(html, "https://example.com/article");
    expect(result.imageUrl).toBe("https://example.com/hero.jpg");
  });
});

describe("extractArticleFromHtml — lead image fallback to article body image", () => {
  it("falls back to a wide <img> inside the article when no og:image", () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Article</title></head>
<body>
<article>
  <h1>Article Title</h1>
  <img src="https://example.com/wide.jpg" width="800" />
  <p>${"Content paragraph. ".repeat(30)}</p>
</article>
</body>
</html>`;
    const result = extractArticleFromHtml(html, "https://example.com/article");
    expect(result.imageUrl).toBe("https://example.com/wide.jpg");
  });

  it("does not pick up narrow images (< 400px)", () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Article</title></head>
<body>
<article>
  <h1>Article Title</h1>
  <img src="https://example.com/icon.jpg" width="32" />
  <p>${"Content paragraph. ".repeat(30)}</p>
</article>
</body>
</html>`;
    const result = extractArticleFromHtml(html, "https://example.com/article");
    // Narrow image should not be selected — only a 100px icon exists, so imageUrl must be null
    expect(result.imageUrl).toBeNull();
  });
});

// ── formatAuthorAPA ────────────────────────────────────────────────────────

describe("formatAuthorAPA", () => {
  it('"Jane Smith" → "Smith, J."', () => {
    expect(formatAuthorAPA("Jane Smith")).toBe("Smith, J.");
  });

  it('"Jane M. Smith" — last name last, initials from first + middle', () => {
    // "Jane M. Smith" → parts: ["Jane", "M.", "Smith"] → last="Smith", initials="J. M."
    expect(formatAuthorAPA("Jane M. Smith")).toBe("Smith, J. M.");
  });

  it("multi-author APA format with &", () => {
    const result = formatAuthorAPA("Jane Smith & Bob Jones");
    // Should contain both last names with initials
    expect(result).toContain("Smith, J.");
    expect(result).toContain("Jones, B.");
    expect(result).toContain("& ");
  });

  it("multi-author separated by 'and'", () => {
    const result = formatAuthorAPA("Alice Brown and Carol Davis");
    expect(result).toContain("Brown, A.");
    expect(result).toContain("Davis, C.");
  });

  it("returns empty string for empty input", () => {
    expect(formatAuthorAPA("")).toBe("");
    expect(formatAuthorAPA(null)).toBe("");
    expect(formatAuthorAPA(undefined)).toBe("");
  });

  it("single-token name returned as-is", () => {
    expect(formatAuthorAPA("Reuters")).toBe("Reuters");
  });

  it("already-formatted APA name is not double-formatted", () => {
    // If name is already "Smith, J." it should pass through
    expect(formatAuthorAPA("Smith, J.")).toBe("Smith, J.");
  });
});

// ── formatDateAPA ──────────────────────────────────────────────────────────

describe("formatDateAPA", { timeout: 15000 }, () => {
  it("formats a valid ISO date correctly", () => {
    // Use a noon timestamp to avoid timezone boundary issues
    const result = formatDateAPA("2025-06-15T12:00:00.000Z");
    expect(result).toMatch(/2025/);
    expect(result).toMatch(/June/);
    expect(result).toMatch(/\)/);
    expect(result.endsWith(".")).toBe(true);
  });

  it("null publishedDate → '(n.d.).'", () => {
    expect(formatDateAPA(null)).toBe("(n.d.).");
  });

  it("undefined publishedDate → '(n.d.).'", () => {
    expect(formatDateAPA(undefined)).toBe("(n.d.).");
  });

  it("empty string → '(n.d.).'", () => {
    expect(formatDateAPA("")).toBe("(n.d.).");
  });

  it("invalid date string → '(n.d.).'", () => {
    expect(formatDateAPA("not-a-date")).toBe("(n.d.).");
  });

  it("result starts with '('", () => {
    const result = formatDateAPA("2024-01-01T00:00:00Z");
    expect(result.startsWith("(")).toBe(true);
  });
});
