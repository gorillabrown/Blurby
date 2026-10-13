// P0-2 / P0-4 generation matrix: every chunk of every passage, at every rate, on every voice.
// Writes redacted numeric tables to docs/studies/narrate-rebuild-1/phase0/tables/<passage>.<voice>.json
// and WAV audio outside the repository (artifacts/audio). Resumable: rates already in a table are skipped.
// Run from pwsh in the phase worktree:
//   node scripts/narrate-rebuild/p0-generate.mjs [--passages passage-a,passage-b] [--voices af_bella,bf_emma] [--rates all|1.00,2.00] [--dtype q4|fp32|fp16]
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { loadRuntime, loadKokoro, attachCapture, synthesize, sha256Bytes, CORPUS_DIR, PHASE0_DIR, AUDIO_ROOT, TOKEN_CAP } from "./lib/offline-kokoro.mjs";
import { chunkPassage } from "./lib/chunker.mjs";
import { buildWordMap } from "./lib/wordmap.mjs";
import { writeWav } from "./lib/wav.mjs";

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const manifest = JSON.parse(fs.readFileSync(path.join(CORPUS_DIR, "manifest.json"), "utf8"));
const passages = arg("--passages", manifest.passages.map((p) => p.id).join(",")).split(",");
const voices = arg("--voices", manifest.voices.join(",")).split(",");
const ratesArg = arg("--rates", "all");
const rates = ratesArg === "all" ? manifest.rates : ratesArg.split(",").map(Number);
const DTYPE = arg("--dtype", "q4"); // precision trial (G1 route b): fp32 and fp16 tables and audio live beside the q4 ones, never over them
const TABLES = path.join(PHASE0_DIR, DTYPE === "q4" ? "tables" : `tables-${DTYPE}`);
fs.mkdirSync(TABLES, { recursive: true });

const rt = loadRuntime();
const { TextSplitterStream } = createRequire(rt.kokoroPath)(rt.kokoroPath);
const rateKey = (r) => r.toFixed(2);

for (const voice of voices) {
  const { tts, loadMs, outputNames } = await loadKokoro(rt, { dtype: DTYPE });
  const cap = attachCapture(tts, rt.ph);
  console.log(JSON.stringify({ voice, loadMs: Math.round(loadMs), outputNames }));
  for (const passageId of passages) {
    const pm = manifest.passages.find((p) => p.id === passageId);
    const text = fs.readFileSync(path.join(CORPUS_DIR, pm.file), "utf8");
    const chunks = chunkPassage(TextSplitterStream, text);
    const file = path.join(TABLES, `${passageId}.${voice}.json`);
    const table = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {
      schema: "narrate-rebuild-1/phase0/table@1", passage: passageId, voice, dtype: DTYPE, device: "cpu", tokenCap: TOKEN_CAP,
      host: rt.host, runtime: rt.versions, startedAt: new Date().toISOString(),
      chunks: chunks.map((c) => ({ index: c.index, words: c.words, sectionIndex: c.sectionIndex, sectionBreakBefore: c.sectionBreakBefore, firstChunkCut: c.firstChunkCut ?? null, text: c.text })),
      rates: {},
    };
    for (const rate of rates) {
      const key = rateKey(rate);
      if (table.rates[key]?.complete) { console.log(`skip ${passageId} ${voice} ${key} (done)`); continue; }
      const entry = { rate, chunks: [], complete: false, startedAt: new Date().toISOString() };
      for (const c of chunks) {
        let rec, wm, error = null;
        try {
          rec = await synthesize(tts, cap, c.text, { voice, speed: rate });
          wm = await buildWordMap(rec, cap.phonemizeIsolated);
        } catch (e) { error = String(e.message || e); }
        if (error) {
          entry.chunks.push({ index: c.index, error, reconciled: false });
          console.log(`FAIL ${passageId} ${voice} ${key} chunk ${c.index}: ${error}`);
          continue;
        }
        const wavRel = path.join(...(DTYPE === "q4" ? [] : [DTYPE]), passageId, voice, key, `chunk-${c.index}.wav`);
        writeWav(path.join(AUDIO_ROOT, wavRel), rec.pcm, rec.sampleRate);
        entry.chunks.push({
          index: c.index, text: c.text, phonemes: rec.phonemes, ids: rec.ids, durations: rec.durations, durationsType: rec.durationsType,
          tokens: rec.ids.length, pcmSamples: rec.pcm.length, sampleRate: rec.sampleRate, pcmSha256: sha256Bytes(Buffer.from(rec.pcm.buffer, rec.pcm.byteOffset, rec.pcm.byteLength)),
          wav: wavRel.replace(/\\/g, "/"), genMs: Math.round(rec.genMs), provenance: rec.provenance,
          law: wm.law, identity: wm.identity, segmentsOk: wm.segmentsOk, leadFrames: wm.leadFrames, tailFrames: wm.tailFrames,
          reconciled: wm.reconciled, failures: wm.failures, coverage: wm.coverage,
          units: wm.units.map((u) => ({ words: u.words, kind: u.kind, group: u.group, charStart: u.charStart, charEnd: u.charEnd, frameStart: u.frameStart, frameEnd: u.frameEnd, sampleStart: u.sampleStart, sampleEnd: u.sampleEnd, evidenceCost: u.evidenceCost, isolated: u.isolated, ...(u.kind === "fused" ? { splitExact: u.splitExact, wordBoundaryMarkInside: u.wordBoundaryMarkInside } : {}) })),
        });
        console.log(`${passageId} ${voice} ${key} chunk ${c.index}: tokens ${rec.ids.length} frames ${wm.law.sumFrames} x${wm.law.factor} = ${rec.pcm.length} law ${wm.law.ok ? "ok" : "FAIL"} reconciled ${wm.reconciled} fused ${wm.coverage.fusedRuns} gen ${Math.round(rec.genMs)} ms`);
      }
      entry.complete = entry.chunks.length === chunks.length && entry.chunks.every((c) => !c.error);
      entry.finishedAt = new Date().toISOString();
      table.rates[key] = entry;
      fs.writeFileSync(file, JSON.stringify(table) + "\n");
    }
    table.finishedAt = new Date().toISOString();
    fs.writeFileSync(file, JSON.stringify(table) + "\n");
  }
}
console.log("done");
