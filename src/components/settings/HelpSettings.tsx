import { useState, useCallback } from "react";

const api = window.electronAPI;
const appVersion = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";

interface HelpSettingsProps {
  isMac: boolean;
}

export function HelpSettings({ isMac }: HelpSettingsProps) {
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  const handleCheckForUpdates = useCallback(async () => {
    setChecking(true);
    setUpdateStatus(null);
    setCanInstall(false);
    try {
      const result = await api.checkForUpdates();
      if (result.status === "dev") {
        setUpdateStatus("Updates not available in dev mode");
      } else if (result.status === "error") {
        setUpdateStatus(result.message || "Could not check for updates");
      } else if (result.version && result.version !== appVersion) {
        setUpdateStatus(`Update available: v${result.version}`);
        setCanInstall(true);
      } else {
        setUpdateStatus("You're up to date");
      }
    } catch {
      setUpdateStatus("Could not check for updates");
    }
    setChecking(false);
  }, []);

  const handleInstallUpdate = useCallback(() => {
    api.installUpdate();
  }, []);

  return (
    <div>
      <div className="settings-section-label">Adding Content</div>
      <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 20 }}>
        <p style={{ margin: "0 0 8px" }}>
          <b>Folder:</b> Pick a directory to auto-import .txt, .md, .epub, .pdf, .html files.
        </p>
        <p style={{ margin: "0 0 8px" }}>
          <b>URL:</b> Paste a web article link to extract readable text.
        </p>
        <p style={{ margin: 0 }}>
          <b>Drop:</b> Drag files onto the window to import.
        </p>
      </div>

      <div className="settings-section-label">Updates</div>
      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>
        Version {appVersion}
      </div>
      <div className="help-update-row">
        <button
          className="btn"
          onClick={handleCheckForUpdates}
          disabled={checking}
        >
          {checking ? "Checking..." : "Check for updates"}
        </button>
        {updateStatus && <span className="help-update-status">{updateStatus}</span>}
        {canInstall && (
          <button
            className="btn"
            onClick={handleInstallUpdate}
            style={{ marginLeft: 8 }}
          >
            Install &amp; restart
          </button>
        )}
      </div>
    </div>
  );
}
