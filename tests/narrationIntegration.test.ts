import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, "..", rel), "utf-8");

describe("flow narration integration (NARR-LAYER-1B)", () => {
  it("ReaderContainer treats narrate as the architectural narration-selected mode", () => {
    const src = read("src/components/ReaderContainer.tsx");
    expect(src).toContain("readingMode === \"narrate\"");
    expect(src).toContain("(readingMode === \"flow\" && isNarrating)");
    expect(src).toContain("(readingMode === \"page\" && settings.lastReadingMode === \"narrate\")");
    expect(src).not.toContain("(readingMode === \"page\" && settings.isNarrating === true)");
  });

  it("ReaderContainer passes flow narration index into FoliatePageView", () => {
    const src = read("src/components/ReaderContainer.tsx");
    expect(src).toContain("narrationWordIndex={isNarrating ? highlightedWordIndex : undefined}");
  });

  it("ReaderContainer treats narrate as a flow-surface mode during Foliate onLoad", () => {
    const src = read("src/components/ReaderContainer.tsx");
    expect(src).toContain("const isFlowSurfaceMode = mode === \"flow\" || mode === \"narrate\";");
    expect(src).toContain("if (!isFlowSurfaceMode) {");
    expect(src).not.toContain("onLoad={() => {\n        // Extract words from DOM after each section loads\n        // BUT NOT during active narration/flow — rebuilding the word array mid-mode\n        // shifts all data-word-index attributes, causing highlight/page jumps.\n        // Uses ref (not state) because this callback is captured in a closure at render time.\n        setTimeout(() => {\n          setFoliateRenderVersion((prev) => prev + 1);\n          const mode = readingModeRef.current;\n          if (mode !== \"flow\") {");
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
