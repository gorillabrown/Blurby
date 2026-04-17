import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "events";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve()).then(() => Promise.resolve());
}

function clearModule(modulePath) {
  try {
    delete require.cache[require.resolve(modulePath)];
  } catch {
    // Module may not have been loaded in this test.
  }
}

function clearMainModules() {
  clearModule("../main/tts-engine.js");
  clearModule("../main/tts-engine-marathon.js");
  clearModule("../main/ipc/tts.js");
}

function createMainProcessHarness() {
  const workers = [];
  const sentEvents = [];
  const loadingSignals = [];
  const ipcHandlers = new Map();
  const browserWindow = {
    isDestroyed: () => false,
    webContents: {
      send: vi.fn((channel, payload) => {
        sentEvents.push({ channel, payload });
      }),
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
  const fsPromises = {
    mkdir: vi.fn().mockResolvedValue(undefined),
  };
  const constants = {
    KOKORO_SAMPLE_RATE: 24000,
    TTS_IDLE_TIMEOUT_MS: 60_000,
    TTS_MODEL_LOAD_TIMEOUT_MS: 30_000,
  };

  class MockWorker extends EventEmitter {
    constructor(filename, options) {
      super();
      this.filename = filename;
      this.options = options;
      this.postedMessages = [];
      this.terminated = false;
      workers.push(this);
    }

    postMessage(message) {
      this.postedMessages.push(message);
    }

    terminate() {
      this.terminated = true;
      return Promise.resolve(0);
    }
  }

  const marathonStub = {
    generate: vi.fn(),
    preload: vi.fn(),
  };
  const epubWordExtractorStub = {
    extractWords: vi.fn(),
  };
  const ttsCacheStub = {
    readChunk: vi.fn(),
    writeChunk: vi.fn(),
    hasChunk: vi.fn(),
    getCachedChunks: vi.fn(),
    evictBook: vi.fn(),
    evictBookVoice: vi.fn(),
    getCacheInfo: vi.fn(),
    getOpeningCoverageMs: vi.fn(),
  };

  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    if (request === "worker_threads") return { Worker: MockWorker };
    if (request === "fs/promises") return fsPromises;
    if (request === "./constants") return constants;
    if (request === "../tts-engine-marathon") return marathonStub;
    if (request === "../epub-word-extractor") return epubWordExtractorStub;
    if (request === "../tts-cache") return ttsCacheStub;
    return originalLoad.apply(this, arguments);
  };

  return {
    workers,
    sentEvents,
    loadingSignals,
    ipcHandlers,
    browserWindow,
    electronMock,
    fsPromises,
    constants,
    marathonStub,
    loadEngine() {
      clearMainModules();
      return require("../main/tts-engine.js");
    },
    loadMarathonEngine() {
      clearMainModules();
      return require("../main/tts-engine-marathon.js");
    },
    loadIpcRegister() {
      clearMainModules();
      return require("../main/ipc/tts.js");
    },
    getLastWorker() {
      return workers[workers.length - 1] || null;
    },
    getLastPosted(worker, type) {
      return [...worker.postedMessages].reverse().find((message) => message.type === type);
    },
    registerLoadingSignals(engine) {
      engine.setLoadingCallback((loading) => {
        loadingSignals.push(loading);
      });
    },
  };
}

beforeEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  Module._load = originalLoad;
  clearMainModules();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  Module._load = originalLoad;
  clearMainModules();
});

describe("tts-engine runtime recovery", () => {
  it("treats model-loaded as informational and waits for model-ready before resolving", async () => {
    const harness = createMainProcessHarness();
    const engine = harness.loadEngine();
    harness.registerLoadingSignals(engine);

    let settled = false;
    const readyPromise = engine.downloadModel().then(
      () => { settled = true; },
      () => { settled = true; },
    );

    await flushPromises();
    const worker = harness.getLastWorker();
    expect(worker).not.toBeNull();
    expect(worker.postedMessages[0]).toMatchObject({ type: "load" });
    expect(harness.loadingSignals).toEqual([true]);

    worker.emit("message", { type: "model-loaded" });
    await flushPromises();

    expect(settled).toBe(false);
    expect(engine.isModelReady()).toBe(false);
    expect(engine.getModelStatus()).toMatchObject({
      status: "warming",
      detail: "Model loaded; running Kokoro warm-up",
      reason: null,
      ready: false,
      loading: true,
      recoverable: false,
    });

    worker.emit("message", { type: "model-ready" });
    await readyPromise;

    expect(engine.isModelReady()).toBe(true);
    expect(engine.getModelStatus()).toMatchObject({
      status: "ready",
      reason: null,
      ready: true,
      loading: false,
      recoverable: false,
    });
    expect(harness.loadingSignals).toEqual([true, false]);
  });

  it("fails fast on load-error without waiting for timeout or faking loading completion", async () => {
    vi.useFakeTimers();
    const harness = createMainProcessHarness();
    const engine = harness.loadEngine();
    harness.registerLoadingSignals(engine);

    const readyPromise = engine.downloadModel();
    await flushPromises();

    const worker = harness.getLastWorker();
    worker.emit("message", { type: "load-error", error: "Missing Kokoro weights" });

    await expect(readyPromise).rejects.toMatchObject({
      message: "Missing Kokoro weights",
      reason: "load-error",
      status: "error",
      recoverable: false,
    });

    expect(worker.terminated).toBe(true);
    expect(engine.isModelReady()).toBe(false);
    expect(engine.getModelStatus()).toMatchObject({
      status: "error",
      detail: "Missing Kokoro weights",
      reason: "load-error",
      ready: false,
      loading: false,
      recoverable: false,
    });
    expect(harness.loadingSignals).toEqual([true]);
    expect(harness.sentEvents).toContainEqual({
      channel: "tts-kokoro-download-error",
      payload: "Missing Kokoro weights",
    });
  });

  it("fails fast on warm-up-failed, never marks ready, and leaves loading false only in status snapshot", async () => {
    vi.useFakeTimers();
    const harness = createMainProcessHarness();
    const engine = harness.loadEngine();
    harness.registerLoadingSignals(engine);

    const readyPromise = engine.downloadModel();
    await flushPromises();

    const worker = harness.getLastWorker();
    worker.emit("message", { type: "model-loaded" });
    worker.emit("message", { type: "warm-up-failed", error: "ONNX warm-up exploded" });

    await expect(readyPromise).rejects.toMatchObject({
      message: "Kokoro warm-up failed: ONNX warm-up exploded",
      reason: "warm-up-failed",
      status: "error",
      recoverable: false,
    });

    expect(worker.terminated).toBe(true);
    expect(engine.isModelReady()).toBe(false);
    expect(engine.getModelStatus()).toMatchObject({
      status: "error",
      reason: "warm-up-failed",
      ready: false,
      loading: false,
      recoverable: false,
    });
    expect(harness.loadingSignals).toEqual([true]);
    expect(harness.sentEvents).toContainEqual({
      channel: "tts-kokoro-download-error",
      payload: "Kokoro TTS warm-up failed: ONNX warm-up exploded. Using system voice instead.",
    });
  });

  it("rejects stranded in-flight requests on worker crash and limits recovery to future requests", async () => {
    vi.useFakeTimers();
    const harness = createMainProcessHarness();
    const engine = harness.loadEngine();
    harness.registerLoadingSignals(engine);

    const bootPromise = engine.downloadModel();
    await flushPromises();
    const firstWorker = harness.getLastWorker();
    firstWorker.emit("message", { type: "model-ready" });
    await bootPromise;

    const firstGenerate = engine.generate("Hello world");
    await flushPromises();
    const strandedRequest = harness.getLastPosted(firstWorker, "generate");
    expect(strandedRequest).toBeTruthy();

    firstWorker.emit("error", new Error("Worker cratered"));

    await expect(firstGenerate).rejects.toMatchObject({
      message: "Worker cratered",
      reason: "worker-crash-retrying",
      status: "retrying",
      recoverable: true,
    });

    expect(engine.getModelStatus()).toMatchObject({
      status: "retrying",
      reason: "worker-crash-retrying",
      ready: false,
      loading: true,
      recoverable: true,
    });

    // A late result from the dead worker must not resurrect the orphaned request.
    firstWorker.emit("message", {
      type: "result",
      id: strandedRequest.id,
      audio: new Float32Array([0.25]),
      sampleRate: 24000,
      durationMs: 10,
    });
    await flushPromises();

    vi.advanceTimersByTime(1000);
    await flushPromises();

    const secondWorker = harness.getLastWorker();
    expect(secondWorker).not.toBe(firstWorker);
    secondWorker.emit("message", { type: "model-ready" });
    await flushPromises();

    const secondGenerate = engine.generate("Recovered request");
    await flushPromises();
    const recoveredRequest = harness.getLastPosted(secondWorker, "generate");
    secondWorker.emit("message", {
      type: "result",
      id: recoveredRequest.id,
      audio: new Float32Array([0.5, 0.75]),
      sampleRate: 24000,
      durationMs: 20,
    });

    await expect(secondGenerate).resolves.toMatchObject({
      sampleRate: 24000,
      durationMs: 20,
    });
  });

  it("ignores stale sprint retry timers after a later recovery already reached ready", async () => {
    vi.useFakeTimers();
    const harness = createMainProcessHarness();
    const engine = harness.loadEngine();
    harness.registerLoadingSignals(engine);

    const bootPromise = engine.downloadModel();
    await flushPromises();
    const firstWorker = harness.getLastWorker();
    firstWorker.emit("message", { type: "model-ready" });
    await bootPromise;

    const crashedGenerate = engine.generate("Crash before retry backoff");
    await flushPromises();
    firstWorker.emit("error", new Error("Worker cratered"));

    await expect(crashedGenerate).rejects.toMatchObject({
      message: "Worker cratered",
      reason: "worker-crash-retrying",
      status: "retrying",
      recoverable: true,
    });

    const recoveryPromise = engine.downloadModel();
    await flushPromises();
    const secondWorker = harness.getLastWorker();
    expect(secondWorker).not.toBe(firstWorker);

    secondWorker.emit("message", { type: "model-ready" });
    await recoveryPromise;

    expect(engine.getModelStatus()).toMatchObject({
      status: "ready",
      reason: null,
      ready: true,
      loading: false,
      recoverable: false,
    });

    const workerCountBeforeTimer = harness.workers.length;
    const eventCountBeforeTimer = harness.sentEvents.length;

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(harness.workers).toHaveLength(workerCountBeforeTimer);
    expect(engine.getModelStatus()).toMatchObject({
      status: "ready",
      reason: null,
      ready: true,
      loading: false,
      recoverable: false,
    });
    expect(
      harness.sentEvents.slice(eventCountBeforeTimer).filter(
        (event) =>
          event.channel === "tts-kokoro-engine-status" &&
          event.payload?.status === "warming" &&
          event.payload?.reason === "worker-crash-retrying",
      ),
    ).toHaveLength(0);
  });
});

describe("tts-engine marathon parity", () => {
  it("treats model-loaded as informational and rejects warm-up failure before timeout", async () => {
    vi.useFakeTimers();
    const harness = createMainProcessHarness();
    const marathon = harness.loadMarathonEngine();

    const generatePromise = marathon.generate("Background job");
    await flushPromises();

    const worker = harness.getLastWorker();
    worker.emit("message", { type: "model-loaded" });
    worker.emit("message", { type: "warm-up-failed", error: "Marathon warm-up broke" });

    await expect(generatePromise).rejects.toMatchObject({
      message: "Marathon warm-up failed: Marathon warm-up broke",
      reason: "warm-up-failed",
      status: "error",
      recoverable: false,
    });
    expect(marathon.isModelReady()).toBe(false);
  });

  it("rejects in-flight marathon requests with structured retry metadata and only recovers future requests", async () => {
    vi.useFakeTimers();
    const harness = createMainProcessHarness();
    const marathon = harness.loadMarathonEngine();

    const preloadPromise = marathon.preload();
    await flushPromises();
    const firstWorker = harness.getLastWorker();
    firstWorker.emit("message", { type: "model-ready" });
    await preloadPromise;

    const firstGenerate = marathon.generate("Cache me");
    await flushPromises();
    const strandedRequest = harness.getLastPosted(firstWorker, "generate");

    firstWorker.emit("error", new Error("Marathon worker died"));
    await expect(firstGenerate).rejects.toMatchObject({
      message: "Marathon worker died",
      reason: "worker-crash-retrying",
      status: "retrying",
      recoverable: true,
    });

    firstWorker.emit("message", {
      type: "result",
      id: strandedRequest.id,
      audio: new Float32Array([0.25]),
      sampleRate: 24000,
      durationMs: 5,
    });
    await flushPromises();

    vi.advanceTimersByTime(1000);
    await flushPromises();

    const secondWorker = harness.getLastWorker();
    expect(secondWorker).not.toBe(firstWorker);
    secondWorker.emit("message", { type: "model-ready" });
    await flushPromises();

    const secondGenerate = marathon.generate("Fresh retry");
    await flushPromises();
    const recoveredRequest = harness.getLastPosted(secondWorker, "generate");
    expect(recoveredRequest.id).not.toBe(strandedRequest.id);
    secondWorker.emit("message", {
      type: "result",
      id: recoveredRequest.id,
      audio: new Float32Array([1]),
      sampleRate: 24000,
      durationMs: 5,
    });

    await expect(secondGenerate).resolves.toMatchObject({
      sampleRate: 24000,
      durationMs: 5,
    });
  });

  it("surfaces structured exhaustion metadata after marathon crash retries are spent", async () => {
    vi.useFakeTimers();
    const harness = createMainProcessHarness();
    const marathon = harness.loadMarathonEngine();

    const preloadPromise = marathon.preload();
    await flushPromises();
    const firstWorker = harness.getLastWorker();
    firstWorker.emit("error", new Error("Crash one"));
    await expect(preloadPromise).rejects.toMatchObject({
      message: "Crash one",
      reason: "worker-crash-retrying",
      status: "retrying",
      recoverable: true,
    });

    vi.advanceTimersByTime(1000);
    await flushPromises();
    const secondWorker = harness.getLastWorker();
    expect(secondWorker).not.toBe(firstWorker);
    secondWorker.emit("error", new Error("Crash two"));

    vi.advanceTimersByTime(2000);
    await flushPromises();
    const thirdWorker = harness.getLastWorker();
    expect(thirdWorker).not.toBe(secondWorker);

    const thirdGenerate = marathon.generate("Attempt three");
    await flushPromises();
    thirdWorker.emit("error", new Error("Crash three"));
    await expect(thirdGenerate).rejects.toMatchObject({
      message: "Crash three",
      reason: "worker-crash-exhausted",
      status: "error",
      recoverable: false,
    });

    vi.advanceTimersByTime(5000);
    await flushPromises();
    expect(harness.workers).toHaveLength(3);

    const recoveryGenerate = marathon.generate("Fresh caller after exhaustion");
    await flushPromises();
    const fourthWorker = harness.getLastWorker();
    expect(fourthWorker).not.toBe(thirdWorker);
    fourthWorker.emit("message", { type: "model-ready" });
    await flushPromises();

    const recoveryRequest = harness.getLastPosted(fourthWorker, "generate");
    fourthWorker.emit("message", {
      type: "result",
      id: recoveryRequest.id,
      audio: new Float32Array([0.5]),
      sampleRate: 24000,
      durationMs: 5,
    });

    await expect(recoveryGenerate).resolves.toMatchObject({
      sampleRate: 24000,
      durationMs: 5,
    });
  });

  it("shutdown rejects active preload and pending generate work with structured idle metadata", async () => {
    vi.useFakeTimers();
    const harness = createMainProcessHarness();
    const marathon = harness.loadMarathonEngine();

    const preloadPromise = marathon.preload();
    await flushPromises();
    const preloadWorker = harness.getLastWorker();
    expect(preloadWorker).not.toBeNull();

    marathon.shutdown();

    await expect(preloadPromise).rejects.toMatchObject({
      message: "Marathon engine shut down",
      reason: "shutdown",
      status: "idle",
      recoverable: false,
    });
    expect(preloadWorker.terminated).toBe(true);

    const readyPromise = marathon.preload();
    await flushPromises();
    const requestWorker = harness.getLastWorker();
    expect(requestWorker).not.toBe(preloadWorker);
    requestWorker.emit("message", { type: "model-ready" });
    await readyPromise;

    const generatePromise = marathon.generate("Shutdown pending request");
    await flushPromises();
    expect(harness.getLastPosted(requestWorker, "generate")).toBeTruthy();

    marathon.shutdown();

    await expect(generatePromise).rejects.toMatchObject({
      message: "Marathon engine shut down",
      reason: "shutdown",
      status: "idle",
      recoverable: false,
    });
    expect(requestWorker.terminated).toBe(true);
  });

  it("shutdown cancels scheduled marathon retries so a crashed worker cannot respawn afterward", async () => {
    vi.useFakeTimers();
    const harness = createMainProcessHarness();
    const marathon = harness.loadMarathonEngine();

    const preloadPromise = marathon.preload();
    await flushPromises();
    const firstWorker = harness.getLastWorker();
    expect(firstWorker).not.toBeNull();

    firstWorker.emit("error", new Error("Crash before retry backoff"));
    await expect(preloadPromise).rejects.toMatchObject({
      message: "Crash before retry backoff",
      reason: "worker-crash-retrying",
      status: "retrying",
      recoverable: true,
    });

    marathon.shutdown();

    vi.advanceTimersByTime(5000);
    await flushPromises();

    expect(harness.workers).toHaveLength(1);
  });
});

describe("tts IPC contract", () => {
  it("returns structured warm-up failure metadata, truthful status snapshots, and no false loading=false signal", async () => {
    vi.useFakeTimers();
    const harness = createMainProcessHarness();
    harness.marathonStub.generate.mockResolvedValue({
      audio: new Float32Array([1]),
      sampleRate: 24000,
      durationMs: 5,
    });
    harness.marathonStub.preload.mockResolvedValue(undefined);

    const { register } = harness.loadIpcRegister();
    register({
      getMainWindow: () => harness.browserWindow,
      getLibrary: () => [],
    });

    const downloadHandler = harness.ipcHandlers.get("tts-kokoro-download");
    const statusHandler = harness.ipcHandlers.get("tts-kokoro-model-status");
    expect(downloadHandler).toBeTypeOf("function");
    expect(statusHandler).toBeTypeOf("function");

    const downloadPromise = downloadHandler();
    await flushPromises();

    const worker = harness.getLastWorker();
    worker.emit("message", { type: "model-loaded" });
    worker.emit("message", { type: "warm-up-failed", error: "Warm-up inference failed" });

    await expect(downloadPromise).resolves.toEqual({
      error: "Kokoro warm-up failed: Warm-up inference failed",
      reason: "warm-up-failed",
      status: "error",
      recoverable: false,
    });

    expect(harness.sentEvents.filter((event) => event.channel === "tts-kokoro-loading")).toEqual([
      { channel: "tts-kokoro-loading", payload: true },
    ]);

    const errorStatus = harness.sentEvents.find(
      (event) =>
        event.channel === "tts-kokoro-engine-status" &&
        event.payload?.reason === "warm-up-failed",
    );
    expect(errorStatus).toMatchObject({
      channel: "tts-kokoro-engine-status",
      payload: {
        status: "error",
        reason: "warm-up-failed",
        ready: false,
        loading: false,
        recoverable: false,
      },
    });

    expect(statusHandler()).toMatchObject({
      status: "error",
      reason: "warm-up-failed",
      ready: false,
      loading: false,
      recoverable: false,
    });
  });

  it("returns structured preload failure metadata instead of false success for sprint bootstrap failures", async () => {
    vi.useFakeTimers();
    const harness = createMainProcessHarness();
    harness.marathonStub.generate.mockResolvedValue({
      audio: new Float32Array([1]),
      sampleRate: 24000,
      durationMs: 5,
    });
    harness.marathonStub.preload.mockResolvedValue(undefined);

    const { register } = harness.loadIpcRegister();
    register({
      getMainWindow: () => harness.browserWindow,
      getLibrary: () => [],
    });

    const preloadHandler = harness.ipcHandlers.get("tts-kokoro-preload");
    expect(preloadHandler).toBeTypeOf("function");

    const preloadPromise = preloadHandler();
    await flushPromises();

    const worker = harness.getLastWorker();
    worker.emit("message", { type: "load-error", error: "Preload bootstrap failed" });

    await expect(preloadPromise).resolves.toEqual({
      error: "Preload bootstrap failed",
      reason: "load-error",
      status: "error",
      recoverable: false,
    });

    expect(harness.sentEvents.filter((event) => event.channel === "tts-kokoro-loading")).toEqual([
      { channel: "tts-kokoro-loading", payload: true },
    ]);
  });

  it("returns structured preload failure metadata instead of false success for marathon bootstrap failures", async () => {
    const harness = createMainProcessHarness();
    harness.marathonStub.generate.mockResolvedValue({
      audio: new Float32Array([1]),
      sampleRate: 24000,
      durationMs: 5,
    });
    harness.marathonStub.preload.mockRejectedValue(Object.assign(new Error("Marathon preload failed"), {
      reason: "warm-up-failed",
      status: "error",
      recoverable: false,
    }));

    const { register } = harness.loadIpcRegister();
    register({
      getMainWindow: () => harness.browserWindow,
      getLibrary: () => [],
    });

    const preloadHandler = harness.ipcHandlers.get("tts-kokoro-preload-marathon");
    expect(preloadHandler).toBeTypeOf("function");

    await expect(preloadHandler()).resolves.toEqual({
      error: "Marathon preload failed",
      reason: "warm-up-failed",
      status: "error",
      recoverable: false,
    });
  });

  it("returns recoverable crash metadata for in-flight generate failures", async () => {
    vi.useFakeTimers();
    const harness = createMainProcessHarness();
    harness.marathonStub.generate.mockResolvedValue({
      audio: new Float32Array([1]),
      sampleRate: 24000,
      durationMs: 5,
    });
    harness.marathonStub.preload.mockResolvedValue(undefined);

    const { register } = harness.loadIpcRegister();
    register({
      getMainWindow: () => harness.browserWindow,
      getLibrary: () => [],
    });

    const generateHandler = harness.ipcHandlers.get("tts-kokoro-generate");
    expect(generateHandler).toBeTypeOf("function");

    const responsePromise = generateHandler(null, "Crash me", "af_bella", 1.0, null);
    await flushPromises();

    const firstWorker = harness.getLastWorker();
    firstWorker.emit("message", { type: "model-ready" });
    await flushPromises();

    const request = harness.getLastPosted(firstWorker, "generate");
    firstWorker.emit("error", new Error("Boom during generate"));

    await expect(responsePromise).resolves.toEqual({
      error: "Boom during generate",
      reason: "worker-crash-retrying",
      status: "retrying",
      recoverable: true,
    });

    const retryingStatus = harness.sentEvents.find(
      (event) =>
        event.channel === "tts-kokoro-engine-status" &&
        event.payload?.reason === "worker-crash-retrying" &&
        event.payload?.status === "retrying",
    );
    expect(retryingStatus).toBeTruthy();

    firstWorker.emit("message", {
      type: "result",
      id: request.id,
      audio: new Float32Array([9]),
      sampleRate: 24000,
      durationMs: 5,
    });
    await flushPromises();

    vi.advanceTimersByTime(1000);
    await flushPromises();

    const secondWorker = harness.getLastWorker();
    expect(secondWorker).not.toBe(firstWorker);
  });
});
