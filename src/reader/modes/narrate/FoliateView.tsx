/**
 * Narrate's private copy of FoliatePageView (READER-MODE-SEPARATION-2 design §B.5, Narrate variant:
 * flow="scrolled", arrows browse away and turn the renderer, the narration highlight effect
 * (`applyVisualHighlightByIndex(narrationWordIndex, "narrate", false)`) with scroll-follow (throttle
 * 500 ms, displacement 0.3 × viewport, page-turn cooldown 300 ms), chunk visual "narrate" with the
 * narrate cursor suppression, and `foliate-page-view--chunk-visual` → `rm-narrate-view--chunk-visual`).
 *
 * Owns its own non-React host div, <foliate-view> element, word cache, paragraph breaks,
 * WordPositionIndex, timers and listeners; `view.close()` and `host.innerHTML = ""` run on unmount.
 * foliate is reached only through `import("foliate-js/view.js")`, and every section document only
 * through `view.renderer.getContents()` (LL-032: no iframe querySelectorAll). Book bytes come from the
 * document port; diagnostics go to the diagnostics port; the narration word is a value the binding reads
 * from the audio port (this view never touches audio). Removed from the shared original because Narrate
 * never reaches them: the page-turn buttons, the Page soft highlight and its highlight effect, the
 * flow chunk-follow fallback and shrink cursor, the FlowScrollEngine rendered-word-roots provider (no
 * engine consumer: design §B.4), the recenter-chunk helper (reachable only through returnToNarration,
 * which has no caller) and the dead overlay cursor (silenceAwareCursor, getAudioProgress,
 * narrationPauseReason). The legacy flowMode toggle effect runs once the view has loaded (arrival
 * positioning, design §B.5 item 7); the mount-time reset of the legacy readingMode effect is the
 * fresh refs' initial values.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import type { MutableRefObject } from "react";
import type { BlurbySettings } from "../../../types";
import type { SectionBoundary } from "../../../types/narration";
import type { DeepReadonly, ReaderDocumentSnapshot } from "../../document/ReaderDocumentSnapshot";
import {
  getSectionGlobalOffset,
  resolveGlobalWordIndexToRendered,
  resolveRenderedWordIndexToGlobal,
  resolveTrustedRenderedWordIndexToGlobal,
} from "./helpers/foliateWordOffsets";
import {
  FLOW_ZONE_INITIAL_TOP,
  FLOW_ZONE_LINES_DEFAULT,
  FOLIATE_RENDERER_HEIGHT_MARGIN_PX,
  FOLIATE_MARGIN_PX,
  FOLIATE_MAX_INLINE_SIZE_PX,
  FOLIATE_SECTION_READY_TIMEOUT_MS,
} from "../../../constants";
import { injectStyles } from "./helpers/foliateStyles";
import { getFoliateMaxColumnCount } from "./helpers/foliateLayout";
import {
  applyChunkReadingVisualStateToRoots,
  buildChunkReadingScrollKey,
  clearChunkReadingVisualStateFromRoots,
  scrollChunkReadingVisualStateToTopOfRoots,
  resolveFoliateWordHighlightClass,
  shouldSuppressNarrateFlowCursor,
} from "./helpers/foliateWordHighlight";
import type { ChunkReadingVisualState } from "../../../types/chunkReading";
import {
  extractWordsFromView,
  extractWordsFromSection,
  queryWordSpans,
  parseWordIndexAttribute,
  type FoliateWord,
} from "./helpers/foliateHelpers";
import { WordPositionIndex, type WordPositionEntry } from "./helpers/wordPositionIndex";
import { unwrapWordSpans, wrapWordsInSpans } from "./helpers/foliateWordWrapping";

const NARRATE_HIGHLIGHT_MODE = "narrate";
/** Legacy narrate scroll-follow tuning (FoliatePageView, copied values). */
const NARRATE_SCROLL_FOLLOW_THROTTLE_MS = 500;
const NARRATE_DISPLACEMENT_VIEWPORT_FRACTION = 0.3;
const NARRATE_PAGE_TURN_COOLDOWN_MS = 300;

/**
 * A rendered section root (structurally the legacy FlowRenderedWordRootDescriptor type, declared here
 * so Narrate has no edge into any Flow file; helpers/foliateWordHighlight.ts imports it from here).
 */
export interface NarrateRenderedWordRootDescriptor {
  root: ParentNode;
  doc?: Document | null;
  sectionIndex?: number | null;
  ready?: boolean;
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

export interface NarrateFoliateHighlightOptions {
  allowMotion?: boolean;
  forceMotion?: boolean;
}

export interface NarrateWordState {
  found: boolean;
  visible: boolean;
  span: HTMLElement | null;
  spans: HTMLElement[];
  doc: Document | null;
  position: WordPositionEntry | null;
}

/** The subset of the legacy FoliateViewAPI that Narrate uses. */
export interface NarrateFoliateViewAPI {
  getWords: () => FoliateWord[];
  getParagraphBreaks: () => Set<number>;
  goTo: (target: string | number) => Promise<unknown>;
  next: () => void;
  prev: () => void;
  /** Highlight a word by global index. Returns true if found, false if span not in DOM. */
  highlightWordByIndex: (wordIndex: number, styleHint?: "flow" | "narrate", options?: NarrateFoliateHighlightOptions) => boolean;
  resolveWordState: (wordIndex: number) => NarrateWordState;
  getSectionForWordIndex: (wordIndex: number) => number | null;
  findFirstVisibleWordIndex: () => number;
  isUserBrowsing: () => boolean;
  goToSection: (sectionIndex: number) => Promise<void>;
  waitForSectionReady: (sectionIndex?: number | null, timeoutMs?: number) => Promise<number | null>;
  clearSoftHighlight: () => void;
  clearUserBrowsing: () => void;
}

export interface NarrateFoliateViewProps {
  document: ReaderDocumentSnapshot;
  settings: DeepReadonly<BlurbySettings>;
  focusTextSize: number;
  initialCfi: string | null;
  /** Document port: cached per generation; this view wraps its own File. */
  readBookBytes: () => Promise<ArrayBuffer>;
  /** Diagnostics port (legacy recordDiagEvent). */
  recordDiagnostic: (kind: string, detail: string) => void;
  onRelocate: (detail: { cfi: string; fraction: number }) => void;
  onTocReady: (toc: unknown[], sectionCount: number) => void;
  onWordClick: (cfi: string, word: string, sectionIndex?: number, wordOffsetInSection?: number, globalWordIndex?: number) => void;
  onLoad: () => void;
  /** Legacy onWordsReextracted (after each full re-extraction or section append). */
  onWordsReextracted: () => void;
  viewApiRef: MutableRefObject<NarrateFoliateViewAPI | null>;
  showJumpBackToAnchor: boolean;
  onJumpBackToAnchor: () => void;
  onUserBrowseAway: () => void;
  highlightedWordIndex: number;
  /** Legacy `narration.speaking ? narration.cursorWordIndex : undefined` (read from the audio port). */
  narrationWordIndex?: number;
  bookWordSections?: readonly Readonly<SectionBoundary>[];
  renderVersion: number;
  getCanonicalSectionWords?: (sectionIndex: number) => string[] | undefined;
  /** CHUNK-SYNC-3: Narrate's declared chunk visual state. */
  chunkReadingVisualState: ChunkReadingVisualState | null;
}

type RenderedWordRoot = NarrateRenderedWordRootDescriptor;

export default function NarrateFoliateView({
  document: doc0,
  settings: frozenSettings,
  focusTextSize,
  initialCfi,
  readBookBytes,
  recordDiagnostic,
  onRelocate,
  onTocReady,
  onWordClick,
  onLoad,
  onWordsReextracted,
  viewApiRef,
  showJumpBackToAnchor,
  onJumpBackToAnchor,
  onUserBrowseAway,
  highlightedWordIndex,
  narrationWordIndex,
  bookWordSections,
  renderVersion,
  getCanonicalSectionWords,
  chunkReadingVisualState,
}: NarrateFoliateViewProps) {
  // injectStyles only reads settings; the frozen snapshot is passed through its legacy parameter type.
  const settings = frozenSettings as BlurbySettings;
  const containerRef = useRef<HTMLDivElement>(null);
  const foliateHostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<any>(null);
  const foliateWordsRef = useRef<FoliateWord[]>([]);
  const foliateParagraphBreaksRef = useRef<Set<number>>(new Set());
  const wordPositionIndexRef = useRef<WordPositionIndex>(new WordPositionIndex());
  const wordPositionRebuildTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHandledRenderVersionRef = useRef(renderVersion);
  const lastLoadedSectionIndexRef = useRef<number | null>(null);
  // Track when the user has manually browsed away from the anchor
  const userBrowsingRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onWordClickRef = useRef(onWordClick);
  onWordClickRef.current = onWordClick;
  const onUserBrowseAwayRef = useRef(onUserBrowseAway);
  onUserBrowseAwayRef.current = onUserBrowseAway;
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;
  const onWordsReextractedRef = useRef(onWordsReextracted);
  onWordsReextractedRef.current = onWordsReextracted;
  const onRelocateRef = useRef(onRelocate);
  onRelocateRef.current = onRelocate;
  const onTocReadyRef = useRef(onTocReady);
  onTocReadyRef.current = onTocReady;
  const recordDiagnosticRef = useRef(recordDiagnostic);
  recordDiagnosticRef.current = recordDiagnostic;
  const bookWordSectionsRef = useRef(bookWordSections);
  bookWordSectionsRef.current = bookWordSections;
  const getCanonicalSectionWordsRef = useRef(getCanonicalSectionWords);
  getCanonicalSectionWordsRef.current = getCanonicalSectionWords;
  const highlightedWordIndexRef = useRef<number>(highlightedWordIndex ?? -1);
  highlightedWordIndexRef.current = highlightedWordIndex ?? -1;
  const chunkReadingVisualStateRef = useRef<ChunkReadingVisualState | null>(chunkReadingVisualState);
  chunkReadingVisualStateRef.current = chunkReadingVisualState;
  const lastChunkTopScrollKeyRef = useRef<string | null>(null);
  // Narrate scroll follow: where it last positioned the view (displacement detection), its throttle,
  // and the page-turn cooldown (with its timer, cleared on unmount).
  const lastScrollFollowPosRef = useRef<number | null>(null);
  const narrateScrollThrottleRef = useRef(0);
  const narratePageTurnCooldownRef = useRef(false);
  const narratePageTurnCooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const liveSections = () => bookWordSectionsRef.current as SectionBoundary[] | undefined;

  const clearVisualWordClasses = useCallback((contents: Array<{ doc: Document }>) => {
    for (const { doc: d } of contents) {
      try {
        d?.querySelectorAll?.(".page-word--highlighted")?.forEach((el: Element) => {
          el.classList.remove("page-word--highlighted");
        });
        d?.querySelectorAll?.(".page-word--flow-cursor")?.forEach((el: Element) => {
          el.classList.remove("page-word--flow-cursor");
        });
        d?.querySelectorAll?.(".page-word--narrate-cursor")?.forEach((el: Element) => {
          el.classList.remove("page-word--narrate-cursor");
        });
        d?.querySelectorAll?.(".page-word--soft-selected")?.forEach((el: Element) => {
          el.classList.remove("page-word--soft-selected");
        });
      } catch {
        // Safe to ignore for detached/partial docs.
      }
    }
  }, []);

  const resolveReadySectionIndex = useCallback((sectionIndex?: number | null): number | null => {
    const contents = viewRef.current?.renderer?.getContents?.() ?? [];
    const ready = contents
      .filter((entry: { doc?: Document | null; index?: number }) => {
        if (!entry?.doc || typeof entry.index !== "number") return false;
        if (typeof sectionIndex === "number" && entry.index !== sectionIndex) return false;
        return entry.doc.querySelector?.("[data-word-index]") != null;
      })
      .map((entry: { index: number }) => entry.index);
    if (ready.length === 0) return null;
    if (typeof sectionIndex === "number") return sectionIndex;
    const preferred = lastLoadedSectionIndexRef.current;
    if (preferred != null && ready.includes(preferred)) return preferred;
    return Math.min(...ready);
  }, []);

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

  const getRenderedWordRoots = useCallback((sectionIndex?: number | null): RenderedWordRoot[] => {
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
      .sort((a: RenderedWordRoot, b: RenderedWordRoot) => {
        if (preferredSectionIndex != null) {
          if (a.sectionIndex === preferredSectionIndex && b.sectionIndex !== preferredSectionIndex) return -1;
          if (b.sectionIndex === preferredSectionIndex && a.sectionIndex !== preferredSectionIndex) return 1;
        }
        return (a.sectionIndex ?? 0) - (b.sectionIndex ?? 0);
      });
  }, []);

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
    return pickScrollableElement(scrollCandidates);
  }, []);

  const getFlowViewportHeightPx = useCallback((): number => {
    const scrollContainerHeight = resolveFoliateScrollContainer()?.clientHeight ?? 0;
    if (scrollContainerHeight > 0) return scrollContainerHeight;
    return containerRef.current?.clientHeight ?? 0;
  }, [resolveFoliateScrollContainer]);

  const getFlowLeadingInsetPx = useCallback((): number => {
    const viewportHeight = getFlowViewportHeightPx();
    if (viewportHeight <= 0) return 0;
    return Math.max(0, Math.round(viewportHeight * FLOW_ZONE_INITIAL_TOP));
  }, [getFlowViewportHeightPx]);

  const getFlowTrailingInsetPx = useCallback((): number => {
    const viewportHeight = getFlowViewportHeightPx();
    if (viewportHeight <= 0) return 0;
    return Math.max(0, Math.round(viewportHeight * (1 - FLOW_ZONE_INITIAL_TOP)));
  }, [getFlowViewportHeightPx]);

  const getFlowFollowOffsetPx = useCallback((): number => {
    const viewportHeight = getFlowViewportHeightPx();
    if (viewportHeight <= 0) return 0;
    const container = containerRef.current;
    const lineHeight = container ? parseFloat(getComputedStyle(container).lineHeight) || 24 : 24;
    const zoneLines = settings.flowZoneLines ?? FLOW_ZONE_LINES_DEFAULT;
    return Math.max(0, Math.round((viewportHeight * FLOW_ZONE_INITIAL_TOP) + ((lineHeight * zoneLines) / 2)));
  }, [
    getFlowViewportHeightPx,
    settings.flowZoneLines,
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
    recordDiagnosticRef.current(
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

  const markUserBrowsingAway = useCallback(() => {
    userBrowsingRef.current = true;
    onUserBrowseAwayRef.current?.();
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

  const applyVisualHighlightByIndex = useCallback((
    wordIndex: number,
    styleHint?: "flow" | "narrate",
    allowMotion = true,
    forceMotion = false,
  ): boolean => {
    const view = viewRef.current;
    if (!view?.renderer || !viewApiRef.current) return false;

    const state = viewApiRef.current.resolveWordState(wordIndex);
    const contents = view.renderer?.getContents?.() ?? [];
    const suppressNarrateFlowCursor = shouldSuppressNarrateFlowCursor(
      NARRATE_HIGHLIGHT_MODE,
      chunkReadingVisualStateRef.current,
    );
    const highlightClass = suppressNarrateFlowCursor
      ? null
      : resolveFoliateWordHighlightClass(NARRATE_HIGHLIGHT_MODE, styleHint);

    clearVisualWordClasses(contents);

    if (!state.found || !state.span) {
      return false;
    }

    if (highlightClass) {
      const highlightTargets = state.spans.length > 0 ? state.spans : [state.span];
      highlightTargets.forEach((el: Element) => {
        el.classList.add(highlightClass);
      });
    }

    if (allowMotion && state.doc && !userBrowsingRef.current && (!state.visible || forceMotion)) {
      try {
        const range = state.doc.createRange();
        range.selectNodeContents(state.span);
        view.renderer.scrollToAnchor?.(range);
      } catch {
        // Safe to ignore.
      }
    }

    // No browsed-away auto-clear: the scrolled surface reports every word as visible, so Narrate
    // relies on explicit jump-back to clear (legacy: auto-clear only in page mode).

    return true;
  }, [clearVisualWordClasses, viewApiRef]);

  const centerResolvedTokenInReadingWindow = useCallback((
    doc: Document,
    resolution: RenderedTokenResolution,
  ): boolean => {
    const view = viewRef.current;
    const range = buildResolvedTokenRange(doc, resolution);
    if (!view?.renderer?.scrollToAnchor || !range) return false;

    userBrowsingRef.current = false;
    lastScrollFollowPosRef.current = null;
    const zoneOffset = getFlowFollowOffsetPx();

    (async () => {
      try {
        await view.renderer.scrollToAnchor(range);
        if (zoneOffset > 0) {
          const renderer = viewRef.current?.renderer;
          if (renderer && typeof renderer.containerPosition === "number") {
            renderer.containerPosition = Math.max(0, renderer.containerPosition - zoneOffset);
          }
        }
        const finalPos = viewRef.current?.renderer?.containerPosition;
        if (typeof finalPos === "number") lastScrollFollowPosRef.current = finalPos;
      } catch {
        // The section can unload while a click/selection scroll is in flight.
      }
    })();

    return true;
  }, [getFlowFollowOffsetPx]);
  const centerResolvedTokenInReadingWindowRef = useRef(centerResolvedTokenInReadingWindow);
  centerResolvedTokenInReadingWindowRef.current = centerResolvedTokenInReadingWindow;

  // CHUNK-SYNC-2/3: render Narrate's declared chunk state; follow a new chunk to the reading zone unless
  // the user has browsed away (NARR-FIX-1); suppress the per-word narrate cursor while a chunk is active.
  useEffect(() => {
    if (chunkReadingVisualState) {
      applyChunkReadingVisualStateToRoots(getRenderedWordRoots(), chunkReadingVisualState);
      const scrollKey = buildChunkReadingScrollKey(chunkReadingVisualState);
      if (scrollKey
        && scrollKey !== lastChunkTopScrollKeyRef.current
        && !userBrowsingRef.current
      ) {
        scrollChunkReadingVisualStateToTopOfRoots(getRenderedWordRoots(), chunkReadingVisualState, {
          scrollContainer: resolveFoliateScrollContainer(),
          topOffsetPx: getFlowFollowOffsetPx(),
        });
        lastChunkTopScrollKeyRef.current = scrollKey;
      }
      if (shouldSuppressNarrateFlowCursor(NARRATE_HIGHLIGHT_MODE, chunkReadingVisualState)) {
        clearVisualWordClasses(viewRef.current?.renderer?.getContents?.() ?? []);
      }
      return;
    }
    lastChunkTopScrollKeyRef.current = null;
    clearChunkReadingVisualStateFromRoots(getRenderedWordRoots());
  }, [
    clearVisualWordClasses,
    chunkReadingVisualState,
    getFlowFollowOffsetPx,
    getRenderedWordRoots,
    resolveFoliateScrollContainer,
  ]);

  // Load the EPUB via foliate-js
  useEffect(() => {
    if (!doc0?.filepath || !containerRef.current) return;

    let cancelled = false;
    const container = containerRef.current;

    // Create a host div that React doesn't manage — prevents removeChild conflicts
    if (!foliateHostRef.current) {
      foliateHostRef.current = window.document.createElement("div");
      container.appendChild(foliateHostRef.current);
    }
    foliateHostRef.current.className = "rm-narrate-host";
    foliateHostRef.current.style.cssText = "width:100%;height:100%;position:absolute;inset:0;z-index:0;";
    const host = foliateHostRef.current;
    let arrivalScrollTimer: ReturnType<typeof setTimeout> | null = null;

    const loadBook = async () => {
      try {
        setLoading(true);
        setError(null);

        // Import foliate-js modules (ESM, runs in renderer)
        await import("foliate-js/view.js");

        const buffer: ArrayBuffer = await readBookBytes();
        if (cancelled) return;

        if (!buffer) {
          setError("Could not read EPUB file");
          setLoading(false);
          return;
        }

        // Create this view's own File object from the bytes
        const fileName = (doc0.filepath || "book.epub").split(/[\\/]/).pop() || "book.epub";
        const file = new File([buffer], fileName, { type: "application/epub+zip" });

        // Create and mount the foliate-view element inside the non-React host
        const view = window.document.createElement("foliate-view") as any;
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

          // Extract words and wrap in spans
          const v2 = viewRef.current;
          if (v2) {
            // During active flow reading, only wrap the new section without re-extracting everything
            // (re-extraction shifts indices, breaking the global word array mapping)
            if (foliateWordsRef.current.length > 0) {
              // Extract just this section's words and append/update in the existing array
              const sectionWords = extractWordsFromSection(doc, index);
              // HOTFIX-10: Use global offset from extraction data when available
              const bookSection = liveSections()?.find(s => s.sectionIndex === index);
              // TTS-7J (BUG-129): Deduplicate — remove any existing words for this
              // sectionIndex before appending. Recovery/reload of the same section
              // previously doubled the word array (e.g. 8770 → 17540).
              const existingWithoutSection = foliateWordsRef.current.filter(w => w.sectionIndex !== index);
              const existingEnd = existingWithoutSection.length;
              const sectionStart = bookSection ? bookSection.startWordIdx : existingEnd;
              const canonicalWords = getCanonicalSectionWordsRef.current?.(index);
              // Wrap this section's words with correct indices (STAB-1A: now async)
              await wrapWordsInSpans(doc, index, sectionStart, sectionWords, canonicalWords);
              // Replace (not append) — deduped base + fresh section words
              const newSectionWords = sectionWords.map(w => ({ ...w, sectionIndex: index }));
              const prevTotal = foliateWordsRef.current.length;
              foliateWordsRef.current = [...existingWithoutSection, ...newSectionWords];
              const newTotal = foliateWordsRef.current.length;
              // TTS-7J: Diagnostic — track section word refresh and detect unexpected growth
              recordDiagnosticRef.current("word-source-refresh", `section ${index}: ${newSectionWords.length} words, total ${prevTotal} → ${newTotal}`);
              if (newTotal > prevTotal * 1.5 && prevTotal > 100) {
                recordDiagnosticRef.current("word-source-growth-warning", `unexpected growth: ${prevTotal} → ${newTotal} (${Math.round(newTotal / prevTotal * 100)}%)`);
              }
              onWordsReextractedRef.current?.();
            } else {
              // Full re-extraction (first load)
              const extracted = extractWordsFromView(v2);
              foliateWordsRef.current = extracted.words;
              foliateParagraphBreaksRef.current = extracted.paragraphBreaks;
              onWordsReextractedRef.current?.();
              // TTS selection-start fix: when full-book extraction boundaries exist,
              // stamp DOM spans with the global section offset, not the local loaded-slice offset.
              const sectionStart = getSectionGlobalOffset(index, extracted.words, liveSections());
              if (sectionStart >= 0) {
                const sectionWords = extracted.words.filter((word) => word.sectionIndex === index);
                const canonicalWords = getCanonicalSectionWordsRef.current?.(index);
                await wrapWordsInSpans(doc, index, sectionStart, sectionWords, canonicalWords);
              }
            }
          }

          lastLoadedSectionIndexRef.current = index;
          scheduleWordPositionIndexRebuild(`section-load:${index}`, 0);

          // Delegated click handler on the injected word spans
          doc.body.addEventListener("click", (ev: MouseEvent) => {
            const target = (ev.target as HTMLElement)?.closest?.("[data-word-index]");
            if (!target) return;
            if ((ev.target as HTMLElement)?.closest?.("a[href]")) return;

            const resolvedToken = resolveRenderedToken(doc.body, target);
            if (!resolvedToken) return;

            const clickHighlightClass = resolveFoliateWordHighlightClass(NARRATE_HIGHLIGHT_MODE);
            doc.querySelectorAll(".page-word--highlighted, .page-word--flow-cursor, .page-word--narrate-cursor").forEach((el: Element) => {
              el.classList.remove("page-word--highlighted", "page-word--flow-cursor", "page-word--narrate-cursor");
            });
            getResolvedTokenHighlightSpans(doc, resolvedToken).forEach((el: Element) =>
              el.classList.add(clickHighlightClass)
            );
            centerResolvedTokenInReadingWindowRef.current(doc, resolvedToken);

            const v = viewRef.current;
            if (v) {
              const contents = v.renderer?.getContents?.() ?? [];
              const match = contents.find((c: any) => c.doc === doc);
              if (match) {
                const tokenRange = buildResolvedTokenRange(doc, resolvedToken);
                const fallbackRange = doc.createRange();
                fallbackRange.selectNodeContents(target);
                const cfi = v.getCFI(match.index, tokenRange ?? fallbackRange);
                const exactIdx = resolveTrustedRenderedWordIndexToGlobal(
                  match.index,
                  resolvedToken.renderedWordIndex,
                  foliateWordsRef.current,
                  liveSections(),
                  resolvedToken.renderedWordIndexes,
                );
                const sectionBase = getSectionGlobalOffset(match.index, foliateWordsRef.current, liveSections());
                const wordOffsetInSection = exactIdx != null && sectionBase >= 0
                  ? exactIdx - sectionBase
                  : Math.max(0, resolvedToken.renderedWordIndex);
                onWordClickRef.current?.(
                  cfi,
                  resolvedToken.canonicalWord,
                  match.index,
                  wordOffsetInSection,
                  exactIdx ?? undefined,
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
              if (match && resolvedToken) {
                const selHighlightClass = resolveFoliateWordHighlightClass(NARRATE_HIGHLIGHT_MODE);
                doc.querySelectorAll(".page-word--highlighted, .page-word--flow-cursor, .page-word--narrate-cursor").forEach((el: Element) => {
                  el.classList.remove("page-word--highlighted", "page-word--flow-cursor", "page-word--narrate-cursor");
                });
                getResolvedTokenHighlightSpans(doc, resolvedToken).forEach((el: Element) =>
                  el.classList.add(selHighlightClass)
                );
                centerResolvedTokenInReadingWindowRef.current(doc, resolvedToken);

                const tokenRange = buildResolvedTokenRange(doc, resolvedToken);
                const cfi = v.getCFI(match.index, tokenRange ?? range);
                const exactIdx = resolveTrustedRenderedWordIndexToGlobal(
                  match.index,
                  resolvedToken.renderedWordIndex,
                  foliateWordsRef.current,
                  liveSections(),
                  resolvedToken.renderedWordIndexes,
                );
                const sectionBase = getSectionGlobalOffset(match.index, foliateWordsRef.current, liveSections());
                const wordOffsetInSection = exactIdx != null && sectionBase >= 0
                  ? exactIdx - sectionBase
                  : Math.max(0, resolvedToken.renderedWordIndex);
                const canonicalWord = resolvedToken.canonicalWord || word;
                onWordClickRef.current?.(
                  cfi,
                  canonicalWord,
                  match.index,
                  wordOffsetInSection,
                  exactIdx ?? undefined,
                );
              }
            }
          });

          // Forward keyboard events from the section document to the parent window
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
          const { cfi } = e.detail;
          const fraction = e.detail.fraction ?? 0;
          onRelocateRef.current?.({ cfi, fraction });
          scheduleWordPositionIndexRebuild("relocate");
        });

        // Open the book
        await view.open(file);
        if (cancelled) return;

        // Set renderer attributes (Narrate is always scrolled)
        view.renderer.setAttribute("flow", "scrolled");
        view.renderer.setAttribute("margin", `${FOLIATE_MARGIN_PX}px`);
        // NOTE: Do NOT set "gap" — foliate-js interprets it as a percentage (default 7%).
        view.renderer.setAttribute("max-block-size", `${container.clientHeight - FOLIATE_RENDERER_HEIGHT_MARGIN_PX}px`);
        view.renderer.setAttribute("max-inline-size", `${FOLIATE_MAX_INLINE_SIZE_PX}px`);
        view.renderer.setAttribute("max-column-count", getFoliateMaxColumnCount(true, container.clientWidth));

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
          onTocReadyRef.current?.(attachSectionIndices(view.book.toc), sections.length ?? 0);
        }

        // Navigate to last position or start from the very beginning (cover page).
        // Only pass lastLocation when a real CFI exists — passing null causes foliate
        // to skip the cover and land on the first text section (~page 3).
        const initOptions = initialCfi ? { lastLocation: initialCfi } : {};
        await view.init(initOptions);

        if (!initialCfi) {
          // No saved CFI — check if there's a saved position (word index) to approximate
          const savedPos = doc0.position || 0;
          const wordCount = doc0.wordCount || 1;
          if (savedPos > 0 && wordCount > 0) {
            const fraction = Math.min(savedPos / wordCount, 1);
            await view.goToFraction(fraction);
          } else {
            await view.goToFraction(0);
          }
        }

        // Populate this view's imperative API ref
        const resolveWordState = (wordIndex: number): NarrateWordState => {
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
            recordDiagnosticRef.current("word-position-index-miss", `word=${wordIndex} reason=stale-index-entry`);
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
              recordDiagnosticRef.current("word-position-index-miss", `word=${wordIndex} reason=direct-fallback-hit`);
              return { found: true, visible, span, spans: [span], doc: d, position: null };
            } catch { /* Word may be in detached section — try next content source */ }
          }
          const sections = liveSections();
          if (sections && sections.length > 0) {
            const sectionIdx = getSectionForWordIndex(wordIndex);
            if (sectionIdx != null) {
              const renderedWordIndex = resolveGlobalWordIndexToRendered(
                sectionIdx,
                wordIndex,
                foliateWordsRef.current,
                sections,
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
                  recordDiagnosticRef.current("word-position-index-miss", `word=${wordIndex} reason=section-fallback-hit`);
                  return { found: true, visible, span, spans: [span], doc: d, position: null };
                } catch { /* Rendered word index may not exist in this section — try next */ }
              }
            }
          }
          recordDiagnosticRef.current("word-position-index-miss", `word=${wordIndex} reason=not-found`);
          return { found: false, visible: false, span: null, spans: [], doc: null, position: null };
        };

        // TTS-7K (BUG-132): prefer the global section boundaries when they exist.
        const getSectionForWordIndex = (wordIndex: number): number | null => {
          const sections = liveSections();
          if (sections && sections.length > 0) {
            for (let i = sections.length - 1; i >= 0; i--) {
              if (wordIndex >= sections[i].startWordIdx) {
                return sections[i].sectionIndex;
              }
            }
            return sections[0]?.sectionIndex ?? null;
          }
          const words = foliateWordsRef.current;
          if (wordIndex >= 0 && wordIndex < words.length) {
            return words[wordIndex].sectionIndex;
          }
          return null;
        };

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
          next: () => view.renderer.next(),
          prev: () => view.renderer.prev(),
          highlightWordByIndex: (wordIndex, styleHint, options) =>
            applyVisualHighlightByIndex(wordIndex, styleHint, options?.allowMotion ?? true, options?.forceMotion ?? false),
          resolveWordState,
          getSectionForWordIndex,
          findFirstVisibleWordIndex: () => {
            const indexedFirstVisible = wordPositionIndexRef.current.findFirstVisibleWordIndex();
            if (indexedFirstVisible >= 0) return indexedFirstVisible;

            // Fallback path: walk all loaded sections and find the first visible word span.
            recordDiagnosticRef.current("word-position-index-miss", "word=-1 reason=first-visible-fallback");
            const contents = view.renderer?.getContents?.() ?? [];
            for (const { doc: d, index } of contents) {
              try {
                if (typeof index !== "number") continue;
                const spans = queryWordSpans(d);
                for (const span of spans) {
                  const rect = (span as HTMLElement).getBoundingClientRect();
                  const iframeWin = d.defaultView;
                  if (!iframeWin) continue;
                  if (rect.width > 0 && rect.left >= 0 && rect.left < iframeWin.innerWidth &&
                      rect.top >= 0 && rect.top < iframeWin.innerHeight) {
                    const renderedIdx = parseWordIndexAttribute((span as HTMLElement).getAttribute("data-word-index"));
                    if (renderedIdx != null && renderedIdx >= 0) {
                      return resolveRenderedWordIndexToGlobal(index, renderedIdx, foliateWordsRef.current, liveSections());
                    }
                  }
                }
              } catch { /* Section may be unloading — skip to next content source */ }
            }
            return -1; // No visible words (e.g., cover page with only images)
          },
          isUserBrowsing: () => userBrowsingRef.current,
          goToSection: async (sectionIndex: number) => {
            const sections = view.book?.sections;
            if (!sections || sectionIndex >= sections.length) return;
            const section = sections[sectionIndex];
            if (section?.id) {
              await view.goTo(section.id);
            } else if (section?.href) {
              await view.goTo(section.href);
            } else {
              const frac = sectionIndex / Math.max(sections.length, 1);
              await view.goToFraction(frac);
            }
          },
          waitForSectionReady,
          clearSoftHighlight: () => clearSoftHighlight(),
          clearUserBrowsing: () => {
            userBrowsingRef.current = false;
            lastScrollFollowPosRef.current = null;
          },
        };

        // Arrival positioning: the legacy flowMode effect (scrolled surface) re-indexes and centers the
        // highlighted word after layout; a fresh view runs it once its book has loaded.
        invalidateWordPositionIndex();
        scheduleWordPositionIndexRebuild("flow-mode-change");
        const targetIdx = highlightedWordIndexRef.current;
        if (targetIdx >= 0) {
          const scrollAfterLayout = () => {
            arrivalScrollTimer = null;
            const roots = getRenderedWordRoots();
            for (const { root } of roots) {
              const el = root.querySelector?.(`[data-word-index="${targetIdx}"]`) as HTMLElement | null;
              if (el?.scrollIntoView) {
                el.scrollIntoView({ block: "center", behavior: "auto" });
                return;
              }
            }
          };
          arrivalScrollTimer = setTimeout(scrollAfterLayout, 150);
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
      if (arrivalScrollTimer) clearTimeout(arrivalScrollTimer);
      clearWordPositionRebuildTimer();
      invalidateWordPositionIndex();
      viewApiRef.current = null;
      if (narratePageTurnCooldownTimerRef.current) clearTimeout(narratePageTurnCooldownTimerRef.current);
      if (viewRef.current) {
        viewRef.current.close?.();
        viewRef.current = null;
      }
      if (foliateHostRef.current) foliateHostRef.current.innerHTML = "";
    };
  }, [doc0.filepath, doc0.documentId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (renderVersion === lastHandledRenderVersionRef.current) return;
    lastHandledRenderVersionRef.current = renderVersion;
    invalidateWordPositionIndex();
    scheduleWordPositionIndexRebuild(`render-version:${renderVersion}`);
  }, [renderVersion, invalidateWordPositionIndex, scheduleWordPositionIndexRebuild]);

  useEffect(() => {
    if (!bookWordSections || bookWordSections.length === 0) return;
    let cancelled = false;
    const restampVisibleSections = async () => {
      invalidateWordPositionIndex();
      const view = viewRef.current;
      const contents = view?.renderer?.getContents?.() ?? [];
      for (const { doc, index } of contents) {
        if (!doc?.body) continue;
        const sectionStart = getSectionGlobalOffset(index, foliateWordsRef.current, bookWordSections as SectionBoundary[]);
        if (sectionStart < 0) continue;
        unwrapWordSpans(doc);
        const sectionWords = foliateWordsRef.current.filter((word) => word.sectionIndex === index);
        const canonicalWords = getCanonicalSectionWordsRef.current?.(index);
        await wrapWordsInSpans(doc, index, sectionStart, sectionWords, canonicalWords);
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

  // Update the renderer on settings changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view?.renderer) return;

    const container = containerRef.current;
    if (!container) return;

    view.renderer.setAttribute("max-column-count", getFoliateMaxColumnCount(true, container.clientWidth));
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
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // FLOW-ZONE-AUTO: Seed --flow-zone-top / --flow-zone-bottom on the masked outer element (the
  // scrolled surface's reading zone) and the iframe flow insets; re-applied on resize.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const applyZoneProperties = () => {
      const lineHeight = parseFloat(getComputedStyle(container).lineHeight) || 24;
      const zoneLines = settings.flowZoneLines ?? FLOW_ZONE_LINES_DEFAULT;
      const viewportHeight = getFlowViewportHeightPx() || container.clientHeight;
      if (viewportHeight <= 0) return;
      const zoneHeightFrac = (lineHeight * zoneLines) / viewportHeight;
      const zoneTop = FLOW_ZONE_INITIAL_TOP;
      const zoneBottom = Math.min(zoneTop + zoneHeightFrac, 0.95);
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
    getFlowViewportHeightPx,
    settings.flowZoneLines,
    setFlowInsetsForRenderedDocs,
    invalidateWordPositionIndex,
    scheduleWordPositionIndexRebuild,
  ]);

  // Reflow text when the container resizes (window maximize/restore/drag)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      const view = viewRef.current;
      if (!view?.renderer) return;
      const h = container.clientHeight;
      view.renderer.setAttribute("max-block-size", `${h - FOLIATE_RENDERER_HEIGHT_MARGIN_PX}px`);
      view.renderer.setAttribute("max-column-count", getFoliateMaxColumnCount(true, container.clientWidth));
      invalidateWordPositionIndex();
      scheduleWordPositionIndexRebuild("container-resize");
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [invalidateWordPositionIndex, scheduleWordPositionIndexRebuild]);

  // Narration highlight: the spoken word gets the narrate cursor (no motion; scroll-follow moves).
  useEffect(() => {
    if (narrationWordIndex == null) return;
    applyVisualHighlightByIndex(narrationWordIndex, "narrate", false);
  }, [applyVisualHighlightByIndex, narrationWordIndex]);

  // Narrate scroll follow — keep the narrated word in view as narration advances. On the scrolled
  // surface every word reports as "visible" from the iframe's perspective, so scrollToAnchor is called
  // unconditionally (throttled). A displacement beyond 0.3 × viewport from where scroll-follow last
  // placed the view means the user scrolled away (any input method).
  useEffect(() => {
    if (narrationWordIndex == null) return;
    const view = viewRef.current;
    if (!view?.renderer || !viewApiRef.current) return;

    // If the user has manually browsed away, don't snap back — the jump-back button handles it.
    if (userBrowsingRef.current) return;

    const currentPos = view.renderer.containerPosition;
    if (lastScrollFollowPosRef.current != null && typeof currentPos === "number") {
      const displacement = Math.abs(currentPos - lastScrollFollowPosRef.current);
      const viewportHeight = containerRef.current?.clientHeight ?? 400;
      if (displacement > viewportHeight * NARRATE_DISPLACEMENT_VIEWPORT_FRACTION) {
        markUserBrowsingAway();
        return;
      }
    }

    const state = viewApiRef.current.resolveWordState(narrationWordIndex);
    if (!state.found && !narratePageTurnCooldownRef.current) {
      // Word is not in the current section's DOM — advance to the next section.
      narratePageTurnCooldownRef.current = true;
      view.renderer.next();
      narratePageTurnCooldownTimerRef.current = setTimeout(() => {
        narratePageTurnCooldownTimerRef.current = null;
        narratePageTurnCooldownRef.current = false;
      }, NARRATE_PAGE_TURN_COOLDOWN_MS);
    } else if (state.found && state.span && state.doc) {
      // Throttle scrollToAnchor calls to avoid jitter.
      const now = Date.now();
      if (now - narrateScrollThrottleRef.current < NARRATE_SCROLL_FOLLOW_THROTTLE_MS) return;
      narrateScrollThrottleRef.current = now;
      // scrollToAnchor is async — await it before applying the zone offset.
      const zoneOffset = getFlowFollowOffsetPx();
      const { doc: stateDoc, span: stateSpan } = state;
      (async () => {
        try {
          // Pre-flight: the user may have scrolled in the micro-task gap.
          if (userBrowsingRef.current) return;
          const range = stateDoc.createRange();
          range.selectNodeContents(stateSpan);
          await view.renderer.scrollToAnchor?.(range);
          // Post-flight: the user may have scrolled while scrollToAnchor resolved.
          if (userBrowsingRef.current) return;
          if (zoneOffset > 0) {
            const renderer = viewRef.current?.renderer;
            if (renderer && typeof renderer.containerPosition === "number") {
              renderer.containerPosition = Math.max(0, renderer.containerPosition - zoneOffset);
            }
          }
          // Record the final position for displacement detection on the next tick.
          const finalPos = viewRef.current?.renderer?.containerPosition;
          if (typeof finalPos === "number") lastScrollFollowPosRef.current = finalPos;
        } catch { /* Document may be closing during navigation — non-critical */ }
      })();
    }
  }, [narrationWordIndex, viewApiRef, getFlowFollowOffsetPx, markUserBrowsingAway]);

  // Keyboard (NARR-FIX-1): audio drives the reading position, but the user can still browse away
  // manually. Page navigation keys set the browse-away flag AND navigate the renderer so the user can
  // peek ahead/behind; jump-back returns to the active reading position.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const view = viewRef.current;
      if (!view?.renderer) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === "ArrowLeft" || e.key === "PageUp") {
        markUserBrowsingAway();
        // Navigate the Foliate renderer so the user sees different content.
        // The iframe's native handler won't see this window-level event.
        if (e.key === "ArrowRight" || e.key === "PageDown") {
          view.renderer.next();
        } else {
          view.renderer.prev();
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [markUserBrowsingAway]);

  // Manual scroll detection — mark the user as browsing away when they scroll the scrolled surface.
  // The Foliate paginator inside shadow DOM may stopPropagation() on wheel events before they reach
  // the React container, so listen on window (capture phase).
  useEffect(() => {
    const handleWheel = () => {
      markUserBrowsingAway();
    };

    window.addEventListener("wheel", handleWheel, { passive: true, capture: true });
    return () => window.removeEventListener("wheel", handleWheel, { capture: true });
  }, [markUserBrowsingAway]);

  return (
    <div
      className={`rm-narrate-view${chunkReadingVisualState?.mode === "narrate" ? " rm-narrate-view--chunk-visual" : ""}`}
      ref={containerRef}
    >
      {/* Jump back to persistent last-read word — shown when user has browsed away */}
      {showJumpBackToAnchor && (
        <button
          className="rm-narrate-recenter-btn"
          onClick={onJumpBackToAnchor}
          aria-label="Jump back to persistent last-read word"
          title="Jump back to persistent last-read word"
        >
          Jump back
        </button>
      )}
      {loading && <div className="rm-narrate-loading">Loading book...</div>}
      {error && <div className="rm-narrate-error">{error}</div>}
    </div>
  );
}
