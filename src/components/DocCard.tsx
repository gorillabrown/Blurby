import { formatTime, formatDisplayTitle } from "../utils/text";
import { BlurbyDoc } from "../types";
import { bubbleCount } from "../utils/queue";
import Badge from "./Badge";
import IconBtn from "./IconBtn";
import DeleteConfirmation from "./DeleteConfirmation";

const TYPE_COLORS: Record<string, string> = {
  epub: "#5b8fb9",
  pdf: "#c47882",
  mobi: "#9b82c4",
  azw3: "#6b9f6b",
  txt: "#c4a882",
  md: "#82c4a8",
  html: "#5ba8a0",
  htm: "#5ba8a0",
  url: "#6b9fd4",
};

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
}

export default function DocCard({ doc, wpm, confirmDelete, onOpen, onReset, onEdit, onDelete, onConfirmDelete, onCancelDelete, onToggleFavorite, onArchive, onUnarchive, onOpenScroll, onOpenNewWindow }: DocCardProps) {
  const wordCount = doc.wordCount || 0;
  const pos = doc.position || 0;
  const progress = wordCount > 0 ? Math.round((pos / wordCount) * 100) : 0;
  const isComplete = pos >= wordCount - 1 && wordCount > 0;
  const readTime = formatTime(wordCount, wpm);
  const typeLabel = doc.source === "url" ? "url" : doc.ext ? doc.ext.slice(1) : doc.source;
  const typeColor = TYPE_COLORS[typeLabel] || "#c4a882";

  return (
    <div style={{ position: "relative" }} role="listitem">
      <div
        onClick={() => onOpen(doc)}
        className={`doc-card${doc.archived ? " doc-card-archived" : ""}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onOpen(doc)}
        aria-label={`${doc.title}${doc.author ? ` by ${doc.author}` : ""}, ${wordCount} words, ${readTime}${isComplete ? ", completed" : pos > 0 ? `, ${progress}% read` : ""}${doc.favorite ? ", favorite" : ""}`}
      >
        <div className="doc-card-content">
          <div className="doc-card-header">
            {doc.favorite && <span className="doc-card-fav-star" title="Favorite">*</span>}
            <span className="doc-card-title">{formatDisplayTitle(doc.title)}</span>
            {doc.author && <span className="doc-card-author">{doc.author}</span>}
            {typeLabel && <Badge color={typeColor}>{typeLabel}</Badge>}
            {doc.archived && <Badge color="var(--text-dimmer)">archived</Badge>}
            {isComplete && !doc.archived && <Badge color="var(--success)">done</Badge>}
          </div>
          <div className="doc-card-meta">
            <span>{wordCount.toLocaleString()} words</span>
            <span>{readTime}</span>
            <span className="bubble-progress">
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} className={`bubble-progress-dot${i < bubbleCount(progress) ? " filled" : ""}`} />
              ))}
              <span className="bubble-progress-label">{progress}%</span>
            </span>
          </div>
        </div>

        <div className="doc-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className={`icon-btn doc-fav-btn${doc.favorite ? " doc-fav-btn-active" : ""}`}
            onClick={() => onToggleFavorite(doc.id)}
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M14 9l3 3-3 3" />
              </svg>
            </button>
          )}
          {pos > 0 && <IconBtn onClick={() => onReset(doc.id)} title="Reset" icon="reset" />}
          {doc.source !== "folder" && doc.source !== "url" && <IconBtn onClick={() => onEdit(doc)} title="Edit" icon="edit" />}
          {doc.archived ? (
            <button
              className="icon-btn"
              onClick={() => onUnarchive(doc.id)}
              title="Unarchive"
              aria-label="Restore from archive"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </button>
          ) : (
            !isComplete && (
              <button
                className="icon-btn"
                onClick={() => onArchive(doc.id)}
                title="Archive"
                aria-label="Archive document"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />
                </svg>
              </button>
            )
          )}
          <IconBtn onClick={() => onConfirmDelete(doc.id)} title="Delete" icon="delete" danger />
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
}
