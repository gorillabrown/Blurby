// NARRATE-REBUILD-1 P5 (D6, Decision #17) — the producer's worker pool: a request goes to an idle worker, so it never
// queues behind the stale generation another worker is still finishing; an extra worker failing to load leaves the
// producer running on the first; shutdown terminates every worker.
import { createRequire } from "module";
import { EventEmitter } from "events";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const Module = require("module");
const PRODUCER = require.resolve("../../main/narrate/producer.js");

let workers = [];
let failExtraLoad = false;

class FakeWorker extends EventEmitter {
  constructor() { super(); this.generates = []; this.terminated = false; this.exited = false; this.index = workers.length; workers.push(this); }
  postMessage(msg) {
    if (msg.type === "load") {
      setTimeout(() => {
        if (failExtraLoad && this.index > 0) this.emit("message", { type: "load-error", error: "no memory" });
        else this.emit("message", { type: "model-ready", runtime: { index: this.index } });
      }, 0);
    } else if (msg.type === "generate") {
      this.generates.push(msg);
    } else if (msg.type === "stop") {
      // A worker stops by itself once its generation in progress is done (here: at once).
      setTimeout(() => { this.exited = true; this.emit("exit", 0); }, 0);
    }
  }
  /** Answer the oldest generate request this worker holds. */
  answer() { const m = this.generates.shift(); this.emit("message", { type: "result", id: m.id, table: {}, pcm: new Float32Array(1), sampleRate: 24000, genMs: 1, text: m.text }); }
  terminate() { this.terminated = true; return Promise.resolve(0); }
}

let originalLoad;
let producer;
const settle = () => new Promise((r) => setTimeout(r, 5));

beforeEach(() => {
  workers = [];
  failExtraLoad = false;
  process.env.NARRATE_MODELS_ROOT = "C:/narrate-pool-test";
  originalLoad = Module._load;
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "worker_threads") return { Worker: FakeWorker };
    if (request === "./expose-durations") return { ensureExposedModel: async () => ({ path: "exposed" }) };
    return originalLoad.call(this, request, parent, isMain);
  };
  delete require.cache[PRODUCER];
  producer = require(PRODUCER);
});

afterEach(async () => {
  await producer.shutdown();
  Module._load = originalLoad;
  delete require.cache[PRODUCER];
  delete process.env.NARRATE_MODELS_ROOT;
});

describe("narrate producer pool (D6)", () => {
  it("routes a request to the idle worker while the other still runs a stale generation", async () => {
    await producer.ensureReady();
    await settle(); // the extra worker loads behind the first
    expect(workers).toHaveLength(2);
    const stale = producer.generate("stale prefetch", {});
    await settle();
    const fresh = producer.generate("clicked word", {});
    await settle();
    expect(workers[0].generates.map((m) => m.text)).toEqual(["stale prefetch"]);
    expect(workers[1].generates.map((m) => m.text)).toEqual(["clicked word"]); // not queued behind the stale one
    workers[1].answer();
    await expect(fresh).resolves.toMatchObject({ sampleRate: 24000 });
    const next = producer.generate("next chunk", {});
    await settle();
    expect(workers[1].generates.map((m) => m.text)).toEqual(["next chunk"]); // the idle worker again, not the busy one
    workers[0].answer();
    workers[1].answer();
    await Promise.all([stale, next]);
  });

  it("an extra worker that fails to load leaves the producer on the first", async () => {
    failExtraLoad = true;
    await producer.ensureReady();
    await settle();
    expect(workers[1].terminated).toBe(true);
    expect(producer.getStatus()).toMatchObject({ ready: true, state: "ready" });
    const r = producer.generate("one", {});
    await settle();
    expect(workers[0].generates).toHaveLength(1);
    workers[0].answer();
    await expect(r).resolves.toBeTruthy();
  });

  it("shutdown stops every worker gracefully, resolves once all have exited, and fails what is pending", async () => {
    await producer.ensureReady();
    await settle();
    const pending = producer.generate("never answered", {});
    await settle();
    const done = producer.shutdown();
    await expect(pending).rejects.toThrow(/stopped: shutdown/);
    await done;
    expect(workers.every((w) => w.exited && !w.terminated)).toBe(true); // asked to stop, never killed under a live run
  });
});
