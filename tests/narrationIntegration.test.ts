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

  it("ReaderContainer passes spoken-word truth into FoliatePageView while narration is active", () => {
    const src = read("src/components/ReaderContainer.tsx");
    expect(src).toContain("readingMode={readingMode}");
    expect(src).toContain("flowMode={isFlowSurfaceMode}");
    expect(src).toContain("isNarrating={isNarrating && narration.speaking && !narration.warming}");
    expect(src).toContain("narrationWordIndex={narration.speaking ? narration.cursorWordIndex : undefined}");
    expect(src).toContain("getAudioProgress={narration.speaking ? narration.getAudioProgress : null}");
  });

  it("ReaderContainer initializes narration before any derived mode state reads narration.speaking", () => {
    const src = read("src/components/ReaderContainer.tsx");
    const narrationDecl = src.indexOf("const narration = useNarration({");
    const modePlayingDecl = src.indexOf("const modePlaying =");
    const activelyReadingDecl = src.indexOf("const isActivelyReading =");

    expect(narrationDecl).toBeGreaterThan(-1);
    expect(modePlayingDecl).toBeGreaterThan(-1);
    expect(activelyReadingDecl).toBeGreaterThan(-1);
    expect(narrationDecl).toBeLessThan(modePlayingDecl);
    expect(narrationDecl).toBeLessThan(activelyReadingDecl);
  });

  it("ReaderContainer treats narrate as a flow-surface mode during Foliate onLoad", () => {
    const src = read("src/components/ReaderContainer.tsx");
    expect(src).toContain("const isFlowSurfaceMode = mode === \"flow\" || mode === \"narrate\";");
    expect(src).toContain("if (!isFlowSurfaceMode) {");
    expect(src).not.toContain("onLoad={() => {\n        // Extract words from DOM after each section loads\n        // BUT NOT during active narration/flow — rebuilding the word array mid-mode\n        // shifts all data-word-index attributes, causing highlight/page jumps.\n        // Uses ref (not state) because this callback is captured in a closure at render time.\n        setTimeout(() => {\n          setFoliateRenderVersion((prev) => prev + 1);\n          const mode = readingModeRef.current;\n          if (mode !== \"flow\") {");
  });

  it("ReaderContainer blocks passive relocate downgrades during narrate", () => {
    const src = read("src/components/ReaderContainer.tsx");
    expect(src).toContain("if (mode !== \"flow\" && mode !== \"narrate\" && !hasResumeAnchor) {");
  });

  it("useReaderMode no longer exposes startNarration", () => {
    const src = read("src/hooks/useReaderMode.ts");
    expect(src).not.toContain("startNarration");
    expect(src).toContain("toggleNarrationInFlow");
  });

  it("useReaderMode allows explicit paused narrate selection", () => {
    const src = read("src/hooks/useReaderMode.ts");
    expect(src).toContain("handleSelectMode: (mode: \"focus\" | \"flow\" | \"narrate\") => void;");
    expect(src).toContain("const handleSelectMode = useCallback((mode: \"focus\" | \"flow\" | \"narrate\") => {");
  });

  it("useReaderMode cycles focus, flow, and narrate without auto-starting them", () => {
    const src = read("src/hooks/useReaderMode.ts");
    expect(src).toContain("if (mode === \"focus\") return \"flow\";");
    expect(src).toContain("if (mode === \"flow\") return \"narrate\";");
    expect(src).toContain("return \"focus\";");
  });

  it("useReaderMode keeps flow playback dormant when starting narrate", () => {
    const src = read("src/hooks/useReaderMode.ts");
    expect(src).toContain("if (targetMode === \"flow\") {");
    expect(src).toContain("setFlowPlaying(true);");
    expect(src).toContain("modeInstance.startMode(\"flow\", startWord, effectiveWords, pBreaks);");
  });
});
