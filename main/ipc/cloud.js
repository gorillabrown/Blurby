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
      console.error("[cloud] Sign-in failed:", err.message);
      const isNetwork = err.message && (
        err.message.includes("ENOTFOUND") || err.message.includes("ECONNREFUSED") ||
        err.message.includes("ETIMEDOUT") || err.message.includes("network") ||
        err.message.includes("fetch") || err.message.includes("offline")
      );
      const isCancelled = err.message && (
        err.message.includes("cancel") || err.message.includes("Cancel") ||
        err.message.includes("user_cancel") || err.message.includes("interaction_required")
      );
      const userMessage = isCancelled
        ? "Sign-in was cancelled."
        : isNetwork
          ? "Could not reach the sign-in server — check your internet connection."
          : "Sign-in failed — please try again.";
      return { error: userMessage };
    }
  });

  ipcMain.handle("cloud-sign-out", async (_, provider) => {
    try {
      await auth.signOut(provider);
      syncEngine.stopAutoSync();
      return { success: true };
    } catch (err) {
      console.error("[cloud] Sign-out failed:", err.message);
      return { error: "Sign-out failed — please try again." };
    }
  });

  ipcMain.handle("cloud-get-auth-state", () => {
    return auth.getAuthState();
  });

  ipcMain.handle("cloud-sync-now", async () => {
    try {
      return await syncEngine.startSync();
    } catch (err) {
      console.error("[cloud] Sync failed:", err.message);
      return { status: "error", error: "Sync failed — please try again later." };
    }
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
