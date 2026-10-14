import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

// json-store.js is CommonJS. These tests use a real temporary directory: the defect
// they guard (BUG-185) is a race between real writeFile/rename calls.

import os from "os";
import path from "path";
import fs from "fs/promises";

const { writeJSON, saveJSON } = await import("../main/json-store.js");

const TEST_DIR = path.join(os.tmpdir(), "blurby-test-json-store-" + Date.now());
beforeAll(async () => { await fs.mkdir(TEST_DIR, { recursive: true }); });
afterAll(async () => { try { await fs.rm(TEST_DIR, { recursive: true }); } catch {} });

describe("writeJSON — concurrent writes to one path", () => {
  it("20 rounds of 8 concurrent writes: none rejects, the last payload lands, no .tmp remains", async () => {
    const file = path.join(TEST_DIR, "concurrent.json");
    for (let round = 0; round < 20; round++) {
      const payloads = Array.from({ length: 8 }, (_, i) => ({ round, i, pad: "x".repeat(2000 + i) }));
      await Promise.all(payloads.map((p) => writeJSON(file, p)));
      expect(JSON.parse(await fs.readFile(file, "utf-8"))).toEqual(payloads[payloads.length - 1]);
      expect((await fs.readdir(TEST_DIR)).filter((n) => n.endsWith(".tmp"))).toEqual([]);
    }
  });
});

describe("saveJSON — failure policy", () => {
  it("resolves false, does not reject, and logs once when the parent is a regular file", async () => {
    const parent = path.join(TEST_DIR, "not-a-dir");
    await fs.writeFile(parent, "plain file", "utf-8");
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      await expect(saveJSON(path.join(parent, "settings.json"), { a: 1 }, "settings")).resolves.toBe(false);
      expect(spy).toHaveBeenCalledTimes(1);
    } finally {
      spy.mockRestore();
    }
  });

  it("a later write to a path succeeds after a failed write to it", async () => {
    const dir = path.join(TEST_DIR, "late-dir");
    const file = path.join(dir, "settings.json");
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      await expect(saveJSON(file, { attempt: 1 }, "settings")).resolves.toBe(false);
    } finally {
      spy.mockRestore();
    }
    await fs.mkdir(dir, { recursive: true });
    await expect(saveJSON(file, { attempt: 2 }, "settings")).resolves.toBe(true);
    expect(JSON.parse(await fs.readFile(file, "utf-8"))).toEqual({ attempt: 2 });
  });
});
