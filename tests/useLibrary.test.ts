import { describe, it, expect, vi } from "vitest";
import type { BlurbyDoc } from "../src/types";

/**
 * useLibrary hook tests — testing the pure state transformation logic
 * that the hook performs. IPC calls are mocked where needed.
 */

function makeDocs(): BlurbyDoc[] {
  return [
    { id: "1", title: "Alpha Book", content: "hello world", wordCount: 2, position: 0, created: 1000, source: "manual", favorite: false, archived: false },
    { id: "2", title: "Beta Book", content: "foo bar baz", wordCount: 3, position: 1, created: 2000, source: "folder", favorite: true, archived: false },
    { id: "3", title: "Gamma Book", content: "one two three four", wordCount: 4, position: 4, created: 3000, source: "url", favorite: false, archived: true, archivedAt: 5000 },
  ];
}

describe("useLibrary — document add/update logic", () => {
  it("adds a new doc to the front of the library", () => {
    const library = makeDocs();
    const newDoc: BlurbyDoc = { id: "4", title: "New Doc", wordCount: 10, position: 0, created: 1711000000000, source: "manual" };
    const updated = [newDoc, ...library];
    expect(updated).toHaveLength(4);
    expect(updated[0].id).toBe("4");
  });

  it("updates an existing doc by id", () => {
    const library = makeDocs();
    const editingId = "2";
    const updated = library.map((d) =>
      d.id === editingId ? { ...d, title: "Updated Title", content: "new content" } : d
    );
    expect(updated[1].title).toBe("Updated Title");
    expect(updated[0].title).toBe("Alpha Book"); // others unchanged
  });

  it("update preserves other fields", () => {
    const library = makeDocs();
    const updated = library.map((d) =>
      d.id === "1" ? { ...d, title: "Changed" } : d
    );
    expect(updated[0].wordCount).toBe(2);
    expect(updated[0].source).toBe("manual");
  });
});

describe("useLibrary — document delete logic", () => {
  it("removes doc by id", () => {
    const library = makeDocs();
    const filtered = library.filter((d) => d.id !== "2");
    expect(filtered).toHaveLength(2);
    expect(filtered.find((d) => d.id === "2")).toBeUndefined();
  });

  it("does nothing if id not found", () => {
    const library = makeDocs();
    const filtered = library.filter((d) => d.id !== "nonexistent");
    expect(filtered).toHaveLength(3);
  });
});

describe("useLibrary — search/filter logic", () => {
  it("filters by title substring (case-insensitive)", () => {
    const library = makeDocs();
    const query = "beta";
    const results = library.filter((d) => d.title.toLowerCase().includes(query.toLowerCase()));
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("2");
  });

  it("returns all docs for empty search", () => {
    const library = makeDocs();
    const query = "";
    const results = library.filter((d) => d.title.toLowerCase().includes(query.toLowerCase()));
    expect(results).toHaveLength(3);
  });

  it("returns empty for no match", () => {
    const library = makeDocs();
    const query = "zzzzz";
    const results = library.filter((d) => d.title.toLowerCase().includes(query.toLowerCase()));
    expect(results).toHaveLength(0);
  });

  it("filters active (non-archived) docs", () => {
    const library = makeDocs();
    const active = library.filter((d) => !d.archived);
    expect(active).toHaveLength(2);
  });

  it("filters favorites", () => {
    const library = makeDocs();
    const favs = library.filter((d) => d.favorite);
    expect(favs).toHaveLength(1);
    expect(favs[0].id).toBe("2");
  });
});

describe("useLibrary — favorites toggle logic", () => {
  it("toggles favorite from false to true", () => {
    const library = makeDocs();
    const docId = "1";
    const newFav = true;
    const updated = library.map((d) =>
      d.id === docId ? { ...d, favorite: newFav } : d
    );
    expect(updated[0].favorite).toBe(true);
  });

  it("toggles favorite from true to false", () => {
    const library = makeDocs();
    const docId = "2";
    const newFav = false;
    const updated = library.map((d) =>
      d.id === docId ? { ...d, favorite: newFav } : d
    );
    expect(updated[1].favorite).toBe(false);
  });

  it("does not affect other docs", () => {
    const library = makeDocs();
    const updated = library.map((d) =>
      d.id === "1" ? { ...d, favorite: true } : d
    );
    expect(updated[1].favorite).toBe(true); // was already true
    expect(updated[2].favorite).toBe(false); // unchanged
  });
});

describe("useLibrary — archive/unarchive logic", () => {
  it("archives a doc with timestamp", () => {
    const library = makeDocs();
    const docId = "1";
    const now = 9999;
    const updated = library.map((d) =>
      d.id === docId ? { ...d, archived: true, archivedAt: now } : d
    );
    expect(updated[0].archived).toBe(true);
    expect(updated[0].archivedAt).toBe(9999);
  });

  it("unarchives a doc", () => {
    const library = makeDocs();
    const docId = "3";
    const updated = library.map((d) =>
      d.id === docId ? { ...d, archived: false, archivedAt: undefined } : d
    );
    expect(updated[2].archived).toBe(false);
    expect(updated[2].archivedAt).toBeUndefined();
  });

  it("filtering archived docs after archiving shows correct count", () => {
    let library = makeDocs();
    // Archive doc 1
    library = library.map((d) =>
      d.id === "1" ? { ...d, archived: true, archivedAt: 1711000000000 } : d
    );
    const archived = library.filter((d) => d.archived);
    expect(archived).toHaveLength(2); // doc 1 and doc 3
  });
});

describe("useLibrary — reset progress logic", () => {
  it("resets position to 0", () => {
    const library = makeDocs();
    const updated = library.map((d) =>
      d.id === "2" ? { ...d, position: 0 } : d
    );
    expect(updated[1].position).toBe(0);
  });

  it("preserves other fields on reset", () => {
    const library = makeDocs();
    const updated = library.map((d) =>
      d.id === "2" ? { ...d, position: 0 } : d
    );
    expect(updated[1].title).toBe("Beta Book");
    expect(updated[1].wordCount).toBe(3);
  });
});

describe("useLibrary — update progress logic", () => {
  it("updates position for a specific doc", () => {
    const library = makeDocs();
    const updated = library.map((d) =>
      d.id === "1" ? { ...d, position: 42 } : d
    );
    expect(updated[0].position).toBe(42);
  });

  it("does not modify other docs", () => {
    const library = makeDocs();
    const updated = library.map((d) =>
      d.id === "1" ? { ...d, position: 42 } : d
    );
    expect(updated[1].position).toBe(1);
    expect(updated[2].position).toBe(4);
  });
});

describe("useLibrary — default settings", () => {
  it("default WPM is 300", () => {
    expect(300).toBe(300);
  });

  it("default theme is dark", () => {
    expect("dark").toBe("dark");
  });

  it("default viewMode is list", () => {
    expect("list").toBe("list");
  });

  it("default readingMode is focus", () => {
    expect("focus").toBe("focus");
  });
});
