"use strict";
// main/moss-nano-sidecar.js - resident JSON-lines adapter for the Nano Python sidecar.
// Provider configuration only; the adapter lives in python-sidecar-adapter.js.

const { createPythonSidecarAdapter } = require("./python-sidecar-adapter");
const { resolveMossNanoBridgePath } = require("./sidecar-paths");

const DEFAULT_BRIDGE_PATH = resolveMossNanoBridgePath();

function buildSpawnArgs(config, bridgePath) {
  const args = [bridgePath];
  if (config?.runtimeDir) args.push("--runtime-dir", config.runtimeDir);
  if (config?.modelDir) args.push("--model-dir", config.modelDir);
  if (config?.tokenizerDir) args.push("--tokenizer-dir", config.tokenizerDir);
  if (config?.outputDir) args.push("--output-dir", config.outputDir);
  if (config?.mock) args.push("--mock");
  return args;
}

function createMossNanoSidecarAdapter(options = {}) {
  return createPythonSidecarAdapter({
    label: "MOSS Nano",
    pythonEnvVar: "MOSS_NANO_PYTHON",
    defaultBridgePath: DEFAULT_BRIDGE_PATH,
    buildSpawnArgs,
  }, options);
}

module.exports = {
  createMossNanoSidecarAdapter,
  resolveMossNanoBridgePath,
};
