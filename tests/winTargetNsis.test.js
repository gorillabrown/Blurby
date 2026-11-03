// WIN-TARGET-NSIS-1: package.json builds the full per-architecture NSIS
// installers the release uses, and electron-updater picks each architecture's
// installer from the merged latest.yml (RELEASE_RUNBOOK.md).
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { Provider, parseUpdateInfo, resolveFiles, findFile } = require("electron-updater/out/providers/Provider");

const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
const BASE_URL = new URL("https://github.com/gorillabrown/Blurby/releases/download/t/");

function installerName(arch) {
  return pkg.build.win.artifactName
    .replace("${productName}", pkg.build.productName)
    .replace("${version}", pkg.version)
    .replace("${arch}", arch)
    .replace("${ext}", "exe");
}

function latestYml(archs) {
  const entries = archs.map((a) => `  - url: ${installerName(a)}\n    sha512: "AA=="\n    size: 1\n`).join("");
  return `version: ${pkg.version}\nfiles:\n${entries}path: ${installerName(archs[0])}\nsha512: "AA=="\n`;
}

function pickAs(arch, raw) {
  const info = parseUpdateInfo(raw, "latest.yml", new URL("https://x/latest.yml"));
  const descriptor = Object.getOwnPropertyDescriptor(process, "arch");
  try {
    Object.defineProperty(process, "arch", { ...descriptor, value: arch });
    return findFile(resolveFiles(info, BASE_URL), "exe").info.url;
  } finally {
    Object.defineProperty(process, "arch", descriptor);
  }
}

describe("WIN-TARGET-NSIS-1 release configuration", () => {
  it("(w1) package.json names the full per-architecture NSIS installer and the GitHub feed", () => {
    expect(pkg.build.win.target).toBe("nsis");
    expect(pkg.build.win.artifactName).toBe("${productName}-Setup-${version}-${arch}.${ext}");
    expect(pkg.build.nsis.buildUniversalInstaller).toBe(false);
    expect(pkg.build.publish).toEqual([{ provider: "github", owner: "gorillabrown", repo: "Blurby" }]);
  });

  it("(w2) each architecture picks its own installer from the merged latest.yml", () => {
    const raw = latestYml(["x64", "arm64"]);
    for (const arch of ["x64", "arm64"]) {
      expect(pickAs(arch, raw)).toBe(installerName(arch));
    }
  });

  it("(w3) negative control: arm64 given an x64-only feed falls back to the x64 installer", () => {
    expect(pickAs("arm64", latestYml(["x64"]))).toBe(installerName("x64"));
  });

  it("(w4) Windows reads one latest.yml, so the runbook's merge stays", () => {
    expect(new Provider({ platform: "win32", executor: null }).getDefaultChannelName()).toBe("latest");
  });
});
