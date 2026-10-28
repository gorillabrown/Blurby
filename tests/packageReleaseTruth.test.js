import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(process.cwd());

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

describe("POSTV2 release package truth", () => {
  it("keeps package and lock metadata aligned with the closed Desktop v2 state", () => {
    const pkg = readJson("package.json");
    const lock = readJson("package-lock.json");

    expect(pkg.version).toBe("1.75.1");
    expect(lock.version).toBe(pkg.version);
    expect(lock.packages[""].version).toBe(pkg.version);
  });

  it("packages Python sidecar bridge scripts so packaged engines do not require a dev checkout", () => {
    const pkg = readJson("package.json");

    expect(pkg.build.files).toEqual(expect.arrayContaining([
      "scripts/moss_nano_app_sidecar.py",
      "scripts/pocket_tts_sidecar.py",
    ]));
    expect(pkg.build.asarUnpack).toEqual(expect.arrayContaining([
      "scripts/moss_nano_app_sidecar.py",
      "scripts/pocket_tts_sidecar.py",
    ]));
  });
});
