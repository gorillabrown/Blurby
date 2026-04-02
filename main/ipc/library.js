"use strict";
// main/ipc/library.js — Library CRUD, file import, folder operations

const { ipcMain, dialog } = require("electron");
const path = require("path");
const fsPromises = require("fs/promises");

const { extractContent, extractDocMetadata, countWords,
        extractEpubMetadata, extractEpubCover, extractMobiCover,
        parseMobiMetadata, parseCallibreOpf,
        clearChapterCache, epubChapterCache } = require("../file-parsers");
const { htmlToEpub } = require("../epub-converter");
const { normalizeAuthor } = require("../author-normalize");

async function logToFile(message, errorLogPath) {
  try {
    const timestamp = new Date().toISOString();
    await fsPromises.appendFile(errorLogPath, `[${timestamp}] ${message}\n`, "utf-8");
  } catch { /* Intentional: error logging should never crash the app */ }
}

function register(ctx) {
  ipcMain.handle("save-library", (_, newDocs) => { ctx.setLibrary(newDocs); ctx.saveLibrary(); });

  ipcMain.handle("add-manual-doc", (_, title, content) => {
    const syncEngine = require("../sync-engine");
    const syncQueue = require("../sync-queue");
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
    syncQueue.enqueue("add-doc", { docId: doc.id, revision }).catch(err => console.error("[sync-queue] add-doc enqueue failed:", err.message));

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
    const syncEngine = require("../sync-engine");
    const syncQueue = require("../sync-queue");
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
    syncQueue.enqueue("delete-doc", { docId, revision }).catch(err => console.error("[sync-queue] delete-doc enqueue failed:", err.message));
  });

  ipcMain.handle("update-doc", (_, docId, title, content) => {
    const doc = ctx.getDocById(docId);
    if (doc) {
      const syncEngine = require("../sync-engine");
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

  ipcMain.handle("load-doc-content", async (_, docId) => {
    const doc = ctx.getDocById(docId);
    if (!doc) return null;

    // If doc already has an EPUB path, use it
    if (doc.convertedEpubPath) {
      return { filepath: doc.convertedEpubPath, ext: ".epub" };
    }

    // Native EPUB — return filepath directly
    if (doc.filepath && doc.ext === ".epub") {
      return { filepath: doc.filepath, ext: ".epub" };
    }

    // On-demand lazy EPUB conversion for legacy docs with a source file
    if (doc.filepath && doc.ext !== ".epub") {
      try {
        const { convertToEpub } = require("../epub-converter");
        const { EPUB_CONVERTED_DIR } = require("../constants");
        const convertedDir = path.join(ctx.getDataPath(), EPUB_CONVERTED_DIR);
        const convResult = await convertToEpub(doc.filepath, convertedDir, doc.id, {
          title: doc.title,
          author: doc.author || "Unknown",
        });
        // Update doc record with EPUB path
        doc.convertedEpubPath = convResult.epubPath;
        doc.ext = ".epub";
        if (doc.needsEpubConversion) delete doc.needsEpubConversion;
        ctx.saveLibrary();
        return { filepath: convResult.epubPath, ext: ".epub" };
      } catch (convErr) {
        logToFile(`load-doc-content EPUB conversion failed for "${doc.title}" (${doc.filepath}): ${convErr.message}`, ctx.getErrorLogPath());
        return { userError: "This document needs to be re-imported. The original file could not be converted." };
      }
    }

    // Inline content (legacy URL-imported docs without files)
    if (doc.content) return doc.content;

    return { userError: "This document needs to be re-imported." };
  });

  // Read raw file buffer — used by foliate-js to load EPUBs in the renderer
  // Security: validate path is within allowed directories to prevent arbitrary file reads
  ipcMain.handle("read-file-buffer", async (_, filePath) => {
    try {
      const resolved = path.resolve(filePath);
      const settings = ctx.getSettings();
      const allowedRoots = [
        ctx.getDataPath(),
        settings.sourceFolder,
      ].filter(Boolean).map(r => path.resolve(r));
      const allowed = allowedRoots.some(root => resolved.startsWith(root + path.sep) || resolved === root);
      if (!allowed) {
        console.error("read-file-buffer blocked — path outside allowed directories:", resolved);
        logToFile(`read-file-buffer BLOCKED: "${resolved}" not within allowed roots`, ctx.getErrorLogPath());
        return null;
      }
      const buffer = await fsPromises.readFile(resolved);
      return buffer.buffer; // Return ArrayBuffer
    } catch (err) {
      console.error("read-file-buffer error:", err.message);
      logToFile(`read-file-buffer error for "${filePath}": ${err.message}`, ctx.getErrorLogPath());
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

  ipcMain.handle("import-dropped-files", async (_, filePaths) => {
    const settings = ctx.getSettings();
    const SUPPORTED_EXT = require("../folder-watcher").SUPPORTED_EXT;
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
            author: normalizeAuthor(meta.author), coverPath: meta.coverPath, lastReadAt: null,
          };

          if (ext !== ".epub") {
            try {
              const { convertToEpub } = require("../epub-converter");
              const { EPUB_CONVERTED_DIR } = require("../constants");
              const convertedDir = path.join(ctx.getDataPath(), EPUB_CONVERTED_DIR);
              const convResult = await convertToEpub(destPath, convertedDir, docId, {
                title: meta.title || path.basename(destPath, ext),
                author: normalizeAuthor(meta.author),
              });
              doc.convertedEpubPath = convResult.epubPath;
              doc.originalFilepath = destPath;
              doc.filepath = convResult.epubPath;
              doc.ext = ".epub";
              if (convResult && !convResult.valid) {
                doc.legacyRenderer = true;
              }
            } catch (convErr) {
              logToFile(`EPUB conversion failed for ${destPath}: ${convErr.message}`, ctx.getErrorLogPath());
              if (convErr.userError) {
                rejected.push(path.basename(destPath) + ": " + convErr.message);
                continue; // Skip adding to library — file is not readable
              }
              // Non-user errors: fall back to legacy text extraction
              doc.legacyRenderer = true;
            }
          }

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

        if (ext !== ".epub") {
          try {
            const { convertToEpub } = require("../epub-converter");
            const { EPUB_CONVERTED_DIR } = require("../constants");
            const convertedDir = path.join(ctx.getDataPath(), EPUB_CONVERTED_DIR);
            const convResult = await convertToEpub(fp, convertedDir, docId, {
              title: doc.title,
              author: undefined,
            });
            doc.convertedEpubPath = convResult.epubPath;
            doc.originalFilepath = fp;
            doc.filepath = convResult.epubPath;
            doc.ext = ".epub";
            if (convResult && !convResult.valid) {
              doc.legacyRenderer = true;
            }
          } catch (convErr) {
            logToFile(`EPUB conversion failed for ${fp}: ${convErr.message}`, ctx.getErrorLogPath());
            if (convErr.userError) {
              rejected.push(path.basename(fp) + ": " + convErr.message);
              continue; // Skip adding to library — file is not readable
            }
            // Non-user errors: fall back to legacy text extraction
            doc.legacyRenderer = true;
          }
        }

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

  ipcMain.handle("rescan-folder", async () => {
    const settings = ctx.getSettings();
    if (!settings.sourceFolder) return { error: "No source folder selected" };
    console.log("[rescan] Starting rescan of:", settings.sourceFolder);
    ctx.clearFailedExtractions();
    try {
      const { scanFolderAsync } = require("../folder-watcher");
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
              if (!prev.author && meta.author) updates.author = normalizeAuthor(meta.author);
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
              if (!prev.author && opfMeta.author) updates.author = normalizeAuthor(opfMeta.author);
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
              author: normalizeAuthor(meta.author), coverPath: meta.coverPath, lastReadAt: null,
            });
          } else {
            ctx.addFailedExtraction(file.filepath);
          }
        }
      }

      // Preserve non-folder docs; convert URL docs to EPUB if they have content
      const savedArticlesPath = settings.sourceFolder
        ? path.join(path.resolve(settings.sourceFolder), "Saved Articles")
        : null;
      for (const doc of docs) {
        if (doc.source === "url" && doc.content && !doc.convertedEpubPath) {
          try {
            const os = require("os");
            const { EPUB_CONVERTED_DIR } = require("../constants");
            const tempHtmlPath = path.join(os.tmpdir(), `blurby-sync-${doc.id}.html`);
            const articleHtml = doc.content.split(/\n\n+/).map(p => `<p>${p.trim()}</p>`).join("\n");
            await fsPromises.writeFile(
              tempHtmlPath,
              `<html><head><title>${(doc.title || "").replace(/</g, "&lt;")}</title></head><body>${articleHtml}</body></html>`,
              "utf-8"
            );
            const convertedDir = path.join(ctx.getDataPath(), EPUB_CONVERTED_DIR);
            await fsPromises.mkdir(convertedDir, { recursive: true });
            const epubOutputPath = path.join(convertedDir, `${doc.id}.epub`);
            const convResult = await htmlToEpub(tempHtmlPath, epubOutputPath, {
              title: doc.title,
              author: doc.authorFull || doc.author || "Unknown",
              source: doc.sourceUrl || undefined,
              date: doc.publishedDate || undefined,
            });
            await fsPromises.unlink(tempHtmlPath).catch(() => {});
            synced.push({
              ...doc,
              source: "url",
              filepath: convResult.epubPath,
              convertedEpubPath: convResult.epubPath,
              ext: ".epub",
              content: undefined,
            });
            console.log(`Converted URL doc to EPUB: ${doc.title}`);
          } catch (err) {
            console.error(`Failed to convert URL doc "${doc.title}" to EPUB:`, err.message);
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
      logToFile(`Rescan failed: ${err.message}`, ctx.getErrorLogPath());
      const isPermission = err.message && (
        err.message.includes("EACCES") || err.message.includes("EPERM") || err.message.includes("permission")
      );
      return { error: isPermission
        ? "Could not scan folder — check permissions."
        : "Folder rescan failed — please try again." };
    }
  });


  // READINGS-4B: Batch normalize all author names in library
  ipcMain.handle("normalize-all-authors", async () => {
    const library = ctx.getLibrary();
    let updated = 0;
    for (const doc of library) {
      if (!doc.author || doc.deleted) continue;
      const normalized = normalizeAuthor(doc.author);
      if (normalized !== doc.author) {
        doc.author = normalized;
        updated++;
      }
    }
    if (updated > 0) {
      ctx.saveLibrary();
      ctx.broadcastLibrary();
    }
    return { updated };
  });
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
      return { error: "Invalid backup file — expected a Blurby backup JSON." };
    } catch (err) {
      console.error("Library import failed:", err.message);
      logToFile(`Library import failed: ${err.message}`, ctx.getErrorLogPath());
      const isJson = err instanceof SyntaxError;
      return { error: isJson
        ? "Could not read backup file — the file is not valid JSON."
        : "Library import failed — please try again." };
    }
  });


  // READINGS-4A: Queue operations
  ipcMain.handle("add-to-queue", (_, docId) => {
    const library = ctx.getLibrary();
    // Find the max queuePosition currently in use
    let maxPos = -1;
    for (const d of library) {
      if (d.queuePosition !== undefined && d.queuePosition > maxPos) {
        maxPos = d.queuePosition;
      }
    }
    const updated = library.map((d) =>
      d.id === docId ? { ...d, queuePosition: maxPos + 1 } : d
    );
    ctx.setLibrary(updated);
    ctx.saveLibrary();
    ctx.broadcastLibrary();
  });

  ipcMain.handle("remove-from-queue", (_, docId) => {
    const library = ctx.getLibrary();
    const removedDoc = library.find((d) => d.id === docId);
    const removedPos = removedDoc?.queuePosition;
    const updated = library.map((d) => {
      if (d.id === docId) {
        const { queuePosition, ...rest } = d;
        return rest;
      }
      // Compact: shift down docs that were above the removed position
      if (removedPos !== undefined && d.queuePosition !== undefined && d.queuePosition > removedPos) {
        return { ...d, queuePosition: d.queuePosition - 1 };
      }
      return d;
    });
    ctx.setLibrary(updated);
    ctx.saveLibrary();
    ctx.broadcastLibrary();
  });

  ipcMain.handle("reorder-queue", (_, docId, newPosition) => {
    const library = ctx.getLibrary();
    const doc = library.find((d) => d.id === docId);
    if (!doc || doc.queuePosition === undefined) return;
    const oldPosition = doc.queuePosition;
    if (oldPosition === newPosition) return;

    const updated = library.map((d) => {
      if (d.id === docId) return { ...d, queuePosition: newPosition };
      if (d.queuePosition === undefined) return d;
      // Shift items between old and new positions
      if (oldPosition < newPosition) {
        // Moving down: shift items in (old, new] up by 1
        if (d.queuePosition > oldPosition && d.queuePosition <= newPosition) {
          return { ...d, queuePosition: d.queuePosition - 1 };
        }
      } else {
        // Moving up: shift items in [new, old) down by 1
        if (d.queuePosition >= newPosition && d.queuePosition < oldPosition) {
          return { ...d, queuePosition: d.queuePosition + 1 };
        }
      }
      return d;
    });
    ctx.setLibrary(updated);
    ctx.saveLibrary();
    ctx.broadcastLibrary();
  });

  ipcMain.handle("cancel-sync", () => {
    if (ctx.cancelSync) ctx.cancelSync();
    return { ok: true };
  });

  ipcMain.handle("get-file-path-for-drop", async (_, filePath) => {
    // Utility for renderer to get a resolved path (passthrough)
    return filePath;
  });

  // READINGS-4C: Metadata scan — reports docs with missing/incomplete metadata
  ipcMain.handle("scan-library-metadata", async () => {
    const { parseFilenameMetadata } = require("../metadata-utils");
    const library = ctx.getLibrary();
    const results = [];

    for (const doc of library) {
      if (doc.deleted) continue;

      const issues = [];
      const suggestions = {};

      // Check for missing author
      if (!doc.author || doc.author === "Unknown" || doc.author === "unknown") {
        issues.push("no-author");
      }

      // Check for title that looks like a filename
      const titleLooksLikeFilename = doc.filename &&
        (doc.title === doc.filename ||
         doc.title === path.basename(doc.filename, path.extname(doc.filename)));
      if (titleLooksLikeFilename) {
        issues.push("filename-title");
      }

      // Check for missing cover
      if (!doc.coverPath) {
        issues.push("no-cover");
      }

      // Skip docs with no issues
      if (issues.length === 0) continue;

      // Try to extract suggestions from filename
      if (doc.filename || doc.filepath) {
        const fname = doc.filename || path.basename(doc.filepath);
        const parsed = parseFilenameMetadata(fname);
        if (parsed.suggestedTitle) suggestions.title = parsed.suggestedTitle;
        if (parsed.suggestedAuthor) suggestions.author = parsed.suggestedAuthor;
      }

      // Try to extract suggestions from EPUB metadata
      const epubPath = doc.convertedEpubPath || (doc.ext === ".epub" ? doc.filepath : null);
      if (epubPath) {
        try {
          const meta = await extractEpubMetadata(epubPath);
          if (meta.title && !suggestions.title) suggestions.title = meta.title;
          if (meta.author && !suggestions.author) suggestions.author = meta.author;
        } catch { /* best-effort */ }
      }

      results.push({
        docId: doc.id,
        currentTitle: doc.title,
        currentAuthor: doc.author || null,
        currentCoverPath: doc.coverPath || null,
        issues,
        suggestions,
      });
    }

    return results;
  });

  // READINGS-4C: Batch apply metadata updates
  ipcMain.handle("apply-metadata-updates", async (_, updates) => {
    if (!Array.isArray(updates)) return { updated: 0 };

    const ALLOWED_FIELDS = new Set(["title", "author", "coverPath"]);
    const library = ctx.getLibrary();
    const updateMap = new Map();
    for (const { docId, updates: fields } of updates) {
      if (!docId || !fields || typeof fields !== "object") continue;
      // Filter to allowed fields only
      const clean = {};
      for (const [key, value] of Object.entries(fields)) {
        if (ALLOWED_FIELDS.has(key)) clean[key] = value;
      }
      if (Object.keys(clean).length > 0) updateMap.set(docId, clean);
    }

    if (updateMap.size === 0) return { updated: 0 };

    let count = 0;
    const updatedLibrary = library.map((doc) => {
      const fields = updateMap.get(doc.id);
      if (!fields) return doc;
      count++;
      return { ...doc, ...fields, modified: Date.now() };
    });

    ctx.setLibrary(updatedLibrary);
    ctx.saveLibrary();
    ctx.broadcastLibrary();
    return { updated: count };
  });

}

module.exports = { register };