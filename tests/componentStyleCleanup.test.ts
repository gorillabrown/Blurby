// @vitest-environment node
// tests/componentStyleCleanup.test.ts — REFACTOR-1B: Component Style Cleanup
//
// Structural verification tests for the four main workstreams of REFACTOR-1B:
//   (a) foliateHelpers.ts extraction — 12 named exports from FoliatePageView
//   (b) foliateStyles.ts extraction — injectStyles export
//   (d) Inline style → CSS migration — < 30 inline styles across src/components/
//   (e) global.css domain split — 8 domain files + index.css imports
//
// All tests use the source-text scanning pattern (fs.readFileSync + regex).
// No React rendering required.

import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ─────────────────────────────────────────────────────────────────────────────
// (a) foliateHelpers.ts — extraction structure
// ─────────────────────────────────────────────────────────────────────────────

describe("foliateHelpers.ts — extraction structure", () => {
  let src: string;

  beforeAll(() => {
    src = fs.readFileSync(
      path.resolve(__dirname, "../src/utils/foliateHelpers.ts"),
      "utf-8"
    );
  });

  it("(a1) foliateHelpers.ts exists", () => {
    expect(
      fs.existsSync(path.resolve(__dirname, "../src/utils/foliateHelpers.ts"))
    ).toBe(true);
  });

  it("(a2) exports FoliateWord interface", () => {
    expect(src).toContain("export interface FoliateWord");
  });

  it("(a3) exports BLOCK_TAGS constant", () => {
    expect(src).toContain("export const BLOCK_TAGS");
  });

  it("(a4) exports all 10 expected utility functions", () => {
    const expectedExports = [
      "hasToken",
      "isFootnoteRefElement",
      "isFootnoteBodyElement",
      "isSuppressedNarrationTextNode",
      "getBlockParent",
      "collectBlockTextNodes",
      "locateTextOffset",
      "buildWordsFromTextNodes",
      "buildWrappedFragmentForNode",
      "extractWordsFromView",
      "extractWordsFromSection",
    ];
    for (const fn of expectedExports) {
      expect(src, `Expected export: ${fn}`).toContain(`export function ${fn}`);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (b) foliateStyles.ts — extraction structure
// ─────────────────────────────────────────────────────────────────────────────

describe("foliateStyles.ts — extraction structure", () => {
  let src: string;

  beforeAll(() => {
    src = fs.readFileSync(
      path.resolve(__dirname, "../src/utils/foliateStyles.ts"),
      "utf-8"
    );
  });

  it("(b1) foliateStyles.ts exists", () => {
    expect(
      fs.existsSync(path.resolve(__dirname, "../src/utils/foliateStyles.ts"))
    ).toBe(true);
  });

  it("(b2) exports injectStyles function", () => {
    expect(src).toContain("export function injectStyles(");
  });

  it("(b3) injectStyles injects a <style> element with id 'blurby-theme'", () => {
    expect(src).toContain("blurby-theme");
    expect(src).toContain("style.id");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (d) Inline style → CSS migration
// ─────────────────────────────────────────────────────────────────────────────

describe("Inline style migration — src/components/", () => {
  const componentsDir = path.resolve(__dirname, "../src/components");

  /** Recursively collect all .tsx files under a directory */
  function collectTsxFiles(dir: string): string[] {
    const results: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...collectTsxFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
        results.push(fullPath);
      }
    }
    return results;
  }

  it("(d3) total inline style count across all .tsx files in src/components/ is < 30", () => {
    const files = collectTsxFiles(componentsDir);
    let total = 0;
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const matches = content.match(/style=\{\{/g);
      if (matches) total += matches.length;
    }
    // Sprint target was 179 → 27. Allow a small buffer above 27 for dynamic-only exceptions.
    expect(total).toBeLessThan(30);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (e) global.css domain split — index.css imports all 8 domain files
// ─────────────────────────────────────────────────────────────────────────────

describe("global.css domain split — index.css + 8 domain files", () => {
  const stylesDir = path.resolve(__dirname, "../src/styles");
  let indexSrc: string;

  beforeAll(() => {
    indexSrc = fs.readFileSync(path.join(stylesDir, "index.css"), "utf-8");
  });

  it("(e1) index.css exists", () => {
    expect(fs.existsSync(path.join(stylesDir, "index.css"))).toBe(true);
  });

  it("(e2) index.css imports base.css", () => {
    expect(indexSrc).toContain("base.css");
  });

  it("(e3) index.css imports all 8 domain CSS files", () => {
    const requiredImports = [
      "base.css",
      "reader.css",
      "library.css",
      "themes.css",
      "flow.css",
      "keyboard.css",
      "page-reader.css",
      "onboarding.css",
    ];
    for (const file of requiredImports) {
      expect(indexSrc, `Expected @import for ${file}`).toContain(file);
    }
  });

  it("(e5) all 8 domain CSS files physically exist in src/styles/", () => {
    const domainFiles = [
      "base.css",
      "reader.css",
      "library.css",
      "themes.css",
      "flow.css",
      "keyboard.css",
      "page-reader.css",
      "onboarding.css",
    ];
    for (const file of domainFiles) {
      expect(
        fs.existsSync(path.join(stylesDir, file)),
        `Expected file to exist: ${file}`
      ).toBe(true);
    }
  });

  it("(e6) main.tsx imports index.css (not global.css)", () => {
    const mainSrc = fs.readFileSync(
      path.resolve(__dirname, "../src/main.tsx"),
      "utf-8"
    );
    expect(mainSrc).toContain("styles/index.css");
    expect(mainSrc).not.toContain("global.css");
  });

  it("(e7) no orphan global.css import exists in src/ (.tsx or .ts files)", () => {
    const srcDir = path.resolve(__dirname, "../src");

    function scanDir(dir: string): string[] {
      const hits: string[] = [];
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          hits.push(...scanDir(fullPath));
        } else if (
          entry.isFile() &&
          (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))
        ) {
          const content = fs.readFileSync(fullPath, "utf-8");
          if (/import\s+["'].*global\.css["']/.test(content)) hits.push(fullPath);
        }
      }
      return hits;
    }

    const orphans = scanDir(srcDir);
    expect(orphans).toHaveLength(0);
  });

  it("(e8) base.css contains :root CSS custom properties", () => {
    const baseSrc = fs.readFileSync(path.join(stylesDir, "base.css"), "utf-8");
    expect(baseSrc).toContain(":root");
    expect(baseSrc).toContain("--");
  });

  it("(e9) themes.css contains at least one data-theme selector", () => {
    const themesSrc = fs.readFileSync(path.join(stylesDir, "themes.css"), "utf-8");
    // Themes use [data-theme="eink"] etc.
    expect(themesSrc).toMatch(/\[data-theme=/);
  });
});
