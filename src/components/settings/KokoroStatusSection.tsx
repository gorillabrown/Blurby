import type { KokoroPreflightAssetFile, KokoroPreflightReport, KokoroPreflightStatus } from "../../types";

interface KokoroStatusSectionProps {
  kokoroReady: boolean;
  kokoroBusy: boolean;
  kokoroBusyLabel: string;
  kokoroProgress: number;
  kokoroError: string | null;
  kokoroStalled: boolean;
  preflightReport: Partial<KokoroPreflightReport> | null;
  preflightBusy: boolean;
  providerLabel?: string;
  onDownload: () => void;
  onPreflight: () => void;
}

const KOKORO_STATUS_TITLES: Record<KokoroPreflightStatus, string> = {
  ready: "Kokoro ready",
  loading: "Kokoro preparing",
  "missing-assets": "Kokoro assets missing",
  "download-needed": "Kokoro download needed",
  "download-failed": "Kokoro download failed",
  "runtime-error": "Kokoro runtime unavailable",
  "offline-ready": "Kokoro ready offline",
};

function getMissingAssetCopy(report: Partial<KokoroPreflightReport> | null): string | null {
  const missing = report?.model?.missingAssets?.filter(Boolean) ?? [];
  const missingFiles = [
    report?.model?.configAvailable === false ? "config" : null,
    report?.model?.tokenizerAvailable === false ? "tokenizer" : null,
    report?.model?.modelAvailable === false ? "model weights" : null,
    report?.voice?.available === false ? `voice ${report.voice?.defaultVoice || ""}`.trim() : null,
  ].filter(Boolean) as string[];
  const missingFileLabels = new Set(missingFiles.map((asset) => asset.toLowerCase()));

  const allMissing = [...missingFiles, ...missing.filter((asset) => !missingFileLabels.has(asset.toLowerCase()))];
  if (!allMissing.length) return null;
  return `Missing ${allMissing.join(", ")}. Use Download or Retry to restore Kokoro's required local assets.`;
}

function getStatusDetail(
  report: Partial<KokoroPreflightReport> | null,
  kokoroReady: boolean,
  kokoroError: string | null,
): string {
  if (report?.detail) return report.detail;
  if (report?.status === "offline-ready" || report?.offlineReady) {
    return "All required Kokoro assets are present locally, so narration can start without a network connection.";
  }
  if (report?.status === "download-needed") {
    return "Kokoro needs its local model, config, tokenizer, and default voice assets before playback.";
  }
  if (report?.status === "missing-assets") {
    return getMissingAssetCopy(report) ?? "Kokoro is missing one or more required local assets.";
  }
  if (report?.status === "download-failed") {
    return report.download?.lastError || "The last Kokoro asset download did not finish.";
  }
  if (report?.status === "runtime-error") {
    return kokoroError || report?.reason || "Kokoro could not validate its local runtime.";
  }
  if (report?.status === "loading") return "Kokoro is preparing local narration assets.";
  if (kokoroReady) return "Kokoro is ready for preview and reader playback.";
  return "Validate Kokoro before pressing Play to confirm local narration assets are ready.";
}

function getAssetRows(report: Partial<KokoroPreflightReport> | null): KokoroPreflightAssetFile[] {
  const rows: KokoroPreflightAssetFile[] = [];
  if (report?.model) {
    rows.push({
      key: "model",
      label: "Model weights",
      required: true,
      path: report.model.modelDir ?? "",
      available: Boolean(report.model.modelAvailable),
    });
    rows.push({
      key: "config",
      label: "Model config",
      required: true,
      path: report.model.configPath ?? "",
      available: Boolean(report.model.configAvailable),
    });
    rows.push({
      key: "tokenizer",
      label: "Tokenizer",
      required: true,
      path: report.model.modelDir ?? "",
      available: Boolean(report.model.tokenizerAvailable),
    });
  }
  if (report?.voice) {
    rows.push({
      key: "voice",
      label: `Default voice ${report.voice.defaultVoice || ""}`.trim(),
      required: true,
      path: report.voice.assetPath ?? "",
      available: Boolean(report.voice.available),
    });
  }
  return rows;
}

/** Kokoro model download progress / status block shown when Kokoro engine is selected but not yet ready */
export function KokoroStatusSection({
  kokoroReady,
  kokoroBusy,
  kokoroBusyLabel,
  kokoroProgress,
  kokoroError,
  kokoroStalled,
  preflightReport,
  preflightBusy,
  providerLabel = "Kokoro",
  onDownload,
  onPreflight,
}: KokoroStatusSectionProps) {
  const status = preflightReport?.status;
  const title = status ? KOKORO_STATUS_TITLES[status] : kokoroReady ? `${providerLabel} ready` : `${providerLabel} readiness unknown`;
  const cachePath = preflightReport?.model?.cacheLocation || preflightReport?.model?.cacheDir || null;
  const missingAssetCopy = getMissingAssetCopy(preflightReport);
  const offlineReady = status === "offline-ready" || Boolean(preflightReport?.offlineReady);
  const retrySetup =
    !offlineReady &&
    (status === "runtime-error" ||
      status === "download-failed" ||
      Boolean(kokoroError));
  const downloadNeeded =
    !offlineReady &&
    !retrySetup &&
    (preflightReport?.download?.needed ||
      status === "download-needed" ||
      status === "missing-assets" ||
      (!status && !kokoroReady));
  const setupActionLabel = retrySetup
    ? "Retry Kokoro setup (92 MB)"
    : downloadNeeded
      ? "Download voice model (92 MB)"
      : null;
  const assetRows = getAssetRows(preflightReport);
  const checks = preflightReport?.checks?.filter((check) => check.status === "fail" || check.status === "warn") ?? [];
  const checkedAt = preflightReport?.checkedAt ? new Date(preflightReport.checkedAt).toLocaleString() : null;

  return (
    <div className="tts-kokoro-wrapper">
      <div className="tts-status-card tts-kokoro-preflight-card">
        <div className="tts-status-title">{title}</div>
        <div className="tts-status-detail">
          {getStatusDetail(preflightReport, kokoroReady, kokoroError)}
        </div>
        {offlineReady ? (
          <div className="tts-kokoro-success">
            Offline-ready: required Kokoro assets are present in the local cache.
          </div>
        ) : null}
        {missingAssetCopy && (
          <div className="tts-kokoro-warning">{missingAssetCopy}</div>
        )}
        {cachePath && (
          <div className="tts-kokoro-meta">
            <strong>Cache path:</strong> <span>{cachePath}</span>
          </div>
        )}
        {preflightReport?.model && (
          <div className="tts-kokoro-meta">
            <strong>Model:</strong> {preflightReport.model.id || "Kokoro"} ({preflightReport.model.device || "cpu"}, {preflightReport.model.dtype || "dtype unknown"})
          </div>
        )}
        {assetRows.length > 0 && (
          <div className="tts-kokoro-asset-list">
            {assetRows.map((asset) => (
              <div key={asset.key} className={`tts-kokoro-asset tts-kokoro-asset--${asset.available ? "pass" : "fail"}`}>
                <span>{asset.label}</span>
                <span>{asset.available ? "Available" : "Missing"}</span>
              </div>
            ))}
          </div>
        )}
        {checks.length > 0 && (
          <div className="tts-kokoro-check-list">
            {checks.map((check) => (
              <div key={`${check.key}-${check.label}`} className={`tts-kokoro-check tts-kokoro-check--${check.status}`}>
                <div className="tts-kokoro-check-label">{check.label}</div>
                {check.detail && <div className="tts-kokoro-check-detail">{check.detail}</div>}
              </div>
            ))}
          </div>
        )}
        {checkedAt && (
          <div className="tts-kokoro-meta">
            <strong>Last validation:</strong> {checkedAt}
          </div>
        )}
        <div className="tts-kokoro-action-row">
          <button
            className="settings-btn-secondary tts-kokoro-download-btn"
            onClick={onPreflight}
            disabled={preflightBusy}
          >
            {preflightBusy ? "Validating..." : "Validate Kokoro"}
          </button>
          {setupActionLabel && !kokoroBusy && (
            <button
              className="settings-btn-secondary tts-kokoro-download-btn"
              onClick={onDownload}
            >
              {setupActionLabel}
            </button>
          )}
        </div>
      </div>
      {kokoroError && (
        <div className="tts-kokoro-error">
          Kokoro unavailable: {kokoroError}
        </div>
      )}
      {kokoroStalled && !kokoroError && (
        <div className="tts-kokoro-warning">
          Download may be blocked by your network or firewall. Check your connection and try again.
        </div>
      )}
      {kokoroBusy ? (
        <>
          <div className="tts-kokoro-progress-label">
            {kokoroBusyLabel}
          </div>
          <div className="tts-kokoro-progress-track">
            <div className="tts-kokoro-progress-bar" style={{ width: `${kokoroProgress}%` }} />
          </div>
        </>
      ) : null}
    </div>
  );
}
