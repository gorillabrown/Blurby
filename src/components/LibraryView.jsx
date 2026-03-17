import { useState } from "react";
import { formatTime, MIN_WPM, MAX_WPM, WPM_STEP } from "../utils/text";
import HelpPanel from "./HelpPanel";
import AddEditPanel from "./AddEditPanel";
import DocCard from "./DocCard";

export default function LibraryView({
  library, settings, wpm, isMac, folderName, loadingContent,
  onOpenDoc, onAddDoc, onAddDocFromUrl, onDeleteDoc, onResetProgress, onSelectFolder,
  onSetWpm, wpmRef, onSetFolderName,
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editFolder, setEditFolder] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLibrary = library.filter((d) =>
    !searchQuery || d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalWords = library.reduce((a, d) => a + (d.wordCount || 0), 0);

  const handleAddDoc = async () => {
    if (!newTitle.trim() || !newText.trim()) return;
    await onAddDoc(newTitle.trim(), newText.trim(), editingId);
    setNewTitle("");
    setNewText("");
    setShowAdd(false);
    setEditingId(null);
  };

  const handleAddFromUrl = async () => {
    const url = urlInput.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      setUrlError("Please enter a valid URL.");
      return;
    }
    setUrlError("");
    const result = await onAddDocFromUrl(url);
    if (result?.error) {
      setUrlError(result.error);
    } else {
      setUrlInput("");
      setShowUrl(false);
      setUrlError("");
    }
  };

  const startEdit = (doc) => {
    setEditingId(doc.id);
    setNewTitle(doc.title);
    setNewText(doc.content || "");
    setShowAdd(true);
  };

  return (
    <div className="library-container">
      {/* Draggable titlebar */}
      <div className="library-titlebar" style={{ height: isMac ? 48 : 32 }} />

      {/* Loading overlay */}
      {loadingContent && (
        <div className="library-loading">
          <span className="library-loading-text">Loading document...</span>
        </div>
      )}

      {/* Scrollable content */}
      <div className="library-scroll">

        {/* Header */}
        <div className="library-header">
          <div>
            {editFolder ? (
              <input
                autoFocus
                value={folderName}
                onChange={(e) => onSetFolderName(e.target.value)}
                onBlur={() => setEditFolder(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditFolder(false)}
                className="library-folder-input"
              />
            ) : (
              <h1
                onClick={() => setEditFolder(true)}
                className="library-folder-title"
                title="Click to rename"
              >{folderName}</h1>
            )}
            <p className="library-stats">
              {library.length} {library.length === 1 ? "source" : "sources"}
              {totalWords > 0 && <> · {formatTime(totalWords, wpm)} total at {wpm} wpm</>}
              {settings.sourceFolder && <> · <span className="library-folder-name">{settings.sourceFolder.split(/[/\\]/).pop()}</span></>}
            </p>
          </div>
          <div className="library-actions">
            <button onClick={() => setShowHelp(!showHelp)} className="btn">?</button>
            <button onClick={onSelectFolder} className="btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6, verticalAlign: -1 }}>
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              folder
            </button>
            <button onClick={() => { setShowUrl(true); setUrlInput(""); setUrlError(""); }} className="btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6, verticalAlign: -1 }}>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              url
            </button>
            <button onClick={() => { setShowAdd(true); setEditingId(null); setNewTitle(""); setNewText(""); }} className="btn-fill">+ add</button>
          </div>
        </div>

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
            />
          </div>
        )}

        {/* URL input panel */}
        {showUrl && (
          <div className="add-edit-panel">
            <div className="url-input-row">
              <input
                autoFocus
                placeholder="Paste article URL..."
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleAddFromUrl()}
                className="library-search"
              />
              <button
                onClick={handleAddFromUrl}
                disabled={!urlInput.trim() || loadingContent}
                className="btn-fill"
                style={{ opacity: urlInput.trim() && !loadingContent ? 1 : 0.3, whiteSpace: "nowrap" }}
              >{loadingContent ? "fetching..." : "fetch"}</button>
              <button onClick={() => { setShowUrl(false); setUrlError(""); }} className="btn">cancel</button>
            </div>
            {urlError && <div className="url-error">{urlError}</div>}
          </div>
        )}

        {/* Add/Edit panel */}
        {showAdd && (
          <AddEditPanel
            newTitle={newTitle}
            newText={newText}
            editingId={editingId}
            onTitleChange={setNewTitle}
            onTextChange={setNewText}
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
            <p style={{ fontSize: 13 }}>Pick a source folder or add text manually to begin</p>
          </div>
        )}

        {/* Document list */}
        <div className="doc-list">
          {filteredLibrary.map((doc) => (
            <DocCard
              key={doc.id}
              doc={doc}
              wpm={wpm}
              confirmDelete={confirmDelete}
              onOpen={onOpenDoc}
              onReset={onResetProgress}
              onEdit={startEdit}
              onDelete={onDeleteDoc}
              onConfirmDelete={setConfirmDelete}
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
            />
            <span className="library-speed-label">{wpm} wpm</span>
          </div>
          {settings.sourceFolder && (
            <button onClick={onSelectFolder} className="btn library-change-folder">
              change folder
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
