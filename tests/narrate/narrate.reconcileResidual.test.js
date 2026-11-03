// NARRATE-RECONCILE-RESIDUAL-1 — phrase evidence for fused units, as a second pass only (main/narrate/wordmap.js).
// A two-word name that espeak reads as one fused group with [tʃ] where the second word read alone has [k] costs 0.67
// against its isolated forms (limit 0.5). The second pass reads the unit's own words together, through the same
// isolated() path, and takes the lower cost; the phrase form is identification evidence only and never supplies a span.
// Synthetic, lawful records (Σ frames × 600 = samples) and a stub isolated(), the shape the planner measured.
import { createRequire } from "module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { buildWordMap } = require("../../main/narrate/wordmap.js");

const FACTOR = 600;
const FRAMES = 3;

/** A lawful synthetic record for one segment whose phonemizer output is `out` (already kokoro-post-processed). */
function record(text, out) {
  const phonemes = out.join(" ");
  const ids = [0, ...[...phonemes].map((_, i) => 100 + i), 0];
  const durations = ids.map(() => FRAMES);
  const sum = durations.reduce((a, b) => a + b, 0);
  return { text, phonemes, ids, durations, durationsType: "float32", segments: [{ text, lang: "en-us", out }], pcm: new Float32Array(sum * FACTOR), sampleRate: 24000, provenance: { source: "model-output" } };
}

/** A stub isolated(): a fixed form per word or phrase, every call recorded. */
function stub(forms) {
  const calls = [];
  const isolated = async (text) => {
    calls.push(text);
    if (!(text in forms)) throw new Error(`stub has no form for "${text}"`);
    return [forms[text]];
  };
  return { isolated, calls };
}

describe("phrase evidence for fused units (NARRATE-RECONCILE-RESIDUAL-1)", () => {
  it("r1: a fused name espeak reads differently alone is identified by reading its words together", async () => {
    const rec = record("Ab Chy", ["æbtʃˈaɪ"]);
    const { isolated, calls } = stub({ Ab: "ˈæb", Chy: "kˈaɪ", "Ab Chy": "æbtʃˈaɪ" });
    const wm = await buildWordMap(rec, isolated);
    expect(wm.failures).toEqual([]);
    expect(wm.reconciled).toBe(true);
    expect(wm.units).toHaveLength(1);
    const [u] = wm.units;
    expect(u.kind).toBe("fused");
    expect(u.words).toEqual(["Ab", "Chy"]);
    // The whole group's frames: every phoneme character's frames, between the BOS and EOS frames.
    expect(u.frameStart).toBe(wm.leadFrames);
    expect(u.frameEnd).toBe(rec.durations.slice(0, -1).reduce((a, b) => a + b, 0));
    expect(u.sampleStart).toBe(u.frameStart * FACTOR);
    expect(u.sampleEnd).toBe(u.frameEnd * FACTOR);
    expect(u.evidence).toBe("phrase");
    expect(u.phrase).toBe("æbtʃˈaɪ");
    expect(u.isolated).toEqual(["ˈæb", "kˈaɪ"]);
    expect(u.evidenceCost).toBe(0);
    expect(calls).toContain("Ab Chy");
  });

  it("r2 (control, the limit holds): when espeak agrees with the isolated forms the unit still fails closed", async () => {
    const rec = record("Ab Chy", ["æbtʃˈaɪ"]);
    const { isolated } = stub({ Ab: "ˈæb", Chy: "kˈaɪ", "Ab Chy": "æbkˈaɪ" });
    const wm = await buildWordMap(rec, isolated);
    expect(wm.reconciled).toBe(false);
    expect(wm.failures).toEqual(["fused unit evidence cost 0.67 > 0.5: Ab Chy ~ æbtʃˈaɪ"]);
  });

  it("r3 (control, the first pass is unchanged): a segment that reconciles never reads a phrase and keeps its units", async () => {
    const rec = record("Then Verus to be calm", ["ðˈɛn", "vˈɛɹəs", "təbi", "kˈɑːm"]);
    const { isolated, calls } = stub({ Then: "ðˈɛn", Verus: "vˈɛɹəs", to: "tˈuː", be: "bˈiː", calm: "kˈɑːm" });
    const wm = await buildWordMap(rec, isolated);
    expect(wm.failures).toEqual([]);
    expect(wm.reconciled).toBe(true);
    expect(calls.some((c) => c.includes(" "))).toBe(false);
    // The units as the base (main @ 28ec48e2) builds them, field for field.
    const base = ({ words, wordIndex, kind, group, charStart, charEnd, frameStart, frameEnd, sampleStart, sampleEnd, evidenceCost, isolated: iso }) =>
      ({ words, wordIndex, kind, group, charStart, charEnd, frameStart, frameEnd, sampleStart, sampleEnd, evidenceCost, isolated: iso });
    expect(wm.units.map(base)).toEqual([
      { words: ["Then"], wordIndex: 0, kind: "word", group: "ðˈɛn", charStart: 0, charEnd: 4, frameStart: 3, frameEnd: 15, sampleStart: 1800, sampleEnd: 9000, evidenceCost: 0, isolated: ["ðˈɛn"] },
      { words: ["Verus"], wordIndex: 1, kind: "word", group: "vˈɛɹəs", charStart: 5, charEnd: 11, frameStart: 18, frameEnd: 36, sampleStart: 10800, sampleEnd: 21600, evidenceCost: 0, isolated: ["vˈɛɹəs"] },
      { words: ["to", "be"], wordIndex: 2, kind: "fused", group: "təbi", charStart: 12, charEnd: 16, frameStart: 39, frameEnd: 51, sampleStart: 23400, sampleEnd: 30600, evidenceCost: 0, isolated: ["tˈuː", "bˈiː"] },
      { words: ["calm"], wordIndex: 4, kind: "word", group: "kˈɑːm", charStart: 17, charEnd: 22, frameStart: 54, frameEnd: 69, sampleStart: 32400, sampleEnd: 41400, evidenceCost: 0, isolated: ["kˈɑːm"] },
    ]);
    expect(wm.units.filter((u) => u.kind === "fused")).toHaveLength(1);
  });
});
