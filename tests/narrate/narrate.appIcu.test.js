// NARRATE-REBUILD-1 P6b — the epic's checkers refuse plain Node (exit 3): book words come from Intl.Segmenter, whose ICU
// differs by runtime, so a checker under plain Node numbers words differently from the app (S5's D2 run: word 2963 was
// "ancient" to the checker and "the" to the app). This suite runs under plain Node, so it is itself the refusal control.
import path from "path";
import { spawnSync } from "child_process";
import { createRequire } from "module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(__dirname, "../..");
const { checkAppIcu, APP_ELECTRON } = require("../../scripts/narrate-rebuild/lib/app-icu.cjs");

describe("app ICU guard (P6b)", () => {
  it("accepts only the app's own Electron binary running as Node", () => {
    expect(checkAppIcu({ versions: { node: "24.14.0", icu: "78.2" }, execPath: process.execPath })).toMatch(/^plain Node 24\.14\.0 \(ICU 78\.2\)/);
    expect(checkAppIcu({ versions: { electron: "41.10.7", icu: "77.1" }, execPath: path.join(ROOT, "other", "electron.exe") })).toMatch(/is not the app's binary/);
    expect(checkAppIcu({ versions: { electron: "41.10.7", icu: "77.1" }, execPath: APP_ELECTRON })).toBeNull();
  });

  it.each([
    ["reconcile-sweep.mjs", ["--gate"]],
    ["d2-crossing-check.cjs", ["x.json", "1", "a", "2", "b"]],
    ["p5-recorded-output-check.mjs", ["x.json"]],
    ["p0-summary.mjs", []],
  ])("%s refuses plain Node with exit 3 before doing any work", (script, args) => {
    const r = spawnSync(process.execPath, [path.join(ROOT, "scripts/narrate-rebuild", script), ...args], { cwd: ROOT, encoding: "utf8", timeout: 60_000 });
    expect(r.status).toBe(3);
    expect(r.stderr).toMatch(/^refused: plain Node/m);
  });
});
