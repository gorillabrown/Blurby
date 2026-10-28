import { TTS_NORMALIZER_VERSION } from "../constants";
import type { PronunciationOverride } from "../types";
import { applyPronunciationOverrides, overrideHash } from "./pronunciationOverrides";
import { segmentWords } from "./segmentWords";

export type SegmentNormalizationTransformId =
  | "pronunciation-overrides"
  | "unicode-nfkc"
  | "citation-marker-removal"
  | "whitespace-normalization"
  | "roman-numeral-expansion"
  | "dotted-acronym-normalization"
  | "address-abbreviation-expansion"
  | "url-normalization"
  | "date-expansion"
  | "time-expansion"
  | "currency-expansion"
  | "fraction-expansion"
  | "decimal-expansion"
  | "number-range-expansion"
  | "decade-expansion"
  | "abbreviation-expansion"
  | "spaced-initials"
  | "ordinal-expansion"
  | "cardinal-expansion"
  | "terminal-punctuation-enforcement"
  | "all-caps-quote-downcasing"
  | "heteronym-disambiguation";

export interface SegmentNormalizationTransform {
  id: SegmentNormalizationTransformId;
}

export interface SegmentNormalizationOptions {
  locale?: string;
  pronunciationOverrides?: PronunciationOverride[];
}

export interface SegmentNormalizationResult {
  originalText: string;
  normalizedText: string;
  normalizedToOriginalMap: number[];
  locale: string;
  normalizerVersion: string;
  sourceTextHash: string;
  normalizedTextHash: string;
  pronunciationOverrideHash: string;
  normalizationHash: string;
  transforms: SegmentNormalizationTransform[];
}

export interface SegmentNormalizationFixture {
  id: string;
  locale: string;
  input: string;
  expected: string;
  expectedNormalizedToOriginalMap: number[];
  expectedTransforms: SegmentNormalizationTransformId[];
}

type TransformFn = (text: string) => string;

const MONTHS: Record<string, string> = {
  january: "January",
  february: "February",
  march: "March",
  april: "April",
  may: "May",
  june: "June",
  july: "July",
  august: "August",
  september: "September",
  october: "October",
  november: "November",
  december: "December",
};

const MONTHS_BY_NUMBER = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const SMALL_NUMBERS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
] as const;

const TENS: Record<number, string> = {
  20: "twenty",
  30: "thirty",
  40: "forty",
  50: "fifty",
  60: "sixty",
  70: "seventy",
  80: "eighty",
  90: "ninety",
};

const ORDINAL_SMALL: Record<number, string> = {
  1: "first",
  2: "second",
  3: "third",
  4: "fourth",
  5: "fifth",
  6: "sixth",
  7: "seventh",
  8: "eighth",
  9: "ninth",
  10: "tenth",
  11: "eleventh",
  12: "twelfth",
  13: "thirteenth",
  14: "fourteenth",
  15: "fifteenth",
  16: "sixteenth",
  17: "seventeenth",
  18: "eighteenth",
  19: "nineteenth",
};

const ORDINAL_TENS: Record<number, string> = {
  20: "twentieth",
  30: "thirtieth",
  40: "fortieth",
  50: "fiftieth",
  60: "sixtieth",
  70: "seventieth",
  80: "eightieth",
  90: "ninetieth",
};

const DECADE_WORDS: Record<number, string> = {
  10: "tens",
  20: "twenties",
  30: "thirties",
  40: "forties",
  50: "fifties",
  60: "sixties",
  70: "seventies",
  80: "eighties",
  90: "nineties",
};

const ROMAN_VALUES: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

const ABBREVIATIONS: Array<[RegExp, string]> = [
  [/\bMr\./g, "Mister"],
  [/\bMrs\./g, "Misses"],
  [/\bMs\./g, "Miz"],
  [/\bDr\./g, "Doctor"],
  [/\bProf\./g, "Professor"],
  [/\bNo\./g, "number"],
  [/\be\.g\./gi, "for example"],
  [/\bi\.e\./gi, "that is"],
  [/\betc\./gi, "et cetera"],
  [/\bvs\./gi, "versus"],
];

const DOTTED_ACRONYM_PATTERN = /\b(?:[A-Z]\.){2,}(?=[\s,;:!?)]|$)/g;

const URL_PATTERN = /\b(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?/gi;

const ADDRESS_ABBREVIATIONS: Array<{ abbreviation: string; expansion: string }> = [
  { abbreviation: "St", expansion: "Street" },
  { abbreviation: "Ave", expansion: "Avenue" },
  { abbreviation: "Blvd", expansion: "Boulevard" },
  { abbreviation: "Rd", expansion: "Road" },
  { abbreviation: "Ln", expansion: "Lane" },
  { abbreviation: "Ct", expansion: "Court" },
  { abbreviation: "Dr", expansion: "Drive" },
];

const FRACTION_DENOMINATORS: Record<number, { singular: string; plural: string }> = {
  2: { singular: "half", plural: "halves" },
  3: { singular: "third", plural: "thirds" },
  4: { singular: "quarter", plural: "quarters" },
  5: { singular: "fifth", plural: "fifths" },
  6: { singular: "sixth", plural: "sixths" },
  7: { singular: "seventh", plural: "sevenths" },
  8: { singular: "eighth", plural: "eighths" },
  9: { singular: "ninth", plural: "ninths" },
  10: { singular: "tenth", plural: "tenths" },
  11: { singular: "eleventh", plural: "elevenths" },
  12: { singular: "twelfth", plural: "twelfths" },
  20: { singular: "twentieth", plural: "twentieths" },
};

const TERMINAL_PUNCTUATION_CUES = new Set([
  "a",
  "an",
  "and",
  "are",
  "at",
  "been",
  "by",
  "for",
  "from",
  "had",
  "has",
  "have",
  "he",
  "her",
  "his",
  "i",
  "in",
  "is",
  "it",
  "its",
  "me",
  "my",
  "of",
  "on",
  "our",
  "she",
  "that",
  "the",
  "their",
  "them",
  "they",
  "to",
  "was",
  "we",
  "were",
  "with",
  "you",
  "your",
]);

type HeteronymContextTest = (before: string[], after: string[]) => boolean;

interface HeteronymRule {
  alternateSpelling: string;
  contextTest: HeteronymContextTest;
}

function contextIncludesAny(context: string[], candidates: string[]): boolean {
  return context.some((value) => candidates.includes(value));
}

const HETERONYM_TABLE: Record<string, HeteronymRule> = {
  read: {
    alternateSpelling: "red",
    contextTest: (before, after) =>
      contextIncludesAny(before, ["had", "has", "have", "already", "just"]) ||
      contextIncludesAny(after, ["already", "before", "earlier", "last", "then", "yesterday", "ago"]),
  },
  wind: {
    alternateSpelling: "wined",
    contextTest: (before, after) =>
      contextIncludesAny(before, ["can", "could", "must", "please", "should", "to", "will", "would"]) ||
      contextIncludesAny(after, ["around", "down", "through", "up"]),
  },
  tear: {
    alternateSpelling: "tier",
    contextTest: (before, after) =>
      contextIncludesAny(before, ["a", "her", "his", "my", "one", "the", "their", "your"]) ||
      contextIncludesAny(after, ["cheek", "down", "drop", "drops", "eyes", "fell", "from", "rolled"]),
  },
  close: {
    alternateSpelling: "klohs",
    contextTest: (before, after) =>
      contextIncludesAny(before, ["draw", "keep", "stay", "too", "very"]) ||
      contextIncludesAny(after, ["by", "enough", "to"]),
  },
  lead: {
    alternateSpelling: "led",
    contextTest: (_before, after) =>
      contextIncludesAny(after, ["bullet", "bullets", "paint", "pipe", "pipes", "poisoning", "shot", "weight", "weights"]),
  },
  live: {
    alternateSpelling: "lyve",
    contextTest: (_before, after) =>
      contextIncludesAny(after, ["audience", "band", "broadcast", "event", "music", "performance", "show", "stream"]),
  },
  bow: {
    alternateSpelling: "bau",
    contextTest: (before, after) =>
      contextIncludesAny(before, ["must", "please", "to", "will", "would"]) ||
      contextIncludesAny(after, ["before", "down", "gracefully", "out"]),
  },
  minute: {
    alternateSpelling: "mynewt",
    contextTest: (before, after) =>
      contextIncludesAny(before, ["a", "an", "so", "that", "this"]) &&
      contextIncludesAny(after, ["amount", "change", "changes", "detail", "details", "difference", "differences"]),
  },
};

export function stableSegmentTextHash(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function numberToWords(value: number, options: { preferYearLike?: boolean } = {}): string {
  const { preferYearLike = true } = options;
  if (!Number.isInteger(value) || value < 0 || value > 999999) return String(value);
  if (value < 20) return SMALL_NUMBERS[value];
  if (value < 100) {
    const tens = Math.floor(value / 10) * 10;
    const ones = value % 10;
    return ones === 0 ? TENS[tens] : `${TENS[tens]} ${SMALL_NUMBERS[ones]}`;
  }
  if (value < 1000) {
    const hundreds = Math.floor(value / 100);
    const rest = value % 100;
    return rest === 0
      ? `${SMALL_NUMBERS[hundreds]} hundred`
      : `${SMALL_NUMBERS[hundreds]} hundred ${numberToWords(rest)}`;
  }
  if (preferYearLike) {
    const vernacularYear = fourDigitYearLikeToWords(value);
    if (vernacularYear) {
      return vernacularYear;
    }
  }
  const thousands = Math.floor(value / 1000);
  const rest = value % 1000;
  return rest === 0
    ? `${numberToWords(thousands)} thousand`
    : `${numberToWords(thousands)} thousand ${numberToWords(rest)}`;
}

function fourDigitYearLikeToWords(value: number): string | null {
  if (value >= 1100 && value <= 1999) {
    const leading = Math.floor(value / 100);
    const rest = value % 100;
    if (rest === 0) return `${numberToWords(leading)} hundred`;
    return rest < 10
      ? `${numberToWords(leading)} oh ${numberToWords(rest)}`
      : `${numberToWords(leading)} ${numberToWords(rest)}`;
  }

  if (value === 2000) return "two thousand";
  if (value >= 2001 && value <= 2009) return `two thousand ${numberToWords(value - 2000)}`;
  if (value >= 2010 && value <= 2099) return `twenty ${numberToWords(value - 2000)}`;
  return null;
}

function ordinalToWords(value: number): string {
  if (value in ORDINAL_SMALL) return ORDINAL_SMALL[value];
  if (value in ORDINAL_TENS) return ORDINAL_TENS[value];
  if (value < 100) {
    const tens = Math.floor(value / 10) * 10;
    const ones = value % 10;
    return `${TENS[tens]} ${ordinalToWords(ones)}`;
  }
  if (value < 1000) {
    const hundreds = Math.floor(value / 100);
    const rest = value % 100;
    return rest === 0
      ? `${SMALL_NUMBERS[hundreds]} hundredth`
      : `${SMALL_NUMBERS[hundreds]} hundred ${ordinalToWords(rest)}`;
  }
  return numberToWords(value);
}

function yearToWords(value: number): string {
  const vernacularYear = fourDigitYearLikeToWords(value);
  if (vernacularYear) return vernacularYear;
  return numberToWords(value);
}

function parseNumericToken(value: string): number {
  return Number(value.replace(/,/g, ""));
}

function twoDigitDecadeToWords(value: number): string {
  const tens = Math.floor(value / 10) * 10;
  return DECADE_WORDS[tens] ?? `${numberToWords(value)}s`;
}

function yearDecadeToWords(yearValue: number): string {
  if (yearValue >= 1900 && yearValue <= 1999) {
    return `nineteen ${twoDigitDecadeToWords(yearValue % 100)}`;
  }
  if (yearValue >= 2000 && yearValue <= 2099) {
    return `twenty ${twoDigitDecadeToWords(yearValue % 100)}`;
  }
  const thousands = Math.floor(yearValue / 1000);
  const remainder = yearValue % 1000;
  return remainder > 0
    ? `${numberToWords(thousands)} thousand ${numberToWords(remainder)}s`
    : `${numberToWords(thousands)} thousand`;
}

function romanToNumber(value: string): number | null {
  let total = 0;
  let previous = 0;
  const roman = value.toUpperCase();
  if (!/^(?=[MDCLXVI])M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(roman)) {
    return null;
  }
  for (let i = roman.length - 1; i >= 0; i -= 1) {
    const current = ROMAN_VALUES[roman[i]] ?? 0;
    total += current < previous ? -current : current;
    previous = Math.max(previous, current);
  }
  return total > 0 ? total : null;
}

function applyTracked(
  text: string,
  transforms: SegmentNormalizationTransform[],
  id: SegmentNormalizationTransformId,
  fn: TransformFn,
): string {
  const next = fn(text);
  if (next !== text) transforms.push({ id });
  return next;
}

function normalizeUnicode(text: string): string {
  return text.normalize("NFKC");
}

function removeCitationMarkers(text: string): string {
  return text
    .replace(/(?<=\p{L})\[\d{1,3}\]/gu, "")
    .replace(/\s+\[\d{1,3}\](?=\s|[.,;:!?]|$)/g, "");
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function expandRomanNumerals(text: string): string {
  return text.replace(/\b(chapter|part|book|volume)\s+([IVXLCDM]{1,8})\b/gi, (match, label: string, roman: string) => {
    const value = romanToNumber(roman);
    return value == null ? match : `${label} ${numberToWords(value)}`;
  });
}

function normalizeDottedAcronyms(text: string): string {
  return text.replace(DOTTED_ACRONYM_PATTERN, (match) => match.replace(/\./g, ""));
}

function expandAddressAbbreviations(text: string): string {
  let result = text;
  for (const { abbreviation, expansion } of ADDRESS_ABBREVIATIONS) {
    const beforeNumber = new RegExp(`\\b${abbreviation}\\.(?=\\s+\\d{1,6}\\b)`, "gi");
    const afterNumber = new RegExp(`\\b(\\d{1,6})\\s+${abbreviation}\\.(?=\\s|$|[.,;:!?])`, "gi");
    result = result.replace(beforeNumber, expansion);
    result = result.replace(afterNumber, `$1 ${expansion}`);
  }
  return result;
}

function normalizeUrls(text: string): string {
  return text.replace(URL_PATTERN, (match) => {
    const trailingPunctuationMatch = match.match(/[),.!?;:]+$/);
    const trailingPunctuation = trailingPunctuationMatch ? trailingPunctuationMatch[0] : "";
    const core = trailingPunctuation.length > 0 ? match.slice(0, -trailingPunctuation.length) : match;
    if (!/[A-Za-z]/.test(core)) return match;

    const withoutProtocol = core.replace(/^https?:\/\//i, "");
    const withoutWww = withoutProtocol.replace(/^www\./i, "");
    const withoutQuery = withoutWww.replace(/[?#].*$/, "");
    const [domainPart, ...pathParts] = withoutQuery.split("/");
    if (!domainPart || !domainPart.includes(".")) return match;

    const domainTokens = domainPart.split(".").filter(Boolean);
    const topLevel = domainTokens[domainTokens.length - 1] ?? "";
    if (!/^[A-Za-z]{2,}$/.test(topLevel)) return match;

    const spokenDomain = domainTokens.map((piece) => piece.replace(/-/g, " ")).join(" dot ");
    const spokenPath = pathParts
      .map((segment) => segment.replace(/[-_.]+/g, " ").trim())
      .filter((segment) => segment.length > 0)
      .join(" slash ");

    return `${spokenDomain}${spokenPath.length > 0 ? ` slash ${spokenPath}` : ""}${trailingPunctuation}`;
  });
}

function expandDates(text: string): string {
  let result = text.replace(
    /\b(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/(\d{4})\b/g,
    (_match, month: string, day: string, year: string) =>
      `${MONTHS_BY_NUMBER[Number(month)]} ${ordinalToWords(Number(day))}, ${yearToWords(Number(year))}`,
  );
  result = result.replace(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(\d{4})\b/gi,
    (_match, month: string, day: string, year: string) =>
      `${MONTHS[month.toLowerCase()]} ${ordinalToWords(Number(day))}, ${yearToWords(Number(year))}`,
  );
  return result;
}

function expandTimes(text: string): string {
  let result = text.replace(
    /\b(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.|am|pm|a\.m|p\.m)(?=\s|[.,!?;:]|$)/gi,
    (_match, hour: string, minute: string, marker: string) => {
      const minuteValue = Number(minute);
      const minuteWords = minuteValue < 10 ? `oh ${numberToWords(minuteValue)}` : numberToWords(minuteValue);
      const markerWords = marker.toLowerCase().startsWith("a") ? "A M" : "P M";
      return `${numberToWords(Number(hour))} ${minuteWords} ${markerWords}`;
    },
  );
  result = result.replace(
    /\b(\d{1,2})\s*(a\.m\.|p\.m\.|am|pm|a\.m|p\.m)(?=\s|[.,!?;:]|$)/gi,
    (_match, hour: string, marker: string) => {
      const markerWords = marker.toLowerCase().startsWith("a") ? "A M" : "P M";
      return `${numberToWords(Number(hour))} ${markerWords}`;
    },
  );
  return result;
}

function expandCurrency(text: string): string {
  return text.replace(/\$(\d{1,3}(?:,\d{3})+|\d{1,9})(?:\.(\d{2}))?/g, (_match, dollars: string, cents?: string) => {
    const dollarValue = parseNumericToken(dollars);
    const centValue = cents == null ? 0 : Number(cents);
    const dollarUnit = dollarValue === 1 ? "dollar" : "dollars";
    if (centValue === 0) return `${numberToWords(dollarValue, { preferYearLike: false })} ${dollarUnit}`;
    const centUnit = centValue === 1 ? "cent" : "cents";
    return `${numberToWords(dollarValue, { preferYearLike: false })} ${dollarUnit} and ${numberToWords(centValue)} ${centUnit}`;
  });
}

function expandFractions(text: string): string {
  return text.replace(/\b(\d{1,3})\/(\d{1,3})\b(?!\/\d)/g, (_match, numeratorRaw: string, denominatorRaw: string) => {
    const numerator = Number(numeratorRaw);
    const denominator = Number(denominatorRaw);
    if (denominator === 0) return _match;

    const denominatorWords =
      FRACTION_DENOMINATORS[denominator] ??
      {
        singular: ordinalToWords(denominator),
        plural: `${ordinalToWords(denominator)}s`,
      };
    const resolvedDenominator = numerator === 1 ? denominatorWords.singular : denominatorWords.plural;
    return `${numberToWords(numerator)} ${resolvedDenominator}`;
  });
}

function expandDecimals(text: string): string {
  return text.replace(/\b(\d{1,3}(?:,\d{3})+|\d{1,9})\.(\d+)\b(?!\.)/g, (_match, whole: string, fractional: string) => {
    const wholeWords = numberToWords(parseNumericToken(whole));
    const fractionalWords = fractional
      .split("")
      .map((digit) => numberToWords(Number(digit)))
      .join(" ");
    return `${wholeWords} point ${fractionalWords}`;
  });
}

function expandNumberRanges(text: string): string {
  return text.replace(/\b(\d{1,3}(?:,\d{3})+|\d{1,9})\s*[-–—]\s*(\d{1,3}(?:,\d{3})+|\d{1,9})\b/g, (_match, start: string, end: string) => {
    return `${numberToWords(parseNumericToken(start))} to ${numberToWords(parseNumericToken(end))}`;
  });
}

function expandDecades(text: string): string {
  let result = text.replace(/\b(\d{4})s\b/g, (_match, year: string) => {
    const value = Number(year);
    if (value >= 1900 && value <= 2099 && value % 10 === 0) {
      return yearDecadeToWords(value);
    }
    return _match;
  });

  result = result.replace(/(^|[\s([{"“‘])'(\d{2})s\b/g, (_match, prefix: string, yearSuffix: string) => {
    const suffix = Number(yearSuffix);
    if (!Number.isFinite(suffix) || suffix % 10 !== 0) return _match;
    return `${prefix}nineteen ${twoDigitDecadeToWords(suffix)}`;
  });

  return result;
}

function expandAbbreviations(text: string): string {
  let result = text;
  for (const [pattern, replacement] of ABBREVIATIONS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function collapseSpacedInitials(text: string): string {
  return text.replace(/\b[A-Za-z]\.(?:\s+[A-Za-z]\.)+/g, (match) =>
    match.replace(/\./g, "").replace(/\s+/g, " ").trim(),
  );
}

function expandOrdinals(text: string): string {
  return text.replace(/\b(\d{1,3})(st|nd|rd|th)\b/gi, (_match, value: string) => ordinalToWords(Number(value)));
}

function expandCardinals(text: string): string {
  return text.replace(/\b(?:\d{1,3}(?:,\d{3})+|\d{1,6})\b/g, (match) => numberToWords(parseNumericToken(match)));
}

function enforceTerminalPunctuation(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) return text;
  if (/[\.\!\?](["')\]]+)?$/.test(trimmed)) return trimmed;

  const wordsOriginal = trimmed.match(/[A-Za-z']+/g) ?? [];
  const words = wordsOriginal.map((word) => word.toLowerCase());
  if (words.length < 4) return text;
  const uppercaseWordCount = wordsOriginal.filter((word) => /^[A-Z]{2,}$/.test(word)).length;
  if (uppercaseWordCount >= 3 && uppercaseWordCount / words.length >= 0.5) return text;
  if (!words.some((word) => TERMINAL_PUNCTUATION_CUES.has(word))) return text;

  if (/["')\]]+$/.test(trimmed)) {
    return trimmed.replace(/(["')\]]+)$/, ".$1");
  }
  return `${trimmed}.`;
}

function downcaseAllCapsQuotes(text: string): string {
  return text.replace(/"([^"\n]+)"/g, (match, inner: string) => {
    const letters = inner.match(/[A-Za-z]/g);
    if (!letters || letters.length < 2) return match;
    const isAllCaps = letters.every((letter) => letter === letter.toUpperCase());
    return isAllCaps ? `"${inner.toLowerCase()}"` : match;
  });
}

function applyAlternateWordCasing(source: string, replacement: string): string {
  if (source === source.toUpperCase()) return replacement.toUpperCase();
  if (/^[A-Z]/.test(source)) return `${replacement.charAt(0).toUpperCase()}${replacement.slice(1)}`;
  return replacement;
}

function disambiguateHeteronyms(text: string): string {
  const segments = text.split(/([A-Za-z]+)/);
  const wordIndexes: number[] = [];
  const words: string[] = [];

  for (let i = 0; i < segments.length; i += 1) {
    if (/^[A-Za-z]+$/.test(segments[i])) {
      wordIndexes.push(i);
      words.push(segments[i].toLowerCase());
    }
  }

  let changed = false;
  for (let wordPosition = 0; wordPosition < words.length; wordPosition += 1) {
    const lemma = words[wordPosition];
    const rule = HETERONYM_TABLE[lemma];
    if (!rule) continue;

    const before = words.slice(Math.max(0, wordPosition - 3), wordPosition);
    const after = words.slice(wordPosition + 1, wordPosition + 4);
    if (!rule.contextTest(before, after)) continue;

    const segmentIndex = wordIndexes[wordPosition];
    const originalWord = segments[segmentIndex];
    segments[segmentIndex] = applyAlternateWordCasing(originalWord, rule.alternateSpelling);
    changed = true;
  }

  return changed ? segments.join("") : text;
}

function tokenKey(token: string): string {
  return token.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

function buildLcsMatches(originalKeys: string[], normalizedKeys: string[]): Array<{ originalIndex: number; normalizedIndex: number }> {
  const n = originalKeys.length;
  const m = normalizedKeys.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array<number>(m + 1).fill(0));

  for (let oi = n - 1; oi >= 0; oi -= 1) {
    for (let ni = m - 1; ni >= 0; ni -= 1) {
      if (originalKeys[oi].length > 0 && originalKeys[oi] === normalizedKeys[ni]) {
        dp[oi][ni] = dp[oi + 1][ni + 1] + 1;
      } else {
        dp[oi][ni] = Math.max(dp[oi + 1][ni], dp[oi][ni + 1]);
      }
    }
  }

  const matches: Array<{ originalIndex: number; normalizedIndex: number }> = [];
  let oi = 0;
  let ni = 0;
  while (oi < n && ni < m) {
    if (originalKeys[oi].length > 0 && originalKeys[oi] === normalizedKeys[ni]) {
      matches.push({ originalIndex: oi, normalizedIndex: ni });
      oi += 1;
      ni += 1;
      continue;
    }
    if (dp[oi + 1][ni] >= dp[oi][ni + 1]) {
      oi += 1;
    } else {
      ni += 1;
    }
  }
  return matches;
}

function buildNormalizedToOriginalMap(originalText: string, normalizedText: string): number[] {
  const originalWords = segmentWords(originalText);
  const normalizedWords = segmentWords(normalizedText);
  if (normalizedWords.length === 0) return [];
  if (originalWords.length === 0) return normalizedWords.map(() => 0);

  const originalKeys = originalWords.map(tokenKey);
  const normalizedKeys = normalizedWords.map(tokenKey);
  const matches = buildLcsMatches(originalKeys, normalizedKeys);
  const map = new Array<number>(normalizedWords.length).fill(0);

  const assignInterval = (
    originalStart: number,
    originalEnd: number,
    normalizedStart: number,
    normalizedEnd: number,
    fallbackOriginalIndex: number,
  ) => {
    if (normalizedStart > normalizedEnd) return;
    const normalizedCount = normalizedEnd - normalizedStart + 1;
    const originalCount = originalEnd >= originalStart ? originalEnd - originalStart + 1 : 0;

    if (originalCount <= 0) {
      const clampedFallback = Math.max(0, Math.min(originalWords.length - 1, fallbackOriginalIndex));
      for (let ni = normalizedStart; ni <= normalizedEnd; ni += 1) {
        map[ni] = clampedFallback;
      }
      return;
    }

    for (let ni = normalizedStart; ni <= normalizedEnd; ni += 1) {
      const intervalOffset = ni - normalizedStart;
      const targetOffset = Math.min(
        originalCount - 1,
        Math.floor(((intervalOffset + 0.5) * originalCount) / normalizedCount),
      );
      map[ni] = originalStart + targetOffset;
    }
  };

  let previousOriginal = -1;
  let previousNormalized = -1;

  for (const match of matches) {
    assignInterval(
      previousOriginal + 1,
      match.originalIndex - 1,
      previousNormalized + 1,
      match.normalizedIndex - 1,
      previousOriginal >= 0 ? previousOriginal : 0,
    );
    map[match.normalizedIndex] = match.originalIndex;
    previousOriginal = match.originalIndex;
    previousNormalized = match.normalizedIndex;
  }

  assignInterval(
    previousOriginal + 1,
    originalWords.length - 1,
    previousNormalized + 1,
    normalizedWords.length - 1,
    previousOriginal >= 0 ? previousOriginal : 0,
  );

  return map;
}

export function normalizeSegmentText(
  text: string,
  options: SegmentNormalizationOptions = {},
): SegmentNormalizationResult {
  const locale = options.locale ?? "en-US";
  const transforms: SegmentNormalizationTransform[] = [];
  const pronunciationOverrideHash = overrideHash(options.pronunciationOverrides);
  let normalizedText = text;

  if (pronunciationOverrideHash) {
    normalizedText = applyPronunciationOverrides(normalizedText, options.pronunciationOverrides);
    if (normalizedText !== text) transforms.push({ id: "pronunciation-overrides" });
  }

  normalizedText = applyTracked(normalizedText, transforms, "unicode-nfkc", normalizeUnicode);
  normalizedText = applyTracked(normalizedText, transforms, "citation-marker-removal", removeCitationMarkers);
  normalizedText = applyTracked(normalizedText, transforms, "whitespace-normalization", normalizeWhitespace);
  normalizedText = applyTracked(normalizedText, transforms, "roman-numeral-expansion", expandRomanNumerals);
  normalizedText = applyTracked(normalizedText, transforms, "dotted-acronym-normalization", normalizeDottedAcronyms);
  normalizedText = applyTracked(normalizedText, transforms, "address-abbreviation-expansion", expandAddressAbbreviations);
  normalizedText = applyTracked(normalizedText, transforms, "url-normalization", normalizeUrls);
  normalizedText = applyTracked(normalizedText, transforms, "date-expansion", expandDates);
  normalizedText = applyTracked(normalizedText, transforms, "time-expansion", expandTimes);
  normalizedText = applyTracked(normalizedText, transforms, "currency-expansion", expandCurrency);
  normalizedText = applyTracked(normalizedText, transforms, "fraction-expansion", expandFractions);
  normalizedText = applyTracked(normalizedText, transforms, "decimal-expansion", expandDecimals);
  normalizedText = applyTracked(normalizedText, transforms, "number-range-expansion", expandNumberRanges);
  normalizedText = applyTracked(normalizedText, transforms, "decade-expansion", expandDecades);
  normalizedText = applyTracked(normalizedText, transforms, "abbreviation-expansion", expandAbbreviations);
  normalizedText = applyTracked(normalizedText, transforms, "spaced-initials", collapseSpacedInitials);
  normalizedText = applyTracked(normalizedText, transforms, "ordinal-expansion", expandOrdinals);
  normalizedText = applyTracked(normalizedText, transforms, "cardinal-expansion", expandCardinals);
  normalizedText = applyTracked(
    normalizedText,
    transforms,
    "terminal-punctuation-enforcement",
    enforceTerminalPunctuation,
  );
  normalizedText = applyTracked(normalizedText, transforms, "all-caps-quote-downcasing", downcaseAllCapsQuotes);
  normalizedText = applyTracked(normalizedText, transforms, "heteronym-disambiguation", disambiguateHeteronyms);
  const normalizedToOriginalMap = buildNormalizedToOriginalMap(text, normalizedText);

  const sourceTextHash = stableSegmentTextHash(text);
  const normalizedTextHash = stableSegmentTextHash(normalizedText);
  const normalizationHash = stableSegmentTextHash([
    TTS_NORMALIZER_VERSION,
    locale,
    sourceTextHash,
    normalizedTextHash,
    pronunciationOverrideHash,
    transforms.map((transform) => transform.id).join(","),
  ].join("|"));

  return {
    originalText: text,
    normalizedText,
    normalizedToOriginalMap,
    locale,
    normalizerVersion: TTS_NORMALIZER_VERSION,
    sourceTextHash,
    normalizedTextHash,
    pronunciationOverrideHash,
    normalizationHash,
    transforms,
  };
}
