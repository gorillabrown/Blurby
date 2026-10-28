// tests/perBookOverrides.test.ts — Tests for TTS-6I per-book pronunciation profiles
import { describe, it, expect } from "vitest";
import { mergeOverrides, applyPronunciationOverrides, overrideHash } from "../src/utils/pronunciationOverrides";
import type { PronunciationOverride } from "../src/types";

function make(from: string, to: string, enabled = true): PronunciationOverride {
  return { id: `test-${from}`, from, to, enabled };
}

// ── mergeOverrides ──────────────────────────────────────────────────────────

describe("mergeOverrides", () => {
  it("returns global when no book overrides", () => {
    const global = [make("NASA", "nassa")];
    expect(mergeOverrides(global, undefined)).toBe(global);
    expect(mergeOverrides(global, [])).toBe(global);
  });

  it("returns book when no global overrides", () => {
    const book = [make("Frodo", "Froh-doh")];
    expect(mergeOverrides(undefined, book)).toBe(book);
    expect(mergeOverrides([], book)).toBe(book);
  });

  it("merges global first then book", () => {
    const global = [make("CEO", "see-ee-oh")];
    const book = [make("Aragorn", "Arr-ah-gorn")];
    const merged = mergeOverrides(global, book);
    expect(merged.length).toBe(2);
    expect(merged[0].from).toBe("CEO");
    expect(merged[1].from).toBe("Aragorn");
  });

  it("book overrides can refine global output (layering)", () => {
    const global = [make("Dr", "Doctor")];
    const book = [make("Doctor Strange", "Doc Strange")];
    const merged = mergeOverrides(global, book);
    const text = applyPronunciationOverrides("Dr Strange arrived", merged);
    // Global: "Dr" → "Doctor" → "Doctor Strange arrived"
    // Book: "Doctor Strange" → "Doc Strange"
    expect(text).toBe("Doc Strange arrived");
  });
});

// ── Book isolation ──────────────────────────────────────────────────────────

describe("per-book isolation", () => {
  it("different books have independent override sets", () => {
    const global = [make("CEO", "see-ee-oh")];
    const bookA = [make("Frodo", "Froh-doh")];
    const bookB = [make("Katniss", "Kat-niss")];

    const mergedA = mergeOverrides(global, bookA);
    const mergedB = mergeOverrides(global, bookB);

    // Book A has Frodo, not Katniss
    expect(applyPronunciationOverrides("Frodo and Katniss", mergedA)).toBe("Froh-doh and Katniss");
    // Book B has Katniss, not Frodo
    expect(applyPronunciationOverrides("Frodo and Katniss", mergedB)).toBe("Frodo and Kat-niss");
  });

  it("book overrides don't leak when no book overrides provided", () => {
    const global = [make("CEO", "see-ee-oh")];
    const merged = mergeOverrides(global, undefined);
    expect(merged.length).toBe(1);
    expect(merged[0].from).toBe("CEO");
  });
});

// ── Cache segregation ───────────────────────────────────────────────────────

describe("cache identity with per-book overrides", () => {
  it("different effective override sets produce different hashes", () => {
    const global = [make("CEO", "see-ee-oh")];
    const bookA = [make("Frodo", "Froh-doh")];
    const bookB = [make("Katniss", "Kat-niss")];

    const hashA = overrideHash(mergeOverrides(global, bookA));
    const hashB = overrideHash(mergeOverrides(global, bookB));
    expect(hashA).not.toBe(hashB);
  });

  it("same effective set produces same hash", () => {
    const global = [make("CEO", "see-ee-oh")];
    const book = [make("Frodo", "Froh-doh")];
    const h1 = overrideHash(mergeOverrides(global, book));
    const h2 = overrideHash(mergeOverrides(global, book));
    expect(h1).toBe(h2);
  });

  it("global-only hash differs from global+book hash", () => {
    const global = [make("CEO", "see-ee-oh")];
    const book = [make("Frodo", "Froh-doh")];
    const globalOnly = overrideHash(mergeOverrides(global, undefined));
    const withBook = overrideHash(mergeOverrides(global, book));
    expect(globalOnly).not.toBe(withBook);
  });
});

// ── Preview parity ──────────────────────────────────────────────────────────

describe("preview uses effective merged overrides", () => {
  it("preview reflects both global and book overrides", () => {
    const global = [make("CEO", "see-ee-oh")];
    const book = [make("Frodo", "Froh-doh")];
    const effective = mergeOverrides(global, book);
    const result = applyPronunciationOverrides("The CEO met Frodo", effective);
    expect(result).toBe("The see-ee-oh met Froh-doh");
  });
});

// ── Backward compatibility ──────────────────────────────────────────────────

describe("backward compatibility", () => {
  it("users with no book overrides get same behavior as TTS-6E", () => {
    const global = [make("NASA", "nassa"), make("CEO", "see-ee-oh")];
    const merged = mergeOverrides(global, undefined);
    expect(merged).toBe(global); // same reference
    expect(applyPronunciationOverrides("NASA CEO", merged)).toBe("nassa see-ee-oh");
  });
});
