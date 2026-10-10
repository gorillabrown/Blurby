import { describe, expect, it, vi } from "vitest";

import mossNanoEngineModule from "../main/moss-nano-engine.js";
import pocketTtsEngineModule from "../main/pocket-tts-engine.js";

// Characterization suite for the MOSS Nano / Pocket TTS engine managers.
// Drives the public factories with a fake adapter OBJECT (no child process, no pid),
// so it stays valid when both factories become thin configs over one shared engine.

const { createMossNanoEngine } = mossNanoEngineModule;
const { createPocketTtsEngine } = pocketTtsEngineModule;

const READY = { ok: true, status: "ready", reason: null, ready: true, recoverable: true };

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function createIdSequence(prefix) {
  let next = 0;
  return () => `${prefix}-${++next}`;
}

const flush = () => new Promise((resolve) => setImmediate(resolve));

// Resolves to PENDING if `promise` has not settled by the next macrotask.
const PENDING = Symbol("pending");
async function peek(promise) {
  return Promise.race([promise, flush().then(() => PENDING)]);
}

function createFakeAdapter(handlers = {}) {
  const pending = new Map();
  return {
    start: vi.fn(handlers.start ?? (async () => READY)),
    status: vi.fn(handlers.status ?? (async () => READY)),
    request: vi.fn(
      handlers.request ??
        ((command, payload) =>
          new Promise((resolve) => {
            pending.set(payload.requestId, resolve);
          })),
    ),
    cancel: vi.fn(handlers.cancel ?? (async (payload) => ({ ok: true, cancelled: true, requestId: payload.requestId }))),
    shutdown: vi.fn(handlers.shutdown ?? (async () => ({ ok: true, status: "shutdown" }))),
    restart: vi.fn(handlers.restart ?? (async () => READY)),
    emitOutput(requestId, output) {
      const resolve = pending.get(requestId);
      if (!resolve) throw new Error(`No pending request for ${requestId}`);
      pending.delete(requestId);
      resolve(output);
    },
  };
}

function ownedOutput(payload, extra = {}) {
  return { ok: true, requestId: payload.requestId, ownerToken: payload.ownerToken, outputPath: "C:\\fake\\out.wav", ...extra };
}

const PROVIDERS = [
  { name: "MOSS Nano", factory: createMossNanoEngine, label: "MOSS Nano", key: "tokenizerDir", prefix: "nano-" },
  { name: "Pocket TTS", factory: createPocketTtsEngine, label: "Pocket TTS", key: "referenceWavPath", prefix: "pocket-" },
];

describe.each(PROVIDERS)("$name sidecar engine characterization", ({ name, factory, label, key, prefix }) => {
  function makeEngine(adapter, options = {}) {
    return factory({
      sidecarAdapter: adapter,
      createRequestId: createIdSequence("req"),
      createOwnerToken: createIdSequence("owner"),
      ...options,
    });
  }

  it("start that is not ready leaves the engine unstarted", async () => {
    const adapter = createFakeAdapter({
      start: async () => ({ ok: false, ready: false, reason: "sidecar-not-ready" }),
    });
    const engine = makeEngine(adapter);

    const status = await engine.status();
    expect(status.ready).toBe(false);
    expect(status.reason).toBe("sidecar-not-ready");
    expect(adapter.status).not.toHaveBeenCalled();

    const result = await engine.synthesize({ text: "hello" });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("sidecar-not-ready");
    expect(adapter.request).not.toHaveBeenCalled();
  });

  it("a rejected start maps to sidecar-start-failed", async () => {
    const plain = makeEngine(createFakeAdapter({ start: async () => { throw new Error("x"); } }));
    const plainStatus = await plain.status();
    expect(plainStatus.reason).toBe("sidecar-start-failed");
    expect(plainStatus.recoverable).toBe(true);
    expect(plainStatus.detail).toBe("x");
    expect(plainStatus.ready).toBe(false);

    const custom = makeEngine(
      createFakeAdapter({
        start: async () => {
          throw Object.assign(new Error("boom detail"), { reason: "boom", recoverable: false });
        },
      }),
    );
    const customStatus = await custom.status();
    expect(customStatus.reason).toBe("boom");
    expect(customStatus.recoverable).toBe(false);
  });

  it("concurrent starts share one adapter start", async () => {
    const startGate = createDeferred();
    const adapter = createFakeAdapter({ start: () => startGate.promise });
    const engine = makeEngine(adapter);

    const first = engine.status();
    const second = engine.status();
    await flush();
    expect(adapter.start).toHaveBeenCalledTimes(1);

    startGate.resolve(READY);
    const [a, b] = await Promise.all([first, second]);
    expect(adapter.start).toHaveBeenCalledTimes(1);
    expect(a.ready).toBe(true);
    expect(b.ready).toBe(true);
  });

  it("a start that resolves after shutdown is ignored", async () => {
    const startGate = createDeferred();
    const adapter = createFakeAdapter({ start: () => startGate.promise });
    const engine = makeEngine(adapter);

    const pendingStatus = engine.status();
    await flush();
    expect(adapter.start).toHaveBeenCalledTimes(1);

    await engine.shutdown();
    startGate.resolve(READY);

    const status = await pendingStatus;
    expect(status.ready).toBe(false);
    // A stale start must not mark the engine started: the started-only adapter.status() is never reached.
    expect(adapter.status).not.toHaveBeenCalled();
  });

  it("restart settles in-flight work with sidecar-restarted and drops late output", async () => {
    const adapter = createFakeAdapter();
    const engine = makeEngine(adapter);

    const first = engine.synthesize({ text: "one" });
    await flush();
    expect(adapter.request).toHaveBeenCalledTimes(1);
    const firstPayload = adapter.request.mock.calls[0][1];

    const restarted = await engine.restart();
    expect(adapter.restart).toHaveBeenCalledTimes(1);
    expect(restarted.ready).toBe(true);

    const settled = await first;
    expect(settled.ok).toBe(false);
    expect(settled.reason).toBe("sidecar-restarted");
    expect(settled.requestId).toBe(firstPayload.requestId);
    expect(settled.recoverable).toBe(true);

    // Late output from the pre-restart request changes nothing.
    adapter.emitOutput(firstPayload.requestId, ownedOutput(firstPayload));
    await flush();
    expect(await peek(first)).toBe(settled);

    // The in-flight slot was freed: a new request is accepted and completes normally.
    const second = engine.synthesize({ text: "two" });
    await flush();
    expect(adapter.request).toHaveBeenCalledTimes(2);
    const secondPayload = adapter.request.mock.calls[1][1];
    adapter.emitOutput(secondPayload.requestId, ownedOutput(secondPayload));
    const output = await second;
    expect(output.ok).toBe(true);
    expect(output.requestId).toBe(secondPayload.requestId);
  });

  it("cancel failure returns sidecar-cancel-failed with cancelled:true", async () => {
    const adapter = createFakeAdapter({
      cancel: async () => {
        throw new Error("cancel transport failed");
      },
    });
    const engine = makeEngine(adapter);

    const request = engine.synthesize({ text: "hello" });
    await flush();
    const payload = adapter.request.mock.calls[0][1];

    const cancelled = await engine.cancel(payload.requestId);
    expect(cancelled.ok).toBe(false);
    expect(cancelled.reason).toBe("sidecar-cancel-failed");
    expect(cancelled.cancelled).toBe(true);
    expect(cancelled.requestId).toBe(payload.requestId);
    expect(cancelled.ownerToken).toBe(payload.ownerToken);
    expect(cancelled.detail).toBe("cancel transport failed");
    expect(adapter.cancel).toHaveBeenCalledWith({ requestId: payload.requestId, ownerToken: payload.ownerToken });

    // The request itself was settled locally before the adapter was asked.
    const settled = await request;
    expect(settled.reason).toBe("cancelled");

    const unknown = await engine.cancel("never-issued");
    expect(unknown).toEqual({ ok: false, cancelled: false, reason: "request-not-found", requestId: "never-issued", recoverable: true });
  });

  it("output after shutdown is dropped", async () => {
    const adapter = createFakeAdapter();
    const engine = makeEngine(adapter);

    const request = engine.synthesize({ text: "hello" });
    await flush();
    const payload = adapter.request.mock.calls[0][1];

    await engine.shutdown();
    const settled = await request;
    expect(settled.ok).toBe(false);
    expect(settled.reason).toBe("sidecar-shutdown");

    adapter.emitOutput(payload.requestId, ownedOutput(payload));
    await flush();
    expect(await peek(request)).toBe(settled);

    // The in-flight slot is free again (default maxInFlight is 1).
    const next = engine.synthesize({ text: "again" });
    await flush();
    expect(adapter.request).toHaveBeenCalledTimes(2);
    const nextPayload = adapter.request.mock.calls[1][1];
    adapter.emitOutput(nextPayload.requestId, ownedOutput(nextPayload));
    expect((await next).ok).toBe(true);
  });

  it("a rejected request maps to sidecar-request-failed or error.reason", async () => {
    const plain = makeEngine(createFakeAdapter({ request: () => Promise.reject(new Error("request exploded")) }));
    const plainResult = await plain.synthesize({ text: "hello" });
    expect(plainResult.ok).toBe(false);
    expect(plainResult.reason).toBe("sidecar-request-failed");
    expect(plainResult.detail).toBe("request exploded");

    const custom = makeEngine(
      createFakeAdapter({ request: () => Promise.reject(Object.assign(new Error("slow"), { reason: "sidecar-request-timeout" })) }),
    );
    const customResult = await custom.synthesize({ text: "hello" });
    expect(customResult.reason).toBe("sidecar-request-timeout");
    expect(customResult.detail).toBe("slow");
  });

  it("normalizeStatus passes runtime, metadata and syntheticAudio through", async () => {
    const runtime = { python: "3.11", provider: "cpu" };
    const metadata = { voices: ["a", "b"] };
    const adapter = createFakeAdapter({
      status: async () => ({ ...READY, runtime, metadata, syntheticAudio: true }),
    });
    const engine = makeEngine(adapter);

    const status = await engine.status();
    expect(status.ok).toBe(true);
    expect(status.ready).toBe(true);
    expect(status.runtime).toEqual(runtime);
    expect(status.metadata).toEqual(metadata);
    expect(status.syntheticAudio).toBe(true);
    expect(adapter.status).toHaveBeenCalledTimes(1);
  });

  it("too-many-in-flight with the default maxInFlight of 1", async () => {
    const adapter = createFakeAdapter();
    const engine = makeEngine(adapter); // no config override: default maxInFlight

    const first = engine.synthesize({ text: "one" });
    const second = await engine.synthesize({ text: "two" });
    expect(second.ok).toBe(false);
    expect(second.reason).toBe("too-many-in-flight");
    expect(second.recoverable).toBe(true);
    expect(second.detail).toContain(label);

    await flush();
    expect(adapter.request).toHaveBeenCalledTimes(1);
    const payload = adapter.request.mock.calls[0][1];
    adapter.emitOutput(payload.requestId, ownedOutput(payload));
    expect((await first).ok).toBe(true);
  });

  it("request ids use the provider prefix by default", async () => {
    const adapter = createFakeAdapter();
    const engine = factory({ sidecarAdapter: adapter, createOwnerToken: createIdSequence("owner") });

    const request = engine.synthesize({ text: "hello" });
    await flush();
    const payload = adapter.request.mock.calls[0][1];
    expect(payload.requestId.startsWith(prefix)).toBe(true);
    expect(payload.requestId.length).toBeGreaterThan(prefix.length);
    expect(payload.ownerToken).toBe("owner-1");

    adapter.emitOutput(payload.requestId, ownedOutput(payload));
    expect((await request).requestId).toBe(payload.requestId);
  });

  it("missing visible config key in the status snapshot", async () => {
    const adapter = createFakeAdapter();
    const engine = makeEngine(adapter, { config: { [key]: undefined } });

    const snapshot = (await engine.status()).config;
    expect(key in snapshot).toBe(true);
    if (name === "MOSS Nano") {
      expect(snapshot[key]).toBeNull();
    } else {
      expect(snapshot[key]).toBeNull();
    }
  });
});

describe("python sidecar engines", () => {
  it("two engines never share state", async () => {
    // Identical id sequences on purpose: shared inFlight state would collide on "req-1".
    const build = (factory) => {
      const adapter = createFakeAdapter();
      const engine = factory({
        sidecarAdapter: adapter,
        createRequestId: createIdSequence("req"),
        createOwnerToken: createIdSequence("owner"),
      });
      return { adapter, engine };
    };
    const mossA = build(createMossNanoEngine);
    const pocket = build(createPocketTtsEngine);
    const mossB = build(createMossNanoEngine);

    const requestA = mossA.engine.synthesize({ text: "a" });
    const requestP = pocket.engine.synthesize({ text: "p" });
    const requestB = mossB.engine.synthesize({ text: "b" });
    await flush();
    for (const side of [mossA, pocket, mossB]) {
      expect(side.adapter.request).toHaveBeenCalledTimes(1);
      expect(side.adapter.request.mock.calls[0][1].requestId).toBe("req-1");
    }

    // Cancelling on A settles only A.
    const cancelledA = await mossA.engine.cancel("req-1");
    expect(cancelledA.cancelled).toBe(true);
    expect((await requestA).reason).toBe("cancelled");
    expect(await peek(requestP)).toBe(PENDING);
    expect(await peek(requestB)).toBe(PENDING);
    expect(pocket.adapter.cancel).not.toHaveBeenCalled();
    expect(mossB.adapter.cancel).not.toHaveBeenCalled();

    // Completing P leaves B pending and A's status untouched.
    const payloadP = pocket.adapter.request.mock.calls[0][1];
    pocket.adapter.emitOutput("req-1", ownedOutput(payloadP));
    expect((await requestP).ok).toBe(true);
    expect(await peek(requestB)).toBe(PENDING);

    // Shutting down A does not settle B, and B can still be cancelled by the same id.
    await mossA.engine.shutdown();
    expect(mossB.adapter.shutdown).not.toHaveBeenCalled();
    expect(pocket.adapter.shutdown).not.toHaveBeenCalled();
    expect(await peek(requestB)).toBe(PENDING);
    const cancelledB = await mossB.engine.cancel("req-1");
    expect(cancelledB.cancelled).toBe(true);
    expect((await requestB).reason).toBe("cancelled");

    // Each engine reports only its own visible config keys.
    const pocketStatus = await pocket.engine.status();
    const mossStatus = await mossB.engine.status();
    expect("referenceWavPath" in pocketStatus.config).toBe(true);
    expect("tokenizerDir" in pocketStatus.config).toBe(false);
    expect("tokenizerDir" in mossStatus.config).toBe(true);
    expect("referenceWavPath" in mossStatus.config).toBe(false);
  });
});
