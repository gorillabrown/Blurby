import { useCallback, useEffect, useRef, useState } from "react";
import type { KokoroErrorResponse, KokoroPreflightReport, KokoroStatusSnapshot } from "../../types";
import {
  DEFAULT_KOKORO_STATUS_SNAPSHOT,
  getKokoroStatusError,
  normalizeKokoroStatusSnapshot,
  snapshotFromKokoroErrorResponse,
  snapshotFromLegacyKokoroDownloadError,
} from "../../utils/kokoroStatus";

const api = window.electronAPI;

function isKokoroPreflightReport(
  report: KokoroPreflightReport | Partial<KokoroErrorResponse>,
): report is KokoroPreflightReport {
  return "model" in report || "voice" in report || "download" in report || "offlineReady" in report;
}

export function useKokoroSettingsStatus(engine: string) {
  const [kokoroStatus, setKokoroStatus] = useState<KokoroStatusSnapshot>(DEFAULT_KOKORO_STATUS_SNAPSHOT);
  const [kokoroDownloading, setKokoroDownloading] = useState(false);
  const [kokoroProgress, setKokoroProgress] = useState(0);
  const [kokoroVoices, setKokoroVoices] = useState<string[]>([]);
  const [kokoroError, setKokoroError] = useState<string | null>(null);
  const [kokoroStalled, setKokoroStalled] = useState(false);
  const [kokoroPreflightReport, setKokoroPreflightReport] = useState<Partial<KokoroPreflightReport> | null>(null);
  const [kokoroPreflightBusy, setKokoroPreflightBusy] = useState(false);
  const kokoroStatusRef = useRef<KokoroStatusSnapshot>(DEFAULT_KOKORO_STATUS_SNAPSHOT);
  const kokoroPreflightRequestIdRef = useRef(0);

  const kokoroReady = kokoroStatus.ready;
  const kokoroWarming = kokoroStatus.status === "warming" || kokoroStatus.status === "retrying";
  const kokoroBusy = kokoroDownloading || kokoroStatus.loading;
  const kokoroBusyLabel = kokoroDownloading
    ? `Downloading voice model... ${kokoroProgress}%`
    : kokoroStatus.status === "retrying"
      ? "Retrying Kokoro setup..."
      : kokoroStatus.status === "warming"
        ? "Warming up voice model..."
        : "Preparing voice model...";

  const loadKokoroVoices = useCallback(async () => {
    if (!api?.kokoroVoices) return;
    const vr = await api.kokoroVoices();
    if (vr.voices) setKokoroVoices(vr.voices);
  }, []);

  const applyKokoroStatusSnapshot = useCallback((snapshotLike?: Partial<KokoroStatusSnapshot> | null) => {
    const snapshot = normalizeKokoroStatusSnapshot(snapshotLike);
    kokoroStatusRef.current = snapshot;
    setKokoroStatus(snapshot);
    const error = getKokoroStatusError(snapshot);
    if (error) {
      setKokoroError(error);
      setKokoroDownloading(false);
      return;
    }
    if (snapshot.ready) {
      setKokoroError(null);
      setKokoroDownloading(false);
      setKokoroStalled(false);
      void loadKokoroVoices();
      return;
    }
    if (snapshot.loading || snapshot.status === "idle") {
      setKokoroDownloading(false);
      setKokoroStalled(false);
      if (snapshot.loading || snapshot.status === "idle") {
        setKokoroError(null);
      }
    }
  }, [loadKokoroVoices]);

  const handlePreflightKokoro = useCallback(async () => {
    if (!api?.kokoroPreflight) return null;
    const requestId = ++kokoroPreflightRequestIdRef.current;
    setKokoroPreflightBusy(true);
    try {
      const report = await api.kokoroPreflight();
      if (kokoroPreflightRequestIdRef.current !== requestId) return null;
      if (isKokoroPreflightReport(report)) {
        setKokoroPreflightReport(report);
        if ("engine" in report && report.engine) {
          applyKokoroStatusSnapshot(report.engine);
        }
      } else {
        setKokoroPreflightReport({
          ok: false,
          status: "runtime-error",
          reason: report.reason ?? null,
          detail: report.error ?? "Kokoro validation failed.",
          ready: false,
          loading: false,
          recoverable: report.recoverable ?? true,
          offlineReady: false,
          checkedAt: new Date().toISOString(),
          checks: [],
        });
      }
      return report;
    } catch {
      if (kokoroPreflightRequestIdRef.current !== requestId) return null;
      setKokoroPreflightReport({
        ok: false,
        status: "runtime-error",
        reason: "preflight-failed",
        detail: "Kokoro validation failed.",
        ready: false,
        loading: false,
        recoverable: true,
        offlineReady: false,
        checkedAt: new Date().toISOString(),
        checks: [],
      });
      return null;
    } finally {
      if (kokoroPreflightRequestIdRef.current === requestId) {
        setKokoroPreflightBusy(false);
      }
    }
  }, [applyKokoroStatusSnapshot]);

  useEffect(() => {
    if (!api?.kokoroModelStatus) return;
    api.kokoroModelStatus().then((r) => {
      applyKokoroStatusSnapshot(r);
    }).catch(() => {});
    const cleanups: (() => void)[] = [];
    if (api.onKokoroDownloadProgress) {
      cleanups.push(api.onKokoroDownloadProgress((progress: number) => {
        setKokoroProgress(progress);
        setKokoroStalled(false);
        setKokoroDownloading(true);
      }));
    }
    if (api.onKokoroDownloadError) {
      cleanups.push(api.onKokoroDownloadError((error: string) => {
        applyKokoroStatusSnapshot(
          snapshotFromLegacyKokoroDownloadError(kokoroStatusRef.current, error),
        );
      }));
    }
    if (api.onKokoroEngineStatus) {
      cleanups.push(api.onKokoroEngineStatus((data) => {
        applyKokoroStatusSnapshot(data);
      }));
    }
    return () => cleanups.forEach((c) => c());
  }, [applyKokoroStatusSnapshot]);

  useEffect(() => {
    if (engine !== "kokoro") return;
    void handlePreflightKokoro();
  }, [engine, handlePreflightKokoro]);

  useEffect(() => {
    if (!kokoroDownloading || kokoroProgress > 0) {
      setKokoroStalled(false);
      return;
    }
    const timer = setTimeout(() => setKokoroStalled(true), 30000);
    return () => clearTimeout(timer);
  }, [kokoroDownloading, kokoroProgress]);

  const handleDownloadKokoro = async () => {
    if (!api?.kokoroDownload) return;
    setKokoroDownloading(true);
    setKokoroProgress(0);
    setKokoroError(null);
    setKokoroStalled(false);
    try {
      const result = await api.kokoroDownload();
      if (result.error) {
        applyKokoroStatusSnapshot(snapshotFromKokoroErrorResponse(result));
        void handlePreflightKokoro();
        return;
      }
      if (api.kokoroModelStatus) {
        const snapshot = await api.kokoroModelStatus();
        applyKokoroStatusSnapshot(snapshot);
      }
      void handlePreflightKokoro();
    } catch {
      applyKokoroStatusSnapshot(snapshotFromKokoroErrorResponse({}, "Download failed"));
      void handlePreflightKokoro();
    }
  };

  return {
    kokoroBusy,
    kokoroBusyLabel,
    kokoroError,
    kokoroPreflightBusy,
    kokoroPreflightReport,
    kokoroProgress,
    kokoroReady,
    kokoroStalled,
    kokoroVoices,
    kokoroWarming,
    handleDownloadKokoro,
    handlePreflightKokoro,
  };
}
