import { createRequire } from "module";
import { describe, expect, it } from "vitest";

// RC-INTEGRATION-WINDOW, ruling R4 (Brain1, 2026-11-03): BAND-ALIGN-2's v13 -> v14 runs first, then EINK-CONTROLS-1's
// v14 -> v15. Positive control: on a candidate with EINK-CONTROLS-1 still at v14, (a) and (d) fail.

const require = createRequire(import.meta.url);
const migrations = require("../main/migrations.js");
const { CURRENT_SETTINGS_SCHEMA, settingsMigrations, runMigrations } = migrations;

const upgrade = (data) => runMigrations(data, settingsMigrations, CURRENT_SETTINGS_SCHEMA);

describe("settings migration v13 → v15 (BAND-ALIGN-2 then EINK-CONTROLS-1)", () => {
  it("(a) a v13 E-ink profile with a line count gets the band switch and the E-ink switch", () => {
    expect(upgrade({ schemaVersion: 13, theme: "eink", flowZoneLines: 3 })).toEqual({
      schemaVersion: 15, theme: "light", einkMode: true, flowBandEnabled: true,
    });
    expect(upgrade({ schemaVersion: 13, theme: "eink", flowZoneLines: 0 })).toEqual({
      schemaVersion: 15, theme: "light", einkMode: true, flowBandEnabled: false,
    });
  });

  it("(b) a v14 E-ink profile gets only the E-ink fold", () => {
    expect(upgrade({ schemaVersion: 14, theme: "eink", flowBandEnabled: false })).toEqual({
      schemaVersion: 15, theme: "light", einkMode: true, flowBandEnabled: false,
    });
  });

  it("(c) a v15 profile is left as it is", () => {
    const v15 = { schemaVersion: 15, theme: "dark", einkMode: true, flowBandEnabled: true };
    expect(upgrade({ ...v15 })).toEqual(v15);
  });

  it("(d) the schema is 15, with 15 settings migrations", () => {
    expect(CURRENT_SETTINGS_SCHEMA).toBe(15);
    expect(settingsMigrations.length).toBe(15);
  });
});
