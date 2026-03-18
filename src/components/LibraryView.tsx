import { useState, useEffect } from "react";
import { formatTime, MIN_WPM, MAX_WPM, WPM_STEP } from "../utils/text";
import { BlurbyDoc, BlurbySettings } from "../types";
import { useTheme } from "./ThemeProvider";
import AddEditPanel from "./AddEditPanel";
import DocCard from "./DocCard";
import DocGridCard from "./DocGridCard";
import StatsPanel from "./StatsPanel";
import RecentFolders from "./RecentFolders";

const api = window.electronAPI;

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
  onToggleFlap: () => void;
  onSettingsChange: (patch: Partial<BlurbySettings>) => void;
}

export default function LibraryView({
  library, settings, wpm, isMac, folderName, loadingContent, toast,
  onOpenDoc, onAddDoc, onAddDocFromUrl, onDeleteDoc, onResetProgress,
  onSelectFolder, onSwitchFolder, onSetWpm, onSetFolderName,
  onToggleFavorite, onArchiveDoc, onUnarchiveDoc, onToggleFlap, onSettingsChange,
}: LibraryViewProps) {
  const { theme, setTheme } = useTheme();
  const [tab, setTab] = useState("all"); // "all" | "favorites" | "archived"
  const [showAdd, setShowAdd] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [rescanning, setRescanning] = useState(false);

  const handleRescan = async () => {
    setRescanning(true);
    try {
      await api.rescanFolder();
    } finally {
      setRescanning(false);
    }
  };
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editFolder, setEditFolder] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchIndex, setSearchIndex] = useState(-1);
  const [sortBy, setSortBy] = useState("progress"); // "progress" | "alpha" | "newest" | "oldest"
  const [typeFilter, setTypeFilter] = useState<"all" | "articles" | "books" | "pdfs">("all");
  const [updateReady, setUpdateReady] = useState<string | null>(null);
  const [launchAtLogin, setLaunchAtLogin] = useState(false);

  useEffect(() => {
    const unsub = api.onUpdateDownloaded?.((version) => setUpdateReady(version));
    return () => unsub?.();
  }, []);

  useEffect(() => {
    if (settings.theme && settings.theme !== theme) setTheme(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    api.getLaunchAtLogin?.().then((v) => setLaunchAtLogin(v));
  }, []);

  const isPdf = (d: BlurbyDoc) => d.ext === ".pdf";
  const isArticle = (d: BlurbyDoc) => d.source === "url" || d.source === "manual";
  const isBook = (d: BlurbyDoc) => !isArticle(d) && !isPdf(d);

  // Filter and sort library
  const getFilteredAndSorted = () => {
    let docs = library;
    if (tab === "favorites") docs = docs.filter((d) => d.favorite);
    else if (tab === "archived") docs = docs.filter((d) => d.archived);
    else docs = docs.filter((d) => !d.archived);
    // Type filter
    if (typeFilter === "articles") docs = docs.filter(isArticle);
    else if (typeFilter === "books") docs = docs.filter(isBook);
    else if (typeFilter === "pdfs") docs = docs.filter(isPdf);
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
  const articleCount = activeLibrary.filter(isArticle).length;
  const bookCount = activeLibrary.filter(isBook).length;
  const pdfCount = activeLibrary.filter(isPdf).length;

  // Live search results (limited to 8 for the dropdown)
  const searchResults = searchQuery
    ? library.filter((d) => {
        const q = searchQuery.toLowerCase();
        return d.title.toLowerCase().includes(q) || (d.author || "").toLowerCase().includes(q);
      }).slice(0, 8)
    : [];

  const capitalizeFirst = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  // Split filtered docs into reading now vs not started
  const readingNow = filteredLibrary.filter((d) => (d.position || 0) > 0 && (d.wordCount ? (d.position || 0) < d.wordCount : true));
  const notStarted = filteredLibrary.filter((d) => (d.position || 0) === 0);

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
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <button className="hamburger-btn" onClick={onToggleFlap} aria-label="Open menu" title="Menu (Tab)" style={{ marginTop: 6 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
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
          </div>
          <div className="library-actions">
            <button
              className="view-toggle-btn btn"
              title={settings.viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
              aria-label={settings.viewMode === "grid" ? "List view" : "Grid view"}
              onClick={() => onSettingsChange({ viewMode: settings.viewMode === "grid" ? "list" : "grid" })}
            >
              {settings.viewMode === "grid" ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
              )}
            </button>
            <button onClick={() => setShowStats(!showStats)} className="btn" title="Reading stats" aria-label="Show reading statistics">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: -1 }}>
                <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
              </svg>
            </button>
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
            <button
              onClick={handleRescan}
              disabled={!settings.sourceFolder || rescanning}
              className="btn"
              aria-label="Rescan folder"
              title="Rescan folder for new items and covers"
            >
              {rescanning ? "..." : "⟳"}
            </button>
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
          <span className="library-tab-divider" />
          <button
            className={`library-tab${typeFilter === "all" ? " library-tab-active" : ""}`}
            onClick={() => setTypeFilter("all")}
            role="tab"
            aria-selected={typeFilter === "all"}
          >all types</button>
          <button
            className={`library-tab${typeFilter === "articles" ? " library-tab-active" : ""}`}
            onClick={() => setTypeFilter("articles")}
            role="tab"
            aria-selected={typeFilter === "articles"}
          >articles ({articleCount})</button>
          <button
            className={`library-tab${typeFilter === "books" ? " library-tab-active" : ""}`}
            onClick={() => setTypeFilter("books")}
            role="tab"
            aria-selected={typeFilter === "books"}
          >books ({bookCount})</button>
          <button
            className={`library-tab${typeFilter === "pdfs" ? " library-tab-active" : ""}`}
            onClick={() => setTypeFilter("pdfs")}
            role="tab"
            aria-selected={typeFilter === "pdfs"}
          >PDFs ({pdfCount})</button>
        </div>

        {showStats && <StatsPanel wpm={wpm} onClose={() => setShowStats(false)} />}

        {/* Search bar and sort */}
        {library.length > 3 && (
          <div className="library-search-wrap">
            <div className="search-container">
              <input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchIndex(-1); }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                onKeyDown={(e) => {
                  if (!searchQuery || !searchFocused || searchResults.length === 0) return;
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSearchIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSearchIndex((prev) => Math.max(prev - 1, -1));
                  } else if (e.key === "Enter" && searchIndex >= 0) {
                    e.preventDefault();
                    onOpenDoc(searchResults[searchIndex]);
                    setSearchQuery("");
                    setSearchIndex(-1);
                  } else if (e.key === "Escape") {
                    setSearchQuery("");
                    setSearchIndex(-1);
                  }
                }}
                className="library-search"
                aria-label="Search library"
              />
              {searchQuery && searchFocused && (
                <div className="search-dropdown">
                  {searchResults.length > 0 ? (
                    searchResults.map((doc, idx) => (
                      <div
                        key={doc.id}
                        className={`search-result-item${idx === searchIndex ? " search-result-active" : ""}`}
                        onMouseDown={() => { onOpenDoc(doc); setSearchQuery(""); setSearchIndex(-1); }}
                      >
                        <span className="search-result-title">{capitalizeFirst(doc.title)}</span>
                        {doc.author && <span className="search-result-author">{doc.author}</span>}
                        <span className="search-result-meta">{doc.ext?.slice(1) || doc.source}</span>
                      </div>
                    ))
                  ) : (
                    <div className="search-result-empty">No results</div>
                  )}
                </div>
              )}
            </div>
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

        {/* Document list / grid — sectioned by Reading Now / Not Started */}
        {settings.viewMode === "grid" ? (
          <>
            {readingNow.length > 0 && (
              <>
                <div className="library-section-label">Reading Now</div>
                <div className="doc-grid" role="list">
                  {readingNow.map((doc) => (
                    <DocGridCard key={doc.id} doc={doc} onOpen={onOpenDoc} />
                  ))}
                </div>
              </>
            )}
            {notStarted.length > 0 && (
              <>
                <div className="library-section-label">Not Started</div>
                <div className="doc-grid" role="list">
                  {notStarted.map((doc) => (
                    <DocGridCard key={doc.id} doc={doc} onOpen={onOpenDoc} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {readingNow.length > 0 && (
              <>
                <div className="library-section-label">Reading Now</div>
                <div className="doc-list" role="list">
                  {readingNow.map((doc) => (
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
              </>
            )}
            {notStarted.length > 0 && (
              <>
                <div className="library-section-label">Not Started</div>
                <div className="doc-list" role="list">
                  {notStarted.map((doc) => (
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
              </>
            )}
          </>
        )}

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
