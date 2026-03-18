export const DEFAULT_WPM = 300;
export const MIN_WPM = 100;
export const MAX_WPM = 1200;
export const WPM_STEP = 25;
export const REWIND_WORDS = 5;

export const DEFAULT_FONT_SIZE = 100; // percentage scale
export const MIN_FONT_SIZE = 60;
export const MAX_FONT_SIZE = 200;
export const FONT_SIZE_STEP = 10;

export function tokenize(text) {
  return (text || "").split(/\s+/).filter(Boolean);
}

export function formatTime(words, wpm) {
  if (!wpm || !words) return "0m";
  const mins = Math.round(words / wpm);
  if (mins < 1) return "<1m";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function focusChar(word) {
  if (!word) return { before: "", focus: "", after: "" };
  const len = word.length;
  let pivot;
  if (len <= 1) pivot = 0;
  else if (len <= 5) pivot = 1;
  else if (len <= 9) pivot = 2;
  else if (len <= 13) pivot = 3;
  else pivot = 4;
  return { before: word.slice(0, pivot), focus: word[pivot], after: word.slice(pivot + 1) };
}
