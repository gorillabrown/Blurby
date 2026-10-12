const fs=require("fs");const p=process.argv[2];
const s=fs.readFileSync(p+"/node_modules/kokoro-js/dist/kokoro.cjs","utf8");
const a=s.indexOf("function computeWordTimestamps("),b=s.indexOf("return timestamps}",a)+18;
const f=new Function(s.slice(a,b)+";return computeWordTimestamps;")();
// "ancient": runtime per-word ids length 10 (8 content + 2 specials); full sequence for one word = same 10 ids
const dur=[4,8,8,8,8,8,8,8,8,4]; // one duration per full-sequence token
try{f(dur,["ancient"],[10],24000,dur.reduce((x,y)=>x+y)*256);console.log("n=1 table produced")}catch(e){console.log("n=1 throws:",e.message)}
try{const t=f(dur,["ancient"],[8],24000,dur.reduce((x,y)=>x+y)*256);console.log("n=1 with specials excluded ->",t.map(w=>w.word+"@"+(w.startTime*1000).toFixed(1)+"-"+(w.endTime*1000).toFixed(1)).join())}catch(e){console.log(e.message)}
