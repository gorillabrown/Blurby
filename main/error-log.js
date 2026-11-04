"use strict";
// main/error-log.js — the one error.log appender (ERROR-LOG-CAP-1). An append that would take the file past
// ERROR_LOG_MAX_BYTES first renames it to error.log.1 (replacing any older one), so one rotated file is kept.

const fsPromises = require("fs/promises");
const { ERROR_LOG_MAX_BYTES } = require("./constants");

async function logToFile(message, errorLogPath, maxBytes = ERROR_LOG_MAX_BYTES) {
  try {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${message}\n`;
    try {
      const { size } = await fsPromises.stat(errorLogPath);
      if (size > 0 && size + Buffer.byteLength(line, "utf-8") > maxBytes) {
        await fsPromises.rename(errorLogPath, `${errorLogPath}.1`);
      }
    } catch { /* No file yet, or the rename failed: append to what is there */ }
    await fsPromises.appendFile(errorLogPath, line, "utf-8");
  } catch { /* Intentional: error logging should never crash the app */ }
}

module.exports = { logToFile };
