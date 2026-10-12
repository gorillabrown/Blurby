// Independent check: original model outputs; exposed-duration copy: sum(frames)*hop vs PCM length at several speeds.
const { createRequire } = require("module");
const path = require("path");
const kokoroPath = "C:/Projects/Blurby/node_modules/kokoro-js/dist/kokoro.cjs";
const req = createRequire(kokoroPath);
globalThis.fetch = async (u) => { throw new Error("NETWORK BLOCKED " + u); };
const tf = req("@huggingface/transformers");
const ort = req("onnxruntime-node");
const F2 = process.argv[2];
Object.assign(tf.env, { allowRemoteModels: false, allowLocalModels: true, localModelPath: path.join(F2, "models") + "/", useFSCache: false });
const { KokoroTTS } = require(kokoroPath);
(async () => {
  const orig = await ort.InferenceSession.create(path.join(F2, "models/onnx-community/Kokoro-82M-v1.0-ONNX/onnx/model_q4.onnx"));
  console.log("original outputs", orig.outputNames);
  const tts = await KokoroTTS.from_pretrained("local/kokoro-dur", { dtype: "q4", device: "cpu" });
  for (const text of ["Hello world.", "Marcus wrote these notes in Greek, 1,867 years ago."]) for (const speed of [0.8, 1.0, 1.4, 2.0]) {
    const a = await tts.generate(text, { voice: "af_bella", speed });
    const d = a._durations ? Array.from(a._durations, Number) : null;
    const sum = d && d.reduce((x, y) => x + y, 0);
    console.log(JSON.stringify({ text: text.slice(0, 12), speed, keys: Object.keys(a), pcm: a.audio.length, frames: d && d.length, sum, ratio: sum && a.audio.length / sum }));
  }
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
