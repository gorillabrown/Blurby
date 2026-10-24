import { BLOCK_TAGS, parseWordIndexAttribute, queryWordSpans } from "./foliateHelpers";

/**
 * The block rule of this mode's `getBlockParent`, which now lives in `foliateHelpers.ts`: lowercase `BLOCK_TAGS`
 * matched against `localName.toLowerCase()`, so an application/xhtml+xml EPUB section (lowercase `tagName`) and a
 * text/html one match alike (BLOCK-TAG-CASE-1, folding in FLOW-PARA-KEYS-1's local case-insensitive match).
 */
export function isParagraphBlock(el: Element): boolean {
  return BLOCK_TAGS.has(el.localName.toLowerCase());
}

/** The block's first stamped word that is not inside a nested block. */
function firstOwnWordIndex(block: Element): number | null {
  for (const span of queryWordSpans(block)) {
    let el = span.parentElement;
    while (el && el !== block && !isParagraphBlock(el)) el = el.parentElement;
    if (el !== block) continue;
    const wordIndex = parseWordIndexAttribute(span.getAttribute("data-word-index"));
    if (wordIndex != null) return wordIndex;
  }
  return null;
}

/**
 * FLOW-PARA-KEYS-1 (Flow's copy of FOCUS-KEYS-FIX-1's collector; no sibling import): the book-wide word index of each
 * block's first stamped word, over the section documents stamped against the book's sections. A document still on
 * provisional (section-local) numbering is left out, like an unloaded section. The body counts as a block for words
 * outside any block. Sorted, without duplicates.
 */
export function collectParagraphStartWordIndexes(
  contents: readonly { doc?: Document | null; index: number }[],
  isBookStamped: (doc: Document) => boolean,
): number[] {
  const starts = new Set<number>();
  for (const { doc } of contents) {
    const body = doc?.body;
    if (!doc || !body || !isBookStamped(doc)) continue;
    const blocks = [body, ...Array.from(body.querySelectorAll("*")).filter(isParagraphBlock)];
    for (const block of blocks) {
      const wordIndex = firstOwnWordIndex(block);
      if (wordIndex != null) starts.add(wordIndex);
    }
  }
  return [...starts].sort((a, b) => a - b);
}
