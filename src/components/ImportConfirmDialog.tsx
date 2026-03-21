import { useState } from "react";

interface ImportConfirmDialogProps {
  content: string;
  isUrl: boolean;
  onConfirm: (title: string) => void;
  onCancel: () => void;
}

export default function ImportConfirmDialog({ content, isUrl, onConfirm, onCancel }: ImportConfirmDialogProps) {
  const [title, setTitle] = useState(
    isUrl ? content : (content.slice(0, 40) + (content.length > 40 ? "..." : ""))
  );

  const preview = isUrl ? content : content.slice(0, 200) + (content.length > 200 ? "..." : "");

  return (
    <div className="import-confirm-overlay" onClick={onCancel}>
      <div className="import-confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="import-confirm-header">
          {isUrl ? "Import from URL?" : "Import selected text?"}
        </div>
        <div className="import-confirm-preview">{preview}</div>
        <input
          autoFocus
          className="import-confirm-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title..."
          onKeyDown={(e) => e.key === "Enter" && onConfirm(title)}
        />
        <div className="import-confirm-actions">
          <button onClick={onCancel} className="btn">cancel</button>
          <button onClick={() => onConfirm(title)} className="btn-fill">
            {isUrl ? "fetch & import" : "import"}
          </button>
        </div>
      </div>
    </div>
  );
}
