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

  // Split author into last/first for the two fields
  const authorParts = (newAuthor || "").split(",").map(s => s.trim());
  const authorLast = authorParts[0] || "";
  const authorFirst = authorParts.slice(1).join(", ").trim();

  const handleAuthorChange = (last: string, first: string) => {
    const combined = first ? `${last}, ${first}` : last;
    onAuthorChange?.(combined);
  };

  return (
    <div className="add-edit-panel">
      <label className="add-edit-label">Title</label>
      <input
        autoFocus
        placeholder="Book title"
        value={newTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        className="add-edit-title"
        aria-label="Document title"
      />
      {metaMode ? (
        <>
          <div className="add-edit-name-row">
            <div className="add-edit-name-col">
              <label className="add-edit-label">Last Name</label>
              <input
                placeholder="Last name"
                value={authorLast}
                onChange={(e) => handleAuthorChange(e.target.value, authorFirst)}
                className="add-edit-title"
                aria-label="Author last name"
              />
            </div>
            <div className="add-edit-name-col">
              <label className="add-edit-label">First Name</label>
              <input
                placeholder="First name"
                value={authorFirst}
                onChange={(e) => handleAuthorChange(authorLast, e.target.value)}
                className="add-edit-title"
                aria-label="Author first name"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <label className="add-edit-label add-edit-label--mt">Content</label>
          <textarea
            placeholder="Paste your reading material here..."
            value={newText}
            onChange={(e) => onTextChange(e.target.value)}
            rows={8}
            className="add-edit-textarea"
            aria-label="Document content"
          />
        </>
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
