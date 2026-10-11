import {
  KOKORO_DEFAULT_RATE_BUCKET,
  KOKORO_UI_RATE_MAX,
  KOKORO_UI_RATE_MIN,
  KOKORO_UI_RATE_STEP,
  resolveKokoroBucket,
  type KokoroRateBucket,
} from "../constants";

// Integer hundredths: every UI speed is (min + step*i)/100, so 1.05 is exactly the literal 1.05.
const UI_MIN_HUNDREDTHS = Math.round(KOKORO_UI_RATE_MIN * 100);
const UI_MAX_HUNDREDTHS = Math.round(KOKORO_UI_RATE_MAX * 100);
const UI_STEP_HUNDREDTHS = Math.round(KOKORO_UI_RATE_STEP * 100);

/** The Kokoro UI domain (OC-7): 0.80–2.00 in 0.05 steps, derived from the constants (25 values). */
export const KOKORO_UI_SPEEDS: readonly number[] = Object.freeze(
  Array.from(
    { length: (UI_MAX_HUNDREDTHS - UI_MIN_HUNDREDTHS) / UI_STEP_HUNDREDTHS + 1 },
    (_, i) => (UI_MIN_HUNDREDTHS + UI_STEP_HUNDREDTHS * i) / 100,
  ),
);
export type KokoroUiSpeed = number;

export interface KokoroRatePlan {
  selectedSpeed: KokoroUiSpeed;
  generationBucket: KokoroRateBucket;
  tempoFactor: number;
}

function kokoroUiIndex(speed: number): number {
  const i = Math.round((speed * 100 - UI_MIN_HUNDREDTHS) / UI_STEP_HUNDREDTHS);
  return Math.max(0, Math.min(KOKORO_UI_SPEEDS.length - 1, i));
}

/**
 * Clamp an arbitrary speed to the Kokoro UI domain: 0.80-2.00 in 0.05 steps (non-finite → 1.0).
 * This keeps downstream generation/cache logic aligned with the settings surface.
 */
export function normalizeKokoroUiSpeed(speed: number): KokoroUiSpeed {
  if (!Number.isFinite(speed)) return KOKORO_DEFAULT_RATE_BUCKET;
  return KOKORO_UI_SPEEDS[kokoroUiIndex(speed)];
}

/**
 * Step through the Kokoro UI speeds in 0.05 increments, clamped to the supported range.
 * The returned speed remains user-facing; generation still resolves through buckets later.
 */
export function stepKokoroUiSpeed(current: number, delta: number): KokoroUiSpeed {
  const idx = kokoroUiIndex(normalizeKokoroUiSpeed(current));
  return KOKORO_UI_SPEEDS[Math.max(0, Math.min(KOKORO_UI_SPEEDS.length - 1, idx + (delta > 0 ? 1 : -1)))];
}

/**
 * Map the UI-selected speed to:
 * - a native Kokoro generation bucket (1.0 / 1.2 / 1.5; unchanged by OC-7)
 * - a runtime tempo factor that converts generated audio to the exact UI speed
 */
export function resolveKokoroRatePlan(speed: number): KokoroRatePlan {
  const selectedSpeed = normalizeKokoroUiSpeed(speed);
  const generationBucket = resolveKokoroBucket(selectedSpeed) ?? KOKORO_DEFAULT_RATE_BUCKET;

  return {
    selectedSpeed,
    generationBucket,
    tempoFactor: selectedSpeed / generationBucket,
  };
}
