import { EventEmitter } from "events";
import { spawnSync } from "child_process";
import { describe, expect, it, vi } from "vitest";

import mossNanoEngineModule from "../main/moss-nano-engine.js";
import mossNanoSidecarModule from "../main/moss-nano-sidecar.js";

const { createMossNanoEngine } = mossNanoEngineModule;
const { createMossNanoSidecarAdapter } = mossNanoSidecarModule;

function createIdSequence(prefix) {
  let next = 0;
  return () => `${prefix}-${++next}`;
}

function createLifecycleConfig(overrides = {}) {
  return {
    pythonExe: "C:\\fake\\python.exe",
    runtimeDir: "C:\\fake\\moss-nano",
    modelDir: "C:\\fake\\moss-nano\\model",
    tokenizerDir: "C:\\fake\\moss-nano\\tokenizer",
    commandTimeoutMs: 250,
    synthesizeTimeoutMs: 1000,
    maxInFlight: 1,
    restartBackoffMs: 25,
    ...overrides,
  };
}

class FakeMossNanoAdapter {
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
    if (!pending) throw new Error(`No pending request for ${requestId}`);
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
    return { ok: true, status: "shutdown" };
  }

  async restart(config) {
    this.calls.push({ type: "restart", config });
    this.ready = true;
    return { ok: true, status: "ready", ready: true };
  }
}

class ManualStartupMossNanoAdapter extends FakeMossNanoAdapter {
  constructor() {
    super();
    this.startResolved = false;
    this.releaseStart = null;
  }

  async start(config) {
    this.calls.push({ type: "start", config });
    await new Promise((resolve) => {
      this.releaseStart = resolve;
    });
    this.startResolved = true;
    return {
      ok: true,
      status: "ready",
      reason: null,
      ready: true,
      recoverable: true,
    };
  }

  request(command, payload) {
    this.calls.push({
      type: "request",
      command,
      payload,
      startResolved: this.startResolved,
    });
    return Promise.resolve({
      ok: true,
      requestId: payload.requestId,
      ownerToken: payload.ownerToken,
      outputPath: "C:\\fake\\out\\started-first.wav",
      sampleRate: 24000,
      durationMs: 1,
    });
  }
}

class RejectingCancelMossNanoAdapter extends FakeMossNanoAdapter {
  async cancel(payload) {
    this.calls.push({ type: "cancel", payload });
    throw new Error("sidecar cancel transport failed");
  }
}

function makeManager(overrides = {}) {
  const adapter = overrides.adapter ?? new FakeMossNanoAdapter();
  const config = overrides.config ?? createLifecycleConfig();
  const manager = createMossNanoEngine({
    config,
    sidecarAdapter: adapter,
    createRequestId: overrides.createRequestId ?? createIdSequence("req"),
    createOwnerToken: overrides.createOwnerToken ?? createIdSequence("owner"),
    now: overrides.now ?? (() => 1700000000000),
  });
  return { adapter, config, manager };
}

async function expectSettled(promise) {
  const sentinel = Symbol("pending");
  const result = await Promise.race([promise, Promise.resolve(sentinel)]);
  expect(result).not.toBe(sentinel);
  return result;
}

async function waitForRequestCall(adapter, requestId = "req-1") {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const request = adapter.calls.find(
      (call) => call.type === "request" && call.payload?.requestId === requestId,
    );
    if (request) return request;
    await Promise.resolve();
  }
  return undefined;
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
    };
    this.kill = vi.fn(() => {
      this.emit("exit", 0, null);
      return true;
    });
  }

  emitStdout(message) {
    this.stdout.emit("data", Buffer.from(`${JSON.stringify(message)}\n`, "utf8"));
  }

  emitStderr(text) {
    this.stderr.emit("data", Buffer.from(text, "utf8"));
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

describe("MOSS Nano sidecar manager contract", () => {
  it("starts the sidecar during status and reports the ready snapshot", async () => {
    const { manager } = makeManager();

    await expect(manager.status()).resolves.toMatchObject({
      ok: true,
      status: "ready",
      ready: true,
      loading: false,
    });
  });

  it("reflects bounded lifecycle config in the status config snapshot", async () => {
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
      tokenizerDir: config.tokenizerDir,
      commandTimeoutMs: 111,
      synthesizeTimeoutMs: 222,
      maxInFlight: 1,
      restartBackoffMs: 33,
    });
    expect(status.config).not.toHaveProperty("pythonExe");
    expect(status.config).not.toHaveProperty("ignoredImplementationDetail");
  });

  it("assigns request ownership and resolves synthesize only for matching owned output", async () => {
    const { adapter, manager } = makeManager();

    const synthesizePromise = manager.synthesize({
      text: "hello nano",
      voice: "default",
      rate: 1.0,
    });
    const command = await waitForRequestCall(adapter);

    expect(command).toMatchObject({
      command: "synthesize",
      payload: {
        requestId: "req-1",
        ownerToken: "owner-1",
        text: "hello nano",
        voice: "default",
        rate: 1.0,
      },
    });

    adapter.emitOutput("req-1", {
      ok: true,
      requestId: "req-1",
      ownerToken: "owner-1",
      outputPath: "C:\\fake\\out\\req-1.wav",
      sampleRate: 24000,
      durationMs: 42,
    });

    await expect(synthesizePromise).resolves.toMatchObject({
      ok: true,
      requestId: "req-1",
      ownerToken: "owner-1",
      outputPath: "C:\\fake\\out\\req-1.wav",
      sampleRate: 24000,
      durationMs: 42,
    });
  });

  it("rejects stale or mismatched sidecar output as a structured failure", async () => {
    const { adapter, manager } = makeManager();

    const synthesizePromise = manager.synthesize({
      text: "reject stale output",
      voice: "default",
      rate: 1.0,
    });

    await waitForRequestCall(adapter);
    adapter.emitOutput("req-1", {
      ok: true,
      requestId: "req-1",
      ownerToken: "stale-owner",
      outputPath: "C:\\fake\\out\\stale.wav",
      sampleRate: 24000,
      durationMs: 10,
    });

    await expect(synthesizePromise).resolves.toMatchObject({
      ok: false,
      status: "failed",
      reason: "stale-sidecar-output",
      requestId: "req-1",
      recoverable: true,
    });
  });

  it("cancels only the owned in-flight request and ignores stale request ids", async () => {
    const { adapter, manager } = makeManager();

    const synthesizePromise = manager.synthesize({
      text: "cancel me",
      voice: "default",
      rate: 1.0,
    });

    await expect(manager.cancel("stale-req")).resolves.toMatchObject({
      ok: false,
      cancelled: false,
      reason: "request-not-found",
      requestId: "stale-req",
    });
    expect(adapter.calls.some((call) => call.type === "cancel")).toBe(false);

    await waitForRequestCall(adapter);
    await expect(manager.cancel("req-1")).resolves.toMatchObject({
      ok: true,
      cancelled: true,
      requestId: "req-1",
    });
    expect(adapter.calls.find((call) => call.type === "cancel")).toMatchObject({
      payload: {
        requestId: "req-1",
        ownerToken: "owner-1",
      },
    });

    adapter.emitOutput("req-1", {
      ok: false,
      requestId: "req-1",
      ownerToken: "owner-1",
      reason: "cancelled",
      recoverable: true,
    });
    await expect(synthesizePromise).resolves.toMatchObject({
      ok: false,
      reason: "cancelled",
      requestId: "req-1",
    });
  });

  it("settles the owned in-flight synthesize promise on cancel even without final sidecar output", async () => {
    const { adapter, manager } = makeManager();

    const synthesizePromise = manager.synthesize({
      text: "cancel without final output",
      voice: "default",
      rate: 1.0,
    });

    await expect(manager.cancel("stale-req")).resolves.toMatchObject({
      ok: false,
      cancelled: false,
      reason: "request-not-found",
      requestId: "stale-req",
    });
    expect(adapter.calls.some((call) => call.type === "cancel")).toBe(false);

    await expect(manager.cancel("req-1")).resolves.toMatchObject({
      ok: true,
      cancelled: true,
      requestId: "req-1",
    });

    await expect(expectSettled(synthesizePromise)).resolves.toMatchObject({
      ok: false,
      status: "failed",
      reason: "cancelled",
      requestId: "req-1",
      ownerToken: "owner-1",
      recoverable: true,
    });
  });

  it("settles owned synthesize and releases maxInFlight when sidecar cancel rejects", async () => {
    const adapter = new RejectingCancelMossNanoAdapter();
    const { manager } = makeManager({ adapter });

    const synthesizePromise = manager.synthesize({
      text: "cancel rejects locally",
      voice: "default",
      rate: 1.0,
    });

    await waitForRequestCall(adapter);
    await manager.cancel("req-1").catch(() => undefined);
    expect(adapter.calls.find((call) => call.type === "cancel")).toMatchObject({
      payload: {
        requestId: "req-1",
        ownerToken: "owner-1",
      },
    });

    await expect(expectSettled(synthesizePromise)).resolves.toMatchObject({
      ok: false,
      status: "failed",
      reason: "cancelled",
      requestId: "req-1",
      ownerToken: "owner-1",
      recoverable: true,
    });

    const nextSynthesizePromise = manager.synthesize({
      text: "next request after rejected cancel",
      voice: "default",
      rate: 1.0,
    });
    const nextCommand = await waitForRequestCall(adapter, "req-2");

    expect(nextCommand).toMatchObject({
      command: "synthesize",
      payload: {
        requestId: "req-2",
        ownerToken: "owner-2",
      },
    });
    adapter.emitOutput("req-2", {
      ok: true,
      requestId: "req-2",
      ownerToken: "owner-2",
      outputPath: "C:\\fake\\out\\req-2.wav",
      sampleRate: 24000,
      durationMs: 7,
    });
    await expect(nextSynthesizePromise).resolves.toMatchObject({
      ok: true,
      requestId: "req-2",
      ownerToken: "owner-2",
    });
  });

  it("settles any in-flight synthesize promise on shutdown", async () => {
    const { manager } = makeManager();

    const synthesizePromise = manager.synthesize({
      text: "shutdown while pending",
      voice: "default",
      rate: 1.0,
    });

    await expect(manager.shutdown()).resolves.toMatchObject({
      ok: true,
      status: "shutdown",
      ready: false,
    });

    await expect(expectSettled(synthesizePromise)).resolves.toMatchObject({
      ok: false,
      status: "failed",
      reason: "sidecar-shutdown",
      requestId: "req-1",
      ownerToken: "owner-1",
      recoverable: true,
    });
  });

  it("settles and invalidates in-flight synthesize work on restart before old lifecycle output arrives", async () => {
    const { adapter, manager } = makeManager();

    const synthesizePromise = manager.synthesize({
      text: "restart while pending",
      voice: "default",
      rate: 1.0,
    });

    await waitForRequestCall(adapter);
    await expect(manager.restart()).resolves.toMatchObject({
      ok: true,
      status: "ready",
      ready: true,
    });

    await expect(expectSettled(synthesizePromise)).resolves.toMatchObject({
      ok: false,
      status: "failed",
      reason: "sidecar-restarted",
      requestId: "req-1",
      ownerToken: "owner-1",
      recoverable: true,
    });

    adapter.emitOutput("req-1", {
      ok: true,
      requestId: "req-1",
      ownerToken: "owner-1",
      outputPath: "C:\\fake\\out\\old-lifecycle.wav",
      sampleRate: 24000,
      durationMs: 10,
    });
    await expect(synthesizePromise).resolves.toMatchObject({
      ok: false,
      status: "failed",
      reason: "sidecar-restarted",
      requestId: "req-1",
    });
  });

  it("awaits startup before sending a synthesize request to the adapter", async () => {
    const adapter = new ManualStartupMossNanoAdapter();
    const { manager } = makeManager({ adapter });

    const synthesizePromise = manager.synthesize({
      text: "start before request",
      voice: "default",
      rate: 1.0,
    });

    await Promise.resolve();
    expect(adapter.calls.map((call) => call.type)).toEqual(["start"]);

    adapter.releaseStart();
    await expect(synthesizePromise).resolves.toMatchObject({
      ok: true,
      requestId: "req-1",
      ownerToken: "owner-1",
    });
    expect(adapter.calls.map((call) => call.type)).toEqual(["start", "request"]);
    expect(adapter.calls.find((call) => call.type === "request")).toMatchObject({
      startResolved: true,
    });
  });

  it("transitions shutdown and restart through sidecar adapter lifecycle calls", async () => {
    const adapter = new FakeMossNanoAdapter();
    const { config, manager } = makeManager({ adapter });

    await expect(manager.restart()).resolves.toMatchObject({
      ok: true,
      status: "ready",
      ready: true,
    });
    expect(adapter.calls.find((call) => call.type === "restart")).toMatchObject({
      config,
    });

    await expect(manager.shutdown()).resolves.toMatchObject({
      ok: true,
      status: "shutdown",
      ready: false,
    });
    expect(adapter.calls.some((call) => call.type === "shutdown")).toBe(true);

    const restartedStatus = await manager.restart();
    expect(restartedStatus).toMatchObject({
      ok: true,
      status: "ready",
      ready: true,
    });
    expect(adapter.calls.filter((call) => call.type === "restart")).toHaveLength(2);
  });
});

describe("MOSS Nano resident sidecar adapter", () => {
  it("spawns the Python bridge and resolves start from a ready JSON line", async () => {
    const { spawn, children } = createSpawnHarness();
    const adapter = createMossNanoSidecarAdapter({
      spawn,
      bridgePath: "C:\\app\\scripts\\moss_nano_app_sidecar.py",
    });

    const startPromise = adapter.start(createLifecycleConfig({
      pythonExe: "C:\\Python311\\python.exe",
      commandTimeoutMs: 250,
    }));

    expect(spawn).toHaveBeenCalledWith(
      "C:\\Python311\\python.exe",
      expect.arrayContaining(["C:\\app\\scripts\\moss_nano_app_sidecar.py"]),
      expect.objectContaining({ windowsHide: true }),
    );
    children[0].emitStdout({
      type: "ready",
      ok: true,
      status: "ready",
      ready: true,
      detail: "Nano bridge ready",
      runtime: {
        backend: "moss-nano-onnx",
        modelVariant: "moss-tts-nano-onnx",
      },
    });

    await expect(startPromise).resolves.toMatchObject({
      ok: true,
      status: "ready",
      ready: true,
      detail: "Nano bridge ready",
    });
    await expect(adapter.status()).resolves.toMatchObject({
      status: "ready",
      ready: true,
      runtime: {
        backend: "moss-nano-onnx",
        modelVariant: "moss-tts-nano-onnx",
      },
    });
  });

  it("round-trips synthesize through stdin/stdout with request ownership intact", async () => {
    const { spawn, children } = createSpawnHarness();
    const adapter = createMossNanoSidecarAdapter({
      spawn,
      bridgePath: "C:\\app\\scripts\\moss_nano_app_sidecar.py",
    });

    const startPromise = adapter.start(createLifecycleConfig({ commandTimeoutMs: 250 }));
    children[0].emitStdout({ type: "ready", ok: true, status: "ready", ready: true });
    await startPromise;

    const synthesizePromise = adapter.request("synthesize", {
      requestId: "req-1",
      ownerToken: "owner-1",
      text: "hello sidecar",
      voice: "default",
      rate: 1.1,
    });

    expect(children[0].writtenCommands()).toContainEqual(expect.objectContaining({
      command: "synthesize",
      requestId: "req-1",
      ownerToken: "owner-1",
      text: "hello sidecar",
      voice: "default",
      rate: 1.1,
    }));

    children[0].emitStdout({
      type: "result",
      ok: true,
      requestId: "req-1",
      ownerToken: "owner-1",
      audio: [0, 0.25, -0.25],
      sampleRate: 24000,
      durationMs: 12,
      syntheticAudio: false,
      runtime: {
        backend: "moss-nano-onnx",
        modelVariant: "moss-tts-nano-onnx",
      },
    });

    await expect(synthesizePromise).resolves.toMatchObject({
      ok: true,
      requestId: "req-1",
      ownerToken: "owner-1",
      audio: [0, 0.25, -0.25],
      sampleRate: 24000,
      durationMs: 12,
      syntheticAudio: false,
      runtime: {
        backend: "moss-nano-onnx",
      },
    });
  });

  it("rejects synthetic bridge audio in real sidecar mode", async () => {
    const { spawn, children } = createSpawnHarness();
    const adapter = createMossNanoSidecarAdapter({
      spawn,
      bridgePath: "C:\\app\\scripts\\moss_nano_app_sidecar.py",
    });

    const startPromise = adapter.start(createLifecycleConfig({ commandTimeoutMs: 250 }));
    children[0].emitStdout({ type: "ready", ok: true, status: "ready", ready: true });
    await startPromise;

    const synthesizePromise = adapter.request("synthesize", {
      requestId: "req-synthetic",
      ownerToken: "owner-synthetic",
      text: "synthetic must not pass",
      voice: "default",
      rate: 1.0,
    });

    children[0].emitStdout({
      type: "result",
      ok: true,
      requestId: "req-synthetic",
      ownerToken: "owner-synthetic",
      audio: [0, 0.1, 0],
      sampleRate: 24000,
      durationMs: 12,
      syntheticAudio: true,
    });

    await expect(synthesizePromise).resolves.toMatchObject({
      ok: false,
      status: "failed",
      reason: "synthetic-audio-forbidden",
      requestId: "req-synthetic",
      ownerToken: "owner-synthetic",
      recoverable: true,
    });
  });

  it("allows synthetic bridge audio only when explicit mock mode is configured", async () => {
    const { spawn, children } = createSpawnHarness();
    const adapter = createMossNanoSidecarAdapter({
      spawn,
      bridgePath: "C:\\app\\scripts\\moss_nano_app_sidecar.py",
    });

    const startPromise = adapter.start(createLifecycleConfig({ commandTimeoutMs: 250, mock: true }));
    children[0].emitStdout({ type: "ready", ok: true, status: "ready", ready: true, syntheticAudio: true });
    await startPromise;

    const synthesizePromise = adapter.request("synthesize", {
      requestId: "req-mock",
      ownerToken: "owner-mock",
      text: "mock tone is explicit",
      voice: "default",
      rate: 1.0,
    });

    children[0].emitStdout({
      type: "result",
      ok: true,
      requestId: "req-mock",
      ownerToken: "owner-mock",
      audio: [0, 0.1, 0],
      sampleRate: 24000,
      durationMs: 12,
      syntheticAudio: true,
    });

    await expect(synthesizePromise).resolves.toMatchObject({
      ok: true,
      requestId: "req-mock",
      ownerToken: "owner-mock",
      syntheticAudio: true,
    });
  });

  it("sends cancel, shutdown, and restart control messages to the resident child", async () => {
    const { spawn, children } = createSpawnHarness();
    const adapter = createMossNanoSidecarAdapter({
      spawn,
      bridgePath: "C:\\app\\scripts\\moss_nano_app_sidecar.py",
    });

    const config = createLifecycleConfig({ commandTimeoutMs: 250 });
    const startPromise = adapter.start(config);
    children[0].emitStdout({ type: "ready", ok: true, status: "ready", ready: true });
    await startPromise;

    const cancelPromise = adapter.cancel({ requestId: "req-1", ownerToken: "owner-1" });
    const cancel = children[0].writtenCommands().find((command) => command.command === "cancel");
    expect(cancel).toMatchObject({ requestId: "req-1", ownerToken: "owner-1" });
    children[0].emitStdout({
      type: "cancelled",
      ok: true,
      cancelled: true,
      requestId: "req-1",
      ownerToken: "owner-1",
    });
    await expect(cancelPromise).resolves.toMatchObject({
      ok: true,
      cancelled: true,
      requestId: "req-1",
    });

    await expect(adapter.shutdown()).resolves.toMatchObject({
      ok: true,
      status: "shutdown",
      ready: false,
    });
    expect(children[0].writtenCommands()).toContainEqual(expect.objectContaining({
      command: "shutdown",
    }));

    const restartPromise = adapter.restart(config);
    await Promise.resolve();
    expect(children).toHaveLength(2);
    children[1].emitStdout({ type: "ready", ok: true, status: "ready", ready: true });
    await expect(restartPromise).resolves.toMatchObject({
      ok: true,
      status: "ready",
      ready: true,
    });
  });
});

describe("MOSS Nano app sidecar bridge truth", () => {
  it("reports blocked instead of ready when real Nano runtime paths are missing", () => {
    const result = spawnSync("python", [
      "scripts/moss_nano_app_sidecar.py",
      "--runtime-dir",
      "C:\\definitely-missing\\MOSS-TTS-Nano",
      "--model-dir",
      "C:\\definitely-missing\\MOSS-TTS-Nano-ONNX",
      "--tokenizer-dir",
      "C:\\definitely-missing\\MOSS-Audio-Tokenizer-Nano-ONNX",
    ], {
      cwd: process.cwd(),
      encoding: "utf8",
      input: "{\"command\":\"shutdown\"}\n",
      timeout: 10000,
    });

    expect(result.status).toBe(0);
    const firstLine = result.stdout.trim().split(/\r?\n/)[0];
    expect(JSON.parse(firstLine)).toMatchObject({
      type: "ready",
      ok: false,
      status: "blocked",
      ready: false,
      reason: expect.stringMatching(/missing|source|model|asset|runtime/i),
    });
  });
});
