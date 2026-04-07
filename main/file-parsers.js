// main/file-parsers.js — File content extraction for all supported formats
// CommonJS only — Electron main process

const path = require("path");
const fsPromises = require("fs/promises");
const {
  PDF_PARSE_TIMEOUT_MS,
  MIN_PRINTABLE_RATIO,
  MIN_TEXT_LENGTH,
  MAX_MOBI_TEXT_BYTES,
  EPUB_HEADING_MAX_LENGTH,
  EPUB_CHAPTER_CACHE_MAX,
} = require("./constants");

// ── Lazy-loaded heavy modules (cached after first require) ─────────────────
let _cheerio, _admZip, _pdfParse, _canvas;
function getCheerio() { if (!_cheerio) { _cheerio = require("cheerio"); } return _cheerio; }
function getAdmZip() { if (!_admZip) { _admZip = require("adm-zip"); } return _admZip; }
function getPDFParse() { if (!_pdfParse) { _pdfParse = require("pdf-parse"); } return _pdfParse; }
function getCanvas() { if (!_canvas) { try { _canvas = require("@napi-rs/canvas"); } catch { _canvas = null; } } return _canvas; }

// ── Image validation helpers ───────────────────────────────────────────────

/** Validate image data by checking magic bytes. Returns extension or null. */
function validateImageMagicBytes(buffer) {
  if (!buffer || buffer.length < 4) return null;
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return ".jpg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return ".png";
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return ".gif";
  return null;
}

// ── Word count utility ────────────────────────────────────────────────────
function countWords(text) {
  if (!text) return 0;
  let count = 0, inWord = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    const isSpace = ch <= 32;
    if (!isSpace && !inWord) count++;
    inWord = !isSpace;
  }
  return count;
}

// ── MOBI/PDB Parser ────────────────────────────────────────────────────────

function palmDocDecompress(data) {
  // Pre-allocate buffer (PalmDOC records decompress to ~4096 bytes typically)
  let output = Buffer.alloc(4096 * 2);
  let pos = 0;

  function ensureCapacity(need) {
    if (pos + need > output.length) {
      const newBuf = Buffer.alloc(Math.max(output.length * 2, pos + need));
      output.copy(newBuf);
      output = newBuf;
    }
  }

  let i = 0;
  while (i < data.length) {
    const byte = data[i++];
    if (byte === 0) {
      ensureCapacity(1);
      output[pos++] = 0;
    } else if (byte >= 1 && byte <= 8) {
      ensureCapacity(byte);
      for (let j = 0; j < byte && i < data.length; j++) {
        output[pos++] = data[i++];
      }
    } else if (byte >= 9 && byte <= 0x7f) {
      ensureCapacity(1);
      output[pos++] = byte;
    } else if (byte >= 0xc0) {
      ensureCapacity(2);
      output[pos++] = 0x20; // space
      output[pos++] = byte ^ 0x80;
    } else {
      // byte 0x80-0xBF: LZ77 back-reference
      if (i >= data.length) break;
      const next = data[i++];
      const distance = ((byte << 8) | next) >> 3 & 0x7ff;
      const length = (next & 0x07) + 3;
      ensureCapacity(length);
      for (let j = 0; j < length; j++) {
        const srcPos = pos - distance;
        output[pos++] = srcPos >= 0 ? output[srcPos] : 0;
      }
    }
  }
  return output.slice(0, pos).toString("utf-8");
}

function parseMobiContent(buffer) {
  try {
    if (buffer.length < 78) return null;
    const numRecords = buffer.readUInt16BE(76);
    if (numRecords < 2) return null;

    const recordOffsets = [];
    for (let i = 0; i < numRecords; i++) {
      const offset = buffer.readUInt32BE(78 + i * 8);
      recordOffsets.push(offset);
    }

    const rec0Start = recordOffsets[0];
    if (rec0Start + 16 > buffer.length) return null;

    const compression = buffer.readUInt16BE(rec0Start);
    const textRecordCount = buffer.readUInt16BE(rec0Start + 8);

    const encryption = buffer.readUInt16BE(rec0Start + 12);
    if (encryption !== 0) {
      console.log("MOBI file is DRM-encrypted, cannot extract text");
      return null;
    }

    if (compression === 17480) {
      console.log("MOBI file uses HUFF/CDIC compression (unsupported)");
      return null;
    }

    const maxTextBytes = MAX_MOBI_TEXT_BYTES;

    const textParts = [];
    let totalBytes = 0;
    for (let i = 1; i <= textRecordCount && i < numRecords; i++) {
      const start = recordOffsets[i];
      const end = (i + 1 < numRecords) ? recordOffsets[i + 1] : buffer.length;
      if (start >= buffer.length || end > buffer.length || start >= end) continue;
      const recordData = buffer.slice(start, end);

      if (compression === 1) {
        textParts.push(recordData.toString("utf-8"));
      } else if (compression === 2) {
        textParts.push(palmDocDecompress(recordData));
      } else {
        textParts.push(recordData.toString("utf-8"));
      }
      totalBytes += (textParts[textParts.length - 1] || "").length;
      if (totalBytes > maxTextBytes) break;
    }

    const html = textParts.join("");
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
      .replace(/\r\n/g, "\n")
      .replace(/ {2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    return text || null;
  } catch (err) {
    console.error("MOBI parse error:", err.message);
    return null;
  }
}

function parseMobiMetadata(buffer) {
  try {
    if (buffer.length < 78) return {};
    const rec0Start = buffer.readUInt32BE(78);
    const mobiHeaderStart = rec0Start + 16;
    if (mobiHeaderStart + 116 > buffer.length) return {};

    const magic = buffer.toString("ascii", mobiHeaderStart, mobiHeaderStart + 4);
    if (magic !== "MOBI") return {};

    const mobiHeaderLength = buffer.readUInt32BE(mobiHeaderStart + 4);
    const encoding = buffer.readUInt32BE(mobiHeaderStart + 12);
    const exthFlag = buffer.readUInt32BE(mobiHeaderStart + 112);

    const result = { encoding: encoding === 65001 ? "utf-8" : "cp1252" };

    if (exthFlag & 0x40) {
      const exthStart = mobiHeaderStart + mobiHeaderLength;
      if (exthStart + 12 > buffer.length) return result;
      const exthMagic = buffer.toString("ascii", exthStart, exthStart + 4);
      if (exthMagic !== "EXTH") return result;

      const recordCount = buffer.readUInt32BE(exthStart + 8);
      let offset = exthStart + 12;
      for (let i = 0; i < recordCount && offset + 8 <= buffer.length; i++) {
        const recType = buffer.readUInt32BE(offset);
        const recLen = buffer.readUInt32BE(offset + 4);
        if (recLen < 8 || offset + recLen > buffer.length) break;
        const recData = buffer.slice(offset + 8, offset + recLen).toString("utf-8");
        if (recType === 100) result.author = recData;
        if (recType === 503) result.title = recData;
        if (recType === 201) result.coverOffset = buffer.readUInt32BE(offset + 8);
        offset += recLen;
      }
    }

    if (!result.title) {
      const pdbTitle = buffer.toString("ascii", 0, 32).replace(/\0.*/, "").trim();
      if (pdbTitle) result.title = pdbTitle;
    }

    return result;
  } catch { /* Expected: MOBI metadata parsing is best-effort */ }
  return {};
}

async function extractMobiCover(buffer, docId, userDataPath) {
  try {
    const rec0Start = buffer.readUInt32BE(78);
    const mobiHeaderStart = rec0Start + 16;
    if (mobiHeaderStart + 116 > buffer.length) return null;

    const magic = buffer.toString("ascii", mobiHeaderStart, mobiHeaderStart + 4);
    if (magic !== "MOBI") return null;

    const mobiHeaderLength = buffer.readUInt32BE(mobiHeaderStart + 4);
    const exthFlag = buffer.readUInt32BE(mobiHeaderStart + 112);
    const firstImageRecord = buffer.readUInt32BE(mobiHeaderStart + 92);

    let coverRecordOffset = -1;

    if (exthFlag & 0x40) {
      const exthStart = mobiHeaderStart + mobiHeaderLength;
      if (exthStart + 12 <= buffer.length) {
        const exthMagic = buffer.toString("ascii", exthStart, exthStart + 4);
        if (exthMagic === "EXTH") {
          const recordCount = buffer.readUInt32BE(exthStart + 8);
          let offset = exthStart + 12;
          for (let i = 0; i < recordCount && offset + 8 <= buffer.length; i++) {
            const recType = buffer.readUInt32BE(offset);
            const recLen = buffer.readUInt32BE(offset + 4);
            if (recLen < 8 || offset + recLen > buffer.length) break;
            if (recType === 201) {
              coverRecordOffset = buffer.readUInt32BE(offset + 8);
              break;
            }
            offset += recLen;
          }
        }
      }
    }

    const numRecords = buffer.readUInt16BE(76);
    const coverRecordIdx = coverRecordOffset >= 0 ? firstImageRecord + coverRecordOffset : firstImageRecord;
    if (coverRecordIdx <= 0 || coverRecordIdx >= numRecords) return null;

    const recordStart = buffer.readUInt32BE(78 + coverRecordIdx * 8);
    const recordEnd = (coverRecordIdx + 1 < numRecords) ? buffer.readUInt32BE(78 + (coverRecordIdx + 1) * 8) : buffer.length;
    const imageData = buffer.slice(recordStart, recordEnd);

    const ext = validateImageMagicBytes(imageData);
    if (!ext) return null;

    const coversDir = path.join(userDataPath, "covers");
    await fsPromises.mkdir(coversDir, { recursive: true });
    const coverPath = path.join(coversDir, `${docId}${ext}`);
    await fsPromises.writeFile(coverPath, imageData);
    return coverPath;
  } catch (err) {
    console.log("MOBI cover extraction failed:", err.message);
    return null;
  }
}

async function parseCallibreOpf(filepath) {
  try {
    const dir = path.dirname(filepath);
    const opfPath = path.join(dir, "metadata.opf");
    try { await fsPromises.access(opfPath); } catch { return null; }
    const cheerio = getCheerio();
    const opfContent = await fsPromises.readFile(opfPath, "utf-8");
    const $ = cheerio.load(opfContent, { xmlMode: true });
    const title = $("dc\\:title, title").first().text().trim() || null;
    const author = $("dc\\:creator, creator").first().text().trim() || null;
    let coverPath = null;
    const coverRef = $('reference[type="cover"]').attr("href") || $('meta[name="cover"]').attr("content");
    const candidatePaths = [
      coverRef ? path.join(dir, coverRef) : null,
      path.join(dir, "cover.jpg"),
      path.join(dir, "cover.jpeg"),
      path.join(dir, "cover.png"),
    ].filter(Boolean);
    for (const p of candidatePaths) {
      if (p) { try { await fsPromises.access(p); coverPath = p; break; } catch { /* Expected: probing for cover file existence */ } }
    }
    return { title, author, coverPath };
  } catch { /* Expected: Calibre OPF parsing is best-effort */ }
  return null;
}

// EPUB chapter cache shared across extractions (LRU, bounded)
const epubChapterCache = new Map();

function epubChapterCacheSet(key, value) {
  // Delete first so re-insertion moves it to end (most recent)
  if (epubChapterCache.has(key)) epubChapterCache.delete(key);
  epubChapterCache.set(key, value);
  // Evict oldest entry if over limit
  if (epubChapterCache.size > EPUB_CHAPTER_CACHE_MAX) {
    const oldest = epubChapterCache.keys().next().value;
    epubChapterCache.delete(oldest);
  }
}

function epubChapterCacheGet(key) {
  if (!epubChapterCache.has(key)) return undefined;
  // Promote to most recently used by delete-and-reinsert
  const value = epubChapterCache.get(key);
  epubChapterCache.delete(key);
  epubChapterCache.set(key, value);
  return value;
}

function clearChapterCache(docId) {
  // docId could be a filepath key; also search by value if needed
  if (epubChapterCache.has(docId)) {
    epubChapterCache.delete(docId);
  }
}

/** @deprecated Use epub-converter.js convertToEpub() for new imports. This function remains for pre-conversion docs loaded via load-doc-content. */
async function extractContent(filepath) {
  const ext = path.extname(filepath).toLowerCase();
  try {
    if (ext === ".pdf") {
      if (!globalThis.DOMMatrix) {
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
      const { PDFParse } = getPDFParse();
      const buffer = await fsPromises.readFile(filepath);
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      let timeoutId;
      const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("PDF parse timeout")), PDF_PARSE_TIMEOUT_MS);
      });
      try {
        const result = await Promise.race([parser.getText({ pageJoiner: "\n\n" }), timeout]);
        clearTimeout(timeoutId);
        const text = result.text || "";
        const printableRatio = text.replace(/[\x00-\x1f\x7f-\x9f]/g, "").length / (text.length || 1);
        if (printableRatio < MIN_PRINTABLE_RATIO || text.length < MIN_TEXT_LENGTH) {
          console.log(`PDF extraction yielded non-text content for ${filepath} (${Math.round(printableRatio*100)}% printable)`);
          return { userError: "Could not read this PDF — it may be image-based or contain no selectable text." };
        }
        return text;
      } catch (err) {
        clearTimeout(timeoutId);
        const isEncrypted = err.message && (err.message.toLowerCase().includes("encrypt") || err.message.toLowerCase().includes("password"));
        const isTimeout = err.message && err.message.includes("timeout");
        const userMessage = isEncrypted
          ? "Could not read this PDF — the file is encrypted or password-protected."
          : isTimeout
            ? "Could not read this PDF — it timed out. The file may be very large or corrupted."
            : "Could not read this PDF — the file may be encrypted or corrupted.";
        console.error(`PDF extraction failed for ${filepath}:`, err.message);
        return { userError: userMessage };
      } finally {
        // Always destroy parser to prevent memory leaks
        try { await parser.destroy(); } catch { /* Best-effort cleanup */ }
      }
    }
    if (ext === ".epub") {
      let zip;
      try {
        const AdmZip = getAdmZip();
        zip = new AdmZip(filepath);
      } catch (err) {
        const msg = err.message || "";
        const userMessage = msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("zip")
          ? "Could not open this EPUB — the file appears to be a corrupted ZIP archive."
          : "Could not open this EPUB — the file may be corrupted.";
        console.error(`EPUB ZIP open failed for ${filepath}:`, msg);
        return { userError: userMessage };
      }
      const AdmZip = getAdmZip();
      const cheerio = getCheerio();
      const entries = zip.getEntries();
      const containerEntry = entries.find((e) => e.entryName.endsWith("container.xml"));
      let opfPath = "";
      if (containerEntry) {
        const $ = cheerio.load(containerEntry.getData().toString("utf-8"), { xmlMode: true });
        opfPath = $("rootfile").attr("full-path") || "";
      }
      const opfEntry = entries.find((e) => e.entryName === opfPath);
      if (!opfEntry) {
        const userMessage = opfPath
          ? `Could not open this EPUB — the content manifest (${opfPath}) is missing or invalid.`
          : "Could not open this EPUB — missing content.opf (the file structure is invalid).";
        console.error(`EPUB missing OPF for ${filepath}: opfPath=${opfPath || "(none)"}`);
        return { userError: userMessage };
      }
      const spineIds = [];
      const manifestMap = new Map();
      const hrefToId = new Map();
      let tocHref = null;
      let ncxHref = null;
      if (opfEntry) {
        const opfDir = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1) : "";
        const $ = cheerio.load(opfEntry.getData().toString("utf-8"), { xmlMode: true });
        $("manifest item").each((_, el) => {
          const id = $(el).attr("id");
          const href = $(el).attr("href");
          const mediaType = $(el).attr("media-type") || "";
          if (id && href) {
            const fullHref = opfDir + href;
            manifestMap.set(id, fullHref);
            hrefToId.set(fullHref, id);
            if ($(el).attr("properties")?.includes("nav")) tocHref = fullHref;
            if (mediaType === "application/x-dtbncx+xml") ncxHref = fullHref;
          }
        });
        $("spine itemref").each((_, el) => {
          const idref = $(el).attr("idref");
          if (idref) spineIds.push(idref);
        });
        const spineToc = $("spine").attr("toc");
        if (spineToc && !ncxHref) ncxHref = manifestMap.get(spineToc);
      }

      const tocMap = new Map();
      try {
        if (tocHref) {
          const navEntry = entries.find((e) => e.entryName === tocHref);
          if (navEntry) {
            const navDir = tocHref.includes("/") ? tocHref.substring(0, tocHref.lastIndexOf("/") + 1) : "";
            const $ = cheerio.load(navEntry.getData().toString("utf-8"));
            $('nav[*|type="toc"] a, nav#toc a, nav.toc a').each((_, el) => {
              const href = $(el).attr("href");
              const title = $(el).text().trim();
              if (href && title) {
                const fullHref = navDir + href.split("#")[0];
                tocMap.set(fullHref, title);
              }
            });
          }
        }
        if (tocMap.size === 0 && ncxHref) {
          const ncxEntry = entries.find((e) => e.entryName === ncxHref);
          if (ncxEntry) {
            const ncxDir = ncxHref.includes("/") ? ncxHref.substring(0, ncxHref.lastIndexOf("/") + 1) : "";
            const $ = cheerio.load(ncxEntry.getData().toString("utf-8"), { xmlMode: true });
            $("navPoint").each((_, el) => {
              const title = $(el).find("> navLabel > text").first().text().trim();
              const src = $(el).find("> content").attr("src");
              if (title && src) {
                const fullSrc = ncxDir + src.split("#")[0];
                tocMap.set(fullSrc, title);
              }
            });
          }
        }
      } catch (tocErr) {
        if (!tocErr.message?.includes("Namespaced attributes")) {
          console.log("EPUB TOC parse error (non-fatal):", tocErr.message);
        }
      }

      const texts = [];
      const chapters = [];
      let charOffset = 0;
      const processedPaths = new Set();
      for (const id of spineIds) {
        const href = manifestMap.get(id);
        if (!href) continue;
        const entry = entries.find((e) => e.entryName === href);
        if (!entry || processedPaths.has(href)) continue;
        processedPaths.add(href);
        const $ = cheerio.load(entry.getData().toString("utf-8"));
        $("script, style").remove();
        // Remove EPUB page-break markers, editorial annotations, and hidden metadata
        $(".pb, .pagebreak, [role='doc-pagebreak'], [epub\\:type='pagebreak']").remove();
        // Insert newlines before block elements to preserve paragraph/heading structure
        $("p, div, h1, h2, h3, h4, h5, h6, br, li, blockquote, tr, dt, dd, figcaption, section, article").each((_, el) => {
          $(el).before("\n");
          $(el).after("\n");
        });
        // Add extra break after headings for visual separation
        $("h1, h2, h3, h4, h5, h6").each((_, el) => {
          $(el).after("\n");
        });
        // Add bullet markers for list items
        $("li").each((_, el) => {
          $(el).prepend("• ");
        });
        let text = $("body").text().trim();
        // Strip residual page markers (e.g., "Edition: current; Page: [vi]")
        text = text.replace(/Edition:\s*current;\s*Page:\s*\[[^\]]*\]/g, "");
        // Collapse excessive blank lines (3+ → 2)
        text = text.replace(/\n{3,}/g, "\n\n").trim();
        if (!text) continue;

        const chapterTitle = tocMap.get(href);
        if (chapterTitle) {
          chapters.push({ title: chapterTitle, charOffset });
        } else {
          const heading = $("h1, h2").first().text().trim();
          if (heading && heading.length < EPUB_HEADING_MAX_LENGTH) {
            chapters.push({ title: heading, charOffset });
          }
        }

        texts.push(text);
        charOffset += text.length + 2;
      }

      const fullText = texts.join("\n\n") || null;
      if (fullText && chapters.length > 1) {
        epubChapterCacheSet(filepath, chapters);
      }
      return fullText;
    }
    if (ext === ".mobi" || ext === ".azw3" || ext === ".azw") {
      const buffer = await fsPromises.readFile(filepath);
      const text = parseMobiContent(buffer);
      if (text && text.length > MIN_TEXT_LENGTH) return text;
      return null;
    }
    if (ext === ".html" || ext === ".htm") {
      const html = await fsPromises.readFile(filepath, "utf-8");
      const cheerio = getCheerio();
      const $ = cheerio.load(html);
      $("script, style, nav, footer, header, aside").remove();
      // Preserve block structure (same as EPUB parser)
      $("p, div, h1, h2, h3, h4, h5, h6, br, li, blockquote, tr, dt, dd, section, article").each((_, el) => {
        $(el).before("\n"); $(el).after("\n");
      });
      $("h1, h2, h3, h4, h5, h6").each((_, el) => { $(el).after("\n"); });
      $("li").each((_, el) => { $(el).prepend("• "); });
      let htmlText = $("body").text().trim() || $.text().trim() || null;
      if (htmlText) htmlText = htmlText.replace(/\n{3,}/g, "\n\n").trim();
      return htmlText;
    }
    // Plain text formats
    return await readFileContentAsync(filepath);
  } catch (err) {
    console.log(`Content extraction failed for ${filepath}, falling back to plain text:`, err.message);
    // For PDF/EPUB errors, don't fall back to plain text — they are binary formats
    const ext2 = path.extname(filepath).toLowerCase();
    if (ext2 === ".pdf" || ext2 === ".epub") {
      return { userError: "Could not read this file — it may be corrupted or in an unsupported format." };
    }
    return await readFileContentAsync(filepath);
  }
}

async function readFileContentAsync(filepath) {
  try { return await fsPromises.readFile(filepath, "utf-8"); } catch { return null; /* Expected: file may be inaccessible or binary */ }
}

// ── EPUB metadata extraction ───────────────────────────────────────────────────

async function extractEpubCover(filepath, docId, dataPath) {
  try {
    const AdmZip = getAdmZip();
    const zip = new AdmZip(filepath);
    const entries = zip.getEntries();

    const containerEntry = entries.find((e) => e.entryName.endsWith("container.xml"));
    let opfPath = "";
    if (containerEntry) {
      const cheerio = getCheerio();
      const $ = cheerio.load(containerEntry.getData().toString("utf-8"), { xmlMode: true });
      opfPath = $("rootfile").attr("full-path") || "";
    }

    const opfEntry = entries.find((e) => e.entryName === opfPath);
    let coverEntry = null;

    if (opfEntry) {
      const cheerio = getCheerio();
      const opfDir = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1) : "";
      const $ = cheerio.load(opfEntry.getData().toString("utf-8"), { xmlMode: true });

      let coverHref = null;
      $("manifest item").each((_, el) => {
        const id = ($(el).attr("id") || "").toLowerCase();
        const mediaType = ($(el).attr("media-type") || "").toLowerCase();
        const href = $(el).attr("href");
        if (id.includes("cover") && mediaType.startsWith("image/") && href && !coverHref) {
          coverHref = opfDir + href;
        }
      });

      if (!coverHref) {
        let coverId = null;
        $("meta[name='cover']").each((_, el) => {
          coverId = $(el).attr("content");
        });
        if (coverId) {
          $("manifest item").each((_, el) => {
            if ($(el).attr("id") === coverId) {
              coverHref = opfDir + $(el).attr("href");
            }
          });
        }
      }

      if (coverHref) {
        coverEntry = entries.find((e) => e.entryName === coverHref);
      }
    }

    if (!coverEntry) {
      const commonNames = ["cover.jpg", "cover.jpeg", "cover.png", "images/cover.jpg", "images/cover.jpeg", "images/cover.png", "OEBPS/cover.jpg", "OEBPS/images/cover.jpg"];
      for (const name of commonNames) {
        coverEntry = entries.find((e) => e.entryName.toLowerCase() === name.toLowerCase());
        if (coverEntry) break;
      }
    }

    if (!coverEntry) return null;

    const coverData = coverEntry.getData();
    const ext = validateImageMagicBytes(coverData);
    if (!ext) return null; // Skip cover if not a valid image format

    const coversDir = path.join(dataPath, "covers");
    await fsPromises.mkdir(coversDir, { recursive: true });
    const coverFilePath = path.join(coversDir, `${docId}${ext}`);
    await fsPromises.writeFile(coverFilePath, coverData);
    return coverFilePath;
  } catch (err) {
    console.log("EPUB cover extraction failed:", err.message);
    return null;
  }
}

async function extractEpubMetadata(filepath) {
  try {
    const AdmZip = getAdmZip();
    const cheerio = getCheerio();
    const zip = new AdmZip(filepath);
    const entries = zip.getEntries();

    const containerEntry = entries.find((e) => e.entryName.endsWith("container.xml"));
    let opfPath = "";
    if (containerEntry) {
      const $ = cheerio.load(containerEntry.getData().toString("utf-8"), { xmlMode: true });
      opfPath = $("rootfile").attr("full-path") || "";
    }

    const opfEntry = entries.find((e) => e.entryName === opfPath);
    if (!opfEntry) return { title: null, author: null };

    const $ = cheerio.load(opfEntry.getData().toString("utf-8"), { xmlMode: true });
    const creator = $("dc\\:creator, creator").first().text().trim();
    const title = $("dc\\:title, title").first().text().trim();
    return { title: title || null, author: creator || null };
  } catch { /* Expected: EPUB metadata extraction is best-effort */ }
  return { title: null, author: null };
}

function extractAuthorFromFilename(filename) {
  const base = path.basename(filename, path.extname(filename));
  const match = base.match(/^(.+?)\s+-\s+(.+)$/);
  return match ? match[2].trim() : null;
}

function extractTitleFromFilename(filename, author) {
  const base = path.basename(filename, path.extname(filename));
  if (author) {
    const match = base.match(/^(.+?)\s+-\s+.+$/);
    if (match) return match[1].trim();
  }
  return base;
}

/**
 * Consolidated metadata extraction for all supported book formats.
 * Extracts title, author, and cover from EPUB/MOBI/AZW files,
 * falling back to filename-based extraction.
 *
 * @param {string} filepath - Path to the book file
 * @param {string} docId - Unique document ID (used for cover filename)
 * @param {string} dataPath - Path to app data directory (for cover storage)
 * @returns {Promise<{title: string|null, author: string|null, coverPath: string|null}>}
 */
async function extractDocMetadata(filepath, docId, dataPath) {
  const ext = path.extname(filepath).toLowerCase();
  const filename = path.basename(filepath);
  let author = null;
  let bookTitle = null;
  let coverPath = null;

  if (ext === ".epub") {
    const meta = await extractEpubMetadata(filepath);
    author = meta.author;
    bookTitle = meta.title;
    coverPath = await extractEpubCover(filepath, docId, dataPath);
  } else if (ext === ".mobi" || ext === ".azw3" || ext === ".azw") {
    // Try Calibre OPF sidecar first
    const opfMeta = await parseCallibreOpf(filepath);
    if (opfMeta) {
      author = opfMeta.author;
      bookTitle = opfMeta.title;
      if (opfMeta.coverPath) {
        const coversDir = path.join(dataPath, "covers");
        await fsPromises.mkdir(coversDir, { recursive: true });
        const coverExt = path.extname(opfMeta.coverPath);
        const destCover = path.join(coversDir, `${docId}${coverExt}`);
        try { await fsPromises.copyFile(opfMeta.coverPath, destCover); coverPath = destCover; } catch {}
      }
    }
    // Fill gaps from MOBI binary metadata
    if (!author || !bookTitle || !coverPath) {
      const buf = await fsPromises.readFile(filepath);
      const mobiMeta = parseMobiMetadata(buf);
      if (!author) author = mobiMeta.author;
      if (!bookTitle) bookTitle = mobiMeta.title;
      if (!coverPath) coverPath = await extractMobiCover(buf, docId, dataPath);
    }
  }

  // Fall back to filename-based extraction
  if (!author) author = extractAuthorFromFilename(filename);
  if (!bookTitle) bookTitle = extractTitleFromFilename(filename, author);

  return { title: bookTitle, author: author || null, coverPath: coverPath || null };
}

/**
 * Extract raw HTML from MOBI text records (preserves formatting tags).
 * Returns the HTML string before tag-stripping, or null on failure.
 */
function parseMobiHtml(buffer) {
  try {
    if (buffer.length < 78) return null;
    const numRecords = buffer.readUInt16BE(76);
    if (numRecords < 2) return null;

    const recordOffsets = [];
    for (let i = 0; i < numRecords; i++) {
      const offset = buffer.readUInt32BE(78 + i * 8);
      recordOffsets.push(offset);
    }

    const rec0Start = recordOffsets[0];
    if (rec0Start + 16 > buffer.length) return null;

    const compression = buffer.readUInt16BE(rec0Start);
    const textRecordCount = buffer.readUInt16BE(rec0Start + 8);
    const encryption = buffer.readUInt16BE(rec0Start + 12);
    if (encryption !== 0) return null;
    if (compression === 17480) return null; // HUFF/CDIC

    const textParts = [];
    for (let i = 1; i <= textRecordCount && i < numRecords; i++) {
      const start = recordOffsets[i];
      const end = (i + 1 < numRecords) ? recordOffsets[i + 1] : buffer.length;
      if (start >= buffer.length || end > buffer.length || start >= end) continue;
      const recordData = buffer.slice(start, end);
      if (compression === 2) {
        textParts.push(palmDocDecompress(recordData));
      } else {
        textParts.push(recordData.toString("utf-8"));
      }
    }

    const html = textParts.join("");
    // Clean up but preserve formatting tags
    const cleaned = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "");
    return cleaned || null;
  } catch {
    return null;
  }
}

/**
 * Extract image records from MOBI binary.
 * MOBI stores images in records after the text records.
 * Returns array of { buffer, ext } objects.
 */
function extractMobiImages(buffer) {
  const images = [];
  try {
    if (buffer.length < 78) return images;
    const numRecords = buffer.readUInt16BE(76);
    if (numRecords < 2) return images;

    const recordOffsets = [];
    for (let i = 0; i < numRecords; i++) {
      const offset = buffer.readUInt32BE(78 + i * 8);
      recordOffsets.push(offset);
    }

    const rec0Start = recordOffsets[0];
    if (rec0Start + 16 > buffer.length) return images;
    const textRecordCount = buffer.readUInt16BE(rec0Start + 8);

    // Image records start after text records + 1 (record 0 is header)
    const firstImageRecord = textRecordCount + 1;
    for (let i = firstImageRecord; i < numRecords; i++) {
      const start = recordOffsets[i];
      const end = (i + 1 < numRecords) ? recordOffsets[i + 1] : buffer.length;
      if (start >= buffer.length || end > buffer.length || start >= end) continue;
      const data = buffer.slice(start, end);
      const ext = validateImageMagicBytes(data);
      if (ext) {
        images.push({ buffer: data, ext });
      }
    }
  } catch { /* best-effort */ }
  return images;
}

module.exports = {
  palmDocDecompress,
  parseMobiContent,
  parseMobiHtml,
  parseMobiMetadata,
  extractMobiCover,
  extractMobiImages,
  parseCallibreOpf,
  extractContent,
  readFileContentAsync,
  extractEpubCover,
  extractEpubMetadata,
  extractAuthorFromFilename,
  extractTitleFromFilename,
  extractDocMetadata,
  countWords,
  epubChapterCache,
  epubChapterCacheGet,
  validateImageMagicBytes,
  clearChapterCache,
};
