// FolderNoticeBanner: the library banner shown while Blurby cannot reach the source folder (FOLDER-NOTICE-1).
// Main owns the state. Retry asks main for one root check and is disabled while it runs; nothing here retries.
import { useEffect, useState } from "react";

const api = window.electronAPI;
const TEXT = "Blurby can't reach your source folder. Your books are kept. Reconnect the drive, then press Retry."; // the owner's wording (2026-10-15); the same string as the toast in main.js (Done-when 13)

export default function FolderNoticeBanner() {
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let pushed = false; // a push is newer than the getter's answer
    const off = api.onFolderProblem?.((code) => { pushed = true; setProblem(code); });
    api.getFolderProblem?.().then((code) => { if (!pushed) setProblem(code); }, () => {});
    return off;
  }, []);

  if (!problem) return null;

  const retry = async () => {
    setBusy(true);
    try {
      const code = await api.retrySourceFolder?.();
      if (code !== undefined) setProblem(code);
    } catch {
      // the banner stays; Retry can be pressed again
    } finally {
      setBusy(false);
    }
  };

  // The library's update-banner strip, reused as is: no new visual design (owner decision, 2026-10-15).
  return (
    <div className="update-banner" role="alert">
      <span>{TEXT}</span>
      <button onClick={retry} disabled={busy} className="btn-fill update-banner-restart-btn">Retry</button>
    </div>
  );
}
