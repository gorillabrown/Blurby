import { describe, it, expect } from "vitest";

// Test the migration logic in isolation
// We replicate the migration functions here since they're in main.js (CommonJS)

const settingsMigrations = [
  (data) => {
    if (!data.folderName) data.folderName = "My reading list";
    if (!data.recentFolders) data.recentFolders = [];
    data.schemaVersion = 1;
    return data;
  },
  (data) => {
    if (!data.theme) data.theme = "dark";
    data.schemaVersion = 2;
    return data;
  },
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
];

const libraryMigrations = [
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

describe("settings migrations", () => {
  it("migrates v0 to v1: adds folderName and recentFolders", () => {
    const v0 = { wpm: 300, sourceFolder: "/some/path" };
    const result = runMigrations(v0, settingsMigrations, 1);
    expect(result.schemaVersion).toBe(1);
    expect(result.folderName).toBe("My reading list");
    expect(result.recentFolders).toEqual([]);
    expect(result.wpm).toBe(300);
    expect(result.sourceFolder).toBe("/some/path");
  });

  it("preserves existing folderName during migration", () => {
    const v0 = { wpm: 250, folderName: "My Books" };
    const result = runMigrations(v0, settingsMigrations, 1);
    expect(result.folderName).toBe("My Books");
  });

  it("no-ops when already at current version", () => {
    const v1 = { schemaVersion: 1, wpm: 300, folderName: "Test", recentFolders: [] };
    const result = runMigrations(v1, settingsMigrations, 1);
    expect(result).toEqual(v1);
  });

  it("handles missing/corrupt schemaVersion gracefully (treats as v0)", () => {
    const corrupt = { wpm: 200 };
    const result = runMigrations(corrupt, settingsMigrations, 2);
    expect(result.schemaVersion).toBe(2);
    expect(result.theme).toBe("dark");
  });

  it("migrates v1 to v2: adds theme", () => {
    const v1 = { schemaVersion: 1, wpm: 300, folderName: "Test", recentFolders: [] };
    const result = runMigrations(v1, settingsMigrations, 2);
    expect(result.schemaVersion).toBe(2);
    expect(result.theme).toBe("dark");
    expect(result.wpm).toBe(300);
  });

  it("migrates v0 all the way to v2", () => {
    const v0 = { wpm: 250 };
    const result = runMigrations(v0, settingsMigrations, 2);
    expect(result.schemaVersion).toBe(2);
    expect(result.folderName).toBe("My reading list");
    expect(result.recentFolders).toEqual([]);
    expect(result.theme).toBe("dark");
  });

  it("migrates v2 to v3: adds accentColor and fontFamily", () => {
    const v2 = { schemaVersion: 2, wpm: 300, folderName: "Test", recentFolders: [], theme: "dark" };
    const result = runMigrations(v2, settingsMigrations, 3);
    expect(result.schemaVersion).toBe(3);
    expect(result.accentColor).toBe(null);
    expect(result.fontFamily).toBe(null);
    expect(result.wpm).toBe(300);
  });

  it("migrates v0 all the way to v3", () => {
    const v0 = { wpm: 250 };
    const result = runMigrations(v0, settingsMigrations, 3);
    expect(result.schemaVersion).toBe(3);
    expect(result.folderName).toBe("My reading list");
    expect(result.theme).toBe("dark");
    expect(result.accentColor).toBe(null);
    expect(result.fontFamily).toBe(null);
  });

  it("migrates v3 to v4: renames fontSize→focusTextSize, adds new fields and pause durations", () => {
    const v3 = {
      schemaVersion: 3,
      wpm: 300,
      fontSize: 120,
      folderName: "Test",
      recentFolders: [],
      theme: "dark",
      accentColor: null,
      fontFamily: null,
    };
    const result = runMigrations(v3, settingsMigrations, 4);
    expect(result.schemaVersion).toBe(4);
    // fontSize renamed to focusTextSize
    expect(result.focusTextSize).toBe(120);
    expect(result.fontSize).toBeUndefined();
    // new fields with defaults
    expect(result.compactMode).toBe(false);
    expect(result.readingMode).toBe("focus");
    expect(result.focusMarks).toBe(true);
    expect(result.readingRuler).toBe(false);
    expect(result.focusSpan).toBe(0.4);
    expect(result.flowTextSize).toBe(100);
    expect(result.rhythmPauses).toEqual({
      commas: true,
      sentences: true,
      paragraphs: true,
      numbers: false,
      longerWords: false,
    });
    expect(result.layoutSpacing).toEqual({ line: 1.5, character: 0, word: 0 });
    // pause duration settings
    expect(result.initialPauseMs).toBe(3000);
    expect(result.punctuationPauseMs).toBe(1000);
    // preserved fields
    expect(result.wpm).toBe(300);
    expect(result.accentColor).toBe(null);
    expect(result.theme).toBe("dark");
  });

  it("migrates v0 all the way to v4", () => {
    const v0 = { wpm: 250, fontSize: 110 };
    const result = runMigrations(v0, settingsMigrations, 4);
    expect(result.schemaVersion).toBe(4);
    expect(result.focusTextSize).toBe(110);
    expect(result.fontSize).toBeUndefined();
    expect(result.readingMode).toBe("focus");
    expect(result.initialPauseMs).toBe(3000);
    expect(result.punctuationPauseMs).toBe(1000);
  });
});

describe("library migrations", () => {
  it("migrates raw array (v0) to v1 with docs wrapper and wordCount", () => {
    const v0 = [
      { id: "1", title: "Test", content: "hello world foo", source: "manual" },
      { id: "2", title: "File", content: "one two three four", filepath: "/f.txt", source: "folder" },
    ];
    const result = runMigrations(v0, libraryMigrations, 1);
    expect(result.schemaVersion).toBe(1);
    expect(result.docs).toHaveLength(2);
    expect(result.docs[0].wordCount).toBe(3);
    expect(result.docs[0].content).toBe("hello world foo"); // manual keeps content
    expect(result.docs[1].wordCount).toBe(4);
    expect(result.docs[1].content).toBeUndefined(); // folder content removed
  });

  it("handles empty library", () => {
    const result = runMigrations([], libraryMigrations, 1);
    expect(result.schemaVersion).toBe(1);
    expect(result.docs).toEqual([]);
  });

  it("no-ops when already at current version", () => {
    const v1 = { schemaVersion: 1, docs: [{ id: "1", title: "Test", wordCount: 5 }] };
    const result = runMigrations(v1, libraryMigrations, 1);
    expect(result).toEqual(v1);
  });

  it("migrates v1 to v2: adds lastReadAt to all docs", () => {
    const v1 = {
      schemaVersion: 1,
      docs: [
        { id: "1", title: "Read book", position: 50, modified: 1700000000000, wordCount: 100, source: "manual" },
        { id: "2", title: "Unread book", position: 0, modified: 1700000001000, wordCount: 200, source: "manual" },
        { id: "3", title: "No modified", position: 10, wordCount: 50, source: "folder" },
      ],
    };
    const result = runMigrations(v1, libraryMigrations, 2);
    expect(result.schemaVersion).toBe(2);
    // doc with position > 0 and modified → lastReadAt = modified
    expect(result.docs[0].lastReadAt).toBe(1700000000000);
    // doc with position === 0 → lastReadAt = null
    expect(result.docs[1].lastReadAt).toBe(null);
    // doc with position > 0 but no modified → lastReadAt = null
    expect(result.docs[2].lastReadAt).toBe(null);
  });

  it("migrates v0 all the way to v2", () => {
    const v0 = [
      { id: "1", title: "Test", content: "hello world", source: "manual", position: 5, modified: 1700000000000 },
    ];
    const result = runMigrations(v0, libraryMigrations, 2);
    expect(result.schemaVersion).toBe(2);
    expect(result.docs[0].wordCount).toBe(2);
    expect(result.docs[0].lastReadAt).toBe(1700000000000);
  });
});
