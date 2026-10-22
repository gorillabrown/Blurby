// main/pdf-text.js — The one PDF reader: text and info through pdf-parse 2
// CommonJS only — Electron main process

const { PDF_PARSE_TIMEOUT_MS } = require("./constants");

// ── Lazy-loaded heavy modules (cached after first require) ─────────────────
let _pdfParse, _canvas;
function getPDFParse() { if (!_pdfParse) { _pdfParse = require("pdf-parse"); } return _pdfParse; }
function getCanvas() { if (!_canvas) { try { _canvas = require("@napi-rs/canvas"); } catch { _canvas = null; } } return _canvas; }

/** pdf-parse 2 (PDF.js) needs DOMMatrix, ImageData and Path2D globals before it loads. */
function ensurePdfGlobals() {
  if (globalThis.DOMMatrix) return;
  try {
    const canvas = getCanvas();
    if (canvas) {
      globalThis.DOMMatrix = canvas.DOMMatrix;
      globalThis.ImageData = canvas.ImageData;
      globalThis.Path2D = canvas.Path2D;
    } else { throw new Error("canvas not available"); }
  } catch (canvasErr) {
    console.log("Note: @napi-rs/canvas not available, using polyfills for PDF parsing. Run 'npm rebuild @napi-rs/canvas' if PDF extraction has issues.");
    globalThis.DOMMatrix = globalThis.DOMMatrix || class DOMMatrix { constructor() { this.a=1;this.b=0;this.c=0;this.d=1;this.e=0;this.f=0; } };
    globalThis.ImageData = globalThis.ImageData || class ImageData { constructor(w,h) { this.width=w;this.height=h;this.data=new Uint8ClampedArray(w*h*4); } };
    globalThis.Path2D = globalThis.Path2D || class Path2D { };
  }
}

/**
 * Extract a PDF's text (pages joined by blank lines) and its Info dictionary.
 * Rejects with "PDF parse timeout" when the text is not ready within timeoutMs.
 * @returns {Promise<{ text: string, info: object }>}
 */
async function extractPdfText(buffer, { timeoutMs = PDF_PARSE_TIMEOUT_MS } = {}) {
  ensurePdfGlobals();
  const { PDFParse } = getPDFParse();
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("PDF parse timeout")), timeoutMs);
  });
  try {
    const result = await Promise.race([parser.getText({ pageJoiner: "\n\n" }), timeout]);
    let info = {};
    try {
      const infoResult = await Promise.race([parser.getInfo(), timeout]);
      info = (infoResult && infoResult.info) || {};
    } catch { /* Title and author are optional */ }
    return { text: result.text || "", info };
  } finally {
    clearTimeout(timeoutId);
    // Always destroy parser to prevent memory leaks
    if (typeof parser.destroy === "function") {
      try { await parser.destroy(); } catch { /* Best-effort cleanup */ }
    }
  }
}

module.exports = { ensurePdfGlobals, extractPdfText };
