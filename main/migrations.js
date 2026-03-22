// main/migrations.js — Schema migration framework for settings.json and library.json
// CommonJS only — Electron main process

const CURRENT_SETTINGS_SCHEMA = 7;
const CURRENT_LIBRARY_SCHEMA = 5;

/** Count words without creating intermediate arrays. */
function countWords(text) {
  if (!text) return 0;
  let count = 0, inWord = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    const isSpace = ch <= 32;
    if (!isSpace && !inWord) count++;
    inWord = !isSpace;
  }
  return count;
}

const settingsMigrations = [
  // v0 → v1
  (data) => {
    if (!data.folderName) data.folderName = "My reading list";
    if (!data.recentFolders) data.recentFolders = [];
    data.schemaVersion = 1;
    return data;
  },
  // v1 → v2: Add theme setting
  (data) => {
    if (!data.theme) data.theme = "dark";
    data.schemaVersion = 2;
    return data;
  },
  // v2 → v3: Add accentColor and fontFamily
  (data) => {
    if (!data.accentColor) data.accentColor = null;
    if (!data.fontFamily) data.fontFamily = null;
    data.schemaVersion = 3;
    return data;
  },
  // v3 → v4: rename fontSize→focusTextSize, add new reader settings, add pause durations
  (data) => {
    data.focusTextSize = data.fontSize !== undefined ? data.fontSize : 100;
    delete data.fontSize;
    if (data.compactMode === undefined) data.compactMode = false;
    if (data.readingMode === undefined) data.readingMode = "focus";
    if (data.focusMarks === undefined) data.focusMarks = true;
    if (data.readingRuler === undefined) data.readingRuler = false;
    if (data.focusSpan === undefined) data.focusSpan = 0.4;
    if (data.flowTextSize === undefined) data.flowTextSize = 100;
    if (data.rhythmPauses === undefined) {
      data.rhythmPauses = {
        commas: true,
        sentences: true,
        paragraphs: true,
        numbers: false,
        longerWords: false,
      };
    }
    if (data.layoutSpacing === undefined) {
      data.layoutSpacing = {
        line: 1.5,
        character: 0,
        word: 0,
      };
    }
    if (data.initialPauseMs == null) data.initialPauseMs = 3000;
    if (data.punctuationPauseMs == null) data.punctuationPauseMs = 1000;
    data.schemaVersion = 4;
    return data;
  },
  // v4 → v5: add viewMode setting
  (data) => {
    if (data.viewMode === undefined) data.viewMode = "list";
    data.schemaVersion = 5;
    return data;
  },
  // v5 → v6: Sprint 20U — default readingMode to "page" (three-mode reader)
  (data) => {
    data.readingMode = "page";
    data.schemaVersion = 6;
    return data;
  },
  // v6 → v7: Flow word span setting
  (data) => {
    if (data.flowWordSpan === undefined) data.flowWordSpan = 1;
    data.schemaVersion = 7;
    return data;
  },
];

const libraryMigrations = [
  // v0 → v1
  (data) => {
    const docs = Array.isArray(data) ? data : (data.docs || []);
    for (const doc of docs) {
      if (!doc.wordCount && doc.content) {
        doc.wordCount = countWords(doc.content);
      }
      if (doc.source === "folder" && doc.filepath) {
        delete doc.content;
      }
    }
    return { schemaVersion: 1, docs };
  },
  // v1 → v2: add lastReadAt to all docs
  (data) => {
    const docs = Array.isArray(data) ? data : (data.docs || []);
    for (const doc of docs) {
      if (doc.lastReadAt === undefined) {
        if (doc.position > 0 && doc.modified) {
          doc.lastReadAt = doc.modified;
        } else {
          doc.lastReadAt = null;
        }
      }
    }
    return { schemaVersion: 2, docs };
  },
  // v2 → v3: add author and coverPath to all docs
  (data) => {
    const docs = Array.isArray(data) ? data : (data.docs || []);
    for (const doc of docs) {
      if (doc.author === undefined) doc.author = null;
      if (doc.coverPath === undefined) doc.coverPath = null;
    }
    return { schemaVersion: 3, docs };
  },
  // v3 → v4: Sprint 19 — add provenance + sync fields
  (data) => {
    const docs = Array.isArray(data) ? data : (data.docs || []);
    for (const doc of docs) {
      // Provenance fields
      if (doc.sourceDomain === undefined) {
        // Backfill sourceDomain from sourceUrl hostname for URL-imported docs
        if (doc.sourceUrl) {
          try {
            const hostname = new URL(doc.sourceUrl).hostname.replace(/^www\./, "");
            doc.sourceDomain = hostname;
          } catch { doc.sourceDomain = null; }
        } else {
          doc.sourceDomain = null;
        }
      }
      if (doc.publishedDate === undefined) doc.publishedDate = null;
      if (doc.authorFull === undefined) doc.authorFull = doc.author || null;
      // Sync hardening fields
      if (doc.deleted === undefined) doc.deleted = false;
      if (doc.syncContent === undefined) doc.syncContent = doc.source !== "folder";
      if (doc.contentHash === undefined) doc.contentHash = null;
    }
    return { schemaVersion: 4, docs };
  },
  // v4 → v5: Sprint 20 — add keyboard-first UX fields
  (data) => {
    const docs = Array.isArray(data) ? data : (data.docs || []);
    for (const doc of docs) {
      if (doc.unread === undefined) doc.unread = doc.position === 0 && !doc.lastReadAt;
      if (doc.snoozedUntil === undefined) doc.snoozedUntil = null;
      if (doc.tags === undefined) doc.tags = [];
      if (doc.collection === undefined) doc.collection = null;
    }
    return { schemaVersion: 5, docs };
  },
];

function runMigrations(data, migrations, currentVersion) {
  let version = data?.schemaVersion || 0;
  let migrated = data;
  while (version < currentVersion) {
    const migrateFn = migrations[version];
    if (!migrateFn) break;
    migrated = migrateFn(migrated);
    version = migrated.schemaVersion || version + 1;
  }
  return migrated;
}

module.exports = {
  CURRENT_SETTINGS_SCHEMA,
  CURRENT_LIBRARY_SCHEMA,
  settingsMigrations,
  libraryMigrations,
  runMigrations,
};
