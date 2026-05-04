import { useEffect, useState } from "react";
import type { PocketTtsErrorResponse, PocketTtsStatusSnapshot } from "../../types";

const DEFAULT_POCKET_STATUS_SNAPSHOT: PocketTtsStatusSnapshot = {
  ok: false,
  status: "unavailable",
  detail: "Pocket sidecar API is unavailable.",
  reason: "sidecar-api-unavailable",
  ready: false,
  loading: false,
  recoverable: true,
};

function normalizePocketStatusSnapshot(
  snapshot?: Partial<PocketTtsStatusSnapshot> | PocketTtsErrorResponse | null,
): PocketTtsStatusSnapshot {
  if (!snapshot) return DEFAULT_POCKET_STATUS_SNAPSHOT;
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
    ...DEFAULT_POCKET_STATUS_SNAPSHOT,
    ...snapshot,
    ok: snapshot.ok ?? snapshot.ready === true,
    status: snapshot.status ?? "unavailable",
    detail: snapshot.detail ?? null,
    reason: snapshot.reason ?? null,
    ready: Boolean(snapshot.ready),
    loading: Boolean(snapshot.loading),
    recoverable: snapshot.recoverable ?? true,
  };
}

export function usePocketTtsSettingsStatus() {
  const api = window.electronAPI;
  const [pocketStatus, setPocketStatus] = useState<PocketTtsStatusSnapshot>(DEFAULT_POCKET_STATUS_SNAPSHOT);
  const pocketApiAvailable = Boolean(api?.pocketStatus && api?.pocketSynthesize);
  const pocketReady = pocketApiAvailable && pocketStatus.ready && pocketStatus.status === "ready";
  const pocketSelectable = pocketApiAvailable;
  const pocketLoading = pocketStatus.loading || pocketStatus.status === "loading";
  const pocketStatusTitle = pocketReady
    ? "Pocket runtime ready"
    : pocketLoading
      ? "Pocket runtime starting"
      : "Pocket runtime blocked";
  const pocketStatusDetail = pocketApiAvailable
    ? pocketStatus.detail || pocketStatus.reason || "Pocket preview becomes available only after the sidecar reports ready."
    : "Pocket sidecar API is unavailable.";

  useEffect(() => {
    if (!api?.pocketStatus) {
      setPocketStatus(DEFAULT_POCKET_STATUS_SNAPSHOT);
      return;
    }
    api.pocketStatus()
      .then((result) => setPocketStatus(normalizePocketStatusSnapshot(result)))
      .catch((error) => setPocketStatus(normalizePocketStatusSnapshot({
        ok: false,
        error: error instanceof Error ? error.message : "Pocket status check failed",
        status: "failed",
        reason: "status-check-failed",
        recoverable: true,
      })));
  }, [api]);

  return {
    pocketApiAvailable,
    pocketSelectable,
    pocketReady,
    pocketStatusTitle,
    pocketStatusDetail,
  };
}
