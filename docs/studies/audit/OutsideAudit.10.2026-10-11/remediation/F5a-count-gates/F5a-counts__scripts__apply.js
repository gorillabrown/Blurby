// Apply ROADMAP.md:472-475 edits literally. argv: file, variant ("oneline"|"multiline")
const fs = require("fs");
const [file, variant] = process.argv.slice(2);
let L = fs.readFileSync(file, "utf8").split("\n");
const must = (i, s) => { if (L[i] !== s) throw new Error(`line ${i+1} mismatch: ${JSON.stringify(L[i])}`); };
// bottom-up so earlier line numbers stay valid
// 1058-1060 -> one call (ROADMAP.md:475)
must(1057, "        const settings = ctx.getSettings();");
must(1058, "        Object.assign(settings, cloudSettings);");
must(1059, "        ctx.saveSettings();");
L.splice(1057, 3, "        applyCloudSettings(ctx, cloudSettings);");
// 814-815 -> one call (ROADMAP.md:474)
must(813, "      Object.assign(settings, settingsResult.data);");
must(814, "      ctx.saveSettings();");
L.splice(813, 2, "      applyCloudSettings(ctx, settingsResult.data);");
// helper after mergeSettings (ends before line 394 'function mergeHistory') (ROADMAP.md:473)
const mh = L.findIndex(l => l.startsWith("function mergeHistory("));
const helper = variant === "oneline"
  ? ["function applyCloudSettings(ctx, data) { const settings = ctx.getSettings(); Object.assign(settings, data); normalizeReaderModes(settings); ctx.saveSettings(); return settings; }", ""]
  : ["function applyCloudSettings(ctx, data) {", "  const settings = ctx.getSettings();", "  Object.assign(settings, data);", "  normalizeReaderModes(settings);", "  ctx.saveSettings();", "  return settings;", "}", ""];
L.splice(mh, 0, ...helper);
// require (ROADMAP.md:472)
const ri = L.findIndex(l => l === 'const syncQueue = require("./sync-queue");');
L.splice(ri + 1, 0, 'const { normalizeReaderModes } = require("./migrations");');
// export next to mergeSettings (ROADMAP.md:473)
const ei = L.findIndex(l => l === "  mergeSettings,");
L.splice(ei + 1, 0, "  applyCloudSettings,");
fs.writeFileSync(file, L.join("\n"));
console.log("applied", variant);
