"use strict";
// main/moss-nano-sidecar.js - protocol adapter placeholder for a future Nano sidecar.

function unavailableStatus(config) {
  return {
    ok: false,
    status: "unavailable",
    reason: "sidecar-adapter-not-configured",
    detail: "MOSS Nano sidecar adapter is not configured for this build.",
    ready: false,
    loading: false,
    recoverable: true,
    config,
  };
}

function createMossNanoSidecarAdapter() {
  let lastConfig = null;

  return {
    async start(config) {
      lastConfig = config;
      return unavailableStatus(config);
    },

    async status() {
      return unavailableStatus(lastConfig);
    },

    async request(_command, payload) {
      return {
        ok: false,
        status: "failed",
        reason: "sidecar-adapter-not-configured",
        detail: "MOSS Nano sidecar adapter is not configured for this build.",
        requestId: payload?.requestId ?? null,
        ownerToken: payload?.ownerToken ?? null,
        recoverable: true,
      };
    },

    async cancel(payload) {
      return {
        ok: false,
        cancelled: false,
        reason: "sidecar-adapter-not-configured",
        requestId: payload?.requestId ?? null,
        recoverable: true,
      };
    },

    async shutdown() {
      return { ok: true, status: "shutdown", ready: false };
    },

    async restart(config) {
      lastConfig = config;
      return unavailableStatus(config);
    },
  };
}

module.exports = {
  createMossNanoSidecarAdapter,
};
