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
import { segmentWordSpans } from "../utils/segmentWords";
import {
  getSectionGlobalOffset,
  resolveGlobalWordIndexToRendered,
  resolveRenderedWordIndexToGlobal,
} from "../utils/foliateWordOffsets";
import { DEFAULT_WPM, FOLIATE_BASE_FONT_SIZE_PX, FOLIATE_RENDERER_HEIGHT_MARGIN_PX, FOLIATE_MARGIN_PX, FOLIATE_MAX_INLINE_SIZE_PX, FOLIATE_TWO_COLUMN_BREAKPOINT_PX, FLOW_READING_ZONE_POSITION, FLOW_ZONE_LINES_DEFAULT } from "../constants";
import { recordDiagEvent } from "../utils/narrateDiagnostics";
import { injectStyles } from "../utils/foliateStyles";
import {
  BLOCK_TAGS,
  hasToken,
  isFootnoteRefElement,
  isFootnoteBodyElement,
  isSuppressedNarrationTextNode,
  getBlockParent,
  collectBlockTextNodes,
  locateTextOffset,
  makeFoliateTokenId,
  buildWordsFromTextNodes,
  buildWrappedFragmentForNode,
  extractWordsFromView,
  extractWordsFromSection,
  type FoliateWord,
} from "../utils/foliateHelpers";
export type { FoliateWord } from "../utils/foliateHelpers";

const api = window.electronAPI;

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

/** STAB-1A (BUG-162b): Batch size for async wrapWordsInSpans — number of block groups
 *  processed before yielding to the event loop via setTimeout(0). */
const WRAP_BATCH_SIZE = 50;

/** Walk the EPUB section DOM and wrap each word in a <span class="page-word" data-word-index="N">.
 *  Must be called AFTER extractWordsFromView (which needs raw text nodes for Range creation).
 *  Returns the next available global index.
 *
 *  STAB-1A (BUG-162b): Now async — processes block groups in batches of WRAP_BATCH_SIZE,
 *  yielding to the event loop between batches so the loading indicator can render and the
 *  UI stays responsive during word wrapping. */
export async function wrapWordsInSpans(
  doc: Document,
  sectionIndex: number,
  globalOffset: number,
  sectionWords: FoliateWord[] = [],
): Promise<number> {
  let globalIndex = globalOffset;
  const groups = collectBlockTextNodes(doc.body);
  const tokenPartById = new Map<string, number>();
  let sectionWordCursor = 0;

  for (let i = 0; i < groups.length; i++) {
    const { nodes } = groups[i];
    const combined = nodes.map((node) => node.textContent || "").join("");
    const logicalSpans = segmentWordSpans(combined);
    const wordSpans = logicalSpans.map((span, idx) => {
      const sourceWord = sectionWords[sectionWordCursor + idx];
      return {
        ...span,
        globalIndex: globalIndex + idx,
        tokenId: sourceWord?.tokenId || makeFoliateTokenId(sectionIndex, sectionWordCursor + idx),
      };
    });
    sectionWordCursor += logicalSpans.length;
    globalIndex += wordSpans.length;

    let nodeStart = 0;
    for (const textNode of nodes) {
      const text = textNode.textContent || "";
      const parent = textNode.parentNode;
      if (!parent) {
        nodeStart += text.length;
        continue;
      }

      const frag = buildWrappedFragmentForNode(doc, text, nodeStart, wordSpans, tokenPartById);
      if (frag) {
        parent.replaceChild(frag, textNode);
      }
      nodeStart += text.length;
    }

    // Yield to event loop every WRAP_BATCH_SIZE groups so UI stays responsive
    if ((i + 1) % WRAP_BATCH_SIZE === 0 && i + 1 < groups.length) {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }

  return globalIndex;
}

interface RenderedTokenResolution {
  renderedWordIndex: number;
  renderedWordIndexes: number[];
  canonicalWord: string;
  tokenId: string | null;
  spans: HTMLElement[];
}

function getTokenSpans(root: ParentNode, tokenId: string): HTMLElement[] {
  return Array
    .from(root.querySelectorAll<HTMLElement>("[data-token-id]"))
    .filter((el) => el.getAttribute("data-token-id") === tokenId)
    .sort((a, b) => {
      const partA = Number.parseInt(a.getAttribute("data-token-part") || "", 10);
      const partB = Number.parseInt(b.getAttribute("data-token-part") || "", 10);
      if (!Number.isNaN(partA) && !Number.isNaN(partB) && partA !== partB) {
        return partA - partB;
      }
      return 0;
    });
}

function resolveRenderedToken(
  root: ParentNode,
  target: Element | null,
): RenderedTokenResolution | null {
  const wordSpan = target?.closest?.("[data-word-index]") as HTMLElement | null;
  if (!wordSpan) return null;

  const fallbackRenderedWordIndex = Number.parseInt(
    wordSpan.getAttribute("data-word-index") || "",
    10,
  );
  if (Number.isNaN(fallbackRenderedWordIndex)) return null;

  const tokenId = wordSpan.getAttribute("data-token-id");
  const spans = tokenId ? getTokenSpans(root, tokenId) : [wordSpan];
  const renderedWordIndexes = spans
    .map((span) => Number.parseInt(span.getAttribute("data-word-index") || "", 10))
    .filter((value) => !Number.isNaN(value));
  const renderedWordIndex = renderedWordIndexes.length > 0
    ? Math.min(...renderedWordIndexes)
    : fallbackRenderedWordIndex;
  const canonicalWord = spans
    .map((span) => span.getAttribute("data-word-full") || "")
    .find(Boolean)
    || spans.map((span) => span.textContent || "").join("")
    || wordSpan.textContent
    || "";

  return {
    renderedWordIndex,
    renderedWordIndexes,
    canonicalWord,
    tokenId,
    spans: spans.length > 0 ? spans : [wordSpan],
  };
}

function sameRenderedToken(
  a: RenderedTokenResolution | null,
  b: RenderedTokenResolution | null,
): boolean {
  if (!a || !b) return false;
  if (a.tokenId && b.tokenId) return a.tokenId === b.tokenId;
  return a.renderedWordIndex === b.renderedWordIndex;
}

function resolveSelectionToken(
  doc: Document,
  range: Range,
  selection: Selection,
): RenderedTokenResolution | null {
  const overlaps = Array
    .from(doc.querySelectorAll<HTMLElement>("[data-word-index]"))
    .filter((span) => {
      try {
        return range.intersectsNode(span);
      } catch {
        return false;
      }
    });

  if (overlaps.length > 0) {
    const matches = new Map<string, RenderedTokenResolution>();
    for (const span of overlaps) {
      const resolved = resolveRenderedToken(doc.body, span);
      if (!resolved) continue;
      const key = resolved.tokenId
        ? `token:${resolved.tokenId}`
        : `index:${resolved.renderedWordIndex}`;
      matches.set(key, resolved);
    }
    if (matches.size === 1) {
      return Array.from(matches.values())[0];
    }
  }

  const anchorEl = selection.anchorNode?.nodeType === Node.TEXT_NODE
    ? selection.anchorNode.parentElement
    : selection.anchorNode as Element | null;
  const focusEl = selection.focusNode?.nodeType === Node.TEXT_NODE
    ? selection.focusNode.parentElement
    : selection.focusNode as Element | null;
  const anchorToken = resolveRenderedToken(doc.body, anchorEl);
  const focusToken = resolveRenderedToken(doc.body, focusEl);

  if (sameRenderedToken(anchorToken, focusToken)) {
    return anchorToken;
  }

  return null;
}

function getResolvedTokenHighlightSpans(
  doc: Document,
  resolution: RenderedTokenResolution,
): HTMLElement[] {
  if (resolution.tokenId && resolution.spans.length > 0) {
    return resolution.spans;
  }

  return Array.from(
    doc.querySelectorAll<HTMLElement>(`[data-word-index="${resolution.renderedWordIndex}"]`),
  );
}

function buildResolvedTokenRange(
  doc: Document,
  resolution: RenderedTokenResolution,
): Range | null {
  const spans = getResolvedTokenHighlightSpans(doc, resolution);
  const first = spans[0];
  const last = spans[spans.length - 1];
  if (!first || !last) return null;

  const range = doc.createRange();
  const firstNode = first.firstChild;
  const lastNode = last.lastChild;
  if (
    firstNode?.nodeType === Node.TEXT_NODE &&
    lastNode?.nodeType === Node.TEXT_NODE
  ) {
    range.setStart(firstNode, 0);
    range.setEnd(lastNode, lastNode.textContent?.length ?? 0);
    return range;
  }

  range.setStartBefore(first);
  range.setEndAfter(last);
  return range;
}

/** TTS-7Q: Audio progress callback type — mirrors AudioProgressReport from audioScheduler */
export interface FoliateAudioProgressFn {
  (): { wordIndex: number; fraction: number; audioTime: number } | null;
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
  /** Whether active reading is currently advancing words */
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
  /** Optional audio progress sampler (kept for compatibility with reader plumbing). */
  getAudioProgress?: FoliateAudioProgressFn | null;
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
  highlightWordByIndex: (wordIndex: number, styleHint?: "flow") => boolean;
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
  /** SELECTION-1: Apply soft-selected highlight to a word (passive page-mode indicator) */
  applySoftHighlight: (wordIndex: number) => boolean;
  /** SELECTION-1: Remove soft-selected highlight from all words */
  clearSoftHighlight: () => void;
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
  getAudioProgress,
}: FoliatePageViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const foliateHostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<any>(null);
  const foliateWordsRef = useRef<FoliateWord[]>([]);
  const foliateParagraphBreaksRef = useRef<Set<number>>(new Set());
  const foliateIframeRef = useRef<HTMLIFrameElement | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const flowRafRef = useRef<number>(0);

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
  const highlightedWordIndexRef = useRef<number>(highlightedWordIndex ?? -1);
  highlightedWordIndexRef.current = highlightedWordIndex ?? -1;
  const readingModeRef = useRef(readingMode);
  // Track when user has manually browsed away during narration — suppresses scrollToAnchor
  const userBrowsingRef = useRef(false);
  readingModeRef.current = readingMode;

  const clearVisualWordClasses = useCallback((contents: Array<{ doc: Document }>) => {
    for (const { doc: d } of contents) {
      try {
        d?.querySelectorAll?.(".page-word--highlighted")?.forEach((el: Element) => {
          el.classList.remove("page-word--highlighted");
        });
        d?.querySelectorAll?.(".page-word--flow-cursor")?.forEach((el: Element) => {
          el.classList.remove("page-word--flow-cursor");
        });
        d?.querySelectorAll?.(".page-word--soft-selected")?.forEach((el: Element) => {
          el.classList.remove("page-word--soft-selected");
        });
        // page-word--narration-context removed in TTS-7R — fixed-size overlay band replaces per-word context highlighting
      } catch {
        // Safe to ignore for detached/partial docs.
      }
    }
  }, []);

  const clearSoftHighlight = useCallback(() => {
    const view = viewRef.current;
    if (!view?.renderer) return;
    const contents: Array<{ doc: Document }> = view.renderer.getContents?.() ?? [];
    for (const { doc: d } of contents) {
      try {
        d?.querySelectorAll?.(".page-word--soft-selected")?.forEach((el: Element) => {
          el.classList.remove("page-word--soft-selected");
        });
      } catch {
        // Safe to ignore for detached/partial docs.
      }
    }
  }, []);

  const applySoftHighlight = useCallback((wordIndex: number): boolean => {
    const view = viewRef.current;
    if (!view?.renderer) return false;
    clearSoftHighlight();
    const contents: Array<{ doc: Document }> = view.renderer.getContents?.() ?? [];
    for (const { doc: d } of contents) {
      try {
        const span = d?.querySelector?.(`[data-word-index="${wordIndex}"]`);
        if (span) {
          span.classList.add("page-word--soft-selected");
          return true;
        }
      } catch {
        // Safe to ignore for detached/partial docs.
      }
    }
    return false;
  }, [clearSoftHighlight]);

  const applyVisualHighlightByIndex = useCallback((
    wordIndex: number,
    styleHint?: "flow",
    allowMotion = true,
  ): boolean => {
    const view = viewRef.current;
    if (!view?.renderer || !viewApiRef?.current) return false;

    const state = viewApiRef.current.resolveWordState(wordIndex);
    const contents = view.renderer?.getContents?.() ?? [];
    const isFlowMode = styleHint === "flow" || readingModeRef.current === "flow";
    const highlightClass = isFlowMode ? "page-word--flow-cursor" : "page-word--highlighted";

    clearVisualWordClasses(contents);

    if (!state.found || !state.span) {
      if (process.env.NODE_ENV !== "production") {
        console.debug(`[foliate] highlightWordByIndex miss: word ${wordIndex} not in DOM`);
      }
      return false;
    }

    state.doc?.querySelectorAll?.(`[data-word-index="${wordIndex}"]`)?.forEach((el: Element) => {
      el.classList.add(highlightClass);
    });

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
  }, [clearVisualWordClasses, viewApiRef]);

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
        const onSectionLoad = async (e: any) => {
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
            // During active flow reading, only wrap the new section without re-extracting everything
            // (re-extraction shifts indices, breaking the global word array mapping)
            const isActiveMode = readingModeRef.current === "flow";
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
              // Wrap this section's words with correct indices (STAB-1A: now async)
              await wrapWordsInSpans(doc, index, sectionStart, sectionWords);
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
                const sectionWords = extracted.words.filter((word) => word.sectionIndex === index);
                await wrapWordsInSpans(doc, index, sectionStart, sectionWords);
              }
            }
          }

          // Delegated click handler — uses injected word spans (same pattern as PageReaderView)
          doc.body.addEventListener("click", (e: MouseEvent) => {
            const target = (e.target as HTMLElement)?.closest?.("[data-word-index]");
            if (!target) return;
            if ((e.target as HTMLElement)?.closest?.("a[href]")) return;

            const resolvedToken = resolveRenderedToken(doc.body, target);
            if (!resolvedToken) return;

            doc.querySelectorAll(".page-word--highlighted").forEach((el: Element) =>
              el.classList.remove("page-word--highlighted")
            );
            getResolvedTokenHighlightSpans(doc, resolvedToken).forEach((el: Element) =>
              el.classList.add("page-word--highlighted")
            );

            const v = viewRef.current;
            if (v) {
              const contents = v.renderer?.getContents?.() ?? [];
              const match = contents.find((c: any) => c.doc === doc);
              if (match) {
                const tokenRange = buildResolvedTokenRange(doc, resolvedToken);
                const fallbackRange = doc.createRange();
                fallbackRange.selectNodeContents(target);
                const cfi = v.getCFI(match.index, tokenRange ?? fallbackRange);
                const liveSections = bookWordSectionsRef.current;
                const exactIdx = resolveRenderedWordIndexToGlobal(
                  match.index,
                  resolvedToken.renderedWordIndex,
                  foliateWordsRef.current,
                  liveSections,
                  resolvedToken.renderedWordIndexes,
                );
                const sectionBase = getSectionGlobalOffset(match.index, foliateWordsRef.current, liveSections);
                const wordOffsetInSection = sectionBase >= 0 ? exactIdx - sectionBase : 0;
                onWordClickRef.current?.(
                  cfi,
                  resolvedToken.canonicalWord,
                  match.index,
                  wordOffsetInSection,
                  exactIdx,
                );
              }
            }
          });

          // Also detect double-click word selection (native browser behavior)
          doc.addEventListener("selectionchange", () => {
            const sel = doc.getSelection();
            if (!sel || sel.isCollapsed || !sel.rangeCount) return;
            const range = sel.getRangeAt(0);
            const word = sel.toString().trim();
            if (!word || word.includes(" ")) return; // Only single words

            const resolvedToken = resolveSelectionToken(doc, range, sel);

            const v = viewRef.current;
            if (v) {
              const contents = v.renderer.getContents?.() ?? [];
              const match = contents.find((c: any) => c.doc === doc);
              if (match) {
                if (resolvedToken) {
                  doc.querySelectorAll(".page-word--highlighted").forEach((el: Element) =>
                    el.classList.remove("page-word--highlighted")
                  );
                  getResolvedTokenHighlightSpans(doc, resolvedToken).forEach((el: Element) =>
                    el.classList.add("page-word--highlighted")
                  );

                  const tokenRange = buildResolvedTokenRange(doc, resolvedToken);
                  const cfi = v.getCFI(match.index, tokenRange ?? range);
                  const liveSections = bookWordSectionsRef.current;
                  const exactIdx = resolveRenderedWordIndexToGlobal(
                    match.index,
                    resolvedToken.renderedWordIndex,
                    foliateWordsRef.current,
                    liveSections,
                    resolvedToken.renderedWordIndexes,
                  );
                  const sectionBase = getSectionGlobalOffset(match.index, foliateWordsRef.current, liveSections);
                  const wordOffsetInSection = sectionBase >= 0 ? exactIdx - sectionBase : 0;
                  const canonicalWord = resolvedToken.canonicalWord || word;
                  if (import.meta.env.DEV) {
                    console.debug(
                      "[foliate] selection: exact span found — globalWordIndex:",
                      exactIdx,
                      "word:",
                      canonicalWord,
                    );
                  }
                  onWordClickRef.current?.(
                    cfi,
                    canonicalWord,
                    match.index,
                    wordOffsetInSection,
                    exactIdx,
                  );
                  return;
                }

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
            highlightWordByIndex: (wordIndex: number, styleHint?: "flow"): boolean => {
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
                } catch { /* Word may be in detached section — try next content source */ }
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
                    } catch { /* Rendered word index may not exist in this section — try next */ }
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
                  if (typeof index !== "number") continue;
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
                } catch { /* Section may be unloading — skip to next content source */ }
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
                  } catch { /* Document may be closing during navigation — non-critical */ }
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
                if (typeof index === "number" && index === sectionIndex && d) {
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
            // SELECTION-1: Passive soft-selected highlight (page-mode anchor indicator)
            applySoftHighlight: (wordIndex: number): boolean => applySoftHighlight(wordIndex),
            clearSoftHighlight: () => clearSoftHighlight(),
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
    if (!bookWordSections || bookWordSections.length === 0) return;
    const view = viewRef.current;
    const contents = view?.renderer?.getContents?.() ?? [];
    for (const { doc, index } of contents) {
      if (!doc?.body) continue;
      const sectionStart = getSectionGlobalOffset(index, foliateWordsRef.current, bookWordSections);
      if (sectionStart < 0) continue;
      unwrapWordSpans(doc);
      const sectionWords = foliateWordsRef.current.filter((word) => word.sectionIndex === index);
      wrapWordsInSpans(doc, index, sectionStart, sectionWords);
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

  // FLOW-INF-A: Compute --flow-zone-top and --flow-zone-bottom CSS custom properties
  // when flow mode is active. Uses settings.flowZonePosition and settings.flowZoneLines
  // to express the reading zone as fractional viewport positions on the container.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const applyZoneProperties = () => {
      if (!flowMode) {
        container.style.removeProperty("--flow-zone-top");
        container.style.removeProperty("--flow-zone-bottom");
        return;
      }
      const lineHeight = parseFloat(getComputedStyle(container).lineHeight) || 24;
      const zonePosition = settings.flowZonePosition ?? FLOW_READING_ZONE_POSITION;
      const zoneLines = settings.flowZoneLines ?? FLOW_ZONE_LINES_DEFAULT;
      const containerHeight = container.clientHeight;
      const zoneHeightFrac = (lineHeight * zoneLines) / containerHeight;
      const zoneTop = zonePosition;
      const zoneBottom = Math.min(zonePosition + zoneHeightFrac, 0.95);
      container.style.setProperty("--flow-zone-top", `${zoneTop * 100}%`);
      container.style.setProperty("--flow-zone-bottom", `${zoneBottom * 100}%`);
    };

    applyZoneProperties();

    const observer = new ResizeObserver(applyZoneProperties);
    observer.observe(container);
    return () => {
      observer.disconnect();
      container.style.removeProperty("--flow-zone-top");
      container.style.removeProperty("--flow-zone-bottom");
    };
  }, [flowMode, settings.flowZonePosition, settings.flowZoneLines]);

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
        } catch { /* Content may have been unloaded during flow — skip iteration */ }
      }
      if (!found) cursor.style.display = "none";
      flowRafRef.current = requestAnimationFrame(tick);
    };
    flowRafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(flowRafRef.current);
  }, [readingMode, flowPlaying, wpm]);

  useEffect(() => {
    if (readingMode !== "flow" || narrationWordIndex == null) return;
    applyVisualHighlightByIndex(narrationWordIndex, "flow", false);
  }, [applyVisualHighlightByIndex, narrationWordIndex, readingMode]);

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
        // During active flow reading, flag that user is browsing away — don't yank back
        if (readingModeRef.current === "flow") userBrowsingRef.current = true;
        view.renderer.next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        if (readingModeRef.current === "flow") userBrowsingRef.current = true;
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
    <div className={`foliate-page-view${flowMode ? " foliate-page-view--flow" : ""}`} ref={containerRef} style={{ overflow: flowMode ? "auto" : "hidden" }}>
      {/* Page turn buttons — hidden in Flow Mode (no pagination) */}
      {!flowMode && (
        <>
          <button
            className="page-nav-btn page-nav-btn--left"
            onClick={goPrev}
            aria-label="Previous page"
          >&#x2039;</button>
          <button
            className="page-nav-btn page-nav-btn--right"
            onClick={goNext}
            aria-label="Next page"
          >&#x203A;</button>
        </>
      )}
      {/* Jump to reading position button — shown when reading mode is active */}
      {isReading && onJumpToHighlight && (
        <button
          className="return-to-narration-btn"
          onClick={onJumpToHighlight}
        >
          ↩ Jump to reading position
        </button>
      )}
      {loading && <div className="foliate-loading">Loading book...</div>}
      {error && <div className="foliate-error">{error}</div>}
      <div ref={cursorRef} className="foliate-flow-cursor" />
      {/* FLOW-3A: Shrinking underline cursor for FlowScrollEngine (rendered in JSX per LL-014 known trap) */}
      {flowMode && <div ref={flowCursorRef} className="flow-shrink-cursor" />}
    </div>
  );
}
