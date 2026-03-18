import { describe, it, expect } from "vitest";
import { sanitizeFilename, buildPdfMetadata } from "../src/utils/pdf.ts";
import PDFDocument from "pdfkit";
import { PDFParse } from "pdf-parse";

describe("sanitizeFilename", () => {
  it("replaces illegal characters with hyphens", () => {
    expect(sanitizeFilename('Hello: World? "Test"')).toBe("Hello-World-Test");
  });
  it("collapses multiple hyphens", () => {
    expect(sanitizeFilename("a///b///c")).toBe("a-b-c");
  });
  it("trims hyphens from edges", () => {
    expect(sanitizeFilename("--hello--")).toBe("hello");
  });
  it("truncates to 100 characters", () => {
    const long = "a".repeat(150);
    expect(sanitizeFilename(long).length).toBeLessThanOrEqual(100);
  });
  it("returns 'untitled' for empty input", () => {
    expect(sanitizeFilename("")).toBe("untitled");
  });
});

describe("buildPdfMetadata", () => {
  it("builds metadata object from article info", () => {
    const meta = buildPdfMetadata({
      title: "Test Article",
      author: "Jane Doe",
      sourceUrl: "https://example.com/article",
      fetchDate: new Date("2026-03-18"),
    });
    expect(meta.Title).toBe("Test Article");
    expect(meta.Author).toBe("Jane Doe");
    expect(meta.Keywords).toContain("https://example.com/article");
    expect(meta.CreationDate).toBeInstanceOf(Date);
  });
  it("handles missing author", () => {
    const meta = buildPdfMetadata({
      title: "Test",
      sourceUrl: "https://example.com",
      fetchDate: new Date(),
    });
    expect(meta.Author).toBe("Unknown");
  });
});

describe("PDF round-trip", () => {
  it("preserves text through pdfkit write → pdf-parse read", async () => {
    const testText = "This is paragraph one.\n\nThis is paragraph two with special chars: é, ñ, ü.";

    // Generate PDF in memory
    const doc = new PDFDocument();
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    const pdfReady = new Promise((resolve) => doc.on("end", resolve));

    doc.fontSize(11).text(testText);
    doc.end();
    await pdfReady;

    const pdfBuffer = Buffer.concat(chunks);

    // Read it back using pdf-parse v2 class API
    const parser = new PDFParse({ data: pdfBuffer });
    const result = await parser.getText();
    const parsedText = result.text;
    expect(parsedText).toContain("This is paragraph one.");
    expect(parsedText).toContain("This is paragraph two");
    expect(parsedText).toContain("é");
    expect(parsedText).toContain("ñ");
  });
});
