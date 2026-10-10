"use strict";
// main/pocket-tts-engine.js - opt-in Pocket TTS sidecar manager.

const { createPocketTtsSidecarAdapter } = require("./pocket-tts-sidecar");
const { createPocketTtsDefaultConfig } = require("./sidecar-paths");
const { createPythonSidecarEngine } = require("./python-sidecar-engine");

const DEFAULT_CONFIG = createPocketTtsDefaultConfig();

const VISIBLE_CONFIG_KEYS = [
  "runtimeDir",
  "modelDir",
  "referenceWavPath",
  "commandTimeoutMs",
  "synthesizeTimeoutMs",
  "maxInFlight",
  "restartBackoffMs",
];

function createPocketTtsEngine(options = {}) {
  return createPythonSidecarEngine(
    {
      label: "Pocket TTS",
      visibleConfigKeys: VISIBLE_CONFIG_KEYS,
      requestIdPrefix: "pocket-",
      defaultConfig: DEFAULT_CONFIG,
      createDefaultAdapter: () => createPocketTtsSidecarAdapter(),
    },
    options,
  );
}

let sharedPocketTtsEngine = null;

function getSharedPocketTtsEngine(options = {}) {
  if (!sharedPocketTtsEngine || options.reset) {
    sharedPocketTtsEngine = createPocketTtsEngine(options);
  }
  return sharedPocketTtsEngine;
}

module.exports = {
  createPocketTtsEngine,
  createPocketTtsDefaultConfig,
  getSharedPocketTtsEngine,
  getPocketTtsEngine: getSharedPocketTtsEngine,
};
