// main/ipc-handlers.js — All IPC handler registrations
// CommonJS only — Electron main process

const { ipcMain, dialog, session, net } = require("electron");
const path = require("path");
const fsPromises = require("fs/promises");
const https = require("https");

const { extractContent, extractDocMetadata, countWords,
        extractEpubMetadata, extractEpubCover, extractMobiCover,
        parseMobiMetadata, parseCallibreOpf, extractAuthorFromFilename,
        extractTitleFromFilename, epubChapterCache, clearChapterCache } = require("./file-parsers");
const { getSiteKey, fetchWithCookies, fetchWithBrowser, extractArticleFromHtml,
        generateArticlePdf, openSiteLogin } = require("./url-extractor");
const { getSystemTheme, createReaderWindow, updateWindowTheme } = require("./window-manager");
const {
  DEFINITION_CACHE_MAX,
  DEFINITION_TIMEOUT_MS,
  MAX_RECENT_FOLDERS,
  MAX_HISTORY_SESSIONS,
  MS_PER_DAY,
  COVER_CACHE_MAX,
  SNOOZE_CHECK_INTERVAL_MS,
} = require("./constants");

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

// ── Reading statistics helpers ─────────────────────────────────────────────

function recordReadingSession(history, docTitle, wordsRead, durationMs, wpm, saveHistory) {
  const today = new Date().toISOString().slice(0, 10);
  history.sessions.push({ date: today, docTitle, wordsRead, durationMs, wpm });
  history.totalWordsRead += wordsRead;
  history.totalReadingTimeMs += durationMs;

  // Update streaks
  if (!history.streaks) history.streaks = { current: 0, longest: 0, lastReadDate: null };
  const last = history.streaks.lastReadDate;
  if (last === today) {
    // Same day — streak unchanged
  } else if (last) {
    const diff = Math.floor((new Date(today) - new Date(last)) / MS_PER_DAY);
    history.streaks.current = diff === 1 ? history.streaks.current + 1 : 1;
  } else {
    history.streaks.current = 1;
  }
  history.streaks.lastReadDate = today;
  if (history.streaks.current > history.streaks.longest) {
    history.streaks.longest = history.streaks.current;
  }

  if (history.sessions.length > MAX_HISTORY_SESSIONS) history.sessions = history.sessions.slice(-1000);
  saveHistory();
}

function getStats(history) {
  const today = new Date().toISOString().slice(0, 10);
  const dates = [...new Set(history.sessions.map((s) => s.date))].sort();

  let streak = 0;
  if (dates.length > 0) {
    const d = new Date(today);
    const lastDate = dates[dates.length - 1];
    const diffDays = Math.floor((d - new Date(lastDate)) / MS_PER_DAY);
    if (diffDays <= 1) {
      streak = 1;
      for (let i = dates.length - 2; i >= 0; i--) {
        const prev = new Date(dates[i + 1]);
        const curr = new Date(dates[i]);
        const gap = Math.floor((prev - curr) / MS_PER_DAY);
        if (gap <= 1) streak++;
        else break;
      }
    }
  }

  const longestStreak = Math.max(streak, (history.streaks && history.streaks.longest) || 0);
  return {
    totalWordsRead: history.totalWordsRead,
    totalReadingTimeMs: history.totalReadingTimeMs,
    docsCompleted: history.docsCompleted || 0,
    sessions: history.sessions.length,
    streak,
    longestStreak,
  };
}

// ── Error logging ──────────────────────────────────────────────────────────

async function logToFile(message, errorLogPath) {
  try {
    const timestamp = new Date().toISOString();
    await fsPromises.appendFile(errorLogPath, `[${timestamp}] ${message}\n`, "utf-8");
  } catch { /* Intentional: error logging should never crash the app */ }
}

/**
 * Register all IPC handlers.
 * @param {object} ctx - Shared application context
 * @param {function} ctx.getMainWindow - Returns current mainWindow
 * @param {function} ctx.getSettings - Returns current settings object
 * @param {function} ctx.setSettings - Update settings
 * @param {function} ctx.getLibrary - Returns library docs array
 * @param {function} ctx.setLibrary - Replace library docs
 * @param {function} ctx.getDocById - Lookup doc by id
 * @param {function} ctx.addDocToLibrary - Prepend a doc
 * @param {function} ctx.saveSettings - Persist settings
 * @param {function} ctx.saveLibrary - Debounced library persist
 * @param {function} ctx.saveLibraryNow - Immediate library persist
 * @param {function} ctx.broadcastLibrary - Debounced broadcast
 * @param {function} ctx.broadcastLibraryNow - Immediate broadcast
 * @param {function} ctx.getHistory - Returns history object
 * @param {function} ctx.saveHistory - Persist history
 * @param {function} ctx.getSiteCookies - Returns siteCookies object
 * @param {function} ctx.saveSiteCookies - Persist site cookies
 * @param {function} ctx.getDataPath - Returns data directory path
 * @param {function} ctx.getErrorLogPath - Returns error log path
 * @param {function} ctx.getUserDataPath - Returns app.getPath("userData")
 * @param {function} ctx.syncLibraryWithFolder - Trigger folder sync
 * @param {function} ctx.startWatcher - Start file watcher
 * @param {function} ctx.clearFailedExtractions - Clear failed extractions set
 * @param {object} ctx.readerWindows - Map of docId → BrowserWindow
 * @param {boolean} ctx.isDev - Development mode flag
 */
function registerIpcHandlers(ctx) {
  const definitionCache = new Map();
  const coverCache = new Map();

  ipcMain.handle("get-state", () => ({ settings: ctx.getSettings(), library: ctx.getLibrary().filter((d) => !d.deleted) }));
  ipcMain.handle("get-platform", () => process.platform);
  ipcMain.handle("get-system-theme", () => getSystemTheme());

  ipcMain.handle("select-folder", async () => {
    const mainWindow = ctx.getMainWindow();
    const settings = ctx.getSettings();
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
      title: "Select your reading material folder",
    });
    if (result.canceled || !result.filePaths.length) return null;
    const folder = result.filePaths[0];
    settings.sourceFolder = folder;
    settings.recentFolders = [folder, ...settings.recentFolders.filter((f) => f !== folder)].slice(0, MAX_RECENT_FOLDERS);
    ctx.saveSettings();
    await ctx.syncLibraryWithFolder();
    ctx.startWatcher();
    return folder;
  });

  ipcMain.handle("switch-folder", async (_, folder) => {
    const settings = ctx.getSettings();
    try { await fsPromises.access(folder); } catch { return { error: "Folder no longer exists." }; }
    settings.sourceFolder = folder;
    settings.recentFolders = [folder, ...settings.recentFolders.filter((f) => f !== folder)].slice(0, MAX_RECENT_FOLDERS);
    ctx.saveSettings();
    await ctx.syncLibraryWithFolder();
    ctx.startWatcher();
    return { folder };
  });

  ipcMain.handle("save-settings", (_, newSettings) => {
    const settings = ctx.getSettings();
    Object.assign(settings, newSettings);
    ctx.saveSettings();
    if (newSettings.theme !== undefined) updateWindowTheme(ctx.getMainWindow(), settings);

    // Enqueue update-settings for sync
    const syncEngine = require("./sync-engine");
    const syncQueue = require("./sync-queue");
    const syncStatus = syncEngine.getSyncStatus();
    const revision = syncStatus.revision || 0;
    syncQueue.enqueue("update-settings", { revision }).catch(() => {});
  });

  ipcMain.handle("save-library", (_, newDocs) => { ctx.setLibrary(newDocs); ctx.saveLibrary(); });

  ipcMain.handle("update-doc-progress", (_, docId, position, cfi) => {
    const doc = ctx.getDocById(docId);
    if (doc) {
      const syncEngine = require("./sync-engine");
      const syncQueue = require("./sync-queue");
      const syncStatus = syncEngine.getSyncStatus();
      const revision = syncStatus.revision || 0;

      doc.position = position;
      if (cfi) doc.cfi = cfi;
      doc.modified = Date.now();
      doc.revision = revision;
      ctx.saveLibrary();

      // Enqueue update-progress for sync
      syncQueue.enqueue("update-progress", { docId, value: position, revision }).catch(() => {});
    }
  });

  ipcMain.handle("add-manual-doc", (_, title, content) => {
    const syncEngine = require("./sync-engine");
    const syncQueue = require("./sync-queue");
    const syncStatus = syncEngine.getSyncStatus();
    const revision = syncStatus.revision || 0;

    const wordCount = countWords(content);
    const doc = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
      title, content, wordCount, position: 0, created: Date.now(), source: "manual",
      modified: Date.now(), revision,
    };
    ctx.addDocToLibrary(doc);
    ctx.saveLibrary();

    // Enqueue add-doc for sync
    syncQueue.enqueue("add-doc", { docId: doc.id, revision }).catch(() => {});

    return doc;
  });

  ipcMain.handle("delete-doc", async (_, docId) => {
    const doc = ctx.getDocById(docId);
    if (doc && doc.filepath) {
      // Clean up caches for deleted doc
      clearChapterCache(doc.filepath);
      if (ctx.removeFailedExtraction) ctx.removeFailedExtraction(doc.filepath);
      // Delete the actual file from disk
      try {
        const fs = require("fs").promises;
        await fs.unlink(doc.filepath);
      } catch (err) {
        // File may already be gone or inaccessible — log but don't block
        console.warn(`[delete-doc] Could not delete file: ${doc.filepath}`, err.message);
      }
    }

    // 19D: Apply tombstone instead of hard-deleting, so sync can propagate the deletion
    const syncEngine = require("./sync-engine");
    const syncQueue = require("./sync-queue");
    const syncStatus = syncEngine.getSyncStatus();
    const deviceId = syncQueue.getDeviceId();
    const revision = syncStatus.revision || 0;

    const library = ctx.getLibrary();
    const docExists = library.some((d) => d.id === docId);
    if (docExists) {
      const now = Date.now();
      const updated = library.map((d) => {
        if (d.id !== docId) return d;
        // Apply tombstone fields
        return {
          ...d,
          deleted: true,
          deletedAt: revision,
          deletedBy: deviceId,
          deletedAtTimestamp: now,
          // Clear heavy content to keep library.json lean
          content: undefined,
        };
      });
      ctx.setLibrary(updated);
    } else if (ctx.removeDocFromLibrary) {
      ctx.removeDocFromLibrary(docId);
    }

    ctx.saveLibrary();

    // Enqueue the delete-doc operation in the sync queue (19B)
    syncQueue.enqueue("delete-doc", { docId, revision }).catch(() => {});
  });

  ipcMain.handle("update-doc", (_, docId, title, content) => {
    const doc = ctx.getDocById(docId);
    if (doc) {
      const syncEngine = require("./sync-engine");
      const syncStatus = syncEngine.getSyncStatus();
      const revision = syncStatus.revision || 0;

      doc.title = title;
      doc.content = content;
      doc.wordCount = countWords(content);
      doc.modified = Date.now();
      doc.revision = revision;
      ctx.saveLibrary();
    }
  });

  ipcMain.handle("reset-progress", (_, docId) => {
    const doc = ctx.getDocById(docId);
    if (doc) {
      doc.position = 0;
      ctx.saveLibrary();

      // 19H: Enqueue reset-progress as a first-class sync operation
      // A reset with higher revision always beats furthest-ahead on merge
      const syncEngine = require("./sync-engine");
      const syncQueue = require("./sync-queue");
      const syncStatus = syncEngine.getSyncStatus();
      const revision = syncStatus.revision || 0;
      syncQueue.enqueue("reset-progress", { docId, value: 0, revision }).catch(() => {});
    }
  });

  ipcMain.handle("load-doc-content", async (_, docId) => {
    const doc = ctx.getDocById(docId);
    if (!doc) return null;
    if (doc.content) return doc.content;
    if (doc.filepath) {
      const result = await extractContent(doc.filepath);
      // extractContent returns { userError } for user-facing parse failures
      if (result && typeof result === "object" && result.userError) {
        logToFile(`load-doc-content error for doc "${doc.title}" (${doc.filepath}): ${result.userError}`, ctx.getErrorLogPath());
        return { userError: result.userError };
      }
      return result;
    }
    return null;
  });

  // Read raw file buffer — used by foliate-js to load EPUBs in the renderer
  ipcMain.handle("read-file-buffer", async (_, filePath) => {
    try {
      const buffer = await fsPromises.readFile(filePath);
      return buffer.buffer; // Return ArrayBuffer
    } catch (err) {
      console.error("read-file-buffer error:", err.message);
      return null;
    }
  });

  ipcMain.handle("get-doc-chapters", async (_, docId) => {
    const doc = ctx.getDocById(docId);
    if (!doc) return [];
    if (doc.filepath && epubChapterCache.has(doc.filepath)) {
      return epubChapterCache.get(doc.filepath);
    }
    if (doc.filepath && path.extname(doc.filepath).toLowerCase() === ".epub") {
      await extractContent(doc.filepath);
      return epubChapterCache.get(doc.filepath) || [];
    }
    return [];
  });

  // ── Highlights ───────────────────────────────────────────────────────────

  ipcMain.handle("save-highlight", async (_, { docTitle, text, wordIndex, totalWords }) => {
    try {
      const settings = ctx.getSettings();
      const highlightPath = settings.sourceFolder
        ? path.join(settings.sourceFolder, "Blurby Highlights.md")
        : path.join(ctx.getDataPath(), "highlights.md");

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
        req.setTimeout(DEFINITION_TIMEOUT_MS, () => {
          req.destroy();
          reject(new Error("Request timed out"));
        });
      });

      const result = parseDefinitionResponse(data, word);
      if (result.error) return result;

      if (definitionCache.size >= DEFINITION_CACHE_MAX) {
        const oldest = definitionCache.keys().next().value;
        definitionCache.delete(oldest);
      }
      definitionCache.set(key, result);

      return result;
    } catch (err) {
      return { error: err.message };
    }
  });

  // ── URL import ───────────────────────────────────────────────────────────

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

  // ── Open URL in default browser ──────────────────────────────────────────

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

  // ── Drag-and-drop import ─────────────────────────────────────────────────

  ipcMain.handle("import-dropped-files", async (_, filePaths) => {
    const settings = ctx.getSettings();
    const SUPPORTED_EXT = require("./folder-watcher").SUPPORTED_EXT;
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

      if (settings.sourceFolder) {
        try {
          const destPath = path.join(settings.sourceFolder, path.basename(fp));
          try { await fsPromises.access(destPath); } catch { await fsPromises.copyFile(fp, destPath); }
          const content = await extractContent(destPath);
          if (!content) { rejected.push(path.basename(fp)); continue; }
          const wordCount = countWords(content);
          const stat = await fsPromises.stat(destPath);
          const meta = await extractDocMetadata(destPath, docId, ctx.getDataPath());

          const doc = {
            id: docId, title: meta.title, filepath: destPath, filename: path.basename(destPath),
            ext, size: stat.size, modified: stat.mtimeMs,
            wordCount, position: 0, created: Date.now(), source: "folder",
            author: meta.author, coverPath: meta.coverPath, lastReadAt: null,
          };
          ctx.addDocToLibrary(doc);
          imported.push(doc.title);
        } catch (err) {
          console.error("Failed to import dropped file:", err);
          rejected.push(path.basename(fp));
        }
      } else {
        const content = await extractContent(fp);
        if (!content) { rejected.push(path.basename(fp)); continue; }
        const wordCount = countWords(content);
        const doc = {
          id: docId,
          title: path.basename(fp, ext),
          content, wordCount, ext,
          position: 0, created: Date.now(), source: "manual",
        };
        ctx.addDocToLibrary(doc);
        imported.push(doc.title);
      }
    }
    if (imported.length > 0) {
      ctx.saveLibrary();
      ctx.broadcastLibrary();
    }
    return { imported, rejected };
  });

  // ── Reading statistics ───────────────────────────────────────────────────

  ipcMain.handle("record-reading-session", (_, docTitle, wordsRead, durationMs, wpm) => {
    recordReadingSession(ctx.getHistory(), docTitle, wordsRead, durationMs, wpm, ctx.saveHistory);
  });

  ipcMain.handle("mark-doc-completed", () => {
    const history = ctx.getHistory();
    history.docsCompleted = (history.docsCompleted || 0) + 1;
    ctx.saveHistory();
  });

  ipcMain.handle("get-stats", () => getStats(ctx.getHistory()));

  ipcMain.handle("reset-stats", async () => {
    const history = ctx.getHistory();
    history.sessions = [];
    history.totalWordsRead = 0;
    history.totalReadingTimeMs = 0;
    history.docsCompleted = 0;
    history.streaks = { current: 0, longest: 0, lastReadDate: null };
    ctx.saveHistory();
    return { success: true };
  });

  // ── Cover images ─────────────────────────────────────────────────────────

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

  // ── Cancel sync ─────────────────────────────────────────────────────────

  ipcMain.handle("cancel-sync", () => {
    if (ctx.cancelSync) ctx.cancelSync();
    return { ok: true };
  });

  // ── Rescan folder ────────────────────────────────────────────────────────

  ipcMain.handle("rescan-folder", async () => {
    const settings = ctx.getSettings();
    if (!settings.sourceFolder) return { error: "No source folder selected" };
    console.log("[rescan] Starting rescan of:", settings.sourceFolder);
    ctx.clearFailedExtractions();
    try {
      const { scanFolderAsync } = require("./folder-watcher");
      const files = await scanFolderAsync(settings.sourceFolder);
      const docs = ctx.getLibrary();
      const existing = new Map(docs.map((d) => [d.filepath, d]));
      const synced = [];

      for (const file of files) {
        const prev = existing.get(file.filepath);
        if (prev) {
          let updates = { ...prev, filename: file.filename, ext: file.ext, modified: file.modified, size: file.size };
          if (file.ext === ".epub") {
            if (!prev.coverPath || !prev.author || prev.title === path.basename(file.filename, file.ext)) {
              const meta = await extractEpubMetadata(file.filepath);
              if (!prev.author && meta.author) updates.author = meta.author;
              if (meta.title && prev.title === path.basename(file.filename, file.ext)) {
                updates.title = meta.title;
              }
            }
            if (!prev.coverPath) {
              updates.coverPath = await extractEpubCover(file.filepath, prev.id, ctx.getDataPath());
            }
          } else if ((file.ext === ".mobi" || file.ext === ".azw3" || file.ext === ".azw") && (!prev.coverPath || !prev.author)) {
            const opfMeta = await parseCallibreOpf(file.filepath);
            if (opfMeta) {
              if (!prev.author && opfMeta.author) updates.author = opfMeta.author;
              if (opfMeta.title && prev.title === path.basename(file.filename, file.ext)) updates.title = opfMeta.title;
              if (!prev.coverPath && opfMeta.coverPath) {
                const coversDir = path.join(ctx.getUserDataPath(), "covers");
                await fsPromises.mkdir(coversDir, { recursive: true });
                const coverExt = path.extname(opfMeta.coverPath);
                const destCover = path.join(coversDir, `${prev.id}${coverExt}`);
                try { await fsPromises.copyFile(opfMeta.coverPath, destCover); updates.coverPath = destCover; } catch (err) {
                  console.log("Failed to copy Calibre cover:", err.message);
                }
              }
            }
            if (!prev.coverPath && !updates.coverPath) {
              try {
                const buf = await fsPromises.readFile(file.filepath);
                updates.coverPath = await extractMobiCover(buf, prev.id, ctx.getUserDataPath());
              } catch (err) {
                console.log("Failed to extract MOBI cover:", err.message);
              }
            }
          }
          synced.push(updates);
        } else {
          const content = await extractContent(file.filepath);
          if (content) {
            const wordCount = countWords(content);
            const docId = Date.now().toString() + Math.random().toString(36).slice(2, 8);
            const meta = await extractDocMetadata(file.filepath, docId, ctx.getDataPath());
            synced.push({
              id: docId, title: meta.title, filepath: file.filepath, filename: file.filename,
              ext: file.ext, size: file.size, modified: file.modified,
              wordCount, position: 0, created: Date.now(), source: "folder",
              author: meta.author, coverPath: meta.coverPath, lastReadAt: null,
            });
          } else {
            ctx.addFailedExtraction(file.filepath);
          }
        }
      }

      // Preserve non-folder docs; convert URL docs to PDFs if they have content
      const savedArticlesPath = settings.sourceFolder
        ? path.join(path.resolve(settings.sourceFolder), "Saved Articles")
        : null;
      for (const doc of docs) {
        if (doc.source === "url" && doc.content && settings.sourceFolder) {
          try {
            const pdfPath = await generateArticlePdf({
              title: doc.title,
              author: doc.authorFull || doc.author || null,
              content: doc.content,
              sourceUrl: doc.sourceUrl || "",
              fetchDate: new Date(doc.created || Date.now()),
              outputDir: settings.sourceFolder,
              sourceDomain: doc.sourceDomain || null,
              publishedDate: doc.publishedDate || null,
            });
            synced.push({
              ...doc,
              source: "url",
              filepath: pdfPath,
              filename: path.basename(pdfPath),
              ext: ".pdf",
              content: undefined,
            });
            console.log(`Converted URL doc to PDF: ${doc.title}`);
          } catch (err) {
            console.error(`Failed to convert URL doc "${doc.title}" to PDF:`, err.message);
            synced.push(doc);
          }
        } else if (doc.source !== "folder") {
          synced.push(doc);
        } else if (savedArticlesPath && doc.filepath && path.resolve(doc.filepath).startsWith(savedArticlesPath)) {
          synced.push(doc);
        }
      }

      ctx.setLibrary(synced);
      ctx.saveLibrary();
      ctx.broadcastLibrary();
      return { count: synced.length };
    } catch (err) {
      console.error("Rescan failed:", err);
      return { error: err.message };
    }
  });

  // ── Import/export ────────────────────────────────────────────────────────

  ipcMain.handle("export-library", async () => {
    const mainWindow = ctx.getMainWindow();
    const settings = ctx.getSettings();
    const result = await dialog.showSaveDialog(mainWindow, {
      title: "Export Blurby Library",
      defaultPath: "blurby-backup.json",
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (result.canceled) return null;
    const exportData = {
      exportedAt: new Date().toISOString(),
      settings: { ...settings },
      library: ctx.getLibrary(),
      history: ctx.getHistory(),
    };
    await fsPromises.writeFile(result.filePath, JSON.stringify(exportData, null, 2), "utf-8");
    return result.filePath;
  });

  ipcMain.handle("import-library", async () => {
    const mainWindow = ctx.getMainWindow();
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
        const existingIds = new Set(ctx.getLibrary().map((d) => d.id));
        let added = 0;
        for (const doc of data.library) {
          if (!existingIds.has(doc.id)) {
            ctx.addDocToLibrary(doc);
            existingIds.add(doc.id);
            added++;
          }
        }
        ctx.saveLibrary();
        ctx.broadcastLibrary();
        return { added, total: data.library.length };
      }
      return { error: "Invalid backup file format." };
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle("export-stats-csv", async () => {
    const mainWindow = ctx.getMainWindow();
    const history = ctx.getHistory();
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

  // ── Auto-updater ─────────────────────────────────────────────────────────

  ipcMain.handle("check-for-updates", async () => {
    const { app } = require("electron");
    if (!app.isPackaged) return { status: "dev" };
    try {
      const { autoUpdater } = require("electron-updater");
      const result = await autoUpdater.checkForUpdates();
      return { status: "checked", version: result?.updateInfo?.version || null };
    } catch (err) {
      return { status: "error", message: err.message };
    }
  });

  ipcMain.handle("install-update", () => {
    try { const { autoUpdater } = require("electron-updater"); autoUpdater.quitAndInstall(); } catch (err) {
      console.error("Failed to install update:", err.message);
    }
  });

  // ── Launch at login ──────────────────────────────────────────────────────

  ipcMain.handle("get-launch-at-login", () => {
    return require("electron").app.getLoginItemSettings().openAtLogin;
  });

  ipcMain.handle("set-launch-at-login", (_, enabled) => {
    const { app } = require("electron");
    app.setLoginItemSettings({ openAtLogin: enabled });
    const settings = ctx.getSettings();
    settings.launchAtLogin = enabled;
    ctx.saveSettings();
    return enabled;
  });

  // ── Favorites ────────────────────────────────────────────────────────────

  ipcMain.handle("toggle-favorite", (_, docId) => {
    const doc = ctx.getDocById(docId);
    if (doc) {
      doc.favorite = !doc.favorite;
      ctx.saveLibrary();
      return doc.favorite;
    }
    return false;
  });

  // ── Archive ──────────────────────────────────────────────────────────────

  ipcMain.handle("archive-doc", (_, docId) => {
    const doc = ctx.getDocById(docId);
    if (doc) {
      doc.archived = true;
      doc.archivedAt = Date.now();
      ctx.saveLibrary();
    }
  });

  ipcMain.handle("unarchive-doc", (_, docId) => {
    const doc = ctx.getDocById(docId);
    if (doc) {
      doc.archived = false;
      delete doc.archivedAt;
      ctx.saveLibrary();
    }
  });

  // ── Multi-window reader ──────────────────────────────────────────────────

  ipcMain.handle("open-reader-window", (_, docId) => {
    createReaderWindow(docId, ctx.getSettings(), ctx.isDev, ctx.readerWindows);
  });

  // ── Error logging ────────────────────────────────────────────────────────

  ipcMain.handle("log-error", async (_, message) => {
    await logToFile(message, ctx.getErrorLogPath());
  });

  // ── Site logins ──────────────────────────────────────────────────────────

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

  // ── Cloud sync ──────────────────────────────────────────────────────────

  const auth = require("./auth");
  const syncEngine = require("./sync-engine");

  ipcMain.handle("cloud-sign-in", async (_, provider) => {
    try {
      const result = await auth.signIn(provider);
      return { success: true, ...result };
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle("cloud-sign-out", async (_, provider) => {
    try {
      await auth.signOut(provider);
      syncEngine.stopAutoSync();
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle("cloud-get-auth-state", () => {
    return auth.getAuthState();
  });

  ipcMain.handle("cloud-sync-now", async () => {
    return await syncEngine.startSync();
  });

  ipcMain.handle("cloud-get-sync-status", () => {
    return syncEngine.getSyncStatus();
  });

  ipcMain.handle("cloud-get-merge-preview", async () => {
    return await syncEngine.getMergePreview();
  });

  ipcMain.handle("cloud-force-sync", async (_, direction) => {
    return await syncEngine.forceSync(direction);
  });

  ipcMain.handle("cloud-start-auto-sync", (_, intervalMs) => {
    syncEngine.startAutoSync(intervalMs);
    return { ok: true };
  });

  ipcMain.handle("cloud-stop-auto-sync", () => {
    syncEngine.stopAutoSync();
    return { ok: true };
  });

  // 19E: Download document content on demand (lazy load from cloud)
  ipcMain.handle("cloud-download-doc-content", async (_, docId) => {
    return await syncEngine.downloadDocContent(docId);
  });

  // 19F: Trigger a full cloud reconciliation (on-demand or from settings UI)
  ipcMain.handle("cloud-full-reconciliation", async () => {
    return await syncEngine.fullReconciliation();
  });

  // Forward sync status changes to renderer
  syncEngine.onSyncStatusChange((status) => {
    const mainWindow = ctx.getMainWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("cloud-sync-status-changed", status);
    }
  });

  // Forward auth-required events to renderer
  auth.onAuthRequired((provider) => {
    const mainWindow = ctx.getMainWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("cloud-auth-required", provider);
    }
  });

  // ── Sprint 20: Keyboard-First UX IPC Handlers ──────────────────────────

  // Open document source (URL in browser or folder in file manager)
  ipcMain.handle("open-doc-source", async (_, docId) => {
    const { shell } = require("electron");
    const doc = ctx.getDocById(docId);
    if (!doc) return { error: "Document not found" };

    if (doc.sourceUrl) {
      await shell.openExternal(doc.sourceUrl);
      return { opened: true };
    } else if (doc.filepath) {
      shell.showItemInFolder(doc.filepath);
      return { opened: true };
    }
    return { error: "No source available" };
  });

  // Get all highlights across all documents
  ipcMain.handle("get-all-highlights", async () => {
    const settings = ctx.getSettings();
    const highlightPath = settings.sourceFolder
      ? path.join(settings.sourceFolder, "Blurby Highlights.md")
      : path.join(ctx.getDataPath(), "highlights.md");

    try {
      const content = await fsPromises.readFile(highlightPath, "utf-8");
      const highlights = [];
      const blocks = content.split("---\n\n");

      for (const block of blocks) {
        const quoteMatch = block.match(/> "(.+?)"/s);
        const metaMatch = block.match(/— \*(.+?)\*, position (\d+)\/(\d+)/);
        const dateMatch = block.match(/Saved: (.+)/);

        if (quoteMatch && metaMatch) {
          highlights.push({
            text: quoteMatch[1],
            docTitle: metaMatch[1],
            docId: "",
            wordIndex: parseInt(metaMatch[2], 10),
            totalWords: parseInt(metaMatch[3], 10),
            date: dateMatch ? dateMatch[1].trim() : "",
          });
        }
      }

      // Try to resolve docIds from library
      const library = ctx.getLibrary();
      for (const h of highlights) {
        const doc = library.find((d) => d.title === h.docTitle);
        if (doc) h.docId = doc.id;
      }

      return highlights;
    } catch {
      return [];
    }
  });

  // Snooze a document until a specific time
  ipcMain.handle("snooze-doc", (_, docId, until) => {
    const library = ctx.getLibrary();
    const doc = library.find((d) => d.id === docId);
    if (doc) {
      doc.snoozedUntil = until;
      ctx.saveLibrary();
      ctx.broadcastLibrary();
    }
  });

  // Unsnooze a document
  ipcMain.handle("unsnooze-doc", (_, docId) => {
    const library = ctx.getLibrary();
    const doc = library.find((d) => d.id === docId);
    if (doc) {
      doc.snoozedUntil = null;
      ctx.saveLibrary();
      ctx.broadcastLibrary();
    }
  });

  // Check for snoozed docs that should reappear (called periodically)
  function checkSnoozedDocs() {
    const library = ctx.getLibrary();
    const now = Date.now();
    let changed = false;

    for (const doc of library) {
      if (doc.snoozedUntil && doc.snoozedUntil <= now) {
        doc.snoozedUntil = null;
        changed = true;

        // Show system notification
        const { Notification } = require("electron");
        if (Notification.isSupported()) {
          const notification = new Notification({
            title: "Time to read",
            body: doc.title,
            icon: undefined,
          });
          notification.show();
        }
      }
    }

    if (changed) {
      ctx.saveLibrary();
      ctx.broadcastLibrary();
    }
  }

  // Check snoozed docs on startup and every 60 seconds
  checkSnoozedDocs();
  setInterval(checkSnoozedDocs, SNOOZE_CHECK_INTERVAL_MS);

  // Sprint 20V: Save a reading note to .docx
  // Uses a JSON sidecar to accumulate notes, regenerates .docx each time
  ipcMain.handle("save-reading-note", async (_, { docId, highlight, note, citation }) => {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, TableOfContents } = require("docx");
    const doc = ctx.getDocById(docId);
    if (!doc) return { error: "Document not found" };

    const safeName = doc.title.replace(/[<>:"/\\|?*]/g, "-").slice(0, 80);
    const settings = ctx.getSettings();
    const outputDir = settings.sourceFolder || ctx.getDataPath();
    const docxPath = path.join(outputDir, `${safeName} — Reading Notes.docx`);
    const jsonPath = path.join(ctx.getDataPath(), `notes-${docId}.json`);

    const timestamp = new Date().toLocaleString("en-US", {
      year: "numeric", month: "long", day: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });

    try {
      // Load existing notes from JSON sidecar
      let allNotes = [];
      try {
        const raw = await fsPromises.readFile(jsonPath, "utf-8");
        allNotes = JSON.parse(raw);
      } catch { /* no existing notes */ }

      // Append new note
      allNotes.push({ highlight, note, citation, timestamp, docTitle: doc.title });

      // Save JSON sidecar (atomic)
      const jsonTmp = jsonPath + ".tmp";
      await fsPromises.writeFile(jsonTmp, JSON.stringify(allNotes, null, 2), "utf-8");
      await fsPromises.rename(jsonTmp, jsonPath);

      // Regenerate .docx from all notes with Table of Contents
      const paragraphs = [
        new Paragraph({
          children: [new TextRun({ text: "Reading Notes", bold: true, size: 32 })],
          heading: HeadingLevel.TITLE,
        }),
        new TableOfContents("Table of Contents", {
          hyperlink: true,
          headingStyleRange: "1-2",
        }),
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "D04716" } },
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: doc.title, bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ spacing: { after: 200 } }),
      ];

      for (const n of allNotes) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: `"${n.highlight}"`, italics: true, size: 22 })],
            spacing: { before: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: n.citation || "", size: 20, color: "666666" })],
            spacing: { before: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: n.note, size: 22 })],
            spacing: { before: 150 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `— ${n.timestamp}`, size: 20, color: "999999" })],
            spacing: { before: 100, after: 200 },
          }),
          new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
            spacing: { after: 200 },
          })
        );
      }

      const newDoc = new Document({
        title: `${doc.title} — Reading Notes`,
        features: { updateFields: true }, // auto-update TOC on open
        sections: [{ children: paragraphs }],
      });

      const buffer = await Packer.toBuffer(newDoc);
      const tmp = docxPath + ".tmp";
      await fsPromises.writeFile(tmp, buffer);
      await fsPromises.rename(tmp, docxPath);
      return { ok: true, path: docxPath, count: allNotes.length };
    } catch (err) {
      return { error: err.message };
    }
  });

  // Sprint 20W: Log a reading session to .xlsx
  ipcMain.handle("log-reading-session", async (_, { docId, duration, wordsRead, finalWpm, mode, chapter }) => {
    const ExcelJS = require("exceljs");
    const doc = ctx.getDocById(docId);
    if (!doc) return { error: "Document not found" };

    const settings = ctx.getSettings();
    const outputDir = settings.sourceFolder || ctx.getDataPath();
    const xlsxPath = path.join(outputDir, "Blurby Reading Log.xlsx");

    try {
      let workbook;
      try {
        workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(xlsxPath);
      } catch {
        // Copy from template — preserves all formatting, formulas, charts, and layout
        const templatePath = path.join(__dirname, "..", "docs", "project", "Reading_Log_Blurby_Template.xlsx");
        try {
          await fsPromises.copyFile(templatePath, xlsxPath);
        } catch {
          // Fallback: template may be in app resources (packaged build)
          const { app } = require("electron");
          const bundledTemplate = path.join(app.getAppPath(), "docs", "project", "Reading_Log_Blurby_Template.xlsx");
          await fsPromises.copyFile(bundledTemplate, xlsxPath);
        }
        workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(xlsxPath);
        // Clear sample data rows from template, keeping header row
        const rlSheet = workbook.getWorksheet("Reading Log");
        if (rlSheet && rlSheet.rowCount > 1) {
          for (let r = rlSheet.rowCount; r >= 2; r--) {
            rlSheet.spliceRows(r, 1);
          }
        }
        await workbook.xlsx.writeFile(xlsxPath);
      }

      const sheet = workbook.getWorksheet("Reading Log");
      if (!sheet) return { error: "Reading Log sheet not found" };

      // Find existing row for this document or create new
      let docRow = null;
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        if (row.getCell("title").value === doc.title) {
          docRow = row;
        }
      });

      const pctRead = doc.wordCount > 0 ? Math.round(((doc.position || 0) / doc.wordCount) * 100) : 0;
      const estPages = Math.ceil((doc.wordCount || 0) / 250);
      const durationMin = Math.round((duration || 0) / 60000);

      if (docRow) {
        // Update existing row
        const prevSessions = (docRow.getCell("sessions").value || 0);
        const prevTime = (docRow.getCell("totalTime").value || 0);
        docRow.getCell("sessions").value = prevSessions + 1;
        docRow.getCell("totalTime").value = prevTime + durationMin;
        docRow.getCell("avgWpm").value = finalWpm || docRow.getCell("avgWpm").value;
        docRow.getCell("pctRead").value = pctRead;
        if (pctRead >= 100 && !docRow.getCell("dateFinished").value) {
          docRow.getCell("dateFinished").value = new Date().toISOString().slice(0, 10);
        }
      } else {
        // Parse author name
        const authorStr = doc.author || doc.authorFull || "";
        const authorParts = authorStr.split(/\s+/);
        const authorLast = authorParts.length > 1 ? authorParts[authorParts.length - 1] : authorStr;
        const authorFirst = authorParts.length > 1 ? authorParts.slice(0, -1).join(" ") : "";

        // Determine work type
        const workType = doc.source === "url" ? "Article" : "Book";

        // Pub year
        let pubYear = "";
        if (doc.publishedDate) {
          try { pubYear = new Date(doc.publishedDate).getFullYear().toString(); } catch {}
        }

        const rowNum = sheet.rowCount; // next row number after header
        sheet.addRow({
          num: rowNum,
          title: doc.title,
          authorLast,
          authorFirst,
          pubYear,
          publisher: doc.sourceDomain || "",
          url: doc.sourceUrl || "",
          workType,
          format: "Digital",
          pages: estPages,
          dateStarted: new Date().toISOString().slice(0, 10),
          sessions: 1,
          totalTime: durationMin,
          avgWpm: finalWpm || 0,
          pctRead,
          dateFinished: pctRead >= 100 ? new Date().toISOString().slice(0, 10) : "",
          rating: "",
          notes: "",
        });
      }

      const tmp = xlsxPath + ".tmp";
      await workbook.xlsx.writeFile(tmp);
      await fsPromises.rename(tmp, xlsxPath);
      return { ok: true, path: xlsxPath };
    } catch (err) {
      return { error: err.message };
    }
  });

  // Sprint 20W: Open reading log file
  ipcMain.handle("open-reading-log", async () => {
    const { shell } = require("electron");
    const settings = ctx.getSettings();
    const outputDir = settings.sourceFolder || ctx.getDataPath();
    const xlsxPath = path.join(outputDir, "Blurby Reading Log.xlsx");
    try {
      await fsPromises.access(xlsxPath);
    } catch {
      // Copy from template — preserves all formatting, formulas, charts, and layout
      try {
        const templatePath = path.join(__dirname, "..", "docs", "project", "Reading_Log_Blurby_Template.xlsx");
        try {
          await fsPromises.copyFile(templatePath, xlsxPath);
        } catch {
          const { app } = require("electron");
          const bundledTemplate = path.join(app.getAppPath(), "docs", "project", "Reading_Log_Blurby_Template.xlsx");
          await fsPromises.copyFile(bundledTemplate, xlsxPath);
        }
        // Clear sample data rows from template, keeping header + formulas
        const ExcelJS = require("exceljs");
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.readFile(xlsxPath);
        const rlSheet = wb.getWorksheet("Reading Log");
        if (rlSheet && rlSheet.rowCount > 1) {
          for (let r = rlSheet.rowCount; r >= 2; r--) {
            rlSheet.spliceRows(r, 1);
          }
        }
        await wb.xlsx.writeFile(xlsxPath);
      } catch (createErr) {
        return { error: `Could not create reading log: ${createErr.message}` };
      }
    }
    try {
      await shell.openPath(xlsxPath);
      return { ok: true };
    } catch (openErr) {
      return { error: `Could not open reading log: ${openErr.message}` };
    }
  });

  // Open reading notes .docx for the current or most recent document
  ipcMain.handle("open-reading-notes", async (_, docId) => {
    const { shell } = require("electron");
    const settings = ctx.getSettings();
    const outputDir = settings.sourceFolder || ctx.getDataPath();

    if (docId) {
      // Open notes for a specific document
      const doc = ctx.getDocById(docId);
      if (doc) {
        const safeName = doc.title.replace(/[<>:"/\\|?*]/g, "-").slice(0, 80);
        const docxPath = path.join(outputDir, `${safeName} — Reading Notes.docx`);
        try {
          await fsPromises.access(docxPath);
          await shell.openPath(docxPath);
          return { ok: true };
        } catch {
          return { error: "No notes yet for this document." };
        }
      }
    }

    // Fallback: find any notes .docx in the output dir
    try {
      const files = await fsPromises.readdir(outputDir);
      const notesFile = files.find((f) => f.endsWith("— Reading Notes.docx"));
      if (notesFile) {
        await shell.openPath(path.join(outputDir, notesFile));
        return { ok: true };
      }
    } catch { /* ignore */ }
    return { error: "No reading notes found. Highlight a word and press Shift+N to create a note." };
  });

  // ── WebSocket server for Chrome extension ─────────────────────────────────

  const wsServer = require("./ws-server");

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

  // ── Kokoro TTS ──────────────────────────────────────────────────────────

  const ttsEngine = require("./tts-engine");

  // Set up loading callback to notify renderer
  ttsEngine.setLoadingCallback((loading) => {
    const mainWindow = ctx.getMainWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("tts-kokoro-loading", loading);
    }
  });

  ipcMain.handle("tts-kokoro-generate", async (_, text, voice, speed) => {
    try {
      const result = await ttsEngine.generate(text, voice, speed);
      // audio is already an Array from the worker
      return {
        audio: result.audio,
        sampleRate: result.sampleRate,
        durationMs: result.durationMs,
      };
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle("tts-kokoro-voices", async () => {
    try {
      return { voices: await ttsEngine.listVoices() };
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle("tts-kokoro-model-status", () => {
    return { ready: ttsEngine.isModelReady() };
  });

  ipcMain.handle("tts-kokoro-download", async () => {
    try {
      await ttsEngine.downloadModel((progress) => {
        const mainWindow = ctx.getMainWindow();
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("tts-kokoro-download-progress", progress);
        }
      });
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  });

  // Pre-load Kokoro model when reader opens (non-blocking)
  ipcMain.handle("tts-kokoro-preload", async () => {
    try {
      await ttsEngine.preload();
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  });
}

module.exports = {
  registerIpcHandlers,
  // Export pure functions for testing
  formatHighlightEntry,
  parseDefinitionResponse,
};
