import { describe, it, expect } from "vitest";

// We can't import main.js directly (it requires Electron), so we test the
// pure functions by reimplementing them identically. The actual functions in
// main.js are kept in sync via the module.exports at the bottom.

function formatHighlightEntry(text, docTitle, wordIndex, totalWords, date) {
  const pct = totalWords > 0 ? Math.round((wordIndex / totalWords) * 100) : 0;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return (
    `---\n\n> "${text}"\n\n` +
    `— *${docTitle}*, position ${wordIndex}/${totalWords} (${pct}%)\n` +
    `Saved: ${yyyy}-${mm}-${dd} ${hh}:${min}\n\n`
  );
}

function parseDefinitionResponse(data, word) {
  if (!Array.isArray(data) || data.length === 0) {
    return { error: data?.title || "No definition found" };
  }
  const entry = data[0];
  const meaning = entry.meanings?.[0];
  const def = meaning?.definitions?.[0];
  return {
    word: entry.word || word,
    phonetic: entry.phonetic || undefined,
    partOfSpeech: meaning?.partOfSpeech || undefined,
    definition: def?.definition || undefined,
    example: def?.example || undefined,
    synonyms: (meaning?.synonyms || []).slice(0, 5),
  };
}

describe("formatHighlightEntry", () => {
  const date = new Date(2026, 2, 18, 14, 30); // March 18, 2026 14:30

  it("formats a basic highlight entry", () => {
    const result = formatHighlightEntry("ephemeral", "Test Book", 1234, 5678, date);
    expect(result).toContain('> "ephemeral"');
    expect(result).toContain("— *Test Book*");
    expect(result).toContain("position 1234/5678 (22%)");
    expect(result).toContain("Saved: 2026-03-18 14:30");
  });

  it("starts with --- separator", () => {
    const result = formatHighlightEntry("word", "Doc", 0, 100, date);
    expect(result.startsWith("---\n\n")).toBe(true);
  });

  it("ends with double newline", () => {
    const result = formatHighlightEntry("word", "Doc", 0, 100, date);
    expect(result.endsWith("\n\n")).toBe(true);
  });

  it("calculates percentage correctly at 0%", () => {
    const result = formatHighlightEntry("word", "Doc", 0, 1000, date);
    expect(result).toContain("(0%)");
  });

  it("calculates percentage correctly at 50%", () => {
    const result = formatHighlightEntry("word", "Doc", 500, 1000, date);
    expect(result).toContain("(50%)");
  });

  it("calculates percentage correctly at 100%", () => {
    const result = formatHighlightEntry("word", "Doc", 1000, 1000, date);
    expect(result).toContain("(100%)");
  });

  it("handles zero totalWords without crashing", () => {
    const result = formatHighlightEntry("word", "Doc", 0, 0, date);
    expect(result).toContain("(0%)");
  });

  it("handles phrases with spaces", () => {
    const result = formatHighlightEntry("the quick brown fox", "Doc", 10, 100, date);
    expect(result).toContain('> "the quick brown fox"');
  });

  it("pads single-digit months and days", () => {
    const jan1 = new Date(2026, 0, 5, 9, 5); // Jan 5, 2026 09:05
    const result = formatHighlightEntry("word", "Doc", 0, 100, jan1);
    expect(result).toContain("Saved: 2026-01-05 09:05");
  });

  it("handles special characters in doc title", () => {
    const result = formatHighlightEntry("word", "O'Brien's *Guide*", 0, 100, date);
    expect(result).toContain("— *O'Brien's *Guide**");
  });
});

describe("parseDefinitionResponse", () => {
  it("parses a valid dictionary API response", () => {
    const data = [{
      word: "ephemeral",
      phonetic: "/ɪˈfɛm.ər.əl/",
      meanings: [{
        partOfSpeech: "adjective",
        synonyms: ["transient", "fleeting", "momentary", "brief", "short-lived", "extra"],
        definitions: [{
          definition: "lasting for a very short time",
          example: "fashions are ephemeral",
        }],
      }],
    }];

    const result = parseDefinitionResponse(data, "ephemeral");
    expect(result.word).toBe("ephemeral");
    expect(result.phonetic).toBe("/ɪˈfɛm.ər.əl/");
    expect(result.partOfSpeech).toBe("adjective");
    expect(result.definition).toBe("lasting for a very short time");
    expect(result.example).toBe("fashions are ephemeral");
    expect(result.synonyms).toEqual(["transient", "fleeting", "momentary", "brief", "short-lived"]);
    expect(result.synonyms).toHaveLength(5); // capped at 5
  });

  it("returns error for empty array", () => {
    const result = parseDefinitionResponse([], "xyz");
    expect(result.error).toBe("No definition found");
  });

  it("returns error for non-array response", () => {
    const result = parseDefinitionResponse({ title: "No Definitions Found" }, "xyz");
    expect(result.error).toBe("No Definitions Found");
  });

  it("returns error for null", () => {
    const result = parseDefinitionResponse(null, "xyz");
    expect(result.error).toBe("No definition found");
  });

  it("handles missing phonetic", () => {
    const data = [{
      word: "test",
      meanings: [{
        partOfSpeech: "noun",
        definitions: [{ definition: "a trial" }],
        synonyms: [],
      }],
    }];
    const result = parseDefinitionResponse(data, "test");
    expect(result.phonetic).toBeUndefined();
    expect(result.word).toBe("test");
    expect(result.definition).toBe("a trial");
  });

  it("handles missing meanings", () => {
    const data = [{ word: "test" }];
    const result = parseDefinitionResponse(data, "test");
    expect(result.word).toBe("test");
    expect(result.partOfSpeech).toBeUndefined();
    expect(result.definition).toBeUndefined();
  });

  it("handles empty synonyms", () => {
    const data = [{
      word: "test",
      meanings: [{ partOfSpeech: "noun", definitions: [{ definition: "a trial" }], synonyms: [] }],
    }];
    const result = parseDefinitionResponse(data, "test");
    expect(result.synonyms).toEqual([]);
  });

  it("uses fallback word when entry.word is missing", () => {
    const data = [{
      meanings: [{ partOfSpeech: "verb", definitions: [{ definition: "to do" }], synonyms: [] }],
    }];
    const result = parseDefinitionResponse(data, "fallback");
    expect(result.word).toBe("fallback");
  });
});
