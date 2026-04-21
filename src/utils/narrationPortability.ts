/**
 * Narration data export/import utilities (TTS-6M).
 * Handles serialization, validation, and safe application of narration profiles and overrides.
 */
import type { NarrationProfile, PronunciationOverride, BlurbySettings } from "../types";

/** Schema version for the export payload — increment on breaking changes. */
export const NARRATION_EXPORT_VERSION = 1;

/** The export payload shape — all narration-specific user data. */
export interface NarrationExportPayload {
  version: number;
  exportedAt: number;  // Date.now()
  profiles: NarrationProfile[];
  globalOverrides: PronunciationOverride[];
  activeProfileId: string | null;
}

/** Validation result from import checking. */
export interface ImportValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  profileCount: number;
  overrideCount: number;
  /** Profile names that would conflict with existing ones. */
  conflictingNames: string[];
}

/** Create an export payload from current settings. */
export function exportNarrationData(settings: BlurbySettings): NarrationExportPayload {
  return {
    version: NARRATION_EXPORT_VERSION,
    exportedAt: Date.now(),
    profiles: settings.narrationProfiles ? [...settings.narrationProfiles] : [],
    globalOverrides: settings.pronunciationOverrides ? [...settings.pronunciationOverrides] : [],
    activeProfileId: settings.activeNarrationProfileId || null,
  };
}

/** Validate an import payload before applying it. */
export function validateNarrationImport(
  data: unknown,
  existingSettings: BlurbySettings,
): ImportValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Invalid payload: not an object"], warnings: [], profileCount: 0, overrideCount: 0, conflictingNames: [] };
  }

  const payload = data as Record<string, unknown>;

  // Version check
  if (typeof payload.version !== "number") {
    errors.push("Missing or invalid version field");
  } else if (payload.version > NARRATION_EXPORT_VERSION) {
    errors.push(`Unsupported version ${payload.version} (max supported: ${NARRATION_EXPORT_VERSION})`);
  }

  // Profiles check
  if (!Array.isArray(payload.profiles)) {
    errors.push("Missing or invalid profiles array");
  } else {
    for (let i = 0; i < payload.profiles.length; i++) {
      const p = payload.profiles[i] as Record<string, unknown>;
      if (!p || typeof p.id !== "string" || typeof p.name !== "string") {
        errors.push(`Profile at index ${i} is missing id or name`);
      }
      if (typeof p.ttsEngine !== "string" || !["web", "kokoro", "qwen"].includes(p.ttsEngine as string)) {
        errors.push(`Profile "${p.name || i}" has invalid ttsEngine`);
      }
    }
  }

  // Global overrides check
  if (payload.globalOverrides !== undefined && !Array.isArray(payload.globalOverrides)) {
    errors.push("Invalid globalOverrides: not an array");
  }

  // Conflict detection
  const existingNames = new Set((existingSettings.narrationProfiles || []).map(p => p.name.toLowerCase()));
  const importedProfiles = Array.isArray(payload.profiles) ? payload.profiles as NarrationProfile[] : [];
  const conflictingNames = importedProfiles
    .filter(p => existingNames.has(p.name.toLowerCase()))
    .map(p => p.name);

  if (conflictingNames.length > 0) {
    warnings.push(`${conflictingNames.length} profile(s) share names with existing profiles and will be added as duplicates alongside the current Qwen-first defaults`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    profileCount: importedProfiles.length,
    overrideCount: Array.isArray(payload.globalOverrides) ? (payload.globalOverrides as unknown[]).length : 0,
    conflictingNames,
  };
}

/** Apply a validated import payload. Returns the settings updates to apply. */
export function applyNarrationImport(
  payload: NarrationExportPayload,
  existingSettings: BlurbySettings,
  mode: "merge" | "replace",
): Partial<BlurbySettings> {
  if (mode === "replace") {
    return {
      narrationProfiles: payload.profiles,
      pronunciationOverrides: payload.globalOverrides,
      activeNarrationProfileId: payload.activeProfileId,
    };
  }

  // Merge: add imported profiles with new IDs to avoid collisions
  const existingProfiles = existingSettings.narrationProfiles || [];
  const existingIds = new Set(existingProfiles.map(p => p.id));

  const mergedProfiles = [...existingProfiles];
  for (const profile of payload.profiles) {
    if (existingIds.has(profile.id)) {
      // Generate new ID to avoid collision
      const newId = `np-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      mergedProfiles.push({ ...profile, id: newId });
    } else {
      mergedProfiles.push(profile);
    }
  }

  // Merge overrides: append imported overrides
  const existingOverrides = existingSettings.pronunciationOverrides || [];
  const mergedOverrides = [...existingOverrides, ...payload.globalOverrides];

  return {
    narrationProfiles: mergedProfiles,
    pronunciationOverrides: mergedOverrides,
    // Don't change active profile in merge mode
  };
}

/** Reset narration data. Returns settings updates. */
export function resetNarrationData(
  scope: "profiles" | "overrides" | "bookAssignments" | "all",
): Partial<BlurbySettings> {
  switch (scope) {
    case "profiles":
      return { narrationProfiles: [], activeNarrationProfileId: null };
    case "overrides":
      return { pronunciationOverrides: [] };
    case "all":
      return {
        narrationProfiles: [],
        activeNarrationProfileId: null,
        pronunciationOverrides: [],
      };
    case "bookAssignments":
      // Book assignments live on BlurbyDoc, not BlurbySettings.
      // Caller must handle clearing narrationProfileId from each doc.
      return {};
  }
}
