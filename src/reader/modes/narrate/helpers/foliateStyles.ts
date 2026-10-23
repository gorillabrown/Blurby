import { BOOK_HEADING_LINE_HEIGHT, BOOK_TYPE_SCALE, FOLIATE_BASE_FONT_SIZE_PX } from "../../../../constants";
import type { BlurbySettings } from "../../../../types";

export interface FoliateStyleOptions {
  flowLeadingInsetPx?: number;
  flowTrailingInsetPx?: number;
}

/** Inject Blurby theme CSS into an EPUB document (inside the foliate iframe). */
export function injectStyles(
  doc: Document,
  settings: BlurbySettings,
  focusTextSize?: number,
  options: FoliateStyleOptions = {},
) {
  if (!doc?.head) return;

  const existing = doc.getElementById("blurby-theme");
  if (existing) existing.remove();

  const scale = (focusTextSize || 100) / 100;
  const fontSize = Math.round(FOLIATE_BASE_FONT_SIZE_PX * scale);
  const lineHeight = settings.layoutSpacing?.line || 1.8;
  const fontFamily = settings.fontFamily || "Georgia, serif";

  // Get computed CSS custom properties from the main document (single call to avoid layout thrashing)
  const rootStyles = getComputedStyle(document.documentElement);
  const bg = rootStyles.getPropertyValue("--bg").trim() || "#1a1a1a";
  const fg = rootStyles.getPropertyValue("--text").trim() || "#e0e0e0";
  const accent = rootStyles.getPropertyValue("--accent").trim() || "#FF5B7F";
  const leadingInsetPx = Math.max(0, Math.round(options.flowLeadingInsetPx ?? 0));
  const trailingInsetPx = Math.max(0, Math.round(options.flowTrailingInsetPx ?? 0));
  doc.documentElement.style.setProperty("--blurby-flow-leading-inset", `${leadingInsetPx}px`);
  doc.documentElement.style.setProperty("--blurby-flow-trailing-inset", `${trailingInsetPx}px`);

  const style = doc.createElement("style");
  style.id = "blurby-theme";
  style.textContent = `
    html, body {
      background: ${bg} !important;
      color: ${fg} !important;
      font-family: ${fontFamily} !important;
      font-size: ${fontSize}px !important;
      line-height: ${lineHeight} !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    /* BOOK-TEXT-COLOUR-1 (BUG-208): a book colour rule on a descendant (Gutenberg #pg-header div { color: initial })
       must not beat the theme colour; links keep the accent (a, below). Owner decision 2026-10-23. */
    body *:not(a) { color: inherit !important; }
    /* BOOK-TYPE-SCALE-1: one type scale for the book. rem is the reader's size (html, above), so nesting never compounds;
       inline elements (span, small, sup, sub, em, b) keep the book's sizing. Owner design 2026-10-23. */
    body *:not(pre):not(code):not(kbd):not(samp) { font-family: ${fontFamily} !important; }
    p, div, li, blockquote, dd, dt, td, th, figcaption, section, article { font-size: 1rem !important; }
    h1 { font-size: ${BOOK_TYPE_SCALE.h1}rem !important; }
    h2 { font-size: ${BOOK_TYPE_SCALE.h2}rem !important; }
    h3 { font-size: ${BOOK_TYPE_SCALE.h3}rem !important; }
    h4 { font-size: ${BOOK_TYPE_SCALE.h4}rem !important; }
    h5 { font-size: ${BOOK_TYPE_SCALE.h5}rem !important; }
    h6 { font-size: ${BOOK_TYPE_SCALE.h6}rem !important; }
    h1, h2, h3, h4, h5, h6 { font-weight: 700 !important; line-height: ${BOOK_HEADING_LINE_HEIGHT} !important; }
    body {
      padding-block-start: var(--blurby-flow-leading-inset, 0px) !important;
      padding-block-end: var(--blurby-flow-trailing-inset, 0px) !important;
      box-sizing: border-box !important;
    }
    ${settings.justifiedText !== false ? "p, div, li, blockquote, dd, dt, figcaption { text-align: justify !important; }" : ""}
    a { color: ${accent} !important; }
    img { max-width: 100%; height: auto; }
    ::selection { background: ${accent}33; }
    .page-word { cursor: pointer; border-radius: 4px; transition: background-color 120ms linear, box-shadow 120ms linear, color 120ms linear; }
    .page-word:hover { background: ${accent}22; }
    .page-word--highlighted { background: ${accent}4D; box-shadow: inset 0 -0.26em 0 ${accent}55; }
    .page-word--flow-cursor { border-bottom: 3px solid ${accent}; padding-bottom: 1px; }
    .page-word--narrate-cursor { background: ${accent}2E; box-shadow: inset 0 -0.18em 0 ${accent}80; border-radius: 2px; }
    .page-word--chunk-active {
      color: ${fg};
    }
    .page-word--active-word {
      background: ${accent}55;
      border-radius: 3px;
      box-shadow: 0 0 6px ${accent}40;
    }
    .page-word--glide-adj {
      background: ${accent}22;
      border-radius: 3px;
    }
  `;
  doc.head.appendChild(style);
}
