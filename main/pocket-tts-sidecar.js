"use strict";
// main/pocket-tts-sidecar.js - resident JSON-lines adapter for the Pocket TTS Python sidecar.
// Provider configuration only; the adapter lives in python-sidecar-adapter.js.

const { createPythonSidecarAdapter } = require("./python-sidecar-adapter");
const { resolvePocketTtsBridgePath } = require("./sidecar-paths");

const DEFAULT_BRIDGE_PATH = resolvePocketTtsBridgePath();

function buildSpawnArgs(config, bridgePath) {
  const args = [bridgePath];
  if (config?.runtimeDir) args.push("--runtime-dir", config.runtimeDir);
  if (config?.modelDir) args.push("--model-dir", config.modelDir);
  if (config?.outputDir) args.push("--output-dir", config.outputDir);
  if (config?.referenceWavPath) args.push("--reference-wav", config.referenceWavPath);
  if (config?.mock) args.push("--mock");
  return args;
}

function createPocketTtsSidecarAdapter(options = {}) {
  return createPythonSidecarAdapter({
    label: "Pocket TTS",
    pythonEnvVar: "POCKET_TTS_PYTHON",
    defaultBridgePath: DEFAULT_BRIDGE_PATH,
    buildSpawnArgs,
  }, options);
}

module.exports = {
  createPocketTtsSidecarAdapter,
  resolvePocketTtsBridgePath,
};
