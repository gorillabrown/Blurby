"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");

function isPackaged(options = {}) {
  if (typeof options.packaged === "boolean") return options.packaged;
  if (process.env.BLURBY_PACKAGED_RESOURCES_PATH) return true;
  return Boolean(process.versions?.electron && process.resourcesPath && !process.defaultApp);
}

function appRoot(options = {}) {
  return options.appRoot || path.resolve(__dirname, "..");
}

function resourcesRoot(options = {}) {
  return options.resourcesPath || process.env.BLURBY_PACKAGED_RESOURCES_PATH || process.resourcesPath || appRoot(options);
}

function runtimeRoot(options = {}) {
  return isPackaged(options) ? resourcesRoot(options) : appRoot(options);
}

function tempRoot(options = {}) {
  return options.tempRoot || process.env.BLURBY_TTS_OUTPUT_ROOT || path.join(os.tmpdir(), "Blurby");
}

function pythonPath(venvDir, options = {}) {
  const platform = options.platform || process.platform;
  return platform === "win32"
    ? path.join(venvDir, "Scripts", "python.exe")
    : path.join(venvDir, "bin", "python3");
}

function existingPython(pythonExe) {
  return fs.existsSync(pythonExe) ? pythonExe : undefined;
}

function unpackedScriptsRoot(options = {}) {
  return isPackaged(options)
    ? path.join(resourcesRoot(options), "app.asar.unpacked", "scripts")
    : path.join(appRoot(options), "scripts");
}

function sidecarCwd(options = {}) {
  return isPackaged(options)
    ? path.join(resourcesRoot(options), "app.asar.unpacked")
    : appRoot(options);
}

function resolveMossNanoBridgePath(options = {}) {
  return path.join(unpackedScriptsRoot(options), "moss_nano_app_sidecar.py");
}

function resolvePocketTtsBridgePath(options = {}) {
  return path.join(unpackedScriptsRoot(options), "pocket_tts_sidecar.py");
}

function createMossNanoDefaultConfig(options = {}) {
  const root = runtimeRoot(options);
  const mossRoot = path.join(root, ".runtime", "moss");
  const pythonExe = pythonPath(path.join(mossRoot, ".venv-nano"), options);

  return {
    pythonExe: existingPython(pythonExe),
    runtimeDir: path.join(mossRoot, "MOSS-TTS-Nano"),
    modelDir: path.join(mossRoot, "weights", "MOSS-TTS-Nano-ONNX", "MOSS-TTS-Nano-100M-ONNX"),
    tokenizerDir: path.join(mossRoot, "weights", "MOSS-TTS-Nano-ONNX", "MOSS-Audio-Tokenizer-Nano-ONNX"),
    outputDir: path.join(tempRoot(options), "moss-nano-app-sidecar"),
    commandTimeoutMs: 30000,
    synthesizeTimeoutMs: 120000,
    maxInFlight: 1,
    restartBackoffMs: 250,
  };
}

function createPocketTtsDefaultConfig(options = {}) {
  const root = runtimeRoot(options);
  const pocketRoot = path.join(root, ".runtime", "pocket-tts");
  const pythonExe = pythonPath(path.join(pocketRoot, ".venv"), options);

  return {
    pythonExe: existingPython(pythonExe),
    runtimeDir: pocketRoot,
    modelDir: path.join(pocketRoot, "model"),
    referenceWavPath: null,
    outputDir: path.join(tempRoot(options), "pocket-tts-sidecar"),
    commandTimeoutMs: 30000,
    synthesizeTimeoutMs: 120000,
    maxInFlight: 1,
    restartBackoffMs: 250,
  };
}

module.exports = {
  createMossNanoDefaultConfig,
  createPocketTtsDefaultConfig,
  resolveMossNanoBridgePath,
  resolvePocketTtsBridgePath,
  sidecarCwd,
};
