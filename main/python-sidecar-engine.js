"use strict";
// main/python-sidecar-engine.js - shared sidecar engine for the MOSS Nano and Pocket TTS providers.
// Provider shape: { label, visibleConfigKeys, requestIdPrefix, defaultConfig, createDefaultAdapter }.

const { randomUUID } = require("crypto");

function createConfigSnapshot(config, keys) {
  const snapshot = {};
  for (const key of keys) snapshot[key] = config[key] ?? null;
  return snapshot;
}

function normalizeStatus(status, config, keys, fallback = {}) {
  const next = {
    ok: Boolean(status?.ok),
    status: status?.status ?? fallback.status ?? "unavailable",
    reason: status?.reason ?? fallback.reason ?? null,
    detail: status?.detail ?? fallback.detail ?? null,
    ready: Boolean(status?.ready),
    loading: Boolean(status?.loading),
    recoverable:
      typeof status?.recoverable === "boolean"
        ? status.recoverable
        : typeof fallback.recoverable === "boolean"
        ? fallback.recoverable
        : true,
    config: createConfigSnapshot(config, keys),
    runtime: status?.runtime ?? fallback.runtime ?? null,
    metadata: status?.metadata ?? fallback.metadata ?? null,
    syntheticAudio: status?.syntheticAudio,
  };
  return next;
}

function structuredFailure(reason, detail, extra = {}) {
  return {
    ok: false,
    status: "failed",
    reason,
    detail,
    recoverable: true,
    ...extra,
  };
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

function createPythonSidecarEngine(provider, options = {}) {
  const keys = provider.visibleConfigKeys;
  const config = { ...provider.defaultConfig, ...(options.config ?? {}) };
  const sidecarAdapter = options.sidecarAdapter ?? provider.createDefaultAdapter();
  const createRequestId = options.createRequestId ?? (() => `${provider.requestIdPrefix}${randomUUID()}`);
  const createOwnerToken = options.createOwnerToken ?? (() => `owner-${randomUUID()}`);
  const now = options.now ?? (() => Date.now());

  let started = false;
  let startPromise = null;
  let lifecycleGeneration = 0;
  let snapshot = normalizeStatus(null, config, keys, {
    status: "unavailable",
    reason: "sidecar-not-started",
    detail: `${provider.label} sidecar has not been started.`,
    ready: false,
    loading: false,
    recoverable: true,
  });
  const inFlight = new Map();

  async function ensureStarted() {
    if (started) return snapshot;
    if (!startPromise) {
      const startGeneration = lifecycleGeneration;
      startPromise = Promise.resolve(sidecarAdapter.start(config))
        .then((result) => {
          if (startGeneration !== lifecycleGeneration) return snapshot;
          started = Boolean(result?.ready || result?.ok);
          snapshot = normalizeStatus(result, config, keys, {
            status: started ? "ready" : "unavailable",
            reason: started ? null : "sidecar-not-ready",
            recoverable: true,
          });
          return snapshot;
        })
        .catch((error) => {
          if (startGeneration !== lifecycleGeneration) return snapshot;
          started = false;
          snapshot = normalizeStatus(null, config, keys, {
            status: "unavailable",
            reason: error?.reason || "sidecar-start-failed",
            detail: error?.message || `${provider.label} sidecar failed to start.`,
            ready: false,
            loading: false,
            recoverable: error?.recoverable !== false,
          });
          return snapshot;
        })
        .finally(() => {
          if (startGeneration === lifecycleGeneration) {
            startPromise = null;
          }
        });
    }
    return startPromise;
  }

  function settleRequest(current, reason, detail) {
    if (!current || current.settled) return null;
    current.settled = true;
    inFlight.delete(current.requestId);
    const failure = structuredFailure(reason, detail, {
      requestId: current.requestId,
      ownerToken: current.ownerToken,
      recoverable: true,
    });
    current.resolve(failure);
    return failure;
  }

  function settleAllInFlight(reason, detail) {
    for (const current of Array.from(inFlight.values())) {
      settleRequest(current, reason, detail);
    }
  }

  async function status() {
    if (!started) {
      await ensureStarted();
      if (!started) return { ...snapshot, config: createConfigSnapshot(config, keys) };
    }

    const result = await sidecarAdapter.status();
    snapshot = normalizeStatus(result, config, keys, {
      status: result?.ready ? "ready" : "unavailable",
      reason: result?.ready ? null : "sidecar-not-ready",
      recoverable: true,
    });
    return snapshot;
  }

  async function synthesize(payload = {}) {
    if (inFlight.size >= config.maxInFlight) {
      return structuredFailure("too-many-in-flight", `${provider.label} already has the maximum number of requests in flight.`, {
        recoverable: true,
      });
    }

    const requestId = createRequestId();
    const ownerToken = createOwnerToken();
    const startedAt = now();
    const requestPayload = { ...payload, requestId, ownerToken };
    const deferred = createDeferred();
    const requestGeneration = lifecycleGeneration;
    const ownedRequest = { requestId, ownerToken, startedAt, resolve: deferred.resolve, settled: false, generation: requestGeneration };
    inFlight.set(requestId, ownedRequest);

    Promise.resolve()
      .then(() => ensureStarted())
      .then((startStatus) => {
        const current = inFlight.get(requestId);
        if (!current || current.ownerToken !== ownerToken || current.generation !== requestGeneration || requestGeneration !== lifecycleGeneration) {
          deferred.resolve(
            structuredFailure("request-not-owned", `${provider.label} request no longer belongs to the active sidecar lifecycle.`, {
              requestId,
              ownerToken,
              recoverable: true,
            }),
          );
          return null;
        }

        if (!startStatus?.ready && !startStatus?.ok) {
          settleRequest(
            current,
            startStatus?.reason || "sidecar-not-ready",
            startStatus?.detail || `${provider.label} sidecar was not ready for synthesis.`,
          );
          return null;
        }

        return sidecarAdapter.request("synthesize", requestPayload);
      })
      .then((result) => {
        if (!result) return;
        const current = inFlight.get(requestId);
        if (!current || current.ownerToken !== ownerToken || current.generation !== requestGeneration || requestGeneration !== lifecycleGeneration) {
          deferred.resolve(
            structuredFailure("request-not-owned", `${provider.label} response did not belong to the active request.`, {
              requestId,
              ownerToken,
              recoverable: true,
            }),
          );
          return;
        }

        if (result?.requestId !== requestId || result?.ownerToken !== ownerToken) {
          settleRequest(
            current,
            "stale-sidecar-output",
            `${provider.label} sidecar output did not match the active request owner.`,
          );
          return;
        }

        current.settled = true;
        inFlight.delete(requestId);
        deferred.resolve(result);
      })
      .catch((error) => {
        const current = inFlight.get(requestId);
        if (current && current.ownerToken === ownerToken) {
          settleRequest(current, error?.reason || "sidecar-request-failed", error?.message || `${provider.label} synthesize failed.`);
        }
      });

    return deferred.promise;
  }

  async function cancel(requestId) {
    const current = inFlight.get(requestId);
    if (!current) {
      return {
        ok: false,
        cancelled: false,
        reason: "request-not-found",
        requestId,
        recoverable: true,
      };
    }

    const cancelPayload = {
      requestId: current.requestId,
      ownerToken: current.ownerToken,
    };
    settleRequest(current, "cancelled", `${provider.label} synthesize request was cancelled.`);

    try {
      const result = await sidecarAdapter.cancel(cancelPayload);
      return {
        ...result,
        requestId: current.requestId,
      };
    } catch (error) {
      return structuredFailure(error?.reason || "sidecar-cancel-failed", error?.message || `${provider.label} cancel failed.`, {
        requestId: current.requestId,
        ownerToken: current.ownerToken,
        cancelled: true,
        recoverable: true,
      });
    }
  }

  async function shutdown() {
    lifecycleGeneration += 1;
    startPromise = null;
    settleAllInFlight("sidecar-shutdown", `${provider.label} sidecar was shut down before synthesis completed.`);
    const result = await sidecarAdapter.shutdown();
    started = false;
    snapshot = normalizeStatus(result, config, keys, {
      status: "shutdown",
      reason: null,
      ready: false,
      loading: false,
      recoverable: true,
    });
    snapshot.ready = false;
    return snapshot;
  }

  async function restart() {
    lifecycleGeneration += 1;
    startPromise = null;
    settleAllInFlight("sidecar-restarted", `${provider.label} sidecar was restarted before synthesis completed.`);
    const result = await sidecarAdapter.restart(config);
    started = Boolean(result?.ready || result?.ok);
    snapshot = normalizeStatus(result, config, keys, {
      status: started ? "ready" : "unavailable",
      reason: started ? null : "sidecar-not-ready",
      ready: started,
      loading: false,
      recoverable: true,
    });
    return snapshot;
  }

  return {
    status,
    synthesize,
    cancel,
    shutdown,
    restart,
  };
}

module.exports = { createPythonSidecarEngine };
