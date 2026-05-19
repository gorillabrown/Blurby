import { FOLIATE_BASE_FONT_SIZE_PX } from "../constants";
import type { BlurbySettings } from "../types";

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
    .page-word--chunk-active {
      background: color-mix(in srgb, var(--accent, #FF5B7F) 16%, transparent);
      border-radius: 4px;
      box-decoration-break: clone;
      -webkit-box-decoration-break: clone;
    }
    .page-word--active-word {
      font-weight: 800;
      color: var(--text, currentColor);
      background: color-mix(in srgb, var(--accent, #FF5B7F) 28%, transparent);
    }
  `;
  doc.head.appendChild(style);
}
