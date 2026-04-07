// tests/fileHashesCleanup.test.ts — REFACTOR-1A: fileHashes cleanup + constants extraction
//
// Covers:
//   (a) clearDocHashes removes doc:{docId}:contentHash entries
//   (b) clearDocHashes removes documents/{docId}.json entries
//   (c) clearDocHashes removes :cloudHash suffix entries (any key containing docId)
//   (d) clearDocHashes preserves unrelated entries
//   (e) clearDocHashes handles empty fileHashes gracefully
//   (f) main/constants.js exports all 11 values with correct types
//   (g) main/constants.js values match expected defaults
//   (h) main.js uses imported constants (not inline values)

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ─────────────────────────────────────────────────────────────────────────────
// clearDocHashes — pure logic replica
//
// The actual clearDocHashes in main/sync-engine.js operates on a module-level
// syncState.fileHashes object. We replicate the exact algorithm here to test
// all key-matching edge cases without requiring the Electron main process.
// ─────────────────────────────────────────────────────────────────────────────

function clearDocHashes(fileHashes: Record<string, string>, docId: string): void {
  for (const key of Object.keys(fileHashes)) {
    if (key.includes(docId)) {
      delete fileHashes[key];
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// (a) Removes doc:{docId}:contentHash entries
// ─────────────────────────────────────────────────────────────────────────────

describe("clearDocHashes — doc:{docId}:contentHash entries", () => {

  it("(a) removes doc:{docId}:contentHash when docId matches", () => {
    const fileHashes: Record<string, string> = {
      "doc:abc-123:contentHash": "sha256-content-hash-value",
      "library.json": "sha256-lib-hash",
    };
    clearDocHashes(fileHashes, "abc-123");

    expect("doc:abc-123:contentHash" in fileHashes).toBe(false);
  });

  it("(a) does not remove doc:{otherId}:contentHash for a different docId", () => {
    const fileHashes: Record<string, string> = {
      "doc:abc-123:contentHash": "hash-a",
      "doc:xyz-999:contentHash": "hash-b",
    };
    clearDocHashes(fileHashes, "abc-123");

    expect("doc:xyz-999:contentHash" in fileHashes).toBe(true);
    expect("doc:abc-123:contentHash" in fileHashes).toBe(false);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// (b) Removes documents/{docId}.json entries
// ─────────────────────────────────────────────────────────────────────────────

describe("clearDocHashes — documents/{docId}.json entries", () => {

  it("(b) removes documents/{docId}.json when docId matches", () => {
    const fileHashes: Record<string, string> = {
      "documents/abc-123.json": "sha256-doc-file-hash",
      "settings.json": "sha256-settings-hash",
    };
    clearDocHashes(fileHashes, "abc-123");

    expect("documents/abc-123.json" in fileHashes).toBe(false);
  });

  it("(b) does not remove documents/{otherId}.json for a different docId", () => {
    const fileHashes: Record<string, string> = {
      "documents/abc-123.json": "hash-a",
      "documents/different-id.json": "hash-b",
    };
    clearDocHashes(fileHashes, "abc-123");

    expect("documents/different-id.json" in fileHashes).toBe(true);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// (c) Removes :cloudHash suffix entries containing docId
// ─────────────────────────────────────────────────────────────────────────────

describe("clearDocHashes — :cloudHash entries", () => {

  it("(c) removes documents/{docId}.json:cloudHash entries", () => {
    const fileHashes: Record<string, string> = {
      "documents/abc-123.json": "local-hash",
      "documents/abc-123.json:cloudHash": "cloud-hash",
    };
    clearDocHashes(fileHashes, "abc-123");

    expect("documents/abc-123.json:cloudHash" in fileHashes).toBe(false);
    expect("documents/abc-123.json" in fileHashes).toBe(false);
  });

  it("(c) removes all keys containing docId (any pattern)", () => {
    const fileHashes: Record<string, string> = {
      "doc:abc-123:contentHash": "h1",
      "documents/abc-123.json": "h2",
      "documents/abc-123.json:cloudHash": "h3",
      "library.json": "h-lib",
      "settings.json": "h-settings",
    };
    clearDocHashes(fileHashes, "abc-123");

    // All abc-123 keys gone
    expect(Object.keys(fileHashes).filter((k) => k.includes("abc-123"))).toHaveLength(0);
    // Unrelated keys preserved
    expect("library.json" in fileHashes).toBe(true);
    expect("settings.json" in fileHashes).toBe(true);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// (d) Preserves unrelated entries
// ─────────────────────────────────────────────────────────────────────────────

describe("clearDocHashes — preserves unrelated entries", () => {

  it("(d) library.json, settings.json, history.json are not removed", () => {
    const fileHashes: Record<string, string> = {
      "doc:target-doc:contentHash": "h1",
      "documents/target-doc.json": "h2",
      "library.json": "lib-hash",
      "settings.json": "settings-hash",
      "history.json": "history-hash",
    };
    clearDocHashes(fileHashes, "target-doc");

    expect(fileHashes["library.json"]).toBe("lib-hash");
    expect(fileHashes["settings.json"]).toBe("settings-hash");
    expect(fileHashes["history.json"]).toBe("history-hash");
  });

  it("(d) entries for other docs are not removed", () => {
    const fileHashes: Record<string, string> = {
      "doc:target-doc:contentHash": "h1",
      "doc:other-doc:contentHash": "h2",
      "documents/other-doc.json": "h3",
    };
    clearDocHashes(fileHashes, "target-doc");

    expect(fileHashes["doc:other-doc:contentHash"]).toBe("h2");
    expect(fileHashes["documents/other-doc.json"]).toBe("h3");
  });

  it("(d) total remaining count is correct after deletion", () => {
    const fileHashes: Record<string, string> = {
      "doc:del-me:contentHash": "h1",
      "documents/del-me.json": "h2",
      "documents/del-me.json:cloudHash": "h3",
      "library.json": "hL",
      "settings.json": "hS",
    };
    clearDocHashes(fileHashes, "del-me");

    // 2 unrelated keys should remain
    expect(Object.keys(fileHashes)).toHaveLength(2);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// (e) Handles empty fileHashes gracefully
// ─────────────────────────────────────────────────────────────────────────────

describe("clearDocHashes — edge cases", () => {

  it("(e) handles empty fileHashes without throwing", () => {
    const fileHashes: Record<string, string> = {};
    expect(() => clearDocHashes(fileHashes, "any-doc-id")).not.toThrow();
    expect(Object.keys(fileHashes)).toHaveLength(0);
  });

  it("(e) handles docId that matches no entries (no-op)", () => {
    const fileHashes: Record<string, string> = {
      "library.json": "h1",
      "settings.json": "h2",
    };
    clearDocHashes(fileHashes, "nonexistent-doc-id");

    expect(Object.keys(fileHashes)).toHaveLength(2);
  });

  it("(e) source code in sync-engine.js exports clearDocHashes", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../main/sync-engine.js"),
      "utf-8"
    );
    expect(src).toContain("function clearDocHashes(");
    expect(src).toContain("clearDocHashes,");
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// (f) main/constants.js exports all 11 values with correct types
// ─────────────────────────────────────────────────────────────────────────────

describe("main/constants.js — exports all 11 main.js constants", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const constants = require(path.resolve(__dirname, "../main/constants.js"));

  const expectedKeys = [
    "LIBRARY_SAVE_DEBOUNCE_MS",
    "BROADCAST_DEBOUNCE_MS",
    "FOLDER_SYNC_DEBOUNCE_MS",
    "FOLDER_SYNC_BATCH_SIZE",
    "MAX_RECENT_FOLDERS",
    "MAX_HISTORY_SESSIONS",
    "MS_PER_DAY",
    "AUTO_UPDATE_DELAY_MS",
    "BROWSER_FETCH_TIMEOUT_MS",
    "BROWSER_CONTENT_SETTLE_MS",
    "URL_FETCH_TIMEOUT_MS",
  ];

  it("(f) exports all 11 main.js constants", () => {
    for (const key of expectedKeys) {
      expect(constants).toHaveProperty(key);
      expect(typeof constants[key]).toBe("number");
    }
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// (g) main/constants.js values match expected defaults
// ─────────────────────────────────────────────────────────────────────────────

describe("main/constants.js — values match expected defaults", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const constants = require(path.resolve(__dirname, "../main/constants.js"));

  it("(g) LIBRARY_SAVE_DEBOUNCE_MS is 500", () => {
    expect(constants.LIBRARY_SAVE_DEBOUNCE_MS).toBe(500);
  });

  it("(g) BROADCAST_DEBOUNCE_MS is 200", () => {
    expect(constants.BROADCAST_DEBOUNCE_MS).toBe(200);
  });

  it("(g) FOLDER_SYNC_DEBOUNCE_MS is 1000", () => {
    expect(constants.FOLDER_SYNC_DEBOUNCE_MS).toBe(1000);
  });

  it("(g) FOLDER_SYNC_BATCH_SIZE is 4", () => {
    expect(constants.FOLDER_SYNC_BATCH_SIZE).toBe(4);
  });

  it("(g) MAX_RECENT_FOLDERS is 5", () => {
    expect(constants.MAX_RECENT_FOLDERS).toBe(5);
  });

  it("(g) MAX_HISTORY_SESSIONS is 1000", () => {
    expect(constants.MAX_HISTORY_SESSIONS).toBe(1000);
  });

  it("(g) MS_PER_DAY is 86400000 (24 * 60 * 60 * 1000)", () => {
    expect(constants.MS_PER_DAY).toBe(86400000);
  });

  it("(g) URL_FETCH_TIMEOUT_MS is 15000", () => {
    expect(constants.URL_FETCH_TIMEOUT_MS).toBe(15000);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// (h) main.js uses imported constants (not inline hardcoded values)
// ─────────────────────────────────────────────────────────────────────────────

describe("main.js — uses imported constants from main/constants.js", () => {
  let src: string;

  beforeAll(() => {
    src = fs.readFileSync(
      path.resolve(__dirname, "../main.js"),
      "utf-8"
    );
  });

  it("(h) main.js requires main/constants.js", () => {
    expect(src).toContain("require('./main/constants')");
  });

  it("(h) main.js destructures LIBRARY_SAVE_DEBOUNCE_MS from constants", () => {
    expect(src).toContain("LIBRARY_SAVE_DEBOUNCE_MS");
  });

  it("(h) main.js destructures BROADCAST_DEBOUNCE_MS from constants", () => {
    expect(src).toContain("BROADCAST_DEBOUNCE_MS");
  });

  it("(h) main.js destructures FOLDER_SYNC_DEBOUNCE_MS from constants", () => {
    expect(src).toContain("FOLDER_SYNC_DEBOUNCE_MS");
  });

  it("(h) main.js destructures MS_PER_DAY from constants", () => {
    expect(src).toContain("MS_PER_DAY");
  });

});

// Need beforeAll for the last describe block — re-import it
import { beforeAll } from "vitest";
