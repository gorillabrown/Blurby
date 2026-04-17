/**
 * foliateHelpers — pure utility functions for EPUB/foliate word extraction and DOM manipulation.
 * Extracted from FoliatePageView.tsx for testability and reuse.
 */
import { segmentWordSpans, type SegmentedWordSpan } from "./segmentWords";

/** Word entry with optional Range — Range is null when the section is unloaded. */
export interface FoliateWord {
  word: string;
  range: Range | null;
  sectionIndex: number;
  tokenId?: string;
}

export const BLOCK_TAGS = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "LI", "TD", "SECTION", "ARTICLE"]);

export function hasToken(value: string | null | undefined, token: string): boolean {
  return String(value || "").toLowerCase().split(/\s+/).includes(token.toLowerCase());
}

export function isFootnoteRefElement(el: Element | null): boolean {
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

export function isFootnoteBodyElement(el: Element | null): boolean {
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

export function isSuppressedNarrationTextNode(node: Node): boolean {
  let el = node.parentElement;
  while (el) {
    if (isFootnoteRefElement(el) || isFootnoteBodyElement(el)) return true;
    el = el.parentElement;
  }
  return false;
}

export function getBlockParent(node: Node): Element | null {
  let el = node.parentElement;
  while (el && !BLOCK_TAGS.has(el.tagName)) el = el.parentElement;
  return el;
}

export function collectBlockTextNodes(root: ParentNode): Array<{ block: Element; nodes: Text[] }> {
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

export function locateTextOffset(nodes: Text[], absoluteOffset: number): { node: Text; offset: number } | null {
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

export function makeFoliateTokenId(sectionIndex: number, tokenIndex: number): string {
  return `${sectionIndex}:${tokenIndex}`;
}

export function buildWordsFromTextNodes(nodes: Text[], sectionIndex: number, tokenOffset = 0): FoliateWord[] {
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
    words.push({ word, range, sectionIndex, tokenId: makeFoliateTokenId(sectionIndex, tokenOffset + words.length) });
  }

  return words;
}

type WrappedWordSpan = SegmentedWordSpan & {
  globalIndex: number;
  tokenId: string;
};

export function buildWrappedFragmentForNode(
  doc: Document,
  text: string,
  nodeStart: number,
  wordSpans: WrappedWordSpan[],
  tokenPartById: Map<string, number>,
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
    const tokenId = span.tokenId || String(span.globalIndex);
    const tokenPart = tokenPartById.get(tokenId) ?? 0;
    tokenPartById.set(tokenId, tokenPart + 1);
    el.setAttribute("data-token-id", tokenId);
    el.setAttribute("data-token-part", String(tokenPart));
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

export function extractWordsFromView(view: any): { words: FoliateWord[]; paragraphBreaks: Set<number> } {
  const words: FoliateWord[] = [];
  const paragraphBreaks = new Set<number>();
  if (!view?.renderer?.getContents) return { words, paragraphBreaks };
  const sectionTokenOffsets = new Map<number, number>();

  for (const { doc, index } of view.renderer.getContents()) {
    if (!doc?.body) continue;

    const blockGroups = collectBlockTextNodes(doc.body);
    for (const { nodes } of blockGroups) {
      const tokenOffset = sectionTokenOffsets.get(index) || 0;
      const blockWords = buildWordsFromTextNodes(nodes, index, tokenOffset);
      if (blockWords.length === 0) continue;
      words.push(...blockWords);
      sectionTokenOffsets.set(index, tokenOffset + blockWords.length);
      paragraphBreaks.add(words.length - 1);
    }
  }
  return { words, paragraphBreaks };
}

/** Extract words from a single section's document (for incremental updates during narration) */
export function extractWordsFromSection(doc: Document, sectionIndex: number): FoliateWord[] {
  const words: FoliateWord[] = [];
  if (!doc?.body) return words;
  const groups = collectBlockTextNodes(doc.body);
  let tokenOffset = 0;
  for (const { nodes } of groups) {
    const blockWords = buildWordsFromTextNodes(nodes, sectionIndex, tokenOffset);
    words.push(...blockWords);
    tokenOffset += blockWords.length;
  }
  return words;
}
