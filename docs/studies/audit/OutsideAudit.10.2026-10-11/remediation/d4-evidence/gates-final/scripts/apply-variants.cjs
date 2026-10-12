// Build one scratch tree per variant from the base blobs, applying the Edit-site text of ROADMAP NARRATE-REMOVE-1 verbatim.
// usage: node apply-variants.cjs <baseDir with main.js, main/sync-engine.js, main/ipc/state.js> <treesDir>
const fs = require("fs");
const path = require("path");
const [baseDir, treesDir] = process.argv.slice(2);
const FILES = ["main.js", "main/sync-engine.js", "main/ipc/state.js"];
const base = Object.fromEntries(FILES.map((f) => [f, fs.readFileSync(path.join(baseDir, f), "utf8")]));

// Exact Edit-site strings (ROADMAP.md, Wave B: main.js, main/sync-engine.js, main/ipc/state.js).
const HELPER = "function applyCloudSettings(ctx, data) { const settings = ctx.getSettings(); Object.assign(settings, data); normalizeReaderModes(settings); ctx.saveSettings(); return settings; }";
const SYNC_REQUIRE = 'const { normalizeReaderModes } = require("./migrations");';
const MERGE_CALL = "applyCloudSettings(ctx, settingsResult.data);";
const FORCED_CALL = "applyCloudSettings(ctx, cloudSettings);";
const STATE_REQUIRE = 'const { normalizeReaderModes } = require("../migrations");';
const STATE_NORMALIZE = "normalizeReaderModes(settings); // D12: the settings IPC is an ingress (NARRATE-REBUILD-1 revisits)";

const once = (text, from, to) => {
  const n = text.split(from).length - 1;
  if (n !== 1) throw new Error(`anchor occurs ${n} times: ${JSON.stringify(from)}`);
  return text.replace(from, () => to);
};

function mainJs(t, v) {
  t = once(t, "        settingsMigrations, libraryMigrations, runMigrations } = require(\"./main/migrations\");",
    "        settingsMigrations, libraryMigrations, runMigrations, loadSettingsData } = require(\"./main/migrations\");");
  const save = v.mainNoSave ? "" : "\n  await saveSettingsFn();";
  return once(t, "  settings = runMigrations(rawSettings, settingsMigrations, CURRENT_SETTINGS_SCHEMA);\n  await saveSettingsFn();",
    "  settings = loadSettingsData(rawSettings);" + save);
}

function syncJs(t, v) {
  const name = v.helperName || "applyCloudSettings";
  let helper = HELPER.replace("function applyCloudSettings(", `function ${name}(`);
  if (v.renameLocals) helper = "function applyCloudSettings(c, data) { const s = c.getSettings(); Object.assign(s, data); normalizeReaderModes(s); c.saveSettings(); return s; }";
  t = once(t, 'const syncQueue = require("./sync-queue");\n', 'const syncQueue = require("./sync-queue");\n' + SYNC_REQUIRE + "\n");
  t = once(t, "  return merged;\n}\n\n/**\n * History merge:", `  return merged;\n}\n\n${helper}\n\n/**\n * History merge:`);
  t = once(t, "  mergeSettings,\n  mergeHistory,", `  mergeSettings,\n  ${name},\n  mergeHistory,`);
  // merge/download apply path (base lines 814-815)
  const mergeOld = "      Object.assign(settings, settingsResult.data);\n      ctx.saveSettings();\n";
  if (!v.leaveMerge) t = once(t, mergeOld, "      " + MERGE_CALL.replace("applyCloudSettings(", `${name}(`) + "\n" + (v.leftoverSaveMerge ? "      ctx.saveSettings();\n" : ""));
  // forced-download path (base lines 1058-1060)
  const forcedOld = "        const settings = ctx.getSettings();\n        Object.assign(settings, cloudSettings);\n        ctx.saveSettings();\n";
  if (!v.leaveForced) t = once(t, forcedOld, "        " + FORCED_CALL.replace("applyCloudSettings(", `${name}(`) + "\n" + (v.leftoverSaveForced ? "        ctx.saveSettings();\n" : ""));
  return t;
}

function stateJs(t, v) {
  t = once(t, 'const fsPromises = require("fs/promises");\n', 'const fsPromises = require("fs/promises");\n' + STATE_REQUIRE + "\n");
  if (v.stateMisplaced) // after the theme check instead of directly after the assign
    return once(t, "    if (newSettings.theme !== undefined) updateWindowTheme(ctx.getMainWindow(), settings);\n",
      "    if (newSettings.theme !== undefined) updateWindowTheme(ctx.getMainWindow(), settings);\n    " + STATE_NORMALIZE + "\n");
  return once(t, "    Object.assign(settings, newSettings);\n", "    Object.assign(settings, newSettings);\n    " + STATE_NORMALIZE + "\n");
}

const VARIANTS = {
  "base": null,
  "prescribed": {},
  "wrong-1-renamed-helper": { helperName: "reapplyCloudSettings" }, // a longer name ending in applyCloudSettings (the -w case)
  "wrong-2-unconverted-path": { leaveForced: true },               // forced-download path keeps Object.assign + save
  "wrong-3-leftover-save": { leftoverSaveMerge: true },            // merge path keeps its own ctx.saveSettings()
  "supp-renamed-locals": { renameLocals: true },
  "supp-unconverted-merge-path": { leaveMerge: true },
  "supp-leftover-save-forced": { leftoverSaveForced: true },
  "supp-state-misplaced": { stateMisplaced: true },
  "supp-main-no-save": { mainNoSave: true },
};
for (const [name, v] of Object.entries(VARIANTS)) {
  const dir = path.join(treesDir, name);
  fs.mkdirSync(path.join(dir, "main", "ipc"), { recursive: true });
  const out = v === null ? base : { "main.js": mainJs(base["main.js"], v), "main/sync-engine.js": syncJs(base["main/sync-engine.js"], v), "main/ipc/state.js": stateJs(base["main/ipc/state.js"], v) };
  for (const f of FILES) fs.writeFileSync(path.join(dir, f), out[f]);
}
fs.writeFileSync(path.join(treesDir, "variants.json"), JSON.stringify(VARIANTS, null, 2) + "\n");
console.log("built", Object.keys(VARIANTS).join(", "));
