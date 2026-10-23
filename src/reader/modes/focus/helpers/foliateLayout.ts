import {
  FLOW_BAND_ANCHOR_CENTER,
  FLOW_BAND_ANCHOR_TOP,
  FLOW_BAND_ANCHOR_TOP_THIRD,
  FLOW_ZONE_LINES_DEFAULT,
  FLOW_ZONE_LINES_OFF,
  FLOW_ZONE_LINES_OPTIONS,
  FOLIATE_TWO_COLUMN_BREAKPOINT_PX,
} from "../../../../constants";

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

/** R5: the band's line count, 3, 5 or 7, or 0 for Off; any other stored value (a legacy 4, 6 or 8) reads as 5. */
export function normalizeBandLines(value: unknown): number {
  if (value === FLOW_ZONE_LINES_OFF) return FLOW_ZONE_LINES_OFF;
  return (FLOW_ZONE_LINES_OPTIONS as readonly unknown[]).includes(value) ? (value as number) : FLOW_ZONE_LINES_DEFAULT;
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

/**
 * R1 + R2: the band around line `cursor`, covering n lines with the cursor line in the middle (fewer at a section's
 * start or end: only lines that exist). Each edge is the midpoint of the gap to the next line out, or the line's own
 * box edge at the first or last line. null for Off (n = 0) or a cursor outside the lines.
 */
export function computeBandEdges(lines: readonly BandLineBox[], cursor: number, n: number): { top: number; bottom: number; first: number; last: number } | null {
  if (n <= 0 || cursor < 0 || cursor >= lines.length) return null;
  const first = Math.max(0, cursor - Math.floor((n - 1) / 2));
  const last = Math.min(lines.length - 1, cursor + Math.ceil((n - 1) / 2));
  const top = first > 0 ? (lines[first - 1].bottom + lines[first].top) / 2 : lines[first].top;
  const bottom = last < lines.length - 1 ? (lines[last].bottom + lines[last + 1].top) / 2 : lines[last].bottom;
  return { top, bottom, first, last };
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
