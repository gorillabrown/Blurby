import { describe, it, expect, beforeEach, afterEach } from "vitest";
import os from "os";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

// We test the converter module by requiring it directly.
// Heavy deps (adm-zip, cheerio) are available in the project.
// pdf-parse and file-parsers are mocked for PDF/MOBI tests.

let tmpDir;

beforeEach(async () => {
  tmpDir = path.join(os.tmpdir(), `blurby-epub-test-${crypto.randomUUID()}`);
  await fs.mkdir(tmpDir, { recursive: true });
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// buildEpubZip
// ---------------------------------------------------------------------------

describe("buildEpubZip", () => {
  it("creates a valid EPUB structure with mimetype, container.xml, content.opf, and chapters", async () => {
    const { buildEpubZip } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    const epubPath = path.join(tmpDir, "test.epub");
    await buildEpubZip({
      outputPath: epubPath,
      title: "Test Book",
      author: "Test Author",
      chapters: [
        {
          title: "Chapter One",
          xhtml: `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>Chapter One</title></head>
<body><h1>Chapter One</h1><p>Hello world.</p></body>
</html>`,
        },
        {
          title: "Chapter Two",
          xhtml: `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>Chapter Two</title></head>
<body><h1>Chapter Two</h1><p>Goodbye world.</p></body>
</html>`,
        },
      ],
    });

    // File should exist
    const stat = await fs.stat(epubPath);
    expect(stat.size).toBeGreaterThan(0);

    // Unzip and verify structure
    const zip = new AdmZip(epubPath);
    const entries = zip.getEntries().map((e) => e.entryName);

    expect(entries).toContain("mimetype");
    expect(entries).toContain("META-INF/container.xml");
    expect(entries).toContain("OEBPS/content.opf");
    expect(entries).toContain("OEBPS/nav.xhtml");
    expect(entries).toContain("OEBPS/Text/chapter_0.xhtml");
    expect(entries).toContain("OEBPS/Text/chapter_1.xhtml");

    // mimetype content must be exact
    const mimeEntry = zip.getEntry("mimetype");
    expect(mimeEntry.getData().toString()).toBe("application/epub+zip");

    // container.xml points to content.opf
    const container = zip.getEntry("META-INF/container.xml").getData().toString();
    expect(container).toContain("OEBPS/content.opf");

    // content.opf has metadata
    const opf = zip.getEntry("OEBPS/content.opf").getData().toString();
    expect(opf).toContain("<dc:title>Test Book</dc:title>");
    expect(opf).toContain("<dc:creator>Test Author</dc:creator>");
    expect(opf).toContain("urn:uuid:");
    expect(opf).toContain("dcterms:modified");

    // nav.xhtml has TOC
    const nav = zip.getEntry("OEBPS/nav.xhtml").getData().toString();
    expect(nav).toContain("Chapter One");
    expect(nav).toContain("Chapter Two");
  });

  it("includes cover image when provided", async () => {
    const { buildEpubZip } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    const epubPath = path.join(tmpDir, "cover-test.epub");
    const fakeCover = Buffer.from("fake-jpeg-data");

    await buildEpubZip({
      outputPath: epubPath,
      title: "Cover Book",
      author: "Author",
      chapters: [
        {
          title: "Ch1",
          xhtml: "<html><body><p>text</p></body></html>",
        },
      ],
      coverImage: fakeCover,
    });

    const zip = new AdmZip(epubPath);
    const entries = zip.getEntries().map((e) => e.entryName);
    expect(entries).toContain("OEBPS/Images/cover.jpg");

    const opf = zip.getEntry("OEBPS/content.opf").getData().toString();
    expect(opf).toContain("cover-image");
    expect(opf).toContain("Images/cover.jpg");
  });

  it("escapes XML special characters in title and author", async () => {
    const { buildEpubZip } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    const epubPath = path.join(tmpDir, "escape-test.epub");
    await buildEpubZip({
      outputPath: epubPath,
      title: 'War & Peace <"Vol 1">',
      author: "Leo & Tolstoy",
      chapters: [
        { title: "Ch", xhtml: "<html><body><p>ok</p></body></html>" },
      ],
    });

    const zip = new AdmZip(epubPath);
    const opf = zip.getEntry("OEBPS/content.opf").getData().toString();
    expect(opf).toContain("War &amp; Peace &lt;&quot;Vol 1&quot;&gt;");
    expect(opf).toContain("Leo &amp; Tolstoy");
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

describe("escapeXml", () => {
  it("escapes &, <, >, and quotes", async () => {
    const { escapeXml } = await import("../main/epub-converter.js");
    expect(escapeXml('A & B < C > D "E"')).toBe(
      "A &amp; B &lt; C &gt; D &quot;E&quot;"
    );
  });
});

describe("detectChapters", () => {
  it("detects 'Chapter N' headings surrounded by blank lines", async () => {
    const { detectChapters } = await import("../main/epub-converter.js");

    // Build text with a chapter heading after >50 lines
    const preambleLines = Array.from({ length: 60 }, (_, i) => `Line ${i + 1}`);
    const text = [
      ...preambleLines,
      "",
      "Chapter 1",
      "",
      "This is the first chapter content.",
      "More content here.",
    ].join("\n");

    const chapters = detectChapters(text);
    expect(chapters.length).toBe(2); // preamble + Chapter 1
    expect(chapters[0].title).toBe("Preamble");
    expect(chapters[1].title).toBe("Chapter 1");
    expect(chapters[1].text).toContain("first chapter content");
  });

  it("returns single chapter when no headings detected", async () => {
    const { detectChapters } = await import("../main/epub-converter.js");
    const text = "Just some plain text\nwith no chapters.";
    const chapters = detectChapters(text);
    expect(chapters.length).toBe(1);
    expect(chapters[0].title).toBe("Chapter 1");
  });

  it("detects ALL CAPS headings", async () => {
    const { detectChapters } = await import("../main/epub-converter.js");
    const lines = Array.from({ length: 55 }, (_, i) => `Content line ${i}`);
    const text = [
      ...lines,
      "",
      "THE BEGINNING",
      "",
      "Story starts here.",
    ].join("\n");

    const chapters = detectChapters(text);
    expect(chapters.some((ch) => ch.title === "THE BEGINNING")).toBe(true);
  });

  it("enforces minimum distance between chapter boundaries", async () => {
    const { detectChapters } = await import("../main/epub-converter.js");
    // Two headings too close together -- second should be ignored
    const text = [
      "",
      "Chapter 1",
      "",
      "Some text.",
      "",
      "Chapter 2",
      "",
      "More text.",
    ].join("\n");

    const chapters = detectChapters(text);
    // Only one chapter heading should be detected (plus possible preamble)
    const chapterTitles = chapters.map((c) => c.title);
    expect(chapterTitles.filter((t) => t.startsWith("Chapter")).length).toBe(1);
  });
});

describe("isChapterHeading", () => {
  it("matches various heading patterns", async () => {
    const { isChapterHeading } = await import("../main/epub-converter.js");
    expect(isChapterHeading("Chapter 1")).toBe(true);
    expect(isChapterHeading("CHAPTER TEN")).toBe(true);
    expect(isChapterHeading("Part III")).toBe(true);
    expect(isChapterHeading("1. Introduction")).toBe(true);
    expect(isChapterHeading("ALL CAPS TITLE")).toBe(true);
    expect(isChapterHeading("")).toBe(false);
    expect(isChapterHeading("This is a regular sentence that is quite long and should not be detected as a chapter heading at all because it exceeds eighty characters.")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// txtToEpub
// ---------------------------------------------------------------------------

describe("txtToEpub", () => {
  it("converts a text file with paragraphs to EPUB", async () => {
    const { txtToEpub } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    const inputPath = path.join(tmpDir, "sample.txt");
    const content = "First paragraph.\n\nSecond paragraph.\n\nThird paragraph.";
    await fs.writeFile(inputPath, content, "utf-8");

    const outputPath = path.join(tmpDir, "sample.epub");
    const result = await txtToEpub(inputPath, outputPath);

    expect(result.epubPath).toBe(outputPath);
    expect(result.title).toBe("sample");
    expect(result.author).toBe("Unknown");
    expect(result.chapterCount).toBe(1);

    // Verify EPUB content
    const zip = new AdmZip(outputPath);
    const chapter = zip.getEntry("OEBPS/Text/chapter_0.xhtml").getData().toString();
    expect(chapter).toContain("<p>First paragraph.</p>");
    expect(chapter).toContain("<p>Second paragraph.</p>");
    expect(chapter).toContain("<p>Third paragraph.</p>");
  });

  it("detects chapter headings in text and creates multiple chapters", async () => {
    const { txtToEpub } = await import("../main/epub-converter.js");

    const inputPath = path.join(tmpDir, "chapters.txt");
    const preamble = Array.from({ length: 55 }, (_, i) => `Line ${i}`).join("\n");
    const content = [
      preamble,
      "",
      "Chapter 1",
      "",
      "First chapter content.",
      "",
    ].join("\n");
    await fs.writeFile(inputPath, content, "utf-8");

    const outputPath = path.join(tmpDir, "chapters.epub");
    const result = await txtToEpub(inputPath, outputPath, {
      title: "My Book",
      author: "Jane Doe",
    });

    expect(result.title).toBe("My Book");
    expect(result.author).toBe("Jane Doe");
    expect(result.chapterCount).toBe(2);
  });

  it("escapes XML entities in text content", async () => {
    const { txtToEpub } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    const inputPath = path.join(tmpDir, "entities.txt");
    await fs.writeFile(inputPath, 'Tom & Jerry said "hello" <world>', "utf-8");

    const outputPath = path.join(tmpDir, "entities.epub");
    await txtToEpub(inputPath, outputPath);

    const zip = new AdmZip(outputPath);
    const chapter = zip.getEntry("OEBPS/Text/chapter_0.xhtml").getData().toString();
    expect(chapter).toContain("Tom &amp; Jerry said &quot;hello&quot; &lt;world&gt;");
  });
});

// ---------------------------------------------------------------------------
// mdToEpub
// ---------------------------------------------------------------------------

describe("mdToEpub", () => {
  it("converts markdown headings to EPUB chapters", async () => {
    const { mdToEpub } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    const inputPath = path.join(tmpDir, "doc.md");
    const md = [
      "# Introduction",
      "",
      "Welcome to the book.",
      "",
      "## Methods",
      "",
      "We used **bold** techniques and *italic* approaches.",
      "",
      "See [example](https://example.com).",
      "",
      "```",
      "code block",
      "```",
    ].join("\n");
    await fs.writeFile(inputPath, md, "utf-8");

    const outputPath = path.join(tmpDir, "doc.epub");
    const result = await mdToEpub(inputPath, outputPath, { title: "MD Book" });

    expect(result.title).toBe("MD Book");
    expect(result.chapterCount).toBe(2);

    const zip = new AdmZip(outputPath);
    const ch0 = zip.getEntry("OEBPS/Text/chapter_0.xhtml").getData().toString();
    const ch1 = zip.getEntry("OEBPS/Text/chapter_1.xhtml").getData().toString();

    expect(ch0).toContain("Introduction");
    expect(ch0).toContain("Welcome to the book.");
    expect(ch1).toContain("Methods");
    expect(ch1).toContain("<strong>bold</strong>");
    expect(ch1).toContain("<em>italic</em>");
    expect(ch1).toContain('<a href="https://example.com">example</a>');
    expect(ch1).toContain("<pre><code>");
    expect(ch1).toContain("code block");
  });

  it("handles markdown with no headings as single chapter", async () => {
    const { mdToEpub } = await import("../main/epub-converter.js");

    const inputPath = path.join(tmpDir, "noheading.md");
    await fs.writeFile(inputPath, "Just some text.\n\nMore text.", "utf-8");

    const outputPath = path.join(tmpDir, "noheading.epub");
    const result = await mdToEpub(inputPath, outputPath);

    expect(result.chapterCount).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// htmlToEpub
// ---------------------------------------------------------------------------

describe("htmlToEpub", () => {
  it("strips script/nav/header/footer/aside and splits at h1/h2", async () => {
    const { htmlToEpub } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    const inputPath = path.join(tmpDir, "page.html");
    const html = `<!DOCTYPE html>
<html>
<head><title>Web Page</title></head>
<body>
<header>Header stuff</header>
<nav>Nav links</nav>
<script>alert("bad");</script>
<style>.foo { color: red; }</style>
<h1>Part One</h1>
<p>First section content.</p>
<h2>Subsection</h2>
<p>Second section content.</p>
<aside>Sidebar</aside>
<footer>Footer stuff</footer>
</body>
</html>`;
    await fs.writeFile(inputPath, html, "utf-8");

    const outputPath = path.join(tmpDir, "page.epub");
    const result = await htmlToEpub(inputPath, outputPath);

    expect(result.title).toBe("Web Page");
    expect(result.chapterCount).toBe(2);

    const zip = new AdmZip(outputPath);
    const ch0 = zip.getEntry("OEBPS/Text/chapter_0.xhtml").getData().toString();
    const ch1 = zip.getEntry("OEBPS/Text/chapter_1.xhtml").getData().toString();

    // Should not contain stripped elements
    expect(ch0).not.toContain("alert");
    expect(ch0).not.toContain("Header stuff");
    expect(ch0).not.toContain("Nav links");
    expect(ch0).toContain("First section content.");
    expect(ch1).toContain("Second section content.");
  });

  it("extracts title from <title> tag", async () => {
    const { htmlToEpub } = await import("../main/epub-converter.js");

    const inputPath = path.join(tmpDir, "titled.html");
    await fs.writeFile(
      inputPath,
      "<html><head><title>My Title</title></head><body><p>Hi</p></body></html>",
      "utf-8"
    );

    const outputPath = path.join(tmpDir, "titled.epub");
    const result = await htmlToEpub(inputPath, outputPath);
    expect(result.title).toBe("My Title");
  });
});

// ---------------------------------------------------------------------------
// pdfToEpub (mocked)
// ---------------------------------------------------------------------------

describe("pdfToEpub", () => {
  it("extracts text from PDF and creates EPUB via injected parser", async () => {
    const { pdfToEpub } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    // Fake pdf-parse function injected via _deps
    const fakePdfParse = async () => ({
      text: "First paragraph of the PDF.\n\nSecond paragraph.",
      info: { Title: "PDF Book", Author: "PDF Author" },
    });

    const inputPath = path.join(tmpDir, "doc.pdf");
    await fs.writeFile(inputPath, Buffer.from("fake-pdf"));

    const outputPath = path.join(tmpDir, "doc.epub");
    const result = await pdfToEpub(inputPath, outputPath, {}, { pdfParse: fakePdfParse });

    expect(result.epubPath).toBe(outputPath);
    expect(result.title).toBe("PDF Book");
    expect(result.author).toBe("PDF Author");
    expect(result.chapterCount).toBeGreaterThanOrEqual(1);

    const zip = new AdmZip(outputPath);
    const ch = zip.getEntry("OEBPS/Text/chapter_0.xhtml").getData().toString();
    expect(ch).toContain("First paragraph of the PDF.");
  });
});

// ---------------------------------------------------------------------------
// mobiToEpub (mocked)
// ---------------------------------------------------------------------------

describe("mobiToEpub", () => {
  it("extracts MOBI text and creates EPUB via injected parsers", async () => {
    const { mobiToEpub } = await import("../main/epub-converter.js");

    const fakeFileParsers = {
      parseMobiContent: () => "Extracted MOBI text.\n\nSecond paragraph.",
      parseMobiMetadata: () => ({ title: "MOBI Book", author: "MOBI Author" }),
      extractMobiCover: async () => null,
    };

    const inputPath = path.join(tmpDir, "book.mobi");
    await fs.writeFile(inputPath, Buffer.from("fake-mobi"));

    const outputPath = path.join(tmpDir, "book.epub");
    const result = await mobiToEpub(inputPath, outputPath, {}, { fileParsers: fakeFileParsers });

    expect(result.title).toBe("MOBI Book");
    expect(result.author).toBe("MOBI Author");
    expect(result.chapterCount).toBeGreaterThanOrEqual(1);
  });

  it("throws when MOBI text extraction fails", async () => {
    const { mobiToEpub } = await import("../main/epub-converter.js");

    const fakeFileParsers = {
      parseMobiContent: () => null,
      parseMobiMetadata: () => ({}),
      extractMobiCover: async () => null,
    };

    const inputPath = path.join(tmpDir, "bad.mobi");
    await fs.writeFile(inputPath, Buffer.from("fake"));

    const outputPath = path.join(tmpDir, "bad.epub");
    await expect(
      mobiToEpub(inputPath, outputPath, {}, { fileParsers: fakeFileParsers })
    ).rejects.toThrow(/Failed to extract text from MOBI/);
  });
});

// ---------------------------------------------------------------------------
// convertToEpub (orchestrator)
// ---------------------------------------------------------------------------

describe("convertToEpub", () => {
  it("routes .txt to txtToEpub", async () => {
    const { convertToEpub } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    const inputPath = path.join(tmpDir, "story.txt");
    await fs.writeFile(inputPath, "Once upon a time.\n\nThe end.", "utf-8");

    const result = await convertToEpub(inputPath, tmpDir, "doc-001");
    expect(result.epubPath).toContain("converted");
    expect(result.epubPath).toContain("doc-001.epub");

    const zip = new AdmZip(result.epubPath);
    expect(zip.getEntries().map((e) => e.entryName)).toContain("mimetype");
  });

  it("routes .html to htmlToEpub", async () => {
    const { convertToEpub } = await import("../main/epub-converter.js");

    const inputPath = path.join(tmpDir, "page.html");
    await fs.writeFile(
      inputPath,
      "<html><head><title>T</title></head><body><p>ok</p></body></html>",
      "utf-8"
    );

    const result = await convertToEpub(inputPath, tmpDir, "doc-002");
    expect(result.epubPath).toContain("doc-002.epub");
    expect(result.title).toBe("T");
  });

  it("routes .md to mdToEpub", async () => {
    const { convertToEpub } = await import("../main/epub-converter.js");

    const inputPath = path.join(tmpDir, "readme.md");
    await fs.writeFile(inputPath, "# Hello\n\nWorld.", "utf-8");

    const result = await convertToEpub(inputPath, tmpDir, "doc-003");
    expect(result.chapterCount).toBeGreaterThanOrEqual(1);
  });

  it("copies .epub files directly", async () => {
    const { convertToEpub } = await import("../main/epub-converter.js");

    const inputPath = path.join(tmpDir, "existing.epub");
    await fs.writeFile(inputPath, "fake-epub-content");

    const result = await convertToEpub(inputPath, tmpDir, "doc-004");
    expect(result.epubPath).toContain("doc-004.epub");

    const copied = await fs.readFile(result.epubPath, "utf-8");
    expect(copied).toBe("fake-epub-content");
  });

  it("throws for unsupported extensions", async () => {
    const { convertToEpub } = await import("../main/epub-converter.js");

    const inputPath = path.join(tmpDir, "file.xyz");
    await fs.writeFile(inputPath, "data");

    await expect(convertToEpub(inputPath, tmpDir, "doc-005")).rejects.toThrow(
      /Unsupported format/
    );
  });

  it("routes .rst to txtToEpub", async () => {
    const { convertToEpub } = await import("../main/epub-converter.js");

    const inputPath = path.join(tmpDir, "doc.rst");
    await fs.writeFile(inputPath, "Some reStructuredText content.", "utf-8");

    const result = await convertToEpub(inputPath, tmpDir, "doc-006");
    expect(result.epubPath).toContain("doc-006.epub");
  });

  it("routes .markdown to mdToEpub", async () => {
    const { convertToEpub } = await import("../main/epub-converter.js");

    const inputPath = path.join(tmpDir, "file.markdown");
    await fs.writeFile(inputPath, "# Title\n\nBody.", "utf-8");

    const result = await convertToEpub(inputPath, tmpDir, "doc-007");
    expect(result.epubPath).toContain("doc-007.epub");
  });
});

describe("validateEpub", () => {
  let tmpDir;
  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), `blurby-test-validate-${crypto.randomUUID()}`);
    await fs.mkdir(tmpDir, { recursive: true });
  });
  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  it("validates a correctly built EPUB", async () => {
    const { buildEpubZip, validateEpub } = await import("../main/epub-converter.js");
    const epubPath = path.join(tmpDir, "valid.epub");
    await buildEpubZip({
      outputPath: epubPath,
      title: "Valid Book",
      author: "Author",
      chapters: [{ title: "Ch1", xhtml: "<p>Hello</p>" }],
    });
    const result = await validateEpub(epubPath);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("detects missing mimetype", async () => {
    const { validateEpub } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;
    const zip = new AdmZip();
    zip.addFile("META-INF/container.xml", Buffer.from("<container/>"));
    zip.addFile("OEBPS/content.opf", Buffer.from("<package/>"));
    zip.addFile("OEBPS/ch.xhtml", Buffer.from("<html/>"));
    const epubPath = path.join(tmpDir, "no-mime.epub");
    zip.writeZip(epubPath);
    const result = await validateEpub(epubPath);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Missing mimetype entry");
  });

  it("detects missing content files", async () => {
    const { validateEpub } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;
    const zip = new AdmZip();
    zip.addFile("mimetype", Buffer.from("application/epub+zip"));
    zip.addFile("META-INF/container.xml", Buffer.from("<container/>"));
    zip.addFile("OEBPS/content.opf", Buffer.from("<package/>"));
    const epubPath = path.join(tmpDir, "no-content.epub");
    zip.writeZip(epubPath);
    const result = await validateEpub(epubPath);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("No XHTML content files found");
  });

  it("detects non-EPUB file", async () => {
    const { validateEpub } = await import("../main/epub-converter.js");
    const txtPath = path.join(tmpDir, "not-epub.epub");
    await fs.writeFile(txtPath, "This is not an EPUB", "utf-8");
    const result = await validateEpub(txtPath);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
