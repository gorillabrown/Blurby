// tests/pronunciationOverrides.test.ts — Tests for TTS-6E pronunciation overrides
import { describe, it, expect } from "vitest";
import { applyPronunciationOverrides, overrideHash } from "../src/utils/pronunciationOverrides";
import type { PronunciationOverride } from "../src/types";

function makeOverride(from: string, to: string, enabled = true): PronunciationOverride {
  return { id: `test-${from}`, from, to, enabled };
}

// ── applyPronunciationOverrides ─────────────────────────────────────────────

describe("applyPronunciationOverrides", () => {
  it("replaces a single word case-insensitively", () => {
    const overrides = [makeOverride("NASA", "nassa")];
    expect(applyPronunciationOverrides("NASA is great", overrides)).toBe("nassa is great");
    expect(applyPronunciationOverrides("nasa is great", overrides)).toBe("nassa is great");
  });

  it("replaces multiple occurrences", () => {
    const overrides = [makeOverride("CEO", "see-ee-oh")];
    expect(applyPronunciationOverrides("The CEO met another CEO", overrides)).toBe("The see-ee-oh met another see-ee-oh");
  });

  it("applies overrides in order", () => {
    const overrides = [
      makeOverride("Dr", "Doctor"),
      makeOverride("Doctor Smith", "Doc Smith"),
    ];
    // "Dr" → "Doctor" first, then "Doctor Smith" → "Doc Smith"
    expect(applyPronunciationOverrides("Dr Smith is here", overrides)).toBe("Doc Smith is here");
  });

  it("skips disabled overrides", () => {
    const overrides = [
      makeOverride("NASA", "nassa", false),
      makeOverride("CEO", "see-ee-oh", true),
    ];
    expect(applyPronunciationOverrides("NASA CEO", overrides)).toBe("NASA see-ee-oh");
  });

  it("handles empty override list", () => {
    expect(applyPronunciationOverrides("hello world", [])).toBe("hello world");
  });

  it("handles undefined overrides", () => {
    expect(applyPronunciationOverrides("hello world", undefined)).toBe("hello world");
  });

  it("uses word boundaries to prevent partial matches", () => {
    const overrides = [makeOverride("the", "thee")];
    // "the" should match but "there" should NOT match
    expect(applyPronunciationOverrides("the theory is there", overrides)).toBe("thee theory is there");
  });

  it("handles regex special characters in from text", () => {
    // Note: word boundaries may not match around special chars like ++
    // This tests that special chars don't cause regex errors
    const overrides = [makeOverride("Mr.", "Mister")];
    expect(applyPronunciationOverrides("Mr. Smith arrived", overrides)).toBe("Mister Smith arrived");
  });

  it("handles empty 'to' string (removal)", () => {
    const overrides = [makeOverride("um", "")];
    expect(applyPronunciationOverrides("I um think um so", overrides)).toBe("I  think  so");
  });
});

// ── overrideHash ────────────────────────────────────────────────────────────

describe("overrideHash", () => {
  it("returns empty string for empty overrides", () => {
    expect(overrideHash([])).toBe("");
    expect(overrideHash(undefined)).toBe("");
  });

  it("returns empty string when all overrides are disabled", () => {
    expect(overrideHash([makeOverride("NASA", "nassa", false)])).toBe("");
  });

  it("returns a non-empty hash for active overrides", () => {
    const hash = overrideHash([makeOverride("NASA", "nassa")]);
    expect(hash).toBeTruthy();
    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(0);
  });

  it("returns different hashes for different override sets", () => {
    const hash1 = overrideHash([makeOverride("NASA", "nassa")]);
    const hash2 = overrideHash([makeOverride("CEO", "see-ee-oh")]);
    expect(hash1).not.toBe(hash2);
  });

  it("returns same hash for same override set", () => {
    const overrides = [makeOverride("NASA", "nassa"), makeOverride("CEO", "see-ee-oh")];
    const hash1 = overrideHash(overrides);
    const hash2 = overrideHash(overrides);
    expect(hash1).toBe(hash2);
  });

  it("hash changes when override is toggled", () => {
    const enabled = [makeOverride("NASA", "nassa", true)];
    const disabled = [makeOverride("NASA", "nassa", false)];
    expect(overrideHash(enabled)).not.toBe(overrideHash(disabled));
  });
});
