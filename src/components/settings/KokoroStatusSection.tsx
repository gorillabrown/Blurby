interface KokoroStatusSectionProps {
  kokoroBusy: boolean;
  kokoroBusyLabel: string;
  kokoroProgress: number;
  kokoroError: string | null;
  kokoroStalled: boolean;
  onDownload: () => void;
}

/** Kokoro model download progress / status block shown when Kokoro engine is selected but not yet ready */
export function KokoroStatusSection({
  kokoroBusy,
  kokoroBusyLabel,
  kokoroProgress,
  kokoroError,
  kokoroStalled,
  onDownload,
}: KokoroStatusSectionProps) {
  return (
    <div className="tts-kokoro-wrapper">
      {kokoroError && (
        <div className="tts-kokoro-error">
          Kokoro unavailable: {kokoroError}
        </div>
      )}
      {kokoroStalled && !kokoroError && (
        <div className="tts-kokoro-warning">
          Download may be blocked by your network or firewall. Check your connection and try again.
        </div>
      )}
      {kokoroBusy ? (
        <>
          <div className="tts-kokoro-progress-label">
            {kokoroBusyLabel}
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
          {kokoroError ? "Retry Kokoro setup (92 MB)" : "Download voice model (92 MB)"}
        </button>
      )}
    </div>
  );
}
