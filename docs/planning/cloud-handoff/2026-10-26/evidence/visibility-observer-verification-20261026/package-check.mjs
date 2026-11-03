import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const root = 'C:/Projects/Blurby/.worktrees/visibility-observer-verification-20261026';
const artifacts = 'C:/Projects/Blurby-artifacts/visibility-observer-verification-20261026';
const { Session, hashLive, sleep } = await import(pathToFileURL(root + '/scripts/ui-sweep/sweep.mjs'));
const label = process.argv[2];
const exe = process.argv[3];
const isCandidate = label.startsWith('candidate');
const port = isCandidate ? 9436 : 9437;
const profile = path.join(artifacts, label + '-profile');
assert(!fs.existsSync(profile), 'fresh owned profile required');
const data = path.join(profile, 'blurby-data');
fs.mkdirSync(path.join(data, 'covers'), { recursive: true });
const content = Array.from({ length: 91 }, (_, i) => `ownedword${i + 1}`).join(' ');
const require = createRequire(path.join(root,'package.json'));
const { buildEpubZip, validateEpub } = require('./main/epub-converter.js');
const fixtureFile = path.join(data,'owned91.epub');
await buildEpubZip({outputPath:fixtureFile,title:'Owned91',author:'Owned fixture',chapters:[{title:'Owned91',xhtml:'<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Owned91</title></head><body><p>'+content+'</p></body></html>'}]});
assert((await validateEpub(fixtureFile)).valid);
const doc = (id, position, archived = false) => ({id, title:id, content, filepath:fixtureFile, position,
  wordCount:91, archived, source:'manual', ext:'.epub', created:Date.now(), unread:false});
const fixture = {schemaVersion:6, docs:[doc('owned-complete',91),doc('owned-archive',91,true),doc('owned-control',3)]};
fs.writeFileSync(path.join(data,'library.json'),JSON.stringify(fixture));
fs.writeFileSync(path.join(data,'settings.json'),JSON.stringify({schemaVersion:13,firstRunCompleted:true,
  sourceFolder:null,recentFolders:[],folderName:'Owned visibility fixtures',viewMode:'grid',
  theme:'dark',einkMode:false,readingMode:'page',lastReadingMode:'page'}));
const live = path.join(process.env.APPDATA,'blurby','blurby-data');
const before = hashLive(live);
const result = {label,exe,profile,sourceCommit:isCandidate?'aa5f1485eb023ca232b5a8f8234ad6fdea51f2bb':'36ac7466749688c9ba5e17de841224fab08d7bae',before,steps:[]};
const s = new Session({exe,profile,artifacts,port,liveProfile:live});
let actualProcess;
Object.defineProperty(s,'proc',{get(){return actualProcess;},set(p){actualProcess=p;
  p.stdout.on('data',d=>fs.appendFileSync(path.join(artifacts,label+'-stdout.log'),d));
  p.stderr.on('data',d=>fs.appendFileSync(path.join(artifacts,label+'-stderr.log'),d));}});
async function mainEval(expression) {
  const targets = await (await fetch(`http://127.0.0.1:${port+1000}/json/list`)).json();
  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
  const value = await new Promise((resolve,reject)=>{ws.onmessage=m=>{const d=JSON.parse(m.data);
    if(d.id===1){if(d.error||d.result.exceptionDetails)reject(d.error||d.result.exceptionDetails);else resolve(d.result.result.value);}};
    ws.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression,returnByValue:true}}));});
  ws.close();return value;
}
async function waitFor(expr, timeout=15000){const t=Date.now();while(Date.now()-t<timeout){if(await s.cdp.eval(expr))return;await sleep(100);}throw new Error('Timed out: '+expr);}
const ids = () => s.cdp.eval(`Array.from(document.querySelectorAll('[data-doc-id]')).map(e=>e.dataset.docId).sort()`);
async function button(prefix){await s.cdp.eval(`(()=>{const b=Array.from(document.querySelectorAll('.library-tabs-row button')).find(e=>e.textContent.toLowerCase().startsWith(${JSON.stringify(prefix)}));if(!b)throw Error('missing filter');b.click();return true;})()`);await sleep(150);}
const ownedWordsExpr = `(()=>{const v=document.querySelector('foliate-view');return [...new Set((v?.renderer?.getContents?.()??[]).flatMap(c=>c.doc.body.textContent.match(/ownedword[0-9]+/g)??[]))];})()`;
async function shot(name){await s.screenshot(path.join(artifacts,label+'-'+name+'.png'));}
try {
  const started=Date.now();await s.start();
  result.identity=await mainEval(`({userData:process.mainModule.require('electron').app.getPath('userData'),exe:process.execPath,pid:process.pid,arch:process.arch,packaged:process.mainModule.require('electron').app.isPackaged})`);
  assert.equal(path.resolve(result.identity.userData).toLowerCase(),path.resolve(profile).toLowerCase());
  assert.equal(path.resolve(result.identity.exe).toLowerCase(),path.resolve(exe).toLowerCase());
  assert.equal(result.identity.arch,'arm64');assert.equal(result.identity.packaged,true);
  assert.deepEqual(hashLive(live),before);
  await waitFor(`!!document.querySelector('.library-header')`);
  const initial=await ids();result.steps.push({check:'initial-grid-all',ids:initial});await shot('grid-all');
  if(!isCandidate){
    assert.deepEqual(initial,['owned-control']);
    await button('archived');const archived=await ids();assert.deepEqual(archived,[]);
    result.steps.push({check:'baseline-archive-missing',ids:archived});await shot('archive-missing');
    result.detector='FAILED expected visibility criteria: completed All and Archive cards missing; incomplete positive control present';
    await button('all (');
    await s.cdp.eval(`document.querySelector('[data-doc-id="owned-control"]').click()`);
    await waitFor(`!!document.querySelector('.rm-page-root')`);await waitFor(`(${ownedWordsExpr}).length===91`);await shot('control-reader');
    result.steps.push({check:'baseline-incomplete-card-opens-identical91word-EPUB',words:await s.cdp.eval(ownedWordsExpr)});
    await s.key('Escape');await waitFor(`!!document.querySelector('.library-header')`);
  }else{
    assert.deepEqual(initial,['owned-complete','owned-control']);
    const state=await s.cdp.eval('window.electronAPI.getState()');
    assert.deepEqual(state.library.map(d=>({id:d.id,position:d.position,wordCount:d.wordCount,archived:d.archived})),fixture.docs.map(d=>({id:d.id,position:d.position,wordCount:d.wordCount,archived:d.archived})));
    result.steps.push({check:'render-does-not-change-progress-or-archive',passed:true});
    await button('archived');assert.deepEqual(await ids(),['owned-archive']);await shot('grid-archive');
    await s.cdp.eval(`document.querySelector('button[aria-label="List view"]').click()`);
    await waitFor(`!!document.querySelector('.doc-list')`);assert.deepEqual(await ids(),['owned-archive']);await shot('list-archive');
    await button('all (');assert.deepEqual(await ids(),['owned-complete','owned-control']);
    await s.cdp.eval(`document.querySelector('[data-doc-id="owned-complete"]').click()`);
    await waitFor(`!!document.querySelector('.rm-page-root')`);
    await waitFor(`(${ownedWordsExpr}).length===91`);await shot('reader');
    result.steps.push({check:'completed-card-opens-owned91-word-text',words:await s.cdp.eval(ownedWordsExpr)});
    await s.key('Escape');await waitFor(`!!document.querySelector('.library-header')`);await sleep(300);
    // Existing completion policy may archive this read on exit; this fix preserves that policy.
    const afterExit=await s.cdp.eval('window.electronAPI.getState()');
    const complete=afterExit.library.find(d=>d.id==='owned-complete');
    if(complete.archived)await button('archived');
    assert.equal((await ids()).filter(id=>id==='owned-complete').length,1);
    result.steps.push({check:'return-to-library-visible-in-correct-status',record:{id:complete.id,position:complete.position,wordCount:complete.wordCount,archived:complete.archived},ids:await ids()});await shot('after-return');
    await s.cdp.eval(`document.querySelector('[data-doc-id="owned-complete"]').click()`);
    await waitFor(`!!document.querySelector('.rm-page-root')`);await waitFor(`(${ownedWordsExpr}).length===91`);
    result.steps.push({check:'reopen-owned91-word-text',words:await s.cdp.eval(ownedWordsExpr)});await shot('reader-reopen');
    await s.key('Escape');await waitFor(`!!document.querySelector('.library-header')`);
  }
  await sleep(Math.max(0,26000-(Date.now()-started)));
  assert.equal(s.proc.exitCode,null);result.aliveAtMs=Date.now()-started;
  result.rendererErrors=s.errors;assert.deepEqual(s.errors,[]);
  const errorLog=path.join(data,'error.log');result.errorLog=fs.existsSync(errorLog)?fs.readFileSync(errorLog,'utf8'):null;
  result.dumpFiles=fs.readdirSync(profile,{recursive:true}).filter(x=>/\.dmp$/i.test(x));assert.deepEqual(result.dumpFiles,[]);
  assert(!result.errorLog,'unexpected error.log');
  result.after=hashLive(live);assert.deepEqual(result.after,before);
  result.fixtureAfter=JSON.parse(fs.readFileSync(path.join(data,'library.json'),'utf8'));
  result.passed=true;
}catch(error){result.passed=false;result.failure=error.stack||String(error);try{result.domOnFailure=await s.cdp.eval(`({body:document.body.innerText.slice(-1500),view:!!document.querySelector('foliate-view'),contents:document.querySelector('foliate-view')?.renderer?.getContents?.().map(c=>({text:c.doc.body.textContent.slice(0,200),url:c.doc.URL})),words:${ownedWordsExpr}})`);await shot('failed');}catch{}process.exitCode=1;}
finally{await s.stop();result.afterStop=hashLive(live);if(JSON.stringify(result.afterStop)!==JSON.stringify(before)){result.passed=false;result.liveHashFailure=true;process.exitCode=1;}
  fs.writeFileSync(path.join(artifacts,label+'-package-result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({label:result.label,passed:result.passed,identity:result.identity,steps:result.steps.map(x=>({check:x.check,passed:x.passed,wordCount:x.words?.length,ids:x.ids,record:x.record})),aliveAtMs:result.aliveAtMs,errorLogLines:result.errorLog?.split('\n').filter(Boolean).length,rendererErrors:result.rendererErrors,dumpFiles:result.dumpFiles,failure:result.failure,liveUnchanged:JSON.stringify(result.afterStop)===JSON.stringify(before)},null,2));}
