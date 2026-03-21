import { useState, useCallback, ReactNode, DragEvent } from "react";

const SUPPORTED_EXTENSIONS = new Set([".txt", ".md", ".pdf", ".epub", ".mobi", ".azw3", ".html"]);

function getExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
  onReject?: (extensions: string[]) => void;
  children: ReactNode;
}

export default function DropZone({ onFilesDropped, onReject, children }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((c) => {
      if (c === 0) setDragging(true);
      return c + 1;
    });
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((c) => {
      const next = c - 1;
      if (next <= 0) {
        setDragging(false);
        return 0;
      }
      return next;
    });
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const supported: File[] = [];
    const rejectedExts: string[] = [];

    for (const file of files) {
      const ext = getExtension(file.name);
      if (SUPPORTED_EXTENSIONS.has(ext)) {
        supported.push(file);
      } else {
        rejectedExts.push(ext || file.name);
      }
    }

    if (supported.length > 0) {
      onFilesDropped(supported);
    }
    if (rejectedExts.length > 0 && onReject) {
      onReject(rejectedExts);
    }
  }, [onFilesDropped, onReject]);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="drop-zone-wrapper"
    >
      {children}
      {dragging && (
        <div className="drop-overlay">
          <div className="drop-overlay-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Drop files to import</span>
            <span className="drop-overlay-hint">.txt .md .pdf .epub .mobi .azw3 .html</span>
          </div>
        </div>
      )}
    </div>
  );
}
