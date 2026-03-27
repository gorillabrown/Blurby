// main/epub-converter.js -- Format-to-EPUB converters
// CommonJS only -- Electron main process

const crypto = require("crypto");
const path = require("path");
const fsPromises = require("fs").promises;
const {
  EPUB_CONVERTED_DIR,
  TXT_CHAPTER_MIN_LINES,
  PDF_MIN_EXTRACTABLE_WORDS,
} = require("./constants");

// Lazy-loaded heavy dependencies
let AdmZip = null;
function getAdmZip() {
  if (!AdmZip) AdmZip = require("adm-zip");
  return AdmZip;
}

let cheerio = null;
function getCheerio() {
  if (!cheerio) cheerio = require("cheerio");
  return cheerio;
}

let pdfParse = null;
function getPdfParse() {
  if (!pdfParse) pdfParse = require("pdf-parse");
  return pdfParse;
}

// ---------------------------------------------------------------------------
// XML helpers
// ---------------------------------------------------------------------------

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isoNow() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

// ---------------------------------------------------------------------------
// EPUB 3.0 packaging helper
// ---------------------------------------------------------------------------

/**
 * Creates a valid EPUB 3.0 ZIP archive.
 *
 * @param {object} options
 * @param {string} options.outputPath  - where to write .epub
 * @param {string} options.title       - dc:title
 * @param {string} options.author      - dc:creator
 * @param {string} [options.language]  - dc:language (default "en")
 * @param {Array<{title: string, xhtml: string}>} options.chapters
 * @param {Buffer} [options.coverImage] - optional JPEG cover
 * @returns {Promise<string>} outputPath
 */
async function buildEpubZip(options) {
  const {
    outputPath,
    title,
    author,
    language = "en",
    chapters,
    coverImage,
  } = options;

  const Zip = getAdmZip();
  const zip = new Zip();
  const uuid = crypto.randomUUID();

  // mimetype must be the FIRST entry, stored uncompressed (EPUB spec requirement)
  zip.addFile("mimetype", Buffer.from("application/epub+zip", "ascii"));
  const mimetypeEntry = zip.getEntry("mimetype");
  if (mimetypeEntry) mimetypeEntry.header.method = 0; // 0 = STORED (no compression)

  // META-INF/container.xml
  zip.addFile(
    "META-INF/container.xml",
    Buffer.from(
      `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
      "utf-8"
    )
  );

  // Build manifest and spine items
  const manifestItems = [];
  const spineItems = [];

  // Nav document
  manifestItems.push(
    `    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`
  );

  // Chapters
  for (let i = 0; i < chapters.length; i++) {
    const id = `chapter_${i}`;
    const href = `Text/chapter_${i}.xhtml`;
    manifestItems.push(
      `    <item id="${id}" href="${href}" media-type="application/xhtml+xml"/>`
    );
    spineItems.push(`    <itemref idref="${id}"/>`);

    // Write chapter XHTML
    zip.addFile(`OEBPS/${href}`, Buffer.from(chapters[i].xhtml, "utf-8"));
  }

  // Cover image (optional)
  if (coverImage) {
    manifestItems.push(
      `    <item id="cover-image" href="Images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>`
    );
    zip.addFile("OEBPS/Images/cover.jpg", coverImage);
  }

  // content.opf
  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:${uuid}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator>${escapeXml(author)}</dc:creator>
    <dc:language>${escapeXml(language)}</dc:language>
    <meta property="dcterms:modified">${isoNow()}</meta>
  </metadata>
  <manifest>
${manifestItems.join("\n")}
  </manifest>
  <spine>
${spineItems.join("\n")}
  </spine>
</package>`;
  zip.addFile("OEBPS/content.opf", Buffer.from(opf, "utf-8"));

  // nav.xhtml -- EPUB 3 navigation document
  const navItems = chapters
    .map(
      (ch, i) =>
        `      <li><a href="Text/chapter_${i}.xhtml">${escapeXml(ch.title)}</a></li>`
    )
    .join("\n");
  const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>${escapeXml(title)}</title></head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
${navItems}
    </ol>
  </nav>
</body>
</html>`;
  zip.addFile("OEBPS/nav.xhtml", Buffer.from(navXhtml, "utf-8"));

  // Write to disk
  await fsPromises.mkdir(path.dirname(outputPath), { recursive: true });
  const buffer = zip.toBuffer();
  await fsPromises.writeFile(outputPath, buffer);

  return outputPath;
}

// ---------------------------------------------------------------------------
// Chapter XHTML wrapper
// ---------------------------------------------------------------------------

function wrapChapterXhtml(title, bodyHtml) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${escapeXml(title)}</title></head>
<body>
<h1>${escapeXml(title)}</h1>
${bodyHtml}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Text chapter detection
// ---------------------------------------------------------------------------

/** Regex patterns that look like chapter headings */
const CHAPTER_PATTERNS = [
  /^chapter\s+\w+/i,
  /^part\s+\w+/i,
  /^(?:I{1,4}|IV|VI{0,3}|IX|XI{0,3})\.\s/,  // Roman numeral headings: I. II. III. etc.
  /^\d+\.\s/,                                    // Numbered: 1. 2. etc.
  /^[A-Z][A-Z\s]{2,}$/,                          // ALL CAPS lines (at least 3 chars)
];

/**
 * Detect whether a line looks like a chapter heading:
 * - Short (<80 chars)
 * - Matches a heading pattern
 * - Preceded and followed by blank lines (checked by caller via context)
 */
function isChapterHeading(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length >= 80) return false;
  return CHAPTER_PATTERNS.some((re) => re.test(trimmed));
}

/**
 * Split text into chapters based on heading detection.
 * Returns array of { title, text } objects.
 */
function detectChapters(fullText) {
  const lines = fullText.split("\n");
  const boundaries = [];

  for (let i = 0; i < lines.length; i++) {
    const prevBlank = i === 0 || lines[i - 1].trim() === "";
    const nextBlank = i === lines.length - 1 || lines[i + 1].trim() === "";
    if (prevBlank && nextBlank && isChapterHeading(lines[i])) {
      // Enforce minimum distance between chapters
      if (
        boundaries.length === 0 ||
        i - boundaries[boundaries.length - 1].line >= TXT_CHAPTER_MIN_LINES
      ) {
        boundaries.push({ line: i, title: lines[i].trim() });
      }
    }
  }

  if (boundaries.length === 0) {
    return [{ title: "Chapter 1", text: fullText }];
  }

  const chapters = [];
  for (let b = 0; b < boundaries.length; b++) {
    const startLine = boundaries[b].line + 1; // skip heading line itself
    const endLine =
      b + 1 < boundaries.length ? boundaries[b + 1].line : lines.length;
    const chapterText = lines.slice(startLine, endLine).join("\n").trim();
    if (chapterText) {
      chapters.push({ title: boundaries[b].title, text: chapterText });
    }
  }

  // Content before the first boundary
  const preamble = lines.slice(0, boundaries[0].line).join("\n").trim();
  if (preamble) {
    chapters.unshift({ title: "Preamble", text: preamble });
  }

  return chapters;
}

/**
 * Convert plain text paragraphs to HTML <p> elements.
 */
function textToHtml(text) {
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeXml(p)}</p>`)
    .join("\n");
}

// ---------------------------------------------------------------------------
// txtToEpub
// ---------------------------------------------------------------------------

async function txtToEpub(inputPath, outputPath, meta = {}) {
  const raw = await fsPromises.readFile(inputPath, "utf-8");
  const title =
    meta.title || path.basename(inputPath, path.extname(inputPath));
  const author = meta.author || "Unknown";

  const detected = detectChapters(raw);
  const chapters = detected.map((ch) => ({
    title: ch.title,
    xhtml: wrapChapterXhtml(ch.title, textToHtml(ch.text)),
  }));

  await buildEpubZip({ outputPath, title, author, chapters });

  // Validate the generated EPUB
  const validation = await validateEpub(outputPath);

  return {
    epubPath: outputPath,
    title,
    author,
    chapterCount: chapters.length,
    valid: validation.valid,
    errors: validation.errors,
  };
}

// ---------------------------------------------------------------------------
// mdToEpub
// ---------------------------------------------------------------------------

/**
 * Minimal Markdown to HTML conversion.
 * Handles: headings, bold, italic, links, code fences, paragraphs.
 */
function mdToHtml(mdText) {
  let html = "";
  const lines = mdText.split("\n");
  let inCodeFence = false;
  let codeBlock = [];
  let paragraph = [];

  function flushParagraph() {
    if (paragraph.length > 0) {
      const text = paragraph.join("\n").trim();
      if (text) {
        html += `<p>${inlineMd(text)}</p>\n`;
      }
      paragraph = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code fences
    if (line.trim().startsWith("```")) {
      if (inCodeFence) {
        html += `<pre><code>${escapeXml(codeBlock.join("\n"))}</code></pre>\n`;
        codeBlock = [];
        inCodeFence = false;
      } else {
        flushParagraph();
        inCodeFence = true;
      }
      continue;
    }
    if (inCodeFence) {
      codeBlock.push(line);
      continue;
    }

    // Blank line -> flush paragraph
    if (line.trim() === "") {
      flushParagraph();
      continue;
    }

    // Headings (only ## and below -- # is used for chapter split)
    if (/^#{1,6}\s/.test(line)) {
      flushParagraph();
      const level = line.match(/^(#+)/)[1].length;
      const text = line.replace(/^#+\s*/, "").trim();
      html += `<h${level}>${inlineMd(escapeXml(text))}</h${level}>\n`;
      continue;
    }

    paragraph.push(line);
  }

  // Flush any remaining code block
  if (inCodeFence && codeBlock.length > 0) {
    html += `<pre><code>${escapeXml(codeBlock.join("\n"))}</code></pre>\n`;
  }
  flushParagraph();

  return html;
}

/**
 * Inline markdown: bold, italic, links.
 */
function inlineMd(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

async function mdToEpub(inputPath, outputPath, meta = {}) {
  const raw = await fsPromises.readFile(inputPath, "utf-8");
  const title =
    meta.title || path.basename(inputPath, path.extname(inputPath));
  const author = meta.author || "Unknown";

  // Split at # and ## headings as chapter boundaries
  const sections = raw.split(/^(?=#{1,2}\s)/m);
  const chapters = [];

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    // Extract heading if present
    const headingMatch = trimmed.match(/^(#{1,2})\s+(.+)/);
    const chTitle = headingMatch
      ? headingMatch[2].trim()
      : `Chapter ${chapters.length + 1}`;
    const body = headingMatch
      ? trimmed.slice(trimmed.indexOf("\n") + 1)
      : trimmed;
    const bodyHtml = mdToHtml(body);

    chapters.push({
      title: chTitle,
      xhtml: wrapChapterXhtml(chTitle, bodyHtml),
    });
  }

  if (chapters.length === 0) {
    chapters.push({
      title: "Chapter 1",
      xhtml: wrapChapterXhtml("Chapter 1", mdToHtml(raw)),
    });
  }

  await buildEpubZip({ outputPath, title, author, chapters });

  // Validate the generated EPUB
  const validation = await validateEpub(outputPath);

  return {
    epubPath: outputPath,
    title,
    author,
    chapterCount: chapters.length,
    valid: validation.valid,
    errors: validation.errors,
  };
}

// ---------------------------------------------------------------------------
// htmlToEpub
// ---------------------------------------------------------------------------

async function htmlToEpub(inputPath, outputPath, meta = {}) {
  const raw = await fsPromises.readFile(inputPath, "utf-8");
  const $ = getCheerio().load(raw);

  // Extract title from <title> if not provided
  const title =
    meta.title ||
    $("title").first().text().trim() ||
    path.basename(inputPath, path.extname(inputPath));
  const author = meta.author || "Unknown";

  // Strip unwanted elements
  $("script, style, nav, header, footer, aside").remove();

  // Split at h1/h2 boundaries
  const chapters = [];
  const body = $("body");
  const children = body.children().toArray();

  let currentTitle = null;
  let currentContent = [];

  function flushChapter() {
    if (currentContent.length > 0) {
      const chTitle =
        currentTitle || `Chapter ${chapters.length + 1}`;
      const bodyHtml = currentContent.join("\n");
      chapters.push({
        title: chTitle,
        xhtml: wrapChapterXhtml(chTitle, bodyHtml),
      });
      currentContent = [];
      currentTitle = null;
    }
  }

  for (const el of children) {
    const tagName = (el.tagName || "").toLowerCase();
    if (tagName === "h1" || tagName === "h2") {
      flushChapter();
      currentTitle = $(el).text().trim();
    }
    currentContent.push($.html(el));
  }
  flushChapter();

  if (chapters.length === 0) {
    chapters.push({
      title: title,
      xhtml: wrapChapterXhtml(title, body.html() || ""),
    });
  }

  await buildEpubZip({ outputPath, title, author, chapters });

  // Validate the generated EPUB
  const validation = await validateEpub(outputPath);

  return {
    epubPath: outputPath,
    title,
    author,
    chapterCount: chapters.length,
    valid: validation.valid,
    errors: validation.errors,
  };
}

// ---------------------------------------------------------------------------
// pdfToEpub
// ---------------------------------------------------------------------------

async function pdfToEpub(inputPath, outputPath, meta = {}, _deps = {}) {
  const buffer = await fsPromises.readFile(inputPath);
  const parse = _deps.pdfParse || getPdfParse();
  const data = await parse(buffer);

  const title =
    meta.title ||
    (data.info && data.info.Title) ||
    path.basename(inputPath, ".pdf");
  const author =
    meta.author ||
    (data.info && data.info.Author) ||
    "Unknown";

  const text = (data.text || "").trim();

  // Detect scanned/image-based PDFs that produce no extractable text
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < PDF_MIN_EXTRACTABLE_WORDS) {
    const err = new Error(
      "This PDF appears to be image-based or scanned. Blurby can only read text-based PDFs."
    );
    err.code = "PDF_NOT_READABLE";
    err.userError = true;
    throw err;
  }

  const detected = detectChapters(text);
  const chapters = detected.map((ch) => ({
    title: ch.title,
    xhtml: wrapChapterXhtml(ch.title, textToHtml(ch.text)),
  }));

  await buildEpubZip({ outputPath, title, author, chapters });

  // Validate the generated EPUB
  const validation = await validateEpub(outputPath);

  return {
    epubPath: outputPath,
    title,
    author,
    chapterCount: chapters.length,
    valid: validation.valid,
    errors: validation.errors,
  };
}

// ---------------------------------------------------------------------------
// mobiToEpub
// ---------------------------------------------------------------------------

async function mobiToEpub(inputPath, outputPath, meta = {}, _deps = {}) {
  const { parseMobiContent, parseMobiMetadata, extractMobiCover } =
    _deps.fileParsers || require("./file-parsers");

  const buffer = await fsPromises.readFile(inputPath);
  const text = parseMobiContent(buffer);
  if (!text) {
    throw new Error(`Failed to extract text from MOBI: ${inputPath}`);
  }

  const mobiMeta = parseMobiMetadata(buffer);
  const title = meta.title || mobiMeta.title || path.basename(inputPath, path.extname(inputPath));
  const author = meta.author || mobiMeta.author || "Unknown";

  // Extract cover image (best-effort, no userDataPath needed -- use temp dir)
  let coverImage = null;
  try {
    const os = require("os");
    const tmpDir = os.tmpdir();
    const coverPath = await extractMobiCover(buffer, "temp-cover", tmpDir);
    if (coverPath) {
      coverImage = await fsPromises.readFile(coverPath);
      // Clean up temp cover
      await fsPromises.unlink(coverPath).catch(() => {});
    }
  } catch {
    // Cover extraction is best-effort
  }

  const detected = detectChapters(text);
  const chapters = detected.map((ch) => ({
    title: ch.title,
    xhtml: wrapChapterXhtml(ch.title, textToHtml(ch.text)),
  }));

  await buildEpubZip({ outputPath, title, author, chapters, coverImage });

  // Validate the generated EPUB
  const validation = await validateEpub(outputPath);

  return {
    epubPath: outputPath,
    title,
    author,
    chapterCount: chapters.length,
    valid: validation.valid,
    errors: validation.errors,
  };
}

// ---------------------------------------------------------------------------
// convertToEpub -- orchestrator
// ---------------------------------------------------------------------------

async function convertToEpub(inputPath, outputDir, docId, meta = {}) {
  const ext = path.extname(inputPath).toLowerCase();
  const outputPath = path.join(
    outputDir,
    EPUB_CONVERTED_DIR,
    `${docId}.epub`
  );

  switch (ext) {
    case ".txt":
    case ".text":
    case ".rst":
      return txtToEpub(inputPath, outputPath, meta);

    case ".md":
    case ".markdown":
      return mdToEpub(inputPath, outputPath, meta);

    case ".html":
    case ".htm":
      return htmlToEpub(inputPath, outputPath, meta);

    case ".pdf":
      return pdfToEpub(inputPath, outputPath, meta);

    case ".mobi":
    case ".azw3":
    case ".azw":
      return mobiToEpub(inputPath, outputPath, meta);

    case ".epub": {
      // Already EPUB -- copy to output directory
      await fsPromises.mkdir(path.dirname(outputPath), { recursive: true });
      await fsPromises.copyFile(inputPath, outputPath);
      const title =
        meta.title || path.basename(inputPath, ".epub");
      const author = meta.author || "Unknown";
      // Validate the copied EPUB
      const validation = await validateEpub(outputPath);
      return { epubPath: outputPath, title, author, valid: validation.valid, errors: validation.errors };
    }

    default:
      throw new Error(`Unsupported format for EPUB conversion: ${ext}`);
  }
}

/**
 * Validate that an EPUB file has the required structure.
 * Checks: mimetype entry, container.xml, content.opf, at least one content file.
 * @param {string} epubPath — path to the EPUB file
 * @returns {{ valid: boolean, errors: string[] }}
 */
async function validateEpub(epubPath) {
  const errors = [];
  try {
    const Zip = getAdmZip();
    const zip = new Zip(epubPath);
    const entries = zip.getEntries().map((e) => e.entryName);

    // Check mimetype
    if (!entries.includes("mimetype")) {
      errors.push("Missing mimetype entry");
    } else {
      const mimetype = zip.readAsText("mimetype").trim();
      if (mimetype !== "application/epub+zip") {
        errors.push(`Invalid mimetype: "${mimetype}"`);
      }
    }

    // Check container.xml
    const containerEntry = entries.find((e) => e.endsWith("container.xml"));
    if (!containerEntry) {
      errors.push("Missing META-INF/container.xml");
    }

    // Check content.opf and validate spine references
    const opfEntry = entries.find((e) => e.endsWith(".opf"));
    if (!opfEntry) {
      errors.push("Missing content.opf");
    } else {
      const opfXml = zip.readAsText(opfEntry);
      const $ = getCheerio().load(opfXml, { xmlMode: true });

      // Extract manifest items: id → href
      const manifestIds = new Set();
      $("manifest item").each((_, el) => {
        const id = $(el).attr("id");
        if (id) manifestIds.add(id);
      });

      // Extract spine itemrefs and verify each references a manifest item
      const spineRefs = [];
      $("spine itemref").each((_, el) => {
        const idref = $(el).attr("idref");
        if (idref) spineRefs.push(idref);
      });

      if (spineRefs.length === 0) {
        errors.push("Spine has no itemref entries");
      }

      for (const idref of spineRefs) {
        if (!manifestIds.has(idref)) {
          errors.push(`Spine references unknown manifest id: "${idref}"`);
        }
      }
    }

    // Check at least one XHTML content file
    const xhtmlFiles = entries.filter((e) => e.endsWith(".xhtml") || e.endsWith(".html"));
    if (xhtmlFiles.length === 0) {
      errors.push("No XHTML content files found");
    }

    // Check mimetype compression method (EPUB spec: must be STORED, not DEFLATED)
    const mimetypeZipEntry = zip.getEntry("mimetype");
    if (mimetypeZipEntry && mimetypeZipEntry.header.method !== 0) {
      errors.push("Mimetype entry must be stored uncompressed (method=STORED)");
    }
  } catch (err) {
    errors.push(`Failed to read EPUB: ${err.message}`);
  }
  return { valid: errors.length === 0, errors };
}

module.exports = {
  buildEpubZip,
  validateEpub,
  txtToEpub,
  mdToEpub,
  htmlToEpub,
  pdfToEpub,
  mobiToEpub,
  convertToEpub,
  // Exported for testing
  escapeXml,
  detectChapters,
  textToHtml,
  wrapChapterXhtml,
  isChapterHeading,
};
