import { useState, useEffect } from "react";

/**
 * Full-screen black→white flash overlay for e-ink ghosting prevention.
 * Mounts briefly (200ms total: 100ms black, 100ms white) then unmounts.
 */
export default function EinkRefreshOverlay() {
  const [phase, setPhase] = useState<"black" | "white">("black");

  useEffect(() => {
    const timer = setTimeout(() => setPhase("white"), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="eink-refresh-overlay"
      style={{ background: phase === "black" ? "#000000" : "#ffffff" }}
      aria-hidden="true"
    />
  );
}
