import { describe, it, expect, beforeEach, afterEach } from "vitest";
import os from "os";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

let tmpDir;

beforeEach(async () => {
  tmpDir = path.join(os.tmpdir(), `blurby-fidelity-${crypto.randomUUID()}`);
  await fs.mkdir(tmpDir, { recursive: true });
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// structuredTextToHtml
// ---------------------------------------------------------------------------

describe("structuredTextToHtml", () => {
  it("detects ALL CAPS lines as headings", async () => {
    const { structuredTextToHtml } = await import("../main/epub-converter.js");
    const html = structuredTextToHtml("INTRODUCTION\n\nSome text here.");
    expect(html).toContain("<h2>");
    expect(html).toContain("INTRODUCTION");
  });

  it("detects bullet lists", async () => {
    const { structuredTextToHtml } = await import("../main/epub-converter.js");
    const html = structuredTextToHtml("- Item one\n- Item two\n- Item three");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>Item one</li>");
    expect(html).toContain("<li>Item two</li>");
  });

  it("detects numbered lists", async () => {
    const { structuredTextToHtml } = await import("../main/epub-converter.js");
    const html = structuredTextToHtml("1. First\n2. Second\n3. Third");
    expect(html).toContain("<ol>");
    expect(html).toContain("<li>First</li>");
  });

  it("preserves paragraphs", async () => {
    const { structuredTextToHtml } = await import("../main/epub-converter.js");
    const html = structuredTextToHtml("First paragraph.\n\nSecond paragraph.");
    expect(html).toContain("<p>First paragraph.</p>");
    expect(html).toContain("<p>Second paragraph.</p>");
  });
});

// ---------------------------------------------------------------------------
// sanitizeHtmlForEpub
// ---------------------------------------------------------------------------

describe("sanitizeHtmlForEpub", () => {
  it("removes script and style tags", async () => {
    const { sanitizeHtmlForEpub } = await import("../main/epub-converter.js");
    const result = sanitizeHtmlForEpub("<body><script>alert(1)</script><p>Hello</p><style>.x{}</style></body>");
    expect(result.html).not.toContain("<script>");
    expect(result.html).not.toContain("<style>");
    expect(result.html).toContain("<p>Hello</p>");
  });

  it("preserves formatting tags", async () => {
    const { sanitizeHtmlForEpub } = await import("../main/epub-converter.js");
    const result = sanitizeHtmlForEpub("<body><p><strong>Bold</strong> and <em>italic</em></p></body>");
    expect(result.html).toContain("<strong>Bold</strong>");
    expect(result.html).toContain("<em>italic</em>");
  });

  it("collects image references", async () => {
    const { sanitizeHtmlForEpub } = await import("../main/epub-converter.js");
    const result = sanitizeHtmlForEpub('<body><img src="photo.jpg" alt="A photo"/></body>');
    expect(result.images).toHaveLength(1);
    expect(result.images[0].src).toBe("photo.jpg");
  });
});

// ---------------------------------------------------------------------------
// imageMediaType
// ---------------------------------------------------------------------------

describe("imageMediaType", () => {
  it("maps common extensions to MIME types", async () => {
    const { imageMediaType } = await import("../main/epub-converter.js");
    expect(imageMediaType(".jpg")).toBe("image/jpeg");
    expect(imageMediaType(".png")).toBe("image/png");
    expect(imageMediaType(".gif")).toBe("image/gif");
    expect(imageMediaType(".svg")).toBe("image/svg+xml");
  });
});

// ---------------------------------------------------------------------------
// buildEpubZip with images
// ---------------------------------------------------------------------------

describe("buildEpubZip with images", () => {
  it("embeds images in OEBPS/Images/ and adds to manifest", async () => {
    const { buildEpubZip } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    const epubPath = path.join(tmpDir, "images.epub");
    const testImage = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]); // PNG header

    await buildEpubZip({
      outputPath: epubPath,
      title: "Image Book",
      author: "Author",
      chapters: [{
        title: "Ch 1",
        xhtml: `<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Ch 1</title></head><body><p>Text</p><img src="../Images/test.png"/></body></html>`,
      }],
      images: [{
        id: "img_0",
        filename: "test.png",
        buffer: testImage,
        mediaType: "image/png",
      }],
    });

    const zip = new AdmZip(epubPath);
    const entries = zip.getEntries().map(e => e.entryName);
    expect(entries).toContain("OEBPS/Images/test.png");

    const opf = zip.readAsText("OEBPS/content.opf");
    expect(opf).toContain('id="img_0"');
    expect(opf).toContain('media-type="image/png"');
  });
});

// ---------------------------------------------------------------------------
// PDF → EPUB formatting preservation
// ---------------------------------------------------------------------------

describe("pdfToEpub formatting", () => {
  it("uses structure-aware HTML with heading and list detection", async () => {
    const { pdfToEpub, validateEpub } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    // Create a dummy PDF file (content doesn't matter — we mock the parser)
    const fakePdfPath = path.join(tmpDir, "fake.pdf");
    await fs.writeFile(fakePdfPath, "dummy pdf content");

    const outputPath = path.join(tmpDir, "pdf-fmt.epub");
    const mockPdfParse = async () => ({
      text: "INTRODUCTION\n\nThis is the introductory section of the document with enough words to pass the minimum extractable words threshold. We need at least fifty words to avoid the scanned PDF detection.\n\nSECTION OVERVIEW\n\nHere are some more words to pad.\n\n- Point one\n- Point two\n\n1. First numbered item\n2. Second numbered item\n\nMore text here with additional content to make the word count sufficient for the PDF parser validation.",
      info: { Title: "PDF Book", Author: "PDF Author" },
    });

    const result = await pdfToEpub(fakePdfPath, outputPath, {}, { pdfParse: mockPdfParse });
    expect(result.valid).toBe(true);

    const zip = new AdmZip(outputPath);
    const chapter = zip.readAsText("OEBPS/Text/chapter_0.xhtml");
    // structuredTextToHtml detects ALL-CAPS subheadings, bullet lists, numbered lists
    expect(chapter).toContain("<h2>SECTION OVERVIEW</h2>");
    expect(chapter).toContain("<ul>");
    expect(chapter).toContain("<li>Point one</li>");
    expect(chapter).toContain("<ol>");
    expect(chapter).toContain("<li>First numbered item</li>");
  });
});

// ---------------------------------------------------------------------------
// MOBI → EPUB formatting preservation
// ---------------------------------------------------------------------------

describe("mobiToEpub formatting", () => {
  it("preserves MOBI HTML formatting when parseMobiHtml available", async () => {
    const { mobiToEpub, validateEpub } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    // Create a dummy MOBI file (content doesn't matter — we mock the parsers)
    const fakeMobiPath = path.join(tmpDir, "fake.mobi");
    await fs.writeFile(fakeMobiPath, "dummy mobi content");

    const outputPath = path.join(tmpDir, "mobi-fmt.epub");
    const mockParsers = {
      parseMobiContent: () => "Plain text fallback",
      parseMobiHtml: () => "<h1>Chapter One</h1><p><strong>Bold text</strong> and <em>italic</em></p><h1>Chapter Two</h1><p>More content</p>",
      parseMobiMetadata: () => ({ title: "MOBI Book", author: "MOBI Author" }),
      extractMobiCover: async () => null,
      extractMobiImages: () => [],
    };

    const result = await mobiToEpub(fakeMobiPath, outputPath, {}, { fileParsers: mockParsers });
    expect(result.valid).toBe(true);
    expect(result.chapterCount).toBe(2);

    const zip = new AdmZip(outputPath);
    const ch0 = zip.readAsText("OEBPS/Text/chapter_0.xhtml");
    expect(ch0).toContain("<strong>Bold text</strong>");
    expect(ch0).toContain("<em>italic</em>");
  });
});

// ---------------------------------------------------------------------------
// HTML → EPUB formatting preservation
// ---------------------------------------------------------------------------

describe("htmlToEpub formatting", () => {
  it("preserves structural elements while removing scripts", async () => {
    const { htmlToEpub, validateEpub } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    const htmlContent = `<html><head><title>Test</title></head><body>
      <script>alert(1)</script>
      <h1>Chapter One</h1>
      <p><strong>Bold</strong> and <em>italic</em></p>
      <ul><li>Item 1</li><li>Item 2</li></ul>
      <h1>Chapter Two</h1>
      <blockquote>A quote</blockquote>
    </body></html>`;

    const inputPath = path.join(tmpDir, "test.html");
    await fs.writeFile(inputPath, htmlContent, "utf-8");

    const outputPath = path.join(tmpDir, "html-fmt.epub");
    const result = await htmlToEpub(inputPath, outputPath);
    expect(result.valid).toBe(true);
    expect(result.chapterCount).toBe(2);

    const zip = new AdmZip(outputPath);
    const ch0 = zip.readAsText("OEBPS/Text/chapter_0.xhtml");
    expect(ch0).toContain("<strong>Bold</strong>");
    expect(ch0).toContain("<em>italic</em>");
    expect(ch0).toContain("<ul>");
    expect(ch0).not.toContain("<script>");
  });

  it("extracts base64 images and embeds in EPUB", async () => {
    const { htmlToEpub } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    // 1x1 red PNG as base64
    const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    const htmlContent = `<html><body><p>Text</p><img src="data:image/png;base64,${pngBase64}"/></body></html>`;

    const inputPath = path.join(tmpDir, "img.html");
    await fs.writeFile(inputPath, htmlContent, "utf-8");

    const outputPath = path.join(tmpDir, "html-img.epub");
    const result = await htmlToEpub(inputPath, outputPath);
    expect(result.valid).toBe(true);

    const zip = new AdmZip(outputPath);
    const entries = zip.getEntries().map(e => e.entryName);
    const imgEntries = entries.filter(e => e.startsWith("OEBPS/Images/") && e !== "OEBPS/Images/cover.jpg");
    expect(imgEntries.length).toBeGreaterThan(0);

    const opf = zip.readAsText("OEBPS/content.opf");
    expect(opf).toContain("image/png");
  });
});

// ---------------------------------------------------------------------------
// DOCX → EPUB
// ---------------------------------------------------------------------------

describe("docxToEpub", () => {
  it("converts a minimal DOCX to valid EPUB", async () => {
    const { docxToEpub, validateEpub } = await import("../main/epub-converter.js");

    // Create a minimal DOCX file using the OOXML structure
    const AdmZip = (await import("adm-zip")).default;
    const zip = new AdmZip();

    zip.addFile("[Content_Types].xml", Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`));

    zip.addFile("_rels/.rels", Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`));

    zip.addFile("word/_rels/document.xml.rels", Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`));

    zip.addFile("word/document.xml", Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Introduction</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Bold text</w:t></w:r><w:r><w:t> and </w:t></w:r><w:r><w:rPr><w:i/></w:rPr><w:t>italic text</w:t></w:r></w:p>
  </w:body>
</w:document>`));

    const docxPath = path.join(tmpDir, "test.docx");
    zip.writeZip(docxPath);

    const outputPath = path.join(tmpDir, "docx-out.epub");
    const result = await docxToEpub(docxPath, outputPath);

    expect(result.valid).toBe(true);
    expect(result.chapterCount).toBeGreaterThanOrEqual(1);

    const epubZip = new AdmZip(outputPath);
    const ch0 = epubZip.readAsText("OEBPS/Text/chapter_0.xhtml");
    expect(ch0).toContain("Bold text");
    expect(ch0).toContain("italic text");
  });
});

// ---------------------------------------------------------------------------
// convertToEpub orchestrator — .docx routing
// ---------------------------------------------------------------------------

describe("convertToEpub", () => {
  it("routes .docx files through docxToEpub", async () => {
    const { convertToEpub } = await import("../main/epub-converter.js");
    const AdmZip = (await import("adm-zip")).default;

    // Create minimal DOCX
    const zip = new AdmZip();
    zip.addFile("[Content_Types].xml", Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`));
    zip.addFile("_rels/.rels", Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`));
    zip.addFile("word/_rels/document.xml.rels", Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`));
    zip.addFile("word/document.xml", Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body><w:p><w:r><w:t>Hello from DOCX</w:t></w:r></w:p></w:body>
</w:document>`));

    const docxPath = path.join(tmpDir, "route-test.docx");
    zip.writeZip(docxPath);

    const result = await convertToEpub(docxPath, tmpDir, "test-docx-123");
    expect(result.valid).toBe(true);
    expect(result.epubPath).toContain("test-docx-123.epub");
  });
});

// ---------------------------------------------------------------------------
// wrapChapterXhtmlRaw
// ---------------------------------------------------------------------------

describe("wrapChapterXhtmlRaw", () => {
  it("wraps body HTML without auto-inserting h1", async () => {
    const { wrapChapterXhtmlRaw } = await import("../main/epub-converter.js");
    const result = wrapChapterXhtmlRaw("Title", "<p>Body content</p>");
    expect(result).toContain("<p>Body content</p>");
    expect(result).not.toContain("<h1>Title</h1>");
    expect(result).toContain("<title>Title</title>");
  });
});

// ---------------------------------------------------------------------------
// parseMobiHtml (file-parsers.js)
// ---------------------------------------------------------------------------

describe("parseMobiHtml", () => {
  it("returns null for too-short buffers", async () => {
    const { parseMobiHtml } = await import("../main/file-parsers.js");
    expect(parseMobiHtml(Buffer.alloc(10))).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// extractMobiImages (file-parsers.js)
// ---------------------------------------------------------------------------

describe("extractMobiImages", () => {
  it("returns empty array for invalid buffers", async () => {
    const { extractMobiImages } = await import("../main/file-parsers.js");
    expect(extractMobiImages(Buffer.alloc(10))).toEqual([]);
  });
});
