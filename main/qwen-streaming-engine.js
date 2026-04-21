"use strict";
// main/qwen-streaming-engine.js — Persistent Python streaming sidecar manager.
//
// Owns the local Qwen3-TTS-streaming sidecar subprocess, parses its binary-framed
// stdout (header = 4-byte LE length + 1-byte type), dispatches JSON control events
// back to callers, and forwards PCM Float32 frames to registered listeners.
//
// Mirrors main/qwen-engine.js for config resolution, subprocess lifecycle, status
// snapshot shape, and timing recording so renderer status UI can treat both engines
// interchangeably.

const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");
const { spawn } = require("child_process");

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QWEN_DEFAULTS = {
  modelId: "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
  device: "cuda:0",
  dtype: "bfloat16",
  attnImplementation: "flash_attention_2",
};

// Binary frame type tags emitted by the streaming sidecar on stdout.
const FRAME_TYPE_JSON = 0x01;
const FRAME_TYPE_PCM = 0x02;
const FRAME_HEADER_BYTES = 5; // 4-byte LE uint32 length + 1-byte type tag.

// Command and stream timeouts. CUDA hosts get tight timeouts; CPU hosts are
// generous because warm-up and first-chunk can be materially slower.
const QWEN_STREAMING_COMMAND_TIMEOUTS_MS = {
  status: 5000,
  warmup: 30000,
  list_speakers: 5000,
  start_stream: 5000, // Time to acknowledge start_stream (not total playback).
  cancel_stream: 5000,
  shutdown: 1500,
};

const QWEN_STREAMING_CPU_COMMAND_TIMEOUTS_MS = {
  status: 120000,
  warmup: 300000,
  list_speakers: 30000,
  start_stream: 30000,
  cancel_stream: 10000,
  shutdown: 1500,
};

// How long we will wait for `stream_finished` after `start_stream` is acknowledged.
// This is the end-to-end streaming budget, not the first-chunk latency budget.
const QWEN_STREAM_TIMEOUT_MS_DEFAULT = 120000;
const QWEN_STREAM_TIMEOUT_MS_CPU = 600000;

const QWEN_STARTUP_SPIKE_WARNING_MS = 3000;
const QWEN_PREFLIGHT_TIMEOUT_MS = 15000;

const DEFAULT_SNAPSHOT = {
  status: "idle",
  detail: null,
  reason: null,
  ready: false,
  loading: false,
  recoverable: false,
  streaming: false,
  statusTimingMs: null,
  preloadTimingMs: null,
  voiceListTimingMs: null,
  warmupMs: null,
  firstChunkMs: null,
  spikeWarningThresholdMs: QWEN_STARTUP_SPIKE_WARNING_MS,
  spikeWarning: false,
};

// ---------------------------------------------------------------------------
// Defaults — overridable for tests
// ---------------------------------------------------------------------------

function defaultIsPackaged(app) {
  try {
    if (app && typeof app.isPackaged === "boolean") return app.isPackaged;
    return require("electron").app.isPackaged;
  } catch {
    return false;
  }
}

function defaultUserDataPath(app) {
  try {
    if (app && typeof app.getPath === "function") return app.getPath("userData");
    return require("electron").app.getPath("userData");
  } catch {
    return path.resolve(__dirname, "..", ".runtime", "user-data-fallback");
  }
}

function defaultProjectRoot(app) {
  try {
    if (app && typeof app.getAppPath === "function") return app.getAppPath();
  } catch {
    // fall through
  }
  return path.resolve(__dirname, "..");
}

function defaultSendStatus(snapshot) {
  try {
    const { BrowserWindow } = require("electron");
    const win = BrowserWindow.getAllWindows()[0];
    if (win && !win.isDestroyed()) {
      win.webContents.send("tts-qwen-streaming-engine-status", snapshot);
    }
  } catch {
    // Non-fatal in tests or non-window contexts.
  }
}

function defaultSendRuntimeError(message) {
  try {
    const { BrowserWindow } = require("electron");
    const win = BrowserWindow.getAllWindows()[0];
    if (win && !win.isDestroyed()) {
      win.webContents.send("tts-qwen-streaming-runtime-error", message);
    }
  } catch {
    // Non-fatal in tests or non-window contexts.
  }
}

function defaultSpawnProcess(command, args, options) {
  return spawn(command, args, options);
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function normalizeSnapshot(snapshot) {
  return {
    ...DEFAULT_SNAPSHOT,
    ...snapshot,
    detail: snapshot?.detail ?? null,
    reason: snapshot?.reason ?? null,
    ready: Boolean(snapshot?.ready),
    loading: Boolean(snapshot?.loading),
    recoverable: Boolean(snapshot?.recoverable),
    streaming: Boolean(snapshot?.streaming),
    statusTimingMs: Number.isFinite(snapshot?.statusTimingMs) ? snapshot.statusTimingMs : null,
    preloadTimingMs: Number.isFinite(snapshot?.preloadTimingMs) ? snapshot.preloadTimingMs : null,
    voiceListTimingMs: Number.isFinite(snapshot?.voiceListTimingMs) ? snapshot.voiceListTimingMs : null,
    warmupMs: Number.isFinite(snapshot?.warmupMs) ? snapshot.warmupMs : null,
    firstChunkMs: Number.isFinite(snapshot?.firstChunkMs) ? snapshot.firstChunkMs : null,
    spikeWarningThresholdMs: Number.isFinite(snapshot?.spikeWarningThresholdMs)
      ? snapshot.spikeWarningThresholdMs
      : QWEN_STARTUP_SPIKE_WARNING_MS,
    spikeWarning: Boolean(snapshot?.spikeWarning),
  };
}

function makeRuntimeError(detail, reason = "runtime-error", recoverable = true) {
  const error = new Error(detail);
  error.reason = reason;
  error.recoverable = recoverable;
  return error;
}

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function isCudaConfiguredDevice(device) {
  return /^cuda(?::\d+)?$/i.test(String(device || "").trim());
}

// ---------------------------------------------------------------------------
// Binary frame parser
// ---------------------------------------------------------------------------
//
// The streaming sidecar writes framed output to stdout:
//
//   [4 bytes LE uint32 length][1 byte type][N bytes payload]
//
// Type 0x01 (JSON) payloads are UTF-8 JSON control events.
// Type 0x02 (PCM)  payloads are little-endian Float32 audio samples.
//
// Because Node emits stdout in arbitrary chunk sizes, we maintain a rolling
// Buffer and slice off complete frames as they become available. A partial
// frame at the tail is kept in the accumulator until the next data event.
//
// Returns the number of bytes consumed. The caller should slice() the original
// buffer afterwards. Callbacks are synchronous and must not throw — the caller
// catches and logs runtime errors.

function parseFrames(accumulator, onJson, onPcm) {
  let offset = 0;
  const total = accumulator.length;

  while (total - offset >= FRAME_HEADER_BYTES) {
    const length = accumulator.readUInt32LE(offset);
    const type = accumulator.readUInt8(offset + 4);
    const frameEnd = offset + FRAME_HEADER_BYTES + length;

    if (frameEnd > total) {
      // Payload not yet fully received.
      break;
    }

    const payload = accumulator.slice(offset + FRAME_HEADER_BYTES, frameEnd);

    if (type === FRAME_TYPE_JSON) {
      try {
        const message = JSON.parse(payload.toString("utf8"));
        onJson(message);
      } catch (error) {
        // Malformed JSON from sidecar; surface to caller via onJson contract.
        onJson({ __parseError: true, error: error.message });
      }
    } else if (type === FRAME_TYPE_PCM) {
      // Forward the raw Float32 buffer. Caller decides how to slice/forward.
      onPcm(Buffer.from(payload));
    } else {
      // Unknown frame type — drop it but keep parsing. Emit a diagnostic event.
      onJson({ __unknownFrameType: type, length });
    }

    offset = frameEnd;
  }

  return offset;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

function createQwenStreamingEngineManager(app, options = {}) {
  const fsModule = options.fs ?? fs;
  const pathModule = options.path ?? path;
  const isPackaged =
    typeof options.isPackaged === "function"
      ? options.isPackaged
      : () => Boolean(options.isPackaged ?? defaultIsPackaged(app));
  const getUserDataPath =
    typeof options.userDataPath === "function"
      ? options.userDataPath
      : () => options.userDataPath ?? defaultUserDataPath(app);
  const projectRoot = options.projectRoot ?? defaultProjectRoot(app);
  const sendStatus = options.sendStatus ?? defaultSendStatus;
  const sendRuntimeError = options.sendRuntimeError ?? defaultSendRuntimeError;
  const spawnProcess = options.spawnProcess ?? defaultSpawnProcess;
  const pythonBin = options.pythonBin ?? "python";
  const streamTimeoutMsCuda = options.streamTimeoutMs ?? QWEN_STREAM_TIMEOUT_MS_DEFAULT;
  const streamTimeoutMsCpu = options.streamTimeoutMsCpu ?? QWEN_STREAM_TIMEOUT_MS_CPU;
  const commandTimeouts = {
    ...QWEN_STREAMING_COMMAND_TIMEOUTS_MS,
    ...(options.commandTimeoutMs ?? {}),
  };
  const cpuCommandTimeouts = {
    ...QWEN_STREAMING_CPU_COMMAND_TIMEOUTS_MS,
    ...(options.cpuCommandTimeoutMs ?? {}),
  };

  let engineStatusSnapshot = { ...DEFAULT_SNAPSHOT };
  let sidecarState = null;
  let serializedCommand = Promise.resolve();
  let preloadInFlight = null;
  let voicesInFlight = null;
  const runtimeTimings = {
    statusTimingMs: null,
    preloadTimingMs: null,
    voiceListTimingMs: null,
    warmupMs: null,
    firstChunkMs: null,
  };
  const audioListeners = new Set();
  const finishedListeners = new Set();

  // -------------------------------------------------------------------------
  // Snapshot + timing helpers
  // -------------------------------------------------------------------------

  function getSpikeWarningForTiming(timingMs) {
    return Number.isFinite(timingMs) && timingMs > QWEN_STARTUP_SPIKE_WARNING_MS;
  }

  function buildTimingSnapshot(overrides = {}) {
    const next = { ...runtimeTimings, ...overrides };
    return {
      statusTimingMs: next.statusTimingMs,
      preloadTimingMs: next.preloadTimingMs,
      voiceListTimingMs: next.voiceListTimingMs,
      warmupMs: next.warmupMs,
      firstChunkMs: next.firstChunkMs,
      spikeWarningThresholdMs: QWEN_STARTUP_SPIKE_WARNING_MS,
      spikeWarning:
        getSpikeWarningForTiming(next.preloadTimingMs) ||
        getSpikeWarningForTiming(next.warmupMs) ||
        getSpikeWarningForTiming(next.firstChunkMs),
    };
  }

  function recordTiming(field, timingMs) {
    runtimeTimings[field] = timingMs;
    return buildTimingSnapshot();
  }

  function updateSnapshot(snapshot) {
    const timingSnapshot = buildTimingSnapshot(snapshot);
    const next = normalizeSnapshot({ ...engineStatusSnapshot, ...timingSnapshot, ...snapshot });
    const changed = JSON.stringify(engineStatusSnapshot) !== JSON.stringify(next);
    engineStatusSnapshot = next;
    if (changed) sendStatus(next);
    return next;
  }

  // -------------------------------------------------------------------------
  // Config resolution — mirrors main/qwen-engine.js
  // -------------------------------------------------------------------------

  function getConfigPath() {
    if (isPackaged()) {
      return pathModule.join(getUserDataPath(), "qwen", "config.json");
    }
    return pathModule.join(projectRoot, ".runtime", "qwen", "config.json");
  }

  async function resolveConfig() {
    const configPath = getConfigPath();
    let raw;

    try {
      raw = await fsModule.readFile(configPath, "utf8");
    } catch (error) {
      if (error && error.code === "ENOENT") {
        return {
          ok: false,
          snapshot: updateSnapshot({
            status: "unavailable",
            detail: `Qwen streaming runtime config was not found at ${configPath}`,
            reason: "config-missing",
            ready: false,
            loading: false,
            recoverable: true,
          }),
        };
      }

      return {
        ok: false,
        snapshot: updateSnapshot({
          status: "error",
          detail: `Unable to read Qwen streaming runtime config at ${configPath}: ${error.message}`,
          reason: "config-read-failed",
          ready: false,
          loading: false,
          recoverable: true,
        }),
      };
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        ok: false,
        snapshot: updateSnapshot({
          status: "error",
          detail: `Qwen streaming runtime config at ${configPath} is invalid JSON`,
          reason: "config-invalid",
          ready: false,
          loading: false,
          recoverable: true,
        }),
      };
    }

    const normalized = {
      pythonExe: typeof parsed.pythonExe === "string" ? parsed.pythonExe.trim() : "",
      modelId:
        typeof parsed.modelId === "string" && parsed.modelId.trim()
          ? parsed.modelId.trim()
          : QWEN_DEFAULTS.modelId,
      device:
        typeof parsed.device === "string" && parsed.device.trim()
          ? parsed.device.trim()
          : QWEN_DEFAULTS.device,
      dtype:
        typeof parsed.dtype === "string" && parsed.dtype.trim()
          ? parsed.dtype.trim()
          : QWEN_DEFAULTS.dtype,
      attnImplementation:
        typeof parsed.attnImplementation === "string" && parsed.attnImplementation.trim()
          ? parsed.attnImplementation.trim()
          : QWEN_DEFAULTS.attnImplementation,
      streaming: parsed.streaming !== false, // opt-out rather than opt-in
      speakers: Array.isArray(parsed.speakers)
        ? parsed.speakers.map((s) => String(s)).filter(Boolean)
        : null,
    };

    if (!normalized.pythonExe) {
      return {
        ok: false,
        snapshot: updateSnapshot({
          status: "error",
          detail: `Qwen streaming runtime config at ${configPath} is missing required field: pythonExe`,
          reason: "config-invalid",
          ready: false,
          loading: false,
          recoverable: true,
        }),
      };
    }

    try {
      await fsModule.access(normalized.pythonExe);
    } catch {
      return {
        ok: false,
        snapshot: updateSnapshot({
          status: "unavailable",
          detail: `Configured Qwen streaming python executable was not found: ${normalized.pythonExe}`,
          reason: "python-missing",
          ready: false,
          loading: false,
          recoverable: true,
        }),
        configPath,
        config: normalized,
      };
    }

    return { ok: true, configPath, config: normalized };
  }

  // -------------------------------------------------------------------------
  // Timeout selection
  // -------------------------------------------------------------------------

  function getCommandTimeoutMs(command, config) {
    if (!isCudaConfiguredDevice(config?.device)) {
      return (
        cpuCommandTimeouts[command] ??
        commandTimeouts[command] ??
        QWEN_STREAMING_COMMAND_TIMEOUTS_MS[command] ??
        5000
      );
    }
    return commandTimeouts[command] ?? QWEN_STREAMING_COMMAND_TIMEOUTS_MS[command] ?? 5000;
  }

  function getStreamTimeoutMs(config) {
    return isCudaConfiguredDevice(config?.device) ? streamTimeoutMsCuda : streamTimeoutMsCpu;
  }

  // -------------------------------------------------------------------------
  // Sidecar lifecycle
  // -------------------------------------------------------------------------

  function rejectAllPending(detail, reason) {
    if (!sidecarState) return;
    for (const deferred of sidecarState.pending.values()) {
      deferred.reject(makeRuntimeError(detail, reason, true));
    }
    sidecarState.pending.clear();

    for (const [, stream] of sidecarState.streams) {
      if (stream.timer) clearTimeout(stream.timer);
      stream.reject(makeRuntimeError(detail, reason, true));
    }
    sidecarState.streams.clear();
  }

  function forwardAudioChunk(streamId, chunk) {
    // streamId is whatever the most-recently-started stream reported; PCM frames
    // are not tagged with their stream id in the wire protocol, so we use the
    // `activeStreamId` tracked at the JSON layer. Renderers that need per-stream
    // routing should gate on the value we hand them here.
    for (const listener of audioListeners) {
      try {
        listener(streamId, chunk);
      } catch {
        // Listener faults must never propagate into the parser loop.
      }
    }
  }

  function forwardStreamFinished(streamId) {
    // QWEN-STREAM-3 BLOCKER-1: Notify renderer listeners that a stream has ended
    // so strategies can flush their accumulators and fire onEnd. The sidecar
    // signals completion via the `stream_finished` JSON event; this forwarder
    // is the bridge from that event to renderer-side acc.flush() + onEnd.
    for (const listener of finishedListeners) {
      try {
        listener(streamId);
      } catch {
        // Listener faults must never propagate into the parser loop.
      }
    }
  }

  function handleJsonEvent(message) {
    if (!sidecarState) return;

    if (message?.__parseError) {
      const detail = `Qwen streaming sidecar returned invalid JSON: ${message.error}`;
      sendRuntimeError(detail);
      updateSnapshot({
        status: "error",
        detail,
        reason: "sidecar-invalid-json",
        ready: false,
        loading: false,
        streaming: false,
        recoverable: true,
      });
      return;
    }
    if (message?.__unknownFrameType !== undefined) {
      // Unknown frame types are diagnostic — log and move on.
      return;
    }

    // Command acknowledgments carry `id` and match a pending deferred.
    const deferred = message.id ? sidecarState.pending.get(message.id) : null;
    if (deferred) {
      sidecarState.pending.delete(message.id);
      if (message.ok === false) {
        deferred.reject(
          makeRuntimeError(
            message.error || "Qwen streaming sidecar command failed",
            message.reason || "sidecar-command-failed",
            message.recoverable !== false,
          ),
        );
      } else {
        deferred.resolve(message);
      }
      return;
    }

    // Otherwise it's a streaming lifecycle event keyed by `event`.
    const event = message.event;
    const streamId = message.streamId ?? message.stream_id;

    if (event === "warmup_complete") {
      // Surfaced out-of-band for diagnostic purposes; the `warmup` command ack
      // is what resolves the preload() promise.
      if (Number.isFinite(message.elapsed_ms)) {
        recordTiming("warmupMs", Number(message.elapsed_ms));
        updateSnapshot({ warmupMs: Number(message.elapsed_ms) });
      }
      return;
    }

    if (event === "stream_started") {
      sidecarState.activeStreamId = streamId ?? null;
      const stream = streamId ? sidecarState.streams.get(streamId) : null;
      if (stream) {
        stream.started = true;
        stream.startedAt = Date.now();
      }
      return;
    }

    if (event === "stream_finished") {
      const stream = streamId ? sidecarState.streams.get(streamId) : null;
      if (stream) {
        if (stream.timer) clearTimeout(stream.timer);
        sidecarState.streams.delete(streamId);
        stream.resolve({
          streamId,
          finished: true,
          durationMs: Number.isFinite(message.durationMs) ? message.durationMs : null,
          sampleRate: Number.isFinite(message.sampleRate) ? message.sampleRate : null,
        });
      }
      if (sidecarState.activeStreamId === streamId) {
        sidecarState.activeStreamId = null;
      }
      if (sidecarState.streams.size === 0) {
        updateSnapshot({
          status: "ready",
          streaming: false,
        });
      }
      // QWEN-STREAM-3 BLOCKER-1: Notify renderer subscribers that this stream has
      // ended so the streaming strategy can flush() its accumulator and fire
      // onEnd(). Without this forward, acc.flush() is never called and every
      // streaming narration session hangs at the end.
      if (streamId) forwardStreamFinished(streamId);
      return;
    }

    if (event === "stream_cancelled") {
      const stream = streamId ? sidecarState.streams.get(streamId) : null;
      if (stream) {
        if (stream.timer) clearTimeout(stream.timer);
        sidecarState.streams.delete(streamId);
        // Cancellation is a successful outcome from the caller's perspective.
        stream.resolve({ streamId, cancelled: true });
      }
      if (sidecarState.activeStreamId === streamId) {
        sidecarState.activeStreamId = null;
      }
      if (sidecarState.streams.size === 0) {
        updateSnapshot({ status: "ready", streaming: false });
      }
      return;
    }

    if (event === "stream_error") {
      const detail = message.error || "Qwen streaming sidecar emitted stream_error";
      const reason = message.reason || "stream-error";
      const stream = streamId ? sidecarState.streams.get(streamId) : null;
      if (stream) {
        if (stream.timer) clearTimeout(stream.timer);
        sidecarState.streams.delete(streamId);
        stream.reject(makeRuntimeError(detail, reason, message.recoverable !== false));
      }
      if (sidecarState.activeStreamId === streamId) {
        sidecarState.activeStreamId = null;
      }
      if (sidecarState.streams.size === 0) {
        updateSnapshot({ status: "ready", streaming: false });
      }
      return;
    }

    if (event === "status") {
      // Passive status broadcast from the sidecar — reflect into the snapshot.
      updateSnapshot({
        status: message.status ?? engineStatusSnapshot.status,
        detail: message.detail ?? engineStatusSnapshot.detail,
        reason: message.reason ?? null,
        ready: message.ready !== false,
        loading: Boolean(message.loading),
        recoverable: Boolean(message.recoverable),
      });
      return;
    }

    if (event === "speakers") {
      if (Array.isArray(message.speakers)) {
        sidecarState.voices = message.speakers.map((s) => String(s)).filter(Boolean);
      }
      return;
    }

    // Unknown events are ignored — the protocol is extensible.
  }

  function handleStdoutData(chunk) {
    if (!sidecarState) return;
    const combined =
      sidecarState.stdoutBuffer.length === 0
        ? chunk
        : Buffer.concat([sidecarState.stdoutBuffer, chunk]);

    // PCM frames must be forwarded with the currently active stream id. We
    // capture a local reference so that a JSON event processed mid-parse
    // (e.g. stream_started / stream_finished) updates subsequent chunks
    // correctly on the very next iteration.
    const consumed = parseFrames(
      combined,
      (msg) => handleJsonEvent(msg),
      (pcm) => forwardAudioChunk(sidecarState?.activeStreamId ?? null, pcm),
    );

    sidecarState.stdoutBuffer = consumed >= combined.length ? Buffer.alloc(0) : combined.slice(consumed);
  }

  function attachSidecarLifecycle(child, resolved) {
    const pending = new Map();
    const streams = new Map();
    let stderrBuffer = "";

    const handleStderr = (chunk) => {
      const lines = String(chunk)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      if (lines.length === 0) return;
      stderrBuffer = lines[lines.length - 1];
    };

    child.stdout?.on?.("data", handleStdoutData);
    child.stderr?.on?.("data", handleStderr);

    child.on?.("exit", (code, signal) => {
      const detail =
        stderrBuffer || `Qwen streaming sidecar exited (code=${code ?? "null"}, signal=${signal ?? "null"})`;
      rejectAllPending(detail, "sidecar-exit");
      sidecarState = null;
      updateSnapshot({
        status: "unavailable",
        detail,
        reason: "sidecar-exit",
        ready: false,
        loading: false,
        streaming: false,
        recoverable: true,
      });
    });
    child.on?.("error", (error) => {
      const detail = `Failed to start Qwen streaming sidecar: ${error.message}`;
      rejectAllPending(detail, "sidecar-start-failed");
      sidecarState = null;
      sendRuntimeError(detail);
      updateSnapshot({
        status: "error",
        detail,
        reason: "sidecar-start-failed",
        ready: false,
        loading: false,
        streaming: false,
        recoverable: true,
      });
    });

    sidecarState = {
      child,
      config: resolved.config,
      pending,
      streams,
      voices: Array.isArray(resolved.config.speakers) ? resolved.config.speakers : [],
      activeStreamId: null,
      stdoutBuffer: Buffer.alloc(0),
    };
  }

  async function shutdownSidecar() {
    if (!sidecarState) return;
    const current = sidecarState;
    sidecarState = null;

    // Fire shutdown command — best-effort; we still kill below if it stalls.
    try {
      const id = `shutdown-${randomUUID()}`;
      current.child.stdin?.write?.(`${JSON.stringify({ id, cmd: "shutdown" })}\n`);
    } catch {
      // ignore
    }
    try {
      current.child.stdin?.end?.();
    } catch {
      // ignore
    }
    try {
      current.child.kill?.();
    } catch {
      // ignore
    }

    // Clean up any in-flight work owned by the dead sidecar.
    for (const deferred of current.pending.values()) {
      deferred.reject(makeRuntimeError("Qwen streaming sidecar shutdown", "sidecar-shutdown", true));
    }
    current.pending.clear();
    for (const [, stream] of current.streams) {
      if (stream.timer) clearTimeout(stream.timer);
      stream.reject(makeRuntimeError("Qwen streaming sidecar shutdown", "sidecar-shutdown", true));
    }
    current.streams.clear();
  }

  function ensureSidecarMatchesConfig(resolved) {
    if (!sidecarState) return false;
    return JSON.stringify(sidecarState.config) === JSON.stringify(resolved.config);
  }

  async function ensureSidecar(resolved) {
    if (ensureSidecarMatchesConfig(resolved)) return sidecarState;
    if (sidecarState) await shutdownSidecar();

    const scriptPath = pathModule.join(projectRoot, "scripts", "qwen_streaming_sidecar.py");
    const child = spawnProcess(
      resolved.config.pythonExe || pythonBin,
      [scriptPath],
      {
        cwd: projectRoot,
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env },
      },
    );

    attachSidecarLifecycle(child, resolved);
    // First command the sidecar expects is its config block on stdin.
    await dispatchCommand(sidecarState, "configure", { config: resolved.config });
    return sidecarState;
  }

  // -------------------------------------------------------------------------
  // Command sender (control-plane only; audio travels via forwardAudioChunk)
  // -------------------------------------------------------------------------

  function dispatchCommand(activeSidecar, command, payload = {}) {
    const id = `${command}-${randomUUID()}`;
    const deferred = createDeferred();
    const timeoutMs = getCommandTimeoutMs(command, activeSidecar.config);
    let timeoutHandle = null;

    const finalizeResolve = (value) => {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      deferred.resolve(value);
    };
    const finalizeReject = (error) => {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      deferred.reject(error);
    };

    activeSidecar.pending.set(id, {
      promise: deferred.promise,
      resolve: finalizeResolve,
      reject: finalizeReject,
    });

    try {
      activeSidecar.child.stdin.write(`${JSON.stringify({ id, cmd: command, ...payload })}\n`);
    } catch (error) {
      activeSidecar.pending.delete(id);
      throw makeRuntimeError(
        `Failed to send Qwen streaming ${command} command: ${error.message}`,
        "sidecar-write-failed",
        true,
      );
    }

    if (timeoutMs > 0) {
      timeoutHandle = setTimeout(() => {
        if (!activeSidecar.pending.has(id)) return;
        activeSidecar.pending.delete(id);
        finalizeReject(
          makeRuntimeError(
            `Qwen streaming ${command} timed out after ${timeoutMs} ms`,
            `${command}-timeout`,
            true,
          ),
        );
      }, timeoutMs);
    }

    return deferred.promise;
  }

  function sendCommand(resolved, command, payload = {}) {
    const run = async () => {
      const activeSidecar = await ensureSidecar(resolved);
      return dispatchCommand(activeSidecar, command, payload);
    };
    serializedCommand = serializedCommand.then(run, run);
    return serializedCommand;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  function getModelStatus() {
    return { ...engineStatusSnapshot };
  }

  async function preload() {
    if (preloadInFlight) return preloadInFlight;

    preloadInFlight = (async () => {
      const startedAt = Date.now();
      const resolved = await resolveConfig();
      if (!resolved.ok) {
        return {
          success: false,
          error: resolved.snapshot.detail || "Qwen streaming unavailable",
          status: resolved.snapshot.status,
          reason: resolved.snapshot.reason,
          recoverable: resolved.snapshot.recoverable,
        };
      }

      updateSnapshot({
        status: "warming",
        detail: "Warming up Qwen streaming runtime",
        reason: "preload-started",
        ready: false,
        loading: true,
        recoverable: true,
      });

      try {
        const result = await sendCommand(resolved, "warmup");
        const timingMs = Math.max(0, Date.now() - startedAt);
        const warmupMs = Number.isFinite(result.elapsed_ms)
          ? Number(result.elapsed_ms)
          : Number.isFinite(result.warmupMs)
          ? Number(result.warmupMs)
          : timingMs;
        recordTiming("preloadTimingMs", timingMs);
        recordTiming("warmupMs", warmupMs);
        updateSnapshot({
          status: result.status ?? "ready",
          detail: result.detail ?? "Qwen streaming runtime ready",
          reason: result.reason ?? null,
          ready: result.ready !== false,
          loading: false,
          streaming: false,
          recoverable: Boolean(result.recoverable),
          preloadTimingMs: timingMs,
          warmupMs,
          spikeWarning: getSpikeWarningForTiming(warmupMs),
        });
        return {
          success: true,
          timingMs,
          warmupMs,
          spikeWarningThresholdMs: QWEN_STARTUP_SPIKE_WARNING_MS,
          spikeWarning: getSpikeWarningForTiming(warmupMs),
        };
      } catch (error) {
        const timingMs = Math.max(0, Date.now() - startedAt);
        recordTiming("preloadTimingMs", timingMs);
        const snapshot = updateSnapshot({
          status: "error",
          detail: error?.message || "Qwen streaming warm-up failed",
          reason: error?.reason || "warmup-failed",
          ready: false,
          loading: false,
          streaming: false,
          recoverable: error?.recoverable !== false,
          preloadTimingMs: timingMs,
        });
        sendRuntimeError(snapshot.detail || "Qwen streaming warm-up failed");
        return {
          success: false,
          error: snapshot.detail || "Qwen streaming warm-up failed",
          status: snapshot.status,
          reason: snapshot.reason,
          recoverable: snapshot.recoverable,
          timingMs,
        };
      }
    })().finally(() => {
      preloadInFlight = null;
    });

    return preloadInFlight;
  }

  async function preflight() {
    const resolved = await resolveConfig();
    if (!resolved.ok) {
      return {
        status: resolved.snapshot.status,
        reason: resolved.snapshot.reason,
        detail: resolved.snapshot.detail,
        recoverable: resolved.snapshot.recoverable,
        ready: false,
      };
    }

    const startedAt = Date.now();
    try {
      const result = await sendCommand(resolved, "status");
      const elapsed = Math.max(0, Date.now() - startedAt);
      recordTiming("statusTimingMs", elapsed);
      const ready = result.ready !== false && (result.status ?? "ready") === "ready";
      updateSnapshot({
        status: result.status ?? "ready",
        detail: result.detail ?? "Qwen streaming runtime is reachable",
        reason: result.reason ?? null,
        ready,
        loading: false,
        recoverable: Boolean(result.recoverable),
        statusTimingMs: elapsed,
      });
      return {
        status: result.status ?? "ready",
        reason: result.reason ?? null,
        detail: result.detail ?? "Qwen streaming runtime is reachable",
        recoverable: Boolean(result.recoverable),
        ready,
        statusTimingMs: elapsed,
      };
    } catch (error) {
      const elapsed = Math.max(0, Date.now() - startedAt);
      recordTiming("statusTimingMs", elapsed);
      const detail = error?.message || "Qwen streaming preflight failed";
      sendRuntimeError(detail);
      const snapshot = updateSnapshot({
        status: "error",
        detail,
        reason: error?.reason || "preflight-failed",
        ready: false,
        loading: false,
        streaming: false,
        recoverable: error?.recoverable !== false,
        statusTimingMs: elapsed,
      });
      return {
        status: snapshot.status,
        reason: snapshot.reason,
        detail: snapshot.detail,
        recoverable: snapshot.recoverable,
        ready: false,
        statusTimingMs: elapsed,
      };
    }
  }

  async function listVoices() {
    if (voicesInFlight) return voicesInFlight;

    voicesInFlight = (async () => {
      const resolved = await resolveConfig();
      if (!resolved.ok) return [];

      const startedAt = Date.now();
      try {
        const result = await sendCommand(resolved, "list_speakers");
        const speakers = Array.isArray(result.speakers)
          ? result.speakers.map((s) => String(s)).filter(Boolean)
          : [];
        const elapsed = Math.max(0, Date.now() - startedAt);
        recordTiming("voiceListTimingMs", elapsed);
        if (sidecarState) sidecarState.voices = speakers;
        updateSnapshot({
          status: "ready",
          detail: "Qwen streaming runtime ready",
          reason: null,
          ready: true,
          loading: false,
          recoverable: false,
          voiceListTimingMs: elapsed,
        });
        return speakers;
      } catch (error) {
        const elapsed = Math.max(0, Date.now() - startedAt);
        recordTiming("voiceListTimingMs", elapsed);
        const detail = error?.message || "Qwen streaming speaker listing failed";
        sendRuntimeError(detail);
        updateSnapshot({
          status: "error",
          detail,
          reason: error?.reason || "speaker-list-failed",
          ready: false,
          loading: false,
          streaming: false,
          recoverable: error?.recoverable !== false,
          voiceListTimingMs: elapsed,
        });
        return [];
      }
    })().finally(() => {
      voicesInFlight = null;
    });

    return voicesInFlight;
  }

  async function startStream(text, speaker, rate) {
    const resolved = await resolveConfig();
    if (!resolved.ok) {
      throw makeRuntimeError(
        resolved.snapshot.detail || "Qwen streaming unavailable",
        resolved.snapshot.reason || "config-unavailable",
        resolved.snapshot.recoverable !== false,
      );
    }

    // Ensure the sidecar is up and the warm-up command has been issued.
    // We serialize through sendCommand so concurrent callers queue cleanly.
    const streamId = `stream-${randomUUID()}`;
    const streamDeferred = createDeferred();
    const startedAt = Date.now();

    const streamTimeoutMs = getStreamTimeoutMs(resolved.config);
    let streamTimer = null;

    // Register stream BEFORE sending the start command so frames received
    // mid-roundtrip still land in the map. We also record firstChunkMs on the
    // first PCM buffer observed for this streamId.
    const firstChunkProbe = (id, chunk) => {
      if (id === streamId && runtimeTimings.firstChunkMs === null) {
        const firstChunkMs = Math.max(0, Date.now() - startedAt);
        recordTiming("firstChunkMs", firstChunkMs);
        updateSnapshot({ firstChunkMs });
      }
      // Forward to public listeners regardless.
      void chunk;
    };
    audioListeners.add(firstChunkProbe);

    streamTimer = setTimeout(() => {
      // Defensive: nothing arrived, treat as hung.
      const current = sidecarState?.streams.get(streamId);
      if (!current) return;
      sidecarState.streams.delete(streamId);
      audioListeners.delete(firstChunkProbe);
      streamDeferred.reject(
        makeRuntimeError(
          `Qwen streaming stream ${streamId} timed out after ${streamTimeoutMs} ms without stream_finished`,
          "stream-timeout",
          true,
        ),
      );
      updateSnapshot({ status: "ready", streaming: false });
    }, streamTimeoutMs);

    // sidecarState may not exist yet; ensureSidecar inside sendCommand will create
    // it. We register into the active map right after sendCommand resolves.
    updateSnapshot({ streaming: true });

    try {
      await sendCommand(resolved, "start_stream", { streamId, text, speaker, rate });
    } catch (error) {
      clearTimeout(streamTimer);
      audioListeners.delete(firstChunkProbe);
      updateSnapshot({ status: "ready", streaming: false });
      throw error;
    }

    if (!sidecarState) {
      clearTimeout(streamTimer);
      audioListeners.delete(firstChunkProbe);
      throw makeRuntimeError(
        "Qwen streaming sidecar vanished after start_stream acknowledgement",
        "sidecar-missing",
        true,
      );
    }

    sidecarState.streams.set(streamId, {
      streamId,
      startedAt,
      started: false,
      timer: streamTimer,
      resolve: (value) => {
        audioListeners.delete(firstChunkProbe);
        streamDeferred.resolve(value);
      },
      reject: (error) => {
        audioListeners.delete(firstChunkProbe);
        streamDeferred.reject(error);
      },
    });

    return {
      streamId,
      // Callers can await `finished` if they want the end-of-stream signal.
      finished: streamDeferred.promise,
    };
  }

  async function cancelStream(streamId) {
    if (!streamId) return { cancelled: false, reason: "missing-stream-id" };
    if (!sidecarState || !sidecarState.streams.has(streamId)) {
      return { cancelled: false, reason: "stream-not-active" };
    }
    const resolved = await resolveConfig();
    if (!resolved.ok) {
      return { cancelled: false, reason: resolved.snapshot.reason || "config-unavailable" };
    }
    try {
      await sendCommand(resolved, "cancel_stream", { streamId });
      return { cancelled: true };
    } catch (error) {
      return { cancelled: false, reason: error?.reason || "cancel-failed", error: error?.message };
    }
  }

  function onStreamAudio(listener) {
    if (typeof listener !== "function") return () => {};
    audioListeners.add(listener);
    return () => {
      audioListeners.delete(listener);
    };
  }

  function onStreamFinished(listener) {
    // QWEN-STREAM-3 BLOCKER-1: Subscribe to end-of-stream notifications. Fires
    // once per completed stream with the stream's id. Mirrors onStreamAudio's
    // Set-backed registration + unsubscribe closure.
    if (typeof listener !== "function") return () => {};
    finishedListeners.add(listener);
    return () => {
      finishedListeners.delete(listener);
    };
  }

  return {
    getModelStatus,
    preload,
    preflight,
    listVoices,
    startStream,
    cancelStream,
    shutdown: shutdownSidecar,
    onStreamAudio,
    onStreamFinished,
    // Exposed for tests; not part of the documented public contract.
    _internal: {
      parseFrames,
      FRAME_TYPE_JSON,
      FRAME_TYPE_PCM,
    },
  };
}

module.exports = {
  createQwenStreamingEngineManager,
};
