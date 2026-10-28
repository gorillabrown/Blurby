import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "events";
import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve()).then(() => Promise.resolve());
}

function clearWorkerModules() {
  for (const modulePath of ["../main/tts-worker.js", "../main/sharp-stub.js"]) {
    try {
      delete require.cache[require.resolve(modulePath)];
    } catch {
      // Module may not have been loaded in this test.
    }
  }
}

function createWorkerHarness({ nestedRequire, warmupError = null } = {}) {
  const parentPort = new EventEmitter();
  const messages = [];
  parentPort.postMessage = vi.fn((message) => {
    messages.push(message);
  });

  const modulePath = path.join("C:\\", "packaged", "app.asar.unpacked", "node_modules");
  const packagedKokoroPath = path.join(modulePath, "kokoro-js", "dist", "kokoro.cjs");
  const packagedTransformersPath = path.join(modulePath, "@huggingface", "transformers", "dist", "transformers.node.cjs");
  const originalResolve = Module._resolveFilename;

  const ttsInstance = {
    generate: warmupError
      ? vi.fn().mockRejectedValue(warmupError)
      : vi.fn().mockResolvedValue({
          audio: new Float32Array([0.5]),
          sampling_rate: 24000,
        }),
  };
  const fromPretrained = vi.fn().mockResolvedValue(ttsInstance);
  const transformersEnv = {};

  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "worker_threads") {
      return {
        parentPort,
        workerData: { modulePath },
      };
    }
    if (request === packagedKokoroPath) {
      if (nestedRequire) {
        require(nestedRequire);
      }
      return {
        KokoroTTS: {
          from_pretrained: fromPretrained,
        },
      };
    }
    if (request === packagedTransformersPath) {
      return { env: transformersEnv };
    }
    return originalLoad.apply(this, arguments);
  };

  clearWorkerModules();
  require("../main/tts-worker.js");

  return {
    parentPort,
    messages,
    ttsInstance,
    fromPretrained,
    transformersEnv,
    originalResolve,
    async load(cacheDir = "C:\\Users\\estra\\AppData\\Roaming\\Blurby\\models") {
      parentPort.emit("message", { type: "load", cacheDir });
      await flushPromises();
      await flushPromises();
    },
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
  Module._load = originalLoad;
  clearWorkerModules();
});

afterEach(() => {
  vi.restoreAllMocks();
  Module._load = originalLoad;
  clearWorkerModules();
});

describe("tts-worker packaged bootstrap shim", () => {
  it("stubs only the exact optional sharp dependency and restores Module._resolveFilename on success", async () => {
    const harness = createWorkerHarness({ nestedRequire: "sharp" });

    await harness.load();

    expect(harness.fromPretrained).toHaveBeenCalledTimes(1);
    expect(harness.ttsInstance.generate).toHaveBeenCalledWith("Hello.", {
      voice: "af_bella",
      speed: 1.0,
    });
    expect(harness.transformersEnv.cacheDir).toBe("C:\\Users\\estra\\AppData\\Roaming\\Blurby\\models");
    expect(harness.messages.map((message) => message.type)).toEqual([
      "model-loaded",
      "warm-up-done",
      "model-ready",
    ]);
    expect(Module._resolveFilename).toBe(harness.originalResolve);
  });

  it("does not stub subpaths or unrelated missing modules, and restores Module._resolveFilename on failure", async () => {
    const harness = createWorkerHarness({ nestedRequire: "sharp/subpath" });

    await harness.load();

    expect(harness.fromPretrained).not.toHaveBeenCalled();
    expect(harness.messages).toHaveLength(1);
    expect(harness.messages[0]).toMatchObject({
      type: "load-error",
    });
    expect(harness.messages[0].error).toContain("sharp/subpath");
    expect(Module._resolveFilename).toBe(harness.originalResolve);
  });
});
