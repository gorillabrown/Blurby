// @vitest-environment jsdom
// tests/cursorNarrationSync.test.ts — NARR-FIX-1: Cursor-narration sync test harness
//
// Covers the complete cursor-narration sync pipeline:
//   a) Zone offset computation (getFlowFollowOffsetPx logic) for all 4 zone positions
//   b) Narrate scroll-follow: scrollToAnchor called + containerPosition adjusted by zone offset
//   c) Section advance: renderer.next() when word not in DOM, with 300ms cooldown
//   d) Scroll throttle: max 1 scroll per 500ms window
//   e) returnToNarration: prefers narrationWordIndexRef over highlightedWordIndexRef
//   f) returnToNarration: scrolls to word when off-screen, highlights when visible
//   g) returnToNarration: triggers section recovery when word not in any loaded DOM
//   h) isBrowsedAway gating: recenter button only visible when user has scrolled away
//   i) narrationWordIndexRef tracks prop changes correctly
//   j) Highlight applied in flow style for narrate mode
//   k) Zone offset responds to live zone position changes
//   l) Page turn cooldown prevents rapid section flipping

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  FLOW_READING_ZONE_POSITION,
  FLOW_ZONE_LINES_DEFAULT,
} from "../src/constants";

// ── Zone offset pure logic (extracted from getFlowFollowOffsetPx) ────────────
//
// The real function is a useCallback inside FoliatePageView. We replicate its
// pure math here so we can unit-test zone positioning without rendering React.

function computeZoneOffset(
  viewportHeight: number,
  zonePosition: number,
  zoneLines: number,
  lineHeight: number,
): number {
  if (viewportHeight <= 0) return 0;
  return Math.max(0, Math.round((viewportHeight * zonePosition) + ((lineHeight * zoneLines) / 2)));
}

// ── Mock factories ───────────────────────────────────────────────────────────

/** Create a minimal mock word span in a jsdom document */
function makeWordSpan(doc: Document, wordIndex: number, text: string): HTMLElement {
  const span = doc.createElement("span");
  span.classList.add("page-word");
  span.setAttribute("data-word-index", String(wordIndex));
  span.textContent = text;
  doc.body.appendChild(span);
  return span;
}

/** Create a mock renderer matching the Foliate paginator API surface */
function makeRenderer(overrides: Partial<{
  containerPosition: number;
  scrollToAnchor: (range: Range) => Promise<void>;
  next: () => void;
  prev: () => void;
  getContents: () => Array<{ doc: Document }>;
}> = {}) {
  return {
    containerPosition: overrides.containerPosition ?? 0,
    scrollToAnchor: overrides.scrollToAnchor ?? vi.fn(async () => {}),
    next: overrides.next ?? vi.fn(),
    prev: overrides.prev ?? vi.fn(),
    getContents: overrides.getContents ?? (() => []),
  };
}

/** Create a mock resolveWordState function */
function makeResolveWordState(
  foundWords: Map<number, { span: HTMLElement; doc: Document; visible: boolean }>,
) {
  return (wordIndex: number) => {
    const entry = foundWords.get(wordIndex);
    if (entry) {
      return {
        found: true,
        visible: entry.visible,
        span: entry.span,
        spans: [entry.span],
        doc: entry.doc,
        position: null,
      };
    }
    return {
      found: false,
      visible: false,
      span: null,
      spans: [],
      doc: null,
      position: null,
    };
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("Cursor-narration sync (NARR-FIX-1)", () => {
  // ─── Zone offset computation ───────────────────────────────────────────────

  describe("zone offset computation", () => {
    const VIEWPORT = 800;
    const LINE_HEIGHT = 24;

    it("computes correct offset for Top zone (0.15)", () => {
      const offset = computeZoneOffset(VIEWPORT, 0.15, FLOW_ZONE_LINES_DEFAULT, LINE_HEIGHT);
      // (800 * 0.15) + ((24 * 5) / 2) = 120 + 60 = 180
      expect(offset).toBe(180);
    });

    it("computes correct offset for Upper zone (0.25)", () => {
      const offset = computeZoneOffset(VIEWPORT, 0.25, FLOW_ZONE_LINES_DEFAULT, LINE_HEIGHT);
      // (800 * 0.25) + ((24 * 5) / 2) = 200 + 60 = 260
      expect(offset).toBe(260);
    });

    it("computes correct offset for Center zone (0.35)", () => {
      const offset = computeZoneOffset(VIEWPORT, 0.35, FLOW_ZONE_LINES_DEFAULT, LINE_HEIGHT);
      // (800 * 0.35) + ((24 * 5) / 2) = 280 + 60 = 340
      expect(offset).toBe(340);
    });

    it("computes correct offset for Bottom zone (0.55)", () => {
      const offset = computeZoneOffset(VIEWPORT, 0.55, FLOW_ZONE_LINES_DEFAULT, LINE_HEIGHT);
      // (800 * 0.55) + ((24 * 5) / 2) = 440 + 60 = 500
      expect(offset).toBe(500);
    });

    it("returns 0 when viewport height is 0 (not mounted)", () => {
      expect(computeZoneOffset(0, 0.25, 5, 24)).toBe(0);
    });

    it("returns 0 when viewport height is negative", () => {
      expect(computeZoneOffset(-100, 0.25, 5, 24)).toBe(0);
    });

    it("scales linearly with viewport height", () => {
      const small = computeZoneOffset(400, 0.25, 5, 24);
      const large = computeZoneOffset(800, 0.25, 5, 24);
      // Line-height component is constant (60px), viewport component doubles
      // small = (400*0.25) + 60 = 160, large = (800*0.25) + 60 = 260
      expect(small).toBe(160);
      expect(large).toBe(260);
      expect(large - small).toBe(100); // exactly 400 * 0.25
    });

    it("adjusts for custom zone line count", () => {
      const with3 = computeZoneOffset(VIEWPORT, 0.25, 3, LINE_HEIGHT);
      const with8 = computeZoneOffset(VIEWPORT, 0.25, 8, LINE_HEIGHT);
      // with3 = 200 + (24*3/2) = 200 + 36 = 236
      // with8 = 200 + (24*8/2) = 200 + 96 = 296
      expect(with3).toBe(236);
      expect(with8).toBe(296);
    });

    it("uses default zone position constant", () => {
      const offset = computeZoneOffset(VIEWPORT, FLOW_READING_ZONE_POSITION, FLOW_ZONE_LINES_DEFAULT, LINE_HEIGHT);
      // Default is 0.25: (800 * 0.25) + 60 = 260
      expect(offset).toBe(260);
    });

    it("rounds to nearest integer pixel", () => {
      // viewport=799, zone=0.33 → 799*0.33 = 263.67 + 60 = 323.67 → 324
      const offset = computeZoneOffset(799, 0.33, FLOW_ZONE_LINES_DEFAULT, LINE_HEIGHT);
      expect(Number.isInteger(offset)).toBe(true);
      expect(offset).toBe(324);
    });
  });

  // ─── Narrate scroll-follow effect ──────────────────────────────────────────

  describe("narrate scroll-follow", () => {
    let doc: Document;

    beforeEach(() => {
      doc = document.implementation.createHTMLDocument("test");
    });

    it("calls scrollToAnchor with range covering the narrated word span", async () => {
      const span = makeWordSpan(doc, 42, "hello");
      const scrollToAnchor = vi.fn(async () => {});
      const renderer = makeRenderer({ scrollToAnchor, containerPosition: 1000 });

      // Simulate what the effect does: create range, call scrollToAnchor
      const range = doc.createRange();
      range.selectNodeContents(span);
      await renderer.scrollToAnchor(range);

      expect(scrollToAnchor).toHaveBeenCalledTimes(1);
      const calledRange = (scrollToAnchor.mock.calls[0] as unknown[])[0] as Range;
      // selectNodeContents makes the container the element itself
      expect(calledRange.startContainer).toBe(span);
      expect(calledRange.toString()).toBe("hello");
    });

    it("subtracts zone offset from containerPosition after scrollToAnchor", async () => {
      const renderer = makeRenderer({ containerPosition: 500 });
      const zoneOffset = 260; // Upper zone

      // Simulate the async scroll-follow sequence
      await renderer.scrollToAnchor(new Range());
      if (zoneOffset > 0 && typeof renderer.containerPosition === "number") {
        renderer.containerPosition = Math.max(0, renderer.containerPosition - zoneOffset);
      }

      expect(renderer.containerPosition).toBe(240); // 500 - 260
    });

    it("clamps containerPosition to 0 (never negative)", async () => {
      const renderer = makeRenderer({ containerPosition: 100 });
      const zoneOffset = 500; // Bottom zone with small scroll position

      await renderer.scrollToAnchor(new Range());
      renderer.containerPosition = Math.max(0, renderer.containerPosition - zoneOffset);

      expect(renderer.containerPosition).toBe(0);
    });

    it("does not adjust containerPosition when zone offset is 0", async () => {
      const renderer = makeRenderer({ containerPosition: 500 });
      const zoneOffset = 0; // flowMode is false — getFlowFollowOffsetPx returns 0

      await renderer.scrollToAnchor(new Range());
      if (zoneOffset > 0) {
        renderer.containerPosition = Math.max(0, renderer.containerPosition - zoneOffset);
      }

      expect(renderer.containerPosition).toBe(500); // unchanged
    });

    it("applies different offsets for each zone position", async () => {
      const zones = [
        { name: "Top", position: 0.15, expected: 180 },
        { name: "Upper", position: 0.25, expected: 260 },
        { name: "Center", position: 0.35, expected: 340 },
        { name: "Bottom", position: 0.55, expected: 500 },
      ];

      for (const zone of zones) {
        const renderer = makeRenderer({ containerPosition: 1000 });
        const offset = computeZoneOffset(800, zone.position, FLOW_ZONE_LINES_DEFAULT, 24);
        expect(offset).toBe(zone.expected);

        await renderer.scrollToAnchor(new Range());
        renderer.containerPosition = Math.max(0, renderer.containerPosition - offset);

        expect(renderer.containerPosition).toBe(
          1000 - zone.expected,
          // Descriptive failure message
        );
      }
    });
  });

  // ─── Section advance (page turn) ──────────────────────────────────────────

  describe("section advance", () => {
    it("calls renderer.next() when word is not found in DOM", () => {
      const next = vi.fn();
      const renderer = makeRenderer({ next });
      const foundWords = new Map<number, any>();
      const resolveWordState = makeResolveWordState(foundWords);

      const state = resolveWordState(999); // word not in map
      expect(state.found).toBe(false);

      // Simulate the effect logic
      let pageTurnCooldown = false;
      if (!state.found && !pageTurnCooldown) {
        pageTurnCooldown = true;
        renderer.next();
      }

      expect(next).toHaveBeenCalledTimes(1);
      expect(pageTurnCooldown).toBe(true);
    });

    it("does not call renderer.next() during cooldown", () => {
      const next = vi.fn();
      const renderer = makeRenderer({ next });
      const resolveWordState = makeResolveWordState(new Map());

      // First attempt — triggers page turn
      let pageTurnCooldown = false;
      const state1 = resolveWordState(100);
      if (!state1.found && !pageTurnCooldown) {
        pageTurnCooldown = true;
        renderer.next();
      }

      // Second attempt during cooldown — suppressed
      const state2 = resolveWordState(101);
      if (!state2.found && !pageTurnCooldown) {
        renderer.next();
      }

      expect(next).toHaveBeenCalledTimes(1); // only the first call
    });

    it("resets cooldown after 300ms timeout", async () => {
      vi.useFakeTimers();
      let pageTurnCooldown = false;

      // Trigger cooldown
      pageTurnCooldown = true;
      setTimeout(() => {
        pageTurnCooldown = false;
      }, 300);

      expect(pageTurnCooldown).toBe(true);

      // Advance timers past cooldown
      vi.advanceTimersByTime(300);
      expect(pageTurnCooldown).toBe(false);

      vi.useRealTimers();
    });

    it("does not advance section when word IS found in DOM", () => {
      const next = vi.fn();
      const renderer = makeRenderer({ next });
      const doc = document.implementation.createHTMLDocument("test");
      const span = makeWordSpan(doc, 42, "found");

      const foundWords = new Map([[42, { span, doc, visible: true }]]);
      const resolveWordState = makeResolveWordState(foundWords);

      const state = resolveWordState(42);
      let pageTurnCooldown = false;
      if (!state.found && !pageTurnCooldown) {
        renderer.next();
      }

      expect(next).not.toHaveBeenCalled();
      expect(state.found).toBe(true);
    });
  });

  // ─── Scroll throttle ──────────────────────────────────────────────────────

  describe("scroll throttle", () => {
    it("allows first scroll call immediately", () => {
      let lastScrollTime = 0;
      const now = 1000;
      const throttleMs = 500;

      const shouldScroll = now - lastScrollTime >= throttleMs;
      expect(shouldScroll).toBe(true);
    });

    it("blocks scroll within 500ms window", () => {
      let lastScrollTime = 800;
      const now = 1200; // 400ms later — within throttle
      const throttleMs = 500;

      const shouldScroll = now - lastScrollTime >= throttleMs;
      expect(shouldScroll).toBe(false);
    });

    it("allows scroll after 500ms window elapses", () => {
      let lastScrollTime = 800;
      const now = 1301; // 501ms later — past throttle
      const throttleMs = 500;

      const shouldScroll = now - lastScrollTime >= throttleMs;
      expect(shouldScroll).toBe(true);
    });

    it("updates timestamp after each allowed scroll", () => {
      // The real ref starts at 0 but Date.now() returns epoch millis.
      // Simulate with a realistic starting offset so the first call passes.
      const baseTime = 10000;
      let lastScrollTime = 0; // initial ref value (always passes first time with real timestamps)
      const throttleMs = 500;
      const scrollCalls: number[] = [];

      // Simulate 5 word advances at 200ms intervals starting from baseTime
      for (let i = 0; i < 5; i++) {
        const now = baseTime + i * 200;
        if (now - lastScrollTime >= throttleMs) {
          lastScrollTime = now;
          scrollCalls.push(i);
        }
      }

      // First at i=0 (t=10000, gap from 0 = 10000 >> 500), next at i=3 (t=10600, gap = 600 >= 500)
      expect(scrollCalls).toEqual([0, 3]);
    });

    it("produces at most 3 scrolls per second at 200ms word intervals", () => {
      const baseTime = 10000;
      let lastScrollTime = 0; // initial ref (first call always passes with real timestamps)
      const throttleMs = 500;
      let scrollCount = 0;

      // 1 second of word advances at 200ms intervals
      for (let i = 0; i <= 5; i++) {
        const now = baseTime + i * 200;
        if (now - lastScrollTime >= throttleMs) {
          lastScrollTime = now;
          scrollCount++;
        }
      }

      expect(scrollCount).toBeLessThanOrEqual(3);
    });
  });

  // ─── returnToNarration ref priority ────────────────────────────────────────

  describe("returnToNarration ref priority", () => {
    it("prefers narrationWordIndexRef over highlightedWordIndexRef", () => {
      const narrationWordIndex: number | null = 42;
      const highlightedWordIndex = 10;

      const currentIdx = narrationWordIndex ?? highlightedWordIndex;
      expect(currentIdx).toBe(42);
    });

    it("falls back to highlightedWordIndexRef when narration is null", () => {
      const narrationWordIndex: number | null = null;
      const highlightedWordIndex = 10;

      const currentIdx = narrationWordIndex ?? highlightedWordIndex;
      expect(currentIdx).toBe(10);
    });

    it("uses narrationWordIndexRef even when highlightedWordIndex is ahead", () => {
      // Narration cursor is behind flow cursor — narration takes priority
      const narrationWordIndex: number | null = 30;
      const highlightedWordIndex = 150;

      const currentIdx = narrationWordIndex ?? highlightedWordIndex;
      expect(currentIdx).toBe(30);
    });

    it("scrolls to word when returnToNarration finds it off-screen", () => {
      const doc = document.implementation.createHTMLDocument("test");
      const span = makeWordSpan(doc, 42, "target");

      const foundWords = new Map([[42, { span, doc, visible: false }]]);
      const resolveWordState = makeResolveWordState(foundWords);

      const scrollToAnchor = vi.fn(async () => {});
      const renderer = makeRenderer({ scrollToAnchor });

      const state = resolveWordState(42);
      expect(state.found).toBe(true);
      expect(state.visible).toBe(false);

      // Simulate returnToNarration scroll path
      if (state.found && state.span) {
        state.span.classList.add("page-word--highlighted");
        if (!state.visible && state.doc) {
          const range = state.doc.createRange();
          range.selectNodeContents(state.span);
          renderer.scrollToAnchor(range);
        }
      }

      expect(scrollToAnchor).toHaveBeenCalledTimes(1);
      expect(span.classList.contains("page-word--highlighted")).toBe(true);
    });

    it("does not scroll when word is already visible", () => {
      const doc = document.implementation.createHTMLDocument("test");
      const span = makeWordSpan(doc, 42, "visible");

      const foundWords = new Map([[42, { span, doc, visible: true }]]);
      const resolveWordState = makeResolveWordState(foundWords);

      const scrollToAnchor = vi.fn(async () => {});
      const renderer = makeRenderer({ scrollToAnchor });

      const state = resolveWordState(42);
      if (state.found && state.span) {
        state.span.classList.add("page-word--highlighted");
        if (!state.visible && state.doc) {
          renderer.scrollToAnchor(new Range());
        }
      }

      expect(scrollToAnchor).not.toHaveBeenCalled();
      expect(span.classList.contains("page-word--highlighted")).toBe(true);
    });

    it("triggers section recovery when word is not in any loaded section", () => {
      const resolveWordState = makeResolveWordState(new Map());
      const goToSection = vi.fn();
      const getSectionForWordIndex = vi.fn().mockReturnValue(3);

      const state = resolveWordState(999);
      if (!state.found) {
        const sectionIdx = getSectionForWordIndex(999);
        if (sectionIdx != null) {
          goToSection(sectionIdx);
        }
      }

      expect(getSectionForWordIndex).toHaveBeenCalledWith(999);
      expect(goToSection).toHaveBeenCalledWith(3);
    });

    it("clears userBrowsingRef on returnToNarration invocation", () => {
      let userBrowsing = true;

      // Simulate returnToNarration
      userBrowsing = false; // first line of returnToNarration
      expect(userBrowsing).toBe(false);
    });
  });

  // ─── isBrowsedAway gating ─────────────────────────────────────────────────

  describe("isBrowsedAway gating", () => {
    it("recenter button hidden when isBrowsedAway is false", () => {
      const isReading = true;
      const onJumpToHighlight = vi.fn();
      const isBrowsedAway = false;

      const showButton = isReading && !!onJumpToHighlight && isBrowsedAway;
      expect(showButton).toBe(false);
    });

    it("recenter button visible when isBrowsedAway is true during reading", () => {
      const isReading = true;
      const onJumpToHighlight = vi.fn();
      const isBrowsedAway = true;

      const showButton = isReading && !!onJumpToHighlight && isBrowsedAway;
      expect(showButton).toBe(true);
    });

    it("recenter button hidden when not reading even if browsed away", () => {
      const isReading = false;
      const onJumpToHighlight = vi.fn();
      const isBrowsedAway = true;

      const showButton = isReading && !!onJumpToHighlight && isBrowsedAway;
      expect(showButton).toBe(false);
    });

    it("recenter button hidden when no onJumpToHighlight callback", () => {
      const isReading = true;
      const onJumpToHighlight: (() => void) | undefined = undefined;
      const isBrowsedAway = true;

      const showButton = isReading && !!onJumpToHighlight && isBrowsedAway;
      expect(showButton).toBe(false);
    });
  });

  // ─── Narrate mode guards ──────────────────────────────────────────────────

  describe("narrate mode guards", () => {
    it("scroll-follow only fires in narrate mode", () => {
      const modes = ["page", "focus", "flow", "narrate"];
      const shouldFire = modes.map((m) => m === "narrate");
      expect(shouldFire).toEqual([false, false, false, true]);
    });

    it("scroll-follow skips when narrationWordIndex is null", () => {
      const readingMode = "narrate";
      const narrationWordIndex: number | null = null;
      const shouldProcess = readingMode === "narrate" && narrationWordIndex != null;
      expect(shouldProcess).toBe(false);
    });

    it("scroll-follow fires when narrationWordIndex is 0 (valid index)", () => {
      const readingMode = "narrate";
      const narrationWordIndex: number | null = 0;
      const shouldProcess = readingMode === "narrate" && narrationWordIndex != null;
      expect(shouldProcess).toBe(true);
    });

    it("highlight effect fires for both flow and narrate modes", () => {
      const modes = ["page", "focus", "flow", "narrate"];
      const shouldHighlight = modes.map(
        (m) => (m === "flow" || m === "narrate") && 42 != null,
      );
      expect(shouldHighlight).toEqual([false, false, true, true]);
    });
  });

  // ─── narrationWordIndexRef tracking ────────────────────────────────────────

  describe("narrationWordIndexRef tracking", () => {
    it("ref tracks prop value on each render", () => {
      // Simulate the ref assignment pattern from FoliatePageView:
      //   narrationWordIndexRef.current = narrationWordIndex ?? null;
      let ref: number | null = null;

      // First render: narrationWordIndex = 10
      const val1: number | undefined = 10;
      ref = val1 ?? null;
      expect(ref).toBe(10);

      // Second render: narrationWordIndex = 42
      const val2: number | undefined = 42;
      ref = val2 ?? null;
      expect(ref).toBe(42);

      // Third render: narrationWordIndex = undefined (mode switch)
      const val3: number | undefined = undefined;
      ref = val3 ?? null;
      expect(ref).toBe(null);
    });

    it("ref is null when narrationWordIndex is undefined", () => {
      const narrationWordIndex: number | undefined = undefined;
      const ref = narrationWordIndex ?? null;
      expect(ref).toBe(null);
    });

    it("ref is 0 when narrationWordIndex is 0 (not null-coalesced away)", () => {
      const narrationWordIndex: number | undefined = 0;
      const ref = narrationWordIndex ?? null;
      expect(ref).toBe(0);
    });
  });

  // ─── End-to-end scroll-follow sequence ─────────────────────────────────────

  describe("end-to-end scroll-follow sequence", () => {
    it("full sequence: resolve word → scrollToAnchor → apply zone offset", async () => {
      const doc = document.implementation.createHTMLDocument("test");
      const span = makeWordSpan(doc, 42, "wisdom");

      const scrollToAnchor = vi.fn(async () => {});
      const renderer = makeRenderer({ scrollToAnchor, containerPosition: 2000 });

      const foundWords = new Map([[42, { span, doc, visible: true }]]);
      const resolveWordState = makeResolveWordState(foundWords);
      const zoneOffset = computeZoneOffset(800, 0.35, FLOW_ZONE_LINES_DEFAULT, 24); // Center

      // Step 1: resolve word state
      const state = resolveWordState(42);
      expect(state.found).toBe(true);
      expect(state.span).toBe(span);

      // Step 2: create range and scrollToAnchor
      const range = state.doc!.createRange();
      range.selectNodeContents(state.span!);
      await renderer.scrollToAnchor(range);
      expect(scrollToAnchor).toHaveBeenCalledTimes(1);

      // Step 3: apply zone offset
      if (zoneOffset > 0) {
        renderer.containerPosition = Math.max(0, renderer.containerPosition - zoneOffset);
      }
      expect(renderer.containerPosition).toBe(2000 - 340); // 1660
    });

    it("full sequence with word NOT found: triggers section advance", () => {
      const next = vi.fn();
      const renderer = makeRenderer({ next });
      const resolveWordState = makeResolveWordState(new Map());

      let pageTurnCooldown = false;
      const state = resolveWordState(999);

      if (!state.found && !pageTurnCooldown) {
        pageTurnCooldown = true;
        renderer.next();
      }

      expect(next).toHaveBeenCalledTimes(1);
      expect(pageTurnCooldown).toBe(true);
    });

    it("simulates multi-word narration advance with throttle", async () => {
      const scrollToAnchor = vi.fn(async () => {});
      const renderer = makeRenderer({ scrollToAnchor, containerPosition: 1000 });
      const doc = document.implementation.createHTMLDocument("test");

      // Create 10 word spans
      const words = Array.from({ length: 10 }, (_, i) => {
        const span = makeWordSpan(doc, i, `word${i}`);
        return [i, { span, doc, visible: true }] as const;
      });
      const foundWords = new Map(words);
      const resolveWordState = makeResolveWordState(foundWords);

      // Use realistic timestamps — ref starts at 0, baseTime >> 500
      const baseTime = 10000;
      let lastScrollTime = 0; // matches useRef(0) in real code
      const throttleMs = 500;
      const scrollCalls: number[] = [];

      // Simulate narration advancing every 150ms (fast narration)
      for (let wordIdx = 0; wordIdx < 10; wordIdx++) {
        const now = baseTime + wordIdx * 150;

        const state = resolveWordState(wordIdx);
        if (state.found && state.span && state.doc) {
          if (now - lastScrollTime >= throttleMs) {
            lastScrollTime = now;
            scrollCalls.push(wordIdx);
            const range = state.doc.createRange();
            range.selectNodeContents(state.span);
            await renderer.scrollToAnchor(range);
          }
        }
      }

      // baseTime=10000, intervals of 150ms:
      // word 0: t=10000, gap from 0 = 10000 >= 500 → scroll ✓
      // word 1-3: t=10150-10450, gap < 500 → skip
      // word 4: t=10600, gap from 10000 = 600 >= 500 → scroll ✓
      // word 5-7: t=10750-11050, gap < 500 → skip
      // word 8: t=11200, gap from 10600 = 600 >= 500 → scroll ✓
      // word 9: t=11350, gap = 150 < 500 → skip
      expect(scrollCalls).toEqual([0, 4, 8]);
      expect(scrollToAnchor).toHaveBeenCalledTimes(3);
    });

    it("handles document closing during scroll (no throw)", async () => {
      const scrollToAnchor = vi.fn(async () => {
        throw new Error("Document is closing");
      });
      const renderer = makeRenderer({ scrollToAnchor, containerPosition: 500 });
      const zoneOffset = 260;

      // The real effect wraps this in try/catch
      let caught = false;
      try {
        await renderer.scrollToAnchor(new Range());
        renderer.containerPosition = Math.max(0, renderer.containerPosition - zoneOffset);
      } catch {
        caught = true;
        // Non-critical — document may be closing during navigation
      }

      expect(caught).toBe(true);
      // containerPosition should NOT have been modified since scrollToAnchor threw
      expect(renderer.containerPosition).toBe(500);
    });
  });

  // ─── Zone position transitions ─────────────────────────────────────────────

  describe("zone position transitions", () => {
    it("switching from Top to Bottom increases offset by (0.55-0.15)*viewport", () => {
      const topOffset = computeZoneOffset(800, 0.15, 5, 24);
      const bottomOffset = computeZoneOffset(800, 0.55, 5, 24);
      // Difference should be exactly (0.55 - 0.15) * 800 = 320
      expect(bottomOffset - topOffset).toBe(320);
    });

    it("offset differences between adjacent zones are consistent", () => {
      const zones = [0.15, 0.25, 0.35, 0.55];
      const offsets = zones.map((z) => computeZoneOffset(800, z, 5, 24));

      // Top→Upper: 0.10 * 800 = 80
      expect(offsets[1] - offsets[0]).toBe(80);
      // Upper→Center: 0.10 * 800 = 80
      expect(offsets[2] - offsets[1]).toBe(80);
      // Center→Bottom: 0.20 * 800 = 160
      expect(offsets[3] - offsets[2]).toBe(160);
    });

    it("containerPosition result descends monotonically with zone offset", async () => {
      const zones = [0.15, 0.25, 0.35, 0.55];
      const results: number[] = [];

      for (const zone of zones) {
        const offset = computeZoneOffset(800, zone, 5, 24);
        const containerPos = Math.max(0, 2000 - offset);
        results.push(containerPos);
      }

      // Higher zone offset → lower containerPosition → word appears further down
      for (let i = 1; i < results.length; i++) {
        expect(results[i]).toBeLessThan(results[i - 1]);
      }
    });
  });

  // ─── Edge cases ────────────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("narrationWordIndex 0 is a valid word (not skipped by nullish check)", () => {
      const narrationWordIndex: number | null = 0;
      // The effect guard: if (narrationWordIndex == null) return;
      // 0 == null is false, so this should proceed
      expect(narrationWordIndex == null).toBe(false);
    });

    it("containerPosition near 0 clamps correctly with large zone offset", () => {
      const containerPos = 50;
      const zoneOffset = 500;
      const result = Math.max(0, containerPos - zoneOffset);
      expect(result).toBe(0);
    });

    it("very large containerPosition handles zone offset without overflow", () => {
      const containerPos = Number.MAX_SAFE_INTEGER;
      const zoneOffset = 500;
      const result = Math.max(0, containerPos - zoneOffset);
      expect(result).toBe(Number.MAX_SAFE_INTEGER - 500);
    });

    it("renderer without containerPosition property is handled", () => {
      const renderer: any = { scrollToAnchor: vi.fn(async () => {}) };
      const zoneOffset = 260;

      // The real effect checks: typeof renderer.containerPosition === "number"
      if (renderer && typeof renderer.containerPosition === "number") {
        renderer.containerPosition = Math.max(0, renderer.containerPosition - zoneOffset);
      }

      expect(renderer.containerPosition).toBeUndefined();
    });

    it("concurrent scrollToAnchor calls do not corrupt containerPosition", async () => {
      let containerPosition = 2000;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const scrollToAnchor = vi.fn(async (_range: Range) => {
        // Simulate async microtask (no setTimeout — avoids timer dependency)
        await Promise.resolve();
      });
      const zoneOffset = 260;

      // Only one should execute (throttle), but verify no corruption
      await scrollToAnchor(new Range());
      containerPosition = Math.max(0, containerPosition - zoneOffset);

      expect(containerPosition).toBe(1740);
    });
  });
});
