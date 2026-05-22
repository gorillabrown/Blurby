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
    expect(src).toContain('highlightWordByIndex: (wordIndex: number, styleHint?: "flow" | "narrate", options?: FoliateHighlightOptions) => boolean;');
  });

  it("does not render narration overlay element", () => {
    expect(src).not.toContain("foliate-narration-highlight");
    expect(src).not.toContain("ref={highlightRef}");
  });

  it("narrate mode narration index uses a dedicated narrate cursor style", () => {
    expect(src).toContain('if ((readingMode !== "flow" && readingMode !== "narrate") || narrationWordIndex == null) return;');
    expect(src).toContain('applyVisualHighlightByIndex(narrationWordIndex, "narrate", false);');
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
    expect(pageReaderCss).toContain(".recenter-reading-box-btn");
    expect(pageReaderCss).toContain("position: absolute;");
    expect(pageReaderCss).toContain("z-index: 450;");
  });

  it("recenters hard word selections in the reading window immediately", () => {
    expect(src).toContain("const centerResolvedTokenInReadingWindow = useCallback(");
    expect(src).toContain("centerResolvedTokenInReadingWindowRef.current(doc, resolvedToken);");
    expect(src).toContain("const zoneOffset = getFlowFollowOffsetPx();");
    expect(src).toContain("lastScrollFollowPosRef.current = finalPos;");
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

  it("shows jump-back based on browse-away state rather than active reading only", () => {
    expect(src).toContain("showJumpBackToAnchor");
    expect(src).toContain("onJumpBackToAnchor");
    expect(src).toContain("Jump back");
    expect(src).not.toContain("{isReading && onJumpToHighlight && (");
  });

  it("marks user browsing in Page, Focus, Flow, and Narrate surfaces", () => {
    expect(src).toContain('mode === "page"');
    expect(src).toContain('mode === "focus"');
    expect(src).toContain('mode === "flow"');
    expect(src).toContain('mode === "narrate"');
    expect(src).toContain("onUserBrowseAwayRef.current?.()");
  });

  it("documents Focus paused versus active surface ownership", () => {
    expect(readerSrc).toContain('const showFocusOverlay = readingMode === "focus" && focusPlaying');
    expect(readerSrc).toContain('readingMode === "focus" || readingMode === "flow" || readingMode === "narrate"');
  });

  it("imports and calls jumpFoliateToWordAnchor for jump-back", () => {
    expect(readerSrc).toContain("jumpFoliateToWordAnchor");
    expect(readerSrc).toContain("handleJumpBackToPersistentWord");
    expect(readerSrc).toContain("persistentWordIndexRef.current");
  });

  it("routes Foliate displacement detection through markUserBrowsingAway", () => {
    expect(src).toContain("markUserBrowsingAway()");
    expect(src).not.toMatch(/displacement.*userBrowsingRef\.current\s*=\s*true/);
  });

  it("routes keyboard browse-away through markUserBrowsingAway", () => {
    const keyboardSection = src.slice(src.indexOf("ArrowRight"));
    expect(keyboardSection).toContain("markUserBrowsingAway()");
  });

  it("passes showJumpBackToAnchor={isBrowsedAway} to FoliatePageView", () => {
    expect(readerSrc).toContain("showJumpBackToAnchor={isBrowsedAway}");
  });

  it("uses mode-aware highlight class for click, selection, and return-to-narration paths", () => {
    expect(src).toContain("resolveFoliateWordHighlightClass(readingModeRef.current)");
    expect(src).not.toMatch(/classList\.add\("page-word--highlighted"\)/);
  });
});
