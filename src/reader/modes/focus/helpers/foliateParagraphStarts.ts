import { collectBlockTextNodes, parseWordIndexAttribute } from "./foliateHelpers";

/**
 * FOCUS-KEYS-FIX-1: the book-wide word index of each block's first stamped word, over the section documents stamped
 * against the book's sections. A document still on provisional (section-local) numbering is left out, like an
 * unloaded section (Blurby.Brain, 2026-10-23). Sorted, without duplicates.
 */
export function collectParagraphStartWordIndexes(
  contents: readonly { doc?: Document | null; index: number }[],
  isBookStamped: (doc: Document) => boolean,
): number[] {
  const starts = new Set<number>();
  for (const { doc, index } of contents) {
    if (!doc?.body || !isBookStamped(doc)) continue;
    for (const { nodes } of collectBlockTextNodes(doc.body, index)) {
      for (const node of nodes) {
        const wordIndex = parseWordIndexAttribute(node.parentElement?.closest?.("[data-word-index]")?.getAttribute("data-word-index"));
        if (wordIndex != null) {
          starts.add(wordIndex);
          break;
        }
      }
    }
  }
  return [...starts].sort((a, b) => a - b);
}
