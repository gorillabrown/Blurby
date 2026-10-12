// Build the gate lists from the extracted inventory (out/commands.json), keyed by inventory id so every command is the spec's own text.
const fs = require("fs");
const { rows } = JSON.parse(fs.readFileSync("out/commands.json", "utf8"));
const by = Object.fromEntries(rows.map((r) => [r.id, r]));
const pick = (id, raw) => { const r = by[id]; if (!r) throw new Error(`inventory id ${id} missing`); if (raw && !r.raw.startsWith(raw)) throw new Error(`inventory id ${id} is not ${raw}: ${r.raw}`); return r; };
const w = (f, g) => fs.writeFileSync(`out/${f}`, JSON.stringify(g, null, 2) + "\n");
// Step 4 positive controls (stated counts on b4335606: 35, 9, 11, 51, 68, 9, 18, 12), then informational Done-when checks.
const pc = [[7, "git ls-files src/reader", "DW1 ls-files", 35], [12, "git grep -n -P '\\x22tts", "DW5 grep", 9], [23, "git grep -n -P 'scheduleBackground", "DW8 grep", 11],
  [25, "git grep -n -P 'kokoro|", "DW9a grep", 51], [26, "git grep -n -P 'kokoroPreload", "DW9b grep", 68], [28, "git ls-files -- 'main/*moss*'", "DW10 ls-files", 9],
  [29, "git grep -n -P 'ipcMain", "DW10 grep", 18], [31, "git grep -n -P 'quality-gate", "DW11 grep", 12],
  [24, "git diff --name-only refs/remotes/origin/main -- main/tts-cache.js", "DW8 diff (info)", null], [30, "node -e", "DW10 node (info)", null],
  [33, "git diff --exit-code", "DW12 baselines diff (info)", null], [34, "git diff --name-only refs/remotes/origin/main -- src/reader/modes/page", "DW12 page/focus/flow diff (info)", null]];
w("positive-controls.gates.json", pc.map(([id, raw, label, expectLines]) => ({ id: "c" + String(id).padStart(3, "0"), line: pick(id, raw).line, label, expectLines, cmd: by[id].substituted })));
// Done-when 7 wiring gates (inventory 16-22), plus two informational controls without -w.
const wiring = [[16, "git grep -cwF 'applyCloudSettings(ctx, settingsResult"], [17, "git grep -cwF 'applyCloudSettings(ctx, cloudSettings"], [18, "git grep -cF 'Object.assign(settings'"],
  [19, "git grep -cF 'ctx.saveSettings()'"], [20, "git grep -n -A1 -F 'settings = loadSettingsData"], [21, "git grep -n -F 'function saveSettingsFn()"], [22, "git grep -n -B1 -F 'normalizeReaderModes(settings);'"]]
  .map(([id, raw], i) => ({ id: "g" + (i + 1), line: pick(id, raw).line, label: "DW7 wiring " + (i + 1), cmd: by[id].substituted }));
wiring.push({ id: "x1", line: by[16].line, label: "control without -w (info)", cmd: by[16].substituted.replace("-cwF", "-cF") });
wiring.push({ id: "x2", line: by[17].line, label: "control without -w (info)", cmd: by[17].substituted.replace("-cwF", "-cF") });
w("wiring.gates.json", wiring);
// Constants-family statements (Edit sites, src/constants.ts paragraph).
w("constants-family.gates.json", [
  { id: "k1", line: pick(48, "git grep -n -w '<NAME>'").line, label: "literal family name matches nothing (stated exit 1)", cmd: by[48].raw.replace("<NAME>", "NARRATE_SPEED_*") },
  { id: "k2", line: pick(49, "git grep -h -o -w -P").line, label: "family expansion (stated: exit 0 or 1 is a result)", cmd: by[49].substituted },
  { id: "k3", line: by[49].line, label: "ReaderSpeedDialog.tsx imports two names (stated :8-9)", cmd: by[49].substituted.replace("-h -o -w -P", "-n -w -P").replace("src/constants.ts", "src/components/ReaderSpeedDialog.tsx") }]);
// Control: the earlier one-line forms of g5 and g7 (before the spec adopted -A1/-B1) print one line whether or not the adjacency holds.
w("adjacency.gates.json", [
  { id: "a1", line: by[20].line, label: "control: g5 without -A1 (the earlier one-line form)", cmd: by[20].substituted.replace(" -A1", "") },
  { id: "a2", line: by[22].line, label: "control: g7 without -B1 (the earlier one-line form)", cmd: by[22].substituted.replace(" -B1", "") }]);
// Gate-rule exit semantics (Done-when header): no-match, empty listing, bad pattern and bad ref, per shell.
w("gate-rule.gates.json", [
  { id: "r1", line: 221, label: "git grep no match (rule: exit 1, empty)", cmd: "git grep -n -P 'zzz_no_such_token_zzz' -- main.js" },
  { id: "r2", line: 221, label: "git grep bad pattern (rule: other exit = fail)", cmd: "git grep -n -P '(' -- main.js" },
  { id: "r3", line: 221, label: "git ls-files nothing listed (rule: exit 0, empty)", cmd: "git ls-files -- no/such/path" },
  { id: "r4", line: 221, label: "git diff --name-only nothing listed (rule: exit 0, empty)", cmd: "git diff --name-only refs/remotes/origin/main -- no/such/path" },
  { id: "r5", line: 221, label: "git diff --name-only bad ref (rule: other exit = fail)", cmd: "git diff --name-only refs/remotes/origin/no-such-ref -- main.js" }]);
console.log("gate lists written");
