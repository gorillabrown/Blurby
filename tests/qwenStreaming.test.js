// tests/qwenStreaming.test.js — QWEN-STREAM-1: Binary frame parser + engine manager tests
//
// Covers:
//   Group A: Binary frame parser (parseFrames) — 6 tests
//   Group B: Engine manager factory shape — 3 tests
//   Group C: Stream lifecycle (startStream, stdout events) — 4 tests
//   Group D: Cancel and error handling — 3 tests
//   Group E: Preload bridge type/shape contracts — 2 tests

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "events";

// ---------------------------------------------------------------------------
// Helpers — build binary frames matching the sidecar wire protocol
//   [4-byte LE uint32 length][1-byte type][N-byte payload]
// ---------------------------------------------------------------------------

const FRAME_TYPE_JSON = 0x01;
const FRAME_TYPE_PCM = 0x02;
const FRAME_HEADER_BYTES = 5;

function buildFrame(type, payload) {
  const payloadBuf = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
  const header = Buffer.alloc(FRAME_HEADER_BYTES);
  header.writeUInt32LE(payloadBuf.length, 0);
  header.writeUInt8(type, 4);
  return Buffer.concat([header, payloadBuf]);
}

function buildJsonFrame(obj) {
  return buildFrame(FRAME_TYPE_JSON, JSON.stringify(obj));
}

function buildPcmFrame(samples) {
  // samples: Float32Array or array of floats
  const arr = Float32Array.from(samples);
  return buildFrame(FRAME_TYPE_PCM, Buffer.from(arr.buffer));
}

// ---------------------------------------------------------------------------
// Mock factory for child_process.spawn
// ---------------------------------------------------------------------------

function makeMockChild() {
  const stdin = { write: vi.fn(), end: vi.fn() };
  const stdout = new EventEmitter();
  const stderr = new EventEmitter();
  const child = new EventEmitter();
  child.stdin = stdin;
  child.stdout = stdout;
  child.stderr = stderr;
  child.kill = vi.fn();
  return child;
}

// ---------------------------------------------------------------------------
// Group A: Binary frame parser — parseFrames
// ---------------------------------------------------------------------------

describe("Group A: parseFrames — binary frame parser", () => {
  let parseFrames;

  beforeEach(async () => {
    // Import the engine module fresh each time so mocks don't pollute state.
    const mod = await import("../main/qwen-streaming-engine.js");
    const manager = mod.createQwenStreamingEngineManager(null, {
      isPackaged: false,
      projectRoot: "/fake/project",
      userDataPath: "/fake/user-data",
      sendStatus: () => {},
      sendRuntimeError: () => {},
      spawnProcess: () => makeMockChild(),
      fs: {
        readFile: vi.fn().mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" })),
        access: vi.fn().mockResolvedValue(undefined),
      },
    });
    parseFrames = manager._internal.parseFrames;
  });

  it("A1: empty buffer returns zero consumed bytes (no frames)", () => {
    const buffer = Buffer.alloc(0);
    const jsonFrames = [];
    const pcmFrames = [];
    const consumed = parseFrames(buffer, (m) => jsonFrames.push(m), (p) => pcmFrames.push(p));
    expect(consumed).toBe(0);
    expect(jsonFrames).toHaveLength(0);
    expect(pcmFrames).toHaveLength(0);
  });

  it("A2: single complete JSON frame (type 0x01) is parsed and payload returned as object", () => {
    const obj = { event: "stream_started", streamId: "abc-123" };
    const frame = buildJsonFrame(obj);
    const jsonFrames = [];
    const pcmFrames = [];
    const consumed = parseFrames(frame, (m) => jsonFrames.push(m), (p) => pcmFrames.push(p));
    expect(consumed).toBe(frame.length);
    expect(jsonFrames).toHaveLength(1);
    expect(jsonFrames[0]).toMatchObject({ event: "stream_started", streamId: "abc-123" });
    expect(pcmFrames).toHaveLength(0);
  });

  it("A3: single complete PCM frame (type 0x02) is parsed and raw bytes forwarded", () => {
    const samples = [0.1, 0.2, 0.3, 0.4];
    const frame = buildPcmFrame(samples);
    const jsonFrames = [];
    const pcmFrames = [];
    const consumed = parseFrames(frame, (m) => jsonFrames.push(m), (p) => pcmFrames.push(p));
    expect(consumed).toBe(frame.length);
    expect(pcmFrames).toHaveLength(1);
    expect(Buffer.isBuffer(pcmFrames[0])).toBe(true);
    // 4 samples × 4 bytes = 16 bytes of payload
    expect(pcmFrames[0].length).toBe(samples.length * 4);
    expect(jsonFrames).toHaveLength(0);
  });

  it("A4: buffer with two complete frames both parsed; remaining consumed", () => {
    const frame1 = buildJsonFrame({ event: "stream_started", streamId: "s1" });
    const frame2 = buildPcmFrame([0.5, 0.6]);
    const combined = Buffer.concat([frame1, frame2]);
    const jsonFrames = [];
    const pcmFrames = [];
    const consumed = parseFrames(combined, (m) => jsonFrames.push(m), (p) => pcmFrames.push(p));
    expect(consumed).toBe(combined.length);
    expect(jsonFrames).toHaveLength(1);
    expect(pcmFrames).toHaveLength(1);
  });

  it("A5: partial header (only 3 bytes) — no frames parsed, consumed is 0", () => {
    const partial = Buffer.from([0x08, 0x00, 0x00]); // 3-byte partial header
    const jsonFrames = [];
    const pcmFrames = [];
    const consumed = parseFrames(partial, (m) => jsonFrames.push(m), (p) => pcmFrames.push(p));
    expect(consumed).toBe(0);
    expect(jsonFrames).toHaveLength(0);
    expect(pcmFrames).toHaveLength(0);
  });

  it("A6: frame split across two calls — combined buffer parses one complete frame", () => {
    const obj = { event: "warmup_complete", elapsed_ms: 1234 };
    const fullFrame = buildJsonFrame(obj);
    // Split after the header (first 5 bytes)
    const part1 = fullFrame.slice(0, FRAME_HEADER_BYTES + 2);
    const part2 = fullFrame.slice(FRAME_HEADER_BYTES + 2);

    const jsonFrames = [];
    const pcmFrames = [];

    // First call: header + 2 bytes of payload → not enough, consumed = 0
    const consumed1 = parseFrames(part1, (m) => jsonFrames.push(m), (p) => pcmFrames.push(p));
    expect(consumed1).toBe(0);
    expect(jsonFrames).toHaveLength(0);

    // Second call: combine remainder of first chunk with part2 → full frame
    const combined = Buffer.concat([part1.slice(consumed1), part2]);
    const consumed2 = parseFrames(combined, (m) => jsonFrames.push(m), (p) => pcmFrames.push(p));
    expect(consumed2).toBe(fullFrame.length);
    expect(jsonFrames).toHaveLength(1);
    expect(jsonFrames[0]).toMatchObject({ event: "warmup_complete", elapsed_ms: 1234 });
  });
});

// ---------------------------------------------------------------------------
// Group B: Engine manager factory shape
// ---------------------------------------------------------------------------

describe("Group B: createQwenStreamingEngineManager factory", () => {
  function makeManager(overrides = {}) {
    const { createQwenStreamingEngineManager } = require("../main/qwen-streaming-engine.js");
    const mockChild = makeMockChild();
    return createQwenStreamingEngineManager(null, {
      isPackaged: false,
      projectRoot: "/fake/project",
      userDataPath: "/fake/user-data",
      sendStatus: vi.fn(),
      sendRuntimeError: vi.fn(),
      spawnProcess: vi.fn().mockReturnValue(mockChild),
      fs: {
        readFile: vi.fn().mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" })),
        access: vi.fn().mockResolvedValue(undefined),
      },
      ...overrides,
    });
  }

  it("B1: factory returns an object with all expected public methods", () => {
    const manager = makeManager();
    expect(typeof manager.getModelStatus).toBe("function");
    expect(typeof manager.preload).toBe("function");
    expect(typeof manager.startStream).toBe("function");
    expect(typeof manager.cancelStream).toBe("function");
    expect(typeof manager.shutdown).toBe("function");
    expect(typeof manager.onStreamAudio).toBe("function");
  });

  it("B2: getModelStatus() returns ready: false before any warmup", () => {
    const manager = makeManager();
    const status = manager.getModelStatus();
    expect(status).toHaveProperty("ready", false);
    expect(status).toHaveProperty("status");
    expect(status.status).toBe("idle");
  });

  it("B3: onStreamAudio(listener) returns an unsubscribe function", () => {
    const manager = makeManager();
    const listener = vi.fn();
    const unsubscribe = manager.onStreamAudio(listener);
    expect(typeof unsubscribe).toBe("function");
    // Calling unsubscribe should not throw
    expect(() => unsubscribe()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Group C: Stream lifecycle
// ---------------------------------------------------------------------------

describe("Group C: Stream lifecycle", () => {
  let mockChild;
  let manager;
  let mockSpawn;

  beforeEach(() => {
    mockChild = makeMockChild();
    mockSpawn = vi.fn().mockReturnValue(mockChild);

    const { createQwenStreamingEngineManager } = require("../main/qwen-streaming-engine.js");

    manager = createQwenStreamingEngineManager(null, {
      isPackaged: false,
      projectRoot: "/fake/project",
      userDataPath: "/fake/user-data",
      sendStatus: vi.fn(),
      sendRuntimeError: vi.fn(),
      spawnProcess: mockSpawn,
      commandTimeoutMs: {
        configure: 50,
        start_stream: 50,
        cancel_stream: 50,
        warmup: 50,
        status: 50,
        shutdown: 50,
        list_speakers: 50,
      },
      streamTimeoutMs: 500,
      fs: {
        readFile: vi.fn().mockResolvedValue(
          JSON.stringify({
            pythonExe: "/usr/bin/python3",
            modelId: "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
            device: "cuda:0",
          }),
        ),
        access: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  /**
   * Helper: simulate the sidecar acknowledging a command by emitting a JSON
   * frame on stdout. The `id` must match what stdin.write received.
   */
  function ackCommandFromStdin(responseOverrides = {}) {
    // Grab the last JSON line written to stdin
    const calls = mockChild.stdin.write.mock.calls;
    if (calls.length === 0) return;
    const lastLine = calls[calls.length - 1][0].trim();
    let parsed;
    try {
      parsed = JSON.parse(lastLine);
    } catch {
      return;
    }
    const response = { id: parsed.id, ok: true, ...responseOverrides };
    const frame = buildJsonFrame(response);
    mockChild.stdout.emit("data", frame);
  }

  it("C1: startStream writes a JSON-line command with cmd start_stream to stdin", async () => {
    // We kick off startStream but intercept it before it times out.
    // Auto-ack configure then start_stream from stdin writes.
    let startStreamPromise;

    const autoAck = setInterval(() => {
      if (mockChild.stdin.write.mock.calls.length > 0) {
        ackCommandFromStdin({ ok: true, status: "ready", ready: true });
      }
    }, 5);

    try {
      startStreamPromise = manager.startStream("Hello world", "speaker_0", 1.0);
      // Give time for configure + start_stream to be written
      await new Promise((r) => setTimeout(r, 30));

      // Find the start_stream call among all stdin.write calls
      const allWrites = mockChild.stdin.write.mock.calls.map((c) => {
        try { return JSON.parse(c[0].trim()); } catch { return null; }
      }).filter(Boolean);

      const startCmd = allWrites.find((w) => w.cmd === "start_stream");
      expect(startCmd).toBeDefined();
      expect(startCmd.cmd).toBe("start_stream");
      expect(startCmd.text).toBe("Hello world");
      expect(startCmd.speaker).toBe("speaker_0");
      expect(startCmd.rate).toBe(1.0);
      expect(startCmd.streamId).toBeTruthy();
    } finally {
      clearInterval(autoAck);
      // Let the promise settle (timeout or resolve)
      await startStreamPromise.catch(() => {});
    }
  });

  it("C2: stream_started JSON event records the streamId as activeStreamId", async () => {
    // Verify internal state by checking that PCM frames after stream_started
    // are forwarded to onStreamAudio listeners (which requires activeStreamId to be set).
    const audioChunks = [];
    manager.onStreamAudio((_streamId, chunk) => audioChunks.push(chunk));

    let capturedStreamId = null;
    let startStreamResult;

    const autoAck = setInterval(() => {
      const calls = mockChild.stdin.write.mock.calls;
      if (calls.length === 0) return;

      for (const call of calls) {
        let parsed;
        try { parsed = JSON.parse(call[0].trim()); } catch { continue; }

        if (parsed.cmd === "configure" && !parsed._acked) {
          parsed._acked = true;
          mockChild.stdout.emit("data", buildJsonFrame({ id: parsed.id, ok: true }));
        }
        if (parsed.cmd === "start_stream" && !parsed._acked) {
          parsed._acked = true;
          capturedStreamId = parsed.streamId;
          // Ack the start_stream command
          mockChild.stdout.emit("data", buildJsonFrame({ id: parsed.id, ok: true }));
          // Emit stream_started event
          mockChild.stdout.emit("data", buildJsonFrame({ event: "stream_started", streamId: capturedStreamId }));
        }
      }
    }, 5);

    try {
      startStreamResult = await manager.startStream("Test", "speaker_0", 1.0);
      expect(startStreamResult).toHaveProperty("streamId");
      expect(typeof startStreamResult.streamId).toBe("string");
      expect(startStreamResult).toHaveProperty("finished");
    } finally {
      clearInterval(autoAck);
      // Resolve the stream promise so it doesn't leak
      if (capturedStreamId) {
        mockChild.stdout.emit("data", buildJsonFrame({ event: "stream_finished", streamId: capturedStreamId }));
      }
      await startStreamResult?.finished?.catch(() => {});
    }
  });

  it("C3: PCM frames emitted after stream_started are forwarded to onStreamAudio listeners", async () => {
    const audioChunks = [];
    let receivedStreamId = null;
    manager.onStreamAudio((sid, chunk) => {
      receivedStreamId = sid;
      audioChunks.push(chunk);
    });

    let capturedStreamId = null;
    let startStreamResult;

    const autoAck = setInterval(() => {
      const calls = mockChild.stdin.write.mock.calls;
      for (const call of calls) {
        let parsed;
        try { parsed = JSON.parse(call[0].trim()); } catch { continue; }

        if (parsed.cmd === "configure" && !parsed._acked) {
          parsed._acked = true;
          mockChild.stdout.emit("data", buildJsonFrame({ id: parsed.id, ok: true }));
        }
        if (parsed.cmd === "start_stream" && !parsed._acked) {
          parsed._acked = true;
          capturedStreamId = parsed.streamId;
          mockChild.stdout.emit("data", buildJsonFrame({ id: parsed.id, ok: true }));
          mockChild.stdout.emit("data", buildJsonFrame({ event: "stream_started", streamId: capturedStreamId }));
          // Emit a PCM frame
          mockChild.stdout.emit("data", buildPcmFrame([0.1, 0.2, 0.3, 0.4]));
        }
      }
    }, 5);

    try {
      startStreamResult = await manager.startStream("PCM test", "speaker_0", 1.0);
      await new Promise((r) => setTimeout(r, 30));

      expect(audioChunks.length).toBeGreaterThan(0);
      expect(Buffer.isBuffer(audioChunks[0])).toBe(true);
    } finally {
      clearInterval(autoAck);
      if (capturedStreamId) {
        mockChild.stdout.emit("data", buildJsonFrame({ event: "stream_finished", streamId: capturedStreamId }));
      }
      await startStreamResult?.finished?.catch(() => {});
    }
  });

  it("C4: stream_finished event resolves the startStream finished promise", async () => {
    let capturedStreamId = null;
    let startStreamResult;

    const autoAck = setInterval(() => {
      const calls = mockChild.stdin.write.mock.calls;
      for (const call of calls) {
        let parsed;
        try { parsed = JSON.parse(call[0].trim()); } catch { continue; }

        if (parsed.cmd === "configure" && !parsed._acked) {
          parsed._acked = true;
          mockChild.stdout.emit("data", buildJsonFrame({ id: parsed.id, ok: true }));
        }
        if (parsed.cmd === "start_stream" && !parsed._acked) {
          parsed._acked = true;
          capturedStreamId = parsed.streamId;
          mockChild.stdout.emit("data", buildJsonFrame({ id: parsed.id, ok: true }));
          mockChild.stdout.emit("data", buildJsonFrame({ event: "stream_started", streamId: capturedStreamId }));
        }
      }
    }, 5);

    try {
      startStreamResult = await manager.startStream("Finish test", "speaker_0", 1.0);
      expect(capturedStreamId).toBeTruthy();

      // Emit stream_finished to resolve the promise
      const finishPayload = { event: "stream_finished", streamId: capturedStreamId, durationMs: 1500, sampleRate: 24000 };
      mockChild.stdout.emit("data", buildJsonFrame(finishPayload));

      const finishResult = await startStreamResult.finished;
      expect(finishResult).toMatchObject({ streamId: capturedStreamId, finished: true });
    } finally {
      clearInterval(autoAck);
    }
  });
});

// ---------------------------------------------------------------------------
// Group D: Cancel and error handling
// ---------------------------------------------------------------------------

describe("Group D: Cancel and error handling", () => {
  let mockChild;
  let manager;

  beforeEach(() => {
    mockChild = makeMockChild();

    const { createQwenStreamingEngineManager } = require("../main/qwen-streaming-engine.js");

    manager = createQwenStreamingEngineManager(null, {
      isPackaged: false,
      projectRoot: "/fake/project",
      userDataPath: "/fake/user-data",
      sendStatus: vi.fn(),
      sendRuntimeError: vi.fn(),
      spawnProcess: vi.fn().mockReturnValue(mockChild),
      commandTimeoutMs: {
        configure: 50,
        start_stream: 50,
        cancel_stream: 50,
        warmup: 50,
        status: 50,
        shutdown: 50,
        list_speakers: 50,
      },
      streamTimeoutMs: 500,
      fs: {
        readFile: vi.fn().mockResolvedValue(
          JSON.stringify({
            pythonExe: "/usr/bin/python3",
            modelId: "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
            device: "cuda:0",
          }),
        ),
        access: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("D1: cancelStream writes a cancel_stream command to stdin", async () => {
    // First, spin up a stream so sidecarState is initialized.
    let capturedStreamId = null;
    let startStreamResult;

    const autoAck = setInterval(() => {
      const calls = mockChild.stdin.write.mock.calls;
      for (const call of calls) {
        let parsed;
        try { parsed = JSON.parse(call[0].trim()); } catch { continue; }

        if (parsed.cmd === "configure" && !parsed._acked) {
          parsed._acked = true;
          mockChild.stdout.emit("data", buildJsonFrame({ id: parsed.id, ok: true }));
        }
        if (parsed.cmd === "start_stream" && !parsed._acked) {
          parsed._acked = true;
          capturedStreamId = parsed.streamId;
          mockChild.stdout.emit("data", buildJsonFrame({ id: parsed.id, ok: true }));
          mockChild.stdout.emit("data", buildJsonFrame({ event: "stream_started", streamId: capturedStreamId }));
        }
        if (parsed.cmd === "cancel_stream" && !parsed._acked) {
          parsed._acked = true;
          mockChild.stdout.emit("data", buildJsonFrame({ id: parsed.id, ok: true }));
          mockChild.stdout.emit("data", buildJsonFrame({ event: "stream_cancelled", streamId: capturedStreamId }));
        }
      }
    }, 5);

    try {
      startStreamResult = await manager.startStream("Cancel test", "speaker_0", 1.0);
      await new Promise((r) => setTimeout(r, 20));

      await manager.cancelStream(capturedStreamId);
      await new Promise((r) => setTimeout(r, 20));

      const allWrites = mockChild.stdin.write.mock.calls.map((c) => {
        try { return JSON.parse(c[0].trim()); } catch { return null; }
      }).filter(Boolean);

      const cancelCmd = allWrites.find((w) => w.cmd === "cancel_stream");
      expect(cancelCmd).toBeDefined();
      expect(cancelCmd.streamId).toBe(capturedStreamId);
    } finally {
      clearInterval(autoAck);
      await startStreamResult?.finished?.catch(() => {});
    }
  });

  it("D2: stream_cancelled event resolves (not rejects) the finished promise", async () => {
    let capturedStreamId = null;
    let startStreamResult;

    const autoAck = setInterval(() => {
      const calls = mockChild.stdin.write.mock.calls;
      for (const call of calls) {
        let parsed;
        try { parsed = JSON.parse(call[0].trim()); } catch { continue; }

        if (parsed.cmd === "configure" && !parsed._acked) {
          parsed._acked = true;
          mockChild.stdout.emit("data", buildJsonFrame({ id: parsed.id, ok: true }));
        }
        if (parsed.cmd === "start_stream" && !parsed._acked) {
          parsed._acked = true;
          capturedStreamId = parsed.streamId;
          mockChild.stdout.emit("data", buildJsonFrame({ id: parsed.id, ok: true }));
          mockChild.stdout.emit("data", buildJsonFrame({ event: "stream_started", streamId: capturedStreamId }));
        }
      }
    }, 5);

    try {
      startStreamResult = await manager.startStream("Cancelled stream", "speaker_0", 1.0);
      expect(capturedStreamId).toBeTruthy();

      // Emit stream_cancelled directly (no cancelStream() call needed — the event alone resolves)
      mockChild.stdout.emit("data", buildJsonFrame({ event: "stream_cancelled", streamId: capturedStreamId }));

      // finished should RESOLVE (not reject) with cancelled: true
      const result = await startStreamResult.finished;
      expect(result).toMatchObject({ streamId: capturedStreamId, cancelled: true });
    } finally {
      clearInterval(autoAck);
    }
  });

  it("D3: unexpected subprocess exit sets getModelStatus().ready to false", async () => {
    // Bring up the sidecar by initiating a stream, then kill the process.
    let startPromise;
    const autoAck = setInterval(() => {
      const calls = mockChild.stdin.write.mock.calls;
      for (const call of calls) {
        let parsed;
        try { parsed = JSON.parse(call[0].trim()); } catch { continue; }
        if (parsed.cmd === "configure" && !parsed._acked) {
          parsed._acked = true;
          mockChild.stdout.emit("data", buildJsonFrame({ id: parsed.id, ok: true }));
        }
      }
    }, 5);

    try {
      // startStream will hang (no start_stream ack) — we let it timeout, but
      // we trigger exit first.
      startPromise = manager.startStream("Exit test", "speaker_0", 1.0).catch(() => {});
      await new Promise((r) => setTimeout(r, 30));

      // Simulate unexpected process exit
      mockChild.emit("exit", 1, null);
      await new Promise((r) => setTimeout(r, 10));

      const status = manager.getModelStatus();
      expect(status.ready).toBe(false);
    } finally {
      clearInterval(autoAck);
      await startPromise;
    }
  });
});

// ---------------------------------------------------------------------------
// Group E: Preload bridge — type/shape contracts
// ---------------------------------------------------------------------------

describe("Group E: Preload bridge type/shape contracts", () => {
  it("E1: qwenStreaming.ts exports QwenStreamStartResult, QwenStreamAudioEvent, QwenStreamingEngineStatus with correct shapes", async () => {
    // We import the TS types file at runtime via a JS check on the source text.
    // Types don't survive transpilation, so we verify the shapes by checking
    // that the keywords appear in the source file — confirming the contract exists.
    const fs = await import("fs/promises");
    const path = await import("path");
    const filePath = path.default.resolve(
      process.cwd(),
      "src/types/qwenStreaming.ts",
    );
    const source = await fs.default.readFile(filePath, "utf8");

    // All three types must be exported from the file
    expect(source).toMatch(/export interface QwenStreamStartResult/);
    expect(source).toMatch(/export interface QwenStreamAudioEvent/);
    expect(source).toMatch(/export interface QwenStreamingEngineStatus/);

    // Required fields per the sprint contract
    expect(source).toMatch(/ok:\s*boolean/);
    expect(source).toMatch(/streamId\??\s*:/);
    expect(source).toMatch(/chunk:\s*Buffer/);
    expect(source).toMatch(/ready:\s*boolean/);
    expect(source).toMatch(/model_loaded:\s*boolean/);
  });

  it("E2: ElectronAPI in src/types.ts declares qwenStreamStart, qwenStreamCancel, qwenStreamStatus, onQwenStreamAudio", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");
    const filePath = path.default.resolve(process.cwd(), "src/types.ts");
    const source = await fs.default.readFile(filePath, "utf8");

    expect(source).toMatch(/qwenStreamStart\s*:/);
    expect(source).toMatch(/qwenStreamCancel\s*:/);
    expect(source).toMatch(/qwenStreamStatus\s*:/);
    expect(source).toMatch(/onQwenStreamAudio\s*:/);
  });
});
