// main/library-write.js — Write a conversion result to the live library record (LIBRARY-WRITE-RACE-1).
// A converter holds a record across an await; by the time it finishes, save-library may have replaced the object,
// or delete-doc may have tombstoned or removed it. Writing to the caller's object would be lost or would resurrect
// the record, so the result goes to whatever record the library holds for that id now, or nowhere.
"use strict";

const fsPromises = require("fs/promises");

async function logToFile(message, errorLogPath) {
  try {
    const timestamp = new Date().toISOString();
    await fsPromises.appendFile(errorLogPath, `[${timestamp}] ${message}\n`, "utf-8");
  } catch { /* Intentional: error logging should never crash the app */ }
}

/**
 * Write `fields` to the library's live record for `docId`. A field whose value is `undefined` is removed.
 * If the record is gone or deleted, nothing is written and the converted file is removed so it is not orphaned.
 * The caller saves and broadcasts.
 * @returns {Promise<boolean>} true when the live record was written
 */
async function writeConversionResult(ctx, docId, fields, convertedPath) {
  const live = ctx.getLibrary().find((d) => d.id === docId);
  if (!live || live.deleted) {
    try {
      await fsPromises.unlink(convertedPath);
    } catch (err) {
      await logToFile(`converted file for removed doc "${docId}" not deleted (${convertedPath}): ${err.message}`, ctx.getErrorLogPath());
    }
    return false;
  }
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) delete live[key];
    else live[key] = value;
  }
  return true;
}

module.exports = { writeConversionResult };
