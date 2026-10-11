import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, "..", rel), "utf-8");

function slice(src: string, start: string, end: string): string {
  const from = src.indexOf(start);
  if (from === -1) return "";
  const to = src.indexOf(end, from);
  return src.slice(from, to === -1 ? undefined : to);
}

const palette = read("src/components/CommandPalette.tsx");
const settingsMenu = read("src/components/SettingsMenu.tsx");
const menuFlap = read("src/components/MenuFlap.tsx");

const routeArgs = [...palette.matchAll(/onOpenSettings\(([^)]*)\)/g)].map((m) => m[1].trim());

const categoryIds = [
  slice(settingsMenu, "const CATEGORIES = [", "];"),
  slice(settingsMenu, "const SECONDARY_CATEGORIES = [", "];"),
].flatMap((block) => [...block.matchAll(/\{\s*id:\s*"([^"]+)"/g)].map((m) => m[1]));

const titleKeys = [...slice(menuFlap, "const TITLES", "};").matchAll(/^\s*"?([\w-]+)"?\s*:/gm)].map((m) => m[1]);

const unquote = (arg: string) => arg.replace(/^"(.*)"$/, "$1");

describe("LIBRARY-SETTINGS-FIX-1: command palette settings routing", () => {
  it("extracts the routes, categories and titles it checks", () => {
    expect(routeArgs.length).toBeGreaterThan(10);
    expect(categoryIds).toContain("layout");
    expect(categoryIds).toContain("hotkeys");
    expect(titleKeys).toContain("settings");
  });

  it("(a) every onOpenSettings call passes a string page", () => {
    const bare = routeArgs.filter((arg) => !/^"[^"]+"$/.test(arg));
    expect(bare).toEqual([]);
  });

  it("(b) every route is a real settings page or the main settings list", () => {
    const valid = new Set([...categoryIds, "settings"]);
    const unknown = routeArgs.filter((arg) => /^"[^"]+"$/.test(arg)).map(unquote).filter((id) => !valid.has(id));
    expect(unknown).toEqual([]);
  });

  it("(c) every settings page has at least one palette entry", () => {
    const routed = new Set(routeArgs.map(unquote));
    expect(categoryIds.filter((id) => !routed.has(id))).toEqual([]);
  });

  it("(d) every settings page has a MenuFlap title", () => {
    expect(categoryIds.filter((id) => !titleKeys.includes(id))).toEqual([]);
  });
});
