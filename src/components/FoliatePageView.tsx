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
import {
  DEFAULT_WPM,
  FOLIATE_BASE_FONT_SIZE_PX,
  FOLIATE_RENDERER_HEIGHT_MARGIN_PX,
  FOLIATE_MARGIN_PX,
  FOLIATE_MAX_INLINE_SIZE_PX,
  FOLIATE_SECTION_READY_TIMEOUT_MS,
  FOLIATE_TWO_COLUMN_BREAKPOINT_PX,
  FLOW_READING_ZONE_POSITION,
  FLOW_ZONE_LINES_DEFAULT,
  TTS_SILENCE_HOLD_THRESHOLD_MS,
} from "../constants";
import { recordDiagEvent } from "../utils/narrateDiagnostics";
import { injectStyles } from "../utils/foliateStyles";
import {
  applyChunkReadingVisualStateToRoots,
  buildChunkReadingScrollKey,
  clearChunkReadingVisualStateFromRoots,
  scrollChunkReadingVisualStateToTopOfRoots,
  shouldSuppressNarrateFlowCursor,
  resolveFoliateWordHighlightClass,
} from "../utils/foliateWordHighlight";
import type { ChunkReadingVisualState } from "../types/chunkReading";
import {
  FLOW_RENDERED_WORD_ROOTS_PROVIDER_KEY,
  type FlowRenderedWordRootDescriptor,
} from "../utils/FlowScrollEngine";
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
  queryWordSpans,
  parseWordIndexAttribute,
  type FoliateWord,
} from "../utils/foliateHelpers";
import { WordPositionIndex, type WordPositionEntry } from "../utils/wordPositionIndex";
import type { AudioProgressReport } from "../utils/audioScheduler";
import type { PauseReason } from "../types/narration";
import { resolveCursorHoldDecision } from "../utils/silenceAwareCursor";
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
  (): AudioProgressReport | null;
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
  /** Optional named pause reason from narration state. */
  narrationPauseReason?: PauseReason | null;
  /** Optional audio progress sampler (kept for compatibility with reader plumbing). */
  getAudioProgress?: FoliateAudioProgressFn | null;
  /** Book-wide section boundaries from main-process extraction (HOTFIX-10: global index stamping) */
  bookWordSections?: import("../types/narration").SectionBoundary[];
  /** CHUNK-SYNC-3: Declared chunk/word visual state for Flow/Narrate surfaces. */
  chunkReadingVisualState?: ChunkReadingVisualState | null;
  /** FLOW-3A: When true, foliate uses flow="scrolled" for infinite scroll */
  flowMode?: boolean;
  /** FLOW-3A: Ref to expose the scrollable container element to FlowScrollEngine */
  scrollContainerRef?: React.MutableRefObject<HTMLElement | null>;
  /** FLOW-3A: Ref to expose the cursor element to FlowScrollEngine */
  flowCursorRef?: React.MutableRefObject<HTMLDivElement | null>;
  /** Reader-driven render revision marker for invalidation/rebuild hooks. */
  foliateRenderVersion?: number;
}

export interface FoliateHighlightOptions {
  allowMotion?: boolean;
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
  highlightWordByIndex: (wordIndex: number, styleHint?: "flow", options?: FoliateHighlightOptions) => boolean;
  clearHighlight: () => void;
  getView: () => any;
  /** Find the first word span visible on the current page. Returns its data-word-index or -1 if no words visible. */
  findFirstVisibleWordIndex: () => number;
  /** Whether the user has manually browsed away from narration position */
  isUserBrowsing: () => boolean;
  /** Clear the user browsing flag and scroll to current narration word */
  returnToNarration: () => void;
  /** Recenter the active Flow/Narrate chunk so its start sits at the top of the reading box. */
  recenterChunkReadingBox: () => boolean;
  /** NAR-3: Get total number of sections in the EPUB */
  getSectionCount: () => number;
  /** NAR-3: Navigate to a specific section by index. Triggers a load event when ready. */
  goToSection: (sectionIndex: number) => Promise<void>;
  /** TTS-CONT-1: Resolve once a section is active, stamped, and safe for word queries. */
  waitForSectionReady: (sectionIndex?: number | null, timeoutMs?: number) => Promise<number | null>;
  /** NAR-3: Extract words from a specific section's DOM (must be currently loaded) */
  extractSectionWords: (sectionIndex: number) => FoliateWord[];
  /** READER-4M-1: Truthful rendered-word roots for Flow/infinite scroll consumers. */
  getRenderedWordRoots: (sectionIndex?: number | null) => FlowRenderedWordRootDescriptor[];
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
  resolveWordState: (wordIndex: number) => {
    found: boolean;
    visible: boolean;
    span: HTMLElement | null;
    spans: HTMLElement[];
    doc: Document | null;
    position: WordPositionEntry | null;
  };
  /** SELECTION-1: Apply soft-selected highlight to a word (passive page-mode indicator) */
  applySoftHighlight: (wordIndex: number) => boolean;
  /** SELECTION-1: Remove soft-selected highlight from all words */
  clearSoftHighlight: () => void;
  /** CHUNK-SYNC-2: Render declared active chunk and optional active word state. */
  applyChunkReadingVisualState: (state: ChunkReadingVisualState | null) => void;
  /** CHUNK-SYNC-2: Clear chunk/active-word visual state across rendered Foliate roots. */
  clearChunkReadingVisualState: () => void;
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
  narrationPauseReason = null,
  bookWordSections,
  chunkReadingVisualState = null,
  flowMode,
  scrollContainerRef,
  flowCursorRef,
  getAudioProgress,
  foliateRenderVersion = 0,
}: FoliatePageViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const foliateHostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<any>(null);
  const foliateWordsRef = useRef<FoliateWord[]>([]);
  const foliateParagraphBreaksRef = useRef<Set<number>>(new Set());
  const foliateIframeRef = useRef<HTMLIFrameElement | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const flowRafRef = useRef<number>(0);
  const wordPositionIndexRef = useRef<WordPositionIndex>(new WordPositionIndex());
  const wordPositionRebuildTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHandledFoliateRenderVersionRef = useRef(foliateRenderVersion);
  const lastLoadedSectionIndexRef = useRef<number | null>(null);

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
  const getAudioProgressRef = useRef(getAudioProgress);
  getAudioProgressRef.current = getAudioProgress;
  const bookWordSectionsRef = useRef(bookWordSections);
  bookWordSectionsRef.current = bookWordSections;
  const highlightedWordIndexRef = useRef<number>(highlightedWordIndex ?? -1);
  highlightedWordIndexRef.current = highlightedWordIndex ?? -1;
  const narrationWordIndexRef = useRef<number | null>(narrationWordIndex ?? null);
  narrationWordIndexRef.current = narrationWordIndex ?? null;
  const readingModeRef = useRef(readingMode);
  const chunkReadingVisualStateRef = useRef<ChunkReadingVisualState | null>(chunkReadingVisualState);
  const lastChunkTopScrollKeyRef = useRef<string | null>(null);
  const narrationPauseReasonRef = useRef<PauseReason | null>(narrationPauseReason);
  // Track when user has manually browsed away during narration — suppresses scrollToAnchor
  const userBrowsingRef = useRef(false);
  readingModeRef.current = readingMode;
  chunkReadingVisualStateRef.current = chunkReadingVisualState;
  narrationPauseReasonRef.current = narrationPauseReason;

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

  const getRenderedWordRoots = useCallback((sectionIndex?: number | null): FlowRenderedWordRootDescriptor[] => {
    const view = viewRef.current;
    const contents = view?.renderer?.getContents?.() ?? [];
    const preferredSectionIndex = typeof sectionIndex === "number"
      ? sectionIndex
      : lastLoadedSectionIndexRef.current;

    return contents
      .filter((entry: { doc?: Document | null; index?: number }) => {
        if (!entry?.doc || typeof entry.index !== "number") return false;
        if (typeof sectionIndex === "number" && entry.index !== sectionIndex) return false;
        return entry.doc.querySelector?.("[data-word-index]") != null;
      })
      .map((entry: { doc: Document; index: number }) => ({
        sectionIndex: entry.index,
        doc: entry.doc,
        root: entry.doc.body ?? entry.doc,
        ready: true,
      }))
      .sort((
        a: { sectionIndex: number; doc: Document; root: HTMLElement | Document; ready: boolean },
        b: { sectionIndex: number; doc: Document; root: HTMLElement | Document; ready: boolean },
      ) => {
        if (preferredSectionIndex != null) {
          if (a.sectionIndex === preferredSectionIndex && b.sectionIndex !== preferredSectionIndex) return -1;
          if (b.sectionIndex === preferredSectionIndex && a.sectionIndex !== preferredSectionIndex) return 1;
        }
        return (a.sectionIndex ?? 0) - (b.sectionIndex ?? 0);
      });
  }, []);

  const resolveReadySectionIndex = useCallback((sectionIndex?: number | null): number | null => {
    const roots = getRenderedWordRoots(sectionIndex);
    if (roots.length === 0) return null;
    if (typeof sectionIndex === "number") return sectionIndex;
    return typeof roots[0]?.sectionIndex === "number" ? roots[0].sectionIndex : null;
  }, [getRenderedWordRoots]);

  const waitForSectionReady = useCallback(
    (sectionIndex?: number | null, timeoutMs = FOLIATE_SECTION_READY_TIMEOUT_MS) =>
      new Promise<number | null>((resolve) => {
        const startedAt = Date.now();

        const check = () => {
          const readyIndex = resolveReadySectionIndex(sectionIndex);
          if (readyIndex != null) {
            resolve(readyIndex);
            return;
          }
          if (Date.now() - startedAt >= timeoutMs) {
            resolve(resolveReadySectionIndex(sectionIndex));
            return;
          }
          setTimeout(check, 25);
        };

        check();
      }),
    [resolveReadySectionIndex],
  );

  const resolveFoliateScrollContainer = useCallback((): HTMLElement | null => {
    const host = foliateHostRef.current;
    if (!host) return null;
    const foliateView = host.querySelector("foliate-view") as any;
    const shadowRoot = (foliateView?.shadowRoot ?? null) as ShadowRoot | null;
    const pickScrollableElement = (scrollCandidates: Array<HTMLElement | null | undefined>): HTMLElement | null => {
      for (const candidate of scrollCandidates) {
        if (!candidate) continue;
        if (candidate.scrollHeight > candidate.clientHeight + 1) return candidate;
        const overflowY = window.getComputedStyle(candidate).overflowY;
        if ((overflowY === "auto" || overflowY === "scroll") && candidate.scrollHeight >= candidate.clientHeight) {
          return candidate;
        }
      }
      return scrollCandidates.find((candidate): candidate is HTMLElement => Boolean(candidate)) ?? null;
    };
    const shadowDivs = Array.from(shadowRoot?.querySelectorAll<HTMLElement>("div") ?? []);
    const scrollCandidates = [
      shadowRoot?.querySelector<HTMLElement>("[part~='body']"),
      shadowRoot?.querySelector<HTMLElement>("[part~='scroller']"),
      shadowRoot?.querySelector<HTMLElement>("[part~='content']"),
      shadowRoot?.querySelector<HTMLElement>("main"),
      ...shadowDivs,
      foliateView as HTMLElement,
      host,
      containerRef.current,
    ];
    const scrollEl = pickScrollableElement(scrollCandidates);
    if (scrollEl) {
      const hostWithRoots = scrollEl as HTMLElement & {
        [FLOW_RENDERED_WORD_ROOTS_PROVIDER_KEY]?: () => FlowRenderedWordRootDescriptor[];
      };
      hostWithRoots[FLOW_RENDERED_WORD_ROOTS_PROVIDER_KEY] = () => getRenderedWordRoots();
    }
    return scrollEl;
  }, [getRenderedWordRoots]);

  const getFlowViewportHeightPx = useCallback((): number => {
    const scrollContainerHeight = resolveFoliateScrollContainer()?.clientHeight ?? 0;
    if (scrollContainerHeight > 0) return scrollContainerHeight;
    return containerRef.current?.clientHeight ?? 0;
  }, [resolveFoliateScrollContainer]);

  const getFlowLeadingInsetPx = useCallback((): number => {
    if (!flowMode) return 0;
    const viewportHeight = getFlowViewportHeightPx();
    if (viewportHeight <= 0) return 0;
    const zonePosition = settings.flowZonePosition ?? FLOW_READING_ZONE_POSITION;
    return Math.max(0, Math.round(viewportHeight * zonePosition));
  }, [flowMode, getFlowViewportHeightPx, settings.flowZonePosition]);

  const getFlowTrailingInsetPx = useCallback((): number => {
    if (!flowMode) return 0;
    const viewportHeight = getFlowViewportHeightPx();
    if (viewportHeight <= 0) return 0;
    const zonePosition = settings.flowZonePosition ?? FLOW_READING_ZONE_POSITION;
    return Math.max(0, Math.round(viewportHeight * (1 - zonePosition)));
  }, [flowMode, getFlowViewportHeightPx, settings.flowZonePosition]);

  const getFlowFollowOffsetPx = useCallback((): number => {
    if (!flowMode) return 0;
    const viewportHeight = getFlowViewportHeightPx();
    if (viewportHeight <= 0) return 0;
    const container = containerRef.current;
    const lineHeight = container ? parseFloat(getComputedStyle(container).lineHeight) || 24 : 24;
    const zonePosition = settings.flowZonePosition ?? FLOW_READING_ZONE_POSITION;
    const zoneLines = settings.flowZoneLines ?? FLOW_ZONE_LINES_DEFAULT;
    return Math.max(0, Math.round((viewportHeight * zonePosition) + ((lineHeight * zoneLines) / 2)));
  }, [
    flowMode,
    getFlowViewportHeightPx,
    settings.flowZoneLines,
    settings.flowZonePosition,
  ]);

  const setFlowInsetsForRenderedDocs = useCallback((leadingInsetPx: number, trailingInsetPx: number) => {
    const view = viewRef.current;
    const leadingValue = `${Math.max(0, Math.round(leadingInsetPx))}px`;
    const trailingValue = `${Math.max(0, Math.round(trailingInsetPx))}px`;
    for (const { doc } of view?.renderer?.getContents?.() ?? []) {
      try {
        doc?.documentElement?.style.setProperty("--blurby-flow-leading-inset", leadingValue);
        doc?.documentElement?.style.setProperty("--blurby-flow-trailing-inset", trailingValue);
      } catch {
        // Detached Foliate iframe documents can disappear during section changes.
      }
    }
  }, []);

  const clearWordPositionRebuildTimer = useCallback(() => {
    if (wordPositionRebuildTimerRef.current) {
      clearTimeout(wordPositionRebuildTimerRef.current);
      wordPositionRebuildTimerRef.current = null;
    }
  }, []);

  const rebuildWordPositionIndex = useCallback((reason: string) => {
    const view = viewRef.current;
    const contents = view?.renderer?.getContents?.() ?? [];
    const build = wordPositionIndexRef.current.build(contents);
    recordDiagEvent(
      "word-position-index-build",
      `reason=${reason} words=${build.wordCount} duplicates=${build.duplicateSpanCount} buildMs=${build.buildTimeMs.toFixed(2)}`,
    );
  }, []);

  const scheduleWordPositionIndexRebuild = useCallback((reason: string, delayMs = 100) => {
    clearWordPositionRebuildTimer();
    wordPositionRebuildTimerRef.current = setTimeout(() => {
      wordPositionRebuildTimerRef.current = null;
      rebuildWordPositionIndex(reason);
    }, Math.max(0, delayMs));
  }, [clearWordPositionRebuildTimer, rebuildWordPositionIndex]);

  const invalidateWordPositionIndex = useCallback(() => {
    wordPositionIndexRef.current.invalidate();
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
    const suppressNarrateFlowCursor = shouldSuppressNarrateFlowCursor(
      readingModeRef.current,
      chunkReadingVisualStateRef.current,
    );
    const highlightClass = suppressNarrateFlowCursor
      ? null
      : resolveFoliateWordHighlightClass(readingModeRef.current, styleHint);

    clearVisualWordClasses(contents);

    if (!state.found || !state.span) {
      if (process.env.NODE_ENV !== "production") {
        console.debug(`[foliate] highlightWordByIndex miss: word ${wordIndex} not in DOM`);
      }
      return false;
    }

    if (highlightClass) {
      const highlightTargets = state.spans.length > 0
        ? state.spans
        : (state.span ? [state.span] : []);
      highlightTargets.forEach((el: Element) => {
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

    // Auto-clear browsed-away flag when the highlighted word becomes visible again,
    // BUT only in page/focus modes where visibility detection is real. In flow/narrate
    // modes, the Foliate iframe reports ALL words as visible (see narrate scroll-follow
    // comment at line ~1673), so this auto-clear would fire on every word advance and
    // immediately cancel any user scroll-away. Flow/narrate rely on returnToNarration()
    // (recenter button) to clear the flag instead.
    const mode = readingModeRef.current;
    if (userBrowsingRef.current && state.visible && mode !== "flow" && mode !== "narrate") {
      userBrowsingRef.current = false;
    }

    return true;
  }, [clearVisualWordClasses, viewApiRef]);

  const clearChunkReadingVisualState = useCallback(() => {
    clearChunkReadingVisualStateFromRoots(getRenderedWordRoots());
  }, [getRenderedWordRoots]);

  const applyChunkReadingVisualState = useCallback((state: ChunkReadingVisualState | null) => {
    applyChunkReadingVisualStateToRoots(getRenderedWordRoots(), state);
  }, [getRenderedWordRoots]);

  const recenterChunkReadingBox = useCallback((): boolean => {
    const state = chunkReadingVisualStateRef.current;

    // NARR-FIX-1 Fix 9: Resolve target word from chunk state OR current reading position.
    // chunkReadingVisualState is null during flow mode (engine publishes only while advancing)
    // and during flow+narration (publishFlowVisualState skips when isNarrating, and the
    // narrate-mode publishers only activate when readingMode === "narrate"). Use the
    // narration cursor or highlighted word index as a fallback so the recenter button
    // always has a valid scroll target regardless of mode.
    const targetWordIndex = state?.activeChunkRange
      ? state.activeChunkRange.startWordIndex
      : (narrationWordIndexRef.current ?? highlightedWordIndexRef.current);

    if (targetWordIndex < 0) return false;

    const view = viewRef.current;

    // NARR-FIX-1 Fix 8: Prefer Foliate-native scrollToAnchor over raw DOM scrollTo.
    // Raw scrollTo() on the scroll container is immediately overridden by Foliate's
    // renderer on the next frame (it maintains its own containerPosition). Using
    // scrollToAnchor properly syncs Foliate's internal state so the scroll persists.
    //
    // Critical: scrollToAnchor is ASYNC — must be awaited before adjusting
    // containerPosition. Fire in an async IIFE (same pattern as narrate scroll-follow).
    // Do NOT null lastChunkTopScrollKeyRef — that would cause the flow scroll-follow
    // effect (line ~834) to fire on the next render with raw DOM scrollTo, fighting
    // this async scroll. Leave the key so scroll-follow stays quiet; it resumes
    // naturally on the next chunk change.
    const hasScrollToAnchor = !!view?.renderer?.scrollToAnchor;
    const hasViewApi = !!viewApiRef?.current;
    if (hasScrollToAnchor && hasViewApi) {
      const wordState = viewApiRef.current!.resolveWordState(targetWordIndex);
      if (wordState.found && wordState.span && wordState.doc) {
        // Clear browsing state synchronously so the button disappears immediately
        userBrowsingRef.current = false;
        lastScrollFollowPosRef.current = null;

        const { doc: stateDoc, span: stateSpan } = wordState;
        const zoneOffset = getFlowFollowOffsetPx();
        (async () => {
          try {
            // Pre-flight: user may have scrolled again during micro-task gap
            if (userBrowsingRef.current) return;
            const range = stateDoc.createRange();
            range.selectNodeContents(stateSpan);
            await view!.renderer.scrollToAnchor(range);
            // Post-flight: user may have scrolled while scrollToAnchor resolved
            if (userBrowsingRef.current) return;
            // Apply zone offset — scrollToAnchor positions the word at the top;
            // subtract offset from containerPosition to push the word into the
            // configured zone (Top/Upper/Center/Bottom).
            if (zoneOffset > 0) {
              const renderer = viewRef.current?.renderer;
              if (renderer && typeof renderer.containerPosition === "number") {
                renderer.containerPosition = Math.max(0, renderer.containerPosition - zoneOffset);
              }
            }
            // Record final position for displacement detection on next tick
            const finalPos = viewRef.current?.renderer?.containerPosition;
            if (typeof finalPos === "number") lastScrollFollowPosRef.current = finalPos;
          } catch (e) { /* Section may be unloading */ }
        })();
        return true;
      }
    }

    // Fallback: DOM-level scroll (non-Foliate renderers or word not found via scrollToAnchor)
    if (state?.activeChunkRange) {
      const didScroll = scrollChunkReadingVisualStateToTopOfRoots(getRenderedWordRoots(), state, {
        behavior: "smooth",
        scrollContainer: resolveFoliateScrollContainer(),
        target: "chunk-start",
        topOffsetPx: getFlowLeadingInsetPx(),
      });
      if (didScroll) {
        userBrowsingRef.current = false;
        lastScrollFollowPosRef.current = null;
      }
      return didScroll;
    }
    return false;
  }, [getFlowFollowOffsetPx, getFlowLeadingInsetPx, getRenderedWordRoots, resolveFoliateScrollContainer]);

  useEffect(() => {
    if (chunkReadingVisualState) {
      applyChunkReadingVisualState(chunkReadingVisualState);
      const scrollKey = buildChunkReadingScrollKey(chunkReadingVisualState);
      // NARR-FIX-1: Don't auto-scroll to the active chunk when the user has browsed
      // away. This lets them preview ahead/behind freely; the recenter button returns.
      if ((readingMode === "flow" || readingMode === "narrate")
        && scrollKey
        && scrollKey !== lastChunkTopScrollKeyRef.current
        && !userBrowsingRef.current
        && scrollChunkReadingVisualStateToTopOfRoots(getRenderedWordRoots(), chunkReadingVisualState, {
          scrollContainer: resolveFoliateScrollContainer(),
          topOffsetPx: getFlowFollowOffsetPx(),
        })
      ) {
        lastChunkTopScrollKeyRef.current = scrollKey;
      }
      if (shouldSuppressNarrateFlowCursor(readingMode, chunkReadingVisualState)) {
        clearVisualWordClasses(viewRef.current?.renderer?.getContents?.() ?? []);
      }
      return;
    }
    lastChunkTopScrollKeyRef.current = null;
    clearChunkReadingVisualState();
  }, [
    applyChunkReadingVisualState,
    chunkReadingVisualState,
    clearChunkReadingVisualState,
    getFlowFollowOffsetPx,
    getRenderedWordRoots,
    readingMode,
    resolveFoliateScrollContainer,
  ]);

  // Load EPUB via foliate-js
  useEffect(() => {
    if (!activeDoc?.filepath || !containerRef.current) return;

    let cancelled = false;
    const container = containerRef.current;

    // Create a host div that React doesn't manage — prevents removeChild conflicts
    if (!foliateHostRef.current) {
      foliateHostRef.current = document.createElement("div");
      container.appendChild(foliateHostRef.current);
    }
    foliateHostRef.current.className = "foliate-host";
    foliateHostRef.current.style.cssText = "width:100%;height:100%;position:absolute;inset:0;z-index:0;";
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
          injectStyles(doc, settings, focusTextSize, {
            flowLeadingInsetPx: getFlowLeadingInsetPx(),
            flowTrailingInsetPx: getFlowTrailingInsetPx(),
          });
          invalidateWordPositionIndex();

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

          lastLoadedSectionIndexRef.current = index;
          scheduleWordPositionIndexRebuild(`section-load:${index}`, 0);

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
          scheduleWordPositionIndexRebuild("relocate");
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
            highlightWordByIndex: (wordIndex: number, styleHint?: "flow", options?: FoliateHighlightOptions): boolean => {
              // TTS-7O ANCHOR CONTRACT: The wordIndex parameter is the CANONICAL narration
              // position for start, resume, save, and replay. Context words (N+1, N+2) applied
              // below in the narration 3-word window are VISUAL ONLY and must never be written
              // back as resume anchors or saved progress. See handlePauseToPage() in useReaderMode.ts
              // and resumeAnchorRef usage — both correctly read getCurrentWord() which returns
              // only this first highlighted word.
              return applyVisualHighlightByIndex(wordIndex, styleHint, options?.allowMotion ?? true);
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
            resolveWordState: (wordIndex: number): {
              found: boolean;
              visible: boolean;
              span: HTMLElement | null;
              spans: HTMLElement[];
              doc: Document | null;
              position: WordPositionEntry | null;
            } => {
              const indexedEntry = wordPositionIndexRef.current.get(wordIndex);
              if (indexedEntry && indexedEntry.primarySpan.isConnected) {
                const iframeWin = indexedEntry.doc.defaultView;
                const visible = !!(iframeWin && indexedEntry.width > 0 &&
                  indexedEntry.left >= 0 && indexedEntry.left < iframeWin.innerWidth &&
                  indexedEntry.top >= 0 && indexedEntry.top < iframeWin.innerHeight);
                return {
                  found: true,
                  visible,
                  span: indexedEntry.primarySpan,
                  spans: indexedEntry.spans,
                  doc: indexedEntry.doc,
                  position: indexedEntry,
                };
              }
              if (indexedEntry) {
                recordDiagEvent("word-position-index-miss", `word=${wordIndex} reason=stale-index-entry`);
              }

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
                  recordDiagEvent("word-position-index-miss", `word=${wordIndex} reason=direct-fallback-hit`);
                  return { found: true, visible, span, spans: [span], doc: d, position: null };
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
                  const renderedEntry = wordPositionIndexRef.current.get(renderedWordIndex);
                  if (renderedEntry && renderedEntry.primarySpan.isConnected && renderedEntry.sectionIndex === sectionIdx) {
                    const iframeWin = renderedEntry.doc.defaultView;
                    const visible = !!(iframeWin && renderedEntry.width > 0 &&
                      renderedEntry.left >= 0 && renderedEntry.left < iframeWin.innerWidth &&
                      renderedEntry.top >= 0 && renderedEntry.top < iframeWin.innerHeight);
                    return {
                      found: true,
                      visible,
                      span: renderedEntry.primarySpan,
                      spans: renderedEntry.spans,
                      doc: renderedEntry.doc,
                      position: renderedEntry,
                    };
                  }
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
                      recordDiagEvent("word-position-index-miss", `word=${wordIndex} reason=section-fallback-hit`);
                      return { found: true, visible, span, spans: [span], doc: d, position: null };
                    } catch { /* Rendered word index may not exist in this section — try next */ }
                  }
                }
              }
              recordDiagEvent("word-position-index-miss", `word=${wordIndex} reason=not-found`);
              return { found: false, visible: false, span: null, spans: [], doc: null, position: null };
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
              const indexedFirstVisible = wordPositionIndexRef.current.findFirstVisibleWordIndex();
              if (indexedFirstVisible >= 0) return indexedFirstVisible;

              // Fallback path: walk all loaded sections and find the first visible word span.
              recordDiagEvent("word-position-index-miss", "word=-1 reason=first-visible-fallback");
              const contents = view.renderer?.getContents?.() ?? [];
              for (const { doc: d, index } of contents) {
                try {
                  if (typeof index !== "number") continue;
                  const spans = queryWordSpans(d);
                  for (const span of spans) {
                    const rect = (span as HTMLElement).getBoundingClientRect();
                    const iframeWin = d.defaultView;
                    if (!iframeWin) continue;
                    // Check if the span is within the visible viewport of the iframe
                    if (rect.width > 0 && rect.left >= 0 && rect.left < iframeWin.innerWidth &&
                        rect.top >= 0 && rect.top < iframeWin.innerHeight) {
                      const renderedIdx = parseWordIndexAttribute((span as HTMLElement).getAttribute("data-word-index"));
                      if (renderedIdx != null && renderedIdx >= 0) {
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
              // Reset displacement baseline so scroll-follow doesn't re-trigger browse-away
              lastScrollFollowPosRef.current = null;
              const rcResult = viewApiRef!.current!.recenterChunkReadingBox?.();
              if (rcResult) {
                return;
              }
              const currentIdx = narrationWordIndexRef.current ?? highlightedWordIndexRef.current;
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
            waitForSectionReady,
            extractSectionWords: (sectionIndex: number) => {
              const contents = view.renderer?.getContents?.() ?? [];
              for (const { doc: d, index } of contents) {
                if (typeof index === "number" && index === sectionIndex && d) {
                  return extractWordsFromSection(d, sectionIndex);
                }
              }
              return [];
            },
            getRenderedWordRoots,
            getScrollContainer: () => resolveFoliateScrollContainer(),
            applyChunkReadingVisualState,
            clearChunkReadingVisualState,
            recenterChunkReadingBox,
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
      clearWordPositionRebuildTimer();
      invalidateWordPositionIndex();
      if (viewRef.current) {
        viewRef.current.close?.();
        viewRef.current = null;
      }
      if (foliateHostRef.current) foliateHostRef.current.innerHTML = "";
    };
  }, [activeDoc.filepath, activeDoc.id]);

  useEffect(() => {
    if (foliateRenderVersion === lastHandledFoliateRenderVersionRef.current) return;
    lastHandledFoliateRenderVersionRef.current = foliateRenderVersion;
    invalidateWordPositionIndex();
    scheduleWordPositionIndexRebuild(`render-version:${foliateRenderVersion}`);
  }, [foliateRenderVersion, invalidateWordPositionIndex, scheduleWordPositionIndexRebuild]);

  useEffect(() => {
    if (!bookWordSections || bookWordSections.length === 0) return;
    let cancelled = false;
    const restampVisibleSections = async () => {
      invalidateWordPositionIndex();
      const view = viewRef.current;
      const contents = view?.renderer?.getContents?.() ?? [];
      for (const { doc, index } of contents) {
        if (!doc?.body) continue;
        const sectionStart = getSectionGlobalOffset(index, foliateWordsRef.current, bookWordSections);
        if (sectionStart < 0) continue;
        unwrapWordSpans(doc);
        const sectionWords = foliateWordsRef.current.filter((word) => word.sectionIndex === index);
        await wrapWordsInSpans(doc, index, sectionStart, sectionWords);
      }
      if (!cancelled) {
        scheduleWordPositionIndexRebuild("section-restamp", 0);
      }
    };
    restampVisibleSections();
    return () => {
      cancelled = true;
    };
  }, [bookWordSections, invalidateWordPositionIndex, scheduleWordPositionIndexRebuild]);

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
      injectStyles(doc, settings, focusTextSize, {
        flowLeadingInsetPx: getFlowLeadingInsetPx(),
        flowTrailingInsetPx: getFlowTrailingInsetPx(),
      });
    }
    invalidateWordPositionIndex();
    scheduleWordPositionIndexRebuild("font-or-layout-change");
  }, [
    settings.theme,
    settings.fontFamily,
    focusTextSize,
    settings.layoutSpacing,
    getFlowLeadingInsetPx,
    getFlowTrailingInsetPx,
    invalidateWordPositionIndex,
    scheduleWordPositionIndexRebuild,
  ]);

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
        scrollContainerRef.current = resolveFoliateScrollContainer();
      } else {
        scrollContainerRef.current = null;
      }
    }
    invalidateWordPositionIndex();
    scheduleWordPositionIndexRebuild("flow-mode-change");
    if (flowMode) {
      const targetIdx = highlightedWordIndexRef.current;
      if (targetIdx > 0) {
        const scrollAfterLayout = () => {
          const roots = getRenderedWordRoots();
          for (const { root } of roots) {
            const el = root.querySelector?.(`[data-word-index="${targetIdx}"]`) as HTMLElement | null;
            if (el?.scrollIntoView) {
              el.scrollIntoView({ block: "center", behavior: "auto" });
              return;
            }
          }
        };
        setTimeout(scrollAfterLayout, 150);
      }
    }
  }, [
    flowMode,
    resolveFoliateScrollContainer,
    invalidateWordPositionIndex,
    scheduleWordPositionIndexRebuild,
    scrollContainerRef,
    getRenderedWordRoots,
  ]);

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
        setFlowInsetsForRenderedDocs(0, 0);
        return;
      }
      const lineHeight = parseFloat(getComputedStyle(container).lineHeight) || 24;
      const zonePosition = settings.flowZonePosition ?? FLOW_READING_ZONE_POSITION;
      const zoneLines = settings.flowZoneLines ?? FLOW_ZONE_LINES_DEFAULT;
      const viewportHeight = getFlowViewportHeightPx() || container.clientHeight;
      if (viewportHeight <= 0) return;
      const zoneHeightFrac = (lineHeight * zoneLines) / viewportHeight;
      const zoneTop = zonePosition;
      const zoneBottom = Math.min(zonePosition + zoneHeightFrac, 0.95);
      container.style.setProperty("--flow-zone-top", `${zoneTop * 100}%`);
      container.style.setProperty("--flow-zone-bottom", `${zoneBottom * 100}%`);
      setFlowInsetsForRenderedDocs(
        viewportHeight * zoneTop,
        viewportHeight * (1 - zoneTop),
      );
    };

    applyZoneProperties();

    const observer = new ResizeObserver(() => {
      applyZoneProperties();
      invalidateWordPositionIndex();
      scheduleWordPositionIndexRebuild("flow-zone-resize");
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
      container.style.removeProperty("--flow-zone-top");
      container.style.removeProperty("--flow-zone-bottom");
      setFlowInsetsForRenderedDocs(0, 0);
    };
  }, [
    flowMode,
    getFlowViewportHeightPx,
    settings.flowZonePosition,
    settings.flowZoneLines,
    setFlowInsetsForRenderedDocs,
    invalidateWordPositionIndex,
    scheduleWordPositionIndexRebuild,
  ]);

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
      invalidateWordPositionIndex();
      scheduleWordPositionIndexRebuild("container-resize");
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
    let lastPublishedIdx = currentIdx;
    const msPerWord = 60000 / (wpm || DEFAULT_WPM);
    let lastAdvance = performance.now();

    const tick = (now: number) => {
      const progress = getAudioProgressRef.current?.() ?? null;
      const holdDecision = resolveCursorHoldDecision({
        pauseReason: narrationPauseReasonRef.current,
        progress,
        thresholdMs: TTS_SILENCE_HOLD_THRESHOLD_MS,
      });

      if (!holdDecision.freezeForPause) {
        if (progress && Number.isFinite(progress.wordIndex)) {
          currentIdx = Math.max(0, Math.floor(progress.wordIndex));
          if (currentIdx !== lastPublishedIdx) {
            lastPublishedIdx = currentIdx;
            onFlowWordAdvanceRef.current?.(currentIdx);
          }
          lastAdvance = now;
        } else if (now - lastAdvance >= msPerWord) {
          currentIdx++;
          lastAdvance = now;
          if (currentIdx !== lastPublishedIdx) {
            lastPublishedIdx = currentIdx;
            onFlowWordAdvanceRef.current?.(currentIdx);
          }
        }
      }
      let found = false;
      try {
        const wordState = viewApiRef?.current?.resolveWordState(currentIdx);
        if (wordState?.found) {
          const indexedPosition = wordState.position;
          const spanRect = indexedPosition ?? wordState.span?.getBoundingClientRect();
          if (spanRect) {
            // getContents docs are inside iframes — find the iframe for coordinate transform
            const iframe = foliateIframeRef.current;
            const iframeRect = iframe?.getBoundingClientRect();
            // Compute position in page viewport
            let x = (iframeRect ? iframeRect.left : 0) + spanRect.left;
            const y = (iframeRect ? iframeRect.top : 0) + spanRect.top + spanRect.height;
            let w = spanRect.width;
            if (holdDecision.holdForSilence) {
              x += w;
              w = 1;
            }
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
          }
        }
      } catch { /* Content may have been unloaded during flow — skip iteration */ }
      if (!found) cursor.style.display = "none";
      flowRafRef.current = requestAnimationFrame(tick);
    };
    flowRafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(flowRafRef.current);
  }, [flowMode, readingMode, flowPlaying, wpm, viewApiRef]);

  useEffect(() => {
    if ((readingMode !== "flow" && readingMode !== "narrate") || narrationWordIndex == null) return;
    applyVisualHighlightByIndex(narrationWordIndex, "flow", false);
  }, [applyVisualHighlightByIndex, narrationWordIndex, readingMode]);

  // Narrate-mode scroll follow — keep the narrated word in view as narration advances.
  // In flow-surface mode, the Foliate iframe encompasses all section content and its
  // innerHeight matches the full document height. This makes both cached and live
  // getBoundingClientRect() checks unreliable for visibility — all words report as
  // "visible" from the iframe's perspective. Instead, unconditionally call
  // scrollToAnchor (throttled) to let the paginator keep the narrated word in view.
  const narrateScrollThrottleRef = useRef(0);
  // Track where scroll-follow last positioned the view. If the actual position
  // drifts beyond a threshold, the user must have scrolled away manually —
  // regardless of input method (wheel, keyboard, touch, etc.).
  const lastScrollFollowPosRef = useRef<number | null>(null);
  useEffect(() => {
    if (readingMode !== "narrate" || narrationWordIndex == null) return;
    const view = viewRef.current;
    if (!view?.renderer || !viewApiRef?.current) return;

    // If user has manually browsed away, don't snap back — let the recenter button handle it.
    if (userBrowsingRef.current) {
      if (import.meta.env.DEV) console.debug("[foliate] scroll-follow BLOCKED — userBrowsingRef is true, word:", narrationWordIndex);
      return;
    }

    // Displacement detection: compare where we are NOW with where scroll-follow
    // LAST placed the view. A drift beyond half the viewport means the user scrolled
    // away (works for any input method: wheel, keyboard, touch, CDP scroll tools).
    const currentPos = view.renderer.containerPosition;
    if (lastScrollFollowPosRef.current != null && typeof currentPos === "number") {
      const displacement = Math.abs(currentPos - lastScrollFollowPosRef.current);
      const viewportHeight = containerRef.current?.clientHeight ?? 400;
      if (displacement > viewportHeight * 0.3) {
        userBrowsingRef.current = true;
        if (import.meta.env.DEV) console.debug("[foliate] displacement detection — user browsed away, displacement:", displacement, "threshold:", viewportHeight * 0.3);
        return;
      }
    }

    const state = viewApiRef.current.resolveWordState(narrationWordIndex);
    if (!state.found && !narratePageTurnCooldownRef.current) {
      // Word is not in the current section's DOM — advance to next section
      narratePageTurnCooldownRef.current = true;
      if (import.meta.env.DEV) console.debug("[foliate] narrate page advance — word", narrationWordIndex, "not found, calling renderer.next()");
      view.renderer.next();
      setTimeout(() => {
        narratePageTurnCooldownRef.current = false;
      }, 300);
    } else if (state.found && state.span && state.doc) {
      // Throttle scrollToAnchor calls to max once per 500ms to avoid jitter
      const now = Date.now();
      if (now - narrateScrollThrottleRef.current < 500) return;
      narrateScrollThrottleRef.current = now;
      // scrollToAnchor is async — await it before applying zone offset
      const zoneOffset = getFlowFollowOffsetPx();
      const { doc: stateDoc, span: stateSpan } = state;
      if (!stateDoc || !stateSpan) return;
      (async () => {
        try {
          // Pre-flight check — user may have scrolled between the sync guard (above)
          // and the start of this async IIFE (micro-task gap).
          if (userBrowsingRef.current) return;
          const range = stateDoc.createRange();
          range.selectNodeContents(stateSpan);
          await view.renderer.scrollToAnchor?.(range);
          // Post-flight check — user may have scrolled while scrollToAnchor was resolving.
          // scrollToAnchor already moved the view, but we skip zone offset and log to
          // minimize further disruption. The next word advance will also be guarded.
          if (userBrowsingRef.current) return;
          // Apply zone offset — scrollToAnchor positions the word at the
          // paginator's top; subtract offset from containerPosition to push
          // the word down to the selected zone center (Top/Upper/Center/Bottom).
          if (zoneOffset > 0) {
            const renderer = viewRef.current?.renderer;
            if (renderer && typeof renderer.containerPosition === "number") {
              renderer.containerPosition = Math.max(0, renderer.containerPosition - zoneOffset);
            }
          }
          // Record final position for displacement detection on next tick
          const finalPos = viewRef.current?.renderer?.containerPosition;
          if (typeof finalPos === "number") lastScrollFollowPosRef.current = finalPos;
          if (import.meta.env.DEV) console.debug("[foliate] narrate scroll-follow — word", narrationWordIndex, "zoneOffset", zoneOffset, "containerPos", finalPos);
        } catch { /* Document may be closing during navigation — non-critical */ }
      })();
    }
  }, [narrationWordIndex, readingMode, viewApiRef, getFlowFollowOffsetPx]);

  useEffect(() => {
    if (readingMode !== "page" || highlightedWordIndex == null) return;
    applyVisualHighlightByIndex(highlightedWordIndex, undefined, false);
  }, [applyVisualHighlightByIndex, highlightedWordIndex, readingMode]);

  // Narration page-sync — advance page when narration reads past current view
  // Tracks foliate's reported fraction vs narration's progress fraction
  const foliateCurrentFractionRef = useRef(0);
  const pageTurnCooldownRef = useRef(false);
  const narratePageTurnCooldownRef = useRef(false);
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
      // FLOW-3A / NARR-FIX-1: In flow/narrate modes, FlowScrollEngine drives pacing
      // but the user can still browse away manually. Page navigation keys set the
      // browse-away flag AND navigate the renderer so the user can peek ahead/behind.
      // The recenter button lets them return to the active reading position.
      if (flowModeRef.current) {
        const mode = readingModeRef.current;
        if ((mode === "flow" || mode === "narrate") &&
            (e.key === "ArrowRight" || e.key === "PageDown" || e.key === "ArrowLeft" || e.key === "PageUp")) {
          userBrowsingRef.current = true;
          // Navigate the Foliate renderer so the user sees different content.
          // The iframe's native handler won't see this window-level event.
          if (e.key === "ArrowRight" || e.key === "PageDown") {
            view.renderer.next();
          } else {
            view.renderer.prev();
          }
        }
        return;
      }

      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        // During active flow reading, flag that user is browsing away — don't yank back
        if (readingModeRef.current === "flow" || readingModeRef.current === "narrate") userBrowsingRef.current = true;
        view.renderer.next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        if (readingModeRef.current === "flow" || readingModeRef.current === "narrate") userBrowsingRef.current = true;
        view.renderer.prev();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Manual scroll detection — mark user as browsing away when they scroll in a flow surface mode.
  // The Foliate paginator inside shadow DOM may stopPropagation() on wheel events before they
  // reach the React container, so we listen on window (capture phase) to reliably detect user
  // scrolling regardless of shadow DOM event handling.
  useEffect(() => {
    if (!flowMode) return;

    const handleWheel = () => {
      const mode = readingModeRef.current;
      if (mode === "flow" || mode === "narrate") {
        userBrowsingRef.current = true;
        if (import.meta.env.DEV) console.debug("[foliate] wheel → userBrowsingRef=true (mode:", mode, ")");
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true, capture: true });
    return () => window.removeEventListener("wheel", handleWheel, { capture: true });
  }, [flowMode]);

  // Expose navigation methods via ref
  const goNext = useCallback(() => viewRef.current?.renderer?.next(), []);
  const goPrev = useCallback(() => viewRef.current?.renderer?.prev(), []);
  const goTo = useCallback((target: string | number) => viewRef.current?.goTo(target), []);
  const goToFraction = useCallback((frac: number) => viewRef.current?.goToFraction(frac), []);

  return (
    <div
      className={`foliate-page-view${flowMode ? " foliate-page-view--flow" : ""}${chunkReadingVisualState ? " foliate-page-view--chunk-visual" : ""}`}
      ref={containerRef}
      style={{ overflow: flowMode ? "auto" : "hidden" }}
    >
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
          className="recenter-reading-box-btn"
          onClick={onJumpToHighlight}
          aria-label="Recenter reading box on current sentence"
          title="Recenter reading box on current sentence"
        >
          ↩ Recenter box
        </button>
      )}
      {loading && <div className="foliate-loading">Loading book...</div>}
      {error && <div className="foliate-error">{error}</div>}
      <div ref={cursorRef} className="foliate-flow-cursor" />
      {/* FLOW-3A: Shrinking underline cursor for FlowScrollEngine (rendered in JSX per LL-014 known trap) */}
      {flowMode && readingMode === "flow" && <div ref={flowCursorRef} className="flow-shrink-cursor" />}
    </div>
  );
}
