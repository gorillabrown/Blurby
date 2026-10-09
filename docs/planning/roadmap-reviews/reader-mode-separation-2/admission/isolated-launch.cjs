"use strict";
// Test-only bootstrap. Run from the exact worktree with Electron, never Node.
// electron.exe <this file> --profile=<fresh TEMP/blurby-reader-mode-separation-2-a1-...> --cdp-port=9335 --build-dir=<preserved dist archive>
// Vite preview must already serve the independent preserved build on localhost:5173.
const path = require("node:path");
const EXPECTED_ROOT = "C:/Projects/Blurby/.worktrees/reader-mode-separation-2";
const samePath = (a, b) => path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();
if (!samePath(process.cwd(), EXPECTED_ROOT)) throw new Error("Refusing unexpected working directory");
const fs = require("node:fs");
const os = require("node:os");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const { app, session } = require("electron");
const PIN = "1e5485c66e547392e7752240df71700267e8ede7";
const ROOT = fs.realpathSync(EXPECTED_ROOT);
const arg = (name) => process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3);
const profileArg = arg("profile");
if (!profileArg || !path.isAbsolute(profileArg)) throw new Error("An explicit absolute --profile is required");
const temp = fs.realpathSync(os.tmpdir());
const profile = path.resolve(profileArg);
if (!samePath(path.dirname(profile), temp) || !/^blurby-reader-mode-separation-2-a1-[a-z0-9-]+$/i.test(path.basename(profile))) {
  throw new Error("Profile must be a fresh direct child of TEMP with the admission prefix");
}
if (fs.existsSync(profile)) throw new Error(`Refusing existing profile: ${profile}`);
const port = Number(arg("cdp-port") || 9335);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid CDP port");
const sha = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const buildArg = arg("build-dir");
if (!buildArg || !path.isAbsolute(buildArg)) throw new Error("Explicit absolute --build-dir is required");
const buildDir = fs.realpathSync(buildArg);
const buildFiles = [];
function collectBuild(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error("Build archive may not contain symlinks");
    if (entry.isDirectory()) collectBuild(absolute);
    else if (entry.isFile()) buildFiles.push({ path: path.relative(buildDir, absolute).replaceAll(path.sep, "/"), sha256: sha(fs.readFileSync(absolute)), bytes: fs.statSync(absolute).size });
  }
}
collectBuild(buildDir);
buildFiles.sort((a, b) => a.path.localeCompare(b.path));
if (!buildFiles.some((entry) => entry.path === "index.html")) throw new Error("Build archive lacks index.html");
// B0 (2026-10-09 rebuild policy): the served build must equal the rebuild manifest exactly.
const b0 = JSON.parse(fs.readFileSync(path.join(__dirname, "baseline-build-rebuild.json"), "utf8"));
if (b0.sourceCommit !== "1e5485c66e547392e7752240df71700267e8ede7") throw new Error("B0 manifest names an unexpected source commit");
if (buildFiles.length !== b0.files.length) throw new Error(`B0 file count mismatch: ${buildFiles.length} vs ${b0.files.length}`);
for (const expected of b0.files) {
  const entry = buildFiles.find((item) => item.path === expected.path);
  if (!entry || entry.sha256 !== expected.sha256) throw new Error(`B0 build hash mismatch: ${expected.path}`);
}
const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", windowsHide: true }).trim();
const head = git("rev-parse", "HEAD");
git("merge-base", "--is-ancestor", PIN, head);
// Evidence-only descendant commits are allowed; all tracked production inputs must match PIN.
const productionPaths = ["src", "main", "main.js", "preload.js", "package.json", "package-lock.json", "index.html", "public", "resources", "scripts", "vite.config.js", "tsconfig.json"];
git("diff", "--exit-code", "--quiet", PIN, "--", ...productionPaths);
if (git("ls-files", "--others", "--exclude-standard", "--", ...productionPaths)) throw new Error("Untracked production inputs present");
const sourceEntries = git("ls-tree", "-r", "-z", PIN, "--", ...productionPaths).split("\0").filter(Boolean).map((entry) => {
  const [metadata, relativePath] = entry.split("\t");
  const [mode, type, object] = metadata.split(" ");
  if (type !== "blob" || mode === "120000") throw new Error(`Unexpected source entry: ${entry}`);
  return { path: relativePath, gitBlob: object, sha256: sha(fs.readFileSync(path.join(ROOT, relativePath))) };
});
const userData = path.join(profile, "userData");
const sessionData = path.join(profile, "sessionData");
const logs = path.join(profile, "logs");
const crashDumps = path.join(profile, "crashDumps");
const originalUserData = app.getPath("userData");
for (const directory of [userData, sessionData, logs, crashDumps]) fs.mkdirSync(directory, { recursive: true });
app.setPath("userData", userData);
app.setPath("sessionData", sessionData);
app.setPath("logs", logs);
app.setPath("crashDumps", crashDumps);
app.setAppPath(ROOT);
app.commandLine.appendSwitch("remote-debugging-address", "127.0.0.1");
app.commandLine.appendSwitch("remote-debugging-port", String(port));
const resolved = () => Object.fromEntries(["userData", "sessionData", "logs", "crashDumps"].map((key) => [key, app.getPath(key)]));
function assertIsolation() {
  const actual = resolved();
  for (const [key, expected] of Object.entries({ userData, sessionData, logs, crashDumps })) {
    if (!samePath(actual[key], expected) || samePath(actual[key], originalUserData)) throw new Error(`Isolation mismatch: ${key}`);
  }
  return actual;
}
const runId = path.basename(profile);
process.env.BLURBY_TTS_EVAL_TRACE_DIR = path.join(profile, "existing-trace");
process.env.BLURBY_TTS_EVAL_TRACE_CONFIG = JSON.stringify({ enabled: true, runId, scenarioId: "g0-independent-baseline", fixture: { id: "g0-public-fixtures", title: "G0 public fixtures", sourceType: "prose", expectedCoverage: [] } });
const manifestPath = path.join(profile, "isolation.json");
const manifest = {
  schemaVersion: 1, runId, launchedAt: new Date().toISOString(), pid: process.pid,
  appRoot: ROOT, pinnedGovernanceCommit: PIN, actualHead: head,
  productionMatchesPin: true, productionFileCount: sourceEntries.length,
  sourceManifestSha256: sha(JSON.stringify(sourceEntries)), sourceEntries,
  buildDir, buildFiles, buildManifestSha256: sha(JSON.stringify(buildFiles)),
  profile, originalUserData, resolvedPaths: assertIsolation(), cdpPort: port,
  runtime: process.versions, viewport: { width: 1100, height: 800 }, fixtures: [],
  heardAudio: "NOT OBSERVED by this harness; renderer events are not audible evidence",
};
const saveManifest = () => fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
const event = (kind, data = {}) => fs.appendFileSync(path.join(profile, "main-events.ndjson"), JSON.stringify({ at: new Date().toISOString(), kind, ...data }) + "\n");
saveManifest();
console.log("[G0 isolation before main] " + JSON.stringify({ profile, paths: manifest.resolvedPaths, head, pin: PIN, sourceManifestSha256: manifest.sourceManifestSha256 }));
app.on("browser-window-created", (_event, win) => {
  assertIsolation();
  win.setContentSize(1100, 800);
  win.setResizable(false);
  win.setMaximizable(false);
  win.webContents.on("console-message", (_event, detailsOrLevel, message, line, sourceId) => {
    event("console", typeof detailsOrLevel === "object" ? detailsOrLevel : { level: detailsOrLevel, message, line, sourceId });
  });
  win.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => event("did-fail-load", { errorCode, errorDescription, validatedURL }));
  win.webContents.on("render-process-gone", (_event, details) => event("render-process-gone", details));
  win.webContents.on("did-finish-load", async () => {
    const identity = { runId, profile, pid: process.pid, paths: assertIsolation(), sourceManifestSha256: manifest.sourceManifestSha256 };
    try {
      // Read-only test identity; does not modify application state or production files.
      const identityReadbackJson = await win.webContents.executeJavaScript(`(() => { Object.defineProperty(window, '__BLURBY_G0_ADMISSION__', { value: Object.freeze(${JSON.stringify(identity)}), configurable: false }); return JSON.stringify(window.__BLURBY_G0_ADMISSION__); })()`);
      if (identityReadbackJson !== JSON.stringify(identity)) throw new Error("Renderer identity readback mismatch");
      manifest.rendererIdentityReadback = JSON.parse(identityReadbackJson);
      manifest.rendererIdentityInstalledAt = new Date().toISOString();
      manifest.windowBounds = win.getBounds();
      manifest.contentBounds = win.getContentBounds();
      saveManifest();
      event("renderer-ready", { url: win.webContents.getURL(), contentBounds: manifest.contentBounds, identityReadback: manifest.rendererIdentityReadback });
    } catch (error) { event("identity-error", { message: error.message }); }
  });
});
app.whenReady().then(() => {
  assertIsolation();
  const storagePath = session.defaultSession.getStoragePath();
  if (storagePath && !samePath(storagePath, sessionData) && !path.resolve(storagePath).toLowerCase().startsWith(sessionData.toLowerCase() + path.sep)) {
    event("session-isolation-failure", { storagePath });
    app.exit(2);
    return;
  }
  manifest.sessionStoragePath = storagePath;
  manifest.readyIsolationVerifiedAt = new Date().toISOString();
  saveManifest();
  console.log("[G0 ready isolation verified] " + JSON.stringify({ paths: resolved(), storagePath }));
});
async function launch() {
  const dataDir = path.join(userData, "blurby-data");
  const fixtureDir = path.join(dataDir, "admission-fixtures");
  fs.mkdirSync(fixtureDir, { recursive: true });
  const sampleSource = path.join(ROOT, "resources", "sample-meditations.epub");
  const epubPath = path.join(fixtureDir, "sample-meditations.epub");
  const textPath = path.join(fixtureDir, "fixture.txt");
  fs.copyFileSync(sampleSource, epubPath);
  fs.copyFileSync(path.join(__dirname, "fixture.txt"), textPath);
  const textContent = fs.readFileSync(textPath, "utf8");
  const { extractContent, countWords } = require(path.join(ROOT, "main", "file-parsers.js"));
  const sampleContent = await extractContent(epubPath);
  if (typeof sampleContent !== "string" || !sampleContent.trim()) throw new Error("Bundled EPUB extraction failed");
  const now = Date.now();
  const docs = [
    { id: "g0-public-epub", title: "G0 Bundled Meditations", filepath: epubPath, ext: ".epub", filename: "sample-meditations.epub", size: fs.statSync(epubPath).size, author: "Marcus Aurelius", wordCount: countWords(sampleContent), source: "file", position: 0, created: now, modified: now, lastReadAt: null },
    { id: "g0-public-text", title: "G0 Generated Plain Text", content: textContent, wordCount: countWords(textContent), source: "manual", position: 0, created: now, modified: now, revision: 0, lastReadAt: null },
  ];
  fs.writeFileSync(path.join(dataDir, "library.json"), JSON.stringify({ schemaVersion: 6, docs }, null, 2));
  fs.writeFileSync(path.join(dataDir, "settings.json"), JSON.stringify({ schemaVersion: 12, firstRunCompleted: true, readingMode: "page", lastReadingMode: "flow", wpm: 250, ttsRate: 1, ttsEngine: "kokoro", ttsEnabled: false, sourceFolder: null, recentFolders: [] }, null, 2));
  manifest.fixtures = [
    { id: docs[0].id, path: epubPath, source: "resources/sample-meditations.epub", sha256: sha(fs.readFileSync(epubPath)), wordCount: docs[0].wordCount, countAuthority: "existing main/file-parsers.countWords(extractContent)", initialPosition: 0, kind: "native-epub" },
    { id: docs[1].id, path: textPath, source: "admission/fixture.txt", sha256: sha(fs.readFileSync(textPath)), wordCount: docs[1].wordCount, initialPosition: 0, kind: "legacy-inline-content-non-epub", note: "No filepath or convertedEpubPath; deliberately exercises the existing inline text path. Importing a TXT file would convert it to EPUB." },
  ];
  saveManifest();
  assertIsolation();
  require(path.join(ROOT, "main.js"));
}
launch().catch((error) => { event("bootstrap-failure", { message: error.stack }); console.error(error); app.exit(2); });
