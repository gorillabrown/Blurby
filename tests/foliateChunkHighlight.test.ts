// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
  applyChunkReadingVisualStateToRoots,
  buildChunkReadingScrollKey,
  clearChunkReadingVisualStateFromRoots,
  scrollChunkReadingVisualStateToTopOfRoots,
} from "../src/utils/foliateWordHighlight";
import { injectStyles } from "../src/utils/foliateStyles";
import type { ChunkReadingVisualState } from "../src/types/chunkReading";
import type { FlowRenderedWordRootDescriptor } from "../src/utils/FlowScrollEngine";
import type { BlurbySettings } from "../src/types";

function makeRoot(html: string): { doc: Document; roots: FlowRenderedWordRootDescriptor[] } {
  const doc = document.implementation.createHTMLDocument("chunk-highlight");
  doc.body.innerHTML = html;
  return {
    doc,
    roots: [{ doc, root: doc.body, sectionIndex: 0, ready: true }],
  };
}

function state(overrides: Partial<ChunkReadingVisualState> = {}): ChunkReadingVisualState {
  return {
    mode: "flow",
    activeChunkId: "sentence:1-4",
    activeChunkRange: { startWordIndex: 1, endWordIndex: 4 },
    activeWordIndex: 2,
    syncLevel: "wpm",
    ...overrides,
  };
}

describe("Foliate chunk visual state rendering", () => {
  it("applies chunk class across multiple rendered word spans", () => {
    const { doc, roots } = makeRoot(`
      <span class="page-word" data-word-index="0">Zero</span>
      <span class="page-word" data-word-index="1">One</span>
      <span class="page-word" data-word-index="2">Two</span>
      <span class="page-word" data-word-index="3">Three</span>
      <span class="page-word" data-word-index="4">Four</span>
    `);

    applyChunkReadingVisualStateToRoots(roots, state());

    expect(Array.from(doc.querySelectorAll(".page-word--chunk-active")).map((el) => el.textContent)).toEqual([
      "One",
      "Two",
      "Three",
    ]);
  });

  it("applies active word class only to the active word", () => {
    const { doc, roots } = makeRoot(`
      <span class="page-word" data-word-index="1">One</span>
      <span class="page-word" data-word-index="2">Two</span>
      <span class="page-word" data-word-index="3">Three</span>
    `);

    applyChunkReadingVisualStateToRoots(roots, state());

    expect(Array.from(doc.querySelectorAll(".page-word--active-word")).map((el) => el.textContent)).toEqual(["Two"]);
  });

  it("clears stale chunk and active word classes", () => {
    const { doc, roots } = makeRoot(`
      <span class="page-word page-word--chunk-active page-word--active-word" data-word-index="1">One</span>
      <span class="page-word page-word--chunk-active" data-word-index="2">Two</span>
      <span class="page-word" data-word-index="3">Three</span>
    `);

    applyChunkReadingVisualStateToRoots(roots, state({
      activeChunkRange: { startWordIndex: 3, endWordIndex: 4 },
      activeWordIndex: 3,
    }));

    expect(doc.querySelector('[data-word-index="1"]')?.classList.contains("page-word--chunk-active")).toBe(false);
    expect(doc.querySelector('[data-word-index="1"]')?.classList.contains("page-word--active-word")).toBe(false);
    expect(doc.querySelector('[data-word-index="3"]')?.classList.contains("page-word--chunk-active")).toBe(true);
    expect(doc.querySelector('[data-word-index="3"]')?.classList.contains("page-word--active-word")).toBe(true);
  });

  it("applies all token parts for a split token", () => {
    const { doc, roots } = makeRoot(`
      <span class="page-word" data-word-index="2" data-token-id="0:2" data-token-part="0">inter</span>
      <span class="page-word" data-word-index="2" data-token-id="0:2" data-token-part="1">esting</span>
    `);

    applyChunkReadingVisualStateToRoots(roots, state());

    expect(doc.querySelectorAll(".page-word--chunk-active")).toHaveLength(2);
    expect(doc.querySelectorAll(".page-word--active-word")).toHaveLength(2);
  });

  it("does not apply active word class when activeWordIndex is null", () => {
    const { doc, roots } = makeRoot(`
      <span class="page-word" data-word-index="1">One</span>
      <span class="page-word" data-word-index="2">Two</span>
    `);

    applyChunkReadingVisualStateToRoots(roots, state({
      mode: "narrate",
      activeWordIndex: null,
      syncLevel: "chunk-synced",
    }));

    expect(doc.querySelectorAll(".page-word--chunk-active")).toHaveLength(2);
    expect(doc.querySelectorAll(".page-word--active-word")).toHaveLength(0);
  });

  it("scrolls the active word when trusted word progress is available", () => {
    const { doc, roots } = makeRoot(`
      <span class="page-word" data-word-index="1">One</span>
      <span class="page-word" data-word-index="2">Two</span>
      <span class="page-word" data-word-index="3">Three</span>
    `);
    const startWord = doc.querySelector('[data-word-index="1"]') as HTMLElement;
    const activeWord = doc.querySelector('[data-word-index="2"]') as HTMLElement;
    startWord.scrollIntoView = vi.fn();
    activeWord.scrollIntoView = vi.fn();

    const didScroll = scrollChunkReadingVisualStateToTopOfRoots(roots, state());

    expect(didScroll).toBe(true);
    expect(activeWord.scrollIntoView).toHaveBeenCalledWith({
      block: "start",
      inline: "nearest",
      behavior: "auto",
    });
    expect(startWord.scrollIntoView).not.toHaveBeenCalled();
  });

  it("falls back to chunk start when word timing is not available", () => {
    const { doc, roots } = makeRoot(`
      <span class="page-word" data-word-index="1">One</span>
      <span class="page-word" data-word-index="2">Two</span>
    `);
    const startWord = doc.querySelector('[data-word-index="1"]') as HTMLElement;
    const activeWord = doc.querySelector('[data-word-index="2"]') as HTMLElement;
    startWord.scrollIntoView = vi.fn();
    activeWord.scrollIntoView = vi.fn();

    const didScroll = scrollChunkReadingVisualStateToTopOfRoots(roots, state({
      activeWordIndex: null,
      syncLevel: "chunk-synced",
    }));

    expect(didScroll).toBe(true);
    expect(startWord.scrollIntoView).toHaveBeenCalledWith({
      block: "start",
      inline: "nearest",
      behavior: "auto",
    });
    expect(activeWord.scrollIntoView).not.toHaveBeenCalled();
  });

  it("aligns the active word against the selected Flow zone when a scroll container is provided", () => {
    const { doc, roots } = makeRoot(`
      <span class="page-word" data-word-index="1">One</span>
      <span class="page-word" data-word-index="2">Two</span>
    `);
    const startWord = doc.querySelector('[data-word-index="1"]') as HTMLElement;
    const activeWord = doc.querySelector('[data-word-index="2"]') as HTMLElement;
    const scrollContainer = document.createElement("div");
    Object.defineProperty(scrollContainer, "scrollTop", { value: 25, writable: true, configurable: true });
    scrollContainer.getBoundingClientRect = () => ({
      top: 40,
      bottom: 640,
      left: 0,
      right: 800,
      width: 800,
      height: 600,
      x: 0,
      y: 40,
      toJSON: () => {},
    });
    scrollContainer.scrollTo = vi.fn((optionsOrX?: ScrollToOptions | number) => {
      scrollContainer.scrollTop = typeof optionsOrX === "number"
        ? optionsOrX
        : Number(optionsOrX?.top ?? 0);
    }) as typeof scrollContainer.scrollTo;
    startWord.scrollIntoView = vi.fn();
    activeWord.scrollIntoView = vi.fn();
    startWord.getBoundingClientRect = () => ({
      top: 280,
      bottom: 304,
      left: 0,
      right: 80,
      width: 80,
      height: 24,
      x: 0,
      y: 280,
      toJSON: () => {},
    });
    activeWord.getBoundingClientRect = () => ({
      top: 360,
      bottom: 384,
      left: 0,
      right: 80,
      width: 80,
      height: 24,
      x: 0,
      y: 360,
      toJSON: () => {},
    });

    const didScroll = scrollChunkReadingVisualStateToTopOfRoots(roots, state(), {
      behavior: "auto",
      scrollContainer,
      topOffsetPx: 210,
    });

    expect(didScroll).toBe(true);
    expect(scrollContainer.scrollTop).toBe(135);
    expect(startWord.scrollIntoView).not.toHaveBeenCalled();
    expect(activeWord.scrollIntoView).not.toHaveBeenCalled();
  });

  it("measures recenter accuracy by aligning chunk start to the reading box top", () => {
    const { doc, roots } = makeRoot(`
      <span class="page-word" data-word-index="1">One</span>
      <span class="page-word" data-word-index="2">Two</span>
      <span class="page-word" data-word-index="3">Three</span>
    `);
    const startWord = doc.querySelector('[data-word-index="1"]') as HTMLElement;
    const activeWord = doc.querySelector('[data-word-index="3"]') as HTMLElement;
    const scrollContainer = document.createElement("div");
    Object.defineProperty(scrollContainer, "scrollTop", { value: 125, writable: true, configurable: true });
    scrollContainer.getBoundingClientRect = () => ({
      top: 40,
      bottom: 640,
      left: 0,
      right: 800,
      width: 800,
      height: 600,
      x: 0,
      y: 40,
      toJSON: () => {},
    });
    scrollContainer.scrollTo = vi.fn((optionsOrX?: ScrollToOptions | number) => {
      scrollContainer.scrollTop = typeof optionsOrX === "number"
        ? optionsOrX
        : Number(optionsOrX?.top ?? 0);
    }) as typeof scrollContainer.scrollTo;
    startWord.scrollIntoView = vi.fn();
    activeWord.scrollIntoView = vi.fn();
    startWord.getBoundingClientRect = () => ({
      top: 330,
      bottom: 354,
      left: 0,
      right: 80,
      width: 80,
      height: 24,
      x: 0,
      y: 330,
      toJSON: () => {},
    });
    activeWord.getBoundingClientRect = () => ({
      top: 470,
      bottom: 494,
      left: 0,
      right: 80,
      width: 80,
      height: 24,
      x: 0,
      y: 470,
      toJSON: () => {},
    });

    const didScroll = scrollChunkReadingVisualStateToTopOfRoots(
      roots,
      state({ activeWordIndex: 3 }),
      {
        behavior: "auto",
        scrollContainer,
        target: "chunk-start",
        topOffsetPx: 210,
      },
    );

    expect(didScroll).toBe(true);
    expect(Math.abs(scrollContainer.scrollTop - 205)).toBeLessThanOrEqual(0.5);
    expect(scrollContainer.scrollTop).not.toBe(345);
    expect(startWord.scrollIntoView).not.toHaveBeenCalled();
    expect(activeWord.scrollIntoView).not.toHaveBeenCalled();
  });

  it("uses the active word in the scroll key so follow-up words in one chunk keep scrolling", () => {
    expect(buildChunkReadingScrollKey(state({ activeWordIndex: 2 }))).not.toBe(
      buildChunkReadingScrollKey(state({ activeWordIndex: 3 })),
    );
    expect(buildChunkReadingScrollKey(state({ activeWordIndex: null }))).toBe(
      "flow:sentence:1-4:1:4:chunk",
    );
  });

  it("includes the iframe offset when aligning chunk starts from Foliate iframe documents", () => {
    const iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument as Document;
    doc.body.innerHTML = `
      <span class="page-word" data-word-index="1">One</span>
      <span class="page-word" data-word-index="2">Two</span>
    `;
    const roots: FlowRenderedWordRootDescriptor[] = [{ doc, root: doc.body, sectionIndex: 0, ready: true }];
    const startWord = doc.querySelector('[data-word-index="1"]') as HTMLElement;
    const scrollContainer = document.createElement("div");
    Object.defineProperty(scrollContainer, "scrollTop", { value: 25, writable: true, configurable: true });
    scrollContainer.getBoundingClientRect = () => ({
      top: 40,
      bottom: 640,
      left: 0,
      right: 800,
      width: 800,
      height: 600,
      x: 0,
      y: 40,
      toJSON: () => {},
    });
    scrollContainer.scrollTo = vi.fn((optionsOrX?: ScrollToOptions | number) => {
      scrollContainer.scrollTop = typeof optionsOrX === "number"
        ? optionsOrX
        : Number(optionsOrX?.top ?? 0);
    }) as typeof scrollContainer.scrollTo;
    iframe.getBoundingClientRect = () => ({
      top: 100,
      bottom: 700,
      left: 0,
      right: 800,
      width: 800,
      height: 600,
      x: 0,
      y: 100,
      toJSON: () => {},
    });
    startWord.getBoundingClientRect = () => ({
      top: 280,
      bottom: 304,
      left: 0,
      right: 80,
      width: 80,
      height: 24,
      x: 0,
      y: 280,
      toJSON: () => {},
    });

    const didScroll = scrollChunkReadingVisualStateToTopOfRoots(roots, state({ activeWordIndex: null }), {
      behavior: "auto",
      scrollContainer,
      topOffsetPx: 210,
    });

    expect(didScroll).toBe(true);
    expect(scrollContainer.scrollTop).toBe(155);
  });

  it("clear helper removes chunk visual state from every rendered root", () => {
    const { doc, roots } = makeRoot(`
      <span class="page-word page-word--chunk-active page-word--active-word page-word--glide-adj" data-word-index="1">One</span>
    `);

    clearChunkReadingVisualStateFromRoots(roots);

    expect(doc.querySelector(".page-word")?.className).toBe("page-word");
  });

  it("applies glide-adj class to prev and next words within same paragraph", () => {
    const { doc, roots } = makeRoot(`
      <p>
        <span class="page-word" data-word-index="1">One</span>
        <span class="page-word" data-word-index="2">Two</span>
        <span class="page-word" data-word-index="3">Three</span>
        <span class="page-word" data-word-index="4">Four</span>
      </p>
    `);

    applyChunkReadingVisualStateToRoots(roots, state({ activeWordIndex: 2 }));

    expect(doc.querySelector('[data-word-index="1"]')?.classList.contains("page-word--glide-adj")).toBe(true);
    expect(doc.querySelector('[data-word-index="2"]')?.classList.contains("page-word--active-word")).toBe(true);
    expect(doc.querySelector('[data-word-index="3"]')?.classList.contains("page-word--glide-adj")).toBe(true);
    expect(doc.querySelector('[data-word-index="4"]')?.classList.contains("page-word--glide-adj")).toBe(false);
  });

  it("truncates glide at paragraph boundaries", () => {
    const { doc, roots } = makeRoot(`
      <p>
        <span class="page-word" data-word-index="1">One</span>
        <span class="page-word" data-word-index="2">Two</span>
      </p>
      <p>
        <span class="page-word" data-word-index="3">Three</span>
        <span class="page-word" data-word-index="4">Four</span>
      </p>
    `);

    applyChunkReadingVisualStateToRoots(roots, state({
      activeChunkRange: { startWordIndex: 1, endWordIndex: 5 },
      activeWordIndex: 2,
    }));

    expect(doc.querySelector('[data-word-index="1"]')?.classList.contains("page-word--glide-adj")).toBe(true);
    expect(doc.querySelector('[data-word-index="3"]')?.classList.contains("page-word--glide-adj")).toBe(false);
  });

  it("truncates glide when active word is at start of paragraph", () => {
    const { doc, roots } = makeRoot(`
      <p>
        <span class="page-word" data-word-index="1">One</span>
      </p>
      <p>
        <span class="page-word" data-word-index="2">Two</span>
        <span class="page-word" data-word-index="3">Three</span>
      </p>
    `);

    applyChunkReadingVisualStateToRoots(roots, state({
      activeChunkRange: { startWordIndex: 1, endWordIndex: 4 },
      activeWordIndex: 2,
    }));

    expect(doc.querySelector('[data-word-index="1"]')?.classList.contains("page-word--glide-adj")).toBe(false);
    expect(doc.querySelector('[data-word-index="3"]')?.classList.contains("page-word--glide-adj")).toBe(true);
  });

  it("does not apply glide when words have no block ancestor", () => {
    const { doc, roots } = makeRoot(`
      <span class="page-word" data-word-index="1">One</span>
      <span class="page-word" data-word-index="2">Two</span>
      <span class="page-word" data-word-index="3">Three</span>
    `);

    applyChunkReadingVisualStateToRoots(roots, state({ activeWordIndex: 2 }));

    expect(doc.querySelector('[data-word-index="1"]')?.classList.contains("page-word--glide-adj")).toBe(false);
    expect(doc.querySelector('[data-word-index="3"]')?.classList.contains("page-word--glide-adj")).toBe(false);
    expect(doc.querySelector('[data-word-index="2"]')?.classList.contains("page-word--active-word")).toBe(true);
  });

  it("injects iframe CSS for chunk and active word classes", () => {
    const { doc } = makeRoot("");

    injectStyles(doc, {
      fontFamily: "Georgia, serif",
      layoutSpacing: { line: 1.8, paragraph: 1 },
    } as unknown as BlurbySettings);

    const css = doc.getElementById("blurby-theme")?.textContent ?? "";
    expect(css).toContain(".page-word--chunk-active");
    expect(css).toContain(".page-word--active-word");
    expect(css).toContain(".page-word--glide-adj");
    expect(css).toContain("color: #ffffff");
    expect(css).toContain("border-radius: 3px");
  });

  it("injects spacer hooks so first and final page content can sit inside the Flow zone", () => {
    const { doc } = makeRoot("");

    injectStyles(doc, {
      fontFamily: "Georgia, serif",
      layoutSpacing: { line: 1.8, paragraph: 1 },
    } as unknown as BlurbySettings, 100, {
      flowLeadingInsetPx: 210,
      flowTrailingInsetPx: 390,
    });

    const css = doc.getElementById("blurby-theme")?.textContent ?? "";
    expect(doc.documentElement.style.getPropertyValue("--blurby-flow-leading-inset")).toBe("210px");
    expect(doc.documentElement.style.getPropertyValue("--blurby-flow-trailing-inset")).toBe("390px");
    expect(css).toContain("padding-block-start: var(--blurby-flow-leading-inset, 0px) !important");
    expect(css).toContain("padding-block-end: var(--blurby-flow-trailing-inset, 0px) !important");
  });
});
