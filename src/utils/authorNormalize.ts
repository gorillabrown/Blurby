// src/utils/authorNormalize.ts — Author name normalization utility
// Normalizes author names to "Last, First" format for consistent library sorting.

/** Lowercase prefixes that are part of the last name (e.g., "de Souza", "van Gogh") */
const LAST_NAME_PREFIXES = new Set([
  "de", "da", "do", "dos", "das",
  "van", "von", "der", "den", "het",
  "del", "della", "di", "el", "al", "la", "le", "les",
  "bin", "ibn", "abu",
  "mc", "mac",
  "st", "saint",
]);

/** Separators used to split multiple authors */
const MULTI_AUTHOR_SEPARATORS = /\s+and\s+|\s*&\s*|\s*;\s*/i;

/**
 * Normalize a single author name to "Last, First" format.
 * - "John Smith" → "Smith, John"
 * - "Smith, John" → "Smith, John" (idempotent)
 * - "João de Souza" → "de Souza, João"
 * - Single-word names pass through unchanged.
 * - Empty/undefined returns as-is.
 */
function normalizeSingleAuthor(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;

  // Already in "Last, First" format — pass through
  if (trimmed.includes(",")) return trimmed;

  const parts = trimmed.split(/\s+/);

  // Single-word name — no transformation possible
  if (parts.length === 1) return trimmed;

  // Find where the last name begins by detecting prefixes.
  // Walk backwards from the end: the last word is always part of the last name.
  // Any preceding words that are known prefixes also belong to the last name.
  let lastNameStart = parts.length - 1;
  while (
    lastNameStart > 1 &&
    LAST_NAME_PREFIXES.has(parts[lastNameStart - 1].toLowerCase())
  ) {
    lastNameStart--;
  }

  const firstName = parts.slice(0, lastNameStart).join(" ");
  const lastName = parts.slice(lastNameStart).join(" ");

  if (!firstName) return trimmed; // safety: all words were last-name prefixes

  return `${lastName}, ${firstName}`;
}

/**
 * Normalize an author string, handling multiple authors.
 * - "Alice Smith and Bob Jones" → "Smith, Alice; Jones, Bob"
 * - Already-normalized strings pass through unchanged (idempotent).
 * - Empty/undefined/null returns empty string.
 *
 * NOTE: This function should NEVER be applied to `authorFull` —
 * that field preserves the original byline for display.
 */
export function normalizeAuthor(raw: string | undefined | null): string {
  if (!raw || typeof raw !== "string") return raw as string ?? "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  // Check for multi-author separators (but not semicolons in already-normalized strings)
  // If the string contains " and " or " & ", split and normalize each
  if (MULTI_AUTHOR_SEPARATORS.test(trimmed) && !trimmed.includes(",")) {
    const authors = trimmed.split(MULTI_AUTHOR_SEPARATORS).filter(Boolean);
    return authors.map(normalizeSingleAuthor).join("; ");
  }

  // If string contains semicolons, it might already be multi-author normalized,
  // or it might need per-segment normalization
  if (trimmed.includes(";")) {
    const segments = trimmed.split(";").map((s) => s.trim()).filter(Boolean);
    return segments.map(normalizeSingleAuthor).join("; ");
  }

  return normalizeSingleAuthor(trimmed);
}
