import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;

function clearModule(modulePath) {
  try {
    delete require.cache[require.resolve(modulePath)];
  } catch {
    // The module may not exist or may not have been loaded yet.
  }
}

function clearContractModules() {
  clearModule("../main/ipc/tts.js");
  clearModule("../preload.js");
}

function createNanoEngineStub(overrides = {}) {
  return {
    status: vi.fn().mockResolvedValue({ ok: true, status: "ready", ready: true }),
    synthesize: vi.fn().mockResolvedValue({
      ok: true,
      requestId: "nano-req-1",
      outputPath: "C:\\fake\\nano-req-1.wav",
      sampleRate: 24000,
      durationMs: 25,
    }),
    cancel: vi.fn().mockResolvedValue({ ok: true, cancelled: true, requestId: "nano-req-1" }),
    shutdown: vi.fn().mockResolvedValue({ ok: true, status: "shutdown", ready: false }),
    restart: vi.fn().mockResolvedValue({ ok: true, status: "ready", ready: true }),
    ...overrides,
  };
}

function createIpcHarness({ nanoEngine = createNanoEngineStub() } = {}) {
  const ipcHandlers = new Map();
  const browserWindow = {
    isDestroyed: () => false,
    isFocused: () => true,
    webContents: {
      send: vi.fn(),
    },
  };
  const electronMock = {
    app: {
      isPackaged: false,
      getPath: vi.fn(() => "C:\\Users\\estra\\AppData\\Roaming\\Blurby"),
    },
    BrowserWindow: {
      getAllWindows: vi.fn(() => [browserWindow]),
    },
    ipcMain: {
      handle: vi.fn((channel, handler) => {
        ipcHandlers.set(channel, handler);
      }),
    },
  };
  const kokoroEngine = {
    setLoadingCallback: vi.fn(),
    generate: vi.fn(),
    listVoices: vi.fn(),
    getModelStatus: vi.fn(() => ({ ready: false })),
    isModelReady: vi.fn(() => false),
    downloadModel: vi.fn(),
    preload: vi.fn(),
  };
  const qwenEngine = {
    getModelStatus: vi.fn(),
    preload: vi.fn(),
    preflight: vi.fn(),
    listVoices: vi.fn(),
    generate: vi.fn(),
  };
  const streamingEngine = {
    startStream: vi.fn(),
    cancelStream: vi.fn(),
    getModelStatus: vi.fn(),
    onStreamAudio: vi.fn(),
    onStreamFinished: vi.fn(),
  };
  const marathonEngine = {
    generate: vi.fn(),
    preload: vi.fn(),
  };
  const epubWordExtractor = {
    extractWords: vi.fn(),
  };
  const ttsCache = {
    readChunk: vi.fn(),
    writeChunk: vi.fn(),
    hasChunk: vi.fn(),
    getCachedChunks: vi.fn(),
    evictBook: vi.fn(),
    evictBookVoice: vi.fn(),
    getCacheInfo: vi.fn(),
    getOpeningCoverageMs: vi.fn(),
  };
  const nanoEngineModule = {
    createMossNanoEngine: vi.fn(() => nanoEngine),
    getMossNanoEngine: vi.fn(() => nanoEngine),
    getSharedMossNanoEngine: vi.fn(() => nanoEngine),
    mossNanoEngine: nanoEngine,
    default: nanoEngine,
  };

  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    if (request === "../tts-engine") return kokoroEngine;
    if (request === "../qwen-engine") return qwenEngine;
    if (request === "../qwen-streaming-engine") {
      return { createQwenStreamingEngineManager: vi.fn(() => streamingEngine) };
    }
    if (request === "../tts-engine-marathon") return marathonEngine;
    if (request === "../epub-word-extractor") return epubWordExtractor;
    if (request === "../tts-cache") return ttsCache;
    if (request === "../moss-nano-engine" || request === "../moss-nano-engine.js") {
      return nanoEngineModule;
    }
    return originalLoad.call(this, request, parent, isMain);
  };

  return {
    ipcHandlers,
    nanoEngine,
    loadAndRegister() {
      clearContractModules();
      const { register } = require("../main/ipc/tts.js");
      register({
        getMainWindow: () => browserWindow,
        getLibrary: () => [],
      });
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
    webUtils: {
      getPathForFile: vi.fn((file) => file.path),
    },
  };

  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    return originalLoad.call(this, request, parent, isMain);
  };

  clearContractModules();
  require("../preload.js");

  return {
    exposedApi,
    invoked,
  };
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

describe("experimental MOSS Nano IPC contract", () => {
  it("registers the experimental Nano IPC handlers without renaming existing Kokoro handlers", () => {
    const harness = createIpcHarness();

    harness.loadAndRegister();

    expect([...harness.ipcHandlers.keys()]).toEqual(expect.arrayContaining([
      "tts-kokoro-generate",
      "tts-kokoro-voices",
      "tts-kokoro-model-status",
      "tts-kokoro-download",
      "tts-kokoro-preload",
      "tts-kokoro-generate-marathon",
      "tts-kokoro-preload-marathon",
      "tts-nano-status",
      "tts-nano-synthesize",
      "tts-nano-cancel",
      "tts-nano-shutdown",
      "tts-nano-restart",
    ]));
  });

  it("maps thrown Nano engine failures to structured IPC responses", async () => {
    const engineError = Object.assign(new Error("Nano sidecar unavailable"), {
      reason: "sidecar-not-ready",
      status: "unavailable",
      recoverable: true,
    });
    const nanoEngine = createNanoEngineStub({
      status: vi.fn().mockRejectedValue(engineError),
      synthesize: vi.fn().mockRejectedValue(engineError),
      cancel: vi.fn().mockRejectedValue(engineError),
      shutdown: vi.fn().mockRejectedValue(engineError),
      restart: vi.fn().mockRejectedValue(engineError),
    });
    const harness = createIpcHarness({ nanoEngine });

    harness.loadAndRegister();

    const cases = [
      ["tts-nano-status", []],
      ["tts-nano-synthesize", [{ text: "hello nano", voice: "default", rate: 1.0 }]],
      ["tts-nano-cancel", ["nano-req-1"]],
      ["tts-nano-shutdown", []],
      ["tts-nano-restart", []],
    ];

    for (const [channel, args] of cases) {
      const handler = harness.ipcHandlers.get(channel);
      expect(handler, `${channel} handler`).toBeTypeOf("function");
      await expect(handler(null, ...args)).resolves.toEqual({
        ok: false,
        error: "Nano sidecar unavailable",
        reason: "sidecar-not-ready",
        status: "unavailable",
        recoverable: true,
      });
    }
  });
});

describe("experimental MOSS Nano preload contract", () => {
  it("exposes Nano preload methods without renaming existing Kokoro methods", async () => {
    const { exposedApi, invoked } = createPreloadHarness();

    expect(exposedApi).toBeTruthy();
    expect(exposedApi).toEqual(expect.objectContaining({
      kokoroPreload: expect.any(Function),
      kokoroGenerate: expect.any(Function),
      kokoroPreloadMarathon: expect.any(Function),
      kokoroGenerateMarathon: expect.any(Function),
      kokoroVoices: expect.any(Function),
      kokoroModelStatus: expect.any(Function),
      kokoroDownload: expect.any(Function),
      nanoStatus: expect.any(Function),
      nanoSynthesize: expect.any(Function),
      nanoCancel: expect.any(Function),
      nanoShutdown: expect.any(Function),
      nanoRestart: expect.any(Function),
    }));

    await exposedApi.nanoStatus();
    await exposedApi.nanoSynthesize({ text: "hello nano", voice: "default", rate: 1.0 });
    await exposedApi.nanoCancel("nano-req-1");
    await exposedApi.nanoShutdown();
    await exposedApi.nanoRestart();

    expect(invoked).toEqual([
      { channel: "tts-nano-status", args: [] },
      { channel: "tts-nano-synthesize", args: [{ text: "hello nano", voice: "default", rate: 1.0 }] },
      { channel: "tts-nano-cancel", args: ["nano-req-1"] },
      { channel: "tts-nano-shutdown", args: [] },
      { channel: "tts-nano-restart", args: [] },
    ]);
  });
});
