// ERROR-LOG fix (Brain1 dispatch 2026-11-05): main/error-log.js is the only error.log appender, so every write to
// error.log goes through the size cap (ERROR-LOG-CAP-1). main/library-write.js kept a private appender that never
// rotated; these rows fail on the base (14ce3d24) and pass once it uses the shared helper.
import { describe, it, expect, afterEach } from "vitest";
import { createRequire } from "module";
import fs from "fs";
import os from "os";
import path from "path";

const require = createRequire(import.meta.url);
const MAIN_DIR = path.resolve(__dirname, "../main");
const { ERROR_LOG_MAX_BYTES } = require("../main/constants.js");
const { writeConversionResult } = require("../main/library-write.js");

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(c?js|mjs|ts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

let dir;
afterEach(() => {
  if (dir) fs.rmSync(dir, { recursive: true, force: true });
  dir = undefined;
});

describe("error.log has one appender (ERROR-LOG fix)", () => {
  it("(a) no file under main/ appends to errorLogPath except main/error-log.js", () => {
    const offenders = walk(MAIN_DIR)
      .filter((file) => path.relative(MAIN_DIR, file).split(path.sep).join("/") !== "error-log.js")
      .filter((file) => fs.readFileSync(file, "utf-8").includes("appendFile(errorLogPath"))
      .map((file) => path.relative(MAIN_DIR, file).split(path.sep).join("/"));
    expect(offenders).toEqual([]);
  });

  it("(b) writeConversionResult's failed-unlink log, with error.log at the cap, rotates to error.log.1", async () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "blurby-libwrite-errlog-"));
    const logPath = path.join(dir, "error.log");
    fs.writeFileSync(logPath, Buffer.alloc(ERROR_LOG_MAX_BYTES - 1, 0x61));
    const ctx = { getLibrary: () => [], getErrorLogPath: () => logPath };
    const missing = path.join(dir, "no-such-converted.epub"); // unlink fails: ENOENT
    const wrote = await writeConversionResult(ctx, "gone-doc", { title: "x" }, missing);
    expect(wrote).toBe(false);
    expect(fs.existsSync(`${logPath}.1`)).toBe(true);
    expect(fs.statSync(`${logPath}.1`).size).toBe(ERROR_LOG_MAX_BYTES - 1);
    const lines = fs.readFileSync(logPath, "utf-8").split("\n").filter(Boolean);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatch(/converted file for removed doc "gone-doc" not deleted/);
  });
});
