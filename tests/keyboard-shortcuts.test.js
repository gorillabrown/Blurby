import { describe, it, expect, vi } from "vitest";

// keyboard-shortcuts.test.js — Sprint 20
//
// Tests pure logic for Sprint 20 keyboard-first UX features:
//   - G-sequence timeout (2-second window)
//   - Filter toggle: same key clears active filter
//   - APA subtext formatting for URL-imported docs
//   - APA subtext edge cases: no author, no date, books
//
// We replicate the pure functions here (no DOM, no React) following the same
// pattern as the existing useKeyboardShortcuts.test.ts which also tests pure
// dispatch logic rather than actual hook rendering.

// ── G-sequence state machine ───────────────────────────────────────────────

/**
 * G-sequence: pressing "g" arms a 2-second window, then a second key triggers
 * a navigation action. Pressing anything other than a valid continuation key
 * cancels the sequence.
 *
 * This replicates the logic in useKeyboardShortcuts (Sprint 20).
 */
const G_SEQUENCE_TIMEOUT_MS = 2000;

function makeGSequenceState() {
  return { armed: false, armedAt: null };
}

function armGSequence(state, now = Date.now()) {
  return { armed: true, armedAt: now };
}

function isGSequenceActive(state, now = Date.now()) {
  if (!state.armed || state.armedAt === null) return false;
  return now - state.armedAt <= G_SEQUENCE_TIMEOUT_MS;
}

function resolveGSequence(state, key, now = Date.now()) {
  if (!isGSequenceActive(state, now)) return { action: "none", nextState: makeGSequenceState() };
  const G_MAP = {
    g: "jump-top",
    e: "jump-end",
    i: "jump-inbox",
    s: "jump-starred",
    d: "jump-done",
  };
  const action = G_MAP[key.toLowerCase()] || "cancel";
  return { action, nextState: makeGSequenceState() };
}

describe("G-sequence timeout (2s)", () => {
  it("sequence is active immediately after arming", () => {
    const now = 1000000;
    const state = armGSequence(makeGSequenceState(), now);
    expect(isGSequenceActive(state, now)).toBe(true);
  });

  it("sequence is active within 2 seconds", () => {
    const start = 1000000;
    const state = armGSequence(makeGSequenceState(), start);
    expect(isGSequenceActive(state, start + 1999)).toBe(true);
  });

  it("sequence is active at exactly 2 seconds", () => {
    const start = 1000000;
    const state = armGSequence(makeGSequenceState(), start);
    expect(isGSequenceActive(state, start + 2000)).toBe(true);
  });

  it("sequence is expired after more than 2 seconds", () => {
    const start = 1000000;
    const state = armGSequence(makeGSequenceState(), start);
    expect(isGSequenceActive(state, start + 2001)).toBe(false);
  });

  it("unarmed state is never active", () => {
    const state = makeGSequenceState();
    expect(isGSequenceActive(state, Date.now())).toBe(false);
  });

  it("expired sequence resolves to 'none'", () => {
    const start = 1000000;
    const state = armGSequence(makeGSequenceState(), start);
    const { action } = resolveGSequence(state, "g", start + 3000);
    expect(action).toBe("none");
  });

  it("gg navigates to top within timeout", () => {
    const now = 1000000;
    const state = armGSequence(makeGSequenceState(), now);
    const { action } = resolveGSequence(state, "g", now + 500);
    expect(action).toBe("jump-top");
  });

  it("ge navigates to end within timeout", () => {
    const now = 1000000;
    const state = armGSequence(makeGSequenceState(), now);
    const { action } = resolveGSequence(state, "e", now + 500);
    expect(action).toBe("jump-end");
  });

  it("unknown continuation key cancels the sequence", () => {
    const now = 1000000;
    const state = armGSequence(makeGSequenceState(), now);
    const { action, nextState } = resolveGSequence(state, "z", now + 100);
    expect(action).toBe("cancel");
    expect(nextState.armed).toBe(false);
  });

  it("resolving the sequence resets state to unarmed", () => {
    const now = 1000000;
    const state = armGSequence(makeGSequenceState(), now);
    const { nextState } = resolveGSequence(state, "g", now + 100);
    expect(nextState.armed).toBe(false);
  });
});

// ── Filter toggle behavior ─────────────────────────────────────────────────

/**
 * Library filter toggle: pressing the same filter key a second time clears the
 * active filter (toggles off). Pressing a different key switches to that filter.
 */
function toggleFilter(currentFilter, key) {
  if (currentFilter === key) return null; // same key → clear
  return key;
}

describe("filter toggle behavior", () => {
  it("pressing a filter key when no filter is active sets that filter", () => {
    expect(toggleFilter(null, "unread")).toBe("unread");
  });

  it("pressing the same filter key clears the filter", () => {
    expect(toggleFilter("unread", "unread")).toBeNull();
  });

  it("pressing a different filter key switches to the new filter", () => {
    expect(toggleFilter("unread", "starred")).toBe("starred");
  });

  it("clearing then re-pressing sets the filter again", () => {
    const after1 = toggleFilter(null, "done");
    const after2 = toggleFilter(after1, "done"); // clear
    const after3 = toggleFilter(after2, "done"); // set again
    expect(after3).toBe("done");
  });

  it("switching between two filters never produces null (unless same key)", () => {
    const f1 = toggleFilter(null, "starred");
    const f2 = toggleFilter(f1, "snoozed");
    expect(f2).toBe("snoozed");
  });
});

// ── APA subtext formatting ─────────────────────────────────────────────────

/**
 * Generates the subtext displayed under a library card for a URL-imported doc.
 * APA style: "Smith, J. (2025, June 15). Example News."
 * Mirrors the getDocSubtext helper planned for LibraryCard (Sprint 20).
 */
function formatApaSubtext({ author, publishedDate, sourceDomain, source }) {
  // Books and non-URL sources use "by Author" style, not APA
  if (source !== "url") {
    return author ? `by ${author}` : null;
  }

  const parts = [];

  // Author component
  if (author) {
    parts.push(formatAuthorAPA(author));
  }

  // Date component
  if (publishedDate) {
    try {
      const d = new Date(publishedDate);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = d.toLocaleString("en-US", { month: "long" });
        const day = d.getDate();
        parts.push(`(${year}, ${month} ${day}).`);
      } else {
        parts.push("(n.d.).");
      }
    } catch {
      parts.push("(n.d.).");
    }
  } else {
    parts.push("(n.d.).");
  }

  // Source domain
  if (sourceDomain) {
    parts.push(sourceDomain + ".");
  }

  return parts.join(" ") || null;
}

function formatAuthorAPA(authorString) {
  if (!authorString || !authorString.trim()) return "";
  const parts = authorString
    .split(/\s+&\s+|\s+and\s+|;\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  const formatted = parts.map((name) => {
    const trimmed = name.trim();
    if (!trimmed) return "";
    if (/^[^,]+,\s*[A-Z]\./.test(trimmed)) return trimmed;
    const nameParts = trimmed.split(/\s+/);
    if (nameParts.length === 1) return nameParts[0];
    const last = nameParts[nameParts.length - 1];
    const initials = nameParts.slice(0, -1).map((p) => `${p[0].toUpperCase()}.`).join(" ");
    return `${last}, ${initials}`;
  });
  if (formatted.length === 1) return formatted[0];
  const allButLast = formatted.slice(0, -1).join(", ");
  return `${allButLast}, & ${formatted[formatted.length - 1]}`;
}

describe("APA subtext formatting for URL docs", { timeout: 15000 }, () => {
  it("formats full APA subtext with author, date, and source domain", () => {
    const subtext = formatApaSubtext({
      source: "url",
      author: "Jane Smith",
      publishedDate: "2025-06-15T00:00:00.000Z",
      sourceDomain: "The Atlantic",
    });
    expect(subtext).toContain("Smith, J.");
    expect(subtext).toContain("2025");
    expect(subtext).toContain("June");
    expect(subtext).toContain("The Atlantic");
  });

  it("omits author portion when no author is present", () => {
    const subtext = formatApaSubtext({
      source: "url",
      author: null,
      publishedDate: "2025-06-15T00:00:00.000Z",
      sourceDomain: "BBC News",
    });
    // Should NOT contain any author-looking string before the date
    expect(subtext).not.toMatch(/^[A-Z][a-z]+,/);
    // publishedDate IS set, so it should show the date (not n.d.)
    expect(subtext).toContain("2025");
    expect(subtext).toContain("BBC News");
  });

  it("uses '(n.d.).' when no publish date", () => {
    const subtext = formatApaSubtext({
      source: "url",
      author: "Bob Jones",
      publishedDate: null,
      sourceDomain: "Reuters",
    });
    expect(subtext).toContain("(n.d.).");
  });

  it("books show 'by Author' not APA", () => {
    const subtext = formatApaSubtext({
      source: "file",
      author: "J.R.R. Tolkien",
      publishedDate: null,
      sourceDomain: null,
    });
    expect(subtext).toBe("by J.R.R. Tolkien");
  });

  it("books with no author return null", () => {
    const subtext = formatApaSubtext({
      source: "file",
      author: null,
      publishedDate: null,
      sourceDomain: null,
    });
    expect(subtext).toBeNull();
  });

  it("folder source shows 'by Author' not APA", () => {
    const subtext = formatApaSubtext({
      source: "folder",
      author: "George Orwell",
      publishedDate: null,
      sourceDomain: null,
    });
    expect(subtext).toBe("by George Orwell");
  });

  it("URL doc with no date and no author still produces a string (source domain)", () => {
    const subtext = formatApaSubtext({
      source: "url",
      author: null,
      publishedDate: null,
      sourceDomain: "Medium",
    });
    expect(subtext).not.toBeNull();
    expect(subtext).toContain("Medium");
  });
});
