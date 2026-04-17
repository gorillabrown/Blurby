import type { KokoroErrorResponse, KokoroStatusSnapshot } from "../types";

export const DEFAULT_KOKORO_STATUS_SNAPSHOT: KokoroStatusSnapshot = {
  status: "idle",
  detail: null,
  reason: null,
  ready: false,
  loading: false,
  recoverable: false,
};

export function normalizeKokoroStatusSnapshot(
  snapshot?: Partial<KokoroStatusSnapshot> | null,
): KokoroStatusSnapshot {
  return {
    ...DEFAULT_KOKORO_STATUS_SNAPSHOT,
    ...snapshot,
    detail: snapshot?.detail ?? null,
    reason: snapshot?.reason ?? null,
    ready: Boolean(snapshot?.ready),
    loading: Boolean(snapshot?.loading),
    recoverable: Boolean(snapshot?.recoverable),
  };
}

export function getKokoroStatusError(
  snapshot: KokoroStatusSnapshot,
): string | null {
  if (snapshot.status !== "error") return null;
  return snapshot.detail || snapshot.reason || "Kokoro unavailable";
}

export function snapshotFromKokoroErrorResponse(
  result: Partial<KokoroErrorResponse>,
  fallbackDetail = "Kokoro unavailable",
): KokoroStatusSnapshot {
  const status = result.status ?? "error";
  return normalizeKokoroStatusSnapshot({
    status,
    detail: result.error ?? fallbackDetail,
    reason: result.reason ?? null,
    ready: false,
    loading: status === "warming" || status === "retrying",
    recoverable: result.recoverable ?? false,
  });
}

export function snapshotFromLegacyKokoroDownloadError(
  currentSnapshot: Partial<KokoroStatusSnapshot> | null | undefined,
  error: string,
): KokoroStatusSnapshot {
  const current = normalizeKokoroStatusSnapshot(currentSnapshot);

  if (current.status === "error") {
    return normalizeKokoroStatusSnapshot({
      ...current,
      detail: current.detail ?? error,
    });
  }

  return normalizeKokoroStatusSnapshot({
    status: "error",
    detail: error,
    ready: false,
    loading: false,
    recoverable: false,
  });
}
