"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),fsp=require("node:fs/promises"),path=require("node:path"),crypto=require("node:crypto"),Module=require("node:module");
const root="C:/Projects/Blurby",owned=path.resolve(__dirname),runId=String(Date.now())+"-"+process.pid,data=path.join(owned,"queue-fixture-"+runId,"blurby-data"),sentinel=path.join(owned,"other-profile-"+runId,"blurby-data");
const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const live=path.join(process.env.APPDATA,"blurby","blurby-data");
const readHashes=()=>Object.fromEntries(["library.json","settings.json","sync-queue.json"].map(n=>[n,sha(path.join(live,n))]));
const originals={load:Module._load,writeFile:fsp.writeFile,rename:fsp.rename};
const within=p=>{const rel=path.relative(owned,path.resolve(String(p)));return rel!==""&&!rel.startsWith(".."+path.sep)&&rel!==".."&&!path.isAbsolute(rel);};
const events=[];
(async()=>{
 const liveBefore=readHashes();for(const p of [data,sentinel])await fsp.mkdir(p,{recursive:true});
 const settings={theme:"light"},library={docs:[]};
 for(const d of [data,sentinel])for(const [n,value]of[["settings.json",settings],["library.json",library],["sync-queue.json",[]]]){const p=path.join(d,n);assert.ok(!fs.existsSync(p),"Preserve an existing probe fixture");await fsp.writeFile(p,JSON.stringify(value,null,2));}
 const profileHashes=d=>Object.fromEntries(["library.json","settings.json","sync-queue.json"].map(n=>[n,sha(path.join(d,n))]));
 const before=profileHashes(data),sentinelBefore=profileHashes(sentinel);
 fsp.writeFile=async function(p,...args){assert.ok(within(p),"Refused write outside artifact directory");events.push({kind:"writeFile",pid:process.pid,path:path.resolve(String(p)),at:new Date().toISOString(),stack:new Error().stack.split("\n").slice(2,7)});return originals.writeFile.call(this,p,...args);};
 fsp.rename=async function(a,b,...args){assert.ok(within(a)&&within(b),"Refused rename outside artifact directory");events.push({kind:"rename",pid:process.pid,path:path.resolve(String(b)),at:new Date().toISOString()});return originals.rename.call(this,a,b,...args);};
 const queue=require(path.join(root,"main/sync-queue.js")),store=require(path.join(root,"main/json-store.js"));
 await queue.initSyncQueue(data,"owned-probe-device");
 assert.equal(events.length,0,"init loads the queue without writing it");
 const handlers=new Map();
 Module._load=function(request,parent,isMain){
  if(request==="electron")return {ipcMain:{handle:(k,f)=>handlers.set(k,f)}};
  if(request==="../window-manager")return {getSystemTheme:()=> "light",updateWindowTheme:()=>{}};
  if(request==="../sync-engine")return {getSyncStatus:()=>({revision:0})};
  return originals.load.call(this,request,parent,isMain);
 };
 const state=require(path.join(root,"main/ipc/state.js"));
 state.register({getSettings:()=>settings,getLibrary:()=>[],getMainWindow:()=>null,saveSettings:()=>store.writeJSON(path.join(data,"settings.json"),settings)});
 const noCall=profileHashes(data);assert.deepEqual(noCall,before);assert.equal(events.length,0);
 handlers.get("save-settings")({}, {theme:"light"});await state.flushPendingSettingsSave();await store.whenWritesSettled();
 const afterNoop=profileHashes(data),q=JSON.parse(fs.readFileSync(path.join(data,"sync-queue.json"),"utf8"));
 assert.equal(afterNoop["library.json"],before["library.json"]);assert.equal(afterNoop["settings.json"],before["settings.json"]);assert.notEqual(afterNoop["sync-queue.json"],before["sync-queue.json"]);
 assert.equal(q.length,1);assert.equal(q[0].op,"update-settings");assert.equal(q[0].revision,0);
 const firstEvents=events.slice();
 handlers.get("save-settings")({}, {theme:"dark"});await state.flushPendingSettingsSave();await store.whenWritesSettled();
 const afterChange=profileHashes(data);assert.notEqual(afterChange["settings.json"],before["settings.json"]);
 assert.deepEqual(profileHashes(sentinel),sentinelBefore);assert.ok(events.every(e=>e.path.startsWith(data+path.sep)));assert.deepEqual(readHashes(),liveBefore);
 const result={at:new Date().toISOString(),pid:process.pid,productionModules:["main/ipc/state.js","main/sync-queue.js","main/json-store.js"],sourceHashes:Object.fromEntries(["main/ipc/state.js","main/sync-queue.js","main/json-store.js"].map(n=>[n,sha(path.join(root,n))])),mockedInfrastructure:["electron IPC registration","window theme side effect","sync-engine status revision0"],actualWrites:true,writeGuardRoot:owned,actualTarget:data,noCallControl:{hashesUnchanged:true,writes:0},noopSettingsControl:{libraryContentUnchanged:true,settingsContentUnchanged:true,queueContentChanged:true,queueOps:q.map(x=>({op:x.op,revision:x.revision,timestamp:x.timestamp})),writes:firstEvents},changedSettingsControl:{settingsContentChanged:true},otherProfileUnchanged:true,normalProfileHashesUnchanged:true,allWrites:events,assertionsPassed:true};
 fsp.writeFile=originals.writeFile;fsp.rename=originals.rename;Module._load=originals.load;
 fs.writeFileSync(path.join(owned,"queue-path-probe-result.json"),JSON.stringify(result,null,2));console.log(JSON.stringify({passed:true,actualTarget:data,noopSettingsQueueChanged:true,sameSettingsHash:true,differentSettingsControlChanged:true,otherAndNormalProfilesUnchanged:true,writes:events.length}));
})().catch(e=>{fsp.writeFile=originals.writeFile;fsp.rename=originals.rename;Module._load=originals.load;console.error(e);process.exitCode=1;});

