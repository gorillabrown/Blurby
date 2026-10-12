import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// READER-MODE-SEPARATION-2 (design §D.5): parallel assertion at the new owner. The router's openDocument
// (src/reader/useReaderModeOrchestrator.ts) opens every document generation in Page from the initial handoff.
describe("router document open contract (new owner)", () => {
  it("opens every book in Page mode from the initial handoff", () => {
    const source = readFileSync("src/reader/useReaderModeOrchestrator.ts", "utf8");

    expect(source).toContain('mount("page", doc, createInitialHandoff(doc, total), "silent");');
    expect(source).not.toContain("resolveRestoredMode");
    expect(source).not.toContain("const restoredMode =");
  });
});
