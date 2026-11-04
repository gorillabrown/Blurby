import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
const root='C:/Projects/Blurby/.worktrees/visibility-observer-verification-20261026';
const out='C:/Projects/Blurby-artifacts/parallel-style-diagnosis-20261026/precise-continuation-control';
const scriptDir='C:/Projects/Blurby-artifacts/reader-visual-diag-1';
const observerDir='C:/Projects/Blurby-artifacts/foliate-observer-leak-1';
const label=process.argv[2];assert(['session','census','modes'].includes(label));
const port=9456;
const profile=path.join(out,label+'-profile');assert(!fs.existsSync(profile));
const data=path.join(profile,'blurby-data');fs.mkdirSync(path.join(data,'covers'),{recursive:true});
const fixture=path.join(data,'sample-meditations.epub');fs.copyFileSync(path.join(root,'resources/sample-meditations.epub'),fixture);
const require=createRequire(path.join(root,'package.json'));const parser=require('./main/file-parsers.js');
const content=await parser.extractContent(fixture);const wordCount=parser.countWords(content);
fs.writeFileSync(path.join(data,'library.json'),JSON.stringify({schemaVersion:6,docs:[{id:'sample-meditations',title:'Meditations',filepath:fixture,ext:'.epub',wordCount,position:0,created:Date.now(),source:'sample',author:'Marcus Aurelius',archived:false,unread:false}]}));
fs.writeFileSync(path.join(data,'settings.json'),JSON.stringify({schemaVersion:13,firstRunCompleted:true,sourceFolder:null,recentFolders:[],viewMode:'list',theme:'dark',einkMode:false,readingMode:'page',lastReadingMode:'page'}));
const {Session,hashLive,sleep}=await import(pathToFileURL(root+'/scripts/ui-sweep/sweep.mjs'));
const live=path.join(process.env.APPDATA,'blurby','blurby-data');const liveBefore=hashLive(live);
const exe=path.join(root,'release/win-arm64-unpacked/Blurby.exe');
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const script=label==='session'?path.join(scriptDir,'session.mjs'):path.join(out,'diagnostic-modes.mjs');
const errorLog=path.join(data,'error.log');const output=path.join(out,label+'-result.json');
const result={label,sourceCommit:'aa5f1485eb023ca232b5a8f8234ad6fdea51f2bb',exe,profile,fixtureSha256:sha(fixture),fixtureWords:wordCount,script,scriptSha256:sha(script),bandProbeSha256:sha(path.join(scriptDir,'band-probe.js')),roWrapSha256:sha(path.join(scriptDir,'ro-wrap.js')),liveBefore,startedAt:new Date().toISOString()};
const s=new Session({exe,profile,artifacts:out,port,liveProfile:live});let proc;
Object.defineProperty(s,'proc',{get(){return proc;},set(p){proc=p;p.stdout.on('data',d=>fs.appendFileSync(path.join(out,label+'-stdout.log'),d));p.stderr.on('data',d=>fs.appendFileSync(path.join(out,label+'-stderr.log'),d));}});
async function mainProof(){const target=(await(await fetch(`http://127.0.0.1:${port+1000}/json/list`)).json())[0];const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});const proof=await new Promise((r,j)=>{ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id===1){if(d.error||d.result.exceptionDetails)j(d);else r(d.result.result.value);}};ws.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression:`({userData:process.mainModule.require('electron').app.getPath('userData'),exe:process.execPath,pid:process.pid,arch:process.arch,packaged:process.mainModule.require('electron').app.isPackaged})`,returnByValue:true}}));});ws.close();return proof;}
try{
 const started=Date.now();await s.start();s.cdp.on('Runtime.exceptionThrown',p=>fs.appendFileSync(path.join(out,'full-exceptions.jsonl'),JSON.stringify({observedAt:new Date().toISOString(),...p})+'\n'));result.identity=await mainProof();assert.equal(path.resolve(result.identity.userData).toLowerCase(),path.resolve(profile).toLowerCase());assert.equal(path.resolve(result.identity.exe).toLowerCase(),path.resolve(exe).toLowerCase());assert.equal(result.identity.arch,'arm64');assert.equal(result.identity.packaged,true);assert.deepEqual(hashLive(live),liveBefore);
 for(let i=0;i<100&&!await s.cdp.eval(`!!document.querySelector('.doc-card-wrapper .doc-card')`);i++)await sleep(100);
 assert(await s.cdp.eval(`!!document.querySelector('.doc-card-wrapper .doc-card')`));
 await (await import(pathToFileURL(path.join(out,'precise-capture.mjs')))).install(s.cdp,out);result.uninstrumentedBefore=await s.cdp.eval(`!window.__rvd`);assert.equal(result.uninstrumentedBefore,true);
 const args=label==='session'?[script,String(port),errorLog,output]:label==='census'?[script,String(port),output,'--via-focus']:[script,String(port),out];
 const child=spawn(process.execPath,args,{stdio:['ignore','pipe','pipe']});child.stdout.on('data',d=>fs.appendFileSync(path.join(out,label+'-script.log'),d));child.stderr.on('data',d=>fs.appendFileSync(path.join(out,label+'-script-stderr.log'),d));
 result.scriptArgs=args;result.scriptExit=await new Promise(r=>child.on('exit',r));assert.equal(result.scriptExit,0);
 const actualFile=label==='modes'?path.join(out,'dw5-modes.json'):output;result.route=JSON.parse(fs.readFileSync(actualFile,'utf8'));
 if(label==='session'){
  assert.equal(result.route.instrument,false);assert.equal(result.route.minutes,5);assert(await s.cdp.eval(`!window.__rvd`));
  for(const name of ['open-book','page-probe','toc-open','toc-jump','focus','flow','play','pause'])assert.equal(result.route.steps.find(x=>x.name===name)?.data,true,'route action '+name);
  const time=name=>Date.parse(result.route.steps.find(x=>x.name===name).t);
  assert(time('page-probe')-time('open-book')>=15000);assert(time('focus')-time('toc-jump')>=8000);assert(time('flow')-time('focus')>=60000);assert(time('pause')-time('play')>=180000);assert(Date.parse(result.route.finishedAt)-time('pause')>=60000);
  const samples=result.route.flowSamples.map(x=>x.wordIndex).filter(x=>Number.isFinite(x));assert(samples.length>0&&samples.at(-1)>samples[0],'Flow must advance actual words');
 }
 if(label==='census'){
  const invalid=result.route.liveObservers.flatMap(o=>o.targets.filter(t=>!t.connected||(t.el.startsWith('body.')&&t.w===0&&t.h===0)));result.invalidTargets=invalid;
  assert.deepEqual(invalid,[]);
 }
 if(label==='modes')for(const mode of ['Page','Focus','Flow','Narrate']){const m=result.route[mode];assert.equal(m.clicked,true);assert.equal(m.root,'rm-'+mode.toLowerCase()+'-root');assert.equal(m.foliateView,true);assert(m.words>0);}
 result.aliveAtMs=Date.now()-started;assert(s.proc.exitCode===null);assert(result.aliveAtMs>=25000);
 const lines=fs.existsSync(errorLog)?fs.readFileSync(errorLog,'utf8').split(/\r?\n/).filter(Boolean):[];
 result.logCounts={total:lines.length,resizeObserverLoop:lines.filter(x=>x.includes('ResizeObserver loop')).length,destructureStyle:lines.filter(x=>x.includes("Cannot destructure property 'style'")).length};
 result.errorLogSha256=fs.existsSync(errorLog)?sha(errorLog):null;result.errorLog=errorLog;result.capturedCdpEvents=s.errors;
 result.dumpFiles=fs.readdirSync(profile,{recursive:true}).filter(x=>/\.dmp$/i.test(x));assert.deepEqual(result.dumpFiles,[]);
 result.routeQualified=true;result.packageQualified=lines.length===0&&s.errors.length===0;
 if(label==='session')assert.equal(result.logCounts.resizeObserverLoop,0,'observer original full-session gate');
 if(!result.packageQualified)process.exitCode=2;
}catch(error){result.routeQualified=false;result.failure=error.stack||String(error);process.exitCode=1;}
finally{await s.stop();result.liveAfter=hashLive(live);result.liveUnchanged=JSON.stringify(result.liveAfter)===JSON.stringify(liveBefore);if(!result.liveUnchanged)process.exitCode=1;result.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(out,label+'-receipt.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({...result,route:undefined},null,2));}
