import { describe, it, expect } from "vitest";
import {
  createDefaultNarrationProfile,
  profileFromSettings,
  resolveNarrationProfile,
  TTS_PAUSE_COMMA_MS,
  TTS_PAUSE_CLAUSE_MS,
  TTS_PAUSE_SENTENCE_MS,
  TTS_PAUSE_PARAGRAPH_MS,
  TTS_DIALOGUE_SENTENCE_THRESHOLD,
} from "../src/constants";
import type { BlurbySettings, NarrationProfile } from "../src/types";

function makeSettings(overrides: Partial<BlurbySettings> = {}): BlurbySettings {
  return {
    wpm: 300,
    theme: "dark",
    accentColor: null,
    fontFamily: null,
    compactMode: false,
    readingMode: "page",
    focusMarks: true,
    readingRuler: false,
    focusSpan: 0.4,
    flowTextSize: 110,
    rhythmPauses: { enabled: false },
    layoutSpacing: { lineHeight: 1.8, paragraphSpacing: 1.0 },
    initialPauseMs: 3000,
    punctuationPauseMs: 1000,
    viewMode: "grid",
    flowWordSpan: 3,
    flowCursorStyle: "underline",
    einkWpmCeiling: 250,
    einkRefreshInterval: 20,
    einkPhraseGrouping: false,
    ttsEnabled: false,
    ttsEngine: "kokoro",
    ttsVoiceName: "af_bella",
    ttsRate: 1.0,
    lastReadingMode: "focus",
    syncIntervalMinutes: 5,
    syncOnMeteredConnection: false,
    ...overrides,
  } as BlurbySettings;
}

describe("Narration Profiles — createDefaultNarrationProfile", () => {
  it("creates a profile with a unique ID and default values", () => {
    const p = createDefaultNarrationProfile("Test Profile");
    expect(p.name).toBe("Test Profile");
    expect(p.id).toMatch(/^np-/);
    expect(p.ttsEngine).toBe("kokoro");
    expect(p.ttsVoiceName).toBe("af_bella");
    expect(p.ttsRate).toBe(1.0);
    expect(p.ttsPauseCommaMs).toBe(TTS_PAUSE_COMMA_MS);
    expect(p.pronunciationOverrides).toEqual([]);
    expect(p.createdAt).toBeGreaterThan(0);
  });

  it("generates unique IDs for each profile", () => {
    const p1 = createDefaultNarrationProfile("A");
    const p2 = createDefaultNarrationProfile("B");
    expect(p1.id).not.toBe(p2.id);
  });
});

describe("Narration Profiles — profileFromSettings", () => {
  it("copies current TTS settings into a profile", () => {
    const settings = makeSettings({
      ttsEngine: "web",
      ttsVoiceName: "Microsoft David",
      ttsRate: 1.5,
      ttsPauseCommaMs: 200,
      pronunciationOverrides: [{ id: "o1", from: "CEO", to: "C E O", enabled: true }],
    });
    const p = profileFromSettings("From Settings", settings);
    expect(p.name).toBe("From Settings");
    expect(p.ttsEngine).toBe("web");
    expect(p.ttsVoiceName).toBe("Microsoft David");
    expect(p.ttsRate).toBe(1.5);
    expect(p.ttsPauseCommaMs).toBe(200);
    expect(p.pronunciationOverrides).toHaveLength(1);
    expect(p.pronunciationOverrides[0].from).toBe("CEO");
  });

  it("uses defaults for missing optional pause settings", () => {
    const settings = makeSettings(); // no ttsPause overrides
    const p = profileFromSettings("Defaults", settings);
    expect(p.ttsPauseCommaMs).toBe(TTS_PAUSE_COMMA_MS);
    expect(p.ttsPauseClauseMs).toBe(TTS_PAUSE_CLAUSE_MS);
    expect(p.ttsPauseSentenceMs).toBe(TTS_PAUSE_SENTENCE_MS);
    expect(p.ttsPauseParagraphMs).toBe(TTS_PAUSE_PARAGRAPH_MS);
    expect(p.ttsDialogueSentenceThreshold).toBe(TTS_DIALOGUE_SENTENCE_THRESHOLD);
  });
});

describe("Narration Profiles — resolveNarrationProfile", () => {
  const profileA: NarrationProfile = {
    id: "np-a",
    name: "Profile A",
    ttsEngine: "kokoro",
    ttsVoiceName: "af_heart",
    ttsRate: 1.2,
    ttsPauseCommaMs: 100,
    ttsPauseClauseMs: 150,
    ttsPauseSentenceMs: 400,
    ttsPauseParagraphMs: 800,
    ttsDialogueSentenceThreshold: 2,
    pronunciationOverrides: [],
    createdAt: 1000,
    updatedAt: 1000,
  };

  const profileB: NarrationProfile = {
    ...profileA,
    id: "np-b",
    name: "Profile B",
    ttsVoiceName: "bm_daniel",
  };

  it("returns book-level profile when present", () => {
    const settings = makeSettings({
      narrationProfiles: [profileA, profileB],
      activeNarrationProfileId: "np-a",
    });
    const resolved = resolveNarrationProfile(settings, "np-b");
    expect(resolved?.id).toBe("np-b");
  });

  it("falls back to active profile when no book assignment", () => {
    const settings = makeSettings({
      narrationProfiles: [profileA, profileB],
      activeNarrationProfileId: "np-a",
    });
    const resolved = resolveNarrationProfile(settings, null);
    expect(resolved?.id).toBe("np-a");
  });

  it("returns null when no profiles are active or assigned", () => {
    const settings = makeSettings({ narrationProfiles: [profileA] });
    const resolved = resolveNarrationProfile(settings, null);
    expect(resolved).toBeNull();
  });

  it("ignores book profile ID that does not exist", () => {
    const settings = makeSettings({
      narrationProfiles: [profileA],
      activeNarrationProfileId: "np-a",
    });
    const resolved = resolveNarrationProfile(settings, "np-nonexistent");
    expect(resolved?.id).toBe("np-a");
  });

  it("returns null when profiles array is empty", () => {
    const settings = makeSettings({ narrationProfiles: [] });
    expect(resolveNarrationProfile(settings, null)).toBeNull();
  });

  it("returns null when profiles is undefined", () => {
    const settings = makeSettings();
    expect(resolveNarrationProfile(settings, null)).toBeNull();
  });
});
