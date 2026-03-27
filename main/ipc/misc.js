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
        generateArticlePdf, openSiteLogin } = require("../url-extractor");
const { COVER_CACHE_MAX } = require("../constants");

async function logToFile(message, errorLogPath) {
  try {
    const timestamp = new Date().toISOString();
    await fsPromises.appendFile(errorLogPath, `[${timestamp}] ${message}\n`, "utf-8");
  } catch { /* Intentional: error logging should never crash the app */ }
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

      // ── Download and validate article cover image ────────────────────────
      let coverPath = null;
      if (result.imageUrl) {
        try {
          const imgUrl = result.imageUrl.startsWith("//") ? "https:" + result.imageUrl : result.imageUrl;
          const imgResponse = await net.fetch(imgUrl);
          if (imgResponse.ok) {
            const imgBuffer = Buffer.from(await imgResponse.arrayBuffer());

            // Magic byte validation — reject HTML error pages and unknown formats
            let detectedExt = null;
            if (imgBuffer.length >= 4) {
              const b = imgBuffer;
              if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) {
                detectedExt = ".jpg";
              } else if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) {
                detectedExt = ".png";
              } else if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) {
                detectedExt = ".gif";
              } else if (
                b.length >= 12 &&
                b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
                b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
              ) {
                detectedExt = ".webp";
              }
              // Reject HTML responses masquerading as images
              const firstChar = b[0];
              const snippet = b.slice(0, 20).toString("ascii").toLowerCase();
              if (firstChar === 0x3C || snippet.includes("<!doctype") || snippet.includes("<html")) {
                detectedExt = null; // reject
                console.log("[url] Rejected HTML error page served as image");
              }
            }

            if (detectedExt) {
              // Dimension check: reject images smaller than 200x200
              let tooSmall = false;
              try {
                if (detectedExt === ".png") {
                  // PNG IHDR: bytes 16-23 = width (4 bytes) + height (4 bytes)
                  if (imgBuffer.length >= 24) {
                    const w = imgBuffer.readUInt32BE(16);
                    const h = imgBuffer.readUInt32BE(20);
                    if (w < 200 || h < 200) tooSmall = true;
                  }
                } else if (detectedExt === ".jpg") {
                  // Scan JPEG SOF markers (0xFF 0xC0/0xC2) for dimensions
                  let i = 2;
                  while (i < imgBuffer.length - 8) {
                    if (imgBuffer[i] === 0xFF) {
                      const marker = imgBuffer[i + 1];
                      if (marker === 0xC0 || marker === 0xC2 || marker === 0xC1 || marker === 0xC3) {
                        const h = imgBuffer.readUInt16BE(i + 5);
                        const w = imgBuffer.readUInt16BE(i + 7);
                        if (w < 200 || h < 200) tooSmall = true;
                        break;
                      }
                      const segLen = imgBuffer.readUInt16BE(i + 2);
                      i += 2 + segLen;
                    } else {
                      i++;
                    }
                  }
                }
                // For GIF and WebP, skip dimension check (rare, acceptable)
              } catch { /* dimension check failed; allow the image */ }

              if (!tooSmall) {
                const coversDir = path.join(ctx.getDataPath(), "covers");
                await fsPromises.mkdir(coversDir, { recursive: true });
                coverPath = path.join(coversDir, `${docId}${detectedExt}`);
                await fsPromises.writeFile(coverPath, imgBuffer);
              } else {
                console.log("[url] Skipped image smaller than 200x200");
              }
            }
          }
        } catch (err) {
          console.log("[url] Failed to download article image:", err.message);
        }
      }

      const newDoc = {
        id: docId,
        title: result.title, content: result.content,
        wordCount: countWords(result.content),
        sourceUrl: url, position: 0, created: Date.now(), source: "url",
        author: result.author || null,
        authorFull: result.author || null,
        sourceDomain: result.sourceDomain || null,
        publishedDate: result.publishedDate || null,
        coverPath,
      };
      ctx.addDocToLibrary(newDoc);
      ctx.saveLibrary();

      // Convert extracted HTML to EPUB
      try {
        const { convertToEpub } = require("../epub-converter");
        const { EPUB_CONVERTED_DIR } = require("../constants");
        const tempHtmlPath = path.join(os.tmpdir(), `blurby-url-${docId}.html`);
        await fsPromises.writeFile(
          tempHtmlPath,
          `<html><head><title>${result.title}</title></head><body>${result.content}</body></html>`
        );
        const convertedDir = path.join(ctx.getDataPath(), EPUB_CONVERTED_DIR);
        const convResult = await convertToEpub(tempHtmlPath, convertedDir, docId, {
          title: result.title,
          author: result.author,
        });
        await fsPromises.unlink(tempHtmlPath).catch(() => {});
        newDoc.convertedEpubPath = convResult.epubPath;
        newDoc.filepath = convResult.epubPath;
        newDoc.ext = ".epub";
        if (convResult && !convResult.valid) {
          newDoc.legacyRenderer = true;
        }
        const docsAfterConv = ctx.getLibrary();
        ctx.setLibrary(docsAfterConv.map((d) => (d.id === newDoc.id ? newDoc : d)));
        ctx.saveLibrary();
      } catch (convErr) {
        logToFile(`URL EPUB conversion failed: ${convErr.message}`, ctx.getErrorLogPath());
        if (!convErr.userError) {
          // Non-user errors: fall back to legacy text extraction
          newDoc.legacyRenderer = true;
        }
        // Fall back to inline content (existing behavior)
      }

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
            sourceDomain: result.sourceDomain || null,
            publishedDate: result.publishedDate || null,
          });

          newDoc.source = "url";
          newDoc.filepath = pdfPath;
          newDoc.filename = path.basename(pdfPath);
          newDoc.ext = ".pdf";

          const docs = ctx.getLibrary();
          ctx.setLibrary(docs.map((d) => (d.id === newDoc.id ? newDoc : d)));
          ctx.saveLibrary();
          ctx.broadcastLibrary();
        } catch (err) {
          console.error("PDF generation failed, keeping URL-sourced doc:", err);
          console.error("PDF generation error stack:", err.stack);
          logToFile(`PDF generation error for "${newDoc.title}": ${err.message}\n${err.stack}`, ctx.getErrorLogPath());
        }
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
    try { const { autoUpdater } = require("electron-updater"); autoUpdater.quitAndInstall(); } catch (err) {
      console.error("Failed to install update:", err.message);
    }
  });
}

module.exports = { register };
