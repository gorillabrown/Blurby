// NARRATE-REBUILD-1 P6b — reconciliation through the producer's real text side: kokoro-js 1.2.1's normalizer and
// tokenizer (the committed fixture tests/fixtures/narrate-rebuild/kokoro-tokenizer/), espeak (phonemizer), capture.js,
// wordmap.js and normalize.js, with the ONNX model replaced by a stub (one duration frame per id, 600 zero samples per
// frame) — so the tables are lawful and only the text side is under test, never timing. Each chunk is the exact text the
// engine planned in the app (Electron's ICU numbering, resources/sample-meditations.epub) or a Phase 0 fixture line.
// Every case below failed closed (or passed with a wrong table) before P6b, for the reason its title names.
import path from "path";
import { createRequire } from "module";
import { beforeAll, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(__dirname, "../..");
const FIXTURES = path.join(ROOT, "tests/fixtures/narrate-rebuild");
const { attachCapture, synthesize } = require("../../main/narrate/capture.js");
const { buildWordMap } = require("../../main/narrate/wordmap.js");
const { mapUnitsToSourceWords } = require("../../main/narrate/normalize.js");

let tts, capture;
beforeAll(async () => {
  const kreq = createRequire(path.join(ROOT, "node_modules/kokoro-js/dist/kokoro.cjs"));
  const kokoro = kreq(path.join(ROOT, "node_modules/kokoro-js/dist/kokoro.cjs"));
  const tf = kreq("@huggingface/transformers");
  Object.assign(tf.env, { allowRemoteModels: false, allowLocalModels: true, localModelPath: FIXTURES + "/", useFSCache: false, useBrowserCache: false });
  const tokenizer = await tf.AutoTokenizer.from_pretrained("kokoro-tokenizer");
  const stubModel = async (inputs) => {
    const n = inputs.input_ids.dims.at(-1);
    return { waveform: { data: new Float32Array(600 * n) }, durations: { data: new Float32Array(n).fill(1), type: "float32", dims: [1, n] } };
  };
  tts = new kokoro.KokoroTTS(stubModel, tokenizer);
  capture = attachCapture(tts, kreq("phonemizer"));
}, 60_000);

/** producer-worker.js generate()'s text side for one chunk: the word map, then the source-word units (or the throw). */
async function reconcile(text) {
  const rec = await synthesize(tts, capture, text, { voice: "af_bella", speed: 1.0 });
  const wm = await buildWordMap(rec, capture.phonemizeIsolated);
  if (!wm.reconciled) return { wm, failure: wm.failures.join(" | ") };
  try { return { wm, units: mapUnitsToSourceWords(text, rec.segments, wm.units) }; }
  catch (err) { return { wm, failure: err.message }; }
}
const expectCovers = (r, text) => {
  expect(r.failure).toBeUndefined();
  expect(r.units.flatMap((u) => u.words)).toEqual(text.split(" "));
};

describe("narrate reconciliation (P6b)", () => {
  it("F1: a closing quote after a stop is not a word (the D2 stall: the chunk at app word 3217 was 'segment unalignable: '')", async () => {
    const text = "It should be a man's task, says the Imitation to overcome himself, and every day to be stronger than himself.' In withstanding of the passions standeth very peace of heart.'";
    expectCovers(await reconcile(text), text);
  });

  it("F1/F2: a mid-chunk closing quote no longer changes the word count (was 'normalization changed the word count: 29 source words, 30 spoken, 29 expected')", async () => {
    const text = "Let us set the axe to the root, that we being purged of our passions may have a peaceable mind.' To this end there must be continual self examination.";
    expectCovers(await reconcile(text), text);
  });

  it("F2: an em-dash join is two spoken words for one source word (was 'normalization changed the word count: 3 source words, 4 spoken, 3 expected')", async () => {
    const text = "Wait—are we live?";
    const r = await reconcile(text);
    expectCovers(r, text);
    expect(r.units[0]).toMatchObject({ words: ["Wait—are"], spoken: ["Wait", "are"] });
  });

  it("F3: a number reads in more than three groups (was 'segment unalignable: 121')", async () => {
    const text = "INTRODUCTION MARCUS AURELIUS ANTONINUS was born on April 26, A. D. 121. His real name was M.";
    expectCovers(await reconcile(text), text);
  });

  it("F3: the cost check covers a split word (was a passing table pairing 'his' with the groups of 'five his')", async () => {
    const text = "In 140 Marcus was raised to the consulship, and in 145 his betrothal was consummated by marriage.";
    const r = await reconcile(text);
    expectCovers(r, text);
    const his = r.wm.units.filter((u) => u.words.includes("his")).map((u) => [u.kind, u.group]);
    expect(his).toEqual([["word", "hɪz"]]); // before P6b: [["split-word", "fˈaɪv hɪz"]], accepted at cost 0.84 unchecked
  });

  it("F4: an en-us linking r is free ('our own' was 'unit evidence cost 1.00 > 0.5: our ~ ˌaʊɚɹ' without it)", async () => {
    const text = "and how to subscribe to our email newsletter to hear about new eBooks.";
    expectCovers(await reconcile(text), text);
  });

  it("F1: a closing quote before a Roman numeral is not fused into it (was 'unit evidence cost 1.68 > 0.5: ' ~ ɹˌoʊmən')", async () => {
    const text = "By no means.' XXIV. Out of Antisthenes. It is a princely thing to do well, and to be ill spoken of.";
    expectCovers(await reconcile(text), text);
  });

  it("F5: an all-caps word espeak spells out in context is identified by its spelled form (was 'unit evidence cost 1.82 > 0.5: OWN ~ ˌoʊdˌʌbəljˌuːˈɛn')", async () => {
    const text = "HE WAS THE LAST OF HIS OWN KINDRED O what care did his predecessors take, that they might leave a successor,";
    expectCovers(await reconcile(text), text);
  });

  // NARRATE-YEARS-1: the producer speaks preNormalize(text) and still maps it exactly onto the original source words.
  const spokenOf = (r, word) => r.units.find((u) => u.words.includes(word))?.spoken;

  it("NARRATE-YEARS-1: 1066 is a year and 1,974 a count, and the chunk reconciles with each word's spoken words by text", async () => {
    const text = "In 1066 the Normans came, and 1,974 coins were struck.";
    const r = await reconcile(text);
    expectCovers(r, text);
    expect(spokenOf(r, "1066")).toEqual(["10", "66"]);
    expect(spokenOf(r, "1,974")).toEqual(["1974"]);
  });

  it("NARRATE-YEARS-1 (y10): an en-dash year range, a decade before 1100 and an en dash between non-years all reconcile", async () => {
    const text = "From 1914–1918 and in the 1060s, pages 10–12 were lost.";
    const r = await reconcile(text);
    expectCovers(r, text);
    expect(spokenOf(r, "1914–1918")).toEqual(["19", "14", "to", "19", "18"]);
    expect(spokenOf(r, "1060s,")).toEqual(["10", "60s"]);
  });
});
