interface DeleteConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmation({ onConfirm, onCancel }: DeleteConfirmationProps) {
  return (
    <div className="delete-confirm">
      <span className="delete-confirm-label">Delete?</span>
      <button onClick={onConfirm} className="delete-confirm-yes">yes</button>
      <button onClick={onCancel} className="btn delete-confirm-no">no</button>
    </div>
  );
}
