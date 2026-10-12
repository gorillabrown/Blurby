import fs from "fs";
const { PreTrainedTokenizer } = await import("file:///C:/Projects/Blurby/node_modules/@huggingface/transformers/dist/transformers.node.mjs");
const dir = process.argv[2];
const tj = JSON.parse(fs.readFileSync(dir + "/tokenizer.json", "utf8"));
const tc = JSON.parse(fs.readFileSync(dir + "/tokenizer_config.json", "utf8"));
const tok = new PreTrainedTokenizer(tj, tc);
const len = (s) => { const { input_ids } = tok(s, { truncation: true }); return { len: input_ids.dims.at(-1), ids: Array.from(input_ids.data, Number) }; };
const words = ["ðə", "kwˈɪk", "bɹˈaʊn"];
const per = words.map((w) => ({ w, chars: [...w].length, ...len(w) }));
const full = len(words.join(" "));
const n = words.length;
const sumPer = per.reduce((a, b) => a + b.len, 0);
const expected = 1 + sumPer + (n - 1) + 1; // patch formula (_alignWordsToTimestamps)
console.log(JSON.stringify({ per, full: { chars: [...words.join(" ")].length, len: full.len, ids: full.ids }, patchExpected: expected, actualIfDurationsMatchInputIds: full.len, delta: full.len - expected }));
