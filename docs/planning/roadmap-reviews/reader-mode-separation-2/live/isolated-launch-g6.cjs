"use strict";
// Test-only G6 bootstrap (fork of admission/isolated-launch.cjs). Run with the target root's electron.exe, cwd = root:
//   electron.exe <W>/docs/.../live/isolated-launch-g6.cjs --target=b0|candidate [--candidate=<40-hex>]
//     --profile=<TEMP>/blurby-reader-mode-separation-2-g6-<id> --build-dir=<served build> [--cdp-port=9335] [--seed-kokoro=1]
// Vite preview must already serve --build-dir on localhost:5173. Every path is set before the root's main.js loads.
// Targets (allowlist; the app root is never taken from the command line):
//   b0        root C:/Projects/Blurby-artifacts/rms2-b0-checkout, HEAD == PIN, src/main/main.js/preload.js/package.json
//             clean vs HEAD; build == admission/baseline-build-rebuild.json file by file.
//   candidate root W, --candidate == HEAD, every production input clean vs HEAD (incl. untracked); build ==
//             <build-dir>/../candidate-build.json file by file (written by live/build-candidate.mjs).
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");

const ROOTS = { b0: "C:/Projects/Blurby-artifacts/rms2-b0-checkout", candidate: "C:/Projects/Blurby/.worktrees/reader-mode-separation-2" };
const PIN = "1e5485c66e547392e7752240df71700267e8ede7";
const PRODUCTION_PATHS = ["src", "main", "main.js", "preload.js", "package.json", "package-lock.json", "index.html", "public", "resources", "scripts", "vite.config.js", "tsconfig.json"];
const B0_CLEAN_PATHS = ["src", "main", "main.js", "preload.js", "package.json"];
const ADMISSION = path.join(__dirname, "..", "admission");
const samePath = (a, b) => path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();
const arg = (name) => process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3);
const sha = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
function refuse(message) { console.error(`[G6 launch REFUSED] ${message}`); process.exit(3); }

// ---- every refusal below happens before electron's app object is touched ----
const target = arg("target");
if (!Object.hasOwn(ROOTS, target)) refuse(`--target must be b0 or candidate (got ${target})`);
const EXPECTED_ROOT = ROOTS[target];
if (!samePath(process.cwd(), EXPECTED_ROOT)) refuse(`working directory ${process.cwd()} is not the ${target} root ${EXPECTED_ROOT}`);
const ROOT = fs.realpathSync(EXPECTED_ROOT);
const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", windowsHide: true }).trim();

const profileArg = arg("profile");
if (!profileArg || !path.isAbsolute(profileArg)) refuse("an explicit absolute --profile is required");
const temp = fs.realpathSync(os.tmpdir());
const profile = path.resolve(profileArg);
if (!samePath(path.dirname(profile), temp) || !/^blurby-reader-mode-separation-2-g6-[a-z0-9-]+$/i.test(path.basename(profile))) {
  refuse("profile must be a direct child of TEMP named blurby-reader-mode-separation-2-g6-<id>");
}
if (fs.existsSync(profile)) refuse(`profile already exists (fresh profiles only): ${profile}`);
const port = Number(arg("cdp-port") || 9335);
if (!Number.isInteger(port) || port < 1024 || port > 65535) refuse("invalid --cdp-port");

const buildArg = arg("build-dir");
if (!buildArg || !path.isAbsolute(buildArg)) refuse("an explicit absolute --build-dir is required");
const buildDir = fs.realpathSync(buildArg);
const buildFiles = [];
(function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) refuse("build may not contain symlinks");
    if (entry.isDirectory()) collect(absolute);
    else if (entry.isFile()) { const bytes = fs.readFileSync(absolute); buildFiles.push({ path: path.relative(buildDir, absolute).replaceAll(path.sep, "/"), sha256: sha(bytes), bytes: bytes.length }); }
  }
})(buildDir);
buildFiles.sort((a, b) => a.path.localeCompare(b.path));
const buildManifestSha256 = sha(JSON.stringify(buildFiles));
function assertBuildEquals(expectedFiles, label) {
  if (buildFiles.length !== expectedFiles.length) refuse(`${label} file count mismatch: served ${buildFiles.length} vs manifest ${expectedFiles.length}`);
  for (const expected of expectedFiles) {
    const entry = buildFiles.find((item) => item.path === expected.path);
    if (!entry || entry.sha256 !== expected.sha256 || entry.bytes !== expected.bytes) refuse(`${label} build mismatch: ${expected.path}`);
  }
}

let head, candidate = null, buildManifestSource;
try { head = git("rev-parse", "HEAD"); } catch { refuse("HEAD does not resolve"); }
if (target === "b0") {
  if (head !== PIN) refuse(`b0 root HEAD ${head} != ${PIN}`);
  if (git("diff", "--name-only", "HEAD", "--", ...B0_CLEAN_PATHS) || git("ls-files", "--others", "--exclude-standard", "--", ...B0_CLEAN_PATHS)) refuse("b0 production inputs differ from HEAD");
  const b0 = JSON.parse(fs.readFileSync(path.join(ADMISSION, "baseline-build-rebuild.json"), "utf8"));
  if (b0.sourceCommit !== PIN) refuse("B0 rebuild manifest names an unexpected source commit");
  assertBuildEquals(b0.files, "B0");
  buildManifestSource = "admission/baseline-build-rebuild.json";
} else {
  candidate = arg("candidate");
  if (!/^[0-9a-f]{40}$/.test(candidate || "")) refuse("--candidate=<full 40-hex sha> is required for target candidate");
  if (candidate !== head) refuse(`--candidate ${candidate} != W HEAD ${head}`);
  const changed = git("diff", "--name-only", "HEAD", "--", ...PRODUCTION_PATHS);
  const untracked = git("ls-files", "--others", "--exclude-standard", "--", ...PRODUCTION_PATHS);
  if (changed || untracked) refuse(`candidate production inputs are not clean vs HEAD:\n${[changed, untracked].filter(Boolean).join("\n")}`);
  const manifestPath = path.join(buildDir, "..", "candidate-build.json");
  if (!fs.existsSync(manifestPath)) refuse(`no candidate-build.json beside the served build: ${manifestPath}`);
  const cb = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (cb.candidate !== candidate) refuse(`candidate-build.json was built from ${cb.candidate}, not ${candidate}`);
  if (cb.buildManifestSha256 !== sha(JSON.stringify(cb.buildFiles))) refuse("candidate-build.json is internally inconsistent");
  assertBuildEquals(cb.buildFiles, "candidate");
  if (buildManifestSha256 !== cb.buildManifestSha256) refuse("candidate build manifest sha mismatch");
  buildManifestSource = manifestPath;
}
if (!buildFiles.some((entry) => entry.path === "index.html")) refuse("build lacks index.html");
const sourceEntries = git("ls-tree", "-r", "-z", "HEAD", "--", ...PRODUCTION_PATHS).split("\0").filter(Boolean).map((entry) => {
  const [metadata, relativePath] = entry.split("\t");
  const [mode, type, object] = metadata.split(" ");
  if (type !== "blob" || mode === "120000") refuse(`unexpected source entry: ${entry}`);
  return { path: relativePath, gitBlob: object };
});

// ---- isolation: identical to the admission launcher ----
const { app, session } = require("electron");
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
process.env.BLURBY_TTS_EVAL_TRACE_CONFIG = JSON.stringify({ enabled: true, runId, scenarioId: "g6-live-qa", fixture: { id: "g0-public-fixtures", title: "G0 public fixtures", sourceType: "prose", expectedCoverage: [] } });
const manifestPath = path.join(profile, "isolation.json");
const manifest = {
  schemaVersion: 1, harness: "g6", runId, launchedAt: new Date().toISOString(), pid: process.pid,
  target, appRoot: ROOT, head, candidate, pinnedB0: PIN,
  productionInputsClean: true, productionFileCount: sourceEntries.length, sourceManifestSha256: sha(JSON.stringify(sourceEntries)),
  buildDir, buildManifestSource, buildFiles, buildManifestSha256,
  profile, originalUserData, resolvedPaths: assertIsolation(), cdpPort: port,
  runtime: process.versions, viewport: { width: 1100, height: 800 }, fixtures: [],
  heardAudio: "NOT OBSERVED by this harness; renderer events are not audible evidence",
};
const saveManifest = () => fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
const event = (kind, data = {}) => fs.appendFileSync(path.join(profile, "main-events.ndjson"), JSON.stringify({ at: new Date().toISOString(), kind, ...data }) + "\n");
saveManifest();
console.log("[G6 isolation before main] " + JSON.stringify({ target, profile, paths: manifest.resolvedPaths, head, buildManifestSha256 }));
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
    const identity = { runId, target, head, profile, pid: process.pid, paths: assertIsolation(), buildManifestSha256 };
    try {
      // Read-only test identity; does not modify application state or production files.
      const readback = await win.webContents.executeJavaScript(`(() => { Object.defineProperty(window, '__BLURBY_G6_IDENTITY__', { value: Object.freeze(${JSON.stringify(identity)}), configurable: false }); return JSON.stringify(window.__BLURBY_G6_IDENTITY__); })()`);
      if (readback !== JSON.stringify(identity)) throw new Error("Renderer identity readback mismatch");
      manifest.rendererIdentityReadback = JSON.parse(readback);
      manifest.rendererIdentityInstalledAt = new Date().toISOString();
      manifest.windowBounds = win.getBounds();
      manifest.contentBounds = win.getContentBounds();
      saveManifest();
      event("renderer-ready", { url: win.webContents.getURL(), contentBounds: manifest.contentBounds });
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
  console.log("[G6 ready isolation verified] " + JSON.stringify({ paths: resolved(), storagePath }));
});
async function launch() {
  const dataDir = path.join(userData, "blurby-data");
  const fixtureDir = path.join(dataDir, "admission-fixtures");
  fs.mkdirSync(fixtureDir, { recursive: true });
  const epubPath = path.join(fixtureDir, "sample-meditations.epub");
  fs.copyFileSync(path.join(ROOT, "resources", "sample-meditations.epub"), epubPath);
  const { extractContent, countWords } = require(path.join(ROOT, "main", "file-parsers.js"));
  const sampleContent = await extractContent(epubPath);
  if (typeof sampleContent !== "string" || !sampleContent.trim()) throw new Error("Bundled EPUB extraction failed");
  const now = Date.now();
  // Non-EPUB sources are converted imports, as in A3. main/epub-converter.js output is not byte-deterministic
  // (random dc:identifier urn:uuid + zip mtimes), so re-converting can never reproduce g0-matrix.json's document
  // hashes (validator R2). G6 seeds the exact A3 converted bytes (live/fixtures/, copied from the A3 matrix profile)
  // and refuses unless they equal g0-matrix.json documents[].sha256.
  const g0Docs = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ADMISSION, "g0-matrix.json"), "utf8")).documents.map((d) => [d.id, d]));
  const converted = [];
  fs.mkdirSync(path.join(dataDir, "converted"), { recursive: true });
  for (const [id, title, file] of [["g0-converted-text", "G0 Converted Plain Text", "fixture.txt"], ["g0-converted-chapters", "G0 Converted Two Chapters", "fixture-chapters.txt"]]) {
    const source = path.join(fixtureDir, file);
    fs.copyFileSync(path.join(ADMISSION, file), source);
    if (sha(fs.readFileSync(source)) !== g0Docs[id].sourceSha256) throw new Error(`Fixture source differs from g0-matrix.json: ${file}`);
    const epubPath = path.join(dataDir, "converted", `${id}.epub`);
    fs.copyFileSync(path.join(__dirname, "fixtures", `${id}.epub`), epubPath);
    if (sha(fs.readFileSync(epubPath)) !== g0Docs[id].sha256) throw new Error(`Seeded converted EPUB differs from g0-matrix.json: ${id}`);
    converted.push({ id, title, file, source, epubPath, chapterCount: g0Docs[id].chapterCount, wordCount: countWords(await extractContent(source)) });
  }
  if (sha(fs.readFileSync(epubPath)) !== g0Docs["g0-public-epub"].sha256) throw new Error("Bundled EPUB differs from g0-matrix.json");
  // G6 addition: every fixture is queued so a book end has a next book (narrate-book-transition).
  // Queue order text(0) -> chapters(1) -> epub(2); getNextQueuedBook picks the lowest other position.
  const queuePosition = { "g0-converted-text": 0, "g0-converted-chapters": 1, "g0-public-epub": 2 };
  const docs = [
    { id: "g0-public-epub", title: "G0 Bundled Meditations", filepath: epubPath, ext: ".epub", filename: "sample-meditations.epub", size: fs.statSync(epubPath).size, author: "Marcus Aurelius", wordCount: countWords(sampleContent), source: "file", position: 0, created: now, modified: now, lastReadAt: null, queuePosition: queuePosition["g0-public-epub"] },
    ...converted.map((c) => ({ id: c.id, title: c.title, filepath: c.epubPath, convertedEpubPath: c.epubPath, originalFilepath: c.source, ext: ".epub", filename: path.basename(c.epubPath), size: fs.statSync(c.epubPath).size, author: "G0 Fixture", wordCount: c.wordCount, source: "manual", position: 0, created: now, modified: now, coverPath: null, lastReadAt: null, unread: true, tags: [], deleted: false, queuePosition: queuePosition[c.id] })),
  ];
  if (arg("seed-kokoro") === "1") {
    // Test-only: copy the installed model (read-only source) so a fresh profile does not download it.
    const modelRel = path.join("models", "onnx-community", "Kokoro-82M-v1.0-ONNX");
    const seedFrom = path.join(app.getPath("appData"), "blurby", modelRel);
    fs.cpSync(seedFrom, path.join(userData, modelRel), { recursive: true, errorOnExist: true });
    manifest.kokoroSeed = { from: seedFrom, files: fs.readdirSync(path.join(userData, modelRel), { recursive: true }).map(String).sort() };
  }
  fs.writeFileSync(path.join(dataDir, "library.json"), JSON.stringify({ schemaVersion: 6, docs }, null, 2));
  fs.writeFileSync(path.join(dataDir, "settings.json"), JSON.stringify({ schemaVersion: 12, firstRunCompleted: true, readingMode: "page", lastReadingMode: "flow", wpm: 250, ttsRate: 1, ttsEngine: "kokoro", ttsEnabled: false, sourceFolder: null, recentFolders: [] }, null, 2));
  manifest.queueSeed = queuePosition;
  manifest.fixtures = [
    { id: docs[0].id, title: docs[0].title, documentKind: "epub", path: epubPath, source: "resources/sample-meditations.epub", sha256: sha(fs.readFileSync(epubPath)), wordCount: docs[0].wordCount, initialPosition: 0, kind: "native-epub" },
    ...converted.map((c) => ({ id: c.id, title: c.title, documentKind: "non-epub", path: c.epubPath, source: `admission/${c.file}`, seededFrom: `live/fixtures/${c.id}.epub (A3 converted bytes)`, sourceSha256: sha(fs.readFileSync(c.source)), sha256: sha(fs.readFileSync(c.epubPath)), chapterCount: c.chapterCount, wordCount: c.wordCount, initialPosition: 0, kind: "converted-import-non-epub-source" })),
  ];
  saveManifest();
  assertIsolation();
  require(path.join(ROOT, "main.js"));
}
launch().catch((error) => { event("bootstrap-failure", { message: error.stack }); console.error(error); app.exit(2); });
