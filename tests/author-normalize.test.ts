import { describe, it, expect } from "vitest";
import { normalizeAuthor } from "../src/utils/authorNormalize";

describe("normalizeAuthor", () => {
  // Basic normalization
  it("normalizes 'First Last' to 'Last, First'", () => {
    expect(normalizeAuthor("John Smith")).toBe("Smith, John");
  });

  it("is idempotent — already normalized names pass through", () => {
    expect(normalizeAuthor("Smith, John")).toBe("Smith, John");
  });

  // Prefix handling
  it("handles 'de' prefix — 'João de Souza' → 'de Souza, João'", () => {
    expect(normalizeAuthor("João de Souza")).toBe("de Souza, João");
  });

  it("handles 'van' prefix — 'Vincent van Gogh' → 'van Gogh, Vincent'", () => {
    expect(normalizeAuthor("Vincent van Gogh")).toBe("van Gogh, Vincent");
  });

  it("handles 'von' prefix — 'Ludwig von Beethoven' → 'von Beethoven, Ludwig'", () => {
    expect(normalizeAuthor("Ludwig von Beethoven")).toBe("von Beethoven, Ludwig");
  });

  it("handles 'al-' prefix — 'Ahmed al Rashid' → 'al Rashid, Ahmed'", () => {
    expect(normalizeAuthor("Ahmed al Rashid")).toBe("al Rashid, Ahmed");
  });

  // Multi-author
  it("normalizes multiple authors separated by 'and'", () => {
    expect(normalizeAuthor("Alice Smith and Bob Jones")).toBe("Smith, Alice; Jones, Bob");
  });

  it("normalizes multiple authors separated by '&'", () => {
    expect(normalizeAuthor("Alice Smith & Bob Jones")).toBe("Smith, Alice; Jones, Bob");
  });

  it("handles already-normalized multi-author with semicolons", () => {
    expect(normalizeAuthor("Smith, Alice; Jones, Bob")).toBe("Smith, Alice; Jones, Bob");
  });

  // Edge cases
  it("returns empty string for undefined", () => {
    expect(normalizeAuthor(undefined)).toBe("");
  });

  it("returns empty string for null", () => {
    expect(normalizeAuthor(null)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(normalizeAuthor("")).toBe("");
  });

  it("returns single-word names unchanged", () => {
    expect(normalizeAuthor("Plato")).toBe("Plato");
  });

  it("trims whitespace", () => {
    expect(normalizeAuthor("  John Smith  ")).toBe("Smith, John");
  });

  // Three-part names without prefix
  it("treats last word as last name for three-part names", () => {
    expect(normalizeAuthor("Mary Jane Watson")).toBe("Watson, Mary Jane");
  });
});

describe("normalizeAuthor — CJS mirror", () => {
  // Also verify the CommonJS version used by main process
  it("CJS normalizeAuthor matches TS version", async () => {
    const cjs = await import("../main/author-normalize.js");
    expect(cjs.normalizeAuthor("John Smith")).toBe("Smith, John");
    expect(cjs.normalizeAuthor("Smith, John")).toBe("Smith, John");
    expect(cjs.normalizeAuthor("João de Souza")).toBe("de Souza, João");
    expect(cjs.normalizeAuthor("Alice Smith and Bob Jones")).toBe("Smith, Alice; Jones, Bob");
    expect(cjs.normalizeAuthor(undefined)).toBe("");
    expect(cjs.normalizeAuthor("Plato")).toBe("Plato");
  });
});
