import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import os from "os";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

// Extended timeout: these tests do real EPUB generation + parsing
vi.setConfig({ testTimeout: 30000 });

// Mock Electron for url-extractor (hoisted to module level)
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

let tmpDir;

beforeEach(async () => {
  tmpDir = path.join(os.tmpdir(), `blurby-2b-test-${crypto.randomUUID()}`);
  await fs.mkdir(tmpDir, { recursive: true });
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// 1. URL article → EPUB conversion (htmlToEpub with article content)
// ---------------------------------------------------------------------------

describe("URL article → EPUB conversion", () => {
  it("converts article HTML to a valid EPUB with metadata", async () => {
    const { htmlToEpub } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    const htmlContent = `<html><head><title>Test Article</title></head>
    <body>
      <h1>Test Article</h1>
      <p>This is a <strong>test</strong> article with <em>formatting</em>.</p>
      <p>Second paragraph with more content for word count.</p>
    </body></html>`;

    const htmlPath = path.join(tmpDir, "article.html");
    await fs.writeFile(htmlPath, htmlContent, "utf-8");

    const epubPath = path.join(tmpDir, "article.epub");
    const result = await htmlToEpub(htmlPath, epubPath, {
      title: "Test Article",
      author: "John Doe",
      date: "2024-06-15",
      source: "https://example.com/article",
    });

    expect(result.epubPath).toBe(epubPath);
    expect(result.title).toBe("Test Article");
    expect(result.valid).toBe(true);

    // Verify EPUB contains metadata
    const zip = new AdmZip(epubPath);
    const opfEntry = zip.getEntry("OEBPS/content.opf");
    expect(opfEntry).not.toBeNull();
    const opfContent = opfEntry.getData().toString("utf-8");
    expect(opfContent).toContain("<dc:title>Test Article</dc:title>");
    expect(opfContent).toContain("<dc:creator>John Doe</dc:creator>");
    expect(opfContent).toContain("<dc:date>2024-06-15</dc:date>");
    expect(opfContent).toContain("<dc:source>https://example.com/article</dc:source>");
  });

  it("preserves bold and italic formatting in EPUB", async () => {
    const { htmlToEpub } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    const htmlContent = `<html><head><title>Formatted</title></head>
    <body><p>This has <strong>bold</strong> and <em>italic</em> text.</p></body></html>`;

    const htmlPath = path.join(tmpDir, "fmt.html");
    await fs.writeFile(htmlPath, htmlContent, "utf-8");

    const epubPath = path.join(tmpDir, "fmt.epub");
    await htmlToEpub(htmlPath, epubPath, { title: "Formatted", author: "Test" });

    const zip = new AdmZip(epubPath);
    const chapters = zip.getEntries().filter(e => e.entryName.includes("Text/chapter_"));
    expect(chapters.length).toBeGreaterThan(0);
    const chapterContent = chapters[0].getData().toString("utf-8");
    expect(chapterContent).toContain("<strong>bold</strong>");
    expect(chapterContent).toContain("<em>italic</em>");
  });

  it("embeds cover image in EPUB when provided", async () => {
    const { htmlToEpub } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    const htmlContent = `<html><head><title>Cover Test</title></head>
    <body><p>Article with a cover image.</p></body></html>`;

    const htmlPath = path.join(tmpDir, "cover.html");
    await fs.writeFile(htmlPath, htmlContent, "utf-8");

    // Create a small fake JPEG cover (just the header bytes — enough for EPUB embedding)
    const fakeCover = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);

    const epubPath = path.join(tmpDir, "cover.epub");
    await htmlToEpub(htmlPath, epubPath, {
      title: "Cover Test",
      author: "Test",
      coverImage: fakeCover,
    });

    const zip = new AdmZip(epubPath);
    const coverEntry = zip.getEntry("OEBPS/Images/cover.jpg");
    expect(coverEntry).not.toBeNull();
    expect(coverEntry.getData().length).toBe(fakeCover.length);
  });
});

// ---------------------------------------------------------------------------
// 2. extractArticleFromHtml returns contentHtml
// ---------------------------------------------------------------------------

describe("extractArticleFromHtml returns contentHtml", () => {
  it("returns contentHtml field alongside content", async () => {
    const { extractArticleFromHtml } = await import("../main/url-extractor.js");

    const html = `<html><head><title>Article Title</title></head>
    <body><article>
      <p>First paragraph of the article.</p>
      <p>Second paragraph with <strong>bold text</strong>.</p>
    </article></body></html>`;

    const result = extractArticleFromHtml(html, "https://example.com/article");
    expect(result.content).toBeTruthy();
    expect(result.contentHtml).toBeTruthy();
    // contentHtml should be HTML (contains tags)
    expect(result.contentHtml).toMatch(/<[a-z]/i);
  });

  it("builds paragraph HTML fallback when no Readability HTML", async () => {
    const { extractArticleFromHtml } = await import("../main/url-extractor.js");

    // JSON-LD articleBody gives content without HTML
    const html = `<html><head>
    <script type="application/ld+json">{"@type":"Article","articleBody":"First para.\\n\\nSecond para.","headline":"LD Article"}</script>
    </head><body><p>Filler</p></body></html>`;

    const result = extractArticleFromHtml(html, "https://example.com/ld");
    expect(result.contentHtml).toBeTruthy();
    // Should have <p> tags from paragraph wrapping
    expect(result.contentHtml).toContain("<p>");
  });
});

// ---------------------------------------------------------------------------
// 3. buildEpubZip OPF metadata (date, source)
// ---------------------------------------------------------------------------

describe("buildEpubZip OPF metadata", () => {
  it("includes dc:date and dc:source when provided", async () => {
    const { buildEpubZip } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    const epubPath = path.join(tmpDir, "meta.epub");
    await buildEpubZip({
      outputPath: epubPath,
      title: "Metadata Test",
      author: "Author",
      date: "2024-01-15",
      source: "https://news.example.com/story",
      chapters: [{
        title: "Ch1",
        xhtml: `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Ch1</title></head>
<body><p>Content</p></body></html>`,
      }],
    });

    const zip = new AdmZip(epubPath);
    const opf = zip.getEntry("OEBPS/content.opf").getData().toString("utf-8");
    expect(opf).toContain("<dc:date>2024-01-15</dc:date>");
    expect(opf).toContain("<dc:source>https://news.example.com/story</dc:source>");
  });

  it("omits dc:date and dc:source when not provided", async () => {
    const { buildEpubZip } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    const epubPath = path.join(tmpDir, "nometa.epub");
    await buildEpubZip({
      outputPath: epubPath,
      title: "No Meta",
      author: "Author",
      chapters: [{
        title: "Ch1",
        xhtml: `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Ch1</title></head>
<body><p>Content</p></body></html>`,
      }],
    });

    const zip = new AdmZip(epubPath);
    const opf = zip.getEntry("OEBPS/content.opf").getData().toString("utf-8");
    expect(opf).not.toContain("<dc:date>");
    expect(opf).not.toContain("<dc:source>");
  });
});

// ---------------------------------------------------------------------------
// 4. Legacy migration v5→v6: marks docs for EPUB re-conversion
// ---------------------------------------------------------------------------

describe("library migration v5→v6 — EPUB re-conversion flags", () => {
  // Replicate migration logic for testing (can't import CommonJS directly)
  const migrationV5toV6 = (data) => {
    const docs = Array.isArray(data) ? data : (data.docs || []);
    for (const doc of docs) {
      if (doc.legacyRenderer) {
        doc.needsEpubConversion = true;
        delete doc.legacyRenderer;
      } else if (doc.filepath && !doc.convertedEpubPath && doc.ext !== ".epub") {
        doc.needsEpubConversion = true;
      }
    }
    return { schemaVersion: 6, docs };
  };

  it("flags docs with legacyRenderer for EPUB conversion", () => {
    const data = {
      schemaVersion: 5,
      docs: [
        { id: "1", title: "Legacy Doc", legacyRenderer: true, filepath: "/a.txt", ext: ".txt" },
      ],
    };
    const result = migrationV5toV6(data);
    expect(result.schemaVersion).toBe(6);
    expect(result.docs[0].needsEpubConversion).toBe(true);
    expect(result.docs[0].legacyRenderer).toBeUndefined();
  });

  it("flags docs with filepath but no EPUB path", () => {
    const data = {
      schemaVersion: 5,
      docs: [
        { id: "2", title: "PDF Doc", filepath: "/b.pdf", ext: ".pdf" },
      ],
    };
    const result = migrationV5toV6(data);
    expect(result.docs[0].needsEpubConversion).toBe(true);
  });

  it("does NOT flag native EPUB docs", () => {
    const data = {
      schemaVersion: 5,
      docs: [
        { id: "3", title: "EPUB Doc", filepath: "/c.epub", ext: ".epub" },
      ],
    };
    const result = migrationV5toV6(data);
    expect(result.docs[0].needsEpubConversion).toBeUndefined();
  });

  it("does NOT flag docs that already have convertedEpubPath", () => {
    const data = {
      schemaVersion: 5,
      docs: [
        { id: "4", title: "Converted", filepath: "/d.txt", ext: ".txt", convertedEpubPath: "/d.epub" },
      ],
    };
    const result = migrationV5toV6(data);
    expect(result.docs[0].needsEpubConversion).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 5. On-demand lazy EPUB conversion (load-doc-content behavior)
// ---------------------------------------------------------------------------

describe("on-demand lazy EPUB conversion", () => {
  it("convertToEpub produces EPUB from a text file", async () => {
    const { convertToEpub } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    const txtPath = path.join(tmpDir, "test.txt");
    await fs.writeFile(txtPath, "Chapter 1\n\nThis is some test content for the lazy conversion test.\n\nChapter 2\n\nMore content here.", "utf-8");

    const result = await convertToEpub(txtPath, tmpDir, "lazy-test-123", {
      title: "Lazy Test",
      author: "Test Author",
    });

    expect(result.epubPath).toContain("lazy-test-123.epub");
    expect(result.valid).toBe(true);

    const zip = new AdmZip(result.epubPath);
    const opf = zip.getEntry("OEBPS/content.opf");
    expect(opf).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 6. FoliatePageView-only rendering verification (useFoliate logic)
// ---------------------------------------------------------------------------

describe("FoliatePageView-only rendering logic", () => {
  it("useFoliate is true when doc has filepath and ext .epub", () => {
    // Replicate the useFoliate check from ReaderContainer.tsx
    const useFoliate = (doc) => Boolean(doc?.filepath && doc?.ext === ".epub");

    expect(useFoliate({ filepath: "/books/test.epub", ext: ".epub" })).toBe(true);
    expect(useFoliate({ filepath: "/books/test.pdf", ext: ".pdf" })).toBe(false);
    expect(useFoliate({ ext: ".epub" })).toBe(false); // no filepath
    expect(useFoliate({ filepath: "/books/test.epub" })).toBe(false); // no ext
    expect(useFoliate(null)).toBe(false);
  });

  it("URL-imported EPUB doc triggers foliate rendering", () => {
    const useFoliate = (doc) => Boolean(doc?.filepath && doc?.ext === ".epub");

    // Simulates a URL-imported doc after EPUB-2B conversion
    const urlDoc = {
      id: "url-123",
      title: "Article",
      source: "url",
      filepath: "/data/converted/url-123.epub",
      convertedEpubPath: "/data/converted/url-123.epub",
      ext: ".epub",
    };
    expect(useFoliate(urlDoc)).toBe(true);
  });

  it("legacy doc without EPUB does NOT trigger foliate rendering", () => {
    const useFoliate = (doc) => Boolean(doc?.filepath && doc?.ext === ".epub");

    const legacyDoc = {
      id: "legacy-1",
      title: "Old Article",
      filepath: "/books/old.txt",
      ext: ".txt",
    };
    expect(useFoliate(legacyDoc)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 7. Chrome extension article → EPUB structure test
// ---------------------------------------------------------------------------

describe("Chrome extension article → EPUB", () => {
  it("htmlToEpub converts extension article HTML to EPUB", async () => {
    const { htmlToEpub } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    // Simulates the HTML that ws-server would write for a Chrome extension article
    const articleHtml = `<html><head><title>Extension Article</title></head>
    <body>
      <p>Article sent from Chrome extension.</p>
      <p>It should preserve <strong>formatting</strong>.</p>
    </body></html>`;

    const htmlPath = path.join(tmpDir, "ext-article.html");
    await fs.writeFile(htmlPath, articleHtml, "utf-8");

    const epubPath = path.join(tmpDir, "ext-article.epub");
    const result = await htmlToEpub(htmlPath, epubPath, {
      title: "Extension Article",
      author: "Unknown",
      source: "https://blog.example.com/post",
    });

    expect(result.valid).toBe(true);
    const zip = new AdmZip(epubPath);
    const opf = zip.getEntry("OEBPS/content.opf").getData().toString("utf-8");
    expect(opf).toContain("<dc:source>https://blog.example.com/post</dc:source>");
  });
});
