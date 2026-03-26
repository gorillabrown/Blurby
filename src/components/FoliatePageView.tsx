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
  onWordClick?: (cfi: string, word: string, sectionIndex?: number, wordOffsetInSection?: number) => void;
  onLoad?: () => void;
  initialCfi?: string | null;
  focusTextSize?: number;
  /** Ref for imperative access (getWords, goTo, next, prev) */
  viewApiRef?: React.MutableRefObject<FoliateViewAPI | null>;
  /** Whether a reading mode (flow/narration) is actively advancing words */
  isReading?: boolean;
  /** Callback to scroll foliate to where the current highlight is */
  onJumpToHighlight?: () => void;
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
  try {
    // Try caretRangeFromPoint first (works in standard HTML)
    const caretRange = (doc as any).caretRangeFromPoint?.(x, y);
    let node: Node | null = null;
    let offset = 0;

    if (caretRange) {
      if (caretRange instanceof Range) {
        node = caretRange.startContainer;
        offset = caretRange.startOffset;
      } else if (caretRange.offsetNode) {
        node = caretRange.offsetNode;
        offset = caretRange.offset;
      }
    }

    // If we got an element node (common in XHTML/epub iframes), walk into its text children
    if (node && node.nodeType === Node.ELEMENT_NODE) {
      // Find the text node child closest to the click point
      const walker = doc.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      let best: Text | null = null;
      let textNode: Text | null;
      while ((textNode = walker.nextNode() as Text | null)) {
        if (textNode.textContent && textNode.textContent.trim()) {
          best = textNode;
          break; // Take the first text node (good enough for word detection)
        }
      }
      if (best) {
        node = best;
        // Estimate offset within the text node based on click x position
        const range = doc.createRange();
        range.selectNodeContents(best);
        const rects = range.getClientRects();
        if (rects.length > 0) {
          // Simple approach: proportion of x within the text's bounding rect
          const rect = rects[0];
          const textLen = best.textContent?.length || 1;
          offset = Math.max(0, Math.min(textLen, Math.round((x - rect.left) / rect.width * textLen)));
        } else {
          offset = 0;
        }
      }
    }

    if (!node || node.nodeType !== Node.TEXT_NODE) return null;
    const text = node.textContent || "";
    if (offset > text.length) offset = text.length;

    // Find word boundaries around the offset
    let start = offset;
    let end = offset;
    while (start > 0 && /[\w'\u2019\u00C0-\u024F-]/.test(text[start - 1])) start--;
    while (end < text.length && /[\w'\u2019\u00C0-\u024F-]/.test(text[end])) end++;

    if (start === end) return null;
    const word = text.slice(start, end);

    const wordRange = doc.createRange();
    wordRange.setStart(node, start);
    wordRange.setEnd(node, end);
    return { word, range: wordRange };
  } catch {
    return null;
  }
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
  isReading,
  onJumpToHighlight,
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
        console.log("[Foliate] View element mounted, attaching listeners before open...");

        // Attach load listener BEFORE open() — events may fire during init
        const onSectionLoad = (e: any) => {
          const { doc, index } = e.detail;
          console.log("[Foliate] Section loaded:", index, "doc body:", doc?.body?.tagName, "children:", doc?.body?.childElementCount);
          // Inject Blurby theme styles into the EPUB document
          injectStyles(doc, settings, focusTextSize);
          // Word detection: single click highlights word with a <mark> overlay
          doc.addEventListener("click", (ce: MouseEvent) => {
            if ((ce.target as HTMLElement)?.closest?.("a[href]")) return;

            // Remove any previous highlight marks in ALL loaded docs
            const v = viewRef.current;
            for (const { doc: d } of v?.renderer?.getContents?.() ?? []) {
              d.querySelectorAll("mark.blurby-word-highlight").forEach((m: Element) => {
                const parent = m.parentNode;
                if (parent) {
                  while (m.firstChild) parent.insertBefore(m.firstChild, m);
                  parent.removeChild(m);
                  parent.normalize(); // merge adjacent text nodes
                }
              });
            }

            // Try to select word at click point
            const result = getWordAtPoint(doc, ce.clientX, ce.clientY);
            if (result) {
              // Wrap the word in a visible <mark> element
              try {
                const mark = doc.createElement("mark");
                mark.className = "blurby-word-highlight";
                mark.style.cssText = `background: var(--blurby-accent, rgba(230,57,70,0.25)); border-radius: 2px; padding: 0 1px;`;
                result.range.surroundContents(mark);
              } catch { /* range crosses element boundary — fall back to selection */
                const sel = doc.getSelection();
                if (sel) { sel.removeAllRanges(); sel.addRange(result.range); }
              }

              if (v) {
                const contents = v.renderer.getContents?.() ?? [];
                const match = contents.find((c: any) => c.doc === doc);
                if (match) {
                  const cfi = v.getCFI(match.index, result.range);
                  // Count word offset: walk all text nodes before the click to count words
                  let wordOffset = 0;
                  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
                  let tn: Text | null;
                  outer: while ((tn = walker.nextNode() as Text | null)) {
                    const words = (tn.textContent || "").split(/\s+/).filter(Boolean);
                    if (tn === result.range.startContainer) {
                      // Count words before the offset in this text node
                      const beforeText = (tn.textContent || "").slice(0, result.range.startOffset);
                      wordOffset += beforeText.split(/\s+/).filter(Boolean).length;
                      break outer;
                    }
                    wordOffset += words.length;
                  }
                  onWordClick?.(cfi, result.word, match.index, wordOffset);
                }
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
            const v = viewRef.current;
            if (v) {
              const contents = v.renderer.getContents?.() ?? [];
              const match = contents.find((c: any) => c.doc === doc);
              if (match) {
                const cfi = v.getCFI(match.index, range);
                onWordClick?.(cfi, word);
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
              // Remove previous highlight
              if (currentHighlight?.parentNode) {
                const parent = currentHighlight.parentNode;
                while (currentHighlight.firstChild) parent.insertBefore(currentHighlight.firstChild, currentHighlight);
                parent.removeChild(currentHighlight);
                currentHighlight = null;
              }
              // Wrap word in a visible <mark> element
              try {
                const doc = range.startContainer.ownerDocument;
                if (!doc) return;
                const mark = doc.createElement("mark");
                mark.style.cssText = "background: rgba(var(--accent-rgb, 208,71,22), 0.3); border-radius: 2px; padding: 0 1px;";
                mark.className = "blurby-word-hl";
                range.surroundContents(mark);
                currentHighlight = mark;
                // Scroll into view if needed
                mark.scrollIntoView?.({ block: "nearest", inline: "nearest" });
              } catch {
                // surroundContents fails across element boundaries — use selection fallback
                try {
                  const doc = range.startContainer.ownerDocument;
                  if (doc) {
                    const sel = doc.getSelection();
                    if (sel) { sel.removeAllRanges(); sel.addRange(range); }
                  }
                } catch { /* completely stale range */ }
              }
            },
            clearHighlight: () => {
              if (currentHighlight?.parentNode) {
                const parent = currentHighlight.parentNode;
                while (currentHighlight.firstChild) parent.insertBefore(currentHighlight.firstChild, currentHighlight);
                parent.removeChild(currentHighlight);
                currentHighlight = null;
              }
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
    .blurby-word-hl { background: ${accent}4D !important; border-radius: 2px; padding: 0 1px; }
  `;
  doc.head.appendChild(style);
}
