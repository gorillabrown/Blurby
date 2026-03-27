"use strict";
// main/ipc/stats.js — Reading statistics, session logging, CSV export, reading log

const { ipcMain, dialog } = require("electron");
const path = require("path");
const fsPromises = require("fs/promises");
const { MAX_HISTORY_SESSIONS, MS_PER_DAY } = require("../constants");

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

function register(ctx) {
  ipcMain.handle("record-reading-session", (_, docTitle, wordsRead, durationMs, wpm) => {
    recordReadingSession(ctx.getHistory(), docTitle, wordsRead, durationMs, wpm, ctx.saveHistory);
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
        const templatePath = path.join(__dirname, "..", "..", "docs", "project", "Reading_Log_Blurby_Template.xlsx");
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
        const templatePath = path.join(__dirname, "..", "..", "docs", "project", "Reading_Log_Blurby_Template.xlsx");
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
}

module.exports = { register, recordReadingSession, getStats };
