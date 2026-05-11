// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { applyChunkReadingVisualStateToRoots, clearChunkReadingVisualStateFromRoots } from "../src/utils/foliateWordHighlight";
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

  it("clear helper removes chunk visual state from every rendered root", () => {
    const { doc, roots } = makeRoot(`
      <span class="page-word page-word--chunk-active page-word--active-word" data-word-index="1">One</span>
    `);

    clearChunkReadingVisualStateFromRoots(roots);

    expect(doc.querySelector(".page-word")?.className).toBe("page-word");
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
    expect(css).toContain("color-mix(in srgb, var(--accent, #FF5B7F) 16%, transparent)");
    expect(css).toContain("color-mix(in srgb, var(--accent, #FF5B7F) 28%, transparent)");
  });
});
