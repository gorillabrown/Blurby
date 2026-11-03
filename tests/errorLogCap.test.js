// ERROR-LOG-CAP-1 — error.log is size-capped: an append that would take it past ERROR_LOG_MAX_BYTES first renames it to
// error.log.1 (replacing any older one) and starts a new error.log. Logging never throws.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRequire } from "module";
import fs from "fs";
import os from "os";
import path from "path";

const require = createRequire(import.meta.url);
const fsPromises = require("fs/promises");

// Loaded through a variable path so the test runs (and fails by assertion) on a base without the helper. There, the
// fallback is the base's appender verbatim (main/ipc/library.js, main/ipc/misc.js), which never rotates.
function loadHelper() {
  const helperPath = "../main/error-log.js";
  try {
    return require(helperPath);
  } catch {
    return {
      logToFile: async (message, errorLogPath) => {
        try {
          await fsPromises.appendFile(errorLogPath, `[${new Date().toISOString()}] ${message}\n`, "utf-8");
        } catch { /* as the base */ }
      },
    };
  }
}
const { logToFile } = loadHelper();
const { ERROR_LOG_MAX_BYTES } = require("../main/constants.js");

let dir;
let logPath;
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "blurby-errorlog-"));
  logPath = path.join(dir, "error.log");
});
afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("error.log size cap (ERROR-LOG-CAP-1)", () => {
  it("the cap is 10 MB", () => {
    expect(ERROR_LOG_MAX_BYTES).toBe(10 * 1024 * 1024);
  });

  it("a file one byte under the cap rotates on the next append; the new error.log holds only that line", async () => {
    fs.writeFileSync(logPath, Buffer.alloc((ERROR_LOG_MAX_BYTES ?? 10 * 1024 * 1024) - 1, 0x61));
    await logToFile("first after the cap", logPath);
    expect(fs.existsSync(`${logPath}.1`)).toBe(true);
    expect(fs.statSync(`${logPath}.1`).size).toBe((ERROR_LOG_MAX_BYTES ?? 10 * 1024 * 1024) - 1);
    const lines = fs.readFileSync(logPath, "utf-8").split("\n").filter(Boolean);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatch(/^\[\d{4}-\d\d-\d\dT[^\]]+\] first after the cap$/);
  });

  it("a second rotation replaces error.log.1 (one rotated file is kept)", async () => {
    const cap = 200;
    fs.writeFileSync(logPath, "x".repeat(cap - 1));
    await logToFile("one", logPath, cap);
    fs.appendFileSync(logPath, "y".repeat(cap));
    await logToFile("two", logPath, cap);
    const rotated = fs.readFileSync(`${logPath}.1`, "utf-8");
    expect(rotated).toContain("one");
    expect(rotated).not.toContain("x");
    expect(fs.readFileSync(logPath, "utf-8")).toMatch(/\] two\n$/);
    expect(fs.readdirSync(dir).sort()).toEqual(["error.log", "error.log.1"]);
  });

  it("an append under the cap does not rotate", async () => {
    fs.writeFileSync(logPath, "earlier\n");
    await logToFile("later", logPath);
    expect(fs.existsSync(`${logPath}.1`)).toBe(false);
    expect(fs.readFileSync(logPath, "utf-8")).toMatch(/^earlier\n\[[^\]]+\] later\n$/);
  });

  it("a rename failure still appends and does not throw", async () => {
    const cap = 100;
    fs.writeFileSync(logPath, "z".repeat(cap));
    vi.spyOn(fsPromises, "rename").mockRejectedValue(new Error("EBUSY"));
    await expect(logToFile("kept anyway", logPath, cap)).resolves.toBeUndefined();
    expect(fs.existsSync(`${logPath}.1`)).toBe(false);
    expect(fs.readFileSync(logPath, "utf-8")).toMatch(/\] kept anyway\n$/);
  });
});
