const path = require("path");
const t = require("C:/Projects/Blurby/node_modules/@huggingface/transformers/dist/transformers.node.cjs");
t.env.allowRemoteModels = false;
t.env.localModelPath = path.join(process.argv[2], "model") + path.sep;
t.env.useBrowserCache = false; t.env.useFSCache = false; t.env.cacheDir = path.join(process.argv[2], "nocache");
(async () => {
  const tok = await t.AutoTokenizer.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX");
  for (const s of ["ðə", "kwˈɪk", "ðə kwˈɪk"]) {
    const ids = tok(s, { truncation: true }).input_ids; // same call shape as the patch
    console.log(JSON.stringify({ s, chars: [...s].length, dims: ids.dims, ids: Array.from(ids.data).map(Number) }));
  }
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
