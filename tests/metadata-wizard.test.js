import { describe, it, expect } from "vitest";

// ── parseFilenameMetadata tests ─────────────────────────────────────────────

const { parseFilenameMetadata } = await import("../main/metadata-utils.js");

describe("parseFilenameMetadata", () => {
  it("parses 'Author - Title.epub' pattern", () => {
    const result = parseFilenameMetadata("Author - Title.epub");
    expect(result).toEqual({ suggestedAuthor: "Author", suggestedTitle: "Title" });
  });

  it("parses 'Author Name - Book Title.pdf' with multi-word names", () => {
    const result = parseFilenameMetadata("John Smith - The Great Book.pdf");
    expect(result).toEqual({ suggestedAuthor: "John Smith", suggestedTitle: "The Great Book" });
  });

  it("parses 'Last, First - Title.epub' pattern", () => {
    const result = parseFilenameMetadata("Smith, John - My Novel.epub");
    expect(result).toEqual({ suggestedAuthor: "Smith, John", suggestedTitle: "My Novel" });
  });

  it("parses 'Title (Author).epub' pattern", () => {
    const result = parseFilenameMetadata("My Book (Jane Doe).epub");
    expect(result).toEqual({ suggestedTitle: "My Book", suggestedAuthor: "Jane Doe" });
  });

  it("parses 'Title [Author].epub' pattern", () => {
    const result = parseFilenameMetadata("My Book [Jane Doe].mobi");
    expect(result).toEqual({ suggestedTitle: "My Book", suggestedAuthor: "Jane Doe" });
  });

  it("falls back to title-only for plain filename", () => {
    const result = parseFilenameMetadata("My Document.txt");
    expect(result).toEqual({ suggestedTitle: "My Document" });
  });

  it("strips directory from full path", () => {
    const result = parseFilenameMetadata("/home/user/books/Author - Title.epub");
    expect(result).toEqual({ suggestedAuthor: "Author", suggestedTitle: "Title" });
  });

  it("handles Windows paths", () => {
    const result = parseFilenameMetadata("C:\\Books\\Author - Title.epub");
    expect(result).toEqual({ suggestedAuthor: "Author", suggestedTitle: "Title" });
  });

  it("returns empty for null input", () => {
    expect(parseFilenameMetadata(null)).toEqual({});
  });

  it("returns empty for empty string", () => {
    expect(parseFilenameMetadata("")).toEqual({});
  });

  it("returns empty for undefined input", () => {
    expect(parseFilenameMetadata(undefined)).toEqual({});
  });

  it("handles filename with multiple dashes (first dash is the separator)", () => {
    const result = parseFilenameMetadata("Author - Title - Subtitle.epub");
    expect(result).toEqual({ suggestedAuthor: "Author", suggestedTitle: "Title - Subtitle" });
  });

  it("handles filename with no extension", () => {
    const result = parseFilenameMetadata("Author - Title");
    expect(result).toEqual({ suggestedAuthor: "Author", suggestedTitle: "Title" });
  });

  it("handles extra whitespace around dash separator", () => {
    const result = parseFilenameMetadata("Author   -   Title.epub");
    expect(result).toEqual({ suggestedAuthor: "Author", suggestedTitle: "Title" });
  });

  it("handles brackets with spaces", () => {
    const result = parseFilenameMetadata("My Book [ Jane Doe ].epub");
    expect(result).toEqual({ suggestedTitle: "My Book", suggestedAuthor: "Jane Doe" });
  });

  it("handles non-string inputs gracefully", () => {
    expect(parseFilenameMetadata(42)).toEqual({});
    expect(parseFilenameMetadata(false)).toEqual({});
  });
});
