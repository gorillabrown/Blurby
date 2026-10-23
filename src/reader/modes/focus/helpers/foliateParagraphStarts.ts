import { BLOCK_TAGS, parseWordIndexAttribute, queryWordSpans } from "./foliateHelpers";

/**
 * BLOCK_TAGS' members in lowercase. An EPUB section is application/xhtml+xml, where `tagName` keeps the source's
 * lowercase ("p"), so the uppercase set never matches there (FOCUS-KEYS-FIX-1 amendment, 2026-10-23). The shared
 * `getBlockParent` is fixed by BLOCK-TAG-CASE-1; this key path does not use it.
 */
const PARAGRAPH_BLOCK_TAGS = new Set([...BLOCK_TAGS].map((tag) => tag.toLowerCase()));

export function isParagraphBlock(el: Element): boolean {
  return PARAGRAPH_BLOCK_TAGS.has(el.localName.toLowerCase());
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
 * FOCUS-KEYS-FIX-1: the book-wide word index of each block's first stamped word, over the section documents stamped
 * against the book's sections. A document still on provisional (section-local) numbering is left out, like an
 * unloaded section (Blurby.Brain, 2026-10-23). The body counts as a block for words outside any block. Sorted,
 * without duplicates.
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
