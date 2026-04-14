import { useState, useEffect, useRef, useCallback } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface ScanResult {
  docId: string;
  currentTitle: string;
  currentAuthor: string | null;
  currentCoverPath: string | null;
  issues: string[];
  suggestions: { title?: string; author?: string };
}

interface EditState {
  title: string;
  author: string;
  accepted: boolean;
}

interface MetadataWizardProps {
  onClose: () => void;
  onApplied: () => void;
}

const api = (window as any).electronAPI;

export default function MetadataWizard({ onClose, onApplied }: MetadataWizardProps) {
  const [scanning, setScanning] = useState(true);
  const [applying, setApplying] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [edits, setEdits] = useState<Map<string, EditState>>(new Map());
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(modalRef, [scanning]);

  // Scan on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const scanResults: ScanResult[] = await api.scanLibraryMetadata();
        if (cancelled) return;
        setResults(scanResults);
        // Initialize edit state from suggestions
        const map = new Map<string, EditState>();
        for (const r of scanResults) {
          const hasSuggestion = r.suggestions.title || r.suggestions.author;
          map.set(r.docId, {
            title: r.suggestions.title || r.currentTitle || "",
            author: r.suggestions.author || r.currentAuthor || "",
            accepted: !!hasSuggestion,
          });
        }
        setEdits(map);
      } finally {
        if (!cancelled) setScanning(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Escape to close
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const toggleAccepted = useCallback((docId: string) => {
    setEdits(prev => {
      const next = new Map(prev);
      const current = next.get(docId);
      if (current) {
        next.set(docId, { ...current, accepted: !current.accepted });
      }
      return next;
    });
  }, []);

  const updateField = useCallback((docId: string, field: "title" | "author", value: string) => {
    setEdits(prev => {
      const next = new Map(prev);
      const current = next.get(docId);
      if (current) {
        next.set(docId, { ...current, [field]: value, accepted: true });
      }
      return next;
    });
  }, []);

  const handleApply = useCallback(async () => {
    const updates: Array<{ docId: string; updates: Record<string, string> }> = [];
    for (const r of results) {
      const edit = edits.get(r.docId);
      if (!edit || !edit.accepted) continue;
      const fields: Record<string, string> = {};
      if (edit.title && edit.title !== r.currentTitle) fields.title = edit.title;
      if (edit.author && edit.author !== (r.currentAuthor || "")) fields.author = edit.author;
      if (Object.keys(fields).length > 0) {
        updates.push({ docId: r.docId, updates: fields });
      }
    }
    if (updates.length === 0) {
      onClose();
      return;
    }
    setApplying(true);
    try {
      await api.applyMetadataUpdates(updates);
      onApplied();
      onClose();
    } finally {
      setApplying(false);
    }
  }, [results, edits, onClose, onApplied]);

  const acceptedCount = Array.from(edits.values()).filter(e => e.accepted).length;

  return (
    <div className="metadata-wizard-backdrop" onClick={onClose}>
      <div
        className="metadata-wizard-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Metadata Wizard"
        ref={modalRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <div className="metadata-wizard-header">
          <h2 className="metadata-wizard-title">Metadata Wizard</h2>
          <button className="metadata-wizard-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        {scanning ? (
          <div className="metadata-wizard-body metadata-wizard-scanning">
            <p>Scanning library for incomplete metadata...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="metadata-wizard-body metadata-wizard-empty">
            <p>All documents have complete metadata. Nothing to fix.</p>
            <button className="metadata-wizard-btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="metadata-wizard-body">
              <p className="metadata-wizard-summary">
                Found {results.length} document{results.length !== 1 ? "s" : ""} with incomplete metadata.
              </p>
              <table className="metadata-wizard-table">
                <thead>
                  <tr>
                    <th className="metadata-wizard-th-check"></th>
                    <th>Current Title</th>
                    <th>Suggested Title</th>
                    <th>Current Author</th>
                    <th>Suggested Author</th>
                    <th>Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => {
                    const edit = edits.get(r.docId);
                    if (!edit) return null;
                    return (
                      <tr key={r.docId} className={edit.accepted ? "metadata-wizard-row-accepted" : ""}>
                        <td>
                          <input
                            type="checkbox"
                            checked={edit.accepted}
                            onChange={() => toggleAccepted(r.docId)}
                            aria-label={`Accept changes for ${r.currentTitle}`}
                          />
                        </td>
                        <td className="metadata-wizard-current">{r.currentTitle}</td>
                        <td>
                          <input
                            type="text"
                            className="metadata-wizard-input"
                            value={edit.title}
                            onChange={e => updateField(r.docId, "title", e.target.value)}
                            aria-label={`Suggested title for ${r.currentTitle}`}
                          />
                        </td>
                        <td className="metadata-wizard-current">{r.currentAuthor || "—"}</td>
                        <td>
                          <input
                            type="text"
                            className="metadata-wizard-input"
                            value={edit.author}
                            onChange={e => updateField(r.docId, "author", e.target.value)}
                            aria-label={`Suggested author for ${r.currentTitle}`}
                          />
                        </td>
                        <td className="metadata-wizard-issues">
                          {r.issues.map(i => (
                            <span key={i} className="metadata-wizard-issue-tag">{
                              i === "no-author" ? "No author" :
                              i === "filename-title" ? "Filename title" :
                              i === "no-cover" ? "No cover" : i
                            }</span>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="metadata-wizard-footer">
              <span className="metadata-wizard-count">{acceptedCount} of {results.length} selected</span>
              <div className="metadata-wizard-actions">
                <button className="metadata-wizard-btn-secondary" onClick={onClose}>Cancel</button>
                <button
                  className="metadata-wizard-btn-primary"
                  onClick={handleApply}
                  disabled={applying || acceptedCount === 0}
                  aria-busy={applying}
                >
                  {applying ? "Applying..." : `Apply ${acceptedCount} Change${acceptedCount !== 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
