// NARRATE-TRACE-LABELS-1 — parse a launcher's --rates against Narrate's rate grid. A malformed value must stop the run
// (exit 2 in the caller), never become NaN and a false PASS (LL-151).
// The grid mirrors src/constants.ts:27-29 (KOKORO_UI_RATE_MIN, KOKORO_UI_RATE_MAX, KOKORO_UI_RATE_STEP);
// tests/narrate/narrate.rateArgs.test.js checks that the ends agree.
export const RATE_MIN = 0.8;
export const RATE_MAX = 2.0;
export const RATE_STEP = 0.05;
const EPSILON = 1e-9;

/** "1.0,2.0" → [1, 2]. Throws on any value that is not a finite number on the grid. */
export function parseRates(str) {
  return String(str).split(",").map((part) => {
    const raw = part.trim();
    const rate = raw === "" ? NaN : Number(raw);
    if (!Number.isFinite(rate)) throw new Error(`--rates: "${raw}" is not a number (use commas: 1.0,2.0)`);
    if (rate < RATE_MIN - EPSILON || rate > RATE_MAX + EPSILON) throw new Error(`--rates: ${raw} is outside ${RATE_MIN}–${RATE_MAX}`);
    const steps = (rate - RATE_MIN) / RATE_STEP;
    if (Math.abs(steps - Math.round(steps)) > EPSILON / RATE_STEP) throw new Error(`--rates: ${raw} is not on the ${RATE_STEP} grid`);
    return rate;
  });
}
