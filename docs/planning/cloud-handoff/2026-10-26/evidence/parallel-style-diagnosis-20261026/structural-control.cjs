const fs=require('node:fs');const vm=require('node:vm');const {createRequire}=require('node:module');
const root='C:/Projects/Blurby/.worktrees/visibility-observer-verification-20261026';const req=createRequire(root+'/package.json');const {JSDOM}=req('jsdom');
const source=fs.readFileSync(root+'/node_modules/foliate-js/paginator.js','utf8');
const helper=source.slice(source.indexOf('const setStylesImportant ='),source.indexOf('class View {'));
const cls=source.slice(source.indexOf('class View {'),source.indexOf('// NOTE: everything here assumes'));
const dom=new JSDOM('<!doctype html><html><body></body></html>');
const ctx={document:dom.window.document,ResizeObserver:class{observe(){}unobserve(){}disconnect(){}},console};vm.createContext(ctx);vm.runInContext(helper+cls+';globalThis.View=View',ctx);
const view=new ctx.View({container:dom.window.document.body,onExpand(){}});dom.window.document.body.append(view.element);
const layout={flow:'scrolled',margin:0,gap:0,columnWidth:600,width:800,height:600};const results=[];
function run(name){try{view.render(layout);results.push({name,error:null,document:!!view.document,body:!!view.document?.body})}catch(e){results.push({name,error:e.message,stack:e.stack,document:!!view.document,body:!!view.document?.body,documentElement:!!view.document?.documentElement})}}
run('valid-document-opposite-control');const body=view.document.body;body.remove();run('retained-document-null-body-positive-failure');view.document.documentElement.append(body);run('restored-body-opposite-control');view.element.remove();run('jsdom-detached-iframe-control');
fs.writeFileSync('C:/Projects/Blurby-artifacts/parallel-style-diagnosis-20261026/structural-control.json',JSON.stringify({limitations:'Actual installed View/helper source evaluated unchanged; jsdom native Document; inert ResizeObserver construction substitute does not reproduce Chromium timing or prove host-detachment causality.',results},null,2));console.log(JSON.stringify(results));
