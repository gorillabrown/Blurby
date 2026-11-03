// NARRATE-PAUSE-CANCEL-1 — the narrow narrate-cancel-queued channel forwards only a non-empty string prefix (anything
// else becomes "\u0000", which no group starts with); a generation cancelled by a pause comes back as { error } but is
// not logged as a failure; any other generate failure still is.
import { createRequire } from "module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const Module = require("module");
const IPC = require.resolve("../../main/ipc/narrate.js");

let originalLoad;
let handlers;
let fakeProducer;

beforeEach(() => {
  handlers = new Map();
  fakeProducer = { cancelQueued: vi.fn(() => 7), generate: vi.fn(), ensureReady: vi.fn(), getStatus: vi.fn() };
  originalLoad = Module._load;
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return { ipcMain: { handle: (ch, fn) => handlers.set(ch, fn) } };
    if (request === "../narrate/producer") return fakeProducer;
    return originalLoad.call(this, request, parent, isMain);
  };
  delete require.cache[IPC];
  require(IPC).register();
});

afterEach(() => {
  Module._load = originalLoad;
  delete require.cache[IPC];
  vi.restoreAllMocks();
});

describe("narrate-cancel-queued IPC (NARRATE-PAUSE-CANCEL-1)", () => {
  it("(i1) narrate-cancel-queued forwards only a non-empty string prefix", () => {
    expect(handlers.has("narrate-cancel-queued")).toBe(true);
    const handle = handlers.get("narrate-cancel-queued");
    expect(handle({}, "ab12cd34:")).toBe(7);
    expect(fakeProducer.cancelQueued).toHaveBeenLastCalledWith("ab12cd34:");
    for (const bad of ["", 42, undefined, null, {}, ["a:"]]) {
      handle({}, bad);
      expect(fakeProducer.cancelQueued).toHaveBeenLastCalledWith("\u0000");
    }
  });

  it("(i2) a cancelled generation is returned as an error but not logged", async () => {
    fakeProducer.generate.mockRejectedValue(new Error("narrate generation cancelled"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(handlers.get("narrate-generate")({}, "t", "af_bella", 1, {})).resolves.toEqual({ error: "narrate generation cancelled" });
    expect(spy).not.toHaveBeenCalled();
  });

  it("(i3) any other generate failure is still logged", async () => {
    fakeProducer.generate.mockRejectedValue(new Error("boom"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(handlers.get("narrate-generate")({}, "t", "af_bella", 1, {})).resolves.toEqual({ error: "boom" });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
