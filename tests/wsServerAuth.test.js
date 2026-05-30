import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { EventEmitter } = require("events");
const wsServer = require("../main/ws-server.js");
const { WS_PAIRING_TIMEOUT_MS, WS_AUTH_TIMEOUT_MS } = require("../main/constants.js");

function createMockSocket(remoteAddress = "127.0.0.1") {
  const socket = new EventEmitter();
  socket.remoteAddress = remoteAddress;
  socket.destroyed = false;
  socket.written = [];
  socket.write = vi.fn((data) => socket.written.push(data));
  socket.destroy = vi.fn(() => { socket.destroyed = true; });
  socket.end = vi.fn((data) => {
    if (data) socket.written.push(data);
    socket.destroyed = true;
  });
  return socket;
}

function createMockRequest(url = "/blurby") {
  return {
    url,
    headers: { "sec-websocket-key": "dGhlIHNhbXBsZSBub25jZQ==" },
  };
}

function mockCtx() {
  return {
    getMainWindow: () => null,
    getSettings: () => ({}),
    saveSettings: vi.fn(),
  };
}

function sendPairMessage(socket, code) {
  const payload = JSON.stringify({ type: "pair", code });
  const frame = wsServer.encodeFrame(payload);
  socket.emit("data", frame);
}

function sendAuthMessage(socket, token) {
  const payload = JSON.stringify({ type: "auth", token });
  const frame = wsServer.encodeFrame(payload);
  socket.emit("data", frame);
}

function getLastJsonResponse(socket) {
  for (let i = socket.written.length - 1; i >= 0; i--) {
    const buf = socket.written[i];
    try {
      const decoded = wsServer.decodeFrame(buf);
      if (decoded && decoded.opcode === 0x01) {
        return JSON.parse(decoded.payload.toString("utf-8"));
      }
    } catch { /* skip non-JSON frames (e.g. handshake response) */ }
  }
  return null;
}

describe("WS server auth timeout state machine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    wsServer._testSetState(mockCtx(), "test-pairing-token-abc");
  });

  afterEach(() => {
    vi.useRealTimers();
    wsServer._testGetClients().clear();
  });

  it("(a) connect then send valid pair within WS_PAIRING_TIMEOUT_MS succeeds", () => {
    const socket = createMockSocket();
    const request = createMockRequest();

    wsServer.handleConnection(socket, request);

    const shortCode = wsServer.getShortCode().code;
    sendPairMessage(socket, shortCode);

    const response = getLastJsonResponse(socket);
    expect(response).not.toBeNull();
    expect(response.type).toBe("pair-ok");
    expect(response.token).toBeDefined();
    expect(socket.destroyed).toBe(false);

    vi.advanceTimersByTime(WS_PAIRING_TIMEOUT_MS + 1000);
    expect(socket.destroyed).toBe(false);
  });

  it("(b) connect then nothing within WS_PAIRING_TIMEOUT_MS — socket destroyed", () => {
    const socket = createMockSocket();
    const request = createMockRequest();

    wsServer.handleConnection(socket, request);

    expect(socket.destroyed).toBe(false);

    vi.advanceTimersByTime(WS_PAIRING_TIMEOUT_MS - 100);
    expect(socket.destroyed).toBe(false);

    vi.advanceTimersByTime(200);
    expect(socket.destroy).toHaveBeenCalled();
  });

  it("(c) connect then send valid auth (post-paired path) within WS_AUTH_TIMEOUT_MS succeeds", () => {
    const socket = createMockSocket();
    const request = createMockRequest();

    wsServer.handleConnection(socket, request);

    sendAuthMessage(socket, "test-pairing-token-abc");

    const response = getLastJsonResponse(socket);
    expect(response).not.toBeNull();
    expect(response.type).toBe("auth-ok");
    expect(socket.destroyed).toBe(false);

    vi.advanceTimersByTime(WS_PAIRING_TIMEOUT_MS + 1000);
    expect(socket.destroyed).toBe(false);
  });

  it("(d) connect then send invalid pair code — pair-failed, connection stays until timeout", () => {
    const socket = createMockSocket();
    const request = createMockRequest();

    wsServer.handleConnection(socket, request);

    sendPairMessage(socket, "000000");

    const response = getLastJsonResponse(socket);
    expect(response).not.toBeNull();
    expect(response.type).toBe("pair-failed");
    expect(socket.destroyed).toBe(false);

    vi.advanceTimersByTime(WS_PAIRING_TIMEOUT_MS - 100);
    expect(socket.destroyed).toBe(false);

    vi.advanceTimersByTime(200);
    expect(socket.destroy).toHaveBeenCalled();
  });

  it("rejects non-localhost connections", () => {
    const socket = createMockSocket("192.168.1.100");
    const request = createMockRequest();

    wsServer.handleConnection(socket, request);
    expect(socket.destroy).toHaveBeenCalled();
  });

  it("rejects wrong WebSocket path", () => {
    const socket = createMockSocket();
    const request = createMockRequest("/wrong-path");

    wsServer.handleConnection(socket, request);
    expect(socket.destroy).toHaveBeenCalled();
  });

  it("pairing timeout matches SHORT_CODE_TTL_MS (5 minutes)", () => {
    expect(WS_PAIRING_TIMEOUT_MS).toBe(5 * 60 * 1000);
  });

  it("auth timeout constant remains at 5s for documentation", () => {
    expect(WS_AUTH_TIMEOUT_MS).toBe(5000);
  });
});
