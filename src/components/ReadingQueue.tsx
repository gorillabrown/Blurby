import React from "react";
import type { BlurbyDoc } from "../types";
import { sortReadingQueue, bubbleCount } from "../utils/queue";
import { formatDisplayTitle } from "../utils/text";

interface ReadingQueueProps {
  docs: BlurbyDoc[];
  compact: boolean;
  onDocClick: (docId: string) => void;
}

interface BubbleProgressProps {
  progress: number;
  compact: boolean;
}

function BubbleProgress({ progress, compact }: BubbleProgressProps) {
  const filled = bubbleCount(progress);
  const total = 10;

  return (
    <div className={`bubble-progress${compact ? " compact" : ""}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`bubble-progress-dot${i < filled ? " filled" : ""}`}
        />
      ))}
      <span className="bubble-progress-label">{Math.round(progress)}%</span>
    </div>
  );
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return "Added " + date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function typeBadgeLabel(doc: BlurbyDoc): string {
  if (doc.source === "url") return "web";
  if (doc.ext) return doc.ext.slice(1);
  return "";
}

export default function ReadingQueue({ docs, compact, onDocClick }: ReadingQueueProps) {
  const sorted = sortReadingQueue(docs);

  const inProgress = sorted.filter((doc) => doc.position > 0);
  const unread = sorted.filter((doc) => doc.position === 0);

  if (sorted.length === 0) {
    return <div className="queue-empty-state">No unread materials</div>;
  }

  function renderDoc(doc: BlurbyDoc) {
    const progress =
      doc.wordCount > 0 ? (doc.position / doc.wordCount) * 100 : 0;

    return (
      <div
        key={doc.id}
        className="queue-item"
        onClick={() => onDocClick(doc.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onDocClick(doc.id);
          }
        }}
      >
        <div className="queue-item-header">
          <span className="queue-item-title">{formatDisplayTitle(doc.title)}</span>
          {!compact && (
            <span className="badge">{typeBadgeLabel(doc)}</span>
          )}
        </div>
        <div className="queue-item-meta">
          {!compact && (
            <span className="queue-item-date">{formatDate(doc.created)}</span>
          )}
          {compact && (
            <span className="badge">{typeBadgeLabel(doc)}</span>
          )}
          <BubbleProgress progress={progress} compact={compact} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {inProgress.length > 0 && (
        <div>
          <div className="queue-section-label">Continue Reading</div>
          {inProgress.map(renderDoc)}
        </div>
      )}
      {unread.length > 0 && (
        <div>
          <div className="queue-section-label">Unread</div>
          {unread.map(renderDoc)}
        </div>
      )}
    </div>
  );
}
