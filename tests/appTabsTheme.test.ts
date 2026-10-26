import * as fs from "fs";
import * as path from "path";
import { describe, expect, it } from "vitest";

// APP-TABS-1: the tab bar is themed with existing tokens only, so every theme (E-ink included) styles it.
// The helpers are those of tests/helpSurfaces.test.tsx.
const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, "..", rel), "utf-8");
const CSS_PATH = "src/styles/app-tabs.css";
const css = () => (fs.existsSync(path.resolve(__dirname, "..", CSS_PATH)) ? read(CSS_PATH) : "");

function extractCssBlock(source: string, selector: string): string {
  const selectorIdx = source.indexOf(selector);
  if (selectorIdx === -1) return "";
  const openBrace = source.indexOf("{", selectorIdx);
  if (openBrace === -1) return "";
  let depth = 1;
  let pos = openBrace + 1;
  while (pos < source.length && depth > 0) {
    if (source[pos] === "{") depth++;
    else if (source[pos] === "}") depth--;
    pos++;
  }
  return source.slice(openBrace + 1, pos - 1);
}

// Number of ThemeProvider theme maps that define the variable (`"--name":`); a token every theme defines counts 4.
function definedInEveryTheme(name: string): number {
  return read("src/components/ThemeProvider.tsx").split(`"${name}":`).length - 1;
}

const SHARED_TOKENS = ["--mono", "--serif", "--radius-sm", "--radius-md", "--radius-lg", "--transition-fast", "--transition-normal"];
// Set on the list-row context menu element by DocCard (the spec's Wave B instruction: no inline left/top); not theme colours.
const ELEMENT_PROPS = ["--menu-x", "--menu-y"];

describe("APP-TABS-1 tab bar theme", () => {
  it("(t1) the stylesheet exists and reads only tokens every theme defines", () => {
    expect(fs.existsSync(path.resolve(__dirname, "..", CSS_PATH))).toBe(true);
    const names = [...css().matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]);
    expect(names.length).toBeGreaterThan(0);
    const bad = names.filter((n) => !SHARED_TOKENS.includes(n) && !ELEMENT_PROPS.includes(n) && definedInEveryTheme(n) !== 4);
    expect(bad).toEqual([]);
  });

  it("(t2) it holds no colour literal", () => {
    expect(css().length).toBeGreaterThan(0);
    expect(css().match(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|\b(white|black|transparent)\b/i)).toBeNull();
  });

  it("(t3) the tab and bar colours", () => {
    expect(extractCssBlock(css(), ".app-tab {")).toContain("color: var(--text-dim)");
    const selected = extractCssBlock(css(), '.app-tab[aria-selected="true"] {');
    expect(selected).toContain("color: var(--text)");
    expect(selected).toContain("border-bottom-color: var(--accent)");
    const bar = extractCssBlock(css(), ".app-tab-bar {");
    expect(bar).toContain("background: var(--bg)");
    expect(bar).toContain("border-bottom: 1px solid var(--border)");
  });

  it("(t4) on E-ink the selected tab is bold", () => {
    expect(extractCssBlock(css(), '[data-eink="true"] .app-tab[aria-selected="true"] {')).toContain("font-weight: 700");
  });

  it("(t5) control: index.css imports the themes", () => {
    expect(read("src/styles/index.css")).toContain('@import "./themes.css";');
  });
});
