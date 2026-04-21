import { describe, it, expect } from "vitest";
import { resolveNarrationContext, isBookNarrationValid } from "../src/utils/narrationContinuity";
import type { BlurbySettings, NarrationProfile, BlurbyDoc } from "../src/types";

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

const testProfile: NarrationProfile = {
  id: "np-test", name: "Test", ttsEngine: "kokoro", ttsVoiceName: "af_heart",
  ttsRate: 1.2, ttsPauseCommaMs: 100, ttsPauseClauseMs: 150, ttsPauseSentenceMs: 400,
  ttsPauseParagraphMs: 800, ttsDialogueSentenceThreshold: 2,
  pronunciationOverrides: [], createdAt: 1000, updatedAt: 1000,
};

function makeDoc(overrides: Partial<BlurbyDoc> = {}): BlurbyDoc {
  return {
    id: "doc-1", title: "Test Book", filepath: "/test.epub",
    addedAt: Date.now(), wordCount: 1000,
    ...overrides,
  } as BlurbyDoc;
}

describe("resolveNarrationContext", () => {
  it("uses flat settings when no profiles exist", () => {
    const ctx = resolveNarrationContext(makeSettings({ ttsEngine: "kokoro", ttsVoiceName: "af_bella", ttsRate: 1.0 }));
    expect(ctx.engine).toBe("kokoro");
    expect(ctx.voiceName).toBe("af_bella");
    expect(ctx.rate).toBe(1.0);
    expect(ctx.profileId).toBeNull();
    expect(ctx.fellBack).toBe(false);
  });

  it("uses active global profile when set", () => {
    const settings = makeSettings({
      narrationProfiles: [testProfile],
      activeNarrationProfileId: "np-test",
    });
    const ctx = resolveNarrationContext(settings);
    expect(ctx.profileId).toBe("np-test");
    expect(ctx.voiceName).toBe("af_heart");
    expect(ctx.rate).toBe(1.2);
  });

  it("uses book-level profile over active global profile", () => {
    const bookProfile: NarrationProfile = { ...testProfile, id: "np-book", name: "Book", ttsVoiceName: "bm_daniel" };
    const settings = makeSettings({
      narrationProfiles: [testProfile, bookProfile],
      activeNarrationProfileId: "np-test",
    });
    const doc = makeDoc({ narrationProfileId: "np-book" });
    const ctx = resolveNarrationContext(settings, doc);
    expect(ctx.profileId).toBe("np-book");
    expect(ctx.voiceName).toBe("bm_daniel");
  });

  it("falls back to active profile when book profile is deleted", () => {
    const settings = makeSettings({
      narrationProfiles: [testProfile],
      activeNarrationProfileId: "np-test",
    });
    const doc = makeDoc({ narrationProfileId: "np-deleted" });
    const ctx = resolveNarrationContext(settings, doc);
    expect(ctx.profileId).toBe("np-test");
  });

  it("falls back when Kokoro voice no longer exists", () => {
    const badProfile: NarrationProfile = { ...testProfile, ttsVoiceName: "af_nonexistent" };
    const settings = makeSettings({
      narrationProfiles: [badProfile],
      activeNarrationProfileId: "np-test",
    });
    const ctx = resolveNarrationContext(settings);
    expect(ctx.voiceName).toBeNull(); // system default
    expect(ctx.fellBack).toBe(true);
    expect(ctx.fallbackReason).toMatch(/no longer available/);
  });

  it("clamps invalid rate to valid range", () => {
    const settings = makeSettings({ ttsRate: -5 });
    const ctx = resolveNarrationContext(settings);
    expect(ctx.rate).toBe(1.0); // KOKORO_DEFAULT_RATE_BUCKET
  });

  it("clamps excessive rate to 2.0", () => {
    const settings = makeSettings({ ttsRate: 10 });
    const ctx = resolveNarrationContext(settings);
    expect(ctx.rate).toBe(2.0);
  });

  it("accepts Web Speech voice names without validation", () => {
    const settings = makeSettings({ ttsEngine: "web", ttsVoiceName: "Microsoft David Desktop" });
    const ctx = resolveNarrationContext(settings);
    expect(ctx.voiceName).toBe("Microsoft David Desktop");
    expect(ctx.fellBack).toBe(false);
  });

  it("preserves Qwen engine selection and speaker names for prototype persistence", () => {
    const settings = makeSettings({ ttsEngine: "qwen", ttsVoiceName: "Ryan", ttsRate: 1.1 });
    const ctx = resolveNarrationContext(settings);
    expect(ctx.engine).toBe("qwen");
    expect(ctx.voiceName).toBe("Ryan");
    expect(ctx.fellBack).toBe(false);
  });

  it("preserves explicit Kokoro selections even though the product default has moved to Qwen", () => {
    const settings = makeSettings({ ttsEngine: "kokoro", ttsVoiceName: "af_bella", ttsRate: 1.0 });
    const ctx = resolveNarrationContext(settings);
    expect(ctx.engine).toBe("kokoro");
    expect(ctx.voiceName).toBe("af_bella");
    expect(ctx.fellBack).toBe(false);
  });

  it("handles null doc gracefully", () => {
    const ctx = resolveNarrationContext(makeSettings(), null);
    expect(ctx.engine).toBe("kokoro");
    expect(ctx.profileId).toBeNull();
  });
});

describe("isBookNarrationValid", () => {
  it("returns true when no profile assigned", () => {
    expect(isBookNarrationValid(makeSettings(), makeDoc())).toBe(true);
  });

  it("returns true when assigned profile exists", () => {
    const settings = makeSettings({ narrationProfiles: [testProfile] });
    expect(isBookNarrationValid(settings, makeDoc({ narrationProfileId: "np-test" }))).toBe(true);
  });

  it("returns false when assigned profile is deleted", () => {
    const settings = makeSettings({ narrationProfiles: [] });
    expect(isBookNarrationValid(settings, makeDoc({ narrationProfileId: "np-test" }))).toBe(false);
  });
});
