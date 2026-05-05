import { EventEmitter } from "events";
import { describe, expect, it, vi } from "vitest";

import pocketEngineModule from "../main/pocket-tts-engine.js";
import pocketSidecarModule from "../main/pocket-tts-sidecar.js";

const { createPocketTtsEngine } = pocketEngineModule;
const { createPocketTtsSidecarAdapter } = pocketSidecarModule;

function createIdSequence(prefix) {
  let next = 0;
  return () => `${prefix}-${++next}`;
}

function createLifecycleConfig(overrides = {}) {
  return {
    pythonExe: "C:\\fake\\python.exe",
    runtimeDir: "C:\\fake\\pocket-tts",
    modelDir: "C:\\fake\\pocket-tts\\model",
    referenceWavPath: null,
    outputDir: "C:\\fake\\out",
    commandTimeoutMs: 250,
    synthesizeTimeoutMs: 1000,
    maxInFlight: 1,
    restartBackoffMs: 25,
    ...overrides,
  };
}

class FakePocketAdapter {
  constructor({ ready = true } = {}) {
    this.ready = ready;
    this.calls = [];
    this.pending = new Map();
  }

  async start(config) {
    this.calls.push({ type: "start", config });
    return {
      ok: this.ready,
      status: this.ready ? "ready" : "unavailable",
      reason: this.ready ? null : "sidecar-not-ready",
      ready: this.ready,
      loading: false,
      recoverable: !this.ready,
    };
  }

  async status() {
    this.calls.push({ type: "status" });
    return {
      ok: this.ready,
      status: this.ready ? "ready" : "unavailable",
      reason: this.ready ? null : "sidecar-not-ready",
      ready: this.ready,
      loading: false,
      recoverable: !this.ready,
    };
  }

  request(command, payload) {
    this.calls.push({ type: "request", command, payload });
    return new Promise((resolve) => {
      this.pending.set(payload.requestId, { command, payload, resolve });
    });
  }

  emitOutput(requestId, output) {
    const pending = this.pending.get(requestId);
    if (!pending) throw new Error(`No pending Pocket request for ${requestId}`);
    this.pending.delete(requestId);
    pending.resolve(output);
  }

  async cancel(payload) {
    this.calls.push({ type: "cancel", payload });
    return { ok: true, cancelled: true, requestId: payload.requestId };
  }

  async shutdown() {
    this.calls.push({ type: "shutdown" });
    this.ready = false;
    return { ok: true, status: "shutdown", ready: false };
  }

  async restart(config) {
    this.calls.push({ type: "restart", config });
    this.ready = true;
    return { ok: true, status: "ready", ready: true };
  }
}

function makeManager(overrides = {}) {
  const adapter = overrides.adapter ?? new FakePocketAdapter();
  const config = overrides.config ?? createLifecycleConfig();
  const manager = createPocketTtsEngine({
    config,
    sidecarAdapter: adapter,
    createRequestId: overrides.createRequestId ?? createIdSequence("pocket-req"),
    createOwnerToken: overrides.createOwnerToken ?? createIdSequence("pocket-owner"),
    now: overrides.now ?? (() => 1700000000000),
  });
  return { adapter, config, manager };
}

class FakeSidecarChild extends EventEmitter {
  constructor() {
    super();
    this.stdout = new EventEmitter();
    this.stderr = new EventEmitter();
    this.stdin = {
      writes: [],
      write: vi.fn((chunk) => {
        this.stdin.writes.push(String(chunk));
        return true;
      }),
      end: vi.fn(),
      destroy: vi.fn(),
    };
    this.pid = 12345;
    this.kill = vi.fn(() => {
      this.emit("exit", 0, null);
      return true;
    });
  }

  emitStdout(message) {
    this.stdout.emit("data", Buffer.from(`${JSON.stringify(message)}\n`, "utf8"));
  }

  writtenCommands() {
    return this.stdin.writes
      .join("")
      .trim()
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  }
}

function createSpawnHarness() {
  const children = [];
  const spawn = vi.fn(() => {
    const child = new FakeSidecarChild();
    children.push(child);
    return child;
  });
  return { spawn, children };
}

describe("Pocket TTS sidecar manager contract", () => {
  it("resolves default packaged paths under Electron resources instead of the dev checkout", () => {
    expect(pocketEngineModule.createPocketTtsDefaultConfig).toEqual(expect.any(Function));
    const config = pocketEngineModule.createPocketTtsDefaultConfig({
      packaged: true,
      resourcesPath: "C:\\Program Files\\Blurby\\resources",
      tempRoot: "C:\\Users\\reader\\AppData\\Local\\Temp\\Blurby",
    });

    expect(config.runtimeDir).toBe("C:\\Program Files\\Blurby\\resources\\.runtime\\pocket-tts");
    expect(config.modelDir).toBe("C:\\Program Files\\Blurby\\resources\\.runtime\\pocket-tts\\model");
    expect(config.outputDir).toBe("C:\\Users\\reader\\AppData\\Local\\Temp\\Blurby\\pocket-tts-sidecar");
    expect(config.runtimeDir).not.toContain("postv2-audit-remediation");
  });

  it("resolves the packaged Pocket Python bridge from app.asar.unpacked resources", () => {
    expect(pocketSidecarModule.resolvePocketTtsBridgePath).toEqual(expect.any(Function));

    expect(pocketSidecarModule.resolvePocketTtsBridgePath({
      packaged: true,
      resourcesPath: "C:\\Program Files\\Blurby\\resources",
    })).toBe("C:\\Program Files\\Blurby\\resources\\app.asar.unpacked\\scripts\\pocket_tts_sidecar.py");
  });

  it("starts Pocket during status and reports the ready snapshot", async () => {
    const { manager } = makeManager();

    await expect(manager.status()).resolves.toMatchObject({
      ok: true,
      status: "ready",
      ready: true,
      loading: false,
    });
  });

  it("reflects bounded Pocket lifecycle config without leaking pythonExe", async () => {
    const config = createLifecycleConfig({
      commandTimeoutMs: 111,
      synthesizeTimeoutMs: 222,
      maxInFlight: 1,
      restartBackoffMs: 33,
      ignoredImplementationDetail: "must-not-leak",
    });
    const { manager } = makeManager({ config });

    const status = await manager.status();

    expect(status.config).toEqual({
      runtimeDir: config.runtimeDir,
      modelDir: config.modelDir,
      referenceWavPath: null,
      commandTimeoutMs: 111,
      synthesizeTimeoutMs: 222,
      maxInFlight: 1,
      restartBackoffMs: 33,
    });
    expect(status.config).not.toHaveProperty("pythonExe");
    expect(status.config).not.toHaveProperty("ignoredImplementationDetail");
  });

  it("assigns Pocket request ownership and resolves only matching output", async () => {
    const { adapter, manager } = makeManager();

    const synthesizePromise = manager.synthesize({ text: "hello pocket", voice: "default", rate: 1 });
    await vi.waitFor(() => expect(adapter.calls.some((call) => call.type === "request")).toBe(true));

    adapter.emitOutput("pocket-req-1", {
      ok: true,
      requestId: "pocket-req-1",
      ownerToken: "pocket-owner-1",
      audio: [0, 0.1, -0.1],
      sampleRate: 24000,
      durationMs: 20,
    });

    await expect(synthesizePromise).resolves.toMatchObject({
      ok: true,
      requestId: "pocket-req-1",
      ownerToken: "pocket-owner-1",
    });
  });

  it("rejects stale Pocket sidecar output with the wrong owner token", async () => {
    const { adapter, manager } = makeManager();

    const synthesizePromise = manager.synthesize({ text: "hello pocket", voice: "default", rate: 1 });
    await vi.waitFor(() => expect(adapter.calls.some((call) => call.type === "request")).toBe(true));

    adapter.emitOutput("pocket-req-1", {
      ok: true,
      requestId: "pocket-req-1",
      ownerToken: "wrong-owner",
      audio: [0],
      sampleRate: 24000,
    });

    await expect(synthesizePromise).resolves.toMatchObject({
      ok: false,
      reason: "stale-sidecar-output",
      requestId: "pocket-req-1",
      ownerToken: "pocket-owner-1",
    });
  });

  it("enforces one Pocket request in flight by default", async () => {
    const { manager } = makeManager();

    void manager.synthesize({ text: "first", rate: 1 });
    const second = await manager.synthesize({ text: "second", rate: 1 });

    expect(second).toMatchObject({
      ok: false,
      reason: "too-many-in-flight",
    });
  });

  it("settles active Pocket requests during shutdown", async () => {
    const { manager } = makeManager();

    const synthesizePromise = manager.synthesize({ text: "hello", rate: 1 });
    await manager.shutdown();

    await expect(synthesizePromise).resolves.toMatchObject({
      ok: false,
      reason: "sidecar-shutdown",
    });
  });

  it("forwards Pocket cancel with request ownership", async () => {
    const { adapter, manager } = makeManager();

    const synthesizePromise = manager.synthesize({ text: "hello", rate: 1 });
    await vi.waitFor(() => expect(adapter.calls.some((call) => call.type === "request")).toBe(true));

    const cancelResult = await manager.cancel("pocket-req-1");

    expect(cancelResult).toMatchObject({ ok: true, cancelled: true, requestId: "pocket-req-1" });
    expect(adapter.calls.find((call) => call.type === "cancel")?.payload).toEqual({
      requestId: "pocket-req-1",
      ownerToken: "pocket-owner-1",
    });
    await expect(synthesizePromise).resolves.toMatchObject({ ok: false, reason: "cancelled" });
  });

  it("spawns the Pocket Python bridge with runtime, model, output, and reference WAV args", async () => {
    const { spawn, children } = createSpawnHarness();
    const adapter = createPocketTtsSidecarAdapter({ spawn, bridgePath: "scripts/pocket_tts_sidecar.py" });
    const startPromise = adapter.start(createLifecycleConfig({ referenceWavPath: "C:\\fake\\ref.wav" }));

    expect(spawn).toHaveBeenCalledWith("C:\\fake\\python.exe", expect.arrayContaining([
      "scripts/pocket_tts_sidecar.py",
      "--runtime-dir",
      "C:\\fake\\pocket-tts",
      "--model-dir",
      "C:\\fake\\pocket-tts\\model",
      "--output-dir",
      "C:\\fake\\out",
      "--reference-wav",
      "C:\\fake\\ref.wav",
    ]), expect.objectContaining({ windowsHide: true }));

    children[0].emitStdout({ type: "ready", ok: true, status: "ready", ready: true });
    await expect(startPromise).resolves.toMatchObject({ ready: true });
  });

  it("sends Pocket synthesize commands over JSON lines", async () => {
    const { spawn, children } = createSpawnHarness();
    const adapter = createPocketTtsSidecarAdapter({ spawn, bridgePath: "scripts/pocket_tts_sidecar.py" });
    const startPromise = adapter.start(createLifecycleConfig());
    children[0].emitStdout({ type: "ready", ok: true, status: "ready", ready: true });
    await startPromise;

    const requestPromise = adapter.request("synthesize", {
      requestId: "pocket-req-1",
      ownerToken: "owner-1",
      text: "hello pocket",
      voice: "default",
      rate: 1,
    });

    expect(children[0].writtenCommands()[0]).toMatchObject({
      command: "synthesize",
      requestId: "pocket-req-1",
      ownerToken: "owner-1",
      text: "hello pocket",
    });

    children[0].emitStdout({
      type: "result",
      ok: true,
      requestId: "pocket-req-1",
      ownerToken: "owner-1",
      audio: [0],
      sampleRate: 24000,
      syntheticAudio: false,
    });
    await expect(requestPromise).resolves.toMatchObject({ ok: true, requestId: "pocket-req-1" });
  });

  it("rejects synthetic Pocket audio outside mock mode", async () => {
    const { spawn, children } = createSpawnHarness();
    const adapter = createPocketTtsSidecarAdapter({ spawn, bridgePath: "scripts/pocket_tts_sidecar.py" });
    const startPromise = adapter.start(createLifecycleConfig());
    children[0].emitStdout({ type: "ready", ok: true, status: "ready", ready: true });
    await startPromise;

    const requestPromise = adapter.request("synthesize", { requestId: "pocket-req-1", ownerToken: "owner-1" });
    children[0].emitStdout({
      type: "result",
      ok: true,
      requestId: "pocket-req-1",
      ownerToken: "owner-1",
      audio: [0],
      sampleRate: 24000,
      syntheticAudio: true,
    });

    await expect(requestPromise).resolves.toMatchObject({
      ok: false,
      reason: "synthetic-audio-forbidden",
    });
  });
});
