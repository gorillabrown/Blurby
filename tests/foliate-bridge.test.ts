import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const SRC = path.resolve(__dirname, "..", "src/components/FoliatePageView.tsx");
const src = fs.readFileSync(SRC, "utf-8");
const READER_SRC = path.resolve(__dirname, "..", "src/components/ReaderContainer.tsx");
const readerSrc = fs.readFileSync(READER_SRC, "utf-8");
const PAGE_READER_CSS = path.resolve(__dirname, "..", "src/styles/page-reader.css");
const pageReaderCss = fs.readFileSync(PAGE_READER_CSS, "utf-8");

describe("Foliate bridge contracts (NARR-LAYER-1B)", () => {
  it("highlightWordByIndex accepts a flow hint and no-motion options", () => {
    expect(src).toContain('highlightWordByIndex: (wordIndex: number, styleHint?: "flow", options?: FoliateHighlightOptions) => boolean;');
  });

  it("does not render narration overlay element", () => {
    expect(src).not.toContain("foliate-narration-highlight");
    expect(src).not.toContain("ref={highlightRef}");
  });

  it("flow mode narration index uses flow cursor style", () => {
    expect(src).toContain('if ((readingMode !== "flow" && readingMode !== "narrate") || narrationWordIndex == null) return;');
    expect(src).toContain('applyVisualHighlightByIndex(narrationWordIndex, "flow", false);');
  });

  it("imperative highlight API keeps motion enabled only by default", () => {
    expect(src).toContain('return applyVisualHighlightByIndex(wordIndex, styleHint, options?.allowMotion ?? true);');
  });

  it("renders the shrinking Flow cursor only in real Flow mode, not Narrate's shared scroll surface", () => {
    expect(src).toContain('{flowMode && readingMode === "flow" && <div ref={flowCursorRef} className="flow-shrink-cursor" />}');
  });

  it("chunk visual scrolling follows active words at the selected zone center", () => {
    expect(src).toContain("const scrollKey = buildChunkReadingScrollKey(chunkReadingVisualState);");
    expect(src).toContain("topOffsetPx: getFlowFollowOffsetPx(),");
    expect(src).toContain("const getFlowFollowOffsetPx = useCallback((): number => {");
  });

  it("exposes a lower-right recenter box control for chunk visual modes", () => {
    expect(src).toContain("recenterChunkReadingBox: () => boolean;");
    expect(src).toContain('className="recenter-reading-box-btn"');
    expect(src).toContain('aria-label="Recenter reading box on current sentence"');
    expect(src).toContain("↩ Recenter box");
    expect(readerSrc).toContain("isReading={isBrowsedAway && isFlowSurfaceMode}");
    expect(pageReaderCss).toContain(".recenter-reading-box-btn");
    expect(pageReaderCss).toContain("position: absolute;");
    expect(pageReaderCss).toContain("z-index: 450;");
  });

  it("keeps the unmanaged Foliate host below the recenter button so clicks reach React", () => {
    expect(src).toContain('foliateHostRef.current.className = "foliate-host";');
    expect(pageReaderCss).toContain("isolation: isolate;");
    expect(pageReaderCss).toContain(".foliate-host");
    expect(pageReaderCss).toContain("z-index: 0;");
    expect(pageReaderCss).toContain("pointer-events: auto;");
  });

  it("selects a scrollable Foliate container instead of the first arbitrary shadow div", () => {
    expect(src).toContain("const pickScrollableElement =");
    expect(src).toContain("candidate.scrollHeight > candidate.clientHeight + 1");
    expect(src).toContain("scrollCandidates");
    expect(src).toContain("foliateView as HTMLElement");
  });
});
