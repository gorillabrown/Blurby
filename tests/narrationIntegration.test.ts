import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, "..", rel), "utf-8");

describe("flow narration integration (NARR-LAYER-1B)", () => {
  it("ReaderContainer treats flow+narrating as narration-selected", () => {
    const src = read("src/components/ReaderContainer.tsx");
    expect(src).toContain("(readingMode === \"flow\" && isNarrating)");
    expect(src).toContain("(readingMode === \"page\" && settings.isNarrating === true)");
  });

  it("ReaderContainer passes flow narration index into FoliatePageView", () => {
    const src = read("src/components/ReaderContainer.tsx");
    expect(src).toContain("narrationWordIndex={isNarrating ? highlightedWordIndex : undefined}");
  });

  it("useReaderMode no longer exposes startNarration", () => {
    const src = read("src/hooks/useReaderMode.ts");
    expect(src).not.toContain("startNarration");
    expect(src).toContain("toggleNarrationInFlow");
  });

  it("useReaderMode no longer accepts narration in mode selection", () => {
    const src = read("src/hooks/useReaderMode.ts");
    expect(src).toContain("handleSelectMode = useCallback((mode: \"focus\" | \"flow\") => {");
    expect(src).not.toContain("\"focus\" | \"flow\" | \"narration\"");
  });

  it("useReaderMode cycles flow and focus only", () => {
    const src = read("src/hooks/useReaderMode.ts");
    expect(src).toContain("const next = current === \"flow\" ? \"focus\" : \"flow\";");
  });
});
