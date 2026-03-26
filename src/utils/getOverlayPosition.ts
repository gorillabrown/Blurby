export interface OverlayRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Get parent-window-relative position for a DOM Range inside foliate's iframe.
 * Foliate renders EPUB content in iframes. getBoundingClientRect() on a Range
 * inside an iframe returns coordinates relative to the IFRAME's viewport.
 * We add the iframe's own position to get parent-window coordinates.
 */
export function getOverlayPosition(
  range: Range,
  containerEl: HTMLElement,
  cachedIframeRef?: HTMLIFrameElement | null
): OverlayRect | null {
  if (!range.startContainer.isConnected) return null;

  try {
    const rangeRect = range.getBoundingClientRect();
    const rangeDoc = range.startContainer.ownerDocument;

    if (rangeDoc && rangeDoc !== document) {
      let iframe = cachedIframeRef;
      if (!iframe) {
        const iframes = containerEl.querySelectorAll("iframe");
        for (const f of iframes) {
          try {
            if (f.contentDocument === rangeDoc) { iframe = f; break; }
          } catch { /* cross-origin */ }
        }
      }
      if (iframe) {
        const iframeRect = iframe.getBoundingClientRect();
        return {
          top: iframeRect.top + rangeRect.top,
          left: iframeRect.left + rangeRect.left,
          width: rangeRect.width,
          height: rangeRect.height,
        };
      }
    }
    return { top: rangeRect.top, left: rangeRect.left, width: rangeRect.width, height: rangeRect.height };
  } catch {
    return null;
  }
}
