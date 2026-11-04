/**
 * foliateHelpers — pure utility functions for EPUB/foliate word extraction and DOM manipulation.
 * Extracted from FoliatePageView.tsx for testability and reuse.
 */
import { segmentWordSpans, type SegmentedWordSpan } from "../../../../utils/segmentWords";

/** Word entry with optional Range — Range is null when the section is unloaded. */
export interface FoliateWord {
  word: string;
  range: Range | null;
  sectionIndex: number;
  tokenId?: string;
  blockTag?: string;
  blockOrdinal?: number;
  blockId?: string;
  paragraphBreakAfter?: boolean;
  sourceLineBreakAfter?: boolean;
  /** BLOCK-TEXT-ORDER-1 (D-6): the raw run (D-1) the word came from, 0-based per section, and its `section:rOrdinal` id. */
  runOrdinal?: number;
  runId?: string;
}

/**
 * Lowercase block tags, matched against `localName.toLowerCase()`: an EPUB section is application/xhtml+xml, where
 * `tagName` keeps the source's case, so an uppercase set found no block there (BLOCK-TAG-CASE-1).
 */
export const BLOCK_TAGS = new Set(["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "li", "td", "section", "article"]);

export function parseWordIndexAttribute(value: string | null | undefined): number | null {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function queryWordSpans(root: ParentNode | null | undefined): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>("[data-word-index]"));
}

/** Characters of body's text before the boundary point (node, offset) (PAGE-POSITION-SAVE-1). */
export function textOffsetBefore(body: HTMLElement, node: Node, offset: number): number {
  const range = body.ownerDocument.createRange();
  range.setStart(body, 0);
  range.setEnd(node, offset);
  return range.toString().length;
}

/** The first stamped word span with text in [start, end) of body's text, or null (wrapping keeps the text). */
export function findWordSpanInTextRange(body: HTMLElement, start: number, end: number): HTMLElement | null {
  const walker = body.ownerDocument.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  let seen = 0;
  for (let node = walker.nextNode(); node && seen < end; node = walker.nextNode()) {
    seen += node.nodeValue?.length ?? 0;
    if (seen <= start) continue;
    const span = node.parentElement?.closest<HTMLElement>("[data-word-index]");
    if (span) return span;
  }
  return null;
}

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
  while (el && !BLOCK_TAGS.has(el.localName.toLowerCase())) el = el.parentElement;
  return el;
}

/**
 * BLOCK-TEXT-ORDER-1 (contract A-1): the `#`-href targets of every footnote reference below `body`, exactly main's
 * `targetIds` (`buildFootnoteTargetTextMap`, main/epub-word-extractor.js).
 */
export function collectFootnoteTargetIds(body: Element): Set<string> {
  const ids = new Set<string>();
  for (const el of Array.from(body.querySelectorAll("*"))) {
    if (!isFootnoteRefElement(el)) continue;
    const href = el.getAttribute("href") || "";
    if (!href.startsWith("#")) continue;
    const id = href.slice(1).trim();
    if (id) ids.add(id);
  }
  return ids;
}

/**
 * MAIN_ACCEPT (contract A-1): main's acceptance of a text node under `root` (the section body). It is rejected when
 * an element on the path root…parent is script or style, or a footnote body (main's predicate, with its plain-ID
 * target clause); when an element strictly below its outermost block is a footnote reference; and, outside any
 * block, when it is blank.
 */
function isMainAcceptedTextNode(node: Text, root: Element, targetIds: Set<string>): boolean {
  if (!node.data) return false;
  const path: Element[] = [];
  for (let el = node.parentElement; el; el = el.parentElement) {
    path.push(el);
    if (el === root) break;
  }
  let outermostBlock = -1;
  for (let i = 0; i < path.length; i++) {
    const el = path[i];
    const name = el.localName.toLowerCase();
    if (name === "script" || name === "style") return false;
    const id = el.getAttribute("id") || "";
    if ((id && targetIds.has(id)) || isFootnoteBodyElement(el)) return false;
    if (BLOCK_TAGS.has(name)) outermostBlock = i;
  }
  if (outermostBlock < 0) return node.data.trim() !== "";
  for (let i = 0; i < outermostBlock; i++) {
    if (isFootnoteRefElement(path[i])) return false;
  }
  return true;
}

/** BLOCK-TEXT-ORDER-1 (contract A-2): the section body's main-accepted text nodes, in DOM order. */
export function collectMainAcceptedTextNodes(body: Element | null | undefined): Text[] {
  const doc = body?.ownerDocument;
  if (!body || !doc?.createTreeWalker) return [];
  const targetIds = collectFootnoteTargetIds(body);
  const nodes: Text[] = [];
  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    if (isMainAcceptedTextNode(node, body, targetIds)) nodes.push(node);
  }
  return nodes;
}

function isLegacyAcceptedTextNode(node: Text): boolean {
  const parentName = node.parentElement?.localName.toLowerCase();
  if (parentName === "script" || parentName === "style") return false;
  if (!node.textContent) return false;
  return !isSuppressedNarrationTextNode(node);
}

/**
 * One raw run (D-1). `runOrdinal` and `runId` are always set here; they are typed optional only so the unchanged
 * legacy `src/utils/foliateHelpers.ts` collector stays assignable where tests type the copies alike (blockTagCase).
 */
export interface BlockTextRun {
  block: Element;
  nodes: Text[];
  blockTag: string;
  blockOrdinal: number;
  blockId: string;
  runOrdinal?: number;
  runId?: string;
}

/**
 * BLOCK-TEXT-ORDER-1 (contract D-1): the raw runs of accepted text in DOM order. A run is a maximal sequence of accepted
 * text nodes not separated by the entry or exit of any BLOCK_TAGS element (an empty or suppressed block included; a
 * suppressed inline element is not a separator); runs whose text is all whitespace are not emitted. `block`,
 * `blockTag`, `blockOrdinal` and `blockId` keep today's formula (D-2): the nearest block, or the root; blocks numbered
 * in first-encounter order of their accepted text, so a resumed parent run shares its parent's `blockId`. The fallback
 * acceptance is the legacy predicate (A-3); `"main"` uses MAIN_ACCEPT (A-1).
 */
export function collectBlockTextNodes(
  root: ParentNode,
  sectionIndex = 0,
  acceptance: "fallback" | "main" = "fallback",
): BlockTextRun[] {
  const doc = root.ownerDocument;
  if (!doc?.createTreeWalker) return [];
  const rootBlock = root instanceof Element ? root : doc.body;
  let accept = isLegacyAcceptedTextNode;
  if (acceptance === "main") {
    if (!rootBlock) return [];
    const targetIds = collectFootnoteTargetIds(rootBlock);
    accept = (node: Text) => isMainAcceptedTextNode(node, rootBlock, targetIds);
  }

  const rawRuns: Text[][] = [];
  let current: Text[] = [];
  const endRun = () => {
    if (current.length > 0) rawRuns.push(current);
    current = [];
  };
  const visit = (parent: Node) => {
    for (let child = parent.firstChild; child; child = child.nextSibling) {
      if (child.nodeType === Node.TEXT_NODE) {
        if (accept(child as Text)) current.push(child as Text);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const isBlock = BLOCK_TAGS.has((child as Element).localName.toLowerCase());
        if (isBlock) endRun();
        visit(child);
        if (isBlock) endRun();
      }
    }
  };
  visit(root);
  endRun();

  const blockOf = (node: Text) => getBlockParent(node) || rootBlock;
  const blockOrdinals = new Map<Element, number>();
  for (const nodes of rawRuns) {
    for (const node of nodes) {
      const block = blockOf(node);
      if (block && !blockOrdinals.has(block)) blockOrdinals.set(block, blockOrdinals.size);
    }
  }

  const runs: BlockTextRun[] = [];
  for (const nodes of rawRuns) {
    const block = blockOf(nodes[0]);
    if (!block) continue;
    if (!nodes.some((node) => (node.textContent || "").trim() !== "")) continue;
    const blockTag = block.tagName.toLowerCase();
    const blockOrdinal = blockOrdinals.get(block)!;
    const runOrdinal = runs.length;
    runs.push({
      block,
      nodes,
      blockTag,
      blockOrdinal,
      blockId: `${sectionIndex}:${blockOrdinal}:${blockTag}`,
      runOrdinal,
      runId: `${sectionIndex}:r${runOrdinal}`,
    });
  }
  return runs;
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

export function hasPunctuatedSourceLineBreakAfter(text: string, absoluteEndOffset: number): boolean {
  const before = text.slice(0, absoluteEndOffset);
  const after = text.slice(absoluteEndOffset);
  return /[.!?;:,]["')\]]?\s*$/.test(before) && /^\s*\r?\n/.test(after);
}

export function buildWordsFromTextNodes(
  nodes: Text[],
  sectionIndex: number,
  tokenOffset = 0,
  metadata: { blockTag?: string; blockOrdinal?: number; blockId?: string; runOrdinal?: number; runId?: string } = {},
): FoliateWord[] {
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
    words.push({
      word,
      range,
      sectionIndex,
      tokenId: makeFoliateTokenId(sectionIndex, tokenOffset + words.length),
      blockTag: metadata.blockTag,
      blockOrdinal: metadata.blockOrdinal,
      blockId: metadata.blockId,
      runOrdinal: metadata.runOrdinal,
      runId: metadata.runId,
      sourceLineBreakAfter: hasPunctuatedSourceLineBreakAfter(combined, end) || undefined,
    });
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

/**
 * BLOCK-TEXT-ORDER-1 (contract D-3): one section's fallback words from its runs, in DOM order. A word is a paragraph
 * start when it is the first word of its block; `paragraphBreakAfter` holds when the next word is a paragraph start or
 * the word is the section's last, so a continuation run of a started block adds no break (OQ5).
 */
function buildSectionWords(
  runs: ReturnType<typeof collectBlockTextNodes>,
  sectionIndex: number,
  tokenOffset: number,
): FoliateWord[] {
  const words: FoliateWord[] = [];
  const startedBlocks = new Set<Element>();
  for (const { block, nodes, blockTag, blockOrdinal, blockId, runOrdinal, runId } of runs) {
    const runWords = buildWordsFromTextNodes(nodes, sectionIndex, tokenOffset + words.length, { blockTag, blockOrdinal, blockId, runOrdinal, runId });
    if (runWords.length === 0) continue;
    if (!startedBlocks.has(block)) {
      startedBlocks.add(block);
      if (words.length > 0) words[words.length - 1].paragraphBreakAfter = true;
    }
    words.push(...runWords);
  }
  if (words.length > 0) words[words.length - 1].paragraphBreakAfter = true;
  return words;
}

export function extractWordsFromView(view: any): { words: FoliateWord[]; paragraphBreaks: Set<number> } {
  const words: FoliateWord[] = [];
  const paragraphBreaks = new Set<number>();
  if (!view?.renderer?.getContents) return { words, paragraphBreaks };
  const sectionTokenOffsets = new Map<number, number>();

  for (const { doc, index } of view.renderer.getContents()) {
    if (!doc?.body) continue;

    const tokenOffset = sectionTokenOffsets.get(index) || 0;
    const sectionWords = buildSectionWords(collectBlockTextNodes(doc.body, index), index, tokenOffset);
    for (const word of sectionWords) {
      if (word.paragraphBreakAfter) paragraphBreaks.add(words.length);
      words.push(word);
    }
    sectionTokenOffsets.set(index, tokenOffset + sectionWords.length);
  }
  return { words, paragraphBreaks };
}

/** Extract words from a single section's document (for incremental updates during narration) */
export function extractWordsFromSection(doc: Document, sectionIndex: number): FoliateWord[] {
  if (!doc?.body) return [];
  return buildSectionWords(collectBlockTextNodes(doc.body, sectionIndex), sectionIndex, 0);
}
