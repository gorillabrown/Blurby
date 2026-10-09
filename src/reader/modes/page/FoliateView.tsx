/**
 * Page's private copy of FoliatePageView (READER-MODE-SEPARATION-2 design §B.5, paginated variant).
 *
 * Owns its own non-React host div, <foliate-view> element, word cache, WordPositionIndex, timers and
 * listeners; `view.close()` and `host.innerHTML = ""` run on unmount. foliate is reached only through
 * `import("foliate-js/view.js")`, and every section document only through `view.renderer.getContents()`
 * (LL-032: no iframe querySelectorAll). Book bytes come from the document port; diagnostics go to the
 * diagnostics port. Removed from the shared original because Page never reaches them: the flow/narrate
 * props and effects, the scrolled-surface scroll container, chunk visuals and the dead overlay cursor.
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
  FOLIATE_RENDERER_HEIGHT_MARGIN_PX,
  FOLIATE_MARGIN_PX,
  FOLIATE_MAX_INLINE_SIZE_PX,
  FOLIATE_SECTION_READY_TIMEOUT_MS,
} from "../../../constants";
import { injectStyles } from "./helpers/foliateStyles";
import { getFoliateMaxColumnCount } from "./helpers/foliateLayout";
import { resolveFoliateWordHighlightClass } from "./helpers/foliateWordHighlight";
import {
  extractWordsFromView,
  queryWordSpans,
  parseWordIndexAttribute,
  type FoliateWord,
} from "./helpers/foliateHelpers";
import { WordPositionIndex, type WordPositionEntry } from "./helpers/wordPositionIndex";
import { unwrapWordSpans, wrapWordsInSpans } from "./helpers/foliateWordWrapping";

const PAGE_HIGHLIGHT_MODE = "page";

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

export interface PageFoliateHighlightOptions {
  allowMotion?: boolean;
  forceMotion?: boolean;
}

export interface PageWordState {
  found: boolean;
  visible: boolean;
  span: HTMLElement | null;
  spans: HTMLElement[];
  doc: Document | null;
  position: WordPositionEntry | null;
}

/** The subset of the legacy FoliateViewAPI that Page uses. */
export interface PageFoliateViewAPI {
  getWords: () => FoliateWord[];
  goTo: (target: string | number) => Promise<unknown>;
  next: () => void;
  prev: () => void;
  /** Highlight a word by global index. Returns true if found, false if span not in DOM. */
  highlightWordByIndex: (wordIndex: number, styleHint?: "flow" | "narrate", options?: PageFoliateHighlightOptions) => boolean;
  clearHighlight: () => void;
  resolveWordState: (wordIndex: number) => PageWordState;
  getSectionForWordIndex: (wordIndex: number) => number | null;
  findFirstVisibleWordIndex: () => number;
  isUserBrowsing: () => boolean;
  goToSection: (sectionIndex: number) => Promise<void>;
  waitForSectionReady: (sectionIndex?: number | null, timeoutMs?: number) => Promise<number | null>;
  applySoftHighlight: (wordIndex: number) => boolean;
  clearSoftHighlight: () => void;
  clearUserBrowsing: () => void;
}

export interface PageFoliateViewProps {
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
  /** Legacy onWordsReextracted (after each full re-extraction). */
  onWordsReextracted: () => void;
  viewApiRef: MutableRefObject<PageFoliateViewAPI | null>;
  showJumpBackToAnchor: boolean;
  onJumpBackToAnchor: () => void;
  onUserBrowseAway: () => void;
  highlightedWordIndex: number;
  bookWordSections?: readonly Readonly<SectionBoundary>[];
  renderVersion: number;
  getCanonicalSectionWords?: (sectionIndex: number) => string[] | undefined;
}

export default function PageFoliateView({
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
  bookWordSections,
  renderVersion,
  getCanonicalSectionWords,
}: PageFoliateViewProps) {
  // injectStyles only reads settings; the frozen snapshot is passed through its legacy parameter type.
  const settings = frozenSettings as BlurbySettings;
  const containerRef = useRef<HTMLDivElement>(null);
  const foliateHostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<any>(null);
  const foliateWordsRef = useRef<FoliateWord[]>([]);
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
    styleHint?: "flow" | "narrate",
    allowMotion = true,
    forceMotion = false,
  ): boolean => {
    const view = viewRef.current;
    if (!view?.renderer || !viewApiRef.current) return false;

    const state = viewApiRef.current.resolveWordState(wordIndex);
    const contents = view.renderer?.getContents?.() ?? [];
    const highlightClass = resolveFoliateWordHighlightClass(PAGE_HIGHLIGHT_MODE, styleHint);

    clearVisualWordClasses(contents);

    if (!state.found || !state.span) {
      return false;
    }

    const highlightTargets = state.spans.length > 0 ? state.spans : [state.span];
    highlightTargets.forEach((el: Element) => {
      el.classList.add(highlightClass);
    });

    if (allowMotion && state.doc && !userBrowsingRef.current && (!state.visible || forceMotion)) {
      try {
        const range = state.doc.createRange();
        range.selectNodeContents(state.span);
        view.renderer.scrollToAnchor?.(range);
      } catch {
        // Safe to ignore.
      }
    }

    // Auto-clear the browsed-away flag when the highlighted word becomes visible again
    // (paginated visibility detection is meaningful in Page).
    if (userBrowsingRef.current && state.visible) {
      userBrowsingRef.current = false;
    }

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

    (async () => {
      try {
        await view.renderer.scrollToAnchor(range);
      } catch {
        // The section can unload while a click/selection scroll is in flight.
      }
    })();

    return true;
  }, []);
  const centerResolvedTokenInReadingWindowRef = useRef(centerResolvedTokenInReadingWindow);
  centerResolvedTokenInReadingWindowRef.current = centerResolvedTokenInReadingWindow;

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
    foliateHostRef.current.className = "rm-page-host";
    foliateHostRef.current.style.cssText = "width:100%;height:100%;position:absolute;inset:0;z-index:0;";
    const host = foliateHostRef.current;

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
            flowLeadingInsetPx: 0,
            flowTrailingInsetPx: 0,
          });
          invalidateWordPositionIndex();

          // Extract words and wrap in spans (Page: full re-extraction on every section load)
          const v2 = viewRef.current;
          if (v2) {
            const extracted = extractWordsFromView(v2);
            foliateWordsRef.current = extracted.words;
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

          lastLoadedSectionIndexRef.current = index;
          scheduleWordPositionIndexRebuild(`section-load:${index}`, 0);

          // Delegated click handler on the injected word spans
          doc.body.addEventListener("click", (ev: MouseEvent) => {
            const target = (ev.target as HTMLElement)?.closest?.("[data-word-index]");
            if (!target) return;
            if ((ev.target as HTMLElement)?.closest?.("a[href]")) return;

            const resolvedToken = resolveRenderedToken(doc.body, target);
            if (!resolvedToken) return;

            const clickHighlightClass = resolveFoliateWordHighlightClass(PAGE_HIGHLIGHT_MODE);
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
                const selHighlightClass = resolveFoliateWordHighlightClass(PAGE_HIGHLIGHT_MODE);
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

        // Set renderer attributes (Page is always paginated)
        view.renderer.setAttribute("flow", "paginated");
        view.renderer.setAttribute("margin", `${FOLIATE_MARGIN_PX}px`);
        // NOTE: Do NOT set "gap" — foliate-js interprets it as a percentage (default 7%).
        view.renderer.setAttribute("max-block-size", `${container.clientHeight - FOLIATE_RENDERER_HEIGHT_MARGIN_PX}px`);
        view.renderer.setAttribute("max-inline-size", `${FOLIATE_MAX_INLINE_SIZE_PX}px`);
        view.renderer.setAttribute("max-column-count", getFoliateMaxColumnCount(false, container.clientWidth));

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
        const resolveWordState = (wordIndex: number): PageWordState => {
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
            return extracted.words;
          },
          goTo: (target) => view.goTo(target),
          next: () => view.renderer.next(),
          prev: () => view.renderer.prev(),
          highlightWordByIndex: (wordIndex, styleHint, options) =>
            applyVisualHighlightByIndex(wordIndex, styleHint, options?.allowMotion ?? true, options?.forceMotion ?? false),
          clearHighlight: () => {
            clearVisualWordClasses(view.renderer?.getContents?.() ?? []);
          },
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
          applySoftHighlight: (wordIndex: number): boolean => applySoftHighlight(wordIndex),
          clearSoftHighlight: () => clearSoftHighlight(),
          clearUserBrowsing: () => {
            userBrowsingRef.current = false;
          },
        };

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
      viewApiRef.current = null;
      if (viewRef.current) {
        // S1 G6: every section load makes foliate's paginator queue a frame callback (setStyles →
        // requestAnimationFrame → this.#view.docBackground), and its destroy() nulls #view without
        // cancelling it. B0 never closed its view at a mode switch; this view closes at every switch, so the
        // close waits one frame. Frame callbacks run in registration order, so each one the paginator queued
        // before this cleanup still sees a live #view (on the host detached below) before close() runs.
        const closing = viewRef.current;
        viewRef.current = null;
        requestAnimationFrame(() => closing.close?.());
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

    view.renderer.setAttribute("max-column-count", getFoliateMaxColumnCount(false, container.clientWidth));
    view.renderer.setAttribute("max-block-size", `${container.clientHeight - FOLIATE_RENDERER_HEIGHT_MARGIN_PX}px`);

    // Re-inject styles on settings change
    for (const { doc } of view.renderer.getContents?.() ?? []) {
      injectStyles(doc, settings, focusTextSize, {
        flowLeadingInsetPx: 0,
        flowTrailingInsetPx: 0,
      });
    }
    invalidateWordPositionIndex();
    scheduleWordPositionIndexRebuild("font-or-layout-change");
  }, [
    settings.theme,
    settings.fontFamily,
    focusTextSize,
    settings.layoutSpacing,
    invalidateWordPositionIndex,
    scheduleWordPositionIndexRebuild,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reflow text when the container resizes (window maximize/restore/drag)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      const view = viewRef.current;
      if (!view?.renderer) return;
      const h = container.clientHeight;
      view.renderer.setAttribute("max-block-size", `${h - FOLIATE_RENDERER_HEIGHT_MARGIN_PX}px`);
      view.renderer.setAttribute("max-column-count", getFoliateMaxColumnCount(false, container.clientWidth));
      invalidateWordPositionIndex();
      scheduleWordPositionIndexRebuild("container-resize");
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [invalidateWordPositionIndex, scheduleWordPositionIndexRebuild]);

  // Page highlight: the published highlight, without motion
  useEffect(() => {
    if (highlightedWordIndex == null) return;
    applyVisualHighlightByIndex(highlightedWordIndex, undefined, false);
  }, [applyVisualHighlightByIndex, highlightedWordIndex]);

  // Keyboard page turn
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const view = viewRef.current;
      if (!view?.renderer) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        markUserBrowsingAway();
        view.renderer.next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        markUserBrowsingAway();
        view.renderer.prev();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [markUserBrowsingAway]);

  const goNext = useCallback(() => {
    markUserBrowsingAway();
    viewRef.current?.renderer?.next();
  }, [markUserBrowsingAway]);
  const goPrev = useCallback(() => {
    markUserBrowsingAway();
    viewRef.current?.renderer?.prev();
  }, [markUserBrowsingAway]);

  return (
    <div className="rm-page-view" ref={containerRef}>
      <button
        className="rm-page-nav-btn rm-page-nav-btn--left"
        onClick={goPrev}
        aria-label="Previous page"
      >&#x2039;</button>
      <button
        className="rm-page-nav-btn rm-page-nav-btn--right"
        onClick={goNext}
        aria-label="Next page"
      >&#x203A;</button>
      {/* Jump back to persistent last-read word — shown when user has browsed away */}
      {showJumpBackToAnchor && (
        <button
          className="rm-page-recenter-btn"
          onClick={onJumpBackToAnchor}
          aria-label="Jump back to persistent last-read word"
          title="Jump back to persistent last-read word"
        >
          Jump back
        </button>
      )}
      {loading && <div className="rm-page-loading">Loading book...</div>}
      {error && <div className="rm-page-error">{error}</div>}
    </div>
  );
}
