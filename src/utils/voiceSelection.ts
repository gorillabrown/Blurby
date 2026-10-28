/**
 * Web Speech API default voice selection with locale priority.
 * Prefers en-US, then en-GB, then any en-* locale, then first available voice.
 */

interface VoiceLike {
  lang: string;
}

/**
 * Select the best default voice from a list using locale priority:
 *   1. Exact en-US
 *   2. Exact en-GB
 *   3. Any en-* variant (en-AU, en-IN, etc.)
 *   4. First available voice
 *   5. undefined if list is empty
 */
export function selectPreferredVoice<T extends VoiceLike>(voices: T[]): T | undefined {
  if (voices.length === 0) return undefined;
  return voices.find((v) => v.lang === "en-US")
    || voices.find((v) => v.lang === "en-GB")
    || voices.find((v) => v.lang.startsWith("en"))
    || voices[0];
}
