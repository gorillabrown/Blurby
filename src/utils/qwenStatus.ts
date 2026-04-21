import type { QwenErrorResponse, QwenPreflightReport, QwenStatusSnapshot } from "../types";

export const DEFAULT_QWEN_STATUS_SNAPSHOT: QwenStatusSnapshot = {
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
  spikeWarningThresholdMs: null,
  spikeWarning: false,
};

export function normalizeQwenStatusSnapshot(
  snapshot?: Partial<QwenStatusSnapshot> | null,
): QwenStatusSnapshot {
  return {
    ...DEFAULT_QWEN_STATUS_SNAPSHOT,
    ...snapshot,
    detail: snapshot?.detail ?? null,
    reason: snapshot?.reason ?? null,
    ready: Boolean(snapshot?.ready),
    loading: Boolean(snapshot?.loading),
    recoverable: Boolean(snapshot?.recoverable),
    statusTimingMs: Number.isFinite(snapshot?.statusTimingMs) ? snapshot.statusTimingMs ?? null : null,
    preloadTimingMs: Number.isFinite(snapshot?.preloadTimingMs) ? snapshot.preloadTimingMs ?? null : null,
    voiceListTimingMs: Number.isFinite(snapshot?.voiceListTimingMs) ? snapshot.voiceListTimingMs ?? null : null,
    generateTimingMs: Number.isFinite(snapshot?.generateTimingMs) ? snapshot.generateTimingMs ?? null : null,
    spikeWarningThresholdMs: Number.isFinite(snapshot?.spikeWarningThresholdMs) ? snapshot.spikeWarningThresholdMs ?? null : null,
    spikeWarning: Boolean(snapshot?.spikeWarning),
  };
}

export function getQwenStatusError(
  snapshot: QwenStatusSnapshot,
): string | null {
  if (snapshot.status !== "error" && snapshot.status !== "unavailable") return null;
  return snapshot.detail || snapshot.reason || "Qwen unavailable";
}

export function snapshotFromQwenErrorResponse(
  result: Partial<QwenErrorResponse>,
  fallbackDetail = "Qwen unavailable",
): QwenStatusSnapshot {
  const status = result.status ?? "error";
  const reason = result.reason ?? null;
  const timingSnapshot =
    Number.isFinite(result.timingMs)
      ? String(reason || "").includes("speaker-list")
        ? { voiceListTimingMs: result.timingMs ?? null }
        : String(reason || "").includes("generate")
          ? { generateTimingMs: result.timingMs ?? null }
          : { preloadTimingMs: result.timingMs ?? null }
      : {};
  return normalizeQwenStatusSnapshot({
    status,
    detail: result.error ?? fallbackDetail,
    reason,
    ready: false,
    loading: status === "warming",
    recoverable: result.recoverable ?? true,
    ...timingSnapshot,
    spikeWarningThresholdMs: Number.isFinite(result.spikeWarningThresholdMs) ? result.spikeWarningThresholdMs ?? null : null,
    spikeWarning: Boolean(result.spikeWarning),
  });
}

export function normalizeQwenPreflightReport(
  report?: Partial<QwenPreflightReport> | null,
): QwenPreflightReport {
  return {
    status: report?.status ?? "error",
    reason: report?.reason ?? null,
    detail: report?.detail ?? "Qwen runtime validation failed.",
    recoverable: typeof report?.recoverable === "boolean" ? report.recoverable : true,
    supportedHost: Boolean(report?.supportedHost),
    requestedDevice: report?.requestedDevice ?? null,
    pythonExe: report?.pythonExe ?? null,
    modelId: report?.modelId ?? null,
    attnImplementation: report?.attnImplementation ?? null,
    configPath: report?.configPath ?? null,
    checkedAt: report?.checkedAt ?? new Date().toISOString(),
    checks: Array.isArray(report?.checks)
      ? report.checks.map((check) => ({
        key: String(check?.key ?? "unknown"),
        label: String(check?.label ?? check?.key ?? "Unknown check"),
        status: ["pass", "fail", "warn", "skip"].includes(String(check?.status))
          ? check.status!
          : "fail",
        detail: String(check?.detail ?? ""),
      }))
      : [],
  };
}

export function snapshotFromQwenPreflightReport(
  reportLike?: Partial<QwenPreflightReport> | null,
): QwenStatusSnapshot {
  const report = normalizeQwenPreflightReport(reportLike);
  if (report.status === "ready") {
    return normalizeQwenStatusSnapshot(DEFAULT_QWEN_STATUS_SNAPSHOT);
  }
  return normalizeQwenStatusSnapshot({
    status: report.status,
    detail: report.detail,
    reason: report.reason,
    ready: false,
    loading: false,
    recoverable: report.recoverable,
  });
}
