// F3 controls (read-only on repo). Usage: node controls.mjs <repoRoot> <modelRoot>
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";
import assert from "node:assert/strict";

const [repo, modelRoot] = process.argv.slice(2);
const nm = (p) => pathToFileURL(path.join(repo, "node_modules", p)).href;

// ---- Control 1: interior-shift vs the installed producer's own checks ----
const cjs = readFileSync(path.join(repo, "node_modules/kokoro-js/dist/kokoro.cjs"), "utf8");
const start = cjs.indexOf("function computeWordTimestamps(");
const end = cjs.indexOf("return timestamps}", start) + "return timestamps}".length;
const computeWordTimestamps = new Function(`${cjs.slice(start, end)}; return computeWordTimestamps;`)();

const HOP = 256, SR = 24000;
const words = ["The", "ancient", "city"];
const tokenCounts = [2, 5, 3];
// [BOS, w1 x2, sep, w2 x5, sep, w3 x3, EOS] in duration bins
const truth = [4, 6, 6, 2, 8, 8, 8, 8, 8, 2, 9, 9, 9, 4];
const shifted = truth.slice();
// move 8 bins (85 ms) from "ancient" into "The": interior boundary wrong, total identical
shifted[1] += 4; shifted[2] += 4; shifted[4] -= 4; shifted[5] -= 4;
const total = truth.reduce((a, b) => a + b, 0) * HOP;
const a = computeWordTimestamps(truth, words, tokenCounts, SR, total);
const b = computeWordTimestamps(shifted, words, tokenCounts, SR, total);
const shiftMs = (b[1].startTime - a[1].startTime) * 1000;
console.log("C1 truth   :", a.map((w) => `${w.word}@${(w.startTime * 1000).toFixed(1)}`).join(" "));
console.log("C1 shifted :", b.map((w) => `${w.word}@${(w.startTime * 1000).toFixed(1)}`).join(" "));
console.log(`C1 both accepted by producer checks; interior boundary moved ${shiftMs.toFixed(1)} ms`);
assert.ok(Math.abs(shiftMs) > 30);

// drift tolerance: waveform 20 ms longer than table still accepted
const c = computeWordTimestamps(truth, words, tokenCounts, SR, total + 0.02 * SR);
console.log(`C1b 20 ms total drift accepted: ${c.length === 3}`);

// ---- Control 2: runtime tokenizer special tokens vs the patch's count law ----
const { AutoTokenizer, env } = await import(nm("@huggingface/transformers/dist/transformers.node.mjs"));
env.allowRemoteModels = false;
env.localModelPath = modelRoot + path.sep;
const tok = await AutoTokenizer.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX");
const ids = (s) => Array.from(tok(s, { truncation: true }).input_ids.data, Number);
// representative IPA strings (content irrelevant: the question is per-call specials)
const perWord = ["ðə", "ˈeɪnʃənt", "sˈɪɾi"];
const full = perWord.join(" ");
const perIds = perWord.map(ids);
const fullIds = ids(full);
console.log("C2 per-word ids:", JSON.stringify(perIds));
console.log("C2 full ids    :", JSON.stringify(fullIds));
const n = perWord.length;
const expected = 1 + perIds.reduce((s, x) => s + x.length, 0) + (n - 1) + 1; // patch formula
const actual = fullIds.length; // one predicted duration per input token (StyleTTS2 duration head)
console.log(`C2 patch expects ${expected}, full sequence has ${actual}, delta ${actual - expected}, guard |delta|<=3 -> ${Math.abs(actual - expected) <= 3 ? "pass" : "THROW (no table)"}`);
for (const k of [1, 2, 6, 20]) {
  console.log(`C2 n=${k}: overcount = ${2 * k} tokens -> ${2 * k <= 3 ? "guard passes, then summation consumes wrong bins" : "guard throws, wordTimestamps=null"}`);
}
