import { useState, useEffect, useCallback, useRef } from "react";
import type { QwenPreflightReport, QwenStatusSnapshot } from "../types";
import {
  DEFAULT_QWEN_STATUS_SNAPSHOT,
  getQwenStatusError,
  normalizeQwenPreflightReport,
  normalizeQwenStatusSnapshot,
  snapshotFromQwenErrorResponse,
  snapshotFromQwenPreflightReport,
} from "../utils/qwenStatus";

function getElectronApi() {
  return window.electronAPI;
}

export function useQwenPrototypeStatus() {
  const [qwenStatus, setQwenStatus] = useState<QwenStatusSnapshot>(DEFAULT_QWEN_STATUS_SNAPSHOT);
  const [qwenVoices, setQwenVoices] = useState<string[]>([]);
  const [qwenError, setQwenError] = useState<string | null>(null);
  const [qwenPreflightReport, setQwenPreflightReport] = useState<QwenPreflightReport | null>(null);
  const [qwenPreflightBusy, setQwenPreflightBusy] = useState(false);
  const qwenStatusRef = useRef<QwenStatusSnapshot>(DEFAULT_QWEN_STATUS_SNAPSHOT);
  const voiceRequestIdRef = useRef(0);
  const preloadRequestIdRef = useRef(0);
  const preflightRequestIdRef = useRef(0);
  const qwenReady = qwenStatus.ready;
  const qwenWarming = qwenStatus.status === "warming";
  const qwenBusy = qwenStatus.loading;

  const resetQwenVoices = useCallback(() => {
    voiceRequestIdRef.current += 1;
    setQwenVoices([]);
  }, []);

  const loadQwenVoices = useCallback(async () => {
    const api = getElectronApi();
    if (!api?.qwenVoices) return;
    const requestId = ++voiceRequestIdRef.current;
    try {
      const result = await api.qwenVoices();
      if (voiceRequestIdRef.current !== requestId) return;
      if (result.voices && qwenStatusRef.current.ready && !getQwenStatusError(qwenStatusRef.current)) {
        setQwenVoices(result.voices);
        return;
      }
    } catch {
      if (voiceRequestIdRef.current !== requestId) return;
    }
    setQwenVoices([]);
  }, []);

  const applyQwenStatusSnapshot = useCallback((snapshotLike?: Partial<QwenStatusSnapshot> | null) => {
    const snapshot = normalizeQwenStatusSnapshot(snapshotLike);
    qwenStatusRef.current = snapshot;
    setQwenStatus(snapshot);

    const error = getQwenStatusError(snapshot);
    if (error) {
      resetQwenVoices();
      setQwenError(error);
      return;
    }

    if (snapshot.ready) {
      setQwenError(null);
      void loadQwenVoices();
      return;
    }

    if (snapshot.loading || snapshot.status === "idle") {
      if (!snapshot.ready) {
        resetQwenVoices();
      }
      setQwenError(null);
    }
  }, [loadQwenVoices, resetQwenVoices]);

  const applyQwenPreflightReport = useCallback((reportLike?: Partial<QwenPreflightReport> | null) => {
    const report = normalizeQwenPreflightReport(reportLike);
    setQwenPreflightReport(report);
    if (report.status !== "ready") {
      applyQwenStatusSnapshot(snapshotFromQwenPreflightReport(report));
    }
  }, [applyQwenStatusSnapshot]);

  useEffect(() => {
    const api = getElectronApi();
    if (!api?.qwenModelStatus) return;
    api.qwenModelStatus().then((result) => {
      applyQwenStatusSnapshot(result);
    }).catch(() => {});

    const cleanups: (() => void)[] = [];
    if (api.onQwenEngineStatus) {
      cleanups.push(api.onQwenEngineStatus((data) => {
        applyQwenStatusSnapshot(data);
      }));
    }
    if (api.onQwenRuntimeError) {
      cleanups.push(api.onQwenRuntimeError((error: string) => {
        applyQwenStatusSnapshot(snapshotFromQwenErrorResponse({
          error,
          status: qwenStatusRef.current.status === "warming" ? "unavailable" : "error",
          reason: qwenStatusRef.current.reason ?? "runtime-error",
          recoverable: true,
        }));
      }));
    }
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [applyQwenStatusSnapshot]);

  const handlePreflightQwen = useCallback(async () => {
    const api = getElectronApi();
    if (!api?.qwenPreflight) return null;
    const requestId = ++preflightRequestIdRef.current;
    setQwenPreflightBusy(true);
    try {
      const report = await api.qwenPreflight();
      if (preflightRequestIdRef.current !== requestId) return null;
      applyQwenPreflightReport(report);
      return report;
    } catch {
      if (preflightRequestIdRef.current !== requestId) return null;
      applyQwenPreflightReport({
        status: "error",
        reason: "preflight-failed",
        detail: "Qwen runtime validation failed.",
        recoverable: true,
        supportedHost: false,
        checks: [],
      });
      return null;
    } finally {
      if (preflightRequestIdRef.current === requestId) {
        setQwenPreflightBusy(false);
      }
    }
  }, [applyQwenPreflightReport]);

  const handlePreloadQwen = useCallback(async () => {
    const api = getElectronApi();
    if (!api?.qwenPreload) return;
    const requestId = ++preloadRequestIdRef.current;
    setQwenError(null);
    resetQwenVoices();
    try {
      const result = await api.qwenPreload();
      if (preloadRequestIdRef.current !== requestId) return;
      if (result.error) {
        applyQwenStatusSnapshot(snapshotFromQwenErrorResponse(result));
        void handlePreflightQwen();
        return;
      }
      if (api.qwenModelStatus) {
        const snapshot = await api.qwenModelStatus();
        if (preloadRequestIdRef.current !== requestId) return;
        applyQwenStatusSnapshot(snapshot);
      }
    } catch {
      if (preloadRequestIdRef.current !== requestId) return;
      applyQwenStatusSnapshot(snapshotFromQwenErrorResponse({
        error: "Qwen runtime check failed",
        status: "error",
        reason: "runtime-check-failed",
        recoverable: true,
      }));
      void handlePreflightQwen();
    }
  }, [applyQwenStatusSnapshot, handlePreflightQwen, resetQwenVoices]);

  return {
    qwenStatus,
    qwenVoices,
    qwenError,
    qwenPreflightReport,
    qwenPreflightBusy,
    qwenReady,
    qwenWarming,
    qwenBusy,
    handlePreloadQwen,
    handlePreflightQwen,
  };
}
