import { useState, useEffect, useCallback, useRef } from "react";
import { HOTKEY_COACH_DISMISS_MS } from "../constants";

const COACH_STORAGE_KEY = "blurby_hotkey_coach_shown";

interface CoachHint {
  action: string;
  hotkey: string;
}

// Map of mouse-clickable actions to their keyboard equivalents
const COACH_HINTS: Record<string, CoachHint> = {
  archive: { action: "archive", hotkey: "E" },
  favorite: { action: "favorite", hotkey: "S" },
  star: { action: "star", hotkey: "S" },
  search: { action: "search", hotkey: "/" },
  delete: { action: "delete", hotkey: "#" },
  queue: { action: "queue", hotkey: "Q" },
  settings: { action: "settings", hotkey: "Ctrl+," },
};

function getShownHints(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(COACH_STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function markHintShown(action: string) {
  try {
    const shown = getShownHints();
    shown.add(action);
    localStorage.setItem(COACH_STORAGE_KEY, JSON.stringify([...shown]));
  } catch {
    // ignore
  }
}

/** Call this from click handlers to trigger a coaching toast. */
export function triggerCoachHint(action: string) {
  window.dispatchEvent(new CustomEvent("blurby:coach-hint", { detail: action }));
}

export default function HotkeyCoach() {
  const [hint, setHint] = useState<CoachHint | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHintEvent = useCallback((e: Event) => {
    const action = (e as CustomEvent).detail as string;
    const coachHint = COACH_HINTS[action];
    if (!coachHint) return;

    const shown = getShownHints();
    if (shown.has(action)) return;

    markHintShown(action);
    setHint(coachHint);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setHint(null), HOTKEY_COACH_DISMISS_MS);
  }, []);

  useEffect(() => {
    window.addEventListener("blurby:coach-hint", handleHintEvent);
    return () => {
      window.removeEventListener("blurby:coach-hint", handleHintEvent);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleHintEvent]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (timerRef.current) clearTimeout(timerRef.current);
        setHint(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!hint) return null;

  return (
    <div
      className="hotkey-coach"
      role="status"
      aria-live="polite"
      onClick={() => setHint(null)}
    >
      Next time try <kbd className="hotkey-coach-key">{hint.hotkey}</kbd> to {hint.action} faster
    </div>
  );
}
