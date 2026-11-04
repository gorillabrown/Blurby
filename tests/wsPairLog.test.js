import { EventEmitter } from "node:events";
import { createRequire } from "module";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

// WS-PAIR-LOG-1: the extension pair flow keeps session-only pairing when OS encryption is unavailable
// (Blurby.Brain, 2026-10-22) and says why a pairing was not saved. The real main/ws-server.js is loaded with
// electron patched through Module._load (as tests/auth.test.js does); helpers follow tests/wsServerAuth.test.js.

const require = createRequire(import.meta.url);
const Module = require("module");
const wsServerPath = require.resolve("../main/ws-server.js");

const fakeSafeStorage = {
  available: true,
  failWith: null,
  isEncryptionAvailable() { return this.available; },
  encryptString(s) { if (this.failWith) throw this.failWith; return Buffer.from(`ENC:${s}`, "utf8"); },
  decryptString(buf) { return buf.toString("utf8").replace(/^ENC:/, ""); },
};

let wsServer;
let originalLoad;
beforeAll(() => {
  originalLoad = Module._load;
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return { safeStorage: fakeSafeStorage };
    return originalLoad.call(this, request, parent, isMain);
  };
  delete require.cache[wsServerPath];
  wsServer = require(wsServerPath);
});
afterAll(() => {
  Module._load = originalLoad;
  delete require.cache[wsServerPath];
});

function createMockSocket() {
  const socket = new EventEmitter();
  socket.remoteAddress = "127.0.0.1";
  socket.destroyed = false;
  socket.written = [];
  socket.write = vi.fn((data) => socket.written.push(data));
  socket.destroy = vi.fn(() => { socket.destroyed = true; });
  socket.end = vi.fn((data) => { if (data) socket.written.push(data); socket.destroyed = true; });
  return socket;
}
const request = () => ({ url: "/blurby", headers: { "sec-websocket-key": "dGhlIHNhbXBsZSBub25jZQ==" } });
function lastJson(socket) {
  for (let i = socket.written.length - 1; i >= 0; i--) {
    try {
      const d = wsServer.decodeFrame(socket.written[i]);
      if (d && d.opcode === 0x01) return JSON.parse(d.payload.toString("utf-8"));
    } catch { /* the handshake response is not a frame */ }
  }
  return null;
}
function pair() {
  const settings = {};
  const ctx = { getMainWindow: () => null, getSettings: () => settings, saveSettings: vi.fn() };
  wsServer._testSetState(ctx, "previous-token");
  const socket = createMockSocket();
  wsServer.handleConnection(socket, request());
  socket.emit("data", wsServer.encodeFrame(JSON.stringify({ type: "pair", code: wsServer.getShortCode().code })));
  return { settings, ctx, socket };
}
const notSavedLines = (warn) => warn.mock.calls.map((c) => String(c[0])).filter((l) => l.includes("pairing not saved"));

describe("pair flow says why a pairing was not saved (WS-PAIR-LOG-1)", () => {
  afterEach(() => {
    fakeSafeStorage.available = true;
    fakeSafeStorage.failWith = null;
    vi.restoreAllMocks();
  });

  it("encryption unavailable: pairs for the session, saves nothing, logs one reason", () => {
    fakeSafeStorage.available = false;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { settings, ctx, socket } = pair();
    expect(lastJson(socket)?.type).toBe("pair-ok");
    expect(notSavedLines(warn)).toEqual(["[ws-server] pairing not saved: OS encryption unavailable"]);
    expect(ctx.saveSettings).not.toHaveBeenCalled();
    expect("_wsPairingToken" in settings).toBe(false);
  });

  it("control: encryption available saves the ciphertext once and logs no reason", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { settings, ctx, socket } = pair();
    const reply = lastJson(socket);
    expect(reply?.type).toBe("pair-ok");
    expect(settings._wsPairingToken).toBe(Buffer.from(`ENC:${reply.token}`, "utf8").toString("base64"));
    expect(ctx.saveSettings).toHaveBeenCalledTimes(1);
    expect(notSavedLines(warn)).toEqual([]);
  });

  it("the encrypted save throws: still pairs, logs the error message", () => {
    fakeSafeStorage.failWith = new Error("boom");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { socket } = pair();
    expect(lastJson(socket)?.type).toBe("pair-ok");
    expect(notSavedLines(warn)).toEqual(["[ws-server] pairing not saved: boom"]);
  });
});
