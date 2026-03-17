export default function AddEditPanel({ newTitle, newText, editingId, onTitleChange, onTextChange, onSave, onCancel }) {
  return (
    <div className="add-edit-panel">
      <input
        autoFocus
        placeholder="Title"
        value={newTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        className="add-edit-title"
      />
      <textarea
        placeholder="Paste your reading material here..."
        value={newText}
        onChange={(e) => onTextChange(e.target.value)}
        rows={8}
        className="add-edit-textarea"
      />
      <div className="add-edit-actions">
        <button onClick={onCancel} className="btn">cancel</button>
        <button
          onClick={onSave}
          disabled={!newTitle.trim() || !newText.trim()}
          className="btn-fill"
          style={{ opacity: newTitle.trim() && newText.trim() ? 1 : 0.3 }}
        >{editingId ? "save" : "add"}</button>
      </div>
    </div>
  );
}
