// main/url-extractor.js — URL article fetching and extraction
// CommonJS only — Electron main process

const { BrowserWindow, session } = require("electron");
const { ARTICLE_MAX_INLINE_IMAGES, ARTICLE_IMAGE_MIN_SIZE, ARTICLE_JUNK_IMAGE_PATTERNS } = require("./constants");
const fsPromises = require("fs/promises");
const path = require("path");

// Lazy-loaded heavy modules
let _Readability, _JSDOM, _PDFDocument;
function getReadability() { if (!_Readability) { _Readability = require("@mozilla/readability").Readability; } return _Readability; }
function getJSDOM() { if (!_JSDOM) { _JSDOM = require("jsdom").JSDOM; } return _JSDOM; }
function getPDFDocument() { if (!_PDFDocument) { _PDFDocument = require("pdfkit"); } return _PDFDocument; }

let _cheerio;
function getCheerio() { if (!_cheerio) { _cheerio = require("cheerio"); } return _cheerio; }

function sanitizeFilenameForPdf(name) {
  return (name || "")
    .replace(/[<>:"/\\|?*\x00-\x1f\s]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "untitled";
}

// ── APA citation helpers ─────────────────────────────────────────────────────

/**
 * Format a single author name in APA style: "First Last" → "Last, F."
 * "First Middle Last" → "Last, F. M."
 */
function formatSingleAuthorAPA(name) {
  const trimmed = name.trim();
  if (!trimmed) return "";
  // Already in "Last, F." format?
  if (/^[^,]+,\s*[A-Z]\./.test(trimmed)) return trimmed;
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0]; // single token, just return it
  const last = parts[parts.length - 1];
  const initials = parts.slice(0, -1).map((p) => `${p[0].toUpperCase()}.`).join(" ");
  return `${last}, ${initials}`;
}

/**
 * Format author string(s) in APA style.
 * Handles multiple authors separated by " & ", " and ", or ", ".
 * Returns APA-formatted string, or raw string if unparseable.
 */
function formatAuthorAPA(authorString) {
  if (!authorString || !authorString.trim()) return "";
  // Split on " & ", " and " (word boundary), or "; "
  const parts = authorString
    .split(/\s+&\s+|\s+and\s+|;\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return authorString;
  const formatted = parts.map(formatSingleAuthorAPA);
  if (formatted.length === 1) return formatted[0];
  const allButLast = formatted.slice(0, -1).join(", ");
  return `${allButLast}, & ${formatted[formatted.length - 1]}`;
}

/**
 * Format a date for APA: "(2024, March 15)." or "(n.d.)."
 * Accepts ISO string, Date object, or null.
 */
function formatDateAPA(publishedDate) {
  if (!publishedDate) return "(n.d.).";
  try {
    const d = new Date(publishedDate);
    if (isNaN(d.getTime())) return "(n.d.).";
    const year = d.getFullYear();
    const month = d.toLocaleString("en-US", { month: "long" });
    const day = d.getDate();
    return `(${year}, ${month} ${day}).`;
  } catch {
    return "(n.d.).";
  }
}

async function generateArticlePdf({ title, author, content, sourceUrl, fetchDate, outputDir, sourceDomain, publishedDate }) {
  const safeName = sanitizeFilenameForPdf(title);
  const savedArticlesDir = path.join(outputDir, "Saved Articles");
  await fsPromises.mkdir(savedArticlesDir, { recursive: true });
  const pdfPath = path.join(savedArticlesDir, `${safeName}.pdf`);

  const apaAuthor = author ? formatAuthorAPA(author) : null;
  const apaDate = formatDateAPA(publishedDate);
  const keywordParts = [`source:${sourceUrl}`];
  if (sourceDomain) keywordParts.push(`domain:${sourceDomain}`);
  if (publishedDate) keywordParts.push(`published:${publishedDate}`);

  return new Promise((resolve, reject) => {
    const doc = new (getPDFDocument())({
      info: {
        Title: title,
        Author: apaAuthor || author || "",
        Keywords: keywordParts.join(", "),
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

    // ── APA Header ────────────────────────────────────────────────────────
    // Line 1: APA author(s) — omit entirely if no author
    if (apaAuthor) {
      doc.fontSize(11).fillColor("#222").text(apaAuthor, { align: "left" });
      doc.moveDown(0.3);
    }

    // Line 2: APA date "(Year, Month Day)." or "(n.d.)."
    doc.fontSize(11).fillColor("#222").text(apaDate, { align: "left" });
    doc.moveDown(0.3);

    // Line 3: Title in italics, 14pt, black, left-aligned
    doc.fontSize(14).fillColor("#000").font("Helvetica-Oblique").text(title, { align: "left" });
    doc.moveDown(0.3);

    // Line 4: Source domain, 11pt, black
    if (sourceDomain) {
      doc.fontSize(11).fillColor("#000").font("Helvetica").text(sourceDomain, { align: "left" });
      doc.moveDown(0.3);
    }

    // Line 5: Full URL as clickable link, 9pt, gray
    doc.fontSize(9).fillColor("#666").font("Helvetica").text(sourceUrl, { align: "left", link: sourceUrl, underline: true });
    doc.moveDown(1);

    // Separator: 0.5pt horizontal rule in brand coral #FF5B7F
    const pageMargin = 72; // pdfkit default left margin
    const lineY = doc.y;
    doc
      .save()
      .moveTo(pageMargin, lineY)
      .lineTo(doc.page.width - pageMargin, lineY)
      .lineWidth(0.5)
      .strokeColor("#FF5B7F")
      .stroke()
      .restore();
    doc.moveDown(1);

    // ── Body ──────────────────────────────────────────────────────────────
    doc.fontSize(11).fillColor("#333").font("Helvetica");
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

// ── Site login helpers ──────────────────────────────────────────────────────

function getSiteKey(url) {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split(".");
    return parts.length > 2 ? parts.slice(-2).join(".") : hostname;
  } catch { return null; }
}

function getCookiesForUrl(url, siteCookies) {
  const siteKey = getSiteKey(url);
  if (!siteKey) return [];
  const cookies = [];
  for (const [domain, domainCookies] of Object.entries(siteCookies)) {
    if (siteKey === domain || siteKey.endsWith("." + domain)) {
      cookies.push(...domainCookies);
    }
  }
  return cookies;
}

function openSiteLogin(siteUrl, mainWindow, siteCookies, saveSiteCookies) {
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
      const loginSession = session.fromPartition("persist:site-login");
      loginSession.cookies.get({})
        .then((allCookies) => {
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

// ── Fetch helpers ───────────────────────────────────────────────────────────

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

// ── Provenance helpers ───────────────────────────────────────────────────────

/** Strip "By " prefix (case-insensitive) and normalize whitespace. */
function cleanAuthorName(raw) {
  if (!raw) return null;
  return raw.replace(/^\s*[Bb][Yy]\s+/, "").replace(/\s+/g, " ").trim() || null;
}

/** Extract author from JSON-LD author field (object or array). */
function extractAuthorFromJsonLd(item) {
  const authorField = item.author;
  if (!authorField) return null;
  if (Array.isArray(authorField)) {
    const names = authorField.map((a) => (typeof a === "string" ? a : a.name)).filter(Boolean);
    return names.length ? names.join(" & ") : null;
  }
  if (typeof authorField === "string") return authorField;
  return authorField.name || null;
}

/** Extract date from JSON-LD item. Returns ISO string or null. */
function extractDateFromJsonLd(item) {
  const raw = item.datePublished || item.dateCreated || null;
  if (!raw) return null;
  try { return new Date(raw).toISOString(); } catch { return null; }
}

/** Extract publisher/site name from JSON-LD item. */
function extractPublisherFromJsonLd(item) {
  const pub = item.publisher;
  if (!pub) return null;
  if (typeof pub === "string") return pub;
  return pub.name || null;
}

/** Title-case a hostname: e.g. "bbc.com" → "BBC.com" would just return "bbc.com" title-cased. */
function titleCaseHostname(hostname) {
  return hostname
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(".");
}

/**
 * Check if an image URL matches common junk patterns (logos, icons, tracking pixels, etc.)
 */
function isJunkImageUrl(urlStr) {
  if (!urlStr) return true;
  const lower = urlStr.toLowerCase();
  return ARTICLE_JUNK_IMAGE_PATTERNS.some((pat) => lower.includes(pat));
}

/**
 * Collect article asset manifest from cleaned article HTML.
 * Finds all <img> elements, resolves URLs, dedupes, and associates captions.
 *
 * @param {string} contentHtml - Cleaned article HTML from Readability
 * @param {string} baseUrl - Base URL for resolving relative image paths
 * @returns {{ images: Array<{src: string, alt: string, caption: string|null, resolvedUrl: string}> }}
 */
function collectArticleAssets(contentHtml, baseUrl) {
  if (!contentHtml) return { images: [] };
  const $ = getCheerio().load(contentHtml);
  const seen = new Set();
  const images = [];

  $("img").each((_, el) => {
    const src = $(el).attr("src");
    if (!src) return;

    let resolvedUrl;
    try {
      resolvedUrl = new URL(src, baseUrl).href;
    } catch {
      resolvedUrl = src;
    }

    // Skip data URIs (already embedded) and duplicates
    if (resolvedUrl.startsWith("data:")) return;
    if (seen.has(resolvedUrl)) return;
    seen.add(resolvedUrl);

    // Check for caption from parent <figure>
    let caption = null;
    const parent = $(el).closest("figure");
    if (parent.length) {
      const figcaption = parent.find("figcaption").first();
      if (figcaption.length) {
        caption = figcaption.text().trim() || null;
      }
    }

    images.push({
      src,
      alt: $(el).attr("alt") || "",
      caption,
      resolvedUrl,
    });
  });

  return { images: images.slice(0, ARTICLE_MAX_INLINE_IMAGES) };
}

/**
 * Rank hero image candidates with article-aware heuristics.
 * Prefers real article lead images over logos/tiny thumbnails.
 *
 * @param {string|null} metadataImageUrl - og:image or similar from metadata
 * @param {Array<{resolvedUrl: string}>} articleImages - from collectArticleAssets
 * @param {object} parsedDoc - JSDOM document for fallback queries
 * @param {string} url - page URL for resolving relative paths
 * @returns {string|null} Best hero image URL
 */
function rankHeroImage(metadataImageUrl, articleImages, parsedDoc, url) {
  // Filter article images: reject junk URLs
  const validArticleImages = (articleImages || []).filter(
    (img) => !isJunkImageUrl(img.resolvedUrl)
  );

  // Strategy 1: If metadata image is also in the article body, it is a strong hero
  if (metadataImageUrl && !isJunkImageUrl(metadataImageUrl)) {
    const metaNorm = metadataImageUrl.toLowerCase();
    const inBody = validArticleImages.some(
      (img) => img.resolvedUrl.toLowerCase() === metaNorm
    );
    if (inBody) return metadataImageUrl;
  }

  // Strategy 2: First non-junk article image near the top (first 3)
  const topImages = validArticleImages.slice(0, 3);
  if (topImages.length > 0) {
    return topImages[0].resolvedUrl;
  }

  // Strategy 3: Metadata image as fallback (even if not in body)
  if (metadataImageUrl && !isJunkImageUrl(metadataImageUrl)) {
    return metadataImageUrl;
  }

  // Strategy 4: First large <img> in article body from DOM
  const articleEl = parsedDoc.querySelector("article, [role='main'], .article-body, [data-testid='article-body']");
  if (articleEl) {
    for (const img of articleEl.querySelectorAll("img[src]")) {
      const w = parseInt(img.getAttribute("width") || "0", 10);
      const naturalW = parseInt(img.getAttribute("naturalWidth") || "0", 10);
      if ((w >= 400 || naturalW >= 400) && img.getAttribute("src")) {
        let src = img.getAttribute("src");
        try { src = new URL(src, url).href; } catch { /* keep as-is */ }
        if (!isJunkImageUrl(src)) return src;
      }
    }
  }

  return null;
}

function extractArticleFromHtml(html, url) {
  const dom = new (getJSDOM())(html, { url });
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
  let contentHtml = null; // Cleaned HTML for EPUB conversion

  // Provenance accumulators
  let author = null;
  let sourceDomain = null;
  let publishedDate = null;
  let imageUrl = null;

  // Collected JSON-LD items for provenance (populated in step 2)
  let jsonLdItems = [];

  // 1. Try __preloadedData JSON from raw HTML (NYT and similar React-rendered sites)
  let preloadedArticle = null;
  const preloadIdx = html.indexOf("window.__preloadedData");
  if (preloadIdx !== -1) {
    const eqIdx = html.indexOf("=", preloadIdx);
    if (eqIdx !== -1) {
      const jsonStart = html.indexOf("{", eqIdx);
      if (jsonStart !== -1) {
        const scriptEnd = html.indexOf("</script>", jsonStart);
        if (scriptEnd !== -1) {
          let jsonStr = html.substring(jsonStart, scriptEnd).replace(/;\s*$/, "");
          jsonStr = jsonStr.replace(/:\s*undefined\b/g, ": null");
          try {
            const data = JSON.parse(jsonStr);
            const article = data?.initialData?.data?.article;
            if (article) {
              preloadedArticle = article;
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

              // NYT-specific provenance: bylines
              if (!author) {
                const bylines = article.bylines || [];
                const bylineNames = bylines
                  .map((b) => b.renderedRepresentation || b.bylineString || null)
                  .filter(Boolean);
                if (bylineNames.length) {
                  author = cleanAuthorName(bylineNames.join(" & "));
                }
              }

              // NYT lead image from preloadedData
              if (!imageUrl) {
                const leadMedia = article.leadMedia || article.promotionalMedia;
                if (leadMedia) {
                  // Navigate to URL within media object
                  const mediaUrl = leadMedia.url ||
                    leadMedia.renditions?.[0]?.url ||
                    leadMedia.crops?.[0]?.renditions?.[0]?.url ||
                    null;
                  if (mediaUrl) imageUrl = mediaUrl;
                }
              }
            }
          } catch { /* skip parse errors */ }
        }
      }
    }
  }

  // 2. Try JSON-LD structured data (articleBody field + provenance)
  for (const script of parsedDoc.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(script.textContent);
      const items = Array.isArray(data) ? data : [data];
      // Flatten @graph
      const expanded = [];
      for (const item of items) {
        expanded.push(item);
        if (item["@graph"]) expanded.push(...item["@graph"]);
      }
      jsonLdItems.push(...expanded);

      for (const item of expanded) {
        if (!content && item.articleBody) {
          content = item.articleBody;
          title = title || item.headline;
        }
      }
    } catch { /* skip */ }
  }

  // Extract provenance from JSON-LD items
  for (const item of jsonLdItems) {
    if (!author) {
      const a = extractAuthorFromJsonLd(item);
      if (a) author = cleanAuthorName(a);
    }
    if (!publishedDate) {
      publishedDate = extractDateFromJsonLd(item);
    }
    if (!sourceDomain) {
      const pub = extractPublisherFromJsonLd(item);
      if (pub) sourceDomain = pub;
    }
    // JSON-LD image field
    if (!imageUrl) {
      const imgField = item.image;
      if (imgField) {
        if (typeof imgField === "string") imageUrl = imgField;
        else if (imgField.url) imageUrl = imgField.url;
        else if (Array.isArray(imgField) && imgField[0]) {
          imageUrl = typeof imgField[0] === "string" ? imgField[0] : imgField[0].url || null;
        }
      }
    }
  }

  // 3. Try Readability (also captures byline + HTML)
  let readabilityByline = null;
  if (!content) {
    // Clone the document since Readability mutates it
    const readerDom = new (getJSDOM())(html, { url });
    const reader = new (getReadability())(readerDom.window.document);
    const article = reader.parse();
    if (article?.textContent?.trim()) {
      content = article.textContent.trim();
      if (article.content) contentHtml = article.content; // Readability cleaned HTML
      title = title || article.title;
    }
    if (article?.byline) readabilityByline = article.byline;
  } else {
    // Still want Readability byline + HTML even if we got content elsewhere
    try {
      const readerDom = new (getJSDOM())(html, { url });
      const reader = new (getReadability())(readerDom.window.document);
      const article = reader.parse();
      if (article?.byline) readabilityByline = article.byline;
      if (article?.content && !contentHtml) contentHtml = article.content;
    } catch { /* ignore */ }
  }

  // Author fallback cascade (after JSON-LD and preloadedData)
  if (!author) {
    // meta[name="author"]
    const metaAuthor = parsedDoc.querySelector('meta[name="author"]');
    if (metaAuthor?.getAttribute("content")) {
      author = cleanAuthorName(metaAuthor.getAttribute("content"));
    }
  }
  if (!author) {
    // meta[property="article:author"]
    const articleAuthor = parsedDoc.querySelector('meta[property="article:author"]');
    if (articleAuthor?.getAttribute("content")) {
      author = cleanAuthorName(articleAuthor.getAttribute("content"));
    }
  }
  if (!author && readabilityByline) {
    author = cleanAuthorName(readabilityByline);
  }
  if (!author) {
    // DOM selectors: byline/author classes, rel="author"
    const authorSelectors = [
      '[class*="byline"] [itemprop="name"]',
      '[class*="author"] [itemprop="name"]',
      '[rel="author"]',
      '[class*="byline"]',
      '[class*="author"]',
    ];
    for (const sel of authorSelectors) {
      const el = parsedDoc.querySelector(sel);
      const text = el?.textContent?.trim();
      if (text && text.length < 100) {
        author = cleanAuthorName(text);
        if (author) break;
      }
    }
  }

  // Source domain cascade
  if (!sourceDomain) {
    const ogSiteName = parsedDoc.querySelector('meta[property="og:site_name"]');
    if (ogSiteName?.getAttribute("content")) sourceDomain = ogSiteName.getAttribute("content").trim();
  }
  if (!sourceDomain) {
    const appName = parsedDoc.querySelector('meta[name="application-name"]');
    if (appName?.getAttribute("content")) sourceDomain = appName.getAttribute("content").trim();
  }
  if (!sourceDomain) {
    // Fallback: hostname without leading www., title-cased
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, "");
      sourceDomain = titleCaseHostname(hostname);
    } catch { /* ignore */ }
  }

  // Publication date cascade
  if (!publishedDate) {
    const articlePubTime = parsedDoc.querySelector('meta[property="article:published_time"]');
    if (articlePubTime?.getAttribute("content")) {
      try { publishedDate = new Date(articlePubTime.getAttribute("content")).toISOString(); } catch { /* skip */ }
    }
  }
  if (!publishedDate) {
    const metaDate = parsedDoc.querySelector('meta[name="date"], meta[name="publication_date"]');
    if (metaDate?.getAttribute("content")) {
      try { publishedDate = new Date(metaDate.getAttribute("content")).toISOString(); } catch { /* skip */ }
    }
  }
  if (!publishedDate) {
    // <time> with datetime inside article body
    const timeEl = parsedDoc.querySelector("article time[datetime], [role='main'] time[datetime]");
    if (timeEl?.getAttribute("datetime")) {
      try { publishedDate = new Date(timeEl.getAttribute("datetime")).toISOString(); } catch { /* skip */ }
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

  // ── Collect article assets ──────────────────────────────────────────────
  const articleAssets = collectArticleAssets(contentHtml, url);

  // ── Lead image cascade (improved with article-aware hero ranking) ──────
  // Gather metadata image candidates
  let metadataImageUrl = imageUrl; // from JSON-LD / preloadedData
  if (!metadataImageUrl) {
    const ogImage = parsedDoc.querySelector('meta[property="og:image"]');
    if (ogImage?.getAttribute("content")) metadataImageUrl = ogImage.getAttribute("content");
  }
  if (!metadataImageUrl) {
    const ogSecure = parsedDoc.querySelector('meta[property="og:image:secure_url"]');
    if (ogSecure?.getAttribute("content")) metadataImageUrl = ogSecure.getAttribute("content");
  }
  if (!metadataImageUrl) {
    const twitterImage = parsedDoc.querySelector('meta[name="twitter:image"]');
    if (twitterImage?.getAttribute("content")) metadataImageUrl = twitterImage.getAttribute("content");
  }

  // Use article-aware hero ranking
  imageUrl = rankHeroImage(metadataImageUrl, articleAssets.images, parsedDoc, url);

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

  // Build contentHtml fallback: wrap plain text in paragraphs if no Readability HTML
  if (!contentHtml && content) {
    contentHtml = content.split(/\n\n+/).map(p => `<p>${p.trim()}</p>`).join("\n");
  }

  return { title, content, contentHtml: contentHtml || null, imageUrl, articleImages: articleAssets.images, author: author || null, sourceDomain: sourceDomain || null, publishedDate: publishedDate || null };
}

module.exports = {
  sanitizeFilenameForPdf,
  formatAuthorAPA,
  formatSingleAuthorAPA,
  formatDateAPA,
  generateArticlePdf,
  getSiteKey,
  getCookiesForUrl,
  openSiteLogin,
  getSessionCookieHeader,
  fetchWithCookies,
  fetchWithBrowser,
  extractArticleFromHtml,
  collectArticleAssets,
  isJunkImageUrl,
  rankHeroImage,
};
