import { useState, useEffect } from "react";
import { EINK_REFRESH_PHASE_MS } from "../constants";

/**
 * Full-screen black→white flash overlay for e-ink ghosting prevention.
 * Mounts briefly (200ms total: 100ms black, 100ms white) then unmounts.
 */
export default function EinkRefreshOverlay() {
  const [phase, setPhase] = useState<"black" | "white">("black");

  useEffect(() => {
    const timer = setTimeout(() => setPhase("white"), EINK_REFRESH_PHASE_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`eink-refresh-overlay eink-refresh-overlay--${phase}`}
      aria-hidden="true"
    />
  );
}
