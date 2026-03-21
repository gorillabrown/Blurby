import { useState } from "react";

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
      <div className="settings-section-label">Logged-in Sites</div>
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
