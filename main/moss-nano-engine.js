"use strict";
// main/moss-nano-engine.js - experimental MOSS Nano sidecar manager.

const { createMossNanoSidecarAdapter } = require("./moss-nano-sidecar");
const { createMossNanoDefaultConfig } = require("./sidecar-paths");
const { createPythonSidecarEngine } = require("./python-sidecar-engine");

const DEFAULT_CONFIG = createMossNanoDefaultConfig();

const VISIBLE_CONFIG_KEYS = [
  "runtimeDir",
  "modelDir",
  "tokenizerDir",
  "commandTimeoutMs",
  "synthesizeTimeoutMs",
  "maxInFlight",
  "restartBackoffMs",
];

function createMossNanoEngine(options = {}) {
  return createPythonSidecarEngine(
    {
      label: "MOSS Nano",
      visibleConfigKeys: VISIBLE_CONFIG_KEYS,
      requestIdPrefix: "nano-",
      defaultConfig: DEFAULT_CONFIG,
      createDefaultAdapter: () => createMossNanoSidecarAdapter(),
    },
    options,
  );
}

let sharedMossNanoEngine = null;

function getSharedMossNanoEngine(options = {}) {
  if (!sharedMossNanoEngine || options.reset) {
    sharedMossNanoEngine = createMossNanoEngine(options);
  }
  return sharedMossNanoEngine;
}

module.exports = {
  createMossNanoEngine,
  createMossNanoDefaultConfig,
  getSharedMossNanoEngine,
  getMossNanoEngine: getSharedMossNanoEngine,
};
