import { FOLIATE_BASE_FONT_SIZE_PX } from "../constants";
import type { BlurbySettings } from "../types";

/** Inject Blurby theme CSS into an EPUB document (inside the foliate iframe). */
export function injectStyles(doc: Document, settings: BlurbySettings, focusTextSize?: number) {
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
  const accent = rootStyles.getPropertyValue("--accent").trim() || "#D04716";

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
    ${settings.justifiedText !== false ? "p, div, li, blockquote, dd, dt, figcaption { text-align: justify !important; }" : ""}
    a { color: ${accent} !important; }
    img { max-width: 100%; height: auto; }
    ::selection { background: ${accent}33; }
    .page-word { cursor: pointer; border-radius: 4px; transition: background-color 120ms linear, box-shadow 120ms linear, color 120ms linear; }
    .page-word:hover { background: ${accent}22; }
    .page-word--highlighted { background: ${accent}4D; box-shadow: inset 0 -0.26em 0 ${accent}55; }
.page-word--flow-cursor { border-bottom: 3px solid ${accent}; padding-bottom: 1px; }
  `;
  doc.head.appendChild(style);
}
