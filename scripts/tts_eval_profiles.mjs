export const SOAK_PROFILES = Object.freeze({
  short: Object.freeze({
    name: "short",
    scenarioLimit: 2,
    iterations: 2,
    checkpointEvery: 2,
  }),
  standard: Object.freeze({
    name: "standard",
    scenarioLimit: 4,
    iterations: 4,
    checkpointEvery: 4,
  }),
  overnight: Object.freeze({
    name: "overnight",
    scenarioLimit: 5,
    iterations: 12,
    checkpointEvery: 10,
  }),
});

export function getSoakProfile(profileName) {
  const key = String(profileName || "short").toLowerCase();
  const profile = SOAK_PROFILES[key];
  if (!profile) {
    const valid = Object.keys(SOAK_PROFILES).join(", ");
    throw new Error(`Unknown soak profile "${profileName}". Valid profiles: ${valid}`);
  }
  return profile;
}

