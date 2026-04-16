// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { FlowScrollEngine } from "../src/utils/FlowScrollEngine";

function makeContainer(): HTMLElement {
  const container = document.createElement("div");
  Object.defineProperty(container, "clientHeight", { value: 600, configurable: true });
  Object.defineProperty(container, "clientWidth", { value: 400, configurable: true });
  container.getBoundingClientRect = () => ({
    top: 0,
    bottom: 600,
    left: 0,
    right: 400,
    width: 400,
    height: 600,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  }) as DOMRect;
  container.scrollTo = vi.fn() as unknown as typeof container.scrollTo;

  const positions = [
    { idx: 0, top: 100, left: 20, right: 80 },
    { idx: 1, top: 100, left: 90, right: 150 },
    { idx: 2, top: 100, left: 160, right: 220 },
    { idx: 3, top: 140, left: 20, right: 80 },
    { idx: 4, top: 140, left: 90, right: 150 },
  ];

  for (const pos of positions) {
    const span = document.createElement("span");
    span.setAttribute("data-word-index", String(pos.idx));
    span.getBoundingClientRect = () => ({
      top: pos.top,
      bottom: pos.top + 18,
      left: pos.left,
      right: pos.right,
      width: pos.right - pos.left,
      height: 18,
      x: pos.left,
      y: pos.top,
      toJSON: () => ({}),
    }) as DOMRect;
    container.appendChild(span);
  }

  return container;
}

function makeCursor(): HTMLDivElement {
  const cursor = document.createElement("div");
  cursor.style.width = "200px";
  return cursor;
}

describe("NARR-LAYER-1A — FlowScrollEngine follower mode", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("setFollowerMode(true) marks followerMode in engine state", () => {
    const engine = new FlowScrollEngine({ onWordAdvance: vi.fn(), onComplete: vi.fn() });
    const container = makeContainer();
    const cursor = makeCursor();
    engine.start(container, cursor, 0, 300);
    engine.setFollowerMode(true);
    expect(engine.getState().followerMode).toBe(true);
  });

  it("setFollowerMode(false) clears followerMode in engine state", () => {
    const engine = new FlowScrollEngine({ onWordAdvance: vi.fn(), onComplete: vi.fn() });
    const container = makeContainer();
    const cursor = makeCursor();
    engine.start(container, cursor, 0, 300);
    engine.setFollowerMode(true);
    engine.setFollowerMode(false);
    expect(engine.getState().followerMode).toBe(false);
  });

  it("followWord updates the tracked word index", () => {
    const engine = new FlowScrollEngine({ onWordAdvance: vi.fn(), onComplete: vi.fn() });
    const container = makeContainer();
    const cursor = makeCursor();
    engine.start(container, cursor, 0, 300);
    engine.setFollowerMode(true);
    engine.followWord(1);
    expect(engine.getState().wordIndex).toBe(1);
  });

  it("followWord updates the tracked line index", () => {
    const engine = new FlowScrollEngine({ onWordAdvance: vi.fn(), onComplete: vi.fn() });
    const container = makeContainer();
    const cursor = makeCursor();
    engine.start(container, cursor, 0, 300);
    engine.setFollowerMode(true);
    engine.followWord(3);
    expect(engine.getState().lineIndex).toBe(1);
  });

  it("followWord uses the remaining-line-width formula", () => {
    const engine = new FlowScrollEngine({ onWordAdvance: vi.fn(), onComplete: vi.fn() });
    const container = makeContainer();
    const cursor = makeCursor();
    engine.start(container, cursor, 0, 300);
    engine.setFollowerMode(true);
    engine.followWord(1);
    expect(cursor.style.width).toBe("100px");
  });

  it("followWord calls onWordAdvance with the narrated word", () => {
    const onWordAdvance = vi.fn();
    const engine = new FlowScrollEngine({ onWordAdvance, onComplete: vi.fn() });
    const container = makeContainer();
    const cursor = makeCursor();
    engine.start(container, cursor, 0, 300);
    engine.setFollowerMode(true);
    engine.followWord(4);
    expect(onWordAdvance).toHaveBeenCalledWith(4);
  });

  it("followWord is a no-op when follower mode is disabled", () => {
    const onWordAdvance = vi.fn();
    const engine = new FlowScrollEngine({ onWordAdvance, onComplete: vi.fn() });
    const container = makeContainer();
    const cursor = makeCursor();
    engine.start(container, cursor, 0, 300);
    engine.followWord(2);
    expect(engine.getState().wordIndex).toBe(0);
    expect(onWordAdvance).not.toHaveBeenCalled();
  });

  it("follower mode cursor stays visible while tracking narration", () => {
    const engine = new FlowScrollEngine({ onWordAdvance: vi.fn(), onComplete: vi.fn() });
    const container = makeContainer();
    const cursor = makeCursor();
    engine.start(container, cursor, 0, 300);
    engine.setFollowerMode(true);
    engine.followWord(2);
    expect(cursor.style.display).toBe("block");
  });
});

describe("NARR-LAYER-1A — source contracts", () => {
  const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, "..", rel), "utf-8");

  it("useReaderMode defines toggleNarrationInFlow", () => {
    const src = read("src/hooks/useReaderMode.ts");
    expect(src).toContain("const toggleNarrationInFlow = useCallback(");
  });

  it("useReaderMode starts cursor-driven narration from flow mode", () => {
    const src = read("src/hooks/useReaderMode.ts");
    expect(src).toContain('if (readingMode !== "flow") return;');
    expect(src).toContain("narration.startCursorDriven(");
  });

  it("useReaderMode remembers pending narration resume when pausing flow narration", () => {
    const src = read("src/hooks/useReaderMode.ts");
    expect(src).toContain('if (readingMode === "flow" && isNarratingRef.current)');
    expect(src).toContain("pendingNarrationResumeRef.current = true;");
  });

  it("useFlowScrollSync enables follower mode when flow narration is active", () => {
    const src = read("src/hooks/useFlowScrollSync.ts");
    expect(src).toContain("engine.setFollowerMode(true);");
    expect(src).toContain("engine.followWord(highlightedWordIndex);");
  });

  it("useFlowScrollSync wires narration section-end handling", () => {
    const src = read("src/hooks/useFlowScrollSync.ts");
    expect(src).toContain("narration.setOnSectionEnd(() => {");
    expect(src).toContain("pendingFlowResumeRef.current = true;");
  });

  it("FoliatePageView suppresses the narration overlay while flow mode is active", () => {
    const src = read("src/components/FoliatePageView.tsx");
    expect(src).toContain('if (readingModeRef.current === "flow") {');
    expect(src).toContain("hideNarrationOverlay();");
  });

  it("ReaderBottomBar treats flow+narrating as narration-selected for TTS controls", () => {
    const src = read("src/components/ReaderBottomBar.tsx");
    expect(src).toContain('(readingMode === "flow" && isNarrating)');
    expect(src).toContain("Narrating · ");
  });

  it("ReaderContainer adds an isNarrating state", () => {
    const src = read("src/components/ReaderContainer.tsx");
    expect(src).toContain("const [isNarrating, setIsNarrating] = useState(false);");
  });

  it("ReaderContainer passes isNarrating into ReaderBottomBar", () => {
    const src = read("src/components/ReaderContainer.tsx");
    expect(src).toContain("isNarrating={isNarrating}");
  });

  it("keyboard shortcuts reserve N for flow narration toggle", () => {
    const src = read("src/hooks/useKeyboardShortcuts.ts");
    expect(src).toContain('if (e.code === "KeyN" && !e.shiftKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); s.toggleNarration?.(); return; }');
    expect(src).toContain('if (!isPage && s.readerMode !== "flow" && e.code === "KeyN"');
  });
});
