const ort = require("C:/Projects/Blurby/node_modules/onnxruntime-node");
(async () => {
  const s = await ort.InferenceSession.create(process.argv[2]);
  console.log(JSON.stringify({ inputNames: s.inputNames, outputNames: s.outputNames }));
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
