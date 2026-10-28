"use strict";
// main/ipc/bug-report.js — Bug report capture: screenshot + state snapshot

const { ipcMain } = require("electron");
const path = require("path");
const fsPromises = require("fs/promises");

function formatTimestamp() {
  return new Date().toISOString().replace(/:/g, "-").replace(/\.\d{3}Z$/, "Z");
}

function register(ctx) {
  // In dev mode, write bug reports into the project repo for easy access.
  // In production (packaged), fall back to the standard AppData location.
  const bugReportsDir = ctx.isDev
    ? path.join(ctx.getProjectRoot(), "docs", "bug-reports")
    : path.join(ctx.getDataPath(), "bug-reports");

  ipcMain.handle("capture-bug-screenshot", async () => {
    const win = ctx.getMainWindow();
    if (!win) return { error: "No main window available" };

    await fsPromises.mkdir(bugReportsDir, { recursive: true });

    const timestamp = formatTimestamp();
    const filename = `bug-${timestamp}.png`;
    const filepath = path.join(bugReportsDir, filename);

    const image = await win.webContents.capturePage();
    await fsPromises.writeFile(filepath, image.toPNG());

    return { filename, filepath };
  });

  ipcMain.handle("save-bug-report", async (_, data) => {
    await fsPromises.mkdir(bugReportsDir, { recursive: true });

    const { description, severity, appState, screenshotFile, timestamp } = data;
    const ts = timestamp || formatTimestamp();
    const jsonFilename = screenshotFile
      ? screenshotFile.replace(/\.png$/, ".json")
      : `bug-${ts}.json`;
    const filepath = path.join(bugReportsDir, jsonFilename);

    const report = {
      timestamp: ts,
      description,
      severity,
      screenshotFile: screenshotFile || null,
      appState: appState || {},
    };

    await fsPromises.writeFile(filepath, JSON.stringify(report, null, 2), "utf-8");
    return { ok: true, filename: jsonFilename };
  });
}

module.exports = { register };
