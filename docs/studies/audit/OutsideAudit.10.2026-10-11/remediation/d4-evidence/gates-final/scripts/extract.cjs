// Extract every inline-code command from the NARRATE-REMOVE-1 section of a ROADMAP snapshot.
// usage: node extract.cjs <ROADMAP.md> <outDir>
const fs = require("fs");
const path = require("path");
const [file, out] = process.argv.slice(2);
const lines = fs.readFileSync(file, "utf8").split("\n");
const start = lines.findIndex((l) => l === '<a id="narrate-remove-1"></a>');
const end = lines.findIndex((l) => l === '<a id="narrate-rebuild-1"></a>');
if (start < 0 || end < start) throw new Error("section anchors not found");
// Zone boundaries come from the section's own markers (1-based line of each marker).
const mark = (prefix) => { const i = lines.findIndex((l, j) => j > start && j < end && l.startsWith(prefix)); if (i < 0) throw new Error("marker not found: " + prefix); return i + 1; };
const [dw, eff, impl, stg, fh, rec, tl] = ["- **Done when:**", "- **Effort:**", "##### Implementation detail", "- **Staging plan:**",
  "- **Failure handling:**", "##### Repository reconciliation", "##### Task list"].map(mark);
const zone = (n) =>
  n < dw ? "header" : n < eff ? "done-when" : n < impl ? "design" : n < stg ? "edit-sites" :
  n < fh ? "staging-integration" : n < rec ? "failure-lane" : n < tl ? "recipe" : "lessons";
const SHA = "0123456789abcdef0123456789abcdef01234567";
const subs = [
  [/<the family with each \* written as \\w\+>/g, "NARRATE_SPEED_\\w+"],
  [/<NAME>/g, "NARRATE_SPEED_MIN_HUNDREDTHS"],
  [/<(base sha|base|C1 sha|C5 sha|merge sha|current C4 sha|sha)>/g, SHA],
  [/<path>/g, "src/x.ts"],
  [/<file>/g, "closure-check.mjs"],
  [/<subject>/g, "Merge eb/narrate-remove-1: NARRATE-REMOVE-1 (Narrate removed, Kokoro dormant)"],
];
const isCmd = (s) => /^(git|npm|node|pwsh|powershell)\s/.test(s) || /^& /.test(s);
const rows = [];
let fenced = false;
for (let i = start; i < end; i++) {
  const n = i + 1;
  if (/^\s*```/.test(lines[i])) { fenced = !fenced; continue; }
  if (fenced) continue;
  for (const m of lines[i].matchAll(/`([^`]+)`/g)) {
    const raw = m[1];
    if (!isCmd(raw)) continue;
    let sub = raw;
    for (const [re, v] of subs) sub = sub.replace(re, v);
    const reference = /…/.test(raw); // prose reference with an ellipsis, not a runnable command
    rows.push({ id: rows.length + 1, line: n, zone: zone(n), reference, placeholder: sub !== raw, raw, substituted: sub });
  }
}
const left = rows.filter((r) => /<[^>]+>/.test(r.substituted));
if (left.length) throw new Error("unsubstituted placeholders: " + JSON.stringify(left.map((r) => r.raw)));
fs.writeFileSync(path.join(out, "commands.json"), JSON.stringify({ section: [start + 1, end], count: rows.length, rows }, null, 2) + "\n");
fs.writeFileSync(path.join(out, "commands.substituted.txt"), rows.map((r) => r.substituted).join("\n") + "\n");
fs.writeFileSync(path.join(out, "commands.tsv"), "id\tline\tzone\treference\tplaceholder\traw\n" +
  rows.map((r) => [r.id, r.line, r.zone, r.reference, r.placeholder, r.raw].join("\t")).join("\n") + "\n");
console.log(`section lines ${start + 1}-${end}; ${rows.length} command spans; ${rows.filter((r) => r.placeholder).length} with placeholders; ${rows.filter((r) => r.reference).length} prose references`);
