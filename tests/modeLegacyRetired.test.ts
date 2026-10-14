import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// CLEANUP-MODE-BARREL-1: src/modes/ holds only the shared type contract (ModeInterface.ts).
// The legacy engines live in src/reader/modes/<mode>/ModeRuntime.ts. Needles are built by
// concatenation so this file does not match the item's own git grep gates.

const ROOT = path.resolve(__dirname, "..");
const MODES_DIR = "mo" + "des";
const LEGACY_SPECIFIER_ENDINGS = ["index", "PageMode", "FocusMode", "FlowMode", "NarrateMode"].map((name) => MODES_DIR + "/" + name);

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

describe("legacy mode barrel and engines stay retired", () => {
  it("(a) src/modes/ holds only ModeInterface.ts", () => {
    expect(fs.readdirSync(path.join(ROOT, "src", MODES_DIR)).sort()).toEqual(["ModeInterface.ts"]);
  });

  it("(b) vite.config.js has no legacy NarrateMode chunk rule", () => {
    const config = fs.readFileSync(path.join(ROOT, "vite.config.js"), "utf8");
    expect(config).not.toContain("src/" + MODES_DIR + "/" + "NarrateMode");
  });

  it("(c) no src file imports a legacy src/modes engine or barrel", () => {
    const specifier = /(?:from\s+|import\s*\(\s*|require\s*\(\s*|import\s+)["']([^"']+)["']/g;
    const offenders: string[] = [];
    for (const file of sourceFiles(path.join(ROOT, "src"))) {
      const text = fs.readFileSync(file, "utf8");
      for (const match of text.matchAll(specifier)) {
        const spec = match[1].replace(/\.(t|j)sx?$/, "");
        if (LEGACY_SPECIFIER_ENDINGS.some((ending) => spec.endsWith(ending))) {
          offenders.push(path.relative(ROOT, file) + " -> " + match[1]);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
