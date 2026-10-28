// @vitest-environment node
// tests/componentStyleCleanup.test.ts — REFACTOR-1B: Component Style Cleanup
//
// Structural verification tests for the four main workstreams of REFACTOR-1B:
//   (a) foliateHelpers.ts extraction — 12 named exports from FoliatePageView
//   (b) foliateStyles.ts extraction — injectStyles export
//   (c) TTSSettings sub-component split — 3 sub-components imported
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

  it("(a5) FoliatePageView.tsx imports from foliateHelpers (not inline definitions)", () => {
    const fpv = fs.readFileSync(
      path.resolve(__dirname, "../src/components/FoliatePageView.tsx"),
      "utf-8"
    );
    expect(fpv).toContain("from \"../utils/foliateHelpers\"");
    // Spot-check a few key imports are present
    expect(fpv).toContain("extractWordsFromView");
    expect(fpv).toContain("buildWrappedFragmentForNode");
  });

  it("(a6) FoliatePageView.tsx does NOT define hasToken inline", () => {
    const fpv = fs.readFileSync(
      path.resolve(__dirname, "../src/components/FoliatePageView.tsx"),
      "utf-8"
    );
    // Should not have local function definition — only imports from foliateHelpers
    expect(fpv).not.toMatch(/^function hasToken/m);
    expect(fpv).not.toMatch(/^const hasToken/m);
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

  it("(b4) FoliatePageView.tsx imports injectStyles from foliateStyles (not inline)", () => {
    const fpv = fs.readFileSync(
      path.resolve(__dirname, "../src/components/FoliatePageView.tsx"),
      "utf-8"
    );
    expect(fpv).toContain("from \"../utils/foliateStyles\"");
    expect(fpv).toContain("injectStyles");
    // Must not define injectStyles locally
    expect(fpv).not.toMatch(/^function injectStyles/m);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// (c) TTSSettings sub-component split
// ─────────────────────────────────────────────────────────────────────────────

describe("TTSSettings — sub-component split", () => {
  const settingsDir = path.resolve(__dirname, "../src/components/settings");
  let ttsSrc: string;

  beforeAll(() => {
    ttsSrc = fs.readFileSync(path.join(settingsDir, "TTSSettings.tsx"), "utf-8");
  });

  it("(c1) KokoroStatusSection.tsx exists", () => {
    expect(fs.existsSync(path.join(settingsDir, "KokoroStatusSection.tsx"))).toBe(true);
  });

  it("(c2) PauseSettingsSection.tsx exists", () => {
    expect(fs.existsSync(path.join(settingsDir, "PauseSettingsSection.tsx"))).toBe(true);
  });

  it("(c3) PronunciationOverridesEditor.tsx exists", () => {
    expect(fs.existsSync(path.join(settingsDir, "PronunciationOverridesEditor.tsx"))).toBe(
      true
    );
  });

  it("(c4) TTSSettings.tsx imports all 3 sub-components", () => {
    expect(ttsSrc).toContain("KokoroStatusSection");
    expect(ttsSrc).toContain("PauseSettingsSection");
    expect(ttsSrc).toContain("PronunciationOverridesEditor");
  });

  it("(c5) TTSSettings.tsx is under 600 lines", () => {
    const lineCount = ttsSrc.split("\n").length;
    expect(lineCount).toBeLessThan(600);
  });

  it("(c6) KokoroStatusSection.tsx exports KokoroStatusSection component", () => {
    const src = fs.readFileSync(
      path.join(settingsDir, "KokoroStatusSection.tsx"),
      "utf-8"
    );
    expect(src).toMatch(/export.*KokoroStatusSection/);
  });

  it("(c7) PauseSettingsSection.tsx exports PauseSettingsSection component", () => {
    const src = fs.readFileSync(
      path.join(settingsDir, "PauseSettingsSection.tsx"),
      "utf-8"
    );
    expect(src).toMatch(/export.*PauseSettingsSection/);
  });

  it("(c8) PronunciationOverridesEditor.tsx exports PronunciationOverridesEditor component", () => {
    const src = fs.readFileSync(
      path.join(settingsDir, "PronunciationOverridesEditor.tsx"),
      "utf-8"
    );
    expect(src).toMatch(/export.*PronunciationOverridesEditor/);
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

  it("(d1) tts-settings.css exists", () => {
    expect(
      fs.existsSync(path.resolve(__dirname, "../src/styles/tts-settings.css"))
    ).toBe(true);
  });

  it("(d2) tts-settings.css contains TTS-related CSS class names", () => {
    const css = fs.readFileSync(
      path.resolve(__dirname, "../src/styles/tts-settings.css"),
      "utf-8"
    );
    // Must contain at least one .tts- prefixed class
    expect(css).toMatch(/\.tts-/);
  });

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

  it("(d4) TTSSettings.tsx has ≤ 1 inline style (dynamic CSS custom property setters only)", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../src/components/settings/TTSSettings.tsx"),
      "utf-8"
    );
    const matches = src.match(/style=\{\{/g);
    const count = matches ? matches.length : 0;
    // TTSSettings should have 0 static inline styles; allow max 1 for CSS var injection
    expect(count).toBeLessThanOrEqual(1);
  });

  it("(d5) KokoroStatusSection.tsx has ≤ 1 inline style (dynamic progress bar width only)", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../src/components/settings/KokoroStatusSection.tsx"),
      "utf-8"
    );
    const matches = src.match(/style=\{\{/g);
    const count = matches ? matches.length : 0;
    expect(count).toBeLessThanOrEqual(1);
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

  it("(e4) index.css also imports tts-settings.css", () => {
    expect(indexSrc).toContain("tts-settings.css");
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
