import { useState, useEffect } from "react";
import { formatTime, MIN_WPM, MAX_WPM, WPM_STEP } from "../utils/text";
import { useTheme } from "./ThemeProvider";
import HelpPanel from "./HelpPanel";
import AddEditPanel from "./AddEditPanel";
import DocCard from "./DocCard";
import StatsPanel from "./StatsPanel";
import RecentFolders from "./RecentFolders";

const api = window.electronAPI;

export default function LibraryView({
  library, settings, wpm, isMac, folderName, loadingContent, toast,
  onOpenDoc, onAddDoc, onAddDocFromUrl, onDeleteDoc, onResetProgress,
  onSelectFolder, onSwitchFolder, onSetWpm, wpmRef, onSetFolderName,
}) {
  const { theme, setTheme } = useTheme();
  const [showAdd, setShowAdd] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editFolder, setEditFolder] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [updateReady, setUpdateReady] = useState(null);

  useEffect(() => {
    const unsub = api.onUpdateDownloaded?.((version) => setUpdateReady(version));
    return () => unsub?.();
  }, []);

  // Sync theme from settings on load
  useEffect(() => {
    if (settings.theme && settings.theme !== theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme]);

  const filteredLibrary = library.filter((d) =>
    !searchQuery || d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalWords = library.reduce((a, d) => a + (d.wordCount || 0), 0);

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

  const startEdit = (doc) => {
    setEditingId(doc.id); setNewTitle(doc.title); setNewText(doc.content || ""); setShowAdd(true);
  };

  const handleThemeToggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    api.saveSettings({ theme: next });
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

      {/* Toast notification */}
      {toast && <div className="toast" role="status">{toast}</div>}

      {/* Update banner */}
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
              {library.length} {library.length === 1 ? "source" : "sources"}
              {totalWords > 0 && <> · {formatTime(totalWords, wpm)} total at {wpm} wpm</>}
              {settings.sourceFolder && <> · <span className="library-folder-name">{settings.sourceFolder.split(/[/\\]/).pop()}</span></>}
            </p>
          </div>
          <div className="library-actions">
            <button onClick={handleThemeToggle} className="btn" title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} aria-label="Toggle theme">
              {theme === "dark" ? "☀" : "☾"}
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

        {/* Stats panel */}
        {showStats && <StatsPanel wpm={wpm} onClose={() => setShowStats(false)} />}

        {/* Help panel */}
        {showHelp && <HelpPanel isMac={isMac} />}

        {/* Search bar */}
        {library.length > 3 && (
          <div className="library-search-wrap">
            <input
              placeholder="Filter sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="library-search"
              aria-label="Filter library"
            />
          </div>
        )}

        {/* URL input panel */}
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

        {/* Add/Edit panel */}
        {showAdd && (
          <AddEditPanel
            newTitle={newTitle} newText={newText} editingId={editingId}
            onTitleChange={setNewTitle} onTextChange={setNewText}
            onSave={handleAddDoc}
            onCancel={() => { setShowAdd(false); setEditingId(null); }}
          />
        )}

        {/* Empty state */}
        {library.length === 0 && !showAdd && (
          <div className="library-empty">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.2, marginBottom: 16 }}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <p style={{ fontSize: 16, marginBottom: 6 }}>Your library is empty</p>
            <p style={{ fontSize: 13 }}>Pick a source folder, drop files, or add text manually</p>
          </div>
        )}

        {/* Document list */}
        <div className="doc-list" role="list">
          {filteredLibrary.map((doc) => (
            <DocCard
              key={doc.id} doc={doc} wpm={wpm} confirmDelete={confirmDelete}
              onOpen={onOpenDoc} onReset={onResetProgress} onEdit={startEdit}
              onDelete={onDeleteDoc} onConfirmDelete={setConfirmDelete}
              onCancelDelete={() => setConfirmDelete(null)}
            />
          ))}
        </div>

        {/* Footer controls */}
        <div className="library-footer">
          <div className="library-speed">
            <span>speed</span>
            <input
              type="range" min={MIN_WPM} max={MAX_WPM} step={WPM_STEP} value={wpm}
              onChange={(e) => { onSetWpm(Number(e.target.value)); if (wpmRef) wpmRef.current = Number(e.target.value); }}
              className="library-speed-slider"
              aria-label="Reading speed"
            />
            <span className="library-speed-label">{wpm} wpm</span>
          </div>
          <div className="library-footer-actions">
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
