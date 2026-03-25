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

interface FoliatePageViewProps {
  activeDoc: BlurbyDoc & { content?: string };
  settings: BlurbySettings;
  onRelocate?: (detail: { cfi: string; fraction: number; tocItem?: any; pageItem?: any }) => void;
  onTocReady?: (toc: any[]) => void;
  onLoad?: () => void;
  initialCfi?: string | null;
  focusTextSize?: number;
}

export default function FoliatePageView({
  activeDoc,
  settings,
  onRelocate,
  onTocReady,
  onLoad,
  initialCfi,
  focusTextSize,
}: FoliatePageViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load EPUB via foliate-js
  useEffect(() => {
    if (!activeDoc?.filepath || !containerRef.current) return;

    let cancelled = false;
    const container = containerRef.current;

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

        // Create and mount the foliate-view element
        const view = document.createElement("foliate-view") as any;
        container.innerHTML = "";
        container.appendChild(view);
        viewRef.current = view;
        console.log("[Foliate] View element mounted, opening book...");

        // Configure renderer attributes for pagination
        view.addEventListener("load", (e: any) => {
          const { doc } = e.detail;
          // Inject Blurby theme styles into the EPUB document
          injectStyles(doc, settings, focusTextSize);
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
      container.innerHTML = "";
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
