import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { parseRates, RATE_MIN, RATE_MAX } from "../../scripts/narrate-rebuild/lib/rates.mjs";

// NARRATE-TRACE-LABELS-1: the latency launcher's --rates must be finite numbers on Narrate's grid (0.80–2.00, step
// 0.05). `Number("1.0 2.0")` was NaN, and a 5-minute "session-NaN" reported PASS and exited 0 (LL-151).

describe("parseRates (NARRATE-TRACE-LABELS-1)", () => {
  it("returns the numbers for comma-separated rates on the grid", () => {
    expect(parseRates("1.0,2.0")).toEqual([1, 2]);
    expect(parseRates("0.8,1.25")).toEqual([0.8, 1.25]);
  });

  it.each(["1.0 2.0", "abc", "0.75", "2.05", "1.03", ""])("throws for %j", (bad) => {
    expect(() => parseRates(bad)).toThrow();
  });

  it("the grid's ends match KOKORO_UI_RATE_MIN and KOKORO_UI_RATE_MAX in src/constants.ts", () => {
    const text = fs.readFileSync(new URL("../../src/constants.ts", import.meta.url), "utf-8");
    const declared = (name) => Number(text.match(new RegExp(`export const ${name} = ([0-9.]+);`))[1]);
    expect(RATE_MIN).toBe(declared("KOKORO_UI_RATE_MIN"));
    expect(RATE_MAX).toBe(declared("KOKORO_UI_RATE_MAX"));
  });
});
