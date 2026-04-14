"use strict";
// main/metadata-utils.js — Filename metadata extraction utilities
// CommonJS only — Electron main process

const path = require("path");

/**
 * Parse metadata from a filename using common naming patterns.
 *
 * Supported patterns:
 *   "Author - Title.epub"       → { suggestedAuthor: "Author", suggestedTitle: "Title" }
 *   "Title (Author).epub"       → { suggestedTitle: "Title", suggestedAuthor: "Author" }
 *   "Title [Author].epub"       → { suggestedTitle: "Title", suggestedAuthor: "Author" }
 *   "Last, First - Title.epub"  → { suggestedAuthor: "Last, First", suggestedTitle: "Title" }
 *   "Title.epub"                → { suggestedTitle: "Title" }
 *
 * @param {string} filename - filename or full path (extension is stripped)
 * @returns {{ suggestedTitle?: string, suggestedAuthor?: string }}
 */
function parseFilenameMetadata(filename) {
  if (!filename || typeof filename !== "string") return {};

  // Strip directory and extension
  // Handle both Windows and POSIX paths properly in tests across environments
  const normalizedFilename = filename.replace(/\\/g, "/");
  const base = path.basename(normalizedFilename, path.extname(normalizedFilename));
  if (!base.trim()) return {};

  // Pattern 1: "Author - Title" (most common ebook convention)
  // Also handles "Last, First - Title"
  const dashMatch = base.match(/^(.+?)\s+-\s+(.+)$/);
  if (dashMatch) {
    const left = dashMatch[1].trim();
    const right = dashMatch[2].trim();
    if (left && right) {
      return { suggestedAuthor: left, suggestedTitle: right };
    }
  }

  // Pattern 2: "Title (Author)" — parentheses at end
  const parenMatch = base.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (parenMatch) {
    const title = parenMatch[1].trim();
    const author = parenMatch[2].trim();
    if (title && author) {
      return { suggestedTitle: title, suggestedAuthor: author };
    }
  }

  // Pattern 3: "Title [Author]" — brackets at end
  const bracketMatch = base.match(/^(.+?)\s*\[([^\]]+)\]\s*$/);
  if (bracketMatch) {
    const title = bracketMatch[1].trim();
    const author = bracketMatch[2].trim();
    if (title && author) {
      return { suggestedTitle: title, suggestedAuthor: author };
    }
  }

  // Fallback: entire basename is the title
  return { suggestedTitle: base.trim() };
}

module.exports = { parseFilenameMetadata };
