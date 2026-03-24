import { useEffect, useState } from "react";
import { GOTO_INDICATOR_DISMISS_MS } from "../constants";

// GoToIndicator is a pure display component — it listens for a custom DOM event
// dispatched by useKeyboardShortcuts when a G-sequence is pending, rather than
// taking any props. This keeps it completely decoupled.

const GOTO_PENDING_EVENT = "blurby:goto-pending";
const GOTO_RESOLVED_EVENT = "blurby:goto-resolved";

// Utility exported for use by the keyboard hook to fire the events
export function dispatchGotoPending() {
  window.dispatchEvent(new CustomEvent(GOTO_PENDING_EVENT));
}

export function dispatchGotoResolved() {
  window.dispatchEvent(new CustomEvent(GOTO_RESOLVED_EVENT));
}

export default function GoToIndicator() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => setVisible(true);
    const hide = () => setVisible(false);

    window.addEventListener(GOTO_PENDING_EVENT, show);
    window.addEventListener(GOTO_RESOLVED_EVENT, hide);

    // Also hide on keydown that isn't a valid G-sequence continuation
    // (the hook fires goto-resolved, but a safety timeout guards against stale state)
    let timeout: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setVisible(false), GOTO_INDICATOR_DISMISS_MS);
    };
    window.addEventListener(GOTO_PENDING_EVENT, reset);

    return () => {
      window.removeEventListener(GOTO_PENDING_EVENT, show);
      window.removeEventListener(GOTO_RESOLVED_EVENT, hide);
      window.removeEventListener(GOTO_PENDING_EVENT, reset);
      clearTimeout(timeout);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="goto-indicator"
      role="status"
      aria-live="polite"
      aria-label="G-sequence pending — press a second key"
    >
      G&hellip;
    </div>
  );
}
