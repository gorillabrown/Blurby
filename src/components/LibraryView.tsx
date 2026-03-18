import { useState, useEffect } from "react";
import { formatTime, MIN_WPM, MAX_WPM, WPM_STEP } from "../utils/text";
import { BlurbyDoc, BlurbySettings } from "../types";
import { useTheme, nextTheme, themeLabel } from "./ThemeProvider";
import HelpPanel from "./HelpPanel";
import AddEditPanel from "./AddEditPanel";
import DocCard from "./DocCard";
import StatsPanel from "./StatsPanel";
import RecentFolders from "./RecentFolders";

const api = window.electronAPI;

const ACCENT_PRESETS = [
  { label: "gold", value: "#c4a882" },
  { label: "blue", value: "#5b8fb9" },
  { label: "green", value: "#6b9f6b" },
  { label: "rose", value: "#c47882" },
  { label: "purple", value: "#9b82c4" },
  { label: "teal", value: "#5ba8a0" },
];

const FONT_PRESETS: { label: string; value: string | null }[] = [
  { label: "system", value: null },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Merriweather", value: "'Merriweather', Georgia, serif" },
  { label: "Mono", value: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" },
  { label: "Literata", value: "'Literata', Georgia, serif" },
  { label: "OpenDyslexic", value: "'OpenDyslexic', sans-serif" },
];

interface LibraryViewProps {
  library: BlurbyDoc[];
  settings: BlurbySettings;
  wpm: number;
  isMac: boolean;
  folderName: string;
  loadingContent: boolean;
  toast: string | null;
  onOpenDoc: (doc: BlurbyDoc, mode?: string) => void;
  onAddDoc: (title: string, content: string, editingId?: string | null) => void;
  onAddDocFromUrl: (url: string) => Promise<{ doc?: BlurbyDoc; error?: string }>;
  onDeleteDoc: (id: string) => void;
  onResetProgress: (id: string) => void;
  onSelectFolder: () => void;
  onSwitchFolder: (folder: string) => void;
  onSetWpm: (wpm: number) => void;
  onSetFolderName: (name: string) => void;
  onToggleFavorite: (id: string) => void;
  onArchiveDoc: (id: string) => void;
  onUnarchiveDoc: (id: string) => void;
}

export default function LibraryView({
  library, settings, wpm, isMac, folderName, loadingContent, toast,
  onOpenDoc, onAddDoc, onAddDocFromUrl, onDeleteDoc, onResetProgress,
  onSelectFolder, onSwitchFolder, onSetWpm, onSetFolderName,
  onToggleFavorite, onArchiveDoc, onUnarchiveDoc,
}: LibraryViewProps) {
  const { theme, setTheme, accentColor, setAccentColor, fontFamily, setFontFamily } = useTheme();
  const [tab, setTab] = useState("all"); // "all" | "favorites" | "archived"
  const [showAdd, setShowAdd] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editFolder, setEditFolder] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("progress"); // "progress" | "alpha" | "newest" | "oldest"
  const [showAppearance, setShowAppearance] = useState(false);
  const [updateReady, setUpdateReady] = useState<string | null>(null);
  const [launchAtLogin, setLaunchAtLogin] = useState(false);
  const [siteLogins, setSiteLogins] = useState<Array<{ domain: string; cookieCount: number }>>([]);
  const [loginUrl, setLoginUrl] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    const unsub = api.onUpdateDownloaded?.((version) => setUpdateReady(version));
    return () => unsub?.();
  }, []);

  useEffect(() => {
    if (settings.theme && settings.theme !== theme) setTheme(settings.theme);
    if (settings.accentColor !== undefined) setAccentColor(settings.accentColor);
    if (settings.fontFamily !== undefined) setFontFamily(settings.fontFamily);
  }, [settings.theme, settings.accentColor, settings.fontFamily]);

  useEffect(() => {
    api.getLaunchAtLogin?.().then((v) => setLaunchAtLogin(v));
  }, []);

  const refreshSiteLogins = () => {
    api.getSiteLogins().then(setSiteLogins);
  };
  useEffect(() => { refreshSiteLogins(); }, []);

  const handleSiteLogin = async () => {
    let url = loginUrl.trim();
    if (!url) return;
    if (!url.startsWith("http")) url = "https://" + url;
    try { new URL(url); } catch { return; }
    setLoggingIn(true);
    await api.siteLogin(url);
    setLoggingIn(false);
    setLoginUrl("");
    refreshSiteLogins();
  };

  const handleSiteLogout = async (domain: string) => {
    await api.siteLogout(domain);
    refreshSiteLogins();
  };

  // Filter and sort library
  const getFilteredAndSorted = () => {
    let docs = library;
    if (tab === "favorites") docs = docs.filter((d) => d.favorite);
    else if (tab === "archived") docs = docs.filter((d) => d.archived);
    else docs = docs.filter((d) => !d.archived);
    if (searchQuery) docs = docs.filter((d) => d.title.toLowerCase().includes(searchQuery.toLowerCase()));

    docs = [...docs];
    if (sortBy === "progress") {
      // Closest to finished first (highest % read), then alphabetical
      docs.sort((a, b) => {
        const pctA = a.wordCount > 0 ? (a.position || 0) / a.wordCount : 0;
        const pctB = b.wordCount > 0 ? (b.position || 0) / b.wordCount : 0;
        if (pctB !== pctA) return pctB - pctA;
        return a.title.localeCompare(b.title);
      });
    } else if (sortBy === "alpha") {
      docs.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "newest") {
      docs.sort((a, b) => (b.created || 0) - (a.created || 0));
    } else if (sortBy === "oldest") {
      docs.sort((a, b) => (a.created || 0) - (b.created || 0));
    }
    return docs;
  };
  const filteredLibrary = getFilteredAndSorted();

  const activeLibrary = library.filter((d) => !d.archived);
  const totalWords = activeLibrary.reduce((a, d) => a + (d.wordCount || 0), 0);
  const favCount = library.filter((d) => d.favorite).length;
  const archivedCount = library.filter((d) => d.archived).length;

  const handleAddDoc = async () => {
    if (!newTitle.trim() || !newText.trim()) return;
    await onAddDoc(newTitle.trim(), newText.trim(), editingId);
    setNewTitle(""); setNewText(""); setShowAdd(false); setEditingId(null);
  };

  const handleAddFromUrl = async () => {
    const url = urlInput.trim();
    if (!url) return;
    try { new URL(url); } catch { setUrlError("Please enter a valid URL."); return; }
    setUrlError("");
    const result = await onAddDocFromUrl(url);
    if (result?.error) { setUrlError(result.error); }
    else { setUrlInput(""); setShowUrl(false); setUrlError(""); }
  };

  const startEdit = (doc: BlurbyDoc) => {
    setEditingId(doc.id); setNewTitle(doc.title); setNewText(doc.content || ""); setShowAdd(true);
  };

  const handleThemeCycle = () => {
    const next = nextTheme(theme) as BlurbySettings["theme"];
    setTheme(next);
    api.saveSettings({ theme: next });
  };

  const handleAccentChange = (color: string | null) => {
    setAccentColor(color);
    api.saveSettings({ accentColor: color });
  };

  const handleFontChange = (font: string | null) => {
    setFontFamily(font);
    api.saveSettings({ fontFamily: font });
  };

  const handleLaunchToggle = async () => {
    const next = !launchAtLogin;
    await api.setLaunchAtLogin(next);
    setLaunchAtLogin(next);
  };

  const handleExport = async () => {
    const path = await api.exportLibrary();
    if (path) alert(`Exported to ${path}`);
  };

  const handleImport = async () => {
    const result = await api.importLibrary();
    if (result?.error) alert(result.error);
    else if (result) alert(`Imported ${result.added} new document${result.added !== 1 ? "s" : ""}`);
  };

  return (
    <div className="library-container">
      <div className="library-titlebar" style={{ height: isMac ? 48 : 32 }} />

      {loadingContent && (
        <div className="library-loading" role="status">
          <span className="library-loading-text">Loading...</span>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}

      {updateReady && (
        <div className="update-banner" role="alert">
          <span>Blurby {updateReady} ready to install</span>
          <button onClick={() => api.installUpdate()} className="btn-fill" style={{ padding: "4px 12px", fontSize: 10 }}>restart</button>
        </div>
      )}

      <div className="library-scroll">
        {/* Header */}
        <div className="library-header">
          <div>
            {editFolder ? (
              <input
                autoFocus value={folderName}
                onChange={(e) => onSetFolderName(e.target.value)}
                onBlur={() => setEditFolder(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditFolder(false)}
                className="library-folder-input"
                aria-label="Library name"
              />
            ) : (
              <h1
                onClick={() => setEditFolder(true)}
                className="library-folder-title"
                title="Click to rename"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setEditFolder(true)}
              >{folderName}</h1>
            )}
            <p className="library-stats">
              {activeLibrary.length} {activeLibrary.length === 1 ? "source" : "sources"}
              {totalWords > 0 && <> · {formatTime(totalWords, wpm)} total at {wpm} wpm</>}
              {settings.sourceFolder && <> · <span className="library-folder-name">{settings.sourceFolder.split(/[/\\]/).pop()}</span></>}
            </p>
          </div>
          <div className="library-actions">
            <button onClick={handleThemeCycle} className="btn" title={`Theme: ${themeLabel(theme)}`} aria-label="Cycle theme">
              {themeLabel(nextTheme(theme))}
            </button>
            <button onClick={() => setShowAppearance(!showAppearance)} className="btn" title="Appearance settings" aria-label="Appearance settings">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: -1 }}>
                <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>
            <button onClick={() => setShowStats(!showStats)} className="btn" title="Reading stats" aria-label="Show reading statistics">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: -1 }}>
                <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
              </svg>
            </button>
            <button onClick={() => setShowHelp(!showHelp)} className="btn" aria-label="Show help">?</button>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowRecent(!showRecent)} className="btn" aria-label="Select folder">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6, verticalAlign: -1 }}>
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                folder
              </button>
              {showRecent && (
                <RecentFolders
                  recentFolders={settings.recentFolders}
                  currentFolder={settings.sourceFolder}
                  onSwitch={onSwitchFolder}
                  onBrowse={onSelectFolder}
                  onClose={() => setShowRecent(false)}
                />
              )}
            </div>
            <button onClick={() => { setShowUrl(true); setUrlInput(""); setUrlError(""); }} className="btn" aria-label="Add from URL">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6, verticalAlign: -1 }}>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              url
            </button>
            <button onClick={() => { setShowAdd(true); setEditingId(null); setNewTitle(""); setNewText(""); }} className="btn-fill" aria-label="Add document">+ add</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="library-tabs" role="tablist">
          <button
            className={`library-tab${tab === "all" ? " library-tab-active" : ""}`}
            onClick={() => setTab("all")}
            role="tab"
            aria-selected={tab === "all"}
          >all ({activeLibrary.length})</button>
          <button
            className={`library-tab${tab === "favorites" ? " library-tab-active" : ""}`}
            onClick={() => setTab("favorites")}
            role="tab"
            aria-selected={tab === "favorites"}
          >favorites ({favCount})</button>
          <button
            className={`library-tab${tab === "archived" ? " library-tab-active" : ""}`}
            onClick={() => setTab("archived")}
            role="tab"
            aria-selected={tab === "archived"}
          >archived ({archivedCount})</button>
        </div>

        {showStats && <StatsPanel wpm={wpm} onClose={() => setShowStats(false)} />}
        {showHelp && <HelpPanel isMac={isMac} />}

        {showAppearance && (
          <div className="appearance-panel">
            <div className="stats-header">
              <span className="stats-title">Appearance</span>
              <button onClick={() => setShowAppearance(false)} className="btn stats-close">close</button>
            </div>
            <div className="appearance-section">
              <span className="appearance-label">Accent color</span>
              <div className="appearance-row">
                {ACCENT_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    className={`accent-swatch${accentColor === preset.value || (!accentColor && preset.value === "#c4a882") ? " accent-swatch-active" : ""}`}
                    style={{ background: preset.value }}
                    onClick={() => handleAccentChange(preset.value === "#c4a882" ? null : preset.value)}
                    title={preset.label}
                    aria-label={`Accent color: ${preset.label}`}
                  />
                ))}
                <label className="accent-custom" title="Custom color">
                  <input
                    type="color"
                    value={accentColor || "#c4a882"}
                    onChange={(e) => handleAccentChange(e.target.value)}
                    className="accent-color-input"
                  />
                  <span className="accent-custom-label">custom</span>
                </label>
              </div>
            </div>
            <div className="appearance-section">
              <span className="appearance-label">Reader font</span>
              <div className="appearance-row">
                {FONT_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    className={`font-preset${fontFamily === preset.value ? " font-preset-active" : ""}`}
                    onClick={() => handleFontChange(preset.value)}
                    style={preset.value ? { fontFamily: preset.value } : {}}
                  >{preset.label}</button>
                ))}
              </div>
            </div>
            <div className="appearance-section">
              <span className="appearance-label">Reader pauses</span>
              <div className="appearance-row" style={{ flexDirection: "column", gap: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem" }}>
                  <span style={{ minWidth: 120 }}>Initial pause</span>
                  <input
                    type="range" min={0} max={5000} step={500}
                    value={settings.initialPauseMs ?? 3000}
                    onChange={(e) => api.saveSettings({ initialPauseMs: Number(e.target.value) })}
                    style={{ flex: 1 }}
                  />
                  <span style={{ minWidth: 36, textAlign: "right" }}>{((settings.initialPauseMs ?? 3000) / 1000).toFixed(1)}s</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem" }}>
                  <span style={{ minWidth: 120 }}>Punctuation pause</span>
                  <input
                    type="range" min={0} max={3000} step={250}
                    value={settings.punctuationPauseMs ?? 1000}
                    onChange={(e) => api.saveSettings({ punctuationPauseMs: Number(e.target.value) })}
                    style={{ flex: 1 }}
                  />
                  <span style={{ minWidth: 36, textAlign: "right" }}>{((settings.punctuationPauseMs ?? 1000) / 1000).toFixed(1)}s</span>
                </label>
              </div>
            </div>
            <div className="appearance-section">
              <span className="appearance-label">Site logins</span>
              <div className="appearance-hint">Log in to paywalled sites to access full articles</div>
              {siteLogins.length > 0 && (
                <div className="site-logins-list">
                  {siteLogins.map((site) => (
                    <div key={site.domain} className="site-login-item">
                      <span className="site-login-domain">{site.domain}</span>
                      <button className="btn site-login-logout" onClick={() => handleSiteLogout(site.domain)}>log out</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="site-login-add">
                <input
                  placeholder="Enter site URL (e.g. nytimes.com)"
                  value={loginUrl}
                  onChange={(e) => setLoginUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSiteLogin()}
                  className="library-search"
                  style={{ flex: 1 }}
                  disabled={loggingIn}
                />
                <button
                  onClick={handleSiteLogin}
                  disabled={!loginUrl.trim() || loggingIn}
                  className="btn"
                  style={{ opacity: loginUrl.trim() && !loggingIn ? 1 : 0.3 }}
                >{loggingIn ? "logging in..." : "log in"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Search bar and sort */}
        {library.length > 3 && (
          <div className="library-search-wrap" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              placeholder="Filter sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="library-search"
              style={{ flex: 1 }}
              aria-label="Filter library"
            />
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort order"
            >
              <option value="progress">closest to done</option>
              <option value="alpha">A-Z</option>
              <option value="newest">newest first</option>
              <option value="oldest">oldest first</option>
            </select>
          </div>
        )}

        {showUrl && (
          <div className="add-edit-panel">
            <div className="url-input-row">
              <input
                autoFocus placeholder="Paste article URL..."
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleAddFromUrl()}
                className="library-search"
                aria-label="Article URL"
              />
              <button
                onClick={handleAddFromUrl}
                disabled={!urlInput.trim() || loadingContent}
                className="btn-fill"
                style={{ opacity: urlInput.trim() && !loadingContent ? 1 : 0.3, whiteSpace: "nowrap" }}
              >{loadingContent ? "fetching..." : "fetch"}</button>
              <button onClick={() => { setShowUrl(false); setUrlError(""); }} className="btn">cancel</button>
            </div>
            {urlError && <div className="url-error" role="alert">{urlError}</div>}
          </div>
        )}

        {showAdd && (
          <AddEditPanel
            newTitle={newTitle} newText={newText} editingId={editingId}
            onTitleChange={setNewTitle} onTextChange={setNewText}
            onSave={handleAddDoc}
            onCancel={() => { setShowAdd(false); setEditingId(null); }}
          />
        )}

        {/* Empty states per tab */}
        {filteredLibrary.length === 0 && !showAdd && (
          <div className="library-empty">
            {tab === "all" && (
              <>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.2, marginBottom: 16 }}>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <p style={{ fontSize: 16, marginBottom: 6 }}>Your library is empty</p>
                <p style={{ fontSize: 13 }}>Pick a source folder, drop files, or add text manually</p>
              </>
            )}
            {tab === "favorites" && <p style={{ fontSize: 14, color: "var(--text-dim)" }}>No favorites yet — star documents to see them here</p>}
            {tab === "archived" && <p style={{ fontSize: 14, color: "var(--text-dim)" }}>No archived documents — completed readings auto-archive here</p>}
          </div>
        )}

        {/* Document list */}
        <div className="doc-list" role="list">
          {filteredLibrary.map((doc) => (
            <DocCard
              key={doc.id} doc={doc} wpm={wpm} confirmDelete={confirmDelete}
              onOpen={onOpenDoc} onReset={onResetProgress} onEdit={startEdit}
              onDelete={onDeleteDoc}
              onConfirmDelete={setConfirmDelete}
              onCancelDelete={() => setConfirmDelete(null)}
              onToggleFavorite={onToggleFavorite}
              onArchive={onArchiveDoc}
              onUnarchive={onUnarchiveDoc}
              onOpenScroll={(d) => onOpenDoc(d, "scroll")}
              onOpenNewWindow={(d) => window.electronAPI.openReaderWindow(d.id)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="library-footer">
          <div className="library-speed">
            <span>speed</span>
            <input
              type="range" min={MIN_WPM} max={MAX_WPM} step={WPM_STEP} value={wpm}
              onChange={(e) => onSetWpm(Number(e.target.value))}
              className="library-speed-slider"
              aria-label="Reading speed"
            />
            <span className="library-speed-label">{wpm} wpm</span>
          </div>
          <div className="library-footer-actions">
            <label className="launch-toggle" title="Start Blurby when computer starts">
              <input
                type="checkbox"
                checked={launchAtLogin}
                onChange={handleLaunchToggle}
              />
              <span className="launch-toggle-label">start at login</span>
            </label>
            <button onClick={handleExport} className="btn library-change-folder" aria-label="Export library">export</button>
            <button onClick={handleImport} className="btn library-change-folder" aria-label="Import library">import</button>
            {settings.sourceFolder && (
              <button onClick={onSelectFolder} className="btn library-change-folder">change folder</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
