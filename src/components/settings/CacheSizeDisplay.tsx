import { useState, useEffect } from "react";

const api = window.electronAPI;

/** Shows current cache size and a clear button */
export function CacheSizeDisplay() {
  const [info, setInfo] = useState<{ totalMB: number; bookCount: number } | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (api?.ttsCacheInfo) {
      api.ttsCacheInfo().then(setInfo).catch(() => {});
    }
  }, [clearing]);

  if (!info || info.totalMB === 0) return null;

  return (
    <div className="tts-cache-size-row">
      <span className="tts-cache-size-label">
        {info.bookCount} {info.bookCount === 1 ? "book" : "books"} cached — {info.totalMB}MB
      </span>
      <button
        className="settings-btn-secondary tts-cache-clear-btn"
        onClick={async () => {
          if (!confirm("Clear all cached narration audio?")) return;
          setClearing(true);
          setClearing(false);
        }}
        disabled={clearing}
      >
        Clear cache
      </button>
    </div>
  );
}
