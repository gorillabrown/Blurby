import { execFile as execFileCallback } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { readMossConfig, resolveMossConfigPath } from "./moss_preflight.mjs";

const execFileAsync = promisify(execFileCallback);
const SHAPE_KEYS = Object.freeze(["x64Windows", "nativeArm64Clang", "wsl2Linux"]);
const SECRET_KEY_PATTERN = /(token|secret|password|credential|api[_-]?key|access[_-]?key)/i;
const HF_TOKEN_PATTERN = /hf_[A-Za-z0-9_=-]{12,}/g;
const BLOCKED_COMMAND_PATTERN = /\b(curl|wget|iwr|invoke-webrequest|pip|winget|choco|scoop|install|download|git)\b/i;
const ARM64_LLVM_PRESET = "arm64-windows-llvm-release";
const ARM64_LLVM_BINARY_RELATIVE_PATHS = Object.freeze([
  path.join("build-arm64-windows-llvm-release", "bin", "Release", "llama-moss-tts.exe"),
  path.join("build-arm64-windows-llvm-release", "bin", "llama-moss-tts.exe"),
  path.join("build", "bin", "Release", "llama-moss-tts.exe"),
  path.join("build", "bin", "llama-moss-tts.exe"),
]);
const WSL_DISTRO = "Ubuntu-24.04";
const WSL_LLAMA_MOSS_TTS_RELATIVE_PATH = ".runtime/moss/llama.cpp/build-wsl-arm64-host2/bin/llama-moss-tts";

function requireValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

export function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    runId: null,
    outputDir: null,
    configPath: null,
    attemptBuild: false,
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") {
      args.json = true;
    } else if (arg === "--attempt-build") {
      args.attemptBuild = true;
    } else if (arg === "--run-id") {
      args.runId = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--out" || arg === "--output-dir") {
      args.outputDir = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === "--config") {
      args.configPath = requireValue(argv, index, arg);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function toIsoString(now) {
  const value = typeof now === "function" ? now() : new Date();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function defaultRunId(now) {
  return `moss-runtime-shapes-${toIsoString(now).replace(/[:.]/g, "-")}`;
}

async function pathIsFile(fsModule, targetPath) {
  if (typeof targetPath !== "string" || targetPath.trim().length === 0) return false;
  try {
    const stat = await fsModule.stat(targetPath);
    return stat.isFile();
  } catch {
    return false;
  }
}

function defaultX64BinaryCandidates(config = {}) {
  const candidates = [
    config.llamaCppBinary,
    config.llamaCppExe,
    config.llamaCli,
  ];
  if (typeof config.llamaCppDir === "string" && config.llamaCppDir.trim()) {
    candidates.push(
      path.join(config.llamaCppDir, "build-vs-x64", "bin", "Release", "llama-moss-tts.exe"),
      path.join(config.llamaCppDir, "build", "bin", "Release", "llama-moss-tts.exe"),
      path.join(config.llamaCppDir, "build", "bin", "llama-moss-tts.exe"),
    );
  }
  return candidates.filter((candidate) => typeof candidate === "string" && candidate.trim().length > 0);
}

async function firstExistingFile(fsModule, candidates) {
  for (const candidate of candidates) {
    if (await pathIsFile(fsModule, candidate)) return candidate;
  }
  return null;
}

async function readJsonFile(fsModule, targetPath) {
  try {
    return JSON.parse(await fsModule.readFile(targetPath, "utf8"));
  } catch {
    return null;
  }
}

function collectSecretValues(value, secrets = new Set(), key = "") {
  if (typeof value === "string") {
    if (SECRET_KEY_PATTERN.test(key) || HF_TOKEN_PATTERN.test(value)) {
      secrets.add(value);
    }
    return secrets;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => collectSecretValues(entry, secrets, key));
    return secrets;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([entryKey, entryValue]) => {
      collectSecretValues(entryValue, secrets, entryKey);
    });
  }
  return secrets;
}

function redactString(text, secrets = new Set()) {
  let redacted = String(text ?? "").replace(HF_TOKEN_PATTERN, "[REDACTED]");
  for (const secret of secrets) {
    if (typeof secret === "string" && secret.length > 0) {
      redacted = redacted.split(secret).join("[REDACTED]");
    }
  }
  return redacted;
}

function normalizeCommandOutput(text) {
  return String(text ?? "").replace(/\u0000/g, "");
}

function toWslMountPath(windowsPath) {
  const normalized = path.resolve(windowsPath).replace(/\\/g, "/");
  const driveMatch = normalized.match(/^([A-Za-z]):\/(.*)$/);
  if (!driveMatch) return normalized;
  return path.posix.join("/mnt", driveMatch[1].toLowerCase(), driveMatch[2]);
}

function wslLlamaMossTtsPath(projectRoot) {
  return path.posix.join(toWslMountPath(projectRoot), WSL_LLAMA_MOSS_TTS_RELATIVE_PATH);
}

function redactForArtifact(value, secrets = new Set(), key = "") {
  if (typeof value === "string") {
    return SECRET_KEY_PATTERN.test(key) ? "[REDACTED]" : redactString(value, secrets);
  }
  if (Array.isArray(value)) {
    return value.map((entry, index) => redactForArtifact(entry, secrets, String(index)));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        redactForArtifact(entryValue, secrets, entryKey),
      ]),
    );
  }
  return value;
}

function sanitizeCommand(commandConfig, secrets = new Set()) {
  if (!commandConfig) return null;
  if (typeof commandConfig === "string") {
    return { command: commandConfig, args: [] };
  }
  if (typeof commandConfig !== "object" || typeof commandConfig.command !== "string") {
    return null;
  }
  return {
    command: commandConfig.command,
    args: Array.isArray(commandConfig.args)
      ? commandConfig.args.map((arg) => redactString(arg, secrets))
      : [],
  };
}

function commandLooksUnsafe(commandConfig) {
  if (!commandConfig) return false;
  const commandLine = [commandConfig.command, ...(commandConfig.args ?? [])].join(" ");
  return BLOCKED_COMMAND_PATTERN.test(commandLine) && !/(^|\s)--no-download(\s|$)/i.test(commandLine);
}

async function runConfiguredShapeCommand({
  shape,
  base,
  config,
  execFile,
  projectRoot,
  secrets,
}) {
  const commandConfig = config?.runtimeShapeCommands?.[shape];
  const sanitized = sanitizeCommand(commandConfig, secrets);
  if (!sanitized) return base;

  if (commandLooksUnsafe(sanitized)) {
    return {
      ...base,
      status: "blocked",
      blocker: "unsafe-shape-command",
      command: sanitized.command,
      detail: "Configured shape command looks like an installer, downloader, or source fetch; probe did not run it.",
    };
  }

  try {
    const { stdout = "", stderr = "" } = await execFile(commandConfig.command, commandConfig.args ?? [], {
      cwd: projectRoot,
      windowsHide: true,
      timeout: 120_000,
    });
    return {
      ...base,
      status: "passed",
      command: sanitized.command,
      args: sanitized.args,
      stdoutTail: redactString(stdout, secrets).slice(-1000),
      stderrTail: redactString(stderr, secrets).slice(-1000),
    };
  } catch (error) {
    return {
      ...base,
      status: "failed",
      command: sanitized.command,
      args: sanitized.args,
      exitCode: error?.code ?? null,
      error: redactString(error instanceof Error ? error.message : String(error), secrets),
      stdoutTail: redactString(error?.stdout ?? "", secrets).slice(-1000),
      stderrTail: redactString(error?.stderr ?? "", secrets).slice(-1000),
    };
  }
}

async function detectX64Windows({ config, fsModule }) {
  const binaryPath = await firstExistingFile(fsModule, defaultX64BinaryCandidates(config));
  if (!binaryPath) {
    return {
      status: "blocked",
      blocker: "x64-binary-missing",
      detail: "No configured x64 Windows llama-moss-tts binary was found.",
    };
  }
  return {
    status: "available",
    binaryPath,
    detail: "Configured x64 Windows MOSS binary is present.",
  };
}

async function readWslStatus({ execFile }) {
  try {
    const { stdout = "", stderr = "" } = await execFile("wsl.exe", ["--status"], {
      windowsHide: true,
      timeout: 15_000,
    });
    const output = normalizeCommandOutput(`${stdout}\n${stderr}`);
    if (/default\s+version:\s*2/i.test(output) || /\bwsl\s*2\b/i.test(output) || /\bversion:\s*2\b/i.test(output)) {
      return {
        status: "available",
        detail: "wsl.exe --status indicates WSL2 is available.",
        stdoutTail: normalizeCommandOutput(stdout).slice(-1000),
        stderrTail: normalizeCommandOutput(stderr).slice(-1000),
      };
    }
    return {
      status: "blocked",
      blocker: "wsl2-unavailable",
      detail: "wsl.exe --status ran, but WSL2 availability was not confirmed.",
      stdoutTail: normalizeCommandOutput(stdout).slice(-1000),
      stderrTail: normalizeCommandOutput(stderr).slice(-1000),
    };
  } catch (error) {
    return {
      status: "blocked",
      blocker: "wsl2-unavailable",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

async function detectWsl2({ execFile, projectRoot }) {
  const wslStatus = await readWslStatus({ execFile });
  const binaryPath = wslLlamaMossTtsPath(projectRoot);
  const gateCommand = `echo WSL_OK && test -x ${binaryPath} && uname -m`;

  try {
    const { stdout = "", stderr = "" } = await execFile(
      "wsl.exe",
      ["-d", WSL_DISTRO, "-u", "root", "--", "bash", "-lc", gateCommand],
      {
        windowsHide: true,
        timeout: 15_000,
      },
    );
    const output = normalizeCommandOutput(`${stdout}\n${stderr}`);
    const machine = output.split(/\s+/).find((entry) => entry === "aarch64") ?? null;
    if (/\bWSL_OK\b/.test(output) && machine === "aarch64") {
      return {
        status: "available",
        detail: `${WSL_DISTRO} shell gate confirmed WSL runtime and host2 aarch64 MOSS binary.`,
        distro: WSL_DISTRO,
        binaryPath,
        machine,
        wslStatus,
        gateCommand: {
          command: "wsl.exe",
          args: ["-d", WSL_DISTRO, "-u", "root", "--", "bash", "-lc", gateCommand],
        },
        stdoutTail: normalizeCommandOutput(stdout).slice(-1000),
        stderrTail: normalizeCommandOutput(stderr).slice(-1000),
      };
    }
    return {
      status: "blocked",
      blocker: "wsl2-linux-runtime-unavailable",
      detail: `${WSL_DISTRO} shell gate ran, but did not return WSL_OK and aarch64.`,
      distro: WSL_DISTRO,
      binaryPath,
      machine,
      wslStatus,
      gateCommand: {
        command: "wsl.exe",
        args: ["-d", WSL_DISTRO, "-u", "root", "--", "bash", "-lc", gateCommand],
      },
      stdoutTail: normalizeCommandOutput(stdout).slice(-1000),
      stderrTail: normalizeCommandOutput(stderr).slice(-1000),
    };
  } catch (error) {
    const blocker = wslStatus.blocker === "wsl2-unavailable" && error?.code === "ENOENT"
      ? "wsl2-unavailable"
      : "wsl2-linux-runtime-unavailable";
    return {
      status: "blocked",
      blocker,
      detail: error instanceof Error ? error.message : String(error),
      distro: WSL_DISTRO,
      binaryPath,
      wslStatus,
      gateCommand: {
        command: "wsl.exe",
        args: ["-d", WSL_DISTRO, "-u", "root", "--", "bash", "-lc", gateCommand],
      },
      exitCode: error?.code ?? null,
      stdoutTail: normalizeCommandOutput(error?.stdout ?? "").slice(-1000),
      stderrTail: normalizeCommandOutput(error?.stderr ?? "").slice(-1000),
    };
  }
}

function arm64LlvmBuildCommands() {
  return {
    configureCommand: {
      command: "cmake",
      args: ["--preset", ARM64_LLVM_PRESET],
    },
    buildCommand: {
      command: "cmake",
      args: ["--build", "--preset", ARM64_LLVM_PRESET],
    },
  };
}

function arm64LlvmBlocked(blocker, detail, extra = {}) {
  return {
    status: "blocked",
    blocker,
    detail,
    wouldRun: true,
    ...arm64LlvmBuildCommands(),
    ...extra,
  };
}

function arm64LlvmFailed(blocker, detail, extra = {}) {
  return {
    status: "failed",
    blocker,
    detail,
    ...arm64LlvmBuildCommands(),
    ...extra,
  };
}

function arm64LlvmPaths(projectRoot) {
  const llamaCppDir = path.join(projectRoot, ".runtime", "moss", "llama.cpp");
  return {
    llamaCppDir,
    presetPath: path.join(llamaCppDir, "CMakePresets.json"),
    binaryCandidates: ARM64_LLVM_BINARY_RELATIVE_PATHS.map((relativePath) => path.join(llamaCppDir, relativePath)),
  };
}

function hasArm64LlvmPreset(presets) {
  const configurePresets = Array.isArray(presets?.configurePresets) ? presets.configurePresets : [];
  return configurePresets.some((preset) => preset?.name === ARM64_LLVM_PRESET);
}

async function commandAvailable({ execFile, command, args, blocker, detail, timeout = 15_000 }) {
  try {
    await execFile(command, args, {
      windowsHide: true,
      timeout,
    });
    return null;
  } catch (error) {
    return arm64LlvmBlocked(blocker, detail, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function detectArm64LlvmBuildShape({
  execFile,
  fsModule,
  projectRoot,
  attemptBuild,
  clangVersion,
}) {
  const { llamaCppDir, presetPath, binaryCandidates } = arm64LlvmPaths(projectRoot);
  const presets = await readJsonFile(fsModule, presetPath);
  if (!hasArm64LlvmPreset(presets)) {
    return {
      status: "available",
      detail: "Native ARM64 clang is available.",
      version: clangVersion,
    };
  }

  const binaryPath = await firstExistingFile(fsModule, binaryCandidates);
  if (binaryPath) {
    return {
      status: "available",
      detail: "Windows ARM64 LLVM MOSS binary is present.",
      version: clangVersion,
      preset: ARM64_LLVM_PRESET,
      binaryPath,
    };
  }

  const missingBinary = arm64LlvmBlocked(
    "binary-missing",
    attemptBuild
      ? "Windows ARM64 LLVM build completed, but llama-moss-tts.exe was not found."
      : "Windows ARM64 LLVM binary is missing; pass --attempt-build to run the guarded configure/build.",
    { preset: ARM64_LLVM_PRESET },
  );

  if (!attemptBuild) return missingBinary;

  const cmakeUnavailable = await commandAvailable({
    execFile,
    command: "cmake",
    args: ["--version"],
    blocker: "cmake-unavailable",
    detail: "cmake is required to configure the Windows ARM64 LLVM build.",
  });
  if (cmakeUnavailable) return cmakeUnavailable;

  const ninjaUnavailable = await commandAvailable({
    execFile,
    command: "ninja",
    args: ["--version"],
    blocker: "ninja-unavailable",
    detail: "ninja is required by the arm64-windows-llvm-release CMake preset.",
  });
  if (ninjaUnavailable) return ninjaUnavailable;

  try {
    await execFile("cmake", ["--preset", ARM64_LLVM_PRESET], {
      cwd: llamaCppDir,
      windowsHide: true,
      timeout: 120_000,
    });
    await execFile("cmake", ["--build", "--preset", ARM64_LLVM_PRESET], {
      cwd: llamaCppDir,
      windowsHide: true,
      timeout: 600_000,
    });
  } catch (error) {
    return arm64LlvmFailed("build-failed", error instanceof Error ? error.message : String(error), {
      preset: ARM64_LLVM_PRESET,
      exitCode: error?.code ?? null,
      stdoutTail: redactString(error?.stdout ?? "").slice(-1000),
      stderrTail: redactString(error?.stderr ?? "").slice(-1000),
    });
  }

  const builtBinaryPath = await firstExistingFile(fsModule, binaryCandidates);
  if (!builtBinaryPath) return missingBinary;
  return {
    status: "available",
    detail: "Windows ARM64 LLVM MOSS binary is present.",
    version: clangVersion,
    preset: ARM64_LLVM_PRESET,
    binaryPath: builtBinaryPath,
  };
}

async function detectNativeArm64Clang({ execFile, fsModule, projectRoot, hostArch, attemptBuild }) {
  if (hostArch !== "arm64") {
    return {
      status: "blocked",
      blocker: "host-not-arm64",
      detail: `Native ARM64 clang shape requires an ARM64 host; detected ${hostArch}.`,
    };
  }

  try {
    const { stdout = "", stderr = "" } = await execFile("clang", ["--version"], {
      windowsHide: true,
      timeout: 15_000,
    });
    const output = `${stdout}\n${stderr}`;
    if (!/(aarch64|arm64)/i.test(output)) {
      return {
        status: "blocked",
        blocker: "clang-not-arm64",
        detail: "clang is present, but its reported target does not look ARM64.",
      };
    }
    return await detectArm64LlvmBuildShape({
      execFile,
      fsModule,
      projectRoot,
      attemptBuild,
      clangVersion: output.split(/\r?\n/).find(Boolean) ?? "clang",
    });
  } catch (error) {
    const { presetPath } = arm64LlvmPaths(projectRoot);
    const presets = await readJsonFile(fsModule, presetPath);
    if (hasArm64LlvmPreset(presets)) {
      return arm64LlvmBlocked("clang-unavailable", error instanceof Error ? error.message : String(error), {
        preset: ARM64_LLVM_PRESET,
      });
    }
    return {
      status: "blocked",
      blocker: "clang-unavailable",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

function overallStatus(shapes) {
  const statuses = Object.values(shapes).map((shape) => shape.status);
  if (statuses.includes("failed")) return "failed";
  if (statuses.every((status) => status === "blocked")) return "blocked";
  return "ok";
}

export function formatSummaryText(result) {
  const lines = [
    "MOSS Runtime Shape Probe",
    "========================",
    `Status: ${result.status}`,
    `Run ID: ${result.runId}`,
    `Checked at: ${result.checkedAt}`,
    `Config path: ${result.configPath}`,
    "",
    "Shapes",
    "------",
  ];

  for (const key of SHAPE_KEYS) {
    const shape = result.shapes[key];
    lines.push(`- ${key}: ${shape.status}${shape.blocker ? ` (${shape.blocker})` : ""}`);
    if (shape.detail) lines.push(`  ${shape.detail}`);
    if (shape.binaryPath) lines.push(`  Binary: ${shape.binaryPath}`);
    if (shape.command) lines.push(`  Command: ${shape.command}`);
  }

  return `${lines.join("\n")}\n`;
}

export async function writeShapeSummary({ result, outputDir, fsModule = fs, secrets = new Set() }) {
  await fsModule.mkdir(outputDir, { recursive: true });
  const redactedResult = redactForArtifact(result, secrets);
  const jsonPath = path.join(outputDir, "summary.json");
  const textPath = path.join(outputDir, "summary.txt");
  await fsModule.writeFile(jsonPath, `${JSON.stringify(redactedResult, null, 2)}\n`, "utf8");
  await fsModule.writeFile(textPath, formatSummaryText(redactedResult), "utf8");
  return { summaryJsonPath: jsonPath, summaryPath: textPath };
}

export async function runMossRuntimeShapeProbe({
  projectRoot = process.cwd(),
  configPath,
  runId,
  outputDir,
  fsModule = fs,
  execFile = execFileAsync,
  hostArch = os.arch(),
  attemptBuild = false,
  now = () => new Date(),
} = {}) {
  const effectiveRunId = runId ?? defaultRunId(now);
  const effectiveOutputDir = outputDir ?? path.join(projectRoot, "artifacts", "moss", effectiveRunId);
  const effectiveConfigPath = path.resolve(projectRoot, configPath ?? resolveMossConfigPath({ cwd: projectRoot }));
  const { config, error: configError, detail: configDetail } = await readMossConfig(effectiveConfigPath, fsModule);
  const safeConfig = config ?? {};
  const secrets = collectSecretValues(safeConfig);

  let shapes = {
    x64Windows: configError
      ? {
        status: "blocked",
        blocker: configError,
        detail: configDetail ?? "MOSS runtime config was not available.",
      }
      : await detectX64Windows({ config: safeConfig, fsModule }),
    nativeArm64Clang: await detectNativeArm64Clang({
      execFile,
      fsModule,
      projectRoot,
      hostArch,
      attemptBuild,
    }),
    wsl2Linux: await detectWsl2({ execFile, projectRoot }),
  };

  for (const shape of SHAPE_KEYS) {
    if (shapes[shape].status === "available") {
      shapes = {
        ...shapes,
        [shape]: await runConfiguredShapeCommand({
          shape,
          base: shapes[shape],
          config: safeConfig,
          execFile,
          projectRoot,
          secrets,
        }),
      };
    }
  }

  const result = {
    status: overallStatus(shapes),
    runId: effectiveRunId,
    checkedAt: toIsoString(now),
    configPath: effectiveConfigPath,
    host: {
      platform: process.platform,
      arch: hostArch,
    },
    shapes,
  };

  const paths = await writeShapeSummary({
    result,
    outputDir: effectiveOutputDir,
    fsModule,
    secrets,
  });
  return { ...redactForArtifact(result, secrets), ...paths };
}

function formatHumanResult(result) {
  return formatSummaryText(result);
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const result = await runMossRuntimeShapeProbe({
    projectRoot: process.cwd(),
    configPath: args.configPath,
    runId: args.runId,
    outputDir: args.outputDir,
    attemptBuild: args.attemptBuild,
  });
  process.stdout.write(args.json ? `${JSON.stringify(result, null, 2)}\n` : formatHumanResult(result));
  process.exitCode = result.status === "failed" ? 1 : 0;
  return result;
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`MOSS runtime shape probe failed unexpectedly: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
