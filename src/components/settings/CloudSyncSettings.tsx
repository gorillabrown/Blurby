import { useState, useEffect, useCallback } from "react";
import type { BlurbySettings, AuthState, SyncStatus, MergePreview } from "../../types";

const api = window.electronAPI;

interface CloudSyncSettingsProps {
  settings: BlurbySettings;
  onSettingsChange: (updates: Partial<BlurbySettings>) => void;
}

const SYNC_INTERVALS = [
  { label: "1 minute", value: 1 },
  { label: "5 minutes", value: 5 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "Manual only", value: 0 },
];

function formatLastSync(timestamp: number): string {
  if (!timestamp) return "Never";
  const date = new Date(timestamp);
  const now = Date.now();
  const diffMs = now - timestamp;
  if (diffMs < 60000) return "Just now";
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)} min ago`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function CloudSyncSettings({ settings, onSettingsChange }: CloudSyncSettingsProps) {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mergePreview, setMergePreview] = useState<MergePreview | null>(null);
  const [showMergeDialog, setShowMergeDialog] = useState(false);

  // Load initial state
  useEffect(() => {
    api.cloudGetAuthState().then(setAuthState);
    api.cloudGetSyncStatus().then(setSyncStatus);
  }, []);

  // Listen for sync status changes
  useEffect(() => {
    const cleanup = api.onCloudSyncStatusChanged?.((status) => {
      setSyncStatus((prev) => prev ? { ...prev, status } : { status, lastSync: 0, provider: null });
      if (status !== "syncing") setSyncing(false);
    });
    return cleanup;
  }, []);

  // Listen for auth-required events
  useEffect(() => {
    const cleanup = api.onCloudAuthRequired?.((provider) => {
      setError(`Session expired for ${provider}. Please sign in again.`);
      setAuthState(null);
    });
    return cleanup;
  }, []);

  const handleSignIn = useCallback(async (provider: "microsoft" | "google") => {
    setSigningIn(true);
    setError(null);
    try {
      const result = await api.cloudSignIn(provider);
      if (result.error) {
        setError(result.error);
      } else {
        setAuthState({ provider, email: result.email || "", name: result.name || "" });
        // Check for first-time sync
        const preview = await api.cloudGetMergePreview();
        if (preview && !preview.error) {
          if (preview.cloudHasData || preview.localHasData) {
            setMergePreview(preview);
            setShowMergeDialog(true);
          } else {
            // Both empty, just start syncing
            handleSyncNow();
          }
        }
        // Start auto-sync
        const intervalMs = (settings.syncIntervalMinutes || 5) * 60 * 1000;
        if (intervalMs > 0) api.cloudStartAutoSync(intervalMs);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setSigningIn(false);
    }
  }, [settings.syncIntervalMinutes]);

  const handleSignOut = useCallback(async () => {
    if (!authState) return;
    const confirmed = window.confirm(`Sign out of ${authState.provider === "microsoft" ? "Microsoft" : "Google"}? Cloud sync will stop.`);
    if (!confirmed) return;
    setError(null);
    try {
      await api.cloudSignOut(authState.provider);
      setAuthState(null);
      setSyncStatus(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign-out failed");
    }
  }, [authState]);

  const handleSyncNow = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      const result = await api.cloudSyncNow();
      if (result.status === "error") {
        setError(result.error || "Sync failed");
      }
      api.cloudGetSyncStatus().then(setSyncStatus);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }, []);

  const handleForceSync = useCallback(async (direction: "upload" | "download" | "merge") => {
    setShowMergeDialog(false);
    setSyncing(true);
    setError(null);
    try {
      const result = await api.cloudForceSync(direction);
      if (result.status === "error") {
        setError(result.error || "Sync failed");
      }
      api.cloudGetSyncStatus().then(setSyncStatus);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }, []);

  const handleIntervalChange = useCallback((minutes: number) => {
    onSettingsChange({ syncIntervalMinutes: minutes });
    if (minutes > 0) {
      api.cloudStartAutoSync(minutes * 60 * 1000);
    } else {
      api.cloudStopAutoSync();
    }
  }, [onSettingsChange]);

  // Signed-out state
  if (!authState) {
    return (
      <div>
        <div className="settings-section-label">Cloud Sync</div>
        <div className="appearance-hint">
          Sign in to sync your library, reading progress, and settings across devices.
          Your data is stored in a private app folder only Blurby can access.
        </div>

        {error && <div className="cloud-sync-error">{error}</div>}

        <div className="cloud-sync-buttons">
          <button
            className="btn cloud-sign-in-btn cloud-sign-in-microsoft"
            onClick={() => handleSignIn("microsoft")}
            disabled={signingIn}
          >
            <span className="cloud-sign-in-icon">M</span>
            {signingIn ? "Signing in..." : "Sign in with Microsoft"}
          </button>
          <button
            className="btn cloud-sign-in-btn cloud-sign-in-google"
            onClick={() => handleSignIn("google")}
            disabled={signingIn}
          >
            <span className="cloud-sign-in-icon">G</span>
            {signingIn ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>
      </div>
    );
  }

  // Signed-in state
  const statusIcon =
    syncStatus?.status === "idle" ? "cloud-status-synced" :
    syncStatus?.status === "syncing" ? "cloud-status-syncing" :
    syncStatus?.status === "error" ? "cloud-status-error" :
    "cloud-status-offline";

  return (
    <div>
      <div className="settings-section-label">Cloud Sync</div>

      {/* Connection info */}
      <div className="cloud-sync-info">
        <div className="cloud-sync-account">
          <span className={`cloud-sync-status-dot ${statusIcon}`} />
          <div className="cloud-sync-account-details">
            <span className="cloud-sync-email">{authState.email}</span>
            <span className="cloud-sync-provider">
              {authState.provider === "microsoft" ? "Microsoft OneDrive" : "Google Drive"}
            </span>
          </div>
        </div>
        <div className="cloud-sync-last">
          Last synced: {formatLastSync(syncStatus?.lastSync || 0)}
        </div>
      </div>

      {error && <div className="cloud-sync-error">{error}</div>}

      {/* Sync controls */}
      <div className="cloud-sync-controls">
        <button
          className="btn btn-fill"
          onClick={handleSyncNow}
          disabled={syncing}
        >
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {/* Sync frequency */}
      <div className="settings-section-label" style={{ marginTop: 16 }}>Sync Frequency</div>
      <div className="cloud-sync-frequency">
        {SYNC_INTERVALS.map((opt) => (
          <label key={opt.value} className="cloud-sync-freq-option">
            <input
              type="radio"
              name="syncInterval"
              checked={settings.syncIntervalMinutes === opt.value}
              onChange={() => handleIntervalChange(opt.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Metered connection toggle */}
      <div className="cloud-sync-toggle">
        <label className="cloud-sync-toggle-label">
          <input
            type="checkbox"
            checked={settings.syncOnMeteredConnection || false}
            onChange={(e) => onSettingsChange({ syncOnMeteredConnection: e.target.checked })}
          />
          <span>Sync on metered connections</span>
        </label>
        <div className="appearance-hint">When disabled, only metadata syncs on mobile data.</div>
      </div>

      {/* Sign out */}
      <div className="cloud-sync-signout">
        <button className="btn cloud-sign-out-btn" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>

      {/* Merge dialog */}
      {showMergeDialog && mergePreview && (
        <div className="cloud-merge-overlay">
          <div className="cloud-merge-dialog">
            <h3>Set Up Cloud Sync</h3>
            <div className="cloud-merge-info">
              <p>Local: {mergePreview.localDocs} documents</p>
              <p>Cloud: {mergePreview.cloudDocs} documents</p>
            </div>

            {mergePreview.localHasData && !mergePreview.cloudHasData && (
              <>
                <p>Upload your library to the cloud?</p>
                <div className="cloud-merge-actions">
                  <button className="btn btn-fill" onClick={() => handleForceSync("upload")}>
                    Upload to Cloud
                  </button>
                  <button className="btn" onClick={() => setShowMergeDialog(false)}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {!mergePreview.localHasData && mergePreview.cloudHasData && (
              <>
                <p>Download your library from the cloud?</p>
                <div className="cloud-merge-actions">
                  <button className="btn btn-fill" onClick={() => handleForceSync("download")}>
                    Download from Cloud
                  </button>
                  <button className="btn" onClick={() => setShowMergeDialog(false)}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {mergePreview.localHasData && mergePreview.cloudHasData && (
              <>
                <p>Both local and cloud have data. Choose an action:</p>
                <div className="cloud-merge-actions">
                  <button className="btn btn-fill" onClick={() => handleForceSync("merge")}>
                    Merge Both
                  </button>
                  <button className="btn" onClick={() => handleForceSync("download")}>
                    Replace Local with Cloud
                  </button>
                  <button className="btn" onClick={() => handleForceSync("upload")}>
                    Replace Cloud with Local
                  </button>
                  <button className="btn" onClick={() => setShowMergeDialog(false)}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
