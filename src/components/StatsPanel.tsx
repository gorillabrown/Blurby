import { useState, useEffect } from "react";
import { formatTime } from "../utils/text";
import { ReadingStats } from "../types";

const api = window.electronAPI;

interface StatsPanelProps {
  wpm: number;
  onClose: () => void;
}

export default function StatsPanel({ wpm, onClose }: StatsPanelProps) {
  const [stats, setStats] = useState<ReadingStats | null>(null);

  useEffect(() => {
    api.getStats().then(setStats);
  }, []);

  if (!stats) return null;

  const avgWpm = stats.totalReadingTimeMs > 0
    ? Math.round(stats.totalWordsRead / (stats.totalReadingTimeMs / 60000))
    : 0;

  return (
    <div className="stats-panel">
      <div className="stats-header">
        <span className="stats-title">Reading statistics</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => api.exportStatsCsv()} className="btn stats-close" aria-label="Export stats CSV">export csv</button>
          <button onClick={onClose} className="btn stats-close">close</button>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stats-item">
          <span className="stats-value">{stats.totalWordsRead.toLocaleString()}</span>
          <span className="stats-label">words read</span>
        </div>
        <div className="stats-item">
          <span className="stats-value">{formatTime(stats.totalWordsRead, avgWpm || wpm)}</span>
          <span className="stats-label">total time</span>
        </div>
        <div className="stats-item">
          <span className="stats-value">{avgWpm || "\u2014"}</span>
          <span className="stats-label">avg wpm</span>
        </div>
        <div className="stats-item">
          <span className="stats-value">{stats.docsCompleted}</span>
          <span className="stats-label">completed</span>
        </div>
        <div className="stats-item">
          <span className="stats-value">{stats.sessions}</span>
          <span className="stats-label">sessions</span>
        </div>
        <div className="stats-item">
          <span className="stats-value">{stats.streak}</span>
          <span className="stats-label">day streak</span>
        </div>
      </div>
    </div>
  );
}
