import { memo, useState, useEffect } from "react";
import { formatTime, formatDisplayTitle } from "../utils/text";
import { BlurbyDoc } from "../types";
import { bubbleCount } from "../utils/queue";
import { formatBookDataLine } from "../utils/bookData";
import Badge from "./Badge";
import IconBtn from "./IconBtn";
import DeleteConfirmation from "./DeleteConfirmation";
import { triggerCoachHint } from "./HotkeyCoach";

const TYPE_COLORS: Record<string, string> = {
  epub: "#6b9f6b",
  pdf: "#c47882",
  mobi: "#9b82c4",
  azw3: "#c4a882",
  txt: "#8a8a8a",
  md: "#82c4a8",
  html: "#5ba8a0",
  htm: "#5ba8a0",
  url: "#5b8fb9",
};

// List-view thumbnail for cover images (60x60)
function CoverThumbnail({ coverPath, title }: { coverPath: string; title: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    window.electronAPI.getCoverImage(coverPath).then((s) => { if (s) setSrc(s); });
  }, [coverPath]);
  if (!src) return null;
  return <img src={src} alt={`Cover of ${title}`} className="doc-card-thumbnail" />;
}

// Format APA-style subtext for URL-imported articles
function formatApaSubtext(doc: BlurbyDoc): string | null {
  if (doc.source !== "url") return null;
  const parts: string[] = [];
  if (doc.authorFull) {
    parts.push(doc.authorFull);
  }
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

interface DocCardProps {
  doc: BlurbyDoc;
  wpm: number;
  confirmDelete: string | null;
  onOpen: (doc: BlurbyDoc, mode?: string) => void;
  onReset: (id: string) => void;
  onEdit: (doc: BlurbyDoc) => void;
  onDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
  onToggleFavorite: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onOpenScroll?: (doc: BlurbyDoc) => void;
  onOpenNewWindow?: (doc: BlurbyDoc) => void;
  focused?: boolean;
  selected?: boolean;
  selectionMode?: boolean;
  onToggleSelect?: (id: string) => void;
  onAddToQueue?: (id: string) => void;
  onRemoveFromQueue?: (id: string) => void;
  /** NAR-4: Whether this book's TTS audio is fully cached */
  ttsCached?: boolean;
}

const DocCard = memo(function DocCard({ doc, wpm, confirmDelete, onOpen, onReset, onEdit, onDelete, onConfirmDelete, onCancelDelete, onToggleFavorite, onArchive, onUnarchive, onOpenScroll, onOpenNewWindow, focused, selected, selectionMode, onToggleSelect, onAddToQueue, onRemoveFromQueue, ttsCached }: DocCardProps) {
  const wordCount = doc.wordCount || 0;
  const pos = doc.position || 0;
  const rawPct = wordCount > 0 ? (pos / wordCount) * 100 : 0;
  const progress = Math.round(rawPct);
  const isComplete = pos >= wordCount - 1 && wordCount > 0;
  const readTime = formatTime(wordCount, wpm);
  const typeLabel = doc.source === "url" ? (doc.sourceDomain || "web") : doc.ext ? doc.ext.slice(1) : doc.source;
  const typeColor = TYPE_COLORS[typeLabel] || "#c4a882";
  const apaSubtext = formatApaSubtext(doc);

  return (
    <div className="doc-card-wrapper" role="listitem">
      <div
        onClick={() => onOpen(doc)}
        className={`doc-card${doc.archived ? " doc-card-archived" : ""}${focused ? " doc-card-focused" : ""}${selected ? " doc-card-selected" : ""}${doc.unread ? " doc-card-unread" : ""}`}
        role="button"
        tabIndex={focused ? 0 : -1}
        onKeyDown={(e) => e.key === "Enter" && onOpen(doc)}
        aria-label={`${doc.title}${doc.author ? ` by ${doc.author}` : ""}, ${wordCount} words, ${readTime}${isComplete ? ", completed" : pos > 0 ? `, ${progress}% read` : ""}${doc.favorite ? ", favorite" : ""}${doc.unread ? ", unread" : ""}`}
        data-doc-id={doc.id}
      >
        {/* NAR-4: Cache indicator */}
        {ttsCached && <span className="doc-card-cached-badge" title="Narration cached" aria-label="Narration cached">✓</span>}
        {/* Selection checkbox */}
        {selectionMode && onToggleSelect && (
          <div className="doc-card-checkbox" onClick={(e) => { e.stopPropagation(); onToggleSelect(doc.id); }}>
            <input type="checkbox" checked={selected || false} readOnly aria-label={`Select ${doc.title}`} tabIndex={-1} />
          </div>
        )}
        {/* List-view thumbnail (21D) — cover image or monogram fallback */}
        {doc.coverPath ? (
          <CoverThumbnail coverPath={doc.coverPath} title={doc.title} />
        ) : (
          <div className="doc-card-monogram" aria-hidden="true">
            {(doc.title || "?")[0].toUpperCase()}
          </div>
        )}
        <div className="doc-card-content">
          <div className="doc-card-header">
            {doc.unread && <span className="doc-card-unread-dot" aria-hidden="true" />}
            {doc.favorite && <span className="doc-card-fav-star" title="Favorite">*</span>}
            <span className={`doc-card-title${doc.unread ? " doc-card-title-bold" : ""}`}>{formatDisplayTitle(doc.title)}</span>
            {doc.source !== "url" && doc.author && <span className="doc-card-author">{doc.author}</span>}
            {typeLabel && <Badge color={typeColor}>{typeLabel}</Badge>}
            {doc.filename?.toLowerCase().includes("blurby highlights") && <Badge color="var(--accent)">highlights</Badge>}
            {doc.archived && <Badge color="var(--text-dimmer)">archived</Badge>}
            {isComplete && !doc.archived && <Badge color="var(--success)">done</Badge>}
          </div>
          {apaSubtext && <div className="doc-card-apa-subtext">{apaSubtext}</div>}
          <div className="doc-card-meta">
            <span>{wordCount > 0 ? formatBookDataLine(wordCount, pos) : readTime}</span>
            <span className="bubble-progress" role="meter" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${progress}% read`}>
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} className={`bubble-progress-dot${i < bubbleCount(progress) ? " filled" : ""}`} aria-hidden="true" />
              ))}
              <span className="bubble-progress-label">{progress}%</span>
            </span>
          </div>
        </div>

        <div className="doc-card-actions" onClick={(e) => e.stopPropagation()}>
          {doc.queuePosition !== undefined ? (
            onRemoveFromQueue && <button
              className="icon-btn"
              onClick={() => onRemoveFromQueue(doc.id)}
              title="Remove from Queue"
              aria-label="Remove from reading queue"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          ) : (
            onAddToQueue && <button
              className="icon-btn"
              onClick={() => onAddToQueue(doc.id)}
              title="Add to Queue"
              aria-label="Add to reading queue"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}
          <button
            className={`icon-btn doc-fav-btn${doc.favorite ? " doc-fav-btn-active" : ""}`}
            onClick={() => { triggerCoachHint("favorite"); onToggleFavorite(doc.id); }}
            title={doc.favorite ? "Unfavorite" : "Favorite"}
            aria-label={doc.favorite ? "Remove from favorites" : "Add to favorites"}
          >*</button>
          {onOpenScroll && (
            <button
              className="icon-btn"
              onClick={() => onOpenScroll(doc)}
              title="Read (scroll)"
              aria-label="Open in scroll reader"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </button>
          )}
          {onOpenNewWindow && (
            <button
              className="icon-btn"
              onClick={() => onOpenNewWindow(doc)}
              title="Open in new window"
              aria-label="Open in new window"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M14 9l3 3-3 3" />
              </svg>
            </button>
          )}
          {pos > 0 && <IconBtn onClick={() => onReset(doc.id)} title="Reset" icon="reset" />}
          {doc.source !== "folder" && doc.source !== "url" && <IconBtn onClick={() => onEdit(doc)} title="Edit" icon="edit" />}
          {doc.archived ? (
            <button
              className="icon-btn"
              onClick={() => { triggerCoachHint("archive"); onUnarchive(doc.id); }}
              title="Unarchive"
              aria-label="Restore from archive"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </button>
          ) : (
            !isComplete && (
              <button
                className="icon-btn"
                onClick={() => { triggerCoachHint("archive"); onArchive(doc.id); }}
                title="Archive"
                aria-label="Archive document"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />
                </svg>
              </button>
            )
          )}
          <IconBtn onClick={() => { triggerCoachHint("delete"); onConfirmDelete(doc.id); }} title="Delete" icon="delete" danger />
        </div>
      </div>

      {confirmDelete === doc.id && (
        <DeleteConfirmation
          onConfirm={() => onDelete(doc.id)}
          onCancel={onCancelDelete}
        />
      )}
    </div>
  );
});

export default DocCard;
