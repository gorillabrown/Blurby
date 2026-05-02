import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { DEFAULT_SETTINGS } from "../src/constants";

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, "..", rel), "utf-8");

function extractCssBlock(css: string, selector: string): string {
  const selectorIdx = css.indexOf(selector);
  if (selectorIdx === -1) return "";
  const openBrace = css.indexOf("{", selectorIdx);
  if (openBrace === -1) return "";
  let depth = 1;
  let pos = openBrace + 1;
  while (pos < css.length && depth > 0) {
    if (css[pos] === "{") depth++;
    else if (css[pos] === "}") depth--;
    pos++;
  }
  return css.slice(openBrace + 1, pos - 1);
}

describe("EINK-6A: E-Ink Foundation", () => {
  it("settings schema exposes einkMode as an independent boolean", () => {
    const types = read("src/types.ts");
    expect(types).toMatch(/einkMode:\s*boolean;/);
  });

  it("DEFAULT_SETTINGS keeps einkMode off by default", () => {
    expect(DEFAULT_SETTINGS).toHaveProperty("einkMode", false);
  });

  it("main-process defaults and migrations backfill einkMode false", () => {
    const main = read("main.js");
    const migrations = read("main/migrations.js");
    const stub = read("src/test-harness/electron-api-stub.ts");
    expect(main).toMatch(/einkMode:\s*false/);
    expect(stub).toMatch(/einkMode:\s*false/);
    expect(migrations).toContain("CURRENT_SETTINGS_SCHEMA = 9");
    expect(migrations).toContain("data.einkMode = false");
  });

  it("ThemeProvider applies data-eink from settings independently of data-theme", () => {
    const src = read("src/components/ThemeProvider.tsx");
    expect(src).toContain("setEinkMode(Boolean(state.settings.einkMode))");
    expect(src).toContain('root.setAttribute("data-theme", resolvedTheme)');
    expect(src).toContain('root.setAttribute("data-eink", "true")');
    expect(src).toContain('root.removeAttribute("data-eink")');
    expect(src).not.toContain('theme === "eink" ? "true"');
  });

  it("dark theme can coexist with e-ink display behavior", () => {
    const css = read("src/styles/themes.css");
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain('[data-eink="true"]');
    expect(css.indexOf('[data-theme="dark"]')).not.toBe(css.indexOf('[data-eink="true"]'));
  });

  it("behavioral e-ink CSS disables transitions under data-eink", () => {
    const css = read("src/styles/themes.css");
    const block = extractCssBlock(css, '[data-eink="true"] *');
    expect(block).toMatch(/animation:\s*none\s*!important/);
    expect(block).toMatch(/transition:\s*none\s*!important/);
  });

  it("greyscale theme palette stays under data-theme=eink without behavioral overrides", () => {
    const css = read("src/styles/themes.css");
    const paletteBlock = extractCssBlock(css, '[data-theme="eink"]');
    expect(paletteBlock).toMatch(/--bg:\s*#ffffff/);
    expect(paletteBlock).toMatch(/--accent:\s*#000000/);
    expect(paletteBlock).not.toMatch(/transition|animation|min-height|min-width/);
    expect(css).not.toContain('[data-theme="eink"] .reader-word-focus');
    expect(css).not.toContain('[data-theme="eink"] .progress-bar');
    expect(css).toContain('[data-eink="true"] .reader-word-focus');
    expect(css).toContain('[data-eink="true"] .progress-bar');
  });

  it("ThemeSettings shows e-ink display mode as a separate toggle", () => {
    const src = read("src/components/settings/ThemeSettings.tsx");
    expect(src).toContain("E-Ink Display Mode");
    expect(src).toContain("einkMode: !settings.einkMode");
    expect(src).toContain("settings.einkMode &&");
    expect(src).toContain('"eink"');
  });

  it("ReaderContainer enforces WPM ceiling from einkMode instead of theme", () => {
    const src = read("src/components/ReaderContainer.tsx");
    expect(src).toContain("const isEink = settings.einkMode === true;");
    expect(src).toContain("const effectiveWpm = isEink ? Math.min(wpm, settings.einkWpmCeiling || DEFAULT_EINK_WPM_CEILING) : wpm;");
    expect(src).not.toContain('const isEink = settings.theme === "eink";');
  });

  it("useEinkController gates refresh behavior on einkMode instead of theme", () => {
    const src = read("src/hooks/useEinkController.ts");
    expect(src).toContain("const isEink = settings.einkMode === true;");
    expect(src).not.toContain('settings.theme === "eink"');
  });

  it("refresh overlay and reader chrome receive e-ink state from einkMode", () => {
    const src = read("src/components/ReaderContainer.tsx");
    expect(src).toContain("useEinkController(settings)");
    expect(src).toContain("isEink={isEink}");
    expect(src).toContain("{showEinkRefresh && <EinkRefreshOverlay />}");
  });
});
