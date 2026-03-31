import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "../contexts/ToastContext";
import type { BugReportAppState } from "../utils/bugReportState";

interface BugReportModalProps {
  screenshotPath: string | null;
  screenshotFile: string | null;
  appState: BugReportAppState;
  onClose: () => void;
}

const SEVERITIES = ["Cosmetic", "Broken", "Crash"] as const;

const api = window.electronAPI;

export default function BugReportModal({ screenshotPath, screenshotFile, appState, onClose }: BugReportModalProps) {
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<string>("Broken");
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { showToast } = useToast();

  // Load screenshot as data URL for preview
  useEffect(() => {
    if (!screenshotPath) return;
    (async () => {
      try {
        const buffer = await api.readFileBuffer(screenshotPath);
        const blob = new Blob([buffer], { type: "image/png" });
        const url = URL.createObjectURL(blob);
        setScreenshotDataUrl(url);
        return () => URL.revokeObjectURL(url);
      } catch {
        // Screenshot preview not critical
      }
    })();
  }, [screenshotPath]);

  // Auto-focus textarea
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [onClose]);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      await api.saveBugReport({
        description,
        severity,
        appState: appState as unknown as Record<string, unknown>,
        screenshotFile,
        timestamp: appState.timestamp || new Date().toISOString(),
      });
      showToast("Bug report saved", 2000);
      onClose();
    } catch (err) {
      showToast("Failed to save bug report", 3000);
      setSaving(false);
    }
  }, [description, severity, appState, screenshotFile, saving, showToast, onClose]);

  const stateEntries = Object.entries(appState).filter(([, v]) => v != null);

  return (
    <div className="bug-report-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Bug Report">
      <div className="bug-report-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="bug-report-header">Bug Report</div>

        {screenshotDataUrl && (
          <img src={screenshotDataUrl} alt="Screenshot of bug" className="bug-report-screenshot" />
        )}

        <div className="bug-report-state">
          {stateEntries.map(([key, value]) => (
            <div key={key}><strong>{key}:</strong> {String(value)}</div>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          className="bug-report-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What happened? What did you expect?"
          aria-label="Bug description"
        />

        <div className="bug-report-severity">
          {SEVERITIES.map((s) => (
            <button
              key={s}
              className={`btn ${severity === s ? "btn-fill" : ""}`}
              onClick={() => setSeverity(s)}
              aria-pressed={severity === s}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="bug-report-actions">
          <button onClick={onClose} className="btn">Cancel</button>
          <button onClick={handleSave} className="btn-fill" disabled={saving}>
            {saving ? "Saving..." : "Save Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
