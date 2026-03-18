import type { Chapter } from "../utils/text";

interface ChapterListProps {
  chapters: Chapter[];
  currentChapterIndex: number;
  totalWords: number;
  wordIndex: number;
  wpm: number;
  onJumpToChapter: (wordIndex: number) => void;
  onClose: () => void;
}

export default function ChapterList({ chapters, currentChapterIndex: currentIdx, totalWords, wordIndex, wpm, onJumpToChapter, onClose }: ChapterListProps) {
  return (
    <div className="chapter-list">
      <div className="chapter-list-header">
        <button className="chapter-list-back" onClick={onClose} aria-label="Close chapter list">
          ← Back
        </button>
        <span className="chapter-list-title">Chapters</span>
      </div>
      <div className="chapter-list-items">
        {chapters.map((ch, i) => {
          const chEnd = i + 1 < chapters.length ? chapters[i + 1].wordIndex : totalWords;
          const chWords = chEnd - ch.wordIndex;
          const chProgress = wordIndex >= ch.wordIndex
            ? Math.min(100, Math.round(((wordIndex - ch.wordIndex) / chWords) * 100))
            : 0;
          const isCurrent = i === currentIdx;
          const isCompleted = wordIndex >= chEnd;
          const mins = Math.max(1, Math.round(chWords / wpm));
          const timeLabel = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;

          return (
            <button
              key={i}
              className={`chapter-list-item${isCurrent ? " current" : ""}${isCompleted ? " completed" : ""}`}
              onClick={() => onJumpToChapter(ch.wordIndex)}
            >
              <div className="chapter-list-item-info">
                <span className="chapter-list-item-num">{i + 1}</span>
                <span className="chapter-list-item-title">{ch.title}</span>
              </div>
              <div className="chapter-list-item-meta">
                <span className="chapter-list-item-time">{timeLabel}</span>
                {chProgress > 0 && !isCompleted && (
                  <span className="chapter-list-item-progress">{chProgress}%</span>
                )}
                {isCompleted && <span className="chapter-list-item-done">✓</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
