// Judge Done-when 7 wiring gates per tree and shell against the ROADMAP's stated outputs and its dry-run paragraph.
const fs = require("fs");
const read = require("./readres.cjs");
const gates = JSON.parse(fs.readFileSync("out/wiring.gates.json", "utf8"));
const trees = fs.readdirSync("trees").filter((t) => t !== "variants.json");
const shells = ["pwsh7", "ps51", "bash"];
const src = (t, f) => fs.readFileSync(`trees/${t}/${f}`, "utf8").split("\n");
const one = (r, re) => r.exit === 0 && r.err === "" && r.out.length === 1 && re.test(r.out[0]);
// Post-edit stated outputs (Done-when 7 "Wiring" bullets).
const stated = {
  g1: (r) => r.exit === 0 && r.err === "" && JSON.stringify(r.out) === '["main/sync-engine.js:1"]',
  g2: (r) => r.exit === 0 && r.err === "" && JSON.stringify(r.out) === '["main/sync-engine.js:1"]',
  g3: (r) => r.exit === 0 && r.err === "" && JSON.stringify(r.out) === '["main/sync-engine.js:1"]',
  g4: (r) => r.exit === 0 && r.err === "" && JSON.stringify(r.out) === '["main/sync-engine.js:1"]',
  // g5/g7 (-A1/-B1): exactly the match and its neighbour, as the gate text states; no source read is needed.
  g5: (r) => { if (!(r.exit === 0 && r.err === "" && r.out.length === 2)) return false; const m = /^main\.js:(\d+):  settings = loadSettingsData\(rawSettings\);$/.exec(r.out[0]); return !!m && r.out[1] === `main.js-${+m[1] + 1}-  await saveSettingsFn();`; },
  g6: (r) => one(r, /^main\.js:\d+:function saveSettingsFn\(\) \{ writeJSON\(getSettingsPath\(\), settings\); \}$/),
  g7: (r) => { if (!(r.exit === 0 && r.err === "" && r.out.length === 2)) return false; const m = /^main\/ipc\/state\.js:(\d+):    normalizeReaderModes\(settings\);/.exec(r.out[1]); return !!m && r.out[0] === `main/ipc/state.js-${+m[1] - 1}-    Object.assign(settings, newSettings);`; },
};
// Dry-run paragraph, base: sync-engine counts nothing, nothing, :2, :2; state.js gate nothing.
const nothing = (r) => r.exit === 1 && r.err === "" && r.out.length === 0;
const baseStated = { g1: nothing, g2: nothing, g3: (r) => r.exit === 0 && r.err === "" && JSON.stringify(r.out) === '["main/sync-engine.js:2"]', g4: (r) => r.exit === 0 && r.err === "" && JSON.stringify(r.out) === '["main/sync-engine.js:2"]', g7: nothing };
const L = []; let problems = 0;
const fmt = (r) => `exit=${r.exit} stdout=${JSON.stringify(r.out)}${r.err ? " stderr=" + JSON.stringify(r.err) : ""}`;
for (const t of trees) {
  L.push(`== ${t}`);
  const fails = [];
  for (const g of gates) {
    const rs = Object.fromEntries(shells.map((s) => [s, read(`res/w-${t}-${s}`, g.id)]));
    const same = shells.every((s) => JSON.stringify(rs[s]) === JSON.stringify(rs.pwsh7));
    if (!same) { problems++; L.push(`  ${g.id} SHELL-DIFF ${shells.map((s) => s + ": " + fmt(rs[s])).join(" | ")}`); }
    const r = rs.bash;
    let note = "";
    if (stated[g.id]) { const ok = stated[g.id](r, t); note = ok ? "post-edit-stated" : "NOT post-edit-stated"; if (!ok) fails.push(g.id); }
    if (t === "base" && baseStated[g.id]) { const ok = baseStated[g.id](r); note += ok ? "; dry-run-base-match" : "; DRY-RUN-BASE-MISMATCH"; if (!ok) problems++; }
    L.push(`  ${g.id} ${fmt(r)} shells-identical=${same} ${note}  [${g.cmd}]`);
  }
  if (t === "prescribed") { const ok = fails.length === 0; L.push(`  VERDICT prescribed: ${ok ? "every gate prints its stated line" : "MISMATCH: " + fails.join(",")}`); if (!ok) problems++; }
  else if (t === "base") L.push(`  VERDICT base: post-edit gates not met (${fails.join(",")}), as expected before the edits`);
  else { const ok = fails.length > 0; L.push(`  VERDICT ${t}: ${ok ? "fails " + fails.join(",") : "NOT CAUGHT (every gate prints its stated line)"}`); if (!ok) problems++; }
}
L.push(`SUMMARY wiring: ${trees.length} trees x ${gates.length} gates x ${shells.length} shells; problems=${problems}`);
fs.writeFileSync("out/wiring.result.txt", L.join("\n") + "\n");
console.log(L.join("\n"));
const dump = [];
for (const t of trees) for (const s of shells) for (const g of gates) { const r = read(`res/w-${t}-${s}`, g.id); dump.push(`${t} ${s} ${g.id} exit=${r.exit} stderr=${r.err ? JSON.stringify(r.err) : "empty"} stdout=${JSON.stringify(r.out)}`); }
fs.writeFileSync("out/wiring.raw-by-shell.txt", dump.join("\n") + "\n");
