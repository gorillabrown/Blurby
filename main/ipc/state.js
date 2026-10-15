"use strict";
// main/ipc/state.js — App state, settings, platform, login-item handlers

const { ipcMain } = require("electron");
const { getSystemTheme, updateWindowTheme } = require("../window-manager");
const {
  MAX_RECENT_FOLDERS,
} = require("../constants");
const { pickUserSettings } = require("../migrations");
const fsPromises = require("fs/promises");

let saveSettingsTimeout = null;
let flushSettingsSave = null; // the pending debounced write and sync enqueue, until its timer fires or quit flushes it

function register(ctx) {
  ipcMain.handle("get-state", () => {
    const settings = ctx.getSettings();
    return {
      // A copy: the real user settings plus the folder keys the library view shows; never an _-prefixed secret
      // such as _wsPairingToken, or schemaVersion, which the renderer does not read (GET-STATE-SECRET-1).
      settings: { ...pickUserSettings(settings), sourceFolder: settings.sourceFolder, recentFolders: settings.recentFolders },
      library: ctx.getLibrary().filter((d) => !d.deleted),
    };
  });

  ipcMain.handle("get-platform", () => process.platform);
  ipcMain.handle("get-system-theme", () => getSystemTheme());

  ipcMain.handle("save-settings", (_, newSettings) => {
    const settings = ctx.getSettings();
    // Only real user settings: never the folder or its recent list (select-folder and switch-folder set them,
    // IPC-PATH-TRUST-1), schemaVersion, an _-prefixed secret or a prototype key (SETTINGS-KEY-TRUST-1).
    const safe = pickUserSettings(newSettings);
    // Update in-memory state immediately so all readers see the new value
    Object.assign(settings, safe);
    if (safe.theme !== undefined) updateWindowTheme(ctx.getMainWindow(), settings);

    // Debounce the file write and sync enqueue — rapid toggles/sliders batch into one write
    clearTimeout(saveSettingsTimeout);
    flushSettingsSave = async () => {
      clearTimeout(saveSettingsTimeout);
      saveSettingsTimeout = null;
      flushSettingsSave = null;
      const saved = ctx.saveSettings();
      // Enqueue update-settings for sync
      const syncEngine = require("../sync-engine");
      const syncQueue = require("../sync-queue");
      const revision = syncEngine.getSyncStatus().revision || 0;
      await Promise.all([saved, syncQueue.enqueue("update-settings", { revision }).catch(err => console.error("[sync-queue] update-settings enqueue failed:", err.message))]);
    };
    saveSettingsTimeout = setTimeout(() => { flushSettingsSave(); }, 500);
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
    // Only a folder main already listed; a new folder comes through select-folder's dialog (IPC-PATH-TRUST-1).
    if (typeof folder !== "string" || !(settings.recentFolders || []).includes(folder)) {
      return { error: "That folder is not in your recent folders. Use Browse for folder to choose it." };
    }
    try { await fsPromises.access(folder); } catch { return { error: "Folder no longer exists." }; }
    settings.sourceFolder = folder;
    settings.recentFolders = [folder, ...settings.recentFolders.filter((f) => f !== folder)].slice(0, MAX_RECENT_FOLDERS);
    ctx.saveSettings();
    await ctx.syncLibraryWithFolder();
    ctx.startWatcher();
    return { folder };
  });
}

/** Quit flush: run the pending debounced settings write and sync enqueue now; resolves at once when none is pending. */
function flushPendingSettingsSave() { return flushSettingsSave ? flushSettingsSave() : Promise.resolve(); }

module.exports = { register, flushPendingSettingsSave };
