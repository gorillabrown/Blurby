import { EventEmitter } from "events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import mossSidecarModule from "../main/moss-nano-sidecar.js";
import pocketSidecarModule from "../main/pocket-tts-sidecar.js";

const { createMossNanoSidecarAdapter } = mossSidecarModule;
const { createPocketTtsSidecarAdapter } = pocketSidecarModule;

// No `pid`: with one, terminateChild runs a real `taskkill` on Windows.
// kill() emits exit on a microtask, as a real ChildProcess emits it asynchronously.
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
    this.kill = vi.fn(() => {
      queueMicrotask(() => this.emit("exit", 0, null));
      return true;
    });
  }

  emitRaw(text) {
    this.stdout.emit("data", Buffer.from(text, "utf8"));
  }

  emitStdout(message) {
    this.emitRaw(`${JSON.stringify(message)}\n`);
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

function createHarness(factory) {
  const children = [];
  const spawn = vi.fn(() => {
    const child = new FakeSidecarChild();
    children.push(child);
    return child;
  });
  const adapter = factory({ spawn, bridgePath: "C:\\fake\\bridge.py", cwd: "C:\\fake" });
  return { adapter, spawn, children };
}

function baseConfig(overrides = {}) {
  return { pythonExe: "C:\\fake\\python.exe", mock: false, ...overrides };
}

const READY = { type: "ready", ok: true, ready: true };

function flush() {
  return new Promise((resolve) => setImmediate(resolve));
}

async function startReady(harness, config = baseConfig()) {
  const started = harness.adapter.start(config);
  const child = harness.children.at(-1);
  child.emitStdout(READY);
  await started;
  return child;
}

function track(promise) {
  const state = { settled: false, value: undefined };
  promise.then((value) => {
    state.settled = true;
    state.value = value;
  });
  return state;
}

const PROVIDERS = [
  { name: "MOSS Nano", factory: createMossNanoSidecarAdapter, envVar: "MOSS_NANO_PYTHON" },
  { name: "Pocket TTS", factory: createPocketTtsSidecarAdapter, envVar: "POCKET_TTS_PYTHON" },
];

let savedEnv;

beforeEach(() => {
  savedEnv = { MOSS_NANO_PYTHON: process.env.MOSS_NANO_PYTHON, POCKET_TTS_PYTHON: process.env.POCKET_TTS_PYTHON };
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe.each(PROVIDERS)("$name sidecar adapter characterization", ({ name, factory, envVar }) => {
  it("buffers a JSON line split across stdout chunks", async () => {
    const harness = createHarness(factory);
    const started = harness.adapter.start(baseConfig());
    const state = track(started);
    const line = JSON.stringify(READY);
    const half = Math.floor(line.length / 2);

    harness.children[0].emitRaw(line.slice(0, half));
    await flush();
    expect(state.settled).toBe(false);

    harness.children[0].emitRaw(`${line.slice(half)}\n`);
    const status = await started;
    expect(status.ready).toBe(true);
  });

  it("invalid JSON on stdout reports sidecar-protocol-error", async () => {
    const harness = createHarness(factory);
    harness.adapter.start(baseConfig());

    harness.children[0].emitRaw("not-json\n");
    const status = await harness.adapter.status();
    expect(status.reason).toBe("sidecar-protocol-error");
    expect(status.detail).toContain(name);
  });

  it("stderr output is kept in the status detail, capped at 500 characters", async () => {
    const harness = createHarness(factory);
    harness.adapter.start(baseConfig());
    const text = Array.from({ length: 600 }, (_, i) => String.fromCharCode(65 + (i % 26))).join("");

    harness.children[0].stderr.emit("data", Buffer.from(text, "utf8"));
    const status = await harness.adapter.status();
    expect(status.detail.length).toBeLessThanOrEqual(500);
    expect(status.detail.endsWith(text.slice(-100))).toBe(true);
  });

  it("startup times out with sidecar-start-timeout", async () => {
    const harness = createHarness(factory);
    const started = harness.adapter.start(baseConfig({ commandTimeoutMs: 50 }));

    await vi.advanceTimersByTimeAsync(50);
    const status = await started;
    expect(status.reason).toBe("sidecar-start-timeout");
  });

  it("a request times out with sidecar-timeout", async () => {
    const harness = createHarness(factory);
    await startReady(harness, baseConfig({ synthesizeTimeoutMs: 50 }));

    const pending = harness.adapter.request("synthesize", { requestId: "r1", text: "hello" });
    await vi.advanceTimersByTimeAsync(50);
    const result = await pending;
    expect(result.reason).toBe("sidecar-timeout");
    expect(result.requestId).toBe("r1");
  });

  it("a spawn error reports sidecar-spawn-failed or the error code", async () => {
    const coded = createHarness(factory);
    const codedStart = coded.adapter.start(baseConfig());
    coded.children[0].emit("error", Object.assign(new Error("x"), { code: "ENOENT" }));
    await codedStart;
    expect((await coded.adapter.status()).reason).toBe("ENOENT");

    const uncoded = createHarness(factory);
    const uncodedStart = uncoded.adapter.start(baseConfig());
    uncoded.children[0].emit("error", new Error("x"));
    await uncodedStart;
    expect((await uncoded.adapter.status()).reason).toBe("sidecar-spawn-failed");
  });

  it("an unexpected exit fails pending requests with sidecar-exited", async () => {
    const harness = createHarness(factory);
    const child = await startReady(harness);

    const pending = harness.adapter.request("synthesize", { requestId: "r1", text: "hello" });
    child.emit("exit", 1, null);
    const result = await pending;
    expect(result.reason).toBe("sidecar-exited");
    expect(result.requestId).toBe("r1");
  });

  it("cancel settles the request and reports cancelled", async () => {
    const harness = createHarness(factory);
    const child = await startReady(harness);

    harness.adapter.request("synthesize", { requestId: "r1", text: "hello" });
    const cancelling = harness.adapter.cancel({ requestId: "r1" });
    const cancelCommand = child.writtenCommands().find((command) => command.command === "cancel");
    child.emitStdout({ type: "cancelled", controlId: cancelCommand.controlId, requestId: "r1" });

    const result = await cancelling;
    expect(result.cancelled).toBe(true);
    expect(result.requestId).toBe("r1");
  });

  it("uses its own Python env var", async () => {
    process.env[envVar] = "py-test";
    const harness = createHarness(factory);

    harness.adapter.start({ mock: false });
    expect(harness.spawn.mock.calls[0][0]).toBe("py-test");
  });
});

describe("Python sidecar adapter isolation", () => {
  it("two adapters never share state", async () => {
    const mossA = createHarness(createMossNanoSidecarAdapter);
    const pocket = createHarness(createPocketTtsSidecarAdapter);
    const mossB = createHarness(createMossNanoSidecarAdapter);
    const childA = await startReady(mossA);
    await startReady(pocket);
    await startReady(mossB);

    const requestA = mossA.adapter.request("synthesize", { requestId: "r1", text: "a" });
    const pocketState = track(pocket.adapter.request("synthesize", { requestId: "r1", text: "p" }));
    const mossBState = track(mossB.adapter.request("synthesize", { requestId: "r1", text: "b" }));
    const pocketStatusBefore = await pocket.adapter.status();
    const mossBStatusBefore = await mossB.adapter.status();

    childA.emitStdout({ type: "result", ok: true, requestId: "r1", syntheticAudio: false });
    const resultA = await requestA;
    await flush();

    expect(resultA.ok).toBe(true);
    expect(resultA.requestId).toBe("r1");
    expect(pocketState.settled).toBe(false);
    expect(mossBState.settled).toBe(false);
    expect(await pocket.adapter.status()).toBe(pocketStatusBefore);
    expect(await mossB.adapter.status()).toBe(mossBStatusBefore);
  });
});

describe("MOSS Nano sidecar spawn arguments", () => {
  it("passes --tokenizer-dir between --model-dir and --output-dir", async () => {
    const harness = createHarness(createMossNanoSidecarAdapter);

    harness.adapter.start(baseConfig({
      runtimeDir: "C:\\fake\\runtime",
      modelDir: "C:\\fake\\model",
      tokenizerDir: "C:\\fake\\tokenizer",
      outputDir: "C:\\fake\\output",
    }));
    const args = harness.spawn.mock.calls[0][1];
    const modelIndex = args.indexOf("--model-dir");
    const tokenizerIndex = args.indexOf("--tokenizer-dir");

    expect(modelIndex).toBeGreaterThan(-1);
    expect(tokenizerIndex).toBe(modelIndex + 2);
    expect(args.indexOf("--output-dir")).toBe(tokenizerIndex + 2);
  });
});
