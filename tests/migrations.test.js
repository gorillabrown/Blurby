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
  // v4 → v5: add viewMode setting
  (data) => {
    if (data.viewMode === undefined) data.viewMode = "list";
    data.schemaVersion = 5;
    return data;
  },
];

const libraryMigrations = [
  (data) => {
    const docs = Array.isArray(data) ? data : (data.docs || []);
    for (const doc of docs) {
      if (!doc.wordCount && doc.content) {
        const text = doc.content || "";
        let wc = 0, inW = false;
        for (let i = 0; i < text.length; i++) { const c = text.charCodeAt(i); if (c > 32 && !inW) wc++; inW = c > 32; }
        doc.wordCount = wc;
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

  it("migrates v4 to v5: adds viewMode with default 'list'", () => {
    const v4 = {
      schemaVersion: 4,
      wpm: 300,
      folderName: "Test",
      recentFolders: [],
      theme: "dark",
      accentColor: null,
      fontFamily: null,
      focusTextSize: 100,
      compactMode: false,
      readingMode: "focus",
      focusMarks: true,
      readingRuler: false,
      focusSpan: 0.4,
      flowTextSize: 100,
      rhythmPauses: { commas: true, sentences: true, paragraphs: true, numbers: false, longerWords: false },
      layoutSpacing: { line: 1.5, character: 0, word: 0 },
      initialPauseMs: 3000,
      punctuationPauseMs: 1000,
    };
    const result = runMigrations(v4, settingsMigrations, 5);
    expect(result.schemaVersion).toBe(5);
    expect(result.viewMode).toBe("list");
    // preserved fields
    expect(result.wpm).toBe(300);
    expect(result.readingMode).toBe("focus");
  });

  it("migrates v0 all the way to v5", () => {
    const v0 = { wpm: 250 };
    const result = runMigrations(v0, settingsMigrations, 5);
    expect(result.schemaVersion).toBe(5);
    expect(result.viewMode).toBe("list");
    expect(result.folderName).toBe("My reading list");
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

  it("migrates v2 to v3: adds author and coverPath to all docs", () => {
    const v2 = {
      schemaVersion: 2,
      docs: [
        { id: "1", title: "Book One", wordCount: 100, position: 0, source: "manual", lastReadAt: null },
        { id: "2", title: "Book Two", wordCount: 200, position: 50, source: "folder", lastReadAt: 1700000000000 },
      ],
    };
    const result = runMigrations(v2, libraryMigrations, 3);
    expect(result.schemaVersion).toBe(3);
    expect(result.docs[0].author).toBe(null);
    expect(result.docs[0].coverPath).toBe(null);
    expect(result.docs[1].author).toBe(null);
    expect(result.docs[1].coverPath).toBe(null);
    // preserved fields
    expect(result.docs[0].title).toBe("Book One");
    expect(result.docs[1].lastReadAt).toBe(1700000000000);
  });

  it("migrates v0 all the way to v3", () => {
    const v0 = [
      { id: "1", title: "Test", content: "hello world foo", source: "manual", position: 5, modified: 1700000000000 },
    ];
    const result = runMigrations(v0, libraryMigrations, 3);
    expect(result.schemaVersion).toBe(3);
    expect(result.docs[0].wordCount).toBe(3);
    expect(result.docs[0].lastReadAt).toBe(1700000000000);
    expect(result.docs[0].author).toBe(null);
    expect(result.docs[0].coverPath).toBe(null);
  });
});

// ── Sprint 19K: library v3 → v4 (provenance + sync hardening fields) ──────

// We replicate the v3→v4 migration inline, exactly as written in migrations.js,
// so these tests remain self-contained and match the established project pattern.
const libraryMigrationV3ToV4 = (data) => {
  const docs = Array.isArray(data) ? data : (data.docs || []);
  for (const doc of docs) {
    if (doc.sourceDomain === undefined) {
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
    if (doc.deleted === undefined) doc.deleted = false;
    if (doc.syncContent === undefined) doc.syncContent = doc.source !== "folder";
    if (doc.contentHash === undefined) doc.contentHash = null;
  }
  return { schemaVersion: 4, docs };
};

// We replicate the v4→v5 migration inline for the same reason.
const libraryMigrationV4ToV5 = (data) => {
  const docs = Array.isArray(data) ? data : (data.docs || []);
  for (const doc of docs) {
    if (doc.unread === undefined) doc.unread = doc.position === 0 && !doc.lastReadAt;
    if (doc.snoozedUntil === undefined) doc.snoozedUntil = null;
    if (doc.tags === undefined) doc.tags = [];
    if (doc.collection === undefined) doc.collection = null;
  }
  return { schemaVersion: 5, docs };
};

describe("library migration v3 → v4: sourceDomain backfilled from sourceUrl", () => {
  it("backfills sourceDomain from sourceUrl hostname for URL-imported docs", () => {
    const v3 = {
      schemaVersion: 3,
      docs: [
        { id: "1", title: "Article", source: "url", sourceUrl: "https://www.example.com/article", author: null, coverPath: null },
      ],
    };
    const result = libraryMigrationV3ToV4(v3);
    expect(result.schemaVersion).toBe(4);
    expect(result.docs[0].sourceDomain).toBe("example.com");
  });

  it("strips www. from the backfilled sourceDomain", () => {
    const v3 = {
      schemaVersion: 3,
      docs: [
        { id: "1", title: "Article", source: "url", sourceUrl: "https://www.bbc.co.uk/news/story", author: null, coverPath: null },
      ],
    };
    const result = libraryMigrationV3ToV4(v3);
    expect(result.docs[0].sourceDomain).toBe("bbc.co.uk");
  });

  it("sets sourceDomain to null for non-URL docs", () => {
    const v3 = {
      schemaVersion: 3,
      docs: [
        { id: "2", title: "Book", source: "file", author: null, coverPath: null },
      ],
    };
    const result = libraryMigrationV3ToV4(v3);
    expect(result.docs[0].sourceDomain).toBeNull();
  });

  it("does not overwrite an existing sourceDomain", () => {
    const v3 = {
      schemaVersion: 3,
      docs: [
        { id: "3", title: "Existing", source: "url", sourceUrl: "https://example.com/", sourceDomain: "Custom Domain", author: null, coverPath: null },
      ],
    };
    const result = libraryMigrationV3ToV4(v3);
    expect(result.docs[0].sourceDomain).toBe("Custom Domain");
  });
});

describe("library migration v3 → v4: publishedDate defaults to null", () => {
  it("adds publishedDate: null when missing", () => {
    const v3 = {
      schemaVersion: 3,
      docs: [{ id: "1", title: "Doc", source: "file", author: null, coverPath: null }],
    };
    const result = libraryMigrationV3ToV4(v3);
    expect(result.docs[0].publishedDate).toBeNull();
  });

  it("does not overwrite an existing publishedDate", () => {
    const v3 = {
      schemaVersion: 3,
      docs: [{ id: "1", title: "Doc", source: "url", author: null, coverPath: null, publishedDate: "2025-01-01T00:00:00.000Z" }],
    };
    const result = libraryMigrationV3ToV4(v3);
    expect(result.docs[0].publishedDate).toBe("2025-01-01T00:00:00.000Z");
  });
});

describe("library migration v3 → v4: authorFull copied from author", () => {
  it("copies author to authorFull when author is set", () => {
    const v3 = {
      schemaVersion: 3,
      docs: [{ id: "1", title: "Doc", source: "file", author: "Jane Smith", coverPath: null }],
    };
    const result = libraryMigrationV3ToV4(v3);
    expect(result.docs[0].authorFull).toBe("Jane Smith");
  });

  it("sets authorFull to null when author is null", () => {
    const v3 = {
      schemaVersion: 3,
      docs: [{ id: "1", title: "Doc", source: "file", author: null, coverPath: null }],
    };
    const result = libraryMigrationV3ToV4(v3);
    expect(result.docs[0].authorFull).toBeNull();
  });

  it("does not overwrite an existing authorFull", () => {
    const v3 = {
      schemaVersion: 3,
      docs: [{ id: "1", title: "Doc", source: "file", author: "Jane Smith", authorFull: "Jane Marie Smith", coverPath: null }],
    };
    const result = libraryMigrationV3ToV4(v3);
    expect(result.docs[0].authorFull).toBe("Jane Marie Smith");
  });
});

// ── Sprint 20T: library v4 → v5 (keyboard-first UX fields) ───────────────

describe("library migration v4 → v5: unread defaults based on position/lastReadAt", () => {
  it("sets unread=true when position===0 and lastReadAt is null", () => {
    const v4 = {
      schemaVersion: 4,
      docs: [{ id: "1", title: "New Doc", source: "file", position: 0, lastReadAt: null }],
    };
    const result = libraryMigrationV4ToV5(v4);
    expect(result.docs[0].unread).toBe(true);
  });

  it("sets unread=false when position > 0", () => {
    const v4 = {
      schemaVersion: 4,
      docs: [{ id: "1", title: "In Progress", source: "file", position: 50, lastReadAt: 1700000000000 }],
    };
    const result = libraryMigrationV4ToV5(v4);
    expect(result.docs[0].unread).toBe(false);
  });

  it("sets unread=false when lastReadAt is set even with position===0", () => {
    const v4 = {
      schemaVersion: 4,
      docs: [{ id: "1", title: "Opened Once", source: "file", position: 0, lastReadAt: 1700000000000 }],
    };
    const result = libraryMigrationV4ToV5(v4);
    expect(result.docs[0].unread).toBe(false);
  });

  it("does not overwrite an existing unread field", () => {
    const v4 = {
      schemaVersion: 4,
      docs: [{ id: "1", title: "Doc", source: "file", position: 0, lastReadAt: null, unread: false }],
    };
    const result = libraryMigrationV4ToV5(v4);
    // Already set to false — should remain false
    expect(result.docs[0].unread).toBe(false);
  });
});

describe("library migration v4 → v5: snoozedUntil defaults to null", () => {
  it("adds snoozedUntil: null when missing", () => {
    const v4 = {
      schemaVersion: 4,
      docs: [{ id: "1", title: "Doc", source: "file", position: 0, lastReadAt: null }],
    };
    const result = libraryMigrationV4ToV5(v4);
    expect(result.docs[0].snoozedUntil).toBeNull();
  });

  it("does not overwrite an existing snoozedUntil", () => {
    const futureTs = Date.now() + 86400000;
    const v4 = {
      schemaVersion: 4,
      docs: [{ id: "1", title: "Doc", source: "file", position: 0, lastReadAt: null, snoozedUntil: futureTs }],
    };
    const result = libraryMigrationV4ToV5(v4);
    expect(result.docs[0].snoozedUntil).toBe(futureTs);
  });
});

describe("library migration v4 → v5: tags defaults to empty array", () => {
  it("adds tags: [] when missing", () => {
    const v4 = {
      schemaVersion: 4,
      docs: [{ id: "1", title: "Doc", source: "file", position: 0, lastReadAt: null }],
    };
    const result = libraryMigrationV4ToV5(v4);
    expect(result.docs[0].tags).toEqual([]);
  });

  it("does not overwrite existing tags", () => {
    const v4 = {
      schemaVersion: 4,
      docs: [{ id: "1", title: "Doc", source: "file", position: 0, lastReadAt: null, tags: ["work", "read-later"] }],
    };
    const result = libraryMigrationV4ToV5(v4);
    expect(result.docs[0].tags).toEqual(["work", "read-later"]);
  });
});

describe("library migration v4 → v5: collection defaults to null", () => {
  it("adds collection: null when missing", () => {
    const v4 = {
      schemaVersion: 4,
      docs: [{ id: "1", title: "Doc", source: "file", position: 0, lastReadAt: null }],
    };
    const result = libraryMigrationV4ToV5(v4);
    expect(result.docs[0].collection).toBeNull();
  });

  it("does not overwrite existing collection", () => {
    const v4 = {
      schemaVersion: 4,
      docs: [{ id: "1", title: "Doc", source: "file", position: 0, lastReadAt: null, collection: "To Read" }],
    };
    const result = libraryMigrationV4ToV5(v4);
    expect(result.docs[0].collection).toBe("To Read");
  });
});

describe("library migration v3 → v5 full chain", () => {
  it("migrates all the way from v3 to v5 applying both migrations", () => {
    const v3 = {
      schemaVersion: 3,
      docs: [
        {
          id: "1",
          title: "Long Article",
          source: "url",
          sourceUrl: "https://www.theguardian.com/article",
          author: "Alice Brown",
          coverPath: null,
          position: 0,
          lastReadAt: null,
        },
      ],
    };
    const migrations = [
      null,           // v0→v1 (skip — not needed in chain)
      null,           // v1→v2
      null,           // v2→v3
      libraryMigrationV3ToV4,
      libraryMigrationV4ToV5,
    ];

    // Run v3→v4 then v4→v5 directly
    const v4 = libraryMigrationV3ToV4(v3);
    const v5 = libraryMigrationV4ToV5(v4);

    expect(v5.schemaVersion).toBe(5);
    // v3→v4 provenance fields
    expect(v5.docs[0].sourceDomain).toBe("theguardian.com");
    expect(v5.docs[0].publishedDate).toBeNull();
    expect(v5.docs[0].authorFull).toBe("Alice Brown");
    // v4→v5 keyboard-first fields
    expect(v5.docs[0].unread).toBe(true);
    expect(v5.docs[0].snoozedUntil).toBeNull();
    expect(v5.docs[0].tags).toEqual([]);
    expect(v5.docs[0].collection).toBeNull();
  });
});
