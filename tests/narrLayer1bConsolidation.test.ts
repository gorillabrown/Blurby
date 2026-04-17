import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as migrations from "../main/migrations.js";

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, "..", rel), "utf-8");

describe("NARR-LAYER-1B consolidation", () => {
  it("removes narration from ReadingMode union", () => {
    const src = read("src/hooks/useReaderMode.ts");
    expect(src).toContain("type ReadingMode = \"page\" | \"focus\" | \"flow\";");
    expect(src).not.toContain("\"narration\"");
  });

  it("removes narration from shared settings readingMode type", () => {
    const src = read("src/types.ts");
    expect(src).toContain("readingMode: \"focus\" | \"flow\" | \"page\";");
    expect(src).toContain("lastReadingMode: \"focus\" | \"flow\";");
  });

  it("adds isNarrating flag to settings type", () => {
    const src = read("src/types.ts");
    expect(src).toContain("isNarrating: boolean;");
  });

  it("includes isNarrating in default settings", () => {
    const src = read("src/constants.ts");
    expect(src).toContain("isNarrating: false,");
  });

  it("includes isNarrating in test harness defaults", () => {
    const src = read("src/test-harness/electron-api-stub.ts");
    expect(src).toContain("isNarrating: false,");
  });

  it("deletes NarrateMode implementation file", () => {
    const file = path.resolve(__dirname, "..", "src/modes/NarrateMode.ts");
    expect(fs.existsSync(file)).toBe(false);
  });

  it("removes NarrateMode export from modes barrel", () => {
    const src = read("src/modes/index.ts");
    expect(src).not.toContain("NarrateMode");
  });

  it("ModeType excludes narration", () => {
    const src = read("src/modes/ModeInterface.ts");
    expect(src).toContain("export type ModeType = \"page\" | \"focus\" | \"flow\";");
    expect(src).not.toContain("\"narration\"");
  });

  it("reading mode instance only supports page/focus/flow", () => {
    const src = read("src/hooks/useReadingModeInstance.ts");
    expect(src).toContain('case "page":');
    expect(src).toContain('case "focus":');
    expect(src).toContain('case "flow":');
    expect(src).not.toContain('case "narration"');
  });

  it("pending resume in mode instance is flow-only", () => {
    const src = read("src/hooks/useReadingModeInstance.ts");
    expect(src).toContain("mode: \"flow\"");
    expect(src).not.toContain("mode: \"narration\"");
  });

  it("FoliatePageView no longer renders narration overlay node", () => {
    const src = read("src/components/FoliatePageView.tsx");
    expect(src).not.toContain("foliate-narration-highlight");
    expect(src).not.toContain("highlightRef");
  });

  it("FoliatePageView highlight API styleHint is flow-only", () => {
    const src = read("src/components/FoliatePageView.tsx");
    expect(src).toContain("highlightWordByIndex: (wordIndex: number, styleHint?: \"flow\") => boolean;");
  });

  it("ReaderContainer computes narration-selected from flow + isNarrating", () => {
    const src = read("src/components/ReaderContainer.tsx");
    expect(src).toContain("(readingMode === \"flow\" && isNarrating)");
    expect(src).toContain("(readingMode === \"page\" && settings.isNarrating === true)");
  });

  it("ReaderBottomBar computes narration-selected from flow + isNarrating", () => {
    const src = read("src/components/ReaderBottomBar.tsx");
    expect(src).toContain("const isNarrationSelected = readingMode === \"flow\" && isNarrating;");
  });

  it("DocumentLifecycle accepts isNarrating", () => {
    const src = read("src/hooks/useDocumentLifecycle.ts");
    expect(src).toContain("isNarrating: boolean;");
  });

  it("FoliateSync accepts isNarrating", () => {
    const src = read("src/hooks/useFoliateSync.ts");
    expect(src).toContain("isNarrating: boolean;");
  });

  it("NarrationCaching accepts isNarrating", () => {
    const src = read("src/hooks/useNarrationCaching.ts");
    expect(src).toContain("isNarrating: boolean;");
  });

  it("removes narration overlay CSS selector", () => {
    const css = read("src/styles/page-reader.css");
    expect(css).not.toContain(".foliate-narration-highlight");
  });

  it("bumps settings schema to 8", () => {
    expect(migrations.CURRENT_SETTINGS_SCHEMA).toBe(8);
  });

  it("migration maps readingMode narration -> flow + isNarrating true", () => {
    const data = { schemaVersion: 7, readingMode: "narration", lastReadingMode: "focus" };
    const migrated = migrations.runMigrations(data, migrations.settingsMigrations, migrations.CURRENT_SETTINGS_SCHEMA);
    expect(migrated.readingMode).toBe("flow");
    expect(migrated.isNarrating).toBe(true);
  });

  it("migration maps lastReadingMode narration -> flow", () => {
    const data = { schemaVersion: 7, readingMode: "page", lastReadingMode: "narration" };
    const migrated = migrations.runMigrations(data, migrations.settingsMigrations, migrations.CURRENT_SETTINGS_SCHEMA);
    expect(migrated.lastReadingMode).toBe("flow");
  });

  it("migration adds isNarrating false when missing", () => {
    const data = { schemaVersion: 7, readingMode: "flow", lastReadingMode: "flow" };
    const migrated = migrations.runMigrations(data, migrations.settingsMigrations, migrations.CURRENT_SETTINGS_SCHEMA);
    expect(migrated.isNarrating).toBe(false);
  });

  it("migration preserves existing isNarrating false", () => {
    const data = { schemaVersion: 7, readingMode: "flow", lastReadingMode: "focus", isNarrating: false };
    const migrated = migrations.runMigrations(data, migrations.settingsMigrations, migrations.CURRENT_SETTINGS_SCHEMA);
    expect(migrated.isNarrating).toBe(false);
  });

  it("migration preserves non-narration readingMode", () => {
    const data = { schemaVersion: 7, readingMode: "page", lastReadingMode: "focus" };
    const migrated = migrations.runMigrations(data, migrations.settingsMigrations, migrations.CURRENT_SETTINGS_SCHEMA);
    expect(migrated.readingMode).toBe("page");
  });
});
