// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
  WordPositionIndex,
  type WordPositionEntry,
} from "../src/utils/wordPositionIndex";

type RectInit = { left: number; top: number; width: number; height: number };

function mockRect(el: HTMLElement, rect: RectInit): void {
  const fullRect = {
    x: rect.left,
    y: rect.top,
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    toJSON: () => ({}),
  };
  Object.defineProperty(el, "getBoundingClientRect", {
    configurable: true,
    value: () => fullRect,
  });
}

function makeDocWithSpans(spans: Array<{ index: number; rect: RectInit }>): Document {
  const doc = document;
  doc.body.innerHTML = "";
  const root = doc.createElement("div");
  root.setAttribute("data-test-root", "word-position-index");
  doc.body.appendChild(root);
  for (const spanDef of spans) {
    const span = doc.createElement("span");
    span.className = "page-word";
    span.setAttribute("data-word-index", String(spanDef.index));
    span.textContent = `w${spanDef.index}`;
    mockRect(span, spanDef.rect);
    root.appendChild(span);
  }
  return doc;
}

describe("WordPositionIndex", () => {
  it("builds, merges stitched duplicate spans, and resolves O(1) lookups", () => {
    const doc = makeDocWithSpans([
      { index: 10, rect: { left: 12, top: 18, width: 30, height: 12 } },
      { index: 11, rect: { left: 48, top: 18, width: 16, height: 12 } },
      { index: 11, rect: { left: 64, top: 18, width: 20, height: 14 } },
    ]);
    const index = new WordPositionIndex();

    const build = index.build([{ doc, index: 3 }]);
    expect(build.wordCount).toBe(2);
    expect(build.duplicateSpanCount).toBe(1);

    const entry = index.get(11);
    expect(entry).not.toBeNull();
    expect(entry?.sectionIndex).toBe(3);
    expect(entry?.spans).toHaveLength(2);
    expect(entry?.left).toBe(48);
    expect(entry?.width).toBe(36); // merged [48..84]
    expect(entry?.lineTop).toBe(18);
    expect(entry?.lineHeight).toBe(14);
  });

  it("finds the first visible word index from the pre-built map", () => {
    const doc = makeDocWithSpans([
      { index: 100, rect: { left: -40, top: 24, width: 20, height: 10 } }, // off-screen
      { index: 101, rect: { left: 40, top: 24, width: 20, height: 10 } },  // visible
      { index: 102, rect: { left: 80, top: 24, width: 20, height: 10 } },  // visible
    ]);
    const index = new WordPositionIndex();
    index.build([{ doc, index: 7 }]);

    expect(index.findFirstVisibleWordIndex()).toBe(101);
  });

  it("invalidates entries cleanly", () => {
    const doc = makeDocWithSpans([
      { index: 1, rect: { left: 10, top: 10, width: 10, height: 10 } },
    ]);
    const index = new WordPositionIndex();
    index.build([{ doc, index: 0 }]);
    expect(index.size()).toBe(1);

    index.invalidate();
    expect(index.size()).toBe(0);
    expect(index.get(1)).toBeNull();
    expect(index.findFirstVisibleWordIndex()).toBe(-1);
  });

  it("supports graceful fallback lookup when an index entry is missing", () => {
    const doc = makeDocWithSpans([
      { index: 55, rect: { left: 12, top: 22, width: 18, height: 12 } },
    ]);
    const index = new WordPositionIndex();
    index.build([{ doc, index: 1 }]);

    const fallback = vi.fn<() => WordPositionEntry | null>(() => ({
      wordIndex: 99,
      top: 1,
      left: 2,
      width: 3,
      height: 4,
      lineTop: 1,
      lineHeight: 4,
      doc,
      sectionIndex: 1,
      primarySpan: doc.querySelector("span.page-word") as HTMLElement,
      spans: [doc.querySelector("span.page-word") as HTMLElement],
    }));

    const hit = index.getWithFallback(55, fallback);
    expect(hit?.wordIndex).toBe(55);
    expect(fallback).not.toHaveBeenCalled();

    const miss = index.getWithFallback(99, fallback);
    expect(miss?.wordIndex).toBe(99);
    expect(fallback).toHaveBeenCalledTimes(1);
  });

  it("builds a 5,000-span section and keeps lookup coverage intact", () => {
    const doc = document;
    doc.body.innerHTML = "";
    const root = doc.createElement("div");
    doc.body.appendChild(root);

    for (let i = 0; i < 5000; i += 1) {
      const span = doc.createElement("span");
      span.className = "page-word";
      span.setAttribute("data-word-index", String(i));
      span.textContent = `w${i}`;
      mockRect(span, {
        left: (i % 30) * 24,
        top: Math.floor(i / 30) * 16,
        width: 20,
        height: 14,
      });
      root.appendChild(span);
    }

    const index = new WordPositionIndex();
    const build = index.build([{ doc, index: 9 }]);
    expect(build.wordCount).toBe(5000);
    // Non-flaky budget guard for mocked DOM builds.
    expect(build.buildTimeMs).toBeLessThan(200);

    for (let i = 0; i < 5000; i += 250) {
      const entry = index.get(i);
      expect(entry).not.toBeNull();
      expect(entry?.wordIndex).toBe(i);
    }
  });
});
