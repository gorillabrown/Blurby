// NARRATE-REBUILD-1 P3 — the producer's word map (main/narrate/wordmap.js), the code the Phase 0 harness now
// re-exports. Uses the real phonemizer (espeak-ng wasm, offline) for the phoneme string and the isolated
// forms; durations and PCM are synthetic but lawful (Σ frames × 600 = samples), so the test exercises the
// token identity, the units law, segment reconciliation and the word -> unit alignment, never timing.
import { createRequire } from "module";
import { beforeAll, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { buildWordMap, kokoroPost, phonemeGroups } = require("../../main/narrate/wordmap.js");

let phonemize;
beforeAll(async () => {
  ({ phonemize } = require("phonemizer"));
  await phonemize("warm up", "en-us");
}, 30_000);

const FACTOR = 600;
const isolated = async (word, lang) => phonemize(word, lang);

/** A lawful synthetic record for one punctuation-free segment, as capture.synthesize would shape it. */
async function record(text, { framesPerToken = 3, lang = "en-us" } = {}) {
  const out = await phonemize(text, lang);
  const phonemes = kokoroPost(out.join(" "), "a");
  const chars = [...phonemes];
  const ids = [0, ...chars.map((_, i) => 100 + i), 0];
  const durations = ids.map(() => framesPerToken);
  const sum = durations.reduce((a, b) => a + b, 0);
  return { text, phonemes, ids, durations, durationsType: "float32", segments: [{ text, lang, out }], pcm: new Float32Array(sum * FACTOR), sampleRate: 24000, provenance: { source: "model-output" } };
}

describe("narrate producer word map (P0-2 mapping policy)", () => {
  it("reconciles a chunk and covers every source word in order, fusing what espeak fuses", async () => {
    const text = "Of my grandfather Verus I have learned to be gentle and meek";
    const rec = await record(text);
    const wm = await buildWordMap(rec, isolated);
    expect(wm.identity.ok).toBe(true);
    expect(wm.law).toMatchObject({ ok: true, factor: FACTOR, pcmSamples: rec.pcm.length });
    expect(wm.segmentsOk).toBe(true);
    expect(wm.reconciled).toBe(true);
    expect(wm.failures).toEqual([]);
    // Every source word belongs to exactly one unit, in order; unit spans are monotone within the PCM.
    expect(wm.units.flatMap((u) => u.words)).toEqual(text.split(" "));
    let last = rec.durations[0] * FACTOR;
    for (const u of wm.units) {
      expect(u.sampleStart).toBeGreaterThanOrEqual(last);
      expect(u.sampleEnd).toBeGreaterThan(u.sampleStart);
      expect(u.sampleStart).toBe(u.frameStart * FACTOR);
      expect(u.sampleEnd).toBe(u.frameEnd * FACTOR);
      expect(u.sampleEnd).toBeLessThanOrEqual(rec.pcm.length);
      last = u.sampleEnd;
    }
    // "to be" is one phoneme group with no boundary mark (state.md Working set): one fused unit, reported as such.
    const fused = wm.units.filter((u) => u.kind === "fused");
    expect(fused.some((u) => u.words.join(" ") === "to be")).toBe(true);
    expect(wm.coverage.fusedRuns).toBe(fused.length);
    expect(wm.coverage.wordsInFused).toBe(fused.reduce((n, u) => n + u.words.length, 0));
    // Groups are the final string's runs between separators; the units' char ranges tile them.
    expect(phonemeGroups(rec.phonemes).groups.length).toBe(wm.units.reduce((n, u) => n + (u.kind === "split-word" ? u.group.split(" ").length : 1), 0));
  });

  it("fails closed when the token identity breaks (one duration too few)", async () => {
    const rec = await record("Of my mother I have learned to be religious");
    rec.durations = rec.durations.slice(1);
    const wm = await buildWordMap(rec, isolated);
    expect(wm.identity.ok).toBe(false);
    expect(wm.reconciled).toBe(false);
    expect(wm.failures).toContain("token identity");
  });

  it("fails closed when the units law breaks (PCM one sample short)", async () => {
    const rec = await record("Of my mother I have learned to be religious");
    rec.pcm = new Float32Array(rec.pcm.length - 1);
    const wm = await buildWordMap(rec, isolated);
    expect(wm.law.ok).toBe(false);
    expect(wm.reconciled).toBe(false);
    expect(wm.failures).toContain("units law");
  });

  it("fails closed when the segment output does not match the final phoneme string", async () => {
    const rec = await record("not only to do but to intend any evil");
    rec.segments = [{ ...rec.segments[0], out: ["nˈɑːt ˈoʊnli"] }];
    const wm = await buildWordMap(rec, isolated);
    expect(wm.segmentsOk).toBe(false);
    expect(wm.reconciled).toBe(false);
    expect(wm.units).toEqual([]);
  });
});
