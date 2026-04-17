import {
  KOKORO_DEFAULT_RATE_BUCKET,
  KOKORO_UI_RATE_MAX,
  KOKORO_UI_RATE_MIN,
  KOKORO_UI_RATE_STEP,
  resolveKokoroBucket,
  type KokoroRateBucket,
} from "../constants";

export const KOKORO_UI_SPEEDS = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5] as const;
export type KokoroUiSpeed = (typeof KOKORO_UI_SPEEDS)[number];

export interface KokoroRatePlan {
  selectedSpeed: KokoroUiSpeed;
  generationBucket: KokoroRateBucket;
  tempoFactor: number;
}

/**
 * Clamp an arbitrary speed to the Kokoro UI domain: 1.0-1.5 in 0.1 steps.
 * This keeps downstream generation/cache logic aligned with the settings surface.
 */
export function normalizeKokoroUiSpeed(speed: number): KokoroUiSpeed {
  if (!Number.isFinite(speed)) return KOKORO_UI_SPEEDS[0];

  const clamped = Math.max(KOKORO_UI_RATE_MIN, Math.min(KOKORO_UI_RATE_MAX, speed));
  const stepped = Math.round(clamped / KOKORO_UI_RATE_STEP) * KOKORO_UI_RATE_STEP;
  const normalized = Number(stepped.toFixed(1));
  const match = KOKORO_UI_SPEEDS.find((uiSpeed) => uiSpeed === normalized);
  return match ?? KOKORO_UI_SPEEDS[0];
}

/**
 * Step through the Kokoro UI speeds in 0.1 increments, clamped to the supported range.
 * The returned speed remains user-facing; generation still resolves through buckets later.
 */
export function stepKokoroUiSpeed(current: number, delta: number): KokoroUiSpeed {
  const normalized = normalizeKokoroUiSpeed(current);
  const idx = KOKORO_UI_SPEEDS.indexOf(normalized);
  const nextIdx = Math.max(0, Math.min(KOKORO_UI_SPEEDS.length - 1, idx + (delta > 0 ? 1 : -1)));
  return KOKORO_UI_SPEEDS[nextIdx];
}

/**
 * Map the UI-selected speed to:
 * - a native Kokoro generation bucket (1.0 / 1.2 / 1.5)
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
