// main/migrations.js — Schema migration framework for settings.json and library.json
// CommonJS only — Electron main process

const CURRENT_SETTINGS_SCHEMA = 5;
const CURRENT_LIBRARY_SCHEMA = 3;

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
];

const libraryMigrations = [
  // v0 → v1
  (data) => {
    const docs = Array.isArray(data) ? data : (data.docs || []);
    for (const doc of docs) {
      if (!doc.wordCount && doc.content) {
        doc.wordCount = (doc.content || "").split(/\s+/).filter(Boolean).length;
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
