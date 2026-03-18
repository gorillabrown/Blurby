import { describe, it, expect } from "vitest";
import { sanitizeFilename, buildPdfMetadata } from "../src/utils/pdf.ts";

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
