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

// ── Constants ────────────────────────────────────────────────────────────────
const DEFINITION_CACHE_MAX = 500;
const DEFINITION_TIMEOUT_MS = 5000;
const MAX_RECENT_FOLDERS = 5;
const MAX_HISTORY_SESSIONS = 1000;
const MS_PER_DAY = 86400000;

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
  const COVER_CACHE_MAX = 100;

  ipcMain.handle("get-state", () => ({ settings: ctx.getSettings(), library: ctx.getLibrary() }));
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
  });

  ipcMain.handle("save-library", (_, newDocs) => { ctx.setLibrary(newDocs); ctx.saveLibrary(); });

  ipcMain.handle("update-doc-progress", (_, docId, position) => {
    const doc = ctx.getDocById(docId);
    if (doc) { doc.position = position; ctx.saveLibrary(); }
  });

  ipcMain.handle("add-manual-doc", (_, title, content) => {
    const wordCount = countWords(content);
    const doc = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
      title, content, wordCount, position: 0, created: Date.now(), source: "manual",
    };
    ctx.addDocToLibrary(doc);
    ctx.saveLibrary();
    return doc;
  });

  ipcMain.handle("delete-doc", (_, docId) => {
    const doc = ctx.getDocById(docId);
    if (doc && doc.filepath) {
      // Clean up caches for deleted doc
      clearChapterCache(doc.filepath);
      if (ctx.removeFailedExtraction) ctx.removeFailedExtraction(doc.filepath);
    }
    if (ctx.removeDocFromLibrary) {
      ctx.removeDocFromLibrary(docId);
    } else {
      ctx.setLibrary(ctx.getLibrary().filter((d) => d.id !== docId));
    }
    ctx.saveLibrary();
  });

  ipcMain.handle("update-doc", (_, docId, title, content) => {
    const doc = ctx.getDocById(docId);
    if (doc) {
      doc.title = title;
      doc.content = content;
      doc.wordCount = countWords(content);
      ctx.saveLibrary();
    }
  });

  ipcMain.handle("reset-progress", (_, docId) => {
    const doc = ctx.getDocById(docId);
    if (doc) { doc.position = 0; ctx.saveLibrary(); }
  });

  ipcMain.handle("load-doc-content", async (_, docId) => {
    const doc = ctx.getDocById(docId);
    if (!doc) return null;
    if (doc.content) return doc.content;
    if (doc.filepath) return await extractContent(doc.filepath);
    return null;
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
            const coversDir = path.join(ctx.getDataPath(), "covers");
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
        wordCount: countWords(result.content),
        sourceUrl: url, position: 0, created: Date.now(), source: "url",
        author: result.author || null,
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
      return { error: err.message || "Failed to fetch URL." };
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
              author: null,
              content: doc.content,
              sourceUrl: doc.sourceUrl || "",
              fetchDate: new Date(doc.created || Date.now()),
              outputDir: settings.sourceFolder,
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
}

module.exports = {
  registerIpcHandlers,
  // Export pure functions for testing
  formatHighlightEntry,
  parseDefinitionResponse,
};
