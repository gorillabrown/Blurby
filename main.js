const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, nativeTheme, session, net } = require("electron");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs/promises");
const chokidar = require("chokidar");

const { Readability } = require("@mozilla/readability");
const { JSDOM } = require("jsdom");
const PDFDocument = require("pdfkit");
const https = require("https");

function sanitizeFilenameForPdf(name) {
  return (name || "")
    .replace(/[<>:"/\\|?*\x00-\x1f\s]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "untitled";
}

async function generateArticlePdf({ title, author, content, sourceUrl, fetchDate, outputDir }) {
  const safeName = sanitizeFilenameForPdf(title);
  const savedArticlesDir = path.join(outputDir, "Saved Articles");
  await fsPromises.mkdir(savedArticlesDir, { recursive: true });
  const pdfPath = path.join(savedArticlesDir, `${safeName}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      info: {
        Title: title,
        Author: author || "Unknown",
        Keywords: `source:${sourceUrl}`,
        CreationDate: fetchDate,
      },
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      try {
        await fsPromises.writeFile(pdfPath, Buffer.concat(chunks));
        resolve(pdfPath);
      } catch (err) {
        reject(err);
      }
    });
    doc.on("error", reject);

    // Header
    doc.fontSize(18).text(title, { align: "center" });
    doc.moveDown(0.5);
    if (author) {
      doc.fontSize(11).fillColor("#666").text(`by ${author}`, { align: "center" });
      doc.moveDown(0.3);
    }
    doc.fontSize(9).fillColor("#999").text(sourceUrl, { align: "center", link: sourceUrl });
    doc.text(`Fetched: ${fetchDate.toLocaleDateString()}`, { align: "center" });
    doc.moveDown(1.5);

    // Body
    doc.fontSize(11).fillColor("#333");
    const paragraphs = content.split(/\n\n+/);
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (trimmed) {
        doc.text(trimmed, { align: "left", lineGap: 4 });
        doc.moveDown(0.8);
      }
    }

    doc.end();
  });
}

const isDev = !app.isPackaged;
const SUPPORTED_EXT = [".txt", ".md", ".markdown", ".text", ".rst", ".html", ".htm", ".epub", ".pdf", ".mobi", ".azw3", ".azw"];
const CURRENT_SETTINGS_SCHEMA = 5;
const CURRENT_LIBRARY_SCHEMA = 3;

// ── Paths ──────────────────────────────────────────────────────────────────────
function getDataPath() {
  const dir = path.join(app.getPath("userData"), "blurby-data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}
function getSettingsPath() { return path.join(getDataPath(), "settings.json"); }
function getLibraryPath() { return path.join(getDataPath(), "library.json"); }
function getErrorLogPath() { return path.join(getDataPath(), "error.log"); }
function getHistoryPath() { return path.join(getDataPath(), "history.json"); }
function getSiteCookiesPath() { return path.join(getDataPath(), "site-cookies.json"); }

// ── Persistent JSON helpers ────────────────────────────────────────────────────
function readJSON(filepath, fallback) {
  try {
    if (fs.existsSync(filepath)) return JSON.parse(fs.readFileSync(filepath, "utf-8"));
  } catch {}
  return fallback;
}
function writeJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
}

// ── Migration framework ────────────────────────────────────────────────────────
const settingsMigrations = [
  // v0 → v1
  (data) => {
    if (!data.folderName) data.folderName = "My reading list";
    if (!data.recentFolders) data.recentFolders = [];
    data.schemaVersion = 1;
    return data;
  },
  // v1 → v2: Add theme setting
  (data) => {
    if (!data.theme) data.theme = "dark";
    data.schemaVersion = 2;
    return data;
  },
  // v2 → v3: Add accentColor and fontFamily
  (data) => {
    if (!data.accentColor) data.accentColor = null; // null = use theme default
    if (!data.fontFamily) data.fontFamily = null; // null = use default system font
    data.schemaVersion = 3;
    return data;
  },
  // v3 → v4: rename fontSize→focusTextSize, add new reader settings, add pause durations
  (data) => {
    data.focusTextSize = data.fontSize !== undefined ? data.fontSize : 100;
    delete data.fontSize;
    if (data.compactMode === undefined) data.compactMode = false;
    if (data.readingMode === undefined) data.readingMode = "focus";
    if (data.focusMarks === undefined) data.focusMarks = true;
    if (data.readingRuler === undefined) data.readingRuler = false;
    if (data.focusSpan === undefined) data.focusSpan = 0.4;
    if (data.flowTextSize === undefined) data.flowTextSize = 100;
    if (data.rhythmPauses === undefined) {
      data.rhythmPauses = {
        commas: true,
        sentences: true,
        paragraphs: true,
        numbers: false,
        longerWords: false,
      };
    }
    if (data.layoutSpacing === undefined) {
      data.layoutSpacing = {
        line: 1.5,
        character: 0,
        word: 0,
      };
    }
    if (data.initialPauseMs == null) data.initialPauseMs = 3000;
    if (data.punctuationPauseMs == null) data.punctuationPauseMs = 1000;
    data.schemaVersion = 4;
    return data;
  },
  // v4 → v5: add viewMode setting
  (data) => {
    if (data.viewMode === undefined) data.viewMode = "list";
    data.schemaVersion = 5;
    return data;
  },
];

const libraryMigrations = [
  // v0 → v1
  (data) => {
    const docs = Array.isArray(data) ? data : (data.docs || []);
    for (const doc of docs) {
      if (!doc.wordCount && doc.content) {
        doc.wordCount = (doc.content || "").split(/\s+/).filter(Boolean).length;
      }
      if (doc.source === "folder" && doc.filepath) {
        delete doc.content;
      }
    }
    return { schemaVersion: 1, docs };
  },
  // v1 → v2: add lastReadAt to all docs
  (data) => {
    const docs = Array.isArray(data) ? data : (data.docs || []);
    for (const doc of docs) {
      if (doc.lastReadAt === undefined) {
        if (doc.position > 0 && doc.modified) {
          doc.lastReadAt = doc.modified;
        } else {
          doc.lastReadAt = null;
        }
      }
    }
    return { schemaVersion: 2, docs };
  },
  // v2 → v3: add author and coverPath to all docs
  (data) => {
    const docs = Array.isArray(data) ? data : (data.docs || []);
    for (const doc of docs) {
      if (doc.author === undefined) doc.author = null;
      if (doc.coverPath === undefined) doc.coverPath = null;
    }
    return { schemaVersion: 3, docs };
  },
];

function runMigrations(data, migrations, currentVersion) {
  let version = data?.schemaVersion || 0;
  let migrated = data;
  while (version < currentVersion) {
    const migrateFn = migrations[version];
    if (!migrateFn) break;
    migrated = migrateFn(migrated);
    version = migrated.schemaVersion || version + 1;
  }
  return migrated;
}

function backupFile(filepath) {
  try { if (fs.existsSync(filepath)) fs.copyFileSync(filepath, filepath + ".bak"); } catch {}
}

// ── State ──────────────────────────────────────────────────────────────────────
let mainWindow = null;
let readerWindows = new Map(); // docId → BrowserWindow
let tray = null;
let watcher = null;
let syncDebounceTimer = null;
const failedExtractions = new Set(); // filepaths that yielded no content — skip on re-scan
const epubChapterCache = new Map(); // filepath → [{ title, charOffset }]
let settings = { schemaVersion: CURRENT_SETTINGS_SCHEMA, wpm: 300, focusTextSize: 100, sourceFolder: null, folderName: "My reading list", recentFolders: [], theme: "dark", launchAtLogin: false, accentColor: null, fontFamily: null, compactMode: false, readingMode: "focus", focusMarks: true, readingRuler: false, focusSpan: 0.4, flowTextSize: 100, rhythmPauses: { commas: true, sentences: true, paragraphs: true, numbers: false, longerWords: false }, layoutSpacing: { line: 1.5, character: 0, word: 0 }, initialPauseMs: 3000, punctuationPauseMs: 1000, viewMode: "list" };
let libraryData = { schemaVersion: CURRENT_LIBRARY_SCHEMA, docs: [] };
let history = { sessions: [], totalWordsRead: 0, totalReadingTimeMs: 0, docsCompleted: 0 };
let siteCookies = {}; // { "nytimes.com": [ {name, value, domain, path, ...} ] }

function loadState() {
  const rawSettings = readJSON(getSettingsPath(), settings);
  if ((rawSettings.schemaVersion || 0) < CURRENT_SETTINGS_SCHEMA) backupFile(getSettingsPath());
  settings = runMigrations(rawSettings, settingsMigrations, CURRENT_SETTINGS_SCHEMA);
  saveSettings();

  const rawLibrary = readJSON(getLibraryPath(), []);
  if ((rawLibrary?.schemaVersion || 0) < CURRENT_LIBRARY_SCHEMA) backupFile(getLibraryPath());
  libraryData = runMigrations(rawLibrary, libraryMigrations, CURRENT_LIBRARY_SCHEMA);
  saveLibrary();

  history = readJSON(getHistoryPath(), history);
  siteCookies = readJSON(getSiteCookiesPath(), {});
}

function getLibrary() { return libraryData.docs; }
function setLibrary(docs) { libraryData.docs = docs; }
function saveSettings() { writeJSON(getSettingsPath(), settings); }
function saveLibrary() { writeJSON(getLibraryPath(), libraryData); }
function saveHistory() { writeJSON(getHistoryPath(), history); }
function saveSiteCookies() { writeJSON(getSiteCookiesPath(), siteCookies); }

// ── File content extraction ────────────────────────────────────────────────────
async function readFileContentAsync(filepath) {
  try { return await fsPromises.readFile(filepath, "utf-8"); } catch { return null; }
}

// ── Highlight Formatting (pure, testable) ──────────────────────────────────
function formatHighlightEntry(text, docTitle, wordIndex, totalWords, date) {
  const pct = totalWords > 0 ? Math.round((wordIndex / totalWords) * 100) : 0;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return (
    `---\n\n> "${text}"\n\n` +
    `— *${docTitle}*, position ${wordIndex}/${totalWords} (${pct}%)\n` +
    `Saved: ${yyyy}-${mm}-${dd} ${hh}:${min}\n\n`
  );
}

function parseDefinitionResponse(data, word) {
  if (!Array.isArray(data) || data.length === 0) {
    return { error: data?.title || "No definition found" };
  }
  const entry = data[0];
  const meaning = entry.meanings?.[0];
  const def = meaning?.definitions?.[0];
  return {
    word: entry.word || word,
    phonetic: entry.phonetic || undefined,
    partOfSpeech: meaning?.partOfSpeech || undefined,
    definition: def?.definition || undefined,
    example: def?.example || undefined,
    synonyms: (meaning?.synonyms || []).slice(0, 5),
  };
}

// ── MOBI/PDB Parser ────────────────────────────────────────────────────────
function parseMobiContent(buffer) {
  try {
    if (buffer.length < 78) return null;
    // PDB header: 78 bytes
    const numRecords = buffer.readUInt16BE(76);
    if (numRecords < 2) return null;

    // Record offset table starts at byte 78, each entry is 8 bytes (4 offset + 4 attributes)
    const recordOffsets = [];
    for (let i = 0; i < numRecords; i++) {
      const offset = buffer.readUInt32BE(78 + i * 8);
      recordOffsets.push(offset);
    }

    // Record 0 contains the PalmDOC/MOBI header
    const rec0Start = recordOffsets[0];
    if (rec0Start + 16 > buffer.length) return null;

    const compression = buffer.readUInt16BE(rec0Start);
    const textLength = buffer.readUInt32BE(rec0Start + 4);
    const textRecordCount = buffer.readUInt16BE(rec0Start + 8);

    // Check for DRM encryption (offset 12 in PalmDOC header)
    const encryption = buffer.readUInt16BE(rec0Start + 12);
    if (encryption !== 0) {
      console.log("MOBI file is DRM-encrypted, cannot extract text");
      return null;
    }

    // HUFF/CDIC compression is not supported — raw decode produces garbage
    if (compression === 17480) {
      console.log("MOBI file uses HUFF/CDIC compression (unsupported)");
      return null;
    }

    // Cap text extraction at 10MB to prevent freezes on huge files
    const maxTextBytes = 10 * 1024 * 1024;

    // Extract text records (records 1 through textRecordCount)
    const textParts = [];
    let totalBytes = 0;
    for (let i = 1; i <= textRecordCount && i < numRecords; i++) {
      const start = recordOffsets[i];
      const end = (i + 1 < numRecords) ? recordOffsets[i + 1] : buffer.length;
      if (start >= buffer.length || end > buffer.length || start >= end) continue;
      const recordData = buffer.slice(start, end);

      if (compression === 1) {
        // No compression
        textParts.push(recordData.toString("utf-8"));
      } else if (compression === 2) {
        // PalmDOC LZ77 compression
        textParts.push(palmDocDecompress(recordData));
      } else {
        textParts.push(recordData.toString("utf-8"));
      }
      totalBytes += (textParts[textParts.length - 1] || "").length;
      if (totalBytes > maxTextBytes) break;
    }

    const html = textParts.join("");
    // Strip HTML tags to get plain text — use regex for speed instead of cheerio on huge strings
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

function parseMobiMetadata(buffer) {
  try {
    if (buffer.length < 78) return {};
    const rec0Start = buffer.readUInt32BE(78);
    // MOBI header starts at rec0 + 16 bytes into PalmDOC header
    const mobiHeaderStart = rec0Start + 16;
    if (mobiHeaderStart + 116 > buffer.length) return {};

    // Check for MOBI magic ('MOBI' at offset 16 from record 0)
    const magic = buffer.toString("ascii", mobiHeaderStart, mobiHeaderStart + 4);
    if (magic !== "MOBI") return {};

    const mobiHeaderLength = buffer.readUInt32BE(mobiHeaderStart + 4);
    const encoding = buffer.readUInt32BE(mobiHeaderStart + 12); // 1252 or 65001 (UTF-8)
    const exthFlag = buffer.readUInt32BE(mobiHeaderStart + 112);

    const result = { encoding: encoding === 65001 ? "utf-8" : "cp1252" };

    // EXTH header follows MOBI header if exthFlag & 0x40
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
        if (recType === 100) result.author = recData;        // Author
        if (recType === 503) result.title = recData;          // Updated title
        if (recType === 201) result.coverOffset = buffer.readUInt32BE(offset + 8); // Cover record index
        offset += recLen;
      }
    }

    // PDB title (first 32 bytes of file, null-terminated)
    if (!result.title) {
      const pdbTitle = buffer.toString("ascii", 0, 32).replace(/\0.*/, "").trim();
      if (pdbTitle) result.title = pdbTitle;
    }

    return result;
  } catch {
    return {};
  }
}

function extractMobiCover(buffer, docId) {
  try {
    const rec0Start = buffer.readUInt32BE(78);
    const mobiHeaderStart = rec0Start + 16;
    if (mobiHeaderStart + 116 > buffer.length) return null;

    const magic = buffer.toString("ascii", mobiHeaderStart, mobiHeaderStart + 4);
    if (magic !== "MOBI") return null;

    const mobiHeaderLength = buffer.readUInt32BE(mobiHeaderStart + 4);
    const exthFlag = buffer.readUInt32BE(mobiHeaderStart + 112);
    const firstImageRecord = buffer.readUInt32BE(mobiHeaderStart + 92); // first image record index

    let coverRecordOffset = -1;

    // Try EXTH cover offset first
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

    // Calculate actual record index for cover image
    const numRecords = buffer.readUInt16BE(76);
    const coverRecordIdx = coverRecordOffset >= 0 ? firstImageRecord + coverRecordOffset : firstImageRecord;
    if (coverRecordIdx <= 0 || coverRecordIdx >= numRecords) return null;

    // Get record data
    const recordStart = buffer.readUInt32BE(78 + coverRecordIdx * 8);
    const recordEnd = (coverRecordIdx + 1 < numRecords) ? buffer.readUInt32BE(78 + (coverRecordIdx + 1) * 8) : buffer.length;
    const imageData = buffer.slice(recordStart, recordEnd);

    // Verify it's a valid image (JPEG or PNG magic bytes)
    const isJpeg = imageData[0] === 0xFF && imageData[1] === 0xD8;
    const isPng = imageData[0] === 0x89 && imageData[1] === 0x50;
    if (!isJpeg && !isPng) return null;

    const ext = isPng ? ".png" : ".jpg";
    const coversDir = path.join(app.getPath("userData"), "covers");
    if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });
    const coverPath = path.join(coversDir, `${docId}${ext}`);
    fs.writeFileSync(coverPath, imageData);
    return coverPath;
  } catch {
    return null;
  }
}

// Also check for Calibre metadata.opf in the same directory
async function parseCallibreOpf(filepath) {
  try {
    const dir = path.dirname(filepath);
    const opfPath = path.join(dir, "metadata.opf");
    if (!fs.existsSync(opfPath)) return null;
    const cheerio = require("cheerio");
    const opfContent = await fsPromises.readFile(opfPath, "utf-8");
    const $ = cheerio.load(opfContent, { xmlMode: true });
    const title = $("dc\\:title, title").first().text().trim() || null;
    const author = $("dc\\:creator, creator").first().text().trim() || null;
    // Check for cover.jpg in same directory
    let coverPath = null;
    const coverRef = $('reference[type="cover"]').attr("href") || $('meta[name="cover"]').attr("content");
    const candidatePaths = [
      coverRef ? path.join(dir, coverRef) : null,
      path.join(dir, "cover.jpg"),
      path.join(dir, "cover.jpeg"),
      path.join(dir, "cover.png"),
    ].filter(Boolean);
    for (const p of candidatePaths) {
      if (p && fs.existsSync(p)) { coverPath = p; break; }
    }
    return { title, author, coverPath };
  } catch {
    return null;
  }
}

async function extractContent(filepath) {
  const ext = path.extname(filepath).toLowerCase();
  try {
    if (ext === ".pdf") {
      // pdf-parse v2 requires pdfjs-dist which needs canvas polyfills in Node
      if (!globalThis.DOMMatrix) {
        try {
          const canvas = require("@napi-rs/canvas");
          globalThis.DOMMatrix = canvas.DOMMatrix;
          globalThis.ImageData = canvas.ImageData;
          globalThis.Path2D = canvas.Path2D;
        } catch (canvasErr) {
          // Minimal polyfills if native canvas not available — PDF text extraction still works
          console.log("Note: @napi-rs/canvas not available, using polyfills for PDF parsing. Run 'npm rebuild @napi-rs/canvas' if PDF extraction has issues.");
          globalThis.DOMMatrix = globalThis.DOMMatrix || class DOMMatrix { constructor() { this.a=1;this.b=0;this.c=0;this.d=1;this.e=0;this.f=0; } };
          globalThis.ImageData = globalThis.ImageData || class ImageData { constructor(w,h) { this.width=w;this.height=h;this.data=new Uint8ClampedArray(w*h*4); } };
          globalThis.Path2D = globalThis.Path2D || class Path2D { };
        }
      }
      const { PDFParse } = require("pdf-parse");
      const buffer = await fsPromises.readFile(filepath);
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      // Timeout to prevent hanging on problematic PDFs
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("PDF parse timeout")), 30000));
      try {
        const result = await Promise.race([parser.getText({ pageJoiner: "\n\n" }), timeout]);
        await parser.destroy();
        const text = result.text || "";
        // Validate extracted text isn't binary garbage
        const printableRatio = text.replace(/[\x00-\x1f\x7f-\x9f]/g, "").length / (text.length || 1);
        if (printableRatio < 0.8 || text.length < 10) {
          console.log(`PDF extraction yielded non-text content for ${filepath} (${Math.round(printableRatio*100)}% printable)`);
          return null;
        }
        return text;
      } catch (err) {
        try { await parser.destroy(); } catch {}
        console.error(`PDF extraction failed for ${filepath}:`, err.message);
        return null;
      }
    }
    if (ext === ".epub") {
      // EPUB is a ZIP of XHTML files — extract text via adm-zip + cheerio
      const AdmZip = require("adm-zip");
      const cheerio = require("cheerio");
      const zip = new AdmZip(filepath);
      const entries = zip.getEntries();
      // Parse container.xml to get spine order
      const containerEntry = entries.find((e) => e.entryName.endsWith("container.xml"));
      let opfPath = "";
      if (containerEntry) {
        const $ = cheerio.load(containerEntry.getData().toString("utf-8"), { xmlMode: true });
        opfPath = $("rootfile").attr("full-path") || "";
      }
      // Parse OPF to get spine item order and TOC
      const opfEntry = entries.find((e) => e.entryName === opfPath);
      const spineIds = [];
      const manifestMap = new Map(); // id → href
      const hrefToId = new Map();    // href → id (for TOC matching)
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
            // Find EPUB3 nav document
            if ($(el).attr("properties")?.includes("nav")) tocHref = fullHref;
            // Find EPUB2 NCX
            if (mediaType === "application/x-dtbncx+xml") ncxHref = fullHref;
          }
        });
        $("spine itemref").each((_, el) => {
          const idref = $(el).attr("idref");
          if (idref) spineIds.push(idref);
        });
        // Also check spine toc attribute for NCX
        const spineToc = $("spine").attr("toc");
        if (spineToc && !ncxHref) ncxHref = manifestMap.get(spineToc);
      }

      // Parse TOC (EPUB3 nav.xhtml or EPUB2 NCX) to get chapter titles per spine href
      const tocMap = new Map(); // spine href (without fragment) → chapter title
      try {
        if (tocHref) {
          // EPUB3 nav document
          const navEntry = entries.find((e) => e.entryName === tocHref);
          if (navEntry) {
            const navDir = tocHref.includes("/") ? tocHref.substring(0, tocHref.lastIndexOf("/") + 1) : "";
            const $ = cheerio.load(navEntry.getData().toString("utf-8"));
            $('nav[*|type="toc"] a, nav#toc a, nav.toc a').each((_, el) => {
              const href = $(el).attr("href");
              const title = $(el).text().trim();
              if (href && title) {
                const fullHref = navDir + href.split("#")[0]; // strip fragment
                tocMap.set(fullHref, title);
              }
            });
          }
        }
        if (tocMap.size === 0 && ncxHref) {
          // EPUB2 NCX
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
        // Only log novel TOC errors, not repetitive ones like "Namespaced attributes" for every EPUB
        if (!tocErr.message?.includes("Namespaced attributes")) {
          console.log("EPUB TOC parse error (non-fatal):", tocErr.message);
        }
      }

      // Extract text from spine XHTML files in order, tracking chapters
      const texts = [];
      const chapters = []; // { title, charOffset }
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
        const text = $("body").text().trim();
        if (!text) continue;

        // Check if this spine item has a TOC entry
        const chapterTitle = tocMap.get(href);
        if (chapterTitle) {
          chapters.push({ title: chapterTitle, charOffset });
        } else {
          // Fallback: look for <h1>/<h2> at the start of the content
          const heading = $("h1, h2").first().text().trim();
          if (heading && heading.length < 100) {
            chapters.push({ title: heading, charOffset });
          }
        }

        texts.push(text);
        charOffset += text.length + 2; // +2 for the \n\n joiner
      }

      const fullText = texts.join("\n\n") || null;
      // Store chapters in a cache keyed by filepath for later retrieval
      if (fullText && chapters.length > 1) {
        epubChapterCache.set(filepath, chapters);
      }
      return fullText;
    }
    if (ext === ".mobi" || ext === ".azw3" || ext === ".azw") {
      // MOBI/AZW is PDB + PalmDOC/MOBI structure containing HTML content
      const buffer = await fsPromises.readFile(filepath);
      const text = parseMobiContent(buffer);
      if (text && text.length > 10) return text;
      return null;
    }
    if (ext === ".html" || ext === ".htm") {
      const html = await fsPromises.readFile(filepath, "utf-8");
      const cheerio = require("cheerio");
      const $ = cheerio.load(html);
      $("script, style, nav, footer, header, aside").remove();
      return $("body").text().trim() || $.text().trim() || null;
    }
    // Plain text formats
    return await readFileContentAsync(filepath);
  } catch {
    return await readFileContentAsync(filepath);
  }
}

// ── EPUB metadata extraction ───────────────────────────────────────────────────
async function extractEpubCover(filepath, docId) {
  try {
    const AdmZip = require("adm-zip");
    const zip = new AdmZip(filepath);
    const entries = zip.getEntries();

    // Parse container.xml to find OPF path
    const containerEntry = entries.find((e) => e.entryName.endsWith("container.xml"));
    let opfPath = "";
    if (containerEntry) {
      const cheerio = require("cheerio");
      const $ = cheerio.load(containerEntry.getData().toString("utf-8"), { xmlMode: true });
      opfPath = $("rootfile").attr("full-path") || "";
    }

    const opfEntry = entries.find((e) => e.entryName === opfPath);
    let coverEntry = null;

    if (opfEntry) {
      const cheerio = require("cheerio");
      const opfDir = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1) : "";
      const $ = cheerio.load(opfEntry.getData().toString("utf-8"), { xmlMode: true });

      // Look for manifest item with id containing "cover" and image media-type
      let coverHref = null;
      $("manifest item").each((_, el) => {
        const id = ($(el).attr("id") || "").toLowerCase();
        const mediaType = ($(el).attr("media-type") || "").toLowerCase();
        const href = $(el).attr("href");
        if (id.includes("cover") && mediaType.startsWith("image/") && href && !coverHref) {
          coverHref = opfDir + href;
        }
      });

      // Also check <meta name="cover"> pattern
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

    // Fallback: look for common cover filenames
    if (!coverEntry) {
      const commonNames = ["cover.jpg", "cover.jpeg", "cover.png", "images/cover.jpg", "images/cover.jpeg", "images/cover.png", "OEBPS/cover.jpg", "OEBPS/images/cover.jpg"];
      for (const name of commonNames) {
        coverEntry = entries.find((e) => e.entryName.toLowerCase() === name.toLowerCase());
        if (coverEntry) break;
      }
    }

    if (!coverEntry) return null;

    const ext = path.extname(coverEntry.entryName).toLowerCase() || ".jpg";
    const coversDir = path.join(getDataPath(), "covers");
    await fsPromises.mkdir(coversDir, { recursive: true });
    const coverFilePath = path.join(coversDir, `${docId}${ext}`);
    await fsPromises.writeFile(coverFilePath, coverEntry.getData());
    return coverFilePath;
  } catch {
    return null;
  }
}

async function extractEpubMetadata(filepath) {
  try {
    const AdmZip = require("adm-zip");
    const cheerio = require("cheerio");
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
  } catch {
    return { title: null, author: null };
  }
}

function extractAuthorFromFilename(filename) {
  // Try "Title - Author" pattern
  const base = path.basename(filename, path.extname(filename));
  const match = base.match(/^(.+?)\s+-\s+(.+)$/);
  return match ? match[2].trim() : null;
}

function extractTitleFromFilename(filename, author) {
  const base = path.basename(filename, path.extname(filename));
  if (author) {
    // Strip " - Author" suffix from title
    const match = base.match(/^(.+?)\s+-\s+.+$/);
    if (match) return match[1].trim();
  }
  return base;
}

// ── Symlink-safe path validation ───────────────────────────────────────────────
async function isPathWithinFolder(filepath, folderPath) {
  try {
    const realFile = await fsPromises.realpath(filepath);
    const realFolder = await fsPromises.realpath(folderPath);
    return realFile.startsWith(realFolder + path.sep) || realFile === realFolder;
  } catch {
    return false;
  }
}

// ── Folder scanning ────────────────────────────────────────────────────────────
async function scanFolderAsync(folderPath) {
  if (!folderPath) return [];
  try { await fsPromises.access(folderPath); } catch { return []; }

  const files = [];
  const savedArticlesName = "Saved Articles";

  async function walkDir(dir) {
    try {
      const entries = await fsPromises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          // Skip Saved Articles subfolder (managed separately for URL-to-PDF exports)
          if (entry.name === savedArticlesName && dir === folderPath) continue;
          // Recurse into subdirectories
          await walkDir(fullPath);
        } else if (entry.isFile() && SUPPORTED_EXT.includes(path.extname(entry.name).toLowerCase())) {
          // Symlink traversal protection
          if (!await isPathWithinFolder(fullPath, folderPath)) continue;
          const stat = await fsPromises.stat(fullPath);
          files.push({
            filename: entry.name,
            filepath: fullPath,
            ext: path.extname(entry.name).toLowerCase(),
            size: stat.size,
            modified: stat.mtimeMs,
          });
        }
      }
    } catch {}
  }

  await walkDir(folderPath);

  // Deduplicate: when the same book exists in multiple formats (e.g. .epub + .mobi),
  // keep the best format. Priority: epub > pdf > mobi/azw3/azw > txt/md/html
  const FORMAT_PRIORITY = { ".epub": 0, ".pdf": 1, ".mobi": 2, ".azw3": 2, ".azw": 2, ".html": 3, ".htm": 3, ".txt": 4, ".md": 4, ".markdown": 4, ".text": 4, ".rst": 4 };
  const byDirAndStem = new Map(); // "dir/stem" → best file
  for (const file of files) {
    const dir = path.dirname(file.filepath);
    const stem = path.basename(file.filename, file.ext).toLowerCase();
    const key = `${dir}\0${stem}`;
    const existing = byDirAndStem.get(key);
    if (!existing || (FORMAT_PRIORITY[file.ext] ?? 99) < (FORMAT_PRIORITY[existing.ext] ?? 99)) {
      byDirAndStem.set(key, file);
    }
  }

  return [...byDirAndStem.values()].sort((a, b) => a.filename.localeCompare(b.filename));
}

function debouncedSyncLibraryWithFolder() {
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => { syncDebounceTimer = null; syncLibraryWithFolder(); }, 1000);
}

async function syncLibraryWithFolder() {
  if (!settings.sourceFolder) return;
  const files = await scanFolderAsync(settings.sourceFolder);
  const docs = getLibrary();
  const existing = new Map(docs.map((d) => [d.filepath, d]));
  const synced = [];

  for (const file of files) {
    const prev = existing.get(file.filepath);
    if (prev) {
      synced.push({ ...prev, filename: file.filename, ext: file.ext, modified: file.modified, size: file.size });
    } else if (failedExtractions.has(file.filepath)) {
      // Skip files that previously failed content extraction
      continue;
    } else {
      const content = await extractContent(file.filepath);
      if (!content) { failedExtractions.add(file.filepath); }
      if (content) {
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        const docId = Date.now().toString() + Math.random().toString(36).slice(2, 8);
        let author = null;
        let coverPath = null;
        let bookTitle = null;
        if (file.ext === ".epub") {
          const meta = await extractEpubMetadata(file.filepath);
          author = meta.author;
          bookTitle = meta.title;
          coverPath = await extractEpubCover(file.filepath, docId);
        } else if (file.ext === ".mobi" || file.ext === ".azw3" || file.ext === ".azw") {
          // Try Calibre metadata.opf first (richer metadata)
          const opfMeta = await parseCallibreOpf(file.filepath);
          if (opfMeta) {
            author = opfMeta.author;
            bookTitle = opfMeta.title;
            if (opfMeta.coverPath) {
              // Copy Calibre cover to our covers directory
              const coversDir = path.join(app.getPath("userData"), "covers");
              if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });
              const ext = path.extname(opfMeta.coverPath);
              const destCover = path.join(coversDir, `${docId}${ext}`);
              try { await fsPromises.copyFile(opfMeta.coverPath, destCover); coverPath = destCover; } catch {}
            }
          }
          // Fall back to MOBI internal metadata
          if (!author || !bookTitle) {
            const buf = await fsPromises.readFile(file.filepath);
            const mobiMeta = parseMobiMetadata(buf);
            if (!author) author = mobiMeta.author;
            if (!bookTitle) bookTitle = mobiMeta.title;
            if (!coverPath) coverPath = extractMobiCover(buf, docId);
          }
        }
        if (!author) {
          author = extractAuthorFromFilename(file.filename);
        }
        if (!bookTitle) {
          bookTitle = extractTitleFromFilename(file.filename, author);
        }
        synced.push({
          id: docId,
          title: bookTitle,
          filepath: file.filepath, filename: file.filename,
          ext: file.ext, size: file.size, modified: file.modified,
          wordCount, position: 0, created: Date.now(), source: "folder",
          author: author || null,
          coverPath: coverPath || null,
          lastReadAt: null,
        });
      }
    }
  }

  const savedArticlesPath = settings.sourceFolder
    ? path.join(path.resolve(settings.sourceFolder), "Saved Articles")
    : null;
  for (const doc of docs) {
    if (doc.source !== "folder") {
      synced.push(doc);
    } else if (savedArticlesPath && doc.filepath && path.resolve(doc.filepath).startsWith(savedArticlesPath)) {
      synced.push(doc);
    }
  }

  setLibrary(synced);
  saveLibrary();
  broadcastLibrary();
}

function broadcastLibrary() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("library-updated", getLibrary());
  }
}

// ── Reader windows ─────────────────────────────────────────────────────────────
function createReaderWindow(docId) {
  if (readerWindows.has(docId)) {
    const existing = readerWindows.get(docId);
    if (!existing.isDestroyed()) {
      existing.focus();
      return existing;
    }
    readerWindows.delete(docId);
  }

  const colors = getThemeColors();
  const isMac = process.platform === "darwin";
  const win = new BrowserWindow({
    width: 900, height: 650, minWidth: 500, minHeight: 400,
    title: "Blurby Reader",
    backgroundColor: colors.bg,
    ...(isMac
      ? { titleBarStyle: "hiddenInset", trafficLightPosition: { x: 16, y: 16 } }
      : {
          titleBarStyle: "hidden",
          titleBarOverlay: {
            color: colors.titleBar,
            symbolColor: colors.titleText,
            height: 32,
          },
        }
    ),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true, nodeIntegration: false,
    },
    show: false,
  });

  win.once("ready-to-show", () => win.show());

  if (isDev) {
    win.loadURL("http://localhost:5173#reader/" + docId);
  } else {
    win.loadFile(path.join(__dirname, "dist", "index.html"), { hash: "reader/" + docId });
  }

  win.on("closed", () => {
    readerWindows.delete(docId);
  });

  readerWindows.set(docId, win);
  return win;
}

// ── Site login window ──────────────────────────────────────────────────────────
function getSiteKey(url) {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split(".");
    // Use root domain (e.g., "nytimes.com" from "www.nytimes.com")
    return parts.length > 2 ? parts.slice(-2).join(".") : hostname;
  } catch { return null; }
}

function getCookiesForUrl(url) {
  const siteKey = getSiteKey(url);
  if (!siteKey) return [];
  // Check all stored site keys that match this URL's domain
  const cookies = [];
  for (const [domain, domainCookies] of Object.entries(siteCookies)) {
    if (siteKey === domain || siteKey.endsWith("." + domain)) {
      cookies.push(...domainCookies);
    }
  }
  return cookies;
}

function openSiteLogin(siteUrl) {
  return new Promise((resolve) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(siteUrl);
    } catch {
      resolve({ error: "Invalid URL" });
      return;
    }

    const siteKey = getSiteKey(siteUrl);
    const loginWin = new BrowserWindow({
      width: 900, height: 750,
      title: `Log in to ${parsedUrl.hostname}`,
      parent: mainWindow,
      modal: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        partition: "persist:site-login",
      },
    });

    // Ensure OAuth popups (Google, Apple, etc.) use the same session partition
    loginWin.webContents.setWindowOpenHandler(({ url }) => {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          width: 500, height: 700,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            partition: "persist:site-login",
          },
        },
      };
    });

    loginWin.setMenuBarVisibility(false);
    loginWin.loadURL(parsedUrl.origin);

    loginWin.on("closed", () => {
      // Capture all cookies for this domain when the window closes
      const loginSession = session.fromPartition("persist:site-login");
      loginSession.cookies.get({})
        .then((allCookies) => {
          // Filter cookies relevant to this site
          const relevant = allCookies.filter((c) => {
            const cookieDomain = (c.domain || "").replace(/^\./, "");
            return cookieDomain === siteKey || cookieDomain.endsWith("." + siteKey) || siteKey.endsWith("." + cookieDomain);
          });
          if (relevant.length > 0) {
            siteCookies[siteKey] = relevant.map((c) => ({
              name: c.name, value: c.value, domain: c.domain, path: c.path,
              secure: c.secure, httpOnly: c.httpOnly,
            }));
            saveSiteCookies();
            resolve({ success: true, site: siteKey });
          } else {
            resolve({ cancelled: true });
          }
        })
        .catch(() => resolve({ cancelled: true }));
    });
  });
}

// ── File watcher ───────────────────────────────────────────────────────────────
function startWatcher() {
  if (watcher) watcher.close();
  if (!settings.sourceFolder) return;

  const savedArticlesDir = path.join(settings.sourceFolder, "Saved Articles");
  watcher = chokidar.watch(settings.sourceFolder, {
    ignoreInitial: true,
    ignored: [/(^|[\/\\])\../, savedArticlesDir],
    awaitWriteFinish: { stabilityThreshold: 500 },
  });

  watcher.on("add", async (filepath) => {
    if (!SUPPORTED_EXT.includes(path.extname(filepath).toLowerCase())) return;
    if (!await isPathWithinFolder(filepath, settings.sourceFolder)) return;
    debouncedSyncLibraryWithFolder();
  });

  watcher.on("unlink", () => debouncedSyncLibraryWithFolder());

  watcher.on("change", async (filepath) => {
    if (!SUPPORTED_EXT.includes(path.extname(filepath).toLowerCase())) return;
    if (!await isPathWithinFolder(filepath, settings.sourceFolder)) return;
    const doc = getLibrary().find((d) => d.filepath === filepath);
    if (doc) {
      const content = await extractContent(filepath);
      if (content) {
        doc.wordCount = content.split(/\s+/).filter(Boolean).length;
        saveLibrary();
        broadcastLibrary();
      }
    }
  });
}

// ── Window ─────────────────────────────────────────────────────────────────────
function getThemeColors() {
  const resolvedTheme = settings.theme === "system"
    ? (nativeTheme.shouldUseDarkColors ? "dark" : "light")
    : settings.theme;
  switch (resolvedTheme) {
    case "light":
      return { bg: "#f5f3ef", titleBar: "#c4c1bb", titleText: "#1a1a1a" }; // 20% darker
    case "eink":
      return { bg: "#e8e4d9", titleBar: "#b9b6ae", titleText: "#1a1a1a" }; // 20% darker
    default: // dark
      return { bg: "#0f0f0f", titleBar: "#1c1c1c", titleText: "#e8e4de" }; // 10% lighter
  }
}

function createWindow() {
  const colors = getThemeColors();
  const isMac = process.platform === "darwin";

  mainWindow = new BrowserWindow({
    width: 1000, height: 720, minWidth: 600, minHeight: 500,
    title: "Blurby",
    backgroundColor: colors.bg,
    ...(isMac
      ? { titleBarStyle: "hiddenInset", trafficLightPosition: { x: 16, y: 16 } }
      : {
          titleBarStyle: "hidden",
          titleBarOverlay: {
            color: colors.titleBar,
            symbolColor: colors.titleText,
            height: 32,
          },
        }
    ),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true, nodeIntegration: false,
    },
    show: false,
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
  }

  mainWindow.on("closed", () => { mainWindow = null; });
}

// ── Tray ───────────────────────────────────────────────────────────────────────
function createTray() {
  try { tray = new Tray(path.join(__dirname, "assets", "tray-icon.png")); } catch { return; }
  const contextMenu = Menu.buildFromTemplate([
    { label: "Open Blurby", click: () => { if (mainWindow) mainWindow.show(); else createWindow(); } },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);
  tray.setToolTip("Blurby");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => { if (mainWindow) mainWindow.show(); else createWindow(); });
}

// ── Auto-updater ───────────────────────────────────────────────────────────────
function setupAutoUpdater() {
  try {
    const { autoUpdater } = require("electron-updater");
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on("update-available", (info) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("update-available", info.version);
      }
    });

    autoUpdater.on("update-downloaded", (info) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("update-downloaded", info.version);
      }
    });

    // Check after 5s delay to not block startup
    setTimeout(() => { try { autoUpdater.checkForUpdates(); } catch {} }, 5000);
  } catch {}
}

// ── Reading statistics ─────────────────────────────────────────────────────────
function recordReadingSession(docTitle, wordsRead, durationMs, wpm) {
  const today = new Date().toISOString().slice(0, 10);
  history.sessions.push({ date: today, docTitle, wordsRead, durationMs, wpm });
  history.totalWordsRead += wordsRead;
  history.totalReadingTimeMs += durationMs;
  // Keep only last 1000 sessions
  if (history.sessions.length > 1000) history.sessions = history.sessions.slice(-1000);
  saveHistory();
}

function getStats() {
  const today = new Date().toISOString().slice(0, 10);
  const dates = [...new Set(history.sessions.map((s) => s.date))].sort();

  // Calculate streak
  let streak = 0;
  if (dates.length > 0) {
    const d = new Date(today);
    // Check if today or yesterday has a session
    const lastDate = dates[dates.length - 1];
    const diffDays = Math.floor((d - new Date(lastDate)) / 86400000);
    if (diffDays <= 1) {
      streak = 1;
      for (let i = dates.length - 2; i >= 0; i--) {
        const prev = new Date(dates[i + 1]);
        const curr = new Date(dates[i]);
        const gap = Math.floor((prev - curr) / 86400000);
        if (gap <= 1) streak++;
        else break;
      }
    }
  }

  return {
    totalWordsRead: history.totalWordsRead,
    totalReadingTimeMs: history.totalReadingTimeMs,
    docsCompleted: history.docsCompleted || 0,
    sessions: history.sessions.length,
    streak,
  };
}

// ── System theme ───────────────────────────────────────────────────────────────
function getSystemTheme() {
  return nativeTheme.shouldUseDarkColors ? "dark" : "light";
}

function broadcastSystemTheme() {
  const systemTheme = getSystemTheme();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("system-theme-changed", systemTheme);
  }
  for (const [, win] of readerWindows) {
    if (!win.isDestroyed()) {
      win.webContents.send("system-theme-changed", systemTheme);
    }
  }
}

function updateWindowTheme() {
  const colors = getThemeColors();
  const resolvedTheme = settings.theme === "system" ? getSystemTheme() : settings.theme;
  nativeTheme.themeSource = resolvedTheme === "light" || resolvedTheme === "eink" ? "light" : "dark";
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setBackgroundColor(colors.bg);
    // Update title bar overlay colors on Windows
    if (process.platform !== "darwin") {
      try {
        mainWindow.setTitleBarOverlay({
          color: colors.titleBar,
          symbolColor: colors.titleText,
        });
      } catch {}
    }
  }
}

// ── Article extraction helpers ─────────────────────────────────────────────────
async function getSessionCookieHeader(url) {
  try {
    const loginSession = session.fromPartition("persist:site-login");
    const cookies = await loginSession.cookies.get({ url });
    if (cookies.length === 0) return null;
    return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  } catch { return null; }
}

async function fetchWithCookies(url) {
  const cookieHeader = await getSessionCookieHeader(url);
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
  };
  if (cookieHeader) headers["Cookie"] = cookieHeader;
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000), redirect: "follow" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.text();
}

function fetchWithBrowser(url) {
  return new Promise((resolve, reject) => {
    const win = new BrowserWindow({
      width: 1280, height: 900,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        partition: "persist:site-login",
      },
    });

    win.webContents.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    );

    let resolved = false;
    const cleanup = () => {
      if (!win.isDestroyed()) win.destroy();
    };

    // Hard timeout — force resolve with whatever we have
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        win.webContents.executeJavaScript("document.documentElement.outerHTML")
          .then((html) => { cleanup(); resolve(html); })
          .catch(() => { cleanup(); reject(new Error("Timed out loading page.")); });
      }
    }, 20000);

    win.webContents.on("did-finish-load", () => {
      setTimeout(async () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        try {
          const html = await win.webContents.executeJavaScript("document.documentElement.outerHTML");
          cleanup();
          resolve(html);
        } catch (err) {
          cleanup();
          reject(err);
        }
      }, 3000);
    });

    win.webContents.on("did-fail-load", (_event, errorCode, errorDesc, _url, isMainFrame) => {
      if (isMainFrame && !resolved) {
        resolved = true;
        clearTimeout(timeout);
        cleanup();
        reject(new Error(`Failed to load page: ${errorDesc} (${errorCode})`));
      }
    });

    win.loadURL(url);
  });
}

function extractArticleFromHtml(html, url) {
  const dom = new JSDOM(html, { url });
  const parsedDoc = dom.window.document;

  // Remove paywall/ad elements
  parsedDoc.querySelectorAll([
    '[class*="paywall"]', '[class*="Paywall"]',
    '[class*="advert"]', '[class*="Advert"]',
    '[id*="paywall"]', '[id*="Paywall"]',
    '[class*="gateway"]', '[class*="Gateway"]',
    '[aria-label*="advertisement"]',
    '[data-testid*="paywall"]',
  ].join(",")).forEach((el) => el.remove());

  let title = null;
  let content = null;

  // 1. Try __preloadedData JSON from raw HTML (NYT and similar React-rendered sites)
  //    Article text is in sprinkledBody.content as ParagraphBlock objects
  const preloadIdx = html.indexOf("window.__preloadedData");
  if (preloadIdx !== -1) {
    const eqIdx = html.indexOf("=", preloadIdx);
    if (eqIdx !== -1) {
      // Find the JSON object start
      const jsonStart = html.indexOf("{", eqIdx);
      if (jsonStart !== -1) {
        // Find the end of the script tag to bound our search
        const scriptEnd = html.indexOf("</script>", jsonStart);
        if (scriptEnd !== -1) {
          let jsonStr = html.substring(jsonStart, scriptEnd).replace(/;\s*$/, "");
          // NYT embeds JavaScript `undefined` values which aren't valid JSON
          jsonStr = jsonStr.replace(/:\s*undefined\b/g, ": null");
          try {
            const data = JSON.parse(jsonStr);
            const article = data?.initialData?.data?.article;
            if (article) {
              title = article.headline?.default || null;
              const bodyContent = article.sprinkledBody?.content || article.body?.content || [];
              const paragraphs = [];
              for (const block of bodyContent) {
                if (block.__typename === "ParagraphBlock" && block.content) {
                  const paraText = block.content
                    .filter((c) => c.__typename === "TextInline")
                    .map((c) => c.text)
                    .join("");
                  if (paraText) paragraphs.push(paraText);
                }
              }
              if (paragraphs.length > 0) {
                content = paragraphs.join("\n\n");
              }
            }
          } catch { /* skip parse errors */ }
        }
      }
    }
  }

  // 2. Try JSON-LD structured data (articleBody field)
  if (!content) {
    for (const script of parsedDoc.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const data = JSON.parse(script.textContent);
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          if (item.articleBody) { content = item.articleBody; title = title || item.headline; break; }
          if (item["@graph"]) {
            for (const node of item["@graph"]) {
              if (node.articleBody) { content = node.articleBody; title = title || node.headline; break; }
            }
          }
        }
        if (content) break;
      } catch { /* skip */ }
    }
  }

  // 3. Try Readability
  if (!content) {
    const reader = new Readability(parsedDoc);
    const article = reader.parse();
    if (article?.textContent?.trim()) {
      content = article.textContent.trim();
      title = title || article.title;
    }
  }

  // 4. Try specific article body selectors as last resort
  if (!content) {
    const selectors = [
      'section[name="articleBody"]', 'article[id="story"]',
      "article .StoryBodyCompanionColumn", "article .article-body",
      '[data-testid="article-body"]', ".article__body",
      ".post-content", "article .entry-content", "article",
    ];
    for (const sel of selectors) {
      const el = parsedDoc.querySelector(sel);
      if (el?.textContent?.trim()?.length > 200) {
        content = el.textContent.trim();
        break;
      }
    }
  }

  if (!content?.trim()) {
    return { error: "Could not extract readable content from this page." };
  }

  // Get title from meta tags if we don't have one
  if (!title) {
    const ogTitle = parsedDoc.querySelector('meta[property="og:title"]');
    const metaTitle = parsedDoc.querySelector("title");
    title = ogTitle?.getAttribute("content") || metaTitle?.textContent || new URL(url).hostname;
  }

  // Extract article image (og:image preferred)
  let imageUrl = null;
  const ogImage = parsedDoc.querySelector('meta[property="og:image"]');
  if (ogImage) {
    imageUrl = ogImage.getAttribute("content");
  }
  if (!imageUrl) {
    const twitterImage = parsedDoc.querySelector('meta[name="twitter:image"]');
    if (twitterImage) imageUrl = twitterImage.getAttribute("content");
  }

  // Clean up common noise
  content = content
    .replace(/\bADVERTISEMENT\b/g, "")
    .replace(/\bSKIP ADVERTISEMENT\b/g, "")
    .replace(/AdvertisementSKIP/g, "")
    .replace(/Thank you for your patience while we verify access\..*/g, "")
    .replace(/If you are in Reader mode please exit and log into your Times account.*/g, "")
    .replace(/Already a subscriber\? Log in\.?.*/g, "")
    .replace(/Want all of The Times\?.*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { title, content, imageUrl };
}

// ── IPC Handlers ───────────────────────────────────────────────────────────────
function registerIPC() {
  ipcMain.handle("get-state", () => ({ settings, library: getLibrary() }));
  ipcMain.handle("get-platform", () => process.platform);
  ipcMain.handle("get-system-theme", () => getSystemTheme());

  ipcMain.handle("select-folder", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
      title: "Select your reading material folder",
    });
    if (result.canceled || !result.filePaths.length) return null;
    const folder = result.filePaths[0];
    settings.sourceFolder = folder;
    settings.recentFolders = [folder, ...settings.recentFolders.filter((f) => f !== folder)].slice(0, 5);
    saveSettings();
    await syncLibraryWithFolder();
    startWatcher();
    return folder;
  });

  ipcMain.handle("switch-folder", async (_, folder) => {
    try { await fsPromises.access(folder); } catch { return { error: "Folder no longer exists." }; }
    settings.sourceFolder = folder;
    settings.recentFolders = [folder, ...settings.recentFolders.filter((f) => f !== folder)].slice(0, 5);
    saveSettings();
    await syncLibraryWithFolder();
    startWatcher();
    return { folder };
  });

  ipcMain.handle("save-settings", (_, newSettings) => {
    settings = { ...settings, ...newSettings };
    saveSettings();
    if (newSettings.theme !== undefined) updateWindowTheme();
  });

  ipcMain.handle("save-library", (_, newDocs) => { setLibrary(newDocs); saveLibrary(); });

  ipcMain.handle("update-doc-progress", (_, docId, position) => {
    const doc = getLibrary().find((d) => d.id === docId);
    if (doc) { doc.position = position; saveLibrary(); }
  });

  ipcMain.handle("add-manual-doc", (_, title, content) => {
    const wordCount = (content || "").split(/\s+/).filter(Boolean).length;
    const doc = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
      title, content, wordCount, position: 0, created: Date.now(), source: "manual",
    };
    getLibrary().unshift(doc);
    saveLibrary();
    return doc;
  });

  ipcMain.handle("delete-doc", (_, docId) => {
    setLibrary(getLibrary().filter((d) => d.id !== docId));
    saveLibrary();
  });

  ipcMain.handle("update-doc", (_, docId, title, content) => {
    const doc = getLibrary().find((d) => d.id === docId);
    if (doc) {
      doc.title = title;
      doc.content = content;
      doc.wordCount = (content || "").split(/\s+/).filter(Boolean).length;
      saveLibrary();
    }
  });

  ipcMain.handle("reset-progress", (_, docId) => {
    const doc = getLibrary().find((d) => d.id === docId);
    if (doc) { doc.position = 0; saveLibrary(); }
  });


  ipcMain.handle("load-doc-content", async (_, docId) => {
    const doc = getLibrary().find((d) => d.id === docId);
    if (!doc) return null;
    if (doc.content) return doc.content;
    if (doc.filepath) return await extractContent(doc.filepath);
    return null;
  });

  // Get chapter metadata for a document (from EPUB TOC or content analysis)
  ipcMain.handle("get-doc-chapters", async (_, docId) => {
    const doc = getLibrary().find((d) => d.id === docId);
    if (!doc) return [];
    // Check EPUB chapter cache first
    if (doc.filepath && epubChapterCache.has(doc.filepath)) {
      return epubChapterCache.get(doc.filepath);
    }
    // For EPUBs not in cache, re-extract to populate cache
    if (doc.filepath && path.extname(doc.filepath).toLowerCase() === ".epub") {
      await extractContent(doc.filepath); // populates epubChapterCache
      return epubChapterCache.get(doc.filepath) || [];
    }
    return [];
  });

  // ── Highlights ───────────────────────────────────────────────────────────
  ipcMain.handle("save-highlight", async (_, { docTitle, text, wordIndex, totalWords }) => {
    try {
      const highlightPath = settings.sourceFolder
        ? path.join(settings.sourceFolder, "Blurby Highlights.md")
        : path.join(getDataPath(), "highlights.md");

      // Create file with header if it doesn't exist
      try {
        await fsPromises.access(highlightPath);
      } catch {
        await fsPromises.writeFile(highlightPath, "# Blurby Highlights\n\n");
      }

      const entry = formatHighlightEntry(text, docTitle, wordIndex, totalWords, new Date());

      await fsPromises.appendFile(highlightPath, entry);
      return { ok: true };
    } catch (err) {
      return { error: err.message };
    }
  });

  // ── Dictionary lookup ──────────────────────────────────────────────────
  const definitionCache = new Map();

  ipcMain.handle("define-word", async (_, word) => {
    const key = word.toLowerCase().trim();
    if (definitionCache.has(key)) return definitionCache.get(key);

    try {
      const data = await new Promise((resolve, reject) => {
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`;
        const req = https.get(url, (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              reject(new Error("Invalid JSON response"));
            }
          });
        });
        req.on("error", reject);
        req.setTimeout(5000, () => {
          req.destroy();
          reject(new Error("Request timed out"));
        });
      });

      const result = parseDefinitionResponse(data, word);
      if (result.error) return result;

      // Cache with 500-entry limit (evict oldest)
      if (definitionCache.size >= 500) {
        const oldest = definitionCache.keys().next().value;
        definitionCache.delete(oldest);
      }
      definitionCache.set(key, result);

      return result;
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle("add-doc-from-url", async (_, url) => {
    if (!settings.sourceFolder) {
      return { error: "A source folder must be selected before importing from URLs." };
    }
    try {
      const siteKey = getSiteKey(url);
      const hasLogin = siteKey && siteCookies[siteKey] && siteCookies[siteKey].length > 0;
      let html;
      let result;

      if (hasLogin) {
        // Try fast HTTP fetch with session cookies first
        try {
          html = await fetchWithCookies(url);
          result = extractArticleFromHtml(html, url);
        } catch { /* fall through to browser fetch */ }

        // If cookie fetch didn't get article content, try BrowserWindow
        if (!result || result.error) {
          html = await fetchWithBrowser(url);
          result = extractArticleFromHtml(html, url);
        }
      } else {
        html = await fetchWithCookies(url);
        result = extractArticleFromHtml(html, url);
      }

      if (!result || result.error) return result || { error: "Failed to load page content." };

      const docId = Date.now().toString() + Math.random().toString(36).slice(2, 8);

      // Download article cover image if available
      let coverPath = null;
      if (result.imageUrl) {
        try {
          const imgUrl = result.imageUrl.startsWith("//") ? "https:" + result.imageUrl : result.imageUrl;
          const imgResponse = await net.fetch(imgUrl);
          if (imgResponse.ok) {
            const imgBuffer = Buffer.from(await imgResponse.arrayBuffer());
            const imgExt = imgUrl.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[0] || ".jpg";
            const coversDir = path.join(getDataPath(), "covers");
            await fsPromises.mkdir(coversDir, { recursive: true });
            coverPath = path.join(coversDir, `${docId}${imgExt}`);
            await fsPromises.writeFile(coverPath, imgBuffer);
          }
        } catch (err) {
          console.log("[url] Failed to download article image:", err.message);
        }
      }

      const newDoc = {
        id: docId,
        title: result.title, content: result.content,
        wordCount: result.content.split(/\s+/).filter(Boolean).length,
        sourceUrl: url, position: 0, created: Date.now(), source: "url",
        author: result.author || null,
        coverPath,
      };
      getLibrary().unshift(newDoc);
      saveLibrary();

      // Generate PDF if source folder is set
      if (settings.sourceFolder) {
        try {
          const pdfPath = await generateArticlePdf({
            title: newDoc.title,
            author: result.author || null,
            content: result.content,
            sourceUrl: url,
            fetchDate: new Date(),
            outputDir: settings.sourceFolder,
          });

          // Save PDF but keep source as "url" for badge display
          newDoc.source = "url";
          newDoc.filepath = pdfPath;
          newDoc.filename = path.basename(pdfPath);
          newDoc.ext = ".pdf";
          delete newDoc.content;

          // Update in library
          const docs = getLibrary();
          setLibrary(docs.map((d) => (d.id === newDoc.id ? newDoc : d)));
          saveLibrary();
          broadcastLibrary();
        } catch (err) {
          console.error("PDF generation failed, keeping URL-sourced doc:", err);
          console.error("PDF generation error stack:", err.stack);
          logToFile(`PDF generation error for "${newDoc.title}": ${err.message}\n${err.stack}`);
        }
      }

      return { doc: newDoc };
    } catch (err) {
      return { error: err.message || "Failed to fetch URL." };
    }
  });

  // Drag-and-drop: import files — copy to source folder if available, otherwise store as manual
  ipcMain.handle("import-dropped-files", async (_, filePaths) => {
    console.log("[drop] Importing", filePaths.length, "files, sourceFolder:", settings.sourceFolder?.slice(-30));
    const imported = [];
    const rejected = [];
    for (const fp of filePaths) {
      const ext = path.extname(fp).toLowerCase();
      if (!SUPPORTED_EXT.includes(ext)) {
        rejected.push(path.basename(fp));
        continue;
      }

      const docId = Date.now().toString() + Math.random().toString(36).slice(2, 8);

      // If source folder is set, copy file there and add as folder-sourced
      if (settings.sourceFolder) {
        try {
          const destPath = path.join(settings.sourceFolder, path.basename(fp));
          // Don't overwrite if already exists
          if (!require("fs").existsSync(destPath)) {
            await fsPromises.copyFile(fp, destPath);
          }
          const content = await extractContent(destPath);
          if (!content) { rejected.push(path.basename(fp)); continue; }
          const wordCount = content.split(/\s+/).filter(Boolean).length;
          const stat = await fsPromises.stat(destPath);

          let author = null;
          let coverPath = null;
          let bookTitle = null;
          if (ext === ".epub") {
            const meta = await extractEpubMetadata(destPath);
            author = meta.author;
            bookTitle = meta.title;
            coverPath = await extractEpubCover(destPath, docId);
          }
          if (!author) author = extractAuthorFromFilename(path.basename(fp));
          if (!bookTitle) bookTitle = extractTitleFromFilename(path.basename(fp), author);

          const doc = {
            id: docId, title: bookTitle, filepath: destPath, filename: path.basename(destPath),
            ext, size: stat.size, modified: stat.mtimeMs,
            wordCount, position: 0, created: Date.now(), source: "folder",
            author: author || null, coverPath: coverPath || null, lastReadAt: null,
          };
          getLibrary().unshift(doc);
          imported.push(doc.title);
        } catch (err) {
          console.error("Failed to import dropped file:", err);
          rejected.push(path.basename(fp));
        }
      } else {
        // No source folder — store as manual doc with content inline
        const content = await extractContent(fp);
        if (!content) { rejected.push(path.basename(fp)); continue; }
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        const doc = {
          id: docId,
          title: path.basename(fp, ext),
          content, wordCount, ext,
          position: 0, created: Date.now(), source: "manual",
        };
        getLibrary().unshift(doc);
        imported.push(doc.title);
      }
    }
    if (imported.length > 0) {
      saveLibrary();
      broadcastLibrary();
    }
    return { imported, rejected };
  });

  // Reading statistics
  ipcMain.handle("record-reading-session", (_, docTitle, wordsRead, durationMs, wpm) => {
    recordReadingSession(docTitle, wordsRead, durationMs, wpm);
  });

  ipcMain.handle("mark-doc-completed", () => {
    history.docsCompleted = (history.docsCompleted || 0) + 1;
    saveHistory();
  });

  ipcMain.handle("get-stats", () => getStats());

  // Cover images
  ipcMain.handle("get-cover-image", async (_, coverPath) => {
    if (!coverPath) return null;
    try {
      const buffer = await fsPromises.readFile(coverPath);
      const ext = path.extname(coverPath).toLowerCase();
      const mime = ext === ".png" ? "image/png" : ext === ".gif" ? "image/gif" : "image/jpeg";
      return `data:${mime};base64,${buffer.toString("base64")}`;
    } catch { return null; }
  });

  ipcMain.handle("rescan-folder", async () => {
    if (!settings.sourceFolder) return { error: "No source folder selected" };
    console.log("[rescan] Starting rescan of:", settings.sourceFolder);
    failedExtractions.clear(); // Manual rescan retries previously failed files
    try {
      const files = await scanFolderAsync(settings.sourceFolder);
      const docs = getLibrary();
      const existing = new Map(docs.map((d) => [d.filepath, d]));
      const synced = [];

      for (const file of files) {
        const prev = existing.get(file.filepath);
        if (prev) {
          let updates = { ...prev, filename: file.filename, ext: file.ext, modified: file.modified, size: file.size };
          // Re-extract metadata for books missing covers, authors, or with truncated titles
          if (file.ext === ".epub") {
            if (!prev.coverPath || !prev.author || prev.title === path.basename(file.filename, file.ext)) {
              const meta = await extractEpubMetadata(file.filepath);
              if (!prev.author && meta.author) updates.author = meta.author;
              if (meta.title && prev.title === path.basename(file.filename, file.ext)) {
                updates.title = meta.title;
              }
            }
            if (!prev.coverPath) {
              updates.coverPath = await extractEpubCover(file.filepath, prev.id);
            }
          } else if ((file.ext === ".mobi" || file.ext === ".azw3" || file.ext === ".azw") && (!prev.coverPath || !prev.author)) {
            const opfMeta = await parseCallibreOpf(file.filepath);
            if (opfMeta) {
              if (!prev.author && opfMeta.author) updates.author = opfMeta.author;
              if (opfMeta.title && prev.title === path.basename(file.filename, file.ext)) updates.title = opfMeta.title;
              if (!prev.coverPath && opfMeta.coverPath) {
                const coversDir = path.join(app.getPath("userData"), "covers");
                if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });
                const ext = path.extname(opfMeta.coverPath);
                const destCover = path.join(coversDir, `${prev.id}${ext}`);
                try { await fsPromises.copyFile(opfMeta.coverPath, destCover); updates.coverPath = destCover; } catch {}
              }
            }
            if (!prev.coverPath && !updates.coverPath) {
              try {
                const buf = await fsPromises.readFile(file.filepath);
                updates.coverPath = extractMobiCover(buf, prev.id);
              } catch {}
            }
          }
          synced.push(updates);
        } else {
          const content = await extractContent(file.filepath);
          if (content) {
            const wordCount = content.split(/\s+/).filter(Boolean).length;
            const docId = Date.now().toString() + Math.random().toString(36).slice(2, 8);
            let author = null;
            let coverPath = null;
            let bookTitle = null;
            if (file.ext === ".epub") {
              const meta = await extractEpubMetadata(file.filepath);
              author = meta.author;
              bookTitle = meta.title;
              coverPath = await extractEpubCover(file.filepath, docId);
            } else if (file.ext === ".mobi" || file.ext === ".azw3" || file.ext === ".azw") {
              const opfMeta = await parseCallibreOpf(file.filepath);
              if (opfMeta) {
                author = opfMeta.author;
                bookTitle = opfMeta.title;
                if (opfMeta.coverPath) {
                  const coversDir = path.join(app.getPath("userData"), "covers");
                  if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });
                  const ext = path.extname(opfMeta.coverPath);
                  const destCover = path.join(coversDir, `${docId}${ext}`);
                  try { await fsPromises.copyFile(opfMeta.coverPath, destCover); coverPath = destCover; } catch {}
                }
              }
              if (!author || !bookTitle || !coverPath) {
                const buf = await fsPromises.readFile(file.filepath);
                const mobiMeta = parseMobiMetadata(buf);
                if (!author) author = mobiMeta.author;
                if (!bookTitle) bookTitle = mobiMeta.title;
                if (!coverPath) coverPath = extractMobiCover(buf, docId);
              }
            }
            if (!author) author = extractAuthorFromFilename(file.filename);
            if (!bookTitle) bookTitle = extractTitleFromFilename(file.filename, author);
            synced.push({
              id: docId, title: bookTitle, filepath: file.filepath, filename: file.filename,
              ext: file.ext, size: file.size, modified: file.modified,
              wordCount, position: 0, created: Date.now(), source: "folder",
              author: author || null, coverPath: coverPath || null, lastReadAt: null,
            });
          } else {
            failedExtractions.add(file.filepath);
          }
        }
      }

      // Preserve non-folder docs; convert URL docs to PDFs if they have content
      const savedArticlesPath = settings.sourceFolder
        ? path.join(path.resolve(settings.sourceFolder), "Saved Articles")
        : null;
      for (const doc of docs) {
        if (doc.source === "url" && doc.content && settings.sourceFolder) {
          // Retroactively generate PDF for URL-sourced doc
          try {
            const pdfPath = await generateArticlePdf({
              title: doc.title,
              author: null,
              content: doc.content,
              sourceUrl: doc.sourceUrl || "",
              fetchDate: new Date(doc.created || Date.now()),
              outputDir: settings.sourceFolder,
            });
            synced.push({
              ...doc,
              source: "url",  // Keep as URL source for badge display
              filepath: pdfPath,
              filename: path.basename(pdfPath),
              ext: ".pdf",
              content: undefined,
            });
            console.log(`Converted URL doc to PDF: ${doc.title}`);
          } catch (err) {
            console.error(`Failed to convert URL doc "${doc.title}" to PDF:`, err.message);
            synced.push(doc); // keep as-is on failure
          }
        } else if (doc.source !== "folder") {
          synced.push(doc);
        } else if (savedArticlesPath && doc.filepath && path.resolve(doc.filepath).startsWith(savedArticlesPath)) {
          synced.push(doc);
        }
      }

      setLibrary(synced);
      saveLibrary();
      broadcastLibrary();
      return { count: synced.length };
    } catch (err) {
      console.error("Rescan failed:", err);
      return { error: err.message };
    }
  });

  // Import/export
  ipcMain.handle("export-library", async () => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: "Export Blurby Library",
      defaultPath: "blurby-backup.json",
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (result.canceled) return null;
    const exportData = {
      exportedAt: new Date().toISOString(),
      settings: { ...settings },
      library: getLibrary(),
      history,
    };
    await fsPromises.writeFile(result.filePath, JSON.stringify(exportData, null, 2), "utf-8");
    return result.filePath;
  });

  ipcMain.handle("import-library", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Import Blurby Library",
      filters: [{ name: "JSON", extensions: ["json"] }],
      properties: ["openFile"],
    });
    if (result.canceled || !result.filePaths.length) return null;
    try {
      const raw = await fsPromises.readFile(result.filePaths[0], "utf-8");
      const data = JSON.parse(raw);
      if (data.library && Array.isArray(data.library)) {
        // Merge: add imported docs that don't exist by ID
        const existingIds = new Set(getLibrary().map((d) => d.id));
        let added = 0;
        for (const doc of data.library) {
          if (!existingIds.has(doc.id)) {
            getLibrary().push(doc);
            existingIds.add(doc.id);
            added++;
          }
        }
        saveLibrary();
        broadcastLibrary();
        return { added, total: data.library.length };
      }
      return { error: "Invalid backup file format." };
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle("export-stats-csv", async () => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: "Export Reading Stats",
      defaultPath: "blurby-stats.csv",
      filters: [{ name: "CSV", extensions: ["csv"] }],
    });
    if (result.canceled) return null;
    const header = "Date,Document,Words Read,Duration (min),WPM\n";
    const rows = history.sessions.map((s) =>
      `${s.date},"${(s.docTitle || "").replace(/"/g, '""')}",${s.wordsRead},${Math.round((s.durationMs || 0) / 60000)},${s.wpm}`
    ).join("\n");
    await fsPromises.writeFile(result.filePath, header + rows, "utf-8");
    return result.filePath;
  });

  // Auto-updater control
  ipcMain.handle("install-update", () => {
    try { const { autoUpdater } = require("electron-updater"); autoUpdater.quitAndInstall(); } catch {}
  });

  // Launch at login
  ipcMain.handle("get-launch-at-login", () => {
    return app.getLoginItemSettings().openAtLogin;
  });

  ipcMain.handle("set-launch-at-login", (_, enabled) => {
    app.setLoginItemSettings({ openAtLogin: enabled });
    settings.launchAtLogin = enabled;
    saveSettings();
    return enabled;
  });

  // Favorites
  ipcMain.handle("toggle-favorite", (_, docId) => {
    const doc = getLibrary().find((d) => d.id === docId);
    if (doc) {
      doc.favorite = !doc.favorite;
      saveLibrary();
      return doc.favorite;
    }
    return false;
  });

  // Archive
  ipcMain.handle("archive-doc", (_, docId) => {
    const doc = getLibrary().find((d) => d.id === docId);
    if (doc) {
      doc.archived = true;
      doc.archivedAt = Date.now();
      saveLibrary();
    }
  });

  ipcMain.handle("unarchive-doc", (_, docId) => {
    const doc = getLibrary().find((d) => d.id === docId);
    if (doc) {
      doc.archived = false;
      delete doc.archivedAt;
      saveLibrary();
    }
  });

  // Multi-window reader
  ipcMain.handle("open-reader-window", (_, docId) => {
    createReaderWindow(docId);
  });

  // Error logging
  ipcMain.handle("log-error", (_, message) => {
    try {
      const timestamp = new Date().toISOString();
      fs.appendFileSync(getErrorLogPath(), `[${timestamp}] ${message}\n`, "utf-8");
    } catch {}
  });

  // Site logins for paywalled content
  ipcMain.handle("get-site-logins", () => {
    return Object.entries(siteCookies).map(([domain, cookies]) => ({
      domain,
      cookieCount: cookies.length,
    }));
  });

  ipcMain.handle("site-login", async (_, url) => {
    return await openSiteLogin(url);
  });

  ipcMain.handle("site-logout", (_, domain) => {
    delete siteCookies[domain];
    saveSiteCookies();
    // Clear cookies from the login session partition too
    const loginSession = session.fromPartition("persist:site-login");
    loginSession.cookies.get({}).then((cookies) => {
      const relevant = cookies.filter((c) => {
        const d = (c.domain || "").replace(/^\./, "");
        return d === domain || d.endsWith("." + domain);
      });
      for (const c of relevant) {
        const url = `http${c.secure ? "s" : ""}://${c.domain.replace(/^\./, "")}${c.path}`;
        loginSession.cookies.remove(url, c.name).catch(() => {});
      }
    }).catch(() => {});
    return true;
  });
}

// ── App lifecycle ──────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  loadState();
  registerIPC();
  createWindow();
  createTray();
  updateWindowTheme();
  if (!isDev) setupAutoUpdater();

  // Listen for OS theme changes
  nativeTheme.on("updated", () => {
    broadcastSystemTheme();
    if (settings.theme === "system") updateWindowTheme();
  });

  if (settings.sourceFolder) {
    await syncLibraryWithFolder();
    startWatcher();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
  if (watcher) watcher.close();
});

// Export pure functions for testing
if (typeof module !== "undefined") {
  module.exports = { formatHighlightEntry, parseDefinitionResponse, palmDocDecompress };
}
