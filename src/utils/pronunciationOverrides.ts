// src/utils/pronunciationOverrides.ts — Shared text normalization for TTS (TTS-6E)
//
// Applies user-defined pronunciation overrides before TTS synthesis.
// Used by both Web Speech and Kokoro paths.

import type { PronunciationOverride } from "../types";

/**
 * Apply enabled pronunciation overrides to text in order.
 * Case-insensitive whole-word replacement using word boundaries.
 * Returns the normalized text ready for TTS synthesis.
 */
export function applyPronunciationOverrides(
  text: string,
  overrides: PronunciationOverride[] | undefined,
): string {
  if (!overrides || overrides.length === 0) return text;

  let result = text;
  for (const override of overrides) {
    if (!override.enabled || !override.from) continue;
    // Escape regex special chars in the "from" string
    const escaped = override.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Use word boundaries where possible. If the from text starts/ends with non-word chars,
    // use lookahead/lookbehind for whitespace or string boundary instead.
    const startsWithWord = /^\w/.test(override.from);
    const endsWithWord = /\w$/.test(override.from);
    const prefix = startsWithWord ? "\\b" : "(?<=\\s|^)";
    const suffix = endsWithWord ? "\\b" : "(?=\\s|$)";
    const regex = new RegExp(`${prefix}${escaped}${suffix}`, "gi");
    result = result.replace(regex, override.to);
  }
  return result;
}

/**
 * Merge global and per-book overrides into one effective list.
 * Global overrides apply first, then book-specific overrides layer on top.
 * This ensures book overrides can refine or override global rules.
 */
export function mergeOverrides(
  globalOverrides: PronunciationOverride[] | undefined,
  bookOverrides: PronunciationOverride[] | undefined,
): PronunciationOverride[] {
  const global = globalOverrides || [];
  const book = bookOverrides || [];
  if (book.length === 0) return global;
  if (global.length === 0) return book;
  return [...global, ...book];
}

/**
 * Compute a stable hash of the active override set for cache identity.
 * Returns empty string when no overrides are active.
 */
export function overrideHash(overrides: PronunciationOverride[] | undefined): string {
  if (!overrides || overrides.length === 0) return "";
  const active = overrides
    .filter(o => o.enabled && o.from)
    .map(o => `${o.from}=${o.to}`)
    .join("|");
  if (!active) return "";
  // Simple FNV-1a-inspired hash for compact cache key
  let h = 2166136261;
  for (let i = 0; i < active.length; i++) {
    h ^= active.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}
