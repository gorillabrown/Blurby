// READER-VISUAL-DIAG-1 band probe (scratch, not committed): the reading-zone band against the cursor word.
(() => {
  const view = document.querySelector(".rm-focus-view, .rm-flow-view, .rm-narrate-view");
  if (!view) return JSON.stringify({ error: "no focus/flow view" });
  const cs = getComputedStyle(view);
  const vr = view.getBoundingClientRect();
  const pct = (v) => (v && v.trim().endsWith("%") ? parseFloat(v) / 100 : null);
  const topFrac = pct(view.style.getPropertyValue("--flow-zone-top") || cs.getPropertyValue("--flow-zone-top"));
  const botFrac = pct(view.style.getPropertyValue("--flow-zone-bottom") || cs.getPropertyValue("--flow-zone-bottom"));
  const band = topFrac == null ? null : { top: vr.top + vr.height * topFrac, bottom: vr.top + vr.height * botFrac };
  const fv = document.querySelector("foliate-view");
  const contents = fv?.renderer?.getContents?.() || [];
  let cursor = null, epub = null;
  for (const { doc } of contents) {
    const el = doc?.querySelector?.(".page-word--flow-cursor, .page-word--highlighted, .page-word--narrate-cursor");
    const frame = doc?.defaultView?.frameElement;
    const fr = frame ? frame.getBoundingClientRect() : { top: 0, left: 0 };
    const sample = el?.parentElement || doc?.querySelector?.("p");
    if (sample && !epub) {
      const ecs = doc.defaultView.getComputedStyle(sample);
      epub = { lineHeightCss: ecs.lineHeight, fontSizeCss: ecs.fontSize, frameZoom: doc.defaultView.devicePixelRatio };
    }
    if (el) {
      const r = el.getBoundingClientRect();
      // rendered line height: the vertical step between this word's line and the next different line top
      let lineStep = null;
      const spans = [...doc.querySelectorAll("[data-word-index]")];
      const i = spans.indexOf(el);
      for (let k = i + 1; k < Math.min(spans.length, i + 60); k++) {
        const t = spans[k].getBoundingClientRect().top;
        if (Math.abs(t - r.top) > 2) { lineStep = +(t - r.top).toFixed(1); break; }
      }
      cursor = { cls: el.className, text: el.textContent, wordIndex: Number(el.dataset.wordIndex), top: +(fr.top + r.top).toFixed(1), bottom: +(fr.top + r.bottom).toFixed(1), lineStep };
      break;
    }
  }
  const zoneHeightPx = band ? +(band.bottom - band.top).toFixed(1) : null;
  const inBand = band && cursor ? cursor.top >= band.top - 1 && cursor.bottom <= band.bottom + 1 : null;
  return JSON.stringify({
    mode: view.className, outerLineHeightCss: cs.lineHeight, viewTop: +vr.top.toFixed(1), viewHeight: +vr.height.toFixed(1),
    zoneTopPct: topFrac, zoneBottomPct: botFrac, bandTop: band && +band.top.toFixed(1), bandBottom: band && +band.bottom.toFixed(1),
    zoneHeightPx, epub, cursor, cursorInBand: inBand,
    linesInBand: cursor?.lineStep ? +(zoneHeightPx / cursor.lineStep).toFixed(2) : null,
    visible: document.visibilityState,
  });
})()
