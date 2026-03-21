interface DeleteConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmation({ onConfirm, onCancel }: DeleteConfirmationProps) {
  return (
    <div className="delete-confirm" role="alertdialog" aria-label="Confirm deletion">
      <span className="delete-confirm-label">Delete?</span>
      <button onClick={onConfirm} className="delete-confirm-yes" aria-label="Confirm delete">yes</button>
      <button onClick={onCancel} className="btn delete-confirm-no" aria-label="Cancel delete">no</button>
    </div>
  );
}
