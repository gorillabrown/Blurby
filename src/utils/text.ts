export const DEFAULT_WPM = 300;
export const MIN_WPM = 100;
export const MAX_WPM = 1200;
export const WPM_STEP = 25;
export const REWIND_WORDS = 5;

export const INITIAL_PAUSE_MS = 3000;   // pause before first word advances
export const PUNCTUATION_PAUSE_MS = 1000; // extra dwell on punctuation words

/** Does this word end with sentence/clause-ending punctuation? */
export function hasPunctuation(word: string): boolean {
  // Match punctuation at end, possibly followed by closing quotes/parens
  return /[.!?;:]["'»)\]]*$/.test(word);
}

export const DEFAULT_FOCUS_TEXT_SIZE = 100; // percentage scale
export const MIN_FOCUS_TEXT_SIZE = 60;
export const MAX_FOCUS_TEXT_SIZE = 200;
export const FOCUS_TEXT_SIZE_STEP = 10;

// Title case minor words that should stay lowercase (unless first/last word)
const MINOR_WORDS = new Set([
  "a", "an", "the", "and", "but", "or", "nor", "for", "yet", "so",
  "in", "on", "at", "to", "by", "of", "up", "as", "is", "it",
  "from", "with", "into", "than", "that", "this",
]);

function toTitleCase(s: string): string {
  const words = s.split(/\s+/);
  return words.map((w, i) => {
    if (i === 0 || i === words.length - 1) return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    if (MINOR_WORDS.has(w.toLowerCase())) return w.toLowerCase();
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(" ");
}

export function formatDisplayTitle(s: string): string {
  let t = s;
  // "_ " (underscore+space) → ": " (filesystem colon substitution) — must come before general underscore replace
  t = t.replace(/_ /g, ": ");
  // Remaining underscores → spaces
  t = t.replace(/_/g, " ");
  // Collapse multiple spaces
  t = t.replace(/\s{2,}/g, " ").trim();
  // Insert spaces before capitals in camelCase/PascalCase runs (e.g. "TradingOptionsForDummies" → "Trading Options For Dummies")
  t = t.replace(/([a-z])([A-Z])/g, "$1 $2");
  // Fix ALL CAPS titles → Title Case (if more than 60% uppercase letters)
  const letters = t.replace(/[^a-zA-Z]/g, "");
  const upperCount = (letters.match(/[A-Z]/g) || []).length;
  if (letters.length > 3 && upperCount / letters.length > 0.6) {
    t = toTitleCase(t);
  }
  // Replace " - PersonName" with " | PersonName" at end
  t = t.replace(/\s+-\s+([A-Z][a-z]+([\s.][A-Z][a-z]*)*)\s*$/, " | $1");
  // Ensure first character is uppercase
  t = t.charAt(0).toUpperCase() + t.slice(1);
  return t;
}

export function tokenize(text: string | null | undefined): string[] {
  return (text || "").split(/\s+/).filter(Boolean);
}

export interface TokenizedContent {
  words: string[];
  paragraphBreaks: Set<number>; // indices of words that end a paragraph
}

/** Like tokenize() but also tracks which words end a paragraph (double newline). */
export function tokenizeWithMeta(text: string | null | undefined): TokenizedContent {
  if (!text) return { words: [], paragraphBreaks: new Set() };
  const paragraphs = text.split(/\n{2,}/);
  const words: string[] = [];
  const paragraphBreaks = new Set<number>();

  for (const para of paragraphs) {
    const paraWords = para.split(/\s+/).filter(Boolean);
    if (paraWords.length === 0) continue;
    words.push(...paraWords);
    paragraphBreaks.add(words.length - 1);
  }

  return { words, paragraphBreaks };
}

export function formatTime(words: number | null | undefined, wpm: number | null | undefined): string {
  if (!wpm || !words) return "0m";
  const mins = Math.round(words / wpm);
  if (mins < 1) return "<1m";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ── Chapter detection ─────────────────────────────────────────────────────────

export interface Chapter {
  title: string;
  wordIndex: number; // global word index where this chapter starts
}

/**
 * Detect chapter boundaries in document content.
 * Works with common patterns: "Chapter X", "CHAPTER X", markdown headings,
 * "Part X", roman numerals, and numbered headings on their own line.
 * Returns chapters sorted by wordIndex. Empty array if no chapters found.
 */
export function detectChapters(content: string | null | undefined, words: string[]): Chapter[] {
  if (!content || words.length === 0) return [];

  const lines = content.split(/\n/);
  const chapters: Chapter[] = [];
  let globalWordIdx = 0;

  // Pattern: chapter/part headings (case-insensitive, on their own line)
  const chapterPattern = /^\s*(chapter|part|section|prologue|epilogue|introduction|conclusion|afterword|foreword|preface)\s*[\d.:IVXLCDM]*(.*)/i;
  // Pattern: markdown headings (# or ##)
  const markdownPattern = /^\s*#{1,2}\s+(.+)/;
  // Pattern: standalone numbers/roman numerals as chapter markers
  const numberPattern = /^\s*(\d{1,3}|[IVXLCDM]{1,8})\s*[.:\-—]?\s*$/;

  for (const line of lines) {
    const trimmed = line.trim();
    const lineWords = trimmed.split(/\s+/).filter(Boolean);

    if (trimmed) {
      let match: RegExpMatchArray | null;

      if ((match = trimmed.match(chapterPattern))) {
        const title = trimmed.replace(/^\s*#+\s*/, "").trim();
        chapters.push({ title, wordIndex: globalWordIdx });
      } else if ((match = trimmed.match(markdownPattern))) {
        chapters.push({ title: match[1].trim(), wordIndex: globalWordIdx });
      } else if (lineWords.length <= 2 && numberPattern.test(trimmed) && globalWordIdx > 0) {
        chapters.push({ title: `Chapter ${trimmed.trim()}`, wordIndex: globalWordIdx });
      }
    }

    globalWordIdx += lineWords.length;
  }

  return chapters;
}

/**
 * Given chapters and a current word index, find the current chapter index.
 * Returns -1 if no chapters or before first chapter.
 */
export function currentChapterIndex(chapters: Chapter[], wordIndex: number): number {
  if (chapters.length === 0) return -1;
  for (let i = chapters.length - 1; i >= 0; i--) {
    if (wordIndex >= chapters[i].wordIndex) return i;
  }
  return -1;
}

/** Convert charOffset-based chapters (from EPUB TOC) to wordIndex-based chapters. */
export function chaptersFromCharOffsets(
  content: string,
  charOffsetChapters: Array<{ title: string; charOffset: number }>
): Chapter[] {
  if (!content || charOffsetChapters.length === 0) return [];
  // Build a mapping from character offset to word index
  const chapters: Chapter[] = [];
  for (const ch of charOffsetChapters) {
    // Count words in text up to charOffset
    const textBefore = content.slice(0, ch.charOffset);
    const wordIndex = textBefore.split(/\s+/).filter(Boolean).length;
    chapters.push({ title: ch.title, wordIndex });
  }
  return chapters;
}

/** Calculate per-character opacity based on distance from ORP (Optimal Recognition Point). */
export function calculateFocusOpacity(charIndex: number, orpIndex: number, wordLength: number, focusSpan: number): number {
  if (focusSpan >= 1) return 1;
  const spanChars = Math.max(1, Math.floor(focusSpan * wordLength));
  const distance = Math.abs(charIndex - orpIndex);
  return distance <= spanChars ? 1 : 0.3;
}

export function focusChar(word: string | null | undefined): { before: string; focus: string; after: string } {
  if (!word) return { before: "", focus: "", after: "" };
  const len = word.length;
  let pivot: number;
  if (len <= 1) pivot = 0;
  else if (len <= 5) pivot = 1;
  else if (len <= 9) pivot = 2;
  else if (len <= 13) pivot = 3;
  else pivot = 4;
  return { before: word.slice(0, pivot), focus: word[pivot], after: word.slice(pivot + 1) };
}
