// One offline producer run. argv: repoRoot modelRoot
const path=require("path");const [repo,root]=process.argv.slice(2);
const T=require(path.join(repo,"node_modules/@huggingface/transformers/dist/transformers.node.cjs"));
T.env.allowRemoteModels=false;T.env.cacheDir=root;T.env.localModelPath=root+path.sep;
const {KokoroTTS}=require(path.join(repo,"node_modules/kokoro-js/dist/kokoro.cjs"));
const warns=[];const ow=console.warn;console.warn=(...a)=>{warns.push(a.join(" "));};
(async()=>{
  const ms=()=>Number(process.hrtime.bigint()/1000000n);
  let t=ms();const tts=await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX",{dtype:"q4",device:"cpu"});
  const load=ms()-t; t=ms(); await tts.generate("Hello.",{voice:"af_bella",speed:1}); const hello=ms()-t;
  console.log(`load_ms=${load} hello_warmup_ms=${hello}`);
  const text="The ancient city stood above the river.";const words=text.replace(/[.]/g,"").split(" ");
  for(const sp of [1.0,2.0,1.0]){
    warns.length=0;t=ms();const a=await tts.generate(text,{voice:"af_bella",speed:sp,words});const g=ms()-t;
    const d=a._durations;const sum=d?Array.from(d).reduce((x,y)=>x+Math.max(0,Math.round(y)),0):null;
    console.log(JSON.stringify({speed:sp,gen_ms:g,pcm_samples:(a.audio||a.data).length,sr:a.sampling_rate,durations_len:d?d.length:null,rounded_sum:sum,sum_x256:sum*256,sum_x600:sum*600,wordTimestamps:a.wordTimestamps?a.wordTimestamps.length:null,warn:warns[0]||null}));
  }
  const ids=tts.tokenizer("ðə",{truncation:true}).input_ids;console.log("ids(ðə)=",Array.from(ids.data,Number).join(","));
})().catch(e=>{console.log("ERR",e.message);process.exit(1)});
