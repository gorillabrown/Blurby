import { useState, useEffect } from "react";
import { formatTime } from "../utils/text";

const api = window.electronAPI;

export default function StatsPanel({ wpm, onClose }) {
  const [stats, setStats] = useState(null);

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
        <button onClick={onClose} className="btn stats-close">close</button>
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
          <span className="stats-value">{avgWpm || "—"}</span>
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
