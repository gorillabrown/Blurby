import { useState, useEffect } from "react";
import { BlurbyDoc } from "../types";

interface DocGridCardProps {
  doc: BlurbyDoc;
  onOpen: (doc: BlurbyDoc) => void;
}

function capitalizeFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function formatTitle(s: string): string {
  return s
    .replace(/_ /g, ": ")
    .replace(/\s+-\s+([A-Z][a-z]+([\s.][A-Z][a-z]*)*)\s*$/, " | $1");
}

export default function DocGridCard({ doc, onOpen }: DocGridCardProps) {
  const [coverSrc, setCoverSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!doc.coverPath) return;
    window.electronAPI.getCoverImage(doc.coverPath).then((src) => {
      if (src) setCoverSrc(src);
    });
  }, [doc.coverPath]);

  const ext = doc.ext ? doc.ext.slice(1).toUpperCase() : (doc.source === "url" ? "URL" : "TXT");

  // Generate a stable color from the doc id for placeholder backgrounds
  const placeholderColor = (() => {
    let hash = 0;
    for (let i = 0; i < doc.id.length; i++) {
      hash = doc.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ["#2a2a3a", "#2a3a2a", "#3a2a2a", "#2a3a3a", "#3a2a3a", "#3a3a2a"];
    return colors[Math.abs(hash) % colors.length];
  })();

  const progress = doc.wordCount > 0 ? Math.round(((doc.position || 0) / doc.wordCount) * 100) : 0;
  const isComplete = (doc.position || 0) >= doc.wordCount - 1 && doc.wordCount > 0;

  return (
    <div
      className="doc-grid-card"
      onClick={() => onOpen(doc)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen(doc)}
      aria-label={`${doc.title}${doc.author ? `, by ${doc.author}` : ""}${isComplete ? ", completed" : progress > 0 ? `, ${progress}% read` : ""}`}
    >
      <div className="doc-grid-cover">
        {coverSrc ? (
          <img src={coverSrc} alt={`Cover of ${doc.title}`} className="doc-grid-cover-img" />
        ) : (
          <div className="doc-grid-cover-placeholder" style={{ background: placeholderColor }}>
            <span className="doc-grid-cover-ext">{ext}</span>
          </div>
        )}
        {progress > 0 && !isComplete && (
          <div className="doc-grid-progress-bar">
            <div className="doc-grid-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
        {isComplete && <div className="doc-grid-done-badge">done</div>}
        {doc.favorite && <div className="doc-grid-fav-star">*</div>}
      </div>
      <div className="doc-grid-info">
        <div className="doc-grid-title">{capitalizeFirst(formatTitle(doc.title))}</div>
        {doc.author && <div className="doc-grid-author">{doc.author}</div>}
      </div>
    </div>
  );
}
