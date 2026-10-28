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

function createPocketEngineStub() {
  return {
    status: vi.fn().mockResolvedValue({ ok: true }),
    synthesize: vi.fn().mockResolvedValue({ ok: true }),
    cancel: vi.fn().mockResolvedValue({ ok: true }),
    shutdown: vi.fn().mockResolvedValue({ ok: true }),
    restart: vi.fn().mockResolvedValue({ ok: true }),
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
      };
    }
    if (request === "../qwen-engine") return { getModelStatus: vi.fn(), preload: vi.fn(), preflight: vi.fn(), listVoices: vi.fn(), generate: vi.fn() };
    if (request === "../qwen-streaming-engine") return { createQwenStreamingEngineManager: vi.fn(() => ({ startStream: vi.fn(), cancelStream: vi.fn(), getModelStatus: vi.fn(), onStreamAudio: vi.fn(), onStreamFinished: vi.fn() })) };
    if (request === "../moss-nano-engine" || request === "../moss-nano-engine.js") {
      return {
        getSharedMossNanoEngine: vi.fn(() => ({
          status: vi.fn(),
          synthesize: vi.fn(),
          cancel: vi.fn(),
          shutdown: vi.fn(),
          restart: vi.fn(),
        })),
      };
    }
    if (request === "../pocket-tts-engine" || request === "../pocket-tts-engine.js") {
      return {
        getSharedPocketTtsEngine: vi.fn(() => pocketEngine),
        getPocketTtsEngine: vi.fn(() => pocketEngine),
      };
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

describe("Pocket TTS IPC dormancy contract", () => {
  it("registers Pocket IPC channels without renaming Nano/Kokoro channels", () => {
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

  it("fails closed for all Pocket runtime entry points with engine-dormant", async () => {
    const harness = createIpcHarness();
    harness.loadAndRegister();

    await expect(harness.ipcHandlers.get("tts-pocket-status")()).resolves.toMatchObject({
      ok: false,
      status: "unavailable",
      reason: "engine-dormant",
      ready: false,
      loading: false,
      recoverable: false,
    });

    for (const [channel, args] of [
      ["tts-pocket-synthesize", [{ text: "hello pocket", voice: "default", rate: 1 }]],
      ["tts-pocket-cancel", ["pocket-req-1"]],
      ["tts-pocket-shutdown", []],
      ["tts-pocket-restart", []],
    ]) {
      await expect(harness.ipcHandlers.get(channel)(null, ...args)).resolves.toMatchObject({
        ok: false,
        status: "unavailable",
        reason: "engine-dormant",
        recoverable: false,
      });
    }

    expect(harness.pocketEngine.status).not.toHaveBeenCalled();
    expect(harness.pocketEngine.synthesize).not.toHaveBeenCalled();
    expect(harness.pocketEngine.cancel).not.toHaveBeenCalled();
    expect(harness.pocketEngine.shutdown).not.toHaveBeenCalled();
    expect(harness.pocketEngine.restart).not.toHaveBeenCalled();
  });

  it("keeps Qwen IPC as disabled compatibility stubs", async () => {
    const harness = createIpcHarness();
    harness.loadAndRegister();

    await expect(harness.ipcHandlers.get("tts-qwen-model-status")()).resolves.toMatchObject({
      status: "unavailable",
      ready: false,
      reason: "qwen-disabled",
    });
    await expect(harness.ipcHandlers.get("tts-qwen-preload")()).resolves.toMatchObject({
      status: "unavailable",
      reason: "qwen-disabled",
    });
  });
});

describe("Pocket preload contract", () => {
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
});
