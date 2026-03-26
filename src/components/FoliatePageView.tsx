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
import { segmentWords } from "../utils/segmentWords";
import { getOverlayPosition } from "../utils/getOverlayPosition";

const api = (window as any).electronAPI;

/** Word entry with optional Range — Range is null when the section is unloaded. */
export interface FoliateWord {
  word: string;
  range: Range | null;
  sectionIndex: number;
}

/** Safely perform an operation on a Range, returning fallback if the Range is stale or null. */
function safeRangeOp<T>(range: Range | null, fn: (r: Range) => T, fallback: T): T {
  if (!range || !range.startContainer.isConnected) return fallback;
  try { return fn(range); } catch { return fallback; }
}

/** Intl.Segmenter instance shared within this module for inline word detection. */
const wordSegmenter = new Intl.Segmenter(undefined, { granularity: "word" });

/** Extract all words from a foliate view's currently loaded sections.
 *  Returns word strings and their DOM Ranges for highlighting. */
const BLOCK_TAGS = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "LI", "TD", "SECTION", "ARTICLE"]);

function getBlockParent(node: Node): Element | null {
  let el = node.parentElement;
  while (el && !BLOCK_TAGS.has(el.tagName)) el = el.parentElement;
  return el;
}

function extractWordsFromView(view: any): { words: FoliateWord[]; paragraphBreaks: Set<number> } {
  const words: FoliateWord[] = [];
  const paragraphBreaks = new Set<number>();
  if (!view?.renderer?.getContents) return { words, paragraphBreaks };

  let prevBlock: Element | null = null;

  for (const { doc, index } of view.renderer.getContents()) {
    if (!doc?.body) continue;
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
      const block = getBlockParent(node);
      const segments = Array.from(wordSegmenter.segment(text));
      for (let si = 0; si < segments.length; si++) {
        const { segment, isWordLike, index: segIdx } = segments[si];
        if (!isWordLike) continue;
        // Include trailing punctuation (e.g., "world" + "." → "world.")
        // Intl.Segmenter separates punctuation, but TTS rhythm needs it attached
        let wordWithPunct = segment;
        let endOffset = segIdx + segment.length;
        // Scan forward for trailing punctuation segments
        for (let pi = si + 1; pi < segments.length; pi++) {
          const next = segments[pi];
          if (next.isWordLike) break; // Hit next word — stop
          if (/^[.!?,;:'"»)\]\u201D\u2019\u2026]+$/.test(next.segment)) {
            wordWithPunct += next.segment;
            endOffset = next.index + next.segment.length;
          } else {
            break; // Whitespace or other — stop
          }
        }
        // Detect paragraph boundary: block parent changed from previous word
        if (prevBlock && block && block !== prevBlock && words.length > 0) {
          paragraphBreaks.add(words.length - 1); // Last word of previous block
        }
        prevBlock = block;
        const range = doc.createRange();
        range.setStart(node, segIdx);
        range.setEnd(node, endOffset);
        words.push({ word: wordWithPunct, range, sectionIndex: index });
      }
    }
    // Section boundary = paragraph break
    if (words.length > 0) {
      paragraphBreaks.add(words.length - 1);
    }
  }
  return { words, paragraphBreaks };
}

/** Extract words from a single section's document (for incremental updates during narration) */
function extractWordsFromSection(doc: Document, sectionIndex: number): FoliateWord[] {
  const words: FoliateWord[] = [];
  if (!doc?.body) return words;
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
    const segments = Array.from(wordSegmenter.segment(text));
    for (let si = 0; si < segments.length; si++) {
      const { segment, isWordLike, index: segIdx } = segments[si];
      if (!isWordLike) continue;
      // Include trailing punctuation (same as extractWordsFromView)
      let wordWithPunct = segment;
      let endOffset = segIdx + segment.length;
      for (let pi = si + 1; pi < segments.length; pi++) {
        const next = segments[pi];
        if (next.isWordLike) break;
        if (/^[.!?,;:'"»)\]\u201D\u2019\u2026]+$/.test(next.segment)) {
          wordWithPunct += next.segment;
          endOffset = next.index + next.segment.length;
        } else break;
      }
      const range = doc.createRange();
      range.setStart(node, segIdx);
      range.setEnd(node, endOffset);
      words.push({ word: wordWithPunct, range, sectionIndex });
    }
  }
  return words;
}

/**
 * Merge freshly extracted words with the existing word array.
 * - Words from loaded sections get fresh Ranges.
 * - Words from unloaded sections keep their word string but Range is nulled.
 * - New sections discovered in fresh extraction are inserted at the correct position.
 */
function mergeWords(existing: FoliateWord[], fresh: FoliateWord[], loadedSections: Set<number>): FoliateWord[] {
  // Build a map of fresh words grouped by section
  const freshBySection = new Map<number, FoliateWord[]>();
  for (const w of fresh) {
    let arr = freshBySection.get(w.sectionIndex);
    if (!arr) { arr = []; freshBySection.set(w.sectionIndex, arr); }
    arr.push(w);
  }

  // Collect existing sections in order
  const existingSections = new Set<number>();
  for (const w of existing) existingSections.add(w.sectionIndex);

  // Find new sections not in existing
  const newSections = new Set<number>();
  for (const s of freshBySection.keys()) {
    if (!existingSections.has(s)) newSections.add(s);
  }

  // Build merged result
  const merged: FoliateWord[] = [];
  let lastSection = -1;

  for (const w of existing) {
    // Before processing a new section from existing, insert any new sections that come before it
    if (w.sectionIndex !== lastSection) {
      for (const ns of newSections) {
        if (ns > lastSection && ns < w.sectionIndex) {
          const nsWords = freshBySection.get(ns);
          if (nsWords) merged.push(...nsWords);
          newSections.delete(ns);
        }
      }
      lastSection = w.sectionIndex;
    }

    if (freshBySection.has(w.sectionIndex)) {
      // This section is freshly loaded — skip old words, we'll add fresh ones once per section
      continue;
    } else if (!loadedSections.has(w.sectionIndex)) {
      // Section is unloaded — null out Range, keep word string
      merged.push({ word: w.word, range: null, sectionIndex: w.sectionIndex });
    } else {
      // Section is loaded but not in fresh (shouldn't happen, but keep as-is)
      merged.push(w);
    }
  }

  // Now insert fresh words for sections that replaced existing ones, in section order
  const freshSectionsSorted = Array.from(freshBySection.keys()).sort((a, b) => a - b);

  // Rebuild: insert fresh section words at the right position
  const result: FoliateWord[] = [];
  let mergedIdx = 0;

  for (const freshSec of freshSectionsSorted) {
    // Add all merged words from sections before this fresh section
    while (mergedIdx < merged.length && merged[mergedIdx].sectionIndex < freshSec) {
      result.push(merged[mergedIdx++]);
    }
    // Skip any merged words from this section (shouldn't exist since we skipped above)
    while (mergedIdx < merged.length && merged[mergedIdx].sectionIndex === freshSec) {
      mergedIdx++;
    }
    // Add fresh words for this section
    const freshWords = freshBySection.get(freshSec);
    if (freshWords) result.push(...freshWords);
  }

  // Add remaining merged words
  while (mergedIdx < merged.length) {
    result.push(merged[mergedIdx++]);
  }

  // Append any new sections that come after all existing sections
  for (const ns of newSections) {
    const nsWords = freshBySection.get(ns);
    if (nsWords) result.push(...nsWords);
  }

  return result;
}

/** Walk the EPUB section DOM and wrap each word in a <span class="page-word" data-word-index="N">.
 *  Must be called AFTER extractWordsFromView (which needs raw text nodes for Range creation).
 *  Returns the next available global index. */
function wrapWordsInSpans(doc: Document, sectionIndex: number, globalOffset: number): number {
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node: Node) => {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName?.toUpperCase();
      if (tag === "SCRIPT" || tag === "STYLE") return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let globalIndex = globalOffset;
  const textNodes: Text[] = [];
  let tn: Text | null;
  while ((tn = walker.nextNode() as Text | null)) {
    textNodes.push(tn);
  }

  for (const textNode of textNodes) {
    const text = textNode.textContent || "";
    const words = segmentWords(text);
    if (words.length === 0) continue;

    const parent = textNode.parentNode;
    if (!parent) continue;

    // Build a document fragment with word spans + whitespace preserved
    const frag = doc.createDocumentFragment();
    let remaining = text;

    for (const word of words) {
      const wordStart = remaining.indexOf(word);
      if (wordStart > 0) {
        // Preserve whitespace/punctuation before the word
        frag.appendChild(doc.createTextNode(remaining.slice(0, wordStart)));
      }

      const span = doc.createElement("span");
      span.className = "page-word";
      span.setAttribute("data-word-index", String(globalIndex));
      span.textContent = word;
      frag.appendChild(span);

      remaining = remaining.slice(wordStart + word.length);
      globalIndex++;
    }

    // Append any trailing whitespace/punctuation
    if (remaining) {
      frag.appendChild(doc.createTextNode(remaining));
    }

    parent.replaceChild(frag, textNode);
  }

  return globalIndex;
}

interface FoliatePageViewProps {
  activeDoc: BlurbyDoc & { content?: string };
  settings: BlurbySettings;
  onRelocate?: (detail: { cfi: string; fraction: number; tocItem?: any; pageItem?: any }) => void;
  onTocReady?: (toc: any[]) => void;
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
}

export interface FoliateViewAPI {
  getWords: () => FoliateWord[];
  getParagraphBreaks: () => Set<number>;
  goTo: (target: string | number) => Promise<any>;
  goToFraction: (frac: number) => Promise<void>;
  next: () => void;
  prev: () => void;
  highlightWord: (range: Range | null, sectionIndex: number) => void;
  highlightWordByIndex: (wordIndex: number) => void;
  clearHighlight: () => void;
  getView: () => any;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Store flow-mode callback in a ref to avoid re-render loops
  const onFlowWordAdvanceRef = useRef(onFlowWordAdvance);
  onFlowWordAdvanceRef.current = onFlowWordAdvance;
  const highlightedWordIndexRef = useRef(highlightedWordIndex);
  highlightedWordIndexRef.current = highlightedWordIndex;
  const readingModeRef = useRef(readingMode);
  readingModeRef.current = readingMode;

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

            if (isActiveMode && foliateWordsRef.current.length > 0) {
              // Extract just this section's words and append/update in the existing array
              const sectionWords = extractWordsFromSection(doc, index);
              // Find the insertion point: after the last word of the previous section
              const existingEnd = foliateWordsRef.current.length;
              const sectionStart = existingEnd; // Append at end
              // Wrap this section's words with indices continuing from existing
              wrapWordsInSpans(doc, index, sectionStart);
              // Append to the word array
              foliateWordsRef.current = [...foliateWordsRef.current, ...sectionWords.map(w => ({ ...w, sectionIndex: index }))];
              onWordsReextracted?.();
            } else {
              // Full re-extraction (Page mode or first load)
              const extracted = extractWordsFromView(v2);
              foliateWordsRef.current = extracted.words;
              foliateParagraphBreaksRef.current = extracted.paragraphBreaks;
              onWordsReextracted?.();
              // Wrap this section's words
              const sectionStart = extracted.words.findIndex(w => w.sectionIndex === index);
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

            // Highlight via CSS class (same as PageReaderView)
            doc.querySelectorAll(".page-word--highlighted").forEach((el: Element) =>
              el.classList.remove("page-word--highlighted")
            );
            (target as HTMLElement).classList.add("page-word--highlighted");

            // Report click to parent
            const v = viewRef.current;
            if (v) {
              const contents = v.renderer?.getContents?.() ?? [];
              const match = contents.find((c: any) => c.doc === doc);
              if (match) {
                const range = doc.createRange();
                range.selectNodeContents(target);
                const cfi = v.getCFI(match.index, range);
                const sectionBase = foliateWordsRef.current.findIndex(w => w.sectionIndex === match.index);
                const wordOffsetInSection = sectionBase >= 0 ? idx - sectionBase : 0;
                onWordClick?.(cfi, target.textContent || "", match.index, wordOffsetInSection, idx);
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

        // Navigate to last position or start from the very beginning (cover page).
        // Only pass lastLocation when a real CFI exists — passing null causes foliate
        // to skip the cover and land on the first text section (~page 3).
        console.log("[Foliate] initialCfi:", initialCfi ? initialCfi.substring(0, 60) + "..." : "null/undefined");
        const initOptions = initialCfi ? { lastLocation: initialCfi } : {};
        await view.init(initOptions);

        if (!initialCfi) {
          // No saved CFI — check if there's a saved position (word index) to approximate
          const savedPos = activeDoc.position || 0;
          const wordCount = activeDoc.wordCount || 1;
          if (savedPos > 0 && wordCount > 0) {
            const fraction = Math.min(savedPos / wordCount, 1);
            console.log(`[Foliate] No CFI but position=${savedPos}/${wordCount} — goToFraction(${fraction.toFixed(3)})`);
            await view.goToFraction(fraction);
          } else {
            console.log("[Foliate] No saved position — forcing goToFraction(0) for cover page");
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
            highlightWordByIndex: (wordIndex: number) => {
              // Toggle page-word--highlighted class on word spans inside foliate iframes
              // Uses view.renderer.getContents() to access shadow DOM iframes
              const contents = view.renderer?.getContents?.() ?? [];
              // Clear previous highlight
              for (const { doc: d } of contents) {
                try {
                  d?.querySelector?.(".page-word--highlighted")?.classList.remove("page-word--highlighted");
                } catch { /* */ }
              }
              // Apply highlight to target word
              let found = false;
              for (const { doc: d } of contents) {
                try {
                  const span = d?.querySelector?.(`[data-word-index="${wordIndex}"]`) as HTMLElement;
                  if (span) {
                    span.classList.add("page-word--highlighted");
                    // Check if the span is actually visible on the current foliate "page"
                    // (foliate uses CSS columns — span may exist in DOM but be in an off-screen column)
                    const rect = span.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0 && rect.left >= -10 && rect.right <= (d.defaultView?.innerWidth ?? 9999) + 10) {
                      found = true;
                    }
                    // else: span exists but is off-screen — need page turn
                    break;
                  }
                } catch { /* */ }
              }
              // Word not visible (off-screen column) or not in any loaded section
              if (!found) {
                view.renderer.next();
              }
            },
            clearHighlight: () => {
              // Clear all highlights in foliate iframes
              const contents = view.renderer?.getContents?.() ?? [];
              for (const { doc: d } of contents) {
                try { d?.querySelector?.(".page-word--highlighted")?.classList.remove("page-word--highlighted"); } catch { /* */ }
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

  // Flow mode overlay cursor animation (EPUB-only, Range-based)
  useEffect(() => {
    if (readingMode !== "flow" || !flowPlaying) {
      if (cursorRef.current) cursorRef.current.style.display = "none";
      cancelAnimationFrame(flowRafRef.current);
      return;
    }
    const cursor = cursorRef.current;
    const container = containerRef.current;
    if (!cursor || !container) return;
    cursor.style.display = "block";

    let currentIdx = highlightedWordIndexRef.current ?? 0;
    const msPerWord = 60000 / (wpm || 300);
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
            if (iframe) {
              const iframeRect = iframe.getBoundingClientRect();
              cursor.style.transform = `translate3d(${iframeRect.left + spanRect.left}px, ${iframeRect.top + spanRect.top + spanRect.height}px, 0)`;
            } else {
              cursor.style.transform = `translate3d(${spanRect.left}px, ${spanRect.top + spanRect.height}px, 0)`;
            }
            cursor.style.width = `${spanRect.width}px`;
            cursor.style.display = "block";
            found = true;
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

  // Narration highlight — toggle CSS class on word spans inside iframe (same as click highlight)
  const prevNarrationRef = useRef<{ iframe: Document; idx: number } | null>(null);
  useEffect(() => {
    if (narrationWordIndex == null || narrationWordIndex < 0) {
      // Clear previous highlight
      if (prevNarrationRef.current) {
        const prev = prevNarrationRef.current.iframe.querySelector(`[data-word-index="${prevNarrationRef.current.idx}"]`);
        prev?.classList.remove("page-word--highlighted");
        prevNarrationRef.current = null;
      }
      return;
    }

    const host = containerRef.current;
    if (!host) return;
    const iframes = host.querySelectorAll("iframe");

    // Clear previous highlight
    if (prevNarrationRef.current) {
      const prev = prevNarrationRef.current.iframe.querySelector(`[data-word-index="${prevNarrationRef.current.idx}"]`);
      prev?.classList.remove("page-word--highlighted");
    }

    // Apply highlight to current word
    for (const iframe of iframes) {
      try {
        const iframeDoc = iframe.contentDocument;
        if (!iframeDoc) continue;
        const span = iframeDoc.querySelector(`[data-word-index="${narrationWordIndex}"]`);
        if (span) {
          span.classList.add("page-word--highlighted");
          prevNarrationRef.current = { iframe: iframeDoc, idx: narrationWordIndex };
          // Scroll span into view if needed
          span.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
          break;
        }
      } catch { /* cross-origin */ }
    }
  }, [narrationWordIndex]);

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
      <div ref={cursorRef} className="foliate-flow-cursor" style={{ display: "none" }} />
      <div ref={highlightRef} className="foliate-narration-highlight" style={{ display: "none" }} />
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
    .page-word { cursor: pointer; border-radius: 2px; transition: background 0.1s; }
    .page-word:hover { background: ${accent}22; }
    .page-word--highlighted { background: ${accent}4D; }
  `;
  doc.head.appendChild(style);
}
