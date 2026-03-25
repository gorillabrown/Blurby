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

const api = (window as any).electronAPI;

/** Extract all words from a foliate view's current visible sections.
 *  Returns word strings and their DOM Ranges for highlighting. */
function extractWordsFromView(view: any): Array<{ word: string; range: Range; sectionIndex: number }> {
  const words: Array<{ word: string; range: Range; sectionIndex: number }> = [];
  if (!view?.renderer?.getContents) return words;

  for (const { doc, index } of view.renderer.getContents()) {
    if (!doc?.body) continue;
    const segmenter = new (Intl as any).Segmenter("en", { granularity: "word" });
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node: Node) => {
        const parent = node.parentElement;
        if (parent && (parent.tagName === "SCRIPT" || parent.tagName === "STYLE")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      const text = node.textContent || "";
      for (const { segment, isWordLike, index: segIdx } of segmenter.segment(text)) {
        if (!isWordLike) continue;
        const range = doc.createRange();
        range.setStart(node, segIdx);
        range.setEnd(node, segIdx + segment.length);
        words.push({ word: segment, range, sectionIndex: index });
      }
    }
  }
  return words;
}

interface FoliatePageViewProps {
  activeDoc: BlurbyDoc & { content?: string };
  settings: BlurbySettings;
  onRelocate?: (detail: { cfi: string; fraction: number; tocItem?: any; pageItem?: any }) => void;
  onTocReady?: (toc: any[]) => void;
  onWordClick?: (cfi: string, word: string) => void;
  onLoad?: () => void;
  initialCfi?: string | null;
  focusTextSize?: number;
  /** Ref for imperative access (getWords, goTo, next, prev) */
  viewApiRef?: React.MutableRefObject<FoliateViewAPI | null>;
}

export interface FoliateViewAPI {
  getWords: () => Array<{ word: string; range: Range; sectionIndex: number }>;
  goTo: (target: string | number) => Promise<any>;
  goToFraction: (frac: number) => Promise<void>;
  next: () => void;
  prev: () => void;
  highlightWord: (range: Range, sectionIndex: number) => void;
  clearHighlight: () => void;
  getView: () => any;
}

/** Expand a caret position to the full word boundary, return the word text and Range. */
function getWordAtPoint(doc: Document, x: number, y: number): { word: string; range: Range } | null {
  // caretRangeFromPoint gives us a collapsed Range at the click point
  const caretRange = (doc as any).caretRangeFromPoint?.(x, y) || (doc as any).caretPositionFromPoint?.(x, y);
  if (!caretRange) return null;

  let range: Range;
  if (caretRange instanceof Range) {
    range = caretRange;
  } else {
    // CaretPosition (Firefox) → convert to Range
    range = doc.createRange();
    range.setStart(caretRange.offsetNode, caretRange.offset);
    range.collapse(true);
  }

  const node = range.startContainer;
  if (node.nodeType !== Node.TEXT_NODE) return null;
  const text = node.textContent || "";
  const offset = range.startOffset;

  // Find word boundaries around the offset
  let start = offset;
  let end = offset;
  while (start > 0 && /\w/.test(text[start - 1])) start--;
  while (end < text.length && /\w/.test(text[end])) end++;

  if (start === end) return null;
  const word = text.slice(start, end);

  const wordRange = doc.createRange();
  wordRange.setStart(node, start);
  wordRange.setEnd(node, end);
  return { word, range: wordRange };
}

export default function FoliatePageView({
  activeDoc,
  settings,
  onRelocate,
  onTocReady,
  onWordClick,
  onLoad,
  initialCfi,
  focusTextSize,
  viewApiRef,
}: FoliatePageViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const foliateHostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.log("[Foliate] Importing foliate-js...");
        await import("foliate-js/view.js");
        console.log("[Foliate] Custom element registered:", !!customElements.get("foliate-view"));

        // Read file as arraybuffer via IPC
        console.log("[Foliate] Reading file:", activeDoc.filepath);
        const buffer: ArrayBuffer = await api.readFileBuffer(activeDoc.filepath);
        if (cancelled) return;
        console.log("[Foliate] Buffer size:", buffer?.byteLength);

        if (!buffer) {
          setError("Could not read EPUB file");
          setLoading(false);
          return;
        }

        // Create File object from buffer
        const fileName = (activeDoc.filepath || "book.epub").split(/[\\/]/).pop() || "book.epub";
        const file = new File([buffer], fileName, { type: "application/epub+zip" });
        console.log("[Foliate] File created:", file.name, file.size, "bytes");

        // Create and mount the foliate-view element inside the non-React host
        const view = document.createElement("foliate-view") as any;
        host.innerHTML = "";
        host.appendChild(view);
        viewRef.current = view;
        console.log("[Foliate] View element mounted, opening book...");

        // Configure renderer attributes for pagination
        view.addEventListener("load", (e: any) => {
          const { doc } = e.detail;
          // Inject Blurby theme styles into the EPUB document
          injectStyles(doc, settings, focusTextSize);
          // Word click detection — highlight clicked word and fire callback
          doc.addEventListener("click", (ce: MouseEvent) => {
            const result = getWordAtPoint(doc, ce.clientX, ce.clientY);
            if (!result) return;

            // Clear previous selection highlight
            const prevHighlight = doc.querySelector(".blurby-word-highlight");
            if (prevHighlight) prevHighlight.remove();

            // Create highlight span around the word
            const highlight = doc.createElement("span");
            highlight.className = "blurby-word-highlight";
            highlight.style.cssText = `
              background: var(--accent, #D04716)33;
              border-radius: 2px;
              padding: 1px 0;
            `;
            result.range.surroundContents(highlight);

            // Get CFI for the clicked position
            const v = viewRef.current;
            if (v) {
              const contents = v.renderer.getContents?.() ?? [];
              const match = contents.find((c: any) => c.doc === doc);
              if (match) {
                const cfi = v.getCFI(match.index, result.range);
                onWordClick?.(cfi, result.word);
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
          onLoad?.();
        });

        view.addEventListener("relocate", (e: any) => {
          if (cancelled) return;
          const { cfi, tocItem, pageItem } = e.detail;
          const fraction = e.detail.fraction ?? 0;
          onRelocate?.({ cfi, fraction, tocItem, pageItem });
        });

        // Open the book
        await view.open(file);
        if (cancelled) return;
        console.log("[Foliate] Book opened. Sections:", view.book?.sections?.length, "TOC items:", view.book?.toc?.length);

        // Set renderer attributes
        const scale = (focusTextSize || 100) / 100;
        const fontSize = Math.round(18 * scale);
        view.renderer.setAttribute("flow", "paginated");
        view.renderer.setAttribute("margin", "40px");
        view.renderer.setAttribute("gap", "5%");
        view.renderer.setAttribute("max-inline-size", "720px");
        view.renderer.setAttribute("max-block-size", `${container.clientHeight - 20}px`);
        view.renderer.setAttribute("max-column-count", container.clientWidth >= 1040 ? "2" : "1");

        // Provide TOC
        if (view.book?.toc) {
          onTocReady?.(view.book.toc);
        }

        // Navigate to last position or start
        await view.init({
          lastLocation: initialCfi || null,
          showTextStart: !initialCfi,
        });

        // Populate imperative API ref
        if (viewApiRef) {
          let currentHighlight: HTMLElement | null = null;
          viewApiRef.current = {
            getWords: () => extractWordsFromView(view),
            goTo: (target) => view.goTo(target),
            goToFraction: (frac) => view.goToFraction(frac),
            next: () => view.renderer.next(),
            prev: () => view.renderer.prev(),
            highlightWord: (range, _sectionIndex) => {
              // Clear previous
              if (currentHighlight?.parentNode) {
                const parent = currentHighlight.parentNode;
                while (currentHighlight.firstChild) parent.insertBefore(currentHighlight.firstChild, currentHighlight);
                parent.removeChild(currentHighlight);
              }
              currentHighlight = null;
              // Wrap new word
              try {
                const span = range.startContainer.ownerDocument!.createElement("span");
                span.className = "blurby-word-highlight";
                span.style.cssText = "background: var(--accent, #D04716)33; border-radius: 2px; padding: 1px 0;";
                range.surroundContents(span);
                currentHighlight = span;
              } catch { /* range may cross element boundaries */ }
            },
            clearHighlight: () => {
              if (currentHighlight?.parentNode) {
                const parent = currentHighlight.parentNode;
                while (currentHighlight.firstChild) parent.insertBefore(currentHighlight.firstChild, currentHighlight);
                parent.removeChild(currentHighlight);
              }
              currentHighlight = null;
            },
            getView: () => view,
          };
        }

        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          console.error("FoliatePageView load error:", err);
          setError(err.message || "Failed to load EPUB");
          setLoading(false);
        }
      }
    };

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

  // Update renderer on settings changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view?.renderer) return;

    const scale = (focusTextSize || 100) / 100;
    const container = containerRef.current;
    if (!container) return;

    view.renderer.setAttribute("max-column-count", container.clientWidth >= 1040 ? "2" : "1");
    view.renderer.setAttribute("max-block-size", `${container.clientHeight - 20}px`);

    // Re-inject styles on settings change
    for (const { doc } of view.renderer.getContents?.() ?? []) {
      injectStyles(doc, settings, focusTextSize);
    }
  }, [settings.theme, settings.fontFamily, focusTextSize, settings.layoutSpacing]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const view = viewRef.current;
      if (!view?.renderer) return;

      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        view.renderer.next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
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
    <div className="foliate-page-view" ref={containerRef} style={{ flex: 1, overflow: "hidden", position: "relative" }}>
      {/* Page turn buttons overlaid on left/right edges — z-index above foliate host */}
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
      {loading && <div className="foliate-loading">Loading book...</div>}
      {error && <div className="foliate-error">{error}</div>}
    </div>
  );
}

/** Inject Blurby theme CSS into an EPUB document (inside the foliate iframe). */
function injectStyles(doc: Document, settings: BlurbySettings, focusTextSize?: number) {
  if (!doc?.head) return;

  const existing = doc.getElementById("blurby-theme");
  if (existing) existing.remove();

  const scale = (focusTextSize || 100) / 100;
  const fontSize = Math.round(18 * scale);
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
  `;
  doc.head.appendChild(style);
}
