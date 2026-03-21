import { useState, useEffect } from "react";
import type { SyncStatusValue, AuthState } from "../types";

const api = window.electronAPI;

interface CloudSyncIndicatorProps {
  onOpenSettings: () => void;
}

function formatLastSync(timestamp: number): string {
  if (!timestamp) return "Never synced";
  const diffMs = Date.now() - timestamp;
  if (diffMs < 60000) return "Synced just now";
  if (diffMs < 3600000) return `Synced ${Math.floor(diffMs / 60000)}m ago`;
  if (diffMs < 86400000) return `Synced ${Math.floor(diffMs / 3600000)}h ago`;
  return `Synced ${new Date(timestamp).toLocaleDateString()}`;
}

export default function CloudSyncIndicator({ onOpenSettings }: CloudSyncIndicatorProps) {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatusValue>("idle");
  const [lastSync, setLastSync] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    api.cloudGetAuthState().then(setAuthState);
    api.cloudGetSyncStatus().then((s) => {
      setSyncStatus(s.status);
      setLastSync(s.lastSync);
    });
  }, []);

  useEffect(() => {
    const cleanup = api.onCloudSyncStatusChanged?.((status) => {
      setSyncStatus(status);
      if (status === "idle") {
        api.cloudGetSyncStatus().then((s) => setLastSync(s.lastSync));
      }
    });
    return cleanup;
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Don't render if not signed in
  if (!authState) return null;

  const effectiveStatus = !isOnline ? "offline" : syncStatus;

  const statusClass =
    effectiveStatus === "idle" ? "cloud-ind-synced" :
    effectiveStatus === "syncing" ? "cloud-ind-syncing" :
    effectiveStatus === "error" ? "cloud-ind-error" :
    "cloud-ind-offline";

  const tooltip =
    effectiveStatus === "idle" ? formatLastSync(lastSync) :
    effectiveStatus === "syncing" ? "Syncing..." :
    effectiveStatus === "error" ? "Sync error - click for details" :
    "Offline";

  return (
    <button
      className={`btn cloud-sync-indicator ${statusClass}`}
      onClick={onOpenSettings}
      title={tooltip}
      aria-label={`Cloud sync: ${tooltip}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      </svg>
      {effectiveStatus === "syncing" && <span className="cloud-ind-spinner" />}
    </button>
  );
}
