// Evaluate main.js's real writeJSON (55-60) and saveSettingsFn (130) text against a deferred fake fs.
const fs = require("fs");
const lines = fs.readFileSync(process.argv[2], "utf8").split(/\r?\n/);
const src = lines.slice(54, 60).join("\n") + "\n" + lines[129] + "\n";
console.log("--- evaluated source ---\n" + src);
const events = [];
let release, fail;
const fsPromises = {
  writeFile: (p, data) => { events.push("write-start:" + data.length); return new Promise((res, rej) => { release = () => { events.push("write-done"); res(); }; fail = () => rej(Object.assign(new Error("EPERM fake"), { code: "EPERM" })); }); },
  rename: async () => { events.push("rename-done"); },
};
let settings = { schemaVersion: 13, readingMode: "narrate" };
const getSettingsPath = () => "X/settings.json";
const f = new Function("fsPromises", "getSettingsPath", "getSettings", src + "; return { writeJSON, saveSettingsFn };");
// settings is captured by closure in main.js; emulate by passing via a getter-defined global
globalThis.settings = settings;
const { saveSettingsFn } = f(fsPromises, getSettingsPath);
(async () => {
  const ret = saveSettingsFn();
  console.log("return value:", ret);
  // mutate after call: does the written payload reflect the call-time snapshot?
  settings.readingMode = "MUTATED";
  await ret;
  console.log("after await:", JSON.stringify(events));
  release();
  await new Promise(r => setTimeout(r, 10));
  console.log("after release:", JSON.stringify(events));
  // failure path
  process.on("unhandledRejection", (e) => console.log("UNHANDLED REJECTION observed:", e.code));
  saveSettingsFn(); fail();
  await new Promise(r => setTimeout(r, 10));
})();
