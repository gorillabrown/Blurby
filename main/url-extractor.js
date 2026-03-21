// main/url-extractor.js — URL article fetching and extraction
// CommonJS only — Electron main process

const { BrowserWindow, session } = require("electron");
const fsPromises = require("fs/promises");
const path = require("path");

// Lazy-loaded heavy modules
let _Readability, _JSDOM, _PDFDocument;
function getReadability() { if (!_Readability) { _Readability = require("@mozilla/readability").Readability; } return _Readability; }
function getJSDOM() { if (!_JSDOM) { _JSDOM = require("jsdom").JSDOM; } return _JSDOM; }
function getPDFDocument() { if (!_PDFDocument) { _PDFDocument = require("pdfkit"); } return _PDFDocument; }

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
    const doc = new (getPDFDocument())({
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

  // 1. Try __preloadedData JSON from raw HTML (NYT and similar React-rendered sites)
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
    const reader = new (getReadability())(parsedDoc);
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

module.exports = {
  sanitizeFilenameForPdf,
  generateArticlePdf,
  getSiteKey,
  getCookiesForUrl,
  openSiteLogin,
  getSessionCookieHeader,
  fetchWithCookies,
  fetchWithBrowser,
  extractArticleFromHtml,
};
