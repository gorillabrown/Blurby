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
import { DEFAULT_WPM, FOLIATE_BASE_FONT_SIZE_PX, FOLIATE_RENDERER_HEIGHT_MARGIN_PX, FOLIATE_MARGIN_PX, FOLIATE_MAX_INLINE_SIZE_PX, FOLIATE_TWO_COLUMN_BREAKPOINT_PX } from "../constants";

const api = window.electronAPI;

/** Word entry with optional Range — Range is null when the section is unloaded. */
export interface FoliateWord {
  word: string;
  range: Range | null;
  sectionIndex: number;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Store flow-mode callback in a ref to avoid re-render loops
  const onFlowWordAdvanceRef = useRef(onFlowWordAdvance);
  onFlowWordAdvanceRef.current = onFlowWordAdvance;
  const highlightedWordIndexRef = useRef(highlightedWordIndex);
  highlightedWordIndexRef.current = highlightedWordIndex;
  const readingModeRef = useRef(readingMode);
  // Track when user has manually browsed away during narration — suppresses scrollToAnchor
  const userBrowsingRef = useRef(false);
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

            if (isActiveMode && foliateWordsRef.current.length > 0) {
              // Extract just this section's words and append/update in the existing array
              const sectionWords = extractWordsFromSection(doc, index);
              // HOTFIX-10: Use global offset from extraction data when available
              const bookSection = bookWordSections?.find(s => s.sectionIndex === index);
              const existingEnd = foliateWordsRef.current.length;
              const sectionStart = bookSection ? bookSection.startWordIdx : existingEnd;
              // Wrap this section's words with correct indices
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
          onTocReady?.(view.book.toc, view.book.sections?.length ?? 0);
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
              // TTS-7I: Use shared resolver for consistent gate/highlight truth (BUG-124)
              const state = viewApiRef!.current!.resolveWordState(wordIndex);

              const contents = view.renderer?.getContents?.() ?? [];
              // Use explicit style hint from caller (avoids stale readingModeRef during state transitions)
              const isFlowMode = styleHint === "flow" || readingModeRef.current === "flow";
              const highlightClass = isFlowMode ? "page-word--flow-cursor" : "page-word--highlighted";
              // Clear previous highlight (both classes)
              for (const { doc: d } of contents) {
                try {
                  d?.querySelector?.(".page-word--highlighted")?.classList.remove("page-word--highlighted");
                  d?.querySelector?.(".page-word--flow-cursor")?.classList.remove("page-word--flow-cursor");
                } catch { /* */ }
              }

              // Word not found in loaded sections — caller decides what to do
              if (!state.found || !state.span) {
                if (process.env.NODE_ENV !== 'production') {
                  console.debug(`[foliate] highlightWordByIndex miss: word ${wordIndex} not in DOM`);
                }
                return false;
              }

              // Apply highlight CSS class (cheap, no page motion)
              state.span.classList.add(highlightClass);

              // TTS-7I (BUG-125): Split highlight from motion — only scroll when word is
              // NOT already visible on page. Skip if user has browsed away.
              if (state.doc && !userBrowsingRef.current && !state.visible) {
                try {
                  const range = state.doc.createRange();
                  range.selectNodeContents(state.span);
                  view.renderer.scrollToAnchor?.(range);
                } catch { /* safe to ignore */ }
              }
              // If user was browsing and the word is now visible, auto-clear browsing flag
              if (userBrowsingRef.current && state.visible) {
                userBrowsingRef.current = false; // Narration caught up to where user browsed
              }
              return true;
            },
            clearHighlight: () => {
              // Clear all highlights in foliate iframes
              const contents = view.renderer?.getContents?.() ?? [];
              for (const { doc: d } of contents) {
                try {
                  d?.querySelector?.(".page-word--highlighted")?.classList.remove("page-word--highlighted");
                  d?.querySelector?.(".page-word--flow-cursor")?.classList.remove("page-word--flow-cursor");
                } catch { /* */ }
              }
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
            getSectionForWordIndex: (wordIndex: number): number | null => {
              const words = foliateWordsRef.current;
              if (wordIndex >= 0 && wordIndex < words.length) {
                return words[wordIndex].sectionIndex;
              }
              return null;
            },
            findFirstVisibleWordIndex: () => {
              // Walk all loaded sections to find the first word span that's visible
              const contents = view.renderer?.getContents?.() ?? [];
              for (const { doc: d } of contents) {
                try {
                  const spans = d.querySelectorAll("[data-word-index]");
                  for (const span of spans) {
                    const rect = (span as HTMLElement).getBoundingClientRect();
                    const iframeWin = d.defaultView;
                    if (!iframeWin) continue;
                    // Check if the span is within the visible viewport of the iframe
                    if (rect.width > 0 && rect.left >= 0 && rect.left < iframeWin.innerWidth &&
                        rect.top >= 0 && rect.top < iframeWin.innerHeight) {
                      const idx = parseInt((span as HTMLElement).getAttribute("data-word-index") || "-1", 10);
                      if (idx >= 0) return idx;
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
    .page-word { cursor: pointer; border-radius: 2px; transition: background 0.1s; }
    .page-word:hover { background: ${accent}22; }
    .page-word--highlighted { background: ${accent}4D; }
    .page-word--flow-cursor { border-bottom: 3px solid ${accent}; padding-bottom: 1px; }
  `;
  doc.head.appendChild(style);
}
