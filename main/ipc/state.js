"use strict";
// main/ipc/state.js — App state, settings, platform, login-item handlers

const { ipcMain } = require("electron");
const { getSystemTheme, updateWindowTheme } = require("../window-manager");
const {
  MAX_RECENT_FOLDERS,
} = require("../constants");
const fsPromises = require("fs/promises");

function register(ctx) {
  ipcMain.handle("get-state", () => ({
    settings: ctx.getSettings(),
    library: ctx.getLibrary().filter((d) => !d.deleted),
  }));

  ipcMain.handle("get-platform", () => process.platform);
  ipcMain.handle("get-system-theme", () => getSystemTheme());

  ipcMain.handle("save-settings", (_, newSettings) => {
    const settings = ctx.getSettings();
    Object.assign(settings, newSettings);
    ctx.saveSettings();
    if (newSettings.theme !== undefined) updateWindowTheme(ctx.getMainWindow(), settings);

    // Enqueue update-settings for sync
    const syncEngine = require("../sync-engine");
    const syncQueue = require("../sync-queue");
    const syncStatus = syncEngine.getSyncStatus();
    const revision = syncStatus.revision || 0;
    syncQueue.enqueue("update-settings", { revision }).catch(() => {});
  });

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

  ipcMain.handle("select-folder", async () => {
    const { dialog } = require("electron");
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
}

module.exports = { register };
