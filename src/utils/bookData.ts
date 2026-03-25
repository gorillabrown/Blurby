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
 * - If reading (progress > 0%): `7% · 323p · 1.1h/6.2h`
 * - If not started: `323p · 6.2h`
 */
export function formatBookDataLine(wordCount: number, position: number): string {
  const pages = Math.max(1, Math.round(wordCount / WORDS_PER_PAGE));
  const totalTime = formatTimeCompact(wordCount);

  if (position > 0) {
    const rawPct = (position / wordCount) * 100;
    const pct = rawPct > 0 && rawPct < 1 ? 1 : Math.round(rawPct);
    const wordsRead = position;
    const readTime = formatTimeCompact(wordsRead);
    return `${pct}% \u00B7 ${pages}p \u00B7 ${readTime}/${totalTime}`;
  }

  return `${pages}p \u00B7 ${totalTime}`;
}
