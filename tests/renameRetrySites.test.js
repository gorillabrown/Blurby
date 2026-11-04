import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

// RENAME-RETRY-1: every temp-then-rename write in the main process goes through json-store's renameWithRetry,
// so a rename Windows refuses for a moment (EPERM, EBUSY, EACCES from a scanner or indexer) is retried.

import os from "os";
import path from "path";
import fs from "fs/promises";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// The same CommonJS fs/promises object json-store.js requires and calls through (as tests/jsonStore.test.js does).
const cjsFs = createRequire(import.meta.url)("fs/promises");

const SITES = [
  "main/ipc/reader.js",
  "main/ipc/stats.js",
  "main/tts-cache.js",
  "main/narrate/expose-durations.js",
];

// RENAME-TMP-RACE-1: these saves go through json-store's serialized writeJSON, which owns the temp name and the
// retried rename, so two overlapping saves never share one fixed .tmp file.
const WRITE_JSON_SITES = [
  "main/sync-engine.js",
  "main/auth.js",
];

describe("RENAME-RETRY-1: atomic renames in the main process", () => {
  it("every rename site calls renameWithRetry, imported from json-store, and no raw .rename(", async () => {
    const problems = [];
    for (const rel of SITES) {
      const lines = (await fs.readFile(path.join(ROOT, rel), "utf-8")).split(/\r?\n/);
      lines.forEach((line, i) => {
        if (/\.rename\(/.test(line)) problems.push(`${rel}:${i + 1}: raw rename: ${line.trim()}`);
      });
      const text = lines.join("\n");
      if (!/const \{[^}]*\brenameWithRetry\b[^}]*\} = require\("\.{1,2}\/(?:\.\.\/)?json-store"\)/.test(text)) {
        problems.push(`${rel}: does not import renameWithRetry from json-store`);
      }
      if (!/\brenameWithRetry\(/.test(text)) problems.push(`${rel}: never calls renameWithRetry`);
    }
    expect(problems).toEqual([]);
  });

  it("the sync-state and token saves write through json-store's writeJSON and build no temp file of their own", async () => {
    const problems = [];
    for (const rel of WRITE_JSON_SITES) {
      const lines = (await fs.readFile(path.join(ROOT, rel), "utf-8")).split(/\r?\n/);
      lines.forEach((line, i) => {
        if (/\.rename\(/.test(line)) problems.push(`${rel}:${i + 1}: raw rename: ${line.trim()}`);
        if (/\+ "\.tmp"/.test(line)) problems.push(`${rel}:${i + 1}: own temp file: ${line.trim()}`);
      });
      const text = lines.join("\n");
      if (!/const \{[^}]*\bwriteJSON\b[^}]*\} = require\("\.{1,2}\/(?:\.\.\/)?json-store"\)/.test(text)) {
        problems.push(`${rel}: does not import writeJSON from json-store`);
      }
      if (!/\bwriteJSON\(/.test(text)) problems.push(`${rel}: never calls writeJSON`);
    }
    expect(problems).toEqual([]);
  });

  describe("the exported renameWithRetry", () => {
    const dir = path.join(os.tmpdir(), "blurby-test-rename-retry-" + Date.now());
    beforeAll(async () => { await fs.mkdir(dir, { recursive: true }); });
    afterAll(async () => { try { await fs.rm(dir, { recursive: true }); } catch {} });

    it("retries a transient EBUSY and lands the payload; rejects ENOENT after exactly one call", async () => {
      const { renameWithRetry } = await import("../main/json-store.js");
      expect(typeof renameWithRetry).toBe("function");

      const realRename = cjsFs.rename;
      const tmp = path.join(dir, "out.json.tmp");
      const target = path.join(dir, "out.json");
      await fs.writeFile(tmp, "payload", "utf-8");
      let calls = 0;
      let spy = vi.spyOn(cjsFs, "rename").mockImplementation(async (...args) => {
        calls++;
        if (calls === 1) throw Object.assign(new Error("EBUSY: resource busy or locked, rename"), { code: "EBUSY" });
        return realRename.apply(cjsFs, args);
      });
      try {
        await expect(renameWithRetry(tmp, target)).resolves.toBeUndefined();
        expect(calls).toBe(2);
        expect(await fs.readFile(target, "utf-8")).toBe("payload");
      } finally {
        spy.mockRestore();
      }

      calls = 0;
      spy = vi.spyOn(cjsFs, "rename").mockImplementation(async () => {
        calls++;
        throw Object.assign(new Error("ENOENT: no such file or directory, rename"), { code: "ENOENT" });
      });
      try {
        await expect(renameWithRetry(path.join(dir, "missing.tmp"), target)).rejects.toMatchObject({ code: "ENOENT" });
        expect(calls).toBe(1);
      } finally {
        spy.mockRestore();
      }
    });
  });
});
