import type { ChunkReadingVisualState } from "../types/chunkReading";
import type { FlowRenderedWordRootDescriptor } from "./FlowScrollEngine";

export type FoliateWordHighlightClass =
  | "page-word--flow-cursor"
  | "page-word--narrate-cursor"
  | "page-word--highlighted";

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
const GLIDE_ADJ_CLASS = "page-word--glide-adj";

export type ChunkReadingScrollTarget = "follow-word" | "chunk-start";

export function resolveFoliateWordHighlightClass(
  readingMode: string | undefined,
  styleHint?: "flow" | "narrate",
): FoliateWordHighlightClass {
  if (styleHint === "narrate" || readingMode === "narrate") return "page-word--narrate-cursor";
  if (styleHint === "flow" || readingMode === "flow") return "page-word--flow-cursor";
  return "page-word--highlighted";
}

function parseWordIndex(el: Element): number | null {
  const value = Number.parseInt(el.getAttribute("data-word-index") || "", 10);
  return Number.isNaN(value) ? null : value;
}

function resolveFrameOffsetTop(doc: Document): number {
  let offsetTop = 0;
  let currentWindow = doc.defaultView;
  const visited = new Set<Window>();

  while (currentWindow && !visited.has(currentWindow)) {
    visited.add(currentWindow);
    const frame = currentWindow.frameElement;
    if (!frame) break;
    try {
      offsetTop += frame.getBoundingClientRect().top;
      currentWindow = frame.ownerDocument?.defaultView ?? null;
    } catch {
      break;
    }
  }

  return offsetTop;
}

function resolveElementViewportTop(el: HTMLElement): number {
  return el.getBoundingClientRect().top + resolveFrameOffsetTop(el.ownerDocument);
}

export function clearChunkReadingVisualStateFromRoots(
  roots: FlowRenderedWordRootDescriptor[],
): void {
  for (const { root } of roots) {
    try {
      root.querySelectorAll?.(`.${CHUNK_ACTIVE_CLASS}, .${ACTIVE_WORD_CLASS}, .${GLIDE_ADJ_CLASS}`).forEach((el) => {
        el.classList.remove(CHUNK_ACTIVE_CLASS, ACTIVE_WORD_CLASS, GLIDE_ADJ_CLASS);
      });
    } catch {
      // Render roots can be detached while Foliate is paging; stale roots are harmless.
    }
  }
}

function nearestBlockAncestor(el: Element): Element | null {
  return el.closest("p, li, blockquote, figcaption, h1, h2, h3, h4, h5, h6, td, th, dt, dd");
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
      const wordEls = root.querySelectorAll?.<HTMLElement>("[data-word-index]");
      if (!wordEls) continue;

      const wordMap = new Map<number, HTMLElement[]>();
      wordEls.forEach((el) => {
        const idx = parseWordIndex(el);
        if (idx != null) {
          const arr = wordMap.get(idx);
          if (arr) arr.push(el);
          else wordMap.set(idx, [el]);
        }
      });

      wordMap.forEach((els, wordIndex) => {
        if (wordIndex >= range.startWordIndex && wordIndex < range.endWordIndex) {
          els.forEach(el => el.classList.add(CHUNK_ACTIVE_CLASS));
        }
      });

      if (state.activeWordIndex != null) {
        const activeEls = wordMap.get(state.activeWordIndex);
        if (activeEls?.length) {
          activeEls.forEach(el => el.classList.add(ACTIVE_WORD_CLASS));
          const activeBlock = nearestBlockAncestor(activeEls[0]);

          const prevEls = wordMap.get(state.activeWordIndex - 1);
          if (prevEls?.length && activeBlock && nearestBlockAncestor(prevEls[0]) === activeBlock) {
            prevEls.forEach(el => el.classList.add(GLIDE_ADJ_CLASS));
          }

          const nextEls = wordMap.get(state.activeWordIndex + 1);
          if (nextEls?.length && activeBlock && nearestBlockAncestor(nextEls[0]) === activeBlock) {
            nextEls.forEach(el => el.classList.add(GLIDE_ADJ_CLASS));
          }
        }
      }
    } catch {
      // Render roots can be detached while Foliate is paging; stale roots are harmless.
    }
  }
}

export function resolveChunkReadingFollowWordIndex(state: ChunkReadingVisualState | null): number | null {
  if (state?.activeWordIndex != null) return state.activeWordIndex;
  return state?.activeChunkRange?.startWordIndex ?? null;
}

export function resolveChunkReadingScrollWordIndex(
  state: ChunkReadingVisualState | null,
  target: ChunkReadingScrollTarget = "follow-word",
): number | null {
  if (target === "chunk-start") {
    return state?.activeChunkRange?.startWordIndex ?? null;
  }
  return resolveChunkReadingFollowWordIndex(state);
}

export function buildChunkReadingScrollKey(state: ChunkReadingVisualState | null): string | null {
  const range = state?.activeChunkRange;
  if (!state || !range) return null;
  const followWordIndex = resolveChunkReadingFollowWordIndex(state);
  if (followWordIndex == null) return null;
  const followKey = state.activeWordIndex != null ? `word:${followWordIndex}` : "chunk";
  return `${state.mode}:${state.activeChunkId ?? "range"}:${range.startWordIndex}:${range.endWordIndex}:${followKey}`;
}

export function scrollChunkReadingVisualStateToTopOfRoots(
  roots: FlowRenderedWordRootDescriptor[],
  state: ChunkReadingVisualState | null,
  options: {
    behavior?: ScrollBehavior;
    scrollContainer?: HTMLElement | null;
    target?: ChunkReadingScrollTarget;
    topOffsetPx?: number;
  } = {},
): boolean {
  const followWordIndex = resolveChunkReadingScrollWordIndex(state, options.target);
  if (followWordIndex == null) return false;

  for (const { root } of roots) {
    try {
      const target = root.querySelector?.<HTMLElement>(`[data-word-index="${followWordIndex}"]`);
      if (!target) continue;
      const scrollContainer = options.scrollContainer ?? null;
      if (scrollContainer) {
        const topOffsetPx = Math.max(0, options.topOffsetPx ?? 0);
        const targetTop = resolveElementViewportTop(target);
        const containerTop = resolveElementViewportTop(scrollContainer);
        const nextTop = Math.max(
          0,
          scrollContainer.scrollTop + targetTop - containerTop - topOffsetPx,
        );
        scrollContainer.scrollTo?.({
          top: nextTop,
          behavior: options.behavior ?? "auto",
        });
        if (!scrollContainer.scrollTo) {
          scrollContainer.scrollTop = nextTop;
        }
        return true;
      }
      if (!target.scrollIntoView) continue;
      target.scrollIntoView({
        block: "start",
        inline: "nearest",
        behavior: options.behavior ?? "auto",
      });
      return true;
    } catch {
      // Render roots can be detached while Foliate is paging; stale roots are harmless.
    }
  }

  return false;
}
