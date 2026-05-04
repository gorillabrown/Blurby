"use strict";
// main/pocket-tts-sidecar.js - resident JSON-lines adapter for the Pocket TTS Python sidecar.

const path = require("path");
const { spawn: defaultSpawn, spawnSync } = require("child_process");

const DEFAULT_BRIDGE_PATH = path.resolve(__dirname, "..", "scripts", "pocket_tts_sidecar.py");

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function unavailableStatus(config, reason, detail, extra = {}) {
  return {
    ok: false,
    status: "unavailable",
    reason,
    detail,
    ready: false,
    loading: false,
    recoverable: true,
    config,
    ...extra,
  };
}

function readyStatus(config, message = {}) {
  return {
    ok: message.ok !== false,
    status: message.status ?? "ready",
    reason: message.reason ?? null,
    detail: message.detail ?? null,
    ready: message.ready !== false,
    loading: false,
    recoverable: message.recoverable ?? false,
    config,
    runtime: message.runtime ?? null,
    metadata: message.metadata ?? null,
    syntheticAudio: message.syntheticAudio,
  };
}

function failureResponse(reason, detail, extra = {}) {
  return {
    ok: false,
    status: "failed",
    reason,
    detail,
    recoverable: true,
    ...extra,
  };
}

function createPocketTtsSidecarAdapter(options = {}) {
  const spawn = options.spawn ?? defaultSpawn;
  const bridgePath = options.bridgePath ?? DEFAULT_BRIDGE_PATH;

  let child = null;
  let buffer = "";
  let lastConfig = null;
  let lastStatus = unavailableStatus(null, "sidecar-not-started", "Pocket TTS sidecar has not been started.");
  let startDeferred = null;
  let startTimer = null;
  let shuttingDown = false;
  let nextControlId = 0;
  const pending = new Map();

  function mockMode() {
    return Boolean(lastConfig?.mock);
  }

  function commandTimeoutMs() {
    return Number(lastConfig?.commandTimeoutMs) > 0 ? Number(lastConfig.commandTimeoutMs) : 5000;
  }

  function synthesizeTimeoutMs() {
    return Number(lastConfig?.synthesizeTimeoutMs) > 0 ? Number(lastConfig.synthesizeTimeoutMs) : 120000;
  }

  function clearStartTimer() {
    if (startTimer) {
      clearTimeout(startTimer);
      startTimer = null;
    }
  }

  function settlePending(key, result) {
    const current = pending.get(key);
    if (!current) return false;
    for (const [pendingKey, pendingValue] of pending.entries()) {
      if (pendingValue === current) pending.delete(pendingKey);
    }
    clearTimeout(current.timer);
    current.resolve(result);
    return true;
  }

  function rejectAll(reason, detail) {
    for (const [key, current] of pending.entries()) {
      pending.delete(key);
      clearTimeout(current.timer);
      current.resolve(failureResponse(reason, detail, {
        requestId: current.requestId ?? null,
        ownerToken: current.ownerToken ?? null,
      }));
    }
  }

  function writeCommand(payload) {
    if (!child || !child.stdin || child.killed || (child.exitCode !== undefined && child.exitCode !== null)) {
      return false;
    }
    child.stdin.write(`${JSON.stringify(payload)}\n`);
    return true;
  }

  function spawnArgs(config) {
    const args = [bridgePath];
    if (config?.runtimeDir) args.push("--runtime-dir", config.runtimeDir);
    if (config?.modelDir) args.push("--model-dir", config.modelDir);
    if (config?.outputDir) args.push("--output-dir", config.outputDir);
    if (config?.referenceWavPath) args.push("--reference-wav", config.referenceWavPath);
    if (config?.mock) args.push("--mock");
    return args;
  }

  function handleMessage(message) {
    if (!message || typeof message !== "object") return;

    if (message.type === "ready") {
      lastStatus = message.ready === false || message.ok === false
        ? unavailableStatus(lastConfig, message.reason ?? "sidecar-not-ready", message.detail ?? "Pocket TTS sidecar is not ready.", {
            recoverable: message.recoverable ?? true,
          })
        : readyStatus(lastConfig, message);
      if (startDeferred) {
        const deferred = startDeferred;
        startDeferred = null;
        clearStartTimer();
        deferred.resolve(lastStatus);
      }
      return;
    }

    if (message.type === "status") {
      lastStatus = message.ready || message.ok
        ? readyStatus(lastConfig, message)
        : unavailableStatus(lastConfig, message.reason ?? "sidecar-not-ready", message.detail ?? "Pocket TTS sidecar is not ready.");
      if (message.controlId) settlePending(`control:${message.controlId}`, lastStatus);
      return;
    }

    if (message.type === "cancelled") {
      const key = message.controlId ? `control:${message.controlId}` : `cancel:${message.requestId}`;
      const result = {
        ok: message.ok !== false,
        cancelled: message.cancelled !== false,
        requestId: message.requestId ?? null,
        ownerToken: message.ownerToken ?? null,
        reason: message.reason ?? null,
        recoverable: message.recoverable ?? true,
      };
      if (!settlePending(key, result) && message.requestId) {
        for (const [pendingKey, current] of pending.entries()) {
          if (current.requestId === message.requestId) {
            settlePending(pendingKey, result);
            break;
          }
        }
      }
      return;
    }

    if (message.type === "result" || message.type === "error") {
      const result = message.type === "error"
        ? failureResponse(message.reason ?? "sidecar-request-failed", message.detail ?? message.error ?? "Pocket TTS request failed.", {
            requestId: message.requestId ?? null,
            ownerToken: message.ownerToken ?? null,
          })
        : { ...message, type: undefined };
      if (message.type === "result" && !mockMode() && result?.syntheticAudio !== false) {
        settlePending(`request:${message.requestId}`, failureResponse(
          "synthetic-audio-forbidden",
          "Pocket TTS real sidecar mode rejected synthetic or unclassified audio output.",
          {
            requestId: message.requestId ?? null,
            ownerToken: message.ownerToken ?? null,
          },
        ));
        return;
      }
      settlePending(`request:${message.requestId}`, result);
    }
  }

  function handleStdout(chunk) {
    buffer += chunk.toString("utf8");
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        handleMessage(JSON.parse(line));
      } catch (error) {
        lastStatus = unavailableStatus(lastConfig, "sidecar-protocol-error", `Pocket TTS sidecar emitted invalid JSON: ${error.message}`);
      }
    }
  }

  function startProcess(config) {
    const pythonExe = config?.pythonExe || process.env.POCKET_TTS_PYTHON || (process.platform === "win32" ? "python" : "python3");
    child = spawn(pythonExe, spawnArgs(config), {
      cwd: path.resolve(__dirname, ".."),
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });
    buffer = "";
    shuttingDown = false;
    lastStatus = {
      ok: false,
      status: "loading",
      reason: null,
      detail: "Pocket TTS sidecar is starting.",
      ready: false,
      loading: true,
      recoverable: true,
      config,
    };

    child.stdout?.on("data", handleStdout);
    child.stderr?.on("data", (chunk) => {
      const text = chunk.toString("utf8").trim();
      if (text) lastStatus = { ...lastStatus, detail: text.slice(-500) };
    });
    child.on("error", (error) => {
      const status = unavailableStatus(lastConfig, error.code || "sidecar-spawn-failed", error.message || "Pocket TTS sidecar failed to spawn.");
      lastStatus = status;
      if (startDeferred) {
        const deferred = startDeferred;
        startDeferred = null;
        clearStartTimer();
        deferred.resolve(status);
      }
      rejectAll("sidecar-exited", status.detail);
    });
    child.on("exit", (code, signal) => {
      const status = shuttingDown
        ? unavailableStatus(lastConfig, "sidecar-shutdown", "Pocket TTS sidecar was shut down.", { status: "shutdown", recoverable: true })
        : unavailableStatus(lastConfig, "sidecar-exited", `Pocket TTS sidecar exited with code ${code ?? "unknown"}${signal ? ` and signal ${signal}` : ""}.`);
      lastStatus = { ...status, ready: false, loading: false };
      child = null;
      if (startDeferred) {
        const deferred = startDeferred;
        startDeferred = null;
        clearStartTimer();
        deferred.resolve(lastStatus);
      }
      rejectAll(lastStatus.reason, lastStatus.detail);
    });
  }

  function terminateChild() {
    if (!child) return;
    const target = child;
    child = null;
    try {
      target.stdin?.destroy?.();
      target.stdout?.destroy?.();
      target.stderr?.destroy?.();
    } catch {}
    if (process.platform === "win32" && target.pid) {
      try {
        spawnSync("taskkill", ["/PID", String(target.pid), "/T", "/F"], {
          stdio: "ignore",
          windowsHide: true,
        });
      } catch {}
    }
    target.kill?.();
  }

  function queueRequest(key, payload, timeoutMs) {
    const deferred = createDeferred();
    const timer = setTimeout(() => {
      pending.delete(key);
      deferred.resolve(failureResponse("sidecar-timeout", "Pocket TTS sidecar did not respond before the timeout.", {
        requestId: payload.requestId ?? null,
        ownerToken: payload.ownerToken ?? null,
      }));
    }, timeoutMs);
    pending.set(key, {
      ...deferred,
      timer,
      requestId: payload.requestId ?? null,
      ownerToken: payload.ownerToken ?? null,
    });
    return deferred.promise;
  }

  return {
    async start(config) {
      lastConfig = config;
      if (child && lastStatus.ready) return lastStatus;
      if (startDeferred) return startDeferred.promise;

      startDeferred = createDeferred();
      startProcess(config);
      startTimer = setTimeout(() => {
        if (!startDeferred) return;
        const deferred = startDeferred;
        startDeferred = null;
        lastStatus = unavailableStatus(lastConfig, "sidecar-start-timeout", "Pocket TTS sidecar did not report ready before the startup timeout.");
        terminateChild();
        deferred.resolve(lastStatus);
      }, commandTimeoutMs());
      return startDeferred.promise;
    },

    async status() {
      return lastStatus;
    },

    async request(command, payload) {
      if (!child || !lastStatus.ready) {
        return failureResponse("sidecar-not-ready", "Pocket TTS sidecar is not ready.", {
          requestId: payload?.requestId ?? null,
          ownerToken: payload?.ownerToken ?? null,
        });
      }

      const key = `request:${payload?.requestId}`;
      const promise = queueRequest(key, payload ?? {}, command === "synthesize" ? synthesizeTimeoutMs() : commandTimeoutMs());
      if (!writeCommand({ command, ...payload })) {
        settlePending(key, failureResponse("sidecar-not-ready", "Pocket TTS sidecar is not ready.", {
          requestId: payload?.requestId ?? null,
          ownerToken: payload?.ownerToken ?? null,
        }));
      }
      return promise;
    },

    async cancel(payload) {
      if (!child) {
        return {
          ok: false,
          cancelled: false,
          reason: "sidecar-not-ready",
          requestId: payload?.requestId ?? null,
          recoverable: true,
        };
      }

      const controlId = `cancel-${++nextControlId}`;
      const key = `control:${controlId}`;
      const promise = queueRequest(key, { ...payload, controlId }, commandTimeoutMs());
      if (!writeCommand({ command: "cancel", controlId, ...payload })) {
        settlePending(key, {
          ok: false,
          cancelled: false,
          reason: "sidecar-not-ready",
          requestId: payload?.requestId ?? null,
          recoverable: true,
        });
      }
      return promise;
    },

    async shutdown() {
      shuttingDown = true;
      if (child) {
        writeCommand({ command: "shutdown", controlId: `shutdown-${++nextControlId}` });
        child.stdin?.end?.();
        terminateChild();
      }
      rejectAll("sidecar-shutdown", "Pocket TTS sidecar was shut down.");
      lastStatus = unavailableStatus(lastConfig, "sidecar-shutdown", "Pocket TTS sidecar was shut down.", {
        ok: true,
        status: "shutdown",
        ready: false,
      });
      child = null;
      return lastStatus;
    },

    async restart(config) {
      await this.shutdown();
      return this.start(config ?? lastConfig);
    },
  };
}

module.exports = {
  createPocketTtsSidecarAdapter,
};
