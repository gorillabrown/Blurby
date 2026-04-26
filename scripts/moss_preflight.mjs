import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const READY = "ready";
const SUPPORTED_BACKENDS = new Set(["llama-cpp-onnx"]);
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
  return {
    status: ready ? READY : "unsupported",
    reason: ready ? null : validation.status,
    detail: ready ? "MOSS runtime preflight passed." : "MOSS runtime preflight failed.",
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
    checks: validation.checks,
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
