import { segmentWordSpans } from "./segmentWords";
import {
  collectBlockTextNodes,
  makeFoliateTokenId,
  buildWrappedFragmentForNode,
  type FoliateWord,
} from "./foliateHelpers";

/** STAB-1A (BUG-162b): Batch size for async wrapWordsInSpans — number of block groups
 *  processed before yielding to the event loop via setTimeout(0). */
const WRAP_BATCH_SIZE = 50;

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
  doc.body?.normalize();
}

/** Walk the EPUB section DOM and wrap each word in a <span class="page-word" data-word-index="N">.
 *  Must be called AFTER extractWordsFromView (which needs raw text nodes for Range creation).
 *  Returns the next available global index.
 *
 *  STAB-1A (BUG-162b): async batching keeps UI responsive during large section wraps. */
export async function wrapWordsInSpans(
  doc: Document,
  sectionIndex: number,
  globalOffset: number,
  sectionWords: FoliateWord[] = [],
): Promise<number> {
  let globalIndex = globalOffset;
  const groups = collectBlockTextNodes(doc.body);
  const tokenPartById = new Map<string, number>();
  let sectionWordCursor = 0;

  for (let i = 0; i < groups.length; i++) {
    const { nodes } = groups[i];
    const combined = nodes.map((node) => node.textContent || "").join("");
    const logicalSpans = segmentWordSpans(combined);
    const wordSpans = logicalSpans.map((span, idx) => {
      const sourceWord = sectionWords[sectionWordCursor + idx];
      return {
        ...span,
        globalIndex: globalIndex + idx,
        tokenId: sourceWord?.tokenId || makeFoliateTokenId(sectionIndex, sectionWordCursor + idx),
      };
    });
    sectionWordCursor += logicalSpans.length;
    globalIndex += wordSpans.length;

    let nodeStart = 0;
    for (const textNode of nodes) {
      const text = textNode.textContent || "";
      const parent = textNode.parentNode;
      if (!parent) {
        nodeStart += text.length;
        continue;
      }

      const frag = buildWrappedFragmentForNode(doc, text, nodeStart, wordSpans, tokenPartById);
      if (frag) parent.replaceChild(frag, textNode);
      nodeStart += text.length;
    }

    if ((i + 1) % WRAP_BATCH_SIZE === 0 && i + 1 < groups.length) {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }

  return globalIndex;
}
