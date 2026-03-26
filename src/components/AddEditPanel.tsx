interface AddEditPanelProps {
  newTitle: string;
  newText: string;
  editingId: string | null;
  onTitleChange: (value: string) => void;
  onTextChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  /** Metadata-only mode (file-based docs) — shows Title + Author, no content */
  metaMode?: boolean;
  newAuthor?: string;
  onAuthorChange?: (value: string) => void;
}

export default function AddEditPanel({ newTitle, newText, editingId, onTitleChange, onTextChange, onSave, onCancel, metaMode, newAuthor, onAuthorChange }: AddEditPanelProps) {
  const canSave = metaMode ? newTitle.trim().length > 0 : (newTitle.trim().length > 0 && newText.trim().length > 0);

  return (
    <div className="add-edit-panel">
      <input
        autoFocus
        placeholder="Title"
        value={newTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        className="add-edit-title"
        aria-label="Document title"
      />
      {metaMode ? (
        <input
          placeholder="Author (Last, First)"
          value={newAuthor || ""}
          onChange={(e) => onAuthorChange?.(e.target.value)}
          className="add-edit-title"
          aria-label="Document author"
          style={{ marginTop: 8 }}
        />
      ) : (
        <textarea
          placeholder="Paste your reading material here..."
          value={newText}
          onChange={(e) => onTextChange(e.target.value)}
          rows={8}
          className="add-edit-textarea"
          aria-label="Document content"
        />
      )}
      <div className="add-edit-actions">
        <button onClick={onCancel} className="btn">cancel</button>
        <button
          onClick={onSave}
          disabled={!canSave}
          className="btn-fill"
          style={{ opacity: canSave ? 1 : 0.3 }}
        >{editingId ? "save" : "add"}</button>
      </div>
    </div>
  );
}
