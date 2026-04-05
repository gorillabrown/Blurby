"use strict";
// main/ipc/misc.js — URL import, browser, cover images, error logging,
//                    site logins, WebSocket server, auto-updater

const { ipcMain, session } = require("electron");
const path = require("path");
const os = require("os");
const fsPromises = require("fs/promises");
const { net } = require("electron");
const { countWords } = require("../file-parsers");
const { getSiteKey, fetchWithCookies, fetchWithBrowser, extractArticleFromHtml,
        openSiteLogin } = require("../url-extractor");
const { COVER_CACHE_MAX, ARTICLE_IMAGE_TIMEOUT_MS, ARTICLE_IMAGE_MIN_SIZE } = require("../constants");
const { normalizeAuthor } = require("../author-normalize");
const { imageMediaType } = require("../epub-converter");

async function logToFile(message, errorLogPath) {
  try {
    const timestamp = new Date().toISOString();
    await fsPromises.appendFile(errorLogPath, `[${timestamp}] ${message}\n`, "utf-8");
  } catch { /* Intentional: error logging should never crash the app */ }
}

/**
 * Detect image format from magic bytes. Returns extension or null if not a recognized image.
 */
function detectImageExt(buffer) {
  if (!buffer || buffer.length < 4) return null;
  const b = buffer;
  if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return ".jpg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return ".png";
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return ".gif";
  if (b.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return ".webp";
  // Reject HTML error pages masquerading as images
  const snippet = b.slice(0, 20).toString("ascii").toLowerCase();
  if (b[0] === 0x3C || snippet.includes("<!doctype") || snippet.includes("<html")) return null;
  return null;
}

/**
 * Check if an image buffer is too small based on header dimensions.
 */
function isImageTooSmall(buffer, ext) {
  try {
    if (ext === ".png" && buffer.length >= 24) {
      const w = buffer.readUInt32BE(16);
      const h = buffer.readUInt32BE(20);
      if (w < ARTICLE_IMAGE_MIN_SIZE || h < ARTICLE_IMAGE_MIN_SIZE) return true;
    } else if (ext === ".jpg") {
      let i = 2;
      while (i < buffer.length - 8) {
        if (buffer[i] === 0xFF) {
          const marker = buffer[i + 1];
          if (marker === 0xC0 || marker === 0xC2 || marker === 0xC1 || marker === 0xC3) {
            const h = buffer.readUInt16BE(i + 5);
            const w = buffer.readUInt16BE(i + 7);
            if (w < ARTICLE_IMAGE_MIN_SIZE || h < ARTICLE_IMAGE_MIN_SIZE) return true;
            break;
          }
          const segLen = buffer.readUInt16BE(i + 2);
          i += 2 + segLen;
        } else {
          i++;
        }
      }
    }
  } catch { /* dimension check failed; allow the image */ }
  return false;
}

/**
 * Download and validate article images for EPUB embedding.
 * Returns { images, heroBuffer, heroExt, contentHtml } where images is buildEpubZip-compatible,
 * heroBuffer/heroExt are for the cover image, and contentHtml has rewritten src paths.
 *
 * @param {object} opts
 * @param {string} opts.contentHtml - Cleaned article HTML with remote img URLs
 * @param {Array<{src: string, resolvedUrl: string}>} opts.articleImages - from collectArticleAssets
 * @param {string|null} opts.heroImageUrl - chosen hero image URL
 * @returns {Promise<{images: Array, heroBuffer: Buffer|null, heroExt: string|null, contentHtml: string}>}
 */
async function downloadArticleImages({ contentHtml, articleImages, heroImageUrl }) {
  const images = [];
  let heroBuffer = null;
  let heroExt = null;
  const urlToLocal = new Map(); // resolvedUrl -> ../Images/filename

  // Download all article images (hero + inline) in parallel with individual timeouts
  const allUrls = new Set();
  if (heroImageUrl) allUrls.add(heroImageUrl);
  for (const img of (articleImages || [])) {
    allUrls.add(img.resolvedUrl);
  }

  const downloads = await Promise.allSettled(
    [...allUrls].map(async (imgUrl) => {
      const fetchUrl = imgUrl.startsWith("//") ? "https:" + imgUrl : imgUrl;
      const response = await net.fetch(fetchUrl, { signal: AbortSignal.timeout(ARTICLE_IMAGE_TIMEOUT_MS) });
      if (!response.ok) return null;
      const buffer = Buffer.from(await response.arrayBuffer());
      const ext = detectImageExt(buffer);
      if (!ext) return null;
      if (isImageTooSmall(buffer, ext)) return null;
      return { url: imgUrl, buffer, ext };
    })
  );

  let imgIdx = 0;
  for (const result of downloads) {
    if (result.status !== "fulfilled" || !result.value) continue;
    const { url, buffer, ext } = result.value;

    // Track hero image
    if (url === heroImageUrl) {
      heroBuffer = buffer;
      heroExt = ext;
    }

    // Build EPUB image entry
    const filename = `img_${imgIdx}${ext}`;
    images.push({
      id: `img_${imgIdx}`,
      filename,
      buffer,
      mediaType: imageMediaType(ext),
    });
    urlToLocal.set(url, `../Images/${filename}`);
    imgIdx++;
  }

  // Rewrite contentHtml to point at local EPUB paths
  let rewrittenHtml = contentHtml || "";
  for (const [remoteUrl, localPath] of urlToLocal) {
    // Replace all occurrences of the remote URL in src attributes
    rewrittenHtml = rewrittenHtml.split(remoteUrl).join(localPath);
  }
  // Also replace protocol-relative variants
  for (const [remoteUrl, localPath] of urlToLocal) {
    if (remoteUrl.startsWith("https:")) {
      const protoRelative = remoteUrl.replace("https:", "");
      rewrittenHtml = rewrittenHtml.split(protoRelative).join(localPath);
    }
  }

  return { images, heroBuffer, heroExt, contentHtml: rewrittenHtml };
}

function register(ctx) {
  const coverCache = new Map();

  ipcMain.handle("add-doc-from-url", async (_, url) => {
    const settings = ctx.getSettings();
    if (!settings.sourceFolder) {
      return { error: "A source folder must be selected before importing from URLs." };
    }
    try {
      const siteCookies = ctx.getSiteCookies();
      const siteKey = getSiteKey(url);
      const hasLogin = siteKey && siteCookies[siteKey] && siteCookies[siteKey].length > 0;
      let html;
      let result;

      if (hasLogin) {
        try {
          html = await fetchWithCookies(url);
          result = extractArticleFromHtml(html, url);
        } catch { /* fall through to browser fetch */ }

        if (!result || result.error) {
          html = await fetchWithBrowser(url);
          result = extractArticleFromHtml(html, url);
        }
      } else {
        html = await fetchWithCookies(url);
        result = extractArticleFromHtml(html, url);
      }

      if (!result || result.error) {
        const techMsg = result?.error || "Failed to load page content.";
        logToFile(`URL import extraction failed for "${url}": ${techMsg}`, ctx.getErrorLogPath());
        return { error: "Could not extract article from this URL. The page may be behind a paywall or require login.", sourceUrl: url };
      }

      const docId = Date.now().toString() + Math.random().toString(36).slice(2, 8);

      // ── Download article images (hero + inline) ─────────────────────────
      let coverPath = null;
      let coverImageBuffer = null;
      let articleHtml = result.contentHtml || result.content;
      let preDownloadedImages = [];

      try {
        const downloaded = await downloadArticleImages({
          contentHtml: articleHtml,
          articleImages: result.articleImages,
          heroImageUrl: result.imageUrl,
        });
        preDownloadedImages = downloaded.images;
        articleHtml = downloaded.contentHtml;

        // Save hero image as cover
        if (downloaded.heroBuffer && downloaded.heroExt) {
          coverImageBuffer = downloaded.heroBuffer;
          const coversDir = path.join(ctx.getDataPath(), "covers");
          await fsPromises.mkdir(coversDir, { recursive: true });
          coverPath = path.join(coversDir, `${docId}${downloaded.heroExt}`);
          await fsPromises.writeFile(coverPath, downloaded.heroBuffer);
        }
      } catch (err) {
        console.log("[url] Article image download failed (non-fatal):", err.message);
      }

      const newDoc = {
        id: docId,
        title: result.title, content: result.content,
        wordCount: countWords(result.content),
        sourceUrl: url, position: 0, created: Date.now(), source: "url",
        author: normalizeAuthor(result.author) || null,
        authorFull: result.author || null,
        sourceDomain: result.sourceDomain || null,
        publishedDate: result.publishedDate || null,
        coverPath,
      };
      ctx.addDocToLibrary(newDoc);
      ctx.saveLibrary();

      // Convert article to EPUB (primary format — no PDF fallback)
      try {
        const { htmlToEpub } = require("../epub-converter");
        const { EPUB_CONVERTED_DIR } = require("../constants");
        const tempHtmlPath = path.join(os.tmpdir(), `blurby-url-${docId}.html`);
        await fsPromises.writeFile(
          tempHtmlPath,
          `<html><head><title>${(result.title || "").replace(/</g, "&lt;")}</title></head><body>${articleHtml}</body></html>`,
          "utf-8"
        );
        const convertedDir = path.join(ctx.getDataPath(), EPUB_CONVERTED_DIR);
        await fsPromises.mkdir(convertedDir, { recursive: true });
        const epubOutputPath = path.join(convertedDir, `${docId}.epub`);
        const convResult = await htmlToEpub(tempHtmlPath, epubOutputPath, {
          title: result.title,
          author: result.author || "Unknown",
          date: result.publishedDate || undefined,
          source: url,
          coverImage: coverImageBuffer || undefined,
          preDownloadedImages,
        });
        await fsPromises.unlink(tempHtmlPath).catch(() => {});

        newDoc.convertedEpubPath = convResult.epubPath;
        newDoc.filepath = convResult.epubPath;
        newDoc.ext = ".epub";
        newDoc.originalSourceUrl = url;
        // Remove inline content — EPUB is the canonical source
        delete newDoc.content;

        const docsAfterConv = ctx.getLibrary();
        ctx.setLibrary(docsAfterConv.map((d) => (d.id === newDoc.id ? newDoc : d)));
        ctx.saveLibrary();
        ctx.broadcastLibrary();
      } catch (convErr) {
        logToFile(`URL EPUB conversion failed: ${convErr.message}`, ctx.getErrorLogPath());
        // Keep inline content as fallback — doc still readable via legacy path
      }

      return { doc: newDoc };
    } catch (err) {
      const isNetwork = err.message && (
        err.message.includes("ENOTFOUND") ||
        err.message.includes("ECONNREFUSED") ||
        err.message.includes("ETIMEDOUT") ||
        err.message.includes("network") ||
        err.message.includes("fetch")
      );
      const userMessage = isNetwork
        ? "Could not reach this URL — check your internet connection and try again."
        : "Could not extract article from this URL. Try opening it in your browser instead.";
      logToFile(`URL import fetch failed for "${url}": ${err.message}`, ctx.getErrorLogPath());
      return { error: userMessage, sourceUrl: url };
    }
  });

  ipcMain.handle("open-url-in-browser", async (_, url) => {
    try {
      const { shell } = require("electron");
      // Only allow http/https URLs for security
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return { error: "Only http/https URLs can be opened." };
      }
      await shell.openExternal(url);
      return { ok: true };
    } catch (err) {
      return { error: "Could not open the URL in your browser." };
    }
  });

  ipcMain.handle("get-cover-image", async (_, coverPath) => {
    if (!coverPath) return null;
    if (coverCache.has(coverPath)) {
      const val = coverCache.get(coverPath);
      coverCache.delete(coverPath);
      coverCache.set(coverPath, val);
      return val;
    }
    try {
      const buffer = await fsPromises.readFile(coverPath);
      const ext = path.extname(coverPath).toLowerCase();
      const mime = ext === ".png" ? "image/png" : ext === ".gif" ? "image/gif" : "image/jpeg";
      const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
      if (coverCache.size >= COVER_CACHE_MAX) {
        const oldest = coverCache.keys().next().value;
        coverCache.delete(oldest);
      }
      coverCache.set(coverPath, dataUrl);
      return dataUrl;
    } catch { return null; /* Expected: cover file may have been deleted */ }
  });

  ipcMain.handle("log-error", async (_, message) => {
    await logToFile(message, ctx.getErrorLogPath());
  });

  ipcMain.handle("get-site-logins", () => {
    const siteCookies = ctx.getSiteCookies();
    return Object.entries(siteCookies).map(([domain, cookies]) => ({
      domain,
      cookieCount: cookies.length,
    }));
  });

  ipcMain.handle("site-login", async (_, url) => {
    return await openSiteLogin(url, ctx.getMainWindow(), ctx.getSiteCookies(), ctx.saveSiteCookies);
  });

  ipcMain.handle("site-logout", (_, domain) => {
    const siteCookies = ctx.getSiteCookies();
    delete siteCookies[domain];
    ctx.saveSiteCookies();
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

  // ── WebSocket server for Chrome extension ─────────────────────────────────

  const wsServer = require("../ws-server");

  ipcMain.handle("start-ws-server", () => {
    return wsServer.startServer(ctx);
  });

  ipcMain.handle("stop-ws-server", () => {
    wsServer.stopServer();
    return { ok: true };
  });

  ipcMain.handle("get-ws-status", () => {
    return wsServer.getStatus();
  });

  ipcMain.handle("get-ws-pairing-token", () => {
    const status = wsServer.getStatus();
    return status.token || null;
  });

  ipcMain.handle("get-ws-short-code", () => {
    const { code, expiresAt } = wsServer.getShortCode();
    const hasAuth = wsServer.getClientCount() > 0;
    return { code, expiresAt, connected: hasAuth };
  });

  ipcMain.handle("regenerate-ws-short-code", () => {
    wsServer.generateShortCode();
    const { code, expiresAt } = wsServer.getShortCode();
    return { code, expiresAt };
  });

  ipcMain.handle("regenerate-ws-pairing-token", () => {
    const token = wsServer.generatePairingToken();
    const settings = ctx.getSettings();
    settings._wsPairingToken = token;
    ctx.saveSettings();
    // Restart server with new token
    wsServer.stopServer();
    return wsServer.startServer(ctx);
  });

  // ── Auto-updater ─────────────────────────────────────────────────────────

  ipcMain.handle("check-for-updates", async () => {
    const { app } = require("electron");
    if (!app.isPackaged) return { status: "dev" };
    try {
      const { autoUpdater } = require("electron-updater");
      autoUpdater.autoDownload = true;
      autoUpdater.autoInstallOnAppQuit = true;
      const result = await autoUpdater.checkForUpdates();
      const latestVersion = result?.updateInfo?.version || null;
      return { status: "checked", version: latestVersion };
    } catch (err) {
      const msg = err.message || String(err);
      // Private repo or network error — surface a helpful message
      if (msg.includes("404") || msg.includes("HttpError") || msg.includes("net::")) {
        return { status: "error", message: "Could not reach update server. The repository may be private." };
      }
      return { status: "error", message: "Could not check for updates — please try again later." };
    }
  });

  ipcMain.handle("install-update", () => {
    try { const { autoUpdater } = require("electron-updater"); autoUpdater.quitAndInstall(true, true); } catch (err) {
      console.error("Failed to install update:", err.message);
    }
  });
}

module.exports = { register, downloadArticleImages, detectImageExt, isImageTooSmall };
