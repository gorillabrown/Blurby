import { describe, it, expect } from "vitest";
import {
  exportNarrationData,
  validateNarrationImport,
  applyNarrationImport,
  resetNarrationData,
  NARRATION_EXPORT_VERSION,
} from "../src/utils/narrationPortability";
import type { BlurbySettings, NarrationProfile } from "../src/types";

function makeSettings(overrides: Partial<BlurbySettings> = {}): BlurbySettings {
  return {
    wpm: 300, theme: "dark", accentColor: null, fontFamily: null, compactMode: false,
    readingMode: "page", focusMarks: true, readingRuler: false, focusSpan: 0.4,
    flowTextSize: 110, rhythmPauses: { enabled: false },
    layoutSpacing: { lineHeight: 1.8, paragraphSpacing: 1.0 },
    initialPauseMs: 3000, punctuationPauseMs: 1000, viewMode: "grid",
    flowWordSpan: 3, flowCursorStyle: "underline",
    einkWpmCeiling: 250, einkRefreshInterval: 20, einkPhraseGrouping: false,
    ttsEnabled: false, ttsEngine: "kokoro", ttsVoiceName: "af_bella", ttsRate: 1.0,
    lastReadingMode: "focus", syncIntervalMinutes: 5, syncOnMeteredConnection: false,
    ...overrides,
  } as BlurbySettings;
}

const sampleProfile: NarrationProfile = {
  id: "np-test-1", name: "Test Profile", ttsEngine: "kokoro", ttsVoiceName: "af_heart",
  ttsRate: 1.2, ttsPauseCommaMs: 100, ttsPauseClauseMs: 150, ttsPauseSentenceMs: 400,
  ttsPauseParagraphMs: 800, ttsDialogueSentenceThreshold: 2,
  pronunciationOverrides: [], createdAt: 1000, updatedAt: 1000,
};

describe("exportNarrationData", () => {
  it("exports profiles, overrides, and version", () => {
    const settings = makeSettings({
      narrationProfiles: [sampleProfile],
      pronunciationOverrides: [{ id: "o1", from: "CEO", to: "C E O", enabled: true }],
      activeNarrationProfileId: "np-test-1",
    });
    const payload = exportNarrationData(settings);
    expect(payload.version).toBe(NARRATION_EXPORT_VERSION);
    expect(payload.profiles).toHaveLength(1);
    expect(payload.globalOverrides).toHaveLength(1);
    expect(payload.activeProfileId).toBe("np-test-1");
    expect(payload.exportedAt).toBeGreaterThan(0);
  });

  it("handles empty settings gracefully", () => {
    const payload = exportNarrationData(makeSettings());
    expect(payload.profiles).toEqual([]);
    expect(payload.globalOverrides).toEqual([]);
    expect(payload.activeProfileId).toBeNull();
  });
});

describe("validateNarrationImport", () => {
  it("accepts a valid payload", () => {
    const payload = exportNarrationData(makeSettings({ narrationProfiles: [sampleProfile] }));
    const result = validateNarrationImport(payload, makeSettings());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.profileCount).toBe(1);
  });

  it("rejects null payload", () => {
    const result = validateNarrationImport(null, makeSettings());
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/not an object/);
  });

  it("rejects future version", () => {
    const result = validateNarrationImport(
      { version: 999, profiles: [], globalOverrides: [] },
      makeSettings(),
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/Unsupported version/);
  });

  it("rejects missing profiles array", () => {
    const result = validateNarrationImport(
      { version: 1, globalOverrides: [] },
      makeSettings(),
    );
    expect(result.valid).toBe(false);
  });

  it("rejects profile with invalid engine", () => {
    const result = validateNarrationImport(
      { version: 1, profiles: [{ id: "x", name: "X", ttsEngine: "invalid" }], globalOverrides: [] },
      makeSettings(),
    );
    expect(result.valid).toBe(false);
  });

  it("detects conflicting profile names", () => {
    const existing = makeSettings({ narrationProfiles: [sampleProfile] });
    const payload = { version: 1, profiles: [{ ...sampleProfile, id: "np-new" }], globalOverrides: [] };
    const result = validateNarrationImport(payload, existing);
    expect(result.valid).toBe(true); // conflicts are warnings, not errors
    expect(result.conflictingNames).toContain("Test Profile");
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe("applyNarrationImport", () => {
  const payload = exportNarrationData(makeSettings({
    narrationProfiles: [sampleProfile],
    pronunciationOverrides: [{ id: "o1", from: "CEO", to: "C E O", enabled: true }],
    activeNarrationProfileId: "np-test-1",
  }));

  it("replaces all narration data in replace mode", () => {
    const updates = applyNarrationImport(payload, makeSettings(), "replace");
    expect(updates.narrationProfiles).toHaveLength(1);
    expect(updates.pronunciationOverrides).toHaveLength(1);
    expect(updates.activeNarrationProfileId).toBe("np-test-1");
  });

  it("merges profiles in merge mode", () => {
    const existing = makeSettings({
      narrationProfiles: [{ ...sampleProfile, id: "np-existing", name: "Existing" }],
      pronunciationOverrides: [{ id: "o0", from: "NASA", to: "N A S A", enabled: true }],
    });
    const updates = applyNarrationImport(payload, existing, "merge");
    expect(updates.narrationProfiles!.length).toBe(2);
    expect(updates.pronunciationOverrides!.length).toBe(2);
  });

  it("generates new IDs for conflicting profile IDs in merge mode", () => {
    const existing = makeSettings({ narrationProfiles: [sampleProfile] });
    const updates = applyNarrationImport(payload, existing, "merge");
    const ids = updates.narrationProfiles!.map(p => p.id);
    // Should have 2 profiles, with different IDs
    expect(ids.length).toBe(2);
    expect(new Set(ids).size).toBe(2);
  });
});

describe("resetNarrationData", () => {
  it("resets profiles and active profile ID", () => {
    const updates = resetNarrationData("profiles");
    expect(updates.narrationProfiles).toEqual([]);
    expect(updates.activeNarrationProfileId).toBeNull();
  });

  it("resets overrides only", () => {
    const updates = resetNarrationData("overrides");
    expect(updates.pronunciationOverrides).toEqual([]);
    expect(updates.narrationProfiles).toBeUndefined();
  });

  it("resets all narration data", () => {
    const updates = resetNarrationData("all");
    expect(updates.narrationProfiles).toEqual([]);
    expect(updates.activeNarrationProfileId).toBeNull();
    expect(updates.pronunciationOverrides).toEqual([]);
  });

  it("returns empty for bookAssignments (handled externally)", () => {
    const updates = resetNarrationData("bookAssignments");
    expect(Object.keys(updates)).toHaveLength(0);
  });
});
