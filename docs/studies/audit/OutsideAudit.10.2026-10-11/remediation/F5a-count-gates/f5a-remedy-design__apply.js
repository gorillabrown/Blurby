// usage: node apply.js base.js out.js variant  (variants: spec|multiline|renamed|halfwired|doublesave)
const fs=require('fs');const [,,src,out,v]=process.argv;
let L=fs.readFileSync(src,'utf8').split('\n');
const at=(n,t)=>{if(L[n-1].trim()!==t)throw new Error(`line ${n}: ${L[n-1]}`)};
at(814,'Object.assign(settings, settingsResult.data);');at(815,'ctx.saveSettings();');
at(1058,'const settings = ctx.getSettings();');at(1059,'Object.assign(settings, cloudSettings);');at(1060,'ctx.saveSettings();');
const ind=s=>s.match(/^\s*/)[0];
// bottom-up so line numbers stay valid
L.splice(1138,0,'  applyCloudSettings,'); // after mergeSettings export (line 1138)
if(v!=='halfwired') L.splice(1057,3,ind(L[1058])+'applyCloudSettings(ctx, cloudSettings);');
if(v==='doublesave') L.splice(813,1,ind(L[813])+'applyCloudSettings(ctx, settingsResult.data);');
else L.splice(813,2,ind(L[813])+'applyCloudSettings(ctx, settingsResult.data);');
const ms=L.findIndex(l=>/^function mergeSettings\(/.test(l));
let end=ms;while(L[end]!=='}')end++;
const helper={spec:['function applyCloudSettings(ctx, data) { const settings = ctx.getSettings(); Object.assign(settings, data); normalizeReaderModes(settings); ctx.saveSettings(); return settings; }'],
 multiline:['function applyCloudSettings(ctx, data) {','  const settings = ctx.getSettings();','  Object.assign(settings, data);','  normalizeReaderModes(settings);','  ctx.saveSettings();','  return settings;','}'],
 renamed:['function applyCloudSettings(c, data) { const s = c.getSettings(); Object.assign(s, data); normalizeReaderModes(s); c.saveSettings(); return s; }']};
const h=helper[v]||helper.spec;
L.splice(end+1,0,'',...h);
L.splice(0,0,'const { normalizeReaderModes } = require("./migrations");');
fs.writeFileSync(out,L.join('\n'));
