import fs from "node:fs";
import path from "node:path";
import { createRequire } from "module";
import { describe, expect, it } from "vitest";

// APP-TABS-1: every library item has a home, Library or Newsroom, derived from its type unless the user moved it.
// The upgrade writes nothing: the v6 library loads unchanged and splits into the two tabs with every item once.
const require = createRequire(import.meta.url);
const { runMigrations, libraryMigrations, CURRENT_LIBRARY_SCHEMA } = require("../main/migrations.js");

const FIXTURE = JSON.parse(fs.readFileSync(path.resolve(__dirname, "fixtures/app-tabs/library-v6.json"), "utf-8"));
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

// A guarded import, so a missing module fails by assertion, not by import error (standing rule 43).
async function loadHome(): Promise<any> {
  const p = "../src/utils/libraryHome";
  return import(/* @vite-ignore */ p).catch(() => ({}));
}

const doc = (over: Record<string, unknown>) => ({ id: "d", title: "T", wordCount: 1, position: 0, created: 1, ...over });

describe("APP-TABS-1 home rule", () => {
  it("(h1) the default home comes from the item's type", async () => {
    const { homeOf } = await loadHome();
    expect(typeof homeOf).toBe("function");
    expect(homeOf(doc({ source: "url" }))).toBe("newsroom");
    expect(homeOf(doc({ source: "url", ext: ".epub" }))).toBe("newsroom");
    expect(homeOf(doc({ source: "manual" }))).toBe("newsroom");
    expect(homeOf(doc({ source: "manual", ext: ".epub" }))).toBe("library");
    expect(homeOf(doc({ source: "folder", ext: ".epub" }))).toBe("library");
    expect(homeOf(doc({ source: "folder", ext: ".pdf" }))).toBe("library");
    expect(homeOf(doc({ source: "sample" }))).toBe("library");
  });

  it("(h2) an explicit home wins; anything else falls back to the default", async () => {
    const { homeOf } = await loadHome();
    expect(typeof homeOf).toBe("function");
    expect(homeOf(doc({ source: "folder", ext: ".pdf", home: "newsroom" }))).toBe("newsroom");
    expect(homeOf(doc({ source: "url", home: "library" }))).toBe("library");
    for (const bad of ["podcasts", "x", 5, null]) {
      expect(homeOf(doc({ source: "folder", ext: ".pdf", home: bad }))).toBe("library");
      expect(homeOf(doc({ source: "url", home: bad }))).toBe("newsroom");
    }
  });

  it("(h3) frame 6: the v6 library upgrades unchanged and splits with every item once", async () => {
    const { partitionByHome, APP_TABS } = await loadHome();
    expect(typeof partitionByHome).toBe("function");
    expect(APP_TABS).toEqual(["library", "newsroom", "podcasts", "marketplace"]);
    const result = runMigrations(clone(FIXTURE), libraryMigrations, CURRENT_LIBRARY_SCHEMA);
    expect(result).toEqual(FIXTURE);
    const { library, newsroom } = partitionByHome(result.docs);
    expect(library).toEqual(["f-epub", "f-pdf", "f-pdf-arch", "m-drop", "s-sample"]);
    expect(newsroom).toEqual(["u-art", "u-ext", "m-text"]);
    const all = [...library, ...newsroom];
    const live = FIXTURE.docs.filter((d: any) => !d.deleted).map((d: any) => d.id);
    expect(new Set(all).size).toBe(all.length);
    expect([...all].sort()).toEqual([...live].sort());
    expect(all).not.toContain("t-del");
    expect(all.length).toBe(8);
  });

  it("(h4) a v5 library runs the v5 to v6 step and splits the same way", async () => {
    const { partitionByHome } = await loadHome();
    expect(typeof partitionByHome).toBe("function");
    const v5 = { ...clone(FIXTURE), schemaVersion: 5 };
    const result = runMigrations(v5, libraryMigrations, CURRENT_LIBRARY_SCHEMA);
    expect(result.schemaVersion).toBe(6);
    expect(result.docs.map((d: any) => d.id)).toEqual(FIXTURE.docs.map((d: any) => d.id));
    const { library, newsroom } = partitionByHome(result.docs);
    expect(library).toEqual(["f-epub", "f-pdf", "f-pdf-arch", "m-drop", "s-sample"]);
    expect(newsroom).toEqual(["u-art", "u-ext", "m-text"]);
  });

  it("(h5) control: the library schema stays at 6", () => {
    expect(CURRENT_LIBRARY_SCHEMA).toBe(6);
  });
});
