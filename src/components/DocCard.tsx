import { formatTime } from "../utils/text";
import Badge from "./Badge";
import IconBtn from "./IconBtn";
import DeleteConfirmation from "./DeleteConfirmation";

export default function DocCard({ doc, wpm, confirmDelete, onOpen, onReset, onEdit, onDelete, onConfirmDelete, onCancelDelete }) {
  const wordCount = doc.wordCount || 0;
  const pos = doc.position || 0;
  const progress = wordCount > 0 ? Math.round((pos / wordCount) * 100) : 0;
  const isComplete = pos >= wordCount - 1 && wordCount > 0;
  const readTime = formatTime(wordCount, wpm);

  return (
    <div style={{ position: "relative" }} role="listitem">
      <div
        onClick={() => onOpen(doc)}
        className="doc-card"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onOpen(doc)}
        aria-label={`${doc.title}, ${wordCount} words, ${readTime}${isComplete ? ", completed" : pos > 0 ? `, ${progress}% read` : ""}`}
      >
        <div className="doc-card-content">
          <div className="doc-card-header">
            <span className="doc-card-title">{doc.title}</span>
            {doc.source === "folder" && <Badge color="#c4a882">file</Badge>}
            {doc.source === "url" && <Badge color="#6b9fd4">url</Badge>}
            {doc.ext && [".epub", ".pdf", ".html", ".htm"].includes(doc.ext) && <Badge color="#7b8fa8">{doc.ext.slice(1)}</Badge>}
            {isComplete && <Badge color="var(--success)">done</Badge>}
          </div>
          <div className="doc-card-meta">
            <span>{wordCount.toLocaleString()} words</span>
            <span>{readTime}</span>
            {doc.ext && ![".epub", ".pdf", ".html", ".htm"].includes(doc.ext) && <span>{doc.ext}</span>}
            {pos > 0 && !isComplete && <span className="doc-card-progress">{progress}%</span>}
          </div>
        </div>

        <div className="doc-card-actions" onClick={(e) => e.stopPropagation()}>
          {pos > 0 && <IconBtn onClick={() => onReset(doc.id)} title="Reset" icon="reset" />}
          {doc.source !== "folder" && doc.source !== "url" && <IconBtn onClick={() => onEdit(doc)} title="Edit" icon="edit" />}
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
