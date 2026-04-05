/**
 * FoliatePageView — renders EPUBs using foliate-js with native HTML formatting.
 * Replaces the word-by-word text rendering for EPUB files.
 *
 * Architecture:
 * - foliate-js's <foliate-view> custom element runs in a shadow DOM
 * - EPUB loaded as a File object from arraybuffer sent via IPC
 * - Pagination handled by CSS multi-column layout (DOM-based, not estimation)
 * - Position tracked via EPUB CFI (exact, survives content changes)
 * - Events: relocate (position change), load (section rendered)
 */
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { BlurbyDoc, BlurbySettings } from "../types";
import { segmentWordSpans, type SegmentedWordSpan } from "../utils/segmentWords";
import {
  getSectionGlobalOffset,
  resolveGlobalWordIndexToRendered,
  resolveRenderedWordIndexToGlobal,
} from "../utils/foliateWordOffsets";
import { DEFAULT_WPM, FOLIATE_BASE_FONT_SIZE_PX, FOLIATE_RENDERER_HEIGHT_MARGIN_PX, FOLIATE_MARGIN_PX, FOLIATE_MAX_INLINE_SIZE_PX, FOLIATE_TWO_COLUMN_BREAKPOINT_PX } from "../constants";
import { recordDiagEvent } from "../utils/narrateDiagnostics";

const api = window.electronAPI;

/** Word entry with optional Range — Range is null when the section is unloaded. */
export interface FoliateWord {
  word: string;
  range: Range | null;
  sectionIndex: number;
}

/** Extract all words from a foliate view's currently loaded sections.
 *  Returns word strings and their DOM Ranges for highlighting. */
const BLOCK_TAGS = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "LI", "TD", "SECTION", "ARTICLE"]);

function hasToken(value: string | null | undefined, token: string): boolean {
  return String(value || "").toLowerCase().split(/\s+/).includes(token.toLowerCase());
}

function isFootnoteRefElement(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  const href = el.getAttribute("href") || "";
  const epubType = el.getAttribute("epub:type") || "";
  const role = el.getAttribute("role") || "";
  const cls = `${el.getAttribute("class") || ""} ${el.id || ""}`.toLowerCase();

  if (hasToken(epubType, "noteref") || hasToken(role, "doc-noteref")) return true;
  if (tag === "a" && href.startsWith("#") && /note|footnote|endnote|fn|ref/.test(cls)) return true;
  if (tag === "a" && href.startsWith("#") && el.parentElement?.tagName.toLowerCase() === "sup") return true;
  if (tag === "sup" && /note|footnote|endnote|fn|ref/.test(cls)) return true;
  return false;
}

function isFootnoteBodyElement(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  const epubType = el.getAttribute("epub:type") || "";
  const role = el.getAttribute("role") || "";
  const cls = `${el.getAttribute("class") || ""} ${el.id || ""}`.toLowerCase();

  if (hasToken(epubType, "footnote") || hasToken(epubType, "endnote") || hasToken(role, "doc-footnote") || hasToken(role, "doc-endnote")) {
    return true;
  }
  if ((tag === "aside" || tag === "section" || tag === "li" || tag === "div" || tag === "p") && /footnote|endnote|notes?\b|fn\d+/.test(cls)) {
    return true;
  }
  return false;
}

function isSuppressedNarrationTextNode(node: Node): boolean {
  let el = node.parentElement;
  while (el) {
    if (isFootnoteRefElement(el) || isFootnoteBodyElement(el)) return true;
    el = el.parentElement;
  }
  return false;
}

function getBlockParent(node: Node): Element | null {
  let el = node.parentElement;
  while (el && !BLOCK_TAGS.has(el.tagName)) el = el.parentElement;
  return el;
}

function collectBlockTextNodes(root: ParentNode): Array<{ block: Element; nodes: Text[] }> {
  const groups = new Map<Element, Text[]>();
  const order: Element[] = [];
      const walker = root.ownerDocument?.createTreeWalker?.(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node: Node) => {
      const parent = node.parentElement;
      if (parent && (parent.tagName === "SCRIPT" || parent.tagName === "STYLE")) return NodeFilter.FILTER_REJECT;
      if (!node.textContent) return NodeFilter.FILTER_REJECT;
      if (isSuppressedNarrationTextNode(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  if (!walker) return [];

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    const block = getBlockParent(node) || (root instanceof Element ? root : root.ownerDocument?.body);
    if (!block) continue;
    if (!groups.has(block)) {
      groups.set(block, []);
      order.push(block);
    }
    groups.get(block)!.push(node);
  }

  return order.map((block) => ({ block, nodes: groups.get(block) || [] }));
}

function locateTextOffset(nodes: Text[], absoluteOffset: number): { node: Text; offset: number } | null {
  let cursor = 0;
  for (const node of nodes) {
    const text = node.textContent || "";
    const next = cursor + text.length;
    if (absoluteOffset < next) {
      return { node, offset: absoluteOffset - cursor };
    }
    if (absoluteOffset === next) {
      return { node, offset: text.length };
    }
    cursor = next;
  }
  const last = nodes[nodes.length - 1];
  if (!last) return null;
  return { node: last, offset: (last.textContent || "").length };
}

function buildWordsFromTextNodes(nodes: Text[], sectionIndex: number): FoliateWord[] {
  if (nodes.length === 0) return [];
  const combined = nodes.map((node) => node.textContent || "").join("");
  const wordSpans = segmentWordSpans(combined);
  const words: FoliateWord[] = [];

  for (const { word, start, end } of wordSpans) {
    const startPos = locateTextOffset(nodes, start);
    const endPos = locateTextOffset(nodes, end);
    if (!startPos || !endPos) continue;
    const doc = startPos.node.ownerDocument;
    const range = doc.createRange();
    range.setStart(startPos.node, startPos.offset);
    range.setEnd(endPos.node, endPos.offset);
    words.push({ word, range, sectionIndex });
  }

  return words;
}

function buildWrappedFragmentForNode(
  doc: Document,
  text: string,
  nodeStart: number,
  wordSpans: Array<SegmentedWordSpan & { globalIndex: number }>,
): DocumentFragment | null {
  const nodeEnd = nodeStart + text.length;
  const overlaps = wordSpans.filter((span) => span.end > nodeStart && span.start < nodeEnd);
  if (overlaps.length === 0) return null;

  const frag = doc.createDocumentFragment();
  let cursor = nodeStart;
  for (const span of overlaps) {
    const overlapStart = Math.max(nodeStart, span.start);
    const overlapEnd = Math.min(nodeEnd, span.end);
    if (overlapStart > cursor) {
      frag.appendChild(doc.createTextNode(text.slice(cursor - nodeStart, overlapStart - nodeStart)));
    }

    const wrappedText = text.slice(overlapStart - nodeStart, overlapEnd - nodeStart);
    const el = doc.createElement("span");
    el.className = "page-word";
    el.setAttribute("data-word-index", String(span.globalIndex));
    el.setAttribute("data-word-full", span.word);
    el.textContent = wrappedText;
    frag.appendChild(el);

    cursor = overlapEnd;
  }

  if (cursor < nodeEnd) {
    frag.appendChild(doc.createTextNode(text.slice(cursor - nodeStart)));
  }
  return frag;
}

function extractWordsFromView(view: any): { words: FoliateWord[]; paragraphBreaks: Set<number> } {
  const words: FoliateWord[] = [];
  const paragraphBreaks = new Set<number>();
  if (!view?.renderer?.getContents) return { words, paragraphBreaks };

  for (const { doc, index } of view.renderer.getContents()) {
    if (!doc?.body) continue;

    const blockGroups = collectBlockTextNodes(doc.body);
    for (const { nodes } of blockGroups) {
      const blockWords = buildWordsFromTextNodes(nodes, index);
      if (blockWords.length === 0) continue;
      words.push(...blockWords);
      paragraphBreaks.add(words.length - 1);
    }
  }
  return { words, paragraphBreaks };
}

/** Extract words from a single section's document (for incremental updates during narration) */
function extractWordsFromSection(doc: Document, sectionIndex: number): FoliateWord[] {
  const words: FoliateWord[] = [];
  if (!doc?.body) return words;
  const groups = collectBlockTextNodes(doc.body);
  for (const { nodes } of groups) {
    words.push(...buildWordsFromTextNodes(nodes, sectionIndex));
  }
  return words;
}


/** Remove all .page-word wrapper spans and restore their text as plain text nodes.
 *  Used by HOTFIX-10 to re-stamp sections with corrected global indices. */
export function unwrapWordSpans(doc: Document): void {
  const spans = doc.querySelectorAll("span.page-word");
  for (const span of spans) {
    const parent = span.parentNode;
    if (!parent) continue;
    const text = doc.createTextNode(span.textContent || "");
    parent.replaceChild(text, span);
  }
  // Normalize adjacent text nodes (merge consecutive text nodes created by unwrapping)
  doc.body.normalize();
}

/** Walk the EPUB section DOM and wrap each word in a <span class="page-word" data-word-index="N">.
 *  Must be called AFTER extractWordsFromView (which needs raw text nodes for Range creation).
 *  Returns the next available global index. */
export function wrapWordsInSpans(doc: Document, sectionIndex: number, globalOffset: number): number {
  let globalIndex = globalOffset;
  const groups = collectBlockTextNodes(doc.body);

  for (const { nodes } of groups) {
    const combined = nodes.map((node) => node.textContent || "").join("");
    const wordSpans = segmentWordSpans(combined).map((span, idx) => ({
      ...span,
      globalIndex: globalIndex + idx,
    }));
    globalIndex += wordSpans.length;

    let nodeStart = 0;
    for (const textNode of nodes) {
      const text = textNode.textContent || "";
      const parent = textNode.parentNode;
      if (!parent) {
        nodeStart += text.length;
        continue;
      }

      const frag = buildWrappedFragmentForNode(doc, text, nodeStart, wordSpans);
      if (frag) {
        parent.replaceChild(frag, textNode);
      }
      nodeStart += text.length;
    }
  }

  return globalIndex;
}

interface FoliatePageViewProps {
  activeDoc: BlurbyDoc & { content?: string };
  settings: BlurbySettings;
  onRelocate?: (detail: { cfi: string; fraction: number; tocItem?: any; pageItem?: any }) => void;
  onTocReady?: (toc: any[], sectionCount: number) => void;
  onWordClick?: (cfi: string, word: string, sectionIndex?: number, wordOffsetInSection?: number, globalWordIndex?: number) => void;
  onLoad?: () => void;
  onWordsReextracted?: () => void;
  initialCfi?: string | null;
  focusTextSize?: number;
  /** Ref for imperative access (getWords, goTo, next, prev) */
  viewApiRef?: React.MutableRefObject<FoliateViewAPI | null>;
  /** Whether a reading mode (flow/narration) is actively advancing words */
  isReading?: boolean;
  /** Callback to scroll foliate to where the current highlight is */
  onJumpToHighlight?: () => void;
  /** Current reading mode — "page", "flow", or "focus" */
  readingMode?: string;
  /** Whether Flow mode is actively playing */
  flowPlaying?: boolean;
  /** Currently highlighted word index in Flow mode */
  highlightedWordIndex?: number;
  /** Words per minute for Flow mode timing */
  wpm?: number;
  /** Callback when Flow mode advances to the next word */
  onFlowWordAdvance?: (idx: number) => void;
  /** Current word index being narrated (overlay highlight) */
  narrationWordIndex?: number;
  /** Book-wide section boundaries from main-process extraction (HOTFIX-10: global index stamping) */
  bookWordSections?: import("../types/narration").SectionBoundary[];
  /** FLOW-3A: When true, foliate uses flow="scrolled" for infinite scroll */
  flowMode?: boolean;
  /** FLOW-3A: Ref to expose the scrollable container element to FlowScrollEngine */
  scrollContainerRef?: React.MutableRefObject<HTMLElement | null>;
  /** FLOW-3A: Ref to expose the cursor element to FlowScrollEngine */
  flowCursorRef?: React.MutableRefObject<HTMLDivElement | null>;
}

export interface FoliateViewAPI {
  getWords: () => FoliateWord[];
  getParagraphBreaks: () => Set<number>;
  goTo: (target: string | number) => Promise<any>;
  goToFraction: (frac: number) => Promise<void>;
  next: () => void;
  prev: () => void;
  highlightWord: (range: Range | null, sectionIndex: number) => void;
  /** Highlight a word by global index. Returns true if found, false if span not in DOM. */
  highlightWordByIndex: (wordIndex: number, styleHint?: "flow" | "narration") => boolean;
  clearHighlight: () => void;
  getView: () => any;
  /** Find the first word span visible on the current page. Returns its data-word-index or -1 if no words visible. */
  findFirstVisibleWordIndex: () => number;
  /** Whether the user has manually browsed away from narration position */
  isUserBrowsing: () => boolean;
  /** Clear the user browsing flag and scroll to current narration word */
  returnToNarration: () => void;
  /** NAR-3: Get total number of sections in the EPUB */
  getSectionCount: () => number;
  /** NAR-3: Navigate to a specific section by index. Triggers a load event when ready. */
  goToSection: (sectionIndex: number) => Promise<void>;
  /** NAR-3: Extract words from a specific section's DOM (must be currently loaded) */
  extractSectionWords: (sectionIndex: number) => FoliateWord[];
  /** FLOW-3A: Get the scrollable container element for FlowScrollEngine */
  getScrollContainer: () => HTMLElement | null;
  /** TTS-7F: Pure read-only DOM check — is a word span present? No UI mutation. */
  isWordInDom: (wordIndex: number) => boolean;
  /** TTS-7H: Visible-word readiness — word is in DOM AND visible on the active page viewport. */
  isWordVisibleOnPage: (wordIndex: number) => boolean;
  /** TTS-7H: Resolve section index for a given global word index (for fallback navigation). */
  getSectionForWordIndex: (wordIndex: number) => number | null;
  /** TTS-7I: Shared render-state resolver — single source of truth for gate + highlight.
   *  Returns whether the word span exists, is visible on the active page, and the DOM refs. */
  resolveWordState: (wordIndex: number) => { found: boolean; visible: boolean; span: HTMLElement | null; doc: Document | null };
}

export default function FoliatePageView({
  activeDoc,
  settings,
  onRelocate,
  onTocReady,
  onWordClick,
  onLoad,
  onWordsReextracted,
  initialCfi,
  focusTextSize,
  viewApiRef,
  isReading,
  onJumpToHighlight,
  readingMode,
  flowPlaying,
  highlightedWordIndex,
  wpm,
  onFlowWordAdvance,
  narrationWordIndex,
  bookWordSections,
  flowMode,
  scrollContainerRef,
  flowCursorRef,
}: FoliatePageViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const foliateHostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<any>(null);
  const foliateWordsRef = useRef<FoliateWord[]>([]);
  const foliateParagraphBreaksRef = useRef<Set<number>>(new Set());
  const foliateIframeRef = useRef<HTMLIFrameElement | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const flowRafRef = useRef<number>(0);
  const narrationOverlayRafRef = useRef<number>(0);
  const narrationOverlayCurrentRef = useRef<{ x: number; y: number; width: number; height: number; ready: boolean }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    ready: false,
  });
  const narrationOverlayTargetRef = useRef<{ x: number; y: number; width: number; height: number; active: boolean }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    active: false,
  });
  const narrationOverlaySegmentFromRef = useRef<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const narrationOverlaySegmentStartRef = useRef<number>(0);
  const narrationOverlaySegmentDurationRef = useRef<number>(180);
  const narrationOverlayLastAdvanceRef = useRef<number>(0);
  const narrationOverlayAverageDurationRef = useRef<number>(180);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Store flow-mode callback in a ref to avoid re-render loops
  const onFlowWordAdvanceRef = useRef(onFlowWordAdvance);
  onFlowWordAdvanceRef.current = onFlowWordAdvance;
  const onWordClickRef = useRef(onWordClick);
  onWordClickRef.current = onWordClick;
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;
  const onWordsReextractedRef = useRef(onWordsReextracted);
  onWordsReextractedRef.current = onWordsReextracted;
  const bookWordSectionsRef = useRef(bookWordSections);
  bookWordSectionsRef.current = bookWordSections;
  const highlightedWordIndexRef = useRef(highlightedWordIndex);
  highlightedWordIndexRef.current = highlightedWordIndex;
  const readingModeRef = useRef(readingMode);
  // Track when user has manually browsed away during narration — suppresses scrollToAnchor
  const userBrowsingRef = useRef(false);
  readingModeRef.current = readingMode;

  const hideNarrationOverlay = useCallback(() => {
    if (narrationOverlayRafRef.current) {
      cancelAnimationFrame(narrationOverlayRafRef.current);
      narrationOverlayRafRef.current = 0;
    }
    narrationOverlayTargetRef.current.active = false;
    narrationOverlayCurrentRef.current.ready = false;
    narrationOverlaySegmentStartRef.current = 0;
    narrationOverlayLastAdvanceRef.current = 0;
    narrationOverlayAverageDurationRef.current = 180;
    if (highlightRef.current) {
      highlightRef.current.style.display = "none";
      highlightRef.current.style.opacity = "0";
    }
  }, []);

  const ensureNarrationOverlayLoop = useCallback(() => {
    if (narrationOverlayRafRef.current) return;

    const tick = (ts: number) => {
      const overlay = highlightRef.current;
      const target = narrationOverlayTargetRef.current;
      const current = narrationOverlayCurrentRef.current;
      if (!overlay || !target.active) {
        narrationOverlayRafRef.current = 0;
        return;
      }
      const from = narrationOverlaySegmentFromRef.current;
      const duration = Math.max(1, narrationOverlaySegmentDurationRef.current);
      const progress = Math.min(1, (ts - narrationOverlaySegmentStartRef.current) / duration);

      if (!current.ready) {
        current.x = from.x;
        current.y = from.y;
        current.width = from.width;
        current.height = from.height;
        current.ready = true;
      }

      const lerp = (fromValue: number, toValue: number) => fromValue + (toValue - fromValue) * progress;
      current.x = lerp(from.x, target.x);
      current.y = lerp(from.y, target.y);
      current.width = lerp(from.width, target.width);
      current.height = lerp(from.height, target.height);

      overlay.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      overlay.style.width = `${Math.max(16, current.width)}px`;
      overlay.style.height = `${Math.max(12, current.height)}px`;
      overlay.style.opacity = "1";
      overlay.style.display = "block";

      if (progress < 1) {
        narrationOverlayRafRef.current = requestAnimationFrame(tick);
      } else {
        current.x = target.x;
        current.y = target.y;
        current.width = target.width;
        current.height = target.height;
        narrationOverlayRafRef.current = 0;
      }
    };

    narrationOverlayRafRef.current = requestAnimationFrame(tick);
  }, []);

  const clearVisualWordClasses = useCallback((contents: Array<{ doc: Document }>) => {
    for (const { doc: d } of contents) {
      try {
        d?.querySelectorAll?.(".page-word--highlighted")?.forEach((el: Element) => {
          el.classList.remove("page-word--highlighted");
        });
        d?.querySelectorAll?.(".page-word--flow-cursor")?.forEach((el: Element) => {
          el.classList.remove("page-word--flow-cursor");
        });
        d?.querySelectorAll?.(".page-word--narration-context")?.forEach((el: Element) => {
          el.classList.remove("page-word--narration-context");
        });
      } catch {
        // Safe to ignore for detached/partial docs.
      }
    }
  }, []);

  const measureNarrationWindow = useCallback((doc: Document | null, wordIndex: number) => {
    const container = containerRef.current;
    if (!container || !doc) return null;
    const frame = doc.defaultView?.frameElement as HTMLElement | null;
    if (!frame) return null;

    const containerRect = container.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    const primaryEls = Array.from(doc.querySelectorAll(`[data-word-index="${wordIndex}"]`)) as HTMLElement[];
    if (primaryEls.length === 0) return null;

    const primaryRects = primaryEls
      .map((el) => el.getBoundingClientRect())
      .filter((rect) => rect.width > 0 && rect.height > 0);
    const primaryTop = primaryRects[0]?.top;
    if (primaryRects.length === 0 || primaryTop == null) return null;

    const lineTolerance = Math.max(primaryRects[0].height * 0.65, 10);
    const allRects: DOMRect[] = [];
    for (let offset = 0; offset <= 2; offset++) {
      const els = Array.from(doc.querySelectorAll(`[data-word-index="${wordIndex + offset}"]`)) as HTMLElement[];
      for (const el of els) {
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;
        if (Math.abs(rect.top - primaryTop) > lineTolerance) continue;
        allRects.push(rect);
      }
    }
    if (allRects.length === 0) return null;

    const minLeft = Math.min(...allRects.map((rect) => rect.left));
    const minTop = Math.min(...allRects.map((rect) => rect.top));
    const maxRight = Math.max(...allRects.map((rect) => rect.right));
    const maxBottom = Math.max(...allRects.map((rect) => rect.bottom));
    const horizontalPad = 8;
    const verticalPad = 2;
    return {
      x: frameRect.left + minLeft - containerRect.left - horizontalPad,
      y: frameRect.top + minTop - containerRect.top - verticalPad,
      width: Math.max(16, maxRight - minLeft + horizontalPad * 2),
      height: Math.max(12, maxBottom - minTop + verticalPad * 2),
    };
  }, []);

  const positionNarrationOverlay = useCallback((doc: Document | null, wordIndex: number) => {
    const overlay = highlightRef.current;
    if (!overlay || !doc) {
      hideNarrationOverlay();
      return;
    }

    const currentWindow = measureNarrationWindow(doc, wordIndex);
    if (!currentWindow) {
      hideNarrationOverlay();
      return;
    }

    let nextWindow = measureNarrationWindow(doc, wordIndex + 1) || currentWindow;
    const sameLineTolerance = Math.max(8, currentWindow.height * 0.6);
    const staysOnSameLine = Math.abs(nextWindow.y - currentWindow.y) <= sameLineTolerance;
    const movesForward = nextWindow.x >= currentWindow.x - 4;
    if (!staysOnSameLine || !movesForward) {
      // Avoid diagonal/sideways jitter when the next spoken word wraps lines,
      // changes columns, or otherwise measures "behind" the current band.
      // In those cases hold the band on the current window and let the next
      // word advance establish the new segment cleanly.
      nextWindow = currentWindow;
    } else {
      // Within a stable line, keep the band shape steady and glide mostly
      // horizontally. Re-sizing/re-centering every word makes the cursor feel
      // twitchy even when timing is close.
      nextWindow = {
        x: nextWindow.x,
        y: currentWindow.y,
        width: currentWindow.width,
        height: currentWindow.height,
      };
    }
    const now = performance.now();
    const previousAdvance = narrationOverlayLastAdvanceRef.current;
    const observedInterval = previousAdvance > 0 ? Math.max(70, Math.min(now - previousAdvance, 420)) : 180;
    const smoothedInterval = previousAdvance > 0
      ? narrationOverlayAverageDurationRef.current * 0.65 + observedInterval * 0.35
      : observedInterval;
    narrationOverlayAverageDurationRef.current = smoothedInterval;
    narrationOverlayLastAdvanceRef.current = now;

    narrationOverlayCurrentRef.current = { ...currentWindow, ready: true };
    narrationOverlaySegmentFromRef.current = { ...currentWindow };
    narrationOverlayTargetRef.current = { ...nextWindow, active: true };
    narrationOverlaySegmentStartRef.current = now;
    narrationOverlaySegmentDurationRef.current = smoothedInterval;

    overlay.style.display = "block";
    overlay.style.opacity = "1";
    overlay.style.transform = `translate3d(${currentWindow.x}px, ${currentWindow.y}px, 0)`;
    overlay.style.width = `${currentWindow.width}px`;
    overlay.style.height = `${currentWindow.height}px`;
    ensureNarrationOverlayLoop();
  }, [ensureNarrationOverlayLoop, hideNarrationOverlay, measureNarrationWindow]);

  const applyVisualHighlightByIndex = useCallback((
    wordIndex: number,
    styleHint?: "flow" | "narration",
    allowMotion = true,
  ): boolean => {
    const view = viewRef.current;
    if (!view?.renderer || !viewApiRef?.current) return false;

    const state = viewApiRef.current.resolveWordState(wordIndex);
    const contents = view.renderer?.getContents?.() ?? [];
    const isFlowMode = styleHint === "flow" || readingModeRef.current === "flow";
    const isNarrationMode = styleHint === "narration" || readingModeRef.current === "narration";
    const highlightClass = isFlowMode ? "page-word--flow-cursor" : "page-word--highlighted";

    if (!isNarrationMode) {
      clearVisualWordClasses(contents);
      hideNarrationOverlay();
    }

    if (!state.found || !state.span) {
      if (process.env.NODE_ENV !== "production") {
        console.debug(`[foliate] highlightWordByIndex miss: word ${wordIndex} not in DOM`);
      }
      return false;
    }

    if (isNarrationMode) {
      // For narration we want one contiguous gliding overlay rather than
      // three separately highlighted word boxes. The canonical anchor is still
      // the first word, but the visible treatment is overlay-only.
      for (let offset = 1; offset <= 2; offset++) {
        const contextIdx = wordIndex + offset;
        state.doc?.querySelectorAll?.(`[data-word-index="${contextIdx}"]`)?.forEach((el: Element) => {
          el.classList.add("page-word--narration-context");
        });
      }
      positionNarrationOverlay(state.doc, wordIndex);
    } else {
      state.doc?.querySelectorAll?.(`[data-word-index="${wordIndex}"]`)?.forEach((el: Element) => {
        el.classList.add(highlightClass);
      });
    }

    if (allowMotion && state.doc && !userBrowsingRef.current && !state.visible) {
      try {
        const range = state.doc.createRange();
        range.selectNodeContents(state.span);
        view.renderer.scrollToAnchor?.(range);
      } catch {
        // Safe to ignore.
      }
    }

    if (userBrowsingRef.current && state.visible) {
      userBrowsingRef.current = false;
    }

    return true;
  }, [clearVisualWordClasses, hideNarrationOverlay, positionNarrationOverlay, viewApiRef]);

  // Load EPUB via foliate-js
  useEffect(() => {
    if (!activeDoc?.filepath || !containerRef.current) return;

    let cancelled = false;
    const container = containerRef.current;

    // Create a host div that React doesn't manage — prevents removeChild conflicts
    if (!foliateHostRef.current) {
      foliateHostRef.current = document.createElement("div");
      foliateHostRef.current.style.cssText = "width:100%;height:100%;position:absolute;inset:0;";
      container.appendChild(foliateHostRef.current);
    }
    const host = foliateHostRef.current;

    const loadBook = async () => {
      try {
        setLoading(true);
        setError(null);

        // Import foliate-js modules (ESM, runs in renderer)
        await import("foliate-js/view.js");

        // Read file as arraybuffer via IPC
        const buffer: ArrayBuffer = await api.readFileBuffer(activeDoc.filepath!);
        if (cancelled) return;

        if (!buffer) {
          setError("Could not read EPUB file");
          setLoading(false);
          return;
        }

        // Create File object from buffer
        const fileName = (activeDoc.filepath || "book.epub").split(/[\\/]/).pop() || "book.epub";
        const file = new File([buffer], fileName, { type: "application/epub+zip" });

        // Create and mount the foliate-view element inside the non-React host
        const view = document.createElement("foliate-view") as any;
        host.innerHTML = "";
        host.appendChild(view);
        viewRef.current = view;

        // Attach load listener BEFORE open() — events may fire during init
        const onSectionLoad = (e: any) => {
          const { doc, index } = e.detail;
          // Inject Blurby theme styles into the EPUB document
          injectStyles(doc, settings, focusTextSize);

          // Cache iframe ref for this section's document
          if (doc !== document) {
            const iframes = host.querySelectorAll("iframe");
            for (const f of iframes) {
              try {
                if (f.contentDocument === doc) { foliateIframeRef.current = f; break; }
              } catch { /* cross-origin */ }
            }
          }

          // Extract words and wrap in spans
          const v2 = viewRef.current;
          if (v2) {
            // During narration/flow, only wrap the new section without re-extracting everything
            // (re-extraction shifts indices, breaking the narration's word array mapping)
            const isActiveMode = readingModeRef.current === "narration" || readingModeRef.current === "flow";
            const liveSections = bookWordSectionsRef.current;

            if (isActiveMode && foliateWordsRef.current.length > 0) {
              // Extract just this section's words and append/update in the existing array
              const sectionWords = extractWordsFromSection(doc, index);
              // HOTFIX-10: Use global offset from extraction data when available
              const bookSection = liveSections?.find(s => s.sectionIndex === index);
              // TTS-7J (BUG-129): Deduplicate — remove any existing words for this
              // sectionIndex before appending. Recovery/reload of the same section
              // previously doubled the word array (e.g. 8770 → 17540).
              const existingWithoutSection = foliateWordsRef.current.filter(w => w.sectionIndex !== index);
              const existingEnd = existingWithoutSection.length;
              const sectionStart = bookSection ? bookSection.startWordIdx : existingEnd;
              // Wrap this section's words with correct indices
              wrapWordsInSpans(doc, index, sectionStart);
              // Replace (not append) — deduped base + fresh section words
              const newSectionWords = sectionWords.map(w => ({ ...w, sectionIndex: index }));
              const prevTotal = foliateWordsRef.current.length;
              foliateWordsRef.current = [...existingWithoutSection, ...newSectionWords];
              const newTotal = foliateWordsRef.current.length;
              // TTS-7J: Diagnostic — track section word refresh and detect unexpected growth
              recordDiagEvent("word-source-refresh", `section ${index}: ${newSectionWords.length} words, total ${prevTotal} → ${newTotal}`);
              if (newTotal > prevTotal * 1.5 && prevTotal > 100) {
                recordDiagEvent("word-source-growth-warning", `unexpected growth: ${prevTotal} → ${newTotal} (${Math.round(newTotal / prevTotal * 100)}%)`);
                if (import.meta.env.DEV) console.warn(`[foliate] TTS-7J WARNING: word source grew unexpectedly: ${prevTotal} → ${newTotal}`);
              }
              if (import.meta.env.DEV) {
                console.debug(`[foliate] section ${index} words refreshed: ${newSectionWords.length} words, total now ${newTotal}`);
              }
              onWordsReextractedRef.current?.();
            } else {
              // Full re-extraction (Page mode or first load)
              const extracted = extractWordsFromView(v2);
              foliateWordsRef.current = extracted.words;
              foliateParagraphBreaksRef.current = extracted.paragraphBreaks;
              onWordsReextractedRef.current?.();
              // TTS selection-start fix: when full-book extraction boundaries exist,
              // stamp DOM spans with the global section offset, not the local loaded-slice
              // offset. Otherwise click/selection can report `0` for the first visible word
              // of a later section, causing narration to restart from the book beginning.
              const sectionStart = getSectionGlobalOffset(index, extracted.words, liveSections);
              if (sectionStart >= 0) {
                wrapWordsInSpans(doc, index, sectionStart);
              }
            }
          }

          // Delegated click handler — uses injected word spans (same pattern as PageReaderView)
          doc.body.addEventListener("click", (e: MouseEvent) => {
            const target = (e.target as HTMLElement)?.closest?.("[data-word-index]");
            if (!target) return;
            if ((e.target as HTMLElement)?.closest?.("a[href]")) return;

            const idx = parseInt(target.getAttribute("data-word-index") || "", 10);
            if (isNaN(idx)) return;
            const canonicalWord = target.getAttribute("data-word-full") || target.textContent || "";

            // Highlight via CSS class (same as PageReaderView)
            doc.querySelectorAll(".page-word--highlighted").forEach((el: Element) =>
              el.classList.remove("page-word--highlighted")
            );
            doc.querySelectorAll(`[data-word-index="${idx}"]`).forEach((el: Element) =>
              el.classList.add("page-word--highlighted")
            );

            // Report click to parent
            const v = viewRef.current;
            if (v) {
              const contents = v.renderer?.getContents?.() ?? [];
              const match = contents.find((c: any) => c.doc === doc);
              if (match) {
                const range = doc.createRange();
                range.selectNodeContents(target);
                const cfi = v.getCFI(match.index, range);
                const liveSections = bookWordSectionsRef.current;
                const exactIdx = resolveRenderedWordIndexToGlobal(match.index, idx, foliateWordsRef.current, liveSections);
                const sectionBase = getSectionGlobalOffset(match.index, foliateWordsRef.current, liveSections);
                const wordOffsetInSection = sectionBase >= 0 ? exactIdx - sectionBase : 0;
                onWordClickRef.current?.(cfi, canonicalWord, match.index, wordOffsetInSection, exactIdx);
              }
            }
          });

          // Also detect double-click word selection (native browser behavior)
          // TTS-7L (BUG-134): Resolve exact .page-word[data-word-index] span from
          // the selection, matching the click handler's exact-index contract.
          doc.addEventListener("selectionchange", () => {
            const sel = doc.getSelection();
            if (!sel || sel.isCollapsed || !sel.rangeCount) return;
            const range = sel.getRangeAt(0);
            const word = sel.toString().trim();
            if (!word || word.includes(" ")) return; // Only single words

            // TTS-7L: Find the .page-word span overlapping the selection.
            // The selection's anchorNode is inside (or is) the word span.
            const anchorEl = sel.anchorNode?.nodeType === Node.TEXT_NODE
              ? sel.anchorNode.parentElement
              : sel.anchorNode as Element | null;
            const wordSpan = anchorEl?.closest?.("[data-word-index]") as HTMLElement | null;

            const v = viewRef.current;
            if (v) {
              const contents = v.renderer.getContents?.() ?? [];
              const match = contents.find((c: any) => c.doc === doc);
              if (match) {
                const cfi = v.getCFI(match.index, range);

                if (wordSpan) {
                  // Exact span found — extract global index, same payload as click
                  const idx = parseInt(wordSpan.getAttribute("data-word-index") || "", 10);
                  if (!isNaN(idx)) {
                    // Highlight the selected span (match click behavior)
                    doc.querySelectorAll(".page-word--highlighted").forEach((el: Element) =>
                      el.classList.remove("page-word--highlighted")
                    );
                    doc.querySelectorAll(`[data-word-index="${idx}"]`).forEach((el: Element) =>
                      el.classList.add("page-word--highlighted")
                    );

                    const liveSections = bookWordSectionsRef.current;
                    const exactIdx = resolveRenderedWordIndexToGlobal(match.index, idx, foliateWordsRef.current, liveSections);
                    const sectionBase = getSectionGlobalOffset(match.index, foliateWordsRef.current, liveSections);
                    const wordOffsetInSection = sectionBase >= 0 ? exactIdx - sectionBase : 0;
                    const canonicalWord = wordSpan.getAttribute("data-word-full") || word;
                    if (import.meta.env.DEV) console.debug("[foliate] selection: exact span found — globalWordIndex:", exactIdx, "word:", canonicalWord);
                    onWordClickRef.current?.(cfi, canonicalWord, match.index, wordOffsetInSection, exactIdx);
                    return;
                  }
                }

                // No exact span — selection is on unwrapped text (rare: images, captions).
                // TTS-7L: Do NOT fall back to raw text. Log and skip.
                if (import.meta.env.DEV) console.debug("[foliate] selection: no .page-word span found for word:", word, "— skipping (no guessy fallback)");
              }
            }
          });

          // Forward keyboard events from iframe to parent window
          doc.addEventListener("keydown", (ke: KeyboardEvent) => {
            window.dispatchEvent(new KeyboardEvent("keydown", {
              key: ke.key, code: ke.code, keyCode: ke.keyCode,
              ctrlKey: ke.ctrlKey, shiftKey: ke.shiftKey, altKey: ke.altKey, metaKey: ke.metaKey,
              bubbles: true, cancelable: true,
            }));
          });
          onLoadRef.current?.();
        };
        view.addEventListener("load", onSectionLoad);

        view.addEventListener("relocate", (e: any) => {
          if (cancelled) return;
          const { cfi, tocItem, pageItem } = e.detail;
          const fraction = e.detail.fraction ?? 0;
          onRelocate?.({ cfi, fraction, tocItem, pageItem });
        });

        // Open the book
        await view.open(file);
        if (cancelled) return;

        // Set renderer attributes
        const scale = (focusTextSize || 100) / 100;
        const fontSize = Math.round(FOLIATE_BASE_FONT_SIZE_PX * scale);
        view.renderer.setAttribute("flow", flowMode ? "scrolled" : "paginated");
        view.renderer.setAttribute("margin", `${FOLIATE_MARGIN_PX}px`);
        // NOTE: Do NOT set "gap" — foliate-js interprets it as a percentage (default 7%).
        // Setting "48px" causes parseFloat→48 /100→0.48, consuming ~92% of width as gap.
        view.renderer.setAttribute("max-block-size", `${container.clientHeight - FOLIATE_RENDERER_HEIGHT_MARGIN_PX}px`);
        view.renderer.setAttribute("max-inline-size", `${FOLIATE_MAX_INLINE_SIZE_PX}px`);
        view.renderer.setAttribute("max-column-count", container.clientWidth >= FOLIATE_TWO_COLUMN_BREAKPOINT_PX ? "2" : "1");

        // Provide TOC
        if (view.book?.toc) {
          const sections = view.book.sections ?? [];
          const normalizeHref = (value: string | undefined | null) => (value || "").split("#")[0].replace(/^\.?\//, "");
          const attachSectionIndices = (items: any[]): any[] => items.map((item) => {
            const hrefBase = normalizeHref(item.href || item.src || item.path);
            const section = sections.find((candidate: any) => {
              const candidateHref = normalizeHref(candidate?.href || candidate?.id || candidate?.src || candidate?.path);
              return candidateHref && candidateHref === hrefBase;
            });
            const children = item.subitems || item.children || [];
            return {
              ...item,
              sectionIndex: section
                ? typeof section.linearIndex === "number"
                  ? section.linearIndex
                  : typeof section.index === "number"
                    ? section.index
                    : sections.indexOf(section)
                : undefined,
              subitems: children.length > 0 ? attachSectionIndices(children) : children,
            };
          });
          onTocReady?.(attachSectionIndices(view.book.toc), sections.length ?? 0);
        }

        // Navigate to last position or start from the very beginning (cover page).
        // Only pass lastLocation when a real CFI exists — passing null causes foliate
        // to skip the cover and land on the first text section (~page 3).
        const initOptions = initialCfi ? { lastLocation: initialCfi } : {};
        await view.init(initOptions);

        if (!initialCfi) {
          // No saved CFI — check if there's a saved position (word index) to approximate
          const savedPos = activeDoc.position || 0;
          const wordCount = activeDoc.wordCount || 1;
          if (savedPos > 0 && wordCount > 0) {
            const fraction = Math.min(savedPos / wordCount, 1);
            await view.goToFraction(fraction);
          } else {
            await view.goToFraction(0);
          }
        }

        // Populate imperative API ref
        if (viewApiRef) {
          viewApiRef.current = {
            getWords: () => {
              if (foliateWordsRef.current.length > 0) return foliateWordsRef.current;
              const extracted = extractWordsFromView(view);
              foliateWordsRef.current = extracted.words;
              foliateParagraphBreaksRef.current = extracted.paragraphBreaks;
              return extracted.words;
            },
            getParagraphBreaks: () => foliateParagraphBreaksRef.current,
            goTo: (target) => view.goTo(target),
            goToFraction: (frac) => view.goToFraction(frac),
            next: () => view.renderer.next(),
            prev: () => view.renderer.prev(),
            highlightWord: (_range, _sectionIndex) => {
              // No-op: use highlightWordByIndex instead
            },
            highlightWordByIndex: (wordIndex: number, styleHint?: "flow" | "narration"): boolean => {
              // TTS-7O ANCHOR CONTRACT: The wordIndex parameter is the CANONICAL narration
              // position for start, resume, save, and replay. Context words (N+1, N+2) applied
              // below in the narration 3-word window are VISUAL ONLY and must never be written
              // back as resume anchors or saved progress. See handlePauseToPage() in useReaderMode.ts
              // and resumeAnchorRef usage — both correctly read getCurrentWord() which returns
              // only this first highlighted word.
              return applyVisualHighlightByIndex(wordIndex, styleHint, true);
            },
            clearHighlight: () => {
              // Clear all highlights in foliate iframes
              const contents = view.renderer?.getContents?.() ?? [];
              clearVisualWordClasses(contents);
              hideNarrationOverlay();
            },
            getView: () => view,
            // TTS-7I: Shared render-state resolver — single source of truth for gate + highlight + recovery.
            // Both startup gate (useReaderMode) and live narration follow (useReadingModeInstance)
            // consume this same function, eliminating the gate/highlight disagreement (BUG-124).
            resolveWordState: (wordIndex: number): { found: boolean; visible: boolean; span: HTMLElement | null; doc: Document | null } => {
              const contents = view.renderer?.getContents?.() ?? [];
              for (const { doc: d } of contents) {
                try {
                  const span = d?.querySelector?.(`[data-word-index="${wordIndex}"]`) as HTMLElement;
                  if (!span) continue;
                  const rect = span.getBoundingClientRect();
                  const iframeWin = d.defaultView;
                  const visible = !!(iframeWin && rect.width > 0 &&
                    rect.left >= 0 && rect.left < iframeWin.innerWidth &&
                    rect.top >= 0 && rect.top < iframeWin.innerHeight);
                  return { found: true, visible, span, doc: d };
                } catch { /* */ }
              }
              const liveSections = bookWordSectionsRef.current;
              if (liveSections && liveSections.length > 0) {
                const sectionIdx = viewApiRef!.current!.getSectionForWordIndex(wordIndex);
                if (sectionIdx != null) {
                  const renderedWordIndex = resolveGlobalWordIndexToRendered(
                    sectionIdx,
                    wordIndex,
                    foliateWordsRef.current,
                    liveSections,
                  );
                  for (const { doc: d, index } of contents) {
                    if (index !== sectionIdx) continue;
                    try {
                      const span = d?.querySelector?.(`[data-word-index="${renderedWordIndex}"]`) as HTMLElement;
                      if (!span) continue;
                      const rect = span.getBoundingClientRect();
                      const iframeWin = d.defaultView;
                      const visible = !!(iframeWin && rect.width > 0 &&
                        rect.left >= 0 && rect.left < iframeWin.innerWidth &&
                        rect.top >= 0 && rect.top < iframeWin.innerHeight);
                      return { found: true, visible, span, doc: d };
                    } catch { /* */ }
                  }
                }
              }
              return { found: false, visible: false, span: null, doc: null };
            },
            // TTS-7F: Pure read-only DOM check — delegates to resolveWordState
            isWordInDom: (wordIndex: number): boolean => {
              return viewApiRef!.current!.resolveWordState(wordIndex).found;
            },
            // TTS-7H: Visible-word readiness — delegates to resolveWordState
            isWordVisibleOnPage: (wordIndex: number): boolean => {
              return viewApiRef!.current!.resolveWordState(wordIndex).visible;
            },
            // TTS-7H: Resolve section index for a global word index (for fallback navigation)
            // TTS-7K (BUG-132): When bookWordSections exist, use the global section
            // boundaries for lookup. The DOM-local foliateWordsRef may only cover a
            // tiny slice and would fail for global indices like 5000.
            getSectionForWordIndex: (wordIndex: number): number | null => {
              // Prefer global section boundaries when available
              const liveSections = bookWordSectionsRef.current;
              if (liveSections && liveSections.length > 0) {
                for (let i = liveSections.length - 1; i >= 0; i--) {
                  if (wordIndex >= liveSections[i].startWordIdx) {
                    return liveSections[i].sectionIndex;
                  }
                }
                return liveSections[0]?.sectionIndex ?? null;
              }
              // Fallback: DOM-local lookup
              const words = foliateWordsRef.current;
              if (wordIndex >= 0 && wordIndex < words.length) {
                return words[wordIndex].sectionIndex;
              }
              return null;
            },
            findFirstVisibleWordIndex: () => {
              // Walk all loaded sections to find the first word span that's visible
              const contents = view.renderer?.getContents?.() ?? [];
              for (const { doc: d, index } of contents) {
                try {
                  const spans = d.querySelectorAll("[data-word-index]");
                  for (const span of spans) {
                    const rect = (span as HTMLElement).getBoundingClientRect();
                    const iframeWin = d.defaultView;
                    if (!iframeWin) continue;
                    // Check if the span is within the visible viewport of the iframe
                    if (rect.width > 0 && rect.left >= 0 && rect.left < iframeWin.innerWidth &&
                        rect.top >= 0 && rect.top < iframeWin.innerHeight) {
                      const renderedIdx = parseInt((span as HTMLElement).getAttribute("data-word-index") || "-1", 10);
                      if (renderedIdx >= 0) {
                        return resolveRenderedWordIndexToGlobal(index, renderedIdx, foliateWordsRef.current, bookWordSectionsRef.current);
                      }
                    }
                  }
                } catch { /* safe to ignore */ }
              }
              return -1; // No visible words (e.g., cover page with only images)
            },
            isUserBrowsing: () => userBrowsingRef.current,
            returnToNarration: () => {
              userBrowsingRef.current = false;
              const currentIdx = highlightedWordIndexRef.current;
              // TTS-7I (BUG-127): Restore both position AND visible cursor through
              // the same unified path that live narration uses.
              const state = viewApiRef!.current!.resolveWordState(currentIdx);
              if (state.found && state.span) {
                // Apply narration highlight class
                state.span.classList.add("page-word--highlighted");
                // Scroll to the word if it's off the visible page
                if (!state.visible && state.doc) {
                  try {
                    const range = state.doc.createRange();
                    range.selectNodeContents(state.span);
                    view.renderer.scrollToAnchor?.(range);
                  } catch { /* */ }
                }
                if (import.meta.env.DEV) console.debug("[foliate] returnToNarration — cursor restored at word", currentIdx, "visible:", state.visible);
              } else {
                // Word not in loaded DOM — trigger exact section recovery
                const sectionIdx = viewApiRef!.current!.getSectionForWordIndex(currentIdx);
                if (sectionIdx != null) {
                  if (import.meta.env.DEV) console.debug("[foliate] returnToNarration — word", currentIdx, "not in DOM, recovering to section", sectionIdx);
                  viewApiRef!.current!.goToSection(sectionIdx);
                }
              }
            },
            // NAR-3: Section navigation for full-book word extraction
            getSectionCount: () => view.book?.sections?.length ?? 0,
            goToSection: async (sectionIndex: number) => {
              // Navigate foliate to display a specific section
              const sections = view.book?.sections;
              if (!sections || sectionIndex >= sections.length) return;
              const section = sections[sectionIndex];
              if (section?.id) {
                await view.goTo(section.id);
              } else if (section?.href) {
                await view.goTo(section.href);
              } else {
                // Fallback: approximate via fraction
                const frac = sectionIndex / Math.max(sections.length, 1);
                await view.goToFraction(frac);
              }
            },
            extractSectionWords: (sectionIndex: number) => {
              const contents = view.renderer?.getContents?.() ?? [];
              for (const { doc: d, index } of contents) {
                if (index === sectionIndex && d) {
                  return extractWordsFromSection(d, sectionIndex);
                }
              }
              return [];
            },
            getScrollContainer: () => {
              const host = foliateHostRef.current;
              if (!host) return null;
              const foliateView = host.querySelector("foliate-view") as any;
              return foliateView?.shadowRoot?.querySelector("[part~='body']")
                ?? foliateView?.shadowRoot?.querySelector("div")
                ?? host;
            },
          };
        }

        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to load EPUB");
          setLoading(false);
        }
      }
    };

    // Guard against React Strict Mode double-mount: if a view is already loaded
    // for this book, skip the second initialization entirely
    if (viewRef.current && !cancelled) {
      return () => { cancelled = true; };
    }

    loadBook();

    return () => {
      cancelled = true;
      if (viewRef.current) {
        viewRef.current.close?.();
        viewRef.current = null;
      }
      if (foliateHostRef.current) foliateHostRef.current.innerHTML = "";
    };
  }, [activeDoc.filepath, activeDoc.id]);

  useEffect(() => {
    return () => {
      if (narrationOverlayRafRef.current) {
        cancelAnimationFrame(narrationOverlayRafRef.current);
        narrationOverlayRafRef.current = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (!bookWordSections || bookWordSections.length === 0) return;
    const view = viewRef.current;
    const contents = view?.renderer?.getContents?.() ?? [];
    for (const { doc, index } of contents) {
      if (!doc?.body) continue;
      const sectionStart = getSectionGlobalOffset(index, foliateWordsRef.current, bookWordSections);
      if (sectionStart < 0) continue;
      unwrapWordSpans(doc);
      wrapWordsInSpans(doc, index, sectionStart);
    }
  }, [bookWordSections]);

  // Update renderer on settings changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view?.renderer) return;

    const scale = (focusTextSize || 100) / 100;
    const container = containerRef.current;
    if (!container) return;

    view.renderer.setAttribute("max-column-count", container.clientWidth >= FOLIATE_TWO_COLUMN_BREAKPOINT_PX ? "2" : "1");
    view.renderer.setAttribute("max-block-size", `${container.clientHeight - FOLIATE_RENDERER_HEIGHT_MARGIN_PX}px`);

    // Re-inject styles on settings change
    for (const { doc } of view.renderer.getContents?.() ?? []) {
      injectStyles(doc, settings, focusTextSize);
    }
  }, [settings.theme, settings.fontFamily, focusTextSize, settings.layoutSpacing]);

  // FLOW-3A: Toggle flow="scrolled" vs "paginated" when flowMode changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view?.renderer) return;
    view.renderer.setAttribute("flow", flowMode ? "scrolled" : "paginated");
    // When switching to scrolled mode, disable column layout
    if (flowMode) {
      view.renderer.setAttribute("max-column-count", "1");
    } else {
      const container = containerRef.current;
      if (container) {
        view.renderer.setAttribute("max-column-count", container.clientWidth >= FOLIATE_TWO_COLUMN_BREAKPOINT_PX ? "2" : "1");
      }
    }
    // Expose the scroll container for FlowScrollEngine
    if (scrollContainerRef) {
      if (flowMode) {
        // foliate-js in scrolled mode: the scrollable element is inside the shadow DOM
        // Find it via the host element's shadow root or fallback to the container
        const host = foliateHostRef.current;
        if (host) {
          // foliate-view's scrollable container is the element with overflow
          const foliateView = host.querySelector("foliate-view") as any;
          const scrollEl = foliateView?.shadowRoot?.querySelector("[part~='body']")
            ?? foliateView?.shadowRoot?.querySelector("div")
            ?? host;
          scrollContainerRef.current = scrollEl as HTMLElement;
        }
      } else {
        scrollContainerRef.current = null;
      }
    }
  }, [flowMode]);

  // Reflow text when container resizes (window maximize/restore/drag)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      const view = viewRef.current;
      if (!view?.renderer) return;
      const h = container.clientHeight;
      const w = container.clientWidth;
      view.renderer.setAttribute("max-block-size", `${h - FOLIATE_RENDERER_HEIGHT_MARGIN_PX}px`);
      view.renderer.setAttribute("max-column-count", w >= FOLIATE_TWO_COLUMN_BREAKPOINT_PX ? "2" : "1");
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Flow mode overlay cursor animation (EPUB-only, Range-based)
  // FLOW-3A: When flowMode is active, FlowScrollEngine handles cursor — skip this legacy cursor
  useEffect(() => {
    if (flowMode || readingMode !== "flow" || !flowPlaying) {
      if (cursorRef.current) cursorRef.current.style.display = "none";
      cancelAnimationFrame(flowRafRef.current);
      return;
    }
    const cursor = cursorRef.current;
    const container = containerRef.current;
    if (!cursor || !container) return;
    cursor.style.display = "block";

    let currentIdx = highlightedWordIndexRef.current ?? 0;
    const msPerWord = 60000 / (wpm || DEFAULT_WPM);
    let lastAdvance = performance.now();

    const tick = (now: number) => {
      if (now - lastAdvance >= msPerWord) {
        currentIdx++;
        lastAdvance = now;
        onFlowWordAdvanceRef.current?.(currentIdx);
      }
      // Find word span via view.renderer.getContents() (pierces shadow DOM)
      const v = viewRef.current;
      const contents = v?.renderer?.getContents?.() ?? [];
      let found = false;
      for (const { doc: d } of contents) {
        try {
          const span = d?.querySelector?.(`[data-word-index="${currentIdx}"]`) as HTMLElement;
          if (span) {
            const spanRect = span.getBoundingClientRect();
            // getContents docs are inside iframes — find the iframe for coordinate transform
            const iframe = foliateIframeRef.current;
            const iframeRect = iframe?.getBoundingClientRect();
            // Compute position in page viewport
            const x = (iframeRect ? iframeRect.left : 0) + spanRect.left;
            const y = (iframeRect ? iframeRect.top : 0) + spanRect.top + spanRect.height;
            const w = spanRect.width;
            // Only show if the word is within the visible viewport
            const viewportWidth = container.clientWidth;
            const viewportHeight = container.clientHeight;
            if (w > 0 && x >= 0 && x < viewportWidth + 100 && y >= 0 && y < viewportHeight + 100) {
              cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
              cursor.style.width = `${w}px`;
              cursor.style.display = "block";
              found = true;
            } else {
              // Word is off-screen (different CSS column) — trigger page advance
              const v2 = viewRef.current;
              if (v2?.renderer?.next) {
                v2.renderer.next();
              }
              cursor.style.display = "none";
            }
            break;
          }
        } catch { /* */ }
      }
      if (!found) cursor.style.display = "none";
      flowRafRef.current = requestAnimationFrame(tick);
    };
    flowRafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(flowRafRef.current);
  }, [readingMode, flowPlaying, wpm]);

  // TTS-7I (BUG-125): Removed duplicate React narrationWordIndex scroll effect.
  // Narration highlight + follow is now owned entirely by the imperative bridge
  // (highlightWordByIndex called from useReadingModeInstance's onWordAdvance).
  // The old React effect was a second scroll owner that competed with the bridge,
  // causing mid-narration paragraph jumps. See BUG-125 for full context.
  //
  // TTS-7O visual bridge: keep a visual-only narration effect tied to the
  // canonical narrationWordIndex prop. This does NOT own scrolling/navigation.
  // It simply reapplies the 3-word window and overlay so normal word-by-word
  // motion remains visible between the 12-word truth-sync corrections.
  useEffect(() => {
    if (readingMode !== "narration" || narrationWordIndex == null) {
      hideNarrationOverlay();
      return;
    }
    // The live narration cursor is owned by the imperative Foliate bridge
    // (useReadingModeInstance -> highlightWordByIndex on every word advance).
    // Only use this React effect for initial entry / recovery when the overlay
    // is not already active, otherwise we create a second visual owner that can
    // reapply slightly stale positions and cause left/right jitter.
    if (!narrationOverlayTargetRef.current.active) {
      applyVisualHighlightByIndex(narrationWordIndex, "narration", false);
    }
  }, [applyVisualHighlightByIndex, hideNarrationOverlay, narrationWordIndex, readingMode]);

  useEffect(() => {
    if (readingMode !== "narration") return;
    const contents = viewRef.current?.renderer?.getContents?.() ?? [];
    clearVisualWordClasses(contents);
  }, [clearVisualWordClasses, readingMode]);

  useEffect(() => {
    if (readingMode !== "page" || highlightedWordIndex == null) return;
    applyVisualHighlightByIndex(highlightedWordIndex, undefined, false);
  }, [applyVisualHighlightByIndex, highlightedWordIndex, readingMode]);

  // Narration page-sync — advance page when narration reads past current view
  // Tracks foliate's reported fraction vs narration's progress fraction
  const foliateCurrentFractionRef = useRef(0);
  const pageTurnCooldownRef = useRef(false);
  // Updated by onRelocate prop callback — store fraction on every relocate
  const origOnRelocate = onRelocate;
  const wrappedOnRelocate = useCallback((detail: any) => {
    if (detail.fraction != null) foliateCurrentFractionRef.current = detail.fraction;
    origOnRelocate?.(detail);
  }, [origOnRelocate]);

  // Page auto-advance during narration — DISABLED
  // This fraction-based approach causes page jumping because narrationWordIndex
  // is relative to the extracted word array (visible sections only), not the full book.
  // The division narrationWordIndex/totalWords produces wrong fractions.
  // Page advance is now handled by highlightWordByIndex's off-screen detection instead.
  // TODO: Re-implement once word index stability across sections is solved.

  // Keyboard navigation (page turn — disabled in Flow Mode, which uses FlowScrollEngine)
  const flowModeRef = useRef(flowMode);
  flowModeRef.current = flowMode;
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const view = viewRef.current;
      if (!view?.renderer) return;
      // FLOW-3A: In flow mode, don't page-turn — FlowScrollEngine handles scrolling
      if (flowModeRef.current) return;

      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        // During narration, flag that user is browsing away — don't yank back
        if (readingModeRef.current === "narration") userBrowsingRef.current = true;
        view.renderer.next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        if (readingModeRef.current === "narration") userBrowsingRef.current = true;
        view.renderer.prev();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Expose navigation methods via ref
  const goNext = useCallback(() => viewRef.current?.renderer?.next(), []);
  const goPrev = useCallback(() => viewRef.current?.renderer?.prev(), []);
  const goTo = useCallback((target: string | number) => viewRef.current?.goTo(target), []);
  const goToFraction = useCallback((frac: number) => viewRef.current?.goToFraction(frac), []);

  return (
    <div className={`foliate-page-view${flowMode ? " foliate-page-view--flow" : ""}`} ref={containerRef} style={{ flex: 1, overflow: flowMode ? "auto" : "hidden", position: "relative" }}>
      {/* Page turn buttons — hidden in Flow Mode (no pagination) */}
      {!flowMode && (
        <>
          <button
            className="page-nav-btn page-nav-btn--left"
            onClick={goPrev}
            aria-label="Previous page"
            style={{ zIndex: 10 }}
          >&#x2039;</button>
          <button
            className="page-nav-btn page-nav-btn--right"
            onClick={goNext}
            aria-label="Next page"
            style={{ zIndex: 10 }}
          >&#x203A;</button>
        </>
      )}
      {/* Jump to reading position button — shown when reading mode is active */}
      {isReading && onJumpToHighlight && (
        <button
          className="return-to-narration-btn"
          onClick={onJumpToHighlight}
          style={{ zIndex: 20 }}
        >
          ↩ Jump to reading position
        </button>
      )}
      {loading && <div className="foliate-loading">Loading book...</div>}
      {error && <div className="foliate-error">{error}</div>}
      <div ref={cursorRef} className="foliate-flow-cursor" style={{ display: "none" }} />
      <div ref={highlightRef} className="foliate-narration-highlight" style={{ display: "none" }} />
      {/* FLOW-3A: Shrinking underline cursor for FlowScrollEngine (rendered in JSX per LL-014 known trap) */}
      {flowMode && <div ref={flowCursorRef} className="flow-shrink-cursor" style={{ display: "none" }} />}
    </div>
  );
}

/** Inject Blurby theme CSS into an EPUB document (inside the foliate iframe). */
function injectStyles(doc: Document, settings: BlurbySettings, focusTextSize?: number) {
  if (!doc?.head) return;

  const existing = doc.getElementById("blurby-theme");
  if (existing) existing.remove();

  const scale = (focusTextSize || 100) / 100;
  const fontSize = Math.round(FOLIATE_BASE_FONT_SIZE_PX * scale);
  const lineHeight = settings.layoutSpacing?.line || 1.8;
  const fontFamily = settings.fontFamily || "Georgia, serif";

  // Get computed CSS custom properties from the main document
  const root = document.documentElement;
  const bg = getComputedStyle(root).getPropertyValue("--bg").trim() || "#1a1a1a";
  const fg = getComputedStyle(root).getPropertyValue("--text").trim() || "#e0e0e0";
  const accent = getComputedStyle(root).getPropertyValue("--accent").trim() || "#D04716";

  const style = doc.createElement("style");
  style.id = "blurby-theme";
  style.textContent = `
    html, body {
      background: ${bg} !important;
      color: ${fg} !important;
      font-family: ${fontFamily} !important;
      font-size: ${fontSize}px !important;
      line-height: ${lineHeight} !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    a { color: ${accent} !important; }
    img { max-width: 100%; height: auto; }
    ::selection { background: ${accent}33; }
    .page-word { cursor: pointer; border-radius: 4px; transition: background-color 120ms linear, box-shadow 120ms linear, color 120ms linear; }
    .page-word:hover { background: ${accent}22; }
    .page-word--highlighted { background: ${accent}4D; box-shadow: inset 0 -0.26em 0 ${accent}55; }
    .page-word--narration-context { background: transparent; box-shadow: none; }
    .page-word--flow-cursor { border-bottom: 3px solid ${accent}; padding-bottom: 1px; }
  `;
  doc.head.appendChild(style);
}
