import { useState, useEffect, useRef } from "react";

const api = (window as any).electronAPI;

interface ConnectorsSettingsProps {
  siteLogins: Array<{ domain: string; cookieCount: number }>;
  onSiteLogin: (url: string) => Promise<void>;
  onSiteLogout: (domain: string) => Promise<void>;
}

export function ConnectorsSettings({
  siteLogins,
  onSiteLogin,
  onSiteLogout,
}: ConnectorsSettingsProps) {
  const [loginUrl, setLoginUrl] = useState("");
  const [busy, setBusy] = useState(false);

  // Chrome Extension pairing state
  const [shortCode, setShortCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected");
  const [countdown, setCountdown] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch short code on mount
  useEffect(() => {
    api.getWsShortCode().then((result: any) => {
      if (result) {
        setShortCode(result.code);
        setExpiresAt(result.expiresAt);
        setConnectionStatus(result.status || (result.connected ? "connected" : "disconnected"));
      }
    });
  }, []);

  // BUG-156: Poll connection status every 5 seconds so UI stays current
  useEffect(() => {
    const poll = setInterval(() => {
      api.getWsShortCode().then((result: any) => {
        if (result) setConnectionStatus(result.status || (result.connected ? "connected" : "disconnected"));
      });
    }, 5000);
    return () => clearInterval(poll);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, expiresAt - Date.now());
      if (remaining <= 0) {
        // Refresh code
        api.getWsShortCode().then((result: any) => {
          if (result) {
            setShortCode(result.code);
            setExpiresAt(result.expiresAt);
            setConnectionStatus(result.status || (result.connected ? "connected" : "disconnected"));
          }
        });
      }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setCountdown(`${mins}:${secs.toString().padStart(2, "0")}`);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [expiresAt]);

  async function handleRegenerate() {
    const result = await api.regenerateWsShortCode();
    if (result) {
      setShortCode(result.code);
      setExpiresAt(result.expiresAt);
    }
  }

  async function handleDisconnect() {
    await api.regenerateWsPairingToken();
    // Refresh status — server restarted with new token, all clients disconnected
    const result = await api.getWsShortCode();
    if (result) {
      setShortCode(result.code);
      setExpiresAt(result.expiresAt);
      setConnectionStatus(result.status || (result.connected ? "connected" : "disconnected"));
    }
  }

  async function handleLogin() {
    const url = loginUrl.trim();
    if (!url) return;
    setBusy(true);
    try {
      await onSiteLogin(url);
      setLoginUrl("");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout(domain: string) {
    await onSiteLogout(domain);
  }

  return (
    <div>
      {/* Chrome Extension Pairing */}
      <div className="settings-section-label">Chrome Extension</div>
      <div className="appearance-hint">
        Pair the Blurby Chrome extension to send articles directly to your library.
      </div>

      <div className="ext-pairing-section">
        <div className="ext-pairing-status">
          <span className={`ext-status-dot ${
            connectionStatus === "connected" ? "ext-status-connected" :
            connectionStatus === "connecting" ? "ext-status-connecting" :
            "ext-status-disconnected"
          }`} />
          <span>{
            connectionStatus === "connected" ? "Connected" :
            connectionStatus === "connecting" ? "Connecting" :
            "Disconnected"
          }</span>
        </div>

        {connectionStatus !== "connected" && shortCode && (
          <>
            <div className="ext-pairing-code">{shortCode}</div>
            <div className="ext-pairing-hint">
              Enter this code in the Chrome extension popup to pair.
              Refreshes in {countdown}
            </div>
            <button className="settings-toggle-btn" onClick={handleRegenerate}>
              New Code
            </button>
          </>
        )}

        {connectionStatus === "connected" && (
          <>
            <div className="ext-pairing-hint">
              Extension is paired and connected.
            </div>
            <button
              className="settings-toggle-btn"
              onClick={handleDisconnect}
              style={{ marginTop: 8 }}
            >
              Disconnect
            </button>
          </>
        )}
      </div>

      {/* Site Logins */}
      <div className="settings-section-label" style={{ marginTop: 24 }}>Logged-in Sites</div>
      <div className="appearance-hint">
        Log in to paywalled sites so Blurby can extract articles behind a login wall.
      </div>

      {siteLogins.length === 0 ? (
        <div className="appearance-hint" style={{ marginBottom: 12 }}>
          No sites connected yet.
        </div>
      ) : (
        <div className="site-logins-list">
          {siteLogins.map((site) => (
            <div key={site.domain} className="site-login-item">
              <span className="site-login-domain">{site.domain}</span>
              <span style={{ fontSize: 10, color: "var(--text-muted, #888)", marginLeft: 8 }}>
                {site.cookieCount} cookies
              </span>
              <button
                className="btn site-login-logout"
                onClick={() => handleLogout(site.domain)}
                aria-label={`Log out of ${site.domain}`}
              >
                Log out
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="settings-section-label" style={{ marginTop: 16 }}>Add Site</div>
      <div className="site-login-add">
        <input
          className="url-input"
          type="url"
          placeholder="https://example.com"
          value={loginUrl}
          onChange={(e) => setLoginUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          aria-label="Site URL to log in to"
        />
        <button
          className="btn btn-fill"
          onClick={handleLogin}
          disabled={busy || !loginUrl.trim()}
        >
          {busy ? "Opening…" : "Log in"}
        </button>
      </div>
    </div>
  );
}
