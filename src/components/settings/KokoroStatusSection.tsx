interface KokoroStatusSectionProps {
  kokoroDownloading: boolean;
  kokoroProgress: number;
  kokoroError: string | null;
  kokoroStalled: boolean;
  onDownload: () => void;
}

/** Kokoro model download progress / status block shown when Kokoro engine is selected but not yet ready */
export function KokoroStatusSection({
  kokoroDownloading,
  kokoroProgress,
  kokoroError,
  kokoroStalled,
  onDownload,
}: KokoroStatusSectionProps) {
  return (
    <div className="tts-kokoro-wrapper">
      {kokoroError && (
        <div className="tts-kokoro-error">
          Download failed: {kokoroError}
        </div>
      )}
      {kokoroStalled && !kokoroError && (
        <div className="tts-kokoro-warning">
          Download may be blocked by your network or firewall. Check your connection and try again.
        </div>
      )}
      {kokoroDownloading ? (
        <>
          <div className="tts-kokoro-progress-label">
            Downloading voice model... {kokoroProgress}%
          </div>
          <div className="tts-kokoro-progress-track">
            <div className="tts-kokoro-progress-bar" style={{ width: `${kokoroProgress}%` }} />
          </div>
        </>
      ) : (
        <button
          className="settings-btn-secondary tts-kokoro-download-btn"
          onClick={onDownload}
        >
          {kokoroError ? "Retry download (92 MB)" : "Download voice model (92 MB)"}
        </button>
      )}
    </div>
  );
}
