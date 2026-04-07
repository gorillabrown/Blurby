"use strict";
// main/ipc/documents.js — Document state mutations: progress, favorites, archive, snooze

const { ipcMain } = require("electron");
const { SNOOZE_CHECK_INTERVAL_MS } = require("../constants");
const { createReaderWindow } = require("../window-manager");

// Index of doc IDs that currently have an active snooze. Seeded from persisted
// library on registration, then kept in sync by snooze/unsnooze handlers and
// the expiry loop. O(snoozed) checks instead of O(library) on every tick.
const snoozedDocIds = new Set();

function register(ctx) {
  ipcMain.handle("update-doc-progress", (_, docId, position, cfi) => {
    const doc = ctx.getDocById(docId);
    if (doc) {
      const syncEngine = require("../sync-engine");
      const syncQueue = require("../sync-queue");
      const syncStatus = syncEngine.getSyncStatus();
      const revision = syncStatus.revision || 0;

      doc.position = position;
      if (cfi) doc.cfi = cfi;
      doc.modified = Date.now();
      doc.revision = revision;
      ctx.saveLibrary();

      // Enqueue update-progress for sync
      syncQueue.enqueue("update-progress", { docId, value: position, revision }).catch(err => console.error("[sync-queue] update-progress enqueue failed:", err.message));
    }
  });

  ipcMain.handle("reset-progress", (_, docId) => {
    const doc = ctx.getDocById(docId);
    if (doc) {
      doc.position = 0;
      delete doc.cfi;
      ctx.saveLibrary();

      // 19H: Enqueue reset-progress as a first-class sync operation
      // A reset with higher revision always beats furthest-ahead on merge
      const syncEngine = require("../sync-engine");
      const syncQueue = require("../sync-queue");
      const syncStatus = syncEngine.getSyncStatus();
      const revision = syncStatus.revision || 0;
      syncQueue.enqueue("reset-progress", { docId, value: 0, revision }).catch(err => console.error("[sync-queue] reset-progress enqueue failed:", err.message));
    }
  });

  ipcMain.handle("toggle-favorite", (_, docId) => {
    const doc = ctx.getDocById(docId);
    if (doc) {
      doc.favorite = !doc.favorite;
      ctx.saveLibrary();
      return doc.favorite;
    }
    return false;
  });

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

  ipcMain.handle("snooze-doc", (_, docId, until) => {
    const library = ctx.getLibrary();
    const doc = library.find((d) => d.id === docId);
    if (doc) {
      doc.snoozedUntil = until;
      snoozedDocIds.add(docId);
      ctx.saveLibrary();
      ctx.broadcastLibrary();
    }
  });

  ipcMain.handle("unsnooze-doc", (_, docId) => {
    const library = ctx.getLibrary();
    const doc = library.find((d) => d.id === docId);
    if (doc) {
      doc.snoozedUntil = null;
      snoozedDocIds.delete(docId);
      ctx.saveLibrary();
      ctx.broadcastLibrary();
    }
  });

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

  ipcMain.handle("open-reader-window", (_, docId) => {
    createReaderWindow(docId, ctx.getSettings(), ctx.isDev, ctx.readerWindows);
  });

  ipcMain.handle("mark-doc-completed", () => {
    const history = ctx.getHistory();
    history.docsCompleted = (history.docsCompleted || 0) + 1;
    ctx.saveHistory();
  });

  // Seed the index from persisted library so docs snoozed in a prior session
  // are covered before the first IPC snooze/unsnooze call arrives.
  for (const doc of ctx.getLibrary()) {
    if (doc.snoozedUntil) snoozedDocIds.add(doc.id);
  }

  // Check for snoozed docs that should reappear.
  // Only iterates snoozedDocIds (O(snoozed)) instead of the full library.
  function checkSnoozedDocs() {
    if (snoozedDocIds.size === 0) return;

    const now = Date.now();
    let changed = false;
    const expired = [];

    for (const docId of snoozedDocIds) {
      const doc = ctx.getDocById(docId);
      if (!doc || !doc.snoozedUntil) {
        // Stale entry — doc was deleted or manually cleared outside IPC
        expired.push(docId);
        continue;
      }
      if (doc.snoozedUntil <= now) {
        doc.snoozedUntil = null;
        expired.push(docId);
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

    for (const docId of expired) snoozedDocIds.delete(docId);

    if (changed) {
      ctx.saveLibrary();
      ctx.broadcastLibrary();
    }
  }

  // Check snoozed docs on startup and every 60 seconds
  checkSnoozedDocs();
  setInterval(checkSnoozedDocs, SNOOZE_CHECK_INTERVAL_MS);
}

module.exports = { register };
