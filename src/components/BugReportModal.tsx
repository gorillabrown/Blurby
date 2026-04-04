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

  const [showDiag, setShowDiag] = useState(false);
  const [showConsole, setShowConsole] = useState(false);

  // Separate scalar state from array diagnostics for display
  const scalarEntries = Object.entries(appState).filter(
    ([k, v]) => v != null && k !== "narrateDiagSnapshot" && k !== "narrateDiagEvents" && k !== "consoleLog"
  );
  const hasDiag = appState.narrateDiagSnapshot || (appState.narrateDiagEvents && appState.narrateDiagEvents.length > 0);
  const hasConsole = appState.consoleLog && appState.consoleLog.length > 0;

  return (
    <div className="bug-report-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Bug Report">
      <div className="bug-report-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="bug-report-header">Bug Report</div>

        {screenshotDataUrl && (
          <img src={screenshotDataUrl} alt="Screenshot of bug" className="bug-report-screenshot" />
        )}

        <div className="bug-report-state">
          {scalarEntries.map(([key, value]) => (
            <div key={key}><strong>{key}:</strong> {String(value)}</div>
          ))}
        </div>

        {/* Collapsible Narration Diagnostics */}
        {hasDiag && (
          <details open={showDiag} onToggle={(e) => setShowDiag((e.target as HTMLDetailsElement).open)}>
            <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--text-dim)", marginBottom: 4, userSelect: "none" }}>
              Narration Diagnostics ({appState.narrateDiagEvents?.length ?? 0} events)
            </summary>
            <div className="bug-report-state" style={{ maxHeight: 150, overflowY: "auto", fontSize: 11 }}>
              {appState.narrateDiagSnapshot && (
                <div style={{ marginBottom: 4 }}>
                  <strong>Snapshot:</strong> engine={appState.narrateDiagSnapshot.engine} status={appState.narrateDiagSnapshot.status} cursor={appState.narrateDiagSnapshot.cursorWordIndex}/{appState.narrateDiagSnapshot.totalWords} rate={appState.narrateDiagSnapshot.rate}
                  {appState.narrateDiagSnapshot.fellBack && <span style={{ color: "var(--warning, #b80)" }}> (fallback: {appState.narrateDiagSnapshot.fallbackReason})</span>}
                </div>
              )}
              {appState.narrateDiagEvents?.map((e, i) => (
                <div key={i}>[{new Date(e.timestamp).toISOString().slice(11, 23)}] {e.event}: {e.detail}</div>
              ))}
            </div>
          </details>
        )}

        {/* Collapsible Console Log */}
        {hasConsole && (
          <details open={showConsole} onToggle={(e) => setShowConsole((e.target as HTMLDetailsElement).open)}>
            <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--text-dim)", marginBottom: 4, userSelect: "none" }}>
              Console Log ({appState.consoleLog!.length} entries)
            </summary>
            <pre className="bug-report-state" style={{ maxHeight: 200, overflowY: "auto", fontSize: 10, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {appState.consoleLog!.map((e, i) => (
                <div key={i} style={{ color: e.level === "error" ? "var(--error, #c44)" : e.level === "warn" ? "var(--warning, #b80)" : "inherit" }}>
                  [{new Date(e.timestamp).toISOString().slice(11, 23)}] {e.level.toUpperCase()}: {e.message}
                </div>
              ))}
            </pre>
          </details>
        )}

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
