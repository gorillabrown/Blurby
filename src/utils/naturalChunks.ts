import type { ChunkSourceWord, ReadingChunk, ReadingChunkKind } from "../types/chunkReading";

export interface NaturalChunkOptions {
  targetMinWords?: number;
  targetMaxWords?: number;
  softMaxWords?: number;
  hardMaxWords?: number;
}

interface ResolvedOptions {
  targetMinWords: number;
  targetMaxWords: number;
  softMaxWords: number;
  hardMaxWords: number;
}

const DEFAULT_OPTIONS: ResolvedOptions = {
  targetMinWords: 20,
  targetMaxWords: 60,
  softMaxWords: 80,
  hardMaxWords: 120,
};

const HEADING_TAG_RE = /^h[1-6]$/i;
const SENTENCE_END_RE = /[.!?]["')\]\u201D\u2019]*$/;
const SEMICOLON_COLON_END_RE = /[;:]["')\]\u201D\u2019]*$/;
const COMMA_END_RE = /,["')\]\u201D\u2019]*$/;

type BoundaryRule = {
  regex: RegExp;
  kind: ReadingChunkKind;
  reason: string;
};

function resolveOptions(options: NaturalChunkOptions = {}): ResolvedOptions {
  const hardMaxWords = Math.max(1, options.hardMaxWords ?? DEFAULT_OPTIONS.hardMaxWords);
  const softMaxWords = Math.max(1, Math.min(options.softMaxWords ?? DEFAULT_OPTIONS.softMaxWords, hardMaxWords));
  const targetMaxWords = Math.max(1, Math.min(options.targetMaxWords ?? DEFAULT_OPTIONS.targetMaxWords, softMaxWords));
  const targetMinWords = Math.max(1, Math.min(options.targetMinWords ?? DEFAULT_OPTIONS.targetMinWords, targetMaxWords));
  return { targetMinWords, targetMaxWords, softMaxWords, hardMaxWords };
}

function makeChunk(
  words: ChunkSourceWord[],
  start: number,
  end: number,
  kind: ReadingChunkKind,
  reason: string,
): ReadingChunk | null {
  if (start >= end) return null;
  const first = words[start];
  const last = words[end - 1];
  if (!first || !last) return null;
  const startWordIndex = first.globalWordIndex;
  const endWordIndex = last.globalWordIndex + 1;
  return {
    id: `${kind}:${startWordIndex}-${endWordIndex}`,
    startWordIndex,
    endWordIndex,
    kind,
    reason,
    wordCount: end - start,
  };
}

function pushChunk(
  chunks: ReadingChunk[],
  words: ChunkSourceWord[],
  start: number,
  end: number,
  kind: ReadingChunkKind,
  reason: string,
): void {
  const chunk = makeChunk(words, start, end, kind, reason);
  if (chunk) chunks.push(chunk);
}

function isHeadingWord(word: ChunkSourceWord): boolean {
  return HEADING_TAG_RE.test(word.blockTag || "");
}

function findBlockEnd(words: ChunkSourceWord[], start: number): number {
  const blockId = words[start]?.blockId;
  if (!blockId) return start + 1;
  let end = start + 1;
  while (end < words.length && words[end].blockId === blockId) end++;
  return end;
}

function classifyTerminalKind(words: ChunkSourceWord[], endExclusive: number): ReadingChunkKind {
  const last = words[endExclusive - 1];
  if (last?.paragraphBreakAfter) return "paragraph";
  if (last?.sourceLineBreakAfter) return "line";
  return "sentence";
}

function findBoundaryEnd(
  words: ChunkSourceWord[],
  start: number,
  end: number,
  regex: RegExp,
  targetMinWords: number,
  targetMaxWords: number,
): number | null {
  let first: number | null = null;
  const targetHardLimit = Math.min(end, start + targetMaxWords);

  for (let i = start; i < end; i++) {
    if (!regex.test(words[i].word)) continue;
    const candidateEnd = i + 1;
    if (first == null) first = candidateEnd;
    if (candidateEnd >= start + targetMinWords && candidateEnd <= targetHardLimit) {
      return candidateEnd;
    }
  }

  return first;
}

function findPriorityBoundary(words: ChunkSourceWord[], start: number, end: number, options: ResolvedOptions): {
  end: number;
  kind: ReadingChunkKind;
  reason: string;
} | null {
  const hardEnd = Math.min(end, start + options.hardMaxWords);
  const boundaryRules: BoundaryRule[] = [
    { regex: SENTENCE_END_RE, kind: "sentence", reason: "sentence terminator" },
    { regex: SEMICOLON_COLON_END_RE, kind: "sentence", reason: "sentence terminator" },
  ];

  for (const rule of boundaryRules) {
    const boundary = findBoundaryEnd(
      words,
      start,
      hardEnd,
      rule.regex,
      options.targetMinWords,
      options.targetMaxWords,
    );
    if (boundary == null) continue;
    return { end: boundary, kind: rule.kind, reason: rule.reason };
  }

  return null;
}

function findCommaEnd(words: ChunkSourceWord[], start: number, limit: number): number | null {
  let best: number | null = null;
  for (let i = start; i < limit; i++) {
    if (COMMA_END_RE.test(words[i].word)) best = i + 1;
  }
  return best;
}

function findClauseEnd(start: number, end: number, options: ResolvedOptions): number {
  const softEnd = Math.min(end, start + options.softMaxWords);
  const hardEnd = Math.min(end, start + options.hardMaxWords);
  if (hardEnd <= start + 1) return hardEnd;
  if (softEnd > start) return softEnd;
  return hardEnd;
}

function splitSegment(
  chunks: ReadingChunk[],
  words: ChunkSourceWord[],
  start: number,
  end: number,
  terminalKind: ReadingChunkKind,
  terminalReason: string,
  options: ResolvedOptions,
): void {
  let cursor = start;
  while (cursor < end) {
    const remaining = end - cursor;
    const boundary = findPriorityBoundary(words, cursor, end, options);

    if (remaining <= options.targetMaxWords || (remaining <= options.hardMaxWords && boundary?.end === end)) {
      pushChunk(chunks, words, cursor, end, terminalKind, terminalReason);
      return;
    }

    if (boundary && boundary.end > cursor && boundary.end - cursor <= options.hardMaxWords) {
      pushChunk(chunks, words, cursor, boundary.end, boundary.kind, boundary.reason);
      cursor = boundary.end;
      continue;
    }

    const softLimit = Math.min(end, cursor + options.softMaxWords);
    const hardLimit = Math.min(end, cursor + options.hardMaxWords);
    const commaEnd = findCommaEnd(words, cursor, softLimit) ?? findCommaEnd(words, cursor, hardLimit);
    if (commaEnd && commaEnd > cursor) {
      pushChunk(chunks, words, cursor, commaEnd, "clause", "comma before hard max");
      cursor = commaEnd;
      continue;
    }

    const clauseEnd = findClauseEnd(cursor, end, options);
    const isFinal = clauseEnd >= end;
    pushChunk(
      chunks,
      words,
      cursor,
      clauseEnd,
      isFinal ? terminalKind : "clause",
      isFinal ? terminalReason : "soft max fallback",
    );
    cursor = clauseEnd;
  }
}

export function buildNaturalChunks(
  words: ChunkSourceWord[],
  options?: NaturalChunkOptions,
): ReadingChunk[] {
  if (words.length === 0) return [];
  const resolved = resolveOptions(options);
  const chunks: ReadingChunk[] = [];
  let segmentStart = 0;
  let i = 0;

  while (i < words.length) {
    const word = words[i];
    if (isHeadingWord(word)) {
      if (segmentStart < i) {
        splitSegment(chunks, words, segmentStart, i, "sentence", "pre-heading text", resolved);
      }
      const blockEnd = findBlockEnd(words, i);
      let headingEnd = i + 1;
      while (headingEnd < blockEnd && isHeadingWord(words[headingEnd])) headingEnd++;
      pushChunk(chunks, words, i, headingEnd, "heading", "heading block");
      i = headingEnd;
      segmentStart = i;
      continue;
    }

    if (word.paragraphBreakAfter || word.sourceLineBreakAfter) {
      const end = i + 1;
      splitSegment(chunks, words, segmentStart, end, classifyTerminalKind(words, end), "hard source delimiter", resolved);
      segmentStart = end;
    }
    i++;
  }

  if (segmentStart < words.length) {
    splitSegment(chunks, words, segmentStart, words.length, "sentence", "document end", resolved);
  }

  return chunks;
}

export function findChunkForWord(
  chunks: ReadingChunk[],
  wordIndex: number,
): ReadingChunk | null {
  return chunks.find((chunk) => wordIndex >= chunk.startWordIndex && wordIndex < chunk.endWordIndex) ?? null;
}
