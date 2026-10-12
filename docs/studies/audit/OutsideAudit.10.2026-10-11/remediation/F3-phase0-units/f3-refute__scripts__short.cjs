const path=require("path"); const W=process.argv[2]; const kd="C:/Projects/Blurby/node_modules/kokoro-js/dist";
const tf=require(require.resolve("@huggingface/transformers",{paths:[kd]}));
Object.assign(tf.env,{allowRemoteModels:false,allowLocalModels:true,localModelPath:path.join(W,"models")+"/",cacheDir:path.join(W,"out","tfcache"),useFSCache:false});
const {KokoroTTS}=require(path.join(kd,"kokoro.cjs")); const now=()=>Number(process.hrtime.bigint())/1e6;
(async()=>{const t=await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX",{dtype:"q4",device:"cpu"}); await t.generate("Hello.",{voice:"af_bella"});
const out=[]; for (const text of ["From my mother.","From my mother, piety and beneficence."]) for (const speed of [1.0,2.0]) for(let k=0;k<3;k++){const t0=now(); const a=await t.generate(text,{voice:"af_bella",speed}); out.push({words:text.split(" ").length,speed,ms:Math.round(now()-t0),audioMs:Math.round(a.audio.length/24)});}
console.log(JSON.stringify(out));})();
