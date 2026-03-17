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
});
