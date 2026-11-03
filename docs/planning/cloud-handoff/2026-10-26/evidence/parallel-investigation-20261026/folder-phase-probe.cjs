"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root="C:/Projects/Blurby",out=__dirname;
const {createFolderSync}=require(path.join(root,"main/folder-sync.js"));
const C=require(path.join(root,"main/constants.js"));
const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve};};
const settle=()=>new Promise(r=>setImmediate(r));
function harness(){
 const events=[],state={folder:path.join(out,"A"),lib:[],clock:0};
 const emit=(event,extra={})=>events.push({at:state.clock,event,...extra});
 const deps={
  getSourceFolder:()=>state.folder,getLibrary:()=>state.lib,setLibrary:lib=>{state.lib=lib;emit("prune",{ids:lib.map(x=>x.id)});},
  addDoc:d=>{state.lib.unshift(d);emit("add",{id:d.id});},
  scanFolderAsync:async folder=>{emit("scan",{folder:path.basename(folder)});return[];},
  rootHasContent:async()=>true,statFile:async()=>({isDirectory:()=>false}),
  extractNewFileDoc:async file=>({id:path.basename(file.filepath),filepath:file.filepath,source:"folder"}),
  extractContent:async()=>"",countWords:()=>0,isFailed:()=>false,
  saveLibrary:()=>emit("save-debounced"),saveLibraryNow:async()=>emit("save-now",{ids:state.lib.map(x=>x.id)}),
  broadcastLibrary:()=>emit("broadcast-request",{ids:state.lib.map(x=>x.id)}),
  emitProgress:(current,total,phase)=>emit("progress",{current,total,phase}),
  now:()=>state.clock,reportFolderProblem:()=>{},reportFolderOk:()=>{}
 };return {events,state,deps,emit,create:()=>createFolderSync(deps)};
}
async function cancellation(hung){
 const h=harness(),gate=deferred();let count=0,timer;
 h.deps.scanFolderAsync=folder=>{h.emit("scan",{folder:path.basename(folder)});return ++count===1?gate.promise:Promise.resolve([]);};
 const sync=h.create(),old=sync.syncAll();await settle();h.state.folder=path.join(out,"B");
 const origSet=global.setTimeout,origClear=global.clearTimeout;
 global.setTimeout=(fn,ms)=>{assert.equal(ms,C.FOLDER_LIST_TIMEOUT_MS);timer={fn,ms};return timer;};
 global.clearTimeout=()=>{};
 let next;try{
  next=sync.syncAll();await settle();assert.equal(count,1);
  if(hung){
   h.state.clock=C.FOLDER_LIST_TIMEOUT_MS-1;await settle();assert.equal(count,1);
   h.state.clock=C.FOLDER_LIST_TIMEOUT_MS;timer.fn();await next;assert.equal(count,2);
  }else{gate.resolve([]);await Promise.all([old,next]);assert.equal(count,2);assert.equal(h.state.clock,0);}
 }finally{global.setTimeout=origSet;global.clearTimeout=origClear;gate.resolve([]);await old;}
 return {condition:hung?"hung-old-scan":"old-scan-settles",events:h.events,newScanAt:h.events.filter(e=>e.event==="scan")[1].at};
}
async function delayedBroadcast(slow){
 const h=harness(),first=deferred(),last=deferred(),A=h.state.folder,B=path.join(out,"B");
 h.state.lib=[{id:"old-A",filepath:path.join(A,"old.epub"),source:"folder"},{id:"manual",source:"manual"}];
 h.state.folder=B;let calls=0;
 h.deps.scanFolderAsync=async()=>Array.from({length:slow?C.FOLDER_SYNC_BATCH_SIZE+1:1},(_,i)=>({filepath:path.join(B,"B"+i+".epub")}));
 h.deps.extractNewFileDoc=async file=>{const n=++calls;await(n<=C.FOLDER_SYNC_BATCH_SIZE?first.promise:last.promise);return{id:path.basename(file.filepath),filepath:file.filepath,source:"folder"};};
 const sync=h.create(),promise=sync.syncAll();await settle();h.state.clock=100;first.resolve();await settle();await settle();
 if(slow){
  assert.equal(h.state.lib.length,C.FOLDER_SYNC_BATCH_SIZE+2);
  assert.equal(h.events.filter(e=>e.event==="broadcast-request").length,0);
  h.state.clock=C.FOLDER_SYNC_SAVE_INTERVAL_MS+100;last.resolve();
 }
 await promise;
 const broadcasts=h.events.filter(e=>e.event==="broadcast-request");assert.ok(broadcasts.length>0);
 assert.equal(broadcasts[0].at,slow?C.FOLDER_SYNC_SAVE_INTERVAL_MS+100:100);
 assert.ok(!h.state.lib.some(d=>d.id==="old-A"));assert.ok(h.state.lib.some(d=>d.id==="manual"));
 return{condition:slow?"slow-final-batch":"fast-one-file-control",events:h.events,firstBroadcastAt: broadcasts[0].at};
}
(async()=>{
 const result={at:new Date().toISOString(),pid:process.pid,sourcePath:"main/folder-sync.js",sourceSHA256:sha(path.join(root,"main/folder-sync.js")),constants:{batch:C.FOLDER_SYNC_BATCH_SIZE,cancelWait:C.FOLDER_LIST_TIMEOUT_MS,saveInterval:C.FOLDER_SYNC_SAVE_INTERVAL_MS},virtualTime:true,productionModuleUnmodified:true,results:[]};
 result.results.push(await cancellation(true),await cancellation(false),await delayedBroadcast(true),await delayedBroadcast(false));
 result.assertionsPassed=true;fs.writeFileSync(path.join(out,"folder-phase-probe-result.json"),JSON.stringify(result,null,2));
 console.log(JSON.stringify({passed:true,cases:result.results.map(r=>({condition:r.condition,newScanAt:r.newScanAt,firstBroadcastAt:r.firstBroadcastAt}))}));
})().catch(e=>{console.error(e);process.exitCode=1;});

