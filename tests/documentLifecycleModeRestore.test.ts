import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("document lifecycle mode restore contract", () => {
  it("opens every book in Page mode instead of restoring Focus, Flow, or Narrate", () => {
    const source = readFileSync("src/hooks/useDocumentLifecycle.ts", "utf8");

    expect(source).toContain('setReadingMode("page")');
    expect(source).not.toContain("resolveRestoredMode");
    expect(source).not.toContain("const restoredMode =");
  });

  it("keeps word 0 as an explicit resume anchor on book open", () => {
    const source = readFileSync("src/hooks/useDocumentLifecycle.ts", "utf8");

    expect(source).toContain("resumeAnchorRef.current = restoredWordIndex");
    expect(source).not.toContain("resumeAnchorRef.current = (activeDoc.position || 0) > 0");
  });
});
