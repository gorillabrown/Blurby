"use strict";
// main/ipc/cloud.js — Cloud sync and authentication handlers

const { ipcMain } = require("electron");

function register(ctx) {
  const auth = require("../auth");
  const syncEngine = require("../sync-engine");

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
}

module.exports = { register };
