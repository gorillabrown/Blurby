import { useState, useEffect } from "react";
import { ReadingStats } from "../types";

const api = window.electronAPI;

function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000);
  if (totalMinutes < 1) return "<1m";
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface StatsPanelProps {
  wpm: number;
  onClose: () => void;
}

export default function StatsPanel({ wpm, onClose }: StatsPanelProps) {
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    api.getStats().then(setStats);
  }, []);

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    await api.resetStats();
    api.getStats().then(setStats);
    setConfirmReset(false);
  };

  if (!stats) return null;

  const avgWpm = stats.totalReadingTimeMs > 0
    ? Math.round(stats.totalWordsRead / (stats.totalReadingTimeMs / 60000))
    : 0;

  return (
    <div className="stats-panel" role="region" aria-label="Reading statistics" aria-live="polite">
      <div className="stats-header">
        <span className="stats-title" id="stats-title">Reading statistics</span>
        <div className="stats-header-actions">
          <button onClick={handleReset} className={`btn stats-close${confirmReset ? " stats-reset-confirm" : ""}`} aria-label="Reset statistics">
            {confirmReset ? "confirm reset?" : "reset"}
          </button>
          <button onClick={() => api.openReadingLog()} className="btn stats-close" aria-label="Open Reading Log">Open Reading Log</button>
          <button onClick={onClose} className="btn stats-close">close</button>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stats-item">
          <span className="stats-value">{stats.totalWordsRead.toLocaleString()}</span>
          <span className="stats-label">words read</span>
        </div>
        <div className="stats-item">
          <span className="stats-value">{formatDuration(stats.totalReadingTimeMs)}</span>
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
          <span className="stats-value">{stats.streak}</span>
          <span className="stats-label">current streak</span>
        </div>
        <div className="stats-item">
          <span className="stats-value">{stats.longestStreak}</span>
          <span className="stats-label">longest streak</span>
        </div>
      </div>
    </div>
  );
}
