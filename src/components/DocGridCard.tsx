import { useState, useEffect, useCallback, memo } from "react";
import { BlurbyDoc } from "../types";
import { formatDisplayTitle } from "../utils/text";
import { triggerCoachHint } from "./HotkeyCoach";
import { formatBookDataLine } from "../utils/bookData";

interface DocGridCardProps {
  doc: BlurbyDoc;
  onOpen: (doc: BlurbyDoc) => void;
  onToggleFavorite?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onResetProgress?: (id: string) => void;
  onEditMetadata?: (doc: BlurbyDoc) => void;
  focused?: boolean;
  selected?: boolean;
  selectionMode?: boolean;
  onToggleSelect?: (id: string) => void;
  onAddToQueue?: (id: string) => void;
  onRemoveFromQueue?: (id: string) => void;
  /** NAR-4: Whether this book's TTS audio is fully cached */
  ttsCached?: boolean;
}

// Format APA subtext for URL-imported articles
function formatApaSubtext(doc: BlurbyDoc): string | null {
  if (doc.source !== "url") return null;
  const parts: string[] = [];
  if (doc.authorFull) parts.push(doc.authorFull);
  const dateStr = doc.publishedDate || (doc.created ? new Date(doc.created).toISOString() : null);
  if (dateStr) {
    try {
      const d = new Date(dateStr);
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      parts.push(`(${d.getFullYear()}, ${months[d.getMonth()]} ${d.getDate()}).`);
    } catch {
      parts.push("(n.d.).");
    }
  }
  if (doc.sourceDomain) parts.push(doc.sourceDomain + ".");
  return parts.length > 0 ? parts.join(" ") : null;
}

const DocGridCard = memo(function DocGridCard({ doc, onOpen, onToggleFavorite, onArchive, onDelete, onResetProgress, onEditMetadata, focused, selected, selectionMode, onToggleSelect, onAddToQueue, onRemoveFromQueue, ttsCached }: DocGridCardProps) {
  const [coverSrc, setCoverSrc] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  // Close context menu on any click
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    window.addEventListener("contextmenu", close);
    return () => { window.removeEventListener("click", close); window.removeEventListener("contextmenu", close); };
  }, [contextMenu]);

  useEffect(() => {
    if (!doc.coverPath) return;
    window.electronAPI.getCoverImage(doc.coverPath).then((src) => {
      if (src) setCoverSrc(src);
    });
  }, [doc.coverPath]);

  const ext = doc.ext ? doc.ext.slice(1).toUpperCase() : (doc.source === "url" ? (doc.sourceDomain || "WEB") : "TXT");
  const rawPct = doc.wordCount > 0 ? ((doc.position || 0) / doc.wordCount) * 100 : 0;
  const progress = rawPct > 0 && rawPct < 1 ? 1 : Math.round(rawPct);
  const isComplete = (doc.position || 0) >= doc.wordCount - 1 && doc.wordCount > 0;
  const apaSubtext = formatApaSubtext(doc);
  const isUrlDoc = doc.source === "url";

  return (
    <div
      className={`doc-grid-card${focused ? " doc-grid-card-focused" : ""}${selected ? " doc-grid-card-selected" : ""}${doc.unread ? " doc-grid-card-unread" : ""}`}
      onClick={() => onOpen(doc)}
      onContextMenu={handleContextMenu}
      role="button"
      tabIndex={focused ? 0 : -1}
      onKeyDown={(e) => e.key === "Enter" && onOpen(doc)}
      aria-label={`${doc.title}${doc.author ? `, by ${doc.author}` : ""}${isComplete ? ", completed" : progress > 0 ? `, ${progress}% read` : ""}${doc.unread ? ", unread" : ""}`}
      data-doc-id={doc.id}
    >
      {/* NAR-4: Cache indicator */}
      {ttsCached && <span className="doc-card-cached-badge" title="Narration cached" aria-label="Narration cached">✓</span>}
      {/* Context menu (right-click) */}
      {contextMenu && (
        <div
          className="doc-context-menu"
          style={{ position: "fixed", left: contextMenu.x, top: contextMenu.y, zIndex: 10000 }}
          onClick={(e) => e.stopPropagation()}
        >
          {onResetProgress && (
            <button onClick={() => { onResetProgress(doc.id); setContextMenu(null); }}>
              Reset Progress
            </button>
          )}
          {onEditMetadata && (
            <button onClick={() => { onEditMetadata(doc); setContextMenu(null); }}>
              Edit Metadata
            </button>
          )}
          {doc.queuePosition !== undefined ? (
            <button onClick={() => { if (onRemoveFromQueue) onRemoveFromQueue(doc.id); setContextMenu(null); }}>
              Remove from Queue
            </button>
          ) : (
            <button onClick={() => { if (onAddToQueue) onAddToQueue(doc.id); setContextMenu(null); }}>
              Add to Queue
            </button>
          )}
          <div className="doc-context-menu-divider" />
          {onDelete && !confirmDelete && (
            <button onClick={() => setConfirmDelete(true)} className="doc-context-menu-danger">
              Delete
            </button>
          )}
          {onDelete && confirmDelete && (
            <div className="doc-context-menu-confirm">
              <span>Delete this book and its file?</span>
              <div className="doc-grid-confirm-btns">
                <button onClick={() => { onDelete(doc.id); setContextMenu(null); setConfirmDelete(false); }} className="doc-context-menu-danger">
                  Yes, delete
                </button>
                <button onClick={() => setConfirmDelete(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Selection checkbox */}
      {selectionMode && onToggleSelect && (
        <div className="doc-grid-checkbox" onClick={(e) => { e.stopPropagation(); onToggleSelect(doc.id); }}>
          <input type="checkbox" checked={selected} readOnly aria-label={`Select ${doc.title}`} tabIndex={-1} />
        </div>
      )}
      <div className="doc-grid-cover">
        {coverSrc ? (
          <img src={coverSrc} alt={`Cover of ${doc.title}`} className={`doc-grid-cover-img${isUrlDoc ? " doc-grid-cover-hero" : ""}`} />
        ) : isUrlDoc ? (
          /* Monogram placeholder for URL docs without lead image */
          <div className="doc-grid-monogram" aria-hidden="true">
            {(doc.sourceDomain || doc.title || "?")[0].toUpperCase()}
          </div>
        ) : (
          <div className="doc-grid-cover-placeholder">
            <div className="doc-grid-placeholder-banner">
              <span className="doc-grid-placeholder-title">{formatDisplayTitle(doc.title)}</span>
            </div>
          </div>
        )}
        {progress > 0 && !isComplete && (
          <div className="doc-grid-progress-bar">
            <div className="doc-grid-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
        {isComplete && <div className="doc-grid-done-badge" aria-hidden="true">done</div>}
        {doc.favorite && <div className="doc-grid-fav-star" aria-hidden="true">*</div>}
        {/* File type badge (21E) */}
        <div className="doc-grid-type-badge" aria-hidden="true">{ext.toLowerCase()}</div>
        {doc.unread && <div className="doc-grid-unread-dot" aria-hidden="true" />}
        <div className="doc-grid-actions">
          {onToggleFavorite && (
            <button onClick={(e) => { e.stopPropagation(); triggerCoachHint("favorite"); onToggleFavorite(doc.id); }} title={doc.favorite ? "Unfavorite" : "Favorite"} aria-label={doc.favorite ? "Remove from favorites" : "Add to favorites"}>
              {doc.favorite ? "\u2605" : "\u2606"}
            </button>
          )}
          {onArchive && (
            <button onClick={(e) => { e.stopPropagation(); triggerCoachHint("archive"); onArchive(doc.id); }} title="Archive" aria-label="Archive document">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="doc-grid-info">
        <div className={`doc-grid-title${doc.unread ? " doc-grid-title-bold" : ""}`}>{formatDisplayTitle(doc.title)}</div>
        {/* Line 2: APA subtext for URL-imported docs, regular author for books */}
        {apaSubtext ? (
          <div className="doc-grid-apa-subtext">{apaSubtext}</div>
        ) : (
          <div className="doc-grid-author">{doc.author || "\u00A0"}</div>
        )}
        {/* Line 3: Book data — progress/pages/time */}
        {doc.wordCount > 0 && (
          <div className="doc-grid-bookdata">{formatBookDataLine(doc.wordCount, doc.position || 0)}</div>
        )}
      </div>
    </div>
  );
});

export default DocGridCard;
