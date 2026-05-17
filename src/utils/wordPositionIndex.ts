import { parseWordIndexAttribute, queryWordSpans } from "./foliateHelpers";

export interface WordPositionRect {
  top: number;
  left: number;
  width: number;
  height: number;
  lineTop: number;
  lineHeight: number;
}

export interface WordPositionEntry extends WordPositionRect {
  wordIndex: number;
  doc: Document;
  sectionIndex: number | null;
  primarySpan: HTMLElement;
  spans: HTMLElement[];
}

export interface WordPositionIndexBuildResult {
  wordCount: number;
  buildTimeMs: number;
  duplicateSpanCount: number;
}

type RenderedContent = {
  doc: Document;
  index?: number;
};

function mergeRect(existing: WordPositionRect, rect: DOMRect): WordPositionRect {
  const left = Math.min(existing.left, rect.left);
  const top = Math.min(existing.top, rect.top);
  const right = Math.max(existing.left + existing.width, rect.left + rect.width);
  const bottom = Math.max(existing.top + existing.height, rect.top + rect.height);
  return {
    top,
    left,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
    lineTop: Math.min(existing.lineTop, rect.top),
    lineHeight: Math.max(existing.lineHeight, rect.height),
  };
}

function isVisibleInViewport(entry: WordPositionEntry): boolean {
  const win = entry.doc.defaultView;
  if (!win) return false;
  return (
    entry.width > 0 &&
    entry.left >= 0 &&
    entry.left < win.innerWidth &&
    entry.top >= 0 &&
    entry.top < win.innerHeight
  );
}

export class WordPositionIndex {
  private entries = new Map<number, WordPositionEntry>();
  private sortedWordIndexes: number[] = [];

  build(contents: RenderedContent[]): WordPositionIndexBuildResult {
    const startedAt = performance.now();
    this.entries.clear();
    this.sortedWordIndexes = [];

    let duplicateSpanCount = 0;

    for (const { doc, index } of contents) {
      if (!doc?.body) continue;
      const spans = queryWordSpans(doc);
      for (const span of spans) {
        const wordIndex = parseWordIndexAttribute(span.getAttribute("data-word-index"));
        if (wordIndex == null) continue;
        const rect = span.getBoundingClientRect();
        const existing = this.entries.get(wordIndex);
        if (!existing) {
          this.entries.set(wordIndex, {
            wordIndex,
            doc,
            sectionIndex: typeof index === "number" ? index : null,
            primarySpan: span,
            spans: [span],
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            lineTop: rect.top,
            lineHeight: rect.height,
          });
          continue;
        }

        duplicateSpanCount += 1;
        const merged = mergeRect(existing, rect);
        existing.top = merged.top;
        existing.left = merged.left;
        existing.width = merged.width;
        existing.height = merged.height;
        existing.lineTop = merged.lineTop;
        existing.lineHeight = merged.lineHeight;
        existing.spans.push(span);
      }
    }

    this.sortedWordIndexes = Array.from(this.entries.keys()).sort((a, b) => a - b);
    const buildTimeMs = performance.now() - startedAt;

    return {
      wordCount: this.entries.size,
      buildTimeMs,
      duplicateSpanCount,
    };
  }

  invalidate(): void {
    this.entries.clear();
    this.sortedWordIndexes = [];
  }

  get(wordIndex: number): WordPositionEntry | null {
    return this.entries.get(wordIndex) ?? null;
  }

  getWithFallback(wordIndex: number, fallback: () => WordPositionEntry | null): WordPositionEntry | null {
    const indexed = this.get(wordIndex);
    if (indexed) return indexed;
    return fallback();
  }

  size(): number {
    return this.entries.size;
  }

  findFirstVisibleWordIndex(): number {
    for (const wordIndex of this.sortedWordIndexes) {
      const entry = this.entries.get(wordIndex);
      if (!entry) continue;
      if (isVisibleInViewport(entry)) return wordIndex;
    }
    return -1;
  }
}
