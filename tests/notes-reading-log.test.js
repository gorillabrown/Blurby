import { describe, it, expect } from "vitest";

// Pure function replicas from Sprint 20V (NotePopover) and Sprint 20W
// (log-reading-session). We reimplement them here identically so we can
// test without importing Electron-dependent modules.

// ---------------------------------------------------------------------------
// 1. APA Citation Builder (from NotePopover)
// ---------------------------------------------------------------------------
function buildCitation(author, title, sourceUrl, publishedDate) {
  const parts = [];
  if (author) parts.push(author);
  if (publishedDate) {
    try {
      const d = new Date(publishedDate);
      parts.push(`(${d.getFullYear()}).`);
    } catch {
      parts.push("(n.d.).");
    }
  } else {
    parts.push("(n.d.).");
  }
  parts.push(title + ".");
  if (sourceUrl) parts.push(sourceUrl);
  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// 2. Author Name Parsing (from log-reading-session)
// ---------------------------------------------------------------------------
function parseAuthorName(authorStr) {
  const parts = (authorStr || "").split(/\s+/);
  const last =
    parts.length > 1 ? parts[parts.length - 1] : authorStr || "";
  const first =
    parts.length > 1 ? parts.slice(0, -1).join(" ") : "";
  return { last, first };
}

// ---------------------------------------------------------------------------
// 3. Work Type Detection
// ---------------------------------------------------------------------------
function detectWorkType(source) {
  return source === "url" ? "Article" : "Book";
}

// ---------------------------------------------------------------------------
// 4. Page Estimation (250 words per page, ceil)
// ---------------------------------------------------------------------------
function estimatePages(wordCount) {
  if (wordCount <= 0) return 0;
  return Math.ceil(wordCount / 250);
}

// ---------------------------------------------------------------------------
// 5. HotkeyCoach Hint Lookup
// ---------------------------------------------------------------------------
const COACH_HINTS = {
  archive: { action: "archive", hotkey: "E" },
  favorite: { action: "favorite", hotkey: "S" },
  star: { action: "star", hotkey: "S" },
  search: { action: "search", hotkey: "/" },
  delete: { action: "delete", hotkey: "#" },
  queue: { action: "queue", hotkey: "Q" },
  settings: { action: "open settings", hotkey: "Ctrl+," },
  play: { action: "play/pause", hotkey: "Space" },
  enterFocus: { action: "enter Focus mode", hotkey: "Shift+Space" },
  enterFlow: { action: "enter Flow mode", hotkey: "Space" },
  narration: { action: "toggle narration", hotkey: "N" },
  fontSize: { action: "adjust font size", hotkey: "Ctrl+=/\u2212" },
  prevChapter: { action: "go to previous chapter", hotkey: "[" },
  nextChapter: { action: "go to next chapter", hotkey: "]" },
  menu: { action: "toggle menu", hotkey: "Tab" },
};

function getCoachHint(action) {
  return COACH_HINTS[action];
}

// ---------------------------------------------------------------------------
// 6. Snooze Time Calculations
// ---------------------------------------------------------------------------
function snoozeInOneHour() {
  return Date.now() + 3600000;
}

function snoozeTonight(now) {
  const d = new Date(now);
  // If already past 8 PM, push to next day 8 PM
  if (d.getHours() >= 20) {
    d.setDate(d.getDate() + 1);
  }
  d.setHours(20, 0, 0, 0);
  return d.getTime();
}

function snoozeTomorrowMorning(now) {
  const d = new Date(now);
  d.setDate(d.getDate() + 1);
  d.setHours(8, 0, 0, 0);
  return d.getTime();
}

// ===========================================================================
// Tests
// ===========================================================================

describe("buildCitation (APA)", () => {
  it("full citation: author + date + title + URL", () => {
    const result = buildCitation(
      "Jane Doe",
      "My Great Article",
      "https://example.com/article",
      "2024-06-15"
    );
    expect(result).toBe(
      "Jane Doe (2024). My Great Article. https://example.com/article"
    );
  });

  it("no author produces (n.d.) when date also missing", () => {
    const result = buildCitation(
      "",
      "Untitled",
      "https://example.com",
      null
    );
    expect(result).toBe("(n.d.). Untitled. https://example.com");
  });

  it("no date produces (n.d.) with author present", () => {
    const result = buildCitation(
      "John Smith",
      "Some Title",
      "https://example.com",
      null
    );
    expect(result).toBe(
      "John Smith (n.d.). Some Title. https://example.com"
    );
  });

  it("no URL omits trailing URL", () => {
    const result = buildCitation("Author", "Title", null, "2024-06-15");
    expect(result).toBe("Author (2024). Title.");
  });

  it("all empty fields", () => {
    const result = buildCitation("", "", "", null);
    expect(result).toBe("(n.d.). .");
  });

  it("date with different year", () => {
    const result = buildCitation("A", "B", null, "1999-12-31");
    expect(result).toBe("A (1999). B.");
  });
});

describe("parseAuthorName", () => {
  it("two-part name splits correctly", () => {
    expect(parseAuthorName("John Smith")).toEqual({
      last: "Smith",
      first: "John",
    });
  });

  it("three-part name keeps first two as first", () => {
    expect(parseAuthorName("John Michael Smith")).toEqual({
      last: "Smith",
      first: "John Michael",
    });
  });

  it("single name goes entirely to last", () => {
    expect(parseAuthorName("Smith")).toEqual({
      last: "Smith",
      first: "",
    });
  });

  it("empty string returns empty fields", () => {
    expect(parseAuthorName("")).toEqual({ last: "", first: "" });
  });

  it("null returns empty fields", () => {
    expect(parseAuthorName(null)).toEqual({ last: "", first: "" });
  });

  it("undefined returns empty fields", () => {
    expect(parseAuthorName(undefined)).toEqual({ last: "", first: "" });
  });
});

describe("detectWorkType", () => {
  it('source "url" returns Article', () => {
    expect(detectWorkType("url")).toBe("Article");
  });

  it('source "file" returns Book', () => {
    expect(detectWorkType("file")).toBe("Book");
  });

  it('source "folder" returns Book', () => {
    expect(detectWorkType("folder")).toBe("Book");
  });

  it("undefined source returns Book", () => {
    expect(detectWorkType(undefined)).toBe("Book");
  });
});

describe("estimatePages", () => {
  it("250 words = 1 page", () => {
    expect(estimatePages(250)).toBe(1);
  });

  it("500 words = 2 pages", () => {
    expect(estimatePages(500)).toBe(2);
  });

  it("0 words = 0 pages", () => {
    expect(estimatePages(0)).toBe(0);
  });

  it("251 words = 2 pages (ceil)", () => {
    expect(estimatePages(251)).toBe(2);
  });

  it("1 word = 1 page", () => {
    expect(estimatePages(1)).toBe(1);
  });

  it("negative word count = 0 pages", () => {
    expect(estimatePages(-10)).toBe(0);
  });
});

describe("getCoachHint (HotkeyCoach)", () => {
  it("archive hint", () => {
    expect(getCoachHint("archive")).toEqual({
      action: "archive",
      hotkey: "E",
    });
  });

  it("favorite hint", () => {
    expect(getCoachHint("favorite")).toEqual({
      action: "favorite",
      hotkey: "S",
    });
  });

  it("search hint", () => {
    expect(getCoachHint("search")).toEqual({
      action: "search",
      hotkey: "/",
    });
  });

  it("unknown action returns undefined", () => {
    expect(getCoachHint("nonexistent")).toBeUndefined();
  });

  it("queue hint", () => {
    expect(getCoachHint("queue")).toEqual({
      action: "queue",
      hotkey: "Q",
    });
  });

  it("menu hint", () => {
    expect(getCoachHint("menu")).toEqual({
      action: "toggle menu",
      hotkey: "Tab",
    });
  });

  it("settings hint", () => {
    expect(getCoachHint("settings")).toEqual({
      action: "open settings",
      hotkey: "Ctrl+,",
    });
  });

  it("reader coaching hints", () => {
    expect(getCoachHint("play")).toEqual({ action: "play/pause", hotkey: "Space" });
    expect(getCoachHint("narration")).toEqual({ action: "toggle narration", hotkey: "N" });
    expect(getCoachHint("enterFocus")).toEqual({ action: "enter Focus mode", hotkey: "Shift+Space" });
    expect(getCoachHint("prevChapter")).toEqual({ action: "go to previous chapter", hotkey: "[" });
  });
});

describe("snooze time calculations", () => {
  it("snoozeInOneHour is ~3600000ms from now", () => {
    const before = Date.now();
    const result = snoozeInOneHour();
    const after = Date.now();
    expect(result).toBeGreaterThanOrEqual(before + 3600000);
    expect(result).toBeLessThanOrEqual(after + 3600000);
  });

  it("snoozeTonight at 10 AM yields same day 8 PM", () => {
    // March 22, 2026 10:00 AM
    const now = new Date(2026, 2, 22, 10, 0, 0, 0).getTime();
    const result = snoozeTonight(now);
    const d = new Date(result);
    expect(d.getHours()).toBe(20);
    expect(d.getMinutes()).toBe(0);
    expect(d.getDate()).toBe(22);
  });

  it("snoozeTonight at 9 PM yields next day 8 PM", () => {
    // March 22, 2026 9:00 PM (past 8 PM)
    const now = new Date(2026, 2, 22, 21, 0, 0, 0).getTime();
    const result = snoozeTonight(now);
    const d = new Date(result);
    expect(d.getHours()).toBe(20);
    expect(d.getDate()).toBe(23);
  });

  it("snoozeTomorrowMorning yields next day 8 AM", () => {
    const now = new Date(2026, 2, 22, 14, 0, 0, 0).getTime();
    const result = snoozeTomorrowMorning(now);
    const d = new Date(result);
    expect(d.getHours()).toBe(8);
    expect(d.getMinutes()).toBe(0);
    expect(d.getDate()).toBe(23);
    expect(d.getMonth()).toBe(2); // March
  });
});
