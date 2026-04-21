"use strict";

const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");
const { spawn } = require("child_process");

const QWEN_DEFAULTS = {
  modelId: "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
  device: "cuda:0",
  dtype: "bfloat16",
  attnImplementation: "flash_attention_2",
};

const QWEN_COMMAND_TIMEOUTS_MS = {
  status: 5000,
  warmup: 5000,
  list_speakers: 5000,
  generate_custom_voice: 30000,
  shutdown: 1500,
};

const QWEN_CPU_COMMAND_TIMEOUTS_MS = {
  status: 120000,
  warmup: 120000,
  list_speakers: 30000,
  generate_custom_voice: 180000,
  shutdown: 1500,
};

const QWEN_STARTUP_SPIKE_WARNING_MS = 3000;
const QWEN_PREFLIGHT_TIMEOUT_MS = 15000;
const QWEN_SUPPORTED_HOST_DETAIL =
  "Blurby's external Qwen runtime supports pre-provisioned local Python environments on this machine. CUDA hosts are preferred for speed, but CPU-backed runtimes are allowed in this phase.";

const DEFAULT_SNAPSHOT = {
  status: "idle",
  detail: null,
  reason: null,
  ready: false,
  loading: false,
  recoverable: false,
  statusTimingMs: null,
  preloadTimingMs: null,
  voiceListTimingMs: null,
  generateTimingMs: null,
  spikeWarningThresholdMs: QWEN_STARTUP_SPIKE_WARNING_MS,
  spikeWarning: false,
};

const QWEN_SIDECAR_SOURCE = String.raw`
import json
import os
import sys
import traceback
import wave

CONFIG = None
MODEL = None
LOAD_ERROR = None

def send(payload):
    sys.stdout.write(json.dumps(payload) + "\n")
    sys.stdout.flush()

def fail(message_id, error, reason="runtime-error", recoverable=True):
    send({
        "id": message_id,
        "ok": False,
        "error": error,
        "reason": reason,
        "recoverable": recoverable,
    })

def normalize_speakers(raw):
    if isinstance(raw, dict):
        return [str(key) for key in raw.keys()]
    if isinstance(raw, (list, tuple, set)):
        return [str(item) for item in raw]
    return []

def write_pcm16_wav(file_path, wavs, sample_rate):
    try:
        import numpy as np
    except Exception as exc:
        raise RuntimeError(f"numpy unavailable for WAV export: {exc}")

    audio = wavs[0] if isinstance(wavs, (list, tuple)) else wavs
    array = np.asarray(audio, dtype=np.float32).reshape(-1)
    array = np.clip(array, -1.0, 1.0)
    pcm = (array * 32767.0).astype(np.int16)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with wave.open(file_path, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(int(sample_rate))
        wav_file.writeframes(pcm.tobytes())
    return len(array)

def ensure_model():
    global MODEL
    global LOAD_ERROR
    if MODEL is not None:
        return MODEL
    if CONFIG is None:
        raise RuntimeError("sidecar not configured")
    if LOAD_ERROR is not None:
        raise RuntimeError(LOAD_ERROR)
    try:
        import torch
        from qwen_tts import Qwen3TTSModel
        dtype = getattr(torch, CONFIG["dtype"])
        MODEL = Qwen3TTSModel.from_pretrained(
            CONFIG["modelId"],
            device_map=CONFIG["device"],
            dtype=dtype,
            attn_implementation=CONFIG["attnImplementation"],
        )
        return MODEL
    except Exception as exc:
        LOAD_ERROR = f"{type(exc).__name__}: {exc}"
        raise

def handle(message):
    global CONFIG
    command = message.get("command")
    message_id = message.get("id")

    try:
        if command == "configure":
            CONFIG = {
                "pythonExe": message["config"]["pythonExe"],
                "modelId": message["config"]["modelId"],
                "device": message["config"]["device"],
                "dtype": message["config"]["dtype"],
                "attnImplementation": message["config"]["attnImplementation"],
            }
            send({"id": message_id, "ok": True, "configured": True})
            return True

        if command == "warmup":
            ensure_model()
            send({
                "id": message_id,
                "ok": True,
                "status": "ready",
                "detail": "Qwen runtime ready for live narration playback",
                "reason": None,
                "ready": True,
                "loading": False,
                "recoverable": False,
            })
            return True

        if command == "status":
            ensure_model()
            send({
                "id": message_id,
                "ok": True,
                "status": "ready",
                "detail": "Qwen runtime ready for live narration playback",
                "reason": None,
                "ready": True,
                "loading": False,
                "recoverable": False,
            })
            return True

        if command == "list_speakers":
            model = ensure_model()
            speakers = normalize_speakers(model.get_supported_speakers())
            send({"id": message_id, "ok": True, "speakers": speakers})
            return True

        if command == "generate_custom_voice":
            model = ensure_model()
            wavs, sample_rate = model.generate_custom_voice(
                text=message["text"],
                language="Auto",
                speaker=message["speaker"],
            )
            sample_count = write_pcm16_wav(message["outputPath"], wavs, sample_rate)
            send({
                "id": message_id,
                "ok": True,
                "outputPath": message["outputPath"],
                "sampleRate": int(sample_rate),
                "durationMs": int((sample_count / float(sample_rate)) * 1000),
                "wordTimestamps": None,
            })
            return True

        if command == "shutdown":
            send({"id": message_id, "ok": True, "shutdown": True})
            return False

        fail(message_id, f"Unsupported command: {command}", "unsupported-command", False)
        return True
    except Exception as exc:
        fail(message_id, f"{type(exc).__name__}: {exc}", "runtime-command-failed", True)
        sys.stderr.write(traceback.format_exc() + "\n")
        sys.stderr.flush()
        return True

for line in sys.stdin:
    text = line.strip()
    if not text:
        continue
    try:
        message = json.loads(text)
    except Exception as exc:
        fail(None, f"Invalid JSON command: {exc}", "invalid-json", False)
        continue
    should_continue = handle(message)
    if not should_continue:
        break
`;

const QWEN_PREFLIGHT_SOURCE = String.raw`
import json
import os
import sys

def send(payload):
    sys.stdout.write(json.dumps(payload) + "\n")
    sys.stdout.flush()

def check_model_reachability(model_id):
    if isinstance(model_id, str) and os.path.isdir(model_id):
        return True, f"Local model directory found at {model_id}"
    try:
        from huggingface_hub import try_to_load_from_cache
        for filename in ("config.json", "model_index.json", ".gitattributes", "README.md"):
            cached = try_to_load_from_cache(model_id, filename)
            if cached is not None and str(cached) != "_CACHED_NO_EXIST":
                return True, f"Model files are reachable locally for {model_id}"
        return False, f"Configured Qwen model was not found locally for {model_id}. Blurby preflight does not download model weights."
    except Exception as exc:
        return False, f"Unable to verify local model availability for {model_id}: {type(exc).__name__}: {exc}"

def build_check(key, label, status, detail):
    return {
        "key": key,
        "label": label,
        "status": status,
        "detail": detail,
    }

def fail(status, reason, detail, config, checks, supported_host=False):
    send({
        "status": status,
        "reason": reason,
        "detail": detail,
        "recoverable": True,
        "supportedHost": supported_host,
        "requestedDevice": config.get("device"),
        "pythonExe": config.get("pythonExe"),
        "modelId": config.get("modelId"),
        "attnImplementation": config.get("attnImplementation"),
        "checkedAt": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "checks": checks,
    })

raw = sys.stdin.read().strip()
config = json.loads(raw) if raw else {}
checks = [
    build_check("python", "Python executable", "pass", f"Python executable found at {config.get('pythonExe')}.")
]

try:
    import torch
    checks.append(build_check("torch", "PyTorch", "pass", "PyTorch import succeeded."))
except Exception as exc:
    checks.append(build_check("torch", "PyTorch", "fail", f"PyTorch import failed: {type(exc).__name__}: {exc}"))
    fail("error", "torch-missing", checks[-1]["detail"], config, checks)
    raise SystemExit(0)

try:
    from qwen_tts import Qwen3TTSModel  # noqa: F401
    checks.append(build_check("qwen_tts", "qwen_tts", "pass", "qwen_tts import succeeded."))
except Exception as exc:
    checks.append(build_check("qwen_tts", "qwen_tts", "fail", f"qwen_tts import failed: {type(exc).__name__}: {exc}"))
    fail("error", "qwen-tts-missing", checks[-1]["detail"], config, checks)
    raise SystemExit(0)

device = str(config.get("device") or "").strip()
device_lower = device.lower()
if device_lower.startswith("cuda"):
    checks.append(build_check("host", "Supported host policy", "pass", f'Configured Qwen runtime targets "{device}", which is valid for the live narration lane.'))

    if not torch.cuda.is_available():
        checks.append(build_check("cuda", "CUDA visibility", "fail", "PyTorch did not detect a CUDA-visible GPU on this host."))
        fail("unavailable", "cuda-unavailable", checks[-1]["detail"], config, checks)
        raise SystemExit(0)

    device_count = torch.cuda.device_count()
    device_index = 0
    if ":" in device:
        try:
            device_index = int(device.split(":", 1)[1])
        except Exception:
            checks.append(build_check("cuda", "CUDA visibility", "fail", f'Configured CUDA device "{device}" is not a valid CUDA device string.'))
            fail("unavailable", "cuda-device-invalid", checks[-1]["detail"], config, checks)
            raise SystemExit(0)

    if device_index >= device_count:
        checks.append(build_check("cuda", "CUDA visibility", "fail", f'Configured CUDA device "{device}" is not available on this host (visible devices: {device_count}).'))
        fail("unavailable", "cuda-device-missing", checks[-1]["detail"], config, checks)
        raise SystemExit(0)

    checks.append(build_check("cuda", "CUDA visibility", "pass", f'CUDA device "{device}" is visible to PyTorch.'))
else:
    checks.append(build_check("host", "Supported host policy", "pass", f'Configured Qwen runtime uses device "{device}". CPU-backed narration is allowed in this phase, but startup and synthesis will be slower than CUDA.'))
    checks.append(build_check("cuda", "CUDA visibility", "skip", f'Configured device "{device}" does not require CUDA visibility checks.'))

attn_impl = str(config.get("attnImplementation") or "").strip()
if attn_impl == "flash_attention_2":
    try:
        import flash_attn  # noqa: F401
        checks.append(build_check("attention", "Attention backend", "pass", "flash_attn import succeeded for flash_attention_2."))
    except Exception as exc:
        checks.append(build_check("attention", "Attention backend", "fail", f'Configured attention backend "flash_attention_2" is unavailable: {type(exc).__name__}: {exc}'))
        fail("error", "attention-backend-missing", checks[-1]["detail"], config, checks)
        raise SystemExit(0)
else:
    checks.append(build_check("attention", "Attention backend", "pass", f'Configured attention backend "{attn_impl or "default"}" does not require FlashAttention 2.'))

model_ok, model_detail = check_model_reachability(config.get("modelId"))
checks.append(build_check("model", "Model availability", "pass" if model_ok else "fail", model_detail))
if not model_ok:
    fail("error", "model-unavailable", model_detail, config, checks)
    raise SystemExit(0)

send({
    "status": "ready",
    "reason": None,
    "detail": f'Qwen runtime preflight passed for configured device "{device}".',
    "recoverable": False,
    "supportedHost": True,
    "requestedDevice": config.get("device"),
    "pythonExe": config.get("pythonExe"),
    "modelId": config.get("modelId"),
    "attnImplementation": config.get("attnImplementation"),
    "checkedAt": __import__("datetime").datetime.utcnow().isoformat() + "Z",
    "checks": checks,
})
`;

function defaultIsPackaged() {
  try {
    return require("electron").app.isPackaged;
  } catch {
    return false;
  }
}

function defaultUserDataPath() {
  return require("electron").app.getPath("userData");
}

function defaultProjectRoot() {
  return path.resolve(__dirname, "..");
}

function defaultSendStatus(snapshot) {
  try {
    const { BrowserWindow } = require("electron");
    const win = BrowserWindow.getAllWindows()[0];
    if (win && !win.isDestroyed()) {
      win.webContents.send("tts-qwen-engine-status", snapshot);
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
      win.webContents.send("tts-qwen-runtime-error", message);
    }
  } catch {
    // Non-fatal in tests or non-window contexts.
  }
}

function defaultSpawnProcess(command, args, options) {
  return spawn(command, args, options);
}

function normalizeSnapshot(snapshot) {
  return {
    ...DEFAULT_SNAPSHOT,
    ...snapshot,
    detail: snapshot?.detail ?? null,
    reason: snapshot?.reason ?? null,
    ready: Boolean(snapshot?.ready),
    loading: Boolean(snapshot?.loading),
    recoverable: Boolean(snapshot?.recoverable),
    statusTimingMs: Number.isFinite(snapshot?.statusTimingMs) ? snapshot.statusTimingMs : null,
    preloadTimingMs: Number.isFinite(snapshot?.preloadTimingMs) ? snapshot.preloadTimingMs : null,
    voiceListTimingMs: Number.isFinite(snapshot?.voiceListTimingMs) ? snapshot.voiceListTimingMs : null,
    generateTimingMs: Number.isFinite(snapshot?.generateTimingMs) ? snapshot.generateTimingMs : null,
    spikeWarningThresholdMs: Number.isFinite(snapshot?.spikeWarningThresholdMs)
      ? snapshot.spikeWarningThresholdMs
      : QWEN_STARTUP_SPIKE_WARNING_MS,
    spikeWarning: Boolean(snapshot?.spikeWarning),
  };
}

function toErrorResponse(snapshot, fallback) {
  return {
    error: snapshot.detail || fallback,
    status: snapshot.status,
    reason: snapshot.reason,
    recoverable: snapshot.recoverable,
    timingMs: Number.isFinite(snapshot?.timingMs) ? snapshot.timingMs : null,
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

function createPreflightCheck(key, label, status, detail) {
  return { key, label, status, detail };
}

function createPreflightReport(report = {}) {
  return {
    status: report.status ?? "error",
    reason: report.reason ?? null,
    detail: report.detail ?? "Qwen runtime validation failed.",
    recoverable: typeof report.recoverable === "boolean" ? report.recoverable : true,
    supportedHost: Boolean(report.supportedHost),
    requestedDevice: report.requestedDevice ?? null,
    pythonExe: report.pythonExe ?? null,
    modelId: report.modelId ?? null,
    attnImplementation: report.attnImplementation ?? null,
    configPath: report.configPath ?? null,
    checkedAt: report.checkedAt ?? new Date().toISOString(),
    checks: Array.isArray(report.checks)
      ? report.checks.map((check) => ({
        key: String(check?.key ?? "unknown"),
        label: String(check?.label ?? check?.key ?? "Unknown check"),
        status: ["pass", "fail", "warn", "skip"].includes(String(check?.status))
          ? String(check.status)
          : "fail",
        detail: String(check?.detail ?? ""),
      }))
      : [],
  };
}

function isCudaConfiguredDevice(device) {
  return /^cuda(?::\d+)?$/i.test(String(device || "").trim());
}

function getUnsupportedDeviceDetail(device) {
  return `Configured Qwen runtime uses device "${device}". ${QWEN_SUPPORTED_HOST_DETAIL}`;
}

function buildStaticPreflightReport(snapshot, extras = {}) {
  const configPath = extras.configPath ?? null;
  const config = extras.config ?? null;
  const checks = [];

  if (snapshot.reason === "config-missing") {
    checks.push(createPreflightCheck("config", "Runtime config", "fail", snapshot.detail || "Qwen runtime config was not found."));
  } else if (snapshot.reason === "config-invalid" || snapshot.reason === "config-read-failed") {
    checks.push(createPreflightCheck("config", "Runtime config", "fail", snapshot.detail || "Qwen runtime config is invalid."));
  } else {
    checks.push(createPreflightCheck("config", "Runtime config", "pass", configPath ? `Qwen runtime config found at ${configPath}.` : "Qwen runtime config found.")); 
  }

  if (snapshot.reason === "python-missing") {
    checks.push(createPreflightCheck("python", "Python executable", "fail", snapshot.detail || "Configured Python executable was not found."));
  } else if (config?.pythonExe) {
    checks.push(createPreflightCheck("python", "Python executable", "pass", `Python executable found at ${config.pythonExe}.`));
  } else {
    checks.push(createPreflightCheck("python", "Python executable", "skip", "Python executable could not be checked because runtime config is unavailable."));
  }

  if (snapshot.reason === "device-unsupported") {
    checks.push(createPreflightCheck("host", "Supported host policy", "fail", snapshot.detail || QWEN_SUPPORTED_HOST_DETAIL));
  } else {
    checks.push(createPreflightCheck("host", "Supported host policy", "skip", "Supported-host validation requires a configured runtime."));
  }

  return createPreflightReport({
    status: snapshot.status,
    reason: snapshot.reason,
    detail: snapshot.detail,
    recoverable: snapshot.recoverable,
    supportedHost: false,
    requestedDevice: config?.device ?? null,
    pythonExe: config?.pythonExe ?? null,
    modelId: config?.modelId ?? null,
    attnImplementation: config?.attnImplementation ?? null,
    configPath,
    checks,
  });
}

function snapshotFromPreflightReport(report) {
  return {
    status: report.status === "ready" ? "unavailable" : report.status ?? "error",
    detail: report.detail ?? "Qwen runtime validation failed.",
    reason: report.reason ?? null,
    ready: false,
    loading: false,
    recoverable: report.recoverable !== false,
  };
}

function looksLikeJsonMessage(line) {
  return typeof line === "string" && line.trim().startsWith("{");
}

function isBenignSidecarNotice(line) {
  if (!line) return false;
  const text = String(line).trim();
  if (!text) return true;

  const lower = text.toLowerCase();
  return (
    lower.includes("flash-attn") ||
    lower.includes("flash attention 2 is not installed") ||
    lower.includes("sox is not installed") ||
    lower.includes("saved audio can be used for now") ||
    lower.includes("hf_xet") ||
    lower.includes("xet storage is enabled") ||
    lower.includes("falling back to regular http download") ||
    lower.startsWith("fetching ") ||
    /^[^:]+:\s+\d+%\|/.test(text) ||
    /^\s*\d+%\|/.test(text)
  );
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

async function fileExists(fsModule, targetPath) {
  try {
    await fsModule.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function removeFileIfPresent(fsModule, targetPath) {
  try {
    await fsModule.rm(targetPath, { force: true });
  } catch {
    // Best-effort cleanup only.
  }
}

async function decodePcm16Wav(fsModule, filePath) {
  const buffer = await fsModule.readFile(filePath);
  if (buffer.length < 44) {
    throw makeRuntimeError(`Qwen runtime returned an invalid WAV file: ${filePath}`, "wav-invalid", false);
  }
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") {
    throw makeRuntimeError(`Qwen runtime returned a non-WAV file: ${filePath}`, "wav-invalid", false);
  }

  let offset = 12;
  let fmt = null;
  let dataOffset = -1;
  let dataLength = 0;

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString("ascii", offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const chunkDataOffset = offset + 8;

    if (chunkId === "fmt ") {
      fmt = {
        formatCode: buffer.readUInt16LE(chunkDataOffset),
        channelCount: buffer.readUInt16LE(chunkDataOffset + 2),
        sampleRate: buffer.readUInt32LE(chunkDataOffset + 4),
        bitsPerSample: buffer.readUInt16LE(chunkDataOffset + 14),
      };
    } else if (chunkId === "data") {
      dataOffset = chunkDataOffset;
      dataLength = chunkSize;
      break;
    }

    offset = chunkDataOffset + chunkSize + (chunkSize % 2);
  }

  if (!fmt || dataOffset < 0) {
    throw makeRuntimeError(`Qwen runtime returned an incomplete WAV file: ${filePath}`, "wav-invalid", false);
  }
  if (fmt.formatCode !== 1 || fmt.bitsPerSample !== 16 || fmt.channelCount !== 1) {
    throw makeRuntimeError(
      `Qwen runtime returned an unsupported WAV format (format=${fmt.formatCode}, bits=${fmt.bitsPerSample}, channels=${fmt.channelCount})`,
      "wav-unsupported",
      false,
    );
  }

  const sampleCount = Math.floor(dataLength / 2);
  const audio = new Float32Array(sampleCount);
  for (let index = 0; index < sampleCount; index += 1) {
    audio[index] = buffer.readInt16LE(dataOffset + index * 2) / 32768;
  }

  return {
    audio,
    sampleRate: fmt.sampleRate,
    durationMs: Math.round((sampleCount / fmt.sampleRate) * 1000),
  };
}

function createQwenEngineManager(options = {}) {
  const fsModule = options.fs ?? fs;
  const pathModule = options.path ?? path;
  const isPackaged =
    typeof options.isPackaged === "function"
      ? options.isPackaged
      : () => Boolean(options.isPackaged ?? defaultIsPackaged());
  const getUserDataPath =
    typeof options.userDataPath === "function"
      ? options.userDataPath
      : () => options.userDataPath ?? defaultUserDataPath();
  const projectRoot = options.projectRoot ?? defaultProjectRoot();
  const sendStatus = options.sendStatus ?? defaultSendStatus;
  const sendRuntimeError = options.sendRuntimeError ?? defaultSendRuntimeError;
  const spawnProcess = options.spawnProcess ?? defaultSpawnProcess;
  const commandTimeouts = {
    ...QWEN_COMMAND_TIMEOUTS_MS,
    ...(options.commandTimeoutMs ?? {}),
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
    generateTimingMs: null,
  };

  function getSpikeWarningForTiming(timingMs) {
    return Number.isFinite(timingMs) && timingMs > QWEN_STARTUP_SPIKE_WARNING_MS;
  }

  function buildTimingSnapshot(overrides = {}) {
    const next = {
      ...runtimeTimings,
      ...overrides,
    };
    return {
      statusTimingMs: next.statusTimingMs,
      preloadTimingMs: next.preloadTimingMs,
      voiceListTimingMs: next.voiceListTimingMs,
      generateTimingMs: next.generateTimingMs,
      spikeWarningThresholdMs: QWEN_STARTUP_SPIKE_WARNING_MS,
      spikeWarning:
        getSpikeWarningForTiming(next.preloadTimingMs)
        || getSpikeWarningForTiming(next.generateTimingMs),
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

  function getConfigPath() {
    if (isPackaged()) {
      return pathModule.join(getUserDataPath(), "qwen", "config.json");
    }
    return pathModule.join(projectRoot, ".runtime", "qwen", "config.json");
  }

  function getRequestsDir() {
    return pathModule.join(getUserDataPath(), "tts-qwen", "requests");
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
            detail: `Qwen runtime config was not found at ${configPath}`,
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
          detail: `Unable to read Qwen runtime config at ${configPath}: ${error.message}`,
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
          detail: `Qwen runtime config at ${configPath} is invalid JSON`,
          reason: "config-invalid",
          ready: false,
          loading: false,
          recoverable: true,
        }),
      };
    }

    const normalized = {
      pythonExe: typeof parsed.pythonExe === "string" ? parsed.pythonExe.trim() : "",
      modelId: typeof parsed.modelId === "string" && parsed.modelId.trim() ? parsed.modelId.trim() : QWEN_DEFAULTS.modelId,
      device: typeof parsed.device === "string" && parsed.device.trim() ? parsed.device.trim() : QWEN_DEFAULTS.device,
      dtype: typeof parsed.dtype === "string" && parsed.dtype.trim() ? parsed.dtype.trim() : QWEN_DEFAULTS.dtype,
      attnImplementation:
        typeof parsed.attnImplementation === "string" && parsed.attnImplementation.trim()
          ? parsed.attnImplementation.trim()
          : QWEN_DEFAULTS.attnImplementation,
    };

    if (!normalized.pythonExe) {
      return {
        ok: false,
        snapshot: updateSnapshot({
          status: "error",
          detail: `Qwen runtime config at ${configPath} is missing required field: pythonExe`,
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
          detail: `Configured Qwen python executable was not found: ${normalized.pythonExe}`,
          reason: "python-missing",
          ready: false,
          loading: false,
          recoverable: true,
        }),
        configPath,
        config: normalized,
      };
    }

    return {
      ok: true,
      configPath,
      requestsDir: getRequestsDir(),
      config: normalized,
    };
  }

  async function runPreflightProbe(resolved) {
    return new Promise((resolve, reject) => {
      const child = spawnProcess(
        resolved.config.pythonExe,
        ["-u", "-c", QWEN_PREFLIGHT_SOURCE],
        {
          cwd: projectRoot,
          stdio: ["pipe", "pipe", "pipe"],
          env: { ...process.env },
        },
      );

      let stdoutBuffer = "";
      let stderrBuffer = "";
      let settled = false;

      const settleResolve = (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutHandle);
        resolve(value);
      };
      const settleReject = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutHandle);
        reject(error);
      };

      const timeoutHandle = setTimeout(() => {
        try {
          child.kill?.();
        } catch {
          // Best-effort timeout cleanup only.
        }
        settleReject(makeRuntimeError(`Qwen preflight timed out after ${QWEN_PREFLIGHT_TIMEOUT_MS} ms`, "preflight-timeout", true));
      }, QWEN_PREFLIGHT_TIMEOUT_MS);

      child.stdout?.on?.("data", (chunk) => {
        stdoutBuffer += String(chunk);
      });
      child.stderr?.on?.("data", (chunk) => {
        stderrBuffer += String(chunk);
      });
      child.on?.("error", (error) => {
        settleReject(makeRuntimeError(`Failed to start Qwen preflight probe: ${error.message}`, "preflight-start-failed", true));
      });
      child.on?.("exit", (code, signal) => {
        const lines = stdoutBuffer
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
          .filter((line) => looksLikeJsonMessage(line));
        if (lines.length > 0) {
          try {
            settleResolve(JSON.parse(lines[lines.length - 1]));
            return;
          } catch (error) {
            settleReject(makeRuntimeError(`Qwen preflight returned invalid JSON: ${error.message}`, "preflight-invalid-json", true));
            return;
          }
        }
        const detail = stderrBuffer.trim() || `Qwen preflight exited without a report (code=${code ?? "null"}, signal=${signal ?? "null"})`;
        settleReject(makeRuntimeError(detail, "preflight-failed", true));
      });

      try {
        child.stdin?.write?.(`${JSON.stringify(resolved.config)}\n`);
        child.stdin?.end?.();
      } catch (error) {
        settleReject(makeRuntimeError(`Failed to send Qwen preflight config: ${error.message}`, "preflight-write-failed", true));
      }
    });
  }

  function ensureSidecarMatchesConfig(resolved) {
    if (!sidecarState) return false;
    return JSON.stringify(sidecarState.config) === JSON.stringify(resolved.config);
  }

  function settlePendingWithExit(exitDetail) {
    if (!sidecarState) return;
    for (const deferred of sidecarState.pending.values()) {
      deferred.reject(makeRuntimeError(exitDetail, "sidecar-exit", true));
    }
    sidecarState.pending.clear();
  }

  function getCommandTimeoutMs(command) {
    return commandTimeouts[command] ?? QWEN_COMMAND_TIMEOUTS_MS[command] ?? 5000;
  }

  function getRuntimeCommandTimeoutMs(command, config) {
    if (!isCudaConfiguredDevice(config?.device)) {
      return QWEN_CPU_COMMAND_TIMEOUTS_MS[command] ?? getCommandTimeoutMs(command);
    }
    return getCommandTimeoutMs(command);
  }

  async function resetTimedOutSidecar(detail) {
    if (!sidecarState) return;
    const current = sidecarState;
    sidecarState = null;
    for (const deferred of current.pending.values()) {
      deferred.reject(makeRuntimeError(detail, "sidecar-timeout", true));
    }
    current.pending.clear();
    try {
      current.child.kill?.();
    } catch {
      // Best-effort kill only.
    }
  }

  function attachSidecarLifecycle(child, resolved) {
    const pending = new Map();
    let stdoutBuffer = "";
    let stderrBuffer = "";

    const handleStdout = (chunk) => {
      stdoutBuffer += String(chunk);
      while (stdoutBuffer.includes("\n")) {
        const newlineIndex = stdoutBuffer.indexOf("\n");
        const line = stdoutBuffer.slice(0, newlineIndex).trim();
        stdoutBuffer = stdoutBuffer.slice(newlineIndex + 1);
        if (!line) continue;
        if (!looksLikeJsonMessage(line)) continue;

        let message;
        try {
          message = JSON.parse(line);
        } catch (error) {
          const detail = `Qwen sidecar returned invalid JSON: ${error.message}`;
          sendRuntimeError(detail);
          updateSnapshot({
            status: "error",
            detail,
            reason: "sidecar-invalid-json",
            ready: false,
            loading: false,
            recoverable: true,
          });
          continue;
        }

        const deferred = pending.get(message.id);
        if (!deferred) continue;
        pending.delete(message.id);
        if (message.ok === false) {
          deferred.reject(makeRuntimeError(message.error || "Qwen sidecar command failed", message.reason || "sidecar-command-failed", message.recoverable !== false));
        } else {
          deferred.resolve(message);
        }
      }
    };

    const handleStderr = (chunk) => {
      const lines = String(chunk)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      const actionableLines = lines.filter((line) => !isBenignSidecarNotice(line));
      if (actionableLines.length === 0) return;
      stderrBuffer = actionableLines[actionableLines.length - 1];
    };

    child.stdout?.on?.("data", handleStdout);
    child.stderr?.on?.("data", handleStderr);
    child.on?.("exit", (code, signal) => {
      const detail = stderrBuffer || `Qwen sidecar exited (code=${code ?? "null"}, signal=${signal ?? "null"})`;
      settlePendingWithExit(detail);
      sidecarState = null;
      updateSnapshot({
        status: "unavailable",
        detail,
        reason: "sidecar-exit",
        ready: false,
        loading: false,
        recoverable: true,
      });
    });
    child.on?.("error", (error) => {
      const detail = `Failed to start Qwen sidecar: ${error.message}`;
      settlePendingWithExit(detail);
      sidecarState = null;
      sendRuntimeError(detail);
      updateSnapshot({
        status: "error",
        detail,
        reason: "sidecar-start-failed",
        ready: false,
        loading: false,
        recoverable: true,
      });
    });

    sidecarState = {
      child,
      config: resolved.config,
      pending,
      voices: [],
    };
  }

  async function shutdownSidecar() {
    if (!sidecarState) return;
    const current = sidecarState;
    sidecarState = null;
    try {
      current.child.stdin?.write?.(`${JSON.stringify({ id: `shutdown-${Date.now()}`, command: "shutdown" })}\n`);
    } catch {
      // Best-effort shutdown only.
    }
    try {
      current.child.stdin?.end?.();
    } catch {
      // Best-effort shutdown only.
    }
    try {
      current.child.kill?.();
    } catch {
      // Best-effort shutdown only.
    }
  }

  async function ensureSidecar(resolved) {
    if (ensureSidecarMatchesConfig(resolved)) return sidecarState;
    if (sidecarState) await shutdownSidecar();

    const child = spawnProcess(
      resolved.config.pythonExe,
      ["-u", "-c", QWEN_SIDECAR_SOURCE],
      {
        cwd: projectRoot,
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env },
      },
    );

    attachSidecarLifecycle(child, resolved);
    await dispatchCommand(sidecarState, "configure", { config: resolved.config });
    return sidecarState;
  }

  function dispatchCommand(activeSidecar, command, payload = {}) {
    const id = `${command}-${randomUUID()}`;
    const deferred = createDeferred();
    const timeoutMs = getRuntimeCommandTimeoutMs(command, activeSidecar.config);
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
      activeSidecar.child.stdin.write(`${JSON.stringify({ id, command, ...payload })}\n`);
    } catch (error) {
      activeSidecar.pending.delete(id);
      throw makeRuntimeError(`Failed to send Qwen ${command} command: ${error.message}`, "sidecar-write-failed", true);
    }
    if (timeoutMs > 0) {
      timeoutHandle = setTimeout(() => {
        if (!activeSidecar.pending.has(id)) return;
        activeSidecar.pending.delete(id);
        const detail = `Qwen ${command} timed out after ${timeoutMs} ms`;
        void resetTimedOutSidecar(detail);
        finalizeReject(makeRuntimeError(detail, `${command}-timeout`, true));
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

  async function getModelStatus() {
    const resolved = await resolveConfig();
    if (!resolved.ok) return resolved.snapshot;

    const startedAt = Date.now();
    try {
      const result = await sendCommand(resolved, "status");
      const statusTimingMs = Math.max(0, Date.now() - startedAt);
      recordTiming("statusTimingMs", statusTimingMs);
      return updateSnapshot({
        status: result.status ?? "ready",
        detail: result.detail ?? "Qwen runtime ready for live narration playback",
        reason: result.reason ?? null,
        ready: result.ready !== false,
        loading: Boolean(result.loading),
        recoverable: Boolean(result.recoverable),
        statusTimingMs,
      });
    } catch (error) {
      const statusTimingMs = Math.max(0, Date.now() - startedAt);
      recordTiming("statusTimingMs", statusTimingMs);
      const detail = error?.message || "Qwen runtime status check failed";
      sendRuntimeError(detail);
      return updateSnapshot({
        status: "error",
        detail,
        reason: error?.reason || "runtime-status-failed",
        ready: false,
        loading: false,
        recoverable: error?.recoverable !== false,
        statusTimingMs,
      });
    }
  }

  async function preload() {
    if (preloadInFlight) return preloadInFlight;

    preloadInFlight = (async () => {
      const startedAt = Date.now();
      const resolved = await resolveConfig();
      if (!resolved.ok) return toErrorResponse(resolved.snapshot, "Qwen unavailable");

      updateSnapshot({
        status: "warming",
        detail: "Checking external Qwen runtime",
        reason: "preload-started",
        ready: false,
        loading: true,
        recoverable: true,
      });

      try {
        const result = await sendCommand(resolved, "warmup");
        const timingMs = Math.max(0, Date.now() - startedAt);
        recordTiming("preloadTimingMs", timingMs);
        updateSnapshot({
          status: result.status ?? "ready",
          detail: result.detail ?? "Qwen runtime ready for live narration playback",
          reason: result.reason ?? null,
          ready: result.ready !== false,
          loading: false,
          recoverable: Boolean(result.recoverable),
          preloadTimingMs: timingMs,
          spikeWarning: getSpikeWarningForTiming(timingMs),
        });
        return {
          success: true,
          timingMs,
          spikeWarningThresholdMs: QWEN_STARTUP_SPIKE_WARNING_MS,
          spikeWarning: getSpikeWarningForTiming(timingMs),
        };
      } catch (error) {
        const timingMs = Math.max(0, Date.now() - startedAt);
        recordTiming("preloadTimingMs", timingMs);
        const snapshot = updateSnapshot({
          status: "error",
          detail: error?.message || "Qwen warm-up failed",
          reason: error?.reason || "warmup-failed",
          ready: false,
          loading: false,
          recoverable: error?.recoverable !== false,
          preloadTimingMs: timingMs,
          timingMs,
          spikeWarning: getSpikeWarningForTiming(timingMs),
        });
        sendRuntimeError(snapshot.detail || "Qwen warm-up failed");
        return toErrorResponse(snapshot, "Qwen unavailable");
      }
    })().finally(() => {
      preloadInFlight = null;
    });

    return preloadInFlight;
  }

  async function listVoices() {
    if (voicesInFlight) return voicesInFlight;

    voicesInFlight = (async () => {
      const status = await getModelStatus();
      if (!status.ready) return [];

      const resolved = await resolveConfig();
      if (!resolved.ok) return [];

      const startedAt = Date.now();
      try {
        const result = await sendCommand(resolved, "list_speakers");
        const speakers = Array.isArray(result.speakers)
          ? result.speakers.map((speaker) => String(speaker)).filter(Boolean)
          : [];
        const voiceListTimingMs = Math.max(0, Date.now() - startedAt);
        recordTiming("voiceListTimingMs", voiceListTimingMs);
        if (sidecarState) sidecarState.voices = speakers;
        updateSnapshot({
          status: "ready",
          detail: "Qwen runtime ready for live narration playback",
          reason: null,
          ready: true,
          loading: false,
          recoverable: false,
          voiceListTimingMs,
        });
        return speakers;
      } catch (error) {
        const voiceListTimingMs = Math.max(0, Date.now() - startedAt);
        recordTiming("voiceListTimingMs", voiceListTimingMs);
        const detail = error?.message || "Qwen speaker listing failed";
        sendRuntimeError(detail);
        updateSnapshot({
          status: "error",
          detail,
          reason: error?.reason || "speaker-list-failed",
          ready: false,
          loading: false,
          recoverable: error?.recoverable !== false,
          voiceListTimingMs,
        });
        return [];
      }
    })().finally(() => {
      voicesInFlight = null;
    });

    return voicesInFlight;
  }

  async function generate(text, speaker, rate, words) {
    const preloadResult = await preload();
    if (preloadResult.error) return preloadResult;

    const resolved = await resolveConfig();
    if (!resolved.ok) return toErrorResponse(resolved.snapshot, "Qwen unavailable");

    await fsModule.mkdir(resolved.requestsDir, { recursive: true });
    const outputPath = pathModule.join(resolved.requestsDir, `${randomUUID()}.wav`);
    const startedAt = Date.now();

    try {
      const result = await sendCommand(resolved, "generate_custom_voice", {
        text,
        speaker,
        rate,
        words,
        outputPath,
      });

      const wavPath = result.outputPath || outputPath;
      const decoded = await decodePcm16Wav(fsModule, wavPath);
      const timingMs = Math.max(0, Date.now() - startedAt);
      recordTiming("generateTimingMs", timingMs);
      updateSnapshot({
        status: "ready",
        detail: "Qwen runtime ready for live narration playback",
        reason: null,
        ready: true,
        loading: false,
        recoverable: false,
        generateTimingMs: timingMs,
        spikeWarning: getSpikeWarningForTiming(timingMs),
      });
      return {
        audio: decoded.audio,
        sampleRate: decoded.sampleRate,
        durationMs: result.durationMs ?? decoded.durationMs,
        wordTimestamps: Array.isArray(result.wordTimestamps) ? result.wordTimestamps : null,
        timingMs,
        spikeWarningThresholdMs: QWEN_STARTUP_SPIKE_WARNING_MS,
        spikeWarning: getSpikeWarningForTiming(timingMs),
      };
    } catch (error) {
      const timingMs = Math.max(0, Date.now() - startedAt);
      recordTiming("generateTimingMs", timingMs);
      const snapshot = updateSnapshot({
        status: "error",
        detail: error?.message || "Qwen generation failed",
        reason: error?.reason || "generation-failed",
        ready: false,
        loading: false,
        recoverable: error?.recoverable !== false,
        generateTimingMs: timingMs,
        timingMs,
        spikeWarning: getSpikeWarningForTiming(timingMs),
      });
      sendRuntimeError(snapshot.detail || "Qwen generation failed");
      return toErrorResponse(snapshot, "Qwen generation failed");
    } finally {
      await removeFileIfPresent(fsModule, outputPath);
    }
  }

  async function preflight() {
    const resolved = await resolveConfig();
    if (!resolved.ok) {
      return buildStaticPreflightReport(resolved.snapshot, {
        configPath: resolved.configPath ?? getConfigPath(),
        config: resolved.config ?? null,
      });
    }

    try {
      const report = createPreflightReport({
        ...(await runPreflightProbe(resolved)),
        configPath: resolved.configPath,
      });
      if (report.status !== "ready") {
        updateSnapshot(snapshotFromPreflightReport(report));
      }
      return report;
    } catch (error) {
      const report = createPreflightReport({
        status: "error",
        reason: error?.reason || "preflight-failed",
        detail: error?.message || "Qwen runtime validation failed.",
        recoverable: error?.recoverable !== false,
        supportedHost: false,
        requestedDevice: resolved.config.device,
        pythonExe: resolved.config.pythonExe,
        modelId: resolved.config.modelId,
        attnImplementation: resolved.config.attnImplementation,
        configPath: resolved.configPath,
        checks: [
          createPreflightCheck("probe", "Runtime validation", "fail", error?.message || "Qwen runtime validation failed."),
        ],
      });
      updateSnapshot(snapshotFromPreflightReport(report));
      return report;
    }
  }

  return {
    getModelStatus,
    preload,
    preflight,
    listVoices,
    generate,
    shutdown: shutdownSidecar,
  };
}

const qwenEngine = createQwenEngineManager();

module.exports = {
  createQwenEngineManager,
  getModelStatus: (...args) => qwenEngine.getModelStatus(...args),
  preload: (...args) => qwenEngine.preload(...args),
  preflight: (...args) => qwenEngine.preflight(...args),
  listVoices: (...args) => qwenEngine.listVoices(...args),
  generate: (...args) => qwenEngine.generate(...args),
  shutdown: (...args) => qwenEngine.shutdown(...args),
};
