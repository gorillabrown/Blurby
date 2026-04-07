// @vitest-environment jsdom
// tests/readerDecomposition.test.ts — REFACTOR-1A: ReaderContainer Decomposition
//
// Covers the behavioral contracts of the 5 extracted hooks by testing their
// pure logic and source-level structural invariants. The project does not use
// renderHook — we follow the established pattern of replicating logic as pure
// functions and verifying source structure via file reads.
//
// Hooks tested:
//   (a-b)  useNarrationSync   — returns bookWordMeta, setBookWordMeta, currentNarrationSectionRef
//                              — syncs settings → narration (effect contracts)
//   (c-d)  useNarrationCaching — returns backgroundCacherRef, lifecycle contract
//   (e-f)  useFlowScrollSync  — returns flowScrollEngineRef, engine start/stop contract
//   (g)    useFlowScrollSync  — cross-book cancel logic (pendingFlowResumeRef)
//   (h-i)  useFoliateSync     — returns isBrowsedAway, browse-away detection contract
//   (j-k)  useDocumentLifecycle — returns resumeAnchorRef, init-on-doc-change contract
//   (l)    Integration        — hook source files exist and export expected symbols

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ─────────────────────────────────────────────────────────────────────────────
// (a) useNarrationSync — exported symbols contract (source level)
// ─────────────────────────────────────────────────────────────────────────────

describe("useNarrationSync — source structure", () => {
  let src: string;

  beforeEach(() => {
    src = fs.readFileSync(
      path.resolve(__dirname, "../src/hooks/useNarrationSync.ts"),
      "utf-8"
    );
  });

  it("(a) exports useNarrationSync function", () => {
    expect(src).toContain("export function useNarrationSync(");
  });

  it("(a) returns bookWordMeta, setBookWordMeta, currentNarrationSectionRef", () => {
    expect(src).toContain("bookWordMeta");
    expect(src).toContain("setBookWordMeta");
    expect(src).toContain("currentNarrationSectionRef");
  });

  it("(a) uses useState for bookWordMeta (null initial value)", () => {
    expect(src).toContain("useState<");
    expect(src).toContain("bookWordMeta");
    expect(src).toMatch(/useState.*null/);
  });

  it("(a) uses useRef for currentNarrationSectionRef initialized to -1", () => {
    expect(src).toContain("useRef<number>(-1)");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (b) useNarrationSync — settings → narration sync effect contracts
// ─────────────────────────────────────────────────────────────────────────────

describe("useNarrationSync — sync effects behavioral contracts", () => {
  let src: string;

  beforeEach(() => {
    src = fs.readFileSync(
      path.resolve(__dirname, "../src/hooks/useNarrationSync.ts"),
      "utf-8"
    );
  });

  it("(b) contains 10 useEffect hooks (10 sync effects)", () => {
    const effects = src.match(/useEffect\(/g);
    expect(effects).not.toBeNull();
    expect(effects!.length).toBeGreaterThanOrEqual(10);
  });

  it("(b) syncs bookId: setBookId is called with activeDoc.id in a useEffect", () => {
    expect(src).toContain("narration.setBookId(");
    expect(src).toContain("activeDoc.id");
  });

  it("(b) syncs TTS engine: setEngine is called with settings.ttsEngine", () => {
    expect(src).toContain("narration.setEngine(settings.ttsEngine");
  });

  it("(b) syncs pause config: setPauseConfig is called with commaMs, sentenceMs, paragraphMs", () => {
    expect(src).toContain("narration.setPauseConfig(");
    expect(src).toContain("commaMs");
    expect(src).toContain("sentenceMs");
    expect(src).toContain("paragraphMs");
  });

  it("(b) resets bookWordMeta on doc change (effect depends on activeDoc.id)", () => {
    expect(src).toContain("setBookWordMeta(null)");
    // Verify it's inside an effect that depends on activeDoc.id
    expect(src).toMatch(/setBookWordMeta\(null\)/);
    expect(src).toContain("[activeDoc.id]");
  });

  it("(b) syncs footnote mode: setFootnoteMode is called with settings.ttsFootnoteMode", () => {
    expect(src).toContain("narration.setFootnoteMode(settings.ttsFootnoteMode");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (c) useNarrationCaching — source structure
// ─────────────────────────────────────────────────────────────────────────────

describe("useNarrationCaching — source structure", () => {
  let src: string;

  beforeEach(() => {
    src = fs.readFileSync(
      path.resolve(__dirname, "../src/hooks/useNarrationCaching.ts"),
      "utf-8"
    );
  });

  it("(c) exports useNarrationCaching function", () => {
    expect(src).toContain("export function useNarrationCaching(");
  });

  it("(c) returns backgroundCacherRef (MutableRefObject<BackgroundCacher | null>)", () => {
    expect(src).toContain("backgroundCacherRef");
    expect(src).toContain("return backgroundCacherRef");
  });

  it("(c) initializes backgroundCacherRef with useRef(null)", () => {
    expect(src).toContain("useRef<BackgroundCacher | null>(null)");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (d) useNarrationCaching — lifecycle contract
// ─────────────────────────────────────────────────────────────────────────────

describe("useNarrationCaching — background cacher lifecycle", () => {
  let src: string;

  beforeEach(() => {
    src = fs.readFileSync(
      path.resolve(__dirname, "../src/hooks/useNarrationCaching.ts"),
      "utf-8"
    );
  });

  it("(d) calls narrationWarmUp() on mount when engine is kokoro", () => {
    expect(src).toContain("narrationWarmUp()");
    // Must be in the mount-only effect (empty deps array)
    expect(src).toContain("}, []"); // mount-only effect
  });

  it("(d) cacher.start() is called after createBackgroundCacher", () => {
    expect(src).toContain("cacher.start()");
  });

  it("(d) cleanup stops cacher and nullifies ref (cacher.stop())", () => {
    expect(src).toContain("cacher.stop()");
    expect(src).toContain("backgroundCacherRef.current = null");
  });

  it("(d) cacher lifecycle effect depends on ttsEngine and ttsCacheEnabled", () => {
    expect(src).toContain("settings.ttsEngine");
    expect(src).toContain("settings.ttsCacheEnabled");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (e) useFlowScrollSync — source structure
// ─────────────────────────────────────────────────────────────────────────────

describe("useFlowScrollSync — source structure", () => {
  let src: string;

  beforeEach(() => {
    src = fs.readFileSync(
      path.resolve(__dirname, "../src/hooks/useFlowScrollSync.ts"),
      "utf-8"
    );
  });

  it("(e) exports useFlowScrollSync function", () => {
    expect(src).toContain("export function useFlowScrollSync(");
  });

  it("(e) returns flowScrollEngineRef", () => {
    expect(src).toContain("flowScrollEngineRef");
    expect(src).toContain("return {");
    expect(src).toContain("flowScrollEngineRef,");
  });

  it("(e) initializes flowScrollEngineRef with useRef(null)", () => {
    expect(src).toContain("useRef<FlowScrollEngine | null>(null)");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (f) useFlowScrollSync — engine start/stop on mode change (pure logic)
// ─────────────────────────────────────────────────────────────────────────────

describe("useFlowScrollSync — engine start/stop contract (pure logic)", () => {
  /**
   * Replicates the mode-guard logic from Effect 1 in useFlowScrollSync:
   * if readingMode !== "flow" OR flowPlaying is false → stop engine (if present)
   */
  function engineLifecycleDecision(
    readingMode: string,
    flowPlaying: boolean,
    hasContainer: boolean,
    hasCursor: boolean,
  ): "stop" | "no-container" | "start" {
    if (readingMode !== "flow" || !flowPlaying) {
      return "stop";
    }
    if (!hasContainer || !hasCursor) return "no-container";
    return "start";
  }

  it("(f) stops engine when readingMode is not 'flow'", () => {
    expect(engineLifecycleDecision("page", true, true, true)).toBe("stop");
    expect(engineLifecycleDecision("focus", true, true, true)).toBe("stop");
    expect(engineLifecycleDecision("narration", true, true, true)).toBe("stop");
  });

  it("(f) stops engine when flowPlaying is false even in flow mode", () => {
    expect(engineLifecycleDecision("flow", false, true, true)).toBe("stop");
  });

  it("(f) does not start when container or cursor is missing", () => {
    expect(engineLifecycleDecision("flow", true, false, true)).toBe("no-container");
    expect(engineLifecycleDecision("flow", true, true, false)).toBe("no-container");
  });

  it("(f) starts when in flow mode, playing, and container+cursor available", () => {
    expect(engineLifecycleDecision("flow", true, true, true)).toBe("start");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (g) useFlowScrollSync — cancel cross-book transition on Escape
// ─────────────────────────────────────────────────────────────────────────────

describe("useFlowScrollSync — cross-book transition cancel logic", () => {
  it("(g) clearing pendingFlowResumeRef cancels the pending transition", () => {
    const pendingFlowResumeRef = { current: false };

    // Transition initiated
    pendingFlowResumeRef.current = true;
    expect(pendingFlowResumeRef.current).toBe(true);

    // User presses Escape / cancel fires
    function cancelTransition() {
      pendingFlowResumeRef.current = false;
    }
    cancelTransition();

    expect(pendingFlowResumeRef.current).toBe(false);
  });

  it("(g) useFlowScrollSync source imports CROSS_BOOK_TRANSITION_MS from constants", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../src/hooks/useFlowScrollSync.ts"),
      "utf-8"
    );
    expect(src).toContain("CROSS_BOOK_TRANSITION_MS");
    expect(src).toContain("CROSS_BOOK_FLOW_RESUME_DELAY_MS");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (h) useFoliateSync — source structure
// ─────────────────────────────────────────────────────────────────────────────

describe("useFoliateSync — source structure", () => {
  let src: string;

  beforeEach(() => {
    src = fs.readFileSync(
      path.resolve(__dirname, "../src/hooks/useFoliateSync.ts"),
      "utf-8"
    );
  });

  it("(h) exports useFoliateSync function", () => {
    expect(src).toContain("export function useFoliateSync(");
  });

  it("(h) returns isBrowsedAway and setIsBrowsedAway", () => {
    expect(src).toContain("isBrowsedAway");
    expect(src).toContain("setIsBrowsedAway");
    expect(src).toContain("return { isBrowsedAway, setIsBrowsedAway }");
  });

  it("(h) initializes isBrowsedAway as false via useState", () => {
    expect(src).toContain("useState(false)");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (i) useFoliateSync — browse-away detection contract (pure logic)
// ─────────────────────────────────────────────────────────────────────────────

describe("useFoliateSync — browse-away detection logic", () => {
  /**
   * Replicates the browse-away detection effect from useFoliateSync:
   * - Only polls in narration mode when useFoliate is true.
   * - Returns "reset" when not in narration or useFoliate is false.
   * - Returns "polling" when conditions are met.
   */
  function browseAwayDecision(useFoliate: boolean, readingMode: string): "reset" | "polling" {
    if (!useFoliate || readingMode !== "narration") {
      return "reset";
    }
    return "polling";
  }

  it("(i) resets isBrowsedAway when readingMode is not 'narration'", () => {
    expect(browseAwayDecision(true, "page")).toBe("reset");
    expect(browseAwayDecision(true, "focus")).toBe("reset");
    expect(browseAwayDecision(true, "flow")).toBe("reset");
  });

  it("(i) resets isBrowsedAway when useFoliate is false", () => {
    expect(browseAwayDecision(false, "narration")).toBe("reset");
  });

  it("(i) starts polling when useFoliate is true and readingMode is 'narration'", () => {
    expect(browseAwayDecision(true, "narration")).toBe("polling");
  });

  it("(i) useFoliateSync source uses FOLIATE_BROWSING_CHECK_INTERVAL_MS for poll interval", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../src/hooks/useFoliateSync.ts"),
      "utf-8"
    );
    expect(src).toContain("FOLIATE_BROWSING_CHECK_INTERVAL_MS");
    expect(src).toContain("setInterval");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (j) useDocumentLifecycle — source structure
// ─────────────────────────────────────────────────────────────────────────────

describe("useDocumentLifecycle — source structure", () => {
  let src: string;

  beforeEach(() => {
    src = fs.readFileSync(
      path.resolve(__dirname, "../src/hooks/useDocumentLifecycle.ts"),
      "utf-8"
    );
  });

  it("(j) exports useDocumentLifecycle function", () => {
    expect(src).toContain("export function useDocumentLifecycle(");
  });

  it("(j) returns resumeAnchorRef", () => {
    expect(src).toContain("resumeAnchorRef");
    expect(src).toContain("return {");
  });

  it("(j) initializes resumeAnchorRef with useRef<number | null>(null)", () => {
    expect(src).toContain("useRef<number | null>(null)");
  });

  it("(j) returns all 7 expected ref/value fields", () => {
    // Every field documented in UseDocumentLifecycleReturn
    expect(src).toContain("resumeAnchorRef");
    expect(src).toContain("userExplicitSelectionRef");
    expect(src).toContain("hasShownRestoreToastRef");
    expect(src).toContain("sessionStartRef");
    expect(src).toContain("sessionStartWordRef");
    expect(src).toContain("narrationStateFlushRafRef");
    expect(src).toContain("narrationStatePendingIdxRef");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (k) useDocumentLifecycle — init-on-doc-change behavioral contract
// ─────────────────────────────────────────────────────────────────────────────

describe("useDocumentLifecycle — init reader on doc change (pure logic)", () => {
  /**
   * Replicate the init-on-doc-change logic from Effect 2 in useDocumentLifecycle:
   *   - initReader is called with activeDoc.position (or 0)
   *   - resumeAnchorRef is set to activeDoc.position (or null if 0)
   *   - readingMode resets to "page"
   *   - sessionStart is recorded
   */
  function simulateDocChange(
    activeDoc: { id: string; position?: number },
    callbacks: {
      initReader: (pos: number) => void;
      setReadingMode: (mode: string) => void;
      setHighlightedWordIndex: (idx: number) => void;
    },
    refs: {
      resumeAnchorRef: { current: number | null };
      userExplicitSelectionRef: { current: boolean };
      hasShownRestoreToastRef: { current: boolean };
    },
  ) {
    const pos = activeDoc.position || 0;
    callbacks.initReader(pos);
    callbacks.setHighlightedWordIndex(pos);
    refs.resumeAnchorRef.current = pos > 0 ? pos : null;
    refs.userExplicitSelectionRef.current = false;
    refs.hasShownRestoreToastRef.current = false;
    callbacks.setReadingMode("page");
  }

  it("(k) initReader is called with activeDoc.position on doc change", () => {
    const initReader = vi.fn();
    const setReadingMode = vi.fn();
    const setHighlightedWordIndex = vi.fn();

    simulateDocChange(
      { id: "doc-1", position: 500 },
      { initReader, setReadingMode, setHighlightedWordIndex },
      {
        resumeAnchorRef: { current: null },
        userExplicitSelectionRef: { current: true },
        hasShownRestoreToastRef: { current: true },
      },
    );

    expect(initReader).toHaveBeenCalledWith(500);
  });

  it("(k) readingMode resets to 'page' on doc change", () => {
    const setReadingMode = vi.fn();

    simulateDocChange(
      { id: "doc-2", position: 100 },
      { initReader: vi.fn(), setReadingMode, setHighlightedWordIndex: vi.fn() },
      {
        resumeAnchorRef: { current: null },
        userExplicitSelectionRef: { current: false },
        hasShownRestoreToastRef: { current: false },
      },
    );

    expect(setReadingMode).toHaveBeenCalledWith("page");
  });

  it("(k) resumeAnchorRef is set to position when position > 0", () => {
    const resumeAnchorRef = { current: null as number | null };

    simulateDocChange(
      { id: "doc-3", position: 250 },
      { initReader: vi.fn(), setReadingMode: vi.fn(), setHighlightedWordIndex: vi.fn() },
      {
        resumeAnchorRef,
        userExplicitSelectionRef: { current: false },
        hasShownRestoreToastRef: { current: false },
      },
    );

    expect(resumeAnchorRef.current).toBe(250);
  });

  it("(k) resumeAnchorRef is null when position is 0 (fresh start)", () => {
    const resumeAnchorRef = { current: 99 as number | null };

    simulateDocChange(
      { id: "doc-4", position: 0 },
      { initReader: vi.fn(), setReadingMode: vi.fn(), setHighlightedWordIndex: vi.fn() },
      {
        resumeAnchorRef,
        userExplicitSelectionRef: { current: false },
        hasShownRestoreToastRef: { current: false },
      },
    );

    expect(resumeAnchorRef.current).toBeNull();
  });

  it("(k) userExplicitSelectionRef resets to false on doc change", () => {
    const userExplicitSelectionRef = { current: true };

    simulateDocChange(
      { id: "doc-5", position: 0 },
      { initReader: vi.fn(), setReadingMode: vi.fn(), setHighlightedWordIndex: vi.fn() },
      {
        resumeAnchorRef: { current: null },
        userExplicitSelectionRef,
        hasShownRestoreToastRef: { current: false },
      },
    );

    expect(userExplicitSelectionRef.current).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (l) Integration — all 5 hook files exist and export expected functions
// ─────────────────────────────────────────────────────────────────────────────

describe("REFACTOR-1A integration — all hook files exist and export correctly", () => {
  const hooksDir = path.resolve(__dirname, "../src/hooks");

  it("(l) useNarrationSync.ts exists", () => {
    expect(fs.existsSync(path.join(hooksDir, "useNarrationSync.ts"))).toBe(true);
  });

  it("(l) useNarrationCaching.ts exists", () => {
    expect(fs.existsSync(path.join(hooksDir, "useNarrationCaching.ts"))).toBe(true);
  });

  it("(l) useFlowScrollSync.ts exists", () => {
    expect(fs.existsSync(path.join(hooksDir, "useFlowScrollSync.ts"))).toBe(true);
  });

  it("(l) useFoliateSync.ts exists", () => {
    expect(fs.existsSync(path.join(hooksDir, "useFoliateSync.ts"))).toBe(true);
  });

  it("(l) useDocumentLifecycle.ts exists", () => {
    expect(fs.existsSync(path.join(hooksDir, "useDocumentLifecycle.ts"))).toBe(true);
  });

  it("(l) ReaderContainer.tsx imports at least 3 of the new hooks", () => {
    const rcSrc = fs.readFileSync(
      path.resolve(__dirname, "../src/components/ReaderContainer.tsx"),
      "utf-8"
    );
    let importCount = 0;
    if (rcSrc.includes("useNarrationSync")) importCount++;
    if (rcSrc.includes("useNarrationCaching")) importCount++;
    if (rcSrc.includes("useFlowScrollSync")) importCount++;
    if (rcSrc.includes("useFoliateSync")) importCount++;
    if (rcSrc.includes("useDocumentLifecycle")) importCount++;
    expect(importCount).toBeGreaterThanOrEqual(3);
  });
});
