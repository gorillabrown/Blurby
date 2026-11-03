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

// The fields a renderer save or the Edit form may set. Each edit stamps its field in the record's editedAt map, and
// cloud sync's merge takes each field from the side with the later stamp (LIBRARY-WRITE-RACE-2). Main never writes the
// doc-level modified for these edits: for a folder book it is the source file's mtime.
const EDITED_FIELDS = ["title", "author", "unread", "seenAt", "tags", "collection"];

function sameValue(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => v === b[i]);
  return a === b;
}

/** Write one edited field and stamp it, only when the value changes. @returns {boolean} true when written */
function setEditedField(doc, key, value, now) {
  if (sameValue(doc[key], value)) return false;
  doc[key] = value;
  doc.editedAt = { ...(doc.editedAt || {}), [key]: now };
  return true;
}

/**
 * After the record-level pick, take each edited field from the side with the later editedAt stamp. A stamped edit
 * beats an unstamped one; on a tie the winner's value stays. A field the later side lacks is removed.
 */
function mergeEditedFields(merged, local, cloud) {
  for (const key of EDITED_FIELDS) {
    const l = (local.editedAt && local.editedAt[key]) || 0;
    const c = (cloud.editedAt && cloud.editedAt[key]) || 0;
    if (!l && !c) continue;
    if (l !== c) {
      const later = l > c ? local : cloud;
      if (key in later) merged[key] = later[key];
      else delete merged[key];
    }
    merged.editedAt = { ...(merged.editedAt || {}), [key]: Math.max(l, c) };
  }
}

module.exports = { writeConversionResult, EDITED_FIELDS, sameValue, setEditedField, mergeEditedFields };
