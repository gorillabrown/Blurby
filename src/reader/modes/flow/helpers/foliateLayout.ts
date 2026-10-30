import {
  FLOW_BAND_ANCHOR_CENTER,
  FLOW_BAND_ANCHOR_TOP,
  FLOW_BAND_ANCHOR_TOP_THIRD,
  FLOW_ZONE_LINES_DEFAULT,
  FOLIATE_TWO_COLUMN_BREAKPOINT_PX,
} from "../../../../constants";
import { isParagraphBlock } from "./foliateParagraphStarts";

/**
 * Foliate's scrolled flow surface is shared by Flow and Narrate. That surface
 * must always stay single-column so the active chunk/word can be followed as
 * one infinite reading column. Paginated Page/Focus may still use two columns.
 */
export function getFoliateMaxColumnCount(flowSurfaceMode: boolean, containerWidth: number): "1" | "2" {
  if (flowSurfaceMode) return "1";
  return containerWidth >= FOLIATE_TWO_COLUMN_BREAKPOINT_PX ? "2" : "1";
}

/** The custom property a mode's FoliateView writes on its zone host: the loaded section's body line step (BAND-ALIGN-1). */
const ZONE_LINE_STEP_PROPERTY = "--zone-line-step-px";
/** The zone's line step when nothing better is known (unchanged from before BAND-ALIGN-1). */
const FALLBACK_LINE_STEP_PX = 24;

/**
 * The line step of a section's body text: the first body <p> with text, its computed line-height in px, or 1.2 × its
 * font size for `normal`. null when the section has no such <p> (an image-only section keeps the previous step).
 */
export function measureBodyLineStepPx(doc: Document): number | null {
  const p = Array.from(doc.body?.querySelectorAll("p") ?? []).find((el) => (el.textContent ?? "").trim().length > 0);
  if (!p) return null;
  const style = (doc.defaultView ?? window).getComputedStyle(p);
  const lineHeight = parseFloat(style.lineHeight);
  if (lineHeight > 0) return lineHeight;
  const fontSize = parseFloat(style.fontSize);
  return fontSize > 0 ? fontSize * 1.2 : null;
}

/** The reading zone's line step for an element: the measured --zone-line-step-px, else its line-height, else 24. */
export function readZoneLineStepPx(el: HTMLElement): number {
  const style = getComputedStyle(el);
  const measured = parseFloat(style.getPropertyValue(ZONE_LINE_STEP_PROPERTY) || el.style.getPropertyValue(ZONE_LINE_STEP_PROPERTY));
  if (measured > 0) return measured;
  return parseFloat(style.lineHeight) || FALLBACK_LINE_STEP_PX;
}

/** Write a measured step on the zone host. Returns true when a step was written. */
export function writeZoneLineStepPx(el: HTMLElement, doc: Document | null | undefined): boolean {
  const step = doc ? measureBodyLineStepPx(doc) : null;
  if (step === null) return false;
  el.style.setProperty(ZONE_LINE_STEP_PROPERTY, `${step}px`);
  return true;
}

// ── BAND-ALIGN-2: the reading band belongs to the reading location (owner amendment, 2026-10-23) ──

/** A rendered line's glyph box: its top and bottom in px, in one coordinate space. */
export interface BandLineBox {
  top: number;
  bottom: number;
}

/** R4: the band's anchor, Top (0), Top third (1/3) or Center (0.5); a legacy zone position (0.15, 0.25, …) reads as Top third. */
export function normalizeBandAnchor(value: unknown): number {
  return value === FLOW_BAND_ANCHOR_TOP || value === FLOW_BAND_ANCHOR_CENTER ? value : FLOW_BAND_ANCHOR_TOP_THIRD;
}

/** The scrollTop that puts a y (client px) at zoneTopFrac of the view height: floored at 0, capped at maxScrollTop. */
export function computeBandScrollTop({ scrollTop, lineTopPx, containerTopPx, viewportHeightPx, zoneTopFrac, maxScrollTop = Infinity }: {
  scrollTop: number;
  lineTopPx: number;
  containerTopPx: number;
  viewportHeightPx: number;
  zoneTopFrac: number;
  maxScrollTop?: number;
}): number {
  return Math.min(Math.max(0, maxScrollTop), Math.max(0, scrollTop + (lineTopPx - containerTopPx) - zoneTopFrac * viewportHeightPx));
}

/** Whether a line box lies inside the band. */
export function isLineInBand(lineTopPx: number, lineBottomPx: number, bandTopPx: number, bandBottomPx: number): boolean {
  return lineTopPx >= bandTopPx && lineBottomPx <= bandBottomPx;
}

/** R4: the anchor's y, px from the view's top. Top puts the band's top edge at the view's top, so the cursor line sits half a band down. */
export function bandAnchorY(anchor: number, viewportHeightPx: number, bandHeightPx: number): number {
  return anchor === FLOW_BAND_ANCHOR_TOP ? bandHeightPx / 2 : anchor * viewportHeightPx;
}

/** R7: the leading space above a section's first line: the anchor's y, so the first line can reach the anchor. */
export function computeLeadingInsetPx({ anchor, viewportHeightPx, lineStepPx, lines }: {
  anchor: number; viewportHeightPx: number; lineStepPx: number; lines: number;
}): number {
  if (viewportHeightPx <= 0) return 0;
  return Math.max(0, bandAnchorY(anchor, viewportHeightPx, lineStepPx * Math.max(lines, 1)));
}

/** R7 (owner Q1): the trailing space below a section's last line, mirroring the top: the view below the anchor. */
export function computeTrailingInsetPx({ anchor, viewportHeightPx, lineStepPx, lines }: {
  anchor: number; viewportHeightPx: number; lineStepPx: number; lines: number;
}): number {
  if (viewportHeightPx <= 0) return 0;
  return Math.max(0, viewportHeightPx - bandAnchorY(anchor, viewportHeightPx, lineStepPx * Math.max(lines, 1)));
}

/** R3 step 1: the scrollTop that puts the cursor line's centre at the anchor, clamped to the container's range. */
export function computeAnchorScrollTop({ scrollTop, lineTopPx, lineBottomPx, containerTopPx, viewportHeightPx, anchor, bandHeightPx, maxScrollTop }: {
  scrollTop: number;
  lineTopPx: number;
  lineBottomPx: number;
  containerTopPx: number;
  viewportHeightPx: number;
  anchor: number;
  bandHeightPx: number;
  maxScrollTop: number;
}): number {
  if (viewportHeightPx <= 0) return scrollTop;
  return computeBandScrollTop({
    scrollTop,
    lineTopPx: (lineTopPx + lineBottomPx) / 2,
    containerTopPx,
    viewportHeightPx,
    zoneTopFrac: bandAnchorY(anchor, viewportHeightPx, bandHeightPx) / viewportHeightPx,
    maxScrollTop,
  });
}

/** R8: the band over the cursor's paragraph: its line boxes, edges midway to the neighbouring blocks (else half a leading). */
export function computeParagraphBandEdges({ blockLines, prevBottom, nextTop, stepPx }: {
  blockLines: readonly BandLineBox[]; prevBottom: number | null; nextTop: number | null; stepPx: number;
}): { top: number; bottom: number } | null {
  if (blockLines.length === 0) return null;
  const first = blockLines[0], last = blockLines[blockLines.length - 1];
  const halfLead = (b: BandLineBox) => Math.max(0, stepPx - (b.bottom - b.top)) / 2;
  return {
    top: prevBottom !== null ? (prevBottom + first.top) / 2 : first.top - halfLead(first),
    bottom: nextTop !== null ? (last.bottom + nextTop) / 2 : last.bottom + halfLead(last),
  };
}

/**
 * R8: the cursor's paragraph, in the top window's client px (its iframe's offset added): the line boxes of the word
 * spans whose nearest block (isParagraphBlock, else the section's body) is the span's own, the bottom of the previous
 * word-bearing block's last line and the top of the next block's first line (null at the section's first or last
 * block). Lines are grouped as collectLineBoxesAround does. null when the span has no box.
 */
export function collectParagraphAround(span: Element): { blockLines: BandLineBox[]; prevBottom: number | null; nextTop: number | null; block: Element } | null {
  const doc = span.ownerDocument;
  if (!doc) return null;
  const frame = doc.defaultView?.frameElement as HTMLElement | null | undefined;
  const offset = frame ? frame.getBoundingClientRect().top : 0;
  const boxOf = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.height > 0 ? { top: r.top + offset, bottom: r.bottom + offset, height: r.height } : null;
  };
  if (!boxOf(span)) return null;
  const blockOf = (el: Element): Element => {
    for (let p = el.parentElement; p; p = p.parentElement) if (isParagraphBlock(p)) return p;
    return doc.body;
  };
  const block = blockOf(span);
  const spans = Array.from(doc.querySelectorAll("[data-word-index]"));
  const blocks = spans.map(blockOf);
  const i0 = blocks.indexOf(block);
  const i1 = blocks.lastIndexOf(block);
  if (i0 < 0) return null;
  const blockLines: BandLineBox[] = [];
  for (let k = i0; k <= i1; k++) {
    if (blocks[k] !== block) continue;
    const box = boxOf(spans[k]);
    if (!box) continue;
    const line = blockLines[blockLines.length - 1];
    if (line && Math.abs(box.top - line.top) <= box.height * 0.5) {
      line.top = Math.min(line.top, box.top);
      line.bottom = Math.max(line.bottom, box.bottom);
    } else {
      blockLines.push({ top: box.top, bottom: box.bottom });
    }
  }
  // The neighbouring block's adjacent line: from the nearest boxed span outside the block, the spans on its line.
  const adjacent = (from: number, step: 1 | -1): BandLineBox | null => {
    let line: BandLineBox | null = null;
    for (let k = from; k >= 0 && k < spans.length; k += step) {
      if (blocks[k] === block) continue;
      const box = boxOf(spans[k]);
      if (!box) continue;
      if (!line) { line = { top: box.top, bottom: box.bottom }; continue; }
      if (Math.abs(box.top - line.top) > box.height * 0.5) break;
      line.top = Math.min(line.top, box.top);
      line.bottom = Math.max(line.bottom, box.bottom);
    }
    return line;
  };
  const prev = adjacent(i0 - 1, -1);
  const next = adjacent(i1 + 1, 1);
  return { blockLines, prevBottom: prev ? prev.bottom : null, nextTop: next ? next.top : null, block };
}

/**
 * The rendered line boxes around a word span, in the top window's client px (its iframe's offset added), with the
 * span's own line at `cursor`: up to `reach` + 1 lines either side, so each band edge has the next line out.
 * Lines are grouped from the word spans of the span's own section document, as FlowScrollEngine.buildLineMap does.
 */
export function collectLineBoxesAround(span: Element, reach: number): { lines: BandLineBox[]; cursor: number } | null {
  const doc = span.ownerDocument;
  if (!doc) return null;
  const frame = doc.defaultView?.frameElement as HTMLElement | null | undefined;
  const offset = frame ? frame.getBoundingClientRect().top : 0;
  const spans = Array.from(doc.querySelectorAll("[data-word-index]"));
  const at = spans.indexOf(span);
  if (at < 0) return null;
  const boxOf = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.height > 0 ? { top: r.top + offset, bottom: r.bottom + offset, height: r.height } : null;
  };
  const own = boxOf(span);
  if (!own) return null;
  const walk = (step: 1 | -1): BandLineBox[] => {
    const out: BandLineBox[] = [{ top: own.top, bottom: own.bottom }];
    for (let k = at + step; k >= 0 && k < spans.length; k += step) {
      const box = boxOf(spans[k]);
      if (!box) continue;
      const line = out[out.length - 1];
      if (Math.abs(box.top - line.top) <= box.height * 0.5) {
        line.top = Math.min(line.top, box.top);
        line.bottom = Math.max(line.bottom, box.bottom);
        continue;
      }
      if (out.length === reach + 2) break;
      out.push({ top: box.top, bottom: box.bottom });
    }
    return out;
  };
  const up = walk(-1);
  const down = walk(1);
  const cursorLine = { top: Math.min(up[0].top, down[0].top), bottom: Math.max(up[0].bottom, down[0].bottom) };
  return { lines: [...up.slice(1).reverse(), cursorLine, ...down.slice(1)], cursor: up.length - 1 };
}
