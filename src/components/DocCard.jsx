import { tokenize, formatTime } from "../utils/text";
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
    <div style={{ position: "relative" }}>
      <div
        onClick={() => onOpen(doc)}
        className="doc-card"
      >
        <div className="doc-card-content">
          <div className="doc-card-header">
            <span className="doc-card-title">{doc.title}</span>
            {doc.source === "folder" && <Badge color="#c4a882">file</Badge>}
            {isComplete && <Badge color="var(--success)">done</Badge>}
          </div>
          <div className="doc-card-meta">
            <span>{wordCount.toLocaleString()} words</span>
            <span>{readTime}</span>
            {doc.ext && <span>{doc.ext}</span>}
            {pos > 0 && !isComplete && <span className="doc-card-progress">{progress}%</span>}
          </div>
        </div>

        <div className="doc-card-actions" onClick={(e) => e.stopPropagation()}>
          {pos > 0 && <IconBtn onClick={() => onReset(doc.id)} title="Reset" icon="reset" />}
          {doc.source !== "folder" && <IconBtn onClick={() => onEdit(doc)} title="Edit" icon="edit" />}
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
