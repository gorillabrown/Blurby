import React, { useState, useCallback } from "react";
import type { BlurbyDoc } from "../types";
import { sortReadingQueue, bubbleCount } from "../utils/queue";
import { formatDisplayTitle } from "../utils/text";

interface ReadingQueueProps {
  docs: BlurbyDoc[];
  compact: boolean;
  onDocClick: (docId: string) => void;
  onAddToQueue?: (docId: string) => void;
  onRemoveFromQueue?: (docId: string) => void;
  onReorderQueue?: (docId: string, newPosition: number) => void;
}

interface BubbleProgressProps {
  progress: number;
  compact: boolean;
}

function BubbleProgress({ progress, compact }: BubbleProgressProps) {
  const filled = bubbleCount(progress);
  const total = 10;

  return (
    <div className={`bubble-progress${compact ? " compact" : ""}`} role="meter" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label={`${Math.round(progress)}% read`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`bubble-progress-dot${i < filled ? " filled" : ""}`}
          aria-hidden="true"
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

export default function ReadingQueue({ docs, compact, onDocClick, onAddToQueue, onRemoveFromQueue, onReorderQueue }: ReadingQueueProps) {
  const sorted = sortReadingQueue(docs);

  const queued = sorted.filter((doc) => doc.queuePosition !== undefined);
  const inProgress = sorted.filter((doc) => doc.queuePosition === undefined && doc.position > 0);

  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragSourceId, setDragSourceId] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, docId: string) => {
    e.dataTransfer.setData("text/plain", docId);
    e.dataTransfer.effectAllowed = "move";
    setDragSourceId(docId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, docId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(docId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetDocId: string) => {
    e.preventDefault();
    const sourceDocId = e.dataTransfer.getData("text/plain");
    setDragOverId(null);
    setDragSourceId(null);
    if (!sourceDocId || sourceDocId === targetDocId || !onReorderQueue) return;
    const targetDoc = queued.find((d) => d.id === targetDocId);
    if (targetDoc?.queuePosition !== undefined) {
      onReorderQueue(sourceDocId, targetDoc.queuePosition);
    }
  }, [queued, onReorderQueue]);

  const handleDragEnd = useCallback(() => {
    setDragOverId(null);
    setDragSourceId(null);
  }, []);

  if (sorted.length === 0) {
    return <div className="queue-empty-state">No unread materials</div>;
  }

  function renderDoc(doc: BlurbyDoc, draggable: boolean = false) {
    const progress =
      doc.wordCount > 0 ? (doc.position / doc.wordCount) * 100 : 0;
    const isDragOver = dragOverId === doc.id;
    const isDragSource = dragSourceId === doc.id;

    return (
      <div
        key={doc.id}
        className={`queue-item${isDragOver ? " queue-item-drag-over" : ""}${isDragSource ? " queue-item-dragging" : ""}`}
        onClick={() => onDocClick(doc.id)}
        role="listitem"
        tabIndex={0}
        aria-label={`${formatDisplayTitle(doc.title)}, ${Math.round(doc.wordCount > 0 ? (doc.position / doc.wordCount) * 100 : 0)}% read`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onDocClick(doc.id);
          }
        }}
        draggable={draggable}
        onDragStart={draggable ? (e) => handleDragStart(e, doc.id) : undefined}
        onDragOver={draggable ? (e) => handleDragOver(e, doc.id) : undefined}
        onDragLeave={draggable ? handleDragLeave : undefined}
        onDrop={draggable ? (e) => handleDrop(e, doc.id) : undefined}
        onDragEnd={draggable ? handleDragEnd : undefined}
      >
        <div className="queue-item-header">
          {draggable && <span className="queue-drag-handle" aria-hidden="true">≡</span>}
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
    <div role="list" aria-label="Reading queue">
      {queued.length > 0 && (
        <div role="group" aria-label="Queue">
          <div className="queue-section-label">Queue</div>
          {queued.map((doc) => renderDoc(doc, true))}
        </div>
      )}
      {inProgress.length > 0 && (
        <div role="group" aria-label="Now Reading">
          <div className="queue-section-label">Now Reading</div>
          {inProgress.map((doc) => renderDoc(doc))}
        </div>
      )}
    </div>
  );
}
