"use strict";
// main/author-normalize.js — Author name normalization (CommonJS, main process)
// Mirror of src/utils/authorNormalize.ts for use in Electron main process.

/** Lowercase prefixes that are part of the last name */
const LAST_NAME_PREFIXES = new Set([
  "de", "da", "do", "dos", "das",
  "van", "von", "der", "den", "het",
  "del", "della", "di", "el", "al", "la", "le", "les",
  "bin", "ibn", "abu",
  "mc", "mac",
  "st", "saint",
]);

const MULTI_AUTHOR_SEPARATORS = /\s+and\s+|\s*&\s*|\s*;\s*/i;

function normalizeSingleAuthor(name) {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes(",")) return trimmed;
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return trimmed;

  let lastNameStart = parts.length - 1;
  while (
    lastNameStart > 1 &&
    LAST_NAME_PREFIXES.has(parts[lastNameStart - 1].toLowerCase())
  ) {
    lastNameStart--;
  }

  const firstName = parts.slice(0, lastNameStart).join(" ");
  const lastName = parts.slice(lastNameStart).join(" ");
  if (!firstName) return trimmed;
  return `${lastName}, ${firstName}`;
}

function normalizeAuthor(raw) {
  if (!raw || typeof raw !== "string") return raw || "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  if (MULTI_AUTHOR_SEPARATORS.test(trimmed) && !trimmed.includes(",")) {
    const authors = trimmed.split(MULTI_AUTHOR_SEPARATORS).filter(Boolean);
    return authors.map(normalizeSingleAuthor).join("; ");
  }

  if (trimmed.includes(";")) {
    const segments = trimmed.split(";").map((s) => s.trim()).filter(Boolean);
    return segments.map(normalizeSingleAuthor).join("; ");
  }

  return normalizeSingleAuthor(trimmed);
}

module.exports = { normalizeAuthor };
