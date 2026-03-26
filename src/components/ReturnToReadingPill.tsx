import { useEffect } from "react";

interface ReturnToReadingPillProps {
  visible: boolean;
  activeOverlay: boolean; // true if command palette, dialog, etc. is open
  onReturn: () => void;
}

export default function ReturnToReadingPill({ visible, activeOverlay, onReturn }: ReturnToReadingPillProps) {
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (activeOverlay) return; // Don't consume Enter if another overlay is active
      if (e.key === "Enter") {
        e.preventDefault();
        onReturn();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, activeOverlay, onReturn]);

  if (!visible) return null;

  return (
    <button className="return-to-reading-pill" onClick={onReturn}>
      Return to reading
    </button>
  );
}
