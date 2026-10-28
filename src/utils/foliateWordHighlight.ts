import type { ChunkReadingVisualState } from "../types/chunkReading";
import type { FlowRenderedWordRootDescriptor } from "./FlowScrollEngine";

export type FoliateWordHighlightClass = "page-word--flow-cursor" | "page-word--highlighted";

export function shouldSuppressNarrateFlowCursor(
  readingMode: string | undefined,
  chunkReadingVisualState: ChunkReadingVisualState | null | undefined,
): boolean {
  return readingMode === "narrate"
    && chunkReadingVisualState?.mode === "narrate"
    && chunkReadingVisualState?.activeChunkRange != null;
}

const CHUNK_ACTIVE_CLASS = "page-word--chunk-active";
const ACTIVE_WORD_CLASS = "page-word--active-word";

export function resolveFoliateWordHighlightClass(
  readingMode: string | undefined,
  styleHint?: "flow",
): FoliateWordHighlightClass {
  return styleHint === "flow" || readingMode === "flow" || readingMode === "narrate"
    ? "page-word--flow-cursor"
    : "page-word--highlighted";
}

function parseWordIndex(el: Element): number | null {
  const value = Number.parseInt(el.getAttribute("data-word-index") || "", 10);
  return Number.isNaN(value) ? null : value;
}

export function clearChunkReadingVisualStateFromRoots(
  roots: FlowRenderedWordRootDescriptor[],
): void {
  for (const { root } of roots) {
    try {
      root.querySelectorAll?.(`.${CHUNK_ACTIVE_CLASS}, .${ACTIVE_WORD_CLASS}`).forEach((el) => {
        el.classList.remove(CHUNK_ACTIVE_CLASS, ACTIVE_WORD_CLASS);
      });
    } catch {
      // Render roots can be detached while Foliate is paging; stale roots are harmless.
    }
  }
}

export function applyChunkReadingVisualStateToRoots(
  roots: FlowRenderedWordRootDescriptor[],
  state: ChunkReadingVisualState | null,
): void {
  clearChunkReadingVisualStateFromRoots(roots);
  const range = state?.activeChunkRange;
  if (!range) return;

  for (const { root } of roots) {
    try {
      root.querySelectorAll?.<HTMLElement>("[data-word-index]").forEach((el) => {
        const wordIndex = parseWordIndex(el);
        if (wordIndex == null) return;
        if (wordIndex >= range.startWordIndex && wordIndex < range.endWordIndex) {
          el.classList.add(CHUNK_ACTIVE_CLASS);
        }
        if (state.activeWordIndex != null && wordIndex === state.activeWordIndex) {
          el.classList.add(ACTIVE_WORD_CLASS);
        }
      });
    } catch {
      // Render roots can be detached while Foliate is paging; stale roots are harmless.
    }
  }
}
