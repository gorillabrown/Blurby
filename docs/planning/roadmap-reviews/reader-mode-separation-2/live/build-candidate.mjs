#!/usr/bin/env node
// Test-only G6 candidate build archiver (READER-MODE-SEPARATION-2, design §D.7 R1).
// Builds the renderer from W's exact HEAD into a fresh archive and records its manifest. Never writes W/dist.
//   node docs/planning/roadmap-reviews/reader-mode-separation-2/live/build-candidate.mjs
// Archive layout (decision: the manifest must not hash itself, and the validator re-hashes build.dir whole):
//   C:\Projects\Blurby-artifacts\rms2-candidate-<sha12>\dist\               <- served build (live-qa.json build.dir)
//   C:\Projects\Blurby-artifacts\rms2-candidate-<sha12>\candidate-build.json <- manifest
// buildManifestSha256 = sha256(JSON.stringify(buildFiles)), buildFiles = [{path, sha256, bytes}] sorted by
// path.localeCompare — the same algorithm as scripts/check_reader_mode_evidence.mjs buildManifestSha256().
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const W = "C:/Projects/Blurby/.worktrees/reader-mode-separation-2";
const ARTIFACTS = "C:/Projects/Blurby-artifacts";
const PRODUCTION_PATHS = ["src", "main", "main.js", "preload.js", "package.json", "package-lock.json", "index.html", "public", "resources", "scripts", "vite.config.js", "tsconfig.json"];
const VITE_CONSUMED = ["src", "public", "index.html"]; // ignored files here would reach the bundle

const sha = (b) => createHash("sha256").update(b).digest("hex");
const git = (...a) => execFileSync("git", a, { cwd: W, encoding: "utf8", windowsHide: true }).trim();
const refuse = (msg) => { console.error(`REFUSED: ${msg}`); process.exit(1); };

function hashBuild(dir) {
  const files = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isSymbolicLink()) throw new Error(`symlink in build: ${p}`);
      if (e.isDirectory()) walk(p);
      else if (e.isFile()) { const bytes = fs.readFileSync(p); files.push({ path: path.relative(dir, p).replaceAll(path.sep, "/"), sha256: sha(bytes), bytes: bytes.length }); }
    }
  };
  walk(dir);
  files.sort((a, b) => a.path.localeCompare(b.path));
  return { buildFiles: files, buildManifestSha256: sha(JSON.stringify(files)) };
}

function productionDirt() {
  const changed = git("diff", "--name-only", "HEAD", "--", ...PRODUCTION_PATHS);
  const untracked = git("ls-files", "--others", "--exclude-standard", "--", ...PRODUCTION_PATHS);
  const ignored = git("ls-files", "--others", "--ignored", "--exclude-standard", "--", ...VITE_CONSUMED);
  return [changed && `modified vs HEAD:\n${changed}`, untracked && `untracked:\n${untracked}`, ignored && `ignored files in vite inputs:\n${ignored}`].filter(Boolean);
}

function main() {
  if (path.resolve(process.cwd()).toLowerCase() !== path.resolve(W).toLowerCase()) refuse(`run from ${W}`);
  let head;
  try { head = git("rev-parse", "--verify", "HEAD^{commit}"); } catch { refuse("HEAD does not resolve"); }
  if (!/^[0-9a-f]{40}$/.test(head)) refuse(`unexpected HEAD ${head}`);
  const dirtBefore = productionDirt();
  if (dirtBefore.length) refuse(`production inputs are not clean vs HEAD ${head}\n${dirtBefore.join("\n")}`);
  const archive = path.join(ARTIFACTS, `rms2-candidate-${head.slice(0, 12)}`);
  if (fs.existsSync(archive)) refuse(`archive already exists: ${archive}`);
  const tmp = path.join(ARTIFACTS, `.rms2-candidate-${head.slice(0, 12)}-tmp-${Date.now()}`); // same volume -> atomic rename
  const startedAtUtc = new Date().toISOString();
  execFileSync(process.execPath, [path.join(W, "node_modules/vite/bin/vite.js"), "build", "--outDir", tmp, "--emptyOutDir"], { cwd: W, stdio: "inherit", windowsHide: true });
  // A concurrent edit during the build would make the bundle differ from HEAD: re-check before archiving.
  const headAfter = git("rev-parse", "HEAD");
  const dirtAfter = productionDirt();
  if (headAfter !== head || dirtAfter.length) refuse(`inputs changed during the build (HEAD ${head} -> ${headAfter}); temp build left at ${tmp}\n${dirtAfter.join("\n")}`);
  const built = hashBuild(tmp);
  if (!built.buildFiles.some((f) => f.path === "index.html")) refuse(`build lacks index.html: ${tmp}`);
  fs.mkdirSync(archive);
  fs.renameSync(tmp, path.join(archive, "dist"));
  const served = hashBuild(path.join(archive, "dist"));
  if (served.buildManifestSha256 !== built.buildManifestSha256) refuse("archive hash differs from the temp build after the move");
  const manifest = {
    schemaVersion: 1,
    sprintCode: "READER-MODE-SEPARATION-2",
    identity: "G6 candidate build",
    candidate: head,
    sourceTree: git("rev-parse", "HEAD^{tree}"),
    productionPaths: PRODUCTION_PATHS,
    productionInputsCleanVsHead: true,
    command: "node node_modules/vite/bin/vite.js build --outDir <tmp> --emptyOutDir (cwd W); moved to <archive>/dist",
    toolchain: { node: process.version, vite: JSON.parse(fs.readFileSync(path.join(W, "node_modules/vite/package.json"), "utf8")).version },
    startedAtUtc, builtAtUtc: new Date().toISOString(),
    buildDir: path.join(archive, "dist"),
    buildManifestAlgorithm: "sha256(JSON.stringify([{path,sha256,bytes}] sorted by path.localeCompare)) — scripts/check_reader_mode_evidence.mjs buildManifestSha256",
    buildManifestSha256: served.buildManifestSha256,
    buildFiles: served.buildFiles,
  };
  fs.writeFileSync(path.join(archive, "candidate-build.json"), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify({ archive, buildDir: manifest.buildDir, candidate: head, files: served.buildFiles.length, buildManifestSha256: served.buildManifestSha256 }, null, 2));
}

main();
