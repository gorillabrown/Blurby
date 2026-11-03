"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict"),Module=require("node:module"),{createRequire}=Module,crypto=require("node:crypto");
const root="C:/Projects/Blurby",req=createRequire(path.join(root,"package.json"));
const {JSDOM}=req("jsdom"),esbuild=req("esbuild"),React=req("react"),{createRoot}=req("react-dom/client"),{act}=React;
const dom=new JSDOM("<html><body></body></html>",{url:"http://localhost"});
global.window=dom.window;global.document=dom.window.document;global.HTMLElement=dom.window.HTMLElement;
global.IS_REACT_ACT_ENVIRONMENT=true;
const compile=file=>{const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));m._compile(esbuild.transformSync(fs.readFileSync(file,"utf8"),{loader:"ts",format:"cjs",target:"node22"}).code,file);return m.exports;};
const originalLoad=Module._load;let constants;
Module._load=function(request,parent,isMain){if(request==="../constants"&&parent.filename.endsWith("useLibrary.ts"))return constants||(constants=compile(path.join(root,"src/constants.ts")));return originalLoad.call(this,request,parent,isMain);};
let resolveSwitch;const initial={library:[{id:"old-A",source:"folder",filepath:"C:/owned-A/a.epub"}],settings:{sourceFolder:"C:/owned-A",recentFolders:["C:/owned-A","C:/owned-B"]}};
let persisted=initial,update;
window.electronAPI={getState:async()=>persisted,getPlatform:async()=>"win32",onLibraryUpdated:f=>{update=f;return()=>{};},switchFolder:()=>new Promise(r=>resolveSwitch=r)};
const useLibrary=compile(path.join(root,"src/hooks/useLibrary.ts")).default;let current;
function Harness(){current=useLibrary();return null;}
const snapshots=[],snap=label=>snapshots.push({label,sourceFolder:current.settings.sourceFolder,ids:current.library.map(x=>x.id),loadingContent:current.loadingContent});
(async()=>{
 const node=document.createElement("div"),rt=createRoot(node);
 await act(async()=>rt.render(React.createElement(Harness)));snap("initial");
 let pending;await act(async()=>{pending=current.switchFolder("C:/owned-B");});snap("switch-pending");
 assert.equal(current.settings.sourceFolder,"C:/owned-B");assert.deepEqual(current.library.map(x=>x.id),["old-A"]);assert.equal(current.loadingContent,false);
 persisted={library:[{id:"new-B",source:"folder",filepath:"C:/owned-B/b.epub"}],settings:{sourceFolder:"C:/owned-B",recentFolders:["C:/owned-B","C:/owned-A"]}};
 await act(async()=>{resolveSwitch({folder:"C:/owned-B"});await pending;});snap("switch-completed");
 assert.deepEqual(current.library.map(x=>x.id),["new-B"]);
 await act(async()=>rt.unmount());Module._load=originalLoad;
 const result={at:new Date().toISOString(),productionHook:"src/hooks/useLibrary.ts",sourceSHA256:crypto.createHash("sha256").update(fs.readFileSync(path.join(root,"src/hooks/useLibrary.ts"))).digest("hex"),productionHookUnmodified:true,environment:"Node + JSDOM + actual React state/effects",mockedInfrastructure:"electron API promise/data feed only; constants transpiled from real source",snapshots,assertionsPassed:true};
 fs.writeFileSync(path.join(__dirname,"folder-hook-probe-result.json"),JSON.stringify(result,null,2));console.log(JSON.stringify({passed:true,snapshots}));dom.window.close();
})().catch(e=>{Module._load=originalLoad;console.error(e);process.exitCode=1;});

