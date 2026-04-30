import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const READY = "ready";
const execFileAsync = promisify(execFile);
const SUPPORTED_BACKENDS = new Set(["llama-cpp-onnx", "moss-nano-onnx"]);
const SUPPORTED_DEVICES = new Set(["cpu"]);

function isPresent(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function toIsoString(now) {
  const value = typeof now === "function" ? now() : new Date();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

async function pathExists(fsModule, targetPath) {
  if (!isPresent(targetPath)) return false;
  try {
    await fsModule.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function pathHasType(fsModule, targetPath, expectedType) {
  if (!isPresent(targetPath)) return false;
  try {
    const stats = await fsModule.stat(targetPath);
    return expectedType === "file" ? stats.isFile() : stats.isDirectory();
  } catch {
    return false;
  }
}

async function directorySizeBytes(fsModule, targetPath) {
  if (!isPresent(targetPath)) return 0;
  try {
    const stats = await fsModule.stat(targetPath);
    if (stats.isFile()) return stats.size;
    if (!stats.isDirectory()) return 0;
    const entries = await fsModule.readdir(targetPath, { withFileTypes: true });
    const sizes = await Promise.all(entries.map((entry) => (
      directorySizeBytes(fsModule, path.join(targetPath, entry.name))
    )));
    return sizes.reduce((total, size) => total + size, 0);
  } catch {
    return 0;
  }
}

function makeCheck(key, status, detail) {
  return { key, status, detail };
}

function defaultUserDataPath() {
  if (process.env.APPDATA) {
    return path.join(process.env.APPDATA, "Blurby");
  }
  return null;
}

function mossConfigCandidates({ cwd = process.cwd(), userDataPath, explicitPath } = {}) {
  if (isPresent(explicitPath)) {
    return [path.resolve(cwd, explicitPath)];
  }

  const candidates = [path.join(cwd, ".runtime", "moss", "config.json")];
  const appDataRoot = userDataPath ?? defaultUserDataPath();
  if (isPresent(appDataRoot)) {
    candidates.push(path.join(appDataRoot, "moss", "config.json"));
  }
  return candidates;
}

export function resolveMossConfigPath({ cwd = process.cwd(), userDataPath, explicitPath } = {}) {
  return mossConfigCandidates({ cwd, userDataPath, explicitPath })[0];
}

async function resolveExistingMossConfigPath(options, fsModule) {
  const candidates = mossConfigCandidates(options);
  for (const candidate of candidates) {
    if (await pathExists(fsModule, candidate)) {
      return candidate;
    }
  }
  return candidates[0];
}

export async function readMossConfig(configPath, fsModule = fs) {
  try {
    const raw = await fsModule.readFile(configPath, "utf8");
    const config = JSON.parse(raw);
    if (!isPlainObject(config)) {
      return { config: null, error: "config-invalid" };
    }
    return { config, error: null };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { config: null, error: "config-missing" };
    }
    if (error instanceof SyntaxError) {
      return { config: null, error: "config-invalid" };
    }
    return { config: null, error: "config-invalid", detail: error instanceof Error ? error.message : String(error) };
  }
}

export async function validateMossConfig(config, fsModule = fs) {
  const checks = [];

  const pythonOk = await pathHasType(fsModule, config?.pythonExe, "file");
  checks.push(makeCheck(
    "pythonExe",
    pythonOk ? "pass" : "fail",
    pythonOk ? `Python executable found at ${config.pythonExe}.` : "pythonExe is missing, cannot be accessed, or is not a file.",
  ));
  if (!pythonOk) return { status: "python-missing", checks };

  const repoOk = await pathHasType(fsModule, config?.repoDir, "directory");
  checks.push(makeCheck(
    "repoDir",
    repoOk ? "pass" : "fail",
    repoOk ? `MOSS repository found at ${config.repoDir}.` : "repoDir is missing, cannot be accessed, or is not a directory.",
  ));
  if (!repoOk) return { status: "repo-missing", checks };

  const llamaCppOk = await pathHasType(fsModule, config?.llamaCppDir, "directory");
  checks.push(makeCheck(
    "llamaCppDir",
    llamaCppOk ? "pass" : "fail",
    llamaCppOk ? `llama.cpp directory found at ${config.llamaCppDir}.` : "llamaCppDir is missing, cannot be accessed, or is not a directory.",
  ));
  if (!llamaCppOk) return { status: "llama-cpp-missing", checks };

  const modelOk = await pathHasType(fsModule, config?.modelDir, "directory");
  checks.push(makeCheck(
    "modelDir",
    modelOk ? "pass" : "fail",
    modelOk ? `Model assets found at ${config.modelDir}.` : "modelDir is missing, cannot be accessed, or is not a directory.",
  ));
  if (!modelOk) return { status: "model-assets-missing", checks };

  const tokenizerOk = await pathHasType(fsModule, config?.audioTokenizerDir, "directory");
  checks.push(makeCheck(
    "audioTokenizerDir",
    tokenizerOk ? "pass" : "fail",
    tokenizerOk ? `Audio tokenizer assets found at ${config.audioTokenizerDir}.` : "audioTokenizerDir is missing, cannot be accessed, or is not a directory.",
  ));
  if (!tokenizerOk) return { status: "tokenizer-assets-missing", checks };

  const backendOk = SUPPORTED_BACKENDS.has(config?.backend);
  checks.push(makeCheck(
    "backend",
    backendOk ? "pass" : "fail",
    backendOk ? `Backend ${config.backend} is supported.` : `Backend ${config?.backend ?? "unset"} is not supported.`,
  ));
  if (!backendOk) return { status: "backend-unsupported", checks };

  const deviceOk = SUPPORTED_DEVICES.has(config?.device);
  checks.push(makeCheck(
    "device",
    deviceOk ? "pass" : "fail",
    deviceOk ? `Device ${config.device} is supported.` : `Device ${config?.device ?? "unset"} is not supported.`,
  ));
  if (!deviceOk) return { status: "device-unsupported", checks };

  return {
    status: READY,
    checks: [
      ...checks,
      makeCheck("runtime", "pass", "MOSS runtime preflight passed."),
    ],
  };
}

function configProjectRoot(configPath) {
  const runtimeMossDir = path.join(".runtime", "moss");
  const normalized = path.normalize(configPath);
  const marker = `${path.sep}${runtimeMossDir}${path.sep}`;
  const index = normalized.lastIndexOf(marker);
  if (index >= 0) {
    return normalized.slice(0, index);
  }
  return path.dirname(configPath);
}

async function readJsonIfPresent(fsModule, targetPath) {
  try {
    return JSON.parse(await fsModule.readFile(targetPath, "utf8"));
  } catch {
    return null;
  }
}

function collectPackageResourceAllowlist(packageJson) {
  const allowlist = [];
  const build = isPlainObject(packageJson?.build) ? packageJson.build : {};
  const files = Array.isArray(build.files) ? build.files : [];
  const extraResources = Array.isArray(build.extraResources) ? build.extraResources : [];
  for (const item of files) {
    if (typeof item === "string") allowlist.push(item);
  }
  for (const resource of extraResources) {
    if (typeof resource === "string") {
      allowlist.push(resource);
    } else if (isPlainObject(resource)) {
      if (typeof resource.from === "string") allowlist.push(resource.from);
      if (Array.isArray(resource.filter)) {
        allowlist.push(...resource.filter.filter((item) => typeof item === "string"));
      }
    }
  }
  return allowlist;
}

function normalizeGlobPattern(value) {
  return String(value ?? "").replaceAll("\\", "/").replace(/^\.\//, "").trim();
}

function isRuntimePattern(value) {
  const normalized = normalizeGlobPattern(value).replace(/^!/, "");
  return normalized === ".runtime"
    || normalized === ".runtime/**"
    || normalized.startsWith(".runtime/")
    || normalized === "**/.runtime"
    || normalized === "**/.runtime/**"
    || normalized.includes("/.runtime/");
}

function excludesRuntime(patterns) {
  return patterns.some((pattern) => {
    const normalized = normalizeGlobPattern(pattern);
    return normalized.startsWith("!") && isRuntimePattern(normalized);
  });
}

function isBroadPackagePattern(value) {
  const normalized = normalizeGlobPattern(value);
  return normalized === "."
    || normalized === "**/*"
    || normalized === "**"
    || normalized === "*"
    || normalized === "./**/*";
}

function packageSafeguardsFromPackageJson(packageJson) {
  const build = isPlainObject(packageJson?.build) ? packageJson.build : {};
  const files = Array.isArray(build.files) ? build.files.filter((item) => typeof item === "string") : [];
  const extraResources = Array.isArray(build.extraResources) ? build.extraResources : [];
  const packageResourceAllowlist = collectPackageResourceAllowlist(packageJson);
  const failures = [];
  let runtimeDirPackaged = files.some(isRuntimePattern);
  let broadRuntimeInclude = files.some(isBroadPackagePattern) && !excludesRuntime(files);
  for (const resource of extraResources) {
    if (typeof resource === "string") {
      const from = normalizeGlobPattern(resource);
      if (isRuntimePattern(from)) runtimeDirPackaged = true;
      if (isBroadPackagePattern(from)) broadRuntimeInclude = true;
      continue;
    }
    if (!isPlainObject(resource)) continue;
    const from = normalizeGlobPattern(resource.from ?? "");
    const filters = Array.isArray(resource.filter) ? resource.filter.filter((item) => typeof item === "string") : [];
    if (isRuntimePattern(from)) runtimeDirPackaged = true;
    if ((isBroadPackagePattern(from) || from === "") && (filters.length === 0 || filters.some(isBroadPackagePattern)) && !excludesRuntime(filters)) {
      broadRuntimeInclude = true;
    }
  }
  if (runtimeDirPackaged) failures.push(".runtime is directly included in packaged resources");
  if (broadRuntimeInclude) failures.push("package config uses a broad include without proving .runtime is excluded");
  return {
    runtimeGlobExcluded: !runtimeDirPackaged && !broadRuntimeInclude,
    runtimeDirPackaged,
    broadRuntimeInclude,
    packageResourceAllowlist,
    failures,
  };
}

function isNanoRuntimeConfig(config) {
  const backend = String(config?.backend ?? "").toLowerCase();
  const variant = String(config?.modelVariant ?? "").toLowerCase();
  const repoDir = String(config?.sourceDir ?? config?.repoDir ?? "").toLowerCase();
  const modelDir = String(config?.modelDir ?? "").toLowerCase();
  const tokenizerDir = String(config?.tokenizerDir ?? config?.audioTokenizerDir ?? "").toLowerCase();
  return backend === "moss-nano-onnx"
    && variant.includes("nano")
    && repoDir.includes("moss-tts-nano")
    && modelDir.includes("moss-tts-nano-onnx")
    && tokenizerDir.includes("nano");
}

async function resolvePythonVersion(config, fsModule) {
  if (isPresent(config?.pythonVersion)) {
    return { pythonVersion: String(config.pythonVersion).replace(/^Python\s+/i, "").replace(/^v/i, ""), pythonVersionReason: null };
  }
  if (!isPresent(config?.pythonExe) || !(await pathHasType(fsModule, config.pythonExe, "file"))) {
    return { pythonVersion: "unknown", pythonVersionReason: "pythonExe is unavailable for Python version detection." };
  }
  try {
    const { stdout, stderr } = await execFileAsync(config.pythonExe, ["--version"], { windowsHide: true, timeout: 5000 });
    const text = `${stdout} ${stderr}`.trim();
    const match = text.match(/\bPython\s+(\d+\.\d+\.\d+(?:[-+\w.]*)?)/i);
    if (match) return { pythonVersion: match[1], pythonVersionReason: null };
    return { pythonVersion: "unknown", pythonVersionReason: `pythonExe --version did not report a Python version: ${text || "empty output"}` };
  } catch (error) {
    return { pythonVersion: "unknown", pythonVersionReason: `Unable to execute pythonExe --version: ${error instanceof Error ? error.message : String(error)}` };
  }
}

async function buildNano6PackageMetadata(config, configPath, fsModule) {
  const projectRoot = configProjectRoot(configPath);
  const packageJson = await readJsonIfPresent(fsModule, path.join(projectRoot, "package.json"));
  const packageSafeguards = packageSafeguardsFromPackageJson(packageJson);
  const pythonVersion = await resolvePythonVersion(config, fsModule);
  const packageVersions = {
    onnxruntime: config.packageVersions?.onnxruntime ?? config.packageVersions?.["onnxruntime-node"] ?? "unknown",
    numpy: config.packageVersions?.numpy ?? "unknown",
    sentencepiece: config.packageVersions?.sentencepiece ?? "unknown",
  };
  return {
    sourceDir: config.sourceDir ?? config.repoDir ?? null,
    tokenizerDir: config.tokenizerDir ?? config.audioTokenizerDir ?? null,
    venvDir: config.venvDir ?? null,
    ...pythonVersion,
    packageVersions,
    assetSizes: {
      modelBytes: await directorySizeBytes(fsModule, config.modelDir),
      tokenizerBytes: await directorySizeBytes(fsModule, config.tokenizerDir ?? config.audioTokenizerDir),
    },
    venvFootprintBytes: await directorySizeBytes(fsModule, config.venvDir),
    setupTimeSec: Number.isFinite(Number(config.setupTimeSec)) ? Number(config.setupTimeSec) : 0,
    license: isPlainObject(config.license) ? config.license : { model: "unknown", tokenizer: "unknown" },
    source: isPlainObject(config.source) ? config.source : { repository: "unknown", revision: "unknown" },
    updatePolicy: config.updatePolicy ?? "manual-download",
    privacyPolicy: config.privacyPolicy ?? "local-only",
    shipVsDownloadDecision: config.shipVsDownloadDecision ?? "download-at-setup",
    packageSafeguards,
    packageSafeguardsCheck: makeCheck(
      "packageSafeguards",
      packageSafeguards.runtimeGlobExcluded && !packageSafeguards.runtimeDirPackaged && !packageSafeguards.broadRuntimeInclude ? "pass" : "fail",
      packageSafeguards.runtimeGlobExcluded && !packageSafeguards.runtimeDirPackaged && !packageSafeguards.broadRuntimeInclude
        ? ".runtime/** is excluded from packaged resources."
        : `.runtime/** must remain local-only and must not be packaged: ${packageSafeguards.failures.join("; ")}.`,
    ),
  };
}

export async function buildMossPreflightReport({ configPath, fsModule = fs, now = () => new Date() } = {}) {
  const checkedAt = toIsoString(now);
  const { config, error, detail } = await readMossConfig(configPath, fsModule);

  if (error) {
    return {
      status: "unsupported",
      reason: error,
      detail: detail ?? (error === "config-missing" ? "MOSS runtime config was not found." : "MOSS runtime config could not be parsed."),
      configPath,
      checkedAt,
      checks: [
        makeCheck("config", "fail", detail ?? (error === "config-missing" ? `No config found at ${configPath}.` : `Invalid JSON in ${configPath}.`)),
      ],
    };
  }

  const validation = await validateMossConfig(config, fsModule);
  const ready = validation.status === READY;
  const nanoRuntimeConfig = isNanoRuntimeConfig(config);
  if (!nanoRuntimeConfig) {
    return {
      status: ready ? READY : "unsupported",
      reason: ready ? null : validation.status,
      detail: ready ? "MOSS runtime preflight passed. Nano package evidence is not applicable to this non-Nano runtime config." : "MOSS runtime preflight failed.",
      configPath,
      pythonExe: config.pythonExe,
      repoDir: config.repoDir,
      llamaCppDir: config.llamaCppDir,
      modelDir: config.modelDir,
      audioTokenizerDir: config.audioTokenizerDir,
      backend: config.backend,
      device: config.device,
      hostProfile: config.hostProfile ?? null,
      modelVariant: config.modelVariant ?? null,
      quant: config.quant ?? null,
      threads: config.threads ?? null,
      checkedAt,
      nanoPackageEvidence: {
        status: "not-ready",
        reason: "not-nano-package-evidence",
        blocker: "Nano package evidence requires backend=moss-nano-onnx and Nano source/model/tokenizer paths.",
      },
      checks: ready
        ? [
          ...validation.checks,
          makeCheck("nanoPackageEvidence", "blocker", "Not Nano package evidence: runtime config is for a non-Nano backend or asset layout."),
        ]
        : validation.checks,
    };
  }

  const packageMetadata = await buildNano6PackageMetadata(config, configPath, fsModule);
  const packageReady = packageMetadata.packageSafeguardsCheck.status === "pass";
  return {
    status: ready && packageReady ? READY : "unsupported",
    reason: ready ? (packageReady ? null : "package-safeguards-failed") : validation.status,
    detail: ready && packageReady ? "MOSS Nano runtime/package preflight passed." : "MOSS Nano runtime/package preflight failed.",
    configPath,
    pythonExe: config.pythonExe,
    repoDir: config.repoDir,
    llamaCppDir: config.llamaCppDir,
    modelDir: config.modelDir,
    audioTokenizerDir: config.audioTokenizerDir,
    backend: config.backend,
    device: config.device,
    hostProfile: config.hostProfile ?? null,
    modelVariant: config.modelVariant ?? null,
    quant: config.quant ?? null,
    threads: config.threads ?? null,
    checkedAt,
    sourceDir: packageMetadata.sourceDir,
    tokenizerDir: packageMetadata.tokenizerDir,
    venvDir: packageMetadata.venvDir,
    pythonVersion: packageMetadata.pythonVersion,
    pythonVersionReason: packageMetadata.pythonVersionReason,
    packageVersions: packageMetadata.packageVersions,
    assetSizes: packageMetadata.assetSizes,
    venvFootprintBytes: packageMetadata.venvFootprintBytes,
    setupTimeSec: packageMetadata.setupTimeSec,
    license: packageMetadata.license,
    source: packageMetadata.source,
    updatePolicy: packageMetadata.updatePolicy,
    privacyPolicy: packageMetadata.privacyPolicy,
    shipVsDownloadDecision: packageMetadata.shipVsDownloadDecision,
    packageSafeguards: packageMetadata.packageSafeguards,
    nanoPackageEvidence: {
      status: ready && packageReady ? "ready" : "not-ready",
      reason: ready ? (packageReady ? null : "package-safeguards-failed") : validation.status,
      blocker: packageReady ? null : packageMetadata.packageSafeguardsCheck.detail,
    },
    checks: ready ? [...validation.checks, packageMetadata.packageSafeguardsCheck] : validation.checks,
  };
}

export function parseArgs(argv = process.argv.slice(2)) {
  const args = { json: false, configPath: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") {
      args.json = true;
    } else if (arg === "--config") {
      index += 1;
      if (!argv[index]) throw new Error("--config requires a path");
      args.configPath = argv[index];
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function formatHumanReport(report) {
  const lines = [
    "MOSS Runtime Preflight",
    "======================",
    `Status: ${report.status}`,
    `Reason: ${report.reason ?? "none"}`,
    `Detail: ${report.detail ?? "No detail"}`,
    `Config path: ${report.configPath}`,
  ];

  if (report.hostProfile) lines.push(`Host profile: ${report.hostProfile}`);
  if (report.modelVariant) lines.push(`Model variant: ${report.modelVariant}`);
  if (report.quant) lines.push(`Quant: ${report.quant}`);
  if (report.threads != null) lines.push(`Threads: ${report.threads}`);
  if (report.backend) lines.push(`Backend: ${report.backend}`);
  if (report.device) lines.push(`Device: ${report.device}`);
  lines.push(`Checked at: ${report.checkedAt}`, "", "Checks", "------");
  for (const check of report.checks) {
    lines.push(`- [${check.status.toUpperCase()}] ${check.key}: ${check.detail}`);
  }
  return `${lines.join("\n")}\n`;
}

export async function runMossPreflight({
  projectRoot = process.cwd(),
  userDataPath,
  explicitPath,
  fsModule = fs,
  now = () => new Date(),
} = {}) {
  const configPath = await resolveExistingMossConfigPath({
    cwd: projectRoot,
    userDataPath,
    explicitPath,
  }, fsModule);
  return buildMossPreflightReport({ configPath, fsModule, now });
}

export async function main(argv = process.argv.slice(2)) {
  try {
    const args = parseArgs(argv);
    const report = await runMossPreflight({
      projectRoot: process.cwd(),
      explicitPath: args.configPath,
    });

    process.stdout.write(args.json ? `${JSON.stringify(report, null, 2)}\n` : formatHumanReport(report));
    process.exitCode = report.status === READY ? 0 : 1;
    return report;
  } catch (error) {
    process.stderr.write(`MOSS preflight failed unexpectedly: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
    return null;
  }
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  await main();
}
