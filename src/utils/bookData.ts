// src/utils/bookData.ts — Book data formatting for library cards

const WORDS_PER_PAGE = 250;
const ESTIMATE_WPM = 225;

/** Format hours with 1 decimal (e.g., "6.2h"), or minutes if under 1h (e.g., "42m"). */
function formatTimeCompact(words: number): string {
  const mins = words / ESTIMATE_WPM;
  if (mins < 60) {
    const rounded = Math.max(1, Math.round(mins));
    return `${rounded}m`;
  }
  const hours = mins / 60;
  return `${hours.toFixed(1)}h`;
}

/**
 * Format the book data line for library cards.
 * - If reading (progress > 0%): `"45% · 3h 12m left"`
 * - If not started: `"323p · 6.2h"`
 */
export function formatBookDataLine(wordCount: number, position: number): string {
  const pages = Math.max(1, Math.round(wordCount / WORDS_PER_PAGE));
  const totalTime = formatTimeCompact(wordCount);

  if (position > 0) {
    const rawPct = (position / wordCount) * 100;
    const pct = rawPct > 0 && rawPct < 1 ? 1 : Math.round(rawPct);
    const wordsRemaining = Math.max(0, wordCount - position);
    const remainingTime = formatRemainingTime(wordsRemaining);
    return `${pct}% · ${remainingTime} left`;
  }

  return `${pages}p · ${totalTime}`;
}

/** Format remaining time as "3h 12m" or "42m" for display. */
function formatRemainingTime(wordsRemaining: number): string {
  const totalMins = wordsRemaining / ESTIMATE_WPM;
  if (totalMins < 1) return "1m";
  const hours = Math.floor(totalMins / 60);
  const mins = Math.round(totalMins % 60);
  if (hours === 0) return `${Math.max(1, mins)}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
