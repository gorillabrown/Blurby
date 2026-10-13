"use strict";
// main/narrate/capture.js — the three seams the production generate() path crosses, wrapped so one
// generate() yields the exact phoneme string, the exact input_ids sent, the raw duration tensor and the
// phonemizer's per-segment output. Nothing is re-phonemized word by word here. Moved from the Phase 0
// harness (scripts/narrate-rebuild/lib/offline-kokoro.mjs re-exports this file); the product's producer
// and the harness share it, so provenance is written in exactly one place: synthesize() below, from
// what the model returned (LL-142; ROADMAP NARRATE-REBUILD-1 Core, "provenance, not a trusted flag").

const TOKEN_CAP = 400; // T2: about 400 phoneme tokens, under the model's 512
const PROVENANCE_SOURCE = "model-output";

function attachCapture(tts, ph) {
  const cap = { ph: [], tok: [], model: [] };
  const origPh = ph.phonemize;
  ph.phonemize = async (text, lang) => { const out = await origPh(text, lang); cap.ph.push({ text, lang, out }); return out; };
  const origTok = tts.tokenizer;
  tts.tokenizer = (text, opts) => {
    const r = origTok(text, opts);
    const ids = Array.from(r.input_ids.data, Number);
    if (ids.length > TOKEN_CAP) throw new Error(`token cap: ${ids.length} input_ids exceed ${TOKEN_CAP} (T2); chunk rejected before synthesis`);
    cap.tok.push({ text, ids });
    return r;
  };
  const origModel = tts.model;
  tts.model = async (inputs) => {
    const out = await origModel(inputs);
    cap.model.push({
      outputNames: Object.keys(out),
      waveformType: out.waveform?.type ?? null,
      durationsType: out.durations?.type ?? null,
      durationsDims: out.durations?.dims ?? null,
      durations: out.durations ? Array.from(out.durations.data, Number) : null, // explicit int64/float handling
      idsSent: Array.from(inputs.input_ids.data, Number),
      speedSent: Number(inputs.speed.data[0]),
    });
    return out;
  };
  const vocab = origTok.model.tokens_to_ids ?? origTok.model.vocab;
  const spaceId = vocab instanceof Map ? vocab.get(" ") : vocab[" "];
  return {
    phonemizeIsolated: origPh, // identification evidence only (see MAPPING_POLICY.md)
    spaceId,
    take() { const t = { ph: cap.ph, tok: cap.tok, model: cap.model }; cap.ph = []; cap.tok = []; cap.model = []; return t; },
  };
}

// One production-path generate() with everything captured. Fails closed on any seam mismatch.
async function synthesize(tts, capture, text, { voice, speed }) {
  capture.take();
  const t0 = performance.now();
  const audio = await tts.generate(text, { voice, speed });
  const genMs = performance.now() - t0;
  const c = capture.take();
  if (c.tok.length !== 1 || c.model.length !== 1) throw new Error(`capture: expected 1 tokenizer and 1 model call, saw ${c.tok.length} and ${c.model.length}`);
  const tok = c.tok[0], m = c.model[0];
  if (!m.durations) throw new Error("producer returned no durations output (fail closed)");
  if (m.idsSent.length !== tok.ids.length || m.idsSent.some((v, i) => v !== tok.ids[i])) throw new Error("ids sent to the model differ from the tokenizer output");
  if (m.durations.length !== tok.ids.length) throw new Error(`durations length ${m.durations.length} != input_ids length ${tok.ids.length}`);
  if (m.speedSent !== Math.fround(speed)) throw new Error(`speed sent ${m.speedSent} != requested ${speed} (float32 ${Math.fround(speed)})`); // the speed tensor is float32
  const pcm = audio.audio;
  if (!(pcm instanceof Float32Array)) throw new Error("RawAudio.audio is not a Float32Array");
  return {
    text, voice, speed,
    phonemes: tok.text,
    ids: tok.ids,
    durations: m.durations,
    durationsType: m.durationsType,
    segments: c.ph, // [{text: normalized punctuation-free segment, lang, out: string[]}]
    pcm,
    sampleRate: audio.sampling_rate,
    genMs,
    provenance: { source: PROVENANCE_SOURCE, outputNames: m.outputNames, durationsType: m.durationsType },
  };
}

module.exports = { TOKEN_CAP, PROVENANCE_SOURCE, attachCapture, synthesize };
