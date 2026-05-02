import { useEffect, useState } from "react";
import type { MossNanoErrorResponse, MossNanoStatusSnapshot } from "../../types";

const DEFAULT_NANO_STATUS_SNAPSHOT: MossNanoStatusSnapshot = {
  ok: false,
  status: "unavailable",
  detail: "Nano sidecar API is unavailable.",
  reason: "sidecar-api-unavailable",
  ready: false,
  loading: false,
  recoverable: true,
};

function normalizeNanoStatusSnapshot(
  snapshot?: Partial<MossNanoStatusSnapshot> | MossNanoErrorResponse | null,
): MossNanoStatusSnapshot {
  if (!snapshot) return DEFAULT_NANO_STATUS_SNAPSHOT;
  if ("error" in snapshot) {
    return {
      ok: false,
      status: snapshot.status ?? "failed",
      detail: snapshot.error,
      reason: snapshot.reason ?? null,
      ready: false,
      loading: false,
      recoverable: snapshot.recoverable ?? true,
    };
  }
  return {
    ...DEFAULT_NANO_STATUS_SNAPSHOT,
    ...snapshot,
    ok: snapshot.ok ?? snapshot.ready === true,
    status: snapshot.status ?? "unavailable",
    detail: snapshot.detail ?? null,
    reason: snapshot.reason ?? null,
    ready: Boolean(snapshot.ready),
    loading: Boolean(snapshot.loading),
    recoverable: Boolean(snapshot.recoverable),
  };
}

export function useMossNanoSettingsStatus() {
  const api = window.electronAPI;
  const [nanoStatus, setNanoStatus] = useState<MossNanoStatusSnapshot>(DEFAULT_NANO_STATUS_SNAPSHOT);
  const nanoApiAvailable = Boolean(api?.nanoStatus && api?.nanoSynthesize);
  const nanoReady = nanoApiAvailable && nanoStatus.ready && nanoStatus.status === "ready";
  const nanoLoading = nanoStatus.loading || nanoStatus.status === "loading";
  const nanoStatusTitle = nanoReady
    ? "Nano runtime ready"
    : nanoLoading
      ? "Nano runtime starting"
      : "Nano runtime blocked";
  const nanoStatusDetail = nanoApiAvailable
    ? nanoStatus.detail || nanoStatus.reason || "Nano preview becomes available only after the sidecar reports ready."
    : "Nano sidecar API is unavailable.";

  useEffect(() => {
    if (!api?.nanoStatus) {
      setNanoStatus(DEFAULT_NANO_STATUS_SNAPSHOT);
      return;
    }
    api.nanoStatus()
      .then((result) => setNanoStatus(normalizeNanoStatusSnapshot(result)))
      .catch((error) => setNanoStatus(normalizeNanoStatusSnapshot({
        ok: false,
        error: error instanceof Error ? error.message : "Nano status check failed",
        status: "failed",
        reason: "status-check-failed",
        recoverable: true,
      })));
  }, [api]);

  return {
    nanoReady,
    nanoStatusTitle,
    nanoStatusDetail,
  };
}
