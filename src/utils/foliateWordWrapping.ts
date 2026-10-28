import { segmentWordSpans, type SegmentedWordSpan } from "./segmentWords";
import {
  collectBlockTextNodes,
  makeFoliateTokenId,
  buildWrappedFragmentForNode,
  type FoliateWord,
} from "./foliateHelpers";

/** STAB-1A (BUG-162b): Batch size for async wrapWordsInSpans — number of block groups
 *  processed before yielding to the event loop via setTimeout(0). */
const WRAP_BATCH_SIZE = 50;

const MAX_PEEK_AHEAD = 8;

type WrappedWordSpan = SegmentedWordSpan & { globalIndex: number; tokenId: string };

/** Content-align canonical (extractor) words against block text.
 *  Returns word spans positioned within the combined text, and how many canonical words were consumed. */
export function contentAlignWords(
  combinedText: string,
  canonicalWords: string[],
  startCursor: number,
  globalOffset: number,
  sectionIndex: number,
): { spans: WrappedWordSpan[]; consumed: number } {
  const spans: WrappedWordSpan[] = [];
  let textPos = 0;
  let canonicalCursor = startCursor;

  while (canonicalCursor < canonicalWords.length && textPos < combinedText.length) {
    const word = canonicalWords[canonicalCursor];
    const idx = combinedText.indexOf(word, textPos);
    if (idx !== -1) {
      spans.push({
        word,
        start: idx,
        end: idx + word.length,
        globalIndex: globalOffset + canonicalCursor,
        tokenId: makeFoliateTokenId(sectionIndex, canonicalCursor),
      });
      textPos = idx + word.length;
      canonicalCursor++;
      continue;
    }

    // Word not found at current textPos. Peek ahead to decide: skip this word
    // (block/tokenizer mismatch) or break to the next block.
    let foundAhead = false;
    for (let peek = 1; peek <= MAX_PEEK_AHEAD && canonicalCursor + peek < canonicalWords.length; peek++) {
      if (combinedText.indexOf(canonicalWords[canonicalCursor + peek], textPos) !== -1) {
        foundAhead = true;
        break;
      }
    }
    if (foundAhead) {
      if (import.meta.env.DEV) {
        console.warn(`[wrap] content-align skip: "${word}" not found in block text, cursor ${canonicalCursor}`);
      }
      canonicalCursor++;
      continue;
    }
    break;
  }

  return { spans, consumed: canonicalCursor - startCursor };
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
  doc.body?.normalize();
}

/** Walk the EPUB section DOM and wrap each word in a <span class="page-word" data-word-index="N">.
 *  Must be called AFTER extractWordsFromView (which needs raw text nodes for Range creation).
 *  Returns the next available global index.
 *
 *  When `canonicalWords` is provided (the main-process extractor's word array for this section),
 *  stamps `data-word-index` by content-aligning the canonical words against the DOM text so the
 *  click index === the TTS word-array index by construction (SRL-067).
 *
 *  STAB-1A (BUG-162b): async batching keeps UI responsive during large section wraps. */
export async function wrapWordsInSpans(
  doc: Document,
  sectionIndex: number,
  globalOffset: number,
  sectionWords: FoliateWord[] = [],
  canonicalWords?: string[],
): Promise<number> {
  const useContentAlign = canonicalWords != null && canonicalWords.length > 0;
  let globalIndex = globalOffset;
  const groups = collectBlockTextNodes(doc.body);
  const tokenPartById = new Map<string, number>();
  let sectionWordCursor = 0;
  let canonicalCursor = 0;

  for (let i = 0; i < groups.length; i++) {
    const { nodes } = groups[i];
    const combined = nodes.map((node) => node.textContent || "").join("");

    let wordSpans: WrappedWordSpan[];

    if (useContentAlign) {
      const aligned = contentAlignWords(combined, canonicalWords, canonicalCursor, globalOffset, sectionIndex);
      wordSpans = aligned.spans;
      canonicalCursor += aligned.consumed;
    } else {
      const logicalSpans = segmentWordSpans(combined);
      wordSpans = logicalSpans.map((span, idx) => {
        const sourceWord = sectionWords[sectionWordCursor + idx];
        return {
          ...span,
          globalIndex: globalIndex + idx,
          tokenId: sourceWord?.tokenId || makeFoliateTokenId(sectionIndex, sectionWordCursor + idx),
        };
      });
      sectionWordCursor += logicalSpans.length;
      globalIndex += wordSpans.length;
    }

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

  return useContentAlign ? globalOffset + canonicalCursor : globalIndex;
}
