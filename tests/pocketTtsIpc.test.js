import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;

function clearModule(modulePath) {
  try {
    delete require.cache[require.resolve(modulePath)];
  } catch {}
}

function clearContractModules() {
  clearModule("../main/ipc/tts.js");
  clearModule("../preload.js");
}

function createPocketEngineStub(overrides = {}) {
  return {
    status: vi.fn().mockResolvedValue({ ok: true, status: "ready", ready: true }),
    synthesize: vi.fn().mockResolvedValue({
      ok: true,
      requestId: "pocket-req-1",
      ownerToken: "owner-1",
      audio: [0, 0.1],
      sampleRate: 24000,
      durationMs: 25,
    }),
    cancel: vi.fn().mockResolvedValue({ ok: true, cancelled: true, requestId: "pocket-req-1" }),
    shutdown: vi.fn().mockResolvedValue({ ok: true, status: "shutdown", ready: false }),
    restart: vi.fn().mockResolvedValue({ ok: true, status: "ready", ready: true }),
    ...overrides,
  };
}

function createIpcHarness({ pocketEngine = createPocketEngineStub() } = {}) {
  const ipcHandlers = new Map();
  const browserWindow = {
    isDestroyed: () => false,
    isFocused: () => true,
    webContents: { send: vi.fn() },
  };
  const electronMock = {
    app: { isPackaged: false, getPath: vi.fn(() => "C:\\Users\\estra\\AppData\\Roaming\\Blurby") },
    BrowserWindow: { getAllWindows: vi.fn(() => [browserWindow]) },
    ipcMain: {
      handle: vi.fn((channel, handler) => {
        ipcHandlers.set(channel, handler);
      }),
    },
  };
  const pocketEngineModule = {
    getSharedPocketTtsEngine: vi.fn(() => pocketEngine),
    getPocketTtsEngine: vi.fn(() => pocketEngine),
    createPocketTtsEngine: vi.fn(() => pocketEngine),
    pocketTtsEngine: pocketEngine,
    default: pocketEngine,
  };
  const nanoEngine = {
    status: vi.fn(),
    synthesize: vi.fn(),
    cancel: vi.fn(),
    shutdown: vi.fn(),
    restart: vi.fn(),
  };
  const streamingEngine = {
    startStream: vi.fn().mockResolvedValue({ streamId: "qwen-stream-1" }),
    cancelStream: vi.fn().mockResolvedValue(undefined),
    getModelStatus: vi.fn().mockReturnValue({ status: "ready", ready: true }),
    onStreamAudio: vi.fn(),
    onStreamFinished: vi.fn(),
  };

  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    if (request === "../pocket-tts-engine" || request === "../pocket-tts-engine.js") return pocketEngineModule;
    if (request === "../moss-nano-engine" || request === "../moss-nano-engine.js") {
      return { getSharedMossNanoEngine: vi.fn(() => nanoEngine), getMossNanoEngine: vi.fn(() => nanoEngine) };
    }
    if (request === "../tts-engine") {
      return {
        setLoadingCallback: vi.fn(),
        generate: vi.fn(),
        listVoices: vi.fn(),
        getModelStatus: vi.fn(() => ({ ready: false })),
        isModelReady: vi.fn(() => false),
        downloadModel: vi.fn(),
        preload: vi.fn(),
      };
    }
    if (request === "../qwen-engine") {
      return { getModelStatus: vi.fn(), preload: vi.fn(), preflight: vi.fn(), listVoices: vi.fn(), generate: vi.fn() };
    }
    if (request === "../qwen-streaming-engine") {
      return { createQwenStreamingEngineManager: vi.fn(() => streamingEngine) };
    }
    if (request === "../tts-engine-marathon") return { generate: vi.fn(), preload: vi.fn() };
    if (request === "../epub-word-extractor") return { extractWords: vi.fn() };
    if (request === "../tts-cache") {
      return {
        readChunk: vi.fn(),
        writeChunk: vi.fn(),
        hasChunk: vi.fn(),
        getCachedChunks: vi.fn(),
        evictBook: vi.fn(),
        evictBookVoice: vi.fn(),
        getCacheInfo: vi.fn(),
        getOpeningCoverageMs: vi.fn(),
      };
    }
    return originalLoad.call(this, request, parent, isMain);
  };

  return {
    ipcHandlers,
    pocketEngine,
    loadAndRegister() {
      clearContractModules();
      const { register } = require("../main/ipc/tts.js");
      register({ getMainWindow: () => browserWindow, getLibrary: () => [] });
    },
  };
}

function createPreloadHarness() {
  let exposedApi = null;
  const invoked = [];
  const electronMock = {
    contextBridge: {
      exposeInMainWorld: vi.fn((_name, api) => {
        exposedApi = api;
      }),
    },
    ipcRenderer: {
      invoke: vi.fn((channel, ...args) => {
        invoked.push({ channel, args });
        return Promise.resolve({ ok: true, channel, args });
      }),
      on: vi.fn(),
      removeListener: vi.fn(),
    },
    webUtils: { getPathForFile: vi.fn((file) => file.path) },
  };

  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    return originalLoad.call(this, request, parent, isMain);
  };

  clearContractModules();
  require("../preload.js");

  return { exposedApi, invoked };
}

beforeEach(() => {
  vi.restoreAllMocks();
  Module._load = originalLoad;
  clearContractModules();
});

afterEach(() => {
  vi.restoreAllMocks();
  Module._load = originalLoad;
  clearContractModules();
});

describe("Pocket TTS IPC and preload contract", () => {
  it("registers Pocket handlers without renaming Kokoro or Nano handlers", () => {
    const harness = createIpcHarness();

    harness.loadAndRegister();

    expect([...harness.ipcHandlers.keys()]).toEqual(expect.arrayContaining([
      "tts-kokoro-generate",
      "tts-nano-status",
      "tts-pocket-status",
      "tts-pocket-synthesize",
      "tts-pocket-cancel",
      "tts-pocket-shutdown",
      "tts-pocket-restart",
    ]));
  });

  it("maps thrown Pocket failures to structured IPC responses", async () => {
    const error = Object.assign(new Error("Pocket sidecar unavailable"), {
      reason: "sidecar-not-ready",
      status: "unavailable",
      recoverable: true,
    });
    const pocketEngine = createPocketEngineStub({
      status: vi.fn().mockRejectedValue(error),
      synthesize: vi.fn().mockRejectedValue(error),
      cancel: vi.fn().mockRejectedValue(error),
      shutdown: vi.fn().mockRejectedValue(error),
      restart: vi.fn().mockRejectedValue(error),
    });
    const harness = createIpcHarness({ pocketEngine });
    harness.loadAndRegister();

    for (const [channel, args] of [
      ["tts-pocket-status", []],
      ["tts-pocket-synthesize", [{ text: "hello", voice: "default", rate: 1 }]],
      ["tts-pocket-cancel", ["pocket-req-1"]],
      ["tts-pocket-shutdown", []],
      ["tts-pocket-restart", []],
    ]) {
      await expect(harness.ipcHandlers.get(channel)(null, ...args)).resolves.toEqual({
        ok: false,
        error: "Pocket sidecar unavailable",
        reason: "sidecar-not-ready",
        status: "unavailable",
        recoverable: true,
      });
    }
  });

  it("returns Pocket synthesize output through the Pocket IPC channel", async () => {
    const result = {
      ok: true,
      requestId: "pocket-req-1",
      ownerToken: "owner-1",
      audio: [0, 0.1],
      sampleRate: 24000,
      durationMs: 40,
    };
    const pocketEngine = createPocketEngineStub({ synthesize: vi.fn().mockResolvedValue(result) });
    const harness = createIpcHarness({ pocketEngine });
    harness.loadAndRegister();

    const payload = { text: "hello pocket", voice: "default", rate: 1 };
    await expect(harness.ipcHandlers.get("tts-pocket-synthesize")(null, payload)).resolves.toEqual(result);
    expect(pocketEngine.synthesize).toHaveBeenCalledWith(payload);
  });

  it("exposes Pocket preload methods and channels", async () => {
    const { exposedApi, invoked } = createPreloadHarness();

    expect(exposedApi).toEqual(expect.objectContaining({
      pocketStatus: expect.any(Function),
      pocketSynthesize: expect.any(Function),
      pocketCancel: expect.any(Function),
      pocketShutdown: expect.any(Function),
      pocketRestart: expect.any(Function),
    }));

    await exposedApi.pocketStatus();
    await exposedApi.pocketSynthesize({ text: "hello pocket", voice: "default", rate: 1 });
    await exposedApi.pocketCancel("pocket-req-1");
    await exposedApi.pocketShutdown();
    await exposedApi.pocketRestart();

    expect(invoked.slice(-5)).toEqual([
      { channel: "tts-pocket-status", args: [] },
      { channel: "tts-pocket-synthesize", args: [{ text: "hello pocket", voice: "default", rate: 1 }] },
      { channel: "tts-pocket-cancel", args: ["pocket-req-1"] },
      { channel: "tts-pocket-shutdown", args: [] },
      { channel: "tts-pocket-restart", args: [] },
    ]);
  });

  it("keeps Qwen IPC as disabled compatibility stubs", async () => {
    const harness = createIpcHarness();
    harness.loadAndRegister();

    await expect(harness.ipcHandlers.get("tts-qwen-model-status")()).resolves.toMatchObject({
      status: "unavailable",
      ready: false,
      loading: false,
      recoverable: false,
      reason: "qwen-disabled",
    });
    await expect(harness.ipcHandlers.get("tts-qwen-preload")()).resolves.toMatchObject({
      error: expect.stringContaining("retired"),
      status: "unavailable",
      reason: "qwen-disabled",
    });
    await expect(harness.ipcHandlers.get("tts-qwen-generate")(null, "hello", "Ryan", 1, ["hello"])).resolves.toMatchObject({
      error: expect.stringContaining("retired"),
      status: "unavailable",
      reason: "qwen-disabled",
    });
    await expect(harness.ipcHandlers.get("tts-qwen-stream-start")(null, "hello", "Ryan", 1)).resolves.toMatchObject({
      ok: false,
      error: expect.stringContaining("retired"),
      reason: "qwen-disabled",
      status: "unavailable",
      recoverable: false,
    });
    expect(harness.ipcHandlers.get("tts-qwen-stream-status")()).toMatchObject({
      status: "unavailable",
      ready: false,
      model_loaded: false,
      device: "disabled",
      reason: "qwen-disabled",
      recoverable: false,
    });
  });
});
