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
  | "date-expansion"
  | "time-expansion"
  | "currency-expansion"
  | "abbreviation-expansion"
  | "spaced-initials"
  | "ordinal-expansion"
  | "cardinal-expansion";

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

export function stableSegmentTextHash(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function numberToWords(value: number): string {
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
  if (value < 10000 && value >= 2000 && value <= 2099) {
    const rest = value % 2000;
    return rest === 0 ? "two thousand" : `twenty ${numberToWords(rest)}`;
  }
  const thousands = Math.floor(value / 1000);
  const rest = value % 1000;
  return rest === 0
    ? `${numberToWords(thousands)} thousand`
    : `${numberToWords(thousands)} thousand ${numberToWords(rest)}`;
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
  if (value >= 2000 && value <= 2099) return numberToWords(value);
  if (value >= 1900 && value <= 1999) {
    const rest = value % 1900;
    return rest === 0 ? "nineteen hundred" : `nineteen ${numberToWords(rest)}`;
  }
  return numberToWords(value);
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
  return text.replace(
    /\b(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.|am|pm|a\.m|p\.m)(?=\s|[.,!?;:]|$)/gi,
    (_match, hour: string, minute: string, marker: string) => {
      const minuteValue = Number(minute);
      const minuteWords = minuteValue < 10 ? `oh ${numberToWords(minuteValue)}` : numberToWords(minuteValue);
      const markerWords = marker.toLowerCase().startsWith("a") ? "A M" : "P M";
      return `${numberToWords(Number(hour))} ${minuteWords} ${markerWords}`;
    },
  );
}

function expandCurrency(text: string): string {
  return text.replace(/\$(\d{1,6})(?:\.(\d{2}))?/g, (_match, dollars: string, cents?: string) => {
    const dollarValue = Number(dollars);
    const centValue = cents == null ? 0 : Number(cents);
    const dollarUnit = dollarValue === 1 ? "dollar" : "dollars";
    if (centValue === 0) return `${numberToWords(dollarValue)} ${dollarUnit}`;
    const centUnit = centValue === 1 ? "cent" : "cents";
    return `${numberToWords(dollarValue)} ${dollarUnit} and ${numberToWords(centValue)} ${centUnit}`;
  });
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
  return text.replace(/\b\d{1,6}\b/g, (match) => numberToWords(Number(match)));
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
  normalizedText = applyTracked(normalizedText, transforms, "date-expansion", expandDates);
  normalizedText = applyTracked(normalizedText, transforms, "time-expansion", expandTimes);
  normalizedText = applyTracked(normalizedText, transforms, "currency-expansion", expandCurrency);
  normalizedText = applyTracked(normalizedText, transforms, "abbreviation-expansion", expandAbbreviations);
  normalizedText = applyTracked(normalizedText, transforms, "spaced-initials", collapseSpacedInitials);
  normalizedText = applyTracked(normalizedText, transforms, "ordinal-expansion", expandOrdinals);
  normalizedText = applyTracked(normalizedText, transforms, "cardinal-expansion", expandCardinals);
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
