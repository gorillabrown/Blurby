import { FOLIATE_TWO_COLUMN_BREAKPOINT_PX } from "../../../../constants";

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
