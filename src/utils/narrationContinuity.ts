/**
 * Narration session continuity & recovery (TTS-6P).
 * Resolves the effective narration context for a book, handling stale/missing
 * profiles, voices, and settings gracefully.
 */
import type { BlurbySettings, NarrationProfile, BlurbyDoc } from "../types";
import { resolveNarrationProfile, KOKORO_VOICE_NAMES, KOKORO_DEFAULT_RATE_BUCKET } from "../constants";

/** The resolved narration context for a book session. */
export interface NarrationContext {
  engine: "web" | "kokoro";
  voiceName: string | null;
  rate: number;
  profileId: string | null;
  profileName: string | null;
  /** Whether any fallback was applied due to stale/missing state. */
  fellBack: boolean;
  fallbackReason: string | null;
}

/**
 * Resolve the effective narration context for a book, with graceful fallback.
 *
 * Resolution order:
 * 1. Book-level profile (if assigned and still exists)
 * 2. Active global profile (if set and still exists)
 * 3. Flat settings (always available)
 *
 * Within a resolved profile, validate:
 * - Voice ID still exists in the known voice set
 * - Rate is within valid range
 * - Engine is valid
 */
export function resolveNarrationContext(
  settings: BlurbySettings,
  doc?: BlurbyDoc | null,
): NarrationContext {
  const bookProfileId = doc?.narrationProfileId || null;
  const profile = resolveNarrationProfile(settings, bookProfileId);

  if (profile) {
    // Validate the resolved profile's fields
    const validVoice = validateVoice(profile.ttsVoiceName, profile.ttsEngine);
    const fellBack = validVoice !== profile.ttsVoiceName;
    return {
      engine: profile.ttsEngine === "web" || profile.ttsEngine === "kokoro" ? profile.ttsEngine : "web",
      voiceName: validVoice,
      rate: clampRate(profile.ttsRate),
      profileId: profile.id,
      profileName: profile.name,
      fellBack,
      fallbackReason: fellBack ? `Voice "${profile.ttsVoiceName}" no longer available` : null,
    };
  }

  // No profile — use flat settings
  const engine = settings.ttsEngine === "web" || settings.ttsEngine === "kokoro" ? settings.ttsEngine : "web";
  const voiceName = validateVoice(settings.ttsVoiceName || null, engine);
  return {
    engine,
    voiceName,
    rate: clampRate(settings.ttsRate || 1.0),
    profileId: null,
    profileName: null,
    fellBack: voiceName !== (settings.ttsVoiceName || null),
    fallbackReason: voiceName !== (settings.ttsVoiceName || null)
      ? `Voice "${settings.ttsVoiceName}" no longer available`
      : null,
  };
}

/** Validate a voice name. Returns null (system default) if the voice is unknown. */
function validateVoice(voiceName: string | null, engine: "web" | "kokoro"): string | null {
  if (!voiceName) return null;
  if (engine === "kokoro") {
    // Check against known Kokoro voices
    return voiceName in KOKORO_VOICE_NAMES ? voiceName : null;
  }
  // Web Speech voices are platform-dependent — accept any non-empty string
  // (actual validation happens at runtime when getVoices() returns)
  return voiceName;
}

/** Clamp rate to valid TTS range. */
function clampRate(rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0) return KOKORO_DEFAULT_RATE_BUCKET;
  return Math.max(0.5, Math.min(2.0, rate));
}

/**
 * Check whether a book's narration profile assignment is still valid.
 * Returns true if no assignment or the assignment resolves to an existing profile.
 */
export function isBookNarrationValid(
  settings: BlurbySettings,
  doc: BlurbyDoc,
): boolean {
  if (!doc.narrationProfileId) return true;
  const profiles = settings.narrationProfiles || [];
  return profiles.some(p => p.id === doc.narrationProfileId);
}
