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

function createNanoEngineStub() {
  return {
    status: vi.fn().mockResolvedValue({ ok: true }),
    synthesize: vi.fn().mockResolvedValue({ ok: true }),
    cancel: vi.fn().mockResolvedValue({ ok: true }),
    shutdown: vi.fn().mockResolvedValue({ ok: true }),
    restart: vi.fn().mockResolvedValue({ ok: true }),
  };
}

function createIpcHarness({ nanoEngine = createNanoEngineStub() } = {}) {
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

  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    if (request === "../tts-engine") {
      return {
        setLoadingCallback: vi.fn(),
        generate: vi.fn(),
        listVoices: vi.fn(),
        getModelStatus: vi.fn(() => ({ ready: false })),
        isModelReady: vi.fn(() => false),
        downloadModel: vi.fn(),
        preload: vi.fn(),
        preflight: vi.fn().mockResolvedValue({
          ok: true,
          status: "offline-ready",
          ready: false,
          loading: false,
          recoverable: false,
          offlineReady: true,
        }),
      };
    }
    if (request === "../qwen-engine") return { getModelStatus: vi.fn(), preload: vi.fn(), preflight: vi.fn(), listVoices: vi.fn(), generate: vi.fn() };
    if (request === "../qwen-streaming-engine") return { createQwenStreamingEngineManager: vi.fn(() => ({ startStream: vi.fn(), cancelStream: vi.fn(), getModelStatus: vi.fn(), onStreamAudio: vi.fn(), onStreamFinished: vi.fn() })) };
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
    if (request === "../moss-nano-engine" || request === "../moss-nano-engine.js") {
      return {
        getSharedMossNanoEngine: vi.fn(() => nanoEngine),
        getMossNanoEngine: vi.fn(() => nanoEngine),
      };
    }
    return originalLoad.call(this, request, parent, isMain);
  };

  return {
    ipcHandlers,
    nanoEngine,
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

describe("MOSS Nano IPC dormancy contract", () => {
  it("registers Nano IPC channels without renaming Kokoro channels", () => {
    const harness = createIpcHarness();
    harness.loadAndRegister();

    expect([...harness.ipcHandlers.keys()]).toEqual(expect.arrayContaining([
      "tts-kokoro-generate",
      "tts-kokoro-voices",
      "tts-kokoro-model-status",
      "tts-kokoro-download",
      "tts-kokoro-preload",
      "tts-kokoro-preflight",
      "tts-nano-status",
      "tts-nano-synthesize",
      "tts-nano-cancel",
      "tts-nano-shutdown",
      "tts-nano-restart",
    ]));
  });

  it("fails closed for all Nano runtime entry points with engine-dormant", async () => {
    const harness = createIpcHarness();
    harness.loadAndRegister();

    await expect(harness.ipcHandlers.get("tts-nano-status")()).resolves.toMatchObject({
      ok: false,
      status: "unavailable",
      reason: "engine-dormant",
      ready: false,
      loading: false,
      recoverable: false,
    });

    for (const [channel, args] of [
      ["tts-nano-synthesize", [{ text: "hello nano", voice: "default", rate: 1.0 }]],
      ["tts-nano-cancel", ["nano-req-1"]],
      ["tts-nano-shutdown", []],
      ["tts-nano-restart", []],
    ]) {
      await expect(harness.ipcHandlers.get(channel)(null, ...args)).resolves.toMatchObject({
        ok: false,
        status: "unavailable",
        reason: "engine-dormant",
        recoverable: false,
      });
    }

    expect(harness.nanoEngine.status).not.toHaveBeenCalled();
    expect(harness.nanoEngine.synthesize).not.toHaveBeenCalled();
    expect(harness.nanoEngine.cancel).not.toHaveBeenCalled();
    expect(harness.nanoEngine.shutdown).not.toHaveBeenCalled();
    expect(harness.nanoEngine.restart).not.toHaveBeenCalled();
  });
});

describe("MOSS Nano preload contract", () => {
  it("keeps preload bridge channels stable", async () => {
    const { exposedApi, invoked } = createPreloadHarness();

    expect(exposedApi).toEqual(expect.objectContaining({
      kokoroPreflight: expect.any(Function),
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
    await exposedApi.kokoroPreflight();

    expect(invoked).toEqual([
      { channel: "tts-nano-status", args: [] },
      { channel: "tts-nano-synthesize", args: [{ text: "hello nano", voice: "default", rate: 1.0 }] },
      { channel: "tts-nano-cancel", args: ["nano-req-1"] },
      { channel: "tts-nano-shutdown", args: [] },
      { channel: "tts-nano-restart", args: [] },
      { channel: "tts-kokoro-preflight", args: [] },
    ]);
  });
});
