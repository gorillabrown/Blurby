import { segmentWordSpans, type SegmentedWordSpan } from "../../../../utils/segmentWords";
import {
  collectBlockTextNodes,
  collectMainAcceptedTextNodes,
  makeFoliateTokenId,
  buildWrappedFragmentForNode,
  type FoliateWord,
} from "./foliateHelpers";

/** STAB-1A (BUG-162b): Batch size for async wrapWordsInSpans — number of block groups
 *  processed before yielding to the event loop via setTimeout(0). */
const WRAP_BATCH_SIZE = 50;

/** BLOCK-TEXT-ORDER-1 amendment 1: time budget (ms) for one slice of the certified stamp. After a node, once a slice has
 *  run this long and placements remain, the stamp yields via setTimeout(0) and starts a new slice. */
const WRAP_STAMP_SLICE_MS = 8;

const MAX_PEEK_AHEAD = 8;

/** BLOCK-TEXT-ORDER-1 amendment 1: the latest run per document. `wrapWordsInSpans` and `unwrapWordSpans` each replace
 *  it. A run whose token was replaced stops at its next check with no report and returns the current token's `settled`,
 *  so its caller resumes only when the live run ends; `unwrapWordSpans` installs `settled: null`, so a run superseded by
 *  an unwrap alone returns at once. Runs only wait on newer runs, so there is no cycle. */
type WrapToken = { settled: Promise<number> | null };
const wrapTokens = new WeakMap<Document, WrapToken>();
/** What a superseded run returns: the live run's completion, or `fallback` at once when no run is live. */
function liveRunOf(doc: Document, fallback: number): Promise<number> | number {
  return wrapTokens.get(doc)?.settled ?? fallback;
}

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

/** BLOCK-TEXT-ORDER-1 (contract B.2): why a canonical slice could not be certified against the section's text. */
export type CertificationFailureReason =
  | "invalid-canonical-word"
  | "canonical-exhausted-dom"
  | "unmatched-source-word"
  | "extra-source-text";

/** Canonical word `i` lies at [start, end) of the text of `nodes[node]`. */
export interface CertifiedPlacement {
  i: number;
  node: number;
  start: number;
  end: number;
}

export type CertificationFailure = { ok: false; reason: CertificationFailureReason; canonicalIndex: number; nodeIndex: number };

/** What `wrapWordsInSpans` reports through `onCertification` (OQ4: an `ok:false` section's spans are untrusted). */
export type CertificationResult = { ok: true } | CertificationFailure | { ok: false; reason: "no-canonical-slice" | "dom-changed" };

/**
 * TQ-B1: true when `s` holds no word-like segment. A verify-only gap test, never a tokenizer: it numbers nothing. The
 * segmenter is built here, as main builds its own (main/epub-word-extractor.js), so no module singleton is added. A
 * whitespace-only gap holds no word-like segment, so it answers without one.
 */
function wordFree(s: string): boolean {
  if (s.trim() === "") return true;
  const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
  for (const segment of segmenter.segment(s)) {
    if (segment.isWordLike) return false;
  }
  return true;
}

/**
 * BLOCK-TEXT-ORDER-1 (contract B.2, completion predicates C1–C5): place every canonical word, in order, on the source
 * text of `nodes` (`collectMainAcceptedTextNodes`, DOM order), with no lookahead and no skip. Word i is placed at the
 * first occurrence in the current node whose gap from the previous placement holds no word; otherwise the node must
 * hold no further word and the search moves to the next node. Any word left unplaced, or any word-like text left over,
 * fails closed. A consumed count, `bookStamped` or an in-range index is not a certificate (LL-170).
 */
export function certifyCanonicalAlignment(
  nodes: readonly Text[],
  canonical: readonly string[],
): { ok: true; placements: CertifiedPlacement[] } | CertificationFailure {
  const placements: CertifiedPlacement[] = [];
  let k = 0;
  let pos = 0;
  for (let i = 0; i < canonical.length; i++) {
    const w = canonical[i];
    if (typeof w !== "string" || w === "") return { ok: false, reason: "invalid-canonical-word", canonicalIndex: i, nodeIndex: k };
    for (;;) {
      if (k >= nodes.length) return { ok: false, reason: "canonical-exhausted-dom", canonicalIndex: i, nodeIndex: k };
      const t = nodes[k].data;
      const j = t.indexOf(w, pos);
      if (j >= 0 && wordFree(t.slice(pos, j))) {
        placements.push({ i, node: k, start: j, end: j + w.length });
        pos = j + w.length;
        break;
      }
      if (!wordFree(t.slice(pos))) return { ok: false, reason: "unmatched-source-word", canonicalIndex: i, nodeIndex: k };
      k++;
      pos = 0;
    }
  }
  for (; k < nodes.length; k++, pos = 0) {
    if (!wordFree(nodes[k].data.slice(pos))) {
      return { ok: false, reason: "extra-source-text", canonicalIndex: canonical.length, nodeIndex: k };
    }
  }
  return { ok: true, placements };
}

/**
 * The certified branch (TQ-B3, amendment 1): wraps the placements node by node in DOM order, in time slices. After a
 * node, once the slice has run `WRAP_STAMP_SLICE_MS` and placements remain, it yields via setTimeout(0). Before each node
 * is wrapped its text is re-checked against the text certified (Q4, always present); on a mismatch, including a change
 * made during a yield, stamping stops, so no span sits at a stale offset, and `dom-changed` is reported as a second result.
 */
async function stampCertifiedPlacements(
  doc: Document,
  nodes: readonly Text[],
  canonical: readonly string[],
  placements: readonly CertifiedPlacement[],
  sectionIndex: number,
  globalOffset: number,
  onCertification: ((result: CertificationResult) => void) | undefined,
  betweenNodes: ((k: number) => void) | undefined,
  token: WrapToken,
): Promise<"done" | "superseded"> {
  const capturedText = nodes.map((node) => node.data);
  const tokenPartById = new Map<string, number>();
  let p = 0;
  let sliceStart = performance.now();
  while (p < placements.length) {
    const k = placements[p].node;
    const wordSpans: WrappedWordSpan[] = [];
    for (; p < placements.length && placements[p].node === k; p++) {
      const { i, start, end } = placements[p];
      wordSpans.push({ word: canonical[i], start, end, globalIndex: globalOffset + i, tokenId: makeFoliateTokenId(sectionIndex, i) });
    }
    if (wrapTokens.get(doc) !== token) return "superseded"; // stop with no report
    const node = nodes[k];
    const parent = node.parentNode;
    if (!node.isConnected || node.data !== capturedText[k] || !parent) {
      onCertification?.({ ok: false, reason: "dom-changed" });
      return "done";
    }
    const frag = buildWrappedFragmentForNode(doc, node.data, 0, wordSpans, tokenPartById);
    if (frag) parent.replaceChild(frag, node);
    if (p < placements.length) {
      betweenNodes?.(k);
      if (performance.now() - sliceStart >= WRAP_STAMP_SLICE_MS) {
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        sliceStart = performance.now();
      }
    }
  }
  return "done";
}

/** Remove all .page-word wrapper spans and restore their text as plain text nodes.
 *  Used by HOTFIX-10 to re-stamp sections with corrected global indices. */
export function unwrapWordSpans(doc: Document): void {
  wrapTokens.set(doc, { settled: null }); // amendment 1: supersedes any run on this document
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
 *  STAB-1A (BUG-162b): async batching keeps UI responsive during large section wraps.
 *
 *  BLOCK-TEXT-ORDER-1 (contract B.2): with a canonical slice, the section is first certified against its main-accepted
 *  text. A certified section is stamped on the certified source occurrences, in time slices; an uncertified one runs the
 *  legacy content-align path unchanged. `onCertification` is called exactly once, synchronously, before the first
 *  await: `{ok:false, reason:"no-canonical-slice"}` with no slice, `{ok:true}`, or the certifier's failure. A certified
 *  wrap whose DOM changed mid-stamp reports `{ok:false, reason:"dom-changed"}` second. `__testBetweenNodes` is a test
 *  hook run between the certified nodes; production never passes it. */
export function wrapWordsInSpans(
  doc: Document,
  sectionIndex: number,
  globalOffset: number,
  sectionWords: FoliateWord[] = [],
  canonicalWords?: string[],
  onCertification?: (result: CertificationResult) => void,
  options: { __testBetweenNodes?: (k: number) => void } = {},
): Promise<number> {
  const token: WrapToken = { settled: null };
  wrapTokens.set(doc, token); // amendment 1: supersedes any earlier run on this document
  token.settled = wrapRun(doc, sectionIndex, globalOffset, sectionWords, canonicalWords, onCertification, options, token);
  return token.settled;
}

async function wrapRun(
  doc: Document,
  sectionIndex: number,
  globalOffset: number,
  sectionWords: FoliateWord[],
  canonicalWords: string[] | undefined,
  onCertification: ((result: CertificationResult) => void) | undefined,
  options: { __testBetweenNodes?: (k: number) => void },
  token: WrapToken,
): Promise<number> {
  if (canonicalWords == null || canonicalWords.length === 0) {
    onCertification?.({ ok: false, reason: "no-canonical-slice" });
  } else {
    const nodes = collectMainAcceptedTextNodes(doc.body);
    const certified = certifyCanonicalAlignment(nodes, canonicalWords);
    if (certified.ok) {
      onCertification?.({ ok: true });
      const stamped = await stampCertifiedPlacements(doc, nodes, canonicalWords, certified.placements, sectionIndex, globalOffset, onCertification, options.__testBetweenNodes, token);
      if (stamped === "superseded") return liveRunOf(doc, globalOffset + canonicalWords.length);
      return globalOffset + canonicalWords.length;
    }
    onCertification?.(certified);
  }

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
      if (wrapTokens.get(doc) !== token) return liveRunOf(doc, useContentAlign ? globalOffset + canonicalCursor : globalIndex); // amendment 1: superseded, stop with no report
    }
  }

  return useContentAlign ? globalOffset + canonicalCursor : globalIndex;
}
