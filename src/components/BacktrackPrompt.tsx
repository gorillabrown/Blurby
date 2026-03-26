import { useEffect, useCallback } from "react";

interface BacktrackPromptProps {
  currentPage: number;
  furthestPage: number;
  onSaveAtCurrent: () => void;
  onKeepFurthest: () => void;
}

export default function BacktrackPrompt({
  currentPage,
  furthestPage,
  onSaveAtCurrent,
  onKeepFurthest,
}: BacktrackPromptProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onKeepFurthest();
      }
    },
    [onKeepFurthest]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  return (
    <div className="backtrack-prompt" role="dialog" aria-label="Save position">
      <button
        className="backtrack-prompt-btn backtrack-prompt-btn--secondary"
        onClick={onSaveAtCurrent}
        type="button"
      >
        Save at page {currentPage}
      </button>
      <button
        className="backtrack-prompt-btn backtrack-prompt-btn--primary"
        onClick={onKeepFurthest}
        autoFocus
        type="button"
      >
        Keep at page {furthestPage}
      </button>
    </div>
  );
}
